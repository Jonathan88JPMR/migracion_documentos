import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MigracionService } from '../../services/migracion.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

const SKIP_KEYS = ['Entorno', 'ENTORNO', 'ProduccionHabilitado', 'Activo', 'FechaRegistro', 'Id', 'Descripcion',
  'BD_SPRING_PRUEBA', 'BD_SPRING_PRODUCCION', 'RUTA_RAIZ_PRUEBA', 'RUTA_RAIZ_PRODUCCION'];

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent implements OnInit {
  entornos: any[] = [];
  entornoActivo = 'PRUEBA';
  config: { key: string; value: string; disabled: boolean }[] = [];

  constructor(private api: MigracionService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    try {
      const data = await this.api.configGet();
      if (!data.ok) { this.alerts.showAlertError('Error', data.error); return; }
      this.entornos = data.entornos || [];
      this.entornoActivo = data.entorno_activo || 'PRUEBA';
      const cfg = data.config || {};
      this.config = Object.keys(cfg)
        .filter(k => !SKIP_KEYS.includes(k))
        .map(k => ({ key: k, value: cfg[k] ?? '', disabled: k === 'MODO_SERVICIO' }));
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error de red: ' + e.message);
    }
  }

  async cambiarEntorno(): Promise<void> {
    const confirmado = await this.alerts.showConfirm(
      'Cambiar entorno', `¿Cambiar el entorno activo a ${this.entornoActivo}?`, 'warning');
    if (!confirmado) return;
    try {
      const data = await this.api.cambiarEntorno(this.entornoActivo);
      if (!data.ok) { this.alerts.showAlertError('Error', data.error); return; }
      this.alerts.showAlert('OK', `Entorno activo cambiado a ${data.entorno_activo}`, 'success');
      this.loadConfig();
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error de red: ' + e.message);
    }
  }

  async saveConfig(): Promise<void> {
    const updates: any = {};
    this.config.filter(c => !c.disabled).forEach(c => updates[c.key] = c.value);
    try {
      const data = await this.api.configUpdate(updates);
      if (!data.ok) {
        this.alerts.showAlertError('Error', (data.errors || [data.error]).join('<br>'));
        return;
      }
      this.alerts.showAlert('OK', 'Configuración guardada', 'success');
      this.loadConfig();
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error guardando: ' + e.message);
    }
  }
}
