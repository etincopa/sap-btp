sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  return {
    getBmpToken: function () {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "GET",
          url: "/bpmworkflowruntime/rest/v1/xsrf-token",
          headers: {
            "X-CSRF-Token": "Fetch",
          },
          success: function (data, statusText, xhr) {
            resolve(xhr.getResponseHeader("X-CSRF-Token"));
          },
          error: function (errMsg) {
            reject(errMsg.statusText);
          },
          contentType: "application/json",
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
            "X-CSRF-Token": oToken,
          },
          success: function () {
            resolve();
          },
          error: function (errMsg) {
            reject(errMsg.statusText);
          },
          dataType: "json",
          contentType: "application/json",
        });
      });
    },
    sendData: function (oContextData) {
      return new Promise(function (resolve, reject) {
        this.getBmpToken()
          .then((oToken) => {
            this.sendContextData(oToken, oContextData)
              .then(() => {
                resolve();
              })
              .catch((sErrorMsg) => {
                reject(sErrorMsg);
              });
          })
          .catch((sErrorMsg) => {
            reject(sErrorMsg);
          });
      });
    },
    completeTask: function (InstanceID, oUpdatedContextData) {
      return new Promise((resolve, reject) => {
        this.getBmpToken()
          .then((oToken) => {
            $.ajax({
              url: "/bpmworkflowruntime/rest/v1/task-instances/" + InstanceID,
              method: "PATCH",
              contentType: "application/json",
              dataType: "json",
              data: '{"status": "COMPLETED", "context": ' + oUpdatedContextData + "}",
              headers: {
                "X-CSRF-Token": oToken,
              },
              success: (oData) => {
                resolve(oData);
              },
              error: (errMsg) => {
                reject("XSRF token request didn't work: " + errMsg.statusText);
              },
            });
          })
          .catch((sErrorMsg) => {
            reject(sErrorMsg.statusText);
          });
      });
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
          },
        });
      });
    },
  };
});
