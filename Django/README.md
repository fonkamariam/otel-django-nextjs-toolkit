# Django OpenTelemetry Observability Setup

This guide adds full observability (traces, metrics, logs) to your Django application with **minimal effort** — **no code changes required** for basic auto-instrumentation.

### What You Get

- **Traces**: End-to-end request flow (incoming HTTP → views → DB queries → external calls)
- **Metrics**: HTTP request duration/count, Django ORM queries, process CPU/memory, system stats
- **Logs**: Structured logs from Python logging module with trace correlation (trace_id/span_id)

All data is pushed to your OTEL Collector → visualized in Grafana (Tempo for traces, Prometheus for metrics, Loki for logs).

### How Telemetry Is Collected

| Type     | Who Collects It                          | How It Works                                                                 | Where It Goes                     |
|----------|------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------|
| **Traces** | OTEL SDK + opentelemetry-instrumentation-django | Auto-creates spans for HTTP requests, views, middleware, DB queries, external HTTP calls | OTLP → Collector → Tempo         |
| **Metrics** | OTEL SDK + instrumentation-system-metrics + Django auto-instr. | Auto-collects HTTP stats, ORM queries, process/runtime metrics (CPU/mem/threads) | OTLP push → Collector → Prometheus scrape |
| **Logs**   | opentelemetry-instrumentation-logging   | Python `logging` calls become OTEL LogRecords with trace context           | OTLP → Collector → Loki          |

- All data is **pushed** from inside the Django process to the OTEL Collector.
- No manual instrumentation needed for core Django functionality (views, ORM, logging).

### Prerequisites

- Django project using Gunicorn/uWSGI/uvicorn (or similar)
- Docker Compose running your app
- OTEL Collector already running (see main toolkit repo)

### Quick Setup 

1. **Add OTEL Dependencies**
   Add these to your `requirements.txt` → run `pip install -r requirements.txt`:
    opentelemetry-api
    opentelemetry-sdk
    opentelemetry-instrumentation-django
    opentelemetry-instrumentation-dbapi
    opentelemetry-instrumentation-logging
    opentelemetry-instrumentation-system-metrics
    opentelemetry-exporter-otlp
    opentelemetry-instrumentation-jinja2  # optional (for template rendering time)
    opentelemetry-instrumentation-requests  # optional (if using requests library)

2. **Add Environment Variables**
Add these to your Django service in `docker-compose.yml`:
```yaml
environment:
  - OTEL_SERVICE_NAME=my-django-app
  - OTEL_RESOURCE_ATTRIBUTES=service.version=1.0,deployment.environment=dev
  - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
  - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
  - OTEL_METRICS_EXPORTER=otlp   # set to none - Disables metrics
  - OTEL_TRACES_EXPORTER=otlp    # set to none - Disables traces
  - OTEL_LOGS_EXPORTER=otlp      # set to none - Disables logs
  - OTEL_PYTHON_LOG_CORRELATION=true
  - OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
  - OTEL_METRIC_EXPORT_INTERVAL=5000           # Push metrics every 5s (optional)
  # Optional: reduce trace volume in production
  - OTEL_TRACES_SAMPLER=traceidratio
  - OTEL_TRACES_SAMPLER_ARG=0.1               # 10% sampling

3. **Wrap Startup Command**

    Copy startup-otel.sh from this toolkit's Django/ folder to your project (e.g. next to manage.py)
    - Make it executable: chmod +x startup-otel.sh
    
    Change your Django service startup command in your docker-compose.yml
    - command: bash /app/startup-otel.sh
    
    Inside startup-otel.sh, replace the example command with your original command, prefixed with opentelemetry-instrument. Example 

        opentelemetry-instrument \
        gunicorn mypash /app/startup-otel.sroject.wsgi:application --bind 0.0.0.0:8000 --workers 4 --log-level info
        
        Or if using uvicorn
        opentelemetry-instrument \
        uvicorn myproject.asgi:application --host 0.0.0.0 --port 8000

4. **Restart & Test**
    Restart your Django container
    Load pages, call APIs, check container logs for OTEL activity
    Open Grafana → Explore traces/metrics/logs

### Disabling Specific Telemetry


Logging Options
    Django uses Python's built-in logging module — no extra logger required.

    All logger.info(), logger.error(), etc. are automatically captured and sent via OTLP to Loki
    Logs include trace_id/span_id (clickable in Grafana to jump to Tempo trace)
    
    No additional packages or code changes needed for logging — it just works.

Troubleshooting

    No traces/metrics?
        Check docker compose logs django for OTEL startup messages
        Check collector- docker compose logs otel-collector
    No logs?
        Check {service_name="my-django-app"} in Loki
        Ensure OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
    Startup fails?
        Verify opentelemetry-instrument is in PATH (installed via pip)
        Make sure startup-otel.sh is executable and copied correctly

