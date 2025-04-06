# MamaMian Pizza Backend

## 📋 Descripción

Backend para el sistema de gestión y pedidos de MamaMian Pizza. Este proyecto proporciona una API RESTful que maneja autenticación de usuarios, gestión de pedidos, inventario y más.

## 🚀 Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB (o la base de datos utilizada)
- JWT para autenticación
- Otras dependencias relevantes

## ⚙️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/yourusername/MamaMianPizzaBackend.git
cd MamaMianPizzaBackend
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` basado en el ejemplo `.env.example`

4. Inicia el servidor:

```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## 🔑 Características Principales

- Autenticación y autorización para clientes y administradores
- Gestión de usuarios
- Procesamiento de pedidos
- Gestión de inventario
- Generación de informes

## 📡 API Endpoints

### Usuarios

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/users/` | Obtener todos los usuarios | Admin |
| POST | `/api/users/admins` | Crear administrador | Admin |
| POST | `/api/users/login` | Login de administrador | Público |
| POST | `/api/users/users_login` | Login de cliente | Público |
| POST | `/api/users/users_register` | Registro de cliente | Público |

### Otros Endpoints

Documentar aquí los endpoints adicionales...

## 🧪 Pruebas

Para ejecutar las pruebas:

```bash
npm test
```

## 🤝 Contribuciones

1. Haz un fork del proyecto
2. Crea tu rama de funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commits (`git commit -am 'Agrega nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).

## 📞 Contacto

Nombre - [correo electrónico](mailto:tu-email@ejemplo.com)

Link del proyecto: [https://github.com/yourusername/MamaMianPizzaBackend](https://github.com/yourusername/MamaMianPizzaBackend)
