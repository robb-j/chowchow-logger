"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoggerModule_1 = require("../LoggerModule");
describe('LoggerModule', () => {
    let logger;
    beforeEach(() => {
        logger = new LoggerModule_1.LoggerModule({ path: 'logs' });
    });
    it('should exist', async () => {
        expect(logger).toBeDefined();
    });
});
//# sourceMappingURL=LoggerModule.spec.js.map