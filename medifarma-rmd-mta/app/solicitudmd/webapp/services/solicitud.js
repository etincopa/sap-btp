sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, DataService, Filter, FilterOperator) {
	"use strict";

	return {

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

        getData: function (oModel, entity, sExpand, sFilter) {
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
                    filters: sFilter,
                    urlParameters: {
						"$expand": sExpand
					},
                    success: async function (oResponse) {	
						let resultFinal = {};
						resultFinal.results = oResponse.results;
						if(oResponse.results.length === 1000){
							while (aListPasosLength === 1000) {
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(oModel, entity, [], "", skip);
								aListPasosLength = aListPasoSkipData.results.length;
								resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
								skip = skip + 1000;
							}
						}
						resolve(resultFinal);
					},
					error: function (oErr) {
						reject(oErr);
					}
                });
            });
        },

        updateSolicitud: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.mdId+ "')";
                if(entity === "/MD_DESTINATARIOS"){
                    oEntry = {
                        activo: false
                    }
                }
				oModel.update(str, oEntry, {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
        },
        
        updateData: function (oModel, entity, oEntry, id) {
            return new Promise(function (resolve, reject) {
                var str = entity + "('" + id+ "')";
				oModel.update(str, oEntry, {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
        },  
        
		crearSolicitud: function (oModel, obj) {
			return new Promise(function (resolve, reject) {
				oModel.create("/MD", obj, {
					success: function (oResponse) {
					    resolve(oResponse);		
					},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },

        getDestinatarios: function (oModel, aFilter, sExpand) {
            return new Promise(function (resolve, reject) {
				oModel.read("/ROLAPPWF",{
                    async: false,
                    filters: aFilter,
                    urlParameters: {
						"$expand": sExpand
					},
                    success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oErr) {
						reject(oErr);
					}
                });
			});
        },

        addDestinatario: function (oModel, obj) {
			return new Promise(function (resolve, reject) {
				oModel.create("/MD_DESTINATARIOS", obj, {
					success: function (oResponse) {
					    resolve(oResponse);		
					},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },

        onCreate : function (oModel, entity, obj) {
            return new Promise(function (resolve, reject) {
				oModel.create(entity, obj, {
					success: function (oResponse) {
					    resolve(oResponse);		
					},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },
        getDataExpand: function (oModel, entity, sExpand, sFilter) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
                    filters: sFilter,
                    urlParameters: {
						"$expand": sExpand
					},
                    success: function (oResponse) {	
						resolve(oResponse);
					},
					error: function (oErr) {
						reject(oErr);
					}
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
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, entity, aFilter, "", skip);
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
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, entity, [], sExpand, skip);
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
	};
});