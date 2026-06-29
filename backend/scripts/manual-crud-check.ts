import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@conecta.local';
const ADMIN_PASSWORD = 'admin123';
const USER_EMAIL = 'manual.crud.user@conecta.local';
const USER_PASSWORD = 'admin123';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type ApiResponse<T = unknown> = {
  status: number;
  body: T;
  text: string;
};

type RequestOptions = {
  token?: string;
  body?: JsonValue;
};

type TestResult = {
  name: string;
  expected: number | string;
  received: number | string;
  passed: boolean;
};

type IdRecord = {
  id: number;
  [key: string]: unknown;
};

type AuthMe = {
  id: number;
  cityId: number | null;
};

const results: TestResult[] = [];
const runId = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, '')
  .slice(0, 14);

async function main() {
  console.log(`Manual CRUD check: ${BASE_URL}`);

  const adminLogin = await expectStatus(
    'POST /auth/login admin',
    request<{ access_token?: string }>('/auth/login', {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }),
    200,
  );
  let adminToken = requireToken(adminLogin.body, 'admin');

  const city = await ensureCity(adminToken);
  adminToken = await ensureAdminCity(adminToken, city.id);
  const user = await ensureUser(city.id);
  const category = await getCategory();
  const local = await createLocal(adminToken, category.id);
  const event = await createEvent(adminToken, local.id);
  const news = await createNews(adminToken);
  const comunicado = await createComunicado(adminToken);
  const notification = await createNotification(adminToken, event.id);

  const userLogin = await expectStatus(
    'POST /auth/login usuario comum',
    request<{ access_token?: string }>('/auth/login', {
      body: { email: USER_EMAIL, password: USER_PASSWORD },
    }),
    200,
  );
  const userToken = requireToken(userLogin.body, 'usuario comum');

  await expectStatus(
    'GET /notifications',
    request('/notifications', { token: userToken }),
    200,
  );
  await expectStatus(
    'GET /notifications/unread-count',
    request('/notifications/unread-count', { token: userToken }),
    200,
  );
  await expectNotificationPersisted(notification.title, user.id, event.id);

  const notificationForUser = await findUserNotification(
    userToken,
    notification.title,
  );
  await expectStatus(
    'PATCH /notifications/:id/read',
    request(
      `/notifications/${notificationForUser.id}/read`,
      { token: userToken, body: null },
      'PATCH',
    ),
    200,
  );
  await expectDb(
    'DB notification marcada como lida',
    async () =>
      Boolean(
        await prisma.notification.findFirst({
          where: { id: notificationForUser.id, userId: user.id, isRead: true },
        }),
      ),
  );

  await expectStatus(
    'DELETE /notifications/:id',
    request(`/notifications/${notificationForUser.id}`, { token: userToken }, 'DELETE'),
    200,
  );
  await expectDb(
    'DB notification deletada',
    async () =>
      (await prisma.notification.count({
        where: { id: notificationForUser.id },
      })) === 0,
  );

  await expectDb(
    'DB news ainda persistida',
    async () =>
      Boolean(
        await prisma.news.findFirst({
          where: { id: news.id, title: String(news.title), isActive: true },
        }),
      ),
  );
  await expectDb(
    'DB comunicado ainda persistido',
    async () =>
      Boolean(
        await prisma.comunicado.findFirst({
          where: {
            id: comunicado.id,
            title: String(comunicado.title),
            isActive: true,
          },
        }),
      ),
  );

  printSummary();
}

async function ensureCity(adminToken: string): Promise<IdRecord> {
  await expectStatus('GET /cities', request('/cities'), 200);

  const cityName = `Manual CRUD ${runId}`;
  const created = await expectStatus<IdRecord>(
    'POST /cities',
    request('/cities', {
      token: adminToken,
      body: { name: cityName, state: 'PR' },
    }),
    201,
  );

  await expectStatus(
    'POST /cities duplicada',
    request('/cities', {
      token: adminToken,
      body: { name: cityName, state: 'PR' },
    }),
    409,
  );
  await expectDb(
    'DB city persistida',
    async () =>
      (await prisma.city.count({
        where: { name: cityName, state: 'PR' },
      })) === 1,
  );

  return created.body;
}

async function ensureAdminCity(
  adminToken: string,
  cityId: number,
): Promise<string> {
  const me = await request<AuthMe>('/auth/me', { token: adminToken });

  if (me.status !== 200) {
    throw new Error(
      `Nao foi possivel consultar /auth/me do admin: status ${me.status}`,
    );
  }

  if (me.body.cityId !== cityId) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { cityId },
    });
  }

  await expectDb(
    'DB admin vinculado a cidade',
    async () =>
      Boolean(
        await prisma.user.findFirst({
          where: { email: ADMIN_EMAIL, cityId },
        }),
      ),
  );

  if (me.body.cityId === cityId) {
    return adminToken;
  }

  const refreshedLogin = await expectStatus(
    'POST /auth/login admin com cidade',
    request<{ access_token?: string }>('/auth/login', {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }),
    200,
  );

  return requireToken(refreshedLogin.body, 'admin com cidade');
}

