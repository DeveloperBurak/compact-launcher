/* eslint-disable max-classes-per-file */
import path from 'path';
import { scan } from '../helpers/folder';
import { getPathOf } from './FileManager';

class Program {
  constructor(item) {
    if (item !== null && item.file && item.file === true) {
      this.name = item.name;
      this.ext = item.ext;
      this.image = path.join(getPathOf('images'), `${item.name}.jpg`);
      this.exePath = item.fullpath;
    }
  }
}
class Category {
  constructor(name, items) {
    this.name = name;
    this.items = [];
    if (items != null) {
      for (const item of items) {
        this.add(item);
      }
    }
  }

  add = (item) => {
    if (item instanceof Program) {
      this.items.push(item);
    } else if (item.file) {
      this.items.push(new Program(item));
    } else if (item.folder && item.folder === true) {
      this.items.unshift(new Category(item.name, item.items));
    }
  };
}

export default class ListUI {
  static getList = async (type = 'json') => {
    if (type === 'html') {
      return ListUI.toHtml(await ListUI.readProgramsFromShortcutsFolder());
    }

    if (type === 'json') {
      return ListUI.readProgramsFromShortcutsFolder();
    }

    throw new Error('invalid type');
  };

  static readProgramsFromShortcutsFolder = async () => {
    const items = await scan(getPathOf('shortcuts'));
    const list = [];
    let uncategorized;
    for (const item of items) {
      if (item.file) {
        if (!(uncategorized instanceof Category)) {
          uncategorized = new Category('Uncategorized');
        }
        uncategorized.add(item);
      } else if (item.folder) {
        list.push(new Category(item.name, item.items));
      }
    }
    if (uncategorized != null) list.push(uncategorized);
    return list;
  };

  static toHtml = (list) => {
    let html = '';
    if (list != null && list.length > 0) {
      for (const item of list) {
        html += ListUI.generateList(item);
      }
    }
    return html;
  };

  static generateList = (category, inner = false, level = 0) => {
    let html = '';
    if (category != null) {
      html += `<li key="${category.name}" style="padding-left:${level === 0 ? 0 : '0.375rem'} ">
      <button class="btn list dropdown-button secondary-bg">${category.name}</button>
      <ul class="dropdown-list${inner === true ? ' inner' : ''}" style="padding-left:"${15 * level}px">`;
      if (category.items !== null) {
        category.items.forEach((item) => {
          if (item instanceof Category) {
            html += ListUI.generateList(item, true, level + 1);
          } else if (item instanceof Program) {
            html += ListUI.renderButton(item);
          }
        });
      }
      html += '</ul></li>';
    }
    return html;
  };

  static renderButton = (program) => `<li class="program-cover">
          <button class="btn program col-sm-11" programName="${program.name}" image="${program.image}" execute="${program.exePath}">
            <p class="float-left theme-text">${program.name}</p>
          </button>
          <button class="btn delete-program col-sm-1 float-right primary-bg theme-text" del="${program.exePath}">X</button>
        </li>`;
}
