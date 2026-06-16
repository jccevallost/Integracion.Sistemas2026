# Contrato API Booking v2

Este contrato es la referencia para integrar un frontend, app movil o servicio
externo de booking con la version 2 del sistema de vuelos.

## Base URL

Produccion actual:

```text
https://vuelos-api-gateway-v2.onrender.com/api/v2
```

Despliegue v2 por API Gateway:

```text
https://<vuelos-api-gateway-v2>.onrender.com/api/v2
```

Todo cliente externo debe consumir el API Gateway. No consumir microservicios
directamente salvo rutas internas acordadas.

`/api/v2` es el contrato publico vigente. `/api/v1` se conserva como contrato
de compatibilidad para clientes anteriores.

Contrato OpenAPI fuente:

```text
contracts/rest/booking-api-v2.openapi.yaml
```

## Formato comun

Headers recomendados:

```http
Content-Type: application/json
Authorization: Bearer <jwt>
x-correlation-id: <uuid-opcional>
```

Respuesta exitosa:

```json
{
  "success": true,
  "data": {}
}
```

Respuesta de error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada invalidos",
    "fields": {
      "flightClassId": "Invalid uuid"
    }
  }
}
```

## 1. Login

Usar este endpoint para obtener el JWT que asocia reservas y pagos al usuario.

```http
POST /auth/login
```

Request:

```json
{
  "email": "cliente@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "uuid-user",
      "email": "cliente@example.com",
      "firstName": "Ana",
      "firstLastName": "Lopez",
      "role": "CUSTOMER"
    }
  }
}
```

## 2. Registro

```http
POST /auth/register
```

Request minimo:

```json
{
  "email": "cliente@example.com",
  "password": "secret123",
  "firstName": "Ana",
  "firstLastName": "Lopez",
  "mainAddress": "Av. Principal"
}
```

Campos opcionales: `phone`, `secondName`, `secondLastName`, `birthDate`,
`cityId`, `secondaryAddress`.

## 3. Buscar vuelos

```http
GET /flights/search?origin=UIO&destination=BOG&date=2026-06-15&passengers=1&class=ECONOMY
```

Query params:

| Campo | Requerido | Descripcion |
| --- | --- | --- |
| `origin` | Si | IATA origen, por ejemplo `UIO`. |
| `destination` | Si | IATA destino, por ejemplo `BOG`. |
| `date` | Si | Fecha `YYYY-MM-DD`. |
| `passengers` | No | Entero entre 1 y 9. Default: 1. |
| `class` | No | `ECONOMY`, `PREMIUM_ECONOMY`, `BUSINESS` o `FIRST`. |

Response resumido:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-flight",
      "originAirportIata": "UIO",
      "destinationAirportIata": "BOG",
      "departureDate": "2026-06-15T00:00:00.000Z",
      "departureDateTime": "2026-06-15T18:00:00.000Z",
      "arrivalDateTime": "2026-06-15T19:30:00.000Z",
      "status": "SCHEDULED",
      "duration": 90,
      "stops": 0,
      "lowestPrice": 120,
      "airline": {
        "id": "uuid-airline",
        "iataCode": "AV",
        "name": "Avianca"
      },
      "route": {
        "originAirport": { "iataCode": "UIO", "city": "Quito" },
        "destinationAirport": { "iataCode": "BOG", "city": "Bogota" }
      },
      "flightClasses": [
        {
          "id": "uuid-flight-class",
          "cabinClass": "ECONOMY",
          "availableSeats": 40,
          "basePrice": 120
        }
      ]
    }
  ]
}
```

Importante: para crear la reserva se debe usar `flightClasses[n].id` como
`flightClassId`. No enviar `flightId`, precio, ruta ni aerolinea en la reserva.

## 4. Inventario recomendado

Si la busqueda exacta por fecha devuelve vacio, el cliente puede listar vuelos
publicados para sugerencias:

```http
GET /flights
```

