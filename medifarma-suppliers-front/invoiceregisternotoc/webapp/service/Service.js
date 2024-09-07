sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		onGetDataGeneral: function (Owner, entity) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onGetDataCountryAsociation: function (Owner, entidad, parametro, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					CountryID: parametro
				});
				Owner.read("/" + sPath + "/" + asociacion, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onGetDataAccountAsociation: function (Owner, entidad, parametro, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					CompanyID: parametro
				});
				Owner.read("/" + sPath + "/" + asociacion, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onGetDataIndicatorTaxes: function (Owner, entidad, parametro1, parametro2, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					CountryID: parametro1,
					WithholdingTaxTypeID: parametro2
				});
				Owner.read("/" + sPath + "/" + asociacion, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onSaveRequestBP: function (Owner, entidad, oData) {
			return new Promise(function (resolve, reject) {
				Owner.create("/" + entidad, oData, {
					success: function (data, header, request) {
						resolve(header);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onGetRequestInvoice: function (Owner, entidad, parametro) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					PRNotPurchaseOrderID: parametro
				});
				Owner.read("/" + sPath, {
					urlParameters: {
						"$expand": "History"
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

		onApproveRequestInvoice: function (Owner, oData, entidad, PRNotPurchaseOrderID) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					PRNotPurchaseOrderID: PRNotPurchaseOrderID
				});
				Owner.update("/" + sPath, oData, {
					success: function (data, header, request) {
						resolve(header);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		onRefreshToken: function (Owner) {
			return new Promise(function (resolve, reject) {
				Owner.refreshSecurityToken(function (data, header, request) {
					resolve(header);
				}, function (error) {
					reject(error);
				});
			});
		},

		onGetDataGeneralFilters: function (Owner, entity, aFilter) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
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

		consult: function (Owner, sUrl) {
			return new Promise((resolve, reject) => {
				Owner.read(sUrl, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onApproveRequestBP: function (Owner, oData, entidad, BPRequestID) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					BPRequestID: BPRequestID
				});
				Owner.update("/" + sPath, oData, {
					async: false,
					success: function (data, header, request) {
						resolve(header);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onGetRequestEntity: function (Owner, entidad, parametro) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, parametro);
				Owner.read("/" + sPath+ "/zaprobadoresmultout", {
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