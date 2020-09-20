const exec = require('child_process').exec;

export default function execute(command, callback = null) {
  exec(command, (error) => {
    if (error != null) {
      callback(error);
    }
  });
};
