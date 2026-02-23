// nextjs/instrumentation.node.ts
// OpenTelemetry setup for Next.js server runtime
// Automatically loaded via experimental.instrumentationHook: true in next.config.js

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

// Optional Pino integration (only loaded if Pino is installed)
let PinoInstrumentation: any = null;
try {
  PinoInstrumentation = require('@opentelemetry/instrumentation-pino').PinoInstrumentation;
  console.log('[OTEL] Pino instrumentation loaded (structured logs + trace correlation enabled)');
} catch (e) {
  console.log('[OTEL] Pino not found — skipping Pino instrumentation. Logs will be captured via container stdout/Promtail.');
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const instrumentations = [getNodeAutoInstrumentations()];

      // Only add Pino if it's available
      if (PinoInstrumentation) {
        instrumentations.push(new PinoInstrumentation());
      }

      const sdk = new NodeSDK({
        serviceName: process.env.OTEL_SERVICE_NAME || 'nextjs-frontend',

        traceExporter: new OTLPTraceExporter({
          url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'grpc://otel-collector:4317',
        }),

        metricReader: new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'grpc://otel-collector:4317',
          }),
          exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL) || 5000,
        }),

        logRecordProcessor: new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'grpc://otel-collector:4317',
          })
        ),

        instrumentations,
      });

      sdk.start();

      console.log('[OTEL] OpenTelemetry SDK started successfully');
    } catch (error) {
      console.error('[OTEL] Failed to start OpenTelemetry SDK:', error);
    }
  }
}