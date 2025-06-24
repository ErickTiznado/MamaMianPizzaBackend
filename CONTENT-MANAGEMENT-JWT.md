# Sistema de Gestión de Contenido con JWT

## 📋 Resumen de Cambios Implementados

Se ha actualizado el `contentController.js` para implementar autenticación JWT y logging mejorado con información del usuario.

## 🔐 Autenticación Implementada

### Rutas Públicas (Sin autenticación)
- ✅ `GET /content/MostPopular` - Obtener productos más populares
- ✅ `GET /content/recomendacion` - Obtener recomendaciones de la casa
- ✅ `GET /content/getMenu` - Obtener menú completo
- ✅ `GET /content/totalProducts` - Obtener total de productos

### Rutas Protegidas (Requieren JWT de Administrador)
- 🔒 `POST /content/submit` - Crear nuevo producto
- 🔒 `PUT /content/updateContent/:id_producto` - Actualizar producto
- 🔒 `DELETE /content/deleteContent/:id_producto` - Eliminar producto

## 📝 Sistema de Logging Mejorado

### Información Capturada en Logs
```javascript
// Para administradores autenticados
[ADMIN] Juan Pérez (admin@mamamianpizza.com): Producto creado: "Pizza Margarita" (ID: 15)

// Para usuarios anónimos (rutas públicas)
[ANONIMO]: Menú consultado exitosamente - 25 registros encontrados
```

### Funciones de Logging Actualizadas
- `getUserInfo(req)` - Obtiene información completa del usuario
- `logAction(req, accion, tabla, descripcion)` - Registra acciones con contexto de usuario

## 🚀 Cómo Usar las Rutas Protegidas

### 1. Obtener Token JWT
```bash
POST /auth/admin/login
{
    "correo": "admin@mamamianpizza.com",
    "contrasena": "tu_contraseña"
}
```

Respuesta:
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
        "id": 1,
        "nombre": "Admin",
        "correo": "admin@test.com"
    }
}
```

### 2. Usar Token en Requests
```bash
# Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Ejemplo: Crear producto
POST /content/submit
Authorization: Bearer tu-token-jwt
Content-Type: multipart/form-data

{
    "titulo": "Pizza Hawaiana",
    "descripcion": "Deliciosa pizza con piña y jamón",
    "categoria": "Especiales",
    "sesion": "Las más populares",
    "precios": {
        "1": "8.50",
        "2": "12.00",
        "3": "15.50"
    },
    "activo": true,
    "imagen": [archivo de imagen]
}
```

## 🔧 Configuración Requerida

### Variables de Entorno
```bash
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_ADMIN_EXPIRES_IN=8h
```

### Middleware en Rutas
```javascript
const { verifyAdminToken } = require('../contollers/authController');

// Aplicar a rutas que requieren autenticación
router.post('/submit', verifyAdminToken, contentController.submitContent);
```

## 📊 Logs Detallados por Operación

### Creación de Productos
```
[ADMIN] Juan Pérez (admin@mamamianpizza.com): Producto creado: "Pizza Margarita" (ID: 15) en categoría "Clásicas" con 3 precios configurados
```

### Actualización de Productos
```
[ADMIN] María García (maria@mamamianpizza.com): Producto actualizado: "Pizza Pepperoni" (ID: 8) en categoría "Clásicas" con 3 precios actualizados
```

### Eliminación de Productos
```
[ADMIN] Carlos López (carlos@mamamianpizza.com): Producto eliminado (ID: 12) junto con 3 precios asociados
```

### Consultas Públicas
```
[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados
[ANONIMO]: Menú consultado exitosamente - 25 registros encontrados
```

## 🛡️ Seguridad Implementada

- ✅ **Autenticación JWT** para operaciones administrativas
- ✅ **Validación de tokens** con middleware
- ✅ **Logging completo** de todas las operaciones
- ✅ **Separación de rutas** públicas y privadas
- ✅ **Información de usuario** en todos los logs

## 📋 Testing

Para probar las rutas protegidas:

1. **Login como administrador**
2. **Copiar el token JWT**
3. **Incluir en headers**: `Authorization: Bearer [token]`
4. **Realizar operaciones** (crear, actualizar, eliminar)
5. **Verificar logs** en la base de datos

## 🔄 Próximos Pasos

1. Implementar autenticación para usuarios regulares (no admin)
2. Agregar roles y permisos más granulares
3. Implementar rate limiting para rutas públicas
4. Agregar auditoría de cambios de precio
