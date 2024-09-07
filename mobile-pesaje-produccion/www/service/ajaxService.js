sap.ui.define([], function () {
  "use strict";
  return {
    get: function (url, headers) {
      var self = this;
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: url,
          method: "GET",
          headers: headers,
          async: true,
          contentType: "application/json",
          success: function (result) {
            resolve(result);
          },
          error: function (error) {
            reject(error);
          },
        });
      });
    },
    post: function (url, data, headers) {
      var self = this;
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: url,
          method: "POST",
          header: headers,
          data: JSON.stringify(data),
          async: true,
          contentType: "application/json",
          success: function (result) {
            if (typeof result === "string") {
              result = JSON.parse(result);
            }
            resolve(result);
          },
          error: function (error) {
            reject(error);
          },
        });
      });
    },

    delete: function (path, data, context, mockData) {
      var self = this;
      sap.ui.core.BusyIndicator.show(0);
      return new Promise(function (resolve, reject) {
        var oHeader = self.generarHeaders(context);
        $.ajax({
          url: self.serviceRootpath(context) + path,
          method: "DELETE",
          headers: oHeader,
          data: JSON.stringify(data),
          async: true,
          contentType: "application/json",
          success: function (result) {
            sap.ui.core.BusyIndicator.hide();
            resolve(self.success(result, mockData));
          },
          error: function (error) {
            sap.ui.core.BusyIndicator.hide();
            resolve(self.error(error, oHeader, mockData));
          },
          complete: function () {
            console.log("--Se ejecutó llamada de red--");
          },
        });
      });
    },
    put: function (path, data, context, mockData) {
      var self = this;
      sap.ui.core.BusyIndicator.show(0);
      return new Promise(function (resolve, reject) {
        var oHeader = self.generarHeaders(context);
        $.ajax({
          url: self.serviceRootpath(context) + path,
          method: "PUT",
          headers: oHeader,
          data: JSON.stringify(data),
          async: true,
          contentType: "application/json",
          success: function (result) {
            sap.ui.core.BusyIndicator.hide();
            resolve(self.success(result, mockData));
          },
          error: function (error) {
            sap.ui.core.BusyIndicator.hide();
            resolve(self.error(error, oHeader, mockData));
          },
        });
      });
    },
  };
});
