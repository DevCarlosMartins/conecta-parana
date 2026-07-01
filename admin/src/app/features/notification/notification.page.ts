import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast.service';

interface NotificationForm {
  title: string;
  description: string;
  eventId?: number;
  comunicadoId?: number;
}

interface NotificationItem extends NotificationForm {
  id: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField],
  templateUrl: 'notification.page.html',
})

export class NotificationComponent extends CrudPage<NotificationForm> implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly api   = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly items = signal<NotificationItem[]>([]);
  readonly loading = signal(false);

  override readonly editingId = signal<string | number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected defaultFormValues(): NotificationForm {
    return { title: '', description: '' };
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.api.getAll<NotificationItem>('notifications/all').subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Não foi possível carregar as notificações. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  get titleTouched(): boolean { return this.form.controls.title.touched; }

  get titleError(): string {
    const ctrl = this.form.controls.title;
    if (ctrl.hasError('required')) return 'Título é obrigatório.';
    if (ctrl.hasError('minlength')) return 'Título deve ter no mínimo 3 caracteres.';
    if (ctrl.hasError('maxlength')) return 'Título deve ter no máximo 200 caracteres.';
    return '';
  }

  get descriptionTouched(): boolean { 
    return this.form.controls.description.touched; 
  }

  get descriptionError(): string {
    const ctrl = this.form.controls.description;
    if (ctrl.hasError('required')) return 'Descrição é obrigatória.';
    if (ctrl.hasError('minlength')) return 'Descrição deve ter no mínimo 10 caracteres.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.loading.set(true);

    this.api.create<NotificationItem[]>('notifications', values).subscribe({
  next: () => {
    this.loading.set(false);
    this.editingId.set(null);
    this.form.reset();
    this.view.set('list');
    this.loadNotifications();
  },
  error: () => {
    this.toast.show('Não foi possível enviar a notificação. Tente novamente.');
    this.loading.set(false);
  },
});
  }
}