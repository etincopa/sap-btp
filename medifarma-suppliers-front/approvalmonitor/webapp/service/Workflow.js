sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (JSONModel, MessageBox, MessageToast) {
	"use strict";
	var oManifestObject;
	return {
		setManifestObject: function (that) {
			oManifestObject = that.getOwnerComponent().getManifestObject();
		},
		onGetContextWorkflow: function (oTaskData) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: oManifestObject.resolveUri("bpmworkflowruntime/v1/task-instances/" + oTaskData.InstanceID + "/context"),
					contentType: "application/json",
					dataType: "json",
					success: function (result, xhr, data) {
						resolve(result);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					}
				});

			});
		},
		_fetchToken: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: oManifestObject.resolveUri("bpmworkflowruntime/v1/xsrf-token"),
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					success: function (data, statusText, xhr) {
						resolve(xhr.getResponseHeader("X-CSRF-Token"));
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					},
					contentType: "application/json"
				});
			});
		},
		getInstances: function (sFilters) {
			return new Promise(function (resolve, reject) {
				var oModel = new JSONModel();
				var sHeaders = {
					"Content-Type": "application/json",
					"Accept": "application/json"
				};
				var sUrl = oManifestObject.resolveUri("bpmworkflowruntime/v1/workflow-instances?&$expand=attributes" + sFilters);
				//var sUrl =
				//	"/bpmworkflowruntime/v1/workflow-instances?$top=100&$inlinecount=allpages&status=ERRONEOUS%2CRUNNING%2CSUSPENDED&containsText=&definitionId=wfsuppliers&$expand=attributes";
				oModel.loadData(sUrl, null, true, "GET", null, false,
					sHeaders);
				oModel.attachRequestCompleted(function (oEvent) {
					var oResponse = oEvent.getSource().oData;
					resolve(oResponse);
				});
				oModel.attachRequestFailed(function (oEvent) {
					var oResponse = oEvent.getSource().oData;
					reject(oResponse);
				});
			});
		}
	};
});