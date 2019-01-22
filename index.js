#! /usr/bin/env node

const fs = require("fs");
const shelljs = require("shelljs");
const path = require("path");

const command = process.argv[2];
const user = process.argv[3];

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
  process.env.DEBUG = "ERROR,WARN,INFO,DEV,PRINT-SERVICE,PRINTER";
  const service = path.join(__dirname, "index-service.js");
  require(service);
}
else {
  console.log(command);
}