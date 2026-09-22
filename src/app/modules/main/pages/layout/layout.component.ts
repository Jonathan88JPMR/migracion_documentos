import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

interface TabItem { path: string; label: string; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  tabs: TabItem[] = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'archivos', label: 'Archivos' },
    { path: 'configuracion', label: 'Configuración' },
    { path: 'ejecucion', label: 'Ejecución' },
    { path: 'ejecucion-personalizada', label: 'Ejecución personalizada' },
    { path: 'log', label: 'Log' }
  ];
}
