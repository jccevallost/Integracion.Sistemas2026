# Diagramas de secuencia para evolucion a gRPC

Este documento describe los flujos actuales y la separacion sugerida para migrar la comunicacion interna del backend a gRPC con Protocol Buffers 3. La API publica puede seguir siendo REST para Angular y para integraciones web, mientras que los servicios internos se comunican por gRPC.

## Servicios propuestos

- `FlightSearchService`: disponibilidad, rutas, clases y precios base de vuelos.
- `BookingService`: creacion/cancelacion de reservas, pasajeros y control de asientos.
- `AncillaryService`: catalogo y compra de servicios adicionales.
- `PaymentService`: pagos, facturas y conciliacion.
- `IdentityService`: autenticacion, usuarios y roles.

## 1. Busqueda de vuelos

Flujo actual REST con separacion objetivo para gRPC interno:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant FlightSvc as FlightSearchService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: GET /api/v1/flights/search?origin=UIO&destination=MIA&date=2026-05-01&passengers=1
    Gateway->>Gateway: Validar query y normalizar IATA
    Gateway->>FlightSvc: SearchFlights(SearchFlightsRequest)
    FlightSvc->>DB: Consultar vuelos, segmentos y clases disponibles
    DB-->>FlightSvc: Vuelos encontrados
    FlightSvc-->>Gateway: SearchFlightsResponse
    Gateway-->>Cliente: 200 { success, data }
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
  string departure_date = 3;
  int32 passengers = 4;
  optional string cabin_class = 5;
}

message SearchFlightsResponse {
  repeated FlightOption flights = 1;
}
```

## 2. Creacion de reserva

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
    Gateway->>Identity: ValidateToken(token)
    Identity-->>Gateway: AuthenticatedUser
    Gateway->>Booking: CreateReservation(user_id, flight_class_id, passengers, promo_code)
    Booking->>Flights: CheckAvailability(flight_class_id, passenger_count)
    Flights-->>Booking: AvailabilityResult
    Booking->>DB: Transaccion: crear reserva, pasajeros y descontar asientos
    DB-->>Booking: Reserva confirmada
    Booking-->>Gateway: ReservationResponse
    Gateway-->>Cliente: 201 { success, data }
```

Puntos de consistencia:

- La reserva y el descuento de asientos deben ser atomicos.
- El `BookingService` debe ser duenio de reservas y pasajeros.
- `FlightSearchService` debe exponer disponibilidad, pero no modificar reservas directamente.

## 3. Servicios adicionales de pasajero

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente Angular
    participant Gateway as API REST / Gateway
    participant Identity as IdentityService gRPC
    participant Ancillary as AncillaryService gRPC
    participant Booking as BookingService gRPC
    participant DB as PostgreSQL

    Cliente->>Gateway: GET /api/v1/airline-service-config/by-airline/{airlineId}
    Gateway->>Ancillary: ListAvailableServices(airline_id, origin_airport_id, destination_airport_id)
    Ancillary->>DB: Consultar catalogo y precios aplicables
    DB-->>Ancillary: Servicios disponibles
    Ancillary-->>Gateway: ListAvailableServicesResponse
    Gateway-->>Cliente: 200 { success, data }

    Cliente->>Gateway: POST /api/v1/passenger-services
    Gateway->>Identity: ValidateToken(token)
    Identity-->>Gateway: AuthenticatedUser
    Gateway->>Booking: VerifyPassengerOwnership(user_id, passenger_id)
    Booking-->>Gateway: Ownership OK
    Gateway->>Ancillary: AddPassengerService(passenger_id, service_config_id, quantity)
    Ancillary->>DB: Bloquear precio actual y registrar servicio
    DB-->>Ancillary: Servicio agregado
    Ancillary-->>Gateway: PassengerService
    Gateway-->>Cliente: 201 { success, data }
```

Reglas para el proto:

- El cliente no debe mandar el precio definitivo; el servicio debe calcularlo desde `service_config_id`.
- El ownership del pasajero debe validarse antes de agregar o eliminar servicios.
- Para Booking.com u otro agregador, el gateway externo puede traducir REST/JSON a gRPC interno sin exponer la topologia interna.

