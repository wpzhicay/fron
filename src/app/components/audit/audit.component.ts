import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLog } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {
  allLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  expandedIndex: number | null = null;
  activePeriod: 'today' | 'week' | 'month' | 'custom' = 'month';

  // Filtros
  selectedActionType: string = '';
  selectedUser: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadLogs();
    // Por defecto, mostrar registros de este mes
    this.setDateRange('month');
  }

  /**
   * Carga todos los logs
   */
  loadLogs() {
    this.allLogs = this.auditService.getAllLogs();
    this.filteredLogs = [...this.allLogs];
  }

  /**
   * Filtra los logs según los criterios
   */
  filterLogs() {
    this.filteredLogs = this.allLogs.filter(log => {
      // Filtro por tipo de acción
      if (
        this.selectedActionType &&
        log.actionType !== this.selectedActionType
      ) {
        return false;
      }

      // Filtro por usuario
      if (
        this.selectedUser &&
        !log.userName
          .toLowerCase()
          .includes(this.selectedUser.toLowerCase()) &&
        !log.userId.includes(this.selectedUser)
      ) {
        return false;
      }

      // Filtro por rango de fechas
      if (this.startDate) {
        const logDate = new Date(log.timestamp);
        const start = new Date(this.startDate);
        if (logDate < start) return false;
      }

      if (this.endDate) {
        const logDate = new Date(log.timestamp);
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });

    // Ordenar por timestamp descendente
    this.filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Limpia todos los filtros
   */
  resetFilters() {
    this.selectedActionType = '';
    this.selectedUser = '';
    this.startDate = '';
    this.endDate = '';
    this.filterLogs();
  }

  /**
   * Alterna la visualización de detalles
   */
  toggleDetails(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  /**
   * Obtiene el conteo de logs por tipo de acción
   */
  getCountByActionType(actionType: AuditLog['actionType']): number {
    return this.allLogs.filter(log => log.actionType === actionType).length;
  }

  /**
   * Retorna la clase CSS según el tipo de acción
   */
  getActionTypeClass(actionType: AuditLog['actionType']): string {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-semibold';

    const classes: { [key: string]: string } = {
      LOGIN: baseClass + ' bg-green-100 text-green-800',
      LOGOUT: baseClass + ' bg-blue-100 text-blue-800',
      EMERGENCY: baseClass + ' bg-red-100 text-red-800',
      DEVICE_CHANGE: baseClass + ' bg-purple-100 text-purple-800',
      USER_ACTION: baseClass + ' bg-indigo-100 text-indigo-800',
      ERROR: baseClass + ' bg-yellow-100 text-yellow-800'
    };

    return classes[actionType] || baseClass + ' bg-gray-100 text-gray-800';
  }

  /**
   * Exporta los logs filtrados como JSON
   */
  exportJSON() {
    const json = JSON.stringify(this.filteredLogs, null, 2);
    this.downloadFile(
      json,
      `audit_logs_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  }

  /**
   * Exporta los logs filtrados como CSV
   */
  exportCSV() {
    const csv = this.convertToCSV(this.filteredLogs);
    this.downloadFile(
      csv,
      `audit_logs_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
  }

  /**
   * Convierte logs a formato CSV
   */
  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'Timestamp',
      'Usuario',
      'ID Usuario',
      'Acción',
      'Tipo',
      'Descripción',
      'Estado'
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.userName,
      log.userId,
      log.action,
      log.actionType,
      log.description,
      log.status
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Descarga un archivo
   */
  private downloadFile(
    content: string,
    fileName: string,
    mimeType: string
  ) {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
    );
    element.setAttribute('download', fileName);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Establece el rango de fechas según el período
   */
  setDateRange(period: 'today' | 'week' | 'month' | 'custom') {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        const firstDay = today.getDate() - today.getDay();
        start = new Date(today.setDate(firstDay));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'custom':
        // Mantener los filtros personalizados actuales
        this.activePeriod = 'custom';
        return;
    }

    this.activePeriod = period;
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);
    this.filterLogs();
  }

  /**
   * Formatea una fecha para el input de fecha HTML
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtiene el conteo de logs exitosos en los filtrados
   */
  getSuccessCount(): number {
    return this.filteredLogs.filter(log => log.status === 'SUCCESS').length;
  }

  /**
   * Obtiene el conteo de logs con error en los filtrados
   */
  getErrorCount(): number {
    return this.filteredLogs.filter(log => log.status === 'FAILED').length;
  }

  /**
   * Obtiene una etiqueta descriptiva del período actual
   */
  getPeriodLabel(): string {
    switch (this.activePeriod) {
      case 'today':
        return 'Hoy';
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mes';
      case 'custom':
        return `${this.startDate} a ${this.endDate}`;
      default:
        return 'Personalizado';
    }
  }

  /**
   * Genera e imprime un reporte de auditoría
   */
  printReport() {
    const reportHtml = this.generateReportHTML();
    const printWindow = window.open('', '', 'height=600,width=800');

    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();

      // Esperar a que cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      alert('No se pudo abrir la ventana de impresión. Verifica que los pop-ups no estén bloqueados.');
    }
  }

  /**
   * Genera el HTML del reporte de auditoría
   */
  private generateReportHTML(): string {
    const today = new Date();
    const companyName = 'A.D.A Solar';
    const reportTitle = `Reporte de Auditoría - ${this.getPeriodLabel()}`;

    const statsHtml = `
      <div class="stats-row">
        <div class="stat-box">
          <h4>Total de Registros</h4>
          <p class="stat-value">${this.filteredLogs.length}</p>
        </div>
        <div class="stat-box">
          <h4>Acciones Exitosas</h4>
          <p class="stat-value success">${this.getSuccessCount()}</p>
        </div>
        <div class="stat-box">
          <h4>Errores</h4>
          <p class="stat-value error">${this.getErrorCount()}</p>
        </div>
        <div class="stat-box">
          <h4>Logins</h4>
          <p class="stat-value">${this.getCountByActionType('LOGIN')}</p>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-box">
          <h4>Emergencias</h4>
          <p class="stat-value emergency">${this.getCountByActionType('EMERGENCY')}</p>
        </div>
        <div class="stat-box">
          <h4>Logouts</h4>
          <p class="stat-value">${this.getCountByActionType('LOGOUT')}</p>
        </div>
        <div class="stat-box">
          <h4>Cambios de Dispositivo</h4>
          <p class="stat-value">${this.getCountByActionType('DEVICE_CHANGE')}</p>
        </div>
        <div class="stat-box">
          <h4>Acciones de Usuario</h4>
          <p class="stat-value">${this.getCountByActionType('USER_ACTION')}</p>
        </div>
      </div>
    `;

    const tableHtml = `
      <table class="audit-table">
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredLogs
            .map(
              log => `
            <tr class="${log.status === 'FAILED' ? 'error-row' : ''}">
              <td>${new Date(log.timestamp).toLocaleString('es-ES')}</td>
              <td>${log.userName}</td>
              <td>${log.action}</td>
              <td><span class="badge badge-${this.getActionTypeClassShort(log.actionType)}">${log.actionType}</span></td>
              <td>${log.description}</td>
              <td><span class="status ${log.status === 'SUCCESS' ? 'success' : 'failed'}">${log.status}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportTitle}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 20px;
            background: #f5f5f5;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0066cc;
          }

          .header-left h1 {
            color: #0066cc;
            font-size: 28px;
            margin-bottom: 5px;
          }

          .header-left p {
            color: #666;
            font-size: 14px;
          }

          .header-right {
            text-align: right;
            color: #666;
            font-size: 12px;
          }

          .report-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 4px;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
          }

          .info-label {
            font-weight: 600;
            color: #333;
          }

          .info-value {
            color: #666;
          }

          .stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }

          .stat-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }

          .stat-box h4 {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
            opacity: 0.9;
          }

          .stat-value {
            font-size: 28px;
            font-weight: bold;
          }

          .stat-value.success {
            color: #4caf50;
          }

          .stat-value.error {
            color: #f44336;
          }

          .stat-value.emergency {
            color: #ff9800;
          }

          .audit-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            font-size: 13px;
          }

          .audit-table thead {
            background: #0066cc;
            color: white;
          }

          .audit-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #ddd;
          }

          .audit-table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
          }

          .audit-table tbody tr:nth-child(even) {
            background: #f9f9f9;
          }

          .audit-table tbody tr:hover {
            background: #f0f0f0;
          }

          .error-row {
            background: #ffebee !important;
          }

          .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 11px;
          }

          .status.success {
            background: #c8e6c9;
            color: #2e7d32;
          }

          .status.failed {
            background: #ffcdd2;
            color: #c62828;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            color: white;
          }

          .badge-LOGIN {
            background: #4caf50;
          }

          .badge-LOGOUT {
            background: #2196f3;
          }

          .badge-EMERGENCY {
            background: #ff5722;
          }

          .badge-DEVICE_CHANGE {
            background: #9c27b0;
          }

          .badge-USER_ACTION {
            background: #00bcd4;
          }

          .badge-ERROR {
            background: #f44336;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 11px;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .container {
              box-shadow: none;
              max-width: 100%;
              padding: 0;
            }

            .audit-table {
              page-break-inside: avoid;
            }

            .stat-box {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <h1>☀️ ${companyName}</h1>
              <p>${reportTitle}</p>
            </div>
            <div class="header-right">
              <p>Generado: ${today.toLocaleString('es-ES')}</p>
            </div>
          </div>

          <div class="report-info">
            <div class="info-item">
              <span class="info-label">Período:</span>
              <span class="info-value">${this.getPeriodLabel()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Registros encontrados:</span>
              <span class="info-value">${this.filteredLogs.length}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Filtro de acción:</span>
              <span class="info-value">${this.selectedActionType || 'Todas'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Filtro de usuario:</span>
              <span class="info-value">${this.selectedUser || 'Todos'}</span>
            </div>
          </div>

          ${statsHtml}

          ${tableHtml}

          <div class="footer">
            <p>Este reporte contiene información sensible de auditoría. © ${today.getFullYear()} ${companyName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtiene una clase corta para los badges del reporte
   */
  private getActionTypeClassShort(actionType: AuditLog['actionType']): string {
    return actionType.replace(/_/g, '_').toLowerCase();
  }
}
