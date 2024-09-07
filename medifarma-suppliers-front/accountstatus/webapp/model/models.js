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
		
		createFiltersModel: function () {
			var oModel = new JSONModel({
				DateCreation: "0",
				Bukrs: []
			});
			return oModel;
		},
		testModel: function (){
			return [{
				"DOCUMENTTYPE" : "RUC",
				"EXTERNALDOCUMENTID": "54-2021",
				"INVOICENUMBER": "255555",
				"COMPANYNAME": "PROVEEDOR Z",
				"RECEPTIONDATE_TXT": "WWWWW",
				"INVOICEDATE_TXT": "WWWW",
				"EXPIRATIONDATE_TXT": "08112021",
				"VALUE": "800000",
				"STATUS": "",
				"PAYMENTDATE_TXT": "EEEE",
				"DISCOUNT_TXT": "EEEE",
				"BANK_TXT": "SCOTIANK BANK",
				"COMMENTS_TXT": "PRUEBA"
				}]
		}
	};
});