import 'dotenv/config';
import { createServiceApp } from '../shared/app-factory.js';
import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { validateJwtConfig } from '../shared/security/jwt.config.js';
import prisma from '../shared/database/prisma.catalog.client.js';

import { CountryRepository }              from '../modules/api_countries/repositories/CountryRepository.js';
import { CityRepository }                 from '../modules/api_cities/repositories/CityRepository.js';
import { AirportRepository }              from '../modules/api_airports/repositories/AirportRepository.js';
import { AirlineRepository }              from '../modules/api_airlines/repositories/AirlineRepository.js';
import { AircraftRepository }             from '../modules/api_aircrafts/repositories/AircraftRepository.js';
import { AirlineAirportRepository }       from '../modules/api_airline_airports/repositories/AirlineAirportRepository.js';
import { AirlineServiceConfigRepository } from '../modules/api_airline_service_configs/repositories/AirlineServiceConfigRepository.js';
import { ServiceCatalogRepository }       from '../modules/api_service_catalog/repositories/ServiceCatalogRepository.js';

import {
  AirportQueryRepository,
  CountryQueryRepository,
  CityQueryRepository,
  AirlineQueryRepository,
  AircraftQueryRepository,
  AirlineAirportQueryRepository,
  AirlineServiceConfigQueryRepository,
  ServiceCatalogQueryRepository,
} from '../shared/queries/index.js';

import { CountryService }             from '../modules/api_countries/services/CountryService.js';
import { CityService }                from '../modules/api_cities/services/CityService.js';
import { AirportService }             from '../modules/api_airports/services/AirportService.js';
import { AirlineService }             from '../modules/api_airlines/services/AirlineService.js';
import { AircraftService }            from '../modules/api_aircrafts/services/AircraftService.js';
import { AirlineAirportService }      from '../modules/api_airline_airports/services/AirlineAirportService.js';
import { AirlineServiceConfigService } from '../modules/api_airline_service_configs/services/AirlineServiceConfigService.js';
import { ServiceCatalogService }      from '../modules/api_service_catalog/services/ServiceCatalogService.js';

import { CountryController }             from '../modules/api_countries/controllers/CountryController.js';
import { CityController }                from '../modules/api_cities/controllers/CityController.js';
import { AirportController }             from '../modules/api_airports/controllers/AirportController.js';
import { AirlineController }             from '../modules/api_airlines/controllers/AirlineController.js';
import { AircraftController }            from '../modules/api_aircrafts/controllers/AircraftController.js';
import { AirlineAirportController }      from '../modules/api_airline_airports/controllers/AirlineAirportController.js';
import { AirlineServiceConfigController } from '../modules/api_airline_service_configs/controllers/AirlineServiceConfigController.js';
import { ServiceCatalogController }      from '../modules/api_service_catalog/controllers/ServiceCatalogController.js';

import { createCountryRouter }            from '../modules/api_countries/routes/countries.routes.js';
import { createCityRouter }               from '../modules/api_cities/routes/cities.routes.js';
import { createAirportRouter }            from '../modules/api_airports/routes/airports.routes.js';
import { createAirlineRouter }            from '../modules/api_airlines/routes/airlines.routes.js';
import { createAircraftRouter }           from '../modules/api_aircrafts/routes/aircraft.routes.js';
import { createAirlineAirportRouter }     from '../modules/api_airline_airports/routes/airline-airports.routes.js';
import { createAirlineServiceConfigRouter } from '../modules/api_airline_service_configs/routes/airline-service-config.routes.js';
import { createServiceCatalogRouter }     from '../modules/api_service_catalog/routes/service-catalog.routes.js';

const PORT = Number(process.env.CATALOG_SERVICE_PORT) || 3002;

validateJwtConfig();

// Repositories
const countryRepo              = new CountryRepository(prisma);
const cityRepo                 = new CityRepository(prisma);
const airportRepo              = new AirportRepository(prisma);
const airlineRepo              = new AirlineRepository(prisma);
const aircraftRepo             = new AircraftRepository(prisma);
const airlineAirportRepo       = new AirlineAirportRepository(prisma);
const airlineServiceConfigRepo = new AirlineServiceConfigRepository(prisma);
const serviceCatalogRepo       = new ServiceCatalogRepository(prisma);

// Query repos
const airportQuery              = new AirportQueryRepository(prisma);
const countryQuery              = new CountryQueryRepository(prisma);
const cityQuery                 = new CityQueryRepository(prisma);
const airlineQuery              = new AirlineQueryRepository(prisma);
const aircraftQuery             = new AircraftQueryRepository(prisma);
const airlineAirportQuery       = new AirlineAirportQueryRepository(prisma);
const airlineServiceConfigQuery = new AirlineServiceConfigQueryRepository(prisma);
const serviceCatalogQuery       = new ServiceCatalogQueryRepository(prisma);

// Services
const countryService             = new CountryService(countryRepo);
const cityService                = new CityService(cityRepo);
const airportService             = new AirportService(airportRepo, airportQuery);
const airlineService             = new AirlineService(airlineRepo);
const aircraftService            = new AircraftService(aircraftRepo);
const airlineAirportService      = new AirlineAirportService(airlineAirportRepo);
const airlineServiceConfigService = new AirlineServiceConfigService(airlineServiceConfigRepo);
const serviceCatalogService      = new ServiceCatalogService(serviceCatalogRepo);

// Controllers
const countryController             = new CountryController(countryService);
const cityController                = new CityController(cityService);
const airportController             = new AirportController(airportService);
const airlineController             = new AirlineController(airlineService);
const aircraftController            = new AircraftController(aircraftService);
const airlineAirportController      = new AirlineAirportController(airlineAirportService);
const airlineServiceConfigController = new AirlineServiceConfigController(airlineServiceConfigService);
const serviceCatalogController      = new ServiceCatalogController(serviceCatalogService);

const app = createServiceApp('catalog-service');

app.get(['/health', '/'], (_req, res) => {
  res.json({
    service: 'catalog-service',
    status: 'online',
    port: PORT,
    version: '2.0.0',
    resources: ['countries', 'cities', 'airports', 'airlines', 'aircraft', 'airline-airports', 'airline-service-config', 'service-catalog'],
  });
});

app.use('/api/v1/countries',              createCountryRouter(countryController));
app.use('/api/v1/cities',                 createCityRouter(cityController));
app.use('/api/v1/airports',               createAirportRouter(airportController));
app.use('/api/v1/airlines',               createAirlineRouter(airlineController));
app.use('/api/v1/aircraft',               createAircraftRouter(aircraftController));
app.use('/api/v1/airline-airports',       createAirlineAirportRouter(airlineAirportController));
app.use('/api/v1/airline-service-config', createAirlineServiceConfigRouter(airlineServiceConfigController));
app.use('/api/v1/service-catalog',        createServiceCatalogRouter(serviceCatalogController));

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` } });
});
app.use(errorHandler);

async function start() {
  await prisma.$connect();
  app.listen(PORT, () => console.log(`🚀 [catalog-service] → http://localhost:${PORT}`));
}

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('uncaughtException',  (err) => { console.error('[catalog-service] Excepción:', err); process.exit(1); });
process.on('unhandledRejection', (r)   => { console.error('[catalog-service] Promesa rechazada:', r); process.exit(1); });

start().catch((err) => { console.error('[catalog-service] Error al iniciar:', err); process.exit(1); });
