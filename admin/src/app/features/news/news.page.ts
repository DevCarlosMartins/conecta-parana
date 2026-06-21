import { Component, inject, OnInit, signal } from '@angular/core';
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


@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField, EntityList, ConfirmDialog],
  templateUrl: './news.page.html',
})
export class NewsPage extends CrudPage<NewsForm> implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  protected readonly linkType = signal<'external' | 'internal'>('external');
  readonly items = signal<NewsItem[]>([]);
  readonly deletingItem = signal<NewsItem | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, noSpecialChars()]],
    description: ['', Validators.required],
    type: ['', Validators.required],
    linkType: ['external' as 'internal' | 'external'],
    linkUrl: [''],
    isActive: [true],
  });

  protected defaultFormValues(): NewsForm {
    return {
      title: '',
      description: '',
      type: '',
      linkType: 'external',
      linkUrl: '',
      isActive: true,
    };
  }

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void{
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll<NewsItem>('news').subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregaras notícias. Tente novamente!');
        this.loading.set(false);
      },
    });
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
      },
      error: () => {
        this.error.set('Não foi possivel excluir a notícia. Tente novamente!');
        this.deletingItem.set(null);
      },
    });
  }

  get titleTouched(): boolean {
    return this.form.controls.title.touched;
  }

  get titleError(): string {
    const ctrl = this.form.controls.title;
    if (ctrl.hasError('required')) return 'Título é obrigatório.';
    if (ctrl.hasError('specialChars'))
      return 'Título não pode conter caracteres especiais.';
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
      this.form.controls.linkUrl.setValidators([Validators.required, Validators.pattern(/^https:\/\//)]);
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

    const id = this.editingId();
    this.loading.set(true);

    if (id) {
      this.api.update<NewsItem>('news', id as number, raw).subscribe({
        next: (updated) => {
          this.items.update((list) => list.map((n) => (n.id === id ? updated : n)));
          this.loading.set(false);
          this.editingId.set(null);
          this.view.set('list');
        },
        error: () => {
          this.error.set('Não foi possivel atualizar a notícia. Tente novamente!');
          this.loading.set(false);
        }
      }) 
    } else {
      this.api.create<NewsItem>('news', raw).subscribe({
        next: (created) => {
          this.items.update((list) => [...list, created]);
          this.loading.set(false);
          this.editingId.set(null);
          this.view.set('list');
        },
        error: () => {
          this.error.set('Não foi possivel criar a notícia. Tente novamente!');
          this.loading.set(false);
        },
      });
    }
  }

  protected generateSlugPreview(title: string): string {
    return generateSlug(title);
  }
}
