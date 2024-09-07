sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "com/everis/suppliers/invoiceregister/model/models"], function (e, t, o,
	a) {
	"use strict";
	var i = {
		PurchaseOrderHeaderSet: {
			Popover1: "",
			DetalleOc: ""
		}
	};
	return e.extend("com.everis.suppliers.invoiceregister.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			this.setModel(o.createDeviceModel(), "device");
			this.setModel(o.createFLPModel(), "FLP");
			this.setModel(new sap.ui.model.json.JSONModel({
				uri: "/here/goes/your/serviceUrl/local/"
			}), "dataSource");
			var t = new sap.ui.model.json.JSONModel({});
			this.setModel(t, "applicationModel");
			e.prototype.init.apply(this, arguments);
			try {
				this.setModel(this.getComponentData().startupParameters.BUKRS[0], "BUKRS");
			} catch (e) {}
			this.setModel(new sap.ui.model.json.JSONModel({
				Files: []
			}), "filesUploaded");
			this.getRouter().initialize();
		},
		createContent: function () {
			var e = new sap.m.App({
				id: "App"
			});
			var t = "App";
			var o = "#FFFFFF";
			if (t === "App" && o) {
				e.setBackgroundColor(o);
			}
			return e;
		},
		getNavigationPropertyForNavigationWithContext: function (e, t) {
			var o = i[e];
			return o === null ? null : o[t];
		}
	});
});