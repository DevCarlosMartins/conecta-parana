import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
 const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('create deve fazer POST no endpoint correto', () => {
    const data = { title: 'Teste' };
    service.create('news', data).subscribe();

    const req = httpMock.expectOne(`${base}/news`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(data);
  });

  it('getAll deve fazer GET no endpoint correto', () => {
    service.getAll('news').subscribe();

    const req = httpMock.expectOne(`${base}/news`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('update deve fazer PUT com id correto', () => {
    const data = { title: 'Editado' };
    service.update('news', 1, data).subscribe();

    const req = httpMock.expectOne(`${base}/news/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(data);
  });

  it('delete deve fazer DELETE com id correto', () => {
    service.delete('news', 1).subscribe();

    const req = httpMock.expectOne(`${base}/news/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});