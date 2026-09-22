import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/main/pages/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./modules/main/pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'archivos', loadComponent: () => import('./modules/main/pages/archivos/archivos.component').then(m => m.ArchivosComponent) },
      { path: 'configuracion', loadComponent: () => import('./modules/main/pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
      { path: 'ejecucion', loadComponent: () => import('./modules/main/pages/ejecucion/ejecucion.component').then(m => m.EjecucionComponent) },
      { path: 'ejecucion-personalizada', loadComponent: () => import('./modules/main/pages/ejecucion-personalizada/ejecucion-personalizada.component').then(m => m.EjecucionPersonalizadaComponent) },
      { path: 'log', loadComponent: () => import('./modules/main/pages/log/log.component').then(m => m.LogComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
