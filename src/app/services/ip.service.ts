import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class IpService {
  private clientIpSubject = new BehaviorSubject<string>('');
  public clientIp$ = this.clientIpSubject.asObservable();

  constructor() {
    this.getClientIp();
  }

  /**
   * Obtiene la IP del cliente actual
   * Intenta usar ipify API, fallback a localhost si no está disponible
   */
  async getClientIp(): Promise<string> {
    try {
      // Intentar obtener IP usando ipify API (servicio gratuito)
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 3000
      });
      const ip = response.data.ip;
      this.clientIpSubject.next(ip);
      return ip;
    } catch (error) {
      // Si falla, intentar con alternativa
      try {
        const response = await axios.get('https://ipv4.icanhazip.com', {
          timeout: 3000
        });
        const ip = response.data.trim();
        this.clientIpSubject.next(ip);
        return ip;
      } catch (err) {
        // Fallback a localhost
        console.warn('No se pudo obtener la IP pública:', err);
        const ip = 'localhost (127.0.0.1)';
        this.clientIpSubject.next(ip);
        return ip;
      }
    }
  }

  /**
   * Obtiene la IP actual sin hacer nueva petición
   */
  getCurrentIp(): string {
    return this.clientIpSubject.value;
  }

  /**
   * Observable para suscribirse a cambios de IP
   */
  getClientIpObservable(): Observable<string> {
    return this.clientIp$;
  }
}
