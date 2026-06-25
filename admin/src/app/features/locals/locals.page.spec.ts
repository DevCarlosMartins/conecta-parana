import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LocalsPage } from './locals.page';
import { ApiService } from '../../core/services/api.service';
import { of } from 'rxjs';

describe('LocalsPage', () => {
  let fixture: ComponentFixture<LocalsPage>;
  let component: LocalsPage;
  let el: HTMLElement;
  let apiSpy: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiSpy = {
      getAll: vi.fn().mockReturnValue(of([])),
      delete: vi.fn().mockReturnValue(of(void 0)),
      create: vi.fn().mockReturnValue(of({ id: 1, name: 'Novo', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' })),
      update: vi.fn().mockReturnValue(of({ id: 1, name: 'Editado', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' })),
    };

    await TestBed.configureTestingModule({
      imports: [LocalsPage, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: apiSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalsPage);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve criar com view "list" e renderizar page-header', () => {
    expect(component).toBeTruthy();
    expect(component.view()).toBe('list');
    expect(el.querySelector('app-page-header')).toBeTruthy();
    expect(el.querySelector('app-form-container')).toBeNull();
  });

  describe('openForm / closeForm', () => {
    it('deve abrir formulário e resetar valores', () => {
      component['form'].patchValue({ name: 'editado', category: 'Hotel' });
      component.openForm();
      fixture.detectChanges();

      expect(component.view()).toBe('form');
      expect(component['form'].controls.name.value).toBe('');
      expect(el.querySelector('app-form-container')).toBeTruthy();
    });

    it('deve fechar formulário e voltar para list', () => {
      component.openForm();
      component.closeForm();
      expect(component.view()).toBe('list');
    });

    it('deve limpar editingId ao fechar formulário', () => {
      const local = { id: 123, name: 'Local', phone: '', description: '', latitude: '-23', longitude: '-51', category: 'Parque' };
      component['openEdit'](local);
      expect(component['editingId']()).toBe(123);

      component.closeForm();
      expect(component['editingId']()).toBeNull();
    });
  });

  describe('defaultFormValues', () => {
    it('deve retornar valores padrão corretos', () => {
      expect(component['defaultFormValues']()).toEqual({
        name: '',
        phone: '',
        description: '',
        latitude: '',
        longitude: '',
        category: '',
      });
    });
  });

  describe('nameError / nameTouched', () => {
    it('deve retornar required quando vazio', () => {
      const ctrl = component['form'].controls.name;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.nameTouched).toBe(true);
      expect(component.nameError).toBe('Nome é obrigatório.');
    });

    it('deve retornar string vazia quando válido', () => {
      component['form'].controls.name.setValue('Meu Local');
      expect(component.nameError).toBe('');
    });
  });

  describe('latitudeError / latitudeTouched', () => {
    it('deve retornar required quando vazio', () => {
      const ctrl = component['form'].controls.latitude;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.latitudeTouched).toBe(true);
      expect(component.latitudeError).toBe('Latitude é obrigatória.');
    });

    it('deve retornar string vazia quando preenchido', () => {
      component['form'].controls.latitude.setValue('-23.4253');
      expect(component.latitudeError).toBe('');
    });
  });

  describe('longitudeError / longitudeTouched', () => {
    it('deve retornar required quando vazio', () => {
      const ctrl = component['form'].controls.longitude;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.longitudeTouched).toBe(true);
      expect(component.longitudeError).toBe('Longitude é obrigatória.');
    });

    it('deve retornar string vazia quando preenchido', () => {
      component['form'].controls.longitude.setValue('-51.9383');
      expect(component.longitudeError).toBe('');
    });
  });

  describe('categoryError / categoryTouched', () => {
    it('deve retornar required quando não selecionado', () => {
      const ctrl = component['form'].controls.category;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.categoryTouched).toBe(true);
      expect(component.categoryError).toBe('Categoria é obrigatória.');
    });

    it('deve retornar string vazia quando selecionado', () => {
      component['form'].controls.category.setValue('Restaurante');
      expect(component.categoryError).toBe('');
    });
  });

  describe('photosError / photosTouched', () => {
    it('deve retornar required quando não há fotos', () => {
      const ctrl = component['form'].controls.photos;
      ctrl.setValue(null);
      ctrl.markAsTouched();
      expect(component.photosTouched).toBe(true);
      expect(component.photosError).toBe('Adicione ao menos uma foto.');
    });
  });

  describe('categories', () => {
    it('deve conter as categorias esperadas', () => {
      expect(component['categories']).toContain('Restaurante');
      expect(component['categories']).toContain('Hotel');
      expect(component['categories']).toContain('Parque');
      expect(component['categories']).toContain('Hospital');
      expect(component['categories']).toContain('Outro');
    });
  });

  describe('openEdit', () => {
    it('deve preencher o formulário com os dados do local e setar editingId', () => {
      const local = { id: 1, name: 'Parque Central', phone: '99999-9999', description: 'Um parque bonito', latitude: '-23.4253', longitude: '-51.9383', category: 'Parque' };
      component['openEdit'](local);
      fixture.detectChanges();

      expect(component['editingId']()).toBe(1);
      expect(component.view()).toBe('form');
      expect(component['form'].controls.name.value).toBe('Parque Central');
      expect(component['form'].controls.category.value).toBe('Parque');
    });

    it('deve remover validator de photos ao editar', () => {
      const local = { id: 1, name: 'X', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' };
      component['openEdit'](local);
      expect(component['form'].controls.photos.validator).toBeNull();
    });
  });

  describe('deleteLocal', () => {
    it('deve chamar api.delete quando confirmado', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component['items'].set([{ id: 1, name: 'A', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' }]);

      component['deleteLocal'](1);

      expect(apiSpy.delete).toHaveBeenCalledWith('locals', 1);
    });

    it('não deve chamar api.delete quando cancelado', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      component['deleteLocal'](1);
      expect(apiSpy.delete).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('deve marcar todos os campos como touched e não chamar api quando inválido', () => {
      component.openForm();
      component.onSubmit();

      expect(component['form'].controls.name.touched).toBe(true);
      expect(apiSpy.create).not.toHaveBeenCalled();
    });

    it('deve chamar api.create quando válido e voltar para list', () => {
      component.openForm();
      component['form'].patchValue({ name: 'Parque', phone: '', description: '', latitude: '-23', longitude: '-51', category: 'Parque' });
      component['form'].controls.photos.setValue({} as FileList);

      component.onSubmit();

      expect(apiSpy.create).toHaveBeenCalled();
    });

    it('deve chamar api.update ao editar', () => {
      const local = { id: 1, name: 'Antigo', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' };
      component['openEdit'](local);
      component['form'].patchValue({ name: 'Novo Nome' });
      component.onSubmit();

      expect(apiSpy.update).toHaveBeenCalled();
    });

    it('deve limpar editingId após update bem-sucedido', () => {
      const local = { id: 1, name: 'Local', phone: '', description: '', latitude: '0', longitude: '0', category: 'Outro' };
      component['openEdit'](local);
      component['form'].patchValue({ name: 'Editado' });
      component.onSubmit();

      expect(component['editingId']()).toBeNull();
    });
  });

  describe('validação do formulário', () => {
    it('deve estar inválido sem os campos obrigatórios', () => {
      expect(component['form'].valid).toBe(false);
    });

    it('deve ser válido com todos os campos obrigatórios preenchidos', () => {
      component['form'].patchValue({ name: 'Local Válido', latitude: '-23', longitude: '-51', category: 'Restaurante' });
      component['form'].controls.photos.setValue({} as FileList);
      expect(component['form'].valid).toBe(true);
    });
  });
});