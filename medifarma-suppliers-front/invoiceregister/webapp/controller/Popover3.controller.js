sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"],
    function (Controller, MessageBox, utilities, History) {
        "use strict";
        return Controller.extend("com.everis.suppliers.invoiceregister.controller.Popover3", {
            setRouter: function (oRoute) {
                this.oRouter = oRoute;
            },
            getBindingParameters: function () {
                return {};
            },
            onInit: function () {
                this._oDialog = this.getView().getContent()[0];
            },
            onExit: function () {
                this._oDialog.destroy();
            },
        });
    },
    true
);
