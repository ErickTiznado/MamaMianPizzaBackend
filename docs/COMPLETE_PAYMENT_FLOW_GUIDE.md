# 🔄 Guía Completa del Flujo de Pagos con Tarjeta

## 📋 Resumen Ejecutivo

Esta guía explica el flujo completo para procesar pagos con tarjeta de crédito en el sistema Mama Mian Pizza, incluyendo:
- **Frontend**: Estructura de datos y llamadas a endpoints
- **Backend**: Procesamiento de pagos con Wompi
- **Confirmación**: Creación automática de pedidos
- **Manejo de errores**: Respuestas y redirecciones

---

## 🏗️ Arquitectura del Sistema

```
Frontend → Backend → Wompi → Confirmation → Order Creation
   ↓         ↓        ↓         ↓            ↓
 [Form]  [Validate] [3DS]   [Webhook]   [Database]
```

### Flujo de Estados:
1. **Frontend**: Recolección de datos
2. **Backend**: Validación y creación de transacción 3DS
3. **Wompi**: Procesamiento del pago (3D Secure)
4. **Confirmation**: Verificación y creación automática del pedido
5. **Redirect**: Vuelta al frontend con resultado

---

## 🎯 Paso 1: Frontend - Preparación de Datos

### 1.1 Estructura de Datos Requerida

El frontend debe enviar los datos en uno de estos formatos:

#### **Formato A: Estructura Completa (Recomendado)**
```javascript
const paymentData = {
  // Datos de la tarjeta
  numeroTarjeta: "4573690001990693",
  cvv: "835",
  mesVencimiento: "12",
  anioVencimiento: "2029",
  
  // Datos del titular para el pago
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan@email.com",
  telefono: "+503XXXXXXXX",
  direccionPago: "Calle Principal 123",
  ciudad: "San Salvador",
  idPais: "SV",
  idRegion: "SV-SS",
  codigoPostal: "1101",
  
  // Datos completos del pedido
  pedidoData: {
    tipo_cliente: "invitado", // o "registrado"
    
    cliente: {
      id_usuario: null, // Solo si es registrado
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@email.com",
      telefono: "+503XXXXXXXX"
    },
    
    direccion: {
      tipo_direccion: "formulario", // o "coordenadas"
      direccion: "Colonia Escalón, Casa 123",
      pais: "El Salvador",
      departamento: "San Salvador",
      municipio: "San Salvador",
      codigo_postal: "1101",
      instrucciones_entrega: "Portón azul, segundo piso"
    },
    
    productos: [
      {
        id_producto: 1,
        nombre_producto: "Pizza Margarita",
        cantidad: 2,
        precio_unitario: 12.50,
        subtotal: 25.00,
        masa: "delgada",
        tamano: "grande",
        instrucciones_especiales: "Sin cebolla"
      },
      {
        id_producto: 3,
        nombre_producto: "Refresco Cola",
        cantidad: 2,
        precio_unitario: 1.25,
        subtotal: 2.50,
        instrucciones_especiales: null
      }
    ],
    
    subtotal: 27.50,
    costo_envio: 2.50,
    total: 30.00,
    
    // Configuraciones adicionales
    tipo_entrega: "domicilio", // o "recoger"
    tiempo_estimado_entrega: 45, // minutos
    aceptado_terminos: true
  }
};
```

#### **Formato B: Estructura Simplificada (Compatibilidad)**
```javascript
const paymentDataSimple = {
  cliente: {
    nombre: "Juan Pérez",
    email: "juan@email.com",
    telefono: "+503XXXXXXXX",
    direccion: "Colonia Escalón, Casa 123"
  },
  
  tarjeta: {
    numeroTarjeta: "4573690001990693",
    cvv: "835",
    mesVencimiento: "12",
    anioVencimiento: "2029"
  },
  
  productos: [
    {
      id_producto: 1,
      cantidad: 2,
      precio_unitario: 12.50,
      observaciones: "Masa: delgada, Tamaño: grande, Sin cebolla"
    }
  ],
  
  tipo_entrega: "domicilio",
  observaciones_generales: "Portón azul, segundo piso"
};
```

### 1.2 Validación en Frontend

```javascript
function validarDatosPago(data) {
  const errores = [];
  
  // Validar tarjeta
  if (!data.numeroTarjeta || data.numeroTarjeta.length < 16) {
    errores.push("Número de tarjeta inválido");
  }
  if (!data.cvv || data.cvv.length < 3) {
    errores.push("CVV inválido");
  }
  if (!data.mesVencimiento || !data.anioVencimiento) {
    errores.push("Fecha de vencimiento requerida");
  }
  
  // Validar cliente
  if (!data.nombre || !data.apellido) {
    errores.push("Nombre completo requerido");
  }
  if (!data.email || !data.email.includes('@')) {
    errores.push("Email válido requerido");
  }
  if (!data.telefono) {
    errores.push("Teléfono requerido");
  }
  
  // Validar pedido
  if (!data.pedidoData?.productos?.length) {
    errores.push("Debe incluir al menos un producto");
  }
  if (!data.pedidoData?.total || data.pedidoData.total <= 0) {
    errores.push("Total inválido");
  }
  
  return errores;
}
```

