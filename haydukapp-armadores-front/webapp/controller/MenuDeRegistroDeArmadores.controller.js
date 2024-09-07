sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, Utilities) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.MenuDeRegistroDeArmadores", {
		onInit: function() {
			var _this = this;

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("MenuDeRegistroDeArmadores").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			if (!$._sGroup || $._sGroup === "") {
				sap.m.MessageBox.confirm("Regresará al menú principal", {
					title: "Retorno al menú principal",
					actions: ["Regresar"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Regresar" || !sActionClicked) {
							_this.oRouter.navTo("MenuPrincipal");
						}
					}
				});
				return;
			}
		},

		onAfterRendering: function() {
			var tileContainer = this.getView().byId("tileContainer");
			var oBinding = tileContainer.getBinding("tiles");
			if (oBinding) {
				oBinding.refresh(true);
			}
			var _this = this;
			if ($._sLoginUser === "" || !$._sLoginUser) {
				sap.m.MessageBox.confirm("Regresará al menú principal", {
					title: "Retorno al menú principal",
					actions: ["Regresar"],
					onClose: function(sActionClicked) {
						if (sActionClicked === "Regresar" || !sActionClicked) {
							_this.oRouter.navTo("MenuPrincipal");
						}
					}
				});
			}
		},
		handleRouteMatched: function(oEvent) {
			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				if (this.sContext) {
					//
				}
			}
		},
		_onTilePress: function(oEvent) {
			var title = oEvent.getSource().getTitle();
			if (title.substr(0, 1) === "C") {
				this._onTileAprobadorPress(oEvent);
			} else {
				this._onTileSolicitantePress(oEvent);
			}
		},

		_onTileSolicitantePress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				this.doNavigate("BuscarArmador", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onTileAprobadorPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				this.doNavigate("AprobacionDeSolicitudesEmbarcaciones", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},

		_onBackButtonPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				this.doNavigate("MenuPrincipal", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		}
	});
}, /* bExport= */ true);