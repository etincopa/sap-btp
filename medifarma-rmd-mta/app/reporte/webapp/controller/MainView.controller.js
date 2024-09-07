sap.ui.define([
    'sap/m/library',
	"sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "mif/rmd/reporte/services/reporte",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "mif/rmd/reporte/services/DemoPersoService",
	"sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (mlibrary, Controller, MessageBox, reporteService, BusyIndicator, Filter, FilterOperator, DemoPersoService, TablePersoController, Spreadsheet) {
		"use strict";
        let oThat;
        const sIdPlanta = 18,
        // EdmType = exportLibrary.EdmType,
        sIdTipoDatoRealizadoPor = 439,
        sIdTipoDatoVistoBueno = 440,
        sIdTipoDatoRealizadoPoryVistoBueno = 441;
        
		return Controller.extend("mif.rmd.reporte.controller.MainView", {
			onInit: function () {
                oThat = this;

                this._oTPC = new TablePersoController({
                    table: this.byId("tblRMD"),
                    componentName: "reporte",
                    persoService: DemoPersoService
                }).activate();
			},
            onAfterRendering: function () {
                this.modelGeneral = this.getView().getModel("modelGeneral");
                this.mainModelv2 = this.getView().getModel("mainModelv2");
                // this.mainModelv2 = this.getView().getModel("mainModelv2");
                this.oModelErpNec = oThat.getOwnerComponent().getModel("NECESIDADESRMD_SRV");
                this.i18n = this.getView().getModel("i18n").getResourceBundle();
                this.onGetAreaOdata();
                this.onCargarFiltros();
                // this.onCargaEtapaProd();

                // if(!this._oTPC){
                //     this._oTPC = new TablePersoController({
                //         table: this.byId("tblRMD"),
                //         componentName: "reporte",
                //         persoService: DemoPersoService
                //     }).activate();
                // }
            },
            onExit: function () {
                this._oTPC.destroy();
            },
            onPersoButtonPressed: function(){
                this._oTPC.openDialog();
            },
            onTablePersoRefresh : function() {
                DemoPersoService.resetPersData();
                this._oTPC.refresh();
            },
            onCargarFiltros: async function () {
                var oFilterEstadoRMD= [],
                oFilterEstadoPro = [],
                oFilterPlanta = [];

                oFilterEstadoRMD.push(new Filter("oMaestraTipo_maestraTipoId", FilterOperator.EQ, 44));
                oFilterEstadoPro.push(new Filter("oMaestraTipo_maestraTipoId", FilterOperator.EQ, 48));
                oFilterPlanta.push(new Filter("oMaestraTipo_maestraTipoId", FilterOperator.EQ, sIdPlanta));
                
                var aListEstadoRMD = await reporteService.getDataFilter(oThat.mainModelv2, "/MAESTRA", oFilterEstadoRMD);
                // var aListEstadoPro = await reporteService.getDataFilter(oThat.mainModelv2, "/MAESTRA", oFilterEstadoPro);
                var aListPlanta = await reporteService.getDataFilter(oThat.mainModelv2, "/MAESTRA", oFilterPlanta);

                var constanteEtapa = 'ETAPA_PRODUCCION';
                var  aFilters = [];
                aFilters.push(new Filter("AtinnText", "EQ", constanteEtapa));
                let aListEstadoPro = await reporteService.getDataFilter(oThat.oModelErpNec, "/CaracteristicasSet", aFilters);

                aListEstadoPro.results.sort(function (a, b) {
                    return a.Atzhl - b.Atzhl;
                });

                oThat.modelGeneral.setProperty("/cmbState", aListEstadoRMD.results);
                oThat.modelGeneral.setProperty("/cmbStageProduction", aListEstadoPro.results); // se cambia filtro etapa produccion
                oThat.modelGeneral.setProperty("/cmbPlanta", aListPlanta.results);

                BusyIndicator.show(0);
                await reporteService.getDataProductAjax("/ProductoSet").then(function (oListProductos) {
                    oThat.modelGeneral.setProperty("/cmbArticulo", oListProductos);
                    BusyIndicator.hide();
                }).catch(function (oError) {
                    console.log(oError);
                    BusyIndicator.hide();
                })
            },
            selectionArticuloFinish: function (oEvent) {
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroArticuloKeys", []);
                var keysSelected = oEvent.getSource().getSelectedKey();
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroArticuloKeys", keysSelected);
            },
            selectionEstadoFinish: function (oEvent) {
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroEstadoKeys", []);
                var keysSelected = oEvent.getSource().getSelectedKeys();
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroEstadoKeys", keysSelected);
            },
            selectionEstadoProFinish: function (oEvent) {
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroEstadoProKeys", []);
                var keysSelected = oEvent.getSource().getSelectedKey();
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroEstadoProKeys", keysSelected);
            },
            selectionAreaFinish: function (oEvent) {
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroAreaKeys", []);
                var keysSelected = oEvent.getSource().getSelectedKey();
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroAreaKeys", keysSelected);
            },
            selectionPlantaFinish: async function (oEvent) {
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroPlantaKeys", []);
                var keysSelected = oEvent.getSource().getSelectedKey();
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroPlantaKeys", keysSelected);

                BusyIndicator.show(0);
                await reporteService.getDataAjax(keysSelected).then(function (oListAreas) {
                    oThat.modelGeneral.setProperty("/cmbArea", oListAreas);
                    BusyIndicator.hide();
                }).catch(function (oError) {
                    console.log(oError);
                    BusyIndicator.hide();
                })
            },
            onGetAreaOdata: async function () {
                BusyIndicator.show(0);
                let aFilters = [];
                let constanteArea = 'AREA_TRABAJO';
                aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
                let oResponse = await reporteService.onGetDataGeneralFilters(oThat.oModelErpNec, "CaracteristicasSet", aFilters);
                oThat.modelGeneral.setProperty("/aListaSecciones", oResponse.results);
                BusyIndicator.hide();
            },
            onSearchRMD: async function () {
                var oFilterRmd = [];
                var oDataFilter = oThat.modelGeneral.getProperty("/oDataFilter");
                var keysToFiltro = oThat.modelGeneral.getProperty("/FiltrosMain");
                var oFilters = this.modelGeneral.getProperty("/oFilters");
                var sExpandMD = "mdId/estadoIdProceso,estadoIdRmd,mdId/aReceta/recetaId";

                if(oDataFilter.descripcion !== undefined && oDataFilter.descripcion !== "" && oDataFilter.descripcion !== null){
                    oFilterRmd.push(new Filter("descripcion", FilterOperator.Contains, oDataFilter.descripcion));
                }

                if(oDataFilter.lote !== undefined && oDataFilter.lote !== "" && oDataFilter.lote !== null){
                    oFilterRmd.push(new Filter("lote", FilterOperator.EQ, oDataFilter.lote));
                }

                if(oDataFilter.ordenSAP !== undefined && oDataFilter.ordenSAP !== "" && oDataFilter.ordenSAP !== null){
                    oFilterRmd.push(new Filter("ordenSAP", FilterOperator.EQ, oDataFilter.ordenSAP));
                }

                if(oDataFilter.fechainiRMD !== undefined && oDataFilter.fechainiRMD !== "" && oDataFilter.fechainiRMD !== null){
                    // oFilterRmd.push(new Filter("fechaInicio", FilterOperator.EQ, oDataFilter.fechainiRMD));
                    oFilterRmd.push(new Filter("fechaInicio", FilterOperator.BT, oDataFilter.fechainiRMD, oDataFilter.fechafinRMD));
                }


                if (keysToFiltro) {
                    if (keysToFiltro.filtroEstadoKeys) {
                        keysToFiltro.filtroEstadoKeys.forEach(function (e) {
                            oFilterRmd.push(new Filter("estadoIdRmd_iMaestraId", FilterOperator.EQ, e));
                        });
                    }

                    if (keysToFiltro.filtroArticuloKeys) {
                        oFilterRmd.push(new Filter("productoId", FilterOperator.EQ, keysToFiltro.filtroArticuloKeys));
                    }
                }

                var aListRMD = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD", sExpandMD, oFilterRmd);
                
                if(keysToFiltro.filtroEstadoProKeys !== "" && keysToFiltro.filtroEstadoProKeys !== undefined && keysToFiltro.filtroEstadoProKeys !== null){
                    aListRMD.results = aListRMD.results.filter(item => item.mdId.nivelTxt === keysToFiltro.filtroEstadoProKeys);
                }

                if(oFilters.area !== "" && oFilters.area !== undefined && oFilters.area !== null){
                    // aListRMD.results = aListRMD.results.filter(item => item.mdId.areaRmd === keysToFiltro.filtroAreaKeys);
                    aListRMD.results = aListRMD.results.filter(item => item.areaRmdTxt === oFilters.area);
                }

                aListRMD.results.forEach(element => {
                    element.fechaHabilitaRMD    = element.fechaHabilita ? oThat.onFormatterFechaBusqueda(element.fechaHabilita,true) : "";
                    element.fechaVenc           = element.vfdat;
                    element.fechaVencRMD        = element.fechaVenc ? oThat.onFormatterFechaBusqueda(element.fechaVenc,false) : "";
                    element.fechaInicioRMD      = element.fechaInicioRegistro ? oThat.onFormatterFechaBusqueda(element.fechaInicioRegistro,true) : "";
                    element.fechaCierreRMD      = element.fechaFinRegistro ? oThat.onFormatterFechaBusqueda(element.fechaFinRegistro,true) : "";
                    if(element.mdId){
                        element.mdId.fechaAutorizacionRMD = element.mdId.fechaAutorizacion ? oThat.onFormatterFechaBusqueda(element.mdId.fechaAutorizacion,true) : "";
                    }
                    if(element.estadoIdRmd){
                        element.fechaCierreRMDFinal = element.estadoIdRmd.contenido === "Cerrado" ? oThat.onFormatterFechaBusqueda(element.fechaActualiza,true) : "";
                    }
                })

                oThat.modelGeneral.setProperty("/reporteGeneral", aListRMD.results);
            },
            onFormatterFechaBusqueda: function(dFormatFecha,fullTime){
                var v_dia, v_mes, v_anio, dateEx, v_hora, v_minutos;
                dateEx = new Date(dFormatFecha);
                // // element.fechaHabilita = dateEx;

                // v_dia = dateEx.getUTCDate();
                // if(v_dia <= 9){
                //     v_dia = '0' + v_dia;
                // }
                // v_mes = dateEx.getUTCMonth() + 1;
                // if(v_mes <= 9){
                //     v_mes = '0' + v_mes;	
                // }
                // v_anio = dateEx.getUTCFullYear();

                // v_hora = dateEx.getHours();
                // v_minutos = dateEx.getMinutes()

                // if(v_hora <= 9){
                //     v_hora = '0' + v_hora;	
                // }
                // if(v_minutos <= 9){
                //     v_minutos = '0' + v_minutos;	
                // }

                if(fullTime){
                    return (`${
                        dateEx.getFullYear().toString().padStart(4, '0')}-${
                        (dateEx.getMonth()+1).toString().padStart(2, '0')}-${
                        dateEx.getDate().toString().padStart(2, '0')} ${
                        dateEx.getHours().toString().padStart(2, '0')}:${
                        dateEx.getMinutes().toString().padStart(2, '0')}`);
                }else {
                    return (`${
                        dateEx.getFullYear().toString().padStart(4, '0')}-${
                        (dateEx.getMonth()+1).toString().padStart(2, '0')}-${
                        dateEx.getDate().toString().padStart(2, '0')}`);
                }
            },
            onFormatterDate: function (dDate) {
                if(dDate){
                    dDate = new Date(dDate);
                    return (`${
                    dDate.getUTCFullYear().toString().padStart(4, '0')}-${
                    (dDate.getUTCMonth()+1).toString().padStart(2, '0')}-${
                    dDate.getUTCDate().toString().padStart(2, '0')}`);
                }else{
                  return "";
                }
              },
            
            onFormatterFechaExcel: function(elementdata){
                var element = elementdata;
                var dateEx, v_dia, v_mes, v_anio, v_hora, v_minutos;
                if (element){
                    dateEx = new Date(element);
                    element = dateEx;

                    v_dia = element.getUTCDate();
                    if(v_dia <= 9){
                        v_dia = '0' + v_dia;
                    }
                    v_mes = element.getUTCMonth() + 1;
                    if(v_mes <= 9){
                        v_mes = '0' + v_mes;	
                    }
                    v_anio = element.getUTCFullYear();
    
                    v_hora = element.getHours()
                    v_minutos = element.getMinutes()

                    if(v_hora <= 9){
                        v_hora = '0' + v_hora;	
                    }
                    if(v_minutos <= 9){
                        v_minutos = '0' + v_minutos;	
                    }
    
                    // return v_anio + "-" + v_mes + "-" + v_dia + " " + v_hora + ":" + v_minutos;
                    return v_anio + "-" + v_mes + "-" + v_dia;
                }else {
                    return "";
                }
            },
            onRestoreFilters: function () {
                oThat.modelGeneral.setProperty("/oDataFilter", {});
                oThat.modelGeneral.setProperty("/FiltrosMain", []);
                oThat.modelGeneral.setProperty("/oDataFilter/fechainiRMD", null);
                oThat.modelGeneral.setProperty("/oDataFilter/fechafinRMD", null);
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroPlantaKeys", null);
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroEstadoProKeys", null);
                oThat.modelGeneral.setProperty("/FiltrosMain/filtroArticuloKeys", null);
                oThat.modelGeneral.setProperty("/oFilters",{});
                oThat.getView().byId("idItemsArticulo").setSelectedKey();
                oThat.getView().byId("idEtapaProd").setSelectedKey();
                // oThat.getView().byId("idPlanta").setSelectedKey();
                oThat.getView().byId("idArea").setSelectedKey();
                oThat.getView().byId("idEstadoFilter").setSelectedKeys([]);
                oThat.modelGeneral.refresh(true);
            },
            onGetDataPasoInsumoPaso: function(sObjectPaso, item ,NumeradorPasoPaso){
                var objectData = Object.assign({},sObjectPaso);
                objectData.valorPaso = null;
                objectData.realizadoPor = null;
                objectData.vistoBueno = null;
                if(item.rmdEstructuraRecetaInsumoId){
                    var ePaso = item;
                    objectData.paso = (NumeradorPasoPaso+" "+oThat.onValidarInfo(item, "rmdEstructuraRecetaInsumoId.Maktx"));

                    objectData.realizadoPor = ePaso.realizadoPorUser && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPor || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.realizadoPorUser :"";
                    objectData.vistoBueno = ePaso.usuarioActualiza  && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoVistoBueno || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.usuarioActualiza :"";

                    if(!!ePaso.texto){
                        objectData.valorPaso = ePaso.texto;
                    }else if(!!ePaso.cantidad){
                        objectData.valorPaso = ePaso.cantidad;
                    }else if(!!ePaso.fecha){
                        objectData.valorPaso = oThat.onFormatterFechaExcel(ePaso.fecha);
                    }else if(!!ePaso.hora){
                        objectData.valorPaso = oThat.onGetHoras(ePaso.hora);
                    }else if(!!ePaso.fechaHora){
                        objectData.valorPaso = oThat.onFormatterFechaExcel(ePaso.fechaHora);
                    }else if(!!ePaso.rango){
                        objectData.valorPaso = ePaso.rango;
                    }else if(!!ePaso.datoFijo){
                        objectData.valorPaso = ePaso.datoFijo;
                    }else if(!!ePaso.formula){
                        objectData.valorPaso = ePaso.formula;
                    }else if(!!ePaso.vistoBueno){
                        // objectData.valorPaso = ePaso.vistoBueno;
                        objectData.valorPaso = 'ACTIVADO';
                        // objectData.vistoBueno = ePaso.vistoBueno;
                    }else if(ePaso.verifCheck === true){
                        objectData.valorPaso = 'ACTIVADO';
                    }else if(ePaso.verifCheck === false){
                        objectData.valorPaso = 'DESACTIVADO';
                    }else if(!!ePaso.multiCheckUser){
                        objectData.valorPaso = ePaso.multiCheckUser;
                    }else if(!!ePaso.realizadoPorUser){
                        objectData.valorPaso = ePaso.realizadoPorUser;
                    }else {
                        objectData.valorPaso = "";
                    }
                }else if(item.pasoHijoId){
                    var ePaso = item;
                    objectData.paso = (NumeradorPasoPaso+" "+oThat.onValidarInfo(item, "pasoHijoId.descripcion"));

                    objectData.realizadoPor = ePaso.realizadoPorUser && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPor || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.realizadoPorUser :"";
                    objectData.vistoBueno = ePaso.usuarioActualiza  && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoVistoBueno || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.usuarioActualiza :"";

                    if(!!ePaso.texto){
                        objectData.valorPaso = ePaso.texto;
                    }else if(!!ePaso.cantidad){
                        objectData.valorPaso = ePaso.cantidad;
                    }else if(!!ePaso.fecha){
                        objectData.valorPaso = oThat.onFormatterFechaExcel(ePaso.fecha);
                    }else if(!!ePaso.hora){
                        objectData.valorPaso = oThat.onGetHoras(ePaso.hora);
                    }else if(!!ePaso.fechaHora){
                        objectData.valorPaso = oThat.onFormatterFechaExcel(ePaso.fechaHora);
                    }else if(!!ePaso.rango){
                        objectData.valorPaso = ePaso.rango;
                    }else if(!!ePaso.datoFijo){
                        objectData.valorPaso = ePaso.datoFijo;
                    }else if(!!ePaso.formula){
                        objectData.valorPaso = ePaso.formula;
                    }else if(!!ePaso.vistoBueno){
                        // objectData.valorPaso = ePaso.vistoBueno;
                        objectData.valorPaso = 'ACTIVADO';
                        // objectData.vistoBueno = ePaso.vistoBueno;
                    }else if(ePaso.verifCheck === true){
                        objectData.valorPaso = 'ACTIVADO';
                    }else if(ePaso.verifCheck === false){
                        objectData.valorPaso = 'DESACTIVADO';
                    }else if(!!ePaso.multiCheckUser){
                        objectData.valorPaso = ePaso.multiCheckUser;
                    }else if(!!ePaso.realizadoPorUser){
                        objectData.valorPaso = ePaso.realizadoPorUser;
                    }else {
                        objectData.valorPaso = "";
                    }
                }

                oThat.modelGeneral.getProperty("/reporteGeneralExel").push(objectData);
            },
            onGetHoras: function(horaIniPro){
                var TotalHours = null;
                var getHours = horaIniPro.ms;
                var TimeHexa    = getHours /60000;
                var Horas       = (TimeHexa/60).toString().split(".")[0];
                var Mins        = (TimeHexa - (Horas*60)).toString().split(".")[0];
                var Segs        = (((TimeHexa - (Horas*60))*60) - (Mins)*60).toString().split(".")[0];
                TotalHours  = Horas + ":" + Mins + ":" + Segs;
                return TotalHours;
            },
            onExportXLS: async function () {
                BusyIndicator.show(0);
                var that = this;
                oThat.modelGeneral.setProperty("/reporteGeneralExel", []);
                var aRMD = oThat.modelGeneral.getProperty("/reporteGeneral");
                var oFiltros = oThat.modelGeneral.getProperty("/oDataFilter/lote");
                var sExpandEstructura = "estructuraId",
                sExpandPaso = "pasoId",
                sExpandEquipo = "equipoId",
                sExpandUtensilio = "utensilioId",
                sExpandEtiqueta = "etiquetaId",
                sExpandPasoInsumo = "pasoId,pasoHijoId,rmdEstructuraRecetaInsumoId",
                sExpandPadre = "ensayoPadreId",
                oFilterEstructura  = [],
                oFilterPaso = [],
                oFilterEquipo = [],
                oFilterUtensilio = [],
                oFilterEspecificacion = [],
                oFilterInsumos = [],
                oFilterEtiquetas = [],
                oFilterPasoInsumo = [],
                etiquetaData;
                var aListPasosLength = 1000;
                var aListPasosPasosLength = 1000;
                var skipLine = 1000;
                var skipLinePasos = 1000;
                //NUEVO MARIN
                var skipLineEstructura = 1000;
                var aListEstructuraLength = 1000;
                var skipLineEquipo = 1000;
                var aListEquipoLength = 1000;
                var skipLineUtensilio = 1000;
                var aListUtensilioLength = 1000;
                var skipLineEspecificacion = 1000;
                var aListEspecificacionLength = 1000;
                var skipLineInsumos = 1000;
                var aListInsumosLength = 1000;
                var skipLineEtiquetas = 1000;
                var aListEtiquetasLength = 1000;
                //FIN NUEVO MARIN
                
                if(aRMD.length === 0){
                    sap.m.MessageBox.show(that.i18n.getText("noDataExcel"), sap.m.MessageBox.Icon.WARNING);
                    BusyIndicator.hide();
                    return;
                }
                aRMD.forEach(function(oRMD){
                    oFilterEstructura.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterPaso.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterEquipo.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterUtensilio.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterEspecificacion.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterInsumos.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterEtiquetas.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    oFilterPasoInsumo.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                });

                var aListEstructurasGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ESTRUCTURA", sExpandEstructura, oFilterEstructura);
                if(aListEstructurasGeneral.results.length === 1000){
                    while (aListEstructuraLength === 1000) {
                        var aListEstructuraSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ESTRUCTURA", sExpandEstructura, oFilterEstructura, skipLineEstructura);
                        aListEstructuraLength = aListEstructuraSkipData.results.length;
                        aListEstructurasGeneral.results = aListEstructurasGeneral.results.concat(aListEstructuraSkipData.results);
                        skipLineEstructura = skipLineEstructura + 1000;
                    }
                }

                var aListPasoGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_PASO", sExpandPaso, oFilterPaso);
                if(aListPasoGeneral.results.length === 1000){
                    while (aListPasosLength === 1000) {
                        var aListPasoSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_PASO", sExpandPaso, oFilterPaso, skipLine);
                        aListPasosLength = aListPasoSkipData.results.length;
                        aListPasoGeneral.results = aListPasoGeneral.results.concat(aListPasoSkipData.results);
                        skipLine = skipLine + 1000;
                    }
                }

                var aListEquipoGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_EQUIPO", sExpandEquipo, oFilterEquipo);
                if(aListEquipoGeneral.results.length === 1000){
                    while (aListEquipoLength === 1000) {
                        var aListEquipoSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_EQUIPO", sExpandEquipo, oFilterEquipo, skipLineEquipo);
                        aListEquipoLength = aListEquipoSkipData.results.length;
                        aListEquipoGeneral.results = aListEquipoGeneral.results.concat(aListEquipoSkipData.results);
                        skipLineEquipo = skipLineEquipo + 1000;
                    }
                }

                var aListUtensilioGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_UTENSILIO", sExpandUtensilio, oFilterUtensilio);
                if(aListUtensilioGeneral.results.length === 1000){
                    while (aListUtensilioLength === 1000) {
                        var aListUtensilioSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_UTENSILIO", sExpandUtensilio, oFilterUtensilio, skipLineUtensilio);
                        aListUtensilioLength = aListUtensilioSkipData.results.length;
                        aListUtensilioGeneral.results = aListUtensilioGeneral.results.concat(aListUtensilioSkipData.results);
                        skipLineUtensilio = skipLineUtensilio + 1000;
                    }
                }

                var aListEspecificacionGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_ESPECIFICACION", sExpandPadre ,oFilterEspecificacion);
                if(aListEspecificacionGeneral.results.length === 1000){
                    while (aListEspecificacionLength === 1000) {
                        var aListEspecificacionSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_ESPECIFICACION", sExpandPadre, oFilterEspecificacion, skipLineEspecificacion);
                        aListEspecificacionLength = aListEspecificacionSkipData.results.length;
                        aListEspecificacionGeneral.results = aListEspecificacionGeneral.results.concat(aListEspecificacionSkipData.results);
                        skipLineEspecificacion = skipLineEspecificacion + 1000;
                    }
                }

                var aListInsumosGeneral = await reporteService.getDataFilter(oThat.mainModelv2, "/RMD_ES_RE_INSUMO", oFilterInsumos);
                if(aListInsumosGeneral.results.length === 1000){
                    while (aListInsumosLength === 1000) {
                        var aListInsumosSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_RE_INSUMO", "", oFilterInsumos, skipLineInsumos);
                        aListInsumosLength = aListInsumosSkipData.results.length;
                        aListInsumosGeneral.results = aListInsumosGeneral.results.concat(aListInsumosSkipData.results);
                        skipLineInsumos = skipLineInsumos + 1000;
                    }
                }
                
                var aListEtiquetasGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_ETIQUETA", sExpandEtiqueta, oFilterEtiquetas);
                if(aListEtiquetasGeneral.results.length === 1000){
                    while (aListEtiquetasLength === 1000) {
                        var aListEtiquetaSkipData = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_ETIQUETA", sExpandEtiqueta, oFilterEtiquetas, skipLineEtiquetas);
                        aListEtiquetasLength = aListEtiquetaSkipData.results.length;
                        aListEtiquetasGeneral.results = aListEtiquetasGeneral.results.concat(aListEtiquetaSkipData.results);
                        skipLineEtiquetas = skipLineEtiquetas + 1000;
                    }
                }

                var aListPasoInsumoGeneral = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_PASO_INSUMO_PASO", sExpandPasoInsumo, oFilterPasoInsumo);
                if(aListPasoInsumoGeneral.results.length === 1000){
                    while (aListPasosPasosLength === 1000) {
                        var aListPasoSkipDataPaso = await reporteService.getDataExpandSkip(oThat.mainModelv2, "/RMD_ES_PASO_INSUMO_PASO", sExpandPasoInsumo, oFilterPasoInsumo, skipLinePasos);
                        aListPasosPasosLength = aListPasoSkipDataPaso.results.length;
                        aListPasoInsumoGeneral.results = aListPasoInsumoGeneral.results.concat(aListPasoSkipDataPaso.results);
                        skipLinePasos = skipLinePasos + 1000;
                    }
                }

                for (let index = 0; index < aRMD.length; index++) {
                    const element = aRMD[index];
                    if(element.lote === "2031032"){
                        var get22 = 2;
                    }
                    
                    var countnumeracionEstructura = 0;
                    var aListEstructuras = aListEstructurasGeneral.results.filter(e=> e.rmdId_rmdId === element.rmdId);
                    aListEstructuras.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    if(aListEstructuras.length === 0){
                        var sObject = {};
                        sObject.productoId = element.productoId;
                        sObject.descripcion = element.descripcion;
                        sObject.ordenSAP = element.ordenSAP;
                        sObject.lote = element.lote;
                        sObject.fechaInicio = element.fechaInicioRMD;
                        sObject.fechaCierre = element.fechaCierreRMD;
                        sObject.usuarioHabilita = element.usuarioHabilita;
                        sObject.fechaHabilita = element.fechaHabilitaRMD;
                        sObject.fechaCierreRMDFinal = element.fechaCierreRMDFinal;

                        sObject.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                        sObject.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                        sObject.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                        sObject.CantTeorica = element.vfmng;
                        sObject.Um = element.Amein;
                        sObject.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                        sObject.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
                        sObject.nivelTxt = oThat.onValidarInfo(element, "mdId.nivelTxt");
                        if(element.mdId){
                            if(element.mdId.estadoIdProceso){
                                // sObject.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                sObject.estadoPro = oThat.onValidarInfo(element, "mdId.nivelTxt");
                            }
                        }
                        // sObject.area = (element.mdId)?element.mdId.areaRmd:"";
                        sObject.areaRmdTxt = (element.mdId)?oThat.onValidarInfo(element, "areaRmdTxt"):"";
                        // sObject.expira = element.expira;
                        sObject.expira = element.fechaVencRMD;
                        //Cantidad teorica
                        //UM
                        sObject.version = oThat.onValidarInfo(element, "mdId.version");
                        sObject.fechaAutorizacion = oThat.onValidarInfo(element, "mdId.fechaAutorizacionRMD");

                        oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject);
                    }else{
                        for (let i = 0; i < aListEstructuras.length; i++) {
                            const eEstructura = aListEstructuras[i];
                            var countnumeracionEtiqueta = 0;

                            if(eEstructura.estructuraId.numeracion){
                                countnumeracionEstructura++;
                            }

                            // oFilterPaso.splice(0, oFilterPaso.length)
                            // oFilterPaso.push(new Filter("rmdEstructuraId_rmdEstructuraId", FilterOperator.EQ, eEstructura.rmdEstructuraId));
                            // var aListPaso = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_PASO", sExpandPaso, oFilterPaso);
                            
                            var aListPaso = aListPasoGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            aListPaso.sort(function (a, b) {
                                return a.orden - b.orden;
                            });

                            var aListEtiquetasFilterPaso = aListEtiquetasGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            aListEtiquetasFilterPaso.sort(function (a, b) {
                                return a.orden - b.orden;
                            });

                            if(eEstructura.estructuraId.descripcion != "PROCEDIMIENTO"){
                                
                                for (let ip = 0; ip < aListPaso.length; ip++) {
                                    // const etiquetaText = aListEtiquetasFilterPaso.find(e => e.);
                                    const ePaso = aListPaso[ip];
                                    var filterPasoInsumoPaso = null;
                                    if(ePaso.pasoId){
                                        etiquetaData = aListEtiquetasFilterPaso.find(e=>e.etiquetaId_etiquetaId === ePaso.pasoId.etiquetaId_etiquetaId);
                                    } else{
                                        etiquetaData = ""
                                    }
    
                                    var sObject3 = {};
                                    sObject3.productoId = element.productoId;
                                    sObject3.descripcion = element.descripcion;
                                    sObject3.ordenSAP = element.ordenSAP;
                                    sObject3.lote = element.lote;
                                    sObject3.fechaInicio = element.fechaInicioRMD;
                                    sObject3.fechaCierre = element.fechaCierreRMD;
                                    sObject3.usuarioHabilita = element.usuarioHabilita;
    
                                    sObject3.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                    sObject3.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                    sObject3.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                    sObject3.CantTeorica = element.vfmng;
                                    sObject3.Um = element.Amein;
                                    sObject3.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                    sObject3.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
    
                                    sObject3.fechaHabilita = element.fechaHabilitaRMD;
                                    sObject3.fechaCierreRMDFinal = element.fechaCierreRMDFinal;
                                    if(element.mdId){
                                        if(element.mdId.estadoIdProceso){
                                            sObject3.estadoPro = oThat.onValidarInfo(element, "mdId.nivelTxt");
                                        }
                                    }
                                    // sObject3.area = (element.mdId)?element.mdId.areaRmd:"";
                                    sObject3.areaRmdTxt = (element.mdId)?element.areaRmdTxt:"";
                                    // sObject3.expira = element.expira;
                                    sObject3.expira = element.fechaVencRMD;
                                    //Cantidad teorica
                                    //UM
                                    sObject3.version = oThat.onValidarInfo(element, "mdId.version");
                                    sObject3.fechaAutorizacion = oThat.onValidarInfo(element, "mdId.fechaAutorizacionRMD");
                                    
                                    sObject3.estructura = oThat.onValidarInfo(eEstructura, "estructuraId.descripcion");
                                    sObject3.etiqueta = oThat.onValidarInfo(etiquetaData, "etiquetaId.descripcion");
    
                                    sObject3.paso = oThat.onValidarInfo(ePaso, "pasoId.descripcion");
                                    
                                    if(!!ePaso.texto){
                                        sObject3.valorPaso = ePaso.texto;
                                    }else if(!!ePaso.cantidad){
                                        sObject3.valorPaso = ePaso.cantidad;
                                    }else if(!!ePaso.fecha){
                                        sObject3.valorPaso = oThat.onFormatterFechaExcel(ePaso.fecha);
                                    }else if(!!ePaso.hora){
                                        sObject3.valorPaso = oThat.onGetHoras(ePaso.hora);
                                    }else if(!!ePaso.fechaHora){
                                        sObject3.valorPaso = oThat.onFormatterFechaExcel(ePaso.fechaHora);
                                    }else if(!!ePaso.rango){
                                        sObject3.valorPaso = ePaso.rango;
                                    }else if(!!ePaso.datoFijo){
                                        sObject3.valorPaso = ePaso.datoFijo;
                                    }else if(!!ePaso.formula){
                                        sObject3.valorPaso = ePaso.formula;
                                    }else if(!!ePaso.vistoBueno){
                                        // sObject3.valorPaso = ePaso.vistoBueno;
                                        sObject3.valorPaso = 'ACTIVADO';
                                        // sObject3.vistoBueno = ePaso.vistoBueno;
                                    }else if(ePaso.verifCheck === true){
                                        sObject3.valorPaso = 'ACTIVADO';
                                    }else if(ePaso.verifCheck === false){
                                        sObject3.valorPaso = 'DESACTIVADO';
                                    }else if(!!ePaso.multiCheckUser){
                                        sObject3.valorPaso = ePaso.multiCheckUser;
                                    }else if(!!ePaso.realizadoPorUser){
                                        sObject3.valorPaso = ePaso.realizadoPorUser;
                                    }else {
                                        sObject3.valorPaso = "";
                                    }

                                    // sObject3.realizadoPor = "";
                                    // sObject3.equipo = "";
                                    // sObject3.utensilio = "";
                                    
                                    sObject3.ensayo = "";
                                    sObject3.especificacion = "";
                                    sObject3.resultados = "";
    
                                    if(ePaso.aplica){
                                        sObject3.aplica = "si";
                                    }else{
                                        sObject3.aplica = "no";
                                    }
    
                                    oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject3);
    
                                    // filterPasoInsumoPaso = aListPasoInsumoGeneral.results.filter(e=>e.pasoId_rmdEstructuraPasoId === ePaso.rmdEstructuraPasoId);
                                    
                                    
                                    // if(filterPasoInsumoPaso.length > 0){
                                    //     filterPasoInsumoPaso.forEach( function(e){
                                    //         oThat.onGetDataPasoInsumoPaso(sObject3, e);
                                    //     })
                                    // }
                                }
                            }else{
                                //obtengo las etiquetas ordenadas
                                for (let ipe = 0; ipe < aListEtiquetasFilterPaso.length; ipe++) {
                                    countnumeracionEtiqueta++;
                                    var countnumeracionPaso = 0;
                                    // filtro por etiqueta los pasos que tiene:
                                    var pasoPorEtiqueta = aListPaso.filter(e=>e.pasoId.etiquetaId_etiquetaId === aListEtiquetasFilterPaso[ipe].etiquetaId_etiquetaId);
                                    const eEtiquetaObject = aListEtiquetasFilterPaso[ipe];

                                    for (let ipp = 0; ipp < pasoPorEtiqueta.length; ipp++) {
                                        countnumeracionPaso++;
                                        var countnumeracionPasoPaso = 0;
                                        var NumeradorPaso = countnumeracionEstructura+"."+countnumeracionEtiqueta+"."+countnumeracionPaso;
                                        if(NumeradorPaso === "4.1.1"){
                                            var test = 1;
                                        }
                                        const ePaso = pasoPorEtiqueta[ipp];
                                        var sObject3 = {};
                                        sObject3.productoId = element.productoId;
                                        sObject3.descripcion = element.descripcion;
                                        sObject3.ordenSAP = element.ordenSAP;
                                        sObject3.lote = element.lote;
                                        sObject3.fechaInicio = element.fechaInicioRMD;
                                        sObject3.fechaCierre = element.fechaCierreRMD;
                                        sObject3.usuarioHabilita = element.usuarioHabilita;
        
                                        sObject3.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                        sObject3.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                        sObject3.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                        sObject3.CantTeorica = element.vfmng;
                                        sObject3.Um = element.Amein;
                                        sObject3.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                        sObject3.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
                                        sObject3.realizadoPor = ePaso.realizadoPorUser && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPor || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.realizadoPorUser :"";
                                        sObject3.vistoBueno = ePaso.usuarioActualiza  && (ePaso.tipoDatoId_iMaestraId === sIdTipoDatoVistoBueno || ePaso.tipoDatoId_iMaestraId === sIdTipoDatoRealizadoPoryVistoBueno ) ? ePaso.usuarioActualiza :"";
        
                                        sObject3.fechaHabilita = element.fechaHabilitaRMD;
                                        sObject3.fechaCierreRMDFinal = element.fechaCierreRMDFinal;
                                        if(element.mdId){
                                            if(element.mdId.estadoIdProceso){
                                                sObject3.estadoPro = oThat.onValidarInfo(element, "mdId.nivelTxt");
                                            }
                                        }
                                        // sObject3.area = (element.mdId)?element.mdId.areaRmd:"";
                                        sObject3.areaRmdTxt = (element.mdId)?element.areaRmdTxt:"";
                                        // sObject3.expira = element.expira;
                                        sObject3.expira = element.fechaVencRMD;
                                        //Cantidad teorica
                                        //UM
                                        sObject3.version = oThat.onValidarInfo(element, "mdId.version");
                                        sObject3.fechaAutorizacion = oThat.onValidarInfo(element, "mdId.fechaAutorizacionRMD");
                                        
                                        sObject3.estructura = oThat.onValidarInfo(eEstructura, "estructuraId.descripcion");
                                        sObject3.etiqueta = oThat.onValidarInfo(eEtiquetaObject, "etiquetaId.descripcion");
        
                                        sObject3.paso = (NumeradorPaso+" "+oThat.onValidarInfo(ePaso, "pasoId.descripcion"));
                                        
                                        if(!!ePaso.texto){
                                            sObject3.valorPaso = ePaso.texto;
                                        }else if(!!ePaso.cantidad){
                                            sObject3.valorPaso = ePaso.cantidad;
                                        }else if(!!ePaso.fecha){
                                            sObject3.valorPaso = oThat.onFormatterFechaExcel(ePaso.fecha);
                                        }else if(!!ePaso.hora){
                                            sObject3.valorPaso = oThat.onGetHoras(ePaso.hora);
                                        }else if(!!ePaso.fechaHora){
                                            sObject3.valorPaso = oThat.onFormatterFechaExcel(ePaso.fechaHora);
                                        }else if(!!ePaso.rango){
                                            sObject3.valorPaso = ePaso.rango;
                                        }else if(!!ePaso.datoFijo){
                                            sObject3.valorPaso = ePaso.datoFijo;
                                        }else if(!!ePaso.formula){
                                            sObject3.valorPaso = ePaso.formula;
                                        }else if(!!ePaso.vistoBueno){
                                            // sObject3.valorPaso = ePaso.vistoBueno;
                                            sObject3.valorPaso = 'ACTIVADO';
                                            // sObject3.vistoBueno = ePaso.vistoBueno;
                                        }else if(ePaso.verifCheck === true){
                                            sObject3.valorPaso = 'ACTIVADO';
                                        }else if(ePaso.verifCheck === false){
                                            sObject3.valorPaso = 'DESACTIVADO';
                                        }else if(!!ePaso.multiCheckUser){
                                            sObject3.valorPaso = ePaso.multiCheckUser;
                                        }else if(!!ePaso.realizadoPorUser){
                                            sObject3.valorPaso = ePaso.realizadoPorUser;
                                        }else {
                                            sObject3.valorPaso = "";
                                        }
                                        
                                        // sObject3.realizadoPor = "";
                                        // sObject3.equipo = "";
                                        // sObject3.utensilio = "";
                                        
                                        sObject3.ensayo = "";
                                        sObject3.especificacion = "";
                                        sObject3.resultados = "";
        
                                        if(ePaso.aplica){
                                            sObject3.aplica = "si";
                                        }else{
                                            sObject3.aplica = "no";
                                        }
        
                                        oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject3);
        
                                        filterPasoInsumoPaso = aListPasoInsumoGeneral.results.filter(e=>e.pasoId_rmdEstructuraPasoId === ePaso.rmdEstructuraPasoId);
                                        filterPasoInsumoPaso.sort(function (a, b) {
                                            return a.orden - b.orden;
                                        });
                                        
                                        if(filterPasoInsumoPaso.length > 0){
                                            filterPasoInsumoPaso.forEach( function(e){
                                                countnumeracionPasoPaso++;
                                                var NumeradorPasoPaso = countnumeracionEstructura+"."+countnumeracionEtiqueta+"."+countnumeracionPaso+"."+countnumeracionPasoPaso;
                                                oThat.onGetDataPasoInsumoPaso(sObject3, e, NumeradorPasoPaso);
                                            })
                                        }
                                    }
                                }
                            }

                            // oFilterEquipo.splice(0, oFilterEquipo.length)
                            // oFilterEquipo.push(new Filter("rmdEstructuraId_rmdEstructuraId", FilterOperator.EQ, eEstructura.rmdEstructuraId));

                            // var aListEquipo = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_EQUIPO", sExpandEquipo, oFilterEquipo);
                            var aListEquipo = aListEquipoGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            
                            for (let ie = 0; ie < aListEquipo.length; ie++) {
                                const eEquipo = aListEquipo[ie];
                                var sObject4 = {};
                                sObject4.productoId = element.productoId;
                                sObject4.descripcion = element.descripcion;
                                sObject4.ordenSAP = element.ordenSAP;
                                sObject4.lote = element.lote;
                                sObject4.fechaInicio = element.fechaInicioRMD;
                                sObject4.fechaCierre = element.fechaCierreRMD;
                                sObject4.usuarioHabilita = element.usuarioHabilita;
                                sObject4.fechaHabilita = element.fechaHabilitaRMD;
                                sObject4.fechaCierreRMDFinal = element.fechaCierreRMDFinal;

                                sObject4.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                sObject4.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                sObject4.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                sObject4.CantTeorica = element.vfmng;
                                sObject4.Um = element.Amein;
                                sObject4.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                sObject4.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
                                sObject4.paso = oThat.onValidarInfo(eEquipo, "equipoId.eqktx");

                                if(element.mdId){
                                    if(element.mdId.estadoIdProceso){
                                        // sObject4.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        // sObject4.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        sObject4.estadoPro = oThat.onValidarInfo(element, "mdId.nivelTxt");
                                    }
                                }
                                // sObject4.area = (element.mdId)?element.mdId.areaRmd:"";
                                sObject4.areaRmdTxt = (element.mdId)?element.areaRmdTxt:"";
                                // sObject4.expira = element.expira;
                                sObject4.expira = element.fechaVencRMD;
                                //Cantidad teorica
                                //UM
                                sObject4.version = oThat.onValidarInfo(element, "mdId.version");
                                sObject4.fechaAutorizacion = oThat.onValidarInfo(element, "mdId.fechaAutorizacionRMD");

                                sObject4.estructura = oThat.onValidarInfo(eEstructura, "estructuraId.descripcion");

                                // sObject4.equipo = (eEquipo.equipoId)?eEquipo.equipoId.descript:"";
                                
                                // sObject4.vistoBueno = eEquipo.vistoBueno;

                                if(!!eEquipo.texto){
                                    sObject4.valorPaso = eEquipo.texto;
                                }else if(!!eEquipo.cantidad){
                                    sObject4.valorPaso = eEquipo.cantidad;
                                }else if(!!eEquipo.fecha){
                                    sObject4.valorPaso = oThat.onFormatterFechaExcel(eEquipo.fecha);
                                }else if(!!eEquipo.hora){
                                    sObject4.valorPaso = oThat.onGetHoras(eEquipo.hora);
                                }else if(!!eEquipo.fechaHora){
                                    sObject4.valorPaso = oThat.onFormatterFechaExcel(eEquipo.fechaHora);
                                }else if(!!eEquipo.rango){
                                    sObject4.valorPaso = eEquipo.rango;
                                }else if(!!eEquipo.datoFijo){
                                    sObject4.valorPaso = eEquipo.datoFijo;
                                }else if(!!eEquipo.formula){
                                    sObject4.valorPaso = eEquipo.formula;
                                }else if(!!eEquipo.vistoBueno){
                                    // sObject4.valorPaso = eEquipo.vistoBueno;
                                    sObject4.valorPaso = 'ACTIVADO';
                                    // sObject4.vistoBueno = eEquipo.vistoBueno;
                                }else if(eEquipo.verifCheck === true){
                                    sObject4.valorPaso = 'ACTIVADO';
                                }else if(eEquipo.verifCheck === false){
                                    sObject4.valorPaso = 'DESACTIVADO';
                                }else if(!!eEquipo.multiCheckUser){
                                    sObject4.valorPaso = eEquipo.multiCheckUser;
                                }else if(!!eEquipo.realizadoPorUser){
                                    sObject4.valorPaso = eEquipo.realizadoPorUser;
                                }else {
                                    sObject4.valorPaso = "";
                                }
                                
                                // sObject4.realizadoPor = "";
                                // sObject4.equipo = "";
                                // sObject4.utensilio = "";
                                
                                sObject4.ensayo = "";
                                sObject4.especificacion = "";
                                sObject4.resultados = "";
                                
                                if(eEquipo.aplica){
                                    sObject4.aplica = "si";
                                }else{
                                    sObject4.aplica = "no";
                                }
                                
                                oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject4);
                            }

                            // oFilterUtensilio.splice(0, oFilterUtensilio.length)
                            // oFilterUtensilio.push(new Filter("rmdEstructuraId_rmdEstructuraId", FilterOperator.EQ, eEstructura.rmdEstructuraId));

                            // var aListUtensilio = await reporteService.getDataExpand(oThat.mainModelv2, "/RMD_ES_UTENSILIO", sExpandUtensilio, oFilterUtensilio);
                            var aListUtensilio = aListUtensilioGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            
                            for (let iu = 0; iu < aListUtensilio.length; iu++) {
                                const eUtensilio = aListUtensilio[iu];
                                var sObject5 = {};
                                sObject5.productoId = element.productoId;
                                sObject5.descripcion = element.descripcion;
                                sObject5.ordenSAP = element.ordenSAP;
                                sObject5.lote = element.lote;
                                sObject5.fechaInicio = element.fechaInicioRMD;
                                sObject5.fechaCierre = element.fechaCierreRMD;
                                sObject5.usuarioHabilita = element.usuarioHabilita;
                                sObject5.fechaHabilita = element.fechaHabilitaRMD;
                                sObject5.fechaCierreRMDFinal = element.fechaCierreRMDFinal;

                                sObject5.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                sObject5.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                sObject5.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                sObject5.CantTeorica = element.vfmng;
                                sObject5.Um = element.Amein;
                                sObject5.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                sObject5.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
                                sObject5.paso = oThat.onValidarInfo(eUtensilio, "utensilioId.descripcion");

                                if(!!eUtensilio.texto){
                                    sObject5.valorPaso = eUtensilio.texto;
                                }else if(!!eUtensilio.cantidad){
                                    sObject5.valorPaso = eUtensilio.cantidad;
                                }else if(!!eUtensilio.fecha){
                                    sObject5.valorPaso = oThat.onFormatterFechaExcel(eUtensilio.fecha);
                                }else if(!!eUtensilio.hora){
                                    sObject5.valorPaso = oThat.onGetHoras(eUtensilio.hora);
                                }else if(!!eUtensilio.fechaHora){
                                    sObject5.valorPaso = oThat.onFormatterFechaExcel(eUtensilio.fechaHora);
                                }else if(!!eUtensilio.rango){
                                    sObject5.valorPaso = eUtensilio.rango;
                                }else if(!!eUtensilio.datoFijo){
                                    sObject5.valorPaso = eUtensilio.datoFijo;
                                }else if(!!eUtensilio.formula){
                                    sObject5.valorPaso = eUtensilio.formula;
                                }else if(!!eUtensilio.vistoBueno){
                                    sObject5.valorPaso = 'ACTIVADO';
                                    // sObject5.vistoBueno = eUtensilio.vistoBueno;
                                }else if(eUtensilio.verifCheck === true){
                                    sObject5.valorPaso = 'ACTIVADO';
                                }else if(eUtensilio.verifCheck === false){
                                    sObject5.valorPaso = 'DESACTIVADO';
                                }else if(!!eUtensilio.multiCheckUser){
                                    sObject5.valorPaso = eUtensilio.multiCheckUser;
                                }else if(!!eUtensilio.realizadoPorUser){
                                    sObject5.valorPaso = eUtensilio.realizadoPorUser;
                                }else {
                                    sObject5.valorPaso = "";
                                }
                                
                                sObject5.ensayo = "";
                                sObject5.especificacion = "";
                                sObject5.resultados = "";

                                if(element.mdId){
                                    if(element.mdId.estadoIdProceso){
                                        // sObject5.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        // sObject5.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        sObject5.estadoPro = oThat.onValidarInfo(element, "mdId.nivelTxt");
                                    }
                                }
                                // sObject5.area = (element.mdId)?element.mdId.areaRmd:"";
                                sObject5.areaRmdTxt = (element.mdId)?element.areaRmdTxt:"";
                                // sObject5.expira = element.expira;
                                sObject5.expira = element.fechaVencRMD;
                                //Cantidad teorica
                                //UM
                                sObject5.version = (element.mdId)?element.mdId.version:"";
                                sObject5.fechaAutorizacion = oThat.onValidarInfo(element, "mdId.fechaAutorizacionRMD");

                                sObject5.estructura = oThat.onValidarInfo(eEstructura, "estructuraId.descripcion");

                                // sObject5.utensilio = (eUtensilio.utensilioId)?eUtensilio.utensilioId.descripcion: "";
                                
                                // sObject5.vistoBueno = eUtensilio.vistoBueno;
                                
                                if(eUtensilio.aplica){
                                    sObject5.aplica = "si";
                                }else{
                                    sObject5.aplica = "no";
                                }
                                
                                oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject5);
                            }

                            // oFilterEspecificacion.splice(0, oFilterEspecificacion.length)
                            // oFilterEspecificacion.push(new Filter("rmdEstructuraId_rmdEstructuraId", FilterOperator.EQ, eEstructura.rmdEstructuraId));

                            // var aListEspecificacion = await reporteService.getDataFilter(oThat.mainModelv2, "/RMD_ES_ESPECIFICACION", oFilterEspecificacion);
                            var aListEspecificacion = aListEspecificacionGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            
                            for (let ies = 0; ies < aListEspecificacion.length; ies++) {
                                const eEspecificacion = aListEspecificacion[ies];
                                var sObject6 = {};
                                sObject6.productoId = element.productoId;
                                sObject6.descripcion = element.descripcion;
                                sObject6.ordenSAP = element.ordenSAP;
                                sObject6.lote = element.lote;
                                sObject6.fechaInicio = element.fechaInicioRMD;
                                sObject6.fechaCierre = element.fechaCierreRMD;
                                sObject6.usuarioHabilita = element.usuarioHabilita;
                                sObject6.fechaHabilita = element.fechaHabilitaRMD;
                                sObject6.fechaCierreRMDFinal = element.fechaCierreRMDFinal;

                                sObject6.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                sObject6.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                sObject6.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                sObject6.CantTeorica = element.vfmng;
                                sObject6.Um = element.Amein;
                                sObject6.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                sObject6.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");

                                if(element.mdId){
                                    if(element.mdId.estadoIdProceso){
                                        // sObject6.estadoPro = oThat.onValidarInfo(element,"mdId.estadoIdProceso.contenido");
                                        // sObject6.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        sObject6.estadoPro = element.mdId?oThat.onValidarInfo(element, "mdId.nivelTxt"):"";
                                    }
                                }
                                // sObject6.area = element.mdId.areaRmd;
                                sObject6.areaRmdTxt = oThat.onValidarInfo(element,"areaRmdTxt");
                                // sObject6.expira = element.expira;
                                sObject6.expira = element.fechaVencRMD;
                                //Cantidad teorica
                                //UM
                                sObject6.version = oThat.onValidarInfo(element,"mdId.version");
                                sObject6.fechaAutorizacion = oThat.onValidarInfo(element,"mdId.fechaAutorizacionRMD");

                                sObject6.estructura = oThat.onValidarInfo(eEstructura,"estructuraId.descripcion");

                                sObject6.ensayo = eEspecificacion.ensayoHijo ? eEspecificacion.ensayoHijo : "";
                                // sObject6.ensayo = eEspecificacion.ensayoPadreId? oThat.onValidarInfo(eEspecificacion, "ensayoPadreId.descripcion") : eEspecificacion.ensayoPadreSAP ;
                                sObject6.especificacion = eEspecificacion.especificacion;
                                
                                sObject6.resultados = eEspecificacion.resultados;
                                
                                if(eEspecificacion.aplica){
                                    sObject6.aplica = "si";
                                }else{
                                    sObject6.aplica = "no";
                                }
                                
                                oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject6);
                            }

                            // oFilterInsumos.splice(0, oFilterInsumos.length)
                            // oFilterInsumos.push(new Filter("rmdEstructuraId_rmdEstructuraId", FilterOperator.EQ, eEstructura.rmdEstructuraId));

                            // var aListInsumos = await reporteService.getDataFilter(oThat.mainModelv2, "/RMD_ES_RE_INSUMO", oFilterInsumos);
                            var aListInsumos = aListInsumosGeneral.results.filter(e=>e.rmdEstructuraId_rmdEstructuraId === eEstructura.rmdEstructuraId);
                            
                            for (let ii = 0; ii < aListInsumos.length; ii++) {
                                const eaListInsumos = aListInsumos[ii];
                                var sObject7 = {};
                                sObject7.productoId = element.productoId;
                                sObject7.descripcion = element.descripcion;
                                sObject7.ordenSAP = element.ordenSAP;
                                sObject7.lote = element.lote;
                                sObject7.fechaInicio = element.fechaInicioRMD;
                                sObject7.fechaCierre = element.fechaCierreRMD;
                                sObject7.usuarioHabilita = element.usuarioHabilita;
                                sObject7.fechaHabilita = element.fechaHabilitaRMD;
                                sObject7.fechaCierreRMDFinal = element.fechaCierreRMDFinal;

                                sObject7.codRMD = oThat.onValidarInfo(element, "mdId.codigo");
                                sObject7.RptValid = oThat.onValidarInfo(element, "mdId.rptaValidacion");
                                sObject7.Alter = oThat.onValidarInfo(element, "mdId.aReceta.results.0.recetaId.Stlal");
                                sObject7.CantTeorica = element.vfmng;
                                sObject7.Um = element.Amein;
                                sObject7.UserAuth = oThat.onValidarInfo(element, "mdId.usuarioActualiza");
                                sObject7.EstadoRMD = oThat.onValidarInfo(element, "estadoIdRmd.contenido");
                                sObject7.paso = oThat.onValidarInfo(eaListInsumos, "Maktx");
                                // sObject7.valorPaso = oThat.onValidarInfo(eaListInsumos, "verifCheck");
                                if(eaListInsumos.verifCheck === true){
                                    sObject7.valorPaso = 'ACTIVADO';
                                }else if(eaListInsumos.verifCheck === false){
                                    sObject7.valorPaso = 'DESACTIVADO';
                                }
                                if(element.mdId){
                                    if(element.mdId.estadoIdProceso){
                                        // sObject7.estadoPro = oThat.onValidarInfo(element,"mdId.estadoIdProceso.contenido");
                                        // sObject7.estadoPro = (element.mdId)?element.mdId.estadoIdProceso.contenido:"";
                                        sObject7.estadoPro = element.mdId?oThat.onValidarInfo(element, "mdId.nivelTxt"):"";
                                    }
                                }
                                // sObject7.area = oThat.onValidarInfo(element,"mdId.areaRmd");
                                sObject7.areaRmdTxt = oThat.onValidarInfo(element,"areaRmdTxt");
                                // sObject7.expira = element.expira;
                                sObject7.expira = element.fechaVencRMD;
                                //Cantidad teorica
                                //UM
                                sObject7.version = oThat.onValidarInfo(element,"mdId.version");
                                sObject7.fechaAutorizacion =  oThat.onValidarInfo(element,"mdId.fechaAutorizacionRMD");

                                sObject7.estructura = oThat.onValidarInfo(eEstructura,"estructuraId.descripcion");
                                
                                oThat.modelGeneral.getProperty("/reporteGeneralExel").push(sObject7);
                            }
                        }
                    }
                }

                var modeloToExport = "/reporteGeneralExel";
                var nombreExcel = "Reporte Registro Manufactura Digital";
                this.exportarExcelConFormatoCeldas(modeloToExport, nombreExcel, function (returnExcel) {
                    BusyIndicator.hide();
                });
            },
            onValidarInfo: function(aDataEstructuras,Estructura){
                let data = null;
                if(aDataEstructuras){
                    let BusquedaEstructuras = Estructura.split(".");
                    data = aDataEstructuras;
                    BusquedaEstructuras.forEach(function(info){
                      // var data = aDataEstructuras[info];
                      if(data){
                        data = data[info];
                      }else {
                        return '';
                      }
                    })
                } else {
                    return '';
                }

                return data? data : '';
              },
            exportarExcelConFormatoCeldas: function (modeloToExport, nombreProyecto, callback) {
                var that = this;
                var modeloToExcel = this.modelGeneral.getProperty(modeloToExport);
                var aDataSource = modeloToExcel;

                if (aDataSource.length == 0) {
                    sap.m.MessageBox.show(that.i18n.getText("noDataExcel"), sap.m.MessageBox.Icon.WARNING);
                } else {
                    var aColumns = this.generarColumnnasExportarExcel(modeloToExcel);
                    var oSpreadsheet = new sap.ui.export.Spreadsheet({
                        dataSource: aDataSource,
                        fileName: nombreProyecto + ".xlsx",
                        workbook: {
                            columns: aColumns
                        }
                    });
                    oSpreadsheet.onprogress = function (iValue) {
                        jQuery.sap.log.debug(nombreProyecto + ": " + iValue + "% completed");
                    };
                    oSpreadsheet.build().then(function () {
                        jQuery.sap.log.debug(nombreProyecto + " se ha descargado");
                    }).catch(function (sMessage) {
                        jQuery.sap.log.error(nombreProyecto + " error: " + sMessage);
                    });
                }
                callback(jQuery.sap.log);
            },
    
            generarColumnnasExportarExcel: function (modeloToExport) {
                // var nombreObjeto = Object.getOwnPropertyNames(modeloToExport[0]);
                var nombreObjeto = [];
                nombreObjeto[0] = "productoId";
                nombreObjeto[1] = "descripcion";
                nombreObjeto[2] = "ordenSAP";
                nombreObjeto[3] = "codRMD";
                nombreObjeto[4] = "RptValid";
                nombreObjeto[5] = "Alter";
                nombreObjeto[6] = "lote";
                nombreObjeto[7] = "fechaInicio";
                nombreObjeto[8] = "fechaCierre";
                nombreObjeto[9] = "estadoPro";
                nombreObjeto[10] = "areaRmdTxt";
                nombreObjeto[11] = "expira";
                nombreObjeto[12] = "CantTeorica";
                nombreObjeto[13] = "Um";
                nombreObjeto[14] = "version";
                nombreObjeto[15] = "fechaAutorizacion";
                nombreObjeto[16] = "UserAuth";
                nombreObjeto[17] = "EstadoRMD";
                nombreObjeto[18] = "usuarioHabilita";
                nombreObjeto[19] = "fechaHabilita";
                nombreObjeto[20] = "fechaCierreRMDFinal";
                nombreObjeto[21] = "estructura";
                nombreObjeto[22] = "etiqueta";
                nombreObjeto[23] = "paso";
                nombreObjeto[24] = "valorPaso";
                // nombreObjeto[24] = "procMenor";
                // nombreObjeto[25] = "valorProcMenor";
                nombreObjeto[25] = "ensayo";
                nombreObjeto[26] = "especificacion";
                nombreObjeto[27] = "resultados";
                nombreObjeto[28] = "realizadoPor";
                nombreObjeto[29] = "vistoBueno";
                nombreObjeto[30] = "aplica";
                
                var aColumns = [];
                for (var j = 0; j < nombreObjeto.length; j++) {
                    var oColumn = {};
                    oColumn.property = nombreObjeto[j];
                    oColumn.width = 15;
                    oColumn.property === "productoId" ? oColumn.label = "Artículo" : "";
                    oColumn.property === "descripcion" ? oColumn.label = "Descripción Artículo" : "";
                    oColumn.property === "ordenSAP" ? oColumn.label = "OP" : "";
                    oColumn.property === "lote" ? oColumn.label = "Lote" : "";
                    oColumn.property === "estadoPro" ? oColumn.label = "Etapa de Producción" : "";
                    oColumn.property === "expira" ? oColumn.label = "Fecha de Vencimiento" : "";
                    oColumn.property === "areaRmdTxt" ? oColumn.label = "Área" : "";
                    // oColumn.property === "areaRmdTxt" ? oColumn.label = "Descripción Area" : "";
                    oColumn.property === "version" ? oColumn.label = "Ed. RMD" : "";
                    oColumn.property === "fechaAutorizacion" ? oColumn.label = "Fecha de Autorización" : "";
                    oColumn.property === "estructura" ? oColumn.label = "Estructura" : "";
                    oColumn.property === "paso" ? oColumn.label = "Paso" : "";
                    oColumn.property === "aplica" ? oColumn.label = "Aplica" : "";
                    oColumn.property === "valorPaso" ? oColumn.label = "Valor de Paso" : "";
                    oColumn.property === "usuarioHabilita" ? oColumn.label = "Usuario de Habilitación" : "";
                    oColumn.property === "fechaHabilita" ? oColumn.label = "Fecha de inicio del RMD" : "";
                    oColumn.property === "fechaCierreRMDFinal" ? oColumn.label = "Fecha de cierre de RMD" : "";
                    oColumn.property === "etiqueta" ? oColumn.label = "Etiqueta" : "";

                    oColumn.property === "codRMD" ? oColumn.label = "Código RMD" : "";
                    oColumn.property === "RptValid" ? oColumn.label = "Rpt. Valid." : "";
                    oColumn.property === "Alter" ? oColumn.label = "Alternativa" : "";
                    oColumn.property === "CantTeorica" ? oColumn.label = "Cantidad Teórica" : "";
                    oColumn.property === "Um" ? oColumn.label = "UM" : "";
                    oColumn.property === "UserAuth" ? oColumn.label = "Usuario de Autorización" : "";
                    oColumn.property === "EstadoRMD" ? oColumn.label = "Estado RMD" : "";

                    oColumn.property === "realizadoPor" ? oColumn.label = "Realizado Por" : "";
                    oColumn.property === "vistoBueno" ? oColumn.label = "Visto Bueno" : "";
                    // oColumn.property === "equipo" ? oColumn.label = "Equipo" : "";
                    // oColumn.property === "utensilio" ? oColumn.label = "Utensilio" : "";
                    
                    oColumn.property === "ensayo" ? oColumn.label = "Ensayo" : "";
                    oColumn.property === "especificacion" ? oColumn.label = "Especificaciones" : "";
                    oColumn.property === "resultados" ? oColumn.label = "Resultados" : "";

                    oColumn.property === "procMenor" ? oColumn.label = "Proceso Menor" : "";
                    oColumn.property === "valorProcMenor" ? oColumn.label = "Valor Proceso Menor" : "";

                    // oColumn.property === "insumo" ? oColumn.label = "Insumo" : "";
                    // oColumn.property === "codInsumo" ? oColumn.label = "Codigo Insumo" : "";
                    // oColumn.property === "umInsumo" ? oColumn.label = "UM Insumo" : "";
                    // oColumn.property === "canInsumo" ? oColumn.label = "Cantidad Insumo" : "";
                    // oColumn.property === "canEntInsumo" ? oColumn.label = "Cantidad Entregada de Insumo" : "";
                    // oColumn.property === "nBultos" ? oColumn.label = "Bultos de Insumo" : "";

                    oColumn.property === "fechaInicio" ? oColumn.label = "Fecha inicio de fabricación" : "";
                    oColumn.property === "fechaCierre" ? oColumn.label = "Fecha fin de fabricación" : "";
                    // oColumn.property === "procedimiento" ? oColumn.label = "Procedimiento" : "";

                    aColumns.push(oColumn);
                }
                return aColumns;
            }
		});
	});
