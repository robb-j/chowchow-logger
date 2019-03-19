"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const fs_1 = require("fs");
const allowedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
const defaultPersistentLevels = ['error', 'warn', 'info', 'debug'];
class LoggerModule {
    get logLevel() {
        return (process.env.LOG_LEVEL || 'error').toLowerCase();
    }
    constructor(config) {
        this.config = config;
    }
    checkEnvironment() {
        // Ensure a correct LOG_LEVEL was set
        if (!allowedLogLevels.includes(this.logLevel)) {
            throw new Error(`Invalid LOG_LEVEL '${this.logLevel}'`);
        }
        // Ensure passed log levels are valid
        const { persistentLevels = [] } = this.config;
        const invalid = persistentLevels.filter(l => !allowedLogLevels.includes(l));
        if (invalid.length > 0) {
            throw new Error(`Invalid persistent level(s): ${invalid.join(', ')}`);
        }
    }
    setupModule() {
        const allLevels = winston_1.default.config.npm.levels;
        const current = winston_1.default.config.npm.levels[this.logLevel];
        // We will conditionally create file transports below
        let fileTransports = [];
        // If they passed a path, create file transports
        if (this.config.path) {
            // Make the log directory if it doesn't exist
            // If it failed then it already exists
            try {
                fs_1.mkdirSync(this.config.path);
            }
            catch (error) { }
            // Create log transports for these log levels
            const { persistentLevels = defaultPersistentLevels } = this.config;
            fileTransports = persistentLevels.map(loggingLevel => new winston_1.default.transports.File({
                filename: `${loggingLevel}.log`,
                dirname: this.config.path,
                level: loggingLevel,
                silent: current < allLevels[loggingLevel]
            }));
        }
        // Create a logger with files for different levels and
        // a console logger for the configured level
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
        // Apply the error logger if configured
        if (this.config.enableErrorLogs) {
            this.app.applyErrorHandler((err, ctx) => {
                let { method, path } = ctx.req;
                let message = `${method.toLowerCase()} ${path}: ${err.message}`;
                this.logger.error(message, { stack: err.stack });
            });
        }
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