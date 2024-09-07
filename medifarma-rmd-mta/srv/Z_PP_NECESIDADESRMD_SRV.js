const axios = require("axios");
const { readDestination } = require("sap-cf-destconn");
const xsenv = require("@sap/xsenv");

// const DEST_NAME = "S4H_HTTP_BASIC_CP";
const BASE_URI = "/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV";

const cds = require("@sap/cds");
cds.env.features.fetch_csrf = true; //'x-csrf-token': 'required'
module.exports = cds.service.impl(async function () {
  const { OrdenSet,ProduccionVSet,CaracteristicasSet } = this.entities;
  
  const service = await cds.connect.to("Z_PP_NECESIDADESRMD_SRV");
  this.on("READ", OrdenSet, (req) => {
    return service.tx(req).run(req.query);
  });
  this.on("READ", ProduccionVSet, (req) => {
    return service.tx(req).run(req.query);
  });
  this.on("READ", CaracteristicasSet, (req) => {
    return service.tx(req).run(req.query);
  });

  //# ------------------------------------------------------------
  //#   CUSTOM METHODS POST:  ACTION
  //# ------------------------------------------------------------

  //# ------------------------------------------------------------
  //#   CUSTOM METHODS GET:  FUNCTION
  //# ------------------------------------------------------------
});
