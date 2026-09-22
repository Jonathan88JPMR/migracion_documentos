import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MigracionService } from '../../services/migracion.service';
import { RunStateService } from '../../services/run-state.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

@Component({
  selector: 'app-ejecucion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejecucion.component.html'
})
export class EjecucionComponent {
  constructor(
    private api: MigracionService,
    public runState: RunStateService,
    private alerts: AlertService) { }

  get ejecutando(): boolean { return !!this.runState.activeRunId; }

  async runNow(): Promise<void> {
    if (this.ejecutando) { this.alerts.showAlertError('Atención', 'Ya hay una ejecución activa'); return; }
    try {
      const data = await this.api.run();
      if (!data.ok) {
        this.alerts.showAlertError('Error', (data.errors || [data.error]).join('<br>'));
        return;
      }
      this.runState.beginRun(data.run_id, st => this.onDone(st));
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error iniciando: ' + e.message);
    }
  }

  async runAll(): Promise<void> {
    if (this.ejecutando) { this.alerts.showAlertError('Atención', 'Ya hay una ejecución activa'); return; }
    const confirmado = await this.alerts.showConfirm(
      'Procesar todo', '¿Procesar todo lo faltante? Puede tardar varios minutos.', 'warning');
    if (!confirmado) return;
    try {
      const data = await this.api.runAll();
      if (!data.ok) { this.alerts.showAlertError('Error', data.error); return; }
      this.runState.beginRun(data.run_id, st => this.onDone(st));
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error iniciando: ' + e.message);
    }
  }

  private onDone(status: string): void {
    this.alerts.showAlertAcept(
      'Ejecución finalizada',
      `Estado: ${status}`,
      status === 'success' ? 'success' : 'error');
  }
}
