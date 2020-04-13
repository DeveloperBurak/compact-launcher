import File from "./File";
import {scan} from "../helpers/folder";
import execute from "../helpers/execute";
import path from "path";


class ProgramHandler {
  constructor() {
    this.programs = {};
  }

  async readShortcutFolder() {
    await scan(File.get('shortcuts')).then(async (data) => {
      await this.generateProgram(data).then(processedData => {
        this.programs['categories'] = processedData;
      });
    });
    return this.programs;
  }

  async generateProgram(data = {}, hasCategory = false) {
    let count = 0;
    if (!hasCategory) {
      data['Uncategorized'] = {name: "Uncategorized", programs: [], "manipulated": true};
    }
    for (let item in data) {
      if (data[item].hasOwnProperty('file') && data[item].file === true) {
        if (!hasCategory) {
          data['Uncategorized']['programs'][count] = Object.assign(data[count], {image: File.get('images'), exePath: data[count]['fullpath']});
        } else {
          if (typeof data['programs'] == 'undefined') {
            data['programs'] = {};
          }
          data['programs'][count] = Object.assign(data[count], {image: path.join(File.get('images'), data[count]['name'] + '.jpg'), exePath: data[count]['fullpath']});
        }
        delete data[count];
        count++;
      } else if (Object.keys(data[item]).length >= 1 && typeof data[item]['programs'] == 'undefined') {
        data[item] = await this.generateProgram(data[item], true);
        data[item]['name'] = item;
      }
    }
    return data;
  }

  launch(file) {
    const command = 'start "" "' + file+'"';
    execute(command, (output) => {
      console.log(output);
    });
  }
}

export default new ProgramHandler();

