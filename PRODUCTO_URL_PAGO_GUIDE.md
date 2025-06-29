# Guía para Agregar URL de Pago a Productos

## Campo url_pago en la Base de Datos

La tabla `productos` incluye el campo `url_pago` con las siguientes características:
- **Tipo:** `varchar(300)`
- **Requerido:** `NOT NULL`
- **Descripción:** URL de pago específica para cada producto

## Estructura de la Tabla Productos

```sql
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text,
  `seccion` varchar(50) DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `imagen` varchar(255) DEFAULT NULL,
  `url_pago` varchar(300) NOT NULL,  -- 🆕 Campo requerido para URL de pago
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`)
);
```

## API Endpoints Actualizados

### 1. Crear Producto (POST /api/content/submit)

**Campos requeridos:**
- `titulo` (string)
- `descripcion` (string) 
- `categoria` (string)
- `sesion` (string)
- `precios` (object)
- `url_pago` (string) - **🆕 NUEVO CAMPO REQUERIDO**
- `activo` (boolean, opcional)
- `imagen` (file, opcional)

**Ejemplo de petición con FormData:**
```javascript
const formData = new FormData();
formData.append('titulo', 'Pizza Suprema');
formData.append('descripcion', 'Pizza con todos los ingredientes');
formData.append('categoria', 'Pizza');
formData.append('sesion', 'Las más populares');
formData.append('url_pago', 'https://checkout.wompi.co/p/BA4cGUUzOI'); // 🆕 REQUERIDO
formData.append('precios', JSON.stringify({
  "1": "6.00",  // Personal
  "2": "8.00",  // Mediana
  "3": "10.00", // Grande
  "4": "14.00"  // Gigante
}));
formData.append('activo', true);
// Opcional: formData.append('imagen', fileInput.files[0]);

fetch('/api/content/submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

### 2. Actualizar Producto (PUT /api/content/updateContent/:id_producto)

**Campos requeridos (mismos que crear):**
- Todos los campos incluyendo `url_pago`

**Ejemplo de petición:**
```javascript
const formData = new FormData();
formData.append('titulo', 'Pizza Suprema Actualizada');
formData.append('descripcion', 'Descripción actualizada');
formData.append('categoria', 'Pizza');
formData.append('sesion', 'Recomendación de la casa');
formData.append('url_pago', 'https://checkout.wompi.co/p/NUEVA_URL'); // 🆕 URL actualizada
formData.append('precios', JSON.stringify({
  "1": "7.00",
  "2": "9.00", 
  "3": "11.00",
  "4": "15.00"
}));

fetch('/api/content/updateContent/8', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

### 3. Obtener Menú (GET /api/content/getMenu)

**Respuesta actualizada incluye url_pago:**
```json
{
  "message": "Menú cargado",
  "menu": [
    {
      "id": 8,
      "titulo": "Pizza de camarón",
      "descripcion": "Salsa de tomate, queso mozzarella y camarón",
      "imagen": "https://api.mamamianpizza.com/uploads/imagen-123.png",
      "url_pago": "https://checkout.wompi.co/p/BA4cGUUzOI",
      "activo": true,
      "categoria": "Pizza",
      "categoria_descripcion": "Categoria dedicada a las pizzas",
      "opciones": [
        {
          "tamanoId": 1,
          "nombre": "Personal", 
          "precio": 4.00
        },
        {
          "tamanoId": 2,
          "nombre": "Mediana",
          "precio": 6.00
        }
      ]
    }
  ]
}
```

## Endpoints Que Incluyen url_pago

✅ **GET /api/content/getMenu** - Incluye url_pago en la respuesta
✅ **GET /api/content/MostPopular** - Incluye url_pago (usa SELECT *)
✅ **GET /api/content/recomendacion** - Incluye url_pago (usa SELECT *)

## Validaciones

- El campo `url_pago` es **requerido** en ambos endpoints (crear y actualizar)
- Si no se proporciona, la API devuelve error 400: "Faltan datos requeridos"
- La URL puede tener hasta 300 caracteres

## Ejemplos de URLs de Pago Válidas

```
https://checkout.wompi.co/p/BA4cGUUzOI
https://links.wompi.co/l/abc123
https://pay.stripe.com/links/xyz789
https://checkout.paypal.com/payment/def456
```

## Notas Importantes

1. **Compatibilidad:** Todos los productos existentes deben tener un `url_pago` válido
2. **Migración:** Productos existentes con `url_pago` vacío deben ser actualizados
3. **Frontend:** Actualizar formularios para incluir el campo `url_pago`
4. **Validación:** Considerar validar formato de URL en el frontend y backend

## Verificación de Cambios

Para verificar que los cambios funcionan correctamente:

1. **Crear producto nuevo** con url_pago
2. **Actualizar producto existente** incluyendo url_pago  
3. **Consultar menú** y verificar que url_pago aparece en la respuesta
4. **Consultar productos populares/recomendados** y verificar url_pago

## Logs de Sistema

Los cambios en productos se registran en la tabla `logs`:
- `CREATE` - Cuando se crea un producto nuevo
- `UPDATE` - Cuando se actualiza un producto existente
- `READ` - Cuando se consultan productos

Ejemplos de logs:
```
Producto creado: "Pizza Suprema" (ID: 15) en categoría "Pizza" con 4 precios configurados
Producto actualizado: "Pizza Suprema" (ID: 15) en categoría "Pizza" con 4 precios actualizados
```
