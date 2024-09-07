sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../controller/BaseController",
    "../model/formatter",
    "../model/models",
    "../model/Util",
    "../service/oDataService",
    "../controls/ExtScanner",
    "sap/ui/core/BusyIndicator",
  ],
  function (
    MessageBox,
    MessageToast,
    Filter,
    FilterOperator,
    JSONModel,
    BaseController,
    formatter,
    models,
    Util,
    oDataService,
    ExtScanner,
    BusyIndicator
  ) {
    "use strict";
    var oMessagePopover;
    var goBusyDialog = new sap.m.BusyDialog();
    var that = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null,
      goAccion = null,
      goDataSrv = oDataService;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.BultoSaldoIFA",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: function () {
          that = this;
          that.aRol = null;
          that.sRol = null;
          that.oLogin = null;
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.oRouter
            .getTarget("BultoSaldoIFA")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

          that._createPopover();
          that.applyInitialFocusTo(that.getView().byId("sfBulto"));
        },
        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},
        applyInitialFocusTo: function (target) {
          const onAfterShow = () => target.focus();
          this._afterShowDelegate = { onAfterShow };
          this.getView().addEventDelegate(this._afterShowDelegate);
        },
        /**-----------------------------------------------*/
        /*              E V E N T S
          /**-----------------------------------------------*/

        _handleRouteMatched: function (oEvent) {
          BaseController.prototype.init.apply(this, arguments);

          var that = this;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });

          try {
            goAccion = that._getAcctions("VIFA");
            if (!goAccion) {
              that._navTo("Inicio", null);
              return;
            }
            that.oLogin = that._getDataLogin();
            // that._getConstant(that, goModel);
            that.reestablecerPagina(that);
          } catch (oError) {
            that._navTo("Inicio", null);
            return;
          }
        },
        onQRScan: function (oEvent, sType) {
          //http://www.barcode-generator.org/
          var that = this;

          try {
            try {
              if (!cordova.plugins.barcodeScanner) {
                return MessageToast.show(that._getI18nText("W000010"));
              }
            } catch (oError) {
              this.typeScanner = sType;
              this._openScanQR();
              return MessageToast.show(that._getI18nText("W000010"));
            }

            var oOptions = this._optionsBarCode();

            //window.parent.cordova.plugins.barcodeScanner.scan
            //window.cordova.plugins.barcodeScanner.scan
            cordova.plugins.barcodeScanner.scan(
              function (oQRscan) {
                if (["QR_CODE"].includes(oQRscan.format)) {
                  var oStandardModel = that.getView().getModel("StandardModel");
                  if (sType == "IFA") {
                    oStandardModel.setProperty("/oQR/oEtiqueta", oQRscan);
                  } else {
                    oStandardModel.setProperty("/oQR/oSaldo", oQRscan);
                  }

                  that._searchEtiqueta(sType);
                }
              },
              this._onScanError,
              oOptions
            );
          } catch (oError) {}
        },
        handleMessagePopoverPress: function (oEvent) {
          var that = this;
          var MsgPopoverList = that.getModel("MsgPopoverList");
          var aMockMessages = MsgPopoverList.getData();
          if (!oMessagePopover) {
            that._createPopover();
          }
          if (aMockMessages.length) {
            oMessagePopover.toggle(oEvent.getSource());
          }
        },
        _createPopover() {
          that.getView().setModel(new JSONModel([]), "MsgPopoverList");
          var oMessageTemplate = new sap.m.MessageItem({
            type: "{MsgPopoverList>type}",
            title: "{MsgPopoverList>title}",
            activeTitle: "{MsgPopoverList>active}",
            description: "{MsgPopoverList>description}",
            subtitle: "{MsgPopoverList>subtitle}",
            counter: "{MsgPopoverList>counter}",
            markupDescription: true,
          });

          oMessagePopover = new sap.m.MessagePopover({
            items: {
              path: "MsgPopoverList>/",
              template: oMessageTemplate,
            },
            activeTitlePress: function () {
              MessageToast.show("Active title is pressed");
            },
          });

          oMessagePopover.setAsyncURLHandler(function (config) {
            var allowed = config.url.lastIndexOf("http", 0) < 0;

            config.promise.resolve({
              allowed: allowed,
              id: config.id,
            });
          });

          oMessagePopover.setAsyncDescriptionHandler(function (config) {
            config.promise.resolve({
              allowed: true,
              id: config.id,
            });
          });

          oMessagePopover.attachLongtextLoaded(function () {
            MessageToast.show("Description validation has been performed.");
          });

          oMessagePopover.attachUrlValidated(function () {
            MessageToast.show("URL validation has been performed.");
          });
          that.byId("messagePopoverBtn").addDependent(oMessagePopover);
        },
        addListPopover: function (oMockMessages) {
          var that = this;
          var MsgPopoverList = that.getModel("MsgPopoverList");
          var aMockMessages = MsgPopoverList.getData();

          if (oMockMessages) {
            if (!aMockMessages) aMockMessages = [];

            var oTemplate = {
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "",
              active: false,
              description: "<p></p>",
              subtitle: "",
            };

            oMockMessages = { ...oTemplate, ...oMockMessages };
            aMockMessages.splice(0, 0, oMockMessages);
          }

          MsgPopoverList.setData(aMockMessages);
          MsgPopoverList.refresh(true);
        },
        ordenarLista: function () {
          var that = this,
            oModelLista = that.getView().getModel("MsgPopoverList");
          try {
            if (oModelLista && oModelLista.getData().length > 0) {
              var aLista = oModelLista.getData();
              aLista.reverse();
              oModelLista.updateBindings();
            }
          } catch (error) {
            console.log(error);
          }
        },
        getHanaModel: function () {
          var that = this,
            oModel = goModel,
            oView = that.getView();
          if (!oModel) {
            oModel = oView.getModel();
          }
          return oModel;
        },
        getERPModel: function () {
          var that = this,
            oModelERP = goModelSapErp,
            oView = that.getView();
          if (!oModelERP) {
            oModelERP = oView.getModel("sapErp");
          }
          return oModelERP;
        },

        onCancel: function (oEvent) {
          var that = this;
          sap.ui.core.BusyIndicator.show(0);
          MessageBox.confirm(that._getI18nText("I000010"), {
            title: "Cancelar",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                sap.ui.core.BusyIndicator.hide();
                that._initModels(that);
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },
        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
          /**-----------------------------------------------*/
        reestablecerPagina: function (that) {
          that.setModel(new JSONModel([]), "MsgPopoverList");
          that
            .getView()
            .setModel(new JSONModel([]), "MaterialEmbalajeListModel");
          that.iniciarModelo(that);
          that.listaMaterialEmbalaje();
        },
        iniciarModelo: function (that) {
          that.getView().setModel(
            new JSONModel({
              oOrden: {},
              oInsumo: {},
              oBulto: {},
              oPeso: {},
              oFraccion: { esFraccion: false },
              oAction: that._showButtons(
                false /*edit*/,
                false /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
              ),
            }),
            "FormVerificationModel"
          );
          that.getView().setModel(new JSONModel({}), "OrdenBultoDetModel");
          that.getView().setModel(new JSONModel([]), "BultoListModel");
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that
            .getView()
            .getModel("StandardModel")
            .setProperty("/oQR", {
              oSaldo: {
                text: "", //9600000685$1000010118$MP00020801
                edit: false,
              },
              oEtiqueta: {
                text: "", //"$1000010235$8000000002$I00000058",
              },
            });
          that.getView().getModel("StandardModel").setProperty("/oControl", {
            scanBulto: true,
            secBulto: true,
            secPesaje: true,
            realizado: true,
            detalle: true,
            guardar: true,
            visibleMatEmb: true,
          });
          that.getView().getModel("StandardModel").setProperty("/oAgotar", {
            icon: "sap-icon://border",
            color: "#6a6d70",
          });
        },
        _initModels: function (that) {
          that.getView().setModel(
            new JSONModel({
              oOrden: {},
              oInsumo: {},
              oBulto: {},
              oPeso: {},
              oFraccion: { esFraccion: false },
              oAction: that._showButtons(
                false /*edit*/,
                false /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
              ),
            }),
            "FormVerificationModel"
          );
          that.getView().setModel(new JSONModel({}), "OrdenBultoDetModel");
          that.getView().setModel(new JSONModel([]), "BultoListModel");
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that
            .getView()
            .getModel("StandardModel")
            .setProperty("/oQR", {
              oSaldo: {
                text: "", //9600000685$1000010118$MP00020801
                edit: false,
                // text: ""//"9600000351$1000010116$MP00023279",
              },
              oEtiqueta: {
                text: "", //"I00000048",
                // text: ""//"$1000000417$0000000229$I00000048",
              },
            });
          that.getView().getModel("StandardModel").setProperty("/oControl", {
            scanBulto: true,
            secBulto: true,
            secPesaje: true,
            realizado: true,
            detalle: true,
            guardar: true,
          });
          that.getView().getModel("StandardModel").setProperty("/oAgotar", {
            icon: "sap-icon://border",
            color: "#6a6d70",
          });
          that.ordenarLista();
        },
        _showButtons: function (edit, save, confirm, saveAndConfirm, reset) {
          var oAction = goAccion;
          var oButton = {
            edit: edit,
            save: save,
            confirm: confirm,
            saveAndConfirm: saveAndConfirm,
            reset: reset,
          };
          /*
                  VALIDAR ACCIONES PERMITIDOS
                  Boton reset: sólo debe estar activo para roles de
                  supervisor de producción y jefe de producción el cual anulará el peso guardado o confirmado
                  Boton save, confirm, saveAndConfirm : Jefe producción, Supervisor producción, Auxiliar de Producción
                  */

          if (!oAction.ifaFullControl) {
            oButton.save = oAction.ifaSave ? oButton.save : false;
            oButton.confirm = oAction.ifaConfirm ? oButton.confirm : false;
            oButton.saveAndConfirm = oAction.ifaConfirm
              ? oButton.saveAndConfirm
              : false;
            oButton.reset = oAction.ifaReset ? oButton.reset : false;
          }

          return oButton;
        },

        /**
         * Inicio:  LECTURA BULTO SALDO
         */
        //LEER BULTO SALDO
        onQRSearch(oEvent, sType) {
          var that = this;
          var sCode = oEvent ? oEvent.getParameter("query") : null;
          // debugger
          if (sCode) that._searchEtiqueta(sType);
        },
        _searchEtiqueta: function (sType) {
          var that = this;
          var oView = that.getView();
          var sText = "";
          var aText = [];

          var oQR = oView.getModel("StandardModel").getProperty("/oQR");
          sText = oQR.oSaldo.text;
          that._getBultoSaldo(sText);
        },
        _getBultoSaldo: function (sCode) {
          var that = this;
          that.oSaldo = null;
          var oView = that.getView();
          var oModel = that.getHanaModel();
          var oModelERP = that.getERPModel();
          var aFilter = [],
            oUrlParameters = {},
            EQ = FilterOperator.EQ;
          var oBultoScan = that._getFormatQr(sCode);
          if (oBultoScan) {
            that._initModels(that);
            that.setModel(new JSONModel([]), "MsgPopoverList");
            if (oBultoScan.Etiqueta) {
              aFilter.push(new Filter("Etiqueta", EQ, oBultoScan.Etiqueta));
            } else {
              aFilter.push(new Filter("IdBulto", EQ, oBultoScan.IdBulto));
              aFilter.push(
                new Filter("CodigoInsumo", EQ, oBultoScan.CodigoInsumo)
              );
              aFilter.push(new Filter("Lote", EQ, oBultoScan.Lote));
            }
            aFilter.push(new Filter("Tipo", EQ, "SALDO"));

            //   aFilter.push(new Filter("Tipo", EQ, "IFA"));
            //OBTENER DATOS DE LA ETIQUETA
            BusyIndicator.show(0);
            that
              ._getODataDinamic(
                //fnGetErpDinamic
                oModelERP,
                "AtendidoItemSet",
                oUrlParameters,
                aFilter
              )
              .then((aResp) => {
                //
                var oStandardModel = that.getModel("StandardModel");
                var oQR = oStandardModel.getProperty("/oQR");
                var oFormVerificationModel = that.getModel(
                  "FormVerificationModel"
                );
                var oFormData = oFormVerificationModel.getData();

                if (aResp && aResp.length) {
                  // var aListaBulto = aResp.filter(function(oValue){
                  //   return oValue.pedido = oFormData.oInsumo.numPedido;
                  // });
                  // var aListaBulto = $.grep(aResp, function(oValue){
                  //   return oValue.Pedido == oFormData.oInsumo.numPedido
                  // });
                  var oBulto = null;
                  for (var key in aResp) {
                    oBulto = aResp[key];
                    break;
                  }

                  if (oBulto) {
                    var oInsumo = that.oInsumo;
                    //var Pedido = oBulto.Pedido;
                    //var Orden = oBulto.Orden;
                    var CodigoInsumo = oBulto.CodigoInsumo;
                    var Lote = oBulto.Lote;
                    // var IdPos = oBulto.IdPos ? parseInt(oBulto.IdPos) : 1;

                    var oBultoHu = {
                      Hu: oBulto.IdBulto,
                      CodigoInsumo: oBulto.CodigoInsumo,
                      LoteInsumo: oBulto.Lote,
                      CentroInsumo: oBulto.Centro,
                    };

                    that.ValidarHuSet(oBultoHu, oBulto);
                    // return;
                  } else {
                    MessageBox.error("HU no corresponde a la Orden / Pedido.");
                    sap.ui.core.BusyIndicator.hide();
                  }
                } else {
                  that.addListPopover({
                    type: "Warning", // ["Error", "Warning", "Success", "Information"]
                    title: "Sin registros",
                    description: "<p>" + that._getI18nText("EIFAB008") + "</p>",
                    subtitle: "",
                  });
                  MessageBox.warning(that._getI18nText("EIFAB008"));
                }
                oStandardModel.refresh();
              })
              .catch((oError) => {
                console.log(oError);
                that.addListPopover({
                  type: "Warning", // ["Error", "Warning", "Success", "Information"]
                  title: "Error en el Servicio",
                  description: "<p>" + that._getI18nText("EIFAB008") + "</p>",
                  subtitle: "",
                });
                // MessageBox.error(that._getI18nText("EIFAB008"));
                MessageBox.error("El bulto " + "" + " no es de tipo SALDO"); //oBultoScan.IdBulto
              });
          } else {
            MessageBox.error("La etiqueta leída no es valida");
          }
        },
        ValidarHuSet: async function (oParam, oBulto) {
          //ValidarHuSet?$filter=Hu eq '' and CodigoInsumo eq '1000010124' and LoteInsumo eq 'MP00022653' and CentroInsumo eq '1021'
          var aFilter = [];
          var that = this,
            oView = that.getView();
          var oModelERP = goModelSapErp;
          if (!oModelERP) {
            oModelERP = oView.getModel("sapErp");
          }
          var oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          // oFormData.oInsumo = // { numPedido: "70000171"};

          if (oParam.Hu) aFilter.push(new Filter("Hu", "EQ", oParam.Hu));

          if (oParam.CodigoInsumo)
            aFilter.push(new Filter("Codigoinsumo", "EQ", oParam.CodigoInsumo));

          if (oParam.LoteInsumo)
            aFilter.push(new Filter("Loteinsumo", "EQ", oParam.LoteInsumo));

          if (oParam.CentroInsumo)
            aFilter.push(new Filter("Centroinsumo", "EQ", oParam.CentroInsumo));

          that
            ._getODataDinamic(
              //fnGetErpDinamic
              oModelERP,
              "ValidarHuSet",
              null,
              aFilter,
              null
            )
            .then((oBultoHuResp) => {
              if (oBultoHuResp && oBultoHuResp.length) {
                var oBultoHu = oBultoHuResp[0];
                if (["E"].includes(oBultoHu.Type)) {
                  // this._setProperty("/Pesaje_Bulto", "");
                  MessageBox.error(oBultoHu.Messagebapi);
                  // throw oBultoHu.Messagebapi;
                } else {
                  var oParam = {
                    CodigoInsumo: oBulto.CodigoInsumo,
                    Lote: oBulto.Lote,
                    Centro: oBulto.Centro,
                  };
                  oBultoHu.CantidadHU = oBultoHu.Vemng;
                  that._getCaracteristica(oParam, oBulto, oBultoHu);
                }
              } else {
                MessageBox.error("Ocurrió un error al validar la HU.");
              }
            })
            .catch((oError) => {
              console.log(oError);
              that.addListPopover({
                type: "Warning", // ["Error", "Warning", "Success", "Information"]
                title: "Error en el Servicio",
                description: "<p>" + that._getI18nText("EIFAB009") + "</p>",
                subtitle: "",
              });
              MessageBox.error(that._getI18nText("EIFAB009"));
            });
        },
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
        _getCaracteristica: async function (oParam, oBulto, oBultoHu) {
          var aFilter = [];
          var that = this,
            oView = that.getView();
          var oModelERP = goModelSapErp;
          if (!oModelERP) {
            oModelERP = oView.getModel("sapErp");
          }

          if (oParam.CodigoInsumo)
            aFilter.push(new Filter("CodigoInsumo", "EQ", oParam.CodigoInsumo));
          if (oParam.Lote)
            aFilter.push(new Filter("LoteInsumo", "EQ", oParam.Lote));

          if (oParam.Centro)
            aFilter.push(new Filter("Centro", "EQ", oParam.Centro));

          that
            ._getODataDinamic(
              //fnGetErpDinamic
              oModelERP,
              "ValoresPropCaracteristicasSet",
              null,
              aFilter,
              null
            )
            .then((oCaractResp) => {
              if (oCaractResp && oCaractResp.length) {
                var oCaract = oCaractResp[0];
                oCaract.AtflvPesPro = parseFloat(
                  oCaract.AtflvPesPro.replace(/\s/g, "").replace(",", ".")
                ).toFixed(5);
                oCaract.AtflvPesEsp = parseFloat(
                  oCaract.AtflvPesEsp.replace(/\s/g, "").replace(",", ".")
                ).toFixed(5);
              } else {
                MessageBox.msgError(
                  "Ocurrió un error al obtener información del Insumo."
                );
                BusyIndicator.hide();
                return;
              }
              var oFormVerificationModel = that.getModel(
                  "FormVerificationModel"
                ),
                oFormData = oFormVerificationModel.getData();
              if (oCaract) {
                oFormVerificationModel.setProperty(
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
                BusyIndicator.hide();
                return;
              }

              // oCaract.Fecaduc = '2022-09-10'

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
              const dFechaCaduc = that.fechaToDate(oCaract.Fecaduc, "-");

              let bFechaCaducRango = that.checkDateBT(
                dFechaDesde,
                dFechaHasta,
                dFechaCaduc
              );
              //bFechaCaducRango = true;
              if (!bFechaCaducRango) {
                if (dFechaCaduc.getTime() == dFechaDesde.getTime()) {
                  MessageBox.warning(that._getI18nText("mensajeFechaCaduc"));
                } else if (dFechaCaduc <= dFechaHasta) {
                  MessageBox.error(
                    that._getI18nText("mensajeFechaCaducFueraRango")
                  );
                  BusyIndicator.hide();
                  return;
                }
              } else {
                MessageBox.warning(that._getI18nText("mensajeFechaCaduc"));
              }
              // var oBultoEscaneado = this._buildBulto(oBulto, oBultoHu, oCaract);
              try {
                var oFormData = {
                  oInsumo: {
                    codigo: oBulto.CodigoInsumo,
                    lote: oBulto.Lote,
                    descripcion: oBulto.DescripInsumo,
                    fechaVenc: oCaract.Fecaduc,
                    cantidadHU: oBultoHu.Vemng,
                    umb: oBulto.UnidadM,
                    matEmbalaje: oBultoHu.Vhilm,
                    centro: oBulto.Centro,
                  },
                  oBulto: {
                    neto: oBultoHu.Vemng,
                    idBulto: oBulto.IdBulto,
                    etiqueta: oBulto.Etiqueta,
                    mblnr: oBulto.Mblnr,
                    mjahr: oBulto.Mjahr,
                    Status: oBulto.Status,
                    Tipo: oBulto.Tipo,
                    Tara: oBultoHu.Tarag,
                  },
                  oPeso: {
                    cantPesar: oBultoHu.Vemng,
                    neto: that._weight(oBultoHu.Vemng), //Cant Real = Cant Sugerida
                    tara: that._weight(oBultoHu.Tarag),
                    bruto: that._weight(+oBultoHu.Vemng + +oBultoHu.Tarag),
                    umb: oBulto.UnidadM,
                  },
                  oOrden: {
                    Aufnr: oBulto.Orden,
                  },
                  Umed: oBulto.UnidadM,
                  Fraccion: Number.parseInt(oBulto.Fraccion),
                  Subfraccion: Number.parseInt(oBulto.Subfraccion),
                  Status: oBulto.Status,
                  Tipo: oBulto.Tipo,
                  oUsuario: {
                    verificado: that.oLogin["oUsuario"].usuario,
                  },
                };
                // oBulto.Tipo = "ENTERO";
                if (oBulto.Tipo == "ENTERO") {
                  MessageBox.error("No se puede leer bultos de tipo entero.");
                } else {
                  // oFormVerificationModel.setProperty("/oBultoQr", oBultoNuevo);
                  // oFormVerificationModel.updateBindings();
                  that.getModel("FormVerificationModel").setData(oFormData);
                  that.getModel("FormVerificationModel").refresh(true);
                  that.limpiarBusquedaEscaner(); //Bulto
                  if (
                    that
                      .getView()
                      .getModel("MaterialEmbalajeListModel")
                      .getData().length == 0
                  ) {
                    that.listaMaterialEmbalaje();
                  }
                }
              } catch (error) {
                console.log(error);
                MessageBox.msgError(that._getI18nText("EIFAB010"));
              } finally {
                BusyIndicator.hide();
              }
            })
            .catch((oError) => {
              BusyIndicator.hide();
              console.log(oError);
              MessageBox.msgError(that._getI18nText("EIFAB010"));
            });
        },
        limpiarBusquedaEscaner: function () {
          var that = this,
            oStandardModel = that.getModel("StandardModel");
          oStandardModel.setProperty("/oQR/oEtiqueta/text", "");
          oStandardModel.updateBindings();
        },
        _buildBulto: function (oBultoScan, oBultoValid, oCaract) {
          return { ...oBultoValid, ...oCaract, ...oBultoScan };
        },
        listaMaterialEmbalaje: async function (oParam) {
          var that = this,
            oModel = that.getHanaModel(),
            oModelERP = that.getERPModel(),
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();

          that
            ._getODataDinamic(oModel, "CONSTANTES_MAT_EM", null, [], null)
            .then((oResp) => {
              var aMaterialEmbalaje = [];
              if (oResp && oResp.length) {
                aMaterialEmbalaje = oResp;
              } else {
                MessageBox.error(
                  "No hay registros para la lista de materiales de embalaje, actualice la página."
                );
              }
              this.getView().setModel(
                new JSONModel(aMaterialEmbalaje),
                "MaterialEmbalajeListModel"
              );
              console.log("* MaterialEmbalaje * " + aMaterialEmbalaje.length);
            })
            .catch((oError) => {
              console.log(oError);
              // that.addListPopover({
              //   type: "Error", // ["Error", "Warning", "Success", "Information"]
              //   title: "Servicio Embalaje",
              //   description: "<p>" + that._getI18nText("EIFAE008") + "</p>",
              //   subtitle: "",
              // });
              // MessageBox.error(that._getI18nText("EIFAE008"));
            });
        },
        //Creacion de un ID temporal
        patronS4: function () {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        },
        generarUUID: function () {
          return (
            this.patronS4() +
            "-" +
            this.patronS4() +
            "-" +
            this.patronS4() +
            "-" +
            this.patronS4() +
            "-" +
            this.patronS4()
          );
        },
        doMessageboxActionCustom: function (
          sMessage,
          aOptionsBtn,
          contentWidth
        ) {
          return new Promise(function (resolve, reject) {
            MessageBox.warning(sMessage, {
              icon: MessageBox.Icon.INFORMATION,
              title: "Confirmar",
              actions: aOptionsBtn,
              emphasizedAction: aOptionsBtn[0],
              contentWidth: !contentWidth ? "60%" : contentWidth,
              styleClass: "",
              onClose: function (oAction) {
                resolve(oAction);
              },
            });
          });
        },
        fechaToDate: function (sFecha, sSeparador) {
          if (sFecha) {
            var aFecha = sFecha.split(sSeparador);
            return new Date(aFecha[0], aFecha[1] - 1, aFecha[2]);
          }
          return "";
        },
        checkDateBT: function (dateFrom, dateTo, dateCheck) {
          var from = new Date(dateFrom);
          var to = new Date(dateTo);
          var check = new Date(dateCheck);

          //Valida si la fecha actual esta en el rango de vigencia del usuario
          if (check > from && check < to) {
            return true;
          } else {
            return false;
          }
        },
        _actualizaCantidadBulto: function (oDataIFA) {
          var that = this,
            alista = oDataIFA.oBultoEscaneadoLista,
            cantBultos = alista.length == 0 ? "" : alista.length,
            cantTotal = alista.length == 0 ? "" : 0,
            unidadM,
            saldoAPesar = +oDataIFA.oPeso["neto"];

          for (let i = 0; i < alista.length; i++) {
            cantTotal = +cantTotal + +alista[i].CantidadHU;

            if (saldoAPesar > 0 && saldoAPesar > +alista[i].CantidadHU) {
              saldoAPesar = saldoAPesar - +alista[i].CantidadHU;
              alista[i].Consumido = +alista[i].CantidadHU;
            } else if (saldoAPesar > 0 && saldoAPesar < +alista[i].CantidadHU) {
              alista[i].Consumido = saldoAPesar; //alista[i].CantidadA -
              saldoAPesar = 0;
            } else if (saldoAPesar == 0) {
              alista[i].Consumido = 0;
            }

            if (i == alista.length - 1) {
              unidadM = alista[i].UnidadM;
            }
          }
          oDataIFA.oBultoEscaneadoLista = alista;
          oDataIFA.oBultoEscaneado = Object.assign(oDataIFA.oBultoEscaneado, {
            cantBultos: cantBultos,
            cantTotal: cantTotal,
            umb: unidadM,
          });
        },

        _cambiarPesoBruto: function (oEvent) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            iBruto = Number(oEvent.getSource().getValue().replace(/,/g, ""));
          if (isNaN(iBruto)) {
            oFormData.oPeso.bruto = 0;
          } else {
            oFormData.oPeso.bruto = iBruto;
          }
          // oFormData.oPeso.neto = Number(oEvent.getSource().getValue().replaceAll(",", ""));
          that.getView().byId("btnGuardar").setBusyIndicatorDelay(0);
          that.getView().byId("btnGuardar").setBusy(true);
          try {
            that._actializaPesoBruto();
          } catch (error) {
            console.log(error);
          } finally {
            that.getView().byId("btnGuardar").setBusy(false);
          }
        },
        _cambiarTara: function (oEvent) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            itara = Number(oEvent.getSource().getValue().replace(/,/g, ""));
          // oFormData.oPeso.tara = Number(oEvent.getSource().getValue().replaceAll(",", ""));
          if (isNaN(itara)) {
            oFormData.oPeso.tara = 0;
          } else {
            oFormData.oPeso.tara = itara;
          }
          that.getView().byId("btnGuardar").setBusyIndicatorDelay(0);
          that.getView().byId("btnGuardar").setBusy(true);
          try {
            that._actializaPesoBruto();
          } catch (error) {
            console.log(error);
          } finally {
            that.getView().byId("btnGuardar").setBusy(false);
          }
        },
        _actializaPesoBruto: function (callback) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            neto,
            tara,
            bruto;
          if (
            Number(oFormData.oPeso["neto"]) == 0 ||
            !Number(oFormData.oPeso["neto"])
          ) {
            oFormData.oPeso["neto"] = 0;
          }
          if (
            Number(oFormData.oPeso["tara"]) == 0 ||
            !Number(oFormData.oPeso["tara"])
          ) {
            oFormData.oPeso["tara"] = 0;
          }
          if (
            Number(oFormData.oPeso["bruto"]) == 0 ||
            !Number(oFormData.oPeso["bruto"])
          ) {
            oFormData.oPeso["bruto"] = 0;
          }
          neto =
            that._decimalCount(oFormData.oPeso["neto"]) > 3
              ? that._weight(oFormData.oPeso["neto"])
              : oFormData.oPeso["neto"];
          tara =
            that._decimalCount(oFormData.oPeso["tara"]) > 3
              ? that._weight(oFormData.oPeso["tara"])
              : oFormData.oPeso["tara"];
          bruto =
            that._decimalCount(oFormData.oPeso["bruto"]) > 3
              ? that._weight(oFormData.oPeso["bruto"])
              : oFormData.oPeso["bruto"];

          // if (+neto > +cantPesar) {
          //   oFormData.oAjuste.ajuste = true;
          // }
          var nuevoPesoNeto = +bruto - +tara;

          if (nuevoPesoNeto < 0) {
            nuevoPesoNeto = 0;
          }
          oFormData.oPeso = Object.assign(oFormData.oPeso, {
            //Objeto para pesaje componente
            neto: that._weight(nuevoPesoNeto), //Cant Real = Cant Sugerida
            tara: that._weight(tara),
            bruto: that._weight(bruto),
          });

          oFormVerificationModel.updateBindings();
        },

        onGuardar: function () {
          var that = this;
          if (!that.validarPrevioGuardar()) {
            return;
          }
          MessageBox.confirm("Proceder a actualizar el bulto saldo.", {
            icon: MessageBox.Icon.SUCCESS,
            onClose: function (sAction) {
              if (sAction == "OK") {
                that._createPopover();
                that._confirmarGuardar();
              }
            },
          });
        },
        validarPrevioGuardar: function () {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          //Validar el peso neto y tara mayor a cero
          if (
            Object.keys(oFormData.oOrden).length == 0 ||
            Object.keys(oFormData.oInsumo).length == 0
          ) {
            MessageBox.error("Debe leer una etiqueta de Bulto Saldo.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Error etiqueta Bulto",
              description:
                "<p>" + "Debe leer una etiqueta de Bulto Saldo." + "</p>",
              subtitle: "",
            });
            return false;
          } else if (+oFormData.oPeso.bruto <= 0) {
            MessageBox.error("El peso [bruto] debe de ser mayor a cero.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Peso en cero",
              description:
                "<p>" + "El peso [bruto] debe de ser mayor a cero." + "</p>",
              subtitle: "",
            });
            return false;
          } else if (+oFormData.oPeso.tara <= 0) {
            MessageBox.error("El peso de la [tara] debe de ser mayor a cero.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Peso en cero",
              description:
                "<p>" +
                "El peso de la [tara] debe de ser mayor a cero." +
                "</p>",
              subtitle: "",
            });
            return false;
          } else if (+oFormData.oPeso.neto <= 0) {
            MessageBox.error("El peso de la [neto] debe de ser mayor a cero.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Peso en cero",
              description:
                "<p>" +
                "El peso de la [neto] debe de ser mayor a cero." +
                "</p>",
              subtitle: "",
            });
            return false;
          }
          else if (oFormData.oInsumo.matEmbalaje == "") {
            MessageBox.error(
              "Debe seleccionar un valor en el campo [Mat. Embalaje]."
            );
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Error etiqueta bulto",
              description:
                "<p>" +
                "Debe seleccionar un valor en el campo [Mat. Embalaje]." +
                "</p>",
              subtitle: "",
            });
            return false;
          } else {
            return true;
          }
        },
        _confirmarGuardar: async function () {
          /**
           * Actualiza el material de embalaje con el peso de la tara,
           * actualiza el saldo de la HU embalada en CP02 y
           * el saldo ajustado se mueve al almacén CP03 de diferencia
           *
           */
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            oBulto = oFormData.oBulto,
            oInsumo = oFormData.oInsumo,
            oPeso = oFormData.oPeso;
          //ActBultSalMisHuHeadIfaSet

          that.setModel(new JSONModel([]), "MsgPopoverList");
          var oModelERP = that.getERPModel();
          try {
            var oData = {
              Object: "BTP",
              ActBultSalMisHuIfaSet: [
                {
                  Object: "BTP",
                  Exidv: oBulto.idBulto,
                  Matnr: oInsumo.codigo,
                  Charg: oInsumo.lote,
                  Werks: oInsumo.centro,
                  Vhilm: oInsumo.matEmbalaje, //Nuevo Material Embalaje si se cambia

                  CantPesada: that._weight(+oPeso.neto), //Cantidad Neta
                  PesoNeto: that._weight(+oPeso.neto), //Cantidad Neta
                  PesoTara: that._weight(+oPeso.tara), //Peso Tara
                  PesoBruto: that._weight(+oPeso.neto + +oPeso.tara),
                  Umed: oPeso.umb,
                },
              ],
            };
          } catch (error) {
            BusyIndicator.hide();
            console.log(error);
            return;
          }
          that
            .oDataCreateDinamic(oModelERP, "ActBultSalMisHuHeadIfaSet", oData)
            .then((oResp) => {
              if (oResp) {
                if (oResp.ActBultSalMisHuIfaSet.results.length > 0) {
                  //validar errores
                  var bType = true;
                  var aMesageSuccess = [];
                  var sMensaje = "";
                  oResp.ActBultSalMisHuIfaSet.results.forEach((oRes) => {
                    if (["E"].includes(oRes.TypeBapi)) {
                      bType = false;
                      sMensaje = oRes.Message;
                    }
                    if (["S"].includes(oRes.TypeBapi)) {
                      aMesageSuccess.push(oRes.Message);
                    }
                    var sError =
                      oRes.TypeBapi == "E"
                        ? "Error"
                        : oRes.TypeBapi == "W"
                        ? "Warning"
                        : oRes.TypeBapi == "S"
                        ? "Success"
                        : "Information"; // ["Error", "Warning", "Success", "Information"]

                    that.addListPopover({
                      type: sError, // ["Error", "Warning", "Success", "Information"]
                      title: oRes.Message,
                      description: "<p>" + oRes.Message + "</p>",
                      subtitle: "",
                    });
                  });
                  if (bType && aMesageSuccess.length > 0) {
                    console.log("* Enviando a cola de impresión....*");
                    // realizar impresion
                    BusyIndicator.show(0);
                    that._sendPrint(
                      {
                        idBulto: oFormData.oBulto.idBulto,
                      },
                      true
                    );
                  } else {
                    BusyIndicator.hide();
                    // that._initModels(that);
                    if (sMensaje.length > 0) {
                      MessageBox.error(sMensaje);
                    } else {
                      MessageBox.error(
                        "Existen errores en la operación, volver a realizar el proceso de lectura."
                      );
                    }
                  }
                } else {
                  BusyIndicator.hide();
                  // that._initModels(that);
                  MessageBox.error(
                    "Existen errores en la operación, volver a realizar el proceso."
                  );
                }
              } else {
                BusyIndicator.hide();
                that._initModels(that);
                MessageBox.error(
                  "Error al actualizar la los datos de la etiqueta."
                );
                that.addListPopover({
                  type: "Error", // ["Error", "Warning", "Success", "Information"]
                  title: "Error en la Etiqueta",
                  description:
                    "<p>" +
                    "No se puede actualizar los datos de la etiqueta." +
                    "</p>",
                  subtitle: "",
                });
              }
            })
            .catch((oError) => {
              BusyIndicator.hide();
              console.log(oError);
              MessageBox.error(
                "Error al ejecutar el servicio de zctualizar etiqueta, volver a ejecutar la operacion."
              );
            });
        },
        testPrint: function () {
          
          this._sendPrint({
            idBulto: "1000084979", //"9700000883"
          });
        },
        validarImpresora: function () {
          try {
            var oImpresora = JSON.parse(
              window.localStorage.getItem("configLocal")
            );
            if (
              oImpresora &&
              oImpresora.oGeneral &&
              oImpresora.oGeneral.impresora
            ) {
              return true;
            } else {
              return false;
            }
          } catch (error) {
            MessageBox.error("Seleccione una impresora para continuar");
            return false;
          }
        },
        onPrint: async function () {
          var that = this,
            aFilter = [],
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          var oModel = that.getHanaModel();
          var oModelERP = that.getERPModel();

          if (!that.validarImpresora()) {
            MessageBox.error("Seleccione una impresora para continuar");
            return;
          }
          if (oFormData.Tipo == "SALDO" && oFormData.oBulto.idBulto != "") {
            MessageBox.confirm(
              "Proceder a imprimir la etiqueta de bulto saldo.",
              {
                icon: MessageBox.Icon.SUCCESS,
                onClose: function (sAction) {
                  if (sAction == "OK") {
                    that._sendPrint({ idBulto: oFormData.oBulto.idBulto });
                  }
                },
              }
            );

            // aFilter.push(new Filter("Etiqueta", "EQ", oFormData.oEtiqueta.Etiqueta));
            // aFilter.push(new Filter("Tipo", "EQ", "IFA"));
            // BusyIndicator.show(0);
            // that._getODataDinamic(
            //     goModelSapErp,
            //     "AtendidoItemSet",
            //     null,
            //     aFilter,
            //     null
            //   )
            //   .then((oResp) => {
            //     if (oResp && oResp.length) {
            //       for (var key in oResp) {
            //         var oEtiquetaIFA = oResp[key];
            //       }
            //       if(oEtiquetaIFA.IdBulto !=""){
            //         that._sendPrint({
            //             aBultos: [oEtiquetaIFA],
            //             oInsumo: null,
            //           });
            //       }else{
            //         MessageBox.error("No se puede realizar la impresión por que la etiqueta no registra datos de pesaje.");
            //       }
            //     } else {
            //       MessageBox.error("Error al obtener los datos de la etiqueta seleccionada.");
            //     }
            //   })
            //   .catch((oError) => {
            //     console.log(oError);
            //     that.addListPopover({
            //       type: "Warning", // ["Error", "Warning", "Success", "Information"]
            //       title: "Error en el Servicio",
            //       description: "<p>" + that._getI18nText("EIFAI001") + "</p>",
            //       subtitle: "",
            //     });
            //     MessageBox.error(that._getI18nText("EIFAI001"));
            //   });
          } else {
            MessageBox.error("Debe leer una etiqueta de Bulto Saldo.");
          }
        },
        _sendPrint: function (oData, bBulto) {
          var aEtiquetas = [],
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          var oModel = that.getHanaModel();
          var oModelERP = that.getERPModel();

          sap.ui.core.BusyIndicator.show(0);
          var oPrint = JSON.parse(window.localStorage.getItem("configLocal"));
          that
            ._getODataDinamic(
              oModel,
              "fnSendPrintBulto",
              {
                impresoraId: oPrint.oGeneral.impresora,
                etiqueta: oData.idBulto,
                usuario: oFormData.oUsuario.verificado, //"EGARCITI"
                bSaldo: "IFA",
                tipo: "", //Omitir // Tipo de impresion [AM: Almacen Materiales, CP: Central Pesada]
                idBulto: "", //oData.aBultos[0].IdBulto //"", //Enviar Bulto HU
              },
              null
            )
            .then((oResp) => {
              that.addListPopover({
                type: "Success", // ["Error", "Warning", "Success", "Information"]
                title: "Se realizó envío a la cola de impresión",
                description:
                  "<p>" +
                  "La etiqueta de bulto saldo fue enviada a la cola de impresión." +
                  "</p>",
                subtitle: "",
              });
              if (bBulto) {
                MessageBox.success(
                  "Proceso finalizado. Revisar el historial.",
                  {
                    title: "Operación Finalizada",
                  }
                );
                that.addListPopover({
                  type: "Success", // ["Error", "Warning", "Success", "Information"]
                  title: "Proceso finalizado.",
                  description: "<p>" + "Proceso finalizado." + "</p>",
                  subtitle: "",
                });
              } else {
                MessageBox.information(
                  "La etiqueta de bulto saldo fue enviada a la cola de impresión."
                );
              }
            })
            .catch(function (oError) {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
            })
            .finally(function () {
              that._initModels(that);
              sap.ui.core.BusyIndicator.hide();
            });
        },
        /**-----------------------------------------------*/
        /*              C O N S T A N T S
    /**-----------------------------------------------*/

        /**
         * @Description
         * Funcion que:
         *  Obtiene registros del servicio oData
         *  Setea los registros en un modelo
         *
         * @param   {object} oModel : oModel Service
         * @param   {String} sEntity :Nombre de la entidad
         * @param   {object} oUrlParameters : Parametros
         * @param   {sap.ui.model.Filter} aFilter : Filtros
         * @param   {String} sModelName : Nombre del modelo
         * @return  {object} entity data
         * v1.0 – Version inicial
         *
         */
        _getODataDinamic: function (
          oModel,
          sEntity,
          oUrlParameters,
          aFilter,
          sModelName
        ) {
          var that = this;
          var oModel = oModel;
          if (!oModel) oModel = that.oModel;

          return new Promise(function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            if (!navigator.onLine) {
              Util.readEntity2(sEntity, true, this)
                .then((oResult) => {
                  sap.ui.core.BusyIndicator.hide();
                  oResult = JSON.parse(oResult);
                  resolve(oResult.results);
                })
                .catch(function (oError) {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                  reject(oError);
                })
                .finally(function () {});
            } else {
              oDataService
                .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
                .then(function (oResult) {
                  sap.ui.core.BusyIndicator.hide();
                  if (sModelName) {
                    var oModel = new JSONModel(oResult.results);
                    oModel.setSizeLimit(999999999);
                    that.getView().setModel(oModel, sModelName);
                  }
                  if (
                    typeof oResult == "object" &&
                    oResult.hasOwnProperty("fnSendPrintBulto")
                  ) {
                    resolve(oResult);
                  } else if (oResult.results.length) {
                    resolve(oResult.results);
                  } else {
                    resolve(false);
                  }
                })
                .catch(function (oError) {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                  reject(oError);
                })
                .finally(function () {
                  // sap.ui.core.BusyIndicator.hide();
                });
            }
          });
        },
        // Formater
        peso: function (fValue) {
          if (!fValue) fValue = 0;

          var mOptions = {
            groupingSeparator: "",
            decimalSeparator: ".",
            minFractionDigits: 3,
            maxFractionDigits: 3,
          };

          var number = fValue,
            decPlaces = mOptions.maxFractionDigits,
            decSep = mOptions.decimalSeparator,
            thouSep = mOptions.groupingSeparator;
          (decPlaces = isNaN((decPlaces = Math.abs(decPlaces)))
            ? 2
            : decPlaces),
            (decSep = typeof decSep === "undefined" ? "." : decSep);
          thouSep = typeof thouSep === "undefined" ? "," : thouSep;
          var sign = number < 0 ? "-" : "";
          var i = String(
            parseInt(
              (number = Math.abs(Number(number) || 0).toFixed(decPlaces))
            )
          );
          var j = (j = i.length) > 3 ? j % 3 : 0;

          return (
            sign +
            (j ? i.substr(0, j) + thouSep : "") +
            i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
            (decPlaces
              ? decSep +
                Math.abs(number - i)
                  .toFixed(decPlaces)
                  .slice(2)
              : "")
          );
        },
      }
    );
  }
);
