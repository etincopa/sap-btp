sap.ui.define([
	"../controller/BaseController",
	"../service/Workflow",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/BusyIndicator",
	"sap/fe/navigation/NavigationHandler",
    "sap/fe/navigation/NavType"
], function (BaseController, WF, MessageToast, MessageBox, JSONModel, Formatter, BusyIndicator, NavigationHandler, NavType) {
	"use strict";

	return BaseController.extend("com.everis.suppliers.approvalmonitor.controller.Home", {
		onInit: function () {
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel);
			this.oTable = this._byId("tblReporteSolicitudes");
			this.oNavigationHandler = new NavigationHandler(this);
			this.oNavigationHandler.parseNavigation().done(this.onNavigationDone.bind(this));
			this._oStateToSave = {
				"ApplicationKey": "",
				"RequestDate": {
					"From": null,
					"UpTo": null
				},
				"CompletedDate": {
					"From": null,
					"UpTo": null
				},
				"StatusKey": ""
			};
			WF.setManifestObject(this);
		},
		onSearchRequestByFilter: function () {
			var that = this;
			var oModelGlobal = this.getView().getModel("ModelGlobal");
			if (oModelGlobal.getProperty("/ApplicationKey") === "") {
				return MessageBox.error(this.getI18nText("msgSelectedApplication"));
			}
			if (oModelGlobal.getProperty("/RequestDate/From") === null || oModelGlobal.getProperty("/RequestDate/UpTo") === null) {
				return MessageBox.error(this.getI18nText("msgSelectedRequestDate"));
			}
			var sFilters = that.getFilters();
			BusyIndicator.show(0);
			WF._fetchToken().then(response => {
				WF.getInstances(sFilters).then(response => {
					//that.setProperty("ModelGlobal", "Instances");
					that.orderedDating(response, oModelGlobal.getProperty("/ApplicationKey"));
					//that.getView().setData(aData);
				}).catch(err => {
					BusyIndicator.hide();
					MessageBox.error(String(err));
				});
			}).catch(err => {
				BusyIndicator.hide();
				MessageBox.error(String(err));
			});
		},
		orderedDating: function (aData, sApplicationKey) {
			try {
				var aOrderedDating = [];
				var aApplication = this.getView().getModel("ModelGlobal").getProperty("/Application");
				var aStatus = this.getView().getModel("ModelGlobal").getProperty("/Status");
				var sStatusKey = this.getView().getModel("ModelGlobal").getProperty("/StatusKey");
				var oApplication = aApplication.find(oItem => {
					return oItem.Id === sApplicationKey;
				});
				for (var i = 0; i < aData.length; i++) {
					var oData = aData[i];
					var sRequestingUser = oData.attributes.find(oItem => {
						return oItem.id === "RequestingUser";
					});
					if (sRequestingUser === undefined) {
						continue;
					}
					var sReason = oData.attributes.find(oItem => {
						return oItem.id === "Reason";
					});
					var sLastApprover = oData.attributes.find(oItem => {
						return oItem.id === "LastApprover";
					});
					/*var oState = aStatus.find(oItem => {
						return oItem.Key === oData.status;
					});*/
					//	if (oData.status === "RUNNING") {
					var oAttributesStatus = oData.attributes.find(oItem => {
						return oItem.id === "Status";
					});
					if (oAttributesStatus.value === "R" || oAttributesStatus.value === "A") {
						var oState = aStatus.find(oItem => {
							return oItem.Id === oAttributesStatus.value;
						});
					} else {
						oState = aStatus.find(oItem => {
							return oItem.Id === 'P';
						});
					}
					if (sStatusKey !== "" && oState.Id !== sStatusKey) {
						continue;
					}

					var oCustomCreatedBy = oData.attributes.find(oItem => {
						return oItem.id === "CustomCreatedBy"
					});

					var oCustomObjectAttributeValue = oData.attributes.find(oItem => {
						return oItem.id === "CustomObjectAttributeValue"
					});

					var sCompletionDate = "";
					if (oData.completedAt) {
						var oDateCompletion = new Date(oData.completedAt);
						sCompletionDate = `${oDateCompletion.getDate().toString().padStart(2, "0")}/${(oDateCompletion.getMonth() + 1).toString().padStart(2, "0")}/${oDateCompletion.getFullYear()}`;
					}

					if (oAttributesStatus.value === "R") {
						sCompletionDate = oCustomObjectAttributeValue.value.slice(-10);
					}

					//}else if(){}
					var oOrderedDating = {
						"Application": oApplication.Name,
						"ApplicationId": oData.definitionId,
						"RequestingUser": sRequestingUser.value,
						"RequestDate": oCustomCreatedBy.value.slice(-10),
						"CompletedDate": sCompletionDate,
						"Reason": oData.status === "COMPLETED" ? "" : sReason.value,
						"State": oState.Description,
						"BusinessKey": oData.businessKey,
						"LastApprover": sLastApprover.value,
						"Color": oState.Color
					};
					aOrderedDating.push(oOrderedDating);
				}
				this.getView().getModel().setData(aOrderedDating);
				BusyIndicator.hide();
			} catch (err) {
				BusyIndicator.hide();
				MessageBox.error(String(err));
			}

		},
		getFilters: function () {
			var oModelGlobal = this.getView().getModel("ModelGlobal");
			var sFilters = "";
			//Combobox de estados
			if (oModelGlobal.getProperty("/StatusKey") === "") {
				sFilters = "&status=RUNNING,COMPLETED";
			} else {
				var aStatus = oModelGlobal.getProperty("/Status");
				var oState = aStatus.find(oItem => {
					return oItem.Id === oModelGlobal.getProperty("/StatusKey");
				});
				sFilters = "&status=" + oState.Key;
			}
			//Se fija el workflow definition de la aplicacion
			sFilters = sFilters + "&definitionId=" + oModelGlobal.getProperty("/ApplicationKey");
			//Se fija la fecha de creacion de la solicitud
			sFilters = sFilters + "&startedFrom=" + Formatter.dateFormat(oModelGlobal.getProperty("/RequestDate/From")) + "&startedUpTo=" +
				Formatter.dateFormat(oModelGlobal.getProperty(
					"/RequestDate/UpTo"));
			//Se fija la fecha que se completo el workflow		
			if (oModelGlobal.getProperty("/CompletedDate/From") !== null || oModelGlobal.getProperty("/CompletedDate/UpTo") !== null) {
				sFilters = sFilters + "&completedFrom=" + Formatter.dateFormat(oModelGlobal.getProperty("/CompletedDate/From")) +
					"&completedUpTo=" +
					Formatter.dateFormat(oModelGlobal.getProperty(
						"/CompletedDate/UpTo"));
			}
			this._oStateToSave = this.onSaveState(oModelGlobal);
			return sFilters;
		},
		onSaveState: function (oModelGlobal) {
			var oStateToSave = {
				"ApplicationKey": "",
				"RequestDate": {
					"From": null,
					"UpTo": null
				},
				"CompletedDate": {
					"From": null,
					"UpTo": null
				},
				"StatusKey": ""
			};
			oStateToSave.ApplicationKey = oModelGlobal.getProperty("/ApplicationKey");
			oStateToSave.RequestDate.From = oModelGlobal.getProperty("/RequestDate/From");
			oStateToSave.RequestDate.UpTo = oModelGlobal.getProperty("/RequestDate/UpTo");
			oStateToSave.CompletedDate.From = oModelGlobal.getProperty("/CompletedDate/From");
			oStateToSave.CompletedDate.UpTo = oModelGlobal.getProperty("/CompletedDate/UpTo");
			oStateToSave.StatusKey = oModelGlobal.getProperty("/StatusKey");
			return oStateToSave;
		},
		onLoadState: function (oSavedState) {
			var oRequestDateFrom = oSavedState.RequestDate.From;
			oSavedState.RequestDate.From = oRequestDateFrom ? new Date(oRequestDateFrom) : null;
			var oRequestDateUpTo = oSavedState.RequestDate.UpTo;
			oSavedState.RequestDate.UpTo = oRequestDateUpTo ? new Date(oRequestDateUpTo) : null;
			var oCompletedDateFrom = oSavedState.CompletedDate.From;
			oSavedState.CompletedDate.From = oCompletedDateFrom ? new Date(oCompletedDateFrom) : null;
			var oCompletedDateUpTo = oSavedState.CompletedDate.UpTo;
			oSavedState.CompletedDate.UpTo = oCompletedDateUpTo ? new Date(oCompletedDateUpTo) : null;
			return oSavedState;
		},
		onPressRow: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var aApplication = this.getView().getModel("ModelGlobal").getProperty("/Application");
			var oRow = oSource.getBindingContext().getObject();
			var oAppNavigate = aApplication.find(oItem => {
				return oItem.Id === oRow.ApplicationId;
			});
			MessageBox.confirm("Desea ver el detalle?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				styleClass: "sapUiSizeCompact",
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.OK) {
						that.oNavigationHandler.navigate(oAppNavigate.SemanticObject, oAppNavigate.Action, { businessKey: oRow.BusinessKey },{ customData: that._oStateToSave });
					}
				}
			});
		},
		onNavigationDone: function(oAppData, oURLParameters, sNavType) {
			switch (sNavType) {
			case NavType.initial:
				break;
			case NavType.iAppState:
				this._oAppState = oAppData.customData;
				// this.onLoadState(this._oAppState);
				var oModelGlobal = this.getView().getModel("ModelGlobal");
				oModelGlobal.dataLoaded().then(() => {
					oModelGlobal.setData(this.onLoadState(this._oAppState), true);
				});
				break;
			}
		}
	});
});