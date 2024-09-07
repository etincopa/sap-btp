sap.ui.define(["mif/cp/fraccionamiento/util/http"], function (http) {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    iniciarPuertoCom: async function (oTransaccion) {
      let oPath = new URI(this.oServiceModel.sServiceUrl);
      let sUrl = "http://localhost:9002/SerialPort/";

      var self = this;
      return new Promise(function (resolve, reject) {
        $.ajax({
          crossDomain: true,
          url: sUrl,
          method: "POST",
          header: {
            accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          data: JSON.stringify(oTransaccion),
          async: true,
          contentType: "application/json",
          success: function (result) {
            if (typeof result === "string") {
              result = JSON.parse(result);
            }
            resolve(result);
          },
          error: function (error) {
            reject(error);
          },
        });
      });

      //const result = await http.httpPost(sUrl, oTransaccion);
      //return result;
    },
    detenerPuertoCom: async function (sPuertoCom) {
      let oPath = new URI(this.oServiceModel.sServiceUrl);
      let sUrl =
        "http://" + oPath.host() + "/detenerPuertoCom?sPuertoCom=" + sPuertoCom;

      const result = await http.httpGet(sUrl);
      return result;
    },
    leerPuertoCom: async function () {
      let oPath = new URI(this.oServiceModel.sServiceUrl);
      let sUrl = "http://" + oPath.host() + "/leerPuertoCom";

      const result = await http.httpGet(sUrl);
      return result;
    },
  };
});
