"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const fs_1 = require("fs");
const allowedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
class LoggerModule {
    constructor(config) {
        this.app = null;
        this.logger = null;
        this.config = config;
    }
    get logLevel() {
        return (process.env.LOG_LEVEL || 'error').toLowerCase();
    }
    checkEnvironment() {
        if (!allowedLogLevels.includes(this.logLevel)) {
            throw new Error(`Invalid LOG_LEVEL '${this.logLevel}'`);
        }
    }
    setupModule() {
        const allLevels = winston_1.default.config.npm.levels;
        const current = winston_1.default.config.npm.levels[this.logLevel];
        try {
            fs_1.mkdirSync(this.config.path);
        }
        catch (error) { }
        const logs = ['error', 'warn', 'info', 'debug'];
        let fileTransports = logs.map(loggingLevel => new winston_1.default.transports.File({
            filename: `${loggingLevel}.log`,
            dirname: this.config.path,
            level: loggingLevel,
            silent: current < allLevels[loggingLevel]
        }));
        this.logger = winston_1.default.createLogger({
            level: this.logLevel,
            format: winston_1.default.format.json(),
            transports: [
                ...fileTransports,
                new winston_1.default.transports.Console({
                    level: this.logLevel,
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                })
            ]
        });
    }
    clearModule() {
        delete this.logger;
    }
    extendExpress(server) {
        const { enableAccessLogs = false, excludeRoutes = [] } = this.config;
        // Don't add logging middleware if not cofigured
        if (!enableAccessLogs)
            return;
        server.use((req, res, next) => {
            // If the uri matches an exclusion, don't log it
            if (excludeRoutes.some(regex => regex.test(req.path)))
                return next();
            // Log the request
            this.logger.info(`${req.method.toLowerCase()}: ${req.path}`, {
                date: new Date().toISOString(),
                query: req.query
            });
            next();
        });
    }
    extendEndpointContext() {
        return {
            logger: this.logger
        };
    }
}
exports.LoggerModule = LoggerModule;
//# sourceMappingURL=LoggerModule.js.map