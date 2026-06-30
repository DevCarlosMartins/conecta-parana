import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const date = new Date(control.value);
  return date > new Date() ? null : { pastDate: true };
}

interface EventsFormValues {
  title: string;
  type: string;
  description: string;
  eventDate: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  localId: number | null;
}

interface EventItem extends EventsFormValues {
  id: number;
}

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField],
  templateUrl: './events.page.html',
})
export class EventsPage extends CrudPage<EventsFormValues> implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly items   = signal<EventItem[]>([]);
  readonly loading = signal(false);

  readonly photos = signal<File[]>([]);
  readonly photoErrors = signal<string[]>([]);

  readonly eventTypes = [
    { value: 'cultural',    label: 'Cultural' },
    { value: 'esportivo',   label: 'Esportivo' },
    { value: 'saude',       label: 'Saúde' },
    { value: 'educacao',    label: 'Educação' },
    { value: 'tecnologia',  label: 'Tecnologia' },
    { value: 'lazer',       label: 'Lazer' },
  ];

  readonly statusOptions = [
    { value: 'ativo',      label: 'Ativo' },
    { value: 'agendado',   label: 'Agendado' },
    { value: 'encerrado',  label: 'Encerrado' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    type:        ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    eventDate:   ['', [Validators.required, futureDateValidator]],
    status:      ['agendado', Validators.required],
    latitude:    [null as number | null, [Validators.min(-90),  Validators.max(90)]],
    longitude:   [null as number | null, [Validators.min(-180), Validators.max(180)]],
    localId:     [null as number | null],
  });

  protected defaultFormValues(): EventsFormValues {
    return {
      title: '', type: '', description: '',
      eventDate: '', status: 'agendado',
      latitude: null, longitude: null, localId: null,
    };
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.api.getAll<EventItem>('events').subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.toast.show('Não foi possível carregar os eventos.', 'error'); this.loading.set(false); },
    });
  }

  override openForm(): void {
    super.openForm();
    this.photos.set([]);
    this.photoErrors.set([]);
    
    this.form.controls.eventDate.clearValidators();
    this.form.controls.eventDate.addValidators([Validators.required, futureDateValidator]);
    this.form.controls.eventDate.updateValueAndValidity();
  }

  openEditForm(item: EventItem): void {
    this.editingId.set(item.id);

    this.form.controls.eventDate.clearValidators();
    this.form.controls.eventDate.addValidators(Validators.required);
    this.form.controls.eventDate.updateValueAndValidity();

    // Converte a data ISO para o formato aceito pelo datetime-local
    const dateValue = item.eventDate
      ? new Date(item.eventDate).toISOString().slice(0, 16)
      : '';

    this.form.patchValue({ ...item, eventDate: dateValue });
    this.view.set('form');
  }

  onDelete(id: number): void {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    this.api.delete('events', id).subscribe({
      next: () => this.items.update(list => list.filter(e => e.id !== id)),
      error: () => this.toast.show('Não foi possível excluir o evento.', 'error'),
    });
  }

formatEventDate(eventDate: string): string {
  if (!eventDate) return '';
  const date = new Date(eventDate);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

  get titleTouched(): boolean { 
    return this.form.controls.title.touched; 
  }

  get typeTouched(): boolean { 
    return this.form.controls.type.touched; 
  }

  get descriptionTouched(): boolean { 
    return this.form.controls.description.touched; 
  }

  get eventDateTouched(): boolean { 
    return this.form.controls.eventDate.touched; 
  }

  get latitudeTouched(): boolean { 
    return this.form.controls.latitude.touched; 
  }

  get longitudeTouched(): boolean { 
    return this.form.controls.longitude.touched; 
  }

  get titleError(): string {
    const c = this.form.controls.title;
    if (c.hasError('required')) return 'Título é obrigatório.';
    if (c.hasError('minlength')) return 'Título deve ter no mínimo 3 caracteres.';
    if (c.hasError('maxlength')) return 'Título deve ter no máximo 150 caracteres.';
    return '';
  }

  get typeError(): string {
    return this.form.controls.type.hasError('required') ? 'Tipo é obrigatório.' : '';
  }

  get descriptionError(): string {
    const c = this.form.controls.description;
    if (c.hasError('required')) return 'Descrição é obrigatória.';
    if (c.hasError('minlength')) return 'Descrição deve ter no mínimo 10 caracteres.';
    return '';
  }

  get eventDateError(): string {
    const c = this.form.controls.eventDate;
    if (c.hasError('required')) return 'Data do evento é obrigatória.';
    if (c.hasError('pastDate')) return 'A data do evento deve ser futura.';
    return '';
  }

  get latitudeError(): string {
    const c = this.form.controls.latitude;
    return (c.hasError('min') || c.hasError('max')) ? 'Latitude deve estar entre -90 e 90.' : '';
  }

  get longitudeError(): string {
    const c = this.form.controls.longitude;
    return (c.hasError('min') || c.hasError('max')) ? 'Longitude deve estar entre -180 e 180.' : '';
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(Array.from(input.files));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) this.processFiles(Array.from(event.dataTransfer.files));
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  processFiles(files: File[]): void {
    const errors: string[] = [];
    const valid: File[] = [];
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowed.includes(file.type)) { errors.push(`${file.name}: formato inválido.`); continue; }
      if (file.size > maxSize) { errors.push(`${file.name}: tamanho máximo é 5MB.`); continue; }
      valid.push(file);
    }
    this.photos.update(prev => [...prev, ...valid]);
    this.photoErrors.set(errors);
  }

  removePhoto(index: number): void {
    this.photos.update(prev => prev.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const id  = this.editingId();

    const payload: Record<string, unknown> = {
      title:       raw.title,
      type:        raw.type,
      description: raw.description,
      eventDate:   raw.eventDate,
      status:      raw.status,
    };

    if (!id) {
      payload['cityId'] = 1;
    }

    if (raw.latitude !== null && raw.longitude !== null) {
      payload['coordinates'] = { lat: raw.latitude, lng: raw.longitude };
    }

    if (raw.localId !== null) {
      payload['localId'] = raw.localId;
    }

    this.loading.set(true);

    if (id) {
      this.api.update<EventItem>('events', id as number, payload).subscribe({
        next: (updated) => {
          this.items.update(list => list.map(e => e.id === id ? updated : e));
          this.loading.set(false);
          this.view.set('list');
        },
        error: () => { this.toast.show('Não foi possível atualizar o evento.', 'error'); this.loading.set(false); },
      });
    } else {
      this.api.create<EventItem>('events', payload).subscribe({
        next: (created) => {
          this.items.update(list => [...list, created]);
          this.loading.set(false);
          this.view.set('list');
        },
        error: () => { this.toast.show('Não foi possível criar o evento.', 'error'); this.loading.set(false); },
      });
    }
  }
}