import { LoggerModule } from '../LoggerModule'
import { join } from 'path'
import rimraf from 'rimraf'
import { statSync, readFileSync } from 'fs'
import winston from 'winston'
import { ChowChow, ChowChowInternals } from '@robb_j/chowchow'
import supertest from 'supertest'

const logsPath = join(__dirname, 'test_logs')
const isFileTransport = (some: any) => some instanceof winston.transports.File

class FakeChow extends ChowChow {
  async startServer() {}
  async stopServer() {}
}

describe('LoggerModule', () => {
  let logger: LoggerModule
  let chow: FakeChow & ChowChowInternals

  beforeEach(() => {
    // Let everything be logged
    process.env.LOG_LEVEL = 'silly'

    // Clean the test logs dir
    rimraf.sync(logsPath)

    // Create a logger & chow for testing
    logger = new LoggerModule({
      // path: logsPath,
      // persistentLevels: ['silly', 'error'],
      excludeRoutes: [/^\/test$/]
    })
    chow = FakeChow.create().use(logger) as any
    logger.app = chow
  })

  describe('#checkEnvironment', () => {
    it('should succeed', async () => {
      logger.checkEnvironment()
    })
  })

  describe('#setupModule', () => {
    it('should create the logs directory', async () => {
      logger.config.path = logsPath
      await logger.setupModule()
      const stats = statSync(logsPath)
      expect(stats.isDirectory()).toBe(true)
    })
    it('should create transports for persistent levels', async () => {
      logger.config.path = logsPath
      logger.config.persistentLevels = ['silly', 'error']
      await logger.setupModule()
      expect(logger.logger.transports.filter(isFileTransport)).toHaveLength(2)
    })
    it('should add an error handler', async () => {
      logger.config.enableErrorLogs = true
      await logger.setupModule()
      expect(chow.errorHandlers).toHaveLength(1)
    })
  })

  describe('#clearModule', () => {
    it('should delete the logger', async () => {
      await logger.setupModule()
      await logger.clearModule()
      expect(logger.logger).toBeUndefined()
    })
  })

  describe('#extendExpress', () => {
    beforeEach(async () => {
      logger.config.path = logsPath
      logger.config.enableAccessLogs = true

      // Setup the logger with express
      await logger.setupModule()
      await logger.extendExpress(chow.expressApp)

      // Add 2 fake routes, one of which should be ignored from logs
      chow.expressApp.get('/', (req, res) => res.send('hi'))
      chow.expressApp.get('/test', (req, res) => res.send('hi 2'))
    })
    it('should add access logging middleware', async () => {
      await supertest(chow.expressApp).get('/')

      let contents = readFileSync(join(logsPath, 'debug.log'), 'utf8')
      expect(contents.length).toBeGreaterThan(0)
    })
    it('should log non-excluded routes', async () => {
      await supertest(chow.expressApp).get('/test')

      let contents = readFileSync(join(logsPath, 'debug.log'), 'utf8')
      expect(contents.length).toBe(0)
    })
  })

  describe('#extendEndpointContext', () => {
    it('should add the logger', async () => {
      await logger.setupModule()
      let ctx = logger.extendEndpointContext()
      expect(ctx.logger).toBeDefined()
    })
  })
})
