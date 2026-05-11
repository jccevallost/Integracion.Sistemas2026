import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import path from 'path';

import {
  flightService,
  flightClassService,
  reservationService,
  reservationPassengerService,
  paymentService,
  promotionService,
  boardingPassService,
} from '../shared/container.js';

import { createFlightHandlers }      from './handlers/flights.handler.js';
import { createReservationHandlers } from './handlers/reservations.handler.js';
import { createPassengerHandlers }   from './handlers/passengers.handler.js';
import { createPaymentHandlers }     from './handlers/payments.handler.js';
import { createPromotionHandlers }   from './handlers/promotions.handler.js';
import { createCheckInHandlers }     from './handlers/checkin.handler.js';

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
  const parts = servicePath.split('.');
  return parts.reduce((acc: any, part: string) => acc[part], pkg);
}

export function createGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  const flightProto      = loadService('flights.proto',      'vuelos.v1.FlightService');
  const reservationProto = loadService('reservations.proto', 'vuelos.v1.ReservationService');
  const passengerProto   = loadService('passengers.proto',   'vuelos.v1.PassengerService');
  const paymentProto     = loadService('payments.proto',     'vuelos.v1.PaymentService');
  const promotionProto   = loadService('promotions.proto',   'vuelos.v1.PromotionService');
  const checkinProto     = loadService('checkin.proto',      'vuelos.v1.CheckInService');

  server.addService(
    flightProto.service,
    createFlightHandlers(flightService, flightClassService),
  );
  server.addService(
    reservationProto.service,
    createReservationHandlers(reservationService),
  );
  server.addService(
    passengerProto.service,
    createPassengerHandlers(reservationPassengerService),
  );
  server.addService(
    paymentProto.service,
    createPaymentHandlers(paymentService),
  );
  server.addService(
    promotionProto.service,
    createPromotionHandlers(promotionService),
  );
  server.addService(
    checkinProto.service,
    createCheckInHandlers(boardingPassService),
  );

  return server;
}

export function startGrpcServer(port: number): Promise<grpc.Server> {
  return new Promise((resolve, reject) => {
    const server = createGrpcServer();
    const address = `0.0.0.0:${port}`;

    server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n📡 gRPC Server     — grpc://localhost:${boundPort}`);
      console.log(`   Servicios expuestos al Booking Central:`);
      console.log(`   • FlightService      (SearchFlights, GetFlight, GetFlightAvailability)`);
      console.log(`   • ReservationService (CreateReservation, GetReservation, CancelReservation, ListReservations)`);
      console.log(`   • PassengerService   (GetPassengersByReservation)`);
      console.log(`   • PaymentService     (ProcessPayment, GetPaymentByReservation)`);
      console.log(`   • PromotionService   (ValidatePromotion)`);
      console.log(`   • CheckInService     (CheckIn, GetBoardingPassByPassenger)`);
      resolve(server);
    });
  });
}
