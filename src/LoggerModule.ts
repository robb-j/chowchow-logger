import { Module, ChowChow } from '@robb_j/chowchow'
import { Application } from 'express'
import winston from 'winston'
import { mkdirSync } from 'fs'

const allowedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly']

type LoggerConfig = {
  path: string
  logHttpAccess?: boolean
  excludeRoutes?: RegExp[]
}

export type LoggerContext = {
  logger: winston.Logger
}

export class LoggerModule implements Module {
  config: LoggerConfig
  app: ChowChow = null as any
  logger: winston.Logger = null as any

  get logLevel() {
    return (process.env.LOG_LEVEL || 'error').toLowerCase()
  }

  constructor(config: LoggerConfig) {
    this.config = config
  }

  checkEnvironment() {
    if (!allowedLogLevels.includes(this.logLevel)) {
      throw new Error(`Invalid LOG_LEVEL '${this.logLevel}'`)
    }
  }

  setupModule() {
    const allLevels = winston.config.npm.levels
    const current = winston.config.npm.levels[this.logLevel]

    try {
      mkdirSync(this.config.path)
    } catch (error) {}

    const logs = ['error', 'warn', 'info', 'debug']

    let fileTransports = logs.map(
      loggingLevel =>
        new winston.transports.File({
          filename: `${loggingLevel}.log`,
          dirname: this.config.path,
          level: loggingLevel,
          silent: current < allLevels[loggingLevel]
        })
    )

    this.logger = winston.createLogger({
      level: this.logLevel,
      format: winston.format.json(),
      transports: [
        ...fileTransports,
        new winston.transports.Console({
          level: this.logLevel,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    })
  }

  clearModule() {
    delete this.logger
  }

  extendExpress(server: Application) {
    const { logHttpAccess = false, excludeRoutes = [] } = this.config

    // Don't add logging middleware if not cofigured
    if (!logHttpAccess) return

    server.use((req, res, next) => {
      // If the uri matches an exclusion, don't log it
      if (excludeRoutes.some(regex => regex.test(req.path))) return next()

      // Log the request
      this.logger.info(`${req.method.toLowerCase()}: ${req.path}`, {
        date: new Date().toISOString(),
        query: req.query
      })

      next()
    })
  }

  extendEndpointContext(): LoggerContext {
    return {
      logger: this.logger
    }
  }
}
