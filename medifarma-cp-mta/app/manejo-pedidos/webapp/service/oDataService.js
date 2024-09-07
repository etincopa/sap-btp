sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  return {
    oDataRead: function (oModel, sEntity, oUrlParameters, aFilter) {
      /*
            oUrlParameters = {
                "$expand": "oUsuario"
            }
            */
      let oThat = this;
      let skip = 1000;
      let aListPasosLength = 1000;
      return new Promise(function (resolve, reject) {
        oModel.read("/" + sEntity, {
          async: false,
          filters: aFilter == null ? [] : aFilter,
          urlParameters: oUrlParameters == null ? {} : oUrlParameters,
          success: async function (oData) {
						let resultFinal = {};
						if (oData.results) {
							resultFinal.results = oData.results;
							if(oData.results.length === 1000){
								while (aListPasosLength === 1000) {
									let aListPasoSkipData = await oThat.oDataReadSkip(oModel, sEntity, skip, oUrlParameters,aFilter);
									aListPasosLength = aListPasoSkipData.results.length;
									resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
									skip = skip + 1000;
								}
							}
						} else {
							resultFinal = oData;
						}
						resolve(resultFinal);
          },
          error: function (oError) {
            reject(oError);
          },
        });
      });
    },
    oDataReadSkip: function (Owner, entity, skip, oUrlParameters,aFilter) {
      oUrlParameters ? oUrlParameters.$skiptoken = skip?skip:0: null;
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
          async: false,
          filters: aFilter == null ? [] : aFilter,
          urlParameters: oUrlParameters == null ? {"$skiptoken": skip?skip:0} : oUrlParameters,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
    },
    oDataReadExpand: function (oModel, sEntity, oExpand) {
      return new Promise(function (resolve, reject) {
        oModel.read("/" + sEntity, {
          async: false,
          urlParameters: {
            $expand: oExpand,
          },
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

    oDataDml: function (oModel, oEntityData) {
      /*
                dml: (Data Manipulation Language)
                    C : Create
                    U : Update
                    D : Delete
            */
      if (!oEntityData) {
        return false;
      }

      var dml = oEntityData.dml;
      var sEntity = oEntityData.entity;
      var sKeyEntity = oEntityData.keyEntity;
      delete oEntityData["dml"];
      delete oEntityData["entity"];
      delete oEntityData["keyEntity"];

      if (dml.toUpperCase() == "C") {
        return this.oDataCreate(oModel, sEntity, oEntityData);
      }
      if (dml.toUpperCase() == "U") {
        return this.oDataUpdate(oModel, sKeyEntity, oEntityData);
      }
      if (dml.toUpperCase() == "D") {
        return this.oDataRemove(oModel, sKeyEntity);
      }
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
