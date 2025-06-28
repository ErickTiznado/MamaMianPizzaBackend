# Wompi 3DS Payment Integration - Mama Mian Pizza

## Descripción

Este documento describe la implementación completa del sistema de pagos 3DS con Wompi para Mama Mian Pizza. El sistema permite procesar pagos seguros con tarjetas de crédito/débito utilizando la tecnología 3D Secure.

## Características Implementadas

### ✅ Funcionalidades Principales

1. **Creación de Transacciones 3DS**: Proceso completo de pago con autenticación 3D Secure
2. **Gestión de Webhooks**: Recepción y procesamiento automático de notificaciones de estado
3. **Seguimiento de Transacciones**: Consulta de estado en tiempo real
4. **Integración con Pedidos**: Creación de pedidos con pago integrado
5. **Validación de Tarjetas**: Validación previa de datos de tarjeta
6. **Historial de Pagos**: Consulta de historial con filtros y paginación
7. **URLs de Redirect**: Manejo de redirecciones de éxito y fallo

### 🔧 Configuración

#### Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Credenciales Wompi
WOMPI_APP_ID=116288d1-10ee-47c4-8969-a7fd0c671c40
WOMPI_API_SECRET=249aca7c-8a8f-48ca-acda-a28d4a9ea0fc

# URLs de Redirect (actualiza con tu dominio)
WOMPI_REDIRECT_SUCCESS=https://mamamianpizza.com/payment/success
WOMPI_REDIRECT_FAILURE=https://mamamianpizza.com/payment/failure

# URL del Webhook (debe ser públicamente accesible)
WOMPI_WEBHOOK_URL=https://api.mamamianpizza.com/api/payments/webhook
```

#### Base de Datos

Ejecuta el script SQL de migración para crear las tablas necesarias:

```bash
mysql -u tu_usuario -p tu_base_de_datos < migrations/create_wompi_transactions_table.sql
```

## 📋 Uso de la API

### 1. Crear Transacción 3DS Simple

**Endpoint**: `POST /api/payments/3ds/create`

```json
{
  "numeroTarjeta": "4111111111111111",
  "cvv": "123",
  "mesVencimiento": 12,
  "anioVencimiento": 2025,
  "monto": 25.50,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@email.com",
  "ciudad": "San Salvador",
  "direccion": "Calle Principal #123",
  "telefono": "+503 1234-5678",
  "orderId": 150,
  "orderCode": "MAMA-001",
  "configuracion": {
    "notificarTransaccionCliente": true
  }
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Transacción 3DS creada exitosamente",
  "data": {
    "transactionReference": "MAMA-1672531200000-ABC123",
    "wompiTransactionId": "wompi-txn-456789",
    "amount": 25.50,
    "redirectUrl": "https://wompi.sv/3ds/redirect/...",
    "isReal": false
  },
  "request_id": "PAY-1672531200000-XYZ789"
}
```

### 2. Crear Pedido con Pago Integrado

**Endpoint**: `POST /api/orders/neworder-with-payment`

```json
{
  "tipo_cliente": "registrado",
  "cliente": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@email.com",
    "telefono": "+503 1234-5678"
  },
  "direccion": {
    "tipo": "formulario",
    "direccion": "Calle Principal #123",
    "ciudad": "San Salvador",
    "pais": "El Salvador",
    "departamento": "San Salvador",
    "municipio": "San Salvador"
  },
  "productos": [
    {
      "nombre_producto": "Pizza Margarita",
      "cantidad": 2,
      "precio_unitario": 12.75,
      "masa": "delgada",
      "tamano": "mediana"
    }
  ],
  "subtotal": 25.50,
  "costo_envio": 2.00,
  "impuestos": 0.00,
  "total": 27.50,
  "aceptado_terminos": true,
  "tiempo_estimado_entrega": 30,
  "payment_data": {
    "numeroTarjeta": "4111111111111111",
    "cvv": "123",
    "mesVencimiento": 12,
    "anioVencimiento": 2025,
    "ciudad_pago": "San Salvador",
    "direccion_pago": "Calle Principal #123"
  }
}
```

### 3. Consultar Estado de Transacción

**Endpoint**: `GET /api/payments/status/{transactionReference}`

```json
{
  "success": true,
  "data": {
    "transactionReference": "MAMA-1672531200000-ABC123",
    "wompiTransactionId": "wompi-txn-456789",
    "status": "approved",
    "wompiStatus": "APROBADA",
    "amount": 25.50,
    "orderId": 150,
    "customerName": "Juan Pérez",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "completedAt": "2024-01-01T10:02:15.000Z",
    "authorizationCode": "AUTH123456"
  }
}
```

### 4. Obtener Historial de Pagos

**Endpoint**: `GET /api/payments/history?page=1&limit=20&status=approved`

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionReference": "MAMA-1672531200000-ABC123",
        "wompiTransactionId": "wompi-txn-456789",
        "orderId": 150,
        "amount": 25.50,
        "status": "approved",
        "customerName": "Juan Pérez",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 95,
      "limit": 20
    }
  }
}
```

