sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		//Matrícula
		handleMatriculaHelp: function (oEvent) {

			var sInputValue = oEvent.getSource().getValue();
			this._Matricula = oEvent.getSource().getId();
			// create value help dialog
			if (!this._matriculaDialog) {
				this._matriculaDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Matricula",
					this
				);
				this.getView().addDependent(this._matriculaDialog);
			}

			this._matriculaDialog.open(sInputValue);
		},

		_handleMatriculaClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				if (this._Matricula === "inpSearchMatricula") {
					this._byId(this._Matricula).setValue(aContexts[0].getObject().Numero);
				} else {
					var oMatricula = aContexts[0].getObject();
					this.getJsonModel("InformeFlota").setProperty("/Matricula", oMatricula.Numero);
					this.getJsonModel("InformeFlota").setProperty("/Embarcacion", oMatricula.Nombre);

					//Sugerir tripulantes
					this.matriculas.sugerirTripulantes(oMatricula.Numero, this);
					//Establecer temporada
					this.matriculas.setTemporada(oMatricula.Numero, this);
				}

			}
			this._byId(this._Matricula).setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleMatriculaSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];

			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Numero", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._matriculaDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		sugerirTripulantes: function (nMatricula, that) {
			var aData = {
				d: {
					results: []
				}
			};
			var aTripPropuestos = Util.deepCloneArray(that.getJsonModel("TripPropuestaSet").getData().d.results);
			//console.log(aTripPropuestos);
			if (aTripPropuestos.length > 0) {

				var nPosMatri = Util.findFirstIndex(aTripPropuestos, nMatricula, "Matricula");
				//console.log(nPosMatri);
				if (nPosMatri >= 0) {
					for (var i = nPosMatri; aTripPropuestos.length > i; i++) {
						if (aTripPropuestos[i].Matricula === nMatricula) {
							aData.d.results.push(aTripPropuestos[i]);
						} else {
							break;
						}
					}
				}
				//console.log(aTripPropuestos);
				//console.log(aData)
				Util.sortObjectArray(aData.d.results, "Numero");
				that.cleanModel("TripulacionSet");
				that.setDataModel("TripulacionSet", aData);
				//console.log(this.getJsonModel("TripulacionSet"));
				that._byId("tblTripulacion").getBinding("items").filter([new Filter(
					"Matricula",
					sap.ui.model.FilterOperator.Contains, nMatricula)]);
			}
		},

		setTemporada: function (nMatricula, that) {
			var aMatriTemporada = that.getJsonModel("MatriTemporadaSet").getData().d.results,
				oMatriTemporada;

			if (aMatriTemporada.length) {
				var nPos = Util.binarySearch(aMatriTemporada, nMatricula, "Matricula");
				if (nPos !== -1) {
					oMatriTemporada = aMatriTemporada[nPos];
					that.Temporada = oMatriTemporada.Temporada;
					// that.Matricula = nMatricula;
				}
			}
		},

		onLiveChangeMatricula: function (oEvent) {
			var oInpMatricula = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var aMatriculas = this.getJsonModel("MatriculaSet").getData().d.results;
			var nPos = -1;

			if (aMatriculas.length) {
				nPos = Util.binarySearch(aMatriculas, sValue, "Numero");
				var oMatricula = aMatriculas[nPos];
				if (nPos !== -1) {
					oInpMatricula.setValueState(sap.ui.core.ValueState.None);
					this.getJsonModel("InformeFlota").setProperty("/Matricula", oMatricula["Numero"]);
					this.getJsonModel("InformeFlota").setProperty("/Embarcacion", oMatricula["Nombre"]);
					this.getJsonModel("InformeFlota").setProperty("/Capacidad", oMatricula["CapTM"]);

					//Sugerir tripulantes
					this.matriculas.sugerirTripulantes(oMatricula.Numero, this);

					//Establecer temporada
					this.matriculas.setTemporada(oMatricula.Numero, this);
				} else {
					oInpMatricula.setValueState(sap.ui.core.ValueState.Error);
					this.getJsonModel("InformeFlota").setProperty("/Embarcacion", "");
				}
			}
		},

		onSubmitMatricula: function (oEvent) {
			var aMatriculas = this.getJsonModel("MatriculaSet").getData().d.results;
			var oMatricula = null;
			var nPos = Util.binarySearch(aMatriculas, oEvent.getSource().getValue(), "Numero");
			
			var oMatricula = aMatriculas.find(oPosition => oPosition.Numero == oEvent.getSource().getValue());

			// if (nPos !== -1) {
			if (oMatricula !== undefined) {
				//console.log(aMatriculas[nPos]);
				// oMatricula = aMatriculas[nPos];
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				this.getJsonModel("InformeFlota").setProperty("/Matricula", oMatricula["Numero"]);
				this.getJsonModel("InformeFlota").setProperty("/Embarcacion", oMatricula["Nombre"]);
				this.getJsonModel("InformeFlota").setProperty("/Capacidad", oMatricula["CapTM"]);

				this.matriculas.sugerirTripulantes(oMatricula.Numero, this);

				//Establecer temporada
				this.matriculas.setTemporada(oMatricula.Numero, this);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				this.getJsonModel("InformeFlota").setProperty("/Embarcacion", "");
			}
		}

	};
});