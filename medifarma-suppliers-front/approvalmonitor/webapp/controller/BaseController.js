sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/m/MessageBox",
	'sap/ui/core/Fragment',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	'sap/ui/model/Sorter'
], function (Controller, Device, MessageBox, Fragment, JSONModel, BusyIndicator, MessageToast, Filter, Sorter) {
	"use strict";
	var sRoute = "com.everis.suppliers.approvalmonitor.view.dialog";
	return Controller.extend("com.everis.suppliers.approvalmonitor.controller.BaseController", {
		getI18nText: function (sText) {
			return this.oView.getModel("i18n") === undefined ? this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText) :
				this.oView.getModel("i18n").getResourceBundle().getText(sText);
		},
		getResourceBundle: function () {
			return this.oView.getModel("i18n").getResourceBundle();
		},
		getModel: function (sModel) {
			return this.oView.getModel(sModel);
		},
		setModel: function (oModel, sName) {
			try {
				this.getOwnerComponent().setModel(oModel, sName);
			} catch (e) {
				MessageBox.error(e);
			}
		},
		getProperty: function (sNameModel, path) {
			var oModel = this.getModel(sNameModel);
			return oModel.getProperty(path);
		},

		setProperty: function (sName, path, value) {
			var oModel = this.getModel(sName);
			return oModel.setProperty(path, value);
		},
		_byId: function (sName) {
			var cmp = this.byId(sName);
			if (!cmp) {
				cmp = sap.ui.getCore().byId(sName);
			}
			return cmp;
		},
		getMessageBox: function (sType, sMessage) {
			return MessageBox[sType](sMessage);
		},
		setValidateStep: function (sIdStep, bValidate) {
			var oStep = this._byId(sIdStep);
			oStep.setValidated(bValidate);
		},
		removeZerosLeft: function (sValue) {
			var sReturn = "";
			if (sValue !== undefined) {
				sReturn = sValue.replace(/^0+/, '');
			}
			return sReturn;
		},
		setFragment: function (sDialogName, sFragmentId, sNameFragment, sRoute) {
			try {
				if (!this[sDialogName]) {
					this[sDialogName] = sap.ui.xmlfragment(sFragmentId, sRoute + "." + sNameFragment,
						this);
					this.getView().addDependent(this[sDialogName]);
				}
				this[sDialogName].addStyleClass(
					"sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
				);
				return this[sDialogName];
			} catch (err) {
				//	that.showErrorMessage(that.getI18nText("error"), error);
				console.log(String(err));
			}
		},
		onExportXLS: function (oEvent) {
			jQuery.sap.require("sap.ui.export.Spreadsheet");
			var oRowBinding = this.oTable.getBinding("items");
			var aData = this.getView().getModel().getProperty('/');
			var oSettings = {
				workbook: {
					columns: this.getColumns().aXLSColumns
				},
				fileName: this.oTable.data("fileName") + ".xlsx",
				dataSource: aData

			};
			new sap.ui.export.Spreadsheet(oSettings).build()
				.then(function () {
					//MessageToast.show('Spreadsheet export has finished');
				});
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
		onSearchRegister: function (oEvent) {
			var aColumns = this.oTable.getColumns();
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				for (var i = 0; i < aColumns.length; i++) {
					var filter = new Filter(aColumns[i].data("property"), "Contains", sQuery);
					aFilters.push(filter);
				}

			}
			// update list binding
			var oBinding = this.oTable.getBinding("items");
			var oFilter = new Filter({
				filters: aFilters,
				and: false
			});
			oBinding.filter(oFilter);
		},
		onSortButtonPressed: function (oEvent) {
			var aColumns = this.oTable.getColumns();
			var aSort = [];

			for (var i = 0; i < aColumns.length; i++) {
				var bSelected = false;
				if (i === 0) {
					bSelected = true;
				}
				aSort.push({
					Description: aColumns[i].getHeader().getText(),
					Key: aColumns[i].data("property"),
					Selected: bSelected
				});
			}
			this.getView().getModel("ModelGlobal").setProperty("/Sort", aSort);
			this.setFragment("DialogSort", "frgIdSort", "Sort", sRoute).open();
		},
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.oTable,
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		}

	});
});