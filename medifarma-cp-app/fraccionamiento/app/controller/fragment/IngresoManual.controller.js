sap.ui.define(
  [
    "mif/cp/fraccionamiento/controller/Base",
    "mif/cp/fraccionamiento/util/formatter",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/m/MessageBox",
  ],
  function (Controller, formatter, grupoOrden, MessageBox) {
    "use strict";
    return Controller.extend(
      "mif.cp.fraccionamiento.controller.fragment.IngresoManual",
      {
        formatter: formatter,
        onInit: async function () {
          await this.init();
          this.oLocalModel.setProperty("/VerPesaje", true);

          const bus = this.oOwnerComponent.getEventBus();
          bus.subscribe(
            "IngresoManual",
            "actualizarPesoNeto",
            this.actualizarPesoNeto,
            this
          );
        },
        validarPesajeManual: async function () {
          var oConfiguracion = this.oLocalModel.getProperty("/Config");

          var permiso = {
            pesajeManualValido: false,
            taraManualValido: false,
          };
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

            permiso.pesajeManualValido =
              oSalaPesaje.oEstadoPesoManual_codigo != "DHABI";
            permiso.taraManualValido =
              oSalaPesaje.oEstadoTaraManual_codigo != "DHABI";
          }

          return permiso;
        },
        actualizarPesoNeto: function () {
          const pendiente = this.oLocalModel.getProperty(
            "/IngresoManual_PesoNeto"
          );
          const tara = new Number(this.byId("lblTara").getText());
          let pesoNeto = pendiente;

          if (!isNaN(tara)) {
            pesoNeto -= tara;
          }

          this.oLocalModel.setProperty("/IngresoManual_PesoNeto", pesoNeto);
        },
        onKeyPadPress2: function (e) {
          const oControl = e.getSource();
          const txtClave = this.byId("txtClave");
          const sText = txtClave.getValue();
          txtClave.setValue(sText + oControl.getText());
        },
        onKeyPadUndoPress2: function (e) {
          let sText = this.byId("txtClave").getValue();
          const txtClave = this.byId("txtClave");
          sText = sText.substring(0, sText.length - 1);
          txtClave.setValue(sText);
        },
        onIngresarPress: function () {
          const clave = this.oLocalModel.getProperty("/ClavePesaje");
          const claveActual = window.localStorage.getItem("clave");
          if (clave == claveActual) {
            this.oLocalModel.setProperty("/VerPesaje", true);
          } else {
            MessageBox.msgError(
              this.oResourceBundle.getText("errorContrasenaInvalida")
            );
          }
        },
        onAfterRendering: async function () {
          var oPermiso = await this.validarPesajeManual();
          if (!oPermiso.pesajeManualValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermitePesajeManual")
            );
            this.byId("dialogIngresoManual").close();
            return;
          }

          const pendiente = this.oLocalModel.getProperty("/Pesaje_Pendiente2");
          this.oLocalModel.setProperty(
            "/IngresoManual_PesoNeto",
            formatter.peso(pendiente)
          );

          this.oLocalModel.setProperty(
            "/IngresoManual_Tara",
            this.oLocalModel.getProperty("/Pesaje_Fraccionamiento/taraFrac")
          );
          this.oLocalModel.setProperty("/IngresoManual_InicioKeyPad", true);
          this.oLocalModel.setProperty("/VerPesaje", true);
          this.oLocalModel.setProperty("/ClavePesaje", "");

          this.onTaraManualPress();
        },
        onTaraManualPress: async function () {
          this.openDialog("TaraManual", { source: "Pesaje", esTaraIngresoManual: true });
        },
        onKeyPadUndoPress: async function (e) {
          var oPermiso = await this.validarPesajeManual();
          if (!oPermiso.pesajeManualValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermitePesajeManual")
            );
            return;
          }

          let sText = this.oLocalModel.getProperty("/IngresoManual_PesoNeto");

          sText = sText.toString().substring(0, String(sText).length - 1);

          if (sText == "") {
            sText = "0.000";
            this.oLocalModel.setProperty("/IngresoManual_InicioKeyPad", true);
          }
          //this.oLocalModel.setProperty("/IngresoManual_PesoNeto", sText);
          //this.actualizarPesoNeto();
        },
        onKeyPadPress: async function (oEvent) {
          const oControl = oEvent.getSource();

          var oPermiso = await this.validarPesajeManual();
          if (!oPermiso.pesajeManualValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermitePesajeManual")
            );
            return;
          }

          let sText = this.oLocalModel.getProperty("/IngresoManual_PesoNeto");

          if (this.oLocalModel.getProperty("/IngresoManual_InicioKeyPad")) {
            sText = "";
            this.oLocalModel.setProperty("/IngresoManual_InicioKeyPad", false);
          }

          const fNumber = new Number(sText + oControl.getText());

          if (!isNaN(fNumber)) {
            var fFactorConversionBalanza = this.oLocalModel.getProperty(
              "/FactorConversionBalanza"
            );
            //this.oLocalModel.setProperty("/IngresoManual_PesoNeto", sText + oControl.getText());
          }
          //this.actualizarPesoNeto();
        },
        onAceptarPress: async function () {
          var oPermiso = await this.validarPesajeManual();
          if (!oPermiso.pesajeManualValido) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermitePesajeManual")
            );
            return;
          }

          const pesoNeto = this.oLocalModel.getProperty(
            "/IngresoManual_PesoNeto"
          );
          let tara = this.oLocalModel.getProperty("/IngresoManual_Tara");

          if (+tara == 0) {
            MessageBox.msgError("El valor de la tara debe ser mayor a CERO");
            BusyIndicator.hide();
            return;
          }

          this.oLocalModel.setProperty(
            "/Pesaje_PesoBalanza",
            formatter.peso(pesoNeto)
          );
          this.oLocalModel.setProperty(
            "/Pesaje_PesoBalanzaNeto",
            formatter.peso(pesoNeto)
          );

          var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidadMostrar");

          var cantPesar = tara;
          var cantBalanza = tara;
          var umBalanza = "G";
          var oPeso = this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanza
          );
          tara = oPeso.oFactorToBalanza.peso;

          this.oLocalModel.setProperty(
            "/Pesaje_Fraccionamiento/taraFrac",
            tara
          );
          this.oLocalModel.setProperty("/Pesaje_TaraBalanza", tara);
          this.oLocalModel.setProperty("/Pesaje_TotalBalanza", tara);

          const bus = this.oOwnerComponent.getEventBus();

          bus.publish(this.oParam.source, "actualizarTotal", {});
          
          window["DialogIngresoManual"].close()
          //this.byId("").close();
        },
        onCancelarPress: function () {
          window["DialogIngresoManual"].close()
          //this.byId("").close();
        },
        _factConversion: function (
          cantPesar,
          umInsumo,
          cantBalanza,
          umBalanza
        ) {
          var aFactConversion = this._getProperty("/aFactor");
          var aTipoBalanzaReq = [
            { balanza: "ANALITICA", umb: "G", from: 0, to: 100 },
            { balanza: "MESA", umb: "G", from: 100, to: 32000 },
            { balanza: "PISO", umb: "G", from: 32000, to: 150000 },
          ];

          var iFact = 1;
          if (umBalanza.toUpperCase() === umInsumo.toUpperCase()) {
            iFact = 1;
          } else {
            var oFactConversion = aFactConversion.find((o) => {
              return (
                o.codigoSap == umInsumo.toUpperCase() &&
                o.codigo == umBalanza.toUpperCase()
              );
            });

            iFact = +oFactConversion.campo1;
          }

          var iCantFact = +cantPesar;
          if (umInsumo.toUpperCase() === "KG") {
            iCantFact = +cantPesar * 1000;
          }
          var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
            return iCantFact > o.from && iCantFact <= o.to;
          });

          var iPesoFact = +cantBalanza * iFact;

          return {
            oInsumo: {
              peso: cantPesar,
              umb: umInsumo,
            },
            oBalanza: {
              tipo: oTipoBalanzaReq ? oTipoBalanzaReq.balanza : "",
              peso: cantBalanza,
              umb: umBalanza,
            },
            oFactorToBalanza: {
              peso: iPesoFact,
              umb: umInsumo,
              factor: iCantFact,
            },
          };
        },
        _getProperty: function (sName) {
          return this.oLocalModel.getProperty(sName);
        },
      }
    );
  }
);
