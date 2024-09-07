sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/everis/monitorDocumentos/controller/baseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"com/everis/monitorDocumentos/controller/Workflow",
	"sap/ui/core/Fragment",
	"com/everis/monitorDocumentos/controller/DocumentService",
	"sap/ui/core/util/File",
	"sap/m/MessageToast",
	"com/everis/monitorDocumentos/controller/Utils",
	"com/everis/monitorDocumentos/controller/EverisUtils",
    "sap/ui/core/BusyIndicator",
	"../service/Sunat"
], function (Controller, JSONModel, baseController, Filter, FilterOperator, MessageBox, WF, Fragment, DS, File, MessageToast, Utils, EverisUtils, BusyIndicator, Sunat) {
	"use strict";
	
	$.ambiente = "QAS";
    var NNTTDATA;
    var everis;
    console.log(everis);
    console.log(NNTTDATA)

	return Controller.extend("com.everis.monitorDocumentos.controller.crearGastoEntregaRendir", {
		proceso: "",
		regla: "",
		GastoPrimerNivelAprob: "",
		GastoSegundoNivelAprob: "",
		GastoTercerNivelAprob: "",
		tablaFiltro: "",
		campoFiltro: "",
		tablaBuscada: "",
		campoBuscado: "",

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */
		handleRouteMatched: function (oEvent) {
			var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument"); //aquí están todos los datos de la solicitud

			var oThes = this;
		//	var userModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true");
		//	userModel.attachRequestCompleted(function onCompleted(res) {
			//	if (res.getParameter("success")) {
			//		var oUserIas = JSON.parse(this.getJSON());
            var oUserIas =  sap.ui.getCore().getModel("oUserIAS").getData();
				oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + oUserIas.name	 + "')", {
					//oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + "Q08275964" + "')", { //test
						success: function (result) {
							if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
								sap.ui.getCore().setModel(result, "InfoIas");
								var route = sap.ui.getCore().getModel("route");
								if (result.Bukrs === "1000") {
									route.carpetaSociedad = "20100108292";
								} else if (result.Bukrs === "2000") {
									route.carpetaSociedad = "20602670130";
								}
								
								var aTablaDetGasto = [];
								var route = sap.ui.getCore().getModel("route");
								route.subcarpeta02 = "Gastos";
								sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
								oThes.getView().byId("idFechaFactura")._bMobile = true;
								oThes.getView().byId("idFecha")._bMobile = true;
								oThes.getView().byId("idFechaCont")._bMobile = true;

								oThes.getView().byId("idFechaFactura").setValue(Utils.fnFormatearFechaVista(new Date(), false));
								oThes.getView().byId("idFecha").setValue(Utils.fnFormatearFechaVista(new Date(), false));
								oThes.getView().byId("idFechaCont").setValue(Utils.fnFormatearFechaVista(new Date(), false));

								// oThes.getView().byId("idFechaFactura").setMinDate(new Date());
								// oThes.getView().byId("idFechaFactura").setMinDate(dFechaFectura);
								var dFechaFectura = oModelDetailDocument.Bldat;
								var dFechFactTol = dFechaFectura.getMonth() + 1;
								oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ToleranciaSet(Gjahr='" + oModelDetailDocument.Gjahr + "',Monat='" + dFechFactTol + "')", {
									success: function (val) {
										var fechaTolereancia = new Date();
										var tolerancia = parseInt(val.Ztole);
										fechaTolereancia.setDate(fechaTolereancia.getDate() - tolerancia);
										oThes.getView().byId("idFechaFactura").setMinDate(fechaTolereancia);
									},
									error: function (oError) {
										console.log(oError);
									}
								});
								oThes.getView().byId("idFecha").setMinDate(new Date());
								oThes.getView().byId("idFechaCont").setMinDate(new Date());

								if (oModelDetailDocument.ParkedDocument !== "" && oModelDetailDocument.ParkedDocument !== undefined) {
									var modeloSol = {};
									oThes.fnCargarDataComboSunat();
									oThes.getConceptosAdicionales();
									oThes.loadCentroCostoList();
									modeloSol.oFecDoc = oThes.getView().byId("idFecha").getValue();
									modeloSol.oOperacion = oModelDetailDocument.sZcatCompleto.substr(0, 4);
									modeloSol.oSol = oModelDetailDocument.ParkedDocument;
									modeloSol.oTotalSol = oModelDetailDocument.Wrbtr;
									modeloSol.oDes = "Movilidad";
									modeloSol.FechCon = oModelDetailDocument.Budat;
									modeloSol.oWaers = oModelDetailDocument.Waers;
									modeloSol.Kostl = oModelDetailDocument.Kostl;
									modeloSol.oRef = "GASTO." + oModelDetailDocument.ParkedDocument;
							
									///JORDAN SPRINT 3
									modeloSol.Kstrg = oModelDetailDocument.Kstrg
									modeloSol.sZcatCompleto = oModelDetailDocument.sZcatCompleto
									modeloSol.Zcat = oModelDetailDocument.oModelDetailDocument;
									var ObjCo = oModelDetailDocument.Kstrg.split(" - ")[0];
									var oObjCosto;
									if (ObjCo == "F") {
										var AUFNRModelData = sap.ui.getCore().getModel("AUFNRModelFF").getData();
										for (var count = 0; count < AUFNRModelData.length; count++) {
											if (AUFNRModelData[count].Aufnr == oModelDetailDocument.Aufnr) {
												oObjCosto = AUFNRModelData[count].Aufnr + " - " + AUFNRModelData[count].Ktext;
											}
										}
										modeloSol.CeCo = oObjCosto;
									} else if (ObjCo == "K") {
										var KOSTLModelData = sap.ui.getCore().getModel("KOSTLModelFF").getData();
										for (var count = 0; count < KOSTLModelData.length; count++) {
											if (KOSTLModelData[count].Kostl == oModelDetailDocument.Kostl) {
												oObjCosto = KOSTLModelData[count].Kostl + " - " + KOSTLModelData[count].Ktext;
											}
										}
										modeloSol.CeCo = oObjCosto;
									}
									modeloSol.FlagAdicional = oModelDetailDocument.FlagAdicional;
									modeloSol.Eratx = oModelDetailDocument.Eratx;
									var oJson = {
										"ImportGrav": false,
										"ImportNoGrav": false,
										"ImportTotal": false,
										"Importe": false
									}
									oThes.getView().setModel(new JSONModel(oJson), "oModelHelp");
									///

									var oFormGasto = oThes.getView();
									oFormGasto.setModel(new JSONModel(modeloSol));
									oThes.getView().byId("idAdicionales").setSelectedKey(oModelDetailDocument.Eratx);
									oThes.fnChangeTxt();
									//oThes.onMostrarPorCaja();
									//oThes.onLoadInfoFondoFijo();
									var oTable = oThes.getView().byId("idTablaDetGastos");
									var oModel = new JSONModel([]);
									oModel.setSizeLimit(1000);
									oTable.setModel(oModel);
									EverisUtils.backend.initialize(oThes.getOwnerComponent().getModel("UtilsModel"));
									EverisUtils.backend.getParameters("RENDICION_GASTOS", null).then((aParameters) => {
										const aParamsToParse = oThes.getOwnerComponent().getModel("Config").getData().parameters;
										return EverisUtils.backend.parseParameters(aParameters, aParamsToParse);
									})
									.then((paramValues) => {
										sap.ui.getCore().setModel(new JSONModel(paramValues["ENTREGAS_RENDIR"]), "ParametersModel");
										oThes._initSharepoint(paramValues["SHAREPOINT"]);
										oThes._initConstants(paramValues["ENTREGAS_RENDIR"]);
									});
								} else {
									MessageBox.alert("Seleccione una solicitud");
								}
							} else {
								MessageBox.error("No asignado al proceso de aprobación");
							}
						},
						error: function (error) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(error);
						}
					});
			//	} else {
			//		MessageBox.error("Ha ocurrido un error al recuperar la informacion del usuario");
			//	}
			//});
		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crearGastoEntregaRendir").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.onRouteMatched();
		},
		_initSharepoint: function (oValues) {
			EverisUtils.sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
			EverisUtils.sharepoint.setUrl(oValues.URL);
			EverisUtils.sharepoint.setGetTokenFn(() => {
			  return EverisUtils.backend.getSharepointToken("RENDICION_GASTOS");
			});
		},
		_initConstants: function (oParams) {
			this.proceso = oParams.PROCESO,
			this.regla = oParams.REGLA,
			this.GastoPrimerNivelAprob = oParams.GASTO_NIVEL_APROBACION_1,
			this.GastoSegundoNivelAprob = oParams.GASTO_NIVEL_APROBACION_2,
			this.GastoTercerNivelAprob = oParams.GASTO_NIVEL_APROBACION_3,
			this.tablaFiltro = oParams.FILTRO_TABLA,
			this.campoFiltro = oParams.FILTRO_CAMPO,
			this.tablaBuscada = oParams.BUSQUEDA_TABLA,
			this.campoBuscado = oParams.BUSQUEDA_CAMPO
		},
		onRouteMatched: function (oEvent) {
			this.oRegistroModel = new JSONModel({});
			this.items = [];
			var oModelDocSolicitud = new JSONModel([]);
			this.getView().setModel(oModelDocSolicitud, "DocumentosSolicitud");
			var route = {};
			route.subcarpeta01 = "ENTREGASRENDIR";
			route.subcarpeta02 = "SOLICITUDES";
			sap.ui.getCore().setModel(route, "route");
			var temp = {
				"tiposObjetosCosto": [],
				"objetosCosto": [],
				"Rstyp": {
					"code": "K",
					"name": "centro de costo"
				},
				"Kostl": {
					"code": "",
					"name": ""
				},
				"Bukrs": {
					"code": ""
				},
				"conceptos": [],
				"idFolderSolicitudGenerada": ""
			};
			this.oVariablesJSONModel = new JSONModel(temp);
			this.getView().setModel(this.oVariablesJSONModel, "oVariablesJSONModel");
			var oVariablesGlobales = {};
			oVariablesGlobales.repeticion = 0;
			oVariablesGlobales.carpetaEntregasRendir = "ENTREGASRENDIR";
			oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
			oVariablesGlobales.carpetaGasto = "GASTOS";
			sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "Documents");
			var oModelDev = new JSONModel([]);
			this.getView().setModel(oModelDev, "DocumentsDevolucion");
			var oModelView = new JSONModel([]);
			this.getView().setModel(oModelView, "DocumentosBoleta");
			
			this.getView().setModel(null, "devolucion");
			var fileUploadImagenesDevolucion = [];
			sap.ui.getCore().setModel(fileUploadImagenesDevolucion, "fileUploadImagenesDevolucion");
			var fileUploadImagenes = [];
			sap.ui.getCore().setModel(fileUploadImagenes, "fileUploadImagenes");
			
			// var idrepositorio = "1a084adbc0dc11ba63fc49e5"; //PRD
			var idrepositorio = "ea56a4f9aff8479818fc49e5"; //QAS
			var carpetaP = "Prueba/Repositorio";
			var ambiente = $.ambiente;
			sap.ui.getCore().setModel(idrepositorio, "idrepositorio");
			sap.ui.getCore().setModel(carpetaP, "carpetaP");
			sap.ui.getCore().setModel(ambiente, "ambiente");
		},
		
		getI18n: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		getI18nText: function (val) {
			return this.getI18n().getText(val);
		},
		
		setFormatterDate: function (pValue, val) {
			if (pValue !== null && pValue !== undefined) {
				var d = new Date(pValue);
				//a pesar de que el dato se devuelve en GMT-5 js le resta 5 horas
				//por ello se le suman 5 horas
				d.setHours(d.getHours() + 5);
				if (val === "0") {
					d.setDate(d.getDate() + 1);
				} else {
					d.setDate(d.getDate());
				}

				var month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();
				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;

				return [day, month, year].join('-');
			} else {
				return "";
			}
		},

		getConceptosAdicionales: function () {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/ERAdicionalSet", {
				async: false,
				success: (result, status, xhr) => {
					sap.ui.core.BusyIndicator.hide();
					that.getView().setModel(new JSONModel(result.results), "oAdicionalModel");
					that.fnCargarDataOperacion();
				},
				error: (xhr, status, error) => {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				},
			});
		},

		onDownloadFile: function (oEvent) {
			var oControl = oEvent.getSource();
			var sFileName = oControl.getBindingContext("DocumentosSolicitud").getProperty().Name;
			var sRoute = this.getView().getModel("DocumentosSolicitud").getData().Route;
			EverisUtils.sharepoint.downloadFile(sRoute, sFileName).catch((oError) => {
				console.log(oError);
				MessageBox.error(oThes.getI18nText("msgSharepointError"));
			});
			// DS.getObjectParents(oFile).then(function (oResult) {
			// 	var folderRoot = oResult[0].object.properties['cmis:path'].value;
			// 	var relativePath = oResult[0].relativePathSegment;
			// 	sFileUrl = sFileUrl + "/root" + folderRoot + "/" + relativePath;
			// 	fetch(sFileUrl).then(function (response) {
			// 		return response.blob();
			// 	}).then(function (blob) {
			// 		var nameFile = oFile.name.value;
			// 		var ext = /^.+\.([^.]+)$/.exec(nameFile);
			// 		ext = ext === null ? "" : ext[1];
			// 		nameFile = nameFile.replace("." + ext, "");
			// 		File.save(blob, nameFile, ext);
			// 	});
			// }.bind(this));
		},

		onCloseDialogAttachment: function (oEvent) {
			this._dialogAttach.close();
		},

		loadTipoObjetoCosto: function () {
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oInput = oThes.getView().byId("inputTipImp");
			// var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
			var v_soc = "1000"; //soc solicitante
			// var v_centro = this.oRegistroModel.getProperty("/Werks/code");
			var v_centro = "1400";
			// var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
			var v_almacen = "";
			this._oModelHeaders = {
				"bukrs": v_soc,
				"werks": v_centro,
				"lgort": v_almacen
			};
			this.getOwnerComponent().getModel("oUtilitiesModel").read("/ztipoobjcostoreservaSet", {
				headers: this._oModelHeaders,
				success: function (res) {
					sap.ui.core.BusyIndicator.hide();
					if (res.results.length > 0) {
						res.results.map(function (x) {
							if (x.Rstyp === oSolicitudSeleccionada.Kstrg) {
								oInput.setValue(x.Rstyp + " - " + x.Rsttx);
							}
						});
					}
				},
				error: function (err) {
					MessageBox.error(err.message);
				}
			});
		},

		loadObjetoCosto: function () {
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oInput = oThes.getView().byId("inputCeCo");
			// var sSociedad = sap.ui.getCore().getModel("InfoIas").Bukrs;
			var sSociedad = "1000";
			this._oModelHeaders = {
				"bukrs": sSociedad
			};
			this.getOwnerComponent().getModel("oUtilitiesModel").read("/zobjcostoSet", {
				headers: this._oModelHeaders,
				success: function (res) {
					if (res.results.length > 0) {
						res.results.map(function (x) {
							if (x.Kostl === oSolicitudSeleccionada.Kostl) {
								oInput.setValue(x.Kostl + " - " + x.Ktext);
							}
						});
					}
				},
				error: function (err) {
					MessageBox.error(err.message);
				}
			});
		},

		//Inicio creación de gasto
		fnChangeTxt: function () {
			var op = this.getView().byId("idOperacion").getSelectedKey();
			var oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				InfoIas = sap.ui.getCore().getModel("InfoIas");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + op + "')", {
				success: function (result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
					if (result.Txt50 !== "") {
						oThes.getView().byId("idCuentaMyr").setValue(result.Hkont);
						oThes.getView().byId("idButtonAdd").setVisible(true);
					} else {
						oThes.getView().byId("idCuentaMyr").setValue("No existe Cuenta Mayor");
						oThes.getView().byId("idButtonAdd").setVisible(false);
					}
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
        roundToTwo: function (num) {
			return +(Math.round(num + "e+2") + "e-2");
		},

		fnCargarDataComboSunat: function () {
			
			var oThes = this,
				oModel = oThes.getOwnerComponent().getModel("oDataModelFondoFijo"),
				aComboSunat = [];
			var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
			var Zapp = "2";
			// if (oModelDetailDocument.Ztyp == "S") {
			// 	Zapp = "1";
			// }
			/*filtro para Dpcumentos entregaRendir
             var aFilter = [];
			aFilter.push(new Filter("Zapp", FilterOperator.EQ, Zapp));*/
            var aFilter = [];
			//aFilter.push(new Filter("Zapp", FilterOperator.EQ, "5"));
            aFilter.push(new Filter("Zapp", FilterOperator.EQ, Zapp));
			// aFilter.push(new Filter("Zfondo", FilterOperator.EQ, "C001"));
			////
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/ListasSet", {
				filters: aFilter,
				success: function (result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
					$.each(result.results, function (pos, ele) {
						//if (ele.Pkey != "") {
						aComboSunat.push(ele);
						//	}
					});
					oThes.getView().byId("idTipoDocS").setModel(new JSONModel(aComboSunat));
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		fnCargarDataOperacion: function () {
			var oThes = this,
				oModel = oThes.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				aComboOperacion = [],
				aFilter = [],
				oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
			sap.ui.core.BusyIndicator.show(0);
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oModelDetailDocument.Bukrs));
			aFilter.push(new Filter("Type", FilterOperator.EQ, "G"));
			oModel.read("/OperacionSet", {
				filters: aFilter,
				success: function (result, status, xhr) {
					var oRegEx = /^E[0-9]{3}$/;
					if (oModelDetailDocument.Eratx) {
						var oAdicionalSeleccionado = oThes.getView().byId("idAdicionales").getSelectedItem().getBindingContext("oAdicionalModel").getObject();
					}
					switch (oModelDetailDocument.Eratx) {
						case "ER01":
							oRegEx = /^A0[0-9]{2}$/;
							break;
						case "ER02":
							oRegEx = /^A1[0-9]{2}$/;
							break;
						case "ER03":
							oRegEx = /^A2[0-9]{2}$/;
							break;
						case "ER04":
							oRegEx = /^A3[0-9]{2}$/;
							break;
						case "ER05":
							oRegEx = /^A4[0-9]{2}$/;
							break;
						case "ER06":
							oRegEx = /^A5[0-9]{2}$/;
							break;
					}
					$.each(result.results, function (pos, ele) {
						if (oRegEx.test(ele.Zcat)) {
							aComboOperacion.push(ele);
						}
					});
					sap.ui.getCore().setModel(aComboOperacion, "aComboOperacion");
					var oModelOperacion = new JSONModel(aComboOperacion);
					oModelOperacion.setSizeLimit(1000);
					oThes.getView().byId("idOperacion").setModel(oModelOperacion);
					oThes.getView().byId("idOperacion").setSelectedKey();
					oThes.fnChangeTxt();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		loadCentroCostoList: function () {
			var that = this;
			var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
			var sSociedad = oModelDetailDocument.Bukrs;
			var sCentroCosto = oModelDetailDocument.Kostl;
			this._oModelHeaders = {
				"bukrs": sSociedad
			};
			this.getOwnerComponent().getModel("oUtilitiesModel").read("/zobjcostoSet", {
				headers: this._oModelHeaders,
				success: function (res) {
					if (res.results.length > 0) {
						var element = [];
						element = res.results.filter(function (ele) {
							return (ele.Kostl === sCentroCosto);
						});
						if (element.length === 1) {
							console.log(element);
							that.getView().getModel().setProperty("/KostlKtext", element[0].Kostl + " - " + element[0].Ktext)
							that.oVariablesJSONModel.setProperty("/Kostl/code", element[0].Kostl);
							that.oVariablesJSONModel.setProperty("/Kostl/name", element[0].Ktext);
						}
						that.oVariablesJSONModel.setProperty("/objetosCosto/", res.results);
					} else {
						that.oVariablesJSONModel.setProperty("/objetosCosto/", "");
					}
				},
				error: function (err) {
					var msj = that.getI18nText("appErrorMsg");
					Utils.showMessageBox(msj, "warning");
				}
			});
		},
		
		onValidRuc: function (oEvent) {
			var that = this;
			var oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
			var input = oEvent.getSource();
			var val = oEvent.getSource().getValue();
			if (val !== Utils.onValidNumber(input.getValue())) {
				input.setValue(Utils.onValidNumber(input.getValue()));
			}
			if (val.length === 11) {
				// var sPath 
				var sPath = oModelMaestroSolicitudes.createKey("zrucSet", {
					IpRuc: val
				});
				oModelMaestroSolicitudes.read("/" + sPath, {
					success: function (result) {
						console.log(result);
						if (result.EpReturn) {
							that.bRucProveedor = true;
							that.getView().byId("idRazSoc").setValue(result.EpName);
						} else {
							var msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
							input.setValue("");
							that.bRucProveedor = false;
							MessageBox.warning(msj);
						}
					},
					error: function (error) {
						var msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
						input.setValue("");
						that.bRucProveedor = false;
						MessageBox.warning(msj);
					}
				});
			} else {
				input.setValue("");
				that.getView().byId("idRazSoc").setValue("");
				MessageBox.error(this.getI18nText("msgValidacionRuc"));
			}
		},
		
		onFilterSunat: function(oEvent){
			var	idTipoDocS = this.getView().byId("idTipoDocS").getSelectedKey(),
			   idCorr = this.getView().byId("idCorr"),
				idSerie = this.getView().byId("idSerie");

			if (idTipoDocS == "05"){
				idSerie.setMaxLength(4);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setMaxLength(11); 
				idCorr.setPlaceholder("XXXXXXXXXXX"); //correlativo
			} else if (idTipoDocS == "12") { 
				idSerie.setMaxLength(20);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setMaxLength(20); 
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			} else if (idTipoDocS == "00") { 
				idSerie.setMaxLength(4);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setMaxLength(20); 
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			} else if (idTipoDocS == "11") { 
				idSerie.setMaxLength(20);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setMaxLength(15); 
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			} else if (idTipoDocS == "13") {
				idSerie.setMaxLength(20);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setMaxLength(20); 
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			}else{
				idSerie.setValue("");
				idSerie.setMaxLength(4);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setValue(""); //correlativo
				idCorr.setMaxLength(8); 
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			}

            ///JORDAN SPRINT 3
			var sValueItem = this.getView().byId("idTipoDocS")._getSelectedItemText();
			var oJson = {};
			if (sValueItem != "Recibo por Honorarios") {
				oJson = {
					"ImportGrav": true,
					"ImportNoGrav": true,
					"ImportTotal": true,
					"Importe": false
				}
				this.getView().byId("idIndImp").setSelectedKey("C7");
                this.getView().byId("idIndImp").getItemByKey("C1").mProperties.text = "18%";
				this.getView().byId("idImporteD").setValue("");
				this.addImporteTotal();
				this.getView().getModel("oModelHelp").setData(oJson);
			} else {
				oJson = {
					"ImportGrav": false,
					"ImportNoGrav": false,
					"ImportTotal": false,
					"Importe": true
				}
				this.getView().byId("idIndImp").setSelectedKey("C7");
                this.getView().byId("idIndImp").getItemByKey("C1").mProperties.text = "8%";
				this.getView().byId("idImportGravado").setValue("");
				this.getView().byId("idImportNoGravado").setValue("");
				this.getView().byId("idImportTotal").setValue("0");
				this.addImporteTotal();
				this.getView().getModel("oModelHelp").setData(oJson);
			}
			///
		},
		
		onSerieChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var reference = oInput.getValue().toUpperCase().replace(/\s/g, '');
			var	idTipoDocS = this.getView().byId("idTipoDocS").getSelectedKey();
			if (!/[^a-zA-Z0-9]/.test(reference)) {
				if (idTipoDocS == "05"){
					if(oInput.getValue().length<=3){
						oInput.setValue(reference.padStart(3, 0));
					} else if(oInput.getValue().length==4){
						oInput.setValue(reference.padStart(4, 0));
					}
				} else if (idTipoDocS == "00") {
					if (oInput.getValue().length <= 3) {
						oInput.setValue(reference.padStart(4, 0));
					}
				} else if(idTipoDocS !== "12" && idTipoDocS !== "00" && idTipoDocS !== "11" && idTipoDocS !== "13" ) {
					oInput.setValue(reference.padStart(4, 0));
				}
			} else {
				return MessageToast.show("No se permiten caracteres especiales");
			}
		},
		
		onSerieLiveChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var reference = oInput.getValue().toUpperCase().replace(/\s/g, '');
			if (/[^a-zA-Z0-9]/.test(reference)) {
				var index = reference.length - 1;
				oInput.setValue(reference.slice(0, index));
			}
		},
		
		onCorrelativoChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var reference = oInput.getValue().toUpperCase().replace(/\s/g, '');
			var	idTipoDocS = this.getView().byId("idTipoDocS").getSelectedKey();
			if (!/[^a-zA-Z0-9]/.test(reference)) {
				if (oInput.getValue().length == 0){
					oInput.setValueState("Error");
					return MessageToast.show("El correlativo debe tener al menos 1 caracter");
				} else {
					oInput.setValueState("None");
				}
				if (idTipoDocS == "05" || idTipoDocS == "12" || idTipoDocS == "00" || idTipoDocS == "11" || idTipoDocS == "13"){
					if (oInput.getValue().length == 0){
						oInput.setValueState("Error");
						return MessageToast.show("El correlativo debe tener al menos 1 caracter");
					}else{
						oInput.setValueState("None");
					}
				} else{
					oInput.setValue(reference.padStart(8, 0));
				}	
			} else {
				return MessageToast.show("No se permiten caracteres especiales");
			}
		},
		
		onCorrelativoLiveChange: function (oEvent) {
	        var value = oEvent.getSource().getValue();
	        var bNotnumber = isNaN(value);
	        if (bNotnumber === true) {
	            oEvent.getSource().setValue(value.substring(0, value.length - 1));
	        }
		},
        calcularImporteIGV: function (IndImpuesto, Importe) {
			var intImporte = parseFloat(Importe);
			var intIndImpuesto = parseFloat(IndImpuesto);
			var importeIGV = intImporte + intImporte * intIndImpuesto / 100;
			importeIGV = this.roundToTwo(importeIGV);
			importeIGV = importeIGV + "";
			return importeIGV;
		},
		
		onChangeImportes: function (oEvent) {
			var nameControl = oEvent.getSource().data("nameControl"),
				cad = this.getView().byId(nameControl).getValue(),
				cade = cad.replace(/[^0-9.]/, ""),
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			oVariablesGlobales.repeticion = 0;
			for (var i = 0; i < cade.length; i++) {
				if (cade.charAt(i) == ".") {
					oVariablesGlobales.repeticion++;
				}
			}
			if (oVariablesGlobales.repeticion >= 2) {
				cade = cade.substr(0, cade.length - 1);
				oVariablesGlobales.repeticion = 0;
			}
			for (var pos = 0; pos < cade.length; pos++) {
				if (cade.charAt(pos) === ".") {
					cade = cade.substr(0, pos + 3);
				}
			}
			if (cade.indexOf(".") >= 0) { //es un decimal
				var t = cade.split(".");
				cade = (t[0].length ? parseInt(t[0]).toString() : "0") + "." + t[1].padEnd(2, "0");
			} else {
				cade = (cade.length ? parseInt(cade).toString() : "0") + ".00";
			}
			this.getView().byId(nameControl).setValue(cade);
			///JORDAN SPRINT3
			this.addImporteTotal();
			////

		},
		
		onOpenDialogAttach: function () {
			var that = this;
			that._dialogAttach = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.Attach", that);
			that.getView().addDependent(that._dialogAttach);
			that._dialogAttach.open();
		},
		
		onOpenDialogAttachDevolucion: function () {
			var that = this;
			if (!that._dialogAttachDevolucion) {
				that._dialogAttachDevolucion = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.AttachDevolucion", that);
				that.getView().addDependent(that._dialogAttachDevolucion);
			}
			that._dialogAttachDevolucion.open();
		},
		
		onCloseDialogAttach: function () {
			var that = this;
			that._dialogAttach.close();
			that._dialogAttach.destroy();
		},
		
		onCloseDialogAttachDevolucion: function () {
			var that = this;
			that._dialogAttachDevolucion.close();
		},
		
		uploadComplete: function (oEvent) {
			sap.ui.core.BusyIndicator.hide();
		},
		
		onFileDeleted: function (oEvent) {
			var that = this;
			var dataView = this.getView().getModel("Documents").getData();
			sap.ui.core.BusyIndicator.show();
			var objectFile = oEvent.getSource().getBindingContext("Documents").getPath();
			var sPath = objectFile.split("/")[1];
			dataView.splice(sPath, 1);
			that.getView().getModel("Documents").updateBindings();
			sap.ui.core.BusyIndicator.hide();
		},
		
		onFileDeletedBoleta: function (oEvent) {
			var that = this;
			var dataView = this.getView().getModel("DocumentosBoleta").getData();
			sap.ui.core.BusyIndicator.show();
			var objectFile = oEvent.getSource().getBindingContext("DocumentosBoleta").getPath();
			var sPath = objectFile.split("/")[1];
			dataView.splice(sPath, 1);
			that.getView().getModel("DocumentosBoleta").updateBindings();
			sap.ui.core.BusyIndicator.hide();
		},
		
		onFileDeletedDevolucion: function (oEvent) {
			var that = this;
			var dataView = this.getView().getModel("DocumentsDevolucion").getData();
			sap.ui.core.BusyIndicator.show();
			var objectFile = oEvent.getSource().getBindingContext("DocumentsDevolucion").getPath();
			var sPath = objectFile.split("/")[1];
			dataView.splice(sPath, 1);
			that.getView().getModel("DocumentsDevolucion").updateBindings();
			sap.ui.core.BusyIndicator.hide();
		},

		validarSunat: function (oEvent) {
			var that = this;
			var oTipoDoc = this.getView().byId("idTipoDocS");
			var oSelectedItem = oTipoDoc.getSelectedItem().getBindingContext().getObject();
			var oSerie = this.getView().byId("idSerie");
			var oCorrelativo = this.getView().byId("idCorr");
			var oRuc = this.getView().byId("idRUC");
			var oFechaFactura = this.getView().byId("idFechaFactura");
			if (!oTipoDoc.getSelectedKey() || !oSerie.getValue() || !oCorrelativo.getValue() || !oRuc.getValue()) {
				return MessageBox.error(that.getI18nText("txtCompletarCamposObligatorios"));
			}

			// validación RxH
			var oImporteTotal = this.getView().byId("idImportTotal");
			var sImporteTotal = oImporteTotal.getValue();
			var oImporteTotalReciboHonorarios = this.getView().byId("idImportTotalRecHon");
			if (oTipoDoc.getSelectedKey() === "02") {
				sImporteTotal = oImporteTotalReciboHonorarios.getValue();
			}
			
			sap.ui.core.BusyIndicator.show(0);
			if (oSelectedItem.Flag === "X" && /[A-Z]{1,4}[0-9]{1,3}/.test(oSerie.getValue())) {
				//buscar xml
				var aDocuments = this.getView().getModel("Documents").getData();
				var bIsXmlAttached = false;
				aDocuments.forEach((oDocument) => {
					if ((oDocument.DocType === "xml" || oDocument.DocType === "XML") && oDocument.mimeType === "text/xml") {
						bIsXmlAttached = true;
					}
				});
				if (!bIsXmlAttached && Number(sImporteTotal) >= 200) {
					sap.ui.core.BusyIndicator.hide();
					return MessageBox.error(that.getI18nText("msgValidacionComprobanteAdjuntarXml"));
				}
				if (bIsXmlAttached) {
					var bIsPdfAttached = false;
					aDocuments.forEach((oDocument) => {
						if ((oDocument.DocType === "pdf" || oDocument.DocType === "PDF") && oDocument.mimeType === "application/pdf") {
							bIsPdfAttached = true;
						}
					});
					if (!bIsPdfAttached) {
						sap.ui.core.BusyIndicator.hide();
						return MessageBox.error(that.getI18nText("msgValidacionComprobanteAdjuntarPdf"));
					}
					//validar con sunat
					var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
					var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
					var sBukrs = oModelDetailDocument.Bukrs;
					var sSociedadReceptora = oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
						return oSociedad.valueLow === sBukrs
					}).valueHigh;
					var oPayload = {
						numRuc: oRuc.getValue(),
						codComp: oTipoDoc.getSelectedKey() === "02" ? "R1" : oTipoDoc.getSelectedKey(),
						numeroSerie: oSerie.getValue(),
						numero: oCorrelativo.getValue(),
						fechaEmision: oFechaFactura.getValue().replace(/-/g, "/"),
						monto: sImporteTotal,
						numRucAcreedor: sSociedadReceptora
					};
					Sunat.getSunatStatus(that, oPayload).then((nSunat) => {
						switch (nSunat) {
							case -1:
								MessageBox.error(that.getI18nText("msgsunatstatusresponse"));
								sap.ui.core.BusyIndicator.hide();
								break;
							case 0:
								MessageBox.error(that.getI18nText("msgRechazoSunat"));
								sap.ui.core.BusyIndicator.hide();
								break;
							default:
								MessageToast.show(that.getI18nText("msgAprobacionSunat"));
								sap.ui.core.BusyIndicator.hide();
								that.fnAgregarDetGasto();
								break;
						}
					}).catch((oError) => {
						console.log(oError);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(that.getI18nText("msgsunatstatusresponse"));
					});
				} else {
					sap.ui.core.BusyIndicator.hide();
					this.fnAgregarDetGasto();
				}
			} else {
				sap.ui.core.BusyIndicator.hide();
				this.fnAgregarDetGasto();
			}
		},
		
		fnAgregarDetGasto: function () {
            ///JORDAN SPRINT 3
            //Pregunta si es recibo por honorario u otro
            var oIdTipoDocS = this.getView().byId("idTipoDocS");
            if (Utils.onValidarVacio(oIdTipoDocS._getSelectedItemText())) {
                oIdTipoDocS.setValueState("Error");
                return;
            }
        
            //VALIDACION PARA ADJUNTAR EL DOCUMENTO OBLIGATORIAMENTE
            var DocumentoGasto = this.getView().getModel("Documents").getData();
            if (!DocumentoGasto.length) {
                MessageBox.information("Se debe adjuntar un documento obligatoriamente");
                return;
            }
        
            //Validar Serie y correlativo
            var Serie = this.getView().byId("idSerie");
            var Correlativo = this.getView().byId("idCorr");
            var sTipDocSunat = this.getView().byId("idTipoDocS")._getSelectedItemText();
            if (sTipDocSunat !== "Otros") {
                if (Serie.getValue() === "0000") {
                    MessageBox.information("Ingrese una serie diferente de 0");
                    return;
                }
                if (Correlativo.getValue() === "00000000") {
                    MessageBox.information("Ingrese Correlativo diferente de 0");
                    return;
                }
            }
            /////////////
        
            if (oIdTipoDocS._getSelectedItemText() === "Recibo por Honorarios") {
                var InfoIas = sap.ui.getCore().getModel("InfoIas"),
                    oTable = this.getView().byId("idTablaDetGastos"),
                    aFilas = oTable.getModel().getData(),
                    oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument"),
                    oJGasto = sap.ui.getCore().getModel("oJGasto"),
                    oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo"),
                    oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
        
                var aDetGasto = {},
                    aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
                    iImporteTotalSolicitud = oModelDetailDocument.Wrbtr,
                    oFecDoc = this.getView().byId("idFecha"),
                    oFechCon = this.getView().byId("idFechaCont");
        
                var oIdSol = this.getView().byId("idSol"),
                    oIdOperacion = this.getView().byId("idOperacion"),
                    oIdCeco = this.getView().byId("idCeco"),
                    oIdTipoDocS = this.getView().byId("idTipoDocS"),
                    oIdCorr = this.getView().byId("idCorr"),
                    oIdRuc = this.getView().byId("idRUC"),
                    oIdIndImp = this.getView().byId("idIndImp"),
                    oIdCuentaMyr = this.getView().byId("idCuentaMyr"),
                    oIdImporteD = this.getView().byId("idImporteD"),
                    oIdSerie = this.getView().byId("idSerie"),
                    oIdRazSoc = this.getView().byId("idRazSoc"),
                    oIdFechaFactura = this.getView().byId("idFechaFactura"),
                    ///oIdCheckDevol = this.getView().byId("idCheckDevol"),///JORDAN COMENTADO SPRINT 3
                    oIdDevolucion = this.getView().byId("idDevolucion"),
                    oIdMoneda = this.getView().byId("idWaers"),
                    oIdImporteTotalGasto = this.getView().byId("idImporteTotal");
        
                var aTemp = oIdImporteD.getValue();
                oIdImporteD.setValue(String(Number(aTemp)));
        
                oIdTipoDocS.setValueState("None");
                oIdCorr.setValueState("None");
                oIdRuc.setValueState("None");
                oIdIndImp.setValueState("None");
                oIdCuentaMyr.setValueState("None");
                oIdImporteD.setValueState("None");
                oIdSerie.setValueState("None");
                oIdRazSoc.setValueState("None");
                oIdFechaFactura.setValueState("None");
        
                if (Utils.onValidarVacio(oIdTipoDocS._getSelectedItemText())) {
                    oIdTipoDocS.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdCorr.getValue())) {
                    oIdCorr.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdRuc.getValue())) {
                    oIdRuc.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdIndImp._getSelectedItemText())) {
                    oIdIndImp.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdCuentaMyr.getValue())) {
                    oIdCuentaMyr.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdImporteD.getValue())) {
                    oIdImporteD.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdSerie.getValue())) {
                    oIdSerie.setValueState("Error");
                    return;
                }
                //{@pguevarl - validación del pto. 2
                if (oIdTipoDocS.getSelectedKey() === "05") {
                    if (oIdSerie.getValue().length < 3) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener de 3 a 4 caracteres");
                        return;
                    }
                    if (oIdCorr.getValue().length === 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener de 1 a 11 caracteres");
                        return;
                    }
                }
                if (oIdTipoDocS.getSelectedKey() === "12" ||
                    oIdTipoDocS.getSelectedKey() === "00" ||
                    oIdTipoDocS.getSelectedKey() === "11" ||
                    oIdTipoDocS.getSelectedKey() === "13") {
                    if (oIdSerie.getValue().length === 0) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener al menos 1 caracter");
                        return;
                    }
                    if (oIdCorr.getValue().length === 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener al menos 1 caracter");
                        return;
                    }
                }
                if (oIdSerie.getValue().length + oIdCorr.getValue().length > 16) {
                    MessageToast.show("La cantidad máxima de serie + correlativo es de 16 caracteres");
                    return;
                }
                if (Utils.onValidarVacio(oIdRazSoc.getValue())) {
                    oIdRazSoc.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdFechaFactura.getValue())) {
                    oIdFechaFactura.setValueState("Error");
                    return;
                }
        
                //Modelo para enviar al Odata Detalle de Gasto
				// aDetGasto.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                //aDetGasto.ZCat = oSolicitudSeleccionada.Zcat;oIdOperacion
                aDetGasto.ZCat = oIdOperacion.getSelectedKey();
                aDetGasto.Bukrs = InfoIas.Bukrs;
                aDetGasto.Belnr = "";
                aDetGasto.Gjahr = "";
                // aDetGasto.Fondo = this.getView().byId("idfondo").getValue().substr(0, 4);
                aDetGasto.Usuario = "";
                aDetGasto.Bldat = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                aDetGasto.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
                aDetGasto.FechadocSunat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()) + "T00:00:00";
                /*		aDetGasto.Bldat = this.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";
                        aDetGasto.Budat = this.fnFormatearFechaSAP(oFechCon) + "T00:00:00";*/
                aDetGasto.Blart = "";
                aDetGasto.BelnrSol = oIdSol.getValue();
                aDetGasto.Detalle = oIdOperacion._getSelectedItemText();
                aDetGasto.Ztype = "G";
                aDetGasto.Waers = oIdMoneda.getValue();
                aDetGasto.BukrsSol = InfoIas.Bukrs;
                aDetGasto.GjahrSol = oModelDetailDocument.Gjahr;
                aDetGasto.Saknr = oIdCuentaMyr.getValue();
                aDetGasto.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aDetGasto.Dzuonr = oIdRuc.getValue();
                aDetGasto.Serie = oIdSerie.getValue();
                aDetGasto.Correlativo = oIdCorr.getValue();
				aDetGasto.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
                aDetGasto.WtWithcd = oIdIndImp.getSelectedKey();
                aDetGasto.Mwskz = oIdIndImp._getSelectedItemText().split("%")[0];
                aDetGasto.Wrbtr = oIdImporteD.getValue();
                aDetGasto.Wrbtr = this.calcularImporteIGV(aDetGasto.Mwskz, aDetGasto.Wrbtr);
                console.log(aDetGasto.Mwskz, aDetGasto.Wrbtr)
                aDetGasto.Kstrg = this.getView().byId("idTipoObj").getValue().split(" - ")[0];
                if (aDetGasto.Kstrg == "F") {
                    aDetGasto.Aufnr = this.getView().byId("idObjCost").getValue().split(" ")[0];
                    aDetGasto.Kostl = "";
                } else {
                    aDetGasto.Aufnr = "";
                    aDetGasto.Kostl = this.getView().byId("idObjCost").getValue().split(" ")[0];
                }
        
                // LR 31/12
                aDetGasto.Imagen = this.getView().getModel("Documents").getData();
                // aDetGasto.Imagen = sap.ui.getCore().getModel("fileUploadImagenes")[0];
        
                //Json del detalle de Gasto
                var aFilaJGasto = {};
				// aFilaJGasto.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                if (aDetGasto.Kstrg == "F") {
                    aFilaJGasto.Aufnr = this.getView().byId("idObjCost").getValue();
                    aFilaJGasto.Kostl = "";
                    aFilaJGasto.oKostl = "";
                } else {
                    aFilaJGasto.Aufnr = "";
                    aFilaJGasto.Kostl = this.getView().byId("idObjCost").getValue(); //oIdCeco.getValue();
                    aFilaJGasto.oKostl = "";
                }
        
                aFilaJGasto.ImporteSinIGV = oIdImporteD.getValue();
                aFilaJGasto.Parked_Document = "";
        
                aFilaJGasto.Wbtr_sol = "";
                aFilaJGasto.Bldat = Utils.fnFormatearFechaSAP(oFecDoc.getValue()).replace(/-/gi, "");
                //aFilaJGasto.Bldat = this.fnFormatearFechaSAP(oFecDoc);
                aFilaJGasto.Zcat = oIdOperacion.getSelectedKey();
                aFilaJGasto.Tax_code = oIdIndImp.getSelectedKey();
                if (oIdFechaFactura.getDateValue() === null) {
                    aFilaJGasto.Xref_1 = Utils.fnFormatearFechaFactura2(oIdFechaFactura.getValue()).replace(/-/gi, "");
                } else {
                    aFilaJGasto.Xref_1 = Utils.fnFormatearFechaFactura1(oIdFechaFactura.getDateValue()).replace(/-/gi, "");
                }
                aFilaJGasto.Xref_2 = oIdRuc.getValue();
                aFilaJGasto.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aFilaJGasto.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue();
				aFilaJGasto.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
                aFilaJGasto.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()).replace(/-/gi, "");
                //BRAD corrigio oFechCon.getValue()
                //aFilaJGasto.Budat = this.fnFormatearFechaSAP(oFechCon);
                //aFilaJGasto.Nrposit = Seteo al agregar a la tabla
                aFilaJGasto.Hkont = oIdCuentaMyr.getValue();
                aFilaJGasto.Wrbtr = aDetGasto.Wrbtr;
                aFilaJGasto.Waers = oIdMoneda.getValue();
                aFilaJGasto.Imp_total = oIdImporteTotalGasto.getValue();
                ///JORDAN COMENTADO SPRINT 3
                // if (oIdCheckDevol.getSelected() === true) {
                // 	aFilaJGasto.Flag_dev = "X";
                // 	aFilaJGasto.Sgtxt_dev = oIdDevolucion.getValue();
                // } else {
                // 	aFilaJGasto.Flag_dev = "";
                // 	aFilaJGasto.Sgtxt_dev = "";
                // }
                /////
                // if ($.isCajaReembolso) {
                // 	var oIdCheckReembolso = this.getView().byId("idCheckReembolso");
                // 	var oIdReembolso = this.getView().byId("idReembolso");
                // 	if (oIdCheckReembolso.getSelected() === true) {
                // 		aFilaJGasto.Flag_reembolso = "X";
                // 		aFilaJGasto.Sgtxt_dev = oIdReembolso.getValue();
                // 	} else {
                // 		aFilaJGasto.Flag_reembolso = "";
                // 		aFilaJGasto.Sgtxt_dev = "";
                // 	}
                // }
                aFilaJGasto.Ztype = "G";
                aFilaJGasto.Bukrs = InfoIas.Bukrs;
                //4 campos solo para la tabla
                aFilaJGasto.oOperacion = oIdOperacion._getSelectedItemText().substr(7, 100);
                aFilaJGasto.oCtaMyr = oIdCuentaMyr.getValue();
                aFilaJGasto.oSerie = oIdSerie.getValue();
                aFilaJGasto.oCorrelativo = oIdCorr.getValue();
                aFilaJGasto.oIndImp = oIdIndImp._getSelectedItemText();
                aFilaJGasto.oImagen = sap.ui.getCore().getModel("fileUploadImagenes")[0];
                //Modelo para enviar a la tabla detalle de gasto
                /*	var aTablaGasto = {};
                    aTablaGasto.oOperacion = oIdOperacion._getSelectedItemText().substr(7, 100);
                    aTablaGasto.oCtaMyr = oIdCuentaMyr.getValue();
                    aTablaGasto.oCeco = oIdCeco.getValue();
                    aTablaGasto.oRazSoc = oIdRazSoc.getValue();
                    aTablaGasto.oRuc = oIdRuc.getValue();
                    aTablaGasto.oSerie = oIdSerie.getValue();
                    aTablaGasto.oCorrelativo = oIdCorr.getValue();
                    aTablaGasto.oImporte = oIdImporteD.getValue();
                    aTablaGasto.IndImp = oIdIndImp._getSelectedItemText();*/
                // var fMontoEvaluar = 0;
                // //Calcular si el monto total de los importes en verde es mayor o igual al del importe total que se genera
                // //fMontoEvaluar = Number(oIdImporteD.getValue()) + oVariablesGlobales.ImporteTotalGastos;
                // fMontoEvaluar = Number(oIdImporteD.getValue());
                // if (Number(oModelFondoFijo.ZfLimite) <= fMontoEvaluar) {
                //     var diferencia = fMontoEvaluar - Number(oModelFondoFijo.ZfLimite);
                //     MessageBox.alert("Gasto incurrido supera el límite permitido por " + diferencia);
                //     return;
                // }
        
                ///VALIDACION CADENA OPERACION
                if (aDetGasto.Detalle.length > 40) {
                    aDetGasto.Detalle = aDetGasto1.Detalle.substr(0, 40);
                }
                ///
        
                if (Number(aFilaJGasto.Wrbtr) <= Number(iImporteTotalSolicitud) || $.isCajaReembolso) {
        
                    if (aFilas.length === 0) {
                        aDetGasto.Nrpos = "1";
                        //	aTablaGasto.Nrpos = 1;
                        aFilaJGasto.Nposit = 1;
        
                        //VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD
        
                        var iTotalSolicitud = this.getView().byId("idImporteS").getValue().replace(",", "");
                        iTotalSolicitud = parseFloat(iTotalSolicitud);
                        var iTotalDetalleGasto = aFilaJGasto.Wrbtr;
                        iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);
        
                        if (iTotalDetalleGasto > iTotalSolicitud) {
                            MessageBox.error("Se ha excedido el importe Total de la Solicitud");
                            return;
                        }
                        ///***********************************************************************//
                        aFilas.push(aFilaJGasto);
                        aTablaDetGasto.push(aDetGasto);
						var oModel = new JSONModel(aFilas);
						oModel.setSizeLimit(1000);
                        oTable.setModel(oModel);
                        oTable.getModel().refresh(true);
                        oIdImporteTotalGasto.fireChange({ value: aFilaJGasto.Wrbtr });
                       // this.getView().byId("idImporteTotalIGV").setValue(aFilaJGasto.Wrbtr);
                        //	sap.ui.getCore().setModel(oJGasto, "oJGasto");
                    } else {
                        var sSuma = 0;
                        $.each(aFilas, function (key, value) {
                            sSuma += Number(value.Wrbtr);
                        });
                        sSuma = sSuma + Number(aFilaJGasto.Wrbtr);
                        //LR 11/12/19
                        sSuma = parseFloat(sSuma).toFixed(2);
        
                        //VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD
        
                        var iTotalSolicitud = this.getView().byId("idImporteS").getValue().replace(",", "");
                        iTotalSolicitud = parseFloat(iTotalSolicitud);
                        var iTotalDetalleGasto = sSuma;
                        iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);
        
                        if (iTotalDetalleGasto > iTotalSolicitud) {
                            MessageBox.error("Se ha excedido el importe Total de la Solicitud");
                            return;
                        }
                        ///***********************************************************************//
        
                        // if (Number(oModelFondoFijo.ZfLimite) <= sSuma) {
                        //     var diferencia2 = sSuma - Number(oModelFondoFijo.ZfLimite);
                        //     MessageBox.alert("Gasto incurrido supera el límite permitido por " + diferencia2);
                        //     return;
                        // }
                        if (sSuma <= Number(iImporteTotalSolicitud) || $.isCajaReembolso) {
                            this.getView().byId("idImporteTotal").fireChange({ value: sSuma });
                            var Nrpos = aFilas[aFilas.length - 1];
                            aDetGasto.Nrpos = String(Number(Nrpos.Nposit) + 1);
                            //	aTablaGasto.Nrpos = String(Number(Nrpos.Nrpos) + 1);
                            aFilaJGasto.Nposit = String(Number(Nrpos.Nposit) + 1);
                            aFilas.push(aFilaJGasto);
							var oModel = new JSONModel(aFilas);
							oModel.setSizeLimit(1000);
                            oTable.setModel(oModel);
                            aTablaDetGasto.push(aDetGasto);
                            oTable.getModel().refresh(true);
                            oIdImporteTotalGasto.fireChange({ value: sSuma });
                           // this.getView().byId("idImporteTotalIGV").setValue(sSuma);
                            //		sap.ui.getCore().setModel(oJGasto, "oJGasto");
                        } else {
                            MessageBox.alert("El importe excede el monto total de la solicitud");
                        }
                    }
                } else {
                    MessageBox.alert("Gasto incurrido supera el importe de la solicitud");
                    return;
                }
                /***************************/
               // this.obtenerTotales();
                /*****DOCUMENT SERVICE*****/
                var aDetGDS = JSON.parse(JSON.stringify(aDetGasto));
                aDetGDS.Imagen = this.getView().getModel("Documents").getData();
        
                var aTDS = [];
                aTDS.push(aDetGDS);
        
                //LR 31/12
        
                var documentos = [];
        
                $.each(aTablaDetGasto, function (key, value) {
                    documentos.push(value);
                });
        
				var oModel = new JSONModel(documentos);
				oModel.setSizeLimit(1000);
                this.getView().setModel(oModel, "DocumentsForPosition");
                /*************************/
                oIdCorr.setValue("");
                oIdRuc.setValue("");
                oIdImporteD.setValue("");
                oIdSerie.setValue("");
                oIdRazSoc.setValue("");
        
                this.getView().byId("idTipoDocS").setSelectedKey();
                this.getView().byId("idIndImp").setSelectedKey();
                //LR 30/12/19
                oIdCuentaMyr.setValue("");
                this.getView().byId("idOperacion").setSelectedKey();
                this.getView().byId("idImportTotalRecHon").setValue("0");
                this.getView().byId("idImportTotal").setValue("0");
        
                this.fnChangeTxt();
                //oIdFechaFactura.setValue(this.fnFormatearFechaVista(new Date()));
                oIdFechaFactura.setDateValue(new Date());
                //oIdFechaFactura.setValue("");
                //oIdCeco.setValue("");
        
                //oIdFechaFactura.setValue(this.fnFormatearFechaVista(new Date()));
                sap.ui.getCore().setModel(aFilas, "oJGasto");
                sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
                this.getView().getModel("Documents").setData([]);
            } else {
                ///JORDAN SPRINT 3
                var InfoIas = sap.ui.getCore().getModel("InfoIas"),
                    oTable = this.getView().byId("idTablaDetGastos"),
                    aFilas = oTable.getModel().getData(),
                    oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
        
                var aDetGasto1 = {},
                    aDetGasto2 = {}
                aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
                    iImporteTotalSolicitud = oModelDetailDocument.Wrbtr,
                    oFecDoc = this.getView().byId("idFecha"),
                    oFechCon = this.getView().byId("idFechaCont");
        
                var oIdSol = this.getView().byId("idSol"),
                    oIdOperacion = this.getView().byId("idOperacion"),
                    //oIdTipoDocS = this.getView().byId("idTipoDocS"),//Lo declaro al inicio
                    oIdCorr = this.getView().byId("idCorr"),
                    oIdRuc = this.getView().byId("idRUC"),
                    oIdIndImp = this.getView().byId("idIndImp"),
                    oIdCuentaMyr = this.getView().byId("idCuentaMyr"),
                    //oIdImporteD = this.getView().byId("idImporteD"),
                    oIdImportGravado = this.getView().byId("idImportGravado"),
                    oIdImportNoGravado = this.getView().byId("idImportNoGravado"),
                    oIdImportTotal = this.getView().byId("idImportTotal"),
        
                    oIdSerie = this.getView().byId("idSerie"),
                    oIdRazSoc = this.getView().byId("idRazSoc"),
                    oIdFechaFactura = this.getView().byId("idFechaFactura"),
                    //oIdCheckDevol = this.getView().byId("idCheckDevol"),
                    oIdCheckReembolso = this.getView().byId("idCheckReembolso"),
                    //oIdDevolucion = this.getView().byId("idDevolucion"),
                    //oIdReembolso = this.getView().byId("idReembolso"),
                    oIdMoneda = this.getView().byId("idWaers"),
                    oIdImporteTotalGasto = this.getView().byId("idImporteTotal"),
                    oIdTipoObj = this.getView().byId("idTipoObj"),
                    oIdObjCost = this.getView().byId("idObjCost"),
                    oIdRadButRet = this.getView().byId("idRadButRet"),
                    oIdRadButDet = this.getView().byId("idRadButDet"),
        
                    oIdPorcRetencion = this.getView().byId("idPorcRetencion"),
                    oIdImporteRetencion = this.getView().byId("idImporteRetencion"),
                    oIdPorcDetraccion = this.getView().byId("idPorcDetraccion"),
                    oIdImporteDetraccion = this.getView().byId("idImporteDetraccion"),
                    oIdFechaDetracccion = this.getView().byId("idFechaDetracccion"),
                    oIdNumConstancia = this.getView().byId("idNumConstancia");
        
                var aTempImpGrav = oIdImportGravado.getValue();
                oIdImportGravado.setValue(String(Number(aTempImpGrav)));
                var aTempImpNoGrav = oIdImportNoGravado.getValue();
                oIdImportNoGravado.setValue(String(Number(aTempImpNoGrav)));
        
                oIdTipoDocS.setValueState("None");
                oIdCorr.setValueState("None");
                oIdRuc.setValueState("None");
                oIdIndImp.setValueState("None");
                oIdCuentaMyr.setValueState("None");
                oIdImportGravado.setValueState("None");
                oIdImportNoGravado.setValueState("None");
                oIdSerie.setValueState("None");
                oIdRazSoc.setValueState("None");
                oIdFechaFactura.setValueState("None");
        
                if (Utils.onValidarVacio(oIdTipoDocS._getSelectedItemText())) {
                    oIdTipoDocS.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdCorr.getValue())) {
                    oIdCorr.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdRuc.getValue())) {
                    oIdRuc.setValueState("Error");
                    return;
                }
                if (!this.bRucProveedor) {
                    var msj = "El RUC no se encuentra registrado como proveedor.";
                    Utils.showMessageBox(msj, "error");
                    return;
                }
                if (Utils.onValidarVacio(oIdIndImp._getSelectedItemText())) {
                    oIdIndImp.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdCuentaMyr.getValue())) {
                    oIdCuentaMyr.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdImportGravado.getValue())) {
                    oIdImportGravado.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdImportNoGravado.getValue())) {
                    oIdImportNoGravado.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdSerie.getValue())) {
                    oIdSerie.setValueState("Error");
                    return;
                }
                if (oIdTipoDocS.getSelectedKey() === "05") {
                    if (oIdSerie.getValue().length < 3) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener de 3 a 4 caracteres");
                        return;
                    }
                    if (oIdCorr.getValue().length === 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener de 1 a 11 caracteres");
                        return;
                    }
                }
                if (oIdTipoDocS.getSelectedKey() === "12" ||
                    oIdTipoDocS.getSelectedKey() === "00" ||
                    oIdTipoDocS.getSelectedKey() === "11" ||
                    oIdTipoDocS.getSelectedKey() === "13") {
                    if (oIdSerie.getValue().length === 0) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener al menos 1 caracter");
                        return;
                    }
                    if (oIdCorr.getValue().length === 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener al menos 1 caracter");
                        return;
                    }
                }
                if (oIdSerie.getValue().length + oIdCorr.getValue().length > 16) {
                    MessageToast.show("La cantidad máxima de serie + correlativo es de 16 caracteres");
                    return;
                }
                if (Utils.onValidarVacio(oIdRazSoc.getValue())) {
                    oIdRazSoc.setValueState("Error");
                    return;
                }
                if (Utils.onValidarVacio(oIdFechaFactura.getValue())) {
                    oIdFechaFactura.setValueState("Error");
                    return;
                }
        
                this.solicitudGasto = oIdSol.getValue();
                //Modelo para enviar al Odata Detalle de Gasto 1 Importe gravado
				// aDetGasto1.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                aDetGasto1.ZCat = oIdOperacion.getSelectedKey();
                aDetGasto1.Bukrs = InfoIas.Bukrs;
                aDetGasto1.Belnr = "";
                aDetGasto1.Gjahr = "";
                aDetGasto1.Usuario = "";
                //	aDetGasto1.Bldat = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                //	aDetGasto1.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
                aDetGasto1.Bldat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()) + "T00:00:00";
                aDetGasto1.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
                aDetGasto1.FechadocSunat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()) + "T00:00:00";
        
                aDetGasto1.Blart = "";
                aDetGasto1.BelnrSol = oIdSol.getValue();
                aDetGasto1.Detalle = oIdOperacion._getSelectedItemText();
        
                aDetGasto1.Ztype = "G";
                //aDetGasto1.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code"); //this.getView().byId("idCeco").getValue();
                aDetGasto1.Waers = oIdMoneda.getValue();
                aDetGasto1.BukrsSol = InfoIas.Bukrs;
                aDetGasto1.GjahrSol = oModelDetailDocument.Gjahr;
                aDetGasto1.Saknr = oIdCuentaMyr.getValue();
        
                aDetGasto1.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aDetGasto1.Dzuonr = oIdRuc.getValue();
                aDetGasto1.Serie = oIdSerie.getValue();
                aDetGasto1.Correlativo = oIdCorr.getValue();
				aDetGasto1.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
        
                aDetGasto1.Mwskz = oIdIndImp._getSelectedItemText().split("%")[0];
                aDetGasto1.Wrbtr = oIdImportGravado.getValue();
        
                console.log("1" + aDetGasto1.Mwskz + "-" + aDetGasto1.Wrbtr)
                aDetGasto1.Wrbtr = this.calcularImporteIGV(aDetGasto1.Mwskz, aDetGasto1.Wrbtr);
        
                aDetGasto1.Imagen = this.getView().getModel("Documents").getData();
                //Agregado
                aDetGasto1.WtWithcd = oIdIndImp.getSelectedKey();
        
                aDetGasto1.Kstrg = oIdTipoObj.getValue().split(" - ")[0];
                aDetGasto1.Zmotivor = "";
        
                if (aDetGasto1.Kstrg == "K") {
                    aDetGasto1.Kostl = oIdObjCost.getValue().split(" ")[0];
                }
                if (aDetGasto1.Kstrg == "F") {
                    aDetGasto1.Aufnr = oIdObjCost.getValue().split(" ")[0];
                }
                //aDetGasto1.Kstrg = oIdTipoDocS.getSelectedKey();
                //Modelo para enviar al Odata Detalle de Gasto 2 Importe gravado
				// aDetGasto2.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                aDetGasto2.ZCat = oIdOperacion.getSelectedKey();
                aDetGasto2.Bukrs = InfoIas.Bukrs;
                aDetGasto2.Belnr = "";
                aDetGasto2.Gjahr = "";
                aDetGasto2.Usuario = "";
                //aDetGasto2.Bldat = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                //aDetGasto2.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
        
                aDetGasto2.Bldat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()) + "T00:00:00";
                aDetGasto2.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
                aDetGasto2.FechadocSunat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()) + "T00:00:00";
        
                aDetGasto2.Blart = "";
                aDetGasto2.BelnrSol = oIdSol.getValue();
                aDetGasto2.Detalle = oIdOperacion._getSelectedItemText();
                aDetGasto2.Ztype = "G";
                //aDetGasto2.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code"); //this.getView().byId("idCeco").getValue();
                aDetGasto2.Waers = oIdMoneda.getValue();
                aDetGasto2.BukrsSol = InfoIas.Bukrs;
                aDetGasto2.GjahrSol = oModelDetailDocument.Gjahr;
                aDetGasto2.Saknr = oIdCuentaMyr.getValue();
        
                aDetGasto2.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aDetGasto2.Dzuonr = oIdRuc.getValue();
                aDetGasto2.Serie = oIdSerie.getValue();
                aDetGasto2.Correlativo = oIdCorr.getValue();
				aDetGasto2.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
                aDetGasto2.Mwskz = "0";
        
                aDetGasto2.Wrbtr = oIdImportNoGravado.getValue();
                aDetGasto2.Wrbtr = this.calcularImporteIGV(aDetGasto2.Mwskz, aDetGasto2.Wrbtr);
        
                console.log("2" + aDetGasto2.Mwskz + "-" + aDetGasto2.Wrbtr)
                aDetGasto2.Imagen = this.getView().getModel("Documents").getData();
                //Agregado
                aDetGasto2.WtWithcd = "C7";
        
                aDetGasto2.Kstrg = oIdTipoObj.getValue().split(" - ")[0];
                aDetGasto2.Zmotivor = "";
                if (aDetGasto2.Kstrg == "K") {
                    aDetGasto2.Kostl = oIdObjCost.getValue().split(" ")[0];
                }
                if (aDetGasto2.Kstrg == "F") {
                    aDetGasto2.Aufnr = oIdObjCost.getValue().split(" ")[0];
                }
                //aDetGasto2.Kstrg = oIdTipoDocS.getSelectedKey();
                //Json del detalle de Gasto 1 
                var aFilaJGasto1 = {};
				// aFilaJGasto1.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                aFilaJGasto1.ImporteSinIGV = oIdImportGravado.getValue();
                aFilaJGasto1.Parked_Document = "";
                aFilaJGasto1.Wbtr_sol = "";
                aFilaJGasto1.Bldat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()).replace(/-/gi, "");
                aFilaJGasto1.Zcat = oIdOperacion.getSelectedKey();
                aFilaJGasto1.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code");
                aFilaJGasto1.Tax_code = oIdIndImp.getSelectedKey();
                if (oIdFechaFactura.getDateValue() === null) {
                    aFilaJGasto1.Xref_1 = Utils.fnFormatearFechaFactura2(oIdFechaFactura.getValue()).replace(/-/gi, "");
                } else {
                    aFilaJGasto1.Xref_1 = Utils.fnFormatearFechaFactura1(oIdFechaFactura.getDateValue()).replace(/-/gi, "");
                }
                aFilaJGasto1.Xref_2 = oIdRuc.getValue();
                aFilaJGasto1.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aFilaJGasto1.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue(); //oIdRuc.getValue();
				aFilaJGasto1.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
                aFilaJGasto1.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()).replace(/-/gi, "");
                aFilaJGasto1.Hkont = oIdCuentaMyr.getValue();
                aFilaJGasto1.Wrbtr = aDetGasto1.Wrbtr;
                aFilaJGasto1.Waers = oIdMoneda.getValue();
        
                aFilaJGasto1.Imp_total = oIdImporteTotalGasto.getValue();
                // if (oIdCheckDevol.getSelected() === true) {
                // 	aFilaJGasto.Flag_dev = "X";
                // 	aFilaJGasto.Sgtxt_dev = oIdDevolucion.getValue();
                // } else {
                // 	aFilaJGasto.Flag_dev = "";
                // 	aFilaJGasto.Sgtxt_dev = "";
                // }
        
                // if (oIdCheckReembolso.getSelected() === true) {
                // 	aFilaJGasto1.Flag_reembolso = "X";
                // 	aFilaJGasto1.Sgtxt_dev = oIdReembolso.getValue();
                // } else {
                // 	aFilaJGasto1.Flag_reembolso = "";
                // 	aFilaJGasto1.Sgtxt_dev = "";
                // }
                aFilaJGasto1.Ztype = "G";
                aFilaJGasto1.Bukrs = InfoIas.Bukrs;
                //4 campos solo para la tabla
                aFilaJGasto1.oKostl = this.oVariablesJSONModel.getData().Kostl.name;
                aFilaJGasto1.oOperacion = oIdOperacion._getSelectedItemText().substr(7, 100);
                aFilaJGasto1.oCtaMyr = oIdCuentaMyr.getValue();
                aFilaJGasto1.oSerie = oIdSerie.getValue();
                aFilaJGasto1.oCorrelativo = oIdCorr.getValue();
                aFilaJGasto1.oIndImp = oIdIndImp._getSelectedItemText();
        
                //Json del detalle de Gasto 2 
                var aFilaJGasto2 = {};
				// aFilaJGasto2.TipoDocSunat = oIdTipoDocS._getSelectedItemText();
                aFilaJGasto2.ImporteSinIGV = oIdImportNoGravado.getValue();
                aFilaJGasto2.Parked_Document = "";
                aFilaJGasto2.Wbtr_sol = "";
                aFilaJGasto2.Bldat = Utils.fnFormatearFechaSAP(oIdFechaFactura.getValue()).replace(/-/gi, "");
                aFilaJGasto2.Zcat = oIdOperacion.getSelectedKey();
                aFilaJGasto2.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code");
                aFilaJGasto2.Tax_code = "C7";//oIdIndImp.getSelectedKey();
                if (oIdFechaFactura.getDateValue() === null) {
                    aFilaJGasto2.Xref_1 = Utils.fnFormatearFechaFactura2(oIdFechaFactura.getValue()).replace(/-/gi, "");
                } else {
                    aFilaJGasto2.Xref_1 = Utils.fnFormatearFechaFactura1(oIdFechaFactura.getDateValue()).replace(/-/gi, "");
                }
                aFilaJGasto2.Xref_2 = oIdRuc.getValue();
                aFilaJGasto2.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
                aFilaJGasto2.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue(); //oIdRuc.getValue();
				aFilaJGasto2.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();
                aFilaJGasto2.Budat = Utils.fnFormatearFechaSAP(oFechCon.getValue()).replace(/-/gi, "");
                aFilaJGasto2.Hkont = oIdCuentaMyr.getValue();
                aFilaJGasto2.Wrbtr = aDetGasto2.Wrbtr;
                aFilaJGasto2.Waers = oIdMoneda.getValue();
        
                aFilaJGasto2.Imp_total = oIdImporteTotalGasto.getValue();
                // if (oIdCheckDevol.getSelected() === true) {
                // 	aFilaJGasto.Flag_dev = "X";
                // 	aFilaJGasto.Sgtxt_dev = oIdDevolucion.getValue();
                // } else {
                // 	aFilaJGasto.Flag_dev = "";
                // 	aFilaJGasto.Sgtxt_dev = "";
                // }
        
                // if (oIdCheckReembolso.getSelected() === true) {
                // 	aFilaJGasto2.Flag_reembolso = "X";
                // 	aFilaJGasto2.Sgtxt_dev = oIdReembolso.getValue();
                // } else {
                // 	aFilaJGasto2.Flag_reembolso = "";
                // 	aFilaJGasto2.Sgtxt_dev = "";
                // }
                aFilaJGasto2.Ztype = "G";
                aFilaJGasto2.Bukrs = InfoIas.Bukrs;
                //4 campos solo para la tabla
                aFilaJGasto2.oKostl = this.oVariablesJSONModel.getData().Kostl.name;
                aFilaJGasto2.oOperacion = oIdOperacion._getSelectedItemText().substr(7, 100);
                aFilaJGasto2.oCtaMyr = oIdCuentaMyr.getValue();
                aFilaJGasto2.oSerie = oIdSerie.getValue();
                aFilaJGasto2.oCorrelativo = oIdCorr.getValue();
                aFilaJGasto2.oIndImp = "0%";
        
                ///VALIDACION CADENA OPERACION
                if (aDetGasto1.Detalle.length > 40) {
                    aDetGasto1.Detalle = aDetGasto1.Detalle.substr(0, 40);
                };
                if (aDetGasto2.Detalle.length > 40) {
                    aDetGasto2.Detalle = aDetGasto2.Detalle.substr(0, 40);
                }
                ///
        
                if (aFilas.length === 0) {
                    aDetGasto1.Nrpos = "1";
                    aDetGasto2.Nrpos = "2";
                    aFilaJGasto1.Nposit = "1";
                    aFilaJGasto2.Nposit = "2";
                    var impTotal = parseFloat(aFilaJGasto1.Wrbtr) + parseFloat(aFilaJGasto2.Wrbtr);
                    impTotal = this.roundToTwo(impTotal);
        
                    //VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD
        
                    var iTotalSolicitud = this.getView().byId("idImporteS").getValue().replace(",", "");
                    iTotalSolicitud = parseFloat(iTotalSolicitud);
                    var iTotalDetalleGasto = impTotal;
                    iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);
        
                    if (iTotalDetalleGasto > iTotalSolicitud) {
                        MessageBox.error("Se ha excedido el importe Total de la Solicitud");
                        return;
                    }
        
                    //Validacion para cuando no ingresen importe gravado
                    if (aDetGasto1.Wrbtr != "0") {
                        aFilas.push(aFilaJGasto1);
                        aTablaDetGasto.push(aDetGasto1);
                    }
                    //Validacion para cuando no ingresen importe no gravado
                    if (aDetGasto2.Wrbtr != "0") {
                        if (aDetGasto1.Wrbtr == "0") {
                            aDetGasto2.Nrpos = aDetGasto1.Nrpos;
                            aFilaJGasto2.Nposit = aFilaJGasto1.Nposit;
                        }
                        aFilas.push(aFilaJGasto2);
                        aTablaDetGasto.push(aDetGasto2);
        
                    }
					var oModel = new JSONModel(aFilas);
					oModel.setSizeLimit(1000);
                    oTable.setModel(oModel);
                    oTable.getModel().refresh(true);
                    oIdImporteTotalGasto.fireChange({ value: impTotal });
                   // this.getView().byId("idImporteTotalIGV").setValue(impTotal);
                } else {
                    var sSuma = 0;
                    $.each(aFilas, function (key, value) {
                        sSuma += Number(value.Wrbtr);
                    });
                    sSuma = sSuma + Number(aFilaJGasto1.Wrbtr);
                    sSuma = sSuma + Number(aFilaJGasto2.Wrbtr);
                    sSuma = parseFloat(sSuma).toFixed(2);
                    var Nrpos = aFilas[aFilas.length - 1];
                    aDetGasto1.Nrpos = String(Number(Nrpos.Nposit) + 1);
                    aDetGasto2.Nrpos = String(Number(Nrpos.Nposit) + 2);
                    aFilaJGasto1.Nposit = String(Number(Nrpos.Nposit) + 1);
                    aFilaJGasto2.Nposit = String(Number(Nrpos.Nposit) + 2);
        
                    //VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD
        
                    var iTotalSolicitud = this.getView().byId("idImporteS").getValue().replace(",", "");
                    iTotalSolicitud = parseFloat(iTotalSolicitud);
                    var iTotalDetalleGasto = sSuma;
                    iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);
        
                    if (iTotalDetalleGasto > iTotalSolicitud) {
                        MessageBox.error("Se ha excedido el importe Total de la Solicitud");
                        return;
                    }
                    /********************************************************************/
        
                    if (aDetGasto1.Wrbtr != "0") {
                        aFilas.push(aFilaJGasto1);
                        aTablaDetGasto.push(aDetGasto1);
                    }
        
                    //Validacion para cuando no ingresen importe gravado
                    if (aDetGasto2.Wrbtr != "0") {
                        if (aDetGasto1.Wrbtr == "0") {
                            aDetGasto2.Nrpos = aDetGasto1.Nrpos;
                            aFilaJGasto2.Nposit = aFilaJGasto1.Nposit;
                        }
                        aFilas.push(aFilaJGasto2);
                        aTablaDetGasto.push(aDetGasto2);
                    }
					var oModel = new JSONModel(aFilas);
					oModel.setSizeLimit(1000);
                    oTable.setModel(oModel);
                    oTable.getModel().refresh(true);
                    oIdImporteTotalGasto.fireChange({ value: sSuma });
                   // this.getView().byId("idImporteTotalIGV").setValue(sSuma);
                }
        
                var aDetGDS1 = JSON.parse(JSON.stringify(aDetGasto1));
                var aDetGDS2 = JSON.parse(JSON.stringify(aDetGasto2));
                aDetGDS1.Imagen = this.getView().getModel("Documents").getData();
                aDetGDS2.Imagen = this.getView().getModel("Documents").getData();
                var aTDS = [];
                aTDS.push(aDetGDS1);
                aTDS.push(aDetGDS2);
                var documentos = [];
        
                $.each(aTablaDetGasto, function (key, value) {
                    documentos.push(value);
                });
        
				var oModel = new JSONModel(documentos);
				oModel.setSizeLimit(1000);
                this.getView().setModel(oModel, "DocumentsForPosition");
        
                oIdCorr.setValue("");
                oIdRuc.setValue("");
                oIdImportGravado.setValue("");
                oIdImportNoGravado.setValue("");
                oIdSerie.setValue("");
                oIdRazSoc.setValue("");
                this.getView().byId("idTipoDocS").setSelectedKey();
                this.getView().byId("idIndImp").setSelectedKey();
                oIdCuentaMyr.setValue("");
                this.getView().byId("idOperacion").setSelectedKey();
                //oIdPorcRetencion.setSelectedKey();
                //oIdImporteRetencion.setValue("");
                //oIdPorcDetraccion.setSelectedKey();
                //oIdImporteDetraccion.setValue("");
                //oIdFechaDetracccion.setValue("")
                //oIdNumConstancia.setValue("");
                oIdImportTotal.setValue("0");
                this.getView().byId("idImportTotalRecHon").setValue("0");
                this.getView().byId("idImportTotal").setValue("0");
                //this.getView().byId("IGV").setValue("0");
        
                // var oModelIndicadores = this.getView().getModel("oModelIndicadores");
                // var oDataIndicadores = oModelIndicadores.getData();
                // oDataIndicadores.VisibleIndicadorRet = false;
                // oDataIndicadores.VisibleIndicadorDet = false;
                // oDataIndicadores.VisiblePorcRet = false;
                // oDataIndicadores.VisibleImporteRet = false;
                // oDataIndicadores.VisiblePorcDet = false;
                // oDataIndicadores.VisibleImporteDet = false;
                // oDataIndicadores.VisibleFechaDet = false;
                // oDataIndicadores.VisibleConstancia = false;
        
                // oModelIndicadores.refresh();
               // this.obtenerTotales();
        
                this.fnChangeTxt();
                oIdFechaFactura.setDateValue(new Date());
                //oIdFechaFactura.setValue("");
                //	oIdCeco.setValue("");
        
                sap.ui.getCore().setModel(aFilas, "oJGasto");
                sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
                this.getView().getModel("Documents").setData([]);
        
            }
        },
		presionarBoleta: function (oEvent) {
			var aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto");
			var that = this;
			var oButton = oEvent.getSource();
			var oDetGasto = oButton.getParent().getBindingContext().getObject();
			var iPosicion = Number(oDetGasto.Nposit) - 1;
			this.getView().getModel("DocumentosBoleta").setData([]);
			var adj = aTablaDetGasto[iPosicion].Imagen;
			this.getView().getModel("DocumentosBoleta").setData(adj);
			$.estadoFiles = 2;
			if (that._dialogAttach) {
				that._dialogAttach = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.AttachBoleta", that);
				that.getView().addDependent(that._dialogAttach);
			}
			that._dialogAttach.open();
		},
		//se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
		llamada:function (text, bSolicitud = false ) { 
			var fin = Utils.codificarEntidad(text, bSolicitud);
			fin = Utils.decodificarEntidad(fin);
			return fin;
		},
		
		onChange: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var file = oEvent.getParameter("files")[0];
			var jsondataAdjunto;
			Utils.base64coonversionMethod(file).then(function (result) {
				jsondataAdjunto = {
					"LoioId": jQuery.now().toString(),
					"flagLogioId": true,
					"Descript": that.llamada(file.name, true).replace("." + Utils.getFileExtension(file.name), ""),
					"DocType": Utils.getFileExtension(file.name),
					"mimeType": file.type,
					"FileName": that.llamada(file.name, true),
					"Data": result
				};
				that.getView().getModel("Documents").getData().unshift(jsondataAdjunto);
				that.getView().getModel("Documents").refresh();
				that.getView().getModel("Documents").updateBindings(true);
			});
		},
		
		onChangeBoleta: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var file = oEvent.getParameter("files")[0];
			var jsondataAdjunto;
			Utils.base64coonversionMethod(file).then(function (result) {
				jsondataAdjunto = {
					"LoioId": jQuery.now().toString(),
					"flagLogioId": true,
					"Descript": that.llamada(file.name, true).replace("." + Utils.getFileExtension(file.name), ""),
					"DocType": Utils.getFileExtension(file.name),
					"mimeType": file.type,
					"FileName": that.llamada(file.name, true),
					"Data": result
				};
				that.getView().getModel("DocumentosBoleta").getData().unshift(jsondataAdjunto);
				that.getView().getModel("DocumentosBoleta").refresh();
				that.getView().getModel("DocumentosBoleta").updateBindings(true);
			});
		},
		
		onChangeDevolucion: function (oEvent) {
			var dataView = this.getView().getModel("DocumentsDevolucion").getData();
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var file = oEvent.getParameter("files")[0];
			//var file = oEvent.getParameter("files");
			var jsondataAdjunto;
			Utils.base64coonversionMethod(file).then(function (result) {
				jsondataAdjunto = {
					"LoioId": jQuery.now().toString(),
					"flagLogioId": true,
					"Descript": that.llamada(file.name).replace("." + Utils.getFileExtension(file.name), ""),//pguevarl - file.name.replace("." + that.getFileExtension(file.name), ""),
					"DocType": Utils.getFileExtension(file.name),
					"mimeType": file.type,
					"FileName": that.llamada(file.name),//pguevarl - file.name,
					"Data": result
				};
				that.getView().getModel("DocumentsDevolucion").getData().unshift(jsondataAdjunto);
				that.getView().getModel("DocumentsDevolucion").refresh();
				that.getView().getModel("DocumentsDevolucion").updateBindings(true);
			});
		},
		
		onPressItemDownload: function (oEvent) {
			var oSource = oEvent.getSource();
			var object = oSource.getBindingContext().getObject();

			var file_path = object.url;
			var a = document.createElement('A');
			a.href = file_path;
			a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		},
		
		fnBorraFilaGasto: function (oEvent) {
			var nameControl = oEvent.getSource().data("nameControl");
			var oFila = oEvent.getSource().getParent(),
				oTbl = this.getView().byId(nameControl),
				aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
				oDetGasto = oFila.getBindingContext().getObject(),
				iPosicionSeleccionada = Number(oDetGasto.Nposit) - 1,
				oImporteTotal = this.getView().byId("idImporteTotal");

			if (iPosicionSeleccionada !== -1) {
				oImporteTotal.fireChange({ value: oImporteTotal.getValue() - Number(aTablaDetGasto[iPosicionSeleccionada].Wrbtr) });
				var oModel = oTbl.getModel(),
					data = oModel.getData(),
					removed = data.splice(iPosicionSeleccionada, 1),
					removedDetGasto = aTablaDetGasto.splice(iPosicionSeleccionada, 1);
				// Check return value of data. // If data has an hierarchy. Ex: data.results 
				// var removed =data.results.splice(idx,1);
				oModel.setData(data);
			}

			var aDataPos = oTbl.getModel().getData(),
				iPosicion = 0;

			$.each(aDataPos, function (pos, ele) {
				iPosicion++;
				ele.Nposit = String(iPosicion);
			});
			oTbl.getModel().setData(aDataPos);

			var iPosicionG = 0;

			$.each(aTablaDetGasto, function (pos, ele) {
				iPosicionG++;
				ele.Nrpos = String(iPosicionG);
			});
			sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
		},
		
		fnEventoDevolucion: function () {
			var oInputDev = this.getView().byId("idDevolucion"),
				oCheckDev = this.getView().byId("idCheckDevol");
			var btnAdjDevolucion = this.getView().byId("btnAdjDevolucion");
			if (oCheckDev.getSelected() === true) {
				this.getView().byId("idCheckReembolso").setSelected(false);
				this.fnEventoReembolso();
				btnAdjDevolucion.setEnabled(true);
				oInputDev.setEditable(true);
			} else {
				oInputDev.setValue("");
				this.getView().getModel("DocumentsDevolucion").setData([]);
				btnAdjDevolucion.setEnabled(false);
				oInputDev.setEditable(false);
			}
		},
		
		fnEventoReembolso: function () {
			var oInputReem = this.getView().byId("idReembolso"),
				oCheckReem = this.getView().byId("idCheckReembolso");
			if (oCheckReem.getSelected() === true) {
				this.getView().byId("idCheckDevol").setSelected(false);
				this.fnEventoDevolucion();
				oInputReem.setEditable(true);
			} else {
				oInputReem.setValue("");
				oInputReem.setEditable(false);
			}
		},
		onFormatDecimal: function (oEvent) {
			var oInput = oEvent.getSource();
			var oValue = oEvent.getParameter("value");
			var sValue = Number.isNaN(oValue) ? "0" : oValue.toString();
			var aTemp = sValue.split(".");
			if (aTemp.length > 1) {
				oInput.setValue(aTemp[0] + "." + aTemp[1].padEnd(2, "0"));
			} else {
				oInput.setValue(sValue + ".00");
			}
		},
        addImporteTotal: function (oEvent) {
			var TipoDocSunat = this.getView().byId("idTipoDocS")._getSelectedItemText();

			//Validacion impuesto 0% y18%
			var idImportGravado = this.getView().byId("idImportGravado");
			var IndicadorImpuesto = this.getView().byId("idIndImp");

			if (IndicadorImpuesto._getSelectedItemText() == "0%") {
				idImportGravado.setEnabled(false);
				idImportGravado.setValue(0);
			} else if (IndicadorImpuesto._getSelectedItemText() == "10%" || IndicadorImpuesto._getSelectedItemText() == "18%") {
				idImportGravado.setEnabled(true);
			}

			//
			if (TipoDocSunat != "Recibo por Honorarios") {
				var sIndImpuesto = this.getView().byId("idIndImp")._getSelectedItemText().split("%")[0];
				var indImpuesto = parseFloat(sIndImpuesto);

				var sImportGravado = this.getView().byId("idImportGravado").getValue();
				var importGravado;
				if (!sImportGravado || sImportGravado == "") {
					importGravado = 0;
				} else {
					importGravado = parseFloat(sImportGravado);
				}

				var sImportNoGravado = this.getView().byId("idImportNoGravado").getValue();
				var importeNoGravado
				if (!sImportNoGravado || sImportNoGravado == "") {
					importeNoGravado = 0;
				} else {
					importeNoGravado = parseFloat(sImportNoGravado);
				}

				var ImporteTotal = importGravado + (importGravado * indImpuesto / 100) + importeNoGravado;
				ImporteTotal = this.roundToTwo(ImporteTotal);

				this.getView().byId("idImportTotal").fireChange({ value: ImporteTotal });
			} else {
				var sIndImpuesto = this.getView().byId("idIndImp")._getSelectedItemText().split("%")[0];
				var indImpuesto = parseFloat(sIndImpuesto);

				var sImporte = this.getView().byId("idImporteD").getValue();
				var importe;
				if (!sImporte || sImporte == "") {
					importe = 0;
				} else {
					importe = parseFloat(sImporte);
				}
				var ImporteTotal = importe + (importe * indImpuesto / 100);
				ImporteTotal = this.roundToTwo(ImporteTotal);

				this.getView().byId("idImportTotalRecHon").fireChange({ value: ImporteTotal });
			}

		},
		
		fnLimpiarCamposCrearGastos: function () {
			var oIdTipoDocS = this.getView().byId("idTipoDocS"),
				oIdCorr = this.getView().byId("idCorr"),
				oIdRuc = this.getView().byId("idRUC"),
				oIdIndImp = this.getView().byId("idIndImp"),
				oIdCuentaMyr = this.getView().byId("idCuentaMyr"),
				oIdImporteD = this.getView().byId("idImporteD"),
				oIdSerie = this.getView().byId("idSerie"),
				oIdRazSoc = this.getView().byId("idRazSoc"),
				oIdCheckDevol = this.getView().byId("idCheckDevol"),
				oIdCheckReembolso = this.getView().byId("idCheckReembolso"),
				oIdDevolucion = this.getView().byId("idDevolucion"),
				oIdReembolso = this.getView().byId("idReembolso"),
				oIdImporteTotal = this.getView().byId("idImporteTotal"),
				oIdFechaFactura = this.getView().byId("idFechaFactura"),
				oIdOperacion = this.getView().byId("idOperacion"),
				oIdImportGravado = this.getView().byId("idImportGravado"),
				oIdImportNoGravado = this.getView().byId("idImportNoGravado");

			oIdCorr.setValue("");
			oIdRuc.setValue("");
			oIdSerie.setValue("");
			oIdRazSoc.setValue("");
			oIdFechaFactura.setValue("");
			oIdImporteD.setValue("");
			//oIdCheckDevol.setSelected(false);
			oIdCheckReembolso.setSelected(false);
			oIdImporteTotal.fireChange({ value: "" });
			//oIdDevolucion.setValue("");
			oIdReembolso.setValue("");
			oIdReembolso.setEditable(false);
			oIdIndImp.setSelectedKey("C7");
			oIdImportGravado.setValue("");
			oIdImportNoGravado.setValue("");

			oIdCorr.setValueState("None");
			oIdRuc.setValueState("None");
			oIdIndImp.setValueState("None");
			oIdCuentaMyr.setValueState("None");
			oIdImporteD.setValueState("None");
			oIdSerie.setValueState("None");
			oIdRazSoc.setValueState("None");
			oIdFechaFactura.setValueState("None");
			oIdTipoDocS.setValueState("None");
			this.addImporteTotal();

			var oTable = this.getView().byId("idTablaDetGastos");
			var oModel = new JSONModel([]);
			oModel.setSizeLimit(1000);
			oTable.setModel(oModel);

			//LIMPIAR ADJUNTOS
			var oModelAdj = this.getView().getModel("Documents");
			oModelAdj.setData([]);
		},

		onCrearNuevoGasto: function (Bevent) {
			//Validar montoSolicitud igual al Monto de Gasto
			var importeGasto = this.getView().byId("idImporteTotal").getValue();
			importeGasto = parseFloat(importeGasto);
			var importeSolicitud = this.getView().byId("idImporteS").getValue().replace(",", "");
			importeSolicitud = parseFloat(importeSolicitud);

			var checkReembolso = this.getView().byId("idCheckReembolso").getSelected();

			if (importeGasto != importeSolicitud) {
				if (!checkReembolso) {
					Utils.showMessageBox("El importe total del gasto debe ser igual al importe total de la solicitud", "warning");
					return;
				}
			}

			//bloquear boton 
			this.getView().byId("btnGrabar").setEnabled(false);

			//Verifica si existe aprobador del primer nivel
			var that = this;
			/********* Obteniene lista de aprobadores desde SAP ********/
			var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
			var InfoIas = sap.ui.getCore().getModel("InfoIas");

			if (oModelDetailDocument.Kstrg.split(" - ")[0] == "K") {
				that.tablaFiltro = "CSKS";
				that.campoFiltro = "KOSTL";
				that.Plans = oModelDetailDocument.Kostl;
			} else if (oModelDetailDocument.Kstrg.split(" - ")[0] == "F") {
				that.tablaFiltro = "COBL";
				that.campoFiltro = "AUFNR";
				that.Plans = oModelDetailDocument.Aufnr;
			}
			var query = "/zinaprobadoresSet(" +
				"Bukrs='" + InfoIas.Bukrs + "'," +
				"Prcid='" + that.proceso + "'," +
				"Rulid='" + that.regla + "'," +
				"Tskid='" + that.GastoPrimerNivelAprob + "'," +
				"Tabname='" + that.tablaFiltro + "'," +
				"Fieldname='" + that.campoFiltro + "'," +
				"Value='" + that.Plans + "'," +
				"Isfound=false," +
				"TabSearch='" + that.tablaBuscada + "'," +
				"FieldSearch='" + that.campoBuscado +
				"')/zaprobadoresmultout";
			console.log(query)
			that.getView().setBusyIndicatorDelay(0);
			that.getView().setBusy(true);
			this.getOwnerComponent().getModel("oUtilitiesModel").read(query, {
				success: function (res) {
					that.getView().setBusy(false);
					if (res.results !== undefined) {
						if (true) {
                        //    if (res.results.length > 0) {
							console.log("APROBADOR PRIMER NIVEL")
							//console.log(res.results[0].Low)
							//that.Nivel = res.results[0].nroniveles;
							that.fnGrabarGasto();
							//that.grabarNuevoGasto(); //Primero verifica si tiene aprobadores de segundo nivel

						} else {
							Utils.showMessageBox(that.getI18nText("appSinAprobadorSegundoNivel"), "error");
							that.getView().byId("btnGrabar").setEnabled(true);
						}
					}
				},
				error: function (err) {
					that.getView().setBusy(false);
					var msj = that.getI18nText("appErrorMsg");
					Utils.showMessageBox(msj, "error");
					that.getView().byId("btnGrabar").setEnabled(true);
				}
			});
		},

		grabarNuevoGasto: function () {
			//Verifica si existe aprobador del segundo nivel
			var that = this;
			/********* Obteniene lista de aprobadores desde SAP ********/
			var InfoIas = sap.ui.getCore().getModel("InfoIas");
			var query = "/zinaprobadoresSet(" +
				"Bukrs='" + InfoIas.Bukrs + "'," +
				"Prcid='" + that.proceso + "'," +
				"Rulid='" + that.regla + "'," +
				"Tskid='" + that.GastoSegundoNivelAprob + "'," +
				"Tabname='" + that.tablaFiltro + "'," +
				"Fieldname='" + that.campoFiltro + "'," +
				"Value='" + that.Plans + "'," +
				"Isfound=false," +
				"TabSearch='" + that.tablaBuscada + "'," +
				"FieldSearch='" + that.campoBuscado +
				"')/zaprobadoresmultout";
			console.log(query)
			that.getView().setBusyIndicatorDelay(0);
			that.getView().setBusy(true);
			this.getOwnerComponent().getModel("oUtilitiesModel").read(query, {
				success: function (res) {
					that.getView().setBusy(false);
					if (res.results !== undefined) {
						if (res.results.length > 0) {
							console.log("APROBADOR SEGUNDO NIVEL")
							console.log(res.results[0].Low)
							that.fnGrabarGasto(); //llama a la creación del gasto
						} else {
							Utils.showMessageBox(that.getI18nText("appSinAprobadorSegundoNivel"), "error");
						}
					}
				},
				error: function (err) {
					that.getView().setBusy(false);
					var msj = that.getI18nText("appErrorMsg");
					Utils.showMessageBox(msj, "error");
				}
			});
		},

		fnGrabarGasto: function () {
			var aFilaGrabaGasto = {},
				oThes = this,
				aJSolicitud = {},
				oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument"),
				oModelMaster = oThes.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oJGasto = this.getView().byId("idTablaDetGastos").getModel().getData(),
				InfoIas = sap.ui.getCore().getModel("InfoIas"),
				oFecDoc = this.getView().byId("idFecha"),
				oIdImporteTotal = this.getView().byId("idImporteTotal"),
				idImporteD = this.getView().byId("idImporteD"),
				idImporteS = this.getView().byId("idImporteS"),
				oidCheckDevol = this.getView().byId("idCheckDevol"),
				oIdCheckReembolso = this.getView().byId("idCheckReembolso"),
				oIdDevolucion = this.getView().byId("idDevolucion"),
				oIdReembolso = this.getView().byId("idReembolso"),
				FechCon = this.getView().byId("idFechaCont"),
				oTableCrearGasto = this.getView().byId("idTablaDetGastos");
			var oTableGastoWorkflow = [];
			oTableGastoWorkflow = Utils.cloneObj(this.getView().byId("idTablaDetGastos").getModel().getData());

			//this.getView().setModel(new JSONModel(oBtnDevolucion.getModel("DocumentsDevolucion").getData()),"DocumentsForPosition");
			if (oTableCrearGasto.getModel().getData().length <= 0) {
				var msj = "Debe agregar al menos una fila.";
				Utils.showMessageBox(msj, "warning");
				//LR 27/12
				this.getView().byId("btnGrabar").setEnabled(true);
				return;
			}
			///JORDAN SPRINT 3 COMENTADO//////////
			// if (Number(idImporteS.getValue()) > Number(oIdImporteTotal.getValue())) {
			// 	if (oIdDevolucion.getValue() === "") {
			// 		var msj = "Debe seleccionar el checkbox y agregar una devolución.";
			// 		Utils.showMessageBox(msj, "warning");
			// 		//LR 27/12
			// 		this.getView().byId("btnGrabar").setEnabled(true);
			// 		return;
			// 	}
			// }
			////////////////
			if (Number(idImporteS.getValue()) < Number(oIdImporteTotal.getValue())) {
				if (!oIdCheckReembolso.getSelected()) {
					var msj = "Debe seleccionar el checkbox de reembolso.";
					Utils.showMessageBox(msj, "warning");
					//LR 27/12
					this.getView().byId("btnGrabar").setEnabled(true);
					return;
				}
			}
			// for (var contador = oJGasto.length; contador > 1; contador--) {
			// 	oJGasto.splice(contador, 1);
			// }

			this.getView().byId("btnGrabar").setEnabled(false);
			var idTipoObj = this.getView().byId("idTipoObj").getValue();
			aJSolicitud.Zflag = "";
			aJSolicitud.Zcat = oModelDetailDocument.Zcat;
			aJSolicitud.Zcat_Text = oModelDetailDocument.ZcatText;
			aJSolicitud.Ztyp = "S";
			aJSolicitud.Wrbtr = oModelDetailDocument.Wrbtr;
			aJSolicitud.Tax_code = "";
			aJSolicitud.Kunnr = "";
			aJSolicitud.Hkont = oModelDetailDocument.Hkont;
			aJSolicitud.Xblnr = oModelDetailDocument.Xblnr;
			aJSolicitud.Waers = oModelDetailDocument.Waers;
			aJSolicitud.Bktxt = (InfoIas.Pname).slice(0, 25);
			aJSolicitud.Sgtxt = "";
			aJSolicitud.Xref_1 = "";
			aJSolicitud.Zuonr = "";
			aJSolicitud.Budat = Utils.fnFormatearFechaSAP(FechCon.getValue()).replace(/-/gi, "");
			aJSolicitud.Bldat = Utils.fnFormatearFechaSAP(oFecDoc.getValue()).replace(/-/gi, "");
			aJSolicitud.Kostl = oModelDetailDocument.Kostl;
			aJSolicitud.Segment = "";
			aJSolicitud.Parked_document = oModelDetailDocument.ParkedDocument;
			aJSolicitud.Flag_rev = "";
			aJSolicitud.Rev_document = "";
			aJSolicitud.Doc_asoc = "";
			aJSolicitud.Light = "";
			aJSolicitud.Kstrg = idTipoObj.split(" ")[0];
			aJSolicitud.Aufnr = oModelDetailDocument.Aufnr;
			aJSolicitud.Zobserv = oModelDetailDocument.Zobserv;
			aJSolicitud.Eratx = oModelDetailDocument.Eratx;

			sap.ui.getCore().setModel(oTableGastoWorkflow, "oTableGastoWorkflow");
			$.each(oJGasto, function (key, value) {
				//LR 12/12/19
				//pguevarl - comenté esto ya que algunos docsunat permiten tener más de 9 dígitos
				/*if ((value.oCorrelativo).length > 8){
					var msjs = "Cantidad de dígitos mayor a la permitida";
					MessageToast.show(msjs);
					return;
				}*/
				///JORDAN SPRIN 3 Comentado
				// if (oidCheckDevol.getSelected() === true) {
				// 	value.Flag_dev = "X";
				// 	value.Sgtxt_dev = oIdDevolucion.getValue();
				// 	delete value.oOperacion;
				// 	delete value.oCtaMyr;
				// 	delete value.oSerie;
				// 	delete value.oCorrelativo;
				// 	delete value.oIndImp;
				// } else {
				// 	value.Flag_dev = "";
				// 	delete value.oOperacion;
				// 	delete value.oCtaMyr;
				// 	delete value.oSerie;
				// 	delete value.oCorrelativo;
				// 	delete value.oIndImp;
				// }
				////////////////////
				if (oIdCheckReembolso.getSelected() === true) {
					value.Flag_reembolso = "X";
					value.Sgtxt_dev = oIdReembolso.getValue();
					delete value.oOperacion;
					delete value.oCtaMyr;
					delete value.oSerie;
					delete value.oCorrelativo;
					delete value.oIndImp;
				} else {
					value.Flag_reembolso = "";
					delete value.oOperacion;
					delete value.oCtaMyr;
					delete value.oSerie;
					delete value.oCorrelativo;
					delete value.oIndImp;
				}

			});
			//Fila a mandar hacia la cabecera de Gasto
			aFilaGrabaGasto.Bukrs = oModelDetailDocument.Bukrs;
			aFilaGrabaGasto.Hkont = oModelDetailDocument.Hkont;
			aFilaGrabaGasto.JSolicitud = JSON.stringify(aJSolicitud);
			aFilaGrabaGasto.Belnr = oModelDetailDocument.ParkedDocument;
			aFilaGrabaGasto.JGasto = JSON.stringify(oJGasto);
			aFilaGrabaGasto.Txt50 = "";
			aFilaGrabaGasto.Gjahr = oModelDetailDocument.Gjahr;
			aFilaGrabaGasto.Usnam = InfoIas.Sysid;
			aFilaGrabaGasto.Zfondo = oModelDetailDocument.Zfondo;
			aFilaGrabaGasto.Blart = oModelDetailDocument.Blart;
			aFilaGrabaGasto.Budat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oModelDetailDocument.Budat)) + "T00:00:00";
			aFilaGrabaGasto.Bldat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oModelDetailDocument.Bldat)) + "T00:00:00";
			aFilaGrabaGasto.BktxtSol = oModelDetailDocument.BktxtSol;
			aFilaGrabaGasto.BktxtDoc = oModelDetailDocument.BktxtDoc;
			aFilaGrabaGasto.Xblnr = oModelDetailDocument.Xblnr;
			aFilaGrabaGasto.Zcat = oModelDetailDocument.Zcat;
			aFilaGrabaGasto.Type = "G";
			aFilaGrabaGasto.Waers = oModelDetailDocument.Waers;
			aFilaGrabaGasto.Wrbtr = oIdImporteTotal.getValue();
			aFilaGrabaGasto.Status = oModelDetailDocument.Status;
			aFilaGrabaGasto.Augbl = "";
			aFilaGrabaGasto.Augdt = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(new Date(), false)) + "T00:00:00";
			aFilaGrabaGasto.Xreverse = oModelDetailDocument.Xreverse;
			aFilaGrabaGasto.Bukrss = "";
			aFilaGrabaGasto.Kstrg = idTipoObj.split(" ")[0];

			sap.ui.core.BusyIndicator.show(0);
			oModelMaster.create("/GastoSet", aFilaGrabaGasto, {
				success: function (oData, oResponse) {
					// Success
					// oThes.fnSubirArchivosDevolucion(oData);
					oThes.fnGrabarDetalleGasto(oData);
					sap.ui.getCore().setModel(oData, "aRespuestaGasto");
				},
				error: function (oError) {
					// Error
					sap.ui.core.BusyIndicator.hide();
					if (oError.responseText !== "") {
						var txt = "Ocurrió un error en SAP.\n\n" + JSON.parse(oError.responseText).error.message.value + "\n" +
							JSON.parse(oError.responseText).error.code;
						MessageBox.error(txt);
					} else {
						MessageBox.error("Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas.");
					}
				}

			});
		},
		
		fnSubirArchivosDevolucion: function (gasto) {
			var fileDevolucion = sap.ui.getCore().getModel("devolucion"),
				fileUploadImagenesDevolucion = sap.ui.getCore().getModel("fileUploadImagenesDevolucion"),
				oThes = this,
				sIdGasto = "";

			//	fileUploadImagenesDevolucion[0] = fileDevolucion.Imagen;

			sIdGasto = "" + gasto.Belnr + gasto.Bukrs + gasto.Gjahr;
			var param = [];
			param.Belnr = gasto.Belnr;
			param.Bukrs = gasto.Bukrs;
			param.Gjahr = gasto.Gjahr;

			oThes.fnImportDevolucion(param);
		},
		
		fnImportDevolucion: function (oEvent) {
			var route = sap.ui.getCore().getModel("route");
			var gasto = oEvent.Belnr + "" + oEvent.Bukrs + oEvent.Gjahr;
			this.gastDS2 = gasto;
			var aFiles = this.getView().getModel("DocumentsForPosition").getData();
			//	aFiles = JSON.parse(JSON.stringify(aFiles));
			var aFilesDev = this.getView().getModel("DocumentsDevolucion").getData();
			//aFilesDev = JSON.parse(JSON.stringify(aFilesDev));
			var pathSegments = [];
			var oDictionary = {
				ambiente: undefined,
				app: undefined,
				ruc: undefined,
				tipo: undefined,
				nrosolicitud: undefined,
				posicion: {}
			};
			var aFilesDS = [];
			for (var i = 0; i < aFiles.length; i++) {

				aFiles[i].path = $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + gasto +
					"/" + aFiles[i].Nrpos;
				for (var j = 0; j < aFiles[i].Imagen.length; j++) {
					var file = aFiles[i].Imagen[j];
					var oFilesDS = {};
					oFilesDS.name = file.FileName;
					oFilesDS.path = aFiles[i].path;
					oFilesDS.BlobFile = file.Data;
					aFilesDS.push(oFilesDS);
				}

				pathSegments.push({
					path: aFiles[i].path,
					name: aFiles[i].Nrpos,
					posicion: aFiles[i].Nrpos,
					type: "posicion"

				});

				oDictionary.posicion[aFiles[i].Nposit] = undefined;

			}

			pathSegments.push({
				path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + gasto,
				name: gasto,
				posicion: undefined,
				type: "nrosolicitud"
			});

			pathSegments.push({
				path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "GASTOS",
				name: "GASTOS",
				posicion: undefined,
				type: "tipo"
			});

			pathSegments.push({
				path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR",
				name: "ENTREGASRENDIR",
				posicion: undefined,
				type: "app"
			});

			pathSegments.push({
				path: $.ambiente + "/" + route.carpetaSociedad,
				name: route.carpetaSociedad,
				posicion: undefined,
				type: "ruc"
			});

			//oDictionary.RI = undefined;

			pathSegments.push({
				path: $.ambiente,
				name: $.ambiente,
				posicion: undefined,
				type: "ambiente"

			});
			
			var that = this;
			DS.sendFiles(pathSegments, aFilesDS, oDictionary, that).then(function (sResolve) {
				jQuery.sap.log.info(sResolve);
				if (aFilesDev.length > 0) {
					pathSegments = [];
					oDictionary = {
						ambiente: undefined,
						app: undefined,
						ruc: undefined,
						tipo: undefined,
						nrosolicitud: undefined
					};
					for (var i = 0; i < aFilesDev.length; i++) {

						aFilesDev[i].path = $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "DEVOLUCION" + "/" + that.gastDS2;

						aFilesDev[i].name = aFilesDev[i].FileName;
						aFilesDev[i].BlobFile = aFilesDev[i].Data;
					}

					pathSegments.push({
						path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "DEVOLUCION" + "/" + that.gastDS2,
						name: that.gastDS2,
						posicion: undefined,
						type: "nrosolicitud"
					});

					pathSegments.push({
						path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "DEVOLUCION",
						name: "DEVOLUCION",
						posicion: undefined,
						type: "tipo"
					});

					pathSegments.push({
						path: $.ambiente + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR",
						name: "ENTREGASRENDIR",
						posicion: undefined,
						type: "app"
					});

					pathSegments.push({
						path: $.ambiente + "/" + route.carpetaSociedad,
						name: route.carpetaSociedad,
						posicion: undefined,
						type: "ruc"
					});

					//oDictionary.RI = undefined;

					pathSegments.push({
						path: $.ambiente,
						name: $.ambiente,
						posicion: undefined,
						type: "ambiente"

					});

					DS.sendFiles(pathSegments, aFilesDev, oDictionary, that).then(function (sResolve2) {
						jQuery.sap.log.info(sResolve2);
						that.getView().getModel("DocumentsDevolucion").setData([]);
					}).catch(function (sError2) {
						jQuery.sap.log.error(sError2);
						sap.ui.core.BusyIndicator.hide();
					});
				}
			}).catch(function (sError) {
				jQuery.sap.log.error(sError);
				sap.ui.core.BusyIndicator.hide();
			});

		},

		fnSubirObservacionDS: function (oEntrada) {
			var oThat = this;
			return new Promise((resolve, reject) => {
				var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
				var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
				const sSolicitud = oEntrada.Belnr + oEntrada.Bukrs + oEntrada.Gjahr;
				var aFiles = this.getView().getModel("DocumentsForPosition").getData();
				const sPath = `${oParametersModel.AMBIENTE}/${oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === oEntrada.Bukrs
				}).valueHigh}/${oVariablesGlobales.carpetaEntregasRendir}/${oVariablesGlobales.carpetaGasto}/${sSolicitud}`;
		
				sap.ui.core.BusyIndicator.show(0);
				function uploadFilesForPosition(index, that) {
					var oPosition = aFiles[index];
					var sPositionPath = `${sPath}/${oPosition.Nrpos}`;
					// Create folder
					EverisUtils.sharepoint.createFolderDeep(sPositionPath).then(() => {
						const aFilesToUpload = oPosition.Imagen.map((oFile) => {
							return {
								folderName: "",
								fileName: oFile.FileName,
								data: oFile.Data,
								size: oFile.Data.size,
							};
						});
			
						// Upload files
						return EverisUtils.sharepoint.saveFiles(sPositionPath, aFilesToUpload);
					}).then((sResolve) => {
						index = index + 1;
						if (aFiles.length === index) {
							MessageToast.show(that.getI18nText("msgSharepointSuccess"));
							// Start Workflow
							that.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve); // TODO: Sirve???
							sap.ui.getCore().setModel(oEntrada, "aRespuestaGasto");
							resolve();
							// this.fnWorkFlow(oEntrada, "S");
						} else {
							uploadFilesForPosition(index, that);
						}
					}).catch((error) => {
						console.error("[CC] MasterDetalleFF.controller - fnSubirObservacionDS", error);
						MessageBox.error("No se pudieron subir los archivos. Error: " + error.message);
						sap.ui.core.BusyIndicator.hide();
						reject();
					});
				}
				uploadFilesForPosition(0, oThat);
			});
        },

		uploadArchiveLink: function (oDocument) {
			var that = this;
			return new Promise((resolve, reject) => {
				var oModelEntregaRendir = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
				var aFiles = that.getView().getModel("DocumentsForPosition").getData();
				var aFilesTobeConverted = [];
				var aFileIndex = [];
				aFiles.forEach((oPosition, posIndex) => {
					oPosition.Imagen.forEach((oFile, fileIndex) => {
						aFileIndex.push([posIndex, fileIndex]);
						aFilesTobeConverted.push(Utils.blobToBase64String(oFile.Data));
					});
				});
				BusyIndicator.show(0);
				Promise.all(aFilesTobeConverted).then((aBase64String) => {
					var oArchiveLinkPayload = {
						Bukrs: oDocument.Bukrs,
						Belnr: oDocument.Belnr,
						Gjahr: oDocument.Gjahr,
						Modulo: "FI",
						ArchiveDocSet: []
					};
					aBase64String.forEach((sBase64String, index) => {
						var oFile = aFiles[aFileIndex[index][0]].Imagen[aFileIndex[index][1]];
						var sFileName = oFile.FileName;
						var sFileExtension = oFile.DocType.toUpperCase();
						oArchiveLinkPayload.ArchiveDocSet.push({
							Bukrs: oDocument.Bukrs,
							Belnr: oDocument.Belnr,
							Gjahr: oDocument.Gjahr,
							Bas64: sBase64String.split(",")[1],
							Exten: sFileExtension,
							Nombre: sFileName,
							Return: ""
						});
					});
					oModelEntregaRendir.create("/ArchiveHeaderSet", oArchiveLinkPayload, {
						success: function (oResponse) {
							console.log(oResponse);
							MessageToast.show(that.getI18nText("msgArchiveLinkSuccess"));
							that.getView().getModel("DocumentsForPosition").setData([]);
							BusyIndicator.hide();
							resolve();
						},
						error: function (oError) {
							console.error("[ArchiveLink - Carga SAP]", oError);
							MessageBox.error(that.getI18nText("msgArchiveLinkError"));
							reject();
						}
					});
				}).catch((oError) => {
					console.error("[ArchiveLink - Conversión Blob]", oError);
					MessageBox.error(that.getI18nText("msgArchiveLinkError"));
					reject();
				});
			});
		},

		fnGrabarDetalleGasto: function (oData) {
			var aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			oVariablesGlobales.Flag = 0;

			$.each(aTablaDetGasto, function (key, value) {
				value.Nrpos = String(value.Nrpos);
				value.Belnr = oData.Belnr;
				value.Bukrs = oData.Bukrs;
				value.Gjahr = oData.Gjahr;
				value.Blart = oData.Blart;
			});
			this.fnServicioGrabarDetalleGasto(aTablaDetGasto);
		},

		fnServicioGrabarDetalleGasto: function (aTablaDetGasto) {
			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
				oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				aFilaDetGasto = {};

			var aEntrada = aTablaDetGasto[oVariablesGlobales.Flag];
			aFilaDetGasto = aEntrada;
			sap.ui.getCore().setModel(aFilaDetGasto, "aFilaDetGasto");
			var imagen = aEntrada.Imagen;
			delete aEntrada.Imagen;
			delete aEntrada.path;
            aEntrada.DetracDats = aEntrada.Budat;
			BusyIndicator.show(0);
			oModelMaestroSolicitudes.create("/DetGastoSet", aEntrada, {
				success: function (oData, oResponse) {
					oVariablesGlobales.Flag++;
					if (oVariablesGlobales.Flag === aTablaDetGasto.length) {
						oVariablesGlobales.Flag = 0;
						aEntrada.Imagen = imagen;
						oThes.fnWorkflow(aEntrada).then(() => {
							return oThes.fnSubirObservacionDS(aEntrada);
						}).then(() => {
							return oThes.uploadArchiveLink(aEntrada);
						}).then(() => {
							oThes.fnLimpiarCamposCrearGastos();
							MessageBox.success("Se ha registrado el gasto " + aEntrada.Belnr + ".", {
								actions: [MessageBox.Action.OK],
								emphasizedAction: MessageBox.Action.OK,
								onClose: function (sAction) {
									BusyIndicator.hide();
									window.history.go(-1);
								}
							});
						}).catch((error) => {
							console.log(error);
							BusyIndicator.hide();
						});
					} else {
						aEntrada.Imagen = imagen;
						oThes.fnServicioGrabarDetalleGasto(aTablaDetGasto);
					}
				},
				error: function (oError) {
					console.log(oError);
					var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
					Utils.showMessageBox(msj, "error");
					BusyIndicator.hide();
					return;
				}
			});
		},
		
		fnSubirArchivos: function () {
			var aFilaDetGasto = sap.ui.getCore().getModel("aFilaDetGasto"),
				fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes"),
				oThes = this,
				sIdGasto = "";

			if (aFilaDetGasto.Imagen === null || typeof (aFilaDetGasto.Imagen) === "undefined") {
				return;
			} else {
				fileUploadImagenes[0] = aFilaDetGasto.Imagen;
				sIdGasto = "" + aFilaDetGasto.Belnr + aFilaDetGasto.Bukrs + aFilaDetGasto.Gjahr;
				var param = [];
				param.Belnr = aFilaDetGasto.Belnr;
				param.Bukrs = aFilaDetGasto.Bukrs;
				param.Gjahr = aFilaDetGasto.Gjahr;

				oThes.fnImport(param);
			}
		},
		
		fnImport: function (dt) {
			var thes = this;
			var ambiente = sap.ui.getCore().getModel("ambiente");
			var idrepositorio = sap.ui.getCore().getModel("idrepositorio");
			var carpetaP = sap.ui.getCore().getModel("carpetaP");
			var fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");
			var route = sap.ui.getCore().getModel("route");
			var sDireccion = false;

			var sUrl = "/cmis/" + idrepositorio + "/root/" + ambiente + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02;
			var sUrlplus = dt.Belnr + dt.Bukrs + dt.Gjahr; //sNumeroDoc+sSociedad+sEjercicio
			console.log(sUrl)
			console.log(sUrlplus)
			var status;
			var sDataFolder = Utils.oListarCarpetas(sUrl);
			$.each(sDataFolder, function (idex, item) {
				if (!status) {
					if (sUrlplus === item.folderName) {
						sDireccion = sUrl + "/" + sUrlplus;
						status = true;
					} else {
						sDireccion = false;
					}
				}
			});
			if (sDireccion === false) {
				sDireccion = Utils.oCrearSubCarpetas(sUrl, sUrlplus);
			}

			var count = Utils.oListarCarpetas(sDireccion);
			var namefile = "";
			namefile = "detalle_gasto_" + (count.length + 1);
			var data = {
				"propertyId[0]": "cmis:objectTypeId",
				"propertyValue[0]": "cmis:document",
				"propertyId[1]": "cmis:name",
				"propertyValue[1]": namefile,
				"cmisaction": "createDocument"
			};

			var formData = new FormData();
			formData.append('datafile', fileUploadImagenes[0]);
			jQuery.each(data, function (key, value) {
				formData.append(key, value);
			});

			$.ajax(sDireccion, {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (response) {
					sap.ui.core.BusyIndicator.hide();
					fileUploadImagenes = [];
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + error.responseJSON.message);
				}
			});
		},
		
		fnWorkflow: function (oData) {
			var that = this;
			BusyIndicator.show(0);
			return new Promise((resolve, reject) => {
				$.ajax({
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/xsrf-token",
					method: "GET",
					async: false,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					success: function (result, xhr, data) {
						let sToken = data.getResponseHeader("X-CSRF-Token");
						that.fnStartInstanceG(sToken, oData).then(() => {
							resolve();
						}).catch((error) => {
							console.log(error);
					  		reject();
						});
					},
					error: function (error) {
					  console.log(error);
					  reject();
					}
				});
			});
		},

		fnStartInstanceG: function (token, oData) {
            var that = this;
			return new Promise((resolve, reject) => {
				var oFormData = that.byId("idCabGasto").getModel().getData();
				var oModelDetailDocument = that.getOwnerComponent().getModel("oModelDetailDocument");
				var aTablaDetGasto = sap.ui.getCore().getModel("oTableGastoWorkflow"),
					aData = {},
					InfoIas = sap.ui.getCore().getModel("InfoIas");
				that.oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
				aData.Nivel = 1;
				aData.NombreDocumento = "Rendición";
				aData.Bukrs = oData.Bukrs;
				aData.Belnr = oData.Belnr;
				aData.Gjahr = oData.Gjahr;
				aData.Prcid = that.proceso;
				aData.Rulid = that.regla;
				aData.Iskid = that.GastoPrimerNivelAprob;
				aData.IskidL2 = that.GastoSegundoNivelAprob;
				aData.IskidL3 = that.GastoTercerNivelAprob;
				aData.Tabname = that.tablaFiltro;
				aData.Fieldname = that.campoFiltro;
				aData.Pname = InfoIas.Pname;
				aData.Value = that.Plans;
				aData.Isfound = false;
				aData.Tabname_search = that.tablaBuscada;
				aData.Fieldname_search = that.campoBuscado;
				aData.Usuario = InfoIas.Sysid;
				aData.Fecha = Utils.fnFormatearFechaVista(new Date(), false);
				var sImporteRendido = that.getView().byId("idImporteTotal").getValue();
				var sMoneda = that.getView().byId("idWaers").getValue();
				var sImporteSolicitud = that.getView().byId("idImporteS").getValue().replace(",", "");
				aData.ImporteTotal = sImporteRendido + " " + sMoneda; //Importe de solicitud
				aData.ImporteRendido = sImporteRendido + " " + sMoneda;
				aData.hasReembolsoDevolucion = false;
				var oIdCheckDevol = that.getView().byId("idCheckDevol"),
					oIdCheckReembolso = that.getView().byId("idCheckReembolso");
				sImporteSolicitud = parseFloat(sImporteSolicitud).toFixed(2);
				sImporteRendido = parseFloat(sImporteRendido).toFixed(2);
				var anio, mes, dia;
				$.each(aTablaDetGasto, function (key, value) {
					anio = (value.Bldat).substr(0, 4);
					mes = (value.Bldat).substr(4, 2);
					dia = (value.Bldat).substr(6, 2);
					value.Bldat = dia + '/' + mes + '/' + anio;
				});
				aData.DetalleSol = aTablaDetGasto;
				aData.CorporativeEmail = InfoIas.CorporativeEmail;
				aData.PersonalEmail = InfoIas.PersonalEmail;
				aData.Type = "G";
				aData.identificadorAplicacion = "Entregas a Rendir";

				var sOperacion = that.getView().byId("idOperacionCab").getValue();
				aData.Operacion = sOperacion;
				if (oFormData.FlagAdicional) {
					aData.FlagAdicional = true;
					aData.Eratx = oFormData.Eratx;
				} else {
					aData.FlagAdicional = false;
				}
				aData.Moneda = sMoneda;
				var sReferenciaGeneral = that.getView().byId("idReferencia").getValue();
				aData.ReferenciaGeneral = sReferenciaGeneral;
				var sTipoObj = that.getView().byId("idTipoObj").getValue().split(" - ")[0];
				if (sTipoObj == "F") {
					aData.Aufnr = that.getView().byId("idObjCost").getValue();
					aData.Kostl = "";
				} else {
					aData.Aufnr = "";
					aData.Kostl = that.getView().byId("idObjCost").getValue();
				}
				aData.Kstrg = that.getView().byId("idTipoObj").getValue();
				aData.Zobserv = oModelDetailDocument.Zobserv;
				BusyIndicator.show(0);
				$.ajax({
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/workflow-instances",
					method: "POST",
					async: false,
					contentType: "application/json",
					headers: {
						"X-CSRF-Token": token
					},
					data: JSON.stringify({
						definitionId: "aprobarentregarendir",
						context: aData
					}),
					success: function (result, xhr, data) {
						if (result.status === "RUNNING") {
							console.log("Solicitud Enviada");
							var oActualizarWorkflowId = {};
							oActualizarWorkflowId.IdWorkflow = result.id;
							oActualizarWorkflowId.Ztyp = "U";
							that.oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + aData.Bukrs + "',ParkedDocument='" + aData.Belnr + "',Gjahr='" +
								aData.Gjahr + "')", oActualizarWorkflowId, {
								success: function () {
									console.log("Se actualizó id de workflow");
									MessageToast.show(that.getI18nText("msgWorkflowSuccess"));
									BusyIndicator.hide();
									resolve();							
								},
								error: function () {
									console.log(error);
									console.log("No se actualizó id de workflow");
									MessageBox.error(that.getI18nText("msgWorkflowError"));
									reject();
								}
							});
						} else {
							console.log("No se envio la solicitud");
							MessageBox.error(that.getI18nText("msgWorkflowError"));
                			reject();
						}
					}
				});
			});
		},
		
		doNavigateSolicitud: function (sRouteName, oModelDocument, fnPromiseResolve, sViaRelation) {
			this.oRouter.navTo(sRouteName, {
				Bukrs: oModelDocument.Bukrs,
			    Belnr: oModelDocument.ParkedDocument,
				Gjahr: oModelDocument.Gjahr
			}, false);

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		
		onIrDetalleSolicitud: function () {
			this.fnLimpiarCamposCrearGastos();
			// var oModelDetailDocument = this.getOwnerComponent().getModel("oModelDetailDocument");
			// return new Promise(function (fnResolve) {
			// 	this.doNavigateSolicitud("detailRendicionER", oModelDetailDocument, fnResolve, "");
			// }.bind(this)).catch(function (err) {
			// 	if (err !== undefined) {
			// 		sap.m.MessageBox.error(err.message);
			// 	}
			// });
			window.history.go(-1);
		},
	});
});