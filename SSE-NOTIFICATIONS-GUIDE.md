# 🔔 Sistema de Notificaciones en Tiempo Real con SSE

Este documento explica cómo implementar y usar el sistema de notificaciones en tiempo real usando Server-Sent Events (SSE).

## ✨ Características

- ✅ Notificaciones en tiempo real sin necesidad de polling
- ✅ Conexión persistente de baja latencia
- ✅ Reconexión automática en caso de falla
- ✅ Broadcast a múltiples clientes conectados
- ✅ Envío de notificaciones históricas al conectarse

## 🛠️ Implementación del Servidor

### Controlador de Notificaciones

El archivo `contollers/notificationController.js` incluye:

1. **Gestión de Conexiones SSE**: Almacena las conexiones activas en un Set
2. **Función de Broadcast**: Envía notificaciones a todos los clientes conectados
3. **Endpoint SSE**: Configura la conexión Server-Sent Events
4. **Integración con CRUD**: Las nuevas notificaciones se envían automáticamente

### Funciones Principales

#### `getNotificationStream(req, res)`
- Configura los headers SSE necesarios
- Establece la conexión persistente
- Envía notificaciones no leídas al cliente nuevo
- Maneja desconexiones y errores

#### `broadcastNotification(notification)`
- Envía una notificación a todos los clientes conectados
- Maneja errores de conexión automáticamente
- Limpia conexiones cerradas

## 🌐 Endpoints de la API

### SSE Stream
```
GET /api/notifications/stream
Content-Type: text/event-stream
```

**Descripción**: Establece una conexión SSE para recibir notificaciones en tiempo real.

**Headers de Respuesta**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Formato de Datos**:
```
data: {"id_notificacion": 1, "titulo": "Nueva notificación", "mensaje": "Mensaje de ejemplo", "tipo": "info", "estado": "no leida", "fecha_emision": "2024-01-01T00:00:00.000Z"}

```

### Endpoints CRUD Existentes

Todos los endpoints CRUD existentes siguen funcionando normalmente:

- `GET /api/notifications` - Obtener todas las notificaciones
- `POST /api/notifications` - Crear notificación (ahora envía SSE automáticamente)
- `GET /api/notifications/unread` - Obtener notificaciones no leídas
- `PATCH /api/notifications/:id/status` - Actualizar estado
- `DELETE /api/notifications/:id` - Eliminar notificación

## 💻 Implementación del Cliente

### JavaScript/Web

```javascript
// Establecer conexión SSE
const eventSource = new EventSource('http://localhost:3000/api/notifications/stream');

// Manejar conexión establecida
eventSource.onopen = function(event) {
    console.log('Conexión SSE establecida');
};

// Recibir notificaciones
eventSource.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    console.log('Nueva notificación:', notification);
    // Mostrar notificación en la UI
    displayNotification(notification);
};

// Manejar errores
eventSource.onerror = function(event) {
    console.error('Error en conexión SSE:', event);
};

// Cerrar conexión cuando sea necesario
function closeConnection() {
    eventSource.close();
}
```

### React/Next.js

```jsx
import { useEffect, useState } from 'react';

function NotificationComponent() {
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource('/api/notifications/stream');
        
        eventSource.onopen = () => {
            setConnected(true);
        };
        
        eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications(prev => [notification, ...prev]);
        };
        
        eventSource.onerror = () => {
            setConnected(false);
        };
        
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div>
            <div>Estado: {connected ? 'Conectado' : 'Desconectado'}</div>
            {notifications.map(notification => (
                <div key={notification.id_notificacion}>
                    <h3>{notification.titulo}</h3>
                    <p>{notification.mensaje}</p>
                </div>
            ))}
        </div>
    );
}
```

### Node.js Cliente

```javascript
const EventSource = require('eventsource');

const eventSource = new EventSource('http://localhost:3000/api/notifications/stream');

eventSource.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    console.log('Notificación recibida:', notification);
};

eventSource.onerror = function(event) {
    console.error('Error SSE:', event);
};
```

## 🚀 Uso del Sistema

