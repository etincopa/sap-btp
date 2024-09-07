sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/routing/History"
], function (Controller, MessageToast, MessageBox, Dialog, Button, ODataModel,History) {
	"use strict";
	return Controller.extend("com.everis.monitorDocumentos.controller.baseController", {

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		byId_: function (id) {
			return this.getView().byId(id);
		},
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		onNavBack: function (oEvent) {
			// console.log("onNavBack");
			this.getRouter().navTo("createreturns", {}, false);
		},
		getI18n: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		getI18nText: function (val) {
			return this.getI18n().getText(val);
		},
		getComponentData: function () {
			return this.getOwnerComponent().getComponentData();
		},
		_byId: function (sName) {
			var cmp = this.byId(sName);
			if (!cmp) {
				cmp = sap.ui.getCore().byId(sName);
			}
			return cmp;
		},
		onToast: function (message, f) {
			MessageToast.show(message, {
				duration: 1500,
				width: "22em",
				onClose: f
			});
		},
		ODataUtilidades: function () {
			return this.getOwnerComponent().getModel("oUtilitiesModel");
		},
		ODataMonitor: function () {
			return this.getOwnerComponent().getModel("ODataModelMonitor");
		},
		ODataEntregasRendir: function () {
			return this.getOwnerComponent().getModel("oDataModelEntregasRendir");
		},

		showMessageBox: function (msg, Method) {
			if (Method === "warning") {
				sap.m.MessageBox.warning(msg, {
					title: "Alert",
					actions: ["Ok"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "error") {
				sap.m.MessageBox.error(msg, {
					title: "Error",
					actions: ["Ok"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "show") {
				sap.m.MessageBox.show(msg, {
					title: "Message",
					actions: ["Ok"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "success") {
				sap.m.MessageBox.success(msg, {
					title: "Success",
					actions: ["Ok"],
					onClose: function (sActionClicked) {}
				});
			}
		},
		onBackHome: function () {
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
		showMessageBoxAndBack: function (msg, Method) {
			var that =  this;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (Method === "warning") {
				sap.m.MessageBox.warning(msg, {
					title: "Alerta",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "#"
							}
						});
					}
				});
			}
			if (Method === "error") {
				sap.m.MessageBox.error(msg, {
					title: "Error",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {
					that.onBackHome();
					}
				});
			}
			if (Method === "show") {
				sap.m.MessageBox.show(msg, {
					title: "Mensaje",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "#"
							}
						});
					}
				});
			}
			if (Method === "success") {
				sap.m.MessageBox.success(msg, {
					title: "Éxito",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "#"
							}
						});
					}
				});
			}
		}

	});
});