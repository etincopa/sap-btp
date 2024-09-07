sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/Button',
	'sap/m/Text',
	'sap/m/StandardListItem',
	'sap/ui/core/BusyIndicator',
	'sap/ui/model/odata/v4/ODataModel',
	'sap/ui/model/odata/OperationMode',
	'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator",
	"com/everis/monitorDocumentos/controller/baseController",
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Text, Button, List, StandardListItem,
	BusyIndicator, ODataModel, OperationMode, Filter, FilterOperator, baseController, History) {
	"use strict";

	return baseController.extend("com.everis.monitorDocumentos.controller.detailIntercompany", {
		inputId: "",
		sPathTbl: "",
		sDeleteIndex: "",
		oRegistroModel: "",
		handleRouteMatched: function (oEvent) {
			var nroDocumento = oEvent.getParameters().data.idDocumento,
				model = new JSONModel();
			var that = this;
			that.getDocIntercompanyModel(nroDocumento);
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("detailIntercompany").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			//	this.oRouter.getTarget("TargetDetail").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.onRouteMatched();
			//	this.loadControls();
		},
		onRouteMatched: function (oEvent) {
			// binding view code and all
			this.i18n = this.getModel("i18n");
			this.oRegistroModel = new JSONModel({});
			//this.getOwnerComponent().getModel("oRegistroModel");
			this.items = [];
		},
		loadControls: function () {
			this.oRegistroModel.setProperty("/Bukrs/code", "1000");
		},
		onChangeInput: function (evt) {
			var id = evt.getParameter("id");
			this.setEnableClearForm(id);
		},
		setEnableClearForm: function (id) {
			var bool = false;
			var aDisable = [];
			var aClear = [];
			switch (id) {
			case this.createId("inputCentro"):
				aDisable = ["inputAlmacen", "inputEquiPm", "inputTipImp", "inputCeCo"];
				aClear = ["Lgort", "Rstyp", "Kostl", "Aufnr", "Equnr"];
				break;
			case this.createId("inputAlmacen"):
				aDisable = ["inputEquiPm", "inputTipImp", "inputCeCo"];
				aClear = ["Rstyp", "Kostl", "Aufnr", "Equnr"];
				break;
			case this.createId("inputTipImp"):
				aDisable = ["inputEquiPm", "inputCeCo"];
				aClear = ["Kostl", "Aufnr", "Equnr"];
				break;
			case this.createId("inputCeCo"):
				aDisable = ["inputEquiPm"];
				aClear = ["Equnr"];
				break;
			case this.createId("inputEquiPm"):
				aDisable = [];
				aClear = [];
				break;
			default:
				break;
			}
			if (id.search("tb_Intercompany") < 0) {
				this.setDisableInputs(aDisable, bool);
				this.clearModel(aClear, bool);
			}
		},
		setDisableInputs: function (aId, bValue) {
			var that = this;
			aId.map(function (id) {
				that.byId_(id).setEnabled(bValue);
			});
		},
		clearModel: function (aName, bValue) {
			var that = this;
			aName.map(function (sName) {
				that.oRegistroModel.setProperty("/" + sName + "/code", "");
				that.oRegistroModel.setProperty("/" + sName + "/value", "");
			});
			that.oRegistroModel.setProperty("/items", "");
		},
		onCentro: function (code) {
			this.oRegistroModel.setProperty("/Werks/code", code);
			//this.oRegistroModel.setProperty("/Werks/value");
			this.byId_("inputAlmacen").setEnabled(true);
		},
		onAlmacen: function (code) {
			this.oRegistroModel.setProperty("/Lgort/code", code);
			this.byId_("inputTipImp").setEnabled(true);
		},
		onTipImp: function (code) {
			this.oRegistroModel.setProperty("/Rstyp/code", code);
			this.byId_("inputCeCo").setEnabled(true);
		},
		onCeCo: function (code, name, desc) {
			this.oRegistroModel.setProperty("/Kostl/code", code);
			this.oRegistroModel.setProperty("/Kostl/value", name);
			var v_EquiPm = this.byId_("inputEquiPm").getValue();
			this.byId_("inputEquiPm").setEnabled(true);
			this.byId_("inputObser").setEnabled(true);

			if (v_EquiPm === "") {
				this.onGetlines(8);
			} else {
				this.onGetlines(2);
			}

		},
		onOrden: function (code, name, desc) {
			this.oRegistroModel.setProperty("/Aufnr/code", code);
			this.oRegistroModel.setProperty("/Aufnr/value", name);
			var v_EquiPm = this.byId_("inputEquiPm").getValue();
			this.byId_("inputEquiPm").setEnabled(true);
			this.byId_("inputObser").setEnabled(true);

			if (v_EquiPm === "") {
				this.onGetlines(8);
			} else {
				this.onGetlines(2);
			}
		},
		onEquiPm: function () {
			var v_EquiPm = this.byId_("inputEquiPm").getValue();

			if (v_EquiPm === "") {
				this.onGetlines(8);
			} else {
				this.onGetlines(2);
			}
		},
		onGetlines: function (lines) {
			var ubicaciones = [];
			var posnr;

			this.oRegistroModel.setProperty("/items", "");
			for (var i = 1; i < lines; i++) {

				posnr = "00" + i + "0";

				var oRecord = {
					Posnr: posnr,
					TipMat: {
						Value: "",
						Mtart: "",
						Mtbez: ""
					},
					Matnr: "",
					Maktx: "",
					Menge: "",
					Meins: ""
				};
				ubicaciones.push(oRecord);
			}
			this.oRegistroModel.setProperty("/items", ubicaciones);
			this.oRegistroModel.setProperty("/countmat/value", ubicaciones.length);

		},
		onBackHome: function () {
			debugger;
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);
			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				//	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.navTo("default", true);
			}
		},
		getQueryParameters: function (oLocation) {
			debugger
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},

		/*--------Centro MatchCode Bukrs----------*/
		handleValueHelp_ce: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentCentroHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				/********************/
				/*	var filters_ = new Array();
					var filterByName = new sap.ui.model.Filter("BUKRS", "EQ", "1000");
					filters_.push(filterByName);
					this.getView().addDependent(this._valueHelpDialog);*/
				/*********************/
				this._oModelHeaders = {
					"Bukrs": v_soc
				};

				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zcentrosSet", {
					//filters:filters_,
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/centros/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);
			}

			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterCentro_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_ce: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterCentro_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterCentro_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
				oFilter = new Filter([
					new Filter("Name1", FilterOperator.Contains, sName),
					new Filter("Werks", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Name1", FilterOperator.Contains, sInputValue),
					new Filter("Werks", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		/*--------Almacen MatchCode Werks----------*/
		handleValueHelp_al: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentAlmacenHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				this._oModelHeaders = {
					"Bukrs": v_soc,
					"Werks": v_centro
				};
				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zalmacenesSet", {
					headers: that._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/almacenes/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				that.getView().addDependent(this._valueHelpDialog);

			}
			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterAlmacen_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_al: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterAlmacen_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterAlmacen_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
				oFilter = new Filter([
					new Filter("Lgobe", FilterOperator.Contains, sName),
					new Filter("Lgort", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Lgobe", FilterOperator.Contains, sInputValue),
					new Filter("Lgort", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		/*--------Tipo Objeto de Costo MatchCode----------*/
		handleValueHelp_ti: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentTipoObjetoCostoHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen
				};

				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/ztipoobjcostoreservaSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/tiposObjetosCosto/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);

			}
			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterTipoObjetoCosto_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_ti: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterTipoObjetoCosto_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterTipoObjetoCosto_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
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
		/*--------Centro de coste - Objeto de Costo MatchCode - ----------*/
		handleValueHelp_obj: function (oEvent) {
			var that = this;
			var tipObjCosto = that.oRegistroModel.getProperty("/Rstyp/code");
			if (tipObjCosto === "K") {
				that.handleValueHelp_cc(oEvent);
			}
			if (tipObjCosto === "F") {
				that.handleValueHelp_or(oEvent);
			}
		},
		handleValueHelp_cc: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentObjetoCostoHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				var v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen,
					"Rstyp": v_tipObjCosto
				};

				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zobjcostoSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/objetosCosto/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);
			}
			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterObjetoCosto_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_cc: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterObjetoCosto_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterObjetoCosto_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
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
		/*--------Orden - Objeto de Costo MatchCode - ----------*/
		handleValueHelp_or: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentOrdenHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				/*	var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
					var v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");*/
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro
				};

				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zordenSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/ordenes/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);
			}
			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterOrden_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_or: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterOrden_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterOrden_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
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
		/*--------Equipo PM MatchCode----------*/
		handleValueHelp_ep: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentEquipoPMHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				var v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
				var v_objCosto = this.oRegistroModel.getProperty("/Kostl/code");
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen,
					"Rstyp": v_tipObjCosto,
					"kostl": v_objCosto
				};
				this.getView().addDependent(this._valueHelpDialog);
				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zequipopmSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/equiposPM/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});

			}
			//create a filter for the binding
			var sInputValue = this.byId_(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterEquipoPM_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_ep: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterEquipoPM_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterEquipoPM_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
				oFilter = new Filter([
					new Filter("Eqktx", FilterOperator.Contains, sName),
					new Filter("Equnr", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Eqktx", FilterOperator.Contains, sInputValue),
					new Filter("Equnr", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},

		/*--------Tipo Material MatchCode----------*/
		handleValueHelp_tp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentTipoMaterialHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				/*var v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
				var v_objCosto = this.oRegistroModel.getProperty("/Kostl/code");
				var v_equipoPM = this.oRegistroModel.getProperty("/Equnr/code");*/
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen
						/*	"Rstyp": v_tipObjCosto,
							"kostl": v_objCosto,
							"equnr": v_equipoPM*/
				};

				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/ztiposmaterialSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/tiposMaterial/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});
				this.getView().addDependent(this._valueHelpDialog);

			}
			//create a filter for the binding
			var sInputValue = sap.ui.getCore().byId(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterTipoMaterial_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_tp: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterTipoMaterial_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterTipoMaterial_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
				oFilter = new Filter([
					new Filter("Mtbez", FilterOperator.Contains, sName),
					new Filter("Mtart", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Mtbez", FilterOperator.Contains, sInputValue),
					new Filter("Mtart", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		/*--------Material MatchCode----------*/
		handleValueHelp_mat: function (oEvent) {
			var oSource = oEvent.getSource();
			this.inputId = oSource.getId();
			this.sPathTbl = oSource.getParent().getBindingContextPath().split("/")[2];
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentMaterialHelp, this);
				var v_soc = this.oRegistroModel.getProperty("/Bukrs/code");
				var v_centro = this.oRegistroModel.getProperty("/Werks/code");
				var v_almacen = this.oRegistroModel.getProperty("/Lgort/code");
				/*	var v_tipObjCosto = this.oRegistroModel.getProperty("/Rstyp/code");
					var v_objCosto = this.oRegistroModel.getProperty("/Kostl/code");
					var v_equipoPM = this.oRegistroModel.getProperty("/Equnr/code");*/
				var v_tipMat = this.oRegistroModel.getProperty("/items/" + this.sPathTbl + "/TipMat/Mtart");
				this.onToast("Implementar el filtrado por Tipo de Material");
				this._oModelHeaders = {
					"bukrs": v_soc,
					"werks": v_centro,
					"lgort": v_almacen,
					/*	"Rstyp": v_tipObjCosto,
						"kostl": v_objCosto,
						"equnr": v_equipoPM*/
					"Mtart": v_tipMat
				};
				this.getView().addDependent(this._valueHelpDialog);
				BusyIndicator.show();
				var that = this;
				this.getOwnerComponent().getModel("oUtilitiesModel").read("/zmaterialesSet", {
					headers: this._oModelHeaders,
					success: function (res) {
						if (res.results.length > 0) {
							that.oRegistroModel.setProperty("/materiales/", res.results);
						}
						BusyIndicator.hide();
					},
					error: function (err) {
						BusyIndicator.hide();
						var msj = "Error de interacción, verifique conexión y reporte al personal de soporte para ver detalles.";
						that.showMessageBox(msj, "warning");
					}
				});

			}
			//create a filter for the binding
			var sInputValue = sap.ui.getCore().byId(this.inputId).getValue();
			var oFilter = null;
			oFilter = this.filterMaterial_(sInputValue);
			this._valueHelpDialog.getBinding("items").filter([oFilter]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			//this._valueHelpDialog.open();
		},
		_handleValueHelpSearch_mat: function (evt) {
			var sInputValue = evt.getParameter("value");
			var oFilter = null;
			oFilter = this.filterMaterial_(sInputValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		filterMaterial_: function (sInputValue) {
			var sTemp = sInputValue.split(" - ");
			var oFilter = null;
			if (sTemp.length > 1) {
				var sMesscode = sTemp[0];
				var sName = sTemp[1];
				//sInputValue = sName + " - " + sMesscode;
				oFilter = new Filter([
					new Filter("Maktx", FilterOperator.Contains, sName),
					new Filter("Matnr", FilterOperator.Contains, sMesscode)
				], false);
			} else {
				oFilter = new Filter([
					new Filter("Maktx", FilterOperator.Contains, sInputValue),
					new Filter("Matnr", FilterOperator.Contains, sInputValue)
				], false);
			}
			return oFilter;
		},
		/*************/
		/*************/
		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);
				var code_ = oSelectedItem.getInfo();
				var name_ = oSelectedItem.getTitle();
				var desc_ = code_ + " - " + name_;
				oInput.setValue(desc_);
				var dialogName = evt.getSource().getProperty("title");
				this.setEnableClearForm(this.inputId);
				this.afterSelectItem(dialogName, code_, name_, desc_);
			}
			this._valueHelpDialog = null;
			evt.getSource().getBinding("items").filter([]);

		},
		_handleValueHelpCloseMat: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);
				oInput.setValue(oSelectedItem.getTitle());
				var oTemp = oSelectedItem.getBindingContext("oRegistroModel").getObject();

				var oData = this.oRegistroModel.getData().items;
				var index = this.sPathTbl;
				oData[index].Matnr = oTemp.Matnr;
				oData[index].Maktx = oTemp.Maktx;
				oData[index].Meins = oTemp.Meins;
				this.getModel("oRegistroModel").setProperty("/items", oData);
				this.getModel("oRegistroModel").updateBindings();
				var dialogName = evt.getSource().getProperty("title");
				this.afterSelectItem(dialogName);
			}
			this._valueHelpDialog = null;
			evt.getSource().getBinding("items").filter([]);

		},
		afterSelectItem: function (dialogName, code, name, desc) {
			switch (dialogName) {
			case this.getI18nText("appTituloDialogoCentro"):
				this.onCentro(code);
				break;
			case this.getI18nText("appTituloDialogoAlmacen"):
				this.onAlmacen(code);
				break;
			case this.getI18nText("appTituloDialogoTipoObjetoCostoHelp"):
				this.onTipImp(code);
				break;
			case this.getI18nText("appTituloDialogoObjetoCostoHelp"):
				this.onCeCo(code, name, desc);
				break;
			case this.getI18nText("appTituloDialogoOrdenHelp"):
				this.onOrden(code, name, desc);
				break;
			case this.getI18nText("appTituloDialogoEquipoPM"):
				this.onEquiPm();
				break;
			case this.getI18nText("appTituloDialogoTipoMaterial"):
				this.onToast("Validación después de seleccionar tipo de material");
				break;
			case this.getI18nText("appTituloDialogoMaterial"):
				this.onToast("Validación después de seleccionar material");
				break;
			default:
				break;
			}

		},
		onDeleteItem: function (oEvent) {
			this.onToast("Agregar Mensaje de confirmacion");
			var oSource = oEvent.getSource();
			var oContext = oSource.getParent().getBindingContext("oRegistroModel");
			var oModel = oContext.getModel();
			var aTable = oModel.getData().items;
			this.sDeleteIndex = oContext.getPath().split("/")[2];

			var iIndex = 1;
			var oData = [];
			var posnr;
			for (var i = 0; i < aTable.length; i++) {
				if (parseInt(this.sDeleteIndex) !== i) {
					posnr = "00" + iIndex + "0";
					oData[iIndex - 1] = aTable[i];
					oData[iIndex - 1].Posnr = posnr;
					iIndex++;
				}
			}
			posnr = "00" + iIndex + "0";
			var oRecord = {
				Posnr: posnr,
				TipMat: {
					Value: "",
					Mtart: "",
					Mtbez: ""
				},
				Matnr: "",
				Maktx: "",
				Menge: "",
				Meins: ""
			};
			oData.push(oRecord);
			oModel.setProperty("/items", oData);
			oModel.updateBindings();
		},

		/****************************************************/
		getDocIntercompanyModel: function (idReserva) {
			debugger
			var that = this;
			this._oModelHeaders = {
				"Rsnum": idReserva
			};
			var query = "/zrintercompanycabSet(NroDoc='" + idReserva + "')?$expand=ToRIntercompPosicion";
			var queryTable = "/zrintercompanycabSet(NroDoc='" + idReserva + "')/ToRIntercompPosicion";
			this.getOwnerComponent().getModel("oModelIntercompany").read(query, {
				beforeSend: function () {
					that.getView().setBusyIndicatorDelay(0);
					that.getView().setBusy(true);
				},
				headers: this._oModelHeaders,
				success: function (res) {
					console.log(res);
					if (res.Sobkz === "") {
						res.isConsignacion = false;
					} else {
						res.isConsignacion = true;
					}
					if (res.Kostl !== "") {
						res.Rstyp = "K";
						res.Rsttx = "Centro de coste";
					}
					if (res.Aufnr !== "") {
						res.Rstyp = "F";
						res.Rsttx = "Orden";
					}
					that.getView().getModel("oRegistroModel").setData(res);
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
						if (e.error.code === "/IWBEP/CM_MGW_RT/020") {
							msj = "La Compra Intercompany N°"+idReserva+" fue eliminada de SAP.";
							that.showMessageBoxAndBack(msj, "error");
						} else {
							that.showMessageBox(msj, "error");
						}
					}

				},
				complete: function () {
					that.getView().setBusy(false);
				}

			});
			this.getOwnerComponent().getModel("oModelIntercompany").read(queryTable, {
				beforeSend: function () {
					that.getView().setBusyIndicatorDelay(0);
					that.getView().setBusy(true);
				},
				headers: this._oModelHeaders,
				success: function (res) {
					console.log(res);
					that.getView().getModel("oRegistroModel").setProperty("/items", res.results);
				},
				error: function (err) {
					var msj = "";
					if (err.responseText !== undefined) {
						var e = JSON.parse(err.responseText);
						msj = e.error.message.value;
					}
					that.showMessageBox(msj, "error");
				},
				complete: function () {
					that.getView().setBusy(false);
				}

			});

		},

	});
});