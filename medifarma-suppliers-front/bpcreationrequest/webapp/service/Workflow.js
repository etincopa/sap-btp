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
					async: false,
					success: function (result, xhr, data) {
						resolve(result);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					}
				});

			});
		},

		// Request Inbox to refresh the control
		// once the task is completed
		onRefreshTask: function () {
			var taskId = $.getComponentDataMyInbox.startupParameters.taskModel.getData().InstanceID;
			$.getComponentDataMyInbox.startupParameters.inboxAPI.updateTask("NA", taskId);
		},
		
		getStartupParameters: function (oController){
			return oController.getOwnerComponent().getComponentData().startupParameters;
		},

		// Request Inbox to refresh the control
		// once the task is completed
		onRefreshTaskPrueba: function (taskId, oController) {
			// var taskId = $.getComponentDataMyInbox.startupParameters.taskModel.getData().InstanceID;
			var prueba = "A";
			if(prueba === "A"){
				$.getComponentDataMyInbox.startupParameters.inboxAPI.updateTask("NA", taskId);
			}else{
				var _this = this;
				_this.getStartupParameters(oController).inboxAPI.updateTask("NA", taskId);
			}
		},
		
		getBmpToken: function () {
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
		
		completeTask: function(oController) {
			var oContext = {"action": "R"};
			var _this = this;
			var taskId = $.getComponentDataMyInbox.startupParameters.taskModel.getData().InstanceID;
			this.getBmpToken().then(function (oToken) {
				$.ajax({
					url: oManifestObject.resolveUri("bpmworkflowruntime/v1/task-instances/" + taskId),
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
				_this.onRefreshTaskPrueba(taskId, oController);
			}).catch(function (sErrorMsg) {
				//reject(sErrorMsg);
			});
		}
	};
});