import { ipcRenderer } from 'electron'
import { getSetting, moveFile, openExpandWindow } from '../helpers/ipcActions'
import { expandOnHover } from '../helpers/settingKeys'
import '../stylesheets/collapsed.css'
import '../stylesheets/main.css'

const expandButton = document.getElementById('expandButton')

ipcRenderer.invoke(getSetting, expandOnHover).then((expandOnHover) => {
  console.log(expandOnHover);
  if (expandOnHover === true) {
    let openingTimeout = null
    expandButton.addEventListener('mouseleave', () => {
      clearTimeout(openingTimeout) // if user gets there by accidently, don't expand the screen immediatly
      openingTimeout = null
    })
    expandButton.addEventListener('mouseenter', () => {
      openingTimeout = setTimeout(() => {
        expand()
      }, 250)
    })
  } else {
    expandButton.addEventListener('click', () => {
      expand()
    })
  }
})

function expand() {
  document.getElementById('rocket').classList.add('launch') // rocket launch animation
  ipcRenderer.send(openExpandWindow)
}

expandButton.addEventListener('drop', function (e) {
  e.preventDefault()
  e.stopPropagation()
  let files = []
  for (let f of e.dataTransfer.files) {
    files.push(f.path)
  }
  ipcRenderer.send(moveFile, files)
  return false
})
expandButton.addEventListener('dragover', function (e) {
  e.preventDefault()
  e.stopPropagation()
})
