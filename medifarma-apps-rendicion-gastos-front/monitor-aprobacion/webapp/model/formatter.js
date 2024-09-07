sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		dateView: function (value) {

			if (value) {
				// var val = value.split("T");
				// var date = val[0];
				// var timeView = val[1].substring(0, 8);
				// var dateView = date.split("-")[2] + "/" + date.split("-")[1] + "/" + date.split("-")[0];
				// value = dateView + " " + timeView;
				return (new Date(value)).toLocaleString('en-UK');
			}

			return value;
		}


	};

});