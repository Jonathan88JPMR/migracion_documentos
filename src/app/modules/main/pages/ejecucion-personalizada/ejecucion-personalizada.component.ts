import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MigracionService } from '../../services/migracion.service';
import { RunStateService } from '../../services/run-state.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

@Component({
  selector: 'app-ejecucion-personalizada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejecucion-personalizada.component.html'
})
export class EjecucionPersonalizadaComponent {
  numero = '';
  tipo = '';

  constructor(
    private api: MigracionService,
    public runState: RunStateService,
    private alerts: AlertService) { }

  get ejecutando(): boolean { return !!this.runState.activeRunId; }

  async runOrden(): Promise<void> {
    if (this.ejecutando) { this.alerts.showAlertError('Atención', 'Ya hay una ejecución activa'); return; }
    const numero = this.numero.trim();
    if (!numero) { this.alerts.showAlertError('Atención', 'Ingrese el número de OC/OS'); return; }
    try {
      const data = await this.api.runOrden(numero, this.tipo);
      if (!data.ok) { this.alerts.showAlertError('Error', data.error); return; }
      this.alerts.showAlert('Orden ' + numero,
        `${data.pending_ap} archivos AP + ${data.pending_ms} adjuntos MS pendientes (${data.obligaciones} obligaciones)`,
        'info');
      this.runState.beginRun(data.run_id, st => {
        this.alerts.showAlertAcept('Ejecución finalizada', `Estado: ${st}`,
          st === 'success' ? 'success' : 'error');
      });
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error iniciando: ' + e.message);
    }
  }
}
