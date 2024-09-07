sap.ui.define([], function () {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    obtenerLogDetalle: async function (id) {
      const oParam = {
        urlParameters: {
          $filter: "codigo eq '" + id + "'",
        },
      };

      //const aEstados = await this.oServiceModel.readAsync("/ESTADO_HABILITADO", {});
      const aDetalle = await this.oServiceModel.readAsync(
        "/LOG_DETALLE",
        oParam
      );
    },

    formatoFechaLog: function (date) {
      var bValido = new String(date).indexOf("-") > 0;
      if (bValido) {
        const oFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "dd/MM/yyyy HH:mm",
        });

        const dFecha = new Date(date);
        return oFormat.format(dFecha, false);
      } else {
        return date;
      }
    },
  };
});
