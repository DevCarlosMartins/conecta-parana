import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../src/config/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { hash } from 'bcryptjs';

describe('notificacao (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenUsuario: string;
  let tokenOutroUsuario: string;
  let tokenAdmin: string;
  let usuarioId: number;

  const ADMIN_EMAIL = 'admin.notif.e2e@teste.com';
  const USUARIO_EMAIL = 'usuario.notif.e2e@teste.com';
  const OUTRO_USUARIO_EMAIL = 'outro.notif.e2e@teste.com';
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
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'ADMIN',
      },
    });

    const usuario = await prisma.client.user.create({
      data: {
        name: 'Usuario',
        email: USUARIO_EMAIL,
        password: hashed,
        role: 'USUARIO',
      },
    });
    usuarioId = usuario.id;

    await prisma.client.user.create({
      data: {
        name: 'outro',
        email: OUTRO_USUARIO_EMAIL,
        password: hashed,
        role: 'USUARIO',
      },
    });

    tokenAdmin = await login(ADMIN_EMAIL);
    tokenUsuario = await login(USUARIO_EMAIL);
    tokenOutroUsuario = await login(OUTRO_USUARIO_EMAIL);
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
    await prisma.client.notification.deleteMany({
      where: {
        user: { email: { in: [USUARIO_EMAIL, OUTRO_USUARIO_EMAIL] } },
      },
    });
    await prisma.client.refreshToken.deleteMany({
      where: {
        user: {
          email: { in: [ADMIN_EMAIL, USUARIO_EMAIL, OUTRO_USUARIO_EMAIL] },
        },
      },
    });
    await prisma.client.user.deleteMany({
      where: {
        email: { in: [ADMIN_EMAIL, USUARIO_EMAIL, OUTRO_USUARIO_EMAIL] },
      },
    });
  }

  it('POST / notifications - Admin cria Notificação', async () => {
    const res = await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        title: 'Titulo da notificação',
        description: 'Descrição minima da notificação',
      })
      .expect(201);
    expect((res.body as { count: number }).count).toBeGreaterThanOrEqual(2);
  });

  it('POST /notification - sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/notifications')
      .send({ title: 'x', description: 'a' })
      .expect(401);
  });
  it('POST /notification - usuário comum retorna 403', async () => {
    await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ title: 'x', description: 'y' })
      .expect(403);
  });

  it('POST /notification - body inválido retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ title: 'a', description: 'curta' })
      .expect(400);
  });

  it('GET /notifications - retorna lista do usuário autenticado', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /notifications - sem token retorna 401', async () => {
    await request(app.getHttpServer()).get('/notifications').expect(401);
  });

  it('GET /notifications/unread-count - mostra as notificações não lidas', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications/unread-count')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(200);

    expect(res.text).toMatch(/^\d+$/);
  });

  it('GET /notifications/unread-count - sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .get('/notifications/unread-count')
      .expect(401);
  });

  it('PATCH /notifications/:id - admin atualiza notifications ', async () => {
    const notificacao = await prisma.client.notification.create({
      data: {
        title: 'Titulo',
        description: 'Descrição minima',
        userId: usuarioId,
      },
    });

    await request(app.getHttpServer())
      .patch(`/notifications/${notificacao.id}/read`)
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(200);
  });

  it('PATCH /notifications/:id - sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .patch('/notifications/1/read')
      .expect(401);
  });

  it('PATCH /notifications/:id - usuario sem acesso', async () => {
    const notificacao = await prisma.client.notification.create({
      data: {
        title: 'Titulo',
        description: 'Descrição minima',
        userId: usuarioId,
      },
    });

    await request(app.getHttpServer())
      .patch(`/notifications/${notificacao.id}/read`)
      .set('Authorization', `Bearer ${tokenOutroUsuario}`)
      .expect(403);
  });

  it('DELETE /notifications/:id - usuario exclui notificacaoes ja lidas', async () => {
    const notificacao = await prisma.client.notification.create({
      data: {
        title: 'toDelete',
        description: 'Delete this one',
        userId: usuarioId,
      },
    });

    await request(app.getHttpServer())
      .delete(`/notifications/${notificacao.id}`)
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(200);
  });

  it('DELETE /notifications/:id - notificacao nao encontrada', async () => {
    await request(app.getHttpServer()).delete('/notifications/1').expect(401);
  });

  it('DELETE /notifications/:id - Usuarios sem permissao', async () => {
    const notificacao = await prisma.client.notification.create({
      data: {
        title: 'KeepMe',
        description: 'Stay with me',
        userId: usuarioId,
      },
    });

    await request(app.getHttpServer())
      .delete(`/notifications/${notificacao.id}`)
      .set('Authorization', `Bearer ${tokenOutroUsuario}`)
      .expect(403);
  });
});
