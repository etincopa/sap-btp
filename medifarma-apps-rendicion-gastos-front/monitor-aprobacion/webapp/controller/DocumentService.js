sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"
], function (JSONModel, BusyIndicator, MessageBox) {
	"use strict";

	// var cmisId = "1a084adbc0dc11ba63fc49e5"; //PRD
	var cmisId = "ea56a4f9aff8479818fc49e5"; //QAS
	var urlCmis = "/cmis/" + cmisId;

	return {

		getFolderByName: function (sParentId, sFolderName) {

			var sQuery = "SELECT cmis:objectId FROM cmis:folder WHERE ";
			sQuery = sQuery + "IN_TREE('" + sParentId + "') ";
			sQuery = sQuery + "AND cmis:name = '" + sFolderName + "'";

			var documentData = {
				"cmisselector": "query",
				"statement": sQuery
			};

			return new Promise(function (resolve, reject) {
				$.ajax({
					url: urlCmis,
					data: documentData,
					type: "GET",
					success: function (data) {
						var sFolderId = data.results[0];
						sFolderId = (!sFolderId) ? "404" : sFolderId.properties["cmis:objectId"].value;
						resolve(sFolderId);
					},
					error: function (error) {

					}
				});
			});
		},

		getFilesQuery: function (folderId) {
			var query = "SELECT ";
			query = query + "cmis:objectId as Id,";
			query = query + "cmis:name as name,";
			query = query + "cmis:contentStreamMimeType as type,";
			query = query + "cmis:creationDate as creationDate,";
			query = query + "cmis:contentStreamLength as size";
			query = query + " FROM cmis:document WHERE IN_TREE('" + folderId + "')";

			return new Promise(function (resolve, reject) {
				var documentData = {
					"cmisselector": "query",
					"statement": query
				};

				$.ajax({
					url: urlCmis,
					data: documentData,
					type: "GET",
					success: function (data) {
						var url = this.url;
						var index = url.indexOf("?");
						var dsroot = window.location.protocol + "//" + window.location.host;
						url = url.substr(0, index);
						resolve([url, data.results, dsroot]);
					},
					error: function (error) {}
				});
			});
		},

		getObjectParents: function (oFile) {
			return new Promise(function (resolve, reject) {
				var documentData = {
					"cmisselector": "parents",
					"repositoryId": cmisId,
					"objectId": oFile.Id.value,
					"includeRelativePathSegment": true,
					"filter": "cmis:name,cmis:parentId,cmis:path"
				};
				$.ajax({
					url: urlCmis + "/root/",
					data: documentData,
					type: 'GET',
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						BusyIndicator.hide();
						MessageBox.error("Error DS: " + JSON.stringify(error));
					}
				});
			});
		},

		createFolder: function (parentID, name, type, oDictionary) {
			//crea un folder
			var _this = this;
			var _parentId = "";
			if (parentID) {
				_parentId = parentID;
			} else {
				_parentId = cmisId;
			}
			var documentData = {
				"objectId": _parentId,
				"cmisaction": "createFolder",
				"propertyId[0]": "cmis:objectTypeId",
				"propertyValue[0]": "cmis:folder",
				"propertyId[1]": "cmis:name",
				"propertyValue[1]": name //nombre del folder
					//"propertyId[2]": "cmis:objectId"
			};

			var formData = new FormData();
			jQuery.each(documentData, function (key, value) {
				formData.append(key, value);
			});

			return new Promise(function (resolve, reject) {
				$.ajax({
					url: "/cmis/" + cmisId + "/root",
					data: formData,
					cache: false,
					contentType: false,
					processData: false,
					type: 'POST',
					success: function (data) {

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
						}

						_this.parentId = JSON.stringify(data.properties["cmis:objectId"].value);
						resolve(_this.parentId);
					},
					error: function (err) {
						resolve();
						jQuery.sap.log.error(err.responseJSON);
					}
				});
			});
		},

		findPath: function (pathSegments, oDictionary) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				function doFind() {
					var params = pathSegments.pop();
					$.ajax({
						url: "/cmis/" + cmisId + "/root/" + params.path + "?cmisselector=object",
						cache: false,
						contentType: false,
						processData: false,
						type: 'GET',
						success: function (data) {
							_this.parentId = data.properties["cmis:objectId"].value;
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
								}
								doFind();
							} else {
								resolve(params.path);
							}
							jQuery.sap.log.info("success " + _this.parentId);
						},
						error: function (err) {
							jQuery.sap.log.error(err.responseJSON);
							if (err.status === 404 && err.responseJSON && err.responseJSON.message && err.responseJSON.message.substr(1) === params.path) {

								switch (params.type) {
								case "posicion":
									_this.parentId = oDictionary.nrosolicitud;
									break;
								case "nrosolicitud":
									_this.parentId = oDictionary.tipo;
									break;
								case "tipo":
									_this.parentId = oDictionary.app;
									break;
								case "app":
									_this.parentId = oDictionary.ruc;
									break;
								case "ruc":
									_this.parentId = oDictionary.ambiente;
									break;
								case "ambiente":
									_this.parentId = "";
									break;
								}

								_this.createFolder(_this.parentId, params.name, params.type, oDictionary).then(
									function () {
										pathSegments.push(params);
										doFind();
									}.bind(this)).catch(function (error) {
									reject(error);
									jQuery.sap.log.error("catch " + error);

								});
							} else {
								reject(err);
							}
						}
					});
				}
				doFind();
			});
		},

		uploadFiles: function (items, oController) {
			var dataFiles = [];
			var _this = this;
			return new Promise(function (resolve, reject) {
				function sendFile() {
					var oItem = items.pop();
					var documentData = {
						"cmisaction": "createDocument",
						"propertyId[0]": "cmis:objectTypeId",
						"propertyValue[0]": "cmis:document",
						"propertyId[1]": "cmis:name",
						"propertyValue[1]": oItem.name,
						//	"datafile": oItem.iFile
					};
					var formData = new FormData();
					formData.append('datafile', oItem.BlobFile, oItem.name);
					jQuery.each(documentData, function (key, value) {
						formData.append(key, value);
					});

					$.ajax({
						url: "/cmis/" + cmisId + "/root/" + oItem.path,
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						success: function (data) {
							var file = {
								fileId: data.properties["cmis:objectId"].value,
								fileName: data.properties["cmis:name"].value
							};
							dataFiles.push(file);
							if (items.length) {
								sendFile();
							} else {
								resolve(_this.parentId);
							}
						},
						error: function (error) {
							jQuery.sap.log.error("error: " + JSON.stringify(error));
							reject(error);
						}
					});

				}
				sendFile();
			});
		},

		sendFiles: function (pathSegments, items, oDictionary, oController) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				this.findPath(pathSegments, oDictionary).then(function (sPath) {
					if (items.length) {
						this.uploadFiles(items, oController).then(function (dataFiles) {
							resolve(_this.parentId);
						}).catch(function (error) {
							reject(error);
						});
					} else {
						resolve(_this.parentId);
					}
				}.bind(this)).catch(function (error) {
					jQuery.sap.log.error("catch " + error);
					reject(error);
				});
			}.bind(this));
		},
		// JORDAN////////////////////////

		getDataDocumentService: function () {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: `/cmis/ContainerApp/cmis/json`,
					cache: false,
					contentType: false,
					processData: false,
					type: 'GET',
					success: function (resultDocu) {
						var key = Object.keys(resultDocu);
						resolve(resultDocu[key]);
					},
					error: function (err) {
						reject(err);

					}
				});
			});
		},
		getFile: function (value) {
			return new Promise((resolve) => {
				this.getDataDocumentService().then((documentData) => {
					this.request("GET", documentData.repositoryId, "/root/" + value).then(oResult => {
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
				var sRelativePath =
					`/cmis/${sPath}/${fdData}?`;
				//Define AJAX Settings for request
				const ajaxSettings = {
					url: sRelativePath,
					cache: false,
					type: sRequestType,
					success: function (oData) {
						var url = this.url;
						var index = url.indexOf("?");
						var dsroot = window.location.protocol + "//" + window.location.host;
						url = url.substr(0, index);

						var count = 0,
							result = [];
						oData.objects.forEach(element => {
							result[count] = {
								"properties": {
									"Id": "",
									"name": "",
									"type": "",
									"creationDate": "",
									"size": ""
								}
							}
							result[count].properties.Id = element.object.properties["cmis:objectId"];
							result[count].properties.name = element.object.properties["cmis:name"];
							result[count].properties.type = element.object.properties["cmis:contentStreamMimeType"];
							result[count].properties.creationDate = element.object.properties["cmis:creationDate"];
							result[count].properties.size = element.object.properties["cmis:contentStreamLength"];

							count++;
						});

						resolve([url, result, dsroot]);
					},
					error: function (error) {
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
						"cmisaction": "createDocument",
						"propertyId[0]": "cmis:objectTypeId",
						"propertyValue[0]": "cmis:document",
						"propertyId[1]": "cmis:name",
						"propertyValue[1]": oFile.FileName,
						//"datafile": oFile,
					};
					var formData = new FormData();
					formData.append('datafile', oFile.Data, oFile.FileName);
					jQuery.each(oDocument, function (key, value) {
						formData.append(key, value);
					});

					$.ajax({
						url: `/cmis/${documentData.repositoryId}/root/${sRoute}`,
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						type: "POST",
						success: function (oData) {
							var file = {
								fileId: oData.properties["cmis:objectId"].value,
								fileName: oData.properties["cmis:name"].value
							};
							resolve(file);
						},
						error: function (error) {
							reject(error);
						}
					});

				});
			});
		},
		deleteFile: function (sRoute, oFile) {
			return new Promise((resolve, reject) => {
				this.getDataDocumentService().then((documentData) => {
					var formData = new FormData();

					formData.append("cmisaction", "delete");

					$.ajax({
						url: `/cmis/${documentData.repositoryId}/root/${sRoute}/${oFile.name.value}`,
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						type: "POST",
						success: function (response) {
							resolve(200);
						},
						error: function (error) {
							reject(error);
						}
					});
				});
			});
		},

		createFormData: function (oData) {
			var formData = new FormData();
			$.each(oData, function (key, value) {
				formData.append(key, value);
			});
			return formData;
		},
	};
});