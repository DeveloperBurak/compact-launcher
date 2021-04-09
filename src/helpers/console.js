import { isDev } from './env'

export function devLog(...log) {
  if (isDev()) {
    if (log.length === 1) {
      console.log(log[0])
    } else {
      for (let i in log) {
        console.log(log[i])
      }
    }
  }
}

export function errorLog(...log) {
  if (isDev()) {
    if (log.length === 1) {
      console.log(`\x1b[31m\x1b[40m${log[0]}`)
    } else {
      for (let i in log) {
        console.log(`\x1b[31m\x1b[40m${log[i]}`)
      }
    }
  }
}
