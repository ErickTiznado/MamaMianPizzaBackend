# GESTIÓN DE CUENTAS DE USUARIO - API DOCUMENTATION

## Descripción
Sistema para gestionar el estado de las cuentas de usuario (activar/desactivar) y validar que solo las cuentas activas puedan iniciar sesión.

## Migración de Base de Datos Requerida

Antes de usar estos endpoints, ejecuta el siguiente script SQL:

```sql
-- Agregar columna activo a la tabla usuarios
ALTER TABLE `usuarios` 
ADD COLUMN `activo` tinyint(1) NOT NULL DEFAULT '1' 
AFTER `foto_perfil`;

-- Actualizar registros existentes
UPDATE `usuarios` SET `activo` = 1 WHERE `activo` IS NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX idx_usuarios_activo ON `usuarios` (`activo`);
```

## Endpoints Disponibles

### 1. Desactivar Cuenta de Usuario
**PUT** `/api/account/deactivate`

Desactiva la cuenta de un usuario específico.

**Request Body:**
```json
{
    "id_usuario": 12,
    "motivo": "Solicitud del usuario"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Cuenta desactivada exitosamente",
    "usuario": {
        "id": 12,
        "nombre": "Erick Mauricio",
        "correo": "tiznadoerick3@gmail.com",
        "activo": false
    },
    "motivo": "Solicitud del usuario",
    "timestamp": "2025-06-23T15:30:00.000Z"
}
```

### 2. Reactivar Cuenta de Usuario
**PUT** `/api/account/activate`

Reactiva la cuenta de un usuario específico.

**Request Body:**
```json
{
    "id_usuario": 12,
    "motivo": "Reactivación autorizada por administrador"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Cuenta activada exitosamente",
    "usuario": {
        "id": 12,
        "nombre": "Erick Mauricio",
        "correo": "tiznadoerick3@gmail.com",
        "activo": true
    },
    "motivo": "Reactivación autorizada por administrador",
    "timestamp": "2025-06-23T15:35:00.000Z"
}
```

### 3. Verificar Estado de Cuenta
**GET** `/api/account/status/:id_usuario`

Obtiene el estado actual de una cuenta de usuario.

**Response (200):**
```json
{
    "success": true,
    "usuario": {
        "id": 12,
        "nombre": "Erick Mauricio",
        "correo": "tiznadoerick3@gmail.com",
        "activo": true,
        "estado": "Activa"
    }
}
```

### 4. Login con Validación de Cuenta Activa
**POST** `/api/account/login`

Permite el inicio de sesión solo para cuentas activas.

**Request Body:**
```json
{
    "correo": "tiznadoerick3@gmail.com",
    "contrasena": "mipassword123"
}
```

**Response Exitoso (200):**
```json
{
    "success": true,
    "message": "Inicio de sesión exitoso",
    "usuario": {
        "id": 12,
        "nombre": "Erick Mauricio",
        "correo": "tiznadoerick3@gmail.com",
        "activo": true
    },
    "timestamp": "2025-06-23T15:40:00.000Z"
}
```

**Response Cuenta Desactivada (403):**
```json
{
    "success": false,
    "message": "Tu cuenta ha sido desactivada. Contacta al administrador para más información.",
    "codigo_error": "ACCOUNT_DEACTIVATED"
}
```

### 5. Listar Usuarios con Estado
**GET** `/api/account/list`

Lista todos los usuarios con su estado de activación, con paginación.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Usuarios por página (default: 10)
- `activo` (opcional): Filtrar por estado (true/false)

**Ejemplos:**
- `/api/account/list` - Todos los usuarios
- `/api/account/list?activo=1` - Solo usuarios activos
- `/api/account/list?activo=0&page=2&limit=5` - Usuarios inactivos, página 2, 5 por página

**Response (200):**
```json
{
    "success": true,
    "usuarios": [
        {
            "id": 12,
            "nombre": "Erick Mauricio",
            "correo": "tiznadoerick3@gmail.com",
            "celular": "70830446",
            "activo": true,
            "estado": "Activa"
        },
        {
            "id": 4,
            "nombre": "milena zelaya",
            "correo": "nathy.zelaya55@gmail.com",
            "celular": "70141812",
            "activo": false,
            "estado": "Desactivada"
        }
    ],
    "paginacion": {
        "pagina_actual": 1,
        "total_paginas": 3,
        "total_usuarios": 15,
        "usuarios_por_pagina": 10
    }
}
```

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 400 | Datos de entrada inválidos |
| 401 | Credenciales inválidas |
| 403 | Cuenta desactivada |
| 404 | Usuario no encontrado |
| 500 | Error interno del servidor |

## Logs del Sistema

Todas las operaciones de activación/desactivación se registran automáticamente en la tabla `logs` con los siguientes datos:
- `id_usuario`: ID del usuario afectado
- `accion`: ACTIVAR_CUENTA o DESACTIVAR_CUENTA
- `tabla_afectada`: usuarios
- `descripcion`: Motivo de la operación

## Consideraciones de Seguridad

1. **Autorización**: Estos endpoints deberían estar protegidos con middleware de autenticación de administrador.
2. **Validación**: Se validan todos los datos de entrada.
3. **Logs**: Todas las operaciones quedan registradas para auditoría.
4. **Estados**: Una vez desactivada una cuenta, el usuario no puede iniciar sesión hasta ser reactivado.

## Integración Frontend

Para integrar en tu frontend, usa el endpoint `/api/account/login` en lugar del endpoint de login regular para asegurar que solo las cuentas activas puedan acceder al sistema.

```javascript
// Ejemplo de uso en JavaScript
const login = async (correo, contrasena) => {
    try {
        const response = await fetch('/api/account/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contrasena })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Login exitoso
            console.log('Usuario autenticado:', data.usuario);
        } else {
            if (data.codigo_error === 'ACCOUNT_DEACTIVATED') {
                // Mostrar mensaje específico para cuenta desactivada
                alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
            } else {
                // Otros errores de login
                alert(data.message);
            }
        }
    } catch (error) {
        console.error('Error en login:', error);
    }
};
```
