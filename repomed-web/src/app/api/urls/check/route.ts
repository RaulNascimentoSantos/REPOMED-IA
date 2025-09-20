import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Máximo 10 segundos por request

function timeoutFetch(url: string, opts: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000, ...rest } = opts; // Aumentado para 5s
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, {
    ...rest,
    signal: controller.signal,
    redirect: 'manual',
    cache: 'no-store',
    headers: {
      'User-Agent': 'RepoMed-IA-StatusChecker/1.0',
      ...rest.headers
    }
  })
    .finally(() => clearTimeout(id));
}

export async function POST(req: Request) {
  try {
    const { url, method = 'HEAD' } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'url obrigatória' }, { status: 400 });
    }

    // Validar URL básica
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ success: true, online: false, responseTime: 0 });
    }

    const start = Date.now();
    let res: Response;
    let finalMethod = method;

    try {
      // Tentar primeiro com o método especificado
      res = await timeoutFetch(url, { method, timeout: 5000 });

      // Se HEAD falhar, tentar GET (alguns servidores não suportam HEAD)
      if (!res.ok && method === 'HEAD') {
        try {
          res = await timeoutFetch(url, { method: 'GET', timeout: 5000 });
          finalMethod = 'GET';
        } catch {
          // Se GET também falhar, usar o resultado original do HEAD
        }
      }
    } catch (error) {
      // Erro de rede, timeout, etc.
      const responseTime = Date.now() - start;
      return NextResponse.json({
        success: true,
        online: false,
        responseTime,
        error: 'timeout_or_network_error'
      });
    }

    const responseTime = Date.now() - start;

    // Critério mais rigoroso para "online"
    const isOnline = res.ok || (
      res.status >= 200 && res.status < 400 ||
      res.status === 401 || // Unauthorized pode indicar que o serviço está rodando
      res.status === 403    // Forbidden pode indicar que o serviço está rodando
    );

    return NextResponse.json({
      success: true,
      online: isOnline,
      responseTime,
      status: res.status,
      method: finalMethod
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'erro interno do servidor'
    }, { status: 500 });
  }
}