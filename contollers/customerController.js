const pool = require('../config/db');

// Function to calculate growth percentage
function calculateGrowth(current, previous) {
    if (previous === 0) {
        return current > 0 ? '+100.00%' : '0.00%';
    }
    const growth = ((current - previous) / previous) * 100;
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(2)}%`;
}

// Function to get total unique customers served with date filtering and global spending data
exports.getUniqueCustomersServed = async (req, res) => {
    try {
        const { period } = req.query; // 'today', 'week', 'month'
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
            default:
                whereClause = '';
                periodName = 'todos los tiempos';
        }
        
        // CLIENTES ÚNICOS ATENDIDOS CON FILTRO DE PERÍODO
        const [uniqueCustomersFiltered] = await connection.query(`
            SELECT COUNT(DISTINCT p.id_usuario) as unique_customers
            FROM pedidos p
            ${whereClause}
        `);
        
        // CLIENTES ÚNICOS TOTALES (SIN FILTRO)
        const [totalUniqueCustomers] = await connection.query(`
            SELECT COUNT(DISTINCT p.id_usuario) as total_unique_customers
            FROM pedidos p
        `);
        
        // GASTOS GLOBALES DE TODOS LOS CLIENTES (SIN FILTRO)
        const [globalSpending] = await connection.query(`
            SELECT 
                SUM(p.total) as total_global_spending,
                AVG(p.total) as avg_order_value,
                COUNT(p.id_pedido) as total_orders,
                MIN(p.fecha_pedido) as first_order_date,
                MAX(p.fecha_pedido) as latest_order_date
            FROM pedidos p
        `);
        
        // ESTADÍSTICAS ADICIONALES POR PERÍODO (SI SE APLICA FILTRO)
        let periodStats = null;
        if (period) {
            const [periodSpending] = await connection.query(`
                SELECT 
                    SUM(p.total) as period_spending,
                    AVG(p.total) as period_avg_order_value,
                    COUNT(p.id_pedido) as period_orders,
                    MIN(p.fecha_pedido) as period_first_order,
                    MAX(p.fecha_pedido) as period_latest_order
                FROM pedidos p
                ${whereClause}
            `);
            
            periodStats = {
                totalSpending: parseFloat(periodSpending[0].period_spending || 0).toFixed(2),
                avgOrderValue: parseFloat(periodSpending[0].period_avg_order_value || 0).toFixed(2),
                totalOrders: parseInt(periodSpending[0].period_orders || 0),
                firstOrderDate: periodSpending[0].period_first_order,
                latestOrderDate: periodSpending[0].period_latest_order,
                avgSpendingPerCustomer: uniqueCustomersFiltered[0].unique_customers > 0 
                    ? parseFloat((periodSpending[0].period_spending || 0) / uniqueCustomersFiltered[0].unique_customers).toFixed(2)
                    : '0.00'
            };
        }
          // TOP 10 CLIENTES CON MAYOR GASTO (GLOBAL)
        const [topSpendingCustomers] = await connection.query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.correo,
                SUM(p.total) as total_spent,
                COUNT(p.id_pedido) as total_orders,
                AVG(p.total) as avg_order_value,
                MIN(p.fecha_pedido) as first_order_date,
                MAX(p.fecha_pedido) as latest_order_date
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            GROUP BY u.id_usuario, u.nombre, u.correo
            ORDER BY total_spent DESC
            LIMIT 10
        `);
        
        // DISTRIBUCIÓN DE CLIENTES POR FRECUENCIA DE PEDIDOS
        const [customerFrequencyDistribution] = await connection.query(`
            SELECT 
                order_count_range,
                customer_count,
                percentage
            FROM (
                SELECT 
                    CASE 
                        WHEN order_count = 1 THEN '1 pedido'
                        WHEN order_count BETWEEN 2 AND 5 THEN '2-5 pedidos'
                        WHEN order_count BETWEEN 6 AND 10 THEN '6-10 pedidos'
                        WHEN order_count BETWEEN 11 AND 20 THEN '11-20 pedidos'
                        ELSE '20+ pedidos'
                    END as order_count_range,
                    COUNT(*) as customer_count,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as percentage
                FROM (
                    SELECT 
                        id_usuario,
                        COUNT(id_pedido) as order_count
                    FROM pedidos
                    GROUP BY id_usuario
                ) as customer_orders
                GROUP BY 
                    CASE 
                        WHEN order_count = 1 THEN '1 pedido'
                        WHEN order_count BETWEEN 2 AND 5 THEN '2-5 pedidos'
                        WHEN order_count BETWEEN 6 AND 10 THEN '6-10 pedidos'
                        WHEN order_count BETWEEN 11 AND 20 THEN '11-20 pedidos'
                        ELSE '20+ pedidos'
                    END
                ORDER BY 
                    CASE 
                        WHEN order_count_range = '1 pedido' THEN 1
                        WHEN order_count_range = '2-5 pedidos' THEN 2
                        WHEN order_count_range = '6-10 pedidos' THEN 3
                        WHEN order_count_range = '11-20 pedidos' THEN 4
                        ELSE 5
                    END
            ) as distribution
        `);
        
        // Liberar la conexión
        connection.release();
          // Formatear top clientes
        const formattedTopCustomers = topSpendingCustomers.map((customer, index) => ({
            rank: index + 1,
            customerId: customer.id_usuario,
            customerName: customer.nombre,
            email: customer.correo,
            totalSpent: parseFloat(customer.total_spent).toFixed(2),
            totalOrders: parseInt(customer.total_orders),
            avgOrderValue: parseFloat(customer.avg_order_value).toFixed(2),
            firstOrderDate: customer.first_order_date,
            latestOrderDate: customer.latest_order_date
        }));
        
        // Formatear distribución de frecuencia
        const formattedFrequencyDistribution = customerFrequencyDistribution.map(item => ({
            range: item.order_count_range,
            customerCount: parseInt(item.customer_count),
            percentage: parseFloat(item.percentage)
        }));
        
        // Preparar respuesta
        const response = {
            message: `Clientes únicos ${period ? `(${periodName})` : ''} y estadísticas globales obtenidos exitosamente`,
            uniqueCustomers: {
                filtered: {
                    count: parseInt(uniqueCustomersFiltered[0].unique_customers),
                    period: periodName
                },
                total: {
                    count: parseInt(totalUniqueCustomers[0].total_unique_customers),
                    period: 'todos los tiempos'
                }
            },
            globalSpending: {
                totalSpending: parseFloat(globalSpending[0].total_global_spending || 0).toFixed(2),
                avgOrderValue: parseFloat(globalSpending[0].avg_order_value || 0).toFixed(2),
                totalOrders: parseInt(globalSpending[0].total_orders || 0),
                firstOrderDate: globalSpending[0].first_order_date,
                latestOrderDate: globalSpending[0].latest_order_date,
                avgSpendingPerCustomer: totalUniqueCustomers[0].total_unique_customers > 0 
                    ? parseFloat((globalSpending[0].total_global_spending || 0) / totalUniqueCustomers[0].total_unique_customers).toFixed(2)
                    : '0.00'
            },
            topSpendingCustomers: formattedTopCustomers,
            customerFrequencyDistribution: formattedFrequencyDistribution
        };
        
        // Agregar estadísticas del período si se aplicó filtro
        if (periodStats) {
            response.periodStats = periodStats;
        }
        
        // Devolver resultados
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error al obtener clientes únicos y estadísticas:', error);
        res.status(500).json({
            message: 'Error al obtener clientes únicos y estadísticas',
            error: error.message
        });
    }
};

