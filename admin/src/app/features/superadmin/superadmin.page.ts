import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { EntityList } from '../../shared/components/entity-list';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast.service';
import { AdministratorItem, SuperadminForm } from './superadmin.model';

@Component({
  selector: 'app-superadmin-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeader,
    FormContainer,
    FormField,
    EntityList,
    ConfirmDialog,
  ],
  templateUrl: './superadmin.page.html',
})
export class SuperadminPage extends CrudPage<SuperadminForm> implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly api   = inject(ApiService);
  private readonly toast = inject(ToastService);

  protected readonly cities = signal([
    { value: '1', label: 'Maringá' },
    { value: '2', label: 'Sarandi' },
    { value: '3', label: 'Paiçandu' },
  ]);

  readonly items        = signal<AdministratorItem[]>([]);
  readonly deletingItem = signal<AdministratorItem | null>(null);
  readonly loading      = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name:     ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cityId:   ['', Validators.required],
  });

  protected defaultFormValues(): SuperadminForm {
    return { name: '', email: '', password: '', cityId: '' };
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  private loadAdmins(): void {
    this.loading.set(true);
    this.api.getAll<AdministratorItem>('users/admins').subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  openEditForm(item: AdministratorItem): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      name:     item.name,
      email:    item.email,
      password: '',
      cityId:   String(item.cityId),
    });
    this.view.set('form');
  }

  confirmDelete(item: AdministratorItem): void {
    this.deletingItem.set(item);
  }

  cancelDelete(): void {
    this.deletingItem.set(null);
  }

  executeDelete(): void {
    const item = this.deletingItem();
    if (!item) return;

    this.api.delete('users', item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((a) => a.id !== item.id));
        this.deletingItem.set(null);
      },
      error: () => {
        this.toast.show('Não foi possível excluir o administrador.', 'error');
        this.deletingItem.set(null);
      },
    });
  }

  get nameTouched():     boolean { return this.form.controls.name.touched; }
  get emailTouched():    boolean { return this.form.controls.email.touched; }
  get passwordTouched(): boolean { return this.form.controls.password.touched; }
  get cityTouched():     boolean { return this.form.controls.cityId.touched; }

  get nameError(): string {
    const c = this.form.controls.name;
    if (c.hasError('required'))  return 'Nome é obrigatório.';
    if (c.hasError('minlength')) return 'Nome deve ter no mínimo 3 caracteres.';
    return '';
  }

  get emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Email é obrigatório.';
    if (c.hasError('email'))    return 'Email inválido.';
    return '';
  }

  get passwordError(): string {
    const c = this.form.controls.password;
    if (c.hasError('required'))  return 'Senha é obrigatória.';
    if (c.hasError('minlength')) return 'Senha deve ter no mínimo 6 caracteres.';
    return '';
  }

  get cityError(): string {
    return this.form.controls.cityId.hasError('required') ? 'Cidade é obrigatória.' : '';
  }

  getCityLabel(cityId: number): string {
    return this.cities().find((c) => Number(c.value) === cityId)?.label ?? String(cityId);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const currentEditingId = this.editingId();
    this.loading.set(true);

    if (currentEditingId !== null) {
      this.api.update<AdministratorItem>('users', currentEditingId as number, raw).subscribe({
        next: (updated) => {
          this.items.update((list) =>
            list.map((a) => (a.id === currentEditingId ? updated : a))
          );
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.toast.show('Não foi possível atualizar o administrador.', 'error');
          this.loading.set(false);
        },
      });
    } else {
      this.api.create<AdministratorItem>('auth/register', {
        ...raw,
        cityId: Number(raw.cityId),
        role: 'ADMIN',
      }).subscribe({
        next: (created) => {
          this.items.update((list) => [...list, created]);
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.toast.show('Não foi possível criar o administrador.', 'error');
          this.loading.set(false);
        },
      });
    }
  }
}