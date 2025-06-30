# 🚨 SISTEMA OBSOLETO - URL DE PAGO ELIMINADO

## ⚠️ AVISO IMPORTANTE

**Este sistema de URL de pago ha sido ELIMINADO y reemplazado por el nuevo sistema de pagos integrado con Wompi.**

## 🔄 Nueva Implementación

El sistema ahora utiliza:

- **Pagos directos con Wompi 3DS**
- **Creación automática de pedidos**
- **Estados automáticos ('en proceso')**
- **Integración completa frontend-backend**

## 📖 Documentación Actualizada

Consulta la documentación actualizada en:
- `docs/PAYMENTS_API.md` - API completa de pagos
- `examples/frontend-payment-example.js` - Ejemplos para frontend
- `test/test-automatic-order-payment.js` - Pruebas automatizadas

## 🚀 Endpoint Principal

```javascript
POST /api/payments/process-order
```

Este endpoint:
✅ Procesa el pago con Wompi  
✅ Crea automáticamente el pedido en estado 'en proceso'  
✅ Envía el pedido directo a cocina  
✅ Vincula transacción con pedido  

## 📋 Migración

Si tenías código que usaba el sistema anterior:

1. **Elimina** cualquier referencia a `url_pago` 
2. **Implementa** el nuevo endpoint `/api/payments/process-order`
3. **Usa** los ejemplos en `examples/frontend-payment-example.js`
