sap.ui.define(
  [
    "../controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "../service/oDataService",
  ],
  function (BaseController, MessageBox, JSONModel, formatter, oDataService) {
    "use strict";
    var oBusyDialog = new sap.m.BusyDialog();
    var that = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.Inicio",
      {
        onInit: function () {
          that = this;
          that.sAppName = "PesajeImpBultoSaldo";
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.oRouter
            .getTarget("Inicio")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

          window.localStorage.setItem("PlantaConfig", "1021"); // se setea por defecto la planta de lima
        },

        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},
        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/
        onNav(sRoute) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo(sRoute);
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/

        _handleRouteMatched: function (oEvent) {
          that = this;
          var bMovile = false;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });
          sap.ui.core.BusyIndicator.show(0);
          /**
           * VERIFICA SI EL LOGIN SE REALIZA POR MOBILE SERVICES
           */
          if (navigator.app || navigator.device) {
            bMovile = true;
          }

          that
            .onSetModelIas(bMovile)
            .then((oResp) => {
              sap.ui.core.BusyIndicator.hide();
              if (oResp) {
                var oLogin = sap.ui
                  .getCore()
                  .getModel("oUserLoginGobalModel")
                  .getData();
                that._checkLoginSuccess(oLogin);

                var oConfig = JSON.parse(
                  window.localStorage.getItem("configLocal")
                );

                if (
                  !(
                    oConfig &&
                    oConfig.oGeneral &&
                    oConfig.oGeneral.centro &&
                    oConfig.oGeneral.impresora
                  )
                ) {
                  that.onNav("Configuracion");
                }
              }
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
            });
        },
        _checkLoginSuccess: function (oLogin) {
          //var sPin = that.getView().byId("txtPin").getValue();
          var oUsuario = oLogin.oUsuario;
          var dateFrom = formatter.getTimestampToMDY(
            new Date(oUsuario.fechaVigInicio)
          );
          var dateTo = formatter.getTimestampToMDY(
            new Date(oUsuario.fechaVigFin)
          );
          var dateNow = formatter.getTimestampToMDY(new Date());

          var from = new Date(dateFrom);
          var to = new Date(dateTo);
          var check = new Date(dateNow);

          //Valida si la fecha actual esta en el rango de vigencia del usuario
          if (check > from && check < to) {
            var sLogin = JSON.stringify(oLogin);
            window.localStorage.setItem("UserInfoModel", sLogin);
            sap.ui.getCore().setModel(new JSONModel(oLogin), "UserInfoModel");
            that.getView().setModel(new JSONModel(oLogin), "UserInfoModel");
          } else {
            MessageBox.error(
              "El usuario no esta vigente, comuniquese con un administrador."
            );
          }
        },
        onSetModelIas: async function (bMovile) {
          var that = this;
          var sMail = "";
          var sFnName = "fnLogin";
          var oParameters = {};
          if (bMovile) {
            try {
              var oUserInfoIas = await that.getUserInfo();
              sMail = oUserInfoIas.UserName;
            } catch (oError) {
              MessageBox.error(
                "Error: no se pudo recuperar el usuario IAS, comuníquese con un administrador."
              );

              return false;
            }
          } else {
            var oUser = that.getUserLogin();
            sMail = oUser.email;
          }

          oParameters = {
            usuario: encodeURI(sMail),
            clave: encodeURI(sMail),
            app: that.sAppName,
          };

          //if (navigator.app || navigator.device) {} else {}

          return new Promise(function (resolve, reject) {
            oDataService
              .oDataRead(goModel, sFnName, oParameters, [])
              .then((oData) => {
                var aResult = oData.results;
                if (!aResult && oData[sFnName]) {
                  aResult = oData[sFnName].results;
                }
                if (aResult && aResult.length > 0) {
                  var oResult = aResult[0];

                  /**
                   * Obtener Informacion del Usuario
                   *
                   */
                  if (oResult.oUsuario) {
                    var oLogin = oResult;
                    var aRol = oLogin.aRol;
                    if (aRol) {
                      var aRoleGroup = aRol.reduce(function (r, a) {
                        var sKey = a.accion.substr(0, 4);
                        r[sKey] = r[sKey] || [];
                        r[sKey].push(a);
                        return r;
                      }, Object.create(null));
                      oLogin.aRol = aRoleGroup;
                    } else {
                      oLogin.aRol = [];
                    }
                    that.sUser = oLogin.oUsuario.usuario;

                    sap.ui
                      .getCore()
                      .setModel(new JSONModel(oLogin), "oUserLoginGobalModel");

                    resolve(true);
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
        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
        /**-----------------------------------------------*/

        /**-----------------------------------------------*/
        /*              C O N S T A N T S
        /**-----------------------------------------------*/
      }
    );
  }
);
