#! /usr/bin/env node

const fs = require("fs");
const pm2 = require("pm2");
const shelljs = require("shelljs");

const command = process.argv[2];

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
else if (command === "start") {

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

      shelljs.exec('tail -f logs/*', function(code, stdout, stderr) {
        console.log('Exit code:', code);
        console.log('Program output:', stdout);
        console.log('Program stderr:', stderr);
      });

      if (err) { throw err }

    })

  });

}
else if (command === "log") {

  shelljs.exec('tail -f logs/*', function(code, stdout, stderr) {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
  });

}
else if (command === "stop") {
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
else if (command === "reload") {
  pm2.reload("all", function(err) {
    if (err) {
      console.error(err);
      process.exit(2)
    }
    else {
      console.log("RELOADED");
      pm2.disconnect();
      shelljs.exec('tail -f logs/*', function(code, stdout, stderr) {
        console.log('Exit code:', code);
        console.log('Program output:', stdout);
        console.log('Program stderr:', stderr);
      });
    }
  });
}
else if (command === "list") {
  pm2.list(function(err, list) {
    if (err) {
      console.error(err);
      process.exit(2)
    }
    if (list.length !== 1) {
      console.log(list);
    }
    else {
      const p = list[0];
      console.log(`
        PID: ${p.pid}, 
        NAME: ${p.name}, 
        CPU: ${p.monit.cpu} 
        MEMORY: ${p.monit.memory / 1000000}mb
        UPTIME: ${p.pm2_env.pm_uptime}
      `)
    }
    pm2.disconnect();
  });
}
else {
  console.log(command);
}