import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../src/config/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Locals (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let city1Id: number;
  let admin1Id: number;
  let categoryId: number;
  let tokenAdmin1: string;
  let tokenAdmin2: string;
  let tokenUsuario: string;
  let createdLocalId: number;

  const ADMIN1_EMAIL = 'admin1.locals.e2e@teste.com';
  const ADMIN2_EMAIL = 'admin2.locals.e2e@teste.com';
  const USUARIO_EMAIL = 'usuario.locals.e2e@teste.com';
  const PASSWORD = 'senha123';
  const CITY1 = 'CidadeLocalsE2E_1';
  const CITY2 = 'CidadeLocalsE2E_2';
  const CATEGORY = 'CategoriaLocalsE2E';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await cleanup();

    const city1 = await prisma.client.city.create({
      data: { name: CITY1, state: 'PR' },
    });
    const city2 = await prisma.client.city.create({
      data: { name: CITY2, state: 'PR' },
    });
    city1Id = city1.id;

    const category = await prisma.client.category.create({
      data: { name: CATEGORY, icon: 'map-pin' },
    });
    categoryId = category.id;

    const hashed = await hash(PASSWORD, 10);
    const admin1 = await prisma.client.user.create({
      data: {
        name: 'Admin1',
        email: ADMIN1_EMAIL,
        password: hashed,
        role: 'ADMIN',
        cityId: city1.id,
      },
    });
    admin1Id = admin1.id;
    await prisma.client.user.create({
      data: {
        name: 'Admin2',
        email: ADMIN2_EMAIL,
        password: hashed,
        role: 'ADMIN',
        cityId: city2.id,
      },
    });
    await prisma.client.user.create({
      data: {
        name: 'Usuario',
        email: USUARIO_EMAIL,
        password: hashed,
        role: 'USUARIO',
        cityId: city1.id,
      },
    });

    tokenAdmin1 = await login(ADMIN1_EMAIL);
    tokenAdmin2 = await login(ADMIN2_EMAIL);
    tokenUsuario = await login(USUARIO_EMAIL);
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function login(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: PASSWORD });
    return (res.body as { access_token: string }).access_token;
  }

  async function cleanup() {
    await prisma.client.event.deleteMany({
      where: { title: { startsWith: 'EventoLocalsE2E' } },
    });
    await prisma.client.local.deleteMany({
      where: { name: { startsWith: 'LocalE2E' } },
    });
    await prisma.client.refreshToken.deleteMany({
      where: {
        user: { email: { in: [ADMIN1_EMAIL, ADMIN2_EMAIL, USUARIO_EMAIL] } },
      },
    });
    await prisma.client.user.deleteMany({
      where: { email: { in: [ADMIN1_EMAIL, ADMIN2_EMAIL, USUARIO_EMAIL] } },
    });
    await prisma.client.category.deleteMany({ where: { name: CATEGORY } });
    await prisma.client.city.deleteMany({
      where: { name: { in: [CITY1, CITY2] } },
    });
  }

  function validBody() {
    return {
      name: 'LocalE2E Catedral',
      description: 'Descrição do local de teste',
      address: 'Praça da Catedral, s/n',
      phone: '(44) 0000-0000',
      categoryId,
    };
  }

  it('GET /locals — lista pública sem token', async () => {
    const res = await request(app.getHttpServer()).get('/locals').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /categories — lista pública sem token', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /locals — sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/locals')
      .send(validBody())
      .expect(401);
  });

  it('POST /locals — usuário comum retorna 403', async () => {
    await request(app.getHttpServer())
      .post('/locals')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send(validBody())
      .expect(403);
  });

  it('POST /locals — admin cria com cityId/userId do token e coordinates', async () => {
    const res = await request(app.getHttpServer())
      .post('/locals')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ ...validBody(), coordinates: { lat: -23.4205, lng: -51.9331 } })
      .expect(201);

    const body = res.body as {
      id: number;
      cityId: number;
      userId: number;
      coordinates: { lat: number; lng: number } | null;
    };
    expect(body).toHaveProperty('id');
    expect(body.cityId).toBe(city1Id);
    expect(body.userId).toBe(admin1Id);
    expect(body.coordinates).toEqual({ lat: -23.4205, lng: -51.9331 });
    createdLocalId = body.id;
  });

  it('POST /locals — categoria inexistente retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/locals')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ ...validBody(), categoryId: 99999999 })
      .expect(400);
  });

  it('POST /locals — body inválido retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/locals')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ name: 'A' })
      .expect(400);
  });

  it('GET /locals?categoryId=X — filtra por categoria', async () => {
    const res = await request(app.getHttpServer())
      .get(`/locals?categoryId=${categoryId}`)
      .expect(200);
    const items = res.body as { categoryId: number }[];
    expect(items.every((l) => l.categoryId === categoryId)).toBe(true);
  });

  it('GET /locals/:id — retorna detalhe com relações e coordinates', async () => {
    const res = await request(app.getHttpServer())
      .get(`/locals/${createdLocalId}`)
      .expect(200);

    const body = res.body as {
      id: number;
      coordinates: { lat: number; lng: number } | null;
    };
    expect(body).toMatchObject({ id: createdLocalId });
    expect(body).toHaveProperty('category');
    expect(body).toHaveProperty('city');
    expect(body).toHaveProperty('photos');
    expect(body).toHaveProperty('events');
    expect(body.coordinates).toEqual({ lat: -23.4205, lng: -51.9331 });
  });

  it('GET /locals/:id — id inexistente retorna 404', async () => {
    await request(app.getHttpServer()).get('/locals/99999999').expect(404);
  });

  it('PUT /locals/:id — admin de outra cidade retorna 403', async () => {
    await request(app.getHttpServer())
      .put(`/locals/${createdLocalId}`)
      .set('Authorization', `Bearer ${tokenAdmin2}`)
      .send({ name: 'LocalE2E Hackeado' })
      .expect(403);
  });

  it('PUT /locals/:id — admin da mesma cidade atualiza', async () => {
    const res = await request(app.getHttpServer())
      .put(`/locals/${createdLocalId}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ name: 'LocalE2E Catedral (editado)' })
      .expect(200);

    const body = res.body as { name: string };
    expect(body.name).toBe('LocalE2E Catedral (editado)');
  });

  it('DELETE /locals/:id — com evento vinculado retorna 409', async () => {
    await prisma.client.$executeRaw`
      INSERT INTO events (title, description, type, status, coordinates, event_date, city_id, user_id, local_id)
      VALUES ('EventoLocalsE2E vinculado', 'evento de teste', 'show', 'ativo', 'POINT(-51.9 -23.4)',
              NOW() + INTERVAL '1 day', ${city1Id}, ${admin1Id}, ${createdLocalId})
    `;

    await request(app.getHttpServer())
      .delete(`/locals/${createdLocalId}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(409);

    await prisma.client.event.deleteMany({
      where: { title: { startsWith: 'EventoLocalsE2E' } },
    });
  });

  it('DELETE /locals/:id — sem dependências retorna 200 e depois GET 404', async () => {
    await request(app.getHttpServer())
      .delete(`/locals/${createdLocalId}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/locals/${createdLocalId}`)
      .expect(404);
  });
});
