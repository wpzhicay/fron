import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, Location } from '../../services/location.service';
import { BatteryService, BatteryStatus } from '../../services/battery.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-device-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-status.component.html',
  styleUrls: ['./device-status.component.css']
})
export class DeviceStatusComponent implements OnInit, OnDestroy {
  location: Location | null = null;
  locationError: string | null = null;
  locationLoading = false;

  battery: BatteryStatus | null = null;
  batteryAvailable = false;

  showLocationDetails = false;
  showBatteryDetails = false;

  private destroy$ = new Subject<void>();

  constructor(
    private locationService: LocationService,
    private batteryService: BatteryService
  ) {}

  ngOnInit(): void {
    // Suscribirse a ubicación
    this.locationService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.location = location;
      });

    this.locationService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.locationError = error;
      });

    // Suscribirse a batería
    this.batteryService.battery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(battery => {
        this.battery = battery;
      });

    this.batteryService.available$
      .pipe(takeUntil(this.destroy$))
      .subscribe(available => {
        this.batteryAvailable = available;
      });

    // Obtener ubicación actual
    this.getLocation();
  }

  /**
   * Obtener ubicación actual
   */
  getLocation(): void {
    this.locationLoading = true;
    this.locationService.getCurrentLocation()
      .then(() => {
        this.locationLoading = false;
        this.locationService.startWatchingLocation();
      })
      .catch((error) => {
        this.locationLoading = false;
        this.locationError = error;
      });
  }

  /**
   * Abrir ubicación en Google Maps
   */
  openMaps(): void {
    const mapUrl = this.locationService.getMapUrl();
    if (mapUrl) {
      window.open(mapUrl, '_blank');
    }
  }

  /**
   * Copiar coordenadas al portapapeles
   */
  copyCoordinates(): void {
    if (!this.location) return;
    const text = `${this.location.latitude.toFixed(6)}, ${this.location.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
  }

  /**
   * Obtener estado de batería formateado
   */
  getBatteryPercentage(): number | null {
    return this.batteryService.getBatteryPercentage();
  }

  getBatteryStatus(): string {
    if (!this.battery) return 'Desconocido';
    return this.battery.charging ? '🔌 Cargando' : '🔋 En uso';
  }

  getChargingTime(): string {
    return this.batteryService.getChargingTime();
  }

  getDischargingTime(): string {
    return this.batteryService.getDischargingTime();
  }

  getBatteryClass(): string {
    return this.batteryService.getBatteryClass();
  }

  /**
   * Formatear horas desde segundos (para template)
   */
  formatHours(seconds: number): string {
    if (!isFinite(seconds)) return '∞';
    return (seconds / 3600).toFixed(1);
  }

  /**
   * Verificar si es Infinity
   */
  isInfinity(value: number): boolean {
    return !isFinite(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.locationService.stopWatchingLocation();
  }
}

