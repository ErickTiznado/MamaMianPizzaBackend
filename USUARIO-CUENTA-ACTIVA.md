# Sistema de Control de Cuentas Activas - Usuarios

## Descripción
Este sistema permite a los administradores activar/desactivar cuentas de usuarios normales y previene el login de usuarios con cuentas inactivas.

## Cambios Realizados

### 1. Base de Datos
Se agregaron los siguientes campos a la tabla `usuarios`:
- `activo`: TINYINT(1) NOT NULL DEFAULT 1 - Controla si la cuenta está activa (1=activo, 0=inactivo)
- `ultimo_acceso`: TIMESTAMP NULL DEFAULT NULL - Registra la última vez que el usuario inició sesión

### 2. Migración SQL
Archivo: `migrations/add_active_field_to_usuarios.sql`
```sql
-- Ejecutar esta migración para agregar los campos necesarios
ALTER TABLE `usuarios` 
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 
COMMENT 'Campo para controlar si la cuenta del usuario está activa (1=activo, 0=inactivo)';

ALTER TABLE `usuarios` 
ADD COLUMN `ultimo_acceso` TIMESTAMP NULL DEFAULT NULL
COMMENT 'Campo para registrar la última vez que el usuario inició sesión';

-- Índices para optimización
CREATE INDEX idx_usuarios_correo_activo ON usuarios(correo, activo);
CREATE INDEX idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso);
```

### 3. Modificaciones en Login de Usuarios
**Archivo modificado**: `contollers/userControllers.js`

#### Función `loginClient`
- Ahora verifica si `user.activo === 0` antes de permitir el login
- Si la cuenta está inactiva, retorna error 403 con mensaje específico
- Registra intentos de login con cuentas inactivas en los logs
- Actualiza `ultimo_acceso` en logins exitosos

#### Función `createClient`
- Los nuevos usuarios se crean con `activo = 1` por defecto
- Se registra la creación del usuario en los logs

### 4. Nuevas Funciones Administrativas
**Archivo modificado**: `contollers/authController.js`

#### `toggleUserActiveStatus` (POST)
Permite a los administradores activar/desactivar cuentas de usuarios.

**Endpoint sugerido**: `POST /admin/users/toggle-active`

**Middleware requerido**: `verifyAdminToken`

**Cuerpo de la petición**:
```json
{
  "id_usuario": 12,
  "activo": false
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "usuario": {
    "id_usuario": 12,
    "nombre": "Juan Pérez",
    "correo": "juan@email.com",
    "activo": 0,
    "estado_anterior": 1
  },
  "admin_accion": {
    "admin_id": 1,
    "admin_nombre": "Admin Principal",
    "timestamp": "2025-06-24T10:30:00.000Z"
  }
}
```

#### `getUsersWithActiveStatus` (GET)
Permite a los administradores consultar usuarios con su estado activo.

**Endpoint sugerido**: `GET /admin/users/with-status`

**Middleware requerido**: `verifyAdminToken`

**Parámetros de consulta**:
- `page`: Número de página (default: 1)
- `limit`: Límite por página (default: 10)
- `activo`: Filtro por estado ('true', 'false', o no especificar para todos)

**Ejemplo**: `GET /admin/users/with-status?page=1&limit=20&activo=true`

**Respuesta**:
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "usuarios": [
      {
        "id_usuario": 12,
        "nombre": "Juan Pérez",
        "correo": "juan@email.com",
        "celular": "70000000",
        "activo": 1,
        "ultimo_acceso": "2025-06-24T09:15:30.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Códigos de Error

### Login con Cuenta Inactiva
**Código HTTP**: 403 Forbidden
```json
{
  "success": false,
  "message": "Su cuenta ha sido desactivada. Contacte al administrador para más información.",
  "code": "ACCOUNT_INACTIVE"
}
```

## Logs del Sistema
Todas las acciones relacionadas con el estado de cuentas se registran en la tabla `logs`:

### Tipos de Acciones Registradas:
- `LOGIN_INACTIVE_ACCOUNT`: Intento de login con cuenta inactiva
- `USER_ACTIVATED`: Admin activa una cuenta de usuario
- `USER_DEACTIVATED`: Admin desactiva una cuenta de usuario
- `ADMIN_VIEW_USERS`: Admin consulta lista de usuarios
- `USER_CREATED`: Nuevo usuario registrado

## Rutas Sugeridas
Para implementar estas funcionalidades, agregar a `routes/adminRoutes.js`:

```javascript
const { verifyAdminToken } = require('../contollers/authController');
const { toggleUserActiveStatus, getUsersWithActiveStatus } = require('../contollers/authController');

// Gestión de estado activo de usuarios
router.post('/users/toggle-active', verifyAdminToken, toggleUserActiveStatus);
router.get('/users/with-status', verifyAdminToken, getUsersWithActiveStatus);
```

## Uso Recomendado

### 1. Para Desactivar una Cuenta
Útil cuando:
- Un usuario viola las políticas de uso
- Se detecta actividad sospechosa
- El usuario solicita desactivación temporal
- Medidas disciplinarias

### 2. Para Reactivar una Cuenta
Útil cuando:
- Se resuelve un problema disciplinario
- El usuario completa un proceso de verificación
- Se confirma que la actividad sospechosa era legítima

### 3. Monitoreo
- Usar `getUsersWithActiveStatus` para auditorías regulares
- Filtrar por usuarios inactivos para revisar casos pendientes
- Revisar `ultimo_acceso` para identificar cuentas abandonadas

## Consideraciones de Seguridad

1. **Solo Administradores**: Las funciones de activación/desactivación solo están disponibles para administradores autenticados
2. **Logging Completo**: Todas las acciones se registran con detalles del administrador responsable
3. **Validación Estricta**: Se validan todos los parámetros de entrada
4. **Mensajes Informativos**: Los usuarios reciben mensajes claros sobre el estado de su cuenta
5. **Índices Optimizados**: Se crearon índices para consultas eficientes

## Próximos Pasos Sugeridos

1. **Interfaz de Administración**: Crear una interfaz web para gestionar usuarios
2. **Notificaciones**: Implementar notificaciones por email cuando se desactiva una cuenta
3. **Suspensión Temporal**: Agregar funcionalidad para suspensiones temporales con fecha de expiración
4. **Reportes**: Crear reportes de actividad de usuarios
5. **API de Auditoría**: Endpoint específico para consultar logs de activación/desactivación
