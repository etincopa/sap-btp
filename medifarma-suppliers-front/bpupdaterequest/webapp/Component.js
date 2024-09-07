sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/everis/suppliers/bpupdaterequest/model/models",
	"sap/ui/core/BusyIndicator"
], function (UIComponent, Device, models, BusyIndicator) {
	"use strict";
	return UIComponent.extend("com.everis.suppliers.bpupdaterequest.Component", {

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
			this.setModel(models.createDeviceModel(), "device");
			// Modelo de la informacion general
			this.setModel(models.createDataGeneralModel(), "DataGeneral");
			// Modelo de la informacion del tab proveedor
			this.setModel(models.createDataSuppliersModel(), "DataSuppliers");
			// Modelo de la informacion del tab banco
			this.setModel(models.createDataBankModel(), "DataBank");
			// Modelo de la informacion del tab persona de contacto
			this.setModel(models.createContactPersonModel(), "DataContactPerson");
			// Modelo de la informacion del tab de sociedad
			this.setModel(models.createSocietyModel(), "DataSociety");
			// Modelo de la informacion del tab organizacion de compras
			this.setModel(models.createPurchaseOrgModel(), "DataPurchaseOrg");

			$.getComponentDataMyInbox = this.getComponentData();
		}
	});
});