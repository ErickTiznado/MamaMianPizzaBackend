const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { notifyOrder } = require('../packages/notifications-client/index');

// Helper function to calculate growth percentage between two values
const calculateGrowth = (currentValue, previousValue) => {
    if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0; // Si antes era 0 y ahora hay algo, es 100% de crecimiento
    }
    const growth = ((currentValue - previousValue) / previousValue) * 100;
    return parseFloat(growth.toFixed(2)); // Redondear a 2 decimales
};

// Helper function to generate a unique order code
const generateOrderCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Helper function to generate a numeric product ID that's safe for INT columns
const generateProductId = (originalId) => {
    // Si ya tenemos un ID que es un número dentro del rango seguro, lo usamos
    if (originalId && typeof originalId === 'number' && originalId > 0 && originalId <= 2147483647) {
        return originalId;
    }
    
    // Si es un string o un número fuera de rango, generamos uno nuevo basado en hash
    let hash;
    if (originalId) {
        // Generamos un hash basado en el ID original (timestamp u otro valor)
        const idString = String(originalId);
        hash = crypto.createHash('md5').update(idString).digest('hex');
    } else {
        // Generamos un ID completamente aleatorio
        hash = crypto.randomBytes(16).toString('hex');
    }
    
    // Convertimos los primeros 8 caracteres del hash a un número en base 16 (hexadecimal)
    // y nos aseguramos que esté dentro del rango seguro para INT (menor a 2,147,483,647)
    const numericId = parseInt(hash.substring(0, 8), 16) % 2147483647;
    return numericId > 0 ? numericId : 1; // Asegurar que sea positivo
};


exports.countOrders = (req, res) => {
    pool.query('SELECT COUNT(*) as total FROM pedidos', (err, results) => {
    if (err) {
        console.error('Error al contar pedidos', err);
        return res.status(500).json({message: 'Error al contar pedidos'});

    }
    res.status(200).json({message: "Ordenes contadas exitosamente", total: results[0].total});
});
}

