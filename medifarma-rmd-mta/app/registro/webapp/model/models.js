sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device"
], function (JSONModel, Device) {
  "use strict";

  return {

    createDeviceModel: function () {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },

    // Modelo de los filtros del RMD.
    crearDataFiltrosModel: function () {
      var oModel = new JSONModel({
        lote: "",
      });
      return oModel;
    },

    // Modelo de los filtros del RMD.
    obtenerSelectionModel: function () {
      var oModel = new JSONModel({
        centro: "",
        orden: "",
        etapa: "",
        codigo: "",
        vte: "",
        articulo: "",
        lote: "",
        expire: "",
        o: "",
        rm: "",
        stateRM: "",
        opp: "",
        rmo: "",
        assign: ""
      });
      return oModel;
    },

    // Modelo Principal de la data del RMD.
    obtenerDataGeneralRMD: function () {}
  };
});