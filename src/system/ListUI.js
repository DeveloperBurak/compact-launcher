import path from 'path'
import { scan } from '../helpers/folder'
import FileManager from './FileManager'

class ListUI {
  async getList(type = 'json') {
    if (type === 'html') {
      return await this.toHtml(await this.readProgramsFromShortcutsFolder())
    } else if (type === 'json') {
      return await this.readProgramsFromShortcutsFolder()
    }
  }

  async readProgramsFromShortcutsFolder() {
    const items = await scan(FileManager.getPathOf('shortcuts'))
    let list = []
    let uncategorized
    for (let item of items) {
      if (item.hasOwnProperty('file')) {
        if (!(uncategorized instanceof Category)) {
          uncategorized = new Category('Uncategorized')
        }
        uncategorized.add(item)
      } else if (item.hasOwnProperty('folder')) {
        list.push(new Category(item.name, item.items))
      }
    }
    if (uncategorized != null) list.push(uncategorized)
    return list
  }

  toHtml = async (list) => {
    let html = ''
    if (list != null && list.length > 0) {
      for (let i in list) {
        html += this.generateList(list[i])
      }
    }
    return html
  }

  generateList = (category, inner = false, level = 0) => {
    let html = ''
    if (category != null) {
      html += `<li key="${category.name}" style="padding-left: ${20 * level}px">
      <button class="btn list dropdown-button secondary-bg">${category.name}</button>
      <ul class="dropdown-list${inner === true ? ' inner' : ''}" style="padding-left:"${15 * level}px">`
      if (category.items !== null) {
        category.items.map((item) => {
          if (item instanceof Category) {
            html += this.generateList(item, true, level + 1)
          } else if (item instanceof Program) {
            html += this.renderButton(item)
          }
        })
      }
      html += `</ul></li>`
    }
    return html
  }

  renderButton = (program) => {
    return `<li class="program-cover">
          <button class="btn program col-sm-11" programName="${program.name}" image="${program.image}" execute="${program.exePath}">
            <p class="float-left theme-text">${program.name}</p>
          </button>
          <button class="btn delete-program col-sm-1 float-right primary-bg theme-text" del="${program.exePath}">X</button>
        </li>`
  }
}

class Category {
  constructor(name, items) {
    this.name = name
    this.items = []
    if (items != null) {
      for (let item of items) {
        this.add(item)
      }
    }
  }
  add(item) {
    if (item instanceof Program) {
      this.items.push(item)
    } else {
      if (item.hasOwnProperty('file') && item.file === true) {
        this.items.push(new Program(item))
      } else if (item.hasOwnProperty('folder') && item.folder === true) {
        this.items.unshift(new Category(item.name, item.items))
      }
    }
  }
}

class Program {
  constructor(item) {
    if (item !== null && item.hasOwnProperty('file') && item.file === true) {
      this.name = item['name']
      this.ext = item['ext']
      this.image = path.join(FileManager.getPathOf('images'), item['name'] + '.jpg')
      this.exePath = item['fullpath']
    } else {
      console.log('incompatible')
      throw new Error(file)
    }
  }
}

export default ListUI
