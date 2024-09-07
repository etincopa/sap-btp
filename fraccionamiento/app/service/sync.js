sap.ui.define(["mif/cp/fraccionamiento/util/http"], function (http) {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    sync: async function () {
      let oPath = new URI(this.oServiceModel.sServiceUrl);
      let sUrl = "http://" + oPath.host() + "/sync";

      const result = await http.httpGet(sUrl);
      return result;
    },
  };
});
