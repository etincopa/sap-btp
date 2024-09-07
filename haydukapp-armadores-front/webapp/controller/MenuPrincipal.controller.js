sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities"
], function(BaseController, MessageBox, Utilities) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.MenuPrincipal", {
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("MenuPrincipal").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			//$._bState = false; // TODO: Test only

			var oComponent = this.getOwnerComponent();
			this.Component = oComponent;
			var main = oComponent.getModel();
			var pp = oComponent.getModel("odatamodelpp");
			var tileAprobador = oComponent.getModel("tileAprobador");
			this.tileAprobador = tileAprobador;
			var tileSolicitante = oComponent.getModel("tileSolicitante");
			this.tileSolicitante = tileSolicitante;

			Utilities.getUserPermissions().then(function(sGroup) {
				$._sGroup = sGroup;
				oComponent.fireEvent("userinit");
				if (sGroup === "Armadores_Solicitante") {
					oComponent.setModel(main);
					oComponent.setModel(tileSolicitante, "tiles");
				} else {
					oComponent.setModel(pp);
					oComponent.setModel(tileAprobador, "tiles");
				}
			}).catch(function(sMessage) {
				// // Test borrar
				// oComponent.setModel(main);
				// oComponent.setModel(tileAprobador, "tiles");
				// // Test borrar
				MessageBox.error(sMessage);
			});

			// // borrar
			// var oNotifInfo = {
			// 	TypeKey: "NewRequestTypeKey",
			// 	Request: "00000050",
			// 	Ruc: "212315412",
			// 	BusinessName: ""
			// };

			// Utilities._sendPushNotification(['DAVIDN'], 'Liberación 12031249214', this, false, oNotifInfo);
		},

		handleRouteMatched: function(oEvent) {
			var oParams = {},
				oPath;

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			}

			var sParams = this.getMyComponent().getComponentData().startupParameters;
			var oRouter = this.oRouter;

			function doNavigate() {
				if (sParams) {
					if (sParams.Type && (sParams.Type[0] === "A" || sParams.Type[0] === "R")) {
						setTimeout(function() {
							oRouter.navTo(sParams.Type[0] === "A" ? "AprobacionDeSolicitudesEmbarcaciones" : "BuscarArmador", {
								context: '{"Ruc":"' + sParams.Ruc[0] + '","RequestNr":"' + sParams.RequestNr[0] + '"}'
							});
						}, 100);
					}
				}
			}
			if ($._sLoginUser) {
				doNavigate();
			} else {
				this.Component.attachEventOnce("userinit", function() {
					doNavigate();
//					Utilities._sendPushNotification([$._sLoginUser], "", this, $._sGroup === "Armadores_Solicitante" ? true : false); //update icon badge counter for current user
				});
			}
		},
		getMyComponent: function() {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		// _onSwitchChange: function(oEvent) { // TODO: Test only
		// 	if (oEvent.getParameters().state) {
		// 		//$._bState = true;
		// 		this.Component.setModel(this.Component.getModel("tileAll"), "tiles");
		// 	} else {
		// 		//$._bState = false;
		// 		if ($._sGroup === "hayduksolicitante") {
		// 			this.Component.setModel(this.tileSolicitante, "tiles");
		// 		} else {
		// 			this.Component.setModel(this.tileAprobador, "tiles");
		// 		}
		// 	}
		// },

		_onTilePress: function(oEvent) {
			this.oRouter.navTo("MenuDeRegistroDeArmadores", {
				context: "init"
			});
		}
	});
}, /* bExport= */ true);