-- A cancelled reservation must not continue blocking a seat.
UPDATE "booking"."reservation_passengers" rp
SET "seat_number" = NULL
FROM "booking"."reservations" r
WHERE rp."reservation_id" = r."id"
  AND r."status" = 'CANCELLED'
  AND rp."seat_number" IS NOT NULL;

-- PostgreSQL unique indexes allow multiple NULL values, so passengers without
-- an assigned seat can coexist while assigned seats are protected per class.
CREATE UNIQUE INDEX IF NOT EXISTS "reservation_passengers_flight_class_seat_unique"
ON "booking"."reservation_passengers" ("flight_class_id", "seat_number");
