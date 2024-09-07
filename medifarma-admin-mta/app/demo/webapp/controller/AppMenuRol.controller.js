sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("administrador.controller.AppMenuRol", {
      onInit: function () {
        this.getOwnerComponent()._oSplitApp = this.byId("appMenuRol");
      },
    });
  }
);
