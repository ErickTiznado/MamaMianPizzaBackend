# 👨‍💼 Sistema de Cambio de Contraseña para Administradores

## 🔄 Descripción General

Este sistema permite a los **administradores autenticados** de Mama Mian Pizza cambiar su contraseña de forma segura, proporcionando su contraseña actual y la nueva contraseña deseada.

**Diferencia clave:** Este es para cambio directo (no de recuperación) para administradores que conocen su contraseña actual.

---

## 🔗 Endpoint para Administradores

### Cambiar Contraseña (Administrador Autenticado)
**PUT** `/auth/admin/change-password`

**Request:**
```json
{
  "id_admin": 1,
  "contrasenaActual": "adminPasswordActual123",
  "nuevaContrasena": "adminNuevaPassword456!"
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Contraseña de administrador cambiada exitosamente",
  "administrador": "Juan Pérez",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correo_confirmacion": "enviado",
  "tipo_usuario": "administrador"
}
```

**Errores Comunes:**
```json
// ID de admin faltante (400)
{
  "message": "ID de administrador, contraseña actual y nueva contraseña son requeridos"
}

// Contraseña muy corta (400)
{
  "message": "La nueva contraseña debe tener al menos 8 caracteres"
}

// Administrador no encontrado (404)
{
  "message": "Administrador no encontrado"
}

// Contraseña actual incorrecta (401)
{
  "message": "La contraseña actual es incorrecta"
}

// Misma contraseña (400)
{
  "message": "La nueva contraseña debe ser diferente a la contraseña actual"
}
```

---

## 🔒 Validaciones y Seguridad

### Validaciones de Entrada
- ✅ **ID de administrador**: Requerido (tabla `administradores`)
- ✅ **Contraseña actual**: Debe ser correcta para el admin
- ✅ **Nueva contraseña**: Mínimo 8 caracteres
- ✅ **Contraseña diferente**: Nueva contraseña debe ser diferente a la actual

### Características de Seguridad para Administradores
- 🔐 **Encriptación reforzada**: bcrypt con `saltRounds: 12` (vs 10 para usuarios)
- 🛡️ **Verificación estricta**: Contraseña actual validada antes del cambio
- 📧 **Notificación premium**: Correo con template corporativo específico
- 🔍 **Auditoría detallada**: Logs específicos para operaciones de admin
- ⚡ **Tabla separada**: Usa tabla `administradores` (no `usuarios`)

---

## 📧 Notificación por Correo

### Template para Administradores
- **Subject**: "✅ Contraseña Admin Actualizada - Mama Mian Pizza"
- **Diseño**: Colores corporativos (marrón/dorado)
- **Badge**: "👨‍💼 ADMINISTRADOR"
- **Contenido**: 
  - Confirmación del cambio
  - Información de seguridad reforzada
  - Advertencias específicas para admins
  - Contacto directo: admin@mamamianpizza.com

### Diferencias con Usuario Regular
| Característica | Usuario | Administrador |
|----------------|---------|---------------|
| **Subject** | "Contraseña Actualizada" | "Contraseña Admin Actualizada" |
| **Colores** | Naranja/Rojo | Marrón/Dorado |
| **Badge** | Usuario | 👨‍💼 ADMINISTRADOR |
| **Contacto** | Soporte general | admin@mamamianpizza.com |
| **Warnings** | Estándar | Reforzados |

---

## 🗄️ Estructura de Base de Datos

### Tabla `administradores`
```sql
CREATE TABLE `administradores` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,  -- Encriptación saltRounds: 12
  `rol` varchar(50) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `correo` (`correo`)
);
```

### Diferencias con tabla `usuarios`
- **Campo ID**: `id_admin` (no `id_usuario`)
- **Encriptación**: Mayor seguridad (`saltRounds: 12`)
- **Validaciones**: Específicas para administradores

---

## 🧪 Pruebas del Sistema

### Script de Pruebas
```bash
# Probar cambio exitoso
node test-change-password-admin.js --test

# Probar todas las validaciones
node test-change-password-admin.js --validations

# Comparar user vs admin
node test-change-password-admin.js --compare

# Mostrar características
node test-change-password-admin.js --features
```

