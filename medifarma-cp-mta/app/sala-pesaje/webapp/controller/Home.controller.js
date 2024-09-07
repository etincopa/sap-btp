sap.ui.define(
  [
    "./BaseController",
    "com/medifarma/cp/salapesaje/model/models",
    "com/medifarma/cp/salapesaje/services/Maestro",
    "com/medifarma/cp/salapesaje/services/SalaPesaje",
    "com/medifarma/cp/salapesaje/services/Log",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/medifarma/cp/salapesaje/util/http",
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
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";
    const rootPath = "com.medifarma.cp.salapesaje";
    const EdmType = exportLibrary.EdmType;

    return BaseController.extend(
      "com.medifarma.cp.salapesaje.controller.Home",
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
        onCreate: async function () {
          this.oLocalModel.setProperty("/Sala", {});
          this.oLocalModel.setProperty("/Sala/Editar", false);
          this.oLocalModel.setProperty("/Sala/salaPesajeId", http.uuidv4());

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
        onExportar: function (oEvent) {
          var _oTable = oEvent.getSource().getParent().getParent();
          var oRowBinding, oSettings, oSheet, oTable;

          const _aColumns = _oTable.getColumns();
          const aCols = [];
          _aColumns.forEach(function (item) {
            if (item.getSortProperty() != "") {
              var type = EdmType.String;
              var valueMap = {
                X: "SI",
                "": "NO",
              };

              if (
                ["estadoImpresora", "conexion"].includes(item.getSortProperty())
              ) {
                type = EdmType.Enumeration;
                if (item.getSortProperty() == "estadoImpresora") {
                  valueMap = {
                    X: "HABILITADO",
                    "": "DESHABILITADO",
                  };
                }
              } else if (["activo"].includes(item.getSortProperty())) {
                type = EdmType.Boolean;
              }

              if (EdmType.Enumeration == type) {
                aCols.push({
                  label: item.getLabel().getText(),
                  property: item.getSortProperty(),
                  type: type,
                  valueMap: valueMap,
                });
              } else if (EdmType.Boolean == type) {
                aCols.push({
                  label: item.getLabel().getText(),
                  property: item.getSortProperty(),
                  type: type,
                  trueValue: "HABILITADO",
                  falseValue: "DESHABILITADO",
                });
              } else {
                aCols.push({
                  label: item.getLabel().getText(),
                  property: item.getSortProperty(),
                  type: type,
                });
              }
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
                sheetName: "Pesaje Accesos Restringidos",
              },
            },
            dataSource: aSala,
            fileName: "Pesaje_Accesos_Restringidos.xlsx",
            worker: false, // We need to disable worker because we are using a MockServer as OData Service
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        },
        onAfterRendering: async function () {
          BusyIndicator.show(0);
          const aPlantas = await maestro.obtenerPlantas();
          this.oLocalModel.setProperty("/Plantas", aPlantas);

          const aEstadosHab = await maestro.obtenerEstadosHabilitado();
          this.oLocalModel.setProperty("/Estados", aEstadosHab);
          this.oLocalModel.setProperty("/EstadosHab", aEstadosHab);

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

          for (let i = 1; i < 17; i++) {
            aMinutos.push({ codigo: i * 30, descripcion: i * 30 + " - MIN" });
          }

          this.oLocalModel.setProperty("/Horas", aHoras);
          this.oLocalModel.setProperty("/Minutos", aMinutos);
          BusyIndicator.hide();
        },
        onRestoreFilters: function () {
          this.oLocalModel.setProperty("/Filtros", { plantaId: "0" });
        },
        onSearch: async function () {
          BusyIndicator.show(0);
          const oFiltros = this.oLocalModel.getProperty("/Filtros");

          const aSalas = await salaPesaje.obtenerSalas(oFiltros.plantaId);
          this.oLocalModel.setProperty("/Salas", aSalas);
          BusyIndicator.hide();
        },
        validateIPaddress: function (ipaddress) {
          if (
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
              ipaddress
            )
          ) {
            return true;
          }
          return false;
        },
        onActivarPress: async function (oEvent) {
          const oLineaActual = oEvent
            .getSource()
            .getParent()
            .getBindingContext("localModel")
            .getObject();
          const that = this;
          MessageBox.confirm(
            this.oResourceBundle.getText("msjPreguntaActivar"),
            {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: async function (oAction) {
                if (oAction === "YES") {
                  BusyIndicator.show(0);

                  oLineaActual.usuarioActualiza =
                    sap.ushell === undefined
                      ? "ederedson.matienzodurand.sa@everis.nttdata.com"
                      : sap.ushell.Container.getService("UserInfo")
                          .getUser()
                          .getEmail();

                  oLineaActual.activo = true;
                  oLineaActual.Editar = true;

                  await salaPesaje.actualizarSala(
                    that._buildEntity(oLineaActual)
                  );
                  that.onSearch();
                  BusyIndicator.hide();
                }
              },
            }
          );
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

                oLineaActual.usuarioActualiza =
                  sap.ushell === undefined
                    ? "ederedson.matienzodurand.sa@everis.nttdata.com"
                    : sap.ushell.Container.getService("UserInfo")
                        .getUser()
                        .getEmail();

                oLineaActual.activo = false;
                oLineaActual.Editar = true;

                await salaPesaje.actualizarSala(
                  that._buildEntity(oLineaActual)
                );
                that.onSearch();
                BusyIndicator.hide();
              }
            },
          });
        },
        onEditarPress: async function (oEvent) {
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
        onDelete: async function (oEvent) {
          const that = this;
          MessageBox.warning(this.oResourceBundle.getText("msjEliminar"), {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.OK,
            onClose: async function (sAction) {
              if (sAction == "YES") {
                BusyIndicator.show(0);
                const tblResultados = that.byId("tblResultados");
                const aIndices = tblResultados.getSelectedIndices();
                const aItems = that.oLocalModel.getProperty("/Salas");
                for (let i = 0; i < aItems.length; i++) {
                  const oSala = aItems[aIndices[0]];
                  oSala.activo = false;
                  oSala.Editar = true;
                  await sala.actualizarSala(that._buildEntity(oSala));
                }
                BusyIndicator.hide();

                that.onSearch();
              }
            },
          });
        },
        onPressSave: async function (oEvent) {
          const oSource = oEvent.getSource();
          const oParent = oSource.getParent();

          try {
            const oSala = this.oLocalModel.getProperty("/Sala");

            const aRequeridos = [
              "horaTaraManual",
              "minutPesoManual",
              "horaLectEtiqueta",
              "oPlanta_iMaestraId",
              "sala",
              "ipPc",
            ];

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
              MessageBox.error(this.oResourceBundle.getText("msjRequeridos"));
              return;
            }

            if (!this.validateIPaddress(oSala.ipPc)) {
              MessageBox.error(this.oResourceBundle.getText("msjIPInvalido"));
              return;
            }

            const bNombreValido = await salaPesaje.validarNombre(
              oSala.salaPesajeId,
              oSala.sala
            );
            if (bNombreValido) {
              MessageBox.error(
                this.oResourceBundle.getText("msjNombreDuplicado")
              );
              return;
            }

            const bIpValido = await salaPesaje.validarIp(
              oSala.salaPesajeId,
              oSala.ipPc
            );
            if (bIpValido) {
              MessageBox.error(this.oResourceBundle.getText("msjIPDuplicado"));
              return;
            }

            BusyIndicator.show(0);
            const bEditar = oSala.Editar;
            if (!bEditar) {
              const aEstadosHab = this.oLocalModel.getProperty("/EstadosHab");
              const oEstado = aEstadosHab.find((e) => e.codigo === "HABIL");
              const oEstadosHab = aEstadosHab.find((e) => e.codigo === "DHABI");
              oSala.oEstado_iMaestraId = oEstado.iMaestraId;
              oSala.oEstadoTaraManual_iMaestraId = oEstadosHab.iMaestraId;
              oSala.oEstadoPesoManual_iMaestraId = oEstadosHab.iMaestraId;
              oSala.oEstadoLecturaEtiqueta_iMaestraId = oEstadosHab.iMaestraId;
            }

            oSala.usuarioActualiza =
              sap.ushell === undefined
                ? "ederedson.matienzodurand.sa@everis.nttdata.com"
                : sap.ushell.Container.getService("UserInfo")
                    .getUser()
                    .getEmail();

            try {
              await salaPesaje.actualizarSala(this._buildEntity(oSala));
              this.onSearch();
              MessageToast.show(
                this.oResourceBundle.getText("msjRegistrosActualizados")
              );
              oParent.close();
            } catch (ex) {
              oSala.Editar = bEditar;
              if (
                ex.responseText.includes("constraint violation") ||
                ex.responseText.includes("Entity already")
              ) {
                MessageBox.error("Nombre de sala duplicado.");
              }
            }
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
            //terminal: oData.terminal,
            activo: this._boleanCheckT(oData.activo),
            salaPesajeId: oData.salaPesajeId,
            sala: oData.sala,
            ipPc: oData.ipPc,
            horaTaraManual: oData.horaTaraManual,
            minutPesoManual: oData.minutPesoManual,
            horaLectEtiqueta: oData.horaLectEtiqueta,
            finLectEtiqueta: oData.finLectEtiqueta,
            finPesoManual: oData.finPesoManual,
            finTaraManual: oData.finTaraManual,
            inicioLectEtiqueta: oData.inicioLectEtiqueta,
            inicioPesoManual: oData.inicioPesoManual,
            inicioTaraManual: oData.inicioTaraManual,
            oPlanta_iMaestraId: oData.oPlanta_iMaestraId,
            oEstado_iMaestraId: oData.oEstado_iMaestraId,
            oEstadoTaraManual_iMaestraId: oData.oEstadoTaraManual_iMaestraId,
            oEstadoPesoManual_iMaestraId: oData.oEstadoPesoManual_iMaestraId,
            oEstadoLecturaEtiqueta_iMaestraId:
              oData.oEstadoLecturaEtiqueta_iMaestraId,

            usuarioActualiza: oData.usuarioActualiza
              ? oData.usuarioActualiza
              : "",
            usuarioRegistro: oData.usuarioRegistro ? oData.usuarioRegistro : "",
            fechaActualiza: oData.fechaActualiza
              ? oData.fechaActualiza
              : new Date(),
            fechaRegistro: oData.fechaRegistro
              ? oData.fechaRegistro
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
