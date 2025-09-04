import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01']
  }
};

const BASE = __ENV.API_BASE || 'http://localhost:8087';

export default function () {
  const r1 = http.get(`${BASE}/api/templates`);
  const r2 = http.get(`${BASE}/api/documents`);
  check(r1, { 'templates 200': (r) => r.status === 200, 't p95<300': (r) => r.timings.duration < 300 });
  check(r2, { 'documents 200': (r) => r.status === 200, 'd p95<300': (r) => r.timings.duration < 300 });
}