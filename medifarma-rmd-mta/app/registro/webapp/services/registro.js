sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, DataService, Filter, FilterOperator) {
	"use strict";

	return {
        
        getDataAjax: function (sEntity, aFilters) {
            aFilters = aFilters.map(d => d.sPath + " " + d.sOperator.toLowerCase() + " '" + d.oValue1 + "'");          
            var sFilters = aFilters.join(" and ");
            
            return new Promise(function (resolve, reject) {
                var uri = "/saperp/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV" + sEntity + "?$filter=" + sFilters;
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

        createData: function (oModel, entity, obj) {
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

        createMultipleUsersFunction: function (oModel, aData) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/createUsuarioMasivoRmd", {
                    method: "GET",
                    urlParameters: {
                        spData: JSON.stringify(aData)
                    },
					success: function (oResponse) {
						resolve(JSON.parse(oResponse.createUsuarioMasivoRmd));},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },

        updateUserMrd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdUsuarioId+ "')";

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
        
        updateStatusRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdId+ "')";

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
        
        updateEsPasosRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraPasoId + "')";

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

        updateEsEspecificacionRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraEspecificacionId + "')";

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
        
        updateEsEquipoRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraEquipoId + "')";

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

        updateEsUtensilioRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraUtensilioId + "')";

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

        updateEsInsumoRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraRecetaInsumoId + "')";

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
/*
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
        },*/
        createEsPasoUsuarioRmdFunction: function (oModel, oData) {
            return new Promise(function (resolve, reject) {
				let sDescriptionPaso = null;
				if (oData.sDescriptionPaso) {
					sDescriptionPaso = JSON.stringify(oData.sDescriptionPaso);
				}
				oModel.callFunction("/actualizarRmdEsPasoUsuario", {
                    method: "GET",
                    urlParameters: {
                        rmdEstructuraPasoId: JSON.stringify(oData.rmdEstructuraPasoId),
                        sDescriptionPaso: sDescriptionPaso,
                        aUsuarios: JSON.stringify(oData.aUsuarios),
						sMotivoModif: oData.sMotivoModif ? oData.sMotivoModif : ""
                    },
					success: function (oResponse) {
						resolve(oResponse.actualizarRmdEsPasoUsuario)},
					error: function (oErr) {
						reject(oErr);
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
								let aListPasoSkipData = await oThat.onGetDataGeneralFiltersExpandSkip(Owner, entity, aFilter, sExpand, skip);
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
        updateEsPasoInsumoRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                var str = entity + "('" + oEntry.rmdEstructuraPasoInsumoPasoId + "')";

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
		updateEsEtiquetaRmd: function (oModel, entity, oEntry) {
			return new Promise(function (resolve, reject) {
                // var str = entity + "('" + oEntry.rmdEsEtiquetaId + "')";
				var str = entity + "('" + oEntry.pasoId + "')";
				
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
		getDataAjaxFilter: function (sFilter) {
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
		getDataAjaxImpresionFilter: function (sFilter) {
            return new Promise(function (resolve, reject) {
                var uri = "/saperp/sap/opu/odata/sap/Z_PP_IMPRESIONORD_SRV/OrdenSet?$filter=Aufnr eq '" + sFilter + "'";
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
						if (error.responseText.includes("No se encontró información con los parámetros ingresados.")) {
							let obj = {
								results: []
							}
							resolve(obj);
						} else {
							reject(error);
						}
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

		onGetFunction: function (Owner, sFunction, oData) {
			return new Promise(function (resolve, reject) {
				Owner.callFunction("/" + sFunction, {
                    method: "GET",
                    urlParameters: {
						oData: oData
					},
					success: function (oResponse) {
						resolve(oResponse);},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
		},
		onGetClaveCryptoRmdFunction: function (oModel, clave, input) {
            return new Promise(function (resolve, reject) {
				oModel.callFunction("/crypto", {
                    method: "GET",
                    urlParameters: {
                        clave: clave,
						input: input,
                    },
					success: function (oResponse) {
						resolve(oResponse);},
					error: function (oErr) {
						reject(oErr);
					}
				});
			});
        },
		postDataAjax: function (sEntity, oData) {
            return new Promise(function (resolve, reject) {
                var uri = "/saperp/sap/opu/odata/sap/Z_PP_NECESIDADESRMD_SRV" + sEntity;
                $.ajax({
                    type: "POST",
                    url: uri,
					crossDomain: true,
					dataType: "json",
					data: JSON.stringify(oData),
                    success: function (result) {
                        resolve(result.d.results);
                    },
                    error: function (errMsg) {
                        reject(errMsg.responseJSON);
                    }
                });
            });
        },
		getLoggedUser: function () {
			return new Promise(function (resolve, reject) {
			  let sUrl = "/getUserInfo";
			  let oModel = new JSONModel();
			  oModel.loadData(sUrl, null, true, "GET", false, true);
	  
			  oModel.attachRequestCompleted((oRequest) => {
				let oData = {};
				if (oRequest.getParameter("success")) {
				  oData = oModel.getData();
				} else {
				  oData.name = "DEFAULT_USER";
				}
				resolve(oData);
			  });
	  
			  oModel.attachRequestFailed(() => {
				reject("error");
			  });
			});
		},
		
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

		onDeleteDataGeneral: function (Owner, entity, id) {
            return new Promise(function (resolve, reject) {
                var str = entity + "('" + id + "')";
                Owner.remove("/" + str, {
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
        },

		onGetDataGeneralParameters: function (Owner, entity, sParameter) {
			return new Promise(function (resolve, reject) {
				Owner.read("/" + entity, {
                    async: false,
                    urlParameters: {
                        Orden: sParameter
					},
					success: function (result) {
						resolve(result.fnGetEtiquetasDespacho.data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
        },
	};
});