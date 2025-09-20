import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/demo'
]

// Rotas que redirecionam usuários autenticados
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
]

export function middleware(request: NextRequest) {
  // TEMPORÁRIO: Bypass de autenticação para teste das melhorias UX
  // TODO: Remover este bypass quando a autenticação estiver funcionando
  return NextResponse.next()

  const { pathname } = request.nextUrl

  // Verificar se o usuário está autenticado
  const authData = request.cookies.get('repomed_auth')?.value
  let isAuthenticated = false

  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      isAuthenticated = !!parsed.token
    } catch {
      isAuthenticated = false
    }
  }

  // Se está em uma rota pública, permitir acesso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Se está logado e tentando acessar páginas de auth, redirecionar para dashboard
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se não está logado e está tentando acessar rota protegida, redirecionar para login
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}