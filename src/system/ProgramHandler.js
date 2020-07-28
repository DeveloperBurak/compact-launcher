import File from "./File";
import { scan } from "../helpers/folder";
import execute from "../helpers/execute";
import path from "path";
import { rejects } from "assert";
import { exec } from "child_process";
const fs = require("fs");

class ProgramHandler {
  constructor() {
    this.programs = {};
  }

  async readShortcutFolder() {
    await scan(File.get("shortcuts")).then(async (data) => {
      await this.generateProgram(data).then((processedData) => {
        this.programs["categories"] = processedData;
      });
    });
    return this.programs;
  }

  async generateProgram(data = {}, hasCategory = false) {
    let count = 0;
    if (!hasCategory) {
      data["Uncategorized"] = {
        name: "Uncategorized",
        programs: [],
        manipulated: true,
      };
    }
    for (let item in data) {
      if (data[item].hasOwnProperty("file") && data[item].file === true) {
        if (!hasCategory) {
          data["Uncategorized"]["programs"][count] = Object.assign(
            data[count],
            {
              image: path.join(
                File.get("images"),
                data[count]["name"] + ".jpg"
              ),
              exePath: data[count]["fullpath"],
            }
          );
        } else {
          if (typeof data["programs"] == "undefined") {
            data["programs"] = {};
          }
          data["programs"][count] = Object.assign(data[count], {
            image: path.join(File.get("images"), data[count]["name"] + ".jpg"),
            exePath: data[count]["fullpath"],
          });
        }
        delete data[count];
        count++;
      } else if (
        Object.keys(data[item]).length >= 1 &&
        typeof data[item]["programs"] == "undefined"
      ) {
        data[item] = await this.generateProgram(data[item], true);
        data[item]["name"] = item;
      }
    }
    return data;
  }

  launch(file) {
    this.prepareCommand(file).then((command) => {
      console.log(command);
      if (command != null) {
        execute(command, (output) => {
          console.log(output);
        });
      }
    });
  }

  prepareCommand(file) {
    return new Promise((resolve, reject) => {
      let command = null;
      switch (process.platform) {
        case "win32":
          command = 'start "" "' + file + '"';
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
                // TODO
                const regex = "/\bExec=(.*)+";
                // const regex = "/.*";
                let execString = data.toString();
                execString = execString.search(regex);
                console.log("Sh: " + execString);
              });

              // resolve(command);
            }
          });
          break;
        // TODO
        case "darwin":
          break;
      }
    });
  }
}

export default new ProgramHandler();
