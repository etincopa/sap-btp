sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("mif.cp.fraccionamiento.controller.App", {
      onInit: async function () {
        this.oManifestConfig =
          this.getOwnerComponent().getManifestEntry("/sap.ui5/config");

        window.localStorage.setItem(
          "ManifestConfig",
          JSON.stringify(this.oManifestConfig)
        );
      },
    });
  }
);
