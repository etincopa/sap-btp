sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		//Especie

		handleEpecieHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this._Especie = oEvent.getSource().getId();
			if (!this._especieDialog) {
				this._especieDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Especie",
					this
				);
				this.getView().addDependent(this._especieDialog);
			}

			this._especieDialog.open(sInputValue);
		},

		_handleEspecieClose: function (oEvent) {

			var oInpEspecie = this._byId("inpEspecie");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sTipoInforme = this.getJsonModel("InformeFlota").getProperty("/Tipo");

			if (oSelectedItem) {
				this._byId(this._Especie).setSelectedKey(oSelectedItem.getDescription());
				oInpEspecie.setValueState(sap.ui.core.ValueState.None);

				if (sTipoInforme === "M" || sTipoInforme === "T") {
					this._byId("inpMatricula").setEditable(true);
				}
			}
			this.byId("cbxTipoRed").fireSelectionChange();

			oEvent.getSource().getBinding("items").filter([]);

		},

		_handleEspecieSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._especieDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		onLiveChangeEspecie: function (oEvent) {
			Util.toUpperCase(oEvent);
			var oInpEspecie = oEvent.getSource();
			var sEspecie = oEvent.getParameter("value");
			var aEspecies = this.getJsonModel("EspecieSet").getData().d.results;
			var sTipoInforme = this.getJsonModel("InformeFlota").getProperty("/Tipo");

			//console.log(aEspecies);
			if (aEspecies.length > 0) {
				var nPos = Util.binarySearch(aEspecies, sEspecie, "Identificador");
				if (nPos !== -1) {
					//console.log(aEspecies[nPos]);
					oInpEspecie.setValueState(sap.ui.core.ValueState.None);
					this.getJsonModel("InformeFlota").setProperty("/Especie", aEspecies[nPos].Identificador);
					if (sTipoInforme === "M" || sTipoInforme === "T") {
						this._byId("inpMatricula").setEditable(true);
					}

				} else {
					oInpEspecie.setValueState(sap.ui.core.ValueState.Error);
				}
			}

		},

		suggestionEspecieSelected: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oInpEspecie = oEvent.getSource();
				oInpEspecie.setValueState(sap.ui.core.ValueState.None);

			}
		},

		//Especie combo
		handleEpecieComboHelp: function (oEvent, that) {
			var sInputValue = oEvent.getSource().getValue();
			that._EspecieCombo = oEvent.getSource().getId();
			if (!that._especieComboDialog) {
				that._especieComboDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.EspecieCombo",
					that
				);
				that.getView().addDependent(that._especieComboDialog);
			}

			that._especieComboDialog.open(sInputValue);
		},

		_handleEspecieComboClose: function (oEvent) {
			var oInpEspecie = this._byId(this._EspecieCombo);
			var oTxtDescripcion = this._byId(oInpEspecie.getAriaLabelledBy()[0]);
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				var oEspecie = oSelectedItem.getBindingContext("EspecieComboSet").getObject();
				oInpEspecie.setValue(oEspecie.Identificador);
				oTxtDescripcion.setText(oEspecie.Nombre);
				oInpEspecie.setValueState(sap.ui.core.ValueState.None);
			}

			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleEspecieComboSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._especieComboDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		onLiveChangeEspecieCombo: function (oEvent, that) {
			Util.toUpperCase(oEvent);
			var oInpEspecie = oEvent.getSource();
			var oTxtDescripcion = that._byId(oInpEspecie.getAriaLabelledBy()[0]);
			var sEspecie = oEvent.getParameter("value");
			var aEspecies = that.getJsonModel("EspecieComboSet").getData().d.results;

			//console.log(aEspecies);
			if (aEspecies.length > 0) {
				var nPos = Util.binarySearch(aEspecies, sEspecie, "Identificador");
				if (nPos !== -1) {
					//console.log(aEspecies[nPos]);
					var oEspecie = aEspecies[nPos];

					oInpEspecie.setValueState(sap.ui.core.ValueState.None);
					oInpEspecie.setValue(oEspecie.Identificador);
					oTxtDescripcion.setText(oEspecie.Nombre);

				} else {
					oInpEspecie.setValueState(sap.ui.core.ValueState.Error);
					oTxtDescripcion.setText("");
				}
			}
		}

	};
});