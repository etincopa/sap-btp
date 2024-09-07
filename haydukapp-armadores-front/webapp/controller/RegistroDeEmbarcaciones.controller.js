sap.ui.define(["sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast"
	], function(BaseController, MessageBox, Utilities, History, MessageToast) {
		"use strict";

		return BaseController.extend("com.sap.build.standard.proyectoScp.controller.RegistroDeEmbarcaciones", {
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
					oModel,
					oView = this.getView(),
					oTable = this.byId("tblBanks"),
					oButon = this.byId("btnValidar"),
					oDestination = this.byId("frmDestination"),
					oMetaModel,
					oShipTable = this.byId("tblBoats");

				function updateVisibility(bState, Status) {
					oTable.setVisible(Status === "R" ? false : bState);
					oButon.setVisible(bState);
					oDestination.setVisible(bState);
					oShipTable.getColumns()[3].setVisible(bState);
				}

				function copyMainAttributes(oContext) {
					var oDetail = oContext.getObject();
					oModel.setProperty("/Shipowner/Ruc", oDetail.Ruc);
					oModel.setProperty("/Shipowner/BusinessName", oDetail.BusinessName);
					oModel.setProperty("/Shipowner/Request", oDetail.Request);
				}

				oView.byId("tabEmbarc1").setVisible(false); // TODO validar

				if (oEvent.mParameters.data.context) {
					this.sContext = oEvent.mParameters.data.context;
					var oPath;
					if (this.sContext) {
						oPath = {
							path: "/" + this.sContext,
							parameters: oParams
						};

						var Origin, Status;
						var _this = this;

						oMetaModel = this.getOwnerComponent().getModel();
						oModel = this.getOwnerComponent().getModel("armador");

						oView.bindObject({
							path: "/Shipowner",
							model: "armador"
						});

						if (oPath.path.indexOf("(") > 0) {
							var pos = oPath.path.indexOf("Status=");
							Status = oPath.path.substr(pos + 8, 1);
							updateVisibility(true, Status);
							Origin = "S";
							this.clearAllData();
							oView.bindObject(oPath);
							oModel.setProperty("/Shipowner/Origin", Origin);
							oModel.setProperty("/Shipowner/Status", Status);
							var oContext = oView.getBindingContext();
							if (oContext) {
								copyMainAttributes(oContext);
							} else {
								oView.setBusy(true);
								oView.getModel().attachRequestCompleted(function(oEvent) {
									if (oEvent.getParameters().url === _this.sContext) {
										copyMainAttributes(oView.getBindingContext());
										oView.setBusy(false);
									}
								});

							}
						} else {
							Status = oModel.getProperty("/Shipowner/Status", "armador").substr(0, 1);
							updateVisibility(false, Status);
							Origin = "T";

						}

						this.Origin = Origin;
						this.Status = Status;

						if (Origin === "S") {
							oView.byId("tabEmbarc1").setVisible(true); // TODO validar
						} else {
							oView.byId("tabEmbarc1").setVisible(false); // TODO validar
						}

						if (Status === "R") {
							if (Origin === "S") {
								oMetaModel.read(oPath.path + "/ShipownerBoatsSet", {
									success: function(oData, response) {
										oModel.setProperty("/Shipowner/ShipownerBoatsSet", oData.results);
									},
									error: function(response) {
										console.log(response);
									}
								});
							}
						}
					}
				}

			},
			onAddEmbarcacion: function(oEvent) {
				var oView = this.getView();
				var aInputs = [
					oView.byId("embMatricula"),
					oView.byId("embEmbarcacion"),
					oView.byId("embCapacidad"),
					oView.byId("embDestination")
				];
				var bValidationError = false;

				oView.byId("embMatricula").setValue(oView.byId("embMatricula").getValue().toUpperCase());

				for (var i = 0; i < aInputs.length; i++) {
					aInputs[i].setValueState("None");
				}

				if (!aInputs[0].getValue()) {
					aInputs[0].setValueState("Error");
					bValidationError = true;
				}

				if (!aInputs[1].getValue()) {
					aInputs[1].setValueState("Error");
					bValidationError = true;
				}

				if (!aInputs[2].getValue()) {
					aInputs[2].setValueState("Error");
					bValidationError = true;
				} else {
					if ((aInputs[2].getValue().match(/\./g) || []).length > 1) {
						aInputs[2].setValueState("Error");
						bValidationError = true;
						MessageBox.alert("Capacidad con formato incorrecto");
						return;
					}
				}

				if (this.byId("tblBoats").getColumns()[3].getVisible()) {
					if (!aInputs[3].getSelectedItem() || aInputs[3].getSelectedItem().getText() === "") {
						aInputs[3].setValueState("Error");
						bValidationError = true;
					}
				}

				var oModel = this.byId("tblBoats").getModel("armador");
				var aBarcos = oModel.getProperty("/Shipowner/ShipownerBoatsSet");
				var Ruc = oModel.getProperty("/Shipowner/Ruc");
				var nBarco = {
					Matricula: aInputs[0].getValue(),
					Name: aInputs[1].getValue(),
					Capacity: aInputs[2].getValue(),
					Destination: aInputs[3].getSelectedItem() ? aInputs[3].getSelectedItem().getText() : ""
						//					Destination: aInputs[3].getValue()
				};

				if (!this.validateNoRepeat(nBarco, aBarcos, ["Matricula"])) {
					MessageBox.alert("El barco con este numero de matricula ya está registrado");
					aInputs[0].setValueState("Error");
					return;
				}

				var oInput = this.byId("embMatricula");
				var sValue = oInput.getValue();
				var regexResult = sValue.match(/[a-zA-Z]+-\d+-[a-zA-Z]+/);

				if (regexResult && regexResult[0] === sValue && (sValue.match(/-/g) || []).length <= 2) {
					oInput.setValueState(sap.ui.core.ValueState.Success);
				} else {
					oInput.setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("Formato de Cód. Matrícula inválido:\nAA-00000-BB");
					return;
				}

				function updateTable() {
					aBarcos.push(nBarco);
					oModel.setProperty("/Shipowner/ShipownerBoatsSet", aBarcos);

					jQuery.each(aInputs, function(i, oInput) {
						oInput.setValue("");
						oInput.setValueState("None");
					});
					aInputs[3].setSelectedKey("");
				}

				if (!bValidationError) {

					var oMetaModel = this.getOwnerComponent().getModel();

					if (this.Origin === "S") {

						if (nBarco.Destination.length < 3) {
							aInputs[3].setValueState("Error");
							return;
						}

						oMetaModel.read("/ValidateAddBoatsSet(Ruc='" + Ruc + "',Matricula='" + sValue + "')", {
							success: function(oData) {
								if (oData.IDMessage === "0") {
									updateTable();
								} else {
									MessageBox.alert(oData.Message);
								}
							},
							error: function(oError) {
								MessageBox.alert(oError.message ? oError.message : "Error desconocido");
							}
						});
					} else {
						updateTable();
					}

				} else {
					MessageBox.alert("Completar los campos obligatorios");
				}

			},

			validateNoRepeat: function(oSource, oDestination, oParams) {
				var repeat = false;

				jQuery.each(oDestination, function() {
					var oItem = this;
					jQuery.each(oParams, function(key) {
						if (oItem[oParams[key]].toUpperCase() === oSource[oParams[key]].toUpperCase()) {
							repeat = true;
						}
					});
				});

				return repeat === true ? false : true;
			},

			onDelete: function(oEvent) {
				var sPath = oEvent.getSource().getParent().getBindingContext("armador").getPath();
				var oModel = this.getView().getModel("armador");
				var pos = parseInt(sPath.lastIndexOf("/")) + 1;
				var ind = sPath.substring(pos);
				sPath = sPath.substring(0, pos);
				var oProps = oModel.getProperty(sPath);
				oProps.splice(ind, 1);
				oModel.setProperty(sPath, oProps);
			},

			clearAllData: function() {

				var oView = this.getView();

				var oModel = oView.getModel("armador");

				var oProps = oModel.getProperty("/Shipowner");
				jQuery.each(oProps, function(key) {
					oProps[key] = jQuery.isArray(this) ? [] : "";
				});

				oView.byId("embMatricula").setValue("");
				oView.byId("embEmbarcacion").setValue("");
				oView.byId("embCapacidad").setValue("");
				oView.byId("embDestination").setSelectedKey("");

				oModel.setProperty("/Shipowner", oProps);
			},

			onNavBack: function(oParam, oContext) {
				// var oHistory = History.getInstance(),
				//     sPreviousHash = oHistory.getPreviousHash();

				var _this = this;

				if (oParam === "salir") {
					_this.clearAllData();
					_this.oRouter.navTo("BuscarArmador", {
						context: oContext
					}, true);
					return;
				}

				function doClose(__this, bMenu) {
					if (bMenu) {
						_this.clearAllData();
						if (__this.Status === "R") {
							__this.oRouter.navTo("Log", {}, true);
						} else {
							__this.oRouter.navTo("BuscarArmador", {
								context: oContext
							}, true);
						}
					} else {
						__this.oRouter.navTo("RegistroDeArmadores", {
							context: "return"
						}, true);
					}
				}

				var oModel = this.byId("tblBoats").getModel("armador");

				if (this.byId("btnValidar").getVisible() && oModel.getProperty("/Shipowner/ShipownerBoatsSet").length) {
					MessageBox.confirm("Los datos ingresados no se guardarán, ¿aun así desea proceder?", {
						title: "Confirmación del retorno a la página anterior",
						actions: ["Si", "No"],
						onClose: function(sActionClicked) {
							if (sActionClicked === "Si" || sActionClicked === null) {
								doClose(_this, true);
							}
						}
					});
				} else {
					doClose(_this, _this.Origin === "S" ? true : false);
				}
			},

			onValidarPress: function() {
				var _this = this;
				var oView = this.getView();
				var oModel = this.byId("tblBoats").getModel("armador");
				var aBarcos = oModel.getProperty("/Shipowner/ShipownerBoatsSet");
				var oMetaModel = this.getOwnerComponent().getModel();

				MessageBox.confirm("Desea enviar para creación?", {
					title: "Confirmación de creación",
					actions: ["Si", "No"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Si") {
							if (aBarcos.length < 1) {
								MessageBox.alert("Solicitar la creación de al menos de una embarcación");
							} else {
								var oProps = oModel.getProperty("/Shipowner");
								var oContext = oView.getBindingContext();
								oProps.Ruc = oMetaModel.getProperty("Ruc", oContext);
								oProps.Status = oMetaModel.getProperty("Status", oContext);
								oProps.Request = oMetaModel.getProperty("Request", oContext);
								oProps.Origin = "S";
								oModel.setProperty("/Shipowner/Uname", $._sLoginUser);
								oView.setBusy(true);
								oMetaModel.create("/ShipownerSet", oProps, {
									success: function(oData) {
										var sAction = "";
										oModel.setProperty("/Shipowner/ShipownerBoatsSet", []);

										oView.setBusy(false);

										var oNotifInfo = {
											TypeKey: "NewRequestTypeKey",
											Request: oData.Request,
											Ruc: oData.Ruc,
											BusinessName: oData.BusinessName
										};

										if (oData.Message.indexOf("[NR]") !== -1) { // No Regresar
											sAction = "OK";
											oData.Message = oData.Message.replace("[NR]", "");
										} else {
											sAction = "Regresar";

											Utilities._getUsersEmails().then(function(aEmails) {
												var nResults = aEmails.length;
												oData.Status = "PENDIENTE";

												function sendEmails(index) {
													Utilities._sendEmail(oMetaModel, oData, aEmails[index]).then(function(response) {
														console.log(response);
														index = index + 1;
														if (nResults > index) {
															sendEmails(index);
														}
													}).catch(function(oError) {
														console.log(oError);
														//MessageToast.show("No se pudo enviar notificación por email");
													});
												}
												sendEmails(0);
											});

											var sNotifText = "Nueva solicitud " + oData.Request + " - RUC " + oData.Ruc + " - " + oData.BusinessName +
												" requiere tu aprobación";
												
											Utilities._getApproverUsers().then(function(aUsers) {
												Utilities._sendPushNotification(aUsers, sNotifText, _this, false, oNotifInfo);
											});
											//update icon badge counter for current user
											Utilities._sendPushNotification([$._sLoginUser], "", _this, true); 
										}

										MessageBox.confirm(oData.Message, {
											title: "Mensaje",
											actions: [sAction],
											onClose: function(sActionClicked2) {
												if (sActionClicked2 === sAction || !sActionClicked2) {
													if (sAction === "Regresar") {
														_this.onNavBack("salir", _this.Status === "R" ? "rejected" : "");
													}
												}
											}
										});

										//_this.onNavBack("salir", _this.Status === "R" ? "rejected" : "");
									},
									error: function(oError) {
										oView.setBusy(false);
										if (oError.message && oError.message !== "") {
											MessageBox.error(oError.message);
										}
									}
								});
							}
						}
					}
				});
			},

			onInit: function() {
				this.mBindingOptions = {};
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("RegistroDeEmbarcaciones").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			},

			_matriculaValidator: function(oEvent) {
				var oInput = oEvent.getSource();
				var sValue = oInput.getValue();
				var regexResult = sValue.match(/[a-zA-Z]+-\d+-[a-zA-Z]+/);

				if (regexResult && regexResult[0] === sValue && (sValue.match(/-/g) || []).length <= 2) {
					oInput.setValueState(sap.ui.core.ValueState.Success);
				} else {
					oInput.setValueState(sap.ui.core.ValueState.Error);
				}
			},

			numericLiveChange: function(oEvent) {
				var _oInput = oEvent.getSource();
				var val = _oInput.getValue();
				val = val.replace(/[^\d]/g, "");
				_oInput.setValue(val);
			},

			_validateDecimalInput: function(oEvent) {
				Utilities._validateDecimalInput(oEvent);

			},

			_decimalLiveChange: function(oEvent) {
				Utilities._decimalLiveChange(oEvent);
			}
		});
	},
	/* bExport= */
	true);