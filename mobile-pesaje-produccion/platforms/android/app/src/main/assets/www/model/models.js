sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  function (JSONModel, Device) {
    "use strict";

    return {
      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        /*
        // Disable the scan barcode button by default
        oModel.setProperty("/videoUserMedia", false);
        if (
          navigator &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
              // device supports video, which means will enable the scan button
              oModel.setProperty("/videoUserMedia", true);
            })
            .catch(function (err) {
              // not supported, barcodeScanEnabled already default to false
            });
        }
        */
        return oModel;
      },
      createPedidoAtencionModel: function () {
        var oStructure = {
          QR: {
            oInsumo: {},
            oBulto: {},
          },
        };
        var oModel = new JSONModel(oStructure);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      getService: function () {
        return "/v2/browse/"; // URL
      },
    };
  }
);
