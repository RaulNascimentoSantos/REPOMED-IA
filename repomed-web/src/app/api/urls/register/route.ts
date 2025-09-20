import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DB_PATH = process.env.URLS_DB_PATH || path.join(process.cwd(), 'urls-database.json');

async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { urls: [], developments: [] };
  }
}

async function saveDatabase(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

function requireToken(req: Request) {
  const expected = process.env.URLS_SHARED_TOKEN;
  if (!expected) return;
  const provided = req.headers.get('x-urls-token');
  if (provided !== expected) {
    const err: any = new Error('unauthorized');
    err.status = 401;
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    requireToken(request);
    const body = await request.json();
    const db = await loadDatabase();

    if (body.type === 'development') {
      const development = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...body
      };
      db.developments.unshift(development);

      if (Array.isArray(body.urls)) {
        for (const url of body.urls) {
          db.urls.push({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...url
          });
        }
      }
    }

    if (body.type === 'url') {
      db.urls.push({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...body
      });
    }

    await saveDatabase(db);
    return NextResponse.json({ success: true, message: 'Dados registrados com sucesso' });
  } catch (error: any) {
    const status = error?.status || 500;
    return NextResponse.json({ success: false, error: 'Erro ao registrar dados' }, { status });
  }
}