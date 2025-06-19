# 📋 SISTEMA DE GESTIÓN DE LOGS - API DOCUMENTATION

## Descripción General
Sistema completo para el manejo de logs de actividad en la API de MamaMianPizza. Permite rastrear todas las acciones realizadas por usuarios y administradores, proporcionando auditoría completa del sistema.

## Estructura de Base de Datos

### Tabla `logs`
```sql
CREATE TABLE `logs` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Campos Explicados
- **id_log**: Identificador único del log (AUTO_INCREMENT)
- **id_usuario**: ID del usuario que realizó la acción (puede ser `usuarios.id_usuario` o `administradores.id_admin`)
- **accion**: Tipo de acción realizada (LOGIN, CREATE, UPDATE, DELETE, etc.)
- **tabla_afectada**: Tabla de la base de datos que fue afectada por la acción
- **fecha_hora**: Timestamp automático de cuándo ocurrió la acción
- **descripcion**: Descripción detallada de la acción (opcional)

## 📋 Endpoints de la API

### Base URL: `/api/logs`

---

### 1. Obtener Todos los Logs
**GET** `/api/logs`

Obtiene todos los logs del sistema con filtros opcionales y paginación.

#### Query Parameters (opcionales):
- `limit` (number): Cantidad de logs por página (default: 50)
- `page` (number): Número de página (default: 1)
- `accion` (string): Filtrar por tipo de acción
- `tabla_afectada` (string): Filtrar por tabla afectada
- `fecha_inicio` (date): Fecha de inicio (YYYY-MM-DD)
- `fecha_fin` (date): Fecha de fin (YYYY-MM-DD)
- `id_usuario` (number): Filtrar por ID de usuario
- `search` (string): Búsqueda en descripción, acción y tabla

#### Ejemplo de Request:
```bash
GET /api/logs?limit=20&page=1&accion=LOGIN&fecha_inicio=2024-01-01
```

#### Ejemplo de Response:
```json
{
  "message": "Logs obtenidos exitosamente",
  "pagination": {
    "current_page": 1,
    "total_pages": 15,
    "total_logs": 298,
    "logs_per_page": 20,
    "has_next_page": true,
    "has_prev_page": false
  },
  "filters_applied": {
    "accion": "LOGIN",
    "tabla_afectada": null,
    "fecha_inicio": "2024-01-01",
    "fecha_fin": null,
    "id_usuario": null,
    "search": null
  },
  "estadisticas": {
    "total_logs_filtrados": 298,
    "total_logs_sistema": 1543,
    "acciones_unicas": 12,
    "tablas_afectadas": 8,
    "usuarios_activos": 45,
    "primer_log": "2024-01-01T10:00:00.000Z",
    "ultimo_log": "2024-01-15T16:30:00.000Z"
  },
  "logs": [
    {
      "id_log": 1543,
      "usuario": {
        "id": 25,
        "nombre": "Juan Pérez",
        "correo": "juan@example.com",
        "tipo": "administrador",
        "rol": "admin"
      },
      "accion": "LOGIN",
      "tabla_afectada": "administradores",
      "fecha_hora": "2024-01-15T16:30:00.000Z",
      "descripcion": "Inicio de sesión exitoso del administrador: Juan Pérez (juan@example.com) - Rol: admin"
    }
  ]
}
```

---

### 2. Obtener Log por ID
**GET** `/api/logs/:id`

Obtiene un log específico por su ID.

#### Parámetros:
- `id` (number): ID del log

#### Ejemplo de Request:
```bash
GET /api/logs/1543
```

#### Ejemplo de Response:
```json
{
  "message": "Log obtenido exitosamente",
  "log": {
    "id_log": 1543,
    "usuario": {
      "id": 25,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "tipo": "administrador",
      "rol": "admin"
    },
    "accion": "LOGIN",
    "tabla_afectada": "administradores",
    "fecha_hora": "2024-01-15T16:30:00.000Z",
    "descripcion": "Inicio de sesión exitoso del administrador: Juan Pérez (juan@example.com) - Rol: admin"
  }
}
```

---

### 3. Obtener Logs por Usuario
**GET** `/api/logs/user/:id_usuario`

Obtiene todos los logs de un usuario específico.

#### Parámetros:
- `id_usuario` (number): ID del usuario

#### Query Parameters (opcionales):
- `limit` (number): Cantidad de logs por página (default: 50)
- `page` (number): Número de página (default: 1)
- `accion` (string): Filtrar por tipo de acción
- `tabla_afectada` (string): Filtrar por tabla afectada

#### Ejemplo de Request:
```bash
GET /api/logs/user/25?limit=10&accion=LOGIN
```

#### Ejemplo de Response:
```json
{
  "message": "Logs del usuario obtenidos exitosamente",
  "usuario": {
    "id": 25,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "tipo": "administrador"
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_logs": 28,
    "logs_per_page": 10
  },
  "estadisticas_usuario": {
    "total_acciones": 156,
    "acciones_diferentes": 8,
    "tablas_afectadas": 5,
    "primera_accion": "2024-01-01T08:00:00.000Z",
    "ultima_accion": "2024-01-15T16:30:00.000Z"
  },
  "logs": [
    {
      "id_log": 1543,
      "accion": "LOGIN",
      "tabla_afectada": "administradores",
      "fecha_hora": "2024-01-15T16:30:00.000Z",
      "descripcion": "Inicio de sesión exitoso del administrador: Juan Pérez (juan@example.com) - Rol: admin"
    }
  ]
}
```

---

### 4. Obtener Estadísticas de Logs
**GET** `/api/logs/stats`

Obtiene estadísticas completas del sistema de logs.

#### Query Parameters (opcionales):
- `periodo` (string): Período de análisis (`dia`, `semana`, `mes`, `año`, `todo`) (default: `mes`)

#### Ejemplo de Request:
```bash
GET /api/logs/stats?periodo=semana
```

#### Ejemplo de Response:
```json
{
  "message": "Estadísticas de logs obtenidas exitosamente",
  "periodo": {
    "filtro": "semana",
    "descripcion": "esta semana"
  },
  "estadisticas_generales": {
    "total_logs": 342,
    "acciones_diferentes": 15,
    "tablas_afectadas": 8,
    "usuarios_activos": 23,
    "acciones_sistema": 45
  },
  "top_acciones": [
    {
      "accion": "LOGIN",
      "frecuencia": 89,
      "porcentaje": 26.02
    },
    {
      "accion": "CREATE",
      "frecuencia": 67,
      "porcentaje": 19.59
    }
  ],
  "top_tablas": [
    {
      "tabla": "productos",
      "frecuencia": 78,
      "porcentaje": 22.81
    },
    {
      "tabla": "pedidos",
      "frecuencia": 65,
      "porcentaje": 19.01
    }
  ],
  "actividad_diaria": [
    {
      "fecha": "2024-01-15",
      "cantidad_logs": 67,
      "acciones_diferentes": 12,
      "usuarios_activos": 15
    }
  ],
  "usuarios_mas_activos": [
    {
      "id": 25,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "tipo": "administrador",
      "total_acciones": 45,
      "acciones_diferentes": 8,
      "ultima_actividad": "2024-01-15T16:30:00.000Z"
    }
  ]
}
```

---

### 5. Crear Nuevo Log
**POST** `/api/logs`

Crea un nuevo log en el sistema (principalmente para uso interno).

#### Body Parameters:
- `id_usuario` (number, opcional): ID del usuario que realiza la acción
- `accion` (string, requerido): Tipo de acción realizada
- `tabla_afectada` (string, requerido): Tabla afectada por la acción
- `descripcion` (string, opcional): Descripción detallada de la acción

#### Ejemplo de Request:
```json
{
  "id_usuario": 25,
  "accion": "CREATE",
  "tabla_afectada": "productos",
  "descripcion": "Producto creado: 'Pizza Suprema' (ID: 123) en categoría 'Pizzas Especiales'"
}
```

#### Ejemplo de Response:
```json
{
  "message": "Log creado exitosamente",
  "log": {
    "id_log": 1544,
    "usuario": {
      "id": 25,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "tipo": "administrador"
    },
    "accion": "CREATE",
    "tabla_afectada": "productos",
    "fecha_hora": "2024-01-15T16:35:00.000Z",
    "descripcion": "Producto creado: 'Pizza Suprema' (ID: 123) en categoría 'Pizzas Especiales'"
  }
}
```

---

### 6. Limpiar Logs Antiguos
**DELETE** `/api/logs/cleanup`

Elimina logs antiguos del sistema para mantener la base de datos optimizada.

#### Body Parameters:
- `dias` (number, opcional): Días de retención (default: 90)

#### Ejemplo de Request:
```json
{
  "dias": 120
}
```

#### Ejemplo de Response:
```json
{
  "message": "Limpieza de logs completada exitosamente",
  "configuracion": {
    "dias_retencion": 120,
    "fecha_corte": "2023-09-17"
  },
  "resultados": {
    "logs_identificados": 856,
    "logs_eliminados": 856,
    "logs_retenidos": 0
  }
}
```

## 🔍 Tipos de Acciones Comunes

### Autenticación
- `LOGIN` - Inicio de sesión exitoso
- `LOGIN_FAILED` - Intento de inicio de sesión fallido
- `LOGOUT` - Cierre de sesión
- `CHANGE_PASSWORD` - Cambio de contraseña de usuario
- `CHANGE_PASSWORD_ADMIN` - Cambio de contraseña de administrador

### Operaciones CRUD
- `CREATE` - Creación de registros
- `READ` - Lectura de registros (opcional)
- `UPDATE` - Actualización de registros
- `DELETE` - Eliminación de registros

### Errores
- `CREATE_ERROR` - Error al crear registros
- `UPDATE_ERROR` - Error al actualizar registros
- `READ_ERROR` - Error al leer registros

### Sistema
- `SYSTEM_STARTUP` - Inicio del sistema
- `SYSTEM_SHUTDOWN` - Apagado del sistema
- `MAINTENANCE` - Tareas de mantenimiento

## 🏷️ Tablas Monitoreadas

- `usuarios` - Gestión de usuarios clientes
- `administradores` - Gestión de administradores
- `productos` - Gestión de productos/pizzas
- `pedidos` - Gestión de pedidos
- `categorias` - Gestión de categorías
- `precios` - Gestión de precios
- `resenas` - Gestión de reseñas
- `experiencias` - Gestión de experiencias
- `reservas` - Gestión de reservas
- `ingredientes` - Gestión de inventario

## 🔧 Uso Interno del Sistema

### Función Helper para Logging
El sistema incluye una función helper en `contentController.js` que puede ser reutilizada:

```javascript
const logAction = (id_usuario, accion, tabla_afectada, descripcion) => {
    pool.query(
        'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
        [id_usuario, accion, tabla_afectada, descripcion],
        (logErr) => {
            if (logErr) {
                console.error('Error al registrar en logs:', logErr);
            } else {
                console.log(`📝 Log registrado: ${accion} en ${tabla_afectada}`);
            }
        }
    );
};
```

### Ejemplos de Uso en Controladores

```javascript
// Ejemplo 1: Login exitoso
const descripcionLog = `Inicio de sesión exitoso del usuario: ${user.nombre} (${user.correo})`;
pool.query(
    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
    [user.id_usuario, 'LOGIN', 'usuarios', descripcionLog]
);

