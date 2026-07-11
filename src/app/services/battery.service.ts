import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface BatteryStatus {
  level: number; // 0-1 (0-100%)
  charging: boolean;
  chargingTime: number; // segundos
  dischargingTime: number; // segundos
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BatteryService {
  private batterySubject = new BehaviorSubject<BatteryStatus | null>(null);
  public battery$ = this.batterySubject.asObservable();

  private availableSubject = new BehaviorSubject<boolean>(false);
  public available$ = this.availableSubject.asObservable();

  private batteryManager: any = null;

  constructor() {
    this.initBattery();
  }

  /**
   * Inicializar Battery Status API
   */
  private initBattery(): void {
    const nav = navigator as any;
    if (nav.getBattery) {
      // Deprecated API (navegadores antiguos)
      nav.getBattery().then((battery: any) => {
        this.batteryManager = battery;
        this.availableSubject.next(true);
        this.updateBatteryStatus(battery);
        this.setupBatteryListeners(battery);
      });
    } else if (nav.battery) {
      // Algunas implementaciones usan battery directamente
      this.batteryManager = nav.battery;
      this.availableSubject.next(true);
      this.updateBatteryStatus(nav.battery);
      this.setupBatteryListeners(nav.battery);
    } else {
      // API no disponible
      this.availableSubject.next(false);
    }
  }

  /**
   * Actualizar estado de batería
   */
  private updateBatteryStatus(battery: any): void {
    const status: BatteryStatus = {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime || 0,
      dischargingTime: battery.dischargingTime || Infinity,
      timestamp: new Date()
    };
    this.batterySubject.next(status);
  }

  /**
   * Configurar listeners para cambios de batería
   */
  private setupBatteryListeners(battery: any): void {
    if (battery.onlevelchange !== undefined) {
      battery.addEventListener('levelchange', () => this.updateBatteryStatus(battery));
    }
    if (battery.onchargingchange !== undefined) {
      battery.addEventListener('chargingchange', () => this.updateBatteryStatus(battery));
    }
    if (battery.onchargingtimechange !== undefined) {
      battery.addEventListener('chargingtimechange', () => this.updateBatteryStatus(battery));
    }
    if (battery.ondischargingtimechange !== undefined) {
      battery.addEventListener('dischargingtimechange', () => this.updateBatteryStatus(battery));
    }
  }

  /**
   * Obtener estado actual de batería
   */
  getBatteryStatus(): BatteryStatus | null {
    return this.batterySubject.value;
  }

  /**
   * Obtener porcentaje de batería (0-100)
   */
  getBatteryPercentage(): number | null {
    const battery = this.batterySubject.value;
    return battery ? Math.round(battery.level * 100) : null;
  }

  /**
   * Verificar si está cargando
   */
  isCharging(): boolean {
    const battery = this.batterySubject.value;
    return battery ? battery.charging : false;
  }

  /**
   * Obtener tiempo estimado de carga
   */
  getChargingTime(): string {
    const battery = this.batterySubject.value;
    if (!battery || battery.chargingTime === Infinity) {
      return 'Desconocido';
    }
    return this.formatTime(battery.chargingTime);
  }

  /**
   * Obtener tiempo estimado de descarga
   */
  getDischargingTime(): string {
    const battery = this.batterySubject.value;
    if (!battery || battery.dischargingTime === Infinity) {
      return 'Desconocido';
    }
    return this.formatTime(battery.dischargingTime);
  }

  /**
   * Formatear segundos a formato legible
   */
  private formatTime(seconds: number): string {
    if (seconds === Infinity) return 'Desconocido';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Obtener clase CSS para el ícono de batería
   */
  getBatteryClass(): string {
    const percentage = this.getBatteryPercentage();
    if (!percentage) return 'text-gray-500';
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 50) return 'text-blue-500';
    if (percentage >= 20) return 'text-yellow-500';
    return 'text-red-500';
  }

  /**
   * Obtener ícono de batería
   */
  getBatteryIcon(): string {
    const percentage = this.getBatteryPercentage();
    if (!percentage) return '?';
    if (percentage >= 80) return '🔋';
    if (percentage >= 50) return '🔋';
    if (percentage >= 20) return '🪫';
    return '🪫';
  }
}
