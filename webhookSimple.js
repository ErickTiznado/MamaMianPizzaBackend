/**
 * Handle Wompi webhook notifications - VERSION SIMPLIFICADA PARA DEBUG
 */
exports.handleWebhookSimple = async (req, res) => {
    const requestId = `WEBHOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`\n[${new Date().toISOString()}] ===== WEBHOOK WOMPI SIMPLE =====`);
    console.log(`🆔 Request ID: ${requestId}`);

    try {
        const webhookData = req.body;
        console.log(`📥 [${requestId}] Webhook data recibido:`, JSON.stringify(webhookData, null, 2));

        // For any test transaction, return success immediately
        if (webhookData && webhookData.idTransaccion && webhookData.idTransaccion.includes('test')) {
            console.log(`🧪 [${requestId}] Procesando webhook de prueba`);
            return res.status(200).json({ 
                success: true, 
                message: 'Webhook de prueba procesado exitosamente',
                data: {
                    transactionId: webhookData.idTransaccion,
                    status: webhookData.estado || 'test',
                    note: 'Esta es una transacción de prueba.'
                },
                request_id: requestId
            });
        }

        // For any other case, return basic success
        console.log(`✅ [${requestId}] Webhook procesado`);
        return res.status(200).json({
            success: true,
            message: 'Webhook procesado (versión simplificada)',
            data: webhookData,
            request_id: requestId
        });

    } catch (error) {
        console.error(`❌ [${requestId}] ERROR en webhook simple:`, error.message);
        console.error(`❌ [${requestId}] Stack trace:`, error.stack);
        
        return res.status(200).json({
            success: false,
            message: 'Error en webhook pero respondiendo 200',
            error: error.message,
            request_id: requestId
        });
    }
};
