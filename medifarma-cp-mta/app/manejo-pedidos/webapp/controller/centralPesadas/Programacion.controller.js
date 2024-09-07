sap.ui.define(
  [
    "../BaseController",
    "sap/ui/core/Fragment",
    "com/medifarma/cp/manejopedidos/model/models",
    "sap/m/MessageBox",
    "sap/ui/core/Item",
    "sap/ui/core/library",
    "../../service/Service",
    "../../service/oDataService",
    "sap/ui/model/json/JSONModel",
    "com/medifarma/cp/manejopedidos/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/suite/ui/commons/util/DateUtils",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    Fragment,
    models,
    MessageBox,
    Item,
    CoreLibrary,
    Service,
    oDataService,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageToast,
    DateUtils
  ) {
    "use strict";
    const rootPath = "com.medifarma.cp.manejopedidos";
    var ValueState = CoreLibrary.ValueState;
    var that,
      EQ = FilterOperator.EQ,
      BT = FilterOperator.BT,
      CONTAINS = FilterOperator.Contains,
      CONSTANT = {
        /**
         * GRUPO
         */
        GROL: "CPPR", //GRUPO ROL
        /**
         * DOCUMENTOS
         */
        CLASE_DOC: "CLASE_DOCUMENTO_CP",
        GRUPO_ART: "GRUPO_ARTICULO_CP",
      };
    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

    return BaseController.extend(
      "com.medifarma.cp.manejopedidos.controller.centralPesadas.Programacion",
      {
        formatter: formatter,
        i18nBundle: "",
        onInit: function () {
          that = this;
          that.aRol = null;
          that.sRol = null;
          that.sAppName = "ManejoPedidos";
          that.oModel = that.getOwnerComponent().getModel();
          that.oModelErp = that.getoDataModel(that);
          that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

          this.setModel(models.createProgramacion(), "crearProgramacion");
          this.i18nBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();

          this.getView().setModel(
            new sap.ui.model.json.JSONModel([]),
            "MaestraModel"
          );
          this.getView().setModel(new JSONModel([]), "SalaProgramacionModel");
          this.setModel(
            models.createActualizarProgramacion(),
            "ActualizarProgramacion"
          );

          that.oRouter
            .getTarget("TargetProgramacion")
            .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
        },
        _handleRouteMatched: function (oEvent) {
          var that = this;
          var oUrlParameters = {
            $expand: "oMaestraTipo",
          };

          sap.ui.core.BusyIndicator.show(0);

          /**
           * Obtiene los roles del usuario,
           * la cual determinara las acciones que realizara dentro del modulo.
           */
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

                /**
                 * Roles y Acciones para el modulo
                 * CPPR: CENTRAL DE PESADAS PROGRAMACION
                 */
                that.aRol = aRoleGroup["CPPR"];

                var aRoles = [];
                for (var key in that.aRol) {
                  aRoles.push(that.aRol[key].accion);
                }
                that.sRol = aRoles.join(",");

                /**
                 * Obtiene la lista de datos Maestros / Constantes
                 * necesarios para el modulo
                 */
                return oDataService.oDataRead(
                  that.oModel,
                  "Maestra",
                  oUrlParameters,
                  null
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

                /**
                 * Agrupa los registros de maestras por el tipo de datos
                 */
                that.getView().getModel("MaestraModel").setData(aConstant);

                /**
                 * Obtiene los Centros / Plantas
                 */
                that.onSetCenter();
              }
            })
            .catch((oError) => {});
        },
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
        onSetCenter: function () {
          var aFilters = [];
          var oUrlParameters = {};
          aFilters.push(new Filter("Bukrs", FilterOperator.EQ, "1000"));
          that
            ._getODataDinamic(
              that.oModelErp,
              "CentroSet",
              oUrlParameters,
              aFilters
            )
            .then((oData) => {
              that.setModel(new JSONModel(oData), "CentroErpModel");
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
              var aCentro = that.getModel("CentroErpModel").getData();
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
              that.setModel(new JSONModel(aSalaPesaje), "SalaCentroModel");
            });
        },
        getBundleText: function (sI18nKey, aPlaceholderValues) {
          return this.getBundleTextByModel(
            sI18nKey,
            this.getModel("i18n"),
            aPlaceholderValues
          );
        },
        onPressClose: function (oEvent) {
          var oSource = oEvent.getSource();
          var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          MessageBox.warning(
            this.i18nBundle.getText("msgWarningBorrarProgramacion"),
            {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              emphasizedAction: MessageBox.Action.OK,
              onClose: (sAction) => {
                if (sAction === MessageBox.Action.OK) {
                  this.getModel("crearProgramacion").getData().programacion =
                    [];
                  this.getModel("crearProgramacion").refresh(true);
                  oParent.close();
                }
              },
            }
          );
        },
        onCloseListaMaterial: function (oEvent) {
          var oSource = oEvent.getSource();
          var oParent = oSource.getParent();
          oParent.close();
        },
        onPressCloseWoWarning: function (oEvent) {
          var oSource = oEvent.getSource();
          var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();

          this.getModel("crearProgramacion").getData().programacion = [];
          this.getModel("crearProgramacion").refresh(true);
          oParent.close();
        },
        onPressAgregar: function () {
          if (!that._validateAccionAsigned("AGREGAR")) return;

          var sDialog = "CrearProgramacion";
          if (!this["o" + sDialog]) {
            this["o" + sDialog] = sap.ui.xmlfragment(
              "frgAgregarProgramacion",
              rootPath + ".view.centralPesadas.dialog." + sDialog,
              this
            );
            this.getView().addDependent(this["o" + sDialog]);
          }
          this["o" + sDialog].open();
        },
        onPressEdit: async function (oEvent) {
          if (!that._validateAccionAsigned("ACTUALIZAR")) return;

          var item = oEvent
              .getSource()
              .getBindingContext("SalaProgramacionModel")
              .getObject(),
            oModelActualizar = this.getModel("ActualizarProgramacion");

          oModelActualizar.setProperty("/ordenId", item.ordenId);
          oModelActualizar.setProperty("/lote", item.lote);
          oModelActualizar.setProperty("/orden", item.numero);
          oModelActualizar.setProperty("/valueProducto", item.nomProdTerm);
          //this.getModel("ActualizarProgramacion").setProperty("/fecha", item.fecha);
          var aFilters = [
            new sap.ui.model.Filter(
              "ordenId",
              sap.ui.model.FilterOperator.EQ,
              item.ordenId
            ),
          ];
          var oParameters = { $select: "oProgramacion_programacionId" };
          sap.ui.core.BusyIndicator.show();
          var oProgramacion = await oDataService.oDataRead(
            that.oModel,
            "ORDEN",
            oParameters,
            aFilters
          );
          var numProg = oProgramacion.results.find((orden) => {
            return orden.oProgramacion_programacionId !== null;
          }).oProgramacion_programacionId;
          var result = await oDataService.oDataReadExpand(
            that.oModel,
            "PROGRAMACION('" + numProg + "')",
            "oSalaPesaje/oPlanta"
          );
          sap.ui.core.BusyIndicator.hide();
          var d = formatter.getFormatShortDate(result.fechaProgramacion);
          var dOrig = formatter.getFormatShortDateYMD(result.fechaProgramacion);

          this.getModel("ActualizarProgramacion").setProperty("/fecha", d);
          this.getModel("ActualizarProgramacion").setProperty(
            "/fechaOriginal",
            dOrig
          );
          this.getModel("ActualizarProgramacion").setProperty(
            "/keySala",
            result.oSalaPesaje.salaPesajeId
          );
          this.getModel("ActualizarProgramacion").setProperty(
            "/keyCentro",
            result.oSalaPesaje.oPlanta.codigoSap
          );

          var sDialog = "ActualizarProgramacion";
          if (!this["o" + sDialog]) {
            this["o" + sDialog] = sap.ui.xmlfragment(
              "frgActualizarProgramacion",
              rootPath + ".view.centralPesadas.dialog." + sDialog,
              this
            );
            this.getView().addDependent(this["o" + sDialog]);
          }
          this["o" + sDialog].setModel(
            this.getModel("ActualizarProgramacion"),
            "ActualizarProgramacion"
          );
          this["o" + sDialog].open();

          /**
           * Bin componente Sala dependiendo el Centro
           * */

          var oCombo = sap.ui.core.Fragment.byId(
            "frgActualizarProgramacion",
            "idCmbSala"
          );

          oCombo
            .getBinding("items")
            .filter([
              new Filter(
                "oPlanta/codigo",
                FilterOperator.EQ,
                result.oSalaPesaje.oPlanta.codigoSap
              ),
            ]);
          oCombo.getBinding("items").refresh(true);
          oCombo.setEditable(true);
        },
        onSuggestionRowValidator: function (oColumnListItem) {
          var aCells = oColumnListItem.getCells();

          return new Item({
            key: aCells[1].getText(),
            text: aCells[0].getText(),
          });
        },
        onSuggestionItemSelectedOrden: function (oEvent) {
          var source = oEvent.getSource();
          var selectedRow = oEvent.getParameter("selectedRow");
          if (selectedRow === null) {
            /* MessageBox.error(this.i18nBundle.getText("msgWarningOrden"));
                            source.setValueState("Error");*/
            return true;
          } else {
            source.setValueState("Success");
          }
          var object = selectedRow.getBindingContext("orden").getObject();
          var oRegistro = this.getModel("crearProgramacion").getData();
          oRegistro.orden = object.numorden;
          oRegistro.lote = object.lote;
          oRegistro.keyProducto = object.idproducto;
          oRegistro.valueProducto = object.producto;
          oRegistro.estado = object.estado;
          oRegistro.keyEstado = object.keyEstado;
          oRegistro.icon = object.icon;
          oRegistro.color = object.color;
          this.getModel("crearProgramacion").refresh(true);
        },
        onChangeComboBox: async function (oEvent) {
          var source = oEvent.getSource();
          var key = source.getSelectedKey();
          if (key.length === 0) {
            source.setValueState("Error");
          } else {
            source.setValueState("Success");

            var oParam = that.getModel("crearProgramacion").getData();

            var aFilters = [];
            var EQ = FilterOperator.EQ;
            aFilters.push(new Filter("activo", FilterOperator.EQ, true));
            aFilters.push(new Filter("oSalaPesaje_salaPesajeId", EQ, key));
            var oParameters = {};
            sap.ui.core.BusyIndicator.show(0);
            var aBalanza = await oDataService.oDataRead(
              that.oModel,
              "BALANZA",
              oParameters,
              aFilters
            );
            sap.ui.core.BusyIndicator.hide();

            oParam.aBalanza = aBalanza.results;
          }
        },
        handleChangeDatePicker: function (oEvent) {
          var source = oEvent.getSource(),
            bValid = oEvent.getParameter("valid");

          if (bValid) {
            source.setValueState(ValueState.None);
          } else {
            source.setValueState(ValueState.Error);
          }
        },
        onPressLimpiarFormularioAgregar: function () {
          var oRegistro = this.getModel("crearProgramacion").getData();
          var oData = Object.assign({}, oRegistro);
          var aProgramacion = oData.programacion;

          /**
           * Reinicializa todos los valores de los filtros
           */
          oRegistro = Object.assign({}, models.createProgramacion().getData());
          oRegistro.programacion = aProgramacion;

          this.getModel("crearProgramacion").setData(oRegistro);
          this.getModel("crearProgramacion").refresh(true);
          sap.ui.core.Fragment.byId(
            "frgAgregarProgramacion",
            "idCmbSala"
          ).setEnabled(false);
        },

        _setBuildItemSelected: function (oOrden) {
          var oOrdenSeleccionada = oOrden;
          var oOrdenProgramacion = {}; //this.getModel("crearProgramacion").getData();
          if (oOrdenSeleccionada["Charg"]) {
            /**
             * Variables para obtener Lista Material:
             * Stlnr, Plnbez, Werks
             */

            oOrdenProgramacion["lstMaterial"] = oOrdenSeleccionada["Stlnr"];
            oOrdenProgramacion["centro"] = oOrdenSeleccionada["Werks"];
            oOrdenProgramacion["keyProducto"] = oOrdenSeleccionada["Plnbez"];

            oOrdenProgramacion["orden"] = oOrdenSeleccionada["Aufnr"];
            oOrdenProgramacion["lote"] = oOrdenSeleccionada["Charg"];
            oOrdenProgramacion["estado"] = oOrdenSeleccionada["Txt30"];
            oOrdenProgramacion["valueProducto"] = oOrdenSeleccionada["Maktx"];

            oOrdenProgramacion["estadoOrdenErp"] = oOrdenSeleccionada["Stat"];
            oOrdenProgramacion["clasOrdProd"] = oOrdenSeleccionada["Auart"];
            oOrdenProgramacion["nivelFab"] = oOrdenSeleccionada["Nfabr"];
            oOrdenProgramacion["acondicionado"] = oOrdenSeleccionada["Acond"];
            oOrdenProgramacion["numReserva"] = oOrdenSeleccionada["Rsnum"];

            oOrdenProgramacion["valueStateOrden"] = "Success";

            return oOrdenProgramacion;
            //this.getModel("crearProgramacion").refresh(true);
            return true;
          } else {
            MessageBox.error(
              "La orden ( " +
                oOrdenSeleccionada["Aufnr"] +
                " ) selecionada no tiene Lote."
            );
            return false;
          }
        },
        onPressAgregarTabla: async function (oEvent) {
          var oParent = oEvent.getSource().getParent();
          var orden = oParent.getBindingContext("OrdenModel").getObject();
          var oOrdenSelect = this._setBuildItemSelected(orden);
          if (!oOrdenSelect) return;

          var oRegistro = this.getModel("crearProgramacion").getData();
          Object.assign(oRegistro, oOrdenSelect);
          var oData = Object.assign({}, oRegistro);
          var aProgramacion = oData.programacion;

          /**
           * Valida que la Orden no haya sido seleccionado anteriormente.
           */
          var ordenRepetida = aProgramacion.some((item) => {
            return (
              item.orden === oRegistro.orden &&
              item.keyCentro === oRegistro.keyCentro &&
              item.keySala === oRegistro.keySala
            );
          });

          /**
           * Valida si la fecha de programacion es menor a la fecha actual.
           */
          var fechaPasada =
            new Date(oData.fecha).getTime() + 86400000 < new Date().getTime();

          delete oData.programacion;
          oRegistro.programacion = aProgramacion;

          if (ordenRepetida) {
            /**
             * Notifica y valida que la orden no haya sido seleccionado anteriormente.
             */
            this.getModel("crearProgramacion").setData(oRegistro);
            this.getModel("crearProgramacion").refresh(true);
            MessageBox.warning(this.i18nBundle.getText("msgWarningOrdenAdd"));
          } else {
            var aFilters = [];
            var EQ = FilterOperator.EQ;

            aFilters.push(new Filter("Rsnum", EQ, oData.numReserva));
            aFilters.push(new Filter("Bwart", EQ, ""));
            aFilters.push(new Filter("Werks", EQ, oData.centro));

            var aListMaterial = [];
            try {
              /**
               * Obtiene los los Materiales de la orden seleccionada invocando el servicio ERP: ReservaSet
               *
               */
              aListMaterial = await oDataService.oDataRead(
                that.oModelErp,
                "ReservaSet",
                {},
                aFilters
              );
            } catch (oError) {
              MessageBox.warning(
                "No se encontro lista de Materiales para la OP: " + oData.orden
              );
            }

            if (
              aListMaterial &&
              aListMaterial.results &&
              aListMaterial.results.length
            ) {
              aListMaterial = aListMaterial.results;
              var aListMessage = [];
              var aCentro = that.getModel("CentroModel").getData();
              for (var key in aListMaterial) {
                var oItem = aListMaterial[key];
                var oCentro = aCentro.find((o) => o.Bwkey === oItem.Werks);
                oItem.oCentro = oCentro;
                var sUMB = oItem.Meins.toUpperCase();
                if (["L", "ML", "KG", "G"].includes(sUMB)) {
                  /**
                   * Obtiene las Balanzas y validar si la sala seleccionada tiene configurado una balanza analitica.
                   */
                  var oParam = that.getModel("crearProgramacion").getData();
                  var aMaestraList = that.getModel("MaestraModel").getData();
                  var aTipoBalanza = aMaestraList["TIPO_BALANZA"];
                  var oBalanzaAnalitic = aTipoBalanza.find((o) => {
                    return o.codigo === "TB2"; //Balanzan Analitica
                  });
                  var oBalAnalitica = oParam.aBalanza.find((o) => {
                    return (
                      o.oTipoBalanza_iMaestraId !== oBalanzaAnalitic.iMaestraId
                    );
                  });

                  /**
                   * Validar si cantidad es menor a 100 umb
                   */
                  var iValidateMenge = oItem.Bdmng;

                  switch (sUMB) {
                    case "KG":
                      iValidateMenge = formatter.convertKgToG(oItem.Bdmng);
                      sUMB = "G";
                      break;
                    case "L":
                      iValidateMenge = formatter.convertLToMl(oItem.Bdmng);
                      sUMB = "ML";
                      break;
                    default:
                      iValidateMenge = oItem.Bdmng;
                      break;
                  }

                  /**
                   * Si la sala tiene configurado una balanza analitica y la cantidad del insumo es menor a 100,
                   * mostrar un mensaje de informacion indicando que la cantidad es menor a 100
                   */
                  if (+iValidateMenge < 100) {
                    if (!oBalAnalitica) {
                      aListMessage.push(
                        oItem.Maktx + " Cantidad menor a 100 " + sUMB
                      );
                    }
                  }
                }
              }
              oData.aListMaterial = aListMaterial;

              if (aListMessage.length) {
                that._showServiceListMessage(
                  "Se encontraron las siguientes observaciones: ",
                  aListMessage
                );
              }
            }

            if (fechaPasada) {
              /**
               * Si la fecha de programacion es menor a la fecha actual se muestra una mensaje informativo (no restrictivo).
               */
              MessageBox.warning(
                this.i18nBundle.getText("msgWarningFechaPasada"),
                {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                      oRegistro.programacion.push(oData);
                    }
                    this.getModel("crearProgramacion").setData(oRegistro);
                    this.getModel("crearProgramacion").refresh(true);
                  },
                }
              );
            } else {
              oRegistro.programacion.push(oData);
              this.getModel("crearProgramacion").setData(oRegistro);
              this.getModel("crearProgramacion").refresh(true);
              MessageToast.show("Orden selecionada.");
            }
          }
        },

        _showServiceListMessage: function (sErrorTitle, aDetails) {
          that._bMessageOpen = true;
          var aMessageHtml = [];
          aDetails.forEach(function (sMessage) {
            aMessageHtml.push("<li>" + sMessage + "</li>");
          });

          MessageBox.warning(sErrorTitle, {
            title: "Warning",
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
        validarFormAgregarProgramacion: function (oRegistro) {
          var bError = false;
          if (oRegistro.keyCentro.length === 0) {
            oRegistro.valueStateCentro = "Error";
            bError = true;
          }
          if (oRegistro.keySala.length === 0) {
            oRegistro.valueStateSala = "Error";
            bError = true;
          }
          /*if (oRegistro.lote.length === 0) {
                    oRegistro.valueStateOrden = "Error";
                    bError = true;
                  }*/
          if (
            oRegistro.fecha.length === 0 ||
            oRegistro.valueStateFecha === ValueState.Error
          ) {
            oRegistro.valueStateFecha = "Error";
            bError = true;
          }
          if (bError) {
            MessageBox.error(
              this.i18nBundle.getText("msgErrorFormularioAgregar")
            );
            return bError;
          }
        },
        onConfirmGenerateConflict: function (oDataConflict) {
          return new Promise(function (resolve, reject) {
            Service.onPostDataGeneralFiltros("programacion", "", oDataConflict)
              .then(function (aResult) {
                resolve(aResult);
              })
              .catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              })
              .finally(function () {
                // sap.ui.core.BusyIndicator.hide();
              });
          });
        },
        onGetOrdenesProgramadas: function (aOrdenes) {
          return new Promise((resolve, reject) => {
            sap.ui.core.BusyIndicator.show();
            var aFilters = [],
              oParameters = {
                $expand: "oProgramacion",
              };

            aOrdenes.forEach((ordenProgramada) => {
              aFilters.push(
                new Filter("numero", FilterOperator.EQ, ordenProgramada.orden)
              );
            });
            aFilters = [
              new Filter({
                filters: aFilters,
                and: false,
              }),
            ];

            oDataService
              .oDataRead(that.oModel, "ORDEN", oParameters, aFilters)
              .then((oResult) => {
                var aOrdenesProgramadas = [];
                oResult.results.forEach((ordenProgramada) => {
                  if (ordenProgramada.oProgramacion_programacionId !== null)
                    aOrdenesProgramadas.push(ordenProgramada);
                });
                resolve(aOrdenesProgramadas);
              })
              .catch((oError) => {
                reject(oError);
              })
              .finally((oFinally) => {
                sap.ui.core.BusyIndicator.hide();
              });
          });
        },
        onPostOrdenesProgramadas: function (aData) {
          var aDataValidate = [];
          var aGroupProgramacion = aData.reduce(function (r, a) {
            var sKey = a.keySala + "|" + a.fecha;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));

          var aFilters = [];
          var EQ = FilterOperator.EQ;
          for (var key in aGroupProgramacion) {
            var oItem = aGroupProgramacion[key][0];
            aFilters.push(new Filter("fechaProgramacion", EQ, oItem.fecha));
            aFilters.push(
              new Filter("oSalaPesaje_salaPesajeId", EQ, oItem.keySala)
            );
          }

          return new Promise((resolve, reject) => {
            sap.ui.core.BusyIndicator.show(0);

            var oParameters = {};

            oDataService
              .oDataRead(that.oModel, "PROGRAMACION", oParameters, aFilters)
              .then((oResp) => {
                /**
                 * Verifica si la programacion ya existe, caso contrario lo creo
                 */

                var aResult = oResp.results;
                var aPromiseProgramacion = [];

                for (var key in aGroupProgramacion) {
                  var aItem = aGroupProgramacion[key];
                  var oItem = aItem[0];

                  if (aResult.length) {
                    var oResult = aResult.find(
                      (o) =>
                        o.oSalaPesaje_salaPesajeId === oItem.keySala &&
                        formatter.getDateTimeYMD(o.fechaProgramacion) ===
                          oItem.fecha
                    );
                  } else {
                    var oResult = null;
                  }

                  var sProgramacionId = "";
                  if (!oResult) {
                    var oBuild = that._getBaseAuditModel();
                    oBuild = that._createRequestedModel(
                      "Programacion",
                      oBuild,
                      oItem
                    );
                    sProgramacionId = oBuild.programacionId;

                    aPromiseProgramacion.push(
                      oDataService.oDataCreate(
                        that.oModel,
                        "PROGRAMACION",
                        oBuild
                      )
                    );
                  } else {
                    sProgramacionId = oResult.programacionId;
                  }

                  for (var iIndex in aItem) {
                    aItem[iIndex].programacion = sProgramacionId;
                    aDataValidate.push(aItem[iIndex]);
                  }
                }

                return Promise.all(aPromiseProgramacion);
              })
              .then((oResp) => {
                var aFilters = [];
                for (var iIndex in aDataValidate) {
                  var oItems = aDataValidate[iIndex];
                  aFilters.push(
                    new Filter("numero", FilterOperator.EQ, oItems.orden)
                  );
                }

                return oDataService.oDataRead(
                  that.oModel,
                  "ORDEN",
                  oParameters,
                  aFilters
                );
              })
              .then((oResp) => {
                var aPromiseOrden = [];
                for (var key in aDataValidate) {
                  var oItem = aDataValidate[key];

                  var oBuild = that._getBaseAuditModel();
                  oBuild = that._createRequestedModel("Orden", oBuild, oItem);
                  oBuild["oProgramacion_programacionId"] = oItem.programacion;

                  aPromiseOrden.push(
                    oDataService.oDataCreate(that.oModel, "ORDEN", oBuild)
                  );
                }

                return Promise.all(aPromiseOrden);

                /**
                 * Verifica si las Ordenes ya existen, caso contratio lo crea
                 */
              })
              .then((oResult) => {
                sap.ui.core.BusyIndicator.hide();
                resolve("Programación creada con éxito");
              })
              .catch((oError) => {
                reject(oError);
              })
              .finally((oFinally) => {
                that._seachSalaProgramacion();
                //that.byId("idHBProgramacion").getBinding("items").refresh(true);
                sap.ui.core.BusyIndicator.hide();
              });
          });
        },
        onUpdateOrdenesProgramadas: function (oOrden) {
          return new Promise((resolve, reject) => {
            sap.ui.core.BusyIndicator.show(0);
            Service.onUpdateDataGeneralFiltros("programacion", "update", oOrden)
              .then((oResult) => {
                resolve(oResult);
              })
              .catch(function (oError) {
                //oThat.onErrorMessage(oError, "errorSave");
                sap.ui.core.BusyIndicator.hide();
                reject(oError);
              })
              .finally(() => {
                that._seachSalaProgramacion();
                //that.byId("idHBProgramacion").getBinding("items").refresh(true);
              });
          });
        },
        onPressCrear: function (oEvent) {
          try {
            var oRegistro = this.getModel("crearProgramacion").getData();
            var oData = Object.assign({}, oRegistro);
            var aProgramacion = oData.programacion;
            var oDataClean = Object.assign(
              {},
              models.createProgramacion().getData()
            );
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();

            this.onGetOrdenesProgramadas(aProgramacion)
              .then((oResultado) => {
                var aRespFilter = oResultado.filter(function (x) {
                  return x.oProgramacion != null;
                });

                if (aRespFilter.length === 0) {
                  /**
                   * Se muestra un mensaje para confirmar si el usuario esta conforme de crear
                   * una nueva programacion.
                   */
                  MessageBox.confirm(
                    this.i18nBundle.getText("msgConfirmOrden"),
                    {
                      actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                      emphasizedAction: MessageBox.Action.OK,
                      onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                          /**
                           * Se envia los registros de creacion de una nueva programacion.
                           */
                          that
                            .onPostOrdenesProgramadas(aProgramacion)
                            .then((oResultado) => {
                              sap.ui.core.BusyIndicator.hide();
                              MessageToast.show(oResultado);
                              that
                                .getModel("crearProgramacion")
                                .setData(oDataClean);
                              that.getModel("crearProgramacion").refresh(true);

                              oParent.close();
                            })
                            .catch(function (oError) {
                              that.onErrorMessage(oError, "errorSave");
                              sap.ui.core.BusyIndicator.hide();
                            });
                        }
                      },
                    }
                  );
                } else {
                  var sOrdenes = aRespFilter.map((x) => {
                    var sMensaje = "";
                    if (x.oProgramacion) {
                      sMensaje =
                        x.numero +
                        " a pesarse el " +
                        formatter.getFormatShortDate(
                          x.oProgramacion.fechaProgramacion
                        );
                    }
                    return sMensaje;
                  });

                  sOrdenes = that._uniqByKeepFirst(sOrdenes, (it) => it);
                  sOrdenes = sOrdenes.join(", ");

                  MessageBox.warning(
                    this.i18nBundle.getText("msgWarningOrdenesRegistradas", [
                      sOrdenes,
                    ]),
                    {
                      actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                      emphasizedAction: MessageBox.Action.OK,
                      onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                          that
                            .onPostOrdenesProgramadas(aProgramacion)
                            .then((oResultado) => {
                              sap.ui.core.BusyIndicator.hide();
                              MessageToast.show(oResultado);
                              that
                                .getModel("crearProgramacion")
                                .setData(oDataClean);
                              that.getModel("crearProgramacion").refresh(true);

                              oParent.close();
                            })
                            .catch(function (oError) {
                              that.onErrorMessage(oError, "errorSave");
                              sap.ui.core.BusyIndicator.hide();
                            });
                        }
                      },
                    }
                  );
                }
                sap.ui.core.BusyIndicator.hide();
              })
              .catch(function (oError) {
                that.onErrorMessage(oError, "errorSave");
                sap.ui.core.BusyIndicator.hide();
              });
          } catch (error) {
            that.onErrorMessage(error, "errorSave");
          }
        },
        addDays: function (date, days) {
          var result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        },
        restarDays: function (date, days) {
          var result = new Date(date);
          result.setDate(result.getDate() - days);
          return result;
        },
        _formatYDM: function (sDate) {
          if (sDate) {
            var aDate = sDate.split("-");
            if (aDate[0].length > 2) {
              return aDate.join("-");
            } else {
              return [aDate[2], aDate[1], aDate[0]].join("-");
            }
          }
        },
        onPressActualizar: function (oEvent) {
          var that = this;
          if (!that._validateAccionAsigned("ACTUALIZAR")) return;

          var oDialog = oEvent.getSource().getParent();
          var oRegistro = this.getModel("ActualizarProgramacion").getData();
          //Validar el dialog
          var returnValidForm = this.validarFormAgregarProgramacion(oRegistro);
          if (returnValidForm) {
            this.getModel("ActualizarProgramacion").refresh(true);
            return true;
          }

          var oData = Object.assign({}, oRegistro);

          var aNewDay = this.restarDays(new Date(), 5);
          var dOrig = formatter.getFormatShortDateYMD(aNewDay);
          var dOrig2 = formatter.getFormatShortDate(aNewDay);
          var sDateEval = that._formatYDM(oData.fecha);
          if (sDateEval < dOrig) {
            /**
             * Si fecha es menor a la fecha actual programada
             * Solo debe de permitir programar una actualizacion menor a 5 dias
             */
            return MessageToast.show(
              "No es posible ingresar una fecha de programación inferior a 6 días de la fecha actual. \nIngrese una fecha superior / igual a: \n" +
                dOrig2
            );
          }

          var aFilters = [
            new Filter(
              "ordenId",
              sap.ui.model.FilterOperator.EQ,
              String(oRegistro.ordenId)
            ),
          ];
          var oParameters = {},
            sPath,
            oBody;
          sap.ui.core.BusyIndicator.show();
          oDataService
            .oDataRead(that.oModel, "ORDEN", oParameters, aFilters)
            .then((oResult) => {
              oData["ordenId"] = oResult.results[0].ordenId;
              aFilters = [];
              aFilters.push(
                new Filter(
                  "programacionId",
                  FilterOperator.EQ,
                  oResult.results[0].oProgramacion_programacionId
                )
              );
              oParameters = { $expand: "aOrden" };
              return oDataService.oDataRead(
                that.oModel,
                "PROGRAMACION",
                oParameters,
                aFilters
              );
            })
            .then((oResult) => {
              //Borrar la antigua programación si está vacía
              if (oResult.results[0].aOrden.results.length <= 1) {
                sPath = that.oModel.createKey("/PROGRAMACION", {
                  programacionId: oResult.results[0].programacionId,
                });
                oBody = { activo: false };
                oDataService.oDataUpdate(that.oModel, sPath, oBody);
              }
              //Obtener la programación y asignarla al modelo
              if (!oData["fecha"].slice(6).includes("-")) {
                oData["fecha"] =
                  oData["fecha"].slice(6) +
                  "-" +
                  oData["fecha"].slice(3, 5) +
                  "-" +
                  oData["fecha"].slice(0, 2);
              }
              //Buscar programaciones existentes
              aFilters = [];
              aFilters.push(
                new Filter(
                  "oSalaPesaje_salaPesajeId",
                  sap.ui.model.FilterOperator.EQ,
                  oData["keySala"]
                )
              );
              aFilters.push(
                new Filter(
                  "fechaProgramacion",
                  sap.ui.model.FilterOperator.EQ,
                  oData["fecha"]
                )
              );
              oParameters = {};
              return oDataService.oDataRead(
                that.oModel,
                "PROGRAMACION",
                oParameters,
                aFilters
              );
            })
            .then((oResult) => {
              //Crear programacion si no existe y asignar la orden
              if (oResult.results.length === 0) {
                oBody = that._getBaseAuditModel();
                oBody = that._createRequestedModel(
                  "Programacion",
                  oBody,
                  oData
                );
                oData["programacion"] = oBody["programacionId"];
                oDataService.oDataCreate(that.oModel, "PROGRAMACION", oBody);
              } else {
                oData["programacion"] = oResult.results[0].programacionId;
                //Activar programacion si existe y está inactiva y asignar la orden, o cambiar solo el id de la orden
                if (oResult.results[0].activo === false) {
                  sPath = that.oModel.createKey("/PROGRAMACION", {
                    programacionId: oResult.results[0].programacionId,
                  });
                  oBody = { activo: true };
                  oDataService.oDataUpdate(that.oModel, sPath, oBody);
                }
              }
              sPath = that.oModel.createKey("/ORDEN", {
                ordenId: oData["ordenId"],
              });
              oBody = { oProgramacion_programacionId: oData["programacion"] };
              return oDataService.oDataUpdate(that.oModel, sPath, oBody);
            })
            .then((oResult) => {
              MessageToast.show(that.i18nBundle.getText("mgsUpdateSuccess"));
            })
            .catch((oError) => {
              MessageBox.error(that.i18nBundle.getText("msgUpdateError"));
            })
            .finally(() => {
              that._seachSalaProgramacion();
              //that.byId("idHBProgramacion").getBinding("items").refresh(true);
              sap.ui.core.BusyIndicator.hide();
              oDialog.close();
            });
        },
        onDeleteOrdenProgramada: function (oData) {
          return new Promise((resolve, reject) => {
            var oParameters = {},
              aFilters = [];
            var sPath = that.oModel.createKey("/ORDEN", {
                ordenId: oData.ordenId,
              }),
              sBody = {
                oProgramacion_programacionId: null,
              };
            oDataService
              .oDataUpdate(that.oModel, sPath, sBody)
              .then((oResult) => {
                aFilters.push(
                  new Filter(
                    "oProgramacion_programacionId",
                    FilterOperator.EQ,
                    oData.oProgramacion_programacionId
                  )
                );
                return oDataService.oDataRead(
                  that.oModel,
                  "ORDEN",
                  oParameters,
                  aFilters
                );
              })
              .then((oResult) => {
                if (oResult.results.length > 0) {
                  resolve(
                    "La orden " +
                      oData.numero +
                      " ha sido borrada de la programación."
                  );
                } else {
                  (sPath = that.oModel.createKey("/PROGRAMACION", {
                    programacionId: oData.oProgramacion_programacionId,
                  })),
                    (sBody = {
                      activo: false,
                    });
                  return oDataService.oDataUpdate(that.oModel, sPath, sBody);
                }
              })
              .then((oResult) => {
                resolve(
                  "La orden " +
                    oData.numero +
                    " ha sido borrada de la programación."
                );
              })
              .catch((oError) => {
                reject(oError);
              });
          });
        },
        onPressDelete: async function (oEvent) {
          if (!that._validateAccionAsigned("ELIMINAR")) return;

          var parent = oEvent.getSource().getParent();
          var orden = parent
            .getBindingContext("SalaProgramacionModel")
            .getObject();
          var numOrden = orden.numero,
            ordenId = orden.ordenId,
            oParameters = {},
            aFilters = [];

          aFilters.push(
            new Filter("ordenId", FilterOperator.EQ, orden.ordenId)
          );
          aFilters.push(
            new Filter(
              "oProgramacion_programacionId",
              FilterOperator.EQ,
              orden.oProgramacion_programacionId
            )
          );
          oParameters = { $expand: "oProgramacion" };
          sap.ui.core.BusyIndicator.show();
          var aResult = await oDataService.oDataRead(
            that.oModel,
            "ORDEN",
            oParameters,
            aFilters
          );

          that.oOrdenProgDelete = null;
          if (aResult.results && aResult.results.length) {
            var oOrdenProg = aResult.results[0];
            that.oOrdenProgDelete = oOrdenProg;
            var oProgramacion = oOrdenProg.oProgramacion;
            sap.ui.core.BusyIndicator.hide();
            var dProg = formatter.getFormatShortDateYMD(
              oProgramacion.fechaProgramacion
            );

            var aNewDay = that.restarDays(new Date(), 4);
            var dOrig = formatter.getFormatShortDateYMD(aNewDay);
            var dOrig2 = formatter.getFormatShortDate(aNewDay);

            if (dProg < dOrig) {
              /**
               * Si fecha programada es menor a la fecha actual programada
               * Solo debe de permitir eliminar fecha actual menor a 4 dias
               */
              return MessageBox.error(
                "No es posible eliminar una fecha cuya fecha programada es inferior a 4 días de la fecha actual."
              );
            }

            MessageBox.confirm(
              this.i18nBundle.getText("msgConfirmDeleteProgramOrden", numOrden),
              {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: (sAction) => {
                  if (sAction === MessageBox.Action.OK) {
                    sap.ui.core.BusyIndicator.show(0);
                    that
                      .onDeleteOrdenProgramada(that.oOrdenProgDelete)
                      .then((oResult) => {
                        that._seachSalaProgramacion();
                        MessageToast.show(oResult);
                      })
                      .catch(function (oError) {
                        that.onErrorMessage(oError, "errorSave");
                      })
                      .finally((oFinally) => {
                        sap.ui.core.BusyIndicator.hide();
                      });
                  }
                },
              }
            );
          }
        },

        _seachSalaProgramacion: function () {
          if (!that.oSearchParams) return;
          var oParameters = that.oSearchParams.oParameters;
          var aFilters = that.oSearchParams.aFilters;
          var aSalaProgramacion = [];

          if (!oParameters && !aFilters) return;

          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "SALA_PESAJE", oParameters, aFilters)
            .then((oResp) => {
              var aResult = oResp.results;

              if (aResult.length) {
                console.log(aResult);

                aFilters = [];
                var aProgramacion = [];

                /**
                 * Crear fechas temporales, para armar el calendario de programacion (Sin Datos)
                 */
                var aDateExist = [];
                for (var key in aResult) {
                  var o = aResult[key];
                  var aProg = o.aProgramacion.results;
                  for (var i in aProg) {
                    aDateExist.push(aProg[i].fechaProgramacion);
                  }
                }

                /**
                 * Ordenar por FechaProgramacion
                 */
                for (var key in aResult) {
                  var o = aResult[key];
                  var aProg = o.aProgramacion.results;

                  for (var keyTemp in aDateExist) {
                    aProg.push({
                      fechaProgramacion: aDateExist[keyTemp],
                      aOrden: [],
                    });
                  }

                  for (var i in aProg) {
                    if (aProg[i].programacionId) {
                      aFilters.push(
                        new sap.ui.model.Filter(
                          "oProgramacion_programacionId",
                          sap.ui.model.FilterOperator.EQ,
                          aProg[i].programacionId
                        )
                      );
                      aProg[i].aOrden = [];
                      aProgramacion.push(aProg[i].programacionId);
                    }
                  }

                  aProg.sort(that.dynamicSort("fechaProgramacion"));
                  o.aProgramacion = aProg;
                }

                if (aProgramacion.length) {
                  aSalaProgramacion = aResult;
                  return oDataService.oDataRead(
                    that.oModel,
                    "VIEW_ORDEN_PROGRAMACION",
                    {},
                    aFilters
                  );
                }
              }
            })
            .then((oResp) => {
              sap.ui.core.BusyIndicator.hide();
              var aResult = oResp.results;

              if (aResult.length) {
                for (var key in aResult) {
                  var o = aResult[key];
                  for (var i in aSalaProgramacion) {
                    var oSalaProgramacion = aSalaProgramacion[i];
                    for (var s in oSalaProgramacion.aProgramacion) {
                      var oProgramacion = oSalaProgramacion.aProgramacion[s];
                      if (
                        oProgramacion.programacionId ==
                        o.oProgramacion_programacionId
                      ) {
                        oProgramacion.aOrden.push(o);
                      }
                    }
                  }
                }

                if (aSalaProgramacion.length) {
                  for (var key0 in aSalaProgramacion) {
                    var oSalaProgramacion = aSalaProgramacion[key0];
                    var aProg = oSalaProgramacion.aProgramacion;
                    if (aProg.length > 1) {
                      var aProgReduce = aProg.reduce(function (r, a) {
                        var sFechaProgramacion =
                          formatter.getFormatShortDateYMD(a.fechaProgramacion);
                        var sKey = sFechaProgramacion;
                        r[sKey] = r[sKey] || [];
                        r[sKey].push(a);
                        return r;
                      }, Object.create(null));

                      var aProgramacionGroup = [];
                      for (var key in aProgReduce) {
                        var aGroup = aProgReduce[key];
                        var aOrden = [];
                        var oProgramacion = {};
                        for (var key2 in aGroup) {
                          oProgramacion = aGroup[key2];
                          aOrden = aOrden.concat(oProgramacion.aOrden);
                        }

                        oProgramacion.aOrden = aOrden;
                        aProgramacionGroup.push(oProgramacion);
                      }
                      oSalaProgramacion.aProgramacion = aProgramacionGroup;
                    }
                  }

                  that
                    .getView()
                    .getModel("SalaProgramacionModel")
                    .setData(aSalaProgramacion);
                  that
                    .getView()
                    .getModel("SalaProgramacionModel")
                    .refresh(true);
                  that.byId("idMessagePage").setVisible(false);
                  that.byId("idScrollProgamacionContainer").setVisible(true);

                  var aOrdenFilter = [];
                  for (var key0 in aSalaProgramacion) {
                    var aProgramacion = aSalaProgramacion[key0].aProgramacion;
                    for (var key1 in aProgramacion) {
                      var aOrden = aProgramacion[key1].aOrden;
                      for (var key2 in aOrden) {
                        var oOrden = aOrden[key2];
                        aOrdenFilter.push(oOrden.numero);
                      }
                    }
                  }

                  aOrdenFilter = that._uniqByKeepFirst(
                    aOrdenFilter,
                    (it) => it
                  );

                  var aFilters = [];
                  var EQ = FilterOperator.EQ;
                  for (var key in aOrdenFilter) {
                    aFilters.push(new Filter("Aufnr", EQ, aOrdenFilter[key]));
                  }

                  if (aOrdenFilter.length) {
                    sap.ui.core.BusyIndicator.show(0);
                    return that
                      ._getODataDinamic(
                        that.oModelErp,
                        "OrdenSet",
                        {},
                        aFilters
                      )
                      .catch((oResult) => {
                        sap.ui.core.BusyIndicator.hide();
                        var oResp = JSON.parse(oResult.responseText);
                        MessageBox.error(oResp.error.message.value);
                      });
                  } else {
                    return false;
                  }
                } else {
                  that.getView().getModel("SalaProgramacionModel").setData([]);
                  that
                    .getView()
                    .getModel("SalaProgramacionModel")
                    .refresh(true);
                  that.byId("idMessagePage").setVisible(true);
                  that.byId("idScrollProgamacionContainer").setVisible(false);
                }
              } else {
                that.getView().getModel("SalaProgramacionModel").setData([]);
                that.getView().getModel("SalaProgramacionModel").refresh(true);
                that.byId("idMessagePage").setVisible(true);
                that.byId("idScrollProgamacionContainer").setVisible(false);
              }
            })
            .then((oResp) => {
              if (oResp) {
                /**
                 * Verificar estado de las Ordenes en la ERP
                 */
                sap.ui.core.BusyIndicator.hide();
                var oSalaProgramacionModel = that.getModel(
                  "SalaProgramacionModel"
                );
                var aOrdenFilter = that._validateOrdenErp(oResp);
                var aSalaProgramacion = oSalaProgramacionModel.getData();
                for (var key0 in aSalaProgramacion) {
                  var aProgramacion = aSalaProgramacion[key0].aProgramacion;
                  for (var key1 in aProgramacion) {
                    var aOrden = aProgramacion[key1].aOrden;
                    for (var key2 in aOrden) {
                      var oOrden = aOrden[key2];
                      var oOrdenErp = aOrdenFilter.find(
                        (o) => o.Aufnr === oOrden.numero
                      );
                      if (oOrdenErp) {
                        oOrden.estadoOrdenErp = oOrdenErp.Stat;
                      }
                    }
                  }
                }
                oSalaProgramacionModel.refresh(true);
              }
            })
            .catch((oError) => {
              that.getView().getModel("SalaProgramacionModel").setData([]);
              that.getView().getModel("SalaProgramacionModel").refresh(true);
              that.byId("idMessagePage").setVisible(true);
              that.byId("idScrollProgamacionContainer").setVisible(false);
            })
            .finally((oFinally) => {});
        },

        addDays: function (oDate, days) {
          var date = new Date(oDate);
          date.setDate(date.getDate() + days);
          return date;
        },

        getDates: function (startDate, stopDate) {
          var dateArray = new Array();
          var currentDate = startDate;
          while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate));
            currentDate = that.addDays(currentDate, 1);
          }
          return dateArray;
        },

        onSearchFilter: function (oEvent) {
          that.oSearchParams = [];
          var aFilters = [],
            aDefFilters = oEvent.getParameters().selectionSet;
          var EQ = sap.ui.model.FilterOperator.EQ;

          aFilters = [new sap.ui.model.Filter("activo", EQ, true)];
          var oFiltDate = "";
          aDefFilters.forEach((oDefFilter, iPos) => {
            if (iPos === 0) {
              var oFiltroPlanta = new sap.ui.model.Filter(
                "oPlanta/codigo",
                EQ,
                oDefFilter.getSelectedKey()
              );
              aFilters.push(oFiltroPlanta);
            } else if (iPos === 1) {
              oFiltDate = oDefFilter;
            }
          });

          /**
           * Construye la Query para obtener las programaciones por Salas, Centro y fechas
           */
          var oParameters = {
            $expand:
              "oEstado,oPlanta,aProgramacion($filter=fechaProgramacion ge " +
              this._toEdmDate(oFiltDate.getFrom()) +
              " and fechaProgramacion le " +
              this._toEdmDate(oFiltDate.getTo()) +
              " and activo eq true)",

            $orderby: "sala asc,oPlanta/contenido desc",
          };

          that.oSearchParams = {
            aFilters: aFilters,
            oParameters: oParameters,
          };

          that._seachSalaProgramacion();
        },
        onAgregarProgramacionChangeCentro: function (oEvent) {
          var sKeyCentro = oEvent.getSource().getSelectedKey();
          oEvent.getSource().setValueState("None");
          var oCombo = sap.ui.core.Fragment.byId(
            "frgAgregarProgramacion",
            "idCmbSala"
          );

          var oCrearProgramacionModel =
            this.getView().getModel("crearProgramacion");
          var oCrearProgramacion = oCrearProgramacionModel.getData();

          oCrearProgramacion.valueSala = "";
          oCrearProgramacion.keySala = "";

          oCrearProgramacionModel.refresh(true);

          /**
           * Filtra todas las Salas relacionadas al centro seleccionado.
           */
          oCombo
            .getBinding("items")
            .filter([
              new Filter("oPlanta/codigo", FilterOperator.EQ, sKeyCentro),
            ]);
          oCombo.getBinding("items").refresh(true);

          oCombo.setEnabled(true);
        },
        onActualizarProgramacionChangeCentro: function (oEvent) {
          var sKeyCentro = oEvent.getSource().getSelectedKey();
          var oCombo = sap.ui.core.Fragment.byId(
            "frgActualizarProgramacion",
            "idCmbSala"
          );

          this.getView()
            .getModel("ActualizarProgramacion")
            .getData().valueSala = "";
          this.getView().getModel("ActualizarProgramacion").getData().keySala =
            "";
          this.getView().getModel("ActualizarProgramacion").refresh(true);

          oCombo
            .getBinding("items")
            .filter([
              new Filter("oPlanta/codigo", FilterOperator.EQ, sKeyCentro),
            ]);
          oCombo.getBinding("items").refresh(true);

          oCombo.setEditable(true);
        },

        _toEdmDate: function (oDate) {
          var sDay = ("00" + oDate.getDate()).slice(-2),
            sMonth = ("00" + (oDate.getMonth() + 1)).slice(-2),
            sYear = ("00" + oDate.getFullYear()).slice(-4);
          return sYear + "-" + sMonth + "-" + sDay;
        },

        onPressEliminar: function (oEvent) {
          var oItem = oEvent.getSource().getParent();
          var sPath = oItem.getBindingContext("crearProgramacion").getPath();
          var oCrearProgramacionModel = this.getModel("crearProgramacion");
          oCrearProgramacionModel
            .getData()
            .programacion.splice(sPath.split("/").pop(), 1);
          oCrearProgramacionModel.refresh(true);
        },

        onRestoreFilters: function (oEvent) {
          var aDefFilters = oEvent.getParameters().selectionSet;
          aDefFilters.forEach((oDefFilter, iPos) => {
            oDefFilter.setValue(null);
          });

          var oSalaProgramacionModel = that
            .getView()
            .getModel("SalaProgramacionModel");
          oSalaProgramacionModel.setData([]);
          oSalaProgramacionModel.refresh(true);

          //var oTableModel = that.byId("idHBProgramacion").getBinding("items");
          //oTableModel.filter(null);
          //oTableModel.refresh(true);
        },
        _getConstantFilterOrden: function (aFilters) {
          var oMaestraList = that.getModel("MaestraModel").getData();
          var aClaseDocumento = oMaestraList[CONSTANT.CLASE_DOC]; //CLASE DOCUMENTO PARA FILTROS DE ORDENES

          if (!aFilters) aFilters = [];
          if (aClaseDocumento) {
            var EQ = FilterOperator.EQ;
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
        onOpenOrdenSearch: function (oEvent) {
          var oRegistro = this.getModel("crearProgramacion").getData();
          var oData = Object.assign({}, oRegistro);
          var aProgramacion = oData.programacion;

          /**
           * valida si la fecha seleccionada no sea menor a 5 días.
           */
          var returnValidForm = this.validarFormAgregarProgramacion(oRegistro);
          if (returnValidForm) {
            this.getModel("crearProgramacion").refresh(true);
            return true;
          }

          /**
           * Valida si la fecha seleccionada no sea menor a 5 dias.
           */
          var aNewDay = this.restarDays(new Date(), 5);
          var dOrig = formatter.getFormatShortDateYMD(aNewDay);
          var dOrig2 = formatter.getFormatShortDate(aNewDay);
          var sDateEval = that._formatYDM(oData.fecha);
          if (sDateEval < dOrig) {
            /**
             * si fecha es menor a la fecha actual programada solo debe de permitir programar una actualización menor a 5 días.
             */
            return MessageToast.show(
              "No es posible ingresar una fecha de programación inferior a 6 días de la fecha actual. \nIngrese una fecha superior / igual a: \n" +
                dOrig2
            );
          }

          var valueDate = Fragment.byId(
            "frgAgregarProgramacion",
            "idDateFechaOrden"
          );
          var oDateFrom = valueDate.getFrom();
          var oDateTo = valueDate.getTo();

          var valueCentro = oRegistro.keyCentro;

          if (oDateFrom !== null && valueCentro !== "") {
            var aFilters = [];
            var oUrlParameters = {};
            aFilters.push(new Filter("Aufnr", EQ, ""));
            aFilters.push(new Filter("Werks", EQ, valueCentro));
            //aFilters.push(new Filter("CentroReserva", EQ, valueCentro));
            aFilters = that._getConstantFilterOrden(aFilters);
            aFilters.push(
              new Filter(
                "Erdat",
                BT,
                that._subtractTimeFromDate(oDateFrom, 5),
                that._subtractTimeFromDate(oDateTo, 5.0003)
              ) //Gstrp : Fecha Liberacion
            );

            /**
             * obtiene todas las ordenes invocando el servicio erp:  OrdenSet
             */
            that.setModel(new JSONModel([]), "OrdenModel");
            that
              ._getODataDinamic(
                that.oModelErp,
                "OrdenSet",
                oUrlParameters,
                aFilters
              )
              .then((oData) => {
                var aOrdenFilter = that._validateOrdenErp(oData);

                /**
                 * Filtrar solo Ordenes con Lote
                 */
                aOrdenFilter = aOrdenFilter.filter((o) => {
                  return o.Charg != "";
                });

                that.setModel(new JSONModel(aOrdenFilter), "OrdenModel");
              })
              .finally(() => {
                /**
                 * Muestra las Ordenes obtenidas en una nueva Ventana: VerOrdenes
                 */
                var sDialog = "VerOrdenes";
                if (!this["o" + sDialog]) {
                  this["o" + sDialog] = sap.ui.xmlfragment(
                    "frgVerOrdenes",
                    rootPath + ".view.centralPesadas.dialog." + sDialog,
                    this
                  );
                  this.getView().addDependent(this["o" + sDialog]);
                }
                this["o" + sDialog].setDraggable(true);
                this["o" + sDialog].setResizable(true);
                //this["o" + sDialog].setMultiSelect(true);
                this["o" + sDialog].open();
              });
          } else {
            MessageBox.warning(
              this.i18nBundle.getText("msgWarningIngresarFechaOrden")
            );
            valueDate.setValueState("Error");
            Fragment.byId("frgAgregarProgramacion", "idCmbOrd").setValueState(
              "Error"
            );
          }
        },
        _validateOrdenErp: function (aOrden) {
          /**
           * AGRUPAR ORDENES POR AUFNR
           */
          var aOrdenGroup = aOrden.reduce(function (r, a) {
            var sKey = a.Aufnr;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
          }, Object.create(null));

          /**
           * VALIDAR QUE LAS ORDENES ESTEN LIBERADOS o ABIERTAS: I0001 o I0002 Y NO QUE TENGAN EL ESTADO I0009, I0010, I0045, I0321
           */

          var aOrdenFilter = [];
          for (var key in aOrdenGroup) {
            var aItem = aOrdenGroup[key];
            var aOrdenCheck = [];
            var aOrdenStat = [];
            aItem.forEach((o) => {
              aOrdenStat.push(o.Stat);
              if (o.Stat === "I0002") {
                //Liberados (LIB.)
                aOrdenCheck.push(o);
                return false;
              } else if (o.Stat === "I0001") {
                //Abiertos ()
                if (!aOrdenCheck.length) {
                  aOrdenCheck.push(o);
                  return false;
                }
              }
            });
            var sStatus = aOrdenStat.join(",");
            if (
              sStatus.includes("I0009") || //Notificado (NOTI)
              sStatus.includes("I0010") || //Notificado Parcial (NOTP)
              sStatus.includes("I0045") || //Cerrada Tecnicamente (CTEC)
              sStatus.includes("I0321") // Movimiento Mercarcia EJecutado (MOV)
            ) {
              aOrdenCheck = [];
            }
            aOrdenFilter = aOrdenFilter.concat(aOrdenCheck);
          }

          aOrdenFilter = that._uniqByKeepFirst(aOrdenFilter, (it) => it.Aufnr);

          return aOrdenFilter;
        },
        onCloseVerOrdenes: function (oEvent) {
          var oSource = oEvent.getSource();
          this._onCloseDialog(oSource);
        },
        _onCloseDialog: function (oSource) {
          //var oSource = oEvent.getSource();
          //var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },
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

        onSelectDialogPress: function () {
          var valueDate = Fragment.byId(
            "frgAgregarProgramacion",
            "idDateFechaOrden"
          );
          var oDateFrom = valueDate.getFrom();
          var oDateTo = valueDate.getTo();

          var valueCentro = that
            .getModel("crearProgramacion")
            .getData().keyCentro;
          var sDialog = "VerOrdenes";
          if (!this["o" + sDialog]) {
            this["o" + sDialog] = sap.ui.xmlfragment(
              "frgVerOrdenes",
              rootPath + ".view.centralPesadas.dialog." + sDialog,
              this
            );
            this.getView().addDependent(this["o" + sDialog]);
          }
          if (oDateFrom !== null && valueCentro !== "") {
            var aFilters = [];
            var oUrlParameters = {};
            aFilters.push(new Filter("Aufnr", FilterOperator.EQ, ""));
            aFilters.push(new Filter("Werks", FilterOperator.EQ, valueCentro));
            //aFilters.push(new Filter("Auart", FilterOperator.EQ, ""));
            aFilters = that._getConstantFilterOrden(aFilters);
            aFilters.push(
              new Filter(
                "Gstrp",
                FilterOperator.BT,
                that._subtractTimeFromDate(oDateFrom, 5),
                that._subtractTimeFromDate(oDateTo, 5)
              ) //Gstrp : Fecha aprobacion de la Orden
            );
            that
              ._getODataDinamic(
                that.oModelErp,
                "OrdenSet",
                oUrlParameters,
                aFilters
              )
              .then((oData) => {
                var aOrdenFilter = that._validateOrdenErp(oData);
                that.setModel(new JSONModel(aOrdenFilter), "OrdenModel");
              })
              .finally(() => {
                this["o" + sDialog].open();
              });
          } else {
            MessageBox.warning(
              this.i18nBundle.getText("msgWarningIngresarFechaOrden")
            );
            valueDate.setValueState("Error");
            Fragment.byId("frgAgregarProgramacion", "idCmbOrd").setValueState(
              "Error"
            );
          }
        },
        onShowListMaterial: function (oEvent) {
          that.setModel(new JSONModel([]), "OrdenListaMaterialModel");
          var oObject = oEvent
            .getSource()
            .getBindingContext("crearProgramacion")
            .getObject();

          if (oObject) {
            var aFilters = [];
            var EQ = FilterOperator.EQ;

            aFilters.push(new Filter("Rsnum", EQ, oObject.numReserva));
            aFilters.push(new Filter("Bwart", EQ, ""));
            aFilters.push(new Filter("Werks", EQ, oObject.centro));

            that
              ._getODataDinamic(that.oModelErp, "ReservaSet", {}, aFilters)
              .then((aResp) => {
                var aCentro = that.getModel("CentroModel").getData();
                var aListMessage = [];
                for (var key in aResp) {
                  var oItem = aResp[key];
                  var oCentro = aCentro.find((o) => o.Bwkey === oItem.Werks);
                  oItem.oCentro = oCentro;
                  var sUMB = oItem.Meins.toUpperCase();
                  if (["L", "ML", "KG", "G"].includes(sUMB)) {
                    /**
                     * Validar si la sala tiene configurado una balanza analitica
                     */
                    var oParam = that.getModel("crearProgramacion").getData();
                    var aMaestraList = that.getModel("MaestraModel").getData();
                    var aTipoBalanza = aMaestraList["TIPO_BALANZA"]; //TIPO BALANZA
                    var oBalanzaAnalitic = aTipoBalanza.find((o) => {
                      return o.codigo === "TB2"; //Balanzan Analitica
                    });
                    var oBalAnalitica = oParam.aBalanza.find((o) => {
                      return (
                        o.oTipoBalanza_iMaestraId !==
                        oBalanzaAnalitic.iMaestraId
                      );
                    });

                    /**
                     * Validar si cantidad es menor a 100 umb
                     */
                    var iValidateMenge = oItem.Bdmng;

                    switch (sUMB) {
                      case "KG":
                        iValidateMenge = formatter.convertKgToG(oItem.Bdmng);
                        sUMB = "G";
                        break;
                      case "L":
                        iValidateMenge = formatter.convertLToMl(oItem.Bdmng);
                        sUMB = "ML";
                        break;
                      default:
                        iValidateMenge = oItem.Bdmng;
                        break;
                    }

                    if (+iValidateMenge < 100) {
                      if (oBalAnalitica) {
                      } else {
                        aListMessage.push(
                          oItem.Maktx + " Cantidad menor a 100 " + sUMB
                        );
                      }
                    }
                  }
                }

                if (aListMessage.length) {
                  that._showServiceListMessage(
                    "Se entraron las siguientes observaciones: ",
                    aListMessage
                  );
                }

                oObject.aListMaterial = aResp;
                that.setModel(new JSONModel(aResp), "OrdenListaMaterialModel");
                that.getModel("crearProgramacion").refresh(true);

                if (aResp && aResp.length) {
                  var sDialog = "VerListaMaterial";
                  if (!that["o" + sDialog]) {
                    that["o" + sDialog] = sap.ui.xmlfragment(
                      "frg" + sDialog,
                      rootPath + ".view.centralPesadas.dialog." + sDialog,
                      that
                    );
                    that.getView().addDependent(that["o" + sDialog]);
                  }
                  that["o" + sDialog].open();
                }
              })
              .catch((oResult) => {
                sap.ui.core.BusyIndicator.hide();
                var oResp = JSON.parse(oResult.responseText);
                MessageBox.error(oResp.error.message.value);
              })
              .finally(() => {});
          }
        },
        onSearchDialogVerOrdenes: function (oEvent) {
          var sText = oEvent ? oEvent.getParameter("query") : null;
          var oTableModel = sap.ui.core.Fragment.byId(
            "frgVerOrdenes",
            "idOrdenSearch"
          ).getBinding();

          var aFilter = new Filter({
            filters: [
              new Filter("Aufnr", FilterOperator.Contains, sText),
              new Filter("Maktx", FilterOperator.Contains, sText),
              new Filter("Charg", FilterOperator.Contains, sText),
            ],
            and: false,
          });
          oTableModel.filter(aFilter);
          oTableModel.refresh(true);
        },
        onConfirmDialogVerOrdenes: function (oEvent) {
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([]);

          var aContexts = oEvent.getParameter("selectedContexts");
          if (aContexts && aContexts.length) {
            aContexts
              .map((oContext) => {
                return oContext.getObject().Aufnr;
              })
              .join(",");
          }

          var oOrdenProgramacion = this.getModel("crearProgramacion").getData(),
            oOrdenSeleccionada = oEvent
              .getParameters()
              .selectedContexts[0].getObject();

          if (oOrdenSeleccionada["Charg"]) {
            /**
             * Variables para obtener Lista Material:
             * Stlnr, Plnbez, Werks
             */

            oOrdenProgramacion["lstMaterial"] = oOrdenSeleccionada["Stlnr"];
            oOrdenProgramacion["centro"] = oOrdenSeleccionada["Werks"];
            oOrdenProgramacion["keyProducto"] = oOrdenSeleccionada["Plnbez"];

            oOrdenProgramacion["orden"] = oOrdenSeleccionada["Aufnr"];
            oOrdenProgramacion["lote"] = oOrdenSeleccionada["Charg"];
            oOrdenProgramacion["estado"] = oOrdenSeleccionada["Txt30"];
            oOrdenProgramacion["valueProducto"] = oOrdenSeleccionada["Maktx"];

            oOrdenProgramacion["estadoOrdenErp"] = oOrdenSeleccionada["Stat"];
            oOrdenProgramacion["clasOrdProd"] = oOrdenSeleccionada["Auart"];
            oOrdenProgramacion["nivelFab"] = oOrdenSeleccionada["Nfabr"];
            oOrdenProgramacion["acondicionado"] = oOrdenSeleccionada["Acond"];
            oOrdenProgramacion["numReserva"] = oOrdenSeleccionada["Rsnum"];

            oOrdenProgramacion["valueStateOrden"] = "Success";

            this.getModel("crearProgramacion").refresh(true);
            Fragment.byId(
              "frgAgregarProgramacion",
              "idInpOrdenMatchCode"
            ).setValue(oOrdenSeleccionada["Aufnr"]);
          } else {
            return MessageBox.error(
              "La orden ( " +
                oOrdenSeleccionada["Aufnr"] +
                " ) selecionada no tiene Lote."
            );
          }
        },
        onChangeDateinicioAgregarProgramacion: function (oEvent) {
          oEvent.getSource().setValueState("None");
        },

        _stringDateToDate: function (sDate) {
          return new Date(
            parseInt("20" + sDate.slice(5, 7)),
            parseInt(sDate.slice(2, 4)) - 1,
            parseInt(sDate.slice(0, 1))
          );
        },

        _getBaseAuditModel: function (sType = "C") {
          var oBaseModel = {
            terminal: "",
            fechaRegistro: new Date(),
            usuarioRegistro: that.sUser,
            fechaActualiza: new Date(),
            usuarioActualiza: that.sUser,
            activo: true,
          };

          if (sType === "U") {
            delete oBaseModel.fechaRegistro;
            delete oBaseModel.usuarioRegistro;
          }

          return oBaseModel;
        },
        _createRequestedModel: function (sEntity, oBaseModel, oData) {
          switch (sEntity) {
            case "Producto":
              oBaseModel["productoId"] = that._getUuidv4();
              oBaseModel["codigo"] = oData["keyProducto"];
              oBaseModel["nombre"] = oData["valueProducto"];
              break;
            case "Orden":
              oBaseModel["ordenId"] = that._getUuidv4();
              oBaseModel["lote"] = oData["lote"];
              oBaseModel["numero"] = oData["orden"];
              oBaseModel["codProdTerm"] = oData["keyProducto"];
              oBaseModel["nomProdTerm"] = oData["valueProducto"];
              oBaseModel["estadoOrdenErp"] = oData["estadoOrdenErp"];
              oBaseModel["clasOrdProd"] = oData["clasOrdProd"];
              oBaseModel["nivelFab"] = oData["nivelFab"];
              oBaseModel["acondicionado"] = oData["acondicionado"];
              //oBaseModel["lstMaterial"] = oData["lstMaterial"];
              oBaseModel["centro"] = oData["centro"];
              break;
            case "Programacion":
              oBaseModel["programacionId"] = that._getUuidv4();
              oBaseModel["fechaProgramacion"] = oData["fecha"];
              oBaseModel["oSalaPesaje_salaPesajeId"] = oData["keySala"];

              break;
          }
          return oBaseModel;
        },
        _validateAccionAsigned: function (sAction) {
          var sRol = that.sRol;
          if (!sRol) return false;
          if (sRol.includes("CPPROWNER")) return true;

          var bValid = false;
          switch (sAction) {
            case "AGREGAR":
              bValid = sRol.includes("CPPRCREA");
              break;
            case "ACTUALIZAR":
              bValid = sRol.includes("CPPRMODI");
              break;
            case "ELIMINAR":
              bValid = sRol.includes("CPPRELIM");
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
        _getUuidv4: function () {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
              c ^
              (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
          );
        },
      }
    );
  }
);
