sap.ui.define(["sap/ui/model/Filter"], function (Filter) {
  "use strict";
  // var cmisId = "1a084adbc0dc11ba63fc49e5"; //PRD
  var cmisId = "ea56a4f9aff8479818fc49e5"; // QAS
  return {
    findPath: function (pathSegments, oDictionary) {
      return new Promise((resolve, reject) => {
        const doFind = () => {
          var params = pathSegments.pop();
          $.ajax({
            url: "/cmis/" + cmisId + "/root/" + params.path + "?cmisselector=object",
            cache: false,
            contentType: false,
            processData: false,
            type: "GET",
            success: (data) => {
              this.parentId = data.properties["cmis:objectId"].value;
              if (pathSegments.length) {
                switch (params.type) {
                  case "posicion":
                    oDictionary.posicion[name] = data.properties["cmis:objectId"].value;
                    break;
                  case "nrosolicitud":
                    oDictionary.nrosolicitud = data.properties["cmis:objectId"].value;
                    break;
                  case "tipo":
                    oDictionary.tipo = data.properties["cmis:objectId"].value;
                    break;
                  case "app":
                    oDictionary.app = data.properties["cmis:objectId"].value;
                    break;
                  case "ruc":
                    oDictionary.ruc = data.properties["cmis:objectId"].value;
                    break;
                  case "ambiente":
                    oDictionary.ambiente = data.properties["cmis:objectId"].value;
                    break;
                  // no default
                }
                doFind();
              } else {
                resolve(params.path);
              }
              jQuery.sap.log.info("success " + this.parentId);
            },
            error: (err) => {
              jQuery.sap.log.error(err.responseJSON);
              if (
                err.status === 404 &&
                err.responseJSON &&
                err.responseJSON.message &&
                err.responseJSON.message.substr(1) === params.path
              ) {
                switch (params.type) {
                  case "posicion":
                    this.parentId = oDictionary.nrosolicitud;
                    break;
                  case "nrosolicitud":
                    this.parentId = oDictionary.tipo;
                    break;
                  case "tipo":
                    this.parentId = oDictionary.app;
                    break;
                  case "app":
                    this.parentId = oDictionary.ruc;
                    break;
                  case "ruc":
                    this.parentId = oDictionary.ambiente;
                    break;
                  case "ambiente":
                    this.parentId = "";
                    break;
                  // no default
                }

                this.createFolderDic(this.parentId, params.name, params.type, oDictionary)
                  .then(() => {
                    pathSegments.push(params);
                    doFind();
                  })
                  .catch((error) => {
                    reject(error);
                    jQuery.sap.log.error("catch " + error);
                  });
              } else {
                reject(err);
              }
            },
          });
        };
        doFind();
      });
    },
    createFolderDic: function (parentID, name, type, oDictionary) {
      //crea un folder
      var _parentId = "";
      if (parentID) {
        _parentId = parentID;
      } else {
        _parentId = cmisId;
      }
      var documentData = {
        objectId: _parentId,
        cmisaction: "createFolder",
        "propertyId[0]": "cmis:objectTypeId",
        "propertyValue[0]": "cmis:folder",
        "propertyId[1]": "cmis:name",
        "propertyValue[1]": name, //nombre del folder
        //"propertyId[2]": "cmis:objectId"
      };

      var formData = new FormData();
      jQuery.each(documentData, (key, value) => {
        formData.append(key, value);
      });

      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/cmis/" + cmisId + "/root",
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: "POST",
          success: (data) => {
            switch (type) {
              case "posicion":
                oDictionary.posicion[name] = data.properties["cmis:objectId"].value;
                break;
              case "nrosolicitud":
                oDictionary.nrosolicitud = data.properties["cmis:objectId"].value;
                break;
              case "tipo":
                oDictionary.tipo = data.properties["cmis:objectId"].value;
                break;
              case "app":
                oDictionary.app = data.properties["cmis:objectId"].value;
                break;
              case "ruc":
                oDictionary.ruc = data.properties["cmis:objectId"].value;
                break;
              case "ambiente":
                oDictionary.ambiente = data.properties["cmis:objectId"].value;
                break;
              // no default
            }

            this.parentId = JSON.stringify(data.properties["cmis:objectId"].value);
            resolve(this.parentId);
          },
          error: (err) => {
            resolve();
            jQuery.sap.log.error(err.responseJSON);
          },
        });
      });
    },
    uploadFiles: function (items, oController) {
      var dataFiles = [];
      return new Promise((resolve, reject) => {
        const sendFile = () => {
          var oItem = items.pop();
          var documentData = {
            cmisaction: "createDocument",
            "propertyId[0]": "cmis:objectTypeId",
            "propertyValue[0]": "cmis:document",
            "propertyId[1]": "cmis:name",
            "propertyValue[1]": oItem.name,
            //	"datafile": oItem.iFile
          };
          var formData = new FormData();
          formData.append("datafile", oItem.BlobFile, oItem.name);
          jQuery.each(documentData, (key, value) => {
            formData.append(key, value);
          });

          $.ajax({
            url: "/cmis/" + cmisId + "/root/" + oItem.path,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: "POST",
            success: (data) => {
              var file = {
                fileId: data.properties["cmis:objectId"].value,
                fileName: data.properties["cmis:name"].value,
              };
              dataFiles.push(file);
              if (items.length) {
                sendFile();
              } else {
                resolve(this.parentId);
              }
            },
            error: (error) => {
              jQuery.sap.log.error("error: " + JSON.stringify(error));
              reject(error);
            },
          });
        };
        sendFile();
      });
    },
    sendFiles: function (pathSegments, items, oDictionary, oController) {
      return new Promise((resolve, reject) => {
        this.findPath(pathSegments, oDictionary)
          .then((sPath) => {
            if (items.length) {
              this.uploadFiles(items, oController)
                .then((dataFiles) => {
                  resolve(this.parentId);
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              resolve(this.parentId);
            }
          })
          .catch((error) => {
            jQuery.sap.log.error("catch " + error);
            reject(error);
          });
      });
    },
    ////JORDAN///////////////////////////////
    getDataDocumentService: function () {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `/cmis/ContainerApp/cmis/json`,
          cache: false,
          contentType: false,
          processData: false,
          type: "GET",
          success: (resultDocu) => {
            var key = Object.keys(resultDocu);
            resolve(resultDocu[key]);
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    },

    getCreateFolder: function (value, name) {
      return new Promise((resolve) => {
        this.getDataDocumentService().then((documentData) => {
          this.createFolder(documentData.repositoryId, "/root/" + value, name).then((oResult) => {
            resolve(oResult);
          });
        });
      });
    },

    createFolder: function (repositoryId, sRoute, nameFolder) {
      return new Promise((resolve, reject) => {
        var oDocument = {
          cmisaction: "createFolder",
          "propertyId[0]": "cmis:objectTypeId",
          "propertyValue[0]": "cmis:folder",
          "propertyId[1]": "cmis:name",
          "propertyValue[1]": nameFolder,
        };

        var formData = this.createFormData(oDocument);

        $.ajax({
          url: `/cmis/${repositoryId}/${sRoute}`,
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: "POST",
          success: (data) => {
            resolve(data);
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    },
    createFormData: function (oData) {
      var formData = new FormData();
      $.each(oData, (key, value) => {
        formData.append(key, value);
      });
      return formData;
    },

    AddFileRecursive: function (items) {
      items.pop();
    },

    getFile: function (value) {
      return new Promise((resolve) => {
        this.getDataDocumentService().then((documentData) => {
          this.request("GET", documentData.repositoryId, "/root/" + value).then((oResult) => {
            resolve(oResult);
          });
        });
      });
    },
    request: function (sRequestType, sPath, fdData) {
      //Make HTTP Request
      return new Promise((resolve, reject) => {
        //Define Path to make request
        //let sRelativePath = `/cmisproxysap/${sPath ? sPath : ""}`;
        var sRelativePath = `/cmis/${sPath}/${fdData}?`;
        //Define AJAX Settings for request
        const ajaxSettings = {
          url: sRelativePath,
          cache: false,
          type: sRequestType,
          success: (oData) => {
            var url = this.url;
            var index = url.indexOf("?");
            var dsroot = window.location.protocol + "//" + window.location.host;
            url = url.substr(0, index);

            var count = 0,
              result = [];
            oData.objects.forEach((element) => {
              result[count] = {
                properties: {
                  Id: "",
                  name: "",
                  type: "",
                  creationDate: "",
                  size: "",
                },
              };
              result[count].properties.Id = element.object.properties["cmis:objectId"];
              result[count].properties.name = element.object.properties["cmis:name"];
              result[count].properties.type = element.object.properties["cmis:contentStreamMimeType"];
              result[count].properties.creationDate = element.object.properties["cmis:creationDate"];
              result[count].properties.size = element.object.properties["cmis:contentStreamLength"];

              count++;
            });

            resolve([url, result, dsroot]);
          },
          error: (error) => {
            reject(error);
          },
        };
        //Settings in case is a POST request
        if (sRequestType === "POST") {
          ajaxSettings.contentType = false;
          ajaxSettings.processData = false;
          ajaxSettings.data = fdData;
        }
        //Execute request
        $.ajax(ajaxSettings);
      });
    },

    addFile: function (sRoute, oFile) {
      return new Promise((resolve, reject) => {
        this.getDataDocumentService().then((documentData) => {
          var oDocument = {
            cmisaction: "createDocument",
            "propertyId[0]": "cmis:objectTypeId",
            "propertyValue[0]": "cmis:document",
            "propertyId[1]": "cmis:name",
            "propertyValue[1]": oFile.FileName,
            //"datafile": oFile,
          };
          var formData = new FormData();
          formData.append("datafile", oFile.Data, oFile.FileName);
          jQuery.each(oDocument, (key, value) => {
            formData.append(key, value);
          });

          $.ajax({
            url: `/cmis/${documentData.repositoryId}/root/${sRoute}`,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: "POST",
            success: (oData) => {
              var file = {
                fileId: oData.properties["cmis:objectId"].value,
                fileName: oData.properties["cmis:name"].value,
              };
              resolve(file);
            },
            error: (error) => {
              reject(error);
            },
          });
        });
      });
    },
  };
});
