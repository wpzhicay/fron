import { Injectable } from '@angular/core';
import axios from 'axios';
import { IpService } from './ip.service';

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  actionType: 'LOGIN' | 'LOGOUT' | 'EMERGENCY' | 'DEVICE_CHANGE' | 'USER_ACTION' | 'ERROR';
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private baseUrl = 'http://localhost:3001/api';
  private localLogs: AuditLog[] = [];

  constructor(private ipService: IpService) {
    this.loadLocalLogs();
  }

  /**
   * Registra una acción en auditoría
   */
  async logAction(
    userId: string,
    userName: string,
    action: string,
    actionType: AuditLog['actionType'],
    description: string,
    details?: any,
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
  ): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      userName,
      action,
      actionType,
      description,
      details,
      ipAddress: this.ipService.getCurrentIp(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      status
    };

    // Guardar localmente
    this.localLogs.push(auditLog);
    this.saveLocalLogs();

    // Enviar al backend
    try {
      await axios.post(`${this.baseUrl}/audit/logs`, auditLog);
    } catch (error) {
      console.error('Error al registrar auditoría en backend:', error);
      // El log sigue guardado localmente aunque falle el backend
    }
  }

  /**
   * Registra login
   */
  async logLogin(userId: string, userName: string, method: string = 'email'): Promise<void> {
    await this.logAction(
      userId,
      userName,
      'LOGIN',
      'LOGIN',
      `Usuario autenticado por ${method}`,
      { method },
      'SUCCESS'
    );
  }

  /**
   * Registra logout
   */
  async logLogout(userId: string, userName: string): Promise<void> {
    await this.logAction(
      userId,
      userName,
      'LOGOUT',
      'LOGOUT',
      'Usuario cerró sesión',
      {},
      'SUCCESS'
    );
  }

  /**
   * Registra activación de botón de emergencia
   */
  async logEmergencyButton(
    userId: string,
    userName: string,
    latitude: number,
    longitude: number,
    accuracy: number
  ): Promise<void> {
    await this.logAction(
      userId,
      userName,
      'EMERGENCY_BUTTON',
      'EMERGENCY',
      'Botón de emergencia activado',
      {
        latitude,
        longitude,
        accuracy
      },
      'SUCCESS'
    );
  }

  /**
   * Registra cambios en dispositivos
   */
  async logDeviceChange(
    userId: string,
    userName: string,
    deviceId: string,
    deviceName: string,
    changeType: 'UPDATE' | 'DELETE' | 'CREATE' | 'STATUS_CHANGE',
    oldValue?: any,
    newValue?: any
  ): Promise<void> {
    await this.logAction(
      userId,
      userName,
      'DEVICE_CHANGE',
      'DEVICE_CHANGE',
      `${changeType} en dispositivo: ${deviceName}`,
      {
        deviceId,
        deviceName,
        changeType,
        oldValue,
        newValue
      },
      'SUCCESS'
    );
  }

  /**
   * Registra errores o acciones fallidas
   */
  async logError(
    userId: string,
    userName: string,
    action: string,
    error: string,
    details?: any
  ): Promise<void> {
    await this.logAction(
      userId,
      userName,
      action,
      'ERROR',
      `Error: ${error}`,
      details,
      'FAILED'
    );
  }

  /**
   * Obtiene todos los logs locales
   */
  getAllLogs(): AuditLog[] {
    return [...this.localLogs];
  }

  /**
   * Filtra logs por usuario
   */
  getLogsByUser(userId: string): AuditLog[] {
    return this.localLogs.filter(log => log.userId === userId);
  }

  /**
   * Filtra logs por tipo de acción
   */
  getLogsByActionType(actionType: AuditLog['actionType']): AuditLog[] {
    return this.localLogs.filter(log => log.actionType === actionType);
  }

  /**
   * Filtra logs por rango de fechas
   */
  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.localLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  /**
   * Obtiene logs desde el backend (para admin)
   */
  async fetchLogsFromBackend(
    filters?: {
      userId?: string;
      actionType?: AuditLog['actionType'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLog[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/audit/logs`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error al obtener logs del backend:', error);
      return [];
    }
  }

  /**
   * Limpia logs locales
   */
  clearLocalLogs(): void {
    this.localLogs = [];
    localStorage.removeItem('auditLogs');
  }

  /**
   * Guarda logs en localStorage
   */
  private saveLocalLogs(): void {
    try {
      localStorage.setItem('auditLogs', JSON.stringify(this.localLogs));
    } catch (error) {
      console.error('Error al guardar logs en localStorage:', error);
    }
  }

  /**
   * Carga logs desde localStorage
   */
  private loadLocalLogs(): void {
    try {
      const stored = localStorage.getItem('auditLogs');
      this.localLogs = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar logs de localStorage:', error);
      this.localLogs = [];
    }
  }

  /**
   * Exporta logs como JSON
   */
  exportLogsAsJson(): string {
    return JSON.stringify(this.localLogs, null, 2);
  }

  /**
   * Exporta logs como CSV
   */
  exportLogsAsCsv(): string {
    if (this.localLogs.length === 0) return '';

    const headers = ['ID', 'Usuario', 'Acción', 'Tipo', 'Descripción', 'Estado', 'Timestamp'];
    const rows = this.localLogs.map(log => [
      log.id || '',
      log.userName,
      log.action,
      log.actionType,
      log.description,
      log.status,
      log.timestamp
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}
