sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
    "use strict";
    var Owner = "";
    var desarrollo = false;
    return {
      Inicializator: function (that) {
        Owner = that.getOwnerComponent();
      },
      readUserIasInfo: function (sMail) {
        var that = this;
        //IasScimService.readUserIasInfo(sMail).then(oResponse=>{ this.getView().setModel(oResponse, "UserInfo"); });
        return new Promise(function (resolve, reject) {
          var oUserInfo = new sap.ui.model.json.JSONModel();
          var sUrlspath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
          //TEST
          //var sUrl = "iasscim/Users?$filter=emails.value eq '" + sMail + "'";
          var sUrl = Owner.getManifestObject().resolveUri(sUrlspath);
          oUserInfo
            .loadData(sUrl, null, true, "GET", null, null, {
              "Content-Type": "application/scim+json",
            })
            .then(() => {
              var oDataIas = oUserInfo.getData();
              if (oDataIas.Resources.length) {
                var aUser =
                  oDataIas.Resources[0][
                    "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
                  ];
                var oInfo = {
                  company: "",
                  email: oDataIas.Resources[0].emails[0].value,
                  emails: oDataIas.Resources[0].emails,
                  firstName: oDataIas.Resources[0].name.givenName,
                  groups: oDataIas.Resources[0].groups,
                  lastName: oDataIas.Resources[0].name.familyName,
                  loginName: oDataIas.Resources[0].userName,
                  name: oDataIas.Resources[0].userName,
                  // userP:
                  //   oDataIas.Resources[0][
                  //     "urn:ietf:params:scim:schemas:extension:sap:2.0:User"
                  //   ].userId,
                  userP:oDataIas.Resources[0].id,
                  ruc: "",
                };
                if (aUser !== undefined) {
                  oInfo.ruc =
                    oDataIas.Resources[0][
                      "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
                    ].attributes[0].value;
                }
                var oResolve = new sap.ui.model.json.JSONModel(oInfo);
                resolve(oResolve);
              } else {
                if (desarrollo) {
                  var temp = {
                    company: "",
                    email: "elvis.percy.garcia.tincopa@everis.com",
                    emails: [
                      {
                        value: "elvis.percy.garcia.tincopa@everis.com",
                        primary: true,
                      },
                    ],
                    firstName: "Elvis",
                    groups: [
                      {
                        value: "dc05624e-cbfd-4065-8ae5-ccb2bb9f26d2",
                        display: "Business_Application_Studio_Administrator",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/dc05624e-cbfd-4065-8ae5-ccb2bb9f26d2",
                      },
                      {
                        value: "72cb3d4d-151c-4e23-817e-b00d31dc561a",
                        display: "Business_Application_Studio_Developer",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/72cb3d4d-151c-4e23-817e-b00d31dc561a",
                      },
                      {
                        value: "9c3a9f88-1296-4c9d-bed1-40b5a6061e77",
                        display: "Business_Application_Studio_Extension_Deployer",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/9c3a9f88-1296-4c9d-bed1-40b5a6061e77",
                      },
                      {
                        value: "42596657-fdcd-4a5d-8c45-cb5eaa95a51c",
                        display: "Portal_Admin",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/42596657-fdcd-4a5d-8c45-cb5eaa95a51c",
                      },
                      {
                        value: "3595b9b9-9201-419d-90ae-e998720777cd",
                        display: "Portal_External_User",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/3595b9b9-9201-419d-90ae-e998720777cd",
                      },
                      {
                        value: "ab737fe4-2ffd-4169-996e-fc34c990c152",
                        display: "WorkflowManagementAdmin",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/ab737fe4-2ffd-4169-996e-fc34c990c152",
                      },
                      {
                        value: "2c084d01-d974-4b2d-b62b-f16434398a96",
                        display: "WorkflowManagementBusinessExpert",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/2c084d01-d974-4b2d-b62b-f16434398a96",
                      },
                      {
                        value: "0b55952b-7a9d-41e8-b4f0-f2d14dfe1270",
                        display: "WorkflowManagementDeveloper",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/0b55952b-7a9d-41e8-b4f0-f2d14dfe1270",
                      },
                      {
                        value: "10c9fbe1-dc81-4452-868b-c00ca7d9d8e4",
                        display: "WorkflowManagementEndUser",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/10c9fbe1-dc81-4452-868b-c00ca7d9d8e4",
                      },
                      {
                        value: "199b6be0-a10d-4298-9d41-69ef789c99eb",
                        display: "ADM_ADMIN",
                        primary: false,
                        $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/199b6be0-a10d-4298-9d41-69ef789c99eb",
                      },
                    ],
                    lastName: "Garcia",
                    loginName: "",
                    name: "",
                    userP: "P000021",
                    ruc: "",
                  };
                  var oResolve = new sap.ui.model.json.JSONModel(temp);
                  resolve(oResolve);
                }
                reject("No se entro registros del usuario IAS");
              }
            })
            .catch((oError) => {
              if (desarrollo) {
                var temp = {
                  company: "",
                  email: "elvis.percy.garcia.tincopa@everis.com",
                  emails: [
                    {
                      value: "elvis.percy.garcia.tincopa@everis.com",
                      primary: true,
                    },
                  ],
                  firstName: "Elvis",
                  groups: [
                    {
                      value: "dc05624e-cbfd-4065-8ae5-ccb2bb9f26d2",
                      display: "Business_Application_Studio_Administrator",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/dc05624e-cbfd-4065-8ae5-ccb2bb9f26d2",
                    },
                    {
                      value: "72cb3d4d-151c-4e23-817e-b00d31dc561a",
                      display: "Business_Application_Studio_Developer",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/72cb3d4d-151c-4e23-817e-b00d31dc561a",
                    },
                    {
                      value: "9c3a9f88-1296-4c9d-bed1-40b5a6061e77",
                      display: "Business_Application_Studio_Extension_Deployer",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/9c3a9f88-1296-4c9d-bed1-40b5a6061e77",
                    },
                    {
                      value: "42596657-fdcd-4a5d-8c45-cb5eaa95a51c",
                      display: "Portal_Admin",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/42596657-fdcd-4a5d-8c45-cb5eaa95a51c",
                    },
                    {
                      value: "3595b9b9-9201-419d-90ae-e998720777cd",
                      display: "Portal_External_User",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/3595b9b9-9201-419d-90ae-e998720777cd",
                    },
                    {
                      value: "ab737fe4-2ffd-4169-996e-fc34c990c152",
                      display: "WorkflowManagementAdmin",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/ab737fe4-2ffd-4169-996e-fc34c990c152",
                    },
                    {
                      value: "2c084d01-d974-4b2d-b62b-f16434398a96",
                      display: "WorkflowManagementBusinessExpert",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/2c084d01-d974-4b2d-b62b-f16434398a96",
                    },
                    {
                      value: "0b55952b-7a9d-41e8-b4f0-f2d14dfe1270",
                      display: "WorkflowManagementDeveloper",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/0b55952b-7a9d-41e8-b4f0-f2d14dfe1270",
                    },
                    {
                      value: "10c9fbe1-dc81-4452-868b-c00ca7d9d8e4",
                      display: "WorkflowManagementEndUser",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/10c9fbe1-dc81-4452-868b-c00ca7d9d8e4",
                    },
                    {
                      value: "199b6be0-a10d-4298-9d41-69ef789c99eb",
                      display: "ADM_ADMIN",
                      primary: false,
                      $ref: "https://ao1k9k5jk.accounts.ondemand.com/scim/Groups/199b6be0-a10d-4298-9d41-69ef789c99eb",
                    },
                  ],
                  lastName: "Garcia",
                  loginName: "",
                  name: "",
                  userP: "P000021",
                  ruc: "",
                };
                var oResolve = new sap.ui.model.json.JSONModel(temp);
                resolve(oResolve);
              }
              reject(oError);
            });
        });
      },
      getUserIAS: function (sEmail) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            type: "GET",
            url:
              "/administrador/scimservice/service/scim/GroupUsersWithMail?email=" +
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
              "/administrador/scimservice/service/scim/Users/?filter=emails eq '" +
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
            "/administrador/scimservice/service/scim/Users/",
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
            "/administrador/scimservice/service/scim/" + sEntity + "/",
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
            url: "/administrador/scimservice/service/scim/" + sEntity + "/",
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
  
      getScimGroups: function (sFilter, sValor) {
        return new Promise(function (resolve, reject) {
          var oUserInfo = new sap.ui.model.json.JSONModel();
          var sUrlspath = `iasscimgroups/?columna=name&tipo_filtro=${sFilter}&valor=${sValor}`;
          var sUrl = Owner.getManifestObject().resolveUri(sUrlspath);
          oUserInfo.loadData(sUrl, null, true, "GET", null, null, {
              "Content-Type": "application/scim+json",
            })
            .then(() => {
              resolve(oUserInfo.getData());
            }).catch((oError) => {
              reject(oError);
            });
        });
      },
  
      getScimUsersByGroup: function (sGroup) {
        return new Promise(function (resolve, reject) {
          var oUserInfo = new sap.ui.model.json.JSONModel();
          var sUrlspath = `iasscim/Users?filter=groups.display eq "${sGroup}"`;
          var sUrl = Owner.getManifestObject().resolveUri(sUrlspath);
          oUserInfo.loadData(sUrl, null, true, "GET", null, null, {
              "Content-Type": "application/scim+json",
            })
            .then(() => {
              resolve(oUserInfo.getData());
            }).catch((oError) => {
              reject(oError);
            });
        });
      },
      oDataRead2: function (oModel, sEntity, oUrlParameters, aFilter) {
        /*
              oUrlParameters = {
                  "$expand": "oUsuario"
              }
              */
        return new Promise(function (resolve, reject) {
          oModel.read("/" + sEntity, {
            async: false,
            filters: aFilter == null ? [] : aFilter,
            urlParameters: oUrlParameters == null ? {} : oUrlParameters,
            success: function (oData) {
              resolve(oData);
            },
            error: function (oError) {
              reject(oError);
            },
          });
        });
      },
    };
  });
  