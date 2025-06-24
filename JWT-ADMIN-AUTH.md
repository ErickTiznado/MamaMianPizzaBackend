# JWT Admin Authentication System

## Overview

Este documento describe el nuevo sistema de autenticación JWT implementado para administradores en el backend de Mama Mian Pizza. El sistema proporciona autenticación segura con tokens JWT para todas las operaciones administrativas.

## Características Principales

- 🔐 **Autenticación JWT**: Tokens seguros con expiración configurable
- 🔄 **Refresh Token**: Renovación automática de tokens
- 🛡️ **Middleware de Protección**: Validación automática en rutas protegidas
- 📝 **Logging Completo**: Registro de todas las actividades de admin
- ⏰ **Tokens Temporales**: Tokens especiales para restablecimiento de contraseña

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_ADMIN_EXPIRES_IN=8h
```

- `JWT_SECRET`: Clave secreta para firmar tokens (mínimo 32 caracteres)
- `JWT_EXPIRES_IN`: Duración de tokens para usuarios regulares
- `JWT_ADMIN_EXPIRES_IN`: Duración de tokens para administradores

## Endpoints de Autenticación

### 1. Login de Administrador

**POST** `/auth/admin/login`

Autentica un administrador y devuelve un token JWT.

**Request Body:**
```json
{
  "correo": "admin@mamamianpizza.com",
  "contrasena": "tu_contraseña_segura"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "admin": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "admin@mamamianpizza.com",
    "ultimo_acceso": "2025-06-23T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": "8h",
  "timestamp": "2025-06-23T10:00:00.000Z"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "error_type": "INVALID_CREDENTIALS"
}
```

### 2. Obtener Perfil de Administrador

**GET** `/auth/admin/profile`

Obtiene el perfil del administrador autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Perfil de administrador obtenido exitosamente",
  "admin": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "admin@mamamianpizza.com",
    "activo": true,
    "ultimo_acceso": "2025-06-23T10:00:00.000Z",
    "fecha_creacion": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-06-23T10:00:00.000Z"
}
```

### 3. Renovar Token

**POST** `/auth/admin/refresh-token`

Renueva un token JWT próximo a expirar.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "admin": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "admin@mamamianpizza.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": "8h",
  "timestamp": "2025-06-23T10:00:00.000Z"
}
```

### 4. Cerrar Sesión

**POST** `/auth/admin/logout`

Cierra la sesión del administrador (cliente debe eliminar el token).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "timestamp": "2025-06-23T10:00:00.000Z",
  "note": "El token debe ser eliminado del cliente"
}
```

## Middleware de Protección

### `verifyAdminToken`

Middleware que protege rutas administrativas validando el token JWT.

**Uso en rutas:**
```javascript
const { verifyAdminToken } = require('../controllers/authController');

// Ruta protegida
router.get('/admin/protected-route', verifyAdminToken, (req, res) => {
  // req.admin contiene información del administrador
  const adminId = req.admin.id;
  const adminEmail = req.admin.email;
  const adminNombre = req.admin.nombre;
  
  res.json({
    message: 'Acceso autorizado',
    admin: req.admin
  });
});
```

**Información disponible en `req.admin`:**
```javascript
{
  id: 1,                    // ID del administrador
  email: "admin@example.com", // Email del administrador
  nombre: "Juan Pérez",     // Nombre del administrador
  type: "admin"             // Tipo de usuario
}
```

## Códigos de Error

### Errores de Token

| Código | Descripción |
|--------|-------------|
| `MISSING_TOKEN` | No se proporcionó token de autorización |
| `TOKEN_EXPIRED` | El token ha expirado |
| `MALFORMED_TOKEN` | Token con formato inválido |
| `INVALID_TOKEN_TYPE` | Token no válido para administradores |

### Errores de Autenticación

| Código | Descripción |
|--------|-------------|
| `INVALID_CREDENTIALS` | Email o contraseña incorrectos |
| `ACCOUNT_DISABLED` | Cuenta de administrador desactivada |
| `ADMIN_NOT_FOUND` | Administrador no encontrado |

## Implementación en Frontend

### 1. Login y Almacenamiento de Token

```javascript
// Login
const loginAdmin = async (correo, contrasena) => {
  try {
    const response = await fetch('/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, contrasena })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Guardar token en localStorage o sessionStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

### 2. Interceptor para Requests Automáticos

```javascript
// Función para hacer requests autenticados
const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No hay token de administrador');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      const renewResult = await renewToken();
      if (renewResult.success) {
        // Reintentar request con nuevo token
        headers.Authorization = `Bearer ${renewResult.token}`;
        return fetch(url, { ...options, headers });
      } else {
        // Redirigir a login
        logout();
        throw new Error('Sesión expirada');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error en request autenticado:', error);
    throw error;
  }
};
```

### 3. Renovación Automática de Token

```javascript
const renewToken = async () => {
  try {
    const currentToken = localStorage.getItem('adminToken');
    
    const response = await fetch('/auth/admin/refresh-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error renovando token:', error);
    return { success: false, error: error.message };
  }
};
```

### 4. Logout

```javascript
const logout = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      await fetch('/auth/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // Limpiar storage local
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Redirigir a página de login
    window.location.href = '/admin/login';
  }
};
```

## Seguridad

### Mejores Prácticas

1. **Almacenamiento Seguro**: Usar `httpOnly` cookies en producción
2. **HTTPS**: Siempre usar HTTPS en producción
3. **Rotación de Secretos**: Cambiar `JWT_SECRET` periódicamente
4. **Validación**: Verificar que el administrador sigue activo en cada request
5. **Logging**: Registrar todos los eventos de autenticación

### Configuración de Producción

```bash
# Usar un secreto fuerte en producción
JWT_SECRET=una-clave-super-secreta-de-al-menos-64-caracteres-para-produccion

# Tiempos de expiración apropiados
JWT_ADMIN_EXPIRES_IN=4h

# Variables adicionales para producción
NODE_ENV=production
```

## Testing

### Ejemplos de Uso con Postman

1. **Login Admin**:
   - Method: POST
   - URL: `{{base_url}}/auth/admin/login`
   - Body: `{"correo": "admin@test.com", "contrasena": "password123"}`

2. **Get Profile**:
   - Method: GET
   - URL: `{{base_url}}/auth/admin/profile`
   - Headers: `Authorization: Bearer {{token}}`

3. **Refresh Token**:
   - Method: POST
   - URL: `{{base_url}}/auth/admin/refresh-token`
   - Headers: `Authorization: Bearer {{token}}`

## Migración desde Sistema Anterior

Si estás migrando desde el sistema de tokens simples:

1. Mantén las rutas de restablecimiento de contraseña existentes
2. Agrega las nuevas rutas JWT gradualmente
3. Actualiza el frontend para usar los nuevos endpoints
4. Prueba thoroughly antes de deprecar el sistema anterior

## Soporte

Para dudas o problemas con la implementación JWT:

1. Verifica la configuración de variables de entorno
2. Revisa los logs del servidor para errores específicos
3. Usa las herramientas de debugging de JWT (jwt.io)
4. Consulta la documentación de jsonwebtoken

---

**Última actualización**: Junio 23, 2025
**Versión**: 1.0.0