### 1. Conectar Cliente
El cliente se conecta al endpoint SSE y recibe automáticamente:
- Notificaciones no leídas existentes
- Nuevas notificaciones en tiempo real

### 2. Crear Notificaciones
Las notificaciones creadas vía API se envían automáticamente a todos los clientes conectados:

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Notificación de Prueba",
    "mensaje": "Esta es una notificación de prueba",
    "tipo": "info"
  }'
```

### 3. Ejemplo Práctico
Abre el archivo `SSE-NOTIFICATIONS-EXAMPLE.html` en tu navegador para ver una demostración completa del sistema.

## 🔧 Configuración

### CORS
El servidor está configurado para permitir conexiones desde cualquier origen:
```javascript
'Access-Control-Allow-Origin': '*'
```

Para producción, especifica los dominios permitidos:
```javascript
'Access-Control-Allow-Origin': 'https://tu-dominio.com'
```

### Timeout y Reconexión
Los navegadores manejan automáticamente la reconexión SSE, pero puedes configurar timeouts personalizados:

```javascript
const eventSource = new EventSource('/api/notifications/stream');

// Reconexión manual en caso de error
eventSource.onerror = function() {
    setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
            location.reload(); // O crear nueva conexión
        }
    }, 5000);
};
```

## 📱 Casos de Uso

### Notificaciones de Sistema
- Nuevos pedidos
- Cambios de estado de pedidos
- Alertas de inventario
- Notificaciones administrativas

### Integración con Otros Módulos
```javascript
// En orderController.js - cuando se crea un nuevo pedido
exports.createOrder = async (req, res) => {
    // ... lógica de creación de pedido ...
    
    // Crear notificación automática
    const notification = {
        titulo: 'Nuevo Pedido',
        mensaje: `Pedido #${pedidoId} recibido`,
        tipo: 'info'
    };
    
    // Enviar notificación (se broadcateará automáticamente)
    await createNotification(notification);
};
```

## 🛡️ Seguridad

### Autenticación
Para endpoints protegidos, agrega middleware de autenticación:

```javascript
router.get('/stream', authenticateToken, notificationController.getNotificationStream);
```

### Rate Limiting
Implementa limitación de conexiones por IP:

```javascript
const rateLimit = require('express-rate-limit');

const sseLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5 // máximo 5 conexiones SSE por IP
});

router.get('/stream', sseLimit, notificationController.getNotificationStream);
```

## 🔍 Debugging

### Log de Conexiones
```javascript
console.log(`Clientes SSE conectados: ${sseClients.size}`);
```

### Verificar Headers
```bash
curl -N -H "Accept: text/event-stream" http://localhost:3000/api/notifications/stream
```

### Herramientas de Desarrollo
- Use las herramientas de desarrollador del navegador (pestaña Network)
- Monitoree la consola para mensajes de conexión/desconexión
- Verifique que los eventos lleguen en formato correcto

## ⚡ Optimizaciones

### Filtrado de Notificaciones
Permite a los clientes suscribirse solo a tipos específicos:

```javascript
router.get('/stream/:tipo', notificationController.getNotificationStreamByType);
```

### Paginación de Historial
Limita las notificaciones iniciales enviadas:

```javascript
// Solo enviar las últimas 10 notificaciones al conectarse
pool.query(
    "SELECT * FROM notificaciones WHERE estado = 'no leida' ORDER BY fecha_emision DESC LIMIT 10",
    // ...
);
```

### Heartbeat
Implementa heartbeat para detectar conexiones muertas:

```javascript
// Enviar ping cada 30 segundos
setInterval(() => {
    sseClients.forEach(client => {
        try {
            client.write(': heartbeat\n\n');
        } catch (error) {
            sseClients.delete(client);
        }
    });
}, 30000);
```

## 🎯 Resultado

Con esta implementación tienes:

1. ✅ **Sistema de notificaciones en tiempo real** funcionando
2. ✅ **API REST completa** para gestión de notificaciones
3. ✅ **Ejemplo HTML funcional** para pruebas
4. ✅ **Documentación completa** para implementación
5. ✅ **Código optimizado** y manejable

¡El sistema está listo para usar! 🚀
