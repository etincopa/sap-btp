sap.ui.define(
  [
    "./BaseController",
    "com/medifarma/cp/salapesajepesomanual/model/models",
    "com/medifarma/cp/salapesajepesomanual/services/Maestro",
    "com/medifarma/cp/salapesajepesomanual/services/SalaPesaje",
    "com/medifarma/cp/salapesajepesomanual/services/Log",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/medifarma/cp/salapesajepesomanual/util/http",
    "com/medifarma/cp/salapesajepesomanual/util/oDataService",
    "sap/ui/core/format/DateFormat",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    models,
    maestro,
    salaPesaje,
    log,
    BusyIndicator,
    MessageBox,
    MessageToast,
    http,
    oDataService,
    DateFormat,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";
    const rootPath = "com.medifarma.cp.salapesajepesomanual";
    const EdmType = exportLibrary.EdmType;
    var self = null,
      goModel = null,
      goOwnerComponent = null;
    return BaseController.extend(
      "com.medifarma.cp.salapesajepesomanual.controller.Home",
      {
        onInit: function () {
          this.init();
          maestro.init(this.oServiceModel);
          salaPesaje.init(this.oServiceModel);
          log.init(this.oServiceModel);
        },
        onPressLog: async function () {
          try {
            BusyIndicator.show(0);
            const oSala = this.oLocalModel.getProperty("/Sala");
            const aLogDetalle = await log.obtenerLogDetalle(oSala.salaPesajeId);

            aLogDetalle.forEach(function (d) {
              (d.valorAnterior = log.formatoFechaLog(d.valorAnterior)),
                (d.valorActual = log.formatoFechaLog(d.valorActual));
            });

            this.oLocalModel.setProperty("/LogDetalle", aLogDetalle);
            if (!this.oLog) {
              this.oLog = sap.ui.xmlfragment(
                "frgLog",
                rootPath + ".view.dialog.Log",
                this
              );
              this.getView().addDependent(this.oLog);
            }

            BusyIndicator.hide();
            this.oLog.open();
          } catch (oError) {
            BusyIndicator.hide();
            console.log(oError);
          }
        },
        onPressOpenConfirm: async function () {
          const sUsuario =
            sap.ushell === undefined
              ? "ederedson.matienzodurand.sa@everis.nttdata.com"
              : sap.ushell.Container.getService("UserInfo")
                  .getUser()
                  .getEmail();

          this.oLocalModel.setProperty("/Usuario", sUsuario);
          this.oLocalModel.setProperty("/Contrasenia", "");

          if (!this.oConfirm) {
            this.oConfirm = sap.ui.xmlfragment(
              "frgConfirm",
              rootPath + ".view.dialog.Confirm",
              this
            );
            this.getView().addDependent(this.oConfirm);
          }

          this.oConfirm.open();
        },
        onPressCancel: async function () {
          this.oConfirm.close();
        },
        onAfterRendering: async function () {
          BusyIndicator.show(0);
          /*var aSalaPesajeCentro = await maestro.obtenerSalaPesajes(null);
                var aPlantas = [];
                for (var key in aSalaPesajeCentro) {
                    var oSalaPesaje = aSalaPesajeCentro[key];
                    var oPlanta = oSalaPesaje.oPlanta;
                    if(oPlanta) {
                        aPlantas.push(oPlanta);
                    }                    
                }
                var aPlantas = this._UniqByKeepFirst(
                    aPlantas,
                    (it) => it.iMaestraId
                );
                aPlantas.splice(0, 0, {iMaestraId: "", contenido: "Seleccionar..."});*/
          const aPlantas = await maestro.obtenerPlantas();
          this.oLocalModel.setProperty("/Plantas", aPlantas);

          const aEstados = await maestro.obtenerEstadosSalaPesaje();
          this.oLocalModel.setProperty("/Estados", aEstados);

          this.oLocalModel.setProperty("/Filtros", { plantaId: "0" });
          const aHoras = [];
          aHoras.push({
            codigo: "",
            descripcion: this.oResourceBundle.getText("lblSeleccionar"),
          });
          for (let i = 1; i < 25; i++) {
            aHoras.push({ codigo: i, descripcion: i + " - HORA" });
          }

          const aMinutos = [];
          aMinutos.push({
            codigo: "",
            descripcion: this.oResourceBundle.getText("lblSeleccionar"),
          });

          for (let i = 1; i < 9; i++) {
            aMinutos.push({ codigo: i * 30, descripcion: i * 30 + " - MIN" });
          }

          this.oLocalModel.setProperty("/Horas", aHoras);
          this.oLocalModel.setProperty("/Minutos", aMinutos);
          BusyIndicator.hide();
        },
        formatoFechaFin: function (fechaInicio, horaLectura) {
          if (fechaInicio == null) return "";

          const dFechaInicio = new Date(fechaInicio);
          const dNuevaFecha = new Date(
            dFechaInicio.valueOf() + horaLectura * 60 * 1000
          );
          const sResult = DateFormat.getDateInstance({
            pattern: "dd/MM/yyyy HH:mm",
          }).format(dNuevaFecha);

          return sResult;
        },
        onRestoreFilters: function () {
          this.oLocalModel.setProperty("/Filtros", { plantaId: "0" });
        },
        onExportar: function (oEvent) {
          var _oTable = oEvent.getSource().getParent().getParent();
          var oRowBinding, oSettings, oSheet, oTable;

          const _aColumns = _oTable.getColumns();
          const aCols = [];
          _aColumns.forEach(function (item) {
            if (item.getSortProperty() != "") {
              var oColumn = {
                label: item.getLabel().getText(),
                property: item.getSortProperty(),
                type: EdmType.String,
              };

              if (
                oColumn.property == "inicioPesoManual" ||
                oColumn.property == "finPesoManual"
              ) {
                (oColumn.type = sap.ui.export.EdmType.DateTime),
                  (oColumn.format = "dd/MM/yyyy HH:mm"),
                  (oColumn.utc = false);
              }
              aCols.push(oColumn);
            }
          });

          oTable = _oTable;
          oRowBinding = oTable.getBinding("rows");
          var aSala = oRowBinding.getModel("localModel").getData().Salas;
          aSala.sort((a, b) =>
            a.sala > b.sala ? 1 : b.sala > a.sala ? -1 : 0
          );

          oSettings = {
            workbook: {
              columns: aCols,
              hierarchyLevel: "Level",
              context: {
                sheetName: "Peso Manual",
              },
            },
            dataSource: aSala,
            fileName: "Peso_Manual.xlsx",
            worker: false, // We need to disable worker because we are using a MockServer as OData Service
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        },
        onSearch: async function () {
          BusyIndicator.show(0);
          const oFiltros = this.oLocalModel.getProperty("/Filtros");

          const aSalas = await salaPesaje.obtenerSalas(oFiltros.plantaId);
          this.oLocalModel.setProperty("/Salas", aSalas);
          BusyIndicator.hide();
        },
        onBorrarPress: async function (oEvent) {
          const oLineaActual = oEvent
            .getSource()
            .getParent()
            .getBindingContext("localModel")
            .getObject();
          const that = this;
          MessageBox.confirm(this.oResourceBundle.getText("msjPreguntaBaja"), {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: async function (oAction) {
              if (oAction === "YES") {
                BusyIndicator.show(0);

                const aEstados = that.oLocalModel.getProperty("/Estados");
                const oEstado = aEstados.find((e) => e.codigo === "DHABI");
                oLineaActual.oEstado_iMaestraId = oEstado.iMaestraId;
                oLineaActual.oEstado = oEstado;
                oLineaActual.Editar = true;
                that.oLocalModel.refresh(true);
                await salaPesaje.actualizarSala(oLineaActual);
                BusyIndicator.hide();
              }
            },
          });
        },
        onEditarPress: async function (oEvent) {
          this.oLocalModel.setProperty("/Sala", {});
          const oLineaActual = oEvent
            .getSource()
            .getParent()
            .getBindingContext("localModel")
            .getObject();

          this.oLocalModel.setProperty(
            "/Sala",
            JSON.parse(JSON.stringify(oLineaActual))
          );
          this.oLocalModel.setProperty("/Sala/Editar", true);
          if (!this.oCreate) {
            this.oCreate = sap.ui.xmlfragment(
              "frgCreate",
              rootPath + ".view.dialog.Create",
              this
            );
            this.getView().addDependent(this.oCreate);
          }

          this.oCreate.open();
        },
        onPressSave: async function (oEvent) {
          const self = this;
          const oSource = oEvent.getSource();
          const oParent = oSource.getParent();
          const oParentConfirm = oSource.getParent().getParent();
          try {
            const aEstados = this.oLocalModel.getProperty("/Estados");

            BusyIndicator.show(0);

            let sUsuario = this.oLocalModel.getProperty("/Usuario");
            let sContrasenia = this.oLocalModel.getProperty("/Contrasenia");
            //await salaPesaje.validate(sUsuario, sContrasenia);
            var sLogin = "fnValidate";
            var urlParameters = {
              auth: btoa(sUsuario + ":" + sContrasenia),
            };
            sap.ui.core.BusyIndicator.show(0);
            oDataService
              .oDataRead(this.oServiceModel, sLogin, urlParameters, null)
              .then((oData) => {
                sap.ui.core.BusyIndicator.hide();
                var aResult = oData.fnValidate;
                const oSala = self.oLocalModel.getProperty("/Sala");
                const oEstado = aEstados.find(
                  (e) =>
                    e.iMaestraId ===
                    parseInt(oSala.oEstadoPesoManual_iMaestraId)
                );
                
                if (aResult == "0" || aResult.hasOwnProperty('error')) {
                  MessageBox.error(
                    "Usuario incorrecto, comuniquese con un administrador."
                  );
                  return;
                }

                if (oEstado.codigo == "HABIL") {
                  oSala.inicioPesoManual = new Date();
                } else {
                  oSala.inicioPesoManual = null;
                  oSala.finPesoManual = null;
                }

                oSala.usuarioActualiza =
                  sap.ushell === undefined
                    ? "ederedson.matienzodurand.sa@everis.nttdata.com"
                    : sap.ushell.Container.getService("UserInfo")
                        .getUser()
                        .getEmail();

                if (oSala.inicioPesoManual != null) {
                  const dFechaInicio = new Date(oSala.inicioPesoManual);
                  const dNuevaFecha = new Date(
                    dFechaInicio.valueOf() + oSala.minutPesoManual * 60 * 1000
                  );
                  oSala.finPesoManual = dNuevaFecha;
                }

                const aRequeridos = ["oEstadoPesoManual_iMaestraId"];

                let bResultado = true;

                aRequeridos.forEach(function (item) {
                  if (!oSala[item]) {
                    bResultado = false;
                    return;
                  } else if (oSala[item] == "") {
                    bResultado = false;
                    return;
                  }
                });
                if (!bResultado) {
                  MessageBox.error(
                    self.oResourceBundle.getText("msjRequeridos")
                  );
                  return;
                }

                salaPesaje.actualizarSala(this._buildEntity(oSala));

                self.onSearch();
                MessageToast.show(
                  self.oResourceBundle.getText("msjRegistrosActualizados")
                );
                self.oConfirm.close();
                self.oCreate.close();
              })
              .catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(
                  "Usuario incorrecto, comuniquese con un administrador."
                );
              })
              .finally(function () {
                // sap.ui.core.BusyIndicator.hide();
              });
          } catch (err) {
            MessageBox.error(err.message);
          }
          BusyIndicator.hide();
        },
        onPressClose: function (oEvent) {
          var oSource = oEvent.getSource();
          var sCustom = oSource.data("custom");
          var oParent = oSource.getParent();
          oParent.close();
        },
        _buildEntity: function (oData) {
          var oAction = {
            Editar: this._boleanCheckF(oData.Editar),
          };
          var oEntity = {
            salaPesajeId: oData.salaPesajeId,
            sala: oData.sala,
            ipPc: oData.ipPc,
            horaTaraManual: oData.horaTaraManual,
            inicioTaraManual: oData.inicioTaraManual,
            inicioPesoManual: oData.inicioPesoManual,
            inicioLectEtiqueta: oData.inicioLectEtiqueta,
            finTaraManual: oData.finTaraManual,
            finPesoManual: oData.finPesoManual,
            finLectEtiqueta: oData.finLectEtiqueta,
            minutPesoManual: oData.minutPesoManual,
            horaLectEtiqueta: oData.horaLectEtiqueta,
            oPlanta_iMaestraId: oData.oPlanta_iMaestraId,
            oEstado_iMaestraId: oData.oEstado_iMaestraId,
            oEstadoTaraManual_iMaestraId: oData.oEstadoTaraManual_iMaestraId,
            oEstadoPesoManual_iMaestraId: oData.oEstadoPesoManual_iMaestraId
              ? parseInt(oData.oEstadoPesoManual_iMaestraId)
              : null,
            oEstadoLecturaEtiqueta_iMaestraId:
              oData.oEstadoLecturaEtiqueta_iMaestraId,

            //terminal: oData.terminal,
            activo: this._boleanCheckT(oData.activo),
            usuarioRegistro: oData.usuarioRegistro ? oData.usuarioRegistro : "",
            usuarioActualiza: oData.usuarioActualiza
              ? oData.usuarioActualiza
              : "",
            fechaRegistro: oData.fechaRegistro
              ? oData.fechaRegistro
              : new Date(),
            fechaActualiza: oData.fechaActualiza
              ? oData.fechaActualiza
              : new Date(),
          };
          var oBody = { ...oEntity, ...oAction };
          return oBody;
        },
        _boleanCheckF: function (bValue) {
          if (bValue === undefined || bValue === null) {
            bValue = false;
          }
          return bValue;
        },
        _boleanCheckT: function (bValue) {
          if (bValue === undefined || bValue === null) {
            bValue = true;
          }
          return bValue;
        },
      }
    );
  }
);
