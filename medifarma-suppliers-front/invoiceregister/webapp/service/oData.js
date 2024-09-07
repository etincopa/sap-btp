sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";
	return {
		consult: function (that, sType, sUrl, aData, aFilters, urlParams) {
			try {
				return new Promise((resolve, reject) => {
					switch (sType) {
					case "read":
						if (urlParams !== undefined) {
							that.oModel[sType](sUrl, {
								filters: aFilters,
								urlParameters: urlParams,
								success: function (result) {
									resolve(result);
								},
								error: function (error) {
									reject(error);
								}
							});
						} else if (aFilters !== undefined && aFilters.length > 0) {
							that.oModel[sType](sUrl, {
								filters: aFilters,
								success: function (result) {
									resolve(result);
								},
								error: function (error) {
									reject(error);
								}
							});
						} else {
							that.oModel[sType](sUrl, {
								success: function (result) {
									resolve(result);
								},
								error: function (error) {
									reject(error);
								}
							});
						}
						break;
					case "remove":
						that.oModel[sType](sUrl, {
							success: function (result) {
								resolve(result);
							},
							error: function (error) {
								reject(error);
							}
						});
						break;
					default:
						that.oModel[sType](sUrl, aData, {
							success: function (result, response) {
								resolve(result, response);
							},
							error: function (error) {
								reject(error);
							}
						});
					}
				});
			} catch (err) {
				console.log(err);
			}

		}
	};
});