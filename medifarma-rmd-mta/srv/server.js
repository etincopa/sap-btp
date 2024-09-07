// "use strict";

// const cds = require("@sap/cds");
// const proxy = require("@sap/cds-odata-v2-adapter-proxy");

// cds.on("bootstrap", app => {app.use(proxy())});

// module.exports = cds.server;
"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const port = process.env.PORT || 4004;
const cors = require('cors');
const { urlencoded, json } = require('body-parser');
var device = require('express-device');
const cpRoutes = require('./api/index');
const jobSchedule = require('./api/schedule/trigger');


cds.on('served',()=>{
    jobSchedule();
});

cds.on("listening", () => {
    cds.app.use(urlencoded({limit: '50mb', extended: true}));
    cds.app.use(json({limit: '50mb'}));
    cds.app.use(cors());
    cds.app.use('/api/v1/rmd', cpRoutes());
    // cds.app.use('/getRMD', cpRoutes());
    cds.app.use(proxy());
    // app.use(device.capture());
});
module.exports = cds.server;