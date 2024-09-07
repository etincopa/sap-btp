sap.ui.define(
  [
    "../BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/MessageToast",

    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",

    "sap/base/util/uid",
    "com/medifarma/cp/manejopedidos/model/models",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "com/medifarma/cp/manejopedidos/service/oDataService",
    "sap/suite/ui/commons/util/DateUtils",
    "com/medifarma/cp/manejopedidos/lib/Sheet",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    Fragment,
    Core,
    MessageBox,
    MessageToast,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Label,
    Text,
    TextArea,
    uid,
    models,
    formatter,
    oDataService,
    DateUtils,
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
        GROL: "AMPA", //GRUPO ROL
        AUX_ROL: "CP_AUXILIAR_ALMACEN_INSUMOS",
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
        PBLOQ: "AMPBLOQ", //BLOQUEADO
        PANUL: "AMPANUL", //ANULADO
        /**
         * ORDEN
         */
        OPEND: "AMOPEND", //PENDIENTE
        OPICK: "AMOPICK", //PICKING
        OATEN: "AMOATEN", //ATENDIDO
        OPRSA: "AMOPRSA", //PROGRAMADO EN SALA
        OPEFI: "AMOPEFI", //PESAJE FINALIZADO
        OENTR: "AMOENTR", //ENTREGA EN TRANSITO
        OENVA: "AMOENVA", //ENTREGA VERIFICADA
        OANUL: "AMOANUL", //ANULADO
        /**
         * INSUMO
         */
        IPEPE: "AMIPEPE", //PENDIENTE PESAJE
        IPEPI: "AMIPEPI", //PENDIENTE PICKING
        IATPI: "AMIATPI", //ATENDIDO PICKING
        INAPI: "AMINAPI", //NO ATENDIDO PICKING
        IENVA: "AMIENVA", //ENTREGA VERIFICADA
        IPEPR: "AMIPEPR", //PESAJE POR PRODUCCIÓN
        IPEFI: "AMIPEFI", //PESAJE FINALIZADO
        IANUL: "AMIANUL", //ANULADO
      };

    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.almacen.PedidoAlmacen",
      {
        formatter: formatter,

        /**-----------------------------------------------*/
        /*              L I F E C Y C L E
              /**-----------------------------------------------*/
        onInit: function () {
          that = this;
          that.aRol = null;
          that.sRol = null;
          that.sDiffDays = 0;
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          that.sAppName = "ManejoPedidos";

          //DATA MAESTRA
          that.setModel(new JSONModel([]), "MaestraModel");

          that.setModel(new JSONModel([]), "TempOrdenListModel"); //Lista de ordenes selecionadas (Dialog)

          //MODELOS PEDIDO NORMAL, URGENTE
          that.setModel(new JSONModel([]), "OrdenListModel");
          that.setModel(new JSONModel([]), "OrdenInsumoListModel");

          that.setModel(new JSONModel({}), "OrdenSelectedItemsModel");

          that.setModel(new JSONModel({}), "PedidoUsuarioListModel");
          that.setModel(new JSONModel({}), "UserRoleListModel");

          //MODELOS PEDIDO INDIVIDUAL/ADICIONAL
          that.setModel(new JSONModel([]), "PAIndividualOrdenListModel");
          that.setModel(new JSONModel({}), "PAIndividualListModel");

          //MODELOS PEDIDO IDE MUESTRA
          that.setModel(new JSONModel({}), "ReservaModel");
          that.setModel(new JSONModel({}), "ReservaListModel");

          that.setModel(models.pedidosAgregarOrdenModel(), "AgregarOrdenModel");

          that.setModel(new JSONModel({}), "ComprometidaDetailModel");

          that.setModel(models.createPedidoModel(), "PedidoModel");
          that.setModel(new JSONModel({}), "TipoPedidoDetalleListModel");

          that.setModel(new JSONModel({}), "oParamFirstModel");
          that.setModel(new JSONModel({}), "oParamSecondModel");
          that.setModel(new JSONModel({}), "oParamThirdModel");

          that.setModel(new JSONModel({}), "UsuariosPedidosModel");

          that.oRouter
            .getTarget("TargetPedidoAlmacen")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
        },
        _handleRouteMatched: function (oEvent) {
          var that = this;
          this.getView().setModel(
            new sap.ui.model.json.JSONModel([]),
            "MaestraModel"
          );

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

                that._getMaestra();
                that._getCentro();
                that._getTipoPedido();
                /**
                 * Cargar filtros predeterminados
                 * Por centro del usuario logueado
                 * Por los ultimos 30 dias de la fecha de creacion pedido
                 */
                that._cargaInicial();
              }
              return false;
            })
            .catch((oError) => {});
        },

        _cargaInicial: async function () {
          //OBTENER CENTRO DEL USUARIO ACTUAL
          var oTable = this.byId("idPedidoList");
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

        _getMaestra: async function () {
          var aMaestra = await that._getODataDinamic(
            that.oModel,
            "VIEW_MAESTRA",
            {},
            []
          );
          if (aMaestra && aMaestra.length) {
            var aConstant = aMaestra.reduce(function (r, a) {
              var sKey = a.tabla.toUpperCase();
              r[sKey] = r[sKey] || [];
              if (!["AMOENFI", "AMOENTRE", "AMOPEPA"].includes(a.codigo)) {
                r[sKey].push(a);
              }
              return r;
            }, Object.create(null));

            var constante = aMaestra.find(function (element) {
              return element.codigo == "CONST104";
            });
            that.sDiffDays = constante.contenido ? Number(constante.contenido) : 30;
            that.getView().getModel("MaestraModel").setData(aConstant);
          }
        },
        /**-----------------------------------------------*/
        /*              E V E N T S
              /**-----------------------------------------------*/

        /**
         * EVENTS: Body.fragment
         */
        onShowHistory: function (oEvent) {
          var that = this;
          var oView = that.getView();

          var oTable = this.byId("idPedidoList");
          var iIndex = oTable.getSelectedIndex();
          var sPath;

          if (iIndex < 0) {
            MessageToast.show("Selecione un item");
            var oOrdenSelectedItemsModel = oView.getModel(
              "OrdenSelectedItemsModel"
            );
            oOrdenSelectedItemsModel.setData([]);
            oOrdenSelectedItemsModel.refresh();
          } else {
            sPath = oTable.getContextByIndex(iIndex).getPath();
            var oData = oTable.getModel().getContext(sPath).getObject();
            var aFilter = [];
            aFilter.push(new Filter("oPedido_pedidoId", EQ, oData.pedidoId));

            var oUrlParameters = {
              $expand: "oEstadoAct,oEstadoAnt",
            };
            that
              ._getODataDinamic(null, "HISTORIAL", oUrlParameters, aFilter)
              .then((aPedidoHistory) => {
                that._openDialogDinamic("Historial");

                aPedidoHistory.forEach(function (oHistory) {
                  oHistory.fechaRegistro = DateUtils.parseDate(
                    oHistory.fechaRegistro
                  );
                });

                var oModel = new JSONModel(aPedidoHistory);

                this.getView().setModel(oModel, "History");
              })
              .catch(function (oError) {
                console.log("Error al obtener los registros");
                sap.ui.core.BusyIndicator.hide();
              })
              .finally(function () {
                sap.ui.core.BusyIndicator.hide();
              });
          }
        },

        onRowSelectPedido: function (oEvent) {
          var that = this;
          that.oPedidoSelect = null;
          var oView = that.getView();
          var oOrdenSelectedItemsModel = oView.getModel(
            "OrdenSelectedItemsModel"
          );
          var oTable = this.byId("idPedidoList");
          var iIndex = oTable.getSelectedIndex();
          var sPath;

          if (iIndex < 0) {
            MessageToast.show("Selecione un item");
            oOrdenSelectedItemsModel.setData([]);
            oOrdenSelectedItemsModel.refresh();
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

        onRowButtonsAction: async function (oEvent, sKeyPedido) {
          var sTypePedidoAction = oEvent.getSource().data("pedidoAction");
          var oPedidoAction = {
            oPedido_pedidoId: sKeyPedido,
            sTypePedidoAction: sTypePedidoAction,
            oEntityData: null,
          };

          that.sPedidoIdUser = sKeyPedido;
          that
            .getView()
            .getModel("PedidoModel")
            .setProperty("/oPedidoAction", oPedidoAction);

          /**
           * Asignar Usuarios
           */
          if (sTypePedidoAction == "ShowUserAssignments") {
            if (!that._validateAccionAsigned("USUARIO")) return;
            this._pedidoShowUserAssignments(oEvent, sKeyPedido);
          }

          /**
           * Bloquear/Desbloquear
           */
          if (sTypePedidoAction == "LockUnlock")
            if (!that._validateAccionAsigned("BLOQUEO")) return;

          /**
           * Anular
           */
          if (sTypePedidoAction == "Annulate")
            if (!that._validateAccionAsigned("ANULAR")) return;

          if (["LockUnlock", "Annulate"].includes(sTypePedidoAction)) {
            await this._pedidoChangeStatus(
              oEvent,
              sKeyPedido,
              sTypePedidoAction
            );
          }
        },

        onCreate: function (oEvent) {
          if (!that._validateAccionAsigned("CREAR")) return;
          this.setModel(models.createPedidoModel(), "PedidoModel");
          this._openDialogDinamic("TipoPedido");
        },

        /**
         * EVENTS: UsuarioAsignado.fragment
         */
        onAddUserRol: function (oEvent) {
          var that = this;
          var newUserAssig = [];

          var aPedidoUsuarioList = that
            .getView()
            .getModel("PedidoUsuarioListModel")
            .getData();

          if (!aPedidoUsuarioList.length) aPedidoUsuarioList = [];

          var oObject = oEvent
            .getSource()
            .getBindingContext("UserRoleListModel")
            .getObject();

          var bExist = false;
          if (aPedidoUsuarioList) {
            for (var i = 0; i < aPedidoUsuarioList.length; i++) {
              if (
                oObject.oUsuario_usuarioId ==
                aPedidoUsuarioList[i].oUsuario_usuarioId
              ) {
                bExist = true;
                break;
              }
            }
          }
          if (!bExist) {
            newUserAssig.push(oObject);
          } else {
            MessageToast.show(
              "El Usuario ya esta asignado a este pedido: " +
                oObject.oUsuario.usuario
            );
          }

          if (newUserAssig.length !== 0) {
            that.oEvent = Object.assign({}, oEvent);
            var oPedidoAction = this.getView()
              .getModel("PedidoModel")
              .getProperty("/oPedidoAction");

            /* BUILD ORDEN DETALLE (INSUMO) */
            for (var key in newUserAssig) {
              var oItem = newUserAssig[key];

              var sEntity = "/PEDIDO_USUARIO";

              var oPedidoUsuario = {
                oPedido_pedidoId: oPedidoAction.oPedido_pedidoId,
                oUsuario_usuarioId: oItem.oUsuario_usuarioId,

                /*--- auditoriaBase ---*/
                terminal: "",
                fechaRegistro: new Date(),
                usuarioRegistro: that.sUser,
                activo: true,

                /* --------DML para registros masivos-------- */
                dml: "C",
                entity: sEntity,
                keyEntity: "",
              };

              oDataService
                .oDataDml(that.oModel, oPedidoUsuario)
                .then((oResult) => {
                  sap.ui.core.BusyIndicator.hide();
                  that._refeshPedidoUserAssignments(that.sPedidoIdUser);

                  that.sendPedidoToErp(that, that.sPedidoIdUser);
                })
                .catch(function (oError) {
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.error(that._getI18nText("msgActualizaErr"));
                })
                .finally(function () {
                  sap.ui.core.BusyIndicator.hide();
                });
            }
          }
        },

        onAnulateUser: async function (oEvent, pedido, rol, estado) {
          var that = this;
          var bNuevoEstado = estado ? false : true;
          var aUsers = that.getModel("PedidoUsuarioListModel").getData();
          var aUserActivo = aUsers.filter((o) => {
            return o.activo == true;
          });

          var aFilter = [],
            oUrlParameters = {
              $expand: "oEstado",
            };
          aFilter.push(new Filter("pedidoId", EQ, pedido));

          sap.ui.core.BusyIndicator.show(0);
          var aRespPedido = await that
            ._getODataDinamic(that.oModel, "PEDIDO", oUrlParameters, aFilter)
            .catch((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              var oResp = JSON.parse(oResult.responseText);
              MessageBox.error(oResp.error.message.value);
            });

          var oPedido = null;
          if (aRespPedido && aRespPedido.length) {
            oPedido = aRespPedido[0];
          }

          if (oPedido) {
            if (![CONSTANT.PPEND].includes(oPedido.oEstado.codigo)) {
              if (aUserActivo.length <= 1 && bNuevoEstado == false) {
                return MessageBox.warning(
                  "No se puede continuar con esta acción, asegúrese de que el pedido tenga al menos un usuario asignado."
                );
              }
            }

            var oAuditStruct = that._buildAudit("U");
            var oEntity = {
              activo: bNuevoEstado,
            };
            var oUser = { ...oEntity, ...oAuditStruct };
            var sKeyEntity = that.oModel.createKey("/PEDIDO_USUARIO", {
              oPedido_pedidoId: pedido,
              oUsuario_usuarioId: rol,
            });

            oUser.dml = "U";
            oUser.entity = "/PEDIDO_USUARIO";
            oUser.keyEntity = sKeyEntity;

            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataDml(that.oModel, oUser)
              .then((oResult) => {
                sap.ui.core.BusyIndicator.hide();
                that._refeshPedidoUserAssignments(that.sPedidoIdUser);

                that.sendPedidoToErp(that, that.sPedidoIdUser);

                MessageBox.success(that._getI18nText("msgActualiza"));
                that.oUpdatePedido = {};
              })
              .catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(that._getI18nText("msgActualizaErr"));
              })
              .finally(function () {
                sap.ui.core.BusyIndicator.hide();
              });
          }
        },

        onSearchUser: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilter = this._addConstantFilter(queryText);
          var allFilter = new Filter({
            filters: aFilter,
            and: false,
          });
          var oTable = that.getView().byId("idCPPedidoUsuarioList");
          if (!oTable) {
            oTable = Fragment.byId(
              "frgUsuarioAsignado",
              "idCPPedidoUsuarioList"
            );
          }
          oTable.getBinding().filter(allFilter);
        },

        onSearchUserRol: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilter = this._addConstantFilter(queryText);
          var allFilter = new Filter({
            filters: aFilter,
            and: false,
          });
          var oTable = that.getView().byId("idCPUsuarioAsignadoList");
          if (!oTable) {
            oTable = Fragment.byId(
              "frgUsuarioAsignado",
              "idCPUsuarioAsignadoList"
            );
          }
          oTable.getBinding().filter(allFilter);
        },

        /**
         * EVENTS: PedidoAtencionCP.fragment
         */
        onConfirmDialogPA: function (oEvent) {
          if (that.oRegistro) {
            if (that.oRegistro.sModel) {
              var oTempOrdenListModel = that
                .getView()
                .getModel(that.oRegistro.sModel);

              var aTempOrdenList = oTempOrdenListModel.getData();

              if (that.oRegistro.sModel === "ReservaListModel") {
                var oReservaModel = that.getView().getModel("ReservaModel");
                var aReserva = oReservaModel.getData();
                aReserva.push(that.oRegistro);
                oReservaModel.refresh(true);

                oTempOrdenListModel.setData(
                  aTempOrdenList.concat(that.oRegistro.aReserva)
                );
              } else if (that.oRegistro.sModel === "McInsumoModel") {
                that._onAddItemsIndivToList();
              } else {
                aTempOrdenList.push(that.oRegistro);
              }

              oTempOrdenListModel.refresh(true);
              delete that.oRegistro.sModel;
              that.oRegistro = null;
            }
          }

          var oSource = oEvent.getSource();
          that._onCloseDialog(oSource);
        },

        /**
         * EVENTS: CrearPedidoNormal.fragment
         */
        onPedidoChangeCentro: async function (oEvent) {
          var oPedidoModel = that.getModel("PedidoModel");
          var oParameters = oPedidoModel.getData();
          var sKeyCentro = oEvent.getSource().getSelectedKey();

          var oCombo = Fragment.byId(
            "frg" + oParameters.mainDialog,
            "idPedidoSala"
          );

          var oAction = await that._clearAllModelPI();
          if (!oAction) {
            oParameters.tipoPedidoParams.keyCentro = that.oParamCP.keyCentro;
            oPedidoModel.refresh(true);
            return;
          }

          try {
            //oParameters.tipoPedidoParams.keySala = "";
            oParameters.tipoPedidoParams.valueSala = "";
            oPedidoModel.refresh(true);
          } catch (oError) {}
          that.oParamCP = Object.assign({}, oParameters.tipoPedidoParams);
          oCombo
            .getBinding("items")
            .filter([new Filter("oPlanta/codigo", EQ, sKeyCentro)]);
          oCombo.getBinding("items").refresh(true);
          oCombo.setEditable(true);
        },

        onDeleteOrderSelected: function (oEvent) {
          var that = this;
          var aOrdenItemsList = that
            .getView()
            .getModel("OrdenListModel")
            .getData();
          var aOrdenInsumoItemsList = that
            .getView()
            .getModel("OrdenInsumoListModel")
            .getData();
          var oTable = that.getView().byId("idOrdenItemsList");
          if (!oTable) {
            oTable = Fragment.byId("frgCrearPedidoNormal", "idOrdenItemsList");
          }
          var selectedIndices = oTable.getSelectedIndices();

          if (selectedIndices.length > 0) {
            var aOrden = [],
              aInsumo = [];
            var aInsumoDelete = [];

            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              var oObjects = oTable
                .getModel("OrdenListModel")
                .getContext(sPath)
                .getObject();
              aInsumoDelete.push(oObjects.Aufnr);
            });

            for (var key in aOrdenItemsList) {
              var bDelete = false;
              var oItem = aOrdenItemsList[key];

              for (var key2 in aInsumoDelete) {
                var sKey = aInsumoDelete[key2];
                if (oItem.Aufnr == sKey) {
                  bDelete = true;
                  break;
                }
              }
              if (!bDelete) aOrden.push(oItem);
            }

            for (var key in aOrdenInsumoItemsList) {
              var bDelete = false;
              var oItem = aOrdenInsumoItemsList[key];

              for (var key2 in aInsumoDelete) {
                var sKey = aInsumoDelete[key2];
                if (oItem.Aufnr == sKey) {
                  bDelete = true;
                  break;
                }
              }

              if (!bDelete) aInsumo.push(oItem);
            }

            that.getModel("OrdenListModel").setData(aOrden);
            that.getModel("OrdenInsumoListModel").setData(aInsumo);
            that.getView().getModel("OrdenListModel").refresh();
            that.getView().getModel("OrdenInsumoListModel").refresh();
          } else {
            return;
          }
        },

        onSelectOrdenDisplayInsumo: function (oEvent) {
          //Tipo de Pedido: Pedido Cent. Pesadas
          if (
            oEvent.getSource()._getContexts()[
              oEvent.getParameters().rowIndex
            ] !== undefined
          ) {
            var oItemSelect = oEvent
              .getSource()
              ._getContexts()
              [oEvent.getParameters().rowIndex].getObject();
            var oFragment = Fragment.byId(
              "frgCrearPedidoNormal",
              "idTableInsumosCP"
            ).getBinding();

            oFragment.filter([
              new Filter("Aufnr", EQ, oItemSelect.Aufnr),
              new Filter("Fracc", EQ, oItemSelect.Fracc),
            ]);
            oFragment.refresh(true);
          }
        },

        onCreatePA: function (oEvent) {
          //Tipo de Pedido: Pedido Cent. Pesadas Normal/Urgente
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var oParameter = this.getView()
            .getModel("PedidoModel")
            .getProperty("/tipoPedidoParams");
          that.oEvent = Object.assign({}, oEvent);

          var aEntityData = null;
          /*if (oParameter.keyCentro && oParameter.keySala) {*/
          aEntityData = that._buildEnitiesPedido("");
          /*} else {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.warning("(*) Los campos Centro/Sala son requeridos.");
              return;
            }*/
          if (aEntityData.length <= 0) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.warning(
              "La orden debe de contener almenos 1 Insumo y las cantidades sugeridas deben de ser mayor a cero."
            );
            return;
          }

          if (!aEntityData) return;

          var aPromise = [];
          for (var oEntity of aEntityData) {
            var sEntity = oEntity.sEntity;
            delete oEntity.sEntity;
            aPromise.push(
              oDataService.oDataCreate(that.oModel, sEntity, oEntity)
            );
          }

          Promise.all(aPromise)
            .then((oResp) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.success(that._getI18nText("msgActualiza"));
              MessageToast.show(that._getI18nText("msgOnPedidoCreate"));
              var oPedido;
              for (let a of oResp) {
                var oData = a.data;
                if (oData.hasOwnProperty("pedidoId")) {
                  oPedido = oData;
                  break;
                }
              }
              that.sendPedidoToErp(that, oPedido.pedidoId);
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al crear el Pedido");
            })
            .finally((oFinal) => {
              this.byId("idPedidoList").getBinding().refresh(true);
              sap.ui.core.BusyIndicator.hide();

              Fragment.byId("frgCrearPedidoNormal", "idDialogPedido").close();
            });
        },

        /**
         * EVENTS: CrearPedidoIndividual.fragment
         */
        onMatchCodeOrden: async function () {
          this.getView().getModel("TempOrdenListModel").setData([]);
          var oSearch = await this.onSearchOrdenErp(null);
          if (!oSearch) return;
          var sDialog = "Orden";
          this._openDialogDinamic(sDialog);
        },

        onMatchCodeOrdenPI: function (oEvent) {
          that.setModel(new JSONModel([]), "McOrdenModel");
          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;

          if (!oParameter.keyCentro)
            return MessageBox.information("Selecione un Centro.");

          var sDialog = "MatchCodeAMOrden";
          this._openDialogDinamic(sDialog);
        },

        onMatchCodeInsumoPI: function (oEvent) {
          var aMcInsumo = that.getModel("McInsumoModel").getData();
          if (aMcInsumo.length) {
            var sDialog = "MatchCodeAMInsumo";
            this._openDialogDinamic(sDialog);
          } else {
            that.onOrdenSearchEnter();
          }
        },

        onMatchCodeLotePI: function (oEvent) {
          var aMcInsumo = that.getModel("McLoteModel").getData();
          if (aMcInsumo.length) {
            var sDialog = "MatchCodeAMLote";
            this._openDialogDinamic(sDialog);
          } else {
            MessageBox.information("Seleccione un Insumo");
          }
        },

        onSearchMatchCodeOrden: async function (oEvent) {
          that.setModel(new JSONModel([]), "McOrdenModel");
          var dDate = Fragment.byId(
            "frgMatchCodeAMOrden",
            "idDateFechaOrdenMC"
          );

          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;
          if (!dDate.getFrom())
            return MessageBox.information("Seleccione un rango de fecha.");

          var oDateFrom = dDate.getFrom();
          var oDateTo = dDate.getTo();
          var aFilters = [];
          aFilters.push(new Filter("Aufnr", EQ, ""));
          aFilters.push(new Filter("Werks", EQ, ""));
          aFilters.push(new Filter("CentroReserva", EQ, oParameter.keyCentro));
          aFilters = that._getConstantFilterOrden(aFilters);
          aFilters.push(
            new Filter(
              "Gstrp",
              BT,
              that._subtractTimeFromDate(oDateFrom, 5),
              that._subtractTimeFromDate(oDateTo, 5.0003)
            )
          ); //Gstrp : Fecha Liberacion

          that
            ._getODataDinamic(that.oModelErp, "OrdenSet", {}, aFilters)
            .then((oData) => {
              var aOrdenFilter = that._FilterStatusLib(oData);
              if (aOrdenFilter.length) {
                that.setModel(new JSONModel(aOrdenFilter), "McOrdenModel");
              } else {
                MessageBox.warning(
                  "No se encontraron Ordenes liberadas en el servidor."
                );
              }
            });
        },

        onFilterMatchCodeOrden: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilters = [];
          aFilters.push(
            new Filter(
              [
                new Filter("Aufnr", CONTAINS, queryText),
                new Filter("Plnbez", CONTAINS, queryText),
                new Filter("Maktx", CONTAINS, queryText),
                new Filter("Lote", CONTAINS, queryText),
              ],
              false
            )
          );

          var oTable = that.getView().byId("idTableMatchCodeAMOrden");
          if (!oTable) {
            var oTable = Fragment.byId(
              "frgMatchCodeAMOrden",
              "idTableMatchCodeAMOrden"
            );
          }
          oTable.getBinding().filter(aFilters);
        },

        onOkMatchCodeOrden: function (oEvent) {
          var oSource = oEvent.getSource();
          var oTable = Fragment.byId(
            "frgMatchCodeAMOrden",
            "idTableMatchCodeAMOrden"
          );

          var selectedIndices = oTable.getSelectedIndices();
          var oObject = null;
          if (selectedIndices.length > 0) {
            var oPedidoModel = that.getModel("PedidoModel");
            var oData = oPedidoModel.getData();
            var oParameter = oData.tipoPedidoParams;

            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              oObject = oTable
                .getModel("McOrdenModel")
                .getContext(sPath)
                .getObject();
            });

            if (oObject.Aufnr) {
              oParameter.NumOrden = oObject.Aufnr;
              that._onCloseDialog(oSource);
              that.onOrdenSearchEnter();
            }
          }
        },

        onFilterMatchCodeInsumo: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilters = [];
          aFilters.push(
            new Filter(
              [
                new Filter("Matnr", CONTAINS, queryText),
                new Filter("Maktx", CONTAINS, queryText),
              ],
              false
            )
          );

          var oTable = that.getView().byId("idTableMatchCodeAMInsumo");
          if (!oTable) {
            var oTable = Fragment.byId(
              "frgMatchCodeAMInsumo",
              "idTableMatchCodeAMInsumo"
            );
          }
          oTable.getBinding().filter(aFilters);
        },

        onOkMatchCodeInsumo: async function (oEvent) {
          var oSource = oEvent.getSource();
          var oTable = Fragment.byId(
            "frgMatchCodeAMInsumo",
            "idTableMatchCodeAMInsumo"
          );

          var selectedIndices = oTable.getSelectedIndices();
          var oObject = null;
          if (selectedIndices.length > 0) {
            var oPedidoModel = that.getModel("PedidoModel");
            var oData = oPedidoModel.getData();
            var oParameter = oData.tipoPedidoParams;

            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              oObject = oTable
                .getModel("McInsumoModel")
                .getContext(sPath)
                .getObject();
            });

            oParameter.editInsumo = false;
            oParameter.oInsumo = oObject;
            oParameter.oLote = null;
            oPedidoModel.refresh(true);
            this._onCloseDialog(oSource);
          } else {
            oParameter.editInsumo = true;
          }
        },

        onFilterMatchCodeLote: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilters = [];
          aFilters.push(
            new Filter([new Filter("Charg", CONTAINS, queryText)], false)
          );

          var oTable = that.getView().byId("idTableMatchCodeAMLote");
          if (!oTable) {
            var oTable = Fragment.byId(
              "frgMatchCodeAMLote",
              "idTableMatchCodeAMLote"
            );
          }
          oTable.getBinding().filter(aFilters);
        },
        onOkMatchCodeLote: async function (oEvent) {
          var oSource = oEvent.getSource();
          var oTable = Fragment.byId(
            "frgMatchCodeAMLote",
            "idTableMatchCodeAMLote"
          );
          var selectedIndices = oTable.getSelectedIndices();
          var oObject = null;
          if (selectedIndices.length > 0) {
            var oPedidoModel = that.getModel("PedidoModel");
            var oData = oPedidoModel.getData();
            var oParameter = oData.tipoPedidoParams;

            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              oObject = oTable
                .getModel("McLoteModel")
                .getContext(sPath)
                .getObject();
            });

            oParameter.oLote = oObject;
            oPedidoModel.refresh(true);

            this._onCloseDialog(oSource);
          }
        },

        onAddItemsIndivToList: async function (oEvent) {
          var that = this;
          that.oEvent = Object.assign({}, oEvent);
          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;
          var oInsumo = oParameter.oInsumo;

          if (oInsumo) {
            sap.ui.core.BusyIndicator.show(0);

            /**
             * Evaluar que el insumo no exista
             */

            var oOrdenInsumoListModel = that.getModel("OrdenInsumoListModel");
            var aReserva = oOrdenInsumoListModel.getData();
            var oReservaEval = aReserva.find((o) => {
              return (
                o.Aufnr == oInsumo.Aufnr &&
                o.Matnr == oInsumo.Matnr &&
                o.Charg == oInsumo.Charg &&
                o.Posnr == oInsumo.Posnr
              );
            });
            if (oReservaEval) {
              sap.ui.core.BusyIndicator.hide();
              return MessageBox.warning(
                "El registro ya fue seleccionada: " +
                  [
                    "Orden: " + oReservaEval.Aufnr,
                    "Insumo: " + oReservaEval.Matnr,
                  ].join(", ")
              );
            }

            /**
             * Verificar si la orden ya existe en un pedido asignado
             */
            var aFilter = [];
            aFilter.push(new Filter("ordenNumero", EQ, oInsumo.Aufnr));
            aFilter.push(new Filter("codigoInsumo", EQ, oInsumo.Matnr));
            //aFilter.push(new Filter("lote", EQ, oInsumo.Charg));

            var aPedido = await that._getODataDinamicSetModel(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              {},
              aFilter,
              "ViewPedidoDetalleModel"
            );

            if (aPedido.length && aPedido.length > 0) {
              var aOrden = that._getUniqueArray(aPedido, [
                "pedidoNumero",
                "ordenNumero",
                "numFraccion",
              ]);

              that.setModel(new JSONModel(aOrden), "ViewOrdenListModel");
              that._openDialogDinamic("PedidoView");

              that.oRegistro = oInsumo;
              that.oRegistro.sModel = "McInsumoModel";
            } else {
              that._onAddItemsIndivToList();
            }
          } else {
            MessageToast.show(that._getI18nText("msgOnItemSelected"));
          }
        },

        onClearPI: function (oEvent) {
          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;
          oParameter.NumOrden = "";
          oParameter.editOrden = true;
          oParameter.oInsumo = null;
          oParameter.oLote = null;
          oParameter.CantAdicional = "0.000";

          oPedidoModel.refresh(true);

          that.setModel(new JSONModel([]), "McInsumoModel");
          that.setModel(new JSONModel([]), "McLoteModel");
        },

        onRemoveItemsIndivToList: function (oEvent) {
          var that = this;
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("OrdenInsumoListModel");

          var oOrdenInsumoListModel = that
            .getView()
            .getModel("OrdenInsumoListModel");
          var aOrdenItemsList = oOrdenInsumoListModel.getData();

          var iIndex = parseInt(oBindingContext.sPath.split("/").pop());
          aOrdenItemsList.splice(iIndex, 1);

          oOrdenInsumoListModel.refresh();
        },

        onOrdenSearchEnter: async function (oEvent) {
          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;

          if (!oParameter.keyCentro)
            return MessageBox.information("Selecione un Centro.");
          if (oParameter.NumOrden) {
            sap.ui.core.BusyIndicator.show(0);
            var aOrdenBuild = [];
            var aReservaBuild = [];
            var aFilter = [];

            try {
              aFilter.push(new Filter("Aufnr", EQ, oParameter.NumOrden));
              aFilter.push(new Filter("Werks", EQ, ""));
              aFilter.push(
                new Filter("CentroReserva", EQ, oParameter.keyCentro)
              );
              aFilter = this._getConstantFilterOrden(aFilter);

              var aOrden = await that._getODataDinamic(
                that.oModelErp,
                "OrdenSet",
                {},
                aFilter
              );
              if (aOrden && aOrden.length) {
                aOrden = that._FilterStatusLib(aOrden);
                oParameter.oInsumo = null;
                oParameter.oLote = null;
                oParameter.CantAdicional = "0.000";

                aFilter = [];
                var aNumOrden = that._uniqByKeepFirst(aOrden, (it) => it.Aufnr);
                for (var oItem of aNumOrden) {
                  aFilter.push(new Filter("Aufnr", EQ, oItem.Aufnr));
                }

                var aFraccion = await that._getODataDinamic(
                  that.oModelErp,
                  "FraccionamientoSet",
                  {},
                  aFilter
                );

                var aNumReserva = that._uniqByKeepFirst(
                  aOrden,
                  (it) => it.Rsnum
                );
                aFilter = [];
                aFilter = that._getConstantFilterInsumo(aFilter);

                for (var oItem of aNumReserva) {
                  aFilter.push(new Filter("Rsnum", EQ, oItem.Rsnum));
                }

                aFilter.push(new Filter("Bwart", EQ, "261"));
                aFilter.push(new Filter("Werks", EQ, oParameter.keyCentro));
                var aReserva = await that._getODataDinamic(
                  that.oModelErp,
                  "ReservaSet",
                  {},
                  aFilter
                );

                aReserva = that._reservaFilter(aReserva);
                var aReservaLote = [];
                aReserva.forEach((o) => {
                  if (o.Charg) {
                    //Liberados (LIB.)
                    aReservaLote.push(o);
                  }
                });
                aReserva = aReservaLote;

                if (
                  aFraccion &&
                  aFraccion.length &&
                  aReserva &&
                  aReserva.length
                ) {
                  oParameter.editOrden = false;
                  var aOrdenNoValid = [];

                  for (var oItem of aOrden) {
                    var aFraccionFilter = aFraccion.filter((o) => {
                      return (
                        o.Aufnr === oItem.Aufnr &&
                        o.Rsnum === oItem.Rsnum &&
                        o.Charg2 != ""
                      );
                    });

                    var aReservaFilter = aReserva.filter((o) => {
                      return o.Aufnr === oItem.Aufnr && o.Rsnum === oItem.Rsnum;
                    });

                    for (var oFrac of aFraccionFilter) {
                      var oOrden = { ...oFrac, ...oItem };
                      var oReservaFilter = aReservaFilter.find((o) => {
                        return (
                          o.Aufnr === oOrden.Aufnr &&
                          o.Rsnum === oOrden.Rsnum &&
                          +o.Posnr === +oFrac.Posnr &&
                          o.Matnr === oFrac.Matnr &&
                          o.Charg === oFrac.Charg
                        );
                      });
                      if (oReservaFilter) {
                        var oInsumo = { ...oReservaFilter, ...oFrac };
                        aOrdenBuild.push(oOrden);
                        oInsumo.CantAdicional = oInsumo.CantSfraccUmb;
                        oInsumo.CantSugeridaColor = "CN";
                        aReservaBuild.push(oInsumo);
                      }
                    }

                    if (!aFraccionFilter) aOrdenNoValid.push(oItem.Aufnr);
                  }
                }
              }

              if (aOrdenBuild.length) {
                /**
                 * Sumatoria de Cantidad Sugerida
                 */
                for (var o of aReservaBuild) {
                  var CantSfraccUmbTotal = 0;
                  for (var b of aReservaBuild.filter((c) => {
                    return (
                      c.Aufnr == o.Aufnr &&
                      c.Rsnum == o.Rsnum &&
                      +c.Posnr == +o.Posnr &&
                      //c.Fracc == o.Fracc &&
                      //c.Subfracc == o.Subfracc &&
                      c.Matnr == o.Matnr &&
                      c.Charg2 == o.Charg2
                    );
                  })) {
                    CantSfraccUmbTotal = CantSfraccUmbTotal + +b.CantSfraccUmb;
                  }
                  o.CantSfraccUmbTotal = CantSfraccUmbTotal;
                }

                var aOrdenItemsList = that._getUniqueArray(aOrdenBuild, [
                  "Aufnr",
                  "Fracc",
                ]);

                that.getModel("TempOrdenListModel").setData(aOrdenItemsList);
                that.setModel(new JSONModel(aReservaBuild), "McInsumoModel");
                if (aReservaBuild && aReservaBuild.length > 0) {
                  that._openDialogDinamic("MatchCodeAMInsumo");
                } else {
                  MessageBox.error(
                    "No se encontraron insumos para la orden ingresada"
                  );
                  oParameter.editOrden = true;
                  oParameter.editInsumo = true;
                }

                sap.ui.core.BusyIndicator.hide();

                if (aOrdenNoValid.length) {
                  MessageBox.warning(
                    "No se encontraron registros para las ordenes selecionadas: " +
                      aOrdenNoValid.join(", ")
                  );
                }
              } else {
                MessageBox.error(
                  "No se encontraron registros para las ordenes selecionadas: " +
                    aOrdenNoValid.join(", ")
                );
              }
            } catch (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              var oResp = JSON.parse(oError.responseText);
              MessageBox.error(oResp.error.message.value);
            }

            oPedidoModel.refresh(true);
          } else {
            MessageBox.information("Ingrese una Orden");
          }
        },

        onCreatePAI: function (oEvent) {
          //Tipo de Pedido: Pedido CP Individual/Adicional
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var oParameter = this.getView()
            .getModel("PedidoModel")
            .getProperty("/tipoPedidoParams");
          that.oEvent = Object.assign({}, oEvent);

          var aEntityData = null;
          if (
            oParameter.keyCentro &&
            //oParameter.keySala &&
            oParameter.keyMotivo
          ) {
            aEntityData = that._buildEnitiesPedido("PAI");
          } else {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.warning(
              "(*) Los campos Centro/Sala/Motivo son requeridos."
            );
            return;
          }
          if (aEntityData.length <= 0) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.warning(
              "La orden debe de contener almenos 1 Insumo y las cantidades sugeridas deben de ser mayor a cero."
            );
            return;
          }

          if (!aEntityData) return;

          var aPromise = [];
          for (var oEntity of aEntityData) {
            var sEntity = oEntity.sEntity;
            delete oEntity.sEntity;
            aPromise.push(
              oDataService.oDataCreate(that.oModel, sEntity, oEntity)
            );
          }

          Promise.all(aPromise)
            .then((oResp) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.success(that._getI18nText("msgActualiza"));
              MessageToast.show(that._getI18nText("msgOnPedidoCreate"));
              var oPedido;
              for (let a of oResp) {
                var oData = a.data;
                if (oData.hasOwnProperty("pedidoId")) {
                  oPedido = oData;
                  break;
                }
              }
              that.sendPedidoToErp(that, oPedido.pedidoId);
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al crear el Pedido");
            })
            .finally((oFinal) => {
              this.byId("idPedidoList").getBinding().refresh(true);
              sap.ui.core.BusyIndicator.hide();
              Fragment.byId(
                "frgCrearPedidoIndividual",
                "idDialogPedidoIndividual"
              ).close();
            });
        },

        /**
         * EVENTS: CrearPedidoReservaIDE.fragment
         */
        onMatchCodeReservaGroup: function (oEvent) {
          var oParameters = this.getView()
              .getModel("PedidoModel")
              .getProperty("/tipoPedidoParams"),
            dDate = Fragment.byId(
              "frg" +
                this.getView().getModel("PedidoModel").getData().mainDialog,
              "idDateFechaPedido"
            );
          if (dDate === null || oParameters.keyCentro === "") {
            MessageToast.show(
              "(*) Los campos Centro/FechaInicio son requeridos."
            );
          } else {
            var sDialog = "ReservaGroup";
            that._getReserva(dDate, oParameters.keyCentro, sDialog);
          }
        },

        onSelectReservaDisplayInsumo: function (oEvent) {
          if (
            oEvent.getSource()._getContexts()[
              oEvent.getParameters().rowIndex
            ] !== undefined
          ) {
            var sRsnum = oEvent
              .getSource()
              ._getContexts()
              [oEvent.getParameters().rowIndex].getObject().Rsnum;

            var oFragment = Fragment.byId(
              "frgCrearPedidoReservaIDE",
              "idTableReservasSeleccionadas"
            ).getBinding();

            oFragment.filter([new Filter("Rsnum", EQ, sRsnum)]);
            oFragment.refresh(true);
          }
        },

        onDeleteReservas: function (oEvent) {
          var that = this;
          var aOrdenItemsList = that
            .getView()
            .getModel("ReservaModel")
            .getData();

          var aOrdenInsumoItemsList = that
            .getView()
            .getModel("ReservaListModel")
            .getData();

          var oTable = that.getView().byId("idTableReservasDisponibles");
          if (!oTable) {
            oTable = Fragment.byId(
              "frgCrearPedidoReservaIDE",
              "idTableReservasDisponibles"
            );
          }
          var selectedIndices = oTable.getSelectedIndices();

          if (selectedIndices.length > 0) {
            var aInsumo = [];
            var aInsumoDelete = [];

            selectedIndices.forEach(function (index) {
              var sPath = oTable.getContextByIndex(index).getPath();
              var oObjects = oTable
                .getModel("ReservaModel")
                .getContext(sPath)
                .getObject();
              aInsumoDelete.push(oObjects.Rsnum);
              aOrdenItemsList.splice(index, 1); //Eliminar indice
            });

            for (var key in aOrdenInsumoItemsList) {
              var bDelete = false;
              var oItem = aOrdenInsumoItemsList[key];

              for (var key2 in aInsumoDelete) {
                var sKey = aInsumoDelete[key2];
                if (oItem.Rsnum == sKey) {
                  bDelete = true;
                  break;
                }
              }

              if (!bDelete) aInsumo.push(oItem);
            }

            that.getView().getModel("ReservaListModel").setData(aInsumo);
            that.getView().getModel("ReservaModel").refresh();
            that.getView().getModel("ReservaListModel").refresh();
          }
        },

        onDeleteItemsReservas: function (oEvent) {
          var oBindingContext = oEvent
            .getSource()
            .getBindingContext("ReservaListModel");

          var oReservaModel = that.getView().getModel("ReservaModel");
          var ReservaListModel = that.getView().getModel("ReservaListModel");

          var aReservaList = ReservaListModel.getData();
          var iIndex = parseInt(oBindingContext.sPath.split("/").pop());
          aReservaList.splice(iIndex, 1);
          ReservaListModel.refresh(true);

          var aReservasGroup = aReservaList.reduce(function (r, a) {
            var sKey = a.Rsnum;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));

          var aGroup = [];
          for (var key in aReservasGroup) {
            var oItem = aReservasGroup[key];
            if (oItem.length) aGroup.push(oItem[0]);
          }

          oReservaModel.setData(aGroup);
          oReservaModel.refresh(true);
        },

        onCreatePAIDE: function (oEvent) {
          //Tipo de Pedido: Pedido Cent. Pesadas Reserva IDE/Muestra
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var oParameter = this.getView()
            .getModel("PedidoModel")
            .getProperty("/tipoPedidoParams");
          that.oEvent = Object.assign({}, oEvent);

          var aEntityData = null;
          if (
            oParameter.keyCentro
            //&& oParameter.keySala
          ) {
            aEntityData = that._buildEnitiesPedidoIDE();
          } else {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.warning("(*) Los campos Centro/Sala son requeridos.");
            return;
          }
          if (aEntityData.length <= 0) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.warning(
              "La orden debe de contener almenos 1 Insumo y las cantidades sugeridas deben de ser mayor a cero."
            );
            return;
          }

          if (!aEntityData) return;

          var aPromise = [];
          for (var oEntity of aEntityData) {
            var sEntity = oEntity.sEntity;
            delete oEntity.sEntity;
            aPromise.push(
              oDataService.oDataCreate(that.oModel, sEntity, oEntity)
            );
          }

          Promise.all(aPromise)
            .then((oResp) => {
              MessageBox.success(that._getI18nText("msgActualiza"));
              MessageToast.show(that._getI18nText("msgOnPedidoCreate"));

              var oPedido;
              for (let a of oResp) {
                var oData = a.data;
                if (oData.hasOwnProperty("pedidoId")) {
                  oPedido = oData;
                  break;
                }
              }
              that.sendPedidoToErp(that, oPedido.pedidoId);

              that.byId("idPedidoList").getBinding().refresh(true);
              Fragment.byId(
                "frg" +
                  that.getView().getModel("PedidoModel").getData().mainDialog,
                "idDialogPedido"
              ).close();
              sap.ui.core.BusyIndicator.hide();
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error("Error al crear el Pedido");
            })
            .finally((oFinal) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },
        /**
         * EVENTS: ReservaGroup.fragment
         */
        onSearchReservaGroup: function (oEvent) {
          var queryText = oEvent ? oEvent.getParameter("query") : null;
          var aFilters = [];
          aFilters.push(
            new Filter(
              [
                new Filter("Rsnum", CONTAINS, queryText),
                new Filter("Usnam", CONTAINS, queryText),
              ],
              false
            )
          );

          var oTable = that.getView().byId("idReservaGroupList");
          if (!oTable) {
            oTable = Fragment.byId("frgReservaGroup", "idReservaGroupList");
          }
          oTable.getBinding().filter(aFilters);
        },

        onAddReservaToList: function (oEvent) {
          var aReserva = [];
          var aReservaList = [];
          var oReservaModel = that.getView().getModel("ReservaModel");
          var ReservaListModel = that.getView().getModel("ReservaListModel");
          try {
            aReserva = oReservaModel.getData();
          } catch (oError) {
            that.setModel(new JSONModel(aReserva), "ReservaModel");
            oReservaModel = that.getView().getModel("ReservaModel");
          }
          try {
            aReservaList = ReservaListModel.getData();
          } catch (oError) {
            that.setModel(new JSONModel(aReservaList), "ReservaListModel");
            ReservaListModel = that.getView().getModel("ReservaListModel");
          }

          var oObject = oEvent
            .getSource()
            .getBindingContext("ReservaGroupModel")
            .getObject();

          var bExist = false;
          if (aReserva) {
            for (var i = 0; i < aReserva.length; i++) {
              if (oObject.Rsnum == aReserva[i].Rsnum) {
                bExist = true;
                break;
              }
            }
          }
          if (!bExist) {
            var aFilters = [];
            aFilters.push(new Filter("ordenNumero", EQ, oObject.Rsnum));

            that
              ._getODataDinamicSetModel(
                null,
                "VIEW_SEGUIMIENTO_DETALLE",
                {},
                aFilters,
                "ViewPedidoDetalleModel"
              )
              .then((oData) => {
                if (oData.length && oData.length > 0) {
                  var aOrden = [];

                  aOrden = that._getUniqueArray(oData, [
                    "pedidoNumero",
                    "ordenNumero",
                    "numFraccion",
                  ]);

                  that.setModel(new JSONModel(aOrden), "ViewOrdenListModel");

                  that._openDialogDinamic("PedidoView");
                  that.oRegistro = oObject;
                  that.oRegistro.sModel = "ReservaListModel";
                } else {
                  aReserva.push(oObject);
                  ReservaListModel.setData(
                    aReservaList.concat(oObject.aReserva)
                  );
                  oReservaModel.refresh(true);
                }
              });
          } else {
            MessageToast.show("La Reserva ya esta asignada: " + oObject.Rsnum);
          }
        },

        /**
         * EVENTS: Orden.fragment
         */
        onAddOrdenToList: function (oEvent) {
          var that = this;

          that.oRegistro = null;
          var oRegistro = oEvent
            .getSource()
            .getBindingContext("OrdenesModel")
            .getObject();

          var aTempOrdenList = that
            .getView()
            .getModel("TempOrdenListModel")
            .getData();

          if (oRegistro) {
            if (!aTempOrdenList.length) aTempOrdenList = [];

            var bExist = false;
            if (aTempOrdenList) {
              for (var i = 0; i < aTempOrdenList.length; i++) {
                if (oRegistro.Aufnr == aTempOrdenList[i].Aufnr) {
                  bExist = true;
                  break;
                }
              }
            }
            if (!bExist) {
              var aFilters = [];
              aFilters.push(new Filter("ordenNumero", EQ, oRegistro.Aufnr));

              that
                ._getODataDinamicSetModel(
                  null,
                  "VIEW_SEGUIMIENTO_DETALLE",
                  {},
                  aFilters,
                  "ViewPedidoDetalleModel"
                )
                .then((oData) => {
                  if (oData.length && oData.length > 0) {
                    var aOrden = [];

                    aOrden = that._getUniqueArray(oData, [
                      "pedidoNumero",
                      "ordenNumero",
                      "numFraccion",
                    ]);

                    that.setModel(new JSONModel(aOrden), "ViewOrdenListModel");

                    that._openDialogDinamic("PedidoView");
                    that.oRegistro = oRegistro;
                    that.oRegistro.sModel = "TempOrdenListModel";
                  } else {
                    aTempOrdenList.push(oRegistro);
                  }

                  that
                    .getView()
                    .getModel("TempOrdenListModel")
                    .setData(aTempOrdenList);
                  that.getView().getModel("TempOrdenListModel").refresh();
                });
            } else {
              MessageToast.show("La ORDEN ya fue seleccionada");
            }
          } else {
            MessageToast.show("No se han seleccionado ningun registro");
          }
        },

        onDeleteOrdenToList: function (oEvent) {
          var that = this;
          var aTempOrdenList = that
            .getView()
            .getModel("TempOrdenListModel")
            .getData();
          var oTable = that.getView().byId("idOrdenTempSelectedList");
          if (!oTable) {
            oTable = Fragment.byId("frgOrden", "idOrdenTempSelectedList");
          }
          var selectedIndices = oTable.getSelectedIndices();
          if (selectedIndices.length > 0) {
            selectedIndices.forEach(function (index) {
              aTempOrdenList.splice(index, 1); //Eliminar indice
            });

            that.getView().getModel("TempOrdenListModel").refresh();
          } else {
            return;
          }
        },

        onSearchOrdenErp: async function (oEvent) {
          this.getModel("AgregarOrdenModel").setData({});
          var oParameter = this.getView()
              .getModel("PedidoModel")
              .getProperty("/tipoPedidoParams"),
            dDate = Fragment.byId("frgCrearPedidoNormal", "idDateFechaPedido");

          this.getView()
            .getModel("PedidoModel")
            .getData().tipoPedidoParams.valueDateInicio = dDate;

          this.getView().getModel("PedidoModel").refresh(true);
          if (oParameter.keyCentro && oParameter.valueFechaInicio) {
            var section = await this._getSeccion(oParameter.keyCentro);
            var orden = await this._getOrden(oParameter.keyCentro, dDate);
            return section && orden ? true : false;
          } else {
            MessageBox.warning(
              "(*) Los campos Centro/FechaInicio son requeridos."
            );
            return false;
          }
        },

        onAddOrdenConfirm: async function (oEvent) {
          //Modelos para seleccion de ordenes
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          that.oEvent = Object.assign({}, oEvent);
          var oParameter = this.getView()
            .getModel("PedidoModel")
            .getProperty("/tipoPedidoParams");

          var aOrdenBuild = [];
          var aReservaBuild = [];
          var aFilter = [];
          var aOrdenItemsList = that
            .getView()
            .getModel("OrdenListModel")
            .getData();
          var aTempOrdenItemsList = that
            .getView()
            .getModel("TempOrdenListModel")
            .getData();

          if (aTempOrdenItemsList.length) {
            try {
              aOrdenAllSelect;
              var aOrdenAllSelect = aOrdenItemsList.concat(aTempOrdenItemsList);

              var aNumOrden = that._uniqByKeepFirst(
                aOrdenAllSelect,
                (it) => it.Aufnr
              );

              try {
                for (var oItem of aNumOrden) {
                  aFilter.push(new Filter("Aufnr", EQ, oItem.Aufnr));
                }
                aFilter.push(new Filter("Werks", EQ, ""));
                aFilter.push(
                  new Filter("CentroReserva", EQ, oParameter.keyCentro)
                );
                var aOrden = await that._getODataDinamic(
                  that.oModelErp,
                  "OrdenSet",
                  {},
                  aFilter
                );
                if (aOrden && aOrden.length) {
                  aOrden = that._FilterStatusLib(aOrden);

                  aFilter = [];
                  var aNumOrden = that._uniqByKeepFirst(
                    aOrden,
                    (it) => it.Aufnr
                  );
                  for (var oItem of aNumOrden) {
                    aFilter.push(new Filter("Aufnr", EQ, oItem.Aufnr));
                  }

                  var aFraccion = await that._getODataDinamic(
                    that.oModelErp,
                    "FraccionamientoSet",
                    {},
                    aFilter
                  );

                  var aNumReserva = that._uniqByKeepFirst(
                    aOrden,
                    (it) => it.Rsnum
                  );
                  aFilter = [];
                  aFilter = that._getConstantFilterInsumo(aFilter);

                  for (var oItem of aNumReserva) {
                    aFilter.push(new Filter("Rsnum", EQ, oItem.Rsnum));
                  }

                  aFilter.push(new Filter("Bwart", EQ, "261"));
                  aFilter.push(new Filter("Werks", EQ, oParameter.keyCentro));
                  var aReserva = await that._getODataDinamic(
                    that.oModelErp,
                    "ReservaSet",
                    {},
                    aFilter
                  );

                  aReserva = that._reservaFilter(aReserva);
                  if (
                    aFraccion &&
                    aFraccion.length &&
                    aReserva &&
                    aReserva.length
                  ) {
                    var aOrdenNoValid = [];

                    for (var oItem of aOrden) {
                      var aFraccionFilter = aFraccion.filter((o) => {
                        return (
                          o.Aufnr === oItem.Aufnr &&
                          o.Rsnum === oItem.Rsnum &&
                          o.Charg2 != ""
                        );
                      });

                      var aReservaFilter = aReserva.filter((o) => {
                        return (
                          o.Aufnr === oItem.Aufnr && o.Rsnum === oItem.Rsnum
                        );
                      });

                      for (var oFrac of aFraccionFilter) {
                        var oOrden = { ...oFrac, ...oItem };
                        var oReservaFilter = aReservaFilter.find((o) => {
                          return (
                            o.Aufnr === oOrden.Aufnr &&
                            o.Rsnum === oOrden.Rsnum &&
                            +o.Posnr === +oFrac.Posnr &&
                            o.Matnr === oFrac.Matnr &&
                            o.Charg === oFrac.Charg
                          );
                        });
                        if (oReservaFilter) {
                          var oInsumo = { ...oReservaFilter, ...oFrac };
                          aOrdenBuild.push(oOrden);

                          oInsumo.CantSfraccUmbEdit = oInsumo.CantSfraccUmb;
                          oInsumo.CantSugeridaColor = "CN";
                          aReservaBuild.push(oInsumo);
                        }
                      }

                      if (!aFraccionFilter) aOrdenNoValid.push(oItem.Aufnr);
                    }
                  }
                }

                if (aOrdenBuild.length) {
                  /**
                   * Sumatoria de Cantidad Sugerida
                   */
                  for (var o of aReservaBuild) {
                    var CantSfraccUmbTotal = 0;
                    for (var b of aReservaBuild.filter((c) => {
                      return (
                        c.Aufnr == o.Aufnr &&
                        c.Rsnum == o.Rsnum &&
                        +c.Posnr == +o.Posnr &&
                        //c.Fracc == o.Fracc &&
                        //c.Subfracc == o.Subfracc &&
                        c.Matnr == o.Matnr &&
                        c.Charg2 == o.Charg2
                      );
                    })) {
                      CantSfraccUmbTotal =
                        CantSfraccUmbTotal + +b.CantSfraccUmb;
                    }
                    o.CantSfraccUmbTotal = CantSfraccUmbTotal;
                  }

                  var aOrdenItemsList = aOrdenItemsList.concat(aOrdenBuild);
                  aOrdenItemsList = that._getUniqueArray(aOrdenItemsList, [
                    "Aufnr",
                    "Fracc",
                  ]);

                  that.getModel("OrdenListModel").setData(aOrdenItemsList);

                  that.getModel("OrdenInsumoListModel").setData(aReservaBuild);
                  Fragment.byId("frgCrearPedidoNormal", "idTableInsumosCP")
                    .getBinding()
                    .filter([new Filter("NumReserva", EQ, "")]);
                  sap.ui.core.BusyIndicator.hide();
                  Fragment.byId("frgOrden", "dialogOrden").close();

                  if (aOrdenNoValid.length) {
                    MessageBox.warning(
                      "No se encontraron registros para las ordenes selecionadas: " +
                        aOrdenNoValid.join(", ")
                    );
                  }
                } else {
                  MessageBox.error(
                    "No se encontraron registros para las ordenes selecionadas: " +
                      aOrdenNoValid.join(", ")
                  );
                }
              } catch (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
                var oResp = JSON.parse(oError.responseText);
                MessageBox.error(oResp.error.message.value);
              }
            } catch (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            }
          } else {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show(that._getI18nText("msgOnNoOrderSelected"));
          }
        },

        onSearchAgregarOrden: function (oEvent) {
          var oTableAgregarOrdenes = Fragment.byId("frgOrden", "idOrdenList"),
            aParameter = oEvent.getParameter("selectionSet");
          that._subFilterOrden(oTableAgregarOrdenes, aParameter);
        },

        onRestoreFiltersAgregarOrden: function () {
          that.getModel("AgregarOrdenModel").setData({});
          Fragment.byId("frgOrden", "idOrdenList").getBinding().filter([]);
          Fragment.byId("frgOrden", "idOrdenList").getBinding().refresh(true);
        },

        onIconTabBarFilter: function (oEvent) {
          Fragment.byId("frgOrden", "idOrdenList")
            .getBinding()
            .filter([new Filter("Origen", EQ, oEvent.getParameters().key)]);
          Fragment.byId("frgOrden", "idOrdenList").getBinding().refresh();
        },

        onChangeStatusInsumo: async function (oEvent) {
          try {
            sap.ui.core.BusyIndicator.show(0);

            var sTypePedidoAction = oEvent.getSource().data("insumoAction");
            var aEstado = that._getEstadoPedido();
            var oTable = this.byId("idPedidoList");
            var iIndex = oTable.getSelectedIndex();
            var sPath = oTable.getContextByIndex(iIndex).getPath();
            var oPedido = oTable.getModel().getContext(sPath).getObject();
            var aPromise = [];
            var aPromiseAdd = [];

            var oObject = oEvent
              .getSource()
              .getBindingContext("OrdenSelectedItemsModel")
              .getObject();

            //var oOrdenSelectedItemsModel = that.getModel("OrdenSelectedItemsModel");
            //var aInsumo = oOrdenSelectedItemsModel.getData();

            var aPedidoInsumo = await that._getODataDinamic(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              {},
              [new Filter("pedidoId", EQ, oObject.pedidoId)]
            );

            if (aPedidoInsumo && aPedidoInsumo.length > 0) {
              aPedidoInsumo = aPedidoInsumo.filter((o) => {
                /**
                 * Filtrar solo registros que no esten anulados
                 */
                return !(
                  o.pedidoEstado == CONSTANT.PANUL ||
                  o.fraccionEstado == CONSTANT.OANUL ||
                  o.insumoEstado == CONSTANT.IANUL
                );
              });
            }

            /**
             * Busca todos los Insumos de la Orden-Fraccion asociados al insumo seleccionado
             */
            var aInsumo = aPedidoInsumo.filter(
              (o) => o.ordenFraccionId == oObject.ordenFraccionId
            );

            var oBodyAudit = {
              usuarioActualiza: that.sUser,
              fechaActualiza: new Date(),
            };

            if (sTypePedidoAction == "Annulate") {
              if (!that._validateAccionAsigned("ANULAR")) return;

              var aEstadoInsumo = [];
              for (var key in aInsumo) {
                /**
                 * Obtener todos los insumos de la Orden-Fraccion
                 * diferentes al Insumo seleccionado y que no esten anulados.
                 */
                var oItem = aInsumo[key];
                if (oItem.insumoEstado != CONSTANT.IANUL) {
                  aEstadoInsumo.push(oItem.insumoEstado);
                }
              }

              aEstadoInsumo = that._uniqByKeepFirst(aEstadoInsumo, (it) => it);

              var oEstadoPedidoAnul = aEstado.Pedido.find(
                  (o) => o.codigo === CONSTANT.PANUL
                ),
                oEstadoOrden = aEstado.Orden.find(
                  (o) => o.codigo === CONSTANT.OANUL
                ),
                oEstadoOrdenAten = aEstado.Orden.find(
                  (o) => o.codigo === CONSTANT.OATEN
                ),
                oEstadoInsumoAnul = aEstado.Insumo.find(
                  (o) => o.codigo === CONSTANT.IANUL
                ),
                oEstadoInsumoAte = aEstado.Insumo.find(
                  (o) => o.codigo === CONSTANT.IATPI
                );

              if (
                aPedidoInsumo.length == 1 && //Si en el pedido es el unico insumo sin anular
                (!aEstadoInsumo.length ||
                  (aEstadoInsumo.length == 1 &&
                    aEstadoInsumo[0] == CONSTANT.IANUL)) // Si no existen otros insumos sin anular
              ) {
                /**
                 * Accion: ANULAR
                 */

                //Anular todo el documento (Orden - Fraccion), si todos sus insumos estan anulados

                var sMotivo = await that.doMessageBoxInputCustom(
                  "Se anulara todo el documento , ¿Desea continuar con la anulación?"
                );
                if (sMotivo.trim() === "") {
                  return false;
                }
                sap.ui.core.BusyIndicator.show(0);
                /*
                 * Cambiar el estado del pedido a ANULADO.
                 * Solamente se debe permitir anular un pedido cuando todos los insumos tienen el estado PENDIENTE_PICKING.
                 * Cuando se Anula un Pedido todas sus ordenes e insumos deben de pasar a estado Anulado
                 */

                /**
                 * Evaluar si todos los insumos tienen el estado PENDIENTE_PICKING
                 * para ANULAR el documento
                 */

                var bValidAnulate = true;
                for (var oInsumo of aPedidoInsumo) {
                  if (oInsumo.insumoEstado != CONSTANT.IPEPI) {
                    bValidAnulate = false;
                    break;
                  }
                }

                /**
                 * Si todos los insumos tienen el estado PEDIENTE_PICKING se anula el documento
                 * A todos lOs INSUMO, FRACCION, ORDEN, PEDIDO se le asigna el estado ANULADO
                 */

                if (bValidAnulate && aPedidoInsumo.length) {
                  var aFraccion = that._getUniqueArray(aPedidoInsumo, [
                    "ordenFraccionId",
                  ]);
                  var oAudit = {
                    fechaActualiza: new Date(),
                    usuarioActualiza: that.sUser,
                  };

                  if (oPedido) {
                    var oKey = that.oModel.createKey("/PEDIDO", {
                      pedidoId: oPedido.pedidoId,
                    });
                    var oEntity = {
                      oEstado_iMaestraId: oEstadoPedidoAnul.iMaestraId, //Anulado
                    };

                    var oBody = { ...oEntity, ...oAudit };

                    aPromise.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });

                    var oHistorialData = that._buildNewHistorial(
                      oPedido,
                      oEstadoPedidoAnul,
                      sMotivo
                    );
                    delete oHistorialData.sEntity;

                    aPromiseAdd.push({
                      sKeyEntity: "HISTORIAL",
                      oBody: oHistorialData,
                    });
                  }

                  for (var oFraccion of aFraccion) {
                    var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                      ordenFraccionId: oFraccion.ordenFraccionId,
                    });
                    var oEntity = {
                      oEstado_iMaestraId: oEstadoOrden.iMaestraId, //Anulado
                    };

                    var oBody = { ...oEntity, ...oAudit };

                    aPromise.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });
                  }

                  /*var aOrden = that._uniqByKeepFirst(
                    aPedidoInsumo,
                    (it) => it.ordenId
                  );
                  for (var key in aOrden) {
                    //ORDEN
                    var oOrden = aOrden[key];
                    var sKeyEntity = that.oModel.createKey("/ORDEN", {
                      ordenId: oOrden.ordenId,
                    });

                    var oBody = {
                      oEstado_iMaestraId: oEstadoOrden.iMaestraId,
                    };

                    oBody = { ...oBodyAudit, ...oBody };
                    aPromise.push({
                      sKeyEntity: sKeyEntity,
                      oBody: oBody,
                    });
                  }*/

                  for (var oInsumo of aPedidoInsumo) {
                    var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                      ordenDetalleId: oInsumo.ordenDetalleId,
                    });
                    var oEntity = {
                      oEstado_iMaestraId: oEstadoInsumoAnul.iMaestraId, //Anulado
                    };

                    var oBody = { ...oEntity, ...oAudit };

                    aPromise.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });
                  }
                } else {
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.information(
                    "No se puede realizar la acción, verifique que los insumos no estén en proceso."
                  );
                }
              } else {
                /**
                 * Anular el Insumo seleccionado
                 * Evaluar estados de los otros Insumos:
                 *  SI: Todos los insumos tienen el estado ATENDIDO PICKING
                 *      - Cambiar el estado de la ORDEN/FRACCION a ATENDIDO
                 *  SI: Todos los insumos tienen el estado PENDIENTE PICKING
                 *      - Cambiar el estado de la ORDEN/FRACCION a PENDIENTE
                 */

                var oKey = that.oModel.createKey("/ORDEN_DETALLE", {
                  ordenDetalleId: oObject.ordenDetalleId,
                });

                var oEntity = {
                  oEstado_iMaestraId: oEstadoInsumoAnul.iMaestraId,
                };

                oBody = { ...oBodyAudit, ...oEntity };
                aPromise.push({
                  sKeyEntity: oKey,
                  oBody: oBody,
                });

                /**
                 * Obtener todos los estados diferentes a Anulados
                 */
                var aEstados = [];
                aInsumo.forEach((o) => {
                  if (o.ordenDetalleId == oObject.ordenDetalleId) {
                    o.insumoEstado = oEstadoInsumoAnul.codigo;
                  } else {
                    if (o.insumoEstado != oEstadoInsumoAnul.codigo) {
                      aEstados.push(o.insumoEstado);
                    }
                  }
                });
                aEstados = that._uniqByKeepFirst(aEstados, (it) => it);

                if (
                  aEstados.length == 0 // Todos los insumos fueron anulados
                ) {
                  var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                    ordenFraccionId: oObject.ordenFraccionId,
                  });
                  var oEntity = {
                    oEstado_iMaestraId: oEstadoOrden.iMaestraId, //Anulado
                  };

                  var oBody = { ...oEntity, ...oAudit };

                  aPromise.push({
                    sKeyEntity: oKey,
                    oBody: oBody,
                  });
                } else {
                  if (
                    aEstados.length == 1 &&
                    aEstados[0] == oEstadoInsumoAte.codigo
                  ) {
                    /**
                     * Obtener Registros Picking
                     */
                    var oPedidoErp = await oDataService.oDataRead(
                      that.oModelErp,
                      "PedidoConsolidadoSet",
                      {},
                      [
                        new Filter("PedidoNumero", EQ, oObject.pedidoNumero),
                        new Filter("OrdenNumero", EQ, oObject.ordenNumero),
                      ]
                    );
                    oPedidoErp = oPedidoErp ? oPedidoErp.results : [];
                    oPedidoErp = oPedidoErp.filter(
                      (o) =>
                        o.OrdenNumero == oObject.ordenNumero &&
                        +o.OrdenFraccion == +oObject.numFraccion &&
                        o.InsumoEstado != "ANULADO"
                    );
                    oPedidoErp = that._formatPedidoConsolidadoSet(oPedidoErp);
                    var oFraccion = oPedidoErp[0].aOrden[0].aFraccion[0];
                    var oKey = that.oModel.createKey("/ORDEN_FRACCION", {
                      ordenFraccionId: oObject.ordenFraccionId,
                    });
                    /**
                     * Actualizar registros picking de la ORDEN/FRACCION
                     */
                    var oEntity = {
                      oEstado_iMaestraId: oEstadoOrdenAten.iMaestraId, //Atendido
                      pickingIniUsu: oFraccion.PickingIniUsuario,
                      pickingIniFec:
                        typeof oFraccion.PickingIniFecha == "string"
                          ? new Date(
                              oFraccion.PickingIniFecha.split(" ").join("T")
                            )
                          : oFraccion.PickingIniFecha,
                      pickingFinUsu: oFraccion.PickingFinUsuario,
                      pickingFinFec:
                        typeof oFraccion.PickingFinFecha == "string"
                          ? new Date(
                              oFraccion.PickingFinFecha.split(" ").join("T")
                            )
                          : oFraccion.PickingFinFecha,
                    };
                    var oBody = { ...oBodyAudit, ...oEntity };
                    aPromise.push({
                      sKeyEntity: oKey,
                      oBody: oBody,
                    });
                    /**
                     * Evaluar si requiere actualizacion de estado a nivel de PEDIDO
                     */
                    var aPedidoOrden = that._getUniqueArray(aPedidoInsumo, [
                      "pedidoId",
                      "ordenFraccionId",
                    ]);
                    var aEstadoOrden = [];
                    aPedidoOrden.forEach((o) => {
                      if (o.ordenFraccionId == oObject.ordenFraccionId) {
                        o.fraccionEstado = oEstadoOrdenAten.codigo;
                        o.pedidoPickingIniUsu = oFraccion.PickingIniUsuario;
                        o.pedidoPickingIniFec =
                          typeof oFraccion.PickingIniFecha == "string"
                            ? new Date(
                                oFraccion.PickingIniFecha.split(" ").join("T")
                              )
                            : oFraccion.PickingIniFecha;
                        o.pedidoPickingFinUsu = oFraccion.PickingFinUsuario;
                        o.pedidoPickingFinFec =
                          typeof oFraccion.PickingFinFecha == "string"
                            ? new Date(
                                oFraccion.PickingFinFecha.split(" ").join("T")
                              )
                            : oFraccion.PickingFinFecha;
                      }
                      if (
                        [
                          CONSTANT.OPEND,
                          CONSTANT.OPICK,
                          CONSTANT.OATEN,
                        ].includes(o.fraccionEstado)
                      ) {
                        aEstadoOrden.push(o.fraccionEstado);
                      } else {
                        /**
                         * Si la ORDEN/FRACCION tiene un estado superior a los estados de PICKING,
                         * tomarlo como ATENDIDO
                         */
                        aEstadoOrden.push(CONSTANT.OATEN);
                      }
                    });
                    aEstadoOrden = that._uniqByKeepFirst(
                      aEstadoOrden,
                      (it) => it
                    );
                    if (
                      aEstadoOrden.length == 1 &&
                      aEstadoOrden[0] == CONSTANT.OATEN
                    ) {
                      var oIniPicking = this._getObjectMinDateTime(
                        aPedidoOrden,
                        "pedidoPickingIniFec"
                      );
                      var oFinPicking = this._getObjectMaxDateTime(
                        aPedidoOrden,
                        "pedidoPickingFinFec"
                      );
                      var oKey = that.oModel.createKey("/PEDIDO", {
                        pedidoId: oObject.pedidoId,
                      });
                      /**
                       * Actualizar registros picking del PEDIDO
                       */
                      var oEntity = {
                        pickingUsuInic: oIniPicking.pedidoPickingIniUsu,
                        pickingFecInic:
                          typeof oIniPicking.pedidoPickingIniFec == "string"
                            ? new Date(
                                oIniPicking.pedidoPickingIniFec
                                  .split(" ")
                                  .join("T")
                              )
                            : oIniPicking.pedidoPickingIniFec,
                        pickingUsuFin: oFinPicking.pedidoPickingFinUsu,
                        pickingFecFin:
                          typeof oFinPicking.pedidoPickingFinFec == "string"
                            ? new Date(
                                oFinPicking.pedidoPickingFinFec
                                  .split(" ")
                                  .join("T")
                              )
                            : oIniPicking.pedidoPickingIniFec,
                      };
                      var oBody = { ...oBodyAudit, ...oEntity };
                      aPromise.push({
                        sKeyEntity: oKey,
                        oBody: oBody,
                      });
                    }
                  }
                }

                var oAction = await that.doMessageboxActionCustom(
                  "Se anulara el Insumo, ¿Desea continuar con la anulación?"
                );
                if (oAction === "NO") {
                  return false;
                }
              }

              var aPromiseOrdenDetalle = [];
              for (var key in aPromise) {
                var oPromise = aPromise[key];
                aPromiseOrdenDetalle.push(
                  oDataService.oDataUpdate(
                    that.oModel,
                    oPromise.sKeyEntity,
                    oPromise.oBody
                  )
                );
              }
              for (var key in aPromiseAdd) {
                var oPromise = aPromiseAdd[key];
                aPromiseOrdenDetalle.push(
                  oDataService.oDataCreate(
                    that.oModel,
                    oPromise.sKeyEntity,
                    oPromise.oBody
                  )
                );
              }
              sap.ui.core.BusyIndicator.show(0);
              Promise.all(aPromiseOrdenDetalle)
                .then((aResp) => {
                  that.byId("idPedidoList").getBinding().refresh(true);
                  that.sendPedidoToErp(that, oPedido.pedidoId);
                  if (
                    that.oPedidoSelect &&
                    that.oPedidoSelect.pedidoId == oPedido.pedidoId
                  ) {
                    that._getInsumoPedidoSelect(oPedido);
                  }
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.success(that._getI18nText("msgActualiza"));
                })
                .catch((oError) => {
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.error(that._getI18nText("msgActualizaErr"));
                });
            }
          } catch (oError) {
            console.log(oError);
            sap.ui.core.BusyIndicator.hide();
            var oResp = JSON.parse(oError.responseText);
            MessageBox.error(oResp.error.message.value);
          }
        },

        /**
         * EVENTS: Filter.fragment
         */
        onSearchFilter: async function (oEvent) {
          try {
            sap.ui.core.BusyIndicator.show(0);
            that._resetModel();
            var oFilter = "",
              oSelectionSet = oEvent.getParameter("selectionSet"),
              oTablePedido = this.byId("idPedidoList"),
              oTableOrden = this.byId("idOrdenList"),
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

        onRestoreFilters: async function (oEvent) {
          that._resetModel();
          var oTablaPedidos = this.byId("idPedidoList").getBinding(),
            oTablaOrden = this.byId("idOrdenList").getBinding();

          try {
            oTablaPedidos.filter();
            oTablaPedidos.refresh(true);
          } catch (oError) {}
          try {
            oTablaOrden.filter();
            oTablaOrden.refresh(true);
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
         * EVENT: TipoPedido.fragment
         */

        onPressAceptar: function (oEvent) {
          sap.ui.core.BusyIndicator.show(0);
          var oSource = oEvent.getSource();
          var oParent = oSource.getParent();
          {
            //MODELO PARA PEDIDOS NORMAL, URGENTE
            that.getView().getModel("OrdenListModel").setData([]);
            that.getView().getModel("OrdenInsumoListModel").setData([]);
            that.getView().getModel("OrdenListModel").refresh();
            that.getView().getModel("OrdenInsumoListModel").refresh();

            //MODELO PARA PEDIDOS INDIVIDUAL/ADICIONAL
            that.getView().getModel("PAIndividualListModel").setData([]);
            that.getView().getModel("OrdenInsumoListModel").setData([]);
            that.getView().getModel("PAIndividualListModel").refresh();
            that.getView().getModel("OrdenInsumoListModel").refresh();

            //MODELO PARA PEDIDOS IDE MUESTRA
            that.getView().getModel("ReservaModel").setData([]);
            that.getView().getModel("ReservaListModel").setData([]);
            that.getView().getModel("ReservaModel").refresh();
          }

          var sKeyTipoPedido = this.getView()
            .getModel("PedidoModel")
            .getProperty("/keyTipoPedido");
          var sDialog = "";

          if (!sKeyTipoPedido) {
            sap.ui.core.BusyIndicator.hide();
          }

          if (
            [
              CONSTANT.NORM, //Pedido Normal
              CONSTANT.URGE, //Pedido Urgente
            ].includes(sKeyTipoPedido)
          ) {
            sDialog = "CrearPedidoNormal";
          } else if (
            [
              CONSTANT.ADIC, //Pedido Adicional
              CONSTANT.INDI, //Pedido Individual
            ].includes(sKeyTipoPedido)
          ) {
            sDialog = "CrearPedidoIndividual";
            that.setModel(new JSONModel([]), "McInsumoModel");
            that.setModel(new JSONModel([]), "McLoteModel");
          } else if (
            [
              CONSTANT.IDEM, //Pedido CP IDE/Muestras
            ].includes(sKeyTipoPedido)
          ) {
            sDialog = "CrearPedidoReservaIDE";
          } else {
            return;
          }

          this.getView().getModel("PedidoModel").getData().mainDialog = sDialog;
          this.getView().getModel("PedidoModel").refresh(true);

          oParent.close();
          this._openDialogDinamic(sDialog);
        },

        /**
         * EVENT: PedidoView.fragment
         */
        onSelectOrderItems: function (oEvent) {
          //Visualización de Pedidos
          if (
            oEvent.getSource()._getContexts()[
              oEvent.getParameters().rowIndex
            ] !== undefined
          ) {
            var oTable = Fragment.byId("frgPedidoView", "idPedidoCPItemsView");
            var oContext = oEvent.getSource()._getContexts();
            var iIndex = oEvent.getParameters().rowIndex;
            var sOrdenFraccionId = oContext[iIndex].getObject().ordenFraccionId;

            oTable
              .getBinding()
              .filter([new Filter("ordenFraccionId", EQ, sOrdenFraccionId)]);
            oTable.getBinding().refresh(true);
          }
        },

        onChangeValue: function (oEvent, oInsumo, sType) {
          var _oInput = oEvent.getSource();
          var val = _oInput.getValue();
          val = that._getValueDec(Math.abs(val));

          if (sType == "CANT_SUGERIDA") {
            oInsumo.CantSfraccUmbEdit = val;
            if (+oInsumo.CantSfraccUmb == +oInsumo.CantSfraccUmbEdit) {
              oInsumo.CantSugeridaColor = "CN";
            } else if (+oInsumo.CantSfraccUmbEdit <= 0) {
              oInsumo.CantSugeridaColor = "CR";
            } else {
              oInsumo.CantSugeridaColor = "CA";
            }
            if (+oInsumo.CantSfraccUmbEdit > +oInsumo.Bdmng) {
              MessageBox.information(
                "La cantidad ingresada es mayor a la Requerida"
              );
            }
          } else if (sType == "CANT_ADICIONAL") {
            oInsumo.CantAdicional = val;
            if (+oInsumo.CantSfraccUmb == +oInsumo.CantAdicional) {
              oInsumo.CantSugeridaColor = "CN";
            } else if (+oInsumo.CantAdicional <= 0) {
              oInsumo.CantSugeridaColor = "CR";
            } else {
              oInsumo.CantSugeridaColor = "CA";
            }
            if (+oInsumo.CantAdicional > +oInsumo.Bdmng) {
              MessageBox.information(
                "La cantidad ingresada es mayor a la Requerida"
              );
            }
          } else if (sType == "CANT_SUGERIDA_IDE") {
            oInsumo.CantSugeridaEdit = val;
            if (+oInsumo.CantSugerida == +oInsumo.CantSugeridaEdit) {
              oInsumo.CantSugeridaColor = "CN";
            } else if (+oInsumo.CantSugeridaEdit <= 0) {
              oInsumo.CantSugeridaColor = "CR";
            } else {
              oInsumo.CantSugeridaColor = "CA";
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
            aFilters = [];

          var oTable = this.byId("idPedidoList");
          var oBinding = oTable.getBinding();
          /*var aMaestraList = that.getView().getModel("MaestraModel").getData();
                var aTipoPedido = that
                  .getView()
                  .getModel("TipoPedidoDetalleListModel")
                  .getData();*/
          aFilters = oBinding.aFilters;
          aFilters.push(new Filter("Tipo_codigo", EQ, CONSTANT.TIPOP));
          sap.ui.core.BusyIndicator.show(0);
          var oResp = await oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_PEDIDO_CP",
              oUrlParameters,
              aFilters
            )
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            });
          sap.ui.core.BusyIndicator.hide();
          var aPedidoList = oResp.results;

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "SEGIMIENTO PEDIDO ALMACEN",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("PEDIDO");

          var ws_headerPedido = [
            that._getI18nText("lblPedido"), //"Pedido",
            that._getI18nText("clTipoPedido"), //"Tipo de Pedido",
            that._getI18nText("clEstado"),
            that._getI18nText("dclCentro"),
            that._getI18nText("clUsuCreacion"), //"Usuario Creación",
            that._getI18nText("clFecCreacion"), //"Fecha Creación",
            that._getI18nText("clHoraCreacion"), //"Hora Creación",

            that._getI18nText("clUsuIniPicking"), //"Usuario Inicio Picking",
            that._getI18nText("clFecIniPicking"), //"Fecha Inicio Picking",
            that._getI18nText("clHoraIniPicking"), //"Hora Inicio Picking",

            that._getI18nText("clUsuFinPicking"), //"Usuario Fin Picking",
            that._getI18nText("clFecFinPicking"), //"Fecha Fin Picking",
            that._getI18nText("clHoraFinPicking"), //"Hora Fin Picking",
            that._getI18nText("tlUserAssigned"),
            that._getI18nText("dclMotivo"),
          ];
          var ws_dataPedido = [];

          ws_dataPedido.push(ws_headerPedido);

          for (var key in aPedidoList) {
            var report = aPedidoList[key];
            var ws_contentPedido = [
              report.numPedido,
              report.TipoDetalle_nombre,
              report.Estado_contenido,
              report.Centro_codigoSap,
              report.usuarioRegistro,
              formatter.getTimestampToDMY(report.fechaRegistro),
              formatter.getTimestampToHMS(report.fechaRegistro),
              report.pickingUsuInic,
              formatter.getTimestampToDMY(report.pickingFecInic),
              formatter.getTimestampToHMS(report.pickingFecInic),
              report.pickingUsuFin,
              formatter.getTimestampToDMY(report.pickingFecFin),
              formatter.getTimestampToHMS(report.pickingFecFin),
              formatter.stringDeteleDuplicate(report.usuarioAsignado),
              report.Motivo_contenido,
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

          XLSX.writeFile(wb, "SEGIMIENTO PEDIDO ALMACEN.xlsx");
        },

        onExportXLSReportOrden: function (oEvent) {
          var aOrdenList = that
            .getView()
            .getModel("OrdenSelectedItemsModel")
            .getData();

          //aOrdenList = this.sortByAttribute(aOrdenList, "ordenNumero", "ordenPos", "numFraccion", "numSubFraccion");

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "REPORTE ORDEN",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("RESERVA");

          var ws_headerOrden = [
            that._getI18nText("clOrdReser"),
            that._getI18nText("clPosnr"),
            that._getI18nText("clFraccion"),
            that._getI18nText("clSubFraccion"),
            that._getI18nText("dclAlmacen"),
            that._getI18nText("lblCodigoInsumo"),
            that._getI18nText("dclDescripMaterial"),
            that._getI18nText("lblLoteInsumo"),
            that._getI18nText("clEstado"),
            that._getI18nText("clCantReq"),
            that._getI18nText("clUnidad"),
            that._getI18nText("dclCantSugTotal"),
            that._getI18nText("dclCantSug"),
            that._getI18nText("clCantPed"),
            that._getI18nText("clUnidad"),
            that._getI18nText("dclAgotar"),
          ];
          var ws_dataOrden = [];

          ws_dataOrden.push(ws_headerOrden);

          for (var key in aOrdenList) {
            var report = aOrdenList[key];

            var ws_contentOrden = [
              report.reservaIDE == "X" ? report.reservaNum : report.ordenNumero,
              report.ordenPos,
              report.numFraccion,
              report.numSubFraccion,
              report.almacen,
              report.codigoInsumo,
              report.descripcion,
              report.lote,
              report.insumoEstadoDes,
              formatter.formatWeight(report.cantRequerida),
              report.cantRequeridaUM,
              formatter.formatWeight(report.cantSugeridaTotal),
              formatter.formatWeight(report.cantSugerida),
              formatter.formatWeight(report.sugerido),
              report.unidad,
              report.agotar == null || report.agotar == "" ? "No" : "Si",
            ];

            ws_dataOrden.push(ws_contentOrden);
          }

          var wsOrden = XLSX.utils.aoa_to_sheet(ws_dataOrden);

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

          wb.Sheets["RESERVA"] = wsOrden;
          XLSX.write(wb, {
            bookType: "xlsx",
            bookSST: true,
            type: "binary",
          });

          XLSX.writeFile(wb, "REPORTE ORDEN.xlsx");
        },

        onExportXLSReportOR: function (oEvent) {
          var aPedidoList = that
            .getView()
            .getModel("ComprometidaDetailModel")
            .getData();

          var wb = XLSX.utils.book_new();
          wb.Props = {
            Title: "REPORTE CANTIDAD COMPROMETIDA",
            Subject: "TITAN",
            Author: "MEDIFARMA",
            CreatedDate: new Date(),
          };

          wb.SheetNames.push("RESERVA");

          var ws_headerPedido = [
            "Nombre Produc.",
            "Código Producto",
            "Lote OP",
            "Nro. Orden/Reserva",
            "Cant. Sugerida",
            "Cantidad Reservada",
            "Unidad Medida",
          ];
          var ws_dataPedido = [];

          ws_dataPedido.push(ws_headerPedido);

          for (var key in aPedidoList) {
            var report = aPedidoList[key];

            var ws_contentPedido = [
              report.DescripcionPT,
              report.MaterialPT,
              report.LotePT,
              report.Orden,
              report.CantSugerida,
              report.CantComp,
              report.UnidadMedida,
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

          wb.Sheets["RESERVA"] = wsPedido;
          XLSX.write(wb, {
            bookType: "xlsx",
            bookSST: true,
            type: "binary",
          });

          XLSX.writeFile(wb, "REPORTE CANTIDAD COMPROMETIDA.xlsx");
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
          var aFilters = [];
          var oUrlParameters = {};
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

        _getSeccion: async function (sCentro) {
          var aFilters = [];
          var bFlagDinamic = false;
          that.setModel(new JSONModel([]), "SeccionModel");
          aFilters.push(new Filter("Werks", EQ, sCentro));
          await that
            ._getODataDinamic(that.oModelErp, "SeccionSet", {}, aFilters)
            .then((oData) => {
              that.setModel(new JSONModel(oData), "SeccionModel");
              bFlagDinamic = true;
            });
          return bFlagDinamic;
        },

        _getConstantFilterOrden: function (aFilters) {
          var oMaestraList = that.getModel("MaestraModel").getData();
          var aClaseDocumento = oMaestraList[CONSTANT.CLASE_DOC]; //CLASE DOCUMENTO PARA FILTROS DE ORDENES

          if (!aFilters) aFilters = [];
          if (aClaseDocumento) {
            for (var key in aClaseDocumento) {
              var oConstant = aClaseDocumento[key];
              aFilters.push(
                new Filter(
                  "Auart",
                  EQ,
                  oConstant.codigoSap && oConstant.codigoSap != ""
                    ? oConstant.codigoSap
                    : oConstant.codigo
                )
              );
            }
          }
          return aFilters;
        },

        _getConstantFilterInsumo: function (aFilters) {
          var oMaestraList = that.getModel("MaestraModel").getData();
          var aClaseDocumento = oMaestraList[CONSTANT.GRUPO_ART]; //GRUPO ARTICULO PARA FILTROS DE INSUMOS

          if (!aFilters) aFilters = [];
          if (aClaseDocumento) {
            for (var key in aClaseDocumento) {
              var oConstant = aClaseDocumento[key];
              aFilters.push(
                new Filter(
                  "Matkl",
                  CONTAINS,
                  oConstant.codigoSap && oConstant.codigoSap != ""
                    ? oConstant.codigoSap
                    : oConstant.codigo
                )
              );
            }
          }
          return aFilters;
        },

        _getOrden: async function (sCentro, dDate) {
          var aFilters = [];
          var oUrlParameters = {};
          var oDateFrom = dDate.getFrom();
          var oDateTo = dDate.getTo();
          var bFlagDinamic = false;
          aFilters.push(new Filter("Aufnr", EQ, ""));
          aFilters.push(new Filter("Werks", EQ, ""));
          aFilters.push(new Filter("CentroReserva", EQ, sCentro));
          aFilters = that._getConstantFilterOrden(aFilters);
          aFilters.push(
            new Filter(
              "Gstrp",
              BT,
              that._subtractTimeFromDate(oDateFrom, 5),
              that._subtractTimeFromDate(oDateTo, 5.0003)
            ) //Gstrp : Fecha Liberacion
          );

          that.setModel(new JSONModel([]), "OrdenesModel");

          sap.ui.core.BusyIndicator.show(0);
          await that
            ._getODataDinamic(
              that.oModelErp,
              "OrdenSet",
              oUrlParameters,
              aFilters
            )
            .then((oData) => {
              sap.ui.core.BusyIndicator.hide();
              var aOrdenFilter = that._FilterStatusLib(oData);
              aOrdenFilter = that._uniqByKeepFirst(
                aOrdenFilter,
                (it) => it.Aufnr
              );

              if (!aOrdenFilter.length) {
                MessageBox.warning(
                  "No se encontraron Ordenes liberadas en el servidor."
                );
              }

              that.setModel(new JSONModel(aOrdenFilter), "OrdenesModel");
              bFlagDinamic = true;
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              var oResp = JSON.parse(oError.responseText);
              MessageBox.warning(oResp.error.message.value);
              bFlagDinamic = false;
            });
          return bFlagDinamic;
        },

        _onAddItemsIndivToList: function () {
          var oMcInsumoModel = that.getModel("McInsumoModel");
          var oPedidoModel = that.getModel("PedidoModel");
          var aReservaList = oMcInsumoModel.getData();
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;
          var oInsumo = oParameter.oInsumo;

          var aReservaT = aReservaList.filter((o) => {
            return (
              o.Aufnr == oInsumo.Aufnr &&
              o.Matnr == oInsumo.Matnr &&
              o.Charg == oInsumo.Charg &&
              o.Posnr == oInsumo.Posnr
            );
          });

          var oTempOrdenListModel = that.getModel("TempOrdenListModel");
          var aOrdenList = oTempOrdenListModel.getData();

          var aOrdenT = [];
          for (var oItem of aReservaT) {
            var oOrdenList = aOrdenList.find(
              (o) => o.Aufnr == oItem.Aufnr && o.Fracc == oItem.Fracc
            );
            aOrdenT.push(oOrdenList);
          }

          /**
           * Agregar Orden
           */

          var oOrdenListModel = that.getModel("OrdenListModel");
          var oOrdenInsumoListModel = that.getModel("OrdenInsumoListModel");

          var aOrden = oOrdenListModel.getData();
          var aReserva = oOrdenInsumoListModel.getData();

          aOrden = aOrden.concat(aOrdenT);
          aReserva = aReserva.concat(aReservaT);

          aOrden = that._getUniqueArray(aOrden, ["Aufnr", "Fracc"]);

          oOrdenListModel.setData(aOrden);
          oOrdenListModel.refresh(true);

          oOrdenInsumoListModel.setData(aReserva);
          oOrdenInsumoListModel.refresh(true);
        },

        _getReserva: function (dDate, sCentro, sDialog) {
          var aFilters = [];
          var oUrlParameters = {};
          var oDateFrom = dDate.getFrom();
          var oDateTo = dDate.getTo();
          oDateFrom.setHours(0,0,0);
          oDateTo.setHours(0,0,0);
          aFilters = that._getConstantFilterInsumo(aFilters);
          aFilters.push(new Filter("Bwart", EQ, "201"));
          aFilters.push(new Filter("Bwart", EQ, "311"));
          aFilters.push(
            new Filter(
              "Bdter",
              BT,
              that._subtractTimeFromDate(oDateFrom, 5),
              that._subtractTimeFromDate(oDateTo, 5)
            )
          );
          aFilters.push(new Filter("Werks", EQ, sCentro));
          aFilters.push(new Filter("Rsnum", EQ, ""));

          that
            ._getODataDinamic(
              that.oModelErp,
              "ReservaSet",
              oUrlParameters,
              aFilters
            )
            .then((oData) => {
              var aReservaLote = [];
              oData.forEach((o) => {
                if (o.Charg) {
                  //Liberados (LIB.)
                  o.CantSugeridaEdit = o.CantSugerida;
                  o.CantSugeridaColor = "CN";
                  aReservaLote.push(o);
                }
              });

              if (aReservaLote.length) {
                if (sDialog) {
                  var aReservasGroup = aReservaLote.reduce(function (r, a) {
                    var sKey = a.Rsnum;
                    r[sKey] = r[sKey] || [];
                    r[sKey].push(a);
                    return r;
                  }, Object.create(null));

                  var aGroup = [];
                  for (var key in aReservasGroup) {
                    var object = Object.assign({}, aReservasGroup[key][0]);
                    object.aReserva = aReservasGroup[key];
                    aGroup.push(object);
                  }

                  that.setModel(new JSONModel(aGroup), "ReservaGroupModel");
                  that._openDialogDinamic(sDialog);
                } else {
                  that.setModel(new JSONModel(aReservaLote), "ReservaModel");
                }
              } else {
                that.setModel(new JSONModel([]), "ReservaModel");
                return MessageBox.error(
                  "No se encontro Reservas en el servidor."
                );
              }
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
              var oResp = JSON.parse(oError.responseText);
              MessageBox.warning(oResp.error.message.value);
            });
        },

        _getTipoPedido: function () {
          try {
            that
              ._getODataDinamicSetModel(
                null,
                "TIPO_PEDIDO_DETALLE",
                null,
                null,
                "TipoPedidoDetalleListModel"
              )
              .then(function (oResult) {
                sap.ui.core.BusyIndicator.hide();
              })
              .catch(function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
              });
          } catch (oError) {
            console.log("Error All Init");
            sap.ui.core.BusyIndicator.hide();
          }
        },

        _getInsumoPedidoSelect: function (oData) {
          var oView = that.getView();
          var oOrdenSelectedItemsModel = oView.getModel(
            "OrdenSelectedItemsModel"
          );
          oOrdenSelectedItemsModel.setData([]);
          oOrdenSelectedItemsModel.refresh();

          var aFilters = [];
          aFilters.push(new Filter("pedidoId", EQ, oData.pedidoId));
          that
            ._getODataDinamic(null, "VIEW_SEGUIMIENTO_DETALLE", {}, aFilters)
            .then((aOrdenDetalleList) => {
              oOrdenSelectedItemsModel.setData(aOrdenDetalleList);
              oOrdenSelectedItemsModel.refresh();
            })
            .catch((oError) => {
              console.log("Error al obtener las Ordenes");
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
            })
            .finally((oFinal) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        _pedidoShowUserAssignments: function (oEvent, sKeyPedido) {
          var that = this;

          var oPedidoUsuarioListModel = that
            .getView()
            .getModel("PedidoUsuarioListModel");
          oPedidoUsuarioListModel.setData({});

          var aFilters = [];
          aFilters.push(new Filter("oPedido_pedidoId", EQ, sKeyPedido));

          var oUrlParameters = {
            $expand: "oPedido,oUsuario",
          };
          that
            ._getODataDinamic(null, "PEDIDO_USUARIO", oUrlParameters, aFilters)
            .then((oDataEntity) => {
              oPedidoUsuarioListModel.setData(oDataEntity);
              oPedidoUsuarioListModel.refresh();
              that._openDialogDinamic("UsuarioAsignado");

              //Obtener listado de usuario cuyo rol es: Auxiliar de Almacén de Insumos
              var aFilters = [];
              aFilters.push(new Filter("oRol/codigo", EQ, CONSTANT.AUX_ROL));
              aFilters.push(new Filter("oUsuario/activo", EQ, true));
              aFilters.push(new Filter("activo", EQ, true));

              var oUrlParameters = {
                $expand: "oUsuario,oRol",
              };

              that._getODataDinamicSetModel(
                null,
                "UsuarioRol",
                oUrlParameters,
                aFilters,
                "UserRoleListModel"
              );
            });
        },

        _pedidoChangeStatus: async function (oEvent, sKeyPedido, sAction) {
          var aPromise = [],
            aPromiseAdd = [];
          var aMaestra = this.getView().getModel("MaestraModel").getData();
          var aEstadoPedido = aMaestra[CONSTANT.ESTADO_PEDIDO];
          var oPendiente = aEstadoPedido.find(
            (o) => o.codigo === CONSTANT.PPEND
          );
          var oBloqueado = aEstadoPedido.find(
            (o) => o.codigo === CONSTANT.PBLOQ
          );
          var oAnulado = aEstadoPedido.find((o) => o.codigo === CONSTANT.PANUL);
          var aFilter = [];

          aFilter.push(new Filter("pedidoId", EQ, sKeyPedido));
          sap.ui.core.BusyIndicator.show(0);

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
                o.pedidoEstado == CONSTANT.PANUL ||
                o.fraccionEstado == CONSTANT.OANUL ||
                o.insumoEstado == CONSTANT.IANUL
              );
            });
          }

          var oPedido = aResult[0];
          that.oUpdatePedido = {
            oPedido: oPedido,
          };
          /**
           * Verificar si el Pedido esta en estado PENDIENTE o BLOQUEADO
           */

          if ([CONSTANT.PPEND, CONSTANT.PBLOQ].includes(oPedido.pedidoEstado)) {
            var oEstado = null;

            if (sAction == "Annulate") {
              var sMotivo = await that.doMessageBoxInputCustom(
                "Se anulara todo el documento, ¿Desea continuar con la anulación?"
              );
              if (sMotivo.trim() === "") {
                return false;
              }
              sap.ui.core.BusyIndicator.show(0);
              /*
               * Cambiar el estado del pedido a ANULADO.
               * Solamente se debe permitir anular un pedido cuando todos los insumos tienen el estado PENDIENTE_PICKING.
               * Cuando se Anula un Pedido todas sus ordenes e insumos deben de pasar a estado Anulado
               */

              /**
               * Evaluar si todos los insumos tienen el estado PENDIENTE_PICKING
               * para ANULAR el documento
               */

              oEstado = oAnulado;
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

                if (oPedido) {
                  var oKey = that.oModel.createKey("/PEDIDO", {
                    pedidoId: oPedido.pedidoId,
                  });
                  var oEntity = {
                    oEstado_iMaestraId: oEstadoPedidoAnul.iMaestraId, //Anulado
                  };

                  var oBody = { ...oEntity, ...oAudit };

                  aPromise.push({
                    sKeyEntity: oKey,
                    oBody: oBody,
                  });

                  var oHistorialData = that._buildNewHistorial(
                    oPedido,
                    oEstadoPedidoAnul,
                    sMotivo
                  );
                  delete oHistorialData.sEntity;

                  aPromiseAdd.push({
                    sKeyEntity: "HISTORIAL",
                    oBody: oHistorialData,
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

                  aPromise.push({
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

                  aPromise.push({
                    sKeyEntity: oKey,
                    oBody: oBody,
                  });
                }
              }
            } else if (sAction == "LockUnlock") {
              var sMotivo = await that.doMessageBoxInputCustom(
                "Se Bloqueara/Desbloqueara el documento, ¿Desea continuar?"
              );
              if (sMotivo.trim() === "") {
                return false;
              }
              sap.ui.core.BusyIndicator.show(0);

              /*
               * Cambiar el estado del pedido a [BLOQUEADO o PENDIENTE].
               * Solamente se debe permitir bloquear un pedido cuando está en estado pendiente.
               */
              if (oPedido.pedidoEstado == CONSTANT.PPEND) {
                //BLOQ: BLOQUEADO
                oEstado = oBloqueado;
              } else {
                //PEND : PENDIENTE
                oEstado = oPendiente;
              }

              var oBodyAudit = {
                usuarioActualiza: that.sUser,
                fechaActualiza: new Date(),
              };

              var oKey = that.oModel.createKey("/PEDIDO", {
                pedidoId: oPedido.pedidoId,
              });

              var oBody = {
                oEstado_iMaestraId: oEstado.iMaestraId,
              };

              oBody = { ...oBodyAudit, ...oBody };
              aPromise.push({
                sKeyEntity: oKey,
                oBody: oBody,
              });

              var oHistorialData = that._buildNewHistorial(
                oPedido,
                oEstado,
                sMotivo
              );
              delete oHistorialData.sEntity;
              aPromiseAdd.push({
                sKeyEntity: "HISTORIAL",
                oBody: oHistorialData,
              });
            }

            var aPromiseOrdenDetalle = [];
            for (var key in aPromise) {
              var oPromise = aPromise[key];
              aPromiseOrdenDetalle.push(
                oDataService.oDataUpdate(
                  that.oModel,
                  oPromise.sKeyEntity,
                  oPromise.oBody
                )
              );
            }

            for (var key in aPromiseAdd) {
              var oPromise = aPromiseAdd[key];
              aPromiseOrdenDetalle.push(
                oDataService.oDataCreate(
                  that.oModel,
                  oPromise.sKeyEntity,
                  oPromise.oBody
                )
              );
            }

            Promise.all(aPromiseOrdenDetalle)
              .then((oResp) => {
                that.sendPedidoToErp(that, that.oUpdatePedido.oPedido.pedidoId);
                if (
                  that.oPedidoSelect &&
                  that.oPedidoSelect.pedidoId ==
                    that.oUpdatePedido.oPedido.pedidoId
                ) {
                  that._getInsumoPedidoSelect(that.oUpdatePedido.oPedido);
                }
                that.oUpdatePedido = {};
                that.byId("idPedidoList").getBinding().refresh(true);
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
            MessageBox.information(
              "No se puede realizar la acción, verifique que los insumos no estén en proceso."
            );
          }
        },

        _refeshPedidoUserAssignments: function (sPedido) {
          /**
           * Lista los usuarios que tienen el rol de Auxiliar de Almacén de Insumos asignados al pedido
           */
          var that = this;
          var aFilters = [];
          aFilters.push(new Filter("oPedido_pedidoId", EQ, sPedido));

          var oUrlParameters = {
            $expand: "oPedido,oUsuario",
          };
          var oPedidoUsuarioListModel = that
            .getView()
            .getModel("PedidoUsuarioListModel");
          oPedidoUsuarioListModel.setData({});
          sap.ui.core.BusyIndicator.show();
          that
            ._getODataDinamic(null, "PEDIDO_USUARIO", oUrlParameters, aFilters)
            .then((oDataEntity) => {
              sap.ui.core.BusyIndicator.hide();
              oPedidoUsuarioListModel.setData(oDataEntity);
              oPedidoUsuarioListModel.refresh();
            });
        },

        _clearAllModelPI: async function () {
          var oPedidoModel = that.getModel("PedidoModel");
          var oData = oPedidoModel.getData();
          var oParameter = oData.tipoPedidoParams;
          var sTPedido = oData.keyTipoPedido;

          if (sTPedido == CONSTANT.NORM || sTPedido == CONSTANT.URGE) {
            //Pedido Normal, Pedido Urgente
            var oOrdenInsumoListModel = that.getModel("OrdenInsumoListModel");
            if (oOrdenInsumoListModel.getData().length) {
              var oAction = await that.doMessageboxAction();
              if (oAction === "YES") {
                that.setModel(new JSONModel([]), "OrdenListModel");
                that.setModel(new JSONModel([]), "OrdenInsumoListModel");
                var sCentro = oParameter.keyCentro;
                oData.tipoPedidoParams = { keyCentro: sCentro };
                return true;
              } else {
                return false;
              }
            }
          }

          if (sTPedido == CONSTANT.INDI || sTPedido == CONSTANT.ADIC) {
            //Pedido Individual, Pedido Adicional
            var oOrdenInsumoListModel = that.getModel("OrdenInsumoListModel");
            if (oOrdenInsumoListModel.getData().length) {
              var oAction = await that.doMessageboxAction();
              if (oAction === "YES") {
                that.setModel(new JSONModel([]), "McOrdenModel");
                that.setModel(new JSONModel([]), "McInsumoModel");
                that.setModel(new JSONModel([]), "McLoteModel");
                that.setModel(new JSONModel([]), "OrdenListModel");
                that.setModel(new JSONModel([]), "OrdenInsumoListModel");
                var sCentro = oParameter.keyCentro;
                oData.tipoPedidoParams = { keyCentro: sCentro };
                return true;
              } else {
                return false;
              }
            }
          }

          if (sTPedido == CONSTANT.IDEM) {
            //Pedido IDE/Muestras
            var oReservaListModel = that.getModel("ReservaListModel");
            if (oReservaListModel.getData().length) {
              var oAction = await that.doMessageboxAction();
              if (oAction === "YES") {
                that.setModel(new JSONModel([]), "ReservaGroupModel");
                that.setModel(new JSONModel([]), "ReservaModel");
                that.setModel(new JSONModel([]), "ReservaListModel");
                var sCentro = oParameter.keyCentro;
                oData.tipoPedidoParams = { keyCentro: sCentro };
                return true;
              } else {
                return false;
              }
            }
          }

          return true;
        },

        _buildEnitiesPedido: function (sTipoPedido) {
          var that = this;
          var aOrdenFracT = that.getModel("OrdenListModel").getData();
          var aInsumoT = that.getModel("OrdenInsumoListModel").getData();
          var oParam = that.getModel("PedidoModel").getData();
          var oConstant = that._getConstant();

          if (sTipoPedido == "PAI") {
            /**
             * INDIVIDUAL / ADICIONAL
             */
            aInsumoT = aInsumoT.filter((o) => o.CantAdicional > 0);
          } else {
            /**
             * NORMAL / URGENTE
             */
            aInsumoT = aInsumoT.filter((o) => o.CantSfraccUmbEdit > 0);
          }

          if (!aInsumoT.length) {
            return [];
          }

          var oPedido,
            oHistorial,
            aNewOrden = [],
            aNewFraccion = [],
            aNewInsumo = [],
            aNewPedidoOrden = [];

          /**
           * PEDIDO
           * HISTORIAL
           */
          oPedido = that._buildNewPedido(oConstant);
          oHistorial = that._buildNewHistorial(oPedido, oConstant, "");

          /**
           * ORDEN
           */
          var aOrdenT = aOrdenFracT.reduce(function (r, a) {
            var sKey = a.Aufnr;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));

          for (var key in aOrdenT) {
            var oNewOrden = that._buildNewOrden(aOrdenT[key][0]);

            for (var oOrden of aOrdenT[key]) {
              /**
               * FRACCION
               */
              var aFraccionT = aInsumoT.filter((o) => {
                return o.Aufnr == oOrden.Aufnr && o.Fracc == oOrden.Fracc;
              });
              aFraccionT = that._getUniqueArray(aFraccionT, ["Aufnr", "Fracc"]);

              for (var oFraccion of aFraccionT) {
                var oNewFraccion = that._buildNewFraccion(oFraccion);
                oNewFraccion.oOrden_ordenId = oNewOrden.ordenId;
                //oNewFraccion.oSala_salaPesajeId = oParam.tipoPedidoParams.keySala;
                oNewFraccion.oEstado_iMaestraId =
                  oConstant.oEstadoOrden.iMaestraId;

                /**
                 * INSUMO
                 */
                var aInsumo = aInsumoT.filter((o) => {
                  return (
                    o.Aufnr == oFraccion.Aufnr && o.Fracc == oFraccion.Fracc
                  );
                });
                for (var oInsumo of aInsumo) {
                  var oNewInsumo = that._buildNewInsumo(oInsumo);
                  oNewInsumo.oOrdenFraccion_ordenFraccionId =
                    oNewFraccion.ordenFraccionId;
                  //oNewInsumo.oSala_salaPesajeId = oParam.tipoPedidoParams.keySala;
                  oNewInsumo.oEstado_iMaestraId =
                    oConstant.oEstadoOrdenDet.iMaestraId;

                  aNewInsumo.push(oNewInsumo);
                }

                aNewFraccion.push(oNewFraccion);
              }
            }
            aNewOrden.push(oNewOrden);
          }
          /**
           * PEDIDO_ORDEN
           */
          aNewPedidoOrden = that._buildNewPedidoOrden(oPedido, aNewOrden);

          for (var o of aNewInsumo) {
            /**
             * Calcular Cantidad Sugerida Total
             */
            var cantSugeridaTotal = 0;
            for (var b of aNewInsumo.filter((c) => {
              return (
                //c.Aufnr == o.Aufnr &&
                c.reservaNum == o.reservaNum &&
                +c.ordenPos == +o.ordenPos &&
                c.codigoInsumo == o.codigoInsumo &&
                c.lote == o.lote
              );
            })) {
              cantSugeridaTotal = cantSugeridaTotal + +b.cantSugerida;
            }
            o.cantSugeridaTotal = that._getValueDec(cantSugeridaTotal);
          }
          return [].concat(
            [oPedido],
            [oHistorial],
            aNewOrden,
            aNewFraccion,
            aNewInsumo,
            aNewPedidoOrden
          );
        },

        _buildNewHistorial: function (oPedido, oConstant, descr) {
          var oEntity = {
            historialId: formatter.uuidv4(),
            descripcion: descr ? descr : "Estado Inicial",
            oPedido_pedidoId: oPedido.pedidoId,
            oEstadoAct_iMaestraId: oConstant.oEstadoPedido
              ? oConstant.oEstadoPedido.iMaestraId
              : oConstant.iMaestraId,
            oEstadoAnt_iMaestraId: oConstant.oEstadoPedido
              ? oConstant.oEstadoPedido.iMaestraId
              : oPedido.pedidoEstadoId,
            usuario: that.sUser,
            sEntity: "HISTORIAL",
          };

          var oHistorial = null;
          if (oConstant.oAuditStruct) {
            oEntity.fechaActualiza = new Date();
            oEntity.usuarioActualiza = that.sUser;
            oHistorial = { ...oEntity, ...oConstant.oAuditStruct };
          } else {
            oEntity.terminal = "";
            oEntity.activo = true;
            oEntity.fechaRegistro = new Date();
            oEntity.usuarioRegistro = that.sUser;
            oHistorial = oEntity;
          }

          return oHistorial;
        },

        _buildNewPedido: function (oConstant) {
          /**
           * SALA, CENTRO Y TIPO DE PEDIDO
           */
          var oPedidoAtencion = that.getModel("PedidoModel").getData();
          var sTipoPedidoDet = oPedidoAtencion.keyTipoPedido;
          var sCentro = oPedidoAtencion.tipoPedidoParams.keyCentro;
          //var sSala = oPedidoAtencion.tipoPedidoParams.keySala;
          var sMotivo = oPedidoAtencion.tipoPedidoParams.keyMotivo;

          var aTipoPedidoDetalleList = that
            .getModel("TipoPedidoDetalleListModel")
            .getData();

          var oTipoPedidoDet = "";
          for (var i = 0; i < aTipoPedidoDetalleList.length; i++) {
            var oItem = aTipoPedidoDetalleList[i];
            if (oItem.codigo == sTipoPedidoDet) {
              oTipoPedidoDet = oItem;
              break;
            }
          }

          var sUUID = formatter.uuidv4();
          var sUniqueID = uid().split("-")[1];
          var oEntity = {
            pedidoId: sUUID,
            numPedido: sUniqueID,
            centro: sCentro,
            //oSala_salaPesajeId: sSala,
            oEstado_iMaestraId: oConstant.oEstadoPedido.iMaestraId,
            oMotivo_iMaestraId: sMotivo ? +sMotivo : null,
            oTipoPedidoDetalle_tPedidoDetId: oTipoPedidoDet.tPedidoDetId,
            sEntity: "PEDIDO",
          };

          var oPedido = { ...oEntity, ...oConstant.oAuditStruct };

          delete oPedido.dml;
          delete oPedido.keyEntity;

          return oPedido;
        },

        _buildNewOrden: function (oData) {
          var that = this;
          var oAudit = that._buildAudit("C");
          var sUUID = formatter.uuidv4();
          var o = {
            ordenId: sUUID,
            reservaNum: that._getValue(oData.Rsnum),
            numero: that._getValue(oData.Aufnr),
            lote: that._getValue(oData.Charg),
            fechaVencimiento: oData.Vfdat ? oData.Vfdat : null,
            clasOrdProd: that._getValue(oData.Auart),
            codProdTerm: that._getValue(oData.Plnbez),
            nomProdTerm: that._getValue(oData.Maktx),
            reservaIDE: that._getValue(oData.ReservaIde) === "" ? "" : "X",
            fecLibera: that._getValue(oData.Ftrmi),
            respLibera: that._getValue(oData.Ernam),
            fecFabric: that._getValue(oData.Ftrmi),
            nivelFab: that._getValue(oData.Nfabr),
            envase: that._getValue(oData.Nenvs),
            fecEnvase: that._getValue(oData.Fenva),
            acondicionado: that._getValue(oData.Acond),
            fecAcondic: that._getValue(oData.Facon),
            seccion: that._getValue(oData.Txt),
            tamanoLote: that._getValue(oData.Bstfe),
            estadoOrdenErp: that._getValue(oData.Stat),
            centro: that._getValue(oData.Werks),
            sEntity: "ORDEN",
          };
          return { ...o, ...oAudit };
        },

        _buildNewFraccion: function (oData) {
          var that = this;
          var oAudit = that._buildAudit("C");
          var sUUID = formatter.uuidv4();
          var o = {
            ordenFraccionId: sUUID,
            oEstado_iMaestraId: null,
            oSala_salaPesajeId: null,
            oOrden_ordenId: null,
            ordenPos: that._getValue(oData.Posnr),
            numFraccion: that._getValue(oData.Fracc),
            reservaNum: that._getValue(oData.Rsnum),
            sEntity: "ORDEN_FRACCION",
          };
          return { ...o, ...oAudit };
        },

        _buildNewInsumo: function (oData) {
          /*
                  ZEWMS_FRACC-AUFNR           Aufnr           Orden   
                  ZEWMS_FRACC-POSNR           Posnr           Posición    Número de posición de la orden    
                  ZEWMS_FRACC-RSNUM           Rsnum           Número de reserva   
                  ZEWMS_FRACC-RSPOS           Rspos           Posición    Número de posición de reserva   
                  ZEWMS_FRACC-POTX1           Potx1           Texto con el detalle de las fracciones    
                  ZEWMS_FRACC-POTX2           Potx2           Texto de posición de lista de materiales (línea 2)    
                  ZEWMS_FRACC-MATNR           Matnr           Material    
                  ZEWMS_FRACC-MAKTX           Maktx           Descripción Material    
                  ZEWMS_FRACC-CHARG           Charg           Lote    
                  ZEWMS_FRACC-CANT_REQ        CantReq         Cantidad Requerida    cantidad de la lista de materiales    
                  ZEWMS_FRACC-UM_REQ          UmReq           UM    
                  ZEWMS_FRACC-CANT_RES        CantRes         Cantidad de la Reserva    
                  ZEWMS_FRACC-UM_RES          UmRes           UM    unidad de medida base   
                  ZEWMS_FRACC-CANT_RES_UPO    CantResUpo      Cantidad de la Reserva UM Orden   cantidad en Ta unidad de potencia   
                  ZEWMS_FRACC-UM_POT          UmPot           UM    unidad de medida con potencia   
                  ZEWMS_FRACC-FECHA           Fecha           Fecha   
                  ZEWMS_FRACC-WERKS           Werks           Centro    
                  ZEWMS_FRACC-LGORT           Lgort           Almacén   
                  ZEWMS_FRACC-FRACC           Fracc           Fracción
                  ZEWMS_FRACC-SUBFRACC        Subfracc        Subfracción
                  ZEWMS_FRACC-CHARG2          Charg2          Lote 2    
                  ZEWMS_FRACC-CANT_SFRACC_UMB CantSfraccUmb   Cantidad subfracción (cantidad sugerida)    
                  ZEWMS_FRACC-UMB_SFRACC      UmbSfracc       UM en la unidad de medida base    
                  ZEWMS_FRACC-CANT_SFRACC_UMP CantSfraccUmp   Cantidad subfracción (cantidad sugerida)    
                  ZEWMS_FRACC-UMP_SFRACC      UmpSfracc       UM    en la unidad de medida con potencia   
                */
          var that = this;
          var oAudit = that._buildAudit("C");
          var sUUID = formatter.uuidv4();
          var o = {
            ordenDetalleId: sUUID,
            oEstado_iMaestraId: null,
            oSala_salaPesajeId: null,
            numSubFraccion: that._getValue(oData.Subfracc),
            sugerido: that._getValueDec(oData.CantSfraccUmbEdit),
            cantPedida: that._getValueDec(oData.CantSfraccUmbEdit),
            requerido: that._getValueDec(oData.CantReq),
            agotar: oData.Agotar ? "X" : "",
            oOrdenFraccion_ordenFraccionId: null,
            ordenPos: that._getValue(oData.Posnr),
            reservaNum: that._getValue(oData.Rsnum),
            reservaPos: that._getValue(oData.Rspos),
            codigoInsumo: that._getValue(oData.Matnr),
            descripcion: that._getValue(oData.Maktx),
            lote: oData.Charg2
              ? that._getValue(oData.Charg2)
              : that._getValue(oData.Charg),
            centro: that._getValue(oData.Werks),
            almacen: that._getValue(oData.Lgort),
            cantSugerida: that._getValueDec(oData.CantSfraccUmb),
            cantSugeridaTotal: that._getValueDec(oData.CantSfraccUmbTotal),
            unidad: that._getValue(oData.UmbSfracc),
            cantSugeridaPot: that._getValueDec(oData.CantSfraccUmp),
            unidadPot: that._getValue(oData.UmpSfracc),
            cantRequerida: that._getValueDec(oData.CantReq),
            cantRequeridaUM: that._getValue(oData.UmReq),
            cantReservada: that._getValueDec(oData.CantRes),
            cantReservadaUM: that._getValue(oData.UmRes),
            cantReservadaPot: that._getValueDec(oData.CantResUpo),
            cantReservadaPotUM: that._getValue(oData.UmPot),
            fechaVencimiento: that._getValue(oData.FeCaduc),
            cantCompromet: that._getValue(oData.AvailQty1),
            stockLibrUtil: that._getValue(oData.Clabs),
            stockATP: formatter.getResta(oData.Clabs, oData.AvailQty1),
            glosa: that._getValue(oData.Glos2),
            textCalPot: that._getValue(oData.Potx2Equiv),
            pTInsumo: that._getValue(oData.Pteor),
            pPLoteLog: that._getValue(oData.Pprac),
            indMat: that._getValue(oData.Potx2Equiv),
            indOrdenFab: that._getValue(oData.Potx1),
            cantResUpo: that._getValueDec(oData.CantResUpo),
            umPot: that._getValue(oData.UmPot),
            sEntity: "ORDEN_DETALLE",
          };

          if (oData.CantAdicional) {
            /**
             * INDIVIDUAL / URGENTE
             */
            o.sugerido = that._getValueDec(oData.CantAdicional);
            o.cantPedida = that._getValueDec(oData.CantAdicional);
            o.unidad = that._getValue(oData.Meins);
          }

          if (!oData.CantSfraccUmb) {
            /**
             * RESERVAS IDE
             */
            o.cantSugerida = that._getValueDec(oData.CantSugerida);
            o.sugerido = that._getValueDec(oData.CantSugeridaEdit);
            o.cantPedida = that._getValueDec(oData.CantSugeridaEdit);
            o.unidad = that._getValue(oData.Meins);
          }

          return { ...o, ...oAudit };
        },

        _buildNewPedidoOrden: function (oPedido, aNewOrden) {
          var that = this;
          var a = [];
          var oAudit = that._buildAudit("C");
          for (var oItem of aNewOrden) {
            var o = {
              oPedido_pedidoId: oPedido.pedidoId,
              oOrden_ordenId: oItem.ordenId,
              sEntity: "PEDIDO_ORDEN",
            };
            a.push({ ...o, ...oAudit });
          }
          return a;
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

        _buildEnitiesPedidoIDE: function () {
          var that = this;
          var aInsumoT = that.getModel("ReservaListModel").getData();
          var oParam = that.getModel("PedidoModel").getData();
          var oConstant = that._getConstant();
          var oPedido,
            oHistorial,
            aNewOrden = [],
            aNewFraccion = [],
            aNewInsumo = [],
            aNewPedidoOrden = [];

          var checkLote;
          aInsumoT = aInsumoT.filter((o) => {
            /**
             * 1: Filtrar registros cuya cantidad seguridad es mayor a CERO
             */
            return +o.CantSugeridaEdit > 0;
          });

          aInsumoT.forEach((o) => {
            /**
             * 1: Validar que todos los insumos tengal LOTE
             * 2: Cantidad Sugerida mayor a Cero
             */
            o.Aufnr = o.Rsnum;
            o.Fracc = 1;

            if (!o.Charg || +o.CantSugeridaEdit <= 0) {
              checkLote = o;
              return false;
            }
          });

          if (checkLote) {
            return MessageBox.error(
              "La Reserva (" +
                checkLote.Aufnr +
                ") tiene insumos sin lotes o la cantidad sugerida es menor/igual a Cero."
            );
          }

          /**
           * PEDIDO
           * HISTORIAL
           */
          oPedido = that._buildNewPedido(oConstant);
          oHistorial = that._buildNewHistorial(oPedido, oConstant, "");

          /**
           * ORDEN
           */
          var aOrdenFracT = that._getUniqueArray(aInsumoT, ["Aufnr", "Fracc"]);
          var aOrdenT = aOrdenFracT.reduce(function (r, a) {
            var sKey = a.Aufnr;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));

          for (var key in aOrdenT) {
            var oNewOrden = that._buildNewOrden(aOrdenT[key][0]);
            oNewOrden.reservaIDE = "X";
            oNewOrden.numero = aOrdenT[key][0].Rsnum;
            oNewOrden.reservaNum = aOrdenT[key][0].Rsnum;
            oNewOrden.codProdTerm = "";
            oNewOrden.nomProdTerm = "";
            oNewOrden.lote = "";

            for (var oOrden of aOrdenT[key]) {
              /**
               * FRACCION
               */
              var aFraccionT = aInsumoT.filter((o) => {
                return o.Aufnr == oOrden.Aufnr && o.Fracc == oOrden.Fracc;
              });
              aFraccionT = that._getUniqueArray(aFraccionT, ["Aufnr", "Fracc"]);

              for (var oFraccion of aFraccionT) {
                var oNewFraccion = that._buildNewFraccion(oFraccion);
                oNewFraccion.oOrden_ordenId = oNewOrden.ordenId;
                //oNewFraccion.oSala_salaPesajeId = oParam.tipoPedidoParams.keySala;
                oNewFraccion.oEstado_iMaestraId =
                  oConstant.oEstadoOrden.iMaestraId;
                oNewFraccion.ordenPos = oFraccion.Rspos;

                /**
                 * INSUMO
                 */
                var aInsumo = aInsumoT.filter((o) => {
                  return (
                    o.Aufnr == oFraccion.Aufnr && o.Fracc == oFraccion.Fracc
                  );
                });
                for (var oInsumo of aInsumo) {
                  var oNewInsumo = that._buildNewInsumo(oInsumo);
                  oNewInsumo.oOrdenFraccion_ordenFraccionId =
                    oNewFraccion.ordenFraccionId;
                  //oNewInsumo.oSala_salaPesajeId = oParam.tipoPedidoParams.keySala;
                  oNewInsumo.oEstado_iMaestraId =
                    oConstant.oEstadoOrdenDet.iMaestraId;
                  oNewInsumo.numSubFraccion = 1;

                  aNewInsumo.push(oNewInsumo);
                }

                aNewFraccion.push(oNewFraccion);
              }
            }
            aNewOrden.push(oNewOrden);
          }

          /**
           * PEDIDO_ORDEN
           */
          aNewPedidoOrden = that._buildNewPedidoOrden(oPedido, aNewOrden);

          for (var o of aNewInsumo) {
            /**
             * Calcular Cantidad Sugerida Total
             */
            var cantSugeridaTotal = 0;
            for (var b of aNewInsumo.filter((c) => {
              return (
                //c.Aufnr == o.Aufnr &&
                c.reservaNum == o.reservaNum &&
                +c.ordenPos == +o.ordenPos &&
                c.codigoInsumo == o.codigoInsumo &&
                c.lote == o.lote
              );
            })) {
              cantSugeridaTotal = cantSugeridaTotal + +b.cantSugerida;
            }
            o.cantSugeridaTotal = that._getValueDec(cantSugeridaTotal);
          }
          return [].concat(
            [oPedido],
            [oHistorial],
            aNewOrden,
            aNewFraccion,
            aNewInsumo,
            aNewPedidoOrden
          );
        },

        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("AMPAOWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "CREAR":
              bValid = sRol.includes("AMPACREA");
              break;
            case "USUARIO":
              bValid = sRol.includes("AMPAAUSU");
              break;
            case "BLOQUEO":
              bValid = sRol.includes("AMPABLOQ");
              break;
            case "ANULAR":
              bValid = sRol.includes("AMPAANUL");
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

        /**-----------------------------------------------*/
        /*         F R A G M E N T S / D I A L O G S
              /**-----------------------------------------------*/

        onOpenDialogOR: async function (oEvent, sTipo) {
          var oSource = oEvent.getSource();
          var sModelName = "";
          if (["Individual", "Normal"].includes(sTipo)) {
            sModelName = "OrdenInsumoListModel";
          } else if (sTipo === "ReservaIDE") {
            sModelName = "ReservaListModel";
          } else if (sTipo === "View") {
            sModelName = "ViewPedidoDetalleModel";
          }
          var oObject = oSource.getBindingContext(sModelName).getObject();

          var aFilters = [];

          aFilters.push(new Filter("MaterialIns", EQ, oObject.Matnr));
          aFilters.push(new Filter("NumLoteIns", EQ, oObject.Charg));

          var aComprometida = await that
            ._getODataDinamic(
              that.oModelErp,
              "CantComprometidaSet",
              {},
              aFilters
            )
            .catch((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              var oResp = JSON.parse(oResult.responseText);
              MessageBox.error(oResp.error.message.value);
            });

          if (aComprometida && aComprometida.length) {
            that.getModel("ComprometidaDetailModel").setData(aComprometida);
            this._openDialogDinamic("OrdenReservada");
          }
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

          return new Promise(async function (resolve, reject) {
            sap.ui.core.BusyIndicator.show(0);
            await oDataService
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

          sap.ui.core.BusyIndicator.show(0);
          sap.ui.core.BusyIndicator.hide();
        },

        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },

        onCloseDialog: function (oEvent) {
          sap.ui.core.BusyIndicator.hide();
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },

        onPressClose: function (oEvent) {
          var oSource = oEvent.getSource();
          var oParent = oSource.getParent();
          oParent.close();
        },

        onCloseDialogUA: function (oEvent) {
          this.byId("idPedidoList").getBinding().refresh(true);
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },

        /**-----------------------------------------------*/
        /*              C O N S T A N T S
              /**-----------------------------------------------*/
        _subFilterOrden: function (oTableOrdenes, aParameter) {
          var oFilter = "",
            aFiltersOrdenes = [],
            oFinalFilter;
          aParameter.forEach((oElementoFiltro) => {
            oFilter = "";
            if (
              oElementoFiltro.data().controlType === "ComboBox" &&
              oElementoFiltro.getSelectedKey() !== ""
            ) {
              oFilter = new Filter(
                oElementoFiltro.data().controlPath,
                EQ,
                oElementoFiltro.getSelectedKey()
              );
            } else if (
              oElementoFiltro.data().controlType === "Input" &&
              oElementoFiltro.getValue() !== "" &&
              oElementoFiltro.data().controlPath !== "usuario"
            ) {
              oFilter = new Filter(
                oElementoFiltro.data().controlPath,
                CONTAINS,
                oElementoFiltro.getValue()
              );
            } else if (
              oElementoFiltro.data().controlType === "DateRange" &&
              oElementoFiltro.getDateValue() !== null
            ) {
              oFilter = new Filter(
                oElementoFiltro.data().controlPath,
                FilterOperator.LE,
                oElementoFiltro.getDateValue()
              );
            }

            if (oFilter !== "") aFiltersOrdenes.push(oFilter);
          });

          if (aFiltersOrdenes.length !== 0) {
            oFinalFilter = new Filter({
              filters: aFiltersOrdenes,
              and: true,
            });
            oTableOrdenes.getBinding().filter(oFinalFilter);
            oTableOrdenes.getBinding().refresh(true);
          }
        },

        _reservaFilter: function (aOrdenes) {
          var sKeyTipoPedido = this.getView()
            .getModel("PedidoModel")
            .getProperty("/keyTipoPedido");

          var aTipoPedido = [
            { sTipo: CONSTANT.ADIC, iFrom: "002000", iTo: "002300" },
            { sTipo: CONSTANT.INDI, iFrom: "001000", iTo: "001300" },
          ];

          var oTipoPedido = aTipoPedido.find((d) => d.sTipo == sKeyTipoPedido);
          if ([CONSTANT.ADIC, CONSTANT.INDI].includes(sKeyTipoPedido)) {
            aOrdenes = aOrdenes.filter(
              (o) =>
                +o.Posnr >= +oTipoPedido.iFrom && +o.Posnr <= +oTipoPedido.iTo
            );
          } else {
            aTipoPedido.forEach(function (a) {
              aOrdenes = aOrdenes.filter(
                (o) => !(+o.Posnr >= +a.iFrom && +o.Posnr <= +a.iTo)
              );
            });
          }

          return aOrdenes;
        },

        _addConstantFilter: function (queryText) {
          var aFilters = [];
          if (queryText) {
            aFilters.push(
              new Filter(
                [
                  new Filter("oUsuario/usuario", CONTAINS, queryText),
                  new Filter("oUsuario/nombre", CONTAINS, queryText),
                ],
                false
              )
            );
          } else {
            aFilters = null;
          }
          return aFilters;
        },

        _FilterStatusLib: function (aOrden) {
          var oParameters = that.getView().getModel("PedidoModel").getData();
          var aOrdenFilter = [];
          if (aOrden && aOrden.length) {
            /**
             * AGRUPAR ORDENES POR AUFNR
             */
            var aOrdenGroup = aOrden.reduce(function (r, a) {
              var sKey = a.Aufnr + "" + a.Posnr;
              r[sKey] = r[sKey] || [];
              r[sKey].push(a);
              return r;
            }, Object.create(null));

            /**
             * VALIDAR QUE LAS ORDENES ESTEN LIBERADOS: I0002 Y NO QUE TENGAN EL ESTADO I0009, I0010, I0045, I0321
             */

            for (var key in aOrdenGroup) {
              var aItem = aOrdenGroup[key];
              var aOrdenI002 = [];
              var aOrdenStat = [];
              aItem.forEach((o) => {
                aOrdenStat.push(o.Stat);
                if (o.Stat === "I0002") {
                  //Liberados (LIB.)
                  aOrdenI002.push(o);
                }
              });
              var sStatus = aOrdenStat.join(",");
              if (oParameters.keyTipoPedido == CONSTANT.ADIC) {
                /**
                 * Excluciones para
                 * PEDIDO ADICIONAL
                 */
                if (
                  sStatus.includes("I0009") || //Notificado (NOTI)
                  //sStatus.includes("I0010") || //Notificado Parcial (NOTP)
                  sStatus.includes("I0045") || //Cerrada Tecnicamente (CTEC)
                  sStatus.includes("I0321") // Movimiento Mercarcia EJecutado (MOV)
                ) {
                  aOrdenI002 = [];
                }
              } else {
                if (
                  sStatus.includes("I0009") || //Notificado (NOTI)
                  //sStatus.includes("I0010") || //Notificado Parcial (NOTP)
                  sStatus.includes("I0045") || //Cerrada Tecnicamente (CTEC)
                  sStatus.includes("I0321") // Movimiento Mercarcia EJecutado (MOV)
                ) {
                  aOrdenI002 = [];
                }
              }
              aOrdenFilter = aOrdenFilter.concat(aOrdenI002);
            }
          }

          aOrdenFilter = that._getUniqueArray(aOrdenFilter, ["Aufnr", "Posnr"]);
          return aOrdenFilter;
        },

        _getConstant: function () {
          var that = this;
          var oMaestraList = that.getModel("MaestraModel").getData();
          var oConstant = {
            oEstadoPedido: oMaestraList[CONSTANT.ESTADO_PEDIDO].find(
              //ESTADO CP PEDIDO
              (o) => o.codigo === CONSTANT.PPEND
            ),
            oEstadoOrden: oMaestraList[CONSTANT.ESTADO_ORDEN].find(
              //ESTADO CP PEDIDO DETALLE (ORDEN)
              (o) => o.codigo === CONSTANT.OPEND
            ),
            oEstadoOrdenDet: oMaestraList[CONSTANT.ESTADO_INSUMO].find(
              //ESTADO CP PEDIDO ORDEN  PROD. ITEM (INSUMO)
              (o) => o.codigo === CONSTANT.IPEPI
            ),
            oTipoOrdPro: oMaestraList["TORDEN"].find((o) => o.codigo === "261"),
            oTipoOrdRes: oMaestraList["TORDEN"].find((o) => o.codigo === "201"),
            oAuditStruct: that._buildAudit("C"),
          };

          return oConstant;
        },

        _buildAudit: function (sDml) {
          var that = this;
          var oAudit = {};
          if (sDml == "C") {
            oAudit = {
              /*--- auditoriaBase ---*/
              terminal: "",
              fechaRegistro: new Date(),
              usuarioRegistro: that.sUser,
              activo: true,
            };
          } else if (sDml == "U") {
            oAudit = {
              /*--- auditoriaBase ---*/
              usuarioActualiza: that.sUser,
              fechaActualiza: new Date(),
            };
          }

          return oAudit;
        },

        _resetModel: function () {
          var oOrdenSelectedItemsModel = that.getModel(
            "OrdenSelectedItemsModel"
          );
          oOrdenSelectedItemsModel.setData([]);
          oOrdenSelectedItemsModel.refresh(true);
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

        doMessageboxAction: function () {
          return new Promise(function (resolve, reject) {
            MessageBox.warning(
              "Si cambia este parametro se eliminaran todos los registros existentes.",
              {
                icon: MessageBox.Icon.INFORMATION,
                title: "¿Confirmar Cambio?",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  resolve(oAction);
                },
              }
            );
          });
        },

        doMessageboxActionCustom: function (sMessage) {
          return new Promise(function (resolve, reject) {
            MessageBox.warning(sMessage, {
              icon: MessageBox.Icon.INFORMATION,
              title: "¿Confirmar?",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                resolve(oAction);
              },
            });
          });
        },

        doMessageBoxInputCustom: function (sMessage) {
          return new Promise(function (resolve, reject) {
            if (!that.oSubmitDialog) {
              that.oSubmitDialog = new Dialog({
                type: DialogType.Message,
                title: "Confirmar",
                content: [
                  new Label({
                    text: sMessage,
                    labelFor: "submissionNote",
                  }),
                  new TextArea("submissionNote", {
                    width: "100%",
                    placeholder:
                      "Comentanos por que esta realizando esta acción.",
                    liveChange: function (oEvent) {
                      var sText = oEvent.getParameter("value");
                      that.oSubmitDialog
                        .getBeginButton()
                        .setEnabled(sText.length > 0);
                    }.bind(this),
                  }),
                ],
                beginButton: new Button({
                  type: ButtonType.Emphasized,
                  text: "SI",
                  enabled: false,
                  press: function () {
                    var sText = Core.byId("submissionNote").getValue();
                    Core.byId("submissionNote").setValue("");

                    resolve(sText);

                    that.oSubmitDialog.destroy();
                    delete that.oSubmitDialog;
                  }.bind(this),
                }),
                endButton: new Button({
                  text: "NO",
                  press: function () {
                    that.oSubmitDialog.destroy();
                    delete that.oSubmitDialog;
                    sap.ui.core.BusyIndicator.hide();
                    resolve("");
                  }.bind(this),
                }),
              });

              //Acceder al modelo global
              that.getView().addDependent(that.oSubmitDialog);
            }
            that.oSubmitDialog.open();
          });
        },

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
        _getODataDinamicSetModel: function (
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

                var oModel = new JSONModel(oResult.results);
                oModel.setSizeLimit(999999999);
                that.getView().setModel(oModel, sModelName);
                resolve(oResult.results);
              })
              .catch(function (oError) {
                console.log(oError);
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              });
          });
        },

        _getValue: function (sText) {
          var sValue = sText;
          if (!sText) sValue = "";

          return sValue;
        },

        _getValueDec: function (sText) {
          var sValue = sText;
          if (!sValue) sValue = "0.000";
          sValue = formatter.formatCoin(sValue);
          return sValue;
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
