sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";
	return {
		onFormatAmount: function (sValue) {
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var sLocale = new sap.ui.core.Locale("en-US");
			var oFormat = {
				minIntegerDigits: 3,
				minFractionDigits: 2,
				maxFractionDigits: 2,
				groupingSeparator: ","
			};
			var sFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormat, sLocale);
			return sFormat.format(sValue).replace(/^\b0+\B/, "");
		}
	};
});