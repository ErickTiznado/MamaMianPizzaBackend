# Lógica de Recuperación de Contraseña

Este documento describe el proceso completo de recuperación de contraseña para usuarios en la plataforma Mama Mian Pizza.

## Índice

1. [Descripción General](#descripción-general)
2. [Flujo del Proceso](#flujo-del-proceso)
3. [Endpoints API](#endpoints-api)
4. [Modelos de Datos](#modelos-de-datos)
5. [Seguridad](#seguridad)
6. [Comunicación por Correo](#comunicación-por-correo)
7. [Diagrama de Flujo](#diagrama-de-flujo)

## Descripción General

El sistema de recuperación de contraseña permite a los usuarios que han olvidado su contraseña establecer una nueva de forma segura mediante un proceso de verificación por correo electrónico. Este proceso utiliza un código OTP (One-Time Password) de 6 dígitos con una validez limitada (10 minutos) para verificar la identidad del usuario antes de permitirle establecer una nueva contraseña.

## Flujo del Proceso

1. **Solicitud de restablecimiento**: El usuario proporciona su correo electrónico.
2. **Validación y generación de OTP**: El sistema verifica que el correo exista en la base de datos y genera un código OTP de 6 dígitos.
3. **Envío de correo**: Se envía un correo electrónico al usuario con el código OTP.
4. **Verificación del código**: El usuario introduce el código recibido.
5. **Validación del código**: El sistema verifica que el código sea válido y no haya expirado.
6. **Generación de token temporal**: Se genera un token temporal con validez de 15 minutos.
7. **Establecimiento de nueva contraseña**: El usuario proporciona su nueva contraseña junto con el token.
8. **Actualización en base de datos**: Se actualiza la contraseña del usuario (encriptada).
9. **Confirmación**: Se envía un correo de confirmación al usuario.

## Endpoints API

### 1. Solicitud de Restablecimiento

**Endpoint**: `POST /auth/request-reset`

**Parámetros de Entrada**:
```json
{
  "correo": "usuario@example.com"
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Código de verificación enviado a tu correo electrónico",
  "correo": "us***@example.com",
  "validez_minutos": 10,
  "timestamp": "2025-07-03T12:34:56.789Z"
}
```

**Posibles Errores**:
- 400: Correo no proporcionado o formato inválido
- 404: Usuario no encontrado
- 500: Error interno del servidor o error al enviar correo

### 2. Verificación del Código OTP

**Endpoint**: `POST /auth/verify-reset`

**Parámetros de Entrada**:
```json
{
  "correo": "usuario@example.com",
  "otp": "123456"
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "message": "Código verificado correctamente",
  "token": "abc123...xyz",
  "expires_in": "15 minutos"
}
```

**Posibles Errores**:
- 400: Correo u OTP no proporcionados, formato inválido, o código inválido/expirado
- 500: Error interno del servidor

### 3. Restablecimiento de Contraseña

**Endpoint**: `PUT /auth/reset-password`

**Parámetros de Entrada**:
```json
{
  "token": "abc123...xyz",
  "nuevaContrasena": "ContraseñaSegura123"
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "usuario": "Nombre Usuario",
  "timestamp": "2025-07-03T12:34:56.789Z",
  "correo_confirmacion": "enviado"
}
```

**Posibles Errores**:
- 400: Token o contraseña no proporcionados, o contraseña demasiado corta
- 401: Token inválido o expirado
- 404: Usuario no encontrado
- 500: Error interno del servidor

### 4. Cambio de Contraseña (Usuario Autenticado)

**Endpoint**: `PUT /auth/change-password`

**Parámetros de Entrada**:
```json
{
  "id_usuario": 123,
  "contrasenaActual": "ContraseñaActual",
  "nuevaContrasena": "NuevaContraseña123"
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "usuario": {
    "id": 123,
    "nombre": "Nombre Usuario",
    "correo": "usuario@example.com"
  },
  "timestamp": "2025-07-03T12:34:56.789Z",
  "correo_confirmacion": "enviado"
}
```

**Posibles Errores**:
- 400: Faltan campos requeridos, contraseña demasiado corta, o nueva contraseña igual a la actual
- 401: Contraseña actual incorrecta
- 404: Usuario no encontrado
- 500: Error interno del servidor

## Modelos de Datos

### Tabla `password_reset`

```sql
CREATE TABLE `password_reset` (
  `id_reset` int NOT NULL,
  `user_id` int NOT NULL,
  `user_type` enum('usuario','admin') NOT NULL,
  `reset_code` varchar(100) NOT NULL,
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiracion` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## Seguridad

- **Códigos OTP**: Generados aleatoriamente con 6 dígitos numéricos
- **Tiempo de expiración**: Los códigos OTP expiran después de 10 minutos
- **Tokens de restablecimiento**: Validez de 15 minutos
- **Encriptación de contraseña**: Se utiliza bcrypt con factor de costo 12
- **Uso único**: Los códigos OTP son marcados como usados después de la verificación
- **Invalidación de códigos anteriores**: Se eliminan códigos antiguos al generar uno nuevo
- **Enmascaramiento de correo**: El correo electrónico se enmascara en las respuestas
- **Registro de eventos**: Se registran los cambios de contraseña en la tabla de logs

## Comunicación por Correo

### Correo de Código de Verificación

Se envía un correo con:
- Código OTP de 6 dígitos
- Tiempo de validez (10 minutos)
- Advertencias de seguridad
- Instrucciones para el usuario

### Correo de Confirmación de Cambio

Se envía un correo de confirmación después de cambiar la contraseña exitosamente con:
- Confirmación del cambio realizado
- Instrucciones en caso de que el usuario no haya realizado el cambio
- Información de contacto para soporte

## Diagrama de Flujo

```
Usuario                 Sistema                 Base de Datos             Email
  |                        |                         |                      |
  |-- Solicitar reset ---->|                         |                      |
  |                        |-- Validar correo ------>|                      |
  |                        |<-- Confirmar usuario ---|                      |
  |                        |-- Generar OTP --------->|                      |
  |                        |                         |                      |
  |                        |-- Enviar correo -----------------------> Entregar
  |                        |                         |                      |
  |<-- Solicitud aceptada--|                         |                      |
  |                        |                         |                      |
  |-- Enviar OTP --------->|                         |                      |
  |                        |-- Validar OTP --------->|                      |
  |                        |<-- Confirmación OTP ----|                      |
  |                        |-- Marcar OTP como usado>|                      |
  |                        |-- Generar token --------|                      |
  |                        |                         |                      |
  |<-- Token temporal -----|                         |                      |
  |                        |                         |                      |
  |-- Nueva contraseña --->|                         |                      |
  |                        |-- Validar token ------->|                      |
  |                        |-- Actualizar contraseña>|                      |
  |                        |-- Eliminar tokens y OTP>|                      |
  |                        |                         |                      |
  |                        |-- Enviar confirmación -----------------------> Entregar
  |                        |                         |                      |
  |<-- Actualización OK ---|                         |                      |
```
