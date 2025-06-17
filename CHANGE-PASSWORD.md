# 🔐 Sistema de Cambio de Contraseña para Usuarios Autenticados

## 🔄 Descripción General

Este sistema permite a los usuarios y administradores autenticados cambiar sus contraseñas proporcionando su contraseña actual y la nueva contraseña deseada.

---

## 🔗 Endpoints

### 1. Cambiar Contraseña (Usuario)
**PUT** `/auth/change-password`

**Request:**
```json
{
  "id_usuario": 1,
  "contrasenaActual": "miPasswordActual123",
  "nuevaContrasena": "miNuevaPassword456!"
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "usuario": "Juan Pérez",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correo_confirmacion": "enviado"
}
```

### 2. Cambiar Contraseña (Administrador)
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
  "administrador": "Admin Juan",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correo_confirmacion": "enviado",
  "tipo_usuario": "administrador"
}
```

---

## 🔒 Validaciones y Seguridad

### Validaciones de Entrada
- ✅ **Campos requeridos**: ID, contraseña actual y nueva contraseña
- ✅ **Longitud mínima**: Nueva contraseña debe tener al menos 8 caracteres
- ✅ **Contraseña actual**: Debe ser correcta para el usuario/admin
- ✅ **Contraseña diferente**: Nueva contraseña debe ser diferente a la actual

### Características de Seguridad
- 🔐 **Encriptación**: bcrypt con saltRounds 12
- 🛡️ **Verificación**: Contraseña actual validada antes del cambio
- 📧 **Notificación**: Correo de confirmación automático
- 🔍 **Auditoría**: Logs detallados de cada cambio
- ⚡ **Separación**: Endpoints distintos para usuarios y admins

---

## 📧 Notificaciones por Correo

### Para Usuarios
- **Template**: Diseño estándar de Mama Mian Pizza
- **Subject**: "✅ Contraseña Actualizada - Mama Mian Pizza"
- **Contenido**: Confirmación de cambio con información de seguridad

### Para Administradores
- **Template**: Diseño corporativo específico para admins
- **Subject**: "✅ Contraseña Admin Actualizada - Mama Mian Pizza"
- **Contenido**: Confirmación con advertencias de seguridad adicionales

---

## 🧪 Pruebas

### Script de Pruebas
```bash
# Probar cambio de usuario
node test-change-password.js user

# Probar cambio de admin
node test-change-password.js admin

# Probar validaciones
node test-change-password.js validations

# Mostrar información
node test-change-password.js info
```

### Casos de Prueba
1. ✅ **Cambio exitoso**: Todos los campos válidos
2. ❌ **Contraseña incorrecta**: Contraseña actual inválida
3. ❌ **Contraseña corta**: Nueva contraseña < 8 caracteres
4. ❌ **Misma contraseña**: Nueva igual a la actual
5. ❌ **Campos faltantes**: Request incompleto
6. ❌ **Usuario/Admin inexistente**: ID no válido

---

## 🔄 Diferencias con Reset Password

| Aspecto | Change Password | Reset Password |
|---------|----------------|----------------|
| **Autenticación** | Requiere contraseña actual | Código OTP por email |
| **Uso** | Usuario logueado | Usuario olvidó contraseña |
| **Validación** | Contraseña actual | Token temporal |
| **Seguridad** | Inmediato | Proceso multi-paso |
| **Casos** | Cambio rutinario | Recuperación |

---

## 📋 Códigos de Respuesta

### Éxito
- **200**: Contraseña cambiada exitosamente

### Errores de Cliente
- **400**: Datos inválidos o faltantes
- **401**: Contraseña actual incorrecta
- **404**: Usuario/Admin no encontrado

### Errores de Servidor
- **500**: Error interno del servidor

---

## 🛠️ Implementación Frontend

### JavaScript/Fetch
```javascript
const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await fetch('/api/auth/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario: userId,
      contrasenaActual: currentPassword,
      nuevaContrasena: newPassword
    })
  });
  return response.json();
};
```

### React Hook Ejemplo
```jsx
const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const result = await changePasswordAPI(currentPassword, newPassword);
      // Manejar éxito
      return result;
    } catch (error) {
      // Manejar error
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { changePassword, loading };
};
```

---

## 💡 Mejores Prácticas

### Para Desarrolladores
1. **Validar en frontend**: Contraseña mínimo 8 caracteres
2. **Mostrar fuerza**: Indicador de fortaleza de contraseña
3. **Confirmar nueva**: Campo de confirmación de nueva contraseña
4. **Feedback claro**: Mensajes de error específicos
5. **Loading states**: Indicadores durante el proceso

### Para Usuarios
1. **Contraseña segura**: Combinación de letras, números y símbolos
2. **Cambio regular**: Actualizar cada 3-6 meses
3. **Única**: No reutilizar contraseñas anteriores
4. **Confidencial**: No compartir credenciales

---

## 🔧 Troubleshooting

### Error: "Contraseña actual incorrecta"
- ✅ Verificar que la contraseña actual sea correcta
- ✅ Revisar que no haya espacios adicionales
- ✅ Confirmar que se está usando el usuario correcto

### Error: "Nueva contraseña muy corta"
- ✅ Asegurar mínimo 8 caracteres
- ✅ Incluir combinación de caracteres

### Error: "Usuario no encontrado"
- ✅ Verificar que el ID sea válido
- ✅ Confirmar que el usuario existe en la base de datos

---

## ✅ Estado de Implementación

- ✅ **Backend completo**: Endpoints para usuarios y admins
- ✅ **Validaciones**: Seguridad y fortaleza de contraseña
- ✅ **Notificaciones**: Correos de confirmación
- ✅ **Scripts de prueba**: Testing completo
- ✅ **Documentación**: Completa y detallada
- 🔄 **Frontend**: Pendiente según necesidades del proyecto

**Sistema listo para uso en producción** 🎉
