# Environment Variables Reference

This document lists all the environment variables you can set to customize observability behavior.  
Most defaults are already set in `docker-compose-observability.yml` (in the `environment:` block of each service), so you only need to add/override them when you want to change something.

**Where to set these env vars:**
- In your `docker-compose.yml` file, under the appropriate service (e.g. `django`, `nextjs`, `otel-collector`, `loki`, etc.).


Where to Change These Defaults
    Do NOT edit the YAML files (otel-collector-config.yml, tempo.yaml, etc.) for simple changes — instead:

    Open your docker-compose.yml (or docker-compose-observability.yml)
    Add or override env vars under the relevant service's environment: block


# App-Level Environment Variables (Django / Next.js / Your Service)
These variables are set on your application services (e.g. django, nextjs, or any other backend/frontend service).

## OTEL_SERVICE_NAME
Default Value: (required, no default)
Where Set: django / nextjs / your service
What It Controls: Name shown for your app in Grafana (Tempo, Prometheus, Loki)
When to Change: Always set this to something meaningful (e.g. payment-api, frontend-ui)
## OTEL_EXPORTER_OTLP_ENDPOINT
Default Value: http://otel-collector:4317 (Django) / grpc://otel-collector:4317 (Next.js)
Where Set: django / nextjs / your service
What It Controls: Address of OTEL Collector where telemetry is sent
When to Change: Only if you rename the collector service or change ports
## OTEL_EXPORTER_OTLP_PROTOCOL
Default Value: grpc (Django) / grpc (Next.js)
Where Set: django / nextjs / your service
What It Controls: Protocol to use (grpc or http/protobuf)
When to Change: Usually leave as grpc (faster/more efficient)
## OTEL_TRACES_EXPORTER
Default Value: otlp
Where Set: django / nextjs / your service
What It Controls: Whether to export traces (otlp = yes, none = disable)
When to Change: Set to none to disable traces (e.g. dev or low-traffic service)
## OTEL_METRICS_EXPORTER
Default Value: otlp
Where Set: django / nextjs / your service
What It Controls: Whether to export metrics (otlp = yes, none = disable)
When to Change: Set to none to disable metrics
## OTEL_LOGS_EXPORTER
Default Value: otlp
Where Set: django / nextjs / your service
What It Controls: Whether to export logs (otlp = yes, none = disable)
When to Change: Set to none to disable app-level logs (container logs still come via Promtail)
## OTEL_METRIC_EXPORT_INTERVAL
Default Value: 60000 (60s)
Where Set: django / nextjs / your service
What It Controls: How often metrics are pushed to collector (in milliseconds)
When to Change: Lower to 5000 (5s) for faster updates in dev; higher in prod to reduce load
## OTEL_TRACES_SAMPLER
Default Value: always_on
Where Set: django / nextjs / your service
What It Controls: Trace sampling strategy (always_on, traceidratio, parentbased_traceidratio)
When to Change: Use traceidratio in production
## OTEL_TRACES_SAMPLER_ARG
Default Value: 1.0
Where Set: django / nextjs / your service
What It Controls: Sampling rate when using traceidratio (0.0–1.0)
When to Change: Set to 0.1 (10%) or 0.01 (1%) in high-traffic production
## OTEL_PYTHON_LOG_CORRELATION
Default Value: true
Where Set: django only
What It Controls: Adds trace_id/span_id to Python logs for correlation
When to Change: Leave true unless you have a specific reason
## OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
Default Value: true
Where Set: django only
What It Controls: Auto-captures Python logging module calls
When to Change: Leave true

# Observability Stack Services Environment Variables (shared/docker-compose-observability.yml)
    These variables are set on the observability services themselves (otel-collector, loki, tempo, prometheus, etc.).

# OTEL_COLLECTOR_LOG_LEVEL
Default Value: info
Service: otel-collector
What It Controls: Collector’s own log level (debug/info/warn/error)
When to Change: Set to debug for troubleshooting
# OTEL_COLLECTOR_DEBUG_VERBOSITY
Default Value: detailed
Service: otel-collector
What It Controls: Verbosity of debug exporter output (basic/normal/detailed)
When to Change: Lower to basic in production
# OTEL_BATCH_TIMEOUT
Default Value: 1s
Service: otel-collector
What It Controls: Max time to wait before sending a batch
When to Change: Lower for faster exports (higher network load)
# OTEL_BATCH_SIZE
Default Value: 8192
Service: otel-collector
What It Controls: Max number of items in one batch
When to Change: Increase for high-volume services
# OTEL_MEMORY_LIMIT_MIB
Default Value: 400
Service: otel-collector
What It Controls: Soft memory limit for collector (in MiB)
When to Change: Lower if collector OOMs on your host
# LOKI_HTTP_PORT
Default Value: 3100
Service: loki
What It Controls: Internal HTTP port for Loki
When to Change: Only if you need to change (rare)
# LOKI_RETENTION_PERIOD
Default Value: 168h (7 days)
Service: loki
What It Controls: How long logs are kept before deletion
When to Change: Increase to 720h (30 days) or more
# TEMPO_HTTP_PORT
Default Value: 3200
Service: tempo
What It Controls: Tempo query UI port
When to Change: Only if 3200 conflicts
# TEMPO_LOG_LEVEL
Default Value: info
Service: tempo
What It Controls: Tempo log level
When to Change: Set to debug for troubleshooting
# TEMPO_TRACE_IDLE_PERIOD
Default Value: 10s
Service: tempo
What It Controls: Time to wait before flushing idle traces
When to Change: Lower to 5s for faster visibility in dev
# TEMPO_MAX_BLOCK_DURATION
Default Value: 5m
Service: tempo
What It Controls: Max duration of a trace block before sealing
When to Change: Lower to 1m for quicker search
# PROMETHEUS_SCRAPE_INTERVAL
Default Value: 15s
Service: prometheus
What It Controls: How often Prometheus scrapes targets
When to Change: Lower to 5s for faster updates
# PROMETHEUS_EVAL_INTERVAL
Default Value: 15s
Service: prometheus
What It Controls: How often rules/alerts are evaluated
When to Change: Match scrape interval
# PROMETHEUS_SCRAPE_TIMEOUT
Default Value: 10s
Service: prometheus
What It Controls: Timeout for each scrape attempt
When to Change: Increase if targets are slow