async function ensureUser(cityId: number): Promise<IdRecord> {
  const response = await request('/auth/register', {
    body: {
      name: 'Usuario Manual CRUD',
      email: USER_EMAIL,
      password: USER_PASSWORD,
      cityId,
    },
  });

  if (response.status !== 201 && response.status !== 409) {
    logResult('POST /auth/register usuario comum', 201, response.status, false);
    throw new Error(`Falha ao garantir usuario comum: status ${response.status}`);
  }

  logResult('POST /auth/register usuario comum', 201, response.status, true);

  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
    select: { id: true, email: true, cityId: true, role: true },
  });

  if (user && user.cityId !== cityId) {
    await prisma.user.update({
      where: { email: USER_EMAIL },
      data: { cityId },
    });
  }

  await expectDb(
    'DB usuario comum garantido',
    async () =>
      Boolean(
        await prisma.user.findFirst({
          where: { email: USER_EMAIL, cityId, role: 'USUARIO' },
        }),
      ),
  );

  const ensuredUser = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
    select: { id: true, email: true, cityId: true, role: true },
  });

  if (!ensuredUser) {
    throw new Error('Usuario comum nao encontrado no banco.');
  }

  return ensuredUser;
}

async function getCategory(): Promise<IdRecord> {
  const categories = await expectStatus<IdRecord[]>(
    'GET /categories',
    request('/categories'),
    200,
  );

  if (Array.isArray(categories.body) && categories.body.length > 0) {
    const category = categories.body[0];
    await expectDb(
      'DB category disponivel',
      async () =>
        Boolean(
          await prisma.category.findUnique({
            where: { id: category.id },
          }),
        ),
    );
    return category;
  }

  const category = await prisma.category.create({
    data: {
      name: `Categoria Manual CRUD ${runId}`,
      icon: 'map-pin',
    },
  });
  await expectDb(
    'DB category criada para teste',
    async () =>
      Boolean(
        await prisma.category.findUnique({
          where: { id: category.id },
        }),
      ),
  );
  return category;
}

async function createLocal(
  adminToken: string,
  categoryId: number,
): Promise<IdRecord> {
  const local = await expectStatus<IdRecord>(
    'POST /locals',
    request('/locals', {
      token: adminToken,
      body: {
        name: `Local Manual CRUD ${runId}`,
        description: 'Local criado pelo check manual de CRUD',
        address: 'Rua Manual, 123',
        phone: '(41) 99999-0000',
        categoryId,
        coordinates: { lat: -25.4284, lng: -49.2733 },
      },
    }),
    201,
  );

  await expectDb(
    'DB local persistido',
    async () =>
      Boolean(
        await prisma.local.findFirst({
          where: {
            id: local.body.id,
            categoryId,
            name: String(local.body.name),
          },
        }),
      ),
  );
  await expectStatus('GET /locals', request('/locals'), 200);
  await expectStatus('GET /locals?cityId=-1', request('/locals?cityId=-1'), 400);

  return local.body;
}

async function createEvent(
  adminToken: string,
  localId: number,
): Promise<IdRecord> {
  const event = await expectStatus<IdRecord>(
    'POST /events',
    request('/events', {
      token: adminToken,
      body: {
        title: `Evento Manual CRUD ${runId}`,
        description: 'Evento criado pelo check manual de CRUD',
        type: 'manual',
        status: 'ativo',
        eventDate: '2026-12-31T19:00:00.000Z',
        localId,
        coordinates: { lat: -25.4284, lng: -49.2733 },
      },
    }),
    201,
  );

  await expectStatus('GET /events', request('/events'), 200);

  const invalidTitle = `Evento Local Inexistente ${runId}`;
  await expectStatus(
    'POST /events localId inexistente',
    request('/events', {
      token: adminToken,
      body: {
        title: invalidTitle,
        description: 'Evento invalido criado pelo check manual de CRUD',
        type: 'manual',
        status: 'ativo',
        eventDate: '2026-12-31T20:00:00.000Z',
        localId: 999999,
      },
    }),
    404,
  );
  await expectDb(
    'DB event persistido',
    async () =>
      Boolean(
        await prisma.event.findFirst({
          where: {
            id: event.body.id,
            localId,
            title: String(event.body.title),
          },
        }),
      ),
  );
  await expectDb(
    'DB event invalido nao persistido',
    async () =>
      (await prisma.event.count({
        where: { title: invalidTitle },
      })) === 0,
  );

  return event.body;
}

