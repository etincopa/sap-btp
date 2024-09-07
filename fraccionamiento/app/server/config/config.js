const fs = require("fs");
const rootPath = require('electron-root-path').rootPath;
exports.getConfig = function () {
  if (!global.config) {
    let rawConfig = fs.readFileSync(rootPath + "/app/server/server-config.json");
    let config = JSON.parse(rawConfig);
    global.config = config[config.ambiente];
  }

  return global.config;
};
