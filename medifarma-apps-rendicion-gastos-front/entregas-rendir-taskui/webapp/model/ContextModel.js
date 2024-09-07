sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	/* globals Promise */

	return {
		_getAppModulePath: function (oComponent) {
			const appId = oComponent.getManifestEntry("/sap.app/id"),
			appPath = appId.replaceAll(".", "/");
			
			return jQuery.sap.getModulePath(appPath);
		},
		/**
		 * Reads the process context from REST API
		 */
		readContext: function (oComponent, taskId) {
			// set the UI to busy
			oComponent.setBusy(true);

			var promise = new Promise((resolve, reject) => {
				$.ajax({
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/task-instances/" + taskId + "/context",
					method: "GET",
					contentType: "application/json",
					dataType: "json",
					success: (result, xhr, data) => {
                        debugger
						// resolve with the process context as result
						resolve(data.responseJSON);
					},
					error: (xhr, textStatus, errorText) => {
						reject(Error(errorText));
					}
				});
			});

			// the method returns a promise!
			return promise;
		},

		/**
		 * Triggers the completion of the task via REST API
		 */
		triggerComplete: function (oComponent, taskId, stage, oContext, statusIsntace) {
			var promise = new Promise((resolve, reject) => {
				$.ajax({
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/xsrf-token",
					method: "GET",
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					success: (result, xhr, data) => {
						var token = data.getResponseHeader("X-CSRF-Token");
						var oDataJson = {
							"status": "COMPLETED",
							"stage": stage,
							"context": oContext
						};
						// after receiving the token, call the task completion REST API
						$.ajax({
							url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/task-instances/" + taskId,
							method: "PATCH",
							contentType: "application/json",
							data: JSON.stringify(oDataJson),
							headers: {
								"X-CSRF-Token": token
							},
							success: (result, xhr, data) => {
								resolve(data);

								// oDataJson = {
								// 	"status": statusIsntace
								// };

								// $.ajax({
								// 	url: this._getAppModulePath(oComponent) + "/bpmworkflowruntime/v1/workflow-instances/" + oContext.workflowInstanceId,
								// 	method: "PATCH",
								// 	contentType: "application/json",
								// 	data: JSON.stringify(oDataJson),
								// 	headers: {
								// 		"X-CSRF-Token": token
								// 	},
								// 	success: (result, xhr, data) => {
								// 		resolve(data);
								// 	},
								// 	error: (xhr, textStatus, errorText) => {
								// 		reject(Error(errorText));
								// 	}
								// });
							},
							error: (xhr, textStatus, errorText) => {
								reject(Error(errorText));
							}
						});
					},
					error: (xhr, textStatus, errorText) => {
						reject(Error(errorText));
					}
				});
			});

			return promise;
		}
	};
});