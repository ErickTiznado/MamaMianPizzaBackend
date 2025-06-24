const pool = require('../config/db');

/**
 * Controlador para análisis de segmentación de clientes
 * Segmenta clientes basándose en la frecuencia de pedidos:
 * - Nuevos: 1 pedido
 * - Ocasionales: 2-3 pedidos  
 * - Habituales: 4-6 pedidos
 * - Leales: 7+ pedidos
 */

// Función para obtener análisis de segmentación de clientes
exports.getCustomerSegmentation = async (req, res) => {
    let connection;
    
    try {
        connection = await pool.promise().getConnection();
        
        // Query principal para obtener la segmentación de clientes
        const [segmentationResults] = await connection.query(`
            SELECT 
                CASE 
                    WHEN order_count = 1 THEN 'Nuevos (1 pedido)'
                    WHEN order_count BETWEEN 2 AND 3 THEN 'Ocasionales (2-3)'
                    WHEN order_count BETWEEN 4 AND 6 THEN 'Habituales (4-6)'
                    WHEN order_count >= 7 THEN 'Leales (7+)'
                END as segment,
                COUNT(*) as customers,
                AVG(total_spent) as avgValue,
                SUM(total_spent) as totalValue,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 1) as percentage
            FROM (
                SELECT 
                    p.id_usuario,
                    COUNT(p.id_pedido) as order_count,
                    SUM(p.total) as total_spent
                FROM pedidos p
                WHERE p.id_usuario IS NOT NULL
                GROUP BY p.id_usuario
            ) as customer_stats
            GROUP BY 
                CASE 
                    WHEN order_count = 1 THEN 'Nuevos (1 pedido)'
                    WHEN order_count BETWEEN 2 AND 3 THEN 'Ocasionales (2-3)'
                    WHEN order_count BETWEEN 4 AND 6 THEN 'Habituales (4-6)'
                    WHEN order_count >= 7 THEN 'Leales (7+)'
                END
            ORDER BY 
                CASE 
                    WHEN segment = 'Nuevos (1 pedido)' THEN 1
                    WHEN segment = 'Ocasionales (2-3)' THEN 2
                    WHEN segment = 'Habituales (4-6)' THEN 3
                    WHEN segment = 'Leales (7+)' THEN 4
                END
        `);
        
        // Query para obtener el total de clientes únicos
        const [totalCustomersResult] = await connection.query(`
            SELECT COUNT(DISTINCT id_usuario) as total
            FROM pedidos 
            WHERE id_usuario IS NOT NULL
        `);
        
        connection.release();
        
        const totalCustomers = totalCustomersResult[0].total;
        
        // Definir colores para cada segmento
        const segmentColors = {
            'Nuevos (1 pedido)': '#94a3b8',
            'Ocasionales (2-3)': '#3b82f6', 
            'Habituales (4-6)': '#10b981',
            'Leales (7+)': '#8b5cf6'
        };
        
        // Formatear los resultados
        const segments = segmentationResults.map(segment => ({
            segment: segment.segment,
            customers: parseInt(segment.customers),
            avgValue: parseFloat(segment.avgValue).toFixed(2),
            totalValue: parseFloat(segment.totalValue).toFixed(2),
            color: segmentColors[segment.segment],
            percentage: parseFloat(segment.percentage)
        }));
        
        // Respuesta exitosa
        res.status(200).json({
            message: "Análisis de segmentación obtenido exitosamente",
            totalCustomers: parseInt(totalCustomers),
            segments: segments
        });
        
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('Error al obtener análisis de segmentación:', error);
        res.status(500).json({
            message: 'Error al obtener análisis de segmentación',
            error: error.message
        });
    }
};

