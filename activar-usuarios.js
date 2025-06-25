// Script para activar usuarios desactivados
// Uso: node activar-usuarios.js

const pool = require('./config/db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function mostrarUsuariosInactivos() {
    try {
        const [usuarios] = await pool.promise().query(`
            SELECT id_usuario, nombre, correo, activo, fecha_registro
            FROM usuarios 
            WHERE activo = 0
            ORDER BY fecha_registro DESC
        `);
        
        if (usuarios.length === 0) {
            console.log('✅ No hay usuarios inactivos.');
            return [];
        }
        
        console.log('\n📋 Usuarios actualmente INACTIVOS:');
        console.log('=====================================');
        usuarios.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id_usuario} | ${user.nombre} | ${user.correo} | Registro: ${user.fecha_registro}`);
        });
        
        return usuarios;
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        return [];
    }
}

async function activarUsuario(idUsuario) {
    try {
        const [result] = await pool.promise().query(
            'UPDATE usuarios SET activo = 1 WHERE id_usuario = ?',
            [idUsuario]
        );
        
        if (result.affectedRows > 0) {
            console.log(`✅ Usuario ${idUsuario} activado exitosamente.`);
            
            // Obtener datos del usuario activado
            const [user] = await pool.promise().query(
                'SELECT nombre, correo FROM usuarios WHERE id_usuario = ?',
                [idUsuario]
            );
            
            if (user.length > 0) {
                console.log(`   Nombre: ${user[0].nombre}`);
                console.log(`   Correo: ${user[0].correo}`);
            }
        } else {
            console.log(`❌ No se pudo activar el usuario ${idUsuario}. Verifica que el ID sea correcto.`);
        }
    } catch (error) {
        console.error(`❌ Error al activar usuario ${idUsuario}:`, error);
    }
}

async function activarPorCorreo(correo) {
    try {
        const [result] = await pool.promise().query(
            'UPDATE usuarios SET activo = 1 WHERE correo = ?',
            [correo]
        );
        
        if (result.affectedRows > 0) {
            console.log(`✅ Usuario con correo ${correo} activado exitosamente.`);
        } else {
            console.log(`❌ No se encontró usuario con el correo ${correo}.`);
        }
    } catch (error) {
        console.error(`❌ Error al activar usuario con correo ${correo}:`, error);
    }
}

async function activarTodos() {
    try {
        const [result] = await pool.promise().query('UPDATE usuarios SET activo = 1');
        console.log(`✅ ${result.affectedRows} usuarios activados exitosamente.`);
    } catch (error) {
        console.error('❌ Error al activar todos los usuarios:', error);
    }
}

async function mostrarEstadisticas() {
    try {
        const [stats] = await pool.promise().query(`
            SELECT 
                activo,
                COUNT(*) as cantidad,
                CASE 
                    WHEN activo = 1 THEN 'ACTIVOS'
                    WHEN activo = 0 THEN 'INACTIVOS'
                END as descripcion
            FROM usuarios 
            GROUP BY activo
        `);
        
        console.log('\n📊 Estadísticas actuales:');
        console.log('========================');
        stats.forEach(stat => {
            console.log(`${stat.descripcion}: ${stat.cantidad} usuarios`);
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
    }
}

function pregunta(texto) {
    return new Promise(resolve => {
        rl.question(texto, resolve);
    });
}

async function main() {
    console.log('🔧 === HERRAMIENTA PARA ACTIVAR USUARIOS ===\n');
    
    await mostrarEstadisticas();
    
    while (true) {
        console.log('\n📋 Opciones disponibles:');
        console.log('1. Ver usuarios inactivos');
        console.log('2. Activar usuario por ID');
        console.log('3. Activar usuario por correo');
        console.log('4. Activar TODOS los usuarios');
        console.log('5. Ver estadísticas');
        console.log('6. Salir');
        
        const opcion = await pregunta('\n¿Qué opción eliges? (1-6): ');
        
        switch(opcion) {
            case '1':
                await mostrarUsuariosInactivos();
                break;
                
            case '2':
                const usuarios = await mostrarUsuariosInactivos();
                if (usuarios.length > 0) {
                    const id = await pregunta('Ingresa el ID del usuario a activar: ');
                    if (id && !isNaN(id)) {
                        await activarUsuario(parseInt(id));
                    } else {
                        console.log('❌ ID inválido.');
                    }
                }
                break;
                
            case '3':
                const correo = await pregunta('Ingresa el correo del usuario a activar: ');
                if (correo) {
                    await activarPorCorreo(correo);
                } else {
                    console.log('❌ Correo inválido.');
                }
                break;
                
            case '4':
                const confirmar = await pregunta('⚠️  ¿Estás seguro de activar TODOS los usuarios? (si/no): ');
                if (confirmar.toLowerCase() === 'si' || confirmar.toLowerCase() === 's') {
                    await activarTodos();
                } else {
                    console.log('❌ Operación cancelada.');
                }
                break;
                
            case '5':
                await mostrarEstadisticas();
                break;
                
            case '6':
                console.log('👋 ¡Hasta luego!');
                process.exit(0);
                break;
                
            default:
                console.log('❌ Opción inválida. Intenta de nuevo.');
        }
    }
}

main().catch(error => {
    console.error('❌ Error crítico:', error);
    process.exit(1);
});
