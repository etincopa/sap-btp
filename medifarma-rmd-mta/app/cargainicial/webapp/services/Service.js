sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {

        onGetDataGeneral: function (Owner, entity) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },
        onUpdateData: function(Owner, sPath, oBody) {
            return new Promise((resolve, reject) => {
                Owner.update("/" + sPath, oBody, {
                    success: (result) => {
                        resolve(result);
                    },
                    error: (error) => {
                        reject(error);
                    },
                });
            });
		},
        
        onGetDataGeneralFilters: function (Owner, entity, aFilter) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    filters: aFilter,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },
        
        onGetDataGeneralExpand: function (Owner, entity, sExpand) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
					urlParameters: {
						"$expand": sExpand
					},
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

        onGetDataGeneralFiltersExpand: function (Owner, entity, aFilter, sExpand) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    filters: aFilter,
                    urlParameters: {
						"$expand": sExpand
					},
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

        onSaveDataGeneral: function (Owner, entity, oData,datarandom) {
			// let aDeferredGroup = Owner.getDeferredGroups().push("batchCreate");
			// Owner.setDeferredGroups(aDeferredGroup);

			return new Promise(function (resolve, reject) {
				Owner.create("/" + entity, oData, {
					groupId:datarandom,
					success: function (data, header, request) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});


			});
        },
        
        onSaveDataFunction: function (Owner, entity, oData) {
			return new Promise(function (resolve, reject) {
                let oDataJson = JSON.stringify(oData);
				Owner.callFunction("/" + entity, oData, {
                    method: "POST",
                    // urlParameters: {
                    //     mdEstructura: oDataJson
                    // },
					async: false,
					success: function (data, header, request) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },
        
        onSaveDataFunction2: function (Owner, entity, oData) {
			return new Promise(function (resolve, reject) {
                let oDataJson = JSON.stringify(oData);
				Owner.callFunction("/" + entity, {
                    method: "POST",
                    urlParameters: {
                        mdEstructura: oDataJson
                    },
					async: false,
					success: function (data, header, request) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onUpdateDataGeneral: function (Owner, entity, oEntry, id) {
            return new Promise(function (resolve, reject) {
                var str = entity + "('" + id + "')";
                Owner.update("/" + str, oEntry, {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
        },

        onGetDataGeneralParametersExpand: function (Owner, entity, sParameter, sExpand) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    urlParameters: {
                        mdId: sParameter,
						"$expand": sExpand
					},
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

        getDataAjax: function (sFilter) {
            return new Promise(function (resolve, reject) {
                var uri = "/saperp/sap/opu/odata/sap/Z_PP_PRODUCCION_SRV/ProduccionSet?$filter=Werks eq '" + sFilter + "'";
                $.ajax({
                    type: "GET",
                    url: uri,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (result) {
                        resolve(result.d.results);
                    },
                    error: function (errMsg) {
                        reject(errMsg);
                    }
                });
            });
        },

		createMultiplePasosFunction: function (oModel, aData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/createPasosMasivoRmd", {
                    method: "GET",
                    urlParameters: {
                        spData: JSON.stringify(aData)
                    },
					success: function (oResponse) {
						if(typeof oResponse.createPasosMasivoRmd == "string"){
							resolve(JSON.parse(oResponse.createPasosMasivoRmd));
						}else{
							resolve(oResponse.createPasosMasivoRmd);
						}

						},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },
        
	};
});