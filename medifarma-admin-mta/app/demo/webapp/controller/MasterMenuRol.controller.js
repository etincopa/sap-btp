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
    "administrador/model/formatter",
    "administrador/service/oDataService",
    "administrador/service/iasScimService",
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
    formatter,
    oDataService,
    iasScimService
  ) {
    "use strict";
    var that;
    var UserInfoModel,
      gsUsuarioLogin = "";
    var oBusyDialog = new sap.m.BusyDialog();
    var oDataServiceModel = oDataService;
    var goUserLogin = null,
      constanteEtapa = "ETAPA_PRODUCCION";
    var sSistemaSelect = null;
    var oSyncIasHana = {};
    return BaseController.extend("administrador.controller.MasterMenuRol", {
      formatter: formatter,

      onInit: function () {
        that = this;
        that.oModelCapService = that.getOwnerComponent().getModel("capService");
        that.oModel = that.getOwnerComponent().getModel();

        that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        that.oRouter
          .getTarget("MenuRol")
          .attachDisplay(jQuery.proxy(that._handleRouteMatched, this));

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

        oView.setModel(new JSONModel([]), "detalleModel");
        oView.setModel(new JSONModel([]), "ParamsSelectModel");
        oView.setModel(new JSONModel([]), "UserRolModel");

        var masterModel = new sap.ui.model.json.JSONModel({});
        sap.ui.getCore().setModel(masterModel, "masterModel");

        this.oModelErpNec =
          this.getOwnerComponent().getModel("NECESIDADESRMD_SRV");
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
        goUserLogin = await this.getUserLoginIas();
        if (!goUserLogin) {
          sap.ui.core.BusyIndicator.show(0);
          return false;
        }
        if (!goUserLogin.groups.length) {
          sap.ui.core.BusyIndicator.show(0);
          MessageBox.error(
            "USUARIO SIN ROL PARA ESTA APLICACION, " +
              "COMINIQUESE CON UN ADMINISTRADOR PARA ASIGNAR EL ROL: ADM_XXXX"
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
          goUserLogin.groups.forEach((oItem) => {
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
      onCBoxChange: function (idComponent, idComponetAction) {
        UserInfoModel = sap.ui.getCore().getModel("UserInfoModel").getData();

        var that = this;
        var oView = that.getView();
        var oSelectedItem = oView.byId(idComponent).getSelectedItem();
        var oSelectedSystem = oSelectedItem
          .getBindingContext("SistemaList")
          .getObject();
        var sSelectedSystem = oSelectedSystem.codigo;

        if (sSelectedSystem !== "") {
          // cargar lista de grupos
          var aGroups = [];
          sap.ui.core.BusyIndicator.show(0);
          iasScimService
            .getScimGroups("co", `${sSelectedSystem}_`)
            .then((oResponse) => {
              aGroups = aGroups.concat(oResponse.Resources);
              var oModel = new JSONModel(aGroups);
              oView.setModel(oModel, "ScimGroups");
              var oList = oView.byId(idComponetAction);
              var oSorter = new Sorter({
                path: "name",
                descending: false,
              });
              oList.bindItems({
                path: "ScimGroups>/",
                filters: [
                  new Filter("name", FilterOperator.Contains, sSelectedSystem),
                ],
                sorter: oSorter,
                template: new sap.m.StandardListItem({
                  title: "{ScimGroups>name}",
                  description: "{ScimGroups>description}",
                  info: "{ScimGroups>groupId}",
                  type: "Navigation",
                }),
              });
              if (!oSyncIasHana[sSelectedSystem]) {
                that._syncIasGroupsWithHana(sSelectedSystem);
                that._getRole(null);
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .catch((oErr) => {
              console.error("Error al obtener grupos de IAS", oErr);
            });
        }
      },

      onListItemPress: function (oEvent) {
        var that = this;
        oBusyDialog.open();
        var oItemSelect = oEvent.getSource().getSelectedItems();
        var oObject = oItemSelect[0]
          .getBindingContext("ScimGroups")
          .getObject();
        var oView = that.getView();
        var oSelectedItem = oView.byId("idCboSistema").getSelectedItem();
        var oSelectedSystem = oSelectedItem
          .getBindingContext("SistemaList")
          .getObject();
        var sSelectedSystem = oSelectedSystem.nombre;
        var sSelectedSystemId = oSelectedSystem.sistemaId;
        oObject.Sistema = sSelectedSystem;
        oObject.SistemaId = sSelectedSystemId;
        oSelectedItem = oEvent.getSource().getSelectedItem();
        var oSelectedGroup = oSelectedItem
          .getBindingContext("ScimGroups")
          .getObject();
        var sSelectedGroup = oSelectedGroup.name;
        oObject.Rol = sSelectedGroup;
        var rolId = oObject.groupId;
        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        var aEstadoList = this.getView().getModel("EstadoList").getData();
        if (aEstadoList.length) {
          var oEstadoList = aEstadoList[0];
          oObject.iMaestraId = oEstadoList.iMaestraId;
        }
        oDetailPages.getModel("ParamsSelectModel").setData(oObject);
        sap.ui.getCore().setModel(new JSONModel(oObject), "oModelSystemRol");

        var oModel = that.getView().getModel();

        var aFilters = [];
        aFilters.push(
          new sap.ui.model.Filter(
            "oRol_rolId",
            sap.ui.model.FilterOperator.EQ,
            rolId
          )
        );
        this._getUserRol(oModel, aFilters, oDetailPages);
      },
      _getUserRol: function (oModel, aFilters, oDetailPages) {
        let that = this;
        this.oDataReadExpand(oModel, aFilters).then(
          function (result) {
            result.forEach(function (entry, i) {
              delete result[i]["__metadata"];
              result[i].dml = "NONE";
              result[i].exist = true;
            });
            oDetailPages.getModel("UserRolModel").setData(result);
            oDetailPages.getModel("UserRolModel").refresh();

            //Guardo los users Roles en otro modelo para la validacion al eliminar
            that.getView().setModel(new JSONModel(result), "UserRolModelAux");

            oBusyDialog.close();
          },
          function (oError) {
            oBusyDialog.close();
          }.bind(this)
        );
      },

      oDataReadExpand: function (oModel, aFilters) {
        return new Promise(function (resolve, reject) {
          oModel.read("/RolUsuario", {
            filters: aFilters,
            urlParameters: {
              $expand: "oUsuario",
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

      onOpenDialogUsuario: async function (oEvent) {
        var that = this;
        oBusyDialog.open();
        UserInfoModel = sap.ui.getCore().getModel("UserInfoModel").getData();
        //var oButton = oEvent.getSource();
        //var masterModel = sap.ui.getCore().getModel("masterModel").getData();

        var EQ = FilterOperator.EQ;
        var aFilterSistema = [];

        var oModelSystemRol = sap.ui.getCore().getModel("oModelSystemRol");
        if (!oModelSystemRol) {
          return oBusyDialog.close();
        }
        var oSystemRol = oModelSystemRol.getData();
        var sSistemaSelect = oSystemRol.SistemaId;

        aFilterSistema.push(
          new Filter("oSistema_sistemaId", EQ, sSistemaSelect)
        );

        var urlParameters = {
          $expand: "oUsuario,oSistema",
        };
        oDataService
          .oDataRead(
            this.getView().getModel(),
            "UsuarioSistema",
            urlParameters,
            aFilterSistema
          )
          .then(
            function (result) {
              oBusyDialog.close();
              var aUsuarioSistema = result.results;
              var aUsuarios = [];
              aUsuarioSistema.forEach((oUsuarioSistema) => {
                var oUsuario = oUsuarioSistema.oUsuario;
                if (oUsuario) {
                  oUsuario.oSistema = oUsuarioSistema.oSistema;
                  aUsuarios.push(oUsuario);
                }
              });
              var oModel = new JSONModel(aUsuarios);
              if (!that._oDialogFrgUsuarios) {
                Fragment.load({
                  name: "administrador.view.MenuRol.fragment.Usuarios",
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
              oBusyDialog.close();
              console.log(oError);
            }
          );
      },
      onDialogClose: async function (oEvent) {},

      onChange: function (oEvent) {
        var oInput = oEvent.getSource();
        oInput.setValueState("None");
      },
      onChangeState: function (oEvent) {
        var oInput = oEvent.getSource();
        var oRole = that.getView().getModel("ParamsSelectModel").getData();
        var gId =
          "/" +
          oRole.__metadata.uri.split("/")[
            oRole.__metadata.uri.split("/").length - 1
          ];
        var oData = { activo: oRole.activo };
        oDataService.oDataUpdate(that.getView().getModel(), gId, oData);
        oInput.setValueState("None");
      },
      onSavePressed: function (oEvent) {
        var that = this;
        var oView = that.getView();
        var aUserRolModel = oView.getModel("UserRolModel").getData();
        var oParamsSelectModel = oView.getModel("ParamsSelectModel").getData();
        var aEstadoList = oView.getModel("EstadoList").getData();

        var aEstadoSelect = $.grep(aEstadoList, function (e) {
          return e.iMaestraId == oParamsSelectModel.iMaestraId;
        });

        var aUserRolModelDml = $.grep(aUserRolModel, function (e) {
          return e.dml != "NONE";
        });

        var oEstadoSelect = aEstadoSelect[0];
        var aEntityData = [];

        var oModel = that.getView().getModel();

        for (var i = 0; i < aUserRolModelDml.length; i++) {
          var oUserRolModelDml = aUserRolModelDml[i];

          var sEntity = "/RolUsuario";
          var sKeyEntity = oModel.createKey(sEntity, {
            oUsuario_usuarioId: oUserRolModelDml.oUsuario_usuarioId,
            oRol_rolId: oUserRolModelDml.oRol_rolId,
          });

          var oEntityData = {
            oUsuario_usuarioId: oUserRolModelDml.oUsuario_usuarioId,
            oRol_rolId: oUserRolModelDml.oRol_rolId,

            /*--- auditoriaBase ---*/
            terminal: "",
            fechaRegistro: new Date(),
            usuarioRegistro: gsUsuarioLogin,
            activo: oUserRolModelDml.activo,

            /* --------DML para registros masivos-------- */
            dml: oUserRolModelDml.dml,
            entity: sEntity,
            keyEntity: sKeyEntity,
          };

          aEntityData.push(oEntityData);
        }

        var oDetailPages = that
          .getView()
          .getParent()
          .getParent()
          .getDetailPages()[0];
        oDataService.oDataDmlMasive(oModel, aEntityData).then(
          function (oResult) {
            MessageBox.success("Registro guardado con exito");
            var rolId = oParamsSelectModel.groupId;
            var aFilters = [];
            aFilters.push(
              new sap.ui.model.Filter(
                "oRol_rolId",
                sap.ui.model.FilterOperator.EQ,
                rolId
              )
            );
            that._getUserRol(oModel, aFilters, oDetailPages);
          },
          function (error) {
            MessageBox.error("Ha ocurrido un error al guardar los registros");
          }.bind(this)
        );
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

      onDelUsuario: function (oEvent) {
        var that = this;
        var oTable = this.getView().byId("idTableUserRolModel");
        var selectedIndices = oTable.getSelectedIndices();
        var aIndices = oTable.getBinding("rows").aIndices;
        if (selectedIndices.length > 0) {
          MessageBox.confirm(that.getI18nText("msgConfirmEliminar"), {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: async function (sAction) {
              if (MessageBox.Action.YES == sAction) {
                var UserRolModel = that
                  .getView()
                  .getModel("UserRolModel")
                  .getData();

                var oModel = that.getView().getModel();
                var aEntityData = [];
                selectedIndices.forEach(function (index) {
                  var ind = aIndices[index];
                  var oUserRolModelDml = UserRolModel[ind];

                  if (oUserRolModelDml.exist) {
                    var sEntity = "/RolUsuario";
                    var sKeyEntity = oModel.createKey(sEntity, {
                      oUsuario_usuarioId: oUserRolModelDml.oUsuario_usuarioId,
                      oRol_rolId: oUserRolModelDml.oRol_rolId,
                    });

                    var oEntityData = {
                      oUsuario_usuarioId: oUserRolModelDml.oUsuario_usuarioId,
                      oRol_rolId: oUserRolModelDml.oRol_rolId,

                      /* --------DML para registros masivos-------- */
                      dml: "D",
                      entity: sEntity,
                      keyEntity: sKeyEntity,
                    };
                    aEntityData.push(oEntityData);
                  } else {
                    UserRolModel.splice(ind, 1); //Eliminar indice
                  }
                });

                if (aEntityData.length > 0) {
                  var oParamsSelectModel = that
                    .getView()
                    .getModel("ParamsSelectModel")
                    .getData();
                  var oDetailPages = that
                    .getView()
                    .getParent()
                    .getParent()
                    .getDetailPages()[0];
                  oDataService.oDataDmlMasive(oModel, aEntityData).then(
                    function (oResult) {
                      MessageBox.success("Registro eliminado con exito");
                      var rolId = oParamsSelectModel.groupId;
                      var aFilters = [];
                      aFilters.push(
                        new sap.ui.model.Filter(
                          "oRol_rolId",
                          sap.ui.model.FilterOperator.EQ,
                          rolId
                        )
                      );
                      that._getUserRol(oModel, aFilters, oDetailPages);
                    },
                    function (error) {
                      MessageBox.error(
                        "Ha ocurrido un error al guardar los registros"
                      );
                    }.bind(this)
                  );
                } else {
                  that.getView().getModel("UserRolModel").refresh();
                  //oTable.getBinding("rows").refresh();
                }

                //that.getView().getModel("UserRolModel").setData(UserRolModel);
                //oTable.setSelectedIndex(-1);
                //oTable.getBinding("rows").filter(new Filter("activo", FilterOperator.EQ, true), FilterType.Application);
                //oTable.getBinding("rows").refresh();

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

      onDialogUserConfirm: async function (oEvent) {
        var oObjects = [];
        var aContexts = oEvent.getParameter("selectedContexts");

        if (aContexts && aContexts.length) {
          aContexts.map(function (oContext) {
            oObjects.push(oContext.getObject());
            return oContext.getObject();
          });
          var UserRolModel = this.getView().getModel("UserRolModel").getData();
          UserRolModel.forEach(function (entry, i) {
            delete UserRolModel[i]["__metadata"];
          });

          var oParamsSelectModel = this.getView()
            .getModel("ParamsSelectModel")
            .getData();
          var oEstadoList = this.getView().getModel("EstadoList").getData();
          var oEstadoSelect = $.grep(oEstadoList, function (e) {
            return e.iMaestraId == oParamsSelectModel.iMaestraId;
          });

          var aValidateUser;
          if (
            //Si es central de pesadas no valida
            oParamsSelectModel.SistemaId ===
            "da5e922a-e334-4dfe-bba1-e451db298579"
          ) {
            aValidateUser = [];
          } else {
            //Valida que el usuario no tenga otro Rol
            aValidateUser = await this.onValidateUserforRol(
              oObjects,
              oParamsSelectModel.groupId
            );
          }

          if (aValidateUser.length === 0) {
            if (!(oEstadoSelect.length && oParamsSelectModel))
              return MessageBox.error("Todo los campos son requeridos");

            for (var i = 0; i < oObjects.length; i++) {
              var oObjectSelect = null;
              for (var j = 0; j < UserRolModel.length; j++) {
                if (
                  oObjects[i].usuarioId == UserRolModel[j].oUsuario_usuarioId
                ) {
                  oObjectSelect = UserRolModel[j];
                  break;
                }
              }

              var oEntityData = {
                oUsuario_usuarioId: oObjects[i].usuarioId,
                oRol_rolId: oParamsSelectModel.groupId,
                activo: oEstadoSelect[0].codigo == "0" ? false : true,
              };

              oEntityData.oUsuario = {
                usuario: oObjects[i].usuario,
                nombre: oObjects[i].nombre,
                correo: oObjects[i].correo,
              };

              if (!oObjectSelect) {
                oEntityData.dml = "C";
                oEntityData.exist = false;

                UserRolModel.push(oEntityData);
              } else {
                oObjectSelect.activo =
                  oEstadoSelect[0].codigo == "0" ? false : true;

                if (oObjectSelect.exist) {
                  oObjectSelect.dml = "U";
                } else {
                  oObjectSelect.dml = "C";
                }
              }
            }
            this.getView().getModel("UserRolModel").setData(UserRolModel);
          } else {
            let sMessage = "";
            aValidateUser.forEach(function (oItem) {
              sMessage =
                sMessage +
                "Usuario " +
                oItem.oUsuario.usuario +
                " ya esta asignado a rol: " +
                oItem.oRol.nombre;
              sMessage = sMessage + "\n";
            });
            MessageBox.error(sMessage);
          }
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
      },
      onSaveForm: function (oEvent) {
        that = this;
        var oView = that.getView();
        var oParameters = oView.getModel("oParameters").getData();

        var oEntityData = {
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
            .oDataCreate(that.getView().getModel(), "Rol", oEntityData)
            .then(
              function (oResult) {
                MessageBox.success("Registro guardado con exito");
              },
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
      onGetNivelOdata: async function () {
        BusyIndicator.show(0);
        let aFilters = [];
        aFilters.push(new Filter("AtinnText", "EQ", constanteEtapa));
        let oResponse = await oDataServiceModel.oDataRead(
          this.oModelErpNec,
          "/CaracteristicasSet",
          null,
          aFilters
        );
        let info = new JSONModel(oResponse.results);
        this.getView().setModel(info, "aListaNiveles");
        BusyIndicator.hide();
      },

      onValidateUserforRol: async function (aUsersSelected, sSitema) {
        let aResp = [];

        let oUrlParameters = {
          $expand: "oRol,oUsuario",
        };
        let aFilters = [];
        aFilters.push(new Filter("oRol_rolId", "EQ", sSitema));

        let oRolesUsers = await oDataServiceModel.oDataRead(
          this.oModel,
          "RolUsuario",
          oUrlParameters,
          aFilters
        );

        aUsersSelected.forEach(function (oItem) {
          oRolesUsers.results.forEach(function (oItemRolesUsers) {
            if (oItemRolesUsers.oUsuario.usuarioId === oItem.usuarioId) {
              aResp.push(oItemRolesUsers);
            }
          });
        });

        return aResp;
      },
      onDeleteFormRegister: async function () {
        that = this;
        var oView = that.getView();
        var oRolSelected = oView.byId("idLstResult").getSelectedItem();
        if (oRolSelected) {
          MessageBox.confirm("¿Desea eliminar el rol seleccionado?", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: async function (sAction) {
              if (MessageBox.Action.YES == sAction) {
                var oObject = oRolSelected.getBindingContext().getObject();
                var aUsersforRol = oView.getModel("UserRolModelAux").getData();
                if (aUsersforRol.length === 0) {
                  delete oObject.__metadata;
                  delete oObject.aRolUsuarios;
                  delete oObject.oSistema;

                  oObject.activo = false;
                  sap.ui.core.BusyIndicator.show(0);

                  oDataService
                    .oDataUpdate(
                      that.getView().getModel(),
                      "/Rol(guid'" + oObject.rolId + "')",
                      oObject
                    )
                    .then((oResult) => {
                      sap.ui.core.BusyIndicator.hide();
                      that.onCBoxChange("idCboSistema", "idLstResult");
                      MessageBox.success("Registro borrado correctamente");
                    });
                } else {
                  MessageBox.alert("El rol no debe tener usuarios asignados");
                  return;
                }
              }
            },
          });
        } else {
          MessageBox.alert("Debe seleccionar un rol para poder eliminar");
          return;
        }
      },

      _syncIasGroupsWithHana: async function (sSelectedSystem) {
        var that = this;
        var oModelRolIas = this.getView().getModel("ScimGroups");
        var aRolIas = oModelRolIas.getData();
        var oModelRolHana = this.getView().getModel("RolList");
        var aRolHana = oModelRolHana.getData();
        for (let i = 0; i < aRolIas.length; i++) {
          const oRolIas = aRolIas[i];
          var isFound = false;
          for (let j = 0; j < aRolHana.length; j++) {
            const oRolHana = aRolHana[j];
            if (oRolIas.name === oRolHana.nombre) {
              isFound = true;
            }
          }
          if (!isFound) {
            var oEntityData = {
              rolId: oRolIas.groupId,
              oSistema_sistemaId: this.getView()
                .byId("idCboSistema")
                .getSelectedKey(),
              codigo: oRolIas.name,
              nombre: oRolIas.name,
              descripcion: oRolIas.description,

              /*--- auditoriaBase ---*/
              terminal: "",
              fechaRegistro: new Date(),
              usuarioRegistro: gsUsuarioLogin,
              activo: true,
            };
            await oDataService
              .oDataCreate(this.getView().getModel(), "Rol", oEntityData)
              .then(
                function (oResult) {
                  console.log("Registro guardado con exito");
                },
                function (error) {
                  console.error("Ha ocurrido un error al guardar el registro");
                }.bind(this)
              );
          }
        }
        oSyncIasHana[sSelectedSystem] = true;
      },
    });
  }
);
