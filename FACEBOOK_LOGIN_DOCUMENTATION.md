# 🔐 Integración de Login con Facebook

## Descripción
Se ha implementado la funcionalidad de **iniciar sesión con Facebook** en la pantalla de login de A.D.A Solar. Los usuarios pueden ahora autenticarse usando sus credenciales de Facebook, proporcionando una alternativa rápida y segura al login tradicional.

## Características Implementadas

### ✅ Completadas:
- 🔵 Botón de "Iniciar con Facebook" con ícono oficial
- 📱 Integración del Facebook SDK
- 👤 Obtención de datos del perfil (nombre, email, foto)
- 🔑 Autenticación y generación de token
- 💾 Almacenamiento de credenciales
- 🎨 Diseño responsivo y atractivo
- 🔒 Manejo seguro de tokens

### 🔄 Preparado para:
- 🟡 Google Login (botón listo para futura implementación)
- 📊 Análisis de proveedores de login
- 🔄 Integración con múltiples proveedores OAuth

## Archivos Modificados

### 1. [src/index.html](src/index.html)
**Cambios:** Agregado Facebook SDK
```html
<script async defer crossorigin="anonymous" 
  src="https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v18.0" 
  nonce="XXXXXX">
</script>
```

### 2. [src/app/services/auth.service.ts](src/app/services/auth.service.ts)
**Métodos Agregados:**
- `loginWithFacebook()` - Inicia sesión con Facebook
- `handleFacebookUser()` - Procesa datos del usuario
- `checkFacebookStatus()` - Verifica estado de sesión
- `logoutFacebook()` - Cierra sesión de Facebook

### 3. [src/app/components/login/login.component.ts](src/app/components/login/login.component.ts)
**Cambios:**
- Agregado método `loginWithFacebook()`
- Agregado estado `facebookLoading`
- Manejo de errores de Facebook

### 4. [src/app/components/login/login.component.html](src/app/components/login/login.component.html)
**UI Agregada:**
- Divisor "O" entre login tradicional y redes sociales
- Botón de Facebook con ícono
- Botón de Google (deshabilitado, para futura implementación)
- Indicadores de carga

### 5. [src/app/components/login/login.component.css](src/app/components/login/login.component.css)
**Estilos Nuevos:**
- `.divider` - Línea divisoria con texto
- `.social-login` - Contenedor de botones sociales
- `.btn-social` - Estilo base para botones sociales
- `.btn-facebook` - Estilo específico de Facebook
- `.btn-google` - Estilo específico de Google

## Configuración Requerida

### ⚠️ IMPORTANTE: Obtén tu Facebook App ID

1. **Ir a Facebook Developers:**
   - https://developers.facebook.com/

2. **Crear una aplicación:**
   - Haz clic en "My Apps" → "Create App"
   - Selecciona "Consumer" como tipo de aplicación
   - Rellena los detalles de tu aplicación

3. **Obtener App ID:**
   - En el dashboard, copia tu **App ID**
   - Ve a "Settings" → "Basic"

4. **Configurar Dominios:**
   - En "Settings" → "Basic"
   - Agrega tu dominio en "App Domains"
   - Ejemplo: `localhost` para desarrollo

5. **Configurar Facebook Login:**
   - En productos, añade "Facebook Login"
   - En configuración, añade "Valid OAuth Redirect URIs"
   - Ejemplo: `http://localhost:4200/login`

### 📝 Reemplazar App ID en el código:

**En [src/index.html](src/index.html):**
```javascript
FB.init({
  appId: 'TU_APP_ID_AQUI', // ← Reemplaza esto
  xfbml: true,
  version: 'v18.0'
});
```

## Flujo de Autenticación

```
Usuario hace clic en "Iniciar con Facebook"
        ↓
Se abre diálogo de login de Facebook
        ↓
Usuario autoriza la aplicación
        ↓
Facebook SDK envía datos al navegador
        ↓
Se obtiene accessToken y datos del usuario
        ↓
Se crea/actualiza usuario en la aplicación
        ↓
Se genera token JWT local
        ↓
Se redirige al dashboard
```

## Datos Solicitados a Facebook

```json
{
  "fields": "id,name,email,picture"
}
```

**Explicación:**
- `id` - ID único del usuario en Facebook
- `name` - Nombre completo del usuario
- `email` - Email del usuario (si está disponible)
- `picture` - Foto de perfil

## Estructura del Usuario Creado

```typescript
{
  id: string,              // ID de Facebook
  email: string,           // Email de Facebook o generado
  name: string,            // Nombre del usuario
  role: 'user'             // Rol por defecto
}
```

## Respuesta Esperada

**Éxito:**
```json
{
  "user": {
    "id": "123456789",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "user"
  },
  "token": "eyJhbGc...",
  "provider": "facebook",
  "message": "¡Bienvenido Juan Pérez! Login con Facebook exitoso"
}
```

**Error:**
```json
{
  "message": "Error al autenticar con Facebook. Intente de nuevo."
}
```

## Permisos Requeridos

El usuario verá un diálogo pidiendo acceso a:
- ✓ Información de perfil público
- ✓ Email (si está disponible)

## Seguridad

### ✅ Medidas Implementadas:
- Token almacenado en localStorage
- Headers de axios actualizados con token
- Validación de datos del usuario
- Manejo seguro de accessToken de Facebook
- Logout limpia tanto Facebook como la aplicación

### ⚠️ Consideraciones de Producción:
- Implementar verificación de token en el backend
- No almacenar accessToken de Facebook sin cifrar
- Implementar HTTPS obligatoriamente
- Validar dominio en configuración de Facebook
- Usar variables de entorno para App ID

## Pruebas

### En Desarrollo:

1. **Con cuenta de prueba de Facebook:**
   - Crea una cuenta de prueba en Facebook Developers
   - Usa esa cuenta para probar el login

2. **Con tu cuenta de Facebook:**
   - Asegúrate de agregar tu cuenta como tester en la aplicación
   - En "Roles" → "Test Users"

### Pasos de Prueba:
1. Abre la aplicación en `http://localhost:4200/login`
2. Haz clic en "Iniciar con Facebook"
3. Se abrirá un diálogo de Facebook
4. Autoriza la aplicación
5. Verifica que redirige al dashboard
6. Comprueba que el usuario está logueado

## Próximos Pasos (Recomendados)

### Corto Plazo:
- [ ] Agregar Google Login (botón ya preparado)
- [ ] Implementar refresh token
- [ ] Agregar logout desde menú

### Mediano Plazo:
- [ ] Integración con LinkedIn
- [ ] Integración con GitHub
- [ ] Vinculación de múltiples proveedores

### Largo Plazo:
- [ ] 2FA (Two-Factor Authentication)
- [ ] Sincronización de perfil con Facebook periódicamente
- [ ] Análisis de origen de usuarios
- [ ] Ofertas y promociones basadas en origen

## Troubleshooting

### "Facebook SDK no está cargado"
**Solución:** Verifica que el script de Facebook esté en index.html y no hay bloqueadores de scripts

### "App no está configurada correctamente"
**Solución:** Verifica que:
- El App ID es correcto
- El dominio está agregado en configuración
- La versión del SDK es compatible

### El email no aparece
**Solución:** Es posible que Facebook no comparta el email. Se genera uno automático como `facebook_USER_ID@solar.ada`

### CORS Error
**Solución:** Asegúrate de que HTTPS está habilitado en producción

## Recursos Adicionales

- [Facebook Developers Docs](https://developers.facebook.com/docs)
- [Facebook Login Guide](https://developers.facebook.com/docs/facebook-login/web)
- [Facebook SDK Reference](https://developers.facebook.com/docs/javascript/reference)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## Notas Importantes

⚠️ **Para producción:**
1. Reemplaza el mock en `AuthService` con llamadas reales a tu backend
2. El backend debe validar el token de Facebook
3. Implementa certificados SSL/TLS
4. Usa variables de entorno para credenciales sensibles
5. Implementa rate limiting en el endpoint de login
6. Agrega logging de intentos de login fallidos
