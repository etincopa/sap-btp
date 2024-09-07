sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		formatMinDate: function (minDate) {
			return new Date(minDate);
			// console.log(minDate);
		},
		getFormatDate: function (sDate) {
			if (sDate) {
				var oDate = new Date(sDate);
				if (oDate.getFullYear() === -1 || isNaN(oDate.getFullYear())) {
					return null;
					// var today = new Date();
					// return today.getFullYear() + "-" + today.getMonth() + "-" + (today.getDate().length === 2 ? today.getDate() : "0" + today.getDate() );
				} else {
					return sDate;
				}
				// var fecha = sDate.split("T")[0];
				// fecha = fecha.split("-");
				// var sFormatDate = fecha[2] + "/" + this.formatter.paddZeroes(fecha[1], 2) + "/" + fecha[0];
				// return sFormatDate; // + " - " + sTime;
			} else {
				return sDate;
			}
		},
		formatValue: function (value) {
			value = parseFloat(value).toFixed(3);
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			return oNumberFormat.format(value);
		}
	};
});