// Function to get customer growth trends with time-based analysis  
exports.getCustomerGrowthTrends = async (req, res) => {
    try {
        const { timeframe = 'monthly' } = req.query; // 'daily', 'weekly', 'monthly'
        const connection = await pool.promise().getConnection();
        
        let dateFormat, dateGroup, timeRange;
        let trendName = '';
        
        switch (timeframe) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                dateGroup = 'DATE(MIN(p.fecha_pedido))';
                timeRange = 'WHERE DATE(MIN(p.fecha_pedido)) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                trendName = 'últimos 30 días';
                break;
            case 'weekly':
                dateFormat = '%Y-W%u';
                dateGroup = 'YEARWEEK(MIN(p.fecha_pedido), 1)';
                timeRange = 'WHERE YEARWEEK(MIN(p.fecha_pedido), 1) >= YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 12 WEEK), 1)';
                trendName = 'últimas 12 semanas';
                break;
            case 'monthly':
            default:
                dateFormat = '%Y-%m';
                dateGroup = 'DATE_FORMAT(MIN(p.fecha_pedido), "%Y-%m")';
                timeRange = 'WHERE DATE(MIN(p.fecha_pedido)) >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)';
                trendName = 'últimos 12 meses';
                break;
        }
        
        // NUEVOS CLIENTES POR PERÍODO
        const [newCustomers] = await connection.query(`
            SELECT 
                ${dateGroup} as period,
                DATE_FORMAT(MIN(p.fecha_pedido), '${dateFormat}') as period_formatted,
                COUNT(*) as new_customers,
                SUM(COUNT(*)) OVER (ORDER BY ${dateGroup}) as cumulative_customers
            FROM (
                SELECT 
                    p.id_usuario,
                    MIN(p.fecha_pedido) as first_order_date
                FROM pedidos p
                GROUP BY p.id_usuario
            ) as first_orders
            JOIN pedidos p ON first_orders.id_usuario = p.id_usuario 
                AND DATE(p.fecha_pedido) = DATE(first_orders.first_order_date)
            ${timeRange}
            GROUP BY ${dateGroup}
            ORDER BY period
        `);
        
        // CLIENTES ACTIVOS POR PERÍODO (QUE HICIERON PEDIDOS)
        const [activeCustomers] = await connection.query(`
            SELECT 
                ${dateGroup} as period,
                DATE_FORMAT(p.fecha_pedido, '${dateFormat}') as period_formatted,
                COUNT(DISTINCT p.id_usuario) as active_customers
            FROM pedidos p
            ${timeRange.replace('MIN(p.fecha_pedido)', 'p.fecha_pedido')}
            GROUP BY ${dateGroup}
            ORDER BY period
        `);
        
        connection.release();
        
        // Formatear resultados
        const formattedNewCustomers = newCustomers.map(item => ({
            period: item.period_formatted,
            newCustomers: parseInt(item.new_customers),
            cumulativeCustomers: parseInt(item.cumulative_customers)
        }));
        
        const formattedActiveCustomers = activeCustomers.map(item => ({
            period: item.period_formatted,
            activeCustomers: parseInt(item.active_customers)
        }));
        
        res.status(200).json({
            message: `Tendencias de crecimiento de clientes (${trendName}) obtenidas exitosamente`,
            timeframe: timeframe,
            period: trendName,
            data: {
                newCustomersGrowth: formattedNewCustomers,
                activeCustomersActivity: formattedActiveCustomers
            },
            summary: {
                totalNewCustomersInPeriod: formattedNewCustomers.reduce((sum, item) => sum + item.newCustomers, 0),
                avgNewCustomersPerPeriod: formattedNewCustomers.length > 0 
                    ? (formattedNewCustomers.reduce((sum, item) => sum + item.newCustomers, 0) / formattedNewCustomers.length).toFixed(2) 
                    : '0.00',
                peakPeriod: formattedNewCustomers.length > 0 
                    ? formattedNewCustomers.reduce((max, item) => item.newCustomers > max.newCustomers ? item : max) 
                    : null
            }
        });
        
    } catch (error) {
        console.error('Error al obtener tendencias de crecimiento de clientes:', error);
        res.status(500).json({
            message: 'Error al obtener tendencias de crecimiento de clientes',
            error: error.message
        });
    }
};

