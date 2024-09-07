sap.ui.define(["sap/ui/model/Filter",'Hayduk/InformeDeFlota/model/Util'], function (Filter,Util) {
	"use strict";
	return {
		//Clientes
		handleClienteHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			
			// create value help dialog
			if (!this._clienteDialog) {
				this._clienteDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Cliente",
					this
				);
				this.getView().addDependent(this._clienteDialog);
			}
		
			this._clienteDialog.open(sInputValue);
		},

		_handleClienteClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var that = this;
			if (aContexts && aContexts.length) {
				var cliente = aContexts[0].getObject();
				that.getJsonModel("InformeFlota").setProperty("/Cliente", cliente.Numero);
				that._byId("feTxtCliente").setVisible(true);
			    that._byId("txtCliente").setText(cliente.Nombre);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleClienteSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
				var aFilter = [];
			
			aFilter.push(new Filter("Nombre",sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Numero",sap.ui.model.FilterOperator.Contains, sInputValue));
			
			this._clienteDialog.getBinding("items").filter(new Filter({filters:aFilter, and:false}));
		},
		
		 onSubmitCliente:function(oEvent){
        	var aClientes = this.getJsonModel("ClienteSet").getData().d.results;
        	var nPos = Util.binarySearch(aClientes,oEvent.getSource().getValue(),"Numero");
        	if(nPos !== -1){
        		oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
        		this.getJsonModel("InformeFlota").setProperty("/Cliente",aClientes[nPos]["Numero"] );
        		this._byId("feTxtCliente").setVisible(true);
			    this._byId("txtCliente").setText(aClientes[nPos]["Nombre"]);
        	
        	}else{
        		oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
        	   	this._byId("feTxtCliente").setVisible(false);
			    this._byId("txtCliente").setText("");
        	}
        }

	};
});