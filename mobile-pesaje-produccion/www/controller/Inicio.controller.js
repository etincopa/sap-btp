sap.ui.define(
  [
    "../controller/BaseController",
    "sap/m/MessageBox",
  ],
  function (BaseController, MessageBox) {
    "use strict";
    var oBusyDialog = new sap.m.BusyDialog();
    var that;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.Inicio",
      {
        onInit: function () {
          that = this;
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.oRouter
            .getTarget("Inicio")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
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
          var oLogin = JSON.parse(window.localStorage.getItem("login"));
          if (oLogin && oLogin.pin) {
            var oConfig = JSON.parse(
              window.localStorage.getItem("configLocal")
            );

            if (
              !(
                oConfig &&
                oConfig.oGeneral &&
                //oConfig.oGeneral.almacen &&
                // oConfig.oGeneral.empresa &&
                // oConfig.oGeneral.plantillaSaldo &&
                oConfig.oGeneral.centro &&
                oConfig.oGeneral.impresora
              )
            ) {
              that.onNav("Configuracion");
            }
          } else {
            that.onNav("Login");
          }
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
