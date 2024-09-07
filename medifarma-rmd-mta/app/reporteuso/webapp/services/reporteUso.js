sap.ui.define([
	
], function () {
	"use strict";

	return {

        getData: function (oModel, entity, sExpand, aFilter) {
			let oThat = this;
			let skip = 1000;
			let aListPasosLength = 1000;
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
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
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(oModel, entity, aFilter, sExpand, skip);
								aListPasosLength = aListPasoSkipData.results.length;
								resultFinal.results = resultFinal.results.concat(aListPasoSkipData.results);
								skip = skip + 1000;
							}
						}
						resolve(resultFinal);
						// resolve(oResponse);
					},
					error: function (oErr) {
						reject(oErr);
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
        createData : function (oModel, entity, obj) {
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
        getDataExpand: function (oModel, entity, sExpand, aFilter) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
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
        getDataFilter: function (oModel, entity, aFilter) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
                    filters: aFilter,
                    success: function (oResponse) {	
						resolve(oResponse);
					},
					error: function (oErr) {
						reject(oErr);
					}
                });
            });
        },

		getDataAloneExpand: function (oModel, entity, sExpand) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
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
		getDataEntity: function (oModel, entity) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
                    success: function (oResponse) {	
						resolve(oResponse);
					},
					error: function (oErr) {
						reject(oErr);
					}
                });
            });
        },
	};
});