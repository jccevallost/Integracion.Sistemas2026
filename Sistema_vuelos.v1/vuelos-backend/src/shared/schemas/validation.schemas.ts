// shared/schemas/validation.schemas.ts
// Schemas Zod — fuente de verdad para validación de entrada y documentación.
import { z } from 'zod';

// ── UUID helper ─────────────────────────────────────────────────────────────
const uuid = z.string().uuid({ message: 'Debe ser un UUID válido' });

// ── Auth ────────────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email:          z.string().email({ message: 'Email inválido' }),
  password:       z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  firstName:      z.string().min(1, { message: 'Nombre es requerido' }),
  firstLastName:  z.string().min(1, { message: 'Apellido es requerido' }),
  secondName:     z.string().optional(),
  secondLastName: z.string().optional(),
  mainAddress:    z.string().min(1, { message: 'Dirección es requerida' }),
  cityId:         uuid.optional(),
  phone:          z.string().optional(),
  birthDate:      z.string().datetime({ message: 'birthDate debe ser fecha ISO' }).optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Contraseña es requerida' }),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Contraseña actual es requerida' }),
  newPassword:     z.string().min(6, { message: 'Nueva contraseña debe tener al menos 6 caracteres' }),
});

// ── Geography ───────────────────────────────────────────────────────────────
export const CreateCountrySchema = z.object({
  name:         z.string().min(1, { message: 'Nombre es requerido' }),
  isoCode:      z.string().min(2).max(3, { message: 'isoCode debe tener 2-3 caracteres (ISO 3166)' }),
  phoneCode:    z.string().optional(),
  currencyCode: z.string().optional(),
});

export const UpdateCountrySchema = z.object({
  name:         z.string().min(1).optional(),
  isoCode:      z.string().min(2).max(3).optional(),
  phoneCode:    z.string().optional().nullable(),
  currencyCode: z.string().optional().nullable(),
});

export const CreateCitySchema = z.object({
  name:      z.string().min(1, { message: 'Nombre es requerido' }),
  countryId: uuid,
  iataCode:  z.string().length(3, { message: 'iataCode debe tener 3 caracteres' }).optional(),
});

export const UpdateCitySchema = z.object({
  name:      z.string().min(1).optional(),
  countryId: uuid.optional(),
  iataCode:  z.string().length(3).optional().nullable(),
});

export const CreateAirportSchema = z.object({
  iataCode: z.string().length(3, { message: 'iataCode debe tener exactamente 3 caracteres' }),
  name:     z.string().min(1, { message: 'Nombre es requerido' }),
  cityId:   uuid,
  timezone: z.string().min(1, { message: 'timezone es requerido (ej: America/Guayaquil)' }),
});

export const UpdateAirportSchema = z.object({
  iataCode: z.string().length(3).optional(),
  name:     z.string().min(1).optional(),
  cityId:   uuid.optional(),
  timezone: z.string().min(1).optional(),
});

// ── Airlines & Aircraft ─────────────────────────────────────────────────────
export const CreateAirlineSchema = z.object({
  iataCode:  z.string().length(2, { message: 'iataCode de aerolínea debe tener 2 caracteres' }),
  name:      z.string().min(1, { message: 'Nombre es requerido' }),
  countryId: uuid,
  logoUrl:   z.string().url({ message: 'logoUrl debe ser una URL válida' }).optional().nullable(),
});

export const UpdateAirlineSchema = z.object({
  iataCode:  z.string().length(2).optional(),
  name:      z.string().min(1).optional(),
  countryId: uuid.optional(),
  logoUrl:   z.string().url().optional().nullable(),
});

export const CreateAircraftSchema = z.object({
  airlineId:    uuid,
  modelName:    z.string().min(1, { message: 'Modelo es requerido' }),
  registration: z.string().min(1, { message: 'Matrícula es requerida' }),
  hasWifi:      z.boolean().optional(),
  hasUsb:       z.boolean().optional(),
});

export const UpdateAircraftSchema = z.object({
  airlineId:    uuid.optional(),
  modelName:    z.string().min(1).optional(),
  registration: z.string().min(1).optional(),
  hasWifi:      z.boolean().optional(),
  hasUsb:       z.boolean().optional(),
});

