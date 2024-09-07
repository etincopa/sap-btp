sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "administrador/service/iasScimService",
  ],
  function (Controller, JSONModel, iasScimService) {
    "use strict";
    var that;

    return Controller.extend("administrador.controller.App", {
      onInit: function () {
        that = this;
        iasScimService.Inicializator(this);
        var menu = {
          selectedKey: "page2",
          navigation: [
            {
              title: "Roles",
              icon: "sap-icon://role",
              expanded: false,
              key: "MenuRol",
            },
            {
              title: "Aplicaciones",
              icon: "sap-icon://product",
              expanded: false,
              key: "MenuApp",
            },
          ],
          fixedNavigation: [
            {
              title: "Maestra",
              icon: "sap-icon://activity-items",
              expanded: false,
              key: "MenuMaestra",
            },
            {
              title: "Sistemas",
              icon: "sap-icon://it-system",
              expanded: false,
              key: "MenuSistema",
            },
            {
              title: "Usuarios",
              icon: "sap-icon://account",
              expanded: false,
              key: "MenuUsuario",
            },
          ],
          headerItems: [
            {
              text: "File",
            },
            {
              text: "Edit",
            },
            {
              text: "View",
            },
            {
              text: "Settings",
            },
            {
              text: "Help",
            },
          ],
        };

        var oModel = new JSONModel(menu);
        that.getView().setModel(oModel, "menu");

        var user = {};
        //user.email = "elvis.percy.garcia.tincopa@everis.com";
        //user.username = "ADMIN";
        user.email = "ryepegav@everis.com";
        user.username = "RMD";

        sap.ui.getCore().setModel(new JSONModel(user), "UserInfoModel");
        that.getView().setModel(new JSONModel(user), "UserInfoModel");
      },

      onAfterRendering: function () {},

      onItemSelect: function (oEvent) {
        var oItem = oEvent.getParameter("item");
        var sKey = oItem.getKey();
        //			this.onSideNavButtonPress();
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo(sKey);
      },

      onSideNavButtonPress: function () {
        var oToolPage = this.byId("app");
        var bSideExpanded = oToolPage.getSideExpanded();
        this._setToggleButtonTooltip(bSideExpanded);
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      },

      _setToggleButtonTooltip: function (bSideExpanded) {
        var oToggleButton = this.byId("idSideNavigationToggleButton");
        var sTooltipText = bSideExpanded ? "Expandir Menu" : "Colapsar Menu";
        oToggleButton.setTooltip(sTooltipText);
      },
    });
  }
);
