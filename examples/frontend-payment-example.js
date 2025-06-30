// Ejemplo de implementación del frontend para usar el nuevo sistema de pago automático
// Archivo: frontend-payment-example.js

/**
 * Función para procesar pago completo con creación automática de pedido
 * El pedido se crea automáticamente en estado 'en proceso' (directo a cocina)
 */
async function procesarPagoCompleto(datosFormulario) {
    try {
        console.log('🚀 Iniciando proceso de pago completo...');
        
        // Preparar los datos para el endpoint
        const payloadCompleto = {
            // 💳 Datos de la tarjeta
            numeroTarjeta: datosFormulario.numeroTarjeta,
            cvv: datosFormulario.cvv,
            mesVencimiento: parseInt(datosFormulario.mesVencimiento),
            anioVencimiento: parseInt(datosFormulario.anioVencimiento),
            
            // 👤 Datos del cliente para el pago
            nombre: datosFormulario.nombre,
            apellido: datosFormulario.apellido,
            email: datosFormulario.email,
            telefono: datosFormulario.telefono,
            direccionPago: datosFormulario.direccionFacturacion,
            ciudad: datosFormulario.ciudad,
            idPais: 'SV', // El Salvador
            idRegion: 'SV-SS', // San Salvador
            codigoPostal: datosFormulario.codigoPostal || '1101',
            
            // 🛍️ Datos completos del pedido
            pedidoData: {
                tipo_cliente: datosFormulario.esClienteRegistrado ? 'registrado' : 'invitado',
                cliente: {
                    nombre: datosFormulario.nombre,
                    apellido: datosFormulario.apellido,
                    telefono: datosFormulario.telefono,
                    email: datosFormulario.email,
                    // Solo incluir id_usuario si es cliente registrado
                    ...(datosFormulario.esClienteRegistrado && { id_usuario: datosFormulario.userId })
                },
                direccion: {
                    tipo_direccion: 'formulario', // o 'coordenadas' si usas GPS
                    direccion: datosFormulario.direccionEntrega,
                    pais: 'El Salvador',
                    departamento: datosFormulario.departamento || 'San Salvador',
                    municipio: datosFormulario.municipio || 'San Salvador',
                    codigo_postal: datosFormulario.codigoPostal || '1101',
                    instrucciones_entrega: datosFormulario.instruccionesEntrega || null
                },
                productos: datosFormulario.carrito.map(item => ({
                    id_producto: item.id,
                    nombre_producto: item.nombre,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    subtotal: item.cantidad * item.precio,
                    masa: item.masa || null,
                    tamano: item.tamano || null,
                    instrucciones_especiales: item.instrucciones || null
                })),
                subtotal: datosFormulario.subtotal,
                costo_envio: datosFormulario.costoEnvio || 0,
                impuestos: datosFormulario.impuestos || 0,
                total: datosFormulario.total,
                aceptado_terminos: true,
                tiempo_estimado_entrega: datosFormulario.tiempoEstimado || 45
            }
        };

        console.log('📦 Payload preparado:', payloadCompleto);

        // Realizar la petición al backend
        const response = await fetch('/api/payments/process-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Incluir token si el usuario está autenticado
                ...(localStorage.getItem('token') && {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                })
            },
            body: JSON.stringify(payloadCompleto)
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.message || 'Error en el servidor');
        }

        if (resultado.success) {
            console.log('✅ Pago y pedido procesados exitosamente:', resultado.data);
            
            // 🎉 Éxito: el pago se procesó y el pedido se creó automáticamente
            return {
                success: true,
                transactionId: resultado.data.transactionId,
                urlPago: resultado.data.urlPago,
                pedido: {
                    id: resultado.data.pedido.id,
                    codigo: resultado.data.pedido.codigo,
                    estado: resultado.data.pedido.estado, // 'en proceso'
                    total: resultado.data.pedido.total
                },
                mensaje: resultado.data.message // "El pedido ha sido enviado automáticamente a cocina y está en proceso"
            };
        } else {
            throw new Error(resultado.message);
        }

    } catch (error) {
        console.error('❌ Error al procesar pago completo:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Ejemplo de uso en el frontend
 */
async function ejemploUso() {
    // Datos del formulario del frontend
    const datosDelFormulario = {
        // Datos de la tarjeta
        numeroTarjeta: '4573690001990693',
        cvv: '835',
        mesVencimiento: '12',
        anioVencimiento: '2029',
        
        // Datos del cliente
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        telefono: '50312345678',
        direccionFacturacion: 'Colonia Escalón, Casa #123',
        direccionEntrega: 'Colonia Escalón, Casa #123',
        ciudad: 'San Salvador',
        departamento: 'San Salvador',
        municipio: 'San Salvador',
        codigoPostal: '1101',
        instruccionesEntrega: 'Casa amarilla, portón negro',
        
        // Estado del cliente
        esClienteRegistrado: false, // true si tiene cuenta
        userId: null, // ID del usuario si está registrado
        
        // Datos del pedido
        carrito: [
            {
                id: 1,
                nombre: 'Pizza Margarita',
                cantidad: 2,
                precio: 12.50,
                masa: 'tradicional',
                tamano: 'mediana',
                instrucciones: 'Sin cebolla'
            },
            {
                id: 2,
                nombre: 'Coca Cola 600ml',
                cantidad: 2,
                precio: 1.50
            }
        ],
        subtotal: 28.00,
        costoEnvio: 2.50,
        impuestos: 3.64,
        total: 34.14,
        tiempoEstimado: 45
    };

    // Procesar el pago completo
    const resultado = await procesarPagoCompleto(datosDelFormulario);

    if (resultado.success) {
        // ✅ Éxito: Pago procesado y pedido creado automáticamente
        console.log('🎉 ¡Pedido creado exitosamente!');
        console.log(`📋 Código del pedido: ${resultado.pedido.codigo}`);
        console.log(`🍕 Estado: ${resultado.pedido.estado}`); // 'en proceso'
        console.log(`💰 Total: $${resultado.pedido.total}`);
        
        // Redirigir al usuario a página de confirmación
        window.location.href = `/confirmacion?pedido=${resultado.pedido.codigo}&transaction=${resultado.transactionId}`;
        
        // O mostrar mensaje de éxito
        mostrarMensajeExito(resultado.mensaje);
        
    } else {
        // ❌ Error en el proceso
        console.error('Error:', resultado.error);
        mostrarMensajeError(resultado.error);
    }
}

/**
 * Función auxiliar para mostrar mensaje de éxito
 */
function mostrarMensajeExito(mensaje) {
    // Implementar según tu sistema de notificaciones
    alert(`✅ ${mensaje}`);
}

/**
 * Función auxiliar para mostrar mensaje de error  
 */
function mostrarMensajeError(error) {
    // Implementar según tu sistema de notificaciones
    alert(`❌ Error: ${error}`);
}

/**
 * Validaciones del frontend antes de enviar
 */
function validarDatosAntesDePagar(datos) {
    const errores = [];
    
    // Validar tarjeta
    if (!datos.numeroTarjeta || datos.numeroTarjeta.length < 13) {
        errores.push('Número de tarjeta inválido');
    }
    
    if (!datos.cvv || datos.cvv.length < 3) {
        errores.push('CVV inválido');
    }
    
    // Validar cliente
    if (!datos.nombre || !datos.apellido) {
        errores.push('Nombre y apellido son requeridos');
    }
    
    if (!datos.email || !datos.email.includes('@')) {
        errores.push('Email inválido');
    }
    
    // Validar carrito
    if (!datos.carrito || datos.carrito.length === 0) {
        errores.push('El carrito está vacío');
    }
    
    // Validar total
    if (!datos.total || datos.total <= 0) {
        errores.push('Total inválido');
    }
    
    return errores;
}

// Exportar para uso en módulos
// export { procesarPagoCompleto, validarDatosAntesDePagar };
