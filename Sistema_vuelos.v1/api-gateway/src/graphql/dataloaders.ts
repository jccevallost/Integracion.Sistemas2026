import DataLoader from 'dataloader';
import { ServiceClient } from './service-client.js';

type AnyRecord = Record<string, unknown>;

/**
 * DataLoaders por request — previenen el problema N+1 cuando el frontend
 * resuelve aeropuertos o aerolíneas para múltiples vuelos en paralelo.
 *
 * Ejemplo: 10 vuelos en flightSearch → solo 10 fetch (no 10×2 = 20)
 * porque DataLoader agrupa y deduplica las cargas del mismo request.
 */
export function createLoaders(catalogUrl: string, token?: string) {
  const client = new ServiceClient(catalogUrl, token);

  // Carga aeropuertos por código IATA (ya presentes en la respuesta de vuelos)
  const airportLoader = new DataLoader<string, AnyRecord | null>(
    async (iataCodes) => {
      const results = await Promise.allSettled(
        (iataCodes as string[]).map((code) =>
          client.get<AnyRecord | AnyRecord[]>(`/api/v1/airports?iataCode=${code}`)
            .then((data) => (Array.isArray(data) ? (data[0] ?? null) : data)),
        ),
      );
      return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
    },
    { cache: true },
  );

  // Carga aerolíneas por ID (fallback cuando el vuelo solo trae airlineId)
  const airlineLoader = new DataLoader<string, AnyRecord | null>(
    async (ids) => {
      const results = await Promise.allSettled(
        (ids as string[]).map((id) => client.get<AnyRecord>(`/api/v1/airlines/${id}`)),
      );
      return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
    },
    { cache: true },
  );

  return { airportLoader, airlineLoader };
}

export type Loaders = ReturnType<typeof createLoaders>;
