-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: vps.mamamianpizza.com
-- Tiempo de generación: 29-06-2025 a las 17:05:08
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
-- Base de datos: `MamaMianPIzza`
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
  `celular` varchar(20) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id_admin`, `nombre`, `correo`, `contrasena`, `rol`, `celular`, `fecha_creacion`, `ultimo_acceso`) VALUES
(3, 'Milena Zelaya1', 'nathy.zelaya55@gmail.com', '$2b$12$OkkGSF2yjKiAX.j3ZwqbpunQchNv7vI.R8Rj2OwLEP61Rgh2IHyzq', 'super_admin', '+503 7014-1812', '2025-06-19 00:13:56', '2025-06-19 05:18:43'),
(5, 'erick tiznado', 'tiznadoerick3@gmail.com', '$2b$12$Yrlqfx3KVX2DYeA6Iuh20ODcmbRwJRDDhrhwhk9k1dIO3bjUEZp.S', 'super_admin', '+503 7014-1812', '2025-06-24 01:17:28', '2025-06-29 13:36:20');

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
(43, 40, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(44, 41, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 0, 4.00),
(45, 42, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Mediana', NULL, 1, 4.00),
(46, 43, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Gigante', NULL, 0, 4.00),
(47, 44, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Gigante', NULL, 0, 4.00),
(48, 45, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(49, 46, 8, 'Pizza de camarón', 6, 4.00, 'Tradicional', 'Personal', NULL, 1, 24.00),
(50, 47, 13, 'Hawaiana Pizza', 5, 4.00, 'Tradicional', 'Personal', NULL, 1, 20.00),
(51, 48, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(52, 49, 10, 'Quesos Suprema', 6, 4.00, NULL, NULL, NULL, 1, 24.00),
(53, 50, 10, 'Quesos Suprema', 6, 4.00, NULL, NULL, NULL, 1, 24.00),
(54, 51, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(55, 51, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(56, 52, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 0, 4.00),
(57, 53, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 0, 4.00),
(58, 54, 8, 'Pizza de camarón', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(59, 54, 9, 'Pizza de curil', 3, 4.00, 'Tradicional', 'Personal', NULL, 1, 12.00),
(60, 55, 8, 'Pizza de camarón', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(61, 55, 9, 'Pizza de curil', 3, 4.00, 'Tradicional', 'Personal', NULL, 1, 12.00),
(62, 57, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(63, 57, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(64, 57, 10, 'Quesos Suprema', 1, 4.00, NULL, NULL, NULL, 1, 4.00),
(65, 57, 11, 'Suprema Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(66, 57, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(67, 58, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(68, 58, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(69, 58, 10, 'Quesos Suprema', 1, 4.00, NULL, NULL, NULL, 1, 4.00),
(70, 58, 11, 'Suprema Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(71, 58, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(72, 59, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(73, 59, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(74, 60, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(75, 61, 8, 'Pizza de camarón', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(76, 61, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(77, 61, 10, 'Quesos Suprema', 2, 4.00, NULL, NULL, NULL, 1, 8.00),
(78, 61, 11, 'Suprema Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(79, 61, 12, 'Pepperoni Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(80, 61, 13, 'Hawaiana Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(81, 61, 13, 'Hawaiana Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(82, 62, 8, 'Pizza de camarón', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(83, 62, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(84, 62, 10, 'Quesos Suprema', 2, 4.00, NULL, NULL, NULL, 1, 8.00),
(85, 62, 11, 'Suprema Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(86, 62, 12, 'Pepperoni Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(87, 62, 13, 'Hawaiana Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(88, 62, 13, 'Hawaiana Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(89, 63, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(90, 64, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(91, 65, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(92, 66, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(93, 67, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(94, 68, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(95, 69, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(97, 71, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(98, 72, 8, 'Pizza de camarón', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(99, 73, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(100, 74, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(101, 75, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(102, 76, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(103, 77, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(104, 78, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(105, 79, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(106, 80, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(107, 81, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(108, 82, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(109, 83, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(110, 84, 12, 'Pepperoni Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(111, 85, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(112, 86, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(113, 87, 9, 'Pizza de curil', 3, 4.00, 'Tradicional', 'Personal', NULL, 0, 12.00),
(114, 88, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(115, 89, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(116, 89, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(117, 90, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(118, 91, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(119, 92, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(120, 93, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(121, 94, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(122, 95, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(123, 96, 10, 'Quesos Suprema', 3, 4.00, NULL, NULL, NULL, 1, 12.00),
(124, 96, 13, 'Hawaiana Pizza', 2, 4.00, 'Tradicional', 'Personal', NULL, 1, 8.00),
(125, 97, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(126, 98, 10, 'Quesos Suprema', 1, 4.00, NULL, NULL, NULL, 1, 4.00),
(127, 99, 10, 'Quesos Suprema', 1, 4.00, NULL, NULL, NULL, 1, 4.00),
(128, 100, 9, 'Pizza de curil', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00),
(129, 100, 10, 'Quesos Suprema', 1, 4.00, NULL, NULL, NULL, 1, 4.00),
(130, 101, 13, 'Hawaiana Pizza', 1, 4.00, 'Tradicional', 'Personal', NULL, 1, 4.00);

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
(87, 69, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(88, 71, 'Colonia Quintanilla No 2, Jiquilisco, Usulután, El Salvador', NULL, 'tiempo_real', NULL, NULL, NULL, 13.31995487, -88.57095336, 81, 'Colonia Quintanilla No 2, Jiquilisco, Usulután, El Salvador'),
(89, 72, 'CP #3417, Puerto El Triunfo, EL salvador', 'Local principal', 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(90, 69, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(91, 73, 'CP #3417, Puerto El Triunfo, EL salvador', 'Local principal', 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(92, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(93, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(94, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(95, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(96, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(97, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(98, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(99, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(100, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(101, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL),
(102, 68, 'CP #3417, Puerto El Triunfo, EL salvador', NULL, 'formulario', 'El Salvador', 'Usulután', 'Jiquilisco', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `experiencia`
--

CREATE TABLE `experiencia` (
  `id_experiencia` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `valoracion` tinyint NOT NULL COMMENT '1–5 estrellas',
  `id_usuario` int NOT NULL,
  `contenido` text NOT NULL,
  `ruta_foto` varchar(255) DEFAULT NULL COMMENT 'URL o ruta de la foto de perfil asociada',
  `aprobado` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=no visible, 1=visible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `experiencia`
--

INSERT INTO `experiencia` (`id_experiencia`, `titulo`, `valoracion`, `id_usuario`, `contenido`, `ruta_foto`, `aprobado`) VALUES
(7, 'Ambiente Familiar', 5, 69, 'excelente servicio y las pizzas deliciosas. ❤️💕', NULL, 0);

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

--
-- Volcado de datos para la tabla `logs`
--

INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(1, NULL, 'LOGIN', 'administradores', '2025-06-18 20:45:59', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(2, NULL, 'LOGIN', 'administradores', '2025-06-18 20:50:18', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(3, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-18 20:57:46', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(4, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-18 20:57:48', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(5, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-18 23:35:46', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(6, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-18 23:35:47', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(7, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-18 23:42:41', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(8, NULL, 'LOGIN', 'administradores', '2025-06-19 00:10:57', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(9, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:13:47', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(10, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:15:25', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(11, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:29:53', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(12, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:29:59', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(13, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:32:38', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(14, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:33:32', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick3@gmail.com'),
(15, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-19 00:33:50', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick3@gmail.com'),
(16, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:35:07', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(17, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:35:40', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(18, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:36:24', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(19, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:36:26', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(20, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:36:26', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(21, NULL, 'LOGIN', 'usuarios', '2025-06-19 00:37:33', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(22, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:04:26', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(23, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:14:42', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(24, NULL, 'CHANGE_PASSWORD_ADMIN', 'administradores', '2025-06-19 01:15:57', 'Cambio de contraseña exitoso para administrador: Erick Mauricio Tiznado (ID: 1, Email: tiznadoerick3@gmail.com)'),
(25, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:21:30', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(26, NULL, 'UPDATE', 'productos', '2025-06-19 01:22:14', 'Producto actualizado: \"Cheese Sticks con Salsa1111\" (ID: 3) en categoría \"pizza\" con 4 precios actualizados'),
(27, NULL, 'READ', 'productos', '2025-06-19 01:38:54', 'Menú consultado exitosamente - 12 registros encontrados'),
(28, NULL, 'READ', 'productos', '2025-06-19 01:41:26', 'Menú consultado exitosamente - 12 registros encontrados'),
(29, NULL, 'READ', 'productos', '2025-06-19 01:44:24', 'Menú consultado exitosamente - 12 registros encontrados'),
(30, NULL, 'UPDATE', 'productos', '2025-06-19 01:44:41', 'Producto actualizado: \"Cheese Sticks con Salsa1111\" (ID: 3) en categoría \"Pizza\" con 4 precios actualizados'),
(31, NULL, 'READ', 'productos', '2025-06-19 01:44:41', 'Menú consultado exitosamente - 12 registros encontrados'),
(32, NULL, 'READ', 'productos', '2025-06-19 01:44:44', 'Menú consultado exitosamente - 12 registros encontrados'),
(33, NULL, 'READ', 'productos', '2025-06-19 01:44:45', 'Menú consultado exitosamente - 12 registros encontrados'),
(34, NULL, 'READ', 'productos', '2025-06-19 01:45:00', 'Menú consultado exitosamente - 12 registros encontrados'),
(35, NULL, 'READ', 'productos', '2025-06-19 01:45:07', 'Menú consultado exitosamente - 12 registros encontrados'),
(36, NULL, 'READ', 'productos', '2025-06-19 01:45:13', 'Menú consultado exitosamente - 12 registros encontrados'),
(37, NULL, 'READ', 'productos', '2025-06-19 01:58:30', 'Menú consultado exitosamente - 12 registros encontrados'),
(38, NULL, 'READ', 'productos', '2025-06-19 01:58:30', 'Menú consultado exitosamente - 12 registros encontrados'),
(39, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:58:39', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(40, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:58:52', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(41, NULL, 'LOGIN', 'usuarios', '2025-06-19 01:59:24', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(42, NULL, 'READ', 'productos', '2025-06-19 02:01:21', 'Menú consultado exitosamente - 12 registros encontrados'),
(43, NULL, 'READ', 'productos', '2025-06-19 02:02:15', 'Menú consultado exitosamente - 12 registros encontrados'),
(44, NULL, 'READ', 'productos', '2025-06-19 02:02:15', 'Menú consultado exitosamente - 12 registros encontrados'),
(45, NULL, 'READ', 'productos', '2025-06-19 02:03:56', 'Menú consultado exitosamente - 12 registros encontrados'),
(46, NULL, 'READ', 'productos', '2025-06-19 02:03:56', 'Menú consultado exitosamente - 12 registros encontrados'),
(47, NULL, 'READ', 'productos', '2025-06-19 02:05:05', 'Menú consultado exitosamente - 12 registros encontrados'),
(48, NULL, 'READ', 'productos', '2025-06-19 02:05:05', 'Menú consultado exitosamente - 12 registros encontrados'),
(49, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:07:48', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(50, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:14:53', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(51, NULL, 'READ', 'productos', '2025-06-19 02:17:43', 'Menú consultado exitosamente - 12 registros encontrados'),
(52, NULL, 'READ', 'productos', '2025-06-19 02:17:43', 'Menú consultado exitosamente - 12 registros encontrados'),
(53, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:17:57', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(54, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:18:07', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(55, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:20:00', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(56, NULL, 'READ', 'productos', '2025-06-19 02:20:08', 'Menú consultado exitosamente - 12 registros encontrados'),
(57, NULL, 'READ', 'productos', '2025-06-19 02:20:08', 'Menú consultado exitosamente - 12 registros encontrados'),
(58, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:21:08', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(59, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:22:50', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(60, NULL, 'READ', 'productos', '2025-06-19 02:23:05', 'Menú consultado exitosamente - 12 registros encontrados'),
(61, NULL, 'READ', 'productos', '2025-06-19 02:23:05', 'Menú consultado exitosamente - 12 registros encontrados'),
(62, NULL, 'READ', 'productos', '2025-06-19 02:23:24', 'Menú consultado exitosamente - 12 registros encontrados'),
(63, NULL, 'READ', 'productos', '2025-06-19 02:23:24', 'Menú consultado exitosamente - 12 registros encontrados'),
(64, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:24:11', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(65, NULL, 'READ', 'productos', '2025-06-19 02:24:30', 'Menú consultado exitosamente - 12 registros encontrados'),
(66, NULL, 'READ', 'productos', '2025-06-19 02:24:30', 'Menú consultado exitosamente - 12 registros encontrados'),
(67, NULL, 'READ', 'productos', '2025-06-19 02:27:01', 'Menú consultado exitosamente - 12 registros encontrados'),
(68, NULL, 'READ', 'productos', '2025-06-19 02:27:33', 'Menú consultado exitosamente - 12 registros encontrados'),
(69, NULL, 'READ', 'productos', '2025-06-19 02:27:33', 'Menú consultado exitosamente - 12 registros encontrados'),
(70, NULL, 'READ', 'productos', '2025-06-19 02:27:57', 'Menú consultado exitosamente - 12 registros encontrados'),
(71, NULL, 'READ', 'productos', '2025-06-19 02:27:57', 'Menú consultado exitosamente - 12 registros encontrados'),
(72, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:29:59', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(73, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:35:15', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(74, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:27', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(75, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:29', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(76, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:31', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(77, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:33', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(78, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:34', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(79, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:43:35', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(80, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:45:39', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(81, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:46:27', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(82, NULL, 'READ', 'productos', '2025-06-19 02:47:34', 'Menú consultado exitosamente - 12 registros encontrados'),
(83, NULL, 'READ', 'productos', '2025-06-19 02:47:35', 'Menú consultado exitosamente - 12 registros encontrados'),
(84, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:50:48', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(85, NULL, 'READ', 'productos', '2025-06-19 02:52:04', 'Menú consultado exitosamente - 12 registros encontrados'),
(86, NULL, 'READ', 'productos', '2025-06-19 02:52:04', 'Menú consultado exitosamente - 12 registros encontrados'),
(87, NULL, 'READ', 'productos', '2025-06-19 02:52:21', 'Menú consultado exitosamente - 12 registros encontrados'),
(88, NULL, 'READ', 'productos', '2025-06-19 02:52:21', 'Menú consultado exitosamente - 12 registros encontrados'),
(89, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:52:25', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(90, NULL, 'LOGIN', 'usuarios', '2025-06-19 02:53:15', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(91, NULL, 'LOGIN', 'usuarios', '2025-06-19 03:17:45', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(92, NULL, 'LOGIN', 'usuarios', '2025-06-19 03:17:53', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(93, NULL, 'READ', 'productos', '2025-06-19 03:18:17', 'Menú consultado exitosamente - 12 registros encontrados'),
(94, NULL, 'READ', 'productos', '2025-06-19 03:18:17', 'Menú consultado exitosamente - 12 registros encontrados'),
(95, NULL, 'LOGIN', 'usuarios', '2025-06-19 03:18:34', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(96, NULL, 'LOGIN', 'usuarios', '2025-06-19 03:59:50', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(97, NULL, 'LOGIN', 'usuarios', '2025-06-19 03:59:59', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(98, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:00:42', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(99, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:02:00', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(100, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:02:18', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(101, NULL, 'READ', 'productos', '2025-06-19 04:03:41', 'Menú consultado exitosamente - 12 registros encontrados'),
(102, NULL, 'READ', 'productos', '2025-06-19 04:07:14', 'Menú consultado exitosamente - 12 registros encontrados'),
(103, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:08:07', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(104, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:08:16', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(105, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:08:44', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(106, NULL, 'READ', 'productos', '2025-06-19 04:10:12', 'Menú consultado exitosamente - 12 registros encontrados'),
(107, NULL, 'READ', 'productos', '2025-06-19 04:12:22', 'Menú consultado exitosamente - 12 registros encontrados'),
(108, NULL, 'READ', 'productos', '2025-06-19 04:12:43', 'Menú consultado exitosamente - 12 registros encontrados'),
(109, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:13:05', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(110, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:13:29', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(111, NULL, 'READ', 'productos', '2025-06-19 04:14:34', 'Menú consultado exitosamente - 12 registros encontrados'),
(112, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:14:49', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(113, NULL, 'READ', 'productos', '2025-06-19 04:17:57', 'Menú consultado exitosamente - 12 registros encontrados'),
(114, NULL, 'READ', 'productos', '2025-06-19 04:17:57', 'Menú consultado exitosamente - 12 registros encontrados'),
(115, NULL, 'READ', 'productos', '2025-06-19 04:22:31', 'Menú consultado exitosamente - 12 registros encontrados'),
(116, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:33:11', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(117, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:33:13', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(118, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:34:23', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(119, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:34:35', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(120, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:43:55', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(121, NULL, 'READ', 'productos', '2025-06-19 04:44:39', 'Menú consultado exitosamente - 12 registros encontrados'),
(122, NULL, 'READ', 'productos', '2025-06-19 04:44:39', 'Menú consultado exitosamente - 12 registros encontrados'),
(123, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:45:15', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(124, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:45:56', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(125, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:46:44', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(126, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:47:13', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(127, NULL, 'READ', 'productos', '2025-06-19 04:48:01', 'Menú consultado exitosamente - 12 registros encontrados'),
(128, NULL, 'READ', 'productos', '2025-06-19 04:48:01', 'Menú consultado exitosamente - 12 registros encontrados'),
(129, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:48:10', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(130, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:50:35', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(131, NULL, 'READ', 'productos', '2025-06-19 04:51:11', 'Menú consultado exitosamente - 12 registros encontrados'),
(132, NULL, 'READ', 'productos', '2025-06-19 04:51:11', 'Menú consultado exitosamente - 12 registros encontrados'),
(133, NULL, 'LOGIN', 'usuarios', '2025-06-19 04:59:07', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(134, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:00:18', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(135, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:00:31', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(136, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:00:51', 'Inicio de sesión exitoso del usuario: Jose (alex1@gmail.com)'),
(137, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:02:28', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(138, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:02:30', 'Inicio de sesión exitoso del usuario: Jose (alex2@gmail.com)'),
(139, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:02:34', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(140, NULL, 'READ', 'productos', '2025-06-19 05:02:41', 'Menú consultado exitosamente - 12 registros encontrados'),
(141, NULL, 'READ', 'productos', '2025-06-19 05:02:41', 'Menú consultado exitosamente - 12 registros encontrados'),
(142, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:03:06', 'Inicio de sesión exitoso del usuario: Jose (alex2@gmail.com)'),
(143, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:03:11', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(144, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:03:34', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(145, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:03:52', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(146, NULL, 'READ', 'productos', '2025-06-19 05:03:55', 'Menú consultado exitosamente - 12 registros encontrados'),
(147, NULL, 'READ', 'productos', '2025-06-19 05:03:55', 'Menú consultado exitosamente - 12 registros encontrados'),
(148, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:04:15', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(149, NULL, 'READ', 'productos', '2025-06-19 05:05:45', 'Menú consultado exitosamente - 12 registros encontrados'),
(150, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:06:30', 'Inicio de sesión exitoso del usuario: Jose (alex2@gmail.com)'),
(151, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:06:31', 'Inicio de sesión exitoso del usuario: Jose (alex2@gmail.com)'),
(152, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-19 05:06:52', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(153, NULL, 'LOGIN', 'administradores', '2025-06-19 05:08:10', 'Inicio de sesión exitoso del administrador: Milena Zelaya1 (nathy.zelaya55@gmail.com) - Rol: super_admin'),
(154, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:08:11', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(155, NULL, 'READ', 'productos', '2025-06-19 05:08:15', 'Menú consultado exitosamente - 12 registros encontrados'),
(156, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:08:35', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(157, NULL, 'READ', 'productos', '2025-06-19 05:08:52', 'Menú consultado exitosamente - 12 registros encontrados'),
(158, NULL, 'READ', 'productos', '2025-06-19 05:08:52', 'Menú consultado exitosamente - 12 registros encontrados'),
(159, NULL, 'READ', 'productos', '2025-06-19 05:11:22', 'Menú consultado exitosamente - 12 registros encontrados'),
(160, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:11:42', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(161, NULL, 'CREATE', 'productos', '2025-06-19 05:11:52', 'Producto creado: \"2342342\" (ID: 6) en categoría \"pizza\" con 4 precios configurados'),
(162, NULL, 'READ', 'productos', '2025-06-19 05:11:52', 'Menú consultado exitosamente - 16 registros encontrados'),
(163, NULL, 'DELETE', 'productos', '2025-06-19 05:12:10', 'Producto eliminado (ID: 6) junto con 4 precios asociados'),
(164, NULL, 'DELETE', 'productos', '2025-06-19 05:12:14', 'Producto eliminado (ID: 3) junto con 4 precios asociados'),
(165, NULL, 'DELETE', 'productos', '2025-06-19 05:12:16', 'Producto eliminado (ID: 4) junto con 4 precios asociados'),
(166, NULL, 'DELETE', 'productos', '2025-06-19 05:12:17', 'Producto eliminado (ID: 5) junto con 4 precios asociados'),
(167, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:12:39', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(168, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:13:57', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(169, NULL, 'READ', 'productos', '2025-06-19 05:14:13', 'Menú consultado exitosamente - 0 registros encontrados'),
(170, NULL, 'READ', 'productos', '2025-06-19 05:14:13', 'Menú consultado exitosamente - 0 registros encontrados'),
(171, NULL, 'CREATE', 'productos', '2025-06-19 05:14:32', 'Producto creado: \"Pizza de curil\" (ID: 7) en categoría \"pizza\" con 4 precios configurados'),
(172, NULL, 'READ', 'productos', '2025-06-19 05:14:32', 'Menú consultado exitosamente - 4 registros encontrados'),
(173, NULL, 'UPDATE', 'productos', '2025-06-19 05:14:55', 'Producto actualizado: \"Pizza de curil\" (ID: 7) en categoría \"Pizza\" con 4 precios actualizados'),
(174, NULL, 'READ', 'productos', '2025-06-19 05:14:55', 'Menú consultado exitosamente - 4 registros encontrados'),
(175, NULL, 'READ', 'productos', '2025-06-19 05:15:00', 'Menú consultado exitosamente - 4 registros encontrados'),
(176, NULL, 'DELETE', 'productos', '2025-06-19 05:15:34', 'Producto eliminado (ID: 7) junto con 4 precios asociados'),
(177, NULL, 'CREATE', 'productos', '2025-06-19 05:16:16', 'Producto creado: \"Pizza de camarón\" (ID: 8) en categoría \"pizza\" con 4 precios configurados'),
(178, NULL, 'READ', 'productos', '2025-06-19 05:16:16', 'Menú consultado exitosamente - 4 registros encontrados'),
(179, NULL, 'UPDATE', 'productos', '2025-06-19 05:17:02', 'Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(180, NULL, 'READ', 'productos', '2025-06-19 05:17:02', 'Menú consultado exitosamente - 4 registros encontrados'),
(181, NULL, 'UPDATE', 'productos', '2025-06-19 05:17:08', 'Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(182, NULL, 'READ', 'productos', '2025-06-19 05:17:08', 'Menú consultado exitosamente - 4 registros encontrados'),
(183, NULL, 'READ', 'productos', '2025-06-19 05:17:14', 'Menú consultado exitosamente - 4 registros encontrados'),
(184, NULL, 'READ', 'productos', '2025-06-19 05:17:32', 'Menú consultado exitosamente - 4 registros encontrados'),
(185, NULL, 'READ', 'productos', '2025-06-19 05:17:38', 'Menú consultado exitosamente - 4 registros encontrados'),
(186, NULL, 'READ', 'productos', '2025-06-19 05:18:26', 'Menú consultado exitosamente - 4 registros encontrados'),
(187, NULL, 'READ', 'productos', '2025-06-19 05:18:26', 'Menú consultado exitosamente - 4 registros encontrados'),
(188, NULL, 'READ', 'productos', '2025-06-19 05:18:33', 'Menú consultado exitosamente - 4 registros encontrados'),
(189, NULL, 'READ', 'productos', '2025-06-19 05:18:33', 'Menú consultado exitosamente - 4 registros encontrados'),
(190, NULL, 'LOGIN', 'administradores', '2025-06-19 05:18:43', 'Inicio de sesión exitoso del administrador: Milena Zelaya1 (nathy.zelaya55@gmail.com) - Rol: super_admin'),
(191, NULL, 'READ', 'productos', '2025-06-19 05:18:44', 'Menú consultado exitosamente - 4 registros encontrados'),
(192, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:18:59', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(193, NULL, 'UPDATE', 'productos', '2025-06-19 05:19:04', 'Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"pizza\" con 4 precios actualizados'),
(194, NULL, 'READ', 'productos', '2025-06-19 05:19:04', 'Menú consultado exitosamente - 4 registros encontrados'),
(195, NULL, 'READ', 'productos', '2025-06-19 05:19:23', 'Menú consultado exitosamente - 4 registros encontrados'),
(196, NULL, 'READ', 'productos', '2025-06-19 05:19:23', 'Menú consultado exitosamente - 4 registros encontrados'),
(197, NULL, 'READ', 'productos', '2025-06-19 05:19:25', 'Menú consultado exitosamente - 4 registros encontrados'),
(198, NULL, 'UPDATE', 'productos', '2025-06-19 05:19:44', 'Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"pizza\" con 4 precios actualizados'),
(199, NULL, 'READ', 'productos', '2025-06-19 05:19:44', 'Menú consultado exitosamente - 4 registros encontrados'),
(200, NULL, 'READ', 'productos', '2025-06-19 05:20:10', 'Menú consultado exitosamente - 4 registros encontrados'),
(201, NULL, 'CREATE', 'productos', '2025-06-19 05:22:19', 'Producto creado: \"Pizza de curil\" (ID: 9) en categoría \"pizza\" con 4 precios configurados'),
(202, NULL, 'READ', 'productos', '2025-06-19 05:22:20', 'Menú consultado exitosamente - 8 registros encontrados'),
(203, NULL, 'UPDATE', 'productos', '2025-06-19 05:24:39', 'Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"pizza\" con 4 precios actualizados'),
(204, NULL, 'READ', 'productos', '2025-06-19 05:24:39', 'Menú consultado exitosamente - 8 registros encontrados'),
(205, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:25:10', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(206, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:25:16', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(207, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:25:29', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(208, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:28:39', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(209, NULL, 'READ', 'productos', '2025-06-19 05:30:06', 'Menú consultado exitosamente - 8 registros encontrados'),
(210, NULL, 'CREATE', 'productos', '2025-06-19 05:31:21', 'Producto creado: \"Quesos Suprema\" (ID: 10) en categoría \"pizza\" con 4 precios configurados'),
(211, NULL, 'READ', 'productos', '2025-06-19 05:31:21', 'Menú consultado exitosamente - 12 registros encontrados'),
(212, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:31:21', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(213, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:31:54', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(214, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:02', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(215, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:14', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(216, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:21', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(217, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:30', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(218, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:31', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(219, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:39', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(220, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:32:42', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(221, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:33:36', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(222, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:33:56', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(223, NULL, 'CREATE', 'productos', '2025-06-19 05:35:20', 'Producto creado: \"Suprema Pizza\" (ID: 11) en categoría \"pizza\" con 4 precios configurados'),
(224, NULL, 'READ', 'productos', '2025-06-19 05:35:20', 'Menú consultado exitosamente - 16 registros encontrados'),
(225, NULL, 'CREATE', 'productos', '2025-06-19 05:36:52', 'Producto creado: \"Pepperoni Pizza\" (ID: 12) en categoría \"pizza\" con 4 precios configurados'),
(226, NULL, 'READ', 'productos', '2025-06-19 05:36:52', 'Menú consultado exitosamente - 20 registros encontrados'),
(227, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:37:25', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(228, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:38:05', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(229, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:38:25', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(230, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:38:50', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(231, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:39:08', 'Inicio de sesión exitoso del usuario: Mauricios (tiznadoerick53@gmail.com)'),
(232, NULL, 'CREATE', 'productos', '2025-06-19 05:41:39', 'Producto creado: \"Hawaiana Pizza\" (ID: 13) en categoría \"pizza\" con 4 precios configurados'),
(233, NULL, 'READ', 'productos', '2025-06-19 05:41:40', 'Menú consultado exitosamente - 24 registros encontrados'),
(234, NULL, 'READ', 'productos', '2025-06-19 05:41:52', 'Menú consultado exitosamente - 24 registros encontrados'),
(235, NULL, 'READ', 'productos', '2025-06-19 05:41:52', 'Menú consultado exitosamente - 24 registros encontrados'),
(236, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:44:05', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(237, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:46:17', 'Inicio de sesión exitoso del usuario: Mauricios (tiznadoerick53@gmail.com)'),
(238, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:50:17', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(239, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:50:39', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(240, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:52:00', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(241, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:53:01', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(242, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:53:59', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(243, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:54:44', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(244, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:56:53', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(245, NULL, 'LOGIN', 'usuarios', '2025-06-19 05:57:43', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(246, NULL, 'LOGIN', 'usuarios', '2025-06-19 06:02:46', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(247, NULL, 'LOGIN', 'usuarios', '2025-06-19 06:03:34', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(248, NULL, 'LOGIN', 'usuarios', '2025-06-19 06:04:25', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(249, NULL, 'LOGIN', 'usuarios', '2025-06-19 12:02:49', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(250, NULL, 'READ', 'productos', '2025-06-19 12:03:11', 'Menú consultado exitosamente - 24 registros encontrados'),
(251, NULL, 'READ', 'productos', '2025-06-19 12:03:11', 'Menú consultado exitosamente - 24 registros encontrados'),
(252, NULL, 'READ', 'productos', '2025-06-19 13:19:39', 'Menú consultado exitosamente - 24 registros encontrados'),
(253, NULL, 'LOGIN', 'usuarios', '2025-06-19 13:20:01', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(254, NULL, 'READ', 'productos', '2025-06-19 14:22:46', 'Menú consultado exitosamente - 24 registros encontrados'),
(255, NULL, 'READ', 'productos', '2025-06-19 14:31:10', 'Menú consultado exitosamente - 24 registros encontrados'),
(256, NULL, 'READ', 'productos', '2025-06-19 14:31:10', 'Menú consultado exitosamente - 24 registros encontrados'),
(257, NULL, 'READ', 'productos', '2025-06-19 14:31:30', 'Menú consultado exitosamente - 24 registros encontrados'),
(258, NULL, 'READ', 'productos', '2025-06-19 14:31:30', 'Menú consultado exitosamente - 24 registros encontrados'),
(259, NULL, 'READ', 'productos', '2025-06-19 14:31:38', 'Menú consultado exitosamente - 24 registros encontrados'),
(260, NULL, 'READ', 'productos', '2025-06-19 14:31:38', 'Menú consultado exitosamente - 24 registros encontrados'),
(261, NULL, 'READ', 'productos', '2025-06-19 14:31:54', 'Menú consultado exitosamente - 24 registros encontrados'),
(262, NULL, 'READ', 'productos', '2025-06-19 14:31:54', 'Menú consultado exitosamente - 24 registros encontrados'),
(263, NULL, 'READ', 'productos', '2025-06-19 14:31:55', 'Menú consultado exitosamente - 24 registros encontrados'),
(264, NULL, 'READ', 'productos', '2025-06-19 14:32:33', 'Menú consultado exitosamente - 24 registros encontrados'),
(265, NULL, 'READ', 'productos', '2025-06-19 14:32:33', 'Menú consultado exitosamente - 24 registros encontrados'),
(266, NULL, 'READ', 'productos', '2025-06-19 14:32:56', 'Menú consultado exitosamente - 24 registros encontrados'),
(267, NULL, 'READ', 'productos', '2025-06-19 14:32:56', 'Menú consultado exitosamente - 24 registros encontrados'),
(268, NULL, 'READ', 'productos', '2025-06-19 14:33:07', 'Menú consultado exitosamente - 24 registros encontrados'),
(269, NULL, 'READ', 'productos', '2025-06-19 14:33:07', 'Menú consultado exitosamente - 24 registros encontrados'),
(270, NULL, 'READ', 'productos', '2025-06-19 14:33:32', 'Menú consultado exitosamente - 24 registros encontrados'),
(271, NULL, 'READ', 'productos', '2025-06-19 14:33:32', 'Menú consultado exitosamente - 24 registros encontrados'),
(272, NULL, 'READ', 'productos', '2025-06-19 14:34:16', 'Menú consultado exitosamente - 24 registros encontrados'),
(273, NULL, 'READ', 'productos', '2025-06-19 14:34:16', 'Menú consultado exitosamente - 24 registros encontrados'),
(274, NULL, 'READ', 'productos', '2025-06-19 14:34:46', 'Menú consultado exitosamente - 24 registros encontrados'),
(275, NULL, 'READ', 'productos', '2025-06-19 14:34:47', 'Menú consultado exitosamente - 24 registros encontrados'),
(276, NULL, 'READ', 'productos', '2025-06-19 14:34:52', 'Menú consultado exitosamente - 24 registros encontrados'),
(277, NULL, 'READ', 'productos', '2025-06-19 14:34:52', 'Menú consultado exitosamente - 24 registros encontrados'),
(278, NULL, 'READ', 'productos', '2025-06-19 14:35:06', 'Menú consultado exitosamente - 24 registros encontrados'),
(279, NULL, 'READ', 'productos', '2025-06-19 14:35:06', 'Menú consultado exitosamente - 24 registros encontrados'),
(280, NULL, 'READ', 'productos', '2025-06-19 14:35:18', 'Menú consultado exitosamente - 24 registros encontrados'),
(281, NULL, 'READ', 'productos', '2025-06-19 14:35:18', 'Menú consultado exitosamente - 24 registros encontrados'),
(282, NULL, 'READ', 'productos', '2025-06-19 14:35:30', 'Menú consultado exitosamente - 24 registros encontrados'),
(283, NULL, 'READ', 'productos', '2025-06-19 14:35:30', 'Menú consultado exitosamente - 24 registros encontrados'),
(284, NULL, 'READ', 'productos', '2025-06-19 14:35:48', 'Menú consultado exitosamente - 24 registros encontrados'),
(285, NULL, 'READ', 'productos', '2025-06-19 14:35:49', 'Menú consultado exitosamente - 24 registros encontrados'),
(286, NULL, 'READ', 'productos', '2025-06-19 14:36:11', 'Menú consultado exitosamente - 24 registros encontrados'),
(287, NULL, 'READ', 'productos', '2025-06-19 14:36:11', 'Menú consultado exitosamente - 24 registros encontrados'),
(288, NULL, 'READ', 'productos', '2025-06-19 14:37:37', 'Menú consultado exitosamente - 24 registros encontrados'),
(289, NULL, 'READ', 'productos', '2025-06-19 14:37:37', 'Menú consultado exitosamente - 24 registros encontrados'),
(290, NULL, 'READ', 'productos', '2025-06-19 14:39:02', 'Menú consultado exitosamente - 24 registros encontrados'),
(291, NULL, 'READ', 'productos', '2025-06-19 14:39:02', 'Menú consultado exitosamente - 24 registros encontrados'),
(292, NULL, 'READ', 'productos', '2025-06-19 14:39:09', 'Menú consultado exitosamente - 24 registros encontrados'),
(293, NULL, 'READ', 'productos', '2025-06-19 14:39:09', 'Menú consultado exitosamente - 24 registros encontrados'),
(294, NULL, 'READ', 'productos', '2025-06-19 14:39:12', 'Menú consultado exitosamente - 24 registros encontrados'),
(295, NULL, 'READ', 'productos', '2025-06-19 14:39:13', 'Menú consultado exitosamente - 24 registros encontrados'),
(296, NULL, 'READ', 'productos', '2025-06-19 14:40:22', 'Menú consultado exitosamente - 24 registros encontrados'),
(297, NULL, 'READ', 'productos', '2025-06-19 14:40:22', 'Menú consultado exitosamente - 24 registros encontrados'),
(298, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-19 15:01:15', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(299, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-19 15:01:17', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(300, NULL, 'LOGIN', 'administradores', '2025-06-19 15:01:21', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(301, NULL, 'LOGIN', 'administradores', '2025-06-19 15:03:45', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(302, NULL, 'READ', 'productos', '2025-06-19 15:13:32', 'Menú consultado exitosamente - 24 registros encontrados'),
(303, NULL, 'READ', 'productos', '2025-06-19 15:13:32', 'Menú consultado exitosamente - 24 registros encontrados'),
(304, NULL, 'READ', 'productos', '2025-06-19 15:14:04', 'Menú consultado exitosamente - 24 registros encontrados'),
(305, NULL, 'READ', 'productos', '2025-06-19 15:14:04', 'Menú consultado exitosamente - 24 registros encontrados'),
(306, NULL, 'LOGIN', 'usuarios', '2025-06-19 15:15:59', 'Inicio de sesión exitoso del usuario: José Alexander  (coxin94240@nab4.com)'),
(307, NULL, 'LOGIN', 'usuarios', '2025-06-19 15:16:42', 'Inicio de sesión exitoso del usuario: José Alexander (coxin94240@nab4.com)'),
(308, NULL, 'LOGIN', 'usuarios', '2025-06-19 15:28:29', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(309, NULL, 'LOGIN', 'usuarios', '2025-06-19 15:29:16', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(310, NULL, 'LOGIN', 'administradores', '2025-06-19 16:01:35', 'Inicio de sesión exitoso del administrador: Erick Mauricio Tiznado (tiznadoerick3@gmail.com) - Rol: super_admin'),
(311, NULL, 'READ', 'productos', '2025-06-19 16:08:04', 'Menú consultado exitosamente - 24 registros encontrados'),
(312, NULL, 'LOGIN', 'usuarios', '2025-06-19 18:43:01', 'Inicio de sesión exitoso del usuario: Jose (alex3@gmail.com)'),
(313, NULL, 'READ', 'productos', '2025-06-19 18:43:04', 'Menú consultado exitosamente - 24 registros encontrados'),
(314, NULL, 'READ', 'productos', '2025-06-19 18:43:04', 'Menú consultado exitosamente - 24 registros encontrados'),
(316, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:14:17', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(317, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:29:51', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(318, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:45:17', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(319, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:56:48', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(320, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:56:49', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(321, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:56:50', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(322, NULL, 'LOGIN', 'usuarios', '2025-06-20 20:57:10', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(323, NULL, 'LOGIN', 'usuarios', '2025-06-20 21:13:30', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(324, NULL, 'LOGIN', 'usuarios', '2025-06-20 21:15:41', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(325, NULL, 'LOGIN', 'usuarios', '2025-06-20 21:16:11', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(326, NULL, 'LOGIN', 'usuarios', '2025-06-20 21:31:01', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(327, NULL, 'LOGIN', 'usuarios', '2025-06-20 21:42:33', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(328, NULL, 'READ', 'productos', '2025-06-21 01:08:51', 'Menú consultado exitosamente - 24 registros encontrados'),
(329, NULL, 'READ', 'productos', '2025-06-21 01:08:51', 'Menú consultado exitosamente - 24 registros encontrados'),
(330, NULL, 'LOGIN', 'usuarios', '2025-06-21 17:42:47', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(331, NULL, 'LOGIN', 'usuarios', '2025-06-21 17:48:17', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(332, NULL, 'LOGIN', 'usuarios', '2025-06-21 17:54:39', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(333, NULL, 'LOGIN', 'usuarios', '2025-06-21 18:09:55', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(334, NULL, 'LOGIN', 'usuarios', '2025-06-21 20:13:52', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(335, NULL, 'LOGIN', 'usuarios', '2025-06-21 20:28:33', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(336, NULL, 'LOGIN', 'usuarios', '2025-06-21 21:16:45', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(337, NULL, 'READ', 'productos', '2025-06-21 21:16:46', 'Menú consultado exitosamente - 24 registros encontrados'),
(338, NULL, 'READ', 'productos', '2025-06-21 21:16:46', 'Menú consultado exitosamente - 24 registros encontrados'),
(339, NULL, 'LOGIN', 'usuarios', '2025-06-21 21:17:00', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(340, NULL, 'READ', 'productos', '2025-06-21 21:17:02', 'Menú consultado exitosamente - 24 registros encontrados'),
(341, NULL, 'READ', 'productos', '2025-06-21 21:17:02', 'Menú consultado exitosamente - 24 registros encontrados'),
(342, NULL, 'LOGIN', 'usuarios', '2025-06-21 21:38:33', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(343, NULL, 'READ', 'productos', '2025-06-21 21:44:13', 'Menú consultado exitosamente - 24 registros encontrados'),
(344, NULL, 'READ', 'productos', '2025-06-21 21:44:13', 'Menú consultado exitosamente - 24 registros encontrados'),
(345, NULL, 'LOGIN', 'usuarios', '2025-06-21 21:50:12', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(346, NULL, 'LOGIN', 'usuarios', '2025-06-21 21:53:47', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(347, NULL, 'READ', 'productos', '2025-06-21 22:07:44', 'Menú consultado exitosamente - 24 registros encontrados'),
(348, NULL, 'READ', 'productos', '2025-06-21 22:07:44', 'Menú consultado exitosamente - 24 registros encontrados'),
(349, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:20:52', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(350, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:25:22', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(351, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:28:22', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(352, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:52:55', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(353, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:53:58', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(354, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:56:14', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(355, NULL, 'LOGIN', 'usuarios', '2025-06-21 22:57:29', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(356, NULL, 'LOGIN', 'usuarios', '2025-06-21 23:36:26', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(357, NULL, 'LOGIN', 'usuarios', '2025-06-21 23:50:26', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(358, NULL, 'LOGIN', 'usuarios', '2025-06-22 00:57:20', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(359, NULL, 'LOGIN', 'usuarios', '2025-06-22 01:17:19', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(360, NULL, 'LOGIN', 'usuarios', '2025-06-22 01:59:31', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(361, NULL, 'LOGIN', 'usuarios', '2025-06-22 02:03:47', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(362, NULL, 'LOGIN', 'usuarios', '2025-06-22 02:08:39', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(363, NULL, 'LOGIN', 'usuarios', '2025-06-22 02:14:49', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(364, NULL, 'LOGIN', 'usuarios', '2025-06-22 02:39:52', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(365, NULL, 'LOGIN', 'usuarios', '2025-06-22 03:09:46', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(366, NULL, 'LOGIN', 'usuarios', '2025-06-22 03:15:47', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(367, NULL, 'LOGIN', 'usuarios', '2025-06-22 03:48:39', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(368, NULL, 'READ', 'productos', '2025-06-22 07:24:38', 'Menú consultado exitosamente - 24 registros encontrados'),
(369, NULL, 'READ', 'productos', '2025-06-22 07:24:39', 'Menú consultado exitosamente - 24 registros encontrados'),
(370, NULL, 'LOGIN', 'usuarios', '2025-06-22 19:48:38', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(371, NULL, 'LOGIN', 'usuarios', '2025-06-22 19:55:08', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(372, NULL, 'LOGIN', 'usuarios', '2025-06-22 19:58:32', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(373, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-22 20:02:43', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick3@gmail.com'),
(374, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-22 20:02:45', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick3@gmail.com'),
(375, NULL, 'LOGIN', 'usuarios', '2025-06-22 20:02:53', 'Inicio de sesión exitoso del usuario: Erick Mauricio  (tiznadoerick3@gmail.com)'),
(376, NULL, 'LOGIN', 'usuarios', '2025-06-22 20:03:00', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(377, NULL, 'READ', 'productos', '2025-06-22 21:36:12', 'Menú consultado exitosamente - 24 registros encontrados'),
(378, NULL, 'READ', 'productos', '2025-06-22 21:36:12', 'Menú consultado exitosamente - 24 registros encontrados'),
(379, NULL, 'LOGIN', 'usuarios', '2025-06-22 22:09:38', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(380, NULL, 'LOGIN', 'usuarios', '2025-06-22 22:16:16', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(381, NULL, 'LOGIN', 'usuarios', '2025-06-22 22:18:50', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(382, NULL, 'READ', 'productos', '2025-06-23 01:00:46', 'Menú consultado exitosamente - 24 registros encontrados'),
(383, NULL, 'CREATE', 'productos', '2025-06-23 01:01:13', 'Producto creado: \"Pruba\" (ID: 14) en categoría \"pizza\" con 4 precios configurados'),
(384, NULL, 'READ', 'productos', '2025-06-23 01:01:13', 'Menú consultado exitosamente - 28 registros encontrados'),
(385, NULL, 'LOGIN', 'usuarios', '2025-06-23 17:35:33', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(386, NULL, 'READ', 'productos', '2025-06-23 17:48:01', 'Menú consultado exitosamente - 28 registros encontrados'),
(387, NULL, 'DELETE', 'productos', '2025-06-23 17:48:07', 'Producto eliminado (ID: 14) junto con 4 precios asociados'),
(388, NULL, 'LOGIN', 'usuarios', '2025-06-23 18:04:44', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(389, NULL, 'READ', 'productos', '2025-06-23 18:04:46', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(390, NULL, 'READ', 'productos', '2025-06-23 18:04:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(391, NULL, 'READ', 'productos', '2025-06-23 18:04:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(392, NULL, 'READ', 'productos', '2025-06-23 18:04:47', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(393, NULL, 'LOGIN', 'usuarios', '2025-06-23 18:07:05', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(394, NULL, 'READ', 'productos', '2025-06-23 18:07:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(395, NULL, 'READ', 'productos', '2025-06-23 18:07:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(396, NULL, 'READ', 'productos', '2025-06-23 18:07:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(397, NULL, 'READ', 'productos', '2025-06-23 18:07:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(398, NULL, 'LOGIN', 'usuarios', '2025-06-23 18:25:07', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(399, NULL, 'READ', 'productos', '2025-06-23 18:25:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(400, NULL, 'READ', 'productos', '2025-06-23 18:25:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(401, NULL, 'READ', 'productos', '2025-06-23 18:25:10', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(402, NULL, 'READ', 'productos', '2025-06-23 18:25:10', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(403, NULL, 'LOGIN', 'usuarios', '2025-06-23 18:53:23', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(404, NULL, 'READ', 'productos', '2025-06-23 18:53:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(405, NULL, 'READ', 'productos', '2025-06-23 18:53:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(406, NULL, 'READ', 'productos', '2025-06-23 18:53:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(407, NULL, 'READ', 'productos', '2025-06-23 18:53:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(408, NULL, 'READ', 'productos', '2025-06-23 18:59:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(409, NULL, 'READ', 'productos', '2025-06-23 18:59:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(410, NULL, 'READ', 'productos', '2025-06-23 18:59:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(411, NULL, 'READ', 'productos', '2025-06-23 18:59:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(412, NULL, 'LOGIN', 'usuarios', '2025-06-23 18:59:58', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(413, NULL, 'READ', 'productos', '2025-06-23 18:59:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(414, NULL, 'READ', 'productos', '2025-06-23 18:59:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(415, NULL, 'READ', 'productos', '2025-06-23 18:59:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(416, NULL, 'READ', 'productos', '2025-06-23 18:59:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(417, NULL, 'READ', 'productos', '2025-06-23 19:02:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(418, NULL, 'READ', 'productos', '2025-06-23 19:02:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(419, NULL, 'READ', 'productos', '2025-06-23 19:02:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(420, NULL, 'READ', 'productos', '2025-06-23 19:02:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(421, NULL, 'READ', 'productos', '2025-06-23 19:03:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(422, NULL, 'READ', 'productos', '2025-06-23 19:03:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(423, NULL, 'READ', 'productos', '2025-06-23 19:03:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(424, NULL, 'READ', 'productos', '2025-06-23 19:03:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(425, NULL, 'READ', 'productos', '2025-06-23 19:10:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(426, NULL, 'READ', 'productos', '2025-06-23 19:10:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(427, NULL, 'READ', 'productos', '2025-06-23 19:10:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(428, NULL, 'READ', 'productos', '2025-06-23 19:10:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(429, NULL, 'READ', 'productos', '2025-06-23 19:10:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(430, NULL, 'READ', 'productos', '2025-06-23 19:10:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(431, NULL, 'READ', 'productos', '2025-06-23 19:10:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(432, NULL, 'READ', 'productos', '2025-06-23 19:10:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(433, NULL, 'READ', 'productos', '2025-06-23 19:12:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(434, NULL, 'READ', 'productos', '2025-06-23 19:12:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(435, NULL, 'READ', 'productos', '2025-06-23 19:12:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(436, NULL, 'READ', 'productos', '2025-06-23 19:12:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(437, NULL, 'READ', 'productos', '2025-06-23 19:22:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(438, NULL, 'READ', 'productos', '2025-06-23 19:22:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(439, NULL, 'READ', 'productos', '2025-06-23 19:22:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(440, NULL, 'READ', 'productos', '2025-06-23 19:22:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(441, NULL, 'READ', 'productos', '2025-06-23 19:22:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(442, NULL, 'READ', 'productos', '2025-06-23 19:22:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(443, NULL, 'READ', 'productos', '2025-06-23 19:22:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(444, NULL, 'READ', 'productos', '2025-06-23 19:22:49', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(445, NULL, 'READ', 'productos', '2025-06-23 19:22:50', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(446, NULL, 'READ', 'productos', '2025-06-23 19:22:50', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(447, NULL, 'READ', 'productos', '2025-06-23 19:22:50', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(448, NULL, 'READ', 'productos', '2025-06-23 19:22:51', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(449, NULL, 'READ', 'productos', '2025-06-23 19:28:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(450, NULL, 'READ', 'productos', '2025-06-23 19:28:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(451, NULL, 'READ', 'productos', '2025-06-23 19:28:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(452, NULL, 'READ', 'productos', '2025-06-23 19:28:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(453, NULL, 'LOGIN', 'usuarios', '2025-06-23 19:30:48', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(454, NULL, 'READ', 'productos', '2025-06-23 19:30:49', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(455, NULL, 'READ', 'productos', '2025-06-23 19:30:49', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(456, NULL, 'READ', 'productos', '2025-06-23 19:30:49', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(457, NULL, 'READ', 'productos', '2025-06-23 19:30:49', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(458, NULL, 'READ', 'productos', '2025-06-23 19:32:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(459, NULL, 'READ', 'productos', '2025-06-23 19:32:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(460, NULL, 'READ', 'productos', '2025-06-23 19:32:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(461, NULL, 'READ', 'productos', '2025-06-23 19:32:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(462, NULL, 'READ', 'productos', '2025-06-23 20:15:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(463, NULL, 'READ', 'productos', '2025-06-23 20:15:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(464, NULL, 'READ', 'productos', '2025-06-23 20:15:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(465, NULL, 'READ', 'productos', '2025-06-23 20:15:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(466, NULL, 'READ', 'productos', '2025-06-23 20:15:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(467, NULL, 'READ', 'productos', '2025-06-23 20:15:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(468, NULL, 'READ', 'productos', '2025-06-23 20:15:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(469, NULL, 'READ', 'productos', '2025-06-23 20:15:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(470, NULL, 'LOGIN', 'usuarios', '2025-06-23 20:25:07', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(471, NULL, 'READ', 'productos', '2025-06-23 20:25:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(472, NULL, 'READ', 'productos', '2025-06-23 20:25:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(473, NULL, 'READ', 'productos', '2025-06-23 20:25:10', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(474, NULL, 'READ', 'productos', '2025-06-23 20:25:10', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(475, NULL, 'READ', 'productos', '2025-06-23 20:28:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(476, NULL, 'READ', 'productos', '2025-06-23 20:28:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(477, NULL, 'READ', 'productos', '2025-06-23 20:28:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(478, NULL, 'READ', 'productos', '2025-06-23 20:28:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(479, NULL, 'LOGIN', 'usuarios', '2025-06-23 20:37:50', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(480, NULL, 'READ', 'productos', '2025-06-23 20:37:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(481, NULL, 'READ', 'productos', '2025-06-23 20:37:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(482, NULL, 'READ', 'productos', '2025-06-23 20:37:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(483, NULL, 'READ', 'productos', '2025-06-23 20:37:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(484, NULL, 'READ', 'productos', '2025-06-23 20:38:14', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(485, NULL, 'READ', 'productos', '2025-06-23 20:38:14', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(486, NULL, 'READ', 'productos', '2025-06-23 20:38:15', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(487, NULL, 'READ', 'productos', '2025-06-23 20:38:15', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(488, NULL, 'READ', 'productos', '2025-06-23 20:43:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(489, NULL, 'READ', 'productos', '2025-06-23 20:43:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(490, NULL, 'READ', 'productos', '2025-06-23 20:43:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(491, NULL, 'READ', 'productos', '2025-06-23 20:43:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(492, NULL, 'READ', 'productos', '2025-06-23 20:45:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(493, NULL, 'READ', 'productos', '2025-06-23 20:45:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(494, NULL, 'READ', 'productos', '2025-06-23 20:45:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(495, NULL, 'READ', 'productos', '2025-06-23 20:45:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(496, NULL, 'READ', 'productos', '2025-06-23 20:52:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(497, NULL, 'READ', 'productos', '2025-06-23 20:52:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(498, NULL, 'READ', 'productos', '2025-06-23 20:52:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(499, NULL, 'READ', 'productos', '2025-06-23 20:52:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(500, NULL, 'READ', 'productos', '2025-06-23 20:52:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(501, NULL, 'READ', 'productos', '2025-06-23 20:52:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(502, NULL, 'READ', 'productos', '2025-06-23 20:52:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(503, NULL, 'READ', 'productos', '2025-06-23 20:52:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(504, NULL, 'READ', 'productos', '2025-06-23 20:52:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(505, NULL, 'READ', 'productos', '2025-06-23 20:52:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(506, NULL, 'READ', 'productos', '2025-06-23 20:52:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(507, NULL, 'READ', 'productos', '2025-06-23 20:52:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(508, NULL, 'READ', 'productos', '2025-06-23 20:52:51', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(509, NULL, 'READ', 'productos', '2025-06-23 20:52:51', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(510, NULL, 'READ', 'productos', '2025-06-23 20:52:51', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(511, NULL, 'READ', 'productos', '2025-06-23 20:52:51', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(512, NULL, 'READ', 'productos', '2025-06-23 20:55:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(513, NULL, 'READ', 'productos', '2025-06-23 20:55:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(514, NULL, 'READ', 'productos', '2025-06-23 20:55:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(515, NULL, 'READ', 'productos', '2025-06-23 20:55:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(516, NULL, 'READ', 'productos', '2025-06-23 21:01:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(517, NULL, 'READ', 'productos', '2025-06-23 21:01:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(518, NULL, 'READ', 'productos', '2025-06-23 21:02:00', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(519, NULL, 'READ', 'productos', '2025-06-23 21:02:00', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(520, NULL, 'READ', 'productos', '2025-06-23 21:02:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(521, NULL, 'READ', 'productos', '2025-06-23 21:02:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(522, NULL, 'READ', 'productos', '2025-06-23 21:02:18', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(523, NULL, 'READ', 'productos', '2025-06-23 21:02:18', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(524, NULL, 'READ', 'productos', '2025-06-23 21:02:31', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(525, NULL, 'READ', 'productos', '2025-06-23 21:02:31', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(526, NULL, 'READ', 'productos', '2025-06-23 21:02:31', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(527, NULL, 'READ', 'productos', '2025-06-23 21:02:31', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(528, NULL, 'READ', 'productos', '2025-06-23 21:02:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(529, NULL, 'READ', 'productos', '2025-06-23 21:02:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(530, NULL, 'READ', 'productos', '2025-06-23 21:02:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(531, NULL, 'READ', 'productos', '2025-06-23 21:02:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(532, NULL, 'READ', 'productos', '2025-06-23 21:03:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(533, NULL, 'READ', 'productos', '2025-06-23 21:03:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(534, NULL, 'READ', 'productos', '2025-06-23 21:03:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(535, NULL, 'READ', 'productos', '2025-06-23 21:03:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(536, NULL, 'READ', 'productos', '2025-06-23 21:03:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(537, NULL, 'READ', 'productos', '2025-06-23 21:03:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(538, NULL, 'READ', 'productos', '2025-06-23 21:03:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(539, NULL, 'READ', 'productos', '2025-06-23 21:03:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(540, NULL, 'READ', 'productos', '2025-06-23 21:04:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(541, NULL, 'READ', 'productos', '2025-06-23 21:04:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(542, NULL, 'READ', 'productos', '2025-06-23 21:04:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(543, NULL, 'READ', 'productos', '2025-06-23 21:04:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(544, NULL, 'READ', 'productos', '2025-06-23 21:04:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(545, NULL, 'READ', 'productos', '2025-06-23 21:04:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(546, NULL, 'READ', 'productos', '2025-06-23 21:04:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(547, NULL, 'READ', 'productos', '2025-06-23 21:04:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(548, NULL, 'READ', 'productos', '2025-06-23 21:04:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(549, NULL, 'READ', 'productos', '2025-06-23 21:04:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(550, NULL, 'READ', 'productos', '2025-06-23 21:04:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(551, NULL, 'READ', 'productos', '2025-06-23 21:04:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(552, NULL, 'READ', 'productos', '2025-06-23 21:06:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(553, NULL, 'READ', 'productos', '2025-06-23 21:06:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(554, NULL, 'READ', 'productos', '2025-06-23 21:06:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(555, NULL, 'READ', 'productos', '2025-06-23 21:06:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(556, NULL, 'READ', 'productos', '2025-06-23 21:06:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(557, NULL, 'READ', 'productos', '2025-06-23 21:06:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(558, NULL, 'READ', 'productos', '2025-06-23 21:06:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(559, NULL, 'READ', 'productos', '2025-06-23 21:06:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(560, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:09:52', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(561, NULL, 'READ', 'productos', '2025-06-23 21:09:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(562, NULL, 'READ', 'productos', '2025-06-23 21:09:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(563, NULL, 'READ', 'productos', '2025-06-23 21:09:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(564, NULL, 'READ', 'productos', '2025-06-23 21:09:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(565, NULL, 'READ', 'productos', '2025-06-23 21:10:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(566, NULL, 'READ', 'productos', '2025-06-23 21:10:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(567, NULL, 'READ', 'productos', '2025-06-23 21:10:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(568, NULL, 'READ', 'productos', '2025-06-23 21:10:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(569, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:11:05', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(570, NULL, 'READ', 'productos', '2025-06-23 21:11:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(571, NULL, 'READ', 'productos', '2025-06-23 21:11:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(572, NULL, 'READ', 'productos', '2025-06-23 21:11:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(573, NULL, 'READ', 'productos', '2025-06-23 21:11:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(574, NULL, 'READ', 'productos', '2025-06-23 21:12:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(575, NULL, 'READ', 'productos', '2025-06-23 21:12:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(576, NULL, 'READ', 'productos', '2025-06-23 21:12:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(577, NULL, 'READ', 'productos', '2025-06-23 21:12:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(578, NULL, 'READ', 'productos', '2025-06-23 21:13:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(579, NULL, 'READ', 'productos', '2025-06-23 21:13:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(580, NULL, 'READ', 'productos', '2025-06-23 21:13:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(581, NULL, 'READ', 'productos', '2025-06-23 21:13:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(582, NULL, 'READ', 'productos', '2025-06-23 21:13:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(583, NULL, 'READ', 'productos', '2025-06-23 21:13:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(584, NULL, 'READ', 'productos', '2025-06-23 21:13:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(585, NULL, 'READ', 'productos', '2025-06-23 21:13:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(586, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:14:05', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(587, NULL, 'READ', 'productos', '2025-06-23 21:14:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(588, NULL, 'READ', 'productos', '2025-06-23 21:14:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(589, NULL, 'READ', 'productos', '2025-06-23 21:14:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(590, NULL, 'READ', 'productos', '2025-06-23 21:14:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(591, NULL, 'READ', 'productos', '2025-06-23 21:15:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(592, NULL, 'READ', 'productos', '2025-06-23 21:15:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(593, NULL, 'READ', 'productos', '2025-06-23 21:15:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(594, NULL, 'READ', 'productos', '2025-06-23 21:15:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(595, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:15:07', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(596, NULL, 'READ', 'productos', '2025-06-23 21:15:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(597, NULL, 'READ', 'productos', '2025-06-23 21:15:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(598, NULL, 'READ', 'productos', '2025-06-23 21:15:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(599, NULL, 'READ', 'productos', '2025-06-23 21:15:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(600, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:15:15', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(601, NULL, 'READ', 'productos', '2025-06-23 21:15:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(602, NULL, 'READ', 'productos', '2025-06-23 21:15:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(603, NULL, 'READ', 'productos', '2025-06-23 21:15:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(604, NULL, 'READ', 'productos', '2025-06-23 21:15:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(605, NULL, 'READ', 'productos', '2025-06-23 21:18:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(606, NULL, 'READ', 'productos', '2025-06-23 21:18:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(607, NULL, 'READ', 'productos', '2025-06-23 21:18:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(608, NULL, 'READ', 'productos', '2025-06-23 21:18:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(609, NULL, 'READ', 'productos', '2025-06-23 21:18:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(610, NULL, 'READ', 'productos', '2025-06-23 21:18:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(611, NULL, 'READ', 'productos', '2025-06-23 21:18:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(612, NULL, 'READ', 'productos', '2025-06-23 21:18:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(613, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:22:05', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(614, NULL, 'READ', 'productos', '2025-06-23 21:22:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(615, NULL, 'READ', 'productos', '2025-06-23 21:22:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(616, NULL, 'READ', 'productos', '2025-06-23 21:22:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(617, NULL, 'READ', 'productos', '2025-06-23 21:22:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(618, NULL, 'READ', 'productos', '2025-06-23 21:22:18', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(619, NULL, 'READ', 'productos', '2025-06-23 21:22:18', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(620, NULL, 'READ', 'productos', '2025-06-23 21:22:18', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(621, NULL, 'READ', 'productos', '2025-06-23 21:22:18', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(622, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:22:25', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(623, NULL, 'READ', 'productos', '2025-06-23 21:22:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(624, NULL, 'READ', 'productos', '2025-06-23 21:22:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(625, NULL, 'READ', 'productos', '2025-06-23 21:22:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(626, NULL, 'READ', 'productos', '2025-06-23 21:22:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(627, NULL, 'READ', 'productos', '2025-06-23 21:22:42', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(628, NULL, 'READ', 'productos', '2025-06-23 21:22:42', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(629, NULL, 'READ', 'productos', '2025-06-23 21:22:42', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(630, NULL, 'READ', 'productos', '2025-06-23 21:22:42', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(631, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:23:02', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(632, NULL, 'READ', 'productos', '2025-06-23 21:23:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(633, NULL, 'READ', 'productos', '2025-06-23 21:23:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(634, NULL, 'READ', 'productos', '2025-06-23 21:23:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(635, NULL, 'READ', 'productos', '2025-06-23 21:23:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(636, NULL, 'READ', 'productos', '2025-06-23 21:32:14', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(637, NULL, 'READ', 'productos', '2025-06-23 21:32:14', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(638, NULL, 'READ', 'productos', '2025-06-23 21:32:14', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(639, NULL, 'READ', 'productos', '2025-06-23 21:32:14', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(640, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:32:20', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(641, NULL, 'READ', 'productos', '2025-06-23 21:32:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(642, NULL, 'READ', 'productos', '2025-06-23 21:32:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(643, NULL, 'READ', 'productos', '2025-06-23 21:32:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(644, NULL, 'READ', 'productos', '2025-06-23 21:32:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(645, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:36:27', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(646, NULL, 'READ', 'productos', '2025-06-23 21:36:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(647, NULL, 'READ', 'productos', '2025-06-23 21:36:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(648, NULL, 'READ', 'productos', '2025-06-23 21:36:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(649, NULL, 'READ', 'productos', '2025-06-23 21:36:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(650, NULL, 'READ', 'productos', '2025-06-23 21:47:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(651, NULL, 'READ', 'productos', '2025-06-23 21:47:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(652, NULL, 'READ', 'productos', '2025-06-23 21:47:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(653, NULL, 'READ', 'productos', '2025-06-23 21:47:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(654, NULL, 'READ', 'productos', '2025-06-23 21:47:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(655, NULL, 'READ', 'productos', '2025-06-23 21:47:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(656, NULL, 'READ', 'productos', '2025-06-23 21:47:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(657, NULL, 'READ', 'productos', '2025-06-23 21:47:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(658, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-23 21:47:58', 'Intento de inicio de sesión fallido para usuario con correo: alex33@gmail.com'),
(659, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:48:11', 'Inicio de sesión exitoso del usuario: Jose (alex33@gmail.com)'),
(660, NULL, 'READ', 'productos', '2025-06-23 21:48:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(661, NULL, 'READ', 'productos', '2025-06-23 21:48:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(662, NULL, 'READ', 'productos', '2025-06-23 21:48:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(663, NULL, 'READ', 'productos', '2025-06-23 21:48:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(664, NULL, 'READ', 'productos', '2025-06-23 21:48:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(665, NULL, 'READ', 'productos', '2025-06-23 21:48:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(666, NULL, 'READ', 'productos', '2025-06-23 21:48:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(667, NULL, 'READ', 'productos', '2025-06-23 21:48:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(668, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:49:04', 'Inicio de sesión exitoso del usuario: Jose (alex33@gmail.com)'),
(669, NULL, 'READ', 'productos', '2025-06-23 21:49:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(670, NULL, 'READ', 'productos', '2025-06-23 21:49:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(671, NULL, 'READ', 'productos', '2025-06-23 21:49:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(672, NULL, 'READ', 'productos', '2025-06-23 21:49:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(673, NULL, 'READ', 'productos', '2025-06-23 21:49:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(674, NULL, 'READ', 'productos', '2025-06-23 21:49:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(675, NULL, 'READ', 'productos', '2025-06-23 21:49:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(676, NULL, 'READ', 'productos', '2025-06-23 21:49:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(677, NULL, 'LOGIN', 'usuarios', '2025-06-23 21:58:25', 'Inicio de sesión exitoso del usuario: Alex2 (alex33@gmail.com)'),
(678, NULL, 'READ', 'productos', '2025-06-23 21:58:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(679, NULL, 'READ', 'productos', '2025-06-23 21:58:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(680, NULL, 'READ', 'productos', '2025-06-23 21:58:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(681, NULL, 'READ', 'productos', '2025-06-23 21:58:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(682, NULL, 'READ', 'productos', '2025-06-23 21:59:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(683, NULL, 'READ', 'productos', '2025-06-23 21:59:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(684, NULL, 'READ', 'productos', '2025-06-23 21:59:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(685, NULL, 'READ', 'productos', '2025-06-23 21:59:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(686, NULL, 'READ', 'productos', '2025-06-23 22:04:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(687, NULL, 'READ', 'productos', '2025-06-23 22:04:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(688, NULL, 'READ', 'productos', '2025-06-23 22:04:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(689, NULL, 'READ', 'productos', '2025-06-23 22:04:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(690, NULL, 'READ', 'productos', '2025-06-23 22:12:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(691, NULL, 'READ', 'productos', '2025-06-23 22:12:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(692, NULL, 'READ', 'productos', '2025-06-23 22:12:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(693, NULL, 'READ', 'productos', '2025-06-23 22:12:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(694, NULL, 'READ', 'productos', '2025-06-23 22:18:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(695, NULL, 'READ', 'productos', '2025-06-23 22:18:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(696, NULL, 'READ', 'productos', '2025-06-23 22:18:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(697, NULL, 'READ', 'productos', '2025-06-23 22:18:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(698, NULL, 'READ', 'productos', '2025-06-23 22:23:55', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(699, NULL, 'READ', 'productos', '2025-06-23 22:23:55', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(700, NULL, 'READ', 'productos', '2025-06-23 22:23:56', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(701, NULL, 'READ', 'productos', '2025-06-23 22:23:56', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(702, NULL, 'READ', 'productos', '2025-06-23 22:28:57', 'Menú consultado exitosamente - 24 registros encontrados'),
(703, NULL, 'READ', 'productos', '2025-06-23 22:29:37', 'Menú consultado exitosamente - 24 registros encontrados'),
(704, NULL, 'READ', 'productos', '2025-06-23 22:29:37', 'Menú consultado exitosamente - 24 registros encontrados'),
(705, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:43:28', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(706, NULL, 'READ', 'productos', '2025-06-23 22:43:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(707, NULL, 'READ', 'productos', '2025-06-23 22:43:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(708, NULL, 'READ', 'productos', '2025-06-23 22:43:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(709, NULL, 'READ', 'productos', '2025-06-23 22:43:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(710, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:43:43', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(711, NULL, 'READ', 'productos', '2025-06-23 22:43:44', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(712, NULL, 'READ', 'productos', '2025-06-23 22:43:44', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(713, NULL, 'READ', 'productos', '2025-06-23 22:43:44', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(714, NULL, 'READ', 'productos', '2025-06-23 22:43:44', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(715, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:45:04', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(716, NULL, 'READ', 'productos', '2025-06-23 22:45:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(717, NULL, 'READ', 'productos', '2025-06-23 22:45:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(718, NULL, 'READ', 'productos', '2025-06-23 22:45:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(719, NULL, 'READ', 'productos', '2025-06-23 22:45:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(720, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:45:56', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(721, NULL, 'READ', 'productos', '2025-06-23 22:45:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(722, NULL, 'READ', 'productos', '2025-06-23 22:45:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(723, NULL, 'READ', 'productos', '2025-06-23 22:45:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(724, NULL, 'READ', 'productos', '2025-06-23 22:45:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(725, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:46:24', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(726, NULL, 'READ', 'productos', '2025-06-23 22:46:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(727, NULL, 'READ', 'productos', '2025-06-23 22:46:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(728, NULL, 'READ', 'productos', '2025-06-23 22:46:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(729, NULL, 'READ', 'productos', '2025-06-23 22:46:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(730, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:47:36', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(731, NULL, 'READ', 'productos', '2025-06-23 22:47:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(732, NULL, 'READ', 'productos', '2025-06-23 22:47:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(733, NULL, 'READ', 'productos', '2025-06-23 22:47:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(734, NULL, 'READ', 'productos', '2025-06-23 22:47:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(735, NULL, 'READ', 'productos', '2025-06-23 22:47:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(736, NULL, 'READ', 'productos', '2025-06-23 22:47:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(737, NULL, 'READ', 'productos', '2025-06-23 22:47:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(738, NULL, 'READ', 'productos', '2025-06-23 22:47:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(739, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:47:52', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(740, NULL, 'READ', 'productos', '2025-06-23 22:47:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(741, NULL, 'READ', 'productos', '2025-06-23 22:47:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(742, NULL, 'READ', 'productos', '2025-06-23 22:47:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(743, NULL, 'READ', 'productos', '2025-06-23 22:47:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(744, NULL, 'READ', 'productos', '2025-06-23 22:48:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(745, NULL, 'READ', 'productos', '2025-06-23 22:48:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(746, NULL, 'READ', 'productos', '2025-06-23 22:48:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(747, NULL, 'READ', 'productos', '2025-06-23 22:48:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(748, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:48:57', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(749, NULL, 'READ', 'productos', '2025-06-23 22:48:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(750, NULL, 'READ', 'productos', '2025-06-23 22:48:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(751, NULL, 'READ', 'productos', '2025-06-23 22:48:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(752, NULL, 'READ', 'productos', '2025-06-23 22:48:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(753, NULL, 'LOGIN', 'usuarios', '2025-06-23 22:53:20', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(754, NULL, 'READ', 'productos', '2025-06-23 22:53:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(755, NULL, 'READ', 'productos', '2025-06-23 22:53:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(756, NULL, 'READ', 'productos', '2025-06-23 22:53:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(757, NULL, 'READ', 'productos', '2025-06-23 22:53:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(758, NULL, 'LOGIN', 'usuarios', '2025-06-23 23:02:22', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(759, NULL, 'READ', 'productos', '2025-06-23 23:02:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(760, NULL, 'READ', 'productos', '2025-06-23 23:02:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(761, NULL, 'READ', 'productos', '2025-06-23 23:02:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(762, NULL, 'READ', 'productos', '2025-06-23 23:02:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(763, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-23 23:18:28', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(764, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-23 23:18:31', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(765, NULL, 'LOGIN', 'usuarios', '2025-06-23 23:19:24', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(766, NULL, 'READ', 'productos', '2025-06-23 23:19:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(767, NULL, 'READ', 'productos', '2025-06-23 23:19:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(768, NULL, 'READ', 'productos', '2025-06-23 23:19:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(769, NULL, 'READ', 'productos', '2025-06-23 23:19:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(770, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-23 23:28:19', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(771, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-23 23:28:44', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(772, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-23 23:42:41', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(773, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-24 00:22:22', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(774, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-24 00:22:38', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(775, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-24 00:23:41', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(776, NULL, 'LOGIN_FAILED', 'administradores', '2025-06-24 00:23:57', 'Intento de inicio de sesión fallido para administrador con correo: tiznadoerick3@gmail.com'),
(777, NULL, 'READ', 'productos', '2025-06-24 01:01:51', 'Menú consultado exitosamente - 24 registros encontrados'),
(778, NULL, 'READ', 'productos', '2025-06-24 01:03:03', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(779, NULL, 'READ', 'productos', '2025-06-24 01:03:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(780, NULL, 'READ', 'productos', '2025-06-24 01:03:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(781, NULL, 'READ', 'productos', '2025-06-24 01:03:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(782, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-24 01:12:18', 'Login exitoso para administrador: Erick Tiznado (tiznadoerick3@gmail.com)'),
(783, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-24 01:41:22', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(784, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-24 02:01:15', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(785, NULL, 'CHANGE_PASSWORD', 'usuarios', '2025-06-24 02:49:26', 'Cambio de contraseña exitoso para usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(786, NULL, 'LOGIN', 'usuarios', '2025-06-24 02:49:40', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(787, NULL, 'READ', 'productos', '2025-06-24 02:49:42', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(788, NULL, 'READ', 'productos', '2025-06-24 02:49:42', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(789, NULL, 'READ', 'productos', '2025-06-24 02:49:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(790, NULL, 'READ', 'productos', '2025-06-24 02:49:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(791, NULL, 'READ', 'productos', '2025-06-24 02:56:56', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(792, NULL, 'READ', 'productos', '2025-06-24 02:56:56', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(793, NULL, 'READ', 'productos', '2025-06-24 02:56:56', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(794, NULL, 'READ', 'productos', '2025-06-24 02:56:56', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(795, NULL, 'READ', 'productos', '2025-06-24 02:57:24', 'Menú consultado exitosamente - 24 registros encontrados'),
(796, NULL, 'READ', 'productos', '2025-06-24 02:57:24', 'Menú consultado exitosamente - 24 registros encontrados'),
(797, NULL, 'READ', 'productos', '2025-06-24 03:28:44', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(798, NULL, 'READ', 'productos', '2025-06-24 03:28:44', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(799, NULL, 'READ', 'productos', '2025-06-24 03:28:44', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(800, NULL, 'READ', 'productos', '2025-06-24 03:28:44', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(801, NULL, 'LOGIN', 'usuarios', '2025-06-24 03:31:37', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(802, NULL, 'READ', 'productos', '2025-06-24 03:31:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(803, NULL, 'READ', 'productos', '2025-06-24 03:31:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(804, NULL, 'READ', 'productos', '2025-06-24 03:31:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(805, NULL, 'READ', 'productos', '2025-06-24 03:31:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(806, NULL, 'READ', 'productos', '2025-06-24 03:42:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(807, NULL, 'READ', 'productos', '2025-06-24 03:42:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(808, NULL, 'READ', 'productos', '2025-06-24 03:42:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(809, NULL, 'READ', 'productos', '2025-06-24 03:42:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(810, NULL, 'LOGIN', 'usuarios', '2025-06-24 03:43:00', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(811, NULL, 'READ', 'productos', '2025-06-24 03:43:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(812, NULL, 'READ', 'productos', '2025-06-24 03:43:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(813, NULL, 'READ', 'productos', '2025-06-24 03:43:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(814, NULL, 'READ', 'productos', '2025-06-24 03:43:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(815, NULL, 'LOGIN', 'usuarios', '2025-06-24 03:48:18', 'Inicio de sesión exitoso del usuario: nathaly milenas (nathy.zelaya5@gmail.com)'),
(816, NULL, 'READ', 'productos', '2025-06-24 03:48:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(817, NULL, 'READ', 'productos', '2025-06-24 03:48:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(818, NULL, 'READ', 'productos', '2025-06-24 03:48:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(819, NULL, 'READ', 'productos', '2025-06-24 03:48:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(820, NULL, 'READ', 'productos', '2025-06-24 03:48:50', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(821, NULL, 'READ', 'productos', '2025-06-24 03:48:50', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(822, NULL, 'READ', 'productos', '2025-06-24 03:48:50', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(823, NULL, 'READ', 'productos', '2025-06-24 03:48:50', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(824, NULL, 'CHANGE_PASSWORD', 'usuarios', '2025-06-24 04:01:12', 'Cambio de contraseña exitoso para usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(825, NULL, 'LOGIN', 'usuarios', '2025-06-24 04:29:26', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(826, NULL, 'READ', 'productos', '2025-06-24 04:29:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(827, NULL, 'READ', 'productos', '2025-06-24 04:29:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(828, NULL, 'READ', 'productos', '2025-06-24 04:29:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(829, NULL, 'READ', 'productos', '2025-06-24 04:29:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(830, NULL, 'READ', 'productos', '2025-06-24 04:32:03', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(831, NULL, 'READ', 'productos', '2025-06-24 04:32:03', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(832, NULL, 'READ', 'productos', '2025-06-24 04:32:03', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(833, NULL, 'READ', 'productos', '2025-06-24 04:32:03', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(834, NULL, 'READ', 'productos', '2025-06-24 04:32:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(835, NULL, 'READ', 'productos', '2025-06-24 04:32:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(836, NULL, 'READ', 'productos', '2025-06-24 04:32:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(837, NULL, 'READ', 'productos', '2025-06-24 04:32:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(838, NULL, 'LOGIN', 'usuarios', '2025-06-24 04:32:32', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(839, NULL, 'READ', 'productos', '2025-06-24 04:32:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(840, NULL, 'READ', 'productos', '2025-06-24 04:32:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(841, NULL, 'READ', 'productos', '2025-06-24 04:32:35', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(842, NULL, 'READ', 'productos', '2025-06-24 04:32:35', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(843, NULL, 'READ', 'productos', '2025-06-24 04:36:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(844, NULL, 'READ', 'productos', '2025-06-24 04:36:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(845, NULL, 'READ', 'productos', '2025-06-24 04:36:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(846, NULL, 'READ', 'productos', '2025-06-24 04:36:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(847, NULL, 'READ', 'productos', '2025-06-24 04:36:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(848, NULL, 'READ', 'productos', '2025-06-24 04:36:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(849, NULL, 'READ', 'productos', '2025-06-24 04:36:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(850, NULL, 'READ', 'productos', '2025-06-24 04:36:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(851, NULL, 'LOGIN', 'usuarios', '2025-06-24 04:36:35', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(852, NULL, 'READ', 'productos', '2025-06-24 04:36:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(853, NULL, 'READ', 'productos', '2025-06-24 04:36:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(854, NULL, 'READ', 'productos', '2025-06-24 04:36:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(855, NULL, 'READ', 'productos', '2025-06-24 04:36:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(856, NULL, 'LOGIN', 'usuarios', '2025-06-24 04:43:15', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(857, NULL, 'READ', 'productos', '2025-06-24 04:43:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(858, NULL, 'READ', 'productos', '2025-06-24 04:43:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(859, NULL, 'READ', 'productos', '2025-06-24 04:43:17', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(860, NULL, 'READ', 'productos', '2025-06-24 04:43:17', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(861, NULL, 'READ', 'productos', '2025-06-24 12:42:55', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(862, NULL, 'READ', 'productos', '2025-06-24 12:42:55', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(863, NULL, 'READ', 'productos', '2025-06-24 12:42:55', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(864, NULL, 'READ', 'productos', '2025-06-24 12:42:55', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(865, NULL, 'READ', 'productos', '2025-06-24 13:41:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(866, NULL, 'READ', 'productos', '2025-06-24 13:41:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(867, NULL, 'READ', 'productos', '2025-06-24 13:41:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(868, NULL, 'READ', 'productos', '2025-06-24 13:41:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(869, NULL, 'READ', 'productos', '2025-06-24 13:42:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(870, NULL, 'READ', 'productos', '2025-06-24 13:42:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(871, NULL, 'READ', 'productos', '2025-06-24 13:42:25', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(872, NULL, 'READ', 'productos', '2025-06-24 13:42:25', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(873, NULL, 'READ', 'productos', '2025-06-24 14:15:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(874, NULL, 'READ', 'productos', '2025-06-24 14:15:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(875, NULL, 'READ', 'productos', '2025-06-24 14:15:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(876, NULL, 'READ', 'productos', '2025-06-24 14:15:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(877, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(878, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(879, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(880, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(881, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(882, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(883, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(884, NULL, 'READ', 'productos', '2025-06-24 14:30:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(885, NULL, 'LOGIN', 'usuarios', '2025-06-24 14:30:58', 'Inicio de sesión exitoso del usuario: Alex2 (alex33@gmail.com)'),
(886, NULL, 'READ', 'productos', '2025-06-24 14:30:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(887, NULL, 'READ', 'productos', '2025-06-24 14:30:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(888, NULL, 'READ', 'productos', '2025-06-24 14:30:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(889, NULL, 'READ', 'productos', '2025-06-24 14:30:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(890, NULL, 'READ', 'productos', '2025-06-24 14:31:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(891, NULL, 'READ', 'productos', '2025-06-24 14:31:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(892, NULL, 'READ', 'productos', '2025-06-24 14:31:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(893, NULL, 'READ', 'productos', '2025-06-24 14:31:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(894, NULL, 'READ', 'productos', '2025-06-24 14:31:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(895, NULL, 'READ', 'productos', '2025-06-24 14:31:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(896, NULL, 'READ', 'productos', '2025-06-24 14:31:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(897, NULL, 'READ', 'productos', '2025-06-24 14:31:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(898, NULL, 'READ', 'productos', '2025-06-24 14:32:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(899, NULL, 'READ', 'productos', '2025-06-24 14:32:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(900, NULL, 'READ', 'productos', '2025-06-24 14:32:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(901, NULL, 'READ', 'productos', '2025-06-24 14:32:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(902, NULL, 'READ', 'productos', '2025-06-24 14:32:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(903, NULL, 'READ', 'productos', '2025-06-24 14:32:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(904, NULL, 'READ', 'productos', '2025-06-24 14:32:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(905, NULL, 'READ', 'productos', '2025-06-24 14:32:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(906, NULL, 'LOGIN', 'usuarios', '2025-06-24 14:32:31', 'Inicio de sesión exitoso del usuario: Alex2 (alex33@gmail.com)'),
(907, NULL, 'READ', 'productos', '2025-06-24 14:32:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(908, NULL, 'READ', 'productos', '2025-06-24 14:32:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(909, NULL, 'READ', 'productos', '2025-06-24 14:32:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(910, NULL, 'READ', 'productos', '2025-06-24 14:32:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(911, NULL, 'READ', 'productos', '2025-06-24 14:36:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(912, NULL, 'READ', 'productos', '2025-06-24 14:36:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(913, NULL, 'READ', 'productos', '2025-06-24 14:36:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(914, NULL, 'READ', 'productos', '2025-06-24 14:36:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(915, NULL, 'READ', 'productos', '2025-06-24 14:36:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(916, NULL, 'READ', 'productos', '2025-06-24 14:36:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(917, NULL, 'READ', 'productos', '2025-06-24 14:36:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(918, NULL, 'READ', 'productos', '2025-06-24 14:36:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(919, NULL, 'READ', 'productos', '2025-06-24 14:36:42', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(920, NULL, 'READ', 'productos', '2025-06-24 14:36:42', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(921, NULL, 'READ', 'productos', '2025-06-24 14:36:42', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(922, NULL, 'READ', 'productos', '2025-06-24 14:36:42', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(923, NULL, 'LOGIN', 'usuarios', '2025-06-24 14:36:47', 'Inicio de sesión exitoso del usuario: Alex2 (alex33@gmail.com)'),
(924, NULL, 'READ', 'productos', '2025-06-24 14:36:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(925, NULL, 'READ', 'productos', '2025-06-24 14:36:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(926, NULL, 'READ', 'productos', '2025-06-24 14:36:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(927, NULL, 'READ', 'productos', '2025-06-24 14:36:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(928, NULL, 'READ', 'productos', '2025-06-24 14:38:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(929, NULL, 'READ', 'productos', '2025-06-24 14:38:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(930, NULL, 'READ', 'productos', '2025-06-24 14:38:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(931, NULL, 'READ', 'productos', '2025-06-24 14:38:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(932, NULL, 'READ', 'productos', '2025-06-24 14:38:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(933, NULL, 'READ', 'productos', '2025-06-24 14:38:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(934, NULL, 'READ', 'productos', '2025-06-24 14:38:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(935, NULL, 'READ', 'productos', '2025-06-24 14:38:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(936, NULL, 'READ', 'productos', '2025-06-24 14:38:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(937, NULL, 'READ', 'productos', '2025-06-24 14:38:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(938, NULL, 'READ', 'productos', '2025-06-24 14:38:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(939, NULL, 'READ', 'productos', '2025-06-24 14:38:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(940, NULL, 'READ', 'productos', '2025-06-24 14:38:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(941, NULL, 'READ', 'productos', '2025-06-24 14:38:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(942, NULL, 'READ', 'productos', '2025-06-24 14:38:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(943, NULL, 'READ', 'productos', '2025-06-24 14:38:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(944, NULL, 'LOGIN', 'usuarios', '2025-06-24 14:42:24', 'Inicio de sesión exitoso del usuario: Alex2 (alex33@gmail.com)'),
(945, NULL, 'READ', 'productos', '2025-06-24 14:42:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(946, NULL, 'READ', 'productos', '2025-06-24 14:42:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(947, NULL, 'READ', 'productos', '2025-06-24 14:42:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(948, NULL, 'READ', 'productos', '2025-06-24 14:42:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(949, NULL, 'READ', 'productos', '2025-06-24 14:58:31', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(950, NULL, 'READ', 'productos', '2025-06-24 14:58:31', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(951, NULL, 'READ', 'productos', '2025-06-24 14:58:31', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(952, NULL, 'READ', 'productos', '2025-06-24 14:58:31', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(953, NULL, 'READ', 'productos', '2025-06-24 15:01:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(954, NULL, 'READ', 'productos', '2025-06-24 15:01:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(955, NULL, 'READ', 'productos', '2025-06-24 15:01:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(956, NULL, 'READ', 'productos', '2025-06-24 15:01:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(957, NULL, 'LOGIN', 'usuarios', '2025-06-24 15:01:24', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(958, NULL, 'READ', 'productos', '2025-06-24 15:01:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(959, NULL, 'READ', 'productos', '2025-06-24 15:01:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(960, NULL, 'READ', 'productos', '2025-06-24 15:01:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(961, NULL, 'READ', 'productos', '2025-06-24 15:01:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(962, NULL, 'READ', 'productos', '2025-06-24 15:02:28', 'Menú consultado exitosamente - 24 registros encontrados'),
(963, NULL, 'READ', 'productos', '2025-06-24 15:02:28', 'Menú consultado exitosamente - 24 registros encontrados'),
(964, NULL, 'READ', 'productos', '2025-06-24 15:02:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(965, NULL, 'READ', 'productos', '2025-06-24 15:02:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(966, NULL, 'READ', 'productos', '2025-06-24 15:02:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(967, NULL, 'READ', 'productos', '2025-06-24 15:02:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(968, NULL, 'READ', 'productos', '2025-06-24 15:03:01', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(969, NULL, 'READ', 'productos', '2025-06-24 15:03:01', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(970, NULL, 'READ', 'productos', '2025-06-24 15:03:01', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(971, NULL, 'READ', 'productos', '2025-06-24 15:03:01', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(972, NULL, 'LOGIN', 'usuarios', '2025-06-24 15:04:06', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(973, NULL, 'READ', 'productos', '2025-06-24 15:04:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(974, NULL, 'READ', 'productos', '2025-06-24 15:04:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(975, NULL, 'READ', 'productos', '2025-06-24 15:04:07', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(976, NULL, 'READ', 'productos', '2025-06-24 15:04:07', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(977, NULL, 'READ', 'productos', '2025-06-24 15:06:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(978, NULL, 'READ', 'productos', '2025-06-24 15:06:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(979, NULL, 'READ', 'productos', '2025-06-24 15:06:02', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(980, NULL, 'READ', 'productos', '2025-06-24 15:06:02', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(981, NULL, 'READ', 'productos', '2025-06-24 15:07:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(982, NULL, 'READ', 'productos', '2025-06-24 15:07:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(983, NULL, 'READ', 'productos', '2025-06-24 15:07:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(984, NULL, 'READ', 'productos', '2025-06-24 15:07:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(985, NULL, 'READ', 'productos', '2025-06-24 15:08:08', 'Menú consultado exitosamente - 24 registros encontrados'),
(986, NULL, 'READ', 'productos', '2025-06-24 15:11:33', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(987, NULL, 'READ', 'productos', '2025-06-24 15:11:33', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(988, NULL, 'READ', 'productos', '2025-06-24 15:11:33', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(989, NULL, 'READ', 'productos', '2025-06-24 15:11:33', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(990, NULL, 'READ', 'productos', '2025-06-24 15:11:57', 'Menú consultado exitosamente - 24 registros encontrados'),
(991, NULL, 'READ', 'productos', '2025-06-24 15:12:06', 'Menú consultado exitosamente - 24 registros encontrados'),
(992, NULL, 'READ', 'productos', '2025-06-24 15:14:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(993, NULL, 'READ', 'productos', '2025-06-24 15:14:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(994, NULL, 'READ', 'productos', '2025-06-24 15:14:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(995, NULL, 'READ', 'productos', '2025-06-24 15:14:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(996, NULL, 'LOGIN', 'usuarios', '2025-06-24 15:14:50', 'Inicio de sesión exitoso del usuario: Erick Mauricio  (tiznadoinv@gmail.com)'),
(997, NULL, 'READ', 'productos', '2025-06-24 15:14:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(998, NULL, 'READ', 'productos', '2025-06-24 15:14:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(999, NULL, 'READ', 'productos', '2025-06-24 15:14:52', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1000, NULL, 'READ', 'productos', '2025-06-24 15:14:52', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1001, NULL, 'READ', 'productos', '2025-06-24 15:15:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1002, NULL, 'READ', 'productos', '2025-06-24 15:15:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1003, NULL, 'READ', 'productos', '2025-06-24 15:15:26', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1004, NULL, 'READ', 'productos', '2025-06-24 15:15:26', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1005, NULL, 'DESACTIVAR_CUENTA', 'usuarios', '2025-06-24 15:15:31', 'Cuenta desactivada. Motivo: sdfsdf'),
(1006, NULL, 'READ', 'productos', '2025-06-24 15:15:33', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1007, NULL, 'READ', 'productos', '2025-06-24 15:15:33', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1008, NULL, 'READ', 'productos', '2025-06-24 15:15:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1009, NULL, 'READ', 'productos', '2025-06-24 15:15:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1010, NULL, 'READ', 'productos', '2025-06-24 15:15:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1011, NULL, 'READ', 'productos', '2025-06-24 15:15:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1012, NULL, 'READ', 'productos', '2025-06-24 15:19:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1013, NULL, 'READ', 'productos', '2025-06-24 15:19:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1014, NULL, 'READ', 'productos', '2025-06-24 15:19:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1015, NULL, 'READ', 'productos', '2025-06-24 15:19:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1016, NULL, 'READ', 'productos', '2025-06-24 15:19:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1017, NULL, 'READ', 'productos', '2025-06-24 15:19:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1018, NULL, 'READ', 'productos', '2025-06-24 15:19:46', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1019, NULL, 'READ', 'productos', '2025-06-24 15:19:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1020, NULL, 'READ', 'productos', '2025-06-24 15:19:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1021, NULL, 'READ', 'productos', '2025-06-24 15:19:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1022, NULL, 'READ', 'productos', '2025-06-24 15:19:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1023, NULL, 'READ', 'productos', '2025-06-24 15:19:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1024, NULL, 'READ', 'productos', '2025-06-24 15:20:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1025, NULL, 'READ', 'productos', '2025-06-24 15:20:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1026, NULL, 'READ', 'productos', '2025-06-24 15:20:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1027, NULL, 'READ', 'productos', '2025-06-24 15:20:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1028, NULL, 'READ', 'productos', '2025-06-24 15:20:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1029, NULL, 'READ', 'productos', '2025-06-24 15:20:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1030, NULL, 'READ', 'productos', '2025-06-24 15:20:30', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1031, NULL, 'READ', 'productos', '2025-06-24 15:20:30', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1032, NULL, 'READ', 'productos', '2025-06-24 15:20:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1033, NULL, 'READ', 'productos', '2025-06-24 15:20:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1034, NULL, 'READ', 'productos', '2025-06-24 15:20:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1035, NULL, 'READ', 'productos', '2025-06-24 15:20:33', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1036, NULL, 'READ', 'productos', '2025-06-24 15:20:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1037, NULL, 'READ', 'productos', '2025-06-24 15:20:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1038, NULL, 'READ', 'productos', '2025-06-24 15:20:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1039, NULL, 'READ', 'productos', '2025-06-24 15:20:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1040, NULL, 'READ', 'productos', '2025-06-24 15:20:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1041, NULL, 'READ', 'productos', '2025-06-24 15:20:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1042, NULL, 'READ', 'productos', '2025-06-24 15:20:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1043, NULL, 'READ', 'productos', '2025-06-24 15:20:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1044, NULL, 'READ', 'productos', '2025-06-24 15:20:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1045, NULL, 'READ', 'productos', '2025-06-24 15:20:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1046, NULL, 'READ', 'productos', '2025-06-24 15:20:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1047, NULL, 'READ', 'productos', '2025-06-24 15:20:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1048, NULL, 'READ', 'productos', '2025-06-24 16:04:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1049, NULL, 'READ', 'productos', '2025-06-24 16:04:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1050, NULL, 'READ', 'productos', '2025-06-24 16:04:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1051, NULL, 'READ', 'productos', '2025-06-24 16:04:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1052, NULL, 'READ', 'productos', '2025-06-24 16:04:59', 'Menú consultado exitosamente - 24 registros encontrados'),
(1053, NULL, 'READ', 'productos', '2025-06-24 16:04:59', 'Menú consultado exitosamente - 24 registros encontrados'),
(1054, NULL, 'READ', 'productos', '2025-06-24 16:05:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1055, NULL, 'READ', 'productos', '2025-06-24 16:05:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1056, NULL, 'READ', 'productos', '2025-06-24 16:05:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1057, NULL, 'READ', 'productos', '2025-06-24 16:05:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1058, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:05:11', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(1059, NULL, 'READ', 'productos', '2025-06-24 16:05:12', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1060, NULL, 'READ', 'productos', '2025-06-24 16:05:12', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1061, NULL, 'READ', 'productos', '2025-06-24 16:05:12', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1062, NULL, 'READ', 'productos', '2025-06-24 16:05:12', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1063, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:05:32', 'Inicio de sesión exitoso del usuario: Mauricio (tiznadoerick53@gmail.com)'),
(1064, NULL, 'READ', 'productos', '2025-06-24 16:05:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1065, NULL, 'READ', 'productos', '2025-06-24 16:05:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1066, NULL, 'READ', 'productos', '2025-06-24 16:05:34', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1067, NULL, 'READ', 'productos', '2025-06-24 16:05:34', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1068, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:07:02', 'Inicio de sesión exitoso del usuario: erick tiznado (tiznadoerick853@gmail.com)'),
(1069, NULL, 'READ', 'productos', '2025-06-24 16:07:03', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1070, NULL, 'READ', 'productos', '2025-06-24 16:07:03', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1071, NULL, 'READ', 'productos', '2025-06-24 16:07:04', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1072, NULL, 'READ', 'productos', '2025-06-24 16:07:04', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1073, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:10:23', 'Inicio de sesión exitoso del usuario: erick tiznado (tiznadoerick853@gmail.com)'),
(1074, NULL, 'READ', 'productos', '2025-06-24 16:10:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1075, NULL, 'READ', 'productos', '2025-06-24 16:10:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1076, NULL, 'READ', 'productos', '2025-06-24 16:10:24', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1077, NULL, 'READ', 'productos', '2025-06-24 16:10:24', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1078, NULL, 'READ', 'productos', '2025-06-24 16:10:28', 'Menú consultado exitosamente - 24 registros encontrados'),
(1079, NULL, 'READ', 'productos', '2025-06-24 16:10:29', 'Menú consultado exitosamente - 24 registros encontrados'),
(1080, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:11:45', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(1081, NULL, 'READ', 'productos', '2025-06-24 16:11:47', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1082, NULL, 'READ', 'productos', '2025-06-24 16:11:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1083, NULL, 'READ', 'productos', '2025-06-24 16:11:47', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1084, NULL, 'READ', 'productos', '2025-06-24 16:11:47', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1085, NULL, 'READ', 'productos', '2025-06-24 16:13:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1086, NULL, 'READ', 'productos', '2025-06-24 16:13:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1087, NULL, 'READ', 'productos', '2025-06-24 16:13:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1088, NULL, 'READ', 'productos', '2025-06-24 16:13:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1089, NULL, 'READ', 'productos', '2025-06-24 16:14:50', 'Menú consultado exitosamente - 24 registros encontrados'),
(1090, NULL, 'READ', 'productos', '2025-06-24 16:14:50', 'Menú consultado exitosamente - 24 registros encontrados'),
(1091, NULL, 'READ', 'productos', '2025-06-24 16:15:18', 'Menú consultado exitosamente - 24 registros encontrados'),
(1092, NULL, 'READ', 'productos', '2025-06-24 16:15:18', 'Menú consultado exitosamente - 24 registros encontrados'),
(1093, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:26:06', 'Inicio de sesión exitoso del usuario: nathaly milena (nathy.zelaya5@gmail.com)'),
(1094, NULL, 'READ', 'productos', '2025-06-24 16:26:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1095, NULL, 'READ', 'productos', '2025-06-24 16:26:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1096, NULL, 'READ', 'productos', '2025-06-24 16:26:08', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1097, NULL, 'READ', 'productos', '2025-06-24 16:26:08', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1098, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:26:38', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1099, NULL, 'READ', 'productos', '2025-06-24 16:26:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1100, NULL, 'READ', 'productos', '2025-06-24 16:26:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1101, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1102, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1103, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1104, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1105, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1106, NULL, 'READ', 'productos', '2025-06-24 16:26:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1107, NULL, 'READ', 'productos', '2025-06-24 16:26:47', 'Menú consultado exitosamente - 24 registros encontrados'),
(1108, NULL, 'READ', 'productos', '2025-06-24 16:26:47', 'Menú consultado exitosamente - 24 registros encontrados'),
(1109, NULL, 'READ', 'productos', '2025-06-24 16:35:48', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1110, NULL, 'READ', 'productos', '2025-06-24 16:35:48', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1111, NULL, 'READ', 'productos', '2025-06-24 16:35:49', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1112, NULL, 'READ', 'productos', '2025-06-24 16:35:49', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1113, NULL, 'READ', 'productos', '2025-06-24 16:36:10', 'Menú consultado exitosamente - 24 registros encontrados'),
(1114, NULL, 'READ', 'productos', '2025-06-24 16:36:10', 'Menú consultado exitosamente - 24 registros encontrados'),
(1115, NULL, 'READ', 'productos', '2025-06-24 16:36:33', 'Menú consultado exitosamente - 24 registros encontrados'),
(1116, NULL, 'READ', 'productos', '2025-06-24 16:36:33', 'Menú consultado exitosamente - 24 registros encontrados'),
(1117, NULL, 'READ', 'productos', '2025-06-24 16:38:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1118, NULL, 'READ', 'productos', '2025-06-24 16:38:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1119, NULL, 'READ', 'productos', '2025-06-24 16:38:37', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1120, NULL, 'READ', 'productos', '2025-06-24 16:38:37', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1121, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:40:53', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1122, NULL, 'READ', 'productos', '2025-06-24 16:40:55', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1123, NULL, 'READ', 'productos', '2025-06-24 16:40:55', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1124, NULL, 'READ', 'productos', '2025-06-24 16:40:55', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1125, NULL, 'READ', 'productos', '2025-06-24 16:40:55', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1126, NULL, 'READ', 'productos', '2025-06-24 16:41:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1127, NULL, 'READ', 'productos', '2025-06-24 16:41:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1128, NULL, 'READ', 'productos', '2025-06-24 16:41:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1129, NULL, 'READ', 'productos', '2025-06-24 16:41:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1130, NULL, 'READ', 'productos', '2025-06-24 16:42:06', 'Menú consultado exitosamente - 24 registros encontrados'),
(1131, NULL, 'READ', 'productos', '2025-06-24 16:42:06', 'Menú consultado exitosamente - 24 registros encontrados'),
(1132, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:44:25', 'Inicio de sesión exitoso del usuario: jenny (danalej1@gmail.com)'),
(1133, NULL, 'READ', 'productos', '2025-06-24 16:44:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1134, NULL, 'READ', 'productos', '2025-06-24 16:44:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1135, NULL, 'READ', 'productos', '2025-06-24 16:44:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1136, NULL, 'READ', 'productos', '2025-06-24 16:44:27', 'Productos más populares consultados exitosamente - 3 productos encontrados');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(1137, NULL, 'READ', 'productos', '2025-06-24 16:45:17', 'Menú consultado exitosamente - 24 registros encontrados'),
(1138, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:46:28', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(1139, NULL, 'READ', 'productos', '2025-06-24 16:46:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1140, NULL, 'READ', 'productos', '2025-06-24 16:46:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1141, NULL, 'READ', 'productos', '2025-06-24 16:46:29', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1142, NULL, 'READ', 'productos', '2025-06-24 16:46:29', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1143, NULL, 'LOGIN', 'usuarios', '2025-06-24 16:48:07', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1144, NULL, 'READ', 'productos', '2025-06-24 16:48:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1145, NULL, 'READ', 'productos', '2025-06-24 16:48:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1146, NULL, 'READ', 'productos', '2025-06-24 16:48:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1147, NULL, 'READ', 'productos', '2025-06-24 16:48:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1148, NULL, 'READ', 'productos', '2025-06-24 16:49:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1149, NULL, 'READ', 'productos', '2025-06-24 16:49:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1150, NULL, 'READ', 'productos', '2025-06-24 16:49:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1151, NULL, 'READ', 'productos', '2025-06-24 16:49:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1152, NULL, 'READ', 'productos', '2025-06-24 17:01:16', 'Menú consultado exitosamente - 24 registros encontrados'),
(1153, NULL, 'READ', 'productos', '2025-06-24 17:01:16', 'Menú consultado exitosamente - 24 registros encontrados'),
(1154, NULL, 'READ', 'productos', '2025-06-24 17:03:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1155, NULL, 'READ', 'productos', '2025-06-24 17:03:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1156, NULL, 'READ', 'productos', '2025-06-24 17:03:09', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1157, NULL, 'READ', 'productos', '2025-06-24 17:03:09', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1158, NULL, 'READ', 'productos', '2025-06-24 17:06:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1159, NULL, 'READ', 'productos', '2025-06-24 17:06:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1160, NULL, 'READ', 'productos', '2025-06-24 17:06:57', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1161, NULL, 'READ', 'productos', '2025-06-24 17:06:57', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1162, NULL, 'READ', 'productos', '2025-06-24 17:11:09', 'Menú consultado exitosamente - 24 registros encontrados'),
(1163, NULL, 'READ', 'productos', '2025-06-24 17:11:09', 'Menú consultado exitosamente - 24 registros encontrados'),
(1164, NULL, 'READ', 'productos', '2025-06-24 17:16:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1165, NULL, 'READ', 'productos', '2025-06-24 17:16:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1166, NULL, 'READ', 'productos', '2025-06-24 17:16:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1167, NULL, 'READ', 'productos', '2025-06-24 17:16:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1168, NULL, 'READ', 'productos', '2025-06-24 17:27:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1169, NULL, 'READ', 'productos', '2025-06-24 17:27:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1170, NULL, 'READ', 'productos', '2025-06-24 17:27:32', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1171, NULL, 'READ', 'productos', '2025-06-24 17:27:32', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1172, NULL, 'LOGIN', 'usuarios', '2025-06-24 17:27:56', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1173, NULL, 'READ', 'productos', '2025-06-24 17:27:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1174, NULL, 'READ', 'productos', '2025-06-24 17:27:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1175, NULL, 'READ', 'productos', '2025-06-24 17:27:58', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1176, NULL, 'READ', 'productos', '2025-06-24 17:27:58', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1177, NULL, 'LOGIN', 'usuarios', '2025-06-24 17:29:41', 'Inicio de sesión exitoso del usuario: Erick Mauricio  (tiznadoinv@gmail.com)'),
(1178, NULL, 'READ', 'productos', '2025-06-24 17:29:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1179, NULL, 'READ', 'productos', '2025-06-24 17:29:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1180, NULL, 'READ', 'productos', '2025-06-24 17:29:43', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1181, NULL, 'READ', 'productos', '2025-06-24 17:29:43', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1182, NULL, 'DESACTIVAR_CUENTA', 'usuarios', '2025-06-24 17:30:17', 'Cuenta desactivada. Motivo: wq'),
(1183, NULL, 'READ', 'productos', '2025-06-24 17:30:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1184, NULL, 'READ', 'productos', '2025-06-24 17:30:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1185, NULL, 'READ', 'productos', '2025-06-24 17:30:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1186, NULL, 'READ', 'productos', '2025-06-24 17:30:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1187, NULL, 'READ', 'productos', '2025-06-24 17:30:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1188, NULL, 'READ', 'productos', '2025-06-24 17:30:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1189, NULL, 'READ', 'productos', '2025-06-24 17:30:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1190, NULL, 'READ', 'productos', '2025-06-24 17:30:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1191, NULL, 'LOGIN', 'usuarios', '2025-06-24 17:30:36', 'Inicio de sesión exitoso del usuario: Erick Mauricio  (tiznadoinv@gmail.com)'),
(1192, NULL, 'READ', 'productos', '2025-06-24 17:30:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1193, NULL, 'READ', 'productos', '2025-06-24 17:30:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1194, NULL, 'READ', 'productos', '2025-06-24 17:30:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1195, NULL, 'READ', 'productos', '2025-06-24 17:30:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1196, NULL, 'READ', 'productos', '2025-06-24 17:33:08', 'Menú consultado exitosamente - 24 registros encontrados'),
(1197, NULL, 'READ', 'productos', '2025-06-24 17:33:08', 'Menú consultado exitosamente - 24 registros encontrados'),
(1198, NULL, 'READ', 'productos', '2025-06-24 17:33:35', 'Menú consultado exitosamente - 24 registros encontrados'),
(1199, NULL, 'READ', 'productos', '2025-06-24 17:33:35', 'Menú consultado exitosamente - 24 registros encontrados'),
(1200, NULL, 'LOGIN', 'usuarios', '2025-06-24 17:34:44', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1201, NULL, 'READ', 'productos', '2025-06-24 17:34:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1202, NULL, 'READ', 'productos', '2025-06-24 17:34:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1203, NULL, 'READ', 'productos', '2025-06-24 17:34:46', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1204, NULL, 'READ', 'productos', '2025-06-24 17:34:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1205, NULL, 'READ', 'productos', '2025-06-24 17:45:03', 'Menú consultado exitosamente - 24 registros encontrados'),
(1206, NULL, 'READ', 'productos', '2025-06-24 17:45:03', 'Menú consultado exitosamente - 24 registros encontrados'),
(1207, NULL, 'READ', 'productos', '2025-06-24 17:45:24', 'Menú consultado exitosamente - 24 registros encontrados'),
(1208, NULL, 'READ', 'productos', '2025-06-24 17:45:24', 'Menú consultado exitosamente - 24 registros encontrados'),
(1209, NULL, 'READ', 'productos', '2025-06-24 17:46:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1210, NULL, 'READ', 'productos', '2025-06-24 17:46:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1211, NULL, 'READ', 'productos', '2025-06-24 17:46:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1212, NULL, 'READ', 'productos', '2025-06-24 17:46:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1213, NULL, 'READ', 'productos', '2025-06-24 17:55:53', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1214, NULL, 'READ', 'productos', '2025-06-24 17:55:53', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1215, NULL, 'READ', 'productos', '2025-06-24 17:55:54', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1216, NULL, 'READ', 'productos', '2025-06-24 17:55:54', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1217, NULL, 'LOGIN', 'usuarios', '2025-06-24 19:10:12', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1218, NULL, 'READ', 'productos', '2025-06-24 19:10:14', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1219, NULL, 'READ', 'productos', '2025-06-24 19:10:14', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1220, NULL, 'READ', 'productos', '2025-06-24 19:10:14', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1221, NULL, 'READ', 'productos', '2025-06-24 19:10:14', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1222, NULL, 'READ', 'productos', '2025-06-24 19:10:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1223, NULL, 'READ', 'productos', '2025-06-24 19:10:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1224, NULL, 'READ', 'productos', '2025-06-24 19:10:45', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1225, NULL, 'READ', 'productos', '2025-06-24 19:10:45', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1226, NULL, 'READ', 'productos', '2025-06-24 19:13:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1227, NULL, 'READ', 'productos', '2025-06-24 19:13:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1228, NULL, 'READ', 'productos', '2025-06-24 19:13:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1229, NULL, 'READ', 'productos', '2025-06-24 19:13:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1230, NULL, 'READ', 'productos', '2025-06-24 19:19:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1231, NULL, 'READ', 'productos', '2025-06-24 19:19:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1232, NULL, 'READ', 'productos', '2025-06-24 19:19:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1233, NULL, 'READ', 'productos', '2025-06-24 19:19:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1234, NULL, 'READ', 'productos', '2025-06-24 19:34:35', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1235, NULL, 'READ', 'productos', '2025-06-24 19:34:35', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1236, NULL, 'READ', 'productos', '2025-06-24 19:34:35', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1237, NULL, 'READ', 'productos', '2025-06-24 19:34:35', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1238, NULL, 'READ', 'productos', '2025-06-24 19:41:19', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1239, NULL, 'READ', 'productos', '2025-06-24 19:41:19', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1240, NULL, 'READ', 'productos', '2025-06-24 19:41:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1241, NULL, 'READ', 'productos', '2025-06-24 19:41:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1242, NULL, 'READ', 'productos', '2025-06-24 19:58:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1243, NULL, 'READ', 'productos', '2025-06-24 19:58:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1244, NULL, 'READ', 'productos', '2025-06-24 19:58:21', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1245, NULL, 'READ', 'productos', '2025-06-24 19:58:21', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1246, NULL, 'READ', 'productos', '2025-06-24 20:05:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1247, NULL, 'READ', 'productos', '2025-06-24 20:05:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1248, NULL, 'READ', 'productos', '2025-06-24 20:05:06', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1249, NULL, 'READ', 'productos', '2025-06-24 20:05:06', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1250, NULL, 'READ', 'productos', '2025-06-24 20:08:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1251, NULL, 'READ', 'productos', '2025-06-24 20:08:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1252, NULL, 'READ', 'productos', '2025-06-24 20:08:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1253, NULL, 'READ', 'productos', '2025-06-24 20:08:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1254, NULL, 'READ', 'productos', '2025-06-24 20:08:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1255, NULL, 'READ', 'productos', '2025-06-24 20:08:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1256, NULL, 'READ', 'productos', '2025-06-24 20:08:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1257, NULL, 'READ', 'productos', '2025-06-24 20:08:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1258, NULL, 'READ', 'productos', '2025-06-24 20:09:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1259, NULL, 'READ', 'productos', '2025-06-24 20:09:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1260, NULL, 'READ', 'productos', '2025-06-24 20:09:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1261, NULL, 'READ', 'productos', '2025-06-24 20:09:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1262, NULL, 'LOGIN', 'usuarios', '2025-06-24 20:10:20', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1263, NULL, 'READ', 'productos', '2025-06-24 20:10:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1264, NULL, 'READ', 'productos', '2025-06-24 20:10:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1265, NULL, 'READ', 'productos', '2025-06-24 20:10:22', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1266, NULL, 'READ', 'productos', '2025-06-24 20:10:22', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1267, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-24 20:17:22', 'Intento de inicio de sesión con cuenta inactiva: milenas (milu.zelaya02@gmail.com)'),
(1268, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-24 20:17:26', 'Intento de inicio de sesión con cuenta inactiva: milena zelaya (nathy.zelaya55@gmail.com)'),
(1269, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-24 20:17:31', 'Intento de inicio de sesión con cuenta inactiva: nathaly milena (nathy.zelaya5@gmail.com)'),
(1270, NULL, 'LOGIN', 'usuarios', '2025-06-24 20:17:34', 'Inicio de sesión exitoso del usuario: mauricio rodriguez (usis038521@ugb.edu.sv)'),
(1271, NULL, 'READ', 'productos', '2025-06-24 20:17:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1272, NULL, 'READ', 'productos', '2025-06-24 20:17:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1273, NULL, 'READ', 'productos', '2025-06-24 20:17:36', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1274, NULL, 'READ', 'productos', '2025-06-24 20:17:36', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1275, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-24 20:18:27', 'Intento de inicio de sesión con cuenta inactiva: milenas (milu.zelaya02@gmail.com)'),
(1276, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-24 20:20:42', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick853@gmail.com'),
(1277, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-24 20:20:50', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick853@gmail.com'),
(1278, NULL, 'LOGIN', 'usuarios', '2025-06-24 20:20:57', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1279, NULL, 'READ', 'productos', '2025-06-24 20:20:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1280, NULL, 'READ', 'productos', '2025-06-24 20:20:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1281, NULL, 'READ', 'productos', '2025-06-24 20:20:59', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1282, NULL, 'READ', 'productos', '2025-06-24 20:20:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1283, NULL, 'READ', 'productos', '2025-06-24 20:21:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1284, NULL, 'READ', 'productos', '2025-06-24 20:21:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1285, NULL, 'READ', 'productos', '2025-06-24 20:21:05', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1286, NULL, 'READ', 'productos', '2025-06-24 20:21:05', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1287, NULL, 'READ', 'productos', '2025-06-24 20:39:10', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1288, NULL, 'READ', 'productos', '2025-06-24 20:39:10', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1289, NULL, 'READ', 'productos', '2025-06-24 20:39:10', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1290, NULL, 'READ', 'productos', '2025-06-24 20:39:10', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1291, NULL, 'LOGIN', 'usuarios', '2025-06-24 20:39:18', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1292, NULL, 'READ', 'productos', '2025-06-24 20:39:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1293, NULL, 'READ', 'productos', '2025-06-24 20:39:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1294, NULL, 'READ', 'productos', '2025-06-24 20:39:20', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1295, NULL, 'READ', 'productos', '2025-06-24 20:39:20', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1296, NULL, 'READ', 'productos', '2025-06-24 20:40:01', 'Menú consultado exitosamente - 24 registros encontrados'),
(1297, NULL, 'READ', 'productos', '2025-06-24 20:40:01', 'Menú consultado exitosamente - 24 registros encontrados'),
(1298, NULL, 'READ', 'productos', '2025-06-24 21:04:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1299, NULL, 'READ', 'productos', '2025-06-24 21:04:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1300, NULL, 'READ', 'productos', '2025-06-24 21:04:38', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1301, NULL, 'READ', 'productos', '2025-06-24 21:04:38', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1302, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-24 21:20:17', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(1304, NULL, 'READ', 'productos', '2025-06-24 21:33:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1305, NULL, 'READ', 'productos', '2025-06-24 21:33:59', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1307, NULL, 'READ', 'productos', '2025-06-24 21:34:28', 'Menú consultado exitosamente - 24 registros encontrados'),
(1308, NULL, 'READ', 'productos', '2025-06-24 21:34:28', 'Menú consultado exitosamente - 24 registros encontrados'),
(1309, NULL, 'READ', 'productos', '2025-06-24 21:34:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1310, NULL, 'READ', 'productos', '2025-06-24 21:34:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1311, NULL, 'READ', 'productos', '2025-06-24 21:34:40', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1312, NULL, 'READ', 'productos', '2025-06-24 21:34:40', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1313, NULL, 'READ', 'productos', '2025-06-24 21:34:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1314, NULL, 'READ', 'productos', '2025-06-24 21:34:46', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1315, NULL, 'READ', 'productos', '2025-06-24 21:34:46', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1316, NULL, 'READ', 'productos', '2025-06-24 21:34:46', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1317, NULL, 'READ', 'productos', '2025-06-24 21:36:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1318, NULL, 'READ', 'productos', '2025-06-24 21:36:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1319, NULL, 'READ', 'productos', '2025-06-24 21:36:39', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1320, NULL, 'READ', 'productos', '2025-06-24 21:36:39', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1321, NULL, 'LOGIN', 'usuarios', '2025-06-24 21:46:12', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1322, NULL, 'READ', 'productos', '2025-06-24 21:46:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1323, NULL, 'READ', 'productos', '2025-06-24 21:46:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1324, NULL, 'READ', 'productos', '2025-06-24 21:46:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1325, NULL, 'READ', 'productos', '2025-06-24 21:46:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1326, NULL, 'READ', 'productos', '2025-06-24 21:51:50', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1327, NULL, 'READ', 'productos', '2025-06-24 21:51:50', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1328, NULL, 'READ', 'productos', '2025-06-24 21:51:51', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1329, NULL, 'READ', 'productos', '2025-06-24 21:51:51', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1330, NULL, 'READ', 'productos', '2025-06-24 22:39:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1331, NULL, 'READ', 'productos', '2025-06-24 22:39:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1332, NULL, 'READ', 'productos', '2025-06-24 22:39:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1333, NULL, 'READ', 'productos', '2025-06-24 22:39:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1334, NULL, 'READ', 'productos', '2025-06-24 22:39:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1335, NULL, 'READ', 'productos', '2025-06-24 22:39:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1336, NULL, 'READ', 'productos', '2025-06-24 22:39:16', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1337, NULL, 'READ', 'productos', '2025-06-24 22:39:16', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1338, NULL, 'READ', 'productos', '2025-06-24 22:50:12', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1339, NULL, 'READ', 'productos', '2025-06-24 22:50:12', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1340, NULL, 'READ', 'productos', '2025-06-24 22:50:12', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1341, NULL, 'READ', 'productos', '2025-06-24 22:50:12', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1342, NULL, 'LOGIN', 'usuarios', '2025-06-24 22:50:26', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1343, NULL, 'READ', 'productos', '2025-06-24 22:50:27', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1344, NULL, 'READ', 'productos', '2025-06-24 22:50:27', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1345, NULL, 'READ', 'productos', '2025-06-24 22:50:28', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1346, NULL, 'READ', 'productos', '2025-06-24 22:50:28', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1347, NULL, 'READ', 'productos', '2025-06-24 22:58:12', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1348, NULL, 'READ', 'productos', '2025-06-24 22:58:12', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1349, NULL, 'READ', 'productos', '2025-06-24 22:58:13', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1350, NULL, 'READ', 'productos', '2025-06-24 22:58:13', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1351, NULL, 'LOGIN', 'usuarios', '2025-06-24 23:34:39', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1352, NULL, 'READ', 'productos', '2025-06-24 23:34:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1353, NULL, 'READ', 'productos', '2025-06-24 23:34:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1354, NULL, 'READ', 'productos', '2025-06-24 23:34:41', 'Productos más populares consultados exitosamente - 3 productos encontrados'),
(1355, NULL, 'READ', 'productos', '2025-06-24 23:34:41', 'Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1356, NULL, 'READ', 'productos', '2025-06-24 23:48:29', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1357, NULL, 'READ', 'productos', '2025-06-24 23:50:47', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1358, NULL, 'READ', 'productos', '2025-06-24 23:51:00', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1359, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-25 00:05:18', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(1360, NULL, 'READ', 'productos', '2025-06-25 00:13:12', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1361, NULL, 'READ', 'productos', '2025-06-25 00:13:13', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1362, NULL, 'READ', 'productos', '2025-06-25 00:13:23', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1363, NULL, 'READ', 'productos', '2025-06-25 00:13:23', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1364, NULL, 'READ', 'productos', '2025-06-25 00:13:23', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1365, NULL, 'READ', 'productos', '2025-06-25 00:13:23', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1366, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1367, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1368, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1369, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1370, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1371, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1372, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1373, NULL, 'READ', 'productos', '2025-06-25 00:13:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1374, NULL, 'LOGIN', 'usuarios', '2025-06-25 00:14:03', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1375, NULL, 'READ', 'productos', '2025-06-25 00:14:05', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1376, NULL, 'READ', 'productos', '2025-06-25 00:14:05', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1377, NULL, 'READ', 'productos', '2025-06-25 00:14:05', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1378, NULL, 'READ', 'productos', '2025-06-25 00:14:05', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1379, NULL, 'READ', 'productos', '2025-06-25 00:17:25', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1380, NULL, 'READ', 'productos', '2025-06-25 00:17:25', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1381, NULL, 'LOGIN', 'usuarios', '2025-06-25 00:17:34', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1382, NULL, 'READ', 'productos', '2025-06-25 00:17:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1383, NULL, 'READ', 'productos', '2025-06-25 00:17:36', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1384, NULL, 'READ', 'productos', '2025-06-25 00:17:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1385, NULL, 'READ', 'productos', '2025-06-25 00:17:36', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1386, NULL, 'READ', 'productos', '2025-06-25 00:17:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1387, NULL, 'READ', 'productos', '2025-06-25 00:17:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1388, NULL, 'READ', 'productos', '2025-06-25 00:17:45', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1389, NULL, 'READ', 'productos', '2025-06-25 00:17:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1390, NULL, 'READ', 'productos', '2025-06-25 00:20:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1391, NULL, 'READ', 'productos', '2025-06-25 00:20:51', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1392, NULL, 'READ', 'productos', '2025-06-25 00:20:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1393, NULL, 'READ', 'productos', '2025-06-25 00:20:51', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1394, NULL, 'READ', 'productos', '2025-06-25 00:21:22', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1395, NULL, 'READ', 'productos', '2025-06-25 00:21:23', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1396, NULL, 'READ', 'productos', '2025-06-25 00:21:38', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1397, NULL, 'READ', 'productos', '2025-06-25 00:21:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1398, NULL, 'READ', 'productos', '2025-06-25 00:21:39', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1399, NULL, 'READ', 'productos', '2025-06-25 00:21:39', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1400, NULL, 'READ', 'productos', '2025-06-25 00:22:07', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1401, NULL, 'READ', 'productos', '2025-06-25 00:22:08', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1402, NULL, 'READ', 'productos', '2025-06-25 00:26:12', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1403, NULL, 'READ', 'productos', '2025-06-25 00:26:12', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1404, NULL, 'READ', 'productos', '2025-06-25 00:26:13', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1405, NULL, 'READ', 'productos', '2025-06-25 00:26:13', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1406, NULL, 'READ', 'productos', '2025-06-25 00:27:31', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1407, NULL, 'READ', 'productos', '2025-06-25 00:27:31', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1408, NULL, 'READ', 'productos', '2025-06-25 00:27:31', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1409, NULL, 'READ', 'productos', '2025-06-25 00:27:31', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1410, NULL, 'READ', 'productos', '2025-06-25 00:27:59', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1411, NULL, 'READ', 'productos', '2025-06-25 00:27:59', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1412, NULL, 'READ', 'productos', '2025-06-25 00:29:52', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1413, NULL, 'READ', 'productos', '2025-06-25 00:29:52', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1414, NULL, 'READ', 'productos', '2025-06-25 00:29:53', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1415, NULL, 'READ', 'productos', '2025-06-25 00:29:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1416, NULL, 'READ', 'productos', '2025-06-25 00:39:38', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1417, NULL, 'READ', 'productos', '2025-06-25 00:39:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1418, NULL, 'READ', 'productos', '2025-06-25 00:39:39', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1419, NULL, 'READ', 'productos', '2025-06-25 00:39:39', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1420, NULL, 'READ', 'productos', '2025-06-25 00:40:02', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1421, NULL, 'READ', 'productos', '2025-06-25 00:40:03', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1422, NULL, 'LOGIN', 'usuarios', '2025-06-25 00:48:32', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1423, NULL, 'READ', 'productos', '2025-06-25 00:48:34', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1424, NULL, 'READ', 'productos', '2025-06-25 00:48:34', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1425, NULL, 'READ', 'productos', '2025-06-25 00:48:35', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1426, NULL, 'READ', 'productos', '2025-06-25 00:48:35', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1437, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-25 02:01:51', 'Intento de inicio de sesión con cuenta inactiva: Erick Mauricio  (tiznadoerick3@gmail.com)'),
(1438, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-25 02:01:54', 'Intento de inicio de sesión con cuenta inactiva: Erick Mauricio  (tiznadoerick3@gmail.com)'),
(1439, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-25 02:01:55', 'Intento de inicio de sesión con cuenta inactiva: Erick Mauricio  (tiznadoerick3@gmail.com)'),
(1440, NULL, 'LOGIN_INACTIVE_ACCOUNT', 'usuarios', '2025-06-25 02:02:11', 'Intento de inicio de sesión con cuenta inactiva: Erick Mauricio  (tiznadoinv@gmail.com)'),
(1441, NULL, 'LOGIN', 'usuarios', '2025-06-25 02:15:19', 'Inicio de sesión exitoso del usuario: Erick Mauricio  (tiznadoinv@gmail.com)'),
(1442, NULL, 'READ', 'productos', '2025-06-25 02:15:21', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1443, NULL, 'READ', 'productos', '2025-06-25 02:15:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1444, NULL, 'READ', 'productos', '2025-06-25 02:15:21', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1445, NULL, 'READ', 'productos', '2025-06-25 02:15:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1446, NULL, 'READ', 'productos', '2025-06-25 02:15:42', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1447, NULL, 'READ', 'productos', '2025-06-25 02:15:42', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1448, NULL, 'READ', 'productos', '2025-06-25 02:15:42', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1449, NULL, 'READ', 'productos', '2025-06-25 02:15:42', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1450, NULL, 'READ', 'productos', '2025-06-25 02:15:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1451, NULL, 'READ', 'productos', '2025-06-25 02:15:49', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1452, NULL, 'READ', 'productos', '2025-06-25 02:15:49', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1453, NULL, 'READ', 'productos', '2025-06-25 02:15:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1454, NULL, 'READ', 'productos', '2025-06-25 02:20:23', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1455, NULL, 'READ', 'productos', '2025-06-25 02:20:23', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1456, NULL, 'READ', 'productos', '2025-06-25 02:20:24', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1457, NULL, 'READ', 'productos', '2025-06-25 02:20:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1458, NULL, 'READ', 'productos', '2025-06-25 02:21:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1459, NULL, 'READ', 'productos', '2025-06-25 02:21:27', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1460, NULL, 'READ', 'productos', '2025-06-25 02:21:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1461, NULL, 'READ', 'productos', '2025-06-25 02:21:27', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1462, NULL, 'READ', 'productos', '2025-06-25 02:21:42', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1463, NULL, 'READ', 'productos', '2025-06-25 02:21:42', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1464, NULL, 'READ', 'productos', '2025-06-25 02:33:10', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1465, NULL, 'READ', 'productos', '2025-06-25 02:33:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1466, NULL, 'READ', 'productos', '2025-06-25 02:33:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1467, NULL, 'READ', 'productos', '2025-06-25 02:33:10', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1468, NULL, 'READ', 'productos', '2025-06-25 02:45:15', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1469, NULL, 'READ', 'productos', '2025-06-25 02:45:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1470, NULL, 'READ', 'productos', '2025-06-25 02:45:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1471, NULL, 'READ', 'productos', '2025-06-25 02:45:15', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1472, NULL, 'READ', 'productos', '2025-06-25 02:46:40', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1473, NULL, 'READ', 'productos', '2025-06-25 02:46:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1474, NULL, 'READ', 'productos', '2025-06-25 02:46:41', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1475, NULL, 'READ', 'productos', '2025-06-25 02:46:41', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1476, NULL, 'READ', 'productos', '2025-06-25 02:50:13', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1477, NULL, 'READ', 'productos', '2025-06-25 02:50:13', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1478, NULL, 'READ', 'productos', '2025-06-25 02:58:02', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1479, NULL, 'READ', 'productos', '2025-06-25 02:58:02', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1480, NULL, 'READ', 'productos', '2025-06-25 02:58:02', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1481, NULL, 'READ', 'productos', '2025-06-25 02:58:02', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1482, NULL, 'READ', 'productos', '2025-06-25 02:59:03', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1483, NULL, 'READ', 'productos', '2025-06-25 02:59:03', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1484, NULL, 'READ', 'productos', '2025-06-25 02:59:03', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1485, NULL, 'READ', 'productos', '2025-06-25 02:59:03', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1486, NULL, 'READ', 'productos', '2025-06-25 02:59:14', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1487, NULL, 'READ', 'productos', '2025-06-25 02:59:14', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1488, NULL, 'READ', 'productos', '2025-06-25 02:59:14', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1489, NULL, 'READ', 'productos', '2025-06-25 02:59:14', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1490, NULL, 'READ', 'productos', '2025-06-25 02:59:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1491, NULL, 'READ', 'productos', '2025-06-25 02:59:24', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1492, NULL, 'READ', 'productos', '2025-06-25 02:59:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1493, NULL, 'READ', 'productos', '2025-06-25 02:59:24', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1494, NULL, 'READ', 'productos', '2025-06-25 03:01:51', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1495, NULL, 'READ', 'productos', '2025-06-25 03:01:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1496, NULL, 'READ', 'productos', '2025-06-25 03:01:51', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1497, NULL, 'READ', 'productos', '2025-06-25 03:01:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1498, NULL, 'READ', 'productos', '2025-06-25 03:02:19', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1499, NULL, 'READ', 'productos', '2025-06-25 03:02:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1500, NULL, 'READ', 'productos', '2025-06-25 03:02:19', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1501, NULL, 'READ', 'productos', '2025-06-25 03:02:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1502, NULL, 'READ', 'productos', '2025-06-25 03:03:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1503, NULL, 'READ', 'productos', '2025-06-25 03:03:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1504, NULL, 'READ', 'productos', '2025-06-25 03:03:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1505, NULL, 'READ', 'productos', '2025-06-25 03:03:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1506, NULL, 'READ', 'productos', '2025-06-25 03:05:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1507, NULL, 'READ', 'productos', '2025-06-25 03:05:44', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1508, NULL, 'READ', 'productos', '2025-06-25 03:05:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(1509, NULL, 'READ', 'productos', '2025-06-25 03:05:44', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1510, NULL, 'READ', 'productos', '2025-06-25 03:06:06', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1511, NULL, 'READ', 'productos', '2025-06-25 03:06:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1512, NULL, 'READ', 'productos', '2025-06-25 03:06:06', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1513, NULL, 'READ', 'productos', '2025-06-25 03:06:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1514, NULL, 'LOGIN', 'usuarios', '2025-06-25 03:08:52', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1515, NULL, 'READ', 'productos', '2025-06-25 03:08:53', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1516, NULL, 'READ', 'productos', '2025-06-25 03:08:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1517, NULL, 'READ', 'productos', '2025-06-25 03:08:53', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1518, NULL, 'READ', 'productos', '2025-06-25 03:08:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1519, NULL, 'READ', 'productos', '2025-06-25 03:09:20', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1520, NULL, 'READ', 'productos', '2025-06-25 03:09:20', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1521, NULL, 'READ', 'productos', '2025-06-25 03:23:17', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1522, NULL, 'READ', 'productos', '2025-06-25 03:23:17', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1523, NULL, 'READ', 'productos', '2025-06-25 03:23:17', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1524, NULL, 'READ', 'productos', '2025-06-25 03:23:17', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1525, NULL, 'READ', 'productos', '2025-06-25 03:24:38', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1526, NULL, 'READ', 'productos', '2025-06-25 03:24:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1527, NULL, 'READ', 'productos', '2025-06-25 03:24:38', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1528, NULL, 'READ', 'productos', '2025-06-25 03:24:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1529, NULL, 'READ', 'productos', '2025-06-25 03:26:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1530, NULL, 'READ', 'productos', '2025-06-25 03:26:04', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1531, NULL, 'READ', 'productos', '2025-06-25 03:26:04', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1532, NULL, 'READ', 'productos', '2025-06-25 03:26:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1533, NULL, 'READ', 'productos', '2025-06-25 03:26:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1534, NULL, 'READ', 'productos', '2025-06-25 03:26:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1535, NULL, 'READ', 'productos', '2025-06-25 03:26:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1536, NULL, 'READ', 'productos', '2025-06-25 03:26:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1537, NULL, 'READ', 'productos', '2025-06-25 03:26:27', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1538, NULL, 'READ', 'productos', '2025-06-25 03:26:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1539, NULL, 'READ', 'productos', '2025-06-25 03:26:27', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1540, NULL, 'READ', 'productos', '2025-06-25 03:26:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1541, NULL, 'READ', 'productos', '2025-06-25 03:31:37', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1542, NULL, 'READ', 'productos', '2025-06-25 03:31:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1543, NULL, 'READ', 'productos', '2025-06-25 03:31:37', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1544, NULL, 'READ', 'productos', '2025-06-25 03:31:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1545, NULL, 'READ', 'productos', '2025-06-25 03:31:40', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1546, NULL, 'READ', 'productos', '2025-06-25 03:31:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1547, NULL, 'READ', 'productos', '2025-06-25 03:31:40', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1548, NULL, 'READ', 'productos', '2025-06-25 03:31:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1549, NULL, 'READ', 'productos', '2025-06-25 03:33:46', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1550, NULL, 'READ', 'productos', '2025-06-25 03:33:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1551, NULL, 'READ', 'productos', '2025-06-25 03:33:46', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1552, NULL, 'READ', 'productos', '2025-06-25 03:33:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1553, NULL, 'READ', 'productos', '2025-06-25 03:38:07', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1554, NULL, 'READ', 'productos', '2025-06-25 03:38:07', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1555, NULL, 'READ', 'productos', '2025-06-25 03:38:08', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1556, NULL, 'READ', 'productos', '2025-06-25 03:38:08', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1557, NULL, 'READ', 'productos', '2025-06-25 03:40:11', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1558, NULL, 'READ', 'productos', '2025-06-25 03:40:11', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1559, NULL, 'READ', 'productos', '2025-06-25 03:40:11', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1560, NULL, 'READ', 'productos', '2025-06-25 03:40:11', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1561, NULL, 'READ', 'productos', '2025-06-25 03:40:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1562, NULL, 'READ', 'productos', '2025-06-25 03:40:21', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1563, NULL, 'READ', 'productos', '2025-06-25 03:40:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1564, NULL, 'READ', 'productos', '2025-06-25 03:40:21', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1565, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-25 03:49:03', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(1566, NULL, 'READ', 'productos', '2025-06-25 03:49:06', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1567, NULL, 'READ', 'productos', '2025-06-25 03:49:33', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1568, NULL, 'READ', 'productos', '2025-06-25 03:52:06', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1569, NULL, 'READ', 'productos', '2025-06-25 03:52:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1570, NULL, 'READ', 'productos', '2025-06-25 03:52:06', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1571, NULL, 'READ', 'productos', '2025-06-25 03:52:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1572, NULL, 'READ', 'productos', '2025-06-25 03:52:32', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1573, NULL, 'READ', 'productos', '2025-06-25 03:52:44', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1574, NULL, 'READ', 'productos', '2025-06-25 03:52:55', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1575, NULL, 'READ', 'productos', '2025-06-25 03:53:04', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1576, NULL, 'READ', 'productos', '2025-06-25 03:53:28', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1577, NULL, 'READ', 'productos', '2025-06-25 03:54:04', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1578, NULL, 'READ', 'productos', '2025-06-25 03:54:52', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1579, NULL, 'READ', 'productos', '2025-06-25 03:55:53', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1580, NULL, 'READ', 'productos', '2025-06-25 03:55:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1581, NULL, 'READ', 'productos', '2025-06-25 03:55:53', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1582, NULL, 'READ', 'productos', '2025-06-25 03:55:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1583, NULL, 'READ', 'productos', '2025-06-25 03:56:26', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1584, NULL, 'READ', 'productos', '2025-06-25 03:56:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1585, NULL, 'READ', 'productos', '2025-06-25 03:56:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1586, NULL, 'READ', 'productos', '2025-06-25 03:56:26', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1587, NULL, 'READ', 'productos', '2025-06-25 03:56:47', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1588, NULL, 'READ', 'productos', '2025-06-25 03:56:47', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1589, NULL, 'READ', 'productos', '2025-06-25 03:56:47', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1590, NULL, 'READ', 'productos', '2025-06-25 03:56:47', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1591, NULL, 'READ', 'productos', '2025-06-25 03:56:59', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1592, NULL, 'READ', 'productos', '2025-06-25 03:56:59', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1593, NULL, 'READ', 'productos', '2025-06-25 03:56:59', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1594, NULL, 'READ', 'productos', '2025-06-25 03:56:59', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1595, NULL, 'READ', 'productos', '2025-06-25 03:59:40', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1596, NULL, 'READ', 'productos', '2025-06-25 03:59:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1597, NULL, 'READ', 'productos', '2025-06-25 03:59:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1598, NULL, 'READ', 'productos', '2025-06-25 03:59:40', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1599, NULL, 'READ', 'productos', '2025-06-25 03:59:50', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1600, NULL, 'READ', 'productos', '2025-06-25 03:59:50', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1601, NULL, 'READ', 'productos', '2025-06-25 03:59:50', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1602, NULL, 'READ', 'productos', '2025-06-25 03:59:50', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1603, NULL, 'READ', 'productos', '2025-06-25 04:00:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1604, NULL, 'READ', 'productos', '2025-06-25 04:00:15', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1605, NULL, 'READ', 'productos', '2025-06-25 04:00:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1606, NULL, 'READ', 'productos', '2025-06-25 04:00:15', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1607, NULL, 'READ', 'productos', '2025-06-25 04:00:33', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1608, NULL, 'READ', 'productos', '2025-06-25 04:00:33', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1609, NULL, 'READ', 'productos', '2025-06-25 04:00:34', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1610, NULL, 'READ', 'productos', '2025-06-25 04:00:34', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1611, NULL, 'READ', 'productos', '2025-06-25 04:00:41', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1612, NULL, 'READ', 'productos', '2025-06-25 04:00:41', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1613, NULL, 'READ', 'productos', '2025-06-25 04:00:41', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1614, NULL, 'READ', 'productos', '2025-06-25 04:00:41', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1615, NULL, 'READ', 'productos', '2025-06-25 04:01:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1616, NULL, 'READ', 'productos', '2025-06-25 04:01:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1617, NULL, 'READ', 'productos', '2025-06-25 04:01:20', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1618, NULL, 'READ', 'productos', '2025-06-25 04:01:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1619, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:01:58', 'Inicio de sesión exitoso del usuario: erick tiznado (tiznadoerick853@gmail.com)'),
(1620, NULL, 'READ', 'productos', '2025-06-25 04:01:59', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1621, NULL, 'READ', 'productos', '2025-06-25 04:01:59', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1622, NULL, 'READ', 'productos', '2025-06-25 04:01:59', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1623, NULL, 'READ', 'productos', '2025-06-25 04:01:59', '[ANONIMO]: Productos más populares consultados exitosamente - 3 productos encontrados'),
(1624, NULL, 'UPDATE', 'productos', '2025-06-25 04:04:04', '[ADMIN] erick tiznado (tiznadoerick3@gmail.com): Producto actualizado: \"Pizza de camarón1\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(1625, NULL, 'READ', 'productos', '2025-06-25 04:04:04', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1626, NULL, 'UPDATE', 'productos', '2025-06-25 04:04:13', '[ADMIN] erick tiznado (tiznadoerick3@gmail.com): Producto actualizado: \"Pizza de camarón1\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(1627, NULL, 'READ', 'productos', '2025-06-25 04:04:14', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1628, NULL, 'READ', 'productos', '2025-06-25 04:04:17', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1629, NULL, 'UPDATE', 'productos', '2025-06-25 04:04:31', '[ADMIN] erick tiznado (tiznadoerick3@gmail.com): Producto actualizado: \"Pizza de camarón1\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(1630, NULL, 'READ', 'productos', '2025-06-25 04:04:31', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1631, NULL, 'READ', 'productos', '2025-06-25 04:04:34', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1632, NULL, 'READ', 'productos', '2025-06-25 04:10:26', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1633, NULL, 'READ', 'productos', '2025-06-25 04:10:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1634, NULL, 'READ', 'productos', '2025-06-25 04:10:26', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1635, NULL, 'READ', 'productos', '2025-06-25 04:10:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1636, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:10:35', 'Inicio de sesión exitoso del usuario: milenas (milu.zelaya02@gmail.com)'),
(1637, NULL, 'READ', 'productos', '2025-06-25 04:10:36', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1638, NULL, 'READ', 'productos', '2025-06-25 04:10:37', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1639, NULL, 'READ', 'productos', '2025-06-25 04:10:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1640, NULL, 'READ', 'productos', '2025-06-25 04:10:37', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1641, NULL, 'READ', 'productos', '2025-06-25 04:10:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1642, NULL, 'UPDATE', 'productos', '2025-06-25 04:10:47', '[ADMIN] erick tiznado (tiznadoerick3@gmail.com): Producto actualizado: \"Pizza de camarón\" (ID: 8) en categoría \"Pizza\" con 4 precios actualizados'),
(1643, NULL, 'READ', 'productos', '2025-06-25 04:10:47', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1644, NULL, 'READ', 'productos', '2025-06-25 04:10:51', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1645, NULL, 'READ', 'productos', '2025-06-25 04:10:53', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1646, NULL, 'READ', 'productos', '2025-06-25 04:10:53', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1647, NULL, 'READ', 'productos', '2025-06-25 04:10:54', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1648, NULL, 'READ', 'productos', '2025-06-25 04:10:54', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1649, NULL, 'READ', 'productos', '2025-06-25 04:12:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1650, NULL, 'READ', 'productos', '2025-06-25 04:12:15', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1651, NULL, 'READ', 'productos', '2025-06-25 04:12:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1652, NULL, 'READ', 'productos', '2025-06-25 04:12:15', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1653, NULL, 'READ', 'productos', '2025-06-25 04:13:28', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1654, NULL, 'READ', 'productos', '2025-06-25 04:13:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1655, NULL, 'READ', 'productos', '2025-06-25 04:13:28', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1656, NULL, 'READ', 'productos', '2025-06-25 04:13:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1657, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:13:37', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1658, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:13:52', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1659, NULL, 'READ', 'productos', '2025-06-25 04:14:10', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1660, NULL, 'READ', 'productos', '2025-06-25 04:14:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1661, NULL, 'READ', 'productos', '2025-06-25 04:14:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1662, NULL, 'READ', 'productos', '2025-06-25 04:14:10', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1663, NULL, 'READ', 'productos', '2025-06-25 04:16:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1664, NULL, 'READ', 'productos', '2025-06-25 04:16:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1665, NULL, 'READ', 'productos', '2025-06-25 04:16:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1666, NULL, 'READ', 'productos', '2025-06-25 04:16:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1667, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:16:28', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1668, NULL, 'READ', 'productos', '2025-06-25 04:18:01', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1669, NULL, 'READ', 'productos', '2025-06-25 04:18:01', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1670, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:18:21', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1671, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:18:24', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1672, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:18:27', 'Intento de inicio de sesión fallido para usuario con correo: tiznadoerick3@gmail.com'),
(1673, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:18:44', 'Intento de inicio de sesión fallido para usuario con correo: milu.zelaya02@gmail.com'),
(1674, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:18:53', 'Intento de inicio de sesión fallido para usuario con correo: milu.zelaya02@gmail.com'),
(1675, NULL, 'READ', 'productos', '2025-06-25 04:19:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1676, NULL, 'READ', 'productos', '2025-06-25 04:19:01', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1677, NULL, 'READ', 'productos', '2025-06-25 04:19:01', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1678, NULL, 'READ', 'productos', '2025-06-25 04:19:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1679, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:19:07', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1680, NULL, 'READ', 'productos', '2025-06-25 04:19:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1681, NULL, 'READ', 'productos', '2025-06-25 04:19:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1682, NULL, 'READ', 'productos', '2025-06-25 04:19:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1683, NULL, 'READ', 'productos', '2025-06-25 04:19:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1684, NULL, 'READ', 'productos', '2025-06-25 04:20:07', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1685, NULL, 'READ', 'productos', '2025-06-25 04:20:07', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1686, NULL, 'READ', 'productos', '2025-06-25 04:20:07', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1687, NULL, 'READ', 'productos', '2025-06-25 04:20:07', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1688, NULL, 'READ', 'productos', '2025-06-25 04:20:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1689, NULL, 'READ', 'productos', '2025-06-25 04:20:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1690, NULL, 'READ', 'productos', '2025-06-25 04:20:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1691, NULL, 'READ', 'productos', '2025-06-25 04:20:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1692, NULL, 'READ', 'productos', '2025-06-25 04:21:07', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1693, NULL, 'READ', 'productos', '2025-06-25 04:21:07', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1694, NULL, 'READ', 'productos', '2025-06-25 04:21:08', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1695, NULL, 'READ', 'productos', '2025-06-25 04:21:08', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1696, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:23:05', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1697, NULL, 'READ', 'productos', '2025-06-25 04:23:06', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1698, NULL, 'READ', 'productos', '2025-06-25 04:23:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1699, NULL, 'READ', 'productos', '2025-06-25 04:23:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1700, NULL, 'READ', 'productos', '2025-06-25 04:23:06', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1701, NULL, 'READ', 'productos', '2025-06-25 04:25:17', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1702, NULL, 'READ', 'productos', '2025-06-25 04:25:17', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1703, NULL, 'READ', 'productos', '2025-06-25 04:25:18', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1704, NULL, 'READ', 'productos', '2025-06-25 04:25:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1705, NULL, 'READ', 'productos', '2025-06-25 04:26:10', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1706, NULL, 'READ', 'productos', '2025-06-25 04:26:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1707, NULL, 'READ', 'productos', '2025-06-25 04:26:10', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1708, NULL, 'READ', 'productos', '2025-06-25 04:26:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1709, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:26:52', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1710, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:27:41', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1711, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:27:49', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1712, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 04:27:57', 'Intento de inicio de sesión fallido para usuario con correo: nathy.zelaya55@gmail.com'),
(1713, NULL, 'LOGIN', 'usuarios', '2025-06-25 04:29:16', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(1714, NULL, 'READ', 'productos', '2025-06-25 04:29:18', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1715, NULL, 'READ', 'productos', '2025-06-25 04:29:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1716, NULL, 'READ', 'productos', '2025-06-25 04:29:18', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1717, NULL, 'READ', 'productos', '2025-06-25 04:29:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1718, NULL, 'READ', 'productos', '2025-06-25 14:57:37', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1719, NULL, 'READ', 'productos', '2025-06-25 14:57:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1720, NULL, 'READ', 'productos', '2025-06-25 14:57:37', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1721, NULL, 'READ', 'productos', '2025-06-25 14:57:37', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1722, NULL, 'READ', 'productos', '2025-06-25 14:57:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1723, NULL, 'READ', 'productos', '2025-06-25 14:57:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1724, NULL, 'READ', 'productos', '2025-06-25 14:57:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1725, NULL, 'READ', 'productos', '2025-06-25 14:57:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1726, NULL, 'READ', 'productos', '2025-06-25 14:58:05', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1727, NULL, 'READ', 'productos', '2025-06-25 14:58:05', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1728, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 14:58:30', 'Intento de inicio de sesión fallido para usuario con correo: milu.zelaya02@gmail.com'),
(1729, NULL, 'READ', 'productos', '2025-06-25 16:32:05', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1730, NULL, 'READ', 'productos', '2025-06-25 16:32:05', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1731, NULL, 'READ', 'productos', '2025-06-25 16:32:05', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1732, NULL, 'READ', 'productos', '2025-06-25 16:32:05', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1733, NULL, 'USER_CREATED', 'usuarios', '2025-06-25 16:33:21', 'Nuevo usuario registrado: Milena Caballero (dihac56062@exitbit.com)'),
(1734, NULL, 'LOGIN', 'usuarios', '2025-06-25 16:33:53', 'Inicio de sesión exitoso del usuario: Milena Caballero (dihac56062@exitbit.com)'),
(1735, NULL, 'READ', 'productos', '2025-06-25 16:33:54', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1736, NULL, 'READ', 'productos', '2025-06-25 16:33:54', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1737, NULL, 'READ', 'productos', '2025-06-25 16:33:54', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1738, NULL, 'READ', 'productos', '2025-06-25 16:33:54', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1739, NULL, 'READ', 'productos', '2025-06-25 16:34:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1740, NULL, 'READ', 'productos', '2025-06-25 16:34:20', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1741, NULL, 'READ', 'productos', '2025-06-25 16:34:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1742, NULL, 'READ', 'productos', '2025-06-25 16:34:20', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1743, NULL, 'LOGIN', 'usuarios', '2025-06-25 16:40:34', 'Inicio de sesión exitoso del usuario: Milena Caballero (dihac56062@exitbit.com)'),
(1744, NULL, 'READ', 'productos', '2025-06-25 16:40:35', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1745, NULL, 'READ', 'productos', '2025-06-25 16:40:35', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1746, NULL, 'READ', 'productos', '2025-06-25 16:40:35', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1747, NULL, 'READ', 'productos', '2025-06-25 16:40:35', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1748, NULL, 'LOGIN', 'usuarios', '2025-06-25 16:41:17', 'Inicio de sesión exitoso del usuario: erick tiznados (tiznadoerick853@gmail.com)'),
(1749, NULL, 'READ', 'productos', '2025-06-25 16:41:19', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1750, NULL, 'READ', 'productos', '2025-06-25 16:41:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1751, NULL, 'READ', 'productos', '2025-06-25 16:41:19', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1752, NULL, 'READ', 'productos', '2025-06-25 16:41:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1753, NULL, 'LOGIN', 'usuarios', '2025-06-25 16:56:48', 'Inicio de sesión exitoso del usuario: Milena Caballero (dihac56062@exitbit.com)'),
(1754, NULL, 'READ', 'productos', '2025-06-25 16:56:49', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1755, NULL, 'READ', 'productos', '2025-06-25 16:56:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1756, NULL, 'READ', 'productos', '2025-06-25 16:56:49', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1757, NULL, 'READ', 'productos', '2025-06-25 16:56:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1758, NULL, 'READ', 'productos', '2025-06-25 16:56:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1759, NULL, 'READ', 'productos', '2025-06-25 16:56:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1760, NULL, 'READ', 'productos', '2025-06-25 16:56:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1761, NULL, 'READ', 'productos', '2025-06-25 16:56:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1762, NULL, 'READ', 'productos', '2025-06-25 17:01:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1763, NULL, 'READ', 'productos', '2025-06-25 17:01:28', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1764, NULL, 'READ', 'productos', '2025-06-25 17:01:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1765, NULL, 'READ', 'productos', '2025-06-25 17:01:28', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1766, NULL, 'LOGIN', 'usuarios', '2025-06-25 17:02:04', 'Inicio de sesión exitoso del usuario: Milena Caballero (dihac56062@exitbit.com)'),
(1767, NULL, 'READ', 'productos', '2025-06-25 17:02:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1768, NULL, 'READ', 'productos', '2025-06-25 17:02:06', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1769, NULL, 'READ', 'productos', '2025-06-25 17:02:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1770, NULL, 'READ', 'productos', '2025-06-25 17:02:06', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1771, NULL, 'READ', 'productos', '2025-06-25 17:04:31', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1772, NULL, 'READ', 'productos', '2025-06-25 17:04:31', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1773, NULL, 'READ', 'productos', '2025-06-25 17:05:20', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1774, NULL, 'READ', 'productos', '2025-06-25 17:05:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1775, NULL, 'READ', 'productos', '2025-06-25 17:05:21', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1776, NULL, 'READ', 'productos', '2025-06-25 17:05:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1777, NULL, 'READ', 'productos', '2025-06-25 17:05:24', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1778, NULL, 'READ', 'productos', '2025-06-25 17:05:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1779, NULL, 'READ', 'productos', '2025-06-25 17:05:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1780, NULL, 'READ', 'productos', '2025-06-25 17:05:24', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1781, NULL, 'READ', 'productos', '2025-06-25 17:05:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1782, NULL, 'READ', 'productos', '2025-06-25 17:05:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1783, NULL, 'READ', 'productos', '2025-06-25 17:05:30', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1784, NULL, 'READ', 'productos', '2025-06-25 17:05:30', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1785, NULL, 'READ', 'productos', '2025-06-25 17:09:36', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1786, NULL, 'READ', 'productos', '2025-06-25 17:09:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1787, NULL, 'READ', 'productos', '2025-06-25 17:09:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1788, NULL, 'READ', 'productos', '2025-06-25 17:09:36', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1789, NULL, 'READ', 'productos', '2025-06-25 17:10:00', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1790, NULL, 'READ', 'productos', '2025-06-25 17:10:00', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1791, NULL, 'READ', 'productos', '2025-06-25 17:10:01', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1792, NULL, 'READ', 'productos', '2025-06-25 17:10:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1793, NULL, 'READ', 'productos', '2025-06-25 20:04:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1794, NULL, 'READ', 'productos', '2025-06-25 20:04:46', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1795, NULL, 'READ', 'productos', '2025-06-25 20:04:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1796, NULL, 'READ', 'productos', '2025-06-25 20:04:46', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1797, NULL, 'READ', 'productos', '2025-06-25 20:11:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1798, NULL, 'READ', 'productos', '2025-06-25 20:11:30', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1799, NULL, 'READ', 'productos', '2025-06-25 20:11:30', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1800, NULL, 'READ', 'productos', '2025-06-25 20:11:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1801, NULL, 'USER_CREATED', 'usuarios', '2025-06-25 20:13:47', 'Nuevo usuario registrado: tiznao rodriguez (qzpcmcgrp8@illubd.com)'),
(1802, NULL, 'LOGIN', 'usuarios', '2025-06-25 20:14:02', 'Inicio de sesión exitoso del usuario: tiznao rodriguez (qzpcmcgrp8@illubd.com)'),
(1803, NULL, 'READ', 'productos', '2025-06-25 20:14:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1804, NULL, 'READ', 'productos', '2025-06-25 20:14:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1805, NULL, 'READ', 'productos', '2025-06-25 20:14:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1806, NULL, 'READ', 'productos', '2025-06-25 20:14:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1807, NULL, 'LOGIN', 'usuarios', '2025-06-25 20:16:28', 'Inicio de sesión exitoso del usuario: tiznao rodriguez (qzpcmcgrp8@illubd.com)'),
(1808, NULL, 'READ', 'productos', '2025-06-25 20:16:29', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1809, NULL, 'READ', 'productos', '2025-06-25 20:16:29', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1810, NULL, 'READ', 'productos', '2025-06-25 20:16:29', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1811, NULL, 'READ', 'productos', '2025-06-25 20:16:29', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1812, NULL, 'READ', 'productos', '2025-06-25 20:17:46', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1813, NULL, 'READ', 'productos', '2025-06-25 20:17:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1814, NULL, 'READ', 'productos', '2025-06-25 20:17:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1815, NULL, 'READ', 'productos', '2025-06-25 20:17:46', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1816, NULL, 'READ', 'productos', '2025-06-25 20:18:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1817, NULL, 'READ', 'productos', '2025-06-25 20:18:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1818, NULL, 'READ', 'productos', '2025-06-25 20:18:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1819, NULL, 'READ', 'productos', '2025-06-25 20:18:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1820, NULL, 'USER_CREATED', 'usuarios', '2025-06-25 20:21:38', 'Nuevo usuario registrado: tiznado zelaya (la5kw7yyn5@wywnxa.com)'),
(1821, NULL, 'LOGIN', 'usuarios', '2025-06-25 20:21:43', 'Inicio de sesión exitoso del usuario: tiznado zelaya (la5kw7yyn5@wywnxa.com)'),
(1822, NULL, 'READ', 'productos', '2025-06-25 20:21:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1823, NULL, 'READ', 'productos', '2025-06-25 20:21:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1824, NULL, 'READ', 'productos', '2025-06-25 20:21:44', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1825, NULL, 'READ', 'productos', '2025-06-25 20:21:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1826, NULL, 'READ', 'productos', '2025-06-25 20:21:52', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1827, NULL, 'READ', 'productos', '2025-06-25 20:21:52', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1828, NULL, 'READ', 'productos', '2025-06-25 20:21:52', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1829, NULL, 'READ', 'productos', '2025-06-25 20:21:52', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1830, NULL, 'READ', 'productos', '2025-06-25 20:22:19', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1831, NULL, 'READ', 'productos', '2025-06-25 20:22:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1832, NULL, 'READ', 'productos', '2025-06-25 20:22:19', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1833, NULL, 'READ', 'productos', '2025-06-25 20:22:19', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1834, NULL, 'READ', 'productos', '2025-06-25 20:27:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1835, NULL, 'READ', 'productos', '2025-06-25 20:27:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1836, NULL, 'READ', 'productos', '2025-06-25 20:27:09', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1837, NULL, 'READ', 'productos', '2025-06-25 20:27:09', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1838, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-25 20:28:59', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com)'),
(1839, NULL, 'READ', 'productos', '2025-06-25 20:29:25', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1840, NULL, 'LOGIN', 'usuarios', '2025-06-25 20:30:52', 'Inicio de sesión exitoso del usuario: milena (milu.zelaya02@gmail.com)'),
(1841, NULL, 'READ', 'productos', '2025-06-25 20:30:55', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1842, NULL, 'READ', 'productos', '2025-06-25 20:30:55', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1843, NULL, 'READ', 'productos', '2025-06-25 20:30:55', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1844, NULL, 'READ', 'productos', '2025-06-25 20:30:55', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1845, NULL, 'READ', 'productos', '2025-06-25 20:31:11', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1846, NULL, 'READ', 'productos', '2025-06-25 20:31:11', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1847, NULL, 'READ', 'productos', '2025-06-25 20:31:12', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1848, NULL, 'READ', 'productos', '2025-06-25 20:31:12', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1849, NULL, 'READ', 'productos', '2025-06-25 20:31:29', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1850, NULL, 'READ', 'productos', '2025-06-25 20:33:09', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1851, NULL, 'READ', 'productos', '2025-06-25 20:33:28', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(1852, NULL, 'READ', 'productos', '2025-06-25 20:35:43', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1853, NULL, 'READ', 'productos', '2025-06-25 20:36:41', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1854, NULL, 'READ', 'productos', '2025-06-25 20:37:39', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1855, NULL, 'READ', 'productos', '2025-06-25 20:37:57', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1856, NULL, 'READ', 'productos', '2025-06-25 20:41:09', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1857, NULL, 'READ', 'productos', '2025-06-25 20:42:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1858, NULL, 'READ', 'productos', '2025-06-25 20:42:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1859, NULL, 'READ', 'productos', '2025-06-25 20:42:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1860, NULL, 'READ', 'productos', '2025-06-25 20:42:04', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1861, NULL, 'READ', 'productos', '2025-06-25 20:48:31', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1862, NULL, 'READ', 'productos', '2025-06-25 20:48:31', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1863, NULL, 'READ', 'productos', '2025-06-25 20:48:32', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1864, NULL, 'READ', 'productos', '2025-06-25 20:48:32', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1865, NULL, 'READ', 'productos', '2025-06-25 20:55:01', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1866, NULL, 'READ', 'productos', '2025-06-25 20:55:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1867, NULL, 'READ', 'productos', '2025-06-25 20:55:01', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1868, NULL, 'READ', 'productos', '2025-06-25 20:55:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1869, NULL, 'READ', 'productos', '2025-06-25 20:55:59', '[ANONIMO]: Menú consultado exitosamente - 24 registros encontrados'),
(1870, 68, 'USER_CREATED', 'usuarios', '2025-06-25 20:59:04', 'Nuevo usuario registrado: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1871, NULL, 'READ', 'productos', '2025-06-25 20:59:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1872, NULL, 'READ', 'productos', '2025-06-25 20:59:06', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1873, NULL, 'READ', 'productos', '2025-06-25 20:59:07', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1874, NULL, 'READ', 'productos', '2025-06-25 20:59:07', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1875, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 20:59:20', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(1876, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 20:59:28', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(1877, 68, 'LOGIN', 'usuarios', '2025-06-25 20:59:31', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1878, NULL, 'READ', 'productos', '2025-06-25 20:59:32', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1879, NULL, 'READ', 'productos', '2025-06-25 20:59:32', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1880, NULL, 'READ', 'productos', '2025-06-25 20:59:33', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1881, NULL, 'READ', 'productos', '2025-06-25 20:59:33', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1882, NULL, 'READ', 'productos', '2025-06-25 20:59:40', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1883, NULL, 'READ', 'productos', '2025-06-25 20:59:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1884, NULL, 'READ', 'productos', '2025-06-25 20:59:40', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1885, NULL, 'READ', 'productos', '2025-06-25 20:59:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1886, NULL, 'READ', 'productos', '2025-06-25 20:59:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1887, NULL, 'READ', 'productos', '2025-06-25 20:59:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1888, NULL, 'READ', 'productos', '2025-06-25 20:59:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1889, NULL, 'READ', 'productos', '2025-06-25 20:59:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1890, NULL, 'READ', 'productos', '2025-06-25 21:01:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1891, NULL, 'READ', 'productos', '2025-06-25 21:01:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1892, NULL, 'READ', 'productos', '2025-06-25 21:01:57', '[ANONIMO]: Productos más populares consultados exitosamente - 2 productos encontrados'),
(1893, NULL, 'READ', 'productos', '2025-06-25 21:01:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 3 productos encontrados'),
(1895, NULL, 'READ', 'productos', '2025-06-25 21:05:35', '[ANONIMO]: Menú consultado exitosamente - 20 registros encontrados'),
(1897, NULL, 'READ', 'productos', '2025-06-25 21:05:43', '[ANONIMO]: Menú consultado exitosamente - 16 registros encontrados'),
(1899, NULL, 'READ', 'productos', '2025-06-25 21:26:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1900, NULL, 'READ', 'productos', '2025-06-25 21:26:30', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1901, NULL, 'READ', 'productos', '2025-06-25 21:26:30', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1902, NULL, 'READ', 'productos', '2025-06-25 21:26:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1903, 69, 'USER_CREATED', 'usuarios', '2025-06-25 21:28:38', 'Nuevo usuario registrado: milena zelaya (la5kw7yyn5@wywnxa.com)'),
(1904, 69, 'LOGIN', 'usuarios', '2025-06-25 21:28:43', 'Inicio de sesión exitoso del usuario: milena zelaya (la5kw7yyn5@wywnxa.com)'),
(1905, NULL, 'READ', 'productos', '2025-06-25 21:28:45', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1906, NULL, 'READ', 'productos', '2025-06-25 21:28:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1907, NULL, 'READ', 'productos', '2025-06-25 21:28:46', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1908, NULL, 'READ', 'productos', '2025-06-25 21:28:46', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1909, NULL, 'READ', 'productos', '2025-06-25 21:29:06', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1910, NULL, 'READ', 'productos', '2025-06-25 21:29:06', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1911, NULL, 'READ', 'productos', '2025-06-25 21:29:11', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1912, NULL, 'READ', 'productos', '2025-06-25 21:29:11', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1913, NULL, 'READ', 'productos', '2025-06-25 21:29:11', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1914, NULL, 'READ', 'productos', '2025-06-25 21:29:11', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1915, NULL, 'READ', 'productos', '2025-06-25 21:29:15', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1916, NULL, 'READ', 'productos', '2025-06-25 21:29:15', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1917, NULL, 'READ', 'productos', '2025-06-25 21:29:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1918, NULL, 'READ', 'productos', '2025-06-25 21:29:18', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1919, NULL, 'READ', 'productos', '2025-06-25 21:29:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1920, NULL, 'READ', 'productos', '2025-06-25 21:29:18', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1921, NULL, 'READ', 'productos', '2025-06-25 21:35:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1922, NULL, 'READ', 'productos', '2025-06-25 21:35:44', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1923, NULL, 'READ', 'productos', '2025-06-25 21:35:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1924, NULL, 'READ', 'productos', '2025-06-25 21:35:45', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1925, 68, 'LOGIN', 'usuarios', '2025-06-25 21:36:16', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1926, NULL, 'READ', 'productos', '2025-06-25 21:36:17', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1927, NULL, 'READ', 'productos', '2025-06-25 21:36:17', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1928, NULL, 'READ', 'productos', '2025-06-25 21:36:18', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1929, NULL, 'READ', 'productos', '2025-06-25 21:36:18', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1930, NULL, 'READ', 'productos', '2025-06-25 21:44:21', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1931, NULL, 'READ', 'productos', '2025-06-25 21:44:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1932, NULL, 'READ', 'productos', '2025-06-25 21:44:21', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1933, NULL, 'READ', 'productos', '2025-06-25 21:44:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1934, 68, 'LOGIN', 'usuarios', '2025-06-25 21:44:43', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1935, NULL, 'READ', 'productos', '2025-06-25 21:44:45', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1936, NULL, 'READ', 'productos', '2025-06-25 21:44:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1937, NULL, 'READ', 'productos', '2025-06-25 21:44:45', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1938, NULL, 'READ', 'productos', '2025-06-25 21:44:45', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1939, 68, 'LOGIN', 'usuarios', '2025-06-25 21:45:47', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1940, NULL, 'READ', 'productos', '2025-06-25 21:45:49', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1941, NULL, 'READ', 'productos', '2025-06-25 21:45:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1942, NULL, 'READ', 'productos', '2025-06-25 21:45:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1943, NULL, 'READ', 'productos', '2025-06-25 21:45:49', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1944, NULL, 'READ', 'productos', '2025-06-25 21:52:25', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1945, NULL, 'READ', 'productos', '2025-06-25 21:52:25', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1946, NULL, 'READ', 'productos', '2025-06-25 21:52:25', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1947, NULL, 'READ', 'productos', '2025-06-25 21:52:25', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1948, NULL, 'READ', 'productos', '2025-06-25 21:53:36', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1949, NULL, 'READ', 'productos', '2025-06-25 21:53:36', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1950, 68, 'LOGIN', 'usuarios', '2025-06-25 21:55:40', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1951, NULL, 'READ', 'productos', '2025-06-25 21:55:41', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1952, NULL, 'READ', 'productos', '2025-06-25 21:55:41', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1953, NULL, 'READ', 'productos', '2025-06-25 21:55:41', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1954, NULL, 'READ', 'productos', '2025-06-25 21:55:41', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1955, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 22:09:38', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(1956, 68, 'LOGIN', 'usuarios', '2025-06-25 22:09:41', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1957, NULL, 'READ', 'productos', '2025-06-25 22:09:42', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1958, NULL, 'READ', 'productos', '2025-06-25 22:09:42', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1959, NULL, 'READ', 'productos', '2025-06-25 22:09:43', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1960, NULL, 'READ', 'productos', '2025-06-25 22:09:43', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1961, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 22:25:36', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(1962, 68, 'LOGIN', 'usuarios', '2025-06-25 22:25:48', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1963, NULL, 'READ', 'productos', '2025-06-25 22:25:50', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1964, NULL, 'READ', 'productos', '2025-06-25 22:25:50', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1965, NULL, 'READ', 'productos', '2025-06-25 22:25:50', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1966, NULL, 'READ', 'productos', '2025-06-25 22:25:50', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1967, 68, 'LOGIN', 'usuarios', '2025-06-25 22:26:27', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1968, NULL, 'READ', 'productos', '2025-06-25 22:26:28', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1969, NULL, 'READ', 'productos', '2025-06-25 22:26:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1970, NULL, 'READ', 'productos', '2025-06-25 22:26:28', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1971, NULL, 'READ', 'productos', '2025-06-25 22:26:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1972, 68, 'LOGIN', 'usuarios', '2025-06-25 22:27:28', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1973, NULL, 'READ', 'productos', '2025-06-25 22:27:30', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1974, NULL, 'READ', 'productos', '2025-06-25 22:27:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1975, NULL, 'READ', 'productos', '2025-06-25 22:27:30', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1976, NULL, 'READ', 'productos', '2025-06-25 22:27:30', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1977, NULL, 'READ', 'productos', '2025-06-25 22:27:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1978, NULL, 'READ', 'productos', '2025-06-25 22:27:38', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1979, NULL, 'READ', 'productos', '2025-06-25 22:27:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1980, NULL, 'READ', 'productos', '2025-06-25 22:27:38', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1981, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 22:27:56', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(1982, 68, 'LOGIN', 'usuarios', '2025-06-25 22:28:04', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(1983, NULL, 'READ', 'productos', '2025-06-25 22:28:06', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1984, NULL, 'READ', 'productos', '2025-06-25 22:28:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1985, NULL, 'READ', 'productos', '2025-06-25 22:28:06', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1986, NULL, 'READ', 'productos', '2025-06-25 22:28:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1987, NULL, 'READ', 'productos', '2025-06-25 22:28:21', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1988, NULL, 'READ', 'productos', '2025-06-25 22:28:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1989, NULL, 'READ', 'productos', '2025-06-25 22:28:21', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(1990, NULL, 'READ', 'productos', '2025-06-25 22:28:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(1992, NULL, 'READ', 'productos', '2025-06-25 22:47:04', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1993, NULL, 'READ', 'productos', '2025-06-25 22:47:15', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1994, NULL, 'READ', 'productos', '2025-06-25 22:48:12', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1995, NULL, 'UPDATE', 'productos', '2025-06-25 22:48:15', 'Producto ID 13 cambiado a activo'),
(1996, NULL, 'READ', 'productos', '2025-06-25 22:48:18', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1997, NULL, 'READ', 'productos', '2025-06-25 22:49:08', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(1999, NULL, 'READ', 'productos', '2025-06-25 22:49:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2000, NULL, 'READ', 'productos', '2025-06-25 22:50:00', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2001, NULL, 'READ', 'productos', '2025-06-25 22:50:30', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2002, NULL, 'READ', 'productos', '2025-06-25 22:50:30', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2003, NULL, 'READ', 'productos', '2025-06-25 22:50:36', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2004, NULL, 'READ', 'productos', '2025-06-25 22:51:13', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2005, NULL, 'READ', 'productos', '2025-06-25 22:51:17', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2006, NULL, 'READ', 'productos', '2025-06-25 22:51:19', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2007, NULL, 'UPDATE', 'productos', '2025-06-25 22:51:21', 'Producto ID 9 cambiado a inactivo'),
(2008, NULL, 'READ', 'productos', '2025-06-25 22:51:24', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2009, NULL, 'UPDATE', 'productos', '2025-06-25 22:51:25', 'Producto ID 9 cambiado a activo'),
(2010, NULL, 'READ', 'productos', '2025-06-25 23:00:48', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2011, NULL, 'READ', 'productos', '2025-06-25 23:00:48', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2012, NULL, 'READ', 'productos', '2025-06-25 23:00:48', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2013, NULL, 'READ', 'productos', '2025-06-25 23:00:48', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2014, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-25 23:01:27', 'Intento de inicio de sesión fallido para usuario con correo: la5kw7yyn5@wywnxa.com'),
(2015, 69, 'LOGIN', 'usuarios', '2025-06-25 23:01:37', 'Inicio de sesión exitoso del usuario: milena zelaya (la5kw7yyn5@wywnxa.com)'),
(2016, NULL, 'READ', 'productos', '2025-06-25 23:01:38', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2017, NULL, 'READ', 'productos', '2025-06-25 23:01:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2018, NULL, 'READ', 'productos', '2025-06-25 23:01:39', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2019, NULL, 'READ', 'productos', '2025-06-25 23:01:39', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2020, NULL, 'READ', 'productos', '2025-06-25 23:01:57', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2021, NULL, 'READ', 'productos', '2025-06-25 23:01:57', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2022, NULL, 'READ', 'productos', '2025-06-25 23:02:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2023, NULL, 'READ', 'productos', '2025-06-25 23:02:24', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2024, NULL, 'READ', 'productos', '2025-06-25 23:02:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2025, NULL, 'READ', 'productos', '2025-06-25 23:02:24', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2026, 69, 'LOGIN', 'usuarios', '2025-06-25 23:03:26', 'Inicio de sesión exitoso del usuario: milena zelaya (la5kw7yyn5@wywnxa.com)'),
(2027, NULL, 'READ', 'productos', '2025-06-25 23:03:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2028, NULL, 'READ', 'productos', '2025-06-25 23:03:27', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2029, NULL, 'READ', 'productos', '2025-06-25 23:03:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2030, NULL, 'READ', 'productos', '2025-06-25 23:03:28', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2031, NULL, 'READ', 'productos', '2025-06-25 23:05:56', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2032, NULL, 'READ', 'productos', '2025-06-25 23:05:56', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2033, NULL, 'READ', 'productos', '2025-06-25 23:05:56', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2034, NULL, 'READ', 'productos', '2025-06-25 23:05:56', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2035, NULL, 'READ', 'productos', '2025-06-25 23:06:32', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2036, NULL, 'READ', 'productos', '2025-06-25 23:06:32', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2037, NULL, 'READ', 'productos', '2025-06-25 23:06:33', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2038, NULL, 'READ', 'productos', '2025-06-25 23:06:33', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2039, NULL, 'READ', 'productos', '2025-06-26 00:25:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2040, NULL, 'READ', 'productos', '2025-06-26 00:25:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2041, NULL, 'READ', 'productos', '2025-06-26 00:25:28', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2042, NULL, 'READ', 'productos', '2025-06-26 00:25:28', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2043, NULL, 'READ', 'productos', '2025-06-26 00:25:28', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2044, NULL, 'READ', 'productos', '2025-06-26 01:30:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2045, NULL, 'READ', 'productos', '2025-06-26 01:30:38', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2046, NULL, 'READ', 'productos', '2025-06-26 01:30:38', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2047, NULL, 'READ', 'productos', '2025-06-26 01:30:38', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2048, NULL, 'READ', 'productos', '2025-06-26 02:11:30', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2049, NULL, 'READ', 'productos', '2025-06-26 02:11:30', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2050, NULL, 'READ', 'productos', '2025-06-26 02:12:10', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2051, NULL, 'READ', 'productos', '2025-06-26 02:12:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2052, NULL, 'READ', 'productos', '2025-06-26 02:12:10', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2053, NULL, 'READ', 'productos', '2025-06-26 02:12:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2054, 70, 'USER_CREATED', 'usuarios', '2025-06-26 02:13:58', 'Nuevo usuario registrado: José (jose1@gmail.com)'),
(2055, 70, 'LOGIN', 'usuarios', '2025-06-26 02:14:34', 'Inicio de sesión exitoso del usuario: José (jose1@gmail.com)'),
(2056, NULL, 'READ', 'productos', '2025-06-26 02:14:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2057, NULL, 'READ', 'productos', '2025-06-26 02:14:36', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2058, NULL, 'READ', 'productos', '2025-06-26 02:14:36', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2059, NULL, 'READ', 'productos', '2025-06-26 02:14:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2060, NULL, 'READ', 'productos', '2025-06-26 02:15:49', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2061, NULL, 'READ', 'productos', '2025-06-26 02:15:49', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2062, NULL, 'READ', 'productos', '2025-06-26 02:18:46', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2063, NULL, 'READ', 'productos', '2025-06-26 02:18:46', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2064, 70, 'LOGIN', 'usuarios', '2025-06-26 02:19:56', 'Inicio de sesión exitoso del usuario: José (jose1@gmail.com)'),
(2065, NULL, 'READ', 'productos', '2025-06-26 02:19:58', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2066, NULL, 'READ', 'productos', '2025-06-26 02:19:58', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2067, NULL, 'READ', 'productos', '2025-06-26 02:19:58', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2068, NULL, 'READ', 'productos', '2025-06-26 02:19:58', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2069, NULL, 'READ', 'productos', '2025-06-26 02:20:22', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2070, NULL, 'READ', 'productos', '2025-06-26 02:20:22', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2071, NULL, 'READ', 'productos', '2025-06-26 02:50:27', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2072, NULL, 'READ', 'productos', '2025-06-26 02:50:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2073, NULL, 'READ', 'productos', '2025-06-26 02:50:27', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2074, NULL, 'READ', 'productos', '2025-06-26 02:50:27', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2075, NULL, 'READ', 'productos', '2025-06-26 02:50:48', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2076, NULL, 'READ', 'productos', '2025-06-26 02:50:48', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2077, NULL, 'READ', 'productos', '2025-06-26 02:50:48', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2078, NULL, 'READ', 'productos', '2025-06-26 02:50:48', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2079, NULL, 'READ', 'productos', '2025-06-26 02:51:20', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2080, NULL, 'READ', 'productos', '2025-06-26 02:51:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2081, NULL, 'READ', 'productos', '2025-06-26 02:51:20', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2082, NULL, 'READ', 'productos', '2025-06-26 02:51:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2083, NULL, 'READ', 'productos', '2025-06-26 02:51:44', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2084, NULL, 'READ', 'productos', '2025-06-26 02:51:44', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2086, NULL, 'READ', 'productos', '2025-06-27 03:28:20', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2087, NULL, 'READ', 'productos', '2025-06-27 03:28:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2088, NULL, 'READ', 'productos', '2025-06-27 03:28:20', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2089, NULL, 'READ', 'productos', '2025-06-27 03:28:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2090, 69, 'LOGIN', 'usuarios', '2025-06-27 03:28:24', 'Inicio de sesión exitoso del usuario: milena zelaya (la5kw7yyn5@wywnxa.com)'),
(2091, NULL, 'READ', 'productos', '2025-06-27 03:28:26', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2092, NULL, 'READ', 'productos', '2025-06-27 03:28:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2093, NULL, 'READ', 'productos', '2025-06-27 03:28:26', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2094, NULL, 'READ', 'productos', '2025-06-27 03:28:26', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2095, NULL, 'READ', 'productos', '2025-06-27 03:28:47', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2096, NULL, 'READ', 'productos', '2025-06-27 03:28:47', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2097, NULL, 'READ', 'productos', '2025-06-27 03:30:49', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2098, NULL, 'READ', 'productos', '2025-06-27 03:44:00', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2099, NULL, 'READ', 'productos', '2025-06-27 03:44:00', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2100, NULL, 'READ', 'productos', '2025-06-27 03:44:00', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2101, NULL, 'READ', 'productos', '2025-06-27 03:44:00', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2102, NULL, 'READ', 'productos', '2025-06-27 03:47:58', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2103, NULL, 'READ', 'productos', '2025-06-27 03:47:58', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2104, NULL, 'READ', 'productos', '2025-06-27 03:47:58', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2105, NULL, 'READ', 'productos', '2025-06-27 03:47:58', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2106, NULL, 'READ', 'productos', '2025-06-27 03:50:18', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2107, NULL, 'READ', 'productos', '2025-06-27 03:50:19', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2108, NULL, 'LOGIN_FAILED', 'usuarios', '2025-06-27 03:52:01', 'Intento de inicio de sesión fallido para usuario con correo: USIS038521@ugb.edu.sv'),
(2109, 68, 'LOGIN', 'usuarios', '2025-06-27 03:52:04', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(2110, NULL, 'READ', 'productos', '2025-06-27 03:52:06', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2111, NULL, 'READ', 'productos', '2025-06-27 03:52:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2112, NULL, 'READ', 'productos', '2025-06-27 03:52:06', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2113, NULL, 'READ', 'productos', '2025-06-27 03:52:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2114, NULL, 'READ', 'productos', '2025-06-27 03:52:25', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2115, NULL, 'READ', 'productos', '2025-06-27 03:52:25', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2116, NULL, 'READ', 'productos', '2025-06-27 04:11:44', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2117, NULL, 'READ', 'productos', '2025-06-27 04:11:44', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2118, NULL, 'READ', 'productos', '2025-06-27 04:14:33', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2119, NULL, 'READ', 'productos', '2025-06-27 04:14:33', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2120, NULL, 'READ', 'productos', '2025-06-27 04:14:33', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2121, NULL, 'READ', 'productos', '2025-06-27 04:14:33', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2122, NULL, 'READ', 'productos', '2025-06-27 04:14:52', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2123, NULL, 'READ', 'productos', '2025-06-27 04:14:52', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2124, NULL, 'READ', 'productos', '2025-06-27 04:16:31', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2125, NULL, 'READ', 'productos', '2025-06-27 04:16:31', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2126, NULL, 'READ', 'productos', '2025-06-27 04:23:08', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2127, NULL, 'READ', 'productos', '2025-06-27 04:23:08', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2128, NULL, 'READ', 'productos', '2025-06-27 04:23:56', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2129, NULL, 'READ', 'productos', '2025-06-27 04:23:56', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2130, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-27 14:38:36', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com) - ID Admin: 5'),
(2131, NULL, 'READ', 'productos', '2025-06-27 14:52:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2132, NULL, 'READ', 'productos', '2025-06-27 14:52:01', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2133, NULL, 'READ', 'productos', '2025-06-27 14:52:01', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2134, NULL, 'READ', 'productos', '2025-06-27 14:52:01', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2135, NULL, 'READ', 'productos', '2025-06-27 14:52:27', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2136, NULL, 'READ', 'productos', '2025-06-27 14:52:27', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2137, NULL, 'READ', 'productos', '2025-06-27 15:55:50', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2138, NULL, 'READ', 'productos', '2025-06-27 15:55:50', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2139, NULL, 'READ', 'productos', '2025-06-27 16:30:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2140, NULL, 'READ', 'productos', '2025-06-27 16:30:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2141, NULL, 'READ', 'productos', '2025-06-27 16:36:03', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2142, NULL, 'READ', 'productos', '2025-06-27 16:36:03', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2143, NULL, 'READ', 'productos', '2025-06-27 22:57:19', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2144, NULL, 'READ', 'productos', '2025-06-27 22:57:20', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2145, NULL, 'READ', 'productos', '2025-06-27 22:57:21', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2146, NULL, 'READ', 'productos', '2025-06-27 22:57:22', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2147, NULL, 'READ', 'productos', '2025-06-27 23:03:15', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2148, NULL, 'READ', 'productos', '2025-06-27 23:03:16', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2149, NULL, 'READ', 'productos', '2025-06-27 23:03:17', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2150, NULL, 'READ', 'productos', '2025-06-27 23:03:17', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2151, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-28 01:38:37', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com) - ID Admin: 5'),
(2152, NULL, 'READ', 'productos', '2025-06-28 02:01:52', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2153, NULL, 'READ', 'productos', '2025-06-28 02:01:52', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2154, NULL, 'READ', 'productos', '2025-06-28 02:01:52', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2155, NULL, 'READ', 'productos', '2025-06-28 02:01:52', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2156, NULL, 'READ', 'productos', '2025-06-28 13:55:40', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2157, NULL, 'READ', 'productos', '2025-06-28 13:55:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2158, NULL, 'READ', 'productos', '2025-06-28 13:55:40', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2159, NULL, 'READ', 'productos', '2025-06-28 13:55:40', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2160, 68, 'LOGIN', 'usuarios', '2025-06-28 13:55:55', 'Inicio de sesión exitoso del usuario: Erick Tiznado (USIS038521@ugb.edu.sv)'),
(2161, NULL, 'READ', 'productos', '2025-06-28 13:55:57', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2162, NULL, 'READ', 'productos', '2025-06-28 13:55:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2163, NULL, 'READ', 'productos', '2025-06-28 13:55:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2164, NULL, 'READ', 'productos', '2025-06-28 13:55:57', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2165, NULL, 'READ', 'productos', '2025-06-28 15:10:57', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2166, NULL, 'READ', 'productos', '2025-06-28 15:10:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2167, NULL, 'READ', 'productos', '2025-06-28 15:10:57', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2168, NULL, 'READ', 'productos', '2025-06-28 15:10:57', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2169, NULL, 'READ', 'productos', '2025-06-28 15:18:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2170, NULL, 'READ', 'productos', '2025-06-28 15:18:04', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2171, NULL, 'READ', 'productos', '2025-06-28 15:18:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2172, NULL, 'READ', 'productos', '2025-06-28 15:18:04', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2173, NULL, 'READ', 'productos', '2025-06-28 15:20:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2174, NULL, 'READ', 'productos', '2025-06-28 15:20:04', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2175, NULL, 'READ', 'productos', '2025-06-28 15:20:04', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2176, NULL, 'READ', 'productos', '2025-06-28 15:20:04', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2177, NULL, 'READ', 'productos', '2025-06-28 15:24:44', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2178, NULL, 'READ', 'productos', '2025-06-28 15:24:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2179, NULL, 'READ', 'productos', '2025-06-28 15:24:44', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2180, NULL, 'READ', 'productos', '2025-06-28 15:24:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2181, NULL, 'READ', 'productos', '2025-06-28 15:25:36', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2182, NULL, 'READ', 'productos', '2025-06-28 15:25:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2183, NULL, 'READ', 'productos', '2025-06-28 15:25:36', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2184, NULL, 'READ', 'productos', '2025-06-28 15:25:36', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2185, NULL, 'READ', 'productos', '2025-06-28 15:34:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2186, NULL, 'READ', 'productos', '2025-06-28 15:34:10', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2187, NULL, 'READ', 'productos', '2025-06-28 15:34:10', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2188, NULL, 'READ', 'productos', '2025-06-28 15:34:10', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2189, NULL, 'READ', 'productos', '2025-06-28 17:08:43', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2190, NULL, 'READ', 'productos', '2025-06-28 17:08:43', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2191, NULL, 'READ', 'productos', '2025-06-28 17:08:44', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2192, NULL, 'READ', 'productos', '2025-06-28 17:08:44', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2193, NULL, 'READ', 'productos', '2025-06-28 17:09:03', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2194, NULL, 'READ', 'productos', '2025-06-28 17:09:03', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2195, NULL, 'READ', 'productos', '2025-06-28 19:48:47', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2196, NULL, 'READ', 'productos', '2025-06-28 19:48:47', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2197, NULL, 'READ', 'productos', '2025-06-28 19:48:47', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2198, NULL, 'READ', 'productos', '2025-06-28 19:48:47', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2199, NULL, 'READ', 'productos', '2025-06-28 20:16:49', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2200, NULL, 'READ', 'productos', '2025-06-28 20:16:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2201, NULL, 'READ', 'productos', '2025-06-28 20:16:49', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2202, NULL, 'READ', 'productos', '2025-06-28 20:16:49', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2203, NULL, 'READ', 'productos', '2025-06-28 20:59:24', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2204, NULL, 'READ', 'productos', '2025-06-28 20:59:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2205, NULL, 'READ', 'productos', '2025-06-28 20:59:24', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2206, NULL, 'READ', 'productos', '2025-06-28 20:59:24', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2207, NULL, 'READ', 'productos', '2025-06-28 21:24:05', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2208, NULL, 'READ', 'productos', '2025-06-28 21:24:05', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2209, NULL, 'READ', 'productos', '2025-06-28 21:24:05', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2210, NULL, 'READ', 'productos', '2025-06-28 21:24:06', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados');
INSERT INTO `logs` (`id_log`, `id_usuario`, `accion`, `tabla_afectada`, `fecha_hora`, `descripcion`) VALUES
(2211, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-28 23:01:05', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com) - ID Admin: 5'),
(2212, NULL, 'READ', 'productos', '2025-06-28 23:01:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2213, NULL, 'READ', 'productos', '2025-06-28 23:01:34', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2214, NULL, 'READ', 'productos', '2025-06-28 23:01:34', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2215, NULL, 'READ', 'productos', '2025-06-28 23:01:34', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2216, NULL, 'READ', 'productos', '2025-06-28 23:01:34', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2217, NULL, 'READ', 'productos', '2025-06-28 23:02:01', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2218, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-28 23:07:12', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com) - ID Admin: 5'),
(2219, NULL, 'READ', 'productos', '2025-06-28 23:09:09', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2220, NULL, 'READ', 'productos', '2025-06-28 23:09:29', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2221, NULL, 'READ', 'productos', '2025-06-29 04:58:51', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2222, NULL, 'READ', 'productos', '2025-06-29 04:58:51', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2223, NULL, 'READ', 'productos', '2025-06-29 04:58:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2224, NULL, 'READ', 'productos', '2025-06-29 04:58:51', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2225, NULL, 'ADMIN_LOGIN', 'administradores', '2025-06-29 13:36:20', 'Login exitoso para administrador: erick tiznado (tiznadoerick3@gmail.com) - ID Admin: 5'),
(2226, NULL, 'READ', 'productos', '2025-06-29 13:36:23', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2227, NULL, 'UPDATE', 'productos', '2025-06-29 13:36:28', 'Producto ID 9 cambiado a inactivo'),
(2228, NULL, 'UPDATE', 'productos', '2025-06-29 13:36:29', 'Producto ID 9 cambiado a activo'),
(2229, NULL, 'READ', 'productos', '2025-06-29 13:38:41', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2230, NULL, 'READ', 'productos', '2025-06-29 13:39:02', '[ANONIMO]: Menú consultado exitosamente - 12 registros encontrados'),
(2231, NULL, 'READ', 'productos', '2025-06-29 14:02:12', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2232, NULL, 'READ', 'productos', '2025-06-29 14:02:12', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados'),
(2233, NULL, 'READ', 'productos', '2025-06-29 14:02:12', '[ANONIMO]: Productos más populares consultados exitosamente - 1 productos encontrados'),
(2234, NULL, 'READ', 'productos', '2025-06-29 14:02:12', '[ANONIMO]: Recomendaciones de la casa consultadas exitosamente - 2 productos encontrados');

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
(1, 'Nuevo Pedido', 'Pedido AQAOWA3X por $6.78', 'pedido', '2025-06-14 03:23:47', 'leida'),
(2, 'Nuevo Pedido', 'Pedido 79042Z29 por $4.52', 'pedido', '2025-06-14 04:57:38', 'leida'),
(3, 'Nuevo Pedido', 'Pedido 7YXBOGNT por $4.52', 'pedido', '2025-06-14 05:02:47', 'leida'),
(4, 'Nuevo Pedido', 'Pedido HQY73VMK por $4.52', 'pedido', '2025-06-14 05:46:11', 'leida'),
(5, 'Nuevo Pedido', 'Pedido DCO8HO66 por $4.52', 'pedido', '2025-06-14 05:50:54', 'leida'),
(6, 'Nuevo Pedido', 'Pedido WAP2WKAN por $13.56', 'pedido', '2025-06-14 20:16:02', 'leida'),
(7, 'Nuevo Pedido', 'Pedido K6BH2IDQ por $13.56', 'pedido', '2025-06-14 20:17:38', 'leida'),
(8, 'Nuevo Pedido', 'Pedido JSEEVCSE por $13.56', 'pedido', '2025-06-14 20:21:24', 'leida'),
(9, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:28:52', 'leida'),
(10, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:01', 'leida'),
(11, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:06', 'leida'),
(12, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:29:20', 'leida'),
(13, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en proceso', 'success', '2025-06-16 04:33:01', 'leida'),
(14, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: en camino', 'success', '2025-06-16 04:35:26', 'leida'),
(15, 'Estado de pedido actualizado', 'Pedido #9WWWEAQ9 ahora está: Entregado', 'success', '2025-06-16 04:35:30', 'leida'),
(16, 'Estado de pedido actualizado', 'Pedido #RN42H92D ahora está: en proceso', 'success', '2025-06-16 04:43:59', 'leida'),
(17, 'Estado de pedido actualizado', 'Pedido #RN42H92D ahora está: en camino', 'success', '2025-06-16 04:44:14', 'leida'),
(18, 'Estado de pedido actualizado', 'Pedido #JSEEVCSE ahora está: en proceso', 'success', '2025-06-16 04:46:54', 'leida'),
(19, 'Nuevo Pedido', 'Pedido G7AW9Q18 por $4.52', 'pedido', '2025-06-16 16:31:19', 'leida'),
(20, 'Nuevo Pedido', 'Pedido 3L4LN329 por $4.52', 'pedido', '2025-06-16 16:31:19', 'leida'),
(21, 'Nuevo Pedido', 'Pedido AE4ZC6RH por $4.52', 'pedido', '2025-06-16 16:31:21', 'leida'),
(22, 'Nuevo Pedido', 'Pedido 8TIJ1QRC por $4.52', 'pedido', '2025-06-17 10:07:47', 'leida'),
(23, 'Nuevo Pedido', 'Pedido 5GT39WK9 por $4.52', 'pedido', '2025-06-17 10:11:39', 'leida'),
(24, 'Nuevo Pedido', 'Pedido ZPYN9PXJ por $4.52', 'pedido', '2025-06-17 10:11:50', 'leida'),
(25, 'Nuevo Pedido', 'Pedido YT48URA8 por $4.52', 'pedido', '2025-06-17 10:14:25', 'leida'),
(26, 'Nuevo Pedido', 'Pedido 1LQVPXTN por $4.52', 'pedido', '2025-06-17 10:15:28', 'leida'),
(27, 'Nuevo Pedido', 'Pedido QD7KS74J por $4.52', 'pedido', '2025-06-19 01:58:28', 'leida'),
(28, 'Nuevo Pedido', 'Pedido XTBKCOBG por $7.02', 'pedido', '2025-06-19 02:02:14', 'leida'),
(29, 'Nuevo Pedido', 'Pedido TYKVG3YW por $7.02', 'pedido', '2025-06-19 02:03:55', 'leida'),
(30, 'Nuevo Pedido', 'Pedido RPITLA4E por $7.02', 'pedido', '2025-06-19 02:05:03', 'leida'),
(31, 'Nuevo Pedido', 'Pedido ZZG10KNI por $4.52', 'pedido', '2025-06-19 02:17:42', 'leida'),
(32, 'Nuevo Pedido', 'Pedido DN61H35I por $9.04', 'pedido', '2025-06-19 02:23:22', 'leida'),
(33, 'Nuevo Pedido', 'Pedido 3TCHQB62 por $4.52', 'pedido', '2025-06-19 02:27:56', 'leida'),
(34, 'Nuevo Pedido', 'Pedido JH6AGGC9 por $4.52', 'pedido', '2025-06-19 02:52:19', 'leida'),
(35, 'Nuevo Pedido', 'Pedido AUT0396Y por $4.52', 'pedido', '2025-06-19 03:18:16', 'leida'),
(36, 'Estado de pedido actualizado', 'Pedido #AUT0396Y ahora está: en proceso', 'success', '2025-06-19 04:17:53', 'leida'),
(37, 'Nuevo Pedido', 'Pedido TUUIQ8CM por $4.52', 'pedido', '2025-06-19 04:17:55', 'leida'),
(38, 'Nuevo Pedido', 'Pedido ILH6GBHF por $4.52', 'pedido', '2025-06-19 04:44:38', 'leida'),
(39, 'Nuevo Pedido', 'Pedido FUK1VYTO por $7.02', 'pedido', '2025-06-19 04:47:59', 'leida'),
(40, 'Nuevo Pedido', 'Pedido CQY7DDLX por $4.52', 'pedido', '2025-06-19 04:51:10', 'leida'),
(41, 'Nuevo Pedido', 'Pedido 3FVHG9FE por $4.52', 'pedido', '2025-06-19 14:31:37', 'leida'),
(42, 'Nuevo Pedido', 'Pedido XJ0GAXKR por $7.02', 'pedido', '2025-06-19 14:31:46', 'leida'),
(43, 'Nuevo Pedido', 'Pedido YXWA3CK4 por $4.52', 'pedido', '2025-06-19 14:32:03', 'leida'),
(44, 'Nuevo Pedido', 'Pedido CT07OAJ6 por $7.02', 'pedido', '2025-06-19 14:32:55', 'leida'),
(45, 'Nuevo Pedido', 'Pedido MR5J97V8 por $7.02', 'pedido', '2025-06-19 14:32:55', 'leida'),
(46, 'Nuevo Pedido', 'Pedido BDIW56YJ por $4.52', 'pedido', '2025-06-19 14:33:05', 'leida'),
(47, 'Nuevo Pedido', 'Pedido P8XPN2AB por $27.12', 'pedido', '2025-06-19 14:34:15', 'leida'),
(48, 'Nuevo Pedido', 'Pedido 05ROSQEZ por $22.60', 'pedido', '2025-06-19 14:34:50', 'leida'),
(49, 'Nuevo Pedido', 'Pedido 0LRW58GP por $4.52', 'pedido', '2025-06-19 14:35:05', 'leida'),
(50, 'Nuevo Pedido', 'Pedido TISOQEUY por $27.12', 'pedido', '2025-06-19 14:35:24', 'leida'),
(51, 'Nuevo Pedido', 'Pedido WE19U49G por $27.12', 'pedido', '2025-06-19 14:35:24', 'leida'),
(52, 'Nuevo Pedido', 'Pedido A0HRGSOF por $9.04', 'pedido', '2025-06-19 14:35:47', 'leida'),
(53, 'Nuevo Pedido', 'Pedido EZQ8OQC8 por $7.02', 'pedido', '2025-06-19 14:36:10', 'leida'),
(54, 'Nuevo Pedido', 'Pedido ERHS8C7V por $7.02', 'pedido', '2025-06-19 14:36:10', 'leida'),
(55, 'Nuevo Pedido', 'Pedido ALSWH46W por $22.60', 'pedido', '2025-06-19 14:37:35', 'leida'),
(56, 'Nuevo Pedido', 'Pedido KL16DHKY por $22.60', 'pedido', '2025-06-19 14:37:35', 'leida'),
(57, 'Nuevo Pedido', 'Pedido 3K73PLZJ por $22.60', 'pedido', '2025-06-19 14:38:59', 'leida'),
(58, 'Nuevo Pedido', 'Pedido MDZTDXLO por $22.60', 'pedido', '2025-06-19 14:38:59', 'leida'),
(59, 'Nuevo Pedido', 'Pedido KARMI5XX por $9.04', 'pedido', '2025-06-19 14:39:00', 'leida'),
(60, 'Nuevo Pedido', 'Pedido O7PNY787 por $4.52', 'pedido', '2025-06-19 14:39:08', 'leida'),
(61, 'Nuevo Pedido', 'Pedido VEYNWCPU por $58.76', 'pedido', '2025-06-19 14:40:21', 'leida'),
(62, 'Nuevo Pedido', 'Pedido BQK03KIC por $58.76', 'pedido', '2025-06-19 14:40:21', 'leida'),
(63, 'Estado de pedido actualizado', 'Pedido #BQK03KIC ahora está: en proceso', 'success', '2025-06-23 00:25:00', 'leida'),
(64, 'Nuevo Pedido', 'Pedido 7O4Z22OA por $4.52', 'pedido', '2025-06-23 22:29:35', 'leida'),
(65, 'Nuevo Pedido', 'Pedido 67N5J2W9 por $4.52', 'pedido', '2025-06-24 02:57:23', 'leida'),
(66, 'Nuevo Pedido', 'Pedido EEISKEQA por $4.52', 'pedido', '2025-06-24 15:02:16', 'leida'),
(67, 'Nuevo Pedido', 'Pedido AJOKTD5N por $4.52', 'pedido', '2025-06-24 16:04:57', 'leida'),
(68, 'Nuevo Pedido', 'Pedido NTABCSOG por $4.52', 'pedido', '2025-06-24 16:36:08', 'leida'),
(69, 'Nuevo Pedido', 'Pedido PPWYTFFW por $4.52', 'pedido', '2025-06-24 16:36:31', 'leida'),
(70, 'Nuevo Pedido', 'Pedido YABFPYSS por $4.52', 'pedido', '2025-06-24 16:41:55', 'leida'),
(71, 'Nuevo Pedido', 'Pedido 0RAQGLD9 por $4.52', 'pedido', '2025-06-24 17:33:32', 'leida'),
(72, 'Nuevo Pedido', 'Pedido SNJUFJF5 por $4.52', 'pedido', '2025-06-24 17:45:22', 'leida'),
(73, 'Nuevo Pedido', 'Pedido O8M9LGWD por $4.52', 'pedido', '2025-06-24 20:39:59', 'leida'),
(74, 'Nuevo Pedido', 'Pedido FOQYZGAM por $4.52', 'pedido', '2025-06-24 21:34:26', 'leida'),
(75, 'Nuevo Pedido', 'Pedido 7JJK1R26 por $4.52', 'pedido', '2025-06-25 00:13:00', 'leida'),
(76, 'Nuevo Pedido', 'Pedido 0ORKVM3U por $4.52', 'pedido', '2025-06-25 00:17:23', 'leida'),
(77, 'Nuevo Pedido', 'Pedido 8TLMGLYU por $4.52', 'pedido', '2025-06-25 00:21:16', 'leida'),
(78, 'Nuevo Pedido', 'Pedido IBKHD4Y4 por $4.52', 'pedido', '2025-06-25 00:22:06', 'leida'),
(79, 'Nuevo Pedido', 'Pedido VV4J701U por $4.52', 'pedido', '2025-06-25 00:27:55', 'leida'),
(80, 'Nuevo Pedido', 'Pedido R104C4NK por $4.52', 'pedido', '2025-06-25 00:30:19', 'leida'),
(81, 'Nuevo Pedido', 'Pedido 6UYDH0AE por $4.52', 'pedido', '2025-06-25 00:40:00', 'leida'),
(82, 'Nuevo Pedido', 'Pedido 7HFGOQXK por $4.52', 'pedido', '2025-06-25 02:50:12', 'leida'),
(83, 'Nuevo Pedido', 'Pedido DM85QBR5 por $4.52', 'pedido', '2025-06-25 03:09:19', 'leida'),
(84, 'Nuevo Pedido', 'Pedido TSMCO1YE por $4.52', 'pedido', '2025-06-25 03:32:01', 'leida'),
(85, 'Nuevo Pedido', 'Pedido 2S7F0SZR por $4.52', 'pedido', '2025-06-25 04:18:00', 'leida'),
(86, 'Nuevo Pedido', 'Pedido SSWUGGAG por $4.52', 'pedido', '2025-06-25 14:58:04', 'leida'),
(87, 'Nuevo Pedido', 'Pedido BYA1DLTH por $4.52', 'pedido', '2025-06-25 23:01:56', 'leida'),
(88, 'Nuevo Pedido', 'Pedido OKYNVT2V por $16.06', 'pedido', '2025-06-26 02:18:34', 'leida'),
(89, 'Nuevo pedido recibido #88', 'Pedidos #88 por un total de $4.52.', 'pedido', '2025-06-26 02:51:42', 'leida'),
(90, 'Nuevo Pedido', 'Pedido FPQ9NKPK por $4.52', 'pedido', '2025-06-26 02:51:43', 'leida'),
(91, 'Nuevo pedido recibido #89', 'Pedidos #89 por un total de $9.04.', 'pedido', '2025-06-27 03:28:45', 'leida'),
(92, 'Nuevo Pedido', 'Pedido FX6Z7T3V por $9.04', 'pedido', '2025-06-27 03:28:45', 'leida'),
(93, 'Nuevo pedido recibido #90', 'Pedidos #90 por un total de $4.52.', 'pedido', '2025-06-27 03:50:15', 'leida'),
(94, 'Nuevo Pedido', 'Pedido BV2XRW2P por $4.52', 'pedido', '2025-06-27 03:50:15', 'leida'),
(95, 'Nuevo pedido recibido #91', 'Pedidos #91 por un total de $4.52.', 'pedido', '2025-06-27 03:52:23', 'leida'),
(96, 'Nuevo Pedido', 'Pedido O2MNOKIM por $4.52', 'pedido', '2025-06-27 03:52:24', 'leida'),
(97, 'Nuevo pedido recibido #92', 'Pedidos #92 por un total de $4.52.', 'pedido', '2025-06-27 04:11:42', 'leida'),
(98, 'Nuevo Pedido', 'Pedido 7LUY3ZU3 por $4.52', 'pedido', '2025-06-27 04:11:42', 'leida'),
(99, 'Nuevo pedido recibido #93', 'Pedidos #93 por un total de $4.52.', 'pedido', '2025-06-27 04:14:50', 'leida'),
(100, 'Nuevo Pedido', 'Pedido VL0XTK45 por $4.52', 'pedido', '2025-06-27 04:14:50', 'leida'),
(101, 'Nuevo pedido recibido #94', 'Pedidos #94 por un total de $4.52.', 'pedido', '2025-06-27 04:16:29', 'leida'),
(102, 'Nuevo Pedido', 'Pedido IXX6VCG5 por $4.52', 'pedido', '2025-06-27 04:16:29', 'leida'),
(103, 'Nuevo pedido recibido #95', 'Pedidos #95 por un total de $4.52.', 'pedido', '2025-06-27 04:23:06', 'leida'),
(104, 'Nuevo Pedido', 'Pedido WYKDQKGD por $4.52', 'pedido', '2025-06-27 04:23:06', 'leida'),
(105, 'Nuevo pedido recibido #96', 'Pedidos #96 por un total de $22.60.', 'pedido', '2025-06-27 04:23:54', 'leida'),
(106, 'Nuevo Pedido', 'Pedido OTUMSD2T por $22.60', 'pedido', '2025-06-27 04:23:54', 'leida'),
(107, 'Nuevo pedido recibido #97', 'Pedidos #97 por un total de $4.52.', 'pedido', '2025-06-27 14:52:26', 'leida'),
(108, 'Nuevo Pedido', 'Pedido Z1NBA066 por $4.52', 'pedido', '2025-06-27 14:52:26', 'leida'),
(109, 'Nuevo pedido recibido #98', 'Pedidos #98 por un total de $4.52.', 'pedido', '2025-06-27 15:55:48', 'leida'),
(110, 'Nuevo Pedido', 'Pedido F5X4LEYR por $4.52', 'pedido', '2025-06-27 15:55:49', 'leida'),
(111, 'Nuevo pedido recibido #99', 'Pedidos #99 por un total de $4.52.', 'pedido', '2025-06-27 16:30:20', 'leida'),
(112, 'Nuevo Pedido', 'Pedido B3QA9YLR por $4.52', 'pedido', '2025-06-27 16:30:20', 'leida'),
(113, 'Nuevo pedido recibido #100', 'Pedidos #100 por un total de $9.04.', 'pedido', '2025-06-27 16:36:01', 'leida'),
(114, 'Nuevo Pedido', 'Pedido XNIIRBYM por $9.04', 'pedido', '2025-06-27 16:36:01', 'leida'),
(115, 'Nuevo pedido recibido #101', 'Pedidos #101 por un total de $4.52.', 'pedido', '2025-06-28 17:09:02', 'leida');

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
  `id_usuario_invitado` int DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL COMMENT 'Referencia del pago (Wompi transaction reference)',
  `payment_authorization` varchar(100) DEFAULT NULL COMMENT 'Código de autorización del pago',
  `payment_completed_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora cuando se completó el pago'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `codigo_pedido`, `id_usuario`, `id_direccion`, `fecha_pedido`, `estado`, `total`, `tipo_cliente`, `metodo_pago`, `nombre_cliente`, `apellido_cliente`, `telefono`, `email`, `num_tarjeta_masked`, `nombre_tarjeta`, `subtotal`, `costo_envio`, `impuestos`, `aceptado_terminos`, `tiempo_estimado_entrega`, `fecha_entrega`, `notas_adicionales`, `id_usuario_invitado`, `payment_reference`, `payment_authorization`, `payment_completed_at`) VALUES
