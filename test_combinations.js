const pool = require('./config/db');

// Función para probar las combinaciones de productos
async function testProductCombinations() {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        
        console.log('=== DIAGNÓSTICO DE COMBINACIONES DE PRODUCTOS ===\n');
        
        // 1. Verificar datos básicos
        console.log('1. VERIFICANDO DATOS BÁSICOS:');
        
        const [totalPedidos] = await connection.query('SELECT COUNT(*) as total FROM pedidos');
        console.log(`   Total de pedidos: ${totalPedidos[0].total}`);
        
        const [totalDetalles] = await connection.query('SELECT COUNT(*) as total FROM detalle_pedidos');
        console.log(`   Total de detalles de pedidos: ${totalDetalles[0].total}`);
        
        const [totalProductos] = await connection.query('SELECT COUNT(*) as total FROM productos');
        console.log(`   Total de productos: ${totalProductos[0].total}`);
        
        // 2. Verificar pedidos con múltiples productos
        console.log('\n2. ANÁLISIS DE PEDIDOS CON MÚLTIPLES PRODUCTOS:');
        
        const [pedidosMultiples] = await connection.query(`
            SELECT 
                p.id_pedido,
                p.codigo_pedido,
                p.fecha_pedido,
                COUNT(dp.id_detalle) as total_items,
                COUNT(DISTINCT dp.id_producto) as productos_diferentes
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            GROUP BY p.id_pedido, p.codigo_pedido, p.fecha_pedido
            HAVING total_items > 1
            ORDER BY total_items DESC
            LIMIT 10
        `);
        
        console.log(`   Pedidos con múltiples items: ${pedidosMultiples.length}`);
        if (pedidosMultiples.length > 0) {
            console.log('   Top 10 pedidos con más items:');
            pedidosMultiples.forEach(pedido => {
                console.log(`     - Pedido ${pedido.codigo_pedido}: ${pedido.total_items} items, ${pedido.productos_diferentes} productos diferentes`);
            });
        }
        
        // 3. Probar combinaciones con productos diferentes
        console.log('\n3. PROBANDO COMBINACIONES CON PRODUCTOS DIFERENTES:');
        
        const [combinacionesDiferentes] = await connection.query(`
            SELECT 
                dp1.id_producto as product_a_id,
                dp2.id_producto as product_b_id,
                pr1.titulo as product_a,
                pr2.titulo as product_b,
                COUNT(*) as frequency,
                COUNT(DISTINCT dp1.id_pedido) as unique_orders
            FROM detalle_pedidos dp1
            JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                AND dp1.id_producto < dp2.id_producto
            JOIN productos pr1 ON dp1.id_producto = pr1.id_producto
            JOIN productos pr2 ON dp2.id_producto = pr2.id_producto
            GROUP BY dp1.id_producto, dp2.id_producto, pr1.titulo, pr2.titulo
            ORDER BY frequency DESC
            LIMIT 10
        `);
        
        console.log(`   Combinaciones encontradas (productos diferentes): ${combinacionesDiferentes.length}`);
        if (combinacionesDiferentes.length > 0) {
            combinacionesDiferentes.forEach((combo, index) => {
                console.log(`     ${index + 1}. "${combo.product_a}" + "${combo.product_b}" - ${combo.frequency} veces en ${combo.unique_orders} pedidos`);
            });
        }
        
        // 4. Probar combinaciones incluyendo productos repetidos
        console.log('\n4. PROBANDO COMBINACIONES INCLUYENDO PRODUCTOS REPETIDOS:');
        
        const [combinacionesRepetidas] = await connection.query(`
            SELECT 
                dp1.id_producto as product_a_id,
                dp2.id_producto as product_b_id,
                pr1.titulo as product_a,
                pr2.titulo as product_b,
                COUNT(*) as frequency,
                COUNT(DISTINCT dp1.id_pedido) as unique_orders,
                SUM(dp1.cantidad + dp2.cantidad) as total_quantity
            FROM detalle_pedidos dp1
            JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                AND dp1.id_detalle <= dp2.id_detalle
            JOIN productos pr1 ON dp1.id_producto = pr1.id_producto
            JOIN productos pr2 ON dp2.id_producto = pr2.id_producto
            GROUP BY dp1.id_producto, dp2.id_producto, pr1.titulo, pr2.titulo
            ORDER BY frequency DESC
            LIMIT 15
        `);
        
        console.log(`   Combinaciones encontradas (incluyendo repetidos): ${combinacionesRepetidas.length}`);
        if (combinacionesRepetidas.length > 0) {
            combinacionesRepetidas.forEach((combo, index) => {
                const tipo = combo.product_a_id === combo.product_b_id ? '[MISMO PRODUCTO]' : '[PRODUCTOS DIFERENTES]';
                console.log(`     ${index + 1}. ${tipo} "${combo.product_a}" + "${combo.product_b}" - ${combo.frequency} veces, ${combo.total_quantity} cantidad total`);
            });
        }
        
        // 5. Análisis de productos más comunes
        console.log('\n5. PRODUCTOS MÁS PEDIDOS:');
        
        const [productosMasComunes] = await connection.query(`
            SELECT 
                pr.id_producto,
                pr.titulo,
                SUM(dp.cantidad) as total_cantidad,
                COUNT(DISTINCT dp.id_pedido) as pedidos_diferentes,
                COUNT(dp.id_detalle) as apariciones
            FROM detalle_pedidos dp
            JOIN productos pr ON dp.id_producto = pr.id_producto
            GROUP BY pr.id_producto, pr.titulo
            ORDER BY total_cantidad DESC
            LIMIT 10
        `);
        
        productosMasComunes.forEach((producto, index) => {
            console.log(`     ${index + 1}. "${producto.titulo}" - ${producto.total_cantidad} unidades en ${producto.pedidos_diferentes} pedidos`);
        });
        
        // 6. Verificar fechas de pedidos
        console.log('\n6. RANGO DE FECHAS DE PEDIDOS:');
        
        const [rangoFechas] = await connection.query(`
            SELECT 
                MIN(fecha_pedido) as fecha_mas_antigua,
                MAX(fecha_pedido) as fecha_mas_reciente,
                COUNT(*) as total_pedidos,
                COUNT(DISTINCT DATE(fecha_pedido)) as dias_diferentes
            FROM pedidos
        `);
        
        if (rangoFechas.length > 0) {
            const rango = rangoFechas[0];
            console.log(`     Fecha más antigua: ${rango.fecha_mas_antigua}`);
            console.log(`     Fecha más reciente: ${rango.fecha_mas_reciente}`);
            console.log(`     Total de pedidos: ${rango.total_pedidos}`);
            console.log(`     Días con pedidos: ${rango.dias_diferentes}`);
        }
        
        console.log('\n=== FIN DEL DIAGNÓSTICO ===');
        
    } catch (error) {
        console.error('Error en el diagnóstico:', error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Función para probar la API de combinaciones
async function testCombinationsAPI() {
    console.log('\n=== PROBANDO API DE COMBINACIONES ===');
    
    let connection;
    try {
        // Usar el pool existente
        connection = await pool.promise().getConnection();
        
        // Mock de la función getProductCombinations mejorada
        const testGetProductCombinations = async (req) => {
            const { 
                startDate, 
                endDate, 
                sortBy = 'frequency', 
                sortOrder = 'desc', 
                page = 1, 
                limit = 20,
                includeRepeatedProducts = 'true'
            } = req.query;
            
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
            
            // Validar parámetros
            const pageNumber = Math.max(1, parseInt(page));
            const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
            const offset = (pageNumber - 1) * limitNumber;
            const includeRepeated = includeRepeatedProducts === 'true' || includeRepeatedProducts === true;
            
            console.log(`[API Test] Buscando combinaciones con includeRepeated=${includeRepeated}`);
            
            // Query principal mejorada
            const combinationsQuery = `
                SELECT 
                    dp1.id_producto as product_a_id,
                    dp2.id_producto as product_b_id,
                    pr1.titulo as product_a,
                    pr2.titulo as product_b,
                    COUNT(*) as frequency,
                    SUM(dp1.precio_unitario * dp1.cantidad + dp2.precio_unitario * dp2.cantidad) as total_revenue,
                    AVG(dp1.precio_unitario * dp1.cantidad + dp2.precio_unitario * dp2.cantidad) as avg_revenue_per_combination,
                    COUNT(DISTINCT p.id_pedido) as unique_orders_count,
                    SUM(dp1.cantidad + dp2.cantidad) as total_quantity
                FROM detalle_pedidos dp1
                JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                    ${includeRepeated ? 'AND dp1.id_detalle <= dp2.id_detalle' : 'AND dp1.id_producto < dp2.id_producto'}
                JOIN pedidos p ON dp1.id_pedido = p.id_pedido
                JOIN productos pr1 ON dp1.id_producto = pr1.id_producto
                JOIN productos pr2 ON dp2.id_producto = pr2.id_producto
                WHERE 1=1 ${dateFilter}
                GROUP BY dp1.id_producto, dp2.id_producto, pr1.titulo, pr2.titulo
                HAVING frequency > 0
                ORDER BY ${sortBy === 'frequency' ? 'frequency' : 'total_revenue'} ${sortOrder.toUpperCase()}
                LIMIT ? OFFSET ?
            `;
            
            const mainQueryParams = [...queryParams, limitNumber, offset];
            const [combinations] = await connection.query(combinationsQuery, mainQueryParams);
            
            console.log(`[API Test] Combinaciones encontradas: ${combinations.length}`);
            
            // Query para contar total
            const countQuery = `
                SELECT COUNT(*) as total
                FROM (
                    SELECT 
                        dp1.id_producto as product_a_id,
                        dp2.id_producto as product_b_id
                    FROM detalle_pedidos dp1
                    JOIN detalle_pedidos dp2 ON dp1.id_pedido = dp2.id_pedido 
                        ${includeRepeated ? 'AND dp1.id_detalle <= dp2.id_detalle' : 'AND dp1.id_producto < dp2.id_producto'}
                    JOIN pedidos p ON dp1.id_pedido = p.id_pedido
                    WHERE 1=1 ${dateFilter}
                    GROUP BY dp1.id_producto, dp2.id_producto
                ) as combinations_count
            `;
            
            const [totalCount] = await connection.query(countQuery, queryParams);
            
            // Estadísticas
            const [basicStats] = await connection.query(`
                SELECT 
                    COUNT(DISTINCT p.id_pedido) as total_orders_in_period,
                    COUNT(DISTINCT dp.id_producto) as unique_products
                FROM detalle_pedidos dp
                JOIN pedidos p ON dp.id_pedido = p.id_pedido
                WHERE 1=1 ${dateFilter}
            `, queryParams);
            
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
                totalRevenue: parseFloat(combo.total_revenue || 0).toFixed(2),
                avgRevenuePerCombination: parseFloat(combo.avg_revenue_per_combination || 0).toFixed(2),
                totalQuantity: parseInt(combo.total_quantity || 0),
                uniqueOrdersCount: parseInt(combo.unique_orders_count || 0),
                isSameProduct: combo.product_a_id === combo.product_b_id,
                combinationType: combo.product_a_id === combo.product_b_id ? 'Producto repetido' : 'Productos diferentes'
            }));
            
            const totalItems = parseInt(totalCount[0]?.total || 0);
            const totalPages = Math.ceil(totalItems / limitNumber);
            
            return {
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
                    sortBy: sortBy,
                    sortOrder: sortOrder,
                    includeRepeatedProducts: includeRepeated.toString()
                },
                statistics: {
                    totalOrdersInPeriod: parseInt(basicStats[0]?.total_orders_in_period || 0),
                    uniqueCombinations: totalItems,
                    uniqueProducts: parseInt(basicStats[0]?.unique_products || 0)
                }
            };
        };
        
        // Simular diferentes tipos de requests
        const testCases = [
            {
                name: 'Con productos repetidos incluidos',
                query: {
                    sortBy: 'frequency',
                    sortOrder: 'desc',
                    page: 1,
                    limit: 10,
                    includeRepeatedProducts: 'true'
                }
            },
            {
                name: 'Solo productos diferentes',
                query: {
                    sortBy: 'frequency',
                    sortOrder: 'desc',
                    page: 1,
                    limit: 10,
                    includeRepeatedProducts: 'false'
                }
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n--- Probando: ${testCase.name} ---`);
            
            const mockReq = { query: testCase.query };
            const result = await testGetProductCombinations(mockReq);
            
            console.log('Resultado:');
            console.log(`  - Total combinaciones: ${result.data.length}`);
            console.log(`  - Total items: ${result.pagination.totalItems}`);
            console.log(`  - Órdenes en período: ${result.statistics.totalOrdersInPeriod}`);
            console.log(`  - Productos únicos: ${result.statistics.uniqueProducts}`);
            
            if (result.data.length > 0) {
                console.log('  - Top 3 combinaciones:');
                result.data.slice(0, 3).forEach((combo, index) => {
                    console.log(`    ${index + 1}. ${combo.productA.name} + ${combo.productB.name} (${combo.combinationType}) - ${combo.frequency} veces`);
                });
            }
        }
        
    } catch (error) {
        console.error('Error al obtener combinaciones de productos:', error);
        return {
            message: 'Error al obtener combinaciones de productos',
            error: error.message
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Ejecutar las pruebas
async function runTests() {
    console.log('Iniciando pruebas de combinaciones de productos...\n');
    
    try {
        await testProductCombinations();
        await testCombinationsAPI();
    } catch (error) {
        console.error('Error durante las pruebas:', error);
    }
    
    console.log('\nPruebas completadas.');
    process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testProductCombinations,
    testCombinationsAPI,
    runTests
};