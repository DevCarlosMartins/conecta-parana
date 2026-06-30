import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { CategoryItem, LocalForm, LocalItem } from './locals.model';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast.service';

@Component({
  selector: 'app-locals-page',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField],
  templateUrl: './locals.page.html',
})
export class LocalsPage extends CrudPage<LocalForm> implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly api   = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly items      = signal<LocalItem[]>([]);
  readonly categories = signal<CategoryItem[]>([]);
  readonly loading    = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    address:     ['', [Validators.required, Validators.minLength(5)]],
    phone:       [''],
    latitude:    ['', Validators.required],
    longitude:   ['', Validators.required],
    categoryId:  ['' as number | '', Validators.required],
  });

  protected defaultFormValues(): LocalForm {
    return {
      name: '', phone: '', description: '',
      address: '', latitude: '', longitude: '', categoryId: '',
    };
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadLocals();
  }

  private loadCategories(): void {
    this.api.getAll<CategoryItem>('categories').subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.toast.show('Não foi possível carregar as categorias.'),
    });
  }

  private loadLocals(): void {
    this.loading.set(true);
    this.api.getAll<LocalItem>('locals').subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => {
        this.toast.show('Não foi possível carregar os locais. Tente novamente!');
        this.loading.set(false);
      },
    });
  }

  protected openEdit(local: LocalItem): void {
    this.editingId.set(local.id);
    this.form.patchValue({
      name:        local.name,
      phone:       local.phone,
      description: local.description,
      address:     local.address,
      latitude:    local.coordinates ? String(local.coordinates.lat) : '',
      longitude:   local.coordinates ? String(local.coordinates.lng) : '',
      categoryId:  local.categoryId,
    });
    this.view.set('form');
  }

  override closeForm(): void {
    this.editingId.set(null);
    super.closeForm();
  }

  protected deleteLocal(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;
    this.api.delete('locals', id).subscribe({
      next: () => this.items.update((list) => list.filter((l) => l.id !== id)),
      error: () => this.toast.show('Não foi possível excluir o local. Tente novamente!'),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const id  = this.editingId();
    this.loading.set(true);

    const payload: Record<string, unknown> = {
      name:        raw.name,
      description: raw.description,
      address:     raw.address,
      phone:       raw.phone,
      categoryId:  Number(raw.categoryId),
    };
    
    if (!id) {
      payload['cityId'] = 1;
    }

    if (raw.latitude && raw.longitude) {
      payload['coordinates'] = {
        lat: Number(raw.latitude),
        lng: Number(raw.longitude),
      };
    }

    if (id) {
      this.api.update<LocalItem>('locals', id as number, payload).subscribe({
        next: (updated) => {
          this.items.update((list) => list.map((l) => (l.id === id ? updated : l)));
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.toast.show('Não foi possível atualizar o local. Tente novamente!');
          this.loading.set(false);
        },
      });
    } else {
      this.api.create<LocalItem>('locals', payload).subscribe({
        next: (created) => {
          this.items.update((list) => [...list, created]);
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.toast.show('Não foi possível criar o local. Tente novamente!');
          this.loading.set(false);
        },
      });
    }
  }

  get nameTouched():        boolean { return this.form.controls.name.touched; }
  get descriptionTouched(): boolean { return this.form.controls.description.touched; }
  get addressTouched():     boolean { return this.form.controls.address.touched; }
  get latitudeTouched():    boolean { return this.form.controls.latitude.touched; }
  get longitudeTouched():   boolean { return this.form.controls.longitude.touched; }
  get categoryIdTouched():  boolean { return this.form.controls.categoryId.touched; }

  get nameError():        string { return this.form.controls.name.hasError('required')        ? 'Nome é obrigatório.'        : this.form.controls.name.hasError('minlength') ? 'Mínimo 2 caracteres.' : ''; }
  get descriptionError(): string { return this.form.controls.description.hasError('required') ? 'Descrição é obrigatória.'   : this.form.controls.description.hasError('minlength') ? 'Mínimo 5 caracteres.' : ''; }
  get addressError():     string { return this.form.controls.address.hasError('required')     ? 'Endereço é obrigatório.'    : this.form.controls.address.hasError('minlength') ? 'Mínimo 5 caracteres.' : ''; }
  get latitudeError():    string { return this.form.controls.latitude.hasError('required')    ? 'Latitude é obrigatória.'    : ''; }
  get longitudeError():   string { return this.form.controls.longitude.hasError('required')   ? 'Longitude é obrigatória.'   : ''; }
  get categoryIdError():  string { return this.form.controls.categoryId.hasError('required')  ? 'Categoria é obrigatória.'   : ''; }
}