import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { EntityList } from '../../shared/components/entity-list';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { ApiService } from '../../core/services/api.service';
import { noSpecialChars } from '../../shared/validators/no-special-chars.validator';
import { generateSlug } from '../../shared/utils/slug';
import { NewsForm, NewsItem } from './news.model';
import { ToastService } from '../../shared/components/toast.service';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField, EntityList, ConfirmDialog],
  templateUrl: './news.page.html',
})
export class NewsPage extends CrudPage<NewsForm> implements OnInit {
  ngOnInit(): void {
    this.fetchAll();
  }

  private fetchAll(): void {
    this.loading.set(true);
    this.api.getAll<NewsItem>('news').subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Não foi possível carregar as notícias', 'error');
      },
    });
  }
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  protected readonly linkType = signal<'external' | 'internal'>('external');
  readonly items = signal<NewsItem[]>([]);
  readonly deletingItem = signal<NewsItem | null>(null);
  readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, noSpecialChars()]],
    description: ['', Validators.required],
    linkType: ['external' as 'internal' | 'external'],
    linkUrl: [''],
    isActive: [true],
  });

  protected defaultFormValues(): NewsForm {
    return {
      title: '',
      description: '',
      linkType: 'external',
      linkUrl: '',
      isActive: true,
    };
  }

  override openForm(): void {
    super.openForm();
    this.linkType.set('external');
  }

  openEditForm(item: NewsItem): void {
    this.editingId.set(item.id);
    this.form.patchValue(item);
    this.linkType.set(item.linkType);
    this.view.set('form');
  }

  confirmDelete(item: NewsItem): void {
    this.deletingItem.set(item);
  }

  cancelDelete(): void {
    this.deletingItem.set(null);
  }

  executeDelete(): void {
    const item = this.deletingItem();
    if (!item) return;

    this.api.delete('news', item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((n) => n.id !== item.id));
        this.deletingItem.set(null);
        this.toast.show('Notícia excluída com sucesso!', 'success');
      },
      error: () => {
        this.toast.show('Não foi possível excluir a notícia', 'error');
      },
    });
  }

  get titleTouched(): boolean {
    return this.form.controls.title.touched;
  }

  get titleError(): string {
    const ctrl = this.form.controls.title;
    if (ctrl.hasError('required')) return 'Título é obrigatório.';
    if (ctrl.hasError('specialChars')) return 'Título não pode conter caracteres especiais.';
    return '';
  }

  get descriptionTouched(): boolean {
    return this.form.controls.description.touched;
  }

  get descriptionError(): string {
    const ctrl = this.form.controls.description;
    if (ctrl.hasError('required')) return 'Descrição é obrigatória.';
    return '';
  }

  get linkUrlTouched(): boolean {
    return this.form.controls.linkUrl.touched;
  }

  get urlError(): string {
    const ctrl = this.form.controls.linkUrl;
    if (ctrl.hasError('required')) return 'Url é obrigatória.';
    if (ctrl.hasError('pattern'))
      return 'Url da notícia inválida: necessário começar com "https://"';
    return '';
  }

  onLinkTypeChange(): void {
    const type = this.form.controls.linkType.value;
    this.linkType.set(type);
    this.form.controls.linkUrl.reset();
  }

  onSubmit(): void {
    if (this.linkType() === 'external') {
      this.form.controls.linkUrl.setValidators([
        Validators.required,
        Validators.pattern(/^https:\/\//),
      ]);
      this.form.controls.linkUrl.updateValueAndValidity();
    } else {
      this.form.controls.linkUrl.clearValidators();
      this.form.controls.linkUrl.updateValueAndValidity();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.linkType === 'internal') {
      raw.linkUrl = generateSlug(raw.title);
    }

    const payload = { ...raw, type: 'geral' };
    const id = this.editingId();

    if (id) {
      this.api.update<NewsItem>('news', id as number, payload).subscribe({
        next: (updated) => {
          this.items.update((list) => list.map((n) => (n.id === id ? updated : n)));
          this.toast.show('Notícia atualizada com sucesso!', 'success');
          this.editingId.set(null);
          this.view.set('list');
        },
        error: () => {
          this.toast.show('Não foi possível atualizar a notícia', 'error');
        },
      });
    } else {
      this.api.create<NewsItem>('news', payload).subscribe({
        next: (created) => {
          this.items.update((list) => [...list, created]);
          this.toast.show('Notícia criada com sucesso!', 'success');
          this.editingId.set(null);
          this.view.set('list');
        },
        error: () => {
          this.toast.show('Não foi possível criar a notícia', 'error');
        },
      });
    }
  }
}
