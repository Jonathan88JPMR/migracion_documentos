import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { MigracionService } from '../../services/migracion.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './archivos.component.html'
})
export class ArchivosComponent implements OnInit {
  tipo = 'ap';
  estado = '';
  gatipo = '';
  ref = '';
  page = 1;
  perPage = 25;

  rows: any[] = [];
  total = 0;
  porEstado: { Estado: string; total: number }[] = [];
  cargando = false;
  descargando = false;

  previewVisible = false;
  previewTitle = '';
  previewUrl: SafeResourceUrl | null = null;

  errorVisible = false;
  errorEtapa = '';
  errorMsg = '';

  constructor(private api: MigracionService, private alerts: AlertService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadFiles(1);
  }

  get esAp(): boolean { return this.tipo === 'ap'; }

  get pages(): number { return Math.ceil(this.total / this.perPage); }

  pageRange(): number[] {
    const pages = this.pages;
    const radius = 2;
    let start = Math.max(1, this.page - radius);
    let end = Math.min(pages, this.page + radius);
    if (end - start + 1 < 5) {
      if (this.page <= radius) end = Math.min(pages, 5);
      else start = Math.max(1, pages - 4);
    }
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  async loadFiles(page: number = 1): Promise<void> {
    this.page = page;
    this.cargando = true;
    try {
      const data = await this.api.archivos({
        tipo: this.tipo, estado: this.estado || null, gatipo: this.gatipo || null,
        ref: this.ref || null, page: this.page, per_page: this.perPage
      });
      if (!data.ok) {
        this.alerts.showAlertError('Error', data.error || 'Error cargando archivos');
        return;
      }
      this.rows = data.rows || [];
      this.total = data.total || 0;
      this.porEstado = data.por_estado || [];
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error de red: ' + e.message);
    } finally {
      this.cargando = false;
    }
  }

  estadoColor(e: string): string {
    if (e === 'COMPLETADO') return 'success';
    if (e === 'ERROR') return 'danger';
    if (e === 'SIN_AP') return 'info';
    if (e === 'PENDIENTE') return 'warning';
    return 'secondary';
  }

  refs(r: any): string[] {
    return (r.Referencias || '').split(', ').filter(Boolean);
  }

  formatDate(d: any): string {
    if (!d) return '';
    try { return new Date(d).toLocaleString('es-PE'); } catch { return d; }
  }

  async descargarExcel(): Promise<void> {
    if (this.descargando) return;
    this.descargando = true;
    this.alerts.mostrarModalCarga();
    try {
      const blob = await this.api.archivosExcel(this.tipo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archivos_${this.tipo}_migrados.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'No se pudo generar el Excel: ' + e.message);
    } finally {
      this.alerts.cerrarModalCarga();
      this.descargando = false;
    }
  }

  /** Carpeta destino sin el nombre del archivo. */
  rutaCarpeta(r: any): string {
    const ruta = (r.RutaDestino || '').replace(/[\\/]+$/, '');
    const i = ruta.lastIndexOf('\\');
    return i > 0 ? ruta.substring(0, i) : ruta;
  }

  /** Abre la carpeta UNC en el explorador y copia la ruta al portapapeles
      (los navegadores suelen bloquear file:// desde paginas http). */
  async abrirRuta(r: any): Promise<void> {
    if (!r.RutaDestino) return;
    const carpeta = this.rutaCarpeta(r);
    window.open('file://' + carpeta.replace(/^\\\\/, '').replace(/\\/g, '/'), '_blank');
    try {
      await navigator.clipboard.writeText(carpeta);
      this.alerts.mostrarInfo('Ruta copiada al portapapeles. Si no se abrio el explorador, pégala en la barra de direcciones (Win+E).');
    } catch {
      this.alerts.mostrarInfo('Carpeta: ' + carpeta);
    }
  }

  preview(r: any): void {
    const url = this.esAp
      ? this.api.urlPreviewAp(r.IdApDocumentoArchivo)
      : this.api.urlPreviewMs(r.IdArchivo);
    this.previewTitle = `Vista previa - ${this.tipo} ${this.esAp ? r.IdApDocumentoArchivo : r.IdArchivo}`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.previewVisible = true;
  }

  verError(r: any): void {
    this.errorEtapa = r.Etapa || '-';
    this.errorMsg = r.MensajeError || '(sin mensaje)';
    this.errorVisible = true;
  }
}
