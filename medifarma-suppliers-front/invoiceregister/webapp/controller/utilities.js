sap.ui.define(["./utilities"], function () {
	"use strict";
	return {
		_getLogonData: function () {
			return new Promise(function (resolve, reject) {
				if (sap.ushell) {
					resolve(sap.ushell.Container.getUser().getId().toUpperCase())
				} else {
					reject("Logon failed!")
				}
			})
		}
	}
});