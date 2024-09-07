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

		onGetDataCountryAsociation: function (Owner, entidad, parametro, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					CountryID: parametro
				});
				Owner.read("/" + sPath + "/" + asociacion, {
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

		onGetDataAccountAsociation: function (Owner, entidad, parametro, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					DocumentNumber: parametro
				});
				Owner.read("/" + sPath , {
					async: false,
					urlParameters: {
						"$expand": asociacion
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

		onGetDataIndicatorTaxes: function (Owner, entidad, parametro1, parametro2, asociacion) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					CountryID: parametro1,
					WithholdingTaxTypeID: parametro2
				});
				Owner.read("/" + sPath + "/" + asociacion, {
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

		onSaveRequestChangeBP: function (Owner, oData) {
			return new Promise(function (resolve, reject) {
				Owner.create("/BPRequestChangeSet", oData, {
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

		onGetRequestBP: function (Owner, entidad, parametro) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					BPRequestChangeID: parametro
				});
				Owner.read("/" + sPath, {
					async: false,
					urlParameters: {
						"$expand": "Banks,ContactPersons"
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

		onApproveRequestBP: function (Owner, oData, entidad, BPRequestID) {
			return new Promise(function (resolve, reject) {
				var sPath = Owner.createKey(entidad, {
					BPRequestChangeID: BPRequestID
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
		consult: function (Owner, sType, sUrl, aData, aFilters, urlParams) {
			try {
				return new Promise((resolve, reject) => {
					switch (sType) {
					case "read":
						if (urlParams !== undefined) {
							Owner[sType](sUrl, {
								filters: aFilters,
								urlParameters: urlParams,
								success: function (result) {
									resolve(result);
								},
								error: function (error) {
									reject(error);
								}
							});
						} else if (aFilters.length > 0) {
							Owner[sType](sUrl, {
								filters: aFilters,
								success: function (result) {
									resolve(result);
								},
								error: function (error) {
									reject(error);
								}
							});
						} else {
							Owner[sType](sUrl, {
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
						Owner[sType](sUrl, {
							success: function (result) {
								resolve(result);
							},
							error: function (error) {
								reject(error);
							}
						});
						break;
					default:
						Owner[sType](sUrl, aData, {
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

		},
		onGetDataAccountMockup: function (Owner, entidad, parametro, asociacion) {
			
			var oModel = new JSONModel({
				BPRequestID: "11111",
				BPGrouping: "",
				DocumentType: "1",
				DocumentNumber: "1111111",
				PersonType: 0,
				Name: "Company Test",
				Name2: "",
				Street: "Av",
				StreetNumber: "56",
				District: "",
				City: "LI",
				Country: "PE",
				Region: "LI",
				Ubigee: "",
				PostalCode: "",
				TaxLocation: "",
				Street2: "",
				Industry: "",
				SearchName: "",
				Commentary: "Prueba",
				Language: "ES"
			});
			return oModel;
		}
	};
});