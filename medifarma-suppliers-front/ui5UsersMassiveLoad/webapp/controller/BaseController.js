sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.everis.suppliers.ui5UsersMassiveLoad.controller.BaseController", {
            getModel: function (sName) {
                this.getView().getModel(sName)
            },
            setModel: function (oModelData, sName) {
                this.getView().setModel(oModelData, sName);
            }
        });
    });