// Function to get customer retention metrics
exports.getCustomerRetentionMetrics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // MÉTRICAS DE RETENCIÓN DE CLIENTES
        // Clientes que han hecho más de 1 pedido vs clientes de 1 solo pedido
        const [retentionStats] = await connection.query(`
            SELECT 
                SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) as one_time_customers,
                SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) as repeat_customers,
                COUNT(*) as total_customers,
                ROUND(
                    (SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                    2
                ) as retention_rate,
                AVG(order_count) as avg_orders_per_customer,
                MAX(order_count) as max_orders_by_customer
            FROM (
                SELECT 
                    id_usuario,
                    COUNT(id_pedido) as order_count
                FROM pedidos
                GROUP BY id_usuario
            ) as customer_orders
        `);
        
        // ANÁLISIS POR COHORTES (CLIENTES QUE REGRESAN POR MES)
        const [cohortAnalysis] = await connection.query(`
            SELECT 
                DATE_FORMAT(first_order_month, '%Y-%m') as cohort_month,
                COUNT(*) as customers_in_cohort,
                SUM(CASE WHEN months_since_first = 0 THEN 1 ELSE 0 END) as month_0,
                SUM(CASE WHEN months_since_first = 1 THEN 1 ELSE 0 END) as month_1,
                SUM(CASE WHEN months_since_first = 2 THEN 1 ELSE 0 END) as month_2,
                SUM(CASE WHEN months_since_first = 3 THEN 1 ELSE 0 END) as month_3,
                SUM(CASE WHEN months_since_first >= 4 THEN 1 ELSE 0 END) as month_4_plus
            FROM (
                SELECT 
                    p.id_usuario,
                    DATE_FORMAT(first_orders.first_order_date, '%Y-%m-01') as first_order_month,
                    TIMESTAMPDIFF(MONTH, first_orders.first_order_date, p.fecha_pedido) as months_since_first
                FROM pedidos p
                JOIN (
                    SELECT 
                        id_usuario,
                        MIN(fecha_pedido) as first_order_date
                    FROM pedidos
                    GROUP BY id_usuario
                ) as first_orders ON p.id_usuario = first_orders.id_usuario
                WHERE first_orders.first_order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ) as cohort_data
            GROUP BY first_order_month
            ORDER BY cohort_month DESC
            LIMIT 6
        `);
        
        // TIEMPO PROMEDIO ENTRE PEDIDOS PARA CLIENTES REPETIDOS
        const [timeBetweenOrders] = await connection.query(`
            SELECT 
                AVG(days_between_orders) as avg_days_between_orders,
                MIN(days_between_orders) as min_days_between_orders,
                MAX(days_between_orders) as max_days_between_orders,
                COUNT(*) as total_repeat_order_instances
            FROM (
                SELECT 
                    p1.id_usuario,
                    DATEDIFF(p2.fecha_pedido, p1.fecha_pedido) as days_between_orders
                FROM pedidos p1
                JOIN pedidos p2 ON p1.id_usuario = p2.id_usuario 
                    AND p2.fecha_pedido > p1.fecha_pedido
                WHERE p1.id_usuario IN (
                    SELECT id_usuario 
                    FROM pedidos 
                    GROUP BY id_usuario 
                    HAVING COUNT(*) > 1
                )
            ) as order_gaps
            WHERE days_between_orders > 0
        `);
        
        connection.release();
        
        // Formatear métricas de retención
        const retention = retentionStats[0];
        const retentionMetrics = {
            oneTimeCustomers: parseInt(retention.one_time_customers || 0),
            repeatCustomers: parseInt(retention.repeat_customers || 0),
            totalCustomers: parseInt(retention.total_customers || 0),
            retentionRate: parseFloat(retention.retention_rate || 0),
            avgOrdersPerCustomer: parseFloat(retention.avg_orders_per_customer || 0).toFixed(2),
            maxOrdersByCustomer: parseInt(retention.max_orders_by_customer || 0)
        };
        
        // Formatear análisis de cohortes
        const formattedCohorts = cohortAnalysis.map(cohort => ({
            cohortMonth: cohort.cohort_month,
            customersInCohort: parseInt(cohort.customers_in_cohort),
            retention: {
                month0: parseInt(cohort.month_0 || 0),
                month1: parseInt(cohort.month_1 || 0),
                month2: parseInt(cohort.month_2 || 0),
                month3: parseInt(cohort.month_3 || 0),
                month4Plus: parseInt(cohort.month_4_plus || 0)
            },
            retentionRates: {
                month1Rate: cohort.customers_in_cohort > 0 ? ((cohort.month_1 || 0) / cohort.customers_in_cohort * 100).toFixed(2) : '0.00',
                month2Rate: cohort.customers_in_cohort > 0 ? ((cohort.month_2 || 0) / cohort.customers_in_cohort * 100).toFixed(2) : '0.00',
                month3Rate: cohort.customers_in_cohort > 0 ? ((cohort.month_3 || 0) / cohort.customers_in_cohort * 100).toFixed(2) : '0.00'
            }
        }));
        
        // Formatear tiempo entre pedidos
        const timeBetween = timeBetweenOrders[0] || {};
        const avgTimeBetweenOrders = {
            avgDays: parseFloat(timeBetween.avg_days_between_orders || 0).toFixed(1),
            minDays: parseInt(timeBetween.min_days_between_orders || 0),
            maxDays: parseInt(timeBetween.max_days_between_orders || 0),
            totalInstances: parseInt(timeBetween.total_repeat_order_instances || 0)
        };
        
        res.status(200).json({
            message: 'Métricas de retención de clientes obtenidas exitosamente',
            retentionMetrics: retentionMetrics,
            cohortAnalysis: formattedCohorts,
            timeBetweenOrders: avgTimeBetweenOrders,
            insights: {
                customerLoyalty: retentionMetrics.retentionRate >= 30 ? 'Alta' : retentionMetrics.retentionRate >= 15 ? 'Media' : 'Baja',
                avgReorderFrequency: `${avgTimeBetweenOrders.avgDays} días`,
                loyaltySegment: `${retentionMetrics.repeatCustomers} clientes fieles de ${retentionMetrics.totalCustomers} totales`
            }
        });
        
    } catch (error) {
        console.error('Error al obtener métricas de retención:', error);
        res.status(500).json({
            message: 'Error al obtener métricas de retención',
            error: error.message
        });
    }
};

