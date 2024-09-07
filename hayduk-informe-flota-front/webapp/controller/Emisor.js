sap.ui.define(["sap/ui/model/Filter",'Hayduk/InformeDeFlota/model/Util'], function (Filter,Util) {
	"use strict";
	return {
		//Emisor
		handleEmisorHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this._Emisor = oEvent.getSource().getId();
			// create value help dialog
			if (!this._emisorDialog) {
				this._emisorDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Emisor",
					this
				);
				this.getView().addDependent(this._emisorDialog);
			}

			this._emisorDialog.open(sInputValue);
		},

		_handleEmisorClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var that = this;
			if (aContexts && aContexts.length) {
				var emisor = aContexts[0].getObject();
				that.getJsonModel("InformeFlota").setProperty("/Emisor", emisor.Numero);
				that._byId("feTxtEmisor").setVisible(true);
			    that._byId("txtEmisor").setText(emisor.Nombre);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleEmisorSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter=[];
			aFilter.push(new Filter("Nombre",sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Numero",sap.ui.model.FilterOperator.Contains, sInputValue));
			
			this._emisorDialog.getBinding("items").filter(new Filter({filters:aFilter, and:false}));
		},
		
		onSubmitEmisor:function(oEvent){
        	var aEmisor = this.getJsonModel("EmisorSet").getData().d.results;
        	var nPos = Util.binarySearch(aEmisor,oEvent.getSource().getValue(),"Numero");
        	if(nPos !== -1){
        		oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
        		this.getJsonModel("InformeFlota").setProperty("/Emisor",aEmisor[nPos]["Numero"] );
        		this._byId("feTxtEmisor").setVisible(true);
			    this._byId("txtEmisor").setText(aEmisor[nPos]["Nombre"]);
        	
        	}else{
        		oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
        	   	this._byId("feTxtEmisor").setVisible(false);
			    this._byId("txtEmisor").setText("");
        	}
        }

	};
});