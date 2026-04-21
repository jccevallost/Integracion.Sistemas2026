import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSearch() {
  console.log("🔍 Probando buscador de vuelos...");
  
  const vuelos = await prisma.flight.findMany({
    where: {
      originAirportIata: 'UIO',
      status: 'SCHEDULED'
    },
    include: {
      segments: {
        include: {
          airline: true,
          aircraft: true
        }
      },
      flightClasses: true
    }
  });

  console.log("✈️ Vuelos encontrados:", JSON.stringify(vuelos, null, 2));
}

testSearch();