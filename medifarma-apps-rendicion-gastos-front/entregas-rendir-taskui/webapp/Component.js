sap.ui.define([	
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"UISolicitudFF/model/models",
	"UISolicitudFF/model/ContextModel",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/TextArea"
], function (UIComponent, JSONModel, models, ContextModel, Button, Dialog, Label, MessageToast, TextArea) {
	"use strict";

	return UIComponent.extend("UISolicitudFF.Component", {

		metadata: {
			manifest: "json"
		},

		appModel: {
			isBusy: false
		},

		init: function () {
			var that = this;

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set application model
			this.setModel(new JSONModel(this.appModel), "appModel");
			
			// set help model
			this.setModel(models.createHelpModel(), "helpModel");
			
			// get task instance ID	and read the process context
			try {
				var taskId = this._getTaskId();

				var p = ContextModel.readContext(that, taskId);
				p.then(function (oContext) {
					// loading of context data was successfull

					// TODO Here you can add some initialization if necessary

					// adding that "data" model. data.ctx contains the context
					var oStartupParameters = that.getComponentData().startupParameters;
					var oTaskData = oStartupParameters.taskModel.getData();
					var oDataModel = new JSONModel({
						context: oContext,
						task: {
							description: "",
							title: oTaskData.TaskTitle,
							priority: oTaskData.Priority,
							priorityText: oTaskData.PriorityText,
							status: oTaskData.Status,
							statusText: oTaskData.StatusText,
							createdOn: oTaskData.CreatedOn,
							createdBy: oTaskData.CreatedBy
						}
					});
					// Setting task description
					oStartupParameters.inboxAPI.getDescription("NA", taskId)
						.done(function (dataDescr) {
							oDataModel.setProperty("/task/description", dataDescr.Description);
						})
						.fail(function (errorText) {
							that._handleError.call(that, Error(errorText));
						});

					// set the model for binding
					that.setModel(oDataModel, "data");

					// add buttons to approve and reject
					that._addAction("Approve", "GENERIC_COMPLETE_TITLE", "Accept", function (button) {
						that._callbackAction(oDataModel, "confirm");
					});

					that._addAction("Reject", "GENERIC_REJECT_TITLE", "Reject", function (button) {
						that._callbackAction(oDataModel, "Reject");
					});

					// remove busy indicator
					that.setBusy(false);
				}, function (err) {
					that._handleError.call(that, err);
				});
			} catch (err) {
				that._handleError.call(that, err);
			}
		},

		_callbackAction: function (oDataModel, action) {
			var that = this;
			var _checkAction = false;
			if (action === "confirm") {
				//Inicio Popup - Motivo de aprobación
				var sIdTextAreaAprobacion = "textAreaAprobacion";
				var dialog = new Dialog({
					title: "Motivo de Aprobación",
					type: "Message",
					content: [
						new Label({
							text: "¿Cuál es su motivo de Aprobación?"
						}),
						new TextArea(sIdTextAreaAprobacion, {
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();
								parent.getBeginButton().setEnabled(sText.length > 0);
							},
							width: "100%",
							placeholder: "Escriba aquí"
						}),
					],
					beginButton: new Button({
						text: "Enviar",
						enabled: false,
						press: function (oEvent) {
							var sText = sap.ui.getCore().byId(sIdTextAreaAprobacion).getValue();
							oDataModel.oData.context.MotivoAprobacion = sText;
							_checkAction = that._checkConfirmData(oDataModel.getData());
							that._checkAction(_checkAction, action, oDataModel);
							dialog.close();
						}
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
				//Fin Popup - Motivo de aprobación
			} else {
				//Inicio Popup - Motivo de rechazo
				var idTextArea = Math.random().toString(36).substring(7);
				var dialog = new Dialog({
				title: "Motivo de Rechazo",
				type: "Message",
				content: [
					new Label({ text: "¿Cuál es su motivo de rechazo?"}),
					new TextArea(idTextArea,{
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter("value");
							var parent = oEvent.getSource().getParent();
							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: "100%",
						placeholder: "Escriba aquí."
					})
				],
				beginButton: new Button({
					text: "Enviar",
					enabled: false,
					press: function () {
						//Accion de rechazo
						var sText = sap.ui.getCore().byId(idTextArea).getValue();

						if (oDataModel.oData.context.Type == "G") {
							var aResult = that.getModel("modelDetalle").getData().results;
							that.onUpdateDetalle(aResult).then(() => {
								oDataModel.oData.context.MotRechz = sText;
								_checkAction = that._checkRejectData(oDataModel.getData());
								that._checkAction(_checkAction, action, oDataModel);
								dialog.close();
							});
						} else {
							oDataModel.oData.context.MotRechz = sText;
							_checkAction = that._checkRejectData(oDataModel.getData());
							that._checkAction(_checkAction, action, oDataModel);
							dialog.close();
						}
					}
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
				dialog.open();
			//Fin Popup Motivo de rechazo
			}
		},

		fnFormatearFechaVista: function (pValue) {
			if (pValue !== null && pValue !== undefined) {
				var d = new Date(pValue);
				var month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = '' + d.getFullYear();

				if (month.length < 2) {
					month = '0' + month;
				}
				if (day.length < 2) {
					day = '0' + day;
				}

				return [day, month, year].join('-');
			} else {
				return "";
			}
		},

		fnFormatearFechaSAP: function (pValue) {
			var iDia = pValue.substr(0, 2);
			var iMes = pValue.substr(3, 2);
			var iYear = pValue.substr(6, 4);
			return [iYear, iMes, iDia].join('-');
		},

		onUpdateDetalle: function (oItem, cont = 0) {
			return new Promise((resolve, reject) => {
				var oModelEntregaRendir = this.getModel("oEntregaModel");
				delete oItem[cont]["__metadata"];
				oItem[cont]["Bldat"] = this.fnFormatearFechaVista(oItem[cont]["Bldat"]);
				oItem[cont]["Bldat"] = this.fnFormatearFechaSAP(oItem[cont]["Bldat"]) + "T00:00:00";
				oItem[cont]["Budat"] = this.fnFormatearFechaVista(oItem[cont]["Budat"]);
				oItem[cont]["Budat"] = this.fnFormatearFechaSAP(oItem[cont]["Budat"]) + "T00:00:00";
				oItem[cont].Ztype = "U";

				const sPath = oModelEntregaRendir.createKey("/DetGastoSet", {
					Bukrs: oItem[cont].Bukrs,
					Belnr: oItem[cont].Belnr,
					Gjahr: oItem[cont].Gjahr,
					Nrpos: oItem[cont].Nrpos
				});

				oModelEntregaRendir.update(`${sPath}`, oItem[cont], {
					success: (oSuccess) => {
						cont++;
						if (cont < oItem.length) {
							this.onUpdateDetalle(oItem, cont).then(() => {
								resolve();
							});
						} else {
							resolve(oSuccess);
						}
					},
					error: (oError) => {
						reject(oError);
					}
				});
			});
		},

		_checkAction: function (_checkAction, action, oDataModel, status = "RUNNING") {
			var that = this;
			that.setBusy(true);
			oDataModel.getData().context.stage = _checkAction;
			if (_checkAction || !_checkAction) {
				var taskId = that.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
				var p = ContextModel.triggerComplete(this, taskId, action, oDataModel.getData().context, status);
				p.then(function () {
					that._refreshTask.call(that);
					that.setBusy(false);
				}, function (err) {
					that._handleError.call(that, err);
					that.setBusy(false);
				});
			}
		},


		/**
		 * 
		 */
		_handleError: function (err) {
			// to ensure busy indicator is off
			this.setBusy(false);

			// show a message box with the error
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.error(err.toLocaleString(), {
				title: this.getModel("i18n").getResourceBundle().getText("GENERIC_ERROR_TITLE")
			});
		},

		/**
		 *
		 */
		_checkConfirmData: function (oData) {
			// TODO check data and return either true or false
			return true;
		},

		/**
		 *
		 */
		_checkRejectData: function (oData) {
			// TODO check data and return either true or false
			return false;
		},

		/**
		 *
		 */
		setBusy: function (isBusy) {
			var oModel = this.getModel("appModel");
			oModel.setProperty("/isBusy", isBusy);
			oModel.refresh();
		},

		/**
		 *
		 */
		_getTaskId: function () {
			var oCompontentData = this.getComponentData();
			if (oCompontentData.startupParameters) {
				var startupParameters = oCompontentData.startupParameters;
				var taskData = startupParameters.taskModel.getData();
				var taskId = taskData.InstanceID;

				return taskId;
			}

			throw Error("no startupParameter available");
		},

		/**
		 *
		 */
		_addAction: function (sName, sButtonText, sButtonType, fnPressed) {
			var oCompontentData = this.getComponentData();
			if (oCompontentData.startupParameters) {
				var startupParameters = this.getComponentData().startupParameters;
				startupParameters.inboxAPI.addAction({
					action: sName,
					label: this.getModel("i18n").getResourceBundle().getText(sButtonText),
					type: sButtonType
				}, fnPressed, this);
			}
		},

		/**
		 *
		 */
		_refreshTask: function () {
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", this._getTaskId());
		}
	});
});