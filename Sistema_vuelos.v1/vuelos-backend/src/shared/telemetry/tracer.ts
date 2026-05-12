import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// OTEL_SERVICE_NAME y OTEL_EXPORTER_OTLP_ENDPOINT son leídos automáticamente por el SDK
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs':  { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
});

sdk.start();
console.log(`[otel] tracer started → service=${process.env.OTEL_SERVICE_NAME ?? 'vuelos-backend'} endpoint=${otlpEndpoint}`);

process.on('SIGTERM', async () => { await sdk.shutdown(); });
process.on('SIGINT',  async () => { await sdk.shutdown(); });
