# Diagramas de secuencia - VuelosApp y evolucion a gRPC

Este documento sirve como base para explicar los flujos principales del sistema y como guia para evolucionar el backend desde un monolito modular REST hacia microservicios con comunicacion interna gRPC y Protocol Buffers 3.

La idea recomendada es mantener REST/JSON como contrato publico para Angular y futuros consumidores web, y usar gRPC solo entre servicios internos.

El analisis completo de gRPC, GraphQL, SOA, mensajeria, eventos de negocio y trazabilidad esta en `docs/documento-tecnico-reto1.md`.

## Vista objetivo

```mermaid
flowchart LR
    Angular[Cliente Angular] -->|REST/JSON HTTPS| Gateway[API Gateway / BFF]
    Gateway -->|gRPC proto3| Identity[IdentityService]
    Gateway -->|gRPC proto3| FlightSearch[FlightSearchService]
    Gateway -->|gRPC proto3| Booking[BookingService]
    Gateway -->|gRPC proto3| Ancillary[AncillaryService]
    Gateway -->|gRPC proto3| Payment[PaymentService]

    Identity --> DB[(PostgreSQL)]
    FlightSearch --> DB
    Booking --> DB
    Ancillary --> DB
    Payment --> DB
```

## Diagrama de secuencia general

Este es el diagrama principal para la documentacion. Resume el flujo completo desde que el cliente busca vuelos hasta que confirma una reserva y agrega servicios adicionales, mostrando donde entraria gRPC internamente.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant API as API REST / Gateway
    participant Auth as IdentityService gRPC
    participant Vuelos as FlightSearchService gRPC
    participant Reservas as BookingService gRPC
    participant Servicios as AncillaryService gRPC
    participant DB as PostgreSQL

    Cliente->>API: Buscar vuelos<br/>GET /flights/search
    API->>Vuelos: SearchFlights(request)
    Vuelos->>DB: Consultar vuelos, segmentos y clases
    DB-->>Vuelos: Disponibilidad y precios
    Vuelos-->>API: Lista de vuelos disponibles
    API-->>Cliente: Resultados de busqueda

    Cliente->>API: Confirmar reserva<br/>POST /reservations
    API->>Auth: ValidateToken(token)
    Auth-->>API: Usuario autenticado
    API->>Reservas: CreateReservation(request)
    Reservas->>Vuelos: CheckAvailability(flight_class_id)
    Vuelos-->>Reservas: Asientos disponibles
    Reservas->>DB: Crear reserva y pasajeros
    Reservas->>DB: Descontar asientos
    DB-->>Reservas: Reserva confirmada
    Reservas-->>API: Codigo de reserva
    API-->>Cliente: Reserva confirmada

    Cliente->>API: Agregar servicio adicional<br/>POST /passenger-services
    API->>Auth: ValidateToken(token)
    Auth-->>API: Usuario autenticado
    API->>Reservas: VerifyPassengerOwnership(passenger_id)
    Reservas-->>API: Pasajero valido
    API->>Servicios: AddPassengerService(request)
    Servicios->>DB: Consultar precio vigente
    Servicios->>DB: Registrar servicio del pasajero
    DB-->>Servicios: Servicio agregado
    Servicios-->>API: Servicio confirmado
    API-->>Cliente: Servicio agregado
```

## Pipeline de generacion gRPC

Este diagrama es equivalente al ejemplo del profesor, pero aplicado a la generacion automatica de codigo gRPC.

```mermaid
flowchart TD
    Proto[Archivo .proto<br/>syntax = proto3] --> Protoc[Compilacion con protoc]

    Protoc --> DTOs[Mensajes / DTOs generados]
    Protoc --> Client[Cliente gRPC generado]
    Protoc --> Server[Clase base del servidor generada]

    Client --> Consumer[Microservicio consumidor]
    Server --> Impl[Implementacion del servicio]
```

## Servicios sugeridos

- `IdentityService`: autenticacion, usuarios y roles.
- `FlightSearchService`: aeropuertos, rutas, vuelos, segmentos, clases y disponibilidad.
- `BookingService`: reservas, pasajeros, cancelacion, check-in y asientos.
- `AncillaryService`: catalogo de servicios adicionales y compra por pasajero.
- `PaymentService`: pagos, facturas y conciliacion.

## 1. Busqueda de vuelos

Este flujo representa cuando el cliente busca una ruta, por ejemplo `UIO -> MIA`.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant FlightSvc as FlightSearchService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: GET /api/v1/flights/search?origin=UIO&destination=MIA&date=2026-05-01&passengers=1
    Gateway->>Gateway: Validar query params
    Gateway->>Gateway: Normalizar IATA y remover parametros vacios
    Gateway->>FlightSvc: SearchFlights(request)
    FlightSvc->>DB: Buscar vuelos programados por fecha y ruta
    DB-->>FlightSvc: Flights + segments + flight_classes
    FlightSvc->>FlightSvc: Filtrar disponibilidad por pasajeros y clase
    FlightSvc-->>Gateway: SearchFlightsResponse
    Gateway-->>Cliente: 200 OK { success, data }

    alt Parametros invalidos
        Gateway-->>Cliente: 400 VALIDATION_ERROR
    else Sin vuelos disponibles
        Gateway-->>Cliente: 200 OK { success: true, data: [] }
    end
```

