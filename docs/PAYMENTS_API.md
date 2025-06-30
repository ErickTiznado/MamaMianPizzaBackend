# API de Pagos con Wompi - MamaMianPizza

Esta documentación describe cómo usar la API de pagos integrada con Wompi para procesar transacciones 3DS.

## 🚀 NUEVO: Proceso Automatizado de Pago + Pedido

**Recomendado:** Usa el endpoint `/process-order` para crear pagos que automáticamente generen pedidos en estado 'en proceso'.

## Configuración

### Variables de Entorno
```env
WOMPI_CLIENT_ID=116288d1-10ee-47c4-8969-a7fd0c671c40
WOMPI_CLIENT_SECRET=249aca7c-8a8f-48ca-acda-a28d4a9ea0fc
WOMPI_REDIRECT_URL=https://mamamianpizza.com/confirmacion
```

### Base URL
```
https://api.mamamianpizza.com/api/payments
```

## Endpoints

### 🎯 1. Procesar Pago Completo con Pedido Automático (RECOMENDADO)
**POST** `/api/payments/process-order`

**Nuevo endpoint que:**
- ✅ Procesa el pago con Wompi
- ✅ Crea automáticamente el pedido en estado **'en proceso'**
- ✅ Vincula la transacción con el pedido
- ✅ Envía el pedido directo a cocina

#### Request Body:
```json
{
  // Datos de la tarjeta
  "numeroTarjeta": "4573690001990693",
  "cvv": "835", 
  "mesVencimiento": 12,
  "anioVencimiento": 2029,
  
  // Datos del cliente para el pago
  "nombre": "Erick",
  "apellido": "Tiznado", 
  "email": "tiznadoerick3@gmail.com",
  "telefono": "50300000000",
  "direccionPago": "Tu Dirección 123",
  "ciudad": "San Salvador",
  "idPais": "SV",
  "idRegion": "SV-SS", 
  "codigoPostal": "1101",
  
  // Datos completos del pedido
  "pedidoData": {
    "tipo_cliente": "invitado", // o "registrado"
    "cliente": {
      "nombre": "Erick",
      "apellido": "Tiznado",
      "telefono": "50300000000",
      "email": "tiznadoerick3@gmail.com",
      "id_usuario": null // solo si es cliente registrado
    },
    "direccion": {
      "tipo_direccion": "formulario", // o "coordenadas"
      "direccion": "Colonia Escalón, Calle Principal #123",
      "pais": "El Salvador",
      "departamento": "San Salvador", 
      "municipio": "San Salvador",
      "codigo_postal": "1101",
      "instrucciones_entrega": "Casa amarilla, portón negro"
    },
    "productos": [
      {
        "id_producto": 1,
        "nombre_producto": "Pizza Margarita",
        "cantidad": 2,
        "precio_unitario": 12.50,
        "subtotal": 25.00,
        "masa": "tradicional",
        "tamano": "mediana",
        "instrucciones_especiales": "Sin cebolla"
      },
      {
        "id_producto": 2,
        "nombre_producto": "Coca Cola",
        "cantidad": 2,
        "precio_unitario": 1.50,
        "subtotal": 3.00
      }
    ],
    "subtotal": 28.00,
    "costo_envio": 2.50,
    "impuestos": 3.64,
    "total": 34.14,
    "aceptado_terminos": true,
    "tiempo_estimado_entrega": 45
  }
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Pago procesado y pedido creado exitosamente",
  "data": {
    // Datos del pago
    "transactionId": 15,
    "urlPago": "https://checkout.wompi.sv/m/3ds/XXXXXX",
    "monto": 34.14,
    "metodoPago": "tarjeta_credito",
    
    // Datos del pedido creado automáticamente  
    "pedido": {
      "id": 89,
      "codigo": "A7B9X2M1", 
      "estado": "en proceso", // ⭐ AUTOMÁTICAMENTE EN PROCESO
      "total": 34.14,
      "productos_count": 2
    },
    
    // Información adicional
    "processingTime": 1240,
    "message": "El pedido ha sido enviado automáticamente a cocina y está en proceso"
  }
}
```

#### Estados del Pedido:
- **'en proceso'** ⭐ - El pedido se crea automáticamente en este estado (directo a cocina)
- **'en camino'** - Cuando el pedido sale para entrega  
- **'entregado'** - Cuando se completa la entrega
- **'cancelado'** - Si se cancela por alguna razón

