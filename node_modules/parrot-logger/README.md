<div
  align="center"
>

![ParrotLogger](https://github.com/InkoHX/parrot-logger/blob/master/media/ParrotLogger.png?raw=true)

![CI](https://github.com/InkoHX/parrot-logger/workflows/CI/badge.svg)
![LICENCE](https://img.shields.io/github/license/InkoHX/logger-renew?label=LICENCE&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/InkoHX/logger-renew)

</div>

## Screenshots

![Console](https://github.com/InkoHX/parrot-logger/blob/master/media/console.png?raw=true)
![log file](https://github.com/InkoHX/parrot-logger/blob/master/media/log-file.png?raw=true)

## Description

Lightweight logger module.

## Install

### npm

```bash
npm i parrot-logger
```

### Yarn

```bash
yarn add parrot-logger
```

## Usage

```ts
import Logger from 'parrot-logger'

const logger = new Logger({
  console: {
    type: {
      DEBUG: true
    }
  }
})

logger
  .info('Hello')
  .warn('World')
  .error(new Error('oof'))
  .debug('Not displayed on console by default.')
```

## Default Logger Options

Look at [this](https://github.com/InkoHX/parrot-logger/blob/master/src/index.ts#L36-#L79)
