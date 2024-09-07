sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "mif/cp/fraccionamiento/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "mif/cp/fraccionamiento/util/http",
    "sap/ui/core/Fragment",
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
  ],
  function (
    UIComponent,
    Device,
    models,
    JSONModel,
    ODataModel,
    Filter,
    FilterOperator,
    http,
    Fragment,
    ManagedObject,
    MessageBox
  ) {
    "use strict";

    return UIComponent.extend("mif.cp.fraccionamiento.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");
        this.setModel(new JSONModel(), "localModel");

        ODataModel.prototype.read = async function (sPath, oParams) {
          var self = this;
          return new Promise(function (resolve, reject) {
            //debugger;
            let oBindingList = {};
            var oParam = {};
            var sExpandPref = "?$expand=";
            var bExpand = false;

            var sFilter = "",
              sFilters = "",
              sExpand = "";
            if (oParams && oParams != "Local") {
              if (typeof oParams === "object") {
                oParam = oParams;
              } else {
                sFilter = oParams;
                bExpand = sFilter.indexOf(sExpandPref) != -1;
                sFilters = bExpand
                  ? sFilter.substr(0, sFilter.indexOf(sExpandPref))
                  : sFilter;
                sExpand = bExpand
                  ? sFilter.substr(
                      sFilter.indexOf(sExpandPref) + sExpandPref.length
                    )
                  : "";
              }
            }

            if (navigator.onLine && oParams != "Local") {
              if (sFilters) oParam.$filter = sFilters;
              if (sExpand) oParam.$expand = sExpand;
            } else {
              var sDataStore = "datastore eq '" + sPath.substring(1) + "'";
              if (sFilters) {
                oParam.$filter =
                  sDataStore +
                  (sFilters && sFilters != "" ? " and " + sFilters : "");
              } else if (oParams == "Local"){
                oParam == null;
                oParam.$filter = sDataStore;
              }
            }

            if (oParams && oParams.hasOwnProperty("async")) {
            } else {
              oBindingList = self.bindList(sPath, undefined, [], [], oParam);
              oBindingList
                .requestContexts(0, Infinity)
                .then(function (aContexts) {
                  let data = [];

                  aContexts.forEach(function (oContext) {
                    const obj = oContext.getObject();
                    data.push(obj);
                  });

                  resolve(data);
                }).catch(function(error){
                  reject(error)
                });
            }
          });
        };

        ODataModel.prototype.update = async function (sPath, sId, oEntity) {
          const sUrl = this.sServiceUrl + sPath + "('" + sId + "')";
          let result = await http.httpPatch(sUrl, oEntity);
        };

        MessageBox.msgExitoso = function (sMensaje) {
          MessageBox.success(sMensaje, {
            title: "Mensaje",
            actions: ["Aceptar"],
          });
        };

        MessageBox.msgAlerta = function (sMensaje) {
          MessageBox.warning(sMensaje, {
            title: "Advertencia",
            actions: ["Cerrar"],
          });
        };

        MessageBox.msgError = function (sMensaje) {
          MessageBox.error(sMensaje, {
            title: "Error",
            actions: ["Cerrar"],
          });
        };
      },
    });
  }
);