Contrato proto3 sugerido:

```proto
syntax = "proto3";

package flights.v1;

service FlightSearchService {
  rpc SearchFlights(SearchFlightsRequest) returns (SearchFlightsResponse);
}

message SearchFlightsRequest {
  string origin_iata = 1;
  string destination_iata = 2;
  string departure_date = 3; // YYYY-MM-DD
  int32 passengers = 4;
  optional string cabin_class = 5;
}

message SearchFlightsResponse {
  repeated FlightOption flights = 1;
}

message FlightOption {
  string id = 1;
  string origin_iata = 2;
  string destination_iata = 3;
  string departure_datetime = 4;
  string arrival_datetime = 5;
  string airline_name = 6;
  double lowest_price = 7;
  repeated CabinAvailability cabins = 8;
}

message CabinAvailability {
  string flight_class_id = 1;
  string cabin_class = 2;
  int32 available_seats = 3;
  double base_price = 4;
}
```

## 2. Crear reserva

Este flujo ocurre cuando el usuario selecciona una clase de vuelo, registra pasajeros y confirma la reserva.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant Identity as IdentityService gRPC
    participant Booking as BookingService gRPC
    participant Flights as FlightSearchService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: POST /api/v1/reservations
    Gateway->>Identity: ValidateToken(access_token)
    Identity-->>Gateway: AuthenticatedUser

    Gateway->>Booking: CreateReservation(user_id, flight_class_id, passengers, promotion_code)
    Booking->>Flights: CheckAvailability(flight_class_id, passenger_count)
    Flights->>DB: Consultar flight_class
    DB-->>Flights: available_seats, base_price, flight_id
    Flights-->>Booking: AvailabilityResult

    Booking->>Booking: Calcular total y promocion
    Booking->>DB: BEGIN TRANSACTION
    Booking->>DB: Crear reservation
    Booking->>DB: Crear reservation_passengers
    Booking->>DB: Decrementar available_seats
    Booking->>DB: Incrementar uso de promocion si aplica
    Booking->>DB: COMMIT

    DB-->>Booking: Reserva confirmada
    Booking-->>Gateway: ReservationResponse
    Gateway-->>Cliente: 201 Created { success, data }

    alt Sin disponibilidad
        Flights-->>Booking: NO_AVAILABILITY
        Booking-->>Gateway: Error NO_AVAILABILITY
        Gateway-->>Cliente: 422 Sin disponibilidad
    else Token invalido
        Identity-->>Gateway: UNAUTHORIZED
        Gateway-->>Cliente: 401 Token requerido o invalido
    end
```

Contrato proto3 sugerido:

```proto
syntax = "proto3";

package booking.v1;

service BookingService {
  rpc CreateReservation(CreateReservationRequest) returns (ReservationResponse);
}

message CreateReservationRequest {
  string user_id = 1;
  string flight_class_id = 2;
  repeated PassengerInput passengers = 3;
  optional string promotion_code = 4;
}

message PassengerInput {
  string first_name = 1;
  string last_name = 2;
  string document_number = 3;
}

message ReservationResponse {
  string id = 1;
  string reservation_code = 2;
  string status = 3;
  double total_amount = 4;
  repeated Passenger passengers = 5;
}

message Passenger {
  string id = 1;
  string first_name = 2;
  string last_name = 3;
  string document_number = 4;
}
```

## 3. Agregar servicios adicionales

Este flujo cubre la pantalla de detalle de reserva, cuando el cliente abre un pasajero y agrega maleta, comida, seguro u otro servicio.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant Identity as IdentityService gRPC
    participant Booking as BookingService gRPC
    participant Ancillary as AncillaryService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: GET /api/v1/airline-service-config/by-airline/{airlineId}
    Gateway->>Ancillary: ListAvailableServices(airline_id, origin_airport_id, destination_airport_id)
    Ancillary->>DB: Consultar service_catalog y airline_service_configs
    DB-->>Ancillary: Servicios aplicables por aerolinea/ruta
    Ancillary-->>Gateway: ListAvailableServicesResponse
    Gateway-->>Cliente: 200 OK { success, data }

    Cliente->>Gateway: POST /api/v1/passenger-services
    Gateway->>Identity: ValidateToken(access_token)
    Identity-->>Gateway: AuthenticatedUser

    Gateway->>Booking: VerifyPassengerOwnership(user_id, passenger_id)
    Booking->>DB: Verificar pasajero y reserva del usuario
    DB-->>Booking: Ownership OK
    Booking-->>Gateway: PassengerOwnershipResult

    Gateway->>Ancillary: AddPassengerService(passenger_id, service_config_id, quantity)
    Ancillary->>DB: Buscar precio vigente de service_config
    DB-->>Ancillary: price, currency
    Ancillary->>DB: Registrar passenger_service con precio bloqueado
    DB-->>Ancillary: PassengerService creado
    Ancillary-->>Gateway: PassengerServiceResponse
    Gateway-->>Cliente: 201 Created { success, data }

    alt Servicio no disponible
        Ancillary-->>Gateway: SERVICE_NOT_AVAILABLE
        Gateway-->>Cliente: 404 Servicio no encontrado
    else Pasajero no pertenece al usuario
        Booking-->>Gateway: FORBIDDEN
        Gateway-->>Cliente: 403 Sin permisos para este pasajero
    end
```

