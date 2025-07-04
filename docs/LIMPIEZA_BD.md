# Limpieza de Base de Datos para MamaMianPizza

Este documento explica cómo usar el script para limpiar la base de datos mientras se preservan únicamente los administradores.

## Instrucciones

Para limpiar la base de datos y preservar únicamente los administradores, tienes las siguientes opciones:

### Opción 1: Usar el script de ayuda (recomendado)

En Windows:
```
scripts\clean-db.cmd
```

En Linux/Mac:
```
bash scripts/clean-db.sh
```

### Opción 2: Ejecutar directamente el script Node.js

```
node scripts/clean-db.js
```

> **Importante:** Usa siempre barras diagonales (`/`) en lugar de barras invertidas (`\`) para las rutas, o encierra la ruta entre comillas dobles.

## ¿Qué hace el script?

El script realizará las siguientes acciones:

1. Muestra una advertencia y pide confirmación
2. Al confirmar con "SI" (en mayúsculas):
   - Elimina todos los pedidos y detalles de pedidos
   - Elimina todas las transacciones de pago
   - Elimina reseñas y experiencias de cliente
   - Elimina reservas
   - Limpia direcciones de entrega
   - Elimina logs no esenciales

Los datos que se conservan son:
- Todos los administradores (y sus cuentas de usuario asociadas)
- Productos y categorías (estructura de menú)

## Solución de problemas

Si encuentras el error `Error: Cannot find module`, asegúrate de:
1. Estar en la carpeta raíz del proyecto
2. Usar barras diagonales (`/`) en lugar de barras invertidas (`\`)
3. O usar el script de ayuda proporcionado

## Seguridad

Este script verifica automáticamente que haya usuarios y administradores en la base de datos antes de proceder. Si no hay, se cancelará la operación para evitar pérdida de datos.
