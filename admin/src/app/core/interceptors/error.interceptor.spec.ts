import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast.service';
import { of, throwError } from 'rxjs';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authSpy: { refresh: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let toastSpy: { show: ReturnType<typeof vi.fn> };

  const setup = () => {
    authSpy = {
      refresh: vi.fn().mockReturnValue(of('new-token')),
      logout: vi.fn(),
    };
    toastSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    setup();
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('deve mostrar toast de permissão negada em erro 403', () => {
    http.get('/api/news').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/news');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Você não tem permissão para realizar esta ação.',
      'warning',
    );
  });

  it('deve mostrar toast de servidor fora do ar em erro 0', () => {
    http.get('/api/news').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/news');
    req.flush('', { status: 0, statusText: 'Unknown Error' });
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Servidor fora do ar. Verifique sua conexão.',
      'error',
    );
  });

  it('deve mostrar toast de erro interno em erro 500', () => {
    http.get('/api/news').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/news');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    expect(toastSpy.show).toHaveBeenCalledWith(
      'Erro interno do servidor. Tente novamente.',
      'error',
    );
  });

    it('deve tentar refresh em erro 401', () => {
    http.get('/api/news').subscribe({ error: vi.fn(), next: vi.fn() });

    const req = httpMock.expectOne('/api/news');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authSpy.refresh).toHaveBeenCalled();

    const retryReq = httpMock.expectOne('/api/news');
    retryReq.flush([]);
    });

  it('deve chamar logout quando refresh falha', () => {
    authSpy.refresh.mockReturnValue(throwError(() => new Error('refresh failed')));
    http.get('/api/news').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/news');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(authSpy.logout).toHaveBeenCalledWith('expired');
  });

  it('não deve interceptar erros em /auth/login', () => {
    http.post('/auth/login', {}).subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(toastSpy.show).not.toHaveBeenCalled();
    expect(authSpy.refresh).not.toHaveBeenCalled();
  });
});