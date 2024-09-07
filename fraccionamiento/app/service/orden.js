sap.ui.define([], function () {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    obtenerFactorConversion: async function () {
      const aFactorConversion = await this.oServiceModel.read(
        "/FACTOR_CONVERSION"
      );
      return aFactorConversion;
    },
  };
});
