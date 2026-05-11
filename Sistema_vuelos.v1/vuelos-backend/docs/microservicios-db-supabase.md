# Separacion logica de base de datos en Supabase

## Objetivo

Para la migracion a microservicios se usa una sola instancia PostgreSQL en Supabase, separada por schemas de dominio. Esto reduce costo y complejidad, pero deja evidencia clara de propiedad de datos por servicio.

## Mapa de schemas

| Schema | Servicio/dominio | Tablas principales |
| --- | --- | --- |
| `identity` | Usuarios y seguridad | `users` |
| `catalog` | Catalogo de vuelos | `countries`, `cities`, `airports`, `airlines`, `aircrafts`, `flights`, `segments`, `flight_classes`, `service_catalog`, `airline_service_configs` |
| `booking` | Reservas y pasajeros | `reservations`, `reservation_passengers`, `passenger_services`, `promotions` |
| `payments` | Pagos y facturacion | `billing_profiles`, `payments`, `invoices`, `invoice_items` |
| `checkin` | Check-in | `boarding_passes` |
| `audit` | Auditoria | `audit_logs` |
| `public` | Tipos compartidos | Enums Prisma/PostgreSQL |

## Cambios en Prisma

El archivo `prisma/schema.prisma` usa `multiSchema` y declara:

```prisma
schemas = ["public", "identity", "catalog", "booking", "payments", "checkin", "audit"]
```

Cada modelo tiene `@@schema(...)` para indicar su dominio. Los enums quedan en `public` para evitar reescrituras de datos.

## Migracion SQL

La migracion esta en:

```text
prisma/migrations/202605112_split_domain_schemas/migration.sql
```

Como Supabase puede fallar con Prisma Migrate cuando se usa el pooler, se recomienda ejecutar esa migracion desde Supabase SQL Editor si `npx prisma migrate status` devuelve `Schema engine error`.

## Verificacion en Supabase

Despues de ejecutar la migracion, correr:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema in ('identity', 'catalog', 'booking', 'payments', 'checkin', 'audit')
order by table_schema, table_name;
```

Tambien verificar que el rol de servicio exista:

```sql
select enumlabel
from pg_enum
where enumtypid = 'public."UserRole"'::regtype
order by enumlabel;
```

## Evidencia sugerida

Capturar:

- Screenshot de los schemas en Supabase.
- Screenshot del resultado de la consulta de tablas por schema.
- Screenshot del enum `UserRole` mostrando `SERVICE`.
- Screenshot del backend compilando con `npm.cmd run build`.
- Screenshot de Swagger/REST y de los contratos gRPC (`src/grpc/proto`).
