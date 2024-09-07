sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		liveChangeStockZarpe: function (oEvent) {
			Util.onlyNumeric(oEvent);
			var StockZarpe = parseFloat(oEvent.getSource().getValue());
			if (StockZarpe < 0) StockZarpe *= -1;
			var AbastFaena = parseFloat(this.getJsonModel("InformeFlota").getProperty("/AbastFaena"));
			var StockArribo = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockArribo"));
			var fConsumoFaena = 0.00;
			//console.log(StockZarpe);
			if (!isNaN(StockZarpe)) {
				fConsumoFaena += StockZarpe;
			}
			if (!isNaN(AbastFaena)) {
				fConsumoFaena += AbastFaena;
			}
			if (!isNaN(StockArribo)) {
				fConsumoFaena -= StockArribo;
			}

			this._byId("inpConsumoFaena").setValue(Util.addZeroes(String(fConsumoFaena)));
		},

		liveChangeAbastFaena: function (oEvent) {
			Util.onlyNumeric(oEvent);
			var AbastFaena = parseFloat(oEvent.getSource().getValue());
			if (AbastFaena < 0) AbastFaena *= -1;
			var StockZarpe = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockZarpe"));
			var StockArribo = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockArribo"));
			var fConsumoFaena = 0.00;
			if (!isNaN(StockZarpe)) {
				fConsumoFaena += StockZarpe;
			}
			if (!isNaN(AbastFaena)) {
				fConsumoFaena += AbastFaena;
			}
			if (!isNaN(StockArribo)) {
				fConsumoFaena -= StockArribo;
			}

			this._byId("inpConsumoFaena").setValue(Util.addZeroes(String(fConsumoFaena)));
		},

		liveChangeStockArribo: function (oEvent) {
			Util.onlyNumeric(oEvent);
			var StockArribo = parseFloat(oEvent.getSource().getValue());
			if (StockArribo < 0) StockArribo *= -1;
			var StockZarpe = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockZarpe"));
			var AbastFaena = parseFloat(this.getJsonModel("InformeFlota").getProperty("/AbastFaena"));

			var StockFinDescarga = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockFinDescarga"));
			var AbastDescarga = parseFloat(this.getJsonModel("InformeFlota").getProperty("/AbastDescarga"));

			var fConsumoFaena = 0.00;
			var fConsumoDescarga = 0.00;
			if (!isNaN(StockZarpe)) {
				fConsumoFaena += StockZarpe;
			}
			if (!isNaN(AbastFaena)) {
				fConsumoFaena += AbastFaena;
			}
			if (!isNaN(StockArribo)) {
				fConsumoFaena -= StockArribo;
			}

			if (!isNaN(StockArribo)) {
				fConsumoDescarga += StockArribo;
			}
			if (!isNaN(StockFinDescarga)) {
				fConsumoDescarga -= StockFinDescarga;
			}
			if (!isNaN(AbastDescarga)) {
				fConsumoDescarga += AbastDescarga;
			}
			this._byId("inpConsumoDescarga").setValue(Util.addZeroes(String(fConsumoDescarga)));
			this._byId("inpConsumoFaena").setValue(Util.addZeroes(String(fConsumoFaena)));
		},

		liveChangeStockFinDescarga: function (oEvent) {
			Util.onlyNumeric(oEvent);
			var StockFinDescarga = parseFloat(oEvent.getSource().getValue());
			if (StockFinDescarga < 0) StockFinDescarga *= -1;
			var StockArribo = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockArribo"));
			var AbastDescarga = parseFloat(this.getJsonModel("InformeFlota").getProperty("/AbastDescarga"));

			var fConsumoDescarga = 0.00;

			if (!isNaN(StockArribo)) {
				fConsumoDescarga += StockArribo;
			}
			if (!isNaN(StockFinDescarga)) {
				fConsumoDescarga -= StockFinDescarga;
			}
			if (!isNaN(AbastDescarga)) {
				fConsumoDescarga += AbastDescarga;
			}
			this._byId("inpConsumoDescarga").setValue(Util.addZeroes(String(fConsumoDescarga)));

		},

		liveChangeAbastDescarga: function (oEvent) {
			Util.onlyNumeric(oEvent);
			var AbastDescarga = parseFloat(oEvent.getSource().getValue());
			if (AbastDescarga < 0) AbastDescarga *= -1;
			var StockArribo = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockArribo"));
			var StockFinDescarga = parseFloat(this.getJsonModel("InformeFlota").getProperty("/StockFinDescarga"));

			var fConsumoDescarga = 0.00;

			if (!isNaN(StockArribo)) {
				fConsumoDescarga += StockArribo;
			}
			if (!isNaN(StockFinDescarga)) {
				fConsumoDescarga -= StockFinDescarga;
			}
			if (!isNaN(AbastDescarga)) {
				fConsumoDescarga += AbastDescarga;
			}
			this._byId("inpConsumoDescarga").setValue(Util.addZeroes(String(fConsumoDescarga)));

		},

		registrarConsumo: function (oEvent) {
			var that = this;

			var oModel = this.getInformeOdataModel();
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			var oPage = this._byId("dpInforme");
			var bValidacion = true;
       
			if (nNumero.length) {

				var oData = {
					Numero: nNumero,
					Informe: {},
					Return: []
				};

				sap.m.MessageBox.confirm("¿Desea registrar el consumo de combustible del Informe de Flota " + nNumero + "?", {
					title: "Registrar Consumo",
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							oPage.setBusy(true);
							oModel.create("/RegCombustibleSet", oData, {
								success: function (data) {
									console.log(data);

									var oInformeModel = that.getJsonModel("InformeFlota");
									oInformeModel.setProperty("/RegistroCombustible", data.Informe.RegistroCombustible);
									oInformeModel.setProperty("/Botones", data.Informe.Botones);

									if (data.Informe.RegistroCombustible.length) {
										that.getJsonModel("Indicadores").setProperty("/CombustibleColor", "#2B7D2B");
										that.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "Registrado");

									} else {
										that.getJsonModel("Indicadores").setProperty("/CombustibleColor", "#BB0000");
										that.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "No Registrado");
									}

									var bTodoOk = true;
									var sError = "";
									for (var i = 0; data.Return.results.length > i; i++) {
										if (data.Return.results[i].Tipo === "E") {
											bTodoOk = false;
											sError = data.Return.results[i].Mensaje;
											break;
										}
									}
                                    oPage.setBusy(false);
									if (bTodoOk) {
										sap.m.MessageToast.show(data.Return.results[0].Mensaje);
									} else {
										sap.m.MessageBox.error(sError);
									}
                                    
									that.validarBotones();

									that.log.addLogEntry(that, data.Return.results);

								},
								error: function (error) {
									console.log(error);

									var sMessage = "Ocurrió un error al registrar el consumo de combustible";

									sap.m.MessageToast.show(sMessage);

									var oDateTime = Util.getDateTime(new Date());

									that.aSuperLog.push({
										title: sMessage,
										subtitle: oDateTime.date + "-" + oDateTime.time,
										type: "Error",
										detalle:error.responseText,
									});
									that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
									oPage.setBusy(false);
								}
							});
						}
					}
				});

			}
		}
	};
});