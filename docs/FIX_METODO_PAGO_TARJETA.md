# 🔧 Fix: Método de Pago "tarjeta" No Reconocido

## 📋 Problema Identificado

### Síntomas:
- ✅ **Pago procesado exitosamente** en Wompi
- ❌ **Pedido no creado** automáticamente
- ⚠️ **Error en logs**: `Método de pago inválido: tarjeta`

### Causa Raíz:
El sistema tenía una inconsistencia en los nombres de métodos de pago:
- **Frontend enviaba**: `'tarjeta'`
- **Sistema esperaba**: `'tarjeta_credito'`
- **Función createOrder solo aceptaba**: `'efectivo'`

---

## ✅ Solución Implementada

### 1. **Normalización de Métodos de Pago**

Se actualizó el controlador de pedidos para:
- ✅ Aceptar tanto `'efectivo'` como `'tarjeta_credito'`
- ✅ Mapear automáticamente `'tarjeta'` → `'tarjeta_credito'`
- ✅ Validar métodos de pago de forma más flexible

```javascript
// Antes (solo efectivo)
const metodosValidos = ['efectivo'];

// Después (efectivo y tarjeta)
let metodoPagoNormalizado = metodo_pago;
if (metodo_pago === 'tarjeta') {
    metodoPagoNormalizado = 'tarjeta_credito';
}
const metodosValidos = ['efectivo', 'tarjeta_credito'];
```

### 2. **Estados de Pedido Apropiados**

Se implementó lógica para asignar estados iniciales correctos:
- **Efectivo**: `'pendiente'` (requiere confirmación manual)
- **Tarjeta**: `'pendiente_pago'` (requiere procesamiento de pago)

```javascript
let estadoInicial = 'pendiente'; // Default para efectivo
if (metodo_pago === 'tarjeta_credito') {
    estadoInicial = 'pendiente_pago'; // Para tarjetas
}
```

### 3. **Logging Mejorado**

Se agregó logging detallado para tracking:
```javascript
console.log(`💳 [${requestId}] Método de pago: ${metodo_pago}`);
console.log(`📊 [${requestId}] Estado inicial: ${estadoInicial}`);
console.log(`🔄 [${requestId}] Método normalizado: 'tarjeta' -> 'tarjeta_credito'`);
```

---

## 🔧 Scripts de Corrección

### Script de Reparación: `scripts/corregir-metodos-pago.js`

Funcionalidades:
- ✅ Busca pedidos con `metodo_pago = 'tarjeta'`
- ✅ Los convierte a `'tarjeta_credito'`
- ✅ Muestra distribución de métodos de pago
- ✅ Identifica métodos no estándar

```bash
# Ejecutar script de corrección
node scripts/corregir-metodos-pago.js
```

---

## 📊 Verificación Post-Fix

### 1. **Verificar Pedidos Corregidos**
```sql
-- Ver distribución de métodos de pago
SELECT 
    metodo_pago, 
    COUNT(*) as cantidad,
    SUM(total) as monto_total
FROM pedidos 
GROUP BY metodo_pago 
ORDER BY cantidad DESC;
```

### 2. **Verificar Pedidos Recientes**
```sql
-- Ver pedidos recientes con método de pago
SELECT 
    codigo_pedido,
    metodo_pago,
    estado,
    total,
    fecha_pedido
FROM pedidos 
WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY fecha_pedido DESC;
```

### 3. **Verificar Transacciones vs Pedidos**
```sql
-- Relacionar transacciones con pedidos
SELECT 
    t.id as transaction_id,
    t.monto,
    t.estado as transaction_status,
    p.codigo_pedido,
    p.metodo_pago,
    p.estado as order_status
FROM transacciones t
LEFT JOIN pedidos p ON t.pedido_id = p.id_pedido
WHERE t.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY t.fecha_creacion DESC;
```

---

## 🔄 Flujo Actualizado para Pagos con Tarjeta

### Método 1: A través del Sistema de Pagos (Recomendado)
```
Frontend → /api/payments/process-order → Wompi → Confirmation → Auto Order Creation
```

### Método 2: Pedido Directo con Tarjeta
```
Frontend → /api/orders/neworder (metodo_pago: 'tarjeta') → Estado: 'pendiente_pago'
```

---

## 🚨 Validaciones Implementadas

### En `createOrder`:
- ✅ Acepta `'efectivo'` y `'tarjeta_credito'`
- ✅ Mapea `'tarjeta'` → `'tarjeta_credito'` automáticamente
- ✅ Asigna estado inicial apropiado según método de pago

### En `createOrderFromPayment`:
- ✅ Siempre usa `'tarjeta_credito'` para pagos procesados
- ✅ Estado inicial: `'en proceso'` (pago ya confirmado)

---

## 🔍 Monitoreo Continuo

### Logs a Revisar:
```bash
# Buscar errores de método de pago
grep "Método de pago inválido" logs/*.log

# Verificar normalizaciones exitosas
grep "Método normalizado" logs/*.log

# Verificar creación de pedidos con tarjeta
grep "tarjeta_credito" logs/*.log
```

### Métricas Importantes:
- **Tasa de éxito de pagos**: (Transacciones exitosas / Total intentos)
- **Pedidos huérfanos**: Transacciones sin pedido asociado
- **Métodos de pago no estándar**: Detectar inconsistencias

---

## 📞 Resolución de Problemas

### Si el error persiste:

1. **Verificar que el frontend envíe el formato correcto**:
```javascript
// Correcto
{ metodo_pago: 'tarjeta_credito' }
// También acepta (se normaliza automáticamente)
{ metodo_pago: 'tarjeta' }
```

2. **Verificar que se use el endpoint correcto**:
- Para pagos: `/api/payments/process-order`
- Para pedidos directos: `/api/orders/neworder`

3. **Ejecutar script de corrección**:
```bash
node scripts/corregir-metodos-pago.js
```

4. **Verificar logs del servidor** para confirmar normalización.

---

## 📈 Impacto del Fix

### Antes:
- ❌ Pagos exitosos sin pedidos creados
- ❌ Inconsistencia en métodos de pago
- ❌ Dificultad para rastrear problemas

### Después:
- ✅ Pagos con tarjeta funcionan correctamente
- ✅ Métodos de pago normalizados automáticamente
- ✅ Estados de pedido apropiados
- ✅ Logging detallado para debugging
- ✅ Scripts de corrección disponibles

**¡El sistema ahora maneja pagos con tarjeta de forma robusta y consistente!** 🎉
