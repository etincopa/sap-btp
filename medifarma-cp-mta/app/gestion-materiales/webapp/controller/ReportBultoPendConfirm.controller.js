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
    "../service/oDataService",
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
    oDataService
  ) {
    "use strict";
    var goBusyDialog = new sap.m.BusyDialog();
    var self = null,
      goModel = null,
      goModelSapErp = null,
      goOwnerComponent = null,
      goRole = null,
      goAccion = null,
      goDataSrv = oDataService;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.ReportBultoPendConfirm",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: function () {
          self = this;
          self.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          self.oRouter
            .getTarget("ReportBultoPendConfirm")
            .attachDisplay(jQuery.proxy(self._handleRouteMatched, this));
        },
        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},
        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/
        _handleRouteMatched: function (oEvent) {
          var that = this;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          goModelSapErp.setHeaders({
            "sap-language": "ES",
          });

          try {
            goAccion = that._getAcctions("IFA");
            if (!goAccion) {
              that._navTo("Inicio", null);
              return;
            }
            that._initModels(that);
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
                    oStandardModel.setProperty("/oQR/oBulto", oQRscan);
                  }
                  that._searchEtiqueta();
                }
              },
              this._onScanError,
              oOptions
            );
          } catch (oError) {}
        },

        onQRSearch(oEvent, sType) {
          var that = this;
          var sCode = oEvent ? oEvent.getParameter("query") : null;
          if (sCode) {
            that._searchEtiqueta();
          } else {
            that._getBultoData(null);
          }
        },

        onConfirm: function (oEvent, sKey) {
          var oAction = goAccion;
          if (!oAction.ifaFullControl) {
            if (!oAction.ifaConfirm)
              return MessageToast.show(
                "No tiene permisos suficientes para realizar esta acción."
              );
          }

          var oModel = goModel;
          var that = this;
          var oView = that.getView();
          //oEvent.getSource().getBindingContext("BultoListModel").getPath()
          //var oObjects = oEvent.getSource().getBindingContext("BultoListModel").getObject();

          MessageBox.confirm(that._getI18nText("I000011"), {
            title: "Confirmar",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                var aConstant = oView.getModel("ConstantModel").getData();
                var aConstantKey = that._groupConstant(
                  aConstant["ESTADO_PESAJE"]
                );
                var iMaestraId = aConstantKey["CONFIRM"].iMaestraId; //Pendiente de Ajuste

                var oEntity = that._buildGrupoOrdenBulto(
                  oModel,
                  sKey,
                  iMaestraId,
                  "CONFIRM"
                );

                sap.ui.core.BusyIndicator.show(0);
                oDataService
                  .oDataUpdate(oModel, oEntity.sKeyEntity, oEntity.oEntityData)
                  .then(
                    (oResult) => {
                      sap.ui.core.BusyIndicator.hide();
                      MessageBox.success(that._getI18nText("S000010"));
                      that._getBultoData(null);
                    },
                    function (oError) {
                      sap.ui.core.BusyIndicator.hide();
                      console.log(oError);
                    }
                  );
              } else sap.ui.core.BusyIndicator.hide();
            },
          });

          //var oTable = that.getView().byId("idBultoTable");
          //var sPath = oTable.getContextByIndex(0).getPath();
          //var oObjects = oTable.getModel("BultoListModel").getContext(sPath).getObject();
        },
        onReset: function (oEvent, oItem) {
          var oAction = goAccion;
          if (!oAction.ifaFullControl) {
            if (!oAction.ifaReset)
              return MessageToast.show(
                "No tiene permisos suficientes para realizar esta acción."
              );
          }

          var oModel = goModel;
          var that = this;

          MessageBox.confirm(that._getI18nText("I000011"), {
            title: "Resetear",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                that._updateGrupoOrdenBulto(oModel, oItem, null, "RESET");
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/

        _initModels: function (that) {
          that._getConstant(that, goModel);
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that
            .getView()
            .getModel("StandardModel")
            .setProperty("/oQR", {
              oBulto: {
                text: "",
              },
            });

          that._getBultoData(null);
        },
        _searchEtiqueta: function () {
          var that = this;
          var oView = that.getView();
          var sText = "";
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");

          sText = oQR.oBulto.text;
          that._getBultoData(sText);
        },

        _getBultoData: function (sCode) {
          var that = this;
          var oView = that.getView();
          var oModel = goModel;

          if (!oModel) {
            oModel = oView.getModel();
          }

          var Contains = FilterOperator.Contains;
          var EQ = FilterOperator.EQ;
          var aFilters = [];
          if (sCode) {
            aFilters.push(
              //OR
              new Filter(
                [
                  new Filter("B_etiqueta", EQ, sCode), //Bulto (QR)
                  new Filter("O_numero", Contains, sCode), //Num Orden
                  new Filter("O_lote", Contains, sCode), //Lote Producto
                  new Filter("I_codigo", Contains, sCode), //Insumo
                  new Filter("I_lote", Contains, sCode), //Lote Insumo
                ],
                false /*bAnd*/
              )
            );
          }

          aFilters.push(
            //AND
            new Filter(
              [
                new Filter("B_neto", FilterOperator.NE, null),
                new Filter("B_neto", FilterOperator.GT, 0),
              ],
              true /*bAnd*/
            )
          );
          aFilters.push(new Filter("B_tipo", EQ, "IFA")); //Tipo Bulto

          that
            ._getODataDinamic(
              oModel,
              "GRUPO_ORDEN_BULTO_DET",
              null,
              aFilters,
              null
            )
            .then(
              (aResult) => {
                this.getView().setModel(
                  new JSONModel(aResult),
                  "BultoListModel"
                );
                if (aResult) {
                } else {
                  MessageToast.show(that._getI18nText("W000111"));
                }
              },
              function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
              }
            );
        },
        _updateGrupoOrdenBulto: function (oModel, oItem, iMaestraId, sAction) {
          var that = this;
          var oItem = oItem;
          var sAction = sAction;
          var sGrupoOrdenBultoId = oItem.grupoOrdenBultoId;
          var oEntity = that._buildGrupoOrdenBulto(
            oModel,
            sGrupoOrdenBultoId,
            iMaestraId,
            sAction
          );

          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataUpdate(oModel, oEntity.sKeyEntity, oEntity.oEntityData)
            .then(
              (oResult) => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.success(that._getI18nText("S000010"));
                if (sAction == "RESET") {
                  that._deleteGrupoOrdenBultoAfterReset(
                    oModel,
                    sGrupoOrdenBultoId
                  );
                }
                that._getBultoData(null);
              },
              function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
              }
            );
        },
        _buildGrupoOrdenBulto: function (
          oModel,
          sGrupoOrdenBultoId,
          iMaestraId,
          sAction
        ) {
          var that = this;
          var oUser = that._getUser();

          var oEntity = {};
          if (sAction && sAction == "RESET") {
            oEntity = {
              neto: "0",
              tara: "0",
              bSaldo: null,
              //oRolPesaje_rolId: goRole.rolId,
              oEstadoPesaje_iMaestraId: iMaestraId,
            };
          } else {
            oEntity = {
              oEstadoPesaje_iMaestraId: iMaestraId,
            };
          }

          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };

          var sEntity = "/GRUPO_ORDEN_BULTO";
          var sKeyEntity = oModel.createKey(sEntity, {
            grupoOrdenBultoId: sGrupoOrdenBultoId,
          });

          var oEntityData = { ...oEntity, ...oAuditStruct };

          return {
            oEntityData: oEntityData,
            sKeyEntity: sKeyEntity,
            sEntity: sEntity,
          };
        },

        _deleteGrupoOrdenBultoAfterReset: function (
          oModel,
          sGrupoOrdenBultoId
        ) {
          /**
           * Eliminar los Bultos saldos creados apartir del bulto IFA
           */
          var that = this;
          var sLogin = "fnResetBultoIFA";
          var urlParameters = {
            grupoOrdenBultoId: sGrupoOrdenBultoId,
          };
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(oModel, sLogin, urlParameters, null)
            .then((oData) => {
              sap.ui.core.BusyIndicator.hide();
              var aResult = oData.results;
              if(!aResult && oData.fnResetBultoIFA) {
                aResult = oData.fnResetBultoIFA.results;
              }
              if (aResult && aResult.length > 0) {
                if (aResult[0].bStatus) {
                  MessageToast.show(aResult[0].sMessage);
                } else {
                  if (aResult[0].oError) {
                    MessageBox.error(aResult[0].oError);
                  } else {
                    MessageBox.error(aResult[0].sMessage);
                  }
                }
              } else {
                MessageBox.error(that._getI18nText("E000400"));
              }
            })
            .catch(function (oError) {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        },

        _getUser: function () {
          var UserRoleModel = JSON.parse(
            window.localStorage.getItem("UserRoleModel")
          );
          var oUser = UserRoleModel.oUser.oUser;

          return oUser;
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
                text: "Cancel",
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
                text: "Cancel",
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
          var oModel = oModel;
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
