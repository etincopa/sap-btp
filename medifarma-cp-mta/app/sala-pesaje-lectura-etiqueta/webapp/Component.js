sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
    "com/medifarma/cp/salapesajelecturaetiqueta/model/models",
	"sap/ui/model/odata/v2/ODataModel"	    
], function (UIComponent, Device, models, ODataModel) {
	"use strict";

	return UIComponent.extend("com.medifarma.cp.salapesajelecturaetiqueta.Component", {

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

            ODataModel.prototype.readAsync = async function(vServiceUrl, mParameters){
				var self = this;
				return new Promise(function (resolve, reject) {
					mParameters = mParameters ? mParameters : {};
					mParameters.success = function(data){
						resolve(data.results);
					}
					
					mParameters.error = function(error){
						reject(error);
					}					

					self.read(vServiceUrl, mParameters);
				});	
            };

            ODataModel.prototype.updateAsync = async function(sPath, oData, mParameters){
				var self = this;
				return new Promise(function (resolve, reject) {
					mParameters = mParameters ? mParameters : {};
					mParameters.success = function(data){
						resolve(data.results);
					}
					
					mParameters.error = function(error){
						reject(error);
					}					

					self.update(sPath, oData, mParameters);
				});	
            };

            ODataModel.prototype.createAsync = async function(sPath, oData, mParameters){
				var self = this;
				return new Promise(function (resolve, reject) {
					mParameters = mParameters ? mParameters : {};
					mParameters.success = function(data){
						resolve(data.results);
					}
					
					mParameters.error = function(error){
						reject(error);
					}					

					self.create(sPath, oData, mParameters);
				});	
            };               
		}
	});
});
