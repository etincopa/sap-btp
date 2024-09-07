sap.ui.define([
	"./utilities",
	"sap/m/MessageToast"
], function (Utilities, MessageToast) {
	"use strict";

	return {
		hideBusyIndicator: function () {
			sap.ui.core.BusyIndicator.hide();
		},

		showBusyIndicator: function (iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					jQuery.sap.clearDelayedCall(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function () {
					this.hideBusyIndicator();
				});
			}
		},

		getUserPermissions: function () {
			var _this = this;

			return new Promise(function (resolve, reject) {
				if (!$._sLoginUser || $._sLoginUser === "") {
					sap.ui.core.BusyIndicator.show(0);
					_this._getUser().then(function (sUser) {
						$._sLoginUser = sUser;
						return sUser;
					}).then(_this._getGroup).then(function (sGroup) {
						$._sGroup = sGroup;
						sap.ui.core.BusyIndicator.hide();
						resolve(sGroup);
					}).catch(function (oError) {
						sap.ui.core.BusyIndicator.hide();
						reject(oError.message);
					});
				} else {
					resolve($._sGroup);
				}
			});
		},

		_getUser: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					url: "/userapi/attributes?multiValuesAsArrays=true",
					type: "GET",
					success: function (oSuccess) {
						resolve(oSuccess.name.toUpperCase());
					},
					error: function (oError) {
						reject(oError.responseText);
					}
				});
			});
		},

		_getGroup: function (sUser) {
			return new Promise(function (resolve, reject) {
				if (!sUser || sUser === "") {
					reject(new Error("No se pudo identificar usuario"));
				} else {
					$.ajax({
						url: "/userapi/attributes?multiValuesAsArrays=true",
						type: "GET",
						success: function (oSuccess) {
							var sGroup = "";

							if (oSuccess.groupx.some) {
								oSuccess.groupx.some(function (x) {
									if (x.toUpperCase() === "ARMADORES_SOLICITANTE") {
										sGroup = "Armadores_Solicitante";
										return true;
									}
								});
								oSuccess.groupx.some(function (x) {
									if (x.toUpperCase() === "ARMADORES_APROBADOR") {
										sGroup = "Armadores_Aprobador";
										return true;
									}
								});
							} else {
								if (oSuccess.groupx.toUpperCase() === "ARMADORES_SOLICITANTE") {
									sGroup = "Armadores_Solicitante";
								} else if (oSuccess.groupx.toUpperCase() === "ARMADORES_APROBADOR") {
									sGroup = "Armadores_Aprobador";
								}
							}

							if (sGroup !== "") {
								resolve(sGroup);
							} else {
								reject(new Error("Usuario sin grupo asignado. No tiene acceso a la aplicacion."));
							}
						},
						error: function (oError) {
							reject(new Error(oError.status + " - " + oError.statusText + "\n" + oError.responseText));
						}
					});
				}
			});
		},

		_formFragments: {},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(sFragmentName, "com.sap.build.standard.proyectoScp.view." + sFragmentName);
			var myFragment = (this._formFragments[sFragmentName] = oFormFragment);
			return myFragment;
		},

		showNoTilesPage: function (oView, sPage) {
			var oPage = oView.byId(sPage);

			if (oPage && oView) {
				oPage.removeAllContent();
				oPage.insertContent(this._getFormFragment("NoTilesPage"));
			}
		},

		doUpdate: function (oTable, oModel, oParams) {

			return new Promise(function (_resolve, _reject) {

				var sDocumentNr, sDocumentType, sPosItem;

				var oSelectedItems = oTable.getSelectedItems();
				var itemsLength = oSelectedItems.length;

				if (!itemsLength) {
					_reject("selec1Doc");
				}

				function procesarItem(iNum) {

					return new Promise(function (resolve, reject) {
						var oItem = oSelectedItems[iNum];
						var oSelectedObject = oItem.getBindingContext().getObject();
						var sPath = oItem.getBindingContext().getPath();
						var msg = oParams.Option === "L" ? "Liberación" : "Rechazo";

						sDocumentNr = oSelectedObject.DocumentNr;
						sDocumentType = oSelectedObject.DocumentType;
						sPosItem = oSelectedObject.PosItem;

						switch (sDocumentType) {
						case "OC":
							sPath = sPath.replace("OC", "PO");
							break;
						case "SP":
							sPath = sPath.replace("SP", "PR");
							break;
						default:
							console.log("Tipo de documento " + sDocumentType + " no aceptado");
							break;
						}

						return oModel.update(sPath, {
							Option: oParams.Option,
							PosItem: sPosItem,
							ModeRel: oParams.ModeRel
						}, {
							success: function (oData, response) {
								console.log(msg + " " + sDocumentNr + " se realizó con éxito");
								resolve(iNum);
							},
							error: function (oError) {
								oError = "Error en " + msg.toLowerCase() + " del documento " + sDocumentNr;
								console.log(oError);
								reject(oError);
							}
						});
					});
				}

				function nextItem(iNum) {
					iNum++;
					if (iNum < itemsLength) {
						return procesarItem(iNum).then(nextItem);
					} else {
						return oParams.Option === "L" ? "liberacionCorrecta" : "rechazoCorrecto";
					}
				}
				return nextItem(-1)
					.then(function (result) {
						oModel.refresh();
						_resolve(result);
					})
					.catch(function (err) {
						_reject(err);
					});
			});
		},

		_getPushNotificationPromise: function (sUser, sNotifText, oContext, bIsForRequest, oBusinessData) {
			var sIsForRequest;

			if (bIsForRequest) {
				sIsForRequest = "Y";
			} else {
				sIsForRequest = "N";
			}

			var oNotifModel = oContext.getView().getModel("notifModel");
			var sUrl = "/saperp/sap/opu/odata/sap/ZSCP_HAYDUK_SRV/SCPNotificationSet(User='" + sUser +
				"',IsForRequest='" + sIsForRequest + "')";

			return new Promise(function (resolve, reject) {
				$.ajax({
					url: sUrl,
					type: "GET",
					dataType: "json",
					contentType: "application/json",
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}).then(function (oResponse) {

				var oNavParams = [];

				if (sNotifText.length && sNotifText.indexOf("aprobada") < 0) {
					oNavParams = [{
						"Key": "Ruc",
						"Value": oBusinessData.Ruc
					}, {
						"Key": "RequestNr",
						"Value": oBusinessData.Request
					}, {
						"Key": "Type",
						"Value": bIsForRequest ? "R" : "A"
					}];
				}

				var sData = {
					App: "SOR",
					Count: oResponse.d.Count,
					DetailText: sNotifText,
					GeneralText: sNotifText,
					IsSapUser: "",
					User: sUser,
					Params: oNavParams
				};

				return new Promise(function (resolve, reject) {
					oNotifModel.create("/SCPNotificationSet", sData, {
						success: function (oSuccess) {
							console.log("good");
							resolve();
						},
						error: function (oError) {
							console.log("bad");
							reject();
						}
					});
				});
			});
		},

		_sendPushNotification: function (aUsers, sNotifText, oContext, bIsForRequest, oBusinessData) {
			// var aPromises = [];
			var me = this;
			var nItems = aUsers.length;

			function resolvePromise(index, _this) {
				var sUser = aUsers[index];

				return _this._getPushNotificationPromise(sUser, sNotifText, oContext, bIsForRequest, oBusinessData);
			}

			function processAllPromises(index) {
				resolvePromise(index, me).then(function (oResult) {
					index = index + 1;
					if (index < nItems) {
						return processAllPromises(index);
					} else {
						console.log(oResult);
					}
				}).catch(function (oError) {
					console.log(oError);
				});
			}

			processAllPromises(0);
		},

		_sendEmail: function (oMetaModel, oData, Email) {

			return new Promise(function (resolve, reject) {

				var oProps = {};
				oProps.Ruc = oData.Ruc;
				oProps.Request = oData.Request;
				oProps.Status = oData.Status;
				oProps.BusinessName = oData.BusinessName;
				oProps.Email = Email;

				oMetaModel.create("/SendEmailsSet", oProps, {
					success: function (oResult) {
						if (oResult.Message.indexOf("ERROR") < 0) {
							//resolve("Email a : "+oResult.Email +" enviado");
							resolve(oResult.Message);
						} else {
							reject(oResult.Message);
						}

					},
					error: function (oError) {
						reject(oError);
					}
				});
			});

		},

		_getUsersEmails: function (oName) {
			return new Promise(function (resolve, reject) {
				var sGroup;

				if (oName === undefined) {
					sGroup = "ARMADORES_APROBADOR";
				} else {
					sGroup = "ARMADORES_SOLICITANTE";
				}

				$.ajax({
					url: "/saperp/sap/opu/odata/sap/ZSCP_HAYDUK_SRV/GroupUserSet?$filter=GroupName eq '" + sGroup + "'",
					type: "GET",
					dataType: "json",
					contentType: "application/json",
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}).then(function (oResponse) {
				var aEmails = [];

				for (var i in oResponse.d.results) {
					if (oName !== undefined && oName !== oResponse.d.results[i].UserName) {
						continue;
					}
					aEmails.push(oResponse.d.results[i].Email);
				}
				return aEmails;
			}).catch(function (oError) {
				console.log(oError);
				return [];
			});
		},

		_getApproverUsers: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					url: "/saperp/sap/opu/odata/sap/ZSCP_HAYDUK_SRV/GroupUserSet?$filter=GroupName eq 'ARMADORES_APROBADOR'",
					type: "GET",
					dataType: "json",
					contentType: "application/json",
					success: function (oResponse) {
						resolve(oResponse);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}).then(function (oResponse) {
				var aApprovers = [];

				for (var i in oResponse.d.results) {
					aApprovers.push(oResponse.d.results[i].UserName);
				}

				return aApprovers;
			}).catch(function (oError) {
				console.log(oError);
				return [];
			});
		},

		parseMessage: function (sInputMessage) {
			var count = 0;
			var tokens = sInputMessage.split("\n");
			var errors = false;
			var sOKMessage = "";
			var sErrorMessage = "";
			var sLastValue = "";
			var sFinalMessage = "";

			for (var i in tokens) {
				if (count % 2 === 0) {
					if (tokens[i] === "E") {
						errors = true;
						sLastValue = "E";
					} else if (tokens[i] === "") {
						sLastValue = ""; // Mal
					} else {
						sLastValue = "OK";
					}
				} else {
					if (sLastValue === "E") {
						sErrorMessage = sErrorMessage + tokens[i] + "\n";
					} else {
						sOKMessage = sOKMessage + tokens[i] + "\n";
					}
				}
				count = count + 1;
			}
			if (sErrorMessage !== "") {
				sFinalMessage = "Información:\n" + sErrorMessage + "\n";
			}
			if (sOKMessage !== "") {
				sFinalMessage = sFinalMessage + "\nOK:\n" + sOKMessage;
			}
			if (errors) {
				return [sFinalMessage, "Error"];
			}
			return [sFinalMessage, "Success"];
		},

		toJSON: function (texto) {
			var retorno = "";
			for (var i = 1; i < texto.length; i++) {
				if ((texto.charAt(i - 1) === "|") && (texto.charAt(i) !== "<")) {
					var a = "";
					while ((texto.charAt(i) !== "=") && (i < texto.length)) {
						a = a + texto.charAt(i);
						i++;
					}
					i++;
					var b = "";
					while ((texto.charAt(i) !== "|") && (i < texto.length)) {
						if (texto.charAt(i + 1) === "<") {
							break;
						}
						b = b + texto.charAt(i);
						i++;
					}
					retorno = retorno + '"' + a + '":"' + b + '",';
				}
			}
			var k = retorno;
			retorno = "";
			for (var j = 0; j < (k.length - 1); j++) {
				retorno = retorno + k.charAt(j);
			}
			var objeto = JSON.parse("{" + retorno + "}");
			return objeto;
		},

		getSunatLogin: function (oMetaModel) {

			return new Promise(function (resolve, reject) {

				oMetaModel.read("/LicenceSunatSet", {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},

		getRUC: function (oView, RUC, oModel, sContextPath, logonData) {
			var me = this;

			var jsRequest =
				"<soapenv:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ruc='http://ws.insite.pe/sunat/ruc.php?wsd'>" +
				"<soapenv:Header/>" +
				"<soapenv:Body>" +
				"<ruc:consultaRUC soapenv:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'>" +
				"<ruc xsi:type='xsd:String'>" + RUC + "</ruc>" +
				"<username xsi:type='xsd:String'>" + logonData.Login + "</username>" +
				"<hash xsi:type='xsd:String'>" + logonData.Password + "</hash>" +
				"<tracking xsi:type='xsd:String'></tracking>" +
				"</ruc:consultaRUC>" +
				"</soapenv:Body>" +
				"</soapenv:Envelope>";

			var url = "/sunat/sunat/ruc.php";
			var req = new XMLHttpRequest();

			return new Promise(function (resolve, reject) {

				req.open("POST", url, true);
				req.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
				req.send(jsRequest);

				req.onreadystatechange = function () {

					console.log("State: " + this.readyState);
					console.log("Status: " + this.status);
					if (this.readyState === 4 && this.status === 500) {
						reject("Error interno del servidor");
						return;
					}
					if (this.readyState === 4 && this.status === 504) {
						reject("Se agotó el tiempo de respuesta");
						return;
					}
					if (this.readyState === 4 && this.status === 503) {
						reject("El service de SUNAT no responde");
						return;
					}
					if (this.readyState === 4 && this.status === 200) {
						var resp = this.responseText;
						//var armador = me.toJSON(resp);

						var xmlModel = new sap.ui.model.xml.XMLModel();

						xmlModel.setXML(resp);

						var xmlProperty = xmlModel.getProperty("/");

						var armador = {};

						var splited = xmlProperty.split("|");

						jQuery.each(splited, function (k, val) {
							var value = val.split("=");
							if (value[0]) {
								armador[value[0]] = value[1];
							}
						});

						if (armador.status_id !== "1") {
							if(armador.status_msg=== undefined){
								armador.status_msg="EL RUC INGRESADO NO EXISTE";
							}
							reject({
								msg: armador.status_msg,
								id: "rucArmador"
							});
							return;
						}

						me.replaceRareChars(armador);

						oModel.setProperty(sContextPath + "/Estado", armador.n1_estado);
						oModel.setProperty(sContextPath + "/Condicion", armador.n1_condicion);

						if (armador.n1_estado !== "ACTIVO") {
							reject({
								msg: "El armador no está Activo y/o Habido en la SUNAT",
								id: "estado"
							});
							return;
						}

						if (armador.n1_condicion !== "HABIDO") {
							reject({
								msg: "El armador no está Activo y/o Habido en la SUNAT",
								id: "condicion"
							});
							return;
						}

						var sDireccion = me.fixHTMLchars(armador.n1_direccion);
						var aTokens = sDireccion.split(" - ");
						var sDistric = aTokens.pop();
						var sPopulation = aTokens.pop();

						oModel.setProperty(sContextPath + "/Ubigeo", armador.n1_ubigeo.substring(0, 2)); // va?
						oModel.setProperty(sContextPath + "/BusinessName", armador.n1_alias);
						oModel.setProperty(sContextPath + "/Direccion", sDireccion);
						oModel.setProperty(sContextPath + "/Padron", me.fixHTMLchars(armador.n2_padrones_0).substr(0, 50));
						oModel.setProperty(sContextPath + "/Region", armador.n1_ubigeo.substring(0, 2));
						oModel.setProperty(sContextPath + "/Population", sPopulation);
						//oModel.setProperty(sContextPath + "/Distric", me.fixHTMLchars(armador.n1_ubigeo_dis));
						oModel.setProperty(sContextPath + "/Distric", sDistric);

						//oView.byId("condicion").setValue(armador.n1_condicion);

						if ((armador.n2_tipo_contr.toUpperCase().indexOf("PERSONA NATURAL") === -1)) {
							//oView.byId("check").setSelected(false);
							oModel.setProperty(sContextPath + "/TpTaxpayer", "");
						} else {
							//oView.byId("check").setSelected(true);
							oModel.setProperty(sContextPath + "/TpTaxpayer", "X");
						}

						/*						var temp;
												var rg = /(^\w{1}|\,\s*\w{1})/gi;
												temp = me.replaceRegex(armador.n2_cp_auto.toString(), rg);
												//						oView.byId("text").setText(temp);
												oView.byId("idComprobante").setValue(temp);

												temp = me.replaceRegex(armador.n2_see.toString(), rg);
												//						oView.byId("comp2").setText(temp);
						*/
						var cant = armador.n2_actv_econ;
						var value = "-";
						var temp2;
						var rubro;
						for (var x = 1; x <= cant; x++) {
							temp2 = "n2_actv_econ_" + x;
							rubro = armador[temp2];
							if ((rubro.toLowerCase().indexOf("pesca") !== -1)) {
								var z = 0;
								var k, m;
								for (k = 1; k < rubro.length; k++) {
									if (rubro.charAt(k) === "-") {
										z++;
									}
									if (z === 2) {
										break;
									}
								}
								k++;
								k++;
								m = rubro;
								rubro = "";
								for (var t = k; t < m.length; t++) {
									rubro = rubro + m.charAt(t);
								}
								value = me.fixHTMLchars(rubro);
								break;
							}
						}
						oModel.setProperty(sContextPath + "/Industry", value);
						if (value === "-") {
							reject({
								msg: "No pertenece al rubro de pesca",
								id: "pesca"
							});
						}
						resolve();
					}

				};
			});
		},

		replaceRareChars: function (oObject) {
			jQuery.each(oObject, function (key) {
				if (!jQuery.isArray(this)) {
					oObject[key] = oObject[key].replace("&amp;", "&");
					oObject[key] = oObject[key].replace("&amp;Ntilde;", "Ñ");
					oObject[key] = oObject[key].replace("&amp;Aacute;", "Á");
					oObject[key] = oObject[key].replace("&amp;aacute;", "á");
					oObject[key] = oObject[key].replace("&amp;Eacute;", "É");
					oObject[key] = oObject[key].replace("&amp;eacute;", "é");
					oObject[key] = oObject[key].replace("&amp;Iacute;", "Í");
					oObject[key] = oObject[key].replace("&amp;iacute;", "í");
					oObject[key] = oObject[key].replace("&amp;Oacute;", "Ó");
					oObject[key] = oObject[key].replace("&amp;oacute;", "ó");
					oObject[key] = oObject[key].replace("&amp;Uacute;", "Ú");
					oObject[key] = oObject[key].replace("&amp;uacute;", "ú");
					oObject[key] = oObject[key].replace("&apos;", "'");
				}
			});

			return oObject;
		},

		replaceRegex: function (temp, rg) {
			for (var y = 0; y < temp.length; y++) {
				temp = temp.replace("+", ", ");
			}
			temp = temp.toLowerCase();
			temp = temp.replace(rg,
				function (toReplace) {
					return toReplace.toUpperCase();
				});
			return temp;
		},

		fixHTMLchars: function (sText) {
			var value = $("<div/>").html(sText).text();
			for (var v = 0; v < value.length / 4; v++) {
				value = $("<div/>").html(value).text();
			}
			return value;
		},
		_validateDecimalInput: function (oEvent) {

			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			var len = val.length;
			if (val.substr(len - 1) === ".") {
				val = val + "00";
			}
			_oInput.setValue(val);

		},

		_decimalLiveChange: function (oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();

			var bUpdate = false;

			var fChar = val.substr(0, 1);

			if (fChar === "+" || fChar === "-" || fChar === ".") {
				val = val.substr(1);
				bUpdate = true;
			}

			var parts = val.split(".");

			if (parts.length > 1) {
				val = parts[0] + "." + parts[1];
				bUpdate = true;
			}

			if (isNaN(val)) {
				val = val.replace(/[^\d\/./?\d]/g, "");
				bUpdate = true;
			}
			if (bUpdate) {
				$("input[id^='" + _oInput.sId + "']").val(val);
			}
		}
	};
});