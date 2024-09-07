sap.ui.define([
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter'
], function (JSONModel, Filter) {
	"use strict";
	return {
		onGetProveedorbyRuc: function (Owner, RUC, Application) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var sPath = modelComponent.createKey("/SupplierSet", {
					Ruc: RUC,
					Application: Application
				});
				modelComponent.read(sPath, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onGetSociedad: function (Owner, Bukrs) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				// var sPath = modelComponent.createKey("/CompanySet", {
				// 	Bukrs: Bukrs
				// });
				modelComponent.read("/CompanySet", {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onGetEstatus: function (Owner) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				modelComponent.read("/StatusSet", {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		getLicitacion: function (Owner, afilter) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				modelComponent.read("/TenderSet", {
					filters: afilter,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		getCabeceraDetail: function (Owner, ebeln, bukrs, lifnr) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var sPath = modelComponent.createKey("/RFQHeaderSet", {
					PetOferta: ebeln,
					Bukrs: bukrs,
					Lifnr: lifnr
				});
				modelComponent.read(sPath, {
					urlParameters: {
						"$expand": 'Details,Attachments'
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
		getCurrency: function (Owner, sQuotationNr, sLifnr) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var aFilters = [];
				aFilters.push(new Filter("QuotationNr", "EQ", sQuotationNr));
				aFilters.push(new Filter("Lifnr", "EQ", sLifnr));
				modelComponent.read("/RFQCurrencySet", {
					filters: aFilters,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		getPaymentCondition: function (Owner, sQuotationNr, sLifnr) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var aFilters = [];
				aFilters.push(new Filter("QuotationNr", "EQ", sQuotationNr));
				aFilters.push(new Filter("Lifnr", "EQ", sLifnr));
				modelComponent.read("/RFQPaymentConditionSet", {
					filters: aFilters,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		getPeticionOferta: function (Owner, afilter) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				modelComponent.read("/RFQSet", {
					filters: afilter,
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		getFile: function (Owner, LoioId) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var sPath = modelComponent.createKey("/RFQNewFileSet", {
					IDocumentId: LoioId
				});
				modelComponent.read(sPath + "/$value", {
					success: function (result, response) {
						resolve(result);
						var file = response.requestUri;
						window.open(file);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		deleteFile: function (Owner, LoioId) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				var sPath = modelComponent.createKey("/RFQFileSet", {
					IDocumentId: LoioId
				});
				modelComponent.remove(sPath, {
					method: "DELETE",
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		updateCotizacion: function (Owner, Cotizacion) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				modelComponent.create("/RFQHeaderSet", Cotizacion, {
					success: function (result) {
						resolve(result);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onUpload: function (Owner, jsonData) {
			return new Promise(function (resolve, reject) {
				var modelComponent = Owner.getModel("SUPPLIERS_SRV");
				modelComponent.create("/UploadSet", jsonData, {
					success: function (result) {
						resolve();
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		onRead: function (oModel, sEntity, oParameters) {
			return new Promise(function (resolve, reject) {
				oModel.read(sEntity, {
					urlParameters: oParameters,
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},
		onRemove: function (oModel, sEntity, oParameters) {
			return new Promise(function (resolve, reject) {
				oModel.remove(sEntity, {
					urlParameters: oParameters,
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		}
	};
});