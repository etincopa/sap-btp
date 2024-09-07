sap.ui.define(
  [
    "../BaseController",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "com/medifarma/cp/manejopedidos/service/oDataService",
    "com/medifarma/cp/manejopedidos/lib/Sheet",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    formatter,
    MessageBox,
    MessageToast,
    Filter,
    FilterOperator,
    JSONModel,
    oDataService,
    Sheet
  ) {
    "use strict";
    var that,
      EQ = FilterOperator.EQ,
      BT = FilterOperator.BT,
      CONTAINS = FilterOperator.Contains,
      CONSTANT = {
        /**
         * GRUPO
         */
        GROL: "AMSP", //GRUPO ROL
        /**
         * TIPOS
         */
        TIPOP: "PAI", //PEDIDO CENTRAL PESADA
        NORM: "AMNORM", //PEDIDO NORMAL
        URGE: "AMURGE", //PEDIDO URGENTE
        ADIC: "AMADIC", //PEDIDO ADICIONAL
        INDI: "AMINDI", // PEDIDO INDIVIDUAL
        IDEM: "AMIDEM", // PEDIDO RESERVA IDE

        /**
         * DOCUMENTOS
         */
        CLASE_DOC: "CLASE_DOCUMENTO_AM",
        GRUPO_ART: "GRUPO_ARTICULO_AM",

        /**
         * ESTADOS
         */
        ESTADO_PEDIDO: "ESTADO_AM_PEDIDO",
        ESTADO_ORDEN: "ESTADO_AM_ORDEN",
        ESTADO_INSUMO: "ESTADO_AM_INSUMO",

        /**
         * PEDIDO
         */
        PPEND: "AMPPEND", //PENDIENTE
        PPROC: "AMPPROC", //PROCESO
        PCUMP: "AMPCUMP", //CUMPLIDO
        PBLOQ: "AMPBLOQ", //BLOQUEADO
        PANUL: "AMPANUL", //ANULADO
        /**
         * ORDEN
         */
        OPEND: "AMOPEND", //PENDIENTE
        OPICK: "AMOPICK", //PICKING
        OATEN: "AMOATEN", //ATENDIDO
        OPRSA: "AMOPRSA", //PROGRAMADO EN SALA
        OPEPE: "AMOPEPE", //PENDIENTE PESAJE
        OPESA: "AMOPESA", //PESANDO EN SALA
        OPEFI: "AMOPEFI", //PESAJE FINALIZADO
        OENTR: "AMOENTR", //ENTREGA EN TRANSITO
        OENVA: "AMOENVA", //ENTREGA VERIFICADA
        OPARC: "AMOPARC", //ENTREGA PARCIAL
        OTOT: "AMOTOT", //ENTREGA TOTAL

        OANUL: "AMOANUL", //ANULADO
        /**
         * INSUMO
         */
        IPEPI: "AMIPEPI", //PENDIENTE PICKING
        IENPI: "AMIENPI", //EN PICKING
        IATPI: "AMIATPI", //ATENDIDO PICKING
        INAPI: "AMINAPI", //NO ATENDIDO PICKING
        IENVA: "AMIENVA", //ENTREGA VERIFICADA
        IPEPE: "AMIPEPE", //PENDIENTE PESAJE
        IPESA: "AMIPESA", //PESANDO EN SALA
        IPEPR: "AMIPEPR", //PESAJE POR PRODUCCIÓN
        IPEFI: "AMIPEFI", //PESAJE FINALIZADO
        IPARC: "AMIPARC", //ENTREGA PARCIAL
        ITOT: "AMITOT", //ENTREGA TOTAL

        IANUL: "AMIANUL", //ANULADO
      };

    const rootPath = "com.medifarma.cp.manejopedidos";
    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.almacen.SeguimientoPickingPedido",
      {
        //Formatter
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
        /**-----------------------------------------------*/
        onInit: async function () {
          that = this;
          that.aRol = null;
          that.sRol = null;
          that.sDiffDays = 0;
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.sAppName = "ManejoPedidos";

          that.setModel(new JSONModel({}), "MaestraModel");
          that.setModel(new JSONModel({}), "PickingModel");
          that.setModel(new JSONModel({}), "FraccionDetalleModel");

          that.oRouter
            .getTarget("TargetSeguimientoPickingPedidoAlmacen")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
        },

        _handleRouteMatched: function (oEvent) {
          var that = this;
          this.getView().setModel(
            new sap.ui.model.json.JSONModel([]),
            "MaestraModel"
          );

          var aFilters = [];
          aFilters.push(new Filter("activo", EQ, true));

          var oUrlParameters = {
            $expand: "oMaestraTipo",
          };

          sap.ui.core.BusyIndicator.show(0);
          that
            ._getUserRolApp()
            .then((oResp) => {
              if (oResp) {
                var oLogin = sap.ui
                  .getCore()
                  .getModel("oUserLoginGobalModel")
                  .getData();
                var aRol = oLogin.aRol;
                var aRoleGroup = aRol.reduce(function (r, a) {
                  var sKey = a.accion.substr(0, 4);
                  r[sKey] = r[sKey] || [];
                  r[sKey].push(a);
                  return r;
                }, Object.create(null));
                that.aRol = aRoleGroup[CONSTANT.GROL];

                var aRoles = [];
                for (var key in that.aRol) {
                  aRoles.push(that.aRol[key].accion);
                }
                that.sRol = aRoles.join(",");

                return oDataService.oDataRead(
                  this.getView().getModel(),
                  "Maestra",
                  oUrlParameters,
                  aFilters
                );
              }
              return false;
            })
            .then((result) => {
              if (result) {
                var aConstant = result.results.reduce(function (r, a) {
                  var sKey = "NONE";
                  if (a.oMaestraTipo) {
                    sKey = a.oMaestraTipo.tabla.toUpperCase();
                  }
                  r[sKey] = r[sKey] || [];
                  if (!["AMOENFI", "AMOENTRE", "AMOPEPA"].includes(a.codigo)) {
                    r[sKey].push(a);
                  }
                  return r;
                }, Object.create(null));

                var constante = result.results.find(function (element) {
                  return element.codigo == "CONST104";
                });
                that.sDiffDays = constante.contenido ? Number(constante.contenido) : 30;

                that.getView().getModel("MaestraModel").setData(aConstant);

                that._getCentro();
                /**
                 * Cargar filtros predeterminados
                 * Por centro del usuario logueado
                 * Por los ultimos 30 dias de la fecha de creacion pedido
                 */
                that._cargaInicial();
              }
            })
            .catch((oError) => {});
        },

        _cargaInicial: async function () {
          //OBTENER CENTRO DEL USUARIO ACTUAL
          var oTable = this.byId("idTablePedidos");
          var centro = "";
          var login = sap.ui
            .getCore()
            .getModel("oUserLoginGobalModel")
            .getData();
          var filterUser = [];
          filterUser.push(new Filter("usuario", EQ, login.oUsuario.usuario));
          var usuario = await that._getODataDinamic(
            that.oModel,
            "Usuario",
            {},
            filterUser
          );
          if (usuario && usuario.length > 0) {
            var usuarioActual = usuario[0];
            centro = usuarioActual.oMaestraSucursal_codigo;
          }

          //OBTENER RANGO DE FECHAS DE 30 DIAS
          var dateFrom = new Date();
          var dateTo = new Date();
          dateFrom.setDate(dateFrom.getDate() - that.sDiffDays);
          var fechaDesde = that._removeHourFromDate(dateFrom);
          var fechaHasta = that._removeHourFromDate(dateTo);
          fechaDesde.setHours(0,0,0,0);
          fechaHasta.setHours(23, 59, 59, 999);
          //fechaDesde.setUTCHours(0, 0, 0, 0);
          //fechaHasta.setUTCHours(23, 59, 59, 999);

          //SETEAR VALORES POR DEFECTO EN FRAGMENT DE FILTROS
          var oView = that.getView();
          oView.byId("cbxCentro").setSelectedKey(centro);
          oView.byId("drsFechaRegistro").setFrom(fechaDesde);
          oView.byId("drsFechaRegistro").setTo(fechaHasta);

          //OBTENER PEDIDOS POR FILTROS
          var filterPedidos = [];
          var filters = [];
          var aPedidoFilter = null;
          filterPedidos.push(new Filter("Pedido_centro", EQ, centro));
          filterPedidos.push(new Filter("Pedido_fechaRegistro", BT, fechaDesde, fechaHasta));
          aPedidoFilter = await that._getODataDinamic(that.oModel, "VIEW_PEDIDO_FILTER_CP", {}, filterPedidos);
          if(aPedidoFilter && aPedidoFilter.length > 0){
            //ELIMINAR PEDIDOS DUPLICADOS
            aPedidoFilter = that._uniqByKeepFirst(
              aPedidoFilter,
              (it) => it.pedidoId
            );

            //ARMAR FILTRO POR PEDIDOS
            for (var key in aPedidoFilter) {
              filters.push(
                new Filter("pedidoId", EQ, aPedidoFilter[key].pedidoId)
              );
            }
          }

          //ARMAR FILTRO FINAL
          var oFinalFilter = new Filter({
            filters: filters,
            and: false,
          });

          //ACTUALIZAR BINDEO
          oTable.getBinding().filter(oFinalFilter);
          oTable.getBinding().refresh(true);
          sap.ui.core.BusyIndicator.hide();
        },

        /**-----------------------------------------------*/
        /*              E V E N T S
        /**-----------------------------------------------*/

        onRowSelectPedido: function (oEvent) {
          var that = this;
          that.oPedidoSelect = null;
          var oTable = this.byId("idTablePedidos");
          var iIndex = oTable.getSelectedIndex();
          var sPath;

          that.getModel("FraccionDetalleModel").setData([]);
          that.getModel("FraccionDetalleModel").refresh(true);

          if (iIndex < 0) {
            MessageToast.show("Selecione un item");
          } else {
            sPath = oTable.getContextByIndex(iIndex).getPath();
            var oData = oTable.getModel().getContext(sPath).getObject();
            try {
              if (oData) {
                that.oPedidoSelect = oData;
                that._getInsumoPedidoSelect(oData);
              }
            } catch (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            }
          }
        },

        onRowSelectInsumo: function (oEvent) {
          var oTable = this.byId("idTableInsumos");
          var iIndex = oTable.getSelectedIndex();
          var aBulto = [];

          if (iIndex !== -1) {
            var sPath = oTable.getContextByIndex(iIndex).getPath();
            var oInsumo = oTable
              .getModel("FraccionDetalleModel")
              .getContext(sPath)
              .getObject();

            aBulto = oInsumo.aBulto;
          }

          var oFraccionDetalleModel = that.getModel("FraccionDetalleModel");
          oFraccionDetalleModel.getData().Bultos = aBulto;
          oFraccionDetalleModel.refresh(true);
        },

        onAnularPedido: async function (oEvent) {
          if (!that._validateAccionAsigned("ANULAR")) return;

          var oTable = this.byId("idTablePedidos");
          var iIndex = oTable.getSelectedIndex();
          if (iIndex == -1)
            return MessageToast.show(that._getI18nText("msgOnNoSelectedRow"));

          var oPedidoSelec = oTable._getContexts()[iIndex].getObject();

          if (![CONSTANT.PPEND].includes(oPedidoSelec.codEstadoPedido)) {
            return MessageBox.information(
              "Seleccione un PEDIDO cuyo estado sea PENDIENTE"
            );
          }

          sap.ui.core.BusyIndicator.show(0);

          var oPedidoDetail = {
            oItemSelect: Object.assign({}, oPedidoSelec),
            oPedido: {},
            aInsumo: [],
          };

          var aFilter = [];
          aFilter.push(new Filter("pedidoId", EQ, oPedidoSelec.pedidoId));

          var aResult = await that._getODataDinamic(
            that.oModel,
            "VIEW_SEGUIMIENTO_DETALLE",
            {},
            aFilter
          );

          if (aResult && aResult.length > 0) {
            aResult = aResult.filter((o) => {
              /**
               * Filtrar solo registros que no esten anulados
               */
              return !(
                o.fraccionEstado == CONSTANT.OANUL ||
                o.insumoEstado == CONSTANT.IANUL
              );
            });

            /**
             * Evaluar si todos los insumos tienen el estado PENDIENTE_PICKING
             * para ANULAR el documento
             */

            var bValidAnulate = true;
            for (var oInsumo of aResult) {
              if (oInsumo.insumoEstado != CONSTANT.IPEPI) {
                bValidAnulate = false;
                break;
              }
            }

            /**
             * Si todos los insumos tienen el estado PEDIENTE_PICKING se anula el documento
             * A todos las INSUMO, FRACCION, ORDEN, PEDIDO se le asigna el estado ANULADO
             */
            var aEstado = that._getEstadoPedido();
            var oEstadoInsumoAnul = aEstado.Insumo.find(
                (o) => o.codigo === CONSTANT.IANUL
              ),
              oEstadoPedidoAnul = aEstado.Pedido.find(
                (o) => o.codigo === CONSTANT.PANUL
              ),
              oEstadoOrdenAnul = aEstado.Orden.find(
                (o) => o.codigo === CONSTANT.OANUL
              );

            if (bValidAnulate && aResult.length) {
              var aFraccion = that._getUniqueArray(aResult, [
                "ordenFraccionId",
              ]);

              var oAudit = {
                fechaActualiza: new Date(),
                usuarioActualiza: that.sUser,
              };
              var aPromise = [];

              var oPedido = aResult[0];

              if (oPedido) {
                var oKey = that.oModel.createKey("/PEDIDO", {
                  pedidoId: oPedido.pedidoId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoPedidoAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromise.push(
                  oDataService.oDataUpdate(that.oModel, oKey, oBody)
                );
              }

              for (var oFraccion of aFraccion) {
                var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                  ordenFraccionId: oFraccion.ordenFraccionId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoOrdenAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromise.push(
                  oDataService.oDataUpdate(that.oModel, oKey, oBody)
                );
              }
              for (var oInsumo of aResult) {
                var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oInsumo.ordenDetalleId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoInsumoAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromise.push(
                  oDataService.oDataUpdate(that.oModel, oKey, oBody)
                );
              }

              Promise.all(aPromise)
                .then((oResp) => {
                  MessageBox.success(that._getI18nText("msgActualiza"));
                  var oPedido = oPedidoDetail.oPedido;
                  var oOrdenSel = oPedidoDetail.oItemSelect;
                  that.byId("idTablePedidos").getBinding().refresh(true);
                  if (
                    that.oPedidoSelect &&
                    that.oPedidoSelect.ordenId == oOrdenSel.ordenId
                  ) {
                    that._getInsumoPedidoSelect(that.oPedidoSelect);
                  }
                  that.sendPedidoToErp(
                    that,
                    oPedido.pedidoId ? oPedido.pedidoId : oOrdenSel.pedidoId
                  );
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.success(that._getI18nText("msgActualiza"));
                })
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.error(that._getI18nText("msgActualizaErr"));
                  console.log(oError);
                });
            } else {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show(
                "Existen registros que ya iniciacion el proceso de atención"
              );
            }
          } else {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("No se encontro registros para actualizar");
          }
        },

        _getViewSeguimientoDetalle: async function (aFilters) {
          var aInsumo = await that
            ._getODataDinamic(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              {},
              aFilters
            )
            .catch((oError) => {
              console.log(oError);
              MessageBox.error(that._getI18nText("msgSendErr"));
            });

          if (aInsumo && aInsumo.length) {
            aInsumo = aInsumo.filter(
              (o) =>
                !(
                  CONSTANT.PANUL == o.pedidoEstado ||
                  CONSTANT.OANUL == o.fraccionEstado ||
                  CONSTANT.IANUL == o.insumoEstado
                )
            );
          } else {
            return [];
          }

          return aInsumo;
        },
        onLiberarInsumo: async function (oEvent) {
          if (!that._validateAccionAsigned("LIBERAR")) return;

          sap.ui.core.BusyIndicator.show(0);
          var oTable = this.byId("idTablePedidos");
          var iIndex = oTable.getSelectedIndex();
          if (iIndex == -1)
            return MessageToast.show(that._getI18nText("msgOnNoSelectedRow"));
          var oPedidoSelec = oTable._getContexts()[iIndex].getObject();

          var oInsumo = oEvent
            .getSource()
            .getBindingContext("FraccionDetalleModel")
            .getObject();

          var oOrden = that.oPedidoSelect;
          var aFilters = [];
          aFilters.push(new Filter("pedidoId", EQ, oInsumo.pedidoId));

          var aInsumo = await that._getViewSeguimientoDetalle(aFilters);

          if (aInsumo && aInsumo.length) {
            oInsumo = aInsumo.find(
              (o) => o.ordenDetalleId == oInsumo.ordenDetalleId
            );

            /**
             * Para Liberar un Insumo, se evalua que el estado este en ATENDIDO_PICKING
             */
            if (
              [CONSTANT.IATPI /*, CONSTANT.IENPI*/].includes(
                oInsumo.insumoEstado
              )
            ) {
              var InsumoAtencionSet = [];
              var oBody = {
                Pedido: oOrden.numPedido,
                Orden: oOrden.numOrden,
                Fraccion: oOrden.numFraccion.toString(),
                InsumoAtencionSet: [],
                BultoInsumoLiberarSet: [],
              };
              InsumoAtencionSet.push({
                CodigoInsumo: oInsumo.codigoInsumo,
                LoteInsumo: oInsumo.lote,
                Subfraccion: oInsumo.numSubFraccion.toString(),
              });

              oBody.InsumoAtencionSet = InsumoAtencionSet;

              var aResp = await oDataService
                .oDataCreate(that.oModelErp, "LiberarInsumoSet", oBody)
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                  console.log(oError);
                  MessageBox.error(that._getI18nText("msgSendErr"));
                });

              that.sendLogProcess(
                that.oModel,
                that.sUser,
                "ALMACEN MATERIALES",
                "SEGUIMIENTO PICKING",
                "onLiberarInsumo",
                "LIBERAR INSUMO",
                "I",
                "POST",
                "LiberarInsumoSet",
                "",
                JSON.stringify(oBody ?? {}),
                JSON.stringify(aResp ?? {})
              );

              /**
                 * LiberarInsumoSet
                 {
                    "Pedido": "70000304",
                    "Orden": "300002176",
                    "Fraccion": "1",
                    "InsumoAtencionSet": [
                      {
                        "CodigoInsumo": "1000010245",
                        "LoteInsumo": "8000000002",
                        "Subfraccion": "1"
                      }
                    ],
                    "BultoInsumoLiberarSet": []
                  }
  
                 */
              /*
                var aResp = {
                  data: {
                    Pedido: "70000304",
                    Orden: "300002176",
                    Fraccion: "01",
                    BultoInsumoLiberarSet: {
                      results: [],
                    },
                    InsumoAtencionSet: {
                      results: [
                        {
                          Pedido: "70000304",
                          Orden: "300002175",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0001",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002175",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0002",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002175",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0003",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002176",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0001",
                          Mess: "Se actualizó a PENDIENTE PICKING",
                          FlagActSt: "1",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002176",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0002",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002176",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0003",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002177",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0001",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002177",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0002",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                        {
                          Pedido: "70000304",
                          Orden: "300002177",
                          Fraccion: "01",
                          CodigoInsumo: "1000010245",
                          LoteInsumo: "8000000002",
                          Subfraccion: "0003",
                          Mess: "Se actualizó a PICKING",
                          FlagActSt: "2",
                        },
                      ],
                    },
                  },
                  statusCode: 201,
                };
              */
              sap.ui.core.BusyIndicator.hide();
              if (aResp && aResp.statusCode == 201) {
                aResp = aResp.data;
                console.log(aResp);
                var aListMessage = [];

                var aMessageResp = aResp.BultoInsumoLiberarSet.results;
                aMessageResp.forEach((o, i) => {
                  if (o.Typevalidar) {
                    aListMessage.push(o.Typevalidar + ": " + o.Messagevalidar);
                  } else {
                    aListMessage.push(
                      o.Typetrasladar +
                        ": " +
                        (o.Mblnr ? "HU: " + o.IdBulto + " " : "") +
                        o.Messagetrasladar
                    );
                  }
                });

                if (aListMessage && aListMessage.length) {
                  aMessageResp = that._uniqByKeepFirst(
                    aMessageResp,
                    (it) => it
                  );

                  that._showServiceListMessage("Detalle: ", aListMessage);
                  //return;
                }

                var aInsumoAtencion = aResp.InsumoAtencionSet.results;

                if (aInsumoAtencion.length) {
                  aInsumoAtencion.forEach((o, i) => {
                    delete o.__metadata;
                    delete o.LiberarInsumo;
                    if (o.Mess) aListMessage.push(o.Mess);

                    var oInsumoAtencion = aInsumo.find(
                      (a) =>
                        a.pedidoNumero == o.Pedido &&
                        a.ordenNumero == o.Orden &&
                        +a.numFraccion == +o.Fraccion &&
                        a.codigoInsumo == o.CodigoInsumo &&
                        a.lote == o.LoteInsumo &&
                        +a.numSubFraccion == +o.Subfraccion
                    );

                    oInsumoAtencion.insumoEstado =
                      +o.FlagActSt == 1
                        ? CONSTANT.IPEPI //PENDIENTE PICKING
                        : +o.FlagActSt == 2
                        ? CONSTANT.IENPI //EN PICKING
                        : oInsumoAtencion.insumoEstado;
                    oInsumoAtencion.edit = true;
                  });

                  /**
                   * SI EL INSUMO FUE LIBERADO:
                   * ACTUALIZAR LOS ESTADOS PICKING DE TODAS LAS ORDENES AFECTADAS POR LA LIBERACION;
                   */
                  var oPedidoFormat =
                    that._viewFormatPedidoConsolidado(aInsumo)[0];
                  var oPedidoUpdate = that._validatePickingAll(oPedidoFormat);

                  var aPromise = [];
                  var aPromiseUp = [];
                  var aEstado = that._getEstadoPedido();
                  var oAudit = {
                    fechaActualiza: new Date(),
                    usuarioActualiza: that.sUser,
                  };

                  for (var oOrdenUp of oPedidoUpdate.aOrden) {
                    for (var oFraccionUp of oOrdenUp.aFraccion) {
                      /**
                       * INSUMO
                       */
                      var aVerificacionEstado = [];
                      for (var oInsumoUp of oFraccionUp.aInsumo) {
                        if (oInsumoUp.edit) {
                          var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                            ordenDetalleId: oInsumoUp.ordenDetalleId,
                          });
                          var oEntity = {
                            estadoTraslado: null,
                            verificacionEstado: null,
                            verificacionUsu: null,
                            verificacionFec: null,
                            pickingUsu: null,
                            pickingFec: null,
                            cantAtendida: 0,
                            oEstado_iMaestraId: aEstado.Insumo.find(
                              (o) => o.codigo === oInsumoUp.insumoEstado
                            ).iMaestraId,
                          };

                          var oBody = { ...oEntity, ...oAudit };
                          aPromise.push({ oKey: oKey, oBody: oBody });

                          aVerificacionEstado.push({
                            verificacionEstado: null,
                          });
                        } else {
                          aVerificacionEstado.push({
                            verificacionEstado: oInsumoUp.verificacionEstado,
                          });
                        }
                      }

                      /**
                       * FRACCION
                       */
                      if (oFraccionUp.edit) {
                        var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                          ordenFraccionId: oFraccionUp.ordenFraccionId,
                        });

                        var isVerificado = aVerificacionEstado.some(
                          (elem, index) => {
                            return ["V", "I"].includes(elem.verificacionEstado);
                          }
                        );

                        var oEntity = {
                          verificacionEstado: isVerificado ? "I" : null,
                          verificacionFinUsu: null,
                          verificacionFinFec: null,
                          pickingFinUsu: null,
                          pickingFinFec: null,
                          oEstado_iMaestraId: aEstado.Orden.find(
                            (o) => o.codigo === oFraccionUp.fraccionEstado
                          ).iMaestraId,
                        };

                        if (oFraccionUp.fraccionEstado == CONSTANT.OPEND) {
                          oEntity.pickingIniUsu = null;
                          oEntity.pickingIniFec = null;
                        }

                        var oBody = { ...oEntity, ...oAudit };
                        aPromise.push({ oKey: oKey, oBody: oBody });
                      }
                    }
                  }

                  /**
                   * PEDIDO
                   */
                  if (oPedidoUpdate.edit) {
                    var oPedido = oPedidoUpdate;
                    var oKey = that.oModel.createKey("/PEDIDO", {
                      pedidoId: oPedido.pedidoId,
                    });
                    var oEntity = {
                      pickingUsuFin: null,
                      pickingFecFin: null,
                      oEstado_iMaestraId: aEstado.Pedido.find(
                        (o) => o.codigo === oPedidoUpdate.pedidoEstado
                      ).iMaestraId,
                    };

                    if (oPedidoUpdate.pedidoEstado == CONSTANT.PPEND) {
                      oEntity.pickingUsuInic = null;
                      oEntity.pickingFecInic = null;
                    }

                    var oBody = { ...oEntity, ...oAudit };
                    aPromise.push({ oKey: oKey, oBody: oBody });
                  }

                  if (aPromise.length) {
                    console.log(aPromise);
                    for (var oPromise of aPromise) {
                      aPromiseUp.push(
                        oDataService.oDataUpdate(
                          that.oModel,
                          oPromise.oKey,
                          oPromise.oBody
                        )
                      );
                    }

                    Promise.all(aPromiseUp)
                      .then((oResp) => {
                        MessageBox.success(that._getI18nText("msgActualiza"));
                        var oPedido = oPedidoSelec;
                        that.byId("idTablePedidos").getBinding().refresh(true);
                        that._getInsumoPedidoSelect(that.oPedidoSelect);
                        that.sendPedidoToErp(that, oPedido.pedidoId);
                        sap.ui.core.BusyIndicator.hide();
                      })
                      .catch((oError) => {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(that._getI18nText("msgActualizaErr"));
                        console.log(oError);
                      });
                  } else {
                    aPromise = [];
                  }
                }

                if (aListMessage && aListMessage.length) {
                  aMessageResp = that._uniqByKeepFirst(
                    aMessageResp,
                    (it) => it
                  );

                  that._showServiceListMessage("Detalle: ", aListMessage);
                  return;
                } else {
                  return MessageBox.warning(
                    "Se realizó la solicitud pero no se encontró respuesta."
                  );
                }
              } else {
                return MessageBox.error(that._getI18nText("msgRespErr"));
              }
            }
          }
        },

        onImprimirGroup: async function (oEvent) {
          if (!that._validateAccionAsigned("IMPRIMIR")) return;
          var iIndex = oEvent.getSource().getParent().getIndex();
          var oPrint = JSON.parse(window.localStorage.getItem("oImpresora"));
          try {
            MessageToast.show(
              "Impresora Seleccionada: " + oPrint.valueImpresora
            );
          } catch (oError) {
            MessageToast.show("Seleccione una impresora para continuar");
            return false;
          }
          if (iIndex !== -1) {
            var oBindingContext = oEvent
                .getSource()
                .getBindingContext("FraccionDetalleModel"),
              oBulto = oBindingContext.getObject();

            var oAction = await that.doMessageboxActionCustom(
              "¿Esta seguro de imprimir etiqueta en grupo?",
              "Impresora: " + oPrint.valueImpresora,
              ["SI", "CANCEL"]
            );
            if (oAction === "SI") {
              var oInsumo = oBulto;
              var aBulto = oInsumo.aBulto;
              var aBultoEntero = [];
              for (var key in aBulto) {
                var oBulto = aBulto[key];
                if (
                  [
                    "ENTERO",
                    "ENTERO_ALM",
                    "SALDO_FRAC_ALM",
                    "SALDO_ALM",
                  ].includes(oBulto.Tipo)
                ) {
                  if (oBulto.IdBulto) {
                    aBultoEntero.push(oBulto);
                  }
                }
              }

              if (aBultoEntero.length <= 0) {
                return MessageBox.show(
                  "No se encontraron Bultos ENTERO / SALDO FRAC."
                );
              }
              that._sendPrint({
                aBultos: aBultoEntero,
                oInsumo: oInsumo,
                sSaldo: "GROUP",
              });
            }
          }
        },
        onImprimir: async function (oEvent) {
          if (!that._validateAccionAsigned("IMPRIMIR")) return;
          const oSource = oEvent.getSource();
          var sLevel = oSource.data("level");
          var iIndex = oEvent.getSource().getParent().getIndex();

          var oPrint = JSON.parse(window.localStorage.getItem("oImpresora"));
          try {
            MessageToast.show(
              "Impresora Seleccionada: " + oPrint.valueImpresora
            );
          } catch (oError) {
            MessageToast.show("Seleccione una impresora para continuar");
            return false;
          }

          if (sLevel != "ORDEN") {
            if (iIndex !== -1) {
              var oBindingContext = oEvent
                  .getSource()
                  .getBindingContext("FraccionDetalleModel"),
                oBulto = oBindingContext.getObject();

              var oAction = await that.doMessageboxActionCustom(
                "¿Esta seguro de imprimir el bulto?",
                "Impresora: " + oPrint.valueImpresora,
                ["SI", "CANCEL"]
              );
              if (oAction === "SI") {
                if (!["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
                  return MessageBox.show(
                    "El bulto selecionado no es un BULTO SALDO FRACCION."
                  );
                }

                var oTable = that.byId("idTableInsumos");
                var iIndex = oTable.getSelectedIndex();
                var sPath;
                sPath = oTable.getContextByIndex(iIndex).getPath();
                var oInsumo = oTable
                  .getModel("FraccionDetalleModel")
                  .getContext(sPath)
                  .getObject();
                that._sendPrint({
                  aBultos: [oBulto],
                  oInsumo: oInsumo,
                  idBulto: oBulto.IdBulto,
                });
              }
            }
          } else {
            var oObject = oSource.getBindingContext().getObject();
            if (oObject.codEtiquetaOrden) {
              MessageBox.confirm("Impresora: " + oPrint.valueImpresora, {
                title: "¿Desea imprimir la etiqueta de Identificación?",
                onClose: function (oAction) {
                  if (oAction === "OK") {
                    that._sendPrint({
                      aBultos: [{ Etiqueta: oObject.codEtiquetaOrden }],
                      oInsumo: null,
                    });
                  }
                  sap.ui.core.BusyIndicator.hide();
                },
              });
            } else {
              var oObject = oSource.getBindingContext().getObject();
              var aFilter = [];
              aFilter.push(
                new Filter("ordenFraccionId", EQ, oObject.ordenFraccionId)
              );

              var oOrden = null;
              oDataService
                .oDataRead(that.oModel, "ORDEN_FRACCION", {}, aFilter)
                .then((oResult) => {
                  oOrden = oResult.results[0];
                  if (oOrden.etiqueta) {
                    MessageBox.confirm("Impresora: " + oPrint.valueImpresora, {
                      title: "¿Desea imprimir la etiqueta de Identificación?",
                      onClose: function (oAction) {
                        if (oAction === "OK") {
                          that._sendPrint({
                            aBultos: [
                              {
                                Etiqueta: oOrden.etiqueta,
                              },
                            ],
                            oInsumo: null,
                          });
                        }
                        sap.ui.core.BusyIndicator.hide();
                      },
                    });
                  } else {
                    MessageBox.confirm("Impresora: " + oPrint.valueImpresora, {
                      title: "¿Desea imprimir la etiqueta de Identificación?",
                      onClose: function (oAction) {
                        if (oAction === "OK") {
                          var aBultoNew = [
                            {
                              Pedido: oObject.numPedido,
                              Centro: oObject.centro,
                              Orden: oObject.numOrden,
                              Fraccion: oObject.numFraccion.toString(),
                              Subfraccion: "0",
                              CodigoInsumo: "",
                              Lote: "",
                              Tipo: "IDEN_PROD",
                              NroItem: "1",
                              IdBulto: "",
                              CantidadA: "0",
                              Tara: "0",
                              UnidadM: "",
                              Almacen: "",
                              Status: "",
                              Etiqueta: "",
                              UsuarioAte: that.sUser,
                              Impresion: "",
                              Reimpresion: "",
                              DocMat: "",
                              CantConsumida: "0",
                              //HoraAte: formatter.formatPTHMS(formatter.getMsToHMS(o.HoraAte)),
                              //FechaAte: formatter.getFormatShortDateYMD(new Date()) + "T00:00:00.0000000",
                            },
                          ];

                          oDataService
                            .oDataCreate(that.oModel, "/acSetEtiquetaErp", {
                              oBody: JSON.stringify(aBultoNew),
                            })
                            .then((oResult) => {
                              if (oResult.statusCode == "200") {
                                var oEtiqueta =
                                  oResult.data.acSetEtiquetaErp.data
                                    .AtendidoItemSet.results[0];
                                var oAudit = {
                                  fechaActualiza: new Date(),
                                  usuarioActualiza: that.sUser,
                                };
                                var oKey = that.oModel.createKey(
                                  "/ORDEN_FRACCION",
                                  {
                                    ordenFraccionId: oOrden.ordenFraccionId,
                                  }
                                );
                                var oEntity = {
                                  etiqueta: oEtiqueta.Etiqueta,
                                };

                                var oBody = { ...oEntity, ...oAudit };

                                oDataService
                                  .oDataUpdate(that.oModel, oKey, oBody)
                                  .then((aResp) => {
                                    MessageToast.show(
                                      "Etiqueta generada con exito, enviado a la cola de impresión ..."
                                    );

                                    oOrden.codEtiquetaOrden =
                                      oEtiqueta.Etiqueta;

                                    that._sendPrint({
                                      aBultos: [
                                        {
                                          Etiqueta: oEtiqueta.Etiqueta,
                                        },
                                      ],
                                      oInsumo: null,
                                    });
                                  })
                                  .catch(function (oError) {
                                    console.log(oError);
                                    sap.ui.core.BusyIndicator.hide();
                                  });
                              } else {
                                MessageBox.warning(
                                  "No se puedo generar la etiqueta."
                                );
                              }
                              sap.ui.core.BusyIndicator.hide();
                            })
                            .catch((oError) => {
                              sap.ui.core.BusyIndicator.hide();
                              console.log(oError);
                            });
                        } else {
                          sap.ui.core.BusyIndicator.hide();
                          return;
                        }
                      },
                    });
                  }
                })
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                });
            }
          }
        },
        /**
         * @Description
         * Evento del boton "Exportar" que genera el documento XLSX
         * el evento hace uso de la libreria externa Sheet para la generacion del documentos XLSX
         * -  Libreria: ../lib/Sheet.js
         *
         * @param   {object} oEvent
         * @return  none
         * @History
         * v1.0 – Version inicial
         *
         */
        onExportXLSReport: async function (oEvent) {
          var oUrlParameters = {
              $orderby: "numPedido desc",
            },
            aFilters = [],
            EQ = FilterOperator.EQ;

          var oTable = this.byId("idTablePedidos");
          var oBinding = oTable.getBinding();
          aFilters = oBinding.aFilters;
          aFilters.push(new Filter("tipoCodigo", EQ, "PAI"));
          sap.ui.core.BusyIndicator.show(0);
          var oResp = await oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_PICKING_CP",
              oUrlParameters,
              aFilters
            )
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            });
          sap.ui.core.BusyIndicator.hide();
          var aOrdenList = oResp.results;

          //aOrdenList = this.sortByAttribute(aOrdenList, "numPedido", "numFraccion");

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "SEGIMIENTO PICKING PEDIDO ALMACEN",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("PEDIDO");
          /*wb.SheetNames.push("DETALLE");
              wb.SheetNames.push("BULTO");*/

          var ws_headerPedido = [
            that._getI18nText("lblPedido"), //"Pedido",
            that._getI18nText("clTipoPedido"), //"Tipo de Pedido",
            that._getI18nText("clOrdReser"), //"Orden Prod/Reserva",
            that._getI18nText("clFraccion"), //"Fracción",
            that._getI18nText("clCodPT"), //"Codigo PT",
            that._getI18nText("clDescPT"), //"Descripción PT",
            that._getI18nText("clLotePT"), //"Lote PT",
            that._getI18nText("dclSala"), //"Sala",
            that._getI18nText("clEstado"), //"Estado",

            that._getI18nText("dclVerificado"), //"Verificado",
            that._getI18nText("clCantItems"), //"Cant. Items",
            that._getI18nText("clCantBultos"), //"Cant. Bulto Entero",

            that._getI18nText("clUsuCreacion"), //"Usuario Creación",
            that._getI18nText("clFecCreacion"), //"Fecha Creación",
            that._getI18nText("clHoraCreacion"), //"Hora Creación",

            that._getI18nText("clUsuIniPicking"), //"Usuario Inicio Picking",
            that._getI18nText("clFecIniPicking"), //"Fecha Inicio Picking",
            that._getI18nText("clHoraIniPicking"), //"Hora Inicio Picking",

            that._getI18nText("clUsuFinPicking"), //"Usuario Fin Picking",
            that._getI18nText("clFecFinPicking"), //"Fecha Fin Picking",
            that._getI18nText("clHoraFinPicking"), //"Hora Fin Picking",

            that._getI18nText("clUsuIniVerif"), //"Verificación Inicio Usuario",
            that._getI18nText("clFecIniVerif"), //"Verificación Inicio Fecha",
            that._getI18nText("clHoraIniVerif"), //"Verificación Inicio Hora",

            that._getI18nText("clUsuFinVerif"), //"Verificación Fin Usuario",
            that._getI18nText("clFecFinVerif"), //"Verificación Fin Fecha",
            that._getI18nText("clHoraFinVerif"), //"Verificación Fin Hora",

            that._getI18nText("clUsuEntregaFis"), //"Entrega Fisica Usuario",
            that._getI18nText("clFecEntregaFis"), //"Entrega Fisica Fecha",
            that._getI18nText("clHoraEntregaFis"), //"Entrega Fisica Hora",
          ];
          var ws_dataPedido = [];

          ws_dataPedido.push(ws_headerPedido);

          for (var key in aOrdenList) {
            var report = aOrdenList[key];

            var ws_contentPedido = [
              report.numPedido,
              report.tipoPedido,
              report.numOrden,
              report.numFraccion,
              report.codProdTerm,
              report.nomProdTerm,
              report.loteProdTerm,
              report.sala,
              report.estadoOrden,
              //report.tamanoLote,
              formatter.textStatusVerif(report.ordenVerificacionEstado),
              report.cantInsumos,
              report.cantBultos,
              report.usuCreacion,
              formatter.getTimestampToDMY(report.fecCreacion),
              formatter.getTimestampToHMS(report.fecCreacion),

              report.usuInicioPick,
              formatter.getTimestampToDMY(report.fecInicioPick),
              formatter.getTimestampToHMS(report.fecInicioPick),
              report.usuFinPick,
              formatter.getTimestampToDMY(report.fecFinPick),
              formatter.getTimestampToHMS(report.fecFinPick),

              report.verificacionIniUsu,
              formatter.getTimestampToDMY(report.verificacionIniFec),
              formatter.getTimestampToHMS(report.verificacionIniFec),
              report.verificacionFinUsu,
              formatter.getTimestampToDMY(report.verificacionFinFec),
              formatter.getTimestampToHMS(report.verificacionFinFec),

              report.entregaFisUsu,
              formatter.getTimestampToDMY(report.entregaFisFec),
              formatter.getTimestampToHMS(report.entregaFisFec),
            ];

            ws_dataPedido.push(ws_contentPedido);
          }

          var wsPedido = XLSX.utils.aoa_to_sheet(ws_dataPedido);

          for (var key in wsPedido) {
            if (key !== "!ref") {
              wsPedido[key]["s"] = {
                fill: {
                  patternType: "none", // none / solid
                  fgColor: {
                    rgb: "FF6666",
                  },
                },
                font: {
                  name: "Arial",
                  sz: 24,
                  bold: true,
                  color: {
                    rgb: "FFFFAA00",
                  },
                },
              };
            }
          }

          wb.Sheets["PEDIDO"] = wsPedido;
          XLSX.write(wb, {
            bookType: "xlsx",
            bookSST: true,
            type: "binary",
          });

          XLSX.writeFile(wb, "SEGIMIENTO PICKING PEDIDO ALMACEN.xlsx");
        },

        onExportXLSInsumoReport: function (oEvent) {
          var aData = that.getView().getModel("FraccionDetalleModel").getData();

          var aOrdenList = aData.Insumos;

          aOrdenList = that.sortByAttribute(
            aOrdenList,
            "ordenNumero",
            "ordenPos",
            "numFraccion",
            "numSubFraccion",
            "codigoInsumo",
            "lote"
          );

          var ws_headerOrden = [
            that._getI18nText("lblPedido"), //"Pedido",
            that._getI18nText("clOrdReser"), //"Orden Prod/Reserva",
            that._getI18nText("clFraccion"), //"Fracción",
            that._getI18nText("clCodPT"), //"Codigo Producto",
            that._getI18nText("clDescPT"), //"Descripción Producto",
            that._getI18nText("clLotePT"), //"Lote Producto",

            that._getI18nText("dclAlmacen"),
            that._getI18nText("clPosnr"),
            that._getI18nText("clSubFraccion"),
            that._getI18nText("lblCodigoInsumo"),
            that._getI18nText("lblLoteInsumo"),
            that._getI18nText("clDescripcion"),
            that._getI18nText("clEstado"),
            that._getI18nText("dclVerificado"),
            that._getI18nText("clCantReq"),
            that._getI18nText("clUnidad"),
            that._getI18nText("dclCantSugTotal"),
            that._getI18nText("dclCantSug"),
            that._getI18nText("clCantPed"),
            that._getI18nText("dclAgotar"),
            that._getI18nText("clCantEntero"),
            that._getI18nText("clUnidad"),
          ];

          var ws_headerBulto = [
            that._getI18nText("clPosnr"),
            that._getI18nText("clSubFraccion"),
            that._getI18nText("lblCodigoInsumo"),
            that._getI18nText("lblLoteInsumo"),
            that._getI18nText("clDescripcion"),

            that._getI18nText("clCodigoBulto"),
            that._getI18nText("clTicketAten"),
            that._getI18nText("clTipoBulto"),

            that._getI18nText("clPesoNeto"),
            that._getI18nText("clTara"),
            that._getI18nText("clPesoBruto"),
            that._getI18nText("clUnidad"),
            that._getI18nText("clUsuRegistro"),
            that._getI18nText("clFecRegistro"),
            that._getI18nText("clHorRegistro"),
          ];

          var ws_dataOrden = [];
          ws_dataOrden.push(ws_headerOrden);

          var ws_dataBulto = [];
          ws_dataBulto.push(ws_headerBulto);

          for (var key in aOrdenList) {
            var report = aOrdenList[key];

            var ws_contentOrden = [
              report.pedidoNumero,
              report.ordenNumero,
              report.numFraccion,
              report.ordenCodProd,
              report.ordenDescrip,
              report.ordenLote,

              report.almacen,
              report.ordenPos,
              report.numSubFraccion,
              report.codigoInsumo,
              report.lote,
              report.descripcion,
              report.insumoEstadoDes,
              formatter.textStatusVerif(report.verificacionEstado),
              formatter.formatWeight(report.cantRequerida),
              report.cantRequeridaUM,
              formatter.formatWeight(report.cantSugeridaTotal),
              formatter.formatWeight(report.cantSugerida),
              formatter.formatWeight(report.sugerido),
              report.agotar == null || report.agotar == "" ? "No" : "Si",
              formatter.formatWeight(report.cantAtendida),
              report.unidad,
            ];

            ws_dataOrden.push(ws_contentOrden);
          }
          var wsOrden = XLSX.utils.aoa_to_sheet(ws_dataOrden);

          for (var key1 in aOrdenList) {
            var oInsumo = aOrdenList[key1];
            var aBultoList = oInsumo.aBulto;
            aBultoList = that.sortByAttribute(aBultoList, "Tipo");
            for (var key in aBultoList) {
              var report = aBultoList[key];

              var ws_contentBulto = [
                oInsumo.ordenPos,
                oInsumo.numSubFraccion,
                oInsumo.codigoInsumo,
                oInsumo.lote,
                oInsumo.descripcion,

                report.IdBulto,
                report.Etiqueta,
                report.Tipo,
                report.Tipo === "FRACCION"
                  ? formatter.formatWeight(report.BalanzaPeso)
                  : formatter.formatWeight(report.CantidadA),

                report.Tipo === "FRACCION"
                  ? formatter.formatWeight(report.Tara)
                  : ["KG", "G"].includes(report.UnidadM.toUpperCase())
                  ? formatter.formatWeight(report.Tara)
                  : "",

                report.Tipo === "FRACCION"
                  ? formatter.getSuma(report.BalanzaPeso, report.Tara, 0)
                  : ["KG", "G"].includes(report.UnidadM.toUpperCase())
                  ? formatter.getSuma(report.CantidadA, report.Tara, 0)
                  : "",

                report.Tipo === "FRACCION"
                  ? report.BalanzaUnidadM
                  : report.UnidadM,
                report.UsuarioAte,
                formatter.getTimestampToDMY2(report.FechaAte),
                formatter.getMsToHMS(report.HoraAte),
              ];

              ws_dataBulto.push(ws_contentBulto);
            }
          }
          var wsBulto = XLSX.utils.aoa_to_sheet(ws_dataBulto);

          for (var key in wsOrden) {
            if (key !== "!ref") {
              wsOrden[key]["s"] = {
                fill: {
                  patternType: "none", // none / solid
                  fgColor: {
                    rgb: "FF6666",
                  },
                },
                font: {
                  name: "Arial",
                  sz: 24,
                  bold: true,
                  color: {
                    rgb: "FFFFAA00",
                  },
                },
              };
            }
          }

          for (var key in wsBulto) {
            if (key !== "!ref") {
              wsBulto[key]["s"] = {
                fill: {
                  patternType: "none", // none / solid
                  fgColor: {
                    rgb: "FF6666",
                  },
                },
                font: {
                  name: "Arial",
                  sz: 24,
                  bold: true,
                  color: {
                    rgb: "FFFFAA00",
                  },
                },
              };
            }
          }

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "REPORTE ORDEN",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("INSUMO");
          wb.Sheets["INSUMO"] = wsOrden;

          wb.SheetNames.push("BULTO");
          wb.Sheets["BULTO"] = wsBulto;

          XLSX.write(wb, {
            bookType: "xlsx",
            bookSST: true,
            type: "binary",
          });

          XLSX.writeFile(wb, "REPORTE SEGIMIENTO PICKING INSUMO.xlsx");
        },

        onSearchFilter: async function (oEvent) {
          try {
            sap.ui.core.BusyIndicator.show(0);
            that._resetModel();
            var oFilter = "",
              oSelectionSet = oEvent.getParameter("selectionSet"),
              oTablePedido = this.byId("idTablePedidos"),
              oTableOrden = this.byId("idTableInsumos"),
              aFiltersPedidos = [],
              aFiltersOrdenes = [],
              oFinalFilter,
              oCamposOmitidos = ["Pedido_centro", "Pedido_fechaRegistro"],
              oCentro = "",
              oFechaRegFrom = null,
              oFechaRegTo = null,
              campoVacio = true;

            //VALIDAR SI HAY CAMPOS VACIOS
            for (let index = 0; index < oSelectionSet.length; index++) {
              const element = oSelectionSet[index];
              if (!oCamposOmitidos.includes(element.data().controlPath)) {
                if (element.data().controlType == "ComboBox") {
                  campoVacio = element.getSelectedKey() !== "" ? false : true;
                } else if (element.data().controlType === "Input") {
                  campoVacio = element.getValue() !== "" ? false : true;
                } else if (element.data().controlType === "DateRange") {
                  campoVacio = element.getFrom() !== null ? false : true;
                } else if (element.data().controlType === "CheckBox") {
                  campoVacio = element.getSelected() ? false : true;
                }
                if (!campoVacio) {
                  break;
                }
              }
            }

            //CARGAR CENTRO Y FECHA DE REGISTRO
            for (let index = 0; index < oSelectionSet.length; index++) {
              const element = oSelectionSet[index];
              if (element.data().controlPath == "Pedido_centro") {
                oCentro = element.getSelectedKey();
              } else if(element.data().controlPath == "Pedido_fechaRegistro"){
                oFechaRegFrom = element.getFrom();
                oFechaRegTo = element.getTo();
              }
            }

            //VALIDACION DE CAMPOS VACIOS
            if(campoVacio){
              //NO HAY CENTRO NI FECHA
              if(oCentro.length == 0 && (oFechaRegFrom == null || oFechaRegTo == null)){
                MessageBox.warning(that._getI18nText("mssgErrorCentFech"), {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: async function (sAction) {
                    if (sAction == "OK") {
                      that.searchFilter(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                    }
                  }
                });
              }
              //NO HAY CENTRO PERO SI HAY FECHA REG
              if(oCentro.length == 0 && (oFechaRegFrom != null || oFechaRegTo != null)){
                MessageBox.warning(that._getI18nText("msgErrorCentro"), {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: function (sAction) {
                    if (sAction == "OK") {
                      var esto = that;
                      var bOk = that.validaFechaRegistro(oFechaRegFrom, oFechaRegTo, that.sDiffDays);
                      if (bOk) {
                        MessageBox.warning(that._getI18nText("msgWarningFechaReg"), {
                          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                          emphasizedAction: MessageBox.Action.OK,
                          onClose: function (sAction1) {
                            if (sAction1 == "OK") {
                              esto.searchFilter(esto, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                            }
                          }
                        });
                      } else {
                        that.searchFilter(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                      }
                    }
                  }
                });
              }
              //HAY CENTRO PERO NO HAY FECHA REG
              if(oCentro.length > 0 && (oFechaRegFrom == null || oFechaRegTo == null)){
                MessageBox.warning(that._getI18nText("msgErrorFechaReg"), {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: async function (sAction) {
                    if (sAction == "OK") {
                      that.searchFilter(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                    }
                  }
                });
              }
              //HAY CENTRO Y HAY FECHA REG
              if(oCentro.length > 0 && (oFechaRegFrom != null || oFechaRegTo != null)){
                var esto = that;
                var bOk = that.validaFechaRegistro(oFechaRegFrom, oFechaRegTo, that.sDiffDays);
                if (bOk) {
                  MessageBox.warning(that._getI18nText("msgWarningFechaReg"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction1) {
                      if (sAction1 == "OK") {
                        esto.searchFilter(esto, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                      }
                    }
                  });
                } else {
                  that.searchFilter(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
                }
              }
            }else{
              that.searchFilter(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter);
            }
            await new Promise((resolve, reject) => setTimeout(resolve, 3000));
            sap.ui.core.BusyIndicator.hide();
          } catch (error) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.error("Error Tecnico: ", error);
          }
        },

        onRestoreFilters: function (oEvent) {
          that._resetModel();
          var oTablaPedidos = this.byId("idTablePedidos").getBinding(),
            oTablaInsumos = this.byId("idTableInsumos").getBinding(),
            oTablaBultos = this.byId("idTableBultos").getBinding();

          try {
            oTablaPedidos.filter();
            oTablaPedidos.refresh(true);
          } catch (oError) {}
          try {
            oTablaInsumos.filter();
            oTablaInsumos.refresh(true);
          } catch (oError) {}
          try {
            oTablaBultos.filter();
            oTablaBultos.refresh(true);
          } catch (oError) {}

          oEvent.getParameters().selectionSet.forEach((oElementoFiltro) => {
            if (oElementoFiltro.data().controlType === "CheckBox") {
              oElementoFiltro.setSelected(false);
            } else if (oElementoFiltro.data().controlType === "ComboBox") {
              oElementoFiltro.setSelectedKey("");
            } else {
              oElementoFiltro.setValue("");
            }
          });
        },

        /**-----------------------------------------------*/
        /*          M E T H O D S   C U S T O M
        /**-----------------------------------------------*/
        _getUserRolApp: function () {
          var oUser = this.getUserLogin();
          that.sEmail = oUser.email;
          that.sUser = "";
          var oParameters = {
            usuario: encodeURI(that.sEmail),
            clave: encodeURI(that.sEmail),
            app: that.sAppName,
          };
          return new Promise(function (resolve, reject) {
            oDataService
              .oDataRead(that.oModel, "fnLogin", oParameters, [])
              .then((oData) => {
                var aResult = oData.results;
                if (!aResult && oData.fnLogin) {
                  aResult = oData.fnLogin.results;
                }
                if (aResult && aResult.length > 0) {
                  var oResult = aResult[0];
                  if (oResult.oUsuario) {
                    that.sUser = oResult.oUsuario.usuario;
                    sap.ui
                      .getCore()
                      .setModel(new JSONModel(oResult), "oUserLoginGobalModel");
                    that.setModel(
                      new JSONModel(oResult.oUsuario),
                      "UserInfoModel"
                    );
                    resolve(true);
                  } else {
                    if (!oResult.bStatus) {
                      return MessageBox.error(oResult.sMessage);
                    }
                  }
                }
                resolve(false);
              })
              .catch((oError) => {
                reject(oError);
              });
          });
        },

        _getCentro: function () {
          var aFilters = [],
            oUrlParameters = {};
          aFilters.push(new Filter("Bukrs", EQ, "1000"));
          that
            ._getODataDinamic(
              that.oModelErp,
              "CentroSet",
              oUrlParameters,
              aFilters
            )
            .then((oData) => {
              that.setModel(new JSONModel(oData), "CentroModel");

              aFilters = [];
              aFilters.push(new Filter("activo", EQ, true));
              aFilters.push(new Filter("oPlanta/activo", EQ, true));
              oUrlParameters = {
                $expand: "oPlanta",
              };
              return that._getODataDinamic(
                that.oModel,
                "SALA_PESAJE",
                oUrlParameters,
                aFilters
              );
            })
            .then((aResp) => {
              var aSalaPesaje = [];
              var aPlanta = [];
              for (var key in aResp) {
                var oSalaPesaje = aResp[key];
                var oPlanta = oSalaPesaje.oPlanta;

                aSalaPesaje.push(oSalaPesaje);
                aPlanta.push(oPlanta);
              }

              var aSalaPesaje = that._uniqByKeepFirst(
                aSalaPesaje,
                (it) => it.salaPesajeId
              );
              var aPlanta = that._uniqByKeepFirst(
                aPlanta,
                (it) => it.iMaestraId
              );

              var aPlantaTemp = [];
              var aCentro = that.getModel("CentroModel").getData();
              for (var key in aCentro) {
                var oCentro = aCentro[key];

                for (var key2 in aPlanta) {
                  var oPlanta = aPlanta[key2];
                  if (oPlanta.codigoSap == oCentro.Bwkey) {
                    aPlantaTemp.push(oCentro);
                  }
                }
              }

              that.setModel(new JSONModel(aPlantaTemp), "CentroModel");
              that.setModel(new JSONModel(aPlantaTemp), "CentroSalaModel");
              that.setModel(new JSONModel(aSalaPesaje), "SalaCentroModel");
            });
        },

        _getInsumoPedidoSelect: function (oData) {
          var oView = that.getView();
          var oFraccionDetalleModel = oView.getModel("FraccionDetalleModel");
          oFraccionDetalleModel.setData([]);
          oFraccionDetalleModel.refresh(true);

          var aFilters = [],
            oUrlParameters = {};
          aFilters.push(
            new Filter("ordenFraccionId", EQ, oData.ordenFraccionId)
          );
          sap.ui.core.BusyIndicator.show(0);

          oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              oUrlParameters,
              aFilters
            )
            .then((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              that.getModel("FraccionDetalleModel").getData().Insumos =
                oResult.results;
              that.getModel("FraccionDetalleModel").refresh(true);

              var oUrlParameters = {},
                aFilters = [];

              aFilters.push(new Filter("Pedido", EQ, oData.numPedido));

              sap.ui.core.BusyIndicator.show(0);
              return oDataService.oDataRead(
                that.oModelErp,
                "AtendidoItemSet",
                oUrlParameters,
                aFilters
              );
            })
            .then((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              var aBulto = oResult.results;
              var aInsumos = that
                .getModel("FraccionDetalleModel")
                .getData().Insumos;

              for (var key0 in aInsumos) {
                var oInsumo = aInsumos[key0];
                var aBultoFilter = [];

                var cantAtendidaEntero = 0;
                for (var key in aBulto) {
                  var oItem = aBulto[key];
                  if (
                    +oItem.Fraccion == +oInsumo.numFraccion &&
                    +oItem.Subfraccion == +oInsumo.numSubFraccion &&
                    oItem.Orden == oData.numOrden &&
                    oItem.CodigoInsumo == oInsumo.codigoInsumo &&
                    oItem.Lote == oInsumo.lote &&
                    [
                      "ENTERO",
                      "ENTERO_ALM",
                      "SALDO_FRAC_ALM",
                      "SALDO_ALM",
                    ].includes(oItem.Tipo)
                  ) {
                    /**
                     * Bultos que se envian para producción - (Picking)
                     * */
                    if (oItem.IdBulto) {
                      cantAtendidaEntero =
                        cantAtendidaEntero + +oItem.CantidadA;

                      aBultoFilter.push(oItem);
                    }
                  }

                  if (["SALDO"].includes(oItem.Tipo)) {
                    if (oItem.IdBulto) {
                      if (
                        oItem.CodigoInsumo == oInsumo.codigoInsumo &&
                        oItem.Lote == oInsumo.lote
                      ) {
                        aBultoFilter.push(oItem);
                      }
                    }
                  }
                }

                oInsumo.cantAtendida = cantAtendidaEntero;

                aBultoFilter.forEach((o) => {
                  o.FechaHoraAte = new Date(
                    formatter.getFormatShortDateYMD(o.FechaAte) +
                      "T" +
                      formatter.getMsToHMS(o.HoraAte)
                  );
                });

                aBultoFilter.sort(that.dynamicSort("FechaHoraAte"));
                oInsumo.aBulto = aBultoFilter;
              }

              that.getModel("FraccionDetalleModel").refresh(true);
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
            });
        },

        _sendPedidoToErp: function (pedidoId) {
          that.aPedidoOrden = null;

          var aFilters = [];

          aFilters.push(new Filter("pedidoId", EQ, pedidoId));

          sap.ui.core.BusyIndicator.show(0);
          that
            ._getODataDinamic(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              {},
              aFilters
            )
            .then((aResp) => {
              sap.ui.core.BusyIndicator.hide();

              if (aResp.length) {
                that.aPedidoOrden = aResp;
                var oPedido = aResp[0];
                var aFilters = [];

                aFilters.push(
                  new Filter("oPedido_pedidoId", EQ, oPedido.pedidoId)
                );
                aFilters.push(new Filter("activo", EQ, true));
                var oUrlParameters = {
                  $expand: "oUsuario",
                };

                sap.ui.core.BusyIndicator.show();
                return oDataService.oDataRead(
                  that.oModel,
                  "PEDIDO_USUARIO",
                  oUrlParameters,
                  aFilters
                );
              } else {
                return false;
              }
            })
            .then((aRespU) => {
              var aRespUsuario = aRespU.results;
              var aResp = that.aPedidoOrden;
              if (aResp && aResp.length) {
                var oPedido = aResp[0];
                var oPedidoErp = {
                  PEDIDO: oPedido.pedidoNumero, //Numero Pedido
                  CENTRO: oPedido.pedidoCentro, //Centro Pedido
                  STATUSPED: oPedido.pedidoEstadoD, //Estado Pedido
                  TIPO_P_D: oPedido.pedidoTipoDN, //Tipo Pedido Detalle, pedidoTipoDC
                  CodTipoPD: oPedido.pedidoTipoDC,
                  TIPO_P: oPedido.pedidoTipo, //Tipo Pedido ID
                  SALA: oPedido.pedidoSala, //Sala Pedido
                  FECHAC:
                    formatter.getFormatShortDateYMD(oPedido.pedidoFecha) +
                    "T00:00:00.0000000", //Fecha Creacion Pedido
                };

                var oPedidoUsuarioErp = {
                  PERNRT: "" /**Codigo Empleado*/,
                  PEDIATENCSet: [],
                };

                if (aRespUsuario && aRespUsuario.length) {
                  var aPern = [];
                  for (var key in aRespUsuario) {
                    var oUsuario = aRespUsuario[key].oUsuario;
                    aPern.push(
                      oUsuario.usuarioSap +
                        ":" +
                        oUsuario.nombre +
                        " " +
                        oUsuario.apellidoPaterno
                    );
                  }
                  oPedidoUsuarioErp.PERNRT = aPern.join(",");
                }

                var PEDIATENCSet = [];
                for (var key in aResp) {
                  var oInsumo = aResp[key];

                  var oInsumoErp = {
                    /**
                     * PEDIDO
                     */
                    PEDIDO: oInsumo.pedidoNumero, //Numero Pedido

                    /**
                     * ORDEN
                     */
                    ORDEN: oInsumo.ordenNumero, //Numero Orden
                    Posnr: (+oInsumo.ordenPos).toString(), //Posición    Número de posición de la orden
                    LOTEPT: oInsumo.ordenLote, //Lote Orden
                    CODPRODTERM: oInsumo.ordenCodProd, //Codigo PT Orden
                    Fraccion: oInsumo.numFraccion.toString(), //Fraccion

                    /**
                     * INSUMO
                     */
                    Subfraccion: oInsumo.numSubFraccion.toString(), //Sub-Fraccion
                    CODIGOINSUMO: oInsumo.codigoInsumo, //Codigo Insumo
                    DESCRIPCION: oInsumo.descripcion, //Descripcion Insumo
                    LOTE: oInsumo.lote, //Lote Insumo
                    Werks: oInsumo.centro, //Centro
                    ALMACEN: oInsumo.almacen, //Almacen Insumo
                    AGOTAR: oInsumo.agotar, //Flag Agotar Insumo
                    STATUSITEM: oInsumo.insumoEstadoDes, //Estado Insumo
                    Rsnum: oInsumo.reservaNum, //Número de reserva
                    Rspos: oInsumo.reservaPos, //Posición    Número de posición de reserva

                    CantSug: oInsumo.cantSugerida, //Cantidad Sugerida
                    CANTIDADR: oInsumo.cantPedida, //Cantidad Pedida
                    UNIDADM: oInsumo.unidad, //UM Cantidad Pedida Insumo

                    CantSfraccUmp: oInsumo.cantSugeridaPot, //Cantidad subfracción (cantidad sugerida)
                    UmpSfracc: oInsumo.unidadPot, //UM    en la unidad de medida con potencia

                    CantReq: oInsumo.cantRequerida, //Cantidad Requerida Insumo
                    UnidadReq: oInsumo.cantRequeridaUM, //Unidad Medida Requerida

                    CantRes: oInsumo.cantReservada, //Cantidad de la Reserva
                    UmRes: oInsumo.cantReservadaUM, //UM    unidad de medida base

                    CantResUpo: oInsumo.cantReservadaPot, //Cantidad de la Reserva UM Orden   cantidad en la unidad de potencia
                    UmPot: oInsumo.cantReservadaPotUM, //UM    unidad de medida con potencia
                  };

                  PEDIATENCSet.push(oInsumoErp);
                }

                var oZPedido = {
                  ...oPedidoErp,
                  ...oPedidoUsuarioErp,
                };

                oZPedido.PEDIATENCSet = PEDIATENCSet;

                if (oZPedido) {
                  sap.ui.core.BusyIndicator.show(0);
                  return oDataService.oDataCreate(
                    that.oModelErp,
                    "PEDIDOHEADSet",
                    oZPedido
                  );
                } else {
                  return false;
                }
              } else {
                return false;
              }
            })
            .then((aResp) => {
              sap.ui.core.BusyIndicator.hide();
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
              MessageBox.error(that._getI18nText("msgSendErr"));
            });
        },

        _sendPrint: function (oData) {
          var oInsumo = oData.oInsumo;
          var oOrden = oInsumo ? oInsumo.oOrden : null;
          var aBulto = oData.aBultos;
          var aEtiquetas = [];
          for (var key in aBulto) {
            var oItem = aBulto[key];
            aEtiquetas.push(oItem.Etiqueta);
          }
          sap.ui.core.BusyIndicator.show(0);
          var oPrint = JSON.parse(window.localStorage.getItem("oImpresora"));
          that
            ._getODataDinamic(
              that.oModel,
              "fnSendPrintBulto",
              {
                impresoraId: oPrint.keyImpresora,
                etiqueta: aEtiquetas.join(","),
                usuario: that.sUser,
                bSaldo: oData.sSaldo ? oData.sSaldo : "",
                tipo: "AM", //Tipo de impresion [AM: Almacen Materiales, CP: Central Pesada]
                idBulto: oData.idBulto ? oData.idBulto : "", //Bulto HU
              },
              null
            )
            .then((oResp) => {
              MessageBox.information("Enviado a la cola de impresión.");
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            })
            .finally(function () {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        _getEstadoPedido: function () {
          var aMaestra = that.getModel("MaestraModel").getData();
          var aEstadoPedido = aMaestra[CONSTANT.ESTADO_PEDIDO];
          var aEstadoOrden = aMaestra[CONSTANT.ESTADO_ORDEN];
          var aEstadoInsumo = aMaestra[CONSTANT.ESTADO_INSUMO];

          return {
            Pedido: aEstadoPedido,
            Orden: aEstadoOrden,
            Insumo: aEstadoInsumo,
          };
        },
        _resetModel: function () {
          var oOrdenSelectedItemsModel = that.getModel("FraccionDetalleModel");
          oOrdenSelectedItemsModel.setData([]);
          oOrdenSelectedItemsModel.refresh(true);
        },

        _validatePickingAll: function (oPedido) {
          /**
           * WARNING:
           * EL ORDEN DE LAS CONDICIONALES DE ESTA LOGICA DE COMBINACIONES DE ESTADOS
           * PUEDE AFECTAR AL PROCESO.
           *
           * (CONSIDERAR ESTE COMENTARIO SI PRETENDE REALIZAR ALGUN CAMBIO EN ESTE METODO)
           */

          /**
           * VALIDA Y CAMBIA DE ESTADOS DE LAS ENTIDADES EN EL PROCESO PICKING
           */
          var aOrdenEstado = [];
          for (var oOrden of oPedido.aOrden) {
            var aFraccionEstado = [];

            for (var oFraccion of oOrden.aFraccion) {
              var aInsumoEstado = [];

              for (var oInsumo of oFraccion.aInsumo) {
                aInsumoEstado.push(oInsumo.insumoEstado);
              }

              aInsumoEstado = [...new Set(aInsumoEstado)];
              if (aInsumoEstado && aInsumoEstado.length == 1) {
                /**
                 * EVALUAR ESTADOS COMPLETOS
                 */
                if (aInsumoEstado[0] == CONSTANT.IPEPI) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PENDIENTE PICKING
                   * LA ORDEN/FRACCION PASA A ESTADO A: PENDIENTE
                   * (ELIMINAR TODOS LOS REGISTROS RELACIONADOS AL PROCESO PICKING)
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPEND) {
                    oFraccion.fraccionEstado = CONSTANT.OPEND;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.IENPI) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN EN PICKING
                   * LA ORDEN/FRACCION PASA A ESTADO A: PICKING
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPICK) {
                    oFraccion.fraccionEstado = CONSTANT.OPICK;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.IATPI) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN ATENDIDO PICKING
                   * LA ORDEN/FRACCION PASA A ESTADO A: ATENDIDO
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OATEN) {
                    oFraccion.fraccionEstado = CONSTANT.OATEN;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.IPEPE) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PENDIENTE PESAJE
                   * LA ORDEN/FRACCION PASA A ESTADO A: PROGRAMADO EN SALA
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPRSA) {
                    oFraccion.fraccionEstado = CONSTANT.OPRSA;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.IPESA) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PESANDO EN SALA
                   * LA ORDEN/FRACCION PASA A ESTADO A: PESANDO EN SALA
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPESA) {
                    oFraccion.fraccionEstado = CONSTANT.OPESA;
                    oFraccion.edit = true;
                  }
                } else if (
                  aInsumoEstado[0] == CONSTANT.IPEFI ||
                  aInsumoEstado[0] == CONSTANT.IPEPR
                ) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PESAJE FINALIZADO o PESAJE POR PRODUCCIÓN
                   * LA ORDEN/FRACCION PASA A ESTADO A: PESAJE FINALIZADO
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPEFI) {
                    oFraccion.fraccionEstado = CONSTANT.OPEFI;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.IPARC) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN ENTREGA PARCIAL
                   * LA ORDEN/FRACCION PASA A ESTADO A: ENTREGA PARCIAL
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPARC) {
                    oFraccion.fraccionEstado = CONSTANT.OPARC;
                    oFraccion.edit = true;
                  }
                } else if (aInsumoEstado[0] == CONSTANT.ITOT) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN ENTREGA TOTAL
                   * LA ORDEN/FRACCION PASA A ESTADO A: ENTREGA TOTAL
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OTOT) {
                    oFraccion.fraccionEstado = CONSTANT.OTOT;
                    oFraccion.edit = true;
                  }
                }
              } else if (
                aInsumoEstado &&
                aInsumoEstado.length == 2 &&
                aInsumoEstado.includes(CONSTANT.IPEFI) &&
                aInsumoEstado.includes(CONSTANT.IPEPR)
              ) {
                /**
                 * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PESAJE FINALIZADO y PESAJE POR PRODUCCIÓN
                 * LA ORDEN/FRACCION PASA A ESTADO A: PESAJE FINALIZADO
                 */
                if (oFraccion.fraccionEstado != CONSTANT.OPEFI) {
                  oFraccion.fraccionEstado = CONSTANT.OPEFI;
                  oFraccion.edit = true;
                }
              } else {
                /**
                 * EVALUAR COMBINACIONES DE ESTADOS
                 */

                if (
                  aInsumoEstado.includes(CONSTANT.ITOT) ||
                  aInsumoEstado.includes(CONSTANT.IPARC)
                ) {
                  /**
                   * CONSIDERACIONES (CASOS ESPECIFICOS)
                   * SI EXISTE COMBINACION DE ESTADOS DEL PROCESO PICKING,
                   * PREVALECE EL ESTADO MENOR
                   */

                  /**
                   * SI LOS ESTADOS DEL INSUMO CONTIENE LOS ESTADOS ENTREGA PARCIAL o ENTREGA TOTAL
                   * Y ALGUNA COMBINACION DE ESTADOS PIKING:
                   * - SI LOS ESTADOS CONTIENEN COMBINACION CON EL ESATDO: EN PICKING
                   *     LA ORDEN/FRACCION PASA A ESTADO A: PICKING
                   * - SI LOS ESTADOS CONTIENEN COMBINACION CON EL ESATDO: PENDIENTE PICKING
                   *     LA ORDEN/FRACCION PASA A ESTADO A: PENDIENTE
                   */

                  if (
                    aInsumoEstado.includes(CONSTANT.IENPI) ||
                    (aInsumoEstado.includes(CONSTANT.IPEPI) &&
                      aInsumoEstado.includes(CONSTANT.IATPI))
                  ) {
                    if (oFraccion.fraccionEstado != CONSTANT.OPICK) {
                      oFraccion.fraccionEstado = CONSTANT.OPICK;
                      oFraccion.edit = true;
                    }
                  } else if (aInsumoEstado.includes(CONSTANT.IPEPI)) {
                    if (oFraccion.fraccionEstado != CONSTANT.OPEND) {
                      oFraccion.fraccionEstado = CONSTANT.OPEND;
                      oFraccion.edit = true;
                    }
                  } else if (aInsumoEstado.includes(CONSTANT.IPARC)) {
                    /**
                     * FLUJO NORMAL
                     */

                    /**
                     * SI LOS ESTADOS DEL INSUMO CONTIENE LOS ESTADOS ENTREGA PARCIAL o ENTREGA TOTAL
                     * SI LOS ESTADOS CONTIENEN EL ESTADO: ENTREGA PARCIAL
                     *    LA ORDEN/FRACCION PASA A ESTADO A: ENTREGA PARCIAL
                     * CASO CONTRARIO
                     *    LA ORDEN/FRACCION PASA A ESTADO A: ENTREGA TOTAL
                     */
                    if (oFraccion.fraccionEstado != CONSTANT.OPARC) {
                      oFraccion.fraccionEstado = CONSTANT.OPARC;
                      oFraccion.edit = true;
                    }
                  } else {
                    if (oFraccion.fraccionEstado != CONSTANT.OTOT) {
                      oFraccion.fraccionEstado = CONSTANT.OTOT;
                      oFraccion.edit = true;
                    }
                  }
                } else if (
                  aInsumoEstado.includes(CONSTANT.IPEPE) ||
                  aInsumoEstado.includes(CONSTANT.IPESA) ||
                  aInsumoEstado.includes(CONSTANT.IPEFI) ||
                  aInsumoEstado.includes(CONSTANT.IPEPR)
                ) {
                  /**
                   * SI TODOS LOS ESTADOS DEL INSUMO ESTA EN PESANDO EN SALA
                   * LA ORDEN/FRACCION PASA A ESTADO A: PESANDO EN SALA
                   */
                  if (oFraccion.fraccionEstado != CONSTANT.OPESA) {
                    oFraccion.fraccionEstado = CONSTANT.OPESA;
                    oFraccion.edit = true;
                  }
                } else if (
                  aInsumoEstado.includes(CONSTANT.IATPI) ||
                  aInsumoEstado.includes(CONSTANT.IENPI)
                ) {
                  /**
                   * SI LOS ESTADOS DEL INSUMO CONTIENE LOS ESTADOS ATENDIDO PICKING o ( EN PICKING / PENDIENTE PICKING )
                   * SI LOS ESTADOS CONTIENEN EL ESTADO:  EN PICKING / PENDIENTE PICKING
                   *    LA ORDEN/FRACCION PASA A ESTADO A: PICKING
                   * CASO CONTRARIO
                   *    LA ORDEN/FRACCION PASA A ESTADO A: ATENDIDO
                   */

                  if (
                    aInsumoEstado.includes(CONSTANT.IENPI) ||
                    aInsumoEstado.includes(CONSTANT.IPEPI)
                  ) {
                    if (oFraccion.fraccionEstado != CONSTANT.OPICK) {
                      oFraccion.fraccionEstado = CONSTANT.OPICK;
                      oFraccion.edit = true;
                    }
                  } else {
                    if (oFraccion.fraccionEstado != CONSTANT.OATEN) {
                      oFraccion.fraccionEstado = CONSTANT.OATEN;
                      oFraccion.edit = true;
                    }
                  }
                }
              }

              aFraccionEstado.push(oFraccion.fraccionEstado);
            }

            aFraccionEstado = [...new Set(aFraccionEstado)];

            aOrdenEstado = aOrdenEstado.concat(aFraccionEstado);
          }

          aOrdenEstado = [...new Set(aOrdenEstado)];
          if (
            aOrdenEstado &&
            aOrdenEstado.length == 1 &&
            aOrdenEstado[0] == CONSTANT.OPEND
          ) {
            /**
             * SI TODOS LOS ESTADOS DE LA ORDEN ESTA EN PENDIENTE
             * EL PEDIDO PASA A ESTADO EN: PENDIENTE
             * (ELIMINAR TODOS LOS REGISTROS RELACIONADOS AL PROCESO PICKING)
             */
            if (oPedido.pedidoEstado != CONSTANT.PPEND) {
              oPedido.pedidoPickingFinUsu = null;
              oPedido.pedidoPickingFinFec = null;

              oPedido.pedidoEstado = CONSTANT.PPEND;
              oPedido.edit = true;
            }
          } else if (
            aOrdenEstado &&
            aOrdenEstado.length == 1 &&
            aOrdenEstado[0] == CONSTANT.OTOT
          ) {
            /**
             * SI TODOS LOS ESTADOS DE LA ORDEN ESTA EN ENTREGA TOTAL
             * EL PEDIDO PASA A ESTADO EN: CUMPLIDO
             */
            if (oPedido.pedidoEstado != CONSTANT.PCUMP) {
              oPedido.pedidoEstado = CONSTANT.PCUMP;
              oPedido.edit = true;
            }
          } else if (
            aOrdenEstado &&
            aOrdenEstado.length == 1 &&
            aOrdenEstado[0] == CONSTANT.OATEN
          ) {
            /**
             * SI TODOS LOS ESTADOS DE LA ORDEN ESTA EN ATENDIDO
             * EL PEDIDO PASA A ESTADO EN: PROCESO
             * (COMPLETAR TODOS LOS REGISTROS RELACIONADOS AL PROCESO PICKING)
             */
            if (oPedido.pedidoEstado != CONSTANT.PPROC) {
              /**
               * (Falta: se requiere) Añadir logica para completar campos picking
               * - Usuario y fecha de inicio Picking (Obetner la menor fecha de la ORDEN Picking inicio)
               * - Usuario y fecha de fin Picking (Obetner la mayor fecha de la ORDEN Picking fin)
               */
              oPedido.pedidoEstado = CONSTANT.PPROC;
              oPedido.edit = true;
            }
          } else {
            /**
             * SI LOS ESTADOS DE LAS ORDENES CONTIENEN EL ESTADO PICKING O PENDIENTE
             * SE ELIMINA LOS DATOS DE FIN PICKING
             */
            if (
              aOrdenEstado.includes(CONSTANT.OPICK) ||
              aOrdenEstado.includes(CONSTANT.OPEND)
            ) {
              oPedido.pedidoPickingFinUsu = null;
              oPedido.pedidoPickingFinFec = null;
              oPedido.edit = true;
            }

            /**
             * SI LA ORDEN TIENE ESTADOS DIFERENTE A PENDIENTE
             * EL PEDIDO PASA A ESTADO EN: PROCESO
             * (ELIMINAR TODOS LOS REGISTROS DE FIN PICKING)
             */
            if (oPedido.pedidoEstado != CONSTANT.PPROC) {
              oPedido.pedidoEstado = CONSTANT.PPROC;
              oPedido.edit = true;
            }
          }

          return oPedido;
        },

        _showServiceListMessage: function (sErrorTitle, aDetails) {
          that._bMessageOpen = true;
          var aMessageHtml = [];
          aDetails.forEach(function (sMessage) {
            aMessageHtml.push("<li>" + sMessage + "</li>");
          });

          MessageBox.success(sErrorTitle, {
            title: "Exito",
            id: "serviceErrorMessageBox",
            details:
              "<p><strong></strong></p>\n" +
              "<ul>" +
              aMessageHtml.join(" ") +
              "</ul>",
            styleClass: sResponsivePaddingClasses,
            actions: [MessageBox.Action.CLOSE],
            onClose: function () {
              that._bMessageOpen = false;
            }.bind(this),
          });
        },

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("AMSPOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "LIBERAR":
              bValid = sRol.includes("AMSPLIBER");
              break;
            case "IMPRIMIR":
              bValid = sRol.includes("AMSPIMPB");
              break;
            case "ANULAR":
              bValid = sRol.includes("AMSPANUL");
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

        _getI18nText: function (sText) {
          return this.oView.getModel("i18n") === undefined
            ? false
            : this.oView.getModel("i18n").getResourceBundle().getText(sText);
        },

        /**
         * @Description
         * Funcion que obtiene registros del servicio oData
         *
         * @param   {String} sEntity :Nombre de la entidad
         * @param   {object} oUrlParameters : Parametros
         * @param   {sap.ui.model.Filter} aFilter : Filtros
         * @return  {object} entity data
         * @History
         * v1.0 – Version inicial
         *
         */
        _getODataDinamic: function (oModel, sEntity, oUrlParameters, aFilter) {
          var that = this;
          var oModel = oModel;
          if (!oModel) oModel = that.oModel;

          return new Promise(function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
              .then(function (oResult) {
                sap.ui.core.BusyIndicator.hide();
                resolve(oResult.results);
              })
              .catch(function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              })
              .finally(function () {});
          });
        },
        _openDialogDinamic: function (sDialog) {
          var sDialogName = "o" + sDialog;
          if (!window[sDialogName]) {
            window[sDialogName] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath + ".view.almacen.dialog." + sDialog,
              this
            );
            this.getView().addDependent(window[sDialogName]);
          }
          window[sDialogName].open();
        },
        onCloseFragment: function (sDialog) {
          var sODialog = "o" + sDialog;
          window[sODialog].close();
        },
        onCloseDialog: function (oEvent) {
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },
        _onCloseDialog: function (oSource) {
          var oParent = oSource.getParent();
          oParent.close();
        },
      }
    );
  }
);
