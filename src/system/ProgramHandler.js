import FileManager from "./FileManager";
import { scan } from "../helpers/folder";
import execute from "../helpers/execute";
import path from "path";
const fs = require("fs");

class ProgramHandler {
  async getList(type = "json") {
    if (type === "html") {
      // TODO html converter
      const list = await this.readProgramsFromShortcutsFolder();
      
    } else if (type === "json") {
      return await this.readProgramsFromShortcutsFolder();
    }
  }

  async readProgramsFromShortcutsFolder() {
    const items = await scan(FileManager.get("shortcuts"));
    let list = [];
    let uncategorized;
    for (let item of items) {
      if (item.hasOwnProperty("file")) {
        if (!(uncategorized instanceof Category)) {
          uncategorized = new Category("Uncategorized");
        }
        uncategorized.add(item);
      } else if (item.hasOwnProperty("folder")) {
        list.push(new Category(item.name, item.items));
      }
    }
    if (uncategorized != null) list.push(uncategorized);
    return list;
  }

  launch(file) {
    this.prepareCommand(file).then((command) => {
      if (command != null) {
        execute(command);
      }
    });
  }

  prepareCommand(file) {
    return new Promise((resolve, reject) => {
      let command = null;
      switch (process.platform) {
        case "win32":
          command = 'start "" "' + file + '"'; // "" is required, otherwise command execute as cd
          resolve(command);
          break;
        // TODO
        case "linux":
          // check the file has execute permission
          fs.access(file.replace(/(\s+)/g, "$1"), fs.constants.X_OK, (err) => {
            if (err) {
              reject("cannot execute");
            } else {
              command = "gtk-launch " + file.replace(/(\s+)/g, "$1");
              fs.readFile(file.replace(/(\s+)/g, "$1"), function (err, data) {
                if (err) return console.error(err);
                const regex = "/\bExec=(.*)+";
                let execString = data.toString();
                execString = execString.search(regex);
              });
            }
          });
          break;
        // TODO
        case "darwin":
          break;
      }
      if (command !== null) {
        resolve(command);
      } else {
        reject("OS not supported");
      }
    });
  }
}

class Category {
  constructor(name, items) {
    this.name = name;
    this.items = [];
    if (items != null) {
      for (let item of items) {
        this.add(item);
      }
    }
  }
  add(item) {
    if (item instanceof Program) {
      this.items.push(item);
    } else {
      if (item.hasOwnProperty("file") && item.file === true) {
        this.items.push(new Program(item));
      } else if (item.hasOwnProperty("folder") && item.folder === true) {
        this.items.push(new Category(item.name, item.items));
      }
    }
  }
}

class Program {
  constructor(item) {
    if (item !== null && item.hasOwnProperty("file") && item.file === true) {
      this.name = item["name"];
      this.ext = item["ext"];
      this.image = path.join(FileManager.get("images"), item["name"] + ".jpg");
      this.exePath = item["fullpath"];
    } else {
      console.log("incompatible");
      throw new Error(file);
    }
  }
}

export default new ProgramHandler();
