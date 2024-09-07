sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {

		addLogEntry: function (that, aReturn) {
			for (var i = 0; aReturn.length > i; i++) {
				var bError = false;
				var bWarning = false;
				var aDetails = [];
				if (aReturn[i].IdPadre === "000") {
					var oTipo = this.returnLogType(aReturn[i].Tipo);
					var oLogEntry = {
						title: aReturn[i].Mensaje,
						subtitle: aReturn[i].Fecha + "-" + aReturn[i].Hora,
						type: oTipo.tipo,
						detalle: ""
					};

					for (var j = 0; aReturn.length > j; j++) {
						if (aReturn[j].IdPadre === aReturn[i].Id) {
							var oTipoHijo = this.returnLogType(aReturn[j].Tipo);

							aDetails.push("<span class='style" + oTipoHijo.tipo + "'>[" + oTipoHijo.desc + "]</span>" + aReturn[j].Mensaje + "<br>" + aReturn[
								j].Fecha + "-" + aReturn[j].Hora);

							if (oTipoHijo.tipo === "Error") {
								bError = true;
							}

							if (oTipoHijo.tipo === "Warning") {
								bWarning = true;
							}

						}
					}

					if (bWarning) {
						oLogEntry.type = "Warning";
					}

					if (bError) {
						oLogEntry.type = "Error";
					}

					if (aDetails.length) {
						oLogEntry.detalle = aDetails.join("<br><br>");
					}
					that.aSuperLog.push(oLogEntry);
				}

			}

			//console.log(that.aSuperLog);
			that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
		},

		handleLogPress: function (oEvent) {
			Util.sortArrayDate(this.aSuperLog);
			this.showLogDialog("Log de Operaciones", this.aSuperLog, sap.ui.core.ValueState.None, "30%", "30%", true, this);

		},

		returnLogType: function (sType) {
			var oTipo = {};

			switch (sType) {
			case "S":
				oTipo.tipo = "Success";
				oTipo.desc = "Éxito";
				break;
			case "W":
				oTipo.tipo = "Warning";
				oTipo.desc = "Advertencia";
				break;
			case "E":
				oTipo.tipo = "Error";
				oTipo.desc = "Error";
				break;
			case "I":
				oTipo.tipo = "Information";
				oTipo.desc = "Información";
				break;
			default:
				oTipo.tipo = "Warning";
				oTipo.desc = "Advertencia";
				break;
			}
			return oTipo;
		},

		handleLogClose: function (oEvent) {
			this._logDialog.close();
		}

	};
});