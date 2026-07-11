import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LocationService, Location } from '../../services/location.service';
import { AuditService } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-emergency-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergency-button.component.html',
  styleUrls: ['./emergency-button.component.css']
})
export class EmergencyButtonComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isActive: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private locationService: LocationService,
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Opcional: escuchar cambios de ubicación en tiempo real
    this.locationService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async triggerEmergency() {
    if (this.isLoading || !this.isActive) return;

    this.isLoading = true;
    this.showSuccess = false;
    this.showError = false;

    try {
      // Obtener ubicación actual
      const location = await this.locationService.getCurrentLocation();

      // Enviar alerta de emergencia
      const response = await this.apiService.sendEmergencyAlert({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address,
        timestamp: new Date().toISOString()
      });

      // Mostrar éxito
      this.successMessage = `✓ Ubicación enviada: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      this.showSuccess = true;
      this.isActive = false;

      // Registrar en auditoría
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        this.auditService.logEmergencyButton(
          currentUser.id,
          currentUser.name,
          location.latitude,
          location.longitude,
          location.accuracy
        );
      }

      // Desactivar botón por 5 segundos para evitar múltiples activaciones
      setTimeout(() => {
        this.isActive = true;
      }, 5000);

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);

      console.log('✅ Alerta de emergencia enviada:', response);
    } catch (error: any) {
      // Mostrar error
      const errorMsg = error?.message || 'No se pudo obtener la ubicación';
      this.errorMessage = `✗ Error: ${errorMsg}`;
      this.showError = true;

      // Registrar error en auditoría
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        this.auditService.logError(
          currentUser.id,
          currentUser.name,
          'EMERGENCY_BUTTON',
          errorMsg,
          { error: error?.toString() }
        );
      }

      // Limpiar mensaje de error después de 4 segundos
      setTimeout(() => {
        this.showError = false;
      }, 4000);

      console.error('❌ Error en alerta de emergencia:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openMaps() {
    this.locationService.getCurrentLocation().then(location => {
      const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(mapsUrl, '_blank');
    });
  }
}