// Function to get order statistics with comparative analysis
exports.getOrderStatistics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ESTADÍSTICAS DEL DÍA ACTUAL Y COMPARATIVA
        // Query para contar pedidos de hoy
        const [currentDayResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = CURDATE()
        `);
        
        // Query para contar pedidos de ayer
        const [previousDayResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Query para contar pedidos del mismo día la semana pasada
        const [sameDayLastWeekResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        
        // ESTADÍSTICAS DE LA SEMANA ACTUAL Y COMPARATIVA
        // Query para contar pedidos de la semana actual (lunes a domingo)
        const [currentWeekResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Query para contar pedidos de la semana anterior
        const [previousWeekResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)
        `);
        
        // Query para contar pedidos de la misma semana el mes pasado
        const [sameWeekLastMonthResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 1)
        `);
        
        // ESTADÍSTICAS DEL MES ACTUAL Y COMPARATIVA
        // Query para contar pedidos del mes actual
        const [currentMonthResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(CURDATE()) AND MONTH(fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Query para contar pedidos del mes anterior
        const [previousMonthResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
            AND MONTH(fecha_pedido) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        `);
        
        // Query para contar pedidos del mismo mes el año pasado
        const [sameMonthLastYearResults] = await connection.query(`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) 
            AND MONTH(fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Calcular porcentajes de crecimiento
        const dayGrowthFromYesterday = calculateGrowth(currentDayResults[0].total, previousDayResults[0].total);
        const dayGrowthFromLastWeek = calculateGrowth(currentDayResults[0].total, sameDayLastWeekResults[0].total);
        
        const weekGrowthFromLastWeek = calculateGrowth(currentWeekResults[0].total, previousWeekResults[0].total);
        const weekGrowthFromLastMonth = calculateGrowth(currentWeekResults[0].total, sameWeekLastMonthResults[0].total);
        
        const monthGrowthFromLastMonth = calculateGrowth(currentMonthResults[0].total, previousMonthResults[0].total);
        const monthGrowthFromLastYear = calculateGrowth(currentMonthResults[0].total, sameMonthLastYearResults[0].total);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Estadísticas comparativas de pedidos obtenidas exitosamente",
            daily: {
                today: currentDayResults[0].total,
                yesterday: previousDayResults[0].total,
                sameDayLastWeek: sameDayLastWeekResults[0].total,
                growthFromYesterday: dayGrowthFromYesterday,
                growthFromLastWeek: dayGrowthFromLastWeek
            },
            weekly: {
                currentWeek: currentWeekResults[0].total,
                previousWeek: previousWeekResults[0].total,
                sameWeekLastMonth: sameWeekLastMonthResults[0].total,
                growthFromLastWeek: weekGrowthFromLastWeek,
                growthFromLastMonth: weekGrowthFromLastMonth
            },
            monthly: {
                currentMonth: currentMonthResults[0].total,
                previousMonth: previousMonthResults[0].total,
                sameMonthLastYear: sameMonthLastYearResults[0].total,
                growthFromLastMonth: monthGrowthFromLastMonth,
                growthFromLastYear: monthGrowthFromLastYear
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas de pedidos:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de pedidos',
            error: error.message
        });
    }
};


exports.getAverageTicket = async (req, res) => {
  let connection;
  try {
    connection = await pool.promise().getConnection();

    // ——— Promedios diarios ———
    const [rowsToday] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE DATE(fecha_pedido) = CURDATE()
    `);
    const avgToday = parseFloat(rowsToday[0].avg);

    const [rowsYesterday] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `);
    const avgYesterday = parseFloat(rowsYesterday[0].avg);

    const [rowsSameDayLastWeek] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);
    const avgSameDayLastWeek = parseFloat(rowsSameDayLastWeek[0].avg);

    // ——— Promedios semanales ———
    const [rowsThisWeek] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEARWEEK(fecha_pedido,1) = YEARWEEK(CURDATE(),1)
    `);
    const avgThisWeek = parseFloat(rowsThisWeek[0].avg);

    const [rowsLastWeek] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEARWEEK(fecha_pedido,1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK),1)
    `);
    const avgLastWeek = parseFloat(rowsLastWeek[0].avg);

    const [rowsSameWeekLastMonth] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEARWEEK(fecha_pedido,1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK),1)
    `);
    const avgSameWeekLastMonth = parseFloat(rowsSameWeekLastMonth[0].avg);

    // ——— Promedios mensuales ———
    const [rowsThisMonth] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEAR(fecha_pedido)=YEAR(CURDATE()) AND MONTH(fecha_pedido)=MONTH(CURDATE())
    `);
    const avgThisMonth = parseFloat(rowsThisMonth[0].avg);

    const [rowsLastMonth] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEAR(fecha_pedido)=YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(fecha_pedido)=MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `);
    const avgLastMonth = parseFloat(rowsLastMonth[0].avg);

    const [rowsSameMonthLastYear] = await connection.query(`
      SELECT IFNULL(AVG(total),0) AS avg
      FROM pedidos
      WHERE YEAR(fecha_pedido)=YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))
        AND MONTH(fecha_pedido)=MONTH(CURDATE())
    `);
    const avgSameMonthLastYear = parseFloat(rowsSameMonthLastYear[0].avg);

    // ——— Cálculo de variaciones ———
    const dailyGrowthVsYesterday  = calculateGrowth(avgToday, avgYesterday);
    const dailyGrowthVsLastWeek   = calculateGrowth(avgToday, avgSameDayLastWeek);
    const weeklyGrowthVsLastWeek  = calculateGrowth(avgThisWeek, avgLastWeek);
    const weeklyGrowthVsLastMonth = calculateGrowth(avgThisWeek, avgSameWeekLastMonth);
    const monthlyGrowthVsLastMonth= calculateGrowth(avgThisMonth, avgLastMonth);
    const monthlyGrowthVsLastYear = calculateGrowth(avgThisMonth, avgSameMonthLastYear);

    connection.release();

    // ——— Respuesta final ———
    res.status(200).json({
      message: 'Ticket medio y comparativas obtenidas exitosamente',
      daily: {
        today: avgToday.toFixed(2),
        yesterday: avgYesterday.toFixed(2),
        sameDayLastWeek: avgSameDayLastWeek.toFixed(2),
        growthVsYesterday: dailyGrowthVsYesterday,
        growthVsLastWeek: dailyGrowthVsLastWeek
      },
      weekly: {
        currentWeek:       avgThisWeek.toFixed(2),
        previousWeek:      avgLastWeek.toFixed(2),
        sameWeekLastMonth: avgSameWeekLastMonth.toFixed(2),
        growthVsLastWeek:  weeklyGrowthVsLastWeek,
        growthVsLastMonth: weeklyGrowthVsLastMonth
      },
      monthly: {
        currentMonth:      avgThisMonth.toFixed(2),
        previousMonth:     avgLastMonth.toFixed(2),
        sameMonthLastYear: avgSameMonthLastYear.toFixed(2),
        growthVsLastMonth: monthlyGrowthVsLastMonth,
        growthVsLastYear:  monthlyGrowthVsLastYear
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al obtener el ticket medio y comparativas:', error);
    res.status(500).json({
      message: 'Error al obtener el ticket medio y comparativas',
      error: error.message
    });
  }
};

// Función para obtener promedios de pedidos por intervalos de tiempo
exports.getOrderAverages = async (req, res) => {
  let connection;
  try {
    connection = await pool.promise().getConnection();

    // ---- Promedio de pedidos por hora (últimas 24 horas) ----
    const [hourlyAvgToday] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_hora), 0) as promedio
      FROM (
        SELECT 
          HOUR(fecha_pedido) as hora,
          COUNT(*) as pedidos_por_hora
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(fecha_pedido)
      ) as conteo_por_hora
    `);
    
    const [hourlyAvgYesterday] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_hora), 0) as promedio
      FROM (
        SELECT 
          HOUR(fecha_pedido) as hora,
          COUNT(*) as pedidos_por_hora
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 24 HOUR), INTERVAL 24 HOUR)
          AND fecha_pedido < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(fecha_pedido)
      ) as conteo_por_hora
    `);

    const [hourlyAvgLastWeek] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_hora), 0) as promedio
      FROM (
        SELECT 
          HOUR(fecha_pedido) as hora,
          COUNT(*) as pedidos_por_hora
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND fecha_pedido < DATE_SUB(NOW(), INTERVAL 6 DAY)
        GROUP BY HOUR(fecha_pedido)
      ) as conteo_por_hora
    `);

    // ---- Promedio de pedidos por día ----
    const [dailyAvgThisWeek] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_dia), 0) as promedio
      FROM (
        SELECT 
          DATE(fecha_pedido) as dia,
          COUNT(*) as pedidos_por_dia
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        GROUP BY DATE(fecha_pedido)
      ) as conteo_por_dia
    `);

    const [dailyAvgLastWeek] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_dia), 0) as promedio
      FROM (
        SELECT 
          DATE(fecha_pedido) as dia,
          COUNT(*) as pedidos_por_dia
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
          AND fecha_pedido < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        GROUP BY DATE(fecha_pedido)
      ) as conteo_por_dia
    `);

    const [dailyAvgLastMonth] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_dia), 0) as promedio
      FROM (
        SELECT 
          DATE(fecha_pedido) as dia,
          COUNT(*) as pedidos_por_dia
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 30 DAY)
          AND fecha_pedido < DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 23 DAY)
        GROUP BY DATE(fecha_pedido)
      ) as conteo_por_dia
    `);

    // ---- Promedio de pedidos por semana ----
    const [weeklyAvgThisMonth] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_semana), 0) as promedio
      FROM (
        SELECT 
          YEARWEEK(fecha_pedido, 1) as semana,
          COUNT(*) as pedidos_por_semana
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
        GROUP BY YEARWEEK(fecha_pedido, 1)
      ) as conteo_por_semana
    `);

    const [weeklyAvgLastMonth] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_semana), 0) as promedio
      FROM (
        SELECT 
          YEARWEEK(fecha_pedido, 1) as semana,
          COUNT(*) as pedidos_por_semana
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)
          AND fecha_pedido < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
        GROUP BY YEARWEEK(fecha_pedido, 1)
      ) as conteo_por_semana
    `);

    const [weeklyAvgLastYear] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_semana), 0) as promedio
      FROM (
        SELECT 
          YEARWEEK(fecha_pedido, 1) as semana,
          COUNT(*) as pedidos_por_semana
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 YEAR)
          AND fecha_pedido < DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 11 MONTH)
        GROUP BY YEARWEEK(fecha_pedido, 1)
      ) as conteo_por_semana
    `);

    // ---- Promedio de pedidos por mes ----
    const [monthlyAvgThisYear] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_mes), 0) as promedio
      FROM (
        SELECT 
          YEAR(fecha_pedido) as anio,
          MONTH(fecha_pedido) as mes,
          COUNT(*) as pedidos_por_mes
        FROM pedidos
        WHERE fecha_pedido >= DATE_FORMAT(CURDATE(), '%Y-01-01')
        GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido)
      ) as conteo_por_mes
    `);

    const [monthlyAvgLastYear] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_mes), 0) as promedio
      FROM (
        SELECT 
          YEAR(fecha_pedido) as anio,
          MONTH(fecha_pedido) as mes,
          COUNT(*) as pedidos_por_mes
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-01-01'), INTERVAL 1 YEAR)
          AND fecha_pedido < DATE_FORMAT(CURDATE(), '%Y-01-01')
        GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido)
      ) as conteo_por_mes
    `);

    const [monthlyAvgTwoYearsAgo] = await connection.query(`
      SELECT 
        IFNULL(AVG(pedidos_por_mes), 0) as promedio
      FROM (
        SELECT 
          YEAR(fecha_pedido) as anio,
          MONTH(fecha_pedido) as mes,
          COUNT(*) as pedidos_por_mes
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-01-01'), INTERVAL 2 YEAR)
          AND fecha_pedido < DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-01-01'), INTERVAL 1 YEAR)
        GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido)
      ) as conteo_por_mes
    `);    // Convertir resultados de queries a números y redondear a 2 decimales
    const avgHourlyToday = parseFloat(hourlyAvgToday[0].promedio || 0);
    const avgHourlyYesterday = parseFloat(hourlyAvgYesterday[0].promedio || 0);
    const avgHourlyLastWeek = parseFloat(hourlyAvgLastWeek[0].promedio || 0);

    const avgDailyThisWeek = parseFloat(dailyAvgThisWeek[0].promedio || 0);
    const avgDailyLastWeek = parseFloat(dailyAvgLastWeek[0].promedio || 0);
    const avgDailyLastMonth = parseFloat(dailyAvgLastMonth[0].promedio || 0);

    const avgWeeklyThisMonth = parseFloat(weeklyAvgThisMonth[0].promedio || 0);
    const avgWeeklyLastMonth = parseFloat(weeklyAvgLastMonth[0].promedio || 0);
    const avgWeeklyLastYear = parseFloat(weeklyAvgLastYear[0].promedio || 0);

    const avgMonthlyThisYear = parseFloat(monthlyAvgThisYear[0].promedio || 0);
    const avgMonthlyLastYear = parseFloat(monthlyAvgLastYear[0].promedio || 0);
    const avgMonthlyTwoYearsAgo = parseFloat(monthlyAvgTwoYearsAgo[0].promedio || 0);

    // Calcular porcentajes de crecimiento
    const hourlyGrowthFromYesterday = calculateGrowth(avgHourlyToday, avgHourlyYesterday);
    const hourlyGrowthFromLastWeek = calculateGrowth(avgHourlyToday, avgHourlyLastWeek);

    const dailyGrowthFromLastWeek = calculateGrowth(avgDailyThisWeek, avgDailyLastWeek);
    const dailyGrowthFromLastMonth = calculateGrowth(avgDailyThisWeek, avgDailyLastMonth);

    const weeklyGrowthFromLastMonth = calculateGrowth(avgWeeklyThisMonth, avgWeeklyLastMonth);
    const weeklyGrowthFromLastYear = calculateGrowth(avgWeeklyThisMonth, avgWeeklyLastYear);

    const monthlyGrowthFromLastYear = calculateGrowth(avgMonthlyThisYear, avgMonthlyLastYear);
    const monthlyGrowthFromTwoYearsAgo = calculateGrowth(avgMonthlyThisYear, avgMonthlyTwoYearsAgo);

    // Liberar la conexión
    connection.release();    // Devolver resultados
    res.status(200).json({
      message: "Promedios de pedidos por intervalos obtenidos exitosamente",
      hourly: {
        current24Hours: avgHourlyToday.toFixed(2),
        previous24Hours: avgHourlyYesterday.toFixed(2),
        sameDay24HoursLastWeek: avgHourlyLastWeek.toFixed(2),
        growthFromYesterday: hourlyGrowthFromYesterday,
        growthFromLastWeek: hourlyGrowthFromLastWeek
      },
      daily: {
        currentWeekAvg: avgDailyThisWeek.toFixed(2),
        previousWeekAvg: avgDailyLastWeek.toFixed(2),
        sameWeekLastMonthAvg: avgDailyLastMonth.toFixed(2),
        growthFromLastWeek: dailyGrowthFromLastWeek,
        growthFromLastMonth: dailyGrowthFromLastMonth
      },
      weekly: {
        currentMonthAvg: avgWeeklyThisMonth.toFixed(2),
        previousMonthAvg: avgWeeklyLastMonth.toFixed(2),
        sameMonthLastYearAvg: avgWeeklyLastYear.toFixed(2),
        growthFromLastMonth: weeklyGrowthFromLastMonth,
        growthFromLastYear: weeklyGrowthFromLastYear
      },
      monthly: {
        currentYearAvg: avgMonthlyThisYear.toFixed(2),
        previousYearAvg: avgMonthlyLastYear.toFixed(2),
        twoYearsAgoAvg: avgMonthlyTwoYearsAgo.toFixed(2),
        growthFromLastYear: monthlyGrowthFromLastYear,
        growthFromTwoYearsAgo: monthlyGrowthFromTwoYearsAgo
      }
    });
  } catch (error) {
    console.error('Error al obtener promedios de pedidos:', error);
    res.status(500).json({
      message: 'Error al obtener promedios de pedidos por intervalos',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};


// Function to create a new order
/**
 * Creates a new order with proper guest user handling
 * 
 * GUEST USER HANDLING:
 * 1. Guest users are saved ONLY to usuarios_invitados table (primary storage)
 * 2. A temporary user is created in usuarios table ONLY for address linking
 *    (required due to direcciones table foreign key constraint)
 * 3. Orders link to both id_usuario (for addresses) and id_usuario_invitado (for guest tracking)
 * 4. Guest user data is retrieved from usuarios_invitados, not usuarios table
 * 
 * PRODUCT HANDLING:
 * 5. Product creation is disabled - orders can only use existing products from the database
 * 6. If a product doesn't exist, the order detail is skipped and an error is reported
 * 
 * @param {Object} req - Request object containing order data
 * @param {Object} res - Response object
 */
exports.createOrder = async (req, res) => {
    // Start a transaction
    let connection;
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n[${new Date().toISOString()}] ===== INICIO CREACIÓN DE PEDIDO =====`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📝 Body del request:`, JSON.stringify(req.body, null, 2));
    console.log(`📊 Headers del request:`, JSON.stringify(req.headers, null, 2));
    
    try {
        console.log(`🔗 [${requestId}] Estableciendo conexión a la base de datos...`);
        connection = await pool.promise().getConnection();
        console.log(`✅ [${requestId}] Conexión establecida exitosamente`);
        
        console.log(`🔄 [${requestId}] Iniciando transacción...`);
        await connection.beginTransaction();
        console.log(`✅ [${requestId}] Transacción iniciada exitosamente`);        
        console.log(`📋 [${requestId}] Extrayendo datos del request body...`);
        const {
            tipo_cliente,
            cliente,
            direccion,
            metodo_pago,
            productos,
            subtotal,
            costo_envio,
            total,
            aceptado_terminos,
            tiempo_estimado_entrega
        } = req.body;
        
        console.log(`📊 [${requestId}] Datos extraídos:`, {
            tipo_cliente,
            cliente: cliente ? { ...cliente, password: cliente.password ? '[HIDDEN]' : undefined } : null,
            direccion,
            metodo_pago,
            productos_count: productos ? productos.length : 0,
            subtotal,
            costo_envio,
            total,
            aceptado_terminos,
            tiempo_estimado_entrega
        });
        
        console.log(`🔍 [${requestId}] Iniciando validaciones...`);        // ENHANCED VALIDATION WITH SPECIFIC ERROR MESSAGES
        const errors = [];
        const missingFields = [];
        
        console.log(`🔍 [${requestId}] Validando campos principales...`);
        // Validate main required fields
        if (!tipo_cliente) missingFields.push('tipo_cliente');
        if (!cliente) missingFields.push('cliente');
        if (!direccion) missingFields.push('direccion');
        if (!metodo_pago) missingFields.push('metodo_pago');
        if (!productos) missingFields.push('productos');
        if (!total) missingFields.push('total');
        
        if (missingFields.length > 0) {
            console.error(`❌ [${requestId}] Campos faltantes:`, missingFields);
            return res.status(400).json({ 
                message: 'Faltan datos requeridos para el pedido',
                detalle: `Campos faltantes: ${missingFields.join(', ')}`,
                request_id: requestId,
                campos_requeridos: {
                    tipo_cliente: 'Tipo de cliente (registrado/invitado)',
                    cliente: 'Información del cliente',
                    direccion: 'Dirección de entrega',
                    metodo_pago: 'Método de pago',
                    productos: 'Lista de productos',
                    total: 'Total del pedido'
                },
                campos_faltantes: missingFields
            });
        }
        
        console.log(`✅ [${requestId}] Campos principales validados correctamente`);        // Validate client data based on client type
        if (cliente) {
            console.log(`👤 [${requestId}] Validando datos del cliente para tipo: ${tipo_cliente}...`);
            const clienteErrors = [];
            
            if (tipo_cliente === 'registrado') {
                if (!cliente.email) clienteErrors.push('email');
                // Password is no longer required for orders - user should be authenticated in frontend
                console.log(`🔐 [${requestId}] Validación específica para cliente registrado (sin contraseña)`);
            }
            
            // Common client validations for both types
            if (!cliente.nombre) clienteErrors.push('nombre');
            if (!cliente.telefono) clienteErrors.push('telefono');
            
            if (clienteErrors.length > 0) {
                console.error(`❌ [${requestId}] Errores en datos del cliente:`, clienteErrors);
                return res.status(400).json({
                    message: 'Faltan datos del cliente',
                    detalle: `Campos del cliente faltantes: ${clienteErrors.join(', ')}`,
                    request_id: requestId,
                    tipo_cliente: tipo_cliente,
                    campos_cliente_requeridos: tipo_cliente === 'registrado' 
                        ? ['nombre', 'telefono', 'email']
                        : ['nombre', 'telefono'],
                    campos_cliente_faltantes: clienteErrors
                });
            }
            
            console.log(`✅ [${requestId}] Datos del cliente validados correctamente`);
        }// Validate address data
        if (direccion) {
            console.log(`📍 [${requestId}] Validando datos de dirección. Tipo: ${direccion.tipo_direccion}...`);
            const direccionErrors = [];
            
            if (direccion.tipo_direccion === 'formulario') {
                if (!direccion.direccion) direccionErrors.push('direccion');
                if (!direccion.pais) direccionErrors.push('pais');
                if (!direccion.departamento) direccionErrors.push('departamento');
                if (!direccion.municipio) direccionErrors.push('municipio');
                console.log(`📋 [${requestId}] Validando dirección tipo formulario`);
            } else if (direccion.tipo_direccion === 'tiempo_real') {
                if (!direccion.latitud) direccionErrors.push('latitud');
                if (!direccion.longitud) direccionErrors.push('longitud');
                if (!direccion.direccion_formateada) direccionErrors.push('direccion_formateada');
                console.log(`🌍 [${requestId}] Validando dirección en tiempo real`);
            } else {
                direccionErrors.push('tipo_direccion (debe ser "formulario" o "tiempo_real")');
                console.log(`❌ [${requestId}] Tipo de dirección inválido: ${direccion.tipo_direccion}`);
            }
            
            if (direccionErrors.length > 0) {
                console.error(`❌ [${requestId}] Errores en datos de dirección:`, direccionErrors);
                return res.status(400).json({
                    message: 'Faltan datos de dirección',
                    detalle: `Campos de dirección faltantes: ${direccionErrors.join(', ')}`,
                    request_id: requestId,
                    tipo_direccion: direccion.tipo_direccion,
                    campos_direccion_requeridos: direccion.tipo_direccion === 'formulario' 
                        ? ['direccion', 'pais', 'departamento', 'municipio']
                        : ['latitud', 'longitud', 'direccion_formateada'],
                    campos_direccion_faltantes: direccionErrors
                });
            }
            
            console.log(`✅ [${requestId}] Datos de dirección validados correctamente`);
        }        // Validate products array
        console.log(`🛍️ [${requestId}] Validando array de productos...`);
        if (!Array.isArray(productos) || productos.length === 0) {
            console.error(`❌ [${requestId}] Array de productos inválido. Es array: ${Array.isArray(productos)}, Longitud: ${productos ? productos.length : 'undefined'}`);
            return res.status(400).json({ 
                message: 'El pedido debe contener al menos un producto',
                detalle: 'El campo "productos" debe ser un array con al menos un elemento',
                request_id: requestId,
                ejemplo_producto: {
                    nombre_producto: 'Pizza Margarita',
                    cantidad: 1,
                    precio_unitario: 12.50,
                    subtotal: 12.50,
                    masa: 'tradicional',
                    tamano: 'mediana',
                    instrucciones_especiales: 'Sin cebolla'
                }
            });
        }
        
        console.log(`📊 [${requestId}] Productos a validar: ${productos.length}`);

        // Validate each product structure
        const productErrors = [];
        productos.forEach((producto, index) => {
            console.log(`🔍 [${requestId}] Validando producto ${index + 1}: ${producto.nombre_producto || 'Sin nombre'}`);
            const productoErrors = [];
            
            if (!producto.nombre_producto) productoErrors.push('nombre_producto');
            if (!producto.cantidad || producto.cantidad <= 0) productoErrors.push('cantidad (debe ser mayor a 0)');
            if (!producto.precio_unitario || producto.precio_unitario <= 0) productoErrors.push('precio_unitario (debe ser mayor a 0)');
            
            if (productoErrors.length > 0) {
                console.warn(`⚠️ [${requestId}] Errores en producto ${index + 1}:`, productoErrors);
                productErrors.push({
                    indice: index,
                    producto: producto.nombre_producto || 'Sin nombre',
                    campos_faltantes: productoErrors
                });
            } else {
                console.log(`✅ [${requestId}] Producto ${index + 1} validado correctamente`);
            }
        });

        if (productErrors.length > 0) {
            console.error(`❌ [${requestId}] Errores en validación de productos:`, productErrors);
            return res.status(400).json({ 
                message: 'Datos de productos incompletos',
                detalle: 'Uno o más productos tienen datos faltantes o inválidos',
                request_id: requestId,
                productos_con_errores: productErrors,
                campos_producto_requeridos: ['nombre_producto', 'cantidad', 'precio_unitario'],
                ejemplo_producto_valido: {
                    nombre_producto: 'Pizza Margarita',
                    cantidad: 1,
                    precio_unitario: 12.50,
                    subtotal: 12.50
                }
            });
        }
        
        console.log(`✅ [${requestId}] Todos los productos validados correctamente`);        
        
        // Payment method validation (based on database ENUM)
        console.log(`💳 [${requestId}] Validando método de pago: ${metodo_pago}...`);
        
        // Valid payment methods according to database ENUM
        const metodosValidos = ['efectivo', 'tarjeta'];
        if (!metodosValidos.includes(metodo_pago)) {
            console.error(`❌ [${requestId}] Método de pago inválido: ${metodo_pago}`);
            return res.status(400).json({
                message: 'Método de pago inválido',
                detalle: `El método de pago "${metodo_pago}" no es válido. Métodos válidos: ${metodosValidos.join(', ')}.`,
                request_id: requestId,
                metodos_validos: metodosValidos
            });
        }
        
        console.log(`✅ [${requestId}] Método de pago validado correctamente`);        // Validate numeric fields
        console.log(`🔢 [${requestId}] Validando campos numéricos...`);
        if (isNaN(total) || total <= 0) {
            console.error(`❌ [${requestId}] Total inválido: ${total}`);
            return res.status(400).json({
                message: 'Total inválido',
                detalle: 'El total debe ser un número mayor a 0',
                request_id: requestId,
                valor_recibido: total
            });
        }

        if (subtotal && (isNaN(subtotal) || subtotal <= 0)) {
            console.error(`❌ [${requestId}] Subtotal inválido: ${subtotal}`);
            return res.status(400).json({
                message: 'Subtotal inválido',
                detalle: 'El subtotal debe ser un número mayor a 0',
                request_id: requestId,
                valor_recibido: subtotal
            });
        }
        
        console.log(`✅ [${requestId}] Campos numéricos validados. Total: ${total}, Subtotal: ${subtotal || 'No proporcionado'}`);
        
        console.log(`🎯 [${requestId}] ===== TODAS LAS VALIDACIONES COMPLETADAS EXITOSAMENTE =====`);        // Generate unique order code
        console.log(`🆔 [${requestId}] Generando código único de pedido...`);
        const codigo_pedido = generateOrderCode();
        console.log(`✅ [${requestId}] Código de pedido generado: ${codigo_pedido}`);

        let id_usuario = null;
        let id_usuario_invitado = null;
        let id_direccion = null;
        
        console.log(`🏁 [${requestId}] ===== INICIANDO PROCESAMIENTO DE USUARIO Y DIRECCIÓN =====`);        // Handle user data based on client type
        if (tipo_cliente === 'registrado') {
            console.log(`👤 [${requestId}] Procesando cliente REGISTRADO...`);
            console.log(`🔍 [${requestId}] Buscando usuario con email: ${cliente.email}`);
            
            // Find user by email (no password validation needed for orders)
            const [users] = await connection.query(
                'SELECT * FROM usuarios WHERE correo = ?', 
                [cliente.email]
            );
            
            console.log(`📊 [${requestId}] Usuarios encontrados: ${users.length}`);
            
            if (users.length === 0) {
                console.error(`❌ [${requestId}] Usuario no encontrado con email: ${cliente.email}`);
                return res.status(401).json({ 
                    message: 'Usuario no encontrado',
                    request_id: requestId,
                    email_buscado: cliente.email
                });
            }

            const user = users[0];
            console.log(`👤 [${requestId}] Usuario encontrado. ID: ${user.id_usuario}, Nombre: ${user.nombre}`);
            
            // Skip password validation for orders - assume user is already authenticated in frontend
            console.log(`✅ [${requestId}] Usuario validado exitosamente para pedido: ${user.nombre}`);
            id_usuario = user.id_usuario;
            
            console.log(`📍 [${requestId}] Creando dirección para usuario registrado...`);
            // Create or update address
            if (direccion.tipo_direccion === 'formulario') {
                console.log(`📋 [${requestId}] Insertando dirección tipo formulario...`);
                const addressQuery = 'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio) VALUES (?, ?, ?, ?, ?, ?)';
                const addressParams = [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio];
                console.log(`📝 [${requestId}] Query dirección:`, addressQuery);
                console.log(`📝 [${requestId}] Parámetros dirección:`, addressParams);
                
                const [addressResult] = await connection.query(addressQuery, addressParams);
                id_direccion = addressResult.insertId;
                console.log(`✅ [${requestId}] Dirección formulario creada con ID: ${id_direccion}`);
            } else {
                console.log(`🌍 [${requestId}] Insertando dirección tiempo real...`);
                const addressQuery = 'INSERT INTO direcciones (id_usuario, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?)';
                const addressParams = [id_usuario, 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada];
                console.log(`📝 [${requestId}] Query dirección:`, addressQuery);
                console.log(`📝 [${requestId}] Parámetros dirección:`, addressParams);
                
                const [addressResult] = await connection.query(addressQuery, addressParams);
                id_direccion = addressResult.insertId;
                console.log(`✅ [${requestId}] Dirección tiempo real creada con ID: ${id_direccion}`);
            }        } else {
            console.log(`👤 [${requestId}] Procesando cliente INVITADO...`);
            console.log(`🔍 [${requestId}] Verificando si existe usuario invitado con teléfono: ${cliente.telefono}`);
            
            // Para clientes invitados, verificamos si ya existe en usuarios_invitados
            const [existingGuests] = await connection.query(
                'SELECT * FROM usuarios_invitados WHERE celular = ?',
                [cliente.telefono]
            );
            
            console.log(`📊 [${requestId}] Usuarios invitados encontrados: ${existingGuests.length}`);
            
            if (existingGuests.length > 0) {
                // Si ya existe, usamos ese ID y actualizamos la información
                id_usuario_invitado = existingGuests[0].id_usuario_invitado;
                console.log(`♻️ [${requestId}] Usuario invitado existente encontrado. ID: ${id_usuario_invitado}`);
                console.log(`🔄 [${requestId}] Actualizando información del usuario invitado...`);
                
                const updateQuery = 'UPDATE usuarios_invitados SET nombre = ?, apellido = ?, ultimo_pedido = CURRENT_TIMESTAMP WHERE id_usuario_invitado = ?';
                const updateParams = [cliente.nombre, cliente.apellido || '', id_usuario_invitado];
                console.log(`📝 [${requestId}] Query actualización:`, updateQuery);
                console.log(`📝 [${requestId}] Parámetros actualización:`, updateParams);
                
                await connection.query(updateQuery, updateParams);
                console.log(`✅ [${requestId}] Usuario invitado actualizado exitosamente`);
            } else {
                // Si no existe, creamos un nuevo usuario invitado SOLO en usuarios_invitados
                console.log(`➕ [${requestId}] Creando nuevo usuario invitado...`);
                const insertGuestQuery = 'INSERT INTO usuarios_invitados (nombre, apellido, celular, fecha_creacion, ultimo_pedido) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
                const insertGuestParams = [cliente.nombre, cliente.apellido || '', cliente.telefono];
                console.log(`📝 [${requestId}] Query inserción invitado:`, insertGuestQuery);
                console.log(`📝 [${requestId}] Parámetros inserción invitado:`, insertGuestParams);
                
                const [guestResult] = await connection.query(insertGuestQuery, insertGuestParams);
                id_usuario_invitado = guestResult.insertId;
                console.log(`✅ [${requestId}] Nuevo usuario invitado creado con ID: ${id_usuario_invitado}`);
            }

            // Para direcciones de usuarios invitados, creamos un usuario temporal SOLO si es necesario
            // para mantener la integridad referencial con la tabla direcciones
            console.log(`👤 [${requestId}] Creando usuario temporal para direcciones...`);
            const tempEmail = `invitado_${cliente.telefono}_${Date.now()}@mamamianpizza.com`;
            const tempUserQuery = 'INSERT INTO usuarios (nombre, correo, contrasena, celular) VALUES (?, ?, ?, ?)';
            const tempUserParams = [
                `Invitado-${cliente.nombre}`, 
                tempEmail,
                await bcrypt.hash('no_password_guest', 5), // Hash dummy para usuarios invitados
                cliente.telefono
            ];
            console.log(`📝 [${requestId}] Query usuario temporal:`, tempUserQuery);
            console.log(`📝 [${requestId}] Parámetros usuario temporal (sin contraseña):`, [tempUserParams[0], tempUserParams[1], '[HASH_OCULTO]', tempUserParams[3]]);
            
            const [tempUserResult] = await connection.query(tempUserQuery, tempUserParams);
            id_usuario = tempUserResult.insertId;
            console.log(`✅ [${requestId}] Usuario temporal creado con ID: ${id_usuario}`);

            console.log(`📍 [${requestId}] Creando dirección para usuario invitado...`);
            // Crear la dirección usando el usuario temporal
            if (direccion.tipo_direccion === 'formulario') {
                console.log(`📋 [${requestId}] Insertando dirección tipo formulario para invitado...`);
                const addressQuery = 'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio, referencias) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const addressParams = [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio, direccion.referencias || null];
                console.log(`📝 [${requestId}] Query dirección invitado:`, addressQuery);
                console.log(`📝 [${requestId}] Parámetros dirección invitado:`, addressParams);
                
                const [addressResult] = await connection.query(addressQuery, addressParams);
                id_direccion = addressResult.insertId;
                console.log(`✅ [${requestId}] Dirección formulario para invitado creada con ID: ${id_direccion}`);
            } else {
                console.log(`🌍 [${requestId}] Insertando dirección tiempo real para invitado...`);
                const addressQuery = 'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const addressParams = [id_usuario, direccion.direccion_formateada || 'Ubicación en tiempo real', 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada];
                console.log(`📝 [${requestId}] Query dirección tiempo real invitado:`, addressQuery);
                console.log(`📝 [${requestId}] Parámetros dirección tiempo real invitado:`, addressParams);
                
                const [addressResult] = await connection.query(addressQuery, addressParams);
                id_direccion = addressResult.insertId;
                console.log(`✅ [${requestId}] Dirección tiempo real para invitado creada con ID: ${id_direccion}`);
            }
        }
        
        console.log(`📊 [${requestId}] Resumen IDs creados:`);
        console.log(`👤 [${requestId}] ID Usuario: ${id_usuario}`);
        console.log(`👤 [${requestId}] ID Usuario Invitado: ${id_usuario_invitado}`);
        console.log(`📍 [${requestId}] ID Dirección: ${id_direccion}`);
        
        console.log(`🛒 [${requestId}] ===== INICIANDO CREACIÓN DEL PEDIDO =====`);// Create new order
        console.log(`🛒 [${requestId}] Preparando campos para inserción del pedido...`);
        
        // Determine initial order status based on payment method (using valid ENUM values)
        let estadoInicial = 'pendiente'; // Default for cash payments
        if (metodo_pago === 'tarjeta') {
            // For card payments, check if we have transaction details
            if (req.body.wompi_transaction_id && req.body.wompi_authorization_code) {
                estadoInicial = 'en proceso'; // Payment already processed
                console.log(`💳 [${requestId}] Pago con tarjeta procesado, estado inicial: 'en proceso'`);
            } else {
                estadoInicial = 'pendiente'; // Payment pending
                console.log(`💳 [${requestId}] Pago con tarjeta pendiente, estado inicial: 'pendiente'`);
            }
        }
        
        // Prepare order fields and values (base fields)
        const orderInsertFields = [
            'codigo_pedido', 'id_usuario', 'id_direccion', 'estado', 'total', 'tipo_cliente', 
            'metodo_pago', 'nombre_cliente', 'apellido_cliente', 'telefono', 'email', 
            'subtotal', 'costo_envio', 'aceptado_terminos', 'tiempo_estimado_entrega'
        ];
        
        const orderInsertValues = [
            codigo_pedido, id_usuario, id_direccion, estadoInicial, total, tipo_cliente, 
            metodo_pago, cliente.nombre, cliente.apellido, cliente.telefono, cliente.email || null, 
            subtotal, costo_envio, aceptado_terminos ? 1 : 0, tiempo_estimado_entrega
        ];
        
        // Add payment details if this is a card payment with transaction info
        if (metodo_pago === 'tarjeta' && req.body.wompi_transaction_id) {
            orderInsertFields.push('payment_reference');
            orderInsertValues.push(req.body.wompi_transaction_id);
            
            if (req.body.wompi_authorization_code) {
                orderInsertFields.push('payment_authorization');
                orderInsertValues.push(req.body.wompi_authorization_code);
            }
            
            if (estadoInicial === 'en proceso') {
                orderInsertFields.push('payment_completed_at');
                orderInsertValues.push(new Date());
            }
            
            console.log(`💳 [${requestId}] Agregando detalles de pago: Transaction ID: ${req.body.wompi_transaction_id}, Auth Code: ${req.body.wompi_authorization_code || 'N/A'}`);
        }

        // Para usuarios invitados, también incluir id_usuario_invitado
        if (tipo_cliente === 'invitado' && id_usuario_invitado) {
            console.log(`👤 [${requestId}] Agregando ID de usuario invitado al pedido: ${id_usuario_invitado}`);
            orderInsertFields.push('id_usuario_invitado');
            orderInsertValues.push(id_usuario_invitado);
        }

        const placeholders = orderInsertFields.map(() => '?').join(', ');
        const orderQuery = `INSERT INTO pedidos (${orderInsertFields.join(', ')}) VALUES (${placeholders})`;

        console.log(`📝 [${requestId}] Query del pedido:`, orderQuery);
        console.log(`📝 [${requestId}] Campos del pedido:`, orderInsertFields);
        console.log(`📝 [${requestId}] Valores del pedido:`, orderInsertValues);

        console.log(`💾 [${requestId}] Ejecutando inserción del pedido...`);
        const [orderResult] = await connection.query(orderQuery, orderInsertValues);

        const id_pedido = orderResult.insertId;
        console.log(`✅ [${requestId}] Pedido creado exitosamente!`);
        console.log(`🆔 [${requestId}] ID del pedido: ${id_pedido}`);
        console.log(`🔖 [${requestId}] Código del pedido: ${codigo_pedido}`);
        console.log(`👤 [${requestId}] Tipo de cliente: ${tipo_cliente}`);
        console.log(`💰 [${requestId}] Total del pedido: $${total}`);
        console.log(`💳 [${requestId}] Método de pago: ${metodo_pago}`);
        console.log(`📊 [${requestId}] Estado inicial: ${estadoInicial}`);
        
        console.log(`🛍️ [${requestId}] ===== INICIANDO PROCESAMIENTO DE PRODUCTOS =====`);        
        // Array para almacenar los detalles insertados correctamente
        const detallesInsertados = [];
        const erroresDetalles = [];
        
        console.log(`📊 [${requestId}] Total de productos a procesar: ${productos.length}`);

        // Add order details
        for (const [index, producto] of productos.entries()) {
            console.log(`\n🛍️ [${requestId}] === PROCESANDO PRODUCTO ${index + 1}/${productos.length} ===`);
            console.log(`📝 [${requestId}] Datos del producto:`, JSON.stringify(producto, null, 2));
            
            try {
                // Generar un ID seguro para la base de datos si viene uno del frontend
                const id_producto_original = producto.id_producto ? generateProductId(producto.id_producto) : null;
                console.log(`🆔 [${requestId}] ID producto original: ${producto.id_producto} -> ID generado: ${id_producto_original}`);
                
                // Primero buscamos si el producto existe
                let id_producto_a_usar = null;
                
                console.log(`🔍 [${requestId}] Buscando producto por título: "${producto.nombre_producto}"`);
                // Buscamos primero por título del producto para mayor precisión
                const [productosByName] = await connection.query(
                    'SELECT id_producto FROM productos WHERE titulo = ?',
                    [producto.nombre_producto]
                );
                
                console.log(`📊 [${requestId}] Productos encontrados por título: ${productosByName.length}`);
                
                if (productosByName.length > 0) {
                    // Si encontramos el producto por nombre, usamos ese ID
                    id_producto_a_usar = productosByName[0].id_producto;
                    console.log(`✅ [${requestId}] Producto encontrado por título: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                } else if (id_producto_original) {
                    console.log(`🔍 [${requestId}] Buscando producto por ID: ${id_producto_original}`);
                    // Si no encontramos por nombre pero tenemos un ID original, verificamos si existe
                    const [productsById] = await connection.query(
                        'SELECT id_producto FROM productos WHERE id_producto = ?',
                        [id_producto_original]
                    );
                    
                    console.log(`📊 [${requestId}] Productos encontrados por ID: ${productsById.length}`);
                    
                    if (productsById.length > 0) {
                        id_producto_a_usar = id_producto_original;
                        console.log(`✅ [${requestId}] Producto encontrado por ID: ${id_producto_a_usar}`);
                    }
                }
                
                if (!id_producto_a_usar) {
                    // El producto no existe en la base de datos.
                    console.error(`❌ [${requestId}] ERROR: El producto "${producto.nombre_producto}" no existe en la base de datos.`);
                    console.error(`❌ [${requestId}] Búsquedas realizadas:`);
                    console.error(`   - Por título: "${producto.nombre_producto}" -> 0 resultados`);
                    if (id_producto_original) {
                        console.error(`   - Por ID: ${id_producto_original} -> 0 resultados`);
                    }
                    
                    // No creamos productos automáticamente, retornamos error
                    erroresDetalles.push({
                        producto: producto.nombre_producto,
                        error: 'Producto no encontrado en la base de datos',
                        id_producto_buscado: id_producto_original,
                        indice: index + 1
                    });
                    
                    console.log(`⏩ [${requestId}] Saltando al siguiente producto...`);
                    continue; // Saltamos al siguiente producto
                }
                
                // Calculamos el subtotal si no viene
                const subtotalProducto = producto.subtotal || (producto.cantidad * producto.precio_unitario);
                console.log(`💰 [${requestId}] Subtotal calculado: ${subtotalProducto} (cantidad: ${producto.cantidad} x precio: ${producto.precio_unitario})`);
                
                console.log(`💾 [${requestId}] Preparando inserción del detalle del pedido...`);
                // Insertamos el detalle del pedido con el ID de producto adecuado
                const detalleSql = `INSERT INTO detalle_pedidos (
                    id_pedido, id_producto, nombre_producto, cantidad, precio_unitario,
                    masa, tamano, instrucciones_especiales, subtotal, metodo_entrega
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const detalleParams = [
                    id_pedido, id_producto_a_usar, producto.nombre_producto,
                    producto.cantidad, producto.precio_unitario, producto.masa || null,
                    producto.tamano || null, producto.instrucciones_especiales || null,
                    subtotalProducto, producto.metodo_entrega !== undefined ? producto.metodo_entrega : 0
                ];
                
                console.log(`📝 [${requestId}] Query detalle:`, detalleSql);
                console.log(`📝 [${requestId}] Parámetros detalle:`, detalleParams);
                
                console.log(`💾 [${requestId}] Ejecutando inserción del detalle...`);
                const [detailResult] = await connection.query(detalleSql, detalleParams);
                
                const detalleInsertado = {
                    id_detalle: detailResult.insertId,
                    nombre_producto: producto.nombre_producto,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio_unitario,
                    subtotal: subtotalProducto,
                    metodo_entrega: producto.metodo_entrega !== undefined ? producto.metodo_entrega : 0,
                    id_producto_usado: id_producto_a_usar
                };
                
                // Guardamos el ID del detalle insertado
                detallesInsertados.push(detalleInsertado);
                
                console.log(`✅ [${requestId}] Detalle insertado exitosamente!`);
                console.log(`🆔 [${requestId}] ID detalle: ${detailResult.insertId}`);
                console.log(`🛍️ [${requestId}] Producto: ${producto.nombre_producto}`);
                console.log(`📊 [${requestId}] Cantidad: ${producto.cantidad}`);
                console.log(`💰 [${requestId}] Subtotal: $${subtotalProducto}`);
                
            } catch (detailError) {
                console.error(`❌ [${requestId}] ERROR al procesar detalle del pedido para producto ${producto.nombre_producto}:`);
                console.error(`❌ [${requestId}] Error detallado:`, detailError);
                console.error(`❌ [${requestId}] Stack trace:`, detailError.stack);
                console.error(`❌ [${requestId}] Datos del producto con error:`, JSON.stringify(producto, null, 2));
                
                // Añadir a la lista de errores
                erroresDetalles.push({
                    producto: producto.nombre_producto,
                    error: detailError.message,
                    indice: index + 1,
                    datos_producto: producto
                });
            }
        }
        
        console.log(`\n📊 [${requestId}] ===== RESUMEN DEL PROCESAMIENTO DE PRODUCTOS =====`);
        console.log(`✅ [${requestId}] Productos procesados exitosamente: ${detallesInsertados.length}`);
        console.log(`❌ [${requestId}] Productos con errores: ${erroresDetalles.length}`);
        console.log(`📊 [${requestId}] Total de productos: ${productos.length}`);        
        // Verificar si hay algún detalle insertado
        if (detallesInsertados.length === 0) {
            console.error(`❌ [${requestId}] CRÍTICO: No se pudo insertar ningún detalle del pedido`);
            console.error(`❌ [${requestId}] Errores encontrados:`, erroresDetalles);
            console.error(`❌ [${requestId}] Realizando rollback de la transacción...`);
            
            // Si no se pudo insertar ningún detalle, hacemos rollback y devolvemos error
            await connection.rollback();
            return res.status(500).json({ 
                message: 'No se pudo crear ningún detalle del pedido',
                request_id: requestId,
                total_productos: productos.length,
                productos_fallidos: erroresDetalles.length,
                errores: erroresDetalles
            });
        }
        
        console.log(`🔍 [${requestId}] Verificando integridad de los detalles en la base de datos...`);
        // Verificamos que los detalles fueron guardados
        const [verificacionDetalles] = await connection.query(
            'SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?',
            [id_pedido]
        );
        
        const detallesEnBD = verificacionDetalles[0].count;
        console.log(`📊 [${requestId}] Verificación de integridad:`);
        console.log(`   - Detalles esperados: ${detallesInsertados.length}`);
        console.log(`   - Detalles en BD: ${detallesEnBD}`);
        console.log(`   - Total productos originales: ${productos.length}`);
        
        if (detallesEnBD !== detallesInsertados.length) {
            console.warn(`⚠️ [${requestId}] ADVERTENCIA: Discrepancia en cantidad de detalles`);
            console.warn(`   - Se esperaban ${detallesInsertados.length} pero hay ${detallesEnBD} en BD`);
        } else {
            console.log(`✅ [${requestId}] Verificación de integridad exitosa`);
        }
        
        console.log(`💾 [${requestId}] Confirmando transacción...`);
        // Commit the transaction
        await connection.commit();
            try {
                await notifyOrder({orderId: id_pedido, total})
                console.log(`✅ [${requestId}] Notificación de pedido enviada exitosamente`);
            } catch (err){
                console.error(`❌ [${requestId}] Error al enviar notificación de pedido:`, err.message);
                // No detener el proceso si falla la notificación
            }

        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.log(`\n🎉 [${requestId}] ===== PEDIDO CREADO EXITOSAMENTE =====`);
        console.log(`🆔 [${requestId}] ID del pedido: ${id_pedido}`);
        console.log(`🔖 [${requestId}] Código del pedido: ${codigo_pedido}`);
        console.log(`👤 [${requestId}] Cliente: ${cliente.nombre} ${cliente.apellido || ''}`);
        console.log(`📞 [${requestId}] Teléfono: ${cliente.telefono}`);
        console.log(`💰 [${requestId}] Total: $${total}`);
        console.log(`🛍️ [${requestId}] Productos exitosos: ${detallesInsertados.length}/${productos.length}`);
        console.log(`❌ [${requestId}] Productos con error: ${erroresDetalles.length}`);
        console.log(`⏱️ [${requestId}] Tiempo de procesamiento: ${processingTime}ms`);
        console.log(`📅 [${requestId}] Timestamp: ${new Date().toISOString()}`);
        
        if (erroresDetalles.length > 0) {
            console.warn(`⚠️ [${requestId}] Errores reportados:`, erroresDetalles);
        }

        // Send success response
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            request_id: requestId,
            id_pedido: id_pedido,
            codigo_pedido: codigo_pedido,
            productos_registrados: detallesInsertados.length,
            total_productos: productos.length,
            processing_time_ms: processingTime,
            timestamp: new Date().toISOString(),
            detalles: detallesInsertados,
            errores: erroresDetalles.length > 0 ? erroresDetalles : undefined
        });    } catch (error) {
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.error(`\n💥 [${requestId}] ===== ERROR EN CREACIÓN DE PEDIDO =====`);
        console.error(`❌ [${requestId}] Error principal:`, error.message);
        console.error(`❌ [${requestId}] Stack trace:`, error.stack);
        console.error(`❌ [${requestId}] Tiempo transcurrido: ${processingTime}ms`);
        console.error(`❌ [${requestId}] Request body original:`, JSON.stringify(req.body, null, 2));
        
        // Rollback transaction in case of error
        if (connection) {
            console.log(`🔄 [${requestId}] Realizando rollback de la transacción...`);
            try {
                await connection.rollback();
                console.log(`✅ [${requestId}] Rollback completado exitosamente`);
            } catch (rollbackError) {
                console.error(`❌ [${requestId}] Error durante rollback:`, rollbackError);
            }
        }
        
        console.error(`📅 [${requestId}] Timestamp del error: ${new Date().toISOString()}`);
        
        res.status(500).json({ 
            message: 'Error al procesar el pedido', 
            error: error.message,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            processing_time_ms: processingTime
        });
    } finally {
        if (connection) {
            console.log(`🔗 [${requestId}] Liberando conexión a la base de datos...`);
            try {
                connection.release();
                console.log(`✅ [${requestId}] Conexión liberada exitosamente`);
            } catch (releaseError) {
                console.error(`❌ [${requestId}] Error al liberar conexión:`, releaseError);
            }
        }
        
        const finalTime = Date.now();
        const totalTime = finalTime - startTime;
        console.log(`\n⏱️ [${requestId}] ===== FIN DEL PROCESAMIENTO =====`);
        console.log(`⏱️ [${requestId}] Tiempo total: ${totalTime}ms`);
        console.log(`📅 [${requestId}] Fin: ${new Date().toISOString()}`);
        console.log(`🔚 [${requestId}] ================================================\n`);
    }
};



// Function to get all orders
exports.getAllOrders = async (req, res) => {
    try {
        // Obtener todos los pedidos con sus detalles y datos de cliente
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            ORDER BY 
                p.fecha_pedido DESC
        `);

        // Para cada pedido, obtener sus detalles de productos
        for (const order of orders) {
            const [detalles] = await pool.promise().query(`
                SELECT 
                    dp.*,
                    pr.titulo AS nombre_producto_original,
                    pr.descripcion
                FROM 
                    detalle_pedidos dp
                LEFT JOIN
                    productos pr ON dp.id_producto = pr.id_producto
                WHERE 
                    dp.id_pedido = ?
            `, [order.id_pedido]);
            
            order.detalles = detalles;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
};

