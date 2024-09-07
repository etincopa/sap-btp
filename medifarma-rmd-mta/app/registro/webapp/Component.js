sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
    "mif/rmd/registro/model/models",
    "sap/m/Wizard"
], function (UIComponent, Device, models, Wizard) {
	"use strict";

	return UIComponent.extend("mif.rmd.registro.Component", {

		metadata: {
			manifest: "json",
            config: {
                fullWidth: true
            }
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routingoDataFilter
			this.getRouter().initialize();

			// set the device model
            this.setModel(models.createDeviceModel(), "device");
            
            // set the filter model
            this.setModel(models.crearDataFiltrosModel(), "oDataFilter");
            
            // set the selection model
            // Enviar data de controller a otro
            this.setModel(models.obtenerSelectionModel(), "oDataSelect");

			// set the filter model etiqueta
            this.setModel(models.obtenerDataGeneralRMD(), "asociarDatos");

            /*Wizard.prototype._handleStepChanged = function (oEvent) {
			    var iPreviousStepIndex = ((typeof oEvent === "number") ? oEvent : oEvent.getParameter("current")) - 2,
				    oPreviousStep = this._aStepPath[iPreviousStepIndex],
                    oSubsequentStep = this._getNextStep(oPreviousStep, iPreviousStepIndex),
                    bFocusFirstElement = Device.system.desktop ? true : false;

                this.goToStep(oSubsequentStep, bFocusFirstElement);
                this.fireEvent("stepActivate", {index:((typeof oEvent === "number") ? oEvent : oEvent.getParameter("current"))});
                
		    };*/
		}
	});
});
