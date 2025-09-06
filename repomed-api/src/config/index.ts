import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  app: {
    name: string;
    version: string;
    env: string;
  };
  server: {
    port: number;
    host: string;
  };
  database: {
    url: string;
    ssl: boolean;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    bcryptRounds: number;
    encryptionKey: string;
    corsOrigin: string;
    rateLimitMax: number;
    rateLimitWindow: string;
  };
  features: {
    prescriptions: boolean;
    digitalSignature: boolean;
    whatsapp: boolean;
    aiAssistant: boolean;
    billing: boolean;
    telemedicine: boolean;
    darkMode: boolean;
    offlineMode: boolean;
    voiceRecognition: boolean;
  };
  apis: {
    openai?: {
      key: string;
      model: string;
    };
    stripe?: {
      secretKey: string;
      webhookSecret: string;
    };
    sendgrid?: {
      apiKey: string;
      fromEmail: string;
    };
  };
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

export const config: Config = {
  app: {
    name: process.env.APP_NAME || 'RepoMed IA',
    version: process.env.APP_VERSION || '4.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  server: {
    port: parseInt(process.env.BACKEND_PORT || '8081', 10),
    host: '0.0.0.0',
  },
  database: {
    url: process.env.DATABASE_URL || 
      `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
    ssl: parseBoolean(process.env.DATABASE_SSL, false),
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '100', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-in-production',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3010',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '15m',
  },
  features: {
    prescriptions: parseBoolean(process.env.FEATURE_PRESCRIPTIONS, true),
    digitalSignature: parseBoolean(process.env.FEATURE_DIGITAL_SIGNATURE, true),
    whatsapp: parseBoolean(process.env.FEATURE_WHATSAPP, false),
    aiAssistant: parseBoolean(process.env.FEATURE_AI_ASSISTANT, false),
    billing: parseBoolean(process.env.FEATURE_BILLING, false),
    telemedicine: parseBoolean(process.env.FEATURE_TELEMEDICINE, false),
    darkMode: parseBoolean(process.env.FEATURE_DARK_MODE, true),
    offlineMode: parseBoolean(process.env.FEATURE_OFFLINE_MODE, true),
    voiceRecognition: parseBoolean(process.env.FEATURE_VOICE_RECOGNITION, false),
  },
  apis: {
    openai: process.env.OPENAI_API_KEY ? {
      key: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    } : undefined,
    stripe: process.env.STRIPE_SECRET_KEY ? {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    } : undefined,
    sendgrid: process.env.SENDGRID_API_KEY ? {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@repomed.com.br',
    } : undefined,
  },
};

// Validate critical configurations
if (config.app.env === 'production') {
  const requiredEnvVars = [
    'DATABASE_PASSWORD',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}