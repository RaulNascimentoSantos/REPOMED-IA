# 📊 RepoMed IA - Observabilidade e Monitoramento

Este documento descreve a stack de observabilidade implementada no RepoMed IA, incluindo métricas, dashboards, alertas e ferramentas de monitoramento.

## 🏗️ Arquitetura de Monitoramento

### Stack Tecnológica
- **Prometheus**: Coleta e armazenamento de métricas
- **Grafana**: Visualização e dashboards
- **Node Exporter**: Métricas do sistema operacional  
- **PostgreSQL Exporter**: Métricas do banco de dados
- **Redis Exporter**: Métricas do cache
- **cAdvisor**: Métricas dos containers
- **Alertmanager**: Gerenciamento de alertas (futuro)

### Arquitetura de Dados
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  RepoMed    │───►│  Prometheus  │───►│   Grafana   │
│     API     │    │              │    │ (Dashboard) │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   ▲
       ▼                   │
┌─────────────┐    ┌──────────────┐
│   Metrics   │    │  Exporters   │
│  Endpoint   │    │ (Postgres,   │
│ /metrics    │    │ Redis, Node) │
└─────────────┘    └──────────────┘
```

## 🚀 Iniciando o Monitoramento

### Comandos Rápidos
```bash
# Iniciar stack completa de monitoramento
npm run monitoring:start

# Parar monitoramento
npm run monitoring:stop

# Reiniciar monitoramento
npm run monitoring:restart

# Ver logs
npm run monitoring:logs
```

### Acesso aos Serviços
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Node Exporter**: http://localhost:9100
- **PostgreSQL Exporter**: http://localhost:9187
- **Redis Exporter**: http://localhost:9121
- **cAdvisor**: http://localhost:8080

## 📊 Métricas Coletadas

### Métricas de Aplicação (RepoMed API)

#### HTTP Requests
```promql
# Taxa de requisições por segundo
rate(http_requests_total[5m])

# Tempo de resposta por percentil
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erro
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])
```

#### Business Metrics
```promql
# Total de documentos no sistema
documents_total

# Taxa de criação de documentos
rate(documents_created_total[5m])

# Tempo de assinatura de documentos
histogram_quantile(0.95, rate(documents_signing_duration_seconds_bucket[5m]))

# Taxa de geração de PDFs
rate(pdf_generation_total[5m])
```

#### Sistema e Infraestrutura
```promql
# Conexões ativas do banco
database_connections_active

# Taxa de acerto do cache
cache_hit_ratio

# Uso de memória da aplicação
process_resident_memory_bytes

# Uso de CPU
rate(process_cpu_seconds_total[5m]) * 100
```

### Métricas do Sistema (Node Exporter)

#### Sistema Operacional
```promql
# Uso de CPU
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Uso de memória
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Espaço em disco
(1 - (node_filesystem_free_bytes / node_filesystem_size_bytes)) * 100

# Load average
node_load1
```

#### Rede
```promql
# Tráfego de rede
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

### Métricas do PostgreSQL

```promql
# Conexões ativas
pg_stat_database_numbackends

# Taxa de transações
rate(pg_stat_database_xact_commit[5m]) + rate(pg_stat_database_xact_rollback[5m])

# Cache hit ratio
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)

# Tamanho do banco
pg_database_size_bytes
```

### Métricas do Redis

```promql
# Memória utilizada
redis_memory_used_bytes

# Número de chaves
redis_db_keys

# Taxa de acerto do cache
rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))

# Conexões
redis_connected_clients
```

## 📈 Dashboards

### Dashboard Principal (System Overview)
Localizado em: `monitoring/grafana/provisioning/dashboards/repomed-dashboard.json`

**Painéis incluídos:**
- Taxa de requisições HTTP
- Tempo de resposta (percentis)
- Taxa de erro
- Status dos serviços
- Métricas de negócio (documentos, pacientes)
- Performance de geração de PDF
- Métricas do sistema

### Personalizando Dashboards

1. **Acesse o Grafana**: http://localhost:3001
2. **Login**: admin/admin123
3. **Explore > Dashboards**: Veja dashboards existentes
4. **Create > Dashboard**: Criar novo dashboard
5. **Query Builder**: Use as métricas Prometheus

### Queries Úteis para Dashboards

```promql
# Top endpoints por volume
topk(10, sum by (route) (rate(http_requests_total[5m])))

# Top endpoints por latência
topk(10, histogram_quantile(0.95, sum by (route) (rate(http_request_duration_seconds_bucket[5m]))))

# Documentos criados por template
sum by (template_id) (rate(documents_created_total[1h]))

# Health check de serviços
up{job="repomed-api"}
```

## 🚨 Alertas

### Regras de Alerta
Configuradas em: `monitoring/alert_rules.yml`

#### Alertas Críticos
- **API Down**: API não está respondendo (>1min)
- **High Error Rate**: Taxa de erro >5% (>2min)
- **Database Connection Failure**: Falha na conexão com DB (>2min)
- **Signature Service Errors**: Falhas no serviço de assinatura

#### Alertas de Warning
- **High Response Time**: Tempo de resposta >2s no p95 (>5min)
- **High Memory Usage**: Uso de memória >1GB (>5min)
- **Cache Connection Failure**: Falha na conexão com Redis (>5min)
- **High CPU Usage**: Uso de CPU >80% (>10min)

