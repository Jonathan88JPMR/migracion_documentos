import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class MigracionService {
  private readonly url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private async post(endpoint: string, body: any = {}): Promise<any> {
    return await lastValueFrom(this.http.post<any>(`${this.url}/${endpoint}`, body));
  }

  async entornos(): Promise<any> {
    return await this.post('entornos');
  }

  async cambiarEntorno(entorno: string): Promise<any> {
    return await this.post('cambiar-entorno', { entorno });
  }

  async configGet(): Promise<any> {
    return await this.post('config-get');
  }

  async configUpdate(updates: any): Promise<any> {
    return await this.post('config-update', { updates });
  }

  async stats(): Promise<any> {
    return await this.post('stats');
  }

  async archivos(filtros: any): Promise<any> {
    return await this.post('archivos', filtros);
  }

  async archivosExcel(tipo: string): Promise<Blob> {
    return await lastValueFrom(
      this.http.post(`${this.url}/archivos/excel`, { tipo }, { responseType: 'blob' })
    );
  }

  urlPreviewAp(id: number): string {
    return `${this.url}/preview/ap/${id}`;
  }

  urlPreviewMs(id: string): string {
    return `${this.url}/preview/ms/${id}`;
  }

  async log(tail: number = 200): Promise<any> {
    return await this.post('log', { tail });
  }

  async run(): Promise<any> {
    return await this.post('run');
  }

  async runAll(): Promise<any> {
    return await this.post('run-all');
  }

  async runOrden(numero: string, tipo: string): Promise<any> {
    return await this.post('run-orden', { numero, tipo: tipo || null });
  }

  async runStatus(runId: string): Promise<any> {
    return await this.post('run-status', { run_id: runId });
  }
}
