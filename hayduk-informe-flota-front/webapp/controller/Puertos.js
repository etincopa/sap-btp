sap.ui.define(["sap/ui/model/Filter",'Hayduk/InformeDeFlota/model/Util'], function (Filter,Util) {
	"use strict";
	return {
		//Puertos
		_handlePuertoClose: function (oEvent) {
			var oInpPuerto = this._byId(this._Puerto);
			var aContexts = oEvent.getParameter("selectedContexts");
			var oTxtPuerto = this._byId(oInpPuerto.getAriaLabelledBy()[0]);
			if (aContexts && aContexts.length) {
				oInpPuerto.setValueState(sap.ui.core.ValueState.None);
				var oPuerto = aContexts[0].getObject();
				oInpPuerto.setValue(oPuerto.Numero);
				oTxtPuerto.setText(oPuerto.Nombre);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handlePuertoSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter=[];
			aFilter.push(new Filter("Nombre",sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Numero",sap.ui.model.FilterOperator.Contains, sInputValue));
			
			this._puertoDialog.getBinding("items").filter(new Filter({filters:aFilter, and:false}));
		
		},

		handlePuertoHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this._Puerto = oEvent.getSource().getId();
			// create value help dialog
			if (!this._puertoDialog) {
				this._puertoDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Puerto",
					this
				);
				this.getView().addDependent(this._puertoDialog);
			}

			this._puertoDialog.open(sInputValue);
		},
		
		onLiveChangePuerto:function(oEvent){
			var oInpPuerto = oEvent.getSource();
			var oTxtPuerto = this._byId(oInpPuerto.getAriaLabelledBy()[0]);
			var sValue = oEvent.getParameter("value");
			if(sValue.length !== 3){
				oInpPuerto.setValueState(sap.ui.core.ValueState.Error);
				oTxtPuerto.setText("");
			}else{
				var oPuerto = this.puertos.getPuertoTxt(sValue,this);
				if(oPuerto.Puerto){
					oInpPuerto.setValueState(sap.ui.core.ValueState.None);
					oInpPuerto.setValue(oPuerto.Puerto.Numero);
					oTxtPuerto.setText(oPuerto.Puerto.Nombre);
				}else{
					oInpPuerto.setValueState(sap.ui.core.ValueState.Error);
					oTxtPuerto.setText("");
				}
			}
		},
		
		getPuertoTxt:function(sNumero,that){
		   var oReturn = {
		   	   nPos:-1,
		   	   Puerto:undefined
		   };	
		   var aPuertos = that.getJsonModel("PuertoSet").getData().d.results;
		   oReturn.nPos = Util.binarySearch(aPuertos,sNumero,"Numero");
		   if(oReturn.nPos!== -1) oReturn.Puerto = aPuertos[oReturn.nPos];
		   
		   return oReturn;
		}
	};
});