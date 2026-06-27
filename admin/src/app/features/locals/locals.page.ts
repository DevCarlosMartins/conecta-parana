import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { LocalForm, LocalItem } from './locals.model';
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

  readonly items   = signal<LocalItem[]>([]);
  readonly loading = signal(false);

  protected readonly categories = [
    'Restaurante', 'Hotel', 'Ponto Turístico', 'Parque',
    'Shopping', 'Hospital', 'Escola', 'Igreja', 'Museu', 'Outro',
  ];

  protected readonly form = this.fb.nonNullable.group({
    name:        ['', Validators.required],
    phone:       [''],
    description: [''],
    latitude:    ['', Validators.required],
    longitude:   ['', Validators.required],
    category:    ['', Validators.required],
    photos:      [null as FileList | null, Validators.required],
  });

  protected defaultFormValues(): LocalForm {
    return {
      name:        '',
      phone:       '',
      description: '',
      latitude:    '',
      longitude:   '',
      category:    '',
    };
  }

  ngOnInit(): void {
    this.loadLocals();
  }

  private loadLocals(): void {
    this.loading.set(true);
    this.api.getAll<LocalItem>('locals').subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Não foi possível carregar os locais. Tente novamente!');
        this.loading.set(false);
      },
    });
  }

  protected openEdit(local: LocalItem): void {
    this.editingId.set(local.id);

    this.form.controls.photos.clearValidators();
    this.form.controls.photos.updateValueAndValidity();

    this.form.patchValue({
      name:        local.name,
      phone:       local.phone,
      description: local.description,
      latitude:    local.latitude,
      longitude:   local.longitude,
      category:    local.category,
    });

    this.view.set('form');
  }

  override closeForm(): void {
    this.editingId.set(null);
    this.restorePhotosValidator();
    super.closeForm();
  }

  protected deleteLocal(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;

    this.api.delete('locals', id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((l) => l.id !== id));
      },
      error: () => {
        this.toast.show('Não foi possível excluir o local. Tente novamente!');
      },
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

    const formData = new FormData();
    formData.append('name',        raw.name);
    formData.append('phone',       raw.phone);
    formData.append('description', raw.description);
    formData.append('latitude',    raw.latitude);
    formData.append('longitude',   raw.longitude);
    formData.append('category',    raw.category);

    if (raw.photos) {
      Array.from(raw.photos).forEach((file) => formData.append('photos', file));
    }

    if (id) {
      this.api.update<LocalItem>('locals', id as number, formData).subscribe({
        next: (updated) => {
          this.items.update((list) => list.map((l) => (l.id === id ? updated : l)));
          this.loading.set(false);
          this.editingId.set(null);
          this.restorePhotosValidator();
          this.view.set('list');
        },
        error: () => {
          this.toast.show('Não foi possível atualizar o local. Tente novamente!');
          this.loading.set(false);
        },
      });
    } else {
      this.api.create<LocalItem>('locals', formData).subscribe({
        next: (created) => {
          this.items.update((list) => [...list, created]);
          this.loading.set(false);
          this.editingId.set(null);
          this.restorePhotosValidator();
          this.view.set('list');
        },
        error: () => {
          this.toast.show('Não foi possível criar o local. Tente novamente!');
          this.loading.set(false);
        },
      });
    }
  }

  private restorePhotosValidator(): void {
    this.form.controls.photos.setValidators(Validators.required);
    this.form.controls.photos.updateValueAndValidity();
  }

  onPhotosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.form.controls.photos.setValue(input.files);
  }

  get nameTouched():      boolean { return this.form.controls.name.touched; }
  get latitudeTouched():  boolean { return this.form.controls.latitude.touched; }
  get longitudeTouched(): boolean { return this.form.controls.longitude.touched; }
  get categoryTouched():  boolean { return this.form.controls.category.touched; }
  get photosTouched():    boolean { return this.form.controls.photos.touched; }

  get nameError():      string { return this.form.controls.name.hasError('required')      ? 'Nome é obrigatório.'         : ''; }
  get latitudeError():  string { return this.form.controls.latitude.hasError('required')  ? 'Latitude é obrigatória.'     : ''; }
  get longitudeError(): string { return this.form.controls.longitude.hasError('required') ? 'Longitude é obrigatória.'    : ''; }
  get categoryError():  string { return this.form.controls.category.hasError('required')  ? 'Categoria é obrigatória.'    : ''; }
  get photosError():    string { return this.form.controls.photos.hasError('required')    ? 'Adicione ao menos uma foto.' : ''; }
}
