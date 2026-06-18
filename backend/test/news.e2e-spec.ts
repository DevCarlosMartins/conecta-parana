import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../src/config/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('News (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let city1Id: number;
  let tokenAdmin1: string;
  let tokenAdmin2: string;
  let tokenUsuario: string;

  const ADMIN1_EMAIL = 'admin.city1.e2e@teste.com';
  const ADMIN2_EMAIL = 'admin.city2.e2e@teste.com';
  const USUARIO_EMAIL = 'usuario.e2e@teste.com';
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

    const city1 = await prisma.client.city.create({
      data: { name: 'CidadeE2E_1', state: 'PR' },
    });
    const city2 = await prisma.client.city.create({
      data: { name: 'CidadeE2E_2', state: 'PR' },
    });
    city1Id = city1.id;

    const hashed = await hash(PASSWORD, 10);
    await prisma.client.user.create({
      data: {
        name: 'Admin1',
        email: ADMIN1_EMAIL,
        password: hashed,
        role: 'ADMIN',
        cityId: city1.id,
      },
    });
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
    await prisma.client.news.deleteMany({
      where: { city: { name: { in: ['CidadeE2E_1', 'CidadeE2E_2'] } } },
    });
    await prisma.client.refreshToken.deleteMany({
      where: {
        user: { email: { in: [ADMIN1_EMAIL, ADMIN2_EMAIL, USUARIO_EMAIL] } },
      },
    });
    await prisma.client.user.deleteMany({
      where: { email: { in: [ADMIN1_EMAIL, ADMIN2_EMAIL, USUARIO_EMAIL] } },
    });
    await prisma.client.city.deleteMany({
      where: { name: { in: ['CidadeE2E_1', 'CidadeE2E_2'] } },
    });
  }

  it('POST /news — admin cria notícia da própria cidade', async () => {
    const res = await request(app.getHttpServer())
      .post('/news')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({
        title: 'Título da notícia',
        description: 'Descrição mínima de teste',
        type: 'evento',
        linkType: 'interno',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'Título da notícia',
      cityId: city1Id,
    });
  });

  it('POST /news — sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/news')
      .send({ title: 'X', description: 'Y', type: 'a', linkType: 'b' })
      .expect(401);
  });

  it('POST /news — usuário comum retorna 403', async () => {
    await request(app.getHttpServer())
      .post('/news')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ title: 'X', description: 'Y', type: 'a', linkType: 'b' })
      .expect(403);
  });

  it('POST /news — body inválido retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/news')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ title: 'a', description: 'curta', type: 'x', linkType: 'y' })
      .expect(400);
  });

  it('GET /news — lista pública sem token', async () => {
    const res = await request(app.getHttpServer()).get('/news').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /news?cityId=X — filtra por cidade', async () => {
    const res = await request(app.getHttpServer())
      .get(`/news?cityId=${city1Id}`)
      .expect(200);
    const items = res.body as { cityId: number }[];
    expect(items.every((n) => n.cityId === city1Id)).toBe(true);
  });

  it('GET /news/:id — retorna detalhe', async () => {
    const created = await prisma.client.news.create({
      data: {
        title: 'Detail',
        description: 'Test detail',
        type: 'a',
        linkType: 'b',
        isActive: true,
        cityId: city1Id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/news/${created.id}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: created.id, title: 'Detail' });
  });

  it('GET /news/:id — id inexistente retorna 404', async () => {
    await request(app.getHttpServer()).get('/news/999999').expect(404);
  });

  it('PUT /news/:id — admin da mesma cidade atualiza', async () => {
    const news = await prisma.client.news.create({
      data: {
        title: 'Old',
        description: 'Old desc',
        type: 'a',
        linkType: 'b',
        isActive: true,
        cityId: city1Id,
      },
    });

    await request(app.getHttpServer())
      .put(`/news/${news.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({ title: 'New' })
      .expect(200);
  });

  it('PUT /news/:id — admin de outra cidade retorna 403', async () => {
    const news = await prisma.client.news.create({
      data: {
        title: 'X',
        description: 'Y descrição',
        type: 'a',
        linkType: 'b',
        isActive: true,
        cityId: city1Id,
      },
    });

    await request(app.getHttpServer())
      .put(`/news/${news.id}`)
      .set('Authorization', `Bearer ${tokenAdmin2}`)
      .send({ title: 'tentativa' })
      .expect(403);
  });

  it('DELETE /news/:id — admin da mesma cidade deleta', async () => {
    const news = await prisma.client.news.create({
      data: {
        title: 'ToDelete',
        description: 'Delete this one',
        type: 'a',
        linkType: 'b',
        isActive: true,
        cityId: city1Id,
      },
    });

    await request(app.getHttpServer())
      .delete(`/news/${news.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(200);
  });

  it('DELETE /news/:id — admin de outra cidade retorna 403', async () => {
    const news = await prisma.client.news.create({
      data: {
        title: 'KeepMe',
        description: 'Stays alive',
        type: 'a',
        linkType: 'b',
        isActive: true,
        cityId: city1Id,
      },
    });

    await request(app.getHttpServer())
      .delete(`/news/${news.id}`)
      .set('Authorization', `Bearer ${tokenAdmin2}`)
      .expect(403);
  });
});
