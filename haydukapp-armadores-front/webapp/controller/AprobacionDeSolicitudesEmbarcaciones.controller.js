sap.ui.define(["sap/ui/core/mvc/Controller",
	"./utilities",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/TextArea"
], function(BaseController, Utilities, MessageBox, MessageToast, MessagePopover, MessagePopoverItem, JSONModel, Button, Dialog, Label,
	TextArea) {
	"use strict";

	$._oMessageTemplate = new sap.m.MessagePopoverItem({
		type: "{type}",
		title: "{title}",
		description: "{description}",
		subtitle: "{subtitle}",
		counter: "{counter}"
	});

	$._oMessagePopover = new sap.m.MessagePopover({
		items: {
			path: "/",
			template: $._oMessageTemplate
		}
	});

	$._popoverData = [];
	$._popoverCount = 0;
	$._popoverModel = new sap.ui.model.json.JSONModel();

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.AprobacionDeSolicitudesEmbarcaciones", {
		onInit: function() {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.getTarget("AprobacionDeSolicitudesEmbarcaciones").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			$._popoverModel.setData($._popoverData);
			$._oMessagePopover.setModel($._popoverModel);
		},

		onAfterRendering: function() {
			var _this = this;
			if ($._sLoginUser === "" || !$._sLoginUser) {
				sap.m.MessageBox.confirm("Regresará al menú principal", {
					title: "Retorno al menú principal",
					actions: ["Regresar"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Regresar" || !sActionClicked) {
							console.log("back to MenuPrincipal");
							sap.ui.core.UIComponent.getRouterFor(_this).navTo("MenuPrincipal");
						}
					}
				});
			}
		},

		handleRouteMatched: function(oEvent) {
			var sContext = oEvent.mParameters.data.context;

			if (!this.Binding) {
				this.Binding = this.getView().byId("tblRequested").getBinding("items");
			}

			if (sContext === undefined) {
				//this.getView().getModel().refresh();
				return;
			}

			if (sContext.indexOf("message") === 0) {
				var parts = sContext.split("|");
				var sRuc = parts[1];
				var sRequest = parts[2];
				var sResult = parts[3];
				var sMessage = parts[4];

				this._addPopoverMessage(sResult, "Solicitud : " + sRequest + " (RUC - " + sRuc + ")", sMessage);
				this.Binding.refresh();
			}

			if (sContext.indexOf("Ruc") > 0) {
				var oContext = JSON.parse(sContext);
				if (typeof oContext === "object") {
					this.getView().byId("searchField").setValue(oContext.Ruc);
					this.Binding.filter(new sap.ui.model.Filter("Ruc", sap.ui.model.FilterOperator.EQ, oContext.Ruc));
				}
			}
		},

		onIconPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oItem = oBindingContext.getObject();

			this.router.navTo("LogDeErroresEnSap", {
				context: oItem.Message
			});
		},

		getText: function(key) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key);
		},
		_getCreatePromise: function(oMetaModel, sPath, oModel) {
			var _this = this;
			var ruc = oModel.getProperty(sPath + "/Ruc");
			var request = oModel.getProperty(sPath + "/Request");

			return new Promise(function(resolve, reject) {

				var oProps = oModel.getProperty(sPath);

				// delete oProps.Estado;
				// delete oProps.Condicion;
				// delete oProps.Detraction;

				oMetaModel.create("/ShipownerSet", oProps, {
					success: function(oData) {
						var sParseResult = Utilities.parseMessage(oData.Message);

						if (sParseResult[1] === "Error") {
							//							oCells[5].setVisible(true);
							_this._addPopoverMessage("Error", "Solicitud : " + request + " (RUC - " + ruc + ")", sParseResult[0]);
							MessageToast.show("Ha ocurrido un error. Ver log");
							return reject(oData);
						} else {
							_this._addPopoverMessage("Success", "Solicitud : " + request + " (RUC - " + ruc + ") - ", sParseResult[0]);
							resolve(oData);
						}
					},
					error: function(oError) {
						if (oError.message && oError.message !== "") {
							MessageToast.show("Han ocurrido errores en la creación. Revisar 'Mensajes' para más información");
							if (oError.message) {
								_this._addPopoverMessage("Error", "Solicitud : " + request + " (RUC - " + ruc + ")", oError.message);
								reject(oError.message);
							} else {
								_this._addPopoverMessage("Error", "Solicitud : " + request + " (RUC - " + ruc + ")", "Error desconocido");
								reject("Error desconocido");
							}
						} else {
							_this._addPopoverMessage("Error", "Solicitud : " + request + " (RUC - " + ruc + ")", "Error desconocido");
							reject("Error desconocido");
						}
					}
				});
			});
		},

		_createArmadores: function(aSelectedHeaders) {

			var oMetaModel = this.getOwnerComponent().getModel();
			var armadorModel = this.getOwnerComponent().getModel("armador");
			var requestedModel = this.getOwnerComponent().getModel("requested");
			var oModel;
			var nItems = aSelectedHeaders.length;

			var me = this;

			function resolvePromise(index, _this) {
				var item = aSelectedHeaders[index].getBindingContext().getObject();
				var sModelPath = "/ShipownerRequestSet/ShipownerSet(" + item.Request + ")";
				if (requestedModel.getProperty(sModelPath) === undefined) {
					oModel = armadorModel;
					sModelPath = "/Shipowner";
				} else {
					oModel = requestedModel;
				}
				oModel.setProperty(sModelPath + "/Ruc", item.Ruc);
				oModel.setProperty(sModelPath + "/Origin", item.Origin);
				oModel.setProperty(sModelPath + "/Request", item.Request);
				oModel.setProperty(sModelPath + "/Status", "PENDIENTE");
				return _this._getCreatePromise(oMetaModel, sModelPath, oModel);
			}

			function processAllPromises(index) {
				resolvePromise(index, me).then(function(result) {
					MessageToast.show("Solicitud " + result.Request + " - Creación correcta");

					var oNotifInfo = {
						TypeKey: "ApproveTypeKey",
						Request: result.Request,
						Ruc: result.Ruc,
						BusinessName: result.BusinessName
					};

					var sNotifText = "Solicitud aprobada " + result.Request + " - RUC " + result.Ruc +
						" - " + result.BusinessName;

					Utilities._sendPushNotification([result.Uname], sNotifText, me, true, oNotifInfo);

					Utilities._getUsersEmails(result.Uname).then(function(aEmails) {
						result.Status = "APROBADO";
						Utilities._sendEmail(oMetaModel, result, aEmails[0]).then(function(response) {
							console.log(response);
						}).catch(function(oError) {
							console.log(oError);
						});
					});
					index = index + 1;
					if (index < nItems) {
						return processAllPromises(index);
					} else {
						me.Binding.refresh();
					}
				}).catch(function() {
					me.Binding.refresh();
				});
			}
			processAllPromises(0);
		},

		onApprovePress: function() {
			var oTable = this.byId("tblRequested"),
				aSelectedHeaders = oTable.getSelectedItems(),
				msg,
				_this = this;

			switch (aSelectedHeaders.length) {
				case 0:
					msg = "selec1Doc";
					break;
				case 1:
					msg = "selectedDocs1";
					break;
				default:
					msg = "selectedDocsMany";
					break;
			}

			if (msg === "selec1Doc") {
				MessageToast.show(this.getText(msg));
			} else {
				sap.m.MessageBox.confirm("Desea enviar para creación?", {
					title: "Confirmación de creación",
					actions: ["Si", "No"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Si") {
							_this._createArmadores(aSelectedHeaders);
						}
					}
				});
			}
		},

		onRejectPress: function() {
			var oTable = this.byId("tblRequested");
			var aSelectedHeaders = oTable.getSelectedItems();
			var msg, _this = this;
			switch (aSelectedHeaders.length) {
				case 0:
					msg = "selec1Doc";
					break;
				case 1:
					msg = "selectedDocs1";
					break;
				default:
					msg = "selectedDocsMany";
					break;
			}
			return new Promise(function(fnResolve) {
				if (msg === "selec1Doc") {
					MessageToast.show(_this.getText(msg));
				} else {
					_this._showRejectDialog();
					fnResolve();
				}
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},

		onNavBack: function() {
			this.router.navTo("MenuDeRegistroDeArmadores", {}, true);
		},

		onItemPress: function(oEvent) {
			var abc = sap.ui.core.UIComponent.getRouterFor(this);
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			var sContext = oBindingContext.getPath().substring(1).replace("ShipownerRequestSet", "ShipownerSet");
			abc.navTo("DetalleDeSolicitudesDeAprobacionDeEmbarcaciones", {
				context: sContext
			});
		},

		onSearchRequested: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oTable = this.getView().byId("tblRequested");
			this.handleSearch(sQuery, oTable);
		},

		handleSearch: function(sQuery, oTable) {
			var aFilters = [],
				oFilter, oBinding;

			oFilter = new sap.ui.model.Filter("Ruc", sap.ui.model.FilterOperator.EQ, sQuery);
			aFilters.push(oFilter);

			oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},

		_handleMessagePopoverPress: function(oEvent) {
			if (!$._oMessagePopover.isOpen()) {
				$._oMessagePopover.openBy(oEvent.getSource());
			} else {
				$._oMessagePopover.close();
			}
		},

		_updatePopoverCounter: function() {
			$._popoverCount = $._popoverCount + 1;
			if (this.getView()) {
				this.getView().byId("popoverButton").setText("Mensajes (" + $._popoverCount + ")");
			}
		},
		_addPopoverMessage: function(sType, sTitle, sMessage) {
			$._popoverData.push({
				type: sType,
				title: sTitle,
				description: sMessage
			});
			$._popoverModel.setData($._popoverData);
			this._updatePopoverCounter();
		},

		_showRejectDialog: function() {
			var _this = this;
			var oMetaModel = this.getOwnerComponent().getModel();
			var dialog = new Dialog({
				title: "Rechazar Armadores/Embarcaciones",
				type: "Message",

				content: [
					new Label({
						text: "Ingrese el motivo de rechazo",
						labelFor: "submitDialogTextarea"
					}),
					new TextArea("submitDialogTextarea", {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter("value");
							var parent = oEvent.getSource().getParent();

							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: "100%",
						placeholder: "Motivo de rechazo"
					})
				],
				beginButton: new Button({
					text: "Rechazar",
					type: "Reject",
					enabled: false,
					press: function() {
						var sText = sap.ui.getCore().byId("submitDialogTextarea").getValue();
						var armadorModel = _this.getOwnerComponent().getModel("armador");
						armadorModel.setProperty("/Shipowner/Message", sText);
						dialog.close();
						return _this._sendReject().then(function(aResults) {
							for (var i in aResults) {
								var oNotifInfo = {
									TypeKey: "RejectTypeKey",
									Request: aResults[i].Request,
									Ruc: aResults[i].Ruc,
									BusinessName: aResults[i].BusinessName
								};

								var sNotifText = "Solicitud rechazada " + aResults[i].Request + " - RUC " +
									aResults[i].Ruc + " - " + aResults[i].BusinessName;

								Utilities._sendPushNotification([aResults[i].Uname], sNotifText, _this, true, oNotifInfo);
							}
							var nResults = aResults.length;

							function sendEmails(index) {
								Utilities._getUsersEmails(aResults[index].Uname).then(function(aEmails) {
									Utilities._sendEmail(oMetaModel, aResults[index], aEmails[0]).then(function(response) {
										console.log(response);
										index = index + 1;
										if (nResults > index) {
											sendEmails(index);
										}
									}).catch(function(oError) {
										console.log(oError);
									});
								});
							}
							sendEmails(0);
							_this.Binding.refresh();
						}).then(function() {
							MessageToast.show("Se envió el rechazo con el motivo: " + sText);
						}).catch(function(oError) {
							console.log(oError);
							MessageToast.show("Ocurrió un error en el rechazo. Ver 'Mensajes'");
						});
					}
				}),
				endButton: new Button({
					text: "Cancelar",
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		_readUnameFromRUC: function(oMetaModel, sRuc) {
			var unameReadPath = "/ShipownerSet(Ruc='" + sRuc + "',Origin='',Status='')";

			return new Promise(function(resolve, reject) {
				oMetaModel.read(unameReadPath, {
					success: function(oData) {
						resolve(oData);
					},
					error: function(oError) {
						reject(oError);
					}
				});
			});
		},

		_getRejectPromise: function(oMetaModel, sPath, oModel) {
			var _this = this;
			var ruc = oModel.getProperty("/Shipowner/Ruc");
			var request = oModel.getProperty("/Shipowner/Request");
			var message = oModel.getProperty("/Shipowner/Message");
			var uname = oModel.getProperty("/Shipowner/Uname");
			var businessName = oModel.getProperty("/Shipowner/BusinessName");

			return new Promise(function(resolve, reject) {
				oMetaModel.update(sPath, {
					"Message": message,
					"Uname": uname
				}, {
					success: function() {
						_this._addPopoverMessage("Success", "Solicitud : " + request + " (RUC - " + ruc + ")", "Se realizó el rechazo");
						resolve({
							Uname: uname,
							Request: request,
							Ruc: ruc,
							BusinessName: businessName,
							Status: "RECHAZADO"
						});
					},
					error: function(oError) {
						_this._addPopoverMessage("Error", "Solicitud : " + request + " (RUC - " + ruc + ")", "Error desconocido");
						reject(oError.message);
					}
				});
			});
		},

		_sendReject: function() {
			var aSelectedHeaders = this.byId("tblRequested").getSelectedItems();
			var oMetaModel = this.getOwnerComponent().getModel();
			var promises = [];
			for (var v in aSelectedHeaders) {
				var item = aSelectedHeaders[v].getBindingContext().getObject();
				var armadorModel = this.getOwnerComponent().getModel("armador");
				var path = aSelectedHeaders[v].getBindingContextPath().replace("ShipownerRequestSet", "ShipownerSet");
				armadorModel.setProperty("/Shipowner/Ruc", item.Ruc);
				armadorModel.setProperty("/Shipowner/Request", item.Request);
				armadorModel.setProperty("/Shipowner/Uname", item.Uname);
				armadorModel.setProperty("/Shipowner/BusinessName", item.BusinessName);
				promises.push(this._getRejectPromise(oMetaModel, path, armadorModel));
			}
			return Promise.all(promises);
		}
	});
}, /* bExport= */ true);