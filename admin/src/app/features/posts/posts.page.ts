import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrudPage } from '../../shared/utils/crud-page';
import { PageHeader } from '../../shared/components/page-header';
import { FormContainer } from '../../shared/components/form-container';
import { FormField } from '../../shared/components/form-field';
import { noSpecialChars } from '../../shared/validators/no-special-chars.validator';
import { Post, PostForm } from './posts.model';
import { ApiService } from '../../core/services/api.service';

interface PostFormValues {
  title: string;
  description: string;
  category: PostForm['category'] | '';
}

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeader, FormContainer, FormField],
  templateUrl: './posts.page.html',
})
export class PostsPage extends CrudPage<PostFormValues> implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly posts   = signal<Post[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  readonly categories = [
    { value: 'evento', label: 'Evento' },
    { value: 'noticia', label: 'Notícia' },
    { value: 'comunicado', label: 'Comunicado' },
  ] as const;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, noSpecialChars()]],
    description: ['', [Validators.required]],
    category: ['' as PostForm['category'] | '', [Validators.required]],
  });

  protected defaultFormValues(): PostFormValues {
    return {
      title: '',
      description: '',
      category: '',
    };
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll<Post>('comunicados').subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possivel carregar as postagens. Tente novamente!');
        this.loading.set(false);
      },
    });
  }

  override openForm(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      category: '',
    });
    super.openForm();
  }

  override closeForm(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      category: '',
    });
    super.closeForm();
  }

  get formTitle(): string {
    return this.editingId() === null ? 'CRIAR POSTAGEM' : 'EDITAR POSTAGEM';
  }

  get submitButtonLabel(): string {
    return this.editingId() === null ? 'Criar' : 'Atualizar';
  }

  get titleTouched(): boolean {
    return this.form.controls.title.touched;
  }

  get titleError(): string {
    const ctrl = this.form.controls.title;

    if (ctrl.hasError('required')) return 'Título é obrigatório.';
    if (ctrl.hasError('specialChars')) {
      return 'Título não pode conter caracteres especiais.';
    }

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

  get categoryTouched(): boolean {
    return this.form.controls.category.touched;
  }

  get categoryError(): string {
    const ctrl = this.form.controls.category;

    if (ctrl.hasError('required')) return 'Categoria é obrigatória.';

    return '';
  }

  onEdit(post: Post): void {
    this.editingId.set(post.id);

    this.form.reset({
      title: post.title,
      description: post.description,
      category: post.category,
    });

    this.view.set('form');
  }

  onDelete(id: number): void {
    const confirmed = window.confirm('Deseja realmente excluir esta postagem?');

    if (!confirmed) {
      return;
    }

    this.api.delete('comunicado', id).subscribe({
      next: () => {
        this.posts.update((list) => list.filter((post) => post.id !== id));
      },
      error: () => {
        this.error.set('Não foi possível excluir a postagem. Tente novamente!');
      },
    });
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
      this.api.update<Post>('comunicados', currentEditingId as number, raw).subscribe({
        next: (update) => {
          this.posts.update((list) => 
            list.map((post) => (post.id === currentEditingId ? update: post))
          );
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.error.set('Não foi possível atualizar a postagem. Tente novamente!');
          this.loading.set(false);
        },
      });
    } else {
      this.api.create<Post>('comunicados', raw).subscribe({
        next: (created) => {
          this.posts.update((list) => [...list, created]);
          this.loading.set(false);
          this.closeForm();
        },
        error: () => {
          this.error.set('Não foi possivel criar a postagem. Tente novamente!');
          this.loading.set(false);
        },
      });
    }
  }
}
