"use strict";
const cds = require("@sap/cds");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const morganBody = require("morgan-body");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const supplierRouters = require("./routes/suppliers.routes");
// const cors = require("cors");
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

    app.use(proxy());
    morganBody(app);
    app.use(
      morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
      )
    );
    // app.use(cors()); // allow to be called from e.g. editor.swagger.io
  })
  .on("serving", (service) => {
    const apiPath = "/api-docs" + service.path;
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
    // addLinkToIndexHtml(service, apiPath);
  });

async function toOpenApiDoc(service, cache) {
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
}

async function openApiFromFile(service) {
  const fileName = resolve(`../docs/${service.name}.openapi3.json`);

  const file = await readFile(fileName).catch(() => {
    /*no such file*/
  });
  if (file) {
    debug && debug("Using Open API spec from file", fileName);
    return JSON.parse(file);
  }
}

function addLinkToIndexHtml(service, apiPath) {
  const provider = (entity) => {
    if (entity) return; // avoid link on entity level, looks too messy
    return { href: apiPath, name: "Swagger UI", title: "Show in Swagger UI" };
  };
  // Needs @sap/cds >= 4.4.0
  service.$linkProviders
    ? service.$linkProviders.push(provider)
    : (service.$linkProviders = [provider]);
}

cds.on("listening", (app) => {
  cds.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  cds.app.use(bodyParser.json({ limit: "50mb" }));
  cds.app.use("/api/v1/suppliers", supplierRouters);
});

module.exports = cds.server;
