/* global XLSX:true */
sap.ui.define(["sap/ui/model/Filter",
	'Hayduk/InformeDeFlota/model/Util', 'Hayduk/InformeDeFlota/controller/Tripulante',
	'Hayduk/InformeDeFlota/controller/Cargos', 'Hayduk/InformeDeFlota/js/xlsxfull'
], function (Filter, Util, Tripulante, Cargos, xlsxfull) {
	"use strict";
	return {
		//Tripulacion

		buildTemplates: function (metadata, that) {
			var aConfig = [],
				aCells = [],
				aCellsView = [];

			var aTripulacion = metadata.dataServices.schema[0].entityType[16].property;
			for (var i = 0; i < aTripulacion.length; i++) {
				var label = aTripulacion[i].extensions[1].value;
				var updatable = aTripulacion[i].extensions[3].name;

				if (label !== '-' || aTripulacion[i].name === "Numinforme") {
					var sText = label;
					if (aTripulacion[i].name === "Numinforme") {
						sText = "N° Informe";
					}

					aConfig.push({
						propertyName: aTripulacion[i].name,
						text: sText
					});
				}

				if (label === '-') {
					continue;
				}

				if (updatable === "updatable") {

					if (aTripulacion[i].name === "Cargodesc") {
						aCells.push(
							new sap.m.Text({
								id: "txtCargo",
								text: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);

					} else if (aTripulacion[i].name === "Nombre") {
						aCells.push(
							new sap.m.Text({
								id: "txtNombre",
								text: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);

					} else {
						aCells.push(
							new sap.m.Text({
								text: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);
					}

				} else {
					if (aTripulacion[i].name === 'Dni') {
						aCells.push(
							new sap.m.Input({
								ariaLabelledBy: "txtNombre",
								showValueHelp: true,
								valueHelpRequest: function (oEvent) {
									Tripulante.handleTripulanteHelp(oEvent, that);

								},
								liveChange: function (oEvent) {
									Tripulante.onLiveChangeTripulante(oEvent, that);
								},
								value: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);
					} else if (aTripulacion[i].name === 'Cargo') {
						aCells.push(
							new sap.m.Input({
								ariaLabelledBy: "txtCargo",
								showValueHelp: true,
								valueHelpRequest: function (oEvent) {
									Cargos.handleCargoHelp(oEvent, that);

								},
								liveChange: function (oEvent) {
									Cargos.onLiveChangeCargo(oEvent, that);
								},
								value: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);

					} else {
						aCells.push(
							new sap.m.Input({
								value: "{TripulacionSet>" + aTripulacion[i].name + "}"
							})
						);
					}
				}

				aCellsView.push(
					new sap.m.Text({
						text: "{TripulacionSet>" + aTripulacion[i].name + "}"
					})
				);

			}

			that.setJsonModel(aConfig, "tblTripulacion", true);

			that.oEditableTripTemplate = new sap.m.ColumnListItem({
				cells: aCells
			});

			that.oViewTripTemplate = new sap.m.ColumnListItem({
				cells: aCellsView
			});
		},

		addTripulante: function (oEvent) {

			var aTripulantes = this._byId("tblTripulacion").getModel("TripulacionSet").getData();

			if (aTripulantes.d.results.length > 0 && !this.numero) {
				this.numero = parseInt(aTripulantes.d.results[aTripulantes.d.results.length - 1].Numero, 0);
			}

			var oTripulante = {
				Cargo: "",
				Cargodesc: "",
				Dni: "",
				Nombre: ""
			};

			this.numero = this.numero + 1;
			if (isNaN(parseInt(this.numero, 0))) {
				oTripulante.Numero = 1;
			} else {
				oTripulante.Numero = this.numero;
			}

			if (!this.getJsonModel("InformeFlota")) {
				oTripulante.Numinforme = "";
				oTripulante.Matricula = "";
			} else {
				oTripulante.Numinforme = this.getJsonModel("InformeFlota").getProperty("/Numero");
				oTripulante.Matricula = this.getJsonModel("InformeFlota").getProperty("/Matricula");
			}

			oTripulante.Numero = Util.paddZeroes(oTripulante.Numero, 2);

			aTripulantes.d.results.push(oTripulante);
			this._byId("tblTripulacion").getModel("TripulacionSet").refresh(true);
		},

		onDeleteTripulante: function (oEvent) {
			var oTabla = this._byId("tblTripulacion"),
				oTripulante = oEvent.getParameter("listItem"),
				oTripulanteInfo = oTripulante.getBindingContext("TripulacionSet").getObject(),
				nIndex = oTabla.indexOfItem(oTripulante),
				oModel = oTabla.getModel("TripulacionSet"),
				aData = oModel.getData().d.results,
				that = this;

			sap.m.MessageBox.confirm("¿Desea eliminar el tripulante:" + oTripulanteInfo.Dni + "-" + oTripulanteInfo.Nombre + "?", {
				title: "Eliminar Tripulante",
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						aData.splice(nIndex, 1);

						for (var i = 0; aData.length > i; i++) {
							aData[i].Numero = Util.paddZeroes((i + 1), 2);
						}
						that.numero = undefined;
						oModel.refresh(true);

					}
				}
			});
		},

		searchTripulate: function (oEvent) {
			var sInputValue = oEvent.getParameter("query").toUpperCase();
			var aFilter = [];

			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Dni", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Cargo", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Cargodesc", sap.ui.model.FilterOperator.Contains, sInputValue));
			this._byId("tblTripulacion").getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		onRefreshTripulacion: function (oEvent) {
			var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
			if (nNumero.length) {
				Util.readInformeEntity("Tripulacion", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
			}
		},

		onXLSTripulacion: function (oEvent) {
			this.onXLSDownload(oEvent, "tblTripulacion", "Tripulacion", true);
		},

		onUpdFinTblTripulacion: function (oEvent) {
			var that = this;
			var oTableTrip = oEvent.getSource();
			var aItems = oTableTrip.getItems();

			function validateCargo(sValue, aItem) {
				if (sValue.length < 3) {
					aItem.removeStyleClass("patronPrincipal");
					aItem.removeStyleClass("patronSecundario");
					return false;
				}

				if (sValue === "PA1" || sValue === "PR1" || sValue === "PR2") {
					aItem.addStyleClass("patronPrincipal");
				} else if (sValue === "PA2" || sValue === "PS1" || sValue === "PS2") {
					aItem.addStyleClass("patronSecundario");
				} else {
					aItem.removeStyleClass("patronPrincipal");
					aItem.removeStyleClass("patronSecundario");
				}

				if (!that.aCargos) {
					that.aCargos = Util.deepCloneArray(that.getJsonModel("CargoSet").getData().d.results);
					Util.sortObjectArray(that.aCargos, "Identificador");
				}
				//console.log(that.aCargos);
				var nPos = -1;
				nPos = Util.binarySearch(that.aCargos, sValue, "Identificador");
				if (nPos === -1) {
					return false;
				} else {
					return true;
				}
			}

			function validateTripulante(sValue) {
				if (sValue.length < 8) {
					return false;
				}
				
				var aTripulantes = that.getJsonModel("TripulanteSet").getData().d.results;
				
				var nPos = -1;
				nPos = Util.binarySearch(aTripulantes, sValue, "Dni");
				if (nPos === -1) {
					return false;
				} else {
					return true;
				}

			}

			for (var i in aItems) {
				var bFilaCorrecta = true;
				var aCells = aItems[i].getCells();

				var oCargo = aCells[1],
					oDni = aCells[3];

				//Validar Cargo
				var sControlType = oCargo.getMetadata().getName();

				if (sControlType === "sap.m.Text") {
					if (!validateCargo(oCargo.getText(), aItems[i])) {
						aItems[i].setHighlight(sap.ui.core.MessageType.Error);
						bFilaCorrecta &= false;
					}

					if (!validateTripulante(oDni.getText())) {
						aItems[i].setHighlight(sap.ui.core.MessageType.Error);
						bFilaCorrecta &= false;
					}

					if (bFilaCorrecta) {
						aItems[i].setHighlight(sap.ui.core.MessageType.None);
					}

				} else if (sControlType === "sap.m.Input") {
					if (!validateCargo(oCargo.getValue(), aItems[i])) {
						oCargo.setValueState(sap.ui.core.ValueState.Error);
					} else {
						oCargo.setValueState(sap.ui.core.ValueState.None);
					}

					if (!validateTripulante(oDni.getValue())) {
						oDni.setValueState(sap.ui.core.ValueState.Error);
					} else {
						oDni.setValueState(sap.ui.core.ValueState.None);
					}
				}

			}

		},

		onUploadXLSX: function (oEvent) {
			var that = this;
			var bTodoOk = true;
			var aData = {
				d: {
					results: []
				}
			};

			var aCargos = Util.deepCloneArray(this.getJsonModel("CargoSet").getData().d.results);
			Util.sortObjectArray(aCargos, "Nombre");

			function processXLSX(file) {
				bTodoOk = true;
				if (file && window.FileReader) {
					var reader = new FileReader();
					var result = {},
						data;

					reader.onload = function (e) {
						data = e.target.result;
						var wb = XLSX.read(data, {
							type: 'binary'
						});

						wb.SheetNames.forEach(function (sheetName) {

							var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
							if (roa.length > 0) {
								result[sheetName] = roa;
							}
							//console.log(result);
							var aExcel = result[sheetName];
							for (var i = 0; aExcel.length > i; i++) {

								//Validar excel 
								if (!aExcel[i].hasOwnProperty('CARGO ORIGEN') || !aExcel[i].hasOwnProperty('D.N.I') || !aExcel[i].hasOwnProperty('TRIPULANTE')) {
									bTodoOk = false;
									break;
								}

								var oTripulante = {
									Numero: Util.paddZeroes(i + 1, 2),
									Cargo: "",
									Cargodesc: aExcel[i]["CARGO ORIGEN"],
									Dni: aExcel[i]["D.N.I"],
									Nombre: aExcel[i]["TRIPULANTE"]
								};
								//console.log(aExcel[i]);
								if (aCargos.length) {
									var nPos = Util.binarySearch(aCargos, oTripulante.Cargodesc, "Nombre");
									//console.log(nPos);
									if (nPos !== -1) {
										oTripulante.Cargo = aCargos[nPos].Identificador;
									}
								}

								if (oTripulante.Cargo.length) {

									if (!that.getJsonModel("InformeFlota")) {
										oTripulante.Numinforme = "";
										oTripulante.Matricula = "";
									} else {
										oTripulante.Numinforme = that.getJsonModel("InformeFlota").getProperty("/Numero");
										oTripulante.Matricula = that.getJsonModel("InformeFlota").getProperty("/Matricula");
									}

									aData.d.results.push(oTripulante);
								}

							}
							if (bTodoOk) {
								that.cleanModel("TripulacionSet");
								that.setDataModel("TripulacionSet", aData);
								that.oDialogXLSXTrip.close();
							} else {
								sap.m.MessageToast.show("Excel no válido");
								oFileUploader.setValueState(sap.ui.core.ValueState.Error);
							}
							//console.log(that._byId("tblTripulacion").getModel("TripulacionSet"));
						});
						return result;
					}
					reader.readAsBinaryString(file);

				}
			}

			var oFileUploader = new sap.ui.unified.FileUploader({
				fileType: ["xlsx"],
				buttonText: "Seleccionar",
				placeholder: "Archivo de tripulación",
				change: function (oEvent) {
					this.setValueState(sap.ui.core.ValueState.None);
					if (oEvent.getParameter("files") && oEvent.getParameter("files")[0]) {
						that.xlsxTripulacion = oEvent.getParameter("files")[0];
					}
				},
				typeMissmatch: function (oEvent) {
					this.setValueState(sap.ui.core.ValueState.Error);
				}
			});

			oFileUploader.addStyleClass("sapUiMediumMarginBegin");

			this.oDialogXLSXTrip = new sap.m.Dialog({
				resizable: false,
				content: [oFileUploader],
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Accept,
					icon: "sap-icon://upload",
					press: function () {
						var sEstado = oFileUploader.getValueState();
						if (sEstado !== sap.ui.core.ValueState.Error) {
							processXLSX(that.xlsxTripulacion);
						}
					},
					text: "Cargar"
				}),
				endButton: new sap.m.Button({
					press: function () {
						this.getParent().close();
					},
					text: "Cancelar"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Title({
							text: "Cargar XLSX Tripulación",
							titleStyle: "H4"
						})
					]

				}),
				contentHeight: "8%",
				contentWidth: "15%",
				verticalScrolling: false
			});

			this.oDialogXLSXTrip.addStyleClass("sapUiSizeCompact");

			this.oDialogXLSXTrip.open();
		},

		recoverTripulacion: function (oEvent) {
			var that = this;
			var oInpMatricula = this._byId("inpMatricula");
			var sMatricular = this.getJsonModel("InformeFlota").getProperty("/Matricula");
			var aData = {
				d: {
					results: []
				}
			};

			if (oInpMatricula.getValueState() === sap.ui.core.ValueState.Error || !sMatricular.length) {
				sap.m.MessageBox.warning("Debe especificar una matrícula válida");
				return false;
			}

			sap.m.MessageBox.confirm("¿Desea recuperar la tripulación propuesta?", {
				title: "Recuperar Tripulación",
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						var aTripPropuestos = Util.deepCloneArray(that.getJsonModel("TripPropuestaSet").getData().d.results);
						//console.log(aTripPropuestos);
						if (aTripPropuestos.length > 0) {

							for (var i = 0; aTripPropuestos.length > i; i++) {
								if (aTripPropuestos[i].Matricula === sMatricular) {
									aData.d.results.push(aTripPropuestos[i]);
								}
							}
							//console.log(aData)
							Util.sortObjectArray(aData.d.results, "Numero");
							that.cleanModel("TripulacionSet");
							that.setDataModel("TripulacionSet", aData);
							//console.log(this.getJsonModel("TripulacionSet"));
							that._byId("tblTripulacion").getBinding("items").filter([new Filter(
								"Matricula",
								sap.ui.model.FilterOperator.Contains, sMatricular)]);
						}

					}
				}
			});
		},

		onCargarArchivos: async function () {
			var that = this;
			var oModel = that.getInformeOdataModel();
			
			sap.ui.core.BusyIndicator.show(0);
			await this.tripulacion.obtenerDocumentos(that, oModel);
			sap.ui.core.BusyIndicator.hide();
			if (!this._dialogUploadFile) {
				this._dialogUploadFile = sap.ui.xmlfragment(
					"frgIdSubirDocumentos",
					"Hayduk.InformeDeFlota.view.fragments.dialogs.SubirDocumentos",
					this);
				this.getView().addDependent(this._dialogUploadFile);
			}
			this._dialogUploadFile.open();
		},
		onPressItemDownload: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var oArchivo = oEvent.getSource().getBindingContext("Documentos").getObject(),
				sNombre = oArchivo.NombreArchivo,
				sTipo = oArchivo.TipoArchivo,
				sBase64 = oArchivo.Documento,
				sMimeTipo = "";

			var n = document.createElement('a');
			if (sTipo === "jpg" || sTipo === "jpeg") {
				sMimeTipo = "image/jpeg";
			} else {
				sMimeTipo = "application/pdf";
			}
			
			var t = "";
			
			if (navigator.onLine === false) {
				sNombre = sNombre + "." + sTipo;
				t = sBase64;
			} else {
				t = this.tripulacion.hexToBase64(sBase64);
			}
			
			var sFileName = sNombre;
			var i = this.tripulacion.b64toBlob(t, sMimeTipo, 512);
			var a = URL.createObjectURL(i);
			n.href = a;
			n.download = sFileName;
			n.click();
			n.remove();
			sap.ui.core.BusyIndicator.hide();
		},
		onPressItemRemove: function (oEvent) {
			var that = this;
			var oModel = that.getInformeOdataModel();
			var sArchivo = oEvent.getSource().getBindingContext("Documentos").getObject().NombreArchivo;

			sap.ui.core.BusyIndicator.show(0);
			if (navigator.onLine) {
				oModel.remove("/DocumentosSet('" + sArchivo + "')", {
					success: async function (data) {
						sap.m.MessageToast.show("Se ha eliminado el documento.");
						await that.tripulacion.obtenerDocumentos(that, oModel);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (e) {
						sap.m.MessageToast.show("Ocurrió un error al eliminar el archivo.");
					}
				});
			} else {
				var aDocumentos = that.getJsonModel("Documentos").getData();
				
				aDocumentos.forEach(function(oPos, index, object) {
				    if(oPos.NombreArchivo === sArchivo){
				      object.splice(index, 1);
				    }
				});
				
				Util.saveObjectColaWithFiles(aDocumentos, that);
				sap.ui.core.BusyIndicator.hide();
			}
		},
		obtenerDocumentos: function (that, oModel, sAfterNumber) {
			return new Promise(async (resolve, reject) => {
				var sNumero = that.getJsonModel("InformeFlota").getData().Numero;
				
				if (sAfterNumber !== "" && sAfterNumber !== undefined) {
					sNumero = sAfterNumber;
				}
				if (navigator.onLine) {
					oModel.read("/DocumentosSet", {
						filters: [
							new Filter("Numinf", sap.ui.model.FilterOperator.EQ, sNumero)
						],
						success: function (oData) {
							that.setJsonModel(oData.results, "Documentos", true);
							resolve(true);
						},
						error: function (oError) {
							sap.m.MessageBox.error("No fue posible obtener los documentos de informe.", {
								title: "Carga Archivo",
								details: oError.message
							});
							resolve(true);
						}
					});
				} else {
					var aDocumentos = await that.util.obtenerDocumentosOff(that);
					that.setJsonModel(aDocumentos, "Documentos", true);
					that.getJsonModel("Documentos").refresh(true);
					resolve(true);
				}
			});
		},
		// Método solo para ONLINE
		guardarDocumentos: function (aDocumentos, sNumero, oModel, that)  {
			return new Promise(async (resolve, reject) => {
				var iCantDocumentos = aDocumentos.length;
				
				for (var i = 0, n = iCantDocumentos; i < n; i++) {
					aDocumentos[i].Numinf = sNumero;
					await that.tripulacion.subirDocumentoModel(that, oModel, aDocumentos[i]);
				}
				await that.tripulacion.obtenerDocumentos(that, oModel, sNumero);
				resolve(true);
			});
		},
		subirDocumentoModel: function (that, oModel, oDocumento) {
			return new Promise((resolve, reject) => {
				oModel.create("/DocumentosSet", oDocumento, {
					success: function (data) {
						resolve(true);
					},
					error: function (error) {
						resolve(true);
						sap.m.MessageToast.show("Ocurrió un error al adjuntar un archivo.");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			});
		},
		_onChangeAddFile: function (oEvent) {
			var that = this;
			var oModel = that.getInformeOdataModel();
			var oParameters = oEvent.getParameters("files");
			var oFile = oParameters.files[0];
			var oFileReader = new FileReader();
			var sFilename = oFile.name.split(".")[0];
			var sFiletype = oFile.name.split(".")[1];
			var sNumero = that.getJsonModel("InformeFlota").getData().Numero;

			sap.ui.core.BusyIndicator.show(0);
			oFileReader.onloadend = function () {
				var result = oFileReader.result;
				var mimeType = result.substring(5, 20);
				var oJson = {
					Filename: sFilename,
					Filetype: sFiletype,
					FileBase64: result,
					Filemimetype: mimeType
				};
				var oData = {
					Numinf: sNumero,
					NombreArchivo: sFilename,
					TipoArchivo: sFiletype,
					Documento: result.substr(result.indexOf(",") + 1, result.length)
				};
				
				if (navigator.onLine) {
					oModel.create("/DocumentosSet", oData, {
						success: async function (data) {
							await that.tripulacion.obtenerDocumentos(that, oModel);
							sap.m.MessageBox.success("Se cargó el archivo con éxito.");
							sap.ui.core.BusyIndicator.hide();
						},
						error: function (error) {
							sap.m.MessageToast.show("Ocurrió un error al adjuntar un archivo.");
							sap.ui.core.BusyIndicator.hide();
						}
					});
				} else {
					Util.saveObjectColaWithFiles(oData, that);
					sap.ui.core.BusyIndicator.hide();
				}
					
			};
			oFileReader.readAsDataURL(oFile);
		},
		_onCerrarDocumentos: function () {
			this._dialogUploadFile.close();
		},
		hexToBase64: function (e) {
			var o = "";
			for (var t = 0; t < e.length; t += 2) {
				o += String.fromCharCode(parseInt(e.substr(t, 2), 16));
			}
			return btoa(o);
		},
		b64toBlob: function (e, o, t) {
			o = o || "";
			t = t || 512;
			var r = atob(e);
			var i = [];
			for (var n = 0; n < r.length; n += t) {
				var a = r.slice(n, n + t);
				var c = new Array(a.length);
				for (var s = 0; s < a.length; s++) {
					c[s] = a.charCodeAt(s)
				}
				var l = new Uint8Array(c);
				i.push(l)
			}
			var f = new Blob(i, {
				type: o
			});
			return f
		},
		base64toHEX: function (base64) {
			var raw = atob(base64);
			var HEX = '';
			for ( i = 0; i < raw.length; i++ ) {
				var _hex = raw.charCodeAt(i).toString(16)
				HEX += (_hex.length==2?_hex:'0'+_hex);
			}
			return HEX.toUpperCase();
		}

	};
});