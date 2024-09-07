sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "mif/cp/fraccionamiento/util/http",
    "sap/ui/core/Fragment",
    "mif/cp/fraccionamiento/service/sync",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/config",
  ],
  function (Controller, http, Fragment, sync, MessageBox, BusyIndicator, grupoOrden, configSrv) {
    "use strict";

    return Controller.extend("mif.cp.fraccionamiento.controller.Base", {
      init: async function () {
        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oLocalModel = this.oOwnerComponent.getModel("localModel");
        this.oServiceModel = this.oOwnerComponent.getModel("serviceModel");
        this.oServiceModelOnline =
          this.oOwnerComponent.getModel("serviceModelOnline");
        this.serviceModelOnlineV2 = this.oOwnerComponent.getModel(
          "serviceModelOnlineV2"
        );
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        

        this.oConfig =
          this.getOwnerComponent().getManifestEntry("/sap.ui5/config");
        this.oConfiguracion = this.oLocalModel.getProperty("/Config");
        this.oResourceBundle = this.oOwnerComponent
          .getModel("i18n")
          .getResourceBundle();
        let config = this.getOwnerComponent().getManifestEntry(
          "/sap.app/applicationVersion"
        );
        this.oLocalModel.setProperty("/version", config.version);
        this.offline = !this.oLocalModel.getProperty("/Online");
        this.actualizarReloj();

        sync.init(this.oServiceModel);
        configSrv.init(this.oServiceModel);
      },
      onLoadDB: async function (oEvent) {
        BusyIndicator.show(0);
        if (navigator.onLine) {
          try {
            MessageBox.information("Cargando registros, por favor espere ...");
            await sync.sync();
            await this.onLine();

            MessageBox.msgExitoso(
              "Carga de registro completa, estamos listo para ingresar en modo OFFLINE."
            );
          } catch (oError) {
            console.log(oError);
            MessageBox.msgError("Error al cargar registros...");
          }
        } else {
          MessageBox.msgAlerta(
            "Para sincronizar los registros es necesario tener una conexión..."
          );
        }
        BusyIndicator.hide();
      },
      onLine: async function () {
        const offlineUsuario = window.localStorage.getItem("usuario");
        const offlineClave = window.localStorage.getItem("clave");
        let result = await grupoOrden.auth(offlineUsuario, offlineClave);
        if (result.iCode == "1" && result.oResult.value) {
          var oUserLogin = result.oResult.value.data.results[0];
          if (!oUserLogin) {
            BusyIndicator.hide();
            return MessageBox.msgError(
              "El Usuario y/o contraseña incorrectos."
            );
          }

          if (!oUserLogin || !(oUserLogin.aRol && oUserLogin.aRol.length)) {
            BusyIndicator.hide();
            return MessageBox.msgError(
              "Error de acceso, puede que tu usuario no tiene permisos para acceder a la aplicación."
            );
          }
          //await sync.sync();

          var oUsuario = oUserLogin.oUsuario;
              oUsuario.aRol = oUserLogin.aRol;
          const oConfig = await configSrv.obtenerConfiguracion();
          this.oLocalModel.setProperty("/Config", oConfig);
          this.oLocalModel.setProperty("/Online", true);
          this.oLocalModel.setProperty("/InfoUsuario", oUsuario);

          let oOpciones = this.getPermisos(oUsuario.aRol);

          if (!oOpciones.MenuOpcion) {
            MessageBox.msgAlerta("No tiene permisos para ingresar al Menú.");
            BusyIndicator.hide();
            return;
          }

          this.oLocalModel.setProperty("/Opciones", oOpciones);

          BusyIndicator.hide();
          if (!oConfig.salaPesajeId) {
            BusyIndicator.show(0);
            BusyIndicator.hide();
            this.oRouter.navTo("configuracion");
          } else {
            this.oRouter.navTo("menu");
          }

          this.oLocalModel.setProperty(
            "/usuarioNombreCompleto",
            oUsuario.apellidoPaterno +
              " " +
              oUsuario.apellidoMaterno +
              ", " +
              oUsuario.nombre
          );

          window.localStorage.setItem("usuario", offlineUsuario);
          window.localStorage.setItem("clave", offlineClave);
          window.localStorage.setItem(
            "InfoUsuario",
            JSON.stringify(oUsuario)
          );
          window.localStorage.setItem("usuarioCodigo", oUsuario.usuario);
        }
      },
      actualizarReloj: function () {
        let self = this;
        this.oLocalModel.setProperty("/fecha", new Date());
        var bOnline = false;
        if (navigator.onLine) bOnline = true;
        this.oLocalModel.setProperty("/Online", bOnline);

        setTimeout(function () {
          self.actualizarReloj();
        }, 1000);
      },
      requestToken: function () {
        const config =
          this.getOwnerComponent().getManifestEntry("/sap.ui5/config");
        let url = config.oauth.url;
        url += "/oauth/token?grant_type=password";
        url += "&username=" + config.oauth.username;
        url += "&password=" + config.oauth.password;
        url += "&client_id=" + config.oauth.clientid;
        url += "&clientsecret=" + config.oauth.clientsecret;
        url += "&response_type=token";

        const headers = {
          Authorization:
            "Basic " +
            btoa(config.oauth.clientid + ":" + config.oauth.clientsecret),
        };

        return http.httpGet(url, headers);
      },
      doMessageboxActionCustom: function (sMessage, aOptionsBtn, contentWidth) {
        return new Promise(function (resolve, reject) {
          MessageBox.warning(sMessage, {
            icon: MessageBox.Icon.INFORMATION,
            title: "Confirmar",
            actions: aOptionsBtn,
            emphasizedAction: aOptionsBtn[0],
            contentWidth: !contentWidth ? "60%" : contentWidth,
            styleClass: "",
            onClose: function (oAction) {
              resolve(oAction);
            },
          });
        });
      },
      _UniqByKeepFirst: function (aData, key) {
        var seen = new Set();
        return aData.filter((item) => {
          var k = key(item);
          return seen.has(k) ? false : seen.add(k);
        });
      },
      openDialog: async function (dialogName, oParam) {
        const oView = this.getView();
        let oController = null;
        if (!window["Dialog" + dialogName]) {
          oController = new sap.ui.controller(
            "mif.cp.fraccionamiento.controller.fragment." + dialogName
          );
          window["Dialog" + dialogName] = await Fragment.load({
            id: oView.getId(),
            name: "mif.cp.fraccionamiento.view.fragment." + dialogName,
            controller: oController,
          });
          window["DialogController" + dialogName] = oController;
          this.getView().addDependent(window["Dialog" + dialogName]);
          oController.oView = this.getView();
          oController.oParam = oParam;
          oController.onInit();
        } else {
          oController = window["DialogController" + dialogName];
          oController.oView = this.getView();
          oController.oParam = oParam;
        }

        window["Dialog" + dialogName].open();
        if (oController.onAfterRendering) oController.onAfterRendering();
      },
      getPermisos: function (aAccion) {
        let oOpciones = {};
        oOpciones.MenuOpcion =
          aAccion.filter((d) => d.accion == "MOFRAC").length > 0;
        oOpciones.ConsolidadoDocumentos =
          aAccion.filter((d) => d.accion == "CDFRAC").length > 0;
        oOpciones.AtencionDocumentos =
          aAccion.filter((d) => d.accion == "ADFRAC").length > 0;
        oOpciones.FraccionarPesaje =
          aAccion.filter((d) => d.accion == "FPFRAC").length > 0;
        oOpciones.Pesaje =
          aAccion.filter((d) => d.accion == "PFRAC").length > 0;
        oOpciones.TaraManual =
          aAccion.filter((d) => d.accion == "TMFRAC").length > 0;
        oOpciones.PesarBultoSaldo =
          aAccion.filter((d) => d.accion == "PBFRAC").length > 0;
        oOpciones.NuevoBultoSaldo =
          aAccion.filter((d) => d.accion == "PBNUEV").length > 0;
        oOpciones.TrasladarHu =
          aAccion.filter((d) => d.accion == "TRASHU").length > 0;
        oOpciones.Configuracion =
          aAccion.filter((d) => d.accion == "OCFRAC").length > 0;
        oOpciones.ReembalajeHU =
          aAccion.filter((d) => d.accion == "RHUFRAC").length > 0;
        return oOpciones;
      },
    });
  }
);
