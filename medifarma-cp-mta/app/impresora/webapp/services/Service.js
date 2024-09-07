sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {

        onGetDataGeneral: function (Owner, entity) {
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
					success: async function (result) {
						let resultFinal = {};
						if (result.results) {
							resultFinal.results = result.results;
							if(result.results.length === 1000){
								while (aListPasosLength === 1000) {
									let aListPasoSkipData = await oThat.onGetDataGeneralSkip(Owner, "PASO", skip);
									aListPasosLength = aListPasoSkipData.results.length;
									resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
									skip = skip + 1000;
								}
							}
						} else {
							resultFinal = result;
						}
						resolve(resultFinal);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

		onGetDataGeneralSkip: function (Owner, entity, skip) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
					urlParameters: {
                        "$skiptoken": skip?skip:0
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
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    filters: aFilter,
					success: async function (result) {
						let resultFinal = {};
						resultFinal.results = result.results;
						if(result.results.length === 1000){
							while (aListPasosLength === 1000) {
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, "PASO", aFilter, "", skip);
								aListPasosLength = aListPasoSkipData.results.length;
								resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
								skip = skip + 1000;
							}
						}
						resolve(resultFinal);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },
        
        onGetDataGeneralExpand: function (Owner, entity, sExpand) {
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
					urlParameters: {
						"$expand": sExpand
					},
					success: async function (result) {
						let resultFinal = {};
						resultFinal.results = result.results;
						if(result.results.length === 1000){
							while (aListPasosLength === 1000) {
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, "PASO", [], sExpand, skip);
								aListPasosLength = aListPasoSkipData.results.length;
								resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
								skip = skip + 1000;
							}
						}
						resolve(resultFinal);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

        onGetDataGeneralFiltersExpand: function (Owner, entity, aFilter, sExpand) {
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    filters: aFilter,
                    urlParameters: {
						"$expand": sExpand
					},
					success: async function (result) {
						let resultFinal = {};
						resultFinal.results = result.results;
						if(result.results.length === 1000){
							while (aListPasosLength === 1000) {
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, "PASO", aFilter, sExpand, skip);
								aListPasosLength = aListPasoSkipData.results.length;
								resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
								skip = skip + 1000;
							}
						}
						resolve(resultFinal);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },

		onGetDataGeneralFiltersExpandSkip: function (Owner, entity, aFilter, sExpand, skip) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    filters: aFilter,
                    urlParameters: {
						"$expand": sExpand,
                        "$skiptoken": skip?skip:0
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

        onSaveDataGeneral: function (Owner, entity, oData) {
			return new Promise(function (resolve, reject) {
				Owner.create("/" + entity, oData, {
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

		onSaveDataFunctionCorrelativo : function (Owner, entity, sData) {
			return new Promise(function (resolve, reject) {
				Owner.callFunction("/" + entity, {
                    method: "GET",
                    urlParameters: {
                        sTipo: sData
                    },
					async: false,
					success: function (data, header, request) {
						resolve(data.obtenerCodigoCorrelativo);
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
        }
	};
});