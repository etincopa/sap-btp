sap.ui.define(
  [
    "./BaseController",
    "com/medifarma/cp/balanza/model/models",
    "com/medifarma/cp/balanza/services/Maestro",
    "com/medifarma/cp/balanza/services/Balanza",
    "com/medifarma/cp/balanza/services/Log",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/medifarma/cp/balanza/util/http",
    "sap/ui/core/format/NumberFormat",
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
    balanza,
    log,
    BusyIndicator,
    MessageBox,
    MessageToast,
    http,
    NumberFormat,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";
    const rootPath = "com.medifarma.cp.balanza";
    const EdmType = exportLibrary.EdmType;
    var that = null;
    return BaseController.extend("com.medifarma.cp.balanza.controller.Home", {
      onInit: function () {
        that = this;
        this.init();
        maestro.init(this.oServiceModel);
        balanza.init(this.oServiceModel);
        log.init(this.oServiceModel);
      },
      onPressLog: async function () {
        const oBalanza = this.oLocalModel.getProperty("/Balanza");
        const aLogDetalle = await log.obtenerLogDetalle(
          oBalanza.balanzaId,
          this.oLocalModel
        );
        this.oLocalModel.setProperty("/LogDetalle", aLogDetalle);
        if (!this.oLog) {
          this.oLog = sap.ui.xmlfragment(
            "frgLog",
            rootPath + ".view.dialog.Log",
            this
          );
          this.getView().addDependent(this.oLog);
        }

        this.oLog.open();
      },
      onPlantaChange: async function () {
        const oFiltros = this.oLocalModel.getProperty("/Filtros");
        const aSalaPesajes = await maestro.obtenerSalaPesajes(
          oFiltros.plantaId
        );
        this.oLocalModel.setProperty("/SalaPesajes", aSalaPesajes);
      },
      onBalanzaPlantaChange: async function () {
        const iPlantaid = this.oLocalModel.getProperty("/Balanza_plantaId");
        const aSalaPesajes = await maestro.obtenerSalaPesajes(iPlantaid);
        this.oLocalModel.setProperty("/Balanza_SalaPesajes", aSalaPesajes);
      },
      onChangeConexion: function (oEvent) {
        this.oLocalModel.setProperty(
          "/Balanza/conexion",
          oEvent.getSource().getState() ? "X" : ""
        );
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
              ["activoBalanza", "conexion"].includes(item.getSortProperty())
            ) {
              type = EdmType.Enumeration;
              if (item.getSortProperty() == "activoBalanza") {
                valueMap = {
                  X: "HABILITADO",
                  "": "DESHABILITADO",
                };
              }
            }

            if (EdmType.Enumeration == type) {
              aCols.push({
                label: item.getLabel().getText(),
                property: item.getSortProperty(),
                type: type,
                valueMap: valueMap,
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

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
            context: {
              sheetName: "Mantenimiento Balanzas",
            },
          },
          dataSource: oRowBinding,
          fileName: "Mantenimiento_Balanzas.xlsx",
          worker: false, // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      formatoDecimales: function (numero, decimales) {
        const oFloatNumberFormat = NumberFormat.getFloatInstance({
          maxFractionDigits: decimales,
          minFractionDigits: decimales,
          groupingEnabled: true,
          groupingSeparator: ",",
          decimalSeparator: ".",
        });

        return oFloatNumberFormat.format(numero);
      },
      onAfterRendering: async function () {
        BusyIndicator.show(0);

        const aSalaPesajes = await maestro.obtenerSalaPesajes(0);
        this.oLocalModel.setProperty("/SalaPesajesAll", aSalaPesajes);
        this.oLocalModel.setProperty("/SalaPesajes", aSalaPesajes);

        var aSalaPesajeCentro = await maestro.obtenerSalaPesajes(null);
        var aPlantas = [];
        for (var key in aSalaPesajeCentro) {
          var oSalaPesaje = aSalaPesajeCentro[key];
          var oPlanta = oSalaPesaje.oPlanta;
          if (oPlanta) {
            aPlantas.push(oPlanta);
          }
        }
        var aPlantas = this._UniqByKeepFirst(aPlantas, (it) => it.iMaestraId);
        aPlantas.sort((a, b) =>
          a.contenido > b.contenido ? 1 : b.contenido > a.contenido ? -1 : 0
        );
        aPlantas.splice(0, 0, { iMaestraId: "", contenido: "Seleccionar..." });
        this.oLocalModel.setProperty("/Plantas", aPlantas);

        const aTipoBalanzas = await maestro.obtenerTipoBalanzas();
        this.oLocalModel.setProperty("/TipoBalanzas", aTipoBalanzas);

        this.oLocalModel.setProperty("/Filtros", {
          salaPesajeId: "0",
          plantaId: "0",
        });

        this.oLocalModel.setProperty("/Balanza_Plantas", aPlantas);

        const aUnidades = await maestro.obtenerUnidades();
        this.oLocalModel.setProperty("/Balanza_Unidades", aUnidades);

        this.oLocalModel.setProperty("/Balanza_TipoBalanzas", aTipoBalanzas);

        const aPuertosCom = await maestro.obtenerPuertosCom();
        this.oLocalModel.setProperty("/Balanza_PuertosCom", aPuertosCom);
        BusyIndicator.hide();
      },
      onActivarPress: async function (oEvent) {
        const oLineaActual = oEvent
          .getSource()
          .getParent()
          .getBindingContext("localModel")
          .getObject();
        const that = this;
        MessageBox.confirm(this.oResourceBundle.getText("msjPreguntaActivar"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          emphasizedAction: MessageBox.Action.YES,
          onClose: async function (oAction) {
            if (oAction === "YES") {
              BusyIndicator.show(0);

              oLineaActual.activoBalanza = "X";
              oLineaActual.Editar = true;

              await balanza.actualizarBalanza(that._buildEntity(oLineaActual));
              that.onSearch();
              BusyIndicator.hide();
            }
          },
        });
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

              oLineaActual.activoBalanza = "";
              oLineaActual.Editar = true;

              await balanza.actualizarBalanza(that._buildEntity(oLineaActual));
              that.onSearch();
              BusyIndicator.hide();
            }
          },
        });
      },
      onRestoreFilters: async function (oEvent) {
        this.oLocalModel.setProperty("/SalaPesajes", []);
        await this.onAfterRendering();
        /*
        this.oLocalModel.setProperty("/Filtros", {
          plantaId: "0",
          salaPesajeId: "0",
        });
        */

        oEvent.getParameters().selectionSet.forEach((oElementoFiltro) => {
          if (oElementoFiltro.data().controlType === "CheckBox") {
            oElementoFiltro.setSelected(false);
          } else if (
            ["ComboBox", "Select"].includes(oElementoFiltro.data().controlType)
          ) {
            oElementoFiltro.setSelectedKey("");
          } else {
            oElementoFiltro.setValue("");
          }
        });
      },
      onSearch: async function () {
        BusyIndicator.show(0);
        const oFiltros = this.oLocalModel.getProperty("/Filtros");
        const aBalanzas = await balanza.obtenerBalanzas(
          oFiltros.plantaId,
          oFiltros.salaPesajeId
        );
        this.oLocalModel.setProperty("/Balanzas", aBalanzas);
        BusyIndicator.hide();
      },
      onCreate: async function () {
        this.oLocalModel.setProperty("/Balanza", {});
        this.oLocalModel.setProperty("/Balanza/Editar", false);
        this.oLocalModel.setProperty("/Balanza/balanzaId", http.uuidv4());
        this.oLocalModel.setProperty("/Balanza_plantaId", "0");
        const aSalaPesajes = await maestro.obtenerSalaPesajes(0);
        this.oLocalModel.setProperty("/Balanza_SalaPesajes", aSalaPesajes);
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
      onEditarPress: async function (oEvent) {
        const oLineaActual = oEvent
          .getSource()
          .getParent()
          .getBindingContext("localModel")
          .getObject();

        this.oLocalModel.setProperty(
          "/Balanza",
          JSON.parse(JSON.stringify(oLineaActual))
        );
        this.oLocalModel.setProperty("/Balanza/Editar", true);
        if (oLineaActual.oSalaPesaje != null) {
          const aSalaPesajes = await maestro.obtenerSalaPesajes(
            oLineaActual.oSalaPesaje.oPlanta_iMaestraId
          );
          this.oLocalModel.setProperty("/Balanza_SalaPesajes", aSalaPesajes);
          this.oLocalModel.setProperty(
            "/Balanza_plantaId",
            oLineaActual.oSalaPesaje.oPlanta_iMaestraId
          );
        } else {
          const aSalaPesajes = await maestro.obtenerSalaPesajes(0);
          this.oLocalModel.setProperty("/Balanza_SalaPesajes", aSalaPesajes);
          this.oLocalModel.setProperty("/Balanza_plantaId", "0");
        }

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
              const aItems = that.oLocalModel.getProperty("/Balanzas");
              for (let i = 0; i < aItems.length; i++) {
                const oBalanza = aItems[aIndices[0]];
                oBalanza.activo = false;
                oBalanza.Editar = true;
                await balanza.actualizarBalanza(that._buildEntity(oBalanza));
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
          const oBalanza = this.oLocalModel.getProperty("/Balanza");

          const aRequeridos = [
            "codigo",
            "serie",
            "marca",
            "modelo",
            "oUnidad_iMaestraId",
            "oTipoBalanza_iMaestraId",
            "oSalaPesaje_salaPesajeId",
            "oPuertoCom_iMaestraId",
            "boundRate",
            "tolerancia",
            "precision",
            "parity",
            "stopBits",
            "dataBits",
            //"conexion",
            "cantidadDecimales",
            "capacidadMinimo",
            "capacidadMaximo",
          ];

          let bResultado = true;

          aRequeridos.forEach(function (item) {
            if (!oBalanza[item]) {
              bResultado = false;
              return;
            } else if (oBalanza[item] == "") {
              bResultado = false;
              return;
            }
          });
          if (!bResultado) {
            MessageBox.error(this.oResourceBundle.getText("msjRequeridos"));
            return;
          }

          /**
           * Valida que el nombre de la Balanza sea unico
           */
          const bNombreValido = await balanza.validarNombre(
            oBalanza.balanzaId,
            oBalanza.codigo,
            null /*oBalanza.oSalaPesaje_salaPesajeId*/
          );
          if (bNombreValido) {
            MessageBox.error(
              this.oResourceBundle.getText("msjNombreDuplicado")
            );
            return;
          }

          oBalanza.activoBalanza = "X";
          oBalanza.usuarioActualiza =
            sap.ushell === undefined
              ? "ederedson.matienzodurand.sa@everis.nttdata.com"
              : sap.ushell.Container.getService("UserInfo")
                  .getUser()
                  .getEmail();

          BusyIndicator.show(0);
          await balanza.actualizarBalanza(this._buildEntity(oBalanza));
          this.onSearch();

          MessageToast.show(
            this.oResourceBundle.getText("msjRegistrosActualizados")
          );
          oParent.close();
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
        if (oData.activo == undefined) {
          oData.activo = true;
        }
        if (oData.Editar == undefined) {
          oData.Editar = false;
        }

        var oAction = {
          Editar: oData.Editar ? true : false,
        };
        var oEntity = {
          activo: oData.activo,
          activoBalanza: oData.activoBalanza ? "X" : "",
          balanzaId: oData.balanzaId,
          boundRate: oData.boundRate,
          cantidadDecimales: oData.cantidadDecimales,
          capacidadMaximo: oData.capacidadMaximo,
          capacidadMinimo: oData.capacidadMinimo,
          codigo: oData.codigo,
          conexion: oData.conexion ? oData.conexion : "",
          dataBits: oData.dataBits,
          marca: oData.marca,
          modelo: oData.modelo,
          oPuertoCom_iMaestraId: oData.oPuertoCom_iMaestraId,
          oSalaPesaje_salaPesajeId: oData.oSalaPesaje_salaPesajeId,
          oTipoBalanza_iMaestraId: oData.oTipoBalanza_iMaestraId,
          oUnidad_iMaestraId: oData.oUnidad_iMaestraId,
          parity: oData.parity,
          precision: oData.precision,
          serie: oData.serie,
          stopBits: oData.stopBits,
          tolerancia: oData.tolerancia,
          usuarioActualiza: oData.usuarioActualiza
            ? oData.usuarioActualiza
            : "",
          usuarioRegistro: oData.usuarioRegistro ? oData.usuarioRegistro : "",
          fechaActualiza: oData.fechaActualiza
            ? oData.fechaActualiza
            : new Date(),
          fechaRegistro: oData.fechaRegistro ? oData.fechaRegistro : new Date(),
        };
        var oBody = { ...oEntity, ...oAction };
        return oBody;
      },
    });
  }
);
