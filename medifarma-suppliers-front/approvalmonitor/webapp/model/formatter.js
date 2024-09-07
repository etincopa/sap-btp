sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	function twoString(iNumber) {
		var sNumber = String(iNumber);
		if (iNumber < 10) {
			sNumber = "0" + sNumber;
		}
		return sNumber;
	}
	return {

		dateFormat: function (oDate) {
			var oDateFormat = new Date(oDate);
			var sDateFormat = twoString(oDateFormat.getUTCFullYear()) + twoString(oDateFormat.getUTCMonth() + 1) + twoString(oDateFormat.getUTCDate()) +
				"000000.000";
			return sDateFormat;
		}

	};
});