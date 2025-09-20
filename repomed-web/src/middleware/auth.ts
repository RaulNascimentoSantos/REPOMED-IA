import { NextRequest, NextResponse } from 'next/server';

interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Simple JWT implementation for demo purposes
// In production, use a proper JWT library like jose or jsonwebtoken
export class JWTAuth {
  private static secret = process.env.JWT_SECRET || 'repomed-dev-secret-2025';

  static encode(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours
    };

    // Simple base64 encoding for demo
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(fullPayload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${this.secret}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static decode(token: string): JWTPayload | null {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');

      if (!encodedHeader || !encodedPayload || !signature) {
        return null;
      }

      // Verify signature (simplified)
      const expectedSignature = btoa(`${encodedHeader}.${encodedPayload}.${this.secret}`);
      if (signature !== expectedSignature) {
        return null;
      }

      const payload: JWTPayload = JSON.parse(atob(encodedPayload));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  static verify(token: string): boolean {
    return this.decode(token) !== null;
  }
}

export function withAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header or cookie
      let token = req.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        // Try to get from cookie
        token = req.cookies.get('auth-token')?.value;
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Missing authentication token' },
          { status: 401 }
        );
      }

      // Verify and decode token
      const user = JWTAuth.decode(token);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Call the protected handler with user info
      return await handler(req, user);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

export function withOptionalAuth(handler: (req: NextRequest, user?: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header or cookie
      let token = req.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        token = req.cookies.get('auth-token')?.value;
      }

      let user: JWTPayload | undefined;

      if (token) {
        user = JWTAuth.decode(token) || undefined;
      }

      // Call handler with optional user info
      return await handler(req, user);

    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return await handler(req, undefined);
    }
  };
}

export function requireRole(roles: string[]) {
  return (handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) => {
    return withAuth(async (req: NextRequest, user: JWTPayload) => {
      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(req, user);
    });
  };
}

// Demo users for development
const DEMO_USERS = [
  {
    id: 'user_1',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
    name: 'Demo User'
  },
  {
    id: 'admin_1',
    email: 'admin@repomed.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 'doctor_1',
    email: 'doctor@repomed.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sistema'
  }
];

export function authenticateUser(email: string, password: string) {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    return null;
  }

  const token = JWTAuth.encode({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    token
  };
}