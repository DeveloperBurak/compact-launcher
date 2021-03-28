import env from 'env'
export const isDev = () => {
  return env.name === 'development'
}

export const isTesting = () => {
  return env.name === 'testing'
}

export const isProduction = () => {
  return env.name === 'production'
}
