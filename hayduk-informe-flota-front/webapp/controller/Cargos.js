sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		//Tripulante
		handleCargoHelp: function (oEvent, that) {
			var sInputValue = oEvent.getSource().getValue();
			that._Cargo = oEvent.getSource().getId();

			//Variables para verificar la especie/////////////////////////////////////////////
			var bVerify = false;
			var oModelListEspecie = that.getOwnerComponent().getModel("listEspecie");
			var oDataListEspecie = JSON.parse(oModelListEspecie.getJSON());
			/////////////////////////////////////////////////////////////////

			if (!that._cargoDialog) {
				that._cargoDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Cargo",
					that
				);
				that.getView().addDependent(that._cargoDialog);
			}
			////Estoy Agregando Una Condicional	para verificar la especie y setear el dialogo ///////////////////

			var select = that.byId("inpEspecie").getValue();
			if (select != "") {
				select = select.split(")")[0];
				select = select.split("(")[1];
			}

			$.each(oDataListEspecie.listEspecie, function (key, value) {
				if (select === value) {
					bVerify = true;
					return false;
				}
			});
			
			var aCargos = Util.deepCloneArray(that.getJsonModel("CargoSet").getData());

			if (bVerify) {
				Util.sortObjectArray(aCargos.d.results, "Nombre");

				that._cargoDialog.setModel(new sap.ui.model.json.JSONModel(aCargos), "CargoAlfaSet");

				that._cargoDialog.open(sInputValue);
			} else {
				//Elimino los arreglos de jefe de cubierta(4) y piloto de helicoptero(5) 
				delete aCargos.d.results[4];
				delete aCargos.d.results[5];

				Util.sortObjectArray(aCargos.d.results, "Nombre");

				that._cargoDialog.setModel(new sap.ui.model.json.JSONModel(aCargos), "CargoAlfaSet");

				that._cargoDialog.open(sInputValue);
			}
			////////////////////////////////////////////////////////////////////////////////////////////

		},

		_handleCargoClose: function (oEvent) {
			var that = this;
			var oReturn = {};
			var oInpCargo = that._byId(that._Cargo);
			var oTxtNombre = that._byId(oInpCargo.getAriaLabelledBy()[0]);
			var aTripulacion = that._byId("tblTripulacion").getBinding("items").oList;
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {
				var oCargo = aContexts[0].getObject();

				if (oCargo.Identificador === "PA1" || oCargo.Identificador === "PR1" || oCargo.Identificador === "PR2") {
					oReturn = this.cargos.validarPatron(aTripulacion);
					if (!oReturn.bPatron && oReturn.nPos !== -1) {
						sap.m.MessageBox.error("No puede haber mas de un Patrón por Embarcación");

					} else {
						oInpCargo.setValue(oCargo.Identificador);
						oInpCargo.setValueState(sap.ui.core.ValueState.None);
						oTxtNombre.setText(oCargo.Nombre);
						oInpCargo.getParent().addStyleClass("patronPrincipal");
					}
				} else if (oCargo.Identificador === "PA2" || oCargo.Identificador === "PS1" || oCargo.Identificador === "PS2") {
					oReturn = this.cargos.validaPatronSecundario(aTripulacion);
					if (!oReturn.bPatron && oReturn.nPos !== -1) {
						sap.m.MessageBox.error("No puede haber mas de un Segundo Patrón por Embarcación");

					} else {
						oInpCargo.setValue(oCargo.Identificador);
						oInpCargo.setValueState(sap.ui.core.ValueState.None);
						oTxtNombre.setText(oCargo.Nombre);
						oInpCargo.getParent().addStyleClass("patronSecundario");
					}
				} else {
					oInpCargo.setValue(oCargo.Identificador);
					oTxtNombre.setText(oCargo.Nombre);
					oInpCargo.setValueState(sap.ui.core.ValueState.None);
					oInpCargo.getParent().removeStyleClass("patronPrincipal");
					oInpCargo.getParent().removeStyleClass("patronSecundario");
				}

			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleCargoSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];

			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));
			this._cargoDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		onLiveChangeCargo: function (oEvent, that) {
			Util.toUpperCase(oEvent);
			var oTableTrip = that._byId("tblTripulacion");
			var oInpCargo = oEvent.getSource();
			var sValue = oEvent.getParameter("value").toUpperCase();
			var oTxtCargo = that._byId(oInpCargo.getAriaLabelledBy()[0]);
			var aTripulacion = oTableTrip.getBinding("items").oList;
			var nIndex = oTableTrip.indexOfItem(oInpCargo.getParent());
			var oCargo = {},
				oReturn;

			if (sValue.length === 3) {
				if (!that.aCargos) {
					that.aCargos = Util.deepCloneArray(that.getJsonModel("CargoSet").getData().d.results);
					Util.sortObjectArray(that.aCargos, "Identificador");
				}

				if (that.aCargos.length) {
					//console.log(aCargos);
					var nPos = Util.binarySearch(that.aCargos, sValue, "Identificador");
					//console.log(sValue);
					if (nPos === -1) {
						oInpCargo.setValueState(sap.ui.core.ValueState.Error);
						oTxtCargo.setText("");
					} else {
						oCargo = that.aCargos[nPos];

						if (sValue === "PA1" || sValue === "PR1" || sValue === "PR2") {
							oReturn = this.validarPatron(aTripulacion);
							if (!oReturn.bPatron && oReturn.nPos !== nIndex && oReturn.nPos !== -1) {
								sap.m.MessageBox.error("No puede haber mas de un Patrón por Embarcación");
								oInpCargo.setValue("");
								oTxtCargo.setText("");
							} else {
								oInpCargo.setValueState(sap.ui.core.ValueState.None);
								oTxtCargo.setText(oCargo.Nombre);
								oInpCargo.getParent().addStyleClass("patronPrincipal");
							}
						} else if (sValue === "PA2" || sValue === "PS1" || sValue === "PS2") {
							oReturn = this.validaPatronSecundario(aTripulacion);
							if (!oReturn.bPatron && oReturn.nPos !== nIndex && oReturn.nPos !== -1) {
								sap.m.MessageBox.error("No puede haber mas de un Segundo Patrón por Embarcación");
								oInpCargo.setValue("");
								oTxtCargo.setText("");
							} else {
								oInpCargo.setValueState(sap.ui.core.ValueState.None);
								oTxtCargo.setText(oCargo.Nombre);
								oInpCargo.getParent().addStyleClass("patronSecundario");
							}

						} else {
							oInpCargo.setValueState(sap.ui.core.ValueState.None);
							oTxtCargo.setText(oCargo.Nombre);
							oInpCargo.getParent().removeStyleClass("patronPrincipal");
							oInpCargo.getParent().removeStyleClass("patronSecundario");
						}
					}
				}
			} else {
				oTxtCargo.setText("");
				oInpCargo.setValueState(sap.ui.core.ValueState.Error);
				oInpCargo.getParent().removeStyleClass("patronPrincipal");
				oInpCargo.getParent().removeStyleClass("patronSecundario");
			}
		},

		validarPatron: function (aTripulacion) {

			var oReturn = {
				nPos: -1,
				bPatron: true
			};

			for (var i = 0; aTripulacion.length > i; i++) {
				if (aTripulacion[i].Cargo === "PA1" || aTripulacion[i].Cargo === "PR1" || aTripulacion[i].Cargo === "PR2") {
					oReturn.nPos = i;
					oReturn.bPatron = false;
					break;
				}
			}
			return oReturn;
		},

		validaPatronSecundario: function (aTripulacion) {
			var oReturn = {
				nPos: -1,
				bPatron: true
			};

			for (var i = 0; aTripulacion.length > i; i++) {
				if (aTripulacion[i].Cargo === "PA2" || aTripulacion[i].Cargo === "PS1" || aTripulacion[i].Cargo === "PS2") {
					oReturn.nPos = i;
					oReturn.bPatron = false;
					break;
				}
			}
			return oReturn;
		}
	};
});