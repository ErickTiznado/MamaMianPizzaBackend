# 💳 Flujo Completo para Pagos con Tarjeta

## 🎯 Resumen del Flujo

El sistema de pagos con tarjeta utiliza **Wompi** como pasarela de pago e incluye:
1. **Frontend**: Recolección de datos y envío al backend
2. **Backend**: Creación de transacción en Wompi
3. **Wompi**: Procesamiento del pago
4. **Webhook**: Confirmación y creación automática del pedido
5. **Redirección**: Vuelta al frontend con resultado

---

## 🔄 Flujo Completo Paso a Paso

### **Paso 1: Frontend - Recolección de Datos del Pedido**

#### **1.1 Formulario de Pedido**
```javascript
// Estructura de datos requerida en el frontend
const pedidoData = {
  // Información del cliente
  cliente: {
    nombre: "Juan",
    apellido: "Pérez", 
    email: "juan@email.com",
    telefono: "+573001234567"
  },
  
  // Dirección de entrega
  direccion: {
    tipo_direccion: "formulario", // o "coordenadas"
    direccion: "Calle 123 #45-67",
    pais: "Colombia",
    departamento: "Antioquia", 
    municipio: "Medellín",
    codigo_postal: "050001",
    instrucciones_entrega: "Apartamento 301"
  },
  
  // O para direcciones con coordenadas:
  // direccion: {
  //   tipo_direccion: "coordenadas",
  //   latitud: 6.2442,
  //   longitud: -75.5812,
  //   direccion_formateada: "Calle 123 #45-67, Medellín",
  //   instrucciones_entrega: "Apartamento 301"
  // },
  
  // Productos del pedido
  productos: [
    {
      id_producto: 1,
      nombre_producto: "Pizza Margarita",
      cantidad: 1,
      precio_unitario: 25000,
      masa: "delgada",
      tamano: "grande",
      instrucciones_especiales: "Sin cebolla"
    }
  ],
  
  // Totales
  subtotal: 25000,
  costo_envio: 3000,
  total: 28000,
  
  // Configuración
  tipo_cliente: "invitado", // o "registrado"
  tipo_entrega: "domicilio", // o "recoger"
  tiempo_estimado_entrega: 45,
  aceptado_terminos: true
};
```

#### **1.2 Validación en Frontend**
```javascript
function validarDatosPedido(pedidoData) {
  const errores = [];
  
  // Validar cliente
  if (!pedidoData.cliente?.nombre) errores.push("Nombre requerido");
  if (!pedidoData.cliente?.telefono) errores.push("Teléfono requerido");
  if (!pedidoData.cliente?.email) errores.push("Email requerido");
  
  // Validar dirección
  if (pedidoData.direccion?.tipo_direccion === "formulario") {
    if (!pedidoData.direccion.direccion) errores.push("Dirección requerida");
    if (!pedidoData.direccion.municipio) errores.push("Municipio requerido");
  }
  
  // Validar productos
  if (!pedidoData.productos?.length) errores.push("Debe incluir al menos un producto");
  
  // Validar totales
  if (!pedidoData.total || pedidoData.total <= 0) errores.push("Total inválido");
  
  return errores;
}
```

### **Paso 2: Frontend - Envío al Backend**

#### **2.1 Petición POST para Crear Transacción**
```javascript
async function iniciarPagoConTarjeta(pedidoData) {
  try {
    // Validar datos antes de enviar
    const errores = validarDatosPedido(pedidoData);
    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(", ")}`);
    }
    
    // Mostrar loading
    mostrarLoading("Procesando pago...");
    
    // Enviar al backend
    const response = await fetch('/api/payments/process-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    });
    
    const resultado = await response.json();
    
    if (!response.ok) {
      throw new Error(resultado.message || 'Error al procesar el pago');
    }
    
    // Redirigir a Wompi para el pago
    window.location.href = resultado.data.urlPago;
    
  } catch (error) {
    console.error('Error:', error);
    mostrarError(error.message);
  } finally {
    ocultarLoading();
  }
}

// Función auxiliar para mostrar estados
function mostrarLoading(mensaje) {
  // Implementar loading spinner
  document.getElementById('loading').style.display = 'block';
  document.getElementById('loading-text').textContent = mensaje;
}

function mostrarError(mensaje) {
  // Implementar notificación de error
  alert(`Error: ${mensaje}`);
}

