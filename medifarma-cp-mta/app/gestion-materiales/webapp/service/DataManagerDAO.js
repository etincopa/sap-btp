/* eslint-disable no-undef */
sap.ui.define(["sap/ui/base/Object"], function (Object) {
  "use strict";
  return Object.extend(
    "com.medifarma.cp.pesajeimpresionbultosaldo.service.DataManagerDAO",
    {
      constructor: function (oContext) {
        if (oContext) this._oContext = oContext;
      },

      _getContext: function () {
        return this._oContext;
      },

      _getView: function () {
        return this._oContext.getView();
      },

      _getModel: function (sIdModel) {
        if (!sIdModel) return this._oContext.getModel();
        else return this._oContext.getModel(sIdModel);
      },

      _getParameters: function (oParameters) {
        return jQuery.extend(
          {
            filters: [],
            success: function () {},
            error: function () {},
          },
          oParameters
        );
      },

      getData: function (sIdModel, oParams, sEntityName) {
        var oParameters = this._getParameters(oParams);
        this._getModel(sIdModel).read(sEntityName, oParameters);
      },

      getDataPromise: function (sIdModel, sEntityName, aFilters) {
        return new Promise(
          function (resolve, reject) {
            this._getModel(sIdModel).read(sEntityName, {
              filters: aFilters,
              success: resolve,
              error: function (oError) {
                reject(oError);
              },
            });
          }.bind(this)
        );
      },

      saveData: function (sIdModel, oData, oParams, oEntity) {
        var oParameters = this._getParameters(oParams);
        if (oEntity.action === "create")
          this._getModel(sIdModel).create(oEntity.sEntity, oData, oParameters);
        else {
          var oAux = {};
          oAux[oEntity.sNameId] = oData[oEntity.sNameId];
          var route = this._getModel(sIdModel).createKey(oEntity.sEntity, oAux);
          this._getModel(sIdModel).update(route, oData, oParameters);
        }
      },

      sendBatch: function (sIdModel, oParams) {
        var oParameters = this._getParameters(oParams);
        this._getModel(sIdModel).submitChanges(oParameters);
      },
    }
  );
});
