/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/CustomListItem",
    "sap/m/FlexBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../controller/BaseController",
    "../model/formatter",
    "../model/models",
    "../service/oDataService",
  ],
  function (
    MessageBox,
    MessageToast,
    Dialog,
    Button,
    List,
    StandardListItem,
    CustomListItem,
    FlexBox,
    Filter,
    FilterOperator,
    JSONModel,
    BaseController,
    formatter,
    models,
    oDataService
  ) {
    "use strict";
    var oMessagePopover;
    var that = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null,
      goAccion = null;

    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.EntregaPrd",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: function () {
          that = this;
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          that.oRouter
            .getTarget("EntregaPrd")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
          that._createPopover();
        },

        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/
        _handleRouteMatched: async function (oEvent) {
          var that = this;

          var srvExt = that._configServiceExternal();
          if (srvExt) {
            goModel = srvExt.oModel;
            goModelSapErp = srvExt.oModelSapErp;
          }

          try {
            goAccion = that._getAcctions("TRAS");
            if (!goAccion) {
              that._navTo("Inicio", null);
              return;
            }
            await that._initModels(that);
            that._createLogDialog();
            await that._getMasterData();
          } catch (oError) {
            that._navTo("Inicio", null);
            return;
          }
        },

        _getMasterData: async function () {
          var that = this,
            oUrlParameters = {
              $expand: "oMaestraTipo",
            },
            aFilters = [];

          that
            .getView()
            .setModel(new sap.ui.model.json.JSONModel({}), "MaestraModel");

          aFilters.push(new Filter("activo", FilterOperator.EQ, true));
          var result = await oDataService.oDataRead(
            goModel,
            "Maestra",
            oUrlParameters,
            aFilters
          );
          if (result) {
            var aConstant = result.results.reduce(function (r, a) {
              var sKey = "NONE";
              if (a.oMaestraTipo) {
                sKey = a.oMaestraTipo.tabla.toUpperCase();
              }
              r[sKey] = r[sKey] || [];
              r[sKey].push(a);
              return r;
            }, Object.create(null));

            that.getView().getModel("MaestraModel").setProperty("/", aConstant);
            return true;
          }
          return false;
        },

        _createLogDialog: function () {
          if (!this.oLogDialog) {
            this.oLogDialog = new Dialog({
              title: "Respuesta",
              content: new List({
                items: {
                  path: "localModel>/Log",
                  template: new StandardListItem({
                    title: "{= ${localModel>Message}.split(':')[0]}",
                    description: "{= ${localModel>Message}.split(':')[1]}",
                    //type:"Detail",
                    // info: "{localModel>Message}",
                    infoState: "Error",
                    highlight: "Error",
                    wrapping: true,
                  }),
                },
              }),
              endButton: new Button({
                text: that._getI18nText("textCloseButton"),
                press: function () {
                  this.getModel("localModel").setProperty("/Log", []);
                  this.oLogDialog.close();
                }.bind(this),
              }),
            });
            // to get access to the controller's model
            this.getView().addDependent(this.oLogDialog);
          }
        },

        _createPopover() {
          that.setModel(new JSONModel([]), "MsgPopoverList");
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

        _validateAccion: function (sAction) {
          var oAction = goAccion;
          var bPermision = true;
          if (!oAction.enpFullControl) {
            bPermision = false;
            if (sAction == "RECO") {
              if (oAction.enpRecoger) bPermision = true;
            }
            if (sAction == "RECE") {
              if (oAction.enpRecepcion) bPermision = true;
            }
            if (sAction == "DPRO") {
              if (oAction.enpDevProduccion) bPermision = true;
            }
            if (sAction == "DALM") {
              if (oAction.enpDevAlmancen) bPermision = true;
            }
          }

          return bPermision;
        },

        onCambiarAccion: function (oEvent) {
          var oLocalModel = this.getModel("localModel"),
            sKey = oEvent.getParameter("selectedItem").getKey(),
            aFilters = [],
            oBinding = this.byId("idBultoTable").getBinding("items");

          if (sKey !== "") {
            aFilters.push(
              new Filter("oBulto/sOperation", FilterOperator.EQ, sKey)
            );
            oLocalModel.setProperty("/UI/confirm", true);
            oLocalModel.setProperty("/selectedAction", sKey);
          } else {
            oLocalModel.setProperty("/UI/confirm", false);
            oLocalModel.setProperty("/selectedAction", "");
          }

          oBinding.filter(aFilters);
        },

        onQRScan: function (oEvent) {
          //http://www.barcode-generator.org/
          var that = this;

          try {
            try {
              if (!cordova.plugins.barcodeScanner) {
                return MessageToast.show(that._getI18nText("W000010"));
              }
            } catch (oError) {
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
                  oStandardModel.setProperty("/oQR/oBulto", oQRscan);
                  that._searchEtiqueta();
                }
              },
              this._onScanError,
              oOptions
            );
          } catch (oError) {
            console.error(oError);
          }
        },

        onQRSearch(oEvent) {
          var that = this;
          var sCode = oEvent ? oEvent.getParameter("query") : null;
          if (sCode) {
            that._searchEtiqueta();
          } else {
            that._getBultoData(null);
          }
        },

        onConfirm: function (oEvent) {
          // return MessageBox.information(
          //   "Estamos trabajando, la funcionalidad estará lista pronto"
          // );
          var oLocalModel = this.getModel("localModel");
          var sSelAction = oLocalModel.getProperty("/selectedAction");

          if (sSelAction === "") {
            this.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Traslado Bultos",
              description: "<p>" + "Debe seleccionar la operación." + "</p>",
              subtitle: "",
            });
            return MessageBox.error("Debe seleccionar la operación.");
          }
          var oModel = goModel;
          var that = this;

          var oBultoListModel = that.getModel("BultoListModel");
          var aBultoList = JSON.stringify(oBultoListModel.getProperty("/"));
          if (JSON.parse(aBultoList) && JSON.parse(aBultoList).length) {
            MessageBox.confirm("Realizar el traslado de los bultos.", {
              title: "Confirmar traslado",
              actions: ["SI", "NO"],
              initialFocus: "NO",
              onClose: async function (sAction) {
                if ("SI" == sAction) {
                  sap.ui.core.BusyIndicator.show(0);
                  var sOperation = that
                    .getModel("localModel")
                    .getProperty("/selectedAction");
                  var aAuxBultoList = JSON.parse(aBultoList).filter((oItem) => {
                    return oItem.oBulto.sOperation === sOperation;
                  });
                  var sZflag = sSelAction.split("-")[1];
                  var sNow = formatter.getTimestampToYMD(new Date());

                  // Zflag campo de validacion de operacion a nivel de cabecera
                  var oContent = {
                    Mblnr: "",
                    Mjahr: "",
                    Bldat: sNow + "T00:00:00.0000000",
                    Budat: sNow + "T00:00:00.0000000",
                    Usnam: "",
                    TrasladoItemV2Set: [],
                    TrasladoMensajeSet: [],
                    Zflag: sZflag,
                  };

                  var oTempTras = {
                    Zflag: "",
                    Mblnr: "" /*Doc.material*/,
                    Mjahr: "" /*Ejerc.doc.mat.*/,
                    Zeile: "",
                    Bwart: "",
                    Matnr: "" /*Codigo Insumo*/,
                    Charg: "" /*Codigo Lote*/,
                    Werks: "" /*Centro Origen*/,
                    //Erfmg: "",
                    Lgort: "", //oItem.oInsumo.almacen,  /*Almacen Origen*/
                    Umwrk: "" /*Centro recepto*/,
                    Umlgo: "" /*Alm.receptor*/,
                    Kostl: "" /*Centro coste*/,
                    /*Datos Bulto: LOG_TRASLADO*/
                    IdBulto: "",
                    Etiqueta: "",
                    TypeTras: "",
                  };

                  /**
                   * Datos de log
                   */
                  if (sZflag === "1") {
                    var oViewModel = goModel;
                    var dNow = new Date();
                    var aLogBody = [];
                    var UserInfoModel = JSON.parse(
                      window.localStorage.getItem("UserInfoModel")
                    );
                    var oUser = UserInfoModel.oUsuario;
                  }

                  var TrasladoItemV2Set = [];
                  for (var key in aAuxBultoList) {
                    var oItem = aAuxBultoList[key];

                    //Log
                    if (sZflag === "1") {
                      // Orden
                      var oEstado = that._getEstadoOrden(sZflag, oItem, that);
                      var oBody = {
                        oEstado_iMaestraId: oEstado.iMaestraId,
                        entregaFisFec: dNow,
                        entregaFisUsu: oUser.usuario,
                      };
                      var sKey = oViewModel.createKey("/ORDEN", {
                        ordenId: oItem.oOrden.ordenId,
                      });
                      aLogBody.push({ sKey, oBody });
                      // Pedido
                      var oEstadoPedido = that._getEstadoPedido(
                        sZflag,
                        oItem,
                        that
                      );
                      var oBodyPedido = {
                        oEstado_iMaestraId: oEstadoPedido.iMaestraId,
                      };
                      var sKeyPedido = oViewModel.createKey("/PEDIDO", {
                        pedidoId: oItem.oOrden.pedidoId,
                      });
                      aLogBody.push({ sKey: sKeyPedido, oBody: oBodyPedido });
                    }
                    //Log

                    var oAlm = that._validarAlmacenes(oItem, sZflag);

                    var oItemSet = {
                      Zflag: sZflag,
                      Matnr: oItem.oInsumo.codigo /*Codigo Insumo*/,
                      Charg: oItem.oInsumo.lote /*Codigo Lote*/,
                      Erfmg: oItem.oBulto.neto,
                      Werks: oItem.oInsumo.centro /*Centro Origen*/,
                      Lgort: oAlm.sAlmOri /*Almacen Origen*/,
                      Umwrk: oItem.oInsumo.centro /*Centro recepto*/,
                      Umlgo: oAlm.sAlmDes /*Alm.receptor*/,
                      Aufnr: oItem.oOrden.Aufnr,
                      Status: oItem.oBulto.Status,
                      Tipo: oItem.oBulto.Tipo,
                      Mblnr: oItem.oBulto.mblnr /*Doc.material*/,
                      Mjahr: oItem.oBulto.mjahr /*Ejerc.doc.mat.*/,
                    };

                    var oBultoSet = {
                      IdBulto: oItem.oBulto.idBulto,
                      Etiqueta: oItem.oBulto.etiqueta,
                      TypeTras: sSelAction.split("-")[0],
                      Umed: oItem.oBulto.Umed,
                    };

                    var oTrasItem = { ...oTempTras, ...oItemSet, ...oBultoSet };
                    TrasladoItemV2Set.push(oTrasItem);
                  }

                  // Se eliminan registros repetidos
                  if (sZflag === "1") {
                    var aUniqList = [];
                    aLogBody.map((x) =>
                      aUniqList.filter((a) => a.sKey == x.sKey).length > 0
                        ? null
                        : aUniqList.push(x)
                    );
                  }

                  var aLogRequest = [];

                  oContent.TrasladoItemV2Set = TrasladoItemV2Set;

                  console.log(oContent);
                  that
                    .acPostErpDinamic(oModel, "TrasladoHeadV2Set", oContent)
                    .then(async (oResp) => {
                      sap.ui.core.BusyIndicator.hide();

                      if (oResp) {
                        if (oResp.TrasladoMensajeSet.results.length > 0) {
                          that._initModels(that);
                          that
                            .getModel("localModel")
                            .setProperty(
                              "/Log",
                              oResp.TrasladoMensajeSet.results
                            );

                          if (sZflag === "1") {
                            var bType = true;
                            oResp.TrasladoMensajeSet.results.forEach((oRes) => {
                              if (!["S", "W"].includes(oRes.Type))
                                bType = false;
                            });
                            if (bType) {
                              //Log
                              aUniqList.forEach((oOrden) => {
                                aLogRequest.push(
                                  oDataService.oDataUpdate(
                                    oViewModel,
                                    oOrden.sKey,
                                    oOrden.oBody
                                  )
                                );
                              });
                              await Promise.all(aLogRequest);
                            }
                          }

                          that.oLogDialog.open();
                        } else {
                          var aRespTraslado = oResp.TrasladoItemV2Set.results;

                          for (var key in aAuxBultoList) {
                            var oItemList = aAuxBultoList[key];
                            var oBulto = oItemList.oBulto;
                            var oTras = aRespTraslado.find(
                              (o) =>
                                o.IdBulto === oBulto.idBulto &&
                                o.Etiqueta === oBulto.etiqueta
                            );
                            if (oTras) {
                              if (oTras.Mjahr !== "0000") {
                                that.addListPopover({
                                  type: "Success", // ["Error", "Warning", "Success", "Information"]
                                  title: "Traslado Bulto: " + oBulto.etiqueta,
                                  description:
                                    "<p>" +
                                    "Documento de material: " +
                                    oTras.Mblnr +
                                    ", Ejercicio: " +
                                    oTras.Mjahr +
                                    "</p>",
                                  subtitle: "",
                                });
                                if (sZflag === "1") {
                                  if (key === aAuxBultoList.length - 1) {
                                    //Log
                                    aUniqList.forEach((oOrden) => {
                                      aLogRequest.push(
                                        oDataService.oDataUpdate(
                                          oViewModel,
                                          oOrden.sKey,
                                          oOrden.oBody
                                        )
                                      );
                                    });
                                    await Promise.all(aLogRequest);
                                    //Log
                                  }
                                }
                              } else {
                                that.addListPopover({
                                  type: "Error", // ["Error", "Warning", "Success", "Information"]
                                  title: "Traslado Bulto: " + oBulto.etiqueta,
                                  description:
                                    "<p>" +
                                    "No se puedo generar el traslado" +
                                    "</p>",
                                  subtitle: "Sin generar traslado",
                                });
                              }
                            }
                          }

                          var bError = false;
                          var aTrasladoMensaje =
                            oResp.TrasladoMensajeSet.results;
                          if (aTrasladoMensaje && aTrasladoMensaje.length) {
                            for (var keyM in aTrasladoMensaje) {
                              var oMessageTras = aTrasladoMensaje[keyM];

                              if (oMessageTras.Type == "E") {
                                bError = true;
                              }

                              var sError =
                                oMessageTras.Type == "E"
                                  ? "Error"
                                  : oMessageTras.Type == "W"
                                  ? "Warning"
                                  : oMessageTras.Type == "S"
                                  ? "Success"
                                  : "Information"; // ["Error", "Warning", "Success", "Information"]

                              that.addListPopover({
                                type: sError, // ["Error", "Warning", "Success", "Information"]
                                title: oMessageTras.Message,
                                description:
                                  "<p>" + oMessageTras.Message + "</p>",
                                subtitle: "",
                              });
                            }
                          }

                          if (bError) {
                            MessageBox.warning(
                              "Existen errores enla operación, verifique el log."
                            );
                          } else {
                            MessageBox.success(
                              "Operación realizada, verifique el log."
                            );
                          }
                        }
                        var oFormVerificationModel = that.getModel(
                          "FormVerificationModel"
                        );
                        oFormVerificationModel.setProperty("/", {});
                        oBultoListModel.setProperty("/", []);
                      } else {
                        MessageBox.error("Error al realizar el traslado.");
                        that.addListPopover({
                          type: "Error", // ["Error", "Warning", "Success", "Information"]
                          title: "Traslado Bultos",
                          description:
                            "<p>" +
                            "No se puedo generar el traslado de los bultos selecionados." +
                            "</p>",
                          subtitle: "Sin generar traslado",
                        });
                      }
                    })
                    .catch((oError) => {
                      sap.ui.core.BusyIndicator.hide();
                      MessageBox.error("Error al ejecutar el traslado.");
                      console.log(oError);
                    });
                } else sap.ui.core.BusyIndicator.hide();
              },
            });
          } else {
            return MessageToast.show("No existe ningun registro");
          }
        },

        _validarAlmacenes: function (oItem, sZflag) {
          var sAlmOri = "";
          var sAlmDes = "";
          switch (oItem.oBulto.Tipo) {
            case "FRACCION":
              sAlmOri =
                sZflag === "1" || sZflag === "2"
                  ? "CP01"
                  : oItem.oInsumo.almacen;

              sAlmDes =
                sZflag === "1" || sZflag === "2"
                  ? oItem.oInsumo.almacen
                  : "CP01";
              break;
            case "ENTERO":
              sAlmOri =
                sZflag === "1"
                  ? "CP02"
                  : sZflag === "2"
                  ? "CP01"
                  : oItem.oInsumo.almacen;

              sAlmDes =
                sZflag === "1"
                  ? "CP01"
                  : sZflag === "2"
                  ? oItem.oInsumo.almacen
                  : "CP01";
              break;
            case "SALDO_FRAC_ALM":
              sAlmOri =
                sZflag === "1"
                  ? "CP02"
                  : sZflag === "2"
                  ? "CP01"
                  : oItem.oInsumo.almacen;

              sAlmDes =
                sZflag === "1"
                  ? "CP01"
                  : sZflag === "2"
                  ? oItem.oInsumo.almacen
                  : "CP01";
              break;
            case "SALDO_ALM":
              sAlmOri =
                sZflag === "1"
                  ? "CP02"
                  : sZflag === "2"
                  ? "CP01"
                  : oItem.oInsumo.almacen;

              sAlmDes =
                sZflag === "1"
                  ? "CP01"
                  : sZflag === "2"
                  ? oItem.oInsumo.almacen
                  : "CP01";
              break;
          }
          return { sAlmOri, sAlmDes };
        },

        _getEstadoOrden: function (sFlag, oItem, that) {
          //Estado a cambiar a nivel de orden
          var oMaestraModel = that.getModel("MaestraModel"),
            aEstadosCP = oMaestraModel.getProperty("/ESTADO_CP_ORDEN"),
            aEstadosAM = oMaestraModel.getProperty("/ESTADO_AM_ORDEN"),
            aEstadosOrden = aEstadosCP.concat(aEstadosAM);
          var sCodigo = "";

          // ENTERO Y FRACCIÓN CP
          switch (sFlag) {
            case "1":
              oItem.oOrden.pedidoTipo === "PAI"
                ? (sCodigo = "AMOENFI")
                : (sCodigo = "PAOENFI"); // ENTREGA FISICA
              break;
            case "2":
              oItem.oOrden.pedidoTipo === "PAI"
                ? (sCodigo = "AMOENFI")
                : (sCodigo = "PAOENFI"); // ENTREGA FISICA
              break;
            case "3":
              oItem.oOrden.pedidoTipo === "PAI"
                ? (sCodigo = "AMOENFI")
                : (sCodigo = "PAOENFI"); // ENTREGA FISICA
              break;
            case "4":
              oItem.oOrden.pedidoTipo === "PAI"
                ? (sCodigo = "AMOENFI")
                : (sCodigo = "PAOENFI"); // ENTREGA FISICA
              break;
          }

          return aEstadosOrden.find((o) => o.codigo === sCodigo);
        },

        _getEstadoPedido: function (sFlag, oItem, that) {
          //Estado a cambiar a nivel de pedido
          var oMaestraModel = that.getModel("MaestraModel"),
            aEstadosCP = oMaestraModel.getProperty("/ESTADO_CP_PEDIDO"),
            aEstadosAM = oMaestraModel.getProperty("/ESTADO_AM_PEDIDO"),
            aEstadosPedido = aEstadosCP.concat(aEstadosAM);
          var sCodigo = "";

          // ENTERO Y FRACCIÓN CP
          switch (sFlag) {
            case "1":
              oItem.oOrden.pedidoTipo === "PCP"
                ? (sCodigo = "PAPCUMP")
                : (sCodigo = "AMPCUMP"); // ENTREGA FISICA
              break;
            case "2":
              oItem.oOrden.pedidoTipo === "PCP"
                ? (sCodigo = "PAPCUMP")
                : (sCodigo = "AMPCUMP"); // ENTREGA FISICA
              break;
            case "3":
              oItem.oOrden.pedidoTipo === "PCP"
                ? (sCodigo = "PAPCUMP")
                : (sCodigo = "AMPCUMP"); // ENTREGA FISICA
              break;
            case "4":
              oItem.oOrden.pedidoTipo === "PCP"
                ? (sCodigo = "PAPCUMP")
                : (sCodigo = "AMPCUMP"); // ENTREGA FISICA
              break;
          }

          return aEstadosPedido.find((o) => o.codigo === sCodigo);
        },

        onCancel: function (oEvent) {
          var that = this;
          var oBultoListModel = that.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getData();
          if (aBultoList && aBultoList.length) {
            MessageBox.confirm(
              "Si cancela se perderan todos los registros seleccionados.",
              {
                title: "Confirmar",
                actions: ["SI", "NO"],
                initialFocus: "NO",
                onClose: async function (sAction) {
                  if ("SI" == sAction) {
                    that._initModels(that);
                  }
                },
              }
            );
          } else {
            that._initModels(that);
          }
          return;

          var oView = that.getView();
          var FormVisibleModel = oView.getModel("FormVisibleModel");
          FormVisibleModel.setData({
            options: true,
            select: "",
          });
        },
        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/

        _initModels: function (that) {
          var oView = that.getView();
          //that._getConstant(that, goModel);
          that.sAction = "";
          oView.setModel(
            new JSONModel({
              lis: [],
              options: true,
              select: "",
            }),
            "FormVisibleModel"
          );

          //Inicializa modelo de acciones
          that.setModel(
            new JSONModel({
              Log: [],
              UI: {
                multiselect: false,
                confirm: false,
                operation: true,
              },
              selectedAction: "",
              list: [],
            }),
            "localModel"
          );

          that.setModel(new JSONModel([]), "MsgPopoverList");
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that.getView().setModel(new JSONModel([]), "BultoListModel");
          that.getView().setModel(new JSONModel([]), "BultoGroupListModel");

          oView.getModel("StandardModel").setProperty("/oQR", {
            oBulto: {
              text: "",
            },
          });

          that.getView().setModel(
            new JSONModel({
              oInsumo: {},
              oBulto: {},
            }),
            "FormVerificationModel"
          );
        },

        _searchEtiqueta: function () {
          var that = this;
          var oView = that.getView();
          var sText = "";
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");

          sText = oQR.oBulto.text;
          that._getBultoData(sText);
        },

        onDeleteItems: function (oEvent) {
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("BultoGroupListModel");
          var oItemDel = oBindingContext.getObject();

          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aBultoGroupList = oBultoGroupListModel.getProperty("/");

          var oBultoListModel = this.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getProperty("/");

          var aBultoListFilter = aBultoList.filter((oItem) => {
            return (
              oItem.oInsumo.codigo !== oItemDel.oInsumo.codigo &&
              oItem.oInsumo.lote !== oItemDel.oInsumo.lote
            );
          });

          oBultoListModel.setProperty("/", aBultoListFilter);

          var iIndex = parseInt(oBindingContext.sPath.split("/").pop());
          aBultoGroupList.splice(iIndex, 1);
          oBultoGroupListModel.refresh(true);
        },

        onReturnItems: async function (oEvent) {
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("BultoGroupListModel");
          var oItemDel = oBindingContext.getObject();

          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aBultoGroupList = oBultoGroupListModel.getProperty("/");

          var oBultoListModel = this.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getProperty("/");

          var aAuxFilter = aBultoList.filter((oItem) => {
              return (
                oItem.oInsumo.codigo === oItemDel.oInsumo.codigo &&
                oItem.oInsumo.lote === oItemDel.oInsumo.lote
              );
            }),
            ReempaqueItemSet = [];

          aAuxFilter.forEach((oItem) => {
            ReempaqueItemSet.push({
              Exidv: oItem.oBulto.idBulto,
              Werks: oItem.oInsumo.centro,
              Matnr: oItem.oInsumo.codigo,
              Charg: oItem.oInsumo.lote,
              Menge: oItem.oBulto.neto,
              Meins: oItem.oBulto.Umed,
              Status: oItem.oBulto.Status,
              TypeTras: oItem.oBulto.Tipo,
              Aufnr: oItem.oOrden.Aufnr,
            });
          });

          var oAuxDel = {
            Zid: "",
            ReempaqueItemSet,
            ReempaqueMensajeSet: [],
          };

          var oRes = await this.acPostErpDinamic(
            goModel,
            "ReempaqueHeadSet",
            oAuxDel
          );

          if (
            oRes.ReempaqueMensajeSet.results.find((oItem) => oItem.Type === "E")
          )
            MessageBox.error("Error al devolver el insumo.");
          else {
            var aBultoListFilter = aBultoList.filter((oItem) => {
              return (
                oItem.oInsumo.codigo !== oItemDel.oInsumo.codigo &&
                oItem.oInsumo.lote !== oItemDel.oInsumo.lote
              );
            });

            oBultoListModel.setProperty("/", aBultoListFilter);

            var iIndex = parseInt(oBindingContext.sPath.split("/").pop());
            aBultoGroupList.splice(iIndex, 1);
            oBultoGroupListModel.refresh(true);
          }
        },

        onShowBulto: function (oEvent) {
          var that = this;
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("BultoGroupListModel");
          var oItemSel = oBindingContext.getObject();

          var oBultoListModel = that.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getData();

          var aBultoListFilter = [];
          for (var key in aBultoList) {
            var oItem = aBultoList[key];
            if (
              oItem.oInsumo.codigo == oItemSel.oInsumo.codigo &&
              oItem.oInsumo.lote == oItemSel.oInsumo.lote
            ) {
              oItem.oBulto.neto = that._weight(oItem.oBulto.neto);
              aBultoListFilter.push(oItem);
            }
          }

          // Ordenar las líneas por número de bulto
          // aBultoListFilter.sort(
          //   (a, b) =>
          //     (a.oBulto.nroItem > b.oBulto.nroItem ? 1 : -1) &&
          //     a.oBulto.Tipo === b.oBulto.Tipo
          // );

          that
            .getView()
            .setModel(new JSONModel(aBultoListFilter), "BultoSelectListModel");
          if (!this.oDefaultDialog) {
            this.oDefaultDialog = new Dialog({
              title: "Bultos contenidos",
              content: new List({
                // mode: "{= ${localModel>/UI/confirm} ? 'Delete' : 'None'}",
                items: {
                  path: "BultoSelectListModel>/",
                  template: new CustomListItem({
                    content: new FlexBox({
                      alignItems: "Start",
                      justifyContent: "SpaceBetween",
                      items: [
                        new sap.m.VBox({
                          items: [
                            new sap.m.Title({
                              text: "{BultoSelectListModel>oBulto/etiqueta}",
                            }),
                            new sap.m.Label({
                              text: "{BultoSelectListModel>oBulto/Tipo}",
                            }),
                          ],
                        }),
                        new sap.m.HBox({
                          justifyContent: "SpaceBetween",
                          visible: "{= !${localModel>/UI/multiselect}}",
                          items: [
                            new sap.m.Button({
                              customData: {
                                key: "sEtiqueta",
                                value: "{BultoSelectListModel>oBulto/etiqueta}",
                              },
                              type: "Reject",
                              icon: "sap-icon://delete",
                              enabled: "{localModel>/UI/confirm}",
                              press: function (oEvent) {
                                var sId = oEvent
                                  .getSource()
                                  .getCustomData()[0]
                                  .getValue();

                                //Se elimina de la lista de bultos el seleccionado
                                var oBultoListModel =
                                  that.getModel("BultoListModel");
                                var aBultoList =
                                  oBultoListModel.getProperty("/");

                                var iIndex = aBultoList.findIndex((oItem) => {
                                  return oItem.oBulto.etiqueta === sId;
                                });

                                aBultoList.splice(iIndex, 1);
                                var aAux = JSON.stringify(aBultoList);

                                // Se vuelve a agrupar los bultos similares
                                var oBultoGroupListModel = that.getModel(
                                  "BultoGroupListModel"
                                );
                                var aBultoGroupList = [];
                                aBultoList.reduce(function (r, a) {
                                  var sKey =
                                    a.oInsumo.codigo + "-" + a.oInsumo.lote;

                                  if (!r[sKey]) {
                                    r[sKey] = jQuery.extend({}, a);
                                    r[sKey].oBulto.countB = 1;
                                    aBultoGroupList.push(r[sKey]);
                                  } else {
                                    r[sKey].oBulto.neto = that._weight(
                                      +r[sKey].oBulto.neto + +a.oBulto.neto
                                    );
                                    r[sKey].oBulto.countB += 1;
                                  }

                                  return r;
                                }, {});
                                oBultoListModel.setProperty(
                                  "/",
                                  JSON.parse(aAux)
                                );
                                oBultoGroupListModel.setProperty(
                                  "/",
                                  aBultoGroupList
                                );
                                that.oDefaultDialog.close();
                              },
                            }),
                            new sap.m.Button({
                              customData: {
                                key: "sEtiqueta",
                                value: "{BultoSelectListModel>oBulto/etiqueta}",
                              },
                              type: "Reject",
                              icon: "sap-icon://redo",
                              enabled:
                                "{= ${localModel>/selectedAction} === 'RPRO-2' || ${localModel>/selectedAction} === 'RALM-4' ? true : false}",
                              press: async function (oEvent) {
                                var sId = oEvent
                                  .getSource()
                                  .getCustomData()[0]
                                  .getValue();

                                //Se elimina de la lista de bultos el seleccionado
                                var oBultoListModel =
                                  that.getModel("BultoListModel");
                                var aBultoList =
                                  oBultoListModel.getProperty("/");
                                var iIndex = aBultoList.findIndex((oItem) => {
                                  return oItem.oBulto.etiqueta === sId;
                                });

                                var oItem = aBultoList[iIndex];

                                var oAuxDel = {
                                  Zid: "",
                                  ReempaqueItemSet: {
                                    Exidv: oItem.oBulto.idBulto,
                                    Werks: oItem.oInsumo.centro,
                                    Matnr: oItem.oInsumo.codigo,
                                    Charg: oItem.oInsumo.lote,
                                    Menge: oItem.oBulto.neto,
                                    Meins: oItem.oBulto.Umed,
                                  },
                                  ReempaqueMensajeSet: [],
                                };

                                var oRes = await that.acPostErpDinamic(
                                  goModel,
                                  "ReempaqueHeadSet",
                                  oAuxDel
                                );

                                if (
                                  oRes.ReempaqueMensajeSet.results.find(
                                    (oItem) => oItem.Type === "E"
                                  )
                                )
                                  MessageBox.error("Error al eliminar insumo.");
                                else {
                                  aBultoList.splice(iIndex, 1);
                                  var aAux = JSON.stringify(aBultoList);

                                  // Se vuelve a agrupar los bultos similares
                                  var oBultoGroupListModel = that.getModel(
                                    "BultoGroupListModel"
                                  );
                                  var aBultoGroupList = [];
                                  aBultoList.reduce(function (r, a) {
                                    var sKey =
                                      a.oInsumo.codigo + "-" + a.oInsumo.lote;

                                    if (!r[sKey]) {
                                      r[sKey] = jQuery.extend({}, a);
                                      r[sKey].oBulto.countB = 1;
                                      aBultoGroupList.push(r[sKey]);
                                    } else {
                                      r[sKey].oBulto.neto = that._weight(
                                        +r[sKey].oBulto.neto + +a.oBulto.neto
                                      );
                                      r[sKey].oBulto.countB += 1;
                                    }

                                    return r;
                                  }, {});
                                  oBultoListModel.setProperty(
                                    "/",
                                    JSON.parse(aAux)
                                  );
                                  oBultoGroupListModel.setProperty(
                                    "/",
                                    aBultoGroupList
                                  );
                                  that.oDefaultDialog.close();
                                }
                              },
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                },
              }),
              endButton: new Button({
                text: that._getI18nText("textCloseButton"),
                press: function () {
                  this.oDefaultDialog.close();
                }.bind(this),
              }),
            });

            // to get access to the controller's model
            this.getView().addDependent(this.oDefaultDialog);
          }

          this.oDefaultDialog.open();
        },

        _getBultoData: function (sCode) {
          if (sCode) {
            var that = this;
            that.oSaldo = null;
            var oView = that.getView();
            var oModel = goModel;
            var oThrowError = {};
            var sMsg = "";

            if (!oModel) {
              oModel = oView.getModel();
            }

            var aFilter = [],
              oUrlParameters = {},
              EQ = FilterOperator.EQ;
            var oQrScan = that._getFormatQrProd(sCode);
            if (oQrScan) {
              var oLocalModel = that.getModel("localModel");
              var oBultoListModel = that.getModel("BultoListModel");
              var oBultoGroupListModel = that.getModel("BultoGroupListModel");
              var oFormVerificationModel = that.getModel(
                "FormVerificationModel"
              );
              oBultoListModel.setProperty("/", []);
              oBultoGroupListModel.setProperty("/", []);
              oFormVerificationModel.setProperty("/", {});
              oLocalModel.setProperty("/list", []);
              oLocalModel.setProperty("/selectedAction", "");
              oLocalModel.setProperty("/UI/confirm", false);
              this.byId("idSelectOperation").setSelectedKey();
              this.byId("idBultoTable").getBinding("items").filter([]);
              if (
                oQrScan.IdBulto === "" &&
                oQrScan.CodigoInsumo === "" &&
                oQrScan.Lote === ""
              )
                aFilter.push(new Filter("Etiqueta", EQ, oQrScan.Etiqueta));
              else {
                if (oQrScan.IdBulto !== "")
                  aFilter.push(new Filter("IdBulto", EQ, oQrScan.IdBulto));

                aFilter.push(
                  new Filter("CodigoInsumo", EQ, oQrScan.CodigoInsumo)
                );
                aFilter.push(new Filter("Lote", EQ, oQrScan.Lote));
                aFilter.push(new Filter("Etiqueta", EQ, oQrScan.Etiqueta));
              }

              // BULTOS PARA CENTRAL DE PESADAS
              aFilter.push(new Filter("Tipo", EQ, "ENTERO"));
              aFilter.push(new Filter("Tipo", EQ, "FRACCION"));
              // BULTOS PARA ALMACÉN DE MATERIALES
              aFilter.push(new Filter("Tipo", EQ, "SALDO_FRAC_ALM"));
              aFilter.push(new Filter("Tipo", EQ, "SALDO_ALM"));
              aFilter.push(new Filter("Tipo", EQ, "ENTERO_ALM"));
              // ETIQUETA GRUPAL
              aFilter.push(new Filter("Tipo", EQ, "IDEN_PROD"));

              /**
               * OBTENER DATOS DE LA ETIQUETA SALDO
               */
              sap.ui.core.BusyIndicator.show(0);
              that
                .fnGetErpDinamic(
                  oModel,
                  "AtendidoItemSet",
                  oUrlParameters,
                  aFilter
                )
                .then((aResp) => {
                  if (aResp && aResp.length) {
                    var oBulto = null;
                    for (var key in aResp) {
                      if (aResp[key].Tipo === "IDEN_PROD") {
                        aFilter = [];
                        var Pedido = aResp[key].Pedido,
                          Orden = aResp[key].Orden,
                          Centro = aResp[key].Centro;
                        if (Pedido)
                          aFilter.push(new Filter("Pedido", EQ, Pedido));
                        if (Orden) aFilter.push(new Filter("Orden", EQ, Orden));

                        aFilter.push(new Filter("Tipo", EQ, "ENTERO"));
                        aFilter.push(new Filter("Tipo", EQ, "FRACCION"));
                        aFilter.push(new Filter("Tipo", EQ, "SALDO_FRAC_ALM"));
                        aFilter.push(new Filter("Tipo", EQ, "SALDO_ALM"));
                        aFilter.push(new Filter("Tipo", EQ, "ENTERO_ALM"));

                        return that.fnGetErpDinamic(
                          oModel,
                          "AtendidoItemSet",
                          oUrlParameters,
                          aFilter
                        );
                      } else if (aResp[key].IdBulto) {
                        oBulto = aResp[key];
                        break;
                      }
                    }

                    if (!oBulto) {
                      console.log(oBulto);
                      var sMsg = that._getI18nText("W000111");
                      MessageToast.show(sMsg);
                      var oThrowError = {
                        code: "E",
                        title: "",
                        description: sMsg,
                      };
                      throw oThrowError;
                    }

                    that.oEtiqueta = oBulto;
                    return [oBulto];
                  } else {
                    sMsg = that._getI18nText("W000111");
                    MessageToast.show(sMsg);
                    oThrowError = {
                      code: "E",
                      title: "",
                      description: sMsg,
                    };
                    throw oThrowError;
                  }
                })
                .then((aResp) => {
                  that.aBultoTras = null;
                  aFilter = [];
                  var aBultoTras = [];
                  var sMessage = "";

                  if (aResp && aResp.length > 0) {
                    var unique = [];
                    var f = aResp.find((oItem) => oItem.Status === "F");
                    var i = aResp.find((oItem) => oItem.Status === "0");
                    var w = aResp.find((oItem) => oItem.Status === "W");

                    if ((f && w) || (i && w)) {
                      unique = aResp.filter((oItem) => oItem.Status === "W");
                      aResp = unique;
                    } else if (i) {
                      sMsg = that._getI18nText("E000304");
                      MessageBox.error(sMsg);
                      var oThrowError = {
                        code: "E",
                        title: "Etiqueta",
                        description: sMsg,
                      };
                      throw oThrowError;
                    }

                    // Ordenar las líneas por código de material
                    aResp.sort((a, b) =>
                      a.CodigoInsumo > b.CodigoInsumo ? 1 : -1
                    );

                    var oBulto = aResp[0];

                    that.oEtiqueta = oBulto;

                    aResp.forEach((oItem) => {
                      var Pedido = oItem.Pedido;
                      var Orden = oItem.Orden;

                      if (Pedido)
                        aFilter.push(new Filter("pedidoNumero", EQ, Pedido));
                      if (Orden)
                        aFilter.push(new Filter("ordenNumero", EQ, Orden));

                      aBultoTras.push(oItem);
                    });

                    if (!aBultoTras && aBultoTras.length === 0) {
                      oThrowError = { description: "No se encontro bulto." };
                      if (!sMessage) {
                        sMessage = "No existe bulto para trasladar.";
                        oThrowError = {
                          code: "E",
                          title: sMessage,
                          description: sMessage,
                        };
                      }
                      throw oThrowError;
                    }

                    that.aBultoTras = aBultoTras;

                    /**
                     * OBTENER DATOS DE PEDIDO, ORDEN, INSUMO
                     */
                    return that
                      ._getODataDinamic(
                        oModel,
                        "VIEW_PEDIDO_CONSOLIDADO",
                        null,
                        aFilter,
                        null
                      )
                      .catch((oError) => {
                        console.log(oError);
                        sMsg = that._getI18nText("W000111");
                        MessageToast.show(sMsg);
                        var oThrowError = {
                          code: "E",
                          title: "Sin Registros",
                          description: sMsg,
                        };
                        throw oThrowError;
                      });
                  } else {
                    sMsg = that._getI18nText("W000111");
                    MessageToast.show(sMsg);
                    oThrowError = {
                      code: "E",
                      title: "Sin Registros...",
                      description: sMsg,
                    };
                    throw oThrowError;
                  }
                })
                .then(async (aPedidoResp) => {
                  var aBultoTras = that.aBultoTras;
                  var aBultoList = oBultoListModel.getProperty("/");
                  var oFormData = {};
                  if (aPedidoResp && aPedidoResp.length > 0) {
                    for (var key in aBultoTras) {
                      var oBulto = aBultoTras[key],
                        iLenght = aBultoTras.length;

                      var Pedido = oBulto.Pedido;
                      var Orden = oBulto.Orden;
                      var CodigoInsumo = oBulto.CodigoInsumo;
                      var Lote = oBulto.Lote;

                      var oPedido = aPedidoResp.find(
                        (o) =>
                          o.pedidoNumero === Pedido &&
                          o.ordenNumero === Orden &&
                          o.insumoCodigo === CodigoInsumo &&
                          o.insumoLote === Lote
                      );

                      if (oPedido) {
                        //Estados nivel ORDEN:  [PAOATEN, PAOPEFI, AMOATEN, AMOPEFI].oPedido.ordenEstado
                        var aEstadoOrdenVal = [
                          "PAOATEN",
                          "PAOPEFI",
                          "AMOATEN",
                          "AMOPEFI",
                        ];

                        // if (
                        //   aEstadoOrdenVal.includes(oPedido.ordenEstado) ||
                        //   ["X"].includes(oBulto.FlagVerif)
                        // ) {
                        // if (["V"].includes(oPedido.ordenVerificacionEstado)) {
                        var oOperation = that._validateOperation(
                          aBultoTras[key]
                        );
                        if (oOperation) {
                          oFormData = {
                            oOrden: {
                              pedidoId: oPedido.pedidoId,
                              ordenId: oPedido.ordenId,
                              estado: oPedido.ordenEstado,
                              tipo: oPedido.PedidoTipoDC,
                              numero: oPedido.ordenNumero,
                              lote: oPedido.ordenLote,
                              descProd: oPedido.OrdenDescrip,
                              Aufnr: Orden,
                              pedidoTipo: oPedido.PedidoTipo,
                            },
                            oInsumo: {
                              ordenDetalleId: oPedido.ordenDetalleId,
                              codigo: oPedido.insumoCodigo,
                              lote: oPedido.insumoLote,
                              idPos: oPedido.insumoIdPos,
                              estado: oPedido.insumoEstado,
                              descripcion: oPedido.insumoDescrip,
                              fechaVencimiento: oPedido.insumoFechaVencimiento,
                              pesadoMaterialPr: oPedido.insumoPesadoMaterialPr,
                              agotar: oPedido.InsumoAgotar,
                              almacen: oPedido.insumoAlmacen,
                              centro: oPedido.insumoCentro,
                              cantPedida: that._weight(oPedido.cantPedida),
                              umb: oPedido.insumoUmb,
                            },
                            oBulto: {
                              idBulto: oBulto.IdBulto,
                              etiqueta: oBulto.Etiqueta,
                              mblnr: oBulto.Mblnr,
                              mjahr: oBulto.Mjahr,
                              nroItem: oBulto.NroItem,
                              neto: that._weight(oBulto.CantidadA),
                              tara: that._weight(oBulto.Tara),
                              bruto: that._weight(
                                +oBulto.CantidadA + +oBulto.Tara
                              ),
                              Tipo: oBulto.Tipo,
                              Status: oBulto.Status,
                              Umed: oBulto.UnidadM,
                              sOperation: oOperation.key,
                            },
                          };

                          aBultoList.push(oFormData);
                        } else {
                          if (key == iLenght - 1) {
                            sMsg = that._getI18nText("E000304");
                            that.addListPopover({
                              type: "Error", // ["Error", "Warning", "Success", "Information"]
                              title: "Operación.",
                              description: "<p>" + sMsg + "</p>",
                              subtitle: oBulto.Etiqueta,
                            });
                            oLocalModel.setProperty("/UI/confirm", false);
                            MessageBox.error(sMsg);
                            return;
                          }
                        }
                        // } else {
                        //   if (key == iLenght - 1) {
                        //     sMsg = that._getI18nText("E000306");
                        //     that.addListPopover({
                        //       type: "Error", // ["Error", "Warning", "Success", "Information"]
                        //       title: "Etiqueta observada.",
                        //       description: "<p>" + sMsg + "</p>",
                        //       subtitle: oBulto.Etiqueta,
                        //     });
                        //     oLocalModel.setProperty("/UI/confirm", false);
                        //     MessageBox.error(sMsg);
                        //     return;
                        //   }
                        // }
                        // } else {
                        //   if (key == iLenght - 1) {
                        //     sMsg = that._getI18nText("E000105");
                        //     that.addListPopover({
                        //       type: "Error", // ["Error", "Warning", "Success", "Information"]
                        //       title: "Etiqueta observada.",
                        //       description: "<p>" + sMsg + "</p>",
                        //       subtitle: oBulto.Etiqueta,
                        //     });
                        //     MessageBox.show(sMsg);
                        //   }
                        // }
                      } else {
                        sMsg = "Insumo no encontrado.";
                        MessageToast.show(sMsg);
                        that.addListPopover({
                          type: "Error", // ["Error", "Warning", "Success", "Information"]
                          title: "Insumo observada.",
                          description: "<p>" + sMsg + "</p>",
                          subtitle: oBulto.Etiqueta,
                        });
                      }
                    }

                    //Se recupera el detalle de la orden para obtener el itemPos
                    var aOrdenDetail = await that._getODataDinamic(
                      oModel,
                      "ORDEN_DETALLE",
                      null,
                      [
                        new Filter(
                          "oOrden_ordenId",
                          EQ,
                          aPedidoResp[0].ordenId
                        ),
                      ],
                      null
                    );

                    //Se ordena por codigo del insumo y el itemPos
                    var aSortBultoList = aBultoList.sort((a, b) => {
                      var aPos = aOrdenDetail.find(
                        (x) => a.oOrden.ordenId === x.oOrden_ordenId
                      );
                      var bPos = aOrdenDetail.find(
                        (x) => b.oOrden.ordenId === x.oOrden_ordenId
                      );
                      return aPos.itemPos > bPos.itemPos ? 1 : -1;
                    });

                    /**
                     * AGRUPAR BULTOS POR CODIGO Y LOTE
                     */
                    var aBultoGroupList = [];
                    var aStateValidate = [];
                    var aBultosListAux = JSON.stringify(aSortBultoList);

                    // Se remueven operaciones repetidas
                    var aList = oLocalModel.getProperty("/list"),
                      aUniqList = [];

                    aList.map((x) =>
                      aUniqList.filter((a) => a.key == x.key).length > 0
                        ? null
                        : aUniqList.push(x)
                    );
                    oLocalModel.setProperty("/list", aUniqList);

                    aSortBultoList.reduce(function (r, a) {
                      var sKey = a.oInsumo.codigo + "-" + a.oInsumo.lote;

                      if (!r[sKey]) {
                        r[sKey] = jQuery.extend({}, a);
                        if (
                          !that._validateState(
                            r[sKey].oBulto.Status,
                            r[sKey].oBulto.sOperation.split("-")[1]
                          )
                        ) {
                          r[sKey].oBulto.countB = 1;
                          aBultoGroupList.push(r[sKey]);
                        }
                      } else {
                        if (
                          !that._validateState(
                            r[sKey].oBulto.Status,
                            r[sKey].oBulto.sOperation.split("-")[1]
                          )
                        ) {
                          r[sKey].oBulto.neto = that._weight(
                            +r[sKey].oBulto.neto + +a.oBulto.neto
                          );
                          r[sKey].oBulto.countB += 1;
                        }
                      }

                      return r;
                    }, {});

                    oBultoListModel.setProperty(
                      "/",
                      JSON.parse(aBultosListAux)
                    );
                    oBultoGroupListModel.setProperty("/", aBultoGroupList);

                    that
                      .getModel("FormVerificationModel")
                      .setProperty("/", oFormData);
                  } else {
                    sMsg = that._getI18nText("W000111");
                    MessageToast.show(sMsg);
                    oThrowError = {
                      code: "E",
                      title: "No se encontraron registros de insumos.",
                      description: sMsg,
                    };
                    throw oThrowError;
                  }
                })
                .catch((oError) => {
                  console.log(oError);
                  that.setModel(
                    new JSONModel({
                      oInsumo: {},
                      oBulto: {},
                    }),
                    "FormVerificationModel"
                  );
                  if (oError.error) {
                    MessageToast.show(oError.error.message.value);
                    that.addListPopover({
                      type: "Error", // ["Error", "Warning", "Success", "Information"]
                      title: "Error al obtener el registro.",
                      description: "<p>" + oError.error.message.value + "</p>",
                      subtitle: "",
                    });
                  } else if (oError.code) {
                    that.addListPopover({
                      type:
                        oError.code == "E"
                          ? "Error"
                          : oError.code == "W"
                          ? "Warning"
                          : oError.code == "S"
                          ? "Success"
                          : "Information", // ["Error", "Warning", "Success", "Information"]
                      title: oError.title,
                      description: "<p>" + oError.description + "</p>",
                      subtitle: "",
                    });
                  }
                });
            } else {
              MessageToast.show(this._getI18nText("E000302"));
              that.addListPopover({
                type: "Error", // ["Error", "Warning", "Success", "Information"]
                title: "Error",
                description: "<p>" + this._getI18nText("E000302") + "</p>",
                subtitle: "",
              });
            }
          }
        },

        _validateOperation(oBulto) {
          var oLocalModel = this.getModel("localModel"),
            aList = oLocalModel.getProperty("/list"),
            oOperations = {},
            sTipo = oBulto.Tipo,
            sEstado = oBulto.Status;

          if ("FRACCION" === sTipo && sEstado === "")
            oOperations = {
              key: "EPRO-1",
              name: this._getI18nText("itemEPRO"),
            };
          else if (
            ("ENTERO" === sTipo && sEstado === "T") ||
            ("SALDO_FRAC_ALM" === sTipo && sEstado === "T") ||
            ("SALDO_ALM" === sTipo && sEstado === "T") ||
            ("ENTERO_ALM" === sTipo && sEstado === "T")
          )
            oOperations = {
              key: "EPRO-1",
              name: this._getI18nText("itemEPRO"),
            };
          else if (
            ("FRACCION" === sTipo && sEstado === "M") ||
            ("ENTERO" === sTipo && sEstado === "M") ||
            ("SALDO_FRAC_ALM" === sTipo && sEstado === "M") ||
            ("SALDO_ALM" === sTipo && sEstado === "M") ||
            ("ENTERO_ALM" === sTipo && sEstado === "M")
          )
            oOperations = {
              key: "RPRO-2",
              name: this._getI18nText("itemRPRO"),
            };
          else if (
            ("FRACCION" === sTipo && sEstado === "F") ||
            ("ENTERO" === sTipo && sEstado === "F") ||
            ("SALDO_FRAC_ALM" === sTipo && sEstado === "F") ||
            ("SALDO_ALM" === sTipo && sEstado === "F") ||
            ("ENTERO_ALM" === sTipo && sEstado === "F")
          )
            oOperations = {
              key: "EALM-3",
              name: this._getI18nText("itemEALM"),
            };
          else if (
            ("FRACCION" === sTipo && sEstado === "W") ||
            ("ENTERO" === sTipo && sEstado === "W") ||
            ("SALDO_FRAC_ALM" === sTipo && sEstado === "W") ||
            ("SALDO_ALM" === sTipo && sEstado === "W") ||
            ("ENTERO_ALM" === sTipo && sEstado === "W")
          )
            oOperations = {
              key: "RALM-4",
              name: this._getI18nText("itemRALM"),
            };

          if (Object.keys(oOperations).length > 0) {
            aList.push(oOperations);
            return oOperations;
          }
          return false;
        },

        _validateState(sState, sAction) {
          if (
            (sAction === "1" && sState === "F") ||
            (sAction === "1" && sState === "0")
          )
            return true;
          else if (sAction === "2" && sState !== "M") return true;
          else if (sAction === "3" && sState !== "F") return true;
          // else if (sAction === "4" && sState === "W") return true;
          return false;
        },

        _getDescripTypeTras: function (sAction) {
          var sDecrip = "SIN TRASLADO";
          if (sAction == "RECO") {
            sDecrip = "RECOJO";
          }
          if (sAction == "RECE") {
            sDecrip = "RECEPCION";
          }
          if (sAction == "DPRO") {
            sDecrip = "DEV. PRODUCCION";
          }
          if (sAction == "DALM") {
            sDecrip = "DEV. ALMACEN";
          }

          return sDecrip;
        },

        _buildGrupoOrdenBulto: function (oModel, sKey, iMaestraId) {
          //var that = this;
          //var oView = that.getView();

          var UserRoleModel = JSON.parse(
            window.localStorage.getItem("UserRoleModel")
          );
          var oUser = UserRoleModel.oUser.oUser;

          var oEntity = {
            oEstadoPesaje_iMaestraId: iMaestraId,
          };

          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };

          var sEntity = "/GRUPO_ORDEN_BULTO";
          var sKeyEntity = oModel.createKey(sEntity, {
            grupoOrdenBultoId: sKey,
          });

          var oEntityData = { ...oEntity, ...oAuditStruct };

          return {
            oEntityData: oEntityData,
            sKeyEntity: sKeyEntity,
            sEntity: sEntity,
          };
        },

        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
        /**-----------------------------------------------*/

        _openScanQR: function () {
          if (!this._oScanDialog) {
            this._oScanDialog = new sap.m.Dialog({
              title: "Scanear Etiqueta",
              contentWidth: "740px",
              contentHeight: "480px",
              horizontalScrolling: false,
              verticalScrolling: false,
              stretchOnPhone: true,
              content: [
                new sap.ui.core.HTML({
                  id: this.createId("scanContainer"),
                  content: "<video />",
                }),
              ],
              endButton: new sap.m.Button({
                text: that._getI18nText("textCancelButton"),
                press: function (oEvent) {
                  this._oScanDialog.close();
                }.bind(this),
              }),
              afterOpen: function () {
                this.qrScanner = this._initQuaggaQR(
                  this.getView().byId("scanContainer").getDomRef()
                );
                Quagga.start();
              }.bind(this),
              afterClose: function () {
                Quagga.stop();
              },
            });

            this.getView().addDependent(this._oScanDialog);
          }

          this._oScanDialog.open();
        },

        _openScanBarcode: function () {
          if (!this._oScanDialog) {
            this._oScanDialog = new sap.m.Dialog({
              title: "Scanear Etiqueta",
              contentWidth: "740px",
              contentHeight: "480px",
              horizontalScrolling: false,
              verticalScrolling: false,
              stretchOnPhone: true,
              content: [
                new sap.ui.core.HTML({
                  id: this.createId("scanContainer"),
                  content: "<div />",
                }),
              ],
              endButton: new sap.m.Button({
                text: that._getI18nText("textCancelButton"),
                press: function (oEvent) {
                  this._oScanDialog.close();
                }.bind(this),
              }),
              afterOpen: function () {
                this._initQuaggaBarcode(
                  this.getView().byId("scanContainer").getDomRef()
                )
                  .done(function (oResult) {
                    Quagga.start();
                  })
                  .fail(
                    function (oError) {
                      MessageBox.error(
                        oError.message.length
                          ? oError.message
                          : "Failed to initialise Quagga with reason code " +
                              oError.name,
                        {
                          onClose: function () {
                            this._oScanDialog.close();
                          }.bind(this),
                        }
                      );
                    }.bind(this)
                  );
              }.bind(this),
              afterClose: function () {
                Quagga.stop();
              },
            });

            this.getView().addDependent(this._oScanDialog);
          }

          this._oScanDialog.open();
        },

        _initQuaggaQR: function (oTarget) {
          QrScanner.WORKER_PATH = "lib/qr-scanner-worker.min.js";
          const qrScanner = new QrScanner(
            oTarget,
            function (result) {
              this._setValueScan(result);
              this._oScanDialog.close();
            }.bind(this)
          );

          window.Quagga = qrScanner;

          return qrScanner;
        },

        _initQuaggaBarcode: function (oTarget) {
          var oDeferred = jQuery.Deferred();

          Quagga.init(
            {
              inputStream: {
                type: "LiveStream",
                target: oTarget,
                constraints: {
                  width: { min: 640 },
                  height: { min: 480 },
                  facingMode: "environment",
                },
              },
              locator: {
                patchSize: "medium",
                halfSample: true,
              },
              numOfWorkers: 2,
              frequency: 10,
              decoder: {
                readers: [
                  {
                    format: "code_128_reader",
                    config: {},
                  },
                ],
              },
              locate: true,
            },
            function (error) {
              if (error) {
                oDeferred.reject(error);
              } else {
                oDeferred.resolve();
              }
            }
          );

          if (!this._bQuaggaEventHandlersAttached) {
            // Attach event handlers...

            Quagga.onProcessed(
              function (result) {
                var drawingCtx = Quagga.canvas.ctx.overlay,
                  drawingCanvas = Quagga.canvas.dom.overlay;

                if (result) {
                  // The following will attempt to draw boxes around detected barcodes
                  if (result.boxes) {
                    drawingCtx.clearRect(
                      0,
                      0,
                      parseInt(drawingCanvas.getAttribute("width")),
                      parseInt(drawingCanvas.getAttribute("height"))
                    );
                    result.boxes
                      .filter(function (box) {
                        return box !== result.box;
                      })
                      .forEach(function (box) {
                        Quagga.ImageDebug.drawPath(
                          box,
                          { x: 0, y: 1 },
                          drawingCtx,
                          { color: "green", lineWidth: 2 }
                        );
                      });
                  }

                  if (result.box) {
                    Quagga.ImageDebug.drawPath(
                      result.box,
                      { x: 0, y: 1 },
                      drawingCtx,
                      { color: "#00F", lineWidth: 2 }
                    );
                  }

                  if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(
                      result.line,
                      { x: "x", y: "y" },
                      drawingCtx,
                      { color: "red", lineWidth: 3 }
                    );
                  }
                }
              }.bind(this)
            );

            Quagga.onDetected(
              function (result) {
                // Barcode has been detected, value will be in result.codeResult.code. If requierd, validations can be done
                // on result.codeResult.code to ensure the correct format/type of barcode value has been picked up

                // Set barcode value in input field
                console.log(result);
                this._setValueScan(result.codeResult.code);
                // Close dialog
                this._oScanDialog.close();
              }.bind(this)
            );

            // Set flag so that event handlers are only attached once...
            this._bQuaggaEventHandlersAttached = true;
          }

          return oDeferred.promise();
        },

        _setValueScan: function (sValue) {
          var oStandardModel = this.getView().getModel("StandardModel");
          oStandardModel.setProperty("/oQR/oBulto/text", sValue);
          oStandardModel.refresh();
          this._searchEtiqueta();
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
          if (!oModel) oModel = that.oModel;

          return new Promise(function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
              .then(function (oResult) {
                sap.ui.core.BusyIndicator.hide();
                if (sModelName) {
                  var oModel = new JSONModel(oResult.results);
                  oModel.setSizeLimit(999999999);
                  that.getView().setModel(oModel, sModelName);
                }
                if (oResult.results.length) {
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
          });
        },

        _groupConstant: function (aConstantKey) {
          //aConstantKey = aConstant['ESTADO_PESAJE']

          var aResult = aConstantKey.reduce(function (r, a) {
            r[a.codigo] = r[a.codigo] || [];
            r[a.codigo] = a;
            return r;
          }, Object.create(null));

          return aResult;
        },
      }
    );
  }
);