// Ejemplo 2: Creación de producto
const descripcionLog = `Producto creado: "${titulo}" (ID: ${pizzaId}) en categoría "${categoria}"`;
logAction(null, 'CREATE', 'productos', descripcionLog);

// Ejemplo 3: Error en operación
const descripcionLog = `Error al crear producto: "${titulo}" - ${err.message}`;
logAction(null, 'CREATE_ERROR', 'productos', descripcionLog);
```

## 🔒 Consideraciones de Seguridad

1. **Información Sensible**: Los logs no deben contener contraseñas o información sensible
2. **Retención**: Se recomienda limpiar logs antiguos periódicamente (90-120 días)
3. **Acceso**: El acceso a logs debe estar restringido a administradores
4. **Auditoría**: Los logs proporcionan una pista de auditoría completa del sistema

## 📊 Casos de Uso

### Para Administradores
- Monitorear actividad de usuarios
- Detectar intentos de acceso no autorizado
- Rastrear cambios en productos y precios
- Analizar patrones de uso del sistema
- Investigar errores y problemas

### Para Desarrolladores
- Debugging de problemas en producción
- Análisis de rendimiento del sistema
- Identificación de funcionalidades más utilizadas
- Monitoreo de errores y excepciones

### Para Auditoría
- Cumplimiento normativo
- Rastreo de cambios críticos
- Evidencia de acciones realizadas
- Análisis forense en caso de incidentes

## ⚡ Rendimiento

- Los logs se indexan automáticamente por `fecha_hora` para consultas rápidas
- La paginación permite manejar grandes volúmenes de datos
- Los filtros optimizan las consultas específicas
- La limpieza automática mantiene el rendimiento del sistema

## 🚨 Códigos de Error

- **400**: Parámetros inválidos o faltantes
- **404**: Log o usuario no encontrado
- **500**: Error interno del servidor o base de datos

---

**Desarrollado para MamaMianPizza API**  
*Sistema completo de gestión de logs y auditoría*