## 🔄 Flujo de Pago 3DS

### Proceso Completo

1. **Inicio**: El cliente ingresa los datos de su tarjeta
2. **Validación**: Se validan los datos antes de enviar a Wompi
3. **Creación**: Se crea la transacción 3DS en Wompi
4. **Redirect**: El cliente es redirigido a la página 3DS del banco
5. **Autenticación**: El cliente completa la autenticación 3D Secure
6. **Notificación**: Wompi envía notificación via webhook
7. **Confirmación**: Se actualiza el estado del pedido automáticamente

### Estados de Transacción

- `pending`: Transacción creada, esperando pago
- `approved`: Pago aprobado exitosamente
- `rejected`: Pago rechazado por el banco
- `cancelled`: Transacción cancelada por el usuario
- `expired`: Transacción expiró sin completarse
- `failed`: Error en el procesamiento

## 🛠️ Endpoints Disponibles

### Pagos
- `POST /api/payments/3ds/create` - Crear transacción 3DS
- `POST /api/payments/webhook` - Webhook para notificaciones
- `GET /api/payments/status/:reference` - Consultar estado
- `GET /api/payments/history` - Historial de pagos
- `GET /api/payments/redirect/success` - Redirect de éxito
- `GET /api/payments/redirect/failure` - Redirect de fallo

### Utilidades
- `POST /api/payments/validate-card` - Validar datos de tarjeta
- `GET /api/payments/config` - Obtener configuración pública
- `GET /api/payments/test-connection` - Probar conexión con Wompi

### Pedidos Integrados
- `POST /api/orders/neworder-with-payment` - Crear pedido con pago

## 🔒 Seguridad

### Validaciones Implementadas

1. **Validación de Tarjeta**: Algoritmo de Luhn para números de tarjeta
2. **Validación de Fechas**: Verificación de fecha de vencimiento
3. **Sanitización**: Limpieza de datos de entrada
4. **Timeouts**: Timeouts en llamadas a API externa
5. **Transacciones**: Uso de transacciones de BD para consistencia

### Datos Sensibles

- Los números de tarjeta no se almacenan en la base de datos
- Solo se guarda información de referencia y estado
- Las credenciales de API se manejan via variables de entorno

## 🧪 Pruebas

### Tarjetas de Prueba (Wompi)

Wompi proporciona tarjetas de prueba para desarrollo:

```
Tarjeta Exitosa: 4111111111111111
CVV: cualquier valor de 3 dígitos
Fecha: cualquier fecha futura
```

### Probar la Integración

1. **Conexión**: 
   ```bash
   curl -X GET http://localhost:3001/api/payments/test-connection
   ```

2. **Validación**:
   ```bash
   curl -X POST http://localhost:3001/api/payments/validate-card \
   -H "Content-Type: application/json" \
   -d '{"numeroTarjeta":"4111111111111111","cvv":"123","mesVencimiento":12,"anioVencimiento":2025}'
   ```

## 🚀 Despliegue

### Configuración de Producción

1. **URLs de Redirect**: Actualizar con dominios de producción
2. **Webhook URL**: Debe ser HTTPS y públicamente accesible
3. **Credenciales**: Usar credenciales reales de Wompi
4. **SSL**: Asegurar que toda la comunicación sea HTTPS

### Variables de Entorno de Producción

```env
WOMPI_APP_ID=tu-app-id-real
WOMPI_API_SECRET=tu-api-secret-real
WOMPI_REDIRECT_SUCCESS=https://mamamianpizza.com/payment/success
WOMPI_REDIRECT_FAILURE=https://mamamianpizza.com/payment/failure
WOMPI_WEBHOOK_URL=https://api.mamamianpizza.com/api/payments/webhook
```

## 📊 Monitoreo

### Logs

El sistema genera logs detallados para:
- Cada transacción creada
- Webhooks recibidos
- Errores de API
- Tiempos de respuesta

### Métricas Sugeridas

- Tasa de éxito de pagos
- Tiempo promedio de procesamiento
- Errores de API de Wompi
- Abandono en el proceso de pago

## ❓ Solución de Problemas

### Errores Comunes

1. **"Error conectando con Wompi"**
   - Verificar credenciales en .env
   - Verificar conectividad a internet
   - Revisar logs del servidor

2. **"Webhook no recibido"**
   - Verificar que la URL sea accesible públicamente
   - Revisar configuración de firewall
   - Usar ngrok para desarrollo local

3. **"Transacción no encontrada"**
   - Verificar que el ID de transacción sea correcto
   - Revisar logs de creación de transacción

### Debugging

Para habilitar logs detallados, revisar la consola del servidor durante las transacciones. Cada operación incluye un Request ID único para facilitar el seguimiento.

## 📞 Soporte

Para issues específicos de Wompi, consultar:
- Documentación oficial: https://docs.wompi.sv/
- Soporte técnico de Wompi

Para issues de la integración, revisar los logs del servidor y validar la configuración de variables de entorno.
