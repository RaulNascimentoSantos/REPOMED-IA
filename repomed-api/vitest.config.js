"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.ts'],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        testTimeout: 10000,
        hookTimeout: 10000,
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                'dist/',
                'src/types/',
                '**/*.d.ts',
                '**/*.test.{ts,js}',
                '**/*.spec.{ts,js}'
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70
                }
            }
        },
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                minThreads: 1,
                maxThreads: 4
            }
        },
        reporter: [
            'default',
            'json',
            'html'
        ],
        outputFile: {
            json: './test-results/results.json',
            html: './test-results/index.html'
        }
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, './src'),
            '@tests': (0, path_1.resolve)(__dirname, './tests')
        }
    },
    esbuild: {
        target: 'node18'
    }
});