// Función para obtener detalles de un segmento específico
exports.getSegmentDetails = async (req, res) => {
    let connection;
    const { segment } = req.params;
    
    try {
        connection = await pool.promise().getConnection();
        
        // Validar el segmento solicitado
        const validSegments = ['nuevos', 'ocasionales', 'habituales', 'leales'];
        if (!validSegments.includes(segment.toLowerCase())) {
            return res.status(400).json({
                message: 'Segmento no válido',
                validSegments: ['nuevos', 'ocasionales', 'habituales', 'leales']
            });
        }
        
        // Determinar las condiciones del segmento
        let whereCondition;
        let segmentName;
        
        switch (segment.toLowerCase()) {
            case 'nuevos':
                whereCondition = 'order_count = 1';
                segmentName = 'Nuevos (1 pedido)';
                break;
            case 'ocasionales':
                whereCondition = 'order_count BETWEEN 2 AND 3';
                segmentName = 'Ocasionales (2-3)';
                break;
            case 'habituales':
                whereCondition = 'order_count BETWEEN 4 AND 6';
                segmentName = 'Habituales (4-6)';
                break;
            case 'leales':
                whereCondition = 'order_count >= 7';
                segmentName = 'Leales (7+)';
                break;
        }
        
        // Query para obtener los clientes del segmento específico
        const [customers] = await connection.query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.correo,
                customer_stats.order_count,
                customer_stats.total_spent,
                customer_stats.avg_order_value,
                customer_stats.first_order_date,
                customer_stats.last_order_date
            FROM (
                SELECT 
                    p.id_usuario,
                    COUNT(p.id_pedido) as order_count,
                    SUM(p.total) as total_spent,
                    AVG(p.total) as avg_order_value,
                    MIN(p.fecha_pedido) as first_order_date,
                    MAX(p.fecha_pedido) as last_order_date
                FROM pedidos p
                WHERE p.id_usuario IS NOT NULL
                GROUP BY p.id_usuario
                HAVING ${whereCondition}
            ) as customer_stats
            JOIN usuarios u ON customer_stats.id_usuario = u.id_usuario
            ORDER BY customer_stats.total_spent DESC
            LIMIT 100
        `);
        
        connection.release();
        
        // Formatear los resultados
        const formattedCustomers = customers.map(customer => ({
            id: customer.id_usuario,
            nombre: customer.nombre,
            correo: customer.correo,
            totalPedidos: parseInt(customer.order_count),
            totalGastado: parseFloat(customer.total_spent).toFixed(2),
            valorPromedioPedido: parseFloat(customer.avg_order_value).toFixed(2),
            primerPedido: customer.first_order_date,
            ultimoPedido: customer.last_order_date
        }));
        
        res.status(200).json({
            message: `Detalles del segmento ${segmentName} obtenidos exitosamente`,
            segment: segmentName,
            totalCustomers: formattedCustomers.length,
            customers: formattedCustomers
        });
        
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('Error al obtener detalles del segmento:', error);
        res.status(500).json({
            message: 'Error al obtener detalles del segmento',
            error: error.message
        });
    }
};

// Función para obtener estadísticas adicionales de segmentación
exports.getSegmentationStats = async (req, res) => {
    let connection;
    
    try {
        connection = await pool.promise().getConnection();
        
        // Query para obtener estadísticas adicionales
        const [stats] = await connection.query(`
            SELECT 
                COUNT(DISTINCT id_usuario) as total_customers,
                AVG(order_count) as avg_orders_per_customer,
                AVG(total_spent) as avg_spent_per_customer,
                SUM(total_spent) as total_revenue,
                MIN(total_spent) as min_customer_value,
                MAX(total_spent) as max_customer_value
            FROM (
                SELECT 
                    p.id_usuario,
                    COUNT(p.id_pedido) as order_count,
                    SUM(p.total) as total_spent
                FROM pedidos p
                WHERE p.id_usuario IS NOT NULL
                GROUP BY p.id_usuario
            ) as customer_stats
        `);
        
        // Query para obtener la distribución de pedidos por período
        const [monthlyTrend] = await connection.query(`
            SELECT 
                DATE_FORMAT(fecha_pedido, '%Y-%m') as month,
                COUNT(DISTINCT id_usuario) as unique_customers,
                COUNT(id_pedido) as total_orders
            FROM pedidos 
            WHERE id_usuario IS NOT NULL
            AND fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
            ORDER BY month
        `);
        
        connection.release();
        
        res.status(200).json({
            message: "Estadísticas de segmentación obtenidas exitosamente",
            generalStats: {
                totalCustomers: parseInt(stats[0].total_customers),
                avgOrdersPerCustomer: parseFloat(stats[0].avg_orders_per_customer).toFixed(2),
                avgSpentPerCustomer: parseFloat(stats[0].avg_spent_per_customer).toFixed(2),
                totalRevenue: parseFloat(stats[0].total_revenue).toFixed(2),
                minCustomerValue: parseFloat(stats[0].min_customer_value).toFixed(2),
                maxCustomerValue: parseFloat(stats[0].max_customer_value).toFixed(2)
            },
            monthlyTrend: monthlyTrend.map(trend => ({
                month: trend.month,
                uniqueCustomers: parseInt(trend.unique_customers),
                totalOrders: parseInt(trend.total_orders)
            }))
        });
        
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('Error al obtener estadísticas de segmentación:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de segmentación',
            error: error.message
        });
    }
};