(1, 'FFL7OYRW', NULL, NULL, '2025-06-12 01:43:46', 'pendiente', 20.58, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749692622800@mamamianpizza.com', NULL, NULL, 16.00, 2.50, 2.08, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(2, '86JNAAMD', NULL, NULL, '2025-06-12 03:48:29', 'pendiente', 70.30, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749700105259@mamamianpizza.com', NULL, NULL, 60.00, 2.50, 7.80, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(3, 'DWQOPZOM', NULL, NULL, '2025-06-12 18:28:26', 'pendiente', 56.74, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749752900416@mamamianpizza.com', NULL, NULL, 48.00, 2.50, 6.24, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(4, '5MOK0O59', NULL, NULL, '2025-06-14 00:00:37', 'pendiente', 77.08, 'invitado', 'efectivo', 'Tiznado', 'TiznadoRodriguez', '70830446', 'admin_1749859237052@mamamianpizza.com', NULL, NULL, 66.00, 2.50, 8.58, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(5, 'AQAOWA3X', NULL, NULL, '2025-06-14 03:23:47', 'pendiente', 6.78, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 6.00, 0.00, 0.78, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(6, '79042Z29', NULL, NULL, '2025-06-14 04:57:38', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(7, '7YXBOGNT', NULL, NULL, '2025-06-14 05:02:47', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'HQY73VMK', NULL, NULL, '2025-06-14 05:46:10', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'DCO8HO66', NULL, NULL, '2025-06-14 05:50:54', 'pendiente', 4.52, 'registrado', 'efectivo', NULL, NULL, NULL, 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Q46NPWCZ', NULL, NULL, '2025-06-14 19:24:32', 'pendiente', 43.18, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', 'admin_1749929069946@mamamianpizza.com', NULL, NULL, 36.00, 2.50, 4.68, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(11, 'WAP2WKAN', NULL, NULL, '2025-06-14 20:16:02', 'pendiente', 13.56, 'invitado', 'efectivo', 'mielna', 'wedwefdwe', '70141812', NULL, NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, 2, NULL, NULL, NULL),
(12, 'K6BH2IDQ', NULL, NULL, '2025-06-14 20:17:37', 'pendiente', 13.56, 'invitado', 'efectivo', 'mielna', 'wedwefdwe', '70141812', NULL, NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, 2, NULL, NULL, NULL),
(13, 'JSEEVCSE', NULL, NULL, '2025-06-14 20:21:23', 'en proceso', 13.56, 'registrado', 'efectivo', 'milena zelaya', NULL, '70141812', 'nathy.zelaya55@gmail.com', NULL, NULL, 12.00, 0.00, 1.56, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'RN42H92D', NULL, NULL, '2025-06-15 17:16:12', 'en camino', 11.54, 'invitado', 'efectivo', 'ERICK1213', 'TIZNADO', '70830446', 'admin_1750007765841@mamamianpizza.com', NULL, NULL, 8.00, 2.50, 1.04, 1, 30, NULL, NULL, 1, NULL, NULL, NULL),
(15, '9WWWEAQ9', NULL, NULL, '2025-06-15 17:46:10', 'entregado', 7.02, 'invitado', 'efectivo', 'ERICK2121', 'TIZNADO', '70830446', 'admin_1750009563808@mamamianpizza.com', NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'G7AW9Q18', NULL, NULL, '2025-06-16 16:31:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio Tiznado', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(17, '3L4LN329', NULL, NULL, '2025-06-16 16:31:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio Tiznado', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'AE4ZC6RH', NULL, NULL, '2025-06-16 16:31:21', 'pendiente', 4.52, 'registrado', 'efectivo', 'milu', NULL, '70141812', 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(19, '8TIJ1QRC', NULL, NULL, '2025-06-17 10:07:47', 'pendiente', 4.52, 'invitado', 'efectivo', 'fgdgdfgdf', 'g43534534', '5464645646', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 3, NULL, NULL, NULL),
(20, '5GT39WK9', NULL, NULL, '2025-06-17 10:11:39', 'pendiente', 4.52, 'invitado', 'efectivo', 'fgdgdfgdf', 'g43534534', '5464645646', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 3, NULL, NULL, NULL),
(21, 'ZPYN9PXJ', NULL, NULL, '2025-06-17 10:11:50', 'pendiente', 4.52, 'invitado', 'efectivo', 'fgdgdfgdf', 'g43534534', '5464645646', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 3, NULL, NULL, NULL),
(22, 'YT48URA8', NULL, NULL, '2025-06-17 10:14:24', 'pendiente', 4.52, 'registrado', 'efectivo', 'hfghfgh', NULL, '3534534535', 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(23, '1LQVPXTN', NULL, NULL, '2025-06-17 10:15:28', 'pendiente', 4.52, 'registrado', 'efectivo', '435345345', NULL, '353453535', 'nathy.zelaya55@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'QD7KS74J', NULL, NULL, '2025-06-19 01:58:28', 'pendiente', 4.52, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(28, 'XTBKCOBG', NULL, NULL, '2025-06-19 02:02:14', 'pendiente', 7.02, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 45, NULL, NULL, 1, NULL, NULL, NULL),
(29, 'TYKVG3YW', NULL, NULL, '2025-06-19 02:03:54', 'pendiente', 7.02, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 45, NULL, NULL, 1, NULL, NULL, NULL),
(30, 'RPITLA4E', NULL, NULL, '2025-06-19 02:05:02', 'pendiente', 7.02, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 45, NULL, NULL, 1, NULL, NULL, NULL),
(31, 'ZZG10KNI', NULL, NULL, '2025-06-19 02:17:41', 'pendiente', 4.52, 'registrado', 'efectivo', 'dfgdfgdf', 'dfgfdgdfgd', '45456754756', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'DN61H35I', NULL, NULL, '2025-06-19 02:23:22', 'pendiente', 9.04, 'invitado', 'efectivo', 'ERICK', 'TIZNADO', '70830446', NULL, NULL, NULL, 8.00, 0.00, 1.04, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(33, '3TCHQB62', NULL, NULL, '2025-06-19 02:27:55', 'pendiente', 4.52, 'registrado', 'efectivo', 'yuiuyiuy', 'iyuiyuiyui', '867867867', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'JH6AGGC9', NULL, NULL, '2025-06-19 02:52:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'rtetert', 'etrtet', '354534543', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'AUT0396Y', NULL, NULL, '2025-06-19 03:18:15', 'en proceso', 4.52, 'registrado', 'efectivo', 'thrghfgh', 'tryrthfdghfg', '56456456456', 'nathy.zelaya5@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'TUUIQ8CM', NULL, NULL, '2025-06-19 04:17:55', 'pendiente', 4.52, 'registrado', 'efectivo', 'gsfhfghfg', 'hfghfghfghfg', '454564565464', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'ILH6GBHF', NULL, NULL, '2025-06-19 04:44:37', 'pendiente', 4.52, 'registrado', 'efectivo', 'rgergreg', 'etertertert', '5434534534', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'FUK1VYTO', NULL, NULL, '2025-06-19 04:47:59', 'pendiente', 7.02, 'registrado', 'efectivo', 'Jose', 'Lobos', '55487848', 'alex1@gmail.com', NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'CQY7DDLX', NULL, NULL, '2025-06-19 04:51:09', 'pendiente', 4.52, 'registrado', 'efectivo', 'tretertert', 'etertertert', '534534534534', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(40, '3FVHG9FE', NULL, NULL, '2025-06-19 14:31:36', 'pendiente', 4.52, 'registrado', 'efectivo', 'erick', 'mau', '70141812', 'tiznadoerick53@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'XJ0GAXKR', NULL, NULL, '2025-06-19 14:31:45', 'pendiente', 7.02, 'registrado', 'efectivo', 'Jose', 'Lobos', '78829539', 'alex3@gmail.com', NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'YXWA3CK4', NULL, NULL, '2025-06-19 14:32:03', 'pendiente', 4.52, 'invitado', 'efectivo', 'Yeferin', 'Campos', '79058406', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 4, NULL, NULL, NULL),
(43, 'CT07OAJ6', NULL, NULL, '2025-06-19 14:32:54', 'pendiente', 7.02, 'invitado', 'efectivo', 'Alex', 'Jose', '55487666', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, 5, NULL, NULL, NULL),
(44, 'MR5J97V8', NULL, NULL, '2025-06-19 14:32:54', 'pendiente', 7.02, 'invitado', 'efectivo', 'Alex', 'Jose', '55487666', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, 5, NULL, NULL, NULL),
(45, 'BDIW56YJ', NULL, NULL, '2025-06-19 14:33:05', 'pendiente', 4.52, 'invitado', 'efectivo', 'Stanley', 'Larin', '72602346', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 6, NULL, NULL, NULL),
(46, 'P8XPN2AB', NULL, NULL, '2025-06-19 14:34:14', 'pendiente', 27.12, 'invitado', 'efectivo', 'Pedro', 'Torres', '58489833', NULL, NULL, NULL, 24.00, 0.00, 3.12, 1, 25, NULL, NULL, 7, NULL, NULL, NULL),
(47, '05ROSQEZ', NULL, NULL, '2025-06-19 14:34:50', 'pendiente', 22.60, 'invitado', 'efectivo', 'Stanley ', 'Larin', '72602346', NULL, NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, 6, NULL, NULL, NULL),
(48, '0LRW58GP', NULL, NULL, '2025-06-19 14:35:05', 'pendiente', 4.52, 'invitado', 'efectivo', 'tiznado', 'rodriguez', '78945654', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 8, NULL, NULL, NULL),
(49, 'TISOQEUY', NULL, NULL, '2025-06-19 14:35:24', 'pendiente', 27.12, 'invitado', 'efectivo', 'Karla', 'Rodríguez ', '55596422', NULL, NULL, NULL, 24.00, 0.00, 3.12, 1, 25, NULL, NULL, 9, NULL, NULL, NULL),
(50, 'WE19U49G', NULL, NULL, '2025-06-19 14:35:24', 'pendiente', 27.12, 'invitado', 'efectivo', 'Karla', 'Rodríguez ', '55596422', NULL, NULL, NULL, 24.00, 0.00, 3.12, 1, 25, NULL, NULL, 9, NULL, NULL, NULL),
(51, 'A0HRGSOF', NULL, NULL, '2025-06-19 14:35:47', 'pendiente', 9.04, 'registrado', 'efectivo', 'rodolfo', 'aparicio', '789955656', 'tiznadoerick53@gmail.com', NULL, NULL, 8.00, 0.00, 1.04, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'EZQ8OQC8', NULL, NULL, '2025-06-19 14:36:10', 'pendiente', 7.02, 'invitado', 'efectivo', 'Pedro', 'Tapia', '84554999', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, 10, NULL, NULL, NULL),
(53, 'ERHS8C7V', NULL, NULL, '2025-06-19 14:36:10', 'pendiente', 7.02, 'invitado', 'efectivo', 'Pedro', 'Tapia', '84554999', NULL, NULL, NULL, 4.00, 2.50, 0.52, 1, 30, NULL, NULL, 10, NULL, NULL, NULL),
(54, 'ALSWH46W', NULL, NULL, '2025-06-19 14:37:35', 'pendiente', 22.60, 'registrado', 'efectivo', 'Jose', 'Lonos', '7558999', 'alex3@gmail.com', NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'KL16DHKY', NULL, NULL, '2025-06-19 14:37:35', 'pendiente', 22.60, 'registrado', 'efectivo', 'Jose', 'Lonos', '7558999', 'alex3@gmail.com', NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(57, '3K73PLZJ', NULL, NULL, '2025-06-19 14:38:59', 'pendiente', 22.60, 'invitado', 'efectivo', 'Jose', 'Lobos', '79435457', NULL, NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, 13, NULL, NULL, NULL),
(58, 'MDZTDXLO', NULL, NULL, '2025-06-19 14:38:59', 'pendiente', 22.60, 'invitado', 'efectivo', 'Jose', 'Lobos', '79435457', NULL, NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, 13, NULL, NULL, NULL),
(59, 'KARMI5XX', NULL, NULL, '2025-06-19 14:39:00', 'pendiente', 9.04, 'invitado', 'efectivo', 'Juan Carlos ', 'Martinez ', '79671218', NULL, NULL, NULL, 8.00, 0.00, 1.04, 1, 25, NULL, NULL, 14, NULL, NULL, NULL),
(60, 'O7PNY787', NULL, NULL, '2025-06-19 14:39:07', 'pendiente', 4.52, 'invitado', 'efectivo', 'Nathaly Milena', 'Caballero', '44616454', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 15, NULL, NULL, NULL),
(61, 'VEYNWCPU', NULL, NULL, '2025-06-19 14:40:20', 'pendiente', 58.76, 'registrado', 'efectivo', 'Prueba', 'Prueba', '58962222', 'alex3@gmail.com', NULL, NULL, 52.00, 0.00, 6.76, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'BQK03KIC', NULL, NULL, '2025-06-19 14:40:21', 'en proceso', 58.76, 'registrado', 'efectivo', 'Prueba', 'Prueba', '58962222', 'alex3@gmail.com', NULL, NULL, 52.00, 0.00, 6.76, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(63, '7O4Z22OA', NULL, NULL, '2025-06-23 22:29:35', 'pendiente', 4.52, 'invitado', 'efectivo', 'jose lobos', NULL, '7943 5457', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 16, NULL, NULL, NULL),
(64, '67N5J2W9', NULL, NULL, '2025-06-24 02:57:23', 'pendiente', 4.52, 'registrado', 'efectivo', 'milena zelaya', NULL, '70141812', 'nathy.zelaya5@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'EEISKEQA', NULL, NULL, '2025-06-24 15:02:16', 'pendiente', 4.52, 'registrado', 'efectivo', 'vbdfgdfg', NULL, '34234435', 'tiznadoerick53@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'AJOKTD5N', NULL, NULL, '2025-06-24 16:04:57', 'pendiente', 4.52, 'invitado', 'efectivo', 'ewrwerewrwe', NULL, '43243423324', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 26, NULL, NULL, NULL),
(67, 'NTABCSOG', NULL, NULL, '2025-06-24 16:36:08', 'pendiente', 4.52, 'invitado', 'efectivo', 'Erick Mauricio Tiznado Rodriguez', NULL, '70830446', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(68, 'PPWYTFFW', NULL, NULL, '2025-06-24 16:36:31', 'pendiente', 4.52, 'invitado', 'efectivo', 'Erick Mauricio Tiznado Rodriguez', NULL, '70830446', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(69, 'YABFPYSS', NULL, NULL, '2025-06-24 16:41:55', 'pendiente', 4.52, 'registrado', 'efectivo', 'erick tiznado', NULL, '324354353', 'tiznadoerick853@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'SNJUFJF5', NULL, NULL, '2025-06-24 17:45:22', 'pendiente', 4.52, 'registrado', 'efectivo', 'yfgyigyigi', NULL, '679697679', 'usis038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'O8M9LGWD', NULL, NULL, '2025-06-24 20:39:58', 'pendiente', 4.52, 'registrado', 'efectivo', 'asdfsfsdf', NULL, '4534565464', 'tiznadoerick853@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 'FOQYZGAM', NULL, NULL, '2025-06-24 21:34:26', 'pendiente', 4.52, 'registrado', 'efectivo', 'tiznaod erixk', NULL, '23456533', 'tiznadoerick853@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(74, '7JJK1R26', NULL, NULL, '2025-06-25 00:12:59', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(75, '0ORKVM3U', NULL, NULL, '2025-06-25 00:17:23', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(76, '8TLMGLYU', NULL, NULL, '2025-06-25 00:21:15', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(77, 'IBKHD4Y4', NULL, NULL, '2025-06-25 00:22:05', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(78, 'VV4J701U', NULL, NULL, '2025-06-25 00:27:54', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(79, 'R104C4NK', NULL, NULL, '2025-06-25 00:30:18', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(80, '6UYDH0AE', NULL, NULL, '2025-06-25 00:39:59', 'pendiente', 4.52, 'invitado', 'efectivo', 'erick tiznados', NULL, '70131412', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 27, NULL, NULL, NULL),
(81, '7HFGOQXK', NULL, NULL, '2025-06-25 02:50:11', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio Tiznado Rodriguez', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 'DM85QBR5', NULL, NULL, '2025-06-25 03:09:19', 'pendiente', 4.52, 'registrado', 'efectivo', 'rewefefrgerfgdf dfsgdgdfgdf', NULL, '601245667', 'tiznadoerick853@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 'TSMCO1YE', NULL, NULL, '2025-06-25 03:32:01', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Mauricio ', NULL, '70830446', 'tiznadoerick3@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(84, '2S7F0SZR', NULL, NULL, '2025-06-25 04:18:00', 'pendiente', 4.52, 'registrado', 'efectivo', 'milena', NULL, '12345678', 'milu.zelaya02@gmail.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 'SSWUGGAG', NULL, NULL, '2025-06-25 14:58:03', 'pendiente', 4.52, 'registrado', 'efectivo', 'José Alexander', NULL, '70141812', 'coxin94240@nab4.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(86, 'BYA1DLTH', 69, 87, '2025-06-25 23:01:56', 'pendiente', 4.52, 'registrado', 'efectivo', 'milena zelaya', NULL, '70141812', 'la5kw7yyn5@wywnxa.com', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(87, 'OKYNVT2V', 71, 88, '2025-06-26 02:18:34', 'pendiente', 16.06, 'invitado', 'efectivo', 'Jose', NULL, '25236666', NULL, NULL, NULL, 12.00, 2.50, 1.56, 1, 30, NULL, NULL, 28, NULL, NULL, NULL),
(88, 'FPQ9NKPK', 72, 89, '2025-06-26 02:51:42', 'pendiente', 4.52, 'invitado', 'efectivo', 'Erick Tiznado', NULL, '70830446', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(89, 'FX6Z7T3V', 69, 90, '2025-06-27 03:28:44', 'pendiente', 9.04, 'registrado', 'efectivo', 'milena zelaya', NULL, '70141812', 'la5kw7yyn5@wywnxa.com', NULL, NULL, 8.00, 0.00, 1.04, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(90, 'BV2XRW2P', 73, 91, '2025-06-27 03:50:15', 'pendiente', 4.52, 'invitado', 'efectivo', 'Erick Mauricio ', NULL, '70830446', NULL, NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, 1, NULL, NULL, NULL),
(91, 'O2MNOKIM', 68, 92, '2025-06-27 03:52:23', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(92, '7LUY3ZU3', 68, 93, '2025-06-27 04:11:42', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 'VL0XTK45', 68, 94, '2025-06-27 04:14:50', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 'IXX6VCG5', 68, 95, '2025-06-27 04:16:29', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 'WYKDQKGD', 68, 96, '2025-06-27 04:23:06', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 'OTUMSD2T', 68, 97, '2025-06-27 04:23:54', 'pendiente', 22.60, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 20.00, 0.00, 2.60, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(97, 'Z1NBA066', 68, 98, '2025-06-27 14:52:26', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(98, 'F5X4LEYR', 68, 99, '2025-06-27 15:55:48', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(99, 'B3QA9YLR', 68, 100, '2025-06-27 16:30:20', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(100, 'XNIIRBYM', 68, 101, '2025-06-27 16:36:01', 'pendiente', 9.04, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 8.00, 0.00, 1.04, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL),
(101, 'N8PVTA31', 68, 102, '2025-06-28 17:09:01', 'pendiente', 4.52, 'registrado', 'efectivo', 'Erick Tiznado', NULL, '70830446', 'USIS038521@ugb.edu.sv', NULL, NULL, 4.00, 0.00, 0.52, 1, 25, NULL, NULL, NULL, NULL, NULL, NULL);

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
(9, 1, 4.00),
(9, 2, 6.00),
(9, 3, 8.00),
(9, 4, 12.00),
(10, 1, 4.00),
(10, 2, 6.00),
(10, 3, 8.00),
(10, 4, 12.00),
(13, 1, 4.00),
(13, 2, 6.00),
(13, 3, 8.00),
(13, 4, 12.00);

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
  `url_pago` varchar(300) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `titulo`, `descripcion`, `seccion`, `id_categoria`, `activo`, `imagen`, `url_pago`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(8, 'Pizza de camarón', 'Salsa de tomate, queso mozzarella y camarón', 'Pizza', 1, 0, 'https://api.mamamianpizza.com/uploads/imagen-1750310646250-158034039.png', '', '2025-06-19 03:43:17', '2025-06-25 21:05:23'),
(9, 'Pizza de curil', 'Salsa de tomate, queso mozzarella y curil', 'Recomendacion de la casa', 1, 1, 'https://api.mamamianpizza.com/uploads/imagen-1750310520016-805362257.png', '', '2025-06-19 03:43:17', '2025-06-29 13:36:29'),
(10, 'Quesos Suprema', 'Salsa de tomate y mezcla de cuatro quesos.', 'Las mas Populares', 1, 1, 'https://api.mamamianpizza.com/uploads/imagen-1750311076277-433255140.png', '', '2025-06-19 03:43:17', '2025-06-19 05:31:42'),
(11, 'Suprema Pizza', 'Salsa de tomate, queso mozzarella, pepperoni, jamón, salami, hongos, aceitunas y vegetales.', 'Pizza', 1, 0, 'https://api.mamamianpizza.com/uploads/imagen-1750311315161-775513065.png', '', '2025-06-19 03:43:17', '2025-06-25 21:05:38'),
(12, 'Pepperoni Pizza', 'Salsa de tomate, queso mozzarella y rodajas de pepperoni.', 'Pizza', 1, 0, 'https://api.mamamianpizza.com/uploads/imagen-1750311403276-455206275.png', '', '2025-06-19 03:43:17', '2025-06-25 22:28:47'),
(13, 'Hawaiana Pizza', 'Salsa de tomate, queso mozzarella, jamón y piña.', 'Recomendacion de la casa', 1, 1, 'https://api.mamamianpizza.com/uploads/imagen-1750311681859-187982278.png', '', '2025-06-19 03:43:17', '2025-06-25 22:48:15');

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
(8, 69, 13, 'Amo la pizza con piña!!!!!!! 😍😍😍😍😍', 5, '2025-06-25 23:02:48', 1);

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
-- Estructura de tabla para la tabla `transacciones_wompi`
--

CREATE TABLE `transacciones_wompi` (
  `id` int NOT NULL,
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wompi_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','cancelled','expired','failed','unknown') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `wompi_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authorization_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wompi_response` longtext COLLATE utf8mb4_unicode_ci,
  `webhook_data` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `transacciones_wompi`
--

INSERT INTO `transacciones_wompi` (`id`, `transaction_reference`, `wompi_transaction_id`, `order_id`, `order_code`, `amount`, `status`, `wompi_status`, `customer_name`, `customer_email`, `customer_phone`, `authorization_code`, `payment_reference`, `payment_method`, `redirect_url`, `created_at`, `completed_at`, `updated_at`, `wompi_response`, `webhook_data`) VALUES
(1, 'MAMA-1751141507774-BKKLC5EAMJM', NULL, NULL, NULL, 4.52, 'pending', NULL, 'Erick Tiznado', 'USIS038521@ugb.edu.sv', '70830446', NULL, NULL, NULL, 'https://u.wompi.sv/398524Auq?ref=MAMA-1751141507774-BKKLC5EAMJM&amount=4.52', '2025-06-28 20:11:47', NULL, '2025-06-28 20:11:47', NULL, NULL),
(2, 'MAMA-1751146655167-OOXTYFFASJH', 'WOMPI3DS-1751146655175', NULL, NULL, 4.52, 'pending', NULL, 'Erick Tiznado', 'USIS038521@ugb.edu.sv', '70830446', NULL, NULL, NULL, 'https://sandbox-checkout.wompi.sv/3ds/MAMA-1751146655167-OOXTYFFASJH', '2025-06-28 21:37:35', NULL, '2025-06-28 21:37:35', '{\"idTransaccion\":\"WOMPI3DS-1751146655175\",\"esReal\":false,\"urlCompletarPago3Ds\":\"https://sandbox-checkout.wompi.sv/3ds/MAMA-1751146655167-OOXTYFFASJH\",\"monto\":4.52}', NULL);

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
  `foto_perfil` varchar(255) DEFAULT NULL,
  `activo` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contrasena`, `celular`, `fecha_nacimiento`, `sexo`, `dui`, `foto_perfil`, `activo`) VALUES
(68, 'Erick Tiznado', 'USIS038521@ugb.edu.sv', '$2b$10$hjMa4c8ZYBf0QlH28MYQbumfW9XQwzZpifkt.UdQU4eUtGyPKykWa', '70830446', '2001-06-02', 'M', '063693309', NULL, 1),
(69, 'milena zelaya', 'la5kw7yyn5@wywnxa.com', '$2b$10$/11CPbM98KwwWOvCSaLSMOOOyLMTcm50u2RzjJ45loirjfiG4oBKC', '70141812', '1967-06-06', 'F', '123456789', 'https://api.mamamianpizza.com/uploads/profiles/profile-1750892534210-993169815.png', 1),
(70, 'José', 'jose1@gmail.com', '$2b$10$gPPk0rOE9gIyfley.2aT0.OyB2O2H2JoGH9.gdQJZhDymzA87JeUe', '65784567', '2025-06-19', 'M', '236789123', NULL, 1),
(71, 'Invitado-Jose', 'invitado_25236666_1750904314703@mamamianpizza.com', '$2b$05$Wa8bOjN3q39pQab47gfFsOlmxouukFv0WHRxjBBlzq115YJi8.gaS', '25236666', NULL, NULL, NULL, NULL, 1),
(72, 'Invitado-Erick Tiznado', 'invitado_70830446_1750906302816@mamamianpizza.com', '$2b$05$NzzGC.1aka70ZRaeGW8x1.D6usWRrnpBblJC5.zfw.eE7gj4cflIS', '70830446', NULL, NULL, NULL, NULL, 1),
(73, 'Invitado-Erick Mauricio ', 'invitado_70830446_1750996215241@mamamianpizza.com', '$2b$05$UASQZtIJl6wV0OJYFlbPu.tWWHzemFntrt1sgP1NvbqLmk/JaoSIm', '70830446', NULL, NULL, NULL, NULL, 1);

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
(1, 'Erick Mauricio ', '', '70830446', '2025-06-12 01:43:46', '2025-06-27 03:50:15'),
(2, 'mielna', 'wedwefdwe', '70141812', '2025-06-14 20:16:02', '2025-06-14 20:17:37'),
(3, 'fgdgdfgdf', 'g43534534', '5464645646', '2025-06-17 10:07:47', '2025-06-17 10:11:50'),
(4, 'Yeferin', 'Campos', '79058406', '2025-06-19 14:32:03', '2025-06-19 14:32:03'),
(5, 'Alex', 'Jose', '55487666', '2025-06-19 14:32:54', '2025-06-19 14:32:54'),
(6, 'Stanley ', 'Larin', '72602346', '2025-06-19 14:33:05', '2025-06-19 14:34:50'),
(7, 'Pedro', 'Torres', '58489833', '2025-06-19 14:34:14', '2025-06-19 14:34:14'),
(8, 'tiznado', 'rodriguez', '78945654', '2025-06-19 14:35:05', '2025-06-19 14:35:05'),
(9, 'Karla', 'Rodríguez ', '55596422', '2025-06-19 14:35:24', '2025-06-19 14:35:24'),
(10, 'Pedro', 'Tapia', '84554999', '2025-06-19 14:36:10', '2025-06-19 14:36:10'),
(13, 'Jose', 'Lobos', '79435457', '2025-06-19 14:38:59', '2025-06-19 14:38:59'),
(14, 'Juan Carlos ', 'Martinez ', '79671218', '2025-06-19 14:39:00', '2025-06-19 14:39:00'),
(15, 'Nathaly Milena', 'Caballero', '44616454', '2025-06-19 14:39:07', '2025-06-19 14:39:07'),
(16, 'jose lobos', '', '7943 5457', '2025-06-23 22:29:35', '2025-06-23 22:29:35'),
(26, 'ewrwerewrwe', '', '43243423324', '2025-06-24 16:04:57', '2025-06-24 16:04:57'),
(27, 'erick tiznados', '', '70131412', '2025-06-25 00:12:59', '2025-06-25 00:39:59'),
(28, 'Jose', '', '25236666', '2025-06-26 02:18:34', '2025-06-26 02:18:34');

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
-- Indices de la tabla `experiencia`
--
ALTER TABLE `experiencia`
  ADD PRIMARY KEY (`id_experiencia`),
  ADD KEY `fk_experiencia_usuario` (`id_usuario`);

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
  ADD KEY `fk_pedido_usuario_invitado` (`id_usuario_invitado`),
  ADD KEY `idx_payment_reference` (`payment_reference`);

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
-- Indices de la tabla `transacciones_wompi`
--
ALTER TABLE `transacciones_wompi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_reference` (`transaction_reference`),
  ADD KEY `idx_transaction_reference` (`transaction_reference`),
  ADD KEY `idx_wompi_transaction_id` (`wompi_transaction_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

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
  MODIFY `id_admin` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_detalle` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT de la tabla `experiencia`
--
ALTER TABLE `experiencia`
  MODIFY `id_experiencia` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2235;

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
  MODIFY `id_notificacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT de la tabla `password_reset`
--
ALTER TABLE `password_reset`
  MODIFY `id_reset` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `recetas`
--
ALTER TABLE `recetas`
  MODIFY `id_receta` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id_resena` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- AUTO_INCREMENT de la tabla `transacciones_wompi`
--
ALTER TABLE `transacciones_wompi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `usuarios_invitados`
--
ALTER TABLE `usuarios_invitados`
  MODIFY `id_usuario_invitado` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
-- Filtros para la tabla `experiencia`
--
ALTER TABLE `experiencia`
  ADD CONSTRAINT `experiencia_ibfk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

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

--
-- Filtros para la tabla `transacciones_wompi`
--
ALTER TABLE `transacciones_wompi`
  ADD CONSTRAINT `fk_transacciones_wompi_order` FOREIGN KEY (`order_id`) REFERENCES `pedidos` (`id_pedido`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
