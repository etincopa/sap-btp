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

	return Controller.extend("com.everis.monitorDocumentos.controller.detailRendicionER", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.everis.monitorDocumentos.view.detailEntregaRendir
		 */
		utils: Utils,
		xmlFragmentObjetoCostoHelp: "com.everis.monitorDocumentos.view.fragment.objetoCostoDialogHelp",
		xmlFragmentTipoObjetoCostoHelp: "com.everis.monitorDocumentos.view.fragment.tipoObjetoCostoDialogHelp",
		xmlFragmentOrdenHelp: "com.everis.monitorDocumentos.view.fragment.ordenDialogHelp",
		xmlFragmentConceptoHelp: "com.everis.monitorDocumentos.view.fragment.conceptoDialogHelp",
		proceso: "",
		regla: "",
		GastoPrimerNivelAprob: "",
		GastoSegundoNivelAprob: "",
		GastoTercerNivelAprob: "",
		tablaFiltro: "",
		campoFiltro: "",
		tablaBuscada: "",
		campoBuscado: "",
		aSharepointIndexes: [],
		handleRouteMatched: function (oEvent) {
			$.ambiente = "QAS";
			$.motivoRechazoERFF = "Anulado en el monitor de estados de aprobación";
			var sBukrs = oEvent.getParameters().data.Bukrs;
			var sBelnr = oEvent.getParameters().data.Belnr;
			var sGjahr = oEvent.getParameters().data.Gjahr;
			var enabledCampos = oEvent.getParameters().data.Enabled;
			var oThes = this;
			var oItemDetalle = {}

			this.getView().setModel(new JSONModel(oItemDetalle), "oModelItemDetalle");

			var oEditFormGasto = {
				"edit": false
			}
			this.getView().setModel(new JSONModel(oEditFormGasto), "oEditFormGasto");
			var oJson = {
				"ImportGrav": false,
				"ImportNoGrav": false,
				"ImportTotal": false,
				"Importe": false,
			}
			oThes.getView().setModel(new JSONModel(oJson), "oModelHelp");

			var oJson2 = {
				"VisibleIndicadorRet": false,
				"SelectedIndicadorRet": false,
				"EditableIndicadorRet": false,
				"VisibleIndicadorDet": false,
				"SelectedIndicadorDet": false,
				"VisibleConstancia": false,
				"EditableConstancia": false,
				"VisibleFechaDet": false,
				"EditableFechaDet": false,
				"VisiblePorcDet": false,
				"VisibleImporteDet": false,
				"VisiblePorcRet": false,
				"VisibleImporteRet": false

			}
			oThes.getView().setModel(new JSONModel(oJson2), "oModelIndicadores");

			var oJson3 = {
				"NameIndImp": "Ind.Impuesto",
				"EditableIndImp": false
			}
			oThes.getView().setModel(new JSONModel(oJson3), "oModdelValueName");
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "Documents");

			var oVariablesGlobales = {};
			oVariablesGlobales.repeticion = 0;
			oVariablesGlobales.carpetaEntregasRendir = "ENTREGASRENDIR";
			oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
			oVariablesGlobales.carpetaGasto = "GASTOS";
			sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");
			//var userModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true");
			//userModel.attachRequestCompleted(function onCompleted(res) {
			//	if (res.getParameter("success")) {
			//		var oUserIas = JSON.parse(this.getJSON());
                    var oUserIas = sap.ui.getCore().getModel("oUserIAS").getData();
					oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + oUserIas.name + "')", {
						//oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/IasSet('" + "Q08275964" + "')", { //test*
						success: function (result) {
							if (result.Bukrs !== null && result.Bukrs !== "" && result.Bukrs !== undefined) {
								sap.ui.getCore().setModel(result, "oModelIas");
								///JORDAN SPRINT 3
								//oThes.getDocEntregaRendir(sBukrs, sBelnr, sGjahr, enabledCampos);
								oThes.getDocRendicionER(sBukrs, sBelnr, sGjahr, enabledCampos);
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
								///
							} else {
								MessageBox.error("No asignado al proceso de aprobación");
							}

						},
						error: function (error) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(error);
						}
					});
				//} else {
				//	MessageBox.error("Ha ocurrido un error al recuperar la informacion del usuario");
				//}
			//});
		},

		onInit: function () {
			this.getView().setModel(new JSONModel([]), "DocumentosBoleta");
			this.getView().setModel(new JSONModel([]), "DocumentoPosicion");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("detailRendicionER").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
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
					that.fnCargarDataOperacion();					
				},
				error: (xhr, status, error) => {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				},
			});
		},
		getDocRendicionER: function (sBukrs, sBelnr, sGjahr, enabledCampos) {
			var oThes = this;
			oThes.enabledCampos = enabledCampos;
			var query = "/zsolicitudSet(Bukrs='" + sBukrs + "',ParkedDocument='" + sBelnr + "',Gjahr='" + sGjahr + "')";
			this.getOwnerComponent().getModel("oDataModelEntregasRendir").read(query, {
				success: function (res) {
					sap.ui.core.BusyIndicator.show(0);
					var oSolicitudSeleccionada = res;
					oThes.byId("idPagDetRendicionER").setTitle(oSolicitudSeleccionada.ParkedDocument +
						" - Usuario: " + oSolicitudSeleccionada.Bktxt + " - Sociedad: " + oSolicitudSeleccionada.Bukrs);
					var sZcat;
					sZcat = oSolicitudSeleccionada.ZCAT_S + " - " + oSolicitudSeleccionada.ZCATTEXT_S;
					oSolicitudSeleccionada.sZcatCompleto = sZcat;
					if (oSolicitudSeleccionada.Eratx && oSolicitudSeleccionada.Eratx !== "") {
						oSolicitudSeleccionada.FlagAdicional = true;
					} else {
						oSolicitudSeleccionada.FlagAdicional = false;
					}
					sap.ui.getCore().setModel(oSolicitudSeleccionada, "oSolicitudSeleccionada");

					///TIPO DE CAMBIO
					// var dFechaTipoCambio = Utils.fnFormatearFechaVista(new Date);
					// dFechaTipoCambio = Utils.fnFormatearFechaSAP(dFechaTipoCambio);
					// if (oSolicitudSeleccionada.Waers != "PEN") {
					// 	//oThes.obtenerTipoCambio(dFechaTipoCambio, "USD");
					// 	oThes.obtenerTipoCambio(dFechaTipoCambio, oSolicitudSeleccionada.Waers);
					// }
					///FECHA DETRACCION MAXIMA
					oThes.getView().byId("idFechaDetracccionDetER").setMinDate(new Date());

					///habiliata campos de edicion
					var sType;
					if (oThes.enabledCampos == "true") {
						sType = "Active";
					} else {
						sType = "Inactive";
					}
					var oEdicion = {
						"edit": (enabledCampos === "true"),
						"type": sType
					};
					if (oSolicitudSeleccionada.zdoc) {
						oEdicion["existeDocumentoAnterior"] = true;
					} else {
						oEdicion["existeDocumentoAnterior"] = false;
					}
					var modelEdicion = new JSONModel(oEdicion);
					oThes.getView().setModel(modelEdicion, "oEdicion");
					oThes.getView().byId("frmDetRendicionER").setModel(new JSONModel(oSolicitudSeleccionada));
					oThes.getView().byId("idAdicionales").setSelectedKey(oSolicitudSeleccionada.Eratx);

					oThes.getConceptosAdicionales();
					oThes.fnCargarDataComboSunat();
					//oThes.onCargarTablaDetRendicion();
					//oThes.loadTipoObjetoCosto();
					//oThes.loadObjetoCosto();

					// if (oSolicitudSeleccionada.Status !== "A" && oSolicitudSeleccionada.Status !== "X") {
					// 	oThes.getView().byId("idCrearGastoxSol").setVisible(false);
					// } else {
					// 	oThes.getView().byId("idCrearGastoxSol").setVisible(true);
					// }

					//Obtener la fecha de tolerancia

					oThes.getView().byId("idFechaFacturaDetER").setValue(Utils.fnFormatearFechaVista(new Date(), false));
					var dFechaFectura = oSolicitudSeleccionada.Bldat;

					var dFechFactTol = dFechaFectura.getMonth() + 1;
					var oDataModelEntregasRendir = oThes.getOwnerComponent().getModel("oDataModelEntregasRendir");
					var that = oThes;
					oDataModelEntregasRendir.read("/ToleranciaSet(Gjahr='" + oSolicitudSeleccionada.Gjahr + "',Monat='" + dFechFactTol + "')", {
						success: function (val) {
							var fechaTolerancia = new Date();
							var tolerancia = parseInt(val.Ztole);
							fechaTolerancia.setDate(fechaTolerancia.getDate() - tolerancia);
							that.getView().byId("idFechaFacturaDetER").setMinDate(fechaTolerancia);
							that.getView().byId("idFechaFacturaDetER").setMaxDate(new Date());
						},
						error: function (oError) {
							console.log(oError);
						}
					});
					oThes.fnChangeTxt();
				},
				error: function (err) {
					console.log(err);
				}
			});
		},

		onCargarTablaDetRendicion: function () {
			var oThes = this,
				aFilter = [],
				oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
			aFilter.push(new Filter("Belnr", FilterOperator.EQ, oSolicitudSeleccionada.ParkedDocument));
			aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));
			//sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/DetGastoSet", {
				filters: aFilter,
				success: function (result, status, xhr) {
					var aDetalles = result.results;
					oThes.aSharepointIndexes = [];
					aDetalles.forEach((oDetalle) => {
						oDetalle.Zuonr = `${oDetalle.Tipo_doc_sunat}${oDetalle.Serie}${oDetalle.Correlativo}`;
						oThes.aSharepointIndexes.push(Number(oDetalle.Nrpos));
					});
					sap.ui.getCore().setModel(aDetalles, "oTablaDetRendicion");
					var tblModel = oThes.getView().byId("idTablaDetalleRendicionER").getModel();
					if (!tblModel) {
						var oModel = new JSONModel(aDetalles);
						oModel.setSizeLimit(1000);
						oThes.getView().byId("idTablaDetalleRendicionER").setModel(oModel);
					} else {
						tblModel.setSizeLimit(1000);
						tblModel.setData(aDetalles);
						tblModel.refresh();
					}
					oThes.getView().byId("idTablaDetalleRendicionER").getModel().refresh();
					oThes.loadTipoObjetoCosto();
					oThes.obtenerTotales();
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
				}
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
					EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
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
			// 	sFileUrl = "/sap/fiori/monitordocumentos/" + sFileUrl + "/" + relativePath;
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
			var oValue = oEvent.getParameter("value");
			var sValue = Number.isNaN(oValue) ? "0" : oValue.toString();
			var aTemp = sValue.split(".");
			if (aTemp.length > 1) {
				oInput.setValue(aTemp[0] + "." + aTemp[1].padEnd(2, "0"));
			} else {
				oInput.setValue(sValue + ".00");
			}
		},
		
		onChangeImportesGravado: function (oEvent) {
			this.onChangeImportes(oEvent);
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
		handleConceptValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			//	var aConceptos = this.oVariablesJSONModel.getData().conceptos;
			// create value help dialog
			//
			var tbldetall = this.getView().byId("idTablaDetalleSolicitud").getModel().getData();
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentConceptoHelp, this);
				sap.ui.core.BusyIndicator.show();
				var that = this;
				var concepts = [];
				that.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ConceptoSet", {
					success: function (res) {

						for (var i = 0; i < res.results.length; i++) {

							for (var j = 0; j < tbldetall.length; j++) {
								if (res.results[i].Zconc === tbldetall[j].Zconc) {
									res.results.splice(i, 1);
								}
							}
						}
						that.getView().setModel(new JSONModel(res.results), "oModelConcepto");
						that.getView().getModel("oModelConcepto").refresh();
						//that.oVariablesJSONModel.setProperty("/conceptos/", res.results);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						var msj = that.getI18nText("appErrorMsg");
						that.showMessageBox(msj, "warning");
					}
				});

				sap.ui.core.BusyIndicator.hide();
				// var temp = [{c:"Alimentación"},{c:"Hospedaje"},{c:"Movilidad"}];
				// this.oVariablesJSONModel.setProperty("/conceptos/", temp);
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

			var nameControl = oEvent.getSource().data("nameControl");
			var oFila = oEvent.getSource().getParent(),
				oTbl = this.getView().byId(nameControl),
				idx = oFila.getBindingContextPath(),
				oImporteTotal = this.getView().byId("idImporteTotal");
			idx = idx.charAt(idx.lastIndexOf('/') + 1);
			idx = parseFloat(idx);
			///JORDAN SPRINT2
			var oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			var oCabSol = {};
			var oModelDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData();
			var oThes = this;

			oCabSol.Bukrs = oModelDocument.Bukrs;
			oCabSol.ParkedDocument = oModelDocument.ParkedDocument;
			oCabSol.Gjahr = oModelDocument.Gjahr;
			oCabSol.Budat = this.fnFormatDateSap(oModelDocument.Budat) + "T00:00:00";
			oCabSol.Bldat = this.fnFormatDateSap(oModelDocument.Bldat) + "T00:00:00";
			oCabSol.Xblnr = oModelDocument.Xblnr;
			oCabSol.Ztyp = oModelDocument.Ztyp;
			oCabSol.Waers = oModelDocument.oWaers;
			//oCabSol.Wrbtr = oModelDocument.Wrbtr;
			oCabSol.Status = oModelDocument.Status;
			oCabSol.Bktxt = oModelDocument.Bktxt;
			oCabSol.Sgtxt = oModelDocument.Xblnr;
			oCabSol.Hkont = oModelDocument.Hkont; //oCuenMayor.getValue();
			oCabSol.Zcat = oModelDocument.Zcat;
			oCabSol.Segment = oModelDocument.Segment;
			oCabSol.Uname = oModelDocument.Uname;
			oCabSol.Kstrg = oModelDocument.Kstrg.split(" -")[0];
			oCabSol.Aufnr = oModelDocument.Aufnr;
			oCabSol.Zobserv = oModelDocument.Zobserv;
			//IDWORKFLOW
			oCabSol.Ztyp = "B";
			oCabSol.IdWorkflow = oModelDocument.IdWorkflow;

			///JORDAN///Agregue el MESSAGE BOX como validacion
			MessageBox.warning("¿Esta seguro de que desea eliminar la fila seleccionada?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						if (idx !== -1) {

							var oModel = oTbl.getModel(),
								data = oModel.getData();
							oImporteTotal.setValue(oImporteTotal.getValue() - Number(data[idx].Wrbtr));
							oCabSol.Wrbtr = oImporteTotal.getValue();
							////JORDAN////

							oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + oCabSol.Bukrs + "',ParkedDocument='" + oModelDocument.ParkedDocument +
								"',Gjahr='" +
								oModelDocument.Gjahr +
								"')", oCabSol, {
									success: function (oData, oResponse) {
										oModelMaestroSolicitudes.remove("/DetSolicitudSet(Bukrs='" + data[idx].Bukrs + "',Belnr='" + data[idx].Belnr +
											"',Gjahr='" + data[idx].Gjahr + "',Nrpos='" + data[idx].Nrpos + "')", {
												success: function () {
													var removed = data.splice(idx, 1);
													// Check return value of data. // If data has an hierarchy. Ex: data.results 
													// var removed =data.results.splice(idx,1);
													oModel.setData(data);

													// var aDataPos = oTbl.getModel().getData(),
													// 	iPosicion = 0;

													// $.each(aDataPos, function (pos, ele) {
													// 	iPosicion++;
													// 	ele.Nrpos = String(iPosicion);
													// });
													// oTbl.getModel().setData(aDataPos);
													// if (oTbl.getModel().getData().length === 0) {
													// 	this.getView().byId("idWaers").setEnabled(true);
													// }
													oThes.updateInstanceForDelete();
													oTbl.getModel().refresh();
												},
												error: function (oError) {
													var msj = "Ocurrió un error en SAP.\n\nNo se ha podido eliminar la fila " + data[idx].Nrpos + ".";
													this.showMessageBox(msj, "error");
													return;
												}
											});
									},
									error: function (oError) {
										if (oError.responseText !== "") {
											var txt = "Ocurrió un error en SAP.\n\n" + JSON.parse(oError.responseText).error.message.value + "\n" +
												JSON.parse(oError.responseText).error.code;
											MessageBox.error(txt);
										} else {
											MessageBox.error(
												"Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas.");
										}
									}
								});
							//////////////////////////
						}
					}
				}
			});

			//	this.fnAgregarConcepto(removed[0].Zconc);
		},
		fnAgregarConcepto: function (sConcepto) {
			var aConceptos = this.oVariablesJSONModel.getProperty("/conceptos");
			for (var i = 0; i < aConceptos.length; i++) {
				if (aConceptos[i].Zconc === sConcepto) {
					return;
				}
			}
			aConceptos.push({
				Zconc: sConcepto
			});
			this.oVariablesJSONModel.setProperty("/conceptos/", aConceptos);
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
		fnRemoverConcepto: function (sConcepto) {
			var aConceptos = this.oVariablesJSONModel.getProperty("/conceptos");
			for (var i = 0; i < aConceptos.length; i++) {
				if (aConceptos[i].Zconc === sConcepto) {
					aConceptos.splice(i, 1);
					this.oVariablesJSONModel.setProperty("/conceptos/", aConceptos);
					return;
				}
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
			//this.fnRemoverConcepto(oDetSol.Zconc);
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
			//var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
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
			oCabSol.Budat = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00";
			oCabSol.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
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
			//IDWORKFLOW
			oCabSol.Ztyp = "B";
			oCabSol.IdWorkflow = oModelDocument.IdWorkflow;
			sap.ui.core.BusyIndicator.show(0);
			console.log("oCabSol")
			console.log(oCabSol)

			///Eliminacion Logica

			/*		var oEliminacion = {};
					oEliminacion.Type = "Z";
					oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + oCabSol.Bukrs + "',ParkedDocument='" + oModelDocument.ParkedDocument +
						"',Gjahr='" +
						oModelDocument.Gjahr +
						"')", oEliminacion, {
							success: function () {*/

			oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + oCabSol.Bukrs + "',ParkedDocument='" + oModelDocument.ParkedDocument +
				"',Gjahr='" +
				oModelDocument.Gjahr +
				"')", oCabSol, {
					success: function (oData, oResponse) {

						var msg = JSON.parse(oResponse.headers["sap-message"]);
						if (msg.severity === "success") {
							//MessageBox.success(msg.message);
							console.log(oData)

							oThes.fnGrabarDetalleSolicitud(oData);
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
			/*			},
					error: function () {
							MessageBox.error(
								"Ocurrió un error al intentar Actualizar su documento, póngase en contacto con su departamento de Sistemas.");
						}
					});*/

			//al terminar debe añadirse acá el limpiado de los campos
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
			// 			// oThes.fnSubirObservacionDS("6000000044100777"); 
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
							// oThes.fnSubirObservacionDS("6000000044100777"); 
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
										// oThes.fnSubirObservacionDS("6000000044100777"); 
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
			var oModelDocument = this.getView().byId("frmDetRendicionER").getModel().getData();

			var sIdWorkflow = oModelDocument.IdWorkflow;

			var oModelTablaDetSolicitud = this.getView().byId("idTablaDetalleRendicionER").getModel().getData(),
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
		onCrearGasto: function (oEvent) {

			//var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
			//	var sProceso = oObject.IdProceso;
			//	var sSubProceso = oObject.ProcesoWf;
			//	var sId = oEvent.getSource().getBindingContext("oModelDocumento").getObject().NroDocumento;

			var resultPendiente = [];
			var oModelDetailDocument = this.getView().byId("frmDetailEntregaRendir").getModel().getData();
			var nroSol = oModelDetailDocument.ParkedDocument;
			var Gjahr = oModelDetailDocument.Gjahr;
			if (this.listaGasto !== undefined) {
				resultPendiente = this.listaGasto.filter(function (ele) {
					return (ele.Sgtxt === nroSol && (ele.Status === "P" || ele.Status === "A") && !ele.FlagRev && ele.Gjahr === Gjahr);
				});
			}
			//resultPendiente = []; //BRAD
			if (resultPendiente.length >= 1) {
				var message = "La solicitud ya tiene un gasto asociado.";
				MessageBox.error(message);
				return;
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
		onFileDeletedERFF: function (oEvent) {

			var dataFilePosicion = this.getView().getModel("DocumentoPosicion").getData();
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var Ztyp = oSolicitudSeleccionada.Ztyp,
				Gjahr = oSolicitudSeleccionada.Gjahr,
				Bukrs = oSolicitudSeleccionada.Bukrs,
				ParkedDocument = oSolicitudSeleccionada.ParkedDocument,
				sRoute = "";
			if (Ztyp == "S") {
				sRoute = $.ambiente + "/";
				if (Bukrs === "1000") {
					sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "SOLICITUDES" + "/" + ParkedDocument;
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "SOLICITUDES" + "/" + ParkedDocument;
				}
			} else if (Ztyp == "G") {
				sRoute = $.ambiente + "/";
				if (Bukrs === "1000") {
					sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + ParkedDocument + Bukrs + Gjahr + "/" +
						dataFilePosicion.Nrpos;
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + ParkedDocument + Bukrs + Gjahr + "/" +
						dataFilePosicion.Nrpos;
				}
			}

			var that = this;
			var dataView = this.getView().getModel("DocumentosSolicitud").getData();
			sap.ui.core.BusyIndicator.show();
			var objectFile = oEvent.getSource().getBindingContext("DocumentosSolicitud").getPath();
			var sPath = objectFile.split("/Files/")[1];

			var file = dataView.Files[sPath].properties;

			DS.deleteFile(sRoute, file).then(oResult => {
				dataView.Files.splice(sPath, 1);
				dataView.splice(sPath, 1);
				that.getView().getModel("DocumentosSolicitud").updateBindings();
			});

			sap.ui.core.BusyIndicator.hide();
		},

		onAddFile: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var file = oEvent.getParameter("files")[0];
			var jsondataAdjunto;
			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var dataFilePosicion = this.getView().getModel("DocumentoPosicion").getData();

			var Ztyp = oSolicitudSeleccionada.Ztyp,
				Gjahr = oSolicitudSeleccionada.Gjahr,
				Bukrs = oSolicitudSeleccionada.Bukrs,
				ParkedDocument = oSolicitudSeleccionada.ParkedDocument,
				sRoute = "";
			if (Ztyp == "S") {
				sRoute = $.ambiente + "/";
				if (Bukrs === "1000") {
					sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "SOLICITUDES" + "/" + ParkedDocument;
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "SOLICITUDES" + "/" + ParkedDocument;
				}
			} else if (Ztyp == "G") {
				sRoute = $.ambiente + "/";
				if (Bukrs === "1000") {
					sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + ParkedDocument + Bukrs + Gjahr + "/" +
						dataFilePosicion.Nrpos;
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + ParkedDocument + Bukrs + Gjahr + "/" +
						dataFilePosicion.Nrpos;
				}
			}
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
				DS.addFile(sRoute, jsondataAdjunto).then(oResult => {

					DS.getFile(sRoute).then(function (oResult) {
						oDataDocSolicitud.Files = oResult[1];
						oDataDocSolicitud.url = oResult[0];
						oDataDocSolicitud.dsroot = oResult[2];
						oModelDocSolicitud.refresh();
					}.bind(this));

				});
			});
			sap.ui.core.BusyIndicator.hide();
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
		formatSwitch: function (sState) {
			if (sState === "X") {
				return true;
			} else {
				return false;
			}
		},
		onOpenDialogRencicionPosicion: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var dataFila = oEvent.getSource().getBindingContext().getObject();
			var oThes = this;
			var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var sIdWorkflow = oSolicitudSeleccionada.IdWorkflow;
			//var sIdWorkflow = "baa0e587-c137-11ea-9128-00163ea40ce6"; //test*
			var oModelDocSolicitud = this.getView().getModel("DocumentosSolicitud");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			var NroPos = dataFila.Nrpos;
			var iIndex = Number(NroPos) - 1;
			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();

			///JORDAN///
			oThes.oSolicitudSeleccionada = oSolicitudSeleccionada;
			//////////
			//var idFolder = res.idFolderSolicitudGenerada;
			//var idFolder = "-BY9cK2Fby_b9BbHJH9guL8OtJcT6zNgRc-ndHPYbUs"; 
			///JORDAN///
			var Ztyp = oThes.oSolicitudSeleccionada.Ztyp,
				Bukrs = oThes.oSolicitudSeleccionada.Bukrs,
				ParkedDocument = oThes.oSolicitudSeleccionada.ParkedDocument,
				Gjahr = oThes.oSolicitudSeleccionada.Gjahr,
				sRoute = oParametersModel.AMBIENTE + "/" + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr + "/" + this.aSharepointIndexes[iIndex];

			if (dataFila.Imagen) {
				//var aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto");
				var that = this;

				var adj = dataFila.Imagen;
				this.getView().getModel("DocumentosBoleta").setData(adj);
				//$.estadoFiles = 2;
				if (that._dialogAttach) {
					that._dialogAttach = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.AttachBoleta", that);
					that.getView().addDependent(that._dialogAttach);
				}
				that._dialogAttach.open();
				sap.ui.core.BusyIndicator.hide();
			} else {
				this.getView().getModel("DocumentoPosicion").setData(dataFila);
				/////////////
				if (!oThes._oDialogFiles) {
					Fragment.load({
						id: "dialogFilesRendicionER",
						name: "com.everis.monitorDocumentos.view.fragment.AttachPosicion",
						controller: oThes
					}).then(function (oPopover) {
						oThes._oDialogFiles = oPopover;
						oThes.getView().addDependent(oThes._oDialogFiles);
						EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
							oDataDocSolicitud.Files = aFiles;
							oDataDocSolicitud.Route = sRoute;
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
					EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
						oDataDocSolicitud.Files = aFiles;
						oDataDocSolicitud.Route = sRoute;
						oModelDocSolicitud.refresh();
						sap.ui.core.BusyIndicator.hide();
						oThes._oDialogFiles.open();
					}.bind(oThes)).catch((oError) => {
						console.log(oError);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oThes.getI18nText("msgSharepointError"));
					});
				}
			}
		},
		editItemDetalle: function (oEvent) {
			var oThes = this;
			var oEditFormGastoModel = this.getView().getModel("oEditFormGasto");
			var oEditFormGasto = oEditFormGastoModel.getData();
			oEditFormGasto.edit = true;
			oEditFormGastoModel.refresh();
			var itemModelDetalle = oEvent.getParameter("listItem").getBindingContext().getObject();

			var idOperacionDet = this.getView().byId("idOperacionDetER"),
				idCuentaMyrDet = this.getView().byId("idCuentaMyrDetER"),
				idRUCDet = this.getView().byId("idRUCDetER"),
				idRazSocDet = this.getView().byId("idRazSocDetER"),
				idIndImpDet = this.getView().byId("idIndImpDetER"),
				idImporteDDet = this.getView().byId("idImporteDDetER"),
				idTipoDocSDet = this.getView().byId("idTipoDocSDetER"),
				idSerieDet = this.getView().byId("idSerieDetER"),
				idCorrDet = this.getView().byId("idCorrDetER"),
				idFechaFacturaDet = this.getView().byId("idFechaFacturaDetER");

			idOperacionDet.setSelectedKey(itemModelDetalle.ZCat);
			idCuentaMyrDet.setValue(itemModelDetalle.Saknr);
			idRUCDet.setValue(itemModelDetalle.Dzuonr);
			idRazSocDet.setValue(itemModelDetalle.Sgtxt);
			idIndImpDet.setSelectedKey(itemModelDetalle.WtWithcd);
			idImporteDDet.setValue(itemModelDetalle.Wrbtr);
			idTipoDocSDet.setSelectedKey("0");
			idTipoDocSDet.setEditable(false);
			idSerieDet.setValue(itemModelDetalle.Serie);
			idSerieDet.setEditable(false);
			idCorrDet.setValue(itemModelDetalle.Correlativo);
			idCorrDet.setEditable(false);
			idFechaFacturaDet.setDateValue(itemModelDetalle.Bldat);

			this.addImporteTotal();

			this.getView().getModel("itemModelDetalle").setData(itemModelDetalle);

			var oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var dFechaFectura = oModelDetailDocument.Bldat;
			//Obtener la fecha de tolerancia
			var dFechFactTol = dFechaFectura.getMonth() + 1;
			var oDataModelEntregasRendir = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			oDataModelEntregasRendir.read("/ToleranciaSet(Gjahr='" + oModelDetailDocument.Gjahr + "',Monat='" + dFechFactTol + "')", {
				success: function (val) {
					oThes.getView().byId("idFechaFacturaDet").setMinDate(new Date(val.Gjahr, val.Monat - 1, val.Ztole));
				},
				error: function (oError) {
					console.log(oError);
				}
			});
		},
		fnCargarDataOperacion: function () {
			var oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				aComboOperacion = [],
				aFilter = [],
				oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");
				// oAdicionalSeleccionado = oThes.getView().byId("idAdicionales").getSelectedItem().getBindingContext("oAdicionalModel").getObject();
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
					oThes.getView().setModel(new JSONModel(aComboOperacion), "oModelOperaciones");
					var oModelOperacion = new JSONModel(aComboOperacion);
					oModelOperacion.setSizeLimit(1000);
					oThes.getView().byId("idOperacionDetER").setModel(oModelOperacion);
					oThes.getView().byId("idOperacionDetER").setSelectedKey();
					oThes.fnChangeTxt();
					oThes.onCargarTablaDetRendicion();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		fnCargarDataComboSunat: function () {
			///JORDAN SPRINT 3
			var oThes = this,
				oModel = oThes.getOwnerComponent().getModel("oDataModelFondoFijo"),
				aComboSunat = [];
			var oModelDetailDocument = this.getOwnerComponent().getModel("oSolicitudSeleccionada");
			var Zapp = "2";
			// if (oModelDetailDocument.ZcatText == "Solicitud de Entregas a rendir") {
			// 	Zapp = "6";
			// }
			var aFilter = [];
			aFilter.push(new Filter("Zapp", FilterOperator.EQ, Zapp));
			////
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/ListasSet", {
				filters: aFilter,
				success: function (result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
					$.each(result.results, function (pos, ele) {
						//if (ele.Pkey != "") {
						aComboSunat.push(ele);
						//}
					});
					oThes.getView().byId("idTipoDocSDetER").setModel(new JSONModel(aComboSunat));
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		fnChangeTxt: function () {
			var op = this.getView().byId("idOperacionDetER").getSelectedKey();
			var oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				InfoIas = sap.ui.getCore().getModel("oModelIas");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + op + "')", {
				success: function (result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
					if (result.Txt50 !== "") {
						oThes.getView().byId("idCuentaMyrDetER").setValue(result.Hkont);
						//oThes.getView().byId("idButtonAdd").setVisible(true);
					} else {
						oThes.getView().byId("idCuentaMyrDetER").setValue("No existe Cuenta Mayor");
						//oThes.getView().byId("idButtonAdd").setVisible(false);
					}
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		
		onValidRucRetencion: function (oEvent) {
			this.onValidRuc(oEvent);                       
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
							that.getView().byId("idRazSocDetER").setValue(result.EpName);
							///JORDAN SPRINT 3
							var InfoIas = sap.ui.getCore().getModel("oModelIas");
							var sDocument = that.getView().byId("idTipoDocSDetER")._getSelectedItemText();
							var ImporteTotal = that.getView().byId("idImportTotalDetER").getValue();
							if (sDocument != "Recibo por Honorarios" && sDocument && ImporteTotal > 700) {
								that.onValid_Ret_Det(result.IpRuc, InfoIas.Bukrs);
							}
							/////////
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
				////JORDAN SPRINT 3
				var InfoIas = sap.ui.getCore().getModel("oModelIas");
				var sDocument = that.getView().byId("idTipoDocSDetERDetER")._getSelectedItemText();
				var ImporteTotal = that.getView().byId("idImportTotalDetER").getValue();
				if (sDocument != "Recibo por Honorarios" && sDocument && ImporteTotal > 700) {
					that.onValid_Ret_Det(val, InfoIas.Bukrs);
				}
				//////////////
				input.setValue("");
				that.getView().byId("idRazSocDetER").setValue("");
				MessageBox.error(this.getI18nText("msgValidacionRuc"));
			}
		},
		onValid_Ret_Det: function (Ruc, Bukrs) {
			var oDataModelEntregasRendir = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			var oThes = this;
			var oModelIndicadores = this.getView().getModel("oModelIndicadores");
			var oDataIndicadores = oModelIndicadores.getData();
			sap.ui.core.BusyIndicator.show(0);

			var aFilter = [];
			aFilter.push(new Filter("Taxnum", FilterOperator.EQ, Ruc));
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, Bukrs));

			oDataModelEntregasRendir.read("/TipoRetencionSet", {
				filters: aFilter,
				success: function (oResult) {
					if (oResult.results.length != 0) {

						for (var i = 0; i < oResult.results.length; i++) {
							if (oResult.results[i].Witht == "DE" || oResult.results[i].Witht == "RP") {
								if (oResult.results[i].Witht == "DE") {
									oDataIndicadores.VisibleIndicadorDet = true;
								} else {
									oDataIndicadores.VisibleIndicadorRet = true;
								}
							}
						}

						oDataModelEntregasRendir.read("/TipoProveedorSet('" + Ruc + "')", {
							success: function (oResult) {
								if (oResult) {

									if (oResult.Tipo != "B") { //No es buen contribuyente
										oDataIndicadores.EditableIndicadorRet = false;
										oDataIndicadores.SelectedIndicadorRet = false;
									} else {
										oDataIndicadores.EditableIndicadorRet = true;
									}

								}
								sap.ui.core.BusyIndicator.hide();
								oModelIndicadores.refresh();
							},
							error: function (oError) {
								oDataIndicadores.EditableIndicadorRet = true;
								oDataIndicadores.SelectedIndicadorRet = false;
								sap.ui.core.BusyIndicator.hide();
								console.log(oError);
								oModelIndicadores.refresh();
							}
						});
					} else {
						oDataIndicadores.VisibleIndicadorDet = false;
						oDataIndicadores.VisibleConstancia = false;
						oDataIndicadores.VisibleFechaDet = false;
						oDataIndicadores.VisibleIndicadorRet = false;
						oModelIndicadores.refresh();
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					console.log(oError);
				}
			});
		},

		onFilterSunat: function (oEvent) {
			var idTipoDocS = this.getView().byId("idTipoDocSDetER").getSelectedKey(),
				idCorr = this.getView().byId("idCorrDetER"),
				idSerie = this.getView().byId("idSerieDetER");

			if (idTipoDocS == "05") {
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
			} else {
				idSerie.setValue("");
				idSerie.setMaxLength(4);
				idSerie.setPlaceholder("XXXX"); //serie
				idCorr.setValue(""); //correlativo
				idCorr.setMaxLength(8);
				idCorr.setPlaceholder("XXXXXXXX"); //correlativo
			}

			///JORDAN SPRINT 3
			var sValueItem = this.getView().byId("idTipoDocSDetER")._getSelectedItemText();
			if (sValueItem != "Recibo por Honorarios") {
				var oJson = {
					"ImportGrav": true,
					"ImportNoGrav": true,
					"ImportTotal": true,
					"Importe": false
				}
				var oModdelValueName = this.getView().getModel("oModdelValueName");
				var oDataModel = oModdelValueName.getData();
				this.getView().byId("idIndImpDetER").setSelectedKey("C7");
                this.getView().byId("idIndImpDetER").getItemByKey("C1").mProperties.text = "18%";

				//this.getView().byId("idIndImpDetER").setEditable(false);
				oDataModel.EditableIndImp = true;
				oDataModel.NameIndImp = "Ind.Impuesto";

				oModdelValueName.refresh();

				this.getView().byId("idImporteDDetER").setValue("");
				this.addImporteTotal();
				this.getView().getModel("oModelHelp").setData(oJson);
			} else {
				var oJson = {
					"ImportGrav": false,
					"ImportNoGrav": false,
					"ImportTotal": false,
					"Importe": true
				}
				var oModdelValueName = this.getView().getModel("oModdelValueName");
				var oDataModel = oModdelValueName.getData();
				//***///
				this.getView().byId("idIndImpDetER").setSelectedKey("C7");
                this.getView().byId("idIndImpDetER").getItemByKey("C1").mProperties.text = "8%";

				this.getView().byId("idImportGravadoDetER").setValue("");
				this.getView().byId("idImportNoGravadoDetER").setValue("");
				this.getView().byId("idImportTotalDetER").setValue("0");
				this.addImporteTotal();
				this.getView().getModel("oModelHelp").setData(oJson);

				//this.getView().byId("idIndImpDetER").setEditable(true);
				oDataModel.NameIndImp = "Retención Impuesto";
				oDataModel.EditableIndImp = true;
				oModdelValueName.refresh();
			}
			////
		},
		
		addImporteTotalGravado: function(oEvent) {
			this.addImporteTotal(oEvent);
		},

		fnValidarRucRendicion: function() {
			//Add Ajuste mostrar Retencion o detraccion +OOV
			let sRuc = this.getView().byId("idRUCDetER");
			if(sRuc.getValue() !== "" || sRuc.getValue() !== ''){
				let InfoIas = sap.ui.getCore().getModel("oModelIas");
				
				let aFilter = [];
				aFilter.push(new Filter("Id", FilterOperator.EQ, "5"));
				aFilter.push(new Filter("Bukrs", FilterOperator.EQ, InfoIas.Bukrs));
				aFilter.push(new Filter("Val2", FilterOperator.EQ, sRuc.getValue()));
				
				let oModelInds = this.getView().getModel("oModelIndicadores");
				let oDataInds = oModelInds.getData();
				let oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
				oModel.read("/ValidacionSet", {
					filters: aFilter,
					success: function (result) {
						if (result.results.length !== 0) {
							let oResult = result.results[0];
							if (oResult.Val3 === "S") {
								oDataInds.VisibleIndicadorRet = false;
							}else if (oResult.Val3 === "E") {
								if(oDataInds.VisibleIndicadorDet) {
									oDataInds.VisibleIndicadorRet = true;	
								}
							}
							oModelInds.refresh();
						}
					},
					error: function (error) {
						sap.ui.core.BusyIndicator.hide();
						console.log(error);
					}
				});	
			}
		},
		
		addImporteTotal: function (oEvent) {
			var TipoDocSunat = this.getView().byId("idTipoDocSDetER")._getSelectedItemText();

			//Validacion impuesto 0% y18%
			var idImportGravado = this.getView().byId("idImportGravadoDetER");
			var IndicadorImpuesto = this.getView().byId("idIndImpDetER");

			if (IndicadorImpuesto._getSelectedItemText() == "0%") {
				idImportGravado.setEnabled(false);
				idImportGravado.setValue(0);
			} else if (IndicadorImpuesto._getSelectedItemText() == "10%" || IndicadorImpuesto._getSelectedItemText() == "18%") {
				idImportGravado.setEnabled(true);
			}

			//

			if (TipoDocSunat != "Recibo por Honorarios") {
				var sIndImpuesto = this.getView().byId("idIndImpDetER")._getSelectedItemText().split("%")[0];
				var indImpuesto = parseFloat(sIndImpuesto);

				var sImportGravado = this.getView().byId("idImportGravadoDetER").getValue();
				var importGravado;
				if (!sImportGravado || sImportGravado == "") {
					importGravado = 0;
				} else {
					importGravado = parseFloat(sImportGravado);
				}

				var sImportNoGravado = this.getView().byId("idImportNoGravadoDetER").getValue();
				var importeNoGravado
				if (!sImportNoGravado || sImportNoGravado == "") {
					importeNoGravado = 0;
				} else {
					importeNoGravado = parseFloat(sImportNoGravado);
				}

				var IGV = importGravado * indImpuesto / 100;
				IGV = this.roundToTwo(IGV);
				this.getView().byId("IGV").setValue(IGV);

				var ImporteTotal = importGravado + (importGravado * indImpuesto / 100) + importeNoGravado;
				ImporteTotal = this.roundToTwo(ImporteTotal);

				this.getView().byId("idImportTotalDetER").fireChange({ value: ImporteTotal });

				//VALIDACION TIPO DE CAMBIO
				// var sMoneda = this.getView().byId("idWaers").getValue();
				// if (sMoneda != "PEN") {
				// 	var TipoCambio = this.getView().getModel("TipoCambioModel").Tipocambio;
				// 	TipoCambio = parseFloat(TipoCambio);
				// 	ImporteTotal = ImporteTotal * TipoCambio;
				// 	ImporteTotal = this.roundToTwo(ImporteTotal);
				// }
				//

				//Indicadores solo cuando es mayor a 700
				if (ImporteTotal > 700) {
					var Ruc = this.getView().byId("idRUCDetER").getValue();
					var InfoIas = sap.ui.getCore().getModel("oModelIas");

					var oModelIndicadores = this.getView().getModel("oModelIndicadores");
					var oDataIndicadores = oModelIndicadores.getData();
					//oDataIndicadores.VisibleIndicadorDet = true;
					//oDataIndicadores.VisibleIndicadorRet = true;
					// oDataIndicadores.VisibleConstancia = true;
					// oDataIndicadores.VisibleFechaDet = true;

					if (Ruc) { //VALIDO SI HAY DATOS EN EL CAMPO RUC
						this.onValid_Ret_Det(Ruc, InfoIas.Bukrs);
					}
					oModelIndicadores.refresh();

				} else {
					var oModelIndicadores = this.getView().getModel("oModelIndicadores");
					var oDataIndicadores = oModelIndicadores.getData();
					oDataIndicadores.VisibleIndicadorDet = false;
					oDataIndicadores.VisibleIndicadorRet = false;
					oDataIndicadores.VisibleConstancia = false;
					oDataIndicadores.VisibleFechaDet = false;
					oDataIndicadores.VisiblePorcDet = false;
					oDataIndicadores.VisibleImporteDet = false;
					this.getView().byId("idRadButRetDetER").setSelected(false);

					// var valueIndicadorDet = this.getView().byId("idIndicadorDet");
					// valueIndicadorDet.setSelected(false);
					// this.onSelectIndicadorDet();

					oModelIndicadores.refresh();
				}
			} else {
				var sIndImpuesto = this.getView().byId("idIndImpDetER")._getSelectedItemText().split("%")[0];
				var indImpuesto = parseFloat(sIndImpuesto);

				var sImporte = this.getView().byId("idImporteDDetER").getValue();
				var importe;
				if (!sImporte || sImporte == "") {
					importe = 0;
				} else {
					importe = parseFloat(sImporte);
				}
				var ImporteTotal = importe + (importe * indImpuesto / 100);
				ImporteTotal = this.roundToTwo(ImporteTotal);

				this.getView().byId("idImportTotalRecHonDetER").fireChange({ value: ImporteTotal });
			}

		},
		roundToTwo: function (num) {
			// return +(Math.round(num + "e+2") + "e-2");
			return (Math.round(num * 100)/100).toFixed(2);
		},
		onSelectRadButRet: function (oEvent) {
			var rButRetencion = oEvent.getSource().getSelected();
			var oModelIndicadores = this.getView().getModel("oModelIndicadores");
			var oIndicadores = oModelIndicadores.getData();
			if (rButRetencion) {
				oIndicadores.VisiblePorcRet = true;
				oIndicadores.VisibleImporteRet = true;
				oIndicadores.VisiblePorcDet = false;
				oIndicadores.VisibleImporteDet = false;
				oIndicadores.VisibleConstancia = false;
				oIndicadores.VisibleFechaDet = false;
			} else {
				oIndicadores.VisiblePorcRet = false;
				oIndicadores.VisibleImporteRet = false;
				oIndicadores.VisiblePorcDet = true;
				oIndicadores.VisibleImporteDet = true;
				oIndicadores.VisibleConstancia = true;
				oIndicadores.VisibleFechaDet = true;
			}

			oModelIndicadores.refresh();

		},

		onSelectRadButDet: function (oEvent) {
			var rButDetraccion = oEvent.getSource().getSelected();
			var oModelIndicadores = this.getView().getModel("oModelIndicadores");
			var oIndicadores = oModelIndicadores.getData();
			if (rButDetraccion) {
				oIndicadores.VisiblePorcRet = false;
				oIndicadores.VisibleImporteRet = false;
				oIndicadores.VisiblePorcDet = true;
				oIndicadores.VisibleImporteDet = true;
				oIndicadores.VisibleConstancia = true;
				oIndicadores.VisibleFechaDet = true;

			} else {
				oIndicadores.VisiblePorcRet = true;
				oIndicadores.VisibleImporteRet = true;
				oIndicadores.VisiblePorcDet = false;
				oIndicadores.VisibleImporteDet = false;
				oIndicadores.VisibleConstancia = false;
				oIndicadores.VisibleFechaDet = false;
			}

			oModelIndicadores.refresh();

		},

		onSelectPorcRet: function (oEvent) {
			console.log("Entro a retencion");
			var porcRet = oEvent.getSource()._getSelectedItemText().split(" ")[1];
			porcRet = parseFloat(porcRet);

			var valueImporteTotal = this.getView().byId("idImportTotalDetER").getValue();
			valueImporteTotal = parseFloat(valueImporteTotal);
			var importeRetencion;
			importeRetencion = valueImporteTotal * porcRet / 100;
			// var sMoneda = sap.ui.getCore().getModel("oSolicitudSeleccionada").Waers;
			// if (sMoneda !== "PEN") {
			// 	var TipoCambio = this.getView().getModel("TipoCambioModel").Tipocambio;
			// 	TipoCambio = parseFloat(TipoCambio);
			// 	importeRetencion = importeRetencion * TipoCambio;
			// }
			importeRetencion = this.roundToTwo(importeRetencion);

			this.getView().byId("idImporteRetencionDetER").setValue(importeRetencion);
		},
		onSelectPorcDet: function (oEvent) {
			console.log("Entro a detraccion");
			var porcDet = oEvent.getSource()._getSelectedItemText().split(" ")[1];
			porcDet = parseFloat(porcDet);

			var valueImporteTotal = this.getView().byId("idImportTotalDetER").getValue();
			valueImporteTotal = parseFloat(valueImporteTotal);
			var importeDetraccion;
			importeDetraccion = valueImporteTotal * porcDet / 100;

			// var sMoneda = sap.ui.getCore().getModel("oSolicitudSeleccionada").Waers
			// if (sMoneda !== "PEN") {
			// 	var TipoCambio = this.getView().getModel("TipoCambioModel").Tipocambio;
			// 	TipoCambio = parseFloat(TipoCambio);
			// 	importeDetraccion = importeDetraccion * TipoCambio;
			// }
			importeDetraccion = this.roundToTwo(importeDetraccion);

			this.getView().byId("idImporteDetraccionDetER").setValue(importeDetraccion);

		},

		onChangeSwitch: function (oEvent) {
			var bState = oEvent.getParameter("state");
			var oSwitch = oEvent.getSource();
			var oModelItem = oSwitch.getParent().getBindingContext();
			var oItemSelected = oModelItem.getObject();
			var oTable = this.getView().byId("idTablaDetalleRendicionER"),
				oTableModel = oTable.getModel(),
				aFilas = oTable.getModel().getData();
			var aResults = aFilas;
			var iIndex = aResults.indexOf(oItemSelected);
			if (oSwitch.getState()) {
				bState = true;
			} else {
				bState = false;
			}
			if (bState) {
				this.onOpenDialog(aResults, iIndex, oSwitch, oTableModel);
				oSwitch.setState(false);
			} else {
				oSwitch.setState(true);
			}
		},
		onOpenDialog: function (aResult, iIndex, oSwitch, oTableModel) {

			this.oSubmitDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Motivo de Rechazo",
				content: [
					new sap.m.Label({
						text: "Observaciones"
					}),
					new sap.m.TextArea({
						editable: false,
						width: "100%",
						value: aResult[iIndex].Zmotivor,
						placeholder: "Motivo de Rechazo (obligatorio)",
						liveChange: function (oEvent) {
							var sText = oEvent.getParameter("value");
							this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
						}.bind(this)
					})
				],
				beginButton: new sap.m.Button({
					type: "Emphasized",
					text: "Guardar",
					enabled: false,
					press: function (oEvent) {
						this.oSubmitDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						this.oSubmitDialog.close();
					}.bind(this)
				})
			});

			this.oSubmitDialog.open();
		},
		formatIndImp: function (oEvent) {
			if (oEvent === "CC") {
				return "10%";
			} else if (oEvent === "C7") {
				return "18%";
			} else if (oEvent === "C7") {
				return "0%";
			} else {
				return oEvent;
			}
			// var Mwskz = oEvent.split("%", 1)[0] + "%";
			// return Mwskz;
		},
		formatOperacion: function (oEvent) {
			var dataComboOperacion = sap.ui.getCore().getModel("aComboOperacion");
			var sOperacion = oEvent;

			var flag = false;
			var count = 0;
			var txtOperacion;
			while (flag == false && count < dataComboOperacion.length) {
				if (dataComboOperacion[count].Zcat == sOperacion) {
					flag = true;
					txtOperacion = dataComboOperacion[count].Txt50;
				}
				count++;
			}
			if (flag == true) {
				return txtOperacion;
			} else {
				return sOperacion;
			}

		},
		//Boton para activar y desactivar el form de Crear Gasto
		activeCrearGasto: function (oEvent) {
			var oEditFormGastoModel = this.getView().getModel("oEditFormGasto");
			var oEditFormGasto = oEditFormGastoModel.getData();
			if (oEditFormGasto.edit == true) {
				oEditFormGasto.edit = false;
				oEditFormGastoModel.refresh();
			} else {
				oEditFormGasto.edit = true;
				oEditFormGastoModel.refresh();
			}
		},
		//Crea el fragmento para el dialogo editar detalle
		editFragmentDetail: function (oEvent) {
			var oThes = this;
			var itemModelDetalle = oEvent.getParameter("listItem").getBindingContext().getObject();
			var aDataCopy = JSON.parse(JSON.stringify(itemModelDetalle));

			this.getView().getModel("oModelItemDetalle").setData(aDataCopy);
			this.getView().getModel("oModelItemDetalle").refresh();
			var sRouteDialog = "com.everis.monitorDocumentos.view.fragment";
			this.setFragment(this, "dialogEditarDetalle", "FrgIdEditDetailRendicionER", "EditDetailRendicionER", sRouteDialog);
		},
		setFragment: function (that, sDialogName, sFragmentId, sNameFragment, sRoute) {
			try {
				if (!that[sDialogName]) {
					that[sDialogName] = sap.ui.xmlfragment(sFragmentId, sRoute + "." + sNameFragment,
						that);
					that.getView().addDependent(that[sDialogName]);
				}
				that[sDialogName].addStyleClass(
					"sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
				)
				that[sDialogName].open();
			} catch (err) {
				//	that.showErrorMessage(that.getI18nText("error"), error);
				console.log(err);
			}
		},

		//Guarda los datos editados de la posicion
		onPressSave: function () {
			//Obtengo los datos del item editado
			var aDataItemDetalle = this.getView().getModel("oModelItemDetalle").getData();
			//Obtengo los items de la tabla para actualizarlos
			var oModelTable = this.getView().byId("idTablaDetalleRendicionER").getModel();
			var dataTableItem = oModelTable.getData();

			//logica para encontrar la posicion que se modificara
			var flag = false;
			var count = 0;
			while (flag == false) {
				if (dataTableItem[count].Nrpos == aDataItemDetalle.Nrpos) {
					flag = true;
				} else {
					count++;
				}
			}
			///Actualizo la posicion
			dataTableItem[count].Correlativo = aDataItemDetalle.Correlativo;
			dataTableItem[count].Dzuonr = aDataItemDetalle.Dzuonr;
			dataTableItem[count].FlagAprob = "X";
			dataTableItem[count].Saknr = aDataItemDetalle.Saknr;
			dataTableItem[count].Serie = aDataItemDetalle.Serie;
			dataTableItem[count].Sgtxt = aDataItemDetalle.Sgtxt;
			dataTableItem[count].Wrbtr = aDataItemDetalle.Wrbtr;
			dataTableItem[count].ZCat = aDataItemDetalle.ZCat;
			dataTableItem[count].Zmotivor = "";
			dataTableItem[count].Detalle = sap.ui.getCore().byId("FrgIdEditDetailRendicionER--idOperacionDetER_Edit")._getSelectedItemText();

			//Refresco el modelo de la tabla
			oModelTable.refresh();
			this.dialogEditarDetalle.close();
			this.obtenerTotales();
		},
		//Cerrar el dialogo
		onPressClose: function () {
			this.dialogEditarDetalle.close();
		},
		onValidRucEdit: function (oEvent) {
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
							sap.ui.getCore().byId("FrgIdEditDetailRendicionER--idRazSocDetER_Edit").setValue(result.EpName);

							// ///JORDAN SPRINT 3
							// var InfoIas = sap.ui.getCore().getModel("oModelIas");
							// var sDocument = that.getView().byId("idTipoDocSDetER")._getSelectedItemText();
							// var ImporteTotal = that.getView().byId("idImportTotalDetER").getValue();
							// if (sDocument != "Recibo por Honorarios" && sDocument && ImporteTotal > 700) {
							// 	that.onValid_Ret_Det(result.IpRuc, InfoIas.Bukrs);
							// }
							/////////
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
			}
		},
		fnChangeTxt_Edit: function (oEvent) {
			var op = oEvent.getSource().getSelectedKey();
			var oModel = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				InfoIas = sap.ui.getCore().getModel("oModelIas");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + op + "')", {
				success: function (result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
					if (result.Txt50 !== "") {
						sap.ui.getCore().byId("FrgIdEditDetailRendicionER--idCuentaMyrDetER_Edit").setValue(result.Hkont);
						//oThes.getView().byId("idCuentaMyrDetER_Edit").setValue(result.Hkont);
						//oThes.getView().byId("idButtonAdd").setVisible(true);
					} else {
						sap.ui.getCore().byId("FrgIdEditDetailRendicionER--idCuentaMyrDetER_Edit").setValue("No existe Cuenta Mayor");
						//oThes.getView().byId("idCuentaMyrDetER_Edit").setValue("No existe Cuenta Mayor");
						//oThes.getView().byId("idButtonAdd").setVisible(false);
					}
				},
				error: function (xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		onValidCorreEdit: function (oEvent) {
			var dataTableItem = this.getView().byId("idTablaDetalleRendicionER").getModel().getData();
			var that = this;
			var oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
			var input = oEvent.getSource();
			var val = oEvent.getSource().getValue();

			var aItemDetalle = this.getView().getModel("oModelItemDetalle").getData();
			var flag = false;
			var count = 0;
			while (flag == false) {
				if (dataTableItem[count].Nrpos == aItemDetalle.Nrpos) {
					flag = true;
				} else {
					count++;
				}

			}
			if (val.length > dataTableItem[count].Correlativo.length) {
				val = val.slice(0, -1);
			}

			if (val !== Utils.onValidNumber(val)) {
				input.setValue(Utils.onValidNumber(val));
			} else {
				input.setValue(val);
			}
		},
		onChangeImportesEdit: function (oEvent) {
			var nameControl = oEvent.getSource().sId;
			var cad = sap.ui.getCore().byId(nameControl).getValue(),
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
			sap.ui.getCore().byId("FrgIdEditDetailRendicionER--idImporteDetalleER").setValue(cade);
			//this.getView().byId(nameControl).setValue(cade);
		},

		//Valida que el numero de constacia sea  numerico	
		valideNumber: function (oEvent) {

			// code is the decimal ASCII representation of the pressed key.
			var evt = oEvent.getSource().getValue();
			var tam = evt.length;
			var cadena = "";
			var code;
			for (var i = 0; i < tam; i++) {
				code = evt[i];
				code = code.charCodeAt();
				if (code >= 48 && code <= 57) { // is a number.
					cadena = cadena + evt[i];
				}
			}
			oEvent.getSource().setValue(cadena);
		},

		fnAgregarDetGasto: function () {
			///JORDAN SPRINT 3
			//Pregunta si es recibo por honorario u otro
			var oIdTipoDocS = this.getView().byId("idTipoDocSDetER");
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
			var Serie = this.getView().byId("idSerieDetER");
			var Correlativo = this.getView().byId("idCorrDetER");
			var sTipDocSunat = this.getView().byId("idTipoDocSDetER")._getSelectedItemText();

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

				var InfoIas = sap.ui.getCore().getModel("oModelIas"),
					oTable = this.getView().byId("idTablaDetalleRendicionER"),
					aFilas = oTable.getModel().getData(),
					oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");

				var aDetGasto = {},
					aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
					iImporteTotalSolicitud = oModelDetailDocument.Wrbtr,
					oFecDoc = this.getView().byId("idFechaFacturaDetER"),
					oFechCon = this.getView().byId("idFechaCont");

				var oIdOperacion = this.getView().byId("idOperacionDetER"),
					//oIdCeco = this.getView().byId("idCeco"),
					//oIdTipoDocS = this.getView().byId("idTipoDocS"),//Lo declaro al inicio
					oIdCorr = this.getView().byId("idCorrDetER"),
					oIdRuc = this.getView().byId("idRUCDetER"),
					oIdIndImp = this.getView().byId("idIndImpDetER"),
					oIdCuentaMyr = this.getView().byId("idCuentaMyrDetER"),
					oIdImporteD = this.getView().byId("idImporteDDetER"),
					oIdSerie = this.getView().byId("idSerieDetER"),
					oIdRazSoc = this.getView().byId("idRazSocDetER"),
					oIdFechaFactura = this.getView().byId("idFechaFacturaDetER"),
					//oIdCheckDevol = this.getView().byId("idCheckDevol"),
					//oIdCheckReembolso = this.getView().byId("idCheckReembolsoDetER"),
					//oIdDevolucion = this.getView().byId("idDevolucion"),
					oIdTipoObj = this.getView().byId("inputTipImp"),
					oIdObjCost = this.getView().byId("inputCeCo"),
					//oIdReembolso = this.getView().byId("idReembolso"),
					oIdMoneda = this.getView().byId("idWaers"),
					oIdImportTotalRecHon = this.getView().byId("idImportTotalRecHonDetER"),
					//oIdImporteTotalGasto = this.getView().byId("idImporteTotalDetER"),
					oIdReferencia = this.getView().byId("idReferencia");

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
				if (Utils.onValidarVacio(oIdImporteD.getValue())) {
					oIdImporteD.setValueState("Error");
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
				this.solicitudGasto = oIdReferencia.getValue().split(".")[1];
				//Modelo para enviar al Odata Detalle de Gasto
				aDetGasto.ZCat = oIdOperacion.getSelectedKey();
				aDetGasto.Bukrs = InfoIas.Bukrs;
				aDetGasto.Belnr = oModelDetailDocument.ParkedDocument;
				aDetGasto.Gjahr = oModelDetailDocument.Gjahr;
				aDetGasto.Usuario = InfoIas.Sysid;
				aDetGasto.Bldat = oFecDoc.getDateValue(); //Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto.Budat = oFechCon.getDateValue(); //Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
				aDetGasto.FechadocSunat = oIdFechaFactura.getDateValue();
				aDetGasto.Blart = "";
				aDetGasto.BelnrSol = oModelDetailDocument.Sgtxt;
				aDetGasto.Detalle = oIdOperacion._getSelectedItemText();
				aDetGasto.Wrbtr = oIdImporteD.getValue();
				aDetGasto.Ztype = "G";
				aDetGasto.Waers = oIdMoneda.getValue();
				aDetGasto.BukrsSol = InfoIas.Bukrs;
				aDetGasto.GjahrSol = oModelDetailDocument.Gjahr;
				aDetGasto.Saknr = oIdCuentaMyr.getValue();
				aDetGasto.Sgtxt = oIdRazSoc.getValue().substring(0, 50);
				aDetGasto.Dzuonr = oIdRuc.getValue();
				aDetGasto.Serie = oIdSerie.getValue();
				aDetGasto.Correlativo = oIdCorr.getValue();
				aDetGasto.Mwskz = oIdIndImp._getSelectedItemText().split("%")[0];
				aDetGasto.Wrbtr = this.calcularImporteIGVRecHon(aDetGasto.Mwskz, aDetGasto.Wrbtr);

				aDetGasto.WtWithcd = oIdIndImp.getSelectedKey();
				aDetGasto.Kstrg = oIdTipoObj.getValue().split(" - ")[0];
				aDetGasto.Zmotivor = "";
				if (aDetGasto.Kstrg == "K") {
					aDetGasto.Kostl = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto.Aufnr = "";
				}
				if (aDetGasto.Kstrg == "F") {
					aDetGasto.Aufnr = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto.Kostl = "";
				}
				aDetGasto.DetracConst = "";
				aDetGasto.DetracDats = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto.FlagAprob = "X";
				aDetGasto.Fondo = "";
				aDetGasto.ImpTotal = oIdImportTotalRecHon.getValue();
				aDetGasto.Witht = "";
				aDetGasto.WtQbshb = "0.00";
				aDetGasto.Imagen = this.getView().getModel("Documents").getData();
				
                aDetGasto.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue();
				aDetGasto.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();

				var aNewGastos = [];

				///VALIDACION CADENA OPERACION
				if (aDetGasto.Detalle.length > 40) {
					aDetGasto.Detalle = aDetGasto.Detalle.substr(0, 40);
				};
				///

				if (aFilas.length === 0) {
					//VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD

					//var iTotalSolicitud = this.getView().byId("idImporteTotal").getValue();
					var iTotalSolicitud = sap.ui.getCore().getModel("oSolicitudSeleccionada").Wrbtr;
					iTotalSolicitud = parseFloat(iTotalSolicitud);
					var iTotalDetalleGasto = aDetGasto.Wrbtr;
					iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);

					if (iTotalDetalleGasto > iTotalSolicitud) {
						MessageBox.error("Se ha excedido el importe Total de la Solicitud");
						return;
					}
					///***********************************************************************//

					aDetGasto.Nrpos = "1";

					aFilas.push(aDetGasto);
					aNewGastos.push(aDetGasto);
					//this.createDetalleGasto(aNewGastos);**

				} else {
					var sSuma = 0;
					$.each(aFilas, function (key, value) {
						if (value.Witht == "RP") {
							sSuma += Number(value.Wrbtr) + Number(value.WtQbshb);
						} else if (value.Witht == "DE") {
							sSuma += Number(value.Wrbtr) * 1.18;
						} else {
							sSuma += Number(value.Wrbtr);
						}
						//sSuma += Number(value.Wrbtr);
					});
					sSuma = sSuma + Number(aDetGasto.Wrbtr);
					sSuma = parseFloat(sSuma).toFixed(2);

					//VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD

					//var iTotalSolicitud = this.getView().byId("idImporteTotal").getValue();
					var iTotalSolicitud = sap.ui.getCore().getModel("oSolicitudSeleccionada").Wrbtr;
					iTotalSolicitud = parseFloat(iTotalSolicitud);
					var iTotalDetalleGasto = sSuma;
					iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);

					if (iTotalDetalleGasto > iTotalSolicitud) {
						MessageBox.error("Se ha excedido el importe Total de la Solicitud");
						return;
					}
					///***********************************************************************//

					aDetGasto.ImpTotal = sSuma;

					var Nrpos = aFilas[aFilas.length - 1];
					aDetGasto.Nrpos = String(Number(Nrpos.Nrpos) + 1);
					aFilas.push(aDetGasto);
					aNewGastos.push(aDetGasto);
					//this.createDetalleGasto(aNewGastos);**
				}
				oTable.getModel().refresh();

				this.obtenerTotales();

				oIdCorr.setValue("");
				oIdRuc.setValue("");
				oIdImporteD.setValue("");
				oIdSerie.setValue("");
				oIdRazSoc.setValue("");
				this.getView().byId("idTipoDocSDetER").setSelectedKey();
				this.getView().byId("idIndImpDetER").setSelectedKey();
				oIdCuentaMyr.setValue("");
				this.getView().byId("idOperacionDetER").setSelectedKey();
				oIdImportTotalRecHon.setValue("0");

				this.fnChangeTxt();
				oIdFechaFactura.setValue(Utils.fnFormatearFechaVista(new Date(), false));
				//oIdFechaFactura.setValue("");

				this.getView().getModel("Documents").setData([]);
			} else {

				var InfoIas = sap.ui.getCore().getModel("oModelIas"),
					oTable = this.getView().byId("idTablaDetalleRendicionER"),
					aFilas = oTable.getModel().getData(),
					oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");

				var aDetGasto1 = {},
					aDetGasto2 = {},
					aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
					iImporteTotalSolicitud = oModelDetailDocument.Wrbtr,
					oFecDoc = this.getView().byId("idFechaFacturaDetER"),
					oFechCon = this.getView().byId("idFechaCont");

				var oIdOperacion = this.getView().byId("idOperacionDetER"),
					oIdCorr = this.getView().byId("idCorrDetER"),
					oIdRuc = this.getView().byId("idRUCDetER"),
					oIdIndImp = this.getView().byId("idIndImpDetER"),
					oIdCuentaMyr = this.getView().byId("idCuentaMyrDetER"),
					//oIdImporteD = this.getView().byId("idImporteD"),
					oIdImportGravado = this.getView().byId("idImportGravadoDetER"),
					oIdImportNoGravado = this.getView().byId("idImportNoGravadoDetER"),
					oIdImportTotal = this.getView().byId("idImportTotalDetER"),

					oIdSerie = this.getView().byId("idSerieDetER"),
					oIdRazSoc = this.getView().byId("idRazSocDetER"),
					oIdFechaFactura = this.getView().byId("idFechaFacturaDetER"),
					//oIdCheckDevol = this.getView().byId("idCheckDevol"),
					//oIdCheckReembolso = this.getView().byId("idCheckReembolso"),
					//oIdDevolucion = this.getView().byId("idDevolucion"),
					//oIdReembolso = this.getView().byId("idReembolso"),
					oIdMoneda = this.getView().byId("idWaers"),
					//oIdImporteTotalGasto = this.getView().byId("idImporteTotalDetER"),
					oIdTipoObj = this.getView().byId("inputTipImp"),
					oIdObjCost = this.getView().byId("inputCeCo"),
					oIdRadButRet = this.getView().byId("idRadButRetDetER"),
					oIdRadButDet = this.getView().byId("idRadButDetDetER"),

					oIdPorcRetencion = this.getView().byId("idPorcRetencionDetER"),
					oIdImporteRetencion = this.getView().byId("idImporteRetencionDetER"),
					oIdPorcDetraccion = this.getView().byId("idPorcDetraccionDetER"),
					oIdImporteDetraccion = this.getView().byId("idImporteDetraccionDetER"),
					oIdFechaDetracccion = this.getView().byId("idFechaDetracccionDetER"),
					oIdNumConstancia = this.getView().byId("idNumConstanciaDetER"),
					oIdReferencia = this.getView().byId("idReferencia");

				var aTempImpGrav = oIdImportGravado.getValue();
				oIdImportGravado.setValue(String(Number(aTempImpGrav)));
				var aTempImpNoGrav = oIdImportNoGravado.getValue();
				oIdImportNoGravado.setValue(String(Number(aTempImpNoGrav)));

				oIdTipoDocS.setValueState("None");
				oIdCorr.setValueState("None");
				oIdRuc.setValueState("None");
				//oIdIndImp.setValueState("None");
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
				// if (Utils.onValidarVacio(oIdIndImp._getSelectedItemText())) {
				// 	oIdIndImp.setValueState("Error");
				// 	return;
				// }
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

				this.solicitudGasto = oIdReferencia.getValue().split(".")[1];
				//Modelo para enviar al Odata Detalle de Gasto 1 Importe gravado
				aDetGasto1.ZCat = oIdOperacion.getSelectedKey();
				aDetGasto1.Bukrs = InfoIas.Bukrs;
				aDetGasto1.Belnr = oModelDetailDocument.ParkedDocument;
				aDetGasto1.Gjahr = oModelDetailDocument.Gjahr;
				aDetGasto1.Usuario = InfoIas.Sysid;;
				aDetGasto1.Bldat = oFecDoc.getDateValue(); //Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto1.Budat = oFechCon.getDateValue(); //Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
				aDetGasto1.FechadocSunat = oIdFechaFactura.getDateValue();
				aDetGasto1.Blart = "";
				aDetGasto1.BelnrSol = oModelDetailDocument.Sgtxt;
				aDetGasto1.Detalle = oIdOperacion._getSelectedItemText();
				aDetGasto1.FlagAprob = "X";
				aDetGasto1.DetracConst = "";
				aDetGasto1.Fondo = "";
				aDetGasto1.ImpTotal = oIdImportTotal.getValue();
				aDetGasto1.Witht = "";
				aDetGasto1.WtQbshb = "0.00";
				aDetGasto1.DetracDats = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto1.Wrbtr = oIdImportGravado.getValue();
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
				aDetGasto1.Mwskz = oIdIndImp._getSelectedItemText().split("%")[0];
				aDetGasto1.Wrbtr = this.calcularImporteIGV(aDetGasto1.Mwskz, aDetGasto1.Wrbtr);

				aDetGasto1.Imagen = this.getView().getModel("Documents").getData();
				//Agregado
				aDetGasto1.WtWithcd = oIdIndImp.getSelectedKey();
				//PARA RETENCION
				var RadButRet = this.getView().byId("idRadButRetDetER");
				var RadButDet = this.getView().byId("idRadButDetDetER");
				aDetGasto1.WtQbshb = "0.00";
				if (RadButRet.getSelected() == true) {
					aDetGasto1.Witht = "RP"; //Retencion

					var porcRet = this.getView().byId("idPorcRetencionDetER")._getSelectedItemText();
					porcRet = porcRet.split(" ")[1];
					porcRet = porcRet.split("%")[0];

					//aDetGasto1.WtWithcd = porcRet; //porcRet
					aDetGasto1.WtQbshb = this.getView().byId("idImporteRetencionDetER").getValue(); //importRet
					//TIPO CAMBIO MONEDA DE LA SOLICITUD
					// var sMoneda = sap.ui.getCore().getModel("oSolicitudSeleccionada").Waers;
					// if (sMoneda !== "PEN") {
					// 	var TipoCambio = this.getView().getModel("TipoCambioModel").Tipocambio;
					// 	TipoCambio = parseFloat(TipoCambio);
					// 	var ImporteRet = parseFloat(aDetGasto1.WtQbshb);
					// 	ImporteRet = ImporteRet / TipoCambio;
					// 	ImporteRet = this.roundToTwo(ImporteRet);

					// 	aDetGasto1.WtQbshb = ImporteRet + "";
					// }

					aDetGasto1.DetracDats = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				}
				//PARA DETRACCION
				if (RadButDet.getSelected() == true) {
					aDetGasto1.Witht = "DE"; //Detraccion

					var porcDet = this.getView().byId("idPorcDetraccionDetER")._getSelectedItemText();
					porcDet = porcDet.split(" ")[1];
					porcDet = porcDet.split("%")[0];

					//aDetGasto1.WtWithcd = porcDet; //porcDet
					aDetGasto1.WtQbshb = this.getView().byId("idImporteDetraccionDetER").getValue(); //importDet
					//TIPO CAMBIO MONEDA DE LA SOLICITUD
					// var sMoneda = sap.ui.getCore().getModel("oSolicitudSeleccionada").Waers;
					// if (sMoneda !== "PEN") {
					// 	var TipoCambio = this.getView().getModel("TipoCambioModel").Tipocambio;
					// 	TipoCambio = parseFloat(TipoCambio);
					// 	var ImporteDet = parseFloat(aDetGasto1.WtQbshb);
					// 	ImporteDet = ImporteDet / TipoCambio;
					// 	ImporteDet = this.roundToTwo(ImporteDet);

					// 	aDetGasto1.WtQbshb = ImporteDet + "";
					// }
					if(this.getView().byId("idNumConstanciaDetER").getValue() !== ""){
						if (oIdFechaDetracccion.getValue()) {
							aDetGasto1.DetracDats = Utils.fnFormatearFechaSAP(oIdFechaDetracccion.getValue()) + "T00:00:00"; //fechaDet	
						} else {
							MessageBox.error("Se debe agregar la fecha de detraccion");
							return;
						}	
					}
					
					aDetGasto1.DetracConst = this.getView().byId("idNumConstanciaDetER").getValue();
					// //VALIDACION CONSTANCIA
					// if (aDetGasto1.DetracConst === "") {
					// 	aDetGasto1.Witht = "";
					// 	aDetGasto1.WtWithcd = "00";
					// 	aDetGasto1.WtQbshb = "0.00";
					// }

				}

				aDetGasto1.Kstrg = oIdTipoObj.getValue().split(" - ")[0];
				aDetGasto1.Zmotivor = "";

				if (aDetGasto1.Kstrg == "K") {
					aDetGasto1.Kostl = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto1.Aufnr = "";
				}
				if (aDetGasto1.Kstrg == "F") {
					aDetGasto1.Aufnr = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto1.Kostl = "";
				}
				
                aDetGasto1.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue();
				aDetGasto1.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();

				//Modelo para enviar al Odata Detalle de Gasto 2 Importe gravado
				aDetGasto2.ZCat = oIdOperacion.getSelectedKey();
				aDetGasto2.Bukrs = InfoIas.Bukrs;
				aDetGasto2.Belnr = oModelDetailDocument.ParkedDocument;;
				aDetGasto2.Gjahr = oModelDetailDocument.Gjahr;
				aDetGasto2.Usuario = InfoIas.Sysid;
				aDetGasto2.Bldat = oFecDoc.getDateValue(); //Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto2.Budat = oFechCon.getDateValue(); //Utils.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
				aDetGasto2.FechadocSunat = oIdFechaFactura.getDateValue();
				aDetGasto2.Blart = "";
				aDetGasto2.BelnrSol = oModelDetailDocument.Sgtxt;
				aDetGasto2.Detalle = oIdOperacion._getSelectedItemText();
				aDetGasto2.FlagAprob = "X";
				aDetGasto2.DetracConst = "";
				aDetGasto2.Fondo = "";
				aDetGasto2.ImpTotal = oIdImportTotal.getValue();
				aDetGasto2.Witht = "";
				aDetGasto2.WtQbshb = "0.00";
				aDetGasto2.DetracDats = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				aDetGasto2.Wrbtr = oIdImportNoGravado.getValue();
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
				aDetGasto2.Mwskz = "0";

				aDetGasto2.Wrbtr = this.calcularImporteIGV(aDetGasto2.Mwskz, aDetGasto2.Wrbtr);
				aDetGasto2.Imagen = this.getView().getModel("Documents").getData();

				aDetGasto2.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue();
				aDetGasto2.Tipo_doc_sunat = oIdTipoDocS.getSelectedKey();

				//Agregado
				aDetGasto2.WtWithcd = "C7";
				aDetGasto2.WtQbshb = "0.00";
				//PARA RETENCION
				if (RadButRet.getSelected() == true) {
					aDetGasto2.Witht = "RP"; //Retencion

					var porcRet = this.getView().byId("idPorcRetencionDetER")._getSelectedItemText();
					porcRet = porcRet.split(" ")[1];
					porcRet = porcRet.split("%")[0];

					//aDetGasto1.WtWithcd = porcRet; //porcRet
					//aDetGasto2.WtQbshb = this.getView().byId("idImporteRetencionDetER").getValue(); //importRet
					aDetGasto2.DetracDats = Utils.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
				}
				//PARA DETRACCION
				if (RadButDet.getSelected() == true) {
					aDetGasto2.Witht = "DE"; //Detraccion

					var porcDet = this.getView().byId("idPorcDetraccionDetER")._getSelectedItemText();
					porcDet = porcDet.split(" ")[1];
					porcDet = porcDet.split("%")[0];

					//aDetGasto2.WtWithcd = porcDet; //porcDet
					//aDetGasto2.WtQbshb = this.getView().byId("idImporteDetraccionDetER").getValue(); //importDet
					aDetGasto2.DetracDats = Utils.fnFormatearFechaSAP(oIdFechaDetracccion.getValue()) + "T00:00:00"; //fechaDet
					aDetGasto2.DetracConst = this.getView().byId("idNumConstanciaDetER").getValue();

				}

				aDetGasto2.Kstrg = oIdTipoObj.getValue().split(" - ")[0];
				aDetGasto2.Zmotivor = "";
				if (aDetGasto2.Kstrg == "K") {
					aDetGasto2.Kostl = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto2.Aufnr = "";
				}
				if (aDetGasto2.Kstrg == "F") {
					aDetGasto2.Aufnr = oIdObjCost.getValue().split(" - ")[0];
					aDetGasto2.Kostl = "";
				}

				var aNewGastos = [];
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
					var sSuma = 0;

					if (aDetGasto1.Witht == "RP") {
						sSuma += Number(aDetGasto1.Wrbtr) + Number(aDetGasto1.WtQbshb);
					} else if (aDetGasto1.Witht == "DE") {
						sSuma += Number(aDetGasto1.Wrbtr) * 1.18;
					} else {
						sSuma += Number(aDetGasto1.Wrbtr);
					}

					sSuma = sSuma + Number(aDetGasto2.Wrbtr);

					sSuma = parseFloat(sSuma).toFixed(2);

					//VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD

					//var iTotalSolicitud = this.getView().byId("idImporteTotal").getValue();
					var iTotalSolicitud = sap.ui.getCore().getModel("oSolicitudSeleccionada").Wrbtr;
					iTotalSolicitud = parseFloat(iTotalSolicitud);
					var iTotalDetalleGasto = sSuma;
					iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);

					if (iTotalDetalleGasto > iTotalSolicitud) {
						MessageBox.error("Se ha excedido el importe Total de la Solicitud");
						return;
					}
					///***********************************************************************//

					aDetGasto1.ImpTotal = sSuma;
					aDetGasto2.ImpTotal = sSuma;

					if (aDetGasto1.Wrbtr != "0.00") {
						aFilas.push(aDetGasto1);
						aNewGastos.push(aDetGasto1);
					}
					//Validacion para cuando no ingresen importe gravado

					if (aDetGasto2.Wrbtr != "0.00") {
						if (aDetGasto1.Wrbtr == "0.00") {
							aDetGasto2.Nrpos = aDetGasto1.Nrpos
						}
						aFilas.push(aDetGasto2);
						aNewGastos.push(aDetGasto2);
					}

					//this.createDetalleGasto(aNewGastos);**

				} else {
					var sSuma = 0;
					$.each(aFilas, function (key, value) {
						if (value.Witht == "RP") {
							sSuma += Number(value.Wrbtr) + Number(value.WtQbshb);
						} else if (value.Witht == "DE") {
							sSuma += Number(value.Wrbtr) * 1.18;
						} else {
							sSuma += Number(value.Wrbtr);
						}
					});
					if (aDetGasto1.Witht == "RP") {
						sSuma += Number(aDetGasto1.Wrbtr) + Number(aDetGasto1.WtQbshb);
					} else if (aDetGasto1.Witht == "DE") {
						sSuma += Number(aDetGasto1.Wrbtr) * 1.18;
					} else {
						sSuma += Number(aDetGasto1.Wrbtr);
					}
					//sSuma = sSuma + Number(aDetGasto1.Wrbtr);
					sSuma = sSuma + Number(aDetGasto2.Wrbtr);
					sSuma = parseFloat(sSuma).toFixed(2);

					//VALIDA SI EL IMPORTE TOTAL DE GASTO ES MAYOR AL DE LA SOLCITUD

					//var iTotalSolicitud = this.getView().byId("idImporteTotal").getValue();
					var iTotalSolicitud = sap.ui.getCore().getModel("oSolicitudSeleccionada").Wrbtr;
					iTotalSolicitud = parseFloat(iTotalSolicitud);
					var iTotalDetalleGasto = sSuma;
					iTotalDetalleGasto = parseFloat(iTotalDetalleGasto);

					if (iTotalDetalleGasto > iTotalSolicitud) {
						MessageBox.error("Se ha excedido el importe Total de la Solicitud");
						return;
					}
					///***********************************************************************//

					aDetGasto1.ImpTotal = sSuma;
					aDetGasto2.ImpTotal = sSuma;

					var Nrpos = aFilas[aFilas.length - 1];
					aDetGasto1.Nrpos = String(Number(Nrpos.Nrpos) + 1);
					aDetGasto2.Nrpos = String(Number(Nrpos.Nrpos) + 2);

					//aFilas.push(aDetGasto1);
					//aNewGastos.push(aDetGasto1);

					//Validacion para cuando no ingresen importe gravado

					if (aDetGasto1.Wrbtr != "0.00") {
						aFilas.push(aDetGasto1);
						aNewGastos.push(aDetGasto1);
					}

					//Validacion para cuando no ingresen importe gravado
					if (aDetGasto2.Wrbtr != "0.00") {
						if (aDetGasto1.Wrbtr == "0.00") {
							aDetGasto2.Nrpos = aDetGasto1.Nrpos;
						}
						aFilas.push(aDetGasto2);
						aNewGastos.push(aDetGasto2);
					}

					//this.createDetalleGasto(aNewGastos);**

				}
				oTable.getModel().refresh();

				this.obtenerTotales();

				oIdCorr.setValue("");
				oIdRuc.setValue("");
				oIdImportGravado.setValue("");
				oIdImportNoGravado.setValue("");
				oIdSerie.setValue("");
				oIdRazSoc.setValue("");
				this.getView().byId("idTipoDocSDetER").setSelectedKey();
				this.getView().byId("idIndImpDetER").setSelectedKey();
				oIdCuentaMyr.setValue("");
				this.getView().byId("idOperacionDetER").setSelectedKey();
				oIdPorcRetencion.setSelectedKey();
				oIdImporteRetencion.setValue("");
				oIdPorcDetraccion.setSelectedKey();
				oIdImporteDetraccion.setValue("");
				oIdFechaDetracccion.setValue("")
				oIdNumConstancia.setValue("");
				oIdImportTotal.setValue("0");
				this.getView().byId("IGV").setValue("0");
				RadButDet.setSelected(false);
				RadButRet.setSelected(false);

				var oModelIndicadores = this.getView().getModel("oModelIndicadores");
				var oDataIndicadores = oModelIndicadores.getData();
				oDataIndicadores.VisibleIndicadorRet = false;
				oDataIndicadores.VisibleIndicadorDet = false;
				oDataIndicadores.VisiblePorcRet = false;
				oDataIndicadores.VisibleImporteRet = false;
				oDataIndicadores.VisiblePorcDet = false;
				oDataIndicadores.VisibleImporteDet = false;
				oDataIndicadores.VisibleFechaDet = false;
				oDataIndicadores.VisibleConstancia = false;

				oModelIndicadores.refresh();

				this.fnChangeTxt();
				//oIdFechaFactura.setDateValue(new Date());
				oIdFechaFactura.setValue(Utils.fnFormatearFechaVista(new Date(), false));
				//oIdFechaFactura.setValue("");

				this.getView().getModel("Documents").setData([]);
			}
		},
		createDetalleGasto: function (aDetalleGasto) {
			var oModelEntregasRendir = this.getView().getModel("oDataModelEntregasRendir");
			sap.ui.core.BusyIndicator.show(0);
			this.fnServiceCreateDetalleGasto(aDetalleGasto, oModelEntregasRendir);
		},
		fnServiceCreateDetalleGasto: function (aDetalleGasto, oModelEntregasRendir) {
			var that = this;
			var fila = aDetalleGasto.shift();
			this.fnAgregarDS(fila);
			delete fila.Imagen;
			oModelEntregasRendir.create("/DetGastoSet", fila, {
				success: function (oData, oResponse) {
					if (aDetalleGasto.length > 0) {
						that.fnServiceCreateDetalleGasto(aDetalleGasto, oModelEntregasRendir);
					} else {
						console.log("Se Actualizaron todas las posciciones");
						var oThes = that,
							aFilter = [],
							oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");

						aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
						aFilter.push(new Filter("Belnr", FilterOperator.EQ, oSolicitudSeleccionada.ParkedDocument));
						aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));

						oModelEntregasRendir.read("/DetGastoSet", {
							filters: aFilter,
							success: function (result, status, xhr) {
								sap.ui.core.BusyIndicator.hide();
								oThes.aSharepointIndexes = [];
								$.each(result.results, function (key, value) {
									var monto = String(value.Wrbtr);
									value.Wrbtr = monto.substring(0, monto.length - 1);
									oThes.aSharepointIndexes.push(Number(value.Nrpos));

								});
								sap.ui.getCore().setModel(result.results, "oTablaDetRendicion");
								var tblModel = oThes.getView().byId("idTablaDetalleRendicionER").getModel();
								if (!tblModel) {
									var oModel = new JSONModel(result.results);
									oModel.setSizeLimit(1000);
									oThes.getView().byId("idTablaDetalleRendicionER").setModel(oModel);
								} else {
									tblModel.setSizeLimit(1000);
									tblModel.setData(result.results);
								}
								oThes.getView().byId("idTablaDetalleRendicionER").getModel().refresh();
							},
							error: function (xhr, status, error) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error(error);
							}
						});
					}
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					console.log(oError);
				}
			});
		},

		fnAgregarDS: function (fila) {
			var afilaCopy = JSON.parse(JSON.stringify(fila));
			var imagen = afilaCopy.Imagen;
			//par guardar el archivo Blob
			for (var i = 0; i < imagen.length; i++) {
				imagen[i].Data = fila.Imagen[i].Data;
			}

			var oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var sRoute = "";
			var sCarpetaGasto = oModelDetailDocument.ParkedDocument + oModelDetailDocument.Bukrs + oModelDetailDocument.Gjahr;
			sRoute = $.ambiente + "/";
			if (oModelDetailDocument.Bukrs === "1000") {
				sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + sCarpetaGasto;
			} else if (oModelDetailDocument.Bukrs === "2000") {
				sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + sCarpetaGasto;
			}
			DS.getCreateFolder(sRoute, afilaCopy.Nrpos).then(oResult => {
				for (var i = 0; i < imagen.length; i++) {
					imagen[i].path = sRoute + "/" + afilaCopy.Nrpos;
				};
				//Promesa asincrona para agregar todos los archivos en la carpeta de solicitud
				Promise.all(imagen.map(function (file) {
					DS.addFile(file.path, file).then(oResult2 => {
						console.log("Se agrego archivo");
					});
				})).then((sResolve) => {
					jQuery.sap.log.info(sResolve);
					//that.oVariablesJSONModel.setProperty("/idFolderGastoGenerado", sResolve);
					//that.getView().getModel("fileUploadImagenes").setData([]);
					sap.m.MessageBox.success("El archivo fue cargado correctamente.");
					sap.ui.core.BusyIndicator.hide();
				});
			}).catch(function (sError) {
				jQuery.sap.log.error(sError);
				sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + sError.message);
			});
		},

		onOpenDialogAttach: function () {

			var that = this;
			// if (!that._dialogAttach) {
			that._dialogAttach = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.Attach", that);
			that.getView().addDependent(that._dialogAttach);
			that._dialogAttach.open();
			// } else {
			// 	that._dialogAttach.open();
			// }
		},
		onCloseDialogAttach: function () {
			var that = this;
			that._dialogAttach.close();
			that._dialogAttach.destroy();
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
		onFileDeletedGasto: function (oEvent) {
			var that = this;
			var dataView = this.getView().getModel("DocumentosBoleta").getData();
			sap.ui.core.BusyIndicator.show();
			var objectFile = oEvent.getSource().getBindingContext("DocumentosBoleta").getPath();
			var sPath = objectFile.split("/")[1];
			dataView.splice(sPath, 1);
			that.getView().getModel("DocumentosBoleta").updateBindings();
			sap.ui.core.BusyIndicator.hide();
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
		onChangeGasto: function (oEvent) {
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
		uploadComplete: function (oEvent) {
			sap.ui.core.BusyIndicator.hide();
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
		onPressDeletePos: function (oEvent) {
			var oFila = oEvent.getSource().getParent(),
			oDetGasto = oFila.getBindingContext().getObject(),
			iPosicionSeleccionada = Number(oDetGasto.Nrpos) - 1;

			var oTable = this.getView().byId("idTablaDetalleRendicionER"),
				aFilas = oTable.getModel().getData();
			sap.ui.core.BusyIndicator.hide();
			aFilas.splice(iPosicionSeleccionada, 1);
			this.aSharepointIndexes.splice(iPosicionSeleccionada, 1);
			var iPosicion = 1;
			aFilas.forEach((oGasto) => {
				oGasto.Nrpos = iPosicion.toString();
				iPosicion++;
			});
			oTable.getModel().refresh();
			this.obtenerTotales();
		},
		onPressGrabar: function () {
			var oTable = this.getView().byId("idTablaDetalleRendicionER"),
				oTableModel = oTable.getModel(),
				aFilas = oTable.getModel().getData();
			var oModelEntregasRendir = this.getView().getModel("oDataModelEntregasRendir");
			var dataFilas = aFilas;
			sap.ui.core.BusyIndicator.show(0);
			this.onPressGrabarDetalles(dataFilas, oModelEntregasRendir);
		},
		onPressGrabarDetalles: function (dataFilas, oModelEntregasRendir) {
			var fila = dataFilas.shift();
			fila.Bldat = Utils.fnFormatearFechaVista(fila.Bldat);
			fila.Budat = Utils.fnFormatearFechaVista(fila.Budat);
			fila.Bldat = Utils.fnFormatearFechaSAP(fila.Bldat) + "T00:00:00";
			fila.Budat = Utils.fnFormatearFechaSAP(fila.Budat) + "T00:00:00";
			fila.Mwskz = fila.Mwskz.split("%")[0];
			fila.Ztype = "U";
			fila.FlagAprob = "X";
			var oThes = this;

			oModelEntregasRendir.update("/DetGastoSet(Bukrs='" + fila.Bukrs + "',Belnr='" + fila.Belnr +
				"',Gjahr='" + fila.Gjahr + "',Nrpos='" + fila.Nrpos + "')", fila, {
					success: function (oData, oResponse) {
						if (dataFilas.length > 0) {
							oThes.onPressGrabarDetalles(dataFilas, oModelEntregasRendir);
						} else {
							sap.ui.core.BusyIndicator.hide();
							console.log("Se Actualizaron todas las poscicion");
							oThes.updateInstance();
						}
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						console.log(oError);
					}
				})
		},

		onCrearNuevoGastoPreliminar: function (Bevent) {
			//Validar montoSolicitud igual al Monto de Gasto

			var importeGasto = this.getView().byId("idImporteTotalIGV").getValue();
			importeGasto = parseFloat(importeGasto);
			var importeSolicitud = this.getView().byId("idImporteTotal").getValue().replace(",", "");
			importeSolicitud = parseFloat(importeSolicitud);

			if (importeSolicitud != importeGasto) {
				Utils.showMessageBox("El importe total del gasto debe ser igual al importe total de la solicitud", "warning");
				return;
			}

			//bloquear boton 
			//this.getView().byId("btnGrabar").setEnabled(false);

			//Verifica si existe aprobador del primer nivel
			var that = this;
			/********* Obteniene lista de aprobadores desde SAP ********/
			var oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			var InfoIas = sap.ui.getCore().getModel("oModelIas");

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
						if (res.results.length > 0) {
							console.log("APROBADOR PRIMER NIVEL")
							console.log(res.results[0].Low)
							that.Nivel = res.results[0].nroniveles;
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
			var InfoIas = sap.ui.getCore().getModel("oModelIas");
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
				oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada"),
				oModelMaster = oThes.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oJGasto = this.getView().byId("idTablaDetalleRendicionER").getModel().getData(),
				InfoIas = sap.ui.getCore().getModel("oModelIas"),
				//oFecDoc = this.getView().byId("idFecha"),
				//oIdImporteTotal = this.getView().byId("idImporteTotal"),
				//idImporteD = this.getView().byId("idImporteD"),
				//idImporteS = this.getView().byId("idImporteS"),
				//oidCheckDevol = this.getView().byId("idCheckDevol"),
				//oIdCheckReembolso = this.getView().byId("idCheckReembolso"),
				//oIdDevolucion = this.getView().byId("idDevolucion"),
				//oIdReembolso = this.getView().byId("idReembolso"),
				//FechCon = this.getView().byId("idFechaCont"),
				oTableCrearGasto = this.getView().byId("idTablaDetalleRendicionER");
			var oTableGastoWorkflow = [];
			oTableGastoWorkflow = Utils.cloneObj(this.getView().byId("idTablaDetalleRendicionER").getModel().getData());

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
			// if (Number(idImporteS.getValue()) < Number(oIdImporteTotal.getValue())) {
			// 	if (!oIdCheckReembolso.getSelected()) {
			// 		var msj = "Debe seleccionar el checkbox de reembolso.";
			// 		Utils.showMessageBox(msj, "warning");
			// 		//LR 27/12
			// 		this.getView().byId("btnGrabar").setEnabled(true);
			// 		return;
			// 	}
			// }
			// for (var contador = oJGasto.length; contador > 1; contador--) {
			// 	oJGasto.splice(contador, 1);
			// }
			var newJsonGasto = {};
			var oNewJsonGasto = [];
			for (var count = 0; count < oJGasto.length; count++) {
				newJsonGasto.Bldat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oJGasto[count].Bldat)).replace(/-/gi, "");
				newJsonGasto.Budat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oJGasto[count].Budat)).replace(/-/gi, "");
				newJsonGasto.Bukrs = oJGasto[count].Bukrs;
				newJsonGasto.Flag_reembolso = "";
				newJsonGasto.Hkont = oJGasto[count].Saknr;
				//newJsonGasto.Imp_total = oJGasto[count].ImpTotal;
				newJsonGasto.Imp_total = "0.00";
				newJsonGasto.Kostl = InfoIas.Kostl;
				newJsonGasto.Nposit = oJGasto[count].Nrpos;
				newJsonGasto.Parked_Document = "";
				newJsonGasto.Sgtxt = oJGasto[count].Sgtxt;
				newJsonGasto.Sgtxt_dev = "";

				newJsonGasto.Tax_code = oJGasto[count].WtWithcd;
				newJsonGasto.Waers = oJGasto[count].Waers;
				newJsonGasto.Wbtr_sol = "";
				newJsonGasto.Wrbtr = oJGasto[count].Wrbtr;
				newJsonGasto.Xref_1 = Utils.fnFormatearFechaFactura1(oJGasto[count].Bldat).replace(/-/gi, "");
				newJsonGasto.Xref_2 = oJGasto[count].Dzuonr;
				newJsonGasto.Zcat = oJGasto[count].ZCat;
				newJsonGasto.Ztype = "G";
				newJsonGasto.Zuonr = oJGasto[count].Zuonr;
				newJsonGasto.oCorrelativo = oJGasto[count].Correlativo;
				newJsonGasto.oCtaMyr = oJGasto[count].Saknr;
				if (oJGasto[count].Mwskz === "CC") {
					newJsonGasto.oIndImp = "10%";
				} else if (oJGasto[count].Mwskz === "C7") {
					newJsonGasto.oIndImp = "18%";
				} else if (oJGasto[count].Mwskz === "C7") {
					newJsonGasto.oIndImp = "0%";
				} else {
					newJsonGasto.oIndImp = oJGasto[count].Mwskz + "%";
				}
				newJsonGasto.Mwskz = oJGasto[count].Mwskz;
				newJsonGasto.oKostl = "Gerencia Operaciones";
				newJsonGasto.oOperacion = oJGasto[count].Detalle.split(" - ")[1];
				newJsonGasto.oSerie = oJGasto[count].Serie;

				///DETRACCION Y RETENCION
				newJsonGasto.Witht = oJGasto[count].Witht;
				newJsonGasto.Wt_Qbshb = "0.00";
				newJsonGasto.Wt_Withcd = "00";
				if (newJsonGasto.Witht === "RP") {
					newJsonGasto.Wt_Qbshb = oJGasto[count].WtQbshb;
					newJsonGasto.Wt_Withcd = oJGasto[count].WtWithcd;
				}
				if (newJsonGasto.Witht === "DE") {
					newJsonGasto.Wt_Qbshb = oJGasto[count].WtQbshb;
					newJsonGasto.Wt_Withcd = oJGasto[count].WtWithcd;
				}

				if (oJGasto[count].DetracDats) {
					newJsonGasto.Detrac_Dats = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oJGasto[count].DetracDats)).replace(/-/gi, "");
				}
				newJsonGasto.Detrac_Const = oJGasto[count].DetracConst;

				oNewJsonGasto.push(JSON.parse(JSON.stringify(newJsonGasto)));
			}
			sap.ui.getCore().setModel(oNewJsonGasto, "oTableGastoWorkflow");

			//this.getView().byId("btnGrabar").setEnabled(false);
			//var idTipoObj = this.getView().byId("idTipoObj").getValue();
			aJSolicitud.Zflag = "";
			aJSolicitud.Zcat = oModelDetailDocument.ZCAT_S;
			aJSolicitud.Zcat_Text = oModelDetailDocument.ZCATTEXT_S;
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
			aJSolicitud.Budat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oModelDetailDocument.Budat)).replace(/-/gi, "");
			var oCurrentDate = new Date(); // se debe enviar la fecha en curso al actualizar
			aJSolicitud.Bldat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oCurrentDate, false)).replace(/-/gi, "");
			aJSolicitud.Kostl = oModelDetailDocument.Kostl;
			aJSolicitud.Segment = "";
			aJSolicitud.Parked_document = oModelDetailDocument.BktxtSol;
			aJSolicitud.Flag_rev = "";
			aJSolicitud.Rev_document = "";
			aJSolicitud.Doc_asoc = "";
			aJSolicitud.Light = "";
			aJSolicitud.Kstrg = oModelDetailDocument.Kstrg.split(" ")[0];
			aJSolicitud.Aufnr = oModelDetailDocument.Aufnr;
			aJSolicitud.Zobserv = oModelDetailDocument.Zobserv;
			aJSolicitud.Eratx = oModelDetailDocument.Eratx;

			// $.each(oJGasto, function (key, value) {
			// 	if (oIdCheckReembolso.getSelected() === true) {
			// 		value.Flag_reembolso = "X";
			// 		value.Sgtxt_dev = oIdReembolso.getValue();
			// 		delete value.oOperacion;
			// 		delete value.oCtaMyr;
			// 		delete value.oSerie;
			// 		delete value.oCorrelativo;
			// 		delete value.oIndImp;
			// 	} else {
			// 		value.Flag_reembolso = "";
			// 		delete value.oOperacion;
			// 		delete value.oCtaMyr;
			// 		delete value.oSerie;
			// 		delete value.oCorrelativo;
			// 		delete value.oIndImp;
			// 	}

			// });
			//Fila a mandar hacia la cabecera de Gasto
			aFilaGrabaGasto.Bukrs = oModelDetailDocument.Bukrs;
			aFilaGrabaGasto.Hkont = oModelDetailDocument.Hkont;
			aFilaGrabaGasto.JSolicitud = JSON.stringify(aJSolicitud);
			aFilaGrabaGasto.Belnr = oModelDetailDocument.ParkedDocument;
			aFilaGrabaGasto.JGasto = JSON.stringify(oNewJsonGasto);
			aFilaGrabaGasto.Txt50 = "";
			aFilaGrabaGasto.Gjahr = oModelDetailDocument.Gjahr;
			aFilaGrabaGasto.Usnam = InfoIas.Sysid;
			aFilaGrabaGasto.Zfondo = oModelDetailDocument.Zfondo;
			aFilaGrabaGasto.Blart = "RS";
			aFilaGrabaGasto.Budat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oModelDetailDocument.Budat)) + "T00:00:00";
			aFilaGrabaGasto.Bldat = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(oCurrentDate, false)) + "T00:00:00";
			aFilaGrabaGasto.BktxtSol = oModelDetailDocument.BktxtSol;
			aFilaGrabaGasto.BktxtDoc = oModelDetailDocument.BktxtDoc;
			aFilaGrabaGasto.Xblnr = oModelDetailDocument.Xblnr;
			aFilaGrabaGasto.Zcat = oModelDetailDocument.Zcat;
			aFilaGrabaGasto.Type = "G";
			aFilaGrabaGasto.Waers = oModelDetailDocument.Waers;
			aFilaGrabaGasto.Wrbtr = oModelDetailDocument.Wrbtr;
			aFilaGrabaGasto.Status = "A";
			aFilaGrabaGasto.Augbl = "";
			aFilaGrabaGasto.Augdt = Utils.fnFormatearFechaSAP(Utils.fnFormatearFechaVista(new Date(), false)) + "T00:00:00";
			aFilaGrabaGasto.Xreverse = oModelDetailDocument.Xreverse;
			aFilaGrabaGasto.Bukrss = "";
			aFilaGrabaGasto.Kstrg = oModelDetailDocument.Kstrg.split(" ")[0];
			aFilaGrabaGasto.zdoc = oModelDetailDocument.ParkedDocument;

			sap.ui.core.BusyIndicator.show(0);
			oModelMaster.create("/GastoSet", aFilaGrabaGasto, {
				success: function (oData, oResponse) {
					// Success
					//oThes.fnSubirArchivosDevolucion(oData);
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
			//var route = sap.ui.getCore().getModel("route");
			var gasto = oEvent.Belnr + "" + oEvent.Bukrs + oEvent.Gjahr;
			this.gastDS2 = gasto;
			//var aFiles = this.getView().getModel("DocumentsForPosition").getData();
			//	aFiles = JSON.parse(JSON.stringify(aFiles));
			///JORDAN SPRINT 3
			var sCarpetaGasto = oEvent.Belnr + oEvent.Bukrs + oEvent.Gjahr; //sNumeroDoc+sSociedad+sEjercicio
			var sRoute = $.ambiente + "/";
			var that = this;
			var Bukrs = oEvent.Bukrs;
			if (Bukrs === "1000") {
				sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS";
			} else if (Bukrs === "2000") {
				sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS";
			}
			DS.getCreateFolder(sRoute, sCarpetaGasto).then(oResult => { ///Crea el folder de GAsto
				console.log("Se agrego Carpeta");
			});
		},

		fnGrabarDetalleGasto: function (oData) {
			var oTable = this.getView().byId("idTablaDetalleRendicionER");
			var aTablaDetGasto = oTable.getModel().getData(),
				oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			oVariablesGlobales.Flag = 0;

			var aNewDetTable = [],
				oDetTable = {};
			$.each(aTablaDetGasto, function (key, value) {

				oDetTable.Aufnr = value.Aufnr;
				oDetTable.Belnr = oData.Belnr;
				oDetTable.BelnrSol = oData.Belnr;
				oDetTable.Blart = oData.Blart;

				oDetTable.Bldat = Utils.fnFormatearFechaVista(value.Bldat);
				oDetTable.Bldat = Utils.fnFormatearFechaSAP(oDetTable.Bldat) + "T00:00:00";

				oDetTable.Budat = Utils.fnFormatearFechaVista(value.Budat);
				oDetTable.Budat = Utils.fnFormatearFechaSAP(oDetTable.Budat) + "T00:00:00";

				oDetTable.FechadocSunat = Utils.fnFormatearFechaVista(value.FechadocSunat);
				oDetTable.FechadocSunat = Utils.fnFormatearFechaSAP(oDetTable.FechadocSunat) + "T00:00:00";

				oDetTable.Bukrs = oData.Bukrs;
				oDetTable.BukrsSol = oData.Bukrs;
				oDetTable.Correlativo = value.Correlativo;
				oDetTable.Detalle = value.Detalle;
				oDetTable.DetracConst = "";

				oDetTable.DetracDats = Utils.fnFormatearFechaVista(value.DetracDats);
				oDetTable.DetracDats = Utils.fnFormatearFechaSAP(oDetTable.DetracDats) + "T00:00:00";
				oDetTable.FlagAprob = value.FlagAprob;

				oDetTable.Dzuonr = value.Dzuonr;
				oDetTable.Fondo = value.Fondo;
				oDetTable.Gjahr = oData.Gjahr;

				oDetTable.GjahrSol = oData.Gjahr;
				oDetTable.Kstrg = value.Kstrg;
				oDetTable.Kostl = value.Kostl;

				oDetTable.Mwskz = value.Mwskz;
				oDetTable.Nrpos = value.Nrpos;
				oDetTable.Saknr = value.Saknr;
				oDetTable.Serie = value.Serie;
				oDetTable.Tipo_doc_sunat = value.Tipo_doc_sunat;
				oDetTable.Sgtxt = value.Sgtxt;
				oDetTable.Usuario = "";
				oDetTable.Waers = value.Waers;
				oDetTable.Witht = value.Witht;
				oDetTable.Wrbtr = value.Wrbtr;
				oDetTable.WtQbshb = value.WtQbshb;
				oDetTable.WtWithcd = value.WtWithcd;
				oDetTable.ZCat = value.ZCat;
				oDetTable.Zmotivor = value.Zmotivor;
				oDetTable.Ztype = "G"

				aNewDetTable.push(JSON.parse(JSON.stringify(oDetTable)));

			});
			this.fnServicioGrabarDetalleGasto(aNewDetTable);
		},

		fnServicioGrabarDetalleGasto: function (aTablaDetGasto) {
			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
				oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oDataModelEntregasRendir"),
				oThes = this,
				aFilaDetGasto = {};

			var aEntrada = aTablaDetGasto[oVariablesGlobales.Flag];
			BusyIndicator.show(0);
			oModelMaestroSolicitudes.create("/DetGastoSet", aEntrada, {
				success: function (oData, oResponse) {
					oVariablesGlobales.Flag++;
					if (oVariablesGlobales.Flag === aTablaDetGasto.length) {
						oVariablesGlobales.Flag = 0;
						oThes.fnWorkFlow(aEntrada).then(() => {							
							oThes.updateSharepointFiles(aEntrada);
						}).then(() => {
							oThes.updateArchiveLinkFiles(aEntrada);
						}).then(() => {
							var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
							if (oSolicitudSeleccionada.Status == "R") {
								MessageBox.success("Se ha creo nuevo documento preliminar " + aEntrada.Belnr + " del documento rechazado " + oSolicitudSeleccionada.ParkedDocument, {
									actions: [MessageBox.Action.OK],
									emphasizedAction: MessageBox.Action.OK,
									onClose: function (sAction) {
										sap.ui.core.BusyIndicator.hide();
										oThes.oRouter.navTo("default", false);
									}
								});
							} else {
								oThes.fnRechazarDocumento(oSolicitudSeleccionada, aEntrada);
							}
						}).catch((error) => {
							console.log(error);
							BusyIndicator.hide();
						});
					} else {
						oThes.fnServicioGrabarDetalleGasto(aTablaDetGasto);
					}
				},
				error: function (oError) {
					BusyIndicator.hide();
					var msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
					Utils.showMessageBox(msj, "error");
					return;
				}
			});
		},

		fnStartInstanceG: function (token, oData) {
			var that = this;
			return new Promise((resolve, reject) => {
				var oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
				var aTablaDetGasto = sap.ui.getCore().getModel("oTableGastoWorkflow"),
					aData = {},
					InfoIas = sap.ui.getCore().getModel("oModelIas");

				aData.Nivel = "1";
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
				aData.SociedadTxt = InfoIas.Butxt;
				aData.Value = that.Plans;
				aData.Isfound = false;
				aData.Tabname_search = that.tablaBuscada;
				aData.Fieldname_search = that.campoBuscado;
				aData.Usuario = InfoIas.Sysid;
				aData.Fecha = Utils.fnFormatearFechaVista(new Date(), false);

				var sImporteRendido = that.getView().byId("idImporteTotal").getValue().replace(",", "");

				var sMoneda = oSolicitudSeleccionada.Waers;
				var sImporteSolicitud = oSolicitudSeleccionada.Wrbtr;
				aData.ImporteTotal = sImporteRendido + " " + sMoneda; //Importe de solicitud
				aData.ImporteRendido = sImporteRendido + " " + sMoneda;

				aData.hasReembolsoDevolucion = false;
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
				var ZcatCompleto = oSolicitudSeleccionada.sZcatCompleto;
				aData.ZcatCompleto = ZcatCompleto;
				aData.Operacion = ZcatCompleto;
				aData.Zcat = oSolicitudSeleccionada.Zcat;
				aData.Moneda = oSolicitudSeleccionada.Waers;
				aData.ReferenciaGeneral = oSolicitudSeleccionada.Xblnr;;
				aData.Zobserv = oSolicitudSeleccionada.Zobserv;

				aData.Kstrg = oSolicitudSeleccionada.Kstrg.split(" - ")[0];
				if (aData.Kstrg == "F") {
					aData.Aufnr = that.getView().byId("inputCeCo").getValue();
					aData.Kostl = "";
				} else {
					aData.Aufnr = "";
					aData.Kostl = that.getView().byId("inputCeCo").getValue();
				}
				aData.Kstrg = oSolicitudSeleccionada.Kstrg;

				var oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
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
							oModelMaestroSolicitudes.update("/zsolicitudSet(Bukrs='" + aData.Bukrs + "',ParkedDocument='" + aData.Belnr + "',Gjahr='" +
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
						"MotRechz": "X",
						"stage": false
					};
					BusyIndicator.show(0);
					WF.rejectTask(taskUSer.taskId, contextReject).then(function (response) {
						MessageBox.success("Se creo nuevo documento preliminar " + oDataDocNuevo.Belnr + " y se rechazo el documento " +
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

		fnWorkFlow: function (aData) {
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
						that.fnStartInstanceG(sToken, aData).then(() => {
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

		cargarArchivos: function (oDataDocNuevo) {
			var aDataPosiciones = this.getView().byId("idTablaDetalleRendicionER").getModel().getData();
			var that = this;
			// oDataDocNuevo.Belnr = "6000002650";
			// oDataDocNuevo.Bukrs = "1000";
			// oDataDocNuevo.Gjahr = "2020";
			sap.ui.core.BusyIndicator.show(0);
			Promise.all(aDataPosiciones.map(function (file) {
				if (file.Imagen) { //Caso donde se agrega desde la vista de EDITAR ENTREGA A RENDIR
					var Bukrs = file.Bukrs;
					var sRoute = $.ambiente + "/";

					if (Bukrs === "1000") {
						sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
							oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
					} else if (Bukrs === "2000") {
						sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
							oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
					}
					DS.getCreateFolder(sRoute, file.Nrpos).then(oResult => { ///Crea el folder de posicion y Agrega los elementos
						//Agrego path a cada elemento
						for (var i = 0; i < file.Imagen.length; i++) {
							file.Imagen[i].path = sRoute + "/" + file.Nrpos;
						};
						//Promesa asincrona para agregar todos los archivos en la carpeta de solicitud
						Promise.all(file.Imagen.map(function (filePos) {
							DS.addFile(filePos.path, filePos).then(oResult2 => {
								sap.ui.core.BusyIndicator.hide();
								console.log("Se agrego archivo");
							});
						}))
					})
				} else { //Caso en donde el archivo se copia del documento
					var sRoute = $.ambiente + "/";
					var oDataDocSolicitud = {};
					var Bukrs = file.Bukrs;
					//CARPETA DE DESTINO
					if (Bukrs === "1000") {
						sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
							oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
					} else if (Bukrs === "2000") {
						sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
							oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
					}

					DS.getCreateFolder(sRoute, file.Nrpos).then(oResult => { ///Crea el folder de posicion y Agrega los elementos

						//CARPETA DE BUSQUEDA
						sRoute = $.ambiente + "/";
						if (Bukrs === "1000") {
							sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + file.Belnr +
								file.Bukrs + file.Gjahr + "/" + file.Nrpos;
						} else if (Bukrs === "2000") {
							sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + file.Belnr +
								file.Bukrs + file.Gjahr + "/" + file.Nrpos;
						}
						DS.getFile(sRoute).then(function (oResult) {
							oDataDocSolicitud.Files = oResult[1];
							oDataDocSolicitud.url = oResult[0];
							oDataDocSolicitud.dsroot = oResult[2];

							Promise.all(oResult[1].map(function (filePos) {

								DS.getObjectParents(filePos.properties).then(function (oResult) {
									var folderRoot = oResult[0].object.properties['cmis:path'].value;
									var relativePath = oResult[0].relativePathSegment;
									var sFileUrl = "/sap/fiori/monitordocumentos/cmis/ea56a4f9aff8479818fc49e5";
									sFileUrl = sFileUrl + "/root" + folderRoot + "/" + relativePath;
									fetch(sFileUrl).then(function (response) {
										return response.blob();
									}).then(function (blob) {
										console.log(blob);
										var array = {};
										array.Data = blob;
										array.Descript = filePos.properties.name.value.split(".")[0];
										array.DocType = filePos.properties.type.value;
										array.FileName = filePos.properties.name.value;
										array.LoioId = filePos.properties.creationDate.value;
										array.flagLogioId = true
										array.mimeType = filePos.properties.type.value;
										var ImagenPosiciones = [];
										ImagenPosiciones.push(array);

										// //CARPETA DE DESTINO
										var Bukrs = file.Bukrs;
										var sRoute = $.ambiente + "/";

										if (Bukrs === "1000") {
											sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
												oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
										} else if (Bukrs === "2000") {
											sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + oDataDocNuevo.Belnr +
												oDataDocNuevo.Bukrs + oDataDocNuevo.Gjahr;
										}

										//DS.getCreateFolder(sRoute, file.Nrpos).then(oResult => { ///Crea el folder de posicion y Agrega los elementos
										//Agrego path a cada elemento
										for (var i = 0; i < ImagenPosiciones.length; i++) {
											ImagenPosiciones[i].path = sRoute + "/" + file.Nrpos;
										};
										//Promesa asincrona para agregar todos los archivos en la carpeta de solicitud

										DS.addFile(ImagenPosiciones[0].path, ImagenPosiciones[0]).then(oResult2 => {
											console.log("Se agrego archivo");
											sap.ui.core.BusyIndicator.hide();
										});
										//})

									});
								}.bind(this));

							}));
						});
					});
				}
			}));
		},

		updateSharepointFiles: function (oNuevoDocumento) {
			var oThat = this;
			return new Promise((resolve, reject) => {
				var ParkedDocument = oNuevoDocumento.ParkedDocument ? oNuevoDocumento.ParkedDocument : oNuevoDocumento.Belnr;
				var Bukrs = oNuevoDocumento.Bukrs;
				var Gjahr = oNuevoDocumento.Gjahr;
				var aDataPosiciones = this.getView().byId("idTablaDetalleRendicionER").getModel().getData();
				var sOldBelnr = aDataPosiciones[0].Belnr; // tomando el doc de una de las posiciones de la antigua rendicion
				var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
				var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
				var sOldRoute = oParametersModel.AMBIENTE + "/" + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + sOldBelnr + Bukrs + Gjahr;
				var sNewRoute = oParametersModel.AMBIENTE + "/" + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr;
				function uploadFilesForPosition(index, that) {
					var oPosition = aDataPosiciones[index];
					var iIndex = Number(oPosition.Nrpos) - 1;
					var sOldPositionPath = `${sOldRoute}/${that.aSharepointIndexes[iIndex]}`;
					var sNewPositionPath = `${sNewRoute}/${oPosition.Nrpos}`;
					if (oPosition.Imagen) {
						// archivos locales
						EverisUtils.sharepoint.createFolderDeep(sNewPositionPath).then(() => {
							const aFilesToUpload = oPosition.Imagen.map((oFile) => {
								return {
									folderName: "",
									fileName: oFile.FileName,
									data: oFile.Data,
									size: oFile.Data.size,
								};
							});
							return EverisUtils.sharepoint.saveFiles(sNewPositionPath, aFilesToUpload);
						}).then(() => {
							index = index + 1;
							if (aDataPosiciones.length === index) {
								MessageToast.show(that.getI18nText("msgSharepointArchivosActualizados"));
								resolve();
							} else {
								uploadFilesForPosition(index, that);
							}
						}).catch((oError) => {
							console.error("[Sharepoint - Carga]", oError);
							MessageBox.error(that.getI18nText("msgSharepointErrorActualizarArchivos"));
						});
					} else {
						// archivos en sharepoint
						EverisUtils.sharepoint._getFiles(sOldPositionPath).then(function (aFiles) {
							var aFilesTobeDownloaded = [];
							aFiles.forEach((oFile) => {
								aFilesTobeDownloaded.push(EverisUtils.sharepoint.getBlob(sOldPositionPath, oFile.Name));
							});
							Promise.all(aFilesTobeDownloaded).then((aBlobFiles) => {
								EverisUtils.sharepoint.createFolderDeep(sNewPositionPath).then(() => {
									const aFilesToUpload = aBlobFiles.map((oBlob, index) => {
										return {
											folderName: "",
											fileName: aFiles[index].Name,
											data: oBlob,
											size: oBlob.size,
										};
									});
									return EverisUtils.sharepoint.saveFiles(sNewPositionPath, aFilesToUpload);
								}).then(() => {
									index = index + 1;
									if (aDataPosiciones.length === index) {
										MessageToast.show(that.getI18nText("msgSharepointArchivosActualizados"));
										resolve();
									} else {
										uploadFilesForPosition(index, that);
									}
								}).catch((oError) => {
									console.error("[Sharepoint - Carga]", oError);
									MessageBox.error(that.getI18nText("msgSharepointErrorActualizarArchivos"));
									sap.ui.core.BusyIndicator.hide();
									reject();
								});
							}).catch((oError) => {
								console.error("[Sharepoint - Descarga blobs]", oError);
								MessageBox.error(that.getI18nText("msgSharepointError"));
								sap.ui.core.BusyIndicator.hide();
								reject();
							});
						}).catch((oError) => {
							console.error("[Sharepoint - Descarga lista de archivos]", oError);
							MessageBox.error(that.getI18nText("msgSharepointError"));
							sap.ui.core.BusyIndicator.hide();
							reject();
						});
					}
				}
				uploadFilesForPosition(0, oThat);				
			});
		},

		updateArchiveLinkFiles: function (oNuevoDocumento) {			
			var oThat = this;
			return new Promise((resolve, reject) => {
				var ParkedDocument = oNuevoDocumento.ParkedDocument ? oNuevoDocumento.ParkedDocument : oNuevoDocumento.Belnr;
				var Bukrs = oNuevoDocumento.Bukrs;
				var Gjahr = oNuevoDocumento.Gjahr;
				var aDataPosiciones = this.getView().byId("idTablaDetalleRendicionER").getModel().getData();
				var sOldBelnr = aDataPosiciones[0].Belnr; // tomando el doc de una de las posiciones de la antigua rendicion
				var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
				var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
				var sOldRoute = oParametersModel.AMBIENTE + "/" + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
					return oSociedad.valueLow === Bukrs
				}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + sOldBelnr + Bukrs + Gjahr;
				var oArchiveLinkPayload = {
					Bukrs: Bukrs,
					Belnr: ParkedDocument,
					Gjahr: Gjahr,
					Modulo: "FI",
					ArchiveDocSet: []
				};
				BusyIndicator.show(0);
				function uploadToArchiveLink(oArchiveLinkPayload, that) {
					var oModelEntregaRendir = that.getOwnerComponent().getModel("oDataModelEntregasRendir");
					oModelEntregaRendir.create("/ArchiveHeaderSet", oArchiveLinkPayload, {
						success: function (oResponse) {
							console.log(oResponse);
							MessageToast.show(that.getI18nText("msgArchiveLinkSuccess"));
							BusyIndicator.hide();
							resolve();
						},
						error: function (oError) {
							console.error("[ArchiveLink - Carga SAP]", oError);
							MessageBox.error(that.getI18nText("msgArchiveLinkError"));
							reject();
						}
					});
				}
				function processFilesPerPosition(index, that) {
					var oPosition = aDataPosiciones[index];
					var iIndex = Number(oPosition.Nrpos) - 1;
					var sOldPositionPath = `${sOldRoute}/${that.aSharepointIndexes[iIndex]}`;
					var aFilesTobeConverted = [];
					var aFileIndex = [];
					if (oPosition.Imagen) {
						// archivos locales
						oPosition.Imagen.forEach((oFile, fileIndex) => {
							aFileIndex.push([index, fileIndex]);
							aFilesTobeConverted.push(Utils.blobToBase64String(oFile.Data));
						});
						Promise.all(aFilesTobeConverted).then((aBase64String) => {
							aBase64String.forEach((sBase64String, base64Index) => {
								var oFile = aDataPosiciones[aFileIndex[base64Index][0]].Imagen[aFileIndex[base64Index][1]];
								var sFileName = oFile.FileName;
								var sFileExtension = oFile.DocType.toUpperCase();
								oArchiveLinkPayload.ArchiveDocSet.push({
									Bukrs: Bukrs,
									Belnr: ParkedDocument,
									Gjahr: Gjahr,
									Bas64: sBase64String.split(",")[1],
									Exten: sFileExtension,
									Nombre: sFileName,
									Return: ""
								});
							});
							index = index + 1;
							if (aDataPosiciones.length === index) {
								uploadToArchiveLink(oArchiveLinkPayload, that);
							} else {
								processFilesPerPosition(index, that);
							}
						}).catch((oError) => {
							console.error("[ArchiveLink - Conversión Blob]", oError);
							MessageBox.error(that.getI18nText("msgArchiveLinkError"));
							reject();
						});
					} else {
						// archivos en sharepoint
						EverisUtils.sharepoint._getFiles(sOldPositionPath).then(function (aFiles) {
							var aFilesTobeDownloaded = [];
							aFiles.forEach((oFile) => {
								aFilesTobeDownloaded.push(EverisUtils.sharepoint.getBlob(sOldPositionPath, oFile.Name));
							});
							Promise.all(aFilesTobeDownloaded).then((aBlobFiles) => {
								aBlobFiles.forEach((oBlobFile) => {
									aFilesTobeConverted.push(Utils.blobToBase64String(oBlobFile));
								});
								Promise.all(aFilesTobeConverted).then((aBase64String) => {
									aBase64String.forEach((sBase64String, base64Index) => {
										var sFileName = aFiles[base64Index].Name;
										var sFileExtension = sFileName.substring(sFileName.lastIndexOf(".") + 1).toUpperCase();
										oArchiveLinkPayload.ArchiveDocSet.push({
											Bukrs: Bukrs,
											Belnr: ParkedDocument,
											Gjahr: Gjahr,
											Bas64: sBase64String.split(",")[1],
											Exten: sFileExtension,
											Nombre: sFileName,
											Return: ""
										});
									});
									index = index + 1;
									if (aDataPosiciones.length === index) {
										uploadToArchiveLink(oArchiveLinkPayload, that);
									} else {
										processFilesPerPosition(index, that);
									}
								}).catch((oError) => {
									console.error("[ArchiveLink - Conversión Blob]", oError);
									MessageBox.error(that.getI18nText("msgArchiveLinkError"));
									reject();
								});
							}).catch((oError) => {
								console.error("[ArchiveLink - Descarga blobs]", oError);
								MessageBox.error(that.getI18nText("msgArchiveLinkError"));
								reject();
							});
						}).catch((oError) => {
							console.error("[ArchiveLink - Descarga lista de archivos]", oError);
							MessageBox.error(that.getI18nText("msgArchiveLinkError"));
							reject();
						});
					}
				}
				processFilesPerPosition(0, oThat);				
			});
		},

		obtenerTotales: function () {
			var oModelTable = this.getView().byId("idTablaDetalleRendicionER").getModel();
			var oModelTableData = oModelTable.getData();
			var ImporteSinIGV = [];
			var ImporteConIGV = [];
			var IGV;
			var sMwskz = "0";
			for (var i = 0; i < oModelTableData.length; i++) {
				if (oModelTableData[i].Mwskz == "CC") {
					sMwskz = "10";
				} else if (oModelTableData[i].Mwskz == "C7") {
					sMwskz = "18";
				} else if (oModelTableData[i].Mwskz == "C7") {
					sMwskz = "0";
				} else {
					sMwskz = oModelTableData[i].Mwskz;
				}

				var wrbtr = parseFloat(oModelTableData[i].Wrbtr);
				var indImp = parseInt(sMwskz, 10);
				if (oModelTableData[i].Witht === "RP") {
					//wrbtr = wrbtr + parseFloat(oModelTableData[i].WtQbshb);
				}
				if (oModelTableData[i].Witht === "DE") {
					wrbtr = wrbtr + parseFloat(oModelTableData[i].WtQbshb);
					//wrbtr = wrbtr;
				}

				ImporteConIGV.push(wrbtr);

				var SinIGV = wrbtr * 100 / (indImp + 100);

				ImporteSinIGV.push(SinIGV);
			}

			var TotalconIGV = 0;
			var TotalsinIGV = 0;

			for (var j = 0; j < ImporteConIGV.length; j++) {
				TotalconIGV = TotalconIGV + ImporteConIGV[j];
			}
			for (var k = 0; k < ImporteSinIGV.length; k++) {
				TotalsinIGV = TotalsinIGV + ImporteSinIGV[k];
			}
			IGV = TotalconIGV - TotalsinIGV;

			IGV = this.roundToTwo(IGV);
			TotalconIGV = this.roundToTwo(TotalconIGV);
			TotalsinIGV = this.roundToTwo(TotalsinIGV);

			this.getView().byId("IGVTOTAL").fireChange({ value: IGV });
			this.getView().byId("idImporteTotalsinIGV").fireChange({ value: TotalsinIGV });
			this.getView().byId("idImporteTotalIGV").fireChange({ value: TotalconIGV });
			//this.getView().byId("idImporteTotal").setValue(TotalconIGV);
		},
		calcularImporteIGV: function (IndImpuesto, Importe) {
			var intImporte = parseFloat(Importe);
			var intIndImpuesto = parseFloat(IndImpuesto);
			var importeIGV = intImporte + intImporte * intIndImpuesto / 100;
			importeIGV = this.roundToTwo(importeIGV);
			importeIGV = importeIGV + "";
			return importeIGV;
		},
		calcularImporteIGVRecHon: function (IndImpuesto, Importe) {
			var intImporte = parseFloat(Importe);
			var intIndImpuesto = parseFloat(IndImpuesto);
			var importeIGV = intImporte - intImporte * intIndImpuesto / 100;
			importeIGV = this.roundToTwo(importeIGV);
			importeIGV = importeIGV + "";
			return importeIGV;
		},

		canceledInstance: function (taskId) {
			var contextReject = {
				"MotRechz": "X",
				"stage": false
			};
			WF.rejectTaskCanceled(taskId, contextReject).then(function (response) {
				console.log("Se cancelo: " + response)
				return;

			}).catch(function (error) {
				jQuery.sap.log.error(error);
				if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
					MessageToast.show(error.message);
				}
			});
		},
		onSerieChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var reference = oInput.getValue().toUpperCase().replace(/\s/g, '');
			var idTipoDocS = this.getView().byId("idTipoDocSDetER").getSelectedKey();
			if (!/[^a-zA-Z0-9]/.test(reference)) {
				if (idTipoDocS == "05") {
					if (oInput.getValue().length <= 3) {
						oInput.setValue(reference.padStart(3, 0));
					} else if (oInput.getValue().length == 4) {
						oInput.setValue(reference.padStart(4, 0));
					}
				} else if (idTipoDocS == "00") {
					if (oInput.getValue().length <= 3) {
						oInput.setValue(reference.padStart(4, 0));
					}
				} else if (idTipoDocS !== "12" && idTipoDocS !== "11" && idTipoDocS !== "13") {
					oInput.setValue(reference.padStart(4, 0));
				}
			} else {
				return MessageToast.show("No se permiten caracteres especiales");
			}
		},
		onCorrelativoChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var reference = oInput.getValue().toUpperCase().replace(/\s/g, '');
			var idTipoDocS = this.getView().byId("idTipoDocSDetER").getSelectedKey();
			if (!/[^a-zA-Z0-9]/.test(reference)) {
				if (oInput.getValue().length == 0) {
					oInput.setValueState("Error");
					return MessageToast.show("El correlativo debe tener al menos 1 caracter");
				} else {
					oInput.setValueState("None");
				}
				if (idTipoDocS == "05" || idTipoDocS == "12" || idTipoDocS == "11" || idTipoDocS == "13") {
					if (oInput.getValue().length == 0) {
						oInput.setValueState("Error");
						return MessageToast.show("El correlativo debe tener al menos 1 caracter");
					} else {
						oInput.setValueState("None");
					}
				} else {
					oInput.setValue(reference.padStart(8, 0));
				}
			} else {
				return MessageToast.show("No se permiten caracteres especiales");
			}
		},

		obtenerTipoCambio: function (Fecha, Moneda) {
			var oModelEntredaRendir = this.getOwnerComponent().getModel("oDataModelEntregasRendir");
			//var dFechaSap = Fecha + "T00%3A00%3A00";
			var Fecha = Fecha + "T00:00:00";
			//dFechaSap = encodeURIComponent(dFechaSap);
			// var query = "/TipoCambioSet(Fechadoc=datetime'" + dFechaSap + "',Monedadoc='" + Moneda + "')";*/
			// //query = encodeURIComponent(query);
			var sPath = oModelEntredaRendir.createKey("/TipoCambioSet", {
				Fechadoc: Fecha, // your dynamic key value
				Monedadoc: Moneda,
			});
			var that = this;
			oModelEntredaRendir.read(sPath, {
				success: function (result) {
					//result.Tipocambio = "3.1263";
					that.getView().setModel(result, "TipoCambioModel");
					console.log(result);
				},
				error: function (oError) {
					console.log(oError);
				}
			})
		},

		validarSunat: function (oEvent) {
			var that = this;
			var oTipoDoc = this.getView().byId("idTipoDocSDetER");
			var oSelectedItem = oTipoDoc.getSelectedItem().getBindingContext().getObject();
			var oSerie = this.getView().byId("idSerieDetER");
			var oCorrelativo = this.getView().byId("idCorrDetER");
			var oRuc = this.getView().byId("idRUCDetER");
			var oFechaFactura = this.getView().byId("idFechaFacturaDetER");
			if (!oTipoDoc.getSelectedKey() || !oSerie.getValue() || !oCorrelativo.getValue() || !oRuc.getValue()) {
				return MessageBox.error(that.getI18nText("txtCompletarCamposObligatorios"));
			}

			// validación RxH
			var oImporteTotal = this.getView().byId("idImportTotalDetER");
			var sImporteTotal = oImporteTotal.getValue();
			var oImporteTotalReciboHonorarios = this.getView().byId("idImportTotalRecHonDetER");
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
					var oModelDetailDocument = sap.ui.getCore().getModel("oSolicitudSeleccionada");
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

		validarSerieCorrelativo: function () {
			var oTipoDoc = this.getView().byId("idTipoDocSDetER");
			var oSerie = this.getView().byId("idSerieDetER");
			var oCorrelativo = this.getView().byId("idCorrDetER");
			var oRuc = this.getView().byId("idRUCDetER");
			if (!oTipoDoc || !oSerie || !oCorrelativo || !oRuc) {
				MessageBox.error("Cambiar Valores de Serie o Correlativo");
				return;
			}
			var sCadena = oTipoDoc.getSelectedKey() + oSerie.getValue() + oCorrelativo.getValue();

			var oThes = this,
				oModelMaster = oThes.getView().getModel("oDataModelEntregasRendir"),
				oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada"),
				aFilter = [];
			aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
			aFilter.push(new Filter("Val2", FilterOperator.EQ, oRuc.getValue()));
			aFilter.push(new Filter("Val3", FilterOperator.EQ, sCadena));
			aFilter.push(new Filter("Id", FilterOperator.EQ, "4"));

			oModelMaster.read("/ValidacionSet", {
				filters: aFilter,
				success: function (oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var msg = oData.results[0];

					if (msg.Val4 === "S") {
						oThes.fnAgregarDetGasto();
					} else {
						MessageBox.error("Serie y Correlativo ya existe para ese proveedor");
						return;
					}
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError);
					return;
				}
			});
		},
		onChangeFechaFact: function () {
			var dFechaFactura = this.getView().byId("idFechaFacturaDetER").getDateValue();
			//Nuevo valor minimo para fecha detraccion
			this.getView().byId("idFechaDetracccionDetER").setMinDate(dFechaFactura);
			this.getView().byId("idFechaDetracccionDetER").setDateValue();
		},

		/**
		 * Sección Visualizar Documento Anterior
		 */
		onVisualizarDocumentoAnterior: function (oEvent) {
			var that = this;
			var oModelDocumento = sap.ui.getCore().getModel("oSolicitudSeleccionada");
			if (oModelDocumento.zdoc) {
				return new Promise(function (fnResolve) {
					that.doNavigateEntregaRendir("detailRendicionER", oModelDocumento, fnResolve, "", false);
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