sap.ui.define(
  [
    "./Base",
    "../service/grupoOrden",
    "../service/config",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (Controller, grupoOrden, configService, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend(
      "mif.cp.fraccionamiento.controller.Configuracion",
      {
        bConfiguracionInicial: false,
        onInit: async function () {
          this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.oServiceModelOnline,
            this.serviceModelOnlineV2
          );
          configService.init(this.oServiceModel);
          this.oRouter
            .getRoute("configuracion")
            .attachPatternMatched(this.onRouteMatched, this);
        },
        onAfterRendering: function () {
          this.oLocalModel.setProperty("/Clave", "");
        },
        onRouteMatched: async function () {
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("configuracion")
          );
          let plantas = await grupoOrden.obtenerPlantas(null);
          plantas.splice(0, 0, { iMaestraId: "", contenido: "Seleccionar..." });
          this.oLocalModel.setProperty("/Plantas", plantas);
          this.oLocalModel.setProperty("/VerConexion", false);

          let configuracion = await configService.obtenerConfiguracion();
          this.bConfiguracionInicial = !configuracion.salaPesajeId;
          this.oLocalModel.setProperty(
            "/Configuracion",
            Object.assign({}, configuracion)
          );
          await this.onPlantaChange();
          this.oLocalModel.setProperty(
            "/Configuracion",
            Object.assign({}, configuracion)
          );
        },
        onPlantaChange: async function (oEvent) {
          try {
            var sPlantaId = null;
            try {
              var source = oEvent.getSource();
              sPlantaId = source.getSelectedKey();
            } catch (oError) {
              sPlantaId = this.oLocalModel.getProperty(
                "/Configuracion/plantaId"
              );
            }
            if (sPlantaId) {
              let impresoras = await grupoOrden.obtenerImpresoras(
                sPlantaId,
                null
              );
              impresoras.sort((a, b) =>
                a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0
              );
              impresoras.splice(0, 0, {
                impresoraId: "",
                nombre: "Seleccionar...",
              });
              this.oLocalModel.setProperty("/Impresoras", impresoras);

              let salaPesajes = await grupoOrden.obtenerSalaPesaje(
                null,
                sPlantaId
              );
              salaPesajes.sort((a, b) =>
                a.sala > b.sala ? 1 : b.sala > a.sala ? -1 : 0
              );
              salaPesajes.splice(0, 0, {
                salaPesajeId: "",
                sala: "Seleccionar...",
              });
              this.oLocalModel.setProperty("/SalaPesajes", salaPesajes);
            } else {
              this.oLocalModel.setProperty("/Impresoras", []);
              this.oLocalModel.setProperty("/SalaPesajes", []);
            }
          } catch (error) {
            MessageBox.msgError(
              this.oResourceBundle.getText("mensajeOcurrioError")
            );
            BusyIndicator.hide();
          }
        },
        onIngresarPress: async function () {
          const clave = this.oLocalModel.getProperty("/Clave");
          const claveActual = window.localStorage.getItem("clave");
          if (clave == claveActual) {
            this.oLocalModel.setProperty("/VerConexion", true);
          } else {
            MessageBox.msgError(
              this.oResourceBundle.getText("errorContrasenaInvalida")
            );
          }
        },
        onKeyPadPress: function (e) {
          const oControl = e.getSource();
          const txtClave = this.byId("txtClave");
          const sText = txtClave.getValue();
          txtClave.setValue(sText + oControl.getText());
        },
        onKeyPadUndoPress: function (e) {
          let sText = this.byId("txtClave").getValue();
          const txtClave = this.byId("txtClave");
          sText = sText.substring(0, sText.length - 1);
          txtClave.setValue(sText);
        },
        onGrabarPress: async function () {
          const oConfiguracion = this.oLocalModel.getProperty("/Configuracion");

          if (
            !oConfiguracion.salaPesajeId ||
            oConfiguracion.salaPesajeId == ""
          ) {
            MessageBox.msgError(
              this.oResourceBundle.getText("debeIngresarSala")
            );
            return;
          }

          if (!oConfiguracion.plantaId || oConfiguracion.plantaId == "") {
            MessageBox.msgError(
              this.oResourceBundle.getText("debeIngresarPlanta")
            );
            return;
          }
          if (!oConfiguracion.impresora || oConfiguracion.impresora == "") {
            MessageBox.msgError(
              this.oResourceBundle.getText("debeIngresarImpresora")
            );
            return;
          }

          const aSalaPesajes = this.oLocalModel.getProperty("/SalaPesajes");

          const oSalaPesaje = aSalaPesajes.find(
            (e) => e.salaPesajeId == oConfiguracion.salaPesajeId
          );
          oConfiguracion.salaPesaje = oSalaPesaje.sala;

          var aPlantas = this.oLocalModel.getProperty("/Plantas");
          const oPlanta = aPlantas.find(
            (e) => e.iMaestraId == oConfiguracion.plantaId
          );
          oConfiguracion.centro = oPlanta.codigoSap;

          await configService.actualizarConfiguracion(oConfiguracion);
          MessageToast.show(
            this.oResourceBundle.getText("guardadoSatisfactorio")
          );
          window.localStorage.setItem("configuracionOk", true);

          this.oLocalModel.setProperty("/Config", oConfiguracion);

          if (this.bConfiguracionInicial) {
            this.oRouter.navTo("menu");
          }
        },
        onRegresarPress: function () {
          window.history.go(-1);
        },
      }
    );
  }
);
