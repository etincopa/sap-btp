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
    return Controller.extend("mif.cp.fraccionamiento.controller.Atencion", {
      formatter: formatter,
      aEstados: [
        "PAOPESA",
        "PAOPEPE",
        "AMOPESA",
        "PAOPRSA",
        "AMOPRSA",
        "PAOPEFI",
      ],
      onInit: async function () {
        this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        this.oRouter
          .getRoute("atencion")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      _cargarGrupoOrdenes: async function (salaPesajeId) {
        let grupoOrdenes = await grupoOrden.obtenerGrupoOrdenes(salaPesajeId);
        let sCodigo = await grupoOrden.obtenerMaxGrupoOrden(salaPesajeId);

        
        if (!this.offline) {
          this.oLocalModel.setProperty(
            "/VerGestionGrupo",
            salaPesajeId == this.oConfiguracion.salaPesajeId
          );
        }
        this.oLocalModel.setProperty(
          "/GrupoOrdenMax", sCodigo
        );

        this.oLocalModel.setProperty("/GrupoOrdenes", grupoOrdenes);
        this.oLocalModel.setProperty("/GrupoOrdenCodigo", "");
        this.oLocalModel.setProperty("/GrupoOrdenDetalle", []);

        const tblGrupoOrden = this.byId("tblGrupoOrden");
        tblGrupoOrden.clearSelection();
      },
      onRouteMatched: async function () {
        try {
          BusyIndicator.show(0);
          this.byId("tblGrupoOrden").clearSelection();

          this.oConfiguracion = this.oLocalModel.getProperty("/Config");

          const tblGrupoOrden = this.byId("tblGrupoOrden");
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

          await this._cargarGrupoOrdenes(this.oConfiguracion.salaPesajeId);
          this.oLocalModel.setProperty(
            "/tituloPagina",
            this.oResourceBundle.getText("grupoOrdenes")
          );
          BusyIndicator.hide();
        } catch (error) {
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
          BusyIndicator.hide();
        }
      },
      onGrupoOrdenRowSelected: async function (oEvent) {
        try {
          BusyIndicator.show(0);

          if (!oEvent.getParameter("rowContext")) return;
          
          this.oGrupoOrden = oEvent.getParameter("rowContext").getObject();
          this.oLocalModel.setProperty(
            "/GrupoOrdenCodigo",
            this.oGrupoOrden.codigo
          );

          var iSalaPesajeId = this.oLocalModel.getProperty("/SalaPesajeId");

          let grupoOrdenDetalle = await grupoOrden.obtenerGrupoOrdenDetalle(
            this.oGrupoOrden.grupoOrdenId,
            iSalaPesajeId
          );

          grupoOrdenDetalle = grupoOrdenDetalle.filter((d) =>
            this.aEstados.includes(d.oEstado_codigo)
          );

          var bOnline = this.oLocalModel.getProperty("/Online");
          grupoOrdenDetalle = grupoOrdenDetalle.map(d => {
            d.pesajeFinalizado = d.pesajeFinalizado && bOnline
            return d;
          })

          this.oLocalModel.setProperty("/GrupoOrdenDetalle", grupoOrdenDetalle);
          BusyIndicator.hide();
        } catch (oError) {
          this.oLocalModel.setProperty("/GrupoOrdenCodigo", null);
          this.oLocalModel.setProperty("/GrupoOrdenDetalle", []);
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
          BusyIndicator.hide();
        }
      },
      onSalaPesajeChange: async function (oEvent) {
        try {
          BusyIndicator.show(0);
          this.byId("tblGrupoOrden").clearSelection();

          this.oLocalModel.setProperty("/GrupoOrdenes", []);
          this.oLocalModel.setProperty("/GrupoOrdenCodigo", "");
          this.oLocalModel.setProperty("/GrupoOrdenDetalle", []);

          var salaPesaje = oEvent
            .getParameter("selectedItem")
            .getBindingContext("localModel")
            .getObject();

          this.salaPesajeId = salaPesaje.salaPesajeId;

          this._cargarGrupoOrdenes(salaPesaje.salaPesajeId);
          this.oGrupoOrden = null;

          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
          MessageBox.msgError(
            this.oResourceBundle.getText("mensajeOcurrioError")
          );
        }
      },
      onEditarGrupoPress: function () {
        if (this.oGrupoOrden != null) {
          /*if (this.oGrupoOrden.totalIniciada != 0) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("errorGrupoOrdenIniciado")
            );
          } else if (this.oGrupoOrden.totalFinalizado != 0) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("errorGrupoOrdenFinalizado")
            );
          } else {
            this.oRouter.navTo("grupo", {
              grupoOrdenId: this.oGrupoOrden.grupoOrdenId,
            });

            this.oGrupoOrden = null;
          }*/

          if (this.oGrupoOrden.totalFinalizado == this.oGrupoOrden.total) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("errorGrupoOrdenFinalizado")
            );
          } else {
            this.oRouter.navTo("grupo", {
              grupoOrdenId: this.oGrupoOrden.grupoOrdenId,
            });

            this.oGrupoOrden = null;
          }
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("debeSeleccionarGrupo")
          );
        }
      },
      onVerConsolidadoPress: function () {
        if (this.oGrupoOrden != null) {
          this.oRouter.navTo("consolidado", {
            grupoOrdenId: this.oGrupoOrden.grupoOrdenId,
            salaPesajeId: this.salaPesajeId,
          });
          this.oGrupoOrden = null;
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("debeSeleccionarGrupo")
          );
        }
      },
      onRegresarPress: function () {
        this.oGrupoOrden = null;
        window.history.go(-1);
      },
      onNuevoGrupoPress: function () {
        this.oRouter.navTo("grupo", {
          grupoOrdenId: 0,
        });
      },
      onEliminarGrupoPress: function () {
        if (this.oGrupoOrden != null) {
          this.oRouter.navTo("consolidado", {
            grupoOrdenId: this.oGrupoOrden.grupoOrdenId,
          });
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("debeSeleccionarGrupo")
          );
        }
      },
      onImprimirPress: async function (oEvent) {
        var sPath =
          oEvent.oSource.oParent.oBindingContexts.localModel.getPath();
        var oGrupoOrdenDetalle = this.oLocalModel.getProperty(sPath);
        var sUsuario = window.localStorage.getItem("usuarioCodigo");

        var oConfiguracion = this.oLocalModel.getProperty("/Config");

        BusyIndicator.show(0);
        debugger;
        try {
          var sUsuario = window.localStorage.getItem("usuarioCodigo");

          if (oGrupoOrdenDetalle) {
            var oParam = oGrupoOrdenDetalle;
            /*if (oParam.etiqueta) {
              BusyIndicator.hide();
              return MessageBox.information(
                "El insumo ya tiene una etiqueta generada: " + oParam.etiqueta
              );
            }*/

            var oUrlParam = [
              {
                Pedido: oGrupoOrdenDetalle.pedidoNumero,
                Centro: oGrupoOrdenDetalle.pedidoCentro,
                Orden: oGrupoOrdenDetalle.ordenNumero,
                CodigoInsumo: "",
                Lote: "",
                Tipo: "IDEN_PROD",
                NroItem: "1",
                IdBulto: "",
                CantidadA: "0",
                Tara: "0",
                UnidadM: "",
                Almacen: "",
                Status: "",
                Etiqueta: oGrupoOrdenDetalle.etiquetaOFR,
                Fraccion: String(oGrupoOrdenDetalle.numFraccion),
                UsuarioAte: sUsuario,
                Impresion: "",
                Reimpresion: "",
                DocMat: "",
                CantConsumida: "0",
              },
            ];
            /**Generar etiqueta IFA */
            var oAtendido = await grupoOrden.acSetEtiquetaErp(oUrlParam);
            if (oAtendido) {
              oAtendido = oAtendido.data.AtendidoItemSet.results[0];

              if (oAtendido.Etiqueta != oGrupoOrdenDetalle.etiquetaOFR) {
                await grupoOrden.actualizarEtiquetaOrden({
                  etiqueta: oAtendido.Etiqueta,
                  ordenFraccionId: oGrupoOrdenDetalle.ordenFraccionId,
                });
              }

              var oResp = await grupoOrden.fnSendPrintBulto({
                impresoraId: oConfiguracion.impresora,
                etiqueta: oAtendido.Etiqueta,
                usuario: sUsuario,
                bSaldo: "FRAC"
              });

              if (oResp.iCode == "1") {
                MessageBox.msgExitoso(
                  this.oResourceBundle.getText("mensajeImpresionEtiqueta") +
                    oAtendido.Etiqueta
                );

                var iSalaPesajeId = this.oLocalModel.getProperty("/SalaPesajeId");

                let grupoOrdenDetalle = await grupoOrden.obtenerGrupoOrdenDetalle(
                  oGrupoOrdenDetalle.grupoOrdenId,
                  iSalaPesajeId
                );

                grupoOrdenDetalle = grupoOrdenDetalle.filter((d) =>
                  this.aEstados.includes(d.oEstado_codigo)
                );
      
                this.oLocalModel.setProperty("/GrupoOrdenDetalle", grupoOrdenDetalle);

                BusyIndicator.hide();
              } else {
                MessageBox.msgError("Ocurrio un error al imprimir.");
                BusyIndicator.hide();
              }
            }
          }
        } catch (oError) {
          MessageBox.msgError(oError.message);
          BusyIndicator.hide();
        }
      },
    });
  }
);
