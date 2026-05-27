import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('Events (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: Server;

  let city1Id: number;
  let city2Id: number;
  let admin1Id: number;
  let local1Id: number;

  let tokenAdmin1: string;
  let tokenAdmin2: string;
  let tokenUsuario: string;

  const admin1Email = 'admin.events.city1.e2e@teste.com';
  const admin2Email = 'admin.events.city2.e2e@teste.com';
  const usuarioEmail = 'usuario.events.e2e@teste.com';
  const password = 'senha123';

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

    const city1 = await prisma.client.city.create({
      data: {
        name: 'CidadeEventsE2E_1',
        state: 'PR',
      },
    });

    const city2 = await prisma.client.city.create({
      data: {
        name: 'CidadeEventsE2E_2',
        state: 'PR',
      },
    });

    city1Id = city1.id;
    city2Id = city2.id;

    const hashedPassword = await hash(password, 10);

    const admin1 = await prisma.client.user.create({
      data: {
        name: 'Admin Events 1',
        email: admin1Email,
        password: hashedPassword,
        role: Role.ADMIN,
        cityId: city1Id,
      },
    });

    await prisma.client.user.create({
      data: {
        name: 'Admin Events 2',
        email: admin2Email,
        password: hashedPassword,
        role: Role.ADMIN,
        cityId: city2Id,
      },
    });

    await prisma.client.user.create({
      data: {
        name: 'Usuario Events',
        email: usuarioEmail,
        password: hashedPassword,
        role: Role.USUARIO,
        cityId: city1Id,
      },
    });

    admin1Id = admin1.id;

    const category = await prisma.client.category.create({
      data: {
        name: 'CategoriaEventsE2E',
        icon: 'map-pin',
      },
    });

    const local = await prisma.client.local.create({
      data: {
        name: 'LocalEventsE2E_1',
        description: 'Local de teste para eventos',
        address: 'Rua Teste, 123',
        phone: '44999999999',
        cityId: city1Id,
        categoryId: category.id,
        userId: admin1Id,
      },
    });

    local1Id = local.id;

    tokenAdmin1 = await login(admin1Email);
    tokenAdmin2 = await login(admin2Email);
    tokenUsuario = await login(usuarioEmail);
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function login(email: string): Promise<string> {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    return (response.body as { access_token: string }).access_token;
  }

  async function cleanup(): Promise<void> {
    await prisma.client.event.deleteMany({
      where: {
        city: {
          name: {
            in: ['CidadeEventsE2E_1', 'CidadeEventsE2E_2'],
          },
        },
      },
    });

    await prisma.client.local.deleteMany({
      where: {
        name: {
          startsWith: 'LocalEventsE2E',
        },
      },
    });

    await prisma.client.category.deleteMany({
      where: {
        name: 'CategoriaEventsE2E',
      },
    });

    await prisma.client.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            in: [admin1Email, admin2Email, usuarioEmail],
          },
        },
      },
    });

    await prisma.client.user.deleteMany({
      where: {
        email: {
          in: [admin1Email, admin2Email, usuarioEmail],
        },
      },
    });

    await prisma.client.city.deleteMany({
      where: {
        name: {
          in: ['CidadeEventsE2E_1', 'CidadeEventsE2E_2'],
        },
      },
    });
  }

  function createEventBody(overrides: Record<string, unknown> = {}) {
    return {
      title: 'Evento E2E',
      description: 'Descrição completa do evento E2E',
      type: 'cultural',
      status: 'ativo',
      eventDate: '2026-06-17T19:00:00.000Z',
      ...overrides,
    };
  }

  async function createEventDirectly(
    cityId = city1Id,
    overrides: Partial<Prisma.EventUncheckedCreateInput> = {},
  ) {
    return prisma.client.event.create({
      data: {
        title: 'EventoEventsE2E_Direct',
        description: 'Evento criado diretamente no banco',
        type: 'cultural',
        status: 'ativo',
        eventDate: new Date('2026-06-17T19:00:00.000Z'),
        cityId,
        userId: admin1Id,
        ...overrides,
      },
    });
  }

  it('POST /events — admin cria evento na própria cidade', async () => {
    const response = await request(httpServer)
      .post('/events')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send(
        createEventBody({
          coordinates: {
            lat: -23.4205,
            lng: -51.9333,
          },
        }),
      )
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Evento E2E',
      cityId: city1Id,
      userId: admin1Id,
      coordinates: {
        lat: -23.4205,
        lng: -51.9333,
      },
    });
  });

  it('POST /events — sem token retorna 401', async () => {
    await request(httpServer)
      .post('/events')
      .send(createEventBody())
      .expect(401);
  });

  it('POST /events — usuário comum retorna 403', async () => {
    await request(httpServer)
      .post('/events')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send(createEventBody())
      .expect(403);
  });

  it('POST /events — body inválido retorna 400', async () => {
    await request(httpServer)
      .post('/events')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({
        title: 'A',
        description: 'curta',
        type: '',
        status: '',
        eventDate: 'data-invalida',
      })
      .expect(400);
  });

  it('GET /events — lista pública sem token', async () => {
    const response = await request(httpServer).get('/events').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /events — filtra por cityId, type, status e localId', async () => {
    await createEventDirectly(city1Id, {
      title: 'EventoEventsE2E_Filtro',
      type: 'esporte',
      status: 'ativo',
      localId: local1Id,
    });

    const byCity = await request(httpServer)
      .get(`/events?cityId=${city1Id}`)
      .expect(200);

    expect(
      (byCity.body as { cityId: number }[]).every(
        (event) => event.cityId === city1Id,
      ),
    ).toBe(true);

    const byType = await request(httpServer)
      .get('/events?type=esporte')
      .expect(200);

    expect(
      (byType.body as { type: string }[]).every(
        (event) => event.type === 'esporte',
      ),
    ).toBe(true);

    const byStatus = await request(httpServer)
      .get('/events?status=ativo')
      .expect(200);

    expect(
      (byStatus.body as { status: string }[]).every(
        (event) => event.status === 'ativo',
      ),
    ).toBe(true);

    const byLocal = await request(httpServer)
      .get(`/events?localId=${local1Id}`)
      .expect(200);

    expect(
      (byLocal.body as { localId: number }[]).every(
        (event) => event.localId === local1Id,
      ),
    ).toBe(true);
  });

  it('GET /events/:id — retorna detalhe com cidade, autor e local', async () => {
    const event = await createEventDirectly(city1Id, {
      title: 'EventoEventsE2E_Detail',
      localId: local1Id,
    });

    const response = await request(httpServer)
      .get(`/events/${event.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: event.id,
      title: 'EventoEventsE2E_Detail',
      city: {
        id: city1Id,
      },
      author: {
        id: admin1Id,
      },
      local: {
        id: local1Id,
      },
    });
  });

  it('GET /events/:id — id inexistente retorna 404', async () => {
    await request(httpServer).get('/events/999999').expect(404);
  });

  it('PUT /events/:id — admin da mesma cidade atualiza', async () => {
    const event = await createEventDirectly(city1Id, {
      title: 'EventoEventsE2E_Old',
    });

    const response = await request(httpServer)
      .put(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({
        title: 'EventoEventsE2E_New',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: event.id,
      title: 'EventoEventsE2E_New',
    });
  });

  it('PUT /events/:id — sem token retorna 401', async () => {
    const event = await createEventDirectly();

    await request(httpServer)
      .put(`/events/${event.id}`)
      .send({
        title: 'Tentativa sem token',
      })
      .expect(401);
  });

  it('PUT /events/:id — usuário comum retorna 403', async () => {
    const event = await createEventDirectly();

    await request(httpServer)
      .put(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({
        title: 'Tentativa usuário comum',
      })
      .expect(403);
  });

  it('PUT /events/:id — admin de outra cidade retorna 403', async () => {
    const event = await createEventDirectly(city1Id);

    await request(httpServer)
      .put(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenAdmin2}`)
      .send({
        title: 'Tentativa outra cidade',
      })
      .expect(403);
  });

  it('PUT /events/:id — evento inexistente retorna 404', async () => {
    await request(httpServer)
      .put('/events/999999')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .send({
        title: 'Evento inexistente',
      })
      .expect(404);
  });

  it('DELETE /events/:id — admin da mesma cidade deleta', async () => {
    const event = await createEventDirectly(city1Id);

    await request(httpServer)
      .delete(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(200);
  });

  it('DELETE /events/:id — sem token retorna 401', async () => {
    const event = await createEventDirectly();

    await request(httpServer).delete(`/events/${event.id}`).expect(401);
  });

  it('DELETE /events/:id — usuário comum retorna 403', async () => {
    const event = await createEventDirectly();

    await request(httpServer)
      .delete(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(403);
  });

  it('DELETE /events/:id — admin de outra cidade retorna 403', async () => {
    const event = await createEventDirectly(city1Id);

    await request(httpServer)
      .delete(`/events/${event.id}`)
      .set('Authorization', `Bearer ${tokenAdmin2}`)
      .expect(403);
  });

  it('DELETE /events/:id — evento inexistente retorna 404', async () => {
    await request(httpServer)
      .delete('/events/999999')
      .set('Authorization', `Bearer ${tokenAdmin1}`)
      .expect(404);
  });
});
