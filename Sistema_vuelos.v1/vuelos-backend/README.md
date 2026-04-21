# Vuelos API — Backend

API REST para el módulo de vuelos. Construida con **Express + Prisma + PostgreSQL + TypeScript**.

---

## 🚀 Instalación y arranque

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita `.env` y completa `DATABASE_URL` con tu string de conexión de Supabase (u otra instancia PostgreSQL).

### 3. Generar el cliente Prisma
```bash
npm run db:generate
```

### 4. Ejecutar migraciones
```bash
npm run db:migrate
```
> Si prefieres no usar migraciones y solo sincronizar el schema:
> ```bash
> npm run db:push
> ```

### 5. Cargar datos de prueba
```bash
npm run db:seed
```
Esto crea aerolíneas, aeropuertos, rutas, vuelos y usuarios de prueba.

**Credenciales de prueba:**
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@vuelosapp.com | admin123 |
| Cliente | cliente@gmail.com | cliente123 |

### 6. Iniciar en desarrollo
```bash
npm run dev
```
El servidor corre en `http://localhost:3800`.

---

## 📋 Contrato OpenAPI (sección 1.4 teoría)

El archivo `openapi.yaml` es la **fuente de verdad** del sistema. Define todos los endpoints, schemas y respuestas.

### Ver la spec en vivo
```bash
# Arranca el servidor y abre en Swagger Editor
npm run dev
# Luego visita: https://editor.swagger.io/?url=http://localhost:3800/api/v1/spec
```

### Importar en Postman
1. Postman → Import → Link
2. Pega: `http://localhost:3800/api/v1/spec`

---

## 📡 Endpoints principales (prefijo `/api/v1/`)

### Autenticación
```
POST   /api/v1/auth/register          Registrar nuevo usuario
POST   /api/v1/auth/login             Iniciar sesión → devuelve JWT
GET    /api/v1/auth/me                Perfil del usuario (requiere token)
PUT    /api/v1/auth/profile           Actualizar perfil (requiere token)
POST   /api/v1/auth/change-password   Cambiar contraseña (requiere token)
```

### Vuelos
```
GET    /api/v1/flights/search         Buscar vuelos disponibles
  ?origin=UIO
  &destination=BOG
  &date=2025-04-01
  &passengers=2
  &class=ECONOMY

GET    /api/flights                Listar todos los vuelos
GET    /api/v1/flights/:id            Detalle de un vuelo
POST   /api/flights                Crear vuelo (admin)
PUT    /api/v1/flights/:id            Actualizar vuelo (admin)
DELETE /api/v1/flights/:id            Eliminar vuelo (admin)
```

### Reservas
```
POST   /api/reservations           Crear reserva (autenticado)
GET    /api/v1/reservations/my        Mis reservas (autenticado)
GET    /api/v1/reservations/:id       Detalle de reserva (autenticado)
DELETE /api/v1/reservations/:id       Cancelar reserva (autenticado)
GET    /api/reservations           Todas las reservas (admin)
```

### Promociones
```
POST   /api/v1/promotions/validate    Validar cupón (público)
GET    /api/promotions             Listar promociones (admin)
POST   /api/promotions             Crear promoción (admin)
PUT    /api/v1/promotions/:id         Actualizar (admin)
DELETE /api/v1/promotions/:id         Eliminar (admin)
```

### Admin — Gestión de catálogos
```
GET/POST/PUT/DELETE  /api/v1/admin/airports    Aeropuertos
GET/POST/PUT/DELETE  /api/v1/admin/airlines    Aerolíneas
GET/POST/PUT/DELETE  /api/v1/admin/routes      Rutas
GET/PUT/DELETE       /api/v1/admin/users       Usuarios
```

---

## 📋 Formato de respuestas

**Éxito:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vuelo no encontrado"
  }
}
```

---

## 🔐 Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login`.

---

## 🗂️ Estructura del proyecto

```
src/
├── config/
│   └── prisma.ts              Cliente Prisma singleton
├── modules/
│   ├── auth/                  Registro, login, perfil
│   ├── flights/               Búsqueda y gestión de vuelos
│   ├── reservations/          Flujo de reservas
│   ├── promotions/            Cupones y descuentos
│   └── admin/                 Panel administrador
├── shared/
│   ├── middleware/
│   │   └── auth.middleware.ts JWT + guards de rol
│   └── utils/
│       ├── response.ts        Helpers de respuesta HTTP
│       └── generic.controller.ts Factory CRUD
└── server.ts                  Punto de entrada
```

---

## 🔄 Evolución a microservicios (Reto 2)

Cada carpeta dentro de `modules/` está diseñada para convertirse en un microservicio independiente.
El contrato de la API (endpoints y formato de respuesta) NO cambia en el Reto 2 —
solo cambia la infraestructura que lo atiende.
