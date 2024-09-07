sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.proyectoScp.controller.BuscarArmador", {
		onInit: function() {
			this.Router = sap.ui.core.UIComponent.getRouterFor(this);
			this.Router.getTarget("BuscarArmador").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
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

		handleRouteMatched: function(oEvent) {
			var sContext = oEvent.mParameters.data.context;
			var oTable = this.getView().byId("tblRejected");
			var oBinding = oTable.getBinding("items");

			if (!oBinding) {
				return;
			}

			if ($._sLoginUser !== undefined && oBinding.aFilters.length === 0) {
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, $._sLoginUser));

				if (sContext && sContext.indexOf("Ruc") > 0) {
					var oContext = JSON.parse(sContext);
					if (typeof oContext === "object") {
						this.getView().byId("searchFieldRejected").setValue(oContext.Ruc);
						aFilters.push(new sap.ui.model.Filter("Ruc", sap.ui.model.FilterOperator.EQ, oContext.Ruc));
						this.getView().byId("iconTabBar").setSelectedKey("keyRejected");
					}
				}

				oBinding.filter(aFilters);
			}
			oBinding.refresh();
		},
		onItemPress: function(oEvent) {
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			this.Router.navTo("RegistroDeEmbarcaciones", {
				context: oBindingContext.getPath().substring(1)
			});
		},

		onCrearArmadorPress: function(oEvent) {
			this.Router.navTo("RegistroDeArmadores");
		},

		onLogPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			this.Router.navTo("Log", {
				context: oBindingContext.getPath().substring(1)
			});
		},

		onSearchExistent: function(oEvent) {
			var aFilters = [],
				sQuery = oEvent.getParameter("query"),
				oTable = this.getView().byId("lstExist");

			this.handleSearch(sQuery, oTable, aFilters);
		},

		onSearchRejected: function(oEvent) {
			var aFilters = [],
				sQuery = oEvent.getParameter("query"),
				oTable = this.getView().byId("tblRejected"),
				oFilter = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, $._sLoginUser);

			aFilters.push(oFilter);
			this.handleSearch(sQuery, oTable, aFilters);
		},

		handleSearch: function(sQuery, oTable, aFilters) {
			var oFilter, oBinding;

			oFilter = new sap.ui.model.Filter("Ruc", sap.ui.model.FilterOperator.EQ, sQuery);
			aFilters.push(oFilter);

			oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},

		onNavBack: function(oEvent) {
			var oSearch = this.byId("searchCombo");
			oSearch.setValue("");
			var oBinding;
			var aFilters = [];
			var oTable = this.getView().byId("lstExist");

			oBinding = oTable.getBinding("items");

			if (oBinding !== undefined) {
				oBinding.filter(aFilters);
			}

			this.Router.navTo("MenuDeRegistroDeArmadores", {}, true);
		}
	});
}, /* bExport= */ true);