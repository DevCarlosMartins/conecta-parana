import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authSpy: { getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = {
      getAccessToken: vi.fn().mockReturnValue('fake-token'),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('deve adicionar Authorization header em requisições autenticadas', () => {
    http.get('/api/news').subscribe();

    const req = httpMock.expectOne('/api/news');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush([]);
  });

  it('não deve adicionar Authorization header em /auth/login', () => {
    http.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não deve adicionar Authorization header em /auth/refresh', () => {
    http.post('/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não deve adicionar Authorization header quando não há token', () => {
    authSpy.getAccessToken.mockReturnValue(null);

    http.get('/api/news').subscribe();

    const req = httpMock.expectOne('/api/news');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});