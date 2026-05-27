import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('Cities (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: Server;
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;

  const password = 'senha123';
  const adminEmail = 'admin.cities.e2e@teste.com';
  const userEmail = 'user.cities.e2e@teste.com';
  const linkedUserEmail = 'linked.user.cities.e2e@teste.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    httpServer = app.getHttpServer() as Server;
    prisma = app.get<PrismaService>(PrismaService);

    await cleanup();

    const baseCity = await createCity('Cidade Cities E2E Base');
    const hashedPassword = await hash(password, 10);

    const admin = await prisma.client.user.create({
      data: {
        name: 'Admin Cities E2E',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        cityId: baseCity.id,
      },
    });

    adminUserId = admin.id;

    await prisma.client.user.create({
      data: {
        name: 'User Cities E2E',
        email: userEmail,
        password: hashedPassword,
        role: Role.USUARIO,
        cityId: baseCity.id,
      },
    });

    adminToken = await login(adminEmail);
    userToken = await login(userEmail);
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function login(email: string): Promise<string> {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return (response.body as { access_token: string }).access_token;
  }

  function createCity(name: string) {
    return prisma.client.city.create({
      data: {
        name,
        state: 'PR',
      },
    });
  }

  function postCity(body: Record<string, unknown>, token = adminToken) {
    return request(httpServer)
      .post('/cities')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  function putCity(
    id: number,
    body: Record<string, unknown>,
    token = adminToken,
  ) {
    return request(httpServer)
      .put(`/cities/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  function deleteCity(id: number, token = adminToken) {
    return request(httpServer)
      .delete(`/cities/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  async function cleanup(): Promise<void> {
    await prisma.client.event.deleteMany({
      where: {
        city: {
          name: {
            startsWith: 'Cidade Cities E2E',
          },
        },
      },
    });

    await prisma.client.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            in: [adminEmail, userEmail, linkedUserEmail],
          },
        },
      },
    });

    await prisma.client.user.deleteMany({
      where: {
        email: {
          in: [adminEmail, userEmail, linkedUserEmail],
        },
      },
    });

    await prisma.client.city.deleteMany({
      where: {
        name: {
          startsWith: 'Cidade Cities E2E',
        },
      },
    });
  }

  it('GET /cities — deve listar cidades publicamente em ordem alfabética', async () => {
    await createCity('Cidade Cities E2E B');
    await createCity('Cidade Cities E2E A');

    const response = await request(httpServer).get('/cities').expect(200);

    const names = (response.body as { name: string }[])
      .filter((city) => city.name.startsWith('Cidade Cities E2E'))
      .map((city) => city.name);

    expect(names).toEqual([
      'Cidade Cities E2E A',
      'Cidade Cities E2E B',
      'Cidade Cities E2E Base',
    ]);
  });

  it('GET /cities/:id — deve buscar cidade por id publicamente', async () => {
    const city = await createCity('Cidade Cities E2E Detalhe');

    const response = await request(httpServer)
      .get(`/cities/${city.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: city.id,
      name: city.name,
      state: city.state,
    });
  });

  it('GET /cities/:id — deve retornar 404 para cidade inexistente', async () => {
    await request(httpServer).get('/cities/999999').expect(404);
  });

  it('POST /cities — deve criar cidade sendo ADMIN', async () => {
    const response = await postCity({
      name: 'Cidade Cities E2E Create',
      state: 'pr',
    }).expect(201);

    expect(response.body).toMatchObject({
      name: 'Cidade Cities E2E Create',
      state: 'PR',
    });
  });

  it('POST /cities — deve validar autenticação, permissão, body e duplicidade', async () => {
    await request(httpServer)
      .post('/cities')
      .send({ name: 'Cidade Cities E2E Sem Token', state: 'PR' })
      .expect(401);

    await postCity(
      { name: 'Cidade Cities E2E Usuario', state: 'PR' },
      userToken,
    ).expect(403);

    await postCity({ name: 'A', state: 'PARANA' }).expect(400);

    await postCity({
      name: 'Cidade Cities E2E Duplicada',
      state: 'PR',
    }).expect(201);

    await postCity({
      name: 'Cidade Cities E2E Duplicada',
      state: 'PR',
    }).expect(409);
  });

  it('PUT /cities/:id — deve atualizar cidade sendo ADMIN', async () => {
    const city = await createCity('Cidade Cities E2E Antiga');

    const response = await putCity(city.id, {
      name: 'Cidade Cities E2E Nova',
    }).expect(200);

    expect(response.body).toMatchObject({
      id: city.id,
      name: 'Cidade Cities E2E Nova',
      state: 'PR',
    });
  });

  it('PUT /cities/:id — deve validar autenticação, permissão e cidade inexistente', async () => {
    const city = await createCity('Cidade Cities E2E Put');

    await request(httpServer)
      .put(`/cities/${city.id}`)
      .send({ name: 'Cidade Editada' })
      .expect(401);

    await putCity(city.id, { name: 'Cidade Editada' }, userToken).expect(403);

    await putCity(999999, { name: 'Cidade Inexistente' }).expect(404);
  });

  it('DELETE /cities/:id — deve deletar cidade sem vínculos sendo ADMIN', async () => {
    const city = await createCity('Cidade Cities E2E Delete');

    await deleteCity(city.id).expect(200);
  });

  it('DELETE /cities/:id — deve validar autenticação, permissão e cidade inexistente', async () => {
    const city = await createCity('Cidade Cities E2E Delete Auth');

    await request(httpServer).delete(`/cities/${city.id}`).expect(401);

    await deleteCity(city.id, userToken).expect(403);

    await deleteCity(999999).expect(404);
  });

  it('DELETE /cities/:id — deve retornar 409 se cidade tiver usuário vinculado', async () => {
    const city = await createCity('Cidade Cities E2E User Conflict');

    await prisma.client.user.create({
      data: {
        name: 'Linked User Cities E2E',
        email: linkedUserEmail,
        password: await hash(password, 10),
        role: Role.USUARIO,
        cityId: city.id,
      },
    });

    await deleteCity(city.id).expect(409);
  });

  it('DELETE /cities/:id — deve retornar 409 se cidade tiver evento vinculado', async () => {
    const city = await createCity('Cidade Cities E2E Event Conflict');

    await prisma.client.event.create({
      data: {
        title: 'Evento Cities E2E',
        description: 'Evento para testar conflito ao deletar cidade',
        type: 'evento',
        status: 'ativo',
        eventDate: new Date(),
        cityId: city.id,
        userId: adminUserId,
      },
    });

    await deleteCity(city.id).expect(409);
  });
});
