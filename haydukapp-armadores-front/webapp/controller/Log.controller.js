sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.Log", {
		handleRouteMatched: function(oEvent) {
			var oParams = {};
			var oView = this.getView();
			this.oView = oView;

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					oView.bindObject(oPath);
				}
			}

		},
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
		_onEditPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			if (oBindingContext === undefined) {
				this.oRouter.navTo("BuscarArmador", {}, true);
				return;
			}

			var oObject = oBindingContext.getObject();
			var sPath = oBindingContext.getPath().substring(1).replace("ShipownerRejectedSet", "ShipownerSet");

			if (oObject.Origin === "S") {
				this.oRouter.navTo("RegistroDeEmbarcaciones", {
					context: sPath
				});
			} else {
				this.oRouter.navTo("RegistroDeArmadores", {
					context: sPath
				});
			}
		},

		_onApprovePress: function() {
			sap.m.MessageBox.confirm("Desea enviar para creación", {
				title: "",
				actions: ["Si", "No"],
				onClose: function(sActionClicked) {
					if (sActionClicked === "Si") {
						sap.m.MessageToast.show("Enviado para creación");
					}
				}
			});
		},
		_onNavBack: function(oEvent) {
			this.oRouter.navTo("BuscarArmador", {
				context: ""
			});
		},
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Log").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		}
	});
}, /* bExport= */ true);