// Function to get orders by status
exports.getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
          // Validar que el estado proporcionado sea válido
        const estadosValidos = ['pendiente', 'en proceso', 'en camino', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(status)) {
            return res.status(400).json({ message: 'Estado de pedido no válido' });
        }
        
        // Obtener pedidos filtrados por estado
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            WHERE 
                p.estado = ?
            ORDER BY 
                p.fecha_pedido DESC
        `, [status]);

        // Para cada pedido, obtener sus detalles de productos
        for (const order of orders) {
            const [detalles] = await pool.promise().query(`
                SELECT 
                    dp.*,
                    pr.titulo AS nombre_producto_original,
                    pr.descripcion
                FROM 
                    detalle_pedidos dp
                LEFT JOIN
                    productos pr ON dp.id_producto = pr.id_producto
                WHERE 
                    dp.id_pedido = ?
            `, [order.id_pedido]);
            
            order.detalles = detalles;
        }

        res.json(orders);
    } catch (error) {
        console.error(`Error al obtener los pedidos con estado ${req.params.status}:`, error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
};

// Function to get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Buscando pedido con ID: ${id}`);
        
        // Obtener los detalles del pedido específico
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            WHERE 
                p.id_pedido = ?
        `, [id]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        const order = orders[0];
        console.log(`Pedido encontrado: ${order.codigo_pedido}`);
        
        // Verificamos primero si existen detalles para este pedido
        const [checkDetalles] = await pool.promise().query(`
            SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?
        `, [id]);
        
        console.log(`Número de detalles encontrados: ${checkDetalles[0].count}`);
        
        // Si no hay detalles, realizamos la inserción manual para debug
        if (checkDetalles[0].count === 0) {
            console.log(`No se encontraron detalles para el pedido ${id}. Puede ser necesario verificar la tabla detalle_pedidos.`);
        }
        
        // Obtener los detalles de productos del pedido
        const detallesQuery = `
            SELECT 
                dp.*,
                pr.titulo AS nombre_producto_original,
                pr.descripcion
            FROM 
                detalle_pedidos dp
            LEFT JOIN
                productos pr ON dp.id_producto = pr.id_producto
            WHERE 
                dp.id_pedido = ?
        `;
        console.log(`Ejecutando consulta de detalles: ${detallesQuery.replace(/\s+/g, ' ')} con ID: ${id}`);
        
        const [detalles] = await pool.promise().query(detallesQuery, [id]);
        console.log(`Detalles recuperados: ${detalles.length}`);
        
        order.detalles = detalles;
        
        res.json(order);
    } catch (error) {
        console.error(`Error al obtener el pedido con ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
};

