sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
 
		validarOperadorRadio: function (that) {

			var oInformeModel = that.getJsonModel("InformeFlota");
			var bTodoOk = true;
			var bZarpe = that._byId("cbZarpe").getState();
			var bPesca = that._byId("cbPesca").getState();
			that.aLogAprobaciones = [];

			function addError(sMensaje) {
				bTodoOk = false;
				that.aLogAprobaciones.push({
					title: sMensaje,
					subtitle: "",
					type: "Error",
					detalle: ""
				});
			}

			if (oInformeModel.getProperty("/Estado") !== "CRE") {
				addError("El informe ya se encuentra aprobado");

			}

			if (!bZarpe && !oInformeModel.getProperty("/MotivoNoZarpe").length) {
				addError("Debe ingresar motivo de No Zarpe");

			}

			if (bZarpe && oInformeModel.getProperty("/Tipo") === "P") {
				var aHorometros = that.getJsonModel("HorometroSet").getData().d.results;
				if (aHorometros.length) {
					var sEstadoHorometro = aHorometros[0].EstadoHorom;

					// if (sEstadoHorometro !== "APH") {
					// 	addError("Horómetros no se encuentran aprobados");
					// }
				}
				if (bPesca) {
					var aCalas = that.getJsonModel("CalasSet").getData().d.results;
					if (!aCalas.length) {
						addError("Debe registrar al menos una cala");
					}

					var aMuestreos = that.getJsonModel("MuestreoCalaSet").getData().d.results;
					if (!aMuestreos.length) {
						addError("Debe registrar al menos una Hoja Muestreo");
					}

					if (!oInformeModel.getProperty("/FechaIniDesc").length || !oInformeModel.getProperty("/HoraIniDesc").length ||
						!oInformeModel.getProperty("/FechaFinDesc").length || !oInformeModel.getProperty("/HoraFinDesc").length) {
						addError("Debe registrar Fecha Descarga");
					}

					if (!oInformeModel.getProperty("/CentroDescarga").length) {
						addError("Debe registrar Centro Descarga");
					}

					if (!oInformeModel.getProperty("/OrdenProd").length && oInformeModel.getProperty("/MotivoZarpe") === "01") {
						addError("Debe registrar descarga");
					}

					if (oInformeModel.getProperty("/RegistroCombustible") !== "2" && oInformeModel.getProperty("/MotivoZarpe") === "01") {
						addError("Debe registrar Combustible");
					}
				} else {
					if (!oInformeModel.getProperty("/PuertoArribo").length) {
						addError("Debe registrar Puerto Arribo");
					}

					if (!oInformeModel.getProperty("/FechaArribo").length || !oInformeModel.getProperty("/HoraArribo").length) {
						addError("Debe registrar Fecha Arribo");
					}

					if (oInformeModel.getProperty("/RegistroCombustible") !== "2") {
						addError("Debe registrar Combustible");
					}
				}

			}

			if (!bTodoOk) {
				that.showLogDialog("Aprobación de Informe de Flota",that.aLogAprobaciones,sap.ui.core.ValueState.Error,"30%","25%",false,this);
			}
			return bTodoOk;
		},

		validarJefeFlota: function (that) {
			var sEstado = that.getJsonModel("InformeFlota").getProperty("/Estado");
			var bTodoOk = true;
		    that.aLogAprobaciones = [];
		    
			if (sEstado !== "AOP") {
				bTodoOk = false;
				that.aLogAprobaciones.push({
					title: "El status debería ser Aprobado Operador Radio",
					subtitle: "",
					type: "Error",
					detalle: ""
				});
				that.showLogDialog("Aprobación de Informe de Flota",that.aLogAprobaciones,sap.ui.core.ValueState.Error,"30%","25%",false,this);

			}
			return bTodoOk;
		},
		
		validarDesaprobacion: function (that) {
			var sEstado = that.getJsonModel("InformeFlota").getProperty("/Estado");
			var bTodoOk = true;
		    that.aLogAprobaciones = [];
		    
			if (sEstado === "CRE") {
				bTodoOk = false;
				that.aLogAprobaciones.push({
					title: "El informe ya tiene estado Creado",
					subtitle: "",
					type: "Error",
					detalle: ""
				});
				
				that.showLogDialog("Aprobación de Informe de Flota",that.aLogAprobaciones,sap.ui.core.ValueState.Error,"30%","25%",false,this);

			}
			return bTodoOk;
		}
	

	};
});