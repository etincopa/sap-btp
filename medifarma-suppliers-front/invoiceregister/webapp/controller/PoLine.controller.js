sap.ui.define(["sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
	],
	function (Controller, MessageBox, utilities, History, MessageToast, Filter,JSONModel) {
		"use strict";

		return Controller.extend("com.everis.suppliers.invoiceregister.controller.PoLine", {
			handleRouteMatched: function (oEvent) {
				this.getView().setModel(sap.ui.getCore().getModel("TipDoc"), "TipDoc");
				var oItemRoute = sap.ui.getCore().getModel("TipDoc").getData();
				var oParameter = oEvent.getParameter("data");
				var aFilters = [];
				var ClasPedidoFilter = new sap.ui.model.Filter({
					path: "ClasePedido",
					operator: "EQ",
					value1: "1"
				});
				aFilters.push(new Filter({
					path: "ClasePedido",
					operator: "EQ",
					value1: "1"
				}));
				aFilters.push(new Filter({
					path: "DocTypeSunat",
					operator: "EQ",
					value1: oItemRoute.DocTypeSunat
				}));
				if (oParameter.context) {
					this.fecha = oParameter.date;
					this.reference = oParameter.reference;
					this.sContext = oParameter.context;
					if (this.sContext) {
						var oObjectFilter = {
							path: "/" + this.sContext,
							filters: aFilters
						};
						this.getView().bindObject(oObjectFilter);
					}
				}
				var oDetalle = this.getView().byId("Detalle");
				var oTipDoc = this.getView().getModel("TipDoc");
				if (oTipDoc.getData().TipDoc === "02") {
					oDetalle.getColumns()[6].setVisible(false);
					oDetalle.getColumns()[7].setVisible(true);
				} else {
					oDetalle.getColumns()[6].setVisible(true);
					oDetalle.getColumns()[7].setVisible(false);
				}
				var oDetalleItems = oDetalle.getBinding("items");
				oDetalleItems.filter(aFilters);
				this.addMsg();
			},
			addMsg: function () {
				if (this.getOwnerComponent().getModel("oMsg")) {
					var aMessages = this.getOwnerComponent().getModel("oMsg").arreglo;
					for (var tIndex = 0; tIndex < aMessages.length; tIndex++) {
						this._addPopoverMessage(aMessages[tIndex].type, aMessages[tIndex].title, aMessages[tIndex].msg);
					}
				}
			},
			_updatePopoverCounter: function () {
				$._popoverCount = $._popoverCount + 1;
				if (this.getView()) {
					this.getView()
						.byId("popoverButton")
						.setText("Mensajes (" + $._popoverCount + ")");
				}
			},
			_addPopoverMessage: function (sType, sTitle, sDescription) {
				$._popoverData.unshift({
					type: sType,
					title: sTitle,
					description: sDescription,
				});
				$._popoverModel.setData($._popoverData);
				this._updatePopoverCounter();
			},
			onRegistrar: function () {
				var that = this;
				var i18n = that.getView().getModel("i18n").getResourceBundle();
				var _oModel = this.getView().getModel();
				var sContext = this.sContext;
				var oHeaderData = _oModel.oData[sContext];
				var oEntry = {};
				var oDetalleSelectedItems = this.byId("Detalle").getSelectedItems();
				if (!oDetalleSelectedItems.length) {
					sap.m.MessageToast.show("Debe seleccionar al menos una posición");
					return false;
				}
				oEntry.ConexionPIPO = "";
				var oChkPIPO = this.byId("chkPIPO");
				if (oChkPIPO.getSelected()) {
					oEntry.ConexionPIPO = "X";
				}
				oEntry.DOCUMENTTYPE = "01";
				oEntry.ClasePedido = oHeaderData.ClasePedido;
				oEntry.SUPPLIERID = sap.ushell.Container.getService("UserInfo").getUser().getId();
				oEntry.PAYMENT_TERMS = "";
				oEntry.PO_NUMBER = oHeaderData.PO_NUMBER;
				oEntry.REFERENCE = this.reference;
				oEntry.TOTAL_VALUE = oHeaderData.TOTAL_VALUE;
				oEntry.CURRENCY = oHeaderData.CURRENCY;
				oEntry.COMPANY_CODE = oHeaderData.ItCompanyId;
				oEntry.ORDER_DATE = "";
				oEntry.TYPE = "";
				oEntry.MESSAGE = "";
				oEntry.COMPANY = oHeaderData.COMPANY;
				oEntry.DN_NUMBER = oHeaderData.DN_NUMBER;
				oEntry.DOC_DATE = this.fecha;
				oEntry.PoLineSet = [];
				oEntry.RegHeaderToPos = [];
				for (var tIndex = 0; tIndex < oDetalleSelectedItems.length; tIndex++) {
					var oItem = oDetalleSelectedItems[tIndex].getBindingContext().getObject();
					if (oItem.PO_NUMBER === oEntry.PO_NUMBER) {
						var oPosItem = {};
						oPosItem.PO_NUMBER = oItem.PO_NUMBER;
						oPosItem.PO_UNIT = oItem.PO_UNIT;
						oPosItem.ItCompanyId = oItem.ItCompanyId;
						oPosItem.ITEMNUMBER = oItem.ITEMNUMBER;
						oPosItem.MATERIALNUMBER = oItem.MATERIALNUMBER;
						oPosItem.ITEMDESCRIPTION = oItem.ITEMDESCRIPTION;
						oPosItem.QUANTITY = oItem.QUANTITY.replace(/,/g, "");
						oPosItem.UNITPRICE = oItem.UNITPRICE.replace(/,/g, "");
						oPosItem.CURRENCY = oItem.CURRENCY;
						oPosItem.SUBTOTAL = oItem.SUBTOTAL.replace(/,/g, "");
						oEntry.PoLineSet.push(oPosItem);
					}
				}
				
				_oModel.create("/InvoiceRegSet", oEntry, {
					success: function (oData, oResponse) {
						var oResponseData = oResponse.data;
						MessageToast.show(oResponseData.MESSAGE);
						if (oResponseData.TYPE === "E") {
							that._addPopoverMessage("Error", i18n.getText("PopTitle") + oResponseData.PO_NUMBER, oResponseData.MESSAGE);
						} else {
							that._addPopoverMessage("Success", i18n.getText("PopTitle") + oResponseData.PO_NUMBER, oResponseData.MESSAGE);
						}
					},
					error: function (oError) {
						MessageToast.show(i18n.getText("Error"));
						that._addPopoverMessage("Error", i18n.getText("PopTitle") + oEntry.PO_NUMBER, i18n.getText("ErrorMsg"));
					}
				});
			},
			onListUpdateFinishedPosition: function () {
				var that = this;
				var oDetalle = this.getView().byId("Detalle");
				var aItems = [];
				var oDetalleItems = oDetalle.getItems();
				var o = true;
				var aDetalleArrItems = [];
				var oDetalleArr = {};
				var oDetalleArrModel = this.getOwnerComponent().getModel("oDetalleArr");
				
				if (oDetalleArrModel) {
					aDetalleArrItems = oDetalleArrModel.arreglo;
					for (var tIndex = 0; tIndex < aDetalleArrItems.length; tIndex++) {
						var sPoNumber = oDetalleItems[0].getBindingContext().getObject().PO_NUMBER;
						if (sPoNumber && sPoNumber === aDetalleArrItems[tIndex]) {
							o = false;
							if (o) {
								aDetalleArrItems.push(oDetalleItems[0].getBindingContext().getObject().PO_NUMBER);
								oDetalleArr.arreglo = aDetalleArrItems;
								that.getOwnerComponent().setModel(oDetalleArr, "oDetalleArr");
							}
						}
					}
				}
				for (var tIndex = 0; tIndex < oDetalleItems.length; tIndex++) {
					aItems.push(oDetalleItems[tIndex].getBindingContext().getObject());
				}
	
				var oDetallePOModel = this.getOwnerComponent().getModel("oDetallePO");
				if (oDetallePOModel) {
					var oDetallePOData = JSON.parse(oDetallePOModel.getJSON());
					var aArreglo = oDetallePOData.arreglo;
					for (var tIndex = 0; tIndex < aArreglo.length; tIndex++) {
						aItems.push(aArreglo[tIndex]);
					}
				}
				
				var oDetallePOData = new JSONModel({
					arreglo : aItems
				});
				this.getOwnerComponent().setModel(oDetallePOData, "oDetallePO");
	
				oDetallePOModel = this.getOwnerComponent().getModel("oDetallePO");
				if (oDetallePOModel) {
					var oDetallePOData = JSON.parse(oDetallePOModel.getJSON());
					this.oInfoPO_ = oDetallePOData;
				}
			},
			onSelectionChange: function () {
				var that = this;
				var i18n = that.getView().getModel("i18n").getResourceBundle();
				var oDetalle = this.getView().byId("Detalle");
				var aItems = [];
				var oDetalleSelectedItems = oDetalle.getSelectedItems();
				var oDetalleItems = oDetalle.getItems();
				var sPoNumber = oDetalleItems[0].getBindingContext().getObject().PO_NUMBER;
				if (oDetalleSelectedItems.length < 1) {
					MessageToast.show(i18n.getText("Empty1") + sPoNumber);
					oDetalle.selectAll();
				}
				if (oDetalleSelectedItems.length === oDetalleItems.length) {
					oDetalleSelectedItems = [];
				}
				for (var tIndex = 0; tIndex < oDetalleSelectedItems.length; tIndex++) {
					aItems.push(oDetalleSelectedItems[tIndex].getBindingContext().getObject());
				}
	
				var oDetallePOModel = this.getOwnerComponent().getModel("oDetallePO");
				if (oDetallePOModel) {
					var oDetallePOData = JSON.parse(oDetallePOModel.getJSON());
					var aArreglo = oDetallePOData.arreglo;
					for (var tIndex = 0; tIndex < aArreglo.length; tIndex++) {
						if (aArreglo[tIndex].PO_NUMBER !== sPoNumber) {
							aItems.push(aArreglo[tIndex]);
						}
					}
				}
				
				var oDetallePOData = new JSONModel({
					arreglo : aItems
				});
				this.getOwnerComponent().setModel(oDetallePOData, "oDetallePO");
				oDetallePOModel = this.getOwnerComponent().getModel("oDetallePO");
				if (oDetallePOModel) {
					var oDetallePOData = JSON.parse(oDetallePOModel.getJSON());
				}
			},
			_onPageNavButtonPress: function () {
				var oInstance = History.getInstance();
				var oPreviousHash = oInstance.getPreviousHash();
				var oQueryParameters = this.getQueryParameters(window.location);
				if (oPreviousHash !== undefined || oQueryParameters.navBackToLaunchpad) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("default", true);
				}
			},
			getQueryParameters: function (oLocation) {
				var oDecodeURI = {};
				var aSearch = oLocation.search.substring(1).split("&");
				for (var iIndex = 0; iIndex < aSearch.length; iIndex++) {
					var aUri = aSearch[iIndex].split("=");
					oDecodeURI[aUri[0]] = decodeURIComponent(aUri[1]);
				}
				return oDecodeURI;
			},
			_onButtonPress: function (oEvent) {
				oEvent = jQuery.extend(true, {}, oEvent);
				return new Promise(function (resolve) {
					resolve(true);
				}).then(function (oResponse) {
					var oBindingContext = oEvent.getSource().getBindingContext();
					return new Promise(function (resolve) {
						this.doNavigate("CabeceraOc", oBindingContext, resolve, "");
					}.bind(this));
				}.bind(this)).then(function (oResponse) {
					if (oResponse === false) {
						return false;
					} else {
						var _oView = this.getView();
						var that = this;
						return new Promise(function (resolve, reject) {
							var _oModel = that.oModel;
							var fnReject = function (oError) {
								_oModel.resetChanges();
								reject(new Error(oError));
							};
							if (_oModel && _oModel.hasPendingChanges()) {
								_oModel.submitChanges({
									success: function (oSuccess) {
										var aBatchResponses = oSuccess.__batchResponses[0];
										var aChangeResponse = aBatchResponses.__changeResponses && aBatchResponses.__changeResponses[0];
										if (aChangeResponse && aChangeResponse.data) {
											var l = _oModel.getKey(aChangeResponse.data);
											_oView.unbindObject();
											_oView.bindObject({
												path: "/" + l
											});
											if (window.history && window.history.replaceState) {
												window.history.replaceState(
													undefined, 
													undefined, 
													window.location.hash.replace(encodeURIComponent(that.sContext),
													encodeURIComponent(l)));
											}
											_oModel.refresh();
											resolve();
										} else if (aChangeResponse && aChangeResponse.response) {
											fnReject(aChangeResponse.message);
										} else if (!aChangeResponse && aBatchResponses.response) {
											fnReject(aBatchResponses.message);
										} else {
											_oModel.refresh();
											resolve();
										}
									},
									error: function (oError) {
										reject(new Error(oError.message));
									}
								});
							} else {
								resolve();
							}
						});
					}
				}.bind(this)).then(function (oResponse) {
					if (oResponse === false) {
						return false;
					} else {
						return new Promise(function (resolve) {
							var sAtMy = "";
							sAtMy = sAtMy === "default" ? undefined : sAtMy;
							sap.m.MessageToast.show("Pre-Registro Exitoso", {
								onClose: resolve,
								duration: 0 || 3e3,
								at: sAtMy,
								my: sAtMy
							});
						});
					}
				}.bind(this)).catch(function (oError) {
					if (oError !== undefined) {
						MessageBox.error(oError.message);
					}
				});
			},
			doNavigate: function (sVIewName, oBindingContext, resolve, sNavigationProperty) {
				var sPath = oBindingContext ? oBindingContext.getPath() : null;
				var oBCModel = oBindingContext ? oBindingContext.getModel() : null;
				var s;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						sPath = sPath.substring(1);
					}
					s = sPath.split("(")[0];
				}
				var a;
				var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;
				if (s !== null) {
					a = sNavigationProperty || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(s, sVIewName);
				}
				if (a !== null && a !== undefined) {
					if (a === "") {
						this.oRouter.navTo(sVIewName, {
							context: sPath,
							masterContext: sMasterContext
						}, false);
					} else {
						oBCModel.createBindingContext(a, oBindingContext, null, function (oResponse) {
							if (oResponse) {
								sPath = oResponse.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}
							if (sPath === "undefined") {
								this.oRouter.navTo(sVIewName);
							} else {
								this.oRouter.navTo(sVIewName, {
									context: sPath,
									masterContext: sMasterContext
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sVIewName);
				}
				if (typeof resolve === "function") {
					resolve();
				}
			},
			_onButtonPress1: function (oEvent) {
				oEvent = jQuery.extend(true, {}, oEvent);
				return new Promise(function (resolve) {
					resolve(true);
				}).then(function (oResponse) {
					var oBindingContext = oEvent.getSource().getBindingContext();
					return new Promise(function (resolve) {
						this.doNavigate("CabeceraOc", oBindingContext, resolve, "");
					}.bind(this));
				}.bind(this)).then(function (oResponse) {
					if (oResponse === false) {
						return false;
					} else {
						return new Promise(function (resolve) {
							var aKeys, oContext;
							var _oModel = this.oModel;
							if (_oModel && _oModel.hasPendingChanges()) {
								aKeys = Object.keys(_oModel["mChangedEntities"]);
								for (var tIndex = 0; tIndex < aKeys.length; tIndex++) {
									oContext = _oModel.getContext("/" + aKeys[tIndex]);
									if (oContext && oContext.bCreated) {
										_oModel.deleteCreatedEntry(oContext);
									}
								}
								_oModel.resetChanges();
							}
							resolve();
						}.bind(this));
					}
				}.bind(this)).then(function (oResponse) {
					if (oResponse === false) {
						return false;
					} else {
						return new Promise(function (resolve) {
							var sAtMy = "";
							sAtMy = sAtMy === "default" ? undefined : sAtMy;
							sap.m.MessageToast.show("No Guardado", {
								onClose: resolve,
								duration: 0 || 3e3,
								at: sAtMy,
								my: sAtMy
							});
						});
					}
				}.bind(this)).catch(function (oError) {
					if (oError !== undefined) {
						MessageBox.error(oError.message);
					}
				});
			},
			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("PoLine").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.oModel = this.getOwnerComponent().getModel();
			},
			formatNumber: function (sNumber) {
				jQuery.sap.require("sap.ui.core.format.NumberFormat");
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFormatOptions = {
					minIntegerDigits: 3,
					minFractionDigits: 2,
					maxFractionDigits: 2
					//groupingSeparator: ","
				};
				var oFloatInstance = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
				return oFloatInstance.format(sNumber).replace(/^\b0+\B/, "");
			},
			_handleMessagePopoverPress: function (oEvent) {
				if (!$._oMessagePopover.isOpen()) {
					$._oMessagePopover.openBy(oEvent.getSource());
				} else {
					$._oMessagePopover.close();
				}
			}
		});
	}, true);