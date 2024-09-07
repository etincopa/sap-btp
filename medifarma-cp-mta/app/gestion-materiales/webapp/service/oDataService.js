sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  return {
    oDataRead: function (oModel, sEntity, oUrlParameters, aFilter) {
      /*
            oUrlParameters = {
                "$expand": "oUsuario"
            }
            */
      return new Promise(function (resolve, reject) {
        oModel.read("/" + sEntity, {
          async: false,
          filters: aFilter == null ? [] : aFilter,
          urlParameters: oUrlParameters == null ? {} : oUrlParameters,
          success: function (oData) {
            resolve(oData);
          },
          error: function (oError) {
            reject(oError);
          },
        });
      });
    },
    oDataCreate: function (oModel, sEntity, oData) {
      return new Promise(function (resolve, reject) {
        oModel.create("/" + sEntity, oData, {
          async: false,
          success: function (data, header, request) {
            resolve(header);
          },
          error: function (error) {
            reject(error);
          },
        });
      });
    },
    oDataUpdate: function (oModel, sEntity, oData) {
      //oKey = {BPRequestID: ""}
      return new Promise(function (resolve, reject) {
        oModel.update(sEntity, oData, {
          async: false,
          success: function (data, header, request) {
            resolve(header);
          },
          error: function (error) {
            reject(error);
          },
        });
      });
    },
    oDataRemove: function (oModel, sEntity) {
      return new Promise(function (resolve, reject) {
        oModel.remove(sEntity, {
          async: false,
          success: function (oData) {
            resolve(oData);
          },
          error: function (oError) {
            reject(oError);
          },
        });
      });
    },
    oDataDmlMasive: function (oModel, aEntityData) {
      var sBatchDeferredGroup = "batchUpdate";
      var mParameters = {
        groupId: sBatchDeferredGroup,
      };
      oModel.setDeferredGroups([sBatchDeferredGroup]);

      /*
                dml: (Data Manipulation Language)
                    C : Create
                    U : Update
                    D : Delete
            */
      if (!aEntityData.length) {
        var aTemp = [];
        if (aEntityData.dml) {
          aTemp.push(aEntityData);
          aEntityData = aTemp;
        }
      }

      for (var i = 0; i < aEntityData.length; i++) {
        var dml = aEntityData[i].dml;
        var sEntity = aEntityData[i].entity;
        var sKeyEntity = aEntityData[i].keyEntity;
        delete aEntityData[i]["dml"];
        delete aEntityData[i]["entity"];
        delete aEntityData[i]["keyEntity"];

        var oEntityData = aEntityData[i];

        if (dml == "C") oModel.create(sEntity, oEntityData, mParameters);
        if (dml == "U") oModel.update(sKeyEntity, oEntityData, mParameters);
        if (dml == "D") oModel.remove(sKeyEntity, mParameters);
      }

      return new Promise(function (resolve, reject) {
        oModel.submitChanges({
          groupId: sBatchDeferredGroup,
          success: function (oData, sResponse) {
            resolve(sResponse);
          },
          error: function (oError) {
            reject(oError);
          },
        });
      });
    },
    onRefreshToken: function (oModel) {
      return new Promise(function (resolve, reject) {
        oModel.refreshSecurityToken(
          function (data, header, request) {
            resolve(header);
          },
          function (error) {
            reject(error);
          }
        );
      });
    },
  };
});
