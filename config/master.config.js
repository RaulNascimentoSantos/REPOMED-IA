"use strict";
/**
 * CONFIGURAÇÃO MASTER REPOMED IA
 * NÃO ALTERAR - ÚNICA FONTE DE VERDADE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPOMED_CONFIG = void 0;
exports.REPOMED_CONFIG = {
    // VERSÃO E AMBIENTE
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    // PORTAS FIXAS (NUNCA MUDAR!)
    ports: {
        frontend: 3010,
        backend: 8081,
        postgres: 5432,
        redis: 6379,
        minio: 9000,
        grafana: 3000,
        prometheus: 9090,
        jaeger: 16686,
        elasticsearch: 9200,
        kibana: 5601,
    },
    // URLs
    urls: {
        frontend: 'http://localhost:3010',
        backend: 'http://localhost:8081',
        api: 'http://localhost:8081/api',
        websocket: 'ws://localhost:8081',
        grafana: 'http://localhost:3000',
        kibana: 'http://localhost:5601',
    },
    // DATABASE
    database: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'repomed@2025',
        database: 'repomed_production',
        url: 'postgresql://postgres:repomed@2025@localhost:5432/repomed_production',
        maxConnections: 100,
        ssl: process.env.NODE_ENV === 'production',
    },
    // REDIS
    redis: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        ttl: 3600,
    },
    // SEGURANÇA
    security: {
        jwtSecret: process.env.JWT_SECRET || 'repomed-jwt-secret-change-in-production',
        jwtExpiry: '24h',
        refreshTokenExpiry: '7d',
        bcryptSaltRounds: 10,
        encryptionKey: process.env.ENCRYPTION_KEY || 'repomed-aes-256-key',
        rateLimitMax: 100,
        rateLimitWindow: '15m',
    },
    // APIs EXTERNAS
    apis: {
        openai: {
            key: process.env.OPENAI_API_KEY,
            model: 'gpt-4-turbo-preview',
            maxTokens: 2000,
        },
        whatsapp: {
            token: process.env.WHATSAPP_TOKEN,
            phoneId: process.env.WHATSAPP_PHONE_ID,
        },
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: 'noreply@repomed.com.br',
        },
        sentry: {
            dsn: process.env.SENTRY_DSN,
        },
    },
    // CERTIFICAÇÃO DIGITAL
    digitalSignature: {
        provider: 'vidaas', // vidaas | birdid | safeid | remoteId
        vidaas: {
            url: 'https://vidaas.cfm.org.br/api',
            token: process.env.VIDAAS_TOKEN,
        },
        birdid: {
            url: 'https://api.birdid.com.br',
            apiKey: process.env.BIRDID_API_KEY,
        },
    },
    // FEATURES FLAGS
    features: {
        prescriptions: true,
        digitalSignature: true,
        whatsappIntegration: true,
        aiAssistant: true,
        telemedicine: false,
        billing: true,
        analytics: true,
        darkMode: true,
        offlineMode: true,
        voiceRecognition: true,
    },
    // MÉTRICAS E LOGS
    monitoring: {
        enableGrafana: true,
        enablePrometheus: true,
        enableJaeger: true,
        enableElastic: true,
        logLevel: 'info',
        metricsInterval: 60000,
    },
};
//# sourceMappingURL=master.config.js.map