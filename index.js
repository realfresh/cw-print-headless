#! /usr/bin/env node

const fs = require("fs");
const pm2 = require("pm2");

const command = process.argv[2];

console.log(command);

if (command === "init") {

  fs.writeFileSync("./config.json", JSON.stringify({
    copies: 1,
    api_url: "http://api.cloudwaitress-test.com",
    api_key: "",
    printers: [
      "FK80"
    ]
  }, null, 2));

  console.log("CONFIG FILE CREATED");

}

if (command === "start") {

  pm2.connect(function(err) {

    if (err) {
      console.error(err);
      process.exit(2)
    }

    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }

    const now = Date.now();

    fs.readdir("./logs", (err, files) => {
      files.forEach(file => {
        const created = parseInt(file, 10);
        if (now > (created + (1000 * 60 * 60 * 24 * 5))) {
          const f = `./logs/${file}`;
          console.log("CLEANING OLD LOG FILE", f);
          fs.unlinkSync(f);
        }
      });
    });

    pm2.start({
      script: __dirname + "/index-service.js",
      error: `./logs/${now}`,
      output: `./logs/${now}`,
      env: {
        DEBUG: "ERROR,WARN,INFO,DEV,PRINT-SERVICE,PRINTER"
      }
    }, (err, apps) => {
      console.log("STARTED");
      pm2.disconnect();
      if (err) { throw err }
    })

  });

}

if (command === "stop") {
  pm2.killDaemon(function(err) {
    if (err) {
      console.error(err);
      process.exit(2)
    }
    else {
      console.log("STOPPED");
      pm2.disconnect();
      process.exit(0);
    }
  });
}

if (command === "reload") {
  pm2.reload("all", function(err) {
    if (err) {
      console.error(err);
      process.exit(2)
    }
    else {
      console.log("RELOADED");
      pm2.disconnect();
    }
  });
}

if (command === "list") {
  pm2.list(function(err, list) {
    if (err) {
      console.error(err);
      process.exit(2)
    }
    console.log(list);
    pm2.disconnect();
  });
}