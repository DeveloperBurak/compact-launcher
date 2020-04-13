const exec = require('child_process').exec;

export default function execute(command, callback) {
  exec(command, (error, stdout, stderr) => {
    callback(stdout);
  });
};