// Function to update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
          // Validar que el estado proporcionado sea válido
        const estadosValidos = ['pendiente', 'en proceso', 'en camino', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado de pedido no válido' });
        }
        
        // Actualizar el estado del pedido
        const [result] = await pool.promise().query(
            'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
            [estado, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        res.json({ 
            message: 'Estado del pedido actualizado correctamente',
            id_pedido: id,
            nuevo_estado: estado
        });
    } catch (error) {
        console.error(`Error al actualizar el estado del pedido con ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message });
    }
};

// Function to check and repair orders without details
exports.checkOrderDetails = async (req, res) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const { id_pedido } = req.params;
        const { productos } = req.body;
        
        // Verificar si existen detalles para este pedido
        const [checkDetalles] = await connection.query(
            'SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?',
            [id_pedido]
        );

        if (checkDetalles[0].count > 0) {
            // Si ya existen detalles, informamos que todo está bien
            await connection.commit();
            return res.status(200).json({
                message: 'El pedido ya tiene detalles registrados',
                detalles_count: checkDetalles[0].count
            });
        }

        // Si no hay productos en la solicitud, devolvemos error
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Se requieren productos para reparar el pedido',
                error: 'El array de productos está vacío o no fue proporcionado'
            });
        }

        // Array para almacenar los detalles insertados
        const detallesInsertados = [];

        // Insertar los detalles del pedido
        for (const producto of productos) {
            try {
                if (!producto.nombre_producto || !producto.cantidad || !producto.precio_unitario) {
                    console.error('Datos de producto incompletos:', producto);
                    continue;
                }

                // Buscar si el producto existe por título
                const [productosByName] = await connection.query(
                    'SELECT id_producto FROM productos WHERE titulo = ?',
                    [producto.nombre_producto]
                );

                let id_producto_a_usar = null;

                if (productosByName.length > 0) {
                    id_producto_a_usar = productosByName[0].id_producto;
                    console.log(`Producto encontrado: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                } else {
                    // Crear producto si no existe
                    const [newProductResult] = await connection.query(
                        'INSERT INTO productos (titulo, precio, descripcion) VALUES (?, ?, ?)',
                        [producto.nombre_producto, producto.precio_unitario, 'Producto añadido desde reparación de pedido']
                    );
                    
                    id_producto_a_usar = newProductResult.insertId;
                    console.log(`Nuevo producto creado: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                }
                
                // Calcular subtotal si no viene en la petición
                const subtotal = producto.subtotal || (producto.cantidad * producto.precio_unitario);
                
                // Insertar detalle del pedido
                const [detailResult] = await connection.query(
                    `INSERT INTO detalle_pedidos (
                        id_pedido, id_producto, nombre_producto, cantidad, precio_unitario,
                        masa, tamano, instrucciones_especiales, subtotal, metodo_entrega
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id_pedido, id_producto_a_usar, producto.nombre_producto,
                        producto.cantidad, producto.precio_unitario, producto.masa || null,
                        producto.tamano || null, producto.instrucciones_especiales || null,
                        subtotal, producto.metodo_entrega !== undefined ? producto.metodo_entrega : 0
                    ]
                );
                
                detallesInsertados.push({
                    id_detalle: detailResult.insertId,
                    nombre_producto: producto.nombre_producto,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio_unitario,
                    subtotal,
                    metodo_entrega: producto.metodo_entrega !== undefined ? producto.metodo_entrega : 0
                });
                
                console.log(`Detalle insertado para pedido ${id_pedido}, producto ${producto.nombre_producto}`);
            } catch (error) {
                console.error(`Error al procesar producto ${producto.nombre_producto}:`, error);
            }
        }
        
        // Verificar si se insertaron detalles
        if (detallesInsertados.length === 0) {
            await connection.rollback();
            return res.status(500).json({
                message: 'No se pudo reparar el pedido',
                error: 'No se pudo insertar ningún detalle'
            });
        }
        
        // Confirmar la transacción
        await connection.commit();
        
        return res.status(200).json({
            message: 'Pedido reparado exitosamente',
            detalles_insertados: detallesInsertados.length,
            detalles: detallesInsertados
        });
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al reparar el pedido:', error);
        return res.status(500).json({
            message: 'Error al reparar el pedido',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.metodo_entrega = async (req, res) => {
    pool.query('SELECT * FROM detalle_pedidos', (err, results) => {
        if(err){
            console.log('Error al obtener los detalles de los pedidos', err);
            res.status(500).json({
                message:'Algo salio mal al obtener los detalles de los pedidos',
                error: err.message
            })
        }
        
            else{
                res.status(200).json({
                    message: 'datos obtenidos exitosamente',
                    details: results
                })
            }
    })
}

// Function to get net income statistics by time period with comparative analysis
exports.getNetIncomeStatistics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ESTADÍSTICAS DE INGRESOS DEL DÍA ACTUAL Y COMPARATIVA
        // Query para calcular ingresos netos de hoy
        const [currentDayResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = CURDATE()
        `);
        
        // Query para calcular ingresos netos de ayer
        const [previousDayResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Query para calcular ingresos netos del mismo día la semana pasada
        const [sameDayLastWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        
        // ESTADÍSTICAS DE INGRESOS DE LA SEMANA ACTUAL Y COMPARATIVA
        // Query para calcular ingresos netos de la semana actual (lunes a domingo)
        const [currentWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Query para calcular ingresos netos de la semana anterior
        const [previousWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)
        `);
        
        // Query para calcular ingresos netos de la misma semana el mes pasado
        const [sameWeekLastMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 1)
        `);
        
        // ESTADÍSTICAS DE INGRESOS DEL MES ACTUAL Y COMPARATIVA
        // Query para calcular ingresos netos del mes actual
        const [currentMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(CURDATE()) AND MONTH(fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Query para calcular ingresos netos del mes anterior
        const [previousMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
            AND MONTH(fecha_pedido) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        `);
        
        // Query para calcular ingresos netos del mismo mes el año pasado
        const [sameMonthLastYearResults] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) 
            AND MONTH(fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Calcular porcentajes de crecimiento de ingresos
        const dayIncomeGrowthFromYesterday = calculateGrowth(currentDayResults[0].total_income, previousDayResults[0].total_income);
        const dayIncomeGrowthFromLastWeek = calculateGrowth(currentDayResults[0].total_income, sameDayLastWeekResults[0].total_income);
        
        const weekIncomeGrowthFromLastWeek = calculateGrowth(currentWeekResults[0].total_income, previousWeekResults[0].total_income);
        const weekIncomeGrowthFromLastMonth = calculateGrowth(currentWeekResults[0].total_income, sameWeekLastMonthResults[0].total_income);
        
        const monthIncomeGrowthFromLastMonth = calculateGrowth(currentMonthResults[0].total_income, previousMonthResults[0].total_income);
        const monthIncomeGrowthFromLastYear = calculateGrowth(currentMonthResults[0].total_income, sameMonthLastYearResults[0].total_income);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Estadísticas comparativas de ingresos netos obtenidas exitosamente",
            daily: {
                today: parseFloat(currentDayResults[0].total_income).toFixed(2),
                yesterday: parseFloat(previousDayResults[0].total_income).toFixed(2),
                sameDayLastWeek: parseFloat(sameDayLastWeekResults[0].total_income).toFixed(2),
                growthFromYesterday: dayIncomeGrowthFromYesterday,
                growthFromLastWeek: dayIncomeGrowthFromLastWeek
            },
            weekly: {
                currentWeek: parseFloat(currentWeekResults[0].total_income).toFixed(2),
                previousWeek: parseFloat(previousWeekResults[0].total_income).toFixed(2),
                sameWeekLastMonth: parseFloat(sameWeekLastMonthResults[0].total_income).toFixed(2),
                growthFromLastWeek: weekIncomeGrowthFromLastWeek,
                growthFromLastMonth: weekIncomeGrowthFromLastMonth
            },
            monthly: {
                currentMonth: parseFloat(currentMonthResults[0].total_income).toFixed(2),
                previousMonth: parseFloat(previousMonthResults[0].total_income).toFixed(2),
                sameMonthLastYear: parseFloat(sameMonthLastYearResults[0].total_income).toFixed(2),
                growthFromLastMonth: monthIncomeGrowthFromLastMonth,
                growthFromLastYear: monthIncomeGrowthFromLastYear
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas de ingresos netos:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de ingresos netos',
            error: error.message
        });
    }
};

