// MAIN APP SERVICE
require("babel-polyfill");
const fs = require('fs');
const AppService = require('cw-print-service').default;
const Raven = require('raven');

Raven.config('https://725ebc27db5f4f15b6ded0a61c5d7476@sentry.io/1217454', {
  autoBreadcrumbs: true,
  captureUnhandledRejections: true,
}).install();

Raven.context(() => {

  if (!fs.existsSync("./save-folder")){
    fs.mkdirSync("./save-folder");
  }

  const config = JSON.parse(fs.readFileSync("./config.json"));

  const isProduction = process.env.NODE_ENV == "production";

  const Service = new AppService({
    operating_system: "linux",
    path_save_folder: "./save-folder",
    api_url_base_64: isProduction ?
      "https://api.cloudwaitress.com/printing/client/order-to-pdf" :
      "http://localhost:3010/printing/client/order-to-pdf",
    api_url_ably_auth: isProduction ?
      "https://api.cloudwaitress.com/printing/client/token-request" :
      "http://localhost:3010/printing/client/token-request",
  });

  Service.set_config({
    printers: config.printers,
    api_key: config.api_key,
  });

  Service.on("error", e => {
    console.log(e);
    Raven.captureException(e);
  });

  Service.start();

});