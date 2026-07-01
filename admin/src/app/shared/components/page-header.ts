import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
})
export class PageHeader {
  title = input.required<string>();
  buttonLabel = input.required<string>();
  subtitle = input<string | null>(null);
  create = output<void>();

  readonly subtitleText = computed(() => {
    if (this.subtitle()) {
      return this.subtitle();
    }

    const title = this.title().toLowerCase();

    if (title.includes('post')) {
      return 'Gerencie eventos, notícias e comunicados exibidos no aplicativo.';
    }

    if (title.includes('evento')) {
      return 'Cadastre e acompanhe eventos públicos da cidade.';
    }

    if (title.includes('notícia') || title.includes('noticia')) {
      return 'Publique notícias e informações oficiais para os cidadãos.';
    }

    if (title.includes('local')) {
      return 'Organize locais úteis, endereços e pontos de interesse.';
    }

    if (title.includes('notifica')) {
      return 'Envie avisos importantes para os usuários da cidade.';
    }

    if (title.includes('admin')) {
      return 'Controle os administradores vinculados às cidades.';
    }

    return 'Gerencie as informações do painel municipal.';
  });
}
