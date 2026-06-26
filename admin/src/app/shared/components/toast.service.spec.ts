import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve adicionar toast ao chamar show', () => {
    service.show('Mensagem de teste', 'error');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Mensagem de teste');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('deve remover toast ao chamar dismiss', () => {
    service.show('Mensagem', 'error');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('deve usar tipo error por padrão', () => {
    service.show('Mensagem');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('deve suportar tipos warning e success', () => {
    service.show('Aviso', 'warning');
    service.show('Sucesso', 'success');
    expect(service.toasts()[0].type).toBe('warning');
    expect(service.toasts()[1].type).toBe('success');
  });
});