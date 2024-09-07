sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {
		buildTemplates: function (metadata, that) {
			var aConfig = [],
				aCells = [],
				aCellsView = [];
			var aHorometros = metadata.dataServices.schema[0].entityType[13].property;
			for (var i = 0; i < aHorometros.length; i++) {
				var label = aHorometros[i].extensions[1].value;
				var updatable = aHorometros[i].extensions[3].name;

				//console.log(label);
				if (label === '-') {
					continue;
				}

				if (updatable === "updatable") {
					aCells.push(
						new sap.m.Text({
							text: "{HorometroSet>" + aHorometros[i].name + "}"
						})
					);
				} else {
					aCells.push(
						new sap.m.Input({
							value: "{HorometroSet>" + aHorometros[i].name + "}",
							liveChange: function (oEvent) {
								Util.onlyInteger(oEvent);
							}
						})
					);
				}

				aConfig.push({
					propertyName: aHorometros[i].name,
					text: label
				});

				aCellsView.push(
					new sap.m.Text({
						text: "{HorometroSet>" + aHorometros[i].name + "}"
					})
				);

			}
			that.setJsonModel(aConfig, "tblHorometro", true);
			//console.log(aCells);
			//console.log(aCellsView);
			that.oEditableHorometerTemplate = new sap.m.ColumnListItem({
				cells: aCells
			});

			that.oViewHorometerTemplate = new sap.m.ColumnListItem({
				cells: aCellsView
			});
		},

		onRefreshHorometro: function (oEvent) {
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			if (nNumero.length) {
				Util.readInformeEntity("Horometro", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
			}
		},

		onXLSHorometro: function (oEvent) {
			this.onXLSDownload(oEvent, "tblHorometro", "Horometros", true);
		},
		/*
		recoverHorometro:function(oEvent){
			Util.readEntity("HorometroDefault", true, this, "Horometro");
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			
			if(nNumero.length){
			   this.rebindTable(this._byId("tblHorometro"), "HorometroSet>/d/results", [new Filter("Numinforme", "EQ", nNumero)], this.oEditableHorometerTemplate, "Edit");	
			}else{
			   this.rebindTable(this._byId("tblHorometro"), "HorometroSet>/d/results", [], this.oEditableHorometerTemplate, "Edit");	
			}
			
			
		}, */

		procesarHorometro: function (oEvent) {
			var that = this;
			var sIdButton = oEvent.getSource().getId();
			var oModel = this.getInformeOdataModel();
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			var oPage = this._byId("dpInforme");

			if (nNumero.length && sIdButton.length) {
				var sAnular = "",
					sTitulo,
					sPregunta,
					sMensaje;

				if (sIdButton.includes("btnAprobHorometro")) {
					sTitulo = "Aprobar Horómetro";
					sMensaje = "Aprobación de horómetro completa";
					sPregunta = "¿Desea aprobar los horómetros del Informe de Flota: " + nNumero + "?";
				} else if (sIdButton.includes("btnAnularHorometro")) {
					sTitulo = "Anular Horómetro";
					sAnular = "X";
					sMensaje = "Anulación de horómetro completa";
					sPregunta = "¿Desea anular los horómetros del Informe de Flota: " + nNumero + "?";

				}

				var oData = {
					Numero: nNumero,
					Anular: sAnular,
					Return: []
				};
				var aHoroMensaje = [];

				function addError(sMensaje) {
				
					aHoroMensaje.push({
						title: sMensaje,
						subtitle: "",
						type: "Error",
						detalle: ""
					});
				}

				var oInforme = that.getTodoInforme();

				var oFirstHorometer = oInforme.Horometros[0];
                //console.log(oFirstHorometer);
				if (oFirstHorometer && !sAnular.length ) {

					//Validar que el informe este guardado
					if (JSON.stringify(that.oInformeGuardado.Horometros) !== JSON.stringify(oInforme.Horometros)) {
						addError("Debe primero grabar los datos de horómetros");

					}

					for (var i = 0; oInforme.Horometros.length > i; i++) {
						var oHorometro = oInforme.Horometros[i];
						if (parseInt(oHorometro.Horarribo, 0) <= parseInt(oHorometro.Horactual, 0) && parseInt(oHorometro.Horarribo, 0) !== 0) {
							addError("Pto. Med: " + oHorometro.Ptomedicion + " " +
								" Horómetro de Arribo Menor que Horómetro Actual");
						} else if (parseInt(oHorometro.Horzarpe, 0) < parseInt(oHorometro.Horactual, 0) && parseInt(oHorometro.Horzarpe, 0) !== 0) {
							addError("Pto. Med: " + oHorometro.Ptomedicion + " " +
								" Horómetro de Zarpe menor que Horómetro Actual");
						} else if (parseInt(oHorometro.Horzarpe, 0) >= parseInt(oHorometro.Horarribo, 0) && parseInt(oHorometro.Horarribo, 0) !== 0) {
							addError("Pto. Med: " + oHorometro.Ptomedicion + " " +
								" Horómetro de Zarpe debe ser menor que Horómetro de Arribo");
						} else if (parseInt(oHorometro.Horzarpe, 0) === 0 && parseInt(oHorometro.Horarribo, 0) > 0 && parseInt(oHorometro.Horactual, 0) >
							0) {
							addError("Pto. Med: " + oHorometro.Ptomedicion + " " + " Horómetro de Zarpe no puede ser 0");
						}

					}

					if (aHoroMensaje.length) {
                        that.showLogDialog("Aprobar Horómetros", aHoroMensaje, sap.ui.core.ValueState.Error, "35%", "25%", false, this);
                        return false;
					}
				}

				sap.m.MessageBox.confirm(sPregunta, {
					title: sTitulo,
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							oPage.setBusy(true);
							oModel.create("/ProcHorometroSet", oData, {
								success: function (data) {
									console.log(data);

									var bTodoOk = true;
									var sError = "";
									for (var i = 0; data.Return.results.length > i; i++) {
										if (data.Return.results[i].Tipo === "E") {
											bTodoOk = false;
											sError = data.Return.results[i].Mensaje;
											break;
										}
									}

									if (bTodoOk) {
										that.bActualizarHorometro = false;
										sap.m.MessageToast.show(sMensaje);
										Util.readInformeEntity("Horometro", "?$filter=Numinforme eq '" + nNumero + "'", false, that);
									} else {
										oPage.setBusy(false);
										sap.m.MessageBox.error(sError);
									}

									that.log.addLogEntry(that, data.Return.results);

								},
								error: function (error) {
									console.log(error);

									var sMessage = "Ocurrió un error al procesar los horómetros del informe";

									sap.m.MessageToast.show(sMessage);

									var oDateTime = Util.getDateTime(new Date());

									that.aSuperLog.push({
										title: sMessage,
										subtitle: oDateTime.date + "-" + oDateTime.time,
										type: "Error"
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