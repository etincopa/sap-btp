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
		
		// Modelo de la data general.
		createDataGeneralModel: function(){
			var oModel = new JSONModel({
				PRNotPurchaseOrderID: "",
				Operation: "",
				DocumentClass: "",
				Company: "",
				InvoiceDate: "",
				VoucherNumber: "",
				Currency: "",
				InvoiceReference: "",
				Amount: "",
				CheckFactura: false,
				Ruc: "",
                CheckElectronicSupplier: true,
                CheckSunat: true,
				SupplierName: "",
				FormVisible: false,
				StatusSunat: "-"
			});
			return oModel;
		}
	};
});