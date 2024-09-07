sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "mif/cp/fraccionamiento/util/formatter",
    "../service/config",
  ],
  function (
    Controller,
    models,
    MessageBox,
    grupoOrden,
    BusyIndicator,
    MessageToast,
    formatter,
    configService
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.Grupo", {
      formatter: formatter,
      onInit: async function () {
        this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        this.oRouter
          .getRoute("grupo")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      onRouteMatched: async function (oEvent) {
        const oArgs = oEvent.getParameter("arguments");
        await this._cargarDatos(oArgs.grupoOrdenId);

        var oGrupoOrden = this.oLocalModel.getProperty("/Grupo_GrupoOrden");
        if (oArgs.grupoOrdenId == "0") {
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("nuevoGrupo")
          );
        } else {
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("editarGrupo") +
              " #" +
              oGrupoOrden.codigo
          );
        }
      },
      onAgregarOrdenPress: function () {
        if (this.oOrdenSinAsignar) {
          let aGrupoOrdenDetalle = this.oLocalModel.getProperty(
            "/Grupo_GrupoOrdenDetalle"
          );

          aGrupoOrdenDetalle = aGrupoOrdenDetalle.sort((b, a) =>
            a.numero > b.numero && a.pedidoNumero > b.pedidoNumero ? -1 : b.numero > a.numero && b.pedidoNumero > a.pedidoNumero ? 1 : 0 && a.numFraccion > b.numFraccion
          );
          
          let oDetalle = {};
          oDetalle = JSON.parse(JSON.stringify(this.oOrdenSinAsignar));
          oDetalle.codigo =
            aGrupoOrdenDetalle.filter((e) => e.activo).length + 1;
          oDetalle.activo = true;
          oDetalle.pedidoNumero = this.oOrdenSinAsignar.pedidoNumero;
          aGrupoOrdenDetalle.push(oDetalle);
          
          let aOrdenesSinAsignar = this.oLocalModel.getProperty(
            "/Grupo_OrdenesSinAsignar"
          );
          
          const iSplicePos = aOrdenesSinAsignar.findIndex(
            (e) => e.ordenId == this.oOrdenSinAsignar.ordenId && e.codigoInsumo == this.oOrdenSinAsignar.codigoInsumo && e.lote == this.oOrdenSinAsignar.lote && e.numFraccion == this.oOrdenSinAsignar.numFraccion
          );
          aOrdenesSinAsignar.splice(iSplicePos, 1);
          for (var i = 0; i < aOrdenesSinAsignar.length; i++) {
            let oOrden = aOrdenesSinAsignar[i];
            oOrden.codigo = i + 1;
          }
          this.oOrdenSinAsignar = null;

          aGrupoOrdenDetalle = aGrupoOrdenDetalle.sort((b, a) =>
            a.numero > b.numero && a.pedidoNumero > b.pedidoNumero ? -1 : b.numero > a.numero && b.pedidoNumero > a.pedidoNumero ? 1 : 0 && a.numFraccion > b.numFraccion
          );
          
          this.oLocalModel.setProperty(
            "/Grupo_GrupoOrdenDetalle_Aux",
            aGrupoOrdenDetalle.filter((e) => e.activo)
          );
        } else {
          MessageBox.msgError(
            this.oResourceBundle.getText("debeSeleccionarOrden")
          );
        }
      },
      onQuitarOrdenPress: function () {
        if (this.oDetalle) {
          var aEstados = [
            "PAOPESA",
            "PAOPEFI",
          ];

          if (this.oDetalle.oEstado_codigo){
            if (aEstados.includes(this.oDetalle.oEstado_codigo)){
              MessageBox.msgError(
                "La orden está siendo utilizada, no se puede quitar."
              );
              this.oDetalle.activo = true;
              return;
            }
          }

          let aOrdenesSinAsignar = this.oLocalModel.getProperty(
            "/Grupo_OrdenesSinAsignar"
          );

          let aGrupoOrdenDetalleAux = this.oLocalModel.getProperty(
            "/Grupo_GrupoOrdenDetalle_Aux"
          );
          let oGrupoOrdenDetalleAux = aGrupoOrdenDetalleAux.find(
            (e) => e.ordenId == this.oDetalle.ordenId && e.lote == this.oDetalle.lote && e.codigoInsumo == this.oDetalle.codigoInsumo && e.numFraccion == this.oDetalle.numFraccion
          );

          let oOrden = {};
          oOrden = JSON.parse(JSON.stringify(this.oDetalle));
          oOrden.codigo = aOrdenesSinAsignar.length + 1;
          oOrden.pedidoNumero = oGrupoOrdenDetalleAux.numPedido ? oGrupoOrdenDetalleAux.numPedido : oGrupoOrdenDetalleAux.pedidoNumero;
          //oOrden.numFraccion = oGrupoOrdenDetalleAux.numFraccion;
          aOrdenesSinAsignar.push(oOrden);

          aOrdenesSinAsignar = aOrdenesSinAsignar.sort((a, b) =>{
            const compareName = a.pedidoNumero.localeCompare(b.pedidoNumero);
            const compareTitle = a.numero.localeCompare(b.numero);
          
            return compareName || compareTitle;
          });

          let x = 1;
          aOrdenesSinAsignar.forEach(function (item) {
              item.codigo = x;
              x += 1;
          });

          this.oLocalModel.setProperty(
            "/Grupo_OrdenesSinAsignar",
            aOrdenesSinAsignar
          );

          let aGrupoOrdenDetalle = this.oLocalModel.getProperty(
            "/Grupo_GrupoOrdenDetalle"
          );
          if (!this.oDetalle.grupoOrdenId) {
            const iSplicePos = aGrupoOrdenDetalle.findIndex(
              (e) => e.ordenId == this.oDetalle.ordenId && e.lote == this.oDetalle.lote && e.codigoInsumo == this.oDetalle.codigoInsumo && e.numFraccion == this.oDetalle.numFraccion
            );
            aGrupoOrdenDetalle.splice(iSplicePos, 1);
          } else {
            var oDetalleSelected = aGrupoOrdenDetalle.find(
              (e) => e.ordenId == this.oDetalle.ordenId && e.lote == this.oDetalle.lote && e.codigoInsumo == this.oDetalle.codigoInsumo && e.numFraccion == this.oDetalle.numFraccion
            );
            oDetalleSelected.activo = false;
            //this.oDetalle.activo = false;
          }

          aGrupoOrdenDetalle = aGrupoOrdenDetalle.sort((b, a) =>
            a.numero > b.numero && a.pedidoNumero > b.pedidoNumero ? -1 : b.numero > a.numero && b.pedidoNumero > a.pedidoNumero ? 1 : 0
          );

          let i = 1;
          aGrupoOrdenDetalle.forEach(function (item) {
            if (item.activo) {
              item.codigo = i;
              i += 1;
            }
          });

          var aGrupoOrdenes = aGrupoOrdenDetalle.filter((e) => e.activo);
          
          this.oLocalModel.setProperty(
            "/Grupo_GrupoOrdenDetalle_Aux",
            aGrupoOrdenes
          );
          this.oDetalle = null;
        }
      },
      onDetalleRowSelected: function (oEvent) {
        if (oEvent.getParameter("rowContext")) {
          this.oDetalle = oEvent.getParameter("rowContext").getObject();
        }
      },
      onOrdenSinAsignarRowSelected: function (oEvent) {
        if (oEvent.getParameter("rowContext")) {
          this.oOrdenSinAsignar = oEvent.getParameter("rowContext").getObject();
        }
      },
      onRegresarPress: function () {
        this.oGrupoOrden = null;
        window.history.go(-1);
      },
      onGuardarGrupo: async function () {
        BusyIndicator.show(0);

        let configuracion = await configService.obtenerConfiguracion();
        
        const oGrupoOrden = this.oLocalModel.getProperty("/Grupo_GrupoOrden");
        const aGrupoOrdenDetalle = this.oLocalModel.getProperty(
          "/Grupo_GrupoOrdenDetalle"
        );

        if (aGrupoOrdenDetalle.length == 0) {
          MessageBox.msgError(
            this.oResourceBundle.getText("debeIngresarOrden")
          );
          BusyIndicator.hide();
          return;
        }

        var aGrupoOrdenSinDetalle = aGrupoOrdenDetalle.filter(d => d.activo);

        if (aGrupoOrdenSinDetalle.length == 0){
          oGrupoOrden.activo = false;
        }

        oGrupoOrden.oSalaPesaje_salaPesajeId = configuracion.salaPesajeId;
        
        const result = await grupoOrden.guardarGrupoOrden(
          oGrupoOrden,
          aGrupoOrdenDetalle
        );
        if (result.iCode == "1") {
          this._cargarDatos(oGrupoOrden.grupoOrdenId);
          MessageToast.show(
            this.oResourceBundle.getText("guardadoSatisfactorio")
          );
        } else {
          MessageBox.msgError(result.sError);
        }
        BusyIndicator.hide();
      },
      _cargarDatos: async function (grupoOrdenId) {
        try {
          BusyIndicator.show(0);
          let configuracion = await configService.obtenerConfiguracion();
          this.oConfiguracion = configuracion;

          let oGrupoOrden = null;
          if (grupoOrdenId == 0) {
            const nuevoCodigo = this.oLocalModel.getProperty("/GrupoOrdenMax");
            oGrupoOrden = await grupoOrden.crearGrupoOrden(
              this.oConfiguracion.salaPesajeId,
              Number(nuevoCodigo) + 1
            );
            this.oLocalModel.setProperty("/Grupo_GrupoOrden", oGrupoOrden);
          } else {
            oGrupoOrden = await grupoOrden.obtenerGrupoOrden(grupoOrdenId);
            if (oGrupoOrden){
              oGrupoOrden.activo = true;
            }
            
            this.oLocalModel.setProperty("/Grupo_GrupoOrden", oGrupoOrden);
          }

          const oConfig = this.oLocalModel.getProperty("/Config");
          const aOrdenesSinAsignar = await grupoOrden.obtenerOrdenesSinAgrupar(
            oConfig.salaPesajeId
          );
          this.oLocalModel.setProperty(
            "/Grupo_OrdenesSinAsignar",
            aOrdenesSinAsignar
          );

          var aGrupoOrdenDetalle = await grupoOrden.obtenerGrupoOrdenDetalle(
            grupoOrdenId, oConfig.salaPesajeId
          );

          this.oLocalModel.setProperty(
            "/Grupo_GrupoOrdenDetalle",
            aGrupoOrdenDetalle
          );
          this.oLocalModel.setProperty(
            "/Grupo_GrupoOrdenDetalle_Aux",
            aGrupoOrdenDetalle
          );
          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
        }
      },
    });
  }
);
