sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "administrador/controller/BaseController",

    "administrador/service/oDataService",
  ],
  function (
    Controller,
    Sorter,
    Filter,
    FilterOperator,
    FilterType,
    JSONModel,
    Fragment,
    Core,
    MessageBox,
    MessageToast,
    BaseController,
    oDataService
  ) {
    "use strict";
    var that;
    var UserInfoModel,
      gsUsuarioLogin = "";
    var oBusyDialog = new sap.m.BusyDialog();
    var idAplication = "";
    return BaseController.extend("administrador.controller.MasterMenuApp", {
      onInit: function () {
        that = this;
        that.oModelCapService = that.getOwnerComponent().getModel("capService");
        that.oModel = that.getOwnerComponent().getModel();

        that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oView = that.getView();

        oView.setModel(
          new JSONModel({
            PageHeadVisible: false,
            ListVisible: true,
            FormVisible: false,
          }),
          "oGeneralForm"
        );

        oView.setModel(new JSONModel({}), "oParameters");

        oView.setModel(new JSONModel([]), "RolAppWfListModel");
        oView.setModel(new JSONModel([]), "SubconceptoGroupModel");
        oView.setModel(new JSONModel([]), "detalleModel");
        oView.setModel(new JSONModel([]), "ParamsSelectModel");
        oView.setModel(new JSONModel([]), "RolAppAccListModel");
        oView.setModel(new JSONModel([]), "RolSistAccListModel");

        var masterModel = new sap.ui.model.json.JSONModel({});
        sap.ui.getCore().setModel(masterModel, "masterModel");

        that.oRouter
          .getTarget("MenuApp")
          .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));
      },

      onExit: function () {
        if (this._oDialog) {
          this._oDialog.destroy();
        }
      },
      /**
       * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
       * This hook is the same one that SAPUI5 controls get after being rendered.
       */
      onAfterRendering: function () {
        var oView = that.getView();
        var oMM = Core.getMessageManager();
        var obj = oView.byId("sNombreId");
        if (obj) oMM.registerObject(obj, true);
        obj = oView.byId("cboTipoId");
        if (obj) oMM.registerObject(obj, true);
        obj = oView.byId("cboEstadoId");
        if (obj) oMM.registerObject(obj, true);
        var oSplitApp = this.getOwnerComponent()._oSplitApp;
        oSplitApp.setMode("ShowHideMode");

        var user = {};
        user.email = "elvis.percy.garcia.tincopa@everis.com";
        user.username = "ADMIN";

        sap.ui.getCore().setModel(new JSONModel(user), "UserInfoModel");
        that.getView().setModel(new JSONModel(user), "UserInfoModel");
      },
      _handleRouteMatched: async function (oEvent) {
        var oUserLogin = await this.getUserLoginIas();
        if (!oUserLogin) {
          sap.ui.core.BusyIndicator.show(0);
          return false;
        }
        if (!oUserLogin.groups.length) {
          sap.ui.core.BusyIndicator.show(0);
          MessageBox.error(
            "USUARIO SIN ROL PARA ESTA APLICACION, COMINIQUESE CON UN ADMINISTRADOR PARA ASIGNAR EL ROL: ADM_XXXX"
          );
          return;
        }
        var that = this;
        try {
          gsUsuarioLogin = sap.ushell.Container.getService("UserInfo")
            .getUser()
            .getEmail();

          var EQ = FilterOperator.EQ;
          var aFilterSistema = [];
          oUserLogin.groups.forEach((oItem) => {
            if (oItem.sistema == "ADMIN") {
              //Si es admin control total a todos los sistemas
              aFilterSistema = [];
              return false;
            }
            aFilterSistema.push(new Filter("codigo", EQ, oItem.sistema));
          });

          that
            ._getSistema(aFilterSistema)
            .then((oResult) => that._getRole(null))
            .then((oResult) => {
              sap.ui.core.BusyIndicator.hide();
              var oModel = new JSONModel([
                {
                  iMaestraId: 1,
                  codigo: 1,
                  contenido: "Activo",
                },
                {
                  iMaestraId: 0,
                  codigo: 0,
                  contenido: "Inactivo",
                },
              ]);
              that.getView().setModel(oModel, "EstadoList");
            })
            .catch(function (oError) {
              console.log("Error get Constantat");
              sap.ui.core.BusyIndicator.hide();
            })
            .finally(function () {
              sap.ui.core.BusyIndicator.hide();
            });
        } catch (oError) {
          console.log("Error All Init");
          sap.ui.core.BusyIndicator.hide();
        }
      },

      /**
       * @Description
       * Funcion que obtiene del servicio oData los registros Tipo Tabla Maestras registradas para la solucion
       *
       * @param   none
       * @return  {sap.ui.model.Filter} aFilter
       * @History
       * v1.0 – Version inicial
       *
       */
      _getMaestraTipo: function (aFilter) {
        var that = this;
        return new Promise(function (resolve, reject) {
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "MaestraTipo", null, aFilter)
            .then(function (oResult) {
              var oModel = new JSONModel(oResult.results);
              oModel.setSizeLimit(999999999);
              that.getView().setModel(oModel, "MasterTypeListModel");
              resolve(oResult);
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              reject(reject);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        });
      },

      /**
       * @Description
       * Funcion que obtiene del servicio oData los registros Maestras registradas para la solucion
       *
       * @param   none
       * @return  {sap.ui.model.Filter} aFilter
       * @History
       * v1.0 – Version inicial
       *
       */
      _getMaestra: function (aFilter) {
        var that = this;
        return new Promise(function (resolve, reject) {
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "Maestra", null, aFilter)
            .then(function (oResult) {
              var oModel = new JSONModel(oResult.results);
              oModel.setSizeLimit(999999999);
              that.getView().setModel(oModel, "EstadoList");
              resolve(oResult);
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              reject(reject);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        });
      },
      /**
       * @Description
       * Funcion que obtiene del servicio oData los registros de roles registradas para la solucion
       *
       * @param   none
       * @return  {sap.ui.model.Filter} aFilter
       * @History
       * v1.0 – Version inicial
       *
       */
      _getRole: function (aFilter) {
        var that = this;
        return new Promise(function (resolve, reject) {
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "Rol", null, aFilter)
            .then(function (oResult) {
              var oModel = new JSONModel(oResult.results);
              oModel.setSizeLimit(999999999);
              that.getView().setModel(oModel, "RolList");
              resolve(oResult);
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              reject(reject);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        });
      },
      /**
       * @Description
       * Funcion que obtiene del servicio oData los registros de sistemas registradas para la solucion
       *
       * @param   none
       * @return  {sap.ui.model.Filter} aFilter
       * @History
       * v1.0 – Version inicial
       *
       */
      _getSistema: function (aFilter) {
        var that = this;
        return new Promise(function (resolve, reject) {
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "Sistema", null, aFilter)
            .then(function (oResult) {
              var oModel = new JSONModel(oResult.results);
              oModel.setSizeLimit(999999999);
              that.getView().setModel(oModel, "SistemaList");
              resolve(oResult);
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              reject(reject);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        });
      },

      onPressDetailBack: function (oEvent) {
        var oSplitApp = this.getOwnerComponent()._oSplitApp;
        oSplitApp.setMode("ShowHideMode");
      },

      onSociedadChange: async function (cboRol, idCboSistema) {
        /*
				var oView = this.getView();
				var sValue = this.getView().byId(cboRol).getSelectedKey();
				var oModel = this.getView().getModel();
				this.getView().byId(idCboSistema).setSelectedKey("");
				if (sValue !== "") {
					var masterModel = sap.ui.getCore().getModel("masterModel");
					masterModel.setProperty("/sociedadId", sValue);
					var oFilter = [
						new Filter("oSociedad_sSociedadId", FilterOperator.EQ, sValue),
						new Filter("xActivo", FilterOperator.EQ, true)
					];
					oView.byId(idCboSistema).getBinding("items").filter(oFilter, FilterType.Application);

					subconceptosGroupSrv.read(oModel, sValue).then(function (result) {
						result.forEach(function (entry, i) {
							delete result[i]["__metadata"];
						});
						that.getView().getModel("SubconceptoGroupModel").setData(result);
					}, function (error) {}.bind(this));

                }
                */
      },

      onCBoxChange: function (idComponent, idComponetAction) {
        UserInfoModel = sap.ui.getCore().getModel("UserInfoModel").getData();

        var that = this;
        var oView = that.getView();
        var sKey = oView.byId(idComponent).getSelectedKey();

        if (sKey !== "") {
          var oModel = that.getView().getModel();
          var oList = oView.byId(idComponetAction);
          var oSorter = new Sorter({
            path: "nombre",
            descending: false,
          });
          oList.bindItems({
            path: "/Aplicacion",
            filters: [
              new Filter("oSistema_sistemaId", FilterOperator.EQ, sKey),
              new Filter("activo", FilterOperator.EQ, true),
            ],
            sorter: oSorter,
            template: new sap.m.StandardListItem({
              title: "{nombre}",
              type: "Navigation",
            }),
          });
        }
      },

      onListItemPress: function (oEvent) {
        var that = this;
        oBusyDialog.open();
        var oSistemaList = this.getView().getModel("SistemaList").getData();
        var sistemaId = this.getView().byId("idCboSistema").getSelectedKey();
        var oItemSelect = oEvent.getSource().getSelectedItems();
        var oObject = oItemSelect[0].getBindingContext().getObject();
        var oSistema_sistemaId = oObject.oSistema_sistemaId;
        var oAplicacion_aplicacionId = oObject.aplicacionId;
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        oDetailPages.getModel("ParamsSelectModel").setData(oObject);

        idAplication = oAplicacion_aplicacionId;

        var oModel = that.getView().getModel();

        var aFilters = [];
        aFilters.push(
          new sap.ui.model.Filter(
            "oAplicacion_aplicacionId",
            FilterOperator.EQ,
            oAplicacion_aplicacionId
          )
        );
        aFilters.push(
          new sap.ui.model.Filter("activo", FilterOperator.EQ, true)
        );

        var aFiltersSistema = [];
        aFiltersSistema.push(
          new sap.ui.model.Filter(
            "oSistema_sistemaId",
            FilterOperator.EQ,
            oSistema_sistemaId
          )
        );

        oDetailPages.getModel("RolAppAccListModel").setData([]);
        oDetailPages.getModel("RolAppWfListModel").setData([]);
        this._getRolAppAcciones(oModel, aFilters).then(
          function (result) {
            result.forEach(function (entry, i) {
              delete result[i]["__metadata"];
              result[i].status = false;
              result[i].nuevo = false;
              result[i].edit = false;
              result[i].del = true;
            });
            oDetailPages.getModel("RolAppAccListModel").setData(result);
            oBusyDialog.close();
          },
          function (oError) {
            oBusyDialog.close();
          }.bind(this)
        );

        this._getRolAppWf(oModel, aFilters).then(
          function (result) {
            result.forEach(function (entry, i) {
              delete result[i]["__metadata"];
              result[i].status = false;
              result[i].nuevo = false;
              result[i].edit = false;
              result[i].del = true;
            });
            oDetailPages.getModel("RolAppWfListModel").setData(result);
            oBusyDialog.close();
          },
          function (oError) {
            oBusyDialog.close();
          }.bind(this)
        );

        this._getMaestraTipo(null)
          .then(function (oMaestraTipo) {
            var aFiltersAction = [];
            var temp = oMaestraTipo.results.find((o) => o.tabla === "ACCION");
            if (temp) {
              aFiltersAction.push(
                new Filter(
                  "oMaestraTipo_maestraTipoId",
                  FilterOperator.EQ,
                  temp.maestraTipoId
                )
              );
            }
            aFiltersAction.push(
              new sap.ui.model.Filter(
                "oAplicacion_aplicacionId",
                FilterOperator.EQ,
                oAplicacion_aplicacionId
              )
            );
            aFiltersAction.push(
              new sap.ui.model.Filter("activo", FilterOperator.EQ, true)
            );

            that._getAction(oDetailPages, aFiltersAction).then((oResult) => {
              var aRol = that.getView().getModel("RolList");

              var oFilterRol = aRol.getData().filter(function (e) {
                return e.oSistema_sistemaId === oSistema_sistemaId;
              });

              var oModelRol = new JSONModel(oFilterRol);
              oModelRol.setSizeLimit(999999999);
              oDetailPages.setModel(oModelRol, "RolSystemList");
              oDetailPages.getModel("RolSystemList").refresh(true);
              sap.ui.core.BusyIndicator.hide();
            });
          })
          .catch(function (oError) {
            console.log("Error get Constantat");
            sap.ui.core.BusyIndicator.hide();
          })
          .finally(function () {
            sap.ui.core.BusyIndicator.hide();
          });

        //var oSplitApp = this.getOwnerComponent()._oSplitApp;
        //oSplitApp.setMode("HideMode");
      },
      _getRolAppAcciones: function (oModel, aFilters) {
        return new Promise(function (resolve, reject) {
          oModel.read("/RolAppAcciones", {
            filters: aFilters,
            urlParameters: {
              $expand: "oRol,oMaestraAccion",
            },
            success: function (oResponse) {
              for (var prop in oResponse) {
                if (
                  prop.indexOf("_") < 0 &&
                  (prop.startsWith("o") || prop.startsWith("a"))
                )
                  delete oResponse[prop];
              }
              resolve(oResponse.results);
            },
            error: function (oErr) {
              reject(true);
            },
          });
        });
      },
      _getRolAppWf: function (oModel, aFilters) {
        return new Promise(function (resolve, reject) {
          oModel.read("/RolAppWf", {
            filters: aFilters,
            urlParameters: {
              $expand: "oRolWorkflow,oRol",
            },
            success: function (oResponse) {
              for (var prop in oResponse) {
                if (
                  prop.indexOf("_") < 0 &&
                  (prop.startsWith("o") || prop.startsWith("a"))
                )
                  delete oResponse[prop];
              }
              resolve(oResponse.results);
            },
            error: function (oErr) {
              reject(true);
            },
          });
        });
      },
      _getRolSistema: function (oModel, aFilters) {
        return new Promise(function (resolve, reject) {
          oModel.read("/Rol", {
            filters: aFilters,
            urlParameters: {
              $expand: "oSistema",
            },
            success: function (oResponse) {
              for (var prop in oResponse) {
                if (
                  prop.indexOf("_") < 0 &&
                  (prop.startsWith("o") || prop.startsWith("a"))
                )
                  delete oResponse[prop];
              }
              resolve(oResponse.results);
            },
            error: function (oErr) {
              reject(true);
            },
          });
        });
      },
      _getAction: function (oDetailPages, aFilter) {
        var that = this;
        return new Promise(function (resolve, reject) {
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(that.oModel, "Maestra", null, aFilter)
            .then(function (oResult) {
              var aResult = oResult.results;
              aResult.sort((a, b) =>
                a.orden > b.orden ? 1 : b.orden > a.orden ? -1 : 0
              );
              var oModel = new JSONModel(aResult);
              oModel.setSizeLimit(999999999);
              oDetailPages.setModel(oModel, "ActionList");
              oDetailPages.getModel("ActionList").refresh(true);
              resolve(oResult);
            })
            .catch(function (oError) {
              console.log(oError);
              sap.ui.core.BusyIndicator.hide();
              reject(reject);
            })
            .finally(function () {
              // sap.ui.core.BusyIndicator.hide();
            });
        });
      },

      onAddSubconcepto: async function (oEvent) {
        var oButton = oEvent.getSource();
        var oResult = await subconceptosService.read(
          this.getView().getModel("s4")
        );
        var oModel = new JSONModel(oResult);
        if (!this._oDialog) {
          Fragment.load({
            name: "administrador.view.MenuApp.fragment.Subconceptos",
            controller: this,
          }).then(
            function (oDialog) {
              this._oDialog = oDialog;
              this._oDialog.setModel(oModel, "RolAppWfListModel");
              this._oDialog.setMultiSelect(true);
              this._oDialog.open();
            }.bind(this)
          );
        } else {
          this._oDialog.setMultiSelect(true);
          this._oDialog.open();
        }
      },

      onAddSubconceptoManual: async function (oEvent) {
        var oObjects = [
          {
            Descripcion: "",
            pos_liquidez: "",
          },
        ];
        var lastId = 0;
        lastId = await subconceptosService.readLastId(
          that.getView().getModel()
        );
        var add = true;
        var conceptoModel = this.getView()
          .getModel("ParamsSelectModel")
          .getData();
        conceptoModel.aSubconceptos.forEach(function (entry, i) {
          delete conceptoModel.aSubconceptos[i]["__metadata"];
          if (lastId <= conceptoModel.aSubconceptos[i].iSubconceptoId) {
            lastId = conceptoModel.aSubconceptos[i].iSubconceptoId;
          }
        });

        for (var i = 0; i < oObjects.length; i++) {
          add = true;
          conceptoModel.aSubconceptos.forEach(function (entry, j) {
            if (
              conceptoModel.aSubconceptos[j].sPosicionLiquidez ==
              oObjects[i].pos_liquidez
            )
              add = false;
          });
          if (add) {
            lastId = lastId + 1;
            conceptoModel.aSubconceptos.push({
              dFechaRegistro: new Date(),
              iSubconceptoId: lastId,
              oConcepto_iConceptoId: conceptoModel.iConceptoId,
              oTipoMoneda_iMaestraId: 4,
              sNombre: oObjects[i].Descripcion,
              sPosicionLiquidez: oObjects[i].pos_liquidez,
              sUsuarioRegistro: UserInfoModel.username,
              oAgrupador_iId: null,
              xActivo: true,
            });
          }
        }
        this.getView().getModel("ParamsSelectModel").setData(conceptoModel);
        this.getView()
          .getModel("RolAppWfListModel")
          .setData(conceptoModel.aSubconceptos);
        /*				var oTable = that.getView().byId("subConceptosTable");
								oTable.getBinding("rows").filter(new Filter("xActivo", FilterOperator.EQ, true), FilterType.Application);
								oTable.getBinding("rows").refresh();*/
      },

      handleSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oBinding = oEvent.getSource().getBinding("items");
        var oFilter = new Filter({
          filters: [
            new Filter("posicionLiquidez", FilterOperator.Contains, sValue),
            new Filter("Descripcion", FilterOperator.Contains, sValue),
          ],
          and: false,
        });
        oBinding.filter(oFilter, FilterType.Application);
      },

      onDialogClose: async function (oEvent) {
        var oObjects = [];
        var aContexts = oEvent.getParameter("selectedContexts");
        var lastId = 0;
        lastId = await subconceptosService.readLastId(
          that.getView().getModel()
        );
        var add = true;
        if (aContexts && aContexts.length) {
          aContexts.map(function (oContext) {
            oObjects.push(oContext.getObject());
            return oContext.getObject();
          });
          var conceptoModel = that
            .getView()
            .getModel("ParamsSelectModel")
            .getData();
          conceptoModel.aSubconceptos.forEach(function (entry, i) {
            delete conceptoModel.aSubconceptos[i]["__metadata"];
            if (lastId <= conceptoModel.aSubconceptos[i].iSubconceptoId) {
              lastId = conceptoModel.aSubconceptos[i].iSubconceptoId;
            }
          });

          for (var i = 0; i < oObjects.length; i++) {
            add = true;
            conceptoModel.aSubconceptos.forEach(function (entry, j) {
              if (
                conceptoModel.aSubconceptos[j].sPosicionLiquidez ==
                oObjects[i].pos_liquidez
              ) {
                add = false;
                conceptoModel.aSubconceptos[j].xActivo = true;
              }
            });
            if (add) {
              lastId = lastId + 1;
              conceptoModel.aSubconceptos.push({
                dFechaActualiza: null,
                oAgrupador_iId: null,
                oTipoMovimiento_iMaestraId: null,
                oTipoMoneda_iMaestraId: 4,
                dFechaRegistro: new Date(),
                iSubconceptoId: lastId,
                oConcepto_iConceptoId: conceptoModel.iConceptoId,
                sNombre: oObjects[i].Descripcion,
                sPosicionLiquidez: oObjects[i].pos_liquidez,
                sUsuarioActualiza: null,
                sUsuarioRegistro: UserInfoModel.username,
                xActivo: true,
              });
            }
          }
          that
            .getView()
            .setModel(new JSONModel(conceptoModel), "ParamsSelectModel");
          that
            .getView()
            .setModel(
              new JSONModel(conceptoModel.aSubconceptos),
              "RolAppWfListModel"
            );
          var oTable = that.getView().byId("subConceptosTable");
          oTable
            .getBinding("rows")
            .filter(
              new Filter("xActivo", FilterOperator.EQ, true),
              FilterType.Application
            );
          oTable.getBinding("rows").refresh();
        } else {
          MessageToast.show("No se han seleccionado subconceptos");
        }
      },

      onChange: function (oEvent) {
        var oInput = oEvent.getSource();
        oInput.setValueState("None");
      },

      onSavePressed: function (oEvent) {
        var thatt = this;
        var oView = this.getView();
        var conceptoModel = this.getView()
          .getModel("ParamsSelectModel")
          .getData();
        var RolAppAccListModel = this.getView()
          .getModel("RolAppAccListModel")
          .getData();
        var aInputs = [
          oView.byId("sNombreId"),
          oView.byId("cboTipoId"),
          oView.byId("cboEstadoId"),
        ];
        var errorDefinicion = false;
        aInputs.forEach(function (oInput) {
          var value = oInput.getValue();
          if (value == "") {
            errorDefinicion = true;
            oInput.setValueState("Error");
          }
        });
        for (var i = 0; i < conceptoModel.aSubconceptos.length; i++) {
          if (conceptoModel.aSubconceptos[i].xActivo) {
            if (
              conceptoModel.aSubconceptos[i].oTipoMoneda_iMaestraId === "" ||
              conceptoModel.aSubconceptos[i].oTipoMoneda_iMaestraId === null ||
              conceptoModel.aSubconceptos[i].sNombre === "" ||
              conceptoModel.aSubconceptos[i].sPosicionLiquidez === "" ||
              conceptoModel.aSubconceptos[i].oTipoMovimiento_iMaestraId == "" ||
              conceptoModel.aSubconceptos[i].oTipoMovimiento_iMaestraId == null
            ) {
              var msg =
                "Diligencia todos los datos de la Posición de liquidez " +
                conceptoModel.aSubconceptos[i].sPosicionLiquidez;
              return MessageBox.error(msg);
            }
            for (var j = 0; j < conceptoModel.aSubconceptos.length; j++) {
              if (
                i != j &&
                conceptoModel.aSubconceptos[
                  i
                ].sPosicionLiquidez.toUpperCase() ==
                  conceptoModel.aSubconceptos[
                    j
                  ].sPosicionLiquidez.toUpperCase() &&
                conceptoModel.aSubconceptos[i].xActivo &&
                conceptoModel.aSubconceptos[j].xActivo
              ) {
                var msg =
                  "Posición de liquidez duplicada " +
                  conceptoModel.aSubconceptos[i].sPosicionLiquidez;
                return MessageBox.error(msg);
              }
            }
          }
        }

        for (var i = 0; i < RolAppAccListModel.length; i++) {
          if (
            RolAppAccListModel[i].xActivo &&
            RolAppAccListModel[i].oRol_iMaestraId == ""
          ) {
            var msg =
              RolAppAccListModel[i].sUser +
              ":" +
              that.getI18nText("usuarioRolEsRequerido");
            return MessageBox.error(msg);
          }
        }

        if (errorDefinicion) {
          MessageBox.error("Complete los campos obligatorios en la definición");
        } else {
          conceptoModel.sUsuarioActualiza = UserInfoModel.username;
          conceptoModel.dFechaActualiza = new Date();
          conceptoModel.aSubconceptos.forEach(function (entry, i) {
            delete conceptoModel.aSubconceptos[i]["__metadata"];
            conceptoModel.aSubconceptos[i]["oTipoMoneda_iMaestraId"] = parseInt(
              conceptoModel.aSubconceptos[i]["oTipoMoneda_iMaestraId"]
            );
            conceptoModel.aSubconceptos[i]["oTipoMovimiento_iMaestraId"] =
              parseInt(
                conceptoModel.aSubconceptos[i]["oTipoMovimiento_iMaestraId"]
              );

            if (conceptoModel.aSubconceptos[i]["oAgrupador_iId"])
              conceptoModel.aSubconceptos[i]["oAgrupador_iId"] = parseInt(
                conceptoModel.aSubconceptos[i]["oAgrupador_iId"]
              );

            conceptoModel.aSubconceptos[i]["sUsuarioActualiza"] =
              UserInfoModel.username;
            conceptoModel.aSubconceptos[i]["dFechaActualiza"] = new Date();
          });
          delete conceptoModel["__metadata"];
          conceptoModel.oTipoMovimiento_iMaestraId = parseInt(
            conceptoModel.oTipoMovimiento_iMaestraId
          );
          conceptoModel.oEstado_iMaestraId = parseInt(
            conceptoModel.oEstado_iMaestraId
          );

          var masterModel = sap.ui.getCore().getModel("masterModel").getData();
          masterModel.iAreaId = parseInt(masterModel.iAreaId);

          if (conceptoModel.nuevo) {
            conceptoService
              .create(that.getView().getModel(), conceptoModel)
              .then(
                function (conceptoNew) {
                  conceptoRolUsuarioSrv
                    .update(
                      that.getView().getModel(),
                      conceptoNew.iConceptoId,
                      masterModel.iAreaId,
                      RolAppAccListModel
                    )
                    .then(
                      function (result) {
                        MessageBox.success("Los cambios fueron grabados");
                        thatt
                          .getView()
                          .getModel("RolAppAccListModel")
                          .setData(RolAppAccListModel);
                        var oTable = thatt.getView().byId("usuariosTable");
                        oTable.setSelectedIndex(-1);
                        oTable
                          .getBinding("rows")
                          .filter(
                            new Filter("xActivo", FilterOperator.EQ, true),
                            FilterType.Application
                          );
                        oTable.getBinding("rows").refresh();
                      },
                      function (error) {
                        MessageBox.error(
                          "Ha ocurrido un error al guardar usuarios"
                        );
                      }.bind(this)
                    );

                  var areaConceptos = {
                    dFechaRegistro: conceptoNew.dFechaRegistro,
                    sUsuarioRegistro: conceptoNew.sUsuarioRegistro,
                    xActivo: true,
                    oConcepto_iConceptoId: conceptoNew.iConceptoId,
                    oArea_iAreaId: masterModel.iAreaId,
                  };
                  areaConceptosService
                    .create(that.getView().getModel(), areaConceptos)
                    .then(function (result) {}, function (error) {}.bind(this));
                },
                function (error) {
                  MessageBox.error(
                    "Ha ocurrido un error al guardar el concepto"
                  );
                }.bind(this)
              );
          } else {
            conceptoService
              .update(that.getView().getModel(), conceptoModel)
              .then(
                function (result) {
                  conceptoRolUsuarioSrv
                    .update(
                      that.getView().getModel(),
                      conceptoModel.iConceptoId,
                      masterModel.iAreaId,
                      RolAppAccListModel
                    )
                    .then(
                      function (result) {
                        MessageBox.success("Los cambios fueron grabados");
                        thatt
                          .getView()
                          .getModel("RolAppAccListModel")
                          .setData(RolAppAccListModel);
                        var oTable = thatt.getView().byId("usuariosTable");
                        oTable.setSelectedIndex(-1);
                        oTable
                          .getBinding("rows")
                          .filter(
                            new Filter("xActivo", FilterOperator.EQ, true),
                            FilterType.Application
                          );
                        oTable.getBinding("rows").refresh();
                      },
                      function (error) {
                        MessageBox.error(
                          "Ha ocurrido un error al guardar usuarios"
                        );
                      }.bind(this)
                    );
                },
                function (error) {
                  MessageBox.error(
                    "Ha ocurrido un error al guardar el concepto"
                  );
                }.bind(this)
              );
          }
        }
      },

      onDelSubConcepto: function (oEvent) {
        var oTable = this.getView().byId("subConceptosTable");
        var selectedIndices = oTable.getSelectedIndices();
        var aIndices = oTable.getBinding("rows").aIndices;
        if (selectedIndices.length > 0) {
          var thatt = this;
          oBusyDialog.open();
          MessageBox.confirm(
            this.getI18nText("msgConfirmSubconceptoEliminar"),
            {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              onClose: async function (sAction) {
                if (MessageBox.Action.YES == sAction) {
                  var conceptoModel = thatt
                    .getView()
                    .getModel("ParamsSelectModel")
                    .getData();
                  conceptoModel.aSubconceptos.forEach(function (entry, i) {
                    delete conceptoModel.aSubconceptos[i]["__metadata"];
                  });
                  delete conceptoModel["__metadata"];
                  selectedIndices.forEach(function (index) {
                    var ind = aIndices[index];
                    conceptoModel.aSubconceptos[ind].xActivo = false;
                    if (conceptoModel.aSubconceptos[ind].nuevo) {
                      delete conceptoModel.aSubconceptos[ind];
                    }
                  });
                  thatt
                    .getView()
                    .getModel("ParamsSelectModel")
                    .setData(conceptoModel);
                  thatt
                    .getView()
                    .getModel("RolAppWfListModel")
                    .setData(conceptoModel.aSubconceptos);
                  oTable.setSelectedIndex(-1);
                  oTable
                    .getBinding("rows")
                    .filter(
                      new Filter("xActivo", FilterOperator.EQ, true),
                      FilterType.Application
                    );
                  oTable.getBinding("rows").refresh();
                  oBusyDialog.close();
                } else oBusyDialog.close();
              },
            }
          );
        } else {
          MessageToast.show("No se han seleccionado subconceptos");
        }
      },

      _getUsuario: function (aFilter) {
        var that = this;
        oDataService
          .oDataRead(this.getView().getModel(), "Usuario", null, aFilter)
          .then(
            function (result) {
              that.getView().getModel("UserListModel").setData(result.results);
              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },
      onAddUsuario: async function (oEvent) {
        var that = this;
        UserInfoModel = sap.ui.getCore().getModel("UserInfoModel").getData();
        //var oButton = oEvent.getSource();
        //var masterModel = sap.ui.getCore().getModel("masterModel").getData();

        oDataService
          .oDataRead(that.getView().getModel(), "Usuario", null, null)
          .then(
            function (result) {
              var oModel = new JSONModel(result.results);
              if (!that._oDialogFrgUsuarios) {
                Fragment.load({
                  name: "administrador.view.MenuApp.fragment.Usuarios",
                  controller: this,
                }).then(
                  function (oDialog) {
                    that._oDialogFrgUsuarios = oDialog;
                    that._oDialogFrgUsuarios.setModel(oModel, "UserListModel");
                    that._oDialogFrgUsuarios.setMultiSelect(true);
                    that._oDialogFrgUsuarios.open();
                  }.bind(this)
                );
              } else {
                that._oDialogFrgUsuarios.setModel(oModel, "UserListModel");
                that._oDialogFrgUsuarios.setMultiSelect(true);
                that._oDialogFrgUsuarios.open();
              }
            }.bind(this),
            function (oError) {
              console.log(oError);
            }
          );
      },

      onDelUsuario: function (oEvent) {
        var oTable = this.getView().byId("usuariosTable");
        var selectedIndices = oTable.getSelectedIndices();
        var aIndices = oTable.getBinding("rows").aIndices;
        if (selectedIndices.length > 0) {
          var thatt = this;
          MessageBox.confirm(this.getI18nText("msgConfirmEliminar"), {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: async function (sAction) {
              if (MessageBox.Action.YES == sAction) {
                var RolAppAccListModel = thatt
                  .getView()
                  .getModel("RolAppAccListModel")
                  .getData();
                RolAppAccListModel.forEach(function (entry, i) {
                  delete RolAppAccListModel[i]["__metadata"];
                  delete RolAppAccListModel[i]["oUser"];
                });
                delete RolAppAccListModel["__metadata"];
                selectedIndices.forEach(function (index) {
                  var ind = aIndices[index];
                  RolAppAccListModel[ind].xActivo = false;
                });
                thatt
                  .getView()
                  .getModel("RolAppAccListModel")
                  .setData(RolAppAccListModel);

                oTable.setSelectedIndex(-1);
                oTable
                  .getBinding("rows")
                  .filter(
                    new Filter("xActivo", FilterOperator.EQ, true),
                    FilterType.Application
                  );
                oTable.getBinding("rows").refresh();

                oBusyDialog.close();
              } else oBusyDialog.close();
            },
          });
        } else {
          MessageToast.show("No se han seleccionado usuarios");
        }
      },

      onDialogUserSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oBinding = oEvent.getSource().getBinding("items");
        if (sValue) {
          var oFilter = new Filter({
            filters: [
              new Filter("oSistema/nombre", FilterOperator.Contains, sValue),
              new Filter("usuario", FilterOperator.Contains, sValue),
              new Filter("nombreMostrar", FilterOperator.Contains, sValue),
              new Filter("nombre", FilterOperator.Contains, sValue),
              new Filter("apellidoPaterno", FilterOperator.Contains, sValue),
              new Filter("apellidoMaterno", FilterOperator.Contains, sValue),
              new Filter("correo", FilterOperator.Contains, sValue),
            ],
            and: false,
          });
          oBinding.filter(oFilter, FilterType.Application);
        } else {
          oBinding.filter([]);
        }
      },

      onDialogUserConfirm: function (oEvent) {
        var oObjects = [];
        var aContexts = oEvent.getParameter("selectedContexts");
        var masterModel = sap.ui.getCore().getModel("masterModel").getData();

        var add = true;
        if (aContexts && aContexts.length) {
          aContexts.map(function (oContext) {
            oObjects.push(oContext.getObject());
            return oContext.getObject();
          });
          var RolAppAccListModel = this.getView()
            .getModel("RolAppAccListModel")
            .getData();
          RolAppAccListModel.forEach(function (entry, i) {
            delete RolAppAccListModel[i]["__metadata"];
          });

          for (var i = 0; i < oObjects.length; i++) {
            var contador = 0;
            for (var j = 0; j < RolAppAccListModel.length; j++) {
              if (
                oObjects[i].sUser == RolAppAccListModel[j].sUser &&
                RolAppAccListModel[j].xActivo == true
              ) {
                contador = contador + 1;
              }
            }
            if (contador < 2) {
              var oEntityData = {
                oUsuario_usuarioId: oObject.usuario,
                oRol_rolId: oObject.nombre,
                codigo: oObject.correo,
                activo: true,
              };

              if (!oCriteria.isNew) {
                oEntityData.usuarioId = oObject.usuarioId;
                oEntityData.usuarioActualiza = gsUsuarioLogin;
                oEntityData.fechaActualiza = new Date();
              } else {
                oEntityData.usuarioRegistro = gsUsuarioLogin;
                oEntityData.fechaRegistro = new Date();
              }

              oEntityData.nuevo = true;
              oEntityData.status = true;

              RolAppAccListModel.push({
                dFechaRegistro: new Date(),
                sUsuarioRegistro: UserInfoModel.username,
                xActivo: true,
                sEmail: oObjects[i].sEmail,
                sUser: oObjects[i].sUser,
                oAreaConcepto_oConcepto_iConceptoId: masterModel.iConceptoId,
                oAreaConcepto_oArea_iAreaId: masterModel.iAreaId,
                oRol_iMaestraId: oObjects[i].oRol_iMaestraId,
                oUser: {
                  sNombre: oObjects[i].oUser.sNombre,
                },
                nuevo: true,
                status: true,
              });
            }
          }
          this.getView()
            .getModel("RolAppAccListModel")
            .setData(RolAppAccListModel);
          /*var oTable = this.getView().byId("usuariosTable");
					oTable.setSelectedIndex(-1);
										oTable.getBinding("rows").filter(new Filter("xActivo", FilterOperator.EQ, true), FilterType.Application);
										oTable.getBinding("rows").refresh();
					*/
        } else {
          MessageToast.show("No se han seleccionado usuarios");
        }
      },
      onShowFormRegister: async function (oEvent) {
        that = this;
        var oView = that.getView();

        var sKeySistema = oView.byId("idCboSistema").getValue();
        if (sKeySistema == "" || sKeySistema === null) {
          MessageBox.alert(this.getI18nText("msgRolSistemaReq"));
          return;
        }

        that._showForm(true);

        //var viewDetalle = oView.getParent().getParent().getDetailPages()[0];
        //var oSplitApp = this.getOwnerComponent()._oSplitApp;
        //oSplitApp.setMode("HideMode");
      },
      onSaveForm: function (oEvent) {
        that = this;
        var oView = that.getView();
        var oParameters = oView.getModel("oParameters").getData();

        var oDataEntity = {
          oSistema_sistemaId: oView.byId("idCboSistema").getSelectedKey(),
          codigo: oParameters.codigo,
          nombre: oParameters.nombre,
          descripcion: oParameters.descripcion,

          /*--- auditoriaBase ---*/
          terminal: "",
          fechaRegistro: new Date(),
          usuarioRegistro: gsUsuarioLogin,
          activo: true,
        };

        var isNewRegister = true;
        if (isNewRegister) {
          oDataService
            .oDataCreate(that.getView().getModel(), "Aplicacion", oDataEntity)
            .then(
              function (oResult) {},
              function (error) {
                MessageBox.error("Ha ocurrido un error al guardar el registro");
              }.bind(this)
            );
        }

        that._showForm(false);
      },
      onConcelForm: function (oEvent) {
        that = this;
        var oView = that.getView();
        that._showForm(false);
      },

      _showForm: function (bVisible) {
        if (bVisible) {
          this.getView().getModel("oGeneralForm").setData({
            PageHeadVisible: true,
            ListVisible: false,
            FormVisible: true,
          });
        } else {
          this.getView().getModel("oGeneralForm").setData({
            PageHeadVisible: false,
            ListVisible: true,
            FormVisible: false,
          });
        }
      },

      // Agregar Rol y accion a una aplicacion.
      onAddRol: function () {
        var that = this;

        var oMasterListModel = that
          .getView()
          .getModel("RolAppAccListModel")
          .getData();
        oMasterListModel.unshift({
          oRol_rolId: "",
          oMaestraAccion_iMaestraId: "",
          orden: "1",
          oAplicacion_aplicacionId: "",
          edit: true,
          del: false,
        });
        that.getView().getModel("RolAppAccListModel").refresh(true);

        oBusyDialog.close();
      },

      // Cancelar la agregacion de Rol y accion a una aplicacion.
      onCancel: function () {
        this.onObtenerRolAppAcciones();
      },

      // Eliminar Rol y accion de una aplicacion.
      onDelete: function (oEvent) {
        var that = this;
        var oContext = oEvent
          .getSource()
          .getBindingContext("RolAppAccListModel");
        var oObject = oContext.getObject();
        var idMaestra = oObject.oMaestraAccion_iMaestraId;
        var idRol = oObject.oRol_rolId;
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];

        MessageBox.confirm(this.getI18nText("msgConfirmEliminar"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var sKeyEntity = oModel.createKey("/RolAppAcciones", {
                oMaestraAccion_iMaestraId: idMaestra,
                oRol_rolId: idRol,
                oAplicacion_aplicacionId: idAplication,
              });
              oDataService.oDataRemove(oModel, sKeyEntity).then(
                function (result) {
                  oBusyDialog.close();
                  that.onObtenerRolAppAcciones();
                  MessageBox.success(that.getI18nText("msgEliminado"));
                }.bind(this),
                function (error) {
                  oBusyDialog.close();
                  MessageBox.error(that.getI18nText(error.message));
                }
              );
            } else oBusyDialog.close();
          },
        });
      },

      // Asignar un rol a una accion de una aplicacion.
      onSave: function (oEvent) {
        var that = this;
        var UserInfoModel = sap.ui
          .getCore()
          .getModel("UserInfoModel")
          .getData();
        var oContext = oEvent
          .getSource()
          .getBindingContext("RolAppAccListModel");
        var oObject = oContext.getObject();
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        var aDataRolApp = oDetailPages.getModel("RolAppAccListModel").getData();

        oBusyDialog.open();

        var aCell = oEvent.getSource().getParent().getParent().getCells();
        var aInputs = [
          sap.ui.getCore().byId(aCell[0].getItems()[0].getId()),
          sap.ui.getCore().byId(aCell[1].getItems()[0].getId()),
        ];
        var bValidationError = false;
        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);
        if (bValidationError) {
          oBusyDialog.close();
          MessageBox.alert(this.getI18nText("msgRequerido"));
          sap.ui.core.BusyIndicator.hide();
          return;
        }

        var oEntityData = {
          oMaestraAccion_iMaestraId: oObject.oMaestraAccion_iMaestraId,
          oRol_rolId: oObject.oRol_rolId,
          oAplicacion_aplicacionId: idAplication,
          terminal: null,
          fechaRegistro: new Date(),
          usuarioRegistro: gsUsuarioLogin,
          activo: true,
        };

        MessageBox.confirm(this.getI18nText("msgConfirmAdd"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var bFlag = false;
              $.each(aDataRolApp, function (k, v) {
                if (
                  v.oAplicacion_aplicacionId ===
                    oEntityData.oAplicacion_aplicacionId &&
                  v.oRol_rolId === oEntityData.oRol_rolId &&
                  v.oMaestraAccion_iMaestraId ==
                    oEntityData.oMaestraAccion_iMaestraId
                ) {
                  bFlag = true;
                }
              });
              if (bFlag) {
                MessageBox.warning(that.getI18nText("msgExistsRolApp"));
                oBusyDialog.close();
                return;
              }
              oDataService
                .oDataCreate(oModel, "RolAppAcciones", oEntityData)
                .then(function (result) {
                  oBusyDialog.close();
                  that.onObtenerRolAppAcciones();
                  MessageBox.success(that.getI18nText("msgCreado"));
                })
                .catch(function (oError) {
                  oBusyDialog.close();
                })
                .finally(function () {
                  oBusyDialog.close();
                });
            } else oBusyDialog.close();
          },
        });
      },

      _validateInput: function (oInput) {
        var sValueState = "None";
        var bValidationError = false;
        try {
          var oBinding = oInput.getBinding("selectedKey");

          if (oBinding.oValue === "") {
            sValueState = "Error";
            bValidationError = true;
          }
          oInput.setValueState(sValueState);
        } catch (oError) {
          //oInput.getProperty("key");
          //oInput.getProperty("text");
        }

        return bValidationError;
      },

      // Mensajes de error.
      /**
       * @param {*} oError Objeto con el mensaje de error.
       * @param {*} textoI18n String con el i18n para mostrar como mensaje.
       */
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
                  MessageBox.error(
                    this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText(textoI18n)
                  );
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
                if (typeof sErrorDetails[0].message === "object") {
                  MessageBox.error(sErrorDetails[0].message.value);
                } else {
                  MessageBox.error(sErrorDetails[0].message);
                }
              } else {
                that.onErrorMessage("", "errorSave");
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
          that.onErrorMessage(oErrorT, "errorSave");
        }
      },

      onObtenerRolAppAcciones: function () {
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        var oModel = that.getView().getModel();
        var aFilters = [];
        aFilters.push(
          new sap.ui.model.Filter(
            "oAplicacion_aplicacionId",
            FilterOperator.EQ,
            idAplication
          )
        );

        that._getRolAppAcciones(oModel, aFilters).then(
          function (result) {
            result.forEach(function (entry, i) {
              delete result[i]["__metadata"];
              result[i].status = false;
              result[i].nuevo = false;
              result[i].edit = false;
              result[i].del = true;
            });
            oDetailPages.getModel("RolAppAccListModel").setData(result);
            oBusyDialog.close();
          },
          function (oError) {
            oBusyDialog.close();
          }.bind(this)
        );
      },

      // Agregar Rol al WF a una aplicacion.
      onAddRolWf: function () {
        var that = this;

        var oMasterListModel = that
          .getView()
          .getModel("RolAppWfListModel")
          .getData();
        oMasterListModel.unshift({
          oRol_rolId: "",
          oRolWorkflow_rolId: "",
          orden: "1",
          oAplicacion_aplicacionId: "",
          edit: true,
          del: false,
        });
        that.getView().getModel("RolAppWfListModel").refresh(true);

        oBusyDialog.close();
      },

      // Cancelar la agregacion de Rol al WF a una aplicacion.
      onCancelWf: function () {
        this.onObtenerRolAppWf();
      },

      // Eliminar Rol al WF de una aplicacion.
      onDeleteWf: function (oEvent) {
        var that = this;
        var oContext = oEvent
          .getSource()
          .getBindingContext("RolAppWfListModel");
        var oObject = oContext.getObject();
        var idRolWf = oObject.oRolWorkflow_rolId;
        var idRol = oObject.oRol_rolId;
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];

        MessageBox.confirm(this.getI18nText("msgConfirmEliminar"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var sKeyEntity = oModel.createKey("/RolAppWf", {
                oRolWorkflow_rolId: idRolWf,
                oRol_rolId: idRol,
                oAplicacion_aplicacionId: idAplication,
              });
              oDataService.oDataRemove(oModel, sKeyEntity).then(
                function (result) {
                  oBusyDialog.close();
                  that.onObtenerRolAppWf();
                  MessageBox.success(that.getI18nText("msgEliminado"));
                }.bind(this),
                function (error) {
                  oBusyDialog.close();
                  MessageBox.error(that.getI18nText(error.message));
                }
              );
            } else oBusyDialog.close();
          },
        });
      },

      // Asignar un rol al WF de una aplicacion.
      onSaveWf: function (oEvent) {
        var that = this;
        var UserInfoModel = sap.ui
          .getCore()
          .getModel("UserInfoModel")
          .getData();
        var oContext = oEvent
          .getSource()
          .getBindingContext("RolAppWfListModel");
        var oObject = oContext.getObject();
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        var aDataRolApp = oDetailPages.getModel("RolAppWfListModel").getData();

        oBusyDialog.open();

        var aCell = oEvent.getSource().getParent().getParent().getCells();
        var aInputs = [
          sap.ui.getCore().byId(aCell[0].getItems()[0].getId()),
          sap.ui.getCore().byId(aCell[1].getItems()[0].getId()),
        ];
        var bValidationError = false;
        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);
        if (bValidationError) {
          oBusyDialog.close();
          MessageBox.alert(this.getI18nText("msgRequerido"));
          sap.ui.core.BusyIndicator.hide();
          return;
        }

        var oEntityData = {
          oRolWorkflow_rolId: oObject.oRolWorkflow_rolId,
          oRol_rolId: oObject.oRol_rolId,
          oAplicacion_aplicacionId: idAplication,
          terminal: null,
          fechaRegistro: new Date(),
          usuarioRegistro: gsUsuarioLogin,
          activo: true,
        };

        MessageBox.confirm(this.getI18nText("msgConfirmAdd"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var bFlag = false;
              $.each(aDataRolApp, function (k, v) {
                if (
                  v.oAplicacion_aplicacionId ===
                    oEntityData.oAplicacion_aplicacionId &&
                  v.oRol_rolId === oEntityData.oRol_rolId &&
                  v.oRolWorkflow_rolId == oEntityData.oRolWorkflow_rolId
                ) {
                  bFlag = true;
                }
              });
              if (bFlag) {
                MessageBox.warning(that.getI18nText("msgExistsRolAppWf"));
                oBusyDialog.close();
                return;
              }
              oDataService
                .oDataCreate(oModel, "RolAppWf", oEntityData)
                .then(function (result) {
                  oBusyDialog.close();
                  that.onObtenerRolAppWf();
                  MessageBox.success(that.getI18nText("msgCreado"));
                })
                .catch(function (oError) {
                  oBusyDialog.close();
                })
                .finally(function () {
                  oBusyDialog.close();
                });
            } else oBusyDialog.close();
          },
        });
      },

      onObtenerRolAppWf: function () {
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        var oModel = that.getView().getModel();
        var aFilters = [];
        aFilters.push(
          new sap.ui.model.Filter(
            "oAplicacion_aplicacionId",
            FilterOperator.EQ,
            idAplication
          )
        );

        that._getRolAppWf(oModel, aFilters).then(
          function (result) {
            result.forEach(function (entry, i) {
              delete result[i]["__metadata"];
              result[i].status = false;
              result[i].nuevo = false;
              result[i].edit = false;
              result[i].del = true;
            });
            oDetailPages.getModel("RolAppWfListModel").setData(result);
            oBusyDialog.close();
          },
          function (oError) {
            oBusyDialog.close();
          }.bind(this)
        );
      },
    });
  }
);
