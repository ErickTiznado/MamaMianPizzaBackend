const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../contollers/authController');

// Ejemplo de cómo proteger rutas administrativas con JWT

// ============================
// RUTAS PROTEGIDAS DE ADMINISTRADOR
// ============================

// Obtener todos los usuarios (solo administradores)
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        // req.admin contiene la información del administrador autenticado
        const adminId = req.admin.id;
        const adminEmail = req.admin.email;
        
        console.log(`Admin ${adminEmail} (ID: ${adminId}) accediendo a lista de usuarios`);
        
        // Aquí iría la lógica para obtener usuarios
        // Ejemplo: obtener de la base de datos
        
        res.json({
            success: true,
            message: 'Lista de usuarios obtenida exitosamente',
            admin_info: {
                id: adminId,
                email: adminEmail
            },
            // users: usersList
        });
        
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Crear nuevo usuario (solo administradores)
router.post('/users', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const adminEmail = req.admin.email;
        
        console.log(`Admin ${adminEmail} creando nuevo usuario`);
        
        // Aquí iría la lógica para crear usuario
        
        res.json({
            success: true,
            message: 'Usuario creado exitosamente',
            created_by_admin: {
                id: adminId,
                email: adminEmail
            }
        });
        
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Eliminar usuario (solo administradores)
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const adminEmail = req.admin.email;
        const userId = req.params.id;
        
        console.log(`Admin ${adminEmail} eliminando usuario ${userId}`);
        
        // Aquí iría la lógica para eliminar usuario
        
        res.json({
            success: true,
            message: `Usuario ${userId} eliminado exitosamente`,
            deleted_by_admin: {
                id: adminId,
                email: adminEmail
            }
        });
        
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ============================
// RUTAS DE CONFIGURACIÓN ADMINISTRATIVA
// ============================

// Obtener configuración del sistema
router.get('/settings', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.admin.id;
        
        // Aquí iría la lógica para obtener configuración
        
        res.json({
            success: true,
            message: 'Configuración obtenida exitosamente',
            settings: {
                // configuraciones del sistema
            },
            accessed_by_admin: adminId
        });
        
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Actualizar configuración del sistema
router.put('/settings', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const adminEmail = req.admin.email;
        
        console.log(`Admin ${adminEmail} actualizando configuración del sistema`);
        
        // Aquí iría la lógica para actualizar configuración
        
        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            updated_by_admin: {
                id: adminId,
                email: adminEmail
            }
        });
        
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ============================
// RUTAS DE REPORTES ADMINISTRATIVOS
// ============================

// Obtener reporte de ventas (solo administradores)
router.get('/reports/sales', verifyAdminToken, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { startDate, endDate } = req.query;
        
        console.log(`Admin ${adminId} solicitando reporte de ventas del ${startDate} al ${endDate}`);
        
        // Aquí iría la lógica para generar reporte
        
        res.json({
            success: true,
            message: 'Reporte de ventas generado exitosamente',
            report: {
                period: { startDate, endDate },
                // datos del reporte
            },
            generated_by_admin: adminId
        });
        
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ============================
// MIDDLEWARE PERSONALIZADO PARA SUPER ADMIN
// ============================

// Middleware adicional para operaciones que requieren super admin
const requireSuperAdmin = (req, res, next) => {
    try {
        // Este middleware debe ir después de verifyAdminToken
        const adminEmail = req.admin.email;
        
        // Lista de super administradores (mejor en base de datos)
        const superAdmins = [
            'superadmin@mamamianpizza.com',
            'owner@mamamianpizza.com'
        ];
        
        if (!superAdmins.includes(adminEmail)) {
            return res.status(403).json({
                success: false,
                message: 'Esta operación requiere privilegios de super administrador',
                error_type: 'INSUFFICIENT_PRIVILEGES'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Error en requireSuperAdmin middleware:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Ejemplo de ruta que requiere super admin
router.delete('/system/reset', verifyAdminToken, requireSuperAdmin, async (req, res) => {
    try {
        const adminEmail = req.admin.email;
        
        console.log(`⚠️ SUPER ADMIN ${adminEmail} ejecutando reset del sistema`);
        
        // Operación crítica que solo super admins pueden hacer
        
        res.json({
            success: true,
            message: 'Sistema reseteado exitosamente',
            warning: 'Esta es una operación irreversible',
            executed_by_super_admin: adminEmail
        });
        
    } catch (error) {
        console.error('Error en reset del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;
