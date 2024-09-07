sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/model/json/JSONModel",
    "sap/ndc/BarcodeScanner",
    "../service/ExtScanner",
    "../controller/BaseController",
    "../model/formatter",
    "../service/oDataService",
  ],
  function (
    MessageBox,
    Filter,
    FilterOperator,
    FilterType,
    SimpleType,
    ValidateException,
    JSONModel,
    BarcodeScanner,
    ExtScanner,
    BaseController,
    formatter,
    oDataService
  ) {
    "use strict";

    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.ReadBarCode",
      {
        formatter: formatter,
        onInit: function () {
          this.getView().setModel(
            new sap.ui.model.json.JSONModel([]),
            "ReadBarCodeListModel"
          );
          var aReadBarCodeListModel = [
            {
              Correlativo: "0040",
              BultoCodigo: "10920938100",
              Cantidad: "50",
              UMB: "UND",
              EstadoControl: "APR",
            },
          ];

          this.getView()
            .getModel("ReadBarCodeListModel")
            .setData(aReadBarCodeListModel);
        },
        onAfterRendering: function () {},
        onBarcodeScan: function () {
          var that = this;
          var code = "";

          try {
            if (!cordova.plugins.barcodeScanner) {
              alert("Barcode scanning not supported");
              return;
            }

            cordova.plugins.barcodeScanner.scan(
              function (result) {
                if (result.format == "QR_CODE") {
                  code = result.text;
                  that.getView().byId("searchField").setValue(code);
                  //that.onSearch();
                }
              },
              function (error) {
                alert("Scan failed: " + error);
              },
              {
                preferFrontCamera: true, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: true, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt: "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false, // iOS and Android
              }
            );
          } catch (oError) {}
        },
        onSearch: function (oEvent) {},
        onSearchLive: function (oEvent) {},
      }
    );
  }
);
