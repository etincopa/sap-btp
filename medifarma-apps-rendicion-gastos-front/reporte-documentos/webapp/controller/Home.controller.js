sap.ui.define([
	"../controller/baseController",
	"../controller/Service",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Service, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("everis.apps.ReporteDocumentosAprobacion.controller.Home", {

		onInit: function () {

			this.oUtilitiesModel = this.getOwnerComponent().getModel("oUtilitiesModel");
			this.oDataApp = this.getOwnerComponent().getModel("oDataApp");
			// this.filtroPorMes();
			//TEST
		},

		getI18nText: function (val, params) {
			if (params && params.length > 0) {
			  return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val, params);
			} else {
			  return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val);
			}
		},

		onChangeFilter: function (oEvent) {

			var sValue = oEvent.getSource().getSelectedKey();
			var oHeader = {
				"bukrs": sValue,
				"werks": "",
				"lgort": ""
			};

			sap.ui.core.BusyIndicator.show();

			this.onFilterCombo("/ztipoobjcostoreservaSet", oHeader).then((oResponse) => {

				oResponse.results.splice(2, 1);
				this.oDataApp.setProperty("/tipoobjcostoreservaSet", oResponse.results);
				this.oDataApp.setProperty("/Rstyp", "");
				this.oDataApp.setProperty("/sKeyObjCost", "");
				this.oDataApp.setProperty("/bEnabledTypeCosto", true);
				this.oDataApp.setProperty("/bEnabledObjectCosto", false);

				sap.ui.core.BusyIndicator.hide();

				this.oDataApp.refresh();
			});

		},

		onChangeFilterTypeCosto: function (oEvent) {

			var sRstyp = oEvent.getSource().getSelectedKey();
			var sEntity;
			var oHeader;

			sap.ui.core.BusyIndicator.show();

			if (sRstyp == "K") {

				sEntity = "/zobjcostoSet";

				oHeader = {
					"bukrs": this.oDataApp.getProperty("/bukrs"),
					"werks": "1400",
					"Rstyp": sRstyp
				};
			}

			if (sRstyp == "F") {
				sEntity = "/zordenSet";

				oHeader = {
					"bukrs": this.oDataApp.getProperty("/bukrs"),
					"werks": "1400",
					"Rstyp": sRstyp
				};

			}

			this.onFilterCombo(sEntity, oHeader).then((oResponse) => {

				this.oDataApp.setProperty("/objcostoSet", oResponse.results);
				this.oDataApp.setProperty("/sKeyObjCost", "");
				this.oDataApp.setProperty("/bEnabledObjectCosto", true);

				/*var oModel = new sap.ui.model.json.JSONModel(oResponse.results);
				oModel.setSizeLimit(oResponse.results.length);
				this.getView().byId("idCbxObjectCosto").setModel(oModel, "modelCosto");*/

				sap.ui.core.BusyIndicator.hide();

				this.oDataApp.refresh();

			});

		},

		onSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value");
			var oTable = this.getView().byId("idTableObjectCosto");

			var aFilter = [];

			aFilter.push(new Filter("Ktext", "Contains", sInputValue));

			oEvent.getSource().getBinding("items").filter([aFilter]);

		},

		onConfirmObjet: function (oEvent) {

			var oItemSelected = oEvent.getParameter("selectedItem").getBindingContext("oDataApp").getObject();
			var sKey = oItemSelected.Kostl !== undefined ? oItemSelected.Kostl : oItemSelected.Aufnr;
			oEvent.getSource().getBinding("items").filter([]);
			this.oDataApp.setProperty("/sKeyObjCost", sKey);
			this.oDataApp.refresh();

		},

		oncloseDialog: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},

		onOpenDialog: function () {

			if (!this._oDialogCosto) {
				this._oDialogCosto = sap.ui.xmlfragment("everis.apps.ReporteDocumentosAprobacion.view.fragment.ListObjecCosto", this);
			}
			this.getView().addDependent(this._oDialogCosto);

			this._oDialogCosto.open();

		},

		onFilterCombo: function (sEntity, oHeaders) {
			return new Promise((resolve, reject) => {

				this.oUtilitiesModel.read(sEntity, {
					headers: oHeaders,
					success: (oResult) => {
						resolve(oResult);
					},
					error: (oError) => {
						reject(oError);
					}
				});

			});
		},

		onFormatDate: function (oDate) {

			var sYear = oDate.getFullYear();
			var sMon = oDate.getMonth() + 1;
			var sDay = oDate.getDate();

			if (sMon.toString().length == 1) {
				sMon = `0${sMon}`;
			}

			if (sDay.toString().length == 1) {
				sDay = `0${sDay}`;
			}

			var sReturn = `${sYear}${sMon}${sDay}`;

			return sReturn;

		},

		onFilterTable: function () {

			var oTable = this.getView().byId("idTableDocuments");
			var aFilter = [];
			var sBukrs = this.oDataApp.getProperty("/bukrs");
			if (!sBukrs || sBukrs === "") {
				return MessageBox.error(this.getI18nText("msgErrorSociedad"));
			}
			var oDate = this.getView().byId("drFilter");
			if (oDate.getValue() === "") {
				return MessageBox.error(this.getI18nText("msgErrorRangoFechas"));
			}
			var sRstyp = this.oDataApp.getProperty("/Rstyp");
			var sKeyObjCost = this.oDataApp.getProperty("/sKeyObjCost");
			var sDateFrom = this.onFormatDate(this.oDataApp.getProperty("/fechaInicial"));
			var sDateTo = this.onFormatDate(this.oDataApp.getProperty("/fechaFinal"));
			//var sUser = this.getView().getModel("userModel").User;
			var sUser = this.oDataApp.getProperty("/User");
			var idSociedad = this.getView().byId("idSociedad");
			if (!sBukrs) {
				sBukrs = "";
			}
			if (!sRstyp) {
				sRstyp = "";
			}
			if (!sKeyObjCost) {
				sKeyObjCost = "";
			}

			aFilter.push(new Filter("bukrs", FilterOperator.EQ, sBukrs));
			aFilter.push(new Filter("DateFrom", "EQ", sDateFrom));
			aFilter.push(new Filter("DateTo", "EQ", sDateTo));
			aFilter.push(new Filter("TOBJCOST", FilterOperator.EQ, sRstyp));
			aFilter.push(new Filter("ObJCOST", FilterOperator.EQ, sKeyObjCost));
			if (sUser) {
				aFilter.push(new Filter("Usu_sol", FilterOperator.EQ, sUser));
			}

			oTable.getBinding("items").filter(aFilter);

		},
		filtroPorMes: function () {
			var oDate = new Date();
			var sMes = oDate.getMonth();
			var sAnio = oDate.getFullYear();

			var oDateIni = new Date(sAnio, sMes, 1);
			var oDateFin = new Date(sAnio, sMes + 1, 1);

			var sMesIni = oDateIni.getMonth() + 1;
			var sAnioIni = oDateIni.getFullYear();

			var sMesFin = oDateFin.getMonth() + 1;
			var sAnioFin = oDateFin.getFullYear();

			if (sMesIni < 10) {
				sMesIni = "0" + sMesIni;
			}
			if (sMesFin < 10) {
				sMesFin = "0" + sMesFin;
			}

			var dateInicial = sAnioIni + "" + sMesIni + "01";
			var dateFinal = sAnioFin + "" + sMesFin + "01";
			var aFilter = [];
			aFilter.push(new Filter("DateFrom", "EQ", dateInicial));
			aFilter.push(new Filter("DateTo", "EQ", dateFinal));

			var oTable = this.getView().byId("idTableDocuments");
			oTable.getBinding("items").filter(aFilter);

			var drFilterFecha = this.getView().byId("drFilter");
			drFilterFecha.setFrom(oDateIni);
			drFilterFecha.setTo(oDateFin);
		},
		formatestado: function (oEvent) {
			var estado = oEvent;
			if (!estado) {
				return "PENDIENTE";
			} else
			if (estado === "A") {
				return "APROBADO";
			} else
			if (estado === "R") {
				return "RECHAZADO";
			} else
			if (estado === "F") {
				return "ANULADO";
			}
		},
		formatColor: function (oEvent) {
			var estado = oEvent;
			if (!estado) {
				return "#ffcc00";
			} else
			if (estado === "A") {
				return "#57A639";
			} else
			if (estado === "R") {
				return "#e60000";
			} else
			if (estado === "F") {
				return "#e60000";
			}
		},
		formatDate: function (oEvent) {
			var sDate = oEvent;
			var anio = sDate[0] + sDate[1] + sDate[2] + sDate[3];
			var mes = sDate[4] + sDate[5];
			var dia = sDate[6] + sDate[7];

			return dia + "-" + mes + "-" + anio;
		},
		formatDocument: function (oEvent) {
			var sDocument = oEvent;
			if (sDocument === "") {
				sDocument = "Entrega Rendir";
			}
			return sDocument;
		},
		onChangeFilterUser: function (oEvent) {
			var sValue = oEvent.getSource().getSelectedKey();
			this.oDataApp.setProperty("/User", sValue);
			this.oDataApp.refresh();
		}

	});
});