import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<Location | null>(null);
  public location$ = this.locationSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private watchId: number | null = null;

  constructor() {}

  /**
   * Obtener ubicación actual una sola vez
   */
  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no disponible en este navegador');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          this.locationSubject.next(location);
          resolve(location);
        },
        (error) => {
          const errorMsg = this.getErrorMessage(error.code);
          this.errorSubject.next(errorMsg);
          reject(errorMsg);
        }
      );
    });
  }

  /**
   * Monitorear ubicación en tiempo real
   */
  startWatchingLocation(): void {
    if (!navigator.geolocation) {
      this.errorSubject.next('Geolocalización no disponible');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        };
        this.locationSubject.next(location);
        this.errorSubject.next(null);
      },
      (error) => {
        const errorMsg = this.getErrorMessage(error.code);
        this.errorSubject.next(errorMsg);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  }

  /**
   * Detener monitoreo de ubicación
   */
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Obtener URL de Google Maps
   */
  getMapUrl(): string | null {
    const location = this.locationSubject.value;
    if (!location) return null;
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  /**
   * Calcular distancia entre dos puntos (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permiso de ubicación denegado. Actívalo en la configuración.';
      case 2:
        return 'No se pudo obtener la ubicación. Intenta de nuevo.';
      case 3:
        return 'Tiempo de espera agotado. Intenta de nuevo.';
      default:
        return 'Error desconocido al obtener ubicación.';
    }
  }
}
