# API de Experiencias MamaMianPizza

Esta documentación describe todos los endpoints disponibles para gestionar el módulo de experiencias de usuarios en la plataforma MamaMianPizza.

## URL Base

```
https://api.mamamianpizza.com/api/experiencias
```

Para entorno de desarrollo:
```
http://localhost:3001/api/experiencias
```

## Endpoints disponibles

## 1. Crear una nueva experiencia

**URL**: `/`

**Método**: `POST`

**Payload requerido**:
```json
{
  "titulo": "Excelente servicio",
  "valoracion": 5,
  "id_usuario": 1,
  "contenido": "La pizza estaba deliciosa y el servicio fue excelente..."
}
```

**Respuesta exitosa (201 Created)**:
```json
{
  "message": "Experiencia creada exitosamente",
  "experiencia": {
    "id_experiencia": 1,
    "titulo": "Excelente servicio",
    "valoracion": 5,
    "contenido": "La pizza estaba deliciosa y el servicio fue excelente...",
    "aprobado": 0,
    "estado": "pendiente",
    "usuario": {
      "id": 1,
      "nombre": "Nombre del Usuario",
      "ruta_foto": "ruta/a/la/foto.jpg"
    }
  }
}
```

## 2. Obtener todas las experiencias

**URL**: `/`

**Método**: `GET`

**Payload**: No requiere

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Todas las experiencias obtenidas exitosamente",
  "estadisticas": {
    "total_experiencias": 25,
    "valoracion_promedio": "4.5",
    "usuarios_activos": 12,
    "experiencias_aprobadas": 18,
    "experiencias_pendientes": 7
  },
  "experiencias": [
    {
      "id_experiencia": 1,
      "titulo": "Excelente servicio",
      "valoracion": 5,
      "contenido": "La pizza estaba deliciosa...",
      "aprobado": 1,
      "estado": "aprobada",
      "usuario": {
        "id": 1,
        "nombre": "Nombre del Usuario",
        "foto_perfil": "ruta/a/la/foto.jpg"
      }
    },
    // ... más experiencias
  ]
}
```

## 3. Obtener experiencias por usuario

**URL**: `/user/:id_usuario`

**Método**: `GET`

**Payload**: No requiere (el ID del usuario va en la URL)

**Ejemplo**: `/user/1`

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Experiencias del usuario obtenidas exitosamente",
  "usuario": {
    "id_usuario": 1,
    "nombre_usuario": "Nombre del Usuario",
    "foto_perfil": "ruta/a/la/foto.jpg",
    "total_experiencias": 5,
    "experiencias_aprobadas": 3,
    "experiencias_pendientes": 2
  },
  "experiencias": [
    {
      "id_experiencia": 1,
      "titulo": "Excelente servicio",
      "valoracion": 5,
      "contenido": "La pizza estaba deliciosa...",
      "aprobado": 1,
      "estado": "aprobada"
    },
    // ... más experiencias del usuario
  ]
}
```

## 4. Obtener experiencias por estado de aprobación

**URL**: `/status/:aprobado`

**Método**: `GET`

**Payload**: No requiere (el estado va en la URL: 0=pendientes, 1=aprobadas)

**Ejemplos**: 
- `/status/1` (aprobadas)
- `/status/0` (pendientes)

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Experiencias aprobadas obtenidas exitosamente",
  "estado_filtro": {
    "codigo": 1,
    "descripcion": "aprobadas"
  },
  "total_experiencias": 18,
  "experiencias": [
    {
      "id_experiencia": 1,
      "titulo": "Excelente servicio",
      "valoracion": 5,
      "contenido": "La pizza estaba deliciosa...",
      "aprobado": 1,
      "estado": "aprobadas",
      "usuario": {
        "id": 1,
        "nombre": "Nombre del Usuario",
        "foto_perfil": "ruta/a/la/foto.jpg"
      }
    },
    // ... más experiencias
  ]
}
```

## 5. Obtener una experiencia por ID

**URL**: `/:id_experiencia`

**Método**: `GET`

**Payload**: No requiere (el ID va en la URL)

**Ejemplo**: `/1`

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Experiencia obtenida exitosamente",
  "experiencia": {
    "id_experiencia": 1,
    "titulo": "Excelente servicio",
    "valoracion": 5,
    "contenido": "La pizza estaba deliciosa...",
    "aprobado": 1,
    "estado": "aprobada",
    "usuario": {
      "id": 1,
      "nombre": "Nombre del Usuario",
      "foto_perfil": "ruta/a/la/foto.jpg"
    }
  }
}
```

