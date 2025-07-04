// Script para limpiar la base de datos
// Este script ejecuta la limpieza de la base de datos manteniendo usuarios y administradores
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para mostrar una advertencia importante
function showWarning() {
  console.log(`${colors.yellow}
  ⚠️  ADVERTENCIA ⚠️
  =====================================================
  Este script eliminará TODOS los datos excepto:
  - Usuarios 
  - Administradores
  - Estructura de productos y categorías

  Todos los pedidos, reseñas, reservas, transacciones, 
  y demás datos serán ELIMINADOS PERMANENTEMENTE.
  
  Este proceso NO se puede deshacer.
  =====================================================
  ${colors.reset}`);
}

// Función para solicitar confirmación
async function confirmExecution() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(`${colors.red}¿Está seguro que desea continuar? (escriba 'SI' para confirmar): ${colors.reset}`, (answer) => {
      readline.close();
      resolve(answer === 'SI');
    });
  });
}

// Función principal para ejecutar el script SQL
async function executeCleanup() {
  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'clean-database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir el script en instrucciones SQL individuales
    const sqlStatements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement.trim() + ';');
    
    // Crear la conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.BD_HOST,
      user: process.env.BD_USER,
      password: process.env.BD_PASSWORD,
      database: process.env.BD_NAME,
      port: process.env.BD_PORT || 3306,
      multipleStatements: true
    });
    
    console.log(`${colors.cyan}Conectado a la base de datos: ${process.env.BD_NAME}${colors.reset}`);
    console.log(`${colors.blue}Iniciando limpieza de la base de datos...${colors.reset}`);
    
    // Ejecutar cada instrucción SQL
    for(const statement of sqlStatements) {
      if (statement.includes('SELECT')) {
        // Para las consultas SELECT, mostramos los resultados
        const [results] = await connection.execute(statement);
        if (results.length > 0 && results[0].entidad) {
          console.log(`${colors.green}✓ ${results[0].entidad}: ${results[0].total}${colors.reset}`);
        }
      } else {
        // Para otras instrucciones, solo las ejecutamos
        await connection.execute(statement);
      }
    }
    
    console.log(`${colors.green}
    ✅ LIMPIEZA COMPLETADA CON ÉXITO
    =====================================================
    Se han conservado todos los usuarios y administradores.
    Se han eliminado todos los demás datos transaccionales.
    =====================================================
    ${colors.reset}`);
    
    // Cerrar la conexión
    await connection.end();
    
  } catch (error) {
    console.error(`${colors.red}ERROR: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar el script
(async () => {
  showWarning();
  const confirmed = await confirmExecution();
  
  if (confirmed) {
    await executeCleanup();
  } else {
    console.log(`${colors.yellow}Operación cancelada.${colors.reset}`);
  }
})();
