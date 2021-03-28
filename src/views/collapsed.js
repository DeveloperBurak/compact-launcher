import { ipcRenderer } from 'electron'
import { getSetting, moveFile, openExpandWindow } from '../strings/ipc'
import { expandOnHover } from '../strings/settings'
import '../stylesheets/collapsed.css'
import '../stylesheets/main.css'

const expandButton = document.getElementById('expandButton')

ipcRenderer.invoke(getSetting, expandOnHover).then((expandOnHover) => {
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

expandButton.addEventListener('drop', function (e) { // file drop handler
  e.preventDefault() // 
  e.stopPropagation() // 
  let files = []
  for (let f of e.dataTransfer.files) { // get the 
    files.push(f.path)
  }
  ipcRenderer.send(moveFile, files) // send the absolute paths of files to node server for moving
  return false
})
expandButton.addEventListener('dragover', function (e) {
  e.preventDefault()
  e.stopPropagation()
})