// Function to get total net income (simple endpoint for current totals)
exports.getNetIncome = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // Ingresos totales de hoy
        const [todayIncome] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE DATE(fecha_pedido) = CURDATE()
        `);
        
        // Ingresos totales de esta semana
        const [weekIncome] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEARWEEK(fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Ingresos totales de este mes
        const [monthIncome] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(CURDATE()) AND MONTH(fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Ingresos totales de este año
        const [yearIncome] = await connection.query(`
            SELECT IFNULL(SUM(total), 0) as total_income 
            FROM pedidos 
            WHERE YEAR(fecha_pedido) = YEAR(CURDATE())
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Ingresos netos obtenidos exitosamente",
            netIncome: {
                today: parseFloat(todayIncome[0].total_income).toFixed(2),
                thisWeek: parseFloat(weekIncome[0].total_income).toFixed(2),
                thisMonth: parseFloat(monthIncome[0].total_income).toFixed(2),
                thisYear: parseFloat(yearIncome[0].total_income).toFixed(2)
            }
        });
        
    } catch (error) {
        console.error('Error al obtener ingresos netos:', error);
        res.status(500).json({
            message: 'Error al obtener ingresos netos',
            error: error.message
        });
    }
};

// Function to get units sold statistics by time period with comparative analysis
exports.getUnitsSoldStatistics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ESTADÍSTICAS DE UNIDADES VENDIDAS DEL DÍA ACTUAL Y COMPARATIVA
        // Query para calcular unidades vendidas de hoy
        const [currentDayResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE DATE(p.fecha_pedido) = CURDATE()
        `);
        
        // Query para calcular unidades vendidas de ayer
        const [previousDayResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE DATE(p.fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Query para calcular unidades vendidas del mismo día la semana pasada
        const [sameDayLastWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE DATE(p.fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        
        // ESTADÍSTICAS DE UNIDADES VENDIDAS DE LA SEMANA ACTUAL Y COMPARATIVA
        // Query para calcular unidades vendidas de la semana actual (lunes a domingo)
        const [currentWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Query para calcular unidades vendidas de la semana anterior
        const [previousWeekResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)
        `);
        
        // Query para calcular unidades vendidas de la misma semana el mes pasado
        const [sameWeekLastMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 1)
        `);
        
        // ESTADÍSTICAS DE UNIDADES VENDIDAS DEL MES ACTUAL Y COMPARATIVA
        // Query para calcular unidades vendidas del mes actual
        const [currentMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE()) AND MONTH(p.fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Query para calcular unidades vendidas del mes anterior
        const [previousMonthResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEAR(p.fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
            AND MONTH(p.fecha_pedido) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        `);
        
        // Query para calcular unidades vendidas del mismo mes el año pasado
        const [sameMonthLastYearResults] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units 
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE YEAR(p.fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) 
            AND MONTH(p.fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Calcular porcentajes de crecimiento de unidades vendidas
        const dayUnitsGrowthFromYesterday = calculateGrowth(currentDayResults[0].total_units, previousDayResults[0].total_units);
        const dayUnitsGrowthFromLastWeek = calculateGrowth(currentDayResults[0].total_units, sameDayLastWeekResults[0].total_units);
        
        const weekUnitsGrowthFromLastWeek = calculateGrowth(currentWeekResults[0].total_units, previousWeekResults[0].total_units);
        const weekUnitsGrowthFromLastMonth = calculateGrowth(currentWeekResults[0].total_units, sameWeekLastMonthResults[0].total_units);
        
        const monthUnitsGrowthFromLastMonth = calculateGrowth(currentMonthResults[0].total_units, previousMonthResults[0].total_units);
        const monthUnitsGrowthFromLastYear = calculateGrowth(currentMonthResults[0].total_units, sameMonthLastYearResults[0].total_units);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Estadísticas comparativas de unidades vendidas obtenidas exitosamente",
            daily: {
                today: parseInt(currentDayResults[0].total_units),
                yesterday: parseInt(previousDayResults[0].total_units),
                sameDayLastWeek: parseInt(sameDayLastWeekResults[0].total_units),
                growthFromYesterday: dayUnitsGrowthFromYesterday,
                growthFromLastWeek: dayUnitsGrowthFromLastWeek
            },
            weekly: {
                currentWeek: parseInt(currentWeekResults[0].total_units),
                previousWeek: parseInt(previousWeekResults[0].total_units),
                sameWeekLastMonth: parseInt(sameWeekLastMonthResults[0].total_units),
                growthFromLastWeek: weekUnitsGrowthFromLastWeek,
                growthFromLastMonth: weekUnitsGrowthFromLastMonth
            },
            monthly: {
                currentMonth: parseInt(currentMonthResults[0].total_units),
                previousMonth: parseInt(previousMonthResults[0].total_units),
                sameMonthLastYear: parseInt(sameMonthLastYearResults[0].total_units),
                growthFromLastMonth: monthUnitsGrowthFromLastMonth,
                growthFromLastYear: monthUnitsGrowthFromLastYear
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas de unidades vendidas:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de unidades vendidas',
            error: error.message
        });
    }
};