// ── Flights ─────────────────────────────────────────────────────────────────
export const CreateFlightClassInlineSchema = z.object({
  cabinClass:     z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST'], {
    errorMap: () => ({ message: "cabinClass debe ser: ECONOMY, PREMIUM_ECONOMY, BUSINESS o FIRST" }),
  }),
  availableSeats: z.number().int().min(1, { message: 'availableSeats debe ser >= 1' }),
  basePrice:      z.number().positive({ message: 'basePrice debe ser mayor a 0' }),
});

export const CreateSegmentInlineSchema = z.object({
  segmentNumber:        z.string().min(1, { message: 'segmentNumber es requerido' }),
  originAirportId:      uuid,
  destinationAirportId: uuid,
  departureDateTime:    z.string().datetime({ offset: true, message: 'departureDateTime debe ser fecha ISO 8601' }),
  arrivalDateTime:      z.string().datetime({ offset: true, message: 'arrivalDateTime debe ser fecha ISO 8601' }),
  airlineId:            uuid,
  aircraftId:           uuid.optional().nullable(),
  estimatedDuration:    z.coerce.number().int().positive({ message: 'estimatedDuration en minutos es requerido' }),
});

export const CreateFlightSchema = z.object({
  originAirportIata:      z.string().length(3, { message: 'originAirportIata debe tener 3 caracteres IATA' }),
  destinationAirportIata: z.string().length(3, { message: 'destinationAirportIata debe tener 3 caracteres IATA' }),
  departureDate:          z.string().min(1, { message: 'departureDate es requerida (YYYY-MM-DD o ISO)' }),
  status:                 z.enum(['SCHEDULED','DELAYED','CANCELLED','COMPLETED']).optional(),
  segments:               z.array(CreateSegmentInlineSchema).optional(),
  flightClasses:          z.array(CreateFlightClassInlineSchema).optional(),
}).refine(
  data => data.originAirportIata !== data.destinationAirportIata,
  { message: 'Origen y destino no pueden ser el mismo aeropuerto', path: ['destinationAirportIata'] },
);

export const UpdateFlightSchema = z.object({
  status:                 z.enum(['SCHEDULED','DELAYED','CANCELLED','COMPLETED']).optional(),
  departureDate:          z.string().optional(),
  originAirportIata:      z.string().length(3).optional(),
  destinationAirportIata: z.string().length(3).optional(),
});

export const FlightSearchQuerySchema = z.object({
  origin:      z.string().length(3, { message: 'origin debe ser código IATA de 3 letras' }),
  destination: z.string().length(3, { message: 'destination debe ser código IATA de 3 letras' }),
  date:        z.string().min(1, { message: 'date es requerida' }),
  passengers:  z.coerce.number().int().min(1).max(9).optional(),
  class:       z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST']).optional(),
});

// ── Flight Classes ───────────────────────────────────────────────────────────
export const CreateFlightClassSchema = z.object({
  flightId:       uuid,
  cabinClass:     z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST'], {
    errorMap: () => ({ message: "cabinClass debe ser: ECONOMY, PREMIUM_ECONOMY, BUSINESS o FIRST" }),
  }),
  availableSeats: z.number().int().min(0, { message: 'availableSeats no puede ser negativo' }),
  basePrice:      z.number().positive({ message: 'basePrice debe ser mayor a 0' }),
});

export const UpdateFlightClassSchema = z.object({
  cabinClass:     z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST']).optional(),
  availableSeats: z.number().int().min(0).optional(),
  basePrice:      z.number().positive().optional(),
});

// ── Segments ─────────────────────────────────────────────────────────────────
export const CreateSegmentSchema = CreateSegmentInlineSchema
  .extend({ flightId: uuid.optional().nullable() })
  .refine(
    d => new Date(d.departureDateTime) < new Date(d.arrivalDateTime),
    { message: 'La salida debe ser anterior a la llegada', path: ['arrivalDateTime'] },
  );