#### Alertas de Negócio
- **No Documents Created**: Nenhum documento criado em 2 horas
- **High Signing Failure Rate**: Taxa de falha na assinatura >10%
- **Slow PDF Generation**: Geração de PDF >5s no p95

### Configurando Notificações

Para configurar notificações (Slack, email, etc):

1. **Configure Alertmanager** (não incluído na configuração atual):
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@repomed.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK'
    channel: '#alerts'
```

## 🔧 Configuração Avançada

### Retenção de Dados

**Prometheus** (configurado em prometheus.yml):
- Retenção: 30 dias
- Tamanho máximo: 10GB

**Grafana**:
- Dados persistidos em volume Docker
- Backup automático não configurado

### Performance e Tuning

#### Prometheus
```yaml
# prometheus.yml - configurações de performance
global:
  scrape_interval: 15s      # Intervalo de coleta
  evaluation_interval: 15s  # Avaliação de regras

scrape_configs:
  - job_name: 'repomed-api'
    scrape_interval: 10s    # API: coleta mais frequente
    scrape_timeout: 5s
```

#### Grafana
- **Query timeout**: 30s
- **Data proxy timeout**: 30s
- **Concurrent queries**: 20

### Segurança

#### Grafana
- Usuário admin com senha forte
- Anonymous access limitado (Viewer)
- HTTPS recomendado para produção

#### Prometheus
- Endpoint `/metrics` da API deve ser protegido em produção
- Consider usar autenticação básica
- Filtrar métricas sensíveis

## 📊 Análise e Troubleshooting

### Investigando Problemas de Performance

1. **High Response Time**:
```promql
# Identificar endpoints lentos
topk(5, histogram_quantile(0.95, sum by (route) (rate(http_request_duration_seconds_bucket[5m]))))

# Correlacionar com CPU
rate(process_cpu_seconds_total[5m]) * 100
```

2. **High Error Rate**:
```promql
# Identificar endpoints com mais erros
sum by (route, status_code) (rate(http_requests_total{status_code=~"5.."}[5m]))

# Ver tendência de erros
increase(errors_total[1h])
```

3. **Database Issues**:
```promql
# Conexões do banco
database_connections_active

# Queries lentas
histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m]))
```

### Queries de Diagnóstico

```promql
# Saúde geral do sistema
up{job="repomed-api"}

# Tempo de resposta por método HTTP
histogram_quantile(0.95, sum by (method) (rate(http_request_duration_seconds_bucket[5m])))

# Distribuição de status codes
sum by (status_code) (rate(http_requests_total[5m]))

# Memory usage trend
increase(process_resident_memory_bytes[1h])

# Request volume por hora
sum(increase(http_requests_total[1h]))
```

### Capacity Planning

```promql
# Projeção de crescimento de documentos
predict_linear(documents_total[24h], 7*24*3600)

# Projeção de uso de memória
predict_linear(process_resident_memory_bytes[6h], 24*3600)

# Tendência de tráfego
predict_linear(rate(http_requests_total[1h])[6h:], 24*3600)
```

## 🚀 Produção

### Checklist para Deploy em Produção

#### Segurança
- [ ] Configurar HTTPS para Grafana
- [ ] Definir senhas fortes
- [ ] Restringir acesso aos endpoints de métricas
- [ ] Configurar firewall

#### Performance
- [ ] Definir recursos adequados (CPU/Memory)
- [ ] Configurar disk space monitoring
- [ ] Otimizar retention policies
- [ ] Load balancing se necessário

#### Backup e Recovery
- [ ] Backup automático do Grafana
- [ ] Backup de configurações do Prometheus
- [ ] Documentar procedimentos de recovery

#### Alertas
- [ ] Configurar Alertmanager
- [ ] Definir recipients de alertas
- [ ] Testar notificações
- [ ] Criar runbooks para alertas

### Arquitetura de Produção

```
┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Prometheus    │
│    (NGINX)      │    │   (HA Cluster)  │
└─────────────────┘    └─────────────────┘
         │                       │
    ┌────┴─────┐              ┌──┴──┐
    ▼          ▼              ▼     ▼
┌─────────┐ ┌─────────┐  ┌────────┐ ┌────────┐
│API Pod 1│ │API Pod 2│  │Grafana │ │AlertMgr│
└─────────┘ └─────────┘  └────────┘ └────────┘
```

## 📚 Referências

### Documentação
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Métricas Best Practices
- [Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
- [RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/)
- [USE Method](http://www.brendangregg.com/usemethod.html)

### Dashboards Inspiration
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
- [Node Exporter Dashboard](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)
- [PostgreSQL Dashboard](https://grafana.com/grafana/dashboards/9628-postgresql-database/)

---

## 🛠️ Comandos Úteis

```bash
# Verificar métricas da API
curl http://localhost:8082/metrics

# Verificar saúde da API  
curl http://localhost:8082/health

# Recarregar configuração do Prometheus
curl -X POST http://localhost:9090/-/reload

# Ver targets do Prometheus
curl http://localhost:9090/api/v1/targets

# Backup do Grafana
docker exec repomed-grafana grafana-cli admin export-dashboard

# Logs do Prometheus
docker logs repomed-prometheus

# Reiniciar apenas um serviço
docker compose restart prometheus
```