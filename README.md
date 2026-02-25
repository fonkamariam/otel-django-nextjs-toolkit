# OpenTelemetry Observability Toolkit for Django + Next.js (and more)

A plug-and-play, minimal-effort observability starter kit for full-stack web applications.

Add **distributed traces**, **metrics**, and **logs** to your Django backend + Next.js frontend (or other frameworks) with almost zero code changes.

### What this toolkit provides

- **App-level telemetry** (traces, metrics, logs) via OpenTelemetry auto-instrumentation  
- **Container-level metrics** → cAdvisor → Prometheus  
- **Host-level metrics** → node_exporter → Prometheus  
- **Container logs** → Promtail → Loki  
- **Unified visualization** in Grafana (Tempo for traces, Prometheus for metrics, Loki for logs)

All backend services run in Docker Compose — just copy and run.

### Supported Frameworks (so far)

| Framework       | Folder in this repo      | Code changes needed? | Auto-instrumentation coverage                     |
|-----------------|--------------------------|----------------------|---------------------------------------------------|
| Django          | `django/`                | None                 | HTTP, views, ORM/DB, logging, external requests   |
| Next.js         | `nextjs/`                | None (optional Pino) | HTTP server, fetch, Node.js runtime, logging      |
| (others)        | Add your own folder!     | Varies               | Java Spring, Go Gin/Echo, FastAPI, etc. welcome   |


### Quick Start (for Django + Next.js)
1. Clone this repo
   ```bash
   git clone https://github.com/fonkamariam/otel-django-nextjs-toolkit.git
   cd otel-django-nextjs-toolkit

2. Copy the observability backend to your project
    Copy shared/docker-compose-observability.yml to your project root
    
    Copy all files from shared/ to your project root
    
    Start the stack with these command: docker compose -f docker-compose.yml -f docker-compose-observability.yml up -d
3. Instrument your Django app → see django/README.md

4. Instrument your Next.js app → see nextjs/README.md

5. Open Grafana
    - http://localhost:3000
    - Login: admin / admin (change password immediately!)
6. Explore
    - Traces: Tempo → filter by service_name
    - Metrics: Prometheus → e.g. rate(http_server_duration_seconds_count[5m]) by (service_name)
    - Logs: Loki → {service_name="my-django-app"} or {container_name="nextjs"}

# Default Dashboards (Auto-Provisioned)
    
   Grafana automatically loads these on first startup — no manual import required!
   
   ## cAdvisor exporter (ID 14282)
   Folder: Infrastructure
   Shows: Per-container CPU usage, memory (RSS/cache), network RX/TX, disk I/O
   Perfect for spotting resource-heavy containers
   
   ## Node Exporter Server Metrics (ID 10242)
   Folder: Infrastructure
   Shows: Host-level CPU (per core/mode), memory (used/free/swap), load average, disk space & I/O, network traffic, processes
   Clean, modern single-host view (use the Host dropdown if multiple nodes appear)
   
   To add more (e.g. logs dashboards), place additional JSONs in shared/grafana-dashboards/ — they auto-load via provisioning.
   

### Repository Structure

| Path                                      | Description                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------------|
| `README.md`                               | Main overview and quick start guide                                         |
| `LICENSE`                                 | MIT license                                                                 |
| `shared/`                                 | Common observability backend (copy to your project)                         |
| ├─ `docker-compose-observability.yml`     | Main compose file for the stack                                             |
| ├─ `otel-collector-config.yml`            | OTEL Collector configuration                                                |
| ├─ `tempo.yaml`                           | Tempo (traces) configuration                                                |
| ├─ `loki-config.yaml`                     | Loki (logs) configuration                                                   |
| ├─ `prometheus.yml`                       | Prometheus (metrics) configuration                                          |
| ├─ `promtail-config.yaml`                 | Promtail (container logs) configuration                                     |
| ├─ `grafana-provisioning/`                | Auto-provisions Grafana dashboards                                          |
| │  └─ `dashboards/`                       | default-dashboards.yaml, logs-dashboards.yaml                             |
| |  |_  `datasources/`                     | prometheus.yaml, loki.yaml, tempo.yml
| └─ `grafana-dashboards/`                  | Local JSON copies(cadvisor-exporter.json,node-exporter-server-metrics.json) |
| `django/`                                 | Django-specific instructions & files                                        |
| ├─ `README.md`                            | Django setup guide                                                          |
| ├─ `requirements-otel.txt`                | OTEL packages to add to requirements.txt                                    |
| └─ `startup-otel.sh`                      | Startup wrapper with OTEL instrumentation                                   |
| `nextjs/`                                 | Next.js-specific instructions & files                                       |
| ├─ `README.md`                            | Next.js setup guide                                                         |
| └─ `instrumentation.node.ts`              | OTEL SDK setup for Next.js (auto-loaded)                                    |
| `docs/`                                   | Optional deeper guides                                                      |
| └─ `env-vars-reference.md`                | Full list of configurable environment variables                             |

# Troubleshooting Quick Checks

Containers up? → docker compose ps
Grafana healthy? → http://localhost:3000
Prometheus scraping? → http://localhost:9090/targets (cadvisor & node_exporter UP)
Tempo ready? → http://localhost:3200/ready ("ready")
Loki logs flowing? → Explore → Loki → {job="docker-containers"}
Host metrics visible? → Dashboards → Infrastructure → Node Exporter Server Metrics (select host if multiple)
Container metrics visible? → Dashboards → Infrastructure → cAdvisor exporter

Enjoy plug-and-play observability — traces across services, metrics from infra/apps, logs unified in one place.
Contributions welcome (add more dashboards, FastAPI example, etc.)!