### 2. Crear Transacción de Pago (Solo Pago)
**POST** `/api/payments/create`

Crea solo una transacción 3DS con Wompi. **No crea pedido automáticamente.**

#### Request Body:
```json
{
  "numeroTarjeta": "4573690001990693",
  "cvv": "835",
  "mesVencimiento": 12,
  "anioVencimiento": 2029,
  "nombre": "Erick",
  "apellido": "Tiznado",
  "email": "tiznadoerick3@gmail.com",
  "telefono": "50300000000",
  "direccion": "Tu Dirección 123",
  "ciudad": "San Salvador",
  "idPais": "SV",
  "idRegion": "SV-SS",
  "codigoPostal": "1101",
  "monto": 25.50,
  "descripcion": "Pago de pedido #123",
  "pedidoId": 123
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "Transacción creada exitosamente",
  "data": {
    "transactionId": 45,
    "urlPago": "https://checkout.wompi.sv/3ds/abc123def456",
    "monto": 25.50,
    "mensaje": "Redirige al usuario a la URL de pago para completar la transacción"
  }
}
```

#### Response Error (400):
```json
{
  "success": false,
  "message": "Datos de tarjeta inválidos",
  "errors": [
    "Número de tarjeta inválido",
    "CVV inválido"
  ]
}
```

### 3. Transacción de Prueba
**POST** `/api/payments/test`

Crea una transacción de prueba con datos predefinidos para testing.

#### Response Success (200):
```json
{
  "success": true,
  "message": "Transacción de prueba creada",
  "urlPago": "https://checkout.wompi.sv/3ds/test123",
  "data": {
    "urlCompletarPago3Ds": "https://checkout.wompi.sv/3ds/test123",
    "transactionId": "test123"
  }
}
```

### 4. Obtener Todas las Transacciones
**GET** `/api/payments`

Obtiene todas las transacciones (solo administradores).

#### Headers:
```
Authorization: Bearer <admin_token>
```

#### Response:
```json
{
  "success": true,
  "message": "Transacciones obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "url_pago": "https://checkout.wompi.sv/3ds/abc123",
      "monto": 25.50,
      "email": "cliente@example.com",
      "nombre_cliente": "Erick Tiznado",
      "status": "completed",
      "fecha_creacion": "2025-06-29T15:30:00.000Z",
      "usuario_nombre": "Juan Pérez",
      "usuario_email": "juan@example.com"
    }
  ]
}
```

### 5. Obtener Transacción Específica
**GET** `/api/payments/:id`

Obtiene una transacción específica por ID.

#### Headers:
```
Authorization: Bearer <token>
```

#### Response:
```json
{
  "success": true,
  "message": "Transacción obtenida exitosamente",
  "data": {
    "id": 1,
    "url_pago": "https://checkout.wompi.sv/3ds/abc123",
    "monto": 25.50,
    "email": "cliente@example.com",
    "nombre_cliente": "Erick Tiznado",
    "telefono": "50300000000",
    "direccion": "Tu Dirección 123",
    "descripcion": "Pago de pedido #123",
    "pedido_id": 123,
    "status": "completed",
    "wompi_data": {...},
    "fecha_creacion": "2025-06-29T15:30:00.000Z"
  }
}
```

### 6. Actualizar Estado de Transacción
**PUT** `/api/payments/:id/status`

Actualiza el estado de una transacción.

#### Request Body:
```json
{
  "status": "completed",
  "wompiResponse": {
    "transactionId": "abc123",
    "authorizationCode": "123456",
    "responseCode": "00"
  }
}
```

#### Response:
```json
{
  "success": true,
  "message": "Estado de transacción actualizado exitosamente"
}
```

### 7. Confirmación de Pago (Redirect)
**GET** `/api/payments/confirmation`

Endpoint para manejar el redirect desde Wompi después del pago.

#### Query Parameters:
- `transactionId`: ID de la transacción
- `status`: Estado del pago (success/failed)
- `amount`: Monto del pago

## Flujo de Pago

### 1. Crear Transacción
```javascript
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    numeroTarjeta: "4573690001990693",
    cvv: "835",
    mesVencimiento: 12,
    anioVencimiento: 2029,
    nombre: "Erick",
    apellido: "Tiznado",
    email: "tiznadoerick3@gmail.com",
    telefono: "50300000000",
    direccion: "Tu Dirección 123",
    monto: 25.50,
    descripcion: "Pago de pedido #123"
  })
});

const data = await response.json();
```

