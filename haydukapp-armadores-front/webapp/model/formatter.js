sap.ui.define([
	] , function () {
		"use strict";

		return {
			
		formatDate: function(oDate) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});
			return oDateFormat.format(new Date(oDate));
		}	
			
			
			
		};
	}
);