import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, Sidebar } from './sidebar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly navItems: NavItem[] = [
    { label: 'Postagens', route: '/posts', icon: 'pencil-square', group: 'Geral'},
    { label: 'Eventos', route: '/events', icon: 'calendar-days', group: 'Geral' },
    { label: 'Notícias', route: '/news', icon: 'newspaper', group: 'Geral' },
    { label: 'Locais', route: '/locals', icon: 'map-pin', group: 'Geral' },
    { label: 'Notificações', route: '/notifications', icon: 'bell', group: 'Gestão' },
    { label: 'Administradores', route: '/superadmin', icon: 'pencil-square', group: 'Gestão' },
    // TODO: futuramente exibir a tela "criar Adm" apenas para superadministradores.
  ];

  onLogout(): void {
    this.auth.logout('manual');
  }
}
