# 📧 Restablecimiento de Contraseña por Correo Electrónico

## 🔄 Flujo Actualizado

El sistema ahora utiliza **correo electrónico** en lugar de SMS para enviar códigos de verificación.

### 📋 Cambios Realizados

1. ✅ **Endpoint modificado**: Ahora usa `correo` en lugar de `celular`
2. ✅ **Validación de email**: Formato de correo válido
3. ✅ **Envío por correo**: Template HTML profesional
4. ✅ **Seguridad mejorada**: Códigos con expiración de 10 minutos

---

## 🚀 Endpoints Actualizados

### 1. Solicitar Código de Restablecimiento
**POST** `/auth/request-reset`

**Request:**
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Response Exitoso:**
```json
{
  "message": "Código de verificación enviado a tu correo electrónico",
  "correo": "us***@ejemplo.com",
  "validez_minutos": 10
}
```

### 2. Verificar Código OTP
**POST** `/auth/verify-reset`

**Request:**
```json
{
  "correo": "usuario@ejemplo.com",
  "otp": "123456"
}
```

**Response Exitoso:**
```json
{
  "message": "Código verificado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Restablecer Contraseña
**PUT** `/auth/reset-password`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nuevaContrasena": "nuevaPassword123"
}
```

---

## ⚙️ Configuración de Correo

### Variables de Entorno Necesarias

```env
# Configuración de correo
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-16-caracteres
```

### 📧 Para Gmail:

1. **Habilitar verificación en 2 pasos** en tu cuenta de Google
2. **Ir a**: Administrar cuenta → Seguridad → Verificación en 2 pasos
3. **Generar contraseña de aplicación** para "Correo"
4. **Usar esa contraseña** en `EMAIL_PASS`

### 📧 Para otros proveedores:

```javascript
// Outlook/Hotmail
service: 'outlook'

// Yahoo
service: 'yahoo'

// SMTP personalizado
host: 'smtp.tu-dominio.com',
port: 587,
secure: false
```

---

## 🎨 Template del Correo

El correo incluye:
- 🍕 **Logo/Marca** de Mama Mian Pizza
- 🔐 **Código OTP** destacado visualmente
- ⏰ **Tiempo de expiración** (10 minutos)
- 🔒 **Consejos de seguridad**
- 📱 **Diseño responsive**

---

## 🧪 Cómo Probar

### Opción 1: Script Automático
```bash
# Solo probar envío de código
node test-password-reset.js request

# Probar flujo completo
node test-password-reset.js full
```

### Opción 2: cURL Manual
```bash
# 1. Solicitar código
curl -X POST http://localhost:3001/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"correo": "tu-email@gmail.com"}'

# 2. Verificar código (revisar email)
curl -X POST http://localhost:3001/auth/verify-reset \
  -H "Content-Type: application/json" \
  -d '{"correo": "tu-email@gmail.com", "otp": "123456"}'

# 3. Cambiar contraseña
curl -X PUT http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "token-del-paso-anterior", "nuevaContrasena": "nuevaPassword123"}'
```

---

## 💡 Ventajas del Correo vs SMS

| Aspecto | Correo | SMS |
|---------|--------|-----|
| 💰 **Costo** | Gratis | $0.005+ por mensaje |
| 🎨 **Formato** | HTML + imágenes | Solo texto |
| 📊 **Tracking** | Entrega/apertura | Básico |
| 🔒 **Seguridad** | Cifrado | Menos seguro |
| 🌍 **Alcance** | Global | Depende de operadora |
| 📱 **Adopción** | Universal | Requiere número válido |

---

## ⚠️ Consideraciones

1. **Configurar DKIM/SPF** para evitar spam
2. **Usar dominio propio** para mayor confiabilidad
3. **Monitorear bounces** y direcciones inválidas
4. **Backup con SMS** para casos críticos

---

## 🔧 Troubleshooting

### Error: "Error al enviar correo"
- ✅ Verificar `EMAIL_USER` y `EMAIL_PASS`
- ✅ Confirmar que la cuenta tenga verificación en 2 pasos
- ✅ Usar contraseña de aplicación, no la contraseña normal

### Error: "Usuario no encontrado"
- ✅ Verificar que el correo exista en la tabla `usuarios`
- ✅ Revisar formato del correo electrónico

### Correo no llega
- ✅ Revisar carpeta de spam
- ✅ Verificar configuración SMTP
- ✅ Probar con otro proveedor de correo
