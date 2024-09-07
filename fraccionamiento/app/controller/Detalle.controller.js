sap.ui.define(
  [
    "./Base",
    "mif/cp/fraccionamiento/model/models",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    models,
    MessageBox,
    grupoOrden,
    formatter,
    BusyIndicator,
    MessageToast
  ) {
    "use strict";
    return Controller.extend("mif.cp.fraccionamiento.controller.Detalle", {
      formatter: formatter,
      onInit: async function () {
        this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.oServiceModelOnline,
          this.serviceModelOnlineV2
        );
        this.oRouter
          .getRoute("detalle")
          .attachPatternMatched(this.onRouteMatched, this);
        this.oLocalModel.setProperty("/Detalle_Eliminar", false);
      },
      cargarDatos: async function (grupoOrdenConsolidadoId) {
        BusyIndicator.show(0);

        try {
          this.oLocalModel.setProperty("/ObsControl", "");
          this.oLocalModel.setProperty("/GlosaInsumo", "");
          this.oLocalModel.setProperty("/InfoOrden", "");

          this.oLocalModel.setProperty("/Detalle_Fraccionamientos", []);
          this.oLocalModel.setProperty("/finalizado", false);

          const aMaestra = await grupoOrden.maestra();
          this.oLocalModel.setProperty("/Maestra", aMaestra);

          const oConsolidado = await grupoOrden.obtenerConsolidado(
            grupoOrdenConsolidadoId
          );
          this.oLocalModel.setProperty("/Detalle_Consolidado", oConsolidado);

          const aUnidades = await grupoOrden.obtenerUnidades();
          this.oLocalModel.setProperty("/aUnidad", aUnidades);

          let aEstadosOrden = await grupoOrden.obtenerEstadosConsolidado();

          const oEstadoPendiente = aEstadosOrden.find((e) => e.codigo == "PAIPEPE");
          const oEstadoPesando = aEstadosOrden.find((e) => e.codigo == "PAIPESA");
          var iEstadoConsolidadoId = this.oLocalModel.getProperty("/EstadoConsolidadoId"); 

          if (iEstadoConsolidadoId){
            if (iEstadoConsolidadoId == oEstadoPesando.iMaestraId){
              iEstadoConsolidadoId = oEstadoPendiente.iMaestraId;
            }
          }else{
            iEstadoConsolidadoId = oEstadoPendiente.iMaestraId;
          }
          
          this.oLocalModel.setProperty("/Detalle_Estado", iEstadoConsolidadoId); 

          aEstadosOrden = aEstadosOrden.filter(d => oEstadoPesando.iMaestraId != d.iMaestraId);

          this.oLocalModel.setProperty("/Detalle_EstadosOrden", aEstadosOrden);

          await this._cargarFraccionamientos(grupoOrdenConsolidadoId);
          

          this.oLocalModel.setProperty("/Detalle_Eliminar", false);

        } catch (error) {
          BusyIndicator.hide();
        }
      },
      _cargarFraccionamientos: async function(grupoOrdenConsolidadoId){
        const aUnidades = this.oLocalModel.getProperty("/aUnidad");
        
        var iConsolidadoSalaId = this.oLocalModel.getProperty("/Consolidado_salaId");
        
        var iEstadoId = this.oLocalModel.getProperty("/Detalle_Estado");
        const aFraccionamientos = await grupoOrden.obtenerFraccionamientos(
          grupoOrdenConsolidadoId,
          null,
          iEstadoId,
          iConsolidadoSalaId,
          aUnidades
        );
        
        this.oLocalModel.setProperty("/Detalle_Fraccionamientos", aFraccionamientos);

        var oTblFraccionamientos = this.byId("tblFraccionamientos");
        oTblFraccionamientos.getBinding("rows").refresh();
        this.oLocalModel.refresh(true);

        this.byId("tblFraccionamientos").clearSelection();
        
        BusyIndicator.hide();
      },
      onRefrescarDatos: async function () {
        BusyIndicator.show(0);
        try {
          
          if (this.oFraccionamiento){
            await grupoOrden.fnUpdateCantidadConversion(
              this.oFraccionamiento.ordenFraccionId,
              this.oFraccionamiento.grupoOrdenFraccionamientoId,
              "",
            );
          }
          

          var aEstadosOrden = this.oLocalModel.getProperty(
            "/Detalle_EstadosOrden"
          );
  
          await this._cargarFraccionamientos(this.grupoOrdenConsolidadoId);

          /*var iConsolidadoSalaId = this.oLocalModel.getProperty("/Consolidado_salaId");
          const oEstado = aEstadosOrden.find((e) => e.codigo == "PAIPEPE");
          if (oEstado) {
            this.oLocalModel.setProperty("/Detalle_Estado", oEstado.iMaestraId);
            const aFraccionamientos = await grupoOrden.obtenerFraccionamientos(
              this.grupoOrdenConsolidadoId,
              null,
              oEstado.iMaestraId,
              iConsolidadoSalaId
            );
            this.oLocalModel.setProperty(
              "/Detalle_Fraccionamientos",
              aFraccionamientos
            );
          } else {
            this.oLocalModel.setProperty("/Detalle_Fraccionamientos", []);
          }*/
          BusyIndicator.hide();
        } catch (oError) {
          BusyIndicator.hide();
        }
      },
      onEstadoChange: async function (oEvent) {
        BusyIndicator.show(0);
        try {
          this.oFraccionamiento = null;
          await this._cargarFraccionamientos(this.grupoOrdenConsolidadoId);

          /*const aFraccionamientos = await grupoOrden.obtenerFraccionamientos(
            oConsolidado.grupoOrdenConsolidadoId,
            null,
            oEstado.iMaestraId,
            iConsolidadoSalaId
          );
          this.oLocalModel.setProperty(
            "/Detalle_Fraccionamientos",
            aFraccionamientos
          );*/

          this.byId("tblFraccionamientos").clearSelection();
          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
        }
      },
      onRouteMatched: async function (oEvent) {
        const oArgs = oEvent.getParameter("arguments");

        this.byId("tblFraccionamientos").clearSelection();

        this.grupoOrdenConsolidadoId = oArgs.grupoOrdenConsolidadoId;
        await this.cargarDatos(oArgs.grupoOrdenConsolidadoId);

        this.oLocalModel.setProperty(
          "/tituloPagina",
          this.oResourceBundle.getText("atencionOrden")
        );
      },
      _CreateEtiquetaIFA: async function (oFraccionamiento) {
        BusyIndicator.show(0);
        debugger;
        try {
          var oItemSelect = oFraccionamiento;
          var oConfiguracion = this.oLocalModel.getProperty("/Config");
          var sUsuario = window.localStorage.getItem("usuarioCodigo");
          var aMaestra = this.oLocalModel.getProperty("/Maestra");

          const aBultos = await grupoOrden.obtenerBultos(
            oItemSelect.grupoOrdenFraccionamientoId
          );

          if (oItemSelect) {
            var aEstadoInsumo = aMaestra["ESTADO_CP_INSUMO"];
            var oEstadoPesaPrd = aEstadoInsumo.find(
              //PESAJE POR PRODUCCION
              (o) => o.codigo === "PAIPEPR"
            );

            var oParam = oItemSelect;
            if (oParam.etiqueta) {
              BusyIndicator.hide();
              return MessageBox.information(
                "El insumo ya tiene una etiqueta generada: " + oParam.etiqueta
              );
            }

            var oUrlParam = [
              {
                Pedido: oParam.numPedido,
                Centro: oParam.centro,
                Orden: oParam.ordenNumero,
                CodigoInsumo: oParam.codigoInsumo,
                Lote: oParam.loteInsumo,
                Tipo: "IFA",
                Fraccion: new String(oParam.numFraccion),
                Subfraccion: new String(oParam.numSubFraccion),
                IdBulto: "",
                CantidadA: "0",
                Tara: "0",
                UnidadM: oParam.unidad,
                Almacen: oParam.almacen,
                Etiqueta: aBultos.length == 0 ? "" : aBultos[0].etiqueta,
                Status: "",
                Etiqueta: "",
                UsuarioAte: sUsuario,
                Impresion: "",
                Reimpresion: "",
                DocMat: "",
                CantConsumida: +oParam.requeridoFinal,
                Cantpesar: String(+oParam.requeridoFinal),
                Unidpesar: oParam.unidad,
              },
            ];
            /**Generar etiqueta IFA */
            var oAtendido = await grupoOrden.acSetEtiquetaErp(oUrlParam);
            if (oAtendido) {
              //oAtendido = oAtendido.oResult.value.data;
              oAtendido = oAtendido.data.AtendidoItemSet.results[0];
              /**
               * - Actualizar registros de etiquetas
               * - Actualizar Estado Insumo: Pesaje Produccion
               * */
              //var aEstadoPedido = aMaestra["ESTADO_CP_PEDIDO"];
              //var aEstadoOrden = aMaestra["ESTADO_CP_ORDEN"];
              
              var oInsumo = {
                ordenDetalleId: oParam.ordenDetalleId,
                oEstado_iMaestraId: oEstadoPesaPrd.iMaestraId, //PESAJE POR PRODUCCION
              };
              var oResp = await grupoOrden.updateInsumoAndBulto(
                oParam,
                oInsumo,
                oAtendido
              );
              if (oResp) {
                var oResp = await grupoOrden.fnSendPrintBulto({
                  impresoraId: oConfiguracion.impresora,
                  etiqueta: oAtendido.Etiqueta,
                  usuario: sUsuario,
                });
              }
              /*var oResp = await grupoOrden.fnSendPrintBulto({
                                impresoraId : oConfiguracion.impresora,
                                etiqueta : oAtendido.Etiqueta,
                                usuario : sUsuario,
                            });     */

              
              
              var iConsolidadoSalaId = this.oLocalModel.getProperty("/Consolidado_salaId");
              if (oResp) {
                const oConsolidado = this.oLocalModel.getProperty(
                  "/Detalle_Consolidado"
                );
                await this._cargarFraccionamientos(oConsolidado.grupoOrdenConsolidadoId);
                /*const iEstado = this.oLocalModel.getProperty("/Detalle_Estado");
                const oConsolidado = this.oLocalModel.getProperty(
                  "/Detalle_Consolidado"
                );
                const aFraccionamientos =
                  await grupoOrden.obtenerFraccionamientos(
                    oConsolidado.grupoOrdenConsolidadoId,
                    null,
                    iEstado,
                    iConsolidadoSalaId
                  );
                this.oLocalModel.setProperty(
                  "/Detalle_Fraccionamientos",
                  aFraccionamientos
                );*/
                BusyIndicator.hide();
                MessageBox.information(
                  "Insumo listo para pesaje en producción, etiqueta generada: " +
                    oAtendido.Etiqueta
                );
                this.byId("tblFraccionamientos").clearSelection();
              }
            }
          }
        } catch (oError) {
          BusyIndicator.hide();
          console.log(oError);
          MessageBox.msgError(oError.message);
        }
      },
      onEditarPress: function () {
        if (this.oFraccionamiento && this.oFraccionamiento !== null) {
          var sFactorConversion =
            this.oLocalModel.getProperty("/FactorConversion");
          var aUnidades = this.oLocalModel.getProperty("/aUnidad");
          var oUnidad = aUnidades.find(
            (d) =>
              d.codigo.toUpperCase() ==
              this.oFraccionamiento.unidadOrigen.toUpperCase()
          );

          if (oUnidad.codigo != oUnidad.codigoSap && sFactorConversion == "") {
            return MessageBox.msgAlerta(
              "El insumo no tiene Factor de conversión."
            );
          }

          this.openDialog("EditarCantidad");
        } else {
          MessageBox.msgError(
            this.oResourceBundle.getText("debeSeleccionarFraccion")
          );
        }
      },
      onEliminarPress: async function () {
        BusyIndicator.show(0);
        var oDetalle_Fraccionamientos = this.oLocalModel.getProperty(
          "/Detalle_Fraccionamientos"
        );
        const sUsuario = window.localStorage.getItem("usuarioCodigo");

        var that = this;
        if (this.oFraccionamiento !== null) {
          oDetalle_Fraccionamientos = oDetalle_Fraccionamientos.filter(d => d.ordenNumero == this.oFraccionamiento.ordenNumero);

          if (oDetalle_Fraccionamientos.length != this.oFraccionamiento.numSubFraccion) {
            BusyIndicator.hide();
            MessageBox.msgError(
              this.oResourceBundle.getText("mensajeEliminarFraccion")
            );
            return;
          }
          MessageBox.confirm(
            this.oResourceBundle.getText("deseaEliminarFraccion"),
            {
              actions: ["SI", "NO"],
              title: "Confirmar",
              onClose: async function (sAction) {
                if (sAction == "SI") {
                  if (that.oFraccionamiento.numSubFraccion) {
                    const iSplicePos = oDetalle_Fraccionamientos.findIndex(
                      (e) => e.numSubFraccion == that.oFraccionamiento.numSubFraccion
                    );
                    oDetalle_Fraccionamientos.splice(iSplicePos, 1);
                    that.oFraccionamiento.activo = false;
                    await grupoOrden.eliminarFraccion(
                      that.oFraccionamiento.grupoOrdenFraccionamientoId,
                      that.oFraccionamiento.ordenDetalleId,
                      sUsuario
                    );

                    await that._cargarFraccionamientos(that.grupoOrdenConsolidadoId);
                    
                  } else {
                    that.oFraccionamiento.activo = false;
                    BusyIndicator.show(0);
                  }
                }
              },
            }
          );
        } else {
          MessageBox.msgError(
            this.oResourceBundle.getText("debeSeleccionarFraccion")
          );
          BusyIndicator.show(0);
        }
      },
      onFraccionamientoRowSelected: async function (oEvent) {
        try {
          BusyIndicator.show(0);
          this.oFraccionamiento = null;
          this.oLocalModel.setProperty("/Detalle_Bultos", []);
          this.oLocalModel.setProperty("/ObsControl", "");
          this.oLocalModel.setProperty("/GlosaInsumo", "");
          var oConfiguracion = this.oLocalModel.getProperty("/Config");

          var oRowSelect = this._getSelectRowTable("tblFraccionamientos");
          if (oRowSelect) {
            this.oFraccionamiento = oRowSelect;

            debugger;
            const aBultos = await grupoOrden.obtenerBultos(
              this.oFraccionamiento.grupoOrdenFraccionamientoId
            );

            var aReserva = await grupoOrden.ReservaSet({
              Rsnum: oRowSelect.reservaNum,
              //Rspos: oRowSelect.reservaPos,
              //Aufnr: oConsolidado.ordenNumero,
              Werks: oConfiguracion.centro,
            });

            var oReserva = null;

            if (aReserva && !aReserva.error) {
              oReserva = aReserva.find(d => d.Matnr == oRowSelect.codigoInsumo && d.Charg == oRowSelect.loteInsumo)
            }
            
            var oDatoExtra = await grupoOrden.ValoresPropCaracteristicasSet({
              CodigoInsumo: oRowSelect.codigoInsumo,
              Lote: oRowSelect.loteInsumo,
              Centro: oRowSelect.centro,
            });

            if (!oDatoExtra || oDatoExtra.error) {
              MessageToast.show("No se encontro información de OBS.");
            } else {
              var oInfoOrden = null;
              if (oReserva) {
                oInfoOrden = oReserva;
              }
              oDatoExtra[0].sUnidad = this.oFraccionamiento.unidadOrigen;
              oDatoExtra = grupoOrden._buildObs(oDatoExtra[0], oInfoOrden);

              this.oLocalModel.setProperty("/ObsControl", oDatoExtra.obs);
              this.oLocalModel.setProperty("/GlosaInsumo", oRowSelect.glosa);
              this.oLocalModel.setProperty("/InfoOrden", oDatoExtra.infoOrden);

              this.oLocalModel.setProperty(
                "/FactorConversion",
                oDatoExtra.factorConversion != ""
                  ? parseFloat(oDatoExtra.factorConversion)
                  : ""
              );
              //this.oLocalModel.setProperty("/FactorConversion", "0.8105");
            }
            this.oLocalModel.setProperty("/Detalle_Bultos", aBultos);
            this.oLocalModel.setProperty(
              "/Detalle_Fraccionamiento",
              this.oFraccionamiento
            );
            this.oLocalModel.setProperty(
              "/finalizado",
              this.oFraccionamiento.FracCodigoEstado == "PAIPEFI" ||
                this.oFraccionamiento.FracCodigoEstado == "PAIPESA" ||
                this.oFraccionamiento.FracCodigoEstado == "PAIPEPR"
            );

            this.oLocalModel.setProperty("/Detalle_Eliminar", navigator.onLine && this.oFraccionamiento.FracDuplicado == "X");

            BusyIndicator.hide();
          }else{
            BusyIndicator.hide();
          }
        } catch (oError) {
          BusyIndicator.hide();
        }
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
      onAtenderPress: function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        if (oOpciones.Pesaje) {
          if (this.oFraccionamiento !== null) {
            this.oLocalModel.setProperty("/Pesaje_Fraccionamiento", null);

            var sFactorConversion =
              this.oLocalModel.getProperty("/FactorConversion");
            var aUnidades = this.oLocalModel.getProperty("/aUnidad");
            var oUnidad = aUnidades.find(
              (d) =>
                d.codigo.toUpperCase() ==
                this.oFraccionamiento.unidadOrigen.toUpperCase()
            );

            if (
              oUnidad.codigo.toUpperCase() != oUnidad.codigoSap.toUpperCase() &&
              sFactorConversion == ""
            ) {
              return MessageBox.msgAlerta(
                "El insumo no tiene Factor de conversión."
              );
            }

            if (this.oFraccionamiento.pesadoMaterialPr == "X")
              return MessageBox.information(
                "Insumo con caracteristica: PESADO EN PRODUCCION"
              );

            this.oLocalModel.getProperty("/Pesaje_Fraccionamiento");
            this.oRouter.navTo("pesaje", {
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
      onPesarBultoSaldoPress: async function () {
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        if (oOpciones.Pesaje) {
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }

        var oAction = await this.doMessageboxActionCustom(
          "¿Como quiera tratar el Bulto Saldo?",
          ["ACTUALIZAR", "ADICIONAL", "TRASLADAR", "CANCELAR"]
        );

        if (oAction === "CANCELAR") {
          BusyIndicator.hide();
          return false;
        } else if (oAction === "ACTUALIZAR") {
          this.oLocalModel.setProperty("/optionBultoSaldo", "PESA");
          this.onPesarBultoSaldo();
        } else if (oAction === "ADICIONAL") {
          this.oLocalModel.setProperty("/optionBultoSaldo", "CREA_ADICIONAL");
          this.onPesarBultoSaldo();
        } else if (oAction === "TRASLADAR") {
          var oOpciones = this.oLocalModel.getProperty("/Opciones");
          var bOnline = this.oLocalModel.getProperty("/Online");
          if (oOpciones.TrasladarHu && bOnline) {
            this.oRouter.navTo("trasladarhu");
          } else {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("noTieneAccesoOpcion")
            );
          }

        }
      },
      onPesarBultoSaldo: function(){
        var oOpciones = this.oLocalModel.getProperty("/Opciones");
        var bOnline = this.oLocalModel.getProperty("/Online");
        if (oOpciones.NuevoBultoSaldo && bOnline) {
          this.oRouter.navTo("pesarbultosaldo");
        } else {
          MessageBox.msgAlerta(
            this.oResourceBundle.getText("noTieneAccesoOpcion")
          );
        }
      },
      onVerBultosPress: function () {
        if (this.oFraccionamiento && this.oFraccionamiento !== null) {
          this.openDialog("BultoEntero");
        } else {
          MessageBox.msgError(
            this.oResourceBundle.getText("debeSeleccionarFraccion")
          );
        }
      },
      onReimpresionPress: async function () {
        try{
          BusyIndicator.show(0);
          
          var oConfiguracion = this.oLocalModel.getProperty("/Config");
          var sUsuario = window.localStorage.getItem("usuarioCodigo");
  
          var oRowSelect = this._getSelectRowTable("tblBultos");
          if (oRowSelect) {
            this.oBulto = oRowSelect;
  
            var oResp = await grupoOrden.fnSendPrintBulto({
              impresoraId: oConfiguracion.impresora,
              etiqueta: this.oBulto.etiqueta,
              usuario: sUsuario,
            });
  
            if (oResp.iCode == "1") {
              MessageBox.msgExitoso(
                this.oResourceBundle.getText("mensajeReeimpresion") +
                  this.oBulto.etiqueta
              );
            } else {
              MessageBox.msgError("Ocurrio un error al imprimir.");
            }
            
            BusyIndicator.hide();
            this.oBulto = null;
            return;
          } else {
            if (this.oFraccionamiento) {
              if (this.oFraccionamiento.pesadoMaterialPr == "X") {
                this._CreateEtiquetaIFA(this.oFraccionamiento);
              } else {
                BusyIndicator.hide();
                MessageBox.msgError(
                  this.oResourceBundle.getText("debeSeleccionarBulto")
                );
              }
            } else {
              MessageBox.msgError(
                this.oResourceBundle.getText("debeSeleccionarFraccion")
              );
              BusyIndicator.hide();
              return;
            }
          }
        }catch{
          MessageBox.msgError("Ocurrio un error al imprimir.");
          BusyIndicator.hide();
        }
      },
      onRegresarPress: function () {
        this.oFraccionamiento = null;
        var iEstadoConsolidadoId = this.oLocalModel.getProperty("/EstadoConsolidadoId"); 
        this.oLocalModel.setProperty("localModel>/Consolidado_estado", iEstadoConsolidadoId);

        window.history.go(-1);
      },
      onGuardarGrupo: function () {
        window.history.go(-1);
      },
    });
  }
);
