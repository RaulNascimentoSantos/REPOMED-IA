import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DB_PATH = process.env.URLS_DB_PATH || path.join(process.cwd(), '..', 'urls-database.json');

async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { urls: [], developments: [] };
  }
}

function updateUrlsWithCurrentHost(data: any, request: Request) {
  const url = new URL(request.url);
  const currentHost = `${url.protocol}//${url.host}`;
  const currentPort = url.port || (url.protocol === 'https:' ? '443' : '80');

  // Atualizar URLs do frontend para a porta atual
  if (data.urls) {
    data.urls = data.urls.map((urlItem: any) => {
      if (urlItem.category === 'frontend' && urlItem.url.includes('localhost')) {
        return {
          ...urlItem,
          url: urlItem.url.replace(/http:\/\/localhost:\d+/, currentHost),
          port: parseInt(currentPort)
        };
      }
      return urlItem;
    });
  }

  // Atualizar URLs nos developments
  if (data.developments) {
    data.developments = data.developments.map((dev: any) => {
      if (dev.urls) {
        dev.urls = dev.urls.map((urlItem: any) => {
          if (urlItem.category === 'frontend' && urlItem.url && urlItem.url.includes('localhost')) {
            return {
              ...urlItem,
              url: urlItem.url.replace(/http:\/\/localhost:\d+/, currentHost),
              port: parseInt(currentPort)
            };
          }
          return urlItem;
        });
      }
      return dev;
    });
  }

  return data;
}

export async function GET(request: Request) {
  try {
    let data = await loadDatabase();
    data = updateUrlsWithCurrentHost(data, request);
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar dados' }, { status: 500 });
  }
}