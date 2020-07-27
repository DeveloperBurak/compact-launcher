const exec = require('child_process').exec;

export default function execute(command, callback) {
  exec(command, (error) => {
    if (error != null) {
      callback(error);
    }
  });
};
