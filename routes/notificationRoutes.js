// filepath: routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../contollers/notificationController');

// Obtener todas las notificaciones
router.get('/', notificationController.getAllNotifications);

// Obtener notificaciones no leídas
router.get('/unread', notificationController.getUnreadNotifications);

// Obtener una notificación específica
router.get('/:id', notificationController.getNotificationById);

// Crear una nueva notificación
router.post('/', notificationController.createNotification);

// Actualizar estado de una notificación
router.patch('/:id/status', notificationController.updateNotificationStatus);

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', notificationController.markAllNotificationsAsRead);

// Eliminar una notificación
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;