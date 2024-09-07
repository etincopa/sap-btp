sap.ui.define(
  [
    "./BaseController",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/medifarma/cp/manejopedidos/model/models",
    "com/medifarma/cp/manejopedidos/service/oDataService",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    Device,
    History,
    JSONModel,
    Filter,
    FilterOperator,
    models,
    oDataService
  ) {
    "use strict";

    var that;
    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.App",
      {
        onInit: function () {
          // if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
          if (Device.resize.width <= 1024) {
            this.onSideNavButtonPress();
          }
          that = this;
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.sAppName = "ManejoPedidos";

          that.setModel(new JSONModel({}), "side");

          sap.ui.core.BusyIndicator.show(0);
          that
            ._getUserRolApp()
            .then((oResp) => {
              if (oResp) {
                sap.ui
                  .getCore()
                  .setModel(new JSONModel(oResp), "oUserLoginGobalModel");
                sap.ui.core.BusyIndicator.hide();

                that.setModel(new JSONModel(models.sideMenu()), "side");
              } else {
                MessageBox.error("Usuario no existe.");
              }
            })
            .catch((oError) => {});
        },
        onNavBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome", true);
          }
        },

        _getUserRolApp: function () {
          var oUser = that.getUserLogin();
          that.sEmail = oUser.email;
          that.sUser = "";
          var oParameters = {
            usuario: encodeURI(that.sEmail),
            clave: encodeURI(that.sEmail),
            app: that.sAppName,
          };
          return new Promise(function (resolve, reject) {
            oDataService
              .oDataRead(that.oModel, "fnLogin", oParameters, [])
              .then((oData) => {
                var aResult = oData.results;
                if (!aResult && oData.fnLogin) {
                  aResult = oData.fnLogin.results;
                }
                if (aResult && aResult.length > 0) {
                  var oResult = aResult[0];
                  if (oResult.oUsuario) {
                    resolve(oResult);
                  } else {
                    if (!oResult.bStatus) {
                      return MessageBox.error(oResult.sMessage);
                    }
                  }
                }
                resolve(false);
              })
              .catch((oError) => {
                reject(oError);
              });
          });
        },
        onSideNavButtonPress: function () {
          var oToolPage = this.byId("App");
          var bSideExpanded = oToolPage.getSideExpanded();
          this._setToggleButtonTooltip(bSideExpanded);
          oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },
        _setToggleButtonTooltip: function (bSideExpanded) {
          var oToggleButton = this.byId("sideNavigationToggleButton");
          var sTooltipText = this.getBundleText(
            bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText"
          );
          oToggleButton.setTooltip(sTooltipText);
        },
        onPressMenuItem: function (oEvent) {
          var sRoute = oEvent.getSource().getProperty("key"),
            oRouter = sap.ui.core.UIComponent.getRouterFor(this);

          if (sRoute === "selectPrintCNT" || sRoute === "selectPrintAlm") {
            this.onOpenImpresoras(sRoute);
            return;
          }
          if (!sRoute.includes("Route")) return;
          var oLogin = sap.ui
            .getCore()
            .getModel("oUserLoginGobalModel")
            .getData();
          var aRol = oLogin.aRol;
          var bNavigate = false;
          if (aRol && aRol.length) {
            var aRoleGroup = aRol.reduce(function (r, a) {
              var sKey = a.accion.substr(0, 4);
              r[sKey] = r[sKey] || [];
              r[sKey].push(a);
              return r;
            }, Object.create(null));

            switch (sRoute) {
              case "RouteHome":
                bNavigate = true;
                break;
              default:
                var appCData = oEvent.getSource().data();
                var sRoute = appCData.route;
                var sPrefixRol = appCData.prefixRol;
                bNavigate = aRoleGroup[sPrefixRol] ? true : false;
                break;
            }
          }
          if (bNavigate) {
            oRouter.navTo(sRoute);
          } else {
            alert("No tienes roles/permisos para acceder a esta opción.");
          }
        },

        onOpenImpresoras: function (sKey) {
          this.setModel(
            new JSONModel({
              UI: {
                impBusy: true,
              },
            }),
            "MaestraModel"
          );
          this.setModel(new JSONModel({}), "ImpresionModel");
          this.setPlantillaImpresora(sKey);

          var sDialogName = "VerImpresoras";
          if (!this[sDialogName]) {
            this[sDialogName] = sap.ui.xmlfragment(
              sDialogName,
              rootPath + ".view." + sDialogName,
              this
            );
            this.getView().addDependent(this[sDialogName]);
          }
          this[sDialogName].open();
        },

        onPressFixMenuItem: function (oEvent) {
          let sKey = oEvent.getSource().getProperty("key");
          if (sKey == "selectPrint") {
            this.setModel(new JSONModel({}), "MaestraModel");
            this.setModel(new JSONModel({}), "ImpresionModel");
            this.setPlantillaImpresora();

            var sDialogName = "VerImpresoras";
            if (!this[sDialogName]) {
              this[sDialogName] = sap.ui.xmlfragment(
                sDialogName,
                rootPath + ".view." + sDialogName,
                this
              );
              this.getView().addDependent(this[sDialogName]);
            }
            this[sDialogName].open();
          }
        },
        onPressAceptarImpresion: function (oEvent) {
          oEvent.getSource().getParent().close();

          var oImpresora = that.getModel("ImpresionModel").getData();
          window.localStorage.setItem("oImpresora", JSON.stringify(oImpresora));
        },
        onPressClose: function (oEvent) {
          var oSource = oEvent.getSource();
          var oParent = oSource.getParent();
          oParent.close();
        },

        setPlantillaImpresora: function (sKey) {
          var that = this;
          var oUrlParameters = {},
            aFilters = [],
            EQ = FilterOperator.EQ;
          //PLANTILLA IMPRESION
          aFilters.push(new Filter("activo", EQ, true));
          oDataService
            .oDataRead(
              that.oModel,
              "PLANTILLA_IMPRESION",
              oUrlParameters,
              aFilters
            )
            .then((oResult) => {
              that
                .getModel("MaestraModel")
                .setProperty("/PlantillasImpresion", oResult.results);

              let aFiltersImp = [];
              if (sKey === "selectPrintCNT")
                aFiltersImp.push(new Filter("indicadorCp", EQ, true));
              else if (sKey === "selectPrintAlm")
                aFiltersImp.push(new Filter("indicadorPicking", EQ, true));

              aFiltersImp.push(new Filter("activo", EQ, true));
              aFiltersImp.push(new Filter("estadoImpresora", EQ, true));

              window.localStorage.setItem(
                "aPlantillasImpresion",
                JSON.stringify(oResult.results)
              );

              var oUrlParametersImp = {
                $expand: "oPlanta",
              };

              return oDataService.oDataRead(
                that.oModel,
                "IMPRESORA",
                oUrlParametersImp,
                aFiltersImp
              );
            })
            .then((oResult) => {
              that
                .getModel("MaestraModel")
                .setProperty("/Impresoras", oResult.results);
              that.getModel("MaestraModel").setProperty("/UI/impBusy", false);
            });
        },
      }
    );
  }
);
