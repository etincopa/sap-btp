sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		getPrefix: function (oController, documentClass) {
      let prefix = "";
			const documentClassList = oController.getView().getModel("listDocumentClass");

      documentClassList.getData().forEach((element) => {
        if (element.DocumentClassID === documentClass) {
            prefix = element.DocumentPrefix;
        }
      });

      return prefix;
		},
	};
});