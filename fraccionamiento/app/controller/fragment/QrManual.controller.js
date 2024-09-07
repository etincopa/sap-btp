sap.ui.define(
  [
    "mif/cp/fraccionamiento/controller/Base",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
  ],
  function (Controller, formatter, MessageBox, grupoOrden) {
    "use strict";
    return Controller.extend(
      "mif.cp.fraccionamiento.controller.fragment.QrManual",
      {
        formatter: formatter,
        onInit: function () {
          this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.oServiceModelOnline,
            this.serviceModelOnlineV2
          );
        },
        onAfterRendering: async function () {
          var bValido = await this.validarQrManual();

          if (!bValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermiteQrManual")
            );
            this.byId("dialogQrManual").close();
            return;
          }

          this.oLocalModel.setProperty("/QrManual", "");
        },
        validarQrManual: async function () {
          var oConfiguracion = this.oLocalModel.getProperty("/Config");

          var bValido = false;
          var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
            oConfiguracion.salaPesajeId,
            null
          );
          if (oSalaPesaje) {
            oSalaPesaje = oSalaPesaje[0];
            this.oLocalModel.setProperty(
              "/EsTaraManual",
              oSalaPesaje.oEstadoTaraManual_codigo != "DHABI"
            );
            this.oLocalModel.setProperty(
              "/EsPesoManual",
              oSalaPesaje.oEstadoPesoManual_codigo != "DHABI"
            );
            this.oLocalModel.setProperty(
              "/EsLecturaManual",
              oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI"
            );

            bValido = oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI";
          }

          if (this.oParam.source == "ConsultaOrden") {
            bValido = true;
          }

          return bValido;
        },
        onKeyPadUndoPress: async function (e) {
          var bValido = await this.validarQrManual();
          if (!bValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermiteQrManual")
            );
            return;
          }

          let sText = this.oLocalModel.getProperty("/QrManual");
          sText = sText.substring(0, sText.length - 1);

          if (sText == "") {
            sText = "";
            this.oLocalModel.setProperty("/TaraManual_InicioKeyPad", true);
          }
          this.oLocalModel.setProperty("/QrManual", sText);
        },
        onKeyPadPress: async function (oEvent) {
          const oControl = oEvent.getSource();

          var bValido = await this.validarQrManual();
          if (!bValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermiteQrManual")
            );
            return;
          }

          let sText = this.oLocalModel.getProperty("/QrManual");
          if (!sText) sText = "";

          this.oLocalModel.setProperty("/QrManual", sText + oControl.getText());
        },
        onAceptarPress: async function () {
          var bValido = await this.validarQrManual();
          if (!bValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermiteQrManual")
            );
            return;
          }

          const tara = this.oLocalModel.getProperty("/TaraManual_Tara");

          const bus = this.oOwnerComponent.getEventBus();

          var sQrManual = this.oLocalModel.getProperty("/QrManual");
          if (this.oParam.source == "Pesaje") {
            this.oLocalModel.setProperty("/Pesaje_Bulto", sQrManual);
            bus.publish("Pesaje", "onScanSaldoHU", {});
          } else if (this.oParam.source == "IngresoManual") {
            this.oLocalModel.setProperty("/IngresoManual_Tara", tara);
            bus.publish("Pesaje", "onScanSaldoHU", {});
          } else if (this.oParam.source == "ConsultaOrden") {
            this.oLocalModel.setProperty("/orden", sQrManual);
            bus.publish("Pesaje", "onScanSaldoHU", {});
          } else if (this.oParam.source == "PesajeReembalajeHU_NORMAL") {
            this.oLocalModel.setProperty("/Pesaje_Bulto", sQrManual);
            bus.publish("PesajeReembalajeHU", "onScanSaldoHU", {});
          } else if (this.oParam.source == "PesajeReembalajeHU_AJUSTE") {
            this.oLocalModel.setProperty("/HUAjuste", sQrManual);
            bus.publish("PesajeReembalajeHU", "onScanSaldoHUAjuste", {});
          }

          window["DialogQrManual"].close()
          //this.byId("dialogQrManual").close();
        },
        onCancelarPress: function () {
          window["DialogQrManual"].close()
          //this.byId("dialogQrManual").close();
        },
      }
    );
  }
);
