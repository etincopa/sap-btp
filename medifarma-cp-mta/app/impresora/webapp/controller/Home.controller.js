sap.ui.define(
  [
    "./BaseController",
    "com/medifarma/cp/impresora/model/models",
    "com/medifarma/cp/impresora/services/Maestro",
    "com/medifarma/cp/impresora/services/Impresora",
    "com/medifarma/cp/impresora/services/Log",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/medifarma/cp/impresora/util/http",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../services/Service",
    "../services/iasScimService",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    models,
    maestro,
    impresora,
    log,
    BusyIndicator,
    MessageBox,
    MessageToast,
    http,
    exportLibrary,
    Spreadsheet,
    Filter,
    FilterOperator,
    Service,
    iasScimService
  ) {
    "use strict";
    const rootPath = "com.medifarma.cp.impresora";
    const EdmType = exportLibrary.EdmType,
      constanteArea = "AREA_TRABAJO";

    return BaseController.extend("com.medifarma.cp.impresora.controller.Home", {
      onInit: function () {
        this.init();
        this.oModelErpNec =
          this.getOwnerComponent().getModel("NECESIDADESRMD_SRV");
        maestro.init(this.oServiceModel);
        impresora.init(this.oServiceModel);
        log.init(this.oServiceModel);
        iasScimService.Inicializator(this);
      },
      onPressLog: async function () {
        const oImpresora = this.oLocalModel.getProperty("/Impresora");
        const aLogDetalle = await log.obtenerLogDetalle(oImpresora.impresoraId);
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
      onAfterRendering: async function () {
        BusyIndicator.show(0);
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
        aPlantas.splice(0, 0, { iMaestraId: "", contenido: "Seleccionar..." });
        this.oLocalModel.setProperty("/Plantas", aPlantas);
        this.oLocalModel.setProperty("/Impresora_Plantas", aPlantas);
        this.onGetAreaOdata("/aListaArea");
        this.oLocalModel.setProperty("/Filtros", { plantaId: "0", area: "0" });
        BusyIndicator.hide();
      },
      createColumnConfig: function () {
        var aCols = [];

        aCols.push({
          label: "Nombre",
          property: "nombre",
          type: EdmType.String,
        });

        aCols.push({
          label: "Dirección",
          property: "direccion",
          type: EdmType.String,
        });

        aCols.push({
          label: "Serie",
          property: "serie",
          type: EdmType.String,
        });

        aCols.push({
          label: "Planta",
          property: "oPlanta/contenido",
          type: EdmType.String,
        });

        aCols.push({
          label: "Estado",
          property: "estadoImpresora",
          type: EdmType.Boolean,
          trueValue: "ACTIVO",
          falseValue: "BAJA",
        });

        aCols.push({
          label: "Central Pesada",
          property: "indicadorCp",
          type: EdmType.Boolean,
          trueValue: "SI",
          falseValue: "NO",
        });
        aCols.push({
          label: "Almacén",
          property: "indicadorPicking",
          type: EdmType.Boolean,
          trueValue: "SI",
          falseValue: "NO",
        });

        aCols.push({
          label: "Pesaje Producción",
          property: "indicadorEtiqueta",
          type: EdmType.Boolean,
          trueValue: "SI",
          falseValue: "NO",
        });

        return aCols;
      },
      onExportar: function (oEvent) {
        var _oTable = oEvent.getSource().getParent().getParent();
        var aCols, oRowBinding, oSettings, oSheet, oTable;

        oTable = _oTable;
        oRowBinding = oTable.getBinding("rows");
        aCols = this.createColumnConfig();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
            context: {
              sheetName: "Mantenimiento Impresoras",
            },
          },
          dataSource: oRowBinding,
          fileName: "Mantenimiento_Impresoras.xlsx",
          worker: false, // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      onRestoreFilters: function () {
        this.oLocalModel.setProperty("/Filtros", { plantaId: "0" });
      },
      onSearch: async function () {
        BusyIndicator.show(0);
        const oFiltros = this.oLocalModel.getProperty("/Filtros");

        var aImpresoras = await impresora.obtenerImpresoras(oFiltros);

        aImpresoras.sort((a, b) =>
          a.nombre > b.nombre ? 1 : b.nombre > a.nombre ? -1 : 0
        );
        this.oLocalModel.setProperty("/Impresoras", aImpresoras);
        BusyIndicator.hide();
      },
      onCreate: async function () {
        this.oLocalModel.setProperty("/Impresora", {});
        this.oLocalModel.setProperty("/Impresora/Editar", false);
        this.oLocalModel.setProperty("/Impresora/impresoraId", http.uuidv4());
        //this.oLocalModel.setProperty("/Impresora/impresoraId", "658e6e73-bfea-4e5c-989f-39f5679bb17b");
        await this.onGetUserInfoIAS();

        var userInfoLogin = sap.ui
          .getCore()
          .getModel("UserLoginModel")
          .getData();
        var userRol = userInfoLogin.groups[0]
          ? userInfoLogin.groups[0].sistema
          : "";
        var oVisible = {
          CP: false,
          RMD: false,
        };
        if (userRol === "ADMIN") {
          oVisible.CP = true;
          oVisible.RMD = true;
        } else if (userRol === "RMD") {
          oVisible.CP = false;
          oVisible.RMD = true;
        } else {
          oVisible.CP = true;
          oVisible.RMD = false;
        }

        this.oLocalModel.setProperty("/visibleByRol", oVisible);

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
          "/Impresora",
          JSON.parse(JSON.stringify(oLineaActual))
        );
        this.oLocalModel.setProperty("/Impresora/Editar", true);

        await this.onGetUserInfoIAS();

        var userInfoLogin = sap.ui
          .getCore()
          .getModel("UserLoginModel")
          .getData();
        var userRol = userInfoLogin.groups[0]
          ? userInfoLogin.groups[0].sistema
          : "";
        var oVisible = {
          CP: false,
          RMD: false,
        };
        if (userRol === "ADMIN") {
          oVisible.CP = true;
          oVisible.RMD = true;
        } else if (userRol === "RMD") {
          oVisible.CP = false;
          oVisible.RMD = true;
        } else {
          oVisible.CP = true;
          oVisible.RMD = false;
        }

        this.oLocalModel.setProperty("/visibleByRol", oVisible);

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
              const aItems = that.oLocalModel.getProperty("/Impresoras");
              for (let i = 0; i < aItems.length; i++) {
                const oImpresora = aItems[aIndices[0]];
                oImpresora.activo = false;
                oImpresora.Editar = true;
                await impresora.actualizarImpresora(oImpresora);
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
          const oImpresora = this.oLocalModel.getProperty("/Impresora");
          const aRequeridos = [
            "nombre",
            "direccion",
            "serie",
            "oPlanta_iMaestraId",
          ];

          let bResultado = true;

          aRequeridos.forEach(function (item) {
            if (!oImpresora[item]) {
              bResultado = false;
              return;
            } else if (oImpresora[item] == "") {
              bResultado = false;
              return;
            }
          });
          if (!bResultado) {
            MessageBox.error(this.oResourceBundle.getText("msjRequeridos"));
            return;
          }

          oImpresora.usuarioActualiza =
            sap.ushell === undefined
              ? "ederedson.matienzodurand.sa@everis.nttdata.com"
              : sap.ushell.Container.getService("UserInfo")
                  .getUser()
                  .getEmail();

          BusyIndicator.show(0);
          await impresora.actualizarImpresora(this._buildEntity(oImpresora));
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
        var oAction = {
          Editar: this._boleanCheckF(oData.Editar),
        };
        var oEntity = {
          //terminal: oData.terminal,
          activo: this._boleanCheckT(oData.activo),
          impresoraId: oData.impresoraId,
          nombre: oData.nombre,
          direccion: oData.direccion,
          estadoImpresora: this._boleanCheckF(oData.estadoImpresora),
          serie: oData.serie,
          indicadorCp: this._boleanCheckF(oData.indicadorCp),
          indicadorPicking: this._boleanCheckF(oData.indicadorPicking),
          indicadorEtiqueta: this._boleanCheckF(oData.indicadorEtiqueta),
          oPlanta_iMaestraId: oData.oPlanta_iMaestraId,
          area: oData.area,
          rmd: oData.rmd,
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

      // Obtener Area para la parte de RMD.
      onGetAreaOdata: async function (modelo) {
        BusyIndicator.show(0);
        let aFilters = [];
        aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
        let oResponse = await Service.onGetDataGeneralFilters(
          this.oModelErpNec,
          "CaracteristicasSet",
          aFilters
        );
        this.oLocalModel.setProperty(modelo, oResponse.results);
        BusyIndicator.hide();
      },

      onGetUserInfoIAS: async function () {
        var that = this;
        var emailPortal = sap.ushell.Container.getService("UserInfo")
          .getUser()
          .getEmail();
        //var emailPortal = "elvis.percy.garcia.tincopa@everis.com";//ADMIN
        //var emailPortal = "oscar.chungparedes.sa@everis.nttdata.com";//CP
        //var emailPortal = "ryepegav@everis.com";//RMD

        sap.ui.core.BusyIndicator.show(0);

        var oUserLogin = await iasScimService
          .readUserIasInfo(emailPortal)
          .catch((oError) => {
            console.log(oError);
            //MessageBox.error(oError);
          });

        if (!oUserLogin) {
          var oUserLogin = await iasScimService
            .oDataRead2(
              that.getView().getModel("modelMifAdmin"),
              "fnUserByEmail",
              { emails: emailPortal },
              []
            )
            .catch((oError) => {
              console.log(oError);
              //MessageBox.error(oError);
            });

          oUserLogin = that._getUserInfo(oUserLogin.fnUserByEmail);
        }
        if (oUserLogin) {
          var aGroups = [];
          var sInclude = "ADM_";

          oUserLogin.getData().groups.forEach((oItem) => {
            /**
             * <Aplicativo>_<Rol>
             * 
             * Prefijo ADM_ : Identificar el rol que tendrá el usuario dentro del aplicativo de administración.
              ADM_ADMIN : Control total para todos los sistemas
              ADM_CP    : Control para Central de Pesadas (CP)
              ADM_RMD   : Control para Registro Manufactura Digital (RMD)
             */

            var sNameRol = oItem.display.toUpperCase();
            if (sNameRol.includes(sInclude)) {
              var sRole = sNameRol.substring(
                sNameRol.lastIndexOf(sInclude + "_") + (sInclude.length + 1),
                sNameRol.length
              );
              oItem.display = sNameRol;
              oItem.sistema = sRole;
              aGroups.push(oItem);
            }
          });
          
          var aGroupAdmin = aGroups.filter(o=> o.display == (sInclude + "ADMIN"));
          if(aGroupAdmin.length > 0) {
            /**
             * Verificar si existe el rol ADMIN
             */
            oUserLogin.getData().groups = aGroupAdmin;
          } else {
            oUserLogin.getData().groups = aGroups;
          }

          sap.ui.core.BusyIndicator.hide();
          sap.ui.getCore().setModel(oUserLogin, "UserLoginModel");
        } else {
          MessageBox.error(
            "No se puede continuar, vualeve a intentarlo actualizando la pagina o comuniquese con un administrador si el error persiste."
          );
          return false;
        }

        return oUserLogin.getData();
      },
      _getUserInfo: function (oDataIas) {
        if (oDataIas.Resources.length) {
          var aUser =
            oDataIas.Resources[0][
              "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
            ];
          var oInfo = {
            company: "",
            email: oDataIas.Resources[0].emails[0].value,
            emails: oDataIas.Resources[0].emails,
            firstName: oDataIas.Resources[0].name.givenName,
            groups: oDataIas.Resources[0].groups,
            lastName: oDataIas.Resources[0].name.familyName,
            loginName: oDataIas.Resources[0].userName,
            name: oDataIas.Resources[0].userName,
            userP:
              oDataIas.Resources[0][
                "urn:ietf:params:scim:schemas:extension:sap:2.0:User"
              ].userId,
            ruc: "",
          };
          if (aUser !== undefined) {
            oInfo.ruc =
              oDataIas.Resources[0][
                "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
              ].attributes[0].value;
          }
          var oResolve = new sap.ui.model.json.JSONModel(oInfo);
          return oResolve;
        } else {
          return null;
        }
      },
    });
  }
);
