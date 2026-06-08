# Documento tecnico Reto 3 - Sistema de vuelos

## 1. Objetivo

El Reto 3 consolida la solucion final de integracion: microservicios, API Gateway,
Event Bus, aplicacion movil, seguridad, observabilidad, resiliencia y pruebas. La
arquitectura deja de depender solo del backend monolitico y expone una solucion
hibrida orientada a dominios.

## 2. Arquitectura final

```mermaid
flowchart LR
  Mobile[Flutter marketplace movil] --> Gateway[API Gateway REST + GraphQL]
  Web[Admin Angular] --> Gateway

  Gateway --> Auth[auth-service]
  Gateway --> Catalog[catalog-service]
  Gateway --> Flights[flights-service REST + gRPC]
  Gateway --> Booking[booking-service]
  Gateway --> Payments[payments-service]
  Gateway --> Admin[admin-service]

  Booking --> Rabbit[(RabbitMQ Event Bus)]
  Payments --> Rabbit
  Admin --> Rabbit

  Auth --> DBAuth[(identity schema)]
  Catalog --> DBCatalog[(catalog schema)]
  Flights --> DBFlights[(catalog/booking read schema)]
  Booking --> DBBooking[(booking/checkin schema)]
  Payments --> DBPayments[(payments schema)]
  Admin --> DBAudit[(audit schema)]

  Gateway --> Jaeger[Jaeger / tracing]
```

Componentes principales:

- `api-gateway`: entrada REST y agregador GraphQL. Propaga JWT y `x-correlation-id`.
- `auth-service`: autenticacion, registro, perfil y verificacion interna de tokens.
- `catalog-service`: paises, ciudades, aeropuertos, aerolineas, aeronaves y servicios.
- `flights-service`: busqueda de vuelos y API gRPC para consultas internas.
- `booking-service`: reservas, pasajeros, asientos y pases de abordar.
- `payments-service`: pagos, facturacion y servicios adicionales.
- `admin-service`: panel administrativo como orquestador de dominios.
- `rabbitmq`: Event Bus con exchange principal, retry y DLQ.
- `vuelos-mobile`: app Flutter para busqueda, reserva, detalle y pago.

## 3. API Gateway e interoperabilidad

El gateway mantiene los contratos REST bajo `/api/v1/*` y agrega GraphQL en
`/graphql` para consultas compuestas. Esto permite demostrar interoperabilidad
entre estilos:

- REST publico para frontend web, movil y pruebas.
- GraphQL aggregator para reducir llamadas del cliente.
- gRPC en `flights-service` para integraciones internas de baja latencia.
- Eventos asincronos por RabbitMQ para desacoplar booking, payments y auditoria.

Correcciones realizadas para Reto 3:

- `myReservations` usa `/api/v1/reservations/my`.
- `assignSeat` resuelve el pasajero y usa la ruta real de asignacion de asiento.
- Los pagos de una reserva usan `/api/v1/payments/by-reservation/:reservationId`.
- Los boarding passes se agregan por pasajero con `/api/v1/boarding-passes/by-passenger/:passengerId`.
- `ServiceClient` tiene timeout y propaga `x-correlation-id`.

## 4. Event Bus RabbitMQ

RabbitMQ reemplaza el bus in-process como mecanismo principal de eventos. El bus
mantiene fallback local si RabbitMQ no esta disponible, para que el sistema siga
operando en desarrollo.

Eventos publicados:

- `reservation.created`
- `reservation.cancelled`
- `seat.assigned`
- `checkin.completed`
- `payment.registered`
- `invoice.issued`
- `ancillary.added`

Topologia:

- Exchange principal: `vuelos.events`
- Exchange de retry: `vuelos.events.retry`
- Exchange DLQ: `vuelos.events.dlq`
- Cola por servicio: `${SERVICE_NAME}.events`
- Cola retry por servicio: `${SERVICE_NAME}.events.retry`
- Cola DLQ por servicio: `${SERVICE_NAME}.events.dlq`

Resiliencia del Event Bus:

- Mensajes persistentes.
- Retry con TTL configurable.
- DLQ cuando se supera `RABBITMQ_MAX_RETRIES`.
- Idempotencia en memoria por `eventId`.
- Fallback in-process si RabbitMQ no responde.

Variables relevantes:

```env
EVENT_BUS_DRIVER=rabbitmq
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_EXCHANGE=vuelos.events
RABBITMQ_RETRY_EXCHANGE=vuelos.events.retry
RABBITMQ_DLQ_EXCHANGE=vuelos.events.dlq
RABBITMQ_RETRY_DELAY_MS=5000
RABBITMQ_MAX_RETRIES=3
EVENT_BUS_IDEMPOTENCY_WINDOW=1000
```

## 5. Aplicacion movil Flutter

La app `vuelos-mobile` cumple el entregable de frontend movil marketplace.

Funciones implementadas:

- Busqueda de vuelos por origen, destino, fecha, pasajeros y clase.
- Reserva de vuelo con datos de pasajero.
- Registro de usuario.
- Inicio y cierre de sesion.
- Listado de reservas del usuario.
- Detalle de reserva con pasajeros y pagos.
- Pago de reserva por `VISA`, `MASTERCARD`, `PAYPAL` o `TRANSFER`.
- Configuracion de API por `--dart-define=API_BASE_URL=...`.

