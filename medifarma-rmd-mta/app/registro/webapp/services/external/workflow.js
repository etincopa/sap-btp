sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, DataService, Filter, FilterOperator) {
	"use strict";

	return {
		idWorkflow: "fcp_wf",
		getStartupParameters: function (oController) {
			return oController.getOwnerComponent().getComponentData().startupParameters;
		},

		getBmpToken: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: "/mifrmdsolicitud/bpmworkflowruntime/v1/xsrf-token",
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

		completeTask: function (taskId, oContext) {
			this.getBmpToken().then(function (oToken) {
				$.ajax({
					url: "/mifrmdsolicitud/bpmworkflowruntime/v1/task-instances/" + taskId,
					method: "PATCH",
					contentType: "application/json",
					async: false,
					data: JSON.stringify({
						status: "COMPLETED",
						context: oContext
					}),
					headers: {
						"X-CSRF-Token": oToken
					}
				});
			}).catch(function (sErrorMsg) {
				//reject(sErrorMsg);
			});
		},

		getTaskContextByActivityId: function (instanceID, activityId) {
			return new Promise(function (resolve, reject) {
				this.getTaskByActivityId(instanceID, activityId).then(function (activityContext) {
					var taskInstanceId = activityContext.id;
					$.ajax({
						type: "GET",
						url: "/mifrmdsolicitud/bpmworkflowruntime/v1/task-instances/" + taskInstanceId + "/context",
						contentType: "application/json",
						dataType: "json",
						success: function (result) {
							var response = {
								id: taskInstanceId,
								context: result
							}
							resolve(response);
						},
						error: function (errMsg) {
							reject(errMsg);
						}
					});
				}).catch(function (sErrorMsg) {
					reject(sErrorMsg);
				});

			}.bind(this));
        },
        
		getTaskByActivityId: function (instanceID, activityId) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: "/mifrmdsolicitud/bpmworkflowruntime/v1/task-instances?workflowInstanceId=" + instanceID,
					contentType: "application/json",
					dataType: "json",
					success: function (result) {
						var activityContext = {};
						for (var i = 0; i < result.length; i++) {
							if (result[i].activityId == activityId)
								activityContext = result[i]
						}
						resolve(activityContext);
					},
					error: function (errMsg) {
						reject(errMsg);
					}
				});
			});
		}
	};
});