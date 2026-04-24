// infrastructure/container.ts
// Contenedor de Inyección de Dependencias — ensambla todas las capas.
import prisma from './database/prisma.client.js';

// ── Repositories ─────────────────────────────────────────────
import { CountryRepository }              from '../modules/api_countries/repositories/CountryRepository.js';
import { CityRepository }                 from '../modules/api_cities/repositories/CityRepository.js';
import { AirportRepository }              from '../modules/api_airports/repositories/AirportRepository.js';
import { AirlineRepository }              from '../modules/api_airlines/repositories/AirlineRepository.js';
import { AircraftRepository }             from '../modules/api_aircrafts/repositories/AircraftRepository.js';
import { FlightRepository }               from '../modules/api_flights/repositories/FlightRepository.js';
import { FlightClassRepository }          from '../modules/api_flight_classes/repositories/FlightClassRepository.js';
import { ReservationRepository }          from '../modules/api_reservations/repositories/ReservationRepository.js';
import { UserRepository }                 from '../modules/api_users/repositories/UserRepository.js';
import { PromotionRepository }            from '../modules/api_promotions/repositories/PromotionRepository.js';
import { AuditLogRepository }             from '../modules/api_audit_logs/repositories/AuditLogRepository.js';
import { AirlineAirportRepository }       from '../modules/api_airline_airports/repositories/AirlineAirportRepository.js';
import { AirlineServiceConfigRepository } from '../modules/api_airline_service_configs/repositories/AirlineServiceConfigRepository.js';
import { BillingProfileRepository }       from '../modules/api_billing_profiles/repositories/BillingProfileRepository.js';
import { BoardingPassRepository }         from '../modules/api_boarding_passes/repositories/BoardingPassRepository.js';
import { InvoiceRepository }              from '../modules/api_invoices/repositories/InvoiceRepository.js';
import { InvoiceItemRepository }          from '../modules/api_invoice_items/repositories/InvoiceItemRepository.js';
import { PassengerServiceRepository }     from '../modules/api_passenger_services/repositories/PassengerServiceRepository.js';
import { PaymentRepository }              from '../modules/api_payments/repositories/PaymentRepository.js';
import { ReservationPassengerRepository } from '../modules/api_reservation_passengers/repositories/ReservationPassengerRepository.js';
import { SegmentRepository }              from '../modules/api_segments/repositories/SegmentRepository.js';
import { ServiceCatalogRepository }       from '../modules/api_service_catalog/repositories/ServiceCatalogRepository.js';

// ── Query Repositories ────────────────────────────────────────
import {
  FlightQueryRepository,
  ReservationQueryRepository,
  UserQueryRepository,
  AirportQueryRepository,
  CountryQueryRepository,
  CityQueryRepository,
  AirlineQueryRepository,
  AircraftQueryRepository,
  AirlineAirportQueryRepository,
  AirlineServiceConfigQueryRepository,
  FlightClassQueryRepository,
  SegmentQueryRepository,
  ServiceCatalogQueryRepository,
  PromotionQueryRepository,
  BillingProfileQueryRepository,
  PaymentQueryRepository,
  InvoiceQueryRepository,
  InvoiceItemQueryRepository,
  BoardingPassQueryRepository,
  PassengerServiceQueryRepository,
  ReservationPassengerQueryRepository,
  AuditLogQueryRepository,
} from './queries/index.js';

// ── Services ──────────────────────────────────────────────────
import { AuthService }                  from '../modules/api_users/services/AuthService.js';
import { FlightService }                from '../modules/api_flights/services/FlightService.js';
import { ReservationService }           from '../modules/api_reservations/services/ReservationService.js';
import { PromotionService }             from '../modules/api_promotions/services/PromotionService.js';
import { UserService }                  from '../modules/api_users/services/UserService.js';
import { CountryService }               from '../modules/api_countries/services/CountryService.js';
import { CityService }                  from '../modules/api_cities/services/CityService.js';
import { AirportService }               from '../modules/api_airports/services/AirportService.js';
import { AirlineService }               from '../modules/api_airlines/services/AirlineService.js';
import { AircraftService }              from '../modules/api_aircrafts/services/AircraftService.js';
import { AirlineAirportService }        from '../modules/api_airline_airports/services/AirlineAirportService.js';
import { AirlineServiceConfigService }  from '../modules/api_airline_service_configs/services/AirlineServiceConfigService.js';
import { FlightClassService }           from '../modules/api_flight_classes/services/FlightClassService.js';
import { SegmentService }               from '../modules/api_segments/services/SegmentService.js';
import { ServiceCatalogService }        from '../modules/api_service_catalog/services/ServiceCatalogService.js';
import { BillingProfileService }        from '../modules/api_billing_profiles/services/BillingProfileService.js';
import { BoardingPassService }          from '../modules/api_boarding_passes/services/BoardingPassService.js';
import { PaymentService }               from '../modules/api_payments/services/PaymentService.js';
import { InvoiceService }               from '../modules/api_invoices/services/InvoiceService.js';
import { InvoiceItemService }           from '../modules/api_invoice_items/services/InvoiceItemService.js';
import { PassengerServiceService }      from '../modules/api_passenger_services/services/PassengerServiceService.js';
import { ReservationPassengerService }  from '../modules/api_reservation_passengers/services/ReservationPassengerService.js';
import { AuditLogService }              from '../modules/api_audit_logs/services/AuditLogService.js';

