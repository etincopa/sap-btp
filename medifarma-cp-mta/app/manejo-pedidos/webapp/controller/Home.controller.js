sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "com/medifarma/cp/manejopedidos/model/models",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "com/medifarma/cp/manejopedidos/service/oDataService",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    Device,
    models,
    formatter,
    oDataService,
    MessageBox
  ) {
    "use strict";

    var that;
    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.Home",
      {
        formatter: formatter,
        onInit: function () {
          that = this;
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.sAppName = "ManejoPedidos";

          var oViewModel = new JSONModel({
            isPhone: Device.system.phone,
          });
          this.setModel(oViewModel, "view");
          Device.media.attachHandler(
            function (oDevice) {
              this.getModel("view").setProperty(
                "/isPhone",
                oDevice.name === "Phone"
              );
            }.bind(this)
          );

          that.setModel(new JSONModel({}), "side");
          sap.ui.core.BusyIndicator.show(0);
          that
            ._getUserRolApp()
            .then((oResp) => {
              if (oResp) {
                sap.ui
                  .getCore()
                  .setModel(new JSONModel(oResp), "oUserLoginGobalModel");
                that.setModel(new JSONModel(models.sideMenu()), "side");
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },
        onNav: function (oEvent) {
          var appCData = oEvent.getSource().data();
          var sRoute = appCData.route;
          var sPrefixRol = appCData.prefixRol;
          let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

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
                      MessageBox.error(oResult.sMessage);
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
      }
    );
  }
);
