sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/everis/monitorDocumentos/model/models",
		"./model/errorHandling"
], function (UIComponent, Device, models,errorHandling) {
	"use strict";

	return UIComponent.extend("com.everis.monitorDocumentos.Component", {

			metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			sap.ui.getCore().AppContext = {};
			sap.ui.getCore().AppContext.sCurrentMandt = "P100";
			var oComponentData = this.getComponentData();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");
			
			if (oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.PROCESS && oComponentData.startupParameters
				.PROCESS.length > 0) {
				sap.ui.getCore().AppContext.sCurrentMandt = oComponentData.startupParameters.PROCESS[0];
			}
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// delegate error handling
			errorHandling.register(this);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});
});