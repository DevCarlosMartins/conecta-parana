import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../src/config/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Comunicados (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenAdmin1: string;
  let tokenUsuario: string;

  const ADMIN1_EMAIL = 'admin.e2e@teste.com';
  const USUARIO_EMAIL = 'ususario.e2e@teste.com';
  const PASSWORD = 'senha123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await cleanup();

    const hashed = await hash(PASSWORD, 10);
    await prisma.client.user.create({
      data: {
        name: 'Admin1',
        email: ADMIN1_EMAIL,
        password: hashed,
        role: 'ADMIN',
      },
    });
    await prisma.client.user.create({
      data: {
        name: 'Admin2',
        email: USUARIO_EMAIL,
        password: hashed,
        role: 'USUARIO',
      },
    });
    tokenAdmin1 = await login(ADMIN1_EMAIL);
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
    await prisma.client.comunicado.deleteMany({
      where: { title: { contains: 'E2E' } },
    });
    await prisma.client.refreshToken.deleteMany({
      where: {
        user: { email: { in: [ADMIN1_EMAIL, USUARIO_EMAIL] } },
      },
    });
    await prisma.client.user.deleteMany({
      where: { email: { in: [ADMIN1_EMAIL, USUARIO_EMAIL] } },
    });
  }
  // --------------------- // POST /comunicado // ---------------------
  it('Post /comunicados - admin cria comunicados da cidade', async () => {
    const res = await request(app.getHttpServer())
      .post('/comunicados')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({
        title: 'Título do comunicado',
        description: 'Descrição teste',
      })
      .expect(201);
    expect(res.body).toMatchObject({
      title: 'Título do comunicado',
    });
  });
  it('POST /comunicados — sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/comunicados')
      .send({ title: 'X', description: 'Y' })
      .expect(401);
  });

  it('POST /comunicados — usuário comum retorna 403', async () => {
    await request(app.getHttpServer())
      .post('/comunicados')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ title: 'X', description: 'Y' })
      .expect(403);
  });

  it('POST /comunicados  — body inválido retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/comunicados')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ title: 'a', description: 'curta' })
      .expect(400);
  });

  // --------------------- // GET /comunicados // ---------------------
  it('GET /comunicados - lista publica sem token', async () => {
    const res = await request(app.getHttpServer())
      .get('/comunicados')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /comunicados?isActive=true- filtra por ativado ', async () => {
    const res = await request(app.getHttpServer())
      .get('/comunicados?isActive=true')
      .expect(200);
    const items = res.body as { isActive: boolean }[];
    expect(items.every((n) => n.isActive === true)).toBe(true);
  });
  it('GET /comunicados/:id - retorna detalhe', async () => {
    const created = await prisma.client.comunicado.create({
      data: {
        title: 'Detail',
        description: 'Test detail',
        isActive: true,
      },
    });
    const res = await request(app.getHttpServer())
      .get(`/comunicados/${created.id}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: created.id, title: 'Detail' });
  });
  it('GET /comunicados/:id - id inexistente retorna 404', async () => {
    await request(app.getHttpServer()).get('/comunicados/999999').expect(404);
  });

  // --------------------- // PUT /news/:id // ---------------------
  it('PUT /comunicados/:id - admin ', async () => {
    const comunicados = await prisma.client.comunicado.create({
      data: {
        title: 'Old',
        description: 'Old desc',
        isActive: true,
      },
    });

    await request(app.getHttpServer())
      .put(`/comunicados/${comunicados.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ title: 'comunicado' })
      .expect(200);
  });

  it('PUT /comunicados/:id - id não encontrado 404', async () => {
    await request(app.getHttpServer())
      .put('/comunicados/99999')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ title: 'tentativa' })
      .expect(404);
  });

  // --------------------- // DELETE /news/:id // ---------------------

  it('DELETE /comunicados/:id - admin deleta o comunicado', async () => {
    const comunicados = await prisma.client.comunicado.create({
      data: {
        title: 'toDelete',
        description: 'Delete this one',
        isActive: true,
      },
    });

    await request(app.getHttpServer())
      .delete(`/comunicados/${comunicados.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(200);
  });

  it('DELETE /comunicados/:id - id não encontrado', async () => {
    await request(app.getHttpServer()).delete('/comunicado/999999').expect(404);
  });
});
