# Environment Variables Reference

This document lists all the environment variables you can set to customize observability behavior.  
Most defaults are already set in `docker-compose-observability.yml` (in the `environment:` block of each service), so you only need to add/override them when you want to change something.

**Where to set these env vars:**
- In your `docker-compose.yml` file, under the appropriate service (e.g. `django`, `nextjs`, `otel-collector`, `loki`, etc.).


Where to Change These Defaults
    Do NOT edit the YAML files (otel-collector-config.yml, tempo.yaml, etc.) for simple changes — instead:

    Open your docker-compose.yml (or docker-compose-observability.yml)
    Add or override env vars under the relevant service's environment: block

# App-Level (Django / Next.js / Your Service)
Variable,Default Value,Where Set (service),What It Controls,When to Change
OTEL_SERVICE_NAME,"(required, no default)",django / nextjs,"Name shown for your app in Grafana (Tempo, Prometheus, Loki)","Always set this to something meaningful (e.g. payment-api, frontend-ui)"
OTEL_EXPORTER_OTLP_ENDPOINT,"http://otel-collector:4317 (Django)
grpc://otel-collector:4317 (Next.js)",django / nextjs,Address of OTEL Collector where telemetry is sent,Only if you rename the collector service or change ports
OTEL_EXPORTER_OTLP_PROTOCOL,"grpc (Django)
grpc (Next.js)",django / nextjs,Protocol to use (grpc or http/protobuf),Usually leave as grpc (faster/more efficient)
OTEL_TRACES_EXPORTER,otlp,django / nextjs,"Whether to export traces (otlp = yes, none = disable)",Set to none to disable traces (e.g. dev or low-traffic service)
OTEL_METRICS_EXPORTER,otlp,django / nextjs,"Whether to export metrics (otlp = yes, none = disable)",Set to none to disable metrics
OTEL_LOGS_EXPORTER,otlp,django / nextjs,"Whether to export logs (otlp = yes, none = disable)",Set to none to disable app-level logs (container logs still come via Promtail)
OTEL_METRIC_EXPORT_INTERVAL,60000 (60s),django / nextjs,How often metrics are pushed to collector (in milliseconds),Lower to 5000 (5s) for faster updates in dev; higher in prod to reduce load
OTEL_TRACES_SAMPLER,always_on,django / nextjs,"Trace sampling strategy (always_on, traceidratio, parentbased_traceidratio)",Use traceidratio in production
OTEL_TRACES_SAMPLER_ARG,1.0,django / nextjs,Sampling rate when using traceidratio (0.0–1.0),Set to 0.1 (10%) or 0.01 (1%) in high-traffic production
OTEL_PYTHON_LOG_CORRELATION,true,django only,Adds trace_id/span_id to Python logs for correlation,Leave true unless you have a specific reason
OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED,true,django only,Auto-captures Python logging module calls,Leave true

# Observability Stack Services (shared/docker-compose-observability.yml)

Variable,Default Value,Service,What It Controls,When to Change
OTEL_COLLECTOR_LOG_LEVEL,info,otel-collector,Collector’s own log level (debug/info/warn/error),Set to debug for troubleshooting
OTEL_COLLECTOR_DEBUG_VERBOSITY,detailed,otel-collector,Verbosity of debug exporter output (basic/normal/detailed),Lower to basic in production
OTEL_BATCH_TIMEOUT,1s,otel-collector,Max time to wait before sending a batch,Lower for faster exports (higher network load)
OTEL_BATCH_SIZE,8192,otel-collector,Max number of items in one batch,Increase for high-volume services
OTEL_MEMORY_LIMIT_MIB,400,otel-collector,Soft memory limit for collector (in MiB),Lower if collector OOMs on your host
LOKI_HTTP_PORT,3100,loki,Internal HTTP port for Loki,Only if you need to change (rare)
LOKI_RETENTION_PERIOD,168h (7 days),loki,How long logs are kept before deletion,Increase to 720h (30 days) or more
TEMPO_HTTP_PORT,3200,tempo,Tempo query UI port,Only if 3200 conflicts
TEMPO_LOG_LEVEL,info,tempo,Tempo log level,Set to debug for troubleshooting
TEMPO_TRACE_IDLE_PERIOD,10s,tempo,Time to wait before flushing idle traces,Lower to 5s for faster visibility in dev
TEMPO_MAX_BLOCK_DURATION,5m,tempo,Max duration of a trace block before sealing,Lower to 1m for quicker search
PROMETHEUS_SCRAPE_INTERVAL,15s,prometheus,How often Prometheus scrapes targets,Lower to 5s for faster updates
PROMETHEUS_EVAL_INTERVAL,15s,prometheus,How often rules/alerts are evaluated,Match scrape interval
PROMETHEUS_SCRAPE_TIMEOUT,10s,prometheus,Timeout for each scrape attempt,Increase if targets are slow