# 👨‍💼 Sistema de Restablecimiento de Contraseña para Administradores

## 🔄 Descripción General

Este sistema extiende la funcionalidad de restablecimiento de contraseña para incluir específicamente a los **administradores** de Mama Mian Pizza, con endpoints, templates y validaciones personalizadas.

---

## 🔗 Endpoints para Administradores

### 1. Solicitar Código de Restablecimiento (Admin)
**POST** `/auth/admin/request-reset`

**Request:**
```json
{
  "correo": "admin@mamamianpizza.com"
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Código de verificación de administrador enviado a tu correo electrónico",
  "correo": "ad***@mamamianpizza.com",
  "validez_minutos": 10,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tipo_usuario": "administrador"
}
```

**Diferencias con usuarios:**
- ✅ Busca en tabla `administradores` (no `usuarios`)
- ✅ Usa `user_type = 'administrador'` en `password_reset`
- ✅ Template de correo específico para admins
- ✅ Subject: "🔐 Código Admin - Restablecimiento de Contraseña"

---

### 2. Verificar Código OTP (Admin)
**POST** `/auth/admin/verify-reset`

**Request:**
```json
{
  "correo": "admin@mamamianpizza.com",
  "otp": "123456"
}
```

**Response Exitoso:**
```json
{
  "message": "Código de administrador verificado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": "15 minutos",
  "tipo_usuario": "administrador"
}
```

**Validaciones específicas:**
- ✅ Verifica tabla `administradores`
- ✅ Valida `user_type = 'administrador'`
- ✅ Token con estructura específica para admin

---

### 3. Restablecer Contraseña (Admin)
**PUT** `/auth/admin/reset-password`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nuevaContrasena": "newAdminPassword123!"
}
```

**Response Exitoso:**
```json
{
  "success": true,
  "message": "Contraseña de administrador restablecida exitosamente",
  "administrador": "Juan Pérez",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "correo_confirmacion": "enviado",
  "tipo_usuario": "administrador"
}
```

**Características especiales:**
- ✅ Mayor encriptación (`saltRounds: 12` vs `10`)
- ✅ Actualiza tabla `administradores`
- ✅ Correo de confirmación con template admin
- ✅ Logs específicos para administradores

---

## 🎨 Templates de Correo para Administradores

### Template de Código de Verificación
- **Colores:** Marrón/Dorado (corporativo)
- **Badge:** "👨‍💼 ADMINISTRADOR"
- **Header:** "Sistema de Administración"
- **Warnings:** Seguridad específica para admins

### Template de Confirmación
- **Colores:** Verde corporativo
- **Información:** Específica para administradores
- **Contacto:** admin@mamamianpizza.com

---

## 🗄️ Estructura de Base de Datos

### Tabla `administradores`
```sql
- id_admin (PK)
- nombre
- correo
- contrasena
- rol
- telefono
```

### Tabla `password_reset` (extendida)
```sql
- user_id      # id_admin para administradores
- user_type    # 'administrador' para admins
- reset_code   # Código OTP de 6 dígitos
- expiracion   # 10 minutos desde creación
- used         # 0/1 para control de uso único
```

---

## 🧪 Pruebas del Sistema

### Script de Pruebas
```bash
# Flujo completo
node test-password-reset-admin.js --full

# Solo envío de código
node test-password-reset-admin.js --request-only

# Comparar user vs admin
node test-password-reset-admin.js --compare

# Probar validaciones
node test-password-reset-admin.js --validations

# Mostrar características
node test-password-reset-admin.js --features
```

### Casos de Prueba
1. ✅ **Correo válido de admin** → Código enviado
2. ✅ **Correo no existe en admins** → Error 404
3. ✅ **Formato de correo inválido** → Error 400
4. ✅ **Código OTP correcto** → Token generado
5. ✅ **Código OTP expirado** → Error 400
6. ✅ **Token válido** → Contraseña actualizada

---

## 🔒 Características de Seguridad

### Para Administradores
- **Encriptación mejorada:** `bcrypt` con `saltRounds: 12`
- **Validaciones estrictas:** Solo tabla `administradores`
- **Logs específicos:** Identificación clara de operaciones admin
- **Templates diferenciados:** Warnings de seguridad adicionales
- **Contacto directo:** admin@mamamianpizza.com para reportes

### Separación de Usuarios
- **Usuarios regulares:** `/auth/*` endpoints
- **Administradores:** `/auth/admin/*` endpoints
- **Tabla diferente:** `usuarios` vs `administradores`
- **Templates diferentes:** Diseño y contenido específico

---

## 📋 Diferencias Usuario vs Administrador

| Característica | Usuario | Administrador |
|----------------|---------|---------------|
| **Endpoint base** | `/auth/` | `/auth/admin/` |
| **Tabla BD** | `usuarios` | `administradores` |
| **user_type** | `'usuario'` | `'administrador'` |
| **saltRounds** | `10` | `12` |
| **Colores template** | Naranja/Rojo | Marrón/Dorado |
| **Badge** | Usuario | 👨‍💼 ADMINISTRADOR |
| **Contacto** | Soporte general | admin@mamamianpizza.com |

---

## 🚀 Implementación en Frontend

### React - Formulario Admin
```jsx
// Solicitar código para admin
const requestAdminReset = async (correo) => {
  const response = await fetch('/api/auth/admin/request-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  });
  return response.json();
};

// Verificar código admin
const verifyAdminOTP = async (correo, otp) => {
  const response = await fetch('/api/auth/admin/verify-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, otp })
  });
  return response.json();
};

// Cambiar contraseña admin
const resetAdminPassword = async (token, nuevaContrasena) => {
  const response = await fetch('/api/auth/admin/reset-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nuevaContrasena })
  });
  return response.json();
};
```

---

## 📞 Soporte y Contacto

Para administradores:
- **Email:** admin@mamamianpizza.com
- **Sistema:** Panel de administración
- **Documentación:** Este archivo

Para usuarios regulares:
- **Sistema:** Flujo regular de usuario
- **Endpoints:** `/auth/*` (sin `/admin/`)

---

## ✅ Estado de Implementación

- ✅ **Backend completo:** Endpoints, validaciones, seguridad
- ✅ **Templates de correo:** Diseño específico para admins
- ✅ **Base de datos:** Soporte para `user_type = 'administrador'`
- ✅ **Scripts de prueba:** Testing completo del flujo
- ✅ **Documentación:** Completa y detallada
- 🔄 **Frontend:** Pendiente de implementación según necesidades

**Sistema listo para uso en producción** 🎉
