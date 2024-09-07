sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		//Centros
		handleCentroHelp: function (oEvent) {
			var that = this;
			this._Centro = oEvent.getSource().getId();
			var sInputValue = oEvent.getSource().getValue();
			// create value help dialog
			if (!this._centroDialog) {
				this._centroDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Centros",
					this
				);
				this.getView().addDependent(this._centroDialog);
			}
			this._centroDialog.setModel(that.getView().getModel("CentroSet"));

			this._centroDialog.open(sInputValue);
		},

		_handleCentroClose: function (oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("selectedItem");
			
			//Agregue las variables
			var bVerify = false;
			var oModelListRsw = this.getOwnerComponent().getModel("listRsw");
			var oDataListRsw = JSON.parse(oModelListRsw.getJSON());
			/////////////////////////////////////////////////////////////////77
           
			if (oSelectedItem) {
				//console.log(oSelectedItem);
				var oCentro = oSelectedItem.getBindingContext().getObject();
				this._byId(that._Centro).setSelectedKey(oSelectedItem.getDescription());
				this._byId(that._Centro).setValueState(sap.ui.core.ValueState.None);
				//alert(that._Centro);
				if(!that._Centro.includes("inpCentroDescarga") && !that._Centro.includes("inpCentroSearch")){
					this.getJsonModel("InformeFlota").setProperty("/Matricula", oCentro.Matricula);
					this._byId("inpMatricula").fireSubmit();
				}
			}
			
			//Recorre y compara con la lista rsw para mostrar la pestaña RSW
				$.each(oDataListRsw.listRsw, function(key, value){
					if (oCentro.Identificador === value){
						bVerify = true;
						return false
					}
				});
				
				
				if(bVerify){
					this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", true);
				}else{
					this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", false);
				}
			///////////////////////////////////////////////////////////////////////////////
			this.byId("cbxTipoRed").fireSelectionChange();
			
			oEvent.getSource().getBinding("items").filter([]);
		},

		_handleCentroSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._centroDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},
		//Centro de descarga
		handleDescargaHelp: function (oEvent) {
			var that = this;
			this._Centro = oEvent.getSource().getId();
			var sInputValue = oEvent.getSource().getValue();
			// create value help dialog
			if (!this._centroDialog) {
				this._centroDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Centros",
					this
				);
				this.getView().addDependent(this._centroDialog);
			}
			this._centroDialog.setModel(that.getView().getModel("CentroDescargaSet"));

			this._centroDialog.open(sInputValue);
		},

		suggestionCenterSelected: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oInpCentro = oEvent.getSource();
				oInpCentro.setValueState(sap.ui.core.ValueState.None);
				var oCentro = oEvent.getParameter("selectedItem").getBindingContext("CentroSet").getObject();
				if (oCentro.Matricula) {
					this.getJsonModel("InformeFlota").setProperty("/Matricula", oCentro.Matricula);
					this._byId("inpMatricula").fireSubmit();
				}
				//console.log(oCentro);
			}
		},
		onChangeCentro: function (oEvent) {
			var sCentro = oEvent.getSource().getSelectedKey();
			var bVerify = false;
			var oModelListRsw = this.getOwnerComponent().getModel("listRsw");
			var oDataListRsw = JSON.parse(oModelListRsw.getJSON());
			
			$.each(oDataListRsw.listRsw, function(key, value){
				if (sCentro === value){
					bVerify = true;
					return false
				}
			});
			
			if(bVerify){
				this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", true);
			}else{
				this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", false);
			}
		},
		onLiveChangeCentro: function (oEvent) {
			Util.toUpperCase(oEvent);
			var oInpCentro = oEvent.getSource();
			var sCentro = oEvent.getParameter("value").toUpperCase();
			if (sCentro.length === 4) {
				oInpCentro.setValueState(sap.ui.core.ValueState.None);
				var aCentros = this.getJsonModel("CentroSet").getData().d.results;
				if (aCentros.length > 0) {
					var nPos = Util.binarySearch(aCentros, sCentro, "Identificador");
					var oModelListRsw = this.getOwnerComponent().getModel("listRsw");
					var oDataListRsw = JSON.parse(oModelListRsw.getJSON());
					var bVerify = false;
					//Recorre y compara con la lista rsw para mostrar la pestaña RSW
					$.each(oDataListRsw.listRsw, function(key, value){
						if (sCentro === value){
							bVerify = true;
							return false
						}
					});
					
					if(bVerify){
						this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", true);
					}else{
						this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", false);
					}
					////////////////////////////////////////////////////////////////////
					if (nPos !== -1) {
						oInpCentro.setValueState(sap.ui.core.ValueState.None);
						this.getJsonModel("InformeFlota").setProperty("/Centro", aCentros[nPos].Identificador);
						var nMatricula = aCentros[nPos].Matricula;
						this.getJsonModel("InformeFlota").setProperty("/Matricula", nMatricula);
						this._byId("inpMatricula").fireSubmit();
					} else {
						oInpCentro.setValueState(sap.ui.core.ValueState.Error);
					}
				}
			} else {
				oInpCentro.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		
		oLiveChangeCentroDescarga:function(oEvent){
				Util.toUpperCase(oEvent);
			var oInpCentro = oEvent.getSource();
			var sCentro = oEvent.getParameter("value").toUpperCase();
			if (sCentro.length === 4) {
				oInpCentro.setValueState(sap.ui.core.ValueState.None);
				var aCentros = this.getJsonModel("CentroDescargaSet").getData().d.results;
				if (aCentros.length > 0) {
					var nPos = Util.binarySearch(aCentros, sCentro, "Identificador");
					if (nPos !== -1) {
						oInpCentro.setValueState(sap.ui.core.ValueState.None);
						this.getJsonModel("InformeFlota").setProperty("/CentroDescarga", aCentros[nPos].Identificador);
					
					} else {
						oInpCentro.setValueState(sap.ui.core.ValueState.Error);
					}
				}
			} else {
				oInpCentro.setValueState(sap.ui.core.ValueState.Error);
			}
		}
	};
});