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
      goAccion = null,
      EQ = FilterOperator.EQ,
      CONSTANT = {
        /**
         * GRUPO
         */
        GROL: "CPSP", //GRUPO ROL
        /**
         * TIPOS
         */
        TIPOP: "PCP", //PEDIDO CENTRAL PESADA
        NORM: "CPNORM", //PEDIDO NORMAL
        URGE: "CPURGE", //PEDIDO URGENTE
        ADIC: "CPADIC", //PEDIDO ADICIONAL
        INDI: "CPINDI", // PEDIDO INDIVIDUAL
        IDEM: "CPIDEM", // PEDIDO RESERVA IDE

        /**
         * DOCUMENTOS
         */
        CLASE_DOC: "CLASE_DOCUMENTO_CP",
        GRUPO_ART: "GRUPO_ARTICULO_CP",

        CP: {
          /**
           * ESTADOS
           */
          ESTADO_PEDIDO: "ESTADO_CP_PEDIDO",
          ESTADO_ORDEN: "ESTADO_CP_ORDEN",
          ESTADO_INSUMO: "ESTADO_CP_INSUMO",
          /**
           * PEDIDO
           */
          PPROC: "PAPPROC", //PROCESO
          PCUMP: "PAPCUMP", //CUMPLIDO
          PANUL: "PAPANUL", //ANULADO
          /**
           * ORDEN
           */
          OPEFI: "PAOPEFI", //PESAJE FINALIZADO
          OPARC: "PAOPARC", // ENTREGA PARCIAL
          OTOT: "PAOTOT", //ENTREGA TOTAL
          OANUL: "PAOANUL", //ANULADO
          /**
           * INSUMO
           */
          IPEFI: "PAIPEFI", //PESAJE FINALIZADO
          IPARC: "PAIPARC", // ENTREGA PARCIAL
          ITOT: "PAITOT", //ENTREGA TOTAL
          IANUL: "PAIANUL", //ANULADO
        },
        AM: {
          /**
           * ESTADOS
           */
          ESTADO_PEDIDO: "ESTADO_AM_PEDIDO",
          ESTADO_ORDEN: "ESTADO_AM_ORDEN",
          ESTADO_INSUMO: "ESTADO_AM_INSUMO",
          /**
           * PEDIDO
           */
          PPROC: "AMPPROC", //PROCESO
          PCUMP: "AMPCUMP", //CUMPLIDO
          PANUL: "AMPANUL", //ANULADO
          /**
           * ORDEN
           */
          OATEN: "AMOATEN", //ATENDIO
          OPARC: "AMOPARC", // ENTREGA PARCIAL
          OTOT: "AMOTOT", // ENTREGA TOTAL
          OANUL: "AMOANUL", //ANULADO
          /**
           * INSUMO
           */
          IATPI: "AMIATPI", //ATENDIDO PICKING
          IPARC: "AMIPARC", // ENTREGA PARCIAL
          ITOT: "AMITOT", //ENTREGA TOTAL
          IANUL: "AMIANUL", //ANULADO
        },
      };

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
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });
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

          try {
            goAccion = that._getAcctions("TRAS");
            if (!goAccion) {
              that._navTo("Inicio", null);
              return;
            }
            window.localStorage.setItem("actions", JSON.stringify(goAccion));
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

          aFilters.push(new Filter("activo", EQ, true));
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
                    infoState:
                      "{= ${localModel>Type} === 'S' ? 'Success': 'Error'}",
                    highlight:
                      "{= ${localModel>Type} === 'S' ? 'Success': 'Error'}",
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

        onCambiarAccion: function (oEvent) {
          var oLocalModel = this.getModel("localModel"),
            sKey = oEvent.getParameter("selectedItem").getKey(),
            aFilters = [],
            oBinding = this.byId("idBultoTable").getBinding("items");

          if (sKey !== "") {
            aFilters.push(new Filter("oBulto/sOperation", EQ, sKey));
            this._validateRols(sKey);
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
          that = this;
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

          var oBultoListModel = that.getModel("BultoListModel");
          var aAuxFil = oBultoListModel.getProperty("/");

          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aAuxGruop = oBultoGroupListModel.getProperty("/");
          var aReGroup = aAuxFil.filter((oRe) =>
            aAuxGruop.find(
              (oIn) =>
                oRe.oInsumo.codigo === oIn.oInsumo.codigo &&
                oRe.oInsumo.lote === oIn.oInsumo.lote &&
                oRe.oBulto.sOperation === oIn.oBulto.sOperation
            )
          );
          var aBultoList = JSON.stringify(aReGroup);
          if (oLocalModel.getProperty("/UI/multiselect")) {
            var aTableItems = this.byId("idBultoTable").getSelectedItems();
            var aAux = [];

            aTableItems.forEach((oSelected) => {
              var sPath = oSelected
                .getBindingContext("BultoGroupListModel")
                .getPath();
              var oItemConf = oBultoGroupListModel.getProperty(sPath);

              var aBultoListFilter = aAuxFil.filter((oItem) => {
                return (
                  oItem.oInsumo.codigo === oItemConf.oInsumo.codigo &&
                  oItem.oInsumo.lote === oItemConf.oInsumo.lote &&
                  oItem.oBulto.sOperation === oItemConf.oBulto.sOperation
                );
              });

              aBultoListFilter.forEach((oFil) => aAux.push(oFil));
            });

            aBultoList = JSON.stringify(aAux);
          }

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
                  var UserInfoModel = JSON.parse(
                    window.localStorage.getItem("UserInfoModel")
                  );
                  var oUser = UserInfoModel.oUsuario;

                  // Zflag campo de validacion de operacion a nivel de cabecera
                  var oContent = {
                    Mblnr: "",
                    Mjahr: "",
                    Bldat: sNow + "T00:00:00.0000000",
                    Budat: sNow + "T00:00:00.0000000",
                    TrasladoItemV2Set: [],
                    TrasladoMensajeSet: [],
                    Zflag: sZflag,
                    Usnam: oUser.usuario,
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

                  var TrasladoItemV2Set = [];
                  for (var key in aAuxBultoList) {
                    var oItem = aAuxBultoList[key];
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
                      Fraccion: oItem.oBulto.Fraccion.toString(),
                      Subfraccion: oItem.oBulto.Subfraccion.toString(),
                    };

                    var oBultoSet = {
                      IdBulto: oItem.oBulto.idBulto,
                      Etiqueta: oItem.oBulto.etiqueta,
                      TypeTras: sZflag,
                      Umed: oItem.oBulto.Umed,
                    };

                    var oTrasItem = { ...oTempTras, ...oItemSet, ...oBultoSet };
                    TrasladoItemV2Set.push(oTrasItem);
                  }

                  var aLogRequest = [];

                  oContent.TrasladoItemV2Set = TrasladoItemV2Set;

                  console.log(oContent);

                  //HABILITAR SOLO PARA CASOS DE PRUEBAS PARA TRASLADOS ERP (RESPONSE: ESTRUCTURA ERP)

                  /*
                  var oResp = {
                    Mblnr: "",
                    Mjahr: "0000",
                    Bldat: "2023-02-21T00:00:00.000Z",
                    Budat: "2023-02-21T00:00:00.000Z",
                    Usnam: "EGARCITI",
                    Zflag: "3",
                    TrasladoItemV2Set: {
                      results: [
                        {
                          Mblnr: "",
                          Mjahr: "0000",
                          Zeile: "0000",
                          Zflag: "3",
                          Bwart: "",
                          Matnr: "1100004483",
                          Werks: "1020",
                          Lgort: "W001",
                          Erfmg: "0.101",
                          Umwrk: "1020",
                          Umlgo: "CP01",
                          Charg: "UAT0000790",
                          Kostl: "",
                          IdBulto: "3000001537",
                          Etiqueta: "G00000952",
                          TypeTras: "3",
                          Mblnr_Anul: "",
                          Mjahr_Anul: "0000",
                          Rsnum: "0000000000",
                          Sgtxt: "",
                          Status: "F",
                          Tipo: "SALDO_FRAC_ALM",
                          Aufnr: "2900000114",
                          Umed: "MLL",
                          Fraccion: "01",
                          Subfraccion: "0001",
                        },
                      ],
                    },
                    TrasladoMensajeSet: {
                      results: [
                        {
                          Mblnr: "5900021019",
                          Mjahr: "2023",
                          Type: "S",
                          Id: "",
                          Number: "000",
                          Message:
                            " Se ejecutó correctamente Envío a producción  : Doc.Material 5900021019 , Ejercicio 2023",
                          LogNo: "",
                          LogMsgNo: "000000",
                          MessageV1: "",
                          MessageV2: "",
                          MessageV3: "",
                          MessageV4: "",
                          Parameter: "",
                          Row: 0,
                          Field: "",
                          System: "",
                        },
                      ],
                    },
                  };
                  */

                  that
                    .oDataCreateDinamic(
                      goModelSapErp,
                      "TrasladoHeadV2Set",
                      oContent
                    )
                    .then(async (oResp) => {
                      sap.ui.core.BusyIndicator.hide();

                      if (oResp) {
                        if (oResp.TrasladoMensajeSet.results.length > 0) {
                          var aBultosGroup = JSON.parse(
                              that
                                .getModel("localModel")
                                .getProperty("/aGroupAll")
                            ),
                            sFilters = JSON.stringify(
                              oLocalModel.getProperty("/aFiltersERP")
                            );

                          let sCabecera = oResp.TrasladoMensajeSet.results[0];
                          var aAuxMess = [];
                          let sType = "";

                          oResp.TrasladoMensajeSet.results.forEach((oMen) => {
                            aAuxMess.push(oMen.Message);
                            sType = oMen.Type;
                          });

                          aAuxMess = [...new Set(aAuxMess)];

                          var bType = true;
                          oResp.TrasladoMensajeSet.results.forEach((oRes) => {
                            if (["E"].includes(oRes.Type)) bType = false;
                          });
                          if (
                            (bType && sZflag === "1") ||
                            (bType && sZflag === "4")
                          ) {
                            var aBultos = await oDataService
                              .oDataRead(
                                goModelSapErp,
                                "AtendidoItemSet",
                                {},
                                JSON.parse(sFilters)
                              )
                              .catch((oError) => {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error("Error al validar estados.");
                                console.log(oError);
                              });

                            aBultos = aBultos.results.filter((o) => {
                              return o.IdBulto != "";
                            });

                            var isOkProcess = true;
                            await that
                              ._validarEstadosIL(
                                aAuxBultoList,
                                aBultosGroup,
                                aBultos,
                                sZflag,
                                oUser
                              )
                              .catch((oError) => {
                                isOkProcess = false;
                                sap.ui.core.BusyIndicator.hide();
                                console.log(oError);
                                MessageBox.error(
                                  "Error al validar / actualizar estados de los Insumos."
                                );
                              }); //Control de estados orden detalle
                            if (isOkProcess)
                              await that
                                ._validarEstadosOrden(
                                  aAuxBultoList,
                                  sZflag,
                                  oUser
                                )
                                .catch((oError) => {
                                  isOkProcess = false;
                                  sap.ui.core.BusyIndicator.hide();
                                  console.log(oError);
                                  MessageBox.error(
                                    "Error al validar / actualizar estados de la Orden."
                                  );
                                }); //Control de Orden fracción
                          }

                          that._initModels(that);

                          var sMsg = aAuxMess.join(", \n");
                          that.addListPopover({
                            type: sType == "S" ? "Success" : "Error", // ["Error", "Warning", "Success", "Information"]
                            title:
                              sType == "S"
                                ? "Respuesta"
                                : "Error en el traslado.",
                            description: "<p>" + sMsg + "</p>",
                            subtitle: "",
                          });
                          oLocalModel.setProperty("/UI/confirm", false);
                          if (sType == "S") {
                            MessageBox.success(sMsg);
                          } else {
                            MessageBox.error("Error en el traslado: \n" + sMsg);
                          }

                          sap.ui.core.BusyIndicator.hide();

                          /*that
                            .getModel("localModel")
                            .setProperty("/Log", [
                              { Message: aAuxMess.join(", \n"), Type: sType },
                            ]);
                          that.oLogDialog.open();
                          */
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
                                    // await Promise.all(aLogRequest);
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
                              "Existen errores en la operación, verifique el log."
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

        _validarEstadosOrden: async function (aBultoProcess, sZflag, oUser) {
          var aRequest = [];
          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };
          if (aBultoProcess.length > 0) {
            let aFilter = [
              new Filter("pedidoId", EQ, aBultoProcess[0].oOrden.pedidoId),
            ];

            /**
             * Obtener el estatus actual del: pedido -> Orden / Fraccion -> Insumo
             */
            var aDetail = await oDataService
              .oDataRead(goModel, "VIEW_SEGUIMIENTO_DETALLE", {}, aFilter)
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
                var sMsg = this._getI18nText("E000307");
                MessageToast.show(sMsg);
                var oThrowError = {
                  code: "E",
                  title: "Sin Registros",
                  description: sMsg,
                };
                throw oThrowError;
              });

            aDetail = aDetail.results.filter((o) => {
              /**
               * Filtrar solo registros que no esten anulados
               */
              return !(
                o.fraccionEstado == CONSTANT.CP.OANUL ||
                o.insumoEstado == CONSTANT.CP.IANUL ||
                o.fraccionEstado == CONSTANT.AM.OANUL ||
                o.insumoEstado == CONSTANT.AM.IANUL
              );
            });

            var aOrdenFraccion = aDetail.filter((o) => {
              /**
               * Filtrar solo la Orden que se proceso (Fraccion)
               */
              return (
                o.ordenFraccionId == aBultoProcess[0].oOrden.ordenFraccionId
              );
            });

            /**
             * Validación y Cambio de estado de la Orden/Fraccion
             */
            var oEstadoFrac = {};
            var sEstatus = "";
            if (sZflag == "1") {
              // Envio a Producción
              var isITOT = aOrdenFraccion.every(
                (oBul) =>
                  /**
                   * Si todos los insumos tienen el estado ENTREGA TOTAL
                   */
                  oBul.insumoEstado === CONSTANT.CP.ITOT ||
                  oBul.insumoEstado === CONSTANT.AM.ITOT
              );

              sEstatus = isITOT
                ? aOrdenFraccion[0].pedidoTipo === "PCP"
                  ? CONSTANT.CP.OTOT
                  : CONSTANT.AM.OTOT // ENTREGA TOTAL
                : aOrdenFraccion[0].pedidoTipo === "PCP"
                ? CONSTANT.CP.OPARC
                : CONSTANT.AM.OPARC; // ENTREGA PARCIAL
            } else {
              // sZflag = 4
              // Recepcionar Envío a Almacén
              var aEstadoInsumo = [];
              aOrdenFraccion.forEach((o) => {
                aEstadoInsumo.push(o.insumoEstado);
              });
              aEstadoInsumo = [...new Set(aEstadoInsumo)];

              var isITOT = aEstadoInsumo.every(
                (sEstado) =>
                  /**
                   * Si todos los insumos tienen el estado ENTREGA TOTAL
                   */
                  sEstado === CONSTANT.CP.ITOT || sEstado === CONSTANT.AM.ITOT
              );

              var isIPARC = aEstadoInsumo.some(
                (sEstado) =>
                  /**
                   * Si existen estados de insumos en ENTREGA PARCIAL
                   */
                  sEstado === CONSTANT.CP.IPARC || sEstado === CONSTANT.AM.IPARC
              );

              if (aOrdenFraccion[0].pedidoTipo === "PCP") {
                /**
                 * Si el pedido es PEDIDO CENTRAL PESADAS
                 */

                sEstatus = isITOT
                  ? CONSTANT.CP.OTOT /** ENTREGA TOTAL */
                  : isIPARC || aEstadoInsumo.some((o) => o == CONSTANT.CP.ITOT)
                  ? CONSTANT.CP.OPARC /** ENTREGA PARCIAL */
                  : CONSTANT.CP.OPEFI /** PESAJE FINALIZADO */;

                if (
                  ![
                    CONSTANT.CP.OTOT,
                    CONSTANT.CP.OPARC,
                    CONSTANT.CP.OPEFI,
                  ].includes(aOrdenFraccion[0].fraccionEstado)
                ) {
                  /**
                   * Si el estado actual de la Orden no se encuentra en las combinaciones de estados que se evaluan
                   * No se actualiza el estado de la Orden
                   */
                  sEstatus = aOrdenFraccion[0].fraccionEstado;
                }
              } else {
                /**
                 * Si el pedido es PEDIDO ALMACEN DE MATERIALES
                 */
                sEstatus = isITOT
                  ? CONSTANT.AM.OTOT /** ENTREGA TOTAL */
                  : isIPARC || aEstadoInsumo.some((o) => o == CONSTANT.AM.ITOT)
                  ? CONSTANT.AM.OPARC /** ENTREGA PARCIAL */
                  : CONSTANT.AM.OATEN; /** ATENDIDO */

                if (
                  ![
                    CONSTANT.AM.OTOT,
                    CONSTANT.AM.OPARC,
                    CONSTANT.AM.OATEN,
                  ].includes(aOrdenFraccion[0].fraccionEstado)
                ) {
                  /**
                   * Si el estado actual de la Orden no se encuentra en las combinaciones de estados que se evaluan
                   * No se actualiza el estado de la Orden
                   */
                  sEstatus = aOrdenFraccion[0].fraccionEstado;
                }
              }
            }

            debugger;
            oEstadoFrac = that._getEstado(
              CONSTANT.CP.ESTADO_ORDEN,
              CONSTANT.AM.ESTADO_ORDEN,
              sEstatus,
              that
            );

            aDetail.forEach((o) => {
              if (
                o.ordenFraccionId == aBultoProcess[0].oOrden.ordenFraccionId
              ) {
                /**
                 * Actualizar estado temporal
                 */
                o.fraccionEstado = sEstatus;
              }
            });

            var dNow = new Date();
            var oBody = {
              oEstado_iMaestraId: oEstadoFrac.iMaestraId,
              entregaFisFec: dNow,
              entregaFisUsu: oUser.usuario,
            };
            oBody = { ...oBody, ...oAuditStruct };

            var sKey = goModel.createKey("/ORDEN_FRACCION", {
              ordenFraccionId: aBultoProcess[0].oOrden.ordenFraccionId,
            });

            if (!aRequest.find((oReq) => oReq.sKey === sKey))
              aRequest.push({ sKey, oBody });

            /**
             * Validación y Cambio de estado del Pedido
             */

            var isTotal = aDetail.every(
              (oBul) =>
                /**
                 * Si todos las ordenes tienen el estado ENTREGA TOTAL
                 */
                oBul.fraccionEstado === CONSTANT.CP.OTOT ||
                oBul.fraccionEstado === CONSTANT.AM.OTOT
            );

            sEstatus = isTotal
              ? aDetail[0].pedidoTipo === "PCP"
                ? CONSTANT.CP.PCUMP
                : CONSTANT.AM.PCUMP // CUMPLIDO
              : aDetail[0].pedidoTipo === "PCP"
              ? CONSTANT.CP.PPROC
              : CONSTANT.AM.PPROC; // PROCESO

            let oEstadoPedido = that._getEstado(
              CONSTANT.CP.ESTADO_PEDIDO,
              CONSTANT.AM.ESTADO_PEDIDO,
              sEstatus,
              that
            );

            var oBody = {
              oEstado_iMaestraId: oEstadoPedido.iMaestraId,
            };
            oBody = { ...oBody, ...oAuditStruct };

            var sKey = goModel.createKey("/PEDIDO", {
              pedidoId: aBultoProcess[0].oOrden.pedidoId,
            });

            aRequest.push({ sKey, oBody });

            var aPromise = [];
            aRequest.forEach((oItem) =>
              aPromise.push(
                oDataService.oDataUpdate(goModel, oItem.sKey, oItem.oBody)
              )
            );

            return new Promise(function (resolve, reject) {
              Promise.all(aPromise)
                .then((oResp) => {
                  resolve(true);
                })
                .catch((oError) => {
                  console.log("Error al validar estados de la Orden");
                  console.log(oError);
                  reject(oError);
                });
            });
          }
        },

        _getEstadoOrdenFrac: function (aBultos, sZflag) {
          let bEstado = false,
            sCP = "",
            sAM = "";
          switch (sZflag) {
            case "1":
              bEstado = aBultos.some(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );
              sCP = !bEstado ? "PAOTOT" : "PAOPARC";
              sAM = !bEstado ? "AMOTOT" : "AMOPARC";
              break;
            case "4":
              bEstado = aBultos.every(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );
              sCP = bEstado ? "PAOPEFI" : "PAOPARC";
              sAM = bEstado ? "AMOATEN" : "AMOPARC";
              break;
          }
          return { sCP, sAM };
        },

        _validarEstadosIL: function (
          aBultoProcess,
          aBultosGroup,
          aBultos,
          sZflag,
          oUser
        ) {
          if (aBultos.length > 0) {
            let aRequest = [];
            var oAuditStruct = {
              usuarioActualiza: oUser.usuario,
              fechaActualiza: new Date(),
            };

            for (var oItem of aBultoProcess) {
              let aBultFilter = aBultos.filter(
                (oBul) =>
                  oBul.CodigoInsumo === oItem.oInsumo.codigo &&
                  oBul.Lote === oItem.oInsumo.lote &&
                  +oBul.Subfraccion === +oItem.oInsumo.numSubFraccion
              );
              let oEstado = this._getEstadoOrdenDetalle(aBultFilter, sZflag);
              let oEstadoFrac = that._getEstado(
                "ESTADO_CP_INSUMO",
                "ESTADO_AM_INSUMO",
                oItem.oOrden.pedidoTipo === "PCP" ? oEstado.sCP : oEstado.sAM,
                that
              );

              var oBody = {
                oEstado_iMaestraId: oEstadoFrac.iMaestraId,
              };
              oBody = { ...oBody, ...oAuditStruct };

              let sKey = goModel.createKey("/ORDEN_DETALLE", {
                ordenDetalleId: oItem.oInsumo.ordenDetalleId,
              });
              if (!aRequest.find((oReq) => oReq.sKey === sKey))
                aRequest.push({ sKey, oBody });
            }

            var aPromise = [];

            aRequest.forEach((oItem) =>
              aPromise.push(
                oDataService.oDataUpdate(goModel, oItem.sKey, oItem.oBody)
              )
            );
            return new Promise(function (resolve, reject) {
              Promise.all(aPromise)
                .then((oResp) => {
                  resolve(true);
                })
                .catch((oError) => {
                  console.log("Error al validar estados de los Insumos");
                  console.log(oError);
                  reject(oError);
                  //sap.ui.core.BusyIndicator.hide();
                  //MessageBox.error("Error al validar estados.");
                });
            });
          }
        },

        _getEstadoOrdenDetalle: function (aBultos, sZflag) {
          let bEstado = false,
            sCP = "",
            sAM = "";
          switch (sZflag) {
            case "1":
              bEstado = aBultos.every(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );
              sCP = bEstado
                ? "PAIPEFI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "PAITOT"
                : "PAIPARC";
              sAM = bEstado
                ? "AMIATPI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "AMITOT"
                : "AMIPARC";
              break;
            case "4":
              bEstado = aBultos.every(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );

              sCP = bEstado
                ? "PAIPEFI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "PAITOT"
                : "PAIPARC";
              sAM = bEstado
                ? "AMIATPI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "AMITOT"
                : "AMIPARC";
              break;
          }
          return { sCP, sAM };
        },

        _validarEstadoPedido: async function (sZflag) {
          let oFilter = JSON.parse(
            that.getModel("localModel").getProperty("/oPedidoFilter")
          );
          let aOrden = await oDataService
            .oDataRead(goModel, "VIEW_PEDIDO_CONSOLIDADO", {}, [oFilter])
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
              var sMsg = this._getI18nText("E000307");
              MessageToast.show(sMsg);
              var oThrowError = {
                code: "E",
                title: "Sin Registros",
                description: sMsg,
              };
              throw oThrowError;
            });

          if (aOrden.results.length > 0) {
            if (sZflag === "RPRO-2") {
              //Revertir paso 1 (sZflag:1)
              let oEstadoPedido = this._getEstado(
                "ESTADO_CP_PEDIDO",
                "ESTADO_AM_PEDIDO",
                aOrden.results[0].PedidoTipo === "PCP" ? "PAPPROC" : "AMPPROC",
                this
              );

              if (aOrden.results[0].pedidoEstado != oEstadoPedido.codigo) {
                let oBody = {
                  oEstado_iMaestraId: oEstadoPedido.iMaestraId,
                };
                let sKey = goModel.createKey("/PEDIDO", {
                  pedidoId: aOrden.results[0].pedidoId,
                });

                await oDataService
                  .oDataUpdate(goModel, sKey, oBody)
                  .catch((oError) => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Error al validar estados del Pedido.");
                    console.log(oError);
                  });
              }
            }
          }
        },

        _validarAlmacenes: function (oItem, sZflag) {
          var sAlmOri = "";
          var sAlmDes = "";
          switch (oItem.oBulto.Tipo) {
            case "FRACCION":
              sAlmOri =
                sZflag === "1" || sZflag === "2"
                  ? "CP02"
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

        _getEstado: function (ESTADO_CP, ESTADO_AM, sCodigo, that) {
          //Estado a cambiar a nivel de orden
          var oMaestraModel = that.getModel("MaestraModel"),
            aEstadosCP = oMaestraModel.getProperty(`/${ESTADO_CP}`),
            aEstadosAM = oMaestraModel.getProperty(`/${ESTADO_AM}`),
            aEstadosOrden = aEstadosCP.concat(aEstadosAM);

          return aEstadosOrden.find((o) => o.codigo === sCodigo);
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
                confirm: false,
                delete: false,
                redo: false,
                multiselect: false,
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

        _validateRols: function (sOperation) {
          var oUser = JSON.parse(window.localStorage.getItem("UserInfoModel")),
            aRols = oUser.aRol["TRAS"],
            oLocalModel = this.getModel("localModel"),
            oForm = this.getModel("FormVerificationModel").getProperty("/"),
            confirm,
            redo;

          switch (sOperation) {
            case "EPRO-1":
              confirm =
                aRols.find((oEx) => oEx.rol === "CP_JEFE_PRODUCCION") ||
                aRols.find((oEx) => oEx.rol === "CP_AUXILIAR_PRODUCCION") ||
                aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_PRODUCCION")
                  ? true
                  : false;

              oLocalModel.setProperty("/UI/confirm", confirm);
              oLocalModel.setProperty("/UI/delete", confirm);
              oLocalModel.setProperty("/UI/redo", false);
              break;
            case "RPRO-2":
              confirm =
                aRols.find((oEx) => oEx.rol === "CP_JEFE_PRODUCCION") ||
                aRols.find((oEx) => oEx.rol === "CP_AUXILIAR_PRODUCCION") ||
                aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_PRODUCCION")
                  ? true
                  : false;

              redo =
                oForm.oOrden.pedidoTipo === "PCP"
                  ? aRols.find((oEx) => oEx.rol === "CP_JEFE_PRODUCCION") ||
                    aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_PRODUCCION")
                    ? true
                    : false
                  : aRols.find((oEx) => oEx.rol === "CP_JEFE_ALMACE_INSUMOS") ||
                    aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_PRODUCCION")
                  ? true
                  : false;

              oLocalModel.setProperty("/UI/confirm", confirm);
              oLocalModel.setProperty("/UI/delete", confirm);
              oLocalModel.setProperty("/UI/redo", redo);
              break;
            case "EALM-3":
              confirm =
                aRols.find((oEx) => oEx.rol === "CP_JEFE_PRODUCCION") ||
                aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_PRODUCCION")
                  ? true
                  : false;

              oLocalModel.setProperty("/UI/confirm", confirm);
              oLocalModel.setProperty("/UI/delete", confirm);
              oLocalModel.setProperty("/UI/redo", false);
              break;
            case "RALM-4":
              confirm =
                oForm.oOrden.pedidoTipo === "PCP"
                  ? aRols.find(
                      (oEx) => oEx.rol === "CP_JEFE_CENTRAL_PESADAS"
                    ) ||
                    aRols.find((oEx) => oEx.rol === "CP_SUPERVISOR_CENTRAL_DE")
                    ? true
                    : false
                  : aRols.find((oEx) => oEx.rol === "CP_JEFE_ALMACE_INSUMOS") ||
                    aRols.find(
                      (oEx) => oEx.rol === "CP_SUPERVISOR_ALMACEN_INSUMOS"
                    )
                  ? true
                  : false;

              oLocalModel.setProperty("/UI/confirm", confirm);
              oLocalModel.setProperty("/UI/delete", confirm);
              oLocalModel.setProperty("/UI/redo", confirm);
              break;
          }
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
            return !(
              oItem.oInsumo.codigo === oItemDel.oInsumo.codigo &&
              oItem.oInsumo.lote === oItemDel.oInsumo.lote &&
              oItem.oBulto.sOperation === oItemDel.oBulto.sOperation
            );
          });
          MessageBox.confirm("Quitar los bultos.", {
            title: "Confirmar eliminar",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                oBultoListModel.setProperty("/", aBultoListFilter);

                var iIndex = parseInt(oBindingContext.sPath.split("/").pop());
                aBultoGroupList.splice(iIndex, 1);
                oBultoGroupListModel.setProperty("/", aBultoGroupList);
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },

        onDeleteMultiItems: function (oEvent) {
          var that = this,
            aTableItems = this.byId("idBultoTable").getSelectedItems();

          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aBultoGroupList = oBultoGroupListModel.getProperty("/");

          var aAuxDel = [];

          aTableItems.forEach((oSelected) => {
            var sPath = oSelected
              .getBindingContext("BultoGroupListModel")
              .getPath();

            let oAux = aBultoGroupList[sPath.split("/").pop()];

            aAuxDel.push(oAux);
          });
          MessageBox.confirm("Quitar los bultos.", {
            title: "Confirmar eliminar",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                aAuxDel.forEach((oDel) => {
                  var iIndex = aBultoGroupList.findIndex(
                    (oItem) =>
                      oItem.oInsumo.codigo === oDel.oInsumo.codigo &&
                      oItem.oInsumo.lote === oDel.oInsumo.lote &&
                      oItem.oBulto.sOperation === oDel.oBulto.sOperation
                  );
                  aBultoGroupList.splice(iIndex, 1);
                });
                oBultoGroupListModel.setProperty("/", aBultoGroupList);
                that.byId("idBultoTable").removeSelections(true);
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },
        onReturnItems: async function (oEvent) {
          var that = this,
            oBindingContext = oEvent
              .getSource()
              .getBindingContext("BultoGroupListModel"),
            sOperation = this.getModel("localModel")
              .getProperty("/selectedAction")
              .split("-")[1];
          if (!sOperation)
            return MessageToast.show("Por favor seleccione una Operación.");
          var oItemDel = oBindingContext.getObject();
          that._returnItems([oItemDel]);
        },

        onReturnMultiItems: async function (oEvent) {
          var that = this,
            aTableItems = this.byId("idBultoTable").getSelectedItems(),
            sOperation = this.getModel("localModel")
              .getProperty("/selectedAction")
              .split("-")[1];

          if (!sOperation)
            return MessageToast.show("Por favor seleccione una Operación.");
          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aItemDel = [];
          if (aTableItems.length > 0) {
            aTableItems.forEach((oSelected) => {
              var sPath = oSelected
                .getBindingContext("BultoGroupListModel")
                .getPath();
              var oItemDel = oBultoGroupListModel.getProperty(sPath);
              aItemDel.push(oItemDel);
            });
          }

          that._returnItems(aItemDel);
        },

        _returnItems: async function (aItemDel) {
          var that = this,
            sOperation = this.getModel("localModel")
              .getProperty("/selectedAction")
              .split("-")[1];
          var UserInfoModel = JSON.parse(
            window.localStorage.getItem("UserInfoModel")
          );
          /**
           * Insumos de la Orden
           */
          var oUser = UserInfoModel.oUsuario;
          var oBultoGroupListModel = this.getModel("BultoGroupListModel");
          var aBultoGroupList = oBultoGroupListModel.getProperty("/");

          /**
           * Bultos de los insumos de la Orden
           */
          var oBultoListModel = this.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getProperty("/");

          var aAuxFilter = [],
            ReempaqueItemSet = [];
          for (var oItemDel of aItemDel) {
            /**
             * Obtener los bultos de los Insumos seleccionados
             * para revertir (RPRO-2 : Operacion 2)
             */
            var aBultoListFilter = aBultoList.filter((oItem) => {
              return (
                oItem.oInsumo.codigo === oItemDel.oInsumo.codigo &&
                oItem.oInsumo.lote === oItemDel.oInsumo.lote &&
                oItem.oBulto.sOperation === oItemDel.oBulto.sOperation
              );
            });

            aBultoListFilter.forEach((oItem) => aAuxFilter.push(oItem));
          }

          MessageBox.confirm("Realizar la devolución de los bultos.", {
            title: "Confirmar devolución",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                aAuxFilter.forEach((oItem) => {
                  ReempaqueItemSet.push({
                    Pos: "",
                    TypeTras: oItem.oBulto.Tipo,
                    Status: oItem.oBulto.Status,
                    Aufnr: oItem.oOrden.Aufnr,
                    Exidv: oItem.oBulto.idBulto,
                    Werks: oItem.oInsumo.centro,
                    Matnr: oItem.oInsumo.codigo,
                    Charg: oItem.oInsumo.lote,
                    Menge: oItem.oBulto.neto,
                    Meins: oItem.oBulto.Umed,
                    Fraccion: oItem.oBulto.Fraccion.toString(),
                    Subfraccion: oItem.oBulto.Subfraccion.toString(),
                  });
                });

                var oAuxDel = {
                  Zid: sOperation,
                  Usnam: oUser.usuario,
                  ReempaqueItemSet,
                  ReempaqueMensajeSet: [],
                };

                console.log(oAuxDel);
                var oRes = await that
                  .oDataCreateDinamic(
                    goModelSapErp,
                    "ReempaqueHeadSet",
                    oAuxDel
                  )
                  .catch((oError) => {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(oError);
                  });
                /*var oRes = {};
                oRes.ReempaqueMensajeSet = {};
                oRes.ReempaqueMensajeSet.results = [
                  {
                    Type: "S",
                    Message: "S:Correcto",
                  },
                  {
                    Type: "S",
                    Message: "S:Correcto2",
                  },
                ];*/

                if (
                  oRes.ReempaqueMensajeSet.results.length > 0 &&
                  oRes.ReempaqueMensajeSet.results.find(
                    (oItem) => oItem.Type === "E"
                  )
                )
                  oRes.ReempaqueMensajeSet.results[0].Message !== ""
                    ? MessageBox.error(
                        oRes.ReempaqueMensajeSet.results[0].Message
                      )
                    : MessageBox.error("Error al devolver el insumo.");
                else {
                  let msg = "";

                  var sAux = oRes.ReempaqueMensajeSet.results;
                  sAux.forEach((oItem, idenx) => {
                    if (idenx === 0) msg += `${oItem.Message.split(":")[0]}: `;
                    msg += `${oItem.Message.split(":")[1]}, `;
                  });
                  MessageBox.success(msg);
                  that.addListPopover({
                    type: "Success", // ["Error", "Warning", "Success", "Information"]
                    title: "Devolución",
                    description: "<p>" + msg + "</p>",
                    subtitle: "",
                  });

                  oBultoListModel.setProperty("/", aBultoList);
                  aAuxFilter.forEach((oItemDel) => {
                    /**
                     * - Filtrar los Insumos que fueron revertidos
                     * - Eliminar de la lista los Insumos revertidos
                     */
                    var iIndex = aBultoGroupList.findIndex(
                      (oItem) =>
                        oItem.oInsumo.codigo === oItemDel.oInsumo.codigo &&
                        oItem.oInsumo.lote === oItemDel.oInsumo.lote &&
                        oItem.oBulto.sOperation === oItemDel.oBulto.sOperation
                    );
                    if (iIndex >= 0) aBultoGroupList.splice(iIndex, 1);
                  });
                  oBultoGroupListModel.setProperty("/", aBultoGroupList);
                  that.byId("idBultoTable").removeSelections(true);

                  /**
                   * Cambiar de estados la Orden y sus Insumos
                   * Cambiar de estado el Pedido
                   */
                  await that._valEstadoDevolver();
                  await that._validarEstadoPedido("RPRO-2");
                }
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },

        _valEstadoDevolver: async function () {
          let aGroup = JSON.parse(
            this.getModel("localModel").getProperty("/aGroupAll")
          );
          var UserInfoModel = JSON.parse(
            window.localStorage.getItem("UserInfoModel")
          );
          var oUser = UserInfoModel.oUsuario;

          var aBultos = await oDataService
            .oDataRead(
              goModelSapErp,
              "AtendidoItemSet",
              {},
              this.getModel("localModel").getProperty("/aFiltersERP")
            )
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al validar estados.");
              console.log(oError);
            });

          if (aBultos.results.length > 0) {
            aBultos = aBultos.results.filter((o) => {
              return o.IdBulto != "";
            });
            let dNow = new Date();

            //getEstado
            let oEstado = await this._getEstadoDev(aBultos);
            let aRequest = [];
            for (var oContent of aGroup) {
              oContent.aContent.forEach((oItem) => {
                //Estados a nivel orden detalle
                let aBultFilter = aBultos.filter(
                  (oBul) =>
                    oBul.CodigoInsumo === oItem.oInsumo.codigo &&
                    oBul.Lote === oItem.oInsumo.lote
                );
                let oValDet = this._getEstadoDevDet(aBultFilter);
                let oEstadoDet = that._getEstado(
                  "ESTADO_CP_INSUMO",
                  "ESTADO_AM_INSUMO",
                  oItem.oOrden.pedidoTipo === "PCP" ? oValDet.sCP : oValDet.sAM,
                  that
                );
                let oBodyDet = {
                  oEstado_iMaestraId: oEstadoDet.iMaestraId,
                };
                let sKeyDet = goModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oItem.oInsumo.ordenDetalleId,
                });
                //Colección de peticiones
                if (!aRequest.find((oReq) => oReq.sKey === sKeyDet))
                  aRequest.push({ sKey: sKeyDet, oBody: oBodyDet });

                //Estados a nivel orden fracción
                let oEstadoFrac = that._getEstado(
                  "ESTADO_CP_ORDEN",
                  "ESTADO_AM_ORDEN",
                  oItem.oOrden.pedidoTipo === "PCP" ? oEstado.sCP : oEstado.sAM,
                  that
                );
                let oBody = {
                  oEstado_iMaestraId: oEstadoFrac.iMaestraId,
                  entregaFisFec: dNow,
                  entregaFisUsu: oUser.usuario,
                };
                let sKey = goModel.createKey("/ORDEN_FRACCION", {
                  ordenFraccionId: oItem.oOrden.ordenFraccionId,
                });

                //Colección de peticiones
                if (!aRequest.find((oReq) => oReq.sKey === sKey))
                  aRequest.push({ sKey, oBody });
              });
            }

            var aPromise = [];

            aRequest.forEach((oItem) =>
              aPromise.push(
                oDataService.oDataUpdate(goModel, oItem.sKey, oItem.oBody)
              )
            );

            return new Promise(function (resolve, reject) {
              Promise.all(aPromise)
                .then((oResp) => {
                  resolve(true);
                })
                .catch((oError) => {
                  console.log("Error al devolver estados de la Orden / Insumo");
                  console.log(oError);
                  reject(oError);
                  //sap.ui.core.BusyIndicator.hide();
                  //MessageBox.error("Error al validar estados.");
                });
            });
          }
        },

        _getEstadoDev: function (aBultos) {
          let bEstado = false,
            sCP = "",
            sAM = "",
            sZflag = this.getModel("localModel")
              .getProperty("/selectedAction")
              .split("-")[1];
          switch (sZflag) {
            case "2":
              bEstado = aBultos.some(
                (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
              );
              sCP = !bEstado ? "PAOPEFI" : "PAOPARC";
              sAM = !bEstado ? "AMOATEN" : "AMOPARC";
              break;
            case "4":
              bEstado = aBultos.some(
                (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
              );
              sCP = !bEstado ? "PAOPEFI" : "PAOTOT";
              sAM = !bEstado ? "AMOATEN" : "AMOTOT";
              break;
          }
          return { sCP, sAM };
        },

        _getEstadoDevDet: function (aBultos) {
          let bEstado = false,
            sCP = "",
            sAM = "",
            sZflag = this.getModel("localModel")
              .getProperty("/selectedAction")
              .split("-")[1];
          switch (sZflag) {
            case "2":
              bEstado = aBultos.every(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );
              sCP = bEstado
                ? "PAIPEFI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "PAITOT"
                : "PAIPARC";
              sAM = bEstado
                ? "AMIATPI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "AMITOT"
                : "AMIPARC";
              break;
            case "4":
              bEstado = aBultos.every(
                (oBul) =>
                  oBul.StatusP.toUpperCase() === "PENDIENTE" ||
                  oBul.StatusP === ""
              );
              sCP = bEstado
                ? "PAIPEFI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "PAITOT"
                : "PAIPARC";
              sAM = bEstado
                ? "AMIATPI"
                : aBultos.every(
                    (oBul) => oBul.StatusP.toUpperCase() === "ENTREGADO"
                  )
                ? "AMITOT"
                : "AMIPARC";
              break;
          }
          return { sCP, sAM };
        },

        onShowBulto: function (oEvent) {
          var that = this;
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("BultoGroupListModel");
          var oItemSel = oBindingContext.getObject();
          var UserInfoModel = JSON.parse(
            window.localStorage.getItem("UserInfoModel")
          );
          var oUser = UserInfoModel.oUsuario;

          var oBultoListModel = that.getModel("BultoListModel");
          var aBultoList = oBultoListModel.getProperty("/");

          let aBultoListFilter = [];
          for (let key in aBultoList) {
            let oItem = aBultoList[key];
            if (
              oItem.oInsumo.codigo === oItemSel.oInsumo.codigo &&
              oItem.oInsumo.lote === oItemSel.oInsumo.lote &&
              oItem.oBulto.sOperation === oItemSel.oBulto.sOperation
            ) {
              oItem.oBulto.neto = that._weight(oItem.oBulto.neto);
              aBultoListFilter.push(oItem);
            }
          }

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
                              text: "{BultoSelectListModel>oBulto/idBulto} - F{BultoSelectListModel>oBulto/Subfraccion}",
                            }),
                            new sap.m.Label({
                              text: "{BultoSelectListModel>oBulto/Tipo} - {BultoSelectListModel>oBulto/etiqueta}",
                            }),
                          ],
                        }),
                        new sap.m.HBox({
                          justifyContent: "SpaceBetween",
                          visible: "{= !${localModel>/UI/multiselect}}",
                          items: [
                            new sap.m.Button({
                              customData: {
                                key: "idBulto",
                                value: "{BultoSelectListModel>oBulto/idBulto}",
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
                                  return oItem.oBulto.idBulto === sId;
                                });
                                var sAux = JSON.stringify(aBultoList);
                                let sSelItem = JSON.stringify(
                                  aBultoList[iIndex]
                                );
                                MessageBox.confirm("Quitar bulto.", {
                                  title: "Confirmar eliminación",
                                  actions: ["SI", "NO"],
                                  initialFocus: "NO",
                                  onClose: async function (sAction) {
                                    if ("SI" == sAction) {
                                      let oAux = JSON.parse(sAux);

                                      aBultoList.splice(iIndex, 1);

                                      // Se vuelve a agrupar los bultos similares
                                      var oBultoGroupListModel = that.getModel(
                                        "BultoGroupListModel"
                                      );
                                      var aBultoGroupList = [];
                                      var aAuxGruop =
                                        oBultoGroupListModel.getProperty("/");
                                      var aReGroup = aBultoList.filter((oRe) =>
                                        aAuxGruop.find(
                                          (oIn) =>
                                            oRe.oInsumo.codigo ===
                                              oIn.oInsumo.codigo &&
                                            oRe.oInsumo.lote ===
                                              oIn.oInsumo.lote &&
                                            oRe.oBulto.sOperation ===
                                              oIn.oBulto.sOperation
                                        )
                                      );
                                      aReGroup.reduce(function (r, a) {
                                        var sKey =
                                          a.oInsumo.codigo +
                                          "-" +
                                          a.oInsumo.lote +
                                          "-" +
                                          a.oBulto.sOperation;

                                        if (!r[sKey]) {
                                          r[sKey] = jQuery.extend({}, a);
                                          r[sKey].oBulto.countB = 1;
                                          aBultoGroupList.push(r[sKey]);
                                        } else {
                                          r[sKey].oBulto.neto = that._weight(
                                            +r[sKey].oBulto.neto +
                                              +a.oBulto.neto
                                          );
                                          r[sKey].oBulto.countB += 1;
                                        }
                                        return r;
                                      }, {});
                                      //Se ordena según el pedido
                                      var aSortBultoList = aBultoGroupList.sort(
                                        (a, b) =>
                                          a.oOrden.ordenPos > b.oOrden.ordenPos
                                            ? 1
                                            : -1
                                      );

                                      oAux.splice(iIndex, 1);

                                      oBultoListModel.setProperty("/", oAux);
                                      oBultoGroupListModel.setProperty(
                                        "/",
                                        aSortBultoList
                                      );

                                      let aBulFilter = [];
                                      let sAuxSel = JSON.parse(sSelItem);
                                      for (let key in oAux) {
                                        let oItem = oAux[key];
                                        if (
                                          oItem.oInsumo.codigo ===
                                            sAuxSel.oInsumo.codigo &&
                                          oItem.oInsumo.lote ===
                                            sAuxSel.oInsumo.lote &&
                                          oItem.oBulto.sOperation ===
                                            sAuxSel.oBulto.sOperation &&
                                          oItem.oBulto.idBulto !== sId
                                        )
                                          aBulFilter.push(oItem);
                                      }
                                      that
                                        .getModel("BultoSelectListModel")
                                        .setProperty("/", aBulFilter);
                                      // that.oDefaultDialog.close();
                                    } else sap.ui.core.BusyIndicator.hide();
                                  },
                                });
                              },
                            }),
                            new sap.m.Button({
                              customData: {
                                key: "idBulto",
                                value: "{BultoSelectListModel>oBulto/idBulto}",
                              },
                              type: "Reject",
                              icon: "sap-icon://redo",
                              enabled: "{localModel>/UI/redo}",
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
                                  return oItem.oBulto.idBulto === sId;
                                });
                                var sOperation = that
                                  .getModel("localModel")
                                  .getProperty("/selectedAction")
                                  .split("-")[1];

                                var oItem = aBultoList[iIndex];
                                var sAux = JSON.stringify(aBultoList);
                                MessageBox.confirm(
                                  "Realizar la devolución de los bultos.",
                                  {
                                    title: "Confirmar devolución",
                                    actions: ["SI", "NO"],
                                    initialFocus: "NO",
                                    onClose: async function (sAction) {
                                      if ("SI" == sAction) {
                                        var oAuxDel = {
                                          Zid: sOperation,
                                          Usnam: oUser.usuario,
                                          ReempaqueItemSet: [
                                            {
                                              Zid: "",
                                              Pos: "",
                                              TypeTras: oItem.oBulto.Tipo,
                                              Status: oItem.oBulto.Status,
                                              Aufnr: oItem.oOrden.Aufnr,
                                              Exidv: oItem.oBulto.idBulto,
                                              Werks: oItem.oInsumo.centro,
                                              Matnr: oItem.oInsumo.codigo,
                                              Charg: oItem.oInsumo.lote,
                                              Menge: oItem.oBulto.neto,
                                              Meins: oItem.oBulto.Umed,
                                              Fraccion:
                                                oItem.oBulto.Fraccion.toString(),
                                              Subfraccion:
                                                oItem.oBulto.Subfraccion.toString(),
                                            },
                                          ],
                                          ReempaqueMensajeSet: [],
                                        };

                                        var oRes = await that
                                          .oDataCreateDinamic(
                                            goModelSapErp,
                                            "ReempaqueHeadSet",
                                            oAuxDel
                                          )
                                          .catch((oError) => {
                                            sap.ui.core.BusyIndicator.hide();
                                            console.log(oError);
                                          });

                                        if (
                                          oRes.ReempaqueMensajeSet.results
                                            .length > 0 &&
                                          oRes.ReempaqueMensajeSet.results.find(
                                            (oItem) => oItem.Type === "E"
                                          )
                                        )
                                          MessageBox.error(
                                            `Error al devolver el insumo. ${oRes.ReempaqueMensajeSet.results[0].Message}`
                                          );
                                        else {
                                          let oAux = JSON.parse(sAux);

                                          aBultoList.splice(iIndex, 1);
                                          oAux.splice(iIndex, 1);

                                          // Se vuelve a agrupar los bultos similares
                                          var oBultoGroupListModel =
                                            that.getModel(
                                              "BultoGroupListModel"
                                            );
                                          var aBultoGroupList = [];
                                          aBultoList.reduce(function (r, a) {
                                            var sKey =
                                              a.oInsumo.codigo +
                                              "-" +
                                              a.oInsumo.lote +
                                              "-" +
                                              a.oBulto.sOperation;

                                            if (!r[sKey]) {
                                              r[sKey] = jQuery.extend({}, a);
                                              r[sKey].oBulto.countB = 1;
                                              aBultoGroupList.push(r[sKey]);
                                            } else {
                                              r[sKey].oBulto.neto =
                                                that._weight(
                                                  +r[sKey].oBulto.neto +
                                                    +a.oBulto.neto
                                                );
                                              r[sKey].oBulto.countB += 1;
                                            }
                                            return r;
                                          }, {});

                                          let msg = "";

                                          oRes.ReempaqueMensajeSet.results.forEach(
                                            (oItem) => {
                                              msg += oItem.Message + ",";
                                            }
                                          );

                                          MessageBox.success(msg);

                                          that.addListPopover({
                                            type: "Success", // ["Error", "Warning", "Success", "Information"]
                                            title: "Devolución",
                                            description: "<p>" + msg + "</p>",
                                            subtitle: "",
                                          });

                                          //Se ordena según el pedido
                                          var aSortBultoList =
                                            aBultoGroupList.sort((a, b) =>
                                              a.oOrden.ordenPos >
                                              b.oOrden.ordenPos
                                                ? 1
                                                : -1
                                            );

                                          oBultoListModel.setProperty(
                                            "/",
                                            oAux
                                          );
                                          oBultoGroupListModel.setProperty(
                                            "/",
                                            aSortBultoList
                                          );

                                          that.oDefaultDialog.close();
                                          that._valEstadoDevolver();
                                        }
                                      } else sap.ui.core.BusyIndicator.hide();
                                    },
                                  }
                                );
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
              oUrlParameters = {};
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
              oDataService
                .oDataRead(
                  goModelSapErp,
                  "AtendidoItemSet",
                  oUrlParameters,
                  aFilter
                )
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                })
                .then((oRes) => {
                  let aResp = oRes.results;
                  if (aResp && aResp.length) {
                    var oBulto = null;
                    for (var key in aResp) {
                      if (aResp[key].Tipo === "IDEN_PROD") {
                        aFilter = [];
                        var Pedido = aResp[key].Pedido,
                          Orden = aResp[key].Orden,
                          Fraccion = aResp[key].Fraccion;
                        if (Pedido)
                          aFilter.push(new Filter("Pedido", EQ, Pedido));
                        if (Orden) aFilter.push(new Filter("Orden", EQ, Orden));
                        if (Fraccion) {
                          aFilter.push(new Filter("Fraccion", EQ, Fraccion));
                          oLocalModel.setProperty(
                            "/iFraccion",
                            Number.parseInt(Fraccion)
                          );
                        }

                        aFilter.push(new Filter("Tipo", EQ, "ENTERO"));
                        aFilter.push(new Filter("Tipo", EQ, "FRACCION"));
                        aFilter.push(new Filter("Tipo", EQ, "SALDO_FRAC_ALM"));
                        aFilter.push(new Filter("Tipo", EQ, "SALDO_ALM"));
                        aFilter.push(new Filter("Tipo", EQ, "ENTERO_ALM"));
                        aFilter.push(new Filter("Status", EQ, "X"));

                        oLocalModel.setProperty("/aFiltersERP", aFilter);

                        return oDataService
                          .oDataRead(
                            goModelSapErp,
                            "AtendidoItemSet",
                            oUrlParameters,
                            aFilter
                          )
                          .catch((oError) => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error("Error al recuperar los bultos.");
                            console.log(oError);
                          });
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
                    sap.ui.core.BusyIndicator.hide();
                    throw oThrowError;
                  }
                })
                .then((oRes) => {
                  let aResp = oRes.results;
                  that.aBultoTras = null;
                  aFilter = [];
                  var aBultoTras = [];
                  var sMessage = "";

                  if (aResp && aResp.length > 0) {
                    aResp = aResp.filter((o) => {
                      return o.IdBulto != "";
                    });
                    var unique = [];

                    // Ordenar las líneas por código de material
                    aResp.sort((a, b) =>
                      a.CodigoInsumo > b.CodigoInsumo ? 1 : -1
                    );

                    var oBulto = aResp[0];

                    that.oEtiqueta = oBulto;

                    aResp.forEach((oItem) => {
                      var Pedido = oItem.Pedido;
                      var Orden = oItem.Orden;
                      var Etiqueta = oItem.Etiqueta;

                      if (Pedido) {
                        let oFilterPedido = new Filter(
                          "pedidoNumero",
                          EQ,
                          Pedido
                        );
                        oLocalModel.setProperty(
                          "/oPedidoFilter",
                          JSON.stringify(oFilterPedido)
                        );
                        aFilter.push(oFilterPedido);
                      }
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

                    //Se eliminan filtros repetidos
                    unique = aFilter.filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (t) =>
                            t.sPath === value.sPath &&
                            t.oValue1 === value.oValue1
                        )
                    );

                    that.aBultoTras = aBultoTras;

                    /**
                     * OBTENER DATOS DE PEDIDO, ORDEN, INSUMO
                     */
                    return oDataService
                      .oDataRead(
                        oModel,
                        "VIEW_PEDIDO_CONSOLIDADO",
                        oUrlParameters,
                        unique
                      )
                      .catch((oError) => {
                        sap.ui.core.BusyIndicator.hide();
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
                    sap.ui.core.BusyIndicator.hide();
                    throw oThrowError;
                  }
                })
                .then(async (aPedidoResp) => {
                  var aPedFilter = aPedidoResp.results;
                  var aBultoTras = that.aBultoTras;
                  var aBultoList = oBultoListModel.getProperty("/");
                  var oFormData = {};
                  if (aPedFilter && aPedFilter.length > 0) {
                    for (var key in aBultoTras) {
                      var oBulto = aBultoTras[key],
                        iLenght = aBultoTras.length;

                      var Pedido = oBulto.Pedido;
                      var Orden = oBulto.Orden;
                      var CodigoInsumo = oBulto.CodigoInsumo;
                      var Lote = oBulto.Lote;
                      var Fraccion = Number.parseInt(oBulto.Fraccion);
                      var Subfraccion = Number.parseInt(oBulto.Subfraccion);

                      var oPedido = aPedFilter.find(
                        (o) =>
                          o.pedidoNumero === Pedido &&
                          o.ordenNumero === Orden &&
                          o.insumoCodigo === CodigoInsumo &&
                          o.insumoLote === Lote &&
                          o.numFraccion === Fraccion &&
                          o.numSubFraccion === Subfraccion
                      );

                      if (oPedido) {
                        //Estados nivel ORDEN:  [PAOATEN, PAOPEFI, AMOATEN, AMOPEFI].oPedido.ordenEstado
                        var aEstadoOrdenVal = [
                          "PAOATEN",
                          "PAOPEFI",
                          "AMOATEN",
                          "AMOPEFI",
                          "PAOPARC",
                          "AMOPARC",
                          "PAOTOT",
                          "AMOTOT",
                          "PAOENFI",
                        ];

                        if (
                          aEstadoOrdenVal.includes(oPedido.ordenEstado) ||
                          ["X"].includes(oBulto.FlagVerif)
                        ) {
                          if (["V"].includes(oPedido.ordenVerificacionEstado)) {
                            // Validar las operaciones permitidas para cada bulto
                            var oOperation = that._validateOperation(oBulto);
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
                                  ordenFraccionId: oPedido.ordenFraccionId,
                                  ordenPos: Number.parseInt(oPedido.ordenPos),
                                },
                                oInsumo: {
                                  ordenDetalleId: oPedido.ordenDetalleId,
                                  codigo: oPedido.insumoCodigo,
                                  lote: oPedido.insumoLote,
                                  numFraccion: oPedido.numFraccion,
                                  numSubFraccion: oPedido.numSubFraccion,
                                  estado: oPedido.insumoEstado,
                                  descripcion: oPedido.insumoDescrip,
                                  fechaVencimiento:
                                    oPedido.insumoFechaVencimiento,
                                  pesadoMaterialPr:
                                    oPedido.insumoPesadoMaterialPr,
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
                                  Fraccion: Number.parseInt(oBulto.Fraccion),
                                  Subfraccion: Number.parseInt(
                                    oBulto.Subfraccion
                                  ),
                                  StatusP: oBulto.StatusP,
                                  VerificacionRmd: oBulto.VerificacionRmd,
                                },
                              };

                              aBultoList.push(oFormData);
                            } else {
                              if (oBulto.Status == "C") {
                                /**
                                 * C = PENDIENTE TRASLADO
                                 */

                                var aMessage = [];
                                var aBultoTrasC = aBultoTras.filter((o) => {
                                  return o.Status == "C";
                                });

                                aBultoTrasC.forEach((o) => {
                                  aMessage.push(
                                    `${o.CodigoInsumo} - ${o.Lote} : HU ${o.IdBulto}`
                                  );
                                });

                                sMsg =
                                  "Existen bultos que aún no han sido trasladados: \n" +
                                  aMessage.join(", \n");
                              } else {
                                sMsg = that._getI18nText("E000304");
                              }

                              that.addListPopover({
                                type: "Error", // ["Error", "Warning", "Success", "Information"]
                                title: "Operación.",
                                description: "<p>" + sMsg + "</p>",
                                subtitle: oBulto.Etiqueta,
                              });
                              oLocalModel.setProperty("/UI/confirm", false);
                              MessageBox.error(sMsg);
                              sap.ui.core.BusyIndicator.hide();
                              return;
                            }
                          } else {
                            var sMessageEspec = `\n Pedido: ${oPedido.pedidoNumero} \n Orden: ${oPedido.ordenNumero} - Fraccion: ${oPedido.numFraccion}`;

                            sMsg = that._getI18nText("E000306") + sMessageEspec;
                            that.addListPopover({
                              type: "Error", // ["Error", "Warning", "Success", "Information"]
                              title: "Etiqueta observada.",
                              description: "<p>" + sMsg + "</p>",
                              subtitle: oBulto.Etiqueta,
                            });
                            oLocalModel.setProperty("/UI/confirm", false);
                            MessageBox.error(sMsg);
                            sap.ui.core.BusyIndicator.hide();
                            return;
                          }
                        } else {
                          if (key == iLenght - 1) {
                            sMsg = that._getI18nText("E000105");
                            that.addListPopover({
                              type: "Error", // ["Error", "Warning", "Success", "Information"]
                              title: "Etiqueta observada.",
                              description: "<p>" + sMsg + "</p>",
                              subtitle: oBulto.Etiqueta,
                            });
                            MessageBox.show(sMsg);
                            sap.ui.core.BusyIndicator.hide();
                          }
                        }
                      } else {
                        sMsg = "Insumo no encontrado.";
                        MessageToast.show(sMsg);
                        that.addListPopover({
                          type: "Error", // ["Error", "Warning", "Success", "Information"]
                          title: "Insumo observada.",
                          description: "<p>" + sMsg + "</p>",
                          subtitle: oBulto.Etiqueta,
                        });
                        sap.ui.core.BusyIndicator.hide();
                      }
                    }

                    /**
                     * AGRUPAR BULTOS POR CODIGO Y LOTE
                     */
                    var aBultoGroupList = [];
                    var aStateValidate = [];
                    var aBultosListAux = JSON.stringify(aBultoList);

                    // Se remueven operaciones repetidas
                    var aList = oLocalModel.getProperty("/list"),
                      aUniqList = [];

                    aList.map((x) =>
                      aUniqList.filter((a) => a.key == x.key).length > 0
                        ? null
                        : aUniqList.push(x)
                    );
                    oLocalModel.setProperty("/list", aUniqList);

                    var aGroup = [],
                      aAux = [];
                    aBultoList.reduce(function (r, a) {
                      var sKey =
                        a.oInsumo.codigo +
                        "-" +
                        a.oInsumo.lote +
                        "-" +
                        a.oBulto.sOperation;

                      if (!r[sKey]) {
                        aAux = [];
                        r[sKey] = jQuery.extend({}, a);
                        if (
                          !that._validateState(
                            r[sKey].oBulto.Status,
                            r[sKey].oBulto.sOperation.split("-")[1]
                          )
                        ) {
                          r[sKey].oBulto.countB = 1;
                          r[sKey].aContent = [Object.assign({}, a)];
                          aBultoGroupList.push(r[sKey]);
                          aAux.push(r[sKey]);
                          aGroup.push(aAux);
                        }
                      } else {
                        if (
                          !that._validateState(
                            r[sKey].oBulto.Status,
                            r[sKey].oBulto.sOperation.split("-")[1]
                          )
                        ) {
                          r[sKey].aContent.push(Object.assign({}, a));

                          r[sKey].oBulto.neto = that._weight(
                            +r[sKey].oBulto.neto + +a.oBulto.neto
                          );
                          r[sKey].oBulto.countB += 1;
                          aAux.push(r[sKey]);
                        }
                      }

                      return r;
                    }, {});

                    //Se ordena según el pedido
                    var aSortBultoList = aBultoGroupList.sort((a, b) =>
                      a.oOrden.ordenPos > b.oOrden.ordenPos ? 1 : -1
                    );

                    oBultoListModel.setProperty(
                      "/",
                      JSON.parse(aBultosListAux)
                    );
                    oBultoGroupListModel.setProperty("/", aSortBultoList);
                    oLocalModel.setProperty("/aGroup", aGroup);
                    oLocalModel.setProperty(
                      "/aGroupAll",
                      JSON.stringify(aBultoGroupList)
                    );

                    that
                      .getModel("FormVerificationModel")
                      .setProperty("/", oFormData);
                    sap.ui.core.BusyIndicator.hide();
                  } else {
                    sMsg = that._getI18nText("W000111");
                    MessageToast.show(sMsg);
                    oThrowError = {
                      code: "E",
                      title: "No se encontraron registros de insumos.",
                      description: sMsg,
                    };
                    sap.ui.core.BusyIndicator.hide();
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
                  sap.ui.core.BusyIndicator.hide();
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
              sap.ui.core.BusyIndicator.hide();
            }
          }
        },

        _validateOperation(oBulto) {
          var oLocalModel = this.getModel("localModel"),
            aList = oLocalModel.getProperty("/list"),
            oOperations = {},
            sTipo = oBulto.Tipo,
            sEstado = oBulto.Status;

          var aGrpTipo1 = [
            "ENTERO",
            "SALDO_FRAC_ALM",
            "SALDO_ALM",
            "ENTERO_ALM",
          ];
          var aGrpTipo2 = [
            "ENTERO",
            "SALDO_FRAC_ALM",
            "SALDO_ALM",
            "ENTERO_ALM",
            "FRACCION",
          ];

          /**
           * -----------------------------------------
           *                 OPERACIONES
           * -----------------------------------------
           *
           * PASO 1: ENVIO A PRODUCCION (EPRO)
           * Si estado es '' o 'T' y pasa al estado 'M'
           *
           * PASO 2: RECEPCION DE PRODUCCION (RPRO)
           * Si estado es 'M' y pasa al estado 'F'
           *
           * PASO 3: ENVIO A ALMACEN (EALM) (Alm. CP01) (Mov 313)
           * Si estado es 'F' y pasa al estado 'W'
           *
           * PASO 4: RECEPCION DE ALMACEN (RALM) (Mov 315)
           * Si estado es 'W' y pasa al estado 'O'
           *
           */

          if ("FRACCION" === sTipo && sEstado === "")
            oOperations = {
              key: "EPRO-1",
              name: this._getI18nText("itemEPRO"),
            };
          else if (aGrpTipo1.includes(sTipo) && sEstado === "T")
            oOperations = {
              key: "EPRO-1",
              name: this._getI18nText("itemEPRO"),
            };
          else if (aGrpTipo2.includes(sTipo) && sEstado === "M")
            oOperations = {
              key: "RPRO-2",
              name: this._getI18nText("itemRPRO"),
            };
          else if (aGrpTipo2.includes(sTipo) && sEstado === "F")
            oOperations = {
              key: "EALM-3",
              name: this._getI18nText("itemEALM"),
            };
          else if (aGrpTipo2.includes(sTipo) && sEstado === "W")
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

        _setValueScan: function (sValue) {
          var oStandardModel = this.getView().getModel("StandardModel");
          oStandardModel.setProperty("/oQR/oBulto/text", sValue);
          oStandardModel.refresh();
          this._searchEtiqueta();
        },
        /**-----------------------------------------------*/
        /*              C O N S T A N T S
        /**-----------------------------------------------*/
      }
    );
  }
);
