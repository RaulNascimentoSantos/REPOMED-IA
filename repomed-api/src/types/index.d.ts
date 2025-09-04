import 'fastify';
import { PointOfServiceUser } from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      organizationId?: string;
      role: string;
      name?: string;
      crm?: string;
    };
    organizationId?: string;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    authorize: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      organizationId?: string;
      role?: string;
      crm?: string;
      type?: 'access' | 'refresh';
    };
    user: {
      id: string;
      email: string;
      organizationId?: string;
      role: string;
      name?: string;
      crm?: string;
    };
  }
}

export interface Document {
  id: string;
  title: string;
  content: string;
  hash?: string;
  createdAt: Date;
  isSigned?: boolean;
  signedAt?: Date;
  signedBy?: string;
  signatureHash?: string;
  tags?: string[];
  patient?: any;
  doctor?: any;
}

export interface PDFGenerationOptions {
  documentId: string;
  title?: string;
  content?: string;
  includeQR?: boolean;
  includeWatermark?: boolean;
}

export interface MetricsCollectorDependencies {
  database?: any;
  cache?: any;
}