// fix-database-structure.js
// Script para verificar y corregir automáticamente la estructura de la tabla transacciones

const mysql = require('mysql2');
require('dotenv').config();

// Configuración de base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mama_mian_pizza',
    port: process.env.DB_PORT || 3306
};

console.log('🔧 ===== VERIFICANDO Y CORRIGIENDO ESTRUCTURA DE BASE DE DATOS =====');
console.log('📋 Configuración DB:', {
    host: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user,
    port: dbConfig.port
});

const connection = mysql.createConnection(dbConfig);

/**
 * Verificar si la tabla transacciones existe
 */
function checkTableExists() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) as table_exists 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name = 'transacciones'
        `;
        
        connection.query(query, [dbConfig.database], (err, result) => {
            if (err) return reject(err);
            resolve(result[0].table_exists > 0);
        });
    });
}

/**
 * Obtener columnas existentes
 */
function getExistingColumns() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                COLUMN_COMMENT
            FROM information_schema.columns 
            WHERE table_schema = ? 
            AND table_name = 'transacciones'
            ORDER BY ORDINAL_POSITION
        `;
        
        connection.query(query, [dbConfig.database], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Agregar columna faltante
 */
function addColumn(columnName, columnDef) {
    return new Promise((resolve, reject) => {
        const query = `ALTER TABLE transacciones ADD COLUMN ${columnName} ${columnDef}`;
        
        console.log(`➕ Agregando columna: ${columnName}`);
        connection.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Columna ${columnName} ya existe`);
                    resolve(false);
                } else {
                    reject(err);
                }
            } else {
                console.log(`✅ Columna ${columnName} agregada exitosamente`);
                resolve(true);
            }
        });
    });
}

/**
 * Crear tabla completa si no existe
 */
function createTable() {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS \`transacciones\` (
              \`id\` int NOT NULL AUTO_INCREMENT,
              \`url_pago\` varchar(500) NULL COMMENT 'URL de pago generada por Wompi',
              \`monto\` decimal(10,2) NOT NULL COMMENT 'Monto de la transacción',
              \`email\` varchar(100) NOT NULL COMMENT 'Email del cliente',
              \`nombre_cliente\` varchar(200) NOT NULL COMMENT 'Nombre completo del cliente',
              \`telefono\` varchar(20) DEFAULT NULL COMMENT 'Teléfono del cliente',
              \`direccion\` text DEFAULT NULL COMMENT 'Dirección del cliente',
              \`descripcion\` varchar(255) DEFAULT NULL COMMENT 'Descripción de la transacción',
              \`pedido_id\` int DEFAULT NULL COMMENT 'ID del pedido asociado (si aplica)',
              \`usuario_id\` int DEFAULT NULL COMMENT 'ID del usuario (si está registrado)',
              \`status\` enum('pending','completed','failed','cancelled','processing') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la transacción',
              \`wompi_data\` json DEFAULT NULL COMMENT 'Datos completos de respuesta de Wompi',
              \`wompi_response\` json DEFAULT NULL COMMENT 'Respuesta de confirmación de Wompi',
              \`fecha_creacion\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              \`fecha_actualizacion\` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (\`id\`),
              KEY \`idx_email\` (\`email\`),
              KEY \`idx_status\` (\`status\`),
              KEY \`idx_fecha_creacion\` (\`fecha_creacion\`),
              KEY \`idx_pedido_id\` (\`pedido_id\`),
              KEY \`idx_usuario_id\` (\`usuario_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla para almacenar transacciones de pago con Wompi'
        `;
        
        console.log('🏗️ Creando tabla transacciones...');
        connection.query(createTableSQL, (err, result) => {
            if (err) return reject(err);
            console.log('✅ Tabla transacciones creada exitosamente');
            resolve(true);
        });
    });
}

/**
 * Proceso principal
 */
async function fixDatabaseStructure() {
    try {
        console.log('\n1️⃣ Conectando a la base de datos...');
        
        // Verificar conexión
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) return reject(err);
                console.log('✅ Conexión exitosa a la base de datos');
                resolve();
            });
        });
        
        console.log('\n2️⃣ Verificando si existe la tabla transacciones...');
        const tableExists = await checkTableExists();
        
        if (!tableExists) {
            console.log('❌ Tabla transacciones no existe');
            await createTable();
        } else {
            console.log('✅ Tabla transacciones existe');
            
            console.log('\n3️⃣ Verificando columnas...');
            const existingColumns = await getExistingColumns();
            const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
            
            console.log('📋 Columnas existentes:', existingColumnNames);
            
            // Columnas requeridas
            const requiredColumns = {
                'id': 'int NOT NULL AUTO_INCREMENT PRIMARY KEY',
                'url_pago': 'varchar(500) NULL COMMENT "URL de pago generada por Wompi"',
                'monto': 'decimal(10,2) NOT NULL COMMENT "Monto de la transacción"',
                'email': 'varchar(100) NOT NULL COMMENT "Email del cliente"',
                'nombre_cliente': 'varchar(200) NOT NULL COMMENT "Nombre completo del cliente"',
                'telefono': 'varchar(20) DEFAULT NULL COMMENT "Teléfono del cliente"',
                'direccion': 'text DEFAULT NULL COMMENT "Dirección del cliente"',
                'descripcion': 'varchar(255) DEFAULT NULL COMMENT "Descripción de la transacción"',
                'pedido_id': 'int DEFAULT NULL COMMENT "ID del pedido asociado"',
                'usuario_id': 'int DEFAULT NULL COMMENT "ID del usuario"',
                'status': 'enum("pending","completed","failed","cancelled","processing") NOT NULL DEFAULT "pending" COMMENT "Estado de la transacción"',
                'wompi_data': 'json DEFAULT NULL COMMENT "Datos completos de respuesta de Wompi"',
                'wompi_response': 'json DEFAULT NULL COMMENT "Respuesta de confirmación de Wompi"',
                'fecha_creacion': 'datetime NOT NULL DEFAULT CURRENT_TIMESTAMP',
                'fecha_actualizacion': 'datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP'
            };
            
            console.log('\n4️⃣ Agregando columnas faltantes...');
            let addedColumns = 0;
            
            for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
                if (!existingColumnNames.includes(columnName)) {
                    console.log(`❌ Falta columna: ${columnName}`);
                    try {
                        const added = await addColumn(columnName, columnDef);
                        if (added) addedColumns++;
                    } catch (error) {
                        console.error(`❌ Error agregando ${columnName}:`, error.message);
                    }
                } else {
                    console.log(`✅ Columna ${columnName} ya existe`);
                }
            }
            
            console.log(`\n📊 Columnas agregadas: ${addedColumns}`);
        }
        
        console.log('\n5️⃣ Verificando estructura final...');
        const finalColumns = await getExistingColumns();
        
        console.log('\n📋 ESTRUCTURA FINAL:');
        finalColumns.forEach(col => {
            console.log(`  • ${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.COLUMN_COMMENT || 'Sin comentario'}`);
        });
        
        console.log('\n🎉 ===== ESTRUCTURA DE BASE DE DATOS CORREGIDA =====');
        console.log('✅ La tabla transacciones está lista para usar');
        console.log('🚀 Ahora puedes ejecutar tu aplicación sin errores de columnas faltantes');
        
    } catch (error) {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    } finally {
        connection.end();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fixDatabaseStructure();
}

module.exports = { fixDatabaseStructure };
