sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
	"use strict";

	return {
        
        getDataProductAjax: function (sEntity) {
            //aFilters = aFilters.map(d => d.sPath + " " + d.sOperator.toLowerCase() + " '" + d.oValue1 + "'");          
            //var sFilters = aFilters.join(" and ");
            
            return new Promise(function (resolve, reject) {
                var uri = "/saperp/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV" + sEntity; //+ "?$filter=" + sFilters;
                $.ajax({
                    type: "GET",
                    url: uri,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (result) {
                        resolve(result.d.results);
                    },
                    error: function (errMsg) {
                        reject(errMsg.responseJSON);
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
        getReadDataFilter: function (oModel, entity, sKey, sExpand, callback) {
            var str = entity + "('" + sKey + "')";

            oModel.read(str, {
                async: false,
                urlParameters: {
                    "$expand": sExpand
                },
                success: function (oResponse) {
                    callback(oResponse);
                }
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
        getDataExpandSkip: function (oModel, entity, sExpand, aFilter, skip) {
            return new Promise(function (resolve, reject) {
                oModel.read(entity,{
                    async: false,
                    filters: aFilter,
                    urlParameters: {
						"$expand": sExpand,
                        "$skiptoken": skip?skip:0
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
        getDataAll: function (oModel, entity) {
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
        }
	};
});