// Function to get customer lifetime value analysis
exports.getCustomerLifetimeValue = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ANÁLISIS DE VALOR DE VIDA DEL CLIENTE (CLV)
        const [clvAnalysis] = await connection.query(`
            SELECT 
                customer_stats.*,
                ROUND(
                    (total_spent / GREATEST(order_count, 1)) * 
                    GREATEST(365.0 / GREATEST(customer_lifespan_days, 1), 1), 
                    2
                ) as estimated_clv,
                CASE 
                    WHEN total_spent >= 1000 THEN 'Premium'
                    WHEN total_spent >= 500 THEN 'High Value'
                    WHEN total_spent >= 200 THEN 'Medium Value'
                    ELSE 'Low Value'
                END as customer_segment
            FROM (                SELECT 
                    p.id_usuario,
                    u.nombre,
                    u.correo,
                    COUNT(p.id_pedido) as order_count,
                    SUM(p.total) as total_spent,
                    AVG(p.total) as avg_order_value,
                    MIN(p.fecha_pedido) as first_order_date,
                    MAX(p.fecha_pedido) as last_order_date,
                    DATEDIFF(MAX(p.fecha_pedido), MIN(p.fecha_pedido)) + 1 as customer_lifespan_days,
                    DATEDIFF(CURDATE(), MAX(p.fecha_pedido)) as days_since_last_order
                FROM pedidos p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                GROUP BY p.id_usuario, u.nombre, u.correo
            ) as customer_stats
            ORDER BY estimated_clv DESC
        `);
        
        // SEGMENTACIÓN POR VALOR DE VIDA
        const [clvSegmentation] = await connection.query(`
            SELECT 
                customer_segment,
                COUNT(*) as customer_count,
                AVG(total_spent) as avg_spending,
                AVG(order_count) as avg_orders,
                AVG(estimated_clv) as avg_clv,
                SUM(total_spent) as segment_total_revenue,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as segment_percentage
            FROM (
                SELECT 
                    p.id_usuario,
                    COUNT(p.id_pedido) as order_count,
                    SUM(p.total) as total_spent,
                    ROUND(
                        (SUM(p.total) / GREATEST(COUNT(p.id_pedido), 1)) * 
                        GREATEST(365.0 / GREATEST(DATEDIFF(MAX(p.fecha_pedido), MIN(p.fecha_pedido)) + 1, 1), 1), 
                        2
                    ) as estimated_clv,
                    CASE 
                        WHEN SUM(p.total) >= 1000 THEN 'Premium'
                        WHEN SUM(p.total) >= 500 THEN 'High Value'
                        WHEN SUM(p.total) >= 200 THEN 'Medium Value'
                        ELSE 'Low Value'
                    END as customer_segment
                FROM pedidos p
                GROUP BY p.id_usuario
            ) as customer_segments
            GROUP BY customer_segment
            ORDER BY avg_clv DESC
        `);
          // CLIENTES EN RIESGO (NO HAN PEDIDO EN MUCHO TIEMPO)
        const [customersAtRisk] = await connection.query(`
            SELECT 
                p.id_usuario,
                u.nombre,
                u.correo,
                SUM(p.total) as total_spent,
                COUNT(p.id_pedido) as order_count,
                MAX(p.fecha_pedido) as last_order_date,
                DATEDIFF(CURDATE(), MAX(p.fecha_pedido)) as days_since_last_order
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            GROUP BY p.id_usuario, u.nombre, u.correo
            HAVING days_since_last_order > 60 AND total_spent > 100
            ORDER BY total_spent DESC, days_since_last_order DESC
            LIMIT 20
        `);
        
        connection.release();
        
        // Formatear análisis CLV
        const formattedClvAnalysis = clvAnalysis.slice(0, 50).map((customer, index) => ({            rank: index + 1,
            customerId: customer.id_usuario,
            customerName: customer.nombre,
            email: customer.correo,
            orderCount: parseInt(customer.order_count),
            totalSpent: parseFloat(customer.total_spent).toFixed(2),
            avgOrderValue: parseFloat(customer.avg_order_value).toFixed(2),
            firstOrderDate: customer.first_order_date,
            lastOrderDate: customer.last_order_date,
            customerLifespanDays: parseInt(customer.customer_lifespan_days),
            daysSinceLastOrder: parseInt(customer.days_since_last_order),
            estimatedCLV: parseFloat(customer.estimated_clv).toFixed(2),
            customerSegment: customer.customer_segment
        }));
        
        // Formatear segmentación
        const formattedSegmentation = clvSegmentation.map(segment => ({
            segment: segment.customer_segment,
            customerCount: parseInt(segment.customer_count),
            avgSpending: parseFloat(segment.avg_spending).toFixed(2),
            avgOrders: parseFloat(segment.avg_orders).toFixed(1),
            avgCLV: parseFloat(segment.avg_clv).toFixed(2),
            totalRevenue: parseFloat(segment.segment_total_revenue).toFixed(2),
            segmentPercentage: parseFloat(segment.segment_percentage)
        }));
        
        // Formatear clientes en riesgo
        const formattedCustomersAtRisk = customersAtRisk.map((customer, index) => ({            rank: index + 1,
            customerId: customer.id_usuario,
            customerName: customer.nombre,
            email: customer.correo,
            totalSpent: parseFloat(customer.total_spent).toFixed(2),
            orderCount: parseInt(customer.order_count),
            lastOrderDate: customer.last_order_date,
            daysSinceLastOrder: parseInt(customer.days_since_last_order),
            riskLevel: customer.days_since_last_order > 120 ? 'Alto' : customer.days_since_last_order > 90 ? 'Medio' : 'Bajo'
        }));
        
        res.status(200).json({
            message: 'Análisis de valor de vida del cliente obtenido exitosamente',
            clvAnalysis: {
                topCustomers: formattedClvAnalysis,
                segmentation: formattedSegmentation,
                customersAtRisk: formattedCustomersAtRisk
            },
            summary: {
                totalCustomersAnalyzed: formattedClvAnalysis.length,
                highestCLV: formattedClvAnalysis.length > 0 ? formattedClvAnalysis[0].estimatedCLV : '0.00',
                customersAtRiskCount: formattedCustomersAtRisk.length,
                premiumCustomersCount: formattedSegmentation.find(s => s.segment === 'Premium')?.customerCount || 0
            }
        });
        
    } catch (error) {
        console.error('Error al obtener análisis de valor de vida del cliente:', error);
        res.status(500).json({
            message: 'Error al obtener análisis de valor de vida del cliente',
            error: error.message
        });
    }
};

