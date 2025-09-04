/**
 * CONFIGURAÇÃO MASTER REPOMED IA
 * NÃO ALTERAR - ÚNICA FONTE DE VERDADE
 */
export declare const REPOMED_CONFIG: {
    readonly version: "3.0.0";
    readonly environment: string;
    readonly ports: {
        readonly frontend: 3010;
        readonly backend: 8081;
        readonly postgres: 5432;
        readonly redis: 6379;
        readonly minio: 9000;
        readonly grafana: 3000;
        readonly prometheus: 9090;
        readonly jaeger: 16686;
        readonly elasticsearch: 9200;
        readonly kibana: 5601;
    };
    readonly urls: {
        readonly frontend: "http://localhost:3010";
        readonly backend: "http://localhost:8081";
        readonly api: "http://localhost:8081/api";
        readonly websocket: "ws://localhost:8081";
        readonly grafana: "http://localhost:3000";
        readonly kibana: "http://localhost:5601";
    };
    readonly database: {
        readonly host: "localhost";
        readonly port: 5432;
        readonly user: "postgres";
        readonly password: "repomed@2025";
        readonly database: "repomed_production";
        readonly url: "postgresql://postgres:repomed@2025@localhost:5432/repomed_production";
        readonly maxConnections: 100;
        readonly ssl: boolean;
    };
    readonly redis: {
        readonly host: "localhost";
        readonly port: 6379;
        readonly password: string | undefined;
        readonly db: 0;
        readonly ttl: 3600;
    };
    readonly security: {
        readonly jwtSecret: string;
        readonly jwtExpiry: "24h";
        readonly refreshTokenExpiry: "7d";
        readonly bcryptSaltRounds: 10;
        readonly encryptionKey: string;
        readonly rateLimitMax: 100;
        readonly rateLimitWindow: "15m";
    };
    readonly apis: {
        readonly openai: {
            readonly key: string | undefined;
            readonly model: "gpt-4-turbo-preview";
            readonly maxTokens: 2000;
        };
        readonly whatsapp: {
            readonly token: string | undefined;
            readonly phoneId: string | undefined;
        };
        readonly stripe: {
            readonly secretKey: string | undefined;
            readonly webhookSecret: string | undefined;
        };
        readonly sendgrid: {
            readonly apiKey: string | undefined;
            readonly fromEmail: "noreply@repomed.com.br";
        };
        readonly sentry: {
            readonly dsn: string | undefined;
        };
    };
    readonly digitalSignature: {
        readonly provider: "vidaas";
        readonly vidaas: {
            readonly url: "https://vidaas.cfm.org.br/api";
            readonly token: string | undefined;
        };
        readonly birdid: {
            readonly url: "https://api.birdid.com.br";
            readonly apiKey: string | undefined;
        };
    };
    readonly features: {
        readonly prescriptions: true;
        readonly digitalSignature: true;
        readonly whatsappIntegration: true;
        readonly aiAssistant: true;
        readonly telemedicine: false;
        readonly billing: true;
        readonly analytics: true;
        readonly darkMode: true;
        readonly offlineMode: true;
        readonly voiceRecognition: true;
    };
    readonly monitoring: {
        readonly enableGrafana: true;
        readonly enablePrometheus: true;
        readonly enableJaeger: true;
        readonly enableElastic: true;
        readonly logLevel: "info";
        readonly metricsInterval: 60000;
    };
};
//# sourceMappingURL=master.config.d.ts.map