## 6. Actualizar una experiencia

**URL**: `/:id_experiencia`

**Método**: `PUT`

**Payload**:
```json
{
  "titulo": "Título actualizado",
  "valoracion": 4,
  "contenido": "Contenido actualizado..."
}
```

**Ejemplo**: `/1`

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Experiencia actualizada exitosamente",
  "experiencia": {
    "id_experiencia": 1,
    "titulo": "Título actualizado",
    "valoracion": 4,
    "contenido": "Contenido actualizado...",
    "aprobado": 1,
    "estado": "aprobada",
    "usuario": {
      "id": 1,
      "nombre": "Nombre del Usuario",
      "foto_perfil": "ruta/a/la/foto.jpg"
    }
  }
}
```

## 7. Cambiar estado de aprobación de una experiencia

**URL**: `/:id_experiencia/approval`

**Método**: `PUT`

**Payload**:
```json
{
  "aprobado": 1
}
```

**Ejemplo**: `/1/approval`

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Estado de experiencia actualizado exitosamente",
  "experiencia": {
    "id_experiencia": 1,
    "titulo": "Excelente servicio",
    "valoracion": 5,
    "contenido": "La pizza estaba deliciosa...",
    "aprobado": 1,
    "estado": "aprobada/visible",
    "usuario": {
      "id": 1,
      "nombre": "Nombre del Usuario",
      "foto_perfil": "ruta/a/la/foto.jpg"
    }
  }
}
```

## 8. Eliminar una experiencia

**URL**: `/:id_experiencia`

**Método**: `DELETE`

**Payload**: No requiere (el ID va en la URL)

**Ejemplo**: `/1`

**Respuesta exitosa (200 OK)**:
```json
{
  "message": "Experiencia eliminada exitosamente",
  "experiencia_eliminada": {
    "id_experiencia": 1,
    "titulo": "Excelente servicio",
    "valoracion": 5,
    "contenido": "La pizza estaba deliciosa...",
    "nombre_usuario": "Nombre del Usuario"
  }
}
```

## Códigos de respuesta

- `200 OK`: La solicitud ha tenido éxito
- `201 Created`: La experiencia ha sido creada correctamente
- `400 Bad Request`: La solicitud tiene un formato incorrecto o faltan datos
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error en el servidor

## Validaciones

- `valoracion`: Debe ser un número entero entre 1 y 5 (estrellas)
- `id_usuario`: Debe ser un entero válido que corresponda a un usuario existente
- `titulo` y `contenido`: Campos de texto requeridos
- Todos los campos marcados como requeridos deben enviarse

## Ejemplos de uso con JavaScript

### Crear una nueva experiencia
```javascript
const createExperience = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/experiencias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: "Excelente servicio",
        valoracion: 5,
        id_usuario: 1,
        contenido: "La pizza estaba deliciosa y el servicio fue excelente..."
      })
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Obtener todas las experiencias
```javascript
const getAllExperiences = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/experiencias');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Aprobar una experiencia
```javascript
const approveExperience = async (id) => {
  try {
    const response = await fetch(`http://localhost:3001/api/experiencias/${id}/approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aprobado: 1
      })
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Notas adicionales

- Las experiencias nuevas se crean por defecto con estado `aprobado = 0` (pendiente de aprobación)
- Solo las experiencias con `aprobado = 1` deberían mostrarse públicamente en la web
- Para mostrar las mejores experiencias, puedes filtrar por `aprobado = 1` y ordenar por `valoracion` descendente
- Para cuestiones de administración, utiliza el endpoint `getAllExperiencias` que incluye estadísticas útiles
