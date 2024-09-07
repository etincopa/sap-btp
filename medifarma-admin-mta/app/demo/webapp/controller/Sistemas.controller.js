sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/ui/model/json/JSONModel",
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
    BaseController,
    formatter,
    oDataService
  ) {
    "use strict";
    var oBusyDialog = new sap.m.BusyDialog();
    var gsUsuarioLogin = "";
    return BaseController.extend("administrador.controller.Sistemas", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf administrador.view.Sistemas
       */
      formatter: formatter,
      onInit: function () {
        this.getView().setModel(
          new sap.ui.model.json.JSONModel([]),
          "SistemListModel"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            queryText: "",
            isNew: false,
          }),
          "CriteriaModel"
        );
      },
      onAfterRendering: function () {
        var that = this;
        that._getSistema(null);
        gsUsuarioLogin = sap.ushell.Container.getService("UserInfo")
          .getUser()
          .getEmail();
      },
      _addConstantFilter: function (queryText) {
        var aFilters = [];
        if (queryText) {
          aFilters.push(
            new Filter(
              [
                new Filter("codigo", FilterOperator.Contains, queryText),
                new Filter("nombre", FilterOperator.Contains, queryText),
                new Filter("descripcion", FilterOperator.Contains, queryText),
              ],
              false
            )
          );
        } else {
          aFilters = null;
        }
        return aFilters;
      },
      _getSistema: function (aFilter) {
        var that = this;
        oDataService
          .oDataRead(this.getView().getModel(), "Sistema", null, aFilter)
          .then(
            function (result) {
              that
                .getView()
                .getModel("SistemListModel")
                .setData(result.results);
              that
                .getView()
                .byId("tbSystemList")
                .setVisibleRowCount(result.results.length);
              oBusyDialog.close();
            }.bind(this),
            function (error) {
              oBusyDialog.close();
            }
          );
      },
      onSearch: function (oEvent) {
        var queryText = oEvent.getParameter("query");

        var aFilters = this._addConstantFilter(queryText);
        this._getSistema(aFilters);
      },
      onNewRegister: function () {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        if (!oCriteria.isEdit) {
          this.getView().getModel("CriteriaModel").setProperty("/isNew", true);
          this.getView().getModel("CriteriaModel").setProperty("/isEdit", true);
          var that = this;

          var oSistemListModel = that
            .getView()
            .getModel("SistemListModel")
            .getData();
          oSistemListModel.unshift({
            codigo: "",
            nombre: "",
            descripcion: "",
            edit: true,
            del: false,
          });
          that.getView().getModel("SistemListModel").refresh();

          oBusyDialog.close();
        }
      },
      onCancel: function () {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        this.getView().getModel("CriteriaModel").setProperty("/isEdit", false);
        this.getView().getModel("CriteriaModel").setProperty("/isNew", false);
        var aFilters = this._addConstantFilter(oCriteria.queryText);
        this._getSistema(aFilters);
      },
      onEdit: function (oEvent) {
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        var oContext = oEvent.getSource().getBindingContext("SistemListModel");
        var oObject = oContext.getObject();
        var oPath = oContext.getPath();
        var index = parseInt(oPath.substring(oPath.lastIndexOf("/") + 1), 10);

        if (!oCriteria.isEdit) {
          this.getView().getModel("CriteriaModel").setProperty("/isEdit", true);
          var oSistemListModel = this.getView()
            .getModel("SistemListModel")
            .getData();
          var oItemSelected = oSistemListModel[index];
          oItemSelected.edit = true;
          oItemSelected.del = false;
          this.getView().getModel("SistemListModel").refresh();
        }
      },
      onSave: function (oEvent) {
        var that = this;
        var UserInfoModel = sap.ui
          .getCore()
          .getModel("UserInfoModel")
          .getData();
        var oContext = oEvent.getSource().getBindingContext("SistemListModel");
        var oObject = oContext.getObject();
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

        var oEntityData = {
          codigo: oObject.codigo,
          nombre: oObject.nombre,
          descripcion: oObject.descripcion,
          activo: true,
        };

        if (!oCriteria.isNew) {
          oEntityData.sistemaId = oObject.sistemaId;
          oEntityData.usuarioActualiza = gsUsuarioLogin;
          oEntityData.fechaActualiza = new Date();
        } else {
          oEntityData.usuarioRegistro = gsUsuarioLogin;
          oEntityData.fechaRegistro = new Date();
        }

        MessageBox.confirm(this.getI18nText("msgConfirmAdd"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              if (oCriteria.isNew) {
                oDataService.oDataCreate(oModel, "Sistema", oEntityData).then(
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
                    var aFilters = that._addConstantFilter(oCriteria.queryText);
                    that._getSistema(aFilters);
                    MessageBox.success(that.getI18nText("msgCreado"));
                  }.bind(this),
                  function (error) {
                    oBusyDialog.close();
                  }
                );
              } else {
                var sKeyEntity = oModel.createKey("/Sistema", {
                  sistemaId: oEntityData.sistemaId,
                });
                oDataService.oDataUpdate(oModel, sKeyEntity, oEntityData).then(
                  function (result) {
                    oBusyDialog.close();
                    that
                      .getView()
                      .getModel("CriteriaModel")
                      .setProperty("/isEdit", false);
                    var aFilters = that._addConstantFilter(oCriteria.queryText);
                    that._getSistema(aFilters);
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
      },
      onDelete: function (oEvent) {
        var that = this;
        var oContext = oEvent.getSource().getBindingContext("SistemListModel");
        var oObject = oContext.getObject();
        var id = oObject.sistemaId;
        var oCriteria = this.getView().getModel("CriteriaModel").getData();
        MessageBox.confirm(this.getI18nText("msgConfirmEliminar"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: async function (sAction) {
            if (MessageBox.Action.YES == sAction) {
              var oModel = that.getView().getModel();
              var sKeyEntity = oModel.createKey("/Sistema", {
                sistemaId: id,
              });
              oDataService.oDataRemove(oModel, sKeyEntity).then(
                function (result) {
                  oBusyDialog.close();
                  that
                    .getView()
                    .getModel("CriteriaModel")
                    .setProperty("/isEdit", false);
                  var aFilters = that._addConstantFilter(oCriteria.queryText);
                  that._getSistema(aFilters);
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
    });
  }
);
