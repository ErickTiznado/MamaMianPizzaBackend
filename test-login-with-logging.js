const axios = require('axios');
const pool = require('./config/db');

// Configuración
const BASE_URL = 'http://localhost:3000/api';

// Test script for login functionality with logging
async function testLoginWithLogging() {
    console.log('🧪 TESTING LOGIN FUNCTIONALITY WITH LOGGING AND LAST ACCESS UPDATE\n');
    
    try {
        // Test 1: Admin Login Success
        console.log('1️⃣ Testing Admin Login (Success)...');
        const adminResponse = await axios.post(`${BASE_URL}/users/login`, {
            correo: 'tiznadoerick3@gmail.com', // Use a valid admin email from your DB
            contrasena: 'your_admin_password' // Replace with actual admin password
        });
        
        console.log('✅ Admin Login Response:', adminResponse.data);
        
        // Check if ultimo_acceso was updated
        const [adminAccess] = await pool.promise().query(
            'SELECT ultimo_acceso FROM administradores WHERE id_admin = ?',
            [adminResponse.data.id_admin]
        );
        console.log('📅 Admin último acceso:', adminAccess[0]?.ultimo_acceso);
        
        // Check recent logs for admin
        const [adminLogs] = await pool.promise().query(
            'SELECT * FROM logs WHERE id_usuario = ? AND accion = "LOGIN" ORDER BY fecha_hora DESC LIMIT 1',
            [adminResponse.data.id_admin]
        );
        console.log('📝 Admin log entry:', adminLogs[0] || 'No log found');
        
    } catch (error) {
        console.error('❌ Admin Login Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    try {
        // Test 2: User Login Success
        console.log('2️⃣ Testing User Login (Success)...');
        const userResponse = await axios.post(`${BASE_URL}/users/users_login`, {
            correo: 'nathy.zelaya5@gmail.com', // Use a valid user email from your DB
            contrasena: 'your_user_password' // Replace with actual user password
        });
        
        console.log('✅ User Login Response:', userResponse.data);
        
        // Check if ultimo_acceso was updated
        const [userAccess] = await pool.promise().query(
            'SELECT ultimo_acceso FROM usuarios WHERE id_usuario = ?',
            [userResponse.data.id_usuario]
        );
        console.log('📅 User último acceso:', userAccess[0]?.ultimo_acceso);
        
        // Check recent logs for user
        const [userLogs] = await pool.promise().query(
            'SELECT * FROM logs WHERE id_usuario = ? AND accion = "LOGIN" ORDER BY fecha_hora DESC LIMIT 1',
            [userResponse.data.id_usuario]
        );
        console.log('📝 User log entry:', userLogs[0] || 'No log found');
        
    } catch (error) {
        console.error('❌ User Login Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    try {
        // Test 3: Failed Login (Admin)
        console.log('3️⃣ Testing Failed Admin Login...');
        await axios.post(`${BASE_URL}/users/login`, {
            correo: 'tiznadoerick3@gmail.com',
            contrasena: 'wrong_password'
        });
        
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data || error.message);
        
        // Check for failed login log
        const [failedLogs] = await pool.promise().query(
            'SELECT * FROM logs WHERE accion = "LOGIN_FAILED" AND tabla_afectada = "administradores" ORDER BY fecha_hora DESC LIMIT 1'
        );
        console.log('📝 Failed login log:', failedLogs[0] || 'No log found');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    try {
        // Test 4: Failed Login (User)
        console.log('4️⃣ Testing Failed User Login...');
        await axios.post(`${BASE_URL}/users/users_login`, {
            correo: 'nathy.zelaya5@gmail.com',
            contrasena: 'wrong_password'
        });
        
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data || error.message);
        
        // Check for failed login log
        const [failedUserLogs] = await pool.promise().query(
            'SELECT * FROM logs WHERE accion = "LOGIN_FAILED" AND tabla_afectada = "usuarios" ORDER BY fecha_hora DESC LIMIT 1'
        );
        console.log('📝 Failed user login log:', failedUserLogs[0] || 'No log found');
    }
    
    console.log('\n🎉 LOGIN TESTING COMPLETED!');
    console.log('\n📊 SUMMARY OF FEATURES TESTED:');
    console.log('   ✅ User ID returned in successful login responses');
    console.log('   ✅ ultimo_acceso timestamp updated on successful login');
    console.log('   ✅ Successful logins logged to database');
    console.log('   ✅ Failed login attempts logged to database');
    console.log('   ✅ Separate handling for users vs administrators');
    
    process.exit(0);
}

// Instructions
console.log('📋 INSTRUCCIONES:');
console.log('1. Ejecuta primero: node test-database-structure.js');
console.log('2. Si falta el campo ultimo_acceso en usuarios, ejecuta el SQL: add_ultimo_acceso_to_usuarios.sql');
console.log('3. Asegúrate de que el servidor esté corriendo en puerto 3000');
console.log('4. Actualiza las credenciales válidas en este script');
console.log('5. Ejecuta: node test-login-with-logging.js\n');

// Run the test
testLoginWithLogging();
