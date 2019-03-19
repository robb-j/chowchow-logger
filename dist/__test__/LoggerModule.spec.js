"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LoggerModule_1 = require("../LoggerModule");
const path_1 = require("path");
const rimraf_1 = __importDefault(require("rimraf"));
const fs_1 = require("fs");
const winston_1 = __importDefault(require("winston"));
const chowchow_1 = require("@robb_j/chowchow");
const supertest_1 = __importDefault(require("supertest"));
const logsPath = path_1.join(__dirname, 'test_logs');
const isFileTransport = (some) => some instanceof winston_1.default.transports.File;
class FakeChow extends chowchow_1.ChowChow {
    async startServer() { }
    async stopServer() { }
}
describe('LoggerModule', () => {
    let logger;
    let chow;
    beforeEach(() => {
        // Let everything be logged
        process.env.LOG_LEVEL = 'silly';
        // Clean the test logs dir
        rimraf_1.default.sync(logsPath);
        // Create a logger & chow for testing
        logger = new LoggerModule_1.LoggerModule({
            // path: logsPath,
            // persistentLevels: ['silly', 'error'],
            excludeRoutes: [/^\/test$/]
        });
        chow = FakeChow.create().use(logger);
        logger.app = chow;
    });
    describe('#checkEnvironment', () => {
        it('should succeed', async () => {
            logger.checkEnvironment();
        });
    });
    describe('#setupModule', () => {
        it('should create the logs directory', async () => {
            logger.config.path = logsPath;
            await logger.setupModule();
            const stats = fs_1.statSync(logsPath);
            expect(stats.isDirectory()).toBe(true);
        });
        it('should create transports for persistent levels', async () => {
            logger.config.path = logsPath;
            logger.config.persistentLevels = ['silly', 'error'];
            await logger.setupModule();
            expect(logger.logger.transports.filter(isFileTransport)).toHaveLength(2);
        });
        it('should add an error handler', async () => {
            logger.config.enableErrorLogs = true;
            await logger.setupModule();
            expect(chow.errorHandlers).toHaveLength(1);
        });
    });
    describe('#clearModule', () => {
        it('should delete the logger', async () => {
            await logger.setupModule();
            await logger.clearModule();
            expect(logger.logger).toBeUndefined();
        });
    });
    describe('#extendExpress', () => {
        beforeEach(async () => {
            logger.config.path = logsPath;
            logger.config.enableAccessLogs = true;
            // Setup the logger with express
            await logger.setupModule();
            await logger.extendExpress(chow.expressApp);
            // Add 2 fake routes, one of which should be ignored from logs
            chow.expressApp.get('/', (req, res) => res.send('hi'));
            chow.expressApp.get('/test', (req, res) => res.send('hi 2'));
        });
        it('should add access logging middleware', async () => {
            await supertest_1.default(chow.expressApp).get('/');
            let contents = fs_1.readFileSync(path_1.join(logsPath, 'debug.log'), 'utf8');
            expect(contents.length).toBeGreaterThan(0);
        });
        it('should log non-excluded routes', async () => {
            await supertest_1.default(chow.expressApp).get('/test');
            let contents = fs_1.readFileSync(path_1.join(logsPath, 'debug.log'), 'utf8');
            expect(contents.length).toBe(0);
        });
    });
    describe('#extendEndpointContext', () => {
        it('should add the logger', async () => {
            await logger.setupModule();
            let ctx = logger.extendEndpointContext();
            expect(ctx.logger).toBeDefined();
        });
    });
});
//# sourceMappingURL=LoggerModule.spec.js.map