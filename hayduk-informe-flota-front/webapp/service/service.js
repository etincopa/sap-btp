sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
	"use strict";
	return {
		//PAra obtener la data de CAusa No Zarpe
		getDataCausaNoZarpe: function (Motivo) {
			return new Promise(function (resolve) {
				var model = new JSONModel();
				model.loadData(`/sap/opu/odata/SAP/ZPP_INFORME_FLOTA_SRV_SRV/CausaNoZarpeSet?$filter=Motivo eq '${Motivo}' &$format=json`, {
					grant_type: 'client_credentials'
				}, true, 'GET');
				model.attachRequestCompleted(function () {
					resolve(this.getData());
				});
			});
		}
	};
});