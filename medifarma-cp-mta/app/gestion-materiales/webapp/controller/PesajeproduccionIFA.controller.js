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
      goDataSrv = oDataService,
      modelStandardModel,
      modelFormVerificationModel;
    return BaseController.extend(
      "com.medifarma.cp.pesajeimpresionbultosaldo.controller.PesajeproduccionIFA",
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
            .getTarget("PesajeproduccionIFA")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

          that._createPopover();
          that.applyInitialFocusTo(that.getView().byId("sfEtiqueta"));
          //console.log("Modelo IFA: ",this.getOwnerComponent().getModel());
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
            // MessageToast.show("Description validation has been performed.");
          });

          oMessagePopover.attachUrlValidated(function () {
            // MessageToast.show("URL validation has been performed.");
          });
          // oMessagePopover.attachBeforeOpen(function (oEvent) {
          //   try {
          //     var aLista = oEvent.getSource().getModel("MsgPopoverList").getData();
          //     aLista.reverse();
          //     oEvent.getSource().getModel("MsgPopoverList").updateBindings();
          //   } catch (error) {
          //     console.log(error);
          //   }
          // });
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
        agregarMensaje: function (
          sTipo,
          sTitulo,
          sDescripcion,
          sObjeto,
          sSubTitulo
        ) {
          // [Tipo,Titulo, Descriccion, Objeto, subTitulo]
          var that = this,
            sType = "",
            sObject = sObjeto ? sObjeto + " " : "",
            sSubTitle = sSubTitulo ? sSubTitulo : "";
          if (sTipo && sTitulo && sDescripcion) {
            switch (sTipo) {
              // ["Error", "Warning", "Success", "Information"]
              case "E":
                sType = "Error";
                break;
              case "W":
                sType = "Warning";
                break;
              case "S":
                sType = "Success";
                break;
              default:
                sType = "Information";
                break;
            }
            that.addListPopover({
              type: sType,
              title: sTitulo,
              description: "<p>" + sObject + sDescripcion + "</p>",
              subtitle: sSubTitle,
            });
          }
        },
        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
      /**-----------------------------------------------*/
        reestablecerPagina: function (that) {
          that.setModel(new JSONModel([]), "MsgPopoverList");
          that
            .getView()
            .setModel(new JSONModel([]), "MaterialEmbalajeListModel");
          that.getView().setModel(new JSONModel({}), "MaestraModel");
          that.iniciarModelo(that);
          that._getMasterData(), that.listaMaterialEmbalaje();
        },
        iniciarModelo: function (that) {
          modelStandardModel = null;
          modelFormVerificationModel = null;
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
            visibleEstEtiqueta: true,
          });
          that.getView().getModel("StandardModel").setProperty("/oAgotar", {
            icon: "sap-icon://border",
            color: "#6a6d70",
          });
          modelStandardModel = that.getView().getModel("StandardModel");
          modelFormVerificationModel = that
            .getView()
            .getModel("FormVerificationModel");
          that.ordenarLista();
        },
        cargarDatoInicial: function () {
          var that = this,
            aPromesa = [that._getMasterData(), that.listaMaterialEmbalaje()];
          Promise.all(aPromesa)
            .then((oData) => {
              debugger;
              console.log(oData);
            })
            .catch((err) => {
              console.log(err);
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
          // that.setModel(new JSONModel([]), "MsgPopoverList");
          that.setModel(models.createPedidoAtencionModel(), "StandardModel");
          that
            .getView()
            .setModel(new JSONModel([]), "MaterialEmbalajeListModel");
          that
            .getView()
            .getModel("StandardModel")
            .setProperty("/oQR", {
              oSaldo: {
                text: "", //9600000685$1000010118$MP00020801
                edit: false,
                // textQR: ""//"9600000351$1000010116$MP00023279",
              },
              oEtiqueta: {
                text: "", //"$1000010235$8000000002$I00000058",
                // textQR: ""//"$1000000417$0000000229$I00000048",
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
            visibleEstEtiqueta: true,
          });
          that.getView().getModel("StandardModel").setProperty("/oAgotar", {
            icon: "sap-icon://border",
            color: "#6a6d70",
          });
          that.ordenarLista();
        },
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

          if (sType == "IFA") {
            aText = oQR.oEtiqueta.text.split("$");
            that.iniciarModelo(that);
            that.setModel(new JSONModel([]), "MsgPopoverList");
            if (aText.length == 0) {
              that._searchReset(false);
            } else if (aText.length == 1) {
              // that._leerEtiquetaIFA(aText[0]);
              that.leerEtiquetaAtendido(aText[0], [{ Tipo: "IFA" }]);
            } else if (aText.length == 4 && aText[0].trim().length == 0) {
              that.leerEtiquetaAtendido(aText[3], [{ Tipo: "IFA" }]);
            } else if (aText.length == 4) {
              // that._leerEtiquetaIFA(aText[3]);
              that.leerEtiquetaAtendido(oQR.oEtiqueta.text, [
                { Tipo: "ENTERO" },
                { Tipo: "IFA" },
              ]);
            } else if (aText.length == 3) {
              // that._leerEtiquetaENTERO(oQR.oEtiqueta.text);
              that.leerEtiquetaAtendido(oQR.oEtiqueta.text, [
                { Tipo: "ENTERO" },
              ]);
            } else {
              var sDesc = that._getI18nText("EIFAE007"),
                sObjeto = "Error en la etiqueta.";
              that.agregarMensaje("E", "Sin registros", sDesc, sObjeto);
              MessageBox.error(sObjeto + " " + sDesc);
            }
          } else {
            sText = oQR.oSaldo.text;
            that._getBultoSaldo(sText);
          }
        },
        _searchReset: function (bEdit) {
          var oView = this.getView();
          var oQR = oView.getModel("StandardModel").getProperty("/oQR");
          oQR.oSaldo.edit = bEdit;
          oView.getModel("StandardModel").refresh();
          // if (!bEdit) this._btnAction();
        },
        cancelarEtiquetaIFA: function () {
          this.iniciarModelo(this);
          this.setModel(new JSONModel([]), "MsgPopoverList");
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
        retornarFiltros: function (oFilter) {
          var aFilter = [];
          if (oFilter && Array.isArray(oFilter)) {
            oFilter.forEach(function (oValue) {
              for (var oProperty in oValue) {
                aFilter.push(
                  new Filter(oProperty, FilterOperator.EQ, oValue[oProperty])
                );
              }
            });
          } else if (oFilter && Object.entries(oFilter).length > 0) {
            for (var oProperty in oFilter) {
              aFilter.push(
                new Filter(oProperty, FilterOperator.EQ, oFilter[oProperty])
              );
            }
          }
          return aFilter;
        },
        filtroEtiqueta: function (oBultoScan, aTipo) {
          var that = this,
            aFilter = [],
            aFilterTipo = [],
            oImpresion = {};

          if (oBultoScan.Etiqueta) {
            oImpresion = {
              Etiqueta: oBultoScan.Etiqueta,
            };
          } else {
            oImpresion = {
              IdBulto: oBultoScan.IdBulto,
              CodigoInsumo: oBultoScan.CodigoInsumo,
              Lote: oBultoScan.Lote,
            };
          }
          aFilterTipo = that.retornarFiltros(aTipo);
          aFilter = that.retornarFiltros(oImpresion);

          return aFilter.concat(aFilterTipo);
        },
        filtroVistaPedido: function (oBulto) {
          var that = this,
            aFilter = [];
          var oFilter = {
            insumoCodigo: oBulto.CodigoInsumo,
            insumoLote: oBulto.Lote,
          };
          if (oBulto.Pedido) {
            oFilter.pedidoNumero = oBulto.Pedido;
          }
          if (oBulto.Orden) {
            oFilter.ordenNumero = oBulto.Orden;
          }
          aFilter = that.retornarFiltros(oFilter);

          return aFilter;
        },
        /*
          INICIO: ETIQUETA IFA/ENTERO
          DESC: LEER ETIQUETA NUEVA O COMPLETADA, VALIDAR CARACTERISTICAS Y MOSTRAR DATOS.
          CREADO: @LUIS AGUIRRE CH.
         */
        obtenerTipoEtiqueta: function (aLista, aTipo) {
          var oObjeto = {};
          try {
            oObjeto = aLista.reduce(function (oBase, oProximo) {
              return Object.assign(oBase, { [oProximo.Tipo]: oProximo });
            }, {});
            if (oObjeto.IFA && Object.entries(oObjeto.IFA).length > 0) {
              return Object.assign({}, oObjeto.IFA);
            } else if (
              oObjeto.ENTERO &&
              Object.entries(oObjeto.ENTERO).length > 0
            ) {
              return Object.assign({}, oObjeto.ENTERO);
            } else {
              throw "No se encontro datos con la etiqueta leída";
            }
          } catch (error) {
            BusyIndicator.hide();
            console.log(error);
            return false;
            // if(error.message){
            //   MessageBox.error(error.message);
            // }
          }
        },
        leerEtiquetaAtendido: async function (sCode, aTipo) {
          var that = this,
            oData = {},
            sTipo = "",
            oView = that.getView(),
            oModel = that.getHanaModel(),
            oModelERP = that.getERPModel(),
            aFilter = [],
            oUrlParameters = {},
            sDesc,
            sObjeto,
            sTitle;

          var oBultoScan = that._getFormatQr(sCode);
          if (oBultoScan) {
            //Filtro para Etiqueta Atendido
            aFilter = that.filtroEtiqueta(oBultoScan, aTipo);
            BusyIndicator.show(0);
            try {
              //BUSCAR EN ATENDIDOS
              var oBulto = {};
              var oAtendido = await that._getODataDinamic(
                oModelERP,
                "AtendidoItemSet",
                oUrlParameters,
                aFilter,
                null
              );
              if (oAtendido && oAtendido.length) {
                oBulto = that.obtenerTipoEtiqueta(oAtendido);
                // for (var key in oAtendido) {
                //   var oBulto = oAtendido[key];
                // }
                if (!oBulto) {
                  sDesc = that._getI18nText("EIFAE002");
                  sObjeto = "Error en la etiqueta.";
                  sTitle = "No se encontro datos a mostrar.";
                  throw "Error al leer la etiqueta";
                }
                sTipo = oBulto.Tipo;
                oData = { oEtiqueta: oBulto };
                //Filtro para Vista Pedido Consolidado
                aFilter = that.filtroVistaPedido(oBulto);
                //BUSCAR EN PEDIDO CONSOLIDADO
                var oVistaPedido = await that._getODataDinamic(
                  oModel,
                  "VIEW_PEDIDO_CONSOLIDADO",
                  null,
                  aFilter,
                  null
                );
                if (oVistaPedido && oVistaPedido.length) {
                  var oPedido = oVistaPedido[0];
                  oData = Object.assign(oData, { oInsumo: oPedido });
                  //Filtro para caracteristica de material
                  aFilter = that.retornarFiltros({
                    Matnr: oPedido.insumoCodigo,
                    Atinn: "PESADO_MATERIAL_PR",
                  });
                  //BUSCAR CARACTERISTICAS DEL MATERIAL
                  var oMaterialCaracteristica = await that._getODataDinamic(
                    goModelSapErp,
                    "MaterialCaractSet",
                    null,
                    aFilter,
                    null
                  );
                  if (
                    oMaterialCaracteristica &&
                    oMaterialCaracteristica.length
                  ) {
                    // Verificar las Etiquetas de los Insumos Farmacéuticos Activos (IFAs) que se pesan en producción
                    // Estos insumos tendrán una marca en una característica del maestro de materiales PESADO_MATERIAL_PR = 'X'

                    var oCaract = oMaterialCaracteristica[0];
                    oData = Object.assign(oData, { oCaracteristica: oCaract });
                    if (oCaract.Atwrt == "X") {
                      // that.oInsumo.pesadoMaterialPr = oCaract.Atwrt;
                      aFilter = that.retornarFiltros({
                        ordenDetalleId: oPedido.ordenDetalleId,
                      });
                      //BUSCAR EN ORDEN DETALLE
                      var oOrdenDetalle = await that._getODataDinamic(
                        oModel,
                        "ORDEN_DETALLE",
                        { $expand: "oEstado" },
                        aFilter,
                        null
                      );

                      if (oOrdenDetalle && oOrdenDetalle.length) {
                        oData = Object.assign(oData, {
                          oOrdenDetalle: oOrdenDetalle[0],
                        });
                        if (
                          !$.isEmptyObject(oData.oCaracteristica) &&
                          oData.oOrdenDetalle.pesadoMaterialPr == "X"
                        ) {
                          //MOSTRAR DATOS EN PANTALLA
                          that.mostrarDatosLectura(oData);
                          // MOSTRAR DATOS MAESTROS
                          if (
                            that
                              .getView()
                              .getModel("MaterialEmbalajeListModel")
                              .getData().length == 0
                          ) {
                            //lista de materiales
                            that.listaMaterialEmbalaje();
                          }
                          if (
                            Object.entries(
                              that.getView().getModel("MaestraModel").getData()
                            ).length == 0
                          ) {
                            that._getMasterData();
                          }
                          //CARGAR LISTA DE USUARIOS REALIZADO POR oPedido.ordenNumero
                          var seccion = "";
                          var entidadFilter =
                            "RespContProduccionSet(Orden='" +
                            oPedido.ordenNumero +
                            "')";
                          var erpSeccion = await that._getODataDinamic(
                            oModelERP,
                            entidadFilter,
                            null,
                            null,
                            null
                          );
                          if (erpSeccion.ResponProd) {
                            seccion = erpSeccion.ResponProd;
                          }

                          var filtersUsuario = [];
                          filtersUsuario.push(
                            new Filter(
                              "oMaestraTipoUsuario_codigo",
                              FilterOperator.EQ,
                              "T06"
                            )
                          ); //PERFIL AUXILIAR DE PROD.
                          filtersUsuario.push(
                            new Filter(
                              "oMaestraNivel",
                              FilterOperator.Contains,
                              "RMD_FABRICACION"
                            )
                          ); //FABRICACION
                          filtersUsuario.push(
                            new Filter("seccionId", FilterOperator.EQ, seccion)
                          ); //seccion del material
                          await that._getODataDinamic(
                            oModel,
                            "Usuario",
                            null,
                            filtersUsuario,
                            "UsuariosPlanta"
                          );

                          // CASO ENTERO
                          if (sTipo == "ENTERO") {
                            that.leerEtiquetaBulto(sCode, oData.oEtiqueta);
                          } else {
                            // CASO NORMAL
                            //VALIDAR SI LA ETIQUETA IFA ESTA COMPLETADA
                            if (oData.oEtiqueta.Status == "F") {
                              //&& oData.oEtiqueta.IdBulto !== ""
                              var oDatoUsuario = await that._getODataDinamic(
                                oModel,
                                "Usuario",
                                null,
                                [
                                  new Filter(
                                    "usuario",
                                    "EQ",
                                    oData.oEtiqueta.VerificadoPor
                                  ),
                                ],
                                null
                              );
                              if (oDatoUsuario && oDatoUsuario.length) {
                                var oUser = oDatoUsuario[0];
                                that.actualizaDatosLectura(
                                  oData.oEtiqueta,
                                  oUser
                                );
                              }
                            } else {
                              aFilter = that.retornarFiltros({
                                CodigoInsumo: oData.oEtiqueta.CodigoInsumo,
                                Lote: oData.oEtiqueta.Lote,
                                Pedido: oData.oEtiqueta.Pedido,
                                Orden: oData.oEtiqueta.Orden,
                                Tipo: "IFA",
                              });
                              // BUSCAR LISTA DE FRACCIONES
                              var oListaFracciones =
                                await that._getODataDinamic(
                                  oModelERP,
                                  "AtendidoItemSet",
                                  null,
                                  aFilter,
                                  null
                                );
                              if (oListaFracciones && oListaFracciones.length) {
                                if (oListaFracciones.length > 1) {
                                  oListaFracciones = oListaFracciones.sort(
                                    (b, a) =>
                                      +a.Subfraccion > +b.Subfraccion
                                        ? -1
                                        : +b.Subfraccion > +a.Subfraccion
                                        ? 1
                                        : 0
                                  );
                                  var iFraccion = 1;
                                  var aFraccion = [];
                                  for (
                                    let i = 0;
                                    i < oListaFracciones.length;
                                    i++
                                  ) {
                                    if (
                                      +oListaFracciones[i].Subfraccion ==
                                      iFraccion
                                    ) {
                                      aFraccion.push(oListaFracciones[i]);
                                      iFraccion++;
                                    }
                                  }
                                  if (aFraccion && aFraccion.length > 1) {
                                    that.validaListaFraccionPendiente(
                                      oData.oEtiqueta,
                                      aFraccion
                                    );
                                  }
                                }
                              }
                              if (aFraccion && aFraccion.length > 1) {
                                that.validaListaFraccionPendiente(
                                  oData.oEtiqueta,
                                  aFraccion
                                );
                              }
                            }
                          }
                          that.limpiarBusquedaEscaner("E"); //etiqueta
                        } else {
                          sDesc = that._getI18nText("EIFAE005");
                          sObjeto = "Error en la etiqueta.";
                          sTitle = "Sin caracteristica: Pesaje por Producción";
                          throw "Orden Detalle - Insumo sin caracteristica: Pesaje por Producción";
                        }
                      }
                    } else {
                      sDesc = that._getI18nText("EIFAE005");
                      sObjeto = "Error en la etiqueta.";
                      sTitle = "Sin caracteristica: Pesaje por Producción";
                      throw "Insumo sin caracteristica";
                    }
                  } else {
                    sDesc = that._getI18nText("EIFAE005");
                    sObjeto = "Error en la etiqueta.";
                    sTitle = "Sin caracteristica: Pesaje por Producción";
                    throw "No hay datos en el insumo";
                  }
                }
              } else {
                sDesc = that._getI18nText("EIFAE002");
                sObjeto = "Error en la etiqueta.";
                sTitle = "Sin registros";
                throw "No hay datos en la etiqueta";
              }
            } catch (error) {
              console.log(error);
              if ((sTitle, sDesc)) {
                that.agregarMensaje("E", sTitle, sDesc, sObjeto);
                MessageBox.error(sObjeto + " " + sDesc);
              }
            } finally {
              if (sTipo != "ENTERO") {
                BusyIndicator.hide();
              }
            }
          }
        },
        validaListaFraccionPendiente: function (oBulto, aFraccion) {
          var oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          oFormVerificationModel.setProperty(
            "/oFraccion/ListaFraccion",
            aFraccion
          );

          var aBultoPendiente = [],
            iSubfraccion = +oBulto.Subfraccion,
            acumulado = 0;
          if (iSubfraccion <= aFraccion.length) {
            for (let i = 0; i < iSubfraccion; i++) {
              if (
                +aFraccion[i].Subfraccion != iSubfraccion &&
                aFraccion[i].IdBulto == ""
              ) {
                aBultoPendiente.push(aFraccion[i]);
              }
              if (aFraccion[i].IdBulto != "") {
                acumulado = acumulado + +aFraccion[i].CantidadA;
              }
            }
          } else {
            MessageBox.error(
              "El número correlativo de fracción no corresponde a la cantidad de etiquetas fraccionadas."
            );
            that._initModels(that);
          }
          if (aBultoPendiente.length > 0) {
            MessageBox.error("La fracción anterior no ha sido tratada.", {
              onClose: function () {
                that._initModels(that);
              },
            });
          } else {
            oFormVerificationModel.setProperty("/esFraccion", true);
            oFormVerificationModel.setProperty(
              "/oFraccion/cantidadAcumulada",
              acumulado
            );
            if (+iSubfraccion == +aFraccion.length) {
              oFormVerificationModel.setProperty(
                "/oFraccion/ultimaFraccion",
                "X"
              );
            }
            MessageBox.warning(
              "Fracciones Totales: " +
                aFraccion.length +
                "\n" +
                "Fracciones Leídas: " +
                iSubfraccion +
                " de " +
                aFraccion.length
            );
          }
          oFormVerificationModel.updateBindings();
        },
        actualizaDatosLectura: function (oEtiqueta, oUser) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();

          var oStandardModel = that.getModel("StandardModel");
          oStandardModel.setProperty("/oControl/visibleMatEmb", false);
          oStandardModel.updateBindings();
          try {
            if (oEtiqueta.StatusEtiqueta == "C") {
              oFormData.estadoCerrado = "C";
            } else {
              oStandardModel.setProperty("/oControl/visibleEstEtiqueta", false);
            }
            oStandardModel.updateBindings();
            oFormData = Object.assign(oFormData, {
              oUsuario: {
                verificado: oEtiqueta.VerificadoPor, //cambiar por verificadoPor
                verificadoNombre: oUser.nombre + " " + oUser.apellidoPaterno,
                realizado: oEtiqueta.RealizadoPor, //cambiar por realizadoPor
              },
              oPeso: {
                neto: that._weight(oEtiqueta.CantidadA),
                bruto: that._weight(+oEtiqueta.CantidadA + +oEtiqueta.Tara),
                tara: that._weight(oEtiqueta.Tara),
                umb: oEtiqueta.UnidadM,
                // embalaje: "1100010030"
              },
            });

            if (oEtiqueta.StatusEtiqueta != "C" && oEtiqueta.IdBulto != "") {
              oFormData = Object.assign(oFormData, {
                oBultoEscaneado: {
                  cantBultos: 1,
                  umb: oEtiqueta.UnidadM,
                  cantTotal: that._weight(+oEtiqueta.CantidadA),
                },
                oBultoEscaneadoLista: [
                  {
                    NroItem: 1,
                    IdBulto: oEtiqueta.IdBulto,
                    CantidadHU: +oEtiqueta.CantidadA,
                    UnidadM: oEtiqueta.UnidadM,
                    Consumido: 0,
                    oBultoEscaneado: {},
                  },
                ],
              });
            }

            oFormVerificationModel.updateBindings();
          } catch (oError) {
            console.log(oError);
          }
        },
        mostrarDatosLectura: function (oData) {
          BusyIndicator.show(0);
          try {
            var oItem = oData.oInsumo,
              oEtiqueta = oData.oEtiqueta,
              oOrdenDetalle = oData.oOrdenDetalle;
            // oItem.InsumoAgotar = "X";
            var cantBulto = oEtiqueta.Cantpesar;
            var agotar = oItem.InsumoAgotar == "" ? false : true;
            // Alerta de Agotamiento
            that._validarAgotar(agotar);
            var oFormData = {
              oEtiqueta: {
                Centro: oEtiqueta.Centro,
                Etiqueta: oEtiqueta.Etiqueta,
                Lote: oEtiqueta.Lote,
                Fraccion: oEtiqueta.Fraccion,
                Subfraccion: oEtiqueta.Subfraccion,
                UnidadM: oEtiqueta.UnidadM,
                CodigoInsumo: oEtiqueta.CodigoInsumo,
                Tipo: oEtiqueta.Tipo,
                Orden: oEtiqueta.Orden,
                Pedido: oEtiqueta.Pedido,
              },
              oOrden: {
                codigo: oItem.ordenCodProd,
                ordenId: oItem.ordenId,
                estado: oItem.ordenEstado,
                tipo: oItem.PedidoTipoDC,
                numero: oItem.ordenNumero,
                lote: oItem.ordenLote,
                descProd: oItem.OrdenDescrip,
                fraccion: parseInt(oEtiqueta.Fraccion, 10), // *** fraccion ERP
                pedidoTipo: oItem.PedidoTipo,
              },
              oInsumo: {
                ordenDetalleId: oItem.ordenDetalleId,
                ordenFraccionId: oOrdenDetalle.oOrdenFraccion_ordenFraccionId,
                codigo: oItem.insumoCodigo,
                numPedido: oEtiqueta.Pedido,
                lote: oItem.insumoLote,
                estado: oItem.insumoEstado,
                descripcion: oItem.insumoDescrip,
                fechaVencimiento: oItem.insumoFechaVencimiento,
                pesadoMaterialPr: oItem.insumoPesadoMaterialPr,
                agotar: oItem.InsumoAgotar,
                almacen: oItem.insumoAlmacen,
                centro: oItem.insumoCentro,
                cantPedida: that._weight(oItem.cantPedida), // *** Cantidad Requerida ?
                umb: oItem.insumoUmb,
                cantAtendidaIfa: that._weight(oItem.cantAtendidaIfa),
                cantPendiente: that._weight(0),
                estadoPesaje: oEtiqueta.Status, //Estado del pesaje de la etiqueta [PENDIENTE: P, CONFIRMADO : C ]
                fraccion: parseInt(oEtiqueta.Subfraccion, 10), // *** fracciion ERP,
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
                //Objeto para pesaje componente
                cantPesar: oEtiqueta.Cantpesar,
                neto: that._weight(cantBulto), //Cant Real = Cant Sugerida
                tara: that._weight(oEtiqueta.Tara),
                bruto: that._weight(+cantBulto + +oEtiqueta.Tara),
                umb: oEtiqueta.UnidadM,
                embalaje: "",
              },
              oAction: that._showButtons(
                false /*edit*/,
                false /*save*/,
                false /*confirm*/,
                false /*saveAndConfirm*/,
                false /*reset*/
              ),
              oBultoEscaneado: {
                cantBultos: "",
                umb: "",
                cantTotal: "",
              },
              unidadOrigen: oItem.insumoUmb, //Cambiarlo por la unidad de detalle de fraccionamiento.
              oBultoListaFraccion: [],
              oBultoEscaneadoLista: [],
              oOrdenDetalle: {
                requerido: that._weight(oOrdenDetalle.requerido),
                potenTeorica:
                  oOrdenDetalle.pTInsumo == ""
                    ? that._weight(0)
                    : that._weight(oOrdenDetalle.pTInsumo),
                potenPractica:
                  oOrdenDetalle.pPLoteLog == ""
                    ? that._weight(0)
                    : that._weight(oOrdenDetalle.pPLoteLog),
              },
              // oBulto: oGrupoOrdenBulto[0],
              oUsuario: {
                verificado: that.oLogin["oUsuario"].usuario,
                verificadoNombre:
                  that.oLogin["oUsuario"].nombre +
                  " " +
                  that.oLogin["oUsuario"].apellidoPaterno,
                realizado: "",
              },
              oFraccion: {
                cantidadAcumulada: 0,
                ultimaFraccion: "",
                //Lista de fracciones
              },
              esFraccion: false,
              esEntero: false,
              estadoCerrado: "",
            };
            that.validarEstadoEtiqueta(oEtiqueta.Status);
            that.getModel("FormVerificationModel").setData(oFormData);
            that.getModel("FormVerificationModel").refresh(true);
          } catch (oError) {
            console.log(oError);
          }
        },
        //LECTURA DE ETIQUETA BULTO ENTERO.
        leerEtiquetaBulto: async function (sCode, oData) {
          var that = this,
            oModel = that.getHanaModel(),
            oModelERP = that.getERPModel(),
            aFilter = [],
            oUrlParameters = {};

          var oStandardModel = that.getModel("StandardModel");
          var oQR = oStandardModel.getProperty("/oQR");
          var oFormVerificationModel = that.getModel("FormVerificationModel");
          var oFormData = oFormVerificationModel.getData();
          // oStandardModel.setProperty("/oControl/visibleEstEtiqueta", false);
          oStandardModel.updateBindings();
          var oBultoScan = that._getFormatQr(sCode);
          if (oBultoScan) {
            //Filtro para Etiqueta Atendido
            aFilter = that.filtroEtiqueta(oBultoScan);
            BusyIndicator.show(0);
            try {
              if (oData) {
                var oBultoHu = {
                  Hu: oData.IdBulto,
                  CodigoInsumo: oData.CodigoInsumo,
                  LoteInsumo: oData.Lote,
                  CentroInsumo: oData.Centro,
                };
                that.ValidarHuSet(oBultoHu, oData);
              }
            } catch (oError) {
              BusyIndicator.hide();
              console.log(oError);
            }
          }
        },

        _leerEtiquetaBultoAtendido: async function () {
          // var oAtendido = await that._getODataDinamic(oModelERP,"AtendidoItemSet",oUrlParameters,aFilter,null);
          // if (oAtendido && oAtendido.length) {
          //   var aListaBulto = $.grep(oAtendido, function(oValue){
          //     return oValue.Pedido == oFormData.oInsumo.numPedido
          //   });
          //   var oBulto = null;
          //   for (var key in aListaBulto) {
          //     oBulto = aListaBulto[key];
          //     break;
          //   }
          //   if (oBulto) {
          //       var bBultoExistente=false;
          //       var aBulto = oFormData.oBultoEscaneadoLista;
          //       for (let i = 0; i < aBulto.length; i++) {
          //         if(oBulto.IdBulto == aBulto[i].IdBulto){
          //           bBultoExistente = true;
          //         }
          //       }
          //       if(bBultoExistente){
          //         MessageBox.error(that._getI18nText("EIFAB012"));
          //         BusyIndicator.hide();
          //       }else{
          //         var oBultoHu = {
          //           Hu: oBulto.IdBulto,
          //           CodigoInsumo: oBulto.CodigoInsumo,
          //           LoteInsumo: oBulto.Lote,
          //           CentroInsumo: oBulto.Centro,
          //         };
          //         that.ValidarHuSet(oBultoHu, oBulto);
          //       }
          //   }else{
          //     MessageBox.error("HU no corresponde a la Orden / Pedido.");
          //     BusyIndicator.hide();
          //   }
          // }
        },
        limpiarBusquedaEscaner: function (sOpcion) {
          var that = this,
            oStandardModel = that.getModel("StandardModel");
          if (sOpcion == "E") {
            oStandardModel.setProperty("/oQR/oEtiqueta/text", "");
          } else if (sOpcion == "B") {
            oStandardModel.setProperty("/oQR/oSaldo/text", "");
          }
          oStandardModel.updateBindings();
        },
        validarEstadoEtiqueta: function (sEstado) {
          var that = this,
            oStandardModel = that.getModel("StandardModel");
          if (sEstado == "F") {
            oStandardModel.setProperty("/oControl/secBulto", false);
            oStandardModel.setProperty("/oControl/secPesaje", false);
            oStandardModel.setProperty("/oControl/realizado", false);
            oStandardModel.setProperty("/oControl/detalle", false);
            oStandardModel.setProperty("/oControl/guardar", false);
            oStandardModel.setProperty("/oControl/scanBulto", false);
          }
          oStandardModel.updateBindings();
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
        _UniqByKeepFirst: function (aData, key) {
          var seen = new Set();
          return aData.filter((item) => {
            var k = key(item);
            return seen.has(k) ? false : seen.add(k);
          });
        },
        cambiarEstadoEtiqueta: function (oEvent) {
          var that = this,
            oControl = oEvent.getSource();
          if (oControl.getSelectedKey() == "") {
            oControl.setSelectedKey("");
          }
          // if(oEvent.getSource().getSelectedKey() != ""){
          //   MessageBox.warning("¿Está seguro de cerrar la etiqueta sin pesarla?",{
          //     actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          //     emphasizedAction: MessageBox.Action.OK,
          //     onClose: function (sAction) {
          //       if (sAction != "OK") {
          //         oControl.setSelectedKey("");
          //       }
          //     }
          //   });
          // }else{
          //   oControl.setSelectedKey("");
          // }
        },
        /* Fin:  ETIQUETA IFA*/
        /**
         * Inicio:  LECTURA BULTO SALDO
         */
        //LEER BULTO SALDO
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
            if (oBultoScan.Etiqueta) {
              aFilter.push(new Filter("Etiqueta", EQ, oBultoScan.Etiqueta));
            } else {
              aFilter.push(new Filter("IdBulto", EQ, oBultoScan.IdBulto));
              aFilter.push(
                new Filter("CodigoInsumo", EQ, oBultoScan.CodigoInsumo)
              );
              aFilter.push(new Filter("Lote", EQ, oBultoScan.Lote));
            }
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
                  var aListaBulto = $.grep(aResp, function (oValue) {
                    return oValue.Pedido == oFormData.oInsumo.numPedido;
                  });
                  var oBulto = null;
                  for (var key in aListaBulto) {
                    oBulto = aListaBulto[key];
                    break;
                  }

                  if (oBulto) {
                    var bBultoExistente = false;
                    var aBulto = oFormData.oBultoEscaneadoLista;
                    for (let i = 0; i < aBulto.length; i++) {
                      if (oBulto.IdBulto == aBulto[i].IdBulto) {
                        bBultoExistente = true;
                      }
                    }
                    if (bBultoExistente) {
                      MessageBox.error(that._getI18nText("EIFAB012"));
                      BusyIndicator.hide();
                    } else {
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
                    }
                    // return;
                  } else {
                    MessageBox.error("HU no corresponde a la Orden / Pedido.");
                    BusyIndicator.hide();
                  }
                } else {
                  BusyIndicator.hide();
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
                BusyIndicator.hide();
                console.log(oError);
                that.addListPopover({
                  type: "Warning", // ["Error", "Warning", "Success", "Information"]
                  title: "Error en el Servicio",
                  description: "<p>" + that._getI18nText("EIFAB008") + "</p>",
                  subtitle: "",
                });
                MessageBox.error(that._getI18nText("EIFAB008"));
              });
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
          BusyIndicator.show(0);
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
                  that.addListPopover({
                    type: "Warning", // ["Error", "Warning", "Success", "Information"]
                    title: "Error al Validar HU",
                    description: "<p>" + oBultoHu.Messagebapi + "</p>",
                    subtitle: "",
                  });
                  // throw oBultoHu.Messagebapi;
                  BusyIndicator.hide();
                  if (oBulto.Tipo == "ENTERO") {
                    that.iniciarModelo(that);
                  }
                } else {
                  if (oBulto.Pedido != oFormData.oInsumo.numPedido) {
                    // this._setProperty("/Pesaje_Bulto", "");
                    MessageBox.error("HU no corresponde a la Orden / Pedido.");
                    BusyIndicator.hide();
                    if (oBulto.Tipo == "ENTERO") {
                      that.iniciarModelo(that);
                    }
                  } else if (
                    oBulto.CodigoInsumo != oFormData.oEtiqueta.CodigoInsumo
                  ) {
                    MessageBox.error(
                      "HU no corresponde al mismo código de insumo."
                    );
                    BusyIndicator.hide();
                    if (oBulto.Tipo == "ENTERO") {
                      that.iniciarModelo(that);
                    }
                  } else if (oBulto.Lote != oFormData.oEtiqueta.Lote) {
                    MessageBox.error("HU no corresponde al mismo lote.");
                    BusyIndicator.hide();
                    if (oBulto.Tipo == "ENTERO") {
                      that.iniciarModelo(that);
                    }
                  } else {
                    var oParam = {
                      CodigoInsumo: oBulto.CodigoInsumo,
                      Lote: oBulto.Lote,
                      Centro: oBulto.Centro,
                    };
                    oBultoHu.CantidadHU = oBultoHu.Vemng;
                    that._getCaracteristica(oParam, oBulto, oBultoHu);
                  }
                }
              } else {
                BusyIndicator.hide();
                MessageBox.error("Ocurrió un error al validar la HU.");
                if (oBulto.Tipo == "ENTERO") {
                  that.iniciarModelo(that);
                }
              }
            })
            .catch((oError) => {
              BusyIndicator.hide();
              console.log(oError);
              that.addListPopover({
                type: "Warning", // ["Error", "Warning", "Success", "Information"]
                title: "Error en el Servicio",
                description: "<p>" + that._getI18nText("EIFAB009") + "</p>",
                subtitle: "",
              });
              MessageBox.error(that._getI18nText("EIFAB009"));
              if (oBulto.Tipo == "ENTERO") {
                that.iniciarModelo(that);
              }
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
          BusyIndicator.show(0);
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
              BusyIndicator.hide();
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
                if (oBulto.Tipo == "ENTERO") {
                  that.iniciarModelo(that);
                }
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
                if (oBulto.Tipo == "ENTERO") {
                  that.iniciarModelo(that);
                }
                return;
              }

              // oCaract.Fecaduc = '2022-09-28'

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
                  if (oBulto.Tipo == "ENTERO") {
                    that.iniciarModelo(that);
                  }
                  return;
                }
              } else {
                MessageBox.warning(that._getI18nText("mensajeFechaCaduc"));
              }
              var oBultoEscaneado = this._buildBulto(oBulto, oBultoHu, oCaract);
              var oBultoNuevo = {
                oInsumo: {
                  lote: oBulto.Lote,
                  centro: oBulto.Centro,
                  codigo: oBulto.CodigoInsumo,
                  pedido: oBulto.Pedido,
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
                oOrden: {
                  Aufnr: oBulto.Orden,
                },
                Umed: oBulto.UnidadM,
                Fraccion: Number.parseInt(oBulto.Fraccion),
                Subfraccion: Number.parseInt(oBulto.Subfraccion),
                Status: oBulto.Status,
                Tipo: oBulto.Tipo,
              };

              // oBulto.Tipo = "ENTERO";
              if (oBulto.Tipo == "ENTERO") {
                // oFormData.oPeso.tara = that._weight(+oBultoEscaneado.Tarag);
                oFormData.oPeso.neto = that._weight(+oBultoEscaneado.Vemng);
                oFormData.oPeso.bruto = that._weight(
                  +oBulto.Tara + +oBultoEscaneado.Vemng
                );
                oFormData.oPeso.umb = oBultoEscaneado.Vemeh;
                oFormData.oPeso.embalaje = oBultoEscaneado.Vhilm;
                oFormData.esEntero = true;
                oBultoNuevo.oBulto.Tara = oBulto.Tara;
              } else {
                oFormData.esEntero = false;
              }
              if (that.validarBultoEscaneadoMenor(oBultoEscaneado)) {
                MessageBox.error(that._getI18nText("EIFAB005"));
                oBultoNuevo = {};
              } else {
                // oBultoEscaneado = this._buildBulto(oBulto, oBultoHu, oCaract);
                // oFormData.oBultoEscaneadoLista.push(this._buildBulto(oBulto, oBultoHu, oCaract));

                var nroItem = oFormData.oBultoEscaneadoLista.length + 1;
                oFormData.oBultoEscaneadoLista.push(
                  Object.assign(oBultoNuevo, {
                    NroItem: nroItem,
                    IdBulto: oBultoEscaneado.IdBulto,
                    CantidadHU: oBultoEscaneado.CantidadHU,
                    UnidadM: oBultoEscaneado.UnidadM,
                    Consumido: 0,
                    oBultoEscaneado: oBultoEscaneado,
                    IdTemporal: that.generarUUID(),
                  })
                );

                that._actualizaCantidadBulto(oFormData);
                that.validarTipoBulto(oBulto);
                that._validarAjustar();
              }
              oFormVerificationModel.setProperty("/oBultoQr", oBultoNuevo);
              oFormVerificationModel.updateBindings();
              that.limpiarBusquedaEscaner("B"); //Bulto
              // aBultoQr = this._updateList(aBultoQr);
            })
            .catch((oError) => {
              BusyIndicator.hide();
              console.log(oError);
              MessageBox.msgError(that._getI18nText("EIFAB010"));
            });
        },
        _buildBulto: function (oBultoScan, oBultoValid, oCaract) {
          return { ...oBultoValid, ...oCaract, ...oBultoScan };
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

            if (saldoAPesar > 0 && saldoAPesar >= +alista[i].CantidadHU) {
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
        _cambiarCantidadPesar: function (oEvent) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            iCantidad = Number(oEvent.getSource().getValue().replace(/,/g, ""));
          // oFormData.oPeso.neto = Number(oEvent.getSource().getValue().replaceAll(",", ""));
          if (isNaN(iCantidad)) {
            oFormData.oPeso.neto = 0;
          } else {
            oFormData.oPeso.neto = iCantidad;
          }

          if (
            !oFormData.oBultoEscaneadoLista ||
            oFormData.oBultoEscaneadoLista.length == 0
          ) {
            var mensaje = that._getI18nText("E000113");
            MessageBox.error(mensaje);
            return false;
          }
          that.getView().byId("btnGuardar").setBusyIndicatorDelay(0);
          that.getView().byId("btnGuardar").setBusy(true);
          try {
            that._actializaPesoBruto(that._actualizaCantidadBulto);
            // that._validarAjustar(+oFormData.oPeso.neto);
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

          if (
            !oFormData.oBultoEscaneadoLista ||
            oFormData.oBultoEscaneadoLista.length == 0
          ) {
            var mensaje = that._getI18nText("E000113");
            MessageBox.error(mensaje);
            return false;
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
            cantPesar = oFormData.oPeso["cantPesar"],
            cantTotal = oFormData.oBultoEscaneado["cantTotal"],
            neto,
            tara;

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
          (neto =
            that._decimalCount(oFormData.oPeso["neto"]) > 3
              ? that._weight(oFormData.oPeso["neto"])
              : oFormData.oPeso["neto"]),
            (tara =
              that._decimalCount(oFormData.oPeso["tara"]) > 3
                ? that._weight(oFormData.oPeso["tara"])
                : oFormData.oPeso["tara"]);

          // if (+neto > +cantPesar) {
          //   oFormData.oAjuste.ajuste = true;
          // }

          oFormData.oPeso = Object.assign(oFormData.oPeso, {
            //Objeto para pesaje componente
            neto: that._weight(neto), //Cant Real = Cant Sugerida
            tara: that._weight(tara),
            bruto: that._weight(+neto + +tara),
          });

          if (callback) {
            callback(oFormData);
          }
          oFormVerificationModel.updateBindings();
          that._validarAjustar();
        },
        _validarAgotar: function (bEstado) {
          var that = this,
            oStandardModel = that.getModel("StandardModel");
          if (bEstado) {
            oStandardModel.setProperty("/oAgotar/icon", "sap-icon://complete");
            oStandardModel.setProperty("/oAgotar/color", "#FF0000");
          } else {
            oStandardModel.setProperty("/oAgotar/icon", "sap-icon://border");
            oStandardModel.setProperty("/oAgotar/color", "#6a6d70");
          }
          oStandardModel.updateBindings();
        },
        _eliminarBultoLista: function (oEvent) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            alista = oFormVerificationModel.getProperty(
              "/oBultoEscaneadoLista"
            ),
            oItem = oEvent
              .getSource()
              .getParent()
              .getBindingContext("FormVerificationModel")
              .getObject(),
            iCont = 1,
            aNewLista = [];
          for (let i = 0; i < alista.length; i++) {
            //if (alista[i].NroItem != oItem.NroItem) {
            if (alista[i].IdTemporal != oItem.IdTemporal) {
              aNewLista.push(Object.assign(alista[i], { NroItem: iCont }));
              iCont++;
            }
          }
          oFormVerificationModel.setProperty(
            "/oBultoEscaneadoLista",
            aNewLista
          );
          that._actualizaCantidadBulto(oFormVerificationModel.getData());
          if (aNewLista.length == 0) {
            var oStandardModel = that.getModel("StandardModel");
            oStandardModel.setProperty("/oControl/secPesaje", true);
            oStandardModel.setProperty("/oControl/scanBulto", true);
            // oFormVerificationModel.setProperty("/oPeso/neto", "0.000");
            // oFormVerificationModel.setProperty("/oPeso/tara", "0.000");
            // oFormVerificationModel.setProperty("/oPeso/bruto", "0.000");
            oStandardModel.updateBindings();
          }
          oFormVerificationModel.updateBindings();
        },
        validarBultoEscaneadoMenor: function (oBulto) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            alista = oFormVerificationModel.getProperty(
              "/oBultoEscaneadoLista"
            ),
            bEstado = false;
          for (let i = 0; i < alista.length; i++) {
            if (+alista[i].CantidadHU > +oBulto.CantidadHU) {
              bEstado = true;
            }
          }
          return bEstado;
        },
        validarTipoBulto: function (oBulto) {
          var that = this,
            oStandardModel = that.getModel("StandardModel");
          if (oBulto.Tipo == "ENTERO") {
            oStandardModel.setProperty("/oControl/secPesaje", false);
            oStandardModel.setProperty("/oControl/scanBulto", false);
            oStandardModel.setProperty("/oControl/detalle", false);
          } else if (oBulto.Tipo == "SALDO") {
            oStandardModel.setProperty("/oControl/secPesaje", true);
            oStandardModel.setProperty("/oControl/scanBulto", true);
            oStandardModel.setProperty("/oControl/detalle", true);
          }
          oStandardModel.updateBindings();
        },

        _cambiarAjustar: function (oEvent) {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            oControl = oEvent.getSource();
          if (
            oFormData.oInsumo.agotar.trim() == "" &&
            oEvent.getParameter("state")
          ) {
            MessageBox.warning(that._getI18nText("WIFAB001"), {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function (sAction) {
                if (sAction != "OK") {
                  oControl.setState(false);
                }
              },
            });
          }
        },
        _validarAjustar: function () {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          if (oFormData.oInsumo.agotar.trim() == "X") {
            var oBultoActual = oFormData.oBultoEscaneado;
            var iPesoNeto = oFormData.oPeso.neto;
            var cantTotalBulto = 0;
            var aBulto = oFormData.oBultoEscaneadoLista;
            for (let i = 0; i < aBulto.length; i++) {
              cantTotalBulto = cantTotalBulto + +aBulto[i].CantidadHU;
            }
            if (+cantTotalBulto < +iPesoNeto) {
              oFormData.oAjuste.ajuste = true;
            }
          }
          oFormVerificationModel.updateBindings();
        },
        _validarPesoAjustar() {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();

          if (oFormData.oInsumo.agotar.trim() == "X") {
            var oBultoActual = oFormData.oBultoEscaneado;
            var iPesoNeto = oFormData.oPeso.neto;
            var cantTotalBulto = 0;
            var aBulto = oFormData.oBultoEscaneadoLista;
            var cantPesarActual = +iPesoNeto;
            var cantPesarAnterior = 0;
            var cantConsumida = 0;
            // aBulto = aBulto.sort((b, a) =>
            //       +a.CantidadHU > +b.CantidadHU ? -1 : +b.CantidadHU > +a.CantidadHU ? 1 : 0
            //     );
            for (let i = 0; i < aBulto.length; i++) {
              cantTotalBulto = cantTotalBulto + +aBulto[i].CantidadHU;
              if (cantPesarActual > +aBulto[i].CantidadHU) {
                cantPesarAnterior = +cantPesarActual;
                cantPesarActual = +cantPesarActual - +aBulto[i].CantidadHU;
              }
              if (aBulto.length - 1 == i && cantPesarActual > 0) {
                cantConsumida = cantPesarAnterior;
              }
            }
            if (+cantTotalBulto < +iPesoNeto && cantConsumida > 0) {
              aBulto[aBulto.length - 1].Consumido = cantConsumida;
            }
          }
          oFormVerificationModel.updateBindings();
        },
        /* Fin: Leer Bulto Saldo*/

        /*
         * INICIO:  GUARDAR ETIQUETA IFA
         * CREADO: @LAC
         */
        //**Considerar Validaciones Previas antes de guardar */
        _guardarEtiquetaIFA: function () {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();

          if (!that.validarImpresora()) {
            MessageBox.error("Seleccione una impresora para continuar");
            return;
          }

          if (oFormData.estadoCerrado == "C") {
            MessageBox.warning(
              "¿Está seguro de cerrar la etiqueta sin pesarla?",
              {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                  if (sAction == "OK") {
                    that.setModel(new JSONModel([]), "MsgPopoverList");
                    that._validarPesoAjustar();
                    that._createPopover();
                    that._confirmarGuardar();
                  }
                },
              }
            );
          } else {
            if (!that.validarPrevioGuardar()) {
              return;
            }
            MessageBox.confirm("Proceder a guardar el pesaje del componente.", {
              icon: MessageBox.Icon.SUCCESS,
              onClose: function (sAction) {
                if (sAction == "OK") {
                  that.setModel(new JSONModel([]), "MsgPopoverList");
                  that._validarPesoAjustar();
                  that._createPopover();
                  that._confirmarGuardar();
                }
              },
            });
          }
        },
        validarPrevioGuardar: function () {
          var oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          var oStandardModel = that.getModel("StandardModel"),
            oStandardData = oStandardModel.getData();
          //Validar el peso neto y tara mayor a cero
          if (
            Object.keys(oFormData.oOrden).length == 0 ||
            Object.keys(oFormData.oInsumo).length == 0
          ) {
            MessageBox.error("Dede leer una etiqueta IFA.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Error etiqueta IFA",
              description: "<p>" + "Dede leer una etiqueta IFA." + "</p>",
              subtitle: "",
            });
            return false;
          } else if (
            +oFormData.oPeso.neto <= 0 &&
            oStandardData.oControl.secPesaje
          ) {
            MessageBox.error("El peso [neto] debe de ser mayor a cero.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Peso en cero",
              description:
                "<p>" + "El peso [neto] debe de ser mayor a cero." + "</p>",
              subtitle: "",
            });
            return false;
          } else if (
            +oFormData.oPeso.tara <= 0 &&
            oStandardData.oControl.secPesaje
          ) {
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
          } else if (oFormData.oBultoEscaneadoLista.length == 0) {
            MessageBox.error("Debe leer un bulto.");
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Error etiqueta bulto",
              description: "<p>" + "Debe leer un bulto." + "</p>",
              subtitle: "",
            });
            return false;
          } else if (oFormData.oUsuario.realizado == "") {
            MessageBox.error(
              "Debe seleccionar un valor en el campo [Realizado por]."
            );
            that.addListPopover({
              type: "Error", // ["Error", "Warning", "Success", "Information"]
              title: "Error etiqueta bulto",
              description:
                "<p>" +
                "Debe seleccionar un valor en el campo [Realizado por]." +
                "</p>",
              subtitle: "",
            });
            return false;
          } else if (oFormData.oPeso.embalaje == "") {
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
          } else if (!oFormData.oAjuste.ajuste) {
            var canTotalBulto = 0,
              aListaBulto = oFormData.oBultoEscaneadoLista;
            for (let i = 0; i < aListaBulto.length; i++) {
              canTotalBulto = canTotalBulto + +aListaBulto[i].CantidadHU;
            }
            if (+oFormData.oPeso.neto > canTotalBulto) {
              MessageBox.error(
                "La cantidad pesada excede a la cantidad de bultos leídos. Proceder a leer más bultos."
              );
              that.addListPopover({
                type: "Error", // ["Error", "Warning", "Success", "Information"]
                title: "Error cantidad pesada",
                description:
                  "<p>" +
                  "La cantidad pesada excede a la cantidad de bultos leídos. Proceder a leer más bultos." +
                  "</p>",
                subtitle: "",
              });
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
        _confirmarGuardar: function () {
          var that = this;
          var oModel = that.getHanaModel();
          var oModelERP = that.getERPModel();
          var oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();
          var oBultoListModel = oFormData.oBultoEscaneadoLista; //that.getModel("BultoListModel"); //**** Seria solo un traslado?? y los bultos escaneados???
          var aBultoList = JSON.stringify(oBultoListModel); //.getProperty("/"));
          if (
            oFormData.estadoCerrado == "C" ||
            (JSON.parse(aBultoList) && JSON.parse(aBultoList).length)
          ) {
            BusyIndicator.show(0);
            var aAuxBultoList = JSON.parse(aBultoList);
            var sNow = formatter.getTimestampToYMD(new Date());
            // var UserInfoModel = JSON.parse(window.localStorage.getItem("UserInfoModel"));
            // var oUser = UserInfoModel.oUsuario;

            try {
              // Zflag campo de validacion para Ajuste por agotamiento
              var sEscenario = "";
              if (oFormData.esEntero) {
                sEscenario = "E";
              } else if (oFormData.esFraccion) {
                sEscenario = "F";
              }

              var estadoCerrado = "",
                cantTotal = that._weight(0);
              if (oFormData.estadoCerrado && oFormData.estadoCerrado == "C") {
                estadoCerrado = "X";
              } else {
                cantTotal = that._weight(
                  oFormData.oFraccion.cantidadAcumulada + +oFormData.oPeso.neto
                );
              }

              var oContent = {
                Mblnr: "",
                Mjahr: "",
                Bldat: sNow + "T00:00:00.0000000",
                Budat: sNow + "T00:00:00.0000000",
                TrasladoItemIfaSet: [],
                TrasladoMensajeSet: [],
                Zflag: oFormData.oAjuste.ajuste == true ? "X" : "", //para el ajuste agotamiento.
                Usnam: "",
                RealizPor: oFormData.oUsuario.realizado,
                VerifPor: oFormData.oUsuario.verificado,
                Escenario: sEscenario,
                UltRegistro: oFormData.oFraccion.ultimaFraccion,
                CantidadTot: cantTotal,
                UltRegistro2: estadoCerrado,
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
                Erfmg: "0.0", //"0.0",
                Lgort: "", //"1", //oItem.oInsumo.almacen,  /*Almacen Origen*/
                Umwrk: "" /*Centro recepto*/,
                Umlgo: "" /*Alm.receptor*/,
                Kostl: "" /*Centro coste*/,
                /*Datos Bulto */
                Idbulto: "",
                Etiqueta: "",
                Typetras: "",
                Status: "",
                Tipo: "",
                Aufnr: "",
                Umed: "",
                Fraccion: "",
                Subfraccion: "",
                // Datos para Etiqueta IFA
                MblnrAnul: "",
                MjahrAnul: "",
                Rsnum: "",
                Sgtxt: "",
                MatnrEmbal: "",
                PesoTara: "",
                PesoNeto: "",
                PesoBruto: "",
                CantPesada: "0",
              };
              //1 regristro de la etiqueta IFA
              //2,3.... regitros de bultos escaneados
              var TrasladoItemIfaSet = [];
              // Datos de Etiqueta

              if (!oFormData.esEntero) {
                var oDataEtiquetaIFA = Object.assign(
                  Object.assign({}, oTempTras),
                  {
                    Fraccion: Number(oFormData.oEtiqueta.Fraccion).toString(),
                    Subfraccion: Number(
                      oFormData.oEtiqueta.Subfraccion
                    ).toString(),
                    Tipo: oFormData.oEtiqueta.Tipo,
                    Matnr: oFormData.oEtiqueta.CodigoInsumo /*Codigo Insumo*/,
                    Charg: oFormData.oEtiqueta.Lote /*Codigo Lote*/,
                    Erfmg: oFormData.oPeso.neto, // peso actual
                    Werks: oFormData.oEtiqueta.Centro /*Centro Origen*/,
                    Idbulto: "",
                    Etiqueta: oFormData.oEtiqueta.Etiqueta,
                    //Datos del pesaje
                    Umed: oFormData.oPeso.umb,
                    MatnrEmbal: oFormData.oPeso.embalaje, //oFormData.oBultoEscaneadoLista[0].oBultoEscaneado.Vhilm, //
                    PesoTara: oFormData.oPeso.tara,
                    PesoNeto: oFormData.oPeso.neto,
                    PesoBruto: oFormData.oPeso.bruto,
                    Aufnr: oFormData.oEtiqueta.Orden,
                    Pedido: oFormData.oEtiqueta.Pedido,
                  }
                );
                TrasladoItemIfaSet.push(oDataEtiquetaIFA);
              }

              // Datos - Lectura de Bultos
              for (var key in aAuxBultoList) {
                var oItem = aAuxBultoList[key];

                var oItemSet = {
                  Matnr: oItem.oInsumo.codigo /*Codigo Insumo*/,
                  Charg: oItem.oInsumo.lote /*Codigo Lote*/,
                  Erfmg: oItem.oBulto.neto, // peso actual
                  Werks: oItem.oInsumo.centro /*Centro Origen*/,
                  Lgort: "", // CP02 // CP03*/
                  Umwrk: oItem.oInsumo.centro /*Centro recepto*/,
                  Umlgo: "", // CP02 // CP03*/
                  Aufnr: oItem.oOrden.Aufnr,
                  Status: oItem.oBulto.Status,
                  Tipo: oItem.oBulto.Tipo,
                  Mblnr: oItem.oBulto.mblnr /*Doc.material*/,
                  Mjahr: oItem.oBulto.mjahr /*Ejerc.doc.mat.*/,
                  Fraccion: oItem.Fraccion.toString(),
                  Subfraccion: oItem.Subfraccion.toString(),
                  Pedido: oItem.oInsumo.pedido,
                };

                var oBultoSet = {
                  Idbulto: oItem.oBulto.idBulto,
                  Etiqueta: oItem.oBulto.etiqueta,
                  Typetras: "", // omitor o dejar vacio
                  Umed: oItem.Umed,
                  PesoNeto: oItem.oBulto.neto,
                  CantPesada: oItem.Consumido.toString(),
                  MatnrEmbal: oItem.oBultoEscaneado.Vhilm,
                  PesoTara: oItem.oBulto.Tara,
                  PesoBruto: that._weight(
                    +oItem.oBulto.neto + +oItem.oBulto.Tara
                  ),
                };

                var oTrasItem = { ...oTempTras, ...oItemSet, ...oBultoSet };
                TrasladoItemIfaSet.push(oTrasItem);
              }

              var aLogRequest = [];
              oContent.TrasladoItemIfaSet = TrasladoItemIfaSet;
            } catch (error) {
              BusyIndicator.hide();
              return;
            }

            // console.log(oContent);

            that
              .oDataCreateDinamic(oModelERP, "TrasladoHeadIfaSet", oContent)
              .then(async (oResp) => {
                if (oResp) {
                  if (oResp.TrasladoMensajeSet.results.length > 0) {
                    //validar errores
                    var bType = true;
                    var aMesageSuccess = [];
                    // oResp.TrasladoMensajeSet.results.reverse();
                    oResp.TrasladoMensajeSet.results.forEach((oRes) => {
                      if (["E"].includes(oRes.Type)) {
                        bType = false;
                      }
                      if (["S"].includes(oRes.Type)) {
                        aMesageSuccess.push(oRes.Message);
                      }
                      var sError =
                        oRes.Type == "E"
                          ? "Error"
                          : oRes.Type == "W"
                          ? "Warning"
                          : oRes.Type == "S"
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

                      if (oFormData.estadoCerrado == "C") {
                        BusyIndicator.hide();
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
                        that.iniciarModelo(that);
                      } else {
                        BusyIndicator.show(0);
                        that._sendPrint(
                          {
                            aBultos: [oFormData.oEtiqueta],
                            oInsumo: null,
                          },
                          true
                        );
                      }
                    } else {
                      BusyIndicator.hide();
                      that.iniciarModelo(that);
                      MessageBox.error(
                        "Existen errores en la operación. Revisar el historial y volver a ejecutar la operación."
                      );
                    }
                  } else {
                    BusyIndicator.hide();
                    that.iniciarModelo(that);
                    MessageBox.error(
                      "Existen errores en la operación, volver a realizar el proceso."
                    );
                  }
                } else {
                  BusyIndicator.hide();
                  that.iniciarModelo(that);
                  MessageBox.error(
                    "Error al guardar la los datos de la etiqueta."
                  );
                  that.addListPopover({
                    type: "Error", // ["Error", "Warning", "Success", "Information"]
                    title: "Guardar Etiqueta",
                    description:
                      "<p>" +
                      "No se puede guardar los datos de la etiqueta." +
                      "</p>",
                    subtitle: "",
                  });
                }
              })
              .catch((oError) => {
                BusyIndicator.hide();
                that.iniciarModelo(that);
                MessageBox.error(
                  "Error al ejecutar el servicio de guardar etiqueta. Revisar el historial y volver a ejecutar la operación."
                );
                console.log(oError);
              });
          } else {
            BusyIndicator.hide();
            MessageBox.error("No existe ningun registro");
          }
        },

        testPrint: async function () {
          debugger;
          // this._sendPrint({
          //   aBultos: [{Etiqueta:"I00000058"}],
          //   oInsumo: null,
          // })
          // this.actualizaOrdenFraccion();
          var oDatoUsuario = await this._getODataDinamic(
            goModel,
            "Usuario",
            null,
            [new Filter("usuario", "EQ", "EGARCITI")],
            null
          );
          if (oDatoUsuario && oDatoUsuario.length) {
          }
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

          if (oFormData.oEtiqueta && oFormData.oEtiqueta != "") {
            aFilter.push(
              new Filter("Etiqueta", "EQ", oFormData.oEtiqueta.Etiqueta)
            );
            aFilter.push(new Filter("Tipo", "EQ", "IFA"));
            BusyIndicator.show(0);
            that
              ._getODataDinamic(
                goModelSapErp,
                "AtendidoItemSet",
                null,
                aFilter,
                null
              )
              .then((oResp) => {
                if (oResp && oResp.length) {
                  for (var key in oResp) {
                    var oEtiquetaIFA = oResp[key];
                  }
                  if (
                    oEtiquetaIFA.IdBulto != "" &&
                    oEtiquetaIFA.StatusEtiqueta != "C"
                  ) {
                    MessageBox.confirm("Proceder a imprimir la etiqueta IFA.", {
                      icon: MessageBox.Icon.SUCCESS,
                      onClose: function (sAction) {
                        if (sAction == "OK") {
                          BusyIndicator.show(0);
                          that._sendPrint({
                            aBultos: [oEtiquetaIFA],
                            oInsumo: null,
                          });
                        }
                      },
                    });
                  } else {
                    MessageBox.error(
                      "No se puede realizar la impresión por que la etiqueta no registra datos de pesaje."
                    );
                  }
                } else {
                  MessageBox.error(
                    "Error al obtener los datos de la etiqueta seleccionada."
                  );
                }
              })
              .catch((oError) => {
                BusyIndicator.hide();
                console.log(oError);
                that.addListPopover({
                  type: "Warning", // ["Error", "Warning", "Success", "Information"]
                  title: "Error en el Servicio",
                  description: "<p>" + that._getI18nText("EIFAI001") + "</p>",
                  subtitle: "",
                });
                MessageBox.error(that._getI18nText("EIFAI001"));
              });
          } else {
            BusyIndicator.hide();
            MessageBox.error("Debe leer una etiqueta IFA");
          }
        },
        _sendPrint: function (oData, bRMD) {
          var aBulto = oData.aBultos;
          var aEtiquetas = [],
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData();

          var oModel = that.getHanaModel();
          var oModelERP = that.getERPModel();
          for (var key in aBulto) {
            var oItem = aBulto[key];
            aEtiquetas.push(oItem.Etiqueta);
          }
          var oPrint = JSON.parse(window.localStorage.getItem("configLocal"));

          BusyIndicator.show(0);
          that
            ._getODataDinamic(
              oModel,
              "fnSendPrintBulto",
              {
                impresoraId: oPrint.oGeneral.impresora,
                etiqueta: aEtiquetas.join(","),
                usuario: oFormData.oUsuario.verificado, //"EGARCITI"
                bSaldo: "",
                tipo: "ETIQUETA_IFA", //Omitir // Tipo de impresion [AM: Almacen Materiales, CP: Central Pesada]
                idBulto: "", //oData.aBultos[0].IdBulto //"", //Enviar Bulto HU
              },
              null
            )
            .then((oResp) => {
              if (
                oResp.fnSendPrintBulto &&
                oResp.fnSendPrintBulto.code == "S"
              ) {
                that.addListPopover({
                  type: "Success", // ["Error", "Warning", "Success", "Information"]
                  title: "Se realizó envío a la cola de impresión",
                  description:
                    "<p>" +
                    "La etiqueta IFA ha sido enviada a la cola de impresión." +
                    "</p>",
                  subtitle: "",
                });
                if (bRMD) {
                  console.log("* Actializando RMD....*");
                  BusyIndicator.show(0);
                  that.actualizaOrdenFraccion();
                } else {
                  MessageBox.information(
                    "La etiqueta IFA ha sido enviada a la cola de impresión"
                  );
                  BusyIndicator.hide();
                }
              } else {
                BusyIndicator.hide();
              }
            })
            .catch(function (oError) {
              that.iniciarModelo(that);
              BusyIndicator.hide();
              var sMensaje =
                "Ocurrio un error en el servicio de cola de impresión.";
              if (bRMD) {
                sMensaje = sMensaje + " Revisar historial";
              }
              MessageBox.error(sMensaje);
              console.log(oError);
            })
            .finally(function () {});
        },
        actualizaOrdenFraccion() {
          var that = this,
            oFormVerificationModel = that.getModel("FormVerificationModel"),
            oFormData = oFormVerificationModel.getData(),
            oModel = that.getHanaModel(),
            oModelERP = that.getERPModel();
          var aFilter = [new Filter("ORDENFRACCIONID", "EQ", "")];
          var cantidadA = 0;
          var dNow = new Date();

          let oEstadoFrac = that._getEstado(
            "ESTADO_CP_INSUMO",
            "PAIETIFA",
            that
          );
          cantidadA = oFormData.oPeso.neto;
          let oBody = {
            oEstado_iMaestraId: oEstadoFrac.iMaestraId, //880,
            fechaActualiza: dNow,
            usuarioActualiza: oFormData.oUsuario.verificado,
            cantAtendidaIfa: cantidadA,
          };
          // let sKey = goModel.createKey(
          //   // "/ORDEN_FRACCION",
          //   "/ORDEN_DETALLE"
          //   {
          //     ordenFraccionId:   oFormData.oInsumo.ordenFraccionId,
          //   }
          // );

          let sKey = goModel.createKey("/ORDEN_DETALLE", {
            ordenDetalleId: oFormData.oInsumo.ordenDetalleId,
          });
          oDataService
            .oDataUpdate(goModel, sKey, oBody)
            .then(function (oResult) {
              MessageBox.success("Proceso finalizado. Revisar el historial.", {
                title: "Operación Finalizada",
              });
              that.addListPopover({
                type: "Success", // ["Error", "Warning", "Success", "Information"]
                title: "Proceso finalizado.",
                description: "<p>" + "Proceso finalizado." + "</p>",
                subtitle: "",
              });
            })
            .catch(function (oError) {
              BusyIndicator.hide();
              console.log(oError);
            })
            .finally(function () {
              BusyIndicator.hide();
              that.iniciarModelo(that);
            });
        },
        _getMasterData: async function () {
          var that = this,
            oModel = that.getHanaModel(),
            oUrlParameters = {
              $expand: "oMaestraTipo",
            },
            aFilters = [];

          that
            .getView()
            .setModel(new sap.ui.model.json.JSONModel({}), "MaestraModel");

          aFilters.push(new Filter("activo", FilterOperator.EQ, true));
          var result = await oDataService.oDataRead(
            oModel,
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
            console.log("* MaestraModel * " + result.results.length);
            // modelFormVerificationModel.setProperty("/svcMasterData",true);
            // return true;
          }
          // MessageBox.error("Error al obtener datos maestros, actualice la página.");
          // return false;
        },
        _getEstado: function (ESTADO_CP_INSUMO, sCodigo, that) {
          //Estado a cambiar a nivel de orden
          var oMaestraModel = that.getModel("MaestraModel"),
            aEstadosCP = oMaestraModel.getProperty(`/${ESTADO_CP_INSUMO}`),
            aEstadosOrden = aEstadosCP;

          return aEstadosOrden.find((o) => o.codigo === sCodigo);
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

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("CPSPOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "LIBERAR":
              bValid = sRol.includes("CPSPLIBER");
              break;
            case "IMPRIMIR":
              bValid = sRol.includes("CPSPIMPB");
              break;
            case "ANULAR":
              bValid = sRol.includes("CPSPANUL");
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

        onDetalleBulto: function (oEvent) {
          var oView = this.getView(),
            oDialog = oView.byId("dialogoDetalleBulto");
          if (!oDialog) {
            // create dialog via fragment factory
            oDialog = sap.ui.xmlfragment(
              oView.getId(),
              "com.medifarma.cp.pesajeimpresionbultosaldo.view.dialog.detalleBultoDialog",
              this
            );
            oView.addDependent(oDialog);
          }
          oDialog.open();
        },
        _cerrarDialogoBultoLista: function () {
          this.getView().byId("dialogoDetalleBulto").close();
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
                  } else if (oResult.results) {
                    resolve(oResult.results);
                  } else if (typeof oResult == "object") {
                    resolve(oResult);
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
      }
    );
  }
);
