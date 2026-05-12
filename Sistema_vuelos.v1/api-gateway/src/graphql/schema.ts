export const typeDefs = /* GraphQL */ `

  # ─────────────────────────────────────────────────────────────────
  #  Arquitectura híbrida REST + gRPC + GraphQL Aggregator
  #
  #  Este gateway agrega datos de múltiples microservicios en una sola
  #  operación GraphQL, eliminando N llamadas REST en el frontend.
  # ─────────────────────────────────────────────────────────────────

  enum CabinClass {
    ECONOMY
    PREMIUM_ECONOMY
    BUSINESS
    FIRST
  }

  # ── Queries ───────────────────────────────────────────────────────

  type Query {
    """
    Búsqueda de vuelos disponibles.
    Consolida: flights-service (vuelos, clases, segmentos) + catalog-service (aerolínea, aeropuertos).
    Reemplaza hasta 6 llamadas REST independientes en el frontend.
    """
    flightSearch(
      origin:      String!
      destination: String!
      date:        String!
      passengers:  Int
      cabinClass:  CabinClass
    ): [FlightOption!]!

    """
    Detalle completo de reserva.
    Consolida: booking-service (reserva, pasajeros) + payments-service (pagos, boarding passes).
    Reemplaza 4 llamadas REST independientes.
    """
    reservation(id: ID!): ReservationDetail

    """Reservas del usuario autenticado. Requiere JWT."""
    myReservations: [Reservation!]!
  }

  # ── Mutations ─────────────────────────────────────────────────────

  type Mutation {
    """Asigna un asiento a un pasajero (booking-service)."""
    assignSeat(
      passengerId: ID!
      seat:        String!
    ): ReservationPassenger!

    """Agrega un servicio extra a un pasajero (payments-service)."""
    addAncillary(
      passengerId:     ID!
      serviceConfigId: ID!
      reservationId:   ID!
    ): PassengerService!
  }

  # ── Tipos de vuelo ────────────────────────────────────────────────

  type FlightOption {
    id:                 ID!
    departureDate:      String!
    departureDateTime:  String
    arrivalDateTime:    String
    durationMinutes:    Int
    stops:              Int
    lowestPrice:        Float
    airline:            Airline
    originAirport:      Airport
    destinationAirport: Airport
    flightClasses:      [FlightClass!]!
    segments:           [Segment!]!
  }

  type Airline {
    id:       ID!
    iataCode: String!
    name:     String!
  }

  type Airport {
    iataCode: String!
    name:     String!
    city:     String
    country:  String
  }

  type FlightClass {
    id:             ID!
    cabinClass:     String!
    basePrice:      Float!
    availableSeats: Int!
  }

  type Segment {
    id:                     ID!
    originAirportIata:      String!
    destinationAirportIata: String!
    departureDateTime:      String!
    arrivalDateTime:        String!
    segmentOrder:           Int
  }

  # ── Tipos de reserva ──────────────────────────────────────────────

  """Vista resumida — usada en listas como myReservations."""
  type Reservation {
    id:              ID!
    reservationCode: String!
    status:          String!
    totalAmount:     Float!
    createdAt:       String!
  }

  """
  Vista completa — agrega datos de booking-service y payments-service.
  Un solo query GraphQL reemplaza: GET /reservations/:id +
  GET /payments?reservationId + GET /boarding-passes?reservationId
  """
  type ReservationDetail {
    id:              ID!
    reservationCode: String!
    status:          String!
    totalAmount:     Float!
    createdAt:       String!
    flight:          FlightOption
    passengers:      [ReservationPassenger!]!
    payments:        [Payment!]!
    boardingPasses:  [BoardingPass!]!
  }

  type ReservationPassenger {
    id:             ID!
    firstName:      String!
    lastName:       String!
    documentNumber: String!
    seatNumber:     String
    flightClassId:  String
  }

  type Payment {
    id:        ID!
    amount:    Float!
    status:    String!
    provider:  String!
    createdAt: String!
  }

  type BoardingPass {
    id:               ID!
    boardingPassCode: String!
    gateNumber:       String
    boardingTime:     String
    seatNumber:       String
  }

  type PassengerService {
    id:     ID!
    amount: Float!
    status: String
  }
`;
