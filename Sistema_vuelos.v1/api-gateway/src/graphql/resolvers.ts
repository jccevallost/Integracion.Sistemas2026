import { GraphQLError } from 'graphql';
import { ServiceClient } from './service-client.js';
import type { GraphQLContext } from './context.js';

type R = Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function requireAuth(ctx: GraphQLContext): void {
  if (!ctx.token) {
    throw new GraphQLError('Autenticación requerida', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Resolvers
// ─────────────────────────────────────────────────────────────────────────────

export const resolvers = {

  // ── Query ──────────────────────────────────────────────────────────────────

  Query: {
    /**
     * flightSearch — Agrega datos de flights-service.
     * La respuesta REST ya incluye airline, route (con aeropuertos) y flightClasses.
     * El frontend obtiene TODO en una sola operación GraphQL.
     */
    async flightSearch(
      _: unknown,
      args: { origin: string; destination: string; date: string; passengers?: number; cabinClass?: string },
      ctx: GraphQLContext,
    ) {
      const client = new ServiceClient(ctx.services.flights, ctx.token);
      const qs = new URLSearchParams({ origin: args.origin, destination: args.destination, date: args.date });
      if (args.passengers) qs.set('passengers', String(args.passengers));
      if (args.cabinClass)  qs.set('class', args.cabinClass);
      return client.get<R[]>(`/api/v1/flights/search?${qs.toString()}`);
    },

    /**
     * reservation — Agrega booking-service + payments-service.
     *
     * REST equivalente en el frontend:
     *   GET /api/v1/reservations/:id      → booking-service
     *   GET /api/v1/payments?reservationId → payments-service
     *   GET /api/v1/boarding-passes?...   → booking-service
     *
     * Con GraphQL: una sola query, todos los datos.
     */
    async reservation(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      requireAuth(ctx);
      const client = new ServiceClient(ctx.services.booking, ctx.token);
      return client.get<R>(`/api/v1/reservations/${args.id}`);
    },

    async myReservations(_: unknown, _args: unknown, ctx: GraphQLContext) {
      requireAuth(ctx);
      const client = new ServiceClient(ctx.services.booking, ctx.token);
      return client.get<R[]>(`/api/v1/reservations?userId=${ctx.userId}`);
    },
  },

  // ── Mutation ───────────────────────────────────────────────────────────────

  Mutation: {
    async assignSeat(
      _: unknown,
      args: { passengerId: string; seat: string },
      ctx: GraphQLContext,
    ) {
      requireAuth(ctx);
      const client = new ServiceClient(ctx.services.booking, ctx.token);
      return client.patch<R>(
        `/api/v1/reservation-passengers/${args.passengerId}/seat`,
        { seatNumber: args.seat },
      );
    },

    async addAncillary(
      _: unknown,
      args: { passengerId: string; serviceConfigId: string; reservationId: string },
      ctx: GraphQLContext,
    ) {
      requireAuth(ctx);
      const client = new ServiceClient(ctx.services.payments, ctx.token);
      return client.post<R>('/api/v1/passenger-services', {
        passengerId:     args.passengerId,
        serviceConfigId: args.serviceConfigId,
        reservationId:   args.reservationId,
      });
    },
  },

  // ── FlightOption field resolvers ───────────────────────────────────────────
  // La respuesta REST ya trae datos enriquecidos; estos resolvers hacen el
  // mapping y caen en el DataLoader si algún campo falta.

  FlightOption: {
    // La API REST incluye `airline` extraído de segments[0].airline
    airline: (parent: R) =>
      parent.airline ?? (parent.segments as R[])?.[0]?.airline ?? null,

    // `route.originAirport` ya viene en la respuesta — DataLoader como fallback
    originAirport: (parent: R, _: unknown, ctx: GraphQLContext) => {
      if (parent.route && typeof parent.route === 'object') {
        const route = parent.route as R;
        if (route.originAirport) return route.originAirport;
      }
      const iata = parent.originAirportIata as string | undefined;
      return iata ? ctx.loaders.airportLoader.load(iata) : null;
    },

    destinationAirport: (parent: R, _: unknown, ctx: GraphQLContext) => {
      if (parent.route && typeof parent.route === 'object') {
        const route = parent.route as R;
        if (route.destinationAirport) return route.destinationAirport;
      }
      const iata = parent.destinationAirportIata as string | undefined;
      return iata ? ctx.loaders.airportLoader.load(iata) : null;
    },

    durationMinutes: (parent: R) => parent.durationMinutes ?? parent.duration ?? null,

    // `flightClasses` viene en la respuesta REST — alias por si acaso
    flightClasses: (parent: R) =>
      (parent.flightClasses as R[] | undefined) ??
      (parent.classes as R[] | undefined) ?? [],

    segments: (parent: R) => (parent.segments as R[] | undefined) ?? [],
  },

  // ── Airport ────────────────────────────────────────────────────────────────

  Airport: {
    // catalog-service devuelve city/country como objetos { id, name, ... }
    city:    (parent: R) => {
      const c = parent.city;
      return typeof c === 'object' && c !== null ? (c as R).name : c;
    },
    country: (parent: R) => {
      const c = parent.country;
      return typeof c === 'object' && c !== null ? (c as R).name : c;
    },
  },

  // ── FlightClass ────────────────────────────────────────────────────────────

  FlightClass: {
    cabinClass: (parent: R) => String(parent.cabinClass ?? parent.classType ?? 'ECONOMY'),
    basePrice:  (parent: R) => Number(parent.basePrice ?? 0),
  },

  // ── ReservationDetail ──────────────────────────────────────────────────────
  // Aquí está el valor real del agregador: pagos y boarding passes
  // se cargan en paralelo desde distintos microservicios.

  ReservationDetail: {
    // El endpoint /api/v1/reservations/:id ya trae `flight` y `passengers`
    flight:     (parent: R) => parent.flight ?? null,
    passengers: (parent: R) => (parent.passengers as R[] | undefined) ?? [],

    totalAmount: (parent: R) => Number(parent.totalAmount ?? 0),

    // payments-service — llamada paralela al resolver de la reserva
    async payments(parent: R, _: unknown, ctx: GraphQLContext) {
      try {
        const client = new ServiceClient(ctx.services.payments, ctx.token);
        return await client.get<R[]>(`/api/v1/payments?reservationId=${parent.id}`);
      } catch {
        return [];
      }
    },

    // boarding-passes — otra llamada paralela a booking-service
    async boardingPasses(parent: R, _: unknown, ctx: GraphQLContext) {
      try {
        const client = new ServiceClient(ctx.services.booking, ctx.token);
        return await client.get<R[]>(`/api/v1/boarding-passes?reservationId=${parent.id}`);
      } catch {
        return [];
      }
    },
  },

  // ── Scalar conversions ─────────────────────────────────────────────────────

  Payment: {
    amount: (parent: R) => Number(parent.amount ?? 0),
  },

  Reservation: {
    totalAmount: (parent: R) => Number(parent.totalAmount ?? 0),
  },
};
