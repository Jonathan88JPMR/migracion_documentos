import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MigracionService } from '../../services/migracion.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  chartApEstado: any = null;
  chartApGatipo: any = null;
  chartMsEstado: any = null;
  chartApGatipoDone: any = null;
  private palette = ['#198754', '#0dcaf0', '#ffc107', '#dc3545', '#6c757d', '#0d6efd', '#6610f2'];

  constructor(private api: MigracionService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    try {
      const data = await this.api.stats();
      if (!data.ok) {
        this.alerts.showAlertError('Error', data.error || 'Error cargando estadísticas');
        return;
      }
      this.stats = data;
      this.renderCharts(data);
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error de red: ' + e.message);
    }
  }

  formatDate(d: any): string {
    if (!d) return '';
    try { return new Date(d).toLocaleString('es-PE'); } catch { return d; }
  }

  private renderCharts(data: any): void {
    const apEst = data?.ap?.by_estado || [];
    const apGat = data?.ap?.by_gatipo || [];
    const msEst = data?.ms?.by_estado || [];

    this.chartApEstado = {
      type: 'doughnut',
      data: { labels: apEst.map((x: any) => x.Estado), datasets: [{ data: apEst.map((x: any) => x.total), backgroundColor: this.palette }] },
      options: { responsive: true, plugins: { title: { display: true, text: 'AP por estado' } } }
    };
    this.chartApGatipo = {
      type: 'bar',
      data: { labels: apGat.map((x: any) => x.Gatipo), datasets: [{ label: 'Total', data: apGat.map((x: any) => x.total), backgroundColor: '#0d6efd' }] },
      options: { responsive: true, plugins: { title: { display: true, text: 'AP por GATipo (total)' } }, scales: { y: { beginAtZero: true } } }
    };
    this.chartMsEstado = {
      type: 'doughnut',
      data: { labels: msEst.map((x: any) => x.Estado), datasets: [{ data: msEst.map((x: any) => x.total), backgroundColor: this.palette }] },
      options: { responsive: true, plugins: { title: { display: true, text: 'MS_Archivo por estado' } } }
    };
    this.chartApGatipoDone = {
      type: 'bar',
      data: { labels: apGat.map((x: any) => x.Gatipo), datasets: [{ label: 'Completados', data: apGat.map((x: any) => x.completados), backgroundColor: '#198754' }] },
      options: { responsive: true, plugins: { title: { display: true, text: 'AP por GATipo (completados)' } }, scales: { y: { beginAtZero: true } } }
    };
  }
}
