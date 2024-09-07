"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const port = process.env.PORT || 4004;
const { urlencoded, json } = require('body-parser');
var device = require('express-device');

//cds.on("bootstrap", app => app.use(proxy()));
cds.on("bootstrap", app => {
    cds.app.use(urlencoded({ extended: true }));
    //app.use(cors());
    //cds.app.use(json());
    //cds.app.use('/api/v1/cp', cpRoutes());
    app.use(proxy({
        path: "v2",
        port: port
    }));
    app.use(device.capture());
});

module.exports = cds.server;