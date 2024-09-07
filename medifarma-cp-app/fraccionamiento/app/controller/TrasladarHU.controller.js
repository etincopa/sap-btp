sap.ui.define(
  [
    "./Base",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "mif/cp/fraccionamiento/service/localFunction",
    "mif/cp/fraccionamiento/service/grupoOrden",
    "mif/cp/fraccionamiento/service/serial",
    "mif/cp/fraccionamiento/util/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    Fragment,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    localFunction,
    grupoOrden,
    serial,
    formatter,
    BusyIndicator,
    MessageToast
  ) {
    "use strict";

    var selectMenu = "";
    var that = null;
    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
    var timerTarar = 0;
    return Controller.extend("mif.cp.fraccionamiento.controller.TrasladarHU", {
      formatter: formatter,
      /**-----------------------------------------------*/
      /*              L I F E C Y C L E
        /**-----------------------------------------------*/
      onInit: async function () {
        that = this;
        await this.init();
        grupoOrden.init(
          this.oServiceModel,
          this.serviceModelOnlineV2,
          this.serviceModelOnlineV2
        );
        localFunction.init(this.oServiceModel);
        this.oRouter
          .getRoute("trasladarhu")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      onRouteMatched: async function (oEvent) {
        var sTitle = this.i18n("trasladarhu");
        var bInputManual = false;
        this._setProperty("/tituloPagina", "Trasladar HU");
        this._setProperty("/bInputManual", bInputManual);
        this._initProperty();
        await this.cargarDatos();
      },
      onBeforeRendering: function () {},
      onAfterRendering: function () {},
      onExit: function () {},
      /**-----------------------------------------------*/
      /*              E V E N T S
      /**-----------------------------------------------*/
      onScanSaldoHU: async function (oEvent) {
        BusyIndicator.show(0);
        /**
         * Fraccionamiento: se lee el QR de la HU
         * - La HU debe encontrarse en almacén CP02.
         */
        

        var oBultoQrDefault = {};

        oBultoQrDefault.AlmacenOrigen = "CP02";
        oBultoQrDefault.AlmacenDestino = "W001";

        this._setProperty("/oBultoQr", oBultoQrDefault);

        try {
          var oConfiguracion = this._getProperty("/Config");
          var sCode = this._getProperty("/sScanQR");
          var oBultoScan = this._getFormatQr(sCode);
          if (!oBultoScan.IdBulto) {
            BusyIndicator.hide();
            this._setProperty("/sScanQR", "");
            MessageBox.msgAlerta("QR scaneado no es valido.");
            return;
          } else {
            var oBultoHu = await grupoOrden.ValidarHuSet({
              Hu: oBultoScan.IdBulto,
              CentroInsumo: oConfiguracion.centro,
            });

            if (!oBultoHu || oBultoHu.length == 0 || oBultoHu.error) {
              BusyIndicator.hide();
              this._setProperty("/sScanQR", "");
              MessageBox.error("Ocurrió un error al validar la HU.");
              return;
            } else {
              var oBultoHu = oBultoHu[0];
              if (["E"].includes(oBultoHu.Type)) {
                this._setProperty("/sScanQR", "");
                MessageBox.error(oBultoHu.Messagebapi);
                throw oBultoHu.Messagebapi;
              } else {
                var oBulto = oBultoHu;

                var oBultoExiste = await grupoOrden.AtendidoItemSet({
                  IdBulto: oBultoScan.IdBulto,
                  CodigoInsumo: oBultoScan.Codigoinsumo,
                  Lote: oBultoScan.Loteinsumo,
                });

                if (oBultoExiste) {
                  if (oBultoExiste[0]) {
                    oBulto.Hu = oBultoExiste[0].IdBulto;
                  }
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
                var iFactorConve = "";
                var oCaract = await this._getCaracteristica({
                  CodigoInsumo: oBulto.CodigoInsumo,
                  Lote: oBulto.Lote,
                  Centro: oBulto.Centro,
                });
                if (oCaract) {
                  iFactorConve =
                    oBultoHu.Altme == "MLL"
                      ? parseFloat(+oCaract.AtflvPesPro)
                      : parseFloat(+oCaract.AtflvPesEsp);
                  this._setProperty("/FactorConversion", iFactorConve);
                } else {
                  this._setProperty("/sScanQR", "");
                  BusyIndicator.hide();
                  MessageBox.error(
                    "Ocurrió un error al obtener caracteristicas del Insumo."
                  );
                  oCaract = {};
                  return;
                }

                oBultoHu.VhilmNew = oBultoHu.Vhilm;
                var oBultoQr = {
                  ...oBultoHu,
                  ...oCaract,
                  ...oBulto,
                };

                if (!oBultoQr.AlmacenOrigen) {
                  oBultoQr.AlmacenOrigen = "CP02";
                }

                if (!oBultoQr.AlmacenDestino) {
                  oBultoQr.AlmacenDestino = "W001";
                }

                this._setProperty("/sScanQR", "");
                BusyIndicator.hide();
                this._setProperty("/oBultoQr", oBultoQr);
              }
            }
          }
        } catch (oError) {
          BusyIndicator.hide();
          console.log(oError);
        }
      },
      onOpenTecladoAlfaNum: async function (oEvent) {
        
        this.inputSetValue = null;
        const oSource = oEvent.getSource();
        var action = oSource.data("action");
        var sTitulo = oSource.data("titulo");

        this.inputSetValue = action;
        var defaultValue = oSource.data("defaultValue");

        if (!defaultValue) defaultValue = "";

        this.teclado = "ALFANUM";
        this._setProperty("/titleDialog", sTitulo);
        this._setProperty("/EnterValue", defaultValue);
        this.onOpenFragment("TecladoAlfaNumericoTras");
      },
      onMostrarTeclado: async function () {
        var bValido = await this.validarQrManual();
        if (!bValido) {
          return MessageBox.msgAlerta(this.i18n("mensajePermiteQrManual"));
        }
        this.teclado = "ALFANUM";
        this._setProperty("/titleDialog", "QR Manual");
        this._setProperty("/EnterValue", "");
        this.onOpenFragment("TecladoAlfaNumericoTras");
      },
      validarQrManual: async function () {
        var oConfiguracion = this.oLocalModel.getProperty("/Config");
        var bValido = false;
        var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
          oConfiguracion.salaPesajeId,
          null
        );
        if (oSalaPesaje) {
          oSalaPesaje = oSalaPesaje[0];
          this._setProperty(
            "/EsTaraManual",
            oSalaPesaje.oEstadoTaraManual_codigo != "DHABI"
          );
          this._setProperty(
            "/EsPesoManual",
            oSalaPesaje.oEstadoPesoManual_codigo != "DHABI"
          );
          this._setProperty(
            "/EsLecturaManual",
            oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI"
          );

          bValido = oSalaPesaje.oEstadoLecturaEtiqueta_codigo != "DHABI";
        }

        return bValido;
      },
      _showMaterialEmbalaje: async function () {
        BusyIndicator.show(0);
        var aMaterialEmbalaje = [];
        try {
          aMaterialEmbalaje = await grupoOrden.ListaMaterialesSet({});
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

        var oBultoQr = this._getProperty("/oBultoQr");
        oBultoQr.VhilmNew = oSelectItem.Matnr;
        oBultoQr.VhilmNewDesc = oSelectItem.Maktx;
        this._setProperty("/oBultoQr", oBultoQr);
      },
      onAceptarTeclado: async function (oEvent) {
        var sValue = this._getProperty("/EnterValue");
        this._setValueProperty(sValue);

        this.onSalirTecladoAlfaNumerico(null);
      },
      onAceptarManual: async function (oEvent) {
        var oAction = await this.doMessageboxActionCustom("¿Desea continuar?", [
          "SI",
          "NO",
        ]);
        if (oAction === "SI") {
          var iValue = this._getProperty("/EnterValue");
          var sUnidad = this._getProperty("/EnterValueUM");
          this.onSalirEditPesaje(null);
        }
      },
      onSalirEditPesaje: function (oEvent) {
        this.onCloseFragmentById("EditPendiente", "idDlgEditPendiente");
      },
      onSalirTecladoAlfaNumerico: function (oEvent) {
        this.onCloseFragmentById(
          "TecladoAlfaNumericoTras",
          "idDlgTecladoAlfaNumericoTras"
        );
      },
      onTrasladarHu: async function (oEvent) {
        
        try {
          /**
           * Actualiza el material de embalaje con el peso de la tara,
           * actualiza el saldo de la HU embalada en CP02 y
           * el saldo ajustado se mueve al almacén CP03 de diferencia
           *
           */

          var bValid = this._validInputTraslado();
          if (!bValid) {
            BusyIndicator.hide();
            return;
          }

          var oBultoQr = this._getProperty("/oBultoQr");
          if (!oBultoQr)
            return MessageBox.msgAlerta("Se requiere ingresar un bulto.");

          var oAction = await this.doMessageboxActionCustom(
            "¿Esta seguro de realizar el traslado del bulto.?",
            ["SI", "NO"]
          );
          if (oAction === "NO") return;

          BusyIndicator.show(0);
          var sUsuario = window.localStorage.getItem("usuarioCodigo");

          if (oBultoQr) {
            /**
             * Actualiza el material de embalaje (Si seleciono un nuevo embalaje),
             * peso de la tara, actualiza el saldo de la HU embalada en CP02 y
             * el saldo ajustado se mueve al almacén CP03 de diferencia
             * */
            var aMessajeError = [];
            var aMessajeSuccess = [];
            var aHuCons = [];
            var aActBultSaldo = await grupoOrden.TrasladarHuHeadSet([
              {
                Hu: oBultoQr.Hu,
                Material: oBultoQr.Codigoinsumo,
                Lote: oBultoQr.Loteinsumo,
                Centro: oBultoQr.Centroinsumo,
                AlmOri: oBultoQr.AlmacenOrigen,
                AlmDes: oBultoQr.AlmacenDestino,
              },
            ]);

            if (aActBultSaldo && aActBultSaldo.statusCode == "200") {
              if (aActBultSaldo.TrasladarHuSet)
                aActBultSaldo = aActBultSaldo.TrasladarHuSet.results;

              for (var key in aActBultSaldo) {
                var oItem = aActBultSaldo[key];
                var sMessage = this._buildMessage(oItem);
                if ([oItem.TypeBapi, oItem.Type].includes("E")) {
                  aMessajeError.push(sMessage);
                } else {
                  aHuCons.push(oItem.Exidv);
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
              } else {
                this._setProperty("/BultoAtendido", aActBultSaldo[0]);
                this._setProperty("/oBultoQr", {});
                this._clearAllFinishPesaje();
                MessageBox.success(aActBultSaldo[0].Message);

                await this._buildColaImpresion(sUsuario);
              }
            }
          }
        } catch (oError) {
          MessageBox.warning(
            "Ocurrió un error, vuelva intentarlo en unos minutos."
          );
          console.log(oError);
        }
        BusyIndicator.hide();
      },
      _validInputTraslado: function () {
        var bValid = false;

        var oBultoQr = this._getProperty("/oBultoQr");
        if (
          oBultoQr &&
          oBultoQr.Hu &&
          oBultoQr.Codigoinsumo &&
          oBultoQr.Loteinsumo &&
          oBultoQr.Centroinsumo &&
          oBultoQr.AlmacenOrigen &&
          oBultoQr.AlmacenDestino
        ) {
          bValid = true;
        } else {
          MessageBox.error(
            "Los campos: [ HU, Material, Lote, Centro, Almacen Origen/Destino ] son requeridos"
          );
        }

        return bValid;
      },
      _buildColaImpresion: async function (sUsuario) {
        var oActBultSaldo = this._getProperty("/BultoAtendido");
        try {
          BusyIndicator.show(0);

          var aColaImpresion = [
            {
              usuario: sUsuario,
              descripcion: oActBultSaldo.Mblnr,
              impresoraId: this.oConfig.impresora,
              plantillaImpresionId: "ZPL19",
              aVariable: [
                {
                  codigo: "#01#",
                  valor: oActBultSaldo.Mblnr,
                },
                {
                  codigo: "#02#",
                  valor: oActBultSaldo.Lote,
                },
                {
                  codigo: "#03#",
                  valor: oActBultSaldo.Hu,
                },
              ],
            },
          ];

          await grupoOrden.fnAddColaImpresion(aColaImpresion);

          BusyIndicator.hide();
        } catch (error) {
          BusyIndicator.hide();
          console.log(error);
        }
      },
      onRegresarPress: async function () {
        this._setProperty("/onMenuPesarAtencion", false);
        this._setProperty("/oBultoQr", null);
        window.history.go(-1);
      },
      onRefrescarDatos: async function () {
        BusyIndicator.show(0);
        var bTaraM = false,
          bPesoM = false,
          bLectM = false;
        try {
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
          var aBalanzas = await grupoOrden.obtenerBalanzaList(
            this.oConfig.salaPesajeId
          );

          var aTempBalanza = [];
          aTempBalanza.push({
            balanzaId: -1,
            codigo: "",
            text: "",
          });
          aBalanzas = aTempBalanza.concat(aBalanzas);
          aBalanzas = this._formatExpandBalanza(aBalanzas);
          this._setProperty("/Pesaje_Balanzas", aBalanzas);
        } catch (oError) {
          console.log(oError);
        }
        BusyIndicator.hide();
      },
      /**-----------------------------------------------*/
      /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/
      onConnectBalanzaPS: async function (sCommand, bZero) {
        var self = this;
        this.balanzaId = window.setInterval(async function () {
          var bMenuPesarAtencion = self._getProperty("/onMenuPesarAtencion");
          if (!self.bEstableceTara) {
            var sIdBalanzaSelect =
              self._getProperty("/Pesaje_Balanza").balanzaId;
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
                MessageToast.show(
                  "No hay conexion con balanza del puerto " +
                    oBalanza.oPuertoCom_contenido +
                    "."
                );
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
                var umInsumo = self._getProperty("/Pesaje_UmBalanza");
                var cantPesar = self._getProperty("/PesoFactor");
                var oBalanza = self._getProperty("/Pesaje_Balanza");
                var umBalanza = oBalanza.oUnidad_codigo;
                var cantBalanza = self._getProperty("/Pesaje_PesoBalanzaReal");
                var oPeso = self._factConversion(
                  cantPesar,
                  umInsumo,
                  cantBalanza,
                  umBalanza
                );
                var iBalanzaTara = formatter.peso(oPeso.oFactorToBalanza.peso);
                var sPesoEstable =
                  (sMensaje[1] ? sMensaje[1] : "").toUpperCase() == "S";

                self._setProperty("/Pesaje_PesoBalanza", iBalanzaTara);
                self._setProperty("/Pesaje_Mensaje", result.mensaje);
                self._setProperty("/Peso_Estable", sPesoEstable);
                self.actualizarTotal();
              }
            }
          }
        }, 100);
      },
      detenerBalanza: async function () {
        if (this.balanzaId != null) {
          window.clearTimeout(this.balanzaId);
        }
        await serial.detenerPuertoCom();
      },
      cargarDatos: async function () {
        BusyIndicator.show(0);

        var bTaraM = false,
          bPesoM = false,
          bLectM = false;

        try {
          clearInterval(timerTarar);
          this.oConfig = this._getProperty("/Config");
          this.bEstableceTara = false;
          this.oBulto = null;

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

          const aMaestra = await grupoOrden.maestra();
          this._setProperty("/Maestra", aMaestra);

          var _BultoQr = {
            AlmacenOrigen: "CP02",
            AlmacenDestino: "W001",
          };
          this._setProperty("/oBultoQr", _BultoQr);
        } catch (oError) {
          console.log(oError);
        }
        BusyIndicator.hide();
      },
      actualizarTotal: async function () {
        const tara = parseFloat(this._getProperty("/TaraFrac"));
        let peso = parseFloat(this._getProperty("/Pesaje_PesoBalanza"));
        const pendiente = parseFloat(this._getProperty("/PesoFactor"));
        const aproximacion = Math.abs((pendiente - peso) / pendiente) * 100;

        this._setProperty("/Pesaje_PesoBalanzaNeto", +peso);
        this._setProperty("/Pesaje_TotalBalanza", +peso + +tara);

        const lblPesoBalanza = this.byId("lblPesoBalanza");

        lblPesoBalanza.removeStyleClass("peso-r");
        lblPesoBalanza.removeStyleClass("peso-a");
        lblPesoBalanza.removeStyleClass("peso-v");

        if (peso == 0) {
          lblPesoBalanza.addStyleClass("peso-r");
        } else {
          if (aproximacion <= 0.1) {
            lblPesoBalanza.addStyleClass("peso-v");
          } else if (aproximacion <= 1) {
            lblPesoBalanza.addStyleClass("peso-a");
          } else {
            lblPesoBalanza.addStyleClass("peso-r");
          }
        }
      },
      _setValueProperty: async function (sValue) {
        

        if (this.inputSetValue == "ALMACEN_ORI") {
          this._setProperty("/oBultoQr/AlmacenOrigen", sValue);
        }
        if (this.inputSetValue == "ALMACEN_DES") {
          this._setProperty("/oBultoQr/AlmacenDestino", sValue);
        }
        if (this.inputSetValue == "QR") {
          this._setProperty("/sScanQR", sValue);
          this.onScanSaldoHU(null);
        }
      },
      _getCaracteristica: async function (oBulto) {
        var oCaract = await grupoOrden.ValoresPropCaracteristicasSet(oBulto);
        if (!oCaract || oCaract.error) {
          MessageBox.error(
            "Ocurrió un error al obtener información del Insumo."
          );
          oCaract = null;
        } else {
          oCaract = oCaract[0];
        }

        return oCaract;
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
            umb: umBalanza,
            factor: iCantFact,
          },
        };
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
              Etiqueta: Etiqueta ? Etiqueta : "",
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
              Etiqueta: Etiqueta ? Etiqueta : "",
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
      _clearAllFinishPesaje: async function () {
        this._setProperty("/sScanQR", "");

        this._setProperty("/bEnableScan", true);
        if (selectMenu == "CREA_NUEVO") {
          this._setProperty("/oBultoQr", {});
        } else {
          this._setProperty("/oBultoQr", null);
        }

        var oBultoQr = {};
        if (!oBultoQr.AlmacenOrigen) {
          oBultoQr.AlmacenOrigen = "CP02";
        }

        if (!oBultoQr.AlmacenDestino) {
          oBultoQr.AlmacenDestino = "W001";
        }

        this._setProperty("/oBultoQr", oBultoQr);
      },
      _initProperty: function () {
        var CERO = formatter.peso(0);
        this._clearAllFinishPesaje();
        this._setProperty("/BultoAtendido", null); //Nuevo Bulto Generado
        this._setProperty("/bImprimirPeso", true);

        this._setProperty("/FactorConversion", 1);
        this._setProperty("/Peso_Estable", true);

        this._setProperty("/EsTaraManual", false);
        this._setProperty("/EsPesoManual", false);
        this._setProperty("/EsLecturaManual", false);

        this._setProperty("/Pesaje_PesoBalanzaNeto", CERO);
        this._setProperty("/Pesaje_PesoBalanza", CERO);
        this._setProperty("/Pesaje_TaraBalanza", CERO);
        this._setProperty("/Pesaje_TotalBalanza", CERO);
        this._setProperty("/PesajeTara_Mensaje", "");
        this._setProperty("/Pesaje_Mensaje", "");
      },
      _buildMessage: function (oItem) {
        var sType = "";
        var sHu = "";
        var sMessage = "";
        if (oItem.Type) sType = oItem.Type;
        if (oItem.TypeBapi) sType = oItem.TypeBapi;
        if (oItem.Hu) sHu = oItem.Hu;
        if (oItem.Exidv) sHu = oItem.Exidv;
        if (oItem.Message) sMessage = oItem.Message;
        if (oItem.MessageBapi) sMessage = oItem.MessageBapi;

        if (sType == "E") sType = "ERROR";
        if (sType == "W") sType = "WARNING";
        if (sType == "S") sType = "SUCCESS";
        return (
          "<li><strong>" +
          sType +
          " (HU: " +
          sHu +
          ") " +
          "</strong> : " +
          sMessage +
          "</li>"
        );
      },
      _formatExpandBalanza: function (aBalanza) {
        for (var key in aBalanza) {
          var oItem = aBalanza[key];
          if (oItem.oPuertoCom) {
            oItem.oPuertoCom_contenido = oItem.oPuertoCom.contenido;
          }
          if (oItem.oUnidad) {
            oItem.oUnidad_contenido = oItem.oUnidad.contenido;
            oItem.oUnidad_codigo = oItem.oUnidad.codigo;
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
      /**-----------------------------------------------*/
      /*              C O N S T A N T S
        /**-----------------------------------------------*/
      _getProperty: function (sName) {
        return this.oLocalModel.getProperty(sName);
      },
      _setProperty: function (sName, value) {
        return this.oLocalModel.setProperty(sName, value);
      },
      i18n: function (i18n) {
        return this.oResourceBundle.getText(i18n);
      },
      onOpenFragment: function (sDialog) {
        var rootPath = "mif.cp.fraccionamiento";
        var sODialog = "o" + sDialog;
        if (!window[sODialog]) {
          window[sODialog] = sap.ui.xmlfragment(
            "frg" + sDialog,
            rootPath + ".view.fragment." + sDialog,
            this
          );
          this.getView().addDependent(window[sODialog]);
        }
        window[sODialog].open();

        /*if (!this[sODialog]) {
            this[sODialog] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath + ".view.fragment." + sDialog,
              this
            );
            this.getView().addDependent(this[sODialog]);
          }
          this[sODialog].open();*/
      },
      onCloseFragmentById: function (sFragment, sId) {
        Fragment.byId("frg" + sFragment, sId).close();
      },
      onCloseFragment: function (sDialog) {
        var rootPath = "mif.cp.fraccionamiento";
        var sODialog = "o" + sDialog;
        //this[sODialog].close();
        window[sODialog].close();
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
      onOpenMatchCode: async function (oEvent) {
        
        BusyIndicator.show(0);
        const oSource = oEvent.getSource();
        var action = oSource.data("action");

        var oSalaPesaje = await grupoOrden.obtenerSalaPesaje(
          this.oConfig.salaPesajeId,
          null
        );
        if (oSalaPesaje) {
          oSalaPesaje = oSalaPesaje[0];
          const aMaestra = await grupoOrden.maestra();
          this._setProperty("/Maestra", aMaestra);
          var sDialog = "";
          if (action == "CENTRO") {
            sDialog = "MatchCodeCentro";
            var aPlanta = aMaestra["PLANTA"];
            var aPlantaFilter = aPlanta.filter(function (o) {
              return oSalaPesaje.oPlanta_codigoSap == o.codigoSap;
            });
            this.getView().setModel(
              new JSONModel(aPlantaFilter),
              "McCentroModel"
            );
          } else if (action == "ALMACEN") {
            sDialog = "MatchCodeAlmacen";
            var aAlmacen = aMaestra["ALMACEN"];

            var sCentroSap = this._getProperty("/oBultoQr/Centroinsumo");

            var aCentro = this.getView().getModel("McCentroModel").getData();
            var oCentro = aCentro.find((o) => o.codigoSap === sCentroSap);

            var aAlmacenFilter = aAlmacen.filter(function (o) {
              return oCentro.campo1 == o.codigoSap;
            });

            this.getView().setModel(
              new JSONModel(aAlmacenFilter),
              "McAlmacenModel"
            );
          }

          if (sDialog) {
            this.onOpenFragment(sDialog);
          }
          BusyIndicator.hide();
        }
      },
      onOkMatchCodeCentro: function (oEvent) {
        var oSource = oEvent.getSource();
        var oTable = Fragment.byId(
          "frg" + "MatchCodeCentro",
          "idTableMatchCodeCentro"
        );
        var selectedIndices = oTable.getSelectedIndices();
        var oObject = null;
        if (selectedIndices.length > 0) {
          selectedIndices.forEach(function (index) {
            var sPath = oTable.getContextByIndex(index).getPath();
            oObject = oTable
              .getModel("McCentroModel")
              .getContext(sPath)
              .getObject();
          });

          this._setProperty("/oBultoQr/Centroinsumo", oObject.codigoSap);
          this._setProperty("/oBultoQr/Almacen", "");
          this._onCloseDialog(oSource);
        }
      },
      onOkMatchCodeAlmacen: function (oEvent) {
        var oSource = oEvent.getSource();
        var oTable = Fragment.byId(
          "frg" + "MatchCodeAlmacen",
          "idTableMatchCodeAlmacen"
        );
        var selectedIndices = oTable.getSelectedIndices();
        var oObject = null;
        if (selectedIndices.length > 0) {
          selectedIndices.forEach(function (index) {
            var sPath = oTable.getContextByIndex(index).getPath();
            oObject = oTable
              .getModel("McAlmacenModel")
              .getContext(sPath)
              .getObject();
          });

          this._setProperty("/oBultoQr/Almacen", oObject.codigoSap);

          this._onCloseDialog(oSource);
        }
      },
      onKeyPadPress: function (oEvent) {
        const oSource = oEvent.getSource();
        var action = oSource.data("action");
        var sKeyPress = oSource.getText();

        var sText = this._getProperty("/EnterValue");
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
        this._setProperty("/EnterValue", newText);
      },
      _testBalanza: function () {
        
        var self = this;
        var result = { mensaje: "SS 999.9 g" };
        var sMensaje = result.mensaje.split(" ");
        self._setProperty(
          "/Pesaje_PesoBalanzaReal",
          sMensaje[sMensaje.length - 2] > 0
            ? parseFloat(sMensaje[sMensaje.length - 2])
            : "0.000"
        );
        var umInsumo = oBultoQr.Vemeh;
        var cantPesar = self._getProperty("/PesoFactor");
        var oBalanza = self._getProperty("/Pesaje_Balanza");
        var umBalanza = oBalanza.oUnidad_codigo;
        var cantBalanza = self._getProperty("/Pesaje_PesoBalanzaReal");
        var oPeso = self._factConversion(
          cantPesar,
          umInsumo,
          cantBalanza,
          umBalanza
        );
        console.log(oPeso);
        var iTara = self._getProperty("/Pesaje_TaraBalanza");
        var iBalanzaTara = oPeso.oFactorToBalanza.peso - iTara;
        self._setProperty("/Pesaje_PesoBalanza", iBalanzaTara);
        //self._setProperty("/Pesaje_TotalBalanza", iBalanzaTara + iTara);
        self._setProperty("/Pesaje_Mensaje", result.mensaje);
        self.actualizarTotal();
        return;
      },
    });
  }
);