async function createNews(adminToken: string): Promise<IdRecord> {
  const news = await expectStatus<IdRecord>(
    'POST /news',
    request('/news', {
      token: adminToken,
      body: {
        title: `Noticia Manual CRUD ${runId}`,
        description: 'Noticia criada pelo check manual de CRUD',
        type: 'manual',
        linkType: 'interno',
        isActive: true,
      },
    }),
    201,
  );

  await expectDb(
    'DB news criada',
    async () =>
      Boolean(
        await prisma.news.findFirst({
          where: {
            id: news.body.id,
            title: String(news.body.title),
            type: 'manual',
            linkType: 'interno',
            isActive: true,
          },
        }),
      ),
  );
  await expectStatus('GET /news', request('/news'), 200);
  await expectStatus('GET /news?isActive=banana', request('/news?isActive=banana'), 400);

  return news.body;
}

async function createComunicado(adminToken: string): Promise<IdRecord> {
  const comunicado = await expectStatus<IdRecord>(
    'POST /comunicados',
    request('/comunicados', {
      token: adminToken,
      body: {
        title: `Comunicado Manual CRUD ${runId}`,
        description: 'Comunicado criado pelo check manual de CRUD',
        isActive: true,
      },
    }),
    201,
  );

  await expectDb(
    'DB comunicado criado',
    async () =>
      Boolean(
        await prisma.comunicado.findFirst({
          where: {
            id: comunicado.body.id,
            title: String(comunicado.body.title),
            isActive: true,
          },
        }),
      ),
  );
  await expectStatus('GET /comunicados', request('/comunicados'), 200);
  await expectStatus('GET /comunicados/999999', request('/comunicados/999999'), 404);

  return comunicado.body;
}

async function createNotification(
  adminToken: string,
  eventId: number,
): Promise<{ title: string }> {
  const title = `Notificacao Manual CRUD ${runId}`;
  const invalidTitle = `Notificacao Invalida ${runId}`;

  await expectStatus(
    'POST /notifications',
    request('/notifications', {
      token: adminToken,
      body: {
        title,
        description: 'Notificacao vinculada a evento pelo check manual de CRUD',
        eventId,
      },
    }),
    201,
  );

  await expectStatus(
    'POST /notifications eventId e comunicadoId juntos',
    request('/notifications', {
      token: adminToken,
      body: {
        title: invalidTitle,
        description: 'Notificacao invalida pelo check manual de CRUD',
        eventId,
        comunicadoId: 999999,
      },
    }),
    400,
  );
  await expectDb(
    'DB notification invalida nao persistida',
    async () =>
      (await prisma.notification.count({
        where: { title: invalidTitle },
      })) === 0,
  );

  return { title };
}

async function expectNotificationPersisted(
  title: string,
  userId: number,
  eventId: number,
) {
  await expectDb(
    'DB notification persistida para usuario',
    async () =>
      Boolean(
        await prisma.notification.findFirst({
          where: {
            title,
            userId,
            eventId,
            isRead: false,
          },
        }),
      ),
  );
}

async function findUserNotification(
  token: string,
  title: string,
): Promise<IdRecord> {
  const response = await request<IdRecord[]>('/notifications', { token });

  if (!Array.isArray(response.body)) {
    throw new Error('GET /notifications nao retornou uma lista.');
  }

  const notification = response.body.find((item) => item.title === title);
  if (!notification) {
    throw new Error(`Notificacao "${title}" nao encontrada para o usuario comum.`);
  }

  return notification;
}

async function expectStatus<T>(
  name: string,
  responsePromise: Promise<ApiResponse<T>>,
  expected: number,
): Promise<ApiResponse<T>> {
  const response = await responsePromise;
  logResult(name, expected, response.status, response.status === expected);

  if (response.status !== expected) {
    throw new Error(`${name}: esperado ${expected}, recebido ${response.status}`);
  }

  return response;
}

async function expectDb(
  name: string,
  assertion: () => Promise<boolean>,
): Promise<void> {
  const passed = await assertion();
  logResult(name, 'persistido', passed ? 'persistido' : 'nao encontrado', passed);

  if (!passed) {
    throw new Error(`${name}: validacao de persistencia falhou`);
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
  method?: string,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  const init: RequestInit = {
    method: method ?? (options.body === undefined ? 'GET' : 'POST'),
    headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined && options.body !== null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${path}`, init);
  const text = await response.text();
  const body = parseBody<T>(text);

  return {
    status: response.status,
    body,
    text,
  };
}

function parseBody<T>(text: string): T {
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

function requireToken(body: { access_token?: string }, label: string): string {
  if (!body.access_token) {
    throw new Error(`Login ${label} nao retornou access_token.`);
  }

  return body.access_token;
}

function logResult(
  name: string,
  expected: number | string,
  received: number | string,
  passed: boolean,
) {
  results.push({ name, expected, received, passed });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name} | esperado: ${expected} | recebido: ${received}`);
}

function printSummary() {
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  console.log('');
  console.log(`Resumo: ${passed} aprovados, ${failed} falhos, ${results.length} total.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Execucao interrompida: ${message}`);
    printSummary();
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
