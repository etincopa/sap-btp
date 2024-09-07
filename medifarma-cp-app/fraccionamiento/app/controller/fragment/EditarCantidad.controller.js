sap.ui.define(
  [
    "mif/cp/fraccionamiento/controller/Base",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
  ],
  function (Controller, formatter, MessageBox, grupoOrden, BusyIndicator) {
    "use strict";

    return Controller.extend(
      "mif.cp.fraccionamiento.controller.fragment.EditarCantidad",
      {
        formatter: formatter,
        onInit: async function () {
          await this.init(this.oServiceModel);
          grupoOrden.init(
            this.oServiceModel,
            this.serviceModelOnlineV2,
            this.serviceModelOnlineV2
          );

            
          let aUnidades = await grupoOrden.obtenerUnidades();
          let aUnidadesFilter = aUnidades.filter(
            (e) => e.codigo == "G" || e.codigo == "KG"
          );
          this.oLocalModel.setProperty("/Cantidad_UnidadesFilter", aUnidadesFilter);
          this.oLocalModel.setProperty("/Cantidad_Unidades", aUnidades);
        },
        onAfterRendering: function () {
          const oFraccionamiento = this.oLocalModel.getProperty(
            "/Detalle_Fraccionamiento"
          );

          var aDetalleFraccionamientos = this.oLocalModel.getProperty(
            "/Detalle_Fraccionamientos"
          );
          
          aDetalleFraccionamientos = aDetalleFraccionamientos.filter(d => d.ordenId == oFraccionamiento.ordenId);
          
          var iIdx = aDetalleFraccionamientos.length - 1;
          var numSubFraccion = aDetalleFraccionamientos.length > 0 ? aDetalleFraccionamientos[iIdx].numSubFraccion : -1

          if (numSubFraccion == oFraccionamiento.numSubFraccion){
            this.oLocalModel.setProperty("/duplicar", true);
          }else{
            this.oLocalModel.setProperty("/duplicar", false);
          }

          const fRequerido = oFraccionamiento.requeridoFinal;

          this.oLocalModel.setProperty(
            "/Cantidad_UnidadId",
            oFraccionamiento.unidad.toUpperCase()
          );
          this.oLocalModel.setProperty(
            "/Cantidad_Requerido",
            formatter.peso(fRequerido)
          );
          this.oLocalModel.setProperty("/Cantidad_InicioKeyPad", true);
          this.oLocalModel.setProperty("/Cantidad_Duplicar", false);
        },
        _factConversion: async function (
          cantPesar,
          umInsumo,
          cantBalanza,
          umBalanza
        ) {
          var aFactConversion = await grupoOrden.obtenerFactor();

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
        onKeyPadUndoPress: function (e) {
          let sText = this.oLocalModel.getProperty("/Cantidad_Requerido");
          sText = sText.substring(0, sText.length - 1);

          if (sText == "") {
            sText = "0.000";
            this.oLocalModel.setProperty("/Cantidad_InicioKeyPad", true);
          }
          this.oLocalModel.setProperty("/Cantidad_Requerido", sText);
        },
        onKeyPadPress: function (oEvent) {
          const oControl = oEvent.getSource();

          let sText = this.oLocalModel.getProperty("/Cantidad_Requerido");
          if (!sText) sText = "";

          if (this.oLocalModel.getProperty("/Cantidad_InicioKeyPad")) {
            sText = "";
            this.oLocalModel.setProperty("/Cantidad_InicioKeyPad", false);
          }

          var sNewText = sText + oControl.getText();
          const fNumber = new Number(sNewText);

          if (!isNaN(fNumber)) {
            var sDecimalLength = formatter.cantidadDecimal(sNewText);

            if (sDecimalLength < 4){
              this.oLocalModel.setProperty(
                "/Cantidad_Requerido",
                sNewText
              );
            }
          }
        },
        onAceptarPress: async function () {
          BusyIndicator.show(0);
          const oFraccionamiento = this.oLocalModel.getProperty(
            "/Detalle_Fraccionamiento"
          );

          let aDet = this.oLocalModel.getProperty("/Detalle_Fraccionamientos");

          var fCantidadSugerida = +oFraccionamiento.cantSugerida;
          var fFactorConversion =
            this.oLocalModel.getProperty("/FactorConversion");

          if (!fFactorConversion) {
            fFactorConversion = 0;
          }
          

          const sGrupoOrdenFraccionamientoId =
            oFraccionamiento.grupoOrdenFraccionamientoId;
          let fCantidad = this.oLocalModel.getProperty("/Cantidad_Requerido");
          let iUnidad = this.oLocalModel.getProperty("/Cantidad_UnidadId");
          const bDuplicar = this.oLocalModel.getProperty("/Cantidad_Duplicar")
            ? this.oLocalModel.getProperty("/Cantidad_Duplicar")
            : false;
          const sUsuario = window.localStorage.getItem("usuarioCodigo");

          aDet = aDet.filter(
            (e) =>
              e.grupoOrdenFraccionamientoId != sGrupoOrdenFraccionamientoId &&
              e.ordenNumero == oFraccionamiento.ordenNumero &&
              e.loteInsumo == oFraccionamiento.loteInsumo &&
              e.numFraccion == oFraccionamiento.numFraccion
          );
          
          if (!bDuplicar) {
            
          } else {
            fCantidad = 0;
          }

          let fTotalCantidadPesar = 0;
          aDet.forEach(function (e) {
            fTotalCantidadPesar += +e.requeridoFinal;
            fCantidadSugerida += +e.cantSugerida;
          });

          if (
            oFraccionamiento.unidadOriginal != oFraccionamiento.unidad &&
            fFactorConversion != ""
          ) {
            fCantidadSugerida = parseFloat(
              fCantidadSugerida * fFactorConversion
            ).toFixed(3);
          }

          var umInsumo = oFraccionamiento.unidad;
          var cantPesar = fCantidad;
          var umBalanza = iUnidad;
          var cantBalanza = fCantidad;
          var oPeso = await this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanza
          );

          //fCantidad = formatter.peso(oPeso.oFactorToBalanza.peso)
          var fPeso = Number(formatter.peso(oPeso.oFactorToBalanza.peso));
          fTotalCantidadPesar = Number(fTotalCantidadPesar) + fPeso;

          oPeso = await this._factConversion(
            fCantidadSugerida,
            umInsumo,
            fCantidadSugerida,
            umInsumo
          );

          var fCantidadSugerida = +formatter.peso(oPeso.oFactorToBalanza.peso);
          var fTotalPorcentaje = +formatter.peso(+fCantidadSugerida * 5 / 100);
          fCantidadSugerida += +fTotalPorcentaje;

          if (fTotalCantidadPesar > fCantidadSugerida) {
            MessageBox.msgAlerta("Ha excedido la cantidad sugerida.");
            BusyIndicator.hide();
            return;
          }

          iUnidad = iUnidad.toLowerCase();
          oFraccionamiento.unidad = iUnidad;
          const result = await grupoOrden.actualizarCantidadFraccion(
            sGrupoOrdenFraccionamientoId,
            fCantidad,
            iUnidad,
            bDuplicar,
            sUsuario,
            oFraccionamiento.ordenDetalleId
          );
          const iEstadoId = this.oLocalModel.getProperty("/Detalle_Estado");
          var iConsolidadoSalaId = this.oLocalModel.getProperty("/Consolidado_salaId");
          var aUnidades = this.oLocalModel.getProperty("/Cantidad_Unidades");
          const aFraccionamientos = await grupoOrden.obtenerFraccionamientos(
            oFraccionamiento.grupoOrdenConsolidadoId,
            null,
            iEstadoId,
            iConsolidadoSalaId,
            aUnidades
          );
          this.oLocalModel.setProperty(
            "/Detalle_Fraccionamientos",
            aFraccionamientos
          );
          oFraccionamiento.requeridoFinal = fCantidad;

          this.byId("tblFraccionamientos").clearSelection();
          BusyIndicator.hide();
          this.byId("dialogEditarCantidad").close();
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
                  self.byId("dialogEditarCantidad").close();
                }
              },
            }
          );
        },
        _getProperty: function (sName) {
          return this.oLocalModel.getProperty(sName);
        },
      }
    );
  }
);