Contrato proto3 sugerido:

```proto
syntax = "proto3";

package ancillary.v1;

service AncillaryService {
  rpc ListAvailableServices(ListAvailableServicesRequest) returns (ListAvailableServicesResponse);
  rpc AddPassengerService(AddPassengerServiceRequest) returns (PassengerServiceResponse);
}

message ListAvailableServicesRequest {
  string airline_id = 1;
  optional string origin_airport_id = 2;
  optional string destination_airport_id = 3;
}

message ListAvailableServicesResponse {
  repeated ServiceConfig services = 1;
}

message ServiceConfig {
  string id = 1;
  string service_id = 2;
  string name = 3;
  string category = 4;
  double price = 5;
  string currency = 6;
}

message AddPassengerServiceRequest {
  string passenger_id = 1;
  string service_config_id = 2;
  int32 quantity = 3;
}

message PassengerServiceResponse {
  string id = 1;
  string passenger_id = 2;
  string service_config_id = 3;
  int32 quantity = 4;
  double unit_price_at_booking = 5;
  double total_price = 6;
}
```

## 4. Check-in y asignacion de asiento

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant Identity as IdentityService gRPC
    participant Booking as BookingService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: POST /api/v1/boarding-passes
    Gateway->>Identity: ValidateToken(access_token)
    Identity-->>Gateway: AuthenticatedUser
    Gateway->>Booking: CreateBoardingPass(user_id, passenger_id, segment_id)
    Booking->>DB: Verificar pasajero/reserva/segmento
    Booking->>DB: Crear boarding_pass
    DB-->>Booking: BoardingPass creado
    Booking-->>Gateway: BoardingPassResponse
    Gateway-->>Cliente: 201 Created

    Cliente->>Gateway: PATCH /api/v1/reservations/{id}/passengers/{passengerId}/seat
    Gateway->>Booking: AssignSeat(user_id, reservation_id, passenger_id, seat_number)
    Booking->>DB: Validar ownership y disponibilidad del asiento
    Booking->>DB: Actualizar seat_number
    DB-->>Booking: Passenger actualizado
    Booking-->>Gateway: AssignSeatResponse
    Gateway-->>Cliente: 200 OK
```

## Reglas de diseno para gRPC

- Usar `syntax = "proto3";` en todos los contratos.
- Versionar paquetes: `flights.v1`, `booking.v1`, `ancillary.v1`, `identity.v1`.
- No exponer gRPC directamente al navegador; Angular consume REST/JSON.
- El Gateway traduce REST a gRPC interno.
- No confiar en precios enviados por el cliente. El servicio interno debe bloquear el precio vigente.
- Usar errores canonicos gRPC: `INVALID_ARGUMENT`, `UNAUTHENTICATED`, `PERMISSION_DENIED`, `NOT_FOUND`, `FAILED_PRECONDITION`.
- Mantener idempotencia para operaciones sensibles cuando se integre con pagos o agregadores externos.

## Flujo recomendado para integracion con Booking

```mermaid
sequenceDiagram
    autonumber
    participant BookingExt as Booking / Integrador externo
    participant PublicAPI as API publica REST
    participant Gateway as API Gateway
    participant Flights as FlightSearchService gRPC
    participant BookingSvc as BookingService gRPC

    BookingExt->>PublicAPI: Consultar disponibilidad REST/JSON
    PublicAPI->>Gateway: Validar API key / OAuth client
    Gateway->>Flights: SearchFlights(request)
    Flights-->>Gateway: SearchFlightsResponse
    Gateway-->>PublicAPI: Disponibilidad normalizada
    PublicAPI-->>BookingExt: Respuesta compatible con integrador

    BookingExt->>PublicAPI: Crear reserva externa
    PublicAPI->>Gateway: Validar contrato externo
    Gateway->>BookingSvc: CreateReservation(request)
    BookingSvc-->>Gateway: ReservationResponse
    Gateway-->>PublicAPI: Confirmacion normalizada
    PublicAPI-->>BookingExt: Codigo de reserva
```
