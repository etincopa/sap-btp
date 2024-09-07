sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/config",
    "mif/cp/fraccionamiento/service/sync",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    models,
    MessageBox,
    BusyIndicator,
    grupoOrden,
    config,
    sync,
    JSONModel
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.Home", {
      onInit: async function () {
        this.init();
        var sUrl = window.location.href;
        if (sUrl.indexOf("hc_back") > -1) {
          window.history.go(-3);
        }
        var oModelOnlineV2Model = this.getModelOnlineV2OdataModel();
        oModelOnlineV2Model
          .metadataLoaded()
          .then(this.onMetadataLoaded.bind(this, oModelOnlineV2Model));

        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        config.init(this.oServiceModel);
        sync.init(this.oServiceModel);

        var self = this;
        var txtUsuario = this.getView().byId("txtUsuario");

        this.oLocalModel.setProperty("/tituloPagina", "");

        self.inputControl = txtUsuario;

        txtUsuario.addEventDelegate({
          onfocusin: function () {
            self.inputControl = txtUsuario;
          },
        });

        var txtPassword = this.getView().byId("txtPassword");
        txtPassword.addEventDelegate({
          onfocusin: function () {
            self.inputControl = txtPassword;
          },
        });
      },
      onAfterRendering: function (oEvent) {
        var that = this;
        setTimeout(function () {
          if (!that.getJsonModel("OnlineV2")) {
            that.onLogin();
          }
        }, 4000);
      },
      onMetadataLoaded: function (myODataModel) {
        var metadata = myODataModel.getServiceMetadata();
        var aEntidades = metadata.dataServices.schema[0].entityType;
        var oInforme = {};
        this.setJsonModel(oInforme, "OnlineV2", false);
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
      getJsonModel: function (ModelName) {
        return this.getView().getModel(ModelName);
      },
      getModelOnlineV2OdataModel: function () {
        this.getOwnerComponent()
          .getModel("serviceModelOnlineV2")
          .refreshSecurityToken();
        return this.getOwnerComponent().getModel("serviceModelOnlineV2");
      },
      onLogin: function (oEvent) {
        /*location.href =
          "https://medifarmaqas.cpp.cfapps.us10.hana.ondemand.com/d40e127d-4f81-4861-aec4-9cd2fa045ab4.com-medifarma-login-medifarmalogin.commedifarmaloginmedifarmalogin-0.0.1/?hc_back&saml2idp=ao1k9k5jk.accounts.ondemand.com";*/
      },
      onPress: function (oEvent) {
        var bEsPesoManual = this.oLocalModel.getProperty("/EsLecturaManual");
        if (bEsPesoManual) {
        } else {
          if (oEvent.mParameters.value.length > 0) {
            this.oLocalModel.setProperty("/Pesaje_Bulto", "");
          }
        }
        if (window.event) {
          var charCode = window.event.keyCode;
        } else if (e) {
          var charCode = e.which;
        } else {
          return true;
        }
        if (
          (charCode > 64 && charCode < 91) ||
          (charCode > 96 && charCode < 123)
        )
          return true;
        else return false;
      },
      onIngresarPress: async function (e) {
        try {
          const usuario = this.oLocalModel.getProperty("/Usuario");
          const clave = this.oLocalModel.getProperty("/Clave");
          debugger;

          if (usuario && clave && usuario != "" && clave != "") {
            BusyIndicator.show(0);

            var userAgent = navigator.userAgent.toUpperCase();
            if (userAgent.indexOf(" ELECTRON/") > -1) {
            }

            if (navigator.onLine) {
              //Si es online
              let result = await grupoOrden.auth(usuario, clave);
              if (result.iCode == "1" && result.oResult.value) {
                var oUserLogin = result.oResult.value.data.results[0];
                if (!oUserLogin) {
                  BusyIndicator.hide();
                  return MessageBox.msgError(
                    "El Usuario y/o contraseña incorrectos."
                  );
                }

                if (
                  !oUserLogin ||
                  !(oUserLogin.aRol && oUserLogin.aRol.length)
                ) {
                  BusyIndicator.hide();
                  return MessageBox.msgError(
                    "Error de acceso, puede que tu usuario no tiene permisos para acceder a la aplicación."
                  );
                }
                //await sync.sync();

                var oUsuario = oUserLogin.oUsuario;
                oUsuario.aRol = oUserLogin.aRol;
                const oConfig = await config.obtenerConfiguracion();
                this.oLocalModel.setProperty("/Config", oConfig);
                this.oLocalModel.setProperty("/Online", true);
                this.oLocalModel.setProperty("/InfoUsuario", oUsuario);

                let oOpciones = this.getPermisos(oUserLogin.aRol);

                if (!oOpciones.MenuOpcion) {
                  MessageBox.msgAlerta(
                    "No tiene permisos para ingresar al Menú."
                  );
                  BusyIndicator.hide();
                  return;
                }

                window.localStorage.setItem(
                  "AccionAtencionDocumentos",
                  oOpciones.AtencionDocumentos
                );

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

                window.localStorage.setItem("usuario", usuario);
                window.localStorage.setItem("clave", clave);
                window.localStorage.setItem(
                  "InfoUsuario",
                  JSON.stringify(oUsuario)
                );
                window.localStorage.setItem("usuarioCodigo", oUsuario.usuario);
              } else {
                MessageBox.msgError(
                  this.oResourceBundle.getText("errorUsuarioContrasenaInvalida")
                );
                BusyIndicator.hide();
              }
            } else {
              BusyIndicator.hide();
              const offlineUsuario = window.localStorage.getItem("usuario");
              const offlineClave = window.localStorage.getItem("clave");
              if (offlineUsuario == usuario && offlineClave == clave) {
                var oUserLogin = JSON.parse(
                  window.localStorage.getItem("InfoUsuario")
                );
                var sUserCodigo = window.localStorage.getItem("usuarioCodigo");

                this.oLocalModel.setProperty(
                  "/usuarioNombreCompleto",
                  oUserLogin.apellidoPaterno +
                    " " +
                    oUserLogin.apellidoMaterno +
                    ", " +
                    oUserLogin.nombre
                );
                const oConfig = await config.obtenerConfiguracion();

                var AccionAtencionDocumentos = window.localStorage.getItem(
                  "AccionAtencionDocumentos"
                );

                let oOpciones = {
                  AtencionDocumentos: AccionAtencionDocumentos,
                };

                this.oLocalModel.setProperty("/Opciones", oOpciones);

                this.oLocalModel.setProperty("/Config", oConfig);
                this.oLocalModel.setProperty("/usuarioCodigo", sUserCodigo);
                this.oLocalModel.setProperty("/InfoUsuario", oUserLogin);
                this.oLocalModel.setProperty("/Online", false);
                this.oRouter.navTo("menu");
              } else {
                MessageBox.msgError(
                  this.oResourceBundle.getText("errorUsuarioContrasenaInvalida")
                );
              }
            }
          } else {
            MessageBox.msgError(
              this.oResourceBundle.getText("errorUsuarioContrasenaIngrese")
            );
            BusyIndicator.hide();
          }
        } catch (error) {
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
          BusyIndicator.hide();
        }
      },
      onSalirPress: function (e) {
        MessageBox.confirm(this.oResourceBundle.getText("deseaSalir"), {
          actions: ["SI", "NO"],
          title: "Confirmar",
          onClose: function (sAction) {
            if (sAction == "SI") {
              window.close();
            }
          },
        });
      },
      onKeyPadPress: function (e) {
        var oControl = e.getSource();
        var sText = this.inputControl.getValue();
        this.inputControl.setValue(sText + oControl.getText());
      },
      onKeyPadUndoPress: function (e) {
        var sText = this.inputControl.getValue();
        sText = sText.substring(0, sText.length - 1);
        this.inputControl.setValue(sText);
      },
    });
  }
);
