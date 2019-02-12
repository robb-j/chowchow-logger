# Chow Chow | Logger

Provides logging to [chowchow](https://github.com/robb-j/chowchow)
using [winston](https://npmjs.org/package/winston) with npm logging levels.

```ts
// An example endpoint using the logger
export async function listProducts({ req, res, logger }: Context) {
  if (!req.query.token) {
    logger.error('Unauthenticated session')
  } else {
    logger.info('Authenticated', { token: req.query.token })
  }

  try {
    let products = await fetchProducts()
    logger.debug(`Found ${products.length} product(s)`)
    res.send({ products })
  } catch (error) {
    logger.error(error.message)
    res.status(500).send({ msg: 'Something went wrong' })
  }
}
```

Here is how you set it up:

```ts
import { ChowChow, BaseContext } from '@robb_j/chowchow'
import { LoggerModule, LoggerContext } from '@robb_j/chowchow-logger'

type Context = BaseContext & LoggerContext
;(async () => {
  let chow = ChowChow.create<Context>()

  chow.use(new LoggerModule({ path: 'path/to/logs' }))

  await chow.start()
})()
```

## Features

- Adds `logger` to the context, a `winston.Logger` instance
  - Save logs to the path specified by `path` option
  - Configure what is logged with `LOG_LEVEL` env variable
  - Logs are written to different files in your log folder
- Optionally log http requests by passing `enableAccessLogs`
  - Exclude routes using `excludeRoutes` parameter, tested against `req.path`
- Optionally log errors from http requests by passing `enableErrorLogs`
- Has different levels of logging, using winston's [npm levels](https://github.com/winstonjs/winston#logging-levels)
- Configure which levels are written to files in your log folder by passing `persistentLevels`
  - Defaults to write `error`, `warn`, `info` and `debug` to their own files
  - Following `winston`, logs levels are inherited so higher levels are included in the lower ones.
    E.g. `info` logs will include all `warn` and `error` messages.

## Environment variables

Set the `LOG_LEVEL` environment variable to configure which log levels are processed.

For example, if it is set to `error`, only error messages will be logged and written to files.
All logs at and under the level you set will be logged, so if you want everything set it to `silly`.

For more see: [npm logging levels](https://github.com/winstonjs/winston#using-logging-levels)

## Configuration

There is one required constructor parameter:

- `path: string` - This is the path to a folder where your logs will be stored. The folder will be created if it doesn't exist.

There are also option parameters to enabled additional features:

- `enableAccessLogs: boolean` – Turn on http traffic logging (default: `false`)
- `excludeRoutes: RegExp[]` – An array of RegExps to match paths you don't want to log (default: `[]`)
- `enableErrorLogs: boolean` – Turn on error logging, logs errors caught inside endpoints (default: `false`)
- `persistentLevels: string[]` – Which log levels you want to be written to files (default: `error, warn, info, debug`)

## Dev Commands

```bash
# Run the app in dev mode
npm run dev:once

# Run in dev mode and restart on file changes
npm run dev:watch

# Lint the source code
npm run lint

# Manually format code
# -> This repo runs prettier on git-stage, so committed code is always formatted
npm run prettier

# Run the unit tests
npm test

# Generate code coverage in coverage/
npm run coverage
```
