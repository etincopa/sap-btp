sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    '../../services/Service',
    "mif/rmd/configuracion/utils/formatter",
    "mif/rmd/configuracion/utils/util",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment"
],
    function (Controller, MessageBox, MessageToast, Filter, FilterOperator, FilterType, Spreadsheet, exportLibrary, oDataService, formatter, util, JSONModel, BusyIndicator, Fragment) {
        "use strict";
        const rootPath = "mif.rmd.configuracion";
        let EdmType = exportLibrary.EdmType,
            sUsuarioLocal = "",
            oInfoUsuario,
            sAdditionalText,
            oThat,
            sIdStateMaintenanceActive,
            sTipoDatoRango,
            sTipoDatoNumero,
            sTipoDatoCantidad,
            sTipoDatoSinTipoDato,
            sTipoDatoNotificacion,
            sEstadoAutorizado,
            sEstadoSuspendido;
        return Controller.extend("mif.rmd.configuracion.controller.mantenimiento.Mantenimiento", {
            formatter: formatter,
            onAfterRendering: async function (aThat) {
                // Carga de constantes
                if (aThat.aConstantes.results.length > 0) {
                    await this.onSetConstans(aThat.aConstantes);
                } else {
                    MessageBox.warning(formatter.onGetI18nText(aThat,"txtMessageNoConstants"));
                    sap.ui.core.BusyIndicator.hide();
                    return false;
                }
                this.localModel = this.getView().getModel("localModel");
                this.localModel.setSizeLimit(999999999);
                this.mainModel = this.getView().getModel("mainModel");
                this.mainModelv2 = this.getView().getModel("mainModelv2");
                this.mainModelv2.setSizeLimit(999999999);
                this.oModelErpNec = this.getView().getModel("NECESIDADESRMD_SRV");
                oInfoUsuario = this.localModel.getProperty("/oInfoUsuario");
                // sUsuarioLocal = (sap.ushell === undefined) ? "RYEPEGAV" : sap.ushell.Container.getService("UserInfo").getUser().getFullName();
                sUsuarioLocal = (sap.ushell === undefined) ? "RYEPEGAV" : oInfoUsuario.data.usuario;
                this.onState(true, "motLapsoDependencies");
                oThat  = this;
                console.log("onAfterRendering");
                this.onState(true, "sTabEstructura");
                this.onState(false, "sTabEtiqueta");
                this.onState(false, "sTabPaso");
                this.onState(false, "sTabMotivo");
                this.onState(false, "sTabEquipo");
                this.onState(false, "sTabMotivoLapso");
                this.onConsumirNecesidadesClaveModelo();


                let dataMDUtensilio = await oDataService.onGetDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO");
                this.localModel.setProperty("/temp/md_utensilio",dataMDUtensilio);
                //   cargar pasos en modelo
                //   Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO");
                let data_md_pasos =  await oDataService.onGetDataGeneral(oThat.mainModelv2, "MD_ES_PASO");
                this.localModel.setProperty("/temp/md_paso",data_md_pasos);
                console.log("datos locales", this.localModel.getProperty("/temp/md_paso"));
            },
            //Seteo de constantes
            onSetConstans:async function (aConstants) {
                try {
                    for await (const oConstante of aConstants.results) { 
                        if (oConstante.codigoSap === "IDTIPODATORANGO") {
                            sTipoDatoRango = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATONUMERO") {
                            sTipoDatoNumero = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOCANTIDAD") {
                            sTipoDatoCantidad = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOSINTIPODATO") {
                            sTipoDatoSinTipoDato = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
                            sEstadoAutorizado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDSUSPENDIDO") {
                            sEstadoSuspendido = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATONOTIFICACION") {
                            sTipoDatoNotificacion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTACTIVO") {
                            sIdStateMaintenanceActive = parseInt(oConstante.contenido);
                        }
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },
            //consumir odata de necesidades clavemodelo
            onConsumirNecesidadesClaveModelo: function () {
                // let oModel = this.getView().getModel("NECESIDADESRMD_SRV");
                oDataService.onGetDataGeneral(this.oModelErpNec, "ClaveModeloSet").then(({results}) => {
                 
                    
                    oThat.getView().getModel("localModel").setProperty("/dataClaveModelo", results);
               
                })
                .catch(err=>{
                    console.log("Error al consumir odata de necesidades clavemodelo", err);
                })
            },
            onSearchEquipment: async function () {
                let that = this;
                BusyIndicator.show(0);
                await this.onGetPasoUtensilio();
                let oFiltro = this.localModel.getProperty("/aFiltro");
                let aFilter = [];
                let aListaNuevaUtensilio = [];
                if (oFiltro.mdId) {
                    let sExpand = "utensilioId,agrupadorId";
                    let aFilterMd = [];
                    aFilterMd.push(new Filter("mdId_mdId", "EQ", oFiltro.mdId));
                    let oResultMdUtensilio = await oDataService.onGetDataGeneralFiltersExpand(that.mainModelv2, "MD_ES_UTENSILIO", aFilterMd, sExpand);
                    oResultMdUtensilio.results.forEach(function(oUtensilio){
                        if (oUtensilio.utensilioId) {
                            aFilter.push(new Filter("codigo", "EQ", oUtensilio.utensilioId.codigo));
                        }
                        if (oUtensilio.agrupadorId) {
                            oUtensilio.agrupadorId.tipoId = {
                                contenido : 'AGRUPADOR'
                            }
                            aListaNuevaUtensilio.push(oUtensilio.agrupadorId);
                        }
                    });
                }
                if (oFiltro.descrpEquipment) {
                    let oFilter = new Filter({
                        path: "descripcion",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.descrpEquipment).toLowerCase(),
                        caseSensitive: false
                    });
                    aFilter.push(oFilter);
                }
                if (oFiltro.codeEquipment) {
                    let oFilter = new Filter({
                        path: "codigo",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.codeEquipment),
                        caseSensitive: false
                    });
                    aFilter.push(oFilter);
                }
                if (oFiltro.oMaestraTipo_maestraTipoId) {
                    let oFilter = new Filter({
                        path: "tipoId_iMaestraId",
                        operator: FilterOperator.EQ,
                        value1: (oFiltro.oMaestraTipo_maestraTipoId).toString()
                    });
                    aFilter.push(oFilter);
                }
                if (oFiltro.estadoId_iMaestraId) {
                    let oFilter = new Filter({
                        path: "estadoId_iMaestraId",
                        operator: FilterOperator.EQ,
                        value1: (oFiltro.estadoId_iMaestraId).toString(),
                        caseSensitive: false
                    });
                    aFilter.push(oFilter)
                }
                aFilter.push(new Filter("activo", "EQ", true));
                sap.ui.core.Fragment.byId("frgConfiguration", "tblEquipment").getBinding("items").filter(aFilter, FilterType.Application);
                if (oFiltro.mdId) {
                    let aItems = sap.ui.core.Fragment.byId("frgConfiguration", "tblEquipment").getItems();
                    aItems.forEach(function(oItem){
                        aListaNuevaUtensilio.push(oItem.getBindingContext("localModel").getObject());
                    });
                    let aFilterVacio = [];
                    sap.ui.core.Fragment.byId("frgConfiguration", "tblEquipment").getBinding("items").filter(aFilterVacio, FilterType.Application); 
                    this.localModel.setProperty("/aListaUtensilio", aListaNuevaUtensilio);
                }
                BusyIndicator.hide();
            },

            onRestoreFiltersEquipment: function () {
                this.onGetPasoUtensilio();
                this.localModel.setProperty("/aFiltro/codeEquipment", '');
                this.localModel.setProperty("/aFiltro/descrpEquipment", '');
                this.localModel.setProperty("/aFiltro/oMaestraTipo_maestraTipoId", '');
                this.localModel.setProperty("/aFiltro/estadoId_iMaestraId", '');
                this.localModel.setProperty("/aFiltro/mdId", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblEquipment").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onSearchStructure: function () {
                var oFiltro = this.localModel.getProperty("/aFiltro");

                if (oFiltro.descrpStructure) {
                    var oFilter = new Filter({
                        path: "descripcion",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.descrpStructure).toLowerCase(),
                        caseSensitive: false
                    });

                    sap.ui.core.Fragment.byId("frgConfiguration", "tblStructure").getBinding("items").filter([oFilter]);
                }
            },

            onRestoreFiltersStructure: function () {
                this.localModel.setProperty("/aFiltro/descrpStructure", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblStructure").getBinding("items").filter(aFilter);
            },

            onSearchLabel: function () {
                var oFiltro = this.localModel.getProperty("/aFiltro");
                var aFilter = [];
                if (oFiltro.descrpLabel) {
                    var oFilter = new Filter({
                        path: "descripcion",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.descrpLabel).toLowerCase(),
                        caseSensitive: false
                    });
                    aFilter.push(oFilter);
                }
                if (oFiltro.structLabel) {
                    var oFilter = new Filter("estructuraId_estructuraId", FilterOperator.EQ, oFiltro.structLabel);
                    aFilter.push(oFilter);
                }

                sap.ui.core.Fragment.byId("frgConfiguration", "tblLabel").getBinding("items").filter(aFilter);
            },

            onRestoreFiltersLabel: function () {
                this.localModel.setProperty("/aFiltro/structLabel", '');
                this.localModel.setProperty("/aFiltro/descrpLabel", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblLabel").getBinding("items").filter(aFilter);
            },

            onSearchStep: function () {
                this.onGetPasoUtensilio();
                var oFiltro = this.localModel.getProperty("/aFiltro");
                var aFilter = [];
                if (oFiltro.codStep) {
                    var oFilter = new Filter({
                        path: "codigo",
                        operator: "EQ",
                        value1: oFiltro.codStep
                    });

                    aFilter.push(oFilter);
                }
                if (oFiltro.descrpStep) {
                    let aDescripcion = oFiltro.descrpStep.charAt(0);
                    if (aDescripcion === "$") {
                        var oFilter = new Filter({
                            path: "descripcion",
                            operator: FilterOperator.StartsWith,
                            value1: (oFiltro.descrpStep.substr(1)).toLowerCase(),
                            caseSensitive: false
                        });
                    } else {
                        var oFilter = new Filter({
                            path: "descripcion",
                            operator: FilterOperator.Contains,
                            value1: (oFiltro.descrpStep).toLowerCase(),
                            caseSensitive: false
                        });
                    }
                    aFilter.push(oFilter);
                }
                if (oFiltro.structStep) {
                    var oFilter = new Filter("estructuraId_estructuraId", FilterOperator.Contains, oFiltro.structStep);
                    aFilter.push(oFilter);
                }
                if (oFiltro.labelStep) {
                    var oFilter = new Filter("etiquetaId_etiquetaId", FilterOperator.Contains, oFiltro.labelStep);
                    aFilter.push(oFilter);
                }
                aFilter.push(new Filter({
                    path: "activo",
                    operator: "EQ",
                    value1: true
                }));
                sap.ui.core.Fragment.byId("frgConfiguration", "tblStep").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onRestoreFiltersStep: function () {
                this.onGetPasoUtensilio();
                this.localModel.setProperty("/aFiltro/codStep", '');
                this.localModel.setProperty("/aFiltro/descrpStep", '');
                this.localModel.setProperty("/aFiltro/structStep", '');
                this.localModel.setProperty("/aFiltro/labelStep", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblStep").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onSearchReason: function () {
                var oFiltro = this.localModel.getProperty("/aFiltro");
                if (oFiltro.descrpReason) {
                    var oFilter = new Filter({
                        path: "descripcion",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.descrpReason).toLowerCase(),
                        caseSensitive: false
                    });
                    sap.ui.core.Fragment.byId("frgConfiguration", "tblReason").getBinding("items").filter(oFilter, FilterType.Application);
                }
            },

            onRestoreFiltersReason: function () {
                this.localModel.setProperty("/aFiltro/descrpReason", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblReason").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onSearchStepReason: function () {
                var oFiltro = this.localModel.getProperty("/aFiltro");
                if (oFiltro.descrpStepReason) {
                    var oFilter = new Filter({
                        path: "descripcion",
                        operator: FilterOperator.Contains,
                        value1: (oFiltro.descrpStepReason).toLowerCase(),
                        caseSensitive: false
                    });
                    sap.ui.core.Fragment.byId("frgConfiguration", "tblStepReason").getBinding("items").filter(oFilter, FilterType.Application);
                }
            },

            onRestoreFiltersStepReason: function () {
                this.localModel.setProperty("/aFiltro/descrpStepReason", '');
                var aFilter = [];
                sap.ui.core.Fragment.byId("frgConfiguration", "tblStepReason").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onExportExcel: function (oEvent) {
                var oTableName = oEvent.getSource().getText();
                var oTableId = "";
                var oFunctionColum, oFragId;
                if (oTableName === "Estructuras") {
                    oTableId = "tblStructure";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigStructure();
                } else if (oTableName === "Etiquetas") {
                    oTableId = "tblLabel";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigLabel();
                } else if (oTableName === "Pasos") {
                    oTableId = "tblStep";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigStep();
                } else if (oTableName === "Equipos Utensilios") {
                    oTableId = "tblEquipment";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigEquipment();
                } else if (oTableName === "Motivo Lapsos") {
                    oTableId = "tblStepReason";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigStepReason();
                } else if (oTableName === "RMD Asociadas") {
                    oTableId = "tblRMA";
                    oFragId = "frgOpenRMA";
                    oFunctionColum = this.createColumnConfigRMA();
                } else if (oTableName === "Motivos") {
                    oTableId = "tblReason";
                    oFragId = "frgConfiguration";
                    oFunctionColum = this.createColumnConfigReason();
                } else if (oTableName === "RM Asociadas al Utensilio") {
                    oTableId = "tblRMAutensilio";
                    oFragId = "frgOpenRMAUtensilio";
                    oFunctionColum = this.createColumnConfigRMAUtensilio();
                }
                this.exportExcelConstructor(oTableName, oTableId, oFunctionColum, oFragId);
            },

            onGetRMAsociadas: async function (Items, entity, tipo, callback) {
                var that = this;
                BusyIndicator.show(0);
                let aPromises = [];
                let itemConsultado = [];
                let sExpand = "estructuraId,etiquetaId,tipoDatoId,estadoId,tipoLapsoId,tipoCondicionId";
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                if(entity === "MD_ES_PASO"){
                        // resolve("OK");
                        // itemConsultado = data_md_pasos.results.map(p=>{

                        //     return {
                        //         "codigo":,
                        //         "descripcion",

                        //     }
                        // })
                        let data_md_pasos =  await oDataService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "PASO", aFilter, sExpand);
                        console.log("data_md_pasos ",data_md_pasos);
                        callback(data_md_pasos.results);
                }else{
                let obtenerRMAsociadasAsync = new Promise(async function (resolve) {
                 
                            Items.oList.sort(function (a, b) {
                                return a.codigo - b.codigo;
                            });
                        for await (const oPaso of Items.oList) {
                            // Items.oList.forEach(async function(oPaso){
                                let oTemp = oPaso;
                                let aFilter = [];
                                if (tipo === "PASO") {
                                    // aFilter.push(new Filter("pasoId_pasoId", "EQ", oTemp.pasoId));
                                } else if (tipo === "UTENSILIO") {
                                    // aFilter.push(new Filter("utensilioId_utensilioId", "EQ", oTemp.utensilioId));
                                }
                                // let oMDPasoResult = await oDataService.onGetDataGeneralFilters(that.mainModelv2, entity, aFilter);
                                let oMDPasoResult;
                                if(entity==="MD_ES_PASO"){
                                    oMDPasoResult = that.localModel.getProperty("/temp/md_paso").results.filter(pay=> pay.pasoId_pasoId== oTemp.pasoId);
                                    // oMDPasoResult = await oDataService.onGetDataGeneralFilters(that.mainModelv2, entity, aFilter);
                                    // console.log(oMDPasoResult);
                                } else if (entity === "MD_ES_UTENSILIO") {
                                    oMDPasoResult = that.localModel.getProperty("/temp/md_utensilio").results.filter(itm=>itm.utensilioId_utensilioId == oTemp.utensilioId);
                                    // oMDPasoResult = await oDataService.onGetDataGeneralFilters(that.mainModelv2, entity, aFilter);
                                }
                                if(oMDPasoResult){
                                    oTemp.cantAsocRM = oMDPasoResult.length;
                                    itemConsultado.push(oTemp);
                                    if (itemConsultado.length === Items.oList.length) {
                                        resolve("OK");
                                    }
                                }
                            }
                        });
                        aPromises.push(obtenerRMAsociadasAsync);
                        Promise.all(aPromises).then(function () {
                            BusyIndicator.hide();
                            callback(itemConsultado);
                        });
                }
                  
                
            },

            exportExcelConstructor: function (oTableName, oTableId, oFunctionColum, oFragId) {
                let that = this;
                let nombreExcel = oTableName;
                let oTable = sap.ui.core.Fragment.byId(oFragId, oTableId);
                if(oTableId === "tblStep") {
                    console.log("init ",new Date().getTime());
                    that.onGetRMAsociadas(oTable.getBinding('items'), "MD_ES_PASO", "PASO",  function (result) {
                        let aCols = oFunctionColum;
                        let oSettings = {
                            workbook: {
                                columns: aCols,
                                hierarchyLevel: 'Level'
                            },
                            dataSource: result,
                            fileName: nombreExcel,
                            worker: false
                        };
                        console.log("end ",new Date().getTime());
                        let oSheet = new Spreadsheet(oSettings);
                        oSheet.build().finally(function () {
                            oSheet.destroy();
                            BusyIndicator.hide();
                        });
                    });
                } else if (oTableId === "tblEquipment") {
                    that.onGetRMAsociadas(oTable.getBinding('items'), "MD_ES_UTENSILIO", "UTENSILIO", function (result) {
                        let aCols = oFunctionColum;
                        let oSettings = {
                            workbook: {
                                columns: aCols,
                                hierarchyLevel: 'Level'
                            },
                            dataSource: result,
                            fileName: nombreExcel,
                            worker: false
                        };

                        let oSheet = new Spreadsheet(oSettings);
                        oSheet.build().finally(function () {
                            oSheet.destroy();
                        });
                    });
                } else {
                    let oRowBinding = oTable.getBinding('items');
                    let aCols = oFunctionColum;

                    let oSettings = {
                        workbook: {
                            columns: aCols,
                            hierarchyLevel: 'Level'
                        },
                        dataSource: oRowBinding,
                        fileName: nombreExcel,
                        worker: false
                    };

                    let oSheet = new Spreadsheet(oSettings);
                    oSheet.build().finally(function () {
                        oSheet.destroy();
                    });
                } 
            },

            createColumnConfigStructure: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Estructura',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Numeración',
                    type: EdmType.Boolean,
                    property: 'numeracion',
                    trueValue: "S",
                    falseValue: "N"
                });

                aCols.push({
                    label: 'Verificado Por',
                    type: EdmType.Boolean,
                    property: 'verificadoPor',
                    trueValue: "S",
                    falseValue: "N"
                });

                aCols.push({
                    label: 'Tipo de estructura',
                    property: 'tipoEstructuraId/contenido',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    type: EdmType.String,
                    property: 'usuarioRegistro',
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            },

            createColumnConfigLabel: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Estructura',
                    type: EdmType.String,
                    property: 'estructuraId/descripcion'
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    property: 'usuarioRegistro',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            },

            createColumnConfigStep: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Estructura',
                    type: EdmType.String,
                    property: 'estructuraId/descripcion'
                });

                aCols.push({
                    label: 'Etiqueta',
                    property: 'etiquetaId/descripcion',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Estado',
                    property: 'estadoId/contenido',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Cantidad RM',
                    property: 'cantAsocRM',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Tipo de dato',
                    property: 'tipoDatoId/contenido',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Valor Mínimo',
                    property: 'valorInicial',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Valor Máximo',
                    property: 'valorFinal',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Margen',
                    property: 'margen',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Decimales',
                    property: 'decimales',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Tipo Lapso',
                    property: 'tipoLapsoId/descripcion',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Tipo Condición',
                    property: 'tipoCondicionId/contenido',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    property: 'usuarioRegistro',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            },
            createColumnConfigEquipment: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Estado',
                    type: EdmType.String,
                    property: 'estadoId/contenido'
                });

                aCols.push({
                    label: 'Tipo',
                    type: EdmType.String,
                    property: 'tipoId/contenido'
                });

                aCols.push({
                    label: 'Pertenece Agrupador',
                    type: EdmType.String,
                    property: 'bPerteneceAgrupador'
                });
                
                aCols.push({
                    label: 'Cantidad RM',
                    property: 'cantAsocRM',
                    type: EdmType.Number
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    property: 'usuarioRegistro',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            },

            createColumnConfigStepReason: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Tipo',
                    type: EdmType.String,
                    property: 'tipoId/contenido'
                });

                aCols.push({
                    label: 'Indicador',
                    type: EdmType.Boolean,
                    property: 'indicador',
                    trueValue: "SI",
                    falseValue: "NO"
                });

                aCols.push({
                    label: 'Estado',
                    type: EdmType.String,
                    property: 'estadoId/contenido'
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    property: 'usuarioRegistro',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            }, 
            createColumnConfigReason: function () {
                var aCols = [];

                aCols.push({
                    label: 'Codigo',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Abreviatura',
                    type: EdmType.String,
                    property: 'abreviatura'
                });

                aCols.push({
                    label: 'Descripcion',
                    type: EdmType.String,
                    property: 'descripcion'
                });

                aCols.push({
                    label: 'Usuario Realizado',
                    property: 'usuarioRegistro',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Fecha Realizado',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                return aCols;
            },

            createColumnConfigRMA: function () {
                var aCols = [];

                aCols.push({
                    label: 'Código MD',
                    property: 'mdId/codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Registro de Manufactura',
                    type: EdmType.String,
                    property: 'mdId/descripcion'
                });

                aCols.push({
                    label: 'Nivel',
                    type: EdmType.String,
                    property: 'mdId/nivelTxt'
                });

                // aCols.push({
                //     label: 'Artículo',
                //     type: EdmType.String,
                //     property: 'indicador'
                // });

                aCols.push({
                    label: 'Estado',
                    type: EdmType.String,
                    property: 'mdId/estadoIdRmd/contenido'
                });

                return aCols;
            },

            createColumnConfigRMAUtensilio: function () {
                var aCols = [];

                aCols.push({
                    label: 'Código MD',
                    property: 'mdId/codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Registro de Manufactura',
                    type: EdmType.String,
                    property: 'mdId/descripcion'
                });

                aCols.push({
                    label: 'Nivel',
                    type: EdmType.String,
                    property: 'mdId/nivelTxt'
                });

                // aCols.push({
                //     label: 'Artículo',
                //     type: EdmType.String,
                //     property: 'indicador'
                // });

                aCols.push({
                    label: 'Estado',
                    type: EdmType.String,
                    property: 'mdId/estadoIdRmd/contenido'
                });

                return aCols;
            },

            loadList: function () {
                var oList = sap.ui.core.Fragment.byId("frgConfiguration", "tblStructure").getBinding('items');

                oList.requestContexts(0, Infinity).then(function (aContexts) {
                    var data = [];

                    aContexts.forEach(function (oContext) {
                        var obj = oContext.getObject();
                        data.push(obj);
                    });

                });
            },
            onChangeEtiqueta: function (oEvent) {
                let that = this;
                // if (oEvent.getParameters().itemPressed) {
                //     let sPath = oEvent.getSource().getSelectedItem().getBindingContext("localModel").getPath();
                //     oDataService.onGetDataGeneral(this.mainModelv2, sPath.slice(1)).then(oResult => {
                //         that.localModel.getData().newPaso.estructuraId_estructuraId = oResult.estructuraId_estructuraId;
                //         that.localModel.refresh(true);
                //     });
                // }
            },
            onChangeEstructura: async function (oEvent, estructuraId) {
                let that = this;
                let oCodigoSelected = "";
                if (oEvent) {
                    oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("key");
                } else {
                    oCodigoSelected = estructuraId;
                }
                let aFilter = [];
                aFilter.push(new Filter("activo", 'EQ', true));
                aFilter.push(new Filter("estructuraId_estructuraId", 'EQ', oCodigoSelected));
                let oResponse = await oDataService.onGetDataGeneralFilters(this.mainModelv2, "ETIQUETA", aFilter);
                this.localModel.setProperty("/aListaEtiquetas", oResponse.results);
            },
            onChangingStepDataType: function (oEvent) {
                console.log("changed!");
                // let that = this;
                let aCamposIds = ["idInputStepInitialValue", "idInputStepFinalValue", "idInputStepMarginValue", "idInputStepPrecisionValue"];
                if (oEvent.getParameters().itemPressed) {
                    switch (oEvent.getSource().getSelectedItem().getAdditionalText()) {
                        case "TDD06":
                            for (let i = 0; aCamposIds.length > i; i++) {
                                if (i === 3) {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(4);
                                } else {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                }
                                this.localModel.setProperty("/editableRango", false);
                                this.localModel.setProperty("/editableDecimales", true);
                            }
                            break;
                        case "TDD02":
                            for (let i = 0; aCamposIds.length > i; i++) {
                                if (i === 3) {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(4);
                                } else {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                }
                                this.localModel.setProperty("/editableRango", false);
                                this.localModel.setProperty("/editableDecimales", true);
                            }
                            break;
                        case "TDD12":
                            for (let i = 0; aCamposIds.length > i; i++) {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                if (i === 3) sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(4);
                                this.localModel.setProperty("/editableRango", true);
                                this.localModel.setProperty("/editableDecimales", true);
                            }
                            break;
                      // add logic for case TDD16
                            case "TDD16":
                                sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModelo").setBusy(true);
                                setTimeout(()=>{ 
                                    sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModelo").setBusy(false)
                                    sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModelo").setEnabled(true)
                                }, 1000);
                            break;
                        default:
                            for (let i = 0; aCamposIds.length > i; i++) {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                if (i === 3) sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(0);
                                this.localModel.setProperty("/editableRango", false);
                                this.localModel.setProperty("/editableDecimales", false);
                            }
                    }

                }
            },
      
            
            onChangingStepDataTypeEdit: function (oEvent, sTipoDato) {
                console.log("changed!");
                let aCamposIds = ["idInputStepInitialValueEdit", "idInputStepFinalValueEdit", "idInputStepMarginValueEdit", "idInputStepPrecisionValueEdit"];
                if(!sTipoDato){
                    if (oEvent.getParameters().itemPressed) {
                        switch (oEvent.getSource().getSelectedItem().getAdditionalText()) {
                            case "TDD06":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableRango", false);
                                    this.localModel.setProperty("/editableDecimales", true);
                                }
                                break;
                            case "TDD02":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableRango", false);
                                    this.localModel.setProperty("/editableDecimales", true);
                                }
                                break;
                            case "TDD12":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                                    this.localModel.setProperty("/editableRango", true);
                                    this.localModel.setProperty("/editableDecimales", true);
                                }
                                break;
                                case "TDD16":
                                    // for (let i = 0; aCamposIds.length > i; i++) {
                                        
                                        sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModeloEdit").setBusy(true);
                                        
                                        setTimeout(()=>{ 
                                            sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModeloEdit").setBusy(false)
                                            sap.ui.core.Fragment.byId("frgAddPaso", "idCmbxClvModeloEdit").setEnabled(true)
                                        }, 1000);
                                        // oThat._getDataClaveModelo();
                                        // if (i === 3) sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(4);
                                        // this.localModel.setProperty("/editableRango", true);
                                        // this.localModel.setProperty("/editableDecimales", true);
                                    // }
                                break;
                            default:
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                                    this.localModel.setProperty("/editableRango", false);
                                    this.localModel.setProperty("/editableDecimales", false);
                                    sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(null);
                                }
                        }
                    }
                } else {
                    if(sTipoDato === sTipoDatoNumero) { //TDD06
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableRango", false);
                            this.localModel.setProperty("/editableDecimales", true);
                        }
                    } else if(sTipoDato === sTipoDatoCantidad) { //TDD02
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableRango", false);
                            this.localModel.setProperty("/editableDecimales", true);
                        }
                    } else if(sTipoDato === sTipoDatoRango) {
                        for (let i = 0; aCamposIds.length > i; i++) { //TDD12
                            sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(true);
                            this.localModel.setProperty("/editableRango", true);
                            this.localModel.setProperty("/editableDecimales", true);
                        }
                    } else {
                        for (let i = 0; aCamposIds.length > i; i++) {
                            sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setEnabled(false);
                            this.localModel.setProperty("/editableRango", false);
                            this.localModel.setProperty("/editableDecimales", false);
                            sap.ui.core.Fragment.byId("frgAddPaso", aCamposIds[i]).setValue(null);
                        }
                    }
                }
            },

            onAddEstructura: function (editar, lineaSeleccionada) {
                if (!this.oAddEstructura) {
                    this.oAddEstructura = sap.ui.xmlfragment("frgAddEstructura",
                        rootPath + ".view.fragment.configuration.new.NewStructure",
                        this
                    );
                    this.getView().addDependent(this.oAddEstructura);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        sAdditionalText = oResult.etapa;
                        this.localModel.setProperty("/editEstructura", oResult);
                    }).catch(oError => {
                        MessageBox.error("Hubo un error");
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddEstructura", "dlgStructure");
                        this.localModel.setProperty("/editar", 1);
                    });
                } else {

                    this.localModel.setProperty("/newEstructura", this.returnExampleModel("Estructura"));
                    this.localModel.setProperty("/editar", 0);
                }
                this.oAddEstructura.open();
            },

            onAddEtiqueta: function (editar, lineaSeleccionada) {
                if (!this.oAddEtiqueta) {
                    this.oAddEtiqueta = sap.ui.xmlfragment(
                        "frgAddEtiqueta",
                        rootPath + ".view.fragment.configuration.new.NewLabel",
                        this
                    );
                    this.getView().addDependent(this.oAddEtiqueta);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        this.localModel.setProperty("/editEtiqueta", oResult);
                    }).catch(oError => {
                        MessageBox.error("Hubo un error");
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddEtiqueta", "dlgLabel");
                        this.localModel.setProperty("/editar", 1);
                    });
                } else {

                    this.localModel.setProperty("/newEtiqueta", this.returnExampleModel("Etiqueta"));
                    this.localModel.setProperty("/editar", 0);
                }
                this.oAddEtiqueta.open();
            },

            onAddPaso: function (editar, lineaSeleccionada) {
                if (!this.oAddPaso) {
                    this.oAddPaso = sap.ui.xmlfragment(
                        "frgAddPaso",
                        rootPath + ".view.fragment.configuration.new.NewStep",
                        this
                    );
                    this.getView().addDependent(this.oAddPaso);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        this.onChangingStepDataTypeEdit({}, oResult.tipoDatoId_iMaestraId);
                        this.localModel.setProperty("/editPaso", oResult);
                        this.onChangeEstructura(null, oResult.estructuraId_estructuraId);
                    }).catch(oError => {
                        MessageBox.error("Hubo un error");
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddPaso", "dlgStep");
                        this.localModel.setProperty("/editar", 1);
                    });

                } else {

                    this.localModel.setProperty("/newPaso", this.returnExampleModel("Paso"));
                    this.localModel.setProperty("/editar", 0);
                }
                this.oAddPaso.open();
            },

            onAddReason: function (editar, lineaSeleccionada) {
                if (!this.oAddReason) {
                    this.oAddReason = sap.ui.xmlfragment(
                        "frgAddReason",
                        rootPath + ".view.fragment.configuration.new.NewReason",
                        this
                    );
                    this.getView().addDependent(this.oAddReason);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        this.localModel.setProperty("/editMotivo", oResult);
                    }).catch(oError => {
                        MessageBox.error("Hubo un error");
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddReason", "dlgReason");
                        this.localModel.setProperty("/editar", 1);
                    });

                } else {

                    this.localModel.setProperty("/newMotivo", this.returnExampleModel("Motivo"));
                    this.localModel.setProperty("/editar", 0);
                }

                this.oAddReason.open();
            },

            onAddEquipo: function (editar, lineaSeleccionada) {
                if (!this.oAddEquipo) {
                    this.oAddEquipo = sap.ui.xmlfragment(
                        "frgAddEquipo",
                        rootPath + ".view.fragment.configuration.new.NewEquipment",
                        this
                    );
                    this.getView().addDependent(this.oAddEquipo);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        this.localModel.setProperty("/editUtensilio", oResult);
                    }).catch(oError => {
                        MessageBox.error("Hubo un error");
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddEquipo", "dlgEquipment");
                        this.localModel.setProperty("/editar", 1);
                    });

                } else {

                    this.localModel.setProperty("/newUtensilio", this.returnExampleModel("Utensilio"));
                    this.localModel.setProperty("/editar", 0);
                }

                this.oAddEquipo.open();
            },

            onAddStepReason: function (editar, lineaSeleccionada) {
                if (!this.oAddStepReason) {
                    this.oAddStepReason = sap.ui.xmlfragment(
                        "frgAddStepReason",
                        rootPath + ".view.fragment.configuration.new.NewStepReason",
                        this
                    );
                    this.getView().addDependent(this.oAddStepReason);
                }

                if (editar === 1) {
                    sap.ui.core.BusyIndicator.show();
                    oDataService.onGetDataGeneral(this.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                        this.localModel.setProperty("/editMotivoLapso", oResult);
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        var idDialogo = sap.ui.core.Fragment.byId("frgAddStepReason", "dlgStepReason");
                        this.localModel.setProperty("/editar", 1);
                    });

                } else {
                    this.localModel.setProperty("/newMotivoLapso", this.returnExampleModel("MotivoLapso"));
                    this.localModel.setProperty("/editar", 0);
                }

                this.oAddStepReason.open();
            },

            onEditarEstructura: function (oEvent) {
                var lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var editar = 1;
                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    if (!oResult) {
                        this.onAddEstructura(editar, lineaSeleccionada);
                    } else {
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("errorOnEditingDataWithDependencies"));
                    }
                })
            },

            onEditarEtiqueta: function (oEvent) {
                var lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var editar = 1;
                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    if (!oResult) {
                        this.onAddEtiqueta(editar, lineaSeleccionada);
                    } else {
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("errorOnEditingDataWithDependencies"));
                    }
                })
            },

            onEditarPasos: function (oEvent) {
                //let oPaso = oEvent.getSource().getBindingContext("localModel").getObject();
                let oPaso = oEvent.getSource().getBindingContext("mainModelv2").getObject();
                var lineaSeleccionada = "/PASO('" + oPaso.pasoId + "')";
                var editar = 1;

                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    if (!oResult) {
                        this.onAddPaso(editar, lineaSeleccionada);
                        this.localModel.setProperty("/oEditableNoOP", true);
                    } else {
                        this.onAddPaso(editar, lineaSeleccionada);
                        this.localModel.setProperty("/oEditableNoOP", false);
                    }
                })
            },

            onEditarMotivo: function (oEvent) {
                var lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var editar = 1;
                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    if (!oResult) {
                        this.onAddReason(editar, lineaSeleccionada);
                    } else {
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("errorOnEditingDataWithDependencies"));
                    }
                })

            },

            onEditarEquipos: function (oEvent) {
                let oUtensilio = oEvent.getSource().getBindingContext("localModel").getObject();
                var lineaSeleccionada = "/UTENSILIO('" + oUtensilio.utensilioId + "')";
                var editar = 1;
                this.onAddEquipo(editar, lineaSeleccionada);
            },

            onEditarMotLapso: function (oEvent) {
                var lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var editar = 1;
                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    if (!oResult) {
                        this.onState(true, "motLapsoDependencies");
                    } else {
                        this.onState(false, "motLapsoDependencies");
                        // MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("errorOnEditingDataWithDependencies"));
                    }
                    this.onAddStepReason(editar, lineaSeleccionada);
                })
            },

            onConfirmEstructura: async function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this;
                let bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataEstructura = this.getView().getModel("localModel").getData().newEstructura;
                let oDataEstructuraEdit = this.getView().getModel("localModel").getData().editEstructura;
                if ((bCreacion && (oDataEstructura == undefined || oDataEstructura["tipoEstructuraId_iMaestraId"] == '' || oDataEstructura["tipoEstructuraId_iMaestraId"] == null)) ||
                    (!bCreacion && (oDataEstructuraEdit == undefined || oDataEstructuraEdit["tipoEstructuraId_iMaestraId"] == '' || oDataEstructuraEdit["tipoEstructuraId_iMaestraId"] == null || oDataEstructuraEdit["estadoId_iMaestraId"] == null || oDataEstructuraEdit["estadoId_iMaestraId"] == ''))) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("sMissingEstructureError"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });
                } else {
                    if (bCreacion) {
                        oDataEstructura.etapa = sAdditionalText;
                        // oDataService.onGetDataGeneral(that.mainModelv2, "ESTRUCTURA").then(oResult => {
                            //Agregar campos de auditoría
                            Object.assign(oDataEstructura, that.returnExampleModel("AuditoriaCreacion"));

                            //Asignar código
                            oDataEstructura["codigo"] = await that.getNextNumber('ESTRUCTURA_CODIGO');

                            //Asignar estructura
                            oDataEstructura["estructuraId"] = util.onGetUUIDV4();

                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataEstructura, "iMaestraId");
                            oDataEstructura["estadoId_iMaestraId"] = sIdStateMaintenanceActive;
                            await oDataService.onSaveDataGeneral(that.mainModelv2, "ESTRUCTURA", oDataEstructura);
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).then(oResult => {
                        //     MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).catch(oError => {
                        //     MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                        //         icon: MessageBox.Icon.ERROR,
                        //         title: "Error"
                        //     });
                        // }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.oAddEstructura.close();
                            that.mainModelv2.refresh();
                        // });
                    } else {
                        oDataEstructuraEdit.etapa = sAdditionalText;
                        //Agregar auditoría
                        Object.assign(oDataEstructuraEdit, that.returnExampleModel("AuditoriaCreacion"));
                        //Formatear campos maestros a números
                        that.getFormattedModelToInt(oDataEstructuraEdit, "iMaestraId");
                        //Crear key 
                        let sPath = that._createKey("ESTRUCTURA", oDataEstructuraEdit["estructuraId"]);

                        oDataService.onUpdateData(that.mainModelv2, sPath, oDataEstructuraEdit).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                        }).catch(oError => {
                            MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                        }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.mainModelv2.refresh();
                            that.oAddEstructura.close();
                        });
                    }
                    sAdditionalText = "";
                }
            },

            onConfirmEtiqueta: async function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this;
                var bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataEtiqueta = this.getView().getModel("localModel").getData().newEtiqueta;
                let oDataEtiquetaEdit = this.getView().getModel("localModel").getData().editEtiqueta;
                if ((bCreacion && (oDataEtiqueta == undefined || oDataEtiqueta["descripcion"] == '' || oDataEtiqueta["descripcion"] == null || oDataEtiqueta["estructuraId_estructuraId"] == '' || oDataEtiqueta["estructuraId_estructuraId"] == null)) ||
                    (!bCreacion && (oDataEtiquetaEdit == undefined || oDataEtiquetaEdit["descripcion"] == '' || oDataEtiquetaEdit["descripcion"] == null || oDataEtiquetaEdit["estructuraId_estructuraId"] == '' || oDataEtiquetaEdit["estructuraId_estructuraId"] == null || oDataEtiquetaEdit["estadoId_iMaestraId"] == null || oDataEtiquetaEdit["estadoId_iMaestraId"] == ''))) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("sMissingEstructureError"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });
                } else {
                    if (bCreacion) {
                        // oDataService.onGetDataGeneral(that.mainModelv2, "ETIQUETA").then(oResult => {
                            //Agregar campos de auditoría
                            Object.assign(oDataEtiqueta, that.returnExampleModel("AuditoriaCreacion"));
    
                            //Asignar código
                            oDataEtiqueta["codigo"] = await that.getNextNumber('ETIQUETA_CODIGO');
    
                            //Asignar estructura
                            oDataEtiqueta["etiquetaId"] = util.onGetUUIDV4();
                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataEtiqueta, "iMaestraId");
                            oDataEtiqueta["estadoId_iMaestraId"] = sIdStateMaintenanceActive;
                            await oDataService.onSaveDataGeneral(that.mainModelv2, "ETIQUETA", oDataEtiqueta);
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).then(oResult => {
                        //     MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).catch(oError => {
                        //     MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                        //         icon: MessageBox.Icon.ERROR,
                        //         title: "Error"
                        //     });
                        // }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.oAddEtiqueta.close();
                            that.mainModelv2.refresh();
                        // });
                    } else {
                        //Agregar auditoría
                        Object.assign(oDataEtiquetaEdit, that.returnExampleModel("AuditoriaCreacion"));
                        //Formatear campos maestros a números
                        that.getFormattedModelToInt(oDataEtiquetaEdit, "iMaestraId");
                        //Crear key 
                        let sPath = that._createKey("ETIQUETA", oDataEtiquetaEdit["etiquetaId"]);
    
                        oDataService.onUpdateData(that.mainModelv2, sPath, oDataEtiquetaEdit).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                        }).catch(oError => {
                            MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                        }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.mainModelv2.refresh();
                            that.oAddEtiqueta.close();
                        });
                    }
                }
            },

            onValidarPaso: function (aItems) {
                let bEsVacioRango = false,
                    bActivarValidacion = false;

                /* aItems.forEach((item, indice) => {
                    if (indice === 6 && aItems[5].getFields()[0].getSelectedItem().getAdditionalText() === "TDD06") {
                        bEsVacioRango = item.getFields()[0].getValue() === "";
                        bEsVacioRango = item.getFields()[1].getValue() === "";
                    }
                }); */

                if (bEsVacioRango) {
                    bActivarValidacion = true;
                    item.getFields()[0].setValueState("error");
                    item.getFields()[1].setValueState("error");
                }

                return bActivarValidacion;
            },

            onConfirmPaso:async function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this
                var bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataPaso = this.getView().getModel("localModel").getData().newPaso;
                let oDataPasoEdit = this.getView().getModel("localModel").getData().editPaso;
                let oEditableRango = this.getView().getModel("localModel").getProperty("/editableRango");
                let oEditableDecimales = this.getView().getModel("localModel").getProperty("/editableDecimales");
                //validación de campo clvModelo
                if (bCreacion){
                    if(oDataPaso["tipoDatoId_iMaestraId"]!=sTipoDatoNotificacion){
                        oDataPaso["clvModelo"] = null;
                        oDataPaso["automatico"] = false;
                    } else {
                        if (oDataPaso["clvModelo"] === "SETPOST" || oDataPaso["clvModelo"] === "SETPRE") {
                            oDataPaso["automatico"] = true;
                        } else {
                            oDataPaso["automatico"] = false;
                        }
                    }  
                }
                else{
                    if(oDataPasoEdit["tipoDatoId_iMaestraId"]!=sTipoDatoNotificacion){
                        oDataPasoEdit["clvModelo"] = null;
                        oDataPasoEdit["automatico"] = false;
                    } else {
                        if (oDataPasoEdit["clvModelo"] === "SETPOST" || oDataPasoEdit["clvModelo"] === "SETPRE") {
                            oDataPasoEdit["automatico"] = true;
                        } else {
                            oDataPasoEdit["automatico"] = false;
                        }
                    }
                }

                if ((bCreacion && (oDataPaso == undefined || oDataPaso["descripcion"] == '' || oDataPaso["estructuraId_estructuraId"] == '')) ||
                    (!bCreacion && (oDataPasoEdit == undefined || oDataPasoEdit["estadoId_iMaestraId"] == '' || oDataPasoEdit["estadoId_iMaestraId"] == null))) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("sMissingDescTypeEstructureError"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });

                } else {
                    var flagRango = true;
                    var flagDecimales = true;
                    if (bCreacion) {
                        if(oEditableRango) {
                            if(oDataPaso.valorInicial === "" || oDataPaso.valorInicial === undefined || oDataPaso.valorFinal === undefined || oDataPaso.valorFinal === "" || oDataPaso.margen === "" || oDataPaso.margen === undefined || oDataPaso.decimales === "" || oDataPaso.decimales === undefined) {
                                flagRango = false;
                            }
                        }
                        if(oEditableDecimales) {
                            if(oDataPaso.decimales === "" || oDataPaso.decimales === undefined) {
                                flagDecimales = false;
                            }
                        }
                    } else {
                        if(oEditableRango) {
                            if(oDataPasoEdit.valorInicial === null || oDataPasoEdit.valorInicial === "" || oDataPasoEdit.valorInicial === undefined || oDataPasoEdit.valorFinal === null || oDataPasoEdit.valorFinal === undefined || oDataPasoEdit.valorFinal === "" || oDataPasoEdit.margen === null || oDataPasoEdit.margen === "" || oDataPasoEdit.margen === undefined || oDataPasoEdit.decimales === null || oDataPasoEdit.decimales === "" || oDataPasoEdit.decimales === undefined) {
                                flagRango = false;
                            }
                        }
                        if(oEditableDecimales) {
                            if(oDataPasoEdit.decimales === null || oDataPasoEdit.decimales === "" || oDataPasoEdit.decimales === undefined) {
                                flagDecimales = false;
                            }
                        }
                    }
                    
                    if(flagRango && flagDecimales){
                        if (bCreacion) {
                            // oDataService.onGetDataGeneral(that.mainModelv2, "PASO").then(oResult => {
                            // Cuando no se selecciona un tipo de dato, se le pone por defecto el tipo de dato Sin Tipo de dato.
                            if (oDataPaso.tipoDatoId_iMaestraId === "" || !oDataPaso.tipoDatoId_iMaestraId) {
                                oDataPaso.tipoDatoId_iMaestraId = sTipoDatoSinTipoDato;
                            }
                            //Agregar campos de auditoría
                            Object.assign(oDataPaso, that.returnExampleModel("AuditoriaCreacion"));

                            //Asignar código
                            oDataPaso["codigo"] = await that.getNextNumber('PASO_CODIGO');

                            //Asignar estructura
                            oDataPaso["pasoId"] = util.onGetUUIDV4();

                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataPaso, "iMaestraId");

                            if (oDataPaso.etiquetaId_etiquetaId === "") {
                                oDataPaso.etiquetaId_etiquetaId = null;
                            }

                            if (oDataPaso.tipoLapsoId_motivoLapsoId === "") {
                                oDataPaso.tipoLapsoId_motivoLapsoId = null;
                            }

                            oDataPaso.estadoId_iMaestraId = sIdStateMaintenanceActive;

                            delete oDataPaso.fechaActualiza;
                            delete oDataPaso.usuarioActualiza;

                            let aFilters = [];
                            aFilters.push(new Filter("tolower(descripcion)", FilterOperator.EQ, "'" + oDataPaso.descripcion.toLowerCase().replace("'","''") + "'"));
                            aFilters.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, oDataPaso.estructuraId_estructuraId));
                            aFilters.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, oDataPaso.etiquetaId_etiquetaId));
                            let aPaso = await oDataService.onGetDataGeneralFilters(that.mainModelv2, "PASO", aFilters);
                            if (aPaso.results.length > 0) {
                                MessageBox.confirm(that.getView().getModel("i18n").getResourceBundle().getText("sMessageStepRepeat"), {
                                    actions: ["Si", "No"],
                                    emphasizedAction: "Si",
                                    onClose:async function (sAction) {
                                        if (sAction === "Si") {
                                            await oDataService.onSaveDataGeneral(that.getOwnerComponent().getModel("mainModelv2"), "PASO", oDataPaso);
                                            MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequestCodigo")+" "+oDataPaso["codigo"]);
                                            that.onGetPasoUtensilio();
                                            sap.ui.core.BusyIndicator.hide();
                                            that.oAddPaso.close();
                                            that.mainModelv2.refresh();
                                        } else {
                                            sap.ui.core.BusyIndicator.hide();
                                            return false;
                                        }
                                    }
                                });
                            } else {
                                await oDataService.onSaveDataGeneral(that.getOwnerComponent().getModel("mainModelv2"), "PASO", oDataPaso);
                                MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequestCodigo")+" "+oDataPaso["codigo"]);
                                that.onGetPasoUtensilio();
                                sap.ui.core.BusyIndicator.hide();
                                that.oAddPaso.close();
                                that.mainModelv2.refresh();
                            }
                        } else {
                            sap.ui.core.BusyIndicator.show();
                            let sExpand = "mdId,pasoId"
                            let aFilters = [];
                            aFilters.push(new Filter("pasoId_pasoId", "EQ", oDataPasoEdit.pasoId));
                            // aFilters.push(new Filter("mdId_mdId", "NE", oMDSeleccionada.getData().mdId));
                            let MDPasoResponse = await oDataService.onGetDataGeneralFiltersExpand(this.mainModelv2, "MD_ES_PASO", aFilters, sExpand);
                            MDPasoResponse.results = MDPasoResponse.results.filter(itm => itm.mdId !== null);
                            let aListMDPaso = MDPasoResponse.results.filter(item => item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido);

                            // Para Procesos Menores
                            let aFiltersPM = [];
                            aFiltersPM.push(new Filter("pasoHijoId_pasoId", "EQ", oDataPasoEdit.pasoId));
                            // aFilters.push(new Filter("mdId_mdId", "NE", oMDSeleccionada.getData().mdId));
                            let MDPasoResponsePM = await oDataService.onGetDataGeneralFiltersExpand(this.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFiltersPM, sExpand);
                            MDPasoResponsePM.results = MDPasoResponsePM.results.filter(itm => itm.mdId !== null);
                            let aListMDPasoPM = MDPasoResponsePM.results.filter(item => item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido);

                            let update;
                            let mensajeConfirm = "";
                            if (aListMDPaso.length > 0) {
                                if (!aListMDPaso[0].pasoId.tipoLapsoId_motivoLapsoId) {
                                    if (oDataPasoEdit.tipoLapsoId_motivoLapsoId) {
                                        mensajeConfirm = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage59");
                                        update = true;
                                    } else {
                                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage58Mantenimiento"));
                                        update = false;
                                        sap.ui.core.BusyIndicator.hide();
                                        return false;
                                    }
                                } else if (aListMDPaso[0].pasoId.tipoLapsoId_motivoLapsoId !== oDataPasoEdit.tipoLapsoId_motivoLapsoId) {
                                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessageLapsoNoModif"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                } else {
                                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage58Mantenimiento"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                }
                            } else {
                                mensajeConfirm = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage59");
                                update = true;
                            }

                            if (aListMDPasoPM.length > 0) {
                                if (!aListMDPasoPM[0].pasoId.tipoLapsoId_motivoLapsoId) {
                                    if (oDataPasoEdit.tipoLapsoId_motivoLapsoId) {
                                        mensajeConfirm = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage59");
                                        update = true;
                                    } else {
                                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage58Mantenimiento"));
                                        update = false;
                                        sap.ui.core.BusyIndicator.hide();
                                        return false;
                                    }
                                } else if (aListMDPasoPM[0].pasoId.tipoLapsoId_motivoLapsoId !== oDataPasoEdit.tipoLapsoId_motivoLapsoId) {
                                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessageLapsoNoModif"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                } else {
                                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage58Mantenimiento"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                }
                            } else {
                                mensajeConfirm = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage59");
                                update = true;
                            }

                            // Para validar de los RMD Autorizados y los lapsos no modificables - FIN.
                            MessageBox.warning(mensajeConfirm, {
                                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: async function (sAction) {
                                    if (sAction === "OK") {
                                        if (update) {
                                            // Cuando no se selecciona un tipo de dato, se le pone por defecto el tipo de dato Sin Tipo de dato.
                                            if (oDataPasoEdit.tipoDatoId_iMaestraId === "" || !oDataPasoEdit.tipoDatoId_iMaestraId) {
                                                oDataPasoEdit.tipoDatoId_iMaestraId = sTipoDatoSinTipoDato;
                                            }
                                            oDataPasoEdit.decimales = oDataPasoEdit.decimales === "" ? null : oDataPasoEdit.decimales;
                                            oDataPasoEdit.margen = oDataPasoEdit.margen === "" ? null : oDataPasoEdit.margen;
                                            oDataPasoEdit.valorInicial = oDataPasoEdit.valorInicial === "" ? null : oDataPasoEdit.valorInicial;
                                            oDataPasoEdit.valorFinal = oDataPasoEdit.valorFinal === "" ? null : oDataPasoEdit.valorFinal    ;
                                            //Agregar auditoría
                                            Object.assign(oDataPasoEdit, that.returnExampleModel("AuditoriaCreacion"));
                                            //Formatear campos maestros a números
                                            that.getFormattedModelToInt(oDataPasoEdit, "iMaestraId");

                                            if (oDataPasoEdit.etiquetaId_etiquetaId === "") {
                                                oDataPasoEdit.etiquetaId_etiquetaId = null;
                                            }

                                            if (oDataPasoEdit.tipoLapsoId_motivoLapsoId === "") {
                                                oDataPasoEdit.tipoLapsoId_motivoLapsoId = null;
                                            }
                                            //Crear key 
                                            let sPath = that._createKey("PASO", oDataPasoEdit["pasoId"]);

                                            let aFilters = [];
                                            aFilters.push(new Filter("tolower(descripcion)", FilterOperator.EQ, "'" + oDataPasoEdit.descripcion.toLowerCase().replace("'","''") + "'"));
                                            aFilters.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, oDataPasoEdit.estructuraId_estructuraId));
                                            aFilters.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, oDataPasoEdit.etiquetaId_etiquetaId));
                                            aFilters.push(new Filter("pasoId", FilterOperator.NE, oDataPasoEdit.pasoId));
                                            let aPaso = await oDataService.onGetDataGeneralFilters(that.mainModelv2, "PASO", aFilters);
                                            if (aPaso.results.length > 0) {
                                                MessageBox.confirm(that.getView().getModel("i18n").getResourceBundle().getText("sMessageStepRepeat"), {
                                                    actions: ["Si", "No"],
                                                    emphasizedAction: "Si",
                                                    onClose:async function (sAction) {
                                                        if (sAction === "Si") {
                                                            await oDataService.onUpdateData(that.mainModelv2, sPath, oDataPasoEdit).then(oResult => {
                                                                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                                                                that.onGetPasoUtensilio();
                                                            }).catch(oError => {
                                                                MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                                                    icon: MessageBox.Icon.ERROR,
                                                                    title: "Error"
                                                                });
                                                            }).finally(oFinal => {
                                                                sap.ui.core.BusyIndicator.hide();
                                                                that.mainModelv2.refresh();
                                                                that.oAddPaso.close();
                                                            });
                                                        } else {
                                                            sap.ui.core.BusyIndicator.hide();
                                                            return false;
                                                        }
                                                    }
                                                });
                                            } else {
                                                await oDataService.onUpdateData(that.mainModelv2, sPath, oDataPasoEdit).then(oResult => {
                                                    MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                                                    that.onGetPasoUtensilio();
                                                }).catch(oError => {
                                                    MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                                        icon: MessageBox.Icon.ERROR,
                                                        title: "Error"
                                                    });
                                                }).finally(oFinal => {
                                                    sap.ui.core.BusyIndicator.hide();
                                                    that.mainModelv2.refresh();
                                                    that.oAddPaso.close();
                                                });
                                            }
                                        }
                                    }
                                },
                            });
                        }
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("sMissingPasoRango"), {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                }
            },

            onConfirmReason: async function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this
                var bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataMotivo = this.getView().getModel("localModel").getData().newMotivo;
                let oDataMotivoEdit = this.getView().getModel("localModel").getData().editMotivo;

                if ((bCreacion && (oDataMotivo == undefined || oDataMotivo["abreviatura"] == '' || oDataMotivo["descripcion"] == '')) ||
                    (!bCreacion && (oDataMotivoEdit == undefined || oDataMotivoEdit["abreviatura"] == '' || oDataMotivoEdit["abreviatura"] == null || oDataMotivoEdit["descripcion"] == '' || oDataMotivoEdit["descripcion"] == null || oDataMotivoEdit["estadoId_iMaestraId"] == '' || oDataMotivoEdit["estadoId_iMaestraId"] == null))) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("msgObligatoriosCampos"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });

                } else {
                    if (bCreacion) {
                        // oDataService.onGetDataGeneral(that.mainModelv2, "MOTIVO").then(oResult => {
                            //Agregar campos de auditoría
                            Object.assign(oDataMotivo, that.returnExampleModel("AuditoriaCreacion"));

                            //Asignar código
                            oDataMotivo["codigo"] = await that.getNextNumber('MOTIVO_CODIGO');

                            //Asignar estructura
                            oDataMotivo["motivoId"] = util.onGetUUIDV4();

                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataMotivo, "iMaestraId");
                            oDataMotivo.estadoId_iMaestraId = sIdStateMaintenanceActive;
                            
                            await oDataService.onSaveDataGeneral(that.getOwnerComponent().getModel("mainModelv2"), "MOTIVO", oDataMotivo);
                        // }).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).catch(oError => {
                        //     MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                        //         icon: MessageBox.Icon.ERROR,
                        //         title: "Error"
                        //     });
                        // }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.oAddReason.close();
                            that.mainModelv2.refresh();
                        // });
                    } else {
                        //Agregar auditoría
                        Object.assign(oDataMotivoEdit, that.returnExampleModel("AuditoriaCreacion"));
                        //Formatear campos maestros a números
                        that.getFormattedModelToInt(oDataMotivoEdit, "iMaestraId");
                        //Crear key 
                        let sPath = that._createKey("MOTIVO", oDataMotivoEdit["motivoId"]);

                        oDataService.onUpdateData(that.mainModelv2, sPath, oDataMotivoEdit).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                        }).catch(oError => {
                            MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                        }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.mainModelv2.refresh();
                            that.oAddReason.close();
                        });
                    }
                }

            },

            onConfirmEquipo: function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this
                var bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataUtensilio = this.getView().getModel("localModel").getData().newUtensilio;
                let oDataUtensilioEdit = this.getView().getModel("localModel").getData().editUtensilio;
                let utencilios = sap.ui.core.Fragment.byId("frgConfiguration", "tblEquipment").getBinding("items");

                if (bCreacion) {
                    if ((!oDataUtensilio.codigo && oDataUtensilio.codigo === '') || (!oDataUtensilio.descripcion && oDataUtensilio.descripcion === '') || (!oDataUtensilio.tipoId_iMaestraId && oDataUtensilio.tipoId_iMaestraId === '')) {
                        MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgObligatoriosCampos"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    oDataService.onGetDataGeneral(that.mainModelv2, "UTENSILIO").then(oResult => {
                        //Agregar campos de auditoría
                        Object.assign(oDataUtensilio, that.returnExampleModel("AuditoriaCreacion"));
                        let bRepetido = that.validateUniqueArray(oDataUtensilio.codigo, "codigo", oResult.results);
                        if (bRepetido) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("sExistsCodeError"), {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });

                        }
                        else {
                            //Asignar estructura
                            oDataUtensilio["utensilioId"] = oDataUtensilio["codigo"];

                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataUtensilio, "iMaestraId");
                            oDataUtensilio.estadoId_iMaestraId = sIdStateMaintenanceActive;

                            return oDataService.onSaveDataGeneral(that.getOwnerComponent().getModel("mainModelv2"), "UTENSILIO", oDataUtensilio);
                        }
                    }).then(oResult => {
                        if (oResult !== undefined)
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                            that.onGetPasoUtensilio();
                    }).catch(oError => {
                        MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        that.oAddEquipo.close();
                        that.mainModelv2.refresh();
                    });
                } else {
                    if ((!oDataUtensilioEdit.codigo && oDataUtensilioEdit.codigo === '') || (!oDataUtensilioEdit.descripcion && oDataUtensilioEdit.descripcion === '') || (!oDataUtensilioEdit.tipoId_iMaestraId && oDataUtensilioEdit.tipoId_iMaestraId === '') || (!oDataUtensilioEdit.estadoId_iMaestraId && oDataUtensilioEdit.estadoId_iMaestraId === '')) {
                        MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgObligatoriosCampos"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    //Agregar auditoría
                    Object.assign(oDataUtensilioEdit, that.returnExampleModel("AuditoriaCreacion"));
                    //Formatear campos maestros a números
                    that.getFormattedModelToInt(oDataUtensilioEdit, "iMaestraId");
                    //Crear key 
                    let sPath = that._createKey("UTENSILIO", oDataUtensilioEdit["utensilioId"]);

                    oDataService.onUpdateData(that.mainModelv2, sPath, oDataUtensilioEdit).then(oResult => {
                        MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                        that.onGetPasoUtensilio();
                    }).catch(oError => {
                        MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }).finally(oFinal => {
                        sap.ui.core.BusyIndicator.hide();
                        that.mainModelv2.refresh();
                        that.oAddEquipo.close();
                    });
                }


            },

            onConfirmStepReason: async function () {
                sap.ui.core.BusyIndicator.show(0);
                var that = this
                var bCreacion = this.getView().getModel("localModel").getData().editar === 0;
                let oDataMotivoLapso = this.getView().getModel("localModel").getData().newMotivoLapso;
                let oDataMotivoLapsoEdit = this.getView().getModel("localModel").getData().editMotivoLapso;
                if ((bCreacion && (oDataMotivoLapso == undefined || oDataMotivoLapso["descripcion"] == '' || oDataMotivoLapso["tipoId_iMaestraId"] == '')) ||
                    (!bCreacion && (oDataMotivoLapsoEdit == undefined || oDataMotivoLapsoEdit["descripcion"] == '' || oDataMotivoLapsoEdit["descripcion"] == null || oDataMotivoLapsoEdit["tipoId_iMaestraId"] == '' || oDataMotivoLapsoEdit["tipoId_iMaestraId"] == null || oDataMotivoLapsoEdit["estadoId_iMaestraId"] == '' || oDataMotivoLapsoEdit["estadoId_iMaestraId"] == null))) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("msgObligatoriosCampos"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });

                }
                else {
                    if (bCreacion) {
                        // oDataService.onGetDataGeneral(that.mainModelv2, "MOTIVO_LAPSO").then(oResult => {
                            //Agregar campos de auditoría
                            Object.assign(oDataMotivoLapso, that.returnExampleModel("AuditoriaCreacion"));

                            //Asignar código
                            oDataMotivoLapso["codigo"] = await that.getNextNumber('MOTIVOLAPSO_CODIGO');

                            //Asignar estructura
                            oDataMotivoLapso["motivoLapsoId"] = util.onGetUUIDV4();
                            oDataMotivoLapso["indicador"] = oDataMotivoLapso.indicador.toString();
                            //Formatear campos maestros a números
                            that.getFormattedModelToInt(oDataMotivoLapso, "iMaestraId");
                            oDataMotivoLapso.estadoId_iMaestraId = sIdStateMaintenanceActive;

                            await oDataService.onSaveDataGeneral(that.getOwnerComponent().getModel("mainModelv2"), "MOTIVO_LAPSO", oDataMotivoLapso);
                        // }).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
                        // }).catch(oError => {
                        //     MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                        //         icon: MessageBox.Icon.ERROR,
                        //         title: "Error"
                        //     });
                        // }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.oAddStepReason.close();
                        // });
                    } else {
                        //Agregar auditoría
                        Object.assign(oDataMotivoLapsoEdit, that.returnExampleModel("AuditoriaCreacion"));
                        //Formatear campos maestros a números
                        that.getFormattedModelToInt(oDataMotivoLapsoEdit, "iMaestraId");
                        //Crear key 
                        let sPath = that._createKey("MOTIVO_LAPSO", oDataMotivoLapsoEdit["motivoLapsoId"]);
                        oDataMotivoLapsoEdit["indicador"] = oDataMotivoLapsoEdit.indicador.toString();
                        oDataService.onUpdateData(that.mainModelv2, sPath, oDataMotivoLapsoEdit).then(oResult => {
                            MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successUpdateRequest"));
                        }).catch(oError => {
                            MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"), {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                        }).finally(oFinal => {
                            sap.ui.core.BusyIndicator.hide();
                            that.oAddStepReason.close();
                            that.mainModelv2.refresh();
                        });
                    }
                }
            },

            onDeleteDataMaestra: function (oEvent) {
                let that = this;
                let lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath(),
                    oDataBody, bDependenciasDetectadas;

                if (lineaSeleccionada.includes("aListaPasos/")) {
                    let oPaso = oEvent.getSource().getBindingContext("localModel").getObject();
                    lineaSeleccionada = "/PASO('" + oPaso.pasoId + "')";
                } else if (lineaSeleccionada.includes("aListaUtensilio/")) {
                    let oUtensilio = oEvent.getSource().getBindingContext("localModel").getObject();
                    lineaSeleccionada = "/UTENSILIO('" + oUtensilio.utensilioId + "')";
                }
                this.onDetectDependencies(lineaSeleccionada).then(oResult => {
                    bDependenciasDetectadas = oResult;
                    if (!bDependenciasDetectadas) {
                        MessageBox.confirm(that.getView().getModel("i18n").getResourceBundle().getText("askForDeletion"), {
                            actions: ["Borrar registro", "Cancelar"],
                            emphasizedAction: "Borrar registro",
                            onClose: function (sAction) {
                                if (sAction === "Borrar registro") {
                                    oDataService.onGetDataGeneral(that.mainModelv2, lineaSeleccionada.slice(1)).then(oResult => {
                                        oDataBody = oResult;
                                        //Borrado lógico
                                        oDataBody["activo"] = false;
                                        return oDataService.onUpdateData(that.mainModelv2, lineaSeleccionada.slice(1), oDataBody);
                                    }).then(oResult => {
                                        MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("successDeleteRequest"));
                                        that.onGetPasoUtensilio();
                                    }).catch(oError => {
                                        MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"));
                                    }).finally(oFinal => {
                                        that.mainModelv2.refresh();
                                    });
                                }
                            }
                        });
                    } else {
                        MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("errorOnDeletingDataWithDependencies"));
                    }
                }).catch(oError => {
                    MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("onRequestError"));
                });

            },

            onDetectDependencies: function (sLinea) {
                let that = this;
                return new Promise(function (resolve, reject) {
                    let aFilters = [new Filter("activo", FilterOperator.EQ, true)];
                    let iRegistros = 0;
                    if (sLinea.includes("UTENSILIO")) {
                        resolve(false);
                    }
                    else if (sLinea.includes("MOTIVO(")) {
                        oDataService.onGetDataGeneral(that.mainModelv2, sLinea.slice(1)).then(oResult => {
                            aFilters.push(new Filter("motivoId_motivoId", FilterOperator.EQ, oResult.motivoId));
                            return oDataService.onGetDataGeneralFilters(that.mainModelv2, "MD", aFilters);
                        }).then(oResult => {
                            iRegistros += oResult.results.length;
                            resolve(iRegistros > 0);
                        }).catch(oError => {
                            reject(oError);
                        });
                    }
                    else if (sLinea.includes("ESTRUCTURA")) {
                        oDataService.onGetDataGeneral(that.mainModelv2, sLinea.slice(1)).then(oResult => {
                            aFilters.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, oResult.estructuraId));
                            return oDataService.onGetDataGeneralFilters(that.mainModelv2, "ETIQUETA", aFilters);
                        }).then(oResult => {
                            iRegistros += oResult.results.length;
                            return oDataService.onGetDataGeneralFilters(that.mainModelv2, "PASO", aFilters);
                        }).then(oResult => {
                            iRegistros += oResult.results.length;
                            resolve(iRegistros > 0);
                        }).catch(oError => {
                            reject(oError);
                        });
                    } else {
                        oDataService.onGetDataGeneral(that.mainModelv2, sLinea.slice(1)).then(async function (oResult) {
                            if (sLinea.includes("ETIQUETA")) {
                                aFilters.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, oResult.etiquetaId));
                                return oDataService.onGetDataGeneralFilters(that.mainModelv2, "PASO", aFilters);
                            } else if (sLinea.includes("PASO")) {
                                aFilters.push(new Filter("pasoId_pasoId", FilterOperator.EQ, oResult.pasoId));
                                let sExpand = "mdId";
                                let aMdPaso = await oDataService.onGetDataGeneralFiltersExpand(that.mainModelv2, "MD_ES_PASO", aFilters, sExpand);
                                let aListMdPaso = aMdPaso.results.filter(itm=>itm.mdId !== null);
                                let oMdpPaso = aListMdPaso.filter(item => item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido);
                                return oMdpPaso;
                            } else if (sLinea.includes("MOTIVO_LAPSO")) {
                                aFilters.push(new Filter("tipoLapsoId_motivoLapsoId", FilterOperator.EQ, oResult.motivoLapsoId));
                                return oDataService.onGetDataGeneralFilters(that.mainModelv2, "PASO", aFilters);
                            }
                        }).then(oResult => {
                            if (oResult.results) {
                                iRegistros += oResult.results.length;
                            } else {
                                iRegistros += oResult.length;
                            }
                            resolve(iRegistros > 0);
                        }).catch(oError => {
                            reject(oError);
                        });
                    };
                });
            },

            onCancelEstructura: function () {
                this.oAddEstructura.close();
            },

            onCancelEtiqueta: function () {
                this.oAddEtiqueta.close();

            },

            onCancelPaso: function () {
                this.oAddPaso.close();
                this.localModel.setProperty("/editableRango", false);
                this.localModel.setProperty("/editableDecimales", false);
                this.localModel.setProperty("/aListaEtiquetas", false);
            },

            onCancelReason: function () {
                this.oAddReason.close();
            },

            onCancelEquipo: function () {
                this.oAddEquipo.close();
            },

            onCancelStepReason: function () {
                this.oAddStepReason.close();
            },

            onOpenRMAUtensilio: function (oEvent) {
                let lineaSeleccionada = oEvent.getSource().getParent().getParent().getBindingContextPath(),
                    that = this;
                let aFilters = [];
                if (!this.oOpenRMAUtensilio) {
                    this.oOpenRMAUtensilio = sap.ui.xmlfragment(
                        "frgOpenRMAUtensilio",
                        rootPath + ".view.fragment.configuration.new.RMAAsociadasUtensilio",
                        this
                    );
                    this.getView().addDependent(this.oOpenRMAUtensilio);
                }
                let oPasoId = oEvent.getSource().getBindingContext("localModel").getObject()
                aFilters = [new Filter("utensilioId_utensilioId", FilterOperator.EQ, oPasoId.utensilioId)];
                sap.ui.core.Fragment.byId("frgOpenRMAUtensilio", "tblRMAutensilio").getBinding("items").filter(aFilters);
                this.oOpenRMAUtensilio.open();
            },

            onCancelOpenRMAUtensilio: function () {
                this.oOpenRMAUtensilio.close();
            },

            // ABRIR RM ASOCIADAS EN CONFIGURACION PASO
            onOpenRMA: async function (oEvent) {
                //let oPasoId = oEvent.getSource().getBindingContext("localModel").getObject();
                let oPasoId = oEvent.getSource().getBindingContext("mainModelv2").getObject();
                if (!this.oOpenRMA) {
                    this.oOpenRMA = sap.ui.xmlfragment(
                        "frgOpenRMA",
                        rootPath + ".view.fragment.configuration.new.RMAsociadas",
                        this
                    );
                    this.getView().addDependent(this.oOpenRMA);
                }

                await this.onObtenerRMAsociados(oPasoId.pasoId);
                this.oOpenRMA.open();
            },

            onCancelOpenRMA: function () {
                this.oOpenRMA.close();
            },

            onObtenerRMAsociados:async function (pasoId) {
                sap.ui.core.BusyIndicator.show(0);
                await Promise.all([oThat.onGetMdEsPasoAsociados(pasoId), oThat.onGetMdEsPasoInsumoPasoAsociados(pasoId)])
                    .then(async function(values) {
                    let aDataPaso = values[0],
                        aDataPasoInsumoPaso = values[1];

                    let oMPasoInsumoPaso = aDataPaso.concat(aDataPasoInsumoPaso);

                    oMPasoInsumoPaso.sort(function (a, b) {
                        return a.mdId.codigo - b.mdId.codigo;
                    });

                    let oModelPasoInsumoPaso = new JSONModel(oMPasoInsumoPaso);
                    oModelPasoInsumoPaso.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelPasoInsumoPaso, "aListPasosAsociados");
                    oThat.getView().getModel("aListPasosAsociados").refresh(true);

                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });
            },

            onGetMdEsPasoAsociados: function (pasoId) {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var aFilters = [];
                    aFilters.push(new Filter("activo", "EQ", true));
                    aFilters.push(new Filter("pasoId_pasoId", "EQ", pasoId));
                    let sExpand = "mdId,mdId/nivelId,mdId/estadoIdRmd";
                    await oDataService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO", aFilters, sExpand).then(function (oListMdPaso) {
                        let aListMdPaso = oListMdPaso.results.filter(itm=>itm.mdId !== null);
                        resolve(aListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsPasoInsumoPasoAsociados: function (pasoId) {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let aFilters = [];
                    aFilters.push(new Filter("activo", "EQ", true));
                    aFilters.push(new Filter("pasoHijoId_pasoId", "EQ", pasoId));
                    let sExpand = "mdId,mdId/nivelId,mdId/estadoIdRmd";
                    await oDataService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilters, sExpand).then(function (oListMdEsPasoInsumoPaso) {
                        let aListMdEsPasoInsumoPaso = oListMdEsPasoInsumoPaso.results.filter(itm=>itm.mdId !== null);
                        resolve(aListMdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGuardarCambios: function () {
                var aviso = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage42");
                var result = this.getView().getModel("i18n").getResourceBundle().getText("txtMessage43");
                this.onWarningBox(aviso, result, "GuardarConfig");
            },

            onCloseConfiguration: function (oEvent) {
                // this.localModel.setProperty("/aFiltro", {});
                this.onRestoreFiltersStructure();
                this.onRestoreFiltersStepReason();
                this.onRestoreFiltersStep();
                this.onRestoreFiltersReason();
                this.onRestoreFiltersLabel();
                this.onRestoreFiltersEquipment();
                oEvent.getSource().getParent().close();
            },
            returnExampleModel: function (sTypeOfModel) {
                let oModel = {}, aFields = [];


                switch (sTypeOfModel) {
                    case "Estructura":
                        aFields = ["descripcion", "numeracion", "tipoEstructuraId_iMaestraId", "etapa", "verificadoPor"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });

                        oModel["numeracion"] = false;
                        oModel["verificadoPor"] = true;
                        break;
                    case "Etiqueta":
                        aFields = ["descripcion", "estructuraId_estructuraId"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });
                        break;
                    case "Paso":
                        aFields = ["descripcion", "estructuraId_estructuraId", "etiquetaId_etiquetaId", "numeracion", "tipoDatoId_iMaestraId",
                            "tipoLapsoId_motivoLapsoId", "tipoCondicionId_iMaestraId"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });
                        oModel["estadoId_iMaestraId"] = 2;
                        oModel["decimales"] = 0;
                        oModel["numeracion"] = false;

                        break;
                    case "Motivo":
                        aFields = ["abreviatura", "descripcion"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });
                        break;
                    case "Utensilio":
                        aFields = ["descripcion", "estadoId_iMaestraId", "tipoId_iMaestraId"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });
                        break;
                    case "MotivoLapso":
                        aFields = ["descripcion", "tipoId_iMaestraId", "estadoId_iMaestraId"];
                        aFields.forEach(field => {
                            oModel[field] = "";
                        });
                        oModel["indicador"] = false;
                        break;
                    case "AuditoriaCreacion":
                        oModel.fechaRegistro = this.getActualFormattedDateTime();
                        oModel.fechaActualiza = this.getActualFormattedDateTime();
                        oModel.activo = true;
                        //Cambiar usuarios en productivo
                        oModel.usuarioRegistro = sUsuarioLocal;
                        oModel.usuarioActualiza = sUsuarioLocal;
                        break;
                }
                return oModel;
            },
            getActualFormattedDateTime: function () {
                return new Date().toISOString();
            },
            getFormattedModelToInt: function (oModel, sValue) {
                for (let x in oModel) {
                    if (x.includes(sValue) && oModel[x] !== null && oModel[x] !== "") {
                        oModel[x] = parseInt(oModel[x]);
                    }

                    if (oModel[x] === "") {
                        oModel[x] = null;
                    }
                }
                return oModel;
            },

            getNextNumber: async function (sTipo) {
                let isNumber = await oDataService.onSaveDataFunctionCorrelativo(oThat.mainModelv2, 'obtenerCodigoCorrelativo', sTipo);
                return isNumber.toString();
            },

            _createKey: function (sEntity, sCode) {
                return "/" + sEntity + "('" + sCode + "')";
            },
            validateUniqueArray: function (id, key, arr) {
                let obj;
                if (arr !== null)
                    obj = arr.find(o => o[key] === id);
                return (obj !== undefined && obj !== null)
            },

            // Funcion para poner false o true a las propiedades de los componentes de la vista Ejem: (visible, enabled) 
            onState: function (bState, modelo) {
                var oModel = new JSONModel({
                    "state": bState
                });
                if (this.getView().getModel(modelo)) {
                    this.getView().getModel(modelo).setProperty("/state", bState);
                } else {
                    this.getView().setModel(oModel, modelo);
                }
                // this.getView().setModel(oModel, modelo);
                this.getView().getModel(modelo).refresh(true);
            },

            onGetAdditionalText: function (oEvent) {
                sAdditionalText = oEvent.getSource().getSelectedItem().getProperty("additionalText");
            },
            
            onSelectEstructura: async function (oEvent) {
                let oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("key");
                let aFilter = [];
                aFilter.push(new Filter("estructuraId_estructuraId", 'EQ', oCodigoSelected))
                let oResponse = await oDataService.onGetDataGeneralFilters(this.mainModelv2, "ETIQUETA", aFilter);
                this.localModel.setProperty("/aListaEtiquetas", oResponse.results);
            },

            onGetPasoUtensilio: async function() {
                let that = this;
                let sExpandPaso = "estructuraId,etiquetaId,estadoId,tipoDatoId,tipoLapsoId,tipoCondicionId";
                let sExpandUtensilio = "estadoId,tipoId";
                // let aListPasosLength = 1000;
                // let skipLine = 1000;
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                
                //let oResultPaso = await oDataService.onGetDataGeneralFiltersExpand(that.mainModelv2, "PASO", aFilter, sExpandPaso);//TEMP
                // if(oResultPaso.results.length === 1000){
                //     while (aListPasosLength === 1000) {
                //         let aListPasoSkipData = await oDataService.onGetDataGeneralFiltersExpandSkip(that.mainModelv2, "PASO", aFilter, sExpandPaso, skipLine);
                //         aListPasosLength = aListPasoSkipData.results.length;
                //         oResultPaso.results = oResultPaso.results.concat(aListPasoSkipData.results);
                //         skipLine = skipLine + 1000;
                //     }
                // }
                
                //this.localModel.setProperty("/aListaPasos", oResultPaso.results);//TEMP
                let oResultUtensilio = await oDataService.onGetDataGeneralFiltersExpand(that.mainModelv2, "UTENSILIO", aFilter, sExpandUtensilio);
                oResultUtensilio.results.forEach(function(oUtensilio){
                    if(oUtensilio.clasificacionId_clasificacionUtensilioId === null) {
                        oUtensilio.bPerteneceAgrupador = 'NO';
                    } else {
                        oUtensilio.bPerteneceAgrupador = 'SI';
                    }
                });
                this.localModel.setProperty("/aListaUtensilio", oResultUtensilio.results);
            },

            onGetClasification: async function () {
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                let aListAgrupadores = await oDataService.onGetDataGeneralFilters(oThat.mainModelv2, "UTENSILIO_CLASIFICACION", aFilter);
                oThat.localModel.setProperty("/aListAgrupadores", aListAgrupadores.results);
                if (!this.oGetClasificacion) {
                    this.oGetClasificacion = sap.ui.xmlfragment("frgGetClasificacion",
                        rootPath + ".view.fragment.configuration.new.ListClasificacion",
                        this
                    );
                    this.getView().addDependent(this.oGetClasificacion);
                }
                this.oGetClasificacion.open();
            },

            onCancelClasificacion: function () {
                this.oGetClasificacion.close();
            },

            onAddClasificacion: function () {
                if (!this.oAddClasificacion) {
                    this.oAddClasificacion = sap.ui.xmlfragment("frgGetClasificacion",
                        rootPath + ".view.fragment.configuration.new.GetClasificacion",
                        this
                    );
                    this.getView().addDependent(this.oAddClasificacion);
                }
                this.oAddClasificacion.open();
            },

            onCancelAddClasificacion: function () {
                this.localModel.setProperty("/newClasificacion", {});
                this.oAddClasificacion.close();
            },

            onConfirmClasificacion: async function () {
                let that = this;
                BusyIndicator.show(0);
                let oContext = this.localModel.getProperty("/newClasificacion");
                let oParam = {
                    usuarioRegistro     : sUsuarioLocal,
                    fechaRegistro       : new Date(),
                    activo              : true,
                    clasificacionUtensilioId : util.onGetUUIDV4(),
                    descripcion         : oContext.descripcion
                }
                await oDataService.onSaveDataGeneral(that.mainModelv2, "UTENSILIO_CLASIFICACION", oParam);
                oContext.utensilioIds.forEach(async function(oId){
                    let oObj = {
                        usuarioActualiza     : sUsuarioLocal,
                        fechaActualiza       : new Date(),
                        clasificacionId_clasificacionUtensilioId : oParam.clasificacionUtensilioId
                    }
                    await oDataService.onUpdateDataGeneral(that.mainModelv2, "UTENSILIO", oObj, oId);
                });
                BusyIndicator.hide();
                this.onCancelAddClasificacion();
                MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("successCreatedRequest"));
            },

            onPressAgrupador: async function (oEvent) {
                BusyIndicator.show(0);
                let oContext = oEvent.getSource().getBindingContext("localModel").getObject();
                this.localModel.setProperty("/agrupadorSeleccionado", oContext);
                if (!this.oAgrupadorUtensilio) {
                    this.oAgrupadorUtensilio = sap.ui.xmlfragment("frgAgrupadorUtensilio",
                        rootPath + ".view.fragment.configuration.new.ListUtensiliosAgrupador",
                        this
                    );
                    this.getView().addDependent(this.oAgrupadorUtensilio);
                }
                let sExpand = "estadoId";
                let aFilters = [];
                aFilters.push(new Filter("clasificacionId_clasificacionUtensilioId", "EQ", oContext.clasificacionUtensilioId));
                let oResponse = await oDataService.onGetDataGeneralFiltersExpand(this.mainModelv2, "UTENSILIO", aFilters, sExpand);
                this.localModel.setProperty("/aListUtensiliosAgrupador", oResponse.results);
                this.oAgrupadorUtensilio.open();
                BusyIndicator.hide();
            },

            onPressAgrupadorMain: async function (oEvent) {
                BusyIndicator.show(0);
                let oContext = oEvent.getSource().getParent().getParent().getBindingContext("localModel").getObject();
                this.localModel.setProperty("/agrupadorSeleccionado", oContext);
                if (!this.oAgrupadorUtensilio) {
                    this.oAgrupadorUtensilio = sap.ui.xmlfragment("frgAgrupadorUtensilio",
                        rootPath + ".view.fragment.configuration.new.ListUtensiliosAgrupador",
                        this
                    );
                    this.getView().addDependent(this.oAgrupadorUtensilio);
                }
                let sExpand = "estadoId";
                let aFilters = [];
                aFilters.push(new Filter("clasificacionId_clasificacionUtensilioId", "EQ", oContext.clasificacionUtensilioId));
                let oResponse = await oDataService.onGetDataGeneralFiltersExpand(this.mainModelv2, "UTENSILIO", aFilters, sExpand);
                this.localModel.setProperty("/aListUtensiliosAgrupador", oResponse.results);
                this.oAgrupadorUtensilio.open();
                BusyIndicator.hide();
            },

            onCancelUtensilioAgrupador: function () {
                this.oAgrupadorUtensilio.close();
            },

            onAddUtensilioAgrupador: async function () {
                let aListUtensilios = this.localModel.getProperty("/aListUtensiliosAgrupador");
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                let oResponseUtensilio = await oDataService.onGetDataGeneralFilters(this.mainModelv2, "UTENSILIO", aFilter); 
                oResponseUtensilio = oResponseUtensilio.results.filter(itm=>itm.clasificacionId_clasificacionUtensilioId === null);             
                let oDataUtensilio = this.fiterUtensilio(aListUtensilios, oResponseUtensilio);
                this.localModel.setProperty("/aListUtensilios", oDataUtensilio);
                if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment(rootPath + ".view.fragment.configuration.new.AddUtensilioAgrupador", this);
					this.getView().addDependent(this.oDialog);
				}
				this.oDialog.open();
            },

            fiterUtensilio : function (aListUtensilios, aListTotalUtensilio) {
                aListUtensilios.forEach(function(obj){
                    aListTotalUtensilio = aListTotalUtensilio.filter(itm => itm.utensilioId !== obj.utensilioId);
                }); 
                return aListTotalUtensilio;
            },

            onSearchUtensilio: function (oEvent) {
                let aFilters = [];
				let sQuery = oEvent.getParameter("value");
                let filter1, filter2;
				if (sQuery) {
					filter1 = new Filter("codigo", FilterOperator.Contains, sQuery);
					filter2 = new Filter("descripcion", FilterOperator.Contains, sQuery);
				} else {
                    filter1 = new Filter("codigo", FilterOperator.Contains, '');
					filter2 = new Filter("descripcion", FilterOperator.Contains, '');
                }
                aFilters = new Filter([filter1, filter2]);
                let oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter(aFilters, "Application");
            },

            onConfirmAddUtensilio: async function (oEvent) {
                let that = this;
                BusyIndicator.show(0);
                let aListSelected = oEvent.mParameters.selectedItems;
                let agrupadorSeleccionado = this.localModel.getProperty("/agrupadorSeleccionado");
                for await (const obj of aListSelected) {
                    // let utensilioIdSelected = obj.getProperty("title");
                    let utensilioIdSelected = obj.getBindingContext("localModel").getObject().utensilioId;
                    let oObj = {
                        usuarioActualiza     : sUsuarioLocal,
                        fechaActualiza       : new Date(),
                        clasificacionId_clasificacionUtensilioId : agrupadorSeleccionado.clasificacionUtensilioId
                    }
                    await oDataService.onUpdateDataGeneral(that.mainModelv2, "UTENSILIO", oObj, utensilioIdSelected);
                }
                let aFilters = [];
                aFilters.push(new Filter("clasificacionId_clasificacionUtensilioId", "EQ", agrupadorSeleccionado.clasificacionUtensilioId));
                let oResponse = await oDataService.onGetDataGeneralFilters(this.mainModelv2, "UTENSILIO", aFilters);
                this.localModel.setProperty("/aListUtensiliosAgrupador", oResponse.results);
                BusyIndicator.hide();
            },

            onDeleteUtensilioAgrupador: function () {
                let that = this;
                let agrupadorSeleccionado = this.localModel.getProperty("/agrupadorSeleccionado");
                let oTable = sap.ui.core.Fragment.byId("frgAgrupadorUtensilio", "tblUtensiliosAgrupador")
                let aListSelectedPaths = oTable._aSelectedPaths;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(that.getView().getModel("i18n").getResourceBundle().getText("askForDeletion"), {
                        actions: ["Borrar registro", "Cancelar"],
                        emphasizedAction: "Borrar registro",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar registro") {
                                BusyIndicator.show(0);
                                for await (const sPath of aListSelectedPaths) {
                                    let oObj = that.localModel.getProperty(sPath);
                                    let oObjEdit = {
                                        usuarioActualiza     : sUsuarioLocal,
                                        fechaActualiza       : new Date(),
                                        clasificacionId_clasificacionUtensilioId : null
                                    }
                                    await oDataService.onUpdateDataGeneral(that.mainModelv2, "UTENSILIO", oObjEdit, oObj.utensilioId);
                                }
                                let aFilters = [];
                                aFilters.push(new Filter("clasificacionId_clasificacionUtensilioId", "EQ", agrupadorSeleccionado.clasificacionUtensilioId));
                                let oResponse = await oDataService.onGetDataGeneralFilters(that.mainModelv2, "UTENSILIO", aFilters);
                                that.localModel.setProperty("/aListUtensiliosAgrupador", oResponse.results);
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("txtMessage44"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("txtMessage45"))
                }
            },

            onDeleteClasificacion: async function () {
                let that = this;
                let oTable = sap.ui.core.Fragment.byId("frgGetClasificacion", "tblClasificaciones");
                let aListSelectedPaths = oTable._aSelectedPaths;
                let bFlag = true;
                let oFilter = [];
                let aFilters = [];

                aListSelectedPaths.forEach(function(sPath){
                    let oContext = that.mainModelv2.getProperty(sPath);
                    aFilters.push(new Filter("agrupadorId_clasificacionUtensilioId", "EQ", oContext.clasificacionUtensilioId));                    
                });

                oFilter.push(new Filter({
                    filters: aFilters, 
                    and: false
                }));

                let oResponse = await oDataService.onGetDataGeneralFilters(that.mainModelv2, "MD_ES_UTENSILIO", oFilter);
                if(oResponse.results.length > 0) {
                    bFlag = false;
                }

                if (!bFlag) {
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage46"))
                    return;
                }

                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(that.getView().getModel("i18n").getResourceBundle().getText("askForDeletion"), {
                        actions: ["Borrar registro", "Cancelar"],
                        emphasizedAction: "Borrar registro",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar registro") {
                                BusyIndicator.show(0);
                                aListSelectedPaths.forEach(async function(sPath){
                                    let oObj = that.mainModelv2.getProperty(sPath);
                                    let aFilter = [];
                                    aFilter.push(new Filter("activo", "EQ", true));
                                    aFilter.push(new Filter("clasificacionId_clasificacionUtensilioId", "EQ", oObj.clasificacionUtensilioId));
                                    let oResponseUtensilio = await oDataService.onGetDataGeneralFilters(that.mainModelv2, "UTENSILIO", aFilter);
                                    oResponseUtensilio.results.forEach(async function(oUtensilio){
                                        let oObjEdit = {
                                            usuarioActualiza     : sUsuarioLocal,
                                            fechaActualiza       : new Date(),
                                            clasificacionId_clasificacionUtensilioId : null
                                        }
                                        await oDataService.onUpdateDataGeneral(that.mainModelv2, "UTENSILIO", oObjEdit, oUtensilio.utensilioId);
                                    });
                                    let oObjEdit = {
                                        usuarioActualiza     : sUsuarioLocal,
                                        fechaActualiza       : new Date(),
                                        activo               : false
                                    }
                                    await oDataService.onUpdateDataGeneral(that.mainModelv2, "UTENSILIO_CLASIFICACION", oObjEdit, oObj.clasificacionUtensilioId);
                                });
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("txtMessage47"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("txtMessage45"))
                }
            },

            onSaveDescriptionAgrupador: async function () {
                BusyIndicator.show(0);
                let oObjAgrupador = this.localModel.getProperty("/agrupadorSeleccionado");
                let oObjEdit = {
                    usuarioActualiza     : sUsuarioLocal,
                    fechaActualiza       : new Date(),
                    descripcion          : oObjAgrupador.descripcion
                }
                await oDataService.onUpdateDataGeneral(this.mainModelv2, "UTENSILIO_CLASIFICACION", oObjEdit, oObjAgrupador.clasificacionUtensilioId);
                BusyIndicator.hide();
            },

            onSearchIconTab: function (oEvent) {
                let sKey = oEvent.getSource().getSelectedKey();

                if (sKey === '1') {
                    this.onState(true, "sTabEstructura");
                    this.onState(false, "sTabEtiqueta");
                    this.onState(false, "sTabPaso");
                    this.onState(false, "sTabMotivo");
                    this.onState(false, "sTabEquipo");
                    this.onState(false, "sTabMotivoLapso");
                } else if (sKey === '2') {
                    this.onState(false, "sTabEstructura");
                    this.onState(true, "sTabEtiqueta");
                    this.onState(false, "sTabPaso");
                    this.onState(false, "sTabMotivo");
                    this.onState(false, "sTabEquipo");
                    this.onState(false, "sTabMotivoLapso");
                } else if (sKey === '3') {
                    this.onState(false, "sTabEstructura");
                    this.onState(false, "sTabEtiqueta");
                    this.onState(true, "sTabPaso");
                    this.onState(false, "sTabMotivo");
                    this.onState(false, "sTabEquipo");
                    this.onState(false, "sTabMotivoLapso");
                } else if (sKey === '4') {
                    this.onState(false, "sTabEstructura");
                    this.onState(false, "sTabEtiqueta");
                    this.onState(false, "sTabPaso");
                    this.onState(true, "sTabMotivo");
                    this.onState(false, "sTabEquipo");
                    this.onState(false, "sTabMotivoLapso");
                } else if (sKey === '5') {
                    this.onState(false, "sTabEstructura");
                    this.onState(false, "sTabEtiqueta");
                    this.onState(false, "sTabPaso");
                    this.onState(false, "sTabMotivo");
                    this.onState(true, "sTabEquipo");
                    this.onState(false, "sTabMotivoLapso");
                } else if (sKey === '6') {
                    this.onState(false, "sTabEstructura");
                    this.onState(false, "sTabEtiqueta");
                    this.onState(false, "sTabPaso");
                    this.onState(false, "sTabMotivo");
                    this.onState(false, "sTabEquipo");
                    this.onState(true, "sTabMotivoLapso");
                }


                if(sKey === '3'){
                    let aFilter = [];
                    aFilter.push(new Filter("activo", "EQ", true));
                    sap.ui.core.Fragment.byId("frgConfiguration", "tblStep").getBinding("items").filter(aFilter, FilterType.Application);
                }
            },

            // Mensajes de error.
            onErrorMessage: function (oError, textoI18n) {
                try {
                    if (oError.responseJSON) {
                        if (oError.responseJSON.error) {
                            MessageBox.error(oError.responseJSON.error.message.value);
                        } else {
                            if (oError.responseJSON[0]) {
                                if (oError.responseJSON[0].description) {
                                    MessageBox.error(oError.responseJSON[0].description);
                                } else {
                                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
                                }
                            } else {
                                if (oError.responseJSON.message) {
                                    MessageBox.error(oError.responseJSON.message);
                                } else {
                                    MessageBox.error(oError.responseJSON.response.description);
                                }
                            }
                        }
                    } else if (oError.responseText) {
                        try {
                            if (oError.responseText) {
                                var oErrorRes = JSON.parse(oError.responseText),
                                    sErrorDetails = oErrorRes.error.innererror.errordetails;
                                if (typeof (sErrorDetails[0].message) === 'object') {
                                    MessageBox.error(sErrorDetails[0].message.value);
                                } else {
                                    MessageBox.error(sErrorDetails[0].message);
                                }
                            } else {
                                oThat.onErrorMessage("", "errorSave");
                            }
                        } catch (error) {
                            MessageBox.error(oError.responseText);
                        }
                    } else if (oError.message) {
                        MessageBox.error(oError.message);
                    } else {
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
                    }
                } catch (oErrorT) {
                    oThat.onErrorMessage(oErrorT, "errorSave");
                }
            },
            onPressCompare:function(){
                console.log("XXXXD");
            },           

            onSearchAgrupadores: async function (oEvent) {
                BusyIndicator.show(0);
                let sValue = oEvent.getParameter("query");
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                aFilter.push(new Filter("descripcion", FilterOperator.Contains, sValue));
                let aListAgrupadores = await oDataService.onGetDataGeneralFilters(oThat.mainModelv2, "UTENSILIO_CLASIFICACION", aFilter);
                oThat.localModel.setProperty("/aListAgrupadores", aListAgrupadores.results);        
                BusyIndicator.hide();        
            }

        });
    }
);