export const UpdateSegmentSchema = z.object({
  segmentNumber:        z.string().optional(),
  originAirportId:      uuid.optional(),
  destinationAirportId: uuid.optional(),
  departureDateTime:    z.string().datetime({ offset: true }).optional(),
  arrivalDateTime:      z.string().datetime({ offset: true }).optional(),
  airlineId:            uuid.optional(),
  aircraftId:           uuid.optional().nullable(),
  estimatedDuration:    z.coerce.number().int().positive().optional(),
  flightId:             uuid.optional().nullable(),
}).refine(
  d => {
    if (d.departureDateTime && d.arrivalDateTime) {
      return new Date(d.departureDateTime) < new Date(d.arrivalDateTime);
    }
    return true;
  },
  { message: 'La salida debe ser anterior a la llegada', path: ['arrivalDateTime'] },
);

// ── Reservations ─────────────────────────────────────────────────────────────
const PassengerSchema = z.object({
  firstName:      z.string().min(1, { message: 'Nombre del pasajero es requerido' }),
  lastName:       z.string().min(1, { message: 'Apellido del pasajero es requerido' }),
  documentNumber: z.string().min(1, { message: 'Número de documento es requerido' }),
  seatNumber:     z.string().optional(),
});

export const CreateReservationSchema = z.object({
  flightClassId:  uuid,
  passengers:     z.array(PassengerSchema).min(1, { message: 'Se requiere al menos un pasajero' }),
  promotionCode:  z.string().optional(),
});

// ── Payments ──────────────────────────────────────────────────────────────────
export const CreatePaymentSchema = z.object({
  reservationId: uuid,
  amount:        z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  provider:      z.string().min(1, { message: 'El proveedor de pago es requerido (ej: VISA, MASTERCARD)' }),
  transactionId: z.string().min(1, { message: 'transactionId es requerido' }),
  status:        z.string().optional(),
});

export const UpdatePaymentSchema = z.object({
  provider:      z.string().min(1).optional(),
  transactionId: z.string().min(1).optional(),
  status:        z.enum(['PENDING','COMPLETED','FAILED','REFUNDED']).optional(),
});

// ── Invoices ──────────────────────────────────────────────────────────────────
export const CreateInvoiceSchema = z.object({
  paymentId:        uuid,
  billingProfileId: uuid,
  invoiceNumber:    z.string().min(1, { message: 'invoiceNumber es requerido' }),
  subtotal:         z.number().nonnegative({ message: 'subtotal no puede ser negativo' }),
  taxAmount:        z.number().nonnegative({ message: 'taxAmount no puede ser negativo' }),
  total:            z.number().nonnegative({ message: 'total no puede ser negativo' }),
});

// ── Invoice Items ─────────────────────────────────────────────────────────────
export const CreateInvoiceItemSchema = z.object({
  invoiceId:   uuid,
  description: z.string().min(1, { message: 'Descripción es requerida' }),
  quantity:    z.number().int().positive({ message: 'quantity debe ser >= 1' }),
  unitPrice:   z.number().nonnegative({ message: 'unitPrice no puede ser negativo' }),
  totalPrice:  z.number().nonnegative({ message: 'totalPrice no puede ser negativo' }),
});

export const UpdateInvoiceItemSchema = z.object({
  invoiceId:   uuid.optional(),
  description: z.string().min(1).optional(),
  quantity:    z.number().int().positive().optional(),
  unitPrice:   z.number().nonnegative().optional(),
  totalPrice:  z.number().nonnegative().optional(),
});

// ── Boarding Passes ───────────────────────────────────────────────────────────
export const CreateBoardingPassSchema = z.object({
  passengerId:   uuid,
  segmentId:     uuid,
  boardingCode:  z.string().min(1, { message: 'boardingCode es requerido' }),
  gate:          z.string().optional().nullable(),
  boardingGroup: z.string().optional().nullable(),
  checkInAt:     z.string().datetime({ message: 'checkInAt debe ser fecha ISO' }).optional().nullable(),
  status:        z.enum(['NOT_CHECKED_IN','CHECKED_IN','BOARDED','NO_SHOW']).optional(),
});

