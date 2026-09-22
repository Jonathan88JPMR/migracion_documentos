import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MigracionService } from '../../services/migracion.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log.component.html'
})
export class LogComponent implements OnInit {
  lines: string[] = [];

  constructor(private api: MigracionService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.loadLog();
  }

  async loadLog(): Promise<void> {
    try {
      const data = await this.api.log(200);
      if (!data.ok) { this.alerts.showAlertError('Error', data.error); return; }
      this.lines = data.lines || [];
    } catch (e: any) {
      this.alerts.showAlertError('Error', 'Error cargando log: ' + e.message);
    }
  }
}
