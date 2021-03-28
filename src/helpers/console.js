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
