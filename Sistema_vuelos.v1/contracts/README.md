# Vuelos Contracts

Contratos publicos de la version 2 del sistema de vuelos.

## REST

- `rest/booking-api-v2.openapi.yaml`: contrato OpenAPI 3.0 para consumidores web,
  mobile y Booking externo.

## GraphQL

- `graphql/schema-v2.graphql`: contrato del agregador expuesto por el API Gateway
  en `/graphql`.

## Events

- `events/domain-events-v2.schema.json`: sobre comun de eventos de dominio
  publicados en RabbitMQ.

## Proto

Los contratos gRPC fuente se mantienen en
`vuelos-backend/src/grpc/proto/*.proto` porque son consumidos por el build del
backend. Para la defensa, esa carpeta es la fuente de verdad de los contratos
internos servicio-a-servicio.
