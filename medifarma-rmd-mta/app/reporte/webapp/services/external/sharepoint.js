sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, DataService, Filter, FilterOperator) {
	"use strict";

	return {

        sharepointFunction: function (oModel, oData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/sharepointFunction", {
                    method: "GET",
                    urlParameters: {
                        spData: JSON.stringify(oData)
                    },
					success: function (oResponse) {
						resolve(oResponse);},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },

        sharepointGet: function (oModel, oData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/sharepointGet", {
                    method: "GET",
                    urlParameters: {
                        idMd: oData.mdId
                    },
					success: function (oResponse) {
                        oResponse = JSON.parse(oResponse)
                        resolve(oResponse.d.results); 
					},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },

        sharePointDownload: function (oModel, oData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/sharepointDownload", {
                    method: "GET",
                    urlParameters: {
                        data: JSON.stringify(oData)
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

        sharepointDelete: function (oModel, oData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/sharepointDelete", {
                    method: "GET",
                    urlParameters: {
                        data: JSON.stringify(oData)
                    },
					success: function (oResponse) {
                        oResponse = JSON.parse(oResponse)
                        resolve(oResponse); 
					},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        }

	};
});