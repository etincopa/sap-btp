sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/m/MessageBox",
	'sap/ui/core/Fragment',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"../model/formatter"
], function (Controller, Device, MessageBox, Fragment, JSONModel, BusyIndicator, MessageToast, Filter, Formatter) {
	"use strict";
	return Controller.extend("com.everis.suppliers.potracking.controller.BaseController", {

		getI18nText: function (sText) {
			return this.oView.getModel("i18n") === undefined ? false : this.oView.getModel("i18n").getResourceBundle().getText(sText);
		},
		getResourceBundle: function () {
			return this.oView.getModel("i18n").getResourceBundle();
		},
		getModel: function (sModel) {
			return this.oView.getModel(sModel);
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
		alrh450: function (sModel) {
			var _this = this;
			_this.oInterval = setInterval(this.myScanner, 1500, sModel, _this);
		},
		getDaysBefore: function (date, days) {
			var _24HoursInMilliseconds = 86400000;
			var daysAgo = new Date(date.getTime() + days * _24HoursInMilliseconds);
			daysAgo.setHours(0);
			daysAgo.setMinutes(0);
			daysAgo.setSeconds(0);
			return daysAgo;
		},
		clearInterval: function () {
			clearInterval(this.oInterval);
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

			} catch (err) {
				//	that.showErrorMessage(that.getI18nText("error"), error);
				console.log(err);
			}
		},
		showErrorMessage: function (sError, sDetail) {
			var sDetail2 = String(sDetail);
			return MessageBox.error(sError, {
				title: "Error",
				details: sDetail2,
				styleClass: "sapUiSizeCompact",
				contentWidth: "100px"
			});
		},
		goNavConTo: function (sFragmentId, sNavId, sPageId) {
			Fragment.byId(sFragmentId, "btnIdNavDialog").setVisible(true);
			var oNavCon = Fragment.byId(sFragmentId, sNavId);
			var oDetailPage = Fragment.byId(sFragmentId, sPageId);
			oNavCon.to(oDetailPage);
		},
		getMessageBoxFlex: function (that, sType, sMessage, _this, aMessage, sAction, sRoute, sAction2) {
			return MessageBox[sType](sMessage, {
				actions: [sAction, sAction2],
				onClose: function (oAction) {
					if (oAction === sAction && sRoute === "ErrorNotificNumber") {
						that.createMessageLog(aMessage, that);
					}
					if (oAction === sAction && sRoute === "ErrorTakePhoto") {
						that._onTakePhoto();
					}
					if (oAction === sAction && sRoute === "SuccesRegister") {
						that.oRouter.navTo("RouteLaunchpadCreateNotific");
					}
					if (oAction === sAction2 && sRoute === "SuccessUpdateOffline") {
						that.oRouter.navTo("RouteNotificationOff");
					}
					if (oAction === sAction2 && sRoute === "SuccesRegister") {
						/*var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "#"
							}
						});*/
						that.oRouter.navTo("RouteLaunchpad");
					}
					if (oAction === sAction && sRoute === "ErrorUpload") {
						BusyIndicator.show();
					}
				}
			});
		},
		liveChangeSearch: function (that, sId, sParameter, sValue) {
			var aFilters = [];
			if (sValue.length > 0) {
				aFilters.push(new Filter(sParameter, 'Contains', sValue));
			}
			that.byId(sId).getBinding("items").filter(aFilters);
		},
		liveChangeRuc: function (oEvent) {
			var oSource = oEvent.getSource();
			var sValue = oSource.getValue();
			sValue = Formatter.formatterString(sValue, 'onlyNumber');
			oSource.setValue(sValue);
		},
		liveChangeUpper: function (oEvent) {
			var oSource = oEvent.getSource();
			var sValue = oSource.getValue();
			sValue = Formatter.formatterString(sValue, 'upper');
			oSource.setValue(sValue);
		},
		/**
		 * Formatea segun la condicion que le envies
		 * @function
		 * @param {sap.ui.base.Event} oEvent object of the user input
		 * sCondition puede ser: onlyNumber notSpace upper
		 */
		liveChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var sCondition = oSource.data("custom");
			var sValue = oSource.getValue();
			sValue = Formatter.formatterString(sValue, sCondition);
			oSource.setValue(sValue);
		},
		changeStartDate: function (oEvent) {
			var oSource = oEvent.getSource();
			var sProperty = "/ValidateEndDate" + oSource.data("custom");
			var sValue = oSource.getValue();
			var oStartDate = new Date(sValue);
			oStartDate.setDate(oStartDate.getDate() + 2);
			this.getModel("modelGlobal").setProperty(sProperty, oStartDate);
		}

	});
});