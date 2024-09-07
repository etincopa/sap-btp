sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		getBmpToken: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/xsrf-token",
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
		sendContextData: function (oToken, oContextData) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "POST",
					url: "/bpmworkflowruntime/rest/v1/workflow-instances",
					data: oContextData,
					headers: {
						"X-CSRF-Token": oToken
					},
					success: function (result) {
						resolve(result);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					},
					dataType: "json",
					contentType: "application/json"
				});
			});
		},
		sendUpdateContextData: function (oToken, oContextData, InstanceID) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "PATCH",
					url: "/bpmworkflowruntime/rest/v1/workflow-instances/" + InstanceID + "/context",
					data: JSON.stringify(oContextData),
					headers: {
						"X-CSRF-Token": oToken
					},
					success: function (result) {
						resolve(result);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					},
					dataType: "json",
					contentType: "application/json"
				});
			});
		},
		sendData: function (oContextData) {
			return new Promise(function (resolve, reject) {
				var _this = this;
				this.getBmpToken().then(function (oToken) {
					_this.sendContextData(oToken, oContextData).then(function (response) {
						resolve(response);
					}).catch(function (sErrorMsg) {
						reject(sErrorMsg);
					});
				}).catch(function (sErrorMsg) {
					reject(sErrorMsg);
				});
			}.bind(this));
		},
		updateData: function (oContextData, InstanceID) {
			return new Promise(function (resolve, reject) {
				var _this = this;
				this.getBmpToken().then(function (oToken) {
					_this.sendUpdateContextData(oToken, oContextData, InstanceID).then(function (response) {
						resolve(response);
					}).catch(function (sErrorMsg) {
						reject(sErrorMsg);
					});
				}).catch(function (sErrorMsg) {
					reject(sErrorMsg);
				});
			}.bind(this));
		},

		rejectTask: function (InstanceID, oUpdatedContextData) {
			return new Promise(function (resolve, reject) {
				this.getBmpToken().then(function (oToken) {
					$.ajax({
                        url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/task-instances/" + InstanceID ,
						//url: "/bpmworkflowruntime/rest/v1/task-instances/" + InstanceID,
						method: "PATCH",
						contentType: "application/json",
						dataType: "json",
						data: "{\"status\": \"COMPLETED\", \"stage\": \"Reject\", \"context\": " + JSON.stringify(oUpdatedContextData) + "}",
						headers: {
							"X-CSRF-Token": oToken
						},
						success: function (oData) {
							resolve(oData);
						},
						error: function (errMsg) {
							reject("XSRF token request didn't work: " + errMsg.statusText);
						}
					});

				}.bind(this)).catch(function (sErrorMsg) {
					reject(sErrorMsg.statusText);
				});
			}.bind(this));
		},

		completeTask: function (InstanceID, oUpdatedContextData) {
			return new Promise(function (resolve, reject) {
				this.getBmpToken().then(function (oToken) {
					$.ajax({
						url: "/bpmworkflowruntime/rest/v1/task-instances/" + InstanceID,
						method: "PATCH",
						contentType: "application/json",
						dataType: "json",
						data: "{\"status\": \"COMPLETED\", \"context\": " + oUpdatedContextData + "}",
						headers: {
							"X-CSRF-Token": oToken
						},
						success: function (oData) {
							resolve(oData);
						},
						error: function (errMsg) {
							reject("XSRF token request didn't work: " + errMsg.statusText);
						}
					});

				}.bind(this)).catch(function (sErrorMsg) {
					reject(sErrorMsg.statusText);
				});
			}.bind(this));
		},
		getStartupParameters: function (oController) {
			return oController.getOwnerComponent().getComponentData().startupParameters;
		},
		getTaskData: function (startupParameters) {
			var oTaskModel = startupParameters.taskModel;
			return oTaskModel ? oTaskModel.getData() : undefined;
		},
		getProcessContext: function (oController, oTaskData) {
			var oComponent = oController.getOwnerComponent();
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: "/bpmworkflowruntime/rest/v1/task-instances/" + oTaskData.InstanceID + "/context",
					contentType: "application/json",
					dataType: "json",
					success: function (result, xhr, data) {
						var processContext = new JSONModel();
						processContext.context = data.responseJSON;

						processContext.context.task = {};
						processContext.context.task.Title = oTaskData.TaskTitle;
						processContext.context.task.Priority = oTaskData.Priority;
						processContext.context.task.Status = oTaskData.Status;

						if (oTaskData.Priority === "HIGH") {
							processContext.context.task.PriorityState = "Warning";
						} else if (oTaskData.Priority === "VERY HIGH") {
							processContext.context.task.PriorityState = "Error";
						} else {
							processContext.context.task.PriorityState = "Success";
						}
						processContext.context.task.CreatedOn = oTaskData.CreatedOn.toDateString();
						oComponent.setModel(processContext, "context");
						resolve();
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					}
				});

			});
		},
		getProcessContextByInstanceID: function (oThes, InstanceID) {
			const sUrl = oThes.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/workflow-instances/" + InstanceID + "/context");
			return new Promise(function (resolve, reject) {
				$.ajax({
					type: "GET",
					url: sUrl,
					contentType: "application/json",
					dataType: "json",
					success: function (result, xhr, data) {
						var processContext = new JSONModel();
						processContext = data.responseJSON;
						resolve(processContext);
					},
					error: function (errMsg) {
						reject(errMsg.statusText);
					}
				});

			});
		},
		getExecutionLogs: function (oThes, InstanceID) {
			// url: "/bpmworkflowruntime/rest/v1/workflow-instances/" + InstanceID + "/execution-logs",
			// url: "/medifarma-apps-rendicion-gastos-bs.firstusertask" + "/bpmworkflowruntime/v1/workflow-instances/" + InstanceID + "/execution-logs",
			// url: "bpmworkflowruntime/workflow-service/rest/v1/workflow-instances/" +InstanceID +"/execution-logs",
			const sUrl = oThes.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/workflow-instances/" + InstanceID + "/execution-logs");
			return new Promise(function (resolve, reject) {
				$.ajax({
                    type: "GET",
					url: sUrl,
					contentType: "application/json",
					dataType: "json",
					success: function (result, xhr, data) {
						resolve(data);
					},
					error: function (err) {
                        
						reject(err.responseJSON.error);
					}
                });
                

			});
		}
	};
});