export const UpdateBoardingPassSchema = z.object({
  gate:          z.string().optional().nullable(),
  boardingGroup: z.string().optional().nullable(),
  checkInAt:     z.string().datetime().optional().nullable(),
  status:        z.enum(['NOT_CHECKED_IN','CHECKED_IN','BOARDED','NO_SHOW']).optional(),
});

// ── Passenger Services ────────────────────────────────────────────────────────
export const CreatePassengerServiceSchema = z.object({
  passengerId:        uuid,
  serviceConfigId:    uuid,
  quantity:           z.number().int().positive({ message: 'quantity debe ser >= 1' }),
  unitPriceAtBooking: z.number().nonnegative({ message: 'unitPriceAtBooking no puede ser negativo' }),
});

export const UpdatePassengerServiceSchema = z.object({
  quantity:           z.number().int().positive().optional(),
  unitPriceAtBooking: z.number().nonnegative().optional(),
});

// ── Promotions ────────────────────────────────────────────────────────────────
export const CreatePromotionSchema = z.object({
  code:          z.string().min(1, { message: 'Código de promoción es requerido' }),
  discountType:  z.enum(['PERCENTAGE','FIXED_AMOUNT'], {
    errorMap: () => ({ message: "discountType debe ser PERCENTAGE o FIXED_AMOUNT" }),
  }),
  discountValue: z.number().positive({ message: 'discountValue debe ser mayor a 0' }),
  isActive:      z.boolean().optional(),
  maxUsages:     z.number().int().positive().optional().nullable(),
});

export const UpdatePromotionSchema = z.object({
  code:          z.string().min(1).optional(),
  discountType:  z.enum(['PERCENTAGE','FIXED_AMOUNT']).optional(),
  discountValue: z.number().positive().optional(),
  isActive:      z.boolean().optional(),
  maxUsages:     z.number().int().positive().optional().nullable(),
});

export const ValidatePromotionSchema = z.object({
  code:   z.string().min(1, { message: 'Código es requerido' }),
  amount: z.number().positive({ message: 'Monto debe ser mayor a 0' }),
});

// ── Service Catalog ───────────────────────────────────────────────────────────
export const CreateServiceCatalogSchema = z.object({
  name:        z.string().min(1, { message: 'Nombre es requerido' }),
  code:        z.string().min(1, { message: 'Código es requerido' }),
  category:    z.enum(['BAGGAGE','MEAL','SEAT','ENTERTAINMENT','LOUNGE','INSURANCE','TRANSPORT','OTRO'], {
    errorMap: () => ({ message: "category inválida" }),
  }),
  description: z.string().optional().nullable(),
});

// ── Airline Airports ──────────────────────────────────────────────────────────
export const CreateAirlineAirportSchema = z.object({
  airlineId: uuid,
  airportId: uuid,
});

// ── Airline Service Config ────────────────────────────────────────────────────
export const CreateAirlineServiceConfigSchema = z.object({
  serviceId:       uuid,
  airlineId:       uuid,
  price:           z.number().nonnegative({ message: 'price no puede ser negativo' }),
  originAirportId: uuid.optional().nullable(),
  destAirportId:   uuid.optional().nullable(),
  currency:        z.string().optional(),
});

export const UpdateAirlineServiceConfigSchema = z.object({
  serviceId:       uuid.optional(),
  airlineId:       uuid.optional(),
  price:           z.number().nonnegative().optional(),
  originAirportId: uuid.optional().nullable(),
  destAirportId:   uuid.optional().nullable(),
  currency:        z.string().optional(),
});

// ── Billing Profiles ──────────────────────────────────────────────────────────
export const CreateBillingProfileSchema = z.object({
  taxId:        z.string().min(1, { message: 'RUC/Cédula es requerido' }),
  businessName: z.string().min(1, { message: 'Razón social es requerida' }),
  address:      z.string().min(1, { message: 'Dirección es requerida' }),
  cityId:       uuid,
  email:        z.string().email({ message: 'Email inválido' }).optional().nullable(),
  isDefault:    z.boolean().optional(),
});

export const UpdateBillingProfileSchema = z.object({
  taxId:        z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  address:      z.string().min(1).optional(),
  cityId:       uuid.optional(),
  email:        z.string().email().optional().nullable(),
  isDefault:    z.boolean().optional(),
});
