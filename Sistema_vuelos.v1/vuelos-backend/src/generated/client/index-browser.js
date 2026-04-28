
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CountryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isoCode: 'isoCode',
  phoneCode: 'phoneCode',
  currencyCode: 'currencyCode'
};

exports.Prisma.CityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  countryId: 'countryId',
  iataCode: 'iataCode'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  secondName: 'secondName',
  firstLastName: 'firstLastName',
  secondLastName: 'secondLastName',
  mainAddress: 'mainAddress',
  secondaryAddress: 'secondaryAddress',
  cityId: 'cityId',
  phone: 'phone',
  birthDate: 'birthDate',
  role: 'role',
  isActive: 'isActive',
  tokenVersion: 'tokenVersion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BillingProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  taxId: 'taxId',
  businessName: 'businessName',
  email: 'email',
  address: 'address',
  cityId: 'cityId',
  isDefault: 'isDefault'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  billingProfileId: 'billingProfileId',
  invoiceNumber: 'invoiceNumber',
  subtotal: 'subtotal',
  taxAmount: 'taxAmount',
  total: 'total',
  createdAt: 'createdAt'
};

exports.Prisma.InvoiceItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  description: 'description',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice'
};

exports.Prisma.AirportScalarFieldEnum = {
  id: 'id',
  iataCode: 'iataCode',
  name: 'name',
  cityId: 'cityId',
  timezone: 'timezone'
};

exports.Prisma.AirlineScalarFieldEnum = {
  id: 'id',
  iataCode: 'iataCode',
  name: 'name',
  logoUrl: 'logoUrl',
  countryId: 'countryId'
};

exports.Prisma.AircraftScalarFieldEnum = {
  id: 'id',
  airlineId: 'airlineId',
  modelName: 'modelName',
  registration: 'registration',
  hasWifi: 'hasWifi',
  hasUsb: 'hasUsb'
};

exports.Prisma.AirlineAirportScalarFieldEnum = {
  airlineId: 'airlineId',
  airportId: 'airportId'
};

exports.Prisma.FlightScalarFieldEnum = {
  id: 'id',
  originAirportIata: 'originAirportIata',
  destinationAirportIata: 'destinationAirportIata',
  departureDate: 'departureDate',
  status: 'status'
};

exports.Prisma.SegmentScalarFieldEnum = {
  id: 'id',
  segmentNumber: 'segmentNumber',
  originAirportId: 'originAirportId',
  destinationAirportId: 'destinationAirportId',
  departureDateTime: 'departureDateTime',
  arrivalDateTime: 'arrivalDateTime',
  airlineId: 'airlineId',
  aircraftId: 'aircraftId',
  estimatedDuration: 'estimatedDuration',
  flightId: 'flightId'
};

exports.Prisma.ServiceCatalogScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  category: 'category',
  description: 'description'
};

exports.Prisma.AirlineServiceConfigScalarFieldEnum = {
  id: 'id',
  serviceId: 'serviceId',
  airlineId: 'airlineId',
  originAirportId: 'originAirportId',
  destAirportId: 'destAirportId',
  price: 'price',
  currency: 'currency'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  flightId: 'flightId',
  promotionId: 'promotionId',
  reservationCode: 'reservationCode',
  totalAmount: 'totalAmount',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.FlightClassScalarFieldEnum = {
  id: 'id',
  flightId: 'flightId',
  cabinClass: 'cabinClass',
  availableSeats: 'availableSeats',
  basePrice: 'basePrice'
};

exports.Prisma.ReservationPassengerScalarFieldEnum = {
  id: 'id',
  reservationId: 'reservationId',
  flightClassId: 'flightClassId',
  firstName: 'firstName',
  lastName: 'lastName',
  documentNumber: 'documentNumber',
  seatNumber: 'seatNumber'
};

exports.Prisma.PassengerServiceScalarFieldEnum = {
  id: 'id',
  passengerId: 'passengerId',
  serviceConfigId: 'serviceConfigId',
  quantity: 'quantity',
  unitPriceAtBooking: 'unitPriceAtBooking'
};

exports.Prisma.PromotionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  discountType: 'discountType',
  discountValue: 'discountValue',
  maxUsages: 'maxUsages',
  currentUsages: 'currentUsages',
  isActive: 'isActive'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  reservationId: 'reservationId',
  amount: 'amount',
  provider: 'provider',
  transactionId: 'transactionId',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.BoardingPassScalarFieldEnum = {
  id: 'id',
  passengerId: 'passengerId',
  segmentId: 'segmentId',
  boardingCode: 'boardingCode',
  gate: 'gate',
  boardingGroup: 'boardingGroup',
  checkInAt: 'checkInAt',
  status: 'status'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  oldData: 'oldData',
  newData: 'newData',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
};

exports.FlightStatus = exports.$Enums.FlightStatus = {
  SCHEDULED: 'SCHEDULED',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

exports.ReservationStatus = exports.$Enums.ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

exports.CabinClass = exports.$Enums.CabinClass = {
  ECONOMY: 'ECONOMY',
  PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
  BUSINESS: 'BUSINESS',
  FIRST: 'FIRST'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

exports.CheckInStatus = exports.$Enums.CheckInStatus = {
  NOT_CHECKED_IN: 'NOT_CHECKED_IN',
  CHECKED_IN: 'CHECKED_IN',
  BOARDED: 'BOARDED',
  NO_SHOW: 'NO_SHOW'
};

exports.Prisma.ModelName = {
  Country: 'Country',
  City: 'City',
  User: 'User',
  BillingProfile: 'BillingProfile',
  Invoice: 'Invoice',
  InvoiceItem: 'InvoiceItem',
  Airport: 'Airport',
  Airline: 'Airline',
  Aircraft: 'Aircraft',
  AirlineAirport: 'AirlineAirport',
  Flight: 'Flight',
  Segment: 'Segment',
  ServiceCatalog: 'ServiceCatalog',
  AirlineServiceConfig: 'AirlineServiceConfig',
  Reservation: 'Reservation',
  FlightClass: 'FlightClass',
  ReservationPassenger: 'ReservationPassenger',
  PassengerService: 'PassengerService',
  Promotion: 'Promotion',
  Payment: 'Payment',
  BoardingPass: 'BoardingPass',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
