import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  submitted = false;
  error = '';
  returnUrl: string = '';
  facebookLoading = false;
  googleLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener returnUrl del parámetro de query o ruta por defecto
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Inicializar formulario
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      });
  }

  /**
   * Inicia sesión con Google
   */
  loginWithGoogle() {
    this.googleLoading = true;
    this.error = '';

    this.authService.loginWithGoogle()
      .subscribe({
        next: (response) => {
          this.googleLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.googleLoading = false;
          this.error = error.message || 'Error al autenticar con Google. Intente de nuevo.';
        }
      });
  }

  /**
   * Inicia sesión con Facebook
   */
  loginWithFacebook() {
    this.facebookLoading = true;
    this.error = '';

    this.authService.loginWithFacebook()
      .subscribe({
        next: (response) => {
          this.facebookLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.facebookLoading = false;
          this.error = error.message || 'Error al autenticar con Facebook. Intente de nuevo.';
        }
      });
  }
}