### Casos de Prueba
1. ✅ **Cambio exitoso** → Contraseña actualizada y correo enviado
2. ✅ **ID faltante** → Error 400
3. ✅ **Contraseña actual incorrecta** → Error 401
4. ✅ **Admin no existe** → Error 404
5. ✅ **Contraseña muy corta** → Error 400
6. ✅ **Misma contraseña** → Error 400

---

## 📋 Diferencias Usuario vs Administrador

| Característica | Usuario | Administrador |
|----------------|---------|---------------|
| **Endpoint** | `/auth/change-password` | `/auth/admin/change-password` |
| **Campo ID** | `id_usuario` | `id_admin` |
| **Tabla BD** | `usuarios` | `administradores` |
| **saltRounds** | `10` | `12` |
| **Template** | Usuario estándar | Admin corporativo |
| **Validaciones** | Estándar | Reforzadas |
| **Logs** | Usuario | Administrador |

---

## 🚀 Implementación en Frontend

### React - Formulario Admin
```jsx
const changeAdminPassword = async (id_admin, contrasenaActual, nuevaContrasena) => {
  const response = await fetch('/api/auth/admin/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_admin, contrasenaActual, nuevaContrasena })
  });
  return response.json();
};

// Ejemplo de uso
const handleAdminPasswordChange = async (formData) => {
  try {
    const result = await changeAdminPassword(
      formData.adminId,
      formData.currentPassword,
      formData.newPassword
    );
    
    if (result.success) {
      toast.success(`Contraseña actualizada para ${result.administrador}`);
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Validaciones Frontend
```javascript
const validateAdminPasswordForm = (data) => {
  const errors = {};
  
  if (!data.adminId) errors.adminId = 'ID de administrador requerido';
  if (!data.currentPassword) errors.currentPassword = 'Contraseña actual requerida';
  if (!data.newPassword) errors.newPassword = 'Nueva contraseña requerida';
  if (data.newPassword && data.newPassword.length < 8) {
    errors.newPassword = 'Mínimo 8 caracteres';
  }
  if (data.newPassword === data.currentPassword) {
    errors.newPassword = 'Debe ser diferente a la actual';
  }
  
  return errors;
};
```

---

## 💡 Mejores Prácticas

### Para Desarrolladores
1. **Validar permisos**: Verificar que solo admins puedan usar este endpoint
2. **Logging detallado**: Registrar todos los cambios de contraseña admin
3. **Rate limiting**: Limitar intentos por IP/admin
4. **Sesiones**: Invalidar sesiones activas tras cambio
5. **Auditoría**: Mantener registro de cambios

### Para Administradores
1. **Contraseña segura**: Mínimo 12 caracteres con símbolos
2. **Cambio regular**: Actualizar cada 2-3 meses
3. **Única**: No reutilizar contraseñas anteriores
4. **Confidencial**: No compartir credenciales administrativas
5. **2FA**: Implementar autenticación de dos factores cuando sea posible

---

## 📞 Soporte y Contacto

Para administradores:
- **Email:** admin@mamamianpizza.com
- **Sistema:** Panel de administración
- **Documentación:** Este archivo

Para desarrolladores:
- **Logs:** Verificar en consola del servidor
- **Errores:** Tabla de errores comunes incluida
- **Testing:** Script de pruebas incluido

---

## ✅ Estado de Implementación

- ✅ **Backend completo:** Endpoint funcional con validaciones
- ✅ **Seguridad reforzada:** saltRounds 12 para administradores
- ✅ **Templates de correo:** Diseño específico corporativo
- ✅ **Base de datos:** Soporte completo para tabla administradores
- ✅ **Scripts de prueba:** Testing completo del flujo
- ✅ **Documentación:** Completa y detallada
- ✅ **Diferenciación:** Separado del sistema de usuarios
- 🔄 **Frontend:** Pendiente según necesidades del proyecto

**Sistema listo para uso en producción** 🎉

---

## 🔗 Endpoints Relacionados

### Sistema Completo de Administradores
- `POST /auth/admin/request-reset` - Solicitar código de recuperación
- `POST /auth/admin/verify-reset` - Verificar código OTP
- `PUT /auth/admin/reset-password` - Restablecer con token
- `PUT /auth/admin/change-password` - **Cambiar contraseña directa** ⭐

### Sistema de Usuarios (separado)
- `PUT /auth/change-password` - Cambio de contraseña usuarios
- `POST /auth/request-reset` - Sistema de recuperación usuarios
