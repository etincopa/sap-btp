sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "administrador/controller/BaseController",
    "administrador/model/formatter",
    "administrador/service/oDataService",
  ],
  function (
    MessageBox,
    Filter,
    FilterOperator,
    FilterType,
    SimpleType,
    ValidateException,
    JSONModel,
    Fragment,
    BaseController,
    formatter,
    oDataService
  ) {
    "use strict";
    var oBusyDialog = new sap.m.BusyDialog();
    var gsUsuarioLogin = "";
    var sResponsivePaddingClasses =
      "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

    return BaseController.extend("administrador.controller.Maestras", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf administrador.view.Maestra
       */
      formatter: formatter,
      onInit: function () {
        this.getView().setModel(
          new sap.ui.model.json.JSONModel([]),
          "MasterTypeListModel"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel([]),
          "MasterListModel"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel([]),
          "AplicacionListModel"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            queryText: "",
            isNew: false,
          }),
          "CriteriaModel"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel([]),
          "AppRolAccion"
        );

        this.mainModelv4 = this.getView().getModel("capService");
      },
      onAfterRendering: async function () {
        var that = this;
        try {
          gsUsuarioLogin = sap.ushell.Container.getService("UserInfo")
            .getUser()
            .getEmail();
          var goUserLogin = await this.getUserLoginIas();
          if (!goUserLogin) {
            sap.ui.core.BusyIndicator.show(0);
            return false;
          }
          if (!goUserLogin.groups.length) {
            sap.ui.core.BusyIndicator.show(0);
            MessageBox.error(
              "USUARIO SIN ROL PARA ESTA APLICACION, COMUNIQUESE CON UN ADMINISTRADOR PARA ASIGNAR EL ROL: ADM_XXXX"
            );
            return;
          }

          var EQ = FilterOperator.EQ;
          var aFilterSistema = [];
          goUserLogin.groups.forEach((oItem) => {
            if (oItem.sistema == "ADMIN") {
              //Si es admin control total a todos los sistemas
              aFilterSistema = [];
              return false;
            }
            aFilterSistema.push(
              new Filter("oSistema/codigo", EQ, oItem.sistema)
            );
          });

          this._getAplicacion(aFilterSistema);

          that
            ._getMaestraTipo(null)
            .then(function (oResponse) {
              //var aFilters = [];
              //var temp = oResponse.results.find((o) => o.tabla === "ESTADO_GENERAL");
              //if (temp) {
              //    aFilters.push(new Filter("oMaestraTipo_maestraTipoId", FilterOperator.EQ, temp.maestraTipoId));
              //}

              that._getMaestra(null);
              sap.ui.core.BusyIndicator.hide();
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
      _addConstantFilter: function (queryText) {
        var aFilters = [];
        if (queryText) {
          aFilters.push(
            new Filter(
              [
                new Filter("contenido", FilterOperator.Contains, queryText),
                new Filter("descripcion", FilterOperator.Contains, queryText),
                new Filter(
                  "oMaestraTipo/tabla",
                  FilterOperator.Contains,
                  queryText
                ),
                new Filter(
                  "oAplicacion/nombre",
                  FilterOperator.Contains,
                  queryText
                ),
                new Filter("codigo", FilterOperator.Contains, queryText),
              ],
              false
            )
          );
        } else {
          aFilters = null;
        }
        return aFilters;
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
          var oModel = that.getView().getModel();
          sap.ui.core.BusyIndicator.show(0);
          oDataService
            .oDataRead(oModel, "MaestraTipo", null, aFilter)
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
      _getMaestra: function (aFilter) {
        var that = this;
        if (aFilter) {
          aFilter.push(new Filter("activo", FilterOperator.EQ, true));
        } else {
          aFilter = [];
          aFilter.push(
            new Filter([new Filter("activo", FilterOperator.EQ, true)], false)
          );
        }
        oDataService
          .oDataRead(this.getView().getModel(), "Maestra", null, aFilter)
          .then(
            function (result) {
              that
                .getView()
                .getModel("MasterListModel")
                .setData(result.results);
              that.getView().getModel("MasterListModel").refresh;
              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },

      _getAplicacion: function (aFilter) {
        var that = this;
        oDataService
          .oDataRead(this.getView().getModel(), "Aplicacion", null, aFilter)
          .then(
            function (result) {
              that
                .getView()
                .getModel("AplicacionListModel")
                .setData(result.results);
              that.getView().getModel("AplicacionListModel").refresh;
              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },
      onOpenMasterType: async function (oEvent) {
        var that = this;
        var oModel = new JSONModel(
          that.getView().getModel("MasterTypeListModel").getData()
        );
        if (!that._oDialogFrgMaestraTipo) {
          Fragment.load({
            name: "administrador.view.fragment.MaestraTipo",
            controller: this,
          }).then(
            function (oDialog) {
              that._oDialogFrgMaestraTipo = oDialog;
              that._oDialogFrgMaestraTipo.setModel(
                oModel,
                "MasterTypeListModel"
              );
              that._oDialogFrgMaestraTipo.setMultiSelect(true);
              that._oDialogFrgMaestraTipo.open();
            }.bind(this)
          );
        } else {
          that._oDialogFrgMaestraTipo.setModel(oModel, "MasterTypeListModel");
          that._oDialogFrgMaestraTipo.setMultiSelect(true);
          that._oDialogFrgMaestraTipo.open();
        }
      },
      handleSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("tabla", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([oFilter]);
      },

      onSearch: function (oEvent) {
        var queryText = oEvent.getParameter("query");

        var aFilters = this._addConstantFilter(queryText);
        this._getMaestra(aFilters);
      },
      onNewRegister: function () {
        let oCriteria = this.getView().getModel("CriteriaModel").getData();
        if (!oCriteria.isEdit) {
          this.getView().getModel("CriteriaModel").setProperty("/isNew", true);
          this.getView().getModel("CriteriaModel").setProperty("/isEdit", true);
          let oMasterListModel = this.getView()
            .getModel("MasterListModel")
            .getData();
          oMasterListModel.unshift({
            oMaestraTipo_maestraTipoId: "",
            contenido: "",
            descripcion: "",
            orden: "1",
            codigo: "",
            oAplicacion_aplicacionId: "",
            edit: true,
            del: false,
          });
          this.getView().getModel("MasterListModel").refresh();
          oBusyDialog.close();
        }
      },
      onCancel: function () {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        this.getView().getModel("CriteriaModel").setProperty("/isEdit", false);
        this.getView().getModel("CriteriaModel").setProperty("/isNew", false);
        var aFilters = this._addConstantFilter(oCriteria.queryText);
        this._getMaestra(aFilters);
      },
      onEdit: function (oEvent) {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        let UserInfoModel = this.getView().getModel("UserInfoModel").getData();
        let MasterTypeListModel = this.getView()
          .getModel("MasterTypeListModel")
          .getData();
        var oContext = oEvent.getSource().getBindingContext("MasterListModel");
        var oObject = oContext.getObject();
        let tipoSelected = MasterTypeListModel.find(
          (itm) => itm.maestraTipoId === oObject.oMaestraTipo_maestraTipoId
        );
        let flag = Boolean;
        if (tipoSelected.onlyAdmin) {
          if (UserInfoModel.sistema === "ADMIN") {
            flag = true;
          } else {
            flag = false;
          }
        } else {
          flag = true;
        }
        if (flag) {
          var oPath = oContext.getPath();
          var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);

          if (!oCriteria.isEdit) {
            this.getView()
              .getModel("CriteriaModel")
              .setProperty("/isEdit", true);
            var oMasterListModel = this.getView()
              .getModel("MasterListModel")
              .getData();
            var oItemSelected = oMasterListModel[index];
            oItemSelected.edit = true;
            oItemSelected.del = false;
            this.getView().getModel("MasterListModel").refresh();
          }
        } else {
          MessageBox.error(this.getI18nText("msgOnlyAdmin"));
        }
      },
      onSave: function (oEvent) {
        var that = this;
        var UserInfoModel = sap.ui
          .getCore()
          .getModel("UserInfoModel")
          .getData();
        var oContext = oEvent.getSource().getBindingContext("MasterListModel");
        let MasterTypeListModel = this.getView()
          .getModel("MasterTypeListModel")
          .getData();
        var oObject = oContext.getObject();
        let tipoSelected = MasterTypeListModel.find(
          (itm) =>
            itm.maestraTipoId === parseInt(oObject.oMaestraTipo_maestraTipoId)
        );
        let flag = Boolean;

        /**
         * Verifica si el usuario tiene permiso para realizar el guardado del nuevo registro
         */
        if (tipoSelected.onlyAdmin) {
          if (UserInfoModel.sistema === "ADMIN") {
            flag = true;
          } else {
            flag = false;
          }
        } else {
          flag = true;
        }
        if (!flag) {
          MessageBox.error(this.getI18nText("msgOnlyAdmin"));
          return;
        }
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);

        oBusyDialog.open();

        var aCell = oEvent.getSource().getParent().getParent().getCells();
        var aInputs = [
          sap.ui.getCore().byId(aCell[1].getItems()[0].getId()),
          sap.ui.getCore().byId(aCell[2].getItems()[0].getId()),
        ];
        var bValidationError = false;
        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);
        if (bValidationError) {
          oBusyDialog.close();
          MessageBox.alert(this.getI18nText("msgRequerido"));
          return;
        }

        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        //Sistema
        var idSistema = this.onSearchSystem(oObject.oAplicacion_aplicacionId);

        var oEntityData = {
          oMaestraTipo_maestraTipoId: oObject.oMaestraTipo_maestraTipoId,
          contenido: oObject.contenido,
          descripcion: oObject.descripcion,
          orden: oObject.orden,
          codigo: oObject.codigo,
          oAplicacion_aplicacionId: oObject.oAplicacion_aplicacionId,
          activo: true,
          oSistema_sistemaId: idSistema,
        };

        function guardarMaestra() {
          MessageBox.confirm(that.getI18nText("msgConfirmAdd"), {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: async function (sAction) {
              if (MessageBox.Action.YES == sAction) {
                var oModel = that.getView().getModel();
                if (oCriteria.isNew) {
                  oDataService
                    .oDataRead(oModel, "SeqMaestra", null, null)
                    .then(function (oResult) {
                      var nextId = oResult.results[0].id;
                      if (!nextId) nextId = 1;

                      oEntityData.iMaestraId = nextId;
                      oDataService
                        .oDataCreate(oModel, "Maestra", oEntityData)
                        .then(
                          function (result) {
                            oBusyDialog.close();
                            that
                              .getView()
                              .getModel("CriteriaModel")
                              .setProperty("/isEdit", false);
                            that
                              .getView()
                              .getModel("CriteriaModel")
                              .setProperty("/isNew", false);
                            var aFilters = that._addConstantFilter(
                              oCriteria.queryText
                            );
                            that._getMaestra(aFilters);
                            MessageBox.success(that.getI18nText("msgCreado"));
                          }.bind(this),
                          function (error) {
                            oBusyDialog.close();
                          }
                        );
                    })
                    .catch(function (oError) {
                      console.log(oError);
                      sap.ui.core.BusyIndicator.hide();
                    })
                    .finally(function () {
                      // sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                  var sKeyEntity = oModel.createKey("/Maestra", {
                    iMaestraId: oEntityData.iMaestraId,
                  });
                  oDataService
                    .oDataUpdate(oModel, sKeyEntity, oEntityData)
                    .then(
                      function (result) {
                        oBusyDialog.close();
                        that
                          .getView()
                          .getModel("CriteriaModel")
                          .setProperty("/isEdit", false);
                        var aFilters = that._addConstantFilter(
                          oCriteria.queryText
                        );
                        that._getMaestra(aFilters);
                        MessageBox.success(that.getI18nText("msgActualiza"));
                      }.bind(this),
                      function (error) {
                        oBusyDialog.close();
                      }
                    );
                }
              } else oBusyDialog.close();
            },
          });
        }
        //Validacion por Codigo
        var bValidationCodigo = this.onValidateCodigo(oObject);

        if (!oCriteria.isNew) {
          oEntityData.iMaestraId = oObject.iMaestraId;
          oEntityData.usuarioActualiza = gsUsuarioLogin;
          oEntityData.fechaActualiza = new Date();
        } else {
          oEntityData.usuarioRegistro = gsUsuarioLogin;
          oEntityData.fechaRegistro = new Date();

          if (bValidationCodigo === true) {
            oBusyDialog.close();
            var sContinuar = this.getI18nText("msgContinuar");
            MessageBox.alert("Ya existe un registro con el mismo código", {
              actions: [sContinuar, MessageBox.Action.CANCEL],
              emphasizedAction: sContinuar,
              onClose: function (sAction) {
                if (sAction !== sContinuar) {
                  return;
                } else {
                  guardarMaestra();
                }
              },
            });
          }
        }

        guardarMaestra();
      },
      onDelete: function (oEvent) {
        var that = this;
        var oContext = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getBindingContext("MasterListModel");
        var oObject = oContext.getObject();
        var id = oObject.iMaestraId;
        var oEntityData = oObject;
        var UserInfoModel = sap.ui
          .getCore()
          .getModel("UserInfoModel")
          .getData();
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        MessageBox.confirm(this.getI18nText("msgConfirmEliminar"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var sKeyEntity = oModel.createKey("/Maestra", {
                iMaestraId: id,
              });
              delete oEntityData.__metadata;
              oEntityData.activo = false;
              oEntityData.usuarioActualiza = gsUsuarioLogin;
              oEntityData.fechaActualiza = new Date();

              oDataService.oDataUpdate(oModel, sKeyEntity, oEntityData).then(
                function (result) {
                  oBusyDialog.close();
                  that
                    .getView()
                    .getModel("CriteriaModel")
                    .setProperty("/isEdit", false);
                  var aFilters = that._addConstantFilter(oCriteria.queryText);
                  that._getMaestra(aFilters);
                  MessageBox.success(that.getI18nText("msgEliminado"));
                }.bind(this),
                function (oError) {
                  oBusyDialog.close();
                  that._customErrorMessage(oError);
                }
              );
            } else oBusyDialog.close();
          },
        });
      },
      _validateInput: function (oInput) {
        var sValueState = "None";
        var bValidationError = false;
        var oBinding = oInput.getBinding("value");

        try {
          oBinding.getType().validateValue(oInput.getValue());
        } catch (oException) {
          sValueState = "Error";
          bValidationError = true;
        }

        oInput.setValueState(sValueState);

        return bValidationError;
      },
      customEMailType: SimpleType.extend("email", {
        formatValue: function (oValue) {
          return oValue;
        },

        parseValue: function (oValue) {
          //parsing step takes place before validating step, value could be altered here
          return oValue;
        },

        validateValue: function (oValue) {
          // The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
          // It's always better to validate an address by simply sending an e-mail to it.
          var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
          if (!oValue.match(rexMail)) {
            throw new ValidateException(
              "'" + oValue + "' is not a valid e-mail address"
            );
          }
        },
      }),
      _customErrorMessage: function (oError) {
        try {
          var aMessages = JSON.parse(oError.responseText).error.innererror
            .errordetails;
          var aMessageHtml = [];
          var sMessageType = "";
          aMessages.forEach(function (oMessage) {
            if (oMessage.message.includes("violated for association")) {
              sMessageType =
                "No se pudo realizar la acción, registro asociado a otras entidades.";
            }
            aMessageHtml.push("<li>" + oMessage.message + "</li>");
          });

          MessageBox.error(sMessageType ? sMessageType : oError.message, {
            title: "Error",
            details: "" + "<ul>" + aMessageHtml.join(" ") + "</ul>",
            styleClass: sResponsivePaddingClasses,
          });
        } catch (oErr) {
          MessageBox.error(oError.message);
        }
      },

      onValidateCodigo: function (oObject) {
        let aListMasters = this.getView().getModel("MasterListModel").getData();
        let bValidation = false;

        aListMasters.forEach(function (oItem) {
          if (oItem.__metadata) {
            if (oObject.codigo === oItem.codigo) {
              bValidation = true;
              return;
            }
          }
        });

        return bValidation;
      },
      onSearchSystem: function (idAplication) {
        let aListAplication = this.getView()
          .getModel("AplicacionListModel")
          .getData();
        let idSistema = "";

        aListAplication.forEach(function (oItem) {
          if (idAplication === oItem.aplicacionId) {
            idSistema = oItem.oSistema_sistemaId;
          }
        });
        return idSistema;
      },
    });
  }
);
