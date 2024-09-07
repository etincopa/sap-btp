sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"everis/apps/entregasRendir/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("everis.apps.entregasRendir.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			//this.setModel(models.createDeviceModel(), "device");

			var oDeviceModel = new sap.ui.model.json.JSONModel({
				isDesktop: sap.ui.Device.system.phone ? false : true,
				isPhone: sap.ui.Device.system.phone ? true : false
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");
		}
	});
});