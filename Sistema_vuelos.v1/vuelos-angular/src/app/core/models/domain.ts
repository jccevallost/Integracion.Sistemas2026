// core/models/domain.ts — espejo del schema Prisma del backend

export type UserRole          = 'CUSTOMER' | 'ADMIN';
export type FlightStatus      = 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
export type CabinClass        = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type ClassType         = CabinClass;
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type DiscountType      = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type CheckInStatus     = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'BOARDED' | 'NO_SHOW';

export interface Country {
  id: string; name: string; isoCode: string;
  phoneCode?: string | null; currencyCode?: string | null;
}
export interface City {
  id: string; name: string; countryId: string;
  iataCode?: string | null; country?: Country;
}
export interface Airport {
  id: string; iataCode: string; name: string;
  cityId: string; timezone: string;
  city?: City & { country?: Country };
}
export interface User {
  id: string; email: string; firstName: string; secondName?: string | null;
  firstLastName: string; secondLastName?: string | null; mainAddress: string;
  secondaryAddress?: string | null; cityId: string; phone?: string | null;
  birthDate?: string | null; role: UserRole; isActive: boolean; createdAt: string;
  city?: City & { country?: Country };
}
export interface Airline {
  id: string; iataCode: string; name: string;
  logoUrl?: string | null; countryId: string; country?: Country;
}
export interface Aircraft {
  id: string; airlineId: string; modelName: string;
  registration: string; hasWifi: boolean; hasUsb: boolean; airline?: Airline;
}
export interface FlightClass {
  id: string; flightId: string; cabinClass: CabinClass;
  classType: CabinClass; availableSeats: number; basePrice: number;
}
export interface Segment {
  id: string; segmentNumber: string; originAirportId: string;
  destinationAirportId: string; departureDateTime: string; arrivalDateTime: string;
  airlineId: string; aircraftId?: string | null; estimatedDuration: number;
  flightId?: string | null; originAirport?: Airport; destinationAirport?: Airport;
  airline?: Airline; aircraft?: Aircraft | null;
}
export interface Flight {
  id: string; originAirportIata: string; destinationAirportIata: string;
  departureDate: string; status: FlightStatus; duration?: number; stops?: number;
  lowestPrice?: number; flightNumber?: string; departureDateTime?: string | null;
  arrivalDateTime?: string | null; airline?: Airline | null; aircraft?: string | null;
  route?: {
    estimatedDuration: number;
    originAirport: { id?: string | null; iataCode: string; name: string; city: string; country: string; timezone: string };
    destinationAirport: { id?: string | null; iataCode: string; name: string; city: string; country: string; timezone: string };
  };
  segments?: Segment[]; flightClasses?: FlightClass[];
}
export interface Passenger {
  id?: string; firstName: string; lastName: string;
  documentNumber: string; seatNumber?: string | null;
}
export interface Promotion {
  id: string; code: string; discountType: DiscountType;
  discountValue: number; maxUsages?: number | null;
  currentUsages: number; isActive: boolean;
}
export interface Reservation {
  id: string; reservationCode: string; status: ReservationStatus;
  totalAmount: number; createdAt: string; userId: string; flightId: string;
  promotionId?: string | null; flight?: Flight; passengers?: Passenger[];
  promotion?: Promotion | null;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'firstLastName'>;
}
export interface Payment {
  id: string; reservationId: string; amount: number;
  provider: string; transactionId: string; status: string;
  createdAt: string; reservation?: Reservation;
}
export interface BillingProfile {
  id: string; userId: string; taxId: string; businessName: string;
  email?: string | null; address: string; cityId: string; isDefault: boolean; city?: City;
}
export interface ServiceCatalog {
  id: string; name: string; code: string; category: string; description?: string | null;
}
export interface BoardingPass {
  id: string; passengerId: string; segmentId: string; boardingCode: string;
  checkInStatus: CheckInStatus; boardingGroup?: string | null;
  gate?: string | null; checkInAt?: string | null; createdAt: string;
}
export interface Invoice {
  id: string; invoiceNumber: string; paymentId: string; billingProfileId: string;
  subtotal: number; taxAmount: number; total: number; createdAt: string;
  billingProfile?: BillingProfile; payment?: Payment;
}
export interface PassengerService {
  id: string; passengerId: string; serviceConfigId: string;
  quantity: number; unitPriceAtBooking: number; totalPrice: number;
  serviceConfig?: {
    id: string; serviceCatalogId: string; airlineId: string; price: number;
    isAvailable: boolean; service?: ServiceCatalog;
  };
}

export interface ApiSuccess<T> {
  success: true; data: T;
  meta?: { total?: number; page?: number; passengers?: number };
}
export interface ApiError {
  success: false; error: { code: string; message: string };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface FlightSearchParams {
  origin: string; destination: string; date: string;
  passengers: number; class?: ClassType;
}
export interface AuthUser {
  id: string; email: string; firstName: string;
  firstLastName: string; role: UserRole; phone?: string | null;
}
export interface AuthResponse { user: AuthUser; token: string; }
export interface LoginCredentials { email: string; password: string; }
export interface RegisterData {
  email: string; password: string; firstName: string; firstLastName: string;
  secondName?: string; secondLastName?: string; mainAddress?: string;
  cityId?: string; phone?: string; birthDate?: string;
}
export interface PromotionValidation {
  valid: boolean; code: string; discountType: DiscountType;
  discountValue: number; discountAmount: number; finalAmount: number;
}
export interface AirlineServiceConfig {
  id: string; serviceId: string; airlineId: string;
  originAirportId?: string | null; destAirportId?: string | null;
  price: number; currency: string;
  service?: { id: string; name: string; code: string; category: string };
  airline?: { id: string; name: string; iataCode: string };
}
