const express = require('express');
const router = express.Router();
const logsController = require('../contollers/logsController');

/**
 * RUTAS PARA GESTIÓN DE LOGS
 * Sistema completo de manejo de logs para MamaMianPizza API
 * 
 * Endpoints disponibles:
 * - GET /api/logs - Obtener todos los logs con filtros y paginación
 * - GET /api/logs/:id - Obtener log específico por ID
 * - GET /api/logs/user/:id_usuario - Obtener logs de un usuario específico
 * - GET /api/logs/stats - Obtener estadísticas de logs
 * - POST /api/logs - Crear nuevo log (uso interno del sistema)
 * - DELETE /api/logs/cleanup - Limpiar logs antiguos
 */

// Ruta principal: Obtener todos los logs con filtros opcionales
// Query params opcionales: limit, page, accion, tabla_afectada, fecha_inicio, fecha_fin, id_usuario, search
router.get('/', logsController.getAllLogs);

// Obtener estadísticas de logs del sistema
// Query params opcionales: periodo (dia, semana, mes, año, todo)
router.get('/stats', logsController.getLogsStats);

// Obtener logs de un usuario específico
// Params: id_usuario
// Query params opcionales: limit, page, accion, tabla_afectada
router.get('/user/:id_usuario', logsController.getLogsByUser);

// Obtener log específico por ID
// Params: id (id_log)
router.get('/:id', logsController.getLogById);

// Crear nuevo log (principalmente para uso interno del sistema)
// Body: { id_usuario?, accion, tabla_afectada, descripcion? }
router.post('/', logsController.createLog);

// Limpiar logs antiguos del sistema
// Body: { dias? } - días de retención (por defecto 90)
router.delete('/cleanup', logsController.cleanOldLogs);

module.exports = router;
