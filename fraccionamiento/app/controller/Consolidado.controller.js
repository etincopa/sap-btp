sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/localFunction",
    "sap/ui/core/BusyIndicator",
    "mif/cp/fraccionamiento/util/formatter",
  ],
  function (
    Controller,
    models,
    MessageBox,
    grupoOrden,
    localFunction,
    BusyIndicator,
    formatter
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.Consolidado", {
      formatter: formatter,
      onInit: async function () {
        this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        localFunction.init(this.oServiceModel);

        this.oRouter
          .getRoute("consolidado")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      onConsolidadoRowSelected: async function (oEvent) {
        try {
          this.oConsolidado = oEvent.getParameter("rowContext").getObject();
        } catch (oError) {}
      },
      onEstadoChange: async function (oEvent) {
        BusyIndicator.show(0);
        this.byId("tblConsolidado").clearSelection();

        this.oConsolidado = null;
        var oEstado = oEvent
          .getParameter("selectedItem")
          .getBindingContext("localModel")
          .getObject();
        const oGrupoOrden = this.oLocalModel.getProperty(
          "/Consolidado_GrupoOrden"
        );

        var iSalaPesajeId = this.oLocalModel.getProperty(
          "/Consolidado_salaId"
        );

        this.oLocalModel.setProperty("/EstadoConsolidadoId", oEstado.iMaestraId);

        let aConsolidado = await grupoOrden.obtenerConsolidados(
          oGrupoOrden.grupoOrdenId,
          oEstado.iMaestraId,
          iSalaPesajeId
        );
        this.oLocalModel.setProperty("/Consolidado", aConsolidado);
        BusyIndicator.hide();
      },
      cargarDatos: async function (grupoOrdenId, salaPesajeId) {
        BusyIndicator.show(0);
        this.oConsolidado = null;
        const oGrupoOrden = await grupoOrden.obtenerGrupoOrden(grupoOrdenId);
        this.oLocalModel.setProperty("/Consolidado_GrupoOrden", oGrupoOrden);

        const aEstadosConsolidado =
          await grupoOrden.obtenerEstadosConsolidado();
        this.oLocalModel.setProperty(
          "/EstadosConsolidado",
          aEstadosConsolidado
        );

        this.oLocalModel.setProperty(
          "/Consolidado_salaId",
          salaPesajeId
        );

        const aSalaPesaje =
          await grupoOrden.obtenerSalaPesaje(salaPesajeId, "");
        this.oLocalModel.setProperty(
          "/SalaPesaje",
          aSalaPesaje[0].sala
        );
        
        //this.oLocalModel.setProperty("/EstadoConsolidadoId", oEstadoConsolidado.iMaestraId);
        var iEstado = this.oLocalModel.getProperty("/Consolidado_estado");
          const aConsolidado = await grupoOrden.obtenerConsolidados(
            grupoOrdenId,
            iEstado,
            salaPesajeId
          );
          this.oLocalModel.setProperty("/Consolidado", aConsolidado);

        BusyIndicator.hide();
      },
      onRouteMatched: async function (oEvent) {
        this.oLocalModel.setProperty(
          "/tituloPagina",
          this.oResourceBundle.getText("consolidadoOrdenes")
        );

        this.byId("tblConsolidado").clearSelection();

        const oArgs = oEvent.getParameter("arguments");

        this.oLocalModel.setProperty("/grupoOrdenId", oArgs.grupoOrdenId);
        this.oLocalModel.setProperty("/salaPesajeId", oArgs.salaPesajeId);
        await this.cargarDatos(oArgs.grupoOrdenId, oArgs.salaPesajeId);
      },
      onRegresarPress: function () {
        window.history.go(-1);
      },
      onActualizarEstadoPress: async function () {
        
      },
      onVerDetallePress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");

        if (oOpciones.FraccionarPesaje) {
          if (this.oConsolidado) {
            this.oRouter.navTo("detalle", {
              grupoOrdenConsolidadoId:
                this.oConsolidado.grupoOrdenConsolidadoId,
            });
          } else {
            MessageBox.msgError(
              this.oResourceBundle.getText("debeSeleccionarConsolidado")
            );
          }
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onActualizarPress: async function () {
        try {
          BusyIndicator.show(0);
          var sUsuario = window.localStorage.getItem("usuarioCodigo");

          var grupoOrdenId = this.oLocalModel.getProperty("/grupoOrdenId");
          var salaPesajeId = this.oLocalModel.getProperty("/salaPesajeId");
          await grupoOrden.regenerarConsolidado(grupoOrdenId, sUsuario)
          await this.cargarDatos(grupoOrdenId, salaPesajeId);
          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
        }
      },
    });
  }
);
