sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/everis/monitorDocumentos/controller/baseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
    "sap/m/MessageToast",
	"com/everis/monitorDocumentos/controller/Workflow",
	"sap/ui/core/Fragment",
	"com/everis/monitorDocumentos/controller/DocumentService",
	"sap/ui/core/util/File",
	"com/everis/monitorDocumentos/controller/Utils",
	"com/everis/monitorDocumentos/controller/EverisUtils",
    "sap/ui/core/BusyIndicator"
], function (Controller, JSONModel, baseController, Filter, FilterOperator, MessageBox, MessageToast, WF, Fragment, DS, File, Utils, EverisUtils, BusyIndicator) {
	"use strict";

	return Controller.extend("com.everis.monitorDocumentos.controller.detailEntregaRendir", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */

		xmlFragmentObjetoCostoHelp: "com.everis.monitorDocumentos.view.fragment.objetoCostoDialogHelp",
		xmlFragmentTipoObjetoCostoHelp: "com.everis.monitorDocumentos.view.fragment.tipoObjetoCostoDialogHelp",
		xmlFragmentOrdenHelp: "com.everis.monitorDocumentos.view.fragment.ordenDialogHelp",
		xmlFragmentConceptoHelp: "com.everis.monitorDocumentos.view.fragment.conceptoDialogHelp",
		procesoER: "",
		regla: "",
		SolicitudPrimerNivelAprob: "",
		SolicitudSegundoNivelAprob: "",
		tablaFiltro: "",
		campoFiltro: "",
		tablaBuscada: "",
		campoBuscado: "",
		handleRouteMatched: function (oEvent) {
			$.ambiente = "QAS";
			var sBukrs = oEvent.getParameters().data.Bukrs;
			var sBelnr = oEvent.getParameters().data.Belnr;
			var sGjahr = oEvent.getParameters().data.Gjahr;
			var enabledCampos = oEvent.getParameters().data.Enabled;
			var oThes = this;

			var oVariablesGlobales = {};
			oVariablesGlobales.repeticion = 0;
			oVariablesGlobales.carpetaEntregasRendir = "ENTREGASRENDIR";
			oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
			oVariablesGlobales.carpetaGasto = "GASTOS";
            sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");
            var oUserIas =  sap.ui.getCore().getModel("oUserIAS").getData();
            oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + oUserIas.name + "')", {
				success: function (result) {
					if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
						sap.ui.getCore().setModel(result, "oModelIas");
						oThes.getConceptosAdicionales();
						oThes.getDocEntregaRendir(sBukrs, sBelnr, sGjahr, enabledCampos);
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
						MessageBox.error("No asignado al proceso de aprobación");
					}
				},
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				}
			});
			/*var userModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true");
			userModel.attachRequestCompleted(function onCompleted(res) {
				if (res.getParameter("success")) {
					var oUserIas = JSON.parse(this.getJSON());
					oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + oUserIas.name + "')", {
					//oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + "Q08275964" + "')", { //test*
						success: function (result) {
							if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
								sap.ui.getCore().setModel(result, "oModelIas");
								oThes.getDocEntregaRendir(sBukrs, sBelnr, sGjahr, enabledCampos);
							} else {
								MessageBox.error("No asignado al proceso de aprobación");
							}
						},
						error: function (error) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(error);
						}
					});
				} else {
					MessageBox.error("Ha ocurrido un error al recuperar la informacion del usuario");
				}
			});*/
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("detailEntregaRendir").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
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
			this.procesoER = oParams.PROCESO,
			this.regla = oParams.REGLA,
			this.SolicitudPrimerNivelAprob = oParams.SOLICITUD_NIVEL_APROBACION_1,
			this.SolicitudSegundoNivelAprob = oParams.SOLICITUD_NIVEL_APROBACION_2,
			this.tablaFiltro = oParams.FILTRO_TABLA,
			this.campoFiltro = oParams.FILTRO_CAMPO,
			this.tablaBuscada = oParams.BUSQUEDA_TABLA,
			this.campoBuscado = oParams.BUSQUEDA_CAMPO
		},
		filterTipoObjetoCosto: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				oFilter = new Filter([
					new Filter("Rsttx", FilterOperator.Contains, sName),
					new Filter("Rstyp", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Rsttx", FilterOperator.Contains, sInputValue),
					new Filter("Rstyp", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		handleValueHelp_or: function (oEvent, tipoObjectoCosto) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentOrdenHelp, this);
				var v_soc = sap.ui.getCore().getModel("oModelIas").Bukrs;
				// var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_centro = "1400";
				var v_tipObjCosto = tipoObjectoCosto;
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"Rstyp": v_tipObjCosto
				};

				sap.ui.core.BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zordenSet", {
					headers: this._oModelHeaders,
					success: function (res) {

						that.getView().setModel(new JSONModel(res.results), "ordenes");
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						var msj = that.getI18nText("appErrorMsg");
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);
			}
			//create a filter for the binding
			var sInputValue = this.byId(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterOrden_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},
		onRouteMatched: function (oEvent) {
			this.oRegistroModel = new JSONModel({});
			this.items = [];
			var oModelDocSolicitud = new JSONModel([]);
			this.getView().setModel(oModelDocSolicitud, "DocumentosSolicitud");
		},
		filterOrden_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				oFilter = new Filter([
					new Filter("Ktext", FilterOperator.Contains, sName),
					new Filter("Aufnr", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Ktext", FilterOperator.Contains, sInputValue),
					new Filter("Aufnr", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		filterObjetoCosto_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				oFilter = new Filter([
					new Filter("Kostl", FilterOperator.Contains, sMesscode),
					new Filter("Ktext", FilterOperator.Contains, sName)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Kostl", FilterOperator.Contains, sInputValue),
					new Filter("Ktext", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		handleValueHelp_obj: function (oEvent) {
			var that = this;
			var tipObjCosto = that.getView().byId("frmDetailEntregaRendir").getModel().getData().Kstrg;
			tipObjCosto = tipObjCosto.substring(0, 1);
			if (tipObjCosto === "K") {
				that.handleValueHelp_cc(oEvent, tipObjCosto);
			}
			if (tipObjCosto === "F") {
				that.handleValueHelp_or(oEvent, tipObjCosto);
			}
		},
		handleValueHelp_cc: function (oEvent, tipoObjetoCosto) {

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					this.xmlFragmentObjetoCostoHelp,
					this
				);

				var v_soc = sap.ui.getCore().getModel("oModelIas").Bukrs;
				var v_centro = "";
				// var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				var v_tipObjCosto = tipoObjetoCosto;
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					// "lgort": v_almacen,
					"Rstyp": v_tipObjCosto
				};

				sap.ui.core.BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zobjcostoSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.getView().setModel(new JSONModel(res.results), "objetoCosto");
						} else {
							that.getView().setModel(new JSONModel([]), "objetoCosto");
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						var msj = that.getI18nText("appErrorMsg");
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);

			}

			var sInputValue = this.byId(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterObjetoCosto_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
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
				},
				error: (xhr, status, error) => {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				},
			});
		},
		getDocEntregaRendir: function (sBukrs, sBelnr, sGjahr, enabledCampos) {
			var oThes = this;
			var query = "/zsolicitudSet(Bukrs='" + sBukrs + "',ParkedDocument='" + sBelnr + "',Gjahr='" + sGjahr + "')";
			this.getOwnerComponent().getModel("oDataModelEntregasRendir").read(query, {
				success: function (res) {
					sap.ui.core.BusyIndicator.show(0);
					var oSolicitudSeleccionada = res;
					oThes.byId("idPagDetSolicitud").setTitle("Solicitud N° " + oSolicitudSeleccionada.ParkedDocument);
					var sZcat;
					sZcat = oSolicitudSeleccionada.Zcat + " - " + oSolicitudSeleccionada.ZcatText;
					oSolicitudSeleccionada.sZcatCompleto = sZcat;
					if (oSolicitudSeleccionada.Eratx && oSolicitudSeleccionada.Eratx !== "") {
						oSolicitudSeleccionada.FlagAdicional = true;
					} else {
						oSolicitudSeleccionada.FlagAdicional = false;
					}
					sap.ui.getCore().setModel(oSolicitudSeleccionada, "oSolicitudSeleccionada");

					///habiliata campos de edicion
					var oEdicion = {
						"edit": (enabledCampos === "true")
					};
					if (oSolicitudSeleccionada.zdoc) {
						oEdicion["existeDocumentoAnterior"] = true;
					} else {
						oEdicion["existeDocumentoAnterior"] = false;
					}
					var modelEdicion = new JSONModel(oEdicion);
					oThes.getView().setModel(modelEdicion, "oEdicion");
					oThes.getView().byId("frmDetailEntregaRendir").setModel(new JSONModel(oSolicitudSeleccionada));
					oThes.getView().byId("idAdicionales").setSelectedKey(oSolicitudSeleccionada.Eratx);
					oThes.onCargarTablaDetSolicitud();
					oThes.buscarGastosAsociados();
					//oThes.loadTipoObjetoCosto();
					//oThes.loadObjetoCosto();

					if (oSolicitudSeleccionada.Status !== "A") {
						oThes.getView().byId("idCrearGastoxSol").setVisible(false);
					} else {
						oThes.getView().byId("idCrearGastoxSol").setVisible(true);
					}
				},
				error: function (err) {
					console.log(err);
				}
			});
		},

		onCargarTablaDetSolicitud: function () {
			var oThes = this,
				aFilter = [],
				oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
			aFilter.push(new Filter("Belnr", FilterOperator.EQ, oSolicitudSeleccionada.ParkedDocument));
			aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));
			//sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/DetSolicitudSet", {
				filters: aFilter,
				success: function (result, status, xhr) {
					//sap.ui.core.BusyIndicator.hide();
					$.each(result.results, function (key, value) {
						var monto = String(value.Wrbtr);
						value.Wrbtr = monto.substring(0, monto.length - 1);

					});
					sap.ui.getCore().setModel(result.results, "oTablaDetSolicitud");
					oThes.getView().byId("idTablaDetalleSolicitud").setModel(new JSONModel(result.results));
					oThes.loadTipoObjetoCosto();
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				}
			});
		},

		preloadSharepointFiles: function () {
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
			var Ztyp = oSolicitudSeleccionada.Ztyp,
				Bukrs = oSolicitudSeleccionada.Bukrs,
				ParkedDocument = oSolicitudSeleccionada.ParkedDocument,
				Gjahr = oSolicitudSeleccionada.Gjahr,
				sRoute = oParametersModel.AMBIENTE + "/";
			if (Ztyp == "S") {
				sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaSolicitud + "/" + ParkedDocument + Bukrs + Gjahr;
			} else if (Ztyp == "G") {
				sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr;
			}
			EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
				aFiles.forEach((oFile) => {
					oFile.bLocal = false
				});
				oDataDocSolicitud.Files = aFiles;
				oDataDocSolicitud.Route = sRoute;
				// oDataDocSolicitud.url = oResult[0];
				// oDataDocSolicitud.dsroot = oResult[2];
				oModelDocSolicitud.refresh();
			}.bind(oThes)).catch((oError) => {
				console.log(oError);
				MessageBox.error(oThes.getI18nText("msgSharepointError"));
			});
		},

		buscarGastosAsociados: function () {
			let oDataModel = this.getOwnerComponent().getModel("oDataModelFFER");
			let oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			sap.ui.core.BusyIndicator.show(0);
			let oParameters = {
				"$expand": "toGastos",
			};
			oDataModel.read(`/ValidarSolicitudSet(Belnr='${oSolicitudSeleccionada.ParkedDocument}',Gjahr='${oSolicitudSeleccionada.Gjahr}',Bukrs='${oSolicitudSeleccionada.Bukrs}',ER='X')`, {
				urlParameters: oParameters,
				success: (result, status, xhr) => {
					sap.ui.core.BusyIndicator.hide();
					this.listaGasto = result.toGastos.results.filter((oGasto) => {
						return oGasto.Status === 'P' || oGasto.Status === 'A';
					});
				},
				error: (error, status, xhr) => {
					sap.ui.core.BusyIndicator.hide();
					console.error("[buscarGastosAsociados] - Detalle Entregas a Rendir", error);
				},
			});
		},

		onOpenDialogAttachSolicitud: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var sIdWorkflow = oSolicitudSeleccionada.IdWorkflow;
			//var sIdWorkflow = "baa0e587-c137-11ea-9128-00163ea40ce6"; //test*
			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			///JORDAN///
			oThes.oSolicitudSeleccionada = oSolicitudSeleccionada;
			//////////
			// WF.getProcessContextByInstanceID(oThes, sIdWorkflow).then(function (res) {
				//var idFolder = res.idFolderSolicitudGenerada;
				//var idFolder = "-BY9cK2Fby_b9BbHJH9guL8OtJcT6zNgRc-ndHPYbUs"; 
				var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
				var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
				///JORDAN///
				var Ztyp = oThes.oSolicitudSeleccionada.Ztyp,
					Bukrs = oThes.oSolicitudSeleccionada.Bukrs,
					ParkedDocument = oThes.oSolicitudSeleccionada.ParkedDocument,
					Gjahr = oThes.oSolicitudSeleccionada.Gjahr,
					sRoute = oParametersModel.AMBIENTE + "/";
				if (Ztyp == "S") {
					sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
						return oSociedad.valueLow === Bukrs
					}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaSolicitud + "/" + ParkedDocument + Bukrs + Gjahr;
				} else if (Ztyp == "G") {
					sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
						return oSociedad.valueLow === Bukrs
					}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr;
				}
				///////////
				if (!oThes._oDialogFiles) {
					Fragment.load({
						id: "dialogFilesER",
						name: "com.everis.monitorDocumentos.view.fragment.AttachSolicitud",
						controller: oThes
					}).then(function (oPopover) {
						oThes._oDialogFiles = oPopover;
						oThes.getView().addDependent(oThes._oDialogFiles);
						EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
							aFiles.forEach((oFile) => {
								oFile.bLocal = false
							});
							oDataDocSolicitud.Files = aFiles;
							oDataDocSolicitud.Route = sRoute;
							// oDataDocSolicitud.url = oResult[0];
							// oDataDocSolicitud.dsroot = oResult[2];
							oModelDocSolicitud.refresh();
							sap.ui.core.BusyIndicator.hide();
							oThes._oDialogFiles.open();
						}.bind(oThes)).catch((oError) => {
							console.log(oError);
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(oThes.getI18nText("msgSharepointError"));
						});
					}.bind(oThes));
				} else {
					sap.ui.core.BusyIndicator.hide();
					oThes._oDialogFiles.open();
				}
			// }).catch(function (error) {
			// 	jQuery.sap.log.error(error);
			// 	if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
			// 		MessageBox.error(error.message);
			// 	}
			// });
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
			// 		ext = ext == null ? "" : ext[1];
			// 		nameFile = nameFile.replace("." + ext, "");
			// 		File.save(blob, nameFile, ext);
			// 	});
			// }.bind(this));
		},

		onCloseDialogAttachment: function (oEvent) {
			this._oDialogFiles.close();
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
		handleValueHelp_ti: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentTipoObjetoCostoHelp, this);
				var v_soc = sap.ui.getCore().getModel("oModelIas").Bukrs;
				var v_centro = "";
				var v_almacen = "";
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen
				};

				sap.ui.core.BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/ztipoobjcostoreservaSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							var temp = [];
							res.results.map(function (x) {
								if (x.Rstyp !== "U") {
									temp.push(x);
								}
							});
							that.getView().setModel(new JSONModel(temp), "oTipoObjetoCosto");
						} else {
							that.getView().setModel(new JSONModel(temp), "oTipoObjetoCosto");
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						var msj = that.getI18nText("appErrorMsg");
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);
			}
			//create a filter for the binding
			var sInputValue = this.byId(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterTipoObjetoCosto(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},
		handleConceptValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Zconc",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		handleConceptValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var conceptInput = this.byId(this.inputId);
				conceptInput.setValue(oSelectedItem.getTitle());
			}
			this._valueHelpDialog = null;
			oEvent.getSource().getBinding("items").filter([]);
		},
		onFormatDecimal: function (oEvent) {
			var oInput = oEvent.getSource();
			var aTemp = oInput.split(".");
			if (aTemp.length > 1) {
				oInput.setValue(aTemp[1].padEnd(2, "0"));
			}
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
				if (t[0].length > 8) { //si la parte entera tiene más de 8 caracteres
					var largo = t[0].length;
					var num = t[0].slice(largo - 8, largo);
					if (t.length > 1) { //tiene decimales
						num = num + "." + t[1];
					}
					cade = num;
				}
			} else {
				var largo = cade.length;
				if (largo > 8)
					cade = cade.slice(largo - 8, largo);
			}

			this.getView().byId(nameControl).setValue(cade);
		},
		handleConceptValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			var aDetalles = this.getView().byId("idTablaDetalleSolicitud").getModel().getData();
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentConceptoHelp, this);
				sap.ui.core.BusyIndicator.show();
				var that = this;
				that.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ConceptoSet", {
					success: function (res) {
						var aConceptos = [];
						for (var i = 0; i < res.results.length; i++) {
							var bEncontrado = false;
							for (var j = 0; j < aDetalles.length; j++) {
								if (res.results[i].Zconc === aDetalles[j].Zconc) {
									bEncontrado = true;
								}
							}
							if (!bEncontrado) {
								aConceptos.push(res.results[i]);
							}
						}
						that.getView().setModel(new JSONModel(aConceptos), "oModelConcepto");
						that.getView().getModel("oModelConcepto").refresh();
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						var msj = that.getI18nText("appErrorMsg");
						that.showMessageBox(msj, "warning");
					}
				});

				sap.ui.core.BusyIndicator.hide();
				this.getView().addDependent(this._valueHelpDialog);
			}
			var sInputValue = this.getView().byId(this.inputId).getValue();
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},
		loadTipoObjetoCosto: function () {
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oInput = oThes.getView().byId("inputTipImp");
			var oInput2 = oThes.getView().byId("inputCeCo");
			// var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
			var v_soc = sap.ui.getCore().getModel("oModelIas").Bukrs; //soc solicitante
			// var v_centro = this.oRegistroModel.getProperty("/Werks/code");
			var v_centro = "";
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
					//sap.ui.core.BusyIndicator.hide();
					var temp = [];
					res.results.map(function (x) {
						if (x.Rstyp !== "U") {
							temp.push(x);
						}
					});
					oThes.getView().setModel(new JSONModel(temp), "oTipoObjetoCosto");
					if (oSolicitudSeleccionada.Kstrg === "K") {
						oThes.loadObjetoCosto();
					} else if (oSolicitudSeleccionada.Kstrg === "F") {
						oThes.loadOrdenes(oSolicitudSeleccionada.Kstrg);
					}
					if (res.results.length > 0) {
						res.results.map(function (x) {
							if (x.Rstyp === oSolicitudSeleccionada.Kstrg) {
								oInput.setValue(x.Rstyp + " - " + x.Rsttx);
							} else {
								///JORDAN///
								oInput2.setValue("");
								//////
							}
						});
					}

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(err.message);
				}
			});
		},
		onCloseDialogCentroCosto: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);
				var code_ = oSelectedItem.getInfo();
				var name_ = oSelectedItem.getTitle();
				var desc_ = code_ + " - " + name_;
				oInput.setValue(desc_);
				var dialogName = evt.getSource().getProperty("title");
				// this.oGeneral.setProperty("/enableObjetoCosto", true);
				// this.oVariablesJSONModel.setProperty("/Kostl/code", code_);
				// this.oVariablesJSONModel.setProperty("/Kostl/name", name_);
				//this.oRegistroModel.setProperty("/Kostl/code", code_);
				//this.oRegistroModel.setProperty("/Kostl/name", name_);
			}
			this._valueHelpDialog = null;
			evt.getSource().getBinding("items").filter([]);

		},
		_handleValueHelpSearch_or: function (evt) {

			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterOrden_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpSearch_cc: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterObjetoCosto_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		loadOrdenes: function (tipoObjectoCosto) {

			// create value help dialog
			var that = this;
			var oInput = that.getView().byId("inputCeCo");
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");

			var v_soc = sap.ui.getCore().getModel("oModelIas").Bukrs;
			// var v_centro = this.oRegistroModel.getProperty("/Werks/code");
			var v_centro = "1400";
			var v_tipObjCosto = tipoObjectoCosto;
			this._oModelHeaders = {
				"bukrs": v_soc,
				"werks": v_centro,
				"Rstyp": v_tipObjCosto
			};

			//sap.ui.core.BusyIndicator.show();

			this.getOwnerComponent().getModel("oUtilitiesModel").read("/zordenSet", {
				headers: this._oModelHeaders,
				success: function (res) {
					if (res.results.length > 0) {

						res.results.map(function (x) {
							if (x.Aufnr === oSolicitudSeleccionada.Aufnr) {
								oInput.setValue(x.Aufnr + " - " + x.Ktext);
							}
						});
					}
					that.getView().setModel(new JSONModel(res.results), "ordenes");
                    sap.ui.getCore().setModel(new JSONModel(res.results), "AUFNRModelFF");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					var msj = that.getI18nText("appErrorMsg");
					that.showMessageBox(msj, "warning");
				}
			});

		},
		getI18nText: function (val) {
			return this.getI18n().getText(val);
		},
		getI18n: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);
				var code_ = oSelectedItem.getInfo();
				var name_ = oSelectedItem.getTitle();
				var desc_ = code_ + " - " + name_;
				oInput.setValue(desc_);
				var dialogName = evt.getSource().getProperty("title");
				//this.afterSelectItem(dialogName, code_, name_, desc_);
			}
			this._valueHelpDialog = null;
			evt.getSource().getBinding("items").filter([]);
		},
		_handleValueHelpSearch_ti: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterTipoObjetoCosto(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		loadObjetoCosto: function () {
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oInput = oThes.getView().byId("inputCeCo");
			// var sSociedad = sap.ui.getCore().getModel("InfoIas").Bukrs;
			var sSociedad = sap.ui.getCore().getModel("oModelIas").Bukrs;
			this._oModelHeaders = {
				"bukrs": sSociedad
			};
			this.getOwnerComponent().getModel("oUtilitiesModel").read("/zobjcostoSet", {
				headers: this._oModelHeaders,
				success: function (res) {
					if (res.results.length > 0) {
						oThes.getView().setModel(new JSONModel(res.results), "objetoCosto");
                        sap.ui.getCore().setModel(new JSONModel(res.results), "KOSTLModelFF");
						res.results.map(function (x) {
							if (x.Kostl === oSolicitudSeleccionada.Kostl) {
								oInput.setValue(x.Kostl + " - " + x.Ktext);
							}
						});
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(err.message);
				}
			});
		},
		fnBorraFila: function (oEvent) {
			var that = this;
			var nameControl = oEvent.getSource().data("nameControl");
			var oFila = oEvent.getSource().getParent(),
				oTbl = this.getView().byId(nameControl),
				idx = oFila.getBindingContextPath(),
				oImporteTotal = this.getView().byId("idImporteTotal");
			idx = idx.charAt(idx.lastIndexOf('/') + 1);
			idx = parseFloat(idx);
			MessageBox.warning("¿Esta seguro de que desea eliminar la fila seleccionada?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						if (idx !== -1) {
							var oModel = oTbl.getModel(),
								data = oModel.getData();
							oImporteTotal.setValue(Number(oImporteTotal.getValue().replace(',', '')) - Number(data[idx].Wrbtr));
							var removed = data.splice(idx, 1);
							oModel.setData(data);
							var aDataPos = oTbl.getModel().getData(),
								iPosicion = 0;

							$.each(aDataPos, function (pos, ele) {
								iPosicion++;
								ele.Nrpos = String(iPosicion);
							});
							oTbl.getModel().setData(aDataPos);
							oTbl.getModel().refresh();
						}
					}
				}
			});
		},
		fnFormatearFechaSAP: function (pValue) {
			var iDia = pValue.substr(0, 2);
			var iMes = pValue.substr(3, 2);
			var iYear = pValue.substr(6, 4);
			return [iYear, iMes, iDia].join('-');
		},
		doNavigateGasto: function (sRouteName, oModelDocument, fnPromiseResolve, sViaRelation) {
			this.oRouter.navTo(sRouteName, false);

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		fnAgregarDetalleSolicitud: function () {

			var oModelFondoFijo = sap.ui.getCore().getModel("InfoFondoFijo"),
				iLimiteSol = 350,
				fMontoEvaluar = 0,
				oDetSol = {},
				oThes = this;
			var oDes = this.getView().byId("idDes"),
				oImport = this.getView().byId("idImporteTotal"),
				oWaers = this.getView().byId("idWaers"),
				oFondo = this.getView().byId("idfondo"),
				FechCon = this.getView().byId("idFechaCont"),
				oFecDoc = this.getView().byId("idFecha"),
				oImporteDet = this.getView().byId("idImporteDetalle"),
				oConcepto = this.getView().byId("idConcepto");

			var InfoIas = sap.ui.getCore().getModel("oModelIas"),
				oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var oTable = this.getView().byId("idTablaDetalleSolicitud");

			var aTemp = oImporteDet.getValue();
			oImporteDet.setValue(String(Number(aTemp)));

			oDes.setValueState("None");
			oConcepto.setValueState("None");
			oImporteDet.setValueState("None");

			if (this.onValidarVacio(oDes.getValue())) {
				oDes.setValueState("Error");
				return;
			}

			if (this.onValidarVacio(oConcepto.getValue())) {
				oConcepto.setValueState("Error");
				return;
			}

			if (this.onValidarVacio(oImporteDet.getValue())) {
				oImporteDet.setValueState("Error");
				return;
			}

			fMontoEvaluar = Number(oImport.getValue()) + Number(oImporteDet.getValue());

			oDetSol.Bukrs = InfoIas.Bukrs;
			oDetSol.Belnr = "";
			oDetSol.Gjahr = "";
			oDetSol.Usuario = "";
			oDetSol.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
			oDetSol.Budat = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00";
			oDetSol.Blart = "";
			oDetSol.Detalle = oDes.getValue();
			oDetSol.Wrbtr = oImporteDet.getValue();
			oDetSol.Waers = oWaers.getValue();
			oDetSol.Zconc = oConcepto.getValue();

			var aFilas = oTable.getModel().getData();
			if (aFilas.length === 0) {
				oWaers.setEnabled(false);
				//LR 27/12
				oImport.setValue(parseFloat(oImporteDet.getValue()).toFixed(2));
				oDetSol.Nrpos = "1";
				aFilas.push(oDetSol);
				oTable.setModel(new JSONModel(aFilas));
				oTable.getModel().refresh(true);
				this.byId("idImporteDetalle").setValue("");
				this.byId("idDes").setValue("");
				this.byId("idConcepto").setValue("");
			} else {
				var sSuma = 0;
				$.each(aFilas, function (key, value) {
					sSuma += Number(value.Wrbtr);
				});
				var icalculo = Number(oDetSol.Wrbtr) + sSuma;

				var Nrpos = aFilas[aFilas.length - 1];
				oDetSol.Nrpos = String(Number(Nrpos.Nrpos) + 1);
				aFilas.push(oDetSol);
				oTable.setModel(new JSONModel(aFilas));
				oTable.getModel().refresh(true);
				//LR 27/12
				this.byId("idImporteTotal").setValue(parseFloat(icalculo).toFixed(2));
				this.byId("idImporteDetalle").setValue("");
				this.byId("idDes").setValue("");
				this.byId("idConcepto").setValue("");
			}
			sap.ui.getCore().setModel(aFilas, "oModelTablaDetSolicitud");
		},
		onValidarVacio: function (valor) {
			valor = valor === undefined ? "" : valor;
			if (!valor || 0 === valor.trim().length) {
				return true;
			} else {
				return false;
			}
		},
		showMessageBox: function (msg, Method) {
			if (Method === "warning") {
				sap.m.MessageBox.warning(msg, {
					title: "Alerta",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "error") {
				sap.m.MessageBox.error(msg, {
					title: "Error",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "show") {
				sap.m.MessageBox.show(msg, {
					title: "Mensaje",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "success") {
				sap.m.MessageBox.success(msg, {
					title: "Éxito",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
		},
		onUpdateSolicitud: function () {
			//variables de los datos del fondo del usuario
			var fMontoEvaluar = 0,
				oThes = this,
				oModelDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData(),
				oTable = this.getView().byId("idTablaDetalleSolicitud").getModel().getData(),
				msjErrorCamposObligatorios = this.getI18nText("txtCompletarCamposObligatorios");

			if (oTable.length <= 0) {
				var msj = "Por favor ingrese al menos un detalle de solicitud.";
				oThes.showMessageBox(msj, "warning");
				return;
			}
			//obtengo los ID
			var oFecDoc = this.getView().byId("idFecha"),
				FechCon = this.getView().byId("idFechaCont"),
				oOperacion = this.getView().byId("idOperacion"),
				oCuenMayor = this.getView().byId("idCuentaMyr"),
				oImport = this.getView().byId("idImporteTotal"),
				oWaers = this.getView().byId("idWaers"),
				oRef = this.getView().byId("idReferencia"),
				oTipoObjCosto = this.getView().byId("inputTipImp"),
				oObjCosto = this.getView().byId("inputCeCo"),
				oObservaciones = this.getView().byId("inputObser");
			//Seteo el estado a ninguno para recien poder validar si es que estan vacios
			oFecDoc.setValueState("None");
			oOperacion.setValueState("None");
			oCuenMayor.setValueState("None");
			oImport.setValueState("None");
			FechCon.setValueState("None");
			oWaers.setValueState("None");
			oRef.setValueState("None");
			oTipoObjCosto.setValueState("None");
			oObjCosto.setValueState("None");
			oObservaciones.setValueState("None");
			//valido si algun campo esta vacio

			if (this.onValidarVacio(oFecDoc.getValue())) {
				oFecDoc.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(oOperacion.getValue())) {
				oOperacion.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}

			if (this.onValidarVacio(oImport.getValue())) {
				oImport.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(FechCon.getValue())) {
				FechCon.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(oWaers.getValue())) {
				oWaers.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(oRef.getValue())) {
				oRef.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(oTipoObjCosto.getValue())) {
				oTipoObjCosto.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			if (this.onValidarVacio(oObjCosto.getValue())) {
				oObjCosto.setValueState("Error");
				MessageBox.error(msjErrorCamposObligatorios);
				return;
			}
			//Calcular si el monto total de los importes en verde es mayor o igual al del importe total que se genera
			//	fMontoEvaluar = Number(oImport.getValue()) + oVariablesGlobales.ImporteTotalSolicitudes;
			//luego de la validación guardo los vaLores en un json para añadirlos a la tabla detalle
			var oCabSol = {},
				InfoIas = sap.ui.getCore().getModel("oModelIas"),
				oModelMaestroSolicitudes = oThes.getOwnerComponent().getModel("oDataModelEntregasRendir");

			oCabSol.Bukrs = InfoIas.Bukrs;
			oCabSol.ParkedDocument = oModelDocument.ParkedDocument;
			//oCabSol.ParkedDocument = "";
			oCabSol.Gjahr = oModelDocument.Gjahr;
			var oCurrentDate = new Date(); // se debe enviar la fecha en curso al actualizar
			var sDate = oCurrentDate.getDate().toString();
			var sMonth = (oCurrentDate.getMonth() + 1).toString();
			var sYear = oCurrentDate.getFullYear().toString();
			var sCurrentDate = `${sDate.padStart(2, "0")}-${sMonth.padStart(2, "0")}-${sYear}`;
			oCabSol.Budat = this.fnFormatearFechaSAP(sCurrentDate) + "T00:00:00";
			oCabSol.Bldat = this.fnFormatearFechaSAP(sCurrentDate) + "T00:00:00";
			oCabSol.Xblnr = oRef.getValue();
			oCabSol.Ztyp = oModelDocument.Ztyp;
			oCabSol.Waers = oWaers.getValue();
			oCabSol.Wrbtr = oImport.getValue();
			oCabSol.Status = oModelDocument.Status;
			oCabSol.Bktxt = (InfoIas.Pname).slice(0, 25);
			oCabSol.Sgtxt = oRef.getValue();
			oCabSol.Hkont = oModelDocument.Hkont; //oCuenMayor.getValue();
			oCabSol.Zcat = oOperacion.getValue().substr(0, 4);
			oCabSol.Segment = oModelDocument.Segment;
			oCabSol.Uname = InfoIas.Sysid;

			oCabSol.Kstrg = oTipoObjCosto.getValue().substring(0, 1);

			if (oCabSol.Kstrg === "F") {
				oCabSol.Aufnr = oObjCosto.getValue().split(" ")[0];
			} else {
				oCabSol.Kostl = oObjCosto.getValue().split(" ")[0];
			}
			oCabSol.Zobserv = oObservaciones.getValue();
			oCabSol.Eratx = oModelDocument.Eratx;
			//IDWORKFLOW
			oCabSol.Ztyp = "B";
			oCabSol.IdWorkflow = oModelDocument.IdWorkflow;
			sap.ui.core.BusyIndicator.show(0);
			console.log("oCabSol")
			console.log(oCabSol)

			this.crearDocumentoPreliminarER(oCabSol);

			///Eliminacion Logica

			/*		var oEliminacion = {};
					oEliminacion.Type = "Z";
					oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + oCabSol.Bukrs + "',ParkedDocument='" + oModelDocument.ParkedDocument +
						"',Gjahr='" +
						oModelDocument.Gjahr +
						"')", oEliminacion, {
							success: function () {*/
			/***************************************************************************************************************
						// oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + oCabSol.Bukrs + "',ParkedDocument='" + oModelDocument.ParkedDocument +
						// 	"',Gjahr='" +
						// 	oModelDocument.Gjahr +
						// 	"')", oCabSol, {
						// 		success: function (oData, oResponse) {
						// 			var msg = JSON.parse(oResponse.headers["sap-message"]);
						// 			if (msg.severity === "success") {
						// 				//MessageBox.success(msg.message);
						// 				console.log(oData)
						// 				oThes.fnGrabarDetalleSolicitud(oData);
						// 			} else {
						// 				sap.ui.core.BusyIndicator.hide();
						// 				MessageBox.error(msg.message);
						// 			}
						// 		},
						// 		error: function (oError) {
						// 			// Error
						// 			sap.ui.core.BusyIndicator.hide();
						// 			if (oError.responseText !== "") {
						// 				var txt = "Ocurrió un error en SAP.\n\n" + JSON.parse(oError.responseText).error.message.value + "\n" +
						// 					JSON.parse(oError.responseText).error.code;
						// 				MessageBox.error(txt);
						// 			} else {
						// 				MessageBox.error("Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas.");
						// 			}
						// 		}
						// 	});
			/****************************************************************************************************************			
						
						/*			},
								error: function () {
										MessageBox.error(
											"Ocurrió un error al intentar Actualizar su documento, póngase en contacto con su departamento de Sistemas.");
									}
								});*/

			//al terminar debe añadirse acá el limpiado de los campos
		},
        
		crearDocumentoPreliminarER: function (oModelDocumento) {
			var oThes = this;
			var oUserIas = sap.ui.getCore().getModel("oUserIAS").getData();
			sap.ui.core.BusyIndicator.show(0);
			oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ModifiDocSet(BELNR='" + oModelDocumento.ParkedDocument +
				"',BUKRS='" + oModelDocumento.Bukrs + "',GJAHR='" + oModelDocumento.Gjahr + "')", {
				success: function (result) {
					var nroModif = parseInt(result.NROMODIF, 10);
					if (nroModif < 2) {
						oThes.getOwnerComponent().getModel("oDataModelFondoFijo").read("/IasSet('" + oUserIas.name + "')", {
							//oThes.getOwnerComponent().getModel("oDataModelFondoFijo").read("/IasSet('" + "Q08275964" + "')", { //test*
							success: function (result) {
								if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
									sap.ui.getCore().setModel(result, "oModelIas");
									oThes.obtenerPosicionesER(oModelDocumento, result);
								} else {
									MessageBox.error("No asignado al proceso de aprobación");
								}
							},
							error: function (error) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error(error);
							}
						});
					} else {
						MessageBox.error("Este documento ya se ha modificado mas de 2 veces");
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function (error) {
					console.log(error);
					MessageBox.error(`Ocurrió un error al intentar modificar documento ${oModelDocumento.ParkedDocument}.`);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
        obtenerPosicionesER: function (oModelDocumentoER, oModelIas) {
			var oTbl = this.getView().byId("idTablaDetalleSolicitud");
			var oModel = oTbl.getModel();
			var oPosiciones = oModel.getData();
			this.onCrearNuevaSolicitudER(oModelDocumentoER, oModelIas, oPosiciones);
		},
        onCrearNuevaSolicitudER: function (oModelDocumentoER, oModelIas, oPosiciones) {
			//Verifica si existe aprobador del primer nivel
			var that = this;
			/********* Obteniene lista de aprobadores desde SAP ********/
			//var InfoIas = sap.ui.getCore().getModel("InfoIas");
			
			if (oModelDocumentoER.Kstrg == "K") {
				that.tablaFiltro = "CSKS";
				that.campoFiltro = "KOSTL";
				that.Plans = oModelDocumentoER.Kostl;
			} else if (oModelDocumentoER.Kstrg == "F") {
				that.tablaFiltro = "COBL";
				that.campoFiltro = "AUFNR";
				that.Plans = oModelDocumentoER.Aufnr;
			}
			that.onNuevoDetSolicitudER(oModelDocumentoER, oModelIas, oPosiciones);
			/*
			var query = "/zinaprobadoresSet(" +
				"Bukrs='" + oModelIas.Bukrs + "'," +
				"Prcid='" + that.procesoER + "'," +
				"Rulid='" + that.regla + "'," +
				"Tskid='" + that.SolicitudPrimerNivelAprob + "'," +
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
							console.log("APROBADOR PRIMER NIVEL")
							console.log(res.results[0].Low)
							that.onNuevoDetSolicitudER(oModelDocumentoER, oModelIas, oPosiciones);
							that.Nivel = res.results[0].nroniveles;
							//	that.onGetSolicitudAprobadoresSegundoNivel();
						} else {
							that.showMessageBox(that.getI18nText("appSinAprobadorPrimerNivel"), "error");
						}
					}

				},
				error: function (err) {
					that.getView().setBusy(false);
					var msj = that.getI18nText("appErrorMsg");
					that.showMessageBox(msj, "error");
				}
			});*/
		},
        onNuevoDetSolicitudER: function (oModelDocumentoER, oModelIas, oPosiciones) {
			//variables de los datos del fondo del usuario
			var fMontoEvaluar = 0,
				that = this;
			//luego de la validación guardo los vaLores en un json para añadirlos a la tabla detalle
			var oCabSol = {},
				oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");

			oCabSol.Bukrs = oModelIas.Bukrs;
			oCabSol.ParkedDocument = "";
			oCabSol.Gjahr = String((new Date()).getFullYear());

			var FechCon = Utils.fnFormatearFechaVista(oModelDocumentoER.Budat);
			FechCon = Utils.fnFormatearFechaSAP(FechCon) + "T00:00:00";
			var oFecDoc = Utils.fnFormatearFechaVista(oModelDocumentoER.Bldat);
			oFecDoc = Utils.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";

			oCabSol.Budat = FechCon;
			oCabSol.Bldat = oFecDoc;

			oCabSol.Xblnr = oModelDocumentoER.Xblnr;
			oCabSol.Ztyp = "S";
			oCabSol.Waers = oModelDocumentoER.Waers;
			oCabSol.Wrbtr = oModelDocumentoER.Wrbtr;
			oCabSol.Status = "";
			oCabSol.Bktxt = (oModelIas.Pname).slice(0, 25);
			oCabSol.Sgtxt = oModelDocumentoER.Sgtxt;
			oCabSol.Hkont = ""; //oCuenMayor.getValue();
			oCabSol.Zcat = oModelDocumentoER.Zcat;
			oCabSol.Segment = "S00";
			oCabSol.Uname = oModelIas.Sysid;

			oCabSol.Kstrg = oModelDocumentoER.Kstrg.split(" - ", 1)[0];

			if (oCabSol.Kstrg === "F") {
				oCabSol.Aufnr = oModelDocumentoER.Aufnr;
			} else {
				oCabSol.Kostl = oModelDocumentoER.Kostl;
			}

			oCabSol.Zobserv = oModelDocumentoER.Zobserv;
			oCabSol.Eratx = oModelDocumentoER.Eratx;
			oCabSol.zdoc = oModelDocumentoER.ParkedDocument;

			sap.ui.core.BusyIndicator.show(0);
			oModelMaestroSolicitudes.create("/zsolicitudSet", oCabSol, {
				success: function (oData, oResponse) {

					var msg = JSON.parse(oResponse.headers["sap-message"]);
					if (msg.severity === "success") {
						that.fnGrabarDetalleSolicitudER(oData, oModelDocumentoER, oModelIas, oPosiciones);
					} else {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(msg.message);
					}

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
			//al terminar debe añadirse acá el limpiado de los campos
		},
        fnGrabarDetalleSolicitudER: function (oDataDocNuevo, oModelDocumentoER, oModelIas, oPosiciones) {

			var that = this;
			$.each(oPosiciones, function (key, value) {
				var FechCon = Utils.fnFormatearFechaVista(value.Budat);
				FechCon = Utils.fnFormatearFechaSAP(FechCon) + "T00:00:00";
				var oFecDoc = Utils.fnFormatearFechaVista(value.Bldat);
				oFecDoc = Utils.fnFormatearFechaSAP(oFecDoc) + "T00:00:00";

				value.Belnr = oDataDocNuevo.ParkedDocument;
				value.Bukrs = oDataDocNuevo.Bukrs;
				value.Gjahr = oDataDocNuevo.Gjahr;
				value.Bldat = oFecDoc;
				value.Budat = FechCon;
			});

			var oModelTablaDetSolicitud = JSON.parse(JSON.stringify(oPosiciones));
			that.fnServicioDetSolicitudER(oModelTablaDetSolicitud, oModelDocumentoER, oModelIas, oDataDocNuevo, oPosiciones);
		},

		fnGrabarDetalleSolicitud: function (oData) {

			var oThes = this;

			var oModelTablaDetSolicitud = this.getView().byId("idTablaDetalleSolicitud").getModel().getData(),
				oModelDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData(),
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			oVariablesGlobales.Flag = 0;

			$.each(oModelTablaDetSolicitud, function (key, value) {
				value.Nrpos = String(value.Nrpos);
				value.Belnr = oModelDocument.ParkedDocument;
				value.Bukrs = oModelDocument.Bukrs;
				value.Gjahr = oModelDocument.Gjahr;
				value.Blart = oModelDocument.Blart;
			});

			oThes.fnServicioDetSolicitud(oModelTablaDetSolicitud);

		},
        fnServicioDetSolicitudER: function (oModelTablaDetSolicitud, oModelDocumentoER, oModelIas, oDataDocNuevo, oPosiciones) {
			var oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				that = this;
			var oDocumento = oModelTablaDetSolicitud.shift();
			sap.ui.core.BusyIndicator.show(0);
			oModelMaestroSolicitudes.create("/DetSolicitudSet", oDocumento, {
				success: function (oData, oResponse) {
					if (oModelTablaDetSolicitud.length == 0) {						
						that.fnWorkFlowER(oPosiciones, oModelDocumentoER, oModelIas, oDataDocNuevo).then(() => {
							return that.updateSharepointFiles(oDataDocNuevo);
						}).then(() => {
							return that.updateArchiveLinkFiles(oDataDocNuevo);
						}).then(() => {
							if (oModelDocumentoER.Status == "R") {
								MessageBox.success("Se ha creado el documento preliminar " + oDataDocNuevo.ParkedDocument +
									" del documento rechazado " +
									oModelDocumentoER.ParkedDocument, {
										actions: [MessageBox.Action.OK],
										emphasizedAction: MessageBox.Action.OK,
										onClose: function (sAction) {
											that.oRouter.navTo("default", false);
										}
									});
							} else {
								that.fnRechazarDocumento(oModelDocumentoER, oDataDocNuevo);
							}
						}).catch((error) => {
							console.log(error);
							sap.ui.core.BusyIndicator.hide();
						});
					} else {
						that.fnServicioDetSolicitudER(oModelTablaDetSolicitud, oModelDocumentoER, oModelIas, oDataDocNuevo, oPosiciones);
					}
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + oDocumento.Nrpos + ".";
					that.showMessageBox(msj, "error");
					return;
				}
			});
		},
        fnSubirObservacionDSER: function (oModelDocumentoER, oModelIas, oDataDocNuevo, oPosiciones) {
			//var sNroSolicitud = oDataDocNuevo.ParkedDocument;
            var that = this;
            that.fnWorkFlowER(oPosiciones, oModelDocumentoER, oModelIas, oDataDocNuevo, "S");

		/*	var route = sap.ui.getCore().getModel("route2");
			route.solicitud = oDataDocNuevo.ParkedDocument + oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
			route.carpetaSociedad = oModelIas.Paval;

			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();

			var aFiles = [];
			if (aFiles.length) {
				////JORDAN/////////////////////////////////

				var sRoute = $.ambiente + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02;
				var that = this;

				DS.getCreateFolder(sRoute, route.solicitud).then(oResult => { ///Crea el folder y luega hace varias promesas asincronas para guardar los archivos
					//Agrego path a cada elemento
					for (var i = 0; i < aFiles.length; i++) {
						aFiles[i].path = sRoute + "/" + route.solicitud;
					};
					//Promesa asincrona para agregar todos los archivos en la carpeta de solicitud
					Promise.all(aFiles.map(function (file) {
						DS.addFile(file.path, file).then(oResult2 => {
							console.log("Se agrego archivo");
						});
					})).then((sResolve) => {
						jQuery.sap.log.info(sResolve);
						that.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve);
						that.getView().getModel("DocumentsSolicitud").setData([]);
						sap.m.MessageBox.success("El archivo fue cargado correctamente.");
						that.fnWorkFlow(oPosiciones, "S");

						sap.ui.core.BusyIndicator.hide();

					}).catch(function (sError) {
						jQuery.sap.log.error(sError);
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + sError.message);
					});
				});

				///////////////////////////////////////////

			} else {
				///JORDAN Si no hay adjuntos solo creara el folder////
				var sRoute = $.ambiente + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02;
				var that = this;

				DS.getCreateFolder(sRoute, route.solicitud).then(oResult => {
					jQuery.sap.log.info(oResult);
					that.idFolderSolicitudGenerada = oResult;
					that.fnWorkFlowER(oPosiciones, oModelDocumentoER, oModelIas, oDataDocNuevo, "S");
					sap.ui.core.BusyIndicator.hide();
				});
			}**/
			////////////////////////////////////////////////////7
		},
        fnWorkFlowER: function (aData, oModelDocumentoER, oModelIas, oDataDocNuevo) {
			    var that = this;
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
							that.fnStartInstanceSER(sToken, aData, oModelDocumentoER, oModelIas, oDataDocNuevo).then(() => {
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
				})
			
		},
        fnFetchToken: function () {
			var sToken;
			$.ajax({
                url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/xsrf-token",
				//url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					sToken = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return sToken;
		},

		fnStartInstanceSER: function (sToken, oModelTablaDetSolicitud, oModelDocumentoER, oModelIas, oDataDocNuevo) {
			var that = this;
			return new Promise((resolve, reject) => {
				var aData = {};
				var oTotal = {};
				var oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
				oTotal.Detalle = "Total";
				oTotal.Wrbtr = oModelDocumentoER.Wrbtr;
				oTotal.Waers = oModelDocumentoER.Waers;
				oModelTablaDetSolicitud.push(oTotal);
	
				var oTipoObjCosto = that.getView().byId("inputTipImp"),
					oObjCosto = that.getView().byId("inputCeCo"),
					oObservaciones = that.getView().byId("inputObser"),
					oAdicional = that.getView().byId("idAdicionales");
	
				aData.NombreDocumento = "Solicitud";
				aData.Nivel = "1";
				aData.Bukrs = oDataDocNuevo.Bukrs;
				aData.Belnr = oDataDocNuevo.ParkedDocument;
				aData.Gjahr = oDataDocNuevo.Gjahr;
				aData.Prcid = that.procesoER;
				aData.Rulid = that.regla;
				aData.Iskid = that.SolicitudPrimerNivelAprob;
				aData.IskidL2 = that.SolicitudSegundoNivelAprob;
				aData.Tabname = that.tablaFiltro;
				aData.Fieldname = that.campoFiltro;
				aData.Pname = oModelIas.Pname;
				aData.Value = that.Plans;
				aData.Isfound = false;
				aData.Tabname_search = that.tablaBuscada;
				aData.Fieldname_search = that.campoBuscado;
				aData.Usuario = oModelIas.Sysid;
				aData.Fecha = Utils.fnFormatearFechaVista(new Date());
				aData.ImporteTotal = oModelDocumentoER.Wrbtr + " " + oModelDocumentoER.Waers;
				aData.DetalleSol = oModelTablaDetSolicitud;
				aData.CorporativeEmail = oModelIas.CorporativeEmail;
				aData.PersonalEmail = oModelIas.PersonalEmail;
				aData.Type = "S";
	
				aData.SociedadTxt = oModelIas.Butxt;
	
				aData.Operacion = oModelDocumentoER.Zcat + " - " + "Solicitud de Entregas a rendir";
				aData.Moneda = oModelDocumentoER.Waers;
				aData.ReferenciaGeneral = oModelDocumentoER.Xblnr;
	
				aData.Kstrg = oTipoObjCosto.getValue();
				var sTipo = oModelDocumentoER.Kstrg.split(" - ", 1)[0];
	
				if (sTipo === "F") {
					aData.Aufnr = oObjCosto.getValue();
				} else {
					aData.Kostl = oObjCosto.getValue();
				}
	
				aData.Zobserv = oModelDocumentoER.Zobserv;
				if (oModelDocumentoER.Eratx && oModelDocumentoER.Eratx !== "") {
					aData.FlagAdicional = true;
					aData.Eratx = oAdicional.getValue();
				} else {
					aData.FlagAdicional = false;
				}
				aData.idFolderSolicitudGenerada = "";
				aData.identificadorAplicacion = "Entregas a Rendir";
				
				sap.ui.core.BusyIndicator.show(0);
				$.ajax({
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/workflow-instances",
					method: "POST",
					async: false,
					contentType: "application/json",
					headers: {
						"X-CSRF-Token": sToken
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
							oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + aData.Bukrs + "',ParkedDocument='" + aData.Belnr + "',Gjahr='" +
								aData.Gjahr + "')", oActualizarWorkflowId, {
									success: function () {
										console.log("Se actualizó id de workflow");
										MessageToast.show(that.getI18nText("msgWorkflowSuccess"));
										sap.ui.core.BusyIndicator.hide();
										resolve();
									},
									error: function (error) {
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

		updateSharepointFiles: function (oNuevoDocumento) {
			var that = this;
			return new Promise ((resolve, reject) => {
				var ParkedDocument = oNuevoDocumento.ParkedDocument;
				var Bukrs = oNuevoDocumento.Bukrs;
				var Gjahr = oNuevoDocumento.Gjahr;
				var oModelDocSolicitud = that.getView().getModel("DocumentosSolicitud");
				var oDataDocSolicitud = oModelDocSolicitud.getData();
				var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
				var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
				var sOldRoute = oDataDocSolicitud.Route;
				var sNewRoute = oParametersModel.AMBIENTE + "/" + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaSolicitud + "/" + ParkedDocument + Bukrs + Gjahr;
				var aFilesTobeDownloaded = [];
				var aSharepointFiles = oDataDocSolicitud.Files.filter((oFile) => {
					return !oFile.bLocal
				});
				var aLocalFiles = oDataDocSolicitud.Files.filter((oFile) => {
					return oFile.bLocal
				});
				aSharepointFiles.forEach((oSharepointFile) => {
					aFilesTobeDownloaded.push(EverisUtils.sharepoint.getBlob(sOldRoute, oSharepointFile.Name));
				});
				sap.ui.core.BusyIndicator.show(0);
				Promise.all(aFilesTobeDownloaded).then((aBlobFiles) => {
					var oNewLocalFile = {};
					aBlobFiles.forEach((oBlobFile, index) => {
						oNewLocalFile = {
							"Name": that.llamada(aSharepointFiles[index].Name, true),
							"fileName": that.llamada(aSharepointFiles[index].Name, true),
							"folderName": "",
							"data": oBlobFile,
							"size": oBlobFile.size,
							"bLocal": true
						};
						aLocalFiles.push(oNewLocalFile);
					});
					if (aLocalFiles.length > 0) {
						EverisUtils.sharepoint.createFolderDeep(sNewRoute).then(() => {
							return EverisUtils.sharepoint.saveFiles(sNewRoute, aLocalFiles);
						}).then(() => {
							MessageToast.show(that.getI18nText("msgSharepointArchivosActualizados"));
							sap.ui.core.BusyIndicator.hide();
							resolve();
						}).catch((oError) => {
							console.error("[Sharepoint - Carga]", oError);
							MessageBox.error(that.getI18nText("msgSharepointErrorActualizarArchivos"));
							reject();
						});
					} else {
						resolve();
					}
				}).catch((oError) => {
					console.error("[Sharepoint - Descarga]", oError);
					MessageBox.error(that.getI18nText("msgSharepointErrorActualizarArchivos"));
					reject();
				});
			});
		},

		updateArchiveLinkFiles: function (oNuevoDocumento) {
			var that = this;
			return new Promise ((resolve, reject) => {
				var ParkedDocument = oNuevoDocumento.ParkedDocument;
				var Bukrs = oNuevoDocumento.Bukrs;
				var Gjahr = oNuevoDocumento.Gjahr;
				var oModelEntredaRendir = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
				var oModelDocSolicitud = that.getView().getModel("DocumentosSolicitud");
				var oDataDocSolicitud = oModelDocSolicitud.getData();
				var sOldRoute = oDataDocSolicitud.Route;
				var aFilesTobeDownloaded = [];
				var aSharepointFiles = oDataDocSolicitud.Files.filter((oFile) => {
					return !oFile.bLocal
				});
				var aLocalFiles = oDataDocSolicitud.Files.filter((oFile) => {
					return oFile.bLocal
				});
				aSharepointFiles.forEach((oSharepointFile) => {
					aFilesTobeDownloaded.push(EverisUtils.sharepoint.getBlob(sOldRoute, oSharepointFile.Name));
				});
				sap.ui.core.BusyIndicator.show(0);
				Promise.all(aFilesTobeDownloaded).then((aBlobFiles) => {
					var oNewLocalFile = {};
					aBlobFiles.forEach((oBlobFile, index) => {
						oNewLocalFile = {
							"Name": that.llamada(aSharepointFiles[index].Name, true),
							"fileName": that.llamada(aSharepointFiles[index].Name, true),
							"folderName": "",
							"data": oBlobFile,
							"size": oBlobFile.size,
							"bLocal": true
						};
						aLocalFiles.push(oNewLocalFile);
					});
					var aFilesTobeConverted = [];
					aLocalFiles.forEach((oFile) => {
						aFilesTobeConverted.push(Utils.blobToBase64String(oFile.data));
					});
					Promise.all(aFilesTobeConverted).then((aBase64String) => {
						var oArchiveLinkPayload = {
							Bukrs: Bukrs,
							Belnr: ParkedDocument,
							Gjahr: Gjahr,
							Modulo: "FI",
							ArchiveDocSet: []
						};
						aBase64String.forEach((sBase64String, index) => {
							var sFileName = aLocalFiles[index].Name;
							oArchiveLinkPayload.ArchiveDocSet.push({
								Bukrs: Bukrs,
								Belnr: ParkedDocument,
								Gjahr: Gjahr,
								Bas64: sBase64String.split(",")[1],
								Exten: sFileName.substring(sFileName.lastIndexOf(".") + 1).toUpperCase(),
								Nombre: sFileName,
								Return: ""
							});
						});
						if (oArchiveLinkPayload.ArchiveDocSet.length > 0) {
							oModelEntredaRendir.create("/ArchiveHeaderSet", oArchiveLinkPayload, {
								success: function (oResponse) {
									console.log(oResponse);
									MessageToast.show(that.getI18nText("msgArchiveLinkArchivosActualizados"));
									sap.ui.core.BusyIndicator.hide();
									resolve();
								},
								error: function (oError) {
									console.error("[ArchiveLink - Carga SAP]", oError);
									MessageBox.error(that.getI18nText("msgArchiveLinkErrorActualizarArchivos"));
									reject();
								}
							});
						} else {
							resolve();
						}
					}).catch((oError) => {
						console.error("[ArchiveLink - Conversión Blob]", oError);
						MessageBox.error(that.getI18nText("msgArchiveLinkErrorActualizarArchivos"));
						reject();
					});
				}).catch((oError) => {
					console.error("[ArchiveLink - Descarga desde Sharepoint]", oError);
					MessageBox.error(that.getI18nText("msgArchiveLinkErrorActualizarArchivos"));
					reject();
				});
			});
		},

        fnRechazarDocumento: function (oModelDocumentoER, oDataDocNuevo) {
			var taskUSer = {};
			var that = this;
			BusyIndicator.show(0);
			WF.getExecutionLogs(that, oModelDocumentoER.IdWorkflow).then(function (res) {
				var aHistorialCompleto = res;
				var oRegistro = {};
				while (aHistorialCompleto.length > 0) {
					oRegistro = aHistorialCompleto.shift();
					if (oRegistro.type === "USERTASK_CREATED") {
						taskUSer = oRegistro;
					}
				}
				if (taskUSer.taskId.length > 0) {
					///Rechazar WF SCP
					var contextReject = {
						"MotRechz": $.motivoRechazoERFF,
						"stage": false
					};
					BusyIndicator.show(0);
					WF.rejectTask(taskUSer.taskId, contextReject).then(function (response) {
						MessageBox.success("Se creo nuevo documento preliminar " + oDataDocNuevo.ParkedDocument + " y se rechazo el documento " +
							oModelDocumentoER.ParkedDocument, {
								actions: [MessageBox.Action.OK],
								emphasizedAction: MessageBox.Action.OK,
								onClose: function (sAction) {
									that.oRouter.navTo("default", false);
								}
							});
						BusyIndicator.hide();
						return;
					}).catch(function (error) {
						jQuery.sap.log.error(error);
						if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
							MessageToast.show(error.message);
						}
						BusyIndicator.hide();
					});
				} else {
					MessageToast.show("No existe el User Taskinstance Workflow! ");
					BusyIndicator.hide();
					return;
				}
			}).catch(function (error) {
				jQuery.sap.log.error(error);
				if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
					MessageToast.show(error.message);
				}
				BusyIndicator.hide();
			});
		},
		fnServicioDetSolicitud: function (oModelTablaDetSolicitud) {

			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
				oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				aData = {};

			var aEntrada = oModelTablaDetSolicitud[oVariablesGlobales.Flag];
			//LISTO
			// $.ajax({
			// 	url: "/sap/opu/odata/sap/ZSCP_FI_ENTREGAS_RENDIR_SRV/" + "DetSolicitudSet(Bukrs='" + aEntrada.Bukrs + "',Belnr='" + aEntrada.Belnr +
			// 		"',Gjahr='" + aEntrada.Gjahr + "',Nrpos='" + aEntrada.Nrpos +
			// 		"')",
			// 	method: 'PUT',
			// 	data: aEntrada,
			// 	succes: function (oData, oResponse) {
			// 		oVariablesGlobales.Flag++;

			// 		if (oVariablesGlobales.Flag === oModelTablaDetSolicitud.length) {
			// 			oVariablesGlobales.Flag = 0;
			// 			// oThes.onCargarListaMSolicitud();
			// 			// oThes.fnSubirObservacionDS("6000000044100777"); //test
			// 			//oThes.fnSubirObservacionDS(aEntrada);
			// 			//Actualizar Contexto
			// 			//oThes.fnStartInstanceS();
			// 			// oThes.onIrListaDSolicitud();
			// 			oThes.updateInstance();
			// 			sap.ui.core.BusyIndicator.hide();
			// 			var msj = "Se ha registrado la solicitud " + aEntrada.Belnr + ".";
			// 			oThes.showMessageBox(msj, "success");
			// 		} else {
			// 			oThes.fnServicioDetSolicitud(oModelTablaDetSolicitud);
			// 		}
			// 	},
			// 	error: function (oError) {
			// 		sap.ui.core.BusyIndicator.hide();
			// 		var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
			// 		oThes.showMessageBox(msj, "error");
			// 		return;
			// 	}
			// });

			oModelMaestroSolicitudes.update("/DetSolicitudSet(Bukrs='" + aEntrada.Bukrs + "',Belnr='" + aEntrada.Belnr +
				"',Gjahr='" + aEntrada.Gjahr + "',Nrpos='" + aEntrada.Nrpos +
				"')", aEntrada, {
					success: function (oData, oResponse) {
						oVariablesGlobales.Flag++;

						if (oVariablesGlobales.Flag === oModelTablaDetSolicitud.length) {
							oVariablesGlobales.Flag = 0;
							// oThes.onCargarListaMSolicitud();
							// oThes.fnSubirObservacionDS("6000000044100777"); //test
							//oThes.fnSubirObservacionDS(aEntrada);
							//Actualizar Contexto
							//oThes.fnStartInstanceS();
							// oThes.onIrListaDSolicitud();
							oThes.updateInstance();
							sap.ui.core.BusyIndicator.hide();
							var msj = "Se ha registrado la solicitud " + aEntrada.Belnr + ".";
							oThes.showMessageBox(msj, "success");
						} else {
							oThes.fnServicioDetSolicitud(oModelTablaDetSolicitud);
						}
					},
					error: function (oError) {
						//JORDAN funcion para poder crear el detalle en caso no este en el back
						if (oError.statusCode == '404') {
							oModelMaestroSolicitudes.create("/DetSolicitudSet", aEntrada, {
								success: function (oData, oResponse) {
									oVariablesGlobales.Flag++;

									if (oVariablesGlobales.Flag === oModelTablaDetSolicitud.length) {
										oVariablesGlobales.Flag = 0;
										// oThes.onCargarListaMSolicitud();
										// oThes.fnSubirObservacionDS("6000000044100777"); //test
										//oThes.fnSubirObservacionDS(aEntrada);
										//Actualizar Contexto
										//oThes.fnStartInstanceS();
										// oThes.onIrListaDSolicitud();
										oThes.updateInstance();
										sap.ui.core.BusyIndicator.hide();
										var msj = "Se ha registrado la solicitud " + aEntrada.Belnr + ".";
										oThes.showMessageBox(msj, "success");
									} else {
										oThes.fnServicioDetSolicitud(oModelTablaDetSolicitud);
									}
								},
								error: function (oError) {
									sap.ui.core.BusyIndicator.hide();
									var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
									oThes.showMessageBox(msj, "error");
									return;
								}
							});
						} else {

							sap.ui.core.BusyIndicator.hide();
							var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
							oThes.showMessageBox(msj, "error");
							return;
						}
					}
				});
		},
		updateInstance: function () {
			var that = this;
			var oModelDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData();

			var sIdWorkflow = oModelDocument.IdWorkflow;

			var oModelTablaDetSolicitud = this.getView().byId("idTablaDetalleSolicitud").getModel().getData(),
				aData = {},
				InfoIas = sap.ui.getCore().getModel("oModelIas"),
				oTotal = {},
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
				oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			oTotal.Detalle = "Total";
			oTotal.Wrbtr = this.getView().byId("idImporteTotal").getValue();
			oTotal.Waers = this.getView().byId("idWaers").getProperty("value");
			oModelTablaDetSolicitud.push(oTotal);

			var oOperacion = this.getView().byId("idOperacion"),
				oMoneda = this.getView().byId("idWaers"),
				oReferenciaGeneral = this.getView().byId("idReferencia");

			var oTipoObjCosto = this.getView().byId("inputTipImp"),
				oObjCosto = this.getView().byId("inputCeCo"),
				oObservaciones = this.getView().byId("inputObser");

			//aData.NombreDocumento = "Solicitud";
			//	aData.Nivel = 1;
			//	aData.Bukrs = oData.Bukrs;
			//	aData.Belnr = oData.Belnr;
			//	aData.Gjahr = oData.Gjahr;
			//	aData.Prcid = this.proceso;
			//	aData.Rulid = "";
			//	aData.Iskid = this.SolicitudPrimerNivelAprob;
			//	aData.IskidL2 = this.SolicitudSegundoNivelAprob;
			//	aData.Tabname = that.tablaFiltro;
			//	aData.Fieldname = that.campoFiltro;
			//	aData.Pname = InfoIas.Pname;
			//	aData.Value = InfoIas.Plans;
			//	aData.Isfound = false;
			//	aData.Tabname_search = that.tablaBuscada;
			//	aData.Fieldname_search = that.campoBuscado;
			//	aData.Usuario = InfoIas.Sysid;
			//	aData.Fecha = this.fnFormatearFechaVista(new Date());
			aData.ImporteTotal = this.getView().byId("idImporteTotal").getValue() + " " + this.getView().byId(
				"idWaers").getValue();
			aData.DetalleSol = oModelTablaDetSolicitud;
			//	aData.CorporativeEmail = InfoIas.CorporativeEmail;
			//	aData.PersonalEmail = InfoIas.PersonalEmail;
			//	aData.Type = "S";

			//	aData.SociedadTxt = InfoIas.Butxt;

			//	aData.Operacion = oOperacion.getValue();
			aData.Moneda = oMoneda.getValue();
			aData.ReferenciaGeneral = oReferenciaGeneral.getValue();

			aData.Kstrg = oTipoObjCosto.getValue();
			var sTipo = oTipoObjCosto.getValue().substring(0, 1);

			if (sTipo === "F") {
				aData.Aufnr = oObjCosto.getValue();
				aData.Kostl = "";
			} else {
				aData.Kostl = oObjCosto.getValue();
				aData.Aufnr = "";
			}

			aData.Zobserv = oObservaciones.getValue();
			//aData.idFolderSolicitudGenerada = this.oVariablesJSONModel.getProperty("/idFolderSolicitudGenerada");
			//		aData.identificadorAplicacion = "Entregas a Rendir";

			var that = this;

			WF.updateData(aData, sIdWorkflow).then(function (res) {
				console.log(res);
				that.oRouter.navTo("default", false);

			}).catch(function (error) {
				jQuery.sap.log.error(error);
				that.oRouter.navTo("default", false);
				if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
					MessageBox.error(error.message);
				}
			});
		},
		onIrMain: function () {
			var that = this;
			that.oRouter.navTo("default", false);
		},

		//Inicio creación de gasto
		onValidarLiquidacion: function (oEvent) {
			var oThes = this,
				oModelFFER = oThes.getView().getModel("oDataModelFFER"),
				oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada"),
				sBukrs = oSolicitudSeleccionada.Bukrs,
				sOperation = oSolicitudSeleccionada.Zcat;
			sap.ui.core.BusyIndicator.show(0);
			oModelFFER.read(`/ValidarConfigDiaSet(Bukrs='${sBukrs}',Operation='${sOperation}')`, {
				success: function (oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var iDias = Number(oData.Dias) + 1; // no se tomará en cuenta el día de la contabilización
					var oDate = new Date();
					var oDocumentDate = new Date(oSolicitudSeleccionada.Budat);
					oDocumentDate.setHours(oDocumentDate.getHours() + 5);

					if (Math.ceil(Math.abs(oDate - oDocumentDate)/(1000*60*60*24)) > iDias) {
						return MessageBox.error(oThes.getI18nText("msgValidacionLiquidacionGasto"));
					}
					
					oThes.onCrearGasto();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError);
				}
			});
		},

		onCrearGasto: function () {
			var oModelDetailDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData();
			if (this.listaGasto !== undefined && this.listaGasto.length > 0) {
				const descuento = (object) => object.Bktxt_sol === "Dscto. al";
				if (this.listaGasto.some(descuento)) {
					return MessageBox.error(this.getI18nText("msgValidacionDescuentoColaborador"));
				}
				return MessageBox.error(this.getI18nText("msgValidacionGastoAsociado"));
			}

			this.getOwnerComponent().setModel(oModelDetailDocument, "oModelDetailDocument");

			return new Promise(function (fnResolve) {
				this.doNavigateGasto("crearGastoEntregaRendir", oModelDetailDocument, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					sap.m.MessageBox.error(err.message);
				}
			});
		},
		//Fin creación de gasto

		////JORDAN////////////////////////////////////////////////////7
		onFileDeleted: function (oEvent) {
			var oDocumentosSolicitudModel = this.getView().getModel("DocumentosSolicitud");
			var aDocumentosSolicitud = oDocumentosSolicitudModel.getData().Files;
			var sDocumentPath = oEvent.getSource().getBindingContext("DocumentosSolicitud").getPath();
			var iIndex = Number(sDocumentPath.split("/Files/")[1]);
			aDocumentosSolicitud.splice(iIndex, 1);
			oDocumentosSolicitudModel.refresh(true);
		},

		onAddFile: function (oEvent) {
			var that = this;
			var file = oEvent.getParameter("files")[0];
			var jsondataAdjunto;
			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			Utils.base64coonversionMethod(file).then(function (result) {
				jsondataAdjunto = {
					"Name": that.llamada(file.name, true),
					"fileName": that.llamada(file.name, true),
					"folderName": "",
					"data": result,
					"size": result.size,
					"bLocal": true
				};

				oDataDocSolicitud.Files.push(jsondataAdjunto);
				oModelDocSolicitud.refresh();
			});
		},

		llamada: function (text, bSolicitud = false) { //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
			var fin = Utils.codificarEntidad(text, bSolicitud);
			fin = Utils.decodificarEntidad(fin);
			return fin;
		},
		//JORDAN SPRINT2
		fnFormatDateSap: function (oDate) {
			console.log(oDate);
			var sDateReturn;
			if (oDate) {
				var sMounth = oDate.getMonth() + 1;
				sDateReturn = oDate.getFullYear() + "-" + sMounth + "-" + oDate.getDate();
				return sDateReturn;
			}
		},
		updateInstanceForDelete: function () {
			var that = this;
			var oModelDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData();

			var sIdWorkflow = oModelDocument.IdWorkflow;

			var oModelTablaDetSolicitud = this.getView().byId("idTablaDetalleSolicitud").getModel().getData(),
				aData = {},
				InfoIas = sap.ui.getCore().getModel("oModelIas"),
				oTotal = {},
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
				oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			oTotal.Detalle = "Total";
			oTotal.Wrbtr = this.getView().byId("idImporteTotal").getValue();
			oTotal.Waers = this.getView().byId("idWaers").getProperty("value");
			///JORDAN COMENTADO SPRINT2
			//oModelTablaDetSolicitud.push(oTotal);
			////
			var oOperacion = this.getView().byId("idOperacion"),
				oMoneda = this.getView().byId("idWaers"),
				oReferenciaGeneral = this.getView().byId("idReferencia");

			var oTipoObjCosto = this.getView().byId("inputTipImp"),
				oObjCosto = this.getView().byId("inputCeCo"),
				oObservaciones = this.getView().byId("inputObser");

			//aData.NombreDocumento = "Solicitud";
			//	aData.Nivel = 1;
			//	aData.Bukrs = oData.Bukrs;
			//	aData.Belnr = oData.Belnr;
			//	aData.Gjahr = oData.Gjahr;
			//	aData.Prcid = this.proceso;
			//	aData.Rulid = "";
			//	aData.Iskid = this.SolicitudPrimerNivelAprob;
			//	aData.IskidL2 = this.SolicitudSegundoNivelAprob;
			//	aData.Tabname = that.tablaFiltro;
			//	aData.Fieldname = that.campoFiltro;
			//	aData.Pname = InfoIas.Pname;
			//	aData.Value = InfoIas.Plans;
			//	aData.Isfound = false;
			//	aData.Tabname_search = that.tablaBuscada;
			//	aData.Fieldname_search = that.campoBuscado;
			//	aData.Usuario = InfoIas.Sysid;
			//	aData.Fecha = this.fnFormatearFechaVista(new Date());
			aData.ImporteTotal = this.getView().byId("idImporteTotal").getValue() + " " + this.getView().byId(
				"idWaers").getValue();
			aData.DetalleSol = oModelTablaDetSolicitud;
			//	aData.CorporativeEmail = InfoIas.CorporativeEmail;
			//	aData.PersonalEmail = InfoIas.PersonalEmail;
			//	aData.Type = "S";

			//	aData.SociedadTxt = InfoIas.Butxt;

			//	aData.Operacion = oOperacion.getValue();
			aData.Moneda = oMoneda.getValue();
			aData.ReferenciaGeneral = oReferenciaGeneral.getValue();

			aData.Kstrg = oTipoObjCosto.getValue();
			var sTipo = oTipoObjCosto.getValue().substring(0, 1);

			if (sTipo === "F") {
				aData.Aufnr = oObjCosto.getValue();
				aData.Kostl = "";
			} else {
				aData.Kostl = oObjCosto.getValue();
				aData.Aufnr = "";
			}

			aData.Zobserv = oObservaciones.getValue();
			//aData.idFolderSolicitudGenerada = this.oVariablesJSONModel.getProperty("/idFolderSolicitudGenerada");
			//		aData.identificadorAplicacion = "Entregas a Rendir";

			var that = this;

			WF.updateData(aData, sIdWorkflow).then(function (res) {
				console.log(res);
				//that.oRouter.navTo("default", false);

			}).catch(function (error) {
				jQuery.sap.log.error(error);
				//that.oRouter.navTo("default", false);
				if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
					MessageBox.error(error.message);
				}
			});
		},

		/**
		 * Sección Visualizar Documento Anterior
		 */
		onVisualizarDocumentoAnterior: function (oEvent) {
			var that = this;
			var oModelDocumento = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			if (oModelDocumento.zdoc) {
				return new Promise(function (fnResolve) {
					that.doNavigateEntregaRendir("detailEntregaRendir", oModelDocumento, fnResolve, "", false);
				})
			} else {
				MessageBox.information("No existe documento anterior");
			}
		},

		doNavigateEntregaRendir: function (sRouteName, oModelDocumento, fnPromiseResolve, sViaRelation, enabledCampos) {
			this.oRouter.navTo(sRouteName, {
				Bukrs: oModelDocumento.Bukrs,
				Belnr: oModelDocumento.zdoc,
				Gjahr: oModelDocumento.Gjahr,
				Enabled: enabledCampos
			}, false);

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},

		//////////////////////////////////////////////////
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */
		//	onExit: function() {
		//
		//	}

	});

});