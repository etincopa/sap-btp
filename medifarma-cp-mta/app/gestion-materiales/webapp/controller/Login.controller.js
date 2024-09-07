sap.ui.define(
  [
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/model/json/JSONModel",
    "../controller/BaseController",
    "../model/formatter",
    "../service/oDataService",
    "../service/iasScimService"
  ],
  function (
    History,
    MessageBox,
    MessageToast,
    SimpleType,
    ValidateException,
    JSONModel,
    BaseController,
    formatter,
    oDataService,
    iasScimService
  ) {
    "use strict";
    var goBusyDialog = new sap.m.BusyDialog();
    var that = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null,
      giIntent = 0;
    var goDataSrv = oDataService;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.Login",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: async function () {
          that = this;
          that.sAppName = "PesajeImpBultoSaldo";
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.oRouter
            .getTarget("Login")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
        },
        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},
        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/
        _handleRouteMatched: function (oEvent) {
          that = this;
          var that = that;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });
          if (navigator.app || navigator.device) {

            try {
              var oLogin = JSON.parse(window.localStorage.getItem("login"));

              if (oLogin && oLogin.pin) {
                that.getView().setModel(
                  new JSONModel({
                    oAction: that._compActionsValue(false, false, true),
                  }),
                  "LoginModel"
                );

                if (oLogin.status) {
                  this._navTo("Inicio", null);
                } else {
                }
              } else {
                window.localStorage.setItem(
                  "login",
                  JSON.stringify({
                    status: false,
                    pin: "",
                  })
                );
              }
            } catch (error) {}
          } else {
            sap.ui.core.BusyIndicator.show(0);
            that
              .onSetModelIas(null)
              .then((oResp) => {
                sap.ui.core.BusyIndicator.hide();
                if (oResp) {
                  var oLogin = sap.ui
                    .getCore()
                    .getModel("oUserLoginGobalModel")
                    .getData();
                  that._checkLoginSuccess(oLogin);
                }
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
              });
          }
        },
        onIngresarPress: function (e) {
          var that = this;
          var oLogin = JSON.parse(window.localStorage.getItem("login"));
          var sPin = that.getView().byId("txtPin").getValue();
          if (oLogin && oLogin.pin) {
            if (sPin == oLogin.pin) {
              window.localStorage.setItem(
                "login",
                JSON.stringify({
                  status: true,
                  pin: sPin,
                })
              );
              that.getView().setModel(
                new JSONModel({
                  oAction: that._compActionsValue(false, false, true),
                }),
                "LoginModel"
              );
              that._navTo("Inicio", null);
            } else {
              MessageBox.warning(that._getI18nText("W000200"));
            }
          } else {
            var sUsuario = that.getView().byId("txtUsuario").getValue();
            var sPassword = that.getView().byId("txtPassword").getValue();

            if (sUsuario && sPassword && sPin) {
              /* CONNECTAR IAS
               * Almacenar la informacion en el localstorage
               */
              var urlParameters = {
                usuario: sUsuario.toUpperCase().trim(),
                clave: sPassword,
              };
              sap.ui.core.BusyIndicator.show(0);
              that
                .onSetModelIas(urlParameters)
                .then((oResp) => {
                  sap.ui.core.BusyIndicator.hide();
                  if (oResp) {
                    var oLogin = sap.ui
                      .getCore()
                      .getModel("oUserLoginGobalModel")
                      .getData();
                    that._checkLoginSuccess(oLogin);
                  }
                })
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                });
            } else {
              MessageToast.show(that._getI18nText("E000200"));
            }
          }
        },

        _checkLoginSuccess: function (oLogin) {
          var sPin = that.getView().byId("txtPin").getValue();
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
            window.localStorage.setItem(
              "login",
              JSON.stringify({
                status: true,
                pin: sPin,
              })
            );

            var sLogin = JSON.stringify(oLogin);
            window.localStorage.setItem("UserInfoModel", sLogin);
            sap.ui.getCore().setModel(new JSONModel(oLogin), "UserInfoModel");
            that.getView().setModel(new JSONModel(oLogin), "UserInfoModel");

            that.getView().setModel(
              new JSONModel({
                oAction: that._compActionsValue(false, false, true),
              }),
              "LoginModel"
            );

            that._navTo("Inicio", null);
          } else {
            MessageBox.error(
              "El usuario no esta vigente, comuniquese con un administrador."
            );
          }
        },

        onResetPress: function (oEvent) {
          var that = this;
          var sText = that._getI18nText("I000200");
          if (!navigator.onLine) {
            sText =
              "Esta en modo Offline, para volver autentificarse se requiere una conexión. ¿Desea continuar?";
          }
          MessageBox.confirm(sText, {
            title: "Reiniciar la autentificación",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                that.getView().byId("txtPin").setValue("");
                that.getView().byId("txtUsuario").setValue("");
                that.getView().byId("txtPassword").setValue("");

                that.getView().setModel(
                  new JSONModel({
                    oAction: that._compActionsValue(true, true, true),
                  }),
                  "LoginModel"
                );

                window.localStorage.setItem(
                  "login",
                  JSON.stringify({
                    status: false,
                    pin: "",
                  })
                );
              } else goBusyDialog.close();
            },
          });
        },
        onSalirPress: function (e) {
          if (navigator.app) {
            navigator.app.exitApp();
          } else if (navigator.device) {
            navigator.device.exitApp();
          } else {
            window.close();
          }
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/
        _compActionsValue: function (user, pass, pin) {
          return {
            inputUser: user,
            inputPass: pass,
            inputPin: pin,
          };
        },
        onSetModelIas: function (oParamLogin) {
          var that = this;
          var oUser = null,
            sFnName = "fnLogin";
          var oParameters = {};
          if (oParamLogin) {
            oParameters = {
              usuario: encodeURI(oParamLogin.usuario),
              clave: encodeURI(oParamLogin.clave),
              app: that.sAppName,
            };
          } else {
            oUser = that.getUserLogin();
            oParameters = {
              usuario: encodeURI(oUser.email),
              clave: encodeURI(oUser.email),
              app: that.sAppName,
            };
          }
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
                  if (oResult.oUsuario) {
                    var oLogin = oResult;
                    var aRol = oLogin.aRol;
                    var aRoleGroup = aRol.reduce(function (r, a) {
                      var sKey = a.accion.substr(0, 4);
                      r[sKey] = r[sKey] || [];
                      r[sKey].push(a);
                      return r;
                    }, Object.create(null));

                    oLogin.aRol = aRoleGroup;
                    that.sUser = oLogin.oUsuario.usuario;

                    sap.ui
                      .getCore()
                      .setModel(new JSONModel(oLogin), "oUserLoginGobalModel");

                    resolve(true);
                  } else {
                    if (!oResult.bStatus) {
                      // return
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
        _getValue: function (sText) {
          var sValue = sText;
          if (!sText) sValue = "";

          return sValue;
        },
        _getValueDec: function (sText) {
          var sValue = sText;
          if (!sText) sValue = "0.000";

          return sValue;
        },
        customEMailType: SimpleType.extend("email", {
          //<Input value="{ path: 'usuarioModel>sEmail', type: '.customEMailType' }"/>
          formatValue: function (oValue) {
            return oValue;
          },

          parseValue: function (oValue) {
            return oValue;
          },

          validateValue: function (oValue) {
            var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!oValue.match(rexMail)) {
              throw new ValidateException(
                "'" + oValue + "' dirección de correo no valido"
              );
            }
          },
        }),
      }
    );
  }
);
