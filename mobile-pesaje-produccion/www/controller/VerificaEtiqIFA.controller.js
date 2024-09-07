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
    ExtScanner
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
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.VerificaEtiqIFA",
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
            .getTarget("VerificaEtiqIFA")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

          that._createPopover();
        },
        onBeforeRendering: function () {},
        onAfterRendering: function () {},
        onExit: function () {},

        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/

        _handleRouteMatched: function (oEvent) {
          BaseController.prototype.init.apply(this, arguments);
          this.oScanner = new ExtScanner({
            settings: true,
            valueScanned: this.onScanned.bind(this),
            decoderKey: "text",
            decoders: this.getDecoders(),
          });

          var that = this;
          goOwnerComponent = that.getOwnerComponent();
          goModel = goOwnerComponent.getModel();
          goModelSapErp = goOwnerComponent.getModel("sapErp");
          var srvExt = that._configServiceExternal();
          if (srvExt) {
            goModel = srvExt.oModel;
            goModelSapErp = srvExt.oModelSapErp;
          }

          try {
            goAccion = that._getAcctions("IFA");
            if (!goAccion) {
              that._navTo("Inicio", null);
              return;
            }
            that.oLogin = that._getDataLogin();
            that._initModels(that);
          } catch (oError) {
            that._navTo("Inicio", null);
            return;
          }
        },

        onScanned: function (oEvent) {
          var that = this;
          var sValueScan = oEvent.getParameter("value");
          var oStandardModel = that.getView().getModel("StandardModel");
          var oQR = oStandardModel.getProperty("/oQR");
          var sType = this.typeScanner;
          if (sType == "IFA") {
            oQR.oEtiqueta.text = sValueScan;
          } else {
            oQR.oSaldo.text = sValueScan;
          }

          oStandardModel.refresh();
          that._searchEtiqueta(sType);
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

        onQRSearch(oEvent, sType) {
          var that = this;
          var sCode = oEvent ? oEvent.getParameter("query") : null;
          if (sCode) that._searchEtiqueta(sType);
        },

        onLiveChangePeso: function (oEvent) {
          //var sNewValue = oEvent.getParameter("value");
          this._calculatePeso();
        },

        _buildUpdateAtencionErp: function (oBultoSaldo, oEtiquetaIfa) {
          
          var oBulto = oBultoSaldo;
          var oIfa = oEtiquetaIfa;
          var oBody = {
            Pedido: oIfa.Pedido,
            Centro: oIfa.Centro,
            AtendidoItemSet: [
              /**ACTUALIZA BULTO SALDO */
              {
                /*key*/
                Orden: oBulto.Orden,
                CodigoInsumo: oBulto.CodigoInsumo,
                Lote: oBulto.Lote,
                Tipo: oBulto.Tipo,
                NroItem: oBulto.NroItem,
                IdBulto: oBulto.IdBulto,
                IdPos: oBulto.IdPos,
                /*---*/
                CantidadA: oBulto.CantidadA,
                Tara: oBulto.Tara,
                UnidadM: oBulto.UnidadM,
                Almacen: oBulto.Almacen,
                Status: oBulto.Status,
                Etiqueta: oBulto.Etiqueta,
                UsuarioAte: oBulto.UsuarioAte,
                Impresion: oBulto.Impresion,
                Reimpresion: oBulto.Reimpresion,
                DocMat: oBulto.DocMat,
                CantConsumida: oBulto.CantConsumida,
              },
              /**ACTUALIZA BULTO IFA */
              {
                /*key*/
                Orden: oIfa.Orden,
                CodigoInsumo: oIfa.CodigoInsumo,
                Lote: oIfa.Lote,
                Tipo: oIfa.Tipo,
                NroItem: oIfa.NroItem,
                IdBulto: oIfa.IdBulto,
                IdPos: oIfa.IdPos,
                /*---*/
                CantidadA: oIfa.CantidadA,
                Tara: oIfa.Tara,
                UnidadM: oIfa.UnidadM,
                Almacen: oIfa.Almacen,
                Status: oIfa.Status,
                Etiqueta: oIfa.Etiqueta,
                UsuarioAte: oIfa.UsuarioAte,
                Impresion: oIfa.Impresion,
                Reimpresion: oIfa.Reimpresion,
                DocMat: oIfa.DocMat,
                CantConsumida: oIfa.CantConsumida,
              },
            ],
          };

          return oBody;
        },

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("CPPAOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "GUARDAR":
              bValid = sRol.includes("CPPACREA");
              break;
            case "USUARIO":
              bValid = sRol.includes("CPPAAUSU");
              break;
            case "BLOQUEO":
              bValid = sRol.includes("CPPABLOQ");
              break;
            case "ANULAR":
              bValid = sRol.includes("CPPAANUL");
              break;
            default:
              bValid = false;
              break;
          }

          if (!bValid) {
            MessageToast.show("Sin autorización para esta accion.");
          }

          return bValid;
        },

        onSave: function (oEvent) {
          var that = this;
          // if (!that._validateAccionAsigned("GUARDAR")) return;

          var oModel = goModel;

          var oUser = that.oLogin.oUsuario;

          var oFormData = that.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var oAjuste = oFormData.oAjuste;
          var aConstant = that.getModel("ConstantModel").getData();
          var aConstantKey = that._groupConstant(aConstant["ESTADO_PESAJE"]);
          var iMaestraId = aConstantKey["CONFIRM"].iMaestraId;

          if (+oPeso.neto <= 0) {
            return MessageBox.error(that._getI18nText("E000100"));
          }

          var oBultoSaldo = (that.oEvent = Object.assign({}, that.oSaldo));
          var oEtiquetaIfa = (that.oEvent = Object.assign({}, that.oEtiqueta));
          oBultoSaldo.CantConsumida = that._weight(
            +oBultoSaldo.CantConsumida + +oPeso.neto
          );

          oEtiquetaIfa.CantidadA = oPeso.neto;
          oEtiquetaIfa.Tara = oPeso.tara;
          oEtiquetaIfa.UsuarioAte = oUser.usuario;
          oEtiquetaIfa.Status = "P"; //PENDIENTE CONFIRMAR

          if (oAjuste.ajuste) {
            if (oAjuste.auto) {
              if (oAjuste.enMas) {
                /*AJUSTAR EN MAS:
                 * Zflag = 5 (Aumentar Saldo)
                 */
              } else {
                /*AJUSTAR EN MENOS
                 * Zflag = 4 (Disminuir Saldo)
                 */
              }
              //Habilitar Boton Guardar/Confirmar Si requiere ajuste Automatico
            } else {
              //Habilitar Boton Guardar si requiere ajuste Manual
            }
          } else {
          }

          that._updateGrupoOrdenBulto(oModel, iMaestraId, null);

          var oContent = that._buildUpdateAtencionErp(
            oBultoSaldo,
            oEtiquetaIfa
          );

          that
            .acPostErpDinamic(oModel, "AtendidoSet", oContent)
            .then((oResp) => {
              if (oResp) {
                /**ACTUALIZAR INSUMO*/
                that._updateInsumo(oModel, "");
              } else {
                MessageBox.error("Error al guardar los registros.");
              }
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al guardar los registros.");
              console.log(oError);
            });
        },

        // onSave: function (oEvent) {
        //   
        //   var that = this;
        //   if (!that._validateAccionAsigned("GUARDAR")) return;

        //   var oModel = goModel;

        //   var oUser = that.oLogin.oUsuario;

        //   var oFormData = that.getModel("FormVerificationModel").getData();
        //   var oPeso = oFormData.oPeso;
        //   var oAjuste = oFormData.oAjuste;

        //   if (+oPeso.neto <= 0) {
        //     return MessageBox.error(that._getI18nText("E000100"));
        //   }

        //   var oBultoSaldo = (that.oEvent = Object.assign({}, that.oSaldo));
        //   var oEtiquetaIfa = (that.oEvent = Object.assign({}, that.oEtiqueta));
        //   oBultoSaldo.CantConsumida = that._weight(
        //     +oBultoSaldo.CantConsumida + +oPeso.neto
        //   );

        //   oEtiquetaIfa.CantidadA = oPeso.neto;
        //   oEtiquetaIfa.Tara = oPeso.tara;
        //   oEtiquetaIfa.UsuarioAte = oUser.usuario;
        //   oEtiquetaIfa.Status = "P"; //PENDIENTE CONFIRMAR

        //   if (oAjuste.ajuste) {
        //     if (oAjuste.auto) {
        //       if (oAjuste.enMas) {
        //         /*AJUSTAR EN MAS:
        //          * Zflag = 5 (Aumentar Saldo)
        //          */
        //       } else {
        //         /*AJUSTAR EN MENOS
        //          * Zflag = 4 (Disminuir Saldo)
        //          */
        //       }
        //       //Habilitar Boton Guardar/Confirmar Si requiere ajuste Automatico
        //     } else {
        //       //Habilitar Boton Guardar si requiere ajuste Manual
        //     }
        //   } else {
        //   }

        //   var oContent = that._buildUpdateAtencionErp(
        //     oBultoSaldo,
        //     oEtiquetaIfa
        //   );

        //   that
        //     .acPostErpDinamic(oModel, "AtendidoSet", oContent)
        //     .then((oResp) => {
        //       if (oResp) {
        //         /**ACTUALIZAR INSUMO*/
        //         //that._updateInsumo(oModel, "");
        //       } else {
        //         MessageBox.error("Error al guardar los registros.");
        //       }
        //     })
        //     .catch((oError) => {
        //       sap.ui.core.BusyIndicator.hide();
        //       MessageBox.error("Error al guardar los registros.");
        //       console.log(oError);
        //     });
        // },

        onSaveAndConfirm: function (oEvent) {
          
          var oModel = goModel;
          var oModelSapErp = goModelSapErp;
          var that = this;
          var oView = that.getView();
          var aConstant = oView.getModel("ConstantModel").getData();

          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var oInsumo = oFormData.oInsumo;

          var aConstantKey = that._groupConstant(aConstant["ESTADO_PESAJE"]);
          var iMaestraId = aConstantKey["CONFIRM"].iMaestraId;

          if (oPeso.ajuste) {
            /*
             *Si se aplica ajuste y el ajuste es automatico
             * Actualizar ORDEN_DETALLE y registrar el Doc material
             * Actualizar los pesos del Bulto
             *
             **/

            if (oPeso.ajusteAuto) {
              MessageBox.warning(that._getI18nText("W000302"));

              var iCalDif = +oInsumo.cantDisponible - +oPeso.neto;
              var iStock = that._weight(iCalDif < 0 ? iCalDif * -1 : iCalDif);
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
                      that._updateGrupoOrdenBulto(oModel, iMaestraId, null);

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
              that._updateGrupoOrdenBulto(oModel, iMaestraId, null);
              that._updateInsumo(oModel, "");
            }
          } else {
            that._updateGrupoOrdenBulto(oModel, iMaestraId, null);
          }
        },

        onReset: function () {
          
          var oModel = goModel;
          var that = this;
          var oView = that.getView();
          MessageBox.confirm(that._getI18nText("I000011"), {
            title: "Resetear",
            actions: ["SI", "NO"],
            initialFocus: "NO",
            onClose: async function (sAction) {
              if ("SI" == sAction) {
                var oFormData = oView
                  .getModel("FormVerificationModel")
                  .getData();
                var oPeso = oFormData.oPeso;
                oPeso.neto = "0.000";
                oPeso.tara = "0.000";
                oView.getModel("FormVerificationModel").refresh();

                that._updateGrupoOrdenBulto(oModel, null, "RESET");
              } else sap.ui.core.BusyIndicator.hide();
            },
          });
        },
        onConfirm: function (oEvent) {
          
          var oModel = goModel;
          var that = this;
          //var oView = that.getView();
          var aConstantKey = that._groupConstant(aConstant["ESTADO_PESAJE"]);
          var iMaestraId = aConstantKey["CONFIRM"].iMaestraId;

          that._updateGrupoOrdenBulto(oModel, iMaestraId, null);
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
                false /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
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
              oSaldo: {
                text: "", //9600000685$1000010118$MP00020801
                edit: false,
              },
              oEtiqueta: {
                text: "I00000002",
              },
            });
        },

        _searchEtiqueta: function (sType) {
          var that = this;
          var oView = that.getView();
          var sText = "";
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");

          if (sType == "IFA") {
            sText = oQR.oEtiqueta.text;
            that._searchReset(false);
            that._getBultoIfa(sText);
          } else {
            sText = oQR.oSaldo.text;
            that._getBultoSaldo(sText);
          }
        },

        _getBultoIfa: function (sCode) {
          var that = this;
          that.oInsumo = null;
          that.oEtiqueta = null;
          var oView = that.getView();
          var oModel = goModel;
          var oModelERP = goModelSapErp;

          if (!oModel) {
            oModel = oView.getModel();
          }

          if (!oModelERP) {
            oModelERP = oView.getModel("sapErp");
          }

          oView.getModel("FormVerificationModel").setData({
            oAction: that._showButtons(
              false /*edit*/,
              false /*save*/,
              false /*confirm*/,
              false /*saveAndConfirm*/,
              false /*reset*/
            ),
          });
          oView.getModel("FormVerificationModel").refresh(true);

          //oView.getModel("GrupoOrdenBultoDetModel").setData([]);
          //oView.getModel("OrdenBultoDetModel").setData({});

          var aFilter = [],
            oUrlParameters = {},
            EQ = FilterOperator.EQ;
          var oBultoScan = that._getFormatQr(sCode);
          if (oBultoScan) {
            if (oBultoScan.Etiqueta) {
              aFilter.push(new Filter("Etiqueta", EQ, oBultoScan.Etiqueta));
            } else {
              aFilter.push(new Filter("IdBulto", EQ, oBultoScan.IdBulto));
              aFilter.push(
                new Filter("CodigoInsumo", EQ, oBultoScan.CodigoInsumo)
              );
              aFilter.push(new Filter("Lote", EQ, oBultoScan.Lote));
            }
            aFilter.push(new Filter("Tipo", EQ, "IFA"));

            /**
             * OBTENER DATOS DE LA ETIQUETA IFA
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
                  for (var key in aResp) {
                    var oBulto = aResp[key];
                    that.oEtiqueta = oBulto;
                    var Pedido = oBulto.Pedido;
                    var Orden = oBulto.Orden;
                    var CodigoInsumo = oBulto.CodigoInsumo;
                    var Lote = oBulto.Lote;
                    var IdPos = oBulto.IdPos ? parseInt(oBulto.IdPos) : 1;

                    aFilter = [];
                    aFilter.push(new Filter("pedidoNumero", EQ, Pedido));
                    aFilter.push(new Filter("ordenNumero", EQ, Orden));
                    aFilter.push(new Filter("insumoCodigo", EQ, CodigoInsumo));
                    aFilter.push(new Filter("insumoLote", EQ, Lote));
                    aFilter.push(new Filter("insumoIdPos", EQ, IdPos));

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
                        that.addListPopover({
                          type: "Error", // ["Error", "Warning", "Success", "Information"]
                          title: "Sin registros",
                          description:
                            "<p>" + that._getI18nText("W000111") + "</p>",
                          subtitle: "",
                        });
                        MessageToast.show(that._getI18nText("W000111"));
                      });

                    break;
                  }
                } else {
                  that.addListPopover({
                    type: "Error", // ["Error", "Warning", "Success", "Information"]
                    title: "Sin registros",
                    description: "<p>" + that._getI18nText("W000111") + "</p>",
                    subtitle: "",
                  });
                  MessageToast.show(that._getI18nText("W000111"));
                }
              })
              .then((aPedidoResp) => {
                if (aPedidoResp && aPedidoResp.length) {
                  var oPedido = aPedidoResp[0];
                  that.oInsumo = oPedido;
                  (aFilter = []), (oUrlParameters = {});
                  aFilter.push(new Filter("Matnr", EQ, oPedido.insumoCodigo));
                  aFilter.push(new Filter("Atinn", EQ, "PESADO_MATERIAL_PR"));

                  /**
                   * VERIFICAR CARACTERISTICA DEL MATERIAL
                   */
                  return that
                    .fnGetErpDinamic(
                      oModel,
                      "MaterialCaractSet",
                      oUrlParameters,
                      aFilter
                    )
                    .catch((oError) => {
                      console.log(oError);
                      that.addListPopover({
                        type: "Error", // ["Error", "Warning", "Success", "Information"]
                        title: "Sin caracteristica: Pesaje por Producción",
                        description:
                          "<p>" + that._getI18nText("W000104") + "</p>",
                        subtitle: "",
                      });
                      MessageToast.show(that._getI18nText("W000104"));
                    });
                }
              })
              .then((aCaracResp) => {
                if (aCaracResp && aCaracResp.length) {
                  // Verificar las Etiquetas de los Insumos Farmacéuticos Activos (IFAs) que se pesan en producción
                  // Estos insumos tendrán una marca en una característica del maestro de materiales PESADO_MATERIAL_PR = 'X'

                  var oCaract = aCaracResp[0];
                  if (oCaract.Atwrt == "X")
                    that.oInsumo.pesadoMaterialPr = oCaract.Atwrt;
                  else {
                    that.addListPopover({
                      type: "Error", // ["Error", "Warning", "Success", "Information"]
                      title: "Sin caracteristica: Pesaje por Producción",
                      description:
                        "<p>" + that._getI18nText("W000104") + "</p>",
                      subtitle: "",
                    });
                    MessageToast.show(that._getI18nText("W000104"));
                  }
                } else {
                  that.addListPopover({
                    type: "Error", // ["Error", "Warning", "Success", "Information"]
                    title: "Sin caracteristica: Pesaje por Producción",
                    description: "<p>" + that._getI18nText("W000104") + "</p>",
                    subtitle: "",
                  });
                  MessageToast.show(that._getI18nText("W000104"));
                }
                // Se busca el grupo del buldo
                var aFilter = [
                  new Filter("etiqueta", EQ, that.oEtiqueta.Etiqueta),
                ];
                return that
                  ._getODataDinamic(
                    oModel,
                    "GRUPO_ORDEN_BULTO",
                    null,
                    aFilter,
                    null
                  )
                  .catch((oError) => {
                    console.log(oError);
                    that.addListPopover({
                      type: "Error", // ["Error", "Warning", "Success", "Information"]
                      title: "Sin caracteristica: Pesaje por Producción",
                      description:
                        "<p>" + that._getI18nText("W000104") + "</p>",
                      subtitle: "",
                    });
                    MessageToast.show(that._getI18nText("W000104"));
                  });
              })
              .then((oGrupoOrdenBulto) => {
                var oItem = that.oInsumo;
                var oEtiqueta = that.oEtiqueta;

                var cantPendiente = that._weight(
                  +oItem.cantPedida -
                    +oItem.cantAtendida /*Cant. Atendida con Entero */ -
                    +oItem.cantAtendidaFrac /*Cant. Atendida con Fraccion */ -
                    +oItem.cantAtendidaIfa /*Cant. Atendida con Ifa */
                );

                var cantBulto =
                  +oEtiqueta.CantidadA > 0
                    ? oEtiqueta.CantidadA
                    : cantPendiente;

                var oFormData = {
                  oOrden: {
                    ordenId: oItem.ordenId,
                    estado: oItem.ordenEstado,
                    tipo: oItem.PedidoTipoDC,
                    numero: oItem.ordenNumero,
                    lote: oItem.ordenLote,
                    descProd: oItem.OrdenDescrip,
                  },
                  oInsumo: {
                    ordenDetalleId: oItem.ordenDetalleId,
                    codigo: oItem.insumoCodigo,
                    lote: oItem.insumoLote,
                    estado: oItem.insumoEstado,
                    descripcion: oItem.insumoDescrip,
                    fechaVencimiento: oItem.insumoFechaVencimiento,
                    pesadoMaterialPr: oItem.insumoPesadoMaterialPr,
                    agotar: oItem.InsumoAgotar,
                    almacen: oItem.insumoAlmacen,
                    centro: oItem.insumoCentro,
                    cantPedida: that._weight(oItem.cantPedida),
                    umb: oItem.insumoUmb,
                    cantAtendidaIfa: that._weight(oItem.cantAtendidaIfa),
                    cantPendiente: that._weight(cantPendiente),
                    estadoPesaje: oEtiqueta.Status, //Estado del pesaje de la etiqueta [PENDIENTE: P, CONFIRMADO : C ]
                    //ajuste: oItem.I_ajuste,
                    //docMaterial: oItem.I_docMaterial,
                  },
                  oSaldo: {
                    cantidadA: 0,
                    cantConsumida: 0,
                    cantDisponible: that._weight(0), //Stock ALM Piso
                    cantLoteLogistico: that._weight(0),
                  },
                  oAjuste: {
                    ajuste: false, //Indicador si se aplica ajuste: false: No ajustar, true:Ajustar
                    auto: false, // Indicador si se aplica el ajuste automatico:  false: manual, true:automatico
                    enMas: false, // Indicador si se aplica el ajuste:  false: (-) , true: (+)
                    porcentaje: that._weight(0), //Porcentaje de Ajuste
                    difStockAlmPiso: that._weight(0), //Cantidad ajustar en (+/-)
                  },
                  oPeso: {
                    neto: that._weight(cantBulto), //Cant Real = Cant Sugerida
                    tara: that._weight(oEtiqueta.Tara),
                    bruto: that._weight(+cantBulto + +oEtiqueta.Tara),
                  },
                  oAction: that._showButtons(
                    false /*edit*/,
                    false /*save*/,
                    false /*confirm*/,
                    false /*saveAndConfirm*/,
                    false /*reset*/
                  ),
                  oBulto: oGrupoOrdenBulto[0],
                };

                that._searchReset(true); //CAMBIAR -> VALOR REAL: false

                if (+oFormData.oPeso.neto > 0) {
                  /**
                   * VERIFICA SI EL BULTO YA TIENE PESO
                   * Si tiene peso asignado habilitar el boton RESET
                   */
                  oFormData.oAction = that._showButtons(
                    false /*edit*/,
                    false /*save*/,
                    false /*confirm*/,
                    false /*saveAndConfirm*/,
                    true /*reset*/
                  );

                  that.addListPopover({
                    type: "Information", // ["Error", "Warning", "Success", "Information"]
                    title: "Etiqueta con peso asignada",
                    description:
                      "<p>" + "El bulto ya tiene un peso asignado" + "</p>",
                    subtitle: "",
                  });
                  MessageToast.show("El bulto ya tiene un peso asignado");
                } else {
                  if (
                    /**
                     * PESAJE POR PRODUCCIÓN (PAIPEPR): Estado que indica que el insumo se pesa en Producción.
                     */
                    oFormData.oInsumo.estado &&
                    oFormData.oInsumo.estado == "PAIPEPR"
                  ) {
                    that._searchReset(true);
                  } else {
                    that.addListPopover({
                      type: "Warning", // ["Error", "Warning", "Success", "Information"]
                      title: "Sin caracteristica: Pesaje por Producción",
                      description:
                        "<p>" + that._getI18nText("W000104") + "</p>",
                      subtitle: "",
                    });
                    MessageToast.show(that._getI18nText("W000104"));
                  }
                }

                that.getModel("FormVerificationModel").setData(oFormData);
                that.getModel("FormVerificationModel").refresh(true);
              })
              .catch((oError) => {
                console.log(oError);
                that.addListPopover({
                  type: "Error", // ["Error", "Warning", "Success", "Information"]
                  title: "Error al obtener datos de la Etiqueta",
                  description: "<p>" + that._getI18nText("W000111") + "</p>",
                  subtitle: "",
                });
                MessageToast.show(that._getI18nText("W000111"));
              });
          }
        },
        _getBultoSaldo: function (sCode) {
          var that = this;
          that.oSaldo = null;
          var oView = that.getView();
          var oModel = goModel;

          if (!oModel) {
            oModel = oView.getModel();
          }

          var aFilter = [],
            oUrlParameters = {},
            EQ = FilterOperator.EQ;
          var oBultoScan = that._getFormatQr(sCode);
          if (oBultoScan) {
            if (oBultoScan.Etiqueta) {
              aFilter.push(new Filter("Etiqueta", EQ, oBultoScan.Etiqueta));
            } else {
              aFilter.push(new Filter("IdBulto", EQ, oBultoScan.IdBulto));
              aFilter.push(
                new Filter("CodigoInsumo", EQ, oBultoScan.CodigoInsumo)
              );
              aFilter.push(new Filter("Lote", EQ, oBultoScan.Lote));
            }
            aFilter.push(new Filter("Tipo", EQ, "IFA"));

            /**
             * OBTENER DATOS DE LA ETIQUETA IFA
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
                //
                var oStandardModel = that.getModel("StandardModel");
                var oQR = oStandardModel.getProperty("/oQR");
                var oFormVerificationModel = that.getModel(
                  "FormVerificationModel"
                );
                var oFormData = oFormVerificationModel.getData();

                if (aResp && aResp.length) {
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
                    var IdPos = oBulto.IdPos ? parseInt(oBulto.IdPos) : 1;

                    //1 Que el bulto corresponda al insumo (código) y lote
                    if (
                      //oInsumo.insumoIdPos == IdPos &&
                      oInsumo.insumoCodigo == CodigoInsumo &&
                      oInsumo.insumoLote == Lote
                    ) {
                      //2 Cantidad peso neto del saldo del bulto sea mayor a Cero.
                      if (+oBulto.CantidadA - +oBulto.CantConsumida > 0) {
                        //3 Fecha de vencimiento sea mayor o igual al día en que se fraccione el insumo (fecha de lectura etiqueta).
                        var fvence = oFormData.oInsumo.fechaVencimiento;
                        fvence = fvence ? fvence : new Date();
                        var oDExp = new Date(fvence);
                        var oExpire = that._DaysExpire(
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

                        //3 Fecha de vencimiento del insumo sea mayor/igual al día de lectura QR
                        if (oExpire.days <= 0) {
                          //4 que el (stock libre utilización) del insumo este en aprobado/disponible para ordenes de producción,
                          // Consultar a ERP por (Codigo insumo y Lote insumo)

                          if (oFormData.oOrden.tipo == "CPIDEM") {
                            /** SI RESERVA IDE no considerar el punto 4
                             */
                          } else {
                            /** VALIDACION 4 */
                          }
                          that.oSaldo = oBulto;

                          oFormData.oSaldo.cantidadA = that._weight(
                            oBulto.CantidadA
                          );
                          oFormData.oSaldo.cantConsumida = that._weight(
                            oBulto.CantConsumida
                          );
                          oFormData.oSaldo.cantDisponible = that._weight(
                            +oBulto.CantidadA - +oBulto.CantConsumida
                          );

                          oFormData.oSaldo.cantLoteLogistico = that._weight(
                            50.0 //oBulto.CantLoteLogistico
                          );
                          oFormData.oAjuste.difStockAlmPiso = that._weight(0);
                          oFormData.oAjuste.porcentaje = that._weight(0);
                          oFormVerificationModel.refresh(true);

                          that._calculatePeso();
                        } else {
                          oQR.oSaldo.text = "";
                          that.addListPopover({
                            type: "Warning", // ["Error", "Warning", "Success", "Information"]
                            title: "",
                            description:
                              "<p>" + that._getI18nText("W000101") + "</p>",
                            subtitle: "",
                          });
                          MessageBox.warning(that._getI18nText("W000101"));
                        }
                      } else {
                        oQR.oSaldo.text = "";
                        that.addListPopover({
                          type: "Error", // ["Error", "Warning", "Success", "Information"]
                          title: "Sin Stock disponible",
                          description:
                            "<p>" + that._getI18nText("E000301") + "</p>",
                          subtitle: "",
                        });
                        MessageBox.error(that._getI18nText("E000301"));
                      }
                    } else {
                      oQR.oSaldo.text = "";
                      that.addListPopover({
                        type: "Warning", // ["Error", "Warning", "Success", "Information"]
                        title: "",
                        description:
                          "<p>" + that._getI18nText("W000103") + "</p>",
                        subtitle: "",
                      });
                      MessageBox.warning(that._getI18nText("W000103"));
                    }
                  }
                } else {
                  that.addListPopover({
                    type: "Warning", // ["Error", "Warning", "Success", "Information"]
                    title: "",
                    description: "<p>" + that._getI18nText("W000111") + "</p>",
                    subtitle: "",
                  });
                  MessageBox.warning(that._getI18nText("W000111"));
                }
                oStandardModel.refresh();
              })
              .catch((oError) => {
                console.log(oError);
                that.addListPopover({
                  type: "Warning", // ["Error", "Warning", "Success", "Information"]
                  title: "",
                  description: "<p>" + that._getI18nText("W000111") + "</p>",
                  subtitle: "",
                });
                MessageToast.show(that._getI18nText("W000111"));
              });
          }
        },
        _calculatePeso: function () {
          var that = this;
          var oView = that.getView();
          var oFormVerificationModel = oView.getModel("FormVerificationModel");
          var oFormData = oFormVerificationModel.getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();

          oFormData.oAction = that._showButtons(
            true /*edit*/,
            false /*save*/,
            false /*confirm*/,
            false /*saveAndConfirm*/,
            false /*reset*/
          );
          oFormData.oAjuste.ajuste = false;

          var oPeso = oFormData.oPeso;
          var oInsumo = oFormData.oInsumo;
          var oSaldo = oFormData.oSaldo;

          var cantLoteLog = +oSaldo.cantLoteLogistico;
          var stockAlmPiso = +oSaldo.cantDisponible;
          var neto =
            that._decimalCount(oPeso.neto) > 3
              ? that._weight(oPeso.neto)
              : oPeso.neto;
          var tara =
            that._decimalCount(oPeso.tara) > 3
              ? that._weight(oPeso.tara)
              : oPeso.tara;
          var bruto = that._weight(+neto + +tara);

          oFormData.oPeso.neto = neto;
          oFormData.oPeso.tara = tara;
          oFormData.oPeso.bruto = bruto;

          var iEvalPedida = +oInsumo.cantPendiente - +neto;
          var iEvalStock = +stockAlmPiso - +neto;

          if (+neto <= 0 || +tara <= 0) {
            MessageToast.show(
              "Los pesos ingresados deben de ser mayor a cero."
            );
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Peso en cero",
              description:
                "<p>" +
                "Los pesos ingresados deben de ser mayor a cero." +
                "</p>",
              subtitle: "",
            });
          } else if (iEvalPedida < 0) {
            /**
             *
             * EVALUAR SI LA CANTIDAD INGRESADA NO SEA MAYOR A LA CANTIDAD PEDIDA
             */
            MessageToast.show(
              "Imposible continuar, solo esta permitido el peso Neto : " +
                that._weight(oInsumo.cantPendiente) +
                " Para completar la cantidad pedida: " +
                that._weight(oInsumo.cantPedida)
            );
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Cantidad pedida superada",
              description:
                "<p>" +
                "Imposible continuar, solo esta permitido el peso Neto : " +
                that._weight(oInsumo.cantPendiente) +
                " Para completar la cantidad pedida: " +
                that._weight(oInsumo.cantPedida) +
                "</p>",
              subtitle: "",
            });
          }
          //else
          if (iEvalStock < 0) {
            /**
             *
             * EVALUAR SI LA CANTIDAD INGRESADA NO SEA MAYOR A LA CANTIDAD DISPONIBLE
             */

            /** Calcular si requiere ajuste Stock */
            /** Si requiere ajuste Stock en Menos verificar si tiene el FLag Agotar Stock  */
            var oAjuste = that._checkAjusteAuto(
              cantLoteLog,
              stockAlmPiso,
              neto
            );

            oFormData.oAjuste.ajuste = true;
            oFormData.oAjuste.difStockAlmPiso = that._weight(
              oAjuste.difStockAlmPiso < 0
                ? oAjuste.difStockAlmPiso * -1
                : oAjuste.difStockAlmPiso
            );
            oFormData.oAjuste.porcentaje = oAjuste.porcentaje;
            oFormData.oAjuste.auto = oAjuste.auto;
            oFormData.oAjuste.enMas = oAjuste.enMas;

            var sMessageAjuste =
              "Esta ingresando una cantidad mayor a la cantidad disponible";
            var sMessageSub = "";
            if (oAjuste.auto) {
              if (oAjuste.enMas) {
                /*AJUSTAR EN MAS:
                 * Zflag = 5 (Aumentar Saldo)
                 */
              } else {
                /*AJUSTAR EN MENOS
                 * Zflag = 4 (Disminuir Saldo)
                 */
              }
              sMessageSub = "se requiere ajuste de stock automatico.";
              sMessageAjuste = sMessageAjuste + ", " + sMessageSub;
              //Habilitar Boton Guardar/Confirmar Si requiere ajuste Automatico
              oFormData.oAction.saveAndConfirm = true;
            } else {
              sMessageSub = "se requiere ajuste de stock manual.";
              sMessageAjuste = sMessageAjuste + ", " + sMessageSub;
              //Habilitar Boton Guardar si requiere ajuste Manual
              oFormData.oAction.save = true;
            }

            MessageToast.show(sMessageAjuste);
            that.addListPopover({
              type: "Warning", // ["Error", "Warning", "Success", "Information"]
              title: "Diferencia de stock",
              description: "<p>" + sMessageAjuste + "</p>",
              subtitle: sMessageSub,
            });
          } else {
            //Habilitar Boton confirm si no requiere ningun ajuste
            // oFormData.oAction.confirm = true;
            oFormData.oAction.save = true;
          }

          oFormVerificationModel.refresh(true);
          return;

          var bAuto = false;
          var difStockAlmPiso = 0;
          var iPorcAjuste = 0;
          var oOrdenBulto = that._getResumeBultoGroup(that);
          var iNunBultoPendPesar =
            oOrdenBulto.size - 1 - oOrdenBulto.numBultoPesada; // Numero de bultos pendientes para pesar

          if (oBultoQR.I_agotar && oBultoQR.I_agotar.toUpperCase() == "X") {
            oFormData.oPeso.ajuste = true; //Aplica ajuste
            oFormData.oPeso.ajusteEnMas = false;
            /*
            Bulto que se tiene que agotar:
             - Si hay alguna diferencia del peso que se va agatar, se realiza el ajuste en +/-
             - Si el ajuste esta entre 0 a 0.1% se realiza el ajuste Automatico, caso contrario el ajuste sera Manual  
           CALCULO PARA AJUSTES:
            - Calculo Diferencia de Stock Almacen Piso
              difStockAlmPiso = Cantidad real (neto) -  Stock Almacén piso
            - Calculo Ajuste Automatico
              iPorcAjuste = Diferencia de Stock Almacen Piso * 100 / Cantidad recepcionada almacén
              (ingreso del lote logístico cantidad inicial)
           */
            difStockAlmPiso = that._weight(stockAlmPiso - neto);
            iPorcAjuste = that._getPorcAjuste(difStockAlmPiso, cantLoteLog);
            bAuto = true;

            if (iPorcAjuste && iPorcAjuste != 0) {
              //Si porcentaje de ajuste es dif a 0, validar si se aplica el ajuste automatico/Manual
              bAuto = that._isBetween(-0.1, 0.1, iPorcAjuste);
              if (iPorcAjuste > 0) oFormData.oPeso.ajusteEnMas = false;
            }
            oFormData.oPeso.ajusteAuto = bAuto; //Tipo de ajuste
            oFormData.oAjuste.difStockAlmPiso = difStockAlmPiso;
            oFormData.oAjuste.porcentaje = iPorcAjuste;

            if (bAuto || iPorcAjuste == 0) {
              //Habilitar Boton Guardar/Confirmar Si requiere ajuste automatico
              oFormData.oAction = that._showButtons(
                true /*edit*/,
                false /*save*/,
                false /*confirm*/,
                true /*saveAndConfirm*/,
                false /*reset*/
              );
            } else {
              //Habilitar Boton Guardar si requiere ajuste Manual
              oFormData.oAction = that._showButtons(
                true /*edit*/,
                true /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
              );
            }
          } else {
            var requeridoActual =
              +oOrdenBulto.sumCantSugerida - +oOrdenBulto.sumCantPesada;

            var a = that._weight(requeridoActual - neto);
            if (a < 0 && iNunBultoPendPesar == 0) {
              MessageToast.show(
                "Imposible continuar, solo esta permitido el peso Neto : " +
                  that._weight(requeridoActual) +
                  " Para completar la cantidad sugerida: " +
                  that._weight(oOrdenBulto.sumCantSugerida)
              );
            } else {
              //Habilitar Boton Guardar
              oFormData.oAction = that._showButtons(
                true /*edit*/,
                true /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
              );
            }
          }

          var estadoPesaje = oInsumo.estadoPesaje;
          if (estadoPesaje) {
            if (estadoPesaje == "P") {
              // P: PENDIENTE CONFIRMAR , C: CONFIRMADO
              //estado: Pendiente Confirmar

              oFormData.oAction = that._showButtons(
                false /*edit*/,
                false /*save*/,
                true /*confirm*/,
                false /*saveAndConfirm*/,
                true /*reset*/
              );
            } else {
              oFormData.oAction = that._showButtons(
                false /*edit*/,
                false /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                true /*reset*/
              );
            }
            oView.getModel("FormVerificationModel").refresh();
            return;
          }

          oView.getModel("FormVerificationModel").refresh();
        },
        _checkAjusteAuto: function (cantLoteLog, stockDisp, pesoNeto) {
          var bAuto = false;
          var bAutoEnMas = true;
          var difStockAlmPiso = 0;
          var iPorcAjuste = 0;
          /*
             - Si hay alguna diferencia del peso que se va agatar, se realiza el ajuste en +/-
             - Si el ajuste esta entre 0 a 0.1% se realiza el ajuste Automatico, caso contrario el ajuste sera Manual  
          CALCULO PARA AJUSTES:
            - Calculo Diferencia de Stock Almacen Piso
              difStockAlmPiso = Cantidad real (neto) -  Stock Almacén piso
            - Calculo Ajuste Automatico
              iPorcAjuste = Diferencia de Stock Almacen Piso * 100 / Cantidad recepcionada almacén
              (ingreso del lote logístico cantidad inicial)
          */

          difStockAlmPiso = that._weight(+stockDisp - +pesoNeto);
          iPorcAjuste = that._getPorcAjuste(difStockAlmPiso, cantLoteLog);
          if (iPorcAjuste && iPorcAjuste != 0) {
            //Si porcentaje de ajuste es dif a 0, validar si se aplica el ajuste automatico/Manual
            bAuto = that._isBetween(-0.1, 0.1, iPorcAjuste);
            if (iPorcAjuste > 0) bAutoEnMas = false;
          }

          if (iPorcAjuste < 0) {
            iPorcAjuste = iPorcAjuste * -1;
          }

          if (difStockAlmPiso < 0) {
            difStockAlmPiso = difStockAlmPiso * -1;
          }

          return {
            auto: bAuto,
            enMas: bAutoEnMas,
            difStockAlmPiso: difStockAlmPiso,
            porcentaje: iPorcAjuste,
          };
        },
        _getBultoSaldo2: function (sCode) {
          //oEstadoPedido: oMaestraList.PCPE.find((o) => o.codigo === "PEND");

          var that = this;
          var oView = that.getView();
          var oFormVerificationModel = oView.getModel("FormVerificationModel");
          var oFormData = oFormVerificationModel.getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();
          var oInsumo = oFormData.oInsumo;

          var insumoQR = sCode;
          var insumoBulto = [oInsumo.codigo, oInsumo.lote].join("|");

          oFormData.oAction = that._showButtons(
            false /*edit*/,
            false /*save*/,
            false /*confirm*/,
            false /*saveAndConfirm*/,
            false /*reset*/
          );

          /**
           * Objeto para validar:
           * Cantidad de lotes de insumo a pesar (Si fue fraccionado en # Bultos la cantiad Sugerida)
           * Sumatoria de los pesos netos (Cantidades pesadas actual)
           * Numero de bultos pesados (Ejecutar el ajuste automatico en +/- si todos los bultos del lote de insumo fueron pesados)
           *
           * Al ejecutar el Ajuste automarico se creara un documento de material, registrar en la orden este documento
           */

          var oOrdenBulto = that._getResumeBultoGroup(that);

          //Validar que no exista bultos pendientes de ajustar
          if (oOrdenBulto.numBultoAjustar > 0) {
            MessageBox.error(
              "Existen  (" +
                oOrdenBulto.numBultoAjustar +
                ") bultos pendientes de ajustar."
            );
            return;
          }

          //Validar que primero se pesen los Bultos que tengan el flag Agotar
          if (oOrdenBulto.numBultoAgotar > 0) {
            MessageBox.error(
              "Existen  (" +
                oOrdenBulto.numBultoAgotar +
                ") bultos pendientes de agotar."
            );
            return;
          }

          if (oOrdenBulto.size > 1) {
            //Suma total de cantidad sugerida del insumo;
            oInsumo.cantSugerida = that._weight(oOrdenBulto.sumCantSugerida);
          }

          if (oBultoQR.B_neto && parseInt(oBultoQR.B_neto) > 0) {
            MessageToast.show("El bulto ya tiene un peso asignado");
            oFormData.oAction = that._showButtons(
              false /*edit*/,
              false /*save*/,
              false /*confirm*/,
              false /*saveAndConfirm*/,
              true /*reset*/
            );
            oView.getModel("FormVerificationModel").refresh();
          } else {
            if (
              //PESAJE POR PRODUCCIÓN: Se indicará este estado cuando el ítem no se pese en Central de Pesaje,
              //pero que se pese en Producción.
              oFormData.oInsumo.estado &&
              oFormData.oInsumo.estado.toUpperCase() == "PEPR"
            ) {
            } else {
              return MessageToast.show(that._getI18nText("W000104"));
            }

            //1 Que el bulto corresponda al insumo (código) y lote
            if (insumoQR == insumoBulto) {
            } else {
              return MessageToast.show(that._getI18nText("W000103"));
            }

            //2 Que la cantidad peso neto (Cant Sugerida) del saldo del bulto sea mayor a Cero
            if (oFormData.oBulto.cantSugerida > 0) {
            } else {
              return MessageToast.show(that._getI18nText("W000102"));
            }

            //Si orden es reservas de IDE o muestras solo tener en cuenta el 1 y 2
            if (oFormData.oOrden.tipo == "201") {
              /** Tipo Orden
               * 201 = PRODUCCION
               * 261 = RESERVA (IDE/MUESTRA)
               */
            } else {
              var fvence = oFormData.oInsumo.fechaVencimiento;
              fvence = fvence ? fvence : new Date();
              var oDExp = new Date(fvence);
              var oExpire = that._DaysExpire(
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
              oView.getModel("FormVerificationModel").refresh();

              //3 Fecha de vencimiento del insumo sea mayor/igual al día de lectura QR
              if (oExpire.days <= 0) {
              } else {
                return MessageBox.error(that._getI18nText("W000101"));
              }

              //4 que el (stock libre utilización) del insumo este en aprobado/disponible para ordenes de producción,
              // Consultar a ERP por (Codigo insumo y Lote insumo)
            }
            oView.getModel("FormVerificationModel").refresh();

            var EQ = FilterOperator.EQ;
            var aFilters = [];
            aFilters.push(
              //AND
              new Filter(
                [
                  new Filter("Matnr", EQ, oInsumo.codigo), //Codigo Insumo
                  new Filter("Atinn", EQ, "PESADO_MATERIAL_PR"), //Caracteristica Material
                ],
                true /*bAnd*/
              )
            );

            // Verificar las Etiquetas de los Insumos Farmacéuticos Activos (IFAs) que se pesan en producción
            // Estos insumos tendrán una marca en una característica del maestro de materiales
            that
              ._getODataDinamic(
                goModelSapErp,
                "MaterialCaractSet",
                null,
                aFilters,
                null
              )
              .then(
                (aResult) => {
                  if (aResult) {
                    var oItem = aResult[0];
                    if (oItem.Atwrt == "X") {
                      oFormData.oInsumo.I_pesadoMaterialPr = oItem.Atwrt;
                      //Obtener Stock Almacen Central
                      that._getAlmacenPiso();
                      oView.getModel("FormVerificationModel").refresh();
                    } else {
                      MessageToast.show(
                        "Insumo no tiene marca en una característica (PESADO_MATERIAL_PR) del maestro de materiales"
                      );
                    }
                  } else {
                    MessageToast.show(
                      "No se encontro la caracteristica de Material (PESADO_MATERIAL_PR) para el insumo"
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
        _getBultoIfa2: function (sCode) {
          var that = this;
          var oView = that.getView();
          var oModel = goModel;

          if (!oModel) {
            oModel = oView.getModel();
          }

          oView.getModel("GrupoOrdenBultoDetModel").setData([]);
          oView.getModel("OrdenBultoDetModel").setData({});

          var aFilters = [];
          aFilters.push(new Filter("B_etiqueta", FilterOperator.EQ, sCode)); //Etiqueta Bulto (QR)

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
                  var onLine = navigator.onLine;
                  for (var key in aResult) {
                    oResult = aResult[key];
                    var sTipo = oResult.B_tipo; // Tipo de bulto
                    if (["IFA"].includes(sTipo)) {
                      if (!onLine) {
                        //Si Offline: Aplicar filtros manuales
                        //contains: (oResult.bulto).includes(sCode);
                        if (oResult.B_bulto == sCode) break;
                      } else break;
                    }

                    oResult = null;
                  }
                  if (oResult) {
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
                        cantSugerida: that._weight(oResult.I_cantSugerida),
                        cantLoteLogistico: that._weight(
                          oResult.I_cantLoteLogisti
                        ),
                        stockAlmPiso: that._weight(oResult.I_stockLibUtil),
                        umb: oResult.I_unidad,
                      },
                      oBulto: {
                        grupoOrdenBultoId: oResult.grupoOrdenBultoId,
                        cantSugerida: that._weight(oResult.B_sugerido),
                        estadoPesaje: oResult.B_estadoPesaje,
                      },
                      oPeso: {
                        neto: that._weight(
                          oResult.B_neto > 0
                            ? oResult.B_neto
                            : oResult.B_sugerido
                        ), //Cant Real = Cant Sugerida
                        tara: that._weight(oResult.tara),
                        bruto: that._weight(
                          +oResult.B_sugerido + +oResult.B_tara
                        ),

                        difStockAlmPiso: "0.000",
                        difPorcAjuste: "0.000",
                        ajuste: false, //Indicador si se aplica ajuste
                        ajusteAuto: false, // Indicador si se aplica el ajuste:  false: manual, true:automatico
                        ajusteEnMas: true, // Indicador si se aplica el ajuste:  en +/-
                      },
                      oAction: that._showButtons(
                        false /*edit*/,
                        false /*save*/,
                        false /*confirm*/,
                        false /*saveAndConfirm*/,
                        false /*reset*/
                      ),
                    };

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
                          //new Filter("I_lote", EQ, oResult.I_lote), //Lote Insumo
                          new Filter("B_tipo", EQ, oResult.B_tipo), //Tipo Bulto
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
                        function (aResult) {
                          oView
                            .getModel("GrupoOrdenBultoDetModel")
                            .setData(aResult);
                        }.bind(this),
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

        _getResumeBultoGroup: function (that) {
          var that = that;
          var oView = that.getView();
          var aOrdenBulto = oView.getModel("GrupoOrdenBultoDetModel").getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();
          var oOrdenBulto = {
            size: aOrdenBulto.length, //Cantidad de registros
            sumCantSugerida: 0,
            sumCantPesada: 0, //Sumatoria de cantidad pesada
            numBultoPesada: 0, //Numero de bultos pesados
            numBultoAgotar: 0, //Numero de bultos pendientes de agotar
            numBultoAjustar: 0, //Numero de bultos pendientes de Ajustar
          };

          for (var key in aOrdenBulto) {
            var oItem = aOrdenBulto[key];
            if (oBultoQR.grupoOrdenBultoId != oItem.grupoOrdenBultoId) {
              if (oItem.B_neto) {
                //Cantidad y Sumatoria de bultos pesados
                oOrdenBulto.numBultoPesada = oOrdenBulto.numBultoPesada + 1;
                oOrdenBulto.sumCantPesada =
                  oOrdenBulto.sumCantPesada + oItem.B_neto;

                if (
                  oItem.I_ajuste &&
                  oItem.I_ajuste.toUpperCase() == "X" &&
                  oItem.I_docMaterial &&
                  oItem.I_docMaterial != ""
                ) {
                  //Bultos pendientes de ajustar
                  oOrdenBulto.numBultoAjustar = oOrdenBulto.numBultoAjustar + 1;
                }
              } else {
                if (oItem.I_agotar && oItem.I_agotar.toUpperCase() == "X") {
                  //Bultos pendientes de Agotar
                  oOrdenBulto.numBultoAgotar = oOrdenBulto.numBultoAgotar + 1;
                }
              }
            }

            oOrdenBulto.sumCantSugerida =
              +oOrdenBulto.sumCantSugerida + +oItem.I_cantSugerida;
          }
          return oOrdenBulto;
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
            // oFormData.oInsumo.cantDisponible  Si es offline tomar el stock almancen piso de los insumos
          } else {
            oFormData.oInsumo.cantDisponible = "0.000";

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
                    var iStockAlmPiso = that._weight(item.Clabs); //Libre utiliz.
                    oFormData.oInsumo.cantDisponible = iStockAlmPiso;
                    oView.getModel("FormVerificationModel").refresh();

                    if (iStockAlmPiso == "0.000") {
                      MessageToast.show(
                        that._getI18nText(
                          "No se encontro Stock en Almacen de Piso: " +
                            iStockAlmPiso
                        )
                      );
                    }

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
                  MessageBox.error(oError.innererror.errordetails[0].message);
                }
              );
          }
        },

        _updateGrupoOrdenBulto: function (oModel, iMaestraId, sAction) {
          var that = this;
          var oView = that.getView();
          var oEntity = that._buildGrupoOrdenBulto(oModel, iMaestraId, sAction);
          var sAction = sAction;
          var oModel = oModel;

          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataUpdate(oModel, oEntity.sKeyEntity, oEntity.oEntityData)
            .then(
              (oResult) => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.success(that._getI18nText("S000010"));

                var oFormData = oView
                  .getModel("FormVerificationModel")
                  .getData();
                var oBulto = oFormData.oBulto;

                if (sAction == "RESET") {
                  that._deleteGrupoOrdenBultoAfterReset(
                    oModel,
                    oBulto.grupoOrdenBultoId
                  );
                } else {
                  that._initModels(that);
                }
              },
              function (oError) {
                sap.ui.core.BusyIndicator.hide();
                console.log(oError);
              }
            );
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
              if (!aResult && oData.fnResetBultoIFA) {
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
        _buildGrupoOrdenBulto: function (oModel, iMaestraId, sAction) {
          var that = this;
          var oView = that.getView();

          var UserRoleModel = JSON.parse(
            window.localStorage.getItem("UserInfoModel")
          );
          var oUser = UserRoleModel.oUsuario;

          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oPeso = oFormData.oPeso;
          var sGrupoBultoId = oFormData.oBulto.grupoOrdenBultoId;
          var oInsumo = oFormData.oSaldo;

          var cantidadSaldo = +oInsumo.cantDisponible - +oPeso.neto;

          if (sAction && sAction == "RESET") cantidadSaldo = 0;

          var oEntity = {
            neto: oPeso.neto,
            tara: oPeso.tara,
            oEstadoPesaje_iMaestraId: iMaestraId,
          };

          var oAuditStruct = {
            usuarioActualiza: oUser.usuario,
            fechaActualiza: new Date(),
          };

          var sEntity = "/GRUPO_ORDEN_BULTO";
          var sKeyEntity = oModel.createKey(sEntity, {
            grupoOrdenBultoId: sGrupoBultoId,
          });

          var oEntityData = { ...oEntity, ...oAuditStruct };

          return {
            oEntityData: oEntityData,
            sKeyEntity: sKeyEntity,
            sEntity: sEntity,
          };
        },
        _buildInsumo: function (oModel, sDocument) {
          var that = this;
          var oView = that.getView();
          var oFormData = oView.getModel("FormVerificationModel").getData();
          var oBultoQR = oView.getModel("OrdenBultoDetModel").getData();
          var oPeso = oFormData.oPeso;

          var oEntity = {
            docMaterial: sDocument,
            ajuste: sDocument ? "" : "X",
            stockLibrUtilReal: oPeso.neto,
          };
          if (sDocument) {
            oEntity.stockLibrUtil = oPeso.neto;
          }

          var oAuditStruct = {
            //usuarioActualiza: oUser.usuario,
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
              false /*save*/,
              false /*confirm*/,
              false /*saveAndConfirm*/,
              false /*reset*/
            ),
          });
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
        _searchReset: function (bEdit) {
          var oView = this.getView();
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");
          oQR.oSaldo.edit = bEdit;
          oView.getModel("StandardModel").refresh();
          if (!bEdit) this._btnAction();
        },

        getDecoders: function () {
          return [
            {
              key: "PDF417-UII",
              text: "PDF417-UII",
              decoder: this.parserPDF417UII,
            },
            {
              key: "text",
              text: "TEXT",
              decoder: this.parserText,
            },
          ];
        },

        parserText: function (oResult) {
          var sText = "";
          var iLength = oResult.text.length;
          for (var i = 0; i !== iLength; i++) {
            if (oResult.text.charCodeAt(i) < 32) {
              sText += " ";
            } else {
              sText += oResult.text[i];
            }
          }
          return sText;
        },

        parserPDF417UII: function (oResult) {
          // we expect that
          // first symbol of UII (S - ASCII = 83) or it just last group
          var sText = oResult.text || "";
          if (oResult.format && oResult.format === 10) {
            sText = "";
            var iLength = oResult.text.length;
            var aChars = [];
            for (var i = 0; i !== iLength; i++) {
              aChars.push(oResult.text.charCodeAt(i));
            }
            var iStart = -1;
            var iGRCounter = 0;
            var iGroupUII = -1;
            var sTemp = "";
            aChars.forEach(function (code, k) {
              switch (code) {
                case 30:
                  if (iStart === -1) {
                    iStart = k;
                    sTemp = "";
                  } else {
                    sText = sTemp;
                    iGRCounter = -1;
                  }
                  break;
                case 29:
                  iGRCounter += 1;
                  break;
                default:
                  if (iGRCounter > 2 && code === 83 && iGRCounter > iGroupUII) {
                    sTemp = "";
                    iGroupUII = iGRCounter;
                  }
                  if (iGroupUII === iGRCounter) {
                    sTemp += String.fromCharCode(code);
                  }
              }
            });
            if (sText) {
              sText = sText.slice(1);
            }
          }
          return sText;
        },

        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
        /**-----------------------------------------------*/

        _openScanQR: function () {
          this.oScanner.open();
          return;

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
            }
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

        _getValue: function (sText) {
          var sValue = sText;
          if (!sText) sValue = "";

          return sValue;
        },
        _getValueDec: function (sText) {
          var sValue = sText;
          if (!sText) sValue = "0.000";

          return sValue;
        },
      }
    );
  }
);