function ocultarLoading() {
  document.getElementById('loading').style.display = 'none';
}
```

### **Paso 3: Backend - Endpoint `/api/payments/process-order`**

#### **3.1 Validación y Creación de Transacción**
```javascript
// En paymentController.js
exports.processOrderPayment = async (req, res) => {
  try {
    // 1. Validar datos recibidos
    const { cliente, direccion, productos, total, subtotal, costo_envio } = req.body;
    
    // 2. Generar referencia única
    const referencia = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 3. Crear transacción en Wompi
    const transactionData = {
      amount_in_cents: Math.round(total * 100), // Convertir a centavos
      currency: 'COP',
      customer_email: cliente.email,
      payment_method: {
        type: 'CARD'
      },
      redirect_url: process.env.WOMPI_REDIRECT_URL,
      reference: referencia,
      customer_data: {
        phone_number: cliente.telefono,
        full_name: `${cliente.nombre} ${cliente.apellido}`
      }
    };
    
    // 4. Enviar a Wompi
    const wompiResponse = await axios.post('https://api.wompi.co/v1/transactions', transactionData, {
      headers: {
        'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 5. Guardar transacción en BD
    const transactionId = await guardarTransaccion({
      reference: referencia,
      amount: total,
      orderData: req.body,
      wompi_id: wompiResponse.data.id
    });
    
    // 6. Responder con URL de pago
    res.json({
      success: true,
      data: {
        transactionId: transactionId,
        reference: referencia,
        urlPago: wompiResponse.data.url,
        amount: total
      }
    });
    
  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
};
```

### **Paso 4: Usuario Realiza el Pago en Wompi**

#### **4.1 Redirección Automática**
- El usuario es redirigido a la URL de Wompi
- Completa el formulario de pago con datos de tarjeta
- Wompi procesa el pago

#### **4.2 Posibles Resultados**
- ✅ **Pago exitoso**: Wompi redirige al `redirect_url` con parámetros de éxito
- ❌ **Pago fallido**: Wompi redirige al `redirect_url` con parámetros de error

### **Paso 5: Backend - Endpoint de Confirmación `/api/payments/confirmation`**

#### **5.1 Procesamiento de Respuesta de Wompi**
```javascript
// En paymentController.js
exports.handlePaymentConfirmation = async (req, res) => {
  try {
    const { id, status, reference, authorization_code } = req.query;
    
    // 1. Validar y actualizar transacción
    const transaction = await actualizarTransaccion(id, {
      status: status,
      authorization_code: authorization_code,
      confirmed_at: new Date()
    });
    
    if (status === 'APPROVED') {
      // 2. CREAR PEDIDO AUTOMÁTICAMENTE
      const orderResult = await orderController.createOrderFromPayment(
        transaction.order_data,
        transaction.id
      );
      
      // 3. Redirigir a página de éxito
      res.redirect(`https://tu-frontend.com/pago-exitoso?pedido=${orderResult.codigo_pedido}`);
    } else {
      // 4. Redirigir a página de error
      res.redirect(`https://tu-frontend.com/pago-error?error=${status}`);
    }
    
  } catch (error) {
    console.error('Error en confirmación:', error);
    res.redirect('https://tu-frontend.com/pago-error?error=system');
  }
};
```

### **Paso 6: Frontend - Páginas de Resultado**

#### **6.1 Página de Éxito (`/pago-exitoso`)**
```javascript
// En tu frontend (React/Vue/etc.)
function PagoExitoso() {
  const [pedido, setPedido] = useState(null);
  
  useEffect(() => {
    // Obtener código de pedido de URL
    const urlParams = new URLSearchParams(window.location.search);
    const codigoPedido = urlParams.get('pedido');
    
    if (codigoPedido) {
      // Opcional: Obtener detalles del pedido
      obtenerDetallesPedido(codigoPedido);
    }
  }, []);
  
  async function obtenerDetallesPedido(codigo) {
    try {
      const response = await fetch(`/api/orders/by-code/${codigo}`);
      const pedidoData = await response.json();
      setPedido(pedidoData);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
    }
  }
  
  return (
    <div className="pago-exitoso">
      <h1>¡Pago Exitoso! 🎉</h1>
      {pedido && (
        <div>
          <p>Pedido: #{pedido.codigo_pedido}</p>
          <p>Total: ${pedido.total}</p>
          <p>Estado: {pedido.estado}</p>
          <p>Tiempo estimado: {pedido.tiempo_estimado_entrega} minutos</p>
        </div>
      )}
      <button onClick={() => window.location.href = '/'}>
        Volver al inicio
      </button>
    </div>
  );
}
```

#### **6.2 Página de Error (`/pago-error`)**
```javascript
function PagoError() {
  const [error, setError] = useState('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('error');
    
    const mensajesError = {
      'DECLINED': 'El pago fue rechazado por el banco',
      'VOIDED': 'El pago fue cancelado',
      'system': 'Error del sistema, intente nuevamente'
    };
    
    setError(mensajesError[errorCode] || 'Error desconocido');
  }, []);
  
  return (
    <div className="pago-error">
      <h1>Error en el Pago ❌</h1>
      <p>{error}</p>
      <button onClick={() => window.location.href = '/carrito'}>
        Intentar nuevamente
      </button>
    </div>
  );
}
```

---

## 📋 Endpoints Requeridos

### **1. Endpoint Principal - Procesar Pago**
```
POST /api/payments/process-order
Content-Type: application/json

Body: {
  cliente: { nombre, apellido, email, telefono },
  direccion: { ... },
  productos: [ ... ],
  total: number,
  subtotal: number,
  costo_envio: number
}

Response: {
  success: true,
  data: {
    transactionId: string,
    reference: string,
    urlPago: string,
    amount: number
  }
}
```

### **2. Endpoint de Confirmación**
```
GET /api/payments/confirmation?id=123&status=APPROVED&reference=ORDER-123

Response: Redirección a frontend
```

### **3. Endpoint Opcional - Consultar Pedido**
```
GET /api/orders/by-code/{codigo_pedido}

Response: {
  id_pedido: number,
  codigo_pedido: string,
  estado: string,
  total: number,
  fecha_pedido: string,
  // ... otros campos
}
```

---

## 🔐 Variables de Entorno Requeridas

```env
# Wompi Configuration
WOMPI_PUBLIC_KEY=pub_test_your_public_key
WOMPI_PRIVATE_KEY=prv_test_your_private_key
WOMPI_EVENTS_SECRET=your_events_secret
WOMPI_REDIRECT_URL=https://tu-backend.com/api/payments/confirmation

# Frontend URLs
FRONTEND_SUCCESS_URL=https://tu-frontend.com/pago-exitoso
FRONTEND_ERROR_URL=https://tu-frontend.com/pago-error
```

---

## 🚀 Implementación Frontend Completa

### **Ejemplo con Fetch API**
```javascript
class PagosService {
  constructor() {
    this.baseURL = 'https://tu-backend.com/api';
  }
  
  async procesarPago(pedidoData) {
    try {
      const response = await fetch(`${this.baseURL}/payments/process-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const resultado = await response.json();
      
      // Redirigir a Wompi
      window.location.href = resultado.data.urlPago;
      
      return resultado;
    } catch (error) {
      console.error('Error procesando pago:', error);
      throw error;
    }
  }
  
  async consultarPedido(codigoPedido) {
    try {
      const response = await fetch(`${this.baseURL}/orders/by-code/${codigoPedido}`);
      if (!response.ok) throw new Error('Pedido no encontrado');
      return await response.json();
    } catch (error) {
      console.error('Error consultando pedido:', error);
      throw error;
    }
  }
}

// Uso
const pagosService = new PagosService();

// En tu componente de checkout
async function finalizarPedido() {
  try {
    await pagosService.procesarPago(pedidoData);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

---

## ⚡ Flujo de Estados

```
[Frontend] → [Backend] → [Wompi] → [Backend] → [Frontend]
    │            │         │         │           │
    │            │         │         │           └── Página resultado
    │            │         │         └── Crear pedido automático
    │            │         └── Procesar pago
    │            └── Crear transacción
    └── Enviar datos
```

### **Estados del Pedido:**
1. **Frontend**: Recolección de datos ⏳
2. **Backend**: Creación de transacción 🔄
3. **Wompi**: Usuario completa pago 💳
4. **Backend**: Confirmación y creación de pedido ✅
5. **Frontend**: Mostrar resultado final 🎉

---

**🎯 Con este flujo tendrás un sistema de pagos completo y robusto que maneja todos los casos posibles y proporciona una excelente experiencia de usuario.**
