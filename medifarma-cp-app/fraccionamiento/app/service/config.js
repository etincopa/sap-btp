sap.ui.define(["mif/cp/fraccionamiento/util/http"], function (http) {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    obtenerConfiguracion: async function () {
      let aConfiguracion = await this.oServiceModel.read(
        "/CONFIGURACION",
        "Local"
      );
      return aConfiguracion[0];
    },
    actualizarConfiguracion: async function (oEntity) {
      await this.oServiceModel.update("/CONFIGURACION", oEntity._id, oEntity);
    },
  };
});
