import { PrismaClient, UserRole, FlightStatus, CabinClass, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed profesional...');

  // 1. PAÍSES (Catálogo Maestro)
  const ecuador = await prisma.country.upsert({
    where: { isoCode: 'EC' },
    update: {},
    create: { name: 'Ecuador', isoCode: 'EC', phoneCode: '+593', currencyCode: 'USD' }
  });

  const colombia = await prisma.country.upsert({
    where: { isoCode: 'CO' },
    update: {},
    create: { name: 'Colombia', isoCode: 'CO', phoneCode: '+57', currencyCode: 'COP' }
  });

  // 2. CIUDADES
  const quito = await prisma.city.upsert({
    where: { iataCode: 'UIO' },
    update: {},
    create: { name: 'Quito', countryId: ecuador.id, iataCode: 'UIO' }
  });

  const bogota = await prisma.city.upsert({
    where: { iataCode: 'BOG' },
    update: {},
    create: { name: 'Bogotá', countryId: colombia.id, iataCode: 'BOG' }
  });

  // 3. USUARIOS (Normalizados)
  const adminPassword = await bcrypt.hash('JcT11.06ec', 10);
  await prisma.user.upsert({
    where: { email: 'admin@vuelosapp.com' },
    update: {},
    create: {
      email: 'admin@vuelosapp.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      firstLastName: 'Sistema',
      mainAddress: 'Av. Amazonas N-100',
      cityId: quito.id,
      role: UserRole.ADMIN,
    },
  });

  // 4. AEROLÍNEAS Y AVIONES
  const avianca = await prisma.airline.upsert({
    where: { iataCode: 'AV' },
    update: {},
    create: { iataCode: 'AV', name: 'Avianca', countryId: colombia.id },
  });

  const aircraft = await prisma.aircraft.upsert({
    where: { registration: 'HC-AV123' },
    update: {},
    create: { modelName: 'Airbus A320', registration: 'HC-AV123', airlineId: avianca.id, hasWifi: true }
  });

  // 5. AEROPUERTOS
  const aptUIO = await prisma.airport.upsert({
    where: { iataCode: 'UIO' },
    update: {},
    create: { iataCode: 'UIO', name: 'Mariscal Sucre', cityId: quito.id, timezone: 'America/Guayaquil' }
  });

  const aptBOG = await prisma.airport.upsert({
    where: { iataCode: 'BOG' },
    update: {},
    create: { iataCode: 'BOG', name: 'El Dorado', cityId: bogota.id, timezone: 'America/Bogota' }
  });

  // 6. CATÁLOGO DE SERVICIOS
  const bagService = await prisma.serviceCatalog.upsert({
    where: { code: 'BAG_23KG' },
    update: {},
    create: { name: 'Maleta de Bodega 23kg', code: 'BAG_23KG', category: 'BAGGAGE' }
  });

  await prisma.airlineServiceConfig.create({
    data: { serviceId: bagService.id, airlineId: avianca.id, price: 35.00 }
  });

  // 7. VUELOS CON SEGMENTOS (UIO -> BOG)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.flight.create({
    data: {
      originAirportIata: 'UIO',
      destinationAirportIata: 'BOG',
      departureDate: tomorrow,
      status: FlightStatus.SCHEDULED,
      segments: {
        create: {
          segmentNumber: 'AV101',
          originAirportId: aptUIO.id,
          destinationAirportId: aptBOG.id,
          departureDateTime: new Date(tomorrow.setHours(8, 0)),
          arrivalDateTime: new Date(tomorrow.setHours(9, 30)),
          airlineId: avianca.id,
          aircraftId: aircraft.id,
          estimatedDuration: 90
        }
      },
      flightClasses: {
        create: [
          { cabinClass: CabinClass.ECONOMY, availableSeats: 100, basePrice: 120.00 },
          { cabinClass: CabinClass.BUSINESS, availableSeats: 10, basePrice: 350.00 }
        ]
      }
    }
  });

  console.log('✅ Seed completado exitosamente con geografía y segmentos.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });