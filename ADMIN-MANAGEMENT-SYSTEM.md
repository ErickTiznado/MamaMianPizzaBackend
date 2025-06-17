# 🛡️ ADMIN MANAGEMENT SYSTEM - API DOCUMENTATION

## Overview
Complete CRUD (Create, Read, Update, Delete) system for managing administrators in the Mama Mian Pizza API. This system provides comprehensive administrator management capabilities with role-based permissions, status management, and detailed statistics.

## Database Structure
The system works with the `administradores` table:
```sql
- id_admin (PRIMARY KEY, AUTO_INCREMENT)
- nombre (VARCHAR, NOT NULL)
- correo (VARCHAR, UNIQUE, NOT NULL)
- contrasena (TEXT, NOT NULL)
- rol (ENUM: 'super_admin', 'admin', 'moderador', NOT NULL)
- celular (VARCHAR, OPTIONAL)
- fecha_creacion (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- ultimo_acceso (TIMESTAMP, NULLABLE)
- activo (BOOLEAN, DEFAULT 1)
```

## 📋 API Endpoints

### 1. Create Administrator
**Endpoint:** `POST /api/users/admins`

**Description:** Creates a new administrator with enhanced security and validations.

**Request Body:**
```json
{
  "nombre": "John Admin",
  "correo": "john.admin@mamamianpizza.com",
  "contrasena": "SecurePassword123!",
  "rol": "admin",
  "celular": "+503 7000-1234"
}
```

