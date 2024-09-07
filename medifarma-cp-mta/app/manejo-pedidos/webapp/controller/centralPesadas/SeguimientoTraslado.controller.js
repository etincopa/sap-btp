sap.ui.define(
  [
    "../BaseController",
    "sap/ui/core/Fragment",
    "com/medifarma/cp/manejopedidos/model/models",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "com/medifarma/cp/manejopedidos/service/oDataService",
    "com/medifarma/cp/manejopedidos/lib/Sheet",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    Fragment,
    models,
    formatter,
    MessageBox,
    MessageToast,
    Filter,
    FilterOperator,
    JSONModel,
    oDataService,
    Sheet,
    Dialog,
    Button,
    List,
    StandardListItem
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
        GROL: "CPST", //GRUPO ROL
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
      },
      oMessagePopover;
    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.centralPesadas.SeguimientoTraslado",
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

          that.setModel(new JSONModel([]), "MsgPopoverList");
          that.setModel(new JSONModel({}), "MaestraModel");
          that.setModel(new JSONModel({}), "SalasModel");
          that.setModel(new JSONModel({}), "FraccionDetalleModel");
          that.setModel(
            new JSONModel({
              Log: [],
              UI: {
                confirm: true,
                operation: false,
              },
              selectedAction: "",
              list: [],
            }),
            "localModel"
          );

          that.oRouter
            .getTarget("TargetSeguimientoTraslado")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
          that._createLogDialog();
          //that._createPopover();
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

        onTraslado: async function (oEvent) {
          /**
           * Trasladar todos los bultos de los insumos de una Orden
           * al Centro de la orden.
           */

          if (!that._validateAccionAsigned("TRASLADO")) return;
          sap.ui.core.BusyIndicator.show(0);
          try {
            const oSource = oEvent.getSource();
            var iIndex = oSource.getParent().getIndex();
            if (iIndex !== -1) {
              var oObject = oSource.getBindingContext().getObject();

              /**
               * Evalua si el la orden ya tiene un pedido de traslado
               */
              if (oObject.pedidoTraslado) {
                /**
                 * Verifica si el pedido de traslado no este anulado
                 */
                var oPedidoErp = await oDataService
                  .oDataRead(that.oModelErp, "TrasladoCentrosSet", {}, [
                    new Filter("PoNumber", EQ, oObject.pedidoTraslado),
                  ])
                  .catch(function (oError) {
                    console.log(oError);
                  });

                oPedidoErp = oPedidoErp ? oPedidoErp.results : [];
                if (oPedidoErp.length) {
                  var aStatusTras = that._uniqByKeepFirst(
                    oPedidoErp,
                    (it) => it.Loekz
                  );
                  if (aStatusTras.length == 1 && aStatusTras[0].Loekz == "L") {
                    /**
                     * Informa si el pedido de traslado fue anulado
                     */
                    MessageToast.show("Pedido Traslado Anulado...");
                  } else {
                    /**
                     * Informa si la orden ya tiene un pedido de traslado
                     */
                    sap.ui.core.BusyIndicator.hide();
                    that.getModel("localModel").setProperty("/Log", oPedidoErp);
                    var sDialog = "MessageAll";
                    that._openDialogDinamic(sDialog);

                    //that.oLogDialog.open();

                    MessageBox.warning(
                      "El documento ya tiene un traslado: " +
                        oObject.pedidoTraslado
                    );

                    return;
                  }
                }
              }

              /**
               * Si la orden no tiene pedido de traslado o el pedido de traslado esta anulado
               * se realiza el traslado de los bultos
               */
              var oAction = await that.doMessageboxActionCustom(
                "CONFIRMAR",
                "¿Esta seguro de trasladar los bultos?",
                ["SI", "NO"]
              );
              if (oAction === "SI") {
                await that._getInsumoPedidoSelect(oObject);

                var oDetalleModel = that
                  .getModel("FraccionDetalleModel")
                  .getData();
                var aBultosAll = oDetalleModel.BultosAll;
                var aInsumo = oDetalleModel.Insumos;

                if (aBultosAll && aBultosAll.length) {
                  var oTrasladoCentrosHead = {
                    Object: "BTP",
                    Pedido: oObject.numPedido,
                    OrdenCab: oObject.numOrden,
                    CentroDest: oObject.centro,
                    CentroOri: oObject.centroPedido,
                    TrasladoCentrosSet: [],
                  };

                  var aTrasladoCentros = [];

                  for (const keyI in aInsumo) {
                    var oInsumo = aInsumo[keyI];
                    var aBulto = oInsumo.aBulto;

                    /**
                     * Mapea todos los bultos de tipo ENTERO y FRACCION
                     * para realizar el traslado de los bultos de los insumos de la orden
                     */
                    for (const key in aBulto) {
                      var o = aBulto[key];
                      if (["ENTERO", "FRACCION"].includes(o.Tipo)) {
                        aTrasladoCentros.push({
                          ItemPos: oInsumo.ordenPos,
                          CentroDest: oObject.centro, // Centro destino: Cento de la Orden
                          CentroOri: o.Centro, // Centro Origen: Centro del insumo
                          Matnr: o.CodigoInsumo,
                          Qty: o.CantidadA,
                          PoUnit: o.UnidadM,
                          Batch: o.Lote,
                          Orden: o.Orden,
                          Tipo: o.Tipo,
                        });
                      }
                    }
                  }

                  if (aTrasladoCentros.length) {
                    oTrasladoCentrosHead.TrasladoCentrosSet = aTrasladoCentros;

                    /**
                     * Se envia la Orden y los bultos a trasladar
                     */
                    var oTrasResp = await oDataService
                      .oDataCreate(
                        that.oModelErp,
                        "TrasladoCentrosHeadSet",
                        oTrasladoCentrosHead
                      )
                      .catch((oError) => {
                        console.log(oError);
                      });

                    that.sendLogProcess(
                      that.oModel,
                      that.sUser,
                      "CENTRAL PESADAS",
                      "SEGUIMIENTO TRASLADO",
                      "onTraslado",
                      "TRASLADO",
                      "I",
                      "POST",
                      "TrasladoCentrosHeadSet",
                      "",
                      JSON.stringify(oTrasladoCentrosHead ?? {}),
                      JSON.stringify(oTrasResp ?? {})
                    );

                    if (oTrasResp && oTrasResp.statusCode && oTrasResp.data) {
                      var aTrasResp = oTrasResp.data.TrasladoCentrosSet.results;
                      //CreatDate	-> Fecha de creación
                      //CreatedBy	-> Usuario de creación
                      //PoNumber 	-> Número del documento de compras
                      //Item		-> Código de Item

                      for (var oItem of aInsumo) {
                        var oTrasPedEnt = aTrasResp.find(
                          (o) =>
                            oItem.codigoInsumo == o.Matnr &&
                            oItem.lote == o.Batch &&
                            ["ENTERO"].includes(o.Tipo)
                        );

                        var oTrasPedFrac = aTrasResp.find(
                          (o) =>
                            oItem.codigoInsumo == o.Matnr &&
                            oItem.lote == o.Batch &&
                            ["FRACCION"].includes(o.Tipo)
                        );
                        if (oTrasPedEnt) {
                          oItem.pedidoTraslado = oTrasPedEnt.PoNumber;
                          oItem.pedidoTrasladoPosEnt = oTrasPedEnt.PoItem;
                        }
                        if (oTrasPedFrac) {
                          oItem.pedidoTraslado = oTrasPedFrac.PoNumber;
                          oItem.pedidoTrasladoPosFra = oTrasPedFrac.PoItem;
                        }
                      }

                      aTrasResp = aTrasResp.filter((o) => {
                        return ["S", "E"].includes(o.Type);
                      });

                      var aTrasDocument = aTrasResp.filter((o) => {
                        return ![""].includes(o.PoNumber);
                      });

                      if (aTrasDocument && aTrasDocument.length) {
                        var aPromiseUpdateTraslado = [];
                        var oAudit = {
                          fechaActualiza: new Date(),
                          usuarioActualiza: that.sUser,
                        };

                        /**
                         * Se actualiza la Orden con el numero de traslado generado
                         */
                        var sKeyEntity = that.oModel.createKey(
                          "/ORDEN_FRACCION",
                          {
                            ordenFraccionId: oObject.ordenFraccionId,
                          }
                        );
                        var oEntity = {
                          pedidoTrasladoUsu: that.sUser,
                          pedidoTrasladoFec: new Date(), //aTrasDocument[0].CreatDate,
                          pedidoTraslado: aTrasDocument[0].PoNumber,
                        };

                        var oBody = { ...oEntity, ...oAudit };

                        aPromiseUpdateTraslado.push(
                          oDataService.oDataUpdate(
                            that.oModel,
                            sKeyEntity,
                            oBody
                          )
                        );

                        for (var oItem of aInsumo) {
                          var sKeyEntity = that.oModel.createKey(
                            "/ORDEN_DETALLE",
                            {
                              ordenDetalleId: oItem.ordenDetalleId,
                            }
                          );

                          var oEntity = {
                            pedidoTraslado: oItem.pedidoTraslado,
                            pedidoTrasladoPosEnt: oItem.pedidoTrasladoPosEnt,
                            pedidoTrasladoPosFra: oItem.pedidoTrasladoPosFra,
                          };

                          var oBody = { ...oEntity, ...oAudit };

                          aPromiseUpdateTraslado.push(
                            oDataService.oDataUpdate(
                              that.oModel,
                              sKeyEntity,
                              oBody
                            )
                          );
                        }

                        await Promise.all(aPromiseUpdateTraslado);

                        that.byId("idTablePedidos").getBinding().refresh(true);
                      }

                      that
                        .getModel("localModel")
                        .setProperty("/Log", aTrasResp);
                      var sDialog = "MessageAll";
                      that._openDialogDinamic(sDialog);

                      //that.oLogDialog.open();
                    } else {
                      MessageBox.warning(
                        "Ops!. Algo salio mal no se encontro respuesta del servidor al realizar el traslado."
                      );
                    }
                  } else {
                    MessageBox.warning(
                      "No se encontraron bultos para trasladar."
                    );
                  }
                } else {
                  MessageBox.warning(
                    "No se encontraron bultos para trasladar."
                  );
                }
              }
            }
          } catch (oError) {
            console.log(oError);
          }
          sap.ui.core.BusyIndicator.hide();
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
            aFilters = [],
            EQ = FilterOperator.EQ;

          var oTable = this.byId("idTablePedidos");
          var oBinding = oTable.getBinding();
          aFilters = oBinding.aFilters;
          aFilters.push(new Filter("tipoCodigo", EQ, CONSTANT.TIPOP));
          sap.ui.core.BusyIndicator.show(0);
          var oResp = await oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_TRASLADO_CP",
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
            Title: "SEGUIMIENTO TRASLADO PEDIDO",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("PEDIDO");

          var ws_headerPedido = [
            that._getI18nText("lblPedido"), //"Pedido",
            that._getI18nText("clTipoPedido"), //"Tipo de Pedido",
            that._getI18nText("clOrdReser"), //"Orden Prod/Reserva",
            that._getI18nText("clFraccion"), //"Fracción",
            that._getI18nText("clCodPT"), //"Codigo Producto",
            that._getI18nText("clDescPT"), //"Descripción Producto",
            that._getI18nText("clLotePT"), //"Lote Producto",
            that._getI18nText("dclSala"), //"Sala",
            that._getI18nText("dclPedidoTraslado"), //"Pedido Traslado",
            that._getI18nText("clEstado"), //"Estado",
            that._getI18nText("dclVerificado"), //"Verificado",
            that._getI18nText("lblTamanoLote"), //"Tamaño Lote",

            that._getI18nText("clUsuTransferencia"), //"Transferencia Usuario",
            that._getI18nText("clFecTransferencia"), //"Transferencia Fecha",
            that._getI18nText("clHoraTransferencia"), //"Transferencia Hora",

            that._getI18nText("clUsuIniVerif"), //"Verificación Inicio Usuario",
            that._getI18nText("clFecIniVerif"), //"Verificación Inicio Fecha",
            that._getI18nText("clHoraIniVerif"), //"Verificación Inicio Hora",

            that._getI18nText("clUsuFinVerif"), //"Verificación Fin Usuario",
            that._getI18nText("clFecFinVerif"), //"Verificación Fin Fecha",
            that._getI18nText("clHoraFinVerif"), //"Verificación Fin Hora",

            that._getI18nText("clUsuEntregaFis"), //"Entrega Fisica Usuario",
            that._getI18nText("clFecEntregaFis"), //"Entrega Fisica Fecha",
            that._getI18nText("clHoraEntregaFis"), //"Entrega Fisica Hora",

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
              report.pedidoTraslado,
              report.estadoOrden,
              report.ordenVerificacionEstado,
              report.tamanoLote,

              report.pedidoTrasladoUsu,
              formatter.getTimestampToDMY(report.pedidoTrasladoFec),
              formatter.getTimestampToHMS(report.pedidoTrasladoFec),

              report.verificacionIniUsu,
              formatter.getTimestampToDMY(report.verificacionIniFec),
              formatter.getTimestampToHMS(report.verificacionIniFec),

              report.verificacionFinUsu,
              formatter.getTimestampToDMY(report.verificacionFinFec),
              formatter.getTimestampToHMS(report.verificacionFinFec),

              report.entregaFisUsu,
              formatter.getTimestampToDMY(report.entregaFisFec),
              formatter.getTimestampToHMS(report.entregaFisFec),

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

          XLSX.writeFile(wb, "SEGUIMIENTO TRASLADO PEDIDO.xlsx");
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
            EQ = FilterOperator.EQ,
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
              aFilters.push(new Filter("activo", FilterOperator.EQ, true));
              aFilters.push(
                new Filter("oPlanta/activo", FilterOperator.EQ, true)
              );
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

              that.setModel(new JSONModel(aPlantaTemp), "CentroModel"); //Comentar para que filtren todos los Centros
              that.setModel(new JSONModel(aPlantaTemp), "CentroSalaModel");
              that.setModel(new JSONModel(aSalaPesaje), "SalaCentroModel");
            });
        },

        _getInsumoPedidoSelect: async function (oData) {
          var oView = that.getView();
          var oFraccionDetalleModel = oView.getModel("FraccionDetalleModel");
          oFraccionDetalleModel.setData([]);
          oFraccionDetalleModel.refresh(true);

          sap.ui.core.BusyIndicator.show(0);
          var aFilters = [];
          aFilters.push(
            new Filter("ordenFraccionId", EQ, oData.ordenFraccionId)
          );
          var oResult = await oDataService.oDataRead(
            that.oModel,
            "VIEW_SEGUIMIENTO_DETALLE",
            {},
            aFilters
          );

          sap.ui.core.BusyIndicator.hide();
          that.getModel("FraccionDetalleModel").getData().Insumos =
            oResult.results.filter((o) => {
              return o.insumoEstadoDes != "ANULADO" && o.centro != oData.centro;
            });
          that.getModel("FraccionDetalleModel").refresh(true);

          aFilters = [];
          aFilters.push(new Filter("Pedido", EQ, oData.numPedido));

          sap.ui.core.BusyIndicator.show(0);
          var oResult = await oDataService.oDataRead(
            that.oModelErp,
            "AtendidoItemSet",
            {},
            aFilters
          );

          sap.ui.core.BusyIndicator.hide();
          var aBulto = oResult.results;
          var aInsumos = that
            .getModel("FraccionDetalleModel")
            .getData().Insumos;

          var aBultoFilterAll = [];
          for (var key0 in aInsumos) {
            var oInsumo = aInsumos[key0];
            var aBultoFilter = [];

            var cantAtendidaEntero = 0;
            var cantAtendidaFracc = 0;
            var cantEntregada = 0;

            for (var key in aBulto) {
              var oItem = aBulto[key];
              if (
                +oItem.Fraccion == +oInsumo.numFraccion &&
                +oItem.Subfraccion == +oInsumo.numSubFraccion &&
                oItem.Orden == oInsumo.ordenNumero &&
                oItem.CodigoInsumo == oInsumo.codigoInsumo &&
                oItem.Lote == oInsumo.lote &&
                oItem.IdBulto != "" &&
                ["ENTERO", "FRACCION"].includes(oItem.Tipo)
              ) {
                if (oItem.FlagVerif == "X") cantEntregada += +oItem.CantidadA;

                if (["ENTERO"].includes(oItem.Tipo)) {
                  cantAtendidaEntero = cantAtendidaEntero + +oItem.CantidadA;
                } else {
                  cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                  /*
                  if (["KG", "G"].includes(oItem.UnidadM.toUpperCase())) {
                    cantAtendidaFracc = cantAtendidaFracc + +oItem.BalanzaPeso;
                  } else {
                    cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                  }
                  */
                }

                aBultoFilter.push(oItem);
              }
            }

            oInsumo.cantEntregada = cantEntregada;
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

            aBultoFilterAll = aBultoFilterAll.concat(aBultoFilter);
          }
          that.getModel("FraccionDetalleModel").getData().BultosAll =
            aBultoFilterAll;

          that.getModel("FraccionDetalleModel").refresh(true);
        },

        _resetModel: function () {
          var oOrdenSelectedItemsModel = that.getModel("FraccionDetalleModel");
          oOrdenSelectedItemsModel.setData([]);
          oOrdenSelectedItemsModel.refresh(true);
        },

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("CPSTOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "TRASLADO":
              bValid = sRol.includes("CPSTOTRAS");
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

        _createLogDialog: function () {
          if (!this.oLogDialog) {
            this.oLogDialog = new Dialog({
              title: "Detalle",
              content: new List({
                items: {
                  path: "localModel>/Log",
                  template: new StandardListItem({
                    title: "{localModel>PoNumber}",
                    description: "{localModel>Type} : {localModel>Message}",
                    infoState: "Information",
                    highlight: "Information",
                    wrapping: true,
                  }),
                },
              }),
              endButton: new Button({
                text: "Close",
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
        onCloseDialog: function (oEvent) {
          sap.ui.core.BusyIndicator.hide();
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },
        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
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
        _getI18nText: function (sText) {
          return this.oView.getModel("i18n") === undefined
            ? false
            : this.oView.getModel("i18n").getResourceBundle().getText(sText);
        },
      }
    );
  }
);
