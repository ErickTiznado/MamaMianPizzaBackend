# FORMATO DE RESPUESTAS DEL BACKEND - PAYMENTS API

## 🎯 RESPUESTA EXITOSA (Status: 201)

Cuando la transacción se crea exitosamente, el backend devuelve:

```json
{
  "success": true,
  "message": "Transacción de pago creada exitosamente. Redirige al usuario a la URL de pago.",
  "data": {
    "transactionId": 6,
    "urlPago": "https://pagos.wompi.sv/IntentoPago/FinalizarTransaccionApi3ds?id=11eda665-5b5d-42cf-ab0f-95ed9a38a9f8",
    "monto": 4,
    "metodoPago": "tarjeta_credito",
    "instructions": {
      "message": "Redirige al usuario a la URL de pago para completar la transacción 3DS",
      "redirectUrl": "https://pagos.wompi.sv/IntentoPago/FinalizarTransaccionApi3ds?id=11eda665-5b5d-42cf-ab0f-95ed9a38a9f8",
      "returnUrl": "https://mamamianpizza.com/confirmacion"
    },
    "pedidoStatus": "PENDIENTE_CONFIRMACION_PAGO"
  }
}
```

### 📋 CAMPOS IMPORTANTES PARA EL FRONTEND:

| Campo | Tipo | Descripción | Acción Requerida |
|-------|------|-------------|------------------|
| `success` | boolean | Siempre `true` en éxito | Verificar que sea `true` |
| `data.urlPago` | string | URL de Wompi para 3DS | **REDIRIGIR USUARIO AQUÍ** |
| `data.redirectUrl` | string | Misma URL que `urlPago` | **REDIRIGIR USUARIO AQUÍ** |
| `data.transactionId` | number | ID de transacción en BD | Guardar para referencia |
| `data.monto` | number | Monto del pago | Mostrar al usuario |
| `data.returnUrl` | string | URL de confirmación | Wompi redirige aquí después |
| `data.pedidoStatus` | string | Estado del pedido | Mostrar "Pendiente pago" |

## ❌ RESPUESTA DE ERROR (Status: 500)

Cuando hay un error, el backend devuelve:

```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Descripción específica del error",
  "requestId": "PAYMENT-PROCESS-1751247456191-6p8hvbqce"
}
```

### 📋 CAMPOS DE ERROR:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `false` en error |
| `message` | string | Mensaje general de error |
| `error` | string | Descripción específica |
| `requestId` | string | ID para rastrear el error |

## 🔄 FLUJO COMPLETO PARA EL FRONTEND

### 1. **Crear Pago (POST /api/payments/create-payment)**
```javascript
// Hacer request al backend
const response = await fetch('/api/payments/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});

const result = await response.json();

if (result.success) {
  // ✅ ÉXITO: Redirigir a Wompi
  window.location.href = result.data.urlPago;
  // O usar: window.location.href = result.data.instructions.redirectUrl;
} else {
  // ❌ ERROR: Mostrar mensaje al usuario
  alert(`Error: ${result.message}`);
}
```

### 2. **Confirmación de Pago (GET /api/payments/confirmation)**
Wompi redirige automáticamente a: `https://mamamianpizza.com/confirmacion?status=...&id=...`

El backend procesa esta URL y:
- Si pago exitoso: Crea el pedido y redirige a página de éxito
- Si pago fallido: Redirige a página de error

## 🚨 ERRORES COMUNES DEL FRONTEND

### Error: "Error de conexión al verificar el pago"
**Causa**: El frontend está tratando de verificar el pago inmediatamente después de crear la transacción.

**Solución**: 
1. NO verificar el pago después de crear la transacción
2. REDIRIGIR al usuario a `result.data.urlPago`
3. Dejar que Wompi maneje el resto del proceso

### Error: Frontend no recibe respuesta
**Causa**: Problemas de CORS o manejo de respuesta

**Verificar**:
- Status code de la respuesta (debe ser 201 para éxito)
- Content-Type debe ser `application/json`
- Verificar que `result.success` sea `true`

## 🔧 DEBUGGING

Si necesitas ver exactamente qué devuelve el backend, revisa los logs del servidor. El backend ahora imprime detalladamente:

```
📋 [REQUEST-ID] ===== RESPUESTA PARA EL FRONTEND =====
📦 [REQUEST-ID] Status Code: 201
📦 [REQUEST-ID] Content-Type: application/json
📦 [REQUEST-ID] Response Body: { ... }
```

## 📞 EJEMPLO COMPLETO

```javascript
async function procesarPago(datosCompletos) {
  try {
    // 1. Crear transacción
    const response = await fetch('/api/payments/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCompletos)
    });
    
    const result = await response.json();
    
    if (response.status === 201 && result.success) {
      // 2. Guardar datos localmente (opcional)
      localStorage.setItem('transactionId', result.data.transactionId);
      localStorage.setItem('monto', result.data.monto);
      
      // 3. REDIRIGIR A WOMPI (PASO CRÍTICO)
      window.location.href = result.data.urlPago;
      
    } else {
      // 4. Manejar error
      console.error('Error en pago:', result);
      mostrarError(result.message || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('Error de conexión:', error);
    mostrarError('Error de conexión con el servidor');
  }
}
```

## 📋 CHECKLIST PARA EL FRONTEND

- [ ] ✅ Verificar `response.status === 201`
- [ ] ✅ Verificar `result.success === true`
- [ ] ✅ Extraer `result.data.urlPago`
- [ ] ✅ Redirigir usuario con `window.location.href = urlPago`
- [ ] ✅ NO intentar verificar el pago inmediatamente
- [ ] ✅ Manejar errores con `result.success === false`
- [ ] ✅ Implementar página de confirmación en `/confirmacion`
