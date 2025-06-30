// test-database-columns.js
// Script para probar que las columnas de la base de datos coinciden

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306
});

console.log('🔍 ===== VERIFICANDO COLUMNAS DE TABLA TRANSACCIONES =====');

// Query para obtener la estructura de la tabla
const query = `
    SELECT 
        COLUMN_NAME as columna,
        DATA_TYPE as tipo,
        IS_NULLABLE as nulo,
        COLUMN_DEFAULT as defecto,
        COLUMN_COMMENT as comentario
    FROM information_schema.columns 
    WHERE table_schema = ? 
    AND table_name = 'transacciones'
    ORDER BY ORDINAL_POSITION
`;

pool.query(query, [process.env.DB_DATABASE], (err, results) => {
    if (err) {
        console.error('❌ Error al consultar estructura:', err);
        process.exit(1);
    }

    console.log('\n📋 ESTRUCTURA ACTUAL DE LA TABLA transacciones:');
    console.log('='.repeat(80));
    
    results.forEach((column, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${column.columna.padEnd(25)} | ${column.tipo.padEnd(15)} | ${column.nulo === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🎯 MAPEO PARA EL CÓDIGO:');
    console.log('='.repeat(50));
    
    const mapping = {
        'Frontend -> Base de datos': '',
        'email -> email_cliente': results.find(c => c.columna === 'email_cliente') ? '✅' : '❌',
        'telefono -> telefono_cliente': results.find(c => c.columna === 'telefono_cliente') ? '✅' : '❌',
        'direccion -> direccion_cliente': results.find(c => c.columna === 'direccion_cliente') ? '✅' : '❌',
        'status -> estado': results.find(c => c.columna === 'estado') ? '✅' : '❌',
        'wompi_data -> response_wompi': results.find(c => c.columna === 'response_wompi') ? '✅' : '❌',
        'url_pago -> url_pago': results.find(c => c.columna === 'url_pago') ? '✅' : '❌'
    };

    Object.entries(mapping).forEach(([key, value]) => {
        if (key === 'Frontend -> Base de datos') {
            console.log(`\n${key}:`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    });

    console.log('\n🔧 SQL DE PRUEBA:');
    console.log('='.repeat(50));
    console.log(`INSERT INTO transacciones 
(url_pago, monto, email_cliente, nombre_cliente, telefono_cliente, direccion_cliente, descripcion, pedido_id, estado, response_wompi, fecha_creacion)
VALUES 
('https://test.com', 10.50, 'test@test.com', 'Cliente Test', '12345678', 'Dirección Test', 'Pedido Test', NULL, 'pendiente', '{}', NOW());`);

    console.log('\n✅ Verificación completada');
    process.exit(0);
});
