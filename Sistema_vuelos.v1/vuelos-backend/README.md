# Vuelos API - Backend

API REST para el modulo de vuelos de la plataforma academica Booking. Esta construida con Express, Prisma, PostgreSQL y TypeScript.

## Instalacion y arranque

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

El proyecto espera estas variables principales:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_ISSUER="vuelos-api"
JWT_AUDIENCE="vuelos-client"
JWT_EXPIRES_IN="2h"
PORT=3000
FRONTEND_URL="http://localhost:4200"
```

### 3. Generar cliente Prisma

```bash
npm run db:generate
```

### 4. Ejecutar migraciones o sincronizar schema

```bash
npm run db:migrate
```

Para sincronizar sin migraciones:

```bash
npm run db:push
```

### 5. Cargar datos de prueba

```bash
npm run db:seed
```

El seed crea aerolineas, aeropuertos, rutas, vuelos, usuarios y catalogos base para probar el marketplace y el panel administrativo.

### 6. Iniciar en desarrollo

```bash
npm run dev
```

Por defecto el servidor corre en `http://localhost:3000`, salvo que `.env` defina otro `PORT`.

## Contrato OpenAPI

El archivo `openapi.yaml` documenta el contrato REST publico del sistema. El backend tambien expone una especificacion generada desde Swagger/JSDoc.

Endpoints de documentacion:

- Swagger UI local: `http://localhost:3000/api/v1/docs`
- JSON local: `http://localhost:3000/api/v1/docs.json`
- Alias compatible: `http://localhost:3000/api/v1/spec`
- Produccion: `https://integracion-sistemas2026.onrender.com/api/v1/docs`

Para importar en Postman usa:

```text
http://localhost:3000/api/v1/docs.json
```

Nota importante: OpenAPI solo debe declarar endpoints REST reales. gRPC, GraphQL, eventos y SOA estan documentados como evolucion arquitectonica en `docs/documento-tecnico-reto1.md`; no se agregan como rutas productivas hasta que exista implementacion, para no romper pruebas del frontend.

## Endpoints principales

Todas las rutas publicas versionadas usan el prefijo `/api/v1`.

### Autenticacion

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
POST   /api/v1/auth/change-password
```

### Vuelos

```text
GET    /api/v1/flights/search
GET    /api/v1/flights
GET    /api/v1/flights/:id
POST   /api/v1/flights
PUT    /api/v1/flights/:id
PATCH  /api/v1/flights/:id
DELETE /api/v1/flights/:id
```

Parametros principales de busqueda:

```text
origin=UIO
destination=BOG
date=2026-05-01
passengers=2
class=ECONOMY
```

### Reservas

```text
POST   /api/v1/reservations
GET    /api/v1/reservations/my
GET    /api/v1/reservations/:id
PATCH  /api/v1/reservations/:id/cancel
PATCH  /api/v1/reservations/:id/passengers/:passengerId/seat
GET    /api/v1/reservations
```

### Servicios adicionales, check-in y pagos

```text
GET    /api/v1/service-catalog
GET    /api/v1/airline-service-config
GET    /api/v1/airline-service-config/by-airline/:airlineId
POST   /api/v1/passenger-services
GET    /api/v1/passenger-services/by-passenger/:passengerId
DELETE /api/v1/passenger-services/:id
POST   /api/v1/boarding-passes
GET    /api/v1/boarding-passes/by-passenger/:passengerId
POST   /api/v1/payments
GET    /api/v1/payments/by-reservation/:reservationId
POST   /api/v1/invoices
```

### Administracion

```text
GET    /api/v1/admin/dashboard
CRUD   /api/v1/admin/users
CRUD   /api/v1/admin/countries
CRUD   /api/v1/admin/cities
CRUD   /api/v1/admin/airports
CRUD   /api/v1/admin/airlines
CRUD   /api/v1/admin/aircraft
CRUD   /api/v1/admin/flightclasses
CRUD   /api/v1/admin/segments
CRUD   /api/v1/admin/reservations
CRUD   /api/v1/admin/servicecatalog
CRUD   /api/v1/admin/airline-service-config
CRUD   /api/v1/admin/passenger-services
CRUD   /api/v1/admin/payments
CRUD   /api/v1/admin/invoices
CRUD   /api/v1/admin/invoice-items
CRUD   /api/v1/admin/boarding-passes
CRUD   /api/v1/admin/auditlogs
```

## Formato de respuestas

Exito:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso no encontrado"
  }
}
```

## Seguridad y trazabilidad

Las rutas protegidas requieren:

```http
Authorization: Bearer <token>
```

El token se obtiene con `POST /api/v1/auth/login`.

El backend acepta `x-correlation-id` en cada request. Si el cliente no lo envia, se genera uno automaticamente y se devuelve como `X-Correlation-Id`. Este identificador se usa en la propuesta de trazabilidad de eventos.

Controles activos:

- CORS con allowlist de origenes permitidos.
- `credentials: false` porque la API usa Bearer token, no cookies.
- Headers de seguridad con Helmet.
- Rate limiting global, en login/registro y busqueda de vuelos.
- JWT firmado con `HS256`, `issuer`, `audience` y expiracion configurable.
- En produccion `JWT_SECRET` debe tener al menos 32 caracteres.
- Validacion de entrada con Zod.
- Verificacion de ownership en reservas, pagos, facturas, perfiles, pasajeros y boarding passes.
- `Cache-Control: no-store` en respuestas `/api`.

Recomendacion de produccion:

```env
JWT_SECRET="usa-un-secreto-aleatorio-de-64-caracteres-o-mas"
JWT_EXPIRES_IN="2h"
```

## Estructura del proyecto

```text
src/
  config/                 Cliente Prisma
  modules/                Modulos por dominio/API
    api_users/
    api_flights/
    api_reservations/
    api_passenger_services/
    api_payments/
    api_admin/
  shared/
    middlewares/
    utils/
    swagger.ts
    swagger-paths.ts
  server.ts
prisma/
  schema.prisma
  seed.ts
```

## Evolucion a integracion

El Reto 1 mantiene una arquitectura de monolito modular API-first. La evolucion a microservicios no cambia el contrato REST publico; cambia la infraestructura interna.

Documentacion relacionada:

- `docs/diagramas-secuencia-grpc.md`: diagramas de secuencia y contratos proto3 sugeridos.
- `docs/documento-tecnico-reto1.md`: analisis gRPC, GraphQL, SOA, mensajeria, catalogo de eventos y trazabilidad hasta semana 6.