### 1.3 Envío al Backend

```javascript
async function procesarPagoCompleto(paymentData) {
  try {
    // 1. Validar datos localmente
    const errores = validarDatosPago(paymentData);
    if (errores.length > 0) {
      throw new Error(`Errores: ${errores.join(', ')}`);
    }
    
    // 2. Mostrar estado de carga
    mostrarCargando("Procesando pago...");
    
    // 3. Enviar al backend
    const response = await fetch('/api/payments/process-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al procesar el pago');
    }
    
    const resultado = await response.json();
    
    // 4. Redirigir a Wompi para 3D Secure
    console.log('Redirigiendo a Wompi:', resultado.data.urlPago);
    window.location.href = resultado.data.urlPago;
    
  } catch (error) {
    console.error('Error:', error);
    mostrarError(error.message);
  } finally {
    ocultarCargando();
  }
}

// Funciones auxiliares
function mostrarCargando(mensaje) {
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('loading-text').textContent = mensaje;
}

function mostrarError(mensaje) {
  alert(`Error: ${mensaje}`);
  // O usar una librería de notificaciones más elegante
}

function ocultarCargando() {
  document.getElementById('loading-overlay').style.display = 'none';
}
```

---

## ⚙️ Paso 2: Backend - Endpoint `/api/payments/process-order`

### 2.1 Función Principal: `processPaymentAndOrder`

Esta función:
1. **Normaliza** los datos (soporta ambos formatos)
2. **Valida** datos de tarjeta y cliente
3. **Crea transacción** 3DS con Wompi
4. **Guarda** transacción en BD
5. **Retorna** URL de pago para redirección

### 2.2 Flujo de Validación

```javascript
// Validación de tarjeta
const cardValidation = wompiService.validateCardData({
  numeroTarjeta, cvv, mesVencimiento, anioVencimiento
});

// Validación de cliente
const clientValidation = wompiService.validateClientData({
  nombre, apellido, email, telefono, direccion, monto
});
```

### 2.3 Creación de Transacción Wompi

```javascript
const transactionResult = await wompiService.createTransaction({
  numeroTarjeta,
  cvv,
  mesVencimiento: parseInt(mesVencimiento),
  anioVencimiento: parseInt(anioVencimiento),
  nombre,
  apellido,
  email,
  telefono,
  direccion,
  ciudad,
  idPais,
  idRegion,
  codigoPostal,
  monto
});
```

### 2.4 Respuesta del Backend

```javascript
{
  "success": true,
  "message": "Transacción de pago creada exitosamente",
  "data": {
    "transactionId": 123,
    "urlPago": "https://3ds.wompi.co/xxxx",
    "monto": 30.00,
    "metodoPago": "tarjeta_credito",
    "instructions": {
      "message": "Redirige al usuario a la URL de pago",
      "redirectUrl": "https://3ds.wompi.co/xxxx",
      "returnUrl": "https://tudominio.com/confirmacion"
    },
    "pedidoStatus": "PENDIENTE_CONFIRMACION_PAGO"
  }
}
```

---

## 💳 Paso 3: Wompi - Procesamiento 3D Secure

### 3.1 Redirección Automática
- El usuario es redirigido automáticamente a la URL de Wompi
- Completa el formulario de autenticación 3D Secure
- Ingresa datos adicionales requeridos por el banco

### 3.2 Posibles Resultados
- ✅ **Pago Aprobado**: `esAprobada=True`
- ❌ **Pago Rechazado**: `esAprobada=False`
- ⚠️ **Error del Sistema**: Problemas técnicos

---

## ✅ Paso 4: Confirmación - Endpoint `/api/payments/confirmation`

### 4.1 Parámetros de Wompi

Wompi redirige con estos parámetros:
```
/api/payments/confirmation?idTransaccion=xxx&monto=30.00&esAprobada=True&codigoAutorizacion=12345&mensaje=Aprobada
```

### 4.2 Función `handlePaymentConfirmation`

