-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: vps.mamamianpizza.com
-- Tiempo de generación: 17-06-2025 a las 02:52:19
-- Versión del servidor: 8.4.5
-- Versión de PHP: 8.3.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `MamaMianPizza`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id_admin` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `celular` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Pizza', 'Categoria dedicada a las pizzas'),
(2, 'Bebidas', 'Seccion dedicada a las bebidas de todo tipo'),
(4, 'Bebidas', 'Seccion dedicada a las bebidas de todo tipo'),
(5, 'Complementos', 'Sección dedicada a todos aquellos productos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenido_web`
--

CREATE TABLE `contenido_web` (
  `id_contenido` int NOT NULL,
  `seccion` varchar(50) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `contenido` text NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedidos`
--

CREATE TABLE `detalle_pedidos` (
  `id_detalle` int NOT NULL,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `masa` varchar(50) DEFAULT NULL,
  `tamano` varchar(50) DEFAULT NULL,
  `instrucciones_especiales` text,
  `metodo_entrega` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_pedidos`
--

INSERT INTO `detalle_pedidos` (`id_detalle`, `id_pedido`, `id_producto`, `nombre_producto`, `cantidad`, `precio_unitario`, `masa`, `tamano`, `instrucciones_especiales`, `metodo_entrega`, `subtotal`) VALUES
(1, 1, 3, 'Cheese Sticks con Salsa1', 2, 8.00, 'Tradicional', 'grande', NULL, 0, 16.00),
(2, 2, 3, 'Cheese Sticks con Salsa1', 5, 12.00, 'Tradicional', 'gigante', NULL, 0, 60.00),
(4, 4, 3, 'Cheese Sticks con Salsa1', 4, 12.00, 'Tradicional', 'gigante', NULL, 0, 48.00),
(7, 5, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Delgada', 'Personal', NULL, 1, 6.00),
(10, 8, 3, 'Cheese Sticks con Salsa1', 1, 4.00, NULL, NULL, NULL, 0, 4.00),
(11, 9, 3, 'Cheese Sticks con Salsa1', 1, 4.00, NULL, NULL, NULL, 0, 4.00),
(12, 10, 3, 'Cheese Sticks con Salsa1', 3, 12.00, 'Tradicional', 'gigante', NULL, 0, 36.00),
(13, 11, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(14, 11, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(15, 12, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(16, 12, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(17, 13, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(18, 13, 3, 'Cheese Sticks con Salsa1', 1, 6.00, 'Tradicional', 'Personal', NULL, 0, 6.00),
(19, 14, 3, 'Cheese Sticks con Salsa1', 1, 8.00, 'Tradicional', 'grande', NULL, 0, 8.00),
(20, 15, 3, 'Cheese Sticks con Salsa1', 1, 4.00, 'Tradicional', 'personal', 'Ingredientes extra: Loroco, Camaron, Jalapeño, Champiñones', 0, 4.00),
(21, 16, 4, 'Pizza de peperoni', 1, 4.00, 'Tradicional', 'Personal', 'Caliente', 0, 4.00),
(22, 17, 4, 'Pizza de peperoni', 1, 4.00, 'Tradicional', 'Personal', 'Caliente', 0, 4.00),
(23, 18, 3, 'Cheese Sticks con Salsa1', 1, 4.00, NULL, NULL, NULL, 0, 4.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `id_direccion` int NOT NULL,
  `id_usuario` int NOT NULL,
  `direccion` text,
  `referencias` text,
  `tipo_direccion` enum('formulario','tiempo_real') NOT NULL DEFAULT 'formulario',
  `pais` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `precision_ubicacion` int DEFAULT NULL,
  `direccion_formateada` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`id_direccion`, `id_usuario`, `direccion`, `referencias`, `tipo_direccion`, `pais`, `departamento`, `municipio`, `latitud`, `longitud`, `precision_ubicacion`, `direccion_formateada`) VALUES
(1, 1, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(2, 2, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(3, 5, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(4, 6, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(5, 4, NULL, NULL, 'tiempo_real', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 4, NULL, NULL, 'tiempo_real', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 4, NULL, NULL, 'tiempo_real', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 4, NULL, NULL, 'tiempo_real', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 4, NULL, NULL, 'tiempo_real', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 7, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(11, 8, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(12, 9, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(13, 4, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(14, 10, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(15, 11, 'En el Local - Pedido creado por Administrador', NULL, 'formulario', 'El Salvador', 'San Salvador', 'San Salvador', NULL, NULL, NULL, NULL),
(16, 12, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(17, 12, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(18, 4, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_contenido`
--

CREATE TABLE `historial_contenido` (
  `id_historial` int NOT NULL,
  `id_contenido` int NOT NULL,
  `contenido_anterior` text NOT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_admin` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingredientes`
--

CREATE TABLE `ingredientes` (
  `id_ingrediente` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `cantidad_actual` decimal(10,2) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `fecha_caducidad` date DEFAULT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs`
--

CREATE TABLE `logs` (
  `id_log` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id_metodo_pago` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_pago` varchar(50) NOT NULL,
  `datos_pago` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int NOT NULL,
  `id_ingrediente` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('leida','no leida') NOT NULL DEFAULT 'no leida'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id_notificacion`, `titulo`, `mensaje`, `tipo`, `fecha_emision`, `estado`) VALUES
(1, 'Nuevo Pedido', 'Pedido AQAOWA3X por $6.78', 'pedido', '2025-06-14 03:23:47', 'no leida'),
(2, 'Nuevo Pedido', 'Pedido 79042Z29 por $4.52', 'pedido', '2025-06-14 04:57:38', 'no leida'),
(3, 'Nuevo Pedido', 'Pedido 7YXBOGNT por $4.52', 'pedido', '2025-06-14 05:02:47', 'no leida'),
(4, 'Nuevo Pedido', 'Pedido HQY73VMK por $4.52', 'pedido', '2025-06-14 05:46:11', 'no leida'),
(5, 'Nuevo Pedido', 'Pedido DCO8HO66 por $4.52', 'pedido', '2025-06-14 05:50:54', 'no leida'),
(6, 'Nuevo Pedido', 'Pedido WAP2WKAN por $13.56', 'pedido', '2025-06-14 20:16:02', 'no leida'),
(7, 'Nuevo Pedido', 'Pedido K6BH2IDQ por $13.56', 'pedido', '2025-06-14 20:17:38', 'no leida'),
(8, 'Nuevo Pedido', 'Pedido JSEEVCSE por $13.56', 'pedido', '2025-06-14 20:21:24', 'no leida'),
(9, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:28:52', 'no leida'),
(10, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:01', 'no leida'),
(11, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:06', 'no leida'),
(12, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:20', 'no leida'),
(13, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:33:01', 'no leida'),
(14, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en camino', 'success', '2025-06-16 04:35:26', 'no leida'),
(15, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: Entregado', 'success', '2025-06-16 04:35:30', 'no leida'),
(16, 'Estado de pedido actualizado', 'Pedido #RN42H92D ahora está: en proceso', 'success', '2025-06-16 04:43:59', 'no leida'),
(17, 'Estado de pedido actualizado', 'Pedido #RN42H92D ahora está: en camino', 'success', '2025-06-16 04:44:14', 'no leida'),
(18, 'Estado de pedido actualizado', 'Pedido #JSEEVCSE ahora está: en proceso', 'success', '2025-06-16 04:46:54', 'no leida'),
(19, 'Nuevo Pedido', 'Pedido G7AW9Q18 por $4.52', 'pedido', '2025-06-16 16:31:19', 'no leida'),
(20, 'Nuevo Pedido', 'Pedido 3L4LN329 por $4.52', 'pedido', '2025-06-16 16:31:19', 'no leida'),
(21, 'Nuevo Pedido', 'Pedido AE4ZC6RH por $4.52', 'pedido', '2025-06-16 16:31:21', 'no leida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset`
--

CREATE TABLE `password_reset` (
  `id_reset` int NOT NULL,
  `user_id` int NOT NULL,
  `user_type` enum('usuario','admin') NOT NULL,
  `reset_code` varchar(100) NOT NULL,
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiracion` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL,
  `codigo_pedido` varchar(15) NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `id_direccion` int DEFAULT NULL,
  `fecha_pedido` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','en proceso','en camino','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  `total` decimal(10,2) NOT NULL,
  `tipo_cliente` enum('invitado','registrado') NOT NULL DEFAULT 'registrado',
  `metodo_pago` enum('efectivo','tarjeta') NOT NULL,
  `nombre_cliente` varchar(100) DEFAULT NULL,
  `apellido_cliente` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `num_tarjeta_masked` varchar(19) DEFAULT NULL,
  `nombre_tarjeta` varchar(100) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `costo_envio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `impuestos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `aceptado_terminos` tinyint(1) NOT NULL DEFAULT '0',
  `tiempo_estimado_entrega` int DEFAULT NULL COMMENT 'minutos',
  `fecha_entrega` datetime DEFAULT NULL,
  `notas_adicionales` text,
  `id_usuario_invitado` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `codigo_pedido`, `id_usuario`, `id_direccion`, `fecha_pedido`, `estado`, `total`, `tipo_cliente`, `metodo_pago`, `nombre_cliente`, `apellido_cliente`, `telefono`, `email`, `num_tarjeta_masked`, `nombre_tarjeta`, `subtotal`, `costo_envio`, `impuestos`, `aceptado_terminos`, `tiempo_estimado_entrega`, `fecha_entrega`, `notas_adicionales`, `id_usuario_invitado`) VALUES
(1, 'FFL7OYRW', 1, 1, '2025-06-12 01:43:46', 'pendiente', 20.58, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749692622800@mamamianpizza.com', NULL, NULL, 16.00, 2.50, 2.08, 1, 30, NULL, NULL, 1),
(2, '86JNAAMD', 2, 2, '2025-06-12 03:48:29', 'pendiente', 70.30, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749700105259@mamamianpizza.com', NULL, NULL, 60.00, 2.50, 7.80, 1, 30, NULL, NULL, 1),
(3, 'DWQOPZOM', 5, 3, '2025-06-12 18:28:26', 'pendiente', 56.74, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749752900416@mamamianpizza.com', NULL, NULL, 48.00, 2.50, 6.24, 1, 30, NULL, NULL, 1),
(4, '5MOK0O59', 6, 4, '2025-06-14 00:00:37', 'pendiente', 77.08, 'invitado', 'efectivo', 'Tiznado', 'TiznadoRodriguez', '70830446', 'admin_1749859237052@mamamianpizza.com', NULL, NULL, 66.00, 2.50, 8.58, 1, 30, NULL, NULL, 1),
(5, 'AQAOWA3X', 4, 5, '2025-06-14 03:23:47', 'pendiente', 6.78, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 6.00, 0.00, 0.78, 1, 25, NULL, NULL, NULL),
(6, '79042Z29', 4, 6, '2025-06-14 04:57:38', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(7, '7YXBOGNT', 4, 7, '2025-06-14 05:02:47', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(8, 'HQY73VMK', 4, 8, '2025-06-14 05:46:10', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(9, 'DCO8HO66', 4, 9, '2025-06-14 05:50:54', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(10, 'Q46NPWCZ', 7, 10, '2025-06-14 19:24:32', 'pendiente', 43.18, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749929069946@mamamianpizza.com', NULL, NULL, 36.00, 2.50, 4.68, 1, 30, NULL, NULL, 1),
(11, 'WAP2WKAN', 8, 11, '2025-06-14 20:16:02', 'pendiente', 13.56, 'invitado', 'efectivo', 'mielna', 'wedwefdwe', '70141812', NULL, NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, 2),
(12, 'K6BH2IDQ', 9, 12, '2025-06-14 20:17:37', 'pendiente', 13.56, 'invitado', 'efectivo', 'mielna', 'wedwefdwe', '70141812', NULL, NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, 2),
(13, 'JSEEVCSE', 4, 13, '2025-06-14 20:21:23', 'en proceso', 13.56, 'registrado', 'efectivo', 'milena zelaya', NULL, '70141812', 'nathy.zelaya55@gmail.com', NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, NULL),
(14, 'RN42H92D', 10, 14, '2025-06-15 17:16:12', 'en camino', 11.54, 'invitado', 'efectivo', 'ERICK1213', 'TIZNADO', '70830446', 'admin_1750007765841@mamamianpizza.com', NULL, NULL, 8.00, 2.50, 1.04, 1, 30, NULL, NULL, 1),
(15, '9WWWEAQ9', 11, 15, '2025-06-15 17:46:10', 'entregado', 7.02, 'invitado', 'efectivo', 'ERICK2121', 'TIZNADO', '70830446', 'admin_1750009563808@mamamianpizza.com', NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, NULL),
(16, 'G7AW9Q18', 12, 16, '2025-06-16 16:31:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio Tiznado', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(17, '3L4LN329', 12, 17, '2025-06-16 16:31:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio Tiznado', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL),
(18, 'AE4ZC6RH', 4, 18, '2025-06-16 16:31:21', 'pendiente', 4.52, 'registrado', 'efectivo', 'milu', NULL, '70141812', 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `precios`
--

CREATE TABLE `precios` (
  `pizza_id` int NOT NULL,
  `tamano_id` int NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `precios`
--

INSERT INTO `precios` (`pizza_id`, `tamano_id`, `precio`) VALUES
(3, 1, 4.00),
(3, 2, 6.00),
(3, 3, 8.00),
(3, 4, 12.00),
(4, 1, 4.00),
(4, 2, 6.00),
(4, 3, 8.00),
(4, 4, 12.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text,
  `seccion` varchar(50) DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `titulo`, `descripcion`, `seccion`, `id_categoria`, `activo`, `imagen`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(3, 'Cheese Sticks con Salsa1', 'sdsadasd', 'Recomendacion de la Casa', 1, 0, 'https://api.mamamianpizza.com/uploads/imagen-1749613847375-275594258.jpg', '2025-06-11 03:47:04', '2025-06-11 03:51:34'),
(4, 'Pizza de peperoni', 'fsdfsdf', 'Las mas Populares', 1, 0, 'https://api.mamamianpizza.com/uploads/imagen-1749694654492-645342192.jpg', '2025-06-12 02:14:08', '2025-06-12 02:14:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recetas`
--

CREATE TABLE `recetas` (
  `id_receta` int NOT NULL,
  `id_producto` int NOT NULL,
  `id_ingrediente` int NOT NULL,
  `cantidad_necesaria` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id_resena` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  `comentario` text NOT NULL,
  `valoracion` tinyint NOT NULL COMMENT '1–5 estrellas',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `aprobada` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `resenas`
--

INSERT INTO `resenas` (`id_resena`, `id_usuario`, `id_producto`, `comentario`, `valoracion`, `fecha_creacion`, `aprobada`) VALUES
(2, 4, 3, 'wrwerwerwerwe', 5, '2025-06-17 00:46:17', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `tipo_reserva` enum('pedido para recoger','reserva de mesa') NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tamanos`
--

CREATE TABLE `tamanos` (
  `id_tamano` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `indice` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tamanos`
--

INSERT INTO `tamanos` (`id_tamano`, `nombre`, `indice`) VALUES
(1, 'Personal', 1),
(2, 'Mediana', 2),
(3, 'Grande', 3),
(4, 'Gigante', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` enum('M','F','Otro') DEFAULT NULL,
  `dui` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contrasena`, `celular`, `fecha_nacimiento`, `sexo`, `dui`, `foto_perfil`) VALUES
(1, 'ERICK', 'admin_1749692622800@mamamianpizza.com', '$2b$05$jC4KdqS8vHrlwmdjUf/uh.AhdZ1Xd7gn6yrmFsXR2.UScydB5bV/m', '70830446', NULL, NULL, NULL, NULL),
(2, 'ERICK', 'admin_1749700105259@mamamianpizza.com', '$2b$05$7.bsGhXj3vV7P5fezUi8cuxn.W2NumaTVexJG3Vro8pNquGmcQmrC', '70830446', NULL, NULL, NULL, NULL),
(3, 'nathaly milenas', 'nathy.zelaya5@gmail.com', '$2b$10$UkKD/yDKIIcaqN3Hl.K1KuBWENdiB.f4u9eDK7dnV9uxcwCWVxS/2', '70141812', '2007-06-03', 'F', '123456789', NULL),
(4, 'milena zelaya', 'nathy.zelaya55@gmail.com', '$2b$10$0Wx.0HLRSnbl6amYtIy1R.MDh/55Hks0LoZBVgg4.rW8yRXYj2Gd6', '70141812', '1992-06-07', 'F', '123456789', 'https://api.mamamianpizza.com/uploads/profiles/profile-1750049136142-374537521.png'),
(5, 'ERICK', 'admin_1749752900416@mamamianpizza.com', '$2b$05$c6TBfGgTS/WLpH6gaAkWMe4vEoO6B9gIskAIXnuMCdEnjqe50EHtq', '70830446', NULL, NULL, NULL, NULL),
(6, 'Tiznado', 'admin_1749859237052@mamamianpizza.com', '$2b$05$XEujTJ67Hef9AiJYy/sPFOWBi/WXVAg2B0CuvJtoewKJiK.LsRxly', '70830446', NULL, NULL, NULL, NULL),
(7, 'ERICK', 'admin_1749929069946@mamamianpizza.com', '$2b$05$9DS.UcYB37aE1Wto87Et/.I/521jkEaSSz2MGDr54PVbpACqlpjfe', '70830446', NULL, NULL, NULL, NULL),
(8, 'mielna', 'invitado_1749932162100@mamamianpizza.com', '$2b$05$/vyIRUH/W3az3Zx7EyA0wusL.JGQry3bOYqwkQvOv/t6di3aMIOlq', '70141812', NULL, NULL, NULL, NULL),
(9, 'mielna', 'invitado_1749932257497@mamamianpizza.com', '$2b$05$NVoVLD7BInZofll48paKfOcN0/AzZfg1esm91F4GrQxGEGLqkoDnC', '70141812', NULL, NULL, NULL, NULL),
(10, 'ERICK1213', 'admin_1750007765841@mamamianpizza.com', '$2b$05$eoy10StUMCZID.LIGtmMguzC4HUs/VcKsUhpg6b3.AgyYLnR2KRIu', '70830446', NULL, NULL, NULL, NULL),
(11, 'ERICK2121', 'guest_70830446_1750009570414@temp.com', 'guest_user_no_password', '70830446', NULL, NULL, NULL, NULL),
(12, 'Erick Mauricio ', 'tiznadoerick3@gmail.com', '$2b$10$jjctxLgAJb76gttkyYbTu.97T7PjIhfesWEXUjzENyK5nv74Q.BC2', '70830446', '2002-10-06', 'M', '063693309', 'https://api.mamamianpizza.com/uploads/profiles/profile-1750091033242-425369579.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_invitados`
--

CREATE TABLE `usuarios_invitados` (
  `id_usuario_invitado` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `celular` varchar(20) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_pedido` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios_invitados`
--

INSERT INTO `usuarios_invitados` (`id_usuario_invitado`, `nombre`, `apellido`, `celular`, `fecha_creacion`, `ultimo_pedido`) VALUES
(1, 'ERICK2121', 'TIZNADO', '70830446', '2025-06-12 01:43:46', '2025-06-15 17:46:10'),
(2, 'mielna', 'wedwefdwe', '70141812', '2025-06-14 20:16:02', '2025-06-14 20:17:37');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `contenido_web`
--
ALTER TABLE `contenido_web`
  ADD PRIMARY KEY (`id_contenido`);

--
-- Indices de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_detalle_pedidos_pedido` (`id_pedido`),
  ADD KEY `fk_detalle_pedidos_producto` (`id_producto`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `fk_direcciones_usuario` (`id_usuario`);

--
-- Indices de la tabla `historial_contenido`
--
ALTER TABLE `historial_contenido`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_historial_contenido_contenido` (`id_contenido`),
  ADD KEY `fk_historial_contenido_admin` (`id_admin`);

--
-- Indices de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`id_ingrediente`);

--
-- Indices de la tabla `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `fk_logs_usuario` (`id_usuario`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id_metodo_pago`),
  ADD KEY `fk_metodos_pago_usuario` (`id_usuario`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_movimientos_inventario_ingrediente` (`id_ingrediente`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`);

--
-- Indices de la tabla `password_reset`
--
ALTER TABLE `password_reset`
  ADD PRIMARY KEY (`id_reset`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `fk_pedidos_usuario` (`id_usuario`),
  ADD KEY `fk_pedidos_direccion` (`id_direccion`),
  ADD KEY `fk_pedido_usuario_invitado` (`id_usuario_invitado`);

--
-- Indices de la tabla `precios`
--
ALTER TABLE `precios`
  ADD PRIMARY KEY (`pizza_id`,`tamano_id`),
  ADD KEY `tamano_id` (`tamano_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_productos_categoria` (`id_categoria`);

--
-- Indices de la tabla `recetas`
--
ALTER TABLE `recetas`
  ADD PRIMARY KEY (`id_receta`),
  ADD KEY `fk_recetas_producto` (`id_producto`),
  ADD KEY `fk_recetas_ingrediente` (`id_ingrediente`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id_resena`),
  ADD KEY `fk_resenas_usuario` (`id_usuario`),
  ADD KEY `fk_resenas_producto` (`id_producto`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `fk_reservas_usuario` (`id_usuario`);

--
-- Indices de la tabla `tamanos`
--
ALTER TABLE `tamanos`
  ADD PRIMARY KEY (`id_tamano`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `usuarios_invitados`
--
ALTER TABLE `usuarios_invitados`
  ADD PRIMARY KEY (`id_usuario_invitado`),
  ADD UNIQUE KEY `celular` (`celular`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id_admin` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `contenido_web`
--
ALTER TABLE `contenido_web`
  MODIFY `id_contenido` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  MODIFY `id_detalle` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `historial_contenido`
--
ALTER TABLE `historial_contenido`
  MODIFY `id_historial` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id_ingrediente` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs`
--
ALTER TABLE `logs`
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id_metodo_pago` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id_movimiento` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `password_reset`
--
ALTER TABLE `password_reset`
  MODIFY `id_reset` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `recetas`
--
ALTER TABLE `recetas`
  MODIFY `id_receta` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id_resena` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tamanos`
--
ALTER TABLE `tamanos`
  MODIFY `id_tamano` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios_invitados`
--
ALTER TABLE `usuarios_invitados`
  MODIFY `id_usuario_invitado` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `historial_contenido`
--
ALTER TABLE `historial_contenido`
  ADD CONSTRAINT `historial_contenido_ibfk_1` FOREIGN KEY (`id_contenido`) REFERENCES `contenido_web` (`id_contenido`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_contenido_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`) ON DELETE SET NULL;

--
-- Filtros para la tabla `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD CONSTRAINT `metodos_pago_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedido_usuario_invitado` FOREIGN KEY (`id_usuario_invitado`) REFERENCES `usuarios_invitados` (`id_usuario_invitado`) ON DELETE SET NULL,
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`) ON DELETE SET NULL;

--
-- Filtros para la tabla `precios`
--
ALTER TABLE `precios`
  ADD CONSTRAINT `precios_ibfk_1` FOREIGN KEY (`pizza_id`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `precios_ibfk_2` FOREIGN KEY (`tamano_id`) REFERENCES `tamanos` (`id_tamano`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL;

--
-- Filtros para la tabla `recetas`
--
ALTER TABLE `recetas`
  ADD CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `recetas_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `resenas_ibfk_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `resenas_ibfk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
