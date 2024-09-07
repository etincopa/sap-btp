sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {
        readUserIasInfo: function (sMail) {
            //IasScimService.readUserIasInfo(sMail).then(oResponse=>{ this.getView().setModel(oResponse, "UserInfo"); });
            return new Promise(function (resolve, reject) {
                var oUserInfo = new sap.ui.model.json.JSONModel();
                var sUrl = "/api/v1/cp/service/scim/Users?filter=emails eq '" + sMail + "'";

                oUserInfo.loadData(
                    sUrl,
                    null,
                    true,
                    "GET",
                    null,
                    null,
                    {
                        "Content-Type": "application/scim+json"
                    }
                ).then(() => {

                    var oResolve = new sap.ui.model.json.JSONModel({});
                    var oDataIas = oUserInfo.getData();
                    if (oDataIas.Resources[0]) {
                        var oResource = oDataIas.Resources[0];

                        var oInfo = {
                            userUuid: oResource.userUuid,
                            id: oResource.id,
                            email: oResource.emails[0].value,
                            emails: oResource.emails,
                            groups: oResource.groups,
                            loginName: oResource.userName,
                            displayName: oResource.displayName,
                            firstName: oResource.name.givenName,
                            lastName: oResource.name.familyName
                        };

                        var aUser = oResource["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                        if (aUser !== undefined) {
                            oInfo.attributes = aUser.attributes;
                        }
                        oResolve = new sap.ui.model.json.JSONModel(oInfo);
                    }
                    resolve(oResolve);
                })
                    .catch((oError) => {
                        reject(oError);
                    });
            });
        },
        getUserIAS: function (sEmail) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "GET",
                    url:
                        "/scimApi/GroupUsersWithMail?email=" +
                        sEmail,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (resp) {
                        let data = resp.result.Resources;
                        resolve(data);
                    },
                    error: function (errMsg) {
                        reject(errMsg.statusText);
                    },
                });
            });
        },

        getScimUSerByEmail: function (sEmail) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "GET",
                    url:
                        "/scimApi/Users/?filter=emails eq '" +
                        sEmail +
                        "'",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        "Content-Type": "application/scim+json",
                    },
                    success: function (resp) {
                        let data = resp.Resources;
                        resolve(data);
                    },
                    error: function (errMsg) {
                        reject(errMsg.statusText);
                    },
                });
            });
        },

        getScimUserByGroup: function (sGroup) {
            return new Promise(function (resolve) {
                let UserInfoModel = new JSONModel({});
                UserInfoModel.loadData(
                    "/scimApi/Users/",
                    {
                        filter: `groups eq '${sGroup}'`,
                    }
                );
                UserInfoModel.attachRequestCompleted(function () {
                    resolve(UserInfoModel.getData());
                });
            });
        },

        getScimDinamic: function (sEntity, sfilter) {
            return new Promise(function (resolve) {
                let UserInfoModel = new JSONModel({});
                UserInfoModel.loadData(
                    "/scimApi/" +
                    sEntity +
                    "/",
                    {
                        filter: sfilter,
                    }
                );
                UserInfoModel.attachRequestCompleted(function () {
                    resolve(UserInfoModel.getData());
                });
            });
        },

        postScimDinamic: function (sEntity, oBody) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url:
                        "/scimApi/" +
                        sEntity +
                        "/",
                    method: "POST",
                    data: JSON.stringify(oBody),
                    headers: {
                        "Content-Type": "application/scim+json",
                    },
                    success: (oResult) => {
                        resolve(oResult);
                    },
                    error: (oError) => {
                        reject(oError);
                    },
                });
            });
        },
    };
});
