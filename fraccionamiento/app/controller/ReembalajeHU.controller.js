sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/util/formatter",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
  ],
  function (
    Controller,
    models,
    MessageBox,
    formatter,
    grupoOrden,
    BusyIndicator
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.ReembalajeHU", {
      formatter: formatter,

      onInit: async function () {
        this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        this.oRouter
          .getRoute("reembalajeHU")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      _cargarItems: async function (salaPesajeId) {
        const aUnidades = await grupoOrden.obtenerUnidades();
        this.oLocalModel.setProperty("/aUnidad", aUnidades);
        var aFraccionamientos = await grupoOrden.obtenerFraccionamientosReembalaje(
          salaPesajeId,
          aUnidades
        );
        
        this.oLocalModel.setProperty(
          "/atender",
          true
        );
        this.oLocalModel.setProperty(
          "/ReembalajeHU_Fraccionamientos",
          aFraccionamientos
        );

        const tblReembalajeHU = this.byId("tblReembalajeHU");
        tblReembalajeHU.clearSelection();
      },
      onRouteMatched: async function () {
        try {
          BusyIndicator.show(0);

          var sTitle = this.oResourceBundle.getText("reembalajeHU");
          this.oLocalModel.setProperty("/tituloPagina", sTitle);
          
          this.oConfiguracion = this.oLocalModel.getProperty("/Config");

          const tblGrupoOrden = this.byId("tblReembalajeHU");
          tblGrupoOrden.clearSelection();

          let salaPesajes = await grupoOrden.obtenerSalaPesaje(
            null,
            this.oConfiguracion.plantaId
          );

          this.salaPesajeId = this.oConfiguracion.salaPesajeId;

          this.oLocalModel.setProperty("/SalaPesajes", salaPesajes);
          this.oLocalModel.setProperty(
            "/SalaPesajeId",
            this.oConfiguracion.salaPesajeId
          );

          await this._cargarItems(this.oConfiguracion.salaPesajeId);
          
          BusyIndicator.hide();
        } catch (error) {
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
          BusyIndicator.hide();
        }
      },
      onItemRowSelected: async function (oEvent) {
        try {
          BusyIndicator.show(0);
          this.oFraccionamiento = null;
          
          var oRowSelect = this._getSelectRowTable("tblReembalajeHU");
          if (oRowSelect) {
            this.oFraccionamiento = oRowSelect;
            
            var iSalaPesajeId = this.oLocalModel.getProperty("/SalaPesajeId");
            var oFraccionamiento = await grupoOrden.obtenerFraccionamiento(this.oFraccionamiento.grupoOrdenFraccionamientoId)
            //this.oLocalModel.setProperty("/atender", !(oFraccionamiento.insumoSalaPesajeId != iSalaPesajeId));

            var oDatoExtra = await grupoOrden.ValoresPropCaracteristicasSet({
              CodigoInsumo: oRowSelect.codigoInsumo,
              Lote: oRowSelect.loteInsumo,
              Centro: oRowSelect.centro,
            });

            if (!oDatoExtra || oDatoExtra.error) {
              MessageToast.show("No se encontro información de OBS.");
            } else {
              var oInfoOrden = null;
              if (!oReserva.error) {
                oInfoOrden = oReserva[0];
              }
              oDatoExtra[0].sUnidad = this.oFraccionamiento.unidadOrigen;
              oDatoExtra = grupoOrden._buildObs(oDatoExtra[0], oInfoOrden);

              this.oLocalModel.setProperty(
                "/FactorConversion",
                oDatoExtra.factorConversion != ""
                  ? parseFloat(oDatoExtra.factorConversion)
                  : ""
              );
            }
          }
          BusyIndicator.hide();
        } catch (oError) {
          BusyIndicator.hide();
        }
      },
      onAtenderPress: async function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        if (oOpciones.ReembalajeHU) {
          if (this.oFraccionamiento !== null) {
            this.oLocalModel.setProperty("/Pesaje_Fraccionamiento", null);

            var iSalaPesajeId = this.oLocalModel.getProperty("/SalaPesajeId");
            var oFraccionamiento = await grupoOrden.obtenerFraccionamiento(this.oFraccionamiento.grupoOrdenFraccionamientoId);
            if (oFraccionamiento.insumoSalaPesajeId != iSalaPesajeId){
              return MessageBox.msgAlerta(
                "El insumo se encuentra en otra Sala."
              );
            }
            
            this.oLocalModel.setProperty(
              "/Pesaje_Fraccionamiento",
              this.oFraccionamiento
            );

            this.oRouter.navTo("pesajeReembalajeHU", {
              grupoOrdenFraccionamientoId:
                this.oFraccionamiento.grupoOrdenFraccionamientoId,
            });
          } else {
            MessageBox.msgError(
              this.oResourceBundle.getText("debeSeleccionarFraccion")
            );
          }
        } else {
          return MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onSalaPesajeChange: async function (oEvent) {
        try {
          BusyIndicator.show(0);
          this.byId("tblReembalajeHU").clearSelection();

          var salaPesaje = oEvent
            .getParameter("selectedItem")
            .getBindingContext("localModel")
            .getObject();

          this.salaPesajeId = salaPesaje.salaPesajeId;

          this.oConfiguracion = this.oLocalModel.getProperty("/Config");

          await this._cargarItems(salaPesaje.salaPesajeId);
          this.oFraccionamiento = null;

          this.oLocalModel.setProperty(
            "/atender",
            this.oConfiguracion.salaPesajeId == salaPesaje.salaPesajeId
          );

          this.oLocalModel.refresh(true);

          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
        }
      },
      onRegresarPress: function () {
        this.oFraccionamiento = null;
        window.history.go(-1);
      },
      _getSelectRowTable: function (sIdTable) {
        var oTable = this.byId(sIdTable);
        var iIndex = oTable.getSelectedIndex();
        var sPath;
        if (iIndex < 0) {
          return false;
        } else {
          sPath = oTable.getContextByIndex(iIndex).getPath();
          var oRowSelect = oTable
            .getModel("localModel")
            .getContext(sPath)
            .getObject();
          return oRowSelect;
        }
      },
    });
  }
);
