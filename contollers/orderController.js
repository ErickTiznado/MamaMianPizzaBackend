const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { parse } = require('path');

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
exports.createOrder = async (req, res) => {
    // Start a transaction
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const {
            tipo_cliente,
            cliente,
            direccion,
            metodo_pago,
            productos,
            subtotal,
            costo_envio,
            impuestos,
            total,
            aceptado_terminos,
            tiempo_estimado_entrega
        } = req.body;

        // Validate required fields
        if (!tipo_cliente || !cliente || !direccion || !metodo_pago || !productos || !total) {
            return res.status(400).json({ message: 'Faltan datos requeridos para el pedido' });
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
        }

        // Validar estructura de cada producto
        for (const producto of productos) {
            if (!producto.nombre_producto || !producto.cantidad || !producto.precio_unitario) {
                return res.status(400).json({ 
                    message: 'Datos de producto incompletos', 
                    detalle: 'Cada producto debe incluir nombre_producto, cantidad y precio_unitario' 
                });
            }
        }

        // Generate unique order code
        const codigo_pedido = generateOrderCode();

        let id_usuario = null;
        let id_usuario_invitado = null;
        let id_direccion = null;

        // Handle user data based on client type
        if (tipo_cliente === 'registrado') {
            // Authenticate user
            const [users] = await connection.query(
                'SELECT * FROM usuarios WHERE correo = ?', 
                [cliente.email]
            );
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(cliente.password, user.contrasena);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            id_usuario = user.id_usuario;
            
            // Create or update address
            if (direccion.tipo_direccion === 'formulario') {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio]
                );
                id_direccion = addressResult.insertId;
            } else {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada]
                );
                id_direccion = addressResult.insertId;
            }
        } else {
            // Para clientes invitados, guardamos en la tabla usuarios_invitados
            // Verificamos si ya existe un usuario invitado con ese número celular
            const [existingGuests] = await connection.query(
                'SELECT * FROM usuarios_invitados WHERE celular = ?',
                [cliente.telefono]
            );
            
            if (existingGuests.length > 0) {
                // Si ya existe, usamos ese ID
                id_usuario_invitado = existingGuests[0].id_usuario_invitado;
                
                // Actualizamos el registro para actualizar el timestamp de último pedido
                await connection.query(
                    'UPDATE usuarios_invitados SET ultimo_pedido = CURRENT_TIMESTAMP WHERE id_usuario_invitado = ?',
                    [id_usuario_invitado]
                );
            } else {
                // Si no existe, creamos un nuevo usuario invitado
                const [guestResult] = await connection.query(
                    'INSERT INTO usuarios_invitados (nombre, apellido, celular) VALUES (?, ?, ?)',
                    [cliente.nombre, cliente.apellido || '', cliente.telefono]
                );
                
                id_usuario_invitado = guestResult.insertId;
            }

            // Para resolver el problema con el id_usuario null, primero necesitamos 
            // crear un usuario básico que tenga id_usuario para asociarlo a las direcciones
            const [guestUserResult] = await connection.query(
                'INSERT INTO usuarios (nombre, correo, contrasena, celular) VALUES (?, ?, ?, ?)',
                [cliente.nombre, cliente.email || `invitado_${Date.now()}@mamamianpizza.com`, bcrypt.hashSync(Math.random().toString(36).substring(2), 5), cliente.telefono]
            );
            id_usuario = guestUserResult.insertId;

            // Creamos la dirección asociada al usuario
            if (direccion.tipo_direccion === 'formulario') {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio]
                );
                id_direccion = addressResult.insertId;
            } else {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion_formateada || 'Ubicación en tiempo real', 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada]
                );
                id_direccion = addressResult.insertId;
            }
        }

        // Create new order
        const [orderResult] = await connection.query(
            `INSERT INTO pedidos (
                codigo_pedido, id_usuario, id_usuario_invitado, id_direccion, estado, total, tipo_cliente, 
                metodo_pago, nombre_cliente, apellido_cliente, telefono, email, 
                num_tarjeta_masked, nombre_tarjeta, subtotal, costo_envio, impuestos, 
                aceptado_terminos, tiempo_estimado_entrega
            ) VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                codigo_pedido, id_usuario, id_usuario_invitado, id_direccion, total, tipo_cliente, 
                metodo_pago, cliente.nombre, cliente.apellido, cliente.telefono, cliente.email || null, 
                metodo_pago === 'tarjeta' ? req.body.num_tarjeta_masked : null, 
                metodo_pago === 'tarjeta' ? req.body.nombre_tarjeta : null, 
                subtotal, costo_envio, impuestos, aceptado_terminos ? 1 : 0, tiempo_estimado_entrega
            ]
        );

        const id_pedido = orderResult.insertId;
        console.log(`Pedido creado con ID: ${id_pedido}, Código: ${codigo_pedido}`);
        
        // Array para almacenar los detalles insertados correctamente
        const detallesInsertados = [];
        const erroresDetalles = [];

        // Add order details
        for (const producto of productos) {
            try {
                // Generar un ID seguro para la base de datos si viene uno del frontend
                const id_producto_original = producto.id_producto ? generateProductId(producto.id_producto) : null;
                
                // Primero buscamos si el producto existe
                let id_producto_a_usar = null;
                
                // Buscamos primero por título del producto para mayor precisión
                const [productosByName] = await connection.query(
                    'SELECT id_producto FROM productos WHERE titulo = ?',
                    [producto.nombre_producto]
                );
                
                if (productosByName.length > 0) {
                    // Si encontramos el producto por nombre, usamos ese ID
                    id_producto_a_usar = productosByName[0].id_producto;
                    console.log(`Producto encontrado por título: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                } else if (id_producto_original) {
                    // Si no encontramos por nombre pero tenemos un ID original, verificamos si existe
                    const [productsById] = await connection.query(
                        'SELECT id_producto FROM productos WHERE id_producto = ?',
                        [id_producto_original]
                    );
                    
                    if (productsById.length > 0) {
                        id_producto_a_usar = id_producto_original;
                        console.log(`Producto encontrado por ID: ${id_producto_a_usar}`);
                    }
                }
                
                if (!id_producto_a_usar) {
                    // El producto no existe en la base de datos.
                    console.log(`El producto ${producto.nombre_producto} no existe en la BD. Creando nuevo producto.`);
                    
                    // Insertamos un producto básico en la tabla productos
                    const [newProductResult] = await connection.query(
                        'INSERT INTO productos (titulo, precio, descripcion) VALUES (?, ?, ?)',
                        [producto.nombre_producto, producto.precio_unitario, 'Producto agregado desde pedido']
                    );
                    
                    id_producto_a_usar = newProductResult.insertId;
                    console.log(`Nuevo producto creado con ID: ${id_producto_a_usar}`);
                }
                
                // Calculamos el subtotal si no viene
                const subtotalProducto = producto.subtotal || (producto.cantidad * producto.precio_unitario);
                
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
                
                console.log(`Insertando detalle: ${JSON.stringify({
                    sql: detalleSql,
                    params: detalleParams
                })}`);
                
                const [detailResult] = await connection.query(detalleSql, detalleParams);
                
                // Guardamos el ID del detalle insertado
                detallesInsertados.push({
                    id_detalle: detailResult.insertId,
                    nombre_producto: producto.nombre_producto,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio_unitario,
                    subtotal: subtotalProducto,
                    metodo_entrega: producto.metodo_entrega !== undefined ? producto.metodo_entrega : 0
                });
                
                console.log(`Detalle de pedido insertado con ID: ${detailResult.insertId}`);
            } catch (detailError) {
                console.error(`Error al procesar detalle del pedido para producto ${producto.nombre_producto}:`, detailError);
                console.error('Datos del producto con error:', JSON.stringify(producto));
                
                // Añadir a la lista de errores
                erroresDetalles.push({
                    producto: producto.nombre_producto,
                    error: detailError.message
                });
            }
        }
        
        // Verificar si hay algún detalle insertado
        if (detallesInsertados.length === 0) {
            // Si no se pudo insertar ningún detalle, hacemos rollback y devolvemos error
            await connection.rollback();
            return res.status(500).json({ 
                message: 'No se pudo crear ningún detalle del pedido',
                errores: erroresDetalles
            });
        }
        
        // Verificamos que los detalles fueron guardados
        const [verificacionDetalles] = await connection.query(
            'SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?',
            [id_pedido]
        );
        
        console.log(`Detalles verificados: ${verificacionDetalles[0].count} de ${productos.length} productos`);
        
        // Commit the transaction
        await connection.commit();

        // Send success response
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            id_pedido: id_pedido,
            codigo_pedido: codigo_pedido,
            productos_registrados: detallesInsertados.length,
            total_productos: productos.length,
            detalles: detallesInsertados,
            errores: erroresDetalles.length > 0 ? erroresDetalles : undefined
        });

    } catch (error) {
        // Rollback transaction in case of error
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ message: 'Error al procesar el pedido', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
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
        const estadosValidos = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
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
        const estadosValidos = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
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
                p.nombre_producto,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            GROUP BY dp.id_producto, pr.nombre_producto
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
                pr.nombre_producto,
                SUM(dp.cantidad) as total_units_sold,
                COUNT(DISTINCT p.id_pedido) as orders_count,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            ${whereClause}
            GROUP BY dp.id_producto, pr.nombre_producto
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