import { Injectable } from '@angular/core';
import axios from 'axios';

interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

interface SolarPanel {
  id: string;
  name: string;
  status: string;
  power: number;
  efficiency: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  // Mock data
  private mockPanels: SolarPanel[] = [
    { id: '1', name: 'Panel A', status: 'activo', power: 350, efficiency: 95 },
    { id: '2', name: 'Panel B', status: 'activo', power: 340, efficiency: 92 },
    { id: '3', name: 'Panel C', status: 'mantenimiento', power: 0, efficiency: 0 },
    { id: '4', name: 'Panel D', status: 'activo', power: 360, efficiency: 96 },
  ];

  private mockUsers: User[] = [
    { id: '1', email: 'admin@solar.com', name: 'Administrador', role: 'admin' },
    { id: '2', email: 'user1@solar.com', name: 'Usuario 1', role: 'user' },
    { id: '3', email: 'user2@solar.com', name: 'Usuario 2', role: 'user' },
  ];

  constructor() {}

  // Users
  getUsers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: this.mockUsers });
      }, 300);
    });
  }

  createUser(data: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { id: Date.now().toString(), ...data };
        this.mockUsers.push(newUser);
        resolve({ data: newUser });
      }, 300);
    });
  }

  // Solar Panels
  getSolarPanels() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: this.mockPanels });
      }, 300);
    });
  }

  createSolarPanel(data: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPanel = { id: Date.now().toString(), ...data };
        this.mockPanels.push(newPanel);
        resolve({ data: newPanel });
      }, 300);
    });
  }

  // Health Check
  healthCheck(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            status: 'healthy',
            message: 'Sistema funcionando correctamente',
            timestamp: new Date().toISOString()
          }
        });
      }, 300);
    });
  }

  // Emergency Alert
  sendEmergencyAlert(emergencyData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Log para propósitos de debug
        console.log('🚨 ALERTA DE EMERGENCIA ENVIADA:', {
          timestamp: new Date().toISOString(),
          latitude: emergencyData.latitude,
          longitude: emergencyData.longitude,
          accuracy: emergencyData.accuracy,
          address: emergencyData.address
        });

        // Mock response - En producción, hacer una llamada real al backend
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              id: Date.now().toString(),
              status: 'enviada',
              message: 'Alerta de emergencia registrada exitosamente',
              location: {
                latitude: emergencyData.latitude,
                longitude: emergencyData.longitude,
                accuracy: emergencyData.accuracy,
                address: emergencyData.address
              },
              timestamp: new Date().toISOString()
            }
          });
        }, 500);
      } catch (error) {
        reject({
          success: false,
          message: 'Error al enviar alerta de emergencia',
          error: error
        });
      }
    });
  }
}
