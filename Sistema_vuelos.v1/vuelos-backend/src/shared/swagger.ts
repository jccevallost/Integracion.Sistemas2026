// shared/swagger.ts — Configuración central de OpenAPI / Swagger
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title:       'Vuelos API',
      version:     '1.1.0',
      description: 'API REST publica de VuelosApp. REST/JSON es el contrato estable para Angular e integradores; gRPC, GraphQL y eventos quedan como evolucion documentada hasta que exista implementacion productiva.',
      contact: {
        name:  'Sistema Vuelos',
        email: 'admin@vuelos.com',
      },
    },
    servers: [
      { url: 'https://integracion-sistemas2026.onrender.com/api/v1', description: 'Produccion (Render)' },
      { url: 'http://localhost:3000/api/v1', description: 'Desarrollo local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'JWT obtenido en POST /auth/login',
        },
      },
      schemas: {
        // ── Respuestas genéricas ────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { description: 'Payload de la respuesta' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Recurso no encontrado' },
              },
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Datos de entrada inválidos' },
                fields: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  example: { email: 'Invalid email', password: 'String must contain at least 6 character(s)' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total:   { type: 'integer' },
            page:    { type: 'integer' },
            limit:   { type: 'integer' },
            pages:   { type: 'integer' },
          },
        },

        // ── Auth / Users ────────────────────────────────────────
        LoginRequest: {
          type: 'object', required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@vuelos.com' },
            password: { type: 'string', example: 'Admin123!' },
          },
        },
        RegisterRequest: {
          type: 'object', required: ['email', 'password', 'firstName', 'firstLastName'],
          properties: {
            email:         { type: 'string', format: 'email' },
            password:      { type: 'string', minLength: 6 },
            firstName:     { type: 'string' },
            secondName:    { type: 'string' },
            firstLastName: { type: 'string' },
            secondLastName:{ type: 'string' },
            phone:         { type: 'string' },
            birthDate:     { type: 'string', format: 'date' },
            mainAddress:   { type: 'string' },
            cityId:        { type: 'string', format: 'uuid' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user:  { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGci...' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            email:         { type: 'string', format: 'email' },
            firstName:     { type: 'string' },
            firstLastName: { type: 'string' },
            role:          { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
            isActive:      { type: 'boolean' },
            city:          { $ref: '#/components/schemas/City' },
          },
        },

        // ── Geografía ───────────────────────────────────────────
        Country: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            name:         { type: 'string', example: 'Ecuador' },
            isoCode:      { type: 'string', example: 'EC', description: 'Código ISO 3166-1 alpha-2' },
            phoneCode:    { type: 'string', example: '+593', nullable: true },
            currencyCode: { type: 'string', example: 'USD', nullable: true },
          },
        },
        City: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string', example: 'Quito' },
            countryId: { type: 'string', format: 'uuid' },
            iataCode:  { type: 'string', example: 'UIO', nullable: true },
            country:   { $ref: '#/components/schemas/Country' },
          },
        },
        Airport: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid' },
            name:     { type: 'string', example: 'Aeropuerto Mariscal Sucre' },
            iataCode: { type: 'string', example: 'UIO' },
            timezone: { type: 'string', example: 'America/Guayaquil' },
            cityId:   { type: 'string', format: 'uuid' },
            city:     { $ref: '#/components/schemas/City' },
          },
        },

        // ── Aerolíneas ──────────────────────────────────────────
        Airline: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string', example: 'LATAM Airlines' },
            iataCode:  { type: 'string', example: 'LA' },
            logoUrl:   { type: 'string', nullable: true },
            countryId: { type: 'string', format: 'uuid' },
            country:   { $ref: '#/components/schemas/Country' },
          },
        },
        Aircraft: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            modelName:    { type: 'string', example: 'Boeing 737-800' },
            registration: { type: 'string', example: 'HC-CPP' },
            hasWifi:      { type: 'boolean', example: true },
            hasUsb:       { type: 'boolean', example: true },
            airlineId:    { type: 'string', format: 'uuid' },
            airline:      { $ref: '#/components/schemas/Airline' },
          },
        },

        // ── Vuelos ──────────────────────────────────────────────
        Flight: {
          type: 'object',
          properties: {
            id:                      { type: 'string', format: 'uuid' },
            flightNumber:            { type: 'string', example: 'LA1234', nullable: true },
            status:                  { type: 'string', enum: ['SCHEDULED','DELAYED','CANCELLED','COMPLETED'] },
            departureDate:           { type: 'string', format: 'date', description: 'Fecha de salida (YYYY-MM-DD)' },
            departureDateTime:       { type: 'string', format: 'date-time', nullable: true },
            arrivalDateTime:         { type: 'string', format: 'date-time', nullable: true },
            originAirportIata:       { type: 'string', example: 'UIO' },
            destinationAirportIata:  { type: 'string', example: 'GYE' },
            duration:                { type: 'integer', description: 'Duración en minutos', nullable: true },
            lowestPrice:             { type: 'number', description: 'Precio mínimo entre las clases disponibles', nullable: true },
            airline:                 { $ref: '#/components/schemas/Airline', nullable: true },
            flightClasses:           { type: 'array', items: { $ref: '#/components/schemas/FlightClass' } },
            route: {
              type: 'object',
              properties: {
                estimatedDuration: { type: 'integer' },
                originAirport: {
                  type: 'object',
                  properties: {
                    iataCode: { type: 'string' },
                    name:     { type: 'string' },
                    city:     { type: 'string' },
                    country:  { type: 'string' },
                    timezone: { type: 'string' },
                  },
                },
                destinationAirport: {
                  type: 'object',
                  properties: {
                    iataCode: { type: 'string' },
                    name:     { type: 'string' },
                    city:     { type: 'string' },
                    country:  { type: 'string' },
                    timezone: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        FlightClass: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            flightId:       { type: 'string', format: 'uuid' },
            cabinClass:     { type: 'string', enum: ['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST'] },
            availableSeats: { type: 'integer' },
            basePrice:      { type: 'number', format: 'float' },
          },
        },
        Segment: {
          type: 'object',
          properties: {
            id:                   { type: 'string', format: 'uuid' },
            segmentNumber:        { type: 'integer' },
            departureDateTime:    { type: 'string', format: 'date-time' },
            arrivalDateTime:      { type: 'string', format: 'date-time' },
            originAirport:        { $ref: '#/components/schemas/Airport' },
            destinationAirport:   { $ref: '#/components/schemas/Airport' },
            airline:              { $ref: '#/components/schemas/Airline' },
          },
        },

        // ── Reservas ────────────────────────────────────────────
        Reservation: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            reservationCode: { type: 'string', example: 'RES-ABCD1234' },
            status:          { type: 'string', enum: ['PENDING','CONFIRMED','CANCELLED','COMPLETED'] },
            totalAmount:     { type: 'number', format: 'float' },
            createdAt:       { type: 'string', format: 'date-time' },
            userId:          { type: 'string', format: 'uuid' },
            flightId:        { type: 'string', format: 'uuid' },
            promotionId:     { type: 'string', format: 'uuid', nullable: true },
            flight:          { $ref: '#/components/schemas/Flight' },
            passengers:      { type: 'array', items: { $ref: '#/components/schemas/ReservationPassenger' } },
            promotion:       { $ref: '#/components/schemas/Promotion', nullable: true },
          },
        },
        ReservationPassenger: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid', description: 'ID del pasajero de reserva (reservationPassengerId)' },
            firstName:      { type: 'string', example: 'Juan' },
            lastName:       { type: 'string', example: 'Pérez' },
            documentNumber: { type: 'string', example: 'A1234567' },
            seatNumber:     { type: 'string', nullable: true },
          },
        },
        CreateReservationRequest: {
          type: 'object', required: ['flightClassId', 'passengers'],
          properties: {
            flightClassId:  { type: 'string', format: 'uuid' },
            promotionCode:  { type: 'string', description: 'Código de promoción opcional' },
            passengers: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['firstName', 'lastName', 'documentNumber'],
                properties: {
                  firstName:      { type: 'string', example: 'Juan' },
                  lastName:       { type: 'string', example: 'Pérez' },
                  documentNumber: { type: 'string', example: 'A1234567' },
                },
              },
            },
          },
        },

        // ── Pagos / Facturación ─────────────────────────────────
        Payment: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            reservationId: { type: 'string', format: 'uuid' },
            amount:        { type: 'number' },
            status:        { type: 'string', enum: ['PENDING','COMPLETED','FAILED','REFUNDED'] },
            provider:      { type: 'string', example: 'VISA', description: 'Ej: VISA, MASTERCARD, AMEX, PAYPAL' },
            transactionId: { type: 'string', example: 'TXN-1714608000000-ABC123', nullable: true },
            createdAt:     { type: 'string', format: 'date-time' },
          },
        },
        BoardingPass: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            passengerId:   { type: 'string', format: 'uuid', description: 'ReservationPassenger.id' },
            segmentId:     { type: 'string', format: 'uuid', description: 'Segment.id' },
            boardingCode:  { type: 'string', example: 'BP-ABCD-EFGH', description: 'Código único de embarque' },
            gate:          { type: 'string', nullable: true, example: 'G14' },
            boardingGroup: { type: 'string', nullable: true, example: 'B' },
            checkInAt:     { type: 'string', format: 'date-time', nullable: true },
            status:        { type: 'string', enum: ['NOT_CHECKED_IN','CHECKED_IN','BOARDED','NO_SHOW'], example: 'NOT_CHECKED_IN' },
          },
        },
        PassengerService: {
          type: 'object',
          properties: {
            id:                 { type: 'string', format: 'uuid' },
            passengerId:        { type: 'string', format: 'uuid', description: 'ReservationPassenger.id' },
            serviceConfigId:    { type: 'string', format: 'uuid', description: 'AirlineServiceConfig.id' },
            quantity:           { type: 'integer', example: 1 },
            unitPriceAtBooking: { type: 'number', example: 25.00, description: 'Precio unitario al momento de la reserva' },
            serviceConfig: {
              type: 'object',
              properties: {
                price:    { type: 'number' },
                currency: { type: 'string' },
                service:  { $ref: '#/components/schemas/ServiceCatalog' },
                airline:  { $ref: '#/components/schemas/Airline' },
              },
            },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            invoiceNumber:    { type: 'string', example: 'INV-20260425-AB1234' },
            paymentId:        { type: 'string', format: 'uuid' },
            billingProfileId: { type: 'string', format: 'uuid' },
            subtotal:         { type: 'number', example: 130.43 },
            taxAmount:        { type: 'number', example: 19.57, description: 'IVA 15%' },
            total:            { type: 'number', example: 150.00 },
            createdAt:        { type: 'string', format: 'date-time' },
            billingProfile: {
              type: 'object',
              properties: {
                businessName: { type: 'string' },
                taxId:        { type: 'string' },
              },
            },
            payment: {
              type: 'object',
              properties: {
                amount:      { type: 'number' },
                reservation: { type: 'object', properties: { reservationCode: { type: 'string' } } },
              },
            },
          },
        },
        InvoiceItem: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            invoiceId:   { type: 'string', format: 'uuid' },
            description: { type: 'string', example: 'Vuelo UIO-GYE Clase Económica' },
            quantity:    { type: 'integer', example: 1 },
            unitPrice:   { type: 'number', example: 89.99 },
            totalPrice:  { type: 'number', example: 89.99, description: '= quantity × unitPrice' },
          },
        },
        BillingProfile: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            userId:       { type: 'string', format: 'uuid' },
            taxId:        { type: 'string', example: '1791234567001', description: 'RUC o cédula' },
            businessName: { type: 'string', example: 'Juan Pérez (persona natural)' },
            address:      { type: 'string', example: 'Av. República 123, Quito' },
            cityId:       { type: 'string', format: 'uuid' },
            email:        { type: 'string', format: 'email', nullable: true },
            isDefault:    { type: 'boolean', example: false },
          },
        },
        AirlineAirport: {
          type: 'object',
          description: 'Relación muchos-a-muchos entre aerolínea y aeropuerto (clave compuesta)',
          properties: {
            airlineId:  { type: 'string', format: 'uuid' },
            airportId:  { type: 'string', format: 'uuid' },
            airline:    { $ref: '#/components/schemas/Airline' },
            airport:    { $ref: '#/components/schemas/Airport' },
          },
        },
        AirlineServiceConfig: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            serviceId:       { type: 'string', format: 'uuid', description: 'ServiceCatalog.id' },
            airlineId:       { type: 'string', format: 'uuid' },
            price:           { type: 'number', example: 25.00 },
            currency:        { type: 'string', example: 'USD' },
            originAirportId: { type: 'string', format: 'uuid', nullable: true },
            destAirportId:   { type: 'string', format: 'uuid', nullable: true },
            service:         { $ref: '#/components/schemas/ServiceCatalog' },
            airline:         { $ref: '#/components/schemas/Airline' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            userId:      { type: 'string', format: 'uuid', nullable: true },
            action:      { type: 'string', enum: ['CREATE','UPDATE','DELETE'], example: 'UPDATE' },
            entity:      { type: 'string', example: 'payment' },
            entityId:    { type: 'string', example: 'uuid-del-recurso' },
            oldData:     { type: 'object', nullable: true, description: 'Estado antes de la mutación' },
            newData:     { type: 'object', nullable: true, description: 'Estado después de la mutación' },
            ipAddress:   { type: 'string', nullable: true },
            userAgent:   { type: 'string', nullable: true },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },

        // ── Servicios ───────────────────────────────────────────
        ServiceCatalog: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'Equipaje adicional' },
            code:        { type: 'string', example: 'BAG_EXTRA' },
            category:    { type: 'string', enum: ['BAGGAGE','MEAL','SEAT','ENTERTAINMENT','LOUNGE','INSURANCE','TRANSPORT','OTRO'] },
            description: { type: 'string' },
          },
        },
        Promotion: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            code:           { type: 'string', example: 'VERANO20' },
            discountType:   { type: 'string', enum: ['PERCENTAGE','FIXED'] },
            discountValue:  { type: 'number' },
            validFrom:      { type: 'string', format: 'date-time' },
            validUntil:     { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',                    description: 'Autenticación y perfil de usuario' },
      { name: 'Countries',               description: 'Países — api_countries' },
      { name: 'Cities',                  description: 'Ciudades — api_cities' },
      { name: 'Airports',                description: 'Aeropuertos — api_airports' },
      { name: 'Airlines',                description: 'Aerolíneas — api_airlines' },
      { name: 'Aircrafts',               description: 'Aeronaves — api_aircrafts' },
      { name: 'Airline Airports',        description: 'Relación aerolínea-aeropuerto — api_airline_airports' },
      { name: 'Airline Service Configs', description: 'Configuración de servicios por aerolínea — api_airline_service_configs' },
      { name: 'Flights',                 description: 'Vuelos — api_flights' },
      { name: 'Flight Classes',          description: 'Clases de vuelo — api_flight_classes' },
      { name: 'Segments',                description: 'Segmentos de vuelo — api_segments' },
      { name: 'Reservations',            description: 'Reservas — api_reservations' },
      { name: 'Reservation Passengers',  description: 'Pasajeros de reserva — api_reservation_passengers' },
      { name: 'Payments',                description: 'Pagos — api_payments' },
      { name: 'Invoices',                description: 'Facturas — api_invoices' },
      { name: 'Invoice Items',           description: 'Ítems de factura — api_invoice_items' },
      { name: 'Billing Profiles',        description: 'Perfiles de facturación — api_billing_profiles' },
      { name: 'Boarding Passes',         description: 'Pases de abordar — api_boarding_passes' },
      { name: 'Passenger Services',      description: 'Servicios de pasajero — api_passenger_services' },
      { name: 'Promotions',              description: 'Promociones — api_promotions' },
      { name: 'Service Catalog',         description: 'Catálogo de servicios — api_service_catalog' },
      { name: 'Audit Logs',              description: 'Auditoría — api_audit_logs' },
      { name: 'Admin',                   description: 'Panel de administración (requiere rol ADMIN)' },
    ],
  },
  // En producción lee los .js compilados; en desarrollo los .ts fuente
  apis: process.env.NODE_ENV === 'production'
    ? ['./dist/shared/swagger-paths.js']
    : ['./src/shared/swagger-paths.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
