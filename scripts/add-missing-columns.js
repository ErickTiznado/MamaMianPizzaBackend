// add-missing-columns.js
// Script para agregar automáticamente las columnas faltantes a la tabla transacciones

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mama_mian_pizza',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

console.log('🔧 ===== AGREGANDO COLUMNAS FALTANTES A TRANSACCIONES =====');
console.log('📋 Base de datos:', dbConfig.database);

async function addMissingColumns() {
    let connection;
    
    try {
        // Conectar a la base de datos
        console.log('🔌 Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión exitosa');
        
        // Verificar columnas existentes
        console.log('\n📋 Verificando columnas existentes...');
        const [existingColumns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM information_schema.columns 
            WHERE table_schema = ? AND table_name = 'transacciones'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        const columnNames = existingColumns.map(row => row.COLUMN_NAME);
        console.log('📊 Columnas actuales:', columnNames);
        
        // Definir columnas requeridas
        const requiredColumns = [
            {
                name: 'id',
                definition: 'INT AUTO_INCREMENT PRIMARY KEY',
                comment: 'ID único de la transacción'
            },
            {
                name: 'url_pago',
                definition: 'VARCHAR(500) NULL',
                comment: 'URL de pago generada por Wompi'
            },
            {
                name: 'monto',
                definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00',
                comment: 'Monto de la transacción'
            },
            {
                name: 'email',
                definition: 'VARCHAR(100) NOT NULL',
                comment: 'Email del cliente'
            },
            {
                name: 'nombre_cliente',
                definition: 'VARCHAR(200) NULL',
                comment: 'Nombre completo del cliente'
            },
            {
                name: 'telefono',
                definition: 'VARCHAR(20) NULL',
                comment: 'Teléfono del cliente'
            },
            {
                name: 'direccion',
                definition: 'TEXT NULL',
                comment: 'Dirección del cliente'
            },
            {
                name: 'descripcion',
                definition: 'VARCHAR(255) NULL',
                comment: 'Descripción de la transacción'
            },
            {
                name: 'pedido_id',
                definition: 'INT NULL',
                comment: 'ID del pedido asociado'
            },
            {
                name: 'usuario_id',
                definition: 'INT NULL',
                comment: 'ID del usuario'
            },
            {
                name: 'status',
                definition: 'ENUM("pending","completed","failed","cancelled","processing") NOT NULL DEFAULT "pending"',
                comment: 'Estado de la transacción'
            },
            {
                name: 'wompi_data',
                definition: 'JSON NULL',
                comment: 'Datos completos de respuesta de Wompi'
            },
            {
                name: 'wompi_response',
                definition: 'JSON NULL',
                comment: 'Respuesta de confirmación de Wompi'
            },
            {
                name: 'fecha_creacion',
                definition: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
                comment: 'Fecha de creación'
            },
            {
                name: 'fecha_actualizacion',
                definition: 'DATETIME NULL ON UPDATE CURRENT_TIMESTAMP',
                comment: 'Fecha de última actualización'
            }
        ];
        
        // Agregar columnas faltantes
        console.log('\n➕ Agregando columnas faltantes...');
        let addedCount = 0;
        
        for (const column of requiredColumns) {
            if (!columnNames.includes(column.name)) {
                try {
                    const sql = `ALTER TABLE transacciones ADD COLUMN ${column.name} ${column.definition} COMMENT '${column.comment}'`;
                    console.log(`🔄 Agregando: ${column.name}...`);
                    await connection.execute(sql);
                    console.log(`✅ ${column.name} agregada exitosamente`);
                    addedCount++;
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log(`⚠️  ${column.name} ya existe`);
                    } else {
                        console.error(`❌ Error agregando ${column.name}:`, error.message);
                    }
                }
            } else {
                console.log(`✅ ${column.name} ya existe`);
            }
        }
        
        // Verificar estructura final
        console.log('\n📊 Verificando estructura final...');
        const [finalColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
            FROM information_schema.columns 
            WHERE table_schema = ? AND table_name = 'transacciones'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.log('\n📋 ESTRUCTURA FINAL DE LA TABLA:');
        finalColumns.forEach((col, index) => {
            console.log(`${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.COLUMN_COMMENT || 'Sin comentario'}`);
        });
        
        console.log('\n🎉 ===== PROCESO COMPLETADO =====');
        console.log(`✅ Columnas agregadas: ${addedCount}`);
        console.log(`📊 Total de columnas: ${finalColumns.length}`);
        console.log('🚀 La tabla transacciones está lista para usar');
        
    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    addMissingColumns()
        .then(() => {
            console.log('\n🏁 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { addMissingColumns };
