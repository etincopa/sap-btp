sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"../message/HomeMessage"
], function (JSONModel, BusyIndicator, HomeMessage) {
	"use strict";

	// var cmisId = "1a084adbc0dc11ba63fc49e5"; //PRD
	var cmisId = "ea56a4f9aff8479818fc49e5"; //QAS
	var urlCmis = "/html5apps/detalleentregarendirworkflow/cmis/" + cmisId;
	var cmis = "/html5apps/detalleentregarendirworkflow/cmis";

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
			query = query + "cmis:creationDate as creationDate";
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
						HomeMessage.showMessageError("Error DS: " + JSON.stringify(error));
					}
				});
			});
		},

		/////JORDAN////////////
		getDataDocumentService: function () {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: `${cmis}/ContainerApp/cmis/json`,
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
					`${cmis}/${sPath}/${fdData}?`;
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

	};
});