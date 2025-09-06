================================================================================
          ANÁLISE BANCO DE DADOS - REPOMED IA
================================================================================
Data: 2025-01-04
Análise Profunda Banco de Dados v1.0
================================================================================

## 1. CONFIGURAÇÃO DO BANCO DE DADOS

### 1.1 Status do Container PostgreSQL
### Container PostgreSQL Status:
```
18dd81ae50fa   postgres:15-alpine                              "docker-entrypoint.s…"   5 hours ago   Up 5 hours (healthy)    0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp                                                                                                                                                      repomed-postgres
57a97230e03c   prometheuscommunity/postgres-exporter:v0.13.2   "/bin/postgres_expor…"   2 days ago    Up 20 hours             0.0.0.0:9187->9187/tcp, [::]:9187->9187/tcp                                                                                                                                                      repomed-postgres-exporter
```


## 2. ESTRUTURA DO BANCO DE DADOS

### 2.1 Tabelas Existentes
```sql
           List of relations
 Schema |    Name    | Type  |  Owner   
--------+------------+-------+----------
 public | audit_logs | table | postgres
 public | documents  | table | postgres
 public | patients   | table | postgres
 public | shares     | table | postgres
 public | templates  | table | postgres
 public | users      | table | postgres
(6 rows)

```


### 2.2 Contagem de Registros por Tabela
```sql
   tabela   | count 
------------+-------
 users      |     0
 patients   |     0
 documents  |     0
 templates  |     0
 shares     |     0
 audit_logs |     0
(6 rows)

```