// ── Controllers ───────────────────────────────────────────────
import { AuthController }                   from '../modules/api_users/controllers/AuthController.js';
import { FlightController }                 from '../modules/api_flights/controllers/FlightController.js';
import { ReservationController }            from '../modules/api_reservations/controllers/ReservationController.js';
import { PromotionController }              from '../modules/api_promotions/controllers/PromotionController.js';
import { AdminController }                  from '../modules/api_admin/controllers/AdminController.js';
import { CountryController }                from '../modules/api_countries/controllers/CountryController.js';
import { CityController }                   from '../modules/api_cities/controllers/CityController.js';
import { AirportController }                from '../modules/api_airports/controllers/AirportController.js';
import { AirlineController }                from '../modules/api_airlines/controllers/AirlineController.js';
import { AircraftController }               from '../modules/api_aircrafts/controllers/AircraftController.js';
import { AirlineAirportController }         from '../modules/api_airline_airports/controllers/AirlineAirportController.js';
import { AirlineServiceConfigController }   from '../modules/api_airline_service_configs/controllers/AirlineServiceConfigController.js';
import { FlightClassController }            from '../modules/api_flight_classes/controllers/FlightClassController.js';
import { SegmentController }                from '../modules/api_segments/controllers/SegmentController.js';
import { ServiceCatalogController }         from '../modules/api_service_catalog/controllers/ServiceCatalogController.js';
import { BillingProfileController }         from '../modules/api_billing_profiles/controllers/BillingProfileController.js';
import { BoardingPassController }           from '../modules/api_boarding_passes/controllers/BoardingPassController.js';
import { PaymentController }                from '../modules/api_payments/controllers/PaymentController.js';
import { InvoiceController }                from '../modules/api_invoices/controllers/InvoiceController.js';
import { InvoiceItemController }            from '../modules/api_invoice_items/controllers/InvoiceItemController.js';
import { PassengerServiceController }       from '../modules/api_passenger_services/controllers/PassengerServiceController.js';
import { ReservationPassengerController }   from '../modules/api_reservation_passengers/controllers/ReservationPassengerController.js';
import { AuditLogController }               from '../modules/api_audit_logs/controllers/AuditLogController.js';

// ============================================================
//   INSTANCIACIÓN (manual DI)
// ============================================================

// Repositories
const countryRepo              = new CountryRepository(prisma);
const cityRepo                 = new CityRepository(prisma);
const airportRepo              = new AirportRepository(prisma);
const airlineRepo              = new AirlineRepository(prisma);
const aircraftRepo             = new AircraftRepository(prisma);
const flightRepo               = new FlightRepository(prisma);
const flightClassRepo          = new FlightClassRepository(prisma);
const reservationRepo          = new ReservationRepository(prisma);
const userRepo                 = new UserRepository(prisma);
const promotionRepo            = new PromotionRepository(prisma);
const auditLogRepo             = new AuditLogRepository(prisma);
const airlineAirportRepo       = new AirlineAirportRepository(prisma);
const airlineServiceConfigRepo = new AirlineServiceConfigRepository(prisma);
const billingProfileRepo       = new BillingProfileRepository(prisma);
const boardingPassRepo         = new BoardingPassRepository(prisma);
const invoiceRepo              = new InvoiceRepository(prisma);
const invoiceItemRepo          = new InvoiceItemRepository(prisma);
const passengerServiceRepo     = new PassengerServiceRepository(prisma);
const paymentRepo              = new PaymentRepository(prisma);
const reservationPassengerRepo = new ReservationPassengerRepository(prisma);
const segmentRepo              = new SegmentRepository(prisma);
const serviceCatalogRepo       = new ServiceCatalogRepository(prisma);

