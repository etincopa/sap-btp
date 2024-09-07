sap.ui.define(["mif/cp/fraccionamiento/util/http"], function (http) {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    auth: async function (usuario, clave) {
      let oPath = new URI(this.oServiceModel.sServiceUrl);
      let sUrl = "http://" + oPath.host() + "/auth";

      const result = await http.httpPost(sUrl, {}, []);
      return result;
    },
  };
});
