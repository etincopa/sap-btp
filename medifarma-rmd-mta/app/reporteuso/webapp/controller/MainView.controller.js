sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "mif/rmd/reporteuso/services/reporteUso",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "mif/rmd/reporteuso/services/DemoPersoService",
	"sap/m/TablePersoController"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, Service, MessageBox, MessageToast, Filter, FilterOperator, BusyIndicator, Spreadsheet, exportLibrary, DemoPersoService, TablePersoController) {
		"use strict";

        const rootPath = "mif.rmd.reporteuso";
        var EdmType = exportLibrary.EdmType;
        let oThat;
        let tipoEstructuraId_iMaestraIdEquipo = 485;
        let tipoEstructuraId_iMaestraIdPaso = 485;
        let tipoEstructuraId_iMaestraIdProcedimiento = 487;
		return Controller.extend("mif.rmd.reporteuso.controller.MainView", {

            onInit: function () {
                oThat = this;
                this._oTPC = new TablePersoController({
                    table: this.byId("tblLapsos"),
                    componentName: "reporteuso",
                    persoService: DemoPersoService
                }).activate();
			},
			onAfterRendering: function () {
                oThat = this;
                this.modelGeneral = this.getView().getModel("modelGeneral");
                this.mainModelv2 = this.getView().getModel("mainModelv2");
                this.oModelErpNec = oThat.getOwnerComponent().getModel("NECESIDADESRMD_SRV");
                this.modelGeneral.setSizeLimit(999999);
                this.getMotivosLapso();
                this.onGetAreaOdata();
                this.onGetCentros();
                // this.onSearchEquipos();

            },

            onPersoButtonPressed: function(){
                this._oTPC.openDialog();
            },

            onExit: function () {
                this._oTPC.destroy();
            },

            onTablePersoRefresh : function() {
                DemoPersoService.resetPersData();
                this._oTPC.refresh();
            },

            onSearchLapso: function () {
                var oFilters = this.modelGeneral.getProperty("/oFilters");
                var iCentro = this.getView().byId("idCentro").getValue();
                var aFilters = [];
                var aFiltersTable = {}, centro = null;
                if (oFilters.equipo) {
                    // aFiltersTable.push(new Filter("codEquipo", "EQ", oFilters.equipo));
                    aFiltersTable.equipo = oFilters.equipo;
                }

                if (iCentro) { ///main
                    let modelMaestra = oThat.modelGeneral.getProperty("/MAESTRA");
                    var findKeyCentro = modelMaestra.find(e=>e.contenido === iCentro);
                    if(findKeyCentro){
                        aFilters.push(new Filter("centro",  "EQ", findKeyCentro.codigo));
                    }else {
                        aFilters.push(new Filter("centro",  "EQ", iCentro));
                    }
                }
                if (oFilters.area) {
                    // aFiltersTable.push(new Filter("seccion", "EQ", oFilters.area));
                    aFiltersTable.area = oFilters.area;
                }
                if (oFilters.lote) { ///main
                    aFilters.push(new Filter("lote", "EQ", oFilters.lote));
                }
                if (oFilters.descEquipo) { ///main
                    aFiltersTable.descEquipo = oFilters.descEquipo;
                }
                if (oFilters.producto) {
                    // aFiltersTable.push(new Filter("producto",  "EQ", oFilters.producto));
                    aFiltersTable.producto = oFilters.producto;
                }
                if (oFilters.lapsoParada) {
                    // aFiltersTable.push(new Filter("tipoParada",  "EQ", oFilters.lapsoParada));
                    aFiltersTable.lapsoParada = oFilters.lapsoParada;
                }
                if (oFilters.ordenProduc) { ///main
                    aFilters.push(new Filter("ordenSAP", "EQ", oFilters.ordenProduc));
                }
                if (oFilters.dateHabil) {
                    // aFiltersTable.push(new Filter("fechaInicio2", "EQ", oThat.onFormatterDateFilter(oFilters.dateHabil)));
                    aFiltersTable.dateHabil = oThat.onFormatterDateFilter(oFilters.dateHabil);
                }
                if (oFilters.dateCierre) {
                    // aFiltersTable.push(new Filter("fechaCierre2","EQ", oThat.onFormatterDateFilter(oFilters.dateCierre)));
                    aFiltersTable.dateCierre = oThat.onFormatterDateFilter(oFilters.dateCierre);
                }
                if (oFilters.tipoEquipo) {
                    // aFiltersTable.push(new Filter("tipoEquipo", "EQ", oFilters.tipoEquipo));
                    aFiltersTable.tipoEquipo = oFilters.tipoEquipo;
                }
                // this.onSearch(aFilters);
                this.onSearchEquipos(aFilters, aFiltersTable);
                // var oTable = this.byId("tblLapsos");
                // var oBinding = oTable.getBinding("items");
                // oBinding.filter(aFilters, "Application");
                // BusyIndicator.hide();
            },

            onRestoreFilters: function () {
                this.modelGeneral.setProperty("/oFilters", {});
                this.modelGeneral.setProperty("/aListaSecciones", []);
                oThat.getView().byId("idCentro").setSelectedKey();
                oThat.getView().byId("idArea").setSelectedKey();
            },

            getInitData: function(datosTProceso, comentario){
                var arrProceso = [];
                arrProceso.centro = datosTProceso.centro ? datosTProceso.centro : "",
                arrProceso.seccion = datosTProceso.seccion ? datosTProceso.seccion : "",
                arrProceso.codEquipo = datosTProceso.codEquipo ? datosTProceso.codEquipo : "",
                arrProceso.ordenProduc = datosTProceso.ordenProduc ? datosTProceso.ordenProduc : "",
                arrProceso.etapa = datosTProceso.etapa ? datosTProceso.etapa : "",
                arrProceso.lote = datosTProceso.lote ? datosTProceso.lote : "",
                arrProceso.usuarioCreador = datosTProceso.usuarioCreador ? datosTProceso.usuarioCreador : "",
                arrProceso.fechaCreacion = datosTProceso.fechaCreacion ? datosTProceso.fechaCreacion : "",
                arrProceso.comentario = comentario ? comentario: "",
                arrProceso.producto = datosTProceso.producto ? datosTProceso.producto : "",
                arrProceso.fechaInicio = datosTProceso.fechaInicio ? datosTProceso.fechaInicio : "",
                arrProceso.fechaCierre = datosTProceso.fechaCierre ? datosTProceso.fechaCierre : "",
                arrProceso.fechaIni = datosTProceso.fechaIni ? datosTProceso.fechaIni : "",
                arrProceso.fechaFin = datosTProceso.fechaFin ? datosTProceso.fechaFin : "",
                arrProceso.horaIni = datosTProceso.horaIni ? datosTProceso.horaIni : "",
                arrProceso.horaFin = datosTProceso.horaFin ? datosTProceso.horaFin : "",
                arrProceso.tipoEquipo = datosTProceso.tipoEquipo ? datosTProceso.tipoEquipo : "",
                arrProceso.rmdId = datosTProceso.rmdId ? datosTProceso.rmdId : ""

                return arrProceso;
            },
            onGetHoras: function(horaIniPro){
                var TimeHexa    = horaIniPro /60000;
                var Horas       = (TimeHexa/60).toString().split(".")[0];
                var Mins        = (TimeHexa - (Horas*60)).toString().split(".")[0];
                var Segs        = (((TimeHexa - (Horas*60))*60) - (Mins)*60).toString().split(".")[0];
                TotalHours  = Horas + ":" + Mins + ":" + Segs;
                return TotalHours;
            },
            onBuildData: function(tipo, oLapso, aLapsos, fechaFinLapso , fechaFinPro, descripcion){
                var hexaRestaTotalProceso   = fechaFinPro.getTime() - fechaFinLapso.getTime();
                var TimeHexa    = hexaRestaTotalProceso /60000;
                var Horas       = (TimeHexa/60).toString().split(".")[0];
                var Mins        = (TimeHexa - (Horas*60)).toString().split(".")[0];
                var Segs        = (((TimeHexa - (Horas*60))*60) - (Mins)*60).toString().split(".")[0];
                var TotalHours  = Horas + ":" + Mins + ":" + Segs;

                var oParam = {
                        // centro          : (oLapso.rmdId)?oLapso.rmdId.centro: "",
                        // seccion         : (oLapso.rmdId)?oLapso.rmdId.areaRmdTxt:"",
                        // codEquipo       : (oLapso.equipoId)?oLapso.equipoId.equnr:"",
                        // tipoParada      : (descripcion)?descripcion:"",
                        // ordenProduc     : (oLapso.rmdId)?oLapso.rmdId.ordenSAP:"",
                        // etapa           : (oLapso.rmdId)?oLapso.rmdId.etapa:"",
                        // lote            : (oLapso.rmdId)?oLapso.rmdId.lote:"",
                        // usuarioCreador  : (oLapso.usuarioRegistro)?oLapso.usuarioRegistro:"",
                        // fechaCreacion   : (fechaFinLapso)? oThat.onFormatterDate(fechaFinLapso):"",
                        // comentario      : (oLapso.comentario)?oLapso.comentario:"", 
                        // producto        : (oLapso.rmdId)?oLapso.rmdId.descripcion:"",
                        // fechaInicio     : (oLapso.rmdId)? oThat.onFormatterDate(oLapso.rmdId.fechaInicio):"",
                        // fechaCierre     : (oLapso.rmdId)? oThat.onFormatterDate(oLapso.rmdId.fechaCierre):"",
                        // // fechaIni        : (oLapso.tipoId)?oLapso.tipoId.codigo === "TCINI" ? oThat.onFormatterDate(oLapso.fechaRegistro) : "" : "",
                        // // fechaFin        : (oLapso.tipoId)?oLapso.tipoId.codigo === "TCFIN" ? oThat.onFormatterDate(oLapso.fechaRegistro) : "" : "",
                        // fechaIni        : (fechaFinLapso) ? oThat.onFormatterDate(fechaFinLapso) : "",
                        // fechaFin        : (fechaFinPro) ? oThat.onFormatterDate(fechaFinPro): "",
                        // horaIni         : (fechaFinLapso) ? oThat.onFormatterDateHour(fechaFinLapso) : "",
                        // horaFin         : (fechaFinPro) ? oThat.onFormatterDateHour(fechaFinPro): "",
                        // tipoEquipo      : (oLapso.equipoId)?oLapso.equipoId.ctext === null ? "Secundario" : "Principal" : "",
                        // // proceso         : TotalHours ? TotalHours : "",
                        // proceso         : "",
                        // rmdId           : oLapso.rmdId_rmdId

                        centro          : oLapso.centro?oLapso.centro: "",
                        seccion         : oLapso.seccion?oLapso.seccion:"",
                        codEquipo       : oLapso.codEquipo?oLapso.codEquipo:"",
                        tipoParada      : descripcion?descripcion:"",
                        ordenProduc     : oLapso.ordenProduc?oLapso.ordenProduc:"",
                        etapa           : oLapso.etapa?oLapso.etapa:"",
                        lote            : oLapso.lote?oLapso.lote:"",
                        usuarioCreador  : oLapso.usuarioCreador?oLapso.usuarioCreador:"",
                        fechaCreacion   : (fechaFinLapso)? oThat.onFormatterDate(fechaFinLapso):"",
                        comentario      : oLapso.comentario?oLapso.comentario:"",
                        producto        : oLapso.producto?oLapso.producto:"",
                        fechaInicio     : oLapso.fechaInicio?oLapso.fechaInicio:"",
                        fechaCierre     : oLapso.fechaCierre?oLapso.fechaCierre:"",
                        fechaIni        : (fechaFinLapso) ? oThat.onFormatterDate(fechaFinLapso) : "",
                        fechaFin        : (fechaFinPro) ? oThat.onFormatterDate(fechaFinPro): "",
                        horaIni         : (fechaFinLapso) ? oThat.onFormatterDateHour(fechaFinLapso) : "",
                        horaFin         : (fechaFinPro) ? oThat.onFormatterDateHour(fechaFinPro): "",
                        tipoEquipo      : oLapso.tipoEquipo?oLapso.tipoEquipo:"",
                        procesoMins     : TotalHours,
                        rmdId           : oLapso.rmdId?oLapso.rmdId:"",
                    }
                    aLapsos.push(oParam);
            },
            onFormatterDateHour: function(oDate){
                if (oDate !== null) {
                    var dateEx = new Date(oDate);
                    // oDate = new Date(dateEx.getUTCFullYear(), dateEx.getUTCMonth(), dateEx.getUTCDate(), dateEx.getUTCHours(),
                    // dateEx.getUTCMinutes(), dateEx.getUTCSeconds());
    
                    var v_hora = dateEx.getHours()
                    var v_minutos = dateEx.getMinutes()
                    var v_Seconds = dateEx.getSeconds()
                    
                    v_hora      = (v_hora <10) ? ("0"+ v_hora) : v_hora;
                    v_minutos   = (v_minutos <10) ? ("0"+ v_minutos) : v_minutos;
                    v_Seconds   = (v_Seconds <10) ? ("0"+ v_Seconds) : v_Seconds;

                    return v_hora + ":" + v_minutos+":"+v_Seconds;
                }
            },

            onFormatterDateFilter: function (dDate) {
                if(dDate){
                    //   dDate = new Date(dDate);
                    //   const sYear = dDate.getUTCFullYear();
                    //   const sMonth = dDate.getUTCMonth() + 1;
                    //   const sDay = dDate.getDate();
                    var date = dDate.split("/");

            
                    var sMonth2 = (date[1] <10) ? ("0"+ date[1].toString()) : date[1];
                    var sDay2 = (date[0]<10) ? ("0"+ date[0].toString()) : date[0];
                    const sFecha = ("20"+date[2].toString()) + "-" + sMonth2 + "-" + sDay2;
            
                    return sFecha;
                }else{
                  return "";
                }
              },
              onFormatterDate: function (dDate) {
                if(dDate){
                  dDate = new Date(dDate);
                  const sYear = dDate.getUTCFullYear();
                  const sMonth = dDate.getUTCMonth() + 1;
                  // const sDay = dDate.getUTCDate();
                  const sDay = dDate.getDate();
          
                  var sMonth2 = (sMonth <10) ? ("0"+ sMonth.toString()) : sMonth;
                  var sDay2 = (sDay<10) ? ("0"+ sDay.toString()) : sDay;
                  
                  // const sFecha = sDay + "-" + sMonth + "-" + sYear;
                  const sFecha = sYear + "-" + sMonth2 + "-" + sDay2;
          
                  return sFecha;
                }else{
                  return "";
                }
              },

            onChangePlanta: async function (oEvent) {
                // var oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("additionalText");
                // var aFilter = [];
                // aFilter.push(new Filter("Werks", 'EQ', oCodigoSelected));
                // var aListArea = await Service.getData(oThat.mainModelv2, "/ProduccionSet", "", aFilter);
                // oThat.modelGeneral.setProperty("/aListaSecciones", aListArea.results);
                var Test = 1;
            },

            onGetAreaOdata: async function () {
                // BusyIndicator.show(0);
                let aFilters = [];
                let constanteArea = 'AREA_TRABAJO';
                aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
                let oResponse = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "CaracteristicasSet", aFilters);
                oThat.modelGeneral.setProperty("/aListaSecciones", oResponse.results);
                // BusyIndicator.hide();
            },

            onGetCentros: async function () {
                // BusyIndicator.show(0);
                let aFilters = [];
                let constanteArea = 18;
                aFilters.push(new Filter("oMaestraTipo_maestraTipoId", "EQ", constanteArea));
                let oResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MAESTRA", aFilters);
                oThat.modelGeneral.setProperty("/MAESTRA", oResponse.results);
                // BusyIndicator.hide();
            },

            onExportGeneral: function () {
                var nombreExcel = "Reporte de Uso";
                var oTable = this.getView().byId("tblLapsos");
                var oRowBinding = oTable.getBinding('items');
                var aCols = this.createColumns();
    
                var oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: nombreExcel,
                    worker: false
                };
    
                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

            onExportGeneralNoPrincipal: function () {
                var oTableModel = this.modelGeneral.getProperty("/aListaLapsos");
                if(oTableModel.length === 0){
                    MessageBox.warning("No existen registros en la tabla para poder realizar esta acción.");
                    return;
                }
                var nombreExcel = "Reporte de Uso No Principal";
                // var oTable = this.getView().byId("tblLapsos");
                // var oRowBinding = oTable.getBinding('items');
                
                var aCols = this.createColumns();
    
                var oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oTableModel,
                    fileName: nombreExcel,
                    worker: false
                };
    
                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

            onSearchEquipos: async function(aFilters, aFiltersTable){
                BusyIndicator.show();
                aFilters.push(new Filter("ordenSAP", "NE", null));
                aFilters.push(new Filter("estadoIdRmd_iMaestraId", "NE", null));
                var aFilter = [];
                var aFilterMdEquipo = [];
                var aFilterMdPaso = [];
                var sExpandMD = "aEstructura/estructuraId";
                var sExpand = "equipoId,rmdId,tipoLapsoId,aListCatalogFalla";
                var sExpandMdEquipo = "equipoId";
                var sExpandMdPaso = "pasoId";
                var aListRMD = await Service.getData(oThat.mainModelv2, "/RMD", sExpandMD, aFilters); 
                if (aListRMD.results.length < 100) {
                    aListRMD.results.forEach(function(oRMD){
                        aFilter.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                        aFilterMdEquipo.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                        aFilterMdPaso.push(new Filter("rmdId_rmdId", "EQ", oRMD.rmdId));
                    });
                }                
                var aListaLapsos = await Service.getData(oThat.mainModelv2, "/RMD_LAPSO", sExpand, aFilter);
                var aListaEquipos = await Service.getData(oThat.mainModelv2, "/RMD_ES_EQUIPO", sExpandMdEquipo, aFilterMdEquipo);
                var aListaPasos = await Service.getData(oThat.mainModelv2, "/RMD_ES_PASO", sExpandMdPaso, aFilterMdPaso);

                aListRMD.results.forEach(function(oRMD){
                    oRMD.aEstructura.results.forEach(function (oEstruct){
                        oEstruct.aEquipo.results = aListaEquipos.results.filter(itm=>itm.rmdEstructuraId_rmdEstructuraId === oEstruct.rmdEstructuraId);
                        oEstruct.aPaso.results = aListaPasos.results.filter(itm=>itm.rmdEstructuraId_rmdEstructuraId === oEstruct.rmdEstructuraId);
                    });
                });

                var aTableEquipoLapsoGeneral = [];
                this.modelGeneral.setProperty("/aListaLapsos", []);
                
                for await (const itemRMD of aListRMD.results) {
                    var equiposCheck = false;

                    var fraccionesPorEstructura = itemRMD.aEstructura.results.reduce(function (previousValue, currentValue) {
                        if (previousValue.indexOf(currentValue.fraccion) === -1) {
                          previousValue.push(currentValue.fraccion);
                        }
                        return previousValue;
                    }, []);

                    for await (const fraccion of fraccionesPorEstructura){
                    var aTableEquipoLapso = [];
                    var puestoTrabEquipos = null;
                        
                    var aProcedimiento  = itemRMD.aEstructura.results.find(e=>e.estructuraId.tipoEstructuraId_iMaestraId === tipoEstructuraId_iMaestraIdProcedimiento && e.fraccion === fraccion );
                    var aEquiposData    = itemRMD.aEstructura.results.find(e=>e.estructuraId.tipoEstructuraId_iMaestraId === tipoEstructuraId_iMaestraIdEquipo && e.fraccion === fraccion );
                    
                    if(itemRMD.ordenSAP === 300000215 && itemRMD.lote === "2050082"){
                        var test12 = 1;
                    }

                    if(aEquiposData){
                        puestoTrabEquipos = aEquiposData.aEquipo.results.filter(e=>e.equipoId.arbpl);
                         for await (const equipo of aEquiposData.aEquipo.results){   
                            equipo.verifCheck ? equiposCheck = true : null;
                            var getLapsoPorEquipo = aListaLapsos.results.filter(e=> e.equipoId_equipoId === equipo.equipoId_equipoId && e.rmdId_rmdId === equipo.rmdId_rmdId);
                            var aEquiposLapso = [];
                            getLapsoPorEquipo.forEach( function(lapso){
                                var TotalHours = null;
                                var oEquipoLapso = {};
                                var Horas= null,Mins= null,Segs= null;
                                if(lapso.fechaInicio && lapso.fechaFin){
                                    var hexaRestaTotalProceso   = lapso.fechaFin.getTime() - lapso.fechaInicio.getTime();
                                    var TimeHexa    = hexaRestaTotalProceso /60000;
                                    Horas       = (TimeHexa/60).toString().split(".")[0];
                                    Mins        = (TimeHexa - (Horas*60)).toString().split(".")[0];
                                    Segs        = (((TimeHexa - (Horas*60))*60) - (Mins)*60).toString().split(".")[0];
                                    TotalHours  = Horas + ":" + Mins + ":" + Segs;
                                } else {
                                    TotalHours  = " ";
                                }
                                oEquipoLapso.clvModelo         = "LAPSO POR PARADA";
                                oEquipoLapso.lote              = lapso.rmdId?lapso.rmdId.lote:"";
                                oEquipoLapso.Equipo            = lapso.equipoId?lapso.equipoId.equnr:"";
                                oEquipoLapso.puestoTrabajo     = lapso.equipoId?lapso.equipoId.arbpl:"";
                                oEquipoLapso.fraccion          = lapso.fraccion?lapso.fraccion:"";
                                oEquipoLapso.descEquipo        = lapso.equipoId?lapso.equipoId.eqktx:"";
                                oEquipoLapso.AvisoMant        = lapso.Qmnum?lapso.Qmnum:"";
                                oEquipoLapso.centro            = lapso.rmdId?lapso.rmdId.centro:"";
                                oEquipoLapso.seccion           = lapso.rmdId?lapso.rmdId.areaRmdTxt:"";
                                oEquipoLapso.codEquipo         = lapso.equipoId?lapso.equipoId.equnr:"";
                                oEquipoLapso.tipoParada        = lapso.tipoLapsoId?lapso.tipoLapsoId.descripcion:"";
                                oEquipoLapso.fechaOrderRepo    = lapso.fechaInicio;
                                oEquipoLapso.fechaIni2          = lapso.fechaInicio?oThat.onFormatterDate(lapso.fechaInicio):"";
                                oEquipoLapso.horaIni2           = lapso.fechaInicio?oThat.onFormatterDateHour(lapso.fechaInicio):"";
                                oEquipoLapso.fechaFin2          = lapso.fechaFin?oThat.onFormatterDate(lapso.fechaFin):"";
                                oEquipoLapso.horaFin2           = lapso.fechaFin?oThat.onFormatterDateHour(lapso.fechaFin):"";
                                oEquipoLapso.procesoMins       = TotalHours?TotalHours:"";
                                oEquipoLapso.procesoTransMin    = TotalHours && Horas && Mins?((Horas*60)+parseFloat(Mins)):"";
                                oEquipoLapso.procesoTransHora   = TotalHours && Horas && Mins?(parseFloat(Horas)+(Mins/60)).toFixed(3):"";
                                oEquipoLapso.ordenProduc       = lapso.rmdId?lapso.rmdId.ordenSAP:"";
                                oEquipoLapso.etapa             = lapso.rmdId?lapso.rmdId.etapa:"";
                                oEquipoLapso.lote              = lapso.rmdId?lapso.rmdId.lote:"";
                                oEquipoLapso.producto          = lapso.rmdId?lapso.rmdId.descripcion:"";
                                oEquipoLapso.usuarioCreador    = lapso.usuarioRegistro;
                                oEquipoLapso.fechaCreacion     = lapso.fechaRegistro?oThat.onFormatterDate(lapso.fechaRegistro):"";
                                oEquipoLapso.comentario        = lapso.comentario;
                                oEquipoLapso.fechaInicio2       = lapso.rmdId?oThat.onFormatterDate(lapso.rmdId.fechaInicio):"";
                                oEquipoLapso.fechaCierre2       = lapso.rmdId?oThat.onFormatterDate(lapso.rmdId.fechaCierre):"";
                                oEquipoLapso.tipoEquipo         = lapso.equipoId?lapso.equipoId.ctext === null ? "Secundario" : "Principal":"";
                                if(lapso.aListCatalogFalla){
                                    oEquipoLapso.sintoma        = lapso.aListCatalogFalla.results.length > 0 ? lapso.aListCatalogFalla.results[0].Shorttxtcd : "";
                                }

                                if(lapso.rmdId){
                                    aEquiposLapso.push(oEquipoLapso);
                                }
                            })
                            aTableEquipoLapso = aTableEquipoLapso.concat(aEquiposLapso);
                        }
                        if(equiposCheck){
                            let claveModelo = aProcedimiento.aPaso.results.filter(e=>e.clvModelo); //OBTIENE LOS CLAVE MODELO DE LOS PASOS PROCEDIMIENTO

                            if(itemRMD.ordenSAP === 300000215){
                                var test12 = 1;
                            }
                            var aPuestoTrabReduced = claveModelo.reduce(function (previousValue, currentValue) {
                                if (previousValue.indexOf(currentValue.puestoTrabajo) === -1) {
                                  previousValue.push(currentValue.puestoTrabajo);
                                }
                                return previousValue;
                            }, []);
                            aPuestoTrabReduced.forEach( function(pu){
                                var aFase = [];
                                var getClaveModeloPorPuestoTrab = claveModelo.filter(e=>e.puestoTrabajo === pu);

                                let oPreIni = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "SETPRE" && e.pasoId.tipoCondicionId_iMaestraId === 481);
                                let oPreFin = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "SETPRE" && e.pasoId.tipoCondicionId_iMaestraId === 482);
                                if(oPreIni && oPreFin){
                                    oPreIni.fechaHoraInicio = oPreIni.fechaHora;
                                    oPreIni.fechaHoraFin    = oPreFin.fechaHora;
                                    aFase.push(oPreIni);
                                }

                                let oProcIni = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "PROCESO" && e.pasoId.tipoCondicionId_iMaestraId === 481);
                                let oProcFin = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "PROCESO" && e.pasoId.tipoCondicionId_iMaestraId === 482);
                                if(oProcIni && oProcFin){
                                    oProcIni.fechaHoraInicio = oProcIni.fechaHora;
                                    oProcIni.fechaHoraFin    = oProcFin.fechaHora;
                                    aFase.push(oProcIni);
                                }
                                
                                let oPostIni = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "SETPOST" && e.pasoId.tipoCondicionId_iMaestraId === 481);
                                let oPostFin = getClaveModeloPorPuestoTrab.find(e=>e.clvModelo === "SETPOST" && e.pasoId.tipoCondicionId_iMaestraId === 482);
                                if(oPostIni && oPostFin){
                                    oPostIni.fechaHoraInicio = oPostIni.fechaHora;
                                    oPostIni.fechaHoraFin    = oPostFin.fechaHora;
                                    aFase.push(oPostIni);
                                }


                                aFase.forEach( function(e){
                                    var getEquipoPuesto = puestoTrabEquipos.find(f=>f.equipoId.arbpl === e.puestoTrabajo);
                                    let TotalHours  = null;
                                    let descripcionParada = null;
                                    var Horas= null,Mins= null,Segs= null;
                                    if(e.fechaHoraInicio && e.fechaHoraFin){
                                        let hexaRestaTotalProceso   = e.fechaHoraFin.getTime() - e.fechaHoraInicio.getTime();
                                        let TimeHexa    = hexaRestaTotalProceso /60000;
                                        Horas       = (TimeHexa/60).toString().split(".")[0];
                                        Mins        = (TimeHexa - (Horas*60)).toString().split(".")[0];
                                        Segs        = (((TimeHexa - (Horas*60))*60) - (Mins)*60).toString().split(".")[0];
                                        TotalHours  = Horas + ":" + Mins + ":" + Segs;
                                    } else {
                                        TotalHours  = " ";
                                    }
                                    if(e.clvModelo === "SETPRE"){
                                        descripcionParada = "SET UP PRE PROCESO";
                                        e.ordenSetup = 1;
                                    }else if(e.clvModelo === "PROCESO"){
                                        descripcionParada = "PROCESO";
                                        e.ordenSetup = 2;
                                    }else if(e.clvModelo === "SETPOST"){
                                        descripcionParada = "SET UP POST PROCESO";
                                        e.ordenSetup = 3;
                                    }



                                    e.centro            = itemRMD.centro;
                                    e.seccion           = itemRMD.areaRmdTxt;
                                    e.codEquipo         = getEquipoPuesto? getEquipoPuesto.equipoId.equnr : "";
                                    e.descEquipo         = getEquipoPuesto? getEquipoPuesto.equipoId.eqktx : "";
                                    e.tipoParada        = descripcionParada?descripcionParada:"";
                                    e.fechaOrderRepo    = e.fechaHoraInicio?e.fechaHoraInicio:"";
                                    e.fechaIni2          = e.fechaHoraInicio?oThat.onFormatterDate(e.fechaHoraInicio):"";
                                    e.horaIni2           = e.fechaHoraInicio?oThat.onFormatterDateHour(e.fechaHoraInicio):"";
                                    e.fechaFin2          = e.fechaHoraFin?oThat.onFormatterDate(e.fechaHoraFin):"";
                                    e.horaFin2           = e.fechaHoraFin?oThat.onFormatterDateHour(e.fechaHoraFin):"";
                                    e.procesoMins       = TotalHours?TotalHours:"";
                                    e.procesoTransMin    = TotalHours && Horas && Mins?((Horas*60)+parseFloat(Mins)):"";
                                    e.procesoTransHora   = TotalHours && Horas && Mins?(parseFloat(Horas)+(Mins/60)).toFixed(3):"";
                                    e.ordenProduc       = itemRMD.ordenSAP;
                                    e.etapa             = itemRMD.etapa;
                                    e.lote              = itemRMD.lote;
                                    e.producto          = itemRMD.descripcion;
                                    e.usuarioCreador    = itemRMD.usuarioRegistro;
                                    e.fechaCreacion     = itemRMD.fechaRegistro?oThat.onFormatterDate(itemRMD.fechaRegistro):"";
                                    e.comentario        = " ";
                                    e.fechaInicio2       = itemRMD.fechaInicio?oThat.onFormatterDate(itemRMD.fechaInicio):"";
                                    e.fechaCierre2       = itemRMD.fechaInicio?oThat.onFormatterDate(itemRMD.fechaCierre):"";
                                    e.tipoEquipo        = " ";
                                    
                                })
                                aFase.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
                                aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.concat(aFase);
                            })
                            
                            aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.concat(aTableEquipoLapso);

                            // var puestoTrabEquipos = aEquiposData.aEquipo.results.filter(e=>e.equipoId.arbpl);
                            // var test = 1 ;
                            equiposCheck = false;
                        }else{
                            aTableEquipoLapso = [];
                            equiposCheck = false;
                        }

                    }
                          //  })
                        }
                    
                }

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.orden - b.orden;
                });

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.fechaOrderRepo - b.fechaOrderRepo;
                });

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.ordenSetup - b.ordenSetup;
                });

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.fraccion - b.fraccion;
                });

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.lote - b.lote;
                });

                aTableEquipoLapsoGeneral.sort(function (a, b) {
                    return a.ordenProduc - b.ordenProduc;
                });
                
                var newFilterModel = this.filterData(aTableEquipoLapsoGeneral,aFiltersTable);
                this.modelGeneral.setProperty("/aListaLapsos", newFilterModel);
                // var oTable = this.byId("tblLapsos");
                // var oBinding = oTable.getBinding("items");
                // oBinding.filter(aFiltersTable, "Application");
                BusyIndicator.hide();

            },
            filterData: function(aTableEquipoLapsoGeneral, aFiltersTable){
                if(aFiltersTable.equipo){
                    // aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.codEquipo === aFiltersTable.equipo);
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.codEquipo.includes(aFiltersTable.equipo));
                }

                if(aFiltersTable.area){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.seccion.includes(aFiltersTable.area));
                }

                if(aFiltersTable.producto){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.producto.includes(aFiltersTable.producto));
                }

                if(aFiltersTable.lapsoParada){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.tipoParada.includes(aFiltersTable.lapsoParada));
                }

                if(aFiltersTable.dateHabil){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.fechaInicio2 === aFiltersTable.dateHabil);
                }

                if(aFiltersTable.dateCierre){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.fechaCierre2 === aFiltersTable.dateCierre);
                }

                if(aFiltersTable.tipoEquipo){
                    // aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.tipoEquipo === aFiltersTable.tipoEquipo);
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.tipoEquipo.includes(aFiltersTable.tipoEquipo));
                }
                //se agrega func.
                if(aFiltersTable.descEquipo){
                    aTableEquipoLapsoGeneral = aTableEquipoLapsoGeneral.filter(e=>e.descEquipo.includes(aFiltersTable.descEquipo));
                    
                }
                return aTableEquipoLapsoGeneral;
            },
            getMotivosLapso: async function () {
                BusyIndicator.show(0);
                let sExpandTipoMaestro = "oMaestraTipo";
                let aFilter= [];
                aFilter.push(new Filter("activo", "EQ", true));
                var aListMotivos = await Service.getDataFilter(oThat.mainModelv2, "/MOTIVO_LAPSO", aFilter);
                var aListTipo = await Service.getDataExpand(oThat.mainModelv2, "/MAESTRA", sExpandTipoMaestro, aFilter);
                //funcion para tipo resta
                var aListMotivosResta=[];
                
                oThat.modelGeneral.setProperty("/ComentarioLapso", "");
                
                aListMotivos.results.forEach(function(val1,index){
                    aListTipo.results.forEach(function(val2){
                        if(val2.iMaestraId == val1.tipoId_iMaestraId){
                            if(val2.contenido == "R" ){
                                aListMotivosResta.push(val1);
                            }
                        }
                    });
                });
                
                oThat.modelGeneral.setProperty("/motivosLapso", aListMotivosResta);
                // oThat.modelGeneral.setProperty("/motivosLapso", aListMotivos.results);
                BusyIndicator.hide();
            },

            onExportPorLapso: function () {
                // var oTable = this.getView().byId("tblLapsos").getItems();
                var oTableModel = this.modelGeneral.getProperty("/aListaLapsos");
                var listMotivos = this.modelGeneral.getProperty("/motivosLapso");
                if(oTableModel.length === 0){
                    MessageBox.warning("No existen registros en la tabla para poder realizar esta acción.");
                    return;
                }
                var ArrGeneral = [];
                oTableModel.forEach( function(oItem){
                    // var obj = oItem.getBindingContext("modelGeneral").getObject();
                    var obj = {};
                    obj.seccion = oItem.seccion?oItem.seccion:"";
                    obj.codEquipo = oItem.codEquipo?oItem.codEquipo:"";
                    obj.centro = oItem.centro?oItem.centro:"";
                    obj.descEquipo = oItem.descEquipo?oItem.descEquipo:"";
                    obj.tipoParada = oItem.tipoParada?oItem.tipoParada:"";
                    obj.sintoma = oItem.sintoma?oItem.sintoma:"";
                    obj.sTotal = 1;
                    ArrGeneral.push(obj);
                })
                
                var ArrSeparador = [];
                ArrGeneral.forEach(function (items) {
                    let tipoParada = listMotivos.find(e=>e.descripcion === items.tipoParada);
                    if(tipoParada){
                        if(ArrSeparador.length === 0){
                            ArrSeparador.push({"centro" : (items.centro)?items.centro : "", "codEquipo" : (items.codEquipo)?items.codEquipo : "", "descEquipo" : (items.descEquipo)?items.descEquipo : "", "seccion": (items.seccion)?items.seccion : "", "tipoParada": (items.tipoParada)?items.tipoParada : "", "sintoma": (items.sintoma)?items.sintoma : "", "sTotal": items.sTotal });
                        } else {
                            var findArr = ArrSeparador.find(e => e.codEquipo === items.codEquipo && e.seccion === items.seccion && e.centro === items.centro && e.tipoParada === items.tipoParada && e.sintoma === items.sintoma);
                            if(findArr){
                                findArr.sTotal++;
                            }else{
                                ArrSeparador.push({"centro" : (items.centro)?items.centro : "", "codEquipo" : (items.codEquipo)?items.codEquipo : "", "descEquipo" : (items.descEquipo)?items.descEquipo : "", "seccion": (items.seccion)?items.seccion : "", "tipoParada": (items.tipoParada)?items.tipoParada : "", "sintoma": (items.sintoma)?items.sintoma : "", "sTotal": items.sTotal });
                            }
                        }
                    }
                })
                  
                var nombreExcel = "Reporte de Uso por Paradas/Lapso";
                // var oRowBinding = countedNames;
                var oRowBinding = ArrSeparador;
                var aCols = this.createColumnsPorLapso();
    
                var oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: nombreExcel,
                    worker: false
                };
    
                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
    
            },

            createColumnsPorLapso: function () {
                var aCols = [];

                aCols.push({
                    label: 'Centro',
                    property: 'centro',
                    type: EdmType.String
                });
    
                aCols.push({
                    label: 'Equipo',
                    property: 'codEquipo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción del Equipo',
                    property: 'descEquipo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Sección',
                    property: 'seccion',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Tipo de Lapso',
                    property: 'tipoParada',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Sintoma',
                    property: 'sintoma',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Lapsos/Paradas',
                    property: 'sTotal',
                    type: EdmType.String
                });

                return aCols;
            },
    
            createColumns: function() {
                var visiblePersoColumns = this._oTPC._oPersonalizations.aColumns.filter(e=>e.visible === true);
                var aCols = [];
                // visiblePersoColumns.forEach( function(col){
        
                    // if(col.order === 0){
                        aCols.push({
                            label: 'Centro',
                            property: 'centro',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 1){
                        aCols.push({
                            label: 'Área',
                            property: 'seccion',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 2){
                        aCols.push({
                            label: 'Equipo',
                            property: 'codEquipo',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 3){
                        aCols.push({
                            label: 'Descripción del Equipo',
                            property: 'descEquipo',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 4){
                        aCols.push({
                            label: 'Tipo Lapso',
                            property: 'tipoParada',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 5){
                        aCols.push({
                            label: 'Fecha Inicial',
                            property: 'fechaIni2',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 6){
                        
                        aCols.push({
                            label: 'Hora Inicial',
                            property: 'horaIni2',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 7){
                        aCols.push({
                            label: 'Fecha Final',
                            property: 'fechaFin2',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 8){
                        aCols.push({
                            label: 'Hora Final',
                            property: 'horaFin2',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 9){
                        aCols.push({
                            label: 'Tiempo Transc. HH:mm:ss',
                            property: 'procesoMins',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 10){
                        aCols.push({
                            label: 'Proceso Transc. en Mins',
                            property: 'procesoTransMin',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 11){
                        aCols.push({
                            label: 'Proceso Transc. en Horas',
                            property: 'procesoTransHora',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 12){
                        aCols.push({
                            label: 'Orden de Producción',
                            property: 'ordenProduc',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 13){
                        aCols.push({
                            label: 'Etapa',
                            property: 'etapa',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 14){
                        aCols.push({
                            label: 'Lote',
                            property: 'lote',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 15){
                        aCols.push({
                            label: 'Producto',
                            property: 'producto',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 16){
                        aCols.push({
                            label: 'Usuario Creador',
                            property: 'usuarioCreador',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 17){
                        aCols.push({
                            label: 'Fecha Creación',
                            property: 'fechaCreacion',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 18){
                        aCols.push({
                            label: 'Comentario',
                            property: 'comentario',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 19){
                        aCols.push({
                            label: 'Fecha Habilitación',
                            property: 'fechaInicio2',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 20){
                        aCols.push({
                            label: 'Fecha Cierre',
                            property: 'fechaCierre2',
                            type: EdmType.Date
                        });
                    // }

                    // if(col.order === 21){
                        aCols.push({
                            label: 'Tipo de Equipo',
                            property: 'tipoEquipo',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 22){
                        aCols.push({
                            label: 'Puesto de Trabajo',
                            property: 'puestoTrabajo',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 23){
                        aCols.push({
                            label: 'Fraccion',
                            property: 'fraccion',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 24){
                        aCols.push({
                            label: 'Aviso de Mantenimiento',
                            property: 'AvisoMant',
                            type: EdmType.String
                        });
                    // }

                    // if(col.order === 25){
                        aCols.push({
                            label: 'Sintoma',
                            property: 'sintoma',
                            type: EdmType.String
                        });
                    // }
                // })
    
                return aCols;
            }
		});
	});
