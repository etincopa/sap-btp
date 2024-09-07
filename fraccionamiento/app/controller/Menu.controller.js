sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    models,
    MessageBox,
    grupoOrden,
    BusyIndicator,
    MessageToast
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.Menu", {
      onInit: async function () {
        this.init();
        this.oRouter
          .getRoute("menu")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      onRouteMatched: async function () {
        try {
          BusyIndicator.show(0);
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("inicio")
          );

          if (navigator.onLine) {
            var usuario = window.localStorage.getItem("usuario");
            var clave = window.localStorage.getItem("clave");

            var result = await grupoOrden.auth(usuario, clave);
            if (result.iCode == "1" && result.oResult.value) {
              var oUserLogin = result.oResult.value.data.results[0];
              if (!oUserLogin || !(oUserLogin.aRol && oUserLogin.aRol.length)) {
                this.oRouter.navTo("RouteHome");
              }

              var oUsuario = oUserLogin.oUsuario;
                oUsuario.aRol = oUserLogin.aRol;

              let oOpciones = this.getPermisos(oUsuario.aRol);

              if (!oOpciones.MenuOpcion) {
                this.oRouter.navTo("RouteHome");
              }
              this.oLocalModel.setProperty("/Opciones", oOpciones);
              this.oLocalModel.setProperty("/InfoUsuario", oUsuario);
              window.localStorage.setItem(
                "InfoUsuario",
                JSON.stringify(oUsuario)
              );
            } else {
              this.oRouter.navTo("RouteHome");
            }
          }

          var oConfig = this.oLocalModel.getProperty("/Config");
          if (oConfig) {
            let impresoras = await grupoOrden.obtenerImpresoras(
              null,
              oConfig.impresora
            );
            let plantas = await grupoOrden.obtenerPlantas(oConfig.plantaId);
            let salaPesajes = await grupoOrden.obtenerSalaPesaje(
              oConfig.salaPesajeId,
              null
            );
            if (
              impresoras &&
              impresoras.length &&
              plantas &&
              plantas.length &&
              salaPesajes &&
              salaPesajes.length
            ) {
            } else {
              this.oRouter.navTo("configuracion");
            }
          } else {
            this.oRouter.navTo("configuracion");
          }
          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();  
        }
      },
      onAtencionPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        if (oOpciones.AtencionDocumentos) {
          this.oRouter.navTo("atencion");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onConsultaOrdenesPress: function () {
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (bOnline) {
          this.oRouter.navTo("consultaorden");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onPesarBultoSaldoPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (oOpciones.PesarBultoSaldo && bOnline) {
          this.oLocalModel.setProperty("/optionBultoSaldo", "PESA");
          this.oRouter.navTo("pesarbultosaldo");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onCrearAdicionalBultoSaldoPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (oOpciones.PesarBultoSaldo && bOnline) {
          this.oLocalModel.setProperty("/optionBultoSaldo", "CREA_ADICIONAL");
          this.oRouter.navTo("pesarbultosaldo");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onCrearNuevoBultoSaldoPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (oOpciones.NuevoBultoSaldo && bOnline) {
          this.oLocalModel.setProperty("/optionBultoSaldo", "CREA_NUEVO");
          this.oRouter.navTo("pesarbultosaldo");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onTrasladarHuPress: function (oEvent) {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (oOpciones.TrasladarHu && bOnline) {
          this.oRouter.navTo("trasladarhu");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onConfiguracionPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");

        if (oOpciones.Configuracion && bOnline) {
          this.oRouter.navTo("configuracion");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onReembalajeHUPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");

        if (oOpciones.ReembalajeHU && bOnline) {
          this.oRouter.navTo("reembalajeHU");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onSalirPress: function () {
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
    });
  }
);
