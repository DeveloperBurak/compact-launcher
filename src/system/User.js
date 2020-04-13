import Steam from "./Steam";

class User {
  constructor() {

  }

  // TODO make more program support. we use only steam for now
  check() {

  }

  async read(file) {
    fs.readFile(file, {encoding: 'utf-8'}, function (err, data) {
      if (!err) {
        return data;
      } else {
        console.log(err);
      }
    });
  }

  async getSteamUser() {
    return new Promise((resolve, reject) => {
      Steam.getInstalledPath().then(path => {
        resolve(path);
      })
    });
  }

  set() {

  }
}

export default new User();