// Query Repositories
const flightQuery               = new FlightQueryRepository(prisma);
const reservationQuery          = new ReservationQueryRepository(prisma);
const userQuery                 = new UserQueryRepository(prisma);
const airportQuery              = new AirportQueryRepository(prisma);
const countryQuery              = new CountryQueryRepository(prisma);
const cityQuery                 = new CityQueryRepository(prisma);
const airlineQuery              = new AirlineQueryRepository(prisma);
const aircraftQuery             = new AircraftQueryRepository(prisma);
const airlineAirportQuery       = new AirlineAirportQueryRepository(prisma);
const airlineServiceConfigQuery = new AirlineServiceConfigQueryRepository(prisma);
const flightClassQuery          = new FlightClassQueryRepository(prisma);
const segmentQuery              = new SegmentQueryRepository(prisma);
const serviceCatalogQuery       = new ServiceCatalogQueryRepository(prisma);
const promotionQuery            = new PromotionQueryRepository(prisma);
const billingProfileQuery       = new BillingProfileQueryRepository(prisma);
const paymentQuery              = new PaymentQueryRepository(prisma);
const invoiceQuery              = new InvoiceQueryRepository(prisma);
const invoiceItemQuery          = new InvoiceItemQueryRepository(prisma);
const boardingPassQuery         = new BoardingPassQueryRepository(prisma);
const passengerServiceQuery     = new PassengerServiceQueryRepository(prisma);
const reservationPassengerQuery = new ReservationPassengerQueryRepository(prisma);
const auditLogQuery             = new AuditLogQueryRepository(prisma);

// Services
const authService                 = new AuthService(userRepo);
const flightService               = new FlightService(flightRepo);
const reservationService          = new ReservationService(reservationRepo, flightClassRepo, promotionRepo);
const promotionService            = new PromotionService(promotionRepo);
const userService                 = new UserService(userRepo);
const countryService              = new CountryService(countryRepo);
const cityService                 = new CityService(cityRepo);
const airportService              = new AirportService(airportRepo, airportQuery);
const airlineService              = new AirlineService(airlineRepo);
const aircraftService             = new AircraftService(aircraftRepo);
const airlineAirportService       = new AirlineAirportService(airlineAirportRepo);
const airlineServiceConfigService = new AirlineServiceConfigService(airlineServiceConfigRepo);
const flightClassService          = new FlightClassService(flightClassRepo);
const segmentService              = new SegmentService(segmentRepo);
const serviceCatalogService       = new ServiceCatalogService(serviceCatalogRepo);
const billingProfileService       = new BillingProfileService(billingProfileRepo);
const boardingPassService         = new BoardingPassService(boardingPassRepo);
const paymentService              = new PaymentService(paymentRepo, billingProfileRepo, invoiceRepo, prisma);
const invoiceService              = new InvoiceService(invoiceRepo);
const invoiceItemService          = new InvoiceItemService(invoiceItemRepo);
const passengerServiceService     = new PassengerServiceService(passengerServiceRepo);
const reservationPassengerService = new ReservationPassengerService(reservationPassengerRepo);
const auditLogService             = new AuditLogService(auditLogRepo);

// Controllers
export const authController                 = new AuthController(authService);
export const flightController               = new FlightController(flightService);
export const reservationController          = new ReservationController(reservationService);
export const promotionController            = new PromotionController(promotionService);
export const adminController                = new AdminController(userService, airportQuery, flightQuery, reservationQuery, userQuery);
export const countryController              = new CountryController(countryService);
export const cityController                 = new CityController(cityService);
export const airportController              = new AirportController(airportService);
export const airlineController              = new AirlineController(airlineService);
export const aircraftController             = new AircraftController(aircraftService);
export const airlineAirportController       = new AirlineAirportController(airlineAirportService);
export const airlineServiceConfigController = new AirlineServiceConfigController(airlineServiceConfigService);
export const flightClassController          = new FlightClassController(flightClassService);
export const segmentController              = new SegmentController(segmentService);
export const serviceCatalogController       = new ServiceCatalogController(serviceCatalogService);
export const billingProfileController       = new BillingProfileController(billingProfileService);
export const boardingPassController         = new BoardingPassController(boardingPassService);
export const paymentController              = new PaymentController(paymentService);
export const invoiceController              = new InvoiceController(invoiceService);
export const invoiceItemController          = new InvoiceItemController(invoiceItemService);
export const passengerServiceController     = new PassengerServiceController(passengerServiceService);
export const reservationPassengerController = new ReservationPassengerController(reservationPassengerService);
export const auditLogController             = new AuditLogController(auditLogService);

export { prisma };

// Query repos exportados para uso en rutas/stats externas
export {
  countryQuery,
  cityQuery,
  airlineQuery,
  aircraftQuery,
  airlineAirportQuery,
  airlineServiceConfigQuery,
  flightClassQuery,
  segmentQuery,
  serviceCatalogQuery,
  promotionQuery,
  billingProfileQuery,
  paymentQuery,
  invoiceQuery,
  invoiceItemQuery,
  boardingPassQuery,
  passengerServiceQuery,
  reservationPassengerQuery,
  auditLogQuery,
};
