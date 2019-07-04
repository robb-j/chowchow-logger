import { Module, ChowChow } from '@robb_j/chowchow';
import { Application } from 'express';
import winston from 'winston';
declare type LoggerConfig = {
    path?: string;
    enableAccessLogs?: boolean;
    enableErrorLogs?: boolean;
    excludeRoutes?: RegExp[];
    persistentLevels?: string[];
};
export declare type LoggerContext = {
    logger: winston.Logger;
};
export declare class LoggerModule implements Module {
    config: LoggerConfig;
    app: ChowChow;
    logger: winston.Logger;
    readonly logLevel: string;
    constructor(config: LoggerConfig);
    checkEnvironment(): void;
    setupModule(): void;
    clearModule(): void;
    extendExpress(server: Application): void;
    extendEndpointContext(): LoggerContext;
}
export {};