El response usa el mismo formato de vuelo. Para una reserva sigue aplicando la
misma regla: usar `flightClasses[n].id`.

## 5. Validar promocion

La validacion publica de promocion usa `POST` con body.

```http
POST /promotions/validate
```

Request:

```json
{
  "code": "VERANO20",
  "amount": 120
}
```

Response:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountAmount": 24,
    "finalAmount": 96,
    "promotion": {
      "id": "uuid-promotion",
      "code": "VERANO20"
    }
  }
}
```

Este paso es opcional para UI. Al crear la reserva, Booking valida nuevamente
`promotionCode` contra Flights/Promotions.

## 6. Crear reserva

Endpoint estandar:

```http
POST /reservations
```

Alias compatible:

```http
POST /reservations/checkout
```

Autenticacion:

- Recomendado: `Authorization: Bearer <jwt>`.
- Si se envia JWT, la reserva queda asociada al usuario autenticado.
- Si no se envia JWT, la reserva puede crearse anonima.
- Para una integracion server-to-server controlada, se acepta `x-booking-user-id`
  o `userId` con un `User.id` existente, pero no se recomienda para clientes
  publicos.

Request minimo:

```json
{
  "flightClassId": "uuid-flight-class",
  "passengers": [
    {
      "firstName": "Ana",
      "lastName": "Lopez",
      "documentNumber": "0955555555"
    }
  ]
}
```

Request completo:

```json
{
  "flightClassId": "uuid-flight-class",
  "promotionCode": "VERANO20",
  "passengers": [
    {
      "firstName": "Ana",
      "lastName": "Lopez",
      "documentNumber": "0955555555",
      "seatNumber": "14C"
    }
  ],
  "idCarrito": "booking-cart-123",
  "metodoPagoId": "booking-payment-method-456",
  "currency": "USD"
}
```

Campos requeridos:

| Campo | Tipo | Regla |
| --- | --- | --- |
| `flightClassId` | UUID | Debe venir de `flightClasses[n].id`. |
| `passengers` | array | Minimo 1 pasajero. |
| `passengers[].firstName` | string | Requerido. |
| `passengers[].lastName` | string | Requerido. |
| `passengers[].documentNumber` | string | Requerido. |

Campos opcionales:

| Campo | Uso |
| --- | --- |
| `promotionCode` | Codigo de descuento. |
| `passengers[].seatNumber` | Asiento solicitado; se normaliza a mayusculas. |
| `idCarrito` | Referencia externa aceptada por compatibilidad. |
| `metodoPagoId` | Referencia externa aceptada por compatibilidad. |
| `currency` | Referencia externa aceptada por compatibilidad. |

Campos que no debe mandar Booking:

- `flightId`
- `totalAmount`
- `basePrice`
- `availableSeats`
- `origin`
- `destination`
- `departureDate`
- `airline`

El backend calcula precio, valida cupos, valida promocion y descuenta asientos.

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-reservation",
    "userId": "uuid-user",
    "flightId": "uuid-flight",
    "promotionId": "uuid-promotion",
    "reservationCode": "A1B2C3D4",
    "totalAmount": 96,
    "status": "CONFIRMED",
    "createdAt": "2026-06-10T12:00:00.000Z",
    "passengers": [
      {
        "id": "uuid-reservation-passenger",
        "reservationId": "uuid-reservation",
        "flightClassId": "uuid-flight-class",
        "firstName": "Ana",
        "lastName": "Lopez",
        "documentNumber": "0955555555",
        "seatNumber": "14C"
      }
    ]
  }
}
```

Errores relevantes:

| HTTP | Code | Caso |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Faltan campos o formato invalido. |
| 404 | `NOT_FOUND` | `flightClassId` no existe. |
| 409 | `CONFLICT` | Asiento repetido u ocupado. |
| 422 | `NO_AVAILABILITY` | No quedan cupos suficientes. |

