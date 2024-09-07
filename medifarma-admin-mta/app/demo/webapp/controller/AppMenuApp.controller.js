sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("administrador.controller.AppMenuApp", {
      onInit: function () {
        this.getOwnerComponent()._oSplitApp = this.byId("appMenuApp");
      },
    });
  }
);