```javascript
exports.handlePaymentConfirmation = async (req, res) => {
  const { idTransaccion, monto, esAprobada, codigoAutorizacion, mensaje } = req.query;
  
  // 1. Buscar transacción en BD
  const transaction = await findTransactionByWompiId(idTransaccion);
  
  // 2. Actualizar estado de transacción
  await updateTransactionStatus(transaction.id, esAprobada ? 'completado' : 'fallido');
  
  if (esAprobada === 'True') {
    // 3. CREAR PEDIDO AUTOMÁTICAMENTE
    const orderResult = await orderController.createOrderFromPayment(
      transaction.order_data,
      transaction.id
    );
    
    // 4. Redirigir a página de éxito
    res.redirect(`https://tudominio.com/pago-exitoso?pedido=${orderResult.codigo_pedido}`);
  } else {
    // 5. Redirigir a página de error
    res.redirect(`https://tudominio.com/pago-error?mensaje=${mensaje}`);
  }
};
```

### 4.3 Creación Automática del Pedido

Una vez confirmado el pago, se llama a:
```javascript
const orderResult = await orderController.createOrderFromPayment(pedidoData, transactionId);
```

Esta función:
- Crea el pedido en estado `'en proceso'`
- Establece `metodo_pago = 'tarjeta_credito'`
- Vincula el pedido con la transacción
- Envía notificaciones correspondientes

---

## 🏁 Paso 5: Frontend - Páginas de Resultado

### 5.1 Página de Éxito

```javascript
// URL: /pago-exitoso?pedido=MP001234&transaction=123&monto=30.00

function PagoExitoso() {
  const [pedido, setPedido] = useState(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoPedido = urlParams.get('pedido');
    const transactionId = urlParams.get('transaction');
    const monto = urlParams.get('monto');
    
    // Mostrar información inmediata
    console.log(`Pago exitoso: ${codigoPedido}, Monto: $${monto}`);
    
    // Opcionalmente, obtener detalles completos del pedido
    if (codigoPedido) {
      obtenerDetallesPedido(codigoPedido);
    }
  }, []);
  
  async function obtenerDetallesPedido(codigo) {
    try {
      const response = await fetch(`/api/orders/by-code/${codigo}`);
      if (response.ok) {
        const pedidoData = await response.json();
        setPedido(pedidoData);
      }
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
    }
  }
  
  return (
    <div className="pago-exitoso">
      <div className="success-icon">🎉</div>
      <h1>¡Pago Realizado Exitosamente!</h1>
      
      {pedido ? (
        <div className="pedido-info">
          <h2>Detalles del Pedido</h2>
          <p><strong>Código:</strong> {pedido.codigo_pedido}</p>
          <p><strong>Total:</strong> ${pedido.total}</p>
          <p><strong>Estado:</strong> {pedido.estado}</p>
          <p><strong>Tiempo estimado:</strong> {pedido.tiempo_estimado_entrega} min</p>
          
          <div className="productos">
            <h3>Productos:</h3>
            {pedido.productos?.map(producto => (
              <div key={producto.id} className="producto-item">
                {producto.cantidad}x {producto.nombre_producto} - ${producto.subtotal}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="loading">Cargando detalles del pedido...</div>
      )}
      
      <div className="acciones">
        <button onClick={() => window.location.href = '/'} className="btn-primary">
          Volver al Inicio
        </button>
        <button onClick={() => window.location.href = '/mis-pedidos'} className="btn-secondary">
          Ver Mis Pedidos
        </button>
      </div>
    </div>
  );
}
```

### 5.2 Página de Error

```javascript
// URL: /pago-error?mensaje=Tarjeta+rechazada&transaction=123

function PagoError() {
  const [errorInfo, setErrorInfo] = useState({});
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mensaje = urlParams.get('mensaje');
    const transactionId = urlParams.get('transaction');
    
    setErrorInfo({
      mensaje: decodeURIComponent(mensaje || 'Error desconocido'),
      transactionId,
      solucion: obtenerSolucion(mensaje)
    });
  }, []);
  
  function obtenerSolucion(codigoError) {
    const soluciones = {
      'Tarjeta rechazada': 'Verifica los datos de tu tarjeta o intenta con otra',
      'Fondos insuficientes': 'Verifica el saldo disponible en tu tarjeta',
      'Tarjeta vencida': 'Usa una tarjeta vigente',
      'Error del sistema': 'Intenta nuevamente en unos minutos'
    };
    
    return soluciones[codigoError] || 'Contacta con nuestro servicio al cliente';
  }
  
  return (
    <div className="pago-error">
      <div className="error-icon">❌</div>
      <h1>Error en el Pago</h1>
      
      <div className="error-info">
        <p><strong>Motivo:</strong> {errorInfo.mensaje}</p>
        <p><strong>Solución:</strong> {errorInfo.solucion}</p>
        {errorInfo.transactionId && (
          <p><strong>ID de Transacción:</strong> {errorInfo.transactionId}</p>
        )}
      </div>
      
      <div className="acciones">
        <button onClick={() => window.location.href = '/carrito'} className="btn-primary">
          Intentar Nuevamente
        </button>
        <button onClick={() => window.location.href = '/contacto'} className="btn-secondary">
          Contactar Soporte
        </button>
      </div>
    </div>
  );
}
```

---

## 🔍 Verificación y Debugging

### Logs del Sistema

El backend genera logs detallados en cada paso:

```javascript
// Ejemplo de logs generados
console.log(`💳 [REQUEST-123] Iniciando proceso de pago...`);
console.log(`✅ [REQUEST-123] Validaciones completadas`);
console.log(`🔗 [REQUEST-123] URL 3DS generada: https://3ds.wompi.co/xxx`);
console.log(`🎉 [REQUEST-123] Pago confirmado, creando pedido...`);
console.log(`✅ [REQUEST-123] Pedido creado: MP001234`);
```

### Verificar Transacciones

```sql
-- Ver transacciones recientes
SELECT id, monto, estado, email_cliente, fecha_creacion 
FROM transacciones 
ORDER BY fecha_creacion DESC 
LIMIT 10;

