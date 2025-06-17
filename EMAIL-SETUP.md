# ========================================
# CONFIGURACIÓN DE CORREO ELECTRÓNICO
# ========================================

# Copia estas líneas a tu archivo .env y completa con tus datos

# Proveedor de correo (gmail recomendado para empezar)
EMAIL_PROVIDER=gmail

# === CONFIGURACIÓN PARA GMAIL ===
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion-de-16-caracteres

# Configuración del remitente
EMAIL_FROM_NAME=Mama Mian Pizza
EMAIL_FROM_ADDRESS=noreply@mamamianpizza.com

# ========================================
# PASOS PARA CONFIGURAR GMAIL
# ========================================

# 1. Ve a tu cuenta de Google: https://myaccount.google.com/
# 2. Click en "Seguridad" en el menú lateral
# 3. Busca "Verificación en 2 pasos" y actívala si no la tienes
# 4. Una vez activada, busca "Contraseñas de aplicaciones"
# 5. Selecciona "Correo" como aplicación
# 6. Google te dará una contraseña de 16 caracteres como: "abcd efgh ijkl mnop"
# 7. Usa esa contraseña (sin espacios) en EMAIL_PASS
# 8. ¡NUNCA uses tu contraseña personal de Gmail!

# ========================================
# OTROS PROVEEDORES SOPORTADOS
# ========================================

# === OUTLOOK/HOTMAIL ===
# EMAIL_PROVIDER=outlook
# EMAIL_USER=tu-email@outlook.com
# EMAIL_PASS=tu-contraseña

# === YAHOO ===
# EMAIL_PROVIDER=yahoo
# EMAIL_USER=tu-email@yahoo.com
# EMAIL_PASS=tu-contraseña-de-aplicacion

# === SMTP PERSONALIZADO ===
# EMAIL_PROVIDER=custom
# EMAIL_HOST=smtp.tu-dominio.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=tu-usuario
# EMAIL_PASS=tu-contraseña

# ========================================
# EJEMPLO DE .env COMPLETO
# ========================================

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=MamaMianPizza

# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=pizzamamamian@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM_NAME=Mama Mian Pizza
EMAIL_FROM_ADDRESS=noreply@mamamianpizza.com

# Server Configuration
PORT=3001

# ========================================
# TROUBLESHOOTING
# ========================================

# Error: "Invalid login"
# - Verifica que EMAIL_USER y EMAIL_PASS estén correctos
# - Asegúrate de usar contraseña de aplicación, no la personal
# - Verifica que la verificación en 2 pasos esté activada

# Error: "Connection timeout"
# - Revisa tu conexión a internet
# - Verifica que el puerto 587 no esté bloqueado
# - Intenta con EMAIL_PROVIDER=outlook como alternativa

# Error: "Mail not sent"
# - Revisa los logs del servidor para más detalles
# - Verifica que el correo destinatario sea válido
# - Intenta enviar un correo de prueba desde tu cuenta

# ========================================
# PRUEBAS
# ========================================

# Para probar la configuración:
# node test-password-reset.js request

# Para probar el flujo completo:
# node test-password-reset.js full
