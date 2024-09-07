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
		
		// Modelo de la data personal.
		createDataGeneralModel: function(){
			var oModel = new JSONModel({
				BPRequestID: "",
				BPGrouping: "",
				DocumentType: "",
				DocumentNumber: "",
				PersonType: 0,
				Name: "",
				Name2: "",
				Street: "",
				StreetNumber: "",
				District: "",
				City: "",
				Country: "",
				Region: "",
				Ubigee: "",
				PostalCode: "",
				TaxLocation: "",
				Street2: "",
				Industry: "",
				SearchName: "",
				Commentary: "",
				Language: ""
			});
			return oModel;
		},
		
		// Modelo del tab de proveedores.
		createDataSuppliersModel: function(){
			var oModel = new JSONModel({
				Phone: "",
				MobilePhone: "",
				Email: "",
				Commentary: ""
			});
			return oModel;
		},
		
		// Modelo del tab de Banco.
		createDataBankModel: function(){
			var oModel = new JSONModel({
				BPRequestID: "",
				CountryID: "",
				BankID: "",
				BankDescription: "",
				AccountNumber: "",
				AccountType: "",
				AccountDescription: "",
				Currency: "",
				CurrencyDescription: "",
				ReferenceNumber: ""
			});
			return oModel;
		},
		
		// Modelo del tab de Persona de contacto.
		createContactPersonModel: function(){
			var oModel = new JSONModel({
				BPRequestID: "",
				ContactPersonID: "",
				Name: "",
				RelationshipCategory: "",
				RelationshipCategoryDescription: "",
				Phone: "",
				MobilePhone: "",
				Email: "",
				Commentary: ""
			});
			return oModel;
		},
		
		// Modelo del tab de Sociedad.
		createSocietyModel: function(){
			var oModel = new JSONModel({
				BPRequestID: "",
				CompanyID: "",
				CompanyDescription: "",
				AccountID: "",
				AccountDescription: "",
				PaymentCondition: "",
				PaymentConditionDescription: "",
				PaymentMethod: "",
				PaymentMethodDescription: "",
				WithholdingTaxCodes: []
			});
			return oModel;
		},
		
		// Modelo del tab de Organizacion de compras.
		createPurchaseOrgModel: function(){
			var oModel = new JSONModel({
				BPRequestID: "",
				PurchasingOrganizationID: "",
				PurcOrganizationDescription: "",
				POCurrency: "",
				POCurrencyDescription: "",
				PaymentCondition: "",
				PaymentConditionDescription: "",
				Incoterms: "",
				IncotermsDescription: ""
			});
			return oModel;
		},
		createModelBPMockup : function (){
		var oModel = new JSONModel({
			BPRequestChangeID: "11111",
			BPGrouping: "ZICT",
			DocumentType: "PE1",
			DocumentNumber: "20521586134",
			PersonType: 0,
			Name: "Clinica San Borja Sanna",
			Name2: "",
			Street: "JR. HUARAZ NRO. 1882 URB. AZCONA",
			StreetNumber: "56",
			District: "01",
			City: "01",
			Country: "PE",
			Region: "15",
			Ubigee: "150105",
			PostalCode: "",
			TaxLocation: "",
			Street2: "",
			Industry: "",
			SearchName: "",
			Commentary: "RTS",
			Language: "S"
		});
		return oModel;
	}
	};
});