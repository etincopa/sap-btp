sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {

		onPressObservaciones: function (oEvent) {

			var bEditable = this.getJsonModel("Configuracion").getProperty("/Editable");
			var oModel = new sap.ui.model.json.JSONModel({
				Observaciones: this.getJsonModel("InformeFlota").getProperty("/Observaciones")
			});

			if (this.getJsonModel("InformeFlota")) {
				var sObervaciones = this.getJsonModel("InformeFlota").getProperty("/Observaciones");

				if (!bEditable) {
					sap.m.MessageBox.show(sObervaciones, {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Observaciones"
					});
				} else {

					if (!this._dialogObservaciones) {
						this._dialogObservaciones = sap.ui.xmlfragment(
							"Hayduk.InformeDeFlota.view.fragments.dialogs.Observaciones",
							this
						);
						this.getView().addDependent(this._dialogObservaciones);
					}
					this._dialogObservaciones.setModel(oModel);
					this._dialogObservaciones.open();

				}

			}

		},

		handleObsChange: function (oEvent) {
			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? "Warning" : "None";

			oTextArea.setValueState(sState);
		},

		onAcceptObservaciones: function (oEvent) {
			var sObservaciones = this._dialogObservaciones.getModel().getProperty("/Observaciones");
			this.getJsonModel("InformeFlota").setProperty("/Observaciones", sObservaciones);
			this._dialogObservaciones.close();
		},

		onCloseObservaciones: function (oEvent) {
			this._dialogObservaciones.close();
		},

	};
});