-- Ver transacciones por estado
SELECT estado, COUNT(*) as cantidad 
FROM transacciones 
GROUP BY estado;
```

### Verificar Pedidos Creados por Pagos

```sql
-- Ver pedidos con método de pago tarjeta
SELECT p.codigo_pedido, p.total, p.estado, p.metodo_pago, t.id as transaction_id
FROM pedidos p
LEFT JOIN transacciones t ON t.pedido_id = p.id_pedido
WHERE p.metodo_pago = 'tarjeta_credito'
ORDER BY p.fecha_pedido DESC;
```

---

## 🚨 Manejo de Errores Comunes

### Error: Datos de Tarjeta Inválidos
```javascript
{
  "success": false,
  "message": "Datos de tarjeta inválidos",
  "errors": ["Número de tarjeta requerido", "CVV inválido"]
}
```

**Solución**: Validar datos en frontend antes de enviar.

### Error: Transacción No Encontrada
```javascript
// En confirmation endpoint
if (transactionRows.length === 0) {
  return res.redirect(`https://tudominio.com/pago-error?message=Transaccion+no+encontrada`);
}
```

**Solución**: Verificar que el ID de transacción coincida.

### Error: Timeout de Wompi
```javascript
// Configurar timeout en requests
const wompiResponse = await axios.post(url, data, {
  timeout: 30000, // 30 segundos
  headers: { ... }
});
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Datos Sensibles**
- CVV y número de tarjeta nunca se guardan en BD
- Solo se almacenan en memoria durante el procesamiento
- Se enmascaran en logs: `****-****-****-1234`

### 2. **Validación**
- Validación tanto en frontend como backend
- Sanitización de datos de entrada
- Verificación de formatos estándar

### 3. **Comunicación Segura**
- HTTPS obligatorio en producción
- Headers de seguridad apropiados
- Tokens de autenticación cuando aplique

---

## 📊 Monitoreo y Métricas

### KPIs Importantes

1. **Tasa de Éxito de Pagos**: `(Pagos Aprobados / Total Intentos) * 100`
2. **Tiempo Promedio de Procesamiento**: Desde envío hasta confirmación
3. **Errores Más Comunes**: Agrupados por tipo y frecuencia

### Queries de Monitoreo

```sql
-- Tasa de éxito diaria
SELECT 
  DATE(fecha_creacion) as fecha,
  COUNT(*) as total_intentos,
  SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as exitosos,
  ROUND(SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as tasa_exito
FROM transacciones 
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(fecha_creacion)
ORDER BY fecha DESC;

-- Montos procesados por día
SELECT 
  DATE(fecha_creacion) as fecha,
  SUM(CASE WHEN estado = 'completado' THEN monto ELSE 0 END) as monto_exitoso,
  SUM(monto) as monto_total_intentado
FROM transacciones 
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(fecha_creacion)
ORDER BY fecha DESC;
```

---

## 🚀 Próximos Pasos y Mejoras

### 1. **Notificaciones en Tiempo Real**
- WebSockets para actualizaciones de estado
- Notificaciones push al completar pago

### 2. **Múltiples Métodos de Pago**
- PayPal, Apple Pay, Google Pay
- Transferencias bancarias

### 3. **Optimizaciones**
- Cache de validaciones
- Compresión de respuestas
- CDN para recursos estáticos

### 4. **Analytics Avanzado**
- Seguimiento de abandono de carrito
- A/B testing en formularios de pago
- Análisis de patrones de compra

---

## 📞 Soporte y Contacto

Para reportar problemas o solicitar mejoras:
- **Backend Issues**: Revisar logs en `/var/log/mamamian/`
- **Frontend Issues**: Verificar console del navegador
- **Wompi Issues**: Contactar soporte de Wompi

**¡Este documento debe mantenerse actualizado con cualquier cambio en el sistema de pagos!**
