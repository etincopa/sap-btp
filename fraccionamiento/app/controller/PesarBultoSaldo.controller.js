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
    return Controller.extend(
      "mif.cp.fraccionamiento.controller.PesarBultoSaldo",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: async function () {
          that = this;
          this.init();
          grupoOrden.init(
            this.oServiceModel,
            this.oServiceModelOnline,
            this.serviceModelOnlineV2
          );
          localFunction.init(this.oServiceModel);
          serial.init(this.oServiceModel);

          this.oRouter
            .getRoute("pesarbultosaldo")
            .attachPatternMatched(this.onRouteMatched, this);
          const bus = this.oOwnerComponent.getEventBus();
          bus.subscribe(
            "pesarbultosaldo",
            "actualizarTotal",
            this.actualizarTotal,
            this
          );
          bus.subscribe(
            "pesarbultosaldo",
            "onEstablecerTaraManual",
            this.onEstablecerTaraManual,
            this
          );
        },
        onRouteMatched: async function (oEvent) {
          var sTitle = "";
          var bInputManual = false;
          selectMenu = this._getProperty("/optionBultoSaldo");
          if (selectMenu == "PESA") {
            sTitle = this.i18n("pesarBultoSaldo");
          } else if (selectMenu == "CREA_ADICIONAL") {
            /**
             * Cuando se quiere crear una HU adicional de otra HU.
             * Ocurre cuando necesitan trasladar de una planta a otra y
             * necesitan fraccionar un bulto saldo en una HU adicional
             */
            sTitle = this.i18n("crearAdicionalBultoSaldo");
          } else if (selectMenu == "CREA_NUEVO") {
            /**
             * Cuando se quiere crear una HU de cero,
             * esto sucede con los bultos que producción devuelve a CP.
             */
            bInputManual = true;
            sTitle = this.i18n("crearNuevoBultoSaldo");
          }

          //window["oEditPendiente"] = null;
          //window["oTecladoAlfaNumerico"] = null;
          //window["oListaMaterial"] = null;
          this._setProperty("/tituloPagina", sTitle);
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
        onBalanzaChange: async function (oEvent) {
          BusyIndicator.show(0);
          try {
            const oBalanza = oEvent
              .getParameter("selectedItem")
              .getBindingContext("localModel")
              .getObject();

            this._setProperty("/bBalanzaPiso", false);

            if (oBalanza.balanzaId == "0") {
              var bEsPesoManual = this._getProperty("/EsPesoManual");
              this._setProperty("/Pesaje_Balanza", {});
              if (bEsPesoManual) {
              } else {
                MessageBox.msgAlerta(this.i18n("mensajePermitePesajeManual"));
              }
            } else if (oBalanza.balanzaId == "-1") {
              this._setProperty("/Pesaje_Balanza", null);
            } else {
              this._setProperty("/Pesaje_Balanza", oBalanza);
              this.bZero = false;

              this._setProperty("/bBalanzaPiso", oBalanza.oTipoBalanza.codigo == "TB3");
              this.detenerBalanza();

              this.bZero = false;
              this.bEstableceTara = false;
              await this.onValidarConexion();
            }
            BusyIndicator.hide();
          } catch (oError) {
            console.log(oError);
          }
        },
        onScanSaldoHU: async function (oEvent) {
          BusyIndicator.show(0);
          /**
           * Fraccionamiento: se lee el QR de la HU
           * - La HU debe encontrarse en almacén CP02.
           */
          debugger;
          this._setProperty("/oBultoQr", null);
          this._setProperty("/FactorConversion", 0);
          this._setProperty("/PesoConversion", 0);
          this._setProperty("/tieneFactorConversion", false);

          try {
            var bNuevoBultoSaldo = this._getProperty("/bInputManual");
            var oConfiguracion = this._getProperty("/Config");
            var sCode = this._getProperty("/sScanQR");
            var oBultoScan = this._getFormatQr(sCode);
            if (!oBultoScan.IdBulto) {
              this._setProperty("/sScanQR", "");
              MessageBox.msgAlerta("QR scaneado no es valido.");
              BusyIndicator.hide();
              return;
            } else {
              var oBultoHu = null;
              
              if (selectMenu == "PESA"){
                oBultoHu = await grupoOrden.ValidarHuSet({
                  Hu: oBultoScan.IdBulto,
                  CodigoInsumo: oBultoScan.CodigoInsumo,
                  LoteInsumo: oBultoScan.Lote,
                  CentroInsumo: oConfiguracion.centro,
                  FlagPesoSaldo: "X"
                });
              }else if (selectMenu == "CREA_NUEVO"){
                oBultoHu = [{
                  Hu: "0",
                  Codigoinsumo: oBultoScan.CodigoInsumo,
                  Loteinsumo: oBultoScan.Lote,
                  Centroinsumo: oConfiguracion.centro,
                  Type: "",
                  Vemeh: ""
                }]
              } else {
                oBultoHu = await grupoOrden.ValidarHuSet({
                  Hu: oBultoScan.IdBulto,
                  CentroInsumo: oConfiguracion.centro
                });
              }
              
              if (!oBultoHu || oBultoHu.length == 0 || oBultoHu.error) {
                this._setProperty("/sScanQR", "");
                MessageBox.error("Ocurrió un error al validar la HU.");
                BusyIndicator.hide();
                return;
              } else {
                var oBultoHu = oBultoHu[0];
                if (["E"].includes(oBultoHu.Type)) {
                  this._setProperty("/sScanQR", "");
                  MessageBox.error(oBultoHu.Messagebapi);
                  throw oBultoHu.Messagebapi;
                } else {
                  var oBulto = oBultoHu;
                  console.log(oBultoHu)
                  var oBultoExiste = await grupoOrden.AtendidoItemSet({
                    IdBulto: oBultoScan.IdBulto,
                    CodigoInsumo: oBultoScan.Codigoinsumo,
                    Lote: oBultoScan.Loteinsumo,
                  });
                  
                  oBulto.SaldoAdicional = (!oBultoExiste || oBultoExiste.error != null);

                  if (oBultoExiste){
                    if (oBultoExiste[0]){
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
                    CodigoInsumo: oBulto.Codigoinsumo,
                    Lote: oBulto.Loteinsumo,
                    Centro: oBulto.Centroinsumo,
                  });
                  if (oCaract) {
                    iFactorConve =
                      oBultoHu.Altme == "MLL"
                        ? parseFloat(
                            +oCaract.AtflvPesPro.replace(/\s/g, "").replace(
                              ",",
                              "."
                            )
                          ).toFixed(5)
                        : parseFloat(
                            +oCaract.AtflvPesEsp.replace(/\s/g, "").replace(
                              ",",
                              "."
                            )
                          ).toFixed(5);
                    this._setProperty("/FactorConversion", iFactorConve);
                    this._setProperty(
                      "/tieneFactorConversion",
                      iFactorConve > 0
                    );
                    this._setProperty(
                      "/PesoConversion",
                      formatter.peso(oBultoHu.Vemng * iFactorConve)
                    );
                  } else {
                    this._setProperty("/sScanQR", "");
                    MessageBox.error(
                      "Ocurrió un error al obtener caracteristicas del Insumo."
                    );
                    oCaract = {};
                    BusyIndicator.hide();
                    return;
                  }

                  oBultoHu.VhilmNew = oBultoHu.Vhilm;
                  var oBultoQr = {
                    ...oBultoHu,
                    ...oCaract,
                    ...oBulto,
                  };

                  this._setProperty("/oBultoQr", oBultoQr);
                  await this._setValueProperty("");

                  
                  this._setProperty("/sScanQR", "");
                  
                  await this._calculate();
                  BusyIndicator.hide();
                }
              }

              //oBulto = oBulto.filter(d => d.Pedido == oInsumo.numPedido);
            }
          } catch (oError) {
            BusyIndicator.hide();
            console.log(oError);
          }
        },
        _calculate: async function () {
          try {
            var oPesajeBalanza = this._getProperty("/Pesaje_Balanza");
            var oBultoQr = this._getProperty("/oBultoQr");
            var iFactorConve = this._getProperty("/FactorConversion");

            var iCantReal = oBultoQr ? oBultoQr.Vemng : 0;
            var iTaraReal = oBultoQr ? oBultoQr.Tarag : 0;
            const aUnidades = await grupoOrden.obtenerUnidades();
            const oUnidad = aUnidades.find(
              (e) =>
                e.codigo.toUpperCase() ==
                (oBultoQr ? oBultoQr.Vemeh.toUpperCase() : "")
            );
            if (oPesajeBalanza) {
              if (iFactorConve && iFactorConve != "") {
                iCantReal = parseFloat(+iCantReal * +iFactorConve).toFixed(
                  oPesajeBalanza.cantidadDecimales
                );
                iTaraReal = parseFloat(+iTaraReal * +iFactorConve).toFixed(
                  oPesajeBalanza.cantidadDecimales
                );
              }
            }
            this._setProperty("/PesoFactor", iCantReal); //Cantidad Neto Real + Factor
            this._setProperty("/TaraFrac", 0); //Cantidad Tara Real + Factor
            /*this._setProperty(
              "/Pesaje_UmBalanza",
              oUnidad ? oUnidad.codigoSap : ""
            );*/ //Unidad Factor KG, G

            //this._setProperty("/Pesaje_TaraBalanza", iTaraReal ? iTaraReal : 0);

            //this.onConnectBalanzaPS("SI");
            this.actualizarTotal();
          } catch (oError) {
            console.log(oError);
          }
        },
        onOpenTecladoAlfaNum: async function (oEvent) {
          debugger;
          this.inputSetValue = null;
          const oSource = oEvent.getSource();
          var action = oSource.data("action");
          this.inputSetValue = action;

          this.teclado = "ALFANUM";
          this._setProperty("/titleDialog", "QR Manual");
          this._setProperty("/EnterValue", "");
          this.onOpenFragment("TecladoAlfaNumerico", "idDlgTecladoAlfaNumerico");
        },
        onMostrarTeclado: async function () {
          var bValido = await this.validarQrManual();
          if (!bValido) {
            return MessageBox.msgAlerta(this.i18n("mensajePermiteQrManual"));
          }
          
          this.teclado = "ALFANUM";
          this.inputSetValue = null;
          this._setProperty("/titleDialog", "QR Manual");
          this._setProperty("/EnterValue", "");
          this.onOpenFragment("TecladoAlfaNumerico", "idDlgTecladoAlfaNumerico");
        },
        onIngresoManual: function (oEvent) {
          var balanzaId = this._getProperty("/Pesaje_Balanza").balanzaId;
          if (balanzaId == "0") {
            var bEsPesoManual = this._getProperty("/EsPesoManual");
            if (bEsPesoManual) {
              this._setProperty("/VerPesaje", false);
              this.openDialog("IngresoManual", { source: "pesarbultosaldo" });
            } else {
              MessageBox.msgAlerta("Esta sala no permite pesaje manual");
            }
          } else {
            MessageBox.msgAlerta("Selecione la Balanza como INGRESO MANUAL.");
          }
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
            aMaterialEmbalaje = await grupoOrden.ListaMaestraMaterialesSet({});
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
              this.onOpenFragment("ListaMaterialBS", "idDlgMaterialEmbalaje");
            }
          }
        },
        onTaraPress: async function (oEvent) {
          const oSource = oEvent.getSource();
          var action = oSource.data("action");
          this.ActionTara = action;

          var oBalanza = this._getProperty("/Pesaje_Balanza");

          if (!oBalanza) {
            MessageBox.msgAlerta("Debe seleccionar una balanza.");
            return;
          }

          var oBultoQr = this._getProperty("/oBultoQr");
          if (!oBultoQr) {
            MessageBox.msgAlerta("Se requiere ingresar un bulto.");
            return;
          }

          /**
           * Al tarar (botón tara manual o tarar)
           * consultará si desea actualizar el código de embalaje.
           */
          var oSelect = await this.doMessageboxActionCustom(
            "¿Desea actualizar el material de embalaje.?",
            ["SI", "NO", "Cancelar"],
            "30%"
          );
          if (oSelect === "SI") {
            /**
             * SI: Se mostrará una lista con los códigos de los "materiales de embalaje" y
             * su descripción que se tiene creado en el maestro de materiales y
             * el operario deberá seleccionar uno.
             */
            this._showMaterialEmbalaje();
          } else if (oSelect === "NO") {
            /**
             * NO: Se mantiene el material de embalaje de la HU
             */
            this._onTara();
          }
        },
        onChangeEmbalage: async function (oEvent) {
          this.ActionTara = null;
          var oBultoQr = this._getProperty("/oBultoQr");
          if (!oBultoQr) {
            MessageBox.msgAlerta("Se requiere ingresar un bulto.");
            return;
          }

          var oSelect = await this.doMessageboxActionCustom(
            "¿Desea actualizar el material de embalaje.?",
            ["SI", "NO"],
            "30%"
          );
          if (oSelect === "SI") {
            /**
             * SI: se mostrará una lista con los códigos de los "materiales de embalaje" y
             * su descripción que se tiene creado en el maestro de materiales y
             * el operario deberá seleccionar uno.
             */

            this._showMaterialEmbalaje();
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

          //sap.ui.getCore().byId("idDlgMaterialEmbalaje")._getCancelButton().setText("New value you want to use");

          var oBultoQr = this._getProperty("/oBultoQr");
          oBultoQr.VhilmNew = oSelectItem.Maktx;
          oBultoQr.VhilmNewDesc = oSelectItem.Matnr;
          this._setProperty("/oBultoQr", oBultoQr);
          if (this.ActionTara) {
            this._onTara();
          }
        },
        _onTara: function () {
          if (this.ActionTara == "BALANZA") {
            this.bEstableceTara = true;
            this.onEstablecerTara("T", false);
          } else if (this.ActionTara == "MANUAL") {
            this.onTaraManualPress();
          }
        },
        onTaraManualPress: function () {
          var oOpciones = this._getProperty("/Opciones");
          if (oOpciones.TaraManual) {
            var oBultoQr = this._getProperty("/oBultoQr");
            if (!oBultoQr) {
              MessageBox.msgAlerta("Se requiere ingresar un bulto.");
              return;
            }

            var iTara = this._getProperty("/TaraFrac");
            //var umInsumo = this._getProperty("/UnidadC");

            var umInsumo = this._getProperty("/EnterValueUM");
            
            if (umInsumo){
              
              var umInsumo = this._getProperty("/UnidadC");
              var umBalanzaR = this._getProperty("/EnterValueUM");
              var cantPesar = iTara;
              var cantBalanza = iTara;
              var oPeso = this._factConversion(
                cantPesar,
                umBalanzaR,
                cantBalanza,
                umInsumo
              );
              console.log(oPeso)
              if (umInsumo.toLowerCase() == umBalanzaR.toLowerCase()) {
                iTara = +iTara;
              } else {
                iTara = oPeso.oFactorToBalanza.peso;
              }
            }
            
            var bBalanzaPiso = this._getProperty("/bBalanzaPiso");
            var oBalanza = this._getProperty("/Pesaje_Balanza");

            this.teclado = "NUM";
            this._setProperty("/titleDialog", "Tara Manual");
            this._setProperty("/EnterValue", iTara);
            this._setProperty("/EnterValueUM", bBalanzaPiso ? oBalanza.oUnidad_contenido : "G");
            this.onOpenFragment("EditPendiente", "idDlgEditPendiente");
          } else {n
            MessageBox.msgAlerta(this.i18n("noTieneAccesoOpcion"));
          }
        },
        onEstablecerTaraManual: async function () {
          this.detenerBalanza();

          this.bEstableceTara = true;
          var iTara = this._getProperty("/TaraFrac");
          var umInsumo = this._getProperty("/UnidadC");
          var oBalanza = this._getProperty("/Pesaje_Balanza");
          var umBalanzaR = this._getProperty("/Pesaje_umBalanzaR");
          var cantPesar = iTara;
          var cantBalanza = iTara;
          var oPeso = this._factConversion(
            cantPesar,
            umInsumo,
            cantBalanza,
            umBalanzaR
          );

          var fPeso = 0;

          if (umInsumo.toLowerCase() == umBalanzaR.toLowerCase()) {
            fPeso = +iTara;
          } else {
            fPeso = oPeso.oFactorToBalanza.factor;
          }

          this.onEstablecerTara(
            "TA " + fPeso + " " + String(umBalanzaR).toLowerCase(),
            true
          );
        },
        onNewBultoManual: async function (oEvent) {
          debugger;
          this.newAction = null;
          if (selectMenu == "CREA_NUEVO") {
            const oSource = oEvent.getSource();
            var action = oSource.data("action");
            var sTitle = "Ingreso Peso Neto Manual";

            var bBalanzaPiso = this._getProperty("/bBalanzaPiso");
            var oBalanza = this._getProperty("/Pesaje_Balanza");

            var iPeso = "";
            var umInsumo = this._getProperty("/UnidadC");
            if (action == "P_NETO") {
              iPeso = this._getProperty("/Pesaje_PesoBalanza");
            }
            if (action == "P_TARA") {
              umInsumo = bBalanzaPiso ? oBalanza.oUnidad_contenido : "G";
              iPeso = this._getProperty("/Pesaje_TaraBalanza");
              if (umInsumo.toLowerCase() == "kg") {
                iPeso = iPeso * 1000;
              }
              sTitle = "Ingreso Peso Tara Manual";
            }

            this.newAction = action;
            this.teclado = "NUM";
            this._setProperty("/titleDialog", sTitle);
            this._setProperty("/EnterValue", iPeso);
            this._setProperty("/EnterValueUM", umInsumo);
            this.onOpenFragment("EditPendiente", "idDlgEditPendiente");
          }
        },
        onAceptarTeclado: async function (oEvent) {
          debugger;
          if (selectMenu == "CREA_NUEVO" || selectMenu == "PESA" || selectMenu == "CREA_ADICIONAL") {
            var sValue = this._getProperty("/EnterValue");
            if (this.inputSetValue == null){
              this._setProperty("/oBultoQr", null);
              this._setProperty("/sScanQR", sValue);  
              this.onScanSaldoHU(null);
            }else{
              await this._setValueProperty(sValue);
            }
          }
          this.onSalirTecladoAlfaNumerico(null);
        },
        onAceptarManual: async function (oEvent) {
          BusyIndicator.show(0);
          var oAction = await this.doMessageboxActionCustom(
            "¿Desea continuar?",
            ["SI", "NO"],
            "30%"
          );
          if (oAction === "SI") {
            var iValue = this._getProperty("/EnterValue");
            var sUnidad = this._getProperty("/EnterValueUM");

            if (+iValue == 0) {
              MessageBox.msgError("El valor de la tara debe ser mayor a CERO");
              BusyIndicator.hide();
              return;
            }

            var oBultoQr = this._getProperty("/oBultoQr");
            var oBultoQrAux = this._getProperty("/oBultoQr");
            var bValidaBulto = selectMenu == "CREA_NUEVO" && !oBultoQrAux.Codigoinsumo
            if (!oBultoQrAux || bValidaBulto) {
              BusyIndicator.hide();
              MessageBox.msgAlerta("Se requiere ingresar un bulto.");
              return;
            }

            var umInsumo = this._getProperty("/UnidadC");

            var cantPesar = iValue;
            var cantBalanza = iValue;
            var umBalanza = sUnidad;
            var oPeso = this._factConversion(
              cantPesar,
              umInsumo,
              cantBalanza,
              umBalanza
            );
            var iNewTara = oPeso.oFactorToBalanza.peso;

            if (selectMenu == "CREA_NUEVO") {
              if (this.newAction == "P_NETO") {
                this._setProperty("/Pesaje_PesoBalanza", iValue);
              }
              if (this.newAction == "P_TARA") {
                this._setProperty("/Pesaje_TaraBalanza", iNewTara);
                this._setProperty("/TaraFrac", iNewTara);
              }

              //this._setProperty("/Pesaje_TotalBalanza", iTara);
              //this._setProperty("/PesajeTara_Mensaje", result.mensaje);
              //this._setProperty("/Pesaje_PesoBalanza", 0);
              this.actualizarTotal();
              BusyIndicator.hide();
            } else {
              this._setProperty("/Pesaje_TaraBalanza", iNewTara);
              this._setProperty("/TaraFrac", iNewTara);
              this._setProperty("/TaraFracReal", cantBalanza);

              this.onEstablecerTaraManual();
              BusyIndicator.hide();
            }
            this.onSalirEditPesaje(null);
          }else{
            BusyIndicator.hide();
          }
        },
        onSalirEditPesaje: function (oEvent) {
          this.onCloseFragmentById("EditPendiente", "idDlgEditPendiente");
        },
        onSalirTecladoAlfaNumerico: function (oEvent) {
          this.onCloseFragmentById(
            "TecladoAlfaNumerico",
            "idDlgTecladoAlfaNumerico"
          );
        },
        onEstablecerTara: async function (sCommand, manual) {
          if (this.balanzaId != null) {
            window.clearInterval(this.balanzaId);
          }

          var self = this;
          var oPesajeBalanza = this._getProperty("/Pesaje_Balanza");
          var bPesoEstable = false;

          if ((!bPesoEstable || manual) && self.bEstableceTara) {
            const result = await localFunction.connectBalanza(
              oPesajeBalanza.oPuertoCom_contenido,
              oPesajeBalanza.boundRate,
              oPesajeBalanza.parity,
              oPesajeBalanza.dataBits,
              oPesajeBalanza.stopBits,
              sCommand
            );

            if (result.iCode == 1) {
              var sMensaje = (manual ? sCommand : result.mensaje).split(" ");
              var iLen = sMensaje.length;
              //var sMensaje = "S S 6 g".split(" ");
              bPesoEstable =
                (sMensaje[1] ? sMensaje[1] : "").toUpperCase() == "S" || manual;

              var iTara = bPesoEstable
                ? sMensaje[iLen - 2]
                  ? sMensaje[iLen - 2]
                  : sMensaje[iLen - 3]
                  ? sMensaje[iLen - 3]
                  : "0.000"
                : 0;

              var umInsumo = self._getProperty("/UnidadC");
              var cantPesar = iTara;
              var cantBalanza = iTara;

              var umBalanzaR = that._getProperty("/Pesaje_umBalanzaR");
              var oPeso = self._factConversion(
                cantPesar,
                umInsumo,
                cantBalanza,
                umBalanzaR
              );

              var iFacBal = oPeso.oFactorToBalanza.peso;
              //self._setProperty("/Pesaje_TaraBalanza", iFacBal);
              self._setProperty("/Pesaje_TotalBalanza", iFacBal);
              self._setProperty("/TaraFrac", iFacBal);
              self._setProperty("/PesajeTara_Mensaje", result.mensaje);
              //self._setProperty("/Pesaje_PesoBalanza", 0);

              self.bEstableceTara = false;
              self.sBalanzaPesoEstable = false;

              manual = false;
              self.onConnectBalanzaPS("SI");
            } else {
              this.onEstablecerTara(sCommand, manual);
            }
          }
        },
        onGuardarPesaje: async function (oEvent) {
          debugger;
          try {
            /**
             * Actualiza el material de embalaje con el peso de la tara,
             * actualiza el saldo de la HU embalada en CP02 y
             * el saldo ajustado se mueve al almacén CP03 de diferencia
             *
             */

            var oBultoQr = this._getProperty("/oBultoQr");
            if (!oBultoQr) {
              BusyIndicator.hide();
              MessageBox.msgAlerta("Se requiere ingresar un bulto.");
              return;
            }

            var oAction = await this.doMessageboxActionCustom(
              "¿Esta seguro de realizar el guardado del bulto.?",
              ["SI", "NO"],
              "30%"
            );
            if (oAction === "NO") return;

            BusyIndicator.show(0);

            this.detenerBalanza();

            var sUsuario = window.localStorage.getItem("usuarioCodigo");

            var iFactorConve = this._getProperty("/FactorConversion");
            var sUnidadMedida = oBultoQr.Vemeh; //Unidad real del Insumo
            var iPesoBalanza = this._getProperty("/Pesaje_PesoBalanza");
            var iTara = this._getProperty("/TaraFrac");
            var iTaraBalanza = this._getProperty("/TaraFrac");
            var iPendAtender = this._getProperty("/PesoFactor");

            if (+iPesoBalanza < 0) {
              this.onConnectBalanzaPS("SI");
              BusyIndicator.hide();
              return MessageBox.error(
                "No se puede guardar peso con valor negativo."
              );
            }
            this._setProperty("/Opcion", selectMenu);
            var fPesajeTotal = this._getProperty("/Pesaje_TotalBalanza");
            if (+iTara == 0 && fPesajeTotal > 0) {
              this.onConnectBalanzaPS("SI");
              MessageBox.msgError("El valor de la tara debe ser mayor a CERO");
              BusyIndicator.hide();
              return;
            }

            if (+iPendAtender > 0 && +iPesoBalanza <= 0) {
              this.onConnectBalanzaPS("SI");
              BusyIndicator.hide();
              return MessageBox.error("Ingrese un peso mayor a 0.000");
            }

            if (iFactorConve && Number(iFactorConve) && +iFactorConve > 0) {
              /**
               * Revertir unidad si existe factor conversion de insumo:
               * LT a KG -> KG a LT
               * */
              iPesoBalanza = +iPesoBalanza / +iFactorConve;
              iTara = +iTara / +iFactorConve;
            }

            if (oBultoQr) {
              /**
               * Actualiza el material de embalaje (Si seleciono un nuevo embalaje),
               * peso de la tara, actualiza el saldo de la HU embalada en CP02 y
               * el saldo ajustado se mueve al almacén CP03 de diferencia
               * */
              var aMessajeError = [];
              var aMessajeSuccess = [];
              var aHuCons = [];

              iPesoBalanza = formatter.peso(iPesoBalanza);
              iTara = formatter.peso(iTara);
              iTaraBalanza = formatter.peso(iTaraBalanza);

              if (selectMenu == "PESA") {
                var aActBultSaldo = await grupoOrden.ActBultSalMisHuHeadSet([
                  {
                    Exidv: oBultoQr.Hu,
                    Matnr: oBultoQr.Codigoinsumo,
                    Charg: oBultoQr.Loteinsumo,
                    Werks: oBultoQr.Centroinsumo,
                    Vhilm: oBultoQr.VhilmNew, //Nuevo Material Embalaje si se cambia

                    CantPesada: iPesoBalanza, //Cantidad Neta Balanza
                    PesoNeto: iPesoBalanza, //Cantidad Neta Balanza
                    PesoTara: iTaraBalanza, //Peso Tara
                    PesoBruto: formatter.peso(+iPesoBalanza + +iTaraBalanza),
                    Umed: oBultoQr.Vemeh,
                  },
                ]);
              } else if (selectMenu == "CREA_ADICIONAL") {
                /**
                 * Cuando se quiere crear una HU adicional de otra HU.
                 * Ocurre cuando necesitan trasladar de una planta a otra y
                 * necesitan fraccionar un bulto saldo en una HU adicional
                 */
                var aActBultSaldo = await grupoOrden.ActBultSalNueHuHeadSet([
                  {
                    Exidv: oBultoQr.Hu,
                    Matnr: oBultoQr.Codigoinsumo,
                    Charg: oBultoQr.Loteinsumo,
                    Werks: oBultoQr.Centroinsumo,
                    Vhilm: oBultoQr.VhilmNew, //Nuevo Material Embalaje si se cambia

                    CantPesada: iPesoBalanza, //Cantidad Neta Balanza
                    PesoNetoKilos: iPesoBalanza, //Cantidad Neta Balanza
                    PesoTaraKilos: iTaraBalanza, //Peso Tara
                    PesoBrutoKilos: formatter.peso(+iPesoBalanza + +iTaraBalanza),
                    Umed: oBultoQr.Vemeh,
                  },
                ]);
              } else if (selectMenu == "CREA_NUEVO") {
                var bValid = this._validInputsCreateNew();
                if (!bValid) {
                  BusyIndicator.hide();
                  return;
                }
                var aActBultSaldo = await grupoOrden.CrearNuevaHuHeadSet([
                  {
                    Material: oBultoQr.Codigoinsumo,
                    Lote: oBultoQr.Loteinsumo,
                    Um: oBultoQr.Vemeh,
                    Centro: oBultoQr.Centroinsumo,
                    MatEmbalaje: oBultoQr.VhilmNew,

                    Cantidad: iPesoBalanza,
                    PesoNetoKilos: iPesoBalanza, //Cantidad Neta Balanza
                    PesoTaraKilos: iTaraBalanza, //Peso Tara
                    PesoBrutoKilos: formatter.peso(+iPesoBalanza + +iTaraBalanza),
                  },
                ]);
              }

              if (aActBultSaldo && aActBultSaldo.statusCode == "200") {
                if (aActBultSaldo.ActBultSalMisHuSet)
                  aActBultSaldo = aActBultSaldo.ActBultSalMisHuSet.results;
                if (aActBultSaldo.ActBultSalNueHuSet)
                  aActBultSaldo = aActBultSaldo.ActBultSalNueHuSet.results;
                if (aActBultSaldo.CrearNuevaHuSet)
                  aActBultSaldo = aActBultSaldo.CrearNuevaHuSet.results;

                for (var key in aActBultSaldo) {
                  var oItem = aActBultSaldo[key];
                  var sMessage = this._buildMessage(oItem);
                  if ([oItem.TypeBapi, oItem.Type].includes("E")) {
                    aMessajeError.push(sMessage);
                  } else {
                    aHuCons.push(oItem.Exidv ? oItem.Exidv : oItem.Hu);
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
                  this.onConnectBalanzaPS("SI");
                  MessageBox.error("Se encontraton errores.", oContent);
                  BusyIndicator.hide();
                } else {
                  this.bBultoSaldoGuardado = true;

                  var oBultoAtendido = aActBultSaldo[0];
                  oBultoAtendido.PesoNeto = iPesoBalanza;
                  oBultoAtendido.PesoTara = iTaraBalanza;
                  oBultoAtendido.Opcion = selectMenu;

                  this._setProperty("/BultoAtendido", oBultoAtendido);

                  this.onImprimirPress(null);
                  this._initProperty();
                  MessageBox.msgExitoso("Proceso realizado con exito.");
                  this._setProperty("/oBultoQr", null);
                }
              }
            } else {
              BusyIndicator.hide();
            }
          } catch (oError) {
            BusyIndicator.hide();
            MessageBox.warning(
              "Ocurrió un error, vuelva intentarlo en unos minutos."
            );
            console.log(oError);
          }
        },
        _validInputsCreateNew: function () {
          var bValid = false;

          var oBultoQr = this._getProperty("/oBultoQr");
          if (
            oBultoQr &&
            oBultoQr.Codigoinsumo &&
            oBultoQr.Vemeh &&
            oBultoQr.Centroinsumo &&
            oBultoQr.VhilmNew
          ) {
            bValid = true;
          } else {
            MessageBox.error(
              "Los campos: [ Material, Lote, Centro, Mat.Embalaje ] son requeridos"
            );
          }

          return bValid;
        },
        onDarDeBaja: async function (oEvent) {
          /**
           * Si se quiere dar de baja a un bulto
           * porque ya no tiene cantidad en físico
           * se deberá ejecutar la opción "Dar de baja"
           */
          var oBultoQr = this._getProperty("/oBultoQr");
          if (!oBultoQr) {
            MessageBox.msgAlerta("Se requiere ingresar un bulto.");
            return;
          }

          try {
            var oAction = await this.doMessageboxActionCustom(
              "¿Esta seguro de dar de baja el bulto.?",
              ["SI", "NO"],
              "30%"
            );

            BusyIndicator.show(0);

            this.detenerBalanza();

            if (oAction === "SI") {
              /**
               * Se actualiza el saldo de la HU y
               * el saldo ajustado se mueve al almacén CP03 de diferencias.
               *
               * - No se imprime etiqueta
               */
              var oResp = await grupoOrden.ModificarDetHuHeadSet([
                {
                  Exidv: oBultoQr.Hu,
                  Matnr: oBultoQr.Codigoinsumo,
                  Charg: oBultoQr.Loteinsumo,
                  Werks: oBultoQr.Centroinsumo,
                  CantPesada: "0",
                  Umed: oBultoQr.Vemeh,
                },
              ]);

              var aMessajeError = [];
              var aHuCons = [];
              var aDocMat = [];
              var aMessajeSuccess = [];
              if (oResp && oResp.statusCode == "200") {
                var aModificarDetHuSet = oResp.ModificarDetHuSet.results;

                for (var key in aModificarDetHuSet) {
                  var oItem = aModificarDetHuSet[key];
                  var sMessage = this._buildMessage(oItem);
                  if (["E"].includes(oItem.TypeBapi)) {
                    aMessajeError.push(sMessage);
                  } else {
                    aHuCons.push(oItem.Exidv);
                    aDocMat.push(oItem.MblnrTras);
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
                  BusyIndicator.hide();
                  MessageBox.error("Se encontraton errores.", oContent);
                } else {
                  BusyIndicator.hide();
                  this._setProperty("/BultoAtendido", aModificarDetHuSet[0]);
                  this._initProperty();
                  MessageBox.msgExitoso("Proceso realizado con exito.");
                  this._setProperty("/oBultoQr", null);
                }
              }
            }else{
              BusyIndicator.hide();
            }
          } catch (oError) {
            BusyIndicator.hide();
            console.log(oError);
          }
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

            var aFactor = this._getProperty("/aFactor");
            var iFactorConve = this._getProperty("/FactorConversion");
            var bPesajeManual = this._getProperty("/EsPesoManual");
            let oParamBalanza = {
              fPendiente: pendiente,
              sUnidad: oFraccionamiento.unidad,
              sSalaPesajeId: this.oConfig.salaPesajeId,
              bPesajeManual: bPesajeManual,
              fFactorConversionErp: iFactorConve,
              aFactor: aFactor,
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
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        onImprimirPress: async function (oEvent) {
          try {
            BusyIndicator.show(0);
            var oBultoQr = this._getProperty("/oBultoQr");
            var oAtendido = this._getProperty("/BultoAtendido");
            var oPesajeBalanza = this._getProperty("/Pesaje_Balanza");
            var sOpcion = selectMenu;

            if (!oBultoQr) {
              BusyIndicator.hide();
              MessageBox.msgAlerta("Se requiere ingresar un bulto.");
              return;
            }


            /*if () {
            MessageBox.msgAlerta("Necesita generar una etiqueta para imprimir.");
            return;
          }*/

            if (oEvent) {
              var oAction = await this.doMessageboxActionCustom(
                "Se procedera a generar la impresión. ¿Desea continuar?",
                ["SI", "NO"],
                "30%"
              );
              if (oAction === "SI") {
              } else if (oAction === "NO") {
                return false;
              }
            }
            
            var bSaldoAdicional = sOpcion == "CREA_ADICIONAL";
            var sUsuario = window.localStorage.getItem("usuarioCodigo");
            var oResp = await grupoOrden.fnSendPrintBulto({
              impresoraId: this.oConfig.impresora,
              etiqueta: "",
              idBulto: bSaldoAdicional
                ? oBultoQr.Hu
                : oAtendido
                ? oAtendido.Exidv
                : oBultoQr.Hu,
              usuario: sUsuario,
              bSaldo:
                (this.bBultoSaldoGuardado ? "X" : "PT") +
                "|" +
                (oPesajeBalanza ? oPesajeBalanza.codigo : "") +
                "|" +
                (oAtendido ? oAtendido.PesoNeto : oBultoQr.Vemng) +
                "|" +
                (oAtendido ? oAtendido.PesoTara : "") +
                "|" +
                (bSaldoAdicional && this.bBultoSaldoGuardado  ? oAtendido.Exidv : oBultoQr.Hu) +
                "|" +
                this._getProperty("/UnidadC"),
            });
            if (oResp.iCode == "1") {
              BusyIndicator.hide();
              MessageBox.msgExitoso(
                this.i18n("mensajeImpresionEtiqueta") + oBultoQr.Hu
              );
            } else {
              BusyIndicator.hide();
              MessageBox.error("Ocurrio un error al imprimir.");
            }
          } catch (error) {
            BusyIndicator.hide();
            MessageBox.error("Ocurrio un error al imprimir.");
          }
        },
        onRegresarPress: async function () {
          this._setProperty("/onMenuPesarAtencion", false);
          this.detenerBalanza();

          setTimeout(function () {
            window.history.go(-1);
          }, 1000);
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
              text: "SELECCIONE",
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
          var oBalanza = self._getProperty("/Pesaje_Balanza");

          this.balanzaId = window.setInterval(async function () {
            var bMenuPesarAtencion = self._getProperty("/onMenuPesarAtencion");
            if (!self.bEstableceTara) {
              var sIdBalanzaSelect = oBalanza ? oBalanza.balanzaId : 0;
              if (sIdBalanzaSelect == "0") {
                /**PESAJE MANUAL */
              } else {
                const result = await localFunction.connectBalanza(
                  oBalanza.oPuertoCom_contenido,
                  oBalanza.boundRate,
                  oBalanza.parity,
                  oBalanza.dataBits,
                  oBalanza.stopBits,
                  sCommand
                );

                if (result.iCode == 1) {
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

                  var umInsumo = self._getProperty("/UnidadC");
                  var cantPesar = self._getProperty("/PesoFactor");

                  var umBalanza = sMensaje[iLen - 1].replace("\r", "");
                  var cantBalanza = self._getProperty(
                    "/Pesaje_PesoBalanzaReal"
                  );
                  var oPeso = self._factConversion(
                    cantPesar,
                    umInsumo ? umInsumo : umBalanza,
                    cantBalanza,
                    umBalanza
                  );
                  var iBalanzaTara = formatter.peso(
                    oPeso.oFactorToBalanza.peso
                  );

                  this.sBalanzaPesoEstable =
                    (sMensaje[1] ? sMensaje[1] : "").toUpperCase() == "S";

                  self._setProperty("/Pesaje_PesoBalanza", iBalanzaTara);
                  self._setProperty("/Pesaje_Mensaje", result.mensaje);
                  self._setProperty("/Peso_Estable", this.sBalanzaPesoEstable);
                  self._setProperty("/Pesaje_umBalanzaR", umBalanza);
                  BusyIndicator.hide();

                  self.actualizarTotal();
                }
              }
            }
          }, 1000);
        },
        onValidarConexion: async function (sCommand, bZero) {
          var self = this;
          var bMenuPesarAtencion = true;
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
                sCommand
              );

              if (result.iCode != 1) {
                MessageBox.msgError(
                  "No hay conexión con balanza " +
                    oBalanza.oPuertoCom_contenido +
                    "."
                );
              } else {
                that.onConnectBalanzaPS("SI");
              }
            }
          }
        },
        detenerBalanza: function () {
          if (this.balanzaId != null) {
            window.clearInterval(that.balanzaId);
          }

          if (this.timerTarar != null) {
            window.clearInterval(that.timerTarar);
          }
        },
        cargarDatos: async function () {
          BusyIndicator.show(0);

          var bTaraM = false,
            bPesoM = false,
            bLectM = false;

          try {
            this.detenerBalanza();

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

            if (selectMenu == "CREA_NUEVO") {
              const aMaestra = await grupoOrden.maestra();
              this._setProperty("/Maestra", aMaestra);
              var aPlanta = aMaestra["PLANTA"];
              var aPlantaFilter = aPlanta.filter(function (o) {
                return oSalaPesaje.oPlanta_codigoSap == o.codigoSap;
              });
              this.getView().setModel(
                new JSONModel(aPlantaFilter),
                "McCentroModel"
              );

              this._setProperty(
                "/oBultoQr/Centroinsumo",
                oSalaPesaje.oPlanta_codigoSap
              );
              BusyIndicator.hide();
              return;
            }

            var aBalanzas = await grupoOrden.obtenerBalanzaList(
              this.oConfig.salaPesajeId
            );

            var aTempBalanza = [];
            aTempBalanza.push({
              balanzaId: -1,
              codigo: "",
              text: "SELECCIONE",
            });
            aBalanzas = aTempBalanza.concat(aBalanzas);
            aBalanzas = this._formatExpandBalanza(aBalanzas);
            var oBalanza = "";
            if (aBalanzas && aBalanzas.length) {
              this._setProperty("/Pesaje_Balanzas", aBalanzas);
              oBalanza = aBalanzas[2] ? aBalanzas[2] : aBalanzas[0];
            }
            
            this._setProperty("/SelectBalanzaKey", "");
          } catch (oError) {
            console.log(oError);
          }
          BusyIndicator.hide();
        },
        actualizarTotal: async function () {
          let tara = this._getProperty("/TaraFrac");
          let peso = parseFloat(this._getProperty("/Pesaje_PesoBalanza"));
          tara = formatter.peso(tara);
          peso = formatter.peso(peso);

          const pendiente = parseFloat(this._getProperty("/PesoFactor"));

          tara = !tara ? 0 : tara;
          peso = !peso ? 0 : peso;

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

          var bGuardarPeso = false;
          if (+peso > 0) {
            var bPesoEstable = this._getProperty("/Peso_Estable");

            bGuardarPeso = bPesoEstable && +tara > 0;
          }

          this._setProperty("/bGuardarPeso", bGuardarPeso);
        },
        _setValueProperty: async function (sValue) {
          debugger;

          if (this.inputSetValue == "MATERIAL") {
            this._setProperty("/oBultoQr/Codigoinsumo", sValue);
          }
          if (this.inputSetValue == "LOTE") {
            this._setProperty("/oBultoQr/Loteinsumo", sValue);
          }

          var sMatnr = this._getProperty("/oBultoQr/Codigoinsumo");
          var sCharg = this._getProperty("/oBultoQr/Loteinsumo");

          var sUnidadM = this._getProperty("/oBultoQr/Altme");

          var oMaterial = await grupoOrden.ValidarMaterialSet({
            Matnr: sMatnr ? sMatnr : "",
            Charg: sCharg ? sCharg : "",
          });

          if (!oMaterial || oMaterial.error || oMaterial.Status == "E") {
            MessageBox.msgError(
              oMaterial.Mensaje
                ? oMaterial.Mensaje
                : "Ocurrió un error al validar el Material."
            );

            this._setProperty("/oBultoQr/DescripInsumo", "");
            this._setProperty("/oBultoQr/Vemeh", "");
            //this._setProperty("/Pesaje_UmBalanza", "");

            if (this.inputSetValue == "MATERIAL") {
              this._setProperty("/oBultoQr/Loteinsumo", "");
            }
          } else {
            var oMaterial = oMaterial[0];

            this._setProperty("/oBultoQr/DescripInsumo", oMaterial.Maktx);
            this._setProperty("/oBultoQr/Vemeh", oMaterial.Meins);
            //this._setProperty("/Pesaje_UmBalanza", oMaterial.Meins);
          }

          if (sMatnr && sCharg) {
            var oCaract = await this._getCaracteristica({
              CodigoInsumo: this._getProperty("/oBultoQr/Loteinsumo"),
              Lote: this._getProperty("/oBultoQr/Loteinsumo"),
              Centro: this._getProperty("/oBultoQr/Centroinsumo"),
            });
            if (oCaract) {
              /*var iFactorConve =
                sUnidadM.toUpperCase() == "MLL"
                  ? parseFloat(+oCaract.AtflvPesPro)
                  : parseFloat(+oCaract.AtflvPesEsp);
              this._setProperty("/FactorConversion", iFactorConve);*/
            } else {
              MessageBox.error(
                "Ocurrió un error al obtener caracteristicas del Insumo."
              );
              oCaract = {};
            }
          }

          var oBultoQr = this._getProperty("/oBultoQr");
          var aUnidades = await grupoOrden.obtenerUnidades();
          var oUnidad = aUnidades.find(
            (e) =>
              e.codigo.toUpperCase() == oBultoQr.Vemeh.toUpperCase()
          );

          if (oUnidad){
            if (oUnidad.codigo != oUnidad.codigoSap) {
              this._setProperty(
                "/UnidadC",
                oUnidad.codigoSap.toLowerCase()
              );
            } else {
              this._setProperty("/UnidadC", oUnidad.codigo.toLowerCase());
            }
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
        },
        _initProperty: function () {
          var CERO = formatter.peso(0);
          this._clearAllFinishPesaje();
          this._setProperty("/Pesaje_Balanza", null);
          this._setProperty("/TaraFrac", CERO);

          this._setProperty("/BultoAtendido", null); //Nuevo Bulto Generado
          this._setProperty("/bImprimirPeso", true);

          this._setProperty("/FactorConversion", CERO);
          this._setProperty("/PesoConversion", CERO);
          this._setProperty("/tieneFactorConversion", false);
          this._setProperty("/Peso_Estable", true);

          this._setProperty("/EsTaraManual", false);
          this._setProperty("/EsPesoManual", false);
          this._setProperty("/EsLecturaManual", false);

          this._setProperty("/UnidadC", "");
          this._setProperty("/Opcion", "");
          
          this._setProperty("/Pesaje_PesoBalanzaNeto", CERO);
          this._setProperty("/Pesaje_PesoBalanza", CERO);
          this._setProperty("/Pesaje_TaraBalanza", CERO);
          this._setProperty("/Pesaje_TotalBalanza", CERO);
          this._setProperty("/PesajeTara_Mensaje", "");
          this._setProperty("/Pesaje_Mensaje", "");
          this._setProperty("/SelectBalanzaKey", -1);

          this.inputSetValue = null;

          this.bBultoSaldoGuardado = false;
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
        onOpenFragment: function (sDialog, sId) {
          var that = this;
          var rootPath = "mif.cp.fraccionamiento";

          var oDialog = this.getView().byId(sId);
          if (!oDialog) {
            Fragment.load({
              id: this.getView().getId(),
              name: rootPath + ".view.fragment." + sDialog,
              controller: this
            }).then(function(oDialog){
              that.getView().addDependent(oDialog);
              oDialog.open();
            })
          }else{
            oDialog.open();
          }
        },
        onCloseFragmentById: function (sFragment, sId) {
          this.getView().byId(sId).close();
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
          debugger;
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
            var sDialogId = "";
            if (action == "CENTRO") {
              sDialog = "MatchCodeCentro";
              sDialogId = "idDialogCentroMC";
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
              sDialogId = "idDialogAlmacenMC";

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
              this.onOpenFragment(sDialog, sDialogId);
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
          if (sText == "0.000") sText = "";
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

          if (newText == "" && this.teclado != "ALFANUM") {
            newText = "0.000";
          }

          var sDecimalLength = formatter.cantidadDecimal(newText);

          if (sDecimalLength < 4){
            this._setProperty("/EnterValue", newText);
          }
          
        },
      }
    );
  }
);
