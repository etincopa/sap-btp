sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	var oManifestObject;
	return {

		setManifestObject: function (that) {
			oManifestObject = that.getOwnerComponent().getManifestObject();
		},

        GetUserValidation: function (sUsuario,sPassword) {
            var auth = btoa(sUsuario+":"+sPassword);
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "POST",
					url: oManifestObject.resolveUri("IAS_API/"),
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
                        "Authorization" : "Basic "+auth
					},
					success: function (data, statusText, xhr) {
						resolve(data);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					},
					contentType: "application/json"
				});
			});
		},

	};
});