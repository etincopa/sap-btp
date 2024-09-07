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
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.ImpreBultoSaldo",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: function () {
          self = this;
          self.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          self.oRouter
            .getTarget("ImpreBultoSaldo")
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
            goAccion = that._getAcctions("SAL");
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
                  that._searchEtiqueta(sType);
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
          if (sCode) that._searchEtiqueta(sType);
        },

        onLiveChangePeso: function (oEvent) {
          //var sNewValue = oEvent.getParameter("value");
          this._calculatePeso();
        },

        onPrint: function (oEvent) {
          var that = this;
          var oView = that.getView();
          var oBulto = oView.getModel("OrdenBultoDetModel").getData();
          //var oFormData = oView.getModel("FormVerificationModel").getData();
          //var oBulto = oFormData.oBulto;
          if (oBulto && oBulto.B_tipo == "SAL") {
            that._sendPrint(oBulto.grupoOrdenBultoId);
          }
        },
        _sendPrint: function (sGrupoOrdenBultoId) {
          var that = this;
          var oUser = that._getUserLogin();
          var oConfig = JSON.parse(window.localStorage.getItem("configLocal"));

          if (oConfig && oConfig.oGeneral) {
            var sEntity = "fnSendPrintBulto";
            var urlParameters = {
              impresoraId: oConfig.oGeneral.impresora,
              etiqueta: "", //Si es IFA enviar codigo Etiqueta
              usuario: oUser.usuario,
              bSaldo: "X", // Si es Saldo marcar en X
              tipo: "CP",
              idBulto: sGrupoOrdenBultoId // Si es saldo enviar el IdBulto
            };
            sap.ui.core.BusyIndicator.show(0);
            MessageToast.show("Enviado a la impresora, por favor espere ...");
            oDataService
              .oDataRead(goModel, sEntity, urlParameters, null)
              .then((oData) => {
                sap.ui.core.BusyIndicator.hide();
                var aResult = oData.results;
                if (!aResult && oData.fnSendPrintBulto) {
                  aResult = oData.fnSendPrintBulto.results;
                }
                if (aResult && aResult.length > 0) {
                  var oResult = aResult[0];
                  if (oResult.oError) {
                    MessageBox.error(oResult.oError);
                  } else {
                    MessageBox.information(oResult.sMessage);
                  }
                }
              })
              .catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
              })
              .finally(function () {
                // sap.ui.core.BusyIndicator.hide();
              });
          }
        },

        onSave: function (oEvent) {
          var oModel = goModel;
          var oModelSapErp = goModelSapErp;
          var that = this;
          var oView = that.getView();
          var aConstant = oView.getModel("ConstantModel").getData();
          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var oInsumo = oFormData.oInsumo;

          if (oPeso.neto <= 0) {
            return MessageBox.error(that._getI18nText("E000100"));
          }

          var aConstantKey = that._groupConstant(aConstant["TIPO_BULTO"]);
          var iMaestraId = aConstantKey["SAL"].iMaestraId; //Tipo de bulto: SALDO

          if (oPeso.ajuste) {
            if (oPeso.ajusteAuto) {
              MessageBox.warning(that._getI18nText("W000302"));

              var iCalDif = +oInsumo.stockAlmPiso - +oPeso.neto;
              var iStock = that._coin(iCalDif < 0 ? iCalDif * -1 : iCalDif);
              var sNow = formatter.getTimestampToYMD(new Date());
              var sEntity = "TrasladoMobileSet";
              var oBody = {
                Mblnr: "",
                Mjahr: "",
                Zflag: oPeso.ajusteEnMas ? "5" : "4",
                Bldat: sNow + "T00:00:00.0000000",
                Budat: sNow + "T00:00:00.0000000",
                Usnam: "",
                Bwart: "",
                Matnr: oInsumo.codigo,
                Werks: oInsumo.centro,
                Lgort: oInsumo.almacen,
                Charg: oInsumo.lote,
                Erfmg: iStock,
                Umwrk: "",
                Umlgo: "",
                Kostl: "",
              };

              oDataService
                .oDataCreate(oModelSapErp, sEntity, oBody)
                .then(function (oResult) {
                  sap.ui.core.BusyIndicator.hide();

                  if (oResult.data) {
                    var oResp = oResult.data;
                    var sDocMaterial = oResp.Mblnr + ":" + oResp.Mjahr; //Doc Material + Periodo Material

                    if (["S", "W"].includes(oResp.Type)) {
                      MessageBox.information(oResp.Message);
                      //Actualizar Bulto
                      that._createGrupoOrdenBulto(
                        oModel,
                        iMaestraId,
                        "CONFIRM"
                      );

                      //Actualizar ORDEN_DETALLE Insumo + Doc material
                      that._updateInsumo(oModel, sDocMaterial);
                    } else {
                      MessageBox.error(oResp.Message);
                    }

                    //oResp.TrasladoItemSet.results
                  }
                })
                .catch(function (oError) {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                })
                .finally(function () {
                  // sap.ui.core.BusyIndicator.hide();
                });
            } else {
              MessageBox.warning(that._getI18nText("W000303"));
              that._createGrupoOrdenBulto(oModel, iMaestraId, "PENDAJU");
              that._updateInsumo(oModel, "");
            }
          } else {
            that._createGrupoOrdenBulto(oModel, iMaestraId, "CONFIRM");
          }
        },
        _createGrupoOrdenBulto: function (oModel, iMaestraId, sAction) {
          var that = this;
          var oEntity = that._buildGrupoOrdenBulto(oModel, iMaestraId, sAction);

          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataCreate(oModel, oEntity.sEntity, oEntity.oEntityData)
            .then((result) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.success(that._getI18nText("S000010"));
              MessageBox.confirm("Etiqueta: " + oResult[0].B_etiqueta, {
                title: "Imprimir Bulto",
                actions: ["SI", "NO"],
                initialFocus: "NO",
                onClose: async function (sAction) {
                  if ("SI" == sAction) {
                    that._sendPrint(oResp.grupoOrdenBultoId);
                  } else sap.ui.core.BusyIndicator.hide();
                },
              });
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al crear el Bulto Saldo");
            })
            .finally((oFinal) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },
        _updateInsumo: function (oModel, sDocument) {
          var that = this;
          var oView = that.getView();
          var oEntity = that._buildInsumo(oModel, sDocument);
          var sAction = sAction;
          var oModel = oModel;

          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataUpdate(oModel, oEntity.sKeyEntity, oEntity.oEntityData)
            .then(
              (oResult) => {
                sap.ui.core.BusyIndicator.hide();
                if (sDocument) {
                  MessageBox.success(
                    "Documento de Material registrado: " + sDocument
                  );
                }
              },
              function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
              }
            );
        },
        _buildInsumo: function (oModel, sDocument) {
          var oUser = that._getUserLogin();
          var that = this;
          var oView = that.getView();
          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();
          var oPeso = oFormData.oPeso;
          var oInsumo = oFormData.oInsumo;

          var iStockAlmacenPiso = that._coin(
            +oInsumo.stockAlmPiso - +oInsumo.cantidadActual + +oPeso.neto
          );
          var oEntity = {
            docMaterial: sDocument,
            ajuste: sDocument ? "" : "X",
            stockLibrUtilReal: iStockAlmacenPiso,
          };
          if (sDocument) {
            oEntity.stockLibrUtil = iStockAlmacenPiso;
          }

          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };

          var sEntity = "/ORDEN_DETALLE";
          var sKeyEntity = oModel.createKey(sEntity, {
            ordenDetalleId: oBultoQR.ordenDetalleId,
          });

          var oEntityData = { ...oEntity, ...oAuditStruct };

          return {
            oEntityData: oEntityData,
            sKeyEntity: sKeyEntity,
            sEntity: sEntity,
          };
        },
        _getUserLogin: function () {
          var UserRoleModel = JSON.parse(
            window.localStorage.getItem("UserRoleModel")
          );
          var oUser = UserRoleModel.oUser.oUser;
          return oUser;
        },
        _buildAudit: function (that, sDml) {
          var that = that;
          var oUser = that._getUserLogin();
          var oAudit = {};
          if (sDml == "C") {
            oAudit = {
              /*--- auditoriaBase ---*/
              terminal: "",
              fechaRegistro: new Date(),
              usuarioRegistro: oUser.usuario,
              activo: true,
            };
          } else if (sDml == "U") {
            oAudit = {
              /*--- auditoriaBase ---*/
              usuarioActualiza: oUser.usuario,
              fechaActualiza: new Date(),
            };
          }

          //oAudit.dml = sDml;

          return oAudit;
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

        _initModels: function (that) {
          that._getConstant(that, goModel);
          that.getView().setModel(
            new JSONModel({
              oOrden: {},
              oInsumo: {},
              oBulto: {},
              oPeso: {},
              oAction: that._showButtons(
                false /*edit*/,
                false /*print*/,
                false /*save*/
              ),
            }),
            "FormVerificationModel"
          );

          that.getView().setModel(new JSONModel({}), "OrdenBultoDetModel");
          that.getView().setModel(new JSONModel([]), "GrupoOrdenBultoDetModel");
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that
            .getView()
            .getModel("StandardModel")
            .setProperty("/oQR", {
              oBulto: {
                text: "PPPP",
              },
            });
        },
        _searchEtiqueta: function (sType) {
          var that = this;
          var oView = that.getView();
          var sText = "";
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");

          if (sType == "IFA") {
            sText = oQR.oBulto.text;
            that._searchReset(false);
            that._getBultoData(sText);
          }
        },

        _getBultoData: function (sCode) {
          var that = this;
          var oView = that.getView();
          var oModel = goModel;

          if (!oModel) {
            oModel = oView.getModel();
          }

          oView.getModel("GrupoOrdenBultoDetModel").setData([]);
          oView.getModel("OrdenBultoDetModel").setData({});

          var aFilters = [];
          aFilters.push(new Filter("B_etiqueta", FilterOperator.EQ, sCode)); //Bulto

          that
            ._getODataDinamic(
              oModel,
              "GRUPO_ORDEN_BULTO_DET",
              null,
              aFilters,
              null
            )
            .then(
              function (aResult) {
                if (aResult) {
                  that._searchReset(true);

                  var oResult = null;
                  for (var key in aResult) {
                    oResult = aResult[key];
                    var sTipo = oResult.B_tipo;
                    if (
                      [
                        /*Tipo de bulto:*/
                        "IFA" /*Butlo IFA*/,
                        "SAL" /*Butlo Saldo*/,
                      ].includes(sTipo)
                    ) {
                      break;
                    }

                    oResult = null;
                  }

                  if (oResult) {
                    if (oResult.B_tipo == "IFA") {
                      if (!oResult.B_neto || oResult.B_neto <= 0) {
                        return MessageToast.show(
                          "El bulto aun no fue pesado como IFA"
                        );
                      } else if (oResult.I_agotar && oResult.I_agotar == "X") {
                        return MessageToast.show(
                          "Este bulto no puede generar Saldo, se requiere agotar"
                        );
                      } else if (oResult.I_ajuste && oResult.I_ajuste == "X") {
                        return MessageToast.show(
                          "Este bulto tiene pendiente de realizar un Ajuste"
                        );
                      }
                      //return MessageToast.show(that._getI18nText("W000112"));
                    }
                    var oFormData = {
                      oOrden: {
                        ordenId: oResult.ordenId,
                        estado: oResult.O_estado,
                        tipo: oResult.O_tipo,
                        numero: oResult.O_numero,
                        lote: oResult.O_lote,
                        descProd: oResult.P_nombre,
                      },
                      oInsumo: {
                        codigo: oResult.I_codigo,
                        lote: oResult.I_lote,
                        estado: oResult.I_estado,
                        descripcion: oResult.I_descripcion,
                        fechaVencimiento: oResult.I_fechaVencimiento,
                        pesadoMaterialPr: oResult.I_pesadoMaterialPr,
                        agotar: oResult.I_agotar,
                        ajuste: oResult.I_ajuste,
                        docMaterial: oResult.I_docMaterial,
                        almacen: oResult.I_almacen,
                        centro: oResult.I_centro,
                        cantSugerida: that._coin(oResult.I_cantSugerida),
                        cantLoteLogistico: that._coin(
                          oResult.I_cantLoteLogisti
                        ),
                        stockAlmPiso: that._coin(oResult.I_stockLibUtil),
                        umb: oResult.I_unidad,
                      },
                      oBulto: {
                        tipo: oResult.B_tipo,
                        grupoOrdenBultoId: oResult.grupoOrdenBultoId,
                        grupoOrdenFraccionamientoId:
                          oResult.grupoOrdenFraccionamientoId,
                        //numBulto: oResult.codigo ? oResult.codigo : 1,
                        cantSugerida: that._coin(oResult.B_sugerido),
                        estadoPesaje: oResult.B_estadoPesaje,
                      },
                      oPeso: {
                        neto: that._coin(oResult.B_neto),
                        tara: that._coin(oResult.B_tara),
                        bruto: that._coin(+oResult.B_neto + +oResult.B_tara),
                        difStockAlmPiso: "0.000",
                        difPorcAjuste: "0.000",
                        ajuste: false,
                        ajusteAuto: false, //Indicador de Ajuste Automatico
                        ajusteEnMas: true, //Indicador de Ajustes en +/-
                      },
                      oAction: that._showButtons(
                        false /*edit*/,
                        false /*print*/,
                        false /*save*/
                      ),
                    };

                    var fvence = oFormData.oInsumo.fechaVencimiento;
                    fvence = fvence ? fvence : new Date();
                    var oDExp = new Date(fvence);
                    var oExpire = this._DaysExpire(
                      [
                        oDExp.getFullYear(),
                        oDExp.getMonth() + 1,
                        oDExp.getDate(),
                      ].join("-")
                    );

                    //3.1 Notificar si la fecha de vencimiento del insumo está próxima a vencer (14 días: configurable)
                    if (oExpire.days <= 14) {
                      oFormData.oInsumo.info = oExpire.message;
                      MessageToast.show(oExpire.message);
                    } else if (oExpire.days < 0) {
                      oFormData.oInsumo.info = oExpire.message;
                      MessageToast.show(oExpire.message);
                    }

                    oView.getModel("OrdenBultoDetModel").setData(oResult);
                    oView.getModel("FormVerificationModel").setData(oFormData);
                    oView.getModel("OrdenBultoDetModel").refresh();
                    oView.getModel("FormVerificationModel").refresh();

                    var EQ = FilterOperator.EQ;
                    var aFilters = [];
                    aFilters.push(
                      //AND
                      new Filter(
                        [
                          new Filter("ordenId", EQ, oResult.ordenId), //Orden
                          new Filter("I_codigo", EQ, oResult.I_codigo), //Codigo Insumo
                          new Filter("I_lote", EQ, oResult.I_lote), //Lote Insumo
                          //new Filter("B_tipo", EQ, oResult.B_tipo), //Tipo Bulto
                        ],
                        true /*bAnd*/
                      )
                    );

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
                          oView
                            .getModel("GrupoOrdenBultoDetModel")
                            .setData(aResult);
                          that._getAlmacenPiso();
                        },
                        function (oError) {
                          console.log(oError);
                          sap.ui.core.BusyIndicator.hide();
                        }
                      );
                  } else {
                    MessageToast.show(that._getI18nText("W000110"));
                  }
                } else {
                  MessageToast.show(that._getI18nText("W000111"));
                }
              }.bind(this),
              function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
              }
            );
        },
        _getAlmacenPiso: function () {
          var that = this;
          var oView = that.getView();
          var oModel = goModel;
          var oModelSapErp = goModelSapErp;

          if (!oModel) {
            oModel = oView.getModel();
          }

          var oFormData = oView.getModel("FormVerificationModel").getData();

          if (!navigator.onLine) {
            // oFormData.oInsumo.stockAlmPiso  Si es offline tomar el stock almancen piso de los insumos
            that._getResumeBultoGroup(that);
            that._calculatePeso();
          } else {
            oFormData.oInsumo.stockAlmPiso = "0.000";

            var EQ = FilterOperator.EQ;
            var oInsumo = oFormData.oInsumo;
            var aFilters = [];
            aFilters.push(
              //AND
              new Filter(
                [
                  new Filter("Matnr", EQ, oInsumo.codigo), //Codigo Insumo
                  new Filter("Charg", EQ, oInsumo.lote), //Lote Insumo
                  new Filter("Werks", EQ, oInsumo.centro), //Centro
                  new Filter("Lgort", EQ, oInsumo.almacen), //Almacen
                ],
                true /*bAnd*/
              )
            );

            that
              ._getODataDinamic(oModelSapErp, "StockSet", null, aFilters, null)
              .then(
                (aResult) => {
                  if (aResult) {
                    var item = aResult[0];
                    var iStockAlmPiso = that._coin(item.Clabs); //Libre utiliz.
                    oFormData.oInsumo.stockAlmPiso = iStockAlmPiso;
                    oView.getModel("FormVerificationModel").refresh();

                    if (iStockAlmPiso == "0.000") {
                      MessageToast.show(
                        that._getI18nText(
                          "No se encontro Stock en Almacen de Piso: " +
                            iStockAlmPiso
                        )
                      );
                    }
                    that._getResumeBultoGroup(that);
                    that._calculatePeso();
                  } else {
                    MessageToast.show(
                      that._getI18nText(
                        "No se encontro registro en Almacen de Piso"
                      )
                    );
                  }
                },
                function (oError) {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                  var oErrorSap = JSON.parse(oError.responseText).error;
                  MessageToast.show(
                    oErrorSap.innererror.errordetails[0].message
                  );
                }
              );
          }
        },
        _calculatePeso: function () {
          var that = this;
          var oView = that.getView();
          var oFormVerificationModel = oView.getModel("FormVerificationModel");
          var oFormData = oFormVerificationModel.getData();

          var oInsumo = oFormData.oInsumo;
          var oPeso = oFormData.oPeso;
          var oBulto = oFormData.oBulto;

          var iBruto = oPeso.bruto;
          var iTara = oPeso.tara;
          oPeso.bruto =
            that._decimalCount(iBruto) > 3 ? that._coin(iBruto) : iBruto;
          oPeso.tara =
            that._decimalCount(iTara) > 3 ? that._coin(iTara) : iTara;

          var bruto = +oPeso.bruto;
          var tara = +oPeso.tara;

          oPeso.neto = that._coin(bruto - tara);

          if (oPeso.neto > oInsumo.cantidadActual) {
            MessageToast.show(
              "La cantidad ingresada es mayor a la cantidad actual: " +
                oInsumo.cantidadActual
            );
          }

          /**
           * Calculo de ajuste
           */
          var bAuto = false;
          var difStockAlmPiso = 0;
          var iPorcAjuste = 0;

          difStockAlmPiso = that._coin(+oInsumo.cantidadActual - +oPeso.neto);
          iPorcAjuste = that._getPorcAjuste(
            difStockAlmPiso,
            oInsumo.cantLoteLogistico
          );

          oPeso.ajuste = false;
          oPeso.ajusteEnMas = true;
          if (iPorcAjuste && iPorcAjuste != 0) {
            oPeso.ajuste = true;
            //Si porcentaje de ajuste es dif a 0, validar si se aplica el ajuste automatico/Manual
            bAuto = that._isBetween(-0.1, 0.1, iPorcAjuste);
            if (iPorcAjuste > 0) oPeso.ajusteEnMas = false;
          }
          oPeso.ajusteAuto = bAuto; //Tipo de ajuste
          oPeso.difStockAlmPiso = difStockAlmPiso;
          oPeso.difPorcAjuste = iPorcAjuste;

          //Habilitar Boton Guardar
          oFormData.oAction = that._showButtons(
            true /*edit*/,
            oBulto.tipo == "SAL" ? true : false /*print*/,
            true /*save*/
          );
          oView.getModel("FormVerificationModel").refresh();
        },
        _buildGrupoOrdenBulto: function (oModel, iMaestraId, sAction) {
          var that = this;
          var oView = that.getView();
          var oUser = that._getUserLogin();

          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var oBulto = oFormData.oBulto;

          var bultoQR = (
            "S" + formatter.getGenerateKey(new Date(), "")
          ).substring(0, 15);
          oFormData.oBulto.bultoQR = bultoQR;

          var aConstant = oView.getModel("ConstantModel").getData();
          var aConstantKey = that._groupConstant(aConstant["UNIDAD"]);

          var sBultoId = formatter.uuidv4();
          var oEntity = {
            grupoOrdenBultoId: sBultoId,
            oBultoOriginal_grupoOrdenBultoId: oBulto.grupoOrdenBultoId,
            codigo: "1",
            cantidad: oPeso.neto,
            neto: oPeso.neto,
            tara: oPeso.tara,
            etiqueta: bultoQR,
            bulto: bultoQR,
            //oRolPesaje_rolId: goRole.rolId,
            //oUnidad_iMaestraId: oUnidadId,
            oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId:
              oBulto.grupoOrdenFraccionamientoId,
            oTipoBulto_iMaestraId: iMaestraId,
          };

          aConstantKey = that._groupConstant(aConstant["ESTADO_PESAJE"]);
          iMaestraId = aConstantKey[sAction].iMaestraId; //Pendiente de Ajuste
          oEntity.oEstadoPesaje_iMaestraId = iMaestraId;

          var oAuditStruct = {
            usuarioRegistro: oUser.usuario,
            fechaRegistro: new Date(),
            activo: true,
          };

          var sEntity = "GRUPO_ORDEN_BULTO";
          var oEntityData = { ...oEntity, ...oAuditStruct };

          oView.getModel("FormVerificationModel").refresh();

          return {
            oEntityData: oEntityData,
            sEntity: sEntity,
          };
        },
        _buildAlmacenPiso: function (oModel) {
          var that = this;
          var oView = that.getView();
          var oUser = that._getUserLogin();

          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var oInsumo = oFormData.oInsumo;

          var iCantBultoSaldo = +oInsumo.cantBultoSaldo + +oPeso.neto;

          var oEntity = {
            cantBultoSaldo: formatter.formatCoin(iCantBultoSaldo),
          };

          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };

          var sEntity = "/ALMACEN_PISO";
          var sKeyEntity = oModel.createKey(sEntity, {
            stockAlmacenId: oInsumo.stockAlmacenId,
          });

          var oEntityData = { ...oEntity, ...oAuditStruct };

          return {
            oEntityData: oEntityData,
            sKeyEntity: sKeyEntity,
            sEntity: sEntity,
          };
        },
        _getPorcAjuste: function (iDifSAP, iCantLote) {
          // Porcentaje = Diferencia * 100 / Cantidad recepcionada en almacén (ingreso del lote logístico cantidad inicial)
          var porcentaje = (iDifSAP * 100) / iCantLote;
          if (isNaN(porcentaje)) porcentaje = 0;
          return porcentaje;
        },
        _DaysExpire: function (sExpire /* '2021-10-25'*/) {
          var oDate = new Date();
          var sYMD = [
            oDate.getFullYear(),
            oDate.getMonth() + 1,
            oDate.getDate(),
          ].join("-");
          var date1 = new Date(sYMD);

          var date2 = new Date(sExpire);

          var iTime = date2.getTime() - date1.getTime();
          var iDays = iTime / (1000 * 60 * 60 * 24);

          iDays = new Number(iDays + "").toFixed(0);

          var sMsj = "";
          if (iDays >= 0) {
            if (iDays == 0) {
              sMsj = "Vence el día de  hoy";
            } else {
              sMsj = "Vence en " + iDays + " Días";
            }
          } else {
            sMsj = "Venció hace " + Math.abs(iDays) + " Días";
          }

          return {
            days: iDays,
            message: sMsj,
          };
        },
        _btnAction: function () {
          var oView = this.getView();
          oView.getModel("FormVerificationModel").setData({
            oAction: this._showButtons(
              false /*edit*/,
              false /*print*/,
              false /*save*/
            ),
          });
        },
        _showButtons: function (edit, print, save) {
          var oAction = goAccion;
          var oButton = {
            edit: edit,
            print: print,
            save: save,
          };

          /*
            VALIDAR ACCIONES PERMITIDOS
            */

          if (!oAction.salFullControl) {
            oButton.save = oAction.salSave ? oButton.save : false;
            oButton.print = oAction.salPrint ? oButton.print : false;
          }

          return oButton;
        },
        _searchReset: function (bEdit) {
          if (!bEdit) this._btnAction();
        },
        _getResumeBultoGroup: function (that) {
          var that = that;
          var oView = that.getView();
          var aOrdenBulto = oView.getModel("GrupoOrdenBultoDetModel").getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();
          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oInsumo = oFormData.oInsumo;
          var oPeso = oFormData.oPeso;

          var oOrdenBulto = {
            size: aOrdenBulto.length, //Cantidad de registros
            sumPesoIFA: 0,
            sumPesoSALDO: 0,
            cantActual: 0,
          };

          for (var key in aOrdenBulto) {
            var oItem = aOrdenBulto[key];
            if (oItem.B_neto) {
              if (oItem.B_tipo == "IFA") {
                oOrdenBulto.sumPesoIFA = oOrdenBulto.sumPesoIFA + +oItem.B_neto;
              }
              if (oItem.B_tipo == "SAL") {
                oOrdenBulto.sumPesoSALDO =
                  oOrdenBulto.sumPesoSALDO + +oItem.B_neto;
              }
            }
          }

          oOrdenBulto.cantActual =
            +oInsumo.stockAlmPiso -
            (oOrdenBulto.sumPesoIFA + oOrdenBulto.sumPesoSALDO);
          oInsumo.cantidadActual = that._coin(oOrdenBulto.cantActual);
          oPeso.neto = oInsumo.cantidadActual;
          oPeso.bruto = that._coin(+oPeso.neto + +oPeso.tara);

          oView.getModel("FormVerificationModel").refresh();
          return oOrdenBulto;
        },
        _coin: function (iValue) {
          return formatter.formatCoin(iValue);
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
          var oDeferred = jQuery.Deferred();
          QrScanner.WORKER_PATH = "lib/qr-scanner-worker.min.js";
          const qrScanner = new QrScanner(
            oTarget,
            function (result) {
              this.getView().byId("scannedValue").setValue(result);
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
                this.getView()
                  .byId("scannedValue")
                  .setValue(result.codeResult.code);

                // Close dialog
                this._oScanDialog.close();
              }.bind(this)
            );

            // Set flag so that event handlers are only attached once...
            this._bQuaggaEventHandlersAttached = true;
          }

          return oDeferred.promise();
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
