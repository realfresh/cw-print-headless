#! /usr/bin/env node

const fs = require("fs");
const shelljs = require("shelljs");
const path = require("path");
const pm2 = require("pm2");

const command = process.argv[2];
const user = process.argv[3];

function handleError(e) {
  console.error(e);
  process.exit(2);
}

if (command === "init") {
  fs.writeFileSync("./config.json", JSON.stringify({
    copies: 1,
    api_url: "https://api.cloudwaitress-test.com",
    api_key: "",
    printers: [
      "FK80"
    ]
  }, null, 2));
  console.log("CONFIG FILE CREATED");
}
else if (command === "startup") {
  const script = path.join(__dirname, "index.sh");
  const cwd = process.cwd();
  shelljs.exec(`${script} startup ${cwd} ${__dirname} ${user}`, function(code, stdout, stderr) {
    // console.log('Exit code:', code);
  });
}
else if (command === "start") {

  /*
  process.env.DEBUG = "ERROR,WARN,INFO,DEV,PRINT-SERVICE,PRINTER";
  const service = path.join(__dirname, "index-service.js");
  require(service);
  */

  const script = path.join(__dirname, "index-service.js");

  pm2.connect(function(err) {
    if (err) {
      handleError(err)
    }
    pm2.start({
      name: "printing",
      script    : script,         // Script to be run
      exec_mode : 'fork',        // Allows your app to be clustered
      max_memory_restart : '100M',   // Optional: Restarts your app if it reaches 100Mo
      output: "~/.pm2/logs/printing-out.log",
      error: "~/.pm2/logs/printing-out.log",
      env: {
        DEBUG: "ERROR,WARN,INFO,DEV,PRINT-SERVICE,PRINTER"
      },
    }, function(err, apps) {
      pm2.disconnect();   // Disconnects from PM2
      if (err)
        throw err
    });
  });

}
else if (command === "reload") {
  pm2.reload("printing", (err) => {
    if (err) {
      handleError(err);
    }
    process.exit(0);
  });
}
else if (command === "stop") {
  pm2.delete("printing", (err) => {
    if (err) {
      handleError(err);
    }
    process.exit(0);
  });
}
else if (command === "list") {
  pm2.describe("printing", (err, description) => {
    if (err) {
      handleError(err);
    }
    else {
      console.log(description);
      process.exit(0);
    }
  });
}
else if (command === "flush") {
  shelljs.exec(`rm -rf ~/.pm2/logs/printing-out.log`, function(code, stdout, stderr) {
    // console.log('Exit code:', code);
  });
}
else if (command === "log") {
  shelljs.exec(`tail -f -n 500 ~/.pm2/logs/printing-out.log`, function(code, stdout, stderr) {
    // console.log('Exit code:', code);
  });
}
else if (command === "help") {
  console.log(`
    COMMANDS
    -----
    startup | start | reload | stop | list | flush | log
  `);
}
else {
  console.log(command);
}