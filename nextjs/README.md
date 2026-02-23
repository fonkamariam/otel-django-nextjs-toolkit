# Next.js OpenTelemetry Observability Setup

This guide adds full observability (traces, metrics, logs) to your Next.js application with **minimal effort** — no code changes required for basic auto-instrumentation.

### What You Get

- **Traces**: End-to-end request flow (incoming HTTP → server rendering → fetch to backend → external calls)
- **Metrics**: HTTP request duration/count, Node.js runtime (CPU, memory, event loop lag), process stats
- **Logs**:
  - If using Pino → structured JSON logs with trace correlation (trace_id/span_id)
  - If using console.log → raw logs captured via container stdout/Promtail (still visible in Loki)

All data is pushed to your OTEL Collector → visualized in Grafana (Tempo for traces, Prometheus for metrics, Loki for logs).

### How Telemetry Is Collected

| Type       | Who Collects It                          | How It Works                                                                 | Where It Goes                     |
|------------|------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------|
| Traces     | OTEL SDK + auto-instrumentations-node   | Auto-creates spans for HTTP server, fetch/axios calls, server components   | OTLP → Collector → Tempo         |
| Metrics    | OTEL SDK + auto-instrumentations-node   | Auto-collects HTTP stats, Node.js runtime (CPU/mem/event loop), GC, etc.   | OTLP push → Collector → Prometheus scrape |
| Logs (Pino) | Pino + instrumentation-pino (optional)  | Pino logs become OTEL LogRecords with trace context                        | OTLP → Collector → Loki          |
| Logs (Fallback) | Promtail (container-level)           | console.log → stdout/stderr → Promtail tails → Loki                        | Loki (raw, no trace correlation) |

- Pino is **optional** — if not used, console.log still works via Promtail (but without trace_id or service_name labels).
- All data is **pushed** from inside the Next.js server process to the OTEL Collector.

### Prerequisites

- Next.js 13+ (App Router or Pages Router)
- Docker Compose running your app
- OTEL Collector already running (see main toolkit repo)

### Quick Setup (3–5 minutes)

1. **Add OTEL Dependencies**
   Add these to your `package.json` → run `npm install`:
   ```json
   {
     "dependencies": {
       "@opentelemetry/api": "^1.9.0",
       "@opentelemetry/auto-instrumentations-node": "^0.50.0",
       "@opentelemetry/exporter-logs-otlp-grpc": "^0.54.0",
       "@opentelemetry/exporter-metrics-otlp-grpc": "^0.54.0",
       "@opentelemetry/exporter-trace-otlp-grpc": "^0.54.0",
       "@opentelemetry/sdk-logs": "^0.54.0",
       "@opentelemetry/sdk-metrics": "^1.26.0",
       "@opentelemetry/sdk-node": "^0.54.0",
       "@opentelemetry/sdk-trace-node": "^1.26.0"
     }
   }

2. **Enable Instrumentation Hook**
Add this to your next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;

3. Copy Instrumentation File

    Copy instrumentation.node.ts from this toolkit's nextjs/ folder to your project root (next to package.json).
    This file auto-loads on server startup and configures OTEL.

4. Add Environment Variables
    Add these to your Next.js service in docker-compose.yml:YAMLenvironment:
    - OTEL_SERVICE_NAME=nextjs-frontend
    - OTEL_EXPORTER_OTLP_ENDPOINT=grpc://otel-collector:4317
    - OTEL_METRICS_EXPORTER=otlp    # set to none - Disables metrics
    - OTEL_TRACES_EXPORTER=otlp     # set to none - Disables metrics
    - OTEL_LOGS_EXPORTER=otlp       # set to none - Disables metrics
    - OTEL_METRIC_EXPORT_INTERVAL=5000           # Push metrics every 5s
    # Optional: reduce trace volume in production
    - OTEL_TRACES_SAMPLER=traceidratio
    - OTEL_TRACES_SAMPLER_ARG=0.1               # 10% sampling

5. Restart & Test
    Restart your Next.js container
    Load pages, make API calls, check console for [OTEL] OpenTelemetry SDK started
    Open Grafana → Explore traces/metrics/logs


Logging Options

Option 1: Recommended (structured + trace-correlated logs)

    Add Pino (optional dep):JSON"dependencies": {
    "pino": "^9.0.0",
    "@opentelemetry/instrumentation-pino": "^0.36.0"
    }
    Use the logger in your code:TypeScriptimport { logger } from './instrumentation.node';

    logger.info('API call', { endpoint: '/api/users', status: 200 });
    logger.error({ error }, 'Failed to fetch data');

    → Logs in Loki have service_name, level, trace_id (clickable to Tempo).

Option 2: No changes (use console.log)

    Keep your existing console.log, console.error, etc.
    Logs are captured via container stdout/stderr → Promtail → Loki
    Query in Loki: {container_name="nextjs"} or {job="docker-containers"}
    Limitation: No service_name, no trace_id correlation, raw text only
    Traces & metrics still work 100%

**Troubleshooting

    No traces/metrics?
    Check docker compose logs nextjs for [OTEL] OpenTelemetry SDK started
    Check collector: docker compose logs otel-collector
    No logs?
    Pino → check {service_name="nextjs-frontend"} in Loki
    console.log → check {container_name="nextjs"}
    Pino not working?
    Ensure @opentelemetry/instrumentation-pino is installed and Pino is used