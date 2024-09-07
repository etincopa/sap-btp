sap.ui.define(
  [
    "../BaseController",
    "sap/ui/core/Fragment",
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
    Fragment,
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
        GROL: "CPSS", //GRUPO ROL
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

        /**
         * ESTADOS
         */
        ESTADO_PEDIDO: "ESTADO_CP_PEDIDO",
        ESTADO_ORDEN: "ESTADO_CP_ORDEN",
        ESTADO_INSUMO: "ESTADO_CP_INSUMO",

        /**
         * PEDIDO
         */
        PPEND: "PAPPEND", //PENDIENTE
        PBLOQ: "PAPBLOQ", //BLOQUEADO
        PANUL: "PAPANUL", //ANULADO
        /**
         * ORDEN
         */
        OPEND: "PAOPEND", //PENDIENTE
        OPRSA: "PAOPRSA", //PROGRAMADO EN SALA
        OATEN: "PAOATEN", //ATENDIDO
        OPEFI: "PAOPEFI", //PESAJE FINALIZADO
        OENTR: "PAOENTR", //ENTREGA EN TRANSITO
        OENVA: "PAOENVA", //ENTREGA VERIFICADA
        OANUL: "PAOANUL", //ANULADO
        /**
         * INSUMO
         */
        IPEPE: "PAIPEPE", //PENDIENTE PESAJE
        IPEPI: "PAIPEPI", //PENDIENTE PICKING
        IATPI: "PAIATPI", //ATENDIDO PICKING
        INAPI: "PAINAPI", //NO ATENDIDO PICKING
        IENVA: "PAIENVA", //ENTREGA VERIFICADA
        IPEPR: "PAIPEPR", //PESAJE POR PRODUCCIÓN
        IPEFI: "PAIPEFI", //PESAJE FINALIZADO
        IANUL: "PAIANUL", //ANULADO
        IPAIPARC: "PAIPARC", //PESAJE FINALIZADO
      };

    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.centralPesadas.SeguimientoSalaPesada",
      {
        formatter: formatter,
        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
                /**-----------------------------------------------*/
        onInit: async function () {
          that = this;
          that._oView = this.getView();
          that.aRol = null;
          that.sRol = null;
          that.sDiffDays = 0;
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.sAppName = "ManejoPedidos";

          that.setModel(new JSONModel({}), "MaestraModel");
          that.setModel(new JSONModel({}), "SalasModel");
          that.setModel(new JSONModel({}), "FraccionDetalleModel");

          that.oRouter
            .getTarget("TargetSeguimientoSalaPesada")
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
                  if (!["PAOENFI", "PAOENTRE"].includes(a.codigo)) {
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
              sap.ui.core.BusyIndicator.hide();
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        _cargaInicial: async function () {
          //OBTENER CENTRO DEL USUARIO ACTUAL
          sap.ui.core.BusyIndicator.show(0);
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
          //var oPickingModel = oView.getModel("PickingModel");
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
              console.log("Error All Init");
              sap.ui.core.BusyIndicator.hide();
            }
          }
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
              var aPromiseAdd = [];

              var oPedido = aResult[0];

              if (oPedido) {
                var oKey = that.oModel.createKey("/PEDIDO", {
                  pedidoId: oPedido.pedidoId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoPedidoAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromiseAdd.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });
              }

              for (var oFraccion of aFraccion) {
                var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                  ordenFraccionId: oFraccion.ordenFraccionId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoOrdenAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromiseAdd.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });
              }
              for (var oInsumo of aResult) {
                var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oInsumo.ordenDetalleId,
                });
                var oEntity = {
                  oEstado_iMaestraId: oEstadoInsumoAnul.iMaestraId, //Anulado
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromiseAdd.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });
              }

              var aPromiseOrdenDetalle = [];
              for (var key in aPromiseAdd) {
                var oPromise = aPromiseAdd[key];
                aPromiseOrdenDetalle.push(
                  oDataService.oDataUpdate(
                    that.oModel,
                    oPromise.sKeyEntity,
                    oPromise.oBody
                  )
                );
              }

              Promise.all(aPromiseOrdenDetalle)
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

        onProgramarAction: async function (oEvent) {
          if (!that._validateAccionAsigned("PROGRAMAR")) return;

          var sAction = oEvent.getSource().data("progAction");
          var oOrdenSelec = oEvent.getSource().getBindingContext().getObject();

          var oPedidoDetail = {
            oItemSelect: Object.assign({}, oOrdenSelec),
            aInsumo: [],
          };

          sap.ui.core.BusyIndicator.show(0);
          if (sAction == "PROGRAMAR") {
            var isOk = false;
            var aMessage = [];
            var oPedidoErp = await oDataService
              .oDataRead(that.oModelErp, "PedidoConsolidadoSet", {}, [
                new Filter("PedidoNumero", EQ, oOrdenSelec.numPedido),
                new Filter("OrdenNumero", EQ, oOrdenSelec.numOrden),
              ])
              .catch(function (oError) {
                console.log(oError);
              });
            oPedidoErp = oPedidoErp ? oPedidoErp.results : [];
            if (oPedidoErp.length) {
              /**
               * Evalua que todos los insumos de la orden esten Trasladados (status T),
               * para poder programar
               */

              var aStatusTras = [];
              oPedidoErp.forEach((o) => {
                if (
                  o.OrdenNumero == oOrdenSelec.numOrden &&
                  +o.OrdenFraccion == +oOrdenSelec.numFraccion &&
                  o.InsumoEstado != "ANULADO"
                ) {
                  aStatusTras.push(o.InsumoEstadoTraslado);
                  aMessage.push(
                    `${o.InsumoCodigo} ${
                      o.InsumoLote
                    } ${+o.InsumoSubfraccion} ${
                      o.InsumoEstadoTraslado == "T"
                        ? "TRASLADADO"
                        : "PENDIENTE TRAS."
                    }`
                  );
                }
              });
              aStatusTras = that._uniqByKeepFirst(aStatusTras, (it) => it);
              if (aStatusTras.length == 1 && aStatusTras[0] == "T") {
                isOk = true;
              }
            }

            if (!isOk) {
              /**
               * No permitir PROGRAMAR SALA si la orden aun no fue TRASLADADO
               */
              sap.ui.core.BusyIndicator.hide();
              //return MessageBox.error("Se requiere TRASLADO para continuar. \n" + aMessage.join(", \n"));
              return MessageBox.error("Se requiere TRASLADO para continuar. ");
            }

            var aFilters = [],
              aRespReserva = [];

            aFilters.push(new Filter("Rsnum", EQ, oOrdenSelec.numReserva));
            aFilters.push(new Filter("Bwart", EQ, ""));
            aFilters.push(new Filter("Werks", EQ, ""));
            aRespReserva = await that
              ._getODataDinamic(that.oModelErp, "ReservaSet", {}, aFilters)
              .catch((oError) => {
                var oResp = JSON.parse(oError.responseText);
                console.log(oResp);
              });

            aFilters = [];
            aFilters.push(new Filter("activo", EQ, true));
            aFilters.push(
              new Filter(
                "oOrdenFraccion_ordenFraccionId",
                EQ,
                oOrdenSelec.ordenFraccionId
              )
            );

            oDataService
              .oDataRead(that.oModel, "ORDEN_DETALLE", {}, aFilters)
              .then(async (oResult) => {
                var aResult = oResult.results;
                var aInsumoCode = [];
                for (var key in aResult) {
                  var oItem = aResult[key];
                  aInsumoCode.push(oItem.codigoInsumo);
                  oPedidoDetail.aInsumo.push(oItem);
                }
                /**
                 * Verifica si exisisten insumos que tengan la caracteristica de PESADO_MATERIAL_PR,
                 * Si el insumo tiene esta caracteristica el estado del insumo pasa automaticamente a
                 * PESAJE POR PRODUCCIÓN (El cual indica que este insumo unicamente puede ser pesado en Producción)
                 */
                aInsumoCode = this._uniqByKeepFirst(aInsumoCode, (it) => it);
                var aFilter = [];
                for (var key in aInsumoCode) {
                  aFilter.push(new Filter("Matnr", EQ, aInsumoCode[key]));
                }
                if (aFilter.length)
                  aFilter.push(new Filter("Atinn", EQ, "PESADO_MATERIAL_PR"));
                var aCaractResp = await oDataService
                  .oDataRead(that.oModelErp, "MaterialCaractSet", {}, aFilter)
                  .catch(function (oError) {
                    console.log(oError);
                  });
                if (aCaractResp) {
                  aCaractResp = aCaractResp.results;
                }

                var aEstado = that._getEstadoPedido();
                var oEstadoOrdenProgSal = aEstado.Orden.find(
                    (o) => o.codigo === CONSTANT.OPRSA //PROGRAMADO EN SALA
                  ),
                  oEstadoOrdenPesaFinal = aEstado.Orden.find(
                    (o) => o.codigo === CONSTANT.OPEFI //PESAJE FINALIZADO
                  ),
                  oEstadoInsumoAtPick = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IATPI //ATENDIDO PICKING
                  ),
                  oEstadoInsumoNoAtPick = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.INAPI //NO ATENDIDO PICKING
                  ),
                  oEstadoInsumoPenPesaj = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEPE //PENDIENTE PESAJE
                  ),
                  oEstadoInsumoAnul = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IANUL //ANULADO
                  ),
                  oEstadoInsumoPesaPrd = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEPR //PESAJE POR PRODUCCIÓN
                  ),
                  oEstadoInsumoPesaFinal = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEFI //PESAJE FINALIZADO
                  );

                /* Logica para PROGRAMAR la Orden/Fraccion */
                var oOrdenSelect = oPedidoDetail.oItemSelect;
                var bOrdenAtendido = true;
                var aInsumoAtPick = [];
                for (var key in oPedidoDetail.aInsumo) {
                  var oInsumo = oPedidoDetail.aInsumo[key];
                  if (
                    oOrdenSelect.ordenFraccionId ==
                    oInsumo.oOrdenFraccion_ordenFraccionId
                  ) {
                    /**
                     * Evaluar que los insumos tengan el estado ATENDIDO PICKING o NO ATENDIDO PICKING
                     * y no tengan el estado ANULADO
                     */
                    if (
                      !(
                        oInsumo.oEstado_iMaestraId ==
                        oEstadoInsumoAnul.iMaestraId
                      )
                    ) {
                      if (
                        !(
                          oInsumo.oEstado_iMaestraId ==
                            oEstadoInsumoAtPick.iMaestraId ||
                          oInsumo.oEstado_iMaestraId ==
                            oEstadoInsumoNoAtPick.iMaestraId ||
                          oInsumo.oEstado_iMaestraId ==
                            oEstadoInsumoPenPesaj.iMaestraId
                        )
                      ) {
                        bOrdenAtendido = false;
                      }

                      aInsumoAtPick.push(oInsumo);
                    }
                  }
                }

                var aPromiseAdd = [];
                if (bOrdenAtendido && aInsumoAtPick.length) {
                  /**
                   * Si todos los insumos tienen el estado ATENDIDO PICKING:
                   *
                   * 1: Si el insumos de la Orden tiene la marcacion de pesaje en produccion
                   *  el insumo pasa al estado PESAJE POR PRODUCCIÓN.
                   *
                   * 2: Si el insumos de la Orden cuya CANTIDAD ATENDIDA es igual a la CANTIDAD PEDIDO
                   *  el insumo pasa al estado PESAJE FINALIZADO
                   *  caso contrario PENDIENTE PESAJE.
                   *
                   * 3: Si todos los insumos de la Orden cuya CANTIDAD ATENDIDA es igual a la CANTIDAD PEDIDO
                   *  la orden pasa al estado PESAJE FINALIZAD
                   *  caso contrario PROGRAMADO EN SALA.
                   */
                  var oAudit = {
                    fechaActualiza: new Date(),
                    usuarioActualiza: that.sUser,
                  };
                  var oItemSelect = oPedidoDetail.oItemSelect;

                  var aEstadoInsumoChange = [];
                  for (var key in aInsumoAtPick) {
                    var oInsumo = aInsumoAtPick[key];

                    /**
                     * 1: Si el insumos de la Orden tiene la marcacion de pesaje en produccion
                     *  el insumo pasa al estado PESAJE POR PRODUCCIÓN.
                     *
                     * 2: Si el insumos de la Orden cuya CANTIDAD ATENDIDA es igual a la CANTIDAD PEDIDO
                     *  el insumo pasa al estado PESAJE FINALIZADO
                     *  caso contrario PENDIENTE PESAJE.
                     */
                    var oCaractResp = null;
                    if (aCaractResp && aCaractResp.length) {
                      oCaractResp = aCaractResp.find(
                        (o) =>
                          o.Matnr === oInsumo.codigoInsumo && o.Atwrt == "X"
                      );
                    }

                    var oEstadoInsumo = oCaractResp
                      ? oEstadoInsumoPesaPrd //PESAJE POR PRODUCCIÓN
                      : oEstadoInsumoPenPesaj; //PENDIENTE PESAJE

                    if (oEstadoInsumo.codigo == CONSTANT.IPEPE) {
                      if (+oInsumo.cantAtendidaFrac >= +oInsumo.cantPedida) {
                        oEstadoInsumo = oEstadoInsumoPesaFinal; //PESAJE FINALIZADO
                      } else if (oInsumo.sugerido - oInsumo.cantAtendida <= 0) {
                        oEstadoInsumo = oEstadoInsumoPesaFinal; //PESAJE FINALIZADO
                      }
                    }

                    aEstadoInsumoChange.push(oEstadoInsumo.codigo);

                    var oEntity = {
                      oEstado_iMaestraId: oEstadoInsumo.iMaestraId,
                    };

                    if (aRespReserva) {
                      var oReserva = aRespReserva.find(
                        (itemR) =>
                          oInsumo.codigoInsumo == itemR.Matnr &&
                          oInsumo.lote == itemR.Charg
                      );

                      if (oReserva) {
                        // Actualizar registros
                        oEntity.pesadoMaterialPr = oReserva.PesadoMaterialPrd;
                        oEntity.pPLoteLog = oReserva.Pprac;
                        oEntity.pTInsumo = oReserva.Pteor;
                        oEntity.textCalPot = oReserva.Potx2Equiv;
                        oEntity.indMat = oReserva.Potx2Equiv;
                        //oEntity.indOrdenFab = oReserva.Potx1;
                        oEntity.fechaVencimiento = oReserva.FeCaduc
                          ? oReserva.FeCaduc
                          : null;
                        oEntity.glosa = oReserva.Glos2;
                      }
                    }

                    var aFilterValoresProp = [];
                    aFilterValoresProp.push(
                      new Filter("CodigoInsumo", EQ, oInsumo.codigoInsumo)
                    );
                    aFilterValoresProp.push(
                      new Filter("LoteInsumo", EQ, oInsumo.lote)
                    );
                    var aValoresPropResp = await oDataService
                      .oDataRead(
                        that.oModelErp,
                        "ValoresPropCaracteristicasSet",
                        {},
                        aFilterValoresProp
                      )
                      .catch(function (oError) {
                        console.log(oError);
                      });
                    if (aValoresPropResp) {
                      aValoresPropResp = aValoresPropResp.results;
                    }
                    if (aValoresPropResp) {
                      var oValoresPropResp = aValoresPropResp[0];

                      if (oValoresPropResp) {
                        var fFactorConversion =
                          oInsumo.unidad.toUpperCase() == "MLL"
                            ? +oValoresPropResp.AtflvPesPro.replace(",", ".")
                            : +oValoresPropResp.AtflvPesEsp.replace(",", ".");

                        // Actualizar registros
                        oEntity.cantPesoEsp =
                          parseFloat(fFactorConversion).toFixed(5);
                      }
                    }

                    var oBody = { ...oEntity, ...oAudit };

                    var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                      ordenDetalleId: oInsumo.ordenDetalleId,
                    });
                    aPromiseAdd.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });
                  }

                  /**
                   * 3: Si todos los insumos de la Orden cuya CANTIDAD ATENDIDA es igual a la CANTIDAD PEDIDO
                   *  la orden pasa al estado PESAJE FINALIZAD
                   *  caso contrario PROGRAMADO EN SALA.
                   */
                  aEstadoInsumoChange = that._uniqByKeepFirst(
                    aEstadoInsumoChange,
                    (it) => it
                  );

                  var oEstadoOrden = oEstadoOrdenProgSal; //PROGRAMADO EN SALA
                  if (
                    aEstadoInsumoChange.length == 1 &&
                    aEstadoInsumoChange[0] == CONSTANT.IPEFI
                  ) {
                    oEstadoOrden = oEstadoOrdenPesaFinal; //PESAJE FINALIZADO
                  }

                  var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                    ordenFraccionId: oItemSelect.ordenFraccionId,
                  });
                  var oEntity = {
                    oEstado_iMaestraId: oEstadoOrden.iMaestraId,
                    programacionSalaUsu: that.sUser,
                    programacionSalaFec: new Date(),
                  };

                  var oBody = { ...oEntity, ...oAudit };

                  aPromiseAdd.push({
                    sKeyEntity: oKey,
                    oBody: oBody,
                  });
                }

                var aPromiseOrdenDetalle = [];
                for (var key in aPromiseAdd) {
                  var oPromise = aPromiseAdd[key];
                  aPromiseOrdenDetalle.push(
                    oDataService.oDataUpdate(
                      that.oModel,
                      oPromise.sKeyEntity,
                      oPromise.oBody
                    )
                  );
                }

                sap.ui.core.BusyIndicator.show(0);
                MessageToast.show("Procesando registros por favor espere ... ");
                return Promise.all(aPromiseOrdenDetalle);
              })
              .then((aResp) => {
                sap.ui.core.BusyIndicator.hide();
                if (aResp.length) {
                  var oPedido = oPedidoDetail.oItemSelect;
                  var oOrdenSel = oPedidoDetail.oItemSelect;
                  that.byId("idTablePedidos").getBinding().refresh(true);
                  if (
                    that.oPedidoSelect &&
                    that.oPedidoSelect.ordenFraccionId ==
                      oOrdenSel.ordenFraccionId
                  ) {
                    that._getInsumoPedidoSelect(that.oPedidoSelect);
                  }
                  that.sendPedidoToErp(that, oPedido.pedidoId);
                  MessageBox.success(that._getI18nText("msgActualiza"));
                }
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(that._getI18nText("msgActualizaErr"));
              });
          } else if (sAction == "DESPROGRAMAR") {
            var aFilters = [];
            aFilters.push(new Filter("activo", EQ, true));
            aFilters.push(
              new Filter(
                "oOrdenFraccion_ordenFraccionId",
                EQ,
                oOrdenSelec.ordenFraccionId
              )
            );
            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataRead(that.oModel, "ORDEN_DETALLE", {}, aFilters)
              .then((oResult) => {
                var aResult = oResult.results;
                for (var key in aResult) {
                  var oItem = aResult[key];
                  oPedidoDetail.aInsumo.push(oItem);
                }

                var aEstado = that._getEstadoPedido();
                var oEstadoOrdenAten = aEstado.Orden.find(
                    (o) => o.codigo === CONSTANT.OATEN //ATENDIDO
                  ),
                  oEstadoInsumoAtPick = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IATPI //ATENDIDO PICKING
                  ),
                  oEstadoInsumoPenPesaj = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEPE //PENDIENTE PESAJE
                  ),
                  oEstadoInsumoAnul = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IANUL //ANULADO
                  ),
                  oEstadoInsumoPesaPrd = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEPR //PESAJE POR PRODUCCIÓN
                  ),
                  oEstadoInsumoPesaFinal = aEstado.Insumo.find(
                    (o) => o.codigo === CONSTANT.IPEFI //PESAJE FINALIZADO
                  );

                /* Logica para DesProgramar la Orden/Fraccion */
                var oOrdenSelect = oPedidoDetail.oItemSelect;
                var validOrdenAnulate = true;
                var aInsumoAnulate = [];
                for (var key in oPedidoDetail.aInsumo) {
                  var oInsumo = oPedidoDetail.aInsumo[key];
                  /**
                   * Evaluar que los insumos tengan el estado PENDIENTE PESAJE o PESAJE POR PRODUCCION
                   * y no tengan el estado ANULADO
                   */
                  if (
                    !(
                      oInsumo.oEstado_iMaestraId == oEstadoInsumoAnul.iMaestraId
                    )
                  ) {
                    if (
                      oOrdenSelect.ordenFraccionId ==
                      oInsumo.oOrdenFraccion_ordenFraccionId
                    ) {
                      /**
                       * 1: Si el insumos tiene el estado PESAJE POR PRODUCCIÓN
                       *  el insumo regresa al estado ATENDIDO PICKING.
                       */
                      if (
                        !(
                          (
                            oInsumo.oEstado_iMaestraId ==
                              oEstadoInsumoPenPesaj.iMaestraId ||
                            oInsumo.oEstado_iMaestraId ==
                              oEstadoInsumoPesaPrd.iMaestraId
                          ) //PENDIENTE PESAJE, PESAJE POR PRODUCCIÓN
                        )
                      ) {
                        /**
                         * 2: Si el insumos de la Orden cuya CANTIDAD ATENDIDA es igual a la CANTIDAD PEDIDO
                         *  el insumo regresa al estado ATENDIDO PICKING.
                         */
                        if (
                          oInsumo.oEstado_iMaestraId ==
                            oEstadoInsumoPesaFinal.iMaestraId &&
                          +oInsumo.cantAtendidaFrac >= +oInsumo.cantPedida
                        ) {
                        } else {
                          validOrdenAnulate = false;
                        }
                      }
                      aInsumoAnulate.push(oInsumo);
                    }
                  }
                }

                var oAudit = {
                  fechaActualiza: new Date(),
                  usuarioActualiza: that.sUser,
                };
                var aPromiseAdd = [];
                if (validOrdenAnulate && aInsumoAnulate.length) {
                  /**
                   * Si todos los insumos tienen el estado PENDIENTE PESAJE o PESAJE POR PRODUCCION:
                   *
                   * 1: La orden regresa al estado ATENDIDO
                   * 2: Los insumos regresan al estado ATENDIDO PICKING
                   */

                  var oItemSelect = oPedidoDetail.oItemSelect;
                  var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                    ordenFraccionId: oItemSelect.ordenFraccionId,
                  });
                  var oEntity = {
                    oEstado_iMaestraId: oEstadoOrdenAten.iMaestraId, //ATENDIDO
                    programacionSalaUsu: null,
                    programacionSalaFec: null,
                  };

                  var oBody = { ...oEntity, ...oAudit };

                  aPromiseAdd.push({
                    sKeyEntity: oKey,
                    oBody: oBody,
                  });

                  for (var key in aInsumoAnulate) {
                    var oInsumo = aInsumoAnulate[key];

                    var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                      ordenDetalleId: oInsumo.ordenDetalleId,
                    });
                    var oEntity = {
                      oEstado_iMaestraId: oEstadoInsumoAtPick.iMaestraId, //ATENDIDO PICKING
                    };

                    var oBody = { ...oEntity, ...oAudit };

                    aPromiseAdd.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });
                  }
                }

                var aPromiseOrdenDetalle = [];
                for (var key in aPromiseAdd) {
                  var oPromise = aPromiseAdd[key];
                  aPromiseOrdenDetalle.push(
                    oDataService.oDataUpdate(
                      that.oModel,
                      oPromise.sKeyEntity,
                      oPromise.oBody
                    )
                  );
                }
                sap.ui.core.BusyIndicator.show(0);
                MessageToast.show("Procesando registros por favor espere ... ");
                return Promise.all(aPromiseOrdenDetalle);
              })
              .then((aResp) => {
                sap.ui.core.BusyIndicator.hide();
                if (aResp.length) {
                  var oPedido = oPedidoDetail.oItemSelect;
                  var oOrdenSel = oPedidoDetail.oItemSelect;
                  that.byId("idTablePedidos").getBinding().refresh(true);
                  if (
                    that.oPedidoSelect &&
                    that.oPedidoSelect.ordenFraccionId ==
                      oOrdenSel.ordenFraccionId
                  ) {
                    that._getInsumoPedidoSelect(that.oPedidoSelect);
                  }
                  that.sendPedidoToErp(that, oPedido.pedidoId);
                  MessageBox.success(that._getI18nText("msgActualiza"));
                }
              })
              .catch((oError) => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(that._getI18nText("msgActualizaErr"));
              });
          }
        },
        onResetAction: function (oEvent) {
          var oTable = this.byId("idTableInsumos");

          var sPath =
            oEvent.getSource().oParent.oParent.oBindingContexts
              .FraccionDetalleModel.sPath;
          var oInsumo = oTable
            .getModel("FraccionDetalleModel")
            .getContext(sPath)
            .getObject();

          var aEstado = that._getEstadoPedido();
          var oEstadoInsumoPendiente = aEstado.Insumo.find(
            (o) => o.codigo === CONSTANT.IPEPE
          );

          var aFilters = [];
          aFilters.push(
            new Filter("ordenDetalleId", EQ, oInsumo.ordenDetalleId)
          );

          /**
           * Obtiene el detalle del grupo de fracciones
           */
          oDataService
            .oDataRead(that.oModel, "GRUPO_ORDEN_FRAC_DET", {}, aFilters)
            .then(async (oResult) => {
              var aResult = oResult.results;
              var oOrdenDetalle = aResult[0];
              var bCantPesar = oOrdenDetalle.requeridoFinal > 0;

              var aEstadosReset = [CONSTANT.IPEFI, CONSTANT.IPAIPARC];
              if (
                !aEstadosReset.includes(oOrdenDetalle.InsumoCodigoEstado) ||
                !bCantPesar
              ) {
                MessageBox.error(that._getI18nText("msgNoReseteo"));
                return;
              }

              /**
               * Reinicia las cantidades de pesaje y las verificaciones
               */
              var oBody = {
                ordenDetalleId: oOrdenDetalle.ordenDetalleId,
                resetear: "X",
                oEstado_iMaestraId: oEstadoInsumoPendiente.iMaestraId,
                cantAtendida: null,
                verificacionEstado: "",
                verificacionUsu: null,
                verificacionFec: null,
                fechaActualiza: new Date(),
                usuarioActualiza: that.sUser,
              };

              var aPromiseAdd = [];
              var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                ordenDetalleId: oOrdenDetalle.ordenDetalleId,
              });
              aPromiseAdd.push({
                sKeyEntity: oKey,
                oBody: oBody,
              });

              /**
               * Realiza una eliminacion logica a la entidad GRUPO_ORDEN_BULTO
               */
              var oBody = {
                ordenDetalleId: oOrdenDetalle.ordenDetalleId,
                cantidadA: null,
                fechaActualiza: new Date(),
                usuarioActualiza: that.sUser,
                activo: false,
              };

              var oKey = that.oModel.createKey("/GRUPO_ORDEN_BULTO", {
                grupoOrdenBultoId: oOrdenDetalle.grupoOrdenBultoId,
              });

              aPromiseAdd.push({
                sKeyEntity: oKey,
                oBody: oBody,
              });

              var aPromiseOrdenDetalle = [];
              for (var key in aPromiseAdd) {
                var oPromise = aPromiseAdd[key];
                aPromiseOrdenDetalle.push(
                  oDataService.oDataUpdate(
                    that.oModel,
                    oPromise.sKeyEntity,
                    oPromise.oBody
                  )
                );
              }

              sap.ui.core.BusyIndicator.show(0);
              return Promise.all(aPromiseOrdenDetalle);
            })
            .then((aResp) => {
              sap.ui.core.BusyIndicator.hide();
              if (aResp.length) {
                MessageBox.success(that._getI18nText("msgReseteo"));

                that.byId("idTablePedidos").getBinding().refresh(true);
                that._getInsumoPedidoSelect(oInsumo);

                /**
                 * Actualiza los estados de las fracciones
                 */
                that
                  ._getODataDinamic(
                    that.oModel,
                    "fnUpdateOrdenFrac",
                    {
                      ordenFraccionId: oInsumo.ordenFraccionId,
                      pedidoId: oInsumo.pedidoNumero,
                      usuario: that.sUser,
                    },
                    null
                  )
                  .then((oResp) => {})
                  .catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(oError);
                  })
                  .finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                  });

                var aFiltersDet = [];
                aFiltersDet.push(
                  new Filter(
                    "oOrdenFraccion_ordenFraccionId",
                    EQ,
                    oInsumo.ordenFraccionId
                  )
                );

                oDataService
                  .oDataRead(that.oModel, "ORDEN_DETALLE", {}, aFiltersDet)
                  .then((oResp) => {
                    var aDetalles = oResp.results;
                    var aDetalleEnVerificacion = aDetalles.filter(
                      (d) => d.verificacionEstado == ""
                    );
                    var aDetalleVerificacion = aDetalles.filter(
                      (d) => d.verificacionEstado == "V"
                    );

                    var oBodyOrdenFraccion = null;
                    if (aDetalleVerificacion.length > 0) {
                      if (
                        aDetalleEnVerificacion.length > 0 &&
                        aDetalleVerificacion.length > 0
                      ) {
                        oBodyOrdenFraccion = {
                          ordenFraccionId: oInsumo.ordenFraccionId,
                          verificacionEstado: "I",
                          verificacionFinUsu: null,
                          verificacionFinFec: null,
                          fechaActualiza: new Date(),
                          usuarioActualiza: that.sUser,
                        };
                      }
                    } else if (aDetalleVerificacion.length == 0) {
                      oBodyOrdenFraccion = {
                        ordenFraccionId: oInsumo.ordenFraccionId,
                        verificacionEstado: "",
                        verificacionIniUsu: null,
                        verificacionIniFec: null,
                        verificacionFinUsu: null,
                        verificacionFinFec: null,
                        fechaActualiza: new Date(),
                        usuarioActualiza: that.sUser,
                      };
                    }

                    if (oBodyOrdenFraccion != null) {
                      var oKeyOrdenFraccion = that.oModel.createKey(
                        "/ORDEN_FRACCION",
                        {
                          ordenFraccionId: oInsumo.ordenFraccionId,
                        }
                      );

                      oDataService
                        .oDataUpdate(
                          that.oModel,
                          oKeyOrdenFraccion,
                          oBodyOrdenFraccion
                        )
                        .then((aRespD) => {});
                    }
                  })
                  .catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(oError);
                  })
                  .finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                  });
              }
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(that._getI18nText("msgReseteoErr"));
            });
        },

        onRowSelectInsumo: function (oEvent) {
          var oTable = this.byId("idTableInsumos");
          var iIndex = oTable.getSelectedIndex();
          that.getModel("FraccionDetalleModel").getData().Bultos = [];

          if (iIndex !== -1) {
            var sPath;

            sPath = oTable.getContextByIndex(iIndex).getPath();
            var oInsumo = oTable
              .getModel("FraccionDetalleModel")
              .getContext(sPath)
              .getObject();

            that.getModel("FraccionDetalleModel").getData().Bultos =
              oInsumo.aBulto;
          }
          that.getModel("FraccionDetalleModel").refresh(true);
        },

        onMatchCodeSala: async function (oEvent) {
          if (!that._validateAccionAsigned("SALAS")) return;

          var oSource = oEvent.getSource();
          var appCData = oSource.data();
          var sLevel = appCData.level;

          var oSalaCentroModel = that.getModel("SalaCentroModel");
          var aSalaCentro = oSalaCentroModel.getData();
          var oObjectSelec = null;
          that.oObjectSelec = null;
          that.oObjectSelecLevel = sLevel;
          if (sLevel == "ORDEN") {
            oObjectSelec = oSource.getBindingContext().getObject();
            that.oObjectSelec = oObjectSelec;
          } else if (sLevel == "INSUMO") {
            oObjectSelec = oSource
              .getBindingContext("FraccionDetalleModel")
              .getObject();
            that.oObjectSelec = oObjectSelec;
          }

          var aSalaCentroSelect = aSalaCentro.filter(function (o) {
            return o.oPlanta.codigoSap == oObjectSelec.centro;
          });

          that.setModel(new JSONModel(aSalaCentroSelect), "McSalaModel");

          var sDialog = "MatchCodeSala";
          that._openDialogDinamic(sDialog);
        },

        onOkMatchCodeSala: function (oEvent) {
          var sDialog = "MatchCodeSala";
          var oSource = oEvent.getSource();
          var oTable = Fragment.byId("frg" + sDialog, "idTable" + sDialog);
          var selectedIndices = oTable.getSelectedIndices();
          var oObject = null;
          if (selectedIndices.length > 0) {
            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              oObject = oTable
                .getModel("McSalaModel")
                .getContext(sPath)
                .getObject();
            });

            if (oObject) {
              var sLevel = that.oObjectSelecLevel;
              if (sLevel == "ORDEN") {
                that._changeSalaOrden(oObject);
              } else if (sLevel == "INSUMO") {
                that._changeSalaInsumo(oObject);
              }
            }

            this._onCloseDialog(oSource);
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
                "¿Como desea imprimir el bulto?",
                "Impresora: " + oPrint.valueImpresora,
                ["BULTO", "TODOS", "CANCEL"]
              );
              if (oAction === "BULTO") {
                if (oBulto.Tipo != "FRACCION") {
                  return MessageBox.show(
                    "El bulto selecionado no es un BULTO FRACCION."
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
                });
              } else if (oAction === "TODOS") {
                var oTable = that.byId("idTableInsumos");
                var iIndex = oTable.getSelectedIndex();
                var sPath;
                sPath = oTable.getContextByIndex(iIndex).getPath();
                var oInsumo = oTable
                  .getModel("FraccionDetalleModel")
                  .getContext(sPath)
                  .getObject();

                var aBulto = oInsumo.aBulto;
                var aBultoEntero = [];
                for (var key in aBulto) {
                  var oBulto = aBulto[key];
                  if (oBulto.Tipo == "FRACCION") {
                    if (oBulto.IdBulto) {
                      aBultoEntero.push(oBulto);
                    }
                  }
                }

                if (aBultoEntero.length <= 0) {
                  return MessageBox.show("No se encontraron Bultos FRACCION.");
                }
                that._sendPrint({
                  aBultos: aBultoEntero,
                  oInsumo: oInsumo,
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
            aFilters = [];

          var oTable = this.byId("idTablePedidos");
          var oBinding = oTable.getBinding();
          aFilters = oBinding.aFilters;
          aFilters.push(new Filter("tipoCodigo", EQ, CONSTANT.TIPOP));
          sap.ui.core.BusyIndicator.show(0);
          var oResp = await oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_SALA_CP",
              oUrlParameters,
              aFilters
            )
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            });
          sap.ui.core.BusyIndicator.hide();
          var aOrdenList = oResp.results;

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "SEGIMIENTO SALA PEDIDO",
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

            that._getI18nText("clUsuProgramSala"), //"Usuario Programa",
            that._getI18nText("clFecProgramSala"), //"Fecha Programa",
            that._getI18nText("clHoraProgramSala"), //"Hora Programa",

            that._getI18nText("clUsuCreacion"), //"Usuario Creación",
            that._getI18nText("clFecCreacion"), //"Fecha Creación",
            that._getI18nText("clHoraCreacion"), //"Hora Creación",

            that._getI18nText("clUsuIniPesaje"), //"Pesaje Inicio Usuario",
            that._getI18nText("clFecIniPesaje"), //"Pesaje Inicio Fecha",
            that._getI18nText("clHoraIniPesaje"), //"Pesaje Inicio Hora",

            that._getI18nText("clUsuFinPesaje"), //"Pesaje Fin Usuario",
            that._getI18nText("clFecFinPesaje"), //"Pesaje Fin Fecha",
            that._getI18nText("clHoraFinPesaje"), //"Pesaje Fin Hora",
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
              report.programacionSalaUsu,
              formatter.getTimestampToDMY(report.programacionSalaFec),
              formatter.getTimestampToHMS(report.programacionSalaFec),
              report.usuCreacion,
              formatter.getTimestampToDMY(report.fecCreacion),
              formatter.getTimestampToHMS(report.fecCreacion),
              report.pesajeIniUsu,
              formatter.getTimestampToDMY(report.pesajeIniFec),
              formatter.getTimestampToHMS(report.pesajeIniFec),
              report.pesajeFinUsu,
              formatter.getTimestampToDMY(report.pesajeFinFec),
              formatter.getTimestampToHMS(report.pesajeFinFec),
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

          XLSX.writeFile(wb, "SEGIMIENTO SALA PEDIDO.xlsx");
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

        _changeSalaOrden: async function (oSalaSelect) {
          if (!that._validateAccionAsigned("SALAS")) return;
          var sSalaKey = oSalaSelect.salaPesajeId;
          var oOrdenSelec = that.oObjectSelec;

          var aFiltersGrupoDet = [];
          aFiltersGrupoDet.push(new Filter("activo", EQ, true));
          aFiltersGrupoDet.push(
            new Filter(
              "oOrdenFraccion_ordenFraccionId",
              EQ,
              oOrdenSelec.ordenFraccionId
            )
          );
          sap.ui.core.BusyIndicator.show(0);
          var aGrupoOrdenDet = await oDataService
            .oDataRead(that.oModel, "GRUPO_ORDEN_DET", {}, aFiltersGrupoDet)
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(that._getI18nText("msgActualizaErr"));
              console.log(oError);
            });

          if (aGrupoOrdenDet.results && aGrupoOrdenDet.results.length > 0) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.error(that._getI18nText("msgNoCambiarSala"));
            return;
          }

          var aFilters = [];
          aFilters.push(new Filter("activo", EQ, true));
          aFilters.push(
            new Filter(
              "oOrdenFraccion_ordenFraccionId",
              EQ,
              oOrdenSelec.ordenFraccionId
            )
          );
          sap.ui.core.BusyIndicator.show(0);
          var aInsumo = await oDataService
            .oDataRead(that.oModel, "ORDEN_DETALLE", {}, aFilters)
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(that._getI18nText("msgActualizaErr"));
              console.log(oError);
            });

          if (aInsumo.results) {
            var aResult = aInsumo.results;

            var aEstado = that._getEstadoPedido();
            var oEstadoInsumoPenPesaj = aEstado.Insumo.find(
                (o) => o.codigo === CONSTANT.IPEPE //PENDIENTE PESAJE
              ),
              oEstadoInsumoPesaPrd = aEstado.Insumo.find(
                (o) => o.codigo === CONSTANT.IPEPR //PENDIENTE PESAJE
              ),
              oEstadoInsumoAtPick = aEstado.Insumo.find(
                (o) => o.codigo === CONSTANT.IATPI //ATENDIDO PICKING
              ),
              oEstadoInsumoNoAtPick = aEstado.Insumo.find(
                (o) => o.codigo === CONSTANT.INAPI //NO ATENDIDO PICKING
              );

            //Seleccionar insumos que tengan el estado PENDIENTE PESAJE, ATENDIDO PICKING, NO ATENDIDO PICKING
            var aInsumoChange = [];
            for (var key in aResult) {
              var oItem = aResult[key];
              if (
                oItem.oEstado_iMaestraId == oEstadoInsumoPenPesaj.iMaestraId ||
                oItem.oEstado_iMaestraId == oEstadoInsumoPesaPrd.iMaestraId ||
                oItem.oEstado_iMaestraId == oEstadoInsumoAtPick.iMaestraId ||
                oItem.oEstado_iMaestraId == oEstadoInsumoNoAtPick.iMaestraId
              ) {
                aInsumoChange.push(oItem);
              }
            }

            var aPromiseAdd = [];
            if (aInsumoChange.length > 0) {
              var oAudit = {
                fechaActualiza: new Date(),
                usuarioActualiza: that.sUser,
              };

              for (var key in aInsumoChange) {
                var oInsumo = aInsumoChange[key];
                var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oInsumo.ordenDetalleId,
                });
                var oEntity = {
                  oSala_salaPesajeId: sSalaKey,
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromiseAdd.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });
              }

              var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                ordenFraccionId: oOrdenSelec.ordenFraccionId,
              });
              var oEntity = {
                oSala_salaPesajeId: sSalaKey,
              };
              var oBody = { ...oEntity, ...oAudit };

              aPromiseAdd.push({
                sKeyEntity: oKey,
                oBody: oBody,
              });
            }

            var aPromiseOrdenDetalle = [];
            for (var key in aPromiseAdd) {
              var oPromise = aPromiseAdd[key];
              aPromiseOrdenDetalle.push(
                oDataService.oDataUpdate(
                  that.oModel,
                  oPromise.sKeyEntity,
                  oPromise.oBody
                )
              );
            }

            sap.ui.core.BusyIndicator.show(0);
            Promise.all(aPromiseOrdenDetalle).then((aResp) => {
              sap.ui.core.BusyIndicator.hide();
              if (aResp.length) {
                that.byId("idTablePedidos").getBinding().refresh(true);
                if (
                  that.oPedidoSelect &&
                  that.oPedidoSelect.ordenFraccionId ==
                    oOrdenSelec.ordenFraccionId
                ) {
                  that._getInsumoPedidoSelect(that.oPedidoSelect);
                }
                MessageBox.success(that._getI18nText("msgActualiza"));
              } else {
                MessageBox.warning(
                  "No se encontro insumos con el estado PENDIENTE PESAJE"
                );
              }
            });
          }
        },
        _changeSalaInsumo: async function (oSalaSelect) {
          if (!that._validateAccionAsigned("SALAS")) return;
          var sSalaKey = oSalaSelect.salaPesajeId;
          var oInsumoSelec = that.oObjectSelec;

          var aFilters = [];
          aFilters.push(new Filter("activo", EQ, true));
          aFilters.push(
            new Filter("ordenDetalleId", EQ, oInsumoSelec.ordenDetalleId)
          );
          sap.ui.core.BusyIndicator.show(0);
          var aInsumo = await oDataService
            .oDataRead(that.oModel, "ORDEN_DETALLE", {}, aFilters)
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(that._getI18nText("msgActualizaErr"));
              console.log(oError);
            });

          if (aInsumo.results) {
            var aResult = aInsumo.results;

            var aEstado = that._getEstadoPedido();
            var oEstadoInsumoPenPesaj = aEstado.Insumo.find(
              (o) => o.codigo === CONSTANT.IPEPE //PENDIENTE PESAJE
            );

            //Seleccionar insumos que tengan el estado PENDIENTE PESAJE
            var aInsumoChange = [];
            for (var key in aResult) {
              var oItem = aResult[key];
              if (
                oItem.oEstado_iMaestraId == oEstadoInsumoPenPesaj.iMaestraId
              ) {
                aInsumoChange.push(oItem);
              }
            }

            if (aInsumoChange.length > 0) {
              var aPromiseAdd = [];
              var oAudit = {
                fechaActualiza: new Date(),
                usuarioActualiza: that.sUser,
              };

              for (var key in aInsumoChange) {
                var oInsumo = aInsumoChange[key];

                var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oInsumo.ordenDetalleId,
                });
                var oEntity = {
                  oSala_salaPesajeId: sSalaKey,
                };

                var oBody = { ...oEntity, ...oAudit };

                aPromiseAdd.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });
              }

              var aPromiseOrdenDetalle = [];
              for (var key in aPromiseAdd) {
                var oPromise = aPromiseAdd[key];
                aPromiseOrdenDetalle.push(
                  oDataService.oDataUpdate(
                    that.oModel,
                    oPromise.sKeyEntity,
                    oPromise.oBody
                  )
                );
              }

              sap.ui.core.BusyIndicator.show(0);
              Promise.all(aPromiseOrdenDetalle).then((aResp) => {
                sap.ui.core.BusyIndicator.hide();
                if (aResp.length) {
                  if (
                    that.oPedidoSelect &&
                    that.oPedidoSelect.ordenFraccionId ==
                      oInsumoSelec.ordenFraccionId
                  ) {
                    that._getInsumoPedidoSelect(that.oPedidoSelect);
                  }
                  MessageBox.success(that._getI18nText("msgActualiza"));
                } else {
                  MessageBox.warning(
                    "No se encontro insumos con el estado PENDIENTE PESAJE"
                  );
                }
              });
            }
          }
        },

        _sendPrint: function (oData) {
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
                bSaldo: "",
                tipo: "", //Tipo de impresion [AM: Almacen Materiales, CP: Central Pesada]
                idBulto: "", //Bulto HU
              },
              null
            )
            .then((oResp) => {
              MessageBox.information("Enviado a la cola de impresión.");
            })
            .catch(function (oError) {
              sap.ui.core.BusyIndicator.hide();
              console.log(oError);
            })
            .finally(function () {
              sap.ui.core.BusyIndicator.hide();
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

              oResult.results.forEach(function (e) {
                e.bCantPesar = +e.sugerido - +e.cantAtendida > 0;
              });

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
                var cantAtendidaFracc = 0;
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

                      //aBultoFilter.push(oItem);
                    }
                  }

                  if (["SALDO"].includes(oItem.Tipo)) {
                    if (oItem.IdBulto) {
                      if (
                        oItem.CodigoInsumo == oInsumo.codigoInsumo &&
                        oItem.Lote == oInsumo.lote
                      ) {
                        //aBultoFilter.push(oItem);
                      }
                    }
                  }

                  if (
                    +oItem.Fraccion == +oInsumo.numFraccion &&
                    +oItem.Subfraccion == +oInsumo.numSubFraccion &&
                    oItem.Orden == oData.numOrden &&
                    oItem.CodigoInsumo == oInsumo.codigoInsumo &&
                    oItem.Lote == oInsumo.lote &&
                    oItem.Tipo == "FRACCION" &&
                    (oInsumo.insumoResetea == "" ||
                      oInsumo.insumoResetea == null)
                  ) {
                    cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                    /*
                        if (["KG", "G"].includes(oItem.UnidadM.toUpperCase())) {
                          cantAtendidaFracc =
                            cantAtendidaFracc + +oItem.BalanzaPeso;
                        } else {
                          cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                        }
                        */
                    aBultoFilter.push(oItem);
                  }
                }

                oInsumo.cantAtendida = cantAtendidaEntero;
                oInsumo.cantAtendidaFrac = cantAtendidaFracc;

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
                  PEDIDO: oPedido.pedidoNumero /**Numero Pedido*/,
                  CENTRO: oPedido.pedidoCentro /**Centro Pedido*/,
                  STATUSPED: oPedido.pedidoEstadoD /**Estado Pedido*/,
                  TIPO_P_D: oPedido.pedidoTipoDN /**Tipo Pedido Detalle*/,
                  CodTipoPD: oPedido.pedidoTipoDC,
                  TIPO_P: oPedido.pedidoTipo /**Tipo Pedido ID*/,
                  SALA: oPedido.pedidoSala /**Sala Pedido*/,
                  FECHAC:
                    formatter.getFormatShortDateYMD(oPedido.pedidoFecha) +
                    "T00:00:00.0000000" /**Fecha Creacion Pedido*/,
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

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("CPSSOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "PROGRAMAR":
              bValid = sRol.includes("CPSSPROGR");
              break;
            case "SALAS":
              bValid = sRol.includes("CPSSASALA");
              break;
            case "RESETEAR":
              bValid = sRol.includes("CPSSRESET");
              break;
            case "ANULAR":
              bValid = sRol.includes("CPSSANUL");
              break;
            case "IMPRIMIR":
              bValid = sRol.includes("CPSSIMPB");
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

        _openDialogDinamic: function (sDialog) {
          var sDialogName = "o" + sDialog;
          if (!window[sDialogName]) {
            window[sDialogName] = sap.ui.xmlfragment(
              "frg" + sDialog,
              rootPath + ".view.centralPesadas.dialog." + sDialog,
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
            oDataService
              .oDataRead(oModel, sEntity, oUrlParameters, aFilter)
              .then(function (oResult) {
                resolve(oResult.results);
              })
              .catch(function (oError) {
                console.log(oError);
                reject(oError);
              })
              .finally(function () {});
          });
        },
      }
    );
  }
);
