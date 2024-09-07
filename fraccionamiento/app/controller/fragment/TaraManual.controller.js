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
      "mif.cp.fraccionamiento.controller.fragment.TaraManual",
      {
        formatter: formatter,
        onInit: function () {
          this.init();
        },
        onAfterRendering: async function () {
          
          var aSources = ["Pesaje", "PesajeReembalajeHU"]
          if (aSources.includes(this.oParam.source)) {
            var bValido = await this.validarTaraManual();
            if (!bValido) {
              MessageBox.msgAlerta(
                this.oResourceBundle.getText("mensajePermiteTaraManual")
              );
              this.byId("dialogTaraManual").close();
              return;
            }
          }

          const pendiente = this.oLocalModel.getProperty("/Pesaje_Pendiente");
          var iTara = this.oLocalModel.getProperty(
            "/Pesaje_Fraccionamiento/taraFrac"
          );
          if (!iTara) iTara = 0;

          var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidadMostrar");
          var sUnidadBalanzaP = this.oParam.esBalanzaPiso ? "KG" : "G";

          if (iTara > 0){
            if (sUnidadBalanzaP == "G" && umInsumo.toUpperCase() == "KG"){
              this.oLocalModel.setProperty("/IngresoManual_Tara", iTara * 1000);
            }else{
              this.oLocalModel.setProperty("/IngresoManual_Tara", iTara);
            }
          }else{
            this.oLocalModel.setProperty("/IngresoManual_Tara", "0.000");
          }
          
          this.oLocalModel.setProperty("/TaraManual_InicioKeyPad", true);

          this.oLocalModel.setProperty("/IngresoManual_Unidad", this.oParam.esBalanzaPiso ? "KG" : "G");
        },
        validarTaraManual: async function () {
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
            bValido = oSalaPesaje.oEstadoTaraManual_codigo != "DHABI";
          }

          if (this.oParam.esTaraIngresoManual){
            bValido = true;
          }

          return bValido;
        },
        onKeyPadUndoPress: async function (e) {
          var aSources = ["Pesaje", "PesajeReembalajeHU"]
          if (aSources.includes(this.oParam.source)) {
            var bValido = await this.validarTaraManual();
            if (!bValido) {
              MessageBox.msgAlerta(
                this.oResourceBundle.getText("mensajePermiteTaraManual")
              );
              return;
            }
          }

          let sText = this.oLocalModel.getProperty("/IngresoManual_Tara");
          if (!sText) sText = "0";

          sText = String(sText)
          sText = sText.substring(0, sText.length - 1);

          if (sText == "") {
            sText = "0.000";
            this.oLocalModel.setProperty("/TaraManual_InicioKeyPad", true);
          }
          this.oLocalModel.setProperty("/IngresoManual_Tara", sText);
        },
        onKeyPadPress: async function (oEvent) {
          const oControl = oEvent.getSource();

          var aSources = ["Pesaje", "PesajeReembalajeHU"]
          if (aSources.includes(this.oParam.source)) {
            var bValido = await this.validarTaraManual();
            if (!bValido) {
              MessageBox.msgAlerta(
                this.oResourceBundle.getText("mensajePermiteTaraManual")
              );
              return;
            }
          }

          let sText = this.oLocalModel.getProperty("/IngresoManual_Tara");
          if (!sText) sText = "";
          
          if (this.oLocalModel.getProperty("/TaraManual_InicioKeyPad")) {
            sText = "";
            this.oLocalModel.setProperty("/TaraManual_InicioKeyPad", false);
          }

          var sNewText = sText + oControl.getText();
          const fNumber = new Number(sNewText);

          if (!isNaN(fNumber)) {
            var sDecimalLength = formatter.cantidadDecimal(sNewText);

            if (sDecimalLength < 4){
              this.oLocalModel.setProperty(
                "/IngresoManual_Tara",
                sText + oControl.getText()
              );
            }
          }
        },
        onAceptarPress: async function () {
          var aSources = ["Pesaje", "PesajeReembalajeHU"]
          if (aSources.includes(this.oParam.source)) {
            var bValido = await this.validarTaraManual();
            if (!bValido) {
              MessageBox.msgAlerta(
                this.oResourceBundle.getText("mensajePermiteTaraManual")
              );
              return;
            }
          }

          let tara = this.oLocalModel.getProperty("/IngresoManual_Tara");

          if (+tara == 0) {
            MessageBox.msgError("El valor ingresado debe ser mayor a CERO");
            BusyIndicator.hide();
            return;
          }

          const bus = this.oOwnerComponent.getEventBus();

          var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidadMostrar");

          var cantPesar = tara;
          var cantBalanza = tara;
          var umBalanza = this.oLocalModel.getProperty("/IngresoManual_Unidad");;
          var oPeso = this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanza
          );
          tara = oPeso.oFactorToBalanza.peso;

          if (aSources.includes(this.oParam.source)) {
            this.oLocalModel.setProperty("/Pesaje_TaraBalanza", tara);
            this.oLocalModel.setProperty(
              "/Pesaje_Fraccionamiento/taraFrac",
              tara
            );
            this.oLocalModel.setProperty("/Pesaje_TotalBalanza", tara);

            //var fPendiente = this.oLocalModel.getProperty("/Pesaje_Pendiente2");
            //this.oLocalModel.setProperty("/Pesaje_PesoBalanza", formatter.peso(+fPendiente + +tara));

            bus.publish(this.oParam.source, "onEstablecerTaraManual", {});
          } else if (this.oParam.source == "IngresoManual") {
            var fPendiente = this.oLocalModel.getProperty("/Pesaje_Pendiente2");
            fPendiente = formatter.peso(fPendiente);
            //bus.publish("IngresoManual", "actualizarPesoNeto", {  });
            //this.oLocalModel.setProperty("/IngresoManual_PesoNeto", +fPendiente + +tara);
            this.oLocalModel.setProperty(
              "/Pesaje_Fraccionamiento/taraFrac",
              tara
            );
          }
          
          
          bus.publish(this.oParam.source, "actualizarTotal", {});

          try {
            var oFraccionamiento = this.oLocalModel.getProperty(
              "/Pesaje_Fraccionamiento"
            );
            if (oFraccionamiento) {
              /*await grupoOrden.actualizarTaraFraccion(
                oFraccionamiento.grupoOrdenFraccionamientoId,
                parseFloat(tara).toFixed(3)
              );*/
            }
          } catch (oError) {
            MessageBox.msgError("Error al guardar la tara.");
          }

          window["DialogTaraManual"].close()
          //this.byId("dialogTaraManual").close();
        },
        onCancelarPress: function () {
          const self = this;
          MessageBox.confirm(
            this.oResourceBundle.getText("deseaCerrarVentana"),
            {
              actions: ["SI", "NO"],
              title: "Confirmar",
              onClose: function (sAction) {
                if (sAction == "SI") {
                  window["DialogTaraManual"].close()
                  //self.byId("dialogTaraManual").close();
                }
              },
            }
          );
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
