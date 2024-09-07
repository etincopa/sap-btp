sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageToast"
], function (JSONModel, Device, MessageToast) {
	"use strict";
	return {
		onValidationAdjunt: function (oBlob) {
			var oFileXml = oBlob.filter(e => e.type === "text/xml");
			var oFilePdf = oBlob.filter(e => e.type === "application/pdf");
			if (oFileXml.length > 1) {
				MessageToast.show("Solo se permite un archivo XML");
				return true;
			}
			if (oFilePdf.length > 1) {
				 MessageToast.show("Solo se permite un archivo PDF");
				return true;
			}
			if (oFileXml.length === 0) {
				MessageToast.show("Archivo XML obligatorio!");
				return true;
			} else if (oFilePdf.length === 0) {
				MessageToast.show("Archivo PDF obligatorio!");
				return true;
			} else {
				return false;
			}
        },
        onValidationAdjuntOtros: function (oBlob) {
            if(oBlob.length === 0) {
				MessageToast.show("Por favor adjunte OC & guía de remisión o sustento del servicio.");
                return true;
            }else {
				return false;
			}
		}
	};
});