// Function to get customer demographics and preferences
exports.getCustomerDemographicsAndPreferences = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // ANÁLISIS DE PREFERENCIAS DE PRODUCTOS
        const [productPreferences] = await connection.query(`
            SELECT 
                pr.titulo as product_name,
                COUNT(DISTINCT p.id_usuario) as unique_customers,
                SUM(dp.cantidad) as total_units_sold,
                SUM(dp.cantidad * dp.precio_unitario) as total_revenue,
                ROUND(AVG(dp.precio_unitario), 2) as avg_price
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            GROUP BY dp.id_producto, pr.titulo
            ORDER BY unique_customers DESC, total_revenue DESC
            LIMIT 15
        `);
        
        // ANÁLISIS DE PATRONES DE PEDIDO POR DÍA DE LA SEMANA
        const [dayOfWeekPattern] = await connection.query(`
            SELECT 
                DAYOFWEEK(fecha_pedido) as day_number,
                CASE DAYOFWEEK(fecha_pedido)
                    WHEN 1 THEN 'Domingo'
                    WHEN 2 THEN 'Lunes'
                    WHEN 3 THEN 'Martes'
                    WHEN 4 THEN 'Miércoles'
                    WHEN 5 THEN 'Jueves'
                    WHEN 6 THEN 'Viernes'
                    WHEN 7 THEN 'Sábado'
                END as day_name,
                COUNT(*) as order_count,
                COUNT(DISTINCT id_usuario) as unique_customers,
                AVG(total) as avg_order_value,
                SUM(total) as total_revenue
            FROM pedidos
            GROUP BY DAYOFWEEK(fecha_pedido), day_name
            ORDER BY day_number
        `);
        
        // ANÁLISIS DE HORARIOS DE PEDIDO
        const [hourlyPattern] = await connection.query(`
            SELECT 
                HOUR(fecha_pedido) as hour_of_day,
                COUNT(*) as order_count,
                COUNT(DISTINCT id_usuario) as unique_customers,
                AVG(total) as avg_order_value
            FROM pedidos
            GROUP BY HOUR(fecha_pedido)
            ORDER BY hour_of_day
        `);
        
        // ANÁLISIS DE MÉTODOS DE PAGO PREFERIDOS
        const [paymentMethods] = await connection.query(`
            SELECT 
                metodo_pago,
                COUNT(*) as order_count,
                COUNT(DISTINCT id_usuario) as unique_customers,
                SUM(total) as total_revenue,
                AVG(total) as avg_order_value,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pedidos)), 2) as percentage
            FROM pedidos
            WHERE metodo_pago IS NOT NULL
            GROUP BY metodo_pago
            ORDER BY order_count DESC
        `);
        
        // ANÁLISIS DE TAMAÑO DE PEDIDO PROMEDIO POR CLIENTE
        const [orderSizeDistribution] = await connection.query(`
            SELECT 
                order_size_range,
                customer_count,
                percentage,
                avg_order_value
            FROM (
                SELECT 
                    CASE 
                        WHEN avg_order_value < 50 THEN 'Pequeño ($0-$49)'
                        WHEN avg_order_value < 100 THEN 'Mediano ($50-$99)'
                        WHEN avg_order_value < 200 THEN 'Grande ($100-$199)'
                        ELSE 'Extra Grande ($200+)'
                    END as order_size_range,
                    COUNT(*) as customer_count,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as percentage,
                    AVG(avg_order_value) as avg_order_value
                FROM (
                    SELECT 
                        id_usuario,
                        AVG(total) as avg_order_value
                    FROM pedidos
                    GROUP BY id_usuario
                ) as customer_avg_orders
                GROUP BY order_size_range
                ORDER BY 
                    CASE order_size_range
                        WHEN 'Pequeño ($0-$49)' THEN 1
                        WHEN 'Mediano ($50-$99)' THEN 2
                        WHEN 'Grande ($100-$199)' THEN 3
                        ELSE 4
                    END
            ) as size_distribution
        `);
        
        connection.release();
        
        // Formatear preferencias de productos
        const formattedProductPreferences = productPreferences.map((product, index) => ({
            rank: index + 1,
            productName: product.product_name,
            uniqueCustomers: parseInt(product.unique_customers),
            totalUnitsSold: parseInt(product.total_units_sold),
            totalRevenue: parseFloat(product.total_revenue).toFixed(2),
            avgPrice: parseFloat(product.avg_price).toFixed(2)
        }));
        
        // Formatear patrones por día de la semana
        const formattedDayOfWeekPattern = dayOfWeekPattern.map(day => ({
            dayNumber: parseInt(day.day_number),
            dayName: day.day_name,
            orderCount: parseInt(day.order_count),
            uniqueCustomers: parseInt(day.unique_customers),
            avgOrderValue: parseFloat(day.avg_order_value).toFixed(2),
            totalRevenue: parseFloat(day.total_revenue).toFixed(2)
        }));
        
        // Formatear patrones por hora
        const formattedHourlyPattern = hourlyPattern.map(hour => ({
            hour: parseInt(hour.hour_of_day),
            orderCount: parseInt(hour.order_count),
            uniqueCustomers: parseInt(hour.unique_customers),
            avgOrderValue: parseFloat(hour.avg_order_value).toFixed(2)
        }));
        
        // Formatear métodos de pago
        const formattedPaymentMethods = paymentMethods.map(method => ({
            paymentMethod: method.metodo_pago,
            orderCount: parseInt(method.order_count),
            uniqueCustomers: parseInt(method.unique_customers),
            totalRevenue: parseFloat(method.total_revenue).toFixed(2),
            avgOrderValue: parseFloat(method.avg_order_value).toFixed(2),
            percentage: parseFloat(method.percentage)
        }));
        
        // Formatear distribución de tamaño de pedido
        const formattedOrderSizeDistribution = orderSizeDistribution.map(size => ({
            orderSizeRange: size.order_size_range,
            customerCount: parseInt(size.customer_count),
            percentage: parseFloat(size.percentage),
            avgOrderValue: parseFloat(size.avg_order_value).toFixed(2)
        }));
        
        res.status(200).json({
            message: 'Análisis demográfico y de preferencias de clientes obtenido exitosamente',
            demographics: {
                productPreferences: formattedProductPreferences,
                dayOfWeekPatterns: formattedDayOfWeekPattern,
                hourlyPatterns: formattedHourlyPattern,
                paymentMethodPreferences: formattedPaymentMethods,
                orderSizeDistribution: formattedOrderSizeDistribution
            },
            insights: {
                mostPopularProduct: formattedProductPreferences[0]?.productName || 'N/A',
                busiestDay: formattedDayOfWeekPattern.reduce((max, day) => 
                    day.orderCount > max.orderCount ? day : max, formattedDayOfWeekPattern[0])?.dayName || 'N/A',
                peakHour: formattedHourlyPattern.reduce((max, hour) => 
                    hour.orderCount > max.orderCount ? hour : max, formattedHourlyPattern[0])?.hour || 0,
                preferredPaymentMethod: formattedPaymentMethods[0]?.paymentMethod || 'N/A',
                dominantOrderSize: formattedOrderSizeDistribution.reduce((max, size) => 
                    size.customerCount > max.customerCount ? size : max, formattedOrderSizeDistribution[0])?.orderSizeRange || 'N/A'
            }
        });
        
    } catch (error) {
        console.error('Error al obtener análisis demográfico y de preferencias:', error);
        res.status(500).json({
            message: 'Error al obtener análisis demográfico y de preferencias',
            error: error.message
        });
    }
};

