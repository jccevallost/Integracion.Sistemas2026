CREATE SCHEMA IF NOT EXISTS "identity";
CREATE SCHEMA IF NOT EXISTS "catalog";
CREATE SCHEMA IF NOT EXISTS "booking";
CREATE SCHEMA IF NOT EXISTS "payments";
CREATE SCHEMA IF NOT EXISTS "checkin";
CREATE SCHEMA IF NOT EXISTS "audit";

-- Enums stay in public so existing enum columns keep their type without data rewrites.
ALTER TYPE public."UserRole" ADD VALUE IF NOT EXISTS 'SERVICE';

-- Identity
ALTER TABLE IF EXISTS public.users SET SCHEMA "identity";

-- Flight catalog
ALTER TABLE IF EXISTS public.countries SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.cities SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.airports SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.airlines SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.aircrafts SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.airline_airports SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.flights SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.segments SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.flight_classes SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.service_catalog SET SCHEMA "catalog";
ALTER TABLE IF EXISTS public.airline_service_configs SET SCHEMA "catalog";

-- Booking and customer journey
ALTER TABLE IF EXISTS public.reservations SET SCHEMA "booking";
ALTER TABLE IF EXISTS public.reservation_passengers SET SCHEMA "booking";
ALTER TABLE IF EXISTS public.passenger_services SET SCHEMA "booking";
ALTER TABLE IF EXISTS public.promotions SET SCHEMA "booking";

-- Payments and billing
ALTER TABLE IF EXISTS public.billing_profiles SET SCHEMA "payments";
ALTER TABLE IF EXISTS public.payments SET SCHEMA "payments";
ALTER TABLE IF EXISTS public.invoices SET SCHEMA "payments";
ALTER TABLE IF EXISTS public.invoice_items SET SCHEMA "payments";

-- Check-in
ALTER TABLE IF EXISTS public.boarding_passes SET SCHEMA "checkin";

-- Audit
ALTER TABLE IF EXISTS public.audit_logs SET SCHEMA "audit";
