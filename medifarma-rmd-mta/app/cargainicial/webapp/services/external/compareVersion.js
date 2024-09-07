sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    onGetDataGeneral: function (Owner, entity) {
      global.clientId = "a09cf9aa-be4f-4429-9f39-26a58365254b";
      global.clientSecret = "8f7f6516659a2a87a13feb970ad2a99e";
      global.myStorage = "";

      const config = new groupdocs_comparison_cloud.Configuration(
        clientId,
        clientSecret
      );
      config.apiBaseUrl = "https://api.groupdocs.cloud";

      return config;
    },
  };
});