## 7. Consultar reservas

Reservas del usuario autenticado:

```http
GET /reservations/my
Authorization: Bearer <jwt>
```

Detalle de una reserva:

```http
GET /reservations/{reservationId}
Authorization: Bearer <jwt>
```

Asientos ocupados por clase de vuelo:

```http
GET /reservations/flight-classes/{flightClassId}/occupied-seats
```

Response:

```json
{
  "success": true,
  "data": ["14C", "15A"]
}
```

Asignar asiento en check-in:

```http
PATCH /reservations/{reservationId}/passengers/{passengerId}/seat
Authorization: Bearer <jwt>
```

Request:

```json
{
  "seatNumber": "16A"
}
```

Cancelar reserva:

```http
PATCH /reservations/{reservationId}/cancel
Authorization: Bearer <jwt>
```

Tambien existe:

```http
DELETE /reservations/{reservationId}
```

## 8. Pagar reserva

```http
POST /payments
Authorization: Bearer <jwt>
```

Request:

```json
{
  "reservationId": "uuid-reservation",
  "amount": 96,
  "provider": "VISA",
  "transactionId": "BOOKING-uuid-o-referencia-unica",
  "status": "COMPLETED"
}
```

Campos:

| Campo | Requerido | Regla |
| --- | --- | --- |
| `reservationId` | Si | UUID de la reserva creada. |
| `amount` | Si | Numero mayor a 0. Para clientes se recalcula con `totalAmount`. |
| `provider` | Si | `VISA`, `MASTERCARD`, `AMEX`, `PAYPAL`, `TRANSFER`. |
| `transactionId` | Si | String unico, 6 a 120 caracteres. |
| `status` | No | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`. Default: `COMPLETED`. |

Idempotencia:

- Si se reintenta con el mismo `transactionId`, devuelve el pago existente.
- Si la reserva ya tiene pago, devuelve el pago existente por `reservationId`.
- No generar un `transactionId` nuevo en reintentos del mismo pago.

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-payment",
    "reservationId": "uuid-reservation",
    "amount": 96,
    "provider": "VISA",
    "transactionId": "BOOKING-uuid-o-referencia-unica",
    "status": "COMPLETED",
    "createdAt": "2026-06-10T12:05:00.000Z"
  }
}
```

Consultar pagos de una reserva:

```http
GET /payments/by-reservation/{reservationId}
Authorization: Bearer <jwt>
```

## 9. Perfil de usuario

Consultar perfil del usuario autenticado:

```http
GET /auth/me
Authorization: Bearer <jwt>
```

Actualizar datos del perfil:

```http
PUT /auth/profile
Authorization: Bearer <jwt>
```

Request (todos los campos son opcionales):

```json
{
  "firstName": "Ana",
  "firstLastName": "Lopez",
  "phone": "0999999999",
  "mainAddress": "Av. Principal 123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-user",
    "email": "cliente@example.com",
    "firstName": "Ana",
    "firstLastName": "Lopez",
    "role": "CUSTOMER"
  }
}
```

## 10. Flujo recomendado para Booking (resumen)

1. Autenticar o registrar usuario y guardar `token`.
2. Buscar vuelos con `/flights/search`.
3. Tomar `flightClasses[n].id`.
4. Crear reserva con `/reservations`.
5. Guardar `reservationId` y `reservationCode`.
6. Pagar con `/payments` usando un `transactionId` estable.
7. Consultar detalle con `/reservations/{reservationId}`.
8. Consultar pagos con `/payments/by-reservation/{reservationId}`.

## 11. Reglas de integracion

- No calcular precio final en Booking como fuente de verdad.
- No descontar asientos en Booking; lo hace el backend.
- No duplicar pagos; reutilizar `transactionId` al reintentar.
- Usar `x-correlation-id` para trazabilidad entre Booking, Gateway y servicios.
- Para nuevas integraciones usar `/reservations`, no `/reservas`.