// Function to get customer satisfaction metrics (based on order patterns)
exports.getCustomerSatisfactionMetrics = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        // MÉTRICAS DE SATISFACCIÓN BASADAS EN COMPORTAMIENTO
        // Análisis de frecuencia de recompra como indicador de satisfacción
        const [satisfactionIndicators] = await connection.query(`
            SELECT 
                'Clientes muy satisfechos (4+ pedidos)' as satisfaction_level,
                COUNT(*) as customer_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as percentage,
                AVG(total_spent) as avg_spending,
                AVG(order_count) as avg_orders
            FROM (
                SELECT 
                    id_usuario,
                    COUNT(*) as order_count,
                    SUM(total) as total_spent
                FROM pedidos
                GROUP BY id_usuario
                HAVING order_count >= 4
            ) as highly_satisfied
            
            UNION ALL
            
            SELECT 
                'Clientes satisfechos (2-3 pedidos)' as satisfaction_level,
                COUNT(*) as customer_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as percentage,
                AVG(total_spent) as avg_spending,
                AVG(order_count) as avg_orders
            FROM (
                SELECT 
                    id_usuario,
                    COUNT(*) as order_count,
                    SUM(total) as total_spent
                FROM pedidos
                GROUP BY id_usuario
                HAVING order_count BETWEEN 2 AND 3
            ) as satisfied
            
            UNION ALL
            
            SELECT 
                'Clientes nuevos/indecisos (1 pedido)' as satisfaction_level,
                COUNT(*) as customer_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT id_usuario) FROM pedidos)), 2) as percentage,
                AVG(total_spent) as avg_spending,
                AVG(order_count) as avg_orders
            FROM (
                SELECT 
                    id_usuario,
                    COUNT(*) as order_count,
                    SUM(total) as total_spent
                FROM pedidos
                GROUP BY id_usuario
                HAVING order_count = 1
            ) as new_customers
        `);
        
        // ANÁLISIS DE TIEMPO DE RECOMPRA (INDICADOR DE LEALTAD)
        const [repurchaseAnalysis] = await connection.query(`
            SELECT 
                CASE 
                    WHEN avg_days_between_orders <= 14 THEN 'Muy leal (≤ 14 días)'
                    WHEN avg_days_between_orders <= 30 THEN 'Leal (15-30 días)'
                    WHEN avg_days_between_orders <= 60 THEN 'Moderadamente leal (31-60 días)'
                    ELSE 'Poco leal (> 60 días)'
                END as loyalty_level,
                COUNT(*) as customer_count,
                AVG(avg_days_between_orders) as avg_repurchase_days,
                AVG(total_orders) as avg_total_orders,
                AVG(total_spent) as avg_total_spent
            FROM (
                SELECT 
                    customer_orders.id_usuario,
                    AVG(order_gaps.days_between_orders) as avg_days_between_orders,
                    customer_orders.total_orders,
                    customer_orders.total_spent
                FROM (
                    SELECT 
                        id_usuario,
                        COUNT(*) as total_orders,
                        SUM(total) as total_spent
                    FROM pedidos
                    GROUP BY id_usuario
                    HAVING total_orders > 1
                ) as customer_orders
                JOIN (
                    SELECT 
                        p1.id_usuario,
                        DATEDIFF(p2.fecha_pedido, p1.fecha_pedido) as days_between_orders
                    FROM pedidos p1
                    JOIN pedidos p2 ON p1.id_usuario = p2.id_usuario 
                        AND p2.fecha_pedido > p1.fecha_pedido
                ) as order_gaps ON customer_orders.id_usuario = order_gaps.id_usuario
                GROUP BY customer_orders.id_usuario, customer_orders.total_orders, customer_orders.total_spent
            ) as customer_loyalty
            GROUP BY loyalty_level
            ORDER BY 
                CASE loyalty_level
                    WHEN 'Muy leal (≤ 14 días)' THEN 1
                    WHEN 'Leal (15-30 días)' THEN 2
                    WHEN 'Moderadamente leal (31-60 días)' THEN 3
                    ELSE 4
                END
        `);
        
        // ANÁLISIS DE CRECIMIENTO EN VALOR DE PEDIDO (INDICADOR DE SATISFACCIÓN)
        const [orderValueTrend] = await connection.query(`
            SELECT 
                id_usuario,
                first_order_value,
                latest_order_value,
                ROUND(
                    CASE 
                        WHEN first_order_value > 0 THEN 
                            ((latest_order_value - first_order_value) / first_order_value) * 100
                        ELSE 0 
                    END, 
                    2
                ) as order_value_growth_percentage,
                total_orders
            FROM (
                SELECT 
                    p.id_usuario,
                    (SELECT total FROM pedidos WHERE id_usuario = p.id_usuario ORDER BY fecha_pedido ASC LIMIT 1) as first_order_value,
                    (SELECT total FROM pedidos WHERE id_usuario = p.id_usuario ORDER BY fecha_pedido DESC LIMIT 1) as latest_order_value,
                    COUNT(*) as total_orders
                FROM pedidos p
                GROUP BY p.id_usuario
                HAVING total_orders > 1
            ) as order_trends
            ORDER BY order_value_growth_percentage DESC
            LIMIT 100
        `);
        
        connection.release();
        
        // Formatear indicadores de satisfacción
        const formattedSatisfactionIndicators = satisfactionIndicators.map(indicator => ({
            satisfactionLevel: indicator.satisfaction_level,
            customerCount: parseInt(indicator.customer_count),
            percentage: parseFloat(indicator.percentage),
            avgSpending: parseFloat(indicator.avg_spending || 0).toFixed(2),
            avgOrders: parseFloat(indicator.avg_orders || 0).toFixed(1)
        }));
        
        // Formatear análisis de recompra
        const formattedRepurchaseAnalysis = repurchaseAnalysis.map(level => ({
            loyaltyLevel: level.loyalty_level,
            customerCount: parseInt(level.customer_count),
            avgRepurchaseDays: parseFloat(level.avg_repurchase_days || 0).toFixed(1),
            avgTotalOrders: parseFloat(level.avg_total_orders || 0).toFixed(1),
            avgTotalSpent: parseFloat(level.avg_total_spent || 0).toFixed(2)
        }));
        
        // Formatear tendencia de valor de pedido
        const positiveGrowthCustomers = orderValueTrend.filter(customer => customer.order_value_growth_percentage > 0).length;
        const negativeGrowthCustomers = orderValueTrend.filter(customer => customer.order_value_growth_percentage < 0).length;
        const neutralGrowthCustomers = orderValueTrend.filter(customer => customer.order_value_growth_percentage === 0).length;
        
        const avgGrowthPercentage = orderValueTrend.length > 0 
            ? (orderValueTrend.reduce((sum, customer) => sum + customer.order_value_growth_percentage, 0) / orderValueTrend.length).toFixed(2)
            : '0.00';
        
        // Calcular puntuación general de satisfacción
        const totalCustomers = formattedSatisfactionIndicators.reduce((sum, level) => sum + level.customerCount, 0);
        const satisfactionScore = totalCustomers > 0 
            ? (
                (formattedSatisfactionIndicators.find(l => l.satisfactionLevel.includes('muy satisfechos'))?.customerCount || 0) * 100 +
                (formattedSatisfactionIndicators.find(l => l.satisfactionLevel.includes('satisfechos') && !l.satisfactionLevel.includes('muy'))?.customerCount || 0) * 70 +
                (formattedSatisfactionIndicators.find(l => l.satisfactionLevel.includes('nuevos'))?.customerCount || 0) * 40
            ) / totalCustomers
            : 0;
        
        res.status(200).json({
            message: 'Métricas de satisfacción del cliente obtenidas exitosamente',
            satisfactionMetrics: {
                satisfactionLevels: formattedSatisfactionIndicators,
                loyaltyLevels: formattedRepurchaseAnalysis,
                orderValueGrowth: {
                    positiveGrowthCustomers: positiveGrowthCustomers,
                    negativeGrowthCustomers: negativeGrowthCustomers,
                    neutralGrowthCustomers: neutralGrowthCustomers,
                    avgGrowthPercentage: avgGrowthPercentage
                }
            },
            overallSatisfactionScore: {
                score: parseFloat(satisfactionScore.toFixed(1)),
                rating: satisfactionScore >= 80 ? 'Excelente' : 
                       satisfactionScore >= 60 ? 'Buena' : 
                       satisfactionScore >= 40 ? 'Regular' : 'Necesita mejorar',
                totalCustomersAnalyzed: totalCustomers
            },
            insights: {
                loyalCustomersPercentage: formattedSatisfactionIndicators.find(l => l.satisfactionLevel.includes('muy satisfechos'))?.percentage || 0,
                averageRepurchaseTime: formattedRepurchaseAnalysis.find(l => l.loyaltyLevel.includes('Muy leal'))?.avgRepurchaseDays || 'N/A',
                customerGrowthTrend: parseFloat(avgGrowthPercentage) > 0 ? 'Positiva' : parseFloat(avgGrowthPercentage) < 0 ? 'Negativa' : 'Estable'
            }
        });
        
    } catch (error) {
        console.error('Error al obtener métricas de satisfacción:', error);
        res.status(500).json({
            message: 'Error al obtener métricas de satisfacción',
            error: error.message
        });
    }
};

