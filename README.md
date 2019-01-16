# Chow Chow | Logger

Provides logging to [chowchow](https://github.com/robb-j/chowchow)
using [winston](https://npmjs.org/package/winston).

```ts
import { ChowChow, BaseContext } from '@robb_j/chowchow'
import { LoggerModule, LoggerContext } from '@robb_j/chowchow-logger'

type Context = BaseContext & LoggerContext
;async () => {
  let chow = ChowChow.create()

  chow.use(new LoggerModule({ path: 'path/to/logs' }))

  await chow.start()
}
```

## Features

- Adds `logger` to the context, a `winston.Logger` instance
  - Save logs to the path specified by `path` option
  - Configure logging level with `LOG_LEVEL` env variable
  - Logs are written to different files in your log folder
- Optionally log http requests by passing `enableAccessLogs`
  - Exclude routes using `excludeRoutes` parameter, tested against `req.path`

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
