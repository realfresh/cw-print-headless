require("babel-polyfill");

const fs = require("fs");
const AppService = require("cw-print-service").AppService;
const Sentry = require("@sentry/node");

// INIT ERROR TRACKING
Sentry.init({
  dsn: "https://725ebc27db5f4f15b6ded0a61c5d7476@sentry.io/1217454",
  enabled: true,
});

// CREATE SAVE FOLDER
if (!fs.existsSync("./save-folder")){
  fs.mkdirSync("./save-folder");
}

// READ CONFIG
let {
  copies,
  api_url,
  api_key,
  printers
} = JSON.parse(fs.readFileSync("./config.json", "utf8"));

console.log( copies, api_url, api_key, printers );

// CHECK CONFIG
if (!api_key) {
  throw new Error("No API key present")
}

api_url = api_url || "https://api.cloudwaitress-test.com";

// INIT SERVICE
const Service = new AppService({
  os: "linux",
  copies: copies,
  paths: {
    print_cli: "",
    gm: "",
    save: "./save-folder",
  },
  api: {
    receipt_image: `${api_url}/printing/client/order-to-image`,
    receipt_pdf: `${api_url}/printing/client/order-to-pdf`,
    ably_auth: `${api_url}/printing/client/token-request`,
  },
});

// SET PRINTER AND OPTIONS
Service.set_config({
  printers: printers,
  api_key: api_key,
  copies: copies,
});

// LISTEN ERRORS
Service.on("error", e => {
  console.log(e);
  Sentry.captureException(e);
});

// START
Service.start();