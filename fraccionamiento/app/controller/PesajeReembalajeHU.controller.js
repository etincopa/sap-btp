sap.ui.define(
  [
    "./Base",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/localFunction",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/serial",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/ui/core/BusyIndicator",
  ],
  function (
    Controller,
    Fragment,
    MessageBox,
    localFunction,
    grupoOrden,
    serial,
    formatter,
    BusyIndicator
  ) {
    "use strict";

    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
    var timerTarar = 0;
    return Controller.extend(
      "mif.cp.fraccionamiento.controller.PesajeReembalajeHU",
      {
        formatter: formatter,

        onInit: async function () {
          this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.oServiceModelOnline,
            this.serviceModelOnlineV2
          );

          localFunction.init(this.oServiceModel);
          serial.init(this.oServiceModel);

          this.oRouter
            .getRoute("pesajeReembalajeHU")
            .attachPatternMatched(this.onRouteMatched, this);

          const bus = this.oOwnerComponent.getEventBus();
          bus.subscribe(
            "PesajeReembalajeHU",
            "actualizarTotal",
            this.actualizarTotal,
            this
          );
          bus.subscribe(
            "PesajeReembalajeHU",
            "onScanSaldoHU",
            this.onScanSaldoHU,
            this
          );
          bus.subscribe(
            "PesajeReembalajeHU",
            "onScanSaldoHUAjuste",
            this.onScanSaldoHUAjuste,
            this
          );
          bus.subscribe(
            "PesajeReembalajeHU",
            "onEstablecerTaraManual",
            this.onEstablecerTaraManual,
            this
          );
        },
        onRouteMatched: async function (oEvent) {
          var sTitle = this.oResourceBundle.getText("pesajeReembalaje");
          const oArgs = oEvent.getParameter("arguments");
          this._setProperty("/arguments", oArgs);
          this._setProperty("/onMenuPesarAtencion", true);
          this._setProperty("/tituloPagina", sTitle);

          this._initProperty();
          await this._cargarDatos();

          this.getView().byId("inpBulto").focus();

          this.UnidadesConv = ["MLL", "L"];

          const lblPesoBalanza = this.byId("lblPesoBalanza");
          lblPesoBalanza.addStyleClass("peso-r");
        },
        _cargarDatos: async function () {
          BusyIndicator.show(0);

          try {
            clearInterval(this.timerTarar);

            this.oConfig = this._getProperty("/Config");
            this.bEstableceTara = false;

            const oFraccionamiento = this.oLocalModel.getProperty(
              "/Pesaje_Fraccionamiento"
            );

            const pendiente = +oFraccionamiento.requeridoFinal;

            const aUnidades = await grupoOrden.obtenerUnidades();
            this._setProperty("/Pesaje_Unidades", aUnidades);

            const aEstadosConsolidado = await grupoOrden.obtenerEstadosConsolidado();
            this.oLocalModel.setProperty(
              "/EstadosConsolidado",
              aEstadosConsolidado
            );

            this._setProperty("/Pesaje_Fraccionamiento", oFraccionamiento);

            this._setProperty(
              "/Pesaje_Fraccionamiento/unidadPendiente",
              oFraccionamiento.unidad
            );

            const aFactor = await grupoOrden.obtenerFactor();
            this._setProperty("/aFactor", aFactor);

            var fTara = this._getProperty("/Pesaje_Fraccionamiento/taraFrac");

            var iFactorConve = this._getProperty("/FactorConversion");
            if (iFactorConve && parseFloat(iFactorConve) > 0) {
              this._setProperty("/Pesaje_FactorConversion", iFactorConve);
            }

            await this.onRefrescarDatos();

            this._setProperty(
              "/Pesaje_PendienteOriginal",
              formatter.peso(pendiente)
            );
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onRefrescarDatos: async function () {
          BusyIndicator.show(0);

          var bTaraM = false,
            bPesoM = false,
            bLectM = false;

          try {
            var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
              this.oConfig.salaPesajeId
            );
            if (oSalaPesaje) {
              oSalaPesaje = oSalaPesaje[0];
              bTaraM = oSalaPesaje.oEstadoTaraManual_codigo != "DHABI";
              bPesoM = oSalaPesaje.oEstadoPesoManual_codigo != "DHABI";
              bLectM = oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI";
            }

            const oFraccionamiento = this.oLocalModel.getProperty(
              "/Pesaje_Fraccionamiento"
            );

            const pendiente = +oFraccionamiento.requeridoFinal;

            var iFactorConve = this._getProperty("/FactorConversion");
            let oParamBalanza = {
              fPendiente: pendiente,
              sUnidad: oFraccionamiento.unidad,
              sSalaPesajeId: this.oConfig.salaPesajeId,
              bPesajeManual: bPesoM,
              fFactorConversionErp: iFactorConve,
              aFactor: this._getProperty("/aFactor"),
              aUnidades: this._getProperty("/Pesaje_Unidades"),
            };
            await this._cargarBalanzas(oParamBalanza);

            this._setProperty("/EsTaraManual", bTaraM);
            this._setProperty("/EsPesoManual", bPesoM);
            this._setProperty("/EsLecturaManual", bLectM);
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onScanSaldoHU: async function (oEvent) {
          BusyIndicator.show(0);

          /**
           * Fraccionamiento: se lee el QR de la HU
           */
          debugger;
          var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
          this._setProperty("/oBultoQr", null);

          try {
            var sCode = this._getProperty("/Pesaje_Bulto");
            var oBultoScan = this._getFormatQr(sCode);
            if (!oBultoScan) {
              this._setProperty("/Pesaje_Bulto", "");
              MessageBox.msgError("QR scaneado no es valido.");
            } else {
              /**
               * Verifica que el Bulto escaneado sea del mismo material y lote
               */
              if (
                oBultoScan.CodigoInsumo == oInsumo.codigoInsumo &&
                oBultoScan.Lote == oInsumo.loteInsumo
              ) {
              } else {
                BusyIndicator.hide();
                this._setProperty("/Pesaje_Bulto", "");
                return MessageBox.msgError(
                  "QR escaneado no coincide con el insumo a atender."
                );
              }

              var oBulto = await grupoOrden.AtendidoItemSet({
                IdBulto: oBultoScan.IdBulto,
                CodigoInsumo: oBultoScan.CodigoInsumo,
                Lote: oBultoScan.Lote,
                Tipo: "FRACCION",
              });

              //oBulto = oBulto.filter(d => d.Pedido == oInsumo.numPedido);

              if (!oBulto || oBulto.length == 0 || oBulto.error) {
                this._setProperty("/sScanQR", "");

                MessageBox.error(
                  "El bulto " + oBultoScan.IdBulto + " no es de tipo FRACCIÓN"
                );
                //MessageBox.error("Ocurrió un error al obtener el Bulto Saldo.");
              } else {
                var oBulto = oBulto[0];
                var oBultoHu = await grupoOrden.ValidarHuSet({
                  Hu: oBulto.IdBulto,
                  CodigoInsumo: oBulto.CodigoInsumo,
                  LoteInsumo: oBulto.Lote,
                  CentroInsumo: oBulto.Centro,
                });
                if (!oBultoHu || oBultoHu.length == 0 || oBultoHu.error) {
                  this._setProperty("/sScanQR", "");
                  MessageBox.error("Ocurrió un error al validar la HU.");
                } else {
                  var oBultoHu = oBultoHu[0];
                  if (["E"].includes(oBultoHu.Type)) {
                    this._setProperty("/sScanQR", "");
                    MessageBox.error(oBultoHu.Messagebapi);
                    throw oBultoHu.Messagebapi;
                    /*oBultoHu = aDataDummy.find((o) => {
                      return o.IdBulto == oBulto.IdBulto;
                    });*/
                  }

                  var oCaract = await this._getCaracteristica({
                    CodigoInsumo: oBulto.CodigoInsumo,
                    Lote: oBulto.Lote,
                    Centro: oBulto.Centro,
                  });
                  if (oCaract) {
                    this._setProperty(
                      "/FactorConversion",
                      oBultoHu.Altme == "MLL"
                        ? parseFloat(+oCaract.AtflvPesPro)
                        : parseFloat(+oCaract.AtflvPesEsp)
                    );

                    this._setProperty(
                      "/Pesaje_FactorConversion",
                      oBultoHu.Altme == "MLL"
                        ? oCaract.AtflvPesPro
                        : oCaract.AtflvPesEsp
                    );
                  } else {
                    MessageBox.msgError(
                      "Ocurrió un error al obtener caracteristicas del Insumo."
                    );
                    oCaract = {};
                  }

                  this._setProperty("/oBultoQr", {
                    ...oBultoHu,
                    ...oCaract,
                    ...oBulto,
                  });

                  //oCaract.Fecaduc = '2022-05-30'

                  const dFechaActual = new Date();
                  const dFechaHasta = new Date(
                    dFechaActual.getFullYear(),
                    dFechaActual.getMonth(),
                    dFechaActual.getDate() + 14
                  );
                  const dFechaDesde = new Date(
                    dFechaActual.getFullYear(),
                    dFechaActual.getMonth(),
                    dFechaActual.getDate()
                  );
                  const dFechaCaduc = formatter.fechaToDate(
                    oCaract.Fecaduc,
                    "-"
                  );

                  let bFechaCaducRango = grupoOrden.checkDateBT(
                    dFechaDesde,
                    dFechaHasta,
                    dFechaCaduc
                  );

                  //bFechaCaducRango = true;
                  if (!bFechaCaducRango) {
                    if (dFechaCaduc.getTime() == dFechaDesde.getTime()) {
                      MessageBox.msgAlerta(
                        this.oResourceBundle.getText("mensajeFechaCaduc")
                      );
                    } else if (dFechaCaduc <= dFechaHasta) {
                      var oAction = await this.doMessageboxActionCustom(
                        this.oResourceBundle.getText(
                          "mensajeFechaCaducFueraRango"
                        ),
                        ["Regresar"],
                        "30%"
                      );
                      if (oAction === "Regresar") {
                        this.onRegresarPress();
                      }
                      BusyIndicator.hide();
                      return;
                    }
                  } else {
                    MessageBox.msgAlerta(
                      this.oResourceBundle.getText("mensajeFechaCaduc")
                    );
                  }

                  //this._setProperty("/bIniciarPesaje", true);
                  var aBultoQr = this._getProperty("/aBultoQr");
                  aBultoQr.push(this._buildBulto(oBulto, oBultoHu, oCaract));
                  aBultoQr = this._updateList(aBultoQr);
                  this._setProperty("/aBultoQr", aBultoQr);
                  this._setProperty("/Pesaje_Bulto", "");

                  const _totalPesoHU = aBultoQr.reduce(
                    (accumulator, object) => {
                      return +accumulator + +object.Vemng;
                    },
                    0
                  );

                  this._setProperty("/cantTotalBulto", _totalPesoHU);
                  /**
                   * El campo HU se actualiza en blanco.
                   * - Si el peso de la HU es menor a la cantidad pendiente por atender,
                   * entonces preguntará si desea escanear otro bulto
                   *  SI - solicitará escanear la siguiente HU.
                   *  NO - - regresará a la pantalla anterior.
                   */

                  var iSumCantBulto = 0;
                  aBultoQr.forEach((o) => {
                    if (o.Vemng) {
                      iSumCantBulto += +o.Vemng;
                    }
                  });

                  var iPendAtender = this._getProperty(
                    "/Pesaje_PendienteOriginal"
                  );
                  //var sPendAtenderUM = this._getProperty("/Pesaje_Fraccionamiento/unidad");

                  this.actualizarTotal();
                  if (+iSumCantBulto < +iPendAtender) {
                    var oAction = await this.doMessageboxActionCustom(
                      "La cantidad escaneada es inferior a la cantidad pendiente por atender. ¿Desea escanear otro bulto?",
                      ["SI", "NO"]
                    );
                    if (oAction === "SI") {
                    } else if (oAction === "NO") {
                    }
                  }
                }
              }
            }
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onScanSaldoHUAjuste: async function (oEvent) {
          BusyIndicator.show(0);

          /**
           * Fraccionamiento: se lee el QR de la HU
           */
          debugger;
          var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
          this._setProperty("/BultoAjuste", null);

          try {
            var sCode = this._getProperty("/HUAjuste");
            var oBultoScan = this._getFormatQr(sCode);
            if (!oBultoScan) {
              this._setProperty("/HUAjuste", "");
              MessageBox.msgError("QR scaneado no es valido.");
            } else {
              if (
                oBultoScan.CodigoInsumo == oInsumo.codigoInsumo &&
                oBultoScan.Lote == oInsumo.loteInsumo
              ) {
              } else {
                BusyIndicator.hide();
                this._setProperty("/HUAjuste", "");
                return MessageBox.msgError(
                  "QR escaneado no coincide con el insumo a atender."
                );
              }

              var oConfiguracion = this._getProperty("/Config");
              var oBultoHu = await grupoOrden.ValidarHuSet({
                Hu: oBultoScan.IdBulto,
                CentroInsumo: oConfiguracion.centro
              });
              if (!oBultoHu || oBultoHu.length == 0 || oBultoHu.error) {
                this._setProperty("/HUAjuste", "");
                MessageBox.error("Ocurrió un error al validar la HU.");
              } else {
                this._setProperty("/HUAjuste", "");
                var oBultoHu = oBultoHu[0];
                if (["E"].includes(oBultoHu.Type)) {
                  MessageBox.error(oBultoHu.Messagebapi);
                  throw oBultoHu.Messagebapi;
                }

                this._setProperty("/BultoAjuste", oBultoHu);
              }
            }
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onGuardarPesaje: async function (oEvent) {
          debugger;
          var bIniciarPesaje = this._getProperty("/bIniciarPesaje");
          var bValidDato = await this.validarDatos();
          if (!bValidDato) return false;

          await this.detenerBalanza();

          BusyIndicator.show(0);
          try {
            /**
             * Al Guardar Peso la cantidad fraccionada pasa a CP01 y
             * se actualiza el saldo de la cantidad de la HU en CP02.
             *
             * La actualización del saldo de las HUs se da en el orden en que se escaneó.
             *
             */
            var sUsuario = window.localStorage.getItem("usuarioCodigo");
            var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
            var aBultoQr = this._getProperty("/aBultoQr");

            var iFactorConve = this._getProperty("/FactorConversion");

            var sUnidadMedida = this._getProperty(
              "/Pesaje_Fraccionamiento/unidadOrigen"
            ); //Unidad real del Insumo
            var sUnidadMedidaC = this._getProperty(
              "/Pesaje_Fraccionamiento/unidadMostrar"
            ); //Unidad

            var iPesoBalanza = this._getProperty("/Pesaje_PesoBalanza");
            var iTara = this._getProperty("/Pesaje_TaraBalanza");
            var iPendAtender = this._getProperty("/Pesaje_Pendiente2");

            //iFactorConve = 0.8105

            if (+iPesoBalanza < 0) {
              BusyIndicator.hide();
              this.onConnectBalanza("SI");
              return MessageBox.msgError(
                "No se puede guardar peso con valor negativo."
              );
            }

            if (+iPendAtender > 0 && +iPesoBalanza <= 0) {
              BusyIndicator.hide();
              this.onConnectBalanza("SI");
              return MessageBox.msgError("Ingrese un peso mayor a 0.000");
            }

            var sUnidadM = this._getProperty("/Pesaje_Fraccionamiento/unidad");
            var sUnidadOrigen = this._getProperty("/Pesaje_Fraccionamiento/unidadOrigen");

            var fPesoBalanza = +iPesoBalanza;
            if (this.UnidadesConv.includes(sUnidadOrigen.toUpperCase())) {
              /**
               * Revertir unidad si existe factor conversion de insumo:
               * LT a KG -> KG a LT
               * */
              iFactorConve = iFactorConve == 0 ? 1 : iFactorConve;
              iPesoBalanza = fPesoBalanza / +iFactorConve;
              sUnidadM = this._getProperty("/Pesaje_Fraccionamiento/unidad");
              //iTara = +iTara / +iFactorConve;
            } else {
              iPesoBalanza = fPesoBalanza;
            }

            if (sUnidadM.toUpperCase() != sUnidadMedidaC.toUpperCase()) {
              var oPeso = this._factConversion(
                iPesoBalanza,
                sUnidadM,
                iPesoBalanza,
                sUnidadMedidaC
              );

              iPesoBalanza = parseFloat(oPeso.oFactorToBalanza.peso).toFixed(3);
            }

            const self = this;
            var oAction = await this.doMessageboxActionCustom(
              this.oResourceBundle.getText("deseaGuardarPeso") +
                "" +
                formatter.peso(fPesoBalanza) +
                " " +
                sUnidadMedidaC,
              ["Aceptar", "Cancelar"],
              "30%"
            );
            if (oAction === "Cancelar") {
              BusyIndicator.hide();
              this.onConnectBalanza("SI");
              return;
            }

            /**
             * Obtener bultos saldos que se estan consumiendo
             */
            var aBultoConsumida = this._getBultoConsumido(
              aBultoQr,
              iPesoBalanza
            );
            if (aBultoConsumida && aBultoConsumida.length) {
              var sHUAjuste = this._getProperty("/BultoAjuste/Hu");
              var oPesajeInfo = {
                Tara: formatter.peso(iTara),
                BalanzaPeso: formatter.peso(fPesoBalanza),
                BalanzaUnidadM: sUnidadMedidaC.toLowerCase(),
                CantidadA: formatter.peso(iPesoBalanza),
                UnidadM: sUnidadMedida.toLowerCase(),
                UsuarioAte: sUsuario,
                Cp03: this._getProperty("/CP03"),
                HUAjuste: sHUAjuste ? sHUAjuste : "",
              };

              var aMessajeError = [];
              var aMessajeSuccess = [];
              var aDocMat = [];
              var aHuCons = [];
              var aHuEtiqueta = [];
              var aHuCreada = [];
              var aReembalajeHuSet = this._buildReembalarHu(
                aBultoQr,
                oInsumo,
                oPesajeInfo
              );

              var aReembalajeHeadSet = await grupoOrden.ReembalajeSet(
                aReembalajeHuSet
              );

              if (
                aReembalajeHeadSet &&
                aReembalajeHeadSet.statusCode == "200"
              ) {
                aReembalajeHeadSet =
                  aReembalajeHeadSet.ReembalajeItemSet.results;

                for (var key in aReembalajeHeadSet) {
                  var oItem = aReembalajeHeadSet[key];
                  var sMessage = this._buildMessage(oItem);
                  if (["E"].includes(oItem.Type)) {
                    aMessajeError.push(sMessage);
                  } else {
                    aHuCons.push(oItem.Hu);
                    aDocMat.push(oItem.Mblnr);
                    aHuEtiqueta.push(oItem.Etiqueta);
                    aHuCreada.push(oItem.IdBulto);
                    aMessajeSuccess.push(sMessage);
                  }
                }

                if (aMessajeError.length) {
                  aMessajeError = aMessajeError.concat(aMessajeSuccess);
                  var oContent = {
                    title: "Error",
                    id: "messageBoxId2",
                    details: "<ul>" + aMessajeError.join(" ") + "</ul>",
                    contentWidth: "60%",
                    styleClass: sResponsivePaddingClasses,
                  };
                  MessageBox.error("Se encontraton errores.", oContent);
                  this.onConnectBalanza("SI");
                } else {
                  /**
                   * CREAR NUEVO HU FRACCION
                   */

                  //var oAtendido = await grupoOrden.acSetEtiquetaErp(oUrlParam);
                  debugger;
                  if (aHuEtiqueta[0]) {
                    var oAtendido = {
                      Etiqueta: aHuEtiqueta[0],
                    };
                    this._setProperty("/BultoAtendido", oAtendido);
                    this.onImprimirPress(null);
                    this._clearAllFinishPesaje();

                    var oGrupoOrdenBulto =
                    await grupoOrden.guardarGrupoOrdenBulto({
                      oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId:
                        oInsumo.grupoOrdenFraccionamientoId,
                        pedidoId: oInsumo.pedidoId,
                        ordenId: oInsumo.ordenId,
                        ordenDetalleId: oInsumo.ordenDetalleId,
                        pedido: oInsumo.numPedido,
                        centro: oInsumo.centro,
                        orden: oInsumo.ordenNumero,
                        codigoInsumo: oInsumo.codigoInsumo,
                        lote: oInsumo.loteInsumo,
                        tipo: "FRACCION",
                        nroItem: Number(oInsumo.numFraccion),
                        idBulto: aHuCreada[0],
                        idPos: Number(oInsumo.idPos),
                        tara: formatter.peso(iTara),
                        almacen: oInsumo.almacen,
                        etiqueta: aHuEtiqueta[0],
                        usuarioAte: sUsuario,
                        docMat: aDocMat[0],
                        cantConsumida: "0",
                        cantidadA: formatter.peso(iPesoBalanza),
                        unidadM: sUnidadMedida,
                        balanzaPeso: formatter.peso(fPesoBalanza),
                        balanzaUnidadM: sUnidadMedidaC.toLowerCase(),
                      });

                    if (oGrupoOrdenBulto.iCode == "1") {
                      await grupoOrden.updateInsumo({
                          ordenDetalleId: oInsumo.ordenDetalleId,
                          resetear: "",
                        });

                      //Actualizar estados de la orden
                      await grupoOrden.fnUpdateOrdenFrac(
                        oInsumo.ordenFraccionId,
                        oInsumo.numPedido,
                        sUsuario
                      );
                      oGrupoOrdenBulto = oGrupoOrdenBulto.oResult;
                      MessageBox.msgExitoso("Se realizó el pesaje");
                    }

                    this._setProperty("/Pesaje_Fin", true);
                    //this.cargarDatos();

                    this._setProperty("/bIniciar", false);
                    this._setProperty("/bDetenerPesaje", false);
                    this._setProperty("/bGuardarPeso", false);
                    this._setProperty("/bImprimirPeso", false);
                    this._setProperty("/bEditarPeso", false);
                    this._setProperty("/bCancelarPeso", false);
                  }
                }
              }
            }
          } catch (oError) {
            this.onConnectBalanza("SI");
            MessageBox.warning(
              "Ocurrió un error, vuelva intentarlo en unos minutos."
            );
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onFinalizarPress: async function () {
          BusyIndicator.show(0);
          var oAction = await this.doMessageboxActionCustom(
            "¿Desea cerrar la atención?",
            ["SI", "NO"],
            "30%"
          );
          if (oAction === "SI") {
            try {
              var sUsuario = window.localStorage.getItem("usuarioCodigo");
              var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
    
              const aEstadosOrden = this._getProperty("/EstadosConsolidado");
              const oEstado = aEstadosOrden.find((e) => e.codigo == "PAIPEFI");
    
              var oFraccion = {
                grupoOrdenFraccionamientoId: oInsumo.grupoOrdenFraccionamientoId,
                oEstado_iMaestraId: oEstado.iMaestraId,
                usuarioActualiza: sUsuario,
                fechaActualiza: new Date(),
              };
    
              var oSubFraccion = {
                ordenDetalleId: oInsumo.ordenDetalleId,
                oEstado_iMaestraId: oEstado.iMaestraId,
                usuarioActualiza: sUsuario,
                fechaActualiza: new Date(),
              };
    
              await grupoOrden.finalizarSubFraccion(oFraccion, oSubFraccion);
    
              var aBultos = await grupoOrden.obtenerBultosERP(
                [oInsumo.numPedido],
                [oInsumo.ordenNumero],
                [oInsumo.codigoInsumo],
                [oInsumo.loteInsumo],
                true, 
                "FRACCION"
              );
              
              aBultos = aBultos.filter(
                (e) =>
                  e.CodigoInsumo == oInsumo.codigoInsumo &&
                  e.Lote == oInsumo.loteInsumo &&
                  e.Orden == oInsumo.ordenNumero &&
                  +e.Fraccion == +oInsumo.numFraccion &&
                  +e.Subfraccion == +oInsumo.numSubFraccion
              );

              var oBulto = aBultos[0];

              var oUrlParam = [
                {
                  Pedido: oInsumo.numPedido,
                  Centro: oBulto.Centro,
                  Orden: oInsumo.ordenNumero,
                  CodigoInsumo: oInsumo.codigoInsumo,
                  Lote: oInsumo.loteInsumo,
                  Tipo: "FRACCION",
                  NroItem: (+oBulto.NroItem).toString(),
                  IdBulto: oBulto.IdBulto,
                  CantidadA: oBulto.CantidadA,
                  Tara: oBulto.Tara,
                  UnidadM: oBulto.UnidadM,
                  Almacen: oBulto.Almacen,
                  Status: oBulto.Status,
                  Fraccion: oBulto.Fraccion,
                  Subfraccion: oBulto.Subfraccion,
                  Etiqueta: "",
                  UsuarioAte: sUsuario,
                  Impresion: "",
                  Reimpresion: "",
                  DocMat: "",
                  CantConsumida: "0",
                  Dml: "D",
                  SS: "X",
                }
              ];
              await grupoOrden.acSetEtiquetaErp(
                oUrlParam
              );

              await grupoOrden.fnUpdateOrdenFrac(
                oInsumo.ordenFraccionId,
                oInsumo.numPedido,
                sUsuario
              );
    
              MessageBox.success("Se realizó el cierre de la atención");
              this._setProperty("/Pesaje_Fin", true);
              //this.cargarDatos();
    
              this._setProperty("/bIniciar", false);
              this._setProperty("/bDetenerPesaje", false);
              this._setProperty("/bGuardarPeso", false);
              this._setProperty("/bImprimirPeso", false);
              this._setProperty("/bEditarPeso", false);
              await this.detenerBalanza();
    
              BusyIndicator.hide();
            } catch (error) {
              MessageBox.msgError(
                this.oResourceBundle.getText("mensajeOcurrioError")
              );
              BusyIndicator.hide();
            }
          } else if (oAction === "NO") {
            BusyIndicator.hide();
          }
        },
        _buildMessage: function (oItem) {
          var sType = oItem.Type;
          if (sType == "E") sType = "ERROR";
          if (sType == "W") sType = "WARNING";
          if (sType == "S") sType = "SUCCESS";
          return (
            "<li><strong>" +
            sType +
            " (HU: " +
            oItem.Hu +
            ") " +
            "</strong> : " +
            oItem.Messagebapi +
            "</li>"
          );
        },
        onImprimirPress: async function (oEvent) {
          var oAtendido = this._getProperty("/BultoAtendido");
          if (!oAtendido) {
            return MessageBox.msgError(
              "Necesita generar una etiqueta para imprimir."
            );
          }
          if (oEvent) {
            var oAction = await this.doMessageboxActionCustom(
              "Se procedera a generar la impresión. ¿Desea continuar?",
              ["SI", "NO"]
            );
            if (oAction === "SI") {
            } else if (oAction === "NO") {
              return false;
            }
          }

          const sUsuario = window.localStorage.getItem("usuarioCodigo");
          var oResp = await grupoOrden.fnSendPrintBulto({
            impresoraId: this.oConfig.impresora,
            etiqueta: oAtendido.Etiqueta,
            usuario: sUsuario,
          });
          if (oResp.iCode == "1") {
            MessageBox.msgExitoso(
              this.oResourceBundle.getText("mensajeImpresionEtiqueta") +
                oAtendido.Etiqueta
            );
          } else {
            MessageBox.msgError("Ocurrio un error al imprimir.");
          }
        },
        onEditPress: async function (oEvent) {
          this._setProperty("/EnterValue", "0.000");

            this._setProperty(
              "/EnterValueUM",
              this._getProperty(
                "/Pesaje_Fraccionamiento/unidadMostrar"
              ).toUpperCase()
            );
            this._setProperty("/titleDialog", "Editar Peso");
            this.onOpenFragment("EditPendiente");
        },
        onAceptarManual: async function (oEvent) {
          var oAction = await this.doMessageboxActionCustom(
            "Se modificara el peso pendiente por atender. ¿Desea continuar?",
            ["SI", "NO"]
          );
          if (oAction === "SI") {
            const sUsuario = window.localStorage.getItem("usuarioCodigo");
            var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
  
            var iCantidad = this._getProperty("/EnterValue");
            var sUnidad = this._getProperty("/EnterValueUM");
  
            var iFactorConve = this._getProperty("/FactorConversion");
            var sUnidadMedida = this._getProperty(
              "/Pesaje_Fraccionamiento/unidadPendiente"
            ); //Unidad real del Insumo
            if (iFactorConve && Number(iFactorConve) && +iFactorConve > 0) {
              /**
               * Revertir unidad si existe factor conversion de insumo:
               * LT a KG -> KG a LT
               * */
              //iCantidad = +iCantidad / +iCantidad;
            }
  
            iCantidad = formatter.peso(iCantidad);
  
            this._setProperty("/Pesaje_Pendiente2", iCantidad);
  
            var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidad");
            if (sUnidad.toLowerCase() == umInsumo.toLowerCase()) {
              iCantidad = iCantidad * 1;
            } else {
              iCantidad = iCantidad / 1000;
            }
  
            var sGrupoOrdenFraccionamientoId =
              oInsumo.grupoOrdenFraccionamientoId;
            const oResp = await grupoOrden.actualizarCantidadFraccion(
              sGrupoOrdenFraccionamientoId,
              iCantidad,
              sUnidadMedida,
              false,
              sUsuario,
              ""
            );
  
            this.actualizarTotal();
            this.onSalirEditPesaje(null);
            /*var updateInsumo = await grupoOrden.updateInsumo({
                      ordenDetalleId: oInsumo.ordenDetalleId,
                      cantPedidaUp: "100.00"
                    });
                    if(updateInsumo) {
                      
                    } else {
                      MessageBox.error("Ocurrio un error al modificar el peso.");
                    }*/
          } else if (oAction === "NO") {
          }
        },
        onBultoChange: async function () {
          //await this.detenerBalanza();
          BusyIndicator.show(0);
          this._setProperty("/oBultoQr", null);
          this._setProperty("/HabilitarImprimirPeso", false);
          this._setProperty("/HabilitarGuardarPeso", false);

          var sCode = this._getProperty("/Pesaje_Bulto");
          var sNumPedido = this._getProperty(
            "/Pesaje_Fraccionamiento/numPedido"
          );
          var sOrdenNumero = this._getProperty(
            "/Pesaje_Fraccionamiento/ordenNumero"
          );

          var oBultoScan = this._getFormatQr(sCode);
          if (!oBultoScan) {
            this._setProperty("/Pesaje_Bulto", "");
            MessageBox.msgError("Ingrese un código de Bulto válido.");
            BusyIndicator.hide();
            return;
          }

          const oFraccionamiento = this._getProperty("/Pesaje_Fraccionamiento");
          debugger;
          var oBultos = await grupoOrden.obtenerBulto(
            sNumPedido,
            sOrdenNumero,
            oBultoScan.IdBulto,
            oFraccionamiento.grupoOrdenFraccionamientoId
          );

          if (oBultos.iCode != 1) {
            MessageBox.msgError("Ocurrió un error.");
            BusyIndicator.hide();
            return;
          }

          var aBultos = [oBultos.oResult.value.data];

          BusyIndicator.hide();

          var sInsumoLote = this._getProperty(
            "/Pesaje_Fraccionamiento/loteInsumo"
          );
          var sCodigoInsumo = this._getProperty(
            "/Pesaje_Fraccionamiento/codigoInsumo"
          );

          var oBulto = null;
          if (aBultos && aBultos.length) {
            oBulto = aBultos.find(
              (d) => d.Tipo == "SALDO" && d.IdBulto == oBultoScan.IdBulto
            );
          }

          if (oBulto) {
            if (oBulto.CodigoInsumo != sCodigoInsumo) {
              MessageBox.msgError("El bulto no corresponde al Insumo.");
              this._setProperty("/Pesaje_Bulto", "");
              return;
            }

            if (oBulto.Lote != sInsumoLote) {
              MessageBox.msgError("El bulto no corresponde al Lote.");
              this._setProperty("/Pesaje_Bulto", "");
              return;
            }

            if (+oBulto.CantidadA <= 0) {
              MessageBox.msgError(
                "La cantidad del bulto debe ser mayor a cero."
              );
              this._setProperty("/Pesaje_Bulto", "");
              return;
            }

            var fCantidadBulto = this._getProperty("/Pesaje_PendienteOriginal");
            if (+oBulto.CantidadA < fCantidadBulto) {
              MessageBox.msgError(
                "La cantidad del bulto no es suficiente para atender la cantidad solicitada."
              );
              this._setProperty("/Pesaje_Bulto", "");
              return;
            }

            var aPesajeBultos = this._getProperty("/Pesaje_Bultos");
            var fPeso = 0;
            aPesajeBultos.forEach(function (d) {
              fPeso += d.total;
            });

            this._setProperty("/oBultoQr", oBulto);
            this._setProperty("/BultoIfa", oBulto.Ifa);
            //this._setProperty("/HabilitarGuardarPeso", oBulto.Ifa == "");
            this._setProperty("/HabilitarImprimirPeso", oBulto.Ifa == "X");
            this._setProperty(
              "/Pesaje_Bulto_Cantidad",
              oBulto.CantidadA - fPeso
            );
            this._setProperty("/Pesaje_Bulto_UM", oBulto.UnidadM);

            this.oBulto = oBulto;

            this._setProperty("/Pesaje_Bulto", "");
          } else {
            MessageBox.msgError("El bulto no corresponde al insumo");
            this._setProperty("/Pesaje_Bulto", "");
          }
        },
        onSalirEditPesaje: function (oEvent) {
          this.onCloseFragmentById("EditPendiente", "idDlgEditPendiente");
        },
        onBalanzaChange: async function (oEvent) {
          const oBalanza = oEvent
            .getParameter("selectedItem")
            .getBindingContext("localModel")
            .getObject();


          this._setProperty("/bBalanzaPiso", false);
          if (oBalanza.balanzaId == "0") {
            this._setProperty("/Pesaje_Balanza", {});
            var bEsPesoManual = this._getProperty("/EsPesoManual");
            if (bEsPesoManual) {
              this._setProperty("/VerPesaje", true);
              this.openDialog("IngresoManual", {
                source: "PesajeReembalajeHU",
              });
              //await this.detenerBalanza();
            } else {
              MessageBox.msgAlerta(
                this.oResourceBundle.getText("mensajePermitePesajeManual")
              );
            }
            //this._setProperty("/Pesaje_FactorConversion", "-");
          } else if (oBalanza.balanzaId == "-1") {
          } else {
            this._setProperty("/Pesaje_Balanza", oBalanza);
            this._setProperty("/unidadBalanza", oBalanza.oUnidad_codigo);

            var aTipoBalanzaReq = [
              { balanza: "ANALITICA", umb: "G", from: 0, to: 100 },
              { balanza: "MESA", umb: "G", from: 100, to: 32000 },
              { balanza: "PISO", umb: "G", from: 32000, to: 150000 },
            ];

            var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
              return (
                +oBalanza.capacidadMinimo >= o.from &&
                +oBalanza.capacidadMinimo < o.to
              );
            });

            var fPendiente = this._getProperty("/Pesaje_PendienteOriginal");
            var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidad");
            var umBalanza = this._getProperty("/unidadBalanza");
            var oPeso = this._factConversion(
              fPendiente,
              umBalanza,
              fPendiente,
              umInsumo
            );

            this._setProperty("/bBalanzaPiso", oBalanza.oTipoBalanza.codigo == "TB3");
            if (oTipoBalanzaReq.balanza == "ANALITICA") {
              this._setProperty(
                "/Pesaje_Fraccionamiento/unidadMostrar",
                this._getProperty("/unidadBalanza").toUpperCase()
              );

              this._setProperty(
                "/Pesaje_Pendiente2",
                formatter.peso(oPeso.oFactorToBalanza.peso)
              );
            } else {
              this._setProperty(
                "/Pesaje_Pendiente2",
                formatter.peso(fPendiente)
              );

              this._setProperty(
                "/Pesaje_Fraccionamiento/unidadMostrar",
                this._getProperty(
                  "/Pesaje_Fraccionamiento/unidadOrigen"
                ).toUpperCase()
              );
            }

            //this.onEstablecerTaraManual();

            var that = this;
            window.setTimeout(function () {
              that.bZero = false;
              that.bEstableceTara = false;
              
              if (that.onValidarConexion()) {
                that.onConnectBalanza("SI");
              }
            }, 1000);
          }
        },
        onRegresarPress: async function () {
          this._setProperty("/onMenuPesarAtencion", false);
          this._setProperty("localModel>/Detalle_Estado", "0");
          this._setProperty("/Pesaje_Fraccionamiento", null);
          await this.detenerBalanza();
          window.history.go(-1);
        },
        onIngresoManual: function (oEvent) {
          var balanzaId = this._getProperty("/Pesaje_BalanzaId");
          if (balanzaId == "0") {
            var bEsPesoManual = this._getProperty("/EsPesoManual");
            if (bEsPesoManual) {
              this._setProperty("/VerPesaje", false);
              this.openDialog("IngresoManual", {
                source: "PesajeReembalajeHU",
              });
            } else {
              MessageBox.msgAlerta("Esta sala no permite pesaje manual");
            }
          } else {
            MessageBox.msgAlerta("Selecione la Balanza como INGRESO MANUAL.");
          }
        },
        onTaraPress: async function () {
          this.bEstableceTara = true;
          this.onEstablecerTara("T", false);
        },
        onEstablecerTaraManual: async function () {
          this.bEstableceTara = true;
  
          var iTara = this._getProperty("/Pesaje_Fraccionamiento/taraFrac");
          var sUnidadBalanza = this._getProperty("/unidadBalanza");
  
          var umInsumo = this._getProperty(
            "/Pesaje_Fraccionamiento/unidadMostrar"
          );
          var cantPesar = iTara;
          var umBalanza = this._getProperty("/unidadBalanza");
          var cantBalanza = iTara;
          var oPeso = this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanza
          );
  
          var fPeso = 0;
  
          if (umInsumo.toLowerCase() == umBalanza.toLowerCase()) {
            fPeso = +iTara;
          } else {
            fPeso = oPeso.oFactorToBalanza.factor;
          }
  
          this.onEstablecerTara(
            "TA " + fPeso + " " + String(sUnidadBalanza).toLowerCase(),
            true
          );
  
          this.actualizarTotal();
        },
        onTaraManualPress: async function () {
          var oOpciones = this._getProperty("/Opciones");
          var bBalanzaPiso = this._getProperty("/bBalanzaPiso");

          if (oOpciones.TaraManual) {
            this.openDialog("TaraManual", { source: "PesajeReembalajeHU", esBalanzaPiso: bBalanzaPiso });
          } else {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("noTieneAccesoOpcion")
            );
          }
        },
        onValidarConexion: async function () {
          var self = this;
          var bMenuPesarAtencion = self._getProperty("/onMenuPesarAtencion");
          if (bMenuPesarAtencion) {
            var sIdBalanzaSelect = self._getProperty("/Pesaje_BalanzaId");
            if (sIdBalanzaSelect == "0") {
              /**PESAJE MANUAL */
            } else {
              var oBalanza = self._getProperty("/Pesaje_Balanza");

              const result = await localFunction.connectBalanza(
                oBalanza.oPuertoCom_contenido,
                oBalanza.boundRate,
                oBalanza.parity,
                oBalanza.dataBits,
                oBalanza.stopBits,
                "SI"
              );

              if (result.iCode != 1) {
                MessageBox.msgError(
                  "No hay conexión con balanza " +
                    oBalanza.oPuertoCom_contenido +
                    "."
                );
                await this.detenerBalanza();
                return false;
              } else {
                return true;
              }
            }
          }
        },
        onConnectBalanza: async function (sCommand, bZero) {
          var self = this;
          this.balanzaId = window.setInterval(async function () {
            var bMenuPesarAtencion = self._getProperty("/onMenuPesarAtencion");
            if (bMenuPesarAtencion && !self.bEstableceTara) {
              var sIdBalanzaSelect = self._getProperty("/Pesaje_BalanzaId");
              if (sIdBalanzaSelect == "0") {
                /**PESAJE MANUAL */
              } else {
                var oBalanza = self._getProperty("/Pesaje_Balanza");

                const result = await localFunction.connectBalanza(
                  oBalanza.oPuertoCom_contenido,
                  oBalanza.boundRate,
                  oBalanza.parity,
                  oBalanza.dataBits,
                  oBalanza.stopBits,
                  sCommand
                );

                if (result.iCode != 1) {
                  /*MessageToast.show("No hay conexion con balanza del puerto " + oBalanza.oPuertoCom_contenido + ".", {
                  duration: 2000
                });*/
                } else {
                  var sMensaje = result.mensaje.split(" ");
                  var iLen = sMensaje.length;
                  self._setProperty(
                    "/Pesaje_PesoBalanzaReal",
                    sMensaje[iLen - 2]
                      ? sMensaje[iLen - 2]
                      : sMensaje[iLen - 3]
                      ? sMensaje[iLen - 3]
                      : "0.000"
                  );
                  var umInsumo = self._getProperty(
                    "/Pesaje_Fraccionamiento/unidadMostrar"
                  );
                  var cantPesar = self._getProperty("/Pesaje_Pendiente2");
                  var umBalanza = self._getProperty("/unidadBalanza");
                  var cantBalanza = self._getProperty(
                    "/Pesaje_PesoBalanzaReal"
                  );
                  var oPeso = self._factConversion(
                    cantPesar,
                    umInsumo,
                    cantBalanza,
                    umBalanza
                  );
                  var iBalanzaTara = formatter.peso(
                    oPeso.oFactorToBalanza.peso
                  );
                  var sPesoEstable =
                    (sMensaje[1] ? sMensaje[1] : "").toUpperCase() == "S";

                  self._setProperty("/Pesaje_PesoBalanza", iBalanzaTara);
                  self._setProperty("/Pesaje_Mensaje", result.mensaje);
                  self._setProperty("/Peso_Estable", sPesoEstable);
                  self.actualizarTotal();
                }
              }
            }
          }, 1000);
        },
        onEstablecerTara: async function (sCommand, manual) {
          var self = this;
          var oPesajeBalanza = this._getProperty("/Pesaje_Balanza");
          var bPesoEstable = false;

          this.timerTarar = setInterval(async function () {
            if (!bPesoEstable && self.bEstableceTara) {
              const result = await localFunction.connectBalanza(
                oPesajeBalanza.oPuertoCom_contenido,
                oPesajeBalanza.boundRate,
                oPesajeBalanza.parity,
                oPesajeBalanza.dataBits,
                oPesajeBalanza.stopBits,
                sCommand
              );

              if (result.iCode == 1) {
                var sMensaje = result.mensaje.split(" ");
                var iLen = sMensaje.length;
                //var sMensaje = "S S 6 g".split(" ");
                bPesoEstable =
                  (sMensaje[1] ? sMensaje[1] : "").toUpperCase() == "S" ||
                  manual;

                var iTara = bPesoEstable
                  ? sMensaje[iLen - 2]
                    ? sMensaje[iLen - 2]
                    : sMensaje[iLen - 3]
                    ? sMensaje[iLen - 3]
                    : "0.000"
                  : 0;

                var umInsumo = self._getProperty(
                  "/Pesaje_Fraccionamiento/unidad"
                );
                var cantPesar = iTara;
                var cantBalanza = iTara;
                var umBalanza = self._getProperty("/unidadBalanza");
                var oPeso = self._factConversion(
                  cantPesar,
                  umInsumo,
                  cantBalanza,
                  umBalanza
                );

                var iFacBal = formatter.peso(oPeso.oFactorToBalanza.peso);
                self._setProperty("/Pesaje_TaraBalanza", iFacBal);
                self._setProperty("/Pesaje_TotalBalanza", iFacBal);
                self._setProperty("/Pesaje_Fraccionamiento/taraFrac", iFacBal);
                self._setProperty("/PesajeTara_Mensaje", result.mensaje);
                self._setProperty("/Pesaje_PesoBalanza", 0);

                self.bEstableceTara = false;
                self.actualizarTotal();
              } else {
                /*MessageToast.show("No hay conexion con balanza del puerto " + oPesajeBalanza.oPuertoCom_contenido + ".", {
                duration: 2000
              });*/
              }
            }
          }, 300);
        },
        onMostrarTeclado: function (oEvent) {
          const oSource = oEvent.getSource();
          var action = oSource.data("action");

          this.openDialog("QrManual", { source: "PesajeReembalajeHU_" + action });
        },
        actualizarTotal: async function () {
          const tara = parseFloat(
            this._getProperty("/Pesaje_Fraccionamiento/taraFrac")
          );
          let peso = parseFloat(this._getProperty("/Pesaje_PesoBalanza"));
          const pendiente = parseFloat(this._getProperty("/Pesaje_Pendiente2"));
          const aproximacion = Math.abs((pendiente - peso) / pendiente) * 100;
  
          this._setProperty("/Pesaje_PesoBalanzaNeto", +peso);
          this._setProperty("/Pesaje_TotalBalanza", +peso + +tara);
  
          const lblPesoBalanza = this.byId("lblPesoBalanza");
  
          lblPesoBalanza.removeStyleClass("peso-r");
          lblPesoBalanza.removeStyleClass("peso-a");
          lblPesoBalanza.removeStyleClass("peso-v");
  
          var bGuardaPeso = false;
          if (peso == 0) {
            lblPesoBalanza.addStyleClass("peso-r");
            bGuardaPeso = true;
          } else {
            if (aproximacion <= 0.1) {
              lblPesoBalanza.addStyleClass("peso-v");
              bGuardaPeso = true;
            } else if (aproximacion <= 1) {
              lblPesoBalanza.addStyleClass("peso-a");
              bGuardaPeso = false;
            } else {
              lblPesoBalanza.addStyleClass("peso-r");
              bGuardaPeso = false;
            }
          }
  
          var oBultoQr = this._getProperty("/oBultoQr");
          var bGuardarPeso = false;
          if (+peso > 0) {
            var bPesoEstable = this._getProperty("/Peso_Estable");
            var balanzaId = this._getProperty("/Pesaje_BalanzaId");
            bGuardarPeso =
            oBultoQr != null && bGuardaPeso && (bPesoEstable || balanzaId == "0") && +tara > 0;
            this._setProperty("/HabilitarGuardarPeso", bGuardarPeso);
          } else {
            this._setProperty("/HabilitarGuardarPeso", false);
          }
  
          var bIniciarPesaje = this._getProperty("/bIniciarPesaje");
          //if(bIniciarPesaje)
          this._setProperty("/bGuardarPeso", bGuardarPeso);
        },
        validarDatos: async function () {
          var oOpciones = this._getProperty("/Opciones");
          if (!oOpciones.Pesaje) {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("noTieneAccesoOpcion")
            );
            return false;
          }

          var sHuAjuste = this._getProperty("/BultoAjuste/Hu");
          var bCp03 = this._getProperty("/CP03");

          if ((sHuAjuste == "" || !sHuAjuste) && !bCp03){
            MessageBox.msgError(
              "Debe ingresar un HU Ajuste o seleccionar CP03"
            );
            return false;
          }
          
          return true;
        },
        detenerBalanza: async function () {
          if (this.balanzaId != null) {
            window.clearInterval(this.balanzaId);
          }

          if (this.timerTarar != null) {
            window.clearInterval(this.timerTarar);
          }
          //await serial.detenerPuertoCom();
        },
        seleccionarCp3: function (obj) {
          console.log(this._getProperty("/CP03"));
          //localModel>/CP03
          //this._setProperty("/CP03", false);
        },
        _formatExpandBalanza: function (aBalanza) {
          for (var key in aBalanza) {
            var oItem = aBalanza[key];
            if (oItem.oPuertoCom) {
              oItem.oPuertoCom_contenido = oItem.oPuertoCom.contenido;
            }
            if (oItem.oUnidad) {
              oItem.oUnidad_contenido = oItem.oUnidad.contenido;
            }
            if (oItem.oUnidad_contenido) {
              oItem.text =
                "Balanza: " +
                oItem.capacidadMinimo +
                " a " +
                oItem.capacidadMaximo +
                " " +
                oItem.oUnidad_contenido;
            }
          }
          return aBalanza;
        },
        _clearAllFinishPesaje: async function () {
          this._setProperty("/oBultoQr", null);
          this._setProperty("/aBultoQr", []); //Lista de Bultos validados
          this._setProperty("/bIniciarPesaje", false); //Indicador de iniciar pesaje y cerrar pistoleo
          this._setProperty("/bGuardarPeso", false);
          this._setProperty("/bEnableScan", true);
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

            iFact = oFactConversion ? +oFactConversion.campo1 : 1;
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
        _buildBulto: function (oBultoScan, oBultoValid, oCaract) {
          return { ...oBultoValid, ...oCaract, ...oBultoScan };
        },
        _getBultoConsumido: function (aBultoQr, iCantPesada) {
          var iCantBulto = 0;
          var aBultoConsumida = [];
          var iCantConsumida = iCantPesada;
          for (var key in aBultoQr) {
            var oItem = aBultoQr[key];
            iCantBulto += +oItem.Vemng;
            iCantConsumida -= +oItem.Vemng;
            if (iCantConsumida > 0) {
              //oItem.cantConsumida = +oItem.Vemng;
              oItem.cantConsumida = iCantPesada;
            } else {
              iCantConsumida = iCantConsumida * -1;
              oItem.cantConsumida = +oItem.Vemng - iCantConsumida;
            }
            oItem.VemngNew = +oItem.cantConsumida;
            oItem.cantConsumida = iCantPesada;
            aBultoConsumida.push(oItem);
            if (iCantBulto >= iCantPesada) {
              break;
            }
          }
          return aBultoConsumida;
        },
        _buildReembalarHu: function (aBultoQr, oInsumo, oPesajeInfo) {
          var aReembalajeHuSet = [];
          for (var key in aBultoQr) {
            var oItem = aBultoQr[key];
            var oBody = {
              Pedido: oInsumo.numPedido,
              Centro: oInsumo.centro,
              Orden: oInsumo.ordenNumero,
              CodigoInsumo: oInsumo.codigoInsumo,
              Lote: oInsumo.loteInsumo,
              Tipo: "FRACCION",
              NroItem: "",
              IdBulto: oItem.IdBulto,
              Tara: oPesajeInfo.Tara,
              Almacen: "CP02",
              CantConsumida: "0",
              Fraccion: String(oInsumo.numFraccion),
              Subfraccion: String(oInsumo.numSubFraccion),
              HuAjuste: !oPesajeInfo.Cp03 ? oPesajeInfo.HUAjuste : "",
              ZflagLgort: oPesajeInfo.Cp03 ? "X" : "",
              BalanzaPeso: oPesajeInfo.BalanzaPeso,
              BalanzaUnidadM: oPesajeInfo.BalanzaUnidadM,
              CantidadA: oPesajeInfo.CantidadA,
              UnidadM: oPesajeInfo.UnidadM,
              UsuarioAte: oPesajeInfo.UsuarioAte,
            };
            aReembalajeHuSet.push(oBody);
          }
          return aReembalajeHuSet;
        },
        _updateList: function (aBultoQr) {
          aBultoQr = this._UniqByKeepFirst(
            aBultoQr,
            (it) => it.IdBulto /*&& it.IdBulto*/
          );
          var count = 1;
          for (var key in aBultoQr) {
            var oItem = aBultoQr[key];
            oItem.Sequence = count; //Secuencia de pesaje
            count++;
          }
          return aBultoQr;
        },
        _initProperty: function () {
          var CERO = formatter.peso(0);
          this._clearAllFinishPesaje();
          this._setProperty("/BultoAtendido", null); //Nuevo Bulto Generado

          this._setProperty("/cantTotalBulto", "0");

          this._setProperty("/bCancelarPeso", true);
          this._setProperty("/bIniciar", true);
          this._setProperty("/bImprimirPeso", true);
          this._setProperty("/bEditarPeso", true);

          this._setProperty("/Pesaje_Bulto_Cantidad", "");

          this._setProperty("/HabilitarGuardarPeso", false);
          this._setProperty("/HabilitarImprimirPeso", false);
          this._setProperty("/Pesaje_BalanzaId", "");
          this._setProperty("/Pesaje_Fin", false);

          this._setProperty("/Pesaje_Bulto", "");
          this._setProperty("/Pesaje_FactorConversion", "");
          this._setProperty("/Peso_Estable", false);

          this._setProperty("/EsTaraManual", false);
          this._setProperty("/EsPesoManual", false);
          this._setProperty("/EsLecturaManual", false);

          this._setProperty("/Pesaje_PesoBalanzaNeto", CERO);
          this._setProperty("/Pesaje_PesoBalanza", CERO);
          this._setProperty("/Pesaje_TaraBalanza", CERO);
          this._setProperty("/Pesaje_TotalBalanza", CERO);
          this._setProperty("/PesajeTara_Mensaje", "");
          this._setProperty("/Pesaje_Mensaje", "");
          this._setProperty("/onMenuPesarAtencion", true);
          this._setProperty("/IngresoManual_PesoNeto", formatter.peso(CERO));
          this._setProperty("/Pesaje_Fraccionamiento/taraFrac", CERO);

          this._setProperty("/BultoAjuste", null);
          this._setProperty("/CP03", false);
          this._setProperty("/HUAjuste", "");

          const lblPesoBalanza = this.byId("lblPesoBalanza");
          lblPesoBalanza.removeStyleClass("peso-r");
          lblPesoBalanza.removeStyleClass("peso-a");
          lblPesoBalanza.removeStyleClass("peso-v");

          lblPesoBalanza.addStyleClass("peso-r");
        },
        _getProperty: function (sName) {
          return this.oLocalModel.getProperty(sName);
        },
        _setProperty: function (sName, value) {
          return this.oLocalModel.setProperty(sName, value);
        },
        _getFormatQr: function (sCode) {
          var sQr = sCode;
          if (!sCode) return false;

          var aQrVar = sQr.split("$");

          var oBulto = {};
          if (aQrVar.length == 1) {
            //Etiqueta
            var Etiqueta = aQrVar[0].trim();
            if (Etiqueta) {
              oBulto = {
                Etiqueta: Etiqueta,
                IdBulto: null,
                CodigoInsumo: null,
                Lote: null,
              };
              return oBulto;
            }
          } else if (aQrVar.length >= 3) {
            //QR Code
            var IdBulto = aQrVar[0].trim(),
              CodigoInsumo = aQrVar[1].trim(),
              Lote = aQrVar[2].trim();
            if (aQrVar[3]) {
              var Etiqueta = aQrVar[3].trim();
              oBulto = {
                Etiqueta: Etiqueta,
                IdBulto: IdBulto,
                CodigoInsumo: CodigoInsumo,
                Lote: Lote,
              };
              return oBulto;
            } else if (![IdBulto, CodigoInsumo, Lote].includes("")) {
              oBulto = {
                Etiqueta: "",
                IdBulto: IdBulto,
                CodigoInsumo: CodigoInsumo,
                Lote: Lote,
              };
              return oBulto;
            }
          }

          return false;
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
        onCloseFragmentById: function (sFragment, sId) {
          Fragment.byId("frg" + sFragment, sId).close();
        },
        onCloseFragment: function (sDialog) {
          var rootPath = "mif.cp.fraccionamiento";
          if (!this["o" + sDialog]) {
          }
          this["o" + sDialog].close();
        },
        onCloseDialog: function (oEvent) {
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },
        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },
        onKeyPadPress: function (oEvent) {
          const oSource = oEvent.getSource();
          var action = oSource.data("action");
          var sKeyPress = oSource.getText();

          var sText = this._getProperty("/EnterValue");
          if (sText == "0.000") sText = "";
          sText = new String(sText);
          
          var newText = "";
          if (action == "DEL") {
            newText = sText.substring(0, sText.length - 1);
          } else if (action == "VALID") {
            newText = formatter.peso(sText);
          } else {
            if (sKeyPress == "." && sText.includes(".")) {
              newText = sText;
            } else {
              newText = sText + sKeyPress;
            }
          }

          if (newText == "") {
            newText = "0.000";
          }

          var sDecimalLength = formatter.cantidadDecimal(newText);

          if (sDecimalLength < 4){
            this._setProperty("/EnterValue", newText);
          }
        },
        _cargarBalanzas: async function (oParamBalanza) {
          const oBalanza = await grupoOrden.obtenerBalanzas(oParamBalanza);

          const oFraccionamiento = this.oLocalModel.getProperty(
            "/Pesaje_Fraccionamiento"
          );
          const pendiente = +oFraccionamiento.requeridoFinal;

          let aBalanzas = oBalanza.aBalanzas;
          var aBalanzaTemp = [];
          if (oParamBalanza.bPesajeManual) {
            aBalanzaTemp.push({balanzaId: -1, codigo: "",});
            aBalanzaTemp.push({balanzaId: 0, codigo: "INGRESO MANUAL",});
          }

          aBalanzas = aBalanzaTemp.concat(aBalanzas);
          aBalanzas = this._formatExpandBalanza(aBalanzas);
          this._setProperty("/Pesaje_Balanzas", aBalanzas);
          this._setProperty("/unidadBalanza", oBalanza.sUnidadBalanza);

          var idxSeleccionaB = aBalanzas.length - 1;
          var iIdBalanza = -1;
          var objBalanza = null;
          if (aBalanzas.length > 0 && oBalanza.aBalanzas.length > 0) {
            iIdBalanza = aBalanzas[idxSeleccionaB].balanzaId;
            objBalanza = aBalanzas[idxSeleccionaB];
          } else {
            iIdBalanza =aBalanzas.length == 0 ? "-1" : aBalanzas[0].balanzaId;
            objBalanza = aBalanzas.length == 0 ? { balanzaId: -1, codigo: "" } : aBalanzas[0]
          }

          var sUnidadInsumo = oFraccionamiento.unidad;
          if (aBalanzas.length == 0) {
            this._setProperty("/unidadBalanza", sUnidadInsumo.toUpperCase());
          } else {
            this._setProperty("/unidadBalanza", objBalanza.oUnidad_contenido);
          }

          this._setProperty("/Pesaje_Balanza", objBalanza);
          this._setProperty("/Pesaje_BalanzaId", iIdBalanza);

          var sUnidadMostrar = "";
          var fPendiente2 = 0;
          if (objBalanza.tipoBalanza == "TB2") {
            var umInsumo = sUnidadInsumo;
            var cantPesar = +pendiente;
            var umBalanza = this._getProperty("/unidadBalanza");
            var oPeso = this._factConversion(
              cantPesar,
              umBalanza,
              cantPesar,
              umInsumo
            );

            fPendiente2 = formatter.peso(oPeso.oFactorToBalanza.peso);
            sUnidadMostrar = this._getProperty("/unidadBalanza");
          } else {
            sUnidadMostrar = oFraccionamiento.unidad.toUpperCase();
            fPendiente2 = formatter.peso(oParamBalanza.fPendiente);
          }

          this._setProperty("/Pesaje_Pendiente2", fPendiente2);
          this._setProperty("/Pesaje_Fraccionamiento/unidadMostrar", sUnidadMostrar);

          if (objBalanza.balanzaId != "-1") {
            this.onEstablecerTaraManual();

            if (objBalanza) {
              this._setProperty("/bBalanzaPiso", objBalanza.tipoBalanza == "TB3");

              var bTieneConexion = await this.onValidarConexion();
              if (bTieneConexion) {
                this.onConnectBalanza("SI");
              }
            }
          }

          //this.actualizarTotal();
        },
        _getCaracteristica: async function (oBulto) {
          var oCaract = await grupoOrden.ValoresPropCaracteristicasSet(oBulto);
          if (!oCaract || oCaract.error) {
            MessageBox.msgError(
              "Ocurrió un error al obtener información del Insumo."
            );
            oCaract = null;
          } else {
            oCaract = oCaract[0];
            oCaract.AtflvPesPro = oCaract.AtflvPesPro ? parseFloat(
              oCaract.AtflvPesPro.replace(/\s/g, "").replace(",", ".")
            ).toFixed(5) : 0;
            oCaract.AtflvPesEsp = oCaract.AtflvPesEsp ? parseFloat(
              oCaract.AtflvPesEsp.replace(/\s/g, "").replace(",", ".")
            ).toFixed(5) : 0;
          }

          return oCaract;
        },
      }
    );
  }
);
