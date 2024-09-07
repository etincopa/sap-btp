sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createUserResource: function (oUser) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: "iasscim/Users/",
                    method: "POST",
                    data: JSON.stringify(oUser),
                    headers: {
                        "Content-Type": "application/scim+json"
                    },
                    success: function (oResponse) {
                        let oResult = { "status": "success", "data": oResponse }
                        resolve(oResult);
                    },
                    error: function (xhr, status, error) {
                        let oError = { "status": "error", "reason": xhr.responseText, "data": this.data }
                        reject(oError);
                    }
                });
            });
        }
    };
});