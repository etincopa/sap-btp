sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/TextArea",
	"./utilities"
], function(BaseController, MessageBox, MessageToast, MessagePopover, MessagePopoverItem, JSONModel, Button, Dialog, Label, TextArea,
	Utilities) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.DetalleDeSolicitudesDeAprobacionDeEmbarcaciones", {
		onAfterRendering: function() {
			var _this = this;
			if ($._sLoginUser === "" || !$._sLoginUser) {
				sap.m.MessageBox.confirm("Regresará al menú principal", {
					title: "Retorno al menú principal",
					actions: ["Regresar"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Regresar" || !sActionClicked) {
							sap.ui.core.UIComponent.getRouterFor(_this).navTo("MenuPrincipal");
						}
					}
				});
			}
		},

		handleRouteMatched: function(oEvent) {
			var oParams = {},
				oView = this.getView(),
				oPath, pos, sOrigin, Request;

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};

					oView.bindObject(oPath);

					var oBanksTable = oView.byId("tblBancos");
					oBanksTable.getBinding("items").refresh();

					pos = oPath.path.indexOf("Origin=");
					sOrigin = oPath.path.substr(pos + 8, 1);
					pos = oPath.path.indexOf("Request=");
					Request = oPath.path.substr(pos + 9, 10);

					this._changeVisibleState(oView, sOrigin === "S" ? false : true);

					var requestedModel = this.getOwnerComponent().getModel("requested");
					var sModelPath = "/ShipownerRequestSet/ShipownerSet(" + Request + ")";
					this.localModel = requestedModel;

					oView.bindObject({
						path: sModelPath,
						model: "requested"
					});

					this.localModelPath = sModelPath;

					if (requestedModel.getProperty(sModelPath) === undefined) {

						requestedModel.setProperty(sModelPath, {});

						var _this = this;
						var metaModel = this.getOwnerComponent().getModel();
						var oControls = oView.getControlsByFieldGroupId("editableGroup");

						var oContext = oView.getBindingContext();

						if (oContext === undefined) {
							oView.setBusy(true);
							oView.getModel().attachRequestCompleted(function(oEvent) {
								if (oEvent.getParameters().url === _this.sContext) {
									_this.copyProps(oView.getBindingContext(), oControls, requestedModel);
									oView.setBusy(false);
								}
							});
						} else {
							_this.copyProps(oContext, oControls, requestedModel);
							oView.setBusy(false);
						}

						var oTblRequested = this.byId("tblRequested");
						oTblRequested.setBusy(true);
						this.readMetaModel(metaModel, oPath.path, requestedModel, sModelPath, "/ShipownerBoatsSet").then(function(response) {
							oTblRequested.setBusy(false);
						}).catch(function(oError) {
							oTblRequested.setBusy(false);
							MessageToast.show("Error en obtener la información de las embarcaciones");
						});
					}

				}
			}
		},

		readMetaModel: function(oMetaModel, oMetaPath, oModel, sModelPath, sPath) {
			return new Promise(function(resolve, reject) {
				oMetaModel.read(oMetaPath + sPath, {
					success: function(oData, response) {

						var Boats = [];

						jQuery.each(oData.results, function() {
							if (this.Origin === "T") {
								Boats.push(this);
							}
						});

						oModel.setProperty(sModelPath + sPath, Boats);
						resolve(response);
					},
					error: function(response) {
						reject(response);
					}
				});
			});
		},

		copyProps: function(oContext, oControls, oModel) {
			var oObject = oContext.getObject();
			var sPath = "/ShipownerRequestSet/ShipownerSet(" + oObject.Request + ")/";

			//TODO: manejar con ID
			if (oObject.Currency === "DOLAR") {
				oObject.Currency = "DOLARES";
			}

			var aSelectProps = ["Detraction", "DestinationMp", "ToEmitDoc", "Currency", "TpTaxpayer"];
			jQuery.each(aSelectProps, function() {
				oModel.setProperty(sPath + this, oObject[this] ? oObject[this] :
					"");
			});

			jQuery.each(oControls, function() {
				var sName = this.getBindingPath("value");
				if (sName !== undefined) {
					oModel.setProperty(sPath + sName, oObject[sName]);
				}
			});
		},

		_changeVisibleState: function(oView, bState) {

			oView.byId("frmDireccion").setVisible(bState);
			oView.byId("frmSunat").setVisible(bState);
			oView.byId("frmState").setVisible(bState);
			oView.byId("frmCond").setVisible(bState);
			oView.byId("frmDestino").setVisible(bState);
			oView.byId("frmRubro").setVisible(bState);
			oView.byId("frmPerson").setVisible(bState);
			oView.byId("frmTpDoc").setVisible(bState);
			oView.byId("frmDetraction").setVisible(bState);
			oView.byId("frmCompPago").setVisible(bState);
			oView.byId("nombreArmador").setEnabled(bState);
			oView.byId("tblBancos").setVisible(bState);
		},

		_onCheckUpdate: function(oEvent) {
			var requestedModel = this.getOwnerComponent().getModel("requested");
			var oContext = this.getView().getBindingContext();
			var oObject = oContext.getObject();
			var oChecked = oEvent.getParameters().selected;
			requestedModel.setProperty("/ShipownerRequestSet/ShipownerSet(" + oObject.Request + ")/TpTaxpayer", oChecked === true ? "X" : "");
		},

		onNumericLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sVal = oInput.getValue();

			sVal = sVal.replace(/[^\d]/g, "");
			oInput.setValue(sVal);
		},

		_validateDecimalInput: function(oEvent) {
			Utilities._validateDecimalInput(oEvent);

		},

		_decimalLiveChange: function(oEvent) {
			Utilities._decimalLiveChange(oEvent);
		},

		onInit: function() {
			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DetalleDeSolicitudesDeAprobacionDeEmbarcaciones").attachDisplay(jQuery.proxy(this.handleRouteMatched,
				this));
		},

		_getCreatePromise: function(oMetaModel, sPath, oModel) {
			return new Promise(function(resolve, reject) {
				var oProps = oModel.getProperty(sPath);

				// delete oProps.Estado;
				// delete oProps.Condicion;
				// delete oProps.Detraction;

				oMetaModel.create("/ShipownerSet", oProps, {
					success: function(oData) {
						resolve(oData);
					},
					error: function(oError) {
						if (oError.message && oError.message !== "") {
							MessageToast.show("Han ocurrido errores en la creación. Revisar 'Mensajes' para más información");
							if (oError.message) {
								reject(oError.message);
							} else {
								reject("Error desconocido");
							}
						} else {
							reject("Error desconocido");
						}
					}
				});
			});
		},

		_createArmador: function() {
			var oMetaModel = this.getOwnerComponent().getModel(),
				item = this.getView().getBindingContext().getObject(),
				requestedModel = this.getOwnerComponent().getModel("requested"),
				sModelPath = "/ShipownerRequestSet/ShipownerSet(" + item.Request + ")";

			requestedModel.setProperty(sModelPath + "/Ruc", item.Ruc);
			requestedModel.setProperty(sModelPath + "/Origin", item.Origin);
			requestedModel.setProperty(sModelPath + "/Request", item.Request);
			requestedModel.setProperty(sModelPath + "/Status", "PENDIENTE");

			return this._getCreatePromise(oMetaModel, sModelPath, requestedModel);
		},

		onApprovePress: function() {
			var _this = this;
			var bError = false;
			var aInputs = [
				this.byId("rucArmador"),
				this.byId("nombreArmador")
			];

			var oMetaModel = this.getOwnerComponent().getModel();

			// Limpiar estados
			jQuery.each(aInputs, function(i, oInput) {
				oInput.setValueState("None");
			});
			this.byId("selectDetraction").setValueState("None");

			// Validar
			jQuery.each(aInputs, function(i, oInput) {
				if (!oInput.getValue()) {
					bError = true;
					oInput.setValueState("Error");
				}
			});

			if (this.byId("frmDetraction").getVisible()) {
				if (!this.byId("selectDetraction").getSelectedItem().getText()) {
					bError = true;
					this.byId("selectDetraction").setValueState("Error");
				}
			}

			if (bError) {
				MessageBox.error("Completar campos obligatorios");
				return;
			}

			sap.m.MessageBox.confirm("Desea enviar para creación?", {
				title: "Confirmación de creación",
				actions: ["Si", "No"],
				onClose: function(sActionClicked) {
					if (sActionClicked === "Si") {

						_this._createArmador().then(function(result) {
							var oNotifInfo = {
								TypeKey: "ApproveTypeKey",
								Request: result.Request,
								Ruc: result.Ruc,
								BusinessName: result.BusinessName
							};
							var sNotifText = "Solicitud aprobada " + result.Request + " - RUC " + result.Ruc + " - " +
								result.BusinessName;

							// Send push notification
							Utilities._sendPushNotification([result.Uname], sNotifText, _this, true, oNotifInfo);

							Utilities._getUsersEmails(result.Uname).then(function(aEmails) {
								result.Status = "APROBADO";
								Utilities._sendEmail(oMetaModel, result, aEmails[0]).then(function(response) {
									console.log(response);
								}).catch(function(oError) {
									console.log(oError);
								});
							});

							var sParseResult = Utilities.parseMessage(result.Message);
							_this._goBack(sParseResult[1], sParseResult[0], result.Ruc, result.Request);

							if (sParseResult[1] === "Success") {
								MessageToast.show("Creación satisfactoria");
							} else {
								MessageToast.show("Error al realizar la creación. \nVerificar log");
							}
						}).catch(function(oError) {
							MessageToast.show("Error al realizar la creación. \nVerificar log");
							_this._goBack("Error", "Error desconocido", "???????????", "00000000000"); // 11 puntos
						});
					}
				}
			});
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

						return _this._sendReject().then(function(oResult) {
							_this._goBack("Success", oResult.Message, oResult.Ruc, oResult.Request);

							// TODO: Validar
							var item = _this.getView().getBindingContext().getObject();

							var oNotifInfo = {
								TypeKey: "RejectTypeKey",
								Request: item.Request,
								Ruc: oResult.Ruc,
								BusinessName: item.BusinessName
							};

							var sNotifText = "Solicitud rechazada " + oResult.Request + " - RUC " + oResult.Ruc +
								" - " + oResult.BusinessName;

							Utilities._sendPushNotification([oResult.Uname], sNotifText, _this, true, oNotifInfo);

							Utilities._getUsersEmails(oResult.Uname).then(function(aEmails) {
								oResult.Status = "RECHAZADO";
								Utilities._sendEmail(oMetaModel, oResult, aEmails[0]).then(function(response) {
									console.log(response);
								}).catch(function(oError) {
									console.log(oError);
								});
							});

						}).then(function() {
							MessageToast.show("Se envió el rechazo con el motivo: " + sText);

						}).catch(function(oError) {
							//_this._goBack("Error", "Error desconocido", "...........");
							_this._goBack("Error", "Error desconocido", "???????????", "00000000000");
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

		_getRejectPromise: function(oMetaModel, sPath, oModel) {

			var message = oModel.getProperty("/Shipowner/Message");
			var uname = oModel.getProperty("/Shipowner/Uname");
			var ruc = oModel.getProperty("/Shipowner/Ruc");
			var request = oModel.getProperty("/Shipowner/Request");
			var business = oModel.getProperty("/Shipowner/BusinessName");

			return new Promise(function(resolve, reject) {
				oMetaModel.update(sPath, {
					"Message": message,
					"Uname": uname
				}, {
					success: function() {
						resolve({
							Uname: uname,
							Ruc: ruc,
							Request: request,
							BusinessName: business,
							Message: message
						});
					},
					error: function(oError) {
						reject(oError.message ? oError.message : "Error desconocido");
					}
				});
			});
		},

		_sendReject: function() {
			var oView = this.getView();
			var oMetaModel = this.getOwnerComponent().getModel();

			var oContext = oView.getBindingContext();
			var item = oContext.getObject();
			var armadorModel = this.getOwnerComponent().getModel("armador");
			var path = oContext.getPath();
			armadorModel.setProperty("/Shipowner/Ruc", item.Ruc);
			armadorModel.setProperty("/Shipowner/Request", item.Request);
			armadorModel.setProperty("/Shipowner/Uname", item.Uname);

			return this._getRejectPromise(oMetaModel, path, armadorModel);
		},

		_updatePopoverCounter: function() {
			this.count = this.count + 1;
			this.getView().byId("popoverButton").setText("Mensajes (" + this.count + ")");
		},

		onRejectPress: function(oEvent) {
			this._showRejectDialog();
		},

		getText: function(key) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key);
		},

		onNavBack: function() {
			var _this = this;
			var oContext = this.getView().getBindingContext();

			if (oContext === undefined) {
				_this.oRouter.navTo("AprobacionDeSolicitudesEmbarcaciones", {}, true);
				return;
			}
			var oObject = oContext.getObject();
			var requestedModel = this.getOwnerComponent().getModel("requested");

			MessageBox.confirm("¿Desea guardar los cambios?\nDarle 'Si' cada vez que ha habido un cambio sobre los datos originales", {
				title: "Confirmación del retorno a la página anterior",
				actions: ["Si", "No"],
				onClose: function(sActionClicked) {
					var oProperty = requestedModel.getProperty("/ShipownerRequestSet");
					var _thisShipowner = "ShipownerSet(" + oObject.Request + ")";
					if (sActionClicked === "No" && requestedModel.getProperty("/ShipownerRequestSet/" + _thisShipowner) !== undefined) {
						delete oProperty[_thisShipowner];
						requestedModel.setProperty("/ShipownerRequestSet", oProperty);
					}
					_this.oRouter.navTo("AprobacionDeSolicitudesEmbarcaciones", {}, true);
				}
			});
		},

		_goBack: function(sResult, sDetail, sRuc, sRequest) {
			this.oRouter.navTo("AprobacionDeSolicitudesEmbarcaciones", {
				context: "message" + "|" + sRuc + "|" + sRequest + "|" + sResult + "|" + sDetail
			}, true);
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

		getRUC: function() {

			var oMetaModel = this.getOwnerComponent().getModel();

			var oView = this.getView();

			var _this = this;

			oView.setBusy(true);

			var RUC = oView.byId("rucArmador").getValue();

			Utilities.getSunatLogin(oMetaModel).then(function(logonData) {
				Utilities.getRUC(oView, RUC, _this.localModel, _this.localModelPath, {
					Login: logonData.results[0].Login,
					Password: logonData.results[0].Password
				}).then(function() {
					oView.setBusy(false);
				}).catch(function(oError) {
					oView.setBusy(false);
					// if (oError.id && (oError.id === "estado" || oError.id === "condicion")) {
					MessageBox.error(oError.msg ? oError.msg : "Error desconocido");
				});
				//
			}).catch(function(oError) {
				console.log(oError);
			});
		},

		onSelectChange: function() {
			var key = this.getView().byId("selectDetraction").getSelectedKey();
			var req = this.getView().getBindingContext().getObject().Request;
			this.localModel.setProperty("/ShipownerRequestSet/ShipownerSet(" + req + ")/Detraction", key);
		}
	});
}, /* bExport= */ true);