// Function to get units per order statistics by time period with comparative analysis
exports.getUnitsPerOrderStatistics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ESTADÍSTICAS DE UNIDADES POR PEDIDO DEL DÍA ACTUAL Y COMPARATIVA
        // Query para calcular promedio de unidades por pedido de hoy
        const [currentDayResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE DATE(p.fecha_pedido) = CURDATE()
                GROUP BY p.id_pedido
            ) as units_per_order_today
        `);
        
        // Query para calcular promedio de unidades por pedido de ayer
        const [previousDayResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE DATE(p.fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                GROUP BY p.id_pedido
            ) as units_per_order_yesterday
        `);
        
        // Query para calcular promedio de unidades por pedido del mismo día la semana pasada
        const [sameDayLastWeekResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE DATE(p.fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY p.id_pedido
            ) as units_per_order_last_week
        `);
        
        // ESTADÍSTICAS DE UNIDADES POR PEDIDO DE LA SEMANA ACTUAL Y COMPARATIVA
        // Query para calcular promedio de unidades por pedido de la semana actual
        const [currentWeekResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
                GROUP BY p.id_pedido
            ) as units_per_order_current_week
        `);
        
        // Query para calcular promedio de unidades por pedido de la semana anterior
        const [previousWeekResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)
                GROUP BY p.id_pedido
            ) as units_per_order_previous_week
        `);
        
        // Query para calcular promedio de unidades por pedido de la misma semana el mes pasado
        const [sameWeekLastMonthResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 4 WEEK), 1)
                GROUP BY p.id_pedido
            ) as units_per_order_same_week_last_month
        `);
        
        // ESTADÍSTICAS DE UNIDADES POR PEDIDO DEL MES ACTUAL Y COMPARATIVA
        // Query para calcular promedio de unidades por pedido del mes actual
        const [currentMonthResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE()) AND MONTH(p.fecha_pedido) = MONTH(CURDATE())
                GROUP BY p.id_pedido
            ) as units_per_order_current_month
        `);
        
        // Query para calcular promedio de unidades por pedido del mes anterior
        const [previousMonthResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEAR(p.fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
                AND MONTH(p.fecha_pedido) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                GROUP BY p.id_pedido
            ) as units_per_order_previous_month
        `);
        
        // Query para calcular promedio de unidades por pedido del mismo mes el año pasado
        const [sameMonthLastYearResults] = await connection.query(`
            SELECT 
                IFNULL(AVG(total_units_per_order), 0) as avg_units_per_order
            FROM (
                SELECT 
                    p.id_pedido,
                    SUM(dp.cantidad) as total_units_per_order
                FROM pedidos p
                JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
                WHERE YEAR(p.fecha_pedido) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) 
                AND MONTH(p.fecha_pedido) = MONTH(CURDATE())
                GROUP BY p.id_pedido
            ) as units_per_order_same_month_last_year
        `);
        
        // Calcular porcentajes de crecimiento de unidades por pedido
        const dayUnitsPerOrderGrowthFromYesterday = calculateGrowth(currentDayResults[0].avg_units_per_order, previousDayResults[0].avg_units_per_order);
        const dayUnitsPerOrderGrowthFromLastWeek = calculateGrowth(currentDayResults[0].avg_units_per_order, sameDayLastWeekResults[0].avg_units_per_order);
        
        const weekUnitsPerOrderGrowthFromLastWeek = calculateGrowth(currentWeekResults[0].avg_units_per_order, previousWeekResults[0].avg_units_per_order);
        const weekUnitsPerOrderGrowthFromLastMonth = calculateGrowth(currentWeekResults[0].avg_units_per_order, sameWeekLastMonthResults[0].avg_units_per_order);
        
        const monthUnitsPerOrderGrowthFromLastMonth = calculateGrowth(currentMonthResults[0].avg_units_per_order, previousMonthResults[0].avg_units_per_order);
        const monthUnitsPerOrderGrowthFromLastYear = calculateGrowth(currentMonthResults[0].avg_units_per_order, sameMonthLastYearResults[0].avg_units_per_order);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Estadísticas comparativas de unidades por pedido obtenidas exitosamente",
            daily: {
                today: parseFloat(currentDayResults[0].avg_units_per_order).toFixed(2),
                yesterday: parseFloat(previousDayResults[0].avg_units_per_order).toFixed(2),
                sameDayLastWeek: parseFloat(sameDayLastWeekResults[0].avg_units_per_order).toFixed(2),
                growthFromYesterday: dayUnitsPerOrderGrowthFromYesterday,
                growthFromLastWeek: dayUnitsPerOrderGrowthFromLastWeek
            },
            weekly: {
                currentWeek: parseFloat(currentWeekResults[0].avg_units_per_order).toFixed(2),
                previousWeek: parseFloat(previousWeekResults[0].avg_units_per_order).toFixed(2),
                sameWeekLastMonth: parseFloat(sameWeekLastMonthResults[0].avg_units_per_order).toFixed(2),
                growthFromLastWeek: weekUnitsPerOrderGrowthFromLastWeek,
                growthFromLastMonth: weekUnitsPerOrderGrowthFromLastMonth
            },
            monthly: {
                currentMonth: parseFloat(currentMonthResults[0].avg_units_per_order).toFixed(2),
                previousMonth: parseFloat(previousMonthResults[0].avg_units_per_order).toFixed(2),
                sameMonthLastYear: parseFloat(sameMonthLastYearResults[0].avg_units_per_order).toFixed(2),
                growthFromLastMonth: monthUnitsPerOrderGrowthFromLastMonth,
                growthFromLastYear: monthUnitsPerOrderGrowthFromLastYear
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas de unidades por pedido:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de unidades por pedido',
            error: error.message
        });
    }
};

