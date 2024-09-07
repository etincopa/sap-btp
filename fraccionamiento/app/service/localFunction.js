sap.ui.define(
  ["mif/cp/fraccionamiento/util/http", "mif/cp/fraccionamiento/util/oData"],
  function (http, oData) {
    "use strict";
    return {
      oServiceModel: null,
      init: function (oServiceModel) {
        this.oServiceModel = oServiceModel;
      },
      actualizarConsolidado: async function () {
        let sUrl = this._getUrl() + "/actualizarConsolidado";
        const result = await http.httpPost(sUrl, {});
        return result;
      },
      connectBalanza: async function (
        sPort,
        sBoundRate,
        sParity,
        sDataBits,
        sStopBits,
        sComando
      ) {
        try {
          const oTransaccion = {
            port: sPort,
            boundRate: sBoundRate,
            parity: sParity,
            dataBits: sDataBits,
            stopBits: sStopBits,
            comando: sComando,
          };
          const result = await http.httpPost(
            "http://localhost:9002/SerialPort",
            oTransaccion
          );
          return result;
        } catch (error) {
          return {iCode:-1}
        }
      },
      _getUrl: function () {
        var sUrlSrv = this.oServiceModel.sServiceUrl;
        var oPath = new URI(sUrlSrv);
        var sUrl = "";
        sUrl = "http://" + oPath.host();
        return sUrl;
      },
    };
  }
);
