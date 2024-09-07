sap.ui.define(
  [
    "sap/ui/Device",
    "../controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/Util",
    "../service/oDataService",
  ],
  function (
    Device,
    BaseController,
    JSONModel,
    Popover,
    Button,
    library,
    MessageToast,
    MessageBox,
    Util,
    oDataService
  ) {
    "use strict";
    var that,
      self = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null,
      ButtonType = library.ButtonType,
      PlacementType = library.PlacementType,
      oDataSrv = oDataService;

    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.App",
      {
        util: Util,
        onInit: function () {
          that = this;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });
          

          var menu = {
            selectedKey: "page2",
            navigation: [
              {
                title: "Inicio",
                icon: "sap-icon://home",
                expanded: false,
                key: "Inicio",
              },
              {
                title: "Configuración",
                icon: "sap-icon://settings",
                expanded: false,
                key: "Configuracion",
              },
              {
                title: "TRASLADOS",
                icon: "sap-icon://shipping-status",
                expanded: false,
                key: "EntregaPrd",
              },
              // {
              //   title: "Verificación de Etiquetas IFA",
              //   icon: "sap-icon://tag",
              //   expanded: false,
              //   key: "VerificaEtiqIFA",
              // },
              {
                title: that._getI18nText("ifa.tltpesajeProdIFA"),
                icon: "sap-icon://measure",
                expanded: false,
                key: "PesajeproduccionIFA",
              },
              {
                title: that._getI18nText("ifa.tltbultoSaldo"),
                icon: "sap-icon://compare",
                expanded: false,
                key: "BultoSaldoIFA",
              },
              /*{
                title: "Impresión de Bulto Saldo",
                icon: "sap-icon://product",
                expanded: false,
                key: "ImpreBultoSaldo",
              },
              {
                title: "Reporte Bulto Pend. Confirmar",
                icon: "sap-icon://clinical-tast-tracker",
                expanded: false,
                key: "ReportBultoPendConfirm",
              },*/
            ],
            fixedNavigation: [
              {
                title: "Sync-Offline",
                icon: "sap-icon://disconnected",
                expanded: false,
                key: "Offline",
              },
              {
                title: "Salir",
                icon: "sap-icon://log",
                expanded: false,
                key: "Salir",
              },
              {
                title: that._getI18nText("appVersion"),
                icon: "sap-icon://example",
                expanded: false,
                key: "Version",
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
          that._setToggleButtonTooltip(!Device.system.desktop);
        },
        onAfterRendering: function () {},

        onItemSelect: function (oEvent) {
          var that = this;
          var oItem = oEvent.getParameter("item");
          var sKey = oItem.getKey();
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          if (sKey == "Salir") {
            MessageBox.confirm("¿Confirma que desea cerrar la sesión?", {
              title: "Salir",
              actions: ["SI", "NO"],
              initialFocus: "NO",
              onClose: async function (sAction) {
                if ("SI" == sAction) {
                  // window.localStorage.clear();
                  window.localStorage.setItem(
                    "UserInfoModel",
                    JSON.stringify({})
                  );
                  if (navigator.app || navigator.device) {
                    var oLogin = JSON.parse(
                      window.localStorage.getItem("login")
                    );
                    window.localStorage.setItem(
                      "login",
                      JSON.stringify({
                        status: false,
                        pin: "", //oLogin.pin,
                      })
                    );

                    that.onSideNavButtonPress();

                    that.salirPress();
                    //oRouter.navTo("Inicio");
                  } else {
                    if (
                      window.location.href.includes("workspaces") ||
                      window.location.href.includes("webidecp") ||
                      window.location.href.includes("localhost")
                    ) {
                      var oLogin = JSON.parse(
                        window.localStorage.getItem("login")
                      );
                      window.localStorage.setItem(
                        "login",
                        JSON.stringify({
                          status: false,
                          pin: "", //oLogin.pin,
                        })
                      );

                      that.onSideNavButtonPress();
                      that.salirPress();
                      //oRouter.navTo("Inicio");
                    } else {
                      window.location.href =
                        window.location.origin +
                        "/cp.portal/logout?sap-language=default";
                    }
                  }
                } else sap.ui.core.BusyIndicator.hide();
              },
            });
          } else if (sKey == "Offline") {
            this.onSideNavButtonPress();

            if (navigator.onLine) {
              //Crear Storage
              this._getLoadDataOffline();
            } else {
              MessageToast.show(that._getI18nText("I000402"));
            }
          } else {
            oRouter.navTo(sKey);
            this.onSideNavButtonPress();
          }
        },

        onSideNavButtonPress: function () {
          var router = this.getOwnerComponent().getRouter();
          var currentHash = router.getHashChanger().getHash();
          var name = router.getRouteInfoByHash(currentHash).name; // since 1.75
          //var thisRoute = router.getRoute(name);
          if (name == "" || name == "Login") {
          } else {
            var oToolPage = this.byId("app");
            var bSideExpanded = oToolPage.getSideExpanded();
            this._setToggleButtonTooltip(bSideExpanded);
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
          }
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

        _setToggleButtonTooltip: function (bSideExpanded) {
          var oToggleButton = this.byId("idSideNavigationToggleButton");
          var sTooltipText = bSideExpanded ? "Expandir Menu" : "Colapsar Menu";
          oToggleButton.setTooltip(sTooltipText);
        },
        handleUserNamePress: function (event) {
          var oPopover = new Popover({
            showHeader: false,
            placement: PlacementType.Bottom,
            content: [
              new Button({
                text: "Salir",
                press: function (oEvent) {
                  if (navigator.app) {
                    navigator.app.exitApp();
                  } else if (navigator.device) {
                    navigator.device.exitApp();
                  } else {
                    window.close();
                  }
                },
                icon: "sap-icon://log",
                type: ButtonType.Transparent,
              }),
            ],
          }).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

          oPopover.openBy(event.getSource());
        },
        _getLoadDataOffline: function () {
          Util.iniciarStorage();

          sap.ui.core.BusyIndicator.show(0);
          MessageToast.show(that._getI18nText("I000400"));

          oDataService
            .oDataRead(goModel, "GRUPO_ORDEN_BULTO_DET", null, null)
            .then((oData) => {
              sap.ui.core.BusyIndicator.hide();
              //Almacenar Registros en el Storage
              Util.saveEntity(
                "GRUPO_ORDEN_BULTO_DET",
                JSON.stringify(oData),
                null
              );

              sap.ui.core.BusyIndicator.show(0);
              oDataService
                .oDataRead(goModel, "ALMACEN_PISO", null, null)
                .then((oData) => {
                  sap.ui.core.BusyIndicator.hide();
                  //Almacenar Registros en el Storage
                  Util.saveEntity("ALMACEN_PISO", JSON.stringify(oData), null);
                  MessageToast.show(that._getI18nText("I000401"));
                  sap.ui.core.BusyIndicator.hide();
                });
            })
            .catch(function (oError) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(that._getI18nText("E000400"));
              console.log(oError);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });

          //Leer Registros del Storage
          //Util.readEntity("GRUPO_ORDEN_BULTO_DET", true, this);
          //Util.readEntity("GRUPO_ORDEN_BULTO_DET?$filter=status eq " + Start, true, that);
          /*Util.readEntity2("GRUPO_ORDEN_BULTO_DET", true, this).then((data) =>{
                console.log(data);
              });*/
        },
        setJsonModel: function (Object, ModelName, bOneWay) {
          var oModel = new JSONModel(Object);
          if (bOneWay) {
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
          } else {
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
          }
          this.getView().setModel(oModel, ModelName);
        },
        _getUserLogin: function () {
          var dataUser = {};
          try {
            var userModel = new JSONModel();
            userModel.loadData("/services/userapi/attributes", null, false);
            dataUser = userModel.getData();
          } catch (oError) {}

          if (!dataUser.email) {
            try {
              dataUser.email = sap.ushell.Container.getService("UserInfo")
                .getUser()
                .getEmail();
            } catch (oError) {}
          }

          if (
            dataUser.email === "DEFAULT_USER" ||
            dataUser.email === undefined
          ) {
            dataUser.email = "elvis.percy.garcia.tincopa@everis.com";
          }

          return dataUser;
        },
      }
    );
  }
);
