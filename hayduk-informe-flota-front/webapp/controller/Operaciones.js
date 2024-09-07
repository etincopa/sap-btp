sap.ui.define(["sap/ui/model/Filter", 'Hayduk/InformeDeFlota/model/Util', 'Hayduk/InformeDeFlota/controller/Calas',
	'Hayduk/InformeDeFlota/service/service', "sap/ui/model/json/JSONModel", "sap/m/TimePicker",
	"sap/m/Input", "sap/m/ColumnListItem", 'Hayduk/InformeDeFlota/controller/Operaciones'
], function (Filter, Util,
	Calas, getService, JSONModel, TimePicker, Input, ColumnListItem, Operaciones) {
	"use strict";

	//Crea variables globales para guardar las plantillas 
	var calPlantilla1 = [];
	var editPlantilla1;
	var calPlantilla2 = [];
	var editPlantilla2;
	var calPlantilla3 = [];
	var editPlantilla3;
	var calPlantilla4 = [];
	var editPlantilla4;
	var calPlantilla5 = [];
	var editPlantilla5 = [];

	//Plantillas extra
	var calPlantilla6 = []; //Plantilla1  agregando %juvenil y %Caballa
	var editPlantilla6;
	var calPlantilla7 = []; //PLantilla1 agregando %juvenil 
	var editPlantilla7;
	var calPlantilla8 = []; //Plantilla4  agregando %juvenil 
	var editPlantilla8;
	var calPlantilla9 = []; //PLantilla4 agregando %juvenil y %Caballa
	var editPlantilla9;
	var calPlantilla10 = []; //Plantilla5  agregando %juvenil y %Caballa
	var editPlantilla10;
	var calPlantilla11 = []; //PLantilla5 agregando %juvenil 
	var editPlantilla11;
	var calPlantilla12 = []; //Plantilla2  agregando %juvenil y %Caballa
	var editPlantilla12;
	var calPlantilla13 = []; //PLantilla2 agregando %juvenil 
	var editPlantilla13;
	var calPlantilla14 = []; //Plantilla3  agregando %juvenil y %Caballa
	var editPlantilla14;
	var calPlantilla15 = []; //PLantilla3 agregando %juvenil 
	var editPlantilla15;

	///////
	return {
		//Zarpe
		onZarpeSelect: function (oEvent) {
			var bZarpe = oEvent.getParameters().state;
			this.getJsonModel("Zarpe").setProperty("/Estado", bZarpe);

			if (bZarpe) {
				this.getJsonModel("InformeFlota").setProperty("/IndicadorZarpe", "X");
			} else {
				this.getJsonModel("InformeFlota").setProperty("/IndicadorZarpe", "");
			}

			this._byId("tblCalas").setVisible(bZarpe);

		},

		//Pesca
		onPescaSelect: function (oEvent) {
			var bPesca = oEvent.getParameters().state;
			this.getJsonModel("Pesca").setProperty("/Estado", bPesca);

			if (bPesca) {
				this.getJsonModel("InformeFlota").setProperty("/IndicadorPesca", "X");
			} else {
				this.getJsonModel("InformeFlota").setProperty("/IndicadorPesca", "");
			}

			this._byId("cbxCausaNoPesca").setEnabled(!bPesca);
		},

		//Causas de no Zarpe

		onChangeMotivo: function (oEvent) {
			if (!oEvent.getSource().getSelectedKey()) {
				this.MotivoNoZarpe = null;
				this._byId("inpCausaNoZarpe").setSelectedKey("");
				this._byId("inpCausaNoZarpe").setValue("");
			}
		},

		onSelectChangeMotivo: function (oEvent) {
			var sValue = oEvent.getParameters().selectedItem.getKey();

			if (this.MotivoNoZarpe && this.MotivoNoZarpe !== sValue) {
				this._byId("inpCausaNoZarpe").setSelectedKey("");
				this._byId("inpCausaNoZarpe").setValue("");
			}

			if (sValue) {
				this._byId("feCausaNoZarpe").setVisible(true);
				this.MotivoNoZarpe = sValue;
			} else {
				this._byId("feCausaNoZarpe").setVisible(false);
			}
		},

		handleCausaNoZarpeHelp: function (oEvent) {
			var that = this;
			this._CausaNoZarpe = oEvent.getSource().getId();
			var sInputValue = oEvent.getSource().getValue();

			if (that.MotivoNoZarpe) {
				// create value help dialog
				if (!this._causaNoZarpeDialog) {
					this._causaNoZarpeDialog = sap.ui.xmlfragment(
						"Hayduk.InformeDeFlota.view.fragments.dialogs.CausaNoZarpe",
						this
					);
					this.getView().addDependent(this._causaNoZarpeDialog);
				}
				//LLamo al servicio para poder setear la data de causa no Zarpe Segun el motivo
				var motivo = that.MotivoNoZarpe;
				// Se comentó esto porque es offline y se agregó el còdigo siguiente:
				// getService.getDataCausaNoZarpe(motivo).then((result) => {
				// 	this.getView().setModel(new JSONModel(result), "CausaNoZarpeSet");
					// this._causaNoZarpeDialog.open(sInputValue);
				// });
				var aLocal = JSON.parse(localStorage.getItem("CausaNoZarpeSet"));
				aLocal = aLocal.filter(oPos => oPos.Motivo === motivo);
				var aResult = {
					d: {
						results: aLocal
					}
				}
				this.getView().setModel(new JSONModel(aResult), "CausaNoZarpeSet");
				this._causaNoZarpeDialog.open(sInputValue);

				// this._causaNoZarpeDialog.getBinding("items").filter([new Filter(
				// 	"Motivo",
				// 	sap.ui.model.FilterOperator.EQ, that.MotivoNoZarpe
				// )]);

			} else {
				sap.m.MessageBox.warning("Seleccione un motivo de no zarpe");
			}

		},

		_handleCausaNoZarpeClose: function (oEvent) {
			var that = this;
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this._byId(that._CausaNoZarpe).setSelectedKey(oSelectedItem.getDescription());
			}

			oEvent.getSource().getBinding("items").filter([]);
		},

		_handleCausaNoZarpeSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			aFilter.push(new Filter("Nombre", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._causaNoZarpeDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));

		},

		selChangeTipoRed: function (oEvent) {
			if (oEvent.getParameter("selectedItem") || oEvent.getSource().mProperties.value) {
				$.sap.iValidarCalas++;
				var oTipoRed;
				if (oEvent.getParameter("selectedItem")) {
					oTipoRed = oEvent.getParameter("selectedItem").getBindingContext("TipoRedSet").getObject();
				}

				if (oEvent.getSource().mProperties.selectedKey) {
					oTipoRed = oEvent.getSource().mProperties.selectedKey;
				}

				var numInforme = this.getJsonModel("InformeFlota").getProperty("/Numero");

				//Agregado 
				var oCentro = this.getJsonModel("InformeFlota").getProperty("/Centro");
				var oModelAddBod = this.getOwnerComponent().getModel("addBod");
				var oDataAddBod = JSON.parse(oModelAddBod.getJSON());
				var plantilla1 = this.getJsonModel("CalasPlantilla1").getData();
				var oEditCalasPlantilla1 = this.oEditCalasPlantilla1;
				var oEspecie = this.getJsonModel("InformeFlota").getProperty("/Especie");
				
				Util.obtenerPlantilla(oCentro, oEspecie, oTipoRed, "Edit", this);
				// //Creo Las plantillas
				// if (calPlantilla4.length == 0) {
				// 	createPlantilla4(plantilla1, oEditCalasPlantilla1, oDataAddBod, this);
				// }
				// plantilla1 = this.getJsonModel("CalasPlantilla1").getData();
				// if (calPlantilla5.length == 0) {
				// 	createPlantilla5(plantilla1, oEditCalasPlantilla1, oDataAddBod, this);
				// 	createPlantillasExtra(oDataAddBod, this);
				// }
				// ///////////////////////////////////////////////////////////////////

				// if (!numInforme) {
				// 	numInforme = "";
				// }

				// this._byId("pnlCalas").setVisible(true);

				// if (oTipoRed.IdTipoRed === "03" || oTipoRed == "03") {
				// 	var oJuvJ12 = calPlantilla12.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ13 = calPlantilla13.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ2 = calPlantilla2.find(oPosition => oPosition.propertyName === "Efici");
					
				// 	if (oJuvJ12 !== undefined) { oJuvJ12.text = "% Juv Anch" }
				// 	if (oJuvJ13 !== undefined) { oJuvJ13.text = "% Juv Anch" }
				// 	if (oJuvJ2 !== undefined) { oJuvJ2.text = "% Juv Anch" }
				// 	//Plantilla Calas 2
				// 	switch (oEspecie) {
				// 	case "16000000":
				// 		this.getJsonModel("CalasPlantilla2").setData(calPlantilla12);
				// 		Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
				// 		break;
				// 	case "16000002":
				// 		this.getJsonModel("CalasPlantilla2").setData(calPlantilla12);
				// 		Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
				// 		break;
				// 	case "16000018":
				// 		this.getJsonModel("CalasPlantilla2").setData(calPlantilla13);
				// 		Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
				// 		break;
				// 	case "16000022":
				// 		this.getJsonModel("CalasPlantilla2").setData(calPlantilla12);
				// 		Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
				// 		break;
				// 	default:
				// 		this.getJsonModel("CalasPlantilla2").setData(calPlantilla2);
				// 		Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
				// 		break;
				// 	}

				// } else if (oTipoRed.IdTipoRed === "04" || oTipoRed == "04") {
				// 	var oJuvJ14 = calPlantilla14.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ15 = calPlantilla15.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ3 = calPlantilla3.find(oPosition => oPosition.propertyName === "Efici");
					
				// 	if (oJuvJ14 !== undefined) { oJuvJ14.text = "% Juv Anch" }
				// 	if (oJuvJ15 !== undefined) { oJuvJ15.text = "% Juv Anch" }
				// 	if (oJuvJ3 !== undefined) { oJuvJ3.text = "% Juv Anch" }
				// 	//Plantilla Calas 3
				// 	switch (oEspecie) {
				// 	case "16000000":
				// 		this.getJsonModel("CalasPlantilla3").setData(calPlantilla14);
				// 		Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
				// 		break;
				// 	case "16000002":
				// 		this.getJsonModel("CalasPlantilla3").setData(calPlantilla14);
				// 		Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
				// 		break;
				// 	case "16000018":
				// 		this.getJsonModel("CalasPlantilla3").setData(calPlantilla15);
				// 		Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
				// 		break;
				// 	case "16000022":
				// 		this.getJsonModel("CalasPlantilla3").setData(calPlantilla14);
				// 		Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
				// 		break;
				// 	default:
				// 		this.getJsonModel("CalasPlantilla3").setData(calPlantilla3);
				// 		Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
				// 		break;
				// 	}

				// } else {
				// 	var oJuvJ8 = calPlantilla8.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ9 = calPlantilla9.find(oPosition => oPosition.propertyName === "Efici");
				// 	var oJuvJ4 = calPlantilla4.find(oPosition => oPosition.propertyName === "Efici");
					
				// 	if (oJuvJ8 !== undefined) { oJuvJ8.text = "% Juv Anch" }
				// 	if (oJuvJ9 !== undefined) { oJuvJ9.text = "% Juv Anch" }
				// 	if (oJuvJ4 !== undefined) { oJuvJ4.text = "% Juv Anch" }
				// 	//Plantilla Calas 1	
				// 	//Agregue una condicional
				// 	if (oCentro == "H307") {
				// 		switch (oEspecie) {
				// 		case "16000000":
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla8);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000002":
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla8);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000018":
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla9);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000022":
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla8);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		default:
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla4);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1,
				// 				this);
				// 			break;
				// 		}

				// 	} else if (oCentro == "" && oEspecie == "16000002") {
				// 		var oJuvJ10 = calPlantilla10.find(oPosition => oPosition.propertyName === "Efici");
				// 		if (oJuvJ10 !== undefined) { oJuvJ10.text = "% Juv Anch" }
				// 		this.getJsonModel("CalasPlantilla1").setData(calPlantilla10);
				// 		Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 	} else {
				// 		switch (oEspecie) {
				// 		case "16000000":
				// 			var oJuvJ6 = calPlantilla6.find(oPosition => oPosition.propertyName === "Juven_Anch");
							
				// 			if (oJuvJ6 !== undefined) { oJuvJ6.text = "% Juv Anch" }
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla6);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000002":
				// 			var oJuvJ10 = calPlantilla10.find(oPosition => oPosition.propertyName === "Efici");
				// 			if (oJuvJ10 !== undefined) { oJuvJ10.text = "% Juv Anch" }
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla10);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000018":
				// 			var oJuvJ = calPlantilla7.find(oPosition => oPosition.propertyName === "Juven_Anch"),
				// 				oJuvC = calPlantilla7.find(oPosition => oPosition.propertyName === "Juven_Jure");
							
				// 			if (oJuvJ !== undefined) { oJuvJ.text = "% Juv J"}
				// 			if (oJuvC !== undefined) { oJuvC.text = "% Juv C" }
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla7);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		case "16000022":
				// 			var oJuvJ6 = calPlantilla6.find(oPosition => oPosition.propertyName === "Efici");
				// 			if (oJuvJ6 !== undefined) { oJuvJ6.text = "% Juv Anch" }
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla6);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
				// 			break;
				// 		default:
				// 			var oJuvJ1 = calPlantilla1.find(oPosition => oPosition.propertyName === "Efici");
				// 			if (oJuvJ1 !== undefined) { oJuvJ1.text = "% Juv Anch" }
				// 			this.getJsonModel("CalasPlantilla1").setData(calPlantilla1);
				// 			Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1,
				// 				this);
				// 			break;
				// 		}
				// 	}
				// }
				// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77

				// if (this.getJsonModel("Configuracion").getProperty("/Editable")) {
				// 	if (oTipoRed.IdTipoRed === "03" || oTipoRed === "03") {
				// 		//Plantilla Calas 2
				// 		switch (oEspecie) {
				// 		case "16000000":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla12,
				// 				"Edit");
				// 			break;
				// 		case "16000002":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla12,
				// 				"Edit");
				// 			break;
				// 		case "16000018":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla13,
				// 				"Edit");
				// 			break;
				// 		case "16000022":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla12,
				// 				"Edit");
				// 			break;
				// 		default:
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla2,
				// 				"Edit");
				// 			break;
				// 		}

				// 	} else if (oTipoRed.IdTipoRed === "04" || oTipoRed === "04") {
				// 		//Plantilla Calas 3
				// 		switch (oEspecie) {
				// 		case "16000000":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla14,
				// 				"Edit");
				// 			break;
				// 		case "16000002":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla14,
				// 				"Edit");
				// 			break;
				// 		case "16000018":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla15,
				// 				"Edit");
				// 			break;
				// 		case "16000022":
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla14,
				// 				"Edit");
				// 			break;
				// 		default:
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla3,
				// 				"Edit");
				// 			break;
				// 		}

				// 	} else {
				// 		//Plantilla Calas 1
				// 		//this.oEditCalasPlantilla1;
				// 		if (oCentro == "H307") {
				// 			switch (oEspecie) {
				// 			case "16000000":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla8,
				// 					"Edit");
				// 				break;
				// 			case "16000002":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla8,
				// 					"Edit");
				// 				break;
				// 			case "16000018":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla9,
				// 					"Edit");
				// 				break;
				// 			case "16000022":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla8,
				// 					"Edit");
				// 				break;
				// 			default:
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla4,
				// 					"Edit");
				// 				break;
				// 			}

				// 		} else if (oCentro == "" && oEspecie == "16000002") {
				// 			this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla10,
				// 				"Edit");

				// 		} else {

				// 			switch (oEspecie) {
				// 			case "16000000":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla6,
				// 					"Edit");
				// 				break;
				// 			case "16000002":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla10,
				// 					"Edit");
				// 				break;
				// 			case "16000018":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla7,
				// 					"Edit");
				// 				break;
				// 			case "16000022":
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla6,
				// 					"Edit");
				// 				break;
				// 			default:
				// 				this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla1,
				// 					"Edit");
				// 				break;
				// 			}
				// 		}
				// 	}
				// }
				
				// //Ocultar columnas para la especie 16000002
				// if (oEspecie == "16000002") {
				// 	this.oper.esconderColumna(true, this);
				// } else {
				// 	this.oper.esconderColumna(false, this);
				// }
				
				// this.oper.esconderFechayHora(false, this);
				// //Setear ancho a las columnas
				// var aColumnasWidht = [
				// 	{nombre: "Fondo", ancho: "100px"}, {nombre: "TSM", ancho: "100px"}, {nombre: "Profundidad", ancho: "100px"},
				// 	{nombre: "Bod 1", ancho: "80px"}, {nombre: "Bod 2", ancho: "80px"}, {nombre: "Bod 3", ancho: "80px"},
				// 	{nombre: "Bod 4", ancho: "80px"}, {nombre: "Bod 5", ancho: "80px"}, {nombre: "Bod 6", ancho: "80px"},
				// 	{nombre: "Bod 7", ancho: "80px"}, {nombre: "Bod 8", ancho: "80px"}, {nombre: "Bod. Total", ancho: "90px"},
				// 	{nombre: "Bod. Proa", ancho: "90px"}, {nombre: "Bod. Tunel", ancho: "90px"}, {nombre: "Bod. Popa", ancho: "90px"},
				// 	{nombre: "% Juv J", ancho: "90px"}, {nombre: "% Juv C", ancho: "90px"}
				// ];
				// this.oper.setWithColumna(aColumnasWidht, this);
			}

			function createPlantilla4(plantilla1, oEditCalasPlantilla1, oDataAddBod, that) {
				var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;
				var e = oEditCalasPlantilla1;
				calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));
				editPlantilla1 = $.extend(true, {}, e);
				console.log(editPlantilla1);

				plantilla1[18] = oDataAddBod.Bod1_Extens; //15
				plantilla1[19] = oDataAddBod.Bod2_Extens; //16
				plantilla1[20] = oDataAddBod.Bod3_Extens; //17

				plantilla1.splice(21, 0, oDataAddBod.Bod4_Extens); //18
				Calas.buildItems(plantilla1[21], aCellsEdit, that, 1); //18
				oEditCalasPlantilla1.mAggregations.cells.splice(21, 0, oEditCalasPlantilla1.mAggregations.cells[24]); //18 - 21
				oEditCalasPlantilla1.removeCell(23); //22

				plantilla1.splice(22, 0, oDataAddBod.Bod5_Extens); //19
				Calas.buildItems(plantilla1[22], aCellsEdit, that, 1); //19
				oEditCalasPlantilla1.mAggregations.cells.splice(22, 0, oEditCalasPlantilla1.mAggregations.cells[25]); //19 - 22
				oEditCalasPlantilla1.removeCell(26); //23

				plantilla1.splice(23, 0, oDataAddBod.Bod6_Extens); //20
				Calas.buildItems(plantilla1[23], aCellsEdit, that, 1); //20
				oEditCalasPlantilla1.mAggregations.cells.splice(23, 0, oEditCalasPlantilla1.mAggregations.cells[26]); //20 - 23
				oEditCalasPlantilla1.removeCell(27); //24

				plantilla1.splice(24, 0, oDataAddBod.Bod7_Extens); //21
				Calas.buildItems(plantilla1[24], aCellsEdit, that, 1); //21
				oEditCalasPlantilla1.mAggregations.cells.splice(24, 0, oEditCalasPlantilla1.mAggregations.cells[27]); //21 - 24
				oEditCalasPlantilla1.removeCell(28); // 25

				plantilla1.splice(25, 0, oDataAddBod.Bod8_Extens); //22
				Calas.buildItems(plantilla1[25], aCellsEdit, that, 1); //22
				oEditCalasPlantilla1.mAggregations.cells.splice(25, 0, oEditCalasPlantilla1.mAggregations.cells[28]); //22 - 25
				oEditCalasPlantilla1.removeCell(29); //26

				calPlantilla4 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla4 = $.extend(true, {}, oEditCalasPlantilla1);

				that.getJsonModel("CalasPlantilla1").setData(calPlantilla1);
				Calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla1,
					"Edit");
			}

			function createPlantilla5(plantilla1, oEditCalasPlantilla1, oDataAddBod, that) {
				var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;
				var e = editPlantilla1;
				var cloneEditPlantilla1 = $.extend(true, 0, e);
				calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));
				plantilla1[18] = oDataAddBod.Bod1_Extens; //15
				plantilla1[19] = oDataAddBod.Bod2_Extens; //16
				plantilla1[20] = oDataAddBod.Bod3_Extens; //17

				plantilla1.splice(21, 0, calPlantilla4[21]); //18
				cloneEditPlantilla1.addCell(oEditCalasPlantilla1.mAggregations.cells[21]); //18
				cloneEditPlantilla1.mAggregations.cells.splice(21, 0, cloneEditPlantilla1.mAggregations.cells[24]); //18 - 21
				cloneEditPlantilla1.removeCell(25); //22

				plantilla1.splice(22, 0, calPlantilla4[22]); //19
				cloneEditPlantilla1.addCell(oEditCalasPlantilla1.mAggregations.cells[22]); //19
				cloneEditPlantilla1.mAggregations.cells.splice(22, 0, cloneEditPlantilla1.mAggregations.cells[25]); //19 - 22
				cloneEditPlantilla1.removeCell(26); //23

				calPlantilla5 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla5 = $.extend(true, {}, cloneEditPlantilla1);

				that.getJsonModel("CalasPlantilla1").setData(calPlantilla1);
				Calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], cloneEditPlantilla1,
					"Edit");
			}

			function createPlantillasExtra(oDataAddBod, that) {
				var plantilla1 = that.getJsonModel("CalasPlantilla1").getData();
				calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));
				var e = editPlantilla1;
				var oEditCalasPlantilla1 = $.extend(true, {}, e);
				var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;
				plantilla1.splice(22, 0, oDataAddBod.Juven_Anch); //19
				Calas.buildItems(plantilla1[22], aCellsEdit, that, 1); //19
				oEditCalasPlantilla1.mAggregations.cells.splice(22, 0, oEditCalasPlantilla1.mAggregations.cells[24]); //19 - 21
				oEditCalasPlantilla1.removeCell(25); //22

				plantilla1.splice(23, 1); //20
				oEditCalasPlantilla1.removeCell(23); //20

				//Guardo la Plantilla 6
				calPlantilla6 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla6 = $.extend(true, {}, oEditCalasPlantilla1);

				plantilla1.splice(23, 0, oDataAddBod.Juven_Jure); //20
				Calas.buildItems(plantilla1[23], aCellsEdit, that, 1); //20
				oEditCalasPlantilla1.mAggregations.cells.splice(23, 0, oEditCalasPlantilla1.mAggregations.cells[24]); //20 - 21
				oEditCalasPlantilla1.removeCell(25); //22

				//Guardo La plantilla 7
				calPlantilla7 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla7 = $.extend(true, {}, oEditCalasPlantilla1);

				//Seteo el modelo de la plantilla1
				that.getJsonModel("CalasPlantilla1").setData(calPlantilla4);
				Calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla4,
					"Edit");

				////////////////////////////////////////////////////////////////////////////////////////////7
				plantilla1 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				e = editPlantilla4;
				oEditCalasPlantilla1 = $.extend(true, {}, e);
				aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

				plantilla1.splice(27, 0, oDataAddBod.Juven_Anch); //24
				Calas.buildItems(plantilla1[27], aCellsEdit, that, 2); //24
				oEditCalasPlantilla1.mAggregations.cells.splice(27, 0, oEditCalasPlantilla1.mAggregations.cells[29]); //24 - 26
				oEditCalasPlantilla1.removeCell(30); //27

				plantilla1.splice(28, 1); //25
				oEditCalasPlantilla1.removeCell(29); //26
				//Guardo la Plantilla 8
				
				calPlantilla8 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla8 = $.extend(true, {}, oEditCalasPlantilla1);

				plantilla1.splice(28, 0, oDataAddBod.Juven_Jure); //25
				Calas.buildItems(plantilla1[28], aCellsEdit, that, 2); //25
				oEditCalasPlantilla1.mAggregations.cells.splice(28, 0, oEditCalasPlantilla1.mAggregations.cells[29]); //25 - 26
				oEditCalasPlantilla1.removeCell(30); //27

				//Guardo La plantilla 9
				calPlantilla9 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla9 = $.extend(true, {}, oEditCalasPlantilla1);

				that.getJsonModel("CalasPlantilla1").setData(calPlantilla5);
				Calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla5,
					"Edit");
				/////////////////////////////////////////////////////////////////////////////////////77/////////////77
				plantilla1 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				e = editPlantilla5;
				oEditCalasPlantilla1 = $.extend(true, {}, e);
				aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

				plantilla1.splice(24, 0, oDataAddBod.Juven_Anch); //21
				Calas.buildItems(plantilla1[24], aCellsEdit, that, 3); //21
				oEditCalasPlantilla1.mAggregations.cells.splice(24, 0, oEditCalasPlantilla1.mAggregations.cells[26]); //21 - 23
				oEditCalasPlantilla1.removeCell(27); //24

				plantilla1.splice(25, 1); //22
				oEditCalasPlantilla1.removeCell(25); //23
				//Guardo la Plantilla 10
				calPlantilla10 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla10 = $.extend(true, {}, oEditCalasPlantilla1);

				plantilla1.splice(25, 0, oDataAddBod.Juven_Jure); //22
				Calas.buildItems(plantilla1[25], aCellsEdit, that, 3); //22
				oEditCalasPlantilla1.mAggregations.cells.splice(25, 0, oEditCalasPlantilla1.mAggregations.cells[26]); //22 - 23
				oEditCalasPlantilla1.removeCell(27); //24

				//Guardo La plantilla 11
				calPlantilla11 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
				editPlantilla11 = $.extend(true, {}, oEditCalasPlantilla1);

				that.getJsonModel("CalasPlantilla1").setData(calPlantilla1);
				Calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla1,
					"Edit");

				//////////////////////////////////////////77///////////////////////////////////////////////////////////////////////////////////777777

				var plantilla2 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
				calPlantilla2 = JSON.parse(JSON.stringify(plantilla2));
				e = that.oEditCalasPlantilla2;
				editPlantilla2 = $.extend(true, {}, e);
				var oEditCalasPlantilla2 = $.extend(true, {}, e);
				aCellsEdit = oEditCalasPlantilla2.mAggregations.cells;

				plantilla2.splice(29, 0, oDataAddBod.Juven_Anch); //26
				Calas.buildItems(plantilla2[29], aCellsEdit, that, 4); //26
				oEditCalasPlantilla2.mAggregations.cells.splice(29, 0, oEditCalasPlantilla2.mAggregations.cells[31]); //26 - 28
				oEditCalasPlantilla2.removeCell(32); //29

				plantilla2.splice(30, 1); //27
				oEditCalasPlantilla2.removeCell(30); //27
				//Guardo la Plantilla 12
				calPlantilla12 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
				editPlantilla12 = $.extend(true, {}, oEditCalasPlantilla2);

				plantilla2.splice(30, 0, oDataAddBod.Juven_Jure); //27
				Calas.buildItems(plantilla2[30], aCellsEdit, that, 4); //27
				oEditCalasPlantilla2.mAggregations.cells.splice(30, 0, oEditCalasPlantilla2.mAggregations.cells[31]); //27 - 28
				oEditCalasPlantilla2.removeCell(32); //29

				//Guardo La plantilla 13
				calPlantilla13 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
				editPlantilla13 = $.extend(true, {}, oEditCalasPlantilla2);

				that.getJsonModel("CalasPlantilla2").setData(calPlantilla2);
				Calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla2,
					"Edit");

				/////////////////////////////////////////////////////////////////////////////////////////////////////////////

				var plantilla3 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
				calPlantilla3 = JSON.parse(JSON.stringify(plantilla3));
				e = that.oEditCalasPlantilla3;
				editPlantilla3 = $.extend(true, {}, e);
				var oEditCalasPlantilla3 = $.extend(true, {}, e);
				aCellsEdit = oEditCalasPlantilla3.mAggregations.cells;

				plantilla3.splice(27, 0, oDataAddBod.Juven_Anch); //24
				Calas.buildItems(plantilla3[27], aCellsEdit, that, 5); //24
				oEditCalasPlantilla3.mAggregations.cells.splice(27, 0, oEditCalasPlantilla3.mAggregations.cells[29]); //24 - 26
				oEditCalasPlantilla3.removeCell(30); //27

				plantilla3.splice(28, 1); //25
				oEditCalasPlantilla3.removeCell(28); //25

				//Guardo la Plantilla 14
				calPlantilla14 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
				editPlantilla14 = $.extend(true, {}, oEditCalasPlantilla3);

				plantilla3.splice(28, 0, oDataAddBod.Juven_Jure); //25
				Calas.buildItems(plantilla3[28], aCellsEdit, that, 5); //25
				oEditCalasPlantilla3.mAggregations.cells.splice(28, 0, oEditCalasPlantilla3.mAggregations.cells[29]); //25 - 26
				oEditCalasPlantilla3.removeCell(30); //27

				//Guardo La plantilla 15
				calPlantilla15 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
				editPlantilla15 = $.extend(true, {}, oEditCalasPlantilla3);

				that.getJsonModel("CalasPlantilla3").setData(calPlantilla3);
				Calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
				that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], editPlantilla3,
					"Edit");
			}
		},

		//Maquila
		handleMaquilaHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this._Maquila = oEvent.getSource().getId();
			if (!this._maquilaDialog) {
				this._maquilaDialog = sap.ui.xmlfragment(
					"Hayduk.InformeDeFlota.view.fragments.dialogs.Maquila",
					this
				);
				this.getView().addDependent(this._maquilaDialog);
			}

			this._maquilaDialog.open(sInputValue);
		},

		_handleMaquilaClose: function (oEvent) {
			var oInpMaquila = this._byId(this._Maquila);
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				oInpMaquila.setSelectedKey(oSelectedItem.getDescription());
				oInpMaquila.setValueState(sap.ui.core.ValueState.None);
			}

			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleMaquilaSearch: function (oEvent) {
			var sInputValue = oEvent.getParameter("value").toUpperCase();
			var aFilter = [];
			aFilter.push(new Filter("Texto", sap.ui.model.FilterOperator.Contains, sInputValue));
			aFilter.push(new Filter("Identificador", sap.ui.model.FilterOperator.Contains, sInputValue));

			this._maquilaDialog.getBinding("items").filter(new Filter({
				filters: aFilter,
				and: false
			}));
		},

		onLiveChangeMaquila: function (oEvent) {
			Util.toUpperCase(oEvent);
			var oInpMaquila = oEvent.getSource();
			var sMaquila = oEvent.getParameter("value");
			var aMaquilas = this.getJsonModel("MaquilaSet").getData().d.results;

			//console.log(aEspecies);
			if (aMaquilas.length > 0) {
				var nPos = Util.binarySearch(aMaquilas, sMaquila, "Identificador");
				if (nPos !== -1) {
					//console.log(aEspecies[nPos]);
					oInpMaquila.setValueState(sap.ui.core.ValueState.None);
					this.getJsonModel("InformeFlota").setProperty("/EmpMaquila", aMaquilas[nPos].Identificador);

				} else {
					oInpMaquila.setValueState(sap.ui.core.ValueState.Error);
				}
			}
		},
		
		esconderColumna: function (sModo, that) {
			var oColumns = that._byId("tblCalas").getColumns();
			for (var i = 0, n = oColumns.length; i < n; i++) {
				if (oColumns[i].getHeader().getText() == "Fecha y Hora Salmuera") {
					oColumns[i].setVisible(sModo);
				}
				if (oColumns[i].getHeader().getText() == "% Juv Anch" && sModo) {
					oColumns[i].setVisible(false);
				} else if (oColumns[i].getHeader().getText() == "% Juv Anch" && !sModo) {
					oColumns[i].setVisible(true);
				}
			}
		},
		esconderColumnaEspecifica: function (sColumna, bVisible, that) {
			var oColumns = that._byId("tblCalas").getColumns();
			for (var i = 0, n = oColumns.length; i < n; i++) {
				if (oColumns[i].getHeader().getText() == sColumna) {
					oColumns[i].setVisible(bVisible);
				}
			}
		},
		esconderFechayHora: function (sModo, that) {
			var oColumns = that._byId("tblCalas").getColumns();
			for (var i = 0, n = oColumns.length; i < n; i++) {
				if (oColumns[i].getHeader().getText() == "Fecha Inicio" || oColumns[i].getHeader().getText() == "Hora Inicio"
					|| oColumns[i].getHeader().getText() == "Fecha Fin" || oColumns[i].getHeader().getText() == "Hora Fin"
					|| oColumns[i].getHeader().getText() == "Fecha Salmuera" || oColumns[i].getHeader().getText() == "Hora Salmuera") {
					oColumns[i].setVisible(sModo);
				}
			}
		},
		
		setWithColumna: function (aWithColumna, that) {
			var oColumns = that._byId("tblCalas").getColumns();
			
			for (var i = 0, n = oColumns.length; i < n; i++) {
				var oCol = aWithColumna.find(oPos => oPos.nombre == oColumns[i].getHeader().getText());
				
				if (oCol !== undefined) {
					oColumns[i].setWidth(oCol.ancho);
				}
			}
		}
	};
});