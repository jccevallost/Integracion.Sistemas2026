import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import type { FlightService } from '../modules/api_flights/services/FlightService.js';
import type { FlightClassService } from '../modules/api_flight_classes/services/FlightClassService.js';
import type { PromotionService } from '../modules/api_promotions/services/PromotionService.js';
import { createFlightHandlers } from './handlers/flights.handler.js';
import { createPromotionHandlers } from './handlers/promotions.handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_DIR = path.join(__dirname, 'proto');

const LOADER_OPTIONS: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

function loadService(protoFile: string, servicePath: string) {
  const def = protoLoader.loadSync(path.join(PROTO_DIR, protoFile), LOADER_OPTIONS);
  const pkg = grpc.loadPackageDefinition(def) as any;
  return servicePath.split('.').reduce((acc: any, part: string) => acc[part], pkg);
}

type FlightsGrpcServices = {
  flightService: FlightService;
  flightClassService: FlightClassService;
  promotionService: PromotionService;
};

export function createFlightsGrpcServer(services: FlightsGrpcServices): grpc.Server {
  const server = new grpc.Server();
  const flightProto = loadService('flights.proto', 'vuelos.v1.FlightService');
  const promotionProto = loadService('promotions.proto', 'vuelos.v1.PromotionService');

  server.addService(
    flightProto.service,
    createFlightHandlers(services.flightService, services.flightClassService),
  );
  server.addService(
    promotionProto.service,
    createPromotionHandlers(services.promotionService),
  );

  return server;
}

export function startFlightsGrpcServer(
  port: number,
  services: FlightsGrpcServices,
): Promise<grpc.Server> {
  return new Promise((resolve, reject) => {
    const server = createFlightsGrpcServer(services);
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, boundPort) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`gRPC flights-service -> grpc://localhost:${boundPort}`);
        console.log('   FlightService, PromotionService');
        resolve(server);
      },
    );
  });
}
