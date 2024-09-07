sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util'], function (Filter, Util) {
	"use strict";
	return {

		validarRegistro: function (that) {
			var bInformativo = that._byId("cbxInformativo").getSelected();
			var oInformeModel = that.getJsonModel("InformeFlota");
			var bPesca = that._byId("cbPesca").getState();
			var aLogEntries = [];
			var bTodoOk = true;

			function addError(sMensaje) {
				bTodoOk = false;
				aLogEntries.push({
					title: sMensaje,
					subtitle: "",
					type: "Error",
					detalle: ""
				});
			}

			if (bInformativo && oInformeModel.getProperty("/Tipo") === "T") {
				addError("No se puede Registrar Descarga porque es Informativo");
			}

			if (!oInformeModel.getProperty("/Numero").length) {
				addError("Número de Informe no válido");
			}

			if (!oInformeModel.getProperty("/Destino").length) {
				addError("El campo Destino debe tener un valor");
			}

			if (!bPesca) {
				addError("Se debe indicar que la embarcación pescó (Sí)");
			}

			if (!oInformeModel.getProperty("/CentroDescarga").length && oInformeModel.getProperty("/Destino") !== "VTA") {
				addError("El campo Centro Descarga debe tener un valor");
			}

			if (!oInformeModel.getProperty("/FechaIniDesc").length || !oInformeModel.getProperty("/HoraIniDesc").length ||
				!oInformeModel.getProperty("/FechaFinDesc").length || !oInformeModel.getProperty("/HoraFinDesc").length) {
				addError("Fechas y horas de inicio y fin de descarga deben tener un valor");
			}

			if (oInformeModel.getProperty("/FechaIniDesc") === oInformeModel.getProperty("/FechaFinDesc") &&
				oInformeModel.getProperty("/HoraIniDesc") === oInformeModel.getProperty("/HoraFinDesc")) {
				addError("Fechas y horas de inicio y fin de descarga no deben ser iguales");
			}

			//Validar que el informe este guardado
			if (JSON.stringify(that.oInformeGuardado) !== JSON.stringify(that.getTodoInforme())) {
				addError("Debe primero grabar los datos");
			}

			if (!bTodoOk) {
				that.showLogDialog("Registrar Descarga", aLogEntries, sap.ui.core.ValueState.Error, "35%", "25%", false, this);
			}
			return bTodoOk;

		},

		closeTicketTolva: function (oEvent) {
			this._ticketTolvaDialog.close();
		},

		checkRegister: function (that) {
			
			if (that.getJsonModel("Configuracion").getProperty("/Editable")) {
				that.validarBotones();
			}

			var aTickets = that.getJsonModel("LogTicketSet").getData().d.results;
			if (aTickets) {
				var bTodoOk = true;
				for (var i = 0; aTickets.length > i; i++) {
					if (aTickets[i].Status !== "X") {
						bTodoOk = false;
						break;
					}
				}

				if (bTodoOk && aTickets.length) {
					that.getJsonModel("Indicadores").setProperty("/DescargaColor", "#2B7D2B");
					that.getJsonModel("Indicadores").setProperty("/DescargaTexto", "Registrado");
					if (that.getJsonModel("Configuracion").getProperty("/Editable")) {
						that.ocultarBotones("REGDES");
					}

				} else {
					that.getJsonModel("Indicadores").setProperty("/DescargaColor", "#BB0000");
					that.getJsonModel("Indicadores").setProperty("/DescargaTexto", "No Registrado");
					if (that.getJsonModel("Configuracion").getProperty("/Editable")) {
						that.mostrarBoton("REGDES");
					}
				}
			}
		
		},

		registrarDescarga: function (oEvent) {
			var that = this;
			var oTableTicket = this._byId("tblTicketTolva");
			var aTickets = oTableTicket.getSelectedItems();
			var oModel = this.getInformeOdataModel();
			var aTicketSelect = [];
			var oPage = this._byId("dpInforme");

			if (!aTickets.length) {
				sap.m.MessageBox.error("Marque al menos una entrada");
			} else {
				//console.log(aTickets);
				var fPeso = 0.0;
				for (var i = 0; aTickets.length > i; i++) {
					var oTicket = aTickets[i].getBindingContext().getObject();
					oTicket.Checkbox = "X";
					fPeso += parseFloat(oTicket.Pesoa);
					aTicketSelect.push(oTicket);
				}
				console.log(oTableTicket.getBinding("items").oList);

				//Preguntar:
				var sPreguntaReg = "¿Se registrará la descarga por " + fPeso + " TM deseas continuar?";

				sap.m.MessageBox.confirm(sPreguntaReg, {
					title: "Registrar descarga",
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that._ticketTolvaDialog.close();
							oPage.setBusy(true);
							//Descarga
							var nNumero = that.getJsonModel("InformeFlota").getProperty("/Numero");
							var sMensaje;

							Util.cleanArrays(aTicketSelect, "__metadata");

							var oData = {
								Numero: nNumero,
								Reproceso: "",
								Anular: "",
								Informe: {},
								TicketTolva: aTicketSelect,
								Return: []
							};
							console.log("Inicio", oData);
							oModel.create("/DescargaInformeSet", oData, {
								success: function (data) {
									console.log(data);

							
									var bTodoOk = true;
									var sError = "";
									if (data.Return) {
										for (var i = 0; data.Return.results.length > i; i++) {
											if (data.Return.results[i].Tipo === "E") {
												bTodoOk = false;
												//sMensaje = data.Return.results[i].Mensaje;
												break;
											}
										}

										sMensaje = data.Return.results[0].Mensaje;
										if (bTodoOk) {
												var oInformeModel = that.getJsonModel("InformeFlota");
													oInformeModel.setProperty("/RegistroDescarga", data.Informe.RegistroDescarga);
													oInformeModel.setProperty("/Botones", data.Informe.Botones);
													oInformeModel.setProperty("/PesoDescargado", data.Informe.PesoDescargado);
													oInformeModel.setProperty("/OrdenCompra", data.Informe.OrdenCompra);
									                oInformeModel.setProperty("/OrdenProd", data.Informe.OrdenProd);
											
											that.bRegistrarDescarga = false;
											sap.m.MessageToast.show(sMensaje);
											Util.readInformeEntity("LogTicket", "?$filter=Numinforme eq '" + nNumero + "'", false, that);
										} else {
											sap.m.MessageBox.error(sMensaje);
											oPage.setBusy(false);
										}
										that._ticketTolvaDialog.close();
										that.log.addLogEntry(that, data.Return.results);
									}

									//that.validarBotones();
									that._ticketTolvaDialog.close();
								},
								error: function (error) {
									console.log(error);
									that._ticketTolvaDialog.close();
									var sMessage = "Ocurrió un error al procesar la descarga del informe";

									sap.m.MessageToast.show(sMessage);

									var oDateTime = Util.getDateTime(new Date());

									that.aSuperLog.push({
										title: sMessage,
										subtitle: oDateTime.date + "-" + oDateTime.time,
										detalle: error.responseText,
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
		},

		procDescargaInforme: function (oEvent) {
			var that = this;
			var sOperacion = oEvent.getSource().getId().split("--");
			var oModel = this.getInformeOdataModel();
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			var bValidacion = true;
			var oPage = this._byId("dpInforme");
			if (nNumero.length && sOperacion.length) {
				var sReprocesar = "",
					sAnular = "",
					sTitulo,
					sPregunta,
					sMensaje;
				console.log(sOperacion[1]);
				switch (sOperacion[1]) {
				case "btnRegDesc":
					sReprocesar = "";
					sTitulo = "Registrar Descarga";
					//sMensaje = "Registro de descarga completo";
					sPregunta = "¿Desea registrar la descarga del Informe de Flota: " + nNumero + "?";
					bValidacion = this.descarga.validarRegistro(this);
					break;
				case "btnRepDesc":
					sReprocesar = "X";
					sTitulo = "Reprocesar Descarga";
					//sMensaje = "Reproceso de registro de descarga completo";
					sPregunta = "¿Desea reprocesar la descarga del Informe de Flota: " + nNumero + "?";
					break;
				case "btnAnuDesc":
					sAnular = "X";
					sTitulo = "Anular Descarga";
					//sMensaje = "Anulación de descarga completa";
					sPregunta = "¿Desea anular la descarga del Informe de Flota: " + nNumero + "?";
					break;
				}

				if (!bValidacion) {
					return false;
				}

				var oData = {
					Numero: nNumero,
					Reproceso: sReprocesar,
					Anular: sAnular,
					Informe: {},
					TicketTolva: [],
					Return: []
				};

				sap.m.MessageBox.confirm(sPregunta, {
					title: sTitulo,
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							oPage.setBusy(true);
							oModel.create("/DescargaInformeSet", oData, {
								success: function (data) {
									console.log(data);

								
									var bTodoOk = true;
									var sError = "";
									if (data.Return) {
										for (var i = 0; data.Return.results.length > i; i++) {
											if (data.Return.results[i].Tipo === "E") {
												bTodoOk = false;
												//sMensaje = data.Return.results[i].Mensaje;
												break;
											}
										}

										sMensaje = data.Return.results[0].Mensaje;
										if (bTodoOk) {
											if (sReprocesar === "X" || sAnular === "X") {
													var oInformeModel = that.getJsonModel("InformeFlota");
													oInformeModel.setProperty("/RegistroDescarga", data.Informe.RegistroDescarga);
													oInformeModel.setProperty("/Botones", data.Informe.Botones);
													oInformeModel.setProperty("/PesoDescargado", data.Informe.PesoDescargado);
													oInformeModel.setProperty("/OrdenCompra", data.Informe.OrdenCompra);
									                oInformeModel.setProperty("/OrdenProd", data.Informe.OrdenProd);
												
												that.bRegistrarDescarga = false;
												Util.readInformeEntity("LogTicket", "?$filter=Numinforme eq '" + nNumero + "'", false, that);
											}
											sap.m.MessageToast.show(sMensaje);
										} else {
											oPage.setBusy(false);
											sap.m.MessageBox.error(sMensaje);
										}

										that.log.addLogEntry(that, data.Return.results);
									} else {
										if (sAnular === "X") {
											oPage.setBusy(false);
										}
									}

									//Diálogo de tickets
									if (data.TicketTolva) {
										var oTicketModel = new sap.ui.model.json.JSONModel(data.TicketTolva);

										if (!that._ticketTolvaDialog) {
											that._ticketTolvaDialog = sap.ui.xmlfragment(
												"Hayduk.InformeDeFlota.view.fragments.dialogs.TicketTolva",
												that
											);
											that.getView().addDependent(that._ticketTolvaDialog);
										}
										that._ticketTolvaDialog.setModel(oTicketModel);
										that._byId("tblTicketTolva").selectAll();
										oPage.setBusy(false);
										that._ticketTolvaDialog.open();
									}

									//that.validarBotones();

								},
								error: function (error) {
									console.log(error);

									var sMessage = "Ocurrió un error al procesar la descarga del informe";

									sap.m.MessageToast.show(sMessage);

									var oDateTime = Util.getDateTime(new Date());

									that.aSuperLog.push({
										title: sMessage,
										subtitle: oDateTime.date + "-" + oDateTime.time,
										detalle: error.responseText,
										type: "Error"
									});
									oPage.setBusy(false);
									that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
								}
							});
						}
					}
				});

			}

		}

	};
});