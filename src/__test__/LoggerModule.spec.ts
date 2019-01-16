import { LoggerModule } from '../LoggerModule'

describe('LoggerModule', () => {
  let logger: LoggerModule
  beforeEach(() => {
    logger = new LoggerModule({ path: 'logs' })
  })

  it('should exist', async () => {
    expect(logger).toBeDefined()
  })
})
