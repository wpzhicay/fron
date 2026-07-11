import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import axios from 'axios';
import { AuditService } from './audit.service';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3001/api';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(private auditService: AuditService) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      // Hacer petición a la API
      axios.post(`${this.baseUrl}/auth/login`, { email, password })
        .then(response => {
          const user = response.data.user;
          const token = response.data.token;

          // Guardar token y usuario en localStorage
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));

          // Actualizar axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          this.currentUserSubject.next(user);
          
          // Registrar en auditoría
          this.auditService.logLogin(user.id, user.name, 'email');

          observer.next({ user, token, message: 'Login exitoso' });
          observer.complete();
        })
        .catch(error => {
          observer.error({
            message: error.response?.data?.message || 'Error al iniciar sesión'
          });
        });
    });
  }

  register(userData: any): Observable<any> {
    return new Observable(observer => {
      // Hacer petición a la API
      axios.post(`${this.baseUrl}/auth/signup`, userData)
        .then(response => {
          const user = response.data.user;
          const token = response.data.token;

          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          this.currentUserSubject.next(user);
          observer.next({ user, token, message: 'Registro exitoso' });
          observer.complete();
        })
        .catch(error => {
          observer.error({
            message: error.response?.data?.message || 'Error al registrar'
          });
        });
    });
  }

  logout(): void {
    // Registrar logout antes de limpiar el usuario
    const currentUser = this.currentUserValue;
    if (currentUser) {
      this.auditService.logLogout(currentUser.id, currentUser.name);
    }

    // Limpiar localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Limpiar headers de axios
    delete axios.defaults.headers.common['Authorization'];

    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey) && !!this.currentUserValue;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Inicializar headers si hay un token guardado
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  // ================== GOOGLE LOGIN ==================

  /**
   * Inicia sesión con Google
   */
  loginWithGoogle(): Observable<any> {
    return new Observable(observer => {
      if (!(window as any).google) {
        observer.error({
          message: 'Google SDK no está cargado'
        });
        return;
      }

      // Usar Google Identity Services
      (window as any).google.accounts.id.initialize({
        client_id: '699969850842-c1m4rrm7lm4b1f8u5qm0b2u5v6w7x8y9z.apps.googleusercontent.com', // ⚠️ REEMPLAZA CON TU CLIENT ID
        callback: (response: any) => {
          // response.credential es el JWT token de Google
          const googleToken = response.credential;
          
          // Enviar token de Google al backend
          axios.post(`${this.baseUrl}/auth/login-google`, { token: googleToken })
            .then(response => {
              const user = response.data.user;
              const token = response.data.token;

              // Guardar en localStorage
              localStorage.setItem(this.tokenKey, token);
              localStorage.setItem(this.userKey, JSON.stringify(user));

              // Actualizar axios headers
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

              this.currentUserSubject.next(user);
              
              // Registrar en auditoría
              this.auditService.logLogin(user.id, user.name, 'google');

              observer.next({ user, token, message: 'Login con Google exitoso' });
              observer.complete();
            })
            .catch(error => {
              observer.error({
                message: error.response?.data?.message || 'Error al autenticar con Google'
              });
            });
        },
        error_callback: () => {
          observer.error({
            message: 'Error al autenticar con Google'
          });
        }
      });

      // Renderizar el botón de Google
      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      );
    });
  }

  /**
   * Inicia sesión con Google (versión simplificada usando One Tap)
   */
  initializeGoogleOneTap(onSuccess: (user: any) => void): void {
    if (!(window as any).google) {
      console.error('Google SDK no está cargado');
      return;
    }

    (window as any).google.accounts.id.initialize({
      client_id: '699969850842-c1m4rrm7lm4b1f8u5qm0b2u5v6w7x8y9z.apps.googleusercontent.com', // ⚠️ REEMPLAZA CON TU CLIENT ID
      callback: (response: any) => {
        // Enviar token de Google al backend
        axios.post(`${this.baseUrl}/auth/login-google`, { token: response.credential })
          .then(response => {
            const user = response.data.user;
            const token = response.data.token;
            
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.currentUserSubject.next(user);
            this.auditService.logLogin(user.id, user.name, 'google');
            
            onSuccess(user);
          })
          .catch(error => {
            console.error('Error autenticando con Google:', error);
          });
      }
    });

    // Mostrar One Tap
    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // El One Tap no se mostró, el usuario puede usar el botón regular
      }
    });
  }

  // ================== FACEBOOK LOGIN ==================

  /**
   * Inicia sesión con Facebook
   */
  loginWithFacebook(): Observable<any> {
    return new Observable(observer => {
      if (!(window as any).FB) {
        observer.error({
          message: 'Facebook SDK no está cargado'
        });
        return;
      }

      (window as any).FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          const userID = response.authResponse.userID;

          // Obtener información del usuario
          (window as any).FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo: any) => {
            if (userInfo.error) {
              observer.error({
                message: 'Error al obtener información de Facebook'
              });
              return;
            }

            this.handleFacebookUser(userInfo, accessToken).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          });
        } else {
          observer.error({
            message: 'No se pudo autenticar con Facebook'
          });
        }
      }, { scope: 'public_profile,email' });
    });
  }

  /**
   * Procesa la información del usuario de Facebook y crea/actualiza el usuario
   */
  private handleFacebookUser(facebookUser: any, accessToken: string): Observable<any> {
    return new Observable(observer => {
      // Enviar información de Facebook al backend
      axios.post(`${this.baseUrl}/auth/login-facebook`, {
        facebookId: facebookUser.id,
        email: facebookUser.email,
        name: facebookUser.name,
        accessToken: accessToken
      })
        .then(response => {
          const user = response.data.user;
          const token = response.data.token;

          // Guardar en localStorage
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          localStorage.setItem('facebook_token', accessToken);

          // Actualizar axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          this.currentUserSubject.next(user);
          
          // Registrar en auditoría
          this.auditService.logLogin(user.id, user.name, 'facebook');

          observer.next({
            user,
            token,
            provider: 'facebook',
            message: `¡Bienvenido ${user.name}! Login con Facebook exitoso`
          });
          observer.complete();
        })
        .catch(error => {
          observer.error({
            message: error.response?.data?.message || 'Error al procesar Facebook login'
          });
        });
    });
  }

  /**
   * Verifica si el usuario está conectado a Facebook
   */
  checkFacebookStatus(): Observable<any> {
    return new Observable(observer => {
      if (!(window as any).FB) {
        observer.error({
          message: 'Facebook SDK no disponible'
        });
        return;
      }

      (window as any).FB.getLoginStatus((response: any) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  /**
   * Desconecta de Facebook
   */
  logoutFacebook(): void {
    if ((window as any).FB) {
      (window as any).FB.logout(() => {
        localStorage.removeItem('facebook_token');
        this.logout();
      });
    } else {
      this.logout();
    }
  }
}