// Function to get current units sold totals (simple endpoint)
exports.getUnitsSold = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // Unidades vendidas hoy
        const [todayUnits] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE DATE(p.fecha_pedido) = CURDATE()
        `);
        
        // Unidades vendidas esta semana
        const [weekUnits] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Unidades vendidas este mes
        const [monthUnits] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE()) AND MONTH(p.fecha_pedido) = MONTH(CURDATE())
        `);
        
        // Unidades vendidas este año
        const [yearUnits] = await connection.query(`
            SELECT IFNULL(SUM(dp.cantidad), 0) as total_units
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE())
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Devolver resultados
        res.status(200).json({
            message: "Unidades vendidas obtenidas exitosamente",
            unitsSold: {
                today: parseInt(todayUnits[0].total_units),
                thisWeek: parseInt(weekUnits[0].total_units),
                thisMonth: parseInt(monthUnits[0].total_units),
                thisYear: parseInt(yearUnits[0].total_units)
            }
        });
        
    } catch (error) {
        console.error('Error al obtener unidades vendidas:', error);
        res.status(500).json({
            message: 'Error al obtener unidades vendidas',
            error: error.message
        });
    }
};

// Function to get top 5 products by units sold (all time)
exports.getTop5ProductsByUnits = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // Top 5 productos por unidades vendidas (todos los tiempos)
        const [topProducts] = await connection.query(`
            SELECT 
                pr.titulo as nombre_producto,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            GROUP BY dp.id_producto, pr.titulo
            ORDER BY total_units_sold DESC
            LIMIT 5
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Formatear resultados
        const formattedProducts = topProducts.map((product, index) => ({
            rank: index + 1,
            productName: product.nombre_producto,
            totalUnitsSold: parseInt(product.total_units_sold),
            ordersCount: parseInt(product.orders_count),
            totalRevenue: parseFloat(product.total_revenue).toFixed(2)
        }));
        
        // Devolver resultados
        res.status(200).json({
            message: "Top 5 productos por unidades vendidas obtenidos exitosamente",
            topProducts: formattedProducts
        });
        
    } catch (error) {
        console.error('Error al obtener top 5 productos por unidades:', error);
        res.status(500).json({
            message: 'Error al obtener top 5 productos por unidades',
            error: error.message
        });
    }
};

// Function to get top 5 products by units sold with time period filter
exports.getTop5ProductsByUnitsWithFilter = async (req, res) => {
    try {
        const { period } = req.query; // 'today', 'week', 'month', 'year'
        const connection = await pool.promise().getConnection();
        
        let whereClause = '';
        let periodName = 'todos los tiempos';
        
        switch (period) {
            case 'today':
                whereClause = 'WHERE DATE(p.fecha_pedido) = CURDATE()';
                periodName = 'hoy';
                break;
            case 'week':
                whereClause = 'WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)';
                periodName = 'esta semana';
                break;
            case 'month':
                whereClause = 'WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE()) AND MONTH(p.fecha_pedido) = MONTH(CURDATE())';
                periodName = 'este mes';
                break;
            case 'year':
                whereClause = 'WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE())';
                periodName = 'este año';
                break;
            default:
                whereClause = '';
                periodName = 'todos los tiempos';
        }
          // Top 5 productos por unidades vendidas con filtro de período
        const [topProducts] = await connection.query(`
            SELECT 
                pr.titulo as nombre_producto,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            ${whereClause}
            GROUP BY dp.id_producto, pr.titulo
            ORDER BY total_units_sold DESC
            LIMIT 5
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Formatear resultados
        const formattedProducts = topProducts.map((product, index) => ({
            rank: index + 1,
            productName: product.nombre_producto,
            totalUnitsSold: parseInt(product.total_units_sold),
            ordersCount: parseInt(product.orders_count),
            totalRevenue: parseFloat(product.total_revenue).toFixed(2)
        }));
        
        // Devolver resultados
        res.status(200).json({
            message: `Top 5 productos por unidades vendidas (${periodName}) obtenidos exitosamente`,
            period: periodName,
            topProducts: formattedProducts
        });
        
    } catch (error) {
        console.error('Error al obtener top 5 productos por unidades con filtro:', error);
        res.status(500).json({
            message: 'Error al obtener top 5 productos por unidades con filtro',
            error: error.message
        });
    }
};

// Function to get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario requerido' });
    }

    try {
        // Obtener todos los pedidos del usuario específico con sus detalles
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            WHERE 
                p.id_usuario = ?
            ORDER BY 
                p.fecha_pedido DESC
        `, [userId]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pedidos para este usuario' });
        }

        // Para cada pedido, obtener sus detalles de productos
        for (const order of orders) {
            const [detalles] = await pool.promise().query(`
                SELECT 
                    dp.*,
                    pr.titulo AS nombre_producto_original,
                    pr.descripcion
                FROM 
                    detalle_pedidos dp
                LEFT JOIN
                    productos pr ON dp.id_producto = pr.id_producto
                WHERE 
                    dp.id_pedido = ?
            `, [order.id_pedido]);
            
            order.detalles = detalles;
        }

        res.json({
            message: 'Pedidos obtenidos exitosamente',
            total_pedidos: orders.length,
            pedidos: orders
        });
    } catch (error) {
        console.error('Error al obtener los pedidos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener los pedidos del usuario', error: error.message });
    }
};

// Function to get top 5 products by revenue generated (all time)
exports.getTop5ProductsByRevenue = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // Top 5 productos por ingresos generados (todos los tiempos)
        const [topProducts] = await connection.query(`
            SELECT 
                pr.titulo as nombre_producto,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                AVG(dp.precio_unitario) as avg_price
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            GROUP BY dp.id_producto, pr.titulo
            ORDER BY total_revenue DESC
            LIMIT 5
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Formatear resultados
        const formattedProducts = topProducts.map((product, index) => ({
            rank: index + 1,
            productName: product.nombre_producto,
            totalRevenue: parseFloat(product.total_revenue).toFixed(2),
            totalUnitsSold: parseInt(product.total_units_sold),
            ordersCount: parseInt(product.orders_count),
            avgPrice: parseFloat(product.avg_price).toFixed(2)
        }));
        
        // Devolver resultados
        res.status(200).json({
            message: "Top 5 productos por ingresos generados obtenidos exitosamente",
            topProducts: formattedProducts
        });
        
    } catch (error) {
        console.error('Error al obtener top 5 productos por ingresos:', error);
        res.status(500).json({
            message: 'Error al obtener top 5 productos por ingresos',
            error: error.message
        });
    }
};

// Function to get top 5 products by revenue generated with time period filter
exports.getTop5ProductsByRevenueWithFilter = async (req, res) => {
    try {
        const { period } = req.query; // 'today', 'week', 'month', 'year'
        const connection = await pool.promise().getConnection();
        
        let whereClause = '';
        let periodName = 'todos los tiempos';
        
        switch (period) {
            case 'today':
                whereClause = 'WHERE DATE(p.fecha_pedido) = CURDATE()';
                periodName = 'hoy';
                break;
            case 'week':
                whereClause = 'WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)';
                periodName = 'esta semana';
                break;
            case 'month':
                whereClause = 'WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE()) AND MONTH(p.fecha_pedido) = MONTH(CURDATE())';
                periodName = 'este mes';
                break;
            case 'year':
                whereClause = 'WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE())';
                periodName = 'este año';
                break;
            default:
                whereClause = '';
                periodName = 'todos los tiempos';
        }
        
        // Top 5 productos por ingresos generados con filtro de período
        const [topProducts] = await connection.query(`
            SELECT 
                pr.titulo as nombre_producto,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                AVG(dp.precio_unitario) as avg_price
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            ${whereClause}
            GROUP BY dp.id_producto, pr.titulo
            ORDER BY total_revenue DESC
            LIMIT 5
        `);
        
        // Liberar la conexión
        connection.release();
        
        // Formatear resultados
        const formattedProducts = topProducts.map((product, index) => ({
            rank: index + 1,
            productName: product.nombre_producto,
            totalRevenue: parseFloat(product.total_revenue).toFixed(2),
            totalUnitsSold: parseInt(product.total_units_sold),
            ordersCount: parseInt(product.orders_count),
            avgPrice: parseFloat(product.avg_price).toFixed(2)
        }));
        
        // Devolver resultados
        res.status(200).json({
            message: `Top 5 productos por ingresos generados (${periodName}) obtenidos exitosamente`,
            period: periodName,
            topProducts: formattedProducts
        });
        
    } catch (error) {
        console.error('Error al obtener top 5 productos por ingresos con filtro:', error);
        res.status(500).json({
            message: 'Error al obtener top 5 productos por ingresos con filtro',
            error: error.message
        });
    }
};

// Function to get most frequent product combinations within a date range
exports.getProductCombinations = async (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            sortBy = 'frequency', 
            sortOrder = 'desc', 
            page = 1, 
            limit = 20 
        } = req.query;
        
        const connection = await pool.promise().getConnection();
        
        // Construir filtro de fechas
        let dateFilter = '';
        const queryParams = [];
        
        if (startDate && endDate) {
            dateFilter = 'AND DATE(p.fecha_pedido) BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        } else if (startDate) {
            dateFilter = 'AND DATE(p.fecha_pedido) >= ?';
            queryParams.push(startDate);
        } else if (endDate) {
            dateFilter = 'AND DATE(p.fecha_pedido) <= ?';
            queryParams.push(endDate);
        }
        
        // Validar parámetros de ordenación
        const allowedSortFields = ['frequency', 'product_a', 'product_b', 'total_revenue'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'frequency';
        const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';
        
        // Validar parámetros de paginación
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit))); // Máximo 100 registros por página
        const offset = (pageNumber - 1) * limitNumber;
          // Query para obtener combinaciones de productos
        const combinationsQuery = `
            SELECT 
                dp1.id_producto as product_a_id,
                dp2.id_producto as product_b_id,
                pr1.titulo as product_a,
                pr2.titulo as product_b,
                COUNT(*) as frequency,
                SUM(dp1.precio_unitario + dp2.precio_unitario) as total_revenue,
                AVG(dp1.precio_unitario + dp2.precio_unitario) as avg_revenue_per_combination
            FROM detalle_pedidos dp1
            JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                AND dp1.id_producto < dp2.id_producto
            JOIN pedidos p ON dp1.id_pedido = p.id_pedido
            JOIN productos pr1 ON dp1.id_producto = pr1.id_producto
            JOIN productos pr2 ON dp2.id_producto = pr2.id_producto
            WHERE 1=1 ${dateFilter}
            GROUP BY dp1.id_producto, dp2.id_producto, pr1.titulo, pr2.titulo
            ORDER BY ${validSortBy === 'product_a' ? 'pr1.titulo' : 
                     validSortBy === 'product_b' ? 'pr2.titulo' : 
                     validSortBy === 'total_revenue' ? 'total_revenue' : 'frequency'} ${validSortOrder}
            LIMIT ? OFFSET ?
        `;
        
        // Agregar parámetros de paginación
        queryParams.push(limitNumber, offset);
        
        // Ejecutar query principal
        const [combinations] = await connection.query(combinationsQuery, queryParams);
          // Query para contar el total de combinaciones (para paginación)
        const countQuery = `
            SELECT COUNT(*) as total
            FROM (
                SELECT 
                    dp1.id_producto as product_a_id,
                    dp2.id_producto as product_b_id
                FROM detalle_pedidos dp1
                JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                    AND dp1.id_producto < dp2.id_producto
                JOIN pedidos p ON dp1.id_pedido = p.id_pedido
                WHERE 1=1 ${dateFilter}
                GROUP BY dp1.id_producto, dp2.id_producto
            ) as combinations_count
        `;
        
        const [totalCount] = await connection.query(countQuery, queryParams.slice(0, -2)); // Excluir limit y offset
          // Query para estadísticas adicionales
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT p.id_pedido) as total_orders_in_period,
                COUNT(DISTINCT CONCAT(dp1.id_producto, '-', dp2.id_producto)) as unique_combinations
            FROM detalle_pedidos dp1
            JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                AND dp1.id_producto < dp2.id_producto
            JOIN pedidos p ON dp1.id_pedido = p.id_pedido
            WHERE 1=1 ${dateFilter}
        `;
        
        const [stats] = await connection.query(statsQuery, queryParams.slice(0, -2));
        
        // Liberar la conexión
        connection.release();
          // Formatear resultados
        const formattedCombinations = combinations.map((combo, index) => ({
            rank: offset + index + 1,
            productA: {
                id: combo.product_a_id,
                name: combo.product_a
            },
            productB: {
                id: combo.product_b_id,
                name: combo.product_b
            },
            frequency: parseInt(combo.frequency),
            totalRevenue: parseFloat(combo.total_revenue).toFixed(2),
            avgRevenuePerCombination: parseFloat(combo.avg_revenue_per_combination).toFixed(2)
        }));
        
        // Información de paginación
        const totalItems = parseInt(totalCount[0].total);
        const totalPages = Math.ceil(totalItems / limitNumber);
        
        // Devolver resultados
        res.status(200).json({
            message: "Combinaciones de productos obtenidas exitosamente",
            data: formattedCombinations,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            },
            filters: {
                startDate: startDate || null,
                endDate: endDate || null,
                sortBy: validSortBy,
                sortOrder: validSortOrder.toLowerCase()
            },            statistics: {
                totalOrdersInPeriod: parseInt(stats[0]?.total_orders_in_period || 0),
                uniqueCombinations: parseInt(stats[0]?.unique_combinations || 0)
            }
        });
        
    } catch (error) {
        console.error('Error al obtener combinaciones de productos:', error);
        res.status(500).json({
            message: 'Error al obtener combinaciones de productos',
            error: error.message
        });
    }
};

