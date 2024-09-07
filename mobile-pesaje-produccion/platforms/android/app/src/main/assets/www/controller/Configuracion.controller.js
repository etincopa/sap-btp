sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../controller/BaseController",
    "../model/formatter",
    "../service/oDataService",
  ],
  function (
    MessageBox,
    MessageToast,
    JSONModel,
    Filter,
    FilterOperator,
    BaseController,
    formatter,
    oDataService
  ) {
    "use strict";
    var that,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null;

    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.Configuracion",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: function () {
          that = this;
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.oRouter
            .getTarget("Configuracion")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
        },
        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},
        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/

        onSaveConfig: function (oEvent) {
          window.localStorage.setItem(
            "configLocal",
            JSON.stringify(
              this.getView().getModel("ParamsSelectModel").getData()
            )
          );
          MessageToast.show("Registro Guardado con exito.");
          this._navTo("Inicio", null);
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/
        _handleRouteMatched: function (oEvent) {
          that = this;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          var srvExt = that._configServiceExternal();
          if (srvExt) {
            goModel = srvExt.oModel;
            goModelSapErp = srvExt.oModelSapErp;
          }

          var oUrlParameters = {
            $expand: "oMaestraTipo",
          };
          var aFilter = [];
          aFilter.push(new Filter("activo", FilterOperator.EQ, true));
          oDataService
            .oDataRead(goModel, "Maestra", oUrlParameters, aFilter)
            .then((result) => {
              if (result) {
                var aConstant = result.results.reduce(function (r, a) {
                  var sKey = a.oMaestraTipo.tabla.toUpperCase();
                  r[sKey] = r[sKey] || [];
                  r[sKey].push(a);
                  return r;
                }, Object.create(null));

                that
                  .getView()
                  .setModel(new JSONModel(aConstant), "MaestraModel");
                that
                  .getView()
                  .setModel(new JSONModel(aConstant["PLANTA"]), "CentroModel");
                //that._getImpresora();
                //that._getPlantillaEtiqueta();
              }
            })
            .catch((oError) => {});

          var oConfig = JSON.parse(window.localStorage.getItem("configLocal"));

          if (!(oConfig && oConfig.oGeneral)) {
            var SRV_API = that._SRV_API();
            oConfig = {
              oGeneral: {},
              oWebSrv: {
                host: SRV_API.origin,
                typeCedential: "BA",
                user: SRV_API.username,
                pass: SRV_API.password,
              },
            };
          }

          that
            .getView()
            .setModel(
              new JSONModel(Object.assign({}, oConfig)),
              "ParamsSelectModel"
            );

          if (oConfig.oGeneral.centro) {
            that._getImpresora(oConfig.oGeneral.centro, null);
          }
        },

        onChangeCentro: function (oEvent) {
          that = this;
          var oParam = that.getView().getModel("ParamsSelectModel").getData();
          var centro = oParam.oGeneral.centro;
          oParam.oGeneral.impresora = null;
          if (centro) {
            that._getImpresora(centro, null);
          } else {
            that.getView().setModel(new JSONModel([]), "ImpresoraModel");
          }
        },

        _getCentros: function () {
          var aFilter = [];
          var oUrlParameters = {};
          aFilter.push(new Filter("Bukrs", FilterOperator.EQ, "1000"));
          sap.ui.core.BusyIndicator.show(0);
          that
            .fnGetErpDinamic(goModel, "CentroSet", oUrlParameters, aFilter)
            .then((aResp) => {
              sap.ui.core.BusyIndicator.hide();
              that.getView().setModel(new JSONModel(aResp), "CentroModel");
            });
        },

        _getImpresora: function (centro, id) {
          var oUrlParameters = {
            $expand: "oPlanta",
          };
          var aFilter = [],
            EQ = FilterOperator.EQ;
          aFilter.push(new Filter("activo", EQ, true));
          aFilter.push(new Filter("estadoImpresora", EQ, true));
          aFilter.push(new Filter("indicadorEtiqueta", EQ, true));
          if (id) aFilter.push(new Filter("impresoraId", EQ, id));
          if (centro)
            aFilter.push(new Filter("oPlanta/iMaestraId", EQ, centro));

          that._getODataDinamic(
            goModel,
            "IMPRESORA",
            oUrlParameters,
            aFilter,
            "ImpresoraModel"
          );
        },

        _getPlantillaEtiqueta: function () {
          that._getODataDinamic(
            goModel,
            "PLANTILLA_IMPRESION",
            null,
            null,
            "PlantillaModel"
          );
        },
        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
        /**-----------------------------------------------*/

        /**-----------------------------------------------*/
        /*              C O N S T A N T S
        /**-----------------------------------------------*/
        _getODataDinamic: function (
          oModel,
          sEntity,
          oUrlParameters,
          aFilter,
          sModelName
        ) {
          var that = this;

          return new Promise(function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
              .then(function (oResult) {
                sap.ui.core.BusyIndicator.hide();
                if (sModelName) {
                  var oModel = new JSONModel(oResult.results);
                  oModel.setSizeLimit(999999999);
                  that.getView().setModel(oModel, sModelName);
                }
                if (oResult.results.length) {
                  resolve(oResult.results);
                } else {
                  resolve(false);
                }
              })
              .catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
                reject(oError);
              })
              .finally(function () {
                // sap.ui.core.BusyIndicator.hide();
              });
          });
        },
      }
    );
  }
);
