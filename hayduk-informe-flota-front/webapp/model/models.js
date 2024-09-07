sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        getService: function () {
            return "/saperp/SAP/ZPP_INFORME_FLOTA_SRV_SRV/"; // URL
        },
    };
});
