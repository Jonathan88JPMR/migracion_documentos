import { Injectable } from '@angular/core';
import { MigracionService } from './migracion.service';

/**
 * Estado compartido de la ejecución activa entre las pestañas
 * "Ejecución" y "Ejecución personalizada" (equivalente a las clases
 * .run-info / .run-output del dashboard Flask).
 */
@Injectable({ providedIn: 'root' })
export class RunStateService {
  activeRunId: string | null = null;
  runStart: Date | null = null;
  output: string[] = [];
  info = '';
  private timer: any = null;
  private pollTimer: any = null;

  constructor(private api: MigracionService) { }

  elapsed(): string {
    if (!this.runStart) return '';
    const total = Math.max(0, Math.floor((Date.now() - this.runStart.getTime()) / 1000));
    return `${Math.floor(total / 60)}m ${total % 60}s`;
  }

  startTimers(): void {
    this.stopTimers();
    this.timer = setInterval(() => this.updateInfo(), 1000);
    this.updateInfo();
  }

  private updateInfo(): void {
    if (!this.runStart) return;
    this.info = `Iniciada: ${this.runStart.toLocaleTimeString('es-PE')}. Transcurrido: ${this.elapsed()}`;
  }

  stopTimers(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  beginRun(runId: string, onDone?: (status: string) => void): void {
    this.activeRunId = runId;
    this.runStart = new Date();
    this.output = [];
    this.startTimers();
    this.poll(onDone);
  }

  private poll(onDone?: (status: string) => void): void {
    if (!this.activeRunId) return;
    const rid = this.activeRunId;
    this.pollTimer = setInterval(async () => {
      try {
        const data = await this.api.runStatus(rid);
        if (!data.ok) {
          this.finish(`Error: ${data.error}`);
          onDone?.('error');
          return;
        }
        this.output = data.output || [];
        if (data.status !== 'running') {
          const dur = this.elapsed();
          this.finish(`Iniciada: ${this.runStart?.toLocaleTimeString('es-PE')}. ` +
            `Finalizada: ${new Date().toLocaleTimeString('es-PE')}. Duración total: ${dur}`);
          onDone?.(data.status);
        }
      } catch {
        this.finish('Error consultando ejecución');
        onDone?.('error');
      }
    }, 2000);
  }

  private finish(info: string): void {
    this.stopTimers();
    this.info = info;
    this.activeRunId = null;
    this.runStart = null;
  }
}
