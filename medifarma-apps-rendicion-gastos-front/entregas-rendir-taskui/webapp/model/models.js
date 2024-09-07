sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createHelpModel: function (){
			var oModel = new JSONModel({
				// cmis: "1a084adbc0dc11ba63fc49e5", //PRD
				cmis: "ea56a4f9aff8479818fc49e5", //QAS
				folder: "",
				folderId: "",
				folderItem: "",
				urlFile: ""
			});
			return oModel;
		}

	};
});