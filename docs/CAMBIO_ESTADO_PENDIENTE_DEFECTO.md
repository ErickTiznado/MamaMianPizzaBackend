# 📋 Cambio: Todos los Pedidos Inician en Estado "Pendiente"

## 🎯 Cambio Implementado

### **Regla Nueva:**
- ✅ **Todos los pedidos** se crean con estado `'pendiente'` por defecto
- ✅ **Sin excepciones** por método de pago
- ✅ **Consistencia total** en el comportamiento inicial

### **Antes del Cambio:**
```javascript
// Efectivo
estado: 'pendiente'

// Tarjeta sin procesar
estado: 'pendiente'

// Tarjeta procesada
estado: 'en proceso' ❌

// Desde sistema de pagos
estado: 'en proceso' ❌
```

### **Después del Cambio:**
```javascript
// TODOS los pedidos
estado: 'pendiente' ✅
```

---

## 🔄 Funciones Actualizadas

### 1. **`createOrder` (Pedidos Directos)**
```javascript
// Simplificado - sin lógica condicional
let estadoInicial = 'pendiente'; // Todos los pedidos inician como pendientes
```

### 2. **`createOrderFromPayment` (Desde Sistema de Pagos)**
```javascript
// Cambio de 'en proceso' a 'pendiente'
const orderInsertValues = [
    codigo_pedido, id_usuario, id_direccion, 'pendiente', // ✅ Cambiado aquí
    total, tipo_cliente, metodoPagoFinal, // ...resto de campos
];
```

---

## 📊 Estados del Ciclo de Vida

### **Flujo Típico de un Pedido:**
```
1. 'pendiente'    ← INICIO (todos los pedidos)
2. 'en proceso'   ← El admin/restaurante confirma
3. 'en camino'    ← Se inicia la entrega
4. 'entregado'    ← Se completa la entrega
```

### **Estados Alternativos:**
```
'pendiente' → 'cancelado' (si se cancela antes de procesar)
```

---

## 💳 Comportamiento por Método de Pago

### **Efectivo:**
- Estado inicial: `'pendiente'`
- Requiere confirmación manual del restaurante
- El pago se realizará al momento de la entrega

### **Tarjeta (Pago Pendiente):**
- Estado inicial: `'pendiente'`
- Requiere procesamiento del pago
- El restaurante debe esperar confirmación de pago

### **Tarjeta (Pago Procesado):**
- Estado inicial: `'pendiente'`
- Pago ya confirmado por Wompi
- Incluye detalles de transacción (`payment_reference`, `payment_authorization`, `payment_completed_at`)
- El restaurante puede procesar inmediatamente

---

## 🔍 Identificación de Pagos Procesados

Aunque todos inician en `'pendiente'`, los pagos ya procesados se pueden identificar por:

```sql
-- Pagos con tarjeta ya procesados
SELECT * FROM pedidos 
WHERE metodo_pago = 'tarjeta' 
AND payment_reference IS NOT NULL 
AND payment_authorization IS NOT NULL;

-- Pagos pendientes de procesamiento
SELECT * FROM pedidos 
WHERE metodo_pago = 'tarjeta' 
AND (payment_reference IS NULL OR payment_authorization IS NULL);
```

---

## 🎯 Beneficios del Cambio

### 1. **Consistencia Total**
- Todos los pedidos siguen el mismo flujo inicial
- No hay excepciones confusas por método de pago

### 2. **Control Manual**
- El restaurante puede revisar todos los pedidos antes de procesarlos
- Mayor control sobre el flujo de trabajo

### 3. **Transparencia**
- Es claro que todos los pedidos requieren revisión inicial
- Los detalles de pago están disponibles para facilitar la decisión

### 4. **Flexibilidad**
- El restaurante puede priorizar pedidos según criterios propios
- Facilita la gestión de inventario y capacidad

---

## 📋 Procedimiento del Restaurante

### **Para Pedidos en Efectivo:**
1. Revisar pedido en estado `'pendiente'`
2. Verificar disponibilidad de productos
3. Cambiar a `'en proceso'` si se acepta
4. Proceder con preparación

### **Para Pedidos con Tarjeta (Pago Pendiente):**
1. Revisar pedido en estado `'pendiente'`
2. **Importante**: Verificar que `payment_reference` sea NULL
3. Esperar confirmación de pago antes de procesar
4. Una vez confirmado el pago, cambiar a `'en proceso'`

### **Para Pedidos con Tarjeta (Pago Procesado):**
1. Revisar pedido en estado `'pendiente'`
2. **Verificar**: `payment_reference` y `payment_authorization` tienen valores
3. **Confirmar**: `payment_completed_at` tiene timestamp
4. Puede procesar inmediatamente (cambiar a `'en proceso'`)

---

## 🔧 Queries Útiles para el Restaurante

### **Ver Todos los Pedidos Pendientes:**
```sql
SELECT 
    codigo_pedido,
    metodo_pago,
    total,
    nombre_cliente,
    telefono,
    payment_reference,
    payment_authorization,
    fecha_pedido
FROM pedidos 
WHERE estado = 'pendiente'
ORDER BY fecha_pedido ASC;
```

### **Identificar Pedidos con Pago Confirmado:**
```sql
SELECT 
    codigo_pedido,
    metodo_pago,
    total,
    nombre_cliente,
    payment_reference,
    payment_authorization,
    payment_completed_at
FROM pedidos 
WHERE estado = 'pendiente'
AND metodo_pago = 'tarjeta'
AND payment_reference IS NOT NULL
ORDER BY payment_completed_at DESC;
```

### **Ver Pedidos Pendientes de Pago:**
```sql
SELECT 
    codigo_pedido,
    metodo_pago,
    total,
    nombre_cliente,
    telefono,
    fecha_pedido
FROM pedidos 
WHERE estado = 'pendiente'
AND metodo_pago = 'tarjeta'
AND payment_reference IS NULL
ORDER BY fecha_pedido ASC;
```

---

## 🚀 Impacto en la Operación

### **Ventajas:**
- ✅ **Mayor control** sobre todos los pedidos
- ✅ **Proceso unificado** independiente del método de pago
- ✅ **Mejor gestión** de la capacidad del restaurante
- ✅ **Claridad total** en el estado inicial

### **Consideraciones:**
- ⚠️ **Requiere acción manual** para todos los pedidos
- ⚠️ **Tiempo de respuesta** puede aumentar si no se monitorea constantemente
- ⚠️ **Necesidad de capacitación** del personal sobre el nuevo flujo

---

## 📞 Recomendaciones

### **Para la Operación Diaria:**
1. **Monitorear constantemente** los pedidos pendientes
2. **Priorizar** pedidos con pago ya procesado
3. **Comunicar** tiempos de espera a clientes cuando sea necesario
4. **Establecer** tiempos máximos de respuesta para cada tipo de pedido

### **Para el Sistema:**
- Considerar notificaciones automáticas para nuevos pedidos
- Implementar alertas por tiempo de permanencia en `'pendiente'`
- Dashboard para visualizar fácilmente el estado de todos los pedidos

**¡El cambio está implementado y todos los pedidos ahora inician en estado 'pendiente'!** 📋✅