/**
 * Crear orden automáticamente desde pago exitoso (estado: 'en proceso')
 * Esta función es llamada desde el controlador de pagos cuando se confirma un pago
 */
exports.createOrderFromPayment = async (orderData, transactionId) => {
    let connection;
    const startTime = Date.now();
    const requestId = `PAYMENT-ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n[${new Date().toISOString()}] ===== INICIO CREACIÓN DE PEDIDO DESDE PAGO =====`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`💳 Transaction ID: ${transactionId}`);
    console.log(`📝 Datos del pedido:`, JSON.stringify(orderData, null, 2));
    
    try {
        console.log(`🔗 [${requestId}] Estableciendo conexión a la base de datos...`);
        connection = await pool.promise().getConnection();
        console.log(`✅ [${requestId}] Conexión establecida exitosamente`);
        
        console.log(`🔄 [${requestId}] Iniciando transacción...`);
        await connection.beginTransaction();
        console.log(`✅ [${requestId}] Transacción iniciada exitosamente`);
        
        // Generar código único para el pedido
        const codigo_pedido = generateOrderCode();
        console.log(`🔖 [${requestId}] Código de pedido generado: ${codigo_pedido}`);
        
        // Extraer y validar datos
        const {
            tipo_cliente,
            cliente,
            direccion,
            metodo_pago,
            productos,
            subtotal,
            costo_envio,
            total,
            aceptado_terminos = true,
            tiempo_estimado_entrega
        } = orderData;
        
        // Validaciones básicas
        if (!cliente || !direccion || !productos || !Array.isArray(productos) || productos.length === 0) {
            throw new Error('Datos insuficientes para crear el pedido desde pago');
        }
        
        console.log(`✅ [${requestId}] Validaciones básicas completadas`);
        
        // Manejar usuario/cliente
        let id_usuario = null;
        let id_usuario_invitado = null;
        
        if (tipo_cliente === 'registrado' && cliente.id_usuario) {
            id_usuario = cliente.id_usuario;
            console.log(`👤 [${requestId}] Usuario registrado: ${id_usuario}`);
        } else {
            // Manejar usuario invitado
            console.log(`👤 [${requestId}] Procesando usuario invitado...`);
            
            // Primero verificar si ya existe un usuario invitado con este celular
            console.log(`🔍 [${requestId}] Verificando si ya existe usuario invitado con celular: ${cliente.telefono}`);
            
            const [existingGuest] = await connection.query(
                'SELECT id_usuario_invitado, nombre, apellido FROM usuarios_invitados WHERE celular = ?',
                [cliente.telefono]
            );
            
            if (existingGuest.length > 0) {
                // Usuario invitado ya existe, usar el existente
                id_usuario_invitado = existingGuest[0].id_usuario_invitado;
                console.log(`✅ [${requestId}] Usuario invitado existente encontrado: ${id_usuario_invitado} - ${existingGuest[0].nombre} ${existingGuest[0].apellido}`);
                
                // Actualizar fecha del último pedido
                await connection.query(
                    'UPDATE usuarios_invitados SET ultimo_pedido = CURRENT_TIMESTAMP WHERE id_usuario_invitado = ?',
                    [id_usuario_invitado]
                );
                console.log(`🔄 [${requestId}] Fecha de último pedido actualizada para usuario invitado: ${id_usuario_invitado}`);
                
            } else {
                // Crear nuevo usuario invitado
                console.log(`➕ [${requestId}] Creando nuevo usuario invitado...`);
                
                const [guestResult] = await connection.query(
                    'INSERT INTO usuarios_invitados (nombre, apellido, celular, fecha_creacion, ultimo_pedido) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                    [cliente.nombre, cliente.apellido, cliente.telefono]
                );
                id_usuario_invitado = guestResult.insertId;
                console.log(`✅ [${requestId}] Nuevo usuario invitado creado: ${id_usuario_invitado}`);
            }
        }
        
        // Manejar dirección
        let id_direccion = null;
        console.log(`📍 [${requestId}] Procesando dirección...`);
        
        if (direccion.tipo_direccion === 'formulario') {
            const [addressResult] = await connection.query(
                'INSERT INTO direcciones (direccion, pais, departamento, municipio, codigo_postal, instrucciones_entrega) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    direccion.direccion,
                    direccion.pais,
                    direccion.departamento,
                    direccion.municipio,
                    direccion.codigo_postal || null,
                    direccion.instrucciones_entrega || null
                ]
            );
            id_direccion = addressResult.insertId;
        } else if (direccion.tipo_direccion === 'coordenadas') {
            const [addressResult] = await connection.query(
                'INSERT INTO direcciones (latitud, longitud, direccion_formateada, instrucciones_entrega) VALUES (?, ?, ?, ?)',
                [
                    direccion.latitud,
                    direccion.longitud,
                    direccion.direccion_formateada,
                    direccion.instrucciones_entrega || null
                ]
            );
            id_direccion = addressResult.insertId;
        }
        
        console.log(`✅ [${requestId}] Dirección creada: ${id_direccion}`);
        
        // Crear pedido con estado 'en proceso' (automático para pagos exitosos)
        console.log(`🛒 [${requestId}] Creando pedido con estado 'en proceso'...`);
        console.log(`💳 [${requestId}] Método de pago recibido: ${metodo_pago || 'no especificado'}`);
        
        const orderInsertFields = [
            'codigo_pedido', 'id_usuario', 'id_direccion', 'estado', 'total', 'tipo_cliente', 
            'metodo_pago', 'nombre_cliente', 'apellido_cliente', 'telefono', 'email', 
            'subtotal', 'costo_envio', 'aceptado_terminos', 'tiempo_estimado_entrega',
            'transaction_id'
        ];
        
        // Asegurar que el método de pago sea correcto para pagos con tarjeta
        const metodoPagoFinal = metodo_pago || 'tarjeta_credito';
        console.log(`💳 [${requestId}] Método de pago asignado: ${metodoPagoFinal}`);
        
        const orderInsertValues = [
            codigo_pedido, id_usuario, id_direccion, 'en proceso', total, tipo_cliente || 'invitado', 
            metodoPagoFinal, cliente.nombre, cliente.apellido, cliente.telefono, cliente.email || null, 
            subtotal, costo_envio || 0, aceptado_terminos ? 1 : 0, tiempo_estimado_entrega || 30,
            transactionId
        ];

        // Para usuarios invitados, incluir id_usuario_invitado
        if (tipo_cliente !== 'registrado' && id_usuario_invitado) {
            orderInsertFields.push('id_usuario_invitado');
            orderInsertValues.push(id_usuario_invitado);
        }

        const placeholders = orderInsertFields.map(() => '?').join(', ');
        const orderQuery = `INSERT INTO pedidos (${orderInsertFields.join(', ')}) VALUES (${placeholders})`;

        console.log(`� [${requestId}] Query del pedido:`, orderQuery);
        console.log(`📝 [${requestId}] Valores del pedido (método de pago en posición 6):`, orderInsertValues);
        console.log(`💳 [${requestId}] Confirmando método de pago antes de insertar: ${orderInsertValues[6]}`);

        console.log(`�💾 [${requestId}] Ejecutando inserción del pedido...`);
        const [orderResult] = await connection.query(orderQuery, orderInsertValues);

        const id_pedido = orderResult.insertId;
        console.log(`✅ [${requestId}] Pedido creado en estado 'en proceso'!`);
        console.log(`🆔 [${requestId}] ID del pedido: ${id_pedido}`);
        console.log(`💳 [${requestId}] Método de pago registrado: ${metodoPagoFinal}`);
        console.log(`💰 [${requestId}] Transaction ID: ${transactionId}`);
        
        // Procesar productos
        console.log(`🛍️ [${requestId}] Procesando productos del pedido...`);
        for (const [index, producto] of productos.entries()) {
            console.log(`🛍️ [${requestId}] Procesando producto ${index + 1}: ${producto.nombre_producto}`);
            
            // Generar ID seguro para el producto
            const id_producto_seguro = generateProductId(producto.id_producto || Date.now() + index);
            
            // Insertar detalle del pedido
            await connection.query(
                `INSERT INTO detalles_pedido 
                (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal, masa, tamano, instrucciones_especiales) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_pedido,
                    id_producto_seguro,
                    producto.nombre_producto,
                    producto.cantidad,
                    producto.precio_unitario,
                    producto.subtotal || (producto.cantidad * producto.precio_unitario),
                    producto.masa || null,
                    producto.tamano || null,
                    producto.instrucciones_especiales || null
                ]
            );
            
            console.log(`✅ [${requestId}] Producto ${index + 1} agregado correctamente`);
        }
        
        // Confirmar transacción
        await connection.commit();
        console.log(`✅ [${requestId}] Transacción confirmada exitosamente`);
        
        // Enviar notificación (opcional)
        try {
            await notifyOrder({orderId: id_pedido, total});
            console.log(`📢 [${requestId}] Notificación enviada`);
        } catch (notificationError) {
            console.warn(`⚠️ [${requestId}] Error al enviar notificación:`, notificationError.message);
        }
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.log(`🎉 [${requestId}] ===== PEDIDO DESDE PAGO COMPLETADO =====`);
        console.log(`⏱️ [${requestId}] Tiempo de procesamiento: ${processingTime}ms`);
        console.log(`🆔 [${requestId}] ID Pedido: ${id_pedido}`);
        console.log(`🔖 [${requestId}] Código: ${codigo_pedido}`);
        console.log(`📊 [${requestId}] Estado: en proceso (automático)`);
        console.log(`💰 [${requestId}] Total: $${total}`);
        
        return {
            success: true,
            data: {
                id_pedido,
                codigo_pedido,
                estado: 'en proceso',
                total,
                tipo_cliente: tipo_cliente || 'invitado',
                productos_count: productos.length,
                transaction_id: transactionId,
                processing_time_ms: processingTime
            }
        };
        
    } catch (error) {
        console.error(`❌ [${requestId}] Error al crear pedido desde pago:`, error);
        
        if (connection) {
            try {
                await connection.rollback();
                console.log(`🔄 [${requestId}] Rollback ejecutado`);
            } catch (rollbackError) {
                console.error(`❌ [${requestId}] Error en rollback:`, rollbackError);
            }
        }
        
        throw error;
        
    } finally {
        if (connection) {
            connection.release();
            console.log(`🔗 [${requestId}] Conexión liberada`);
        }
    }
};