### 2. Redirigir a Wompi
```javascript
if (data.success) {
  // Redirigir al usuario a la URL de pago 3DS
  window.location.href = data.data.urlPago;
}
```

### 3. Manejar Confirmación
Wompi redirigirá al usuario a `https://mamamianpizza.com/confirmacion` después del pago.

## Estados de Transacción

- `pending`: Transacción creada, esperando pago
- `completed`: Pago completado exitosamente
- `failed`: Pago falló
- `cancelled`: Pago cancelado por el usuario

## Validaciones

### Datos de Tarjeta
- `numeroTarjeta`: 13-19 dígitos
- `cvv`: 3-4 dígitos
- `mesVencimiento`: 1-12
- `anioVencimiento`: Año actual + 10 años máximo

### Datos del Cliente
- `nombre`: Mínimo 2 caracteres
- `apellido`: Mínimo 2 caracteres
- `email`: Formato de email válido
- `telefono`: Mínimo 8 caracteres
- `direccion`: Mínimo 5 caracteres
- `monto`: Mayor a 0

## Códigos de Error

- `400`: Datos inválidos
- `401`: No autorizado
- `404`: Transacción no encontrada
- `500`: Error interno del servidor

## Ejemplo de Integración Frontend

### HTML
```html
<form id="paymentForm">
  <input type="text" id="numeroTarjeta" placeholder="Número de tarjeta" required>
  <input type="text" id="cvv" placeholder="CVV" required>
  <select id="mesVencimiento" required>
    <option value="">Mes</option>
    <option value="1">01</option>
    <!-- ... más opciones ... -->
    <option value="12">12</option>
  </select>
  <input type="number" id="anioVencimiento" placeholder="Año" required>
  <input type="text" id="nombre" placeholder="Nombre" required>
  <input type="text" id="apellido" placeholder="Apellido" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="tel" id="telefono" placeholder="Teléfono" required>
  <input type="text" id="direccion" placeholder="Dirección" required>
  <input type="number" id="monto" placeholder="Monto" step="0.01" required>
  <button type="submit">Procesar Pago</button>
</form>
```

### JavaScript
```javascript
document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    numeroTarjeta: document.getElementById('numeroTarjeta').value,
    cvv: document.getElementById('cvv').value,
    mesVencimiento: parseInt(document.getElementById('mesVencimiento').value),
    anioVencimiento: parseInt(document.getElementById('anioVencimiento').value),
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    email: document.getElementById('email').value,
    telefono: document.getElementById('telefono').value,
    direccion: document.getElementById('direccion').value,
    monto: parseFloat(document.getElementById('monto').value)
  };
  
  try {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirigir a Wompi para completar el pago
      window.location.href = result.data.urlPago;
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el pago');
  }
});
```

## Seguridad

- ✅ Validación de datos en el servidor
- ✅ Tokens de autenticación para endpoints sensibles
- ✅ Logging de todas las transacciones
- ✅ Manejo seguro de credenciales en variables de entorno
- ✅ No almacenamiento de datos sensibles de tarjetas

## Testing

### Datos de Tarjeta de Prueba
```
Número: 4573690001990693
CVV: 835
Vencimiento: 12/2029
```

### Endpoint de Prueba
```bash
curl -X POST https://api.mamamianpizza.com/api/payments/test
```

## 🔄 **Detección Automática de Usuarios Registrados**

El sistema detecta automáticamente si un usuario está registrado de las siguientes maneras:

### 1. **Por ID de Usuario (Recomendado)**
Si el frontend tiene el ID del usuario autenticado:

```json
{
  "id_usuario": 123,  // ID del usuario registrado
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "70123456",
    "email": "juan@email.com",
    "direccion": "Calle 123, San Salvador"
  },
  // ...resto de datos
}
```

### 2. **Por Email (Automático)**
Si no se envía `id_usuario`, el sistema busca automáticamente por email:

```json
{
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "70123456", 
    "email": "juan@email.com",  // El sistema busca este email en usuarios registrados
    "direccion": "Calle 123, San Salvador"
  },
  // ...resto de datos
}
```

### 3. **Como Invitado**
Si no se encuentra el usuario, se trata como invitado automáticamente.

**Resultado:** El pedido se crea con el `tipo_cliente` correcto y se vincula al usuario registrado si existe
