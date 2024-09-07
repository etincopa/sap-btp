"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const port = process.env.PORT || 4004;
const cors = require("cors");
const { urlencoded, json } = require("body-parser");
//const cpRoutes = require("./api/index");
//const routerSrv = require('./api/routes/router');

/**
 * SCHEDULER
 */
const scheduler = require("./scheduler");

/**
 * OPENAPI - SWAGGER
 */
const swaggerUi = require("swagger-ui-express");
const { resolve } = require("path");
const { promisify } = require("util");
const readFile = promisify(require("fs").readFile);
const debug = cds.debug("openapi");

let app,
  docCache = {};

cds
  .on("bootstrap", (_app) => {
    app = _app;
    cds.app.use(urlencoded({ extended: true }));
    //TODO: EMD revisar la aplicacion ElectronJS para que soporte CORS
    /*app.use(proxy());
    morganBody(app);
    app.use(
      morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
      )
    );*/
    /* cds.app.use("/api/v1/cp", cpRoutes());
    app.use(
      proxy({
        path: "v2",
        port: port,
      })
    ); */
  })
  .on("serving", (service) => {
    /**
     * openapi - Swagger
     * Ejecutar comando:
     *  - cds compile srv --service all -o docs --to openapi
     */
    /* const apiPath = "/api-docs" + service.path;
    console.log(`[Open API] - serving ${service.name} at ${apiPath}`);
    app.use(
      apiPath,
      async (req, _, next) => {
        req.swaggerDoc = await toOpenApiDoc(service, docCache);
        next();
      },
      swaggerUi.serve,
      swaggerUi.setup()
    );
    addLinkToIndexHtml(service, apiPath); */
  });
/*
cds.on("listening", app => {

    // Custom Express Routes
    cds.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    cds.app.use(bodyParser.json({ limit: "50mb" }));
    cds.app.use("/api/v1/cp", routerSrv);
});
*/
cds.once("listening", () => scheduler.runJob()); //Remove comment to deploy

/* async function toOpenApiDoc(service, cache) {
  if (!cache[service.name]) {
    const spec = await openApiFromFile(service);
    if (spec) {
      // pre-compiled spec file available?
      cache[service.name] = spec;
    }
    // On-the-fly exporter available?  Needs @sap/cds-dk >= 3.3.0
    else if (cds.compile.to.openapi) {
      debug && debug("Compiling Open API spec for", service.name);
      cache[service.name] = cds.compile.to.openapi(service.model, {
        service: service.name,
        "openapi:url": service.path,
        "openapi:diagram": true,
      });
    }
  }
  return cache[service.name];
} */


module.exports = cds.server;
