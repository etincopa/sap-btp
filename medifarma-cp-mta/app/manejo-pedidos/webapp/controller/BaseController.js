sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "com/medifarma/cp/manejopedidos/service/oDataService",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    UIComponent,
    MessageBox,
    JSONModel,
    formatter,
    oDataService,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend(
      "com.medifarma.cp.manejopedidos.controller.BaseController",
      {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },
        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        getoDataModel: function (context) {
          var oModelErp = context.getOwnerComponent().getModel("sapErp");
          oModelErp.setHeaders({ "sap-language": "ES" });
          return oModelErp;
        },

        /**
         * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
         *
         * @public
         * @param {string} sI18nKey The key
         * @param {sap.ui.core.model.ResourceModel} oResourceModel The resource model
         * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
         * @returns {Promise<string>} The promise
         */
        getBundleTextByModel: function (
          sI18nKey,
          oResourceModel,
          aPlaceholderValues
        ) {
          //return oResourceModel.getResourceBundle().then(function (oBundle) {
          //    return oBundle.getText(sI18nKey, aPlaceholderValues);
          //});
        },
        // Mensajes de error.
        onErrorMessage: function (oError, textoI18n) {
          try {
            if (oError.responseJSON) {
              if (oError.responseJSON.error) {
                MessageBox.error(oError.responseJSON.error.message.value);
              } else {
                if (oError.responseJSON[0]) {
                  if (oError.responseJSON[0].description) {
                    MessageBox.error(oError.responseJSON[0].description);
                  } else {
                    //MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
                    MessageBox.error(this.i18nBundle.getText(textoI18n));
                  }
                } else {
                  if (oError.responseJSON.message) {
                    MessageBox.error(oError.responseJSON.message);
                  } else {
                    MessageBox.error(oError.responseJSON.response.description);
                  }
                }
              }
            } else if (oError.responseText) {
              try {
                if (oError.responseText) {
                  var oErrorRes = JSON.parse(oError.responseText),
                    sErrorDetails = oErrorRes.error.innererror.errordetails;
                  MessageBox.error(sErrorDetails[0].message);
                } else {
                  this.onErrorMessage("", "errorSave");
                }
              } catch (error) {
                MessageBox.error(oError.responseText);
              }
            } else if (oError.message) {
              MessageBox.error(oError.message);
            } else {
              MessageBox.error(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText(textoI18n)
              );
            }
          } catch (oErrorT) {
            this.onErrorMessage(oErrorT, "errorSave");
          }
        },
        getUserLogin: function () {
          var dataUser = {};
          try {
            dataUser.email = sap.ushell.Container.getService("UserInfo")
              .getUser()
              .getEmail();
          } catch (oError) {}

          if (!dataUser.email) {
            try {
              var userModel = new JSONModel();
              userModel.loadData("/services/userapi/attributes", null, false);
              dataUser = userModel.getData();
            } catch (oError) {}
          }

          if (
            dataUser.email === "DEFAULT_USER" ||
            dataUser.email === undefined
          ) {
            if (
              window.location.href.includes("workspaces") ||
              window.location.href.includes("webidecp") ||
              window.location.href.includes("localhost")
            ) {
              dataUser.email = "elvis.percy.garcia.tincopa@everis.com";
            }
          }

          return dataUser;
        },
        _addHoursToDate: function (objDate, intHours) {
          var numberOfMlSeconds = objDate.getTime();
          var addMlSeconds = intHours * 60 * 60000;
          var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);
          return newDateObj;
        },
        _subtractTimeFromDate: function (objDate, intHours) {
          var numberOfMlSeconds = objDate.getTime();
          var addMlSeconds = intHours * 60 * 60000;
          var newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
          return newDateObj;
        },
        _removeHourFromDate: function(date){
          return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
        },
        /**
         * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
         *
         * @public
         * @param {string} sI18nKey The key
         * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
         * @returns {Promise<string>} The promise
         */
        getBundleText: function (sI18nKey, aPlaceholderValues) {
          return this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText(sI18nKey, aPlaceholderValues);
          //return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
        },
        doMessageboxActionCustom: function (sTitle, sMessage, aOptionsBtn) {
          return new Promise(function (resolve, reject) {
            MessageBox.warning(sMessage, {
              icon: MessageBox.Icon.INFORMATION,
              title: sTitle,
              actions: aOptionsBtn,
              emphasizedAction: aOptionsBtn[0],
              //contentWidth: "40%",
              styleClass: "",
              onClose: function (oAction) {
                resolve(oAction);
              },
            });
          });
        },
        dynamicSort: function (property) {
          var sortOrder = 1;
          if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
          }
          return function (a, b) {
            var result =
              a[property] < b[property]
                ? -1
                : a[property] > b[property]
                ? 1
                : 0;
            return result * sortOrder;
          };
        },
        sortByAttribute: function (array, ...attrs) {
          let predicates = attrs.map((pred) => {
            let descending = pred.charAt(0) === "-" ? -1 : 1;
            pred = pred.replace(/^-/, "");
            return {
              getter: (o) => o[pred],
              descend: descending,
            };
          });
          // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
          return array
            .map((item) => {
              return {
                src: item,
                compareValues: predicates.map((predicate) =>
                  predicate.getter(item)
                ),
              };
            })
            .sort((o1, o2) => {
              let i = -1,
                result = 0;
              while (++i < predicates.length) {
                if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
                if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
                if ((result *= predicates[i].descend)) break;
              }
              return result;
            })
            .map((item) => item.src);
        },
        /**
         * Devuelve una matriz de objetos sin duplicados.
         * @param {Array} arr Array de Objetos
         * @param {Array} keyProps Array de keys para determinar la unicidad
         */
        _getUniqueArray: function (arr, keyProps) {
          return Object.values(
            arr.reduce((uniqueMap, entry) => {
              const key = keyProps.map((k) => entry[k]).join("|");
              if (!(key in uniqueMap)) uniqueMap[key] = entry;
              return uniqueMap;
            }, {})
          );
        },
        _uniqByKeepFirst: function (aData, key) {
          var seen = new Set();
          return aData.filter((item) => {
            var k = key(item);
            return seen.has(k) ? false : seen.add(k);
          });
        },
        _uniqByKeepLast: function (a, key) {
          return [...new Map(a.map((x) => [key(x), x])).values()];
        },
        _reduce: function (aData, sElement) {
          return aData.reduce(function (r, a) {
            var sKey = a[sElement];
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));
        },
        _getObjectMaxDateTime: function (aDate, mProperty) {
          return aDate
            .filter((o) => o[mProperty] != "0000-00-00 00:00:00")
            .reduce((a, b) => {
              return new Date(a[mProperty]) > new Date(b[mProperty]) ? a : b;
            });

          /*return new Date(
            Math.min(
              ...aDate
                .filter((o) => o[mProperty] != "0000-00-00 00:00:00")
                .map((a) => {
                  return new Date(a[mProperty]);
                })
            )
          );*/
        },
        _getObjectMinDateTime: function (aDate, mProperty) {
          return aDate
            .filter((o) => o[mProperty] != "0000-00-00 00:00:00")
            .reduce((a, b) => {
              return new Date(a[mProperty]) < new Date(b[mProperty]) ? a : b;
            });

          /*return new Date(
            Math.max(
              ...aDate
                .filter((o) => o[mProperty] != "0000-00-00 00:00:00")
                .map((a) => {
                  return new Date(a[mProperty]);
                })
            )
          );*/
        },
        _viewFormatPedidoConsolidado: function (aData) {
          var aPedidoFormat = [];

          /**
           * PEDIDO
           */
          var aPedido = this._reduce(aData, "pedidoId");
          for (var kPed in aPedido) {
            var oPedido = Object.assign({}, aPedido[kPed][0]);
            delete oPedido.__metadata;
            var aOrdenGroup = this._reduce(aPedido[kPed], "ordenId");

            var aOrden = [];
            /**
             * ORDEN
             */
            for (var kOrd in aOrdenGroup) {
              var oOrden = Object.assign({}, aOrdenGroup[kOrd][0]);
              delete oOrden.__metadata;
              var aFraccGroup = this._reduce(
                aOrdenGroup[kOrd],
                "ordenFraccionId"
              );

              var aFracc = [];
              /**
               * FRACCION
               */
              for (var kFrac in aFraccGroup) {
                var oFraccion = Object.assign({}, aFraccGroup[kFrac][0]);
                delete oFraccion.__metadata;
                var aInsumoGroup = this._reduce(
                  aFraccGroup[kFrac],
                  "ordenDetalleId"
                );

                var aInsumo = [];
                /**
                 * INSUMO
                 */
                for (var kIns in aInsumoGroup) {
                  var oIItem = Object.assign({}, aInsumoGroup[kIns][0]);
                  delete oIItem.__metadata;
                  aInsumo.push(oIItem);
                }

                oFraccion.aInsumo = aInsumo;
                aFracc.push(oFraccion);
              }

              oOrden.aFraccion = aFracc;
              aOrden.push(oOrden);
            }

            oPedido.aOrden = aOrden;
            aPedidoFormat.push(oPedido);
          }

          return aPedidoFormat;
        },
        _formatPedidoConsolidadoSet: function (aData) {
          var aPedidoFormat = [];

          /**
           * PEDIDO
           */
          var aPedido = this._reduce(aData, "PedidoNumero");
          for (var kPed in aPedido) {
            var oPedido = Object.assign({}, aPedido[kPed][0]);
            delete oPedido.__metadata;
            var aOrdenGroup = this._reduce(aPedido[kPed], "OrdenNumero");

            var aOrden = [];
            /**
             * ORDEN
             */
            for (var kOrd in aOrdenGroup) {
              var oOrden = Object.assign({}, aOrdenGroup[kOrd][0]);
              delete oOrden.__metadata;
              var aFraccGroup = this._reduce(
                aOrdenGroup[kOrd],
                "OrdenFraccion"
              );

              var aFracc = [];
              /**
               * FRACCION
               */
              for (var kFrac in aFraccGroup) {
                var oFraccion = Object.assign({}, aFraccGroup[kFrac][0]);
                delete oFraccion.__metadata;

                var aInsumo = [];
                /**
                 * INSUMO
                 */
                for (var kIns in aFraccGroup[kFrac]) {
                  var oIItem = Object.assign({}, aFraccGroup[kFrac][kIns]);
                  delete oIItem.__metadata;
                  aInsumo.push(oIItem);
                }

                var oIniPicking = this._getObjectMinDateTime(
                  aInsumo,
                  "PickingIniFecha"
                );
                var oFinPicking = this._getObjectMaxDateTime(
                  aInsumo,
                  "PickingFinFecha"
                );

                oFraccion.PickingIniUsuario = oIniPicking.PickingIniUsuario;
                oFraccion.PickingIniFecha = oIniPicking.PickingIniFecha;
                oFraccion.PickingFinUsuario = oFinPicking.PickingFinUsuario;
                oFraccion.PickingFinFecha = oFinPicking.PickingFinFecha;

                oFraccion.aInsumo = aInsumo;
                aFracc.push(oFraccion);
              }

              oOrden.aFraccion = aFracc;
              aOrden.push(oOrden);
            }

            oPedido.aOrden = aOrden;
            aPedidoFormat.push(oPedido);
          }

          return aPedidoFormat;
        },

        sendPedidoToErp: async function (that, pedidoId) {
          var aFilters = [];
          var EQ = FilterOperator.EQ;
          aFilters.push(new Filter("pedidoId", EQ, pedidoId));

          var aInsumoPedido = await that
            ._getODataDinamic(
              that.oModel,
              "VIEW_SEGUIMIENTO_DETALLE",
              {},
              aFilters
            )
            .catch((oError) => {
              console.log(oError);
              MessageBox.error(
                "(OnPrimise) Error al obtener detalles del pedido."
              );
            });

          if (aInsumoPedido && aInsumoPedido.length) {
            var oPedido = aInsumoPedido[0];

            aFilters = [];
            aFilters.push(new Filter("oPedido_pedidoId", EQ, oPedido.pedidoId));
            aFilters.push(new Filter("activo", EQ, true));
            var oUrlParameters = {
              $expand: "oUsuario",
            };

            var aRespUsuario = await oDataService
              .oDataRead(
                that.oModel,
                "PEDIDO_USUARIO",
                oUrlParameters,
                aFilters
              )
              .catch((oError) => {
                console.log(oError);
                MessageBox.error(
                  "(OnPrimise) Error al obtener usuarios asignados al pedido."
                );
              });
            aRespUsuario = aRespUsuario.results;

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
            for (var key in aInsumoPedido) {
              var oInsumo = aInsumoPedido[key];

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

                /**
                 * ORDEN FRACCION
                 */
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

            var oPedidoHead = {
              ...oPedidoErp,
              ...oPedidoUsuarioErp,
            };

            oPedidoHead.PEDIATENCSet = PEDIATENCSet;

            if (oPedidoHead) {
              var oRespSend = await oDataService
                .oDataCreate(that.oModelErp, "PEDIDOHEADSet", oPedidoHead)
                .catch((oError) => {
                  console.log(oError);
                  MessageBox.error(
                    "(OnPrimise) Error al enviar el pedido al servidor."
                  );
                });

              /*that.sendLogProcess(
                that.oModel,
                that.sUser,
                "*",
                "*",
                "sendPedidoToErp",
                "ENVIO PEDIDO",
                "I",
                "POST",
                "PEDIDOHEADSet",
                "",
                JSON.stringify(oPedidoHead ?? {}),
                JSON.stringify(oRespSend ?? {})
              );*/
            }
          }
        },

        sendLogProcess: function (
          oModel,
          usuario,
          modulo,
          subModulo,
          evento,
          accion,
          tipoLog,
          tipoRecurso,
          recurso,
          parameter,
          tramaEnvio,
          tramaRespuesta
        ) {
          try {
            var oAudit = {
              /*--- auditoriaBase ---*/
              terminal: "",
              fechaRegistro: new Date(),
              usuarioRegistro: usuario,
              activo: true,
            };

            var oEntity = {
              solucion: "CENTRAL PESADAS",
              capa: "FRONTEND",
              usuario: usuario,
              app: "MANEJO PEDIDO",
              modulo: modulo,
              subModulo: subModulo,
              evento: evento,
              accion: accion,
              tipoLog: tipoLog,
              tipoRecurso: tipoRecurso,
              recurso: recurso,
              parameter: parameter,
              tramaEnvio: tramaEnvio,
              tramaRespuesta: tramaRespuesta,
            };
            var oBody = { ...oEntity, ...oAudit };

            oDataService.oDataCreate(oModel, "LOG_PROCESS_APP", oBody);
          } catch (oError) {
            console.log(oEntity);
          }
        },
        validaFechaRegistro:function(desde, hasta, paramDays){
          var bOk = false;
          paramDays = paramDays ;
          desde = this._removeHourFromDate(desde);
          hasta = this._removeHourFromDate(hasta);
          var diffDays = hasta.getTime() - desde.getTime();
          var totalDays = Math.ceil(diffDays / (1000 * 3600 * 24));
          if(totalDays > paramDays){
            bOk = true;
          }
          return bOk;
        },

        searchFilter: async function(that, oSelectionSet, oFilter, oTablePedido, oTableOrden, aFiltersPedidos, aFiltersOrdenes, oFinalFilter){
          oSelectionSet.forEach((oElementoFiltro) => {
            oFilter = "";
            if (
              oElementoFiltro.data().controlType === "ComboBox" &&
              oElementoFiltro.getSelectedKey() !== ""
            ) {
              if (oElementoFiltro.data().operatorEq == "X") {
                oFilter = new Filter(
                  oElementoFiltro.data().controlPath,
                  FilterOperator.EQ,
                  parseInt(oElementoFiltro.getSelectedKey())
                );
              } else {
                oFilter = new Filter(
                  oElementoFiltro.data().controlPath,
                  FilterOperator.Contains,
                  oElementoFiltro.getSelectedKey()
                );
              }
            } else if (
              oElementoFiltro.data().controlType === "Input" &&
              oElementoFiltro.getValue() !== "" &&
              oElementoFiltro.data().controlPath !== "usuario"
            ) {
              oFilter = new Filter(
                oElementoFiltro.data().controlPath,
                FilterOperator.Contains,
                oElementoFiltro.getValue()
              );
            } else if (
              oElementoFiltro.data().controlType === "DateRange" &&
              oElementoFiltro.getFrom() !== null
            ) {
              var fechaDesde = oElementoFiltro.getFrom();
              var fechaHasta = oElementoFiltro.getTo();
              fechaDesde.setHours(0, 0, 0, 0);
              fechaHasta.setHours(23, 59, 59, 999);
              oFilter = new Filter(
                oElementoFiltro.data().controlPath,
                FilterOperator.BT,
                fechaDesde,
                fechaHasta
              );
            } else if (oElementoFiltro.data().controlType === "CheckBox") {
              if (oElementoFiltro.getSelected()) {
                oFilter = new Filter(
                  oElementoFiltro.data().controlPath,
                  FilterOperator.EQ,
                  oElementoFiltro.data().controlValue
                );
              }
            }
            if (
              oElementoFiltro.data().objectiveTable === "tablaPedidos" &&
              oFilter !== ""
            ) {
              aFiltersPedidos.push(oFilter);
            } else if (
              oElementoFiltro.data().objectiveTable === "tablaOrdenes" &&
              oFilter !== ""
            ) {
              aFiltersOrdenes.push(oFilter);
            }

            //USUARIOS EXCEPCION
            if (
              oElementoFiltro.data().controlPath === "usuario" &&
              oElementoFiltro.getValue() !== ""
            ) {
              var aUsuarioPedido = that.getView()
                  .getModel("UsuariosPedidosModel")
                  .getData(),
                auxArray = [],
                auxFilter;
              for (var i = 0; aUsuarioPedido.length > i; i++) {
                if (
                  aUsuarioPedido[i].oUsuario.usuario ===
                  oElementoFiltro.getValue()
                ) {
                  oFilter = new Filter(
                    "pedidoId",
                    FilterOperator.EQ,
                    aUsuarioPedido[i].oPedido.pedidoId
                  );
                  auxArray.push(oFilter);
                }
              }
              auxFilter = new Filter({
                filters: auxArray,
                and: false,
              });
              if (auxArray.length !== 0) {
                aFiltersPedidos.push(auxFilter);
              }
            }
          });
          //sap.ui.core.BusyIndicator.hide();
          if (aFiltersPedidos.length !== 0) {
            var aPedidoFilter = await that
              ._getODataDinamic(
                that.oModel,
                "VIEW_PEDIDO_FILTER_CP",
                {},
                aFiltersPedidos
              )
              .catch((oResult) => {
                sap.ui.core.BusyIndicator.hide();
                var oResp = JSON.parse(oResult.responseText);
                MessageBox.error(oResp.error.message.value);
              });

            aFiltersPedidos = [];
            if (aPedidoFilter && aPedidoFilter.length) {
              aPedidoFilter = that._uniqByKeepFirst(
                aPedidoFilter,
                (it) => it.pedidoId
              );

              for (var key in aPedidoFilter) {
                aFiltersPedidos.push(
                  new Filter("pedidoId", FilterOperator.EQ, aPedidoFilter[key].pedidoId)
                );
              }
            } else {
              aFiltersPedidos.push(new Filter("pedidoId", FilterOperator.EQ, "NONE"));
            }

            oFinalFilter = new Filter({
              filters: aFiltersPedidos,
              and: false,
            });
            
            oTablePedido.getBinding().filter(oFinalFilter);
          } else {
            oTablePedido.getBinding().filter();
          }

          if (aFiltersOrdenes.length !== 0) {
            oFinalFilter = new Filter({
              filters: aFiltersOrdenes,
              and: true,
            });
            oTableOrden.getBinding().filter(oFinalFilter);
          } else {
            oTableOrden.getBinding().filter();
          }

          oTablePedido.getBinding().refresh(true);
          oTableOrden.getBinding().refresh(true);
        }

      }
    );
  }
);
