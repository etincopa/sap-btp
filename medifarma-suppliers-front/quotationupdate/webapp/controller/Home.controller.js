sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/everis/suppliers/quotationupdate/service/Service",
	"com/everis/suppliers/quotationupdate/controller/Message",
	"com/everis/suppliers/quotationupdate/model/Format",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function (Controller, Service, Message, Format, JSONModel, Filter, MessageItem, MessagePopover, MessageToast, BusyIndicator,
	MessageBox, UploadCollectionParameter) {
	"use strict";
	var oView, oComponent, that, oModelView, oModelUserApi, parametersUrl, oModeMime;
	const sApplication = "RFQ";
	return Controller.extend("com.everis.suppliers.quotationupdate.controller.Home", {
		format: Format,
		onInit: function () {
			that = this;
			oView = that.getView();
			oView.setModel(new JSONModel({}));
			oModelView = oView.getModel();
			oModelView.setProperty("/flagdfsec", false);
			oComponent = that.getOwnerComponent();
			oModeMime = that.getOwnerComponent().getModel("Mime");
			// parametersUrl = oComponent.getComponentData() === undefined ? '1000' : oComponent.getComponentData().startupParameters;
			parametersUrl = {};
			parametersUrl.BUKRS = [];
			// parametersUrl.BUKRS.push("EVE1");
			//that.setModelUserApi();
			oComponent.getModel("SUPPLIERS_SRV").metadataLoaded().then(function () {
				that.setModelUserApi();
				that.scrollPage();
				// that.renderDatePicker();
			});

			// TEST: Turn on Test mode when executed from Web IDE / local
			const bTestModeOn =
				// window.location.host.includes("webidetesting") || 
				window.location.host.includes("xoan5ihgfreoymvmppliers") || 
				window.location.host.includes("localhost");

			// Set configuration values
			this.oConfigModel = new JSONModel({
				testModeOn: bTestModeOn
			});

			// Set Attachment Model
			var oModel = new JSONModel({ attachments: [], newOfferId: '' });
			oView.setModel(oModel, "AttachmentsModel");
		},
		getI18nText: function (sText) {
			return this.oView.getModel("i18n") === undefined ? false : this.oView.getModel("i18n").getResourceBundle().getText(sText);
		},
		renderDatePicker: function () {
			$.sap.declare('com.everis.suppliers.quotationupdate.DatePicker');
		},
		setModelUserApi: function () {
			that = this;
			var userModel;

			this.readUserIasInfo().then(function (data) {
				oView.setModel(new JSONModel(data), "userApi");
				oModelUserApi = oView.getModel("userApi");

				if (oModelUserApi.oData.oData.ruc.length === 0) {
					return MessageBox.error(that.getI18nText("sErrorIASCustomAttributeRUC"));
				}

				Service.onGetProveedorbyRuc(oComponent, oModelUserApi.oData.oData.ruc, sApplication).then(function (resultProv) {
					oModelUserApi.setProperty("/Lifnr", resultProv.Partner);
					sap.ui.core.BusyIndicator.hide();
				}).catch(function (error) {
					Message.errorUser();
					sap.ui.core.BusyIndicator.hide();
				});
			});
		},
		onSetcolumn: function () {
			var model = oView.getModel();
			var columns = this.onGetColumnJson();
			var columnsTrue = columns.filter(function (obj) {
				return obj.flagVisible === true;
			});
			model.setProperty("/columnsTable", columnsTrue);
			model.refresh();
		},
		onSetPropertyLicitacion: function (oEvent) {
			that = this;
			var source = oEvent.getSource();
			var input = source.getValue();
			var filterEbeln = new Filter("Ebeln", "EQ", input);
			var filterBukrs = new Filter("Bukrs", "EQ", oModelView.getProperty("/Bukrs"));
			var filterLifnr = new Filter("Lifnr", "EQ", oModelUserApi.getProperty("/Lifnr"));
			var aFilter = [filterEbeln, filterBukrs, filterLifnr];
			Service.getLicitacion(oComponent, aFilter).then(function (result) {
				oModelView.setProperty("/aEbeln", result.results);
				oModelView.refresh();
			});
		},
		onShowValueHelp: function (oEvent) {
			that = this;
			if (!that._oPopoverValueHep) {
				that._oPopoverValueHep = sap.ui.xmlfragment("com.everis.suppliers.quotationupdate.view.fragment.popupValueHelp", that);
				oView.addDependent(that._oPopoverValueHep);
			}
			that._oPopoverValueHep.openBy(oEvent.getSource());
		},
		onPressedItem: function (oEvent) {
			var objItem = oEvent.getParameter("listItem").getBindingContext().getObject();
			oModelView.setProperty("/Licitacion", objItem.Ebeln);
			that._oPopoverValueHep.close();
		},
		onSetCabeceraDetails: function (petOferta, sBukrs) {
			Service.getCabeceraDetail(oComponent, petOferta, sBukrs, oModelUserApi.getProperty("/Lifnr")).then(
				function (result) {

					oModelView.setProperty("/flagDay", true);

					if (result.VigOferta === "0000-00-00") result.VigOferta = null;

					that._cloneResult = JSON.parse(JSON.stringify(result));

					if (result.PzoOferta.length > 0) {
						var lastIndex = result.PzoOferta.lastIndexOf("-");
						var dayPza = result.PzoOferta.substr(lastIndex + 1, 2);
						var today = new Date();
						var day = today.getDate();

						// if (day > parseInt(dayPza)) {
						// 	oModelView.setProperty("/flagDay", false);
						// }

						//brad
						var datePzoOferta = new Date(parseInt(result.PzoOferta.substring(0, 4)), parseInt(result.PzoOferta.substring(4, 6)), parseInt(
							result.PzoOferta.substring(6, 8)));
						today.setDate(today.getDate() - 1);
						console.log(today + "  hhhhh  " + datePzoOferta)
						console.log(today > datePzoOferta)
						if (today > datePzoOferta) {
							oModelView.setProperty("/flagDay", false);
						} else {
							oModelView.setProperty("/flagDay", true);
						}
					}

					oModelView.setProperty("/cabeceraDetails", result);
					// oModelView.updateBindings(true);
					sap.ui.core.BusyIndicator.hide();
					var idTableGrid = that._byId("idTableGrid");
					var rows = idTableGrid.getRows();
					for (var i in rows) {
						rows[i].getCells()[11].attachBrowserEvent("click",
							function (oEvent) {
								this.selectText(0, 100)
							});
						rows[i].getCells()[13].attachBrowserEvent("click",
							function (oEvent) {
								this.selectText(0, 100)
							});
						// rows[i].getCells()[16].attachBrowserEvent("click",
						// 	function (oEvent) {
						// 		this.selectText(0, 100)
						// 	});
					}
					oModelView.refresh();
					if (result.Oferta !== '') {
						that.onDownloadAttachments({ 'LinkedSAPObjectKey': `'${result.Oferta}'`, 'BusinessObjectTypeName': "'EKKO_QTN'" });
					} else {
						that.getView().getModel("AttachmentsModel").setProperty("/attachments", []);
					}
					sap.ui.core.BusyIndicator.hide();
				}).catch((oError) => {
				MessageBox.error(JSON.stringify(oError));
				sap.ui.core.BusyIndicator.hide();
			});
		},
		onSearchPetOfert: function () {
			var sSociedad = oModelView.getProperty("/Bukrs") !== undefined ? oModelView.getProperty("/Bukrs").length ? oModelView.getProperty(
				"/Bukrs").toString() : '' : '';
			var licitacion = oModelView.getProperty("/Licitacion") !== undefined ? oModelView.getProperty("/Licitacion").length ? oModelView.getProperty(
				"/Licitacion").toString() : '' : '';
			var estado = oModelView.getProperty("/fstat") !== undefined ? oModelView.getProperty("/fstat").length ? oModelView.getProperty(
				"/fstat").toString() : '' : '';
			var FeDesde = oModelView.getProperty("/dffir") !== undefined ? oModelView.getProperty("/dffir").length ? oModelView.getProperty(
				"/dffir").toString().replace(/-/g, "") : '' : '';
			//var FeHasta = oModelView.getProperty("/dfsec") !== undefined && oModelView.getProperty("/dfsec") !== null ? oModelView.getProperty(
            //	"/dfsec").length ? oModelView.getProperty("/dfsec").toString() : '' : '';
            if(FeDesde.length > 0 && 
                (
                oModelView.getProperty("/dfsec") == "" || 
                oModelView.getProperty("/dfsec") == undefined || 
                oModelView.getProperty("/dfsec") == null
                )
                ){
                var f = new Date();
                var dia = (f.getDate() < 10 ? "0" + f.getDate() : f.getDate());
                var mes = ((f.getMonth() +1) < 10 ? "0" + (f.getMonth() +1) :  (f.getMonth() +1));
                var anio =  f.getFullYear();

                oModelView.setProperty("/dfsec", anio + "-" + mes + "-" + dia);
               
            }

            var FeHasta = oModelView.getProperty("/dfsec") !== undefined ? oModelView.getProperty("/dfsec").length ? oModelView.getProperty(
                "/dfsec").toString().replace(/-/g, "") : '' : '';

			var flagSoloPendientes = oModelView.getProperty("/flagSoloPendientes");
            

            
            /*if (sSociedad.length === 0) {
				return sap.m.MessageBox.error("Seleccione al menos unas sociedad.");
			}*/
			if (licitacion.length > 0 || estado.length > 0 || sSociedad.length > 0 || FeDesde.length > 0) {
				that.onGetDataFilters(licitacion, estado, FeDesde, FeHasta, flagSoloPendientes);
			} else {
				Message.selectedFilter("errorLicEsta");
			}
		},
		onGetDataFilters: function (licitacion, estado, FeDesde, FeHasta, flagSoloPendientes) {
			var filterLicitacion = new Filter("Licitacion", "EQ", licitacion);
			var filterEstado = new Filter("Estado", "EQ", estado);
			var filterFeDesde = new Filter("FeDesde", "EQ", FeDesde);
			var filterFeHasta = new Filter("FeHasta", "EQ", FeHasta);
			var aBukrs = oModelView.getProperty("/Bukrs");
			var aFilterBukrs = [];
			for (var i in aBukrs) {
				var oBukrs = new Filter("Bukrs", "EQ", aBukrs[i]);
				aFilterBukrs.push(oBukrs);
			}
			var filterLifnr = new Filter("Lifnr", "EQ", oModelUserApi.getProperty("/Lifnr"));
			var aFilter = [filterLicitacion, filterLifnr, filterEstado, filterFeDesde, filterFeHasta];
			aFilter = aFilter.concat(aFilterBukrs);
			if (flagSoloPendientes) {
				aFilter = aFilter.concat(new Filter("Flag", "EQ", "X"));
			}
			Service.getPeticionOferta(oComponent, aFilter).then(function (result) {
				oView.setModel(new JSONModel(result), "PetOfert");
				that.onOpenDialogPetOfert();
			});
		},
		onOpenDialogPetOfert: function () {
			that = this;
			if (!that._dialogPetOfert) {
				that._dialogPetOfert = sap.ui.xmlfragment("com.everis.suppliers.quotationupdate.view.fragment.PeticionOferta", that);
				oView.addDependent(that._dialogPetOfert);
			}
			that._dialogPetOfert.open();
		},
		onCloseDialogPetOfert: function () {
			that._dialogPetOfert.close();
			var idTableGrid = this._byId("idTableGrid");

		},
		onPressedItemPetOfert: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var objPetOfert = oEvent.getParameter("listItem").getBindingContext("PetOfert").getObject();
			that.onCloseDialogPetOfert();
			var sLifnr = oModelUserApi.getProperty("/Lifnr");
			Service.getCurrency(oComponent, objPetOfert.Ebeln, sLifnr).then(function (result) {
				that.getView().getModel("ModelGlobal").setProperty("/Currency", result.results)
				Service.getPaymentCondition(oComponent, objPetOfert.Ebeln, sLifnr).then(function (result) {
					that.getView().getModel("ModelGlobal").setProperty("/PaymentCondition", result.results)
					that.onSetCabeceraDetails(objPetOfert.Ebeln, objPetOfert.Bukrs);
				}).catch(function (oError) {
					console.log(oError)
				});
			}).catch(function (oError) {
				console.log(oError)
			});
		},
		onSetCurrency: function () {
			sap.ui.core.BusyIndicator.show();
			Service.getCurrency(oComponent).then(function (result) {
				oModelView.setProperty("/currency", result.results);
				oModelView.setSizeLimit(result.results.length);
				oModelView.refresh();
				oModelView.updateBindings(true);
				sap.ui.core.BusyIndicator.hide();
			});
		},
		onOpenDialogAttach: function () {
			that = this;
			if (!that._dialogAttach) {
				var sUploadUrl = that.getOwnerComponent().getModel("Config").getProperty("/uploadUrl");
				that.getOwnerComponent().getModel("Config").setProperty("/uploadUrl", that.getOwnerComponent().getManifestObject().resolveUri(sUploadUrl));
				that._dialogAttach = sap.ui.xmlfragment("com.everis.suppliers.quotationupdate.view.fragment.Attach", that);
				oView.addDependent(that._dialogAttach);
			}
			that._dialogAttach.open();
		},
		onCloseDialogAttach: function () {
			that._dialogAttach.close();
		},
		onChangeFechaInicial: function () {
			var dffir = oModelView.getProperty("/dffir");
			var getData = oModelView.getData();
			getData.dfsec = null;
			if (!dffir.length) {
				oModelView.setProperty("/flagdfsec", false);
			} else {
				oModelView.setProperty("/flagdfsec", true);
			}
			oModelView.refresh();
			oModelView.updateBindings(true);
		},
		onChangeStatePos: function (oEvent) {
			var objPos = oEvent.getSource().getParent().getBindingContext().getObject();
			Service.onGetEstatus(oComponent).then(function (result) {
				if (objPos.IndCotizado) {
					objPos.Estado = "O";
				} else {
					objPos.Estado = "N";
				}
				var ojbSearched = result.results.find(function (ele) {
					return ele.StatusId === objPos.Estado;
				});
				objPos.EstadoTxt = ojbSearched.Descripcion;
				oModelView.refresh();
				oModelView.updateBindings(true);
			});
		},
		onPressReadTextButton: function (oEvent) {
			var ovPos = oEvent.getSource().getParent().getBindingContext().getObject();

			Message.showTextPos(ovPos);
		},
		onCloseDialogReadText: function () {
			that._odialogReadText.close();
		},
		onLiveChangeDcto: function (oEvent) {
			that = this;
			var input = oEvent.getSource();

			var cantPoint = input.getValue().split(".").length - 1;
			var cantComa = input.getValue().split(",").length - 1;

			if (input.getValue() === "" || cantPoint > 1 || cantComa > 1) {
				input.setValue(0);
			} else {
				if (input.getValue() !== that.onValidNumber(input.getValue())) {
					input.setValue(that.onValidNumber(input.getValue()));
				}
				if (input.getValue().length === 0 || input === undefined || input.getValue() === 0) {
					input.setValueState("Error");
				}
			}

			var objPos = oEvent.getSource().getParent().getBindingContext().getObject();
			if (parseFloat(objPos.CantOfer) > 0.1 && parseFloat(objPos.PreUnit) > 0.1 && parseFloat(objPos.CantBase) > 0.1) {
				objPos.SubtotSd = (objPos.CantOfer / objPos.CantBase) * objPos.PreUnit;
				objPos.MtoDscto = objPos.SubtotSd * (objPos.DsctoPer / 100);
				objPos.SubtotCd = objPos.SubtotSd - objPos.MtoDscto;
			} else {
				objPos.SubtotSd = 0;
				objPos.MtoDscto = 0;
				objPos.SubtotCd = 0;
			}
		},
		onLiveChange: function (oEvent) {
			that = this;
			var input = oEvent.getSource();

			var cantPoint = input.getValue().split(".").length - 1;
			var cantComa = input.getValue().split(",").length - 1;

			if (input.getValue() === "" || cantPoint > 1 || cantComa > 1) {
				input.setValue(0);
				input.setValueState("Error");
			} else {
				if (input.getValue() !== that.onValidNumber(input.getValue())) {
					input.setValue(that.onValidNumber(input.getValue()));
				}

				if (input.getValue().length === 0 || input === undefined || input.getValue() === 0) {
					input.setValueState("Error");
				}
			}

			var objPos = oEvent.getSource().getParent().getBindingContext().getObject();
			if (parseFloat(objPos.CantOfer) > 0.1 && parseFloat(objPos.PreUnit) > 0.1 && parseFloat(objPos.CantBase) > 0.1) {
				objPos.SubtotSd = (objPos.CantOfer / objPos.CantBase) * objPos.PreUnit;
				objPos.MtoDscto = objPos.SubtotSd * (objPos.DsctoPer / 100);
				objPos.SubtotCd = objPos.SubtotSd - objPos.MtoDscto;
			} else {
				objPos.SubtotSd = 0;
				objPos.MtoDscto = 0;
				objPos.SubtotCd = 0;
			}
		},
		onValidNumber: function (str) {
			return str.replace(/[^\d\.\,]/g, "");
		},
		onAfterRendering: function (oEvent) {
			this.getView().byId("page").scrollTo(0);
			var showValueHelp = function () {
				alert("Hello");
				var text = this.getCustomData()[0].getValue();
				sap.m.MessageToast.show(text);
				event.preventDefault();
				event.stopPropagation();
				return false;
			};
		},
		_byId: function (sName) {
			var cmp = this.byId(sName);
			if (!cmp) {
				cmp = sap.ui.getCore().byId(sName);
			}
			return cmp;
		},
		onChangeCalcute: function (oEvent) {
			var objPos = oEvent.getSource().getParent().getBindingContext().getObject();
			if (parseFloat(objPos.CantOfer) > 0.1 && parseFloat(objPos.PreUnit) > 0.1 && parseFloat(objPos.CantBase) > 0.1) {
				objPos.SubtotSd = (objPos.CantOfer / objPos.CantBase) * objPos.PreUnit;
				objPos.MtoDscto = objPos.SubtotSd * (objPos.DsctoPer / 100);
				objPos.SubtotCd = objPos.SubtotSd - objPos.MtoDscto;
			} else {
				objPos.SubtotSd = 0;
				objPos.MtoDscto = 0;
				objPos.SubtotCd = 0;
			}
		},
		verfiedIquals: function (cabDet, cloneResult) {
			try {
				var returnValid = true;
				var objs = Object.keys(cloneResult);
				$.each(objs, function (k, v) {
					if (typeof cabDet[v] === "object" && cabDet[v] !== null) {
						if (v !== "__metadata") {
							if (v !== "Returns") {
								if (cabDet[v].results !== undefined && cabDet[v].results.length > 0) {
									var objsNav = Object.keys(cabDet[v].results[0]);
									if (cabDet[v].results.length === cloneResult[v].results.length) {
										$.each(cabDet[v].results, function (kR, vR) {
											$.each(objsNav, function (knav, vnav) {
												if (vnav !== "__metadata") {
													if (typeof vR[vnav] === "number") vR[vnav] = vR[vnav].toFixed(3);
													if (vR[vnav] !== cloneResult[v].results[kR][vnav]) {
														returnValid = false;
														return false;
													}
												}
											});
										});
									} else {
										returnValid = false;
										return false;
									}
								}
							}
						}
					} else {
						if (cabDet[v] !== cloneResult[v]) {
							returnValid = false;
							return false;
						}
					}
				});
				return returnValid;
			} catch (err) {
				console.log(err);
			}

		},
		updateCotizacion: function () {
			that = this;
			MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmRequest"), {
				styleClass: "sapUiSizeCompact",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: (oAction) => {
					if (oAction === "YES") {
						sap.ui.core.BusyIndicator.show();
						var cabDet = oModelView.getProperty("/cabeceraDetails");
						var cont = 0;
						var sendData = JSON.parse(JSON.stringify(cabDet));
						var DocumentNum = "";
						var res = that.verfiedIquals(cabDet, that._cloneResult);
						var oUploadCollection = this._byId("UploadCollection");
						var cFiles = 0;
						if(oUploadCollection){
							cFiles = oUploadCollection.getItems().length;
						}
			
						// Formato fecha de envio
						$.each(sendData.Details.results, function (k, v) {
							v.FeDocu = v.FeDocu.replace(/-/gi, '');
							v.FeEntpro = v.FeEntpro.replace(/-/gi, '');
							v.FeEntreq = v.FeEntreq.replace(/-/gi, '');
						});
			
						if (res && cFiles === 0) {
							Message.noModified();
							sap.ui.core.BusyIndicator.hide();
						} else {
							if (sendData.CondPago.length === 0 || sendData.Moneda.length === 0 || sendData.VigOferta === null || sendData.VigOferta === "") {
								Message.errorvalidateHeader();
								sap.ui.core.BusyIndicator.hide();
							} else {
								that.validatePos(sendData.Details).then(function (result) {
									delete sendData.Attachments;
									delete sendData.Details;
									delete sendData.__metadata;
									sendData.Details = result;
									sendData.Returns = [{
										"Id": "1"
									}];
									Service.updateCotizacion(oComponent, sendData).then(function (resultUpdate) {
										var validError = resultUpdate.Returns.results.filter(function (ele) {
											return ele.Type === "E";
										});
										if (validError.length === 0) {
											that.getView().getModel("AttachmentsModel").setProperty("/newOfferId", resultUpdate.Oferta);
											that.onStartUpload().then(function () {
												// oModelView.setProperty("/messagePop", resultUpdate.Returns.results);
												// that.onMessageUpdateCotizacion();
												Message.successUpdate();
												that.resetPage();
												sap.ui.core.BusyIndicator.hide();
											}).catch((oError) => {
												console.log(oError);
												sap.ui.core.BusyIndicator.hide();
											});
										} else {
											Message.errorUpdate(resultUpdate.Returns.results);
										}
									}).catch((oError) => {
										console.warn(oError);
										Message.error("Error al actualizar la cotización", oError.message);
									});
								}).catch(function (aPos) {
									Message.onErrorDetail(aPos);
									sap.ui.core.BusyIndicator.hide();
								}).finally(() => {
									sap.ui.core.BusyIndicator.hide();
								});
							}
						}
					}
				},
			});
		},
		// Mensajes de error.
		onErrorMessage: function (oError, textoI18n) {
			if (oError.responseJSON) {
				if (oError.responseJSON.error) {
					MessageBox.error(oError.responseJSON.error.message.value);
				} else {
					if (oError.responseJSON[0]) {
						if (oError.responseJSON[0].description) {
							MessageBox.error(oError.responseJSON[0].description);
						} else {
							MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
						}
					} else {
						MessageBox.error(oError.responseJSON.response.description);
					}
				}
			} else if (oError.message) {
				MessageBox.error(oError.message);
			} else if (oError.responseText) {
				MessageBox.error(oError.responseText);
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
			}
		},
		resetPage: function () {
			delete oModelView.getData().cabeceraDetails;
			oModelView.refresh();
			oModelView.updateBindings(true);
			var oModel = new JSONModel({ attachments: [], newOfferId: '' });
			oView.setModel(oModel, "AttachmentsModel");
			that.scrollPage();
		},
		onMessageUpdateCotizacion: function () {

			var button = oView.byId("idButtonInformation");
			var oMessageTemplate = new MessageItem({
				type: "{= ${Type} === 'E' ? 'Error' : ${Type} === 'S' ? 'Success' : 'Warning' }",
				title: "{= ${Type} === 'S' ? 'Licitación' : ${MessageV2} }",
				activeTitle: false,
				description: "{= ${Type} === 'S' ? ${Message}.replace('oferta para Petición de oferta', 'licitación') :  ${Message} } ",
				subtitle: '{MessageV3}'
			});

			if (!this._oMessagePopover) {
				this._oMessagePopover = new MessagePopover({
					items: {
						path: '/',
						template: oMessageTemplate
					}
				});
			}

			var messagePop = oModelView.getProperty("/messagePop");
			this._oMessagePopover.setModel(new JSONModel(messagePop));
			this._oMessagePopover.toggle(button);
		},
		uploadFiles: function (aFiles, length, cont) {
			var jsonData = {};
			that = this;
			return new Promise(function (resolve) {
				jsonData = {
					"DocNumber": aFiles[cont].DocNumber,
					"FileName": aFiles[cont].FileName,
					"Data": aFiles[cont].Data
				};
				Service.onUpload(oComponent, jsonData).then(function () {
					cont++;
					if (cont < length) {
						that.uploadFiles(aFiles, length, cont).then(function () {
							resolve();
						});
					} else {
						resolve();
					}
				});
			});
		},
		validatePos: function (detail) {
			var returnsucess = [],
				returnreject = [];
			return new Promise(function (resolve, reject) {
				$.each(detail.results, function (key, pos) {
					delete pos.__metadata;
					if (pos.IndCotizado) {
						if (parseFloat(pos.CantOfer) < 0.1 || parseFloat(pos.PreUnit) < 0.1 || parseFloat(pos.CantBase) < 0.1 || pos.FeEntpro ===
							null) {
							returnreject.push(pos);
						} else {
							pos.CantOfer = pos.CantOfer.toString();
							pos.CantBase = pos.CantBase.toString();
							pos.PreUnit = pos.PreUnit.toString();
							pos.DsctoPer = pos.DsctoPer.toString();
							pos.SubtotSd = pos.SubtotSd.toString();
							pos.MtoDscto = pos.MtoDscto.toString();
							pos.SubtotCd = pos.SubtotCd.toString();
							returnsucess.push(pos);
						}
					} else {
						pos.CantOfer = pos.CantOfer.toString();
						pos.CantBase = pos.CantBase.toString();
						pos.PreUnit = pos.PreUnit.toString();
						pos.DsctoPer = pos.DsctoPer.toString();
						pos.SubtotSd = pos.SubtotSd.toString();
						pos.MtoDscto = pos.MtoDscto.toString();
						pos.SubtotCd = pos.SubtotCd.toString();
						returnsucess.push(pos);
					}
				});
				if (returnreject.length) {
					reject(returnreject);
				} else {
					resolve(returnsucess);
				}
			});
		},
		onChange: function (oEvent) {},
		onUploadComplete: function (oEvent) {
			oComponent.getModel("SUPPLIERS_SRV").refresh();

			MessageToast.show(`Se subió el archivo "${oEvent.getParameters().mParameters.fileName}" correctamente`);
			sap.ui.core.BusyIndicator.hide();
		},
		onFileDeleted: function (oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("file");
			var oAttachmentsModel = that.getView().getModel();
			var aItems = oAttachmentsModel.getData().attachments;
			var iIndexOfItemToBeRemoved = -1;
			aItems.forEach((oItem, index) => {
				if (oItem.fileName === oSelectedItem.name) {
					iIndexOfItemToBeRemoved = index;
					return;
				}
			});

			if (iIndexOfItemToBeRemoved > 0) {
				aItems.splice(iIndexOfItemToBeRemoved, 1);
				oAttachmentsModel.refresh();
			}
		},
		getFileExtension: function (filename) {
			var ext = /^.+\.([^.]+)$/.exec(filename);
			return ext == null ? "" : ext[1];
		},
		scrollPage: function () {
			this.getView().byId("page").scrollTo({
				top: 0,
				left: 0,
				height: "10px",
				behavior: 'smooth'
			});
			//this.getView().byId("page").scrollTo(1);
		},
		readUserApiInfo: function () {
			return new Promise(function (resolve, reject) {
				// var oUserModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true");
				var oUserModel = new JSONModel("/services/userapi/attributes");
				oUserModel.attachRequestCompleted(function () {
					resolve(oUserModel);
				});
				oUserModel.attachRequestFailed(function () {
					reject("Error");
				});
			});
		},
		readUserIasInfo: function () {
			var that = this;
			return new Promise((resolve, reject) => {
				if (this.oConfigModel.getProperty("/testModeOn")) {
					resolve({
						oData: {
							ruc: "20554266437"
						}
					});
				} else {

					var userModel = new JSONModel({});
					var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
					if (sMail === undefined) {
						sMail = "fcorvett@everis.com";
					}
					//var sMail = "juan_perez@gmail.com";
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
				}
			});
		},

		onStartUpload: function (oEvent) {
			return new Promise((resolve, reject) => {
				var oUploadCollection = this._byId("UploadCollection");
				if (oUploadCollection) {
					var cFiles = oUploadCollection.getItems().length;
					// var uploadInfo = cFiles + " file(s)";

					if (cFiles > 0) {
						oUploadCollection.upload();

						// sap.m.MessageToast.show("Method Upload is called (" + uploadInfo + ")");
						// MessageBox.information("Uploaded " + uploadInfo);
					}
				}
				resolve();
			});
		},

		onBeforeUploadStarts: function (oEvent) {
			var that = this;
			let sSlug = oEvent.getParameter("fileName");

			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "Slug",
				value: sSlug
			});
			var oCustomerHeaderContentType = new UploadCollectionParameter({
				name: "Content-Type",
				value: "application/pdf"
			});
			var oCustomerHeaderBusinessObject = new UploadCollectionParameter({
				name: "BusinessObjectTypeName",
				value: "EKKO_QTN"
			});
			var oCustomerHeaderLinkedSAPObjectKey = new UploadCollectionParameter({
				name: "LinkedSAPObjectKey",
				value: that.getView().getModel("AttachmentsModel").getProperty("/newOfferId")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderContentType);
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderBusinessObject);
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderLinkedSAPObjectKey);

			let oModel = oComponent.getModel("API_CV_ATTACHMENT_SRV");
			oModel.refreshSecurityToken(function (data, header, request) {
				let oCustomerHeaderToken = new UploadCollectionParameter({
					name: "x-csrf-token",
					value: oModel.getSecurityToken()
				});
				oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);

			}, function (error) {});
		},

		onDownloadAttachments: function (oParameters) {
			var that = this;
			var oModel = oComponent.getModel("API_CV_ATTACHMENT_SRV");
			Service.onRead(oModel, "/GetAllOriginals", oParameters).then((oResult) => {
				that.getView().getModel("AttachmentsModel").setProperty("/attachments", oResult.results);
			}).catch((oError) => {
				console.log(oError);
			});
		}
	});
});