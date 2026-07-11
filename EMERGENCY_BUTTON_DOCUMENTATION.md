# 🚨 Botón de Emergencia - Documentación

## Descripción General
Se ha implementado un **botón de emergencia flotante** que permite a los usuarios enviar su ubicación exacta en caso de emergencia. El botón está disponible en toda la aplicación una vez que el usuario está autenticado.

## Características

### 🔴 Botón Principal de SOS
- **Ubicación**: Esquina inferior derecha (fixed position)
- **Funcionalidad**: Captura la ubicación GPS exacta y la envía al sistema
- **Indicadores visuales**:
  - 🚨 Icono de emergencia
  - Animación de pulso continuo
  - Efecto de glow rojo

### 📍 Botón Secundario de Google Maps
- Abre la ubicación actual en Google Maps
- Facilita visualizar la exactitud de la ubicación

### ⚙️ Características de Seguridad
- **Cooldown de 5 segundos**: Evita múltiples activaciones accidentales
- **Indicador de estado**: Muestra "Activo", "En espera" o "Enviando"
- **Confirmaciones visuales**: Mensajes de éxito/error animados
- **Deshabilitación durante carga**: Impide envíos duplicados

## Componentes Creados

### 1. EmergencyButtonComponent
**Ubicación**: `src/app/components/emergency-button/`

#### Archivos:
- `emergency-button.component.ts` - Lógica del componente
- `emergency-button.component.html` - Template
- `emergency-button.component.css` - Estilos

#### Métodos principales:
```typescript
triggerEmergency()  // Captura ubicación y envía alerta
openMaps()         // Abre Google Maps con la ubicación
```

### 2. Servicio API Actualizado
**Ubicación**: `src/app/services/api.service.ts`

#### Nuevo método:
```typescript
sendEmergencyAlert(emergencyData: any): Promise<any>
```

**Parámetros enviados:**
- `latitude` - Latitud exacta
- `longitude` - Longitud exacta
- `accuracy` - Precisión del GPS (en metros)
- `address` - Dirección (si está disponible)
- `timestamp` - Fecha y hora del evento

## Integración

El botón está integrado en el componente principal (`app.component.ts`) y aparece en toda la aplicación, en la esquina inferior derecha.

### Condición de visibilidad:
```html
<app-emergency-button *ngIf="isLoggedIn()"></app-emergency-button>
```

El botón solo es visible cuando el usuario está autenticado.

## Flujo de Operación

```
Usuario hace clic en botón SOS
    ↓
Se solicita permiso de ubicación (si es primera vez)
    ↓
Se obtiene la ubicación GPS exacta
    ↓
Se envía la alerta al backend con coordenadas
    ↓
Se muestra confirmación de éxito/error
    ↓
Botón se desactiva por 5 segundos (cooldown)
    ↓
Se reactiva automáticamente
```

## Información Enviada al Backend

Cuando se activa el botón, se envía un objeto JSON como este:

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "address": "Times Square, New York",
  "timestamp": "2026-06-12T14:30:00.000Z"
}
```

## Permisos Requeridos

El navegador solicitará permiso para acceder a:
- **Ubicación (Geolocalización)** - Requerido para obtener coordenadas GPS

## Manejo de Errores

El sistema maneja los siguientes errores:
- ❌ Geolocalización no disponible
- ❌ Usuario rechaza permiso de ubicación
- ❌ Timeout al obtener ubicación
- ❌ Error al enviar la alerta

Cada error muestra un mensaje claro al usuario.

## Optimizaciones y Características Futuras

### Implementadas:
- ✅ Obtención de ubicación en tiempo real
- ✅ Sistema de cooldown
- ✅ Mensajes de feedback visual
- ✅ Integración con Google Maps
- ✅ Estados de carga

### Sugeridas para mejorar:
- 🔄 Envío periódico de ubicación actualizadas
- 📞 Integración con servicio de emergencias 911
- 📱 Notificación a contactos de emergencia
- 🗺️ Historial de ubicaciones
- ⏱️ Temporizador de emergencia

## Respuesta del Backend

La respuesta esperada del servidor debe tener este formato:

```json
{
  "success": true,
  "data": {
    "id": "alert_12345",
    "status": "enviada",
    "message": "Alerta de emergencia registrada exitosamente",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10,
      "address": "Times Square, New York"
    },
    "timestamp": "2026-06-12T14:30:00.000Z"
  }
}
```

## Testing

Para probar el botón:

1. Inicia sesión en la aplicación
2. Busca el botón 🚨 en la esquina inferior derecha
3. Haz clic en el botón
4. Permite el acceso a la ubicación cuando el navegador lo solicite
5. Verifica que aparezca el mensaje de confirmación
6. Intenta hacer clic de nuevo (verás el estado "En espera")

## Diseño Responsivo

- **Desktop**: Botones de tamaño normal (64px)
- **Mobile**: Botones optimizados (56px)
- **Adaptativo**: Se muestra correctamente en todos los tamaños

## Notas Importantes

⚠️ **Para producción:**
- Reemplazar la respuesta mock del `ApiService` con una llamada real al backend
- Configurar el endpoint `/api/emergency-alerts` en el servidor
- Implementar autenticación token en la solicitud
- Añadir validación de ubicación en el backend
- Almacenar logs de alertas en la base de datos
- Implementar notificaciones a contactos de emergencia
