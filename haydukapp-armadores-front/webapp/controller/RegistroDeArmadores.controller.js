sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function(BaseController, MessageBox, Utilities, History, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.RegistroDeArmadores", {
		onAfterRendering: function() {
			var _this = this;
			if ($._sLoginUser === "" || !$._sLoginUser) {
				sap.m.MessageBox.confirm("Regresará al menú principal", {
					title: "Retorno al menú principal",
					actions: ["Regresar"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Regresar" || !sActionClicked) {
							sap.ui.core.UIComponent.getRouterFor(_this).navTo("MenuPrincipal");
							// window.location.reload();
						}
					}
				});
			}
		},

		onCmbValue: function(oValue) {
			return oValue;
		},

		getText: function(key) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key);
		},

		onDelete: function(oEvent) {
			var oContext = oEvent.getSource().getParent().getBindingContext("armador");
			var sPath = oContext.getPath();
			var oModel = oContext.getModel("armador");

			var pos = parseInt(sPath.lastIndexOf("/")) + 1;
			var ind = sPath.substring(pos);
			sPath = sPath.substring(0, pos);

			var oProps = oModel.getProperty(sPath);

			oProps.splice(ind, 1);

			oModel.setProperty(sPath, oProps);
		},

		onAddMail: function(oEvent) {

			var oView = this.getView();
			var oInput = oView.byId("emailArmador");
			var bValidationError = false;
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			oInput.setValueState(sap.ui.core.ValueState.None);

			if (!mailregex.test(oInput.getValue())) {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				bValidationError = true;
			}

			var oModel = oView.byId("tableCorreos").getModel("armador");
			var aEmails = oModel.getProperty("/Shipowner/ShipownerEmailSet");
			var oEmail = {
				Mail: oInput.getValue()
			};

			if (!this.validateNoRepeat(oEmail, aEmails, ["Mail"])) {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				MessageBox.alert("El email indicado ya existe");
				return;
			}

			if (!bValidationError) {
				aEmails.push(oEmail);
				oModel.setProperty("/Shipowner/ShipownerEmailSet", aEmails);
				oInput.setValue("");
				oInput.setValueState("None");

			} else {
				MessageBox.alert("Formato de email es invalido");
			}
		},

		onAddBanco: function(oEvent) {

			var oView = this.getView();
			var aInputs = [
				oView.byId("bancoArmador"),
				oView.byId("cuentaArmador"),
				oView.byId("monedaArmador"),
				oView.byId("tipoCuentaArmador")
			];
			var bValidationError = false;

			jQuery.each(aInputs, function(i, oInput) {
				if ((oInput.getValue && oInput.getValue()) || (oInput.getSelectedItem() && oInput.getSelectedItem().getText())) {
					oInput.setValueState(sap.ui.core.ValueState.None);
				} else {
					oInput.setValueState(sap.ui.core.ValueState.Error);
					bValidationError = true;
				}
			});

			var sSelectedBanco = this.byId("bancoArmador").getSelectedKey();
			var sSelectedTpCuenta = this.byId("tipoCuentaArmador").getSelectedKey();
			var sCuenta = this.byId("cuentaArmador").getValue();
			if (sSelectedBanco === "002") {
				if (sSelectedTpCuenta === "CA") {
					if (sCuenta.length !== 14) {
						MessageBox.alert("La cuenta debe tener 14 digitos");
						return;
					}
				} else if (sSelectedTpCuenta === "CC") {
					if (sCuenta.length !== 13) {
						MessageBox.alert("La cuenta debe tener 13 digitos");
						return;
					}
				}
			}

			var oModel = oView.byId("tableBanks").getModel("armador");
			var aBancos = oModel.getProperty("/Shipowner/ShipownerBanksSet");
			var nBanco = {
				BankName: aInputs[0].getSelectedItem() ? aInputs[0].getSelectedItem().getText() : "",
				BankAccount: aInputs[1].getValue(),
				Currency: aInputs[2].getSelectedItem() ? aInputs[2].getSelectedItem().getText().toUpperCase() : "",
				TpAccount: aInputs[3].getSelectedItem() ? aInputs[3].getSelectedItem().getKey().toUpperCase() : "", // REVISAR
				BankCode: aInputs[0].getSelectedItem() ? aInputs[0].getSelectedItem().getKey() : ""
			};

			if (!this.validateNoRepeat(nBanco, aBancos, ["BankAccount"])) {
				MessageBox.alert("Este numero de cuenta ya está registrado");
				aInputs[1].setValueState("Error");
				return;
			}

			if (!bValidationError) {
				aBancos.push(nBanco);
				oModel.setProperty("/Shipowner/ShipownerBanksSet", aBancos);
				oView.byId("cuentaArmador").setDescription("          ");

				jQuery.each(aInputs, function(i, oInput) {
					oInput.setSelectedKey("");
					oInput.setValueState("None");
				});
			} else {
				MessageBox.alert("Completar los campos obligatorios");
			}
		},

		onTextInput: function(oEvent) {

			var oInput = oEvent.getSource();
			var val = oInput.getValue();
			val = val.replace(/[\d\.\,\:\;\$\#\%\&\!\?\-\+\_\*\<\>\{\}\[\]\~\^\`]/g, "");
			oInput.setValue(val);
		},

		onNumericLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sVal = oInput.getValue();

			sVal = sVal.replace(/[^\d]/g, "");
			oInput.setValue(sVal);
		},

		onCellphoneChangeWithSizeLimit: function(oEvent) {
			var oInput = oEvent.getSource();
			var sVal = oInput.getValue();

			sVal = sVal.replace(/[^\d]/g, "");
			if (sVal.length > 9) {
				oInput.setValue(sVal.substring(0, 9));
			} else {
				oInput.setValue(sVal);
			}
		},

		onRucChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sRuc = oInput.getValue();

			sRuc = sRuc.replace(/[^\d]/g, "");
			oInput.setValue(sRuc);
		},

		onAddContact: function(oEvent) {

			var oView = this.getView();
			var aInputs = [
				oView.byId("nombreContacto"),
				oView.byId("telefonoContacto"),
				oView.byId("celularContacto"),
				oView.byId("emailContacto")
			];
			var bValidationError = false;

			for (var i = 0; i < aInputs.length; i++) {
				aInputs[i].setValueState("None");
			}

			if (!aInputs[0].getValue()) {
				aInputs[0].setValueState("Error");
				bValidationError = true;
			}

			if (!aInputs[3].getValue()) {
				aInputs[3].setValueState("Error");
				bValidationError = true;
			}

			if (oView.byId("celularContacto").getValue() !== "" && oView.byId("celularContacto").getValue().length !== 9) {
				//if (aInputs[2].getValue().length !== 9) {
				MessageBox.alert("El número de celular debe tener 9 dígitos");
				return;
			}

			var oModel = oView.byId("tableContacts").getModel("armador");
			var oProps = oModel.getProperty("/Shipowner/ShipownerContactPersonsSet");

			var oContact = {
				Name: aInputs[0].getValue(),
				Phone: aInputs[1].getValue(),
				CellPhone: aInputs[2].getValue(),
				Email: aInputs[3].getValue()
			};

			if (!this.validateNoRepeat(oContact, oProps, ["Name"])) {
				MessageBox.alert("Este nombre ya está registrado");
				aInputs[0].setValueState("Error");
				return;
			}

			if (!this.validateNoRepeat(oContact, oProps, ["Email"])) {
				MessageBox.alert("El contacto con este email ya está registrado");
				aInputs[3].setValueState("Error");
				return;
			}

			if (!bValidationError) {

				oProps.push(oContact);

				oModel.setProperty("/Shipowner/ShipownerContactPersonsSet", oProps);

				jQuery.each(aInputs, function(i, oInput) {
					oInput.setValue("");
					oInput.setValueState("None");
				});

			} else {
				MessageBox.alert("Completar los campos obligatorios");
			}

		},

		validateNoRepeat: function(oSource, oDestination, oParams) {

			var repeat = false;

			jQuery.each(oDestination, function() {
				var oItem = this;
				jQuery.each(oParams, function(key) {
					if (oItem[oParams[key]] === oSource[oParams[key]]) {
						repeat = true;
					}
				});
			});
			return repeat === true ? false : true;
		},

		validateDatosRUC: function() {
			var oView = this.getView();
			var aInputs = [
				oView.byId("rucArmador"),
				oView.byId("nombreArmador")
			];
			var bValidationError = false;

			jQuery.each(aInputs, function(i, oInput) {
				if (!oInput.getValue()) {
					oInput.setValueState("Error");
					bValidationError = true;
				} else {
					oInput.setValueState("None");
				}
			});

			var aSelects = [
				oView.byId("cmbToEmitDoc"),
				oView.byId("cmbDestinationMp"),
				oView.byId("cmbCurrency")
			];

			jQuery.each(aSelects, function(i, oSelect) {
				if (!oSelect.getSelectedItem() || !oSelect.getSelectedItem().getText()) {
					oSelect.setValueState("Error");
					bValidationError = true;
				} else {
					oSelect.setValueState("None");
				}
			});

			if (bValidationError) {
				MessageBox.alert("Completar los campos obligatorios");
				return false;
			}
			return true;
		},

		validateRubro: function() {
			var sRubro = this.byId("rubro").getValue();

			if (sRubro.toLowerCase().indexOf("pesca") === -1) {
				return false;
			} else {
				return true;
			}
		},

		_onAgregarEmbarcacion: function(oEvent) {
			if (!this.validateDatosRUC()) {
				return;
			}

			if (!this.validateRubro()) {
				MessageBox.alert(this.getText("incorrectRubro"));
				return;
			}

			var oBindingContext = oEvent.getSource().getBindingContext("armador");
			var abc = sap.ui.core.UIComponent.getRouterFor(this);
			abc.navTo("RegistroDeEmbarcaciones", {
				context: oBindingContext.getPath().substring(1)
			});
		},

		_onValidate: function() {
			var oView = this.getView();

			var _this = this;

			if (!this.validateDatosRUC()) {
				return;
			}

			if (!this.validateRubro()) {
				MessageBox.alert(this.getText("incorrectRubro"));
				return;
			}

			if (this.Status !== "R" && oView.byId("cellphone").getValue() !== "" && oView.byId("cellphone").getValue().length !== 9) {
				MessageBox.alert("El número de celular debe tener 9 dígitos");
				return;
			}

			var oModel = this.getOwnerComponent().getModel("armador");

			if (!oModel.getProperty("/Shipowner/ShipownerBoatsSet").length) {
				MessageBox.alert("Agregue al menos una embarcación para proceder");
				return;
			}
			if (!oModel.getProperty("/Shipowner/ShipownerEmailSet").length) {
				MessageBox.alert("Agregue al menos un correo para proceder");
				return;
			}
			// if (!oModel.getProperty("/Shipowner/ShipownerBanksSet").length) {
			// 	MessageBox.alert("Agregue al menos un banco para proceder");
			// 	return;
			// }

			var oMetaModel = this.getOwnerComponent().getModel();
			MessageBox.confirm("Desea enviar para creación?", {
				title: "Confirmación de creación",
				actions: ["Si", "No"],
				onClose: function(sActionClicked) {
					if (sActionClicked === "Si") {
						oModel.setProperty("/Shipowner/Uname", $._sLoginUser);
						var oProps = oModel.getProperty("/Shipowner");

						// delete oProps.Estado;
						// delete oProps.Condicion;

						delete oProps.Detraction;

						// 02.03.2018 - Corrección de error Hayduk
						oProps.Industry = oProps.Industry.substring(0, 50);

						oView.setBusy(true);

						oMetaModel.create("/ShipownerSet", oProps, {
							success: function(oData, response) {
								oView.setBusy(false);

								if (oData.Message !== "") {
									sap.m.MessageToast.show(oData.Message, {
										duration: 3000
									});
								}

								var oNotifInfo = {
									TypeKey: "NewRequestTypeKey",
									Request: oData.Request,
									Ruc: oData.Ruc,
									BusinessName: oData.BusinessName
								};

								var sNotifText = "Nueva solicitud " + oData.Request + " - RUC " + oData.Ruc + " - " + oData.BusinessName +
									" requiere tu aprobación";

								Utilities._getApproverUsers().then(function(aUsers) {
									Utilities._sendPushNotification(aUsers, sNotifText, _this, false, oNotifInfo);
								});
								//update icon badge counter for current user
								Utilities._sendPushNotification([$._sLoginUser], "", _this, true); 

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

								jQuery.each(oProps, function(key) {
									oProps[key] = jQuery.isArray(this) ? [] : "";
								});
								oModel.setProperty("/Shipowner", oProps);
								//oView.byId("cmbDestinationMp").setValue("");
								oView.byId("cmbCurrency").setSelectedKey("");
								oView.byId("cmbToEmitDoc").setSelectedKey("");

								_this.onNavBack("salir", _this.Status === "R" ? "rejected" : "");

								//}
							},
							error: function(oError) {
								oView.setBusy(false);
								if (oError.message && oError.message !== "") {
									MessageBox.error(oError.message);
								}
								console.log("RegistroDeArmadores - ERROR");
								console.log(oError);
							}
						});
					}
				}
			});

		},

		onInit: function() {
			//			var oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("RegistroDeArmadores").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			//			oView.setBusyIndicatorDelay(1000);

		},

		handleRouteMatched: function(oEvent) {
			var oModel;
			var _this = this;
			var oParams = {};
			var oView = this.getView();
			var oDataContext = oEvent.mParameters.data.context;
			this.oView = oView;

			oModel = this.getOwnerComponent().getModel("armador");
			this.localModel = oModel;

			if (oDataContext === "return") {
				return;
			} else {
				oView.bindObject({
					path: "/Shipowner",
					model: "armador"
				});
			}

			if (oDataContext) {
				this.sContext = oDataContext;
				var oPath;
				if (this.sContext) {

					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					var pos = oPath.path.indexOf("Ruc=");
					var Ruc = oPath.path.substr(pos + 5, 11);
					pos = oPath.path.indexOf("Request=");
					var Request = oPath.path.substr(pos + 9, 10);
					pos = oPath.path.indexOf("Status=");
					this.Status = oPath.path.substr(pos + 8, 1);

					oView.bindObject(oPath);

					var oContext = oView.getBindingContext();
					var metaModel = this.getOwnerComponent().getModel();
					var oControls = oView.getControlsByFieldGroupId("mainGroup");

					//id="btnValidate" text="{=${Status}==='RECHAZADO' ? 'Reenviar' : 'Solicitar la validación' 
					if (this.Status === "R") {
						oView.byId("btnValidate").setText("Reenviar");
						oView.byId("registroDeArmadoresPage").setTitle("Reenvío");
					} else {
						oView.byId("btnValidate").setText("Solicitar la validación");
						oView.byId("registroDeArmadoresPage").setTitle("Registro de Armadores");
					}

					oModel.setProperty("/Shipowner/Ruc", Ruc);
					oModel.setProperty("/Shipowner/Request", Request);
					oModel.setProperty("/Shipowner/Origin", "T");
					oModel.setProperty("/Shipowner/Status", "RECHAZADO");

					if (oContext === undefined) {
						oView.setBusy(true);
						oView.getModel().attachRequestCompleted(function(oEvent) {
							if (oEvent.getParameters().url === _this.sContext) {
								_this.copyProps(oView.getBindingContext(), oControls, oModel);
								oView.setBusy(false);
							}
						});
					} else {
						_this.copyProps(oContext, oControls, oModel);
					}

					_this.readMetaModel(metaModel, oPath.path, oModel, "/ShipownerEmailSet");
					_this.readMetaModel(metaModel, oPath.path, oModel, "/ShipownerBanksSet");
					_this.readMetaModel(metaModel, oPath.path, oModel, "/ShipownerContactPersonsSet");
					_this.readMetaModel(metaModel, oPath.path, oModel, "/ShipownerBoatsSet");

					_this.changeVisibleState(false);
				}
			} else {
				_this.changeVisibleState(true);

				oView.byId("btnValidate").setText("Solicitar la validación");
				oView.byId("registroDeArmadoresPage").setTitle("Registro de Armadores");
			}
		},

		readMetaModel: function(oMetaModel, oMetaPath, oModel, sPath) {

			oMetaModel.read(oMetaPath + sPath, {
				success: function(oData, response) {

					jQuery.each(oData.results, function(key, value) {
						delete this.__metadata;
					});

					oModel.setProperty("/Shipowner" + sPath, oData.results);
				},
				error: function(response) {
					console.log(response);
				}
			});
		},
		copyProps: function(oContext, oControls, oModel) {
			var oObject = oContext.getObject();

			oModel.setProperty("/Shipowner/DestinationMp", oObject.DestinationMp);
			oModel.setProperty("/Shipowner/ToEmitDoc", oObject.ToEmitDoc);
			oModel.setProperty("/Shipowner/Currency", oObject.Currency);
			oModel.setProperty("/Shipowner/Comprobante", oObject.Comprobante);

			if (oObject.Currency === "DOLAR") {
				oModel.setProperty("/Shipowner/Currency", "DOLARES");
			}

			jQuery.each(oControls, function() {
				var sName = this.getBindingPath("value");
				if (sName !== undefined) {
					oModel.setProperty("/Shipowner/" + sName, oObject[sName]);
				} else {
					// if (this.mBindingInfos && this.mBindingInfos.items && this.mBindingInfos.items.path) {
					// 	sName = this.mBindingInfos.items.path.substr(1);
					// 	oModel.setProperty("/Shipowner/" + sName, oObject[sName]);
					// }
				}
			});
		},

		changeVisibleState: function(bState) {
			this.byId("cmbDestinationMp").setEnabled(bState);
			this.byId("rucArmador").setEnabled(bState);
			this.byId("btnSunat").setEnabled(bState);
			this.byId("nombreArmador").setEnabled(bState);
			this.byId("direccion").setEnabled(bState);
			this.byId("padron").setEnabled(bState);
			this.byId("distrito").setEnabled(bState);
			this.byId("poblacion").setEnabled(bState);
			this.byId("region").setEnabled(bState);
			this.byId("rubro").setEnabled(bState);
			this.byId("cmbToEmitDoc").setEnabled(bState);
			this.byId("telefono").setEnabled(bState);
			this.byId("cellphone").setEnabled(bState);
			this.byId("cmbCurrency").setEnabled(bState);
		},

		onNavBack: function(oParam, oContext) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			var oModel = this.getOwnerComponent().getModel("armador");

			var oProps = oModel.getProperty("/Shipowner");

			var empty = true;

			var _this = this;

			jQuery.each(oProps, function(key, value) {
				if (jQuery.isArray(this)) {
					if (oProps[key].length) {
						empty = false;
					}
				} else {
					if (value !== "") {
						empty = false;
					}
				}
			});

			if (!empty && oParam !== "salir") {
				MessageBox.confirm("Los datos ingresados no se guardarán, ¿aún así desea proceder?", {
					title: "Confirmación del retorno al menú principal",
					actions: ["Si", "No"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Si") {

							_this.clearAllData(oModel);
							if (_this.Status === "R") {
								_this.oRouter.navTo("Log", {}, true);
							} else {
								_this.oRouter.navTo("BuscarArmador", {}, true);
							}
						}
					}
				});
			} else {

				this.oRouter.navTo("BuscarArmador", {
					context: oContext
				}, true);
				this.clearAllData(oModel);
			}
		},

		clearAllData: function(oModel) {

			var oView = this.getView();
			var oProps = oModel.getProperty("/Shipowner");
			jQuery.each(oProps, function(key) {
				oProps[key] = jQuery.isArray(this) ? [] : "";
			});

			oModel.setProperty("/Shipowner", oProps);

			oView.unbindObject();

			oView.byId("cmbDestinationMp").setValueState("None");
			oView.byId("cmbToEmitDoc").setValueState("None");
			oView.byId("rucArmador").setValueState("None");
			oView.byId("nombreContacto").setValueState("None");
			oView.byId("emailContacto").setValueState("None");
			oView.byId("emailArmador").setValueState("None");
			oView.byId("bancoArmador").setValue("");
			oView.byId("tipoCuentaArmador").setValue("");
			oView.byId("cuentaArmador").setValue("");
			oView.byId("cuentaArmador").setDescription("          ");
			oView.byId("monedaArmador").setValue("");
		},

		getRUC: function() {
			this._error = false;

			var _this = this;
			var oView = this.getView();
			var rucInput = oView.byId("rucArmador");
			var oMetaModel = this.getOwnerComponent().getModel();
			var RUC = rucInput.getValue();

			if (RUC.length !== 11) {
				rucInput.setValueState("Error");
				return;
			} else {
				rucInput.setValueState("None");
			}

			if (RUC.length === 11) {
				new Promise(function(resolve) {
					var sPath = "/ShipownerSet(Ruc='" + RUC + "',Status='',Origin='C',Request='')";
					oMetaModel.read(sPath, {
						success: function(oData) {
							if (oData.Ruc === RUC && oData.Message && oData.Message !== "") {
								resolve("RUC: " + RUC + ". " + oData.Message);
							} else {
								resolve();
							}
						},
						error: function() {
							resolve();
						}
					});
				}).then(function(sMessage) {
					if (sMessage && sMessage !== "") {
						MessageBox.error(sMessage + "\nBuscar el RUC en la pantalla principal.", {
							title: "Error",
							actions: ["Regresar"],
							onClose: function(sActionClicked) {
								if (sActionClicked === "Regresar" || sActionClicked === null) {
									_this.clearAllData(_this.getOwnerComponent().getModel("armador"));
									_this.oRouter.navTo("BuscarArmador", {}, true);
								}
							}
						});
					} else {
						oView.setBusy(true);

						Utilities.getSunatLogin(oMetaModel).then(function(logonData) {
							Utilities.getRUC(oView, RUC, _this.localModel, "/Shipowner", {
								Login: logonData.results[0].Login,
								Password: logonData.results[0].Password
							}).then(function() {
								oView.setBusy(false);
							}).catch(function(oError) {
								oView.setBusy(false);
								rucInput.setValueState("Error");

								if (oError.id === "condicion" || oError.id === "estado" || oError.id === "pesca") {
									MessageBox.confirm(oError.msg, {
										title: "Confirmación de retorno a la página anterior",
										actions: ["Regresar"],
										onClose: function(sActionClicked) {
											if (sActionClicked === "Regresar" || sActionClicked === null) {

												var oModel = _this.getOwnerComponent().getModel("armador");
												_this.clearAllData(oModel);
												if (_this.Status === "R") {
													_this.oRouter.navTo("Log", {}, true);
												} else {
													_this.oRouter.navTo("BuscarArmador", {}, true);
												}
											}
										}
									});
								} else {
									MessageBox.error(oError.msg);
								}
							});
							//
						}).catch(function(oError) {
							console.log(oError);
						});
					}
				});
			}
		},

		onBankChange: function() {
			// Validar tamaño
			var sSelectedBanco = this.byId("bancoArmador").getSelectedKey();
			var sSelectedTpCuenta = this.byId("tipoCuentaArmador").getSelectedKey();
			var sCuentaInput = this.byId("cuentaArmador");
			var actualTam = sCuentaInput.getMaxLength();
			var tam = 18;

			if (sSelectedBanco === "002") {
				if (sSelectedTpCuenta === "CA") {
					tam = 14;
				} else if (sSelectedTpCuenta === "CC") {
					tam = 13;
				}
			}

			if (actualTam !== tam) {
				var sNewVal = sCuentaInput.getValue().substring(0, tam);
				sCuentaInput.setValue(sNewVal);
				sCuentaInput.setDescription(tam + " digitos");
				sCuentaInput.setMaxLength(tam);

				MessageToast.show("Longitud del N°. de cuenta es " + tam);
			}
		}
	});
}, /* bExport= */ true);