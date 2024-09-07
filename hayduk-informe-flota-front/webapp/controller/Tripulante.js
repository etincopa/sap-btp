sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		//Tripulante
		handleTripulanteHelp: function (oEvent, that) {
			//var sInputValue = oEvent.getSource().getValue();
			that._Tripulante = oEvent.getSource().getId();
		

			if (!that._tripulanteDialog) {
				that._tripulanteDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Tripulante",
					that
				);
				that.getView().addDependent(that._tripulanteDialog);
			}

			if (that.Temporada) {
				that._tripulanteDialog.getBinding("items").filter([new Filter("Temporada", sap.ui.model.FilterOperator.Contains, that.Temporada)]);
			}
			
			// if (that.Matricula) {
			// 	that._tripulanteDialog.getBinding("items").filter([new Filter("Matricula", sap.ui.model.FilterOperator.Contains, that.Matricula)]);
			// }
			that._tripulanteDialog.open();

		},

		_handleTripulanteClose: function (oEvent) {

			var oTableTrip = this._byId("tblTripulacion");
			var oInpTripulante = this._byId(this._Tripulante);
			var oTxtNombre = this._byId(oInpTripulante.getAriaLabelledBy()[0]);
			var aTripulacion = oTableTrip.getBinding("items").oList;
			var aContexts = oEvent.getParameter("selectedContexts");
			var nIndex = oTableTrip.indexOfItem(oInpTripulante.getParent());

			if (aContexts && aContexts.length) {
				var oTripulante = aContexts[0].getObject();
               //console.log(oTripulante);
				if (aTripulacion.length) {
					var nPos = Util.secuencialSearch(aTripulacion, oTripulante.Dni, "Dni");
					if (nPos !== -1 && nIndex !== nPos) {
						sap.m.MessageBox.error(oTripulante.Dni + " : " + oTripulante.Nombre + " ya fue agregado");
						return false;
					}
				}

				oInpTripulante.setValue(oTripulante.Dni);
				oInpTripulante.setValueState(sap.ui.core.ValueState.None);
				oInpTripulante.setValueStateText("Entrada no válida");
				oTxtNombre.setText(oTripulante.Nombre);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		liveChangeTripulante: function (oEvent) {

		},

		handleTripulanteSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			var oFinalFilter=[];

			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Dni", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Cargo", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("CargoDesc", sap.ui.model.FilterOperator.Contains, sInputValue));
			
			oFinalFilter.push(new Filter({
				filters: aFilter,
				and: false
			}));
			
			if(this.Temporada){
				oFinalFilter.push(new Filter("Temporada", sap.ui.model.FilterOperator.Contains, this.Temporada));
			}
			// if (this.Matricula) {
			// 	oFinalFilter.push(new Filter("Matricula", sap.ui.model.FilterOperator.Contains, this.Matricula));
			// }
			
			this._tripulanteDialog.getBinding("items").filter(new Filter({
				filters: oFinalFilter,
				and: true
			}));
		},

		setTripulante: function (oInpTripulante, oTxtNombre, sState, sText, sValidationText) {
			oInpTripulante.setValueState(sState);
			oInpTripulante.setValueStateText(sValidationText);
			if (typeof sText !== "undefined") {
				oTxtNombre.setText(sText);
			}
		},

		onLiveChangeTripulante: function (oEvent, that) {
			var oTableTrip = that._byId("tblTripulacion");
			var sValue = oEvent.getParameter("value");
			var oInpTripulante = oEvent.getSource();
			var oTxtNombre = that._byId(oInpTripulante.getAriaLabelledBy()[0]);
			
			var aTripulantes = that.getJsonModel("TripulanteSet").getData().d.results;

			var aTripulacion = oTableTrip.getBinding("items").oList;
			var nIndex = oTableTrip.indexOfItem(oInpTripulante.getParent());
            
            if(sValue.length < 8){
               	this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.Error, "", "Entrada no válida");
               	return false;
            }
            
			//Validar que el tripulante exista
			if (aTripulantes.length) {
				var nPos = Util.binarySearch(aTripulantes, sValue, "Dni");
				if (nPos !== -1) {
					this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.None, undefined, "Entrada no válida");
					var oTripulante = aTripulantes[nPos];
					var sNombre = oTripulante.Nombre;
					//Validar no repetido
					nPos = Util.secuencialSearch(aTripulacion, sValue, "Dni");
					//console.log(oTripulante);
					if (nPos === -1) {
						this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.None, sNombre, "Entrada no válida");
					} else {
						if (nPos !== nIndex) {
							sap.m.MessageBox.error(oTripulante.Dni + " : " + oTripulante.Nombre + " ya fue agregado");
							this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.Error, "", "Entrada no válida");
							oInpTripulante.setValue("");
							
						} else {
							this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.None, sNombre, "Entrada no válida");
						}

					}
				} else {
					this.setTripulante(oInpTripulante, oTxtNombre, sap.ui.core.ValueState.Error, "", "Entrada no válida");

				}
			}
			//console.log(aTripulacion);
		}
	};
});