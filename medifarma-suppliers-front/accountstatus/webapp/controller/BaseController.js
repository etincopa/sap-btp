sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter"
], function (Controller, Filter) {
	"use strict";
	return Controller.extend("com.belcorp.pc.ReportePosicionCaja.controller.BaseController", {

		_byId: function (sName) {
			var cmp = this.byId(sName);
			if (!cmp) {
				cmp = sap.ui.getCore().byId(sName);
			}
			return cmp;
		},

		getI18nText: function (sText) {
			return this.oView.getModel("i18n") === undefined ? false : this.oView.getModel("i18n").getResourceBundle().getText(sText);
		},

		onUpdateFinish: function (oEvent) {
			var oTable = oEvent.getSource();
			var iActual = oEvent.getParameter("actual");
			var oTitle = this._byId("titHeader");
			var sText = oTable.data("header");
			var oConfigModel = this.getView().getModel("Config");
			
			if (iActual > 0) {
				sText = oTable.data("header") + "(" + iActual + ")";
				if (oConfigModel && oTable.data("header") === "Documentos") {
					oConfigModel.setProperty("/thereIsData", true);
				}
			}else{
				if (oConfigModel && oTable.data("header") === "Documentos") {
					oConfigModel.setProperty("/thereIsData", false);
				}
			}

			oTitle.setText(sText);

			this.oTable.setBusy(false);
		},

		getColumns: function () {
			var oReturn = {
				aXLSColumns: []
			};

			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {

				oReturn.aXLSColumns.push({
					label: aColumns[i].getHeader().getText(),
					type: "String",
					property: aColumns[i].data("property")
				});
			}
			return oReturn;
		},

		onExportXLS: function (oEvent) {
			jQuery.sap.require("sap.ui.export.Spreadsheet");
			var oRowBinding = this.oTable.getBinding("items");
			var oModel = oRowBinding.getModel();
			var oModelInterface = oModel.getInterface();
			var oSettings = {
				workbook: {
					columns: this.getColumns().aXLSColumns
				},
				fileName: this.oTable.data("fileName") + ".xlsx",
				dataSource: {
					type: "oData",
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModelInterface.sServiceUrl,
					headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: oModelInterface.getProperty("bUseBatch"),
					sizeLimit: oModelInterface.iSizeLimit
				},
				worker: false
			};
			new sap.ui.export.Spreadsheet(oSettings).build();
		},
	});
});