APK generado:

```text
vuelos-mobile/build/app/outputs/flutter-apk/app-release.apk
```

Comandos verificados:

```bash
flutter analyze
flutter test
flutter build apk
```

## 6. Seguridad

Controles implementados:

- JWT obligatorio en rutas de usuario.
- Roles `CUSTOMER`, `ADMIN` y `SERVICE`.
- Middleware `requireAdmin` para administracion.
- Middleware de ownership para reservas, pasajeros, pagos, facturas y perfiles.
- `INTERNAL_API_KEY` para endpoints internos.
- Helmet y CORS en gateway.
- Rate limiting global, login/register y busqueda.
- Propagacion de `x-correlation-id` para trazabilidad.

## 7. Integracion de datos

La base se separa por dominios logicos:

- `identity`: usuarios.
- `catalog`: catalogos y vuelos.
- `booking`: reservas y pasajeros.
- `checkin`: pases de abordar.
- `payments`: pagos, facturas y perfiles de facturacion.
- `audit`: logs de auditoria.

El `admin-service` actua como orquestador administrativo y usa clientes Prisma por
dominio. Esto evita que un microservicio use modelos que no existen en su schema.

### ETL/ELT operativo

Para cubrir la semana 14, se agrego un pipeline ETL ejecutable:

```bash
cd vuelos-backend
npm run etl:reto3
```

El script `src/scripts/reto3-etl-report.ts` realiza:

- Extract: lee metricas de `identity`, `catalog`, `flights`, `booking`, `payments` y `audit`.
- Transform: calcula conteos por dominio, estados, conversion de reservas pagadas,
  ingreso promedio por pasajero y reglas basicas de calidad de datos.
- Load: materializa el reporte en `docs/evidence/reto3-operational-report.json`.

Este reporte funciona como read model operacional para defensa y auditoria.

## 8. Observabilidad y trazabilidad

Evidencias disponibles:

- Health check del gateway con estado de microservicios.
- Logs estructurados de eventos con `eventId`, `eventType`, `producer` y `cid`.
- Jaeger configurado en `docker-compose.yml`.
- `x-correlation-id` desde gateway hasta microservicios y Event Bus.
- Estado de circuit breakers expuesto por el gateway.

## 9. Pruebas y verificacion

Verificado localmente:

```bash
cd vuelos-backend
npm run build
npm test

cd ../api-gateway
npm run build
npm test

cd ../vuelos-mobile
flutter analyze
flutter test
flutter build apk
```

Validacion de configuracion:

```bash
cd vuelos-backend
npm run validate:reto3-env
```

El comando lista variables faltantes para una demo/despliegue completo: secretos
JWT, API key interna, URLs de base por dominio, RabbitMQ externo y frontend.

Pendiente fuera del alcance de esta revision sin ejecucion de contenedores:

- Falta ejecutar `docker compose up` para validar RabbitMQ, Jaeger y los servicios
  en red real.

## 10. Despliegue publico v2

Se agrego un blueprint raiz `render.yaml` para publicar la version 2 como
servicios Node independientes:

- `vuelos-api-gateway-v2`
- `vuelos-auth-service-v2`
- `vuelos-catalog-service-v2`
- `vuelos-flights-service-v2`
- `vuelos-booking-service-v2`
- `vuelos-payments-service-v2`
- `vuelos-admin-service-v2`

RabbitMQ debe configurarse como broker externo administrado, por ejemplo CloudAMQP,
inyectando `RABBITMQ_URL`. Jaeger/OTLP puede configurarse con un collector externo
mediante `OTEL_EXPORTER_OTLP_ENDPOINT`.

## 11. Checklist de defensa

- Mostrar `docker-compose.yml` con gateway, microservicios, RabbitMQ y Jaeger.
- Abrir RabbitMQ Management en `http://localhost:15672`.
- Ejecutar busqueda desde Flutter.
- Registrar usuario o iniciar sesion.
- Crear reserva desde Flutter.
- Pagar reserva desde Flutter.
- Ver evento `reservation.created` y `payment.registered` en logs/RabbitMQ.
- Mostrar health del gateway y estado de circuit breakers.
- Mostrar trazabilidad por `x-correlation-id`.
- Explicar retry, DLQ e idempotencia del Event Bus.
- Explicar separacion de schemas y clientes Prisma por dominio.
- Mostrar `render.yaml` raiz como evidencia de despliegue publico v2.
- Ejecutar `npm run etl:reto3` y mostrar el reporte operacional generado.

## 12. Riesgos restantes

- La validacion end-to-end depende de tener Docker disponible.
- El despliegue publico requiere llenar variables secretas en Render o plataforma equivalente.
- La idempotencia actual del Event Bus es en memoria; para produccion se recomienda
  persistir `eventId` procesados por consumidor.
- Los retries de RabbitMQ usan TTL por cola; para politicas mas avanzadas conviene
  configurar colas por intervalo o un plugin de delayed messages.
