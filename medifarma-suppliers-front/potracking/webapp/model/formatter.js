sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/core/format/NumberFormat"
], function (JSONModel, Device, NumberFormat) {
	"use strict";

	return {
		formatDate: function (oDate) {
			var aDate = [];
			var sValue = "";

			function completeZero(sValue) {
				if (sValue.length === 1) {
					sValue = "0" + sValue;
				}
				return sValue;
			}
			if (oDate !== "" && oDate !== 0 && oDate !== null && oDate !== undefined) {
				//oDate.setDate(oDate.getDate() + 1);
				aDate[2] = String(oDate.getUTCDate());
				aDate[1] = String(oDate.getUTCMonth() + 1);
				aDate[0] = String(oDate.getUTCFullYear());
				/*	sValue = this.formatter.completeZero(aDate[0]) + "-" + this.formatter.completeZero(aDate[1]) + "-" + this.formatter.completeZero(
						aDate[2]);*/
				sValue = completeZero(aDate[0]) + "-" + completeZero(aDate[1]) + "-" + completeZero(aDate[2]);
			}
			return sValue;
		},
		eraseZerosLeft: function (sValue) {
			if (sValue.length > 0) {
				sValue = sValue.replace(/^0+/, '');
			}
			return sValue;
		},
		formatNumber: function (sValue) {
			var t = new sap.ui.core.Locale("en-US");
			var a = {
				minIntegerDigits: 3,
				minFractionDigits: 2,
				maxFractionDigits: 2,
				groupingSeparator: ","
			};
			var r = NumberFormat.getFloatInstance(a, t);
			return r.format(sValue).replace(/^\b0+\B/, "");
		}

	};
});