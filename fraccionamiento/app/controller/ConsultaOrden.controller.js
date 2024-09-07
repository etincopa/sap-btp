sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    models,
    grupoOrden,
    MessageBox,
    MessageToast,
    BusyIndicator,
    formatter,
    Fragment
  ) {
    "use strict";
    return Controller.extend(
      "mif.cp.fraccionamiento.controller.ConsultaOrden",
      {
        formatter: formatter,
        onInit: async function () {
          this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.oServiceModelOnline,
            this.serviceModelOnlineV2
          );
          
          this.oRouter
            .getRoute("consultaorden")
            .attachPatternMatched(this.onRouteMatched, this);
        },
        cargarDatos: async function () {
          this.oLocalModel.setProperty("/orden", "");
          this.oLocalModel.setProperty("/Ordenes", []);
          this.oLocalModel.setProperty("/aBulto", []);
          //BusyIndicator.show(0);
          this.oConfiguracion = this.oLocalModel.getProperty("/Config");

          //const oGrupoOrden = await grupoOrden.obtenerGrupoOrden(grupoOrdenId);
          //this.oLocalModel.setProperty("/Consolidado_GrupoOrden", oGrupoOrden);

          const aEstadosConsolidado =
            await grupoOrden.obtenerEstadosConsolidado();
          let aEstados = [];
          aEstados.push({
            iMaestraId: 0,
            contenido: "TODOS",
          });
          aEstadosConsolidado.forEach((e) => {
            aEstados.push({
              iMaestraId: e.iMaestraId,
              contenido: e.contenido,
            });
          });

          const oEstadoConsolidado = aEstadosConsolidado.find(
            (e) => e.codigo == "PAIPEFI"
          );

          this.oLocalModel.setProperty("/EstadosConsolidado", aEstados);
          this.oLocalModel.setProperty(
            "/estadoId",
            oEstadoConsolidado.iMaestraId
          );

          const dFechaActual = new Date();
          const dFechaDesde = new Date(
            dFechaActual.getFullYear(),
            dFechaActual.getMonth() - 1,
            dFechaActual.getDate()
          );
          const dFechaHasta = new Date();
          this.oLocalModel.setProperty("/fechaInicio", dFechaDesde);
          this.oLocalModel.setProperty("/fechaFin", dFechaHasta);
          //const oEstadoConsolidado = aEstadosConsolidado.find(e => e.codigo == "PAIPEPE");
          //const aConsolidado = await grupoOrden.obtenerConsolidados(grupoOrdenId, oEstadoConsolidado.iMaestraId);
          //this.oLocalModel.setProperty("/Consolidado", aConsolidado);

          var salaPesajes = await grupoOrden.obtenerSalaPesaje(
            null,
            this.oConfiguracion.plantaId
          );
          salaPesajes.sort((a, b) =>
            a.sala > b.sala ? 1 : b.sala > a.sala ? -1 : 0
          );
          salaPesajes.splice(0, 0, { salaPesajeId: "", sala: "TODOS" });
          this.oLocalModel.setProperty("/SalaPesajes", salaPesajes);
          this.oLocalModel.setProperty(
            "/salaPesajeConsulta",
            this.oConfiguracion.salaPesaje
          );

          this.byId("cboSala").setSelectedKey(this.oConfiguracion.salaPesaje);

          BusyIndicator.hide();
        },
        onSearch: async function () {
          BusyIndicator.show(0);
          //const oGrupoOrden = await grupoOrden.obtenerGrupoOrden(grupoOrdenId);

          var dFechaInicio = this.oLocalModel.getProperty("/fechaInicio");
          var dFechaFin = this.oLocalModel.getProperty("/fechaFin");

          let iIdEstado = this.oLocalModel.getProperty("/estadoId");

          var oParam = {
            ordenNumero: this.oLocalModel.getProperty("/orden"),
            salaPesaje: this.oLocalModel.getProperty("/salaPesajeConsulta"),
          };

          const aOrdenes = await grupoOrden.consultaOrdenes(
            dFechaInicio,
            dFechaFin,
            iIdEstado,
            oParam
          );

          this.byId("tblOrdenes").clearSelection();

          this.oLocalModel.setProperty("/Ordenes", aOrdenes);
          this.oLocalModel.setProperty("/aBulto", []);

          BusyIndicator.hide();
        },
        onGrupoOrdenRowSelected: async function (oEvent) {
          BusyIndicator.show(0);
          this.oLocalModel.setProperty("/ObsControl", "");
          this.oLocalModel.setProperty("/GlosaInsumo", "");
          try {
            var oConsolidado = oEvent.getParameter("rowContext").getObject();
            this.oFila = oConsolidado;
            var grupoOrdenFraccionamientoId =
                oConsolidado.grupoOrdenFraccionamientoId,
              iEstado = oConsolidado.oEstado_iMaestraId;
            let aFracDet = await grupoOrden.obtenerBultosDet(
              grupoOrdenFraccionamientoId,
              null
            );

            var aReserva = await grupoOrden.ReservaSet({
              Rsnum: oConsolidado.reservaNum,
              //Rspos: oConsolidado.reservaPos,
              //Aufnr: oConsolidado.ordenNumero,
              //Matnr: oConsolidado.codigoInsumo,
              //Charg: oConsolidado.lote
              //Werks: oInsumo.centroInsumo,
            });
            var oReserva = null;

            if (aReserva && !aReserva.error) {
              oReserva = aReserva.find(d => d.Matnr == oConsolidado.codigoInsumo && d.Charg == oConsolidado.loteInsumo)
            }

            var oDatoExtra = await grupoOrden.ValoresPropCaracteristicasSet({
              CodigoInsumo: oConsolidado.codigoInsumo,
              Lote: oConsolidado.loteInsumo,
              Centro: oConsolidado.centro,
            });
            if (oDatoExtra.error) {
              MessageToast.show("No se encontro información de OBS.");
            } else {
              var oInfoOrden = null;
              if (oReserva) {
                oInfoOrden = oReserva;
              }
              oDatoExtra[0].sUnidad = oConsolidado.unidad;
              oDatoExtra = grupoOrden._buildObs(oDatoExtra[0], oInfoOrden);
              this.oLocalModel.setProperty("/ObsControl", oDatoExtra.obs);
              this.oLocalModel.setProperty("/GlosaInsumo", oConsolidado.glosa);
              this.oLocalModel.setProperty("/InfoOrden", oDatoExtra.infoOrden);
            }
            this.oLocalModel.setProperty("/aBulto", aFracDet);
          } catch (oError) {}
          BusyIndicator.hide();
        },
        onImprimirPress: async function (oEvent) {
          try {
            BusyIndicator.show(0);
            var oConfiguracion = this.oLocalModel.getProperty("/Config");
            var sUsuario = window.localStorage.getItem("usuarioCodigo");

            var oRowSelect = this._getSelectRowTable("tblBultos");
            if (oRowSelect) {
              this.oBulto = oRowSelect;

              var oResp = await grupoOrden.fnSendPrintBulto({
                impresoraId: oConfiguracion.impresora,
                etiqueta: this.oBulto.B_etiqueta,
                usuario: sUsuario,
              });

              if (oResp.iCode == "1") {
                MessageBox.msgExitoso(
                  this.oResourceBundle.getText("mensajeReeimpresion") +
                    this.oBulto.B_etiqueta
                );
              } else {
                MessageBox.msgError("Ocurrio un error al imprimir.");
              }
              BusyIndicator.hide();
              this.oBulto = null;
            } else {
              MessageBox.msgError(
                this.oResourceBundle.getText("debeSeleccionarBulto")
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
        onRouteMatched: async function () {
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("consultaOrdenes")
          );
          await this.cargarDatos();
        },
        onOpenTecladoAlfaNum: async function (oEvent) {
          debugger;
          this.inputSetValue = null;
          const oSource = oEvent.getSource();
          var action = oSource.data("action");
          this.inputSetValue = action;

          this.teclado = "ALFANUM";
          this.oLocalModel.setProperty("/titleDialog", "Número Orden");
          //this.oLocalModel.setProperty("/orden", "");
          
          this.onOpenFragment("TecladoAlfaNumericoCO");
        },
        onKeyPadPress: function (oEvent) {
          const oSource = oEvent.getSource();
          var action = oSource.data("action");
          var sKeyPress = oSource.getText();

          var sText = this.oLocalModel.getProperty("/orden");
          if (!sText) sText = "";
          sText = new String(sText);
          var newText = "";
          if (action == "DEL") {
            newText = sText.substring(0, sText.length - 1);
          } else if (action == "VALID") {
            newText = formatter.peso(sText);
          } else {
            if (this.teclado == "ALFANUM") {
              newText = sText + sKeyPress;
            } else {
              if (sKeyPress == "." && sText.includes(".")) {
                newText = sText;
              } else {
                newText = sText + sKeyPress;
              }
            }
          }

          if (newText == "") {
            newText = "";
          }

          this.oLocalModel.setProperty("/orden", newText);
        },
        onAceptarTeclado: async function (oEvent) {
          debugger;
          var sValue = this.oLocalModel.getProperty("/orden");
          this.oLocalModel.setProperty("/orden", sValue);
          this.onSalirTecladoAlfaNumerico(null);
        },
        onSalirTecladoAlfaNumerico: function (oEvent) {
          this.onCloseFragmentById(
            "TecladoAlfaNumericoCO",
            "idDlgTecladoAlfaNumericoCO"
          );
        },
        onCloseFragmentById: function (sFragment, sId) {
          Fragment.byId("frg" + sFragment, sId).close();
        },
        onOpenFragment: function (sDialog) {
          var rootPath = "mif.cp.fraccionamiento";
          if (!this["o" + sDialog] || this["o" + sDialog].length == 0) {
            this["o" + sDialog] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath + ".view.fragment." + sDialog,
              this
            );
            this.getView().addDependent(this["o" + sDialog]);
          }
          this["o" + sDialog].open();
        },
        onRegresarPress: function () {
          window.history.go(-1);
        },
        onVerDetallePress: function () {
          this.oRouter.navTo("detalle");
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
      }
    );
  }
);