// Function to get all orders made by a specific user
exports.getUserOrders = async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario requerido' });
    }

    try {
        const connection = await pool.promise().getConnection();
        
        // First, verify if the user exists
        const [userExists] = await connection.query(`
            SELECT id_usuario, nombre, correo FROM usuarios WHERE id_usuario = ?
        `, [userId]);
        
        if (userExists.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Get all orders for the specific user with complete details
        const [orders] = await connection.query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                u.correo AS correo_usuario,
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
        `, [userId]);        // For each order, get product details
        for (const order of orders) {
            const [detalles] = await connection.query(`
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
        
        // Calculate order statistics for this user
        const [orderStats] = await connection.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(total) as total_gastado,
                AVG(total) as promedio_pedido,
                MIN(fecha_pedido) as primer_pedido,
                MAX(fecha_pedido) as ultimo_pedido,
                MIN(total) as pedido_minimo,
                MAX(total) as pedido_maximo
            FROM pedidos 
            WHERE id_usuario = ?
        `, [userId]);
        
        connection.release();
        
        const userInfo = userExists[0];
        const stats = orderStats[0];
        
        res.status(200).json({
            message: 'Pedidos del usuario obtenidos exitosamente',
            usuario: {
                id: userInfo.id_usuario,
                nombre: userInfo.nombre,
                correo: userInfo.correo
            },
            estadisticas: {
                totalPedidos: parseInt(stats.total_pedidos || 0),
                totalGastado: parseFloat(stats.total_gastado || 0).toFixed(2),
                promedioPedido: parseFloat(stats.promedio_pedido || 0).toFixed(2),
                primerPedido: stats.primer_pedido,
                ultimoPedido: stats.ultimo_pedido,
                pedidoMinimo: parseFloat(stats.pedido_minimo || 0).toFixed(2),
                pedidoMaximo: parseFloat(stats.pedido_maximo || 0).toFixed(2)
            },
            pedidos: orders
        });
        
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({ 
            message: 'Error al obtener pedidos del usuario', 
            error: error.message 
        });
    }
};
