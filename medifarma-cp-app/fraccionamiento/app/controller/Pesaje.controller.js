sap.ui.define(
  [
    "./Base",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
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
    JSONModel,
    Filter,
    FilterOperator,
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
    return Controller.extend("mif.cp.fraccionamiento.controller.Pesaje", {
      formatter: formatter,

      onInit: async function () {
        await this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.serviceModelOnlineV2,
          this.serviceModelOnlineV2
        );

        localFunction.init(this.oServiceModel);
        serial.init(this.oServiceModel);

        this._setProperty("/onMenuPesarAtencion", true);
        this._setProperty("/IngresoManual_PesoNeto", formatter.peso(0));

        this.oRouter
          .getRoute("pesaje")
          .attachPatternMatched(this.onRouteMatched, this);

        const bus = this.oOwnerComponent.getEventBus();
        bus.subscribe("Pesaje", "actualizarTotal", this.actualizarTotal, this);
        bus.subscribe("Pesaje", "onScanSaldoHU", this.onScanSaldoHU, this);
        bus.subscribe(
          "Pesaje",
          "onEstablecerTaraManual",
          this.onEstablecerTaraManual,
          this
        );
      },
      onRouteMatched: async function (oEvent) {
        var sTitle = this.oResourceBundle.getText("pesaje");
        const oArgs = oEvent.getParameter("arguments");
        this._setProperty("/arguments", oArgs);
        this._setProperty("/onMenuPesarAtencion", true);
        this._setProperty("/tituloPagina", sTitle);

        this._initProperty();
        await this.cargarDatos();
        this.getView().byId("inpBulto").focus();

        this.UnidadesConv = ["MLL", "L"];

        const lblPesoBalanza = this.byId("lblPesoBalanza");
        lblPesoBalanza.addStyleClass("peso-r");
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
          oCaract.AtflvPesPro = oCaract.AtflvPesPro
            ? parseFloat(
                oCaract.AtflvPesPro.replace(/\s/g, "").replace(",", ".")
              ).toFixed(5)
            : 0;
          oCaract.AtflvPesEsp = oCaract.AtflvPesEsp
            ? parseFloat(
                oCaract.AtflvPesEsp.replace(/\s/g, "").replace(",", ".")
              ).toFixed(5)
            : 0;
        }

        return oCaract;
      },
      cargarDatos: async function () {
        BusyIndicator.show(0);

        var bTaraM = false,
          bPesoM = false,
          bLectM = false;

        try {
          clearInterval(this.timerTarar);
          var oArgs = this._getProperty("/arguments");
          var fraccionamientoId = oArgs.grupoOrdenFraccionamientoId;

          this.oConfig = this._getProperty("/Config");
          this.bEstableceTara = false;
          this.oBulto = null;

          const oFraccionamiento = this.oLocalModel.getProperty(
            "/Detalle_Fraccionamiento"
          );

          //Inicio Cargar lista de materiales
          var aMaterialEmbalaje = [];
          try {
            aMaterialEmbalaje = await grupoOrden.ListaMaestraMaterialesSet();
          } catch (oError) {}

          this._setProperty("/Materiales", aMaterialEmbalaje);

          if (aMaterialEmbalaje.length > 0) {
            //Seleccionar por defecto material Bolsa
            var aMaterialCheck = ["MEBOPL", "MEBOLPL"];
            var oMaterialBolsa = aMaterialEmbalaje.find((d) =>
              aMaterialCheck.includes(d.codigo)
            );

            if (oMaterialBolsa) {
              oFraccionamiento.MatEmbalaje = oMaterialBolsa.contenido;
              oFraccionamiento.MatEmbalajeDes = oMaterialBolsa.descripcion;
            }
          }
          // Fin Cargar lista de materiales

          const pendiente =
            oFraccionamiento.requeridoFinal -
            (oFraccionamiento.atendido == null ? 0 : oFraccionamiento.atendido);

          const aBultos = await grupoOrden.obtenerBultos(fraccionamientoId);
          this._setProperty("/Pesaje_Bultos", aBultos);

          const aUnidades = await grupoOrden.obtenerUnidades();
          this._setProperty("/Pesaje_Unidades", aUnidades);

          this._setProperty("/Pesaje_Fraccionamiento", oFraccionamiento);
          this._setProperty(
            "/Pesaje_Fraccionamiento/unidadPendiente",
            oFraccionamiento.unidad
          );

          var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
            this.oConfig.salaPesajeId,
            null
          );
          if (oSalaPesaje) {
            oSalaPesaje = oSalaPesaje[0];
            bTaraM = oSalaPesaje.oEstadoTaraManual_codigo != "DHABI";
            bPesoM = oSalaPesaje.oEstadoPesoManual_codigo != "DHABI";
            bLectM = oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI";
          }

          this._setProperty("/EsTaraManual", bTaraM);
          this._setProperty("/EsPesoManual", bPesoM);
          this._setProperty("/EsLecturaManual", bLectM);

          const aFactor = await grupoOrden.obtenerFactor();
          this._setProperty("/aFactor", aFactor);

          var oDatoExtra = await this._getCaracteristica({
            CodigoInsumo: oFraccionamiento.codigoInsumo,
            Lote: oFraccionamiento.loteInsumo,
            Centro: oFraccionamiento.centro,
          });
          if (oDatoExtra) {
            this._setProperty(
              "/FactorConversion",
              oFraccionamiento.unidadOrigen == "MLL"
                ? parseFloat(+oDatoExtra.AtflvPesPro)
                : parseFloat(+oDatoExtra.AtflvPesEsp)
            );
          }

          var iFactorConve = this._getProperty("/FactorConversion");
          let oParamBalanza = {
            fPendiente: pendiente,
            sUnidad: oFraccionamiento.unidad,
            sSalaPesajeId: this.oConfig.salaPesajeId,
            bPesajeManual: bPesoM,
            fFactorConversionErp: iFactorConve,
            aFactor: aFactor,
            aUnidades: aUnidades,
          };

          const oBalanza = await grupoOrden.obtenerBalanzas(oParamBalanza);
          let aBalanzas = oBalanza.aBalanzas;
          var aBalanzaTemp = [];
          if (bPesoM) {
            aBalanzaTemp.push({ balanzaId: -1, codigo: "" });
            aBalanzaTemp.push({ balanzaId: 0, codigo: "INGRESO MANUAL" });
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
            iIdBalanza = aBalanzas.length == 0 ? "-1" : aBalanzas[0].balanzaId;
            objBalanza =
              aBalanzas.length == 0
                ? { oUnidad: { balanzaId: -1, codigo: "" } }
                : aBalanzas[0];
          }

          var sUnidadInsumo = oFraccionamiento.unidad;
          if (aBalanzas.length == 0) {
            this._setProperty("/unidadBalanza", sUnidadInsumo.toUpperCase());
          } else {
            this._setProperty("/unidadBalanza", objBalanza.oUnidad_contenido);
          }

          this._setProperty("/Pesaje_BalanzaId", iIdBalanza);
          this._setProperty("/Pesaje_Balanza", objBalanza);

          this._setProperty("/Pesaje_Fraccionamiento/taraFrac", 0);
          var fTara = this._getProperty("/Pesaje_Fraccionamiento/taraFrac");

          if (iFactorConve && parseFloat(iFactorConve) > 0) {
            this._setProperty("/Pesaje_FactorConversion", iFactorConve);
          }

          var fPendiente2 = 0;
          var sUnidadMostrar = "";
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
            fPendiente2 = formatter.peso(pendiente);
            sUnidadMostrar = sUnidadInsumo;
          }

          //validar und. medidad y cantidad del insumo con la und. medida de la balanza
          if (objBalanza.oUnidad) {
            if (
              oFraccionamiento.unidad.toUpperCase() !==
              objBalanza.oUnidad.codigo.toUpperCase()
            ) {
              var iniPendPesar = this._factConversion(
                +pendiente,
                objBalanza.oUnidad.codigo.toUpperCase(),
                +pendiente,
                oFraccionamiento.unidad.toUpperCase()
              );
              fPendiente2 = iniPendPesar.oFactorToBalanza.peso;
              sUnidadMostrar = objBalanza.oUnidad.codigo;
            }
          }

          this._setProperty("/Pesaje_Pendiente2", fPendiente2);
          this._setProperty(
            "/Pesaje_Fraccionamiento/unidadMostrar",
            sUnidadMostrar.toUpperCase()
          );

          this._setProperty(
            "/Pesaje_PendienteOriginal",
            formatter.peso(pendiente)
          );

          if (objBalanza.balanzaId != "-1") {
            this._setProperty("/Pesaje_TaraBalanza", +fTara);

            //this.onEstablecerTaraManual();
            if (aBalanzas[0]) {
              this._setProperty(
                "/bBalanzaPiso",
                objBalanza.tipoBalanza == "TB3"
              );

              var bTieneConexion = await this.onValidarConexion();
              if (bTieneConexion) {
                this.onConnectBalanza("SI");
              }
            }
          }

          //this.actualizarTotal();
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
          var iBalanzaId = this._getProperty("/Pesaje_BalanzaId");
          var pendiente = this._getProperty("/Pesaje_Pendiente2");
          var oFraccionamiento = this._getProperty("/Pesaje_Fraccionamiento");

          var sUnidad = this._getProperty(
            "/Pesaje_Fraccionamiento/unidadMostrar"
          );

          var aFactor = this._getProperty("/aFactor");
          var aUnidades = this._getProperty("/Pesaje_Unidades");
          var iFactorConve = this._getProperty("/FactorConversion");
          var bPesajeManual = this._getProperty("/EsPesoManual");
          let oParamBalanza = {
            fPendiente: pendiente,
            sUnidad: sUnidad,
            sSalaPesajeId: this.oConfig.salaPesajeId,
            bPesajeManual: bPesajeManual,
            fFactorConversionErp: iFactorConve,
            aFactor: aFactor,
            aUnidades: aUnidades,
          };

          var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
            this.oConfig.salaPesajeId
          );
          if (oSalaPesaje) {
            oSalaPesaje = oSalaPesaje[0];
            bTaraM = oSalaPesaje.oEstadoTaraManual_codigo != "DHABI";
            bPesoM = oSalaPesaje.oEstadoPesoManual_codigo != "DHABI";
            bLectM = oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI";
          }

          this._setProperty("/EsTaraManual", bTaraM);
          this._setProperty("/EsPesoManual", bPesoM);
          this._setProperty("/EsLecturaManual", bLectM);

          const oBalanza = await grupoOrden.obtenerBalanzas(oParamBalanza);
          let aBalanzas = oBalanza.aBalanzas;
          var aBalanzaTemp = [];
          if (bPesoM) {
            aBalanzaTemp.push({
              balanzaId: -1,
              codigo: "",
            });

            aBalanzaTemp.push({
              balanzaId: 0,
              codigo: "INGRESO MANUAL",
            });
          }
          aBalanzas = aBalanzaTemp.concat(aBalanzas);

          var idxSeleccionaB = aBalanzas.length - 1;

          if (aBalanzas.length > 0 && oBalanza.aBalanzas.length > 0) {
            this._setProperty(
              "/Pesaje_BalanzaId",
              aBalanzas[idxSeleccionaB].balanzaId
            );
            this._setProperty("/Pesaje_Balanza", aBalanzas[idxSeleccionaB]);
            this._setProperty(
              "/unidadBalanza",
              aBalanzas[idxSeleccionaB].oUnidad_contenido
            );
          } else {
            this._setProperty(
              "/Pesaje_BalanzaId",
              aBalanzas.length == 0 ? "-1" : aBalanzas[0].balanzaId
            );
            this._setProperty(
              "/Pesaje_Balanza",
              aBalanzas.length == 0
                ? { balanzaId: -1, codigo: "" }
                : aBalanzas[0]
            );

            if (aBalanzas.length == 0) {
              this._setProperty(
                "/unidadBalanza",
                this._getProperty(
                  "/Pesaje_Fraccionamiento/unidad"
                ).toUpperCase()
              );
            } else {
              this._setProperty(
                "/unidadBalanza",
                aBalanzas[0].oUnidad_contenido
              );
            }
          }

          this._setProperty("/Pesaje_Balanzas", aBalanzas);
          //this._setProperty("/Pesaje_BalanzaId", iBalanzaId);

          /*var that = this;
          window.setTimeout(function () {
            that.bZero = false;
            that.bEstableceTara = false;
            if (that.onValidarConexion()) {
              that.onConnectBalanza("SI");
            }
          }, 0);*/
        } catch (oError) {
          console.log(oError);
        }
        BusyIndicator.hide();
      },
      onScanSaldoHU: async function (oEvent) {
        BusyIndicator.show(0);
        var aDataDummy = [
          {
            IdBulto: "1000011895",
            Hu: "1000011895",
            Codigoinsumo: "",
            Loteinsumo: "",
            Centroinsumo: "",
            Vemng: "0.050",
            Vemeh: "KG",
          },
          {
            IdBulto: "1000011977",
            Hu: "1000011977",
            Codigoinsumo: "6000010018",
            Loteinsumo: "2031282",
            Centroinsumo: "1020",
            Vemng: "1.000",
            Vemeh: "KG",
          },
          {
            IdBulto: "1000011729",
            Hu: "1000011729",
            Codigoinsumo: "1000010124",
            Loteinsumo: "0000002149",
            Centroinsumo: "1021",
            Vemng: "1.000",
            Vemeh: "KG",
          },
          {
            IdBulto: "1000012034",
            Hu: "1000012034",
            Codigoinsumo: "1000010124",
            Loteinsumo: "0000002149",
            Centroinsumo: "1021",
            Vemng: "1.000",
            Vemeh: "KG",
          },
        ];
        /**
         * Fraccionamiento: se lee el QR de la HU
         */

        var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
        this._setProperty("/oBultoQr", null);

        try {
          var sCode = this._getProperty("/Pesaje_Bulto");
          var oBultoScan = this._getFormatQr(sCode);
          if (!oBultoScan.IdBulto) {
            this._setProperty("/sScanQR", "");
            MessageBox.msgAlerta("QR scaneado no es valido.");
            BusyIndicator.hide();
            return;
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

            var aAtendido = await grupoOrden.AtendidoItemSet({
              IdBulto: oBultoScan.IdBulto,
              CodigoInsumo: oBultoScan.CodigoInsumo,
              Lote: oBultoScan.Lote,
            });

            if (!aAtendido || aAtendido.length == 0 || aAtendido.error) {
              this._setProperty("/Pesaje_Bulto", "");
              MessageBox.msgError("HU no corresponde a la Orden / Pedido");
              BusyIndicator.hide();
            } else {
              var oBulto = aAtendido.filter(
                (d) => d.Pedido == oInsumo.numPedido && d.Tipo == "SALDO"
              );
              var sTipo = oBulto.length == 0 ? aAtendido[0].Tipo : "";

              if (oBulto.length == 0) {
                this._setProperty("/Pesaje_Bulto", "");
                MessageBox.msgError("Bulto atendido como " + sTipo);
                BusyIndicator.hide();
                return;
              }

              var oBulto = oBulto[0];
              var oBultoHu = await grupoOrden.ValidarHuSet({
                Hu: oBulto.IdBulto,
                CodigoInsumo: oBulto.CodigoInsumo,
                LoteInsumo: oBulto.Lote,
                CentroInsumo: oBulto.Centro,
              });
              if (!oBultoHu || oBultoHu.length == 0 || oBultoHu.error) {
                this._setProperty("/Pesaje_Bulto", "");
                MessageBox.msgError("Ocurrió un error al validar la HU.");
              } else {
                var oBultoHu = oBultoHu[0];
                if (["E"].includes(oBultoHu.Type)) {
                  this._setProperty("/Pesaje_Bulto", "");
                  MessageBox.msgError(oBultoHu.Messagebapi);
                  throw oBultoHu.Messagebapi;
                  /*oBultoHu = aDataDummy.find((o) => {
                    return o.IdBulto == oBulto.IdBulto;
                  });*/
                }

                var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
                if (oBulto.Pedido != oInsumo.numPedido) {
                  this._setProperty("/Pesaje_Bulto", "");
                  MessageBox.msgError("HU no corresponde a la Orden / Pedido.");
                  BusyIndicator.hide();
                  return;
                }

                /**
                * Al escanear la HU, debe de cumplir con las validaciones:
                    Que la HU exista en SAP
                    Que la HU esté en estado libre disponibilidad
                    Que la HU tenga un solo material y lote
                    Que la HU exista en el centro
                    Que la HU exista en el almacén
                    Que el material sea el mismo
                    Que el lote sea el mismo
                */
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
                } else {
                  MessageBox.msgError(
                    "Ocurrió un error al obtener caracteristicas del Insumo."
                  );
                  oCaract = {};
                }

                /*var oReserva = await grupoOrden.ReservaSet({
                  //Rsnum: oInsumo.reservaNum,
                  //Rspos: oInsumo.reservaPos,
                  Aufnr: oInsumo.ordenNumero,
                  Matnr: oInsumo.codigoInsumo,
                  //Werks: oInsumo.centroInsumo,
                });
                */

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

                if (oCaract.Fecaduc != "" && oCaract.Fecaduc) {
                  const dFechaCaduc = formatter.fechaToDate(
                    oCaract.Fecaduc,
                    "-"
                  );

                  var objValidarFechaCad =
                    grupoOrden.validaFechaCaducidad(dFechaCaduc);
                  if (objValidarFechaCad == "W") {
                    MessageBox.msgAlerta(
                      this.oResourceBundle.getText("mensajeFechaCaduc")
                    );
                  }
                  if (objValidarFechaCad == "E") {
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

                  /*
                  let bFechaCaducRango = grupoOrden.checkDateBT(
                    dFechaDesde,
                    dFechaHasta,
                    dFechaCaduc
                  );*/

                  //bFechaCaducRango = true;
                  /*if (!bFechaCaducRango) {
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
                  }*/
                }

                //this._setProperty("/bIniciarPesaje", true);
                var aBultoQr = this._getProperty("/aBultoQr");
                aBultoQr.push(this._buildBulto(oBulto, oBultoHu, oCaract));
                aBultoQr = this._updateList(aBultoQr);
                this._setProperty("/aBultoQr", aBultoQr);
                this._setProperty("/Pesaje_Bulto", "");

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
      onDeleteBulto: async function (oEvent) {
        /**
         * - Sólo se podrá borrar el bulto escaneado antes de iniciar el pesaje
         * - Al eliminar un bulto se debe de restructurar la numeracion del orden de pistoleos
         */
        if (this._getProperty("/bIniciarPesaje")) {
          MessageBox.msgError(
            "No es posible eliminar el bulto una vez iniciado el pesaje"
          );
        } else {
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("localModel");
          var iIndex = parseInt(oBindingContext.sPath.split("/").pop());

          var aBultoQr = this._getProperty("/aBultoQr");
          aBultoQr.splice(iIndex, 1);

          aBultoQr = this._updateList(aBultoQr);
          this._setProperty("/aBultoQr", aBultoQr);

          var iUltimoBulto = aBultoQr.length == 0 ? aBultoQr.length - 1 : 0;

          if (aBultoQr.length == 0) {
            this._setProperty("/cantTotalBulto", 0);
          }

          this._setProperty(
            "/oBultoQr",
            aBultoQr[iUltimoBulto] ? aBultoQr[iUltimoBulto] : null
          );
        }
      },
      onIniciarPesaje: async function (oEvent) {
        var aBultoQr = this._getProperty("/aBultoQr");
        if (aBultoQr && aBultoQr.length) {
          var oAction = await this.doMessageboxActionCustom(
            "Al iniciar pesaje ya no podra ingresar mas bultos para el pesaje. ¿Desea continuar?",
            ["SI", "NO"],
            "30%"
          );
          if (oAction === "SI") {
            this._setProperty("/bIniciarPesaje", true);
            this._setProperty("/bEnableScan", false);
            const tara = parseFloat(
              this._getProperty("/Pesaje_Fraccionamiento/taraFrac")
            );

            this._setProperty("/bGuardarPeso", +tara > 0);

            this._setProperty("/bImprimirPeso", true);
            this._setProperty("/bEditarPeso", true);
          } else if (oAction === "NO") {
          }
        } else {
          MessageBox.msgError(
            "No se puede iniciar el pesaje si no hay bultos escaneados."
          );
        }
      },
      onDetenerPesaje: async function (oEvenet) {
        var oAction = await this.doMessageboxActionCustom(
          "Al detener el pesaje se reiniciara todos los registros ingresados. ¿Desea continuar?",
          ["SI", "NO"]
        );
        if (oAction === "SI") {
          this._setProperty("/bIniciarPesaje", false);
          this._setProperty("/bEnableScan", true);
          this._setProperty("/bGuardarPeso", false);
          //this._setProperty("/bImprimirPeso", false);
          //this._setProperty("/bEditarPeso", false);
        } else if (oAction === "NO") {
        }
      },
      onGuardarPesaje: async function (oEvent) {
        BusyIndicator.show(0);
        var bIniciarPesaje = this._getProperty("/bIniciarPesaje");
        var bValidDato = await this.validarDatos();
        if (!bValidDato) return false;
        if (!bIniciarPesaje) {
          BusyIndicator.hide();
          return MessageBox.msgError(
            "Necesita iniciar el pesaje para continuar."
          );
        }
        var sUsuario = window.localStorage.getItem("usuarioCodigo");
        var oInsumo = this._getProperty("/Pesaje_Fraccionamiento");
        try {
          //consulta de atendidos
          var aBultos = await grupoOrden.AtendidoItemSet({
            Pedido: oInsumo.numPedido,
          });

          console.log(aBultos);
          if (aBultos.length > 0) {
            var aBultoFiltrado = aBultos.filter(
              (e) =>
                e.CodigoInsumo == oInsumo.codigoInsumo &&
                e.Lote == oInsumo.loteInsumo &&
                e.Orden == oInsumo.ordenNumero &&
                +e.Fraccion == +oInsumo.numFraccion &&
                +e.Subfraccion == +oInsumo.numSubFraccion &&
                e.Tipo == "FRACCION"
            );

            if (aBultoFiltrado.length > 0) {
              var isOk = false;
              var iEspera = 2 * 1000; // Segundos de espera para volver a reintentar si falla
              var numReintento = 2;
              var countIntento = 0;
              var oBultoFiltrado = aBultoFiltrado[0];
              var objBulto = {
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
                idPos: Number(oInsumo.idPos ? oInsumo.idPos : 1),
                almacen: oInsumo.almacen,
                usuarioAte: sUsuario,
                cantConsumida: "0",
                etiqueta: oBultoFiltrado.Etiqueta,
                idBulto: oBultoFiltrado.IdBulto,
                docMat: "",
                tara: formatter.peso(oBultoFiltrado.Tara),
                cantidadA: formatter.peso(oBultoFiltrado.CantidadA),
                unidadM: oBultoFiltrado.UnidadM,
                balanzaPeso: formatter.peso(oBultoFiltrado.BalanzaPeso),
                balanzaUnidadM: oBultoFiltrado.BalanzaUnidadM,
              };

              if(oInsumo.grupoOrdenBultoId == null){
                while (countIntento < numReintento) {
                  var oGrupoBulto = await grupoOrden.guardarGrupoOrdenBulto(objBulto);
                  if (oGrupoBulto.iCode == "1") {
                    countIntento = numReintento + 1;
                    isOk = true;
                  }else{
                    countIntento++;
                    MessageToast.show("Reintento #" + countIntento, {
                      duration: 2000,
                    });
                    await sleep(iEspera);
                  }
                }
              }else{
                isOk = true;
              }
              
              if(isOk){
                isOk = false;
                iEspera = 2 * 1000; // Segundos de espera para volver a reintentar si falla
                numReintento = 2;
                countIntento = 0;
                console.log(oUpdate);
                while (countIntento < numReintento) {
                  var oUpdate = await grupoOrden.fnUpdateOrdenFrac(
                    oInsumo.ordenFraccionId,
                    oInsumo.numPedido,
                    sUsuario
                  );
                  if (oUpdate.iCode == "1") {
                    countIntento = numReintento + 1;
                    isOk = true;
                  } else {
                    countIntento++;
                    MessageToast.show("Reintento #" + countIntento, {
                      duration: 2000,
                    });
                    await sleep(iEspera);
                  }
                }

                if (isOk) {
                  MessageBox.msgExitoso("Se realizó el pesaje");
                } else {
                  MessageBox.error(
                    "Ups! Algo salio mal al actualizar estados de la Fracción!."
                  );
                }
              }else{
                MessageBox.error(
                  "Ups! Algo salio mal al crear un bulto!."
                );
              }

              BusyIndicator.hide();
              MessageBox.msgError(
                "Error: Ya existe una HU: " + aBultoFiltrado[0].IdBulto
              );
              return;
            }
          }
        } catch (oError) {
          BusyIndicator.hide();
          return MessageBox.msgError("Error al verificar Fracciones.");
        }

        await this.detenerBalanza();

        try {
          /**
           * Al Guardar Peso la cantidad fraccionada pasa a CP01 y
           * se actualiza el saldo de la cantidad de la HU en CP02.
           *
           * La actualización del saldo de las HUs se da en el orden en que se escaneó.
           *
           */

          var aBultoQr = this._getProperty("/aBultoQr");

          var iPendAtender = this._getProperty("/Pesaje_Pendiente2"); //Pendiente por Atender
          var iBalanzaPeso = this._getProperty("/Pesaje_PesoBalanza"); //Peso Balanza
          var sBalanzaPesoUM = this._getProperty(
            "/Pesaje_Fraccionamiento/unidadMostrar"
          ); //Peso Balanza Unidad Medida

          var iTara = this._getProperty("/Pesaje_Fraccionamiento/taraFrac");

          if (+iBalanzaPeso < 0) {
            BusyIndicator.hide();
            this.onConnectBalanza("SI");
            return MessageBox.msgError(
              "No se puede guardar peso con valor negativo."
            );
          }

          if (+formatter.peso(iTara) == 0) {
            MessageBox.msgError("El valor de la tara debe ser mayor a 0.000");
            BusyIndicator.hide();
            return;
          }

          if (+iPendAtender > 0 && +iBalanzaPeso <= 0) {
            BusyIndicator.hide();
            this.onConnectBalanza("SI");
            return MessageBox.msgError("Ingrese un peso mayor a 0.000");
          }

          var sUnidadMOrigen = this._getProperty(
            "/Pesaje_Fraccionamiento/unidadOrigen"
          ); //Unidad real del Insumo

          /**
           * EVALUA SI REQUIERE CONVERSION POR DIMENSIONES DIFERENTES
           * UNIDAD -> MASA
           *
           * UNIDAD MEDIDA BALANZA vs INSUMO
           */

          var iBalanzaPesoConv = +iBalanzaPeso;
          var checkDimensionUnits = this._checkDimensionUnits(
            sBalanzaPesoUM,
            sUnidadMOrigen
          );
          if (checkDimensionUnits == "FACT") {
            var fFactorConversion = this._getProperty("/FactorConversion");
            var factConvertDimension = {};
            if (sUnidadMOrigen.toUpperCase() == "MLL") {
              /**
               * DIMENSION: UNIDAD
               * VALORES: MLL - MILLARES
               *
               * PASAR DE MASA a UNIDAD
               */
              //Convertir la unidad masa a la unidad base KG
              var jsConvertUnits1 = this._jsConvertUnits(
                "MASA",
                sBalanzaPesoUM.toUpperCase(),
                "KG",
                iBalanzaPeso
              );

              //Convertir la unidad base KG a la dimension de UNIDAD aplicando el factor de conversion (Unidad base en UNIDAD es MLL)
              factConvertDimension = this._factConvertDimension(
                "MASA",
                jsConvertUnits1,
                "KG",
                "UNIDAD",
                "MLL",
                fFactorConversion
              );

              //Convertir la unidad unidad base MLL a la unidad origen
              var jsConvertUnits2 = this._jsConvertUnits(
                "UNIDAD",
                "MLL",
                sUnidadMOrigen.toUpperCase(),
                factConvertDimension.value
              );
              iBalanzaPesoConv = parseFloat(jsConvertUnits2).toFixed(3);
            } else {
              /**
               * DIMENSION: VOLUMEN
               * VALORES: ML - MILILITROS
               * VALORES: L - LITROS
               *
               * PASAR DE MASA a VOLUMEN
               */

              //Convertir la unidad masa a la unidad base KG
              var jsConvertUnits1 = this._jsConvertUnits(
                "MASA",
                sBalanzaPesoUM.toUpperCase(),
                "KG",
                iBalanzaPeso
              );

              //Convertir la unidad base KG a la dimension de VOLUMEN aplicando el factor de conversion (Unidad base en VOLUMEN es L)
              factConvertDimension = this._factConvertDimension(
                "MASA",
                jsConvertUnits1,
                "KG",
                "VOLUMEN",
                "L",
                fFactorConversion
              );

              //Convertir la unidad unidad base L a la unidad origen
              var jsConvertUnits2 = this._jsConvertUnits(
                "VOLUMEN",
                "L",
                sUnidadMOrigen.toUpperCase(),
                factConvertDimension.value
              );
              iBalanzaPesoConv = parseFloat(jsConvertUnits2).toFixed(3);
            }
          } else {
            var jsConvertUnits2 = this._jsConvertUnits(
              "MASA",
              sBalanzaPesoUM.toUpperCase(),
              sUnidadMOrigen.toUpperCase(),
              iBalanzaPeso
            );
            iBalanzaPesoConv = parseFloat(jsConvertUnits2).toFixed(3);
          }

          var oAction = await this.doMessageboxActionCustom(
            this.oResourceBundle.getText("deseaGuardarPeso") +
              "" +
              formatter.peso(iBalanzaPeso) +
              " " +
              sBalanzaPesoUM,
            ["Aceptar", "Cancelar"],
            "50%"
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
            iBalanzaPesoConv
          );
          if (aBultoConsumida && aBultoConsumida.length) {
            var oPesajeInfo = {
              Tara: formatter.peso(iTara),
              BalanzaPeso: formatter.peso(iBalanzaPeso),
              BalanzaUnidadM: sBalanzaPesoUM.toLowerCase(),
              CantidadA: formatter.peso(iBalanzaPesoConv),
              UnidadM: sUnidadMOrigen.toLowerCase(),
              UsuarioAte: sUsuario,
            };

            /**
             * DESEMBALAR BULTO SALDO
             * */
            var aMessajeError = [];
            var aMessajeSuccess = [];
            var aDocMat = [];
            var aHuCons = [];
            var aHuEtiqueta = [];
            var aHuCreada = [];
            var aDesempacaHuSet = this._buildDesempacarHu(
              aBultoQr,
              oInsumo,
              oPesajeInfo
            );

            var aDesempacaHuHeadSet =
              await grupoOrden.HuPesajeFraccionamientoSet(aDesempacaHuSet);
            if (
              aDesempacaHuHeadSet &&
              aDesempacaHuHeadSet.statusCode == "200"
            ) {
              aDesempacaHuHeadSet =
                aDesempacaHuHeadSet.ActHuPesajeFraccionamientoSet.results;

              console.log("aDesempacaHuHeadSet");
              console.log(aDesempacaHuHeadSet);

              for (var key in aDesempacaHuHeadSet) {
                var oItem = aDesempacaHuHeadSet[key];
                var sMessage = this._buildMessage(oItem);
                if (["E"].includes(oItem.TypeBapi)) {
                  aMessajeError.push(sMessage);
                } else {
                  aHuCons.push(oItem.Hu);
                  aDocMat.push(oItem.Mblnr);
                  aHuEtiqueta.push(oItem.Etiqueta);
                  aHuCreada.push(oItem.Exidv);

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

                if (aHuEtiqueta[0]) {
                  var oAtendido = {
                    Etiqueta: aHuEtiqueta[0],
                  };
                  this._setProperty("/BultoAtendido", oAtendido);
                  this.onImprimirPress(null);
                  this._clearAllFinishPesaje();

                  var objBulto = {
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
                    idPos: Number(oInsumo.idPos ? oInsumo.idPos : 1),
                    tara: formatter.peso(iTara),
                    almacen: oInsumo.almacen,
                    etiqueta: aHuEtiqueta[0],
                    usuarioAte: sUsuario,
                    docMat: aDocMat[0],
                    cantConsumida: "0",
                    cantidadA: formatter.peso(iBalanzaPesoConv),
                    unidadM: sUnidadMOrigen,
                    balanzaPeso: formatter.peso(iBalanzaPeso),
                    balanzaUnidadM: sBalanzaPesoUM.toLowerCase(),
                  };

                  var isOk = false;
                  var iEspera = 2 * 1000; // Segundos de espera para volver a reintentar si falla
                  var numReintento = 2;
                  var countIntento = 0;
                  while (countIntento < numReintento) {
                    var oGrupoBulto = await grupoOrden.guardarGrupoOrdenBulto(objBulto);
                    if (oGrupoBulto.iCode == "1") {
                      countIntento = numReintento + 1;
                      isOk = true;
                    } else {
                      countIntento++;
                      MessageToast.show("Reintento #" + countIntento, {
                        duration: 2000,
                      });
                      await sleep(iEspera);
                    }
                  }

                  if (isOk) {
                    isOk = false;
                    iEspera = 2 * 1000; // Segundos de espera para volver a reintentar si falla
                    numReintento = 2;
                    countIntento = 0;
                    console.log(oUpdate);
                    while (countIntento < numReintento) {
                      var oUpdate = await grupoOrden.fnUpdateOrdenFrac(
                        oInsumo.ordenFraccionId,
                        oInsumo.numPedido,
                        sUsuario
                      );
                      if (oUpdate.iCode == "1") {
                        countIntento = numReintento + 1;
                        isOk = true;
                      } else {
                        countIntento++;
                        MessageToast.show("Reintento #" + countIntento, {
                          duration: 2000,
                        });
                        await sleep(iEspera);
                      }
                    }

                    if (isOk) {
                      MessageBox.msgExitoso("Se realizó el pesaje");
                    } else {
                      MessageBox.error(
                        "Ups! Algo salio mal al actualizar estados de la Fracción!."
                      );
                    }
                  } else {
                    MessageBox.error(
                      "Ups! Algo salio mal al crear un bulto!."
                    );
                  }

                  this._setProperty("/Pesaje_Fin", true);
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

      recursionGuardarPesaje: async function (oInsumo, numRepeat) {},
      sleep: function (ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
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
        var sType = oItem.TypeBapi;
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
          oItem.Message +
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
        var bIniciarPesaje = this._getProperty("/bIniciarPesaje");
        if (bIniciarPesaje) {
          this._setProperty("/EnterValue", "0.000");

          this._setProperty(
            "/EnterValueUM",
            this._getProperty(
              "/Pesaje_Fraccionamiento/unidadMostrar"
            ).toUpperCase()
          );
          this._setProperty("/titleDialog", "Editar Peso");
          this.onOpenFragment("EditPendientePesaje");
        } else {
          MessageBox.msgError(
            "Se requiere iniciar el pesaje para poder editar."
          );
        }
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

          this._setProperty("/Pesaje_Pendiente2", iCantidad);

          var umInsumo = this._getProperty("/Pesaje_Fraccionamiento/unidad");
          if (sUnidad.toLowerCase() == umInsumo.toLowerCase()) {
            iCantidad = iCantidad * 1;
          } else {
            iCantidad = this._jsConvertUnits(
              "MASA",
              sUnidad,
              sUnidadMedida,
              iCantidad
            );
          }

          iCantidad = formatter.peso(iCantidad);
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
        var sNumPedido = this._getProperty("/Pesaje_Fraccionamiento/numPedido");
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
            MessageBox.msgError("La cantidad del bulto debe ser mayor a cero.");
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
          this._setProperty("/Pesaje_Bulto_Cantidad", oBulto.CantidadA - fPeso);
          this._setProperty("/Pesaje_Bulto_UM", oBulto.UnidadM);

          this.oBulto = oBulto;

          this._setProperty("/Pesaje_Bulto", "");
        } else {
          MessageBox.msgError("El bulto no corresponde al insumo");
          this._setProperty("/Pesaje_Bulto", "");
        }
      },
      onSalirEditPesaje: function (oEvent) {
        this.onCloseFragmentById(
          "EditPendientePesaje",
          "idDlgEditPendientePesaje"
        );
      },
      onBalanzaChange: async function (oEvent) {
        BusyIndicator.show(0);

        var aTipoBalanzaReq = [
          { balanza: "ANALITICA", umb: "G", from: 0, to: 100, baseUmb: "G" },
          { balanza: "MESA", umb: "G", from: 100, to: 32000, baseUmb: "KG" },
          { balanza: "PISO", umb: "G", from: 32000, to: 150000, baseUmb: "KG" },
        ];

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
            this.openDialog("IngresoManual", { source: "Pesaje" });
            //await this.detenerBalanza();
          } else {
            MessageBox.msgAlerta(
              this.oResourceBundle.getText("mensajePermitePesajeManual")
            );
          }
          BusyIndicator.hide();
          //this._setProperty("/Pesaje_FactorConversion", "-");
        } else if (oBalanza.balanzaId == "-1") {
          BusyIndicator.hide();
        } else {
          this._setProperty("/Pesaje_Balanza", oBalanza);
          this._setProperty("/unidadBalanza", oBalanza.oUnidad_codigo);

          this._setProperty(
            "/bBalanzaPiso",
            oBalanza.oTipoBalanza.codigo == "TB3"
          );

          var iPendienteUM = this._getProperty(
            "/Pesaje_Fraccionamiento/unidadMostrar"
          );

          if (
            iPendienteUM.toUpperCase() != oBalanza.oUnidad_codigo.toUpperCase()
          ) {
            var iPendiente = this._getProperty("/Pesaje_Pendiente2");

            var newPeso = this._jsConvertUnits(
              "MASA",
              iPendienteUM,
              oBalanza.oUnidad_codigo,
              +iPendiente
            );
            this._setProperty("/Pesaje_Pendiente2", formatter.peso(newPeso));

            this._setProperty(
              "/Pesaje_Fraccionamiento/unidadMostrar",
              oBalanza.oUnidad_codigo.toUpperCase()
            );
          }

          await this.detenerBalanza();

          this.bEstableceTara = false;

          var bTieneConexion = await this.onValidarConexion();
          if (bTieneConexion) {
            this.onConnectBalanza("SI");
          }
        }
        BusyIndicator.hide();
      },
      onRegresarPress: async function () {
        this._setProperty("/onMenuPesarAtencion", false);

        var iEstadoConsolidadoId = this._getProperty("/EstadoConsolidadoId");
        this._setProperty("/EstadoConsolidadoId", iEstadoConsolidadoId);

        //this._setProperty("localModel>/Detalle_Estado", "0");
        await this.detenerBalanza();
        window.history.go(-1);
      },
      onIngresoManual: function (oEvent) {
        var balanzaId = this._getProperty("/Pesaje_BalanzaId");
        if (balanzaId == "0") {
          var bEsPesoManual = this._getProperty("/EsPesoManual");
          if (bEsPesoManual) {
            this._setProperty("/VerPesaje", false);
            this.openDialog("IngresoManual", { source: "Pesaje" });
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
          this.openDialog("TaraManual", {
            source: "Pesaje",
            esBalanzaPiso: bBalanzaPiso,
          });
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

            BusyIndicator.hide();

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
                var umBalanza = sMensaje[iLen - 1].replace("\r", "");
                var cantBalanza = self._getProperty("/Pesaje_PesoBalanzaReal");
                var oPeso = self._factConversion(
                  cantPesar,
                  umInsumo,
                  cantBalanza,
                  umBalanza
                );
                var iBalanzaTara = formatter.peso(oPeso.oFactorToBalanza.peso);
                var sPesoEstable =
                  (sMensaje[1] ? sMensaje[1] : "").trim().toUpperCase() == "S";

                self._setProperty("/Pesaje_PesoBalanza", iBalanzaTara);
                self._setProperty("/Pesaje_Mensaje", result.mensaje);
                self._setProperty("/Peso_Estable", sPesoEstable);
                self._setProperty(
                  "/unidadBalanza",
                  sMensaje[iLen - 1].replace("\r", "")
                );

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
                (sMensaje[1] ? sMensaje[1] : "").trim().toUpperCase() == "S" ||
                manual;

              var iTara = bPesoEstable
                ? sMensaje[iLen - 2]
                  ? sMensaje[iLen - 2]
                  : sMensaje[iLen - 3]
                  ? sMensaje[iLen - 3]
                  : "0.000"
                : 0;

              var umInsumo = self._getProperty(
                "/Pesaje_Fraccionamiento/unidadMostrar"
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
      onChangeEmbalage: async function (oEvent) {
        this.ActionTara = null;
        var oBultoQr = this._getProperty("/oBultoQr");
        /*if (!oBultoQr) {
          MessageBox.msgAlerta("Se requiere ingresar un bulto.");
          return;
        }*/

        this._showMaterialEmbalaje();
      },
      onMostrarTeclado: function () {
        this.openDialog("QrManual", { source: "Pesaje" });
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

        var bGuardarPeso = false;
        if (+peso > 0) {
          var bPesoEstable = this._getProperty("/Peso_Estable");
          var balanzaId = this._getProperty("/Pesaje_BalanzaId");
          bGuardarPeso =
            bGuardaPeso && (bPesoEstable || balanzaId == "0") && +tara > 0;
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

        var oFraccionamiento = this._getProperty("/Pesaje_Fraccionamiento");
        if (!oFraccionamiento.MatEmbalaje) {
          MessageBox.msgAlerta("Debe seleccionar un Mat. Embalaje");
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
      _factConversion: function (cantPesar, umInsumo, cantBalanza, umBalanza) {
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
          console.log(iCantConsumida);
          if (iCantConsumida > 0) {
            oItem.cantConsumida = +oItem.Vemng;
            if (aBultoConsumida.length == aBultoQr.length - 1) {
              const sumBC = aBultoConsumida.reduce((accumulator, item) => {
                return accumulator + item.VemngNew;
              }, 0);

              oItem.cantConsumida = iCantPesada - sumBC;
            }
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

        /*for (var key in aBultoQr) {
          var oItem = aBultoQr[key];
          iCantBulto += +oItem.Vemng;
          iCantConsumida -= +oItem.Vemng;
          if (iCantConsumida > 0) {
            oItem.cantConsumida = +oItem.Vemng;
            //oItem.cantConsumida = iCantPesada;
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
        }*/
        return aBultoConsumida;
      },
      _buildDesempacarHu: function (aBultoQr, oFraccionamiento, oPesajeInfo) {
        var aDesempacaHuSet = [];
        for (var key in aBultoQr) {
          var oItem = aBultoQr[key];

          oPesajeInfo.UnidadM =
            oPesajeInfo.UnidadM.toUpperCase() == oItem.Vemeh.toUpperCase()
              ? oItem.Vemeh
              : oPesajeInfo.UnidadM;

          var oBody = {
            Pedido: oFraccionamiento.numPedido,
            Hu: oItem.IdBulto,
            Codigoinsumo: oItem.Codigoinsumo,
            Loteinsumo: oItem.Loteinsumo,
            Centroinsumo: oItem.Centroinsumo,
            Orden: oFraccionamiento.ordenNumero,
            Fraccion: String(oFraccionamiento.numFraccion),
            Subfraccion: String(oFraccionamiento.numSubFraccion),
            Tipo: "FRACCION",
            NroItem: oItem.NroItem,
            Vemng: formatter.peso(oItem.VemngNew), //oItem.VemngNew
            Vemeh: oItem.Vemeh,
            Almacen: "",
            MatEmbalaje: oFraccionamiento.MatEmbalaje,
            PesoTaraKilos: oPesajeInfo.Tara,
            PesoNetoKilos: oPesajeInfo.BalanzaPeso,
            BalanzaUnidadM: oPesajeInfo.BalanzaUnidadM,
            CantidadA: oPesajeInfo.CantidadA,
            UnidadM: oPesajeInfo.UnidadM,
            PesoBrutoKilos: String(
              +oPesajeInfo.BalanzaPeso + +oPesajeInfo.Tara
            ),
            UsuarioAte: oPesajeInfo.UsuarioAte,
          };

          //oBody = this.conversionPesaje(oBody);

          aDesempacaHuSet.push(oBody);
        }
        return aDesempacaHuSet;
      },

      conversionPesaje: function (oBody) {
        var unidades = ["KG", "G"];
        if (
          unidades.includes(oBody.UnidadM.toUpperCase()) &&
          unidades.includes(oBody.BalanzaUnidadM.toUpperCase())
        ) {
          if (
            oBody.UnidadM.toUpperCase() !== oBody.BalanzaUnidadM.toUpperCase()
          ) {
            var cant = oBody.CantidadA;
            var newCant = 0;
            if (oBody.UnidadM.toUpperCase() == "G") {
              newCant = +cant * 1000;
              oBody.CantidadA = newCant.toString();
            } else {
              newCant = +cant / 1000;
              oBody.CantidadA = newCant.toString();
            }
          }
        }
        return oBody;
      },

      _showMaterialEmbalaje: async function () {
        BusyIndicator.show(0);
        var aMaterialEmbalaje = [];

        try {
          aMaterialEmbalaje = await grupoOrden.ListaMaestraMaterialesSet();
        } catch (oError) {}

        BusyIndicator.hide();
        if (!aMaterialEmbalaje || aMaterialEmbalaje.error) {
          MessageBox.error(
            "Ocurrió un error al obtenerlista de materiales de embalaje."
          );
        } else {
          if (aMaterialEmbalaje.length) {
            aMaterialEmbalaje = this._UniqByKeepFirst(
              aMaterialEmbalaje,
              (it) => it.Matnr
            );

            this.getView().setModel(
              new JSONModel(aMaterialEmbalaje),
              "MaterialEmbalajeListModel"
            );
            this.onOpenFragment("ListaMaterial");
          }
        }
      },
      onSearchMaterial: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var aFilter = [];
        aFilter.push(new Filter("Matnr", FilterOperator.Contains, sValue));
        aFilter.push(new Filter("Maktx", FilterOperator.Contains, sValue));
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter(
          new Filter({
            filters: aFilter,
            and: false,
          })
        );
      },
      onSelectMaterial: function (oEvent) {
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([]);
        var oSelectItem = null;
        var aContexts = oEvent.getParameter("selectedContexts");
        if (aContexts && aContexts.length) {
          oSelectItem = aContexts[0].getObject();
        }

        var oFraccionamiento = this._getProperty("/Pesaje_Fraccionamiento");
        oFraccionamiento.MatEmbalaje = oSelectItem.Maktx;
        oFraccionamiento.MatEmbalajeDes = oSelectItem.Matnr;

        this._setProperty("/Pesaje_Fraccionamiento", oFraccionamiento);
      },
      _updateList: function (aBultoQr) {
        aBultoQr = this._UniqByKeepFirst(
          aBultoQr,
          (it) => it.IdBulto /*&& it.IdBulto*/
        );
        var count = 1;
        var fTotalCantidad = 0;
        for (var key in aBultoQr) {
          var oItem = aBultoQr[key];
          oItem.Sequence = count; //Secuencia de pesaje
          fTotalCantidad += +oItem.Vemng;
          count++;
        }

        this._setProperty("/cantTotalBulto", fTotalCantidad);

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

        if (sDecimalLength < 4) {
          this._setProperty("/EnterValue", newText);
        }
      },
    });
  }
);
