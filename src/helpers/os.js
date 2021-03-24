export const isWindows = () => {
  return process.platform == 'win32'
}

export const isLinux = () => {
  return process.platform == 'linux'
}

export const isMac = () => {
  return process.platform == 'darwin'
}
