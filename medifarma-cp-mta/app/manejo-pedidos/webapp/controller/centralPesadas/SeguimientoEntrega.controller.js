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
        GROL: "CPSC", //GRUPO ROL
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
      };
    const rootPath = "com.medifarma.cp.manejopedidos";
    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.centralPesadas.SeguimientoEntrega",
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
          that.setModel(new JSONModel({}), "SalasModel");
          that.setModel(new JSONModel({}), "FraccionDetalleModel");

          that.oRouter
            .getTarget("TargetSeguimientoEntrega")
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
              "VIEW_SEGUIMIENTO_CONSOLIDADO_CP",
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
            Title: "SEGIMIENTO CONSOLIDADO PEDIDO",
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
            that._getI18nText("clCodPT"), //"Codigo Producto",
            that._getI18nText("clDescPT"), //"Descripción Producto",
            that._getI18nText("clLotePT"), //"Lote Producto",
            that._getI18nText("dclSala"), //"Sala",
            that._getI18nText("clEstado"), //"Estado",
            that._getI18nText("dclVerificado"), //"Verificado",
            that._getI18nText("lblTamanoLote"), //"Tamaño Lote",

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
              report.estadoOrden,
              formatter.textStatusVerif(report.ordenVerificacionEstado),
              report.tamanoLote,

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

          XLSX.writeFile(wb, "SEGIMIENTO CONSOLIDADO PEDIDO.xlsx");
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

            that._getI18nText("clPosnr"),
            that._getI18nText("clSubFraccion"),
            that._getI18nText("lblCodigoInsumo"),
            that._getI18nText("lblLoteInsumo"),
            that._getI18nText("clDescripcion"),
            that._getI18nText("clEstado"),
            that._getI18nText("dclVerificado"),
            that._getI18nText("clPotenciaTeorica"),
            that._getI18nText("clPotenciaPractica"),
            that._getI18nText("clUnidad"),
            that._getI18nText("clCantReq"),
            that._getI18nText("clUnidad"),
            that._getI18nText("dclCantSugTotal"),
            that._getI18nText("dclCantSug"),
            that._getI18nText("clCantPed"),
            that._getI18nText("dclAgotar"),
            that._getI18nText("clCant") + " Entero",
            that._getI18nText("clCant") + " Saldo",
            that._getI18nText("clCant") + " IFA",
            that._getI18nText("clCantAtenTotal"),
            that._getI18nText("clCantAtenTotalFrac"),
            that._getI18nText("clCantEntregada"),
            that._getI18nText("clIndListMat"),
            that._getI18nText("clIndOrdFab"),
            that._getI18nText("dclAlmacen"),
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
            that._getI18nText("clIndVerif"),
            that._getI18nText("clPesoNeto"),
            that._getI18nText("clTara"),
            that._getI18nText("clPesoBruto"),
            that._getI18nText("clUnidad"),
            that._getI18nText("clUsuRegistro"),
            that._getI18nText("clFecRegistro"),
            that._getI18nText("clHorRegistro"),
            that._getI18nText("clUsuEntregaFis"),
            that._getI18nText("clFecEntregaFis"),
            that._getI18nText("clHoraEntregaFis"),
            that._getI18nText("clEstadoEntregaFis"),
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

              report.ordenPos,
              report.numSubFraccion,
              report.codigoInsumo,
              report.lote,
              report.descripcion,
              report.insumoEstadoDes,
              formatter.textStatusVerif(report.verificacionEstado),
              formatter.formatWeightString(report.pTInsumo),
              formatter.formatWeightString(report.pPLoteLog),
              report.unidad,
              formatter.formatWeight(report.cantRequerida),
              report.cantRequeridaUM,
              formatter.formatWeight(report.cantSugeridaTotal),
              formatter.formatWeight(report.cantSugerida),
              formatter.formatWeight(report.sugerido),
              report.agotar == null || report.agotar == "" ? "No" : "Si",
              formatter.formatWeight(report.cantAtendida),
              formatter.formatWeight(report.cantAtendidaFrac),
              formatter.formatWeight(report.cantAtendidaIfa),
              formatter.formatWeight(report.clCantAtenTotal),
              formatter.formatWeight(report.cantAtendidaTotalF),
              formatter.formatWeight(report.cantEntregada),
              report.indMat,
              report.indOrdenFab,
              report.almacen,
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
                report.FlagVerif == null || report.FlagVerif == ""
                  ? "No"
                  : "Si",
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
                report.EntregaFisUsurio,
                formatter.getTimestampToDMY2(report.EntregaFisFecha),
                formatter.getMsToHMS(report.EntregaFisHora),
                report.StatusP,
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

          XLSX.writeFile(wb, "REPORTE INSUMO.xlsx");
        },

        onSearchFilter: async function (oEvent) {
          try {
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
              } else if (element.data().controlPath == "Pedido_fechaRegistro") {
                oFechaRegFrom = element.getFrom();
                oFechaRegTo = element.getTo();
              }
            }

            //VALIDACION DE CAMPOS VACIOS
            if (campoVacio) {
              //NO HAY CENTRO NI FECHA
              if (oCentro.length == 0 && (oFechaRegFrom == null || oFechaRegTo == null)) {
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
              if (oCentro.length == 0 && (oFechaRegFrom != null || oFechaRegTo != null)) {
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
              if (oCentro.length > 0 && (oFechaRegFrom == null || oFechaRegTo == null)) {
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
              if (oCentro.length > 0 && (oFechaRegFrom != null || oFechaRegTo != null)) {
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
            } else {
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

          var EQ = FilterOperator.EQ,
            aFilters = [],
            oUrlParameters = {};
          aFilters.push([
            // new Filter("ordenFraccionId", EQ, oData.ordenFraccionId)
            new Filter("pedidoId", EQ, oData.pedidoId),
            new Filter("ordenNumero", EQ, oData.numOrden),
          ]);

          oDataService
            .oDataRead(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              oUrlParameters,
              aFilters
            )
            .then((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              var oFilterInsumosTabla = oResult.results.filter(
                (e) => e.ordenFraccionId === oData.ordenFraccionId
              );
              var oFilterInsumosSuma = oResult.results;
              that.getModel("FraccionDetalleModel").getData().Insumos =
                oFilterInsumosTabla;

              that.getModel("FraccionDetalleModel").getData().InsumosSuma =
                oFilterInsumosSuma;
              that.getModel("FraccionDetalleModel").refresh(true);

              var oUrlParameters = {},
                EQ = FilterOperator.EQ,
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
              var aBulto = oResult.results,
                iSumaTotalF = 0;
              var aInsumos = that
                .getModel("FraccionDetalleModel")
                .getData().Insumos;
              var aInsumosSuma = that
                .getModel("FraccionDetalleModel")
                .getData().InsumosSuma;

              for (var key0 in aInsumos) {
                var oInsumo = aInsumos[key0];
                var aBultoFilter = [];

                var cantAtendidaEntero = 0;
                var cantAtendidaFracc = 0;
                var cantAtendidaIFA = 0;
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
                    ["ENTERO", "FRACCION", "IFA"].includes(oItem.Tipo)
                  ) {
                    if (oItem.FlagVerif == "X")
                      cantEntregada += +oItem.CantidadA;

                    if (["ENTERO"].includes(oItem.Tipo)) {
                      cantAtendidaEntero =
                        cantAtendidaEntero + +oItem.CantidadA;
                    } else if (["IFA"].includes(oItem.Tipo)) {
                      cantAtendidaIFA = cantAtendidaIFA + +oItem.CantidadA;
                    } else {
                      cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                    }
                    aBultoFilter.push(oItem);
                  }
                }

                oInsumo.cantEntregada = cantEntregada;
                oInsumo.cantAtendida = cantAtendidaEntero;
                oInsumo.cantAtendidaFrac = cantAtendidaFracc;
                oInsumo.cantAtendidaIFA = cantAtendidaIFA;

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

              var aInsumoData = that.onModificarInsumos(aInsumosSuma, aBulto);

              var ArrSeparador = [];
              aInsumoData.forEach(function (items) {
                // let tipoParada = listMotivos.find(e=>e.descripcion === items.tipoParada);
                // if(tipoParada){
                if (ArrSeparador.length === 0) {
                  ArrSeparador.push({
                    codigoInsumo: items.codigoInsumo ? items.codigoInsumo : "",
                    lote: items.lote ? items.lote : "",
                    sTotal: parseFloat(
                      formatter.getSuma(
                        items.cantAtendida,
                        items.cantAtendidaFrac,
                        0
                      )
                    ),
                  });
                } else {
                  var findArr = ArrSeparador.find(
                    (e) =>
                      e.codigoInsumo === items.codigoInsumo &&
                      e.lote === items.lote
                  );
                  if (findArr) {
                    findArr.sTotal =
                      findArr.sTotal +
                      parseFloat(
                        formatter.getSuma(
                          items.cantAtendida,
                          items.cantAtendidaFrac,
                          0
                        )
                      );
                  } else {
                    ArrSeparador.push({
                      codigoInsumo: items.codigoInsumo
                        ? items.codigoInsumo
                        : "",
                      lote: items.lote ? items.lote : "",
                      sTotal: parseFloat(
                        formatter.getSuma(
                          items.cantAtendida,
                          items.cantAtendidaFrac,
                          0
                        )
                      ),
                    });
                  }
                }
                // }
              });

              for (let index = 0; index < aInsumos.length; index++) {
                var element = aInsumos[index];
                var fCodInsumoLote = ArrSeparador.find(
                  (e) =>
                    e.codigoInsumo === element.codigoInsumo &&
                    e.lote === element.lote
                );
                if (fCodInsumoLote) {
                  element.cantAtendidaTotalF = formatter.formatWeight(
                    fCodInsumoLote.sTotal
                  );
                }
              }

              that.getModel("FraccionDetalleModel").refresh(true);
            })
            .catch((oError) => {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        onModificarInsumos: function (aInsumosSuma, aBulto) {
          for (var key0 in aInsumosSuma) {
            var oInsumo = aInsumosSuma[key0];
            var aBultoFilter = [];

            var cantAtendidaEntero = 0;
            var cantAtendidaFracc = 0;
            var cantAtendidaIFA = 0;
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
                ["ENTERO", "FRACCION", "IFA"].includes(oItem.Tipo)
              ) {
                if (oItem.FlagVerif == "X") cantEntregada += +oItem.CantidadA;

                if (["ENTERO"].includes(oItem.Tipo)) {
                  cantAtendidaEntero = cantAtendidaEntero + +oItem.CantidadA;
                } else if (["IFA"].includes(oItem.Tipo)) {
                  cantAtendidaIFA = cantAtendidaIFA + +oItem.CantidadA;
                } else {
                  cantAtendidaFracc = cantAtendidaFracc + +oItem.CantidadA;
                }

                aBultoFilter.push(oItem);
              }
            }

            oInsumo.cantEntregada = cantEntregada;
            oInsumo.cantAtendida = cantAtendidaEntero;
            oInsumo.cantAtendidaFrac = cantAtendidaFracc;
            oInsumo.cantAtendidaIFA = cantAtendidaIFA;

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
          return aInsumosSuma;
        },

        _resetModel: function () {
          var oOrdenSelectedItemsModel = that.getModel("FraccionDetalleModel");
          oOrdenSelectedItemsModel.setData([]);
          oOrdenSelectedItemsModel.refresh(true);
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
        _getI18nText: function (sText) {
          return this.oView.getModel("i18n") === undefined
            ? false
            : this.oView.getModel("i18n").getResourceBundle().getText(sText);
        },
      }
    );
  }
);
