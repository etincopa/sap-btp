sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Filter, MessageToast) {
	"use strict";

	return Controller.extend("com.everis.suppliers.tileaccountstatus.controller.App", {
		onInit: function () {
			var that = this;
			that.Nif = "";
			this.oModel = this.getOwnerComponent().getModel();
			this._oTileModel = new sap.ui.model.json.JSONModel({});
			var iRefresh = 6;
			var aFilters = [];
			aFilters.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
			aFilters.push(new Filter("Group1", "EQ", "TILE_ACCOUNT_STATUS"));
			aFilters.push(new Filter("Field", "EQ", "DAYS"));
			aFilters.push(new Filter("Field", "EQ", "REFRESH"));
			that.oModel.read("/ConfigurationSet", {
				filters: aFilters,
				success: function (response) {
					response = response.results;
					var sDays = response.find(oItem => {
						return oItem.Group1 === "TILE_ACCOUNT_STATUS" && oItem.Field === "DAYS";
					});
					if (sDays === undefined) {
						MessageToast.show("Agregar el número de dias.");
					} else {
						sDays = sDays.ValueLow;
					}
					var sRefresh = response.find(oItem => {
						return oItem.Group1 === "TILE_ACCOUNT_STATUS" && oItem.Field === "REFRESH";
					});
					if (sRefresh === undefined) {
						MessageToast.show("Agregar la cantidad a refrescar.");
					} else {
						iRefresh = Number(sRefresh.ValueLow);
					}

					response = response.results;
					that.readUserIasInfo().then(function (data) {
						that.Nif = data.oData.ruc;
						if (that.Nif === "") {
							MessageToast.show("El usuario no tiene ruc.");
						}
						that.getValues(that, that.Nif, sDays);
						that.intervalHandle = setInterval(function () {
							that.getValues(that, that.Nif, sDays);
						}, iRefresh * 1000);
						console.log(data);
					});
				},
				error: function (error) {}
			});
		},
		getValues: function (that, sNif, sDays) {
			var sIdTile = 'ACCOUNTSTATUS';
			sIdTile = sIdTile.toUpperCase();
			var aFilters = [];
			aFilters.push(new Filter("Value1", 'EQ', sNif));
			aFilters.push(new Filter("Value2", 'EQ', sDays));
			aFilters.push(new Filter("Value3", 'EQ', sIdTile));
			aFilters.push(new Filter("Id", 'EQ', sNif));
			that.oModel.read("/CustomTileSet", {
				filters: aFilters,
				success: function (result) {
					result = result.results[0];
					result.Value1 = parseFloat(result.Value1);
					result.Value2 = parseFloat(result.Value2);
					result.Value3 = parseFloat(result.Value3);
					result.Value4 = parseFloat(result.Value4);
					result.Value5 = parseFloat(result.Value5);
					result.Total = result.Value1 + result.Value2 + result.Value3 + result.Value4 + result.Value5;

					that._oTileModel.setData(result);
					that._oTileModel.refresh(true);
					that.getView().setModel(that._oTileModel, "tile")

				},
				error: function (error) {

				}
			});
		},
		readUserIasInfo: function () {
			var that = this;
			return new Promise(function (resolve, reject) {
				var userModel = new JSONModel({});
				var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
				var sPath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
				const sUrl = that.getOwnerComponent().getManifestObject().resolveUri(sPath);
				userModel.loadData(sUrl, null, true, 'GET', null, null, {
					'Content-Type': 'application/scim+json'
				}).then(() => {
					console.log("***IAS**");
					var oDataTemp = userModel.getData();
					var oData = {};
					var aAttributes = oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
					if (aAttributes !== undefined) {
						oData = {
							oData: {
								ruc: oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value
							}
						}
					} else {
						oData = {
							oData: {
								ruc: ""
							}
						}
					}

					resolve(oData);
					console.log(userModel.getData());
				}).catch(err => {
					console.log("***fail**");
					reject("Error");

				});
			});
		},
		onPress: function (oEvent) {
			//	var supplier = oEvent.getSource().getBindingContext().getProperty("Product/SupplierID"); // read SupplierID from OData path Product/SupplierID
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "AccountStatus",
					action: "Display"
				},
				//	params: {
				//		"supplierID": supplier
				//	}
			})) || ""; // generate the Hash to display a Supplier
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application
		}
	});
});