**Response (201 - Created):**
```json
{
  "message": "Administrador creado exitosamente",
  "administrador": {
    "id_admin": 1,
    "nombre": "John Admin",
    "correo": "john.admin@mamamianpizza.com",
    "rol": "admin",
    "celular": "+503 7000-1234",
    "fecha_creacion": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validations:**
- ✅ All required fields: `nombre`, `correo`, `contrasena`, `rol`
- ✅ Valid email format
- ✅ Unique email address
- ✅ Password minimum 8 characters
- ✅ Valid role: `super_admin`, `admin`, `moderador`
- ✅ Valid phone format (optional): `+503 7000-0000` or `70000000`
- ✅ Password encryption with 12 salt rounds

---

### 2. Get All Administrators
**Endpoint:** `GET /api/users/admins/all`

**Description:** Retrieves all administrators with pagination and filtering options.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Records per page
- `rol` (string, optional) - Filter by role
- `activo` (boolean, optional) - Filter by active status

**Examples:**
```
GET /api/users/admins/all
GET /api/users/admins/all?page=2&limit=5
GET /api/users/admins/all?rol=admin&activo=true
```

**Response (200 - OK):**
```json
{
  "message": "Administradores obtenidos exitosamente",
  "administradores": [
    {
      "id_admin": 1,
      "nombre": "John Admin",
      "correo": "john.admin@mamamianpizza.com",
      "rol": "admin",
      "celular": "+503 7000-1234",
      "fecha_creacion": "2024-01-15T10:30:00.000Z",
      "ultimo_acceso": "2024-01-15T15:45:00.000Z",
      "activo": 1
    }
  ],
  "paginacion": {
    "pagina_actual": 1,
    "total_paginas": 3,
    "total_registros": 25,
    "registros_por_pagina": 10,
    "tiene_siguiente": true,
    "tiene_anterior": false
  },
  "filtros_aplicados": {
    "rol": "todos",
    "activo": "todos"
  }
}
```

---

### 3. Get Administrator by ID
**Endpoint:** `GET /api/users/admins/:id`

**Description:** Retrieves a specific administrator by their ID.

**Parameters:**
- `id` (number, required) - Administrator ID

**Example:**
```
GET /api/users/admins/1
```

**Response (200 - OK):**
```json
{
  "message": "Administrador encontrado",
  "administrador": {
    "id_admin": 1,
    "nombre": "John Admin",
    "correo": "john.admin@mamamianpizza.com",
    "rol": "admin",
    "celular": "+503 7000-1234",
    "fecha_creacion": "2024-01-15T10:30:00.000Z",
    "ultimo_acceso": "2024-01-15T15:45:00.000Z",
    "activo": 1
  }
}
```

**Response (404 - Not Found):**
```json
{
  "message": "Administrador no encontrado"
}
```

---

### 4. Update Administrator
**Endpoint:** `PUT /api/users/admins/:id`

**Description:** Updates an administrator's information. Supports partial updates.

**Parameters:**
- `id` (number, required) - Administrator ID

**Request Body (all fields optional):**
```json
{
  "nombre": "John Updated Admin",
  "correo": "john.updated@mamamianpizza.com",
  "rol": "moderador",
  "celular": "+503 7000-5678"
}
```

**Response (200 - OK):**
```json
{
  "message": "Administrador actualizado exitosamente",
  "campos_actualizados": ["nombre", "celular", "rol"],
  "administrador": {
    "id_admin": 1,
    "nombre": "John Updated Admin",
    "correo": "john.admin@mamamianpizza.com",
    "rol": "moderador",
    "celular": "+503 7000-5678",
    "fecha_creacion": "2024-01-15T10:30:00.000Z",
    "ultimo_acceso": "2024-01-15T15:45:00.000Z",
    "activo": 1
  }
}
```

**Validations:**
- ✅ At least one field required for update
- ✅ Email uniqueness check (if updating email)
- ✅ Valid email format (if updating email)
- ✅ Valid role (if updating role)
- ✅ Valid phone format (if updating phone)

---

### 5. Delete Administrator
**Endpoint:** `DELETE /api/users/admins/:id`

**Description:** Deletes an administrator (soft delete by default, hard delete optional).

**Parameters:**
- `id` (number, required) - Administrator ID

**Request Body:**
```json
{
  "hard_delete": false
}
```

**Response (200 - OK) - Soft Delete:**
```json
{
  "message": "Administrador desactivado exitosamente",
  "tipo_eliminacion": "desactivacion",
  "administrador_desactivado": {
    "id_admin": 1,
    "nombre": "John Admin",
    "rol": "admin"
  },
  "nota": "El administrador puede ser reactivado posteriormente"
}
```

**Response (200 - OK) - Hard Delete:**
```json
{
  "message": "Administrador eliminado permanentemente",
  "tipo_eliminacion": "permanente",
  "administrador_eliminado": {
    "id_admin": 1,
    "nombre": "John Admin",
    "rol": "admin"
  }
}
```

**Safety Features:**
- ✅ Prevents deletion of last active super_admin
- ✅ Soft delete by default (preserves data)
- ✅ Hard delete option for permanent removal
- ✅ Transaction rollback on errors

---

### 6. Toggle Administrator Status
**Endpoint:** `PATCH /api/users/admins/:id/toggle-status`

**Description:** Toggles the active/inactive status of an administrator.

**Parameters:**
- `id` (number, required) - Administrator ID

**Response (200 - OK):**
```json
{
  "message": "Administrador activado exitosamente",
  "administrador": {
    "id_admin": 1,
    "nombre": "John Admin",
    "rol": "admin",
    "estado_anterior": "inactivo",
    "estado_actual": "activo"
  }
}
```

**Safety Features:**
- ✅ Prevents deactivation of last active super_admin
- ✅ Clear status change reporting

---

### 7. Get Administrator Statistics
**Endpoint:** `GET /api/users/admins/stats`

**Description:** Provides comprehensive statistics about administrators in the system.

**Response (200 - OK):**
```json
{
  "message": "Estadísticas de administradores obtenidas exitosamente",
  "estadisticas": {
    "resumen_general": {
      "total_administradores": 25,
      "administradores_activos": 22,
      "administradores_inactivos": 3
    },
    "distribucion_por_rol": [
      {
        "rol": "super_admin",
        "total": 2,
        "activos": 2,
        "inactivos": 0
      },
      {
        "rol": "admin",
        "total": 15,
        "activos": 13,
        "inactivos": 2
      },
      {
        "rol": "moderador",
        "total": 8,
        "activos": 7,
        "inactivos": 1
      }
    ],
    "administradores_recientes": [
      {
        "id_admin": 25,
        "nombre": "Latest Admin",
        "rol": "admin",
        "fecha_creacion": "2024-01-15T16:00:00.000Z",
        "activo": 1
      }
    ],
    "accesos_recientes": [
      {
        "id_admin": 1,
        "nombre": "John Admin",
        "rol": "admin",
        "ultimo_acceso": "2024-01-15T15:45:00.000Z",
        "activo": 1
      }
    ]
  },
  "generado_en": "2024-01-15T16:30:00.000Z"
}
```

## 🔒 Security Features

### Password Security
- **Encryption:** bcrypt with 12 salt rounds (higher than standard for admin accounts)
- **Validation:** Minimum 8 characters required
- **Storage:** Hashed passwords never returned in responses

### Role Management
- **Hierarchy:** super_admin > admin > moderador
- **Validation:** Only valid roles accepted
- **Protection:** Prevents deletion/deactivation of last super_admin

### Data Protection
- **Transactions:** All operations use database transactions
- **Rollback:** Automatic rollback on errors
- **Validation:** Comprehensive input validation
- **Sanitization:** SQL injection protection

## 🎯 Use Cases

### Administrative Management
1. **Onboarding:** Create new admin accounts with appropriate roles
2. **Role Changes:** Update administrator roles as needed
3. **Contact Updates:** Modify administrator contact information
4. **Account Maintenance:** Activate/deactivate accounts as needed

### System Monitoring
1. **Statistics:** Monitor admin distribution and activity
2. **Recent Activity:** Track newly created admins and recent access
3. **Status Overview:** View active vs inactive administrators
4. **Role Distribution:** Understand admin hierarchy distribution

### Data Management
1. **Soft Deletion:** Temporarily remove admins while preserving data
2. **Account Recovery:** Reactivate previously deactivated accounts
3. **Permanent Cleanup:** Hard delete when necessary

## 🧪 Testing

### Bash Script Testing
Use the provided `test_admin_management.sh` script:
```bash
chmod +x test_admin_management.sh
./test_admin_management.sh
```

### Postman Collection
Import the `admin_management_postman_collection.json` file into Postman for comprehensive API testing.

### Manual Testing Checklist
- [ ] Create admin with all fields
- [ ] Create admin with minimum required fields
- [ ] Test pagination with different page sizes
- [ ] Filter by role and status
- [ ] Update individual fields
- [ ] Update multiple fields simultaneously
- [ ] Toggle status multiple times
- [ ] Soft delete and hard delete
- [ ] Test all error scenarios
- [ ] Verify statistics accuracy

## 🚨 Error Handling

### Client Errors (4xx)
- **400 Bad Request:** Invalid input data, missing required fields
- **404 Not Found:** Administrator not found
- **409 Conflict:** Duplicate email, business rule violations

### Server Errors (5xx)
- **500 Internal Server Error:** Database errors, unexpected exceptions

### Example Error Response:
```json
{
  "message": "El formato del correo electrónico no es válido",
  "error": "Validation failed for field: correo"
}
```

## 🔧 Configuration

### Database Requirements
- MySQL/MariaDB with `administradores` table
- Connection pool configured in `config/db.js`
- AUTO_INCREMENT enabled for `id_admin`

### Dependencies
- `bcrypt` - Password hashing
- `mysql2` - Database connectivity
- `express` - Web framework

## 🚀 Integration

### Route Setup
All endpoints are registered in `routes/userRoutes.js`:
```javascript
// Admin management routes
router.get('/admins/all', userController.getAllAdmins);
router.get('/admins/stats', userController.getAdminStats);
router.get('/admins/:id', userController.getAdminById);
router.put('/admins/:id', userController.updateAdmin);
router.delete('/admins/:id', userController.deleteAdmin);
router.patch('/admins/:id/toggle-status', userController.toggleAdminStatus);
```

### Controller Implementation
All functions are implemented in `controllers/userControllers.js` with:
- Async/await pattern
- Database transactions
- Comprehensive error handling
- Input validation
- Security measures

---

**🎉 The admin management system is now complete with full CRUD operations, security measures, and comprehensive testing tools!**
