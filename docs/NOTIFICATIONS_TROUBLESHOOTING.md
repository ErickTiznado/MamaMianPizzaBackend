# 🔔 Sistema de Notificaciones - Guía de Troubleshooting

## Problemas Identificados y Solucionados

### ❌ **Problema 1: Llamada incorrecta a notifyOrder**
**Ubicación:** `orderController.js` línea 2848
**Error:** Se estaba pasando parámetros incorrectos a la función `notifyOrder`
```javascript
// ❌ ANTES (incorrecto)
await notifyOrder(id_pedido, 'new_order_from_payment');

// ✅ DESPUÉS (correcto)
await notifyOrder({orderId: id_pedido, total});
```

### ❌ **Problema 2: Variables de entorno faltantes**
**Causa:** El sistema fallaba si no estaban configuradas `NOTIF_URL` y `NOTIF_KEY`
**Solución:** Ahora el sistema funciona localmente aunque no estén configuradas

### ✅ **Mejoras Implementadas**

#### 1. **Sistema Híbrido de Notificaciones**
- **Local:** Crea notificaciones en la base de datos local
- **Externo:** Si están configuradas las variables, también envía a servicio externo
- **Resiliente:** No falla si faltan variables de entorno

#### 2. **Logging Mejorado**
- Logs detallados en cada paso del proceso
- Conteo de clientes SSE conectados
- Tracking de errores específicos

#### 3. **Manejo de Errores Robusto**
- Continúa funcionando aunque fallen notificaciones externas
- Limpia conexiones SSE cerradas automáticamente
- Mensajes de error descriptivos

## 🔧 Cómo Usar el Sistema

### **Crear Notificación Manual**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Notificación de prueba",
    "mensaje": "Esta es una prueba del sistema de notificaciones",
    "tipo": "test"
  }'
```

### **Notificación Automática de Pedido**
Se activa automáticamente cuando se crea un pedido:
```javascript
// En orderController.js - se ejecuta después de crear el pedido
await notifyOrder({orderId: id_pedido, total});
```

### **Conectar al Stream SSE**
```javascript
const eventSource = new EventSource('http://localhost:3000/api/notifications/stream');
eventSource.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    console.log('Nueva notificación:', notification);
};
```

## 🚨 Debugging

### **Ejecutar Pruebas de Notificaciones**
```bash
cd /path/to/MamaMianPizzaBackend
node test/test-notifications.js
```

### **Verificar Logs del Servidor**
Busca en los logs del servidor estos mensajes:
- `📝 Creando nueva notificación...`
- `✅ Notificación creada en BD con ID: X`
- `📡 Broadcasting notificación a X clientes SSE`
- `🔗 Nueva conexión SSE solicitada`

### **Verificar Base de Datos**
```sql
-- Ver todas las notificaciones
SELECT * FROM notificaciones ORDER BY fecha_emision DESC;

-- Ver notificaciones no leídas
SELECT * FROM notificaciones WHERE estado = 'no leida';

-- Contar notificaciones por tipo
SELECT tipo, COUNT(*) as total FROM notificaciones GROUP BY tipo;
```

### **Verificar Variables de Entorno**
```bash
echo $NOTIF_URL
echo $NOTIF_KEY
echo $SERVER_URL
```

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications` | Obtener todas las notificaciones |
| GET | `/api/notifications/unread` | Obtener notificaciones no leídas |
| GET | `/api/notifications/stream` | Stream SSE en tiempo real |
| POST | `/api/notifications` | Crear nueva notificación |
| PATCH | `/api/notifications/:id/status` | Actualizar estado |
| DELETE | `/api/notifications/:id` | Eliminar notificación |

## 🔍 Checklist de Verificación

- [ ] Servidor corriendo en puerto correcto
- [ ] Base de datos conectada
- [ ] Tabla `notificaciones` existe
- [ ] CORS configurado correctamente
- [ ] Variables de entorno definidas (opcional)
- [ ] Frontend conectado al stream SSE
- [ ] Logs mostrando actividad

## 🛠️ Variables de Entorno Opcionales

```env
# Para notificaciones externas (opcional)
NOTIF_URL=https://external-notification-service.com
NOTIF_KEY=your-secret-key

# URL del servidor local (por defecto: http://localhost:3000)
SERVER_URL=http://localhost:3000
```

## 📱 Estructura de Notificación

```json
{
  "id_notificacion": 123,
  "titulo": "Nuevo pedido recibido #456",
  "mensaje": "Pedido #456 por un total de $25.99.",
  "tipo": "pedido",
  "estado": "no leida",
  "fecha_emision": "2025-07-01T10:30:00.000Z"
}
```

---

**¡El sistema de notificaciones ahora es más robusto y debuggeable!** 🎉
