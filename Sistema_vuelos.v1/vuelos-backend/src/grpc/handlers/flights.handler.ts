import type { FlightService } from '../../modules/api_flights/services/FlightService.js';
import type { FlightClassService } from '../../modules/api_flight_classes/services/FlightClassService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';

export function createFlightHandlers(
  flightService: FlightService,
  flightClassService: FlightClassService,
) {
  return {
    async SearchFlights(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const { origin, destination, date, passengers, cabin_class } = call.request;
        const results = await flightService.search(origin, destination, date, passengers || undefined, cabin_class || undefined);
        callback(null, {
          success: true,
          flights: results.map(mapFlight),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async GetFlight(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const flight = await flightService.getById(call.request.id);
        callback(null, { success: true, flight: mapFlight(flight) });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async GetFlightAvailability(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const classes = await flightClassService.findByFlight(call.request.id);
        callback(null, {
          success: true,
          classes: (classes as any[]).map(mapFlightClass),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}

function mapFlight(f: any) {
  return {
    id: f.id ?? '',
    origin_iata: f.originAirportIata ?? '',
    destination_iata: f.destinationAirportIata ?? '',
    departure_date: f.departureDate ? String(f.departureDate) : '',
    status: f.status ?? '',
    duration: f.duration ?? 0,
    stops: f.stops ?? 0,
    lowest_price: f.lowestPrice ? Number(f.lowestPrice) : 0,
    segments: (f.segments ?? []).map((s: any) => ({
      id: s.id ?? '',
      origin_iata: s.originAirportIata ?? s.originAirport?.iataCode ?? '',
      destination_iata: s.destinationAirportIata ?? s.destinationAirport?.iataCode ?? '',
      departure: s.departureDateTime ? String(s.departureDateTime) : '',
      arrival: s.arrivalDateTime ? String(s.arrivalDateTime) : '',
      duration: s.estimatedDuration ?? 0,
      airline_iata: s.airline?.iataCode ?? '',
    })),
    classes: (f.flightClasses ?? []).map(mapFlightClass),
  };
}

function mapFlightClass(c: any) {
  return {
    id: c.id ?? '',
    flight_id: c.flightId ?? '',
    cabin_class: c.cabinClass ?? '',
    available_seats: c.availableSeats ?? 0,
    base_price: c.basePrice ? Number(c.basePrice) : 0,
  };
}
