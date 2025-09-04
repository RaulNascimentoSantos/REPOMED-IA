import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import http from 'http';

function sha256(buf: Buffer) { return crypto.createHash('sha256').update(buf).digest('hex'); }
async function fetchBuffer(url: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    http.get(url, (res) => {
      res.on('data', (c) => chunks.push(Buffer.from(c)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

describe('PDF determinístico', () => {
  it('gera mesmo SHA-256 em 3 chamadas', async () => {
    const base = process.env.API_BASE || 'http://localhost:8087';
    const docId = process.env.TEST_DOC_ID || '42e5ef85-3f2f-4b8a-835e-52c2a08e5855';
    const url = `${base}/api/documents/${docId}/pdf`;

    const a = await fetchBuffer(url);
    const b = await fetchBuffer(url);
    const c = await fetchBuffer(url);

    const ha = sha256(a), hb = sha256(b), hc = sha256(c);
    // opcional: se quiser snapshot do golden
    writeFileSync(join(process.cwd(), 'tests/golden/pdf.hash.txt'), ha);
    expect(ha).toBe(hb);
    expect(hb).toBe(hc);
  });
});