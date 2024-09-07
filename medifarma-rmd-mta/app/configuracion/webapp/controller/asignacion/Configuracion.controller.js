
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
    "sap/ui/model/json/JSONModel",
    "mif/rmd/configuracion/utils/util",
    "../../libs/xlsx.full.min",
    "mif/rmd/configuracion/utils/formatter",
    "sap/ui/core/BusyIndicator",
    '../../services/external/sharepoint',
],
    function (Controller, MessageBox, MessageToast, Filter, FilterOperator, FilterType, Spreadsheet, exportLibrary, Service, JSONModel, util, xlsx, formatter, BusyIndicator, sharepointService) {
        "use strict";
        const rootPath = "mif.rmd.configuracion";
        let objTipoEstructuraIMaestro ={
            Condiciones: null,
            Cuadro: null,
            Equipos: null,
            Especificaciones: null,
            Procesos: null,
            Formula: null
        };
        // "Verificacion":489
        let EdmType = exportLibrary.EdmType,
            oThat,
            oThatConf,
            sLastPredecesorCodigo = '',
            sLastIdPaso = '',
            oInfoUsuario,
            sTipoProcess = false,
            sIdTipoEquipo,
            sIdTipoUtensilio,
            sIdTipoEstructuraCondAmbiente,
            sIdTipoEstructuraCuadro,
            sIdTipoEstructuraProceso,
            sIdTipoEstructuraFormula,
            sIdTipoEstructuraFirmas,
            sIdTipoEstructuraEspecificaciones,
            sIdTipoEstructuraEquipo,
            sIdEstadoProcesoPendiente,
            sIdTipoDato,
            estadoIngresadoRMD,
            sIdTipoDatoVerificacionCheck,
            sIdTipoDatoRango,
            sIdTipoDatoRealizadoPor,
            sIdTipoDatoVistoBueno,
            sIdTipoDatoFormula,
            sIdTipoDatoFechayHora,
            sTxtTipoEquipo,
            sTipoDatoNumero,
            sTipoDatoCantidad,
            sTipoDatoMuestraCC,
            sTipoDatoTexto,
            sEstadoAutorizado,
            iMaxLengthArchivos,
            sEstadoSuspendido,
            sEstadoCerrado,
            sIdTipoDatoNotificacion,
            sTypeEquipment,
            sTypeEnsayoPadre,
            idEstadoRmdCancelado,
            sTipoDatoEntrega,
            sAiPrio00,
            sAiPrio01;
        return {
            formatter: formatter,

            onAfterRendering:async function (aThat) {
                oThat = aThat;
                // Carga de constantes
                if (oThat.aConstantes.results.length > 0) {
                    await this.onSetConstans(oThat.aConstantes);
                    objTipoEstructuraIMaestro.Condiciones = sIdTipoEstructuraCondAmbiente;
                    objTipoEstructuraIMaestro.Cuadro = sIdTipoEstructuraCuadro;
                    objTipoEstructuraIMaestro.Equipos = sIdTipoEstructuraEquipo;
                    objTipoEstructuraIMaestro.Especificaciones = sIdTipoEstructuraEspecificaciones;
                    objTipoEstructuraIMaestro.Procesos = sIdTipoEstructuraProceso;
                    objTipoEstructuraIMaestro.Formula = sIdTipoEstructuraFormula;
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoConstants"));
                    sap.ui.core.BusyIndicator.hide();
                    return false;
                }
                oThatConf = this;
                sTipoProcess = false;
                this.localModel = oThat.getView().getModel("localModel");
                oInfoUsuario = this.localModel.getProperty("/oInfoUsuario");
                this.onGetModelInitial();
                this.onGetDataInitial();
                oThat.getView().getModel("localModel").setProperty("/tipoDatoPasoMD", false);
                oThat.onConsumirNecesidadesClaveModelo();
                oThatConf.onConsumirPuestoTrabajo();
            },
            _empty: ["", null, undefined, 0, NaN],
            onGetDataInitial: async function () {
                this.mainModel = oThat.getView().getModel("mainModel");
                this.mainModel.setSizeLimit(999999999);
                this.mainModelv2 = oThat.getView().getModel("mainModelv2");
                this.mainModelv2.setSizeLimit(999999999);
                this.oModelErpProd = oThat.getView().getModel("PRODUCCION_SRV");
                this.oModelErpNec = oThat.getView().getModel("NECESIDADESRMD_SRV");
            },

            onGetModelInitial: function () {
                this.onState(sIdTipoDato, "aTipoDato");
            },

            onCancelEditarRM: function () {
                // sap.ui.controller("mif.rmd.configuracion.controller.MainView").onGetDataInitial();
                oThat.getView().getModel("asociarDatos").setData({});
                oThat.oEditarRM.close();
            },

            // MENU DE ACCIONES EDITAR RM
            onEditMenuAction: function (oEvent) {
                let press = oEvent.getSource().getProperty("text");
                let oEstructura = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                let sDescripcion = oEstructura.descripcion_est;
                if (!sDescripcion) {
                    oEstructura = oEvent
                        .getSource()
                        .getBindingContext("localModel")
                        .getObject().desc;
                }

                let oModel = new JSONModel(oEstructura);
                oThat.getView().setModel(oModel, "headerAddEstructura");

                if (press === "Adicionar Pasos RM") {
                    oThatConf.onGetPasosToAssign();
                    oThatConf.onGetDataCuadroResponsive();
                } else if (press === "Adicionar Pasos CA RMD") {
                    oThatConf.onGetPasosToAssign();
                    oThatConf.onGetDataCondicionesAmbientalesResponsive();
                } else if (press === "Adicionar Equipo") {
                    Promise.all([oThatConf.onGetEquipo(), oThatConf.onGetUtensilio()]).then(async values => {
                        let aEquipo = values[0].results;
                        let aUtensilio = values[1].results;
                        let oListMdEquipo = oThat.getView().getModel("listMdEsEquipo");
                        let oListMdUtensilio = oThat.getView().getModel("listMdEsUtensilio");
                        let aEquiposNoAsign = [];
                        let aUtensiliosNoAsign = [];
                        let aDataEquipoGeneral = [];

                        aEquipo.forEach(function (element) {
                            let bFlag = true;
                            oListMdEquipo.getData().forEach(function (item) {
                                if (element.Equnr === item.equipoId.equnr && 
                                    item.estructuraId_estructuraId === oEstructura.estructuraId_estructuraId) {
                                    bFlag = false;
                                    return false;
                                }
                            });

                            if (bFlag) {
                                aEquiposNoAsign.push(element);
                            }
                        });

                        aUtensilio.forEach(function (element) {
                            let bFlag = true;
                            oListMdUtensilio.getData().forEach(function (item) {
                                if (element.utensilioId === item.utensilioId_utensilioId && 
                                    element.tipoId_iMaestraId === sIdTipoUtensilio && element.activo === true &&
                                     item.estructuraId_estructuraId === oEstructura.estructuraId_estructuraId) {
                                    bFlag = false;
                                    return false;
                                }
                            });

                            if (bFlag) {
                                aUtensiliosNoAsign.push(element);
                            }
                        });

                        // id: item.Equipment,
                        // equipment: item.Equipment,
                        // abcindic: item.Abcindic,
                        // descript: item.Descript,
                        // stat: item.Stat,
                        // txt30: item.Txt30,
                        // swerk: item.Swerk,
                        // tipoId: sIdTipoEquipo,
                        // tipo: sTxtTipoEquipo,
                        // funclocstrucidentifyingobjdes2: item.Funclocstrucidentifyingobjdes2,
                        // eqtyp: item.Eqtyp,
                        // eqktx: item.Eqktx,
                        // maintplant: item.Maintplant,
                        // equicatgry: item.Equicatgry,
                        // inbdt: item.Inbdt,
                        // readObjnr: item.ReadObjnr,
                        // readCrdat: item.ReadCrdat,
                        // ppWkctr: item.PpWkctr,
                        // compCode: item.CompCode,
                        // superiorFuncloc: item.SuperiorFuncloc,
                        // descmarcamodel: item.Descmarcamodel
                        for await (const item of aEquiposNoAsign) {
                            aDataEquipoGeneral.push({
                                id: item.equipoId,
                                aufnr: '',
                                werks: item.Swerk,
                                auart: '',
                                ktext: '',
                                ilart: '',
                                sstat: item.Stat,
                                ustat: '',
                                ecali: '',
                                gstrp: '',
                                gltrp: '',
                                tplnr: item.SuperiorFuncloc,
                                pltxt: item.Funclocstrucidentifyingobjdes2,
                                equnr: item.Equipment,
                                eqtyp: item.Eqtyp,
                                estat: item.Txt30,
                                eqktx: item.Eqktx,
                                inbdt: item.Inbdt,
                                ctext: item.PpWkctr === '00000000' ? '' : item.PpWkctr,
                                abckz: item.Abcindic,
                                denom: item.Descmarcamodel,
                                codigoGaci: item.CodigoGaci,
                                tipoId: sIdTipoEquipo,
                                tipo: sTxtTipoEquipo
                            });
                        }

                                // id: item.utensilioId,
                                // equipment: item.codigo,
                                // abcindic: '',
                                // descript: item.descripcion,
                                // stat: item.estadoId_iMaestraId,
                                // txt30: item.estadoId.contenido,
                                // swerk: '',
                                // tipoId: item.tipoId_iMaestraId,
                                // tipo: item.tipoId.contenido,
                                // funclocstrucidentifyingobjdes2: '',
                                // eqtyp: '',
                                // eqktx: '',
                                // maintplant: '',
                                // equicatgry: '',
                                // inbdt: '',
                                // readObjnr: '',
                                // readCrdat: '',
                                // ppWkctr: '',
                                // compCode: '',
                                // superiorFuncloc: '',
                                // descmarcamodel: '',
                        for await (const item of aUtensiliosNoAsign) {
                            aDataEquipoGeneral.push({
                                id: item.utensilioId,
                                aufnr: "",
                                werks: "",
                                auart: "",
                                ktext: "",
                                ilart: "",
                                sstat: "",
                                ustat: "",
                                ecali: "",
                                gstrp: "",
                                gltrp: "",
                                tplnr: "",
                                pltxt: "",
                                equnr: item.codigo,
                                eqtyp: "",
                                estat: item.estadoId.contenido,
                                eqktx: item.descripcion,
                                inbdt: "",
                                ctext: "",
                                abckz: "",
                                denom: "",
                                tipoId: item.tipoId_iMaestraId,
                                tipo: item.tipoId.contenido
                            });
                        }

                        let oModelEqp = new JSONModel(aDataEquipoGeneral);
                        oModelEqp.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelEqp, "aListEquipoUtensilio");

                        oThatConf.onAddEquipoEditRM();
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    })
                } else if (press === "Adicionar Etiqueta") {
                    this.onAddEtiqueta();
                } else if (press === "Adicionar Especificaciones") {
                    this.onGetEnsayoPadre().then(function (oListEnsayoPadre) {
                        let oModel = new JSONModel(oListEnsayoPadre.results);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "aListEnsayoPadre");
                        sap.ui.core.BusyIndicator.hide();

                        oThatConf.onAddEEspecificacionEditRM();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                }
            },

            // GENERAR NUEVA VERSION EDITAR RM
            onGenerarNuevaVersion: function () {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage48"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            BusyIndicator.show();
                            let tipo = "2";
                            let newCorrelativo;
                            let año = (new Date().getFullYear()).toString();
                            await Service.onGetDataGeneral(oThat.mainModelv2, "MD").then(async function (res) {
                                if (res.results.length === 0) {
                                    newCorrelativo = "00001"
                                } else {
                                    res.results.sort(function (a, b) {
                                        return b.codigo - a.codigo;
                                    });
                                    let lastCode = res.results[0].codigo;
                                    if (lastCode === "" || lastCode === null){
                                        lastCode = "00000"
                                    }
                                    let lastCorrelativo = lastCode.substring(lastCode.length - 5, lastCode.length);
                                    let newValue = parseInt(lastCorrelativo) + 1;
                                    if (newValue < 10) {
                                        newCorrelativo = "0000" + newValue.toString();
                                    } else if (newValue < 100) {
                                        newCorrelativo = "000" + newValue.toString();
                                    } else if (newValue < 1000) {
                                        newCorrelativo = "00" + newValue.toString();
                                    } else if (newValue < 10000) {
                                        newCorrelativo = "0" + newValue.toString();
                                    } else if (newValue < 100000) {
                                        newCorrelativo = newValue.toString();
                                    }
                                }
                                let codigoGenerated = tipo + año + newCorrelativo;
                                let oDataSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                                let aVersionesAnteriores = res.results.filter(itm=>itm.descripcion === oDataSeleccionada.descripcion && itm.estadoIdRmd_iMaestraId !== 466);
                                aVersionesAnteriores.sort(function (a, b) {
                                    return b.codigo - a.codigo;
                                });
                                let lastVersion = aVersionesAnteriores[0].version;
                                let codigoversionprincipal;
                                codigoversionprincipal = aVersionesAnteriores[0].codigoversionprincipal;
                                if(aVersionesAnteriores.length ==1){
                                    codigoversionprincipal = aVersionesAnteriores[0].codigo;
                                }
                                let oParamMaster = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    mdId: util.onGetUUIDV4(),
                                    codigo: codigoGenerated,
                                    version: lastVersion + 1,
                                    descripcion: oDataSeleccionada.descripcion,
                                    nivelTxt: oDataSeleccionada.nivelTxt,
                                    areaRmdTxt: oDataSeleccionada.areaRmdTxt,
                                    sucursalId_iMaestraId: oDataSeleccionada.sucursalId_iMaestraId,
                                    fechaSolicitud: oDataSeleccionada.fechaSolicitud,
                                    estadoIdRmd_iMaestraId: estadoIngresadoRMD,
                                    af: oDataSeleccionada.af,
                                    estadoIdProceso_iMaestraId: sIdEstadoProcesoPendiente,
                                    masRecetas : oDataSeleccionada.masRecetas,
                                    rptaValidacion: oDataSeleccionada.rptaValidacion,
                                    codDefectoReceta : oDataSeleccionada.codDefectoReceta,
                                    codAgrupadorReceta : oDataSeleccionada.codAgrupadorReceta,
                                    codigoversionprincipal: codigoversionprincipal,
                                    motivoId_motivoId: oDataSeleccionada.motivoId_motivoId,
                                    rptaValidacionDate: oDataSeleccionada.rptaValidacionDate
                                }
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD", oParamMaster);
                                let updTraz = {
                                    activo                  : true,
                                    usuarioRegistro         : oInfoUsuario.data.usuario,
                                    fechaRegistro           : new Date(),
                                    idTrazabilidad          : util.onGetUUIDV4(),
                                    mdId_mdId               : oParamMaster.mdId,
                                    estadoTrazab_iMaestraId : estadoIngresadoRMD
                                }
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);
                                let aFilterReceta = [];
                                let aRecetas = [];
                                aFilterReceta.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.mdId));
                                let sExpandReceta = "aInsumos";
                                let aRecetaMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_RECETA", aFilterReceta, sExpandReceta);
                                for await (const oReceta of aRecetaMD.results) {
                                    //AGREGAMOS LOS ID'S INSUMOS ANTIGUOS Y LO ENLAZAMOS CON EL NUEVO
                                    let mdRecetaIdActual = util.onGetUUIDV4();
                                    aRecetas.push({mdRecetaIdAntiguo: oReceta.mdRecetaId, mdRecetaIdActual: mdRecetaIdActual});

                                    let oParamReceta = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdRecetaId: mdRecetaIdActual,
                                        mdId_mdId: oParamMaster.mdId,
                                        recetaId_recetaId : oReceta.recetaId_recetaId,
                                        orden : oReceta.orden
                                    }
                                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_RECETA", oParamReceta);
                                }
                                let aFilter = [];
                                aFilter.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.mdId));
                                let sExpand = "aInsumo,aPaso/aFormula,aEquipo,aUtensilio,aEtiqueta,aPasoInsumoPaso/aFormula,aEspecificacion";
                                let aEstructuraMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilter, sExpand);
                                let aListEstructurasRMD = [];
                                let aInsumos = [];
                                for await (const oEstructura of aEstructuraMD.results) {
                                    if(oEstructura.aInsumo.results.length > 0){
                                        let oParam = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraId: util.onGetUUIDV4(),
                                            orden: oEstructura.orden,
                                            mdId_mdId: oParamMaster.mdId,
                                            estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                                            aInsumo: [],
                                            aPaso: [],
                                            aEquipo : [],
                                            aUtensilio : [],
                                            aEtiqueta: [],
                                            aPasoInsumoPaso: [],
                                            aEspecificacion: []
                                        }

                                        // AGREGAMOS INSUMOS A LA ESTRUCTURA
                                        if (oEstructura.aInsumo.results.length > 0) {
                                            for await (const oInsumo of oEstructura.aInsumo.results) {
                                            // oEstructura.aInsumo.results.forEach(async function (oInsumo) {
                                                let estructuraRecetaInsumoIdActual = util.onGetUUIDV4();
                                                aInsumos.push({estructuraRecetaInsumoIdAntiguo: oInsumo.estructuraRecetaInsumoId, estructuraRecetaInsumoIdActual: estructuraRecetaInsumoIdActual});

                                                // PARA SETEAR EL ID DE LA RECETA
                                                let mdRecetaIdActual = null;
                                                let oInsumoG;
                                                if (oInsumo.mdRecetaId_mdRecetaId) {
                                                    oInsumoG = aRecetas.find(itm=>itm.mdRecetaIdAntiguo === oInsumo.mdRecetaId_mdRecetaId);
                                                    if (oInsumoG) {
                                                        mdRecetaIdActual = oInsumoG.mdRecetaIdActual;
                                                    }
                                                }
                                                let oInsumoObj = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    estructuraRecetaInsumoId: estructuraRecetaInsumoIdActual,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oInsumo.estructuraId_estructuraId,
                                                    mdRecetaId_mdRecetaId : mdRecetaIdActual,
                                                    cantidadRm : oInsumo.cantidadRm,
                                                    cantidadBarCode : oInsumo.cantidadBarCode,
                                                    Matnr : oInsumo.Matnr,
                                                    Werks : oInsumo.Werks,                
                                                    Maktx : oInsumo.Maktx,               
                                                    ItemCateg : oInsumo.ItemCateg,               
                                                    ItemNo : oInsumo.ItemNo,             
                                                    Component : oInsumo.Component,           
                                                    CompQty : oInsumo.CompQty,          
                                                    CompUnit : oInsumo.CompUnit,           
                                                    ItemText1 : oInsumo.ItemText1,           
                                                    ItemText2 : oInsumo.ItemText2,
                                                    Txtadic : oInsumo.Txtadic,
                                                    AiPrio : oInsumo.AiPrio
                                                }
                                                oParam.aInsumo.push(oInsumoObj);
                                            }
                                        }
                                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oParam);
                                    }
                                }

                                let aPasos = [];
                                let aPasosInsumosPasos = [];
                                let aFormulaGeneral = {
                                    id : util.onGetUUIDV4(),
                                    aFormula : []
                                }

                                aEstructuraMD.results.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });

                                for await (const oEstructura of aEstructuraMD.results) {
                                    if (oEstructura.aInsumo.results.length === 0) {
                                        let oParam = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraId: util.onGetUUIDV4(),
                                            orden: oEstructura.orden,
                                            mdId_mdId: oParamMaster.mdId,
                                            estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                                            aInsumo: [],
                                            aPaso: [],
                                            aEquipo : [],
                                            aUtensilio : [],
                                            aEtiqueta: [],
                                            aPasoInsumoPaso: [],
                                            aEspecificacion: []
                                        }
                                        aListEstructurasRMD.push(oParam);

                                        let aEtiquetas = [];

                                        //AGREGAMOS LAS ETIQUETAS A LA ESTRUCTURA
                                        if (oEstructura.aEtiqueta.results.length > 0) {
                                            oEstructura.aEtiqueta.results.forEach(async function (oEtiqueta) {
                                                let mdEsEtiquetaIdActual = util.onGetUUIDV4();
                                                aEtiquetas.push({mdEsEtiquetaIdAntiguo: oEtiqueta.mdEsEtiquetaId, mdEsEtiquetaIdActual: mdEsEtiquetaIdActual});
                                                let oEtiquetaObj = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oEtiqueta.estructuraId_estructuraId,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    etiquetaId_etiquetaId: oEtiqueta.etiquetaId_etiquetaId,
                                                    orden: oEtiqueta.orden,
                                                    conforme: oEtiqueta.conforme,
                                                    procesoMenor: oEtiqueta.procesoMenor
                                                }
                                                oParam.aEtiqueta.push(oEtiquetaObj);
                                            });
                                        }

                                        //AGREGAMOS LOS PASOS A LA ESTRUCTURA
                                        if (oEstructura.aPaso.results.length > 0) {
                                            for await (const oPaso of oEstructura.aPaso.results) {
                                            // oEstructura.aPaso.results.forEach(function (oPaso) {
                                                let mdEstructuraPasoIdActual = util.onGetUUIDV4();
                                                aPasos.push({mdEstructuraPasoIdAntiguo: oPaso.mdEstructuraPasoId, mdEstructuraPasoIdActual: mdEstructuraPasoIdActual});

                                                let mdEsEtiquetaIdActual = null;
                                                let oEtiqueta;
                                                if (oPaso.mdEsEtiquetaId_mdEsEtiquetaId) {
                                                    oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oPaso.mdEsEtiquetaId_mdEsEtiquetaId);
                                                    if (oEtiqueta) {
                                                        mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                                    }
                                                }
                                                
                                                let oPasoObj = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oPaso.estructuraId_estructuraId,
                                                    mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    pasoId_pasoId: oPaso.pasoId_pasoId,
                                                    orden: oPaso.orden,
                                                    valorInicial: oPaso.valorInicial,
                                                    valorFinal: oPaso.valorFinal,
                                                    margen: oPaso.margen,
                                                    decimales: oPaso.decimales,
                                                    mdEstructuraPasoIdDepende: mdEstructuraPasoIdActual,
                                                    depende: oPaso.depende,
                                                    dependeMdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                                    estadoCC: oPaso.estadoCC,
                                                    estadoMov: oPaso.estadoMov,
                                                    pmop: oPaso.pmop,
                                                    genpp: oPaso.genpp,
                                                    tab: oPaso.tab,
                                                    edit: oPaso.edit,
                                                    rpor: oPaso.rpor,
                                                    vb: oPaso.vb,
                                                    formato : oPaso.formato,
                                                    colorHex : oPaso.colorHex,
                                                    colorRgb : oPaso.colorRgb,
                                                    imagen : oPaso.imagen,
                                                    imagenRuta: oPaso.imagenRuta,
                                                    imagenWidth: oPaso.imagenWidth,
                                                    imagenPosition: oPaso.imagenPosition,
                                                    tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                                    flagModif : false,
                                                    puestoTrabajo : oPaso.puestoTrabajo,
                                                    clvModelo : oPaso.clvModelo,
                                                    automatico : oPaso.automatico,
                                                    aFormula : oPaso.aFormula.results,
                                                    tipoDatoIdAnterior_iMaestraId: oPaso.tipoDatoId_iMaestraId
                                                }
                                                oParam.aPaso.push(oPasoObj);

                                                // Copiar la imagen del paso a la nueva versión.
                                                if (oPaso.imagen) {
                                                    await oThatConf.onGetImagenSharepointCopiaNueva(oPaso, oPasoObj);
                                                }
                                            }

                                            for await (const oPaso of oParam.aPaso) {
                                            // oParam.aPaso.forEach(function (oPaso) {
                                                let oPasoActual;
                                                if (oPaso.dependeMdEstructuraPasoId) {
                                                    oPasoActual = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oPaso.dependeMdEstructuraPasoId);
                                                    if (oPasoActual) {
                                                        oPaso.dependeMdEstructuraPasoId = oPasoActual.mdEstructuraPasoIdActual;
                                                    }
                                                }

                                                if (oPaso.aFormula.length > 0) {
                                                    for await (const oFormula of oPaso.aFormula) {
                                                    // oPaso.aFormula.forEach(function (oFormula) {
                                                        oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                                        oFormula.fechaRegistro = new Date();
                                                        oFormula.activo = true;
                                                        oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                                        oFormula.usuarioActualiza = null;
                                                        oFormula.fechaActualiza = null;
                                                        oFormula.mdId_mdId = oParamMaster.mdId;

                                                        let oPasoActualPadre = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoPadreId_mdEstructuraPasoId);
                                                        if (oPasoActualPadre) {
                                                            oFormula.pasoPadreId_mdEstructuraPasoId = oPasoActualPadre.mdEstructuraPasoIdActual;
                                                        }
                                                        if (oFormula.esPaso) {
                                                            let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                            if (oPasoActualFormula) {
                                                                oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                            }
                                                        }
                                                        aFormulaGeneral.aFormula.push(oFormula);
                                                    }
                                                }
                                                oPaso.aFormula = [];
                                            }
                                        }

                                        //AGREGAMOS LOS EQUIPOS A LA ESTRUCTURA
                                        if (oEstructura.aEquipo.results.length > 0) {
                                            oEstructura.aEquipo.results.forEach(async function (oEquipo) {
                                                let oEquipoObj = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    mdEstructuraEquipoId: util.onGetUUIDV4(),
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oEquipo.estructuraId_estructuraId,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    equipoId_equipoId: oEquipo.equipoId_equipoId,
                                                    orden: oEquipo.orden
                                                }
                                                oParam.aEquipo.push(oEquipoObj);
                                            });
                                        }
                            
                                        //AGREGAMOS LOS UTENSILIOS A LA ESTRUCTURA
                                        if (oEstructura.aUtensilio.results.length > 0) {
                                            oEstructura.aUtensilio.results.forEach(async function (oUtensilio) {
                                                let oUtensiliooBJ = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    mdEstructuraUtensilioId: util.onGetUUIDV4(),
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oUtensilio.estructuraId_estructuraId,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    utensilioId_utensilioId: oUtensilio.utensilioId_utensilioId,
                                                    agrupadorId_clasificacionUtensilioId : oUtensilio.agrupadorId_clasificacionUtensilioId,
                                                    orden: oUtensilio.orden
                                                }
                                                oParam.aUtensilio.push(oUtensiliooBJ);
                                            });
                                        }
                            
                                        //AGREGAMOS  LOS PROCESOS MENORES A LOS PASOS DE LA ETIQUETA DE LA ESTRUCTURA
                                        if (oEstructura.aPasoInsumoPaso.results.length > 0) {
                                            for await (const oProcesoMenor of oEstructura.aPasoInsumoPaso.results) {
                                            // oEstructura.aPasoInsumoPaso.results.forEach(async function (oProcesoMenor) {
                                                let mdEstructuraPasoInsumoPasoIdActual = util.onGetUUIDV4();
                                                aPasosInsumosPasos.push({mdEstructuraPasoInsumoPasoIdAntiguo: oProcesoMenor.mdEstructuraPasoInsumoPasoId, mdEstructuraPasoInsumoPasoIdActual: mdEstructuraPasoInsumoPasoIdActual});
                                                // PARA SETEAR EL ID DE LA TABLA MD_ES_ETIQUETA
                                                let mdEsEtiquetaIdActual = null;
                                                let oEtiqueta;
                                                if (oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId) {
                                                    oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId);
                                                    if (oEtiqueta) {
                                                        mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                                    }
                                                }

                                                // PARA SETEAR EL ID DE LOS INSUMOS
                                                let estructuraRecetaInsumoIdActual = null;
                                                let oInsumo;
                                                if (oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId) {
                                                    oInsumo = aInsumos.find(itm=>itm.estructuraRecetaInsumoIdAntiguo === oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId);
                                                    if (oInsumo) {
                                                        estructuraRecetaInsumoIdActual = oInsumo.estructuraRecetaInsumoIdActual;
                                                    }
                                                }

                                                // PARA SETEAR EL ID DE LA TABLA MD_ES_PASO
                                                let mdEstructuraPasoIdActual = null;
                                                let oPaso;
                                                if (oProcesoMenor.pasoId_mdEstructuraPasoId) {
                                                    oPaso = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oProcesoMenor.pasoId_mdEstructuraPasoId);
                                                    if (oPaso) {
                                                        mdEstructuraPasoIdActual = oPaso.mdEstructuraPasoIdActual;
                                                    }
                                                }
                                                let oProcesoMenorObj = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo: true,
                                                    mdEstructuraPasoInsumoPasoId: mdEstructuraPasoInsumoPasoIdActual,
                                                    mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                                    estructuraId_estructuraId: oProcesoMenor.estructuraId_estructuraId,
                                                    mdId_mdId: oParamMaster.mdId,
                                                    pasoId_mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                                    pasoHijoId_pasoId : oProcesoMenor.pasoHijoId_pasoId !== null ? oProcesoMenor.pasoHijoId_pasoId : null,
                                                    tipoDatoId_iMaestraId : oProcesoMenor.tipoDatoId_iMaestraId,
                                                    estructuraRecetaInsumoId_estructuraRecetaInsumoId : oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId !== null ? estructuraRecetaInsumoIdActual : null,
                                                    etiquetaId_etiquetaId: oProcesoMenor.etiquetaId_etiquetaId,
                                                    mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                                    mdEstructuraPasoInsumoPasoIdAct: mdEstructuraPasoInsumoPasoIdActual,
                                                    orden : oProcesoMenor.orden,
                                                    valorInicial : oProcesoMenor.valorInicial,
                                                    valorFinal : oProcesoMenor.valorFinal,
                                                    margen : oProcesoMenor.margen,
                                                    cantidadInsumo : oProcesoMenor.cantidadInsumo,
                                                    decimales : oProcesoMenor.decimales,
                                                    estadoCC : oProcesoMenor.estadoCC,
                                                    estadoMov : oProcesoMenor.estadoMov,
                                                    genpp : oProcesoMenor.genpp,
                                                    edit : oProcesoMenor.edit,
                                                    tab : oProcesoMenor.tab,
                                                    formato : oProcesoMenor.formato,
                                                    colorHex : oProcesoMenor.colorHex,
                                                    colorRgb : oProcesoMenor.colorRgb,
                                                    flagModif : oProcesoMenor.flagModif,
                                                    Component : oProcesoMenor.Component,
                                                    Matnr : oProcesoMenor.Matnr,    
                                                    Maktx : oProcesoMenor.Maktx,    
                                                    CompUnit : oProcesoMenor.CompUnit,
                                                    tipoDatoIdAnterior_iMaestraId: oProcesoMenor.tipoDatoId_iMaestraId,
                                                    aFormula : oProcesoMenor.aFormula.results
                                                }
                                                oParam.aPasoInsumoPaso.push(oProcesoMenorObj);
                                            }

                                            for await (const oPasoInsumoPaso of oParam.aPasoInsumoPaso) {
                                                if (oPasoInsumoPaso.aFormula.length > 0) {
                                                    for await (const oFormula of oPasoInsumoPaso.aFormula) {
                                                    // oPaso.aFormula.forEach(function (oFormula) {
                                                        oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                                        oFormula.fechaRegistro = new Date();
                                                        oFormula.activo = true;
                                                        oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                                        oFormula.usuarioActualiza = null;
                                                        oFormula.fechaActualiza = null;
                                                        oFormula.mdId_mdId = oParamMaster.mdId;

                                                        let oPasoInsumoPasoActualPadre = aPasosInsumosPasos.find(itm=>itm.mdEstructuraPasoInsumoPasoIdAntiguo === oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId);
                                                        if (oPasoInsumoPasoActualPadre) {
                                                            oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = oPasoInsumoPasoActualPadre.mdEstructuraPasoInsumoPasoIdActual;
                                                        }
                                                        if (oFormula.esPaso) {
                                                            let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                            if (oPasoActualFormula) {
                                                                oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                            }
                                                        }
                                                        aFormulaGeneral.aFormula.push(oFormula);
                                                    }
                                                }
                                                oPasoInsumoPaso.aFormula = [];
                                            }
                                        }

                                        //AGREGAMOS LAS ESPECIFICACIONES LA ESTRUCTURA
                                        if (oEstructura.aEspecificacion.results.length > 0) {
                                            oEstructura.aEspecificacion.results.forEach(async function (oEspecificacion) {
                                                let oEspecificacionObj = {
                                                    usuarioRegistro : oInfoUsuario.data.usuario,
                                                    fechaRegistro : new Date(),
                                                    activo : true,
                                                    mdEstructuraEspecificacionId : util.onGetUUIDV4(),
                                                    mdEstructuraId_mdEstructuraId : oParam.mdEstructuraId,
                                                    estructuraId_estructuraId : oEspecificacion.estructuraId_estructuraId,
                                                    mdId_mdId : oParamMaster.mdId,
                                                    ensayoPadreSAP: oEspecificacion.ensayoPadreSAP,
                                                    ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                                    ensayoHijo : oEspecificacion.ensayoHijo,
                                                    especificacion: oEspecificacion.especificacion,
                                                    tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                                    valorInicial : oEspecificacion.valorInicial,
                                                    valorFinal : oEspecificacion.valorFinal,
                                                    margen : oEspecificacion.margen,
                                                    decimales : oEspecificacion.decimales,
                                                    orden : oEspecificacion.orden,
                                                    Merknr : oEspecificacion.Merknr
                                                }
                                                oParam.aEspecificacion.push(oEspecificacionObj);
                                            });
                                        }
                                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oParam);
                                    }
                                }
                                if (aFormulaGeneral.aFormula.length > 0) {
                                    await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", aFormulaGeneral);
                                }
                                await oThatConf.onSaveCantidadRm();
                                BusyIndicator.hide();
                                await oThat.onGetDataInitial();
                                oThatConf.onCancelEditarRM();
                                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage49"));
                            }); 
                        }
                    },
                });
            },

            // MENSAJE GENERAR PREDECESORES EDITAR RM
            onGenerarPredecesores: function () {
                MessageBox.warning("¿Desea generar Predecesores?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            BusyIndicator.show(0);
                            let oContextDatos = oThat.getView().getModel("asociarDatos").getData().aEstructura.results;
                            let oContextEstructuras = oThat.getView().getModel("listMdEstructuraGeneral").getData();
                            oContextEstructuras.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            let oContextFinal = oContextEstructuras.filter(itm => (itm.tipoEstructuraId === sIdTipoEstructuraCuadro && itm.descripcion_est !== "CONDICIONES AMBIENTALES") || itm.tipoEstructuraId === sIdTipoEstructuraProceso || itm.tipoEstructuraId === sIdTipoEstructuraFirmas);
                            for await (const obj of oContextFinal) {
                                if (obj.tipoEstructuraId === sIdTipoEstructuraCuadro || obj.tipoEstructuraId === sIdTipoEstructuraProceso || obj.tipoEstructuraId === sIdTipoEstructuraFirmas) {
                                    if (obj.tipoEstructuraId === sIdTipoEstructuraProceso) {
                                        let oObjEstructura = oContextDatos.find(itm=>itm.mdEstructuraId === obj.mdEstructuraId);
                                        let aEtiquetasEstructura    = oObjEstructura.aEtiqueta.results;
                                        let aPasosEstructura        = oObjEstructura.aPaso.results;
                                        aEtiquetasEstructura.sort(function (a, b) {
                                            return a.orden - b.orden;
                                        });
                                        for await (const oEtiquetaEstructura of aEtiquetasEstructura) {
                                            let aPasosEtiqueta = aPasosEstructura.filter(itm=>itm.pasoId.etiquetaId_etiquetaId === oEtiquetaEstructura.etiquetaId_etiquetaId);
                                            aPasosEtiqueta.sort(function (a, b) {
                                                return a.orden - b.orden;
                                            });
                                            for await (const oPasoEtiqueta of aPasosEtiqueta) {
                                                
                                                        let oParam = {
                                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                                            fechaActualiza: new Date(),
                                                            depende: sLastPredecesorCodigo,
                                                            dependeMdEstructuraPasoId: sLastIdPaso
                                                        }
                                                        sLastPredecesorCodigo = (oPasoEtiqueta.pasoId.codigo).toString();
                                                        sLastIdPaso = oPasoEtiqueta.mdEstructuraPasoIdDepende;
                                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oParam, oPasoEtiqueta.mdEstructuraPasoId);
                                                
                                            }  
                                        }
                                    } else {
                                        let oObjEstructura = oContextDatos.find(itm=>itm.mdEstructuraId === obj.mdEstructuraId);
                                        let aPasosEstructura = oObjEstructura.aPaso.results;
                                        aPasosEstructura.sort(function (a, b) {
                                            return a.orden - b.orden;
                                        });
                                        for await (const oPasoEstructura of aPasosEstructura) {
                                            let oParam = {
                                                usuarioActualiza: oInfoUsuario.data.usuario,
                                                fechaActualiza: new Date(),
                                                depende: sLastPredecesorCodigo,
                                                dependeMdEstructuraPasoId: sLastIdPaso
                                            }
                                            sLastPredecesorCodigo = (oPasoEstructura.pasoId.codigo).toString();
                                            sLastIdPaso = oPasoEstructura.mdEstructuraPasoIdDepende;
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oParam, oPasoEstructura.mdEstructuraPasoId);
                                        }
                                    }
                                }    
                            }
                           await oThat._updateModelRest();
                            // await oThat.onGetDataEstructuraMD();
                            // await oThat.onCreateModelTree();
                            // await oThat.onCreateModelTreeProcess();
                            BusyIndicator.hide();
                            MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage50"));
                        }
                    }
                });
            },
           
            // MENSAJE ACTUALIZAR RM EN LINEA EDITAR RM
            onGenerarActualizarEnLinea: async function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let sFilterRMDOP = [];
                    sFilterRMDOP.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    sFilterRMDOP.push(new Filter("estadoIdRmd_iMaestraId", "NE", null));
                    var aRMDOP = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD", sFilterRMDOP);
                    if (aRMDOP.results.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat,"msgActualizacionLineaOpValdacion"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    var sFilter = [];
                    sFilter.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    sFilter.push(new Filter("flagModif", "EQ", true));
                    var aPasosModificados = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "MD_ES_PASO", sFilter);
                    var aPasosModificadosPIP = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", sFilter);
                    if (aPasosModificados.results.length === 0 && aPasosModificadosPIP.results.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage53"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage51"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose:async function (sAction) {
                            if (sAction === "OK") {
                                var sFilterRMD = [];
                                sFilterRMD.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                                sFilterRMD.push(new Filter("estadoIdRmd_iMaestraId", "NE", sEstadoCerrado));
                                var aRMD = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD", sFilterRMD);
                                if (aRMD.results.length > 0) {
                                    for await (const oItemRmd of aRMD.results) {
                                        for await (const oItem of aPasosModificados.results) {
                                            var aPasos = [];
                                            aPasos.push(new Filter("mdEstructuraPasoIdDepende", "EQ", oItem.mdEstructuraPasoIdDepende));
                                            aPasos.push(new Filter("rmdId_rmdId", "EQ", oItemRmd.rmdId));
                                            var aPasosRMD = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD_ES_PASO", aPasos);
                                            for await (const itm of aPasosRMD.results) {
                                                if (itm.mdEstructuraPasoIdDepende === oItem.mdEstructuraPasoId) {
                                                    var oData = {
                                                        orden: oItem.orden,
                                                        valorInicial: oItem.valorInicial,
                                                        valorFinal: oItem.valorFinal,
                                                        margen: oItem.margen,
                                                        decimales: oItem.decimales,
                                                        depende: oItem.depende,
                                                        dependeRmdEstructuraPasoId:oItem.dependeMdEstructuraPasoId,
                                                        estadoCC: oItem.estadoCC,
                                                        estadoMov: oItem.estadoMov,
                                                        pmop: oItem.pmop,
                                                        genpp: oItem.genpp,
                                                        edit: oItem.edit,
                                                        rpor: oItem.rpor,
                                                        vb: oItem.vb,
                                                        formato: oItem.formato,
                                                        imagen: oItem.imagen,
                                                        tipoDatoId_iMaestraId: oItem.tipoDatoId_iMaestraId,
                                                        colorHex: oItem.colorHex,
                                                        colorRgb: oItem.colorRgb,
                                                    }
                                                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "RMD_ES_PASO", oData, itm.rmdEstructuraPasoId);
                                                }
                                            }
                                            
                                            var oDataPaso = {
                                                flagModif: false
                                            }
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oDataPaso, oItem.mdEstructuraPasoId);
                                        }
                                        for await (const oItem of aPasosModificadosPIP.results) {
                                            var aPasos = [];
                                            aPasos.push(new Filter("mdEstructuraPasoInsumoPasoIdAct", "EQ", oItem.mdEstructuraPasoInsumoPasoIdAct));
                                            var aPasosPIPRMD = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD_ES_PASO_INSUMO_PASO", aPasos);
                                            for await (const itm of aPasosPIPRMD.results) {
                                                if (itm.mdEstructuraPasoInsumoPasoIdAct === oItem.mdEstructuraPasoInsumoPasoId) {
                                                    var oData = {
                                                        valorInicial: oItem.valorInicial,
                                                        valorFinal: oItem.valorFinal,
                                                        margen: oItem.margen,
                                                        decimales: oItem.decimales,
                                                        estadoCC: oItem.estadoCC,
                                                        estadoMov: oItem.estadoMov,
                                                        genpp: oItem.genpp,
                                                        tipoDatoId_iMaestraId: oItem.tipoDatoId_iMaestraId
                                                    }
                                                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "RMD_ES_PASO_INSUMO_PASO", oData, itm.rmdEstructuraPasoInsumoPasoId);
                                                }
                                            }
                                            
                                            var oDataPaso = {
                                                flagModif: false
                                            }
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oDataPaso, oItem.mdEstructuraPasoInsumoPasoId);
                                        }
                                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage52"));
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                } else {
                                    for await (const oItem of aPasosModificados.results) {
                                        var oDataPaso = {
                                            flagModif: false
                                        }
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oDataPaso, oItem.mdEstructuraPasoId);
                                    }

                                    for await (const oItem of aPasosModificadosPIP.results) {
                                        var oDataPaso = {
                                            flagModif: false
                                        }
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oDataPaso, oItem.mdEstructuraPasoId);
                                    }
                                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoRMD"));
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            } else {
                                sap.ui.core.BusyIndicator.hide();
                            }
                        },
                    });
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            onGenerarConfiguracionInicial: function () {
                MessageBox.warning(
                    formatter.onGetI18nText(oThat,"txtMessage54"),
                    {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async function (sAction) {
                            if (sAction === "OK") {
                                BusyIndicator.show(0);
                                let oSelectedMD = oThat.getView().getModel("asociarDatos").getData();
                                let aSelectedEstructuras = oSelectedMD.aEstructura.results.filter(filterEstructura=>filterEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro || 
                                                                                                                filterEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCondAmbiente || 
                                                                                                                filterEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso);
                                for await (const oEstructura of aSelectedEstructuras){
                                    if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro) { //CASE CUADRO
                                        for await (const oPaso of oEstructura.aPaso.results) {
                                            let oObjUpd = {
                                                usuarioActualiza              : oInfoUsuario.data.usuario,
                                                fechaActualiza                : new Date(),
                                                tipoDatoId_iMaestraId         : sIdTipoDatoVerificacionCheck,
                                                decimales                     : null,
                                                valorInicial                  : null,
                                                valorFinal                    : null,
                                                margen                        : null,
                                                tipoDatoIdAnterior_iMaestraId : sIdTipoDatoVerificacionCheck
                                            }
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                        };
                                    } else if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCondAmbiente) { //CASE CONDICION AMBIENTAL

                                        //for this escenari i have 3 case
                                        for await (const oPaso of oEstructura.aPaso.results) {
                                            let oObjUpd = {
                                                usuarioActualiza              : oInfoUsuario.data.usuario,
                                                fechaActualiza                : new Date(),
                                                tipoDatoId_iMaestraId         : sIdTipoDatoRango,
                                                valorInicial                  : null,
                                                valorFinal                    : null,
                                                margen                        : null,
                                                tipoDatoIdAnterior_iMaestraId : sIdTipoDatoRango
                                            }
                                            // await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            if(formatter.isNotAvailable(oPaso.decimales) && oPaso.pasoId.descripcion.toUpperCase().includes("TEMPERATURA")) {
                                            // if(!formatter.onFormatterUndefined(oPaso.decimales) && oPaso.pasoId.descripcion.indexOf("TEMPERATURA", 0) !== -1) {
                                                // let oObjUpd = {
                                                //     usuarioActualiza    : oInfoUsuario.data.usuario,
                                                //     fechaActualiza      : new Date(),
                                                //     decimales           : 1
                                                // }
                                                oObjUpd.decimales = 1;
                                            }
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);   
                                        };

                                    } else if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) { //CASE PROCESO
                                        for await (const oPaso of oEstructura.aPaso.results) {
                                            let aTienePM = oEstructura.aPasoInsumoPaso.results.filter(itm=>itm.pasoId_mdEstructuraPasoId === oPaso.mdEstructuraPasoId); //find proceso menor
                                            let bTienePM;
                                            if (aTienePM.length > 0 ){
                                                bTienePM = true;
                                            } else {
                                                bTienePM = false;
                                            }
                                            // if (!formatter.onFormatterUndefined(oPaso.edit) && formatter.onFormatterUndefined(oPaso.rpor) && bTienePM) {
                                            if (formatter.isNotAvailable(oPaso.edit) && !formatter.isNotAvailable(oPaso.rpor) && bTienePM) { //case 1
                                                let oObjUpd = {
                                                    usuarioActualiza              : oInfoUsuario.data.usuario,
                                                    fechaActualiza                : new Date(),
                                                    tipoDatoId_iMaestraId         : sIdTipoDatoRealizadoPor,
                                                    decimales                     : null,
                                                    valorInicial                  : null,
                                                    valorFinal                    : null,
                                                    margen                        : null,
                                                    tipoDatoIdAnterior_iMaestraId : sIdTipoDatoRealizadoPor
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            }

                                            if (formatter.isNotAvailable(oPaso.edit) && !formatter.isNotAvailable(oPaso.vb) && bTienePM) {//case 2
                                            // if (!formatter.onFormatterUndefined(oPaso.edit) && formatter.onFormatterUndefined(oPaso.vb) && bTienePM) {
                                                let oObjUpd = {
                                                    usuarioActualiza              : oInfoUsuario.data.usuario,
                                                    fechaActualiza                : new Date(),
                                                    tipoDatoId_iMaestraId         : sIdTipoDatoVistoBueno,
                                                    decimales                     : null,
                                                    valorInicial                  : null,
                                                    valorFinal                    : null,
                                                    margen                        : null,
                                                    tipoDatoIdAnterior_iMaestraId : sIdTipoDatoVistoBueno
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            }

                                            // if (formatter.onFormatterUndefined(oPaso.edit) && formatter.onFormatterUndefined(oPaso.pasoId.tipoLapsoId_motivoLapsoId)) {
                                            if (!formatter.isNotAvailable(oPaso.edit) && !formatter.isNotAvailable(oPaso.pasoId.tipoLapsoId_motivoLapsoId)) {//case 3
                                                let oObjUpd = {
                                                    usuarioActualiza              : oInfoUsuario.data.usuario,
                                                    fechaActualiza                : new Date(),
                                                    tipoDatoId_iMaestraId         : sIdTipoDatoFechayHora,
                                                    decimales                     : null,
                                                    valorInicial                  : null,
                                                    valorFinal                    : null,
                                                    margen                        : null,
                                                    tipoDatoIdAnterior_iMaestraId : sIdTipoDatoFechayHora
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            }

                                            // if (oPaso.pasoId.etiquetaId.descripcion.indexOf("RENDIMIENTO", 0) !== -1 && oPaso.pasoId.descripcion.indexOf("CALCULO DE RENDIMIENTO", 0) !== -1) {
                                            // if (oPaso.pasoId.etiquetaId.descripcion.toUpperCase().includes("RENDIMIENTO") && oPaso.pasoId.descripcion.toUpperCase().includes("CALCULO DE RENDIMIENTO")) { //case 5
                                            //     let oObjUpd = {
                                            //         usuarioActualiza        : oInfoUsuario.data.usuario,
                                            //         fechaActualiza          : new Date(),
                                            //         tipoDatoId_iMaestraId   : sIdTipoDatoFormula,
                                            //         decimales               : null,
                                            //         valorInicial            : null,
                                            //         valorFinal              : null,
                                            //         margen                  : null
                                            //     }
                                            //     await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            // }

                                           
                                            if (oPaso.pasoId.etiquetaId.descripcion.toUpperCase().includes("RENDIMIENTO")) { //case 7
                                                // let oObjUpd = {
                                                //     usuarioActualiza    : oInfoUsuario.data.usuario,
                                                //     fechaActualiza      : new Date(),
                                                //     decimales           : 3
                                                // }
                                                let oObjUpd = {
                                                    usuarioActualiza        : oInfoUsuario.data.usuario,
                                                    fechaActualiza          : new Date(),
                                                    decimales               : 3
                                                
                                                }
                                                if(oPaso.pasoId.descripcion.toUpperCase().includes("CALCULO DE RENDIMIENTO")){ //case 5
                                                    oObjUpd.tipoDatoId_iMaestraId   = sIdTipoDatoFormula
                                                }

                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            }

                                            if (formatter.isNotAvailable(oPaso.decimales) && oPaso.pasoId.descripcion.toUpperCase().includes("TEMPERATURA")) { //case 6
                                                let oObjUpd = {
                                                    usuarioActualiza    : oInfoUsuario.data.usuario,
                                                    fechaActualiza      : new Date(),
                                                    decimales           : 1
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjUpd, oPaso.mdEstructuraPasoId);
                                            }

                                        }
                                        for await (const oPasoInsumoPaso of oEstructura.aPasoInsumoPaso.results) { // revisar de donde sale los insumos
                                            // preguntar a Marin
                                            if (formatter.onFormatterUndefined(oPasoInsumoPaso.estructuraRecetaInsumoId_estructuraRecetaInsumoId)) {
                                                let oObjUpd = {
                                                    usuarioActualiza              : oInfoUsuario.data.usuario,
                                                    fechaActualiza                : new Date(),
                                                    tipoDatoId_iMaestraId         : sTipoDatoNumero,
                                                    valorInicial                  : null,
                                                    valorFinal                    : null,
                                                    margen                        : null,
                                                    decimales                     : 3,
                                                    tipoDatoIdAnterior_iMaestraId : sTipoDatoNumero
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjUpd, oPasoInsumoPaso.mdEstructuraPasoInsumoPasoId);
                                            }

                                            if (formatter.onFormatterUndefined(oPasoInsumoPaso.edit) && formatter.onFormatterUndefined(oPasoInsumoPaso.pasoHijoId.tipoLapsoId_motivoLapsoId)) { //case 3
                                                let oObjUpd = {
                                                    usuarioActualiza              : oInfoUsuario.data.usuario,
                                                    fechaActualiza                : new Date(),
                                                    tipoDatoId_iMaestraId         : sIdTipoDatoFechayHora,
                                                    decimales                     : null,
                                                    valorInicial                  : null,
                                                    valorFinal                    : null,
                                                    margen                        : null,
                                                    tipoDatoIdAnterior_iMaestraId : sIdTipoDatoFechayHora
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjUpd, oPasoInsumoPaso.mdEstructuraPasoInsumoPasoId);
                                            }
                                            if (!formatter.onFormatterUndefined(oPasoInsumoPaso.decimales) && oPasoInsumoPaso.pasoHijoId.descripcion.indexOf("TEMPERATURA", 0) !== -1) { //case 5
                                                let oObjUpd = {
                                                    usuarioActualiza    : oInfoUsuario.data.usuario,
                                                    fechaActualiza      : new Date(),
                                                    decimales           : 1
                                                }
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjUpd, oPasoInsumoPaso.mdEstructuraPasoInsumoPasoId);
                                            }    
                                        }
                                    }
                                };
                                // await oThat.onGetDataEstructuraMD();
                                // await oThat.onCreateModelTree();
                                // await oThat.onCreateModelTreeProcess();
                                await oThatConf._updateModelRestforContext()
                                BusyIndicator.hide();
                                MessageBox.success(
                                    formatter.onGetI18nText(oThat,"txtMessage55")
                                );
                            }
                        },
                    }
                );
            },

            // ACCION ABRIR FRAGMENT COPIAR RM DE EDITARRM
            onCopiarARM: function () {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                if (!this.oCopiarARM) {
                    this.oCopiarARM = sap.ui.xmlfragment(
                        "frgCopiarARM",
                        rootPath + ".view.fragment.editarRM.copiarARM",
                        this
                    );
                    oThat.getView().addDependent(this.oCopiarARM);
                }
                var obj = {
                    mdId: oDataSeleccionada.getData().mdId,
                    nivelTxt: oDataSeleccionada.getData().nivelTxt,
                    estadoIdRmd_iMaestraId: estadoIngresadoRMD
                }
                this.localModel.setProperty("/copyA", obj);

                this.oCopiarARM.open();
            },

            onCancelCopiarARM: function () {
                this.localModel.setProperty("/copyA", {});
                this.oCopiarARM.close();
            },

            // ACCION ABRIR FRAGMENT COPIAR RM EN EDITAR RM
            onCopiarDeRM: async function () {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                if (!this.oCopiarDeRM) {
                    this.oCopiarDeRM = sap.ui.xmlfragment(
                        "frgCopiarDeRM",
                        rootPath + ".view.fragment.editarRM.CopiarDeRM",
                        this
                    );
                    oThat.getView().addDependent(this.oCopiarDeRM);
                }
                this.localModel.setProperty("/filtroCopy/nivelTxt", oDataSeleccionada.getData().nivelTxt);
                var aFilters = [];
                aFilters.push(new Filter("nivelTxt", "EQ", oDataSeleccionada.getData().nivelTxt));
                aFilters.push(new Filter("mdId", "NE", oDataSeleccionada.getData().mdId));
                aFilters.push(new Filter("estadoIdRmd_iMaestraId", "NE", idEstadoRmdCancelado));
                var sExpand = "sucursalId,estadoIdRmd";
                var aListRMDCopy = await Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "MD", aFilters, sExpand);
                this.localModel.setProperty("/aListMDCopy", aListRMDCopy.results);
                this.oCopiarDeRM.open();
            },

            onCancelCopiarDeRM: function () {
                sap.ui.core.Fragment.byId("frgCopiarDeRM", "idTBCopyDe").removeSelections();
                this.localModel.setProperty("/filtroCopy/codigo", "");
                this.localModel.setProperty("/filtroCopy/descripcion", "");
                this.localModel.setProperty("/filtroCopy/sucursalId_iMaestraId", "");
                this.oCopiarDeRM.close();
            },

            // PRINT BUTTON
            onPrint: function () {
                // // window.print();
                // if (!this.oOpenPDF) {
                //     this.oOpenPDF = sap.ui.xmlfragment(
                //         "frgVerPDF",
                //         rootPath + ".view.fragment.editarRM.OpenViewPDF",
                //         this
                //     );
                //     oThat.getView().addDependent(this.oOpenPDF);
                // }

                // this.oOpenPDF.open();
                oThat.tratarInformacion();
            },

            onCancelVerPDF: function () {
                this.oOpenPDF.close();
            },

            // onExportXLS: function () {
            //     MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage56"));
            // },

            // AGREGAR NUEVA ESTRUCTURA EN -- editarRM
            onAddNewEditRM: function () {
                if (!this.oAddNewEditRM) {
                    this.oAddNewEditRM = sap.ui.xmlfragment(
                        "frgAdicNewMdEstructure",
                        rootPath + ".view.fragment.editarRM.AdicNuevaEstructura",
                        this
                    );
                    oThat.getView().addDependent(this.oAddNewEditRM);
                }
                this.oAddNewEditRM.open();
            },

            onAddNewEstructure: function () {
                sap.ui.core.BusyIndicator.show(0);
                oThatConf.onCleanFilterEstructura();
                oThatConf.onGetEstructura().then(function (oListEstructura, oError) {
                    let aEstructuras = oListEstructura.results;
                    let oListMdEstructura = oThat.getView().getModel("listMdEstructura");
                    let aEstructuresNoAsign = [];

                    aEstructuras.forEach(function (element) {
                        let bFlag = true;
                        oListMdEstructura.getData().forEach(function (item) {
                            if (element.estructuraId === item.estructuraId_estructuraId && element.activo === true) {
                                bFlag = false;
                                return false;
                            }
                        });

                        if (bFlag) {
                            aEstructuresNoAsign.push(element);
                        }
                    });

                    aEstructuresNoAsign.sort(function (a, b) {
                        return a.codigo - b.codigo;
                    });

                    let oModelEst = new JSONModel(aEstructuresNoAsign);
                    oModelEst.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEst, "aListEstructura");
                    oThatConf.onAddNewEditRM();
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThatConf.onErrorMessage(oError, "errorSave");
                })
            },

            onCanceloAddNewEditRM: function () {
                oThatConf.onCleanFilterEstructura();
                // oThatConf.onRestoreFiltersEstructureToMd();
                if(this.oAddCompareRM)
                    this.oAddCompareRM.close();
                if(this.oAddNewEditRM)
                    this.oAddNewEditRM.close();
            },
            onCancelCompare: function () {
                // oThatConf.onCleanFilterEstructura();
                // oThatConf.onRestoreFiltersEstructureToMd();
                if(this.oAddCompareRM)
                    this.oAddCompareRM.close();
                // if(this.oAddNewEditRM)
                //     this.oAddNewEditRM.close();
            },

            // ACCION ABRIR FRAGMENT ADICIONAR PASOS EDITAR RM
            onAddEditarRM: function () {
                if (!this.oAddEditarRM) {
                    this.oAddEditarRM = sap.ui.xmlfragment(
                        "frgAdicNewMdPasos",
                        rootPath + ".view.fragment.editarRM.AdicPasos",
                        this
                    );
                    oThat.getView().addDependent(this.oAddEditarRM);
                }

                this.oAddEditarRM.open();
            },

            onCancelAddEditarRM: function () {
                sTipoProcess = false;
                oThatConf.onCleanFilterPasos();
                this.oAddEditarRM.close();
            },

            // ACCION ABRIR FRAGMENT ADICIONAR EQUIPOS EDITAR RM
            onAddEquipoEditRM: function () {
                if (!this.oAddEquipoEditRM) {
                    this.oAddEquipoEditRM = sap.ui.xmlfragment(
                        "frgAdicNewMdEquipment",
                        rootPath + ".view.fragment.editarRM.AdicEquipo",
                        this
                    );
                    oThat.getView().addDependent(this.oAddEquipoEditRM);
                }

                this.oAddEquipoEditRM.open();
            },

            onCancelAddEquipoEditRM: function () {
                oThatConf.onCleanFilterEquipo();
                this.oAddEquipoEditRM.close();
            },

            onCleanFilterEquipo: function () {
                var oDataMdEsEquipment = oThat.getView().getModel("oDataFilterEquipoUtensilio");
                oDataMdEsEquipment.getData().codigo = "";
                oDataMdEsEquipment.getData().descript = "";
                oDataMdEsEquipment.getData().codGaci = "";
                oDataMdEsEquipment.getData().estado = "";
                oDataMdEsEquipment.refresh(true);
            },

            // ACCION ABRIR FRAGMENT ADICIONAR ETIQUETAS EDITAR RM
            onAddEtiquetaEditRM: function () {
                ;
                if (!this.oAddEtiquetaEditRM) {
                    this.oAddEtiquetaEditRM = sap.ui.xmlfragment(
                        "frgoAddEtiquetaEditRM",
                        rootPath + ".view.fragment.editarRM.AdicEtiq",
                        this
                    );
                    oThat.getView().addDependent(this.oAddEtiquetaEditRM);
                }

                this.oAddEtiquetaEditRM.open();
            },

            onCancelAddEtiquetaEditRM: function () {
                this.onCleanEtiquetaEditRM();
                this.oAddEtiquetaEditRM.close();
            },
            onCleanEtiquetaEditRM:function () {
                let info =  oThat.getView().getModel("oDataFilterEtiqueta");
                info.getData().descripcion="";
                info.refresh();
            },

            //ABRIR PROCEDIMIENTO TREE TABLE - editarRM --- Falta poner correctamente los colores para los insumos.
            onOpenProcedimiento: function (oEvent) {
                let path = oEvent.getParameters().rowContext.sPath;
                let Object = oThat.getView().getModel("listMdEstructuraGeneral").getProperty(path);
                let nCantidad = oThat.getView().getModel("listMdEstructuraGeneral").getData().length;
                if (Object.tipoEstructuraId === sIdTipoEstructuraFormula) {
                    let nPath = path.split("/")[1];
                    // $.each(Object.Posicion, function (k, v) {
                    //     if (v.cantidad_mde < v.codigo_est) {
                            // sap.ui.getCore().byId("frgEditRM--id_TreeSolped").addStyleClass("style1");
                            // let aFilas = sap.ui.getCore().byId("frgEditRM--id_TreeSolped").getRows();
                            // let oRows = aFilas[5];
                            // oRows.addStyleClass("style1");
                            // oRows = aFilas[6];
                            // oRows.addStyleClass("style1");
                            // oRows = aFilas[7];
                            // oRows.addStyleClass("style1");
                            // oRows = aFilas[8];
                            // oRows.addStyleClass("style1");
                            // for (var j = 0; j < aFilas.length; j++) {
                            //     let row = aFilas[j];
                                // if (row.getCells()[0].getBinding("text").oValue === text) {
                                    //row.addStyleClass("sapUiTableRowSel");
                                    // oRows.addStyleClass("style1");
                                // }
                            // }
                    //     }
                    // });
                }
                if (Object.tipoEstructuraId === sIdTipoEstructuraProceso) {
                    let oModel = new JSONModel(Object);
                    oThat.getView().setModel(oModel, "headerAddEstructura");
                    var idRow = oEvent.getParameters().rowIndex;
                    sap.ui.getCore().byId("frgEditRM--id_TreeSolped").collapse(idRow);
                    oThat.onCreateModelTreeProcess();
                    this.onOpenProcFrag();
                }
            },

            // ABRIR PROCEDIMIENTO FRAGMENT -- editarRM
            onOpenProcFrag: function () {
                if (!this.oOpenProcFrag) {
                    this.oOpenProcFrag = sap.ui.xmlfragment(
                        "frgOpenProcFrag",
                        rootPath + ".view.fragment.editarRM.OpenProce",
                        this
                    );
                    oThat.getView().addDependent(this.oOpenProcFrag);
                }

                this.oOpenProcFrag.open();
            },

            onCanceloOpenProcFrag: function () {
                oThat.onGetDataEstructuraMD();
                oThat.onCreateModelTree();
                this.oOpenProcFrag.close();
            },        

            // Mensajes de error.
            /**
             * @param {*} oError Objeto con el mensaje de error.
             * @param {*} textoI18n String con el i18n para mostrar como mensaje.
             */
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
                                oThatConf.onErrorMessage("", "errorSave");
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
                    oThatConf.onErrorMessage(oErrorT, "errorSave");
                }
            },

            // Buscar por el filtro las estructuras para asignar al MD.
            onSearchMdEstructure: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgAdicNewMdEstructure--idTblMdEstructures");
                    var oDataFilter = oThat.getView().getModel("oDataMdEstructura");
                    var aFilter = [];
                    if (oDataFilter.getData().description)
                        aFilter.push(
                            new Filter(
                                "descripcion",
                                FilterOperator.Contains,
                                oDataFilter.getData().description
                            )
                        );

                    aFilter.push(new Filter("activo", FilterOperator.EQ, true));
                    // if (estadoFilter.isValid) {
                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            onConfirmEstructureToMd: function () {
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdEstructure"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            oThatConf.onAsignEstructureToMd().then(async function (oDataRegister, oError) {
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                oThatConf.onCanceloAddNewEditRM();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEstructure"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            onAsignEstructureToMd: function () {
                return new Promise(function (resolve, reject) {
                    let oTblMdEstructures = sap.ui.getCore().byId("frgAdicNewMdEstructure--idTblMdEstructures"),
                        aPaths = oTblMdEstructures._aSelectedPaths,
                        oListMdEstructura = oThat.getView().getModel("aListEstructura"),
                        aListDataMdEstructura = oListMdEstructura.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        aListMdEstructura = oThat.getView().getModel("listMdEstructura"),
                        formula = false, countFormulas = 0;

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDEstructureNoData"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aMdDataEstructure = {
                        mdId: oMDSeleccionada.getData().mdId,
                        estadoIdRmd_iMaestraId: oMDSeleccionada.getData().estadoIdRmd_iMaestraId,
                        aEstructura: []
                    },

                        dDate = new Date();

                    $.each(aPaths, function (k, v) {
                        if(aListDataMdEstructura[v.split("/")[1]].tipoEstructuraId_iMaestraId === objTipoEstructuraIMaestro.Formula){
                            countFormulas++;
                            var oFindFormula = oMDSeleccionada.getData().aEstructura.results.find(e=>e.estructuraId.tipoEstructuraId_iMaestraId === objTipoEstructuraIMaestro.Formula);
                            oFindFormula ? formula = true : null;
                        }

                        aMdDataEstructure.aEstructura.push(
                            {
                                terminal: null,
                                fechaRegistro: dDate,
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaActualiza: dDate,
                                usuarioActualiza: null,
                                activo: true,
                                mdEstructuraId: util.onGetUUIDV4(),
                                mdId_mdId: oMDSeleccionada.getData().mdId,
                                estructuraId_estructuraId: aListDataMdEstructura[v.split("/")[1]].estructuraId,
                                orden: aListMdEstructura.getData().length + k + 1
                            }
                        );
                    });
                    if(formula){
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDEstructureFormula"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    if(countFormulas > 1){
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDEstructure1Formula"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    const sId = oMDSeleccionada.getData().mdId;

                    Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD", aMdDataEstructure, sId).then(function (oDataSaved) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            onDropEtiqueta: async function (oEvent) {
                BusyIndicator.show(0);
                var aModelTree = oThat.getView().getModel("listMdEsEtiquetaGeneral");
                var itemsTree = aModelTree.oData;
                var sDropPosition = oEvent.getParameter("dropPosition");
                var oDrag = oEvent.getParameter("draggedControl").oBindingContexts.listMdEsEtiquetaGeneral.sPath;
                var ordenInicio = parseInt(oDrag.substring(oDrag.length - 1, oDrag.length));
                var pathInicio = oDrag.substring(0, oDrag.length - 1);
                var oDrop = oEvent.getParameter("droppedControl").oBindingContexts.listMdEsEtiquetaGeneral.sPath;
                var ordenLlegada = parseInt(oDrop.substring(oDrop.length - 1, oDrop.length));
                var pathLlegada = oDrop.substring(0, oDrop.length - 1);
                if (ordenInicio !== ordenLlegada) {
                    if (pathInicio === pathLlegada) {
                        var flag = true;
                        var pertenecePosicion = Boolean;
                        if (pathInicio === "/") {
                            flag = true;
                            pertenecePosicion = false;
                        } else {
                            var tipoEstr = itemsTree[oDrag.substring(1, 2)].tipoEstructuraId;
                            flag = ordenInicio !== 0 && ordenLlegada !== 0 && tipoEstr === sIdTipoEstructuraProceso ? true : false;
                            pertenecePosicion = true;
                        }
                        if (flag) {
                            if (pertenecePosicion) {
                                var itemsTreePath = itemsTree[oDrag.substring(1, 2)].Posicion;
                                ordenInicio = parseInt(itemsTree[oDrag.substring(1, 2)].Posicion[ordenInicio].orden);
                                ordenLlegada = parseInt(itemsTree[oDrag.substring(1, 2)].Posicion[ordenLlegada].orden);
                            } else {
                                var itemsTreePath = itemsTree;
                                ordenInicio = ordenInicio + 1;
                                ordenLlegada = ordenLlegada + 1;
                            }
                            if (sDropPosition === "After") {
                                if (ordenInicio < ordenLlegada) {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) <= ordenLlegada);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) - 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oParam, e.mdEsEtiquetaId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oItm, itm.mdEsEtiquetaId);
                                    }
                                } else {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenLlegada && parseInt(item.orden) < ordenInicio);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) + 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oParam, e.mdEsEtiquetaId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada + 1);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada + 1
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oItm, itm.mdEsEtiquetaId);
                                    }
                                }
                            } else if (sDropPosition === "Before") {
                                if (ordenInicio < ordenLlegada) {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) < ordenLlegada);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) - 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oParam, e.mdEsEtiquetaId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada - 1);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada - 1
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oItm, itm.mdEsEtiquetaId);
                                    }
                                } else {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) >= ordenLlegada && parseInt(item.orden) < ordenInicio);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) + 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oParam, e.mdEsEtiquetaId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", oItm, itm.mdEsEtiquetaId);
                                    }
                                }
                            }
                            itemsTreePath.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            aModelTree.refresh(true);
                        }
                    }
                }
                BusyIndicator.hide();
            },

            onDrop: async function (oEvent) {
                BusyIndicator.show(0);
                var aModelTree = oThat.getView().getModel("listMdEstructuraGeneral");
                var itemsTree = aModelTree.oData;
                var sDropPosition = oEvent.getParameter("dropPosition");
                var oDrag = oEvent.getParameter("draggedControl").oBindingContexts.listMdEstructuraGeneral.sPath;
                var ordenInicio = parseInt(oDrag.substring(oDrag.length - 1, oDrag.length));
                var pathInicio = oDrag.substring(0, oDrag.length - 1);
                var oDrop = oEvent.getParameter("droppedControl").oBindingContexts.listMdEstructuraGeneral.sPath;
                var ordenLlegada = parseInt(oDrop.substring(oDrop.length - 1, oDrop.length));
                var pathLlegada = oDrop.substring(0, oDrop.length - 1);
                if (ordenInicio !== ordenLlegada) {
                    if (pathInicio === pathLlegada) {
                        var flag = true;
                        var pertenecePosicion = Boolean;
                        if (pathInicio === "/") {
                            flag = true;
                            pertenecePosicion = false;
                        } else {
                            var tipoEstr = itemsTree[oDrag.substring(1, 2)].tipoEstructuraId;
                            flag = ordenInicio !== 0 && ordenLlegada !== 0 && tipoEstr === sIdTipoEstructuraCuadro ? true : false;
                            pertenecePosicion = true;
                        }
                        if (flag) {
                            if (pertenecePosicion) {
                                var itemsTreePath = itemsTree[oDrag.substring(1, 2)].Posicion;
                            } else {
                                var itemsTreePath = itemsTree;
                                ordenInicio = ordenInicio + 1;
                                ordenLlegada = ordenLlegada + 1;
                            }
                            if (sDropPosition === "After") {
                                if (ordenInicio < ordenLlegada) {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) <= ordenLlegada);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) - 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oParam, e.mdEstructuraId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oItm, itm.mdEstructuraId);
                                    }
                                } else {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenLlegada && parseInt(item.orden) < ordenInicio);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) + 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oParam, e.mdEstructuraId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada + 1);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada + 1
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oItm, itm.mdEstructuraId);
                                    }
                                }
                            } else if (sDropPosition === "Before") {
                                if (ordenInicio < ordenLlegada) {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) < ordenLlegada);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) - 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oParam, e.mdEstructuraId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada - 1);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada - 1
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oItm, itm.mdEstructuraId);
                                    }
                                } else {
                                    var itemsTreeModif = itemsTreePath.filter(item => parseInt(item.orden) >= ordenLlegada && parseInt(item.orden) < ordenInicio);
                                    itemsTreeModif.forEach(async function (e) {
                                        e.orden = parseInt(e.orden) + 1;
                                        var oParam = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            orden: e.orden
                                        }
                                        if (pertenecePosicion) {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oParam, e.mdEstructuraPasoId);
                                        } else {
                                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oParam, e.mdEstructuraId);
                                        }
                                    });
                                    aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                    var itm = aModelTree.getProperty(oDrag);
                                    var oItm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: ordenLlegada
                                    }
                                    if (pertenecePosicion) {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", oItm, itm.mdEstructuraPasoId);
                                    } else {
                                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", oItm, itm.mdEstructuraId);
                                    }
                                }
                            }
                            itemsTreePath.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            aModelTree.refresh(true);
                        }
                    }
                }
                BusyIndicator.hide();
            },

            onExportXLS: function () {
                let itemsTree = oThat.getView().getModel("listMdEstructuraGeneral").getData();
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let aListaEstructurasExcel = oDataSeleccionada.getData().aEstructura.results.filter(item=>item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro || item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso);
                aListaEstructurasExcel.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                
                var oRowBinding = [];

                aListaEstructurasExcel.forEach(function (oEstructura) {
                    if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro) {
                        oRowBinding.push({ "cabecera": oEstructura.estructuraId.descripcion });
                        oEstructura.aPaso.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                        oEstructura.aPaso.results.forEach(function(oPaso){
                            let oItem = {
                                orden: oPaso.orden,
                                depende: oPaso.depende,
                                codigo: oPaso.pasoId.codigo,
                                descripcion: oPaso.pasoId.descripcion,
                                tipoDatoId: oPaso.tipoDatoId.contenido,
                                procesoMenor: '',
                                valorInicial: oPaso.valorInicial,
                                valorFinal: oPaso.valorFinal,
                                decimales: oPaso.decimales,
                                estadoCC: oPaso.estadoCC ? 'SI' : 'NO',
                                estadoMov: oPaso.estadoMov ? 'SI' : 'NO'
                            };
                            oRowBinding.push(oItem);
                        });
                    } else if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) {
                        oEstructura.aEtiqueta.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                        oEstructura.aEtiqueta.results.forEach(function(oEtiqueta){
                            oRowBinding.push({ "cabecera": oEstructura.estructuraId.descripcion + '-' + oEtiqueta.etiquetaId.descripcion });
                            let aPasosEtiqueta = oEstructura.aPaso.results.filter(itm=>itm.pasoId.etiquetaId_etiquetaId === oEtiqueta.etiquetaId_etiquetaId);
                            aPasosEtiqueta.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            aPasosEtiqueta.forEach(function(oPasoEtiqueta){
                                let oItem = {
                                    orden: oEstructura.orden + '.' + oEtiqueta.orden + '.' + oPasoEtiqueta.orden,
                                    depende: oPasoEtiqueta.depende,
                                    codigo: oPasoEtiqueta.pasoId.codigo,
                                    descripcion: oPasoEtiqueta.pasoId.descripcion,
                                    tipoDatoId: oPasoEtiqueta.tipoDatoId.contenido,
                                    procesoMenor: oPasoEtiqueta.pmop ? 'SI' : 'NO',
                                    valorInicial: oPasoEtiqueta.valorInicial,
                                    valorFinal: oPasoEtiqueta.valorFinal,
                                    decimales: oPasoEtiqueta.decimales,
                                    estadoCC: oPasoEtiqueta.estadoCC ? 'SI' : 'NO',
                                    estadoMov: oPasoEtiqueta.estadoMov ? 'SI' : 'NO'
                                };
                                let aExistePasoMenor = oEstructura.aPasoInsumoPaso.results.filter(itm=>itm.pasoId_mdEstructuraPasoId === oPasoEtiqueta.mdEstructuraPasoId);
                                // if (aExistePasoMenor.length > 0) {
                                //     oItem.procesoMenor = 'SI';
                                // } else {
                                //     oItem.procesoMenor = 'NO'; 
                                // }
                                oRowBinding.push(oItem);
                                aExistePasoMenor.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
                                aExistePasoMenor.forEach(function(oPasoInsumoPaso){
                                    let codigo, descripcion, descrProcesoMenor;
                                    // if (oPasoEtiqueta.pmop) {
                                    //     descrProcesoMenor = 'Proceso Menor Opcional: ';
                                    // } else {
                                        descrProcesoMenor = 'Proceso Menor: ';
                                    // }
                                    if (oPasoInsumoPaso.estructuraRecetaInsumoId_estructuraRecetaInsumoId) {
                                        codigo = oPasoInsumoPaso.estructuraRecetaInsumoId.Component;
                                        descripcion = descrProcesoMenor + oPasoInsumoPaso.estructuraRecetaInsumoId.Maktx;
                                    } else {
                                        codigo = oPasoInsumoPaso.pasoHijoId !== null ? oPasoInsumoPaso.pasoHijoId.codigo : "";
                                        let cod = oPasoInsumoPaso.pasoHijoId !== null ? oPasoInsumoPaso.pasoHijoId.descripcion : "";   
                                        descripcion = descrProcesoMenor + cod;
                                    }
                                    let oItemPM = {
                                        orden: oEstructura.orden + '.' + oEtiqueta.orden + '.' + oPasoEtiqueta.orden + '.' + oPasoInsumoPaso.orden,
                                        depende: '',
                                        codigo: codigo,
                                        descripcion: descripcion,
                                        tipoDatoId: oPasoInsumoPaso.tipoDatoId.contenido,
                                        procesoMenor: '',
                                        valorInicial: oPasoInsumoPaso.valorInicial,
                                        valorFinal: oPasoInsumoPaso.valorFinal,
                                        decimales: oPasoInsumoPaso.decimales,
                                        estadoCC: oPasoInsumoPaso.estadoCC ? 'SI' : 'NO',
                                        estadoMov: oPasoInsumoPaso.estadoMov ? 'SI' : 'NO'
                                    };
                                    oRowBinding.push(oItemPM);
                                });
                            });
                        });    
                    }                 
                });

                console.log(oRowBinding);
                var data = [{
                    name: 'Descripción:',
                    description: oDataSeleccionada.getData().descripcion
                }, {
                    name: 'Estado:',
                    description: oDataSeleccionada.getData().estadoIdRmd.contenido
                }, {
                    name: 'Etapa:',
                    description: oDataSeleccionada.getData().nivelTxt
                }];

                const ws = XLSX.utils.json_to_sheet(data, {
                    origin: "C2"
                });
                XLSX.utils.sheet_add_json(ws, oRowBinding, { origin: "A7" });

                //TITULOS DE CABECERA
                ws["C2"] = { v: "Código R.M:", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } }
                ws["C3"].s = { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };
                ws["C4"].s = { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };
                ws["C5"].s = { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };

                // DATOS DE CABECERA
                ws["D2"] = { v: oDataSeleccionada.getData().codigo, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["D3"].s = { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };
                ws["D4"].s = { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };
                ws["D5"].s = { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } };

                //COLUMNAS DEL TREE TABLE DEL DETALLE
                ws["A7"] = { v: "#", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["B7"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["C7"] = { v: "Depende", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["D7"] = { v: "Cod.", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["E7"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["F7"] = { v: "Tipo Dato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["G7"] = { v: "Proc. Menor Opcional", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["H7"] = { v: "Val. Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["I7"] = { v: "Val. Final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["J7"] = { v: "# Decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["K7"] = { v: "Flag CC", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["L7"] = { v: "Flag Mov", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };

                var keys = Object.keys(ws);
                var cabeceras = [];
                keys.forEach(function (e) {
                    if (e.substring(0, 1) === "A" && e !== "A7") {
                        cabeceras.push(e);
                    }
                });

                cabeceras.forEach(function (obj) {
                    ws[obj].s = { font: { bold: true, sz: 14, color: { rgb: "1F497D" } } };
                })
                // LONGITUD DE COLUMNAS
                var wscols = [
                    { width: 50 },
                    { width: 10 },
                    { width: 10 },
                    { width: 30 },
                    { width: 50 },
                    { width: 20 },
                    { width: 20 },
                    { width: 10 },
                    { width: 10 },
                    { width: 10 },
                    { width: 10 },
                    { width: 10 }
                ];

                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, 'Configuración')
                ws["!cols"] = wscols;
                XLSX.writeFile(wb, 'Configuración.xlsx', { cellStyles: true });
            },

            // Obtener la lista de la tabla de la estructura para asignar al MD.
            onGetEstructura: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let sExpand = "tipoEstructuraId";
                    let aFiltro = [];
                    aFiltro.push(new Filter("estadoId_iMaestraId", "EQ", 2));
                    aFiltro.push(new Filter("activo", "EQ", true));
                    Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "ESTRUCTURA", aFiltro, sExpand).then(function (oListEstructura) {
                        resolve(oListEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Obtener la lista de la tabla de los pasos.
            onGetPaso: function (bEtiqueta) {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEstructura");
                    var aFilters = [];
                    aFilters.push(new Filter("activo", "EQ", true));
                    aFilters.push(new Filter("estadoId_iMaestraId", "EQ", 2));
                    if (bEtiqueta) {
                        oDataSeleccionadaEst = oThat.getView().getModel("headerAddEtiqueta");
                        aFilters.push(new Filter("etiquetaId_etiquetaId", "EQ", oDataSeleccionadaEst.getData().etiquetaId_etiquetaId));
                    }
                    aFilters.push(new Filter("estructuraId_estructuraId", "EQ", oDataSeleccionadaEst.getData().estructuraId_estructuraId));
                    let sExpand = "estructuraId,etiquetaId,estadoId";
                    Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "PASO", aFilters, sExpand).then(function (oListMdEstructura) {
                        resolve(oListMdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Confirmar la agregacion del paso.
            onAgregarPasosEdit: function () {
                let oMDSeleccionada = oThat.getView().getModel("asociarDatos");
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdPaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            sap.ui.core.BusyIndicator.show(0);
                            oThatConf.onAsignPasoToEstructura().then(async function (oDataRegister, oError) {
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThat.onCreateModelTreeProcess();
                                if (sTipoProcess) {
                                    oThatConf.onGetPasosToAssignProcess();
                                } else {
                                    oThatConf.onGetPasosToAssign();
                                }
                                oThatConf.onCancelAddEditarRM();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDPaso"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            // Asignar pasos a una estructura de un MD.
            onAsignPasoToEstructura: function () {
                ; // añadir nuevo paso
                return new Promise(function (resolve, reject) {
                    let oTblPaso = sap.ui.getCore().byId("frgAdicNewMdPasos--idTblPaso"),
                        aPaths = oTblPaso._aSelectedPaths,
                        oListPaso = oThat.getView().getModel("aListPaso"),
                        aListDataPaso = oListPaso.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura"),
                        oListMdPaso = oThat.getView().getModel("aListPasoAssignResponsive"),
                        oEtiquetaSeleccionada = oThat.getView().getModel("headerAddEtiqueta");

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDPasoNoData"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aDataEstPaso = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aPaso: []
                    },

                        dDate = new Date();

                    $.each(aPaths, function (k, v) {
                        let idPaso = util.onGetUUIDV4();
                        aDataEstPaso.aPaso.push(
                            {
                                terminal: null,
                                fechaRegistro: dDate,
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaActualiza: dDate,
                                usuarioActualiza: null,
                                activo: true,
                                mdEstructuraPasoId: idPaso,
                                estructuraId_estructuraId: oEstructuraSeleccionada.getData().estructuraId_estructuraId,
                                mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                                mdEsEtiquetaId_mdEsEtiquetaId: oEtiquetaSeleccionada ? oEtiquetaSeleccionada.getData().mdEsEtiquetaId : null,
                                mdId_mdId: oMDSeleccionada.getData().mdId,
                                pasoId_pasoId: aListDataPaso[v.split("/")[1]].pasoId,
                                orden: oListMdPaso.getData().length + k + 1,
                                tipoDatoId_iMaestraId: aListDataPaso[v.split("/")[1]].tipoDatoId_iMaestraId,
                                decimales: aListDataPaso[v.split("/")[1]].decimales,
                                margen: aListDataPaso[v.split("/")[1]].margen,
                                valorInicial: aListDataPaso[v.split("/")[1]].valorInicial,
                                valorFinal: aListDataPaso[v.split("/")[1]].valorFinal,
                                clvModelo: aListDataPaso[v.split("/")[1]].clvModelo,
                                automatico: aListDataPaso[v.split("/")[1]].automatico,
                                mdEstructuraPasoIdDepende: idPaso,
                                tipoDatoIdAnterior_iMaestraId: aListDataPaso[v.split("/")[1]].tipoDatoId_iMaestraId
                            }
                        );
                    });

                    const sId = oEstructuraSeleccionada.getData().mdEstructuraId;

                    Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstPaso, sId).then(function (oDataSaved) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            // Buscar por el filtro los pasos para asignar a la estructura.
            onSearchMdPaso: function (oEvent) {
                try {
                    let sTable = sap.ui.getCore().byId("frgAdicNewMdPasos--idTblPaso");
                    let sTablePM = sap.ui.getCore().byId("frgAddPasoPM--idTblPaso");
                    var oDataFilter = oThat.getView().getModel("oDataMdEsPaso");
                    var aFilter = [];
                    if (oDataFilter.getData().codigo)
                        aFilter.push(new Filter("codigo", FilterOperator.EQ, oDataFilter.getData().codigo));
                    if (oDataFilter.getData().descripcion)
                        aFilter.push(new Filter("descripcion", FilterOperator.Contains, oDataFilter.getData().descripcion));
                    // if (oDataFilter.getData().estructuraId_estructuraId)
                    //     aFilter.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, oDataFilter.getData().estructuraId_estructuraId));
                    if (oDataFilter.getData().etiquetaId_etiquetaId)
                        aFilter.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, oDataFilter.getData().etiquetaId_etiquetaId));
                    if(oDataFilter.getData().numeracion === true) {
                        aFilter.push(new Filter("numeracion", FilterOperator.EQ, oDataFilter.getData().numeracion));
                    }
                    aFilter.push(new Filter("activo", FilterOperator.EQ, true));
                    // if (estadoFilter.isValid) {
                    if (sTable) {
                        sTable.getBinding("items").filter(aFilter, FilterType.Application);
                    }
                    if (sTablePM) {
                        sTablePM.getBinding("items").filter(aFilter, FilterType.Application);
                    }
                    
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista de la tabla de los equipos de SAP.
            onGetEquipo: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    // aFilters.push(new Filter("Equipment", "EQ", ''));
                    aFilters.push(new Filter("Swerk", "EQ", oDataSeleccionada.getData().sucursalId.codigo));
                    aFilters.push(new Filter("Eqtyp", "EQ", ''));
                    Service.onGetDataGeneralFilters(oThatConf.oModelErpNec, "EquipoSet", aFilters).then(function (oListEquipment) {
                        // aFilters.push(new Filter("Aufnr", "EQ", ''));
                        // aFilters.push(new Filter("Werks", "EQ", oDataSeleccionada.getData().sucursalId.codigo));
                        // aFilters.push(new Filter("Equnr", "EQ", ''));
                        // Service.onGetDataGeneralFilters(oThatConf.oModelErpNec, "EquipoCalSet", aFilters).then(function (oListEquipment) {
                        resolve(oListEquipment);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                    // let aEquipos = oThat.localModel.getData().Estructura;
                    // resolve(aEquipos);
                });
            },

            // Registrar equipos que se van asignando a una estructura.
            onSaveEquipo: function (oEquipoData) {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oEquipoData).then(function (oDataSaved) {
                        // Service.onSaveDataGeneral(oThat.mainModelv2, "EQUIPO", oEquipo).then(function (oDataSaved) {
                        sap.ui.core.BusyIndicator.hide();
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        reject(oError);
                    });
                });
            },

            // Asignar equipos a una estructura de un MD.
            onAsignEquipoToEstructura: function () {
                return new Promise(async function (resolve, reject) {
                    let oTblEquipment = sap.ui.getCore().byId("frgAdicNewMdEquipment--idTblEquipment"),
                        aPaths = oTblEquipment._aSelectedPaths,
                        oListEquipment = oThat.getView().getModel("aListEquipoUtensilio"),
                        aListDataEquipment = oListEquipment.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura"),
                        aListMdEquipo = oThat.getView().getModel("aListEquipoAssignResponsive");

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sNoRegistroSeleccionado"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aDataEstEquipment = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aEquipo: []
                    },
                        aEquipo = [],
                        nPosicion = 0,
                        dDate = new Date();

                    let oTablaArrayInsert = {};
                        oTablaArrayInsert.terminal                  = null;
                        oTablaArrayInsert.usuarioRegistro           = oInfoUsuario.data.usuario;
                        oTablaArrayInsert.fechaRegistro             = new Date();
                        oTablaArrayInsert.activo                    = true;
                        oTablaArrayInsert.aEquipo = [];
                        oTablaArrayInsert.id = util.onGetUUIDV4();

                    $.each(aPaths, function (k, v) {
                        if (aListDataEquipment[v.split("/")[1]].tipoId === sIdTipoEquipo) {
                            nPosicion = nPosicion + 1;
                            let sId = util.onGetUUIDV4();
                            let sDescripcion = '';
                            if (aListDataEquipment[v.split("/")[1]].eqtyp === sTypeEquipment) {
                                sDescripcion = aListDataEquipment[v.split("/")[1]].eqktx;
                            } else {
                                sDescripcion = aListDataEquipment[v.split("/")[1]].denom;
                            }
                            aEquipo.push({
                                terminal: null,
                                fechaRegistro: dDate,
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaActualiza: dDate,
                                usuarioActualiza: null,
                                activo: true,
                                equipoId: sId,
                                tipoId_iMaestraId: sIdTipoEquipo,
                                werks: aListDataEquipment[v.split("/")[1]].werks,
                                sstat: aListDataEquipment[v.split("/")[1]].sstat,
                                tplnr: aListDataEquipment[v.split("/")[1]].tplnr,
                                pltxt: aListDataEquipment[v.split("/")[1]].pltxt,
                                equnr: aListDataEquipment[v.split("/")[1]].equnr,
                                eqtyp: aListDataEquipment[v.split("/")[1]].eqtyp,
                                estat: aListDataEquipment[v.split("/")[1]].estat,
                                eqktx: sDescripcion,
                                inbdt: aListDataEquipment[v.split("/")[1]].inbdt,
                                ctext: aListDataEquipment[v.split("/")[1]].ctext,
                                abckz: aListDataEquipment[v.split("/")[1]].abckz,
                                denom: aListDataEquipment[v.split("/")[1]].denom,
                                arbpl: aListDataEquipment[v.split("/")[1]].arbpl
                            });

                            aDataEstEquipment.aEquipo.push(
                                {
                                    terminal: null,
                                    fechaRegistro: dDate,
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaActualiza: dDate,
                                    usuarioActualiza: null,
                                    activo: true,
                                    mdEstructuraEquipoId: util.onGetUUIDV4(),
                                    estructuraId_estructuraId: oEstructuraSeleccionada.getData().estructuraId_estructuraId,
                                    mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                                    mdId_mdId: oMDSeleccionada.getData().mdId,
                                    equipoId_equipoId: sId,
                                    orden: aListMdEquipo.getData().length + nPosicion,
                                }
                            );
                        }
                    });

                    oTablaArrayInsert.aEquipo = aEquipo;
                    if (oTablaArrayInsert.aEquipo.length > 0) {
                        await oThatConf.onSaveEquipo(oTablaArrayInsert);
                        const sId = oEstructuraSeleccionada.getData().mdEstructuraId;
                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstEquipment, sId).then(function (oDataSaved) {
                            resolve(oDataSaved);
                        }).catch(function (oError) {
                            reject(oError);
                        });
                    } else {
                        resolve(true);
                    }
                });
            },
            // Obtener la lista de la tabla de los utensilios.
            onGetUtensilio: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEstructura");
                    let aFilter = [];
                    aFilter.push(new Filter("activo", "EQ", true));
                    aFilter.push(new Filter("estadoId_iMaestraId", "EQ", 2));
                    let sExpand = "estadoId,tipoId";
                    Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "UTENSILIO", aFilter, sExpand).then(function (oListMdEstructura) {
                        resolve(oListMdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Asignar utensilios a una estructura de un MD.
            onAsignUtensilioToEstructura: function () {
                return new Promise(function (resolve, reject) {
                    let oTblEquipment = sap.ui.getCore().byId("frgAdicNewMdEquipment--idTblEquipment"),
                        aPaths = oTblEquipment._aSelectedPaths,
                        oListEquipment = oThat.getView().getModel("aListEquipoUtensilio"),
                        aListDataEquipment = oListEquipment.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura"),
                        aListMdUtensilio = oThat.getView().getModel("aListEquipoAssignResponsive");

                    let aDataEstEquipment = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aUtensilio: []
                        },
                        nPosicion = 0,
                        dDate = new Date();
                    let EquiposRegistrados = 0;
                    $.each(aPaths, function (k, v) {
                        if (aListDataEquipment[v.split("/")[1]].tipoId === sIdTipoEquipo) {
                            EquiposRegistrados = EquiposRegistrados + 1;
                        }
                    });

                    $.each(aPaths, function (k, v) {
                        if (aListDataEquipment[v.split("/")[1]].tipoId !== sIdTipoEquipo) {
                            nPosicion = nPosicion + 1;
                            aDataEstEquipment.aUtensilio.push(
                                {
                                    terminal: null,
                                    fechaRegistro: dDate,
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaActualiza: dDate,
                                    usuarioActualiza: null,
                                    activo: true,
                                    mdEstructuraUtensilioId: util.onGetUUIDV4(),
                                    estructuraId_estructuraId: oEstructuraSeleccionada.getData().estructuraId_estructuraId,
                                    mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                                    mdId_mdId: oMDSeleccionada.getData().mdId,
                                    utensilioId_utensilioId: aListDataEquipment[v.split("/")[1]].id,
                                    orden: aListMdUtensilio.getData().length + EquiposRegistrados + nPosicion
                                }
                            );
                        }
                    });

                    if (aDataEstEquipment.aUtensilio.length > 0) {
                        const sId = oEstructuraSeleccionada.getData().mdEstructuraId;

                        Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstEquipment, sId).then(function (oDataSaved) {
                            resolve(oDataSaved);
                        }).catch(function (oError) {
                            reject(oError);
                        });
                    } else {
                        resolve(true);
                    }
                });
            },

            // Confirmar la asignacion de equipo o,o1 de,e1 utensilios a la estructura.
            onConfirmAddEquipment: function () {
                ;
                //mcode
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdEquipment"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            BusyIndicator.show(0);
                            Promise.all([oThatConf.onAsignEquipoToEstructura(), oThatConf.onAsignUtensilioToEstructura()]).then(async function (values) {
                                oThatConf.onCancelAddEquipoEditRM();
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                oThatConf.onOpenEquipo();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEquipment"));
                                BusyIndicator.hide();
                            }).catch(function (oError) {
                                BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            })
                        }
                    },
                });
            },

            // Obtener la lista de la tabla de las etiquetas.
            onGetEtiqueta: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEstructura");
                    var aFilters = [];
                    aFilters.push(new Filter("estructuraId_estructuraId", "EQ", oDataSeleccionadaEst.getData().estructuraId_estructuraId));
                    aFilters.push(new Filter("activo", "EQ", true));
                    aFilters.push(new Filter("estadoId_iMaestraId", "EQ", 2));
                    let sExpand = "estructuraId";
                    Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "ETIQUETA", aFilters, sExpand).then(function (oListMdEstructura) {
                        resolve(oListMdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Asignar etiquetas a una estructura de un MD.
            onAsignEtiquetaToEstructura: function () {
                return new Promise(async function (resolve, reject) {
                    let oTblEtiqueta = sap.ui.getCore().byId("frgoAddEtiquetaEditRM--idTblEtiqueta"),
                        aPaths = oTblEtiqueta._aSelectedPaths,
                        aListEtiqueta = oThat.getView().getModel("aListEtiqueta"),
                        aListDataEtiqueta = aListEtiqueta.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura"),
                        oMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta");

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDEtiquetaNoData"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aDataEstEtiqueta = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aEtiqueta: []
                    },

                        dDate = new Date();
                    let bFlag = true;
                    let cont = 0;
                    for await (const v of aPaths) {
                        let oObj = {
                            terminal: null,
                            fechaRegistro: dDate,
                            usuarioRegistro: oInfoUsuario.data.usuario,
                            fechaActualiza: dDate,
                            usuarioActualiza: null,
                            activo: true,
                            mdEsEtiquetaId: util.onGetUUIDV4(),
                            estructuraId_estructuraId: oEstructuraSeleccionada.getData().estructuraId_estructuraId,
                            mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                            mdId_mdId: oMDSeleccionada.getData().mdId,
                            etiquetaId_etiquetaId: aListDataEtiqueta[v.split("/")[1]].etiquetaId,
                            conforme: false,
                            procesoMenor: false
                        }
                        let iOrden = await oThatConf.onValidateExistItem("ETIQUETA", true, oObj);
                        if (iOrden) {
                            oObj.orden = iOrden + cont;
                            cont ++;
                        } else {
                            bFlag = false;
                        }
                        aDataEstEtiqueta.aEtiqueta.push(oObj);
                    }

                    const sId = oEstructuraSeleccionada.getData().mdEstructuraId;
                    if (bFlag) {
                        Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstEtiqueta, sId).then(function (oDataSaved) {
                            resolve(oDataSaved);
                        }).catch(function (oError) {
                            reject(oError);
                        });
                    } else {
                        let oObjError = {
                            responseJSON:{
                                error: {
                                    message: {
                                        value: "Una de las etiquetas ya fue ingresada"
                                    }
                                }
                            }
                        }
                        reject(oObjError);
                    }
                });
            },

            // EDITAR PASO -- editarRM
            onEditPasoRM: async function (oEvent) {
                var datos;
                var aFilters = [];
                if (oEvent.getSource().getBindingContext("listMdEstructuraGeneral")) {
                    datos = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                    aFilters.push(new Filter("descripcion", "EQ", datos.cantidad_mde));
                } else {
                    datos = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                    aFilters.push(new Filter("descripcion", "EQ", datos.cantidad));
                }

                if (!this.oEditPasoRM) {
                    this.oEditPasoRM = sap.ui.xmlfragment(
                        "frgEditPasoRM",
                        rootPath + ".view.fragment.editarRM.editar.EditarPasoPadre",
                        this
                    );
                    oThat.getView().addDependent(this.oEditPasoRM);
                }
                var sExpand = "estructuraId,etiquetaId,tipoDatoId"
                var pasoResponse = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "PASO", aFilters, sExpand);
                var lineaSeleccionadaModif = Object.assign({}, pasoResponse.results[0]);
                this.onChangingStepDataType({}, lineaSeleccionadaModif.tipoDatoId_iMaestraId,"frgEditPasoRM");
                this.localModel.setProperty("/pasoPadreSeleccionado", lineaSeleccionadaModif);
                this.localModel.setProperty("/pasoPadreSeleccionadoBackUp", pasoResponse.results[0]);
                this.oEditPasoRM.open();
            },

            onCancelPasoPadre: function (oEvent) {
                let component = oEvent.getSource().data("component");
                if(component=="pasoPadre"){
                    this.localModel.setProperty("/pasoPadreSeleccionado", {});
                    this.oEditPasoRM.close();
                }else{
                    this.localModel.setProperty("/pasoHijoSeleccionado", {});
                    this.oEditPasoHijoRM.close();
                }
                // this.oEditPasoRM.close();
            },

            onChangingStepDataType: function (oEvent, sTipoDato,frg="") {
                let aCamposIds = ["idInputStepEditInitialValue", "idInputStepEditFinalValue", "idInputStepEditMarginValue", "idInputStepEditPrecisionValue"];
                if(!sTipoDato){
                    if (oEvent.getParameters().itemPressed) {
                        switch (oEvent.getSource().getSelectedItem().getAdditionalText()) {
                            case "TDD06":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableEditRango", false);
                                    this.localModel.setProperty("/editableEditDecimales", true);
                                }
                                break;
                            case "TDD02":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableEditRango", false);
                                    this.localModel.setProperty("/editableEditDecimales", true);
                                }
                                break;
                            case "TDD12":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                                    this.localModel.setProperty("/editableEditRango", true);
                                    this.localModel.setProperty("/editableEditDecimales", true);
                                }
                                break;
                            case "TDD14":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableEditRango", false);
                                    this.localModel.setProperty("/editableEditDecimales", true);
                                }
                                break;
                            case "TDD17":
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    if (i === 3) {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                                    } else {
                                        sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                                    }
                                    this.localModel.setProperty("/editableEditRango", false);
                                    this.localModel.setProperty("/editableEditDecimales", true);
                                }
                                break;
                            // add logic for case TDD16
                            case "TDD16":
                                sap.ui.core.Fragment.byId(frg, "idCmbxClvModeloEdit").setBusy(true);
                                sap.ui.core.Fragment.byId(frg, "idCmbxClvModeloEdit").setBusy(false);
                                sap.ui.core.Fragment.byId(frg, "idCmbxClvModeloEdit").setEnabled(true);
                            break;
                            default:
                                for (let i = 0; aCamposIds.length > i; i++) {
                                    sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                                    this.localModel.setProperty("/editableEditRango", false);
                                    this.localModel.setProperty("/editableEditDecimales", false);
                                    sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setValue(null);
                                }
                        }

                    }
                } else {
                    if(sTipoDato === sTipoDatoNumero) { //TDD06
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else if(sTipoDato === sTipoDatoCantidad) { //TDD02
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else if(sTipoDato === sIdTipoDatoRango) {
                        for (let i = 0; aCamposIds.length > i; i++) { //TDD12
                            sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            this.localModel.setProperty("/editableEditRango", true);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else if(sTipoDato === sIdTipoDatoFormula) {
                        for (let i = 0; aCamposIds.length > i; i++) { //TDD14
                            if (i === 3) {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else if(sTipoDato === sTipoDatoMuestraCC) { //TDD17
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else if(sTipoDato === sTipoDatoEntrega) { //TDD19
                        for (let i = 0; aCamposIds.length > i; i++) {
                            if (i === 3) {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(true);
                            } else {
                                sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            }
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", true);
                        }
                    } else {
                        for (let i = 0; aCamposIds.length > i; i++) {
                            sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setEnabled(false);
                            this.localModel.setProperty("/editableEditRango", false);
                            this.localModel.setProperty("/editableEditDecimales", false);
                            sap.ui.core.Fragment.byId(frg, aCamposIds[i]).setValue(null);
                        }
                    }
                }    
            },

            onGrabarPasoPadre: async function (oEvent) {
                let that = this,
                    component = oEvent.getSource().data("component"),
                    ItemEditado, ItemBackUp,
                    mdInsumopaso = oThat.localModel.getProperty("/listMdEsPasoInsumoPaso"), 
                    pasoPrev = oThat.localModel.getProperty("/listMdEsPasoPadre"),
                    aEtiquetasEstructure = oThat.getView().getModel("headerAddEtiqueta"),
                    oMDSeleccionada = oThat.getView().getModel("asociarDatos");
                if(component=="pasoPadre"){
                    ItemEditado = oThat.localModel.getProperty("/pasoPadreSeleccionado");
                    ItemBackUp = oThat.localModel.getProperty("/pasoPadreSeleccionadoBackUp");
                }else{
                    ItemEditado = oThat.localModel.getProperty("/pasoHijoSeleccionado");
                    ItemBackUp = oThat.localModel.getProperty("/pasoHijoSeleccionadoBackUp");
                }
                                
                let oEditableRango = oThat.getView().getModel("localModel").getProperty("/editableEditRango");
                let oEditableDecimales = oThat.getView().getModel("localModel").getProperty("/editableEditDecimales");
                let CompararObjetos = JSON.stringify(ItemEditado) === JSON.stringify(ItemBackUp);
                if (CompararObjetos) {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage57"));
                    return;
                }
                let flagRango = true;
                let flagDecimales = true;
                if(oEditableRango) {
                    if(ItemEditado.valorInicial === "" || ItemEditado.valorInicial === null || ItemEditado.valorFinal === null || ItemEditado.valorFinal === "" || ItemEditado.margen === "" || ItemEditado.margen === null || ItemEditado.decimales === "" || ItemEditado.decimales === null) {
                        flagRango = false;
                    }
                }
                if(oEditableDecimales) {
                    if(ItemEditado.decimales === "" || ItemEditado.decimales === null) {
                        flagDecimales = false;
                    }
                }

                //validación de campo clvModelo
                let sDataClvModl =
                    ItemEditado["tipoDatoId_iMaestraId"] == sIdTipoDatoNotificacion
                    ? ItemEditado.clvModelo
                    : null;
                ItemEditado["clvModelo"] = sDataClvModl;

                //Campo clvModelo es obligatorio
                if (ItemEditado["tipoDatoId_iMaestraId"] == sIdTipoDatoNotificacion && !sDataClvModl) {
                    MessageBox.warning("Debes seleccionar un campo de Clave Modelo.");
                    return;
                }
                if(flagRango && flagDecimales){
                    // Para validar de los RMD Autorizados y los lapsos no modificables - INICIO.
                    let sExpand = "mdId,pasoId"
                    let aFilters = [];
                    aFilters.push(new Filter("pasoId_pasoId", "EQ", ItemEditado.pasoId));
                    // aFilters.push(new Filter("mdId_mdId", "NE", oMDSeleccionada.getData().mdId));
                    let MDPasoResponse = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "MD_ES_PASO", aFilters, sExpand);
                    MDPasoResponse.results = MDPasoResponse.results.filter(itm => itm.mdId !== null);
                    let aListMDPasoActual = MDPasoResponse.results.filter(item => item.mdId_mdId === oMDSeleccionada.getData().mdId);
                    let aListMDPaso = MDPasoResponse.results.filter(item => (item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido) && item.mdId_mdId !== oMDSeleccionada.getData().mdId);

                    // Para Procesos Menores
                    let aFiltersPM = [];
                    aFiltersPM.push(new Filter("pasoHijoId_pasoId", "EQ", ItemEditado.pasoId));
                    // aFilters.push(new Filter("mdId_mdId", "NE", oMDSeleccionada.getData().mdId));
                    let MDPasoResponsePM = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFiltersPM, sExpand);
                    MDPasoResponsePM.results = MDPasoResponsePM.results.filter(itm => itm.mdId !== null);
                    let aListMDPasoPMActual = MDPasoResponsePM.results.filter(item => item.mdId_mdId === oMDSeleccionada.getData().mdId);
                    let aListMDPasoPM = MDPasoResponsePM.results.filter(item => (item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido) && item.mdId_mdId !== oMDSeleccionada.getData().mdId);

                    let update;
                    let mensajeConfirm = "";
                    if (aListMDPaso.length > 0) {
                        if (!aListMDPaso[0].pasoId.tipoLapsoId_motivoLapsoId) {
                            if (ItemEditado.tipoLapsoId_motivoLapsoId) {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                update = true;
                            } else {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage58");
                                update = false;
                            }
                        } else if (aListMDPaso[0].pasoId.tipoLapsoId_motivoLapsoId !== ItemEditado.tipoLapsoId_motivoLapsoId) {
                            MessageBox.error(formatter.onGetI18nText(oThat,"txtMessageLapsoNoModif"));
                            update = false;
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        } else {
                            mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage58");
                            update = false;
                        }
                    } else {
                        if (aListMDPasoActual.length > 0) {
                            if (oMDSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado) {
                                if (!aListMDPasoActual[0].pasoId.tipoLapsoId_motivoLapsoId) {
                                    mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                    update = true;
                                } else if (aListMDPasoActual[0].pasoId.tipoLapsoId_motivoLapsoId !== ItemEditado.tipoLapsoId_motivoLapsoId) {
                                    MessageBox.error(formatter.onGetI18nText(oThat,"txtMessageLapsoNoModif"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                } else {
                                    mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                    update = true;
                                }
                            } else {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                update = true;
                            }
                        }
                    }

                    if (aListMDPasoPM.length > 0) {
                        if (!aListMDPasoPM[0].pasoId.tipoLapsoId_motivoLapsoId) {
                            if (ItemEditado.tipoLapsoId_motivoLapsoId) {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                update = true;
                            } else {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage58");
                                update = false;
                            }
                        } else if (aListMDPasoPM[0].pasoId.tipoLapsoId_motivoLapsoId !== ItemEditado.tipoLapsoId_motivoLapsoId) {
                            MessageBox.error(formatter.onGetI18nText(oThat,"txtMessageLapsoNoModif"));
                            update = false;
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        } else {
                            mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage58");
                            update = false;
                        }
                    } else {
                        if (aListMDPasoPMActual.length > 0) {
                            if (oMDSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado) {
                                if (!aListMDPasoPMActual[0].pasoId.tipoLapsoId_motivoLapsoId) {
                                    mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                    update = true;
                                } else if (aListMDPasoPMActual[0].pasoId.tipoLapsoId_motivoLapsoId !== ItemEditado.tipoLapsoId_motivoLapsoId) {
                                    MessageBox.error(formatter.onGetI18nText(oThat,"txtMessageLapsoNoModif"));
                                    update = false;
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                } else {
                                    mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                    update = true;
                                }
                            } else {
                                mensajeConfirm = formatter.onGetI18nText(oThat,"txtMessage59");
                                update = true;
                            }
                        }
                    }
                    // Para validar de los RMD Autorizados y los lapsos no modificables - FIN.
                    MessageBox.warning(mensajeConfirm, {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async function (sAction) {
                            if (sAction === "OK") {
                                if (update) {
                                    let aFilters = [];
                                    aFilters.push(new Filter("tolower(descripcion)", FilterOperator.EQ, "'" + ItemEditado.descripcion.toLowerCase().replace("'","''") + "'"));
                                    aFilters.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, ItemEditado.estructuraId_estructuraId));
                                    aFilters.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, ItemEditado.etiquetaId_etiquetaId));
                                    aFilters.push(new Filter("pasoId", FilterOperator.NE, ItemEditado.pasoId));
                                    let aPaso = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "PASO", aFilters);
                                    if (aPaso.results.length > 0) {
                                        MessageBox.confirm(oThat.getView().getModel("i18n").getResourceBundle().getText("sMessageStepRepeat"), {
                                            actions: ["Si", "No"],
                                            emphasizedAction: "Si",
                                            onClose:async function (sAction) {
                                                if (sAction === "Si") {
                                                    let bAutomatico = false;
                                                    if (ItemEditado.clvModelo === "SETPOST" || ItemEditado.clvModelo === "SETPRE") {
                                                        bAutomatico = true;
                                                    }
                                                    let obj = {
                                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                                        fechaActualiza: new Date(),
                                                        descripcion: ItemEditado.descripcion,
                                                        numeracion: ItemEditado.numeracion,
                                                        tipoDatoId_iMaestraId: ItemEditado.tipoDatoId_iMaestraId,
                                                        valorInicial: ItemEditado.valorInicial,
                                                        valorFinal: ItemEditado.valorFinal,
                                                        margen: ItemEditado.margen,
                                                        decimales: ItemEditado.decimales,
                                                        tipoLapsoId_motivoLapsoId: ItemEditado.tipoLapsoId_motivoLapsoId,
                                                        tipoCondicionId_iMaestraId: ItemEditado.tipoCondicionId_iMaestraId,
                                                        clvModelo: ItemEditado.clvModelo,
                                                        automatico: bAutomatico
                                                    }
                                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "PASO", obj, ItemEditado.pasoId);
                                                    MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage60"));
                                                    // that.oEditPasoRM.close();onGrabarPasoPadre
                                                    
                                                    await oThat.onGetDataEstructuraMD();
                                                    await oThat.onCreateModelTree();
                                                    if (aEtiquetasEstructure && component != "pasoHijo") {
                                                        if (aEtiquetasEstructure.getData().length === 0) {
                                                            await oThatConf.onGetPasosToAssign();
                                                        } else {
                                                            await oThatConf.onGetPasosToAssignProcess();
                                                        }
                                                    } else if (component=="pasoHijo") {
                                                        await oThatConf.onGetPasosToAssignProcess('proceso');
                                                        await oThatConf.onObtenerProcMenores(null);
                                                    } else {
                                                        await oThatConf.onGetPasosToAssign();
                                                    }
                                                } else {
                                                    sap.ui.core.BusyIndicator.hide();
                                                    return false;
                                                }
                                            }
                                        });
                                    } else {
                                        let bAutomatico = false;
                                        if (ItemEditado.clvModelo === "SETPOST" || ItemEditado.clvModelo === "SETPRE") {
                                            bAutomatico = true;
                                        }
                                        let obj = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            descripcion: ItemEditado.descripcion,
                                            numeracion: ItemEditado.numeracion,
                                            tipoDatoId_iMaestraId: ItemEditado.tipoDatoId_iMaestraId,
                                            valorInicial: ItemEditado.valorInicial,
                                            valorFinal: ItemEditado.valorFinal,
                                            margen: ItemEditado.margen,
                                            decimales: ItemEditado.decimales,
                                            tipoLapsoId_motivoLapsoId: ItemEditado.tipoLapsoId_motivoLapsoId,
                                            tipoCondicionId_iMaestraId: ItemEditado.tipoCondicionId_iMaestraId,
                                            clvModelo: ItemEditado.clvModelo,
                                            automatico: bAutomatico
                                        }
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "PASO", obj, ItemEditado.pasoId);
                                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage60"));
                                        // that.oEditPasoRM.close();onGrabarPasoPadre
                                        
                                        await oThat.onGetDataEstructuraMD();
                                        await oThat.onCreateModelTree();
                                        if (aEtiquetasEstructure && component != "pasoHijo") {
                                            if (aEtiquetasEstructure.getData().length === 0) {
                                                await oThatConf.onGetPasosToAssign();
                                            } else {
                                                await oThatConf.onGetPasosToAssignProcess();
                                            }
                                        } else if (component=="pasoHijo") {
                                            await oThatConf.onGetPasosToAssignProcess('proceso');
                                            await oThatConf.onObtenerProcMenores(null);
                                        } else {
                                            await oThatConf.onGetPasosToAssign();
                                        }
                                    }
                                } else {
                                    // let aListaPasos = await Service.onGetDataGeneral(oThat.mainModelv2, "PASO");
                                    // let max = 0;
                                    // aListaPasos.results.forEach(function (e) {
                                    //     if (max < e.codigo) {
                                    //         max = e.codigo;
                                    //     }
                                    // });

                                    let aFilters = [];
                                    aFilters.push(new Filter("tolower(descripcion)", FilterOperator.EQ, "'" + ItemEditado.descripcion.toLowerCase().replace("'","''") + "'"));
                                    aFilters.push(new Filter("estructuraId_estructuraId", FilterOperator.EQ, ItemEditado.estructuraId_estructuraId));
                                    aFilters.push(new Filter("etiquetaId_etiquetaId", FilterOperator.EQ, ItemEditado.etiquetaId_etiquetaId));
                                    aFilters.push(new Filter("pasoId", FilterOperator.NE, ItemEditado.pasoId));
                                    let aPaso = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "PASO", aFilters);
                                    if (aPaso.results.length > 0) {
                                        MessageBox.confirm(oThat.getView().getModel("i18n").getResourceBundle().getText("sMessageStepRepeat"), {
                                            actions: ["Si", "No"],
                                            emphasizedAction: "Si",
                                            onClose:async function (sAction) {
                                                if (sAction === "Si") {
                                                    //Asignar código
                                                    let codigotxt = await that.getNextNumber('PASO_CODIGO');

                                                    let obj = {
                                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                                        fechaRegistro: new Date(),
                                                        activo: true,
                                                        pasoId: util.onGetUUIDV4(),
                                                        // codigo: (parseInt(max) + 1).toString(),
                                                        codigo: codigotxt,
                                                        descripcion: ItemEditado.descripcion,
                                                        numeracion: ItemEditado.numeracion,
                                                        tipoDatoId_iMaestraId: ItemEditado.tipoDatoId_iMaestraId,
                                                        estadoId_iMaestraId: ItemEditado.estadoId_iMaestraId,
                                                        estructuraId_estructuraId: ItemEditado.estructuraId_estructuraId,
                                                        etiquetaId_etiquetaId: ItemEditado.etiquetaId_etiquetaId,
                                                        valorInicial: ItemEditado.valorInicial,
                                                        valorFinal: ItemEditado.valorFinal,
                                                        margen: ItemEditado.margen,
                                                        decimales: ItemEditado.decimales,
                                                        tipoLapsoId_motivoLapsoId: ItemEditado.tipoLapsoId_motivoLapsoId,
                                                        tipoCondicionId_iMaestraId: ItemEditado.tipoCondicionId_iMaestraId
                                                    }
                                                    let info =  await Service.onSaveDataGeneral(oThat.mainModelv2, "PASO", obj);

                                                    // MDPasoResponse.results.forEach(async function (e) {
                                                    // });
                                                    if(component=="pasoHijo"){

                                                        
                                                        //actualizamos el paso insumo
                                                        let updPasoInsumo = {
                                                            pasoHijoId_pasoId: info.pasoId
                                                        }
                                                        // mdEstructuraPasoInsumoPasoId
                                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", updPasoInsumo, mdInsumopaso.mdEstructuraPasoInsumoPasoId);
                                                    }else{
                                                        let updMdPaso = {
                                                            pasoId_pasoId: info.pasoId
                                                        }
                                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", updMdPaso, pasoPrev.mdEstructuraPasoId);
                                                    
                                                    }

                                                    MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage61"));
                                                    await oThat.onGetDataEstructuraMD();
                                                    await oThat.onCreateModelTree();
                                                    if (aEtiquetasEstructure && component != "pasoHijo") {
                                                        if (aEtiquetasEstructure.getData().length === 0) {
                                                            await oThatConf.onGetPasosToAssign();
                                                        } else {
                                                            await oThatConf.onGetPasosToAssignProcess();
                                                        }
                                                    } else if (component=="pasoHijo") {
                                                        await oThatConf.onGetPasosToAssignProcess('proceso');
                                                        await oThatConf.onObtenerProcMenores(null);
                                                    } else {
                                                        await oThatConf.onGetPasosToAssign();
                                                    }
                                                } else {
                                                    sap.ui.core.BusyIndicator.hide();
                                                    return false;
                                                }
                                            }
                                        });
                                    } else {
                                        //Asignar código
                                        let codigotxt = await that.getNextNumber('PASO_CODIGO');

                                        let obj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            pasoId: util.onGetUUIDV4(),
                                            // codigo: (parseInt(max) + 1).toString(),
                                            codigo: codigotxt,
                                            descripcion: ItemEditado.descripcion,
                                            numeracion: ItemEditado.numeracion,
                                            tipoDatoId_iMaestraId: ItemEditado.tipoDatoId_iMaestraId,
                                            estadoId_iMaestraId: ItemEditado.estadoId_iMaestraId,
                                            estructuraId_estructuraId: ItemEditado.estructuraId_estructuraId,
                                            etiquetaId_etiquetaId: ItemEditado.etiquetaId_etiquetaId,
                                            valorInicial: ItemEditado.valorInicial,
                                            valorFinal: ItemEditado.valorFinal,
                                            margen: ItemEditado.margen,
                                            decimales: ItemEditado.decimales,
                                            tipoLapsoId_motivoLapsoId: ItemEditado.tipoLapsoId_motivoLapsoId,
                                            tipoCondicionId_iMaestraId: ItemEditado.tipoCondicionId_iMaestraId
                                        }
                                        let info =  await Service.onSaveDataGeneral(oThat.mainModelv2, "PASO", obj);

                                        // MDPasoResponse.results.forEach(async function (e) {
                                        // });
                                        if(component=="pasoHijo"){

                                            
                                            //actualizamos el paso insumo
                                            let updPasoInsumo = {
                                                pasoHijoId_pasoId: info.pasoId
                                            }
                                            // mdEstructuraPasoInsumoPasoId
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", updPasoInsumo, mdInsumopaso.mdEstructuraPasoInsumoPasoId);
                                        }else{
                                            let updMdPaso = {
                                                pasoId_pasoId: info.pasoId
                                            }
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", updMdPaso, pasoPrev.mdEstructuraPasoId);
                                        
                                        }

                                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage61"));
                                        await oThat.onGetDataEstructuraMD();
                                        await oThat.onCreateModelTree();
                                        if (aEtiquetasEstructure && component != "pasoHijo") {
                                            if (aEtiquetasEstructure.getData().length === 0) {
                                                await oThatConf.onGetPasosToAssign();
                                            } else {
                                                await oThatConf.onGetPasosToAssignProcess();
                                            }
                                        } else if (component=="pasoHijo") {
                                            await oThatConf.onGetPasosToAssignProcess('proceso');
                                            await oThatConf.onObtenerProcMenores(null);
                                        } else {
                                            await oThatConf.onGetPasosToAssign();
                                        }   
                                    }
                                }
                                if(component=="pasoHijo"){
                                    that.oEditPasoHijoRM.close();
                                }else{
                                    that.oEditPasoRM.close();
                                }


                                // await oThat.onGetDataEstructuraMD();
                                // await oThat.onCreateModelTree();
                                // await oThatConf.onGetPasosToAssignProcess();
                                // await oThatConf.onObtenerProcMenores(null);
                            }
                        },
                    });
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.alert(oThat.getView().getModel("i18n").getResourceBundle().getText("sMissingPasoRango"), {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });
                }
            },
            getNextNumber: async function (sTipo) {
                let isNumber = await Service.onSaveDataFunctionCorrelativo(oThat.mainModelv2, 'obtenerCodigoCorrelativo', sTipo);
                return isNumber.toString();
            },

            onEditMdPaso: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                oThat.getView().getModel("listMdEstructuraGeneral").setProperty(oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getPath() + "/editMdPaso", true);
            },

            onSaveEditMsPaso: async function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                oThat.getView().getModel("listMdEstructuraGeneral").setProperty(oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getPath() + "/editMdPaso", false);
                var sFilter = [];
                sFilter.push(new Filter("contenido", "EQ", oContext.estadoIdRmd));
                var consultarTipoDato = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MAESTRA", sFilter);
                // let sColorHex,
                //     sColorRgb,
                //     bFormato = false;
                // if (oContext.formato) {
                //     if(this.localModel.getProperty("/colorHex")){
                //         sColorHex = this.localModel.getProperty("/colorHex");
                //         bFormato = true;
                //     }
                //     if(this.localModel.getProperty("/colorRgb")){
                //         sColorRgb = this.localModel.getProperty("/colorRgb");
                //         bFormato = true;
                //     }
                // }
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    valorInicial: oContext.numeracion_est,
                    valorFinal: oContext.actions,
                    margen: oContext.items2,
                    decimales: oContext.items3,
                    estadoCC: oContext.items4,
                    estadoMov: oContext.items5,
                    formato: oContext.items7,
                    imagen: oContext.items8,
                    tipoDatoId_iMaestraId: consultarTipoDato.results[0].iMaestraId,
                    flagModif: oDataSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado ? true : false,
                    tipoDatoIdAnterior_iMaestraId: consultarTipoDato.results[0].iMaestraId
                }
                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, oContext.mdEstructuraPasoId);
            },

            onDelPaso: function (oEvent) {
                var that = this;
                var oContext = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    activo: false
                }
                MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("warningDeletePaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, oContext.mdEstructuraPasoId);
                            MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDeletePaso"));
                            oThat.onGetDataEstructuraMD();
                            oThat.onCreateModelTree();
                        }
                    },
                });
            },

            onDelEstructura: function (oEvent) {
                try {
                    var that = this;
                    var oContext = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                    let {aEstructura} = oThat.getView().getModel("asociarDatos").getData(); //obtenemos las estructuras
                    let sModel = oEvent.getSource().data("model");
                    var oObj = {
                        usuarioActualiza: oInfoUsuario.data.usuario,
                        fechaActualiza: new Date(),
                        activo: false
                    }
                    MessageBox.warning(formatter.onGetI18nText(oThat, "sMessageConfirmDeleteStructure"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async function (sAction) {
                            if (sAction === "OK") {
                                sap.ui.core.BusyIndicator.show(0);
                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oObj, oContext.mdEstructuraId);
                                // aEstructura.results.map(structure=>{
                                    for await ( const structure of aEstructura.results){
                                    if(structure.mdEstructuraId == oContext.mdEstructuraId){
                                        //Equipo
                                        for await(const item of structure.aEquipo.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", oObj, item.mdEstructuraEquipoId);
                                        }
                                        //aEspecificaciones
                                        for await(const item of structure.aEspecificacion.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ESPECIFICACION", oObj, item.mdEstructuraEspecificacionId);
                                            
                                        }
                                        //Etiqueta
                                        for await(const item of structure.aEtiqueta.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", oObj, item.mdEsEtiquetaId);
                                            
                                        }
                                        // aInsumo
                                        for await(const item of structure.aInsumo.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oObj, item.estructuraRecetaInsumoId);
                                            
                                        }
                                        //aPaso
                                        for await(const item of structure.aPaso.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, item.mdEstructuraPasoId);
                                        }
                                        //aPasoInsumoPaso
                                        for await(const item of structure.aPasoInsumoPaso.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObj, item.mdEstructuraPasoInsumoPasoId);
                                            
                                        }
                                        //aUtensilio
                                        for await(const item of structure.aUtensilio.results){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", oObj, item.mdEstructuraUtensilioId);
                                            
                                        }

                                    }
                                }
                                // })
                                // await oThat.onGetDataEstructuraMD();
                                // await oThat.onCreateModelTree();
                                await oThat._updateModelRest();
                                await oThatConf.updateOrder(sModel);
                                MessageToast.show(formatter.onGetI18nText(oThat, "sMessageDeleteStructure"));
                            }
                        },
                    });
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista de la tabla de los Ensayos Padres.
            onGetEnsayoPadre: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let aFilter = [];
                    aFilter.push(new Filter("oMaestraTipo_maestraTipoId", "EQ", sTypeEnsayoPadre));
                    Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "MAESTRA", aFilter).then(function (oListEnsayoPadre) {
                        resolve(oListEnsayoPadre);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // ACCION ABRIR FRAGMENT ADICIONAR ESPECIFICACIONES EDITAR RM
            onAddEEspecificacionEditRM: function () {
                if (!this.oAddEspecificacionEditRM) {
                    this.oAddEspecificacionEditRM = sap.ui.xmlfragment(
                        "frgoAddEspecificacionEditRM",
                        rootPath + ".view.fragment.editarRM.AdicEspecificaciones",
                        this
                    );
                    oThat.getView().addDependent(this.oAddEspecificacionEditRM);
                }

                this.oAddEspecificacionEditRM.open();
            },

            onCancelAddEspecificacionEditRM: function () {
                oThatConf.onCleanDataEspecificacion();
                this.oAddEspecificacionEditRM.close();
            },

            // Funcion para poner false o true a las propiedades de los componentes de la vista Ejem: (visible, enabled) 
            onState: function (bState, modelo) {
                var oModel = new JSONModel({
                    "state": bState
                });
                if (oThat.getView().getModel(modelo)) {
                    oThat.getView().getModel(modelo).setProperty("/state", bState);
                } else {
                    oThat.getView().setModel(oModel, modelo);
                }
                // oThat.getView().setModel(oModel, modelo);
                oThat.getView().getModel(modelo).refresh(true);
            },

            onConfirmAddEspecification: function () {
                let oModelFormEspecificaciones = oThat.getView().getModel("oDataFormEspecificaciones");

                if ((!oModelFormEspecificaciones.getData().ensayoPadreId_iMaestraId || oModelFormEspecificaciones.getData().ensayoPadreId_iMaestraId === "") ||
                    (!oModelFormEspecificaciones.getData().ensayoHijo || oModelFormEspecificaciones.getData().ensayoHijo === "") || 
                    (!oModelFormEspecificaciones.getData().especificacion || oModelFormEspecificaciones.getData().especificacion === "") || 
                    (!oModelFormEspecificaciones.getData().tipoDatoId_iMaestraId || oModelFormEspecificaciones.getData().tipoDatoId_iMaestraId === "")) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "msgObligatoriosCampos"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                }
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdEstructure"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            oThatConf.onAsignEspecificacionToEstructura().then(async function (oDataRegister, oError) {
                                oThatConf.onCancelAddEspecificacionEditRM();
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                oThatConf.onGetEspecificacionesToAssign();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectEspecificactionEstructure"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            onAsignEspecificacionToEstructura: function () {
                return new Promise(function (resolve, reject) {
                    let oModelFormEspecificaciones = oThat.getView().getModel("oDataFormEspecificaciones"),
                        oDataFormEspecificaciones = oModelFormEspecificaciones.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura"),
                        oListMdEsEspecificacion = oThat.getView().getModel("listMdEsEspecificacion"),
                        dDate = new Date();

                    let oEspecificacion = {
                        terminal: null,
                        fechaRegistro: dDate,
                        usuarioRegistro: oInfoUsuario.data.usuario,
                        fechaActualiza: dDate,
                        usuarioActualiza: null,
                        activo: true,
                        mdEstructuraEspecificacionId: util.onGetUUIDV4(),
                        estructuraId_estructuraId: oEstructuraSeleccionada.getData().estructuraId_estructuraId,
                        mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        mdId_mdId: oMDSeleccionada.getData().mdId,
                        ensayoPadreId_iMaestraId: oDataFormEspecificaciones.ensayoPadreId_iMaestraId,
                        ensayoHijo: oDataFormEspecificaciones.ensayoHijo,
                        especificacion: oDataFormEspecificaciones.especificacion,
                        tipoDatoId_iMaestraId: oDataFormEspecificaciones.tipoDatoId_iMaestraId,
                        valorInicial: oDataFormEspecificaciones.valorInicial === "" ? null : oDataFormEspecificaciones.valorInicial,
                        valorFinal: oDataFormEspecificaciones.valorFinal === "" ? null : oDataFormEspecificaciones.valorFinal,
                        margen: parseFloat(oDataFormEspecificaciones.margen) === NaN ? null : oDataFormEspecificaciones.margen,
                        decimales: oDataFormEspecificaciones.decimales === "" ? null : oDataFormEspecificaciones.decimales,
                        orden: oListMdEsEspecificacion.getData().length + 1
                    };

                    Service.onSaveDataGeneral(oThatConf.mainModelv2, "MD_ES_ESPECIFICACION", oEspecificacion).then(function (oDataSaved) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            // Resetear Model Especificaciones.
            onCleanDataEspecificacion: function () {
                var oDataFormEspecificaciones = oThat.getView().getModel("oDataFormEspecificaciones");
                oDataFormEspecificaciones.getData().estructuraId_estructuraId = "";
                oDataFormEspecificaciones.getData().mdId_mdId = "";
                oDataFormEspecificaciones.getData().ensayoPadreId_iMaestraId = "";
                oDataFormEspecificaciones.getData().ensayoHijo = "";
                oDataFormEspecificaciones.getData().especificacion = "";
                oDataFormEspecificaciones.getData().tipoDatoId_iMaestraId = "";
                oDataFormEspecificaciones.getData().valorInicial = "";
                oDataFormEspecificaciones.getData().valorFinal = "";
                oDataFormEspecificaciones.getData().margen = "";
                oDataFormEspecificaciones.getData().decimales = "";
                oDataFormEspecificaciones.getData().orden = "";
                oDataFormEspecificaciones.refresh(true);
            },

            // Resetear Model Filter Pasos.
            onCleanFilterPasos: function () {
                var oDataMdEsPaso = oThat.getView().getModel("oDataMdEsPaso");
                oDataMdEsPaso.getData().codigo = "";
                oDataMdEsPaso.getData().descripcion = "";
                oDataMdEsPaso.getData().numeracion = false;
                oDataMdEsPaso.getData().estructuraId_estructuraId = "";
                oDataMdEsPaso.getData().etiquetaId_etiquetaId = "";
                oDataMdEsPaso.refresh(true);
            },

            // Resetear Model Filter Estructura.
            onCleanFilterEstructura: function () {
                var oDataMdEstructura = oThat.getView().getModel("oDataMdEstructura");
                oDataMdEstructura.getData().description = "";
                oDataMdEstructura.refresh(true);
            },
            // onAceptarCopiarARM: function () {
            //     var oContext = this.localModel.getProperty("/lineaData");
            //     var sFilter = [];
            //     sFilter.push(new Filter("mdId_mdId", "EQ", oContext.mdId));
            //     var sExpand = aEstructura;
            //     Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "MD", sFilter, sExpand);
            //     oContext.nivel = 1;
            //     oContext.mdId = util.onGetUUIDV4();
            //     oContext.usuarioRegistro = oInfoUsuario.data.usuario;
            //     oContext.fechaRegistro = new Date();
            //     oContext.activo = true;
            //     Service.onSaveDataFunction(oThatConf.mainModelv2, "MD", oContext);
            //     MessageToast.show("Se genera la copia a RM");
            //     this.oCopiarARM.close();
            // },

            onSearchEtiqueta: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgoAddEtiquetaEditRM--idTblEtiqueta");
                    var oDataFilter = oThat.getView().getModel("oDataFilterEtiqueta");
                    var aFilter = [];
                    if (oDataFilter.getData().descripcion)
                        aFilter.push(
                            new Filter(
                                "descripcion",
                                FilterOperator.Contains,
                                oDataFilter.getData().descripcion
                            )
                        );

                    aFilter.push(new Filter("activo", FilterOperator.EQ, true));
                    // if (estadoFilter.isValid) {
                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            onConfirmAddEtiquetaEditRM: function () {
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveLabel"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            sap.ui.core.BusyIndicator.show(0);
                            Promise.all([oThatConf.onAsignEtiquetaToEstructura()]).then(async function (oDataRegister, oError) {
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThat.onCreateModelTreeProcess();
                                oThatConf.onGetEtiquetasToAssign();
                                oThatConf.onCancelAddEtiquetaEditRM();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectLabel"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(function (oError) {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            })
                        }
                    },
                });
            },

            onSearchCopyDe: async function () {
                var aFiltros = this.localModel.getProperty("/filtroCopy");
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                var sExpand = "nivelId,sucursalId,estadoIdRmd";
                var aFilter = [];
                aFilter.push(new Filter("mdId", "NE", oDataSeleccionada.getData().mdId));
                aFilter.push(new Filter("estadoIdRmd_iMaestraId", "NE", idEstadoRmdCancelado));
                if (aFiltros.codigo) {
                    aFilter.push(new Filter("codigo", FilterOperator.Contains, aFiltros.codigo));
                }
                if (aFiltros.descripcion) {
                    aFilter.push(new Filter("tolower(descripcion)", FilterOperator.Contains, "'" + aFiltros.descripcion.toLowerCase().replace("'","''") + "'"));
                }
                if (aFiltros.nivelTxt) {
                    aFilter.push(new Filter("nivelTxt", "EQ", aFiltros.nivelTxt));
                }
                if (aFiltros.sucursalId_iMaestraId) {
                    aFilter.push(new Filter("sucursalId_iMaestraId", "EQ", aFiltros.sucursalId_iMaestraId));
                }
                var aListRMDCopy = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", aFilter, sExpand);
                this.localModel.setProperty("/aListMDCopy", aListRMDCopy.results);
            },

            onRestoreFiltersCopyDe: function () {
                this.localModel.setProperty("/filtroCopy/codigo", "");
                this.localModel.setProperty("/filtroCopy/descripcion", "");
                this.localModel.setProperty("/filtroCopy/sucursalId_iMaestraId", "");
                this.onSearchCopyDe();
            },

            onAceptarCopiarARM: function () {
                var dataRMD = this.localModel.getProperty("/copyA");
                var tipo = "2";
                var newCorrelativo;
                var año = (new Date().getFullYear()).toString();
                if (!this.onValidateCopyA(dataRMD)) {
                    MessageToast.show("Complete los campos obligatorios.")
                    return;
                }
                BusyIndicator.show(0);
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                Service.onGetDataGeneral(oThat.mainModelv2, "MD").then(async function (res) {
                    if (res.results.length === 0) {
                        newCorrelativo = "00001"
                    } else {
                        res.results.sort(function (a, b) {
                            return b.codigo - a.codigo;
                        });
                        var lastCode = res.results[0].codigo;
                        var lastCorrelativo = lastCode.substring(lastCode.length - 5, lastCode.length);
                        var newValue = parseInt(lastCorrelativo) + 1;
                        if (newValue < 10) {
                            newCorrelativo = "0000" + newValue.toString();
                        } else if (newValue < 100) {
                            newCorrelativo = "000" + newValue.toString();
                        } else if (newValue < 1000) {
                            newCorrelativo = "00" + newValue.toString();
                        } else if (newValue < 10000) {
                            newCorrelativo = "0" + newValue.toString();
                        } else if (newValue < 100000) {
                            newCorrelativo = newValue.toString();
                        }
                    }
                    var Newcodigo = tipo + año + newCorrelativo;
                    var oParamMaster = {
                        usuarioRegistro: oInfoUsuario.data.usuario,
                        fechaRegistro: new Date(),
                        activo: true,
                        mdId: util.onGetUUIDV4(),
                        codigo: Newcodigo,
                        version: 1,
                        descripcion: dataRMD.descripcion,
                        nivelTxt: dataRMD.nivelTxt,
                        estadoIdRmd_iMaestraId: dataRMD.estadoIdRmd_iMaestraId,
                        estadoIdProceso_iMaestraId: sIdEstadoProcesoPendiente,
                        sucursalId_iMaestraId: dataRMD.sucursalId_iMaestraId,
                        motivoId_motivoId: dataRMD.motivoId_motivoId,
                        fechaSolicitud: new Date(dataRMD.fechaSolicitud),
                        observacion: dataRMD.observacion,
                        codDefectoReceta : dataRMD.codDefecto,
                        codigoOriginalCopia: lastCode
                    }
                    //NUEVO MARIN
                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD", oParamMaster);

                    let updTraz = {
                        activo                  : true,
                        usuarioRegistro         : oInfoUsuario.data.usuario,
                        fechaRegistro           : new Date(),
                        idTrazabilidad          : util.onGetUUIDV4(),
                        mdId_mdId               : oParamMaster.mdId,
                        estadoTrazab_iMaestraId : estadoIngresadoRMD
                    }
                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);                    
                    let aFilter = [];
                    aFilter.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.mdId));
                    let sExpand = "aPaso/aFormula,aEquipo,aUtensilio,aEtiqueta,aPasoInsumoPaso/aFormula,aEspecificacion,estructuraId";
                    let aEstructuraMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilter, sExpand);
                    let aListEstructurasRMD = [];
                    let aPasos = [];
                    let aPasosInsumosPasos = [];
                    let aFormulaGeneral = {
                        id : util.onGetUUIDV4(),
                        aFormula : []
                    }

                    aEstructuraMD.results.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    for await (const oEstructura of aEstructuraMD.results) {
                        if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId !== sIdTipoEstructuraFormula) {
                            let oParam = {
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaRegistro: new Date(),
                                activo: true,
                                mdEstructuraId: util.onGetUUIDV4(),
                                orden: oEstructura.orden,
                                mdId_mdId: oParamMaster.mdId,
                                estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                                aPaso: [],
                                aEquipo : [],
                                aUtensilio : [],
                                aEtiqueta: [],
                                aPasoInsumoPaso: [],
                                aEspecificacion: []
                            }
                            aListEstructurasRMD.push(oParam);

                            let aEtiquetas = [];

                            //AGREGAMOS LAS ETIQUETAS A LA ESTRUCTURA
                            if (oEstructura.aEtiqueta.results.length > 0) {
                                oEstructura.aEtiqueta.results.forEach(async function (oEtiqueta) {
                                    let mdEsEtiquetaIdActual = util.onGetUUIDV4();
                                    aEtiquetas.push({mdEsEtiquetaIdAntiguo: oEtiqueta.mdEsEtiquetaId, mdEsEtiquetaIdActual: mdEsEtiquetaIdActual});
                                    let oEtiquetaObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                        mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                        estructuraId_estructuraId: oEtiqueta.estructuraId_estructuraId,
                                        mdId_mdId: oParamMaster.mdId,
                                        etiquetaId_etiquetaId: oEtiqueta.etiquetaId_etiquetaId,
                                        orden: oEtiqueta.orden,
                                        conforme: oEtiqueta.conforme,
                                        procesoMenor: oEtiqueta.procesoMenor
                                    }
                                    oParam.aEtiqueta.push(oEtiquetaObj);
                                });
                            }

                            //AGREGAMOS LOS PASOS A LA ESTRUCTURA
                            if (oEstructura.aPaso.results.length > 0) {
                                for await (const oPaso of oEstructura.aPaso.results) {
                                // oEstructura.aPaso.results.forEach(function (oPaso) {
                                    let mdEstructuraPasoIdActual = util.onGetUUIDV4();
                                    aPasos.push({mdEstructuraPasoIdAntiguo: oPaso.mdEstructuraPasoId, mdEstructuraPasoIdActual: mdEstructuraPasoIdActual});

                                    let mdEsEtiquetaIdActual = null;
                                    let oEtiqueta;
                                    if (oPaso.mdEsEtiquetaId_mdEsEtiquetaId) {
                                        oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oPaso.mdEsEtiquetaId_mdEsEtiquetaId);
                                        if (oEtiqueta) {
                                            mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                        }
                                    }
                                    
                                    let oPasoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                        mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                        estructuraId_estructuraId: oPaso.estructuraId_estructuraId,
                                        mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                        mdId_mdId: oParamMaster.mdId,
                                        pasoId_pasoId: oPaso.pasoId_pasoId,
                                        orden: oPaso.orden,
                                        valorInicial: oPaso.valorInicial,
                                        valorFinal: oPaso.valorFinal,
                                        margen: oPaso.margen,
                                        decimales: oPaso.decimales,
                                        mdEstructuraPasoIdDepende: mdEstructuraPasoIdActual,
                                        depende: oPaso.depende,
                                        dependeMdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                        estadoCC: oPaso.estadoCC,
                                        estadoMov: oPaso.estadoMov,
                                        pmop: oPaso.pmop,
                                        genpp: oPaso.genpp,
                                        tab: oPaso.tab,
                                        edit: oPaso.edit,
                                        rpor: oPaso.rpor,
                                        vb: oPaso.vb,
                                        formato : oPaso.formato,
                                        colorHex : oPaso.colorHex,
                                        colorRgb : oPaso.colorRgb,
                                        imagen : false,
                                        tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                        flagModif : false,
                                        puestoTrabajo : oPaso.puestoTrabajo,
                                        clvModelo : oPaso.clvModelo,
                                        automatico : oPaso.automatico,
                                        aFormula : oPaso.aFormula.results,
                                        tipoDatoIdAnterior_iMaestraId: oPaso.tipoDatoId_iMaestraId
                                    }
                                    oParam.aPaso.push(oPasoObj);
                                }

                                for await (const oPaso of oParam.aPaso) {
                                // oParam.aPaso.forEach(function (oPaso) {
                                    let oPasoActual;
                                    if (oPaso.dependeMdEstructuraPasoId) {
                                        oPasoActual = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oPaso.dependeMdEstructuraPasoId);
                                        if (oPasoActual) {
                                            oPaso.dependeMdEstructuraPasoId = oPasoActual.mdEstructuraPasoIdActual;
                                        }
                                    }

                                    if (oPaso.aFormula.length > 0) {
                                        for await (const oFormula of oPaso.aFormula) {
                                        // oPaso.aFormula.forEach(function (oFormula) {
                                            oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                            oFormula.fechaRegistro = new Date();
                                            oFormula.activo = true;
                                            oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                            oFormula.usuarioActualiza = null;
                                            oFormula.fechaActualiza = null;
                                            oFormula.mdId_mdId = oParamMaster.mdId;
                                            oFormula.pasoFormulaIdPM_mdEstructuraPasoInsumoPasoId = null;
                                            let oPasoActualPadre = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoPadreId_mdEstructuraPasoId);
                                            if (oPasoActualPadre) {
                                                oFormula.pasoPadreId_mdEstructuraPasoId = oPasoActualPadre.mdEstructuraPasoIdActual;
                                            }
                                            if (oFormula.esPaso) {
                                                let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                if (oPasoActualFormula) {
                                                    oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                }
                                            }
                                            aFormulaGeneral.aFormula.push(oFormula);
                                        }
                                    }
                                    oPaso.aFormula = [];
                                }
                            }

                            //AGREGAMOS LOS EQUIPOS A LA ESTRUCTURA
                            if (oEstructura.aEquipo.results.length > 0) {
                                oEstructura.aEquipo.results.forEach(async function (oEquipo) {
                                    let oEquipoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdEstructuraEquipoId: util.onGetUUIDV4(),
                                        mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                        estructuraId_estructuraId: oEquipo.estructuraId_estructuraId,
                                        mdId_mdId: oParamMaster.mdId,
                                        equipoId_equipoId: oEquipo.equipoId_equipoId,
                                        orden: oEquipo.orden
                                    }
                                    oParam.aEquipo.push(oEquipoObj);
                                });
                            }
                
                            //AGREGAMOS LOS UTENSILIOS A LA ESTRUCTURA
                            if (oEstructura.aUtensilio.results.length > 0) {
                                oEstructura.aUtensilio.results.forEach(async function (oUtensilio) {
                                    let oUtensiliooBJ = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdEstructuraUtensilioId: util.onGetUUIDV4(),
                                        mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                        estructuraId_estructuraId: oUtensilio.estructuraId_estructuraId,
                                        mdId_mdId: oParamMaster.mdId,
                                        utensilioId_utensilioId: oUtensilio.utensilioId_utensilioId,
                                        agrupadorId_clasificacionUtensilioId : oUtensilio.agrupadorId_clasificacionUtensilioId,
                                        orden: oUtensilio.orden
                                    }
                                    oParam.aUtensilio.push(oUtensiliooBJ);
                                });
                            }
                
                            //AGREGAMOS  LOS PROCESOS MENORES A LOS PASOS DE LA ETIQUETA DE LA ESTRUCTURA
                            if (oEstructura.aPasoInsumoPaso.results.length > 0) {
                                for await (const oProcesoMenor of oEstructura.aPasoInsumoPaso.results) {
                                // oEstructura.aPasoInsumoPaso.results.forEach(async function (oProcesoMenor) {
                                    let mdEstructuraPasoInsumoPasoIdActual = util.onGetUUIDV4();
                                    aPasosInsumosPasos.push({mdEstructuraPasoInsumoPasoIdAntiguo: oProcesoMenor.mdEstructuraPasoInsumoPasoId, mdEstructuraPasoInsumoPasoIdActual: mdEstructuraPasoInsumoPasoIdActual});
                                    // PARA SETEAR EL ID DE LA TABLA MD_ES_ETIQUETA
                                    let mdEsEtiquetaIdActual = null;
                                    let oEtiqueta;
                                    if (oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId) {
                                        oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId);
                                        if (oEtiqueta) {
                                            mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                        }
                                    }

                                    // PARA SETEAR EL ID DE LA TABLA MD_ES_PASO
                                    let mdEstructuraPasoIdActual = null;
                                    let oPaso;
                                    if (oProcesoMenor.pasoId_mdEstructuraPasoId) {
                                        oPaso = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oProcesoMenor.pasoId_mdEstructuraPasoId);
                                        if (oPaso) {
                                            mdEstructuraPasoIdActual = oPaso.mdEstructuraPasoIdActual;
                                        }
                                    }
                                    let oProcesoMenorObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        mdEstructuraPasoInsumoPasoId: mdEstructuraPasoInsumoPasoIdActual,
                                        mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                        estructuraId_estructuraId: oProcesoMenor.estructuraId_estructuraId,
                                        mdId_mdId: oParamMaster.mdId,
                                        pasoId_mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                        pasoHijoId_pasoId : oProcesoMenor.pasoHijoId_pasoId !== null ? oProcesoMenor.pasoHijoId_pasoId : null,
                                        tipoDatoId_iMaestraId : oProcesoMenor.tipoDatoId_iMaestraId,
                                        estructuraRecetaInsumoId_estructuraRecetaInsumoId : oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId !== null ? oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId : null,
                                        etiquetaId_etiquetaId: oProcesoMenor.etiquetaId_etiquetaId,
                                        mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                        mdEstructuraPasoInsumoPasoIdAct: mdEstructuraPasoInsumoPasoIdActual,
                                        orden : oProcesoMenor.orden,
                                        valorInicial : oProcesoMenor.valorInicial,
                                        valorFinal : oProcesoMenor.valorFinal,
                                        margen : oProcesoMenor.margen,
                                        cantidadInsumo : oProcesoMenor.cantidadInsumo,
                                        decimales : oProcesoMenor.decimales,
                                        estadoCC : oProcesoMenor.estadoCC,
                                        estadoMov : oProcesoMenor.estadoMov,
                                        genpp : oProcesoMenor.genpp,
                                        edit : oProcesoMenor.edit,
                                        tab : oProcesoMenor.tab,
                                        formato : oProcesoMenor.formato,
                                        colorHex : oProcesoMenor.colorHex,
                                        colorRgb : oProcesoMenor.colorRgb,
                                        flagModif : oProcesoMenor.flagModif,
                                        Component : oProcesoMenor.Component,
                                        Matnr : oProcesoMenor.Matnr,    
                                        Maktx : oProcesoMenor.Maktx,    
                                        CompUnit : oProcesoMenor.CompUnit,
                                        tipoDatoIdAnterior_iMaestraId: oProcesoMenor.tipoDatoId_iMaestraId,
                                        aFormula : oProcesoMenor.aFormula.results
                                    }
                                    oParam.aPasoInsumoPaso.push(oProcesoMenorObj);
                                }

                                for await (const oPasoInsumoPaso of oParam.aPasoInsumoPaso) {
                                    if (oPasoInsumoPaso.aFormula.length > 0) {
                                        for await (const oFormula of oPasoInsumoPaso.aFormula) {
                                        // oPaso.aFormula.forEach(function (oFormula) {
                                            oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                            oFormula.fechaRegistro = new Date();
                                            oFormula.activo = true;
                                            oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                            oFormula.usuarioActualiza = null;
                                            oFormula.fechaActualiza = null;
                                            oFormula.mdId_mdId = oParamMaster.mdId;
                                            oFormula.pasoFormulaIdPM_mdEstructuraPasoInsumoPasoId = null;
                                            let oPasoInsumoPasoActualPadre = aPasosInsumosPasos.find(itm=>itm.mdEstructuraPasoInsumoPasoIdAntiguo === oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId);
                                            if (oPasoInsumoPasoActualPadre) {
                                                oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = oPasoInsumoPasoActualPadre.mdEstructuraPasoInsumoPasoIdActual;
                                            }
                                            if (oFormula.esPaso) {
                                                let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                if (oPasoActualFormula) {
                                                    oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                }
                                            }
                                            aFormulaGeneral.aFormula.push(oFormula);
                                        }
                                    }
                                    oPasoInsumoPaso.aFormula = [];
                                }
                            }

                            //AGREGAMOS LAS ESPECIFICACIONES LA ESTRUCTURA
                            if (oEstructura.aEspecificacion.results.length > 0) {
                                oEstructura.aEspecificacion.results.forEach(async function (oEspecificacion) {
                                    let oEspecificacionObj = {
                                        usuarioRegistro : oInfoUsuario.data.usuario,
                                        fechaRegistro : new Date(),
                                        activo : true,
                                        mdEstructuraEspecificacionId : util.onGetUUIDV4(),
                                        mdEstructuraId_mdEstructuraId : oParam.mdEstructuraId,
                                        estructuraId_estructuraId : oEspecificacion.estructuraId_estructuraId,
                                        mdId_mdId : oParamMaster.mdId,
                                        ensayoPadreSAP: oEspecificacion.ensayoPadreSAP,
                                        ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                        ensayoHijo : oEspecificacion.ensayoHijo,
                                        especificacion: oEspecificacion.especificacion,
                                        tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                        valorInicial : oEspecificacion.valorInicial,
                                        valorFinal : oEspecificacion.valorFinal,
                                        margen : oEspecificacion.margen,
                                        decimales : oEspecificacion.decimales,
                                        orden : oEspecificacion.orden,
                                        Merknr : oEspecificacion.Merknr
                                    }
                                    oParam.aEspecificacion.push(oEspecificacionObj);
                                });
                            }
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oParam);
                        }
                    }
                    if (aFormulaGeneral.aFormula.length > 0) {
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", aFormulaGeneral);
                    }
                    await oThatConf.onSaveCantidadRm();
                    BusyIndicator.hide();
                    await oThat.onGetDataInitial();
                    MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage62"));
                    oThatConf.onCancelCopiarARM();
                });
            },

            onValidateCopyA: function (oData) {
                var validate = true;
                oData.descripcion ? "" : validate = false;
                oData.codDefecto ? "" : validate = false;
                oData.sucursalId_iMaestraId ? "" : validate = false;
                oData.motivoId_motivoId ? "" : validate = false;
                oData.fechaSolicitud ? "" : validate = false;
                return validate;
            },

            onAceptarCopiarDeRM: async function () {
                try {
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var mdSelected = sap.ui.core.Fragment.byId("frgCopiarDeRM", "idTBCopyDe").getSelectedItems();
                    let flag = true;
                    if (mdSelected.length === 0){
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage63"))
                        flag = false;
                        return;
                    }
                    if (mdSelected.length > 1) {
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage64"))
                        flag = false;
                        return;
                    }
                    if (flag) {
                        BusyIndicator.show(0);
                        // Insumos asignados a un MD.
                        let aFilterIns = [];
                        aFilterIns.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                        aFilterIns.push(new Filter("activo", "EQ", true));
                        let aInsumo = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_RE_INSUMO", aFilterIns);


                        if (oDataSeleccionada.getData().aEstructura.results.length > 0) {
                            oDataSeleccionada.getData().aEstructura.results.forEach(async function (e) {
                                if (e.estructuraId.tipoEstructuraId_iMaestraId !== sIdTipoEstructuraFormula) {
                                    let idMdEstructura = e.mdEstructuraId;
                                    let itm = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", itm, idMdEstructura);
                                    let aListEquipo = [];
                                    let aListEtiqueta = [];
                                    let aListPaso = [];
                                    let aListUtensilio = [];
                                    let aListPasoInsumoPaso = [];

                                    aListPaso = e.aPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                                    aListEquipo = e.aEquipo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                                    aListEtiqueta = e.aEtiqueta.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                                    aListUtensilio = e.aUtensilio.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                                    aListPasoInsumoPaso = e.aPasoInsumoPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                                    
                                    if (aListPaso.length > 0) {
                                        aListPaso.forEach(async function (e) {
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", itm, e.mdEstructuraPasoId);
                                        });
                                    }
                                    if (aListEquipo.length > 0) {
                                        aListEquipo.forEach(async function (e) {
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", itm, e.mdEstructuraEquipoId);
                                        });
                                    }
                                    if (aListEtiqueta.length > 0) {
                                        aListEtiqueta.forEach(async function (e) {
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", itm, e.mdEsEtiquetaId);
                                        });
                                    }
                                    if (aListUtensilio.length > 0) {
                                        aListUtensilio.forEach(async function (e) {
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", itm, e.mdEstructuraUtensilioId);
                                        });
                                    }
                                    if (aListPasoInsumoPaso.length > 0) {
                                        aListPasoInsumoPaso.forEach(async function (e) {
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", itm, e.mdEstructuraPasoInsumoPasoId);
                                        });
                                    }
                                }
                            });
                        }

                        let oSelectedMD = mdSelected[0].getBindingContext("localModel").getObject();
                        let aFilter = [];
                        aFilter.push(new Filter("mdId_mdId", "EQ", oSelectedMD.mdId));
                        let sExpand = "aPaso/aFormula,aEquipo,aUtensilio,aEtiqueta,aPasoInsumoPaso/aFormula,aEspecificacion,estructuraId";
                        let aEstructuraMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilter, sExpand);
                        let aListEstructurasRMD = [];
                        let aPasos = [];
                        let aPasosInsumosPasos = [];
                        let aFormulaGeneral = {
                            id : util.onGetUUIDV4(),
                            aFormula : []
                        }

                        aEstructuraMD.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });

                        let oParam = {
                            codigoOriginalCopia: oSelectedMD.codigo
                        }
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, oDataSeleccionada.getData().mdId);

                        for await (const oEstructura of aEstructuraMD.results) {
                            if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId !== sIdTipoEstructuraFormula) {
                                let oParam = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    mdEstructuraId: util.onGetUUIDV4(),
                                    orden: oEstructura.orden,
                                    mdId_mdId: oDataSeleccionada.getData().mdId,
                                    estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                                    aPaso: [],
                                    aEquipo : [],
                                    aUtensilio : [],
                                    aEtiqueta: [],
                                    aPasoInsumoPaso: [],
                                    aEspecificacion: []
                                }
                                aListEstructurasRMD.push(oParam);

                                let aEtiquetas = [];

                                //AGREGAMOS LAS ETIQUETAS A LA ESTRUCTURA
                                if (oEstructura.aEtiqueta.results.length > 0) {
                                    oEstructura.aEtiqueta.results.forEach(async function (oEtiqueta) {
                                        let mdEsEtiquetaIdActual = util.onGetUUIDV4();
                                        aEtiquetas.push({mdEsEtiquetaIdAntiguo: oEtiqueta.mdEsEtiquetaId, mdEsEtiquetaIdActual: mdEsEtiquetaIdActual});
                                        let oEtiquetaObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                            mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                            estructuraId_estructuraId: oEtiqueta.estructuraId_estructuraId,
                                            mdId_mdId: oDataSeleccionada.getData().mdId,
                                            etiquetaId_etiquetaId: oEtiqueta.etiquetaId_etiquetaId,
                                            orden: oEtiqueta.orden,
                                            conforme: oEtiqueta.conforme,
                                            procesoMenor: oEtiqueta.procesoMenor
                                        }
                                        oParam.aEtiqueta.push(oEtiquetaObj);
                                    });
                                }

                                //AGREGAMOS LOS PASOS A LA ESTRUCTURA
                                if (oEstructura.aPaso.results.length > 0) {
                                    for await (const oPaso of oEstructura.aPaso.results) {
                                    // oEstructura.aPaso.results.forEach(function (oPaso) {
                                        let mdEstructuraPasoIdActual = util.onGetUUIDV4();
                                        aPasos.push({mdEstructuraPasoIdAntiguo: oPaso.mdEstructuraPasoId, mdEstructuraPasoIdActual: mdEstructuraPasoIdActual});

                                        let mdEsEtiquetaIdActual = null;
                                        let oEtiqueta;
                                        if (oPaso.mdEsEtiquetaId_mdEsEtiquetaId) {
                                            oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oPaso.mdEsEtiquetaId_mdEsEtiquetaId);
                                            if (oEtiqueta) {
                                                mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                            }
                                        }
                                        
                                        let oPasoObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                            mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                            estructuraId_estructuraId: oPaso.estructuraId_estructuraId,
                                            mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                            mdId_mdId: oDataSeleccionada.getData().mdId,
                                            pasoId_pasoId: oPaso.pasoId_pasoId,
                                            orden: oPaso.orden,
                                            valorInicial: oPaso.valorInicial,
                                            valorFinal: oPaso.valorFinal,
                                            margen: oPaso.margen,
                                            decimales: oPaso.decimales,
                                            mdEstructuraPasoIdDepende: mdEstructuraPasoIdActual,
                                            depende: oPaso.depende,
                                            dependeMdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                            estadoCC: oPaso.estadoCC,
                                            estadoMov: oPaso.estadoMov,
                                            pmop: oPaso.pmop,
                                            genpp: oPaso.genpp,
                                            tab: oPaso.tab,
                                            edit: oPaso.edit,
                                            rpor: oPaso.rpor,
                                            vb: oPaso.vb,
                                            formato : oPaso.formato,
                                            colorHex : oPaso.colorHex,
                                            colorRgb : oPaso.colorRgb,
                                            imagen : false,
                                            tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                            flagModif : false,
                                            puestoTrabajo : oPaso.puestoTrabajo,
                                            clvModelo : oPaso.clvModelo,
                                            automatico : oPaso.automatico,
                                            aFormula : oPaso.aFormula.results,
                                            tipoDatoIdAnterior_iMaestraId: oPaso.tipoDatoId_iMaestraId
                                        }
                                        oParam.aPaso.push(oPasoObj);
                                    }

                                    for await (const oPaso of oParam.aPaso) {
                                    // oParam.aPaso.forEach(function (oPaso) {
                                        let oPasoActual;
                                        if (oPaso.dependeMdEstructuraPasoId) {
                                            oPasoActual = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oPaso.dependeMdEstructuraPasoId);
                                            if (oPasoActual) {
                                                oPaso.dependeMdEstructuraPasoId = oPasoActual.mdEstructuraPasoIdActual;
                                            }
                                        }

                                        if (oPaso.aFormula.length > 0) {
                                            for await (const oFormula of oPaso.aFormula) {
                                            // oPaso.aFormula.forEach(function (oFormula) {
                                                oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                                oFormula.fechaRegistro = new Date();
                                                oFormula.activo = true;
                                                oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                                oFormula.usuarioActualiza = null;
                                                oFormula.fechaActualiza = null;
                                                oFormula.mdId_mdId = oDataSeleccionada.getData().mdId;
                                                oFormula.pasoFormulaIdPM_mdEstructuraPasoInsumoPasoId = null;
                                                let oPasoActualPadre = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoPadreId_mdEstructuraPasoId);
                                                if (oPasoActualPadre) {
                                                    oFormula.pasoPadreId_mdEstructuraPasoId = oPasoActualPadre.mdEstructuraPasoIdActual;
                                                }
                                                if (oFormula.esPaso) {
                                                    let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                    if (oPasoActualFormula) {
                                                        oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                    }
                                                }
                                                aFormulaGeneral.aFormula.push(oFormula);
                                            }
                                        }
                                        oPaso.aFormula = [];
                                    }
                                }

                                //AGREGAMOS LOS EQUIPOS A LA ESTRUCTURA
                                if (oEstructura.aEquipo.results.length > 0) {
                                    oEstructura.aEquipo.results.forEach(async function (oEquipo) {
                                        let oEquipoObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraEquipoId: util.onGetUUIDV4(),
                                            mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                            estructuraId_estructuraId: oEquipo.estructuraId_estructuraId,
                                            mdId_mdId: oDataSeleccionada.getData().mdId,
                                            equipoId_equipoId: oEquipo.equipoId_equipoId,
                                            orden: oEquipo.orden
                                        }
                                        oParam.aEquipo.push(oEquipoObj);
                                    });
                                }
                    
                                //AGREGAMOS LOS UTENSILIOS A LA ESTRUCTURA
                                if (oEstructura.aUtensilio.results.length > 0) {
                                    oEstructura.aUtensilio.results.forEach(async function (oUtensilio) {
                                        let oUtensiliooBJ = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraUtensilioId: util.onGetUUIDV4(),
                                            mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                            estructuraId_estructuraId: oUtensilio.estructuraId_estructuraId,
                                            mdId_mdId: oDataSeleccionada.getData().mdId,
                                            utensilioId_utensilioId: oUtensilio.utensilioId_utensilioId,
                                            agrupadorId_clasificacionUtensilioId : oUtensilio.agrupadorId_clasificacionUtensilioId,
                                            orden: oUtensilio.orden
                                        }
                                        oParam.aUtensilio.push(oUtensiliooBJ);
                                    });
                                }
                    
                                //AGREGAMOS  LOS PROCESOS MENORES A LOS PASOS DE LA ETIQUETA DE LA ESTRUCTURA
                                if (oEstructura.aPasoInsumoPaso.results.length > 0) {
                                    for await (const oProcesoMenor of oEstructura.aPasoInsumoPaso.results) {
                                    // oEstructura.aPasoInsumoPaso.results.forEach(async function (oProcesoMenor) {
                                        let mdEstructuraPasoInsumoPasoIdActual = util.onGetUUIDV4();
                                        aPasosInsumosPasos.push({mdEstructuraPasoInsumoPasoIdAntiguo: oProcesoMenor.mdEstructuraPasoInsumoPasoId, mdEstructuraPasoInsumoPasoIdActual: mdEstructuraPasoInsumoPasoIdActual});
                                        // PARA SETEAR EL ID DE LA TABLA MD_ES_ETIQUETA
                                        let mdEsEtiquetaIdActual = null;
                                        let oEtiqueta;
                                        if (oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId) {
                                            oEtiqueta = aEtiquetas.find(itm=>itm.mdEsEtiquetaIdAntiguo === oProcesoMenor.mdEsEtiquetaId_mdEsEtiquetaId);
                                            if (oEtiqueta) {
                                                mdEsEtiquetaIdActual = oEtiqueta.mdEsEtiquetaIdActual;
                                            }
                                        }

                                        // PARA SETEAR EL ID DE LA TABLA MD_ES_PASO
                                        let mdEstructuraPasoIdActual = null;
                                        let oPaso;
                                        if (oProcesoMenor.pasoId_mdEstructuraPasoId) {
                                            oPaso = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oProcesoMenor.pasoId_mdEstructuraPasoId);
                                            if (oPaso) {
                                                mdEstructuraPasoIdActual = oPaso.mdEstructuraPasoIdActual;
                                            }
                                        }

                                        // SETEAR CODIGO DEL INSUMO SI YA EXISTE
                                        let sInsumo = oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId !== null ? oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId : null;
                                        let aFindInsumo = aInsumo.results.find(itm=>itm.Component === oProcesoMenor.Component && itm.Matnr === oProcesoMenor.Matnr);
                                        if (aFindInsumo) {
                                            sInsumo = aFindInsumo.estructuraRecetaInsumoId;
                                        }
                                        let oProcesoMenorObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            mdEstructuraPasoInsumoPasoId: mdEstructuraPasoInsumoPasoIdActual,
                                            mdEstructuraId_mdEstructuraId: oParam.mdEstructuraId,
                                            estructuraId_estructuraId: oProcesoMenor.estructuraId_estructuraId,
                                            mdId_mdId: oDataSeleccionada.getData().mdId,
                                            pasoId_mdEstructuraPasoId: mdEstructuraPasoIdActual,
                                            pasoHijoId_pasoId : oProcesoMenor.pasoHijoId_pasoId !== null ? oProcesoMenor.pasoHijoId_pasoId : null,
                                            tipoDatoId_iMaestraId : oProcesoMenor.tipoDatoId_iMaestraId,
                                            estructuraRecetaInsumoId_estructuraRecetaInsumoId : sInsumo,
                                            etiquetaId_etiquetaId: oProcesoMenor.etiquetaId_etiquetaId,
                                            mdEsEtiquetaId_mdEsEtiquetaId: mdEsEtiquetaIdActual,
                                            mdEstructuraPasoInsumoPasoIdAct: mdEstructuraPasoInsumoPasoIdActual,
                                            orden : oProcesoMenor.orden,
                                            valorInicial : oProcesoMenor.valorInicial,
                                            valorFinal : oProcesoMenor.valorFinal,
                                            margen : oProcesoMenor.margen,
                                            cantidadInsumo : oProcesoMenor.cantidadInsumo,
                                            decimales : oProcesoMenor.decimales,
                                            estadoCC : oProcesoMenor.estadoCC,
                                            estadoMov : oProcesoMenor.estadoMov,
                                            genpp : oProcesoMenor.genpp,
                                            edit : oProcesoMenor.edit,
                                            tab : oProcesoMenor.tab,
                                            formato : oProcesoMenor.formato,
                                            colorHex : oProcesoMenor.colorHex,
                                            colorRgb : oProcesoMenor.colorRgb,
                                            flagModif : oProcesoMenor.flagModif,
                                            Component : oProcesoMenor.Component,
                                            Matnr : oProcesoMenor.Matnr,
                                            Maktx : oProcesoMenor.Maktx,
                                            CompUnit : oProcesoMenor.CompUnit,
                                            tipoDatoIdAnterior_iMaestraId: oProcesoMenor.tipoDatoId_iMaestraId,
                                            aFormula : oProcesoMenor.aFormula.results
                                        }
                                        oParam.aPasoInsumoPaso.push(oProcesoMenorObj);
                                    }

                                    for await (const oPasoInsumoPaso of oParam.aPasoInsumoPaso) {
                                        if (oPasoInsumoPaso.aFormula.length > 0) {
                                            for await (const oFormula of oPasoInsumoPaso.aFormula) {
                                            // oPaso.aFormula.forEach(function (oFormula) {
                                                oFormula.usuarioRegistro = oInfoUsuario.data.usuario;
                                                oFormula.fechaRegistro = new Date();
                                                oFormula.activo = true;
                                                oFormula.mdFormulaPaso = util.onGetUUIDV4();
                                                oFormula.usuarioActualiza = null;
                                                oFormula.fechaActualiza = null;
                                                oFormula.mdId_mdId = oDataSeleccionada.getData().mdId;
                                                oFormula.pasoFormulaIdPM_mdEstructuraPasoInsumoPasoId = null;
                                                let oPasoInsumoPasoActualPadre = aPasosInsumosPasos.find(itm=>itm.mdEstructuraPasoInsumoPasoIdAntiguo === oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId);
                                                if (oPasoInsumoPasoActualPadre) {
                                                    oFormula.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = oPasoInsumoPasoActualPadre.mdEstructuraPasoInsumoPasoIdActual;
                                                }
                                                if (oFormula.esPaso) {
                                                    let oPasoActualFormula = aPasos.find(itm=>itm.mdEstructuraPasoIdAntiguo === oFormula.pasoFormulaId_mdEstructuraPasoId);

                                                    if (oPasoActualFormula) {
                                                        oFormula.pasoFormulaId_mdEstructuraPasoId = oPasoActualFormula.mdEstructuraPasoIdActual;
                                                    }
                                                }
                                                aFormulaGeneral.aFormula.push(oFormula);
                                            }
                                        }
                                        oPasoInsumoPaso.aFormula = [];
                                    }
                                }

                                //AGREGAMOS LAS ESPECIFICACIONES LA ESTRUCTURA
                                if (oEstructura.aEspecificacion.results.length > 0) {
                                    oEstructura.aEspecificacion.results.forEach(async function (oEspecificacion) {
                                        let oEspecificacionObj = {
                                            usuarioRegistro : oInfoUsuario.data.usuario,
                                            fechaRegistro : new Date(),
                                            activo : true,
                                            mdEstructuraEspecificacionId : util.onGetUUIDV4(),
                                            mdEstructuraId_mdEstructuraId : oParam.mdEstructuraId,
                                            estructuraId_estructuraId : oEspecificacion.estructuraId_estructuraId,
                                            mdId_mdId : oDataSeleccionada.getData().mdId,
                                            ensayoPadreSAP: oEspecificacion.ensayoPadreSAP,
                                            ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                            ensayoHijo : oEspecificacion.ensayoHijo,
                                            especificacion: oEspecificacion.especificacion,
                                            tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                            valorInicial : oEspecificacion.valorInicial,
                                            valorFinal : oEspecificacion.valorFinal,
                                            margen : oEspecificacion.margen,
                                            decimales : oEspecificacion.decimales,
                                            orden : oEspecificacion.orden,
                                            Merknr : oEspecificacion.Merknr
                                        }
                                        oParam.aEspecificacion.push(oEspecificacionObj);
                                    });
                                }
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oParam);
                            }
                        }
                        if (aFormulaGeneral.aFormula.length > 0) {
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", aFormulaGeneral);
                        }
                        await oThatConf.onSaveCantidadRm();
                        BusyIndicator.hide();
                        oThatConf.onCancelCopiarDeRM();
                        oThatConf.onCancelEditarRM();
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage65"));
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(oError.responseText);
                }
            },

            // ABRIR FORMULA
            onOpenFormulas: async function (oEvent) {
                let aDataPaso = oEvent.getSource().getBindingContext("aListPasoAssignResponsive").getObject();
                oThat.localModel.setProperty("/listMsEstructuraPaso",aDataPaso); //añadimos el modelo para mapear los registros
                if (!this.oOpenFormula) {
                    this.oOpenFormula = sap.ui.xmlfragment(
                        "frgOpenFormula",
                        rootPath + ".view.fragment.editarRM.OpenFormula",
                        this
                    );
                    oThat.getView().addDependent(this.oOpenFormula);
                }

                this.oOpenFormula.open();
                this.onObtenerEstructurasPasosFormulas(aDataPaso, true);
            },
         
            onObtenerEstructurasPasosFormulas:async function (aDataPaso, bFlag) {
                sap.ui.core.BusyIndicator.show(0);
                try {
                    let oDataPrincipal = oThat.getView().getModel("asociarDatos"),
                        aDataPrincipalEstructure = oDataPrincipal.getData().aEstructura.results,
                        oModelDataFormula = [];
                // ultimos paso
                let date = new Date();
                let aFilter = []
                // aFilter.push(new Filter("usuarioRegistro","EQ",oInfoUsuario.data.usuario))
                if (bFlag) {
                    aFilter.push(new Filter("pasoPadreId_mdEstructuraPasoId","EQ",aDataPaso.mdEstructuraPasoId));
                } else {
                    aFilter.push(new Filter("mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId","EQ",aDataPaso.mdEstructuraPasoInsumoPasoId));
                }
                aFilter.push(new Filter("activo","EQ",true));
             
                let sExpand ="pasoFormulaId"
                let dataFormula =  await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_FORMULA_PASO", aFilter,sExpand);
                let arrListbyOrder;
                console.log(dataFormula);
                    //ordenamos la fecha 
                    if(dataFormula.results.length>0){
                        arrListbyOrder = dataFormula.results;
                        // dataFormula.results.sort(function (a, b) {
                        //     return b.fechaRegistro.getTime() - a.fechaRegistro.getTime();
                        // });
                        // let lastOrden = dataFormula.results[0].orden;
                        // arrListbyOrder = dataFormula.results.splice(0,lastOrden+1)
                        arrListbyOrder.sort((a,b)=> a.orden - b.orden)
                        let textForm ="";
                    
    
                        oThat.localModel.setProperty("/formulaText",textForm);
                    }
                    
                    aDataPrincipalEstructure.sort(function (a, b) {
                        return a.orden - b.orden;
                    });
                        
                    for await (const item of aDataPrincipalEstructure) {
                        if (item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro) {
                            for await (const itemPaso of item.aPaso.results) {
                                oModelDataFormula.push({
                                    descrEstructura: item.estructuraId.descripcion,
                                    orden: itemPaso.orden,
                                    codigo: itemPaso.pasoId.codigo,
                                    descrPaso: itemPaso.pasoId.descripcion,
                                    pasoPadreId: itemPaso.mdEstructuraPasoId,
                                    mdEstructuraPasoId: aDataPaso.mdEstructuraPasoId,
                                    rank: 0,
                                    state: 'None'
                                });
                            }
                        }
                        if (item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) {
                            let aDataPrincipalEtiqueta = item.aEtiqueta.results;
                            aDataPrincipalEtiqueta.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            for await (const oEtiqueta of aDataPrincipalEtiqueta) {
                                let aPasosEtiqueta = item.aPaso.results.filter(itm=>itm.pasoId.etiquetaId_etiquetaId === oEtiqueta.etiquetaId_etiquetaId);
                                aPasosEtiqueta.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
                                for await (const itemPaso of aPasosEtiqueta) {
                                    oModelDataFormula.push({
                                        descrEstructura: item.estructuraId.descripcion + ' - ' + oEtiqueta.etiquetaId.descripcion,
                                        orden: itemPaso.orden,
                                        codigo: itemPaso.pasoId.codigo,
                                        descrPaso: itemPaso.pasoId.descripcion,
                                        pasoPadreId: itemPaso.mdEstructuraPasoId,
                                        mdEstructuraPasoId: aDataPaso.mdEstructuraPasoId,
                                        rank: 0,
                                        state: 'None'
                                    });

                                    let aPasoInsumoPasoEtiqueta = item.aPasoInsumoPaso.results.filter(itm=>itm.etiquetaId_etiquetaId === oEtiqueta.etiquetaId_etiquetaId && itm.pasoId_mdEstructuraPasoId === itemPaso.mdEstructuraPasoId);
                                    aPasoInsumoPasoEtiqueta.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });

                                    for await (const itemPasoI of aPasoInsumoPasoEtiqueta) {
                                        if (itemPasoI.pasoHijoId_pasoId) {
                                            oModelDataFormula.push({
                                                descrEstructura: item.estructuraId.descripcion + ' - ' + oEtiqueta.etiquetaId.descripcion,
                                                orden: itemPasoI.orden,
                                                codigo: itemPasoI.pasoHijoId.codigo,
                                                descrPaso: formatter.onGetI18nText(oThat, "fmProcesoMenor") + ' ' + itemPasoI.pasoHijoId.descripcion,
                                                // pasoPadreId: itemPasoI.mdEstructuraPasoId,
                                                pasoPadreId: itemPasoI.pasoId_mdEstructuraPasoId,
                                                mdEstructuraPasoId: aDataPaso.mdEstructuraPasoId,
                                                mdEstructuraPasoInsumoPasoId: itemPasoI.mdEstructuraPasoInsumoPasoId,
                                                rank: 0,
                                                state: 'Error'
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }

                    let arrFormulasGrabadas=[]
                    
                    if(!formatter.isNotAvailable(arrListbyOrder)){ //validamosq haya registros

                        arrListbyOrder.map(itemx=>{
                            let obj ={};
                            oModelDataFormula.map(itemy=>{
                                //mapeamos el item con el campo pasoPadreId
                                obj.mdFormulaPaso=itemx.mdFormulaPaso;
                                obj.pasoPadreId=itemx.pasoPadreId_mdEstructuraPasoId;
                                if(itemx.pasoFormulaId_mdEstructuraPasoId === itemy.pasoPadreId  && itemx.valor == itemy.codigo){
                                    obj.descrEstructura=itemx.esPaso ? itemy.descrEstructura:"";
                                    obj.descrPaso= itemx.esPaso ?  itemy.descrPaso : "";
                                    
                                    itemy.rank=10;
                                    obj.orden=itemy.orden;
                                }
                            })
                            obj.rank=10;
                            obj.codigo= itemx.valor;
                            if (itemx.valor === 'CT') {
                                obj.descrPaso = 'Cantidad Teorica';
                            }
                            arrFormulasGrabadas.push(obj);
                            
                        })
                    }

                    console.log("___PRINT___");
                    console.log(arrFormulasGrabadas);
                    oThat.localModel.setProperty("/aListFormulaPasoDisponibleSeleccionados",arrFormulasGrabadas);
                    this._mssgPrintFormula(arrFormulasGrabadas);
                    oThat.localModel.setProperty("/flagShowFormulas",false);
                    oThat.localModel.refresh(true);

                    let oModelformula = new JSONModel(oModelDataFormula);
                    oModelformula.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelformula, "aListFormulaPasoDisponible");
                    sap.ui.core.BusyIndicator.hide();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(oError.responseText);
                }
            },
            onTxFormulaPaso :async function(){
                BusyIndicator.show(0);
                let mdPasoPrev = oThat.localModel.getProperty("/listMsEstructuraPaso");
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let tablaSeleccionados = oThat.localModel.getProperty("/aListFormulaPasoDisponibleSeleccionados");
                let i = 0;
                for await(const e of tablaSeleccionados){
                    let oParam = {
                        usuarioRegistro                     : oInfoUsuario.data.usuario,
                        fechaRegistro                       : new Date(),
                        activo                              : true,
                        mdFormulaPaso                       : util.onGetUUIDV4(),
                        esPaso                              : e.descrPaso ? true : false,
                        pasoFormulaId_mdEstructuraPasoId    : e.pasoPadreId,
                        valor                               : e.codigo.toString(),
                        orden                               : i,
                        mdId_mdId                           : oDataSeleccionada.getData().mdId
                    }

                    if (oParam.esPaso) {
                        if(e.descrPaso.includes("Proceso menor")){
                            oParam.bFlagPM = true;
                            oParam.pasoFormulaIdPM_mdEstructuraPasoInsumoPasoId = e.mdEstructuraPasoInsumoPasoId;
                        }
                    }

                    if (e.codigo.toString() === 'CT') {
                        oParam.esPaso = false;
                    }

                    if (mdPasoPrev.mdEstructuraPasoId) {
                        oParam.pasoPadreId_mdEstructuraPasoId = mdPasoPrev.mdEstructuraPasoId;
                        let oParamFlag = {
                            usuarioActualiza: oInfoUsuario.data.usuario,
                            fechaActualiza: new Date(),
                            flagModif: true
                        }
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oParamFlag, mdPasoPrev.mdEstructuraPasoId);
                    }

                    if (mdPasoPrev.mdEstructuraPasoInsumoPasoId) {
                        oParam.mdEstructuraPasoInsumoPasoId_mdEstructuraPasoInsumoPasoId = mdPasoPrev.mdEstructuraPasoInsumoPasoId;
                        let oParamFlag = {
                            usuarioActualiza: oInfoUsuario.data.usuario,
                            fechaActualiza: new Date(),
                            flagModif: true
                        }
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oParamFlag, mdPasoPrev.mdEstructuraPasoInsumoPasoId);
                    }
                    
                     //si existe el campo identificador solo actualizamos el orden;
                    if(!formatter.isNotAvailable(e.mdFormulaPaso)){
                        let obj = {
                            orden:i
                        }
                        let sId = e.mdFormulaPaso;
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_FORMULA_PASO", obj,sId);
                        
                    }else{
                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_FORMULA_PASO", oParam);
                    }
                    i++;
                }
         
            sap.ui.core.BusyIndicator.hide();

            },
            onSaveOpenFormula: async function () {
                try {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "sMessageConfirmSaveFormula"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async function (sAction) {
                            if (sAction === "OK") {
                                await oThatConf.onTxFormulaPaso(); //se modularizo esta acción para replicar al momento de salir del modal
                                oThatConf.onCanceloOpenFormula();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectFormula"));
                            }
                        },
                    });
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(oError.responseText);
                }
            },

            onCanceloOpenFormula: async function () {
                // if( oThat.localModel.getProperty("/enabledChangeFormulas")){
                // }
                this.localModel.setProperty("/aListFormulaPasoDisponibleSeleccionados", []);
                this.localModel.setProperty("/formulaText", '');
                this.localModel.setProperty("/formulaInput", '');
                this.localModel.setProperty("/formulaCombobox", '000');
                this.oOpenFormula.close();
            },

            onIngresarCantidad: function (oEvent, bFlag) {
                let cantidad,
                    descripcion,
                    oData = {};
                if (bFlag === 2) {
                    cantidad = oEvent.getSource().getSelectedKey();
                    if (cantidad === 'CT') {
                        descripcion = oEvent.getSource()._getSelectedItemText();
                    }
                } else if (bFlag === 1) {
                    cantidad = oEvent.getSource().getProperty("value");
                }
                oData.rank = 10;
                let listaFormula = this.localModel.getProperty(
                    "/aListFormulaPasoDisponibleSeleccionados"
                );
             
                if (cantidad !== '000') {
                    oData.codigo = cantidad;
                    oData.descrPaso = descripcion;
            
                    let num = 0;
                    listaFormula.push(oData);
                    this._mssgPrintFormula(listaFormula);
                }
                   
                    // this.localModel.refresh(true);
                    // var text = "";
                    // listaFormula.forEach(function (e) {
                    //     if (e.items) {
                    //         text = text + " COD(" + e.codigo + ") ";
                    //     } else {
                    //         text = text + " " + e.codigo + " ";
                    //     }
                        
                    // });

                    // this.localModel.setProperty("/formulaText", text);
                // }
            },

            // onSeleccionarSigno: function (oEvent) {
            //     var signoSeleccionado = oEvent.getSource().getSelectedKey();
            //     if (signoSeleccionado !== "000") {
            //         var Rank = 10;
            //         var listaFormula = this.localModel.getProperty(
            //             "/aListFormulaPasoDisponibleSeleccionados"
            //         );
            //         var oData = {};
            //         oData.codigo = signoSeleccionado;
            //         oData.rank = Rank;
            //         listaFormula.push(oData);
            //         this.localModel.refresh(true);
            //         var text = "";
            //         let n =0;
            //         listaFormula.forEach(function (e) {
            //             if (e.items) {
            //                 text = text + " COD(" + e.codigo + ") ";
            //             } else {
            //                 text = text + " " + e.codigo + " ";
            //             }
            //         });

            //         this.localModel.setProperty("/formulaText", text);
            //     }
            // },
            _mssgPrintFormula:function(aList){
                var text = "";
                aList.forEach(function (e) {
                    if (e.items) {
                        text = text + " COD(" + e.codigo + ") ";
                    } else {
                        text = text + " " + e.codigo + " ";
                    }
                });

                this.localModel.setProperty("/formulaText", text);
                this.localModel.refresh(true);
            },
            moveToTable1: async function () {
                try {     
                    let tblPasoSeleccionado = sap.ui.core.Fragment.byId("frgOpenFormula", "table2"),
                        aIndexSeleccionado = tblPasoSeleccionado.getSelectedContextPaths();
                    if (aIndexSeleccionado.length > 0) {
                        let sIndexSeleccionado = aIndexSeleccionado[0].split("/")[2],
                            aListFormulaPasoSeleccionado = this.localModel.getProperty("/aListFormulaPasoDisponibleSeleccionados"),
                            oDataSeleccionada = aListFormulaPasoSeleccionado[sIndexSeleccionado];
                        //deshabilitamos este modelo_formula
                        if (oDataSeleccionada.mdFormulaPaso) {
                            let sId_ = oDataSeleccionada.mdFormulaPaso
                            let obj = {
                                activo:false
                            }
                            await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_FORMULA_PASO", obj, sId_);
                        }
                        aListFormulaPasoSeleccionado.splice(sIndexSeleccionado,1);
                        // if (sIndexSeleccionado - 1) {
                        //     delete aListFormulaPasoSeleccionado[sIndexSeleccionado - 1];
                        // }

                        let oListFormulaPasoDisponible = oThat.getView().getModel("aListFormulaPasoDisponible"),
                            aListFormulaPasoDisponible = oListFormulaPasoDisponible.getData();
                        // let match = aListFormulaPasoDisponible.find(
                        //     (item) => item.orden == oDataSeleccionada.orden
                        // );
                        aListFormulaPasoDisponible.map((item) => {
                            if(item.orden == oDataSeleccionada.orden){
                                    item.rank = 0;
                                }
                            });
                       
                            
                        this._mssgPrintFormula(aListFormulaPasoSeleccionado)
                        // var text = "";
                        // aListFormulaPasoSeleccionado.forEach(function (e) {
                        //     if (e.items) {
                        //         text = text + " COD(" + e.codigo + ") ";
                        //     } else {
                        //         text = text + " " + e.codigo + " ";
                        //     }
                        // });
                        // this.localModel.setProperty("/formulaText", text);
                        // this.localModel.refresh(true);
                        oListFormulaPasoDisponible.refresh(true);
                        tblPasoSeleccionado.removeSelections(true);
                    } else {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sMessageSelectedStepAvailable"));
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(oError.responseText);
                }
            },

            moveToTable2: function () {
                try {
                    // if(!oThat.localModel.getProperty("/flagShowFormulas")){
                    //     oThat.localModel.setProperty("/aListFormulaPasoDisponibleSeleccionados",[]);

                    //     oThat.localModel.refresh();
                    // }
                    //
                    oThat.localModel.setProperty("/enabledChangeFormulas",true);
                    let tblPasoDisponible = sap.ui.core.Fragment.byId("frgOpenFormula", "table1"),
                        aIndexSeleccionado = tblPasoDisponible.getSelectedContextPaths();
                    if (aIndexSeleccionado.length > 0) {
                        let sIndexSeleccionado = aIndexSeleccionado[0].split("/")[1],
                            aListFormulaPasoDisponible = oThat.getView().getModel("aListFormulaPasoDisponible"),
                            oDataSeleccionada = aListFormulaPasoDisponible.getData()[sIndexSeleccionado];
                        
                        oDataSeleccionada.rank = 10;
                        var listaFormula = this.localModel.getProperty(
                            "/aListFormulaPasoDisponibleSeleccionados"
                        );
                        listaFormula.push(oDataSeleccionada);
                        this._mssgPrintFormula(listaFormula);
                 
                        aListFormulaPasoDisponible.refresh(true);
                        tblPasoDisponible.removeSelections(true);
                    } else {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sMessageSelectedStepAvailable"));
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(oError.responseText);
                }
            },
            onObtenerProcMenores:async function (oEvent) {
                let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEtiqueta");
                let aDataPaso;

                if (oEvent) {
                    aDataPaso = oEvent.getSource().getBindingContext("aListPasoAssignResponsive").getObject();
                    let oModelPaso = new JSONModel(aDataPaso);
                    oThat.getView().setModel(oModelPaso, "headerAddPaso");

                    let oHeaderProccesMenores = {
                        descripcion : aDataPaso.pasoId.descripcion.substr(0,30),
                        codigo: aDataPaso.pasoId.codigo
                    };
                    oThat.getView().setModel(new JSONModel(oHeaderProccesMenores), "headerProcessMen");
                }
                
                if(!formatter.isNotAvailable(oDataSeleccionadaEst)){
                    oThatConf.onState(oDataSeleccionadaEst.getData().codigo, "nProcMenPaso");

                }
                await oThatConf.onGetMdPasoInsumoPaso(oDataSeleccionadaEst.getData()).then(function (aListMdEsPasoInsumoPaso, oError) {
                    let oListMdEsPasoInsumoPaso = aListMdEsPasoInsumoPaso.results;
                    if (oListMdEsPasoInsumoPaso.length > 0) {
                        $.each(oListMdEsPasoInsumoPaso, function (k, v) {
                            if (v.pasoHijoId) {
                                v.codigo = v.pasoHijoId.codigo;
                                v.descripcion = v.pasoHijoId.descripcion;
                                v.unidad = '';
                            } else if (v.estructuraRecetaInsumoId) {
                                v.codigo = v.estructuraRecetaInsumoId.Component;
                                v.descripcion = v.estructuraRecetaInsumoId.Maktx;
                                v.unidad = v.estructuraRecetaInsumoId.CompUnit;
                            } else {
                                // if (v.estructuraRecetaInsumoId_estructuraRecetaInsumoId) {
                                    v.codigo = v.Component;
                                    v.descripcion = v.Maktx;
                                    v.unidad = v.CompUnit;
                                // } 
                                // else {
                                //     v.codigo = '';
                                //     v.descripcion = '';
                                //     v.unidad = '';
                                // }
                            }
                            v.formulaButton = parseInt(v.tipoDatoId_iMaestraId) === sIdTipoDatoFormula ? true : false;
                            v.type = "PASO";
                            if (v.tipoDatoId_iMaestraId === sTipoDatoNumero || v.tipoDatoId_iMaestraId === sTipoDatoCantidad || v.tipoDatoId_iMaestraId === sIdTipoDatoFormula || v.tipoDatoId_iMaestraId === sTipoDatoMuestraCC || v.tipoDatoId_iMaestraId === sTipoDatoEntrega){
                                v.enabledValorInicial = false;
                                v.enabledValorFinal = false;
                                v.enabledMargen = false;
                                v.enabledDecimales = true;
                            } else if  (v.tipoDatoId_iMaestraId === sIdTipoDatoRango) {
                                v.enabledValorInicial = true;
                                v.enabledValorFinal = true;
                                v.enabledMargen = true;
                                v.enabledDecimales = true;
                            } else {
                                v.enabledValorInicial = false;
                                v.enabledValorFinal = false;
                                v.enabledMargen = false;
                                v.enabledDecimales = false;
                            }
                        });
                    }

                    oListMdEsPasoInsumoPaso.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    let oModel = new JSONModel(oListMdEsPasoInsumoPaso);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMdEsPasoInsumoPaso");

                    let aMemoData = JSON.parse(JSON.stringify(oListMdEsPasoInsumoPaso));
                    let oModelPasoResMemo = new JSONModel(aMemoData);
                    oModelPasoResMemo.setSizeLimit(999999999);

                    oThat.getView().setModel(oModelPasoResMemo, "listMdEsPasoInsumoPasoMemo");

                    //abre modal
                    if (oEvent) {
                        oThatConf.onOpenProcMenores();
                    }else{
                        oThatConf.onGetPasosToAssignProcess();
                    }
                    sap.ui.core.BusyIndicator.hide();
                }).catch(oError => {
                    sap.ui.core.BusyIndicator.hide();
                    oThatConf.onErrorMessage(oError, "errorSave");
                });
            },

            // Obtener la lista de la tabla de los pasos e insumos asociados a un proceso menor.
            //mcode revisar
            onGetMdPasoInsumoPaso:async function (oDataPasoEtiqueta) {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let oDataPasoSeleccionada = oThat.getView().getModel("headerAddPaso");
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    aFilters.push(new Filter("mdEstructuraId_mdEstructuraId", "EQ", oDataPasoEtiqueta.mdEstructuraId_mdEstructuraId));
                    aFilters.push(new Filter("mdEsEtiquetaId_mdEsEtiquetaId", "EQ", oDataPasoEtiqueta.mdEsEtiquetaId));
                    if (oDataPasoSeleccionada) {
                        if (oDataPasoSeleccionada.getData().mdEstructuraPasoId) {
                            aFilters.push(new Filter("pasoId_mdEstructuraPasoId", "EQ", oDataPasoSeleccionada.getData().mdEstructuraPasoId));
                        }
                    }
                    // let sExpand = "mdId,mdEstructuraId,mdEsEtiquetaId,pasoId/tipoDatoId,pasoId/pasoId/estadoId,pasoHijoId/tipoDatoId,pasoHijoId/estadoId,estructuraRecetaInsumoId,aEspecificacion/tipoDatoId,aPasoInsumoPaso/tipoDatoId";
                    let sExpand = "mdId,mdEstructuraId,mdEsEtiquetaId,pasoId/tipoDatoId,pasoId/pasoId/estadoId,pasoHijoId/tipoDatoId,pasoHijoId/estadoId,estructuraRecetaInsumoId";
                    await Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilters, sExpand).then(function (oListMdEsPasoInsumoPaso) {
                        resolve(oListMdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // ABRIR PROCESOS MENORES EDITAR RM
            onOpenProcMenores: function () {
                if (!this.oOpenProcMenores) {
                    this.oOpenProcMenores = sap.ui.xmlfragment(
                        "frgOpenProcMenores",
                        rootPath + ".view.fragment.editarRM.ProcMenores",
                        this
                    );
                    oThat.getView().addDependent(this.oOpenProcMenores);
                }

                this.oOpenProcMenores.open();
            },

            onCancelOpenProcMenores: function () {
                let oModelPaso = new JSONModel([]);
                oThat.getView().setModel(oModelPaso, "headerAddPaso");
                //mcode
                // oThatConf.onGetPasosToAssignProcess();
                oThatConf.onObtenerProcMenores(null);
                this.oOpenProcMenores.close();
            },

            onRefreshPasos: function () {
                let bStepPrincipal = oThat.getView().getModel("pasosPrincipales").getProperty("/state");
                if (!bStepPrincipal) {
                    oThatConf.onGetPasosEtiquetaPM();
                } else {
                    oThatConf.onAddPasosResponsive();
                }
            },

            onGetPasosEtiquetaPM: function (oEvent) {
                try {
                    let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEtiqueta");
                    this.onGetPaso(true).then(function (oListPaso, oError) {
                        let aPasos = oListPaso.results;
                        // let oListMdPaso = oThat.getView().getModel("listMdEsPaso");
                        // let oDataInsumosPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso");
                        let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEtiqueta");
                        // let oDataPaso = oThat.getView().getModel("headerAddPaso");
                        // let aPasosNoAsign = [];

                        // aPasos.forEach(function (element) {
                        //     let bFlag = true;
                        //     oListMdPaso.getData().forEach(function (item) {
                        //         if (element.pasoId === item.pasoId_pasoId && element.estructuraId_estructuraId === item.estructuraId_estructuraId && element.etiquetaId_etiquetaId === item.pasoId.etiquetaId_etiquetaId && element.activo === true) {
                        //             bFlag = false;
                        //             return false;
                        //         }
                        //     });

                        //     oDataInsumosPaso.getData().forEach(function (item) {
                        //         if (element.pasoId === item.pasoHijoId_pasoId && oDataPaso.getData().mdEstructuraPasoId === item.pasoId_mdEstructuraPasoId && element.activo === true) {
                        //             bFlag = false;
                        //             return false;
                        //         }
                        //     });

                        //     if (bFlag) {
                        //         aPasosNoAsign.push(element);
                        //     }
                        // });
                        // aPasosNoAsign = aPasosNoAsign.filter(itm=>itm.numeracion === false);
                        var oDataFilter = oThat.getView().getModel("oDataMdEsPaso");
                        oDataFilter.getData().estructuraId_estructuraId = oDataSeleccionadaEst.getData().estructuraId_estructuraId;
                        oDataFilter.getData().etiquetaId_etiquetaId = oDataSeleccionadaEst.getData().etiquetaId_etiquetaId;
                        oDataFilter.getData().numeracion = false;
                        oDataFilter.refresh();

                        let oModelEst = new JSONModel(aPasos);
                        oModelEst.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelEst, "aListPaso");

                        oThatConf.onState(false, "etiqueta");
                        oThatConf.onState(false, "pasosPrincipales");
                        oThatConf.onAddPasoPM();
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            // AGREGAR PASO A PROCESOS MENORES -- editarRM
            onAddPasoPM: function () {
                if (!this.oAddPasoPM) {
                    this.oAddPasoPM = sap.ui.xmlfragment(
                        "frgAddPasoPM",
                        rootPath + ".view.fragment.editarRM.AddPasoPM",
                        this
                    );
                    oThat.getView().addDependent(this.oAddPasoPM);
                }

                this.oAddPasoPM.open();
            },
            onCanceloAddPasoPM: function () {
                oThatConf.onCleanFilterPasos();
                this.oAddPasoPM.close();
            },

            // Confirmar la agregacion del paso.
            onAgregarPasosEditPM: function () {
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdPaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            oThatConf.onAsignPasoToPaso().then(async function (oDataRegister, oError) {
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThatConf.onGetPasosToAssignProcess();
                                await oThatConf.onObtenerProcMenores(null);
                                await oThatConf.onCanceloAddPasoPM();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDPaso"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            // Asignar pasos a un Paso de un PM.
            onAsignPasoToPaso: function () {
                sap.ui.core.BusyIndicator.show(0);
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oTblPaso = sap.ui.getCore().byId("frgAddPasoPM--idTblPaso"),
                        aPaths = oTblPaso._aSelectedPaths,
                        oListPaso = oThat.getView().getModel("aListPaso"),
                        aListDataPaso = oListPaso.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEtiquetaSeleccionada = oThat.getView().getModel("headerAddEtiqueta"),
                        oListMdEsPasoInsumoPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso"),
                        oPasoSeleccionada = oThat.getView().getModel("headerAddPaso"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura");

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDPasoNoData"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aDataEstPaso = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aPasoInsumoPaso: []
                    },

                        dDate = new Date();

                    $.each(aPaths, function (k, v) {
                        let sId = util.onGetUUIDV4();
                        aDataEstPaso.aPasoInsumoPaso.push(
                            {
                                terminal: null,
                                fechaRegistro: dDate,
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                activo: true,
                                mdEstructuraPasoInsumoPasoId: sId,
                                mdEstructuraPasoInsumoPasoIdAct: sId,
                                estructuraId_estructuraId: oEtiquetaSeleccionada.getData().estructuraId_estructuraId,
                                mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                                mdId_mdId: oMDSeleccionada.getData().mdId,
                                tipoDatoId_iMaestraId: aListDataPaso[v.split("/")[1]].tipoDatoId_iMaestraId,
                                pasoId_mdEstructuraPasoId: oPasoSeleccionada.getData().mdEstructuraPasoId,
                                pasoHijoId_pasoId: aListDataPaso[v.split("/")[1]].pasoId,
                                etiquetaId_etiquetaId: oEtiquetaSeleccionada.getData().etiquetaId_etiquetaId,
                                mdEsEtiquetaId_mdEsEtiquetaId: oEtiquetaSeleccionada.getData().mdEsEtiquetaId,
                                orden: oListMdEsPasoInsumoPaso.getData().length + k + 1,
                                decimales: aListDataPaso[v.split("/")[1]].decimales,
                                margen: aListDataPaso[v.split("/")[1]].margen,
                                valorInicial: aListDataPaso[v.split("/")[1]].valorInicial,
                                valorFinal: aListDataPaso[v.split("/")[1]].valorFinal,
                                tipoDatoIdAnterior_iMaestraId: aListDataPaso[v.split("/")[1]].tipoDatoId_iMaestraId
                            }
                        );
                    });

                    const sId = oEstructuraSeleccionada.getData().mdEstructuraId;
                    //mcode;
                    Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstPaso, sId).then(function (oDataSaved) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        reject(oError);
                    });
                });
            },

            // Eliminar Proceso menor
            onDelProcMen: function () {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage66"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage67"));
                        }
                    },
                });
            },

            // Editar Proceso Menor
            onEditarProcesoMen: function (oEvent) {
                var datos = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/editarProcM", datos);

                if (!this.oEditarProcM) {
                    this.oEditarProcM = sap.ui.xmlfragment(
                        "frgEditarProcM",
                        rootPath + ".view.fragment.editarRM.editar.EditarProcM",
                        this
                    );
                    oThat.getView().addDependent(this.oEditarProcM);
                }

                this.oEditarProcM.open();
            },
            onCanceloEditarProcM: function () {
                this.oEditarProcM.close();
            },

            oneditarProcM: function () {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage68"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage69"));
                            this.onCanceloEditarProcM();
                        }
                    },
                });
            },
            //mcode
            // MENU DE ACCIONES EDITAR RM
            onEditMenuActionProcess:async function (oEvent) {
                let press = oEvent.getSource().getProperty("text");
                let oEtiqueta = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                let sDescripcion = oEtiqueta.descripcion;
                if (!sDescripcion) {
                    oEtiqueta = oEvent
                        .getSource()
                        .getBindingContext("localModel")
                        .getObject().desc;
                }

                let oModel = new JSONModel(oEtiqueta);
                oThat.getView().setModel(oModel, "headerAddEtiqueta");
                await oThatConf.onObtenerProcMenores(null);
                if (press === "Adicionar Pasos RMD") {
                    await oThatConf.onGetPasosToAssignProcess();
                    await oThatConf.onGetListPredecesores();
                    await oThatConf.onGetDataCuadroProcessResponsive();
                }
            },

            onAddEtiqueta: function () {
                try {
                    this.onGetEtiqueta().then(function (oListEtiqueta) {
                        let aEtiquetas = oListEtiqueta.results;
                        let oListMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta");
                        let aEtiquetaNoAsign = [];

                        aEtiquetas.forEach(function (element) {
                            let bFlag = true;
                            oListMdEsEtiqueta.getData().forEach(function (item) {
                                if (element.etiquetaId === item.etiquetaId_etiquetaId && element.activo === true) {
                                    bFlag = false;
                                    return false;
                                }
                            });

                            if (bFlag) {
                                aEtiquetaNoAsign.push(element);
                            }
                        });

                        let oModelEst = new JSONModel(aEtiquetaNoAsign);
                        oModelEst.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelEst, "aListEtiqueta");
                        sap.ui.core.BusyIndicator.hide();

                        oThatConf.onAddEtiquetaEditRM();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                } catch (error) {
                    MessageBox.error(oError.responseText);
                }
            },

            onEditMdPasoEtiqueta: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                oThat.getView().getModel("listMdEsEtiquetaGeneral").setProperty(oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getPath() + "/editMdPaso", true);
            },

            onSaveEditMdPasoEtiqueta: async function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                oThat.getView().getModel("listMdEsEtiquetaGeneral").setProperty(oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getPath() + "/editMdPaso", false);
                var sFilter = [];
                sFilter.push(new Filter("contenido", "EQ", oContext.conforme));
                var consultarTipoDato = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MAESTRA", sFilter);
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    valorInicial: oContext.valorInicial,
                    valorFinal: oContext.valorFinal,
                    margen: oContext.margen,
                    decimales: oContext.decimales,
                    depende: oContext.depende,
                    estadoCC: oContext.estadoCC,
                    estadoMov: oContext.estadoMov,
                    pmop: oContext.pmop,
                    genpp: oContext.genpp,
                    edit: oContext.edit,
                    rpor: oContext.rpor,
                    vb: oContext.vb,
                    formato: oContext.formato,
                    colorHex: oContext.colorHex,
                    colorRgb: oContext.colorRgb,
                    imagen: oContext.imagen,
                    tipoDatoId_iMaestraId: consultarTipoDato.results[0].iMaestraId,
                    flagModif: oDataSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado ? true : false,
                    tipoDatoIdAnterior_iMaestraId: consultarTipoDato.results[0].iMaestraId
                }
                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, oContext.mdEstructuraPasoId);
            },

            onDelPasoToEtiqueta: function (oEvent) {
                var that = this;
                var oContext = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    activo: false
                }
                MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("warningDeletePaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, oContext.mdEstructuraPasoId);
                            MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDeletePaso"));
                            oThat.onGetDataEstructuraMD();
                            oThat.onCreateModelTree();
                        }
                    },
                });
            },

            onDelEtiqueta: function (oEvent) {
                var that = this;
                var oContext = oEvent.getSource().getBindingContext("listMdEsEtiquetaGeneral").getObject();
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    activo: false
                }
                MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("warningDeleteEtiqueta"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", oObj, oContext.mdEsEtiquetaId);
                            MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteEtiqueta"));
                            oThat.onGetDataEstructuraMD();
                            oThat.onCreateModelTree();
                        }
                    },
                });
            },

            onEditMdPasotoPaso: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                oThat.getView().getModel("listMdEsPasoInsumoPaso").setProperty(oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getPath() + "/editMdPaso", true);
            },

            onSaveEditMdPasotoPaso: async function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                oThat.getView().getModel("listMdEsPasoInsumoPaso").setProperty(oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getPath() + "/editMdPaso", false);
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    cantidadInsumo: oContext.cantidadInsumo,
                    valorInicial: oContext.valorInicial,
                    valorFinal: oContext.valorFinal,
                    margen: oContext.margen,
                    decimales: oContext.decimales,
                    depende: oContext.depende,
                    estadoCC: oContext.estadoCC,
                    estadoMov: oContext.estadoMov,
                    genpp: oContext.genpp,
                    edit: oContext.edit
                }
                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObj, oContext.mdEstructuraPasoInsumoPasoId);
                await oThatConf.onGetMdEsPasoInsumoPaso().then(function (oListMdEsPasoInsumoPaso, oError) {
                    let oModelEsPasoInsumoPaso = new JSONModel(oListMdEsPasoInsumoPaso.results);
                    oModelEsPasoInsumoPaso.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEsPasoInsumoPaso, "listEsPasoInsumoPasoGeneral");
                    oThat.getView().getModel("listEsPasoInsumoPasoGeneral").refresh(true);
                    sap.ui.core.BusyIndicator.hide();
                });

                let oModelMdEsReInsumo = oThat.getView().getModel("listMdEsReInsumo"),
                    oModelMdEsPasoInsumoPaso = oThat.getView().getModel("listEsPasoInsumoPasoGeneral");

                for await (const itemInsumo of oModelMdEsReInsumo.getData()) {
                    let nCantidadInsumoGeneral = 0;
                    for await (const itemInsumoAssign of oModelMdEsPasoInsumoPaso.getData()) {
                        if (itemInsumoAssign.estructuraRecetaInsumoId) {
                            if (itemInsumo.Component === itemInsumoAssign.estructuraRecetaInsumoId.Component) {
                                nCantidadInsumoGeneral += parseFloat(itemInsumoAssign.cantidadInsumo);
                            }
                        }
                    }

                    let oData = {
                        cantidadRm: nCantidadInsumoGeneral,
                        fechaActualiza: new Date(),
                        usuarioActualiza: oInfoUsuario.data.usuario,
                        estructuraRecetaInsumoId: itemInsumo.estructuraRecetaInsumoId
                    }

                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oData, itemInsumo.estructuraRecetaInsumoId);
                }
            },

            onDelPasotoPaso: function (oEvent) {
                var that = this;
                var oContext = oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                var oObj = {
                    usuarioActualiza: oInfoUsuario.data.usuario,
                    fechaActualiza: new Date(),
                    activo: false
                }
                MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("warningDeletePaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObj, oContext.mdEstructuraPasoInsumoPasoId);
                            await oThatConf.onGetMdEsPasoInsumoPaso().then(function (oListMdEsPasoInsumoPaso, oError) {
                                let oModelEsPasoInsumoPaso = new JSONModel(oListMdEsPasoInsumoPaso.results);
                                oModelEsPasoInsumoPaso.setSizeLimit(999999999);
                                oThat.getView().setModel(oModelEsPasoInsumoPaso, "listEsPasoInsumoPasoGeneral");
                                oThat.getView().getModel("listEsPasoInsumoPasoGeneral").refresh(true);
                                sap.ui.core.BusyIndicator.hide();
                            });

                            let oModelMdEsReInsumo = oThat.getView().getModel("listMdEsReInsumo"),
                                oModelMdEsPasoInsumoPaso = oThat.getView().getModel("listEsPasoInsumoPasoGeneral");

                            for await (const itemInsumo of oModelMdEsReInsumo.getData()) {
                                let nCantidadInsumoGeneral = 0;
                                for await (const itemInsumoAssign of oModelMdEsPasoInsumoPaso.getData()) {
                                    if (itemInsumoAssign.estructuraRecetaInsumoId) {
                                        if (itemInsumo.Component === itemInsumoAssign.estructuraRecetaInsumoId.Component) {
                                            nCantidadInsumoGeneral += parseInt(itemInsumoAssign.cantidadInsumo);
                                        }
                                    }
                                }

                                let oData = {
                                    cantidadRm: nCantidadInsumoGeneral,
                                    fechaActualiza: new Date(),
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    estructuraRecetaInsumoId: itemInsumo.estructuraRecetaInsumoId
                                }

                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oData, itemInsumo.estructuraRecetaInsumoId);
                            }
                            MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDeletePaso"));
                            oThatConf.onObtenerProcMenores(null);
                        }
                    },
                });
            },

            onGetInsumosEtiquetaPM: async function (oEvent) {
                try {
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let oDataSeleccionadaEst = oThat.getView().getModel("headerAddEtiqueta");
                    let oDataInsumos = oThat.getView().getModel("listMdEsReInsumo");
                    let oDataInsumosPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso");
                    let aInsumosNoAsign = [];
                    let aFilterMdReInsumo = [];

                    oDataInsumos.getData().forEach(function (element) {
                        let bFlag = true;
                        oDataInsumosPaso.getData().forEach(function (item) {
                            if (element.estructuraRecetaInsumoId === item.estructuraRecetaInsumoId_estructuraRecetaInsumoId && oDataSeleccionadaEst.getData().pasoId_pasoId === item.pasoId_mdEstructuraPasoId && element.activo === true) {
                                bFlag = false;
                                return false;
                            }
                        });

                        if (bFlag) {
                            aInsumosNoAsign.push(element);
                        }
                    });

                    if (oDataSeleccionada.getData().aReceta.results.length > 0) {
                        aFilterMdReInsumo = await aInsumosNoAsign.filter((oItem) => {
                            return oItem.mdRecetaId_mdRecetaId === oDataSeleccionada.getData().aReceta.results[0].mdRecetaId;
                        });
                    }

                    aFilterMdReInsumo.sort(function (a, b) {
                        return a.ItemNo - b.ItemNo;
                    });

                    let oModelEst = new JSONModel(aFilterMdReInsumo);
                    oModelEst.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEst, "aListInsumos");
                    oThatConf.onAddInsumoPM();
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            // AGREGAR INSUMO A PROCESOS MENORES -- editarRM
            onAddInsumoPM: function () {
                if (!this.oAddInsumoPM) {
                    this.oAddInsumoPM = sap.ui.xmlfragment(
                        "frgAddInsumoPM",
                        rootPath + ".view.fragment.editarRM.AddInsumoPM",
                        this
                    );
                    oThat.getView().addDependent(this.oAddInsumoPM);
                }

                this.oAddInsumoPM.open();
            },
            onCanceloAddInsumoPM: function () {
                this.oAddInsumoPM.close();
            },

            // Confirmar la agregacion del Insumo.
            onAgregarInsumoEditPM: function () {
                MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveMdPaso"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            oThatConf.onAsignInsumoToPaso().then(async function (oDataRegister, oError) {
                                await oThatConf.onSaveCantidadRm();
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThatConf.onGetPasosToAssignProcess();
                                await oThatConf.onCanceloAddInsumoPM();
                                await oThatConf.onObtenerProcMenores(null);
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDPaso"));
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThatConf.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            // Asignar Insumo a un Paso de un PM.
            onAsignInsumoToPaso: function () {
                sap.ui.core.BusyIndicator.show(0);
                return new Promise(function (resolve, reject) {
                    let oTblInsumo = sap.ui.getCore().byId("frgAddInsumoPM--idTblInsumo"),
                        aPaths = oTblInsumo._aSelectedPaths,
                        oListInsumo = oThat.getView().getModel("aListInsumos"),
                        aListDataInsumo = oListInsumo.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        oEtiquetaSeleccionada = oThat.getView().getModel("headerAddEtiqueta"),
                        oListMdEsPasoInsumoPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso"),
                        oPasoSeleccionada = oThat.getView().getModel("headerAddPaso"),
                        oEstructuraSeleccionada = oThat.getView().getModel("headerAddEstructura");

                    if (aPaths.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat, "sSaveCorrectMDInsumoNoData"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    let aDataEstPaso = {
                        mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                        aPasoInsumoPaso: []
                    },

                        dDate = new Date();

                    $.each(aPaths, function (k, v) {
                        aDataEstPaso.aPasoInsumoPaso.push(
                            {
                                terminal: null,
                                fechaRegistro: dDate,
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                activo: true,
                                mdEstructuraPasoInsumoPasoId: util.onGetUUIDV4(),
                                estructuraId_estructuraId: oEtiquetaSeleccionada.getData().estructuraId_estructuraId,
                                mdEstructuraId_mdEstructuraId: oEstructuraSeleccionada.getData().mdEstructuraId,
                                mdId_mdId: oMDSeleccionada.getData().mdId,
                                pasoId_mdEstructuraPasoId: oPasoSeleccionada.getData().mdEstructuraPasoId,
                                estructuraRecetaInsumoId_estructuraRecetaInsumoId: aListDataInsumo[v.split("/")[1]].estructuraRecetaInsumoId,
                                etiquetaId_etiquetaId: oEtiquetaSeleccionada.getData().etiquetaId_etiquetaId,
                                mdEsEtiquetaId_mdEsEtiquetaId: oEtiquetaSeleccionada.getData().mdEsEtiquetaId,
                                cantidadInsumo: parseFloat(aListDataInsumo[v.split("/")[1]].CompQty),
                                tipoDatoId_iMaestraId: sTipoDatoNumero,
                                decimales: 3,
                                orden: oListMdEsPasoInsumoPaso.getData().length + k + 1,
                                Component: aListDataInsumo[v.split("/")[1]].Component,
                                Matnr: aListDataInsumo[v.split("/")[1]].Matnr,
                                Maktx: aListDataInsumo[v.split("/")[1]].Maktx,
                                CompUnit: aListDataInsumo[v.split("/")[1]].CompUnit,
                                tipoDatoIdAnterior_iMaestraId: sTipoDatoNumero
                            }
                        );
                    });

                    const sId = oEstructuraSeleccionada.getData().mdEstructuraId;

                    Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", aDataEstPaso, sId).then(function (oDataSaved) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            // Obtener la lista de la tabla de los pasos e insumos asociados a un proceso menor de todo el MD.
            onGetMdEsPasoInsumoPaso: function (oDataPasoEtiqueta) {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,mdEstructuraId,estructuraId,mdEsEtiquetaId,etiquetaId,pasoId/tipoDatoId,pasoId/pasoId/estadoId,pasoHijoId/tipoDatoId,pasoHijoId/estadoId,estructuraRecetaInsumoId";
                    Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilters, sExpand).then(function (oListMdEsPasoInsumoPaso) {
                        resolve(oListMdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onRestoreFiltersGroups: function () {
                var oDataFilter = oThat.getView().getModel("oDataMdEstructura");
                oDataFilter.getData().description = "";
                var aFilter = [];
                sap.ui.getCore().byId("frgAdicNewMdEstructure--idTblMdEstructures").getBinding("items").filter(aFilter, FilterType.Application);
            },

            onSearchEquipment: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgAdicNewMdEquipment--idTblEquipment");
                    var oDataFilter = oThat.getView().getModel("oDataFilterEquipoUtensilio");
                    var aFilter = [];
                    if (oDataFilter.getData().codigo) {
                        aFilter.push(new Filter("equnr", FilterOperator.Contains, oDataFilter.getData().codigo));
                    }
                    if (oDataFilter.getData().descript) {
                        aFilter.push(new Filter("eqktx", FilterOperator.Contains, oDataFilter.getData().descript));
                    }
                    if (oDataFilter.getData().codGaci) {
                        aFilter.push(new Filter("codigoGaci", FilterOperator.Contains, oDataFilter.getData().codGaci));
                    }
                    if (oDataFilter.getData().estado) {
                        aFilter.push(new Filter("estat", FilterOperator.Contains, oDataFilter.getData().estado));
                    }
                    if (oDataFilter.getData().area) {
                        aFilter.push(new Filter("pltxt", FilterOperator.Contains, oDataFilter.getData().area));
                    }
                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            onSearchGroups: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgAddAgrupador--tblAgrupador");
                    var oDataFilter = oThat.getView().getModel("oDataFilterAgrupador");
                    var aFilter = [];
                    if (oDataFilter.getData().descripcion) {
                        aFilter.push(new Filter("tolower(descripcion)", FilterOperator.Contains, "'" + oDataFilter.getData().descripcion.toLowerCase().replace("'","''") + "'"));
                    }
                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },

            // Menu para ingresar a la data asignada de cada tipo de estructura de un RMD.
            onEditMenuActionResponsive: async function (oEvent) {
                let press = oEvent.getSource().getProperty("text");
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let oEstructura = oEvent.getSource().getBindingContext("listMdEstructuraGeneral").getObject();
                let sDescripcion = oEstructura.descripcion_est;
                if (!sDescripcion) {
                    oEstructura = oEvent
                        .getSource()
                        .getBindingContext("localModel")
                        .getObject().desc;
                }
                // await oThat._updateModelRest();

                let oModel = new JSONModel(oEstructura);
                oThat.getView().setModel(oModel, "headerAddEstructura");

                if (press === "Adicionar Pasos RMD") {
                    await oThatConf.onGetPasosToAssign();
                    await oThatConf.onGetListPredecesores();
                    await oThatConf.onGetDataCuadroResponsive();
                } else if (press === "Adicionar Pasos CA RMD") {
                    await oThatConf.onGetPasosToAssign();
                    await oThatConf.onGetDataCondicionesAmbientalesResponsive();
                } else if (press === "Adicionar Equipo") {
                    try {
                        await oThatConf.onOpenEquipo();
                    } catch (oError) {
                        oThatConf.onErrorMessage(oError, "errorSave");
                    }
                    await oThatConf.onGetDataEquipmentResponsive();
                } else if (press === "Adicionar Etiqueta") {
                    await oThatConf.onGetEtiquetasToAssign();
                    await oThatConf.onGetDataEtiquetasResponsive();
                } else if (press === "Adicionar Especificaciones") {
                    await oThatConf.onGetEspecificacionesToAssign();
                    await oThatConf.onGetDataEspecificacionesResponsive();
                } else if (press === "Ver Insumos") {
                    await oThatConf.onSaveCantidadRm();
                    let oModelMdEsReInsumo = oThat.getView().getModel("listMdEsReInsumo");
                    oDataSeleccionada.getData().aReceta.results.sort(function (a, b) {
                        return a.orden - b.orden;
                    });
                    
                    const aFilterMdReInsumo = await oModelMdEsReInsumo.getData().filter((oItem) => {
                        return (oItem.AiPrio === sAiPrio00 || oItem.AiPrio === sAiPrio01) &&  oEstructura.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId && oItem.mdRecetaId_mdRecetaId === oDataSeleccionada.getData().aReceta.results[0].mdRecetaId;
                    });

                    aFilterMdReInsumo.sort(function (a, b) {
                        return a.ItemNo - b.ItemNo;
                    });

                    let oModelPasoRes = new JSONModel(aFilterMdReInsumo);
                    oModelPasoRes.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelPasoRes, "aListInsumoAssignResponsive");
                    await oThatConf.onGetDataFormulaResponsive();
                }
            },

            onGetPasosToAssign: async function () {
                try {
                    let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                    let oModelMdEsPaso = oThat.getView().getModel("listMdEsPaso");
                    const aFilterMdPaso = await oModelMdEsPaso.getData().filter((oItem) => {
                        return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId;
                    });

                    oThat.getView().getModel("localModel").setProperty("/tipoDatoPasoMD", false);

                    $.each(aFilterMdPaso, function (k, v){
                        v.estadoCC = v.estadoCC === null ? false : v.estadoCC;
                        v.estadoMov = v.estadoMov === null ? false : v.estadoMov;
                        v.formato = v.formato === null ? false : v.formato;
                        v.imagen = v.imagen === null ? false : v.imagen;
                        if (v.dependeMdEstructuraPasoId) {
                            let pasoPredecesor = oModelMdEsPaso.getData().find(oPaso => oPaso.mdEstructuraPasoId === v.dependeMdEstructuraPasoId)
                            if (pasoPredecesor) {
                                v.ordenPredecesor = "(" + pasoPredecesor.orden + ")";
                            }
                        } else {
                            v.ordenPredecesor = "";
                        }
                        v.formulaButton = parseInt(v.tipoDatoId_iMaestraId) === sIdTipoDatoFormula ? true : false;
                        if (v.tipoDatoId_iMaestraId === sTipoDatoNumero || v.tipoDatoId_iMaestraId === sTipoDatoCantidad || v.tipoDatoId_iMaestraId === sIdTipoDatoFormula || v.tipoDatoId_iMaestraId === sTipoDatoMuestraCC || v.tipoDatoId_iMaestraId === sTipoDatoEntrega){
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = true;
                        } else if  (v.tipoDatoId_iMaestraId === sIdTipoDatoRango) {
                            v.enabledValorInicial = true;
                            v.enabledValorFinal = true;
                            v.enabledMargen = true;
                            v.enabledDecimales = true;
                        } else if (v.tipoDatoId_iMaestraId == sIdTipoDatoNotificacion) {
                            v.isEnabledCell = true;
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = false;
                            oThat.getView().getModel("localModel").setProperty("/tipoDatoPasoMD", true);
                        } else {
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = false;
                        } 
                    });

                    aFilterMdPaso.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    let oModelPasoRes = new JSONModel(aFilterMdPaso);
                    oModelPasoRes.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelPasoRes, "aListPasoAssignResponsive");
                    oThat.getView().getModel("aListPasoAssignResponsive").refresh(true);
                } catch (error) {
                    MessageBox.error(oError.responseText);
                }
            },

            // Fragmento con la lista de Pasos asignados a una estructura de un RMD.
            onGetDataCuadroResponsive: function () {
                if (!this.oCuadroResponsive) {
                    this.oCuadroResponsive = sap.ui.xmlfragment(
                        "frgAssignCuadro",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyCuadro",
                        this
                    );
                    oThat.getView().addDependent(this.oCuadroResponsive);
                }

                this.oCuadroResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Cuadro.
            onCancelCuadroResponsive: function () {
                this.oCuadroResponsive.close();
            },

            onGetDataEquipmentResponsive: function () {
                if (!this.oEquipmentResponsive) {
                    this.oEquipmentResponsive = sap.ui.xmlfragment(
                        "frgAdicNewMdEquipment",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyEquipment",
                        this
                    );
                    oThat.getView().addDependent(this.oEquipmentResponsive);
                }

                this.oEquipmentResponsive.open();
            },

            onCancelEquipmentResponsive: function () {
                this.oEquipmentResponsive.close();
            },

            // Adicionar pasos a la estructura de un RMD
            onAddPasosResponsive: function () {
                sap.ui.core.BusyIndicator.show(0);
                oThatConf.onCleanFilterPasos();
                let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                let oEtiqueta = oThat.getView().getModel("headerAddEtiqueta");

                if (!oEtiqueta || oEtiqueta.getData().length === 0) {
                    this.onGetPaso().then(function (oListPaso, oError) {
                        let aPasos = oListPaso.results;
                        let oListMdPaso = oThat.getView().getModel("listMdEsPaso");
                        // let aPasosNoAsign = [];
    
                        // aPasos.forEach(function (element) {
                        //     let bFlag = true;
                        //     oListMdPaso.getData().forEach(function (item) {
                        //         if (element.pasoId === item.pasoId_pasoId && element.estructuraId_estructuraId === item.estructuraId_estructuraId && element.activo === true) {
                        //             bFlag = false;
                        //             return false;
                        //         }
                        //     });
    
                        //     if (bFlag) {
                        //         aPasosNoAsign.push(element);
                        //     }
                        // });
    
                        var oDataFilter = oThat.getView().getModel("oDataMdEsPaso");
                        oDataFilter.getData().estructuraId_estructuraId = oEstructura.estructuraId_estructuraId;
                        oDataFilter.getData().numeracion = false;
                        oDataFilter.refresh();
    
                        let oModelEst = new JSONModel(aPasos);
                        oModelEst.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelEst, "aListPaso");

                        sTipoProcess = false;

                        oThatConf.onState(true, "etiqueta");
                        oThatConf.onState(true, "pasosPrincipales");
                        oThatConf.onAddEditarRM();
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                } else {
                    this.onGetPaso(true).then(function (oListPaso, oError) {
                        let aPasos = oListPaso.results;
                        let oListMdPaso = oThat.getView().getModel("listMdEsPaso");
                        let oDataInsumosPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso");
                        // let aPasosNoAsign = [];
    
                        // aPasos.forEach(function (element) {
                        //     let bFlag = true;
                        //     oListMdPaso.getData().forEach(function (item) {
                        //         if (element.pasoId === item.pasoId_pasoId && element.estructuraId_estructuraId === item.estructuraId_estructuraId && element.etiquetaId_etiquetaId === item.pasoId.etiquetaId_etiquetaId && element.activo === true) {
                        //             bFlag = false;
                        //             return false;
                        //         }
                        //     });
    
                        //     oDataInsumosPaso.getData().forEach(function (item) {
                        //         if (element.pasoId === item.pasoHijoId_pasoId && oEtiqueta.getData().pasoId_pasoId === item.pasoId_pasoId && element.activo === true) {
                        //             bFlag = false;
                        //             return false;
                        //         }
                        //     });
    
                        //     if (bFlag) {
                        //         aPasosNoAsign.push(element);
                        //     }
                        // });
    
                        var oDataFilter = oThat.getView().getModel("oDataMdEsPaso");
                        oDataFilter.getData().estructuraId_estructuraId = oEtiqueta.getData().estructuraId_estructuraId;
                        oDataFilter.getData().etiquetaId_etiquetaId = oEtiqueta.getData().etiquetaId_etiquetaId;
                        oDataFilter.getData().numeracion = false;
                        oDataFilter.refresh();
    
                        let oModelEst = new JSONModel(aPasos);
                        oModelEst.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelEst, "aListPaso");
                        
                        sTipoProcess = true;

                        oThatConf.onState(false, "etiqueta");
                        oThatConf.onState(true, "pasosPrincipales");
                        oThatConf.onAddEditarRM();
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                }
            },

            onAddEquipoResponsive: function () {
                BusyIndicator.show(0);
                oThatConf.onCleanFilterEquipo();
                let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                Promise.all([oThatConf.onGetEquipo(), oThatConf.onGetUtensilio()]).then(async values => {
                    let aEquipo = values[0].results;
                    let aUtensilio = values[1].results;
                    let oListMdEquipo = oThat.getView().getModel("listMdEsEquipo");
                    let oListMdUtensilio = oThat.getView().getModel("listMdEsUtensilio");
                    let aEquiposNoAsign = [];
                    let aUtensiliosNoAsign = [];
                    let aDataEquipoGeneral = [];
                
                    aEquipo.forEach(function (element) {
                        let bFlag = true;
                        oListMdEquipo.getData().forEach(function (item) {
                            if (element.Equipment === item.equipoId.equnr && item.estructuraId_estructuraId === oEstructura.estructuraId_estructuraId) {
                                bFlag = false;
                                return false;
                            }
                        });
                
                        if (bFlag) {
                            aEquiposNoAsign.push(element);
                        }
                    });
                
                    aUtensilio.forEach(function (element) {
                        let bFlag = true;
                        oListMdUtensilio.getData().forEach(function (item) {
                            if (element.utensilioId === item.utensilioId_utensilioId &&
                                 element.tipoId_iMaestraId === sIdTipoUtensilio && element.activo === true && item.estructuraId_estructuraId === oEstructura.estructuraId_estructuraId) {
                                bFlag = false;
                                return false;
                            }
                        });
                
                        if (bFlag) {
                            aUtensiliosNoAsign.push(element);
                        }
                    });
                
                    for await (const item of aEquiposNoAsign) {
                        aDataEquipoGeneral.push({
                            id: item.Equipment,
                            arbpl: item.Arbpl,
                            aufnr: "",
                            werks: item.Swerk,
                            auart: "",
                            ktext: "",
                            ilart: "",
                            sstat: item.Stat,
                            ustat: "",
                            ecali: "",
                            gstrp: "",
                            gltrp: "",
                            tplnr: item.SuperiorFuncloc,
                            pltxt: item.Funclocstrucidentifyingobjdes2,
                            equnr: item.Equipment,
                            eqtyp: item.Eqtyp,
                            estat: item.Txt30,
                            eqktx: item.Eqktx,
                            inbdt: item.Inbdt,
                            ctext: item.PpWkctr === '00000000' ? '' : item.PpWkctr,
                            abckz: item.Abcindic,
                            denom: item.Descmarcamodel,
                            codigoGaci: item.CodigoGaci,
                            tipoId: sIdTipoEquipo,
                            tipo: sTxtTipoEquipo
                        });
                    }
                
                    for await (const item of aUtensiliosNoAsign) {
                        aDataEquipoGeneral.push({
                            id: item.utensilioId,
                            aufnr: "",
                            werks: "",
                            auart: "",
                            ktext: "",
                            ilart: "",
                            sstat: "",
                            ustat: "",
                            ecali: "",
                            gstrp: "",
                            gltrp: "",
                            tplnr: "",
                            pltxt: "",
                            equnr: item.codigo,
                            eqtyp: "",
                            estat: item.estadoId.contenido,
                            eqktx: item.descripcion,
                            inbdt: "",
                            ctext: "",
                            abckz: "",
                            denom: item.descripcion,
                            tipoId: item.tipoId_iMaestraId,
                            tipo: item.tipoId.contenido
                        });
                    }
                
                    let oModelEqp = new JSONModel(aDataEquipoGeneral);
                    oModelEqp.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEqp, "aListEquipoUtensilio");
                
                    oThatConf.onAddEquipoEditRM();
                    BusyIndicator.hide();
                }).catch(function (oError) {
                    BusyIndicator.hide();
                    oThatConf.onErrorMessage(oError, "errorSave");
                });
            },

            onOpenEquipo: async function() {
                let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                let oModelMdEsEquipo = oThat.getView().getModel("listMdEsEquipo");
                let oModelMdEsUtensilio = oThat.getView().getModel("listMdEsUtensilio");
                const aFilterMdEquipo = await oModelMdEsEquipo.getData().filter((oItem) => {
                    return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId;
                });
                const aFilterMdUtensilio = await oModelMdEsUtensilio.getData().filter((oItem) => {
                    return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId;
                });
                let aMDEquipoUtensilio = aFilterMdEquipo.concat(aFilterMdUtensilio);
                // aMDEquipoUtensilio = aMDEquipoUtensilio.filter(itm=>itm.utensilioId);
                aMDEquipoUtensilio.forEach(function(oMDEquipoUtensilio){
                    if(oMDEquipoUtensilio.equipoId_equipoId) {
                        oMDEquipoUtensilio.codigo = oMDEquipoUtensilio.equipoId.equnr;
                        oMDEquipoUtensilio.descripcion = oMDEquipoUtensilio.equipoId.eqktx;
                        oMDEquipoUtensilio.estado = oMDEquipoUtensilio.equipoId.estat;
                        oMDEquipoUtensilio.area = oMDEquipoUtensilio.equipoId.pltxt;
                        oMDEquipoUtensilio.tipo = oMDEquipoUtensilio.equipoId.tipoId.contenido;
                        oMDEquipoUtensilio.visibleButtonCorregir = false;
                    } else {
                        if (oMDEquipoUtensilio.agrupadorId_clasificacionUtensilioId) {
                            oMDEquipoUtensilio.codigo = '';
                            oMDEquipoUtensilio.descripcion = oMDEquipoUtensilio.agrupadorId.descripcion;
                            oMDEquipoUtensilio.estado = '';
                            oMDEquipoUtensilio.area = '';
                            oMDEquipoUtensilio.tipo = 'AGRUPADOR';
                            oMDEquipoUtensilio.visibleButtonCorregir = false;
                        } else if (oMDEquipoUtensilio.utensilioId_utensilioId){
                            oMDEquipoUtensilio.codigo = oMDEquipoUtensilio.utensilioId ? oMDEquipoUtensilio.utensilioId.codigo : "";
                            oMDEquipoUtensilio.descripcion = oMDEquipoUtensilio.utensilioId ? oMDEquipoUtensilio.utensilioId.descripcion : "";
                            oMDEquipoUtensilio.estado = oMDEquipoUtensilio.utensilioId ? oMDEquipoUtensilio.utensilioId.estadoId.contenido : "";
                            oMDEquipoUtensilio.area = "";
                            oMDEquipoUtensilio.tipo = oMDEquipoUtensilio.utensilioId ? oMDEquipoUtensilio.utensilioId.tipoId.contenido : "";
                            oMDEquipoUtensilio.visibleButtonCorregir = oMDEquipoUtensilio.utensilioId ? false : true;
                        }
                    }
                });
                aMDEquipoUtensilio.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                let oModelEquipoRes = new JSONModel(aMDEquipoUtensilio);
                oModelEquipoRes.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEquipoRes, "aListEquipoAssignResponsive");
            },
            // Fragmento con la lista de Pasos asignados a una estructura de un RMD.
            onGetDataFormulaResponsive: function () {
                if (!this.oFormulaResponsive) {
                    this.oFormulaResponsive = sap.ui.xmlfragment(
                        "frgAssignFormula",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyFormula",
                        this
                    );
                    oThat.getView().addDependent(this.oFormulaResponsive);
                }

                this.oFormulaResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Formula.
            onCancelFormulaResponsive: function () {
                this.oFormulaResponsive.close();
            },

            onSavePasosResponsive: async function (sTipo) {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let oData = oThat.getView().getModel("aListPasoAssignResponsive").getData();
                let oDataMemo = [];
                if (oThat.getView().getModel("aListPasoAssignResponsiveMemo")) {
                    oDataMemo = oThat.getView().getModel("aListPasoAssignResponsiveMemo").getData();
                }
                if (sTipo === 'proceso') {
                    oData = oThat.getView().getModel("listMdEsPasoInsumoPaso").getData();
                    if (oThat.getView().getModel("listMdEsPasoInsumoPasoMemo")) {
                        oDataMemo = oThat.getView().getModel("listMdEsPasoInsumoPasoMemo").getData();
                    }
                }
                let flag = true;
                oData.forEach(function (oDataPasoVerif) {
                    let tipoDatoSelected = parseInt(oDataPasoVerif.tipoDatoId_iMaestraId);
                    if (tipoDatoSelected === sTipoDatoNumero || tipoDatoSelected === sTipoDatoCantidad || tipoDatoSelected === sIdTipoDatoFormula || tipoDatoSelected === sTipoDatoMuestraCC || tipoDatoSelected === sTipoDatoEntrega){
                        if(oDataPasoVerif.decimales === null || oDataPasoVerif.decimales === "") {
                            flag = false;
                        }
                    } else if  (tipoDatoSelected === sIdTipoDatoRango) {
                        if (!oDataPasoVerif.margen) {
                            oDataPasoVerif.margen = 0;
                        }
                        if(oDataPasoVerif.valorInicial === null || oDataPasoVerif.valorInicial === "" || oDataPasoVerif.valorFinal === null || oDataPasoVerif.valorFinal === "" || oDataPasoVerif.margen === null || oDataPasoVerif.margen === "" || oDataPasoVerif.decimales === null || oDataPasoVerif.decimales === "") {
                            flag = false;
                        }
                    }
                });
                if(flag){
                    BusyIndicator.show(0);
                    // let oTablaArrayInsert = {
                    //     usuarioRegistro : "USUARIOTEST",
                    //     fechaRegistro   : new Date(),
                    //     activo          : true,
                    //     aPasoMd         : [],
                    //     id              : util.onGetUUIDV4()
                    // }
                        
                    // oData.forEach(async function(oDataPaso) {
                    for await (const oDataPaso of oData) {
                        if (sTipo === 'proceso') {
                            var findMemo = oDataMemo.find(e => e.mdEstructuraPasoInsumoPasoId  === oDataPaso.mdEstructuraPasoInsumoPasoId );
                        }else{
                            var findMemo = oDataMemo.find(e => e.mdEstructuraPasoId  === oDataPaso.mdEstructuraPasoId );
                        }
                        if(JSON.stringify(oDataPaso) !== JSON.stringify(findMemo)){
                            let nId = oDataPaso.mdEstructuraPasoId;
                            let sTable = 'MD_ES_PASO';
                            let oParam,
                                bAutomatico = false;
                            if (oDataPaso.clvModelo === "SETPOST" || oDataPaso.clvModelo === "SETPRE") {
                                bAutomatico = true;
                            }
                            if (sTipo === 'proceso') {
                                nId = oDataPaso.mdEstructuraPasoInsumoPasoId;
                                sTable = 'MD_ES_PASO_INSUMO_PASO';
                                oParam = {
                                    fechaActualiza : new Date(),
                                    usuarioActualiza : oInfoUsuario.data.usuario,
                                    cantidadInsumo: oDataPaso.cantidadInsumo,
                                    // depende: oDataPaso.depende,
                                    tab: oDataPaso.tab,
                                    edit : oDataPaso.edit,
                                    tipoDatoId_iMaestraId : oDataPaso.tipoDatoId_iMaestraId,
                                    valorInicial : oDataPaso.valorInicial,
                                    valorFinal : oDataPaso.valorFinal,
                                    margen : oDataPaso.margen,
                                    decimales : oDataPaso.decimales,
                                    genpp : oDataPaso.genpp,
                                    estadoCC : oDataPaso.estadoCC,
                                    estadoMov : oDataPaso.estadoMov,
                                    colorHex : oDataPaso.colorHex,
                                    colorRgb : oDataPaso.colorRgb,
                                    formato:oDataPaso.formato,
                                    flagModif: oDataPaso.flagModif,
                                    tipoDatoIdAnterior_iMaestraId: oDataPaso.tipoDatoId_iMaestraId
                                }
                            } else {
                                oParam = {
                                    fechaActualiza : new Date(),
                                    usuarioActualiza : oInfoUsuario.data.usuario,
                                    tipoDatoId_iMaestraId : oDataPaso.tipoDatoId_iMaestraId == '' ? null : oDataPaso.tipoDatoId_iMaestraId,
                                    mdEstructuraPasoIdDepende: oDataPaso.mdEstructuraPasoIdDepende,
                                    depende: oDataPaso.depende,
                                    dependeMdEstructuraPasoId: formatter.isNotAvailable(oDataPaso.depende) ? "" : oDataPaso.dependeMdEstructuraPasoId,
                                    valorInicial : oDataPaso.valorInicial,
                                    valorFinal : oDataPaso.valorFinal,
                                    margen : oDataPaso.margen,
                                    decimales : oDataPaso.decimales,
                                    estadoCC : oDataPaso.estadoCC,
                                    estadoMov : oDataPaso.estadoMov,
                                    pmop : oDataPaso.pmop,
                                    genpp : oDataPaso.genpp,
                                    edit : oDataPaso.edit,
                                    rpor : oDataPaso.rpor,
                                    vb : oDataPaso.vb,
                                    tab : oDataPaso.tab,
                                    formato : oDataPaso.formato,
                                    imagen : oDataPaso.imagen,
                                    colorHex : oDataPaso.colorHex,
                                    colorRgb : oDataPaso.colorRgb,
                                    automatico : Number(oDataPaso.tipoDatoId_iMaestraId) === sIdTipoDatoNotificacion ? bAutomatico : null,
                                    clvModelo : Number(oDataPaso.tipoDatoId_iMaestraId) === sIdTipoDatoNotificacion ? oDataPaso.clvModelo : null,
                                    puestoTrabajo : Number(oDataPaso.tipoDatoId_iMaestraId) === sIdTipoDatoNotificacion ? oDataPaso.puestoTrabajo : null,
                                    flagModif: oDataPaso.flagModif,
                                    tipoDatoIdAnterior_iMaestraId: oDataPaso.tipoDatoId_iMaestraId == '' ? null : oDataPaso.tipoDatoId_iMaestraId
                                }
                            }
                            // oTablaArrayInsert.aPasoMd.push(oParam);
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, sTable, oParam, nId);
                        }
                    // });
                    }
                    if (sTipo === 'proceso') {
                        await oThatConf.onSaveCantidadRm();
                    }
                    // await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oTablaArrayInsert);
                    await oThat.onGetDataEstructuraMD();
                    await oThat.onCreateModelTree();
                    if (sTipo === 'procesoCuadro') {
                        await oThatConf.onGetPasosToAssignProcess();
                    } else if (sTipo === 'proceso') {
                        await oThatConf.onGetPasosToAssignProcess(sTipo);
                        await oThatConf.onObtenerProcMenores(null);
                    } else {
                        await oThatConf.onGetPasosToAssign();
                    }
                    BusyIndicator.hide();
                    MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEdit"));
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat, "sErrorCamposObligatorios"));
                }
            },

            onEditPasoGeneral: async function (oEvent) {
                try {
                    let datos;
                    // let aFilters = [];
                    if (oEvent.getSource().getBindingContext("aListPasoAssignResponsive")) {
                        datos = oEvent.getSource().getBindingContext("aListPasoAssignResponsive").getObject();
                        oThat.localModel.setProperty("/listMdEsPasoPadre",datos)

                        // aFilters.push(new Filter("descripcion", "EQ", datos.pasoId.descripcion));
                    }

                    if (!this.oEditPasoRM) {
                        this.oEditPasoRM = sap.ui.xmlfragment(
                            "frgEditPasoRM",
                            rootPath + ".view.fragment.editarRM.editar.EditarPasoPadre",
                            this
                        );
                        oThat.getView().addDependent(this.oEditPasoRM);
                    }

                    // let sExpand = "estructuraId,etiquetaId,tipoDatoId";
                    // let pasoResponse = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "PASO", aFilters, sExpand);
                    let pasoResponse = datos.pasoId;
                    let lineaSeleccionadaModif = Object.assign({}, pasoResponse);
                    this.onChangingStepDataType({}, lineaSeleccionadaModif.tipoDatoId_iMaestraId,"frgEditPasoRM");
                    this.localModel.setProperty("/pasoPadreSeleccionado", lineaSeleccionadaModif);
                    this.localModel.setProperty("/pasoPadreSeleccionadoBackUp", pasoResponse);
                    this.onObtainValidationPaso(lineaSeleccionadaModif.pasoId);
                    this.oEditPasoRM.open();
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            onObtainValidationPaso: async function (pasoId) {
                try {
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let aFilters = [new Filter("activo", FilterOperator.EQ, true)];
                    aFilters.push(new Filter("pasoId_pasoId", FilterOperator.EQ, pasoId));
                    aFilters.push(new Filter("mdId_mdId", FilterOperator.EQ, oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId";
                    let aMdPaso = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO", aFilters, sExpand);
                    if (!aMdPaso.results) {
                        this.localModel.setProperty("/oEditableNoOP", true);
                    } else {
                        let oMdpPaso = aMdPaso.results.find(item => item.mdId.estadoIdRmd_iMaestraId === sEstadoAutorizado || item.mdId.estadoIdRmd_iMaestraId === sEstadoSuspendido);
                        if (!oMdpPaso) {
                            this.localModel.setProperty("/oEditableNoOP", true);
                        } else {
                            this.localModel.setProperty("/oEditableNoOP", false);
                        }
                    }
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            onEditPasoGeneralProcMenor: async function (oEvent) {
                try {
                    let datos;
                    let aFilters = [];
                    if (oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso")) {
                        datos = oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                        oThat.localModel.setProperty("/listMdEsPasoInsumoPaso",datos);
                        aFilters.push(new Filter("pasoId", "EQ", datos.pasoHijoId_pasoId));
                        if(formatter.isNotAvailable(datos.pasoHijoId_pasoId)){ //es insumo
                            return ;
                        }
                    }

                    if (!this.oEditPasoHijoRM) {
                        this.oEditPasoHijoRM = sap.ui.xmlfragment(
                            "frgEditPasoHijo",
                            rootPath + ".view.fragment.editarRM.editar.EditarPasoHijo",
                            this
                        );
                        oThat.getView().addDependent(this.oEditPasoHijoRM);
                    }

                    let sExpand = "estructuraId,etiquetaId,tipoDatoId";
                    let pasoResponse = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "PASO", aFilters, sExpand);
                    let lineaSeleccionadaModif = Object.assign({}, pasoResponse.results[0]);
                    this.onChangingStepDataType({}, lineaSeleccionadaModif.tipoDatoId_iMaestraId,"frgEditPasoHijo");
                    this.localModel.setProperty("/pasoHijoSeleccionado", lineaSeleccionadaModif);
                    this.localModel.setProperty("/pasoHijoSeleccionadoBackUp", pasoResponse.results[0]);
                    this.onObtainValidationPaso(lineaSeleccionadaModif.pasoId);
                    this.oEditPasoHijoRM.open();
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            onDeletePasosResponsive: function (oEvent) { // si es oEvent se dispara desde un btn
                try {
                    let oTable;
                    let sStep = oEvent.getSource().data("component") || "";
                    let {aEstructura}  = oThat.getView().getModel("asociarDatos").getData();
                    if(sStep === "procesoCuadro"){
                        oTable = sap.ui.core.Fragment.byId("frgAssignCuadroProcess", "idTblPasoCuadroProcess");
                    }else{
                        oTable = sap.ui.core.Fragment.byId("frgAssignCuadro", "idTblPasoCuadro");
                    }

                    let aListSelectedPaths = oTable._aSelectedPaths;
                    let sModel = oTable.mBindingInfos.items.model;

                    if (aListSelectedPaths.length > 0) {
                        MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                            actions: ["Borrar", "Cancelar"],
                            emphasizedAction: "Borrar",
                            onClose: async function (sAction) {
                                if (sAction === "Borrar") {
                                    BusyIndicator.show(0);
                                    // aListSelectedPaths.forEach(async function(sPath){
                                    // for await(const structure of aEstructura.results){


                                    // }

                                    for await (const sPath of aListSelectedPaths) {
                                        let oObj = oThat.getView().getModel("aListPasoAssignResponsive").getData()[parseInt(sPath.split("/")[1])];

                                        let structure = aEstructura.results.filter(item=> item.mdEstructuraId === oObj.mdEstructuraId_mdEstructuraId); //return 1

                                        // for await( const )
                                        let aPasoInsumoPaso = structure[0].aPasoInsumoPaso.results.filter(item=> item.pasoId_mdEstructuraPasoId === oObj.mdEstructuraPasoId); //return n

                                        let oObjDelete = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            activo: false
                                        }
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjDelete, oObj.mdEstructuraPasoId);
                                        
                                        for await(const ele of aPasoInsumoPaso){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjDelete, ele.mdEstructuraPasoInsumoPasoId);
                                        }
                                        

                                    }
                                    await oThatConf._updateModelRestforContext(sStep);
                                    await oThatConf.updateOrder(sModel,sStep);
                                    oTable.removeSelections();
                                    BusyIndicator.hide();
                                    MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                                }
                            }
                        });
                    } else {
                        MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"))
                    }
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            onDeletePasosPMResponsive: function () {
                let oTable = sap.ui.core.Fragment.byId("frgOpenProcMenores", "tblProcMenorPaso");
                let aListSelectedPaths = oTable._aSelectedPaths;
                let sModel = oTable.mBindingInfos.items.model;

                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                        actions: ["Borrar", "Cancelar"],
                        emphasizedAction: "Borrar",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar") {
                                BusyIndicator.show(0);
                                aListSelectedPaths.forEach(async function(sPath){
                                    let oObj = oThat.getView().getModel("listMdEsPasoInsumoPaso").getData()[parseInt(sPath.split("/")[1])];
                                    let oObjDelete = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjDelete, oObj.mdEstructuraPasoInsumoPasoId);
                                });
                                await oThatConf.onSaveCantidadRm();
                                // await oThat.onGetDataEstructuraMD();
                                // await oThat.onCreateModelTree();
                                await oThatConf._updateModelRestforContext("procesoCuadro");
                                await oThatConf.onObtenerProcMenores(null);
                                await oThatConf.updateOrder(sModel,"procesoCuadro");
                                await oThatConf.onObtenerProcMenores(null);
                                // await oThatConf.onGetPasosToAssignProcess();
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"))
                }    
            },
            onDeleteCascade:async function(){
                let mdCurrent = oThat.getView().getModel("asociarDatos").getData();

                for await ( const structure of aEstructura.results){
                    if(structure.mdEstructuraId == oContext.mdEstructuraId){
                        
                        //Equipo

                        for await(const item of structure.aEquipo.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", oObj, item.mdEstructuraEquipoId);
                        }
                        //aEspecificaciones
                        for await(const item of structure.aEspecificacion.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ESPECIFICACION", oObj, item.mdEstructuraEspecificacionId);
                            
                        }
                        //Etiqueta
                        for await(const item of structure.aEtiqueta.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", oObj, item.mdEsEtiquetaId);
                            
                        }
                        // aInsumo
                        for await(const item of structure.aInsumo.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oObj, item.estructuraRecetaInsumoId);
                            
                        }
                        //aPaso
                        for await(const item of structure.aPaso.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObj, item.mdEstructuraPasoId);
                        }
                        //aPasoInsumoPaso
                        for await(const item of structure.aPasoInsumoPaso.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObj, item.mdEstructuraPasoInsumoPasoId);
                            
                        }
                        //aUtensilio
                        for await(const item of structure.aUtensilio.results){
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", oObj, item.mdEstructuraUtensilioId);
                            
                        }

                    }
                }
            },
            
            onDeleteEquiposResponsive: function () {
                let oTable = sap.ui.core.Fragment.byId("frgAdicNewMdEquipment", "idTblEquipmentEstructure");
                let aListSelectedPaths = oTable._aSelectedPaths;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                        actions: ["Borrar", "Cancelar"],
                        emphasizedAction: "Borrar",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar") {
                                BusyIndicator.show(0);
                                for await (const sPath of aListSelectedPaths) {
                                    let oObj = oThat.getView().getModel("aListEquipoAssignResponsive").getData()[parseInt(sPath.split("/")[1])];
                                    let oObjDelete = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }
                                    if (oObj.mdEstructuraUtensilioId) {
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", oObjDelete, oObj.mdEstructuraUtensilioId);
                                    } else if (oObj.mdEstructuraEquipoId) {
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", oObjDelete, oObj.mdEstructuraEquipoId);
                                    }
                                }
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThatConf.onOpenEquipo();
                                await oThatConf.updateOrderEquipment();
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"));
                }
            },
            
            onDeleteEspecificacionResponsive: function () {
                let oTable = sap.ui.core.Fragment.byId("frgAssignEspecificacion", "idTblEspecificacion");
                let aListSelectedPaths = oTable._aSelectedPaths;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                        actions: ["Borrar", "Cancelar"],
                        emphasizedAction: "Borrar",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar") {
                                BusyIndicator.show(0);
                                for await (const sPath of aListSelectedPaths) {
                                    let oObj = oThat.getView().getModel("aListEspecificacionAssignResponsive").getData()[parseInt(sPath.split("/")[1])];
                                    let oObjDelete = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }
                                    
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ESPECIFICACION", oObjDelete, oObj.mdEstructuraEspecificacionId);
                                    
                                }
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                await oThatConf.onGetEspecificacionesToAssign();
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"));
                }
            },
            // Obtener Especificaciones asignados a una estructura de un RMD.
            onGetEspecificacionesToAssign: async function () {
                try {
                    let cabeceraRMD =  oThat.getView().getModel("asociarDatos").getData();
                    let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                    let oModelMdEsEspecificacion = oThat.getView().getModel("listMdEsEspecificacion");
                    const aFilterMdEspecificacion = await oModelMdEsEspecificacion.getData().filter((oItem) => {
                        return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId;
                    });
                    //validamos el campo para habilitar el campo
                    let aRec = cabeceraRMD.aReceta.results;
                    if (aRec.length>0) {
                        this.localModel.setProperty("/flagEnsayoSAP",true);
                    } else {
                        this.localModel.setProperty("/flagEnsayoSAP",false);
                    }
                    this.localModel.refresh();

                    $.each(aFilterMdEspecificacion, function (k, v){
                        if (v.tipoDatoId_iMaestraId === sTipoDatoNumero){
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = true;
                        } else if  (v.tipoDatoId_iMaestraId === sIdTipoDatoRango) {
                            v.enabledValorInicial = true;
                            v.enabledValorFinal = true;
                            v.enabledMargen = true;
                            v.enabledDecimales = true;
                        } else {
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = false;
                        } 
                    });
                    let existeSap = aFilterMdEspecificacion.filter(itm=>itm.ensayoPadreSAP !== null).length > 0 ? true : false;
                    let noExisteSap = aFilterMdEspecificacion.filter(itm=>itm.ensayoPadreSAP === null).length > 0 ? true : false;
                    if (noExisteSap && !existeSap) {
                        await aFilterMdEspecificacion.sort((a, b) => {
                            return (
                                a.orden - b.orden
                            );
                        });
                    } else if (existeSap && !noExisteSap) {
                        await aFilterMdEspecificacion.sort((a, b) => {
                            return (
                                a.Merknr - b.Merknr
                            );
                        });
                    } else if (existeSap && noExisteSap) {
                        await aFilterMdEspecificacion.sort((a, b) => {
                            return (
                                a.Merknr - b.Merknr &&
                                a.orden - b.orden
                            );
                        });
                    }
                    
                    let oModelEspecificacionRes = new JSONModel(aFilterMdEspecificacion);
                    oModelEspecificacionRes.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEspecificacionRes, "aListEspecificacionAssignResponsive");
                    oThat.getView().getModel("aListEspecificacionAssignResponsive").refresh(true);
                } catch (oError) {
                    MessageBox.error(oError.responseText);
                }
            },

            // Fragmento con la lista de Especificaciones asignados a una estructura de un RMD.
            onGetDataEspecificacionesResponsive: function () {
                if (!this.oEspecificacionResponsive) {
                    this.oEspecificacionResponsive = sap.ui.xmlfragment(
                        "frgAssignEspecificacion",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyEspecificacion",
                        this
                    );
                    oThat.getView().addDependent(this.oEspecificacionResponsive);
                }

                this.oEspecificacionResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Especificacion.
            onCancelEspecificacionResponsive: function () {
                this.oEspecificacionResponsive.close();
            },

            // Obtener los ensayos padre y abrir pop up.
            onAddEspecificacionResponsive: function () {
                try {
                    this.onGetEnsayoPadre().then(function (oListEnsayoPadre) {
                        let oModel = new JSONModel(oListEnsayoPadre.results);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "aListEnsayoPadre");
                        sap.ui.core.BusyIndicator.hide();

                        oThatConf.onAddEEspecificacionEditRM();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                } catch (error) {
                    MessageBox.error(oError.responseText);
                }
            },

            // Obtener Etiquetas asignados a una estructura de un RMD.
            onGetEtiquetasToAssign: async function () {
                try {
                    let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                    let oModelMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta");
                    const aFilterMdEtiqueta = await oModelMdEsEtiqueta.getData().filter((oItem) => {
                        return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId;
                    });

                    let oModelEtiquetaRes = new JSONModel(aFilterMdEtiqueta);
                    oModelEtiquetaRes.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEtiquetaRes, "aListEtiquetaAssignResponsive");
                    oThat.getView().getModel("aListEtiquetaAssignResponsive").refresh(true);
                } catch (error) {
                    MessageBox.error(oError.responseText);
                }
            },

            // Fragmento con la lista de Etiquetas asignados a una estructura de un RMD.
            onGetDataEtiquetasResponsive: function () {
                if (!this.oEtiquetaResponsive) {
                    this.oEtiquetaResponsive = sap.ui.xmlfragment(
                        "frgAssignEtiqueta",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyEtiqueta",
                        this
                    );
                    oThat.getView().addDependent(this.oEtiquetaResponsive);
                }

                this.oEtiquetaResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Etiqueta.
            onCancelEtiquetaResponsive: function () {
                ;
                this.oEtiquetaResponsive.close();
                let oModel = new JSONModel([]);
                oThat.getView().setModel(oModel, "headerAddEtiqueta");
            },

            onAddEtiquetasResponsive: function () {
                this.onCleanEtiquetaEditRM();
                this.onAddEtiqueta();
            },

            onSaveEspecificacionResponsive: async function () {
                let oData = oThat.getView().getModel("aListEspecificacionAssignResponsive").getData();
                let flag = true;
                oData.forEach(function (oDataPasoVerif) {
                    let tipoDatoSelected = parseInt(oDataPasoVerif.tipoDatoId_iMaestraId);
                    if (tipoDatoSelected === sTipoDatoNumero){
                        if(oDataPasoVerif.decimales === null || oDataPasoVerif.decimales === "") {
                            flag = false;
                        }
                    } else if  (tipoDatoSelected === sIdTipoDatoRango) {
                        if (!oDataPasoVerif.margen) {
                            oDataPasoVerif.margen = 0;
                        }
                        if(oDataPasoVerif.valorInicial === null || oDataPasoVerif.valorInicial === "" || oDataPasoVerif.valorFinal === null || oDataPasoVerif.valorFinal === "" || oDataPasoVerif.margen === null || oDataPasoVerif.margen === "" || parseFloat(oDataPasoVerif.margen) === NaN || oDataPasoVerif.decimales === null || oDataPasoVerif.decimales === "") {
                            flag = false;
                        }
                    }
                });
                if(flag){
                    BusyIndicator.show(0);
                    // let oTablaArrayInsert = {
                    //     usuarioRegistro : "USUARIOTEST",
                    //     fechaRegistro   : new Date(),
                    //     activo          : true,
                    //     aEspecificacionMd         : [],
                    //     id              : util.onGetUUIDV4()
                    // }
                        
                    oData.forEach(async function(oDataPaso) {
                        let oParam = {
                            fechaActualiza : new Date(),
                            usuarioActualiza : oInfoUsuario.data.usuario,
                            tipoDatoId_iMaestraId : oDataPaso.tipoDatoId_iMaestraId,
                            valorInicial : oDataPaso.valorInicial,
                            valorFinal : oDataPaso.valorFinal,
                            margen : oDataPaso.margen,
                            decimales : oDataPaso.decimales
                        }
                        // oTablaArrayInsert.aEspecificacionMd.push(oParam);
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ESPECIFICACION", oParam, oDataPaso.mdEstructuraEspecificacionId);
                    });
                    // await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oTablaArrayInsert);
                    BusyIndicator.hide();
                    MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEdit")); 
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat, "sErrorCamposObligatorios"));
                }
                
            },

            onChangeTipoDatoMd:async function (oEvent) {
                // if (oEvent.getParameters().itemPressed) {
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let tipoDatoSelected = parseInt(oEvent.getSource().getSelectedKey());
                    let oLineaSeleccionada = oEvent.getSource().getParent().getBindingContext("aListPasoAssignResponsive");
                    let lineaSeleccionada;
                    let oModelOEvent = oEvent.getSource().getParent().getParent().mBindingInfos.items.model;
                    let aDataPasoOEvent = oEvent.getSource().getParent().getBindingContext(oModelOEvent).getObject();
                    let oListMdEsPasoInsumoPaso;
                    let oControl = oEvent.getSource();
                    if (!oLineaSeleccionada) {
                        oListMdEsPasoInsumoPaso = oEvent.getSource().getParent().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                    }
                    let oValueOEvent = oEvent.getSource().getValue();
                    let sPathOEvent;
                    if (oValueOEvent === '') {
                        sPathOEvent = oEvent.getSource().getBindingInfo("value").binding.aBindings[0].sPath;
                    }
                    let sObjectOEvent = oEvent.getSource().getBindingContext(oModelOEvent).getObject();

                    if (oLineaSeleccionada) {
                        lineaSeleccionada = oLineaSeleccionada.getObject();
                    } else {
                        lineaSeleccionada = oListMdEsPasoInsumoPaso;
                    }

                    if (tipoDatoSelected === sIdTipoDatoNotificacion && oDataSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado) {
                        sap.ui.core.BusyIndicator.show(0);
                        var sFilterRMD = [];
                        sFilterRMD.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                        sFilterRMD.push(new Filter("estadoIdRmd_iMaestraId", "NE", sEstadoCerrado));
                        var aRMD = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD", sFilterRMD);
                        if (aRMD.results.length > 0) {
                            oControl.setSelectedKey(lineaSeleccionada.tipoDatoIdAnterior_iMaestraId);
                            MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageRMDCurso"));
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        }
                    }

                    if (lineaSeleccionada.tipoDatoIdAnterior_iMaestraId === sIdTipoDatoNotificacion && oDataSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado) {
                        sap.ui.core.BusyIndicator.show(0);
                        var sFilterRMD = [];
                        sFilterRMD.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                        sFilterRMD.push(new Filter("estadoIdRmd_iMaestraId", "NE", sEstadoCerrado));
                        var aRMD = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD", sFilterRMD);
                        if (aRMD.results.length > 0) {
                            oControl.setSelectedKey(lineaSeleccionada.tipoDatoIdAnterior_iMaestraId);
                            MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageRMDCurso"));
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        }
                    }

                    oThatConf.onChangeDataAutorization(aDataPasoOEvent, oValueOEvent, sPathOEvent, sObjectOEvent);
                    
                    if (tipoDatoSelected === sTipoDatoNumero || tipoDatoSelected === sTipoDatoCantidad || tipoDatoSelected === sIdTipoDatoFormula || tipoDatoSelected === sTipoDatoMuestraCC || tipoDatoSelected === sTipoDatoEntrega){
                        lineaSeleccionada.enabledValorInicial = false;
                        lineaSeleccionada.enabledValorFinal = false;
                        lineaSeleccionada.enabledMargen = false;
                        lineaSeleccionada.enabledDecimales = true;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    } else if  (tipoDatoSelected === sIdTipoDatoRango) {
                        lineaSeleccionada.enabledValorInicial = true;
                        lineaSeleccionada.enabledValorFinal = true;
                        lineaSeleccionada.enabledMargen = true;
                        lineaSeleccionada.enabledDecimales = true;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    } else {
                        lineaSeleccionada.enabledValorInicial = false;
                        lineaSeleccionada.enabledValorFinal = false;
                        lineaSeleccionada.enabledMargen = false;
                        lineaSeleccionada.enabledDecimales = false;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    }

                    let bFlag = tipoDatoSelected === sIdTipoDatoNotificacion ? true : false;
                    // oThatConf.onConsumirPuestoTrabajo();
                    lineaSeleccionada.isEnabledCell =  bFlag;
                    !oLineaSeleccionada ? oEvent.getSource().getParent().getBindingContext("listMdEsPasoInsumoPaso").getModel().refresh(true) : oLineaSeleccionada.getModel().refresh(true);
                    sap.ui.core.BusyIndicator.hide();
                // }
            },

            onChangeTipoDatoEspecificaionesMd: function (oEvent) {
                // if (oEvent.getParameters().itemPressed) {
                    let tipoDatoSelected = parseInt(oEvent.getSource().getSelectedKey());
                    let lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("aListEspecificacionAssignResponsive").getObject();
                    if (tipoDatoSelected === sTipoDatoNumero){
                        lineaSeleccionada.enabledValorInicial = false;
                        lineaSeleccionada.enabledValorFinal = false;
                        lineaSeleccionada.enabledMargen = false;
                        lineaSeleccionada.enabledDecimales = true;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    } else if  (tipoDatoSelected === sIdTipoDatoRango) {
                        lineaSeleccionada.enabledValorInicial = true;
                        lineaSeleccionada.enabledValorFinal = true;
                        lineaSeleccionada.enabledMargen = true;
                        lineaSeleccionada.enabledDecimales = true;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    } else {
                        lineaSeleccionada.enabledValorInicial = false;
                        lineaSeleccionada.enabledValorFinal = false;
                        lineaSeleccionada.enabledMargen = false;
                        lineaSeleccionada.enabledDecimales = false;
                        lineaSeleccionada.valorInicial = null;
                        lineaSeleccionada.valorFinal = null;
                        lineaSeleccionada.margen = null;
                        lineaSeleccionada.decimales = null;
                    }

                    oEvent.getSource().getParent().getBindingContext("aListEspecificacionAssignResponsive").getModel().refresh(true);
                // }
            },
            onGetPasosToAssignProcess: async function (sTipo="") {
                try {
                    let oEstructura = oThat.getView().getModel("headerAddEtiqueta").getData();
                    let oModelMdEsPaso = oThat.getView().getModel("listMdEsPaso");
                    let oMdEsPasoInsumoPaso = oThat.getView().getModel("listMdEsPasoInsumoPaso");
                    const aFilterMdPaso = await oModelMdEsPaso.getData().filter((oItem) => {
                        return oItem.mdEstructuraId_mdEstructuraId === oEstructura.mdEstructuraId_mdEstructuraId && oItem.mdEsEtiquetaId_mdEsEtiquetaId === oEstructura.mdEsEtiquetaId;
                    });

                    oThat.getView().getModel("localModel").setProperty("/tipoDatoPasoMD", false);

                    for await (const v of aFilterMdPaso) {
                        let aFilterProcMenor = [];
                        v.tipoDatoId_iMaestraId = v.tipoDatoIdAnterior_iMaestraId;
                        v.estadoCC = v.estadoCC === null ? false : v.estadoCC;
                        v.estadoMov = v.estadoMov === null ? false : v.estadoMov;
                        v.pmop = v.pmop === null ? false : v.pmop;
                        v.genpp = v.genpp === null ? false : v.genpp;
                        v.edit = v.edit === null ? false : v.edit;
                        v.rpor = v.rpor === null ? false : v.rpor;
                        v.vb = v.vb === null ? false : v.vb;
                        v.formato = v.formato === null ? false : v.formato;
                        v.imagen = v.imagen === null ? false : v.imagen;
                        v.formulaButton = parseInt(v.tipoDatoId_iMaestraId) === sIdTipoDatoFormula ? true : false;
                        v.procmenButton = oEstructura.procesoMenor;
                        v.procmenButtonColor = "Reject";
                        if (v.dependeMdEstructuraPasoId) {
                            let pasoPredecesor = oModelMdEsPaso.getData().find(oPaso => oPaso.mdEstructuraPasoId === v.dependeMdEstructuraPasoId)
                            if (pasoPredecesor) {
                                v.ordenPredecesor = "(" + pasoPredecesor.orden + ")";
                            }
                        } else {
                            v.ordenPredecesor = "";
                        }
                        if (v.tipoDatoId_iMaestraId === sTipoDatoNumero || v.tipoDatoId_iMaestraId === sTipoDatoCantidad || v.tipoDatoId_iMaestraId === sIdTipoDatoFormula || v.tipoDatoId_iMaestraId === sTipoDatoMuestraCC || v.tipoDatoId_iMaestraId === sTipoDatoEntrega){
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = true;
                        } else if  (v.tipoDatoId_iMaestraId === sIdTipoDatoRango) {
                            v.enabledValorInicial = true;
                            v.enabledValorFinal = true;
                            v.enabledMargen = true;
                            v.enabledDecimales = true;
                        } else if (v.tipoDatoId_iMaestraId == sIdTipoDatoNotificacion) {
                            v.isEnabledCell = true;
                            v.enabledValorInicial = true;
                            v.enabledValorFinal = true;
                            v.enabledMargen = true;
                            v.enabledDecimales = true;
                            oThat.getView().getModel("localModel").setProperty("/tipoDatoPasoMD", true);
                        } else {
                            v.enabledValorInicial = false;
                            v.enabledValorFinal = false;
                            v.enabledMargen = false;
                            v.enabledDecimales = false;
                        }

                        aFilterProcMenor = await oMdEsPasoInsumoPaso.getData().filter((oItem) => {
                            return v.mdEstructuraPasoId === oItem.pasoId_mdEstructuraPasoId;
                        });

                        if (aFilterProcMenor.length > 0) {
                            v.procmenButtonColor = "Ghost";
                        }
                    }

                    aFilterMdPaso.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    let oModelPasoRes = new JSONModel(aFilterMdPaso);
                    oModelPasoRes.setSizeLimit(999999999);

                    let aMemoData = JSON.parse(JSON.stringify(aFilterMdPaso));
                    let oModelPasoResMemo = new JSONModel(aMemoData);
                    oModelPasoResMemo.setSizeLimit(999999999);

                    if(sTipo === "proceso"){
                        oThat.getView().setModel(oModelPasoRes, "listMdEsPasoInsumoPaso");
                        oThat.getView().getModel("listMdEsPasoInsumoPaso").refresh(true);
                    }else{
                        oThat.getView().setModel(oModelPasoRes, "aListPasoAssignResponsive");
                        oThat.getView().getModel("aListPasoAssignResponsive").refresh(true);

                        oThat.getView().setModel(oModelPasoResMemo, "aListPasoAssignResponsiveMemo");
                        oThat.getView().getModel("aListPasoAssignResponsiveMemo").refresh(true);
                    }
                } catch (error) {
                    MessageBox.error(error.responseText);
                }
            },
            //mcode 
            /**
             * funcion para actualizar el ordenamiento de listas
             */
            updateOrder: async function(sModel,sStep=""){
                BusyIndicator.show(0);
               let oModelGeneric = oThat.getView().getModel(sModel); // validamos que este activo
               let index = 0;
               oModelGeneric.getData().sort(function (a, b) {
                return a.orden - b.orden;
                });
                for await(const obj of oModelGeneric.getData()){
                    
                    index++;
                    let object= {
                        orden:index
                    }
                    // if(sModel === "listMdEsEtiqueta"){
                    if(sModel === "listMdEsEtiquetaGeneral"){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", object, obj.mdEsEtiquetaId);
                    }
                    if(sModel === "listMdEstructuraGeneral"){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", object, obj.mdEstructuraId);
                    }                    
                    if(sModel === "aListPasoAssignResponsive"){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", object, obj.mdEstructuraPasoId);
                    }                    
                    if(sModel === "listMdEsPasoInsumoPaso"){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", object, obj.mdEstructuraPasoInsumoPasoId);
                    }                    

                }
                await oThatConf._updateModelRestforContext(sStep);
                BusyIndicator.hide();

            },
            onDeleteEtiquetasResponsive: function (oEvent) {
                let {aEstructura} = oThat.getView().getModel("asociarDatos").getData();
                let oTable = sap.ui.core.Fragment.byId("frgAssignEtiqueta", "idTblEtiqueta");

                let aListSelectedPaths = oTable._aSelectedPaths;
                let sModel = oTable.mBindingInfos.items.model;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                        actions: ["Borrar", "Cancelar"],
                        emphasizedAction: "Borrar",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar") {
                                BusyIndicator.show(0);
                                
                                
                                    var oObjDelete = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }

                                    for await(const sPath of aListSelectedPaths){
                                        let oObj = oThat.getView().getModel("listMdEsEtiquetaGeneral").getData()[parseInt(sPath.split("/")[1])];
                                        
                                        let structure = aEstructura.results.filter(item=> item.mdEstructuraId === oObj.mdEstructuraId_mdEstructuraId); //return 1
                                        
                                        //filters steps 
                                        let aPaso = structure[0].aPaso.results.filter(item=> item.mdEsEtiquetaId_mdEsEtiquetaId === oObj.mdEsEtiquetaId); //return n
                                        
                                        for await(const step of aPaso){
                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjDelete, step.mdEstructuraPasoId);
                                            
                                            //filters stepInsumos
                                            let aPasoInsumoPaso = structure[0].aPasoInsumoPaso.results.filter(item=> item.pasoId_mdEstructuraPasoId === step.mdEstructuraPasoId); //return n

                                            for await(const ele of aPasoInsumoPaso){
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oObjDelete, ele.mdEstructuraPasoInsumoPasoId);
                                            }
                                                                          
                                    }
                                    
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", oObjDelete, oObj.mdEsEtiquetaId);
                                }
                                await oThatConf._updateModelRestforContext();
                                // await oThat.onGetDataEstructuraMD();
                                // await oThat.onCreateModelTree();
                                // oThat.onCreateModelTreeProcess();
                                await oThatConf.updateOrder(sModel);
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"));
                }
            },

            onSaveEtiquetasResponsive: async function () {
                let oData = oThat.getView().getModel("listMdEsEtiquetaGeneral").getData();
                BusyIndicator.show(0);
                let oTablaArrayInsert = {
                    usuarioRegistro : oInfoUsuario.data.usuario,
                    fechaRegistro   : new Date(),
                    activo          : true,
                    aEtiquetaMd         : [],
                    id              : util.onGetUUIDV4()
                }
                    
                for await (const oDataPaso of oData) {
                    let oParam = {
                        fechaActualiza : new Date(),
                        usuarioActualiza : oInfoUsuario.data.usuario,
                        conforme : oDataPaso.conforme,
                        procesoMenor : oDataPaso.procesoMenor
                    }
                    oTablaArrayInsert.aEtiquetaMd.push(oParam);
                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_ETIQUETA", oParam, oDataPaso.mdEsEtiquetaId);
                }
                await oThat.onGetDataEstructuraMD();
                await oThat.onCreateModelTree();
                await oThat.onCreateModelTreeProcess();
                // await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oTablaArrayInsert);
                BusyIndicator.hide();
                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEdit")); 
            },
            //mcode
            // Fragmento con la lista de Pasos asignados a una estructura de un RMD de etiquetas.
            onGetDataCuadroProcessResponsive: function () {
                if (!this.oCuadroProcessResponsive) {
                    this.oCuadroProcessResponsive = sap.ui.xmlfragment(
                        "frgAssignCuadroProcess",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyCuadroProcess",
                        this
                    );
                    oThat.getView().addDependent(this.oCuadroProcessResponsive);
                }

                this.oCuadroProcessResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Cuadro Proceso.
            onCancelCuadroProcessResponsive: function () {
                this.oCuadroProcessResponsive.close();
                let oModelPaso = new JSONModel([]);
                oThat.getView().setModel(oModelPaso, "headerAddPaso");
            },

            // Fragmento con la lista de Pasos asignados a una estructura de un RMD.
            onGetDataCondicionesAmbientalesResponsive: function () {
                if (!this.oCondicionesAmbientalesResponsive) {
                    this.oCondicionesAmbientalesResponsive = sap.ui.xmlfragment(
                        "frgAssignCondicionesAmbientales",
                        rootPath + ".view.fragment.editarRM.body.tipoEstructura.BodyCondicionesAmbientales",
                        this
                    );
                    oThat.getView().addDependent(this.oCondicionesAmbientalesResponsive);
                }

                this.oCondicionesAmbientalesResponsive.open();
            },

            // Cerrar Dialogo del tipo de estructura Condiciones Ambientales.
            onCancelCondicionesAmbientalesResponsive: function () {
                this.oCondicionesAmbientalesResponsive.close();
            },

            onDeletePasosCAResponsive: function () {
                let oTable = sap.ui.core.Fragment.byId("frgAssignCondicionesAmbientales", "idTblPasoCondicionesAmbientales");
                let aListSelectedPaths = oTable._aSelectedPaths;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "askForDeletion"), {
                        actions: ["Borrar", "Cancelar"],
                        emphasizedAction: "Borrar",
                        onClose: async function (sAction) {
                            if (sAction === "Borrar") {
                                BusyIndicator.show(0);
                                aListSelectedPaths.forEach(async function(sPath){
                                    let oObj = oThat.getView().getModel("aListPasoAssignResponsive").getData()[parseInt(sPath.split("/")[1])];
                                    let oObjDelete = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        activo: false
                                    }
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", oObjDelete, oObj.mdEstructuraPasoId);
                                });
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                oThatConf.onGetPasosToAssign();
                                oTable.removeSelections();
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("confirmDelete"));
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage70"))
                }    
            },

            onDropResponsive: async function(oEvent){
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let oEstructura = oThat.getView().getModel("headerAddEstructura");
                let oModel,aModelTree,itemsTree,oDrag,ordenInicio,oDrop,ordenLlegada,sDropPosition;
                if(oEvent.mParameters.value === "" || oEvent.mParameters.value === null){
                    return;
                }
                if(oEvent.sId === "change"){
                    oModel = oEvent.getSource().getParent().getParent().mBindingInfos.items.model;
                    aModelTree = oThat.getView().getModel(oModel);
                    itemsTree = aModelTree.oData;
                    oDrag = oEvent.getSource().getBindingContext(oModel).getPath();
                    ordenInicio = parseInt((oEvent.getSource().getBindingContext(oModel).getPath()).split("/")[1])+1;
                    oDrop = ("/"+(parseInt(oEvent.mParameters.value)-1));
                    ordenLlegada = parseInt(oEvent.mParameters.value);
                    sDropPosition = ordenLlegada < ordenInicio ? "Before" : "After"; // falta Before o After 
                    if(ordenInicio === ordenLlegada || itemsTree.length < ordenLlegada){
                        oEvent.getSource().setValue(parseInt((oEvent.getSource().getBindingContext(oModel).getPath()).split("/")[1])+1);
                        return;
                    }
                }else{
                    oModel = oEvent.getSource().getParent().mBindingInfos.items.model;
                    aModelTree = oThat.getView().getModel(oModel);
                    itemsTree = aModelTree.oData;
                    sDropPosition = oEvent.getParameter("dropPosition");
                    oDrag = oEvent.getParameter("draggedControl").oBindingContexts[oModel].sPath;
                    ordenInicio = itemsTree[parseInt(oDrag.substring(oDrag.length - (oDrag.length - 1), oDrag.length))].orden;
                    oDrop = oEvent.getParameter("droppedControl").oBindingContexts[oModel].sPath;
                    ordenLlegada = itemsTree[parseInt(oDrop.substring(oDrop.length - (oDrop.length - 1), oDrop.length))].orden;
                }
                ordenLlegada = parseInt(ordenLlegada);
                ordenInicio = parseInt(ordenInicio);
                if (oDataSeleccionada.getData().estadoIdRmd_iMaestraId !== sEstadoAutorizado) {
                    if(ordenInicio !== ordenLlegada) {
                        BusyIndicator.show(0);
                        if (sDropPosition === "After") {
                            if (ordenInicio < ordenLlegada) {
                                var itemsTreeModif = itemsTree.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) <= ordenLlegada);
                                for await (const e of itemsTreeModif){
                                    e.orden = parseInt(e.orden) - 1;
                                    var oParam = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: e.orden
                                    }
                                    let oObjDrag = aModelTree.getProperty(oDrag);
                                    if (e.dependeMdEstructuraPasoId === oObjDrag.mdEstructuraPasoId) {
                                        if(e.hasOwnProperty("depende")){ //validamos que tenga el campo
                                            oParam.depende=null
                                            oParam.dependeMdEstructuraPasoId=null
                                        }
                                    }
                                    await oThatConf._updateDataDragandDrog(oModel,oParam,e);
                                }
                                aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                var itm = aModelTree.getProperty(oDrag);
                                var oItm = {
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    fechaActualiza: new Date(),
                                    orden: ordenLlegada
                                }
                                if(itm.hasOwnProperty("depende")){ //validamos que tenga el campo
                                    oItm.depende=null
                                    oItm.dependeMdEstructuraPasoId=null
                                }
                                await oThatConf._updateDataDragandDrog(oModel,oItm,itm);
                            } else {
                                var itemsTreeModif = itemsTree.filter(item => parseInt(item.orden) > ordenLlegada && parseInt(item.orden) < ordenInicio);
                                for await (const e of itemsTreeModif){
                                    e.orden = parseInt(e.orden) + 1;
                                    var oParam = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: e.orden
                                    }
                                    let oObjDrag = aModelTree.getProperty(oDrag);
                                    if (e.dependeMdEstructuraPasoId === oObjDrag.mdEstructuraPasoId) {
                                        if(e.hasOwnProperty("depende")){ //validamos que tenga el campo
                                            oParam.depende=null
                                            oParam.dependeMdEstructuraPasoId=null
                                        }
                                    }
                                    await oThatConf._updateDataDragandDrog(oModel,oParam,e);
                                }
                                aModelTree.setProperty(oDrag + "/orden", ordenLlegada + 1);
                                var itm = aModelTree.getProperty(oDrag);
                                var oItm = {
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    fechaActualiza: new Date(),
                                    orden: ordenLlegada + 1
                                }    
                                if(itm.hasOwnProperty("depende")){ //validamos que tenga el campo
                                    oItm.depende=null
                                    oItm.dependeMdEstructuraPasoId=null
                                }
                                await oThatConf._updateDataDragandDrog(oModel,oItm,itm);
                            }
                        } else if (sDropPosition === "Before") {
                            if (ordenInicio < ordenLlegada) {
                                var itemsTreeModif = itemsTree.filter(item => parseInt(item.orden) > ordenInicio && parseInt(item.orden) < ordenLlegada);
                                for await (const e of itemsTreeModif){
                                    e.orden = parseInt(e.orden) - 1;
                                    var oParam = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: e.orden
                                    }
                                    let oObjDrag = aModelTree.getProperty(oDrag);
                                    if (e.dependeMdEstructuraPasoId === oObjDrag.mdEstructuraPasoId) {
                                        if(e.hasOwnProperty("depende")){ //validamos que tenga el campo
                                            oParam.depende=null
                                            oParam.dependeMdEstructuraPasoId=null
                                        }
                                    }
                                    await oThatConf._updateDataDragandDrog(oModel,oParam,e);
                                }
                                aModelTree.setProperty(oDrag + "/orden", ordenLlegada - 1);
                                var itm = aModelTree.getProperty(oDrag);
                                var oItm = {
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    fechaActualiza: new Date(),
                                    orden: ordenLlegada - 1
                                }
                                if(itm.hasOwnProperty("depende")){ //validamos que tenga el campo
                                    oItm.depende=null
                                    oItm.dependeMdEstructuraPasoId=null
                                }
                                await oThatConf._updateDataDragandDrog(oModel,oItm,itm);
                            } else {
                                var itemsTreeModif = itemsTree.filter(item => parseInt(item.orden) >= ordenLlegada && parseInt(item.orden) < ordenInicio);
                                for await (const e of itemsTreeModif){
                                    e.orden = parseInt(e.orden) + 1;
                                    var oParam = {
                                        usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date(),
                                        orden: e.orden
                                    }
                                    let oObjDrag = aModelTree.getProperty(oDrag);
                                    if (e.dependeMdEstructuraPasoId === oObjDrag.mdEstructuraPasoId) {
                                        if(e.hasOwnProperty("depende")){ //validamos que tenga el campo
                                            oParam.depende=null
                                            oParam.dependeMdEstructuraPasoId=null
                                        }
                                    }
                                    await oThatConf._updateDataDragandDrog(oModel,oParam,e);
                                }
                                aModelTree.setProperty(oDrag + "/orden", ordenLlegada);
                                var itm = aModelTree.getProperty(oDrag);
                                
                                var oItm = {
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    fechaActualiza: new Date(),
                                    orden: ordenLlegada
                                }
                                if(itm.hasOwnProperty("depende")){ //validamos que tenga el campo
                                    oItm.depende=null
                                    oItm.dependeMdEstructuraPasoId=null
                                }
                                await oThatConf._updateDataDragandDrog(oModel,oItm,itm);
                            }
                        }
                    
                        itemsTree.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                        let cont = 0;
                        for await (const oItm of itemsTree) {
                            cont = cont + 1;
                            let oObj = {
                                orden: cont
                            }
                            await oThatConf._updateDataDragandDrog(oModel, oObj, oItm);
                        }
                        aModelTree.refresh(true);
                        await oThat.onGetDataEstructuraMD();
                        await oThat.onCreateModelTree();
                        await oThat.onCreateModelTreeProcess();
                        if (oEstructura) {
                            if (oEstructura.getData().tipoEstructuraId === sIdTipoEstructuraProceso) {
                                await oThatConf.onGetPasosToAssignProcess();
                            } else if (oEstructura.getData().tipoEstructuraId === sIdTipoEstructuraCuadro) {
                                await oThatConf.onGetPasosToAssign();
                            }
                        }
                        BusyIndicator.hide();
                    }
                }
            },

            /* 
            mcode
                sModel : Text for map Entity
                payload: body
                currentItem: Item current
            */
            _updateDataDragandDrog: async function(sModel,payload,currentItem){

                if (sModel === 'aListPasoAssignResponsive') {
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO", payload, currentItem.mdEstructuraPasoId);
                } else if (sModel === 'aListEquipoAssignResponsive') {
                    if (currentItem.mdEstructuraEquipoId) {
                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_EQUIPO", payload, currentItem.mdEstructuraEquipoId);
                    } else {
                        await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_UTENSILIO", payload, currentItem.mdEstructuraUtensilioId);
                    }
                } else if (sModel === 'listMdEsEtiquetaGeneral') {
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_ETIQUETA", payload, currentItem.mdEsEtiquetaId);
                } else if (sModel === 'listMdEstructuraGeneral') {
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ESTRUCTURA", payload, currentItem.mdEstructuraId);
                } else if (sModel == "listMdEsPasoInsumoPaso"){
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_PASO_INSUMO_PASO", payload, currentItem.mdEstructuraPasoInsumoPasoId);
                }
            },
            onAddAgrupador: function () {
                if (!this.oAddAgrupador) {
                    this.oAddAgrupador = sap.ui.xmlfragment(
                        "frgAddAgrupador",
                        rootPath + ".view.fragment.editarRM.AdicAgrupador",
                        this
                    );
                    oThat.getView().addDependent(this.oAddAgrupador);
                }

                this.oAddAgrupador.open();
            },

            onConfirmAddAgrupador: function () {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let oEstructura = oThat.getView().getModel("headerAddEstructura").getData(); 
                let oTable = sap.ui.core.Fragment.byId("frgAddAgrupador", "tblAgrupador");
                let aListSelectedPaths = oTable._aSelectedPaths;
                if (aListSelectedPaths.length > 0) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveAgrupadorUtensilio"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async function (sAction) {
                            if (sAction === "OK") {
                                BusyIndicator.show(0);
                                let aListEquipoAssignResponsive = oThat.getView().getModel("aListEquipoAssignResponsive");
                                let nPosicion = 0;
                                // aListSelectedPaths.forEach(async function(sPath){
                                for await(const sPath of aListSelectedPaths){
                                    nPosicion = nPosicion + 1;
                                    let oObj = oThat.mainModelv2.getProperty(sPath);
                                    let oParam = {
                                        usuarioRegistro : oInfoUsuario.data.usuario,
                                        fechaRegistro : new Date(),
                                        activo : true,
                                        mdEstructuraUtensilioId : util.onGetUUIDV4(),
                                        mdEstructuraId_mdEstructuraId: oEstructura.mdEstructuraId,
                                        estructuraId_estructuraId : oEstructura.estructuraId_estructuraId,
                                        mdId_mdId : oDataSeleccionada.getData().mdId,
                                        agrupadorId_clasificacionUtensilioId : oObj.clasificacionUtensilioId,
                                        orden : aListEquipoAssignResponsive.getData().length + nPosicion
                                    }
                                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", oParam);
                                }
                                // });
                                oTable.removeSelections();
                                await oThat.onGetDataEstructuraMD();
                                await oThat.onCreateModelTree();
                                oThatConf.onOpenEquipo();
                                oThatConf.onCerrarAddAgrupador();
                                oThatConf.onCancelAddEquipoEditRM();
                                BusyIndicator.hide();  
                            }
                        },
                    });
                } else {
                    MessageBox.success(formatter.onGetI18nText(oThat, "sNoRegistroSeleccionado"));
                }
                
            },

            onCerrarAddAgrupador: function () {
                var oDataFilter = oThat.getView().getModel("oDataFilterAgrupador");
                oDataFilter.getData().descripcion = "";
                oDataFilter.refresh(true);
                oThatConf.onSearchGroups()
                this.oAddAgrupador.close();
            },

            openFullColorSample: function (oEvent) {
                // ;
                let oDataPaso;
                if(oEvent.getSource().data("component")=="ProcMenores"){
                oDataPaso = oEvent.getSource().getParent().getParent().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                }
                else{
                    oDataPaso = oEvent.getSource().getParent().getBindingContext("aListPasoAssignResponsive").getObject();
                }
                let namePredec=oEvent.getSource().data("component");
                 this.localModel.setProperty("/oDataPasoColor", oDataPaso);
    
                if(!this.onListColor){
                    this.onListColor = sap.ui.xmlfragment(
                        "frgListColor",
                        rootPath + ".view.fragment.editarRM.SelectColor",
                        this
                    );
                    oThat.getView().addDependent(this.onListColor);
                    // this.onListColor(new JSONModel({"componentPredecesor":namePredec}));
                }
                this.onListColor.open();
                
                sap.ui.getCore().byId("frgListColor--idTemp").setValue(namePredec);
                if (oDataPaso.colorHex) {
                    sap.ui.getCore().byId("frgListColor--cpId").setColorString(oDataPaso.colorHex);
                } else {
                    sap.ui.getCore().byId("frgListColor--cpId").setColorString("#ffffff");
                }
            },
            //mcode 
            //actualización de la funcion para validar proceMenores
            onConfirmSelectColor: function(oEvent) {
                let oDataPasoColor = this.localModel.getProperty("/oDataPasoColor");
                let namePredecesor = sap.ui.getCore().byId("frgListColor--idTemp").getValue();
                let oDataPasoTbl,oDataProcMenores;
                if(namePredecesor=="ProcMenores"){
                 oDataProcMenores = oThat.getView().getModel("listMdEsPasoInsumoPaso").getData();


                 $.each(oDataProcMenores, function (k, v){
                    if (v.mdEstructuraPasoInsumoPasoId === oDataPasoColor.mdEstructuraPasoInsumoPasoId) {
                        v.colorHex = oThatConf.onListColor.getContent()[0].Color.hex;
                        v.colorRgb = oThatConf.onListColor.getContent()[0].getColorString();
                        v.formato = true;
                    }
                });
                }else{
                     oDataPasoTbl = oThat.getView().getModel("aListPasoAssignResponsive").getData();
                 
                $.each(oDataPasoTbl, function (k, v){
                    if (v.mdEstructuraPasoId === oDataPasoColor.mdEstructuraPasoId) {
                        v.colorHex = oThatConf.onListColor.getContent()[0].Color.hex;
                        v.colorRgb = oThatConf.onListColor.getContent()[0].getColorString();
                        v.formato = true;
                    }
                });
                }
                
                this.localModel.setProperty("/oDataPasoColor", "");
                this.onListColor.close();
            },
    
            onCancelSelectColor: function () {
                this.onListColor.close();
                this.localModel.setProperty("/oDataPasoColor", "");
            },
            
            openImagenCarga: async function (oEvent) {
                let oPasoSelected = oEvent.getSource().getParent().getBindingContext("aListPasoAssignResponsive").getObject();
                let urlGet = "";
                if (oPasoSelected.mdEstructuraId.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) {
                    oThat.localModel.setProperty("/oPasoSelectedImagen/bEtiquetaPaso", true);
                    oThat.localModel.setProperty("/oPasoSelectedImagen/bEstructuraPaso", false);
                    urlGet = oPasoSelected.mdId_mdId + "/" + oPasoSelected.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.mdEsEtiquetaId_mdEsEtiquetaId + "/" + oPasoSelected.mdEstructuraPasoId;
                } else {
                    oThat.localModel.setProperty("/oPasoSelectedImagen/bEtiquetaPaso", false);
                    oThat.localModel.setProperty("/oPasoSelectedImagen/bEstructuraPaso", true);
                    urlGet = oPasoSelected.mdId_mdId + "/" + oPasoSelected.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.mdEstructuraPasoId;
                }
                oThat.localModel.setProperty("/oPasoSelectedImagen/oDataPaso", oPasoSelected);
                this.openSelectImagen(oPasoSelected);
                if (oPasoSelected.imagen) {
                    await this.onGetImagenSharepoint(urlGet);
                }
            },

            onGetImagenSharepoint : async function (urlGet) {
                BusyIndicator.show(0);
                let oData = {
                    origen  : "ImagenMD",
                    url     :  urlGet
                }
                let oImagenCargada = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                let oDownloadImage = {
                    origen  : "ImagenMD",
                    codigoRM : urlGet,
                    Name : oImagenCargada[0].Name
                }
                let oImagenResult= await sharepointService.sharePointDownloadGeneral(oThat.mainModelv2, oDownloadImage);
                let len = oImagenResult.length;
                let bytes = new Uint8Array(len);
                for (let i = 0; i <len; i++) {
                    bytes[i]= oImagenResult.charCodeAt(i);
                }
                let arrBuffer =bytes.buffer;
                let base64 = btoa(new Uint8Array(arrBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                let format = '';
                if ((oImagenCargada[0].Name).indexOf("jpg") !== -1) {
                    format = "data:image/jpg;base64,"
                } else {
                    format = "data:image/png;base64,"
                }
                let img = format + base64;
                sap.ui.core.Fragment.byId("frgListImagen", "idImgPaso").setSrc(img);
                BusyIndicator.hide();
            },

            openSelectImagen: function (oPasoSelected) {
                if(!oThat.onImagen){
                    oThat.onImagen = sap.ui.xmlfragment(
                        "frgListImagen",
                        rootPath + ".view.fragment.editarRM.body.Imagen.SelectImagen",
                        this
                    );
                    oThat.getView().addDependent(oThat.onImagen);
                }

                if (oPasoSelected.imagen) {
                    this.localModel.setProperty("/oImagenCargada", {
                        imagen: [],
                        width: oPasoSelected.imagenWidth,
                        position: oPasoSelected.imagenPosition
                    });
                } else {
                    this.localModel.setProperty("/oImagenCargada", {
                        imagen: [],
                        width: 10,
                        position: 0
                    });
                }

                this.onChangePosition(null, oPasoSelected.imagenPosition);
                
                oThat.onImagen.open();
            },

            onUploadImagen: function (oEvent) {
                let that = this;
                var oFile = oEvent.getParameter("files")[0];
                if (oFile) {
                    if(oFile.size / 1000000 <= iMaxLengthArchivos){
                        var reader = new FileReader();
                        reader.onload = function (result) {
                            var byteArray = new Uint8Array(result.target.result);
                            var obj = {
                                'name': oFile.name,
                                'fileData': byteArray
                            }
                            var aListaArchivos = that.localModel.getProperty("/oImagenCargada");
                            if(!aListaArchivos.imagen) {
                                aListaArchivos.imagen = [];
                            }
                            aListaArchivos.imagen.push(obj);
                            that.localModel.refresh(true);
                        };
                        reader.readAsArrayBuffer(oFile);
                    } else {
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage71"));
                        sap.ui.core.Fragment.byId("frgListImagen", "fu_selectImagen").setValue(null);
                    }
                }
            },

            onConfirmSelectImagen: async function() {
                BusyIndicator.show(0);
                let oImagenCargada = this.localModel.getProperty("/oImagenCargada");
                let oPasoSelected  = this.localModel.getProperty("/oPasoSelectedImagen");

                if (oPasoSelected.oDataPaso.imagen && (!oImagenCargada.imagen || oImagenCargada.imagen.length === 0)) {
                    if (!oImagenCargada.width || oImagenCargada.width === '' || oImagenCargada.position === '') {
                        BusyIndicator.hide();
                        MessageBox.warning(formatter.onGetI18nText(oThat,"msgImagenUpload"))
                        return;
                    }

                    if (oImagenCargada.position === 0 || oImagenCargada.position === 2) {
                        if (oImagenCargada.width < 10 || oImagenCargada.width > 500) {
                            BusyIndicator.hide();
                            MessageBox.warning(formatter.onGetI18nText(oThat,"msgRangoWidthImage"))
                            return;
                        }
                    } else {
                        if (oImagenCargada.width < 10 || oImagenCargada.width > 130) {
                            BusyIndicator.hide();
                            MessageBox.warning(formatter.onGetI18nText(oThat,"msgRangoWidthImage"))
                            return;
                        }
                    }

                    let updatePasoMD = {
                        usuarioActualiza    : oInfoUsuario.data.usuario,
                        fechaActualiza      : new Date(),
                        imagenWidth         : oImagenCargada.width,
                        imagenPosition      : oImagenCargada.position
                    }
                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", updatePasoMD, oPasoSelected.oDataPaso.mdEstructuraPasoId);
                    await oThat.onGetDataEstructuraMD();
                    await oThat.onCreateModelTree();
                    if (oPasoSelected.bEtiquetaPaso) {
                        await oThatConf.onGetPasosToAssignProcess();
                    } else {
                        await oThatConf.onGetPasosToAssign();
                    }
                    BusyIndicator.hide();
                    oThatConf.onCancelSelectImagen();
                    MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage73"));
                } else {
                    if (!oImagenCargada.imagen || oImagenCargada.imagen.length === 0) {
                        BusyIndicator.hide();
                        MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage72"))
                        return;
                    }

                    if (!oImagenCargada.width || oImagenCargada.width === '' || oImagenCargada.position === '') {
                        BusyIndicator.hide();
                        MessageBox.warning(formatter.onGetI18nText(oThat,"msgImagenUpload"))
                        return;
                    }

                    if (oImagenCargada.position === 0 || oImagenCargada.position === 2) {
                        if (oImagenCargada.width < 10 || oImagenCargada.width > 500) {
                            BusyIndicator.hide();
                            MessageBox.warning(formatter.onGetI18nText(oThat,"msgRangoWidthImage"))
                            return;
                        }
                    } else {
                        if (oImagenCargada.width < 10 || oImagenCargada.width > 130) {
                            BusyIndicator.hide();
                            MessageBox.warning(formatter.onGetI18nText(oThat,"msgRangoWidthImage"))
                            return;
                        }
                    }

                    let urlGet = '';
                    if (oPasoSelected.oDataPaso.imagen) {
                        if (oPasoSelected.bEtiquetaPaso) {
                            urlGet = urlGet = oPasoSelected.oDataPaso.mdId_mdId + "/" + oPasoSelected.oDataPaso.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.oDataPaso.mdEsEtiquetaId_mdEsEtiquetaId + "/" + oPasoSelected.oDataPaso.mdEstructuraPasoId;
                        }
                        if (oPasoSelected.bEstructuraPaso) {
                            urlGet = urlGet = oPasoSelected.oDataPaso.mdId_mdId + "/" + oPasoSelected.oDataPaso.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.oDataPaso.mdEstructuraPasoId;
                        }
                        let oData = {
                            origen  : "ImagenMD",
                            url     :  urlGet
                        }
                        let oImagenCargada = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                        let oDeleteImage = {
                            origen  : "ImagenMD",
                            codigoRM : urlGet,
                            Name : oImagenCargada[0].Name
                        }
                        await sharepointService.sharepointDeleteGeneral(oThat.mainModelv2, oDeleteImage);
                    }
                    let sImagenRuta;
                    oImagenCargada.imagen.forEach(async function(e){
                        e.origen        = "ImagenMD";
                        e.mdId          = oPasoSelected.oDataPaso.mdId_mdId;
                        e.estructuraId  = oPasoSelected.oDataPaso.mdEstructuraId_mdEstructuraId;
                        e.pasoId        = oPasoSelected.oDataPaso.mdEstructuraPasoId;
                        sImagenRuta = oPasoSelected.oDataPaso.mdId_mdId + "/" + oPasoSelected.oDataPaso.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.oDataPaso.mdEstructuraPasoId;
                        if (oPasoSelected.bEtiquetaPaso) {
                            e.etiquetaId = oPasoSelected.oDataPaso.mdEsEtiquetaId_mdEsEtiquetaId;
                            sImagenRuta = oPasoSelected.oDataPaso.mdId_mdId + "/" + oPasoSelected.oDataPaso.mdEstructuraId_mdEstructuraId + "/" + oPasoSelected.oDataPaso.mdEsEtiquetaId_mdEsEtiquetaId + "/" + oPasoSelected.oDataPaso.mdEstructuraPasoId;
                        }
                        let oParam = {
                            usuarioActualiza    : oInfoUsuario.data.usuario,
                            fechaActualiza      : new Date(),
                            archivoMD           : JSON.stringify(e)
                        }
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, oPasoSelected.oDataPaso.mdId_mdId);
                        let updatePasoMD = {
                            usuarioActualiza    : oInfoUsuario.data.usuario,
                            fechaActualiza      : new Date(),
                            imagen              : true,
                            imagenRuta          : sImagenRuta,
                            imagenWidth         : oImagenCargada.width,
                            imagenPosition      : oImagenCargada.position
                        }
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO", updatePasoMD, oPasoSelected.oDataPaso.mdEstructuraPasoId);
                        await oThat.onGetDataEstructuraMD();
                        await oThat.onCreateModelTree();
                        if (oPasoSelected.bEtiquetaPaso) {
                            oThatConf.onGetPasosToAssignProcess();
                        } else {
                            oThatConf.onGetPasosToAssign();
                        }
                        BusyIndicator.hide();
                        oThatConf.onCancelSelectImagen();
                        MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage73"));
                    });
                }
            },

            onCancelSelectImagen: function () {
                oThat.onImagen.close();
                sap.ui.core.Fragment.byId("frgListImagen", "fu_selectImagen").setValue(null);
                sap.ui.core.Fragment.byId("frgListImagen", "idImgPaso").setSrc('');
            },

            onGetListPredecesores: function () {
                let oEstructuraHeader = oThat.getView().getModel("headerAddEstructura").getData();
                let sOrdenEtiquetaSeleccionada = "";
                if (oEstructuraHeader.tipoEstructuraId === sIdTipoEstructuraProceso) {
                    let oEtiqueta = oThat.getView().getModel("headerAddEtiqueta").getData();
                    sOrdenEtiquetaSeleccionada = oEtiqueta.orden;
                } 
                
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let aListaEstructurasPrevias = oDataSeleccionada.getData().aEstructura.results.filter(item=>item.orden <= oEstructuraHeader.orden && (item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraCuadro || item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso));
                let aListaPasosPrevios = [];
                aListaEstructurasPrevias.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                aListaEstructurasPrevias.forEach(function(oEstructura){
                    if (oEstructura.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) {
                        oEstructura.aEtiqueta.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                        let aEtiquetasResult = [];
                        if(sOrdenEtiquetaSeleccionada !== ""){
                            aEtiquetasResult = oEstructura.aEtiqueta.results.filter(itm=>itm.orden <= sOrdenEtiquetaSeleccionada);
                        } else {
                            aEtiquetasResult = oEstructura.aEtiqueta.results;
                        }
                        aEtiquetasResult.forEach(function(oEtiqueta){
                            let aPasosEtiqueta = oEstructura.aPaso.results.filter(fPaso => fPaso.pasoId.etiquetaId_etiquetaId === oEtiqueta.etiquetaId_etiquetaId);
                            if (aPasosEtiqueta) {
                                aPasosEtiqueta.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
                            aListaPasosPrevios = aListaPasosPrevios.concat(aPasosEtiqueta);     
                            }
                        });
                        
                    } else {
                        oEstructura.aPaso.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                        aListaPasosPrevios = aListaPasosPrevios.concat(oEstructura.aPaso.results);    
                    }
                });
                this.localModel.setProperty("/aListaPasosPrevios", aListaPasosPrevios);
            },

            onShowPredecesores: async function (oEvent) {
                let aListaPasosPrevios = this.localModel.getProperty("/aListaPasosPrevios");
                let oPasoSelected = oEvent.getSource().getBindingContext("aListPasoAssignResponsive").getObject();
                this.localModel.setProperty("/aPasoSave", oPasoSelected);
                let sOrdenSelected = oPasoSelected.orden;
                let aListaPasosPreviosEstructura = aListaPasosPrevios.filter(itm=>itm.estructuraId_estructuraId !== oPasoSelected.estructuraId_estructuraId);
                let aListaPasosPreviosSameEstructura = aListaPasosPrevios.filter(itm=>itm.estructuraId_estructuraId === oPasoSelected.estructuraId_estructuraId);
                if(aListaPasosPreviosSameEstructura.length>0){

                    if (aListaPasosPreviosSameEstructura[0].mdEstructuraId.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso) {
                        let aListaPasosEtiqueta = aListaPasosPreviosSameEstructura.filter(itm=>itm.pasoId.etiquetaId_etiquetaId !== oPasoSelected.pasoId.etiquetaId_etiquetaId);
                        let aListaPasosPreviosSameEtiqueta = aListaPasosPreviosSameEstructura.filter(itm=>itm.pasoId.etiquetaId_etiquetaId === oPasoSelected.pasoId.etiquetaId_etiquetaId);
                        let aListaPasosPreviosEtiquetaFilter = aListaPasosPreviosSameEtiqueta.filter(itm => itm.orden < sOrdenSelected);
                        aListaPasosPreviosEstructura = aListaPasosPreviosEstructura.concat(aListaPasosEtiqueta);
                        aListaPasosPreviosEstructura = aListaPasosPreviosEstructura.concat(aListaPasosPreviosEtiquetaFilter)
                    } else {
                        let aListaPasosPreviosFilter = aListaPasosPreviosSameEstructura.filter(itm => itm.orden < sOrdenSelected);
                        aListaPasosPreviosEstructura = aListaPasosPreviosEstructura.concat(aListaPasosPreviosFilter);
                    }
                }

                await aListaPasosPreviosEstructura.sort((a, b) => {
                    return (
                        a.ordenEtiqueta - b.ordenEtiqueta &&
                        a.orden - b.orden
                    );
                });
                this.localModel.setProperty("/aListaPasosDynamic", aListaPasosPreviosEstructura);
				if (!oThatConf.oDialog) {
					oThatConf.oDialog = sap.ui.xmlfragment("frgAddPredecesores", rootPath + ".view.fragment.editarRM.body.BodyPredecesores", oThatConf);
					oThat.getView().addDependent(oThatConf.oDialog);
				}
				oThatConf.oDialog.open();
			},

            onBuscarPredecesores: function (oEvent) {
                let aFilters = [];
                let sQuery = oEvent.getParameters().value;
                if (sQuery && sQuery.length > 0) {
                    aFilters.push(new Filter("pasoId/codigo", FilterOperator.EQ, sQuery));
                }
                let oList = sap.ui.core.Fragment.byId("frgAddPredecesores", "idPredecesorList");
                oList.getBinding("items").filter(aFilters, FilterType.Application);
            },

            onConfirmPredecesor: function (oEvent) {
                let selectedContext = oEvent.mParameters.selectedItem.getBindingContext("localModel").getObject();
                let selectedItem = String(selectedContext.pasoId.codigo);
                let selectedIdDepende = selectedContext.mdEstructuraPasoIdDepende;
                let pasoSave = this.localModel.getProperty("/aPasoSave");
                let aLisPasos = oThat.getView().getModel("aListPasoAssignResponsive").getData();
                let oPasoSeleccionado = aLisPasos.find(itm=>itm.mdEstructuraPasoId === pasoSave.mdEstructuraPasoId);
                if (oPasoSeleccionado) {
                    oPasoSeleccionado.depende = selectedItem;
                    oPasoSeleccionado.dependeMdEstructuraPasoId = selectedIdDepende;
                }
                oThat.getView().getModel("aListPasoAssignResponsive").refresh(true);
            },

            onCancelPredecesor: function () {
                let aFilters = [];
                let oList = sap.ui.core.Fragment.byId("frgAddPredecesores", "idPredecesorList");
                oList.getBinding("items").filter(aFilters, FilterType.Application); 
            },

            // ABRIR FORMULA
            onOpenFormulasPasoInsumoPaso: function (oEvent) {
                let aDataPaso = oEvent.getSource().getBindingContext("listMdEsPasoInsumoPaso").getObject();
                oThat.localModel.setProperty("/listMsEstructuraPaso",aDataPaso); //añadimos el modelo para mapear los registros
                if (!this.oOpenFormula) {
                    this.oOpenFormula = sap.ui.xmlfragment(
                        "frgOpenFormula",
                        rootPath + ".view.fragment.editarRM.OpenFormula",
                        this
                    );
                    oThat.getView().addDependent(this.oOpenFormula);
                }

                this.oOpenFormula.open();
                this.onObtenerEstructurasPasosFormulas(aDataPaso, false);
            },

            onConsumirPuestoTrabajo: async function () {
                try {
                    let { mdId } = oThat.getView().getModel("asociarDatos").getData();
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    let sExpand = "recetaId";
                    let { results } = await Service.onGetDataGeneralFiltersExpand(oThatConf.mainModelv2, "MD_RECETA", aFilters, sExpand);
                    if (results.length > 0) {
                        let { Plnnr, Alnal } = results[0].recetaId;
                        let aFilters = [];
                        aFilters.push(new Filter("Plnnr", "EQ", Plnnr));
                        aFilters.push(new Filter("Umrez", "EQ", Alnal));
                        await Service.onGetDataGeneralFilters(this.oModelErpNec, "PuestoTrabSet", aFilters).then(({ results }) => {
                            oThat.getView().getModel("localModel").setProperty("/dataPuestoTrabajo", results);
                            sap.ui.core.BusyIndicator.hide();
                        }).catch((e) => {
                            sap.ui.core.BusyIndicator.hide();
                        });
                    } else {
                        // MessageBox.warning("No hay recetas asociadas");
                        sap.ui.core.BusyIndicator.hide();
                    }
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            onGetEnsayoSAP: async function () {
                BusyIndicator.show(0);
                let oContext = oThat.getView().getModel("asociarDatos").getData();
                let oEstructura = oThat.getView().getModel("headerAddEstructura").getData();
                let aEnsayosResult = [];
                let iHaveError = false;
                for await (const oReceta of oContext.aReceta.results) {
                    let aFilter = [];
                    aFilter.push(new Filter("Plnnr", "EQ", oReceta.recetaId.Plnnr));
                    aFilter.push(new Filter("Plnal", "EQ", oReceta.recetaId.Alnal));

                    await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "RecetaSet", aFilter).then(payload=>{
                        //añadimos el ordenamiento
                        let info = payload.results.sort((a,b)=> Number(a.Merknr) - Number(b.Merknr));
                        aEnsayosResult=[...info]
                        iHaveError = false;
                    }).catch(err=>{
                        BusyIndicator.hide();
                        console.log(err);
                        iHaveError = true;
                    })
                }

                if(iHaveError){
                    BusyIndicator.hide();
                    MessageToast.show(formatter.onGetI18nText(oThat,"smgNoEspecifSap"));
                }
                
                let oData = {
                    id : util.onGetUUIDV4(),
                    aEspecificacionMd : []
                }

                if (aEnsayosResult.length > 0) {
                    let aListEspecificacionAssignResponsive = oThat.getView().getModel("aListEspecificacionAssignResponsive");
                    let aListEspecificacionAssignResponsiveSAP = aListEspecificacionAssignResponsive.getData().filter(itm=>itm.ensayoPadreSAP !== null && itm.ensayoPadreSAP !== undefined && itm.ensayoPadreSAP !== '');
                    let sMessageValidator = '';
                    for await (const oEnsayo of aEnsayosResult){
                        let bFlag = true;
                        for await (const oEnsayos of aListEspecificacionAssignResponsiveSAP) {
                            if (oEnsayo.Verwmerkm === oEnsayos.ensayoPadreSAP) {
                                bFlag = false;
                                break;
                            }
                        }
                        if (bFlag) {
                            if (oEnsayo.Verwmerkm && oEnsayo.Verwmerkm !== "" && oEnsayo.Merknr && oEnsayo.Merknr !== "") {
                                let oEnsayoData =  {
                                    usuarioRegistro                 : oInfoUsuario.data.usuario,
                                    fechaRegistro                   : new Date(),
                                    activo                          : true,
                                    mdEstructuraEspecificacionId    : util.onGetUUIDV4(),
                                    mdEstructuraId_mdEstructuraId   : oEstructura.mdEstructuraId,
                                    estructuraId_estructuraId       : oEstructura.estructuraId_estructuraId,
                                    mdId_mdId                       : oEstructura.mdId_mdId,
                                    ensayoPadreSAP                  : oEnsayo.Verwmerkm || "",
                                    ensayoHijo                      : oEnsayo.Kurztext || "", 
                                    especificacion                  : oEnsayo.Especif || "", // Kurztext cambiar por el texto de sap
                                    Merknr                          : oEnsayo.Merknr || "",
                                    tipoDatoId_iMaestraId           : sTipoDatoTexto // id 
                                }
                                oData.aEspecificacionMd.push(oEnsayoData);
                            } else {
                                sMessageValidator += oEnsayo.Kurztext;
                            }
                        }
                    }
                    await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oData);
                    await oThatConf._updateModelRestforContext();
                    await oThatConf.onGetEspecificacionesToAssign();
                    if (sMessageValidator !== '') {
                        MessageBox.error(formatter.onGetI18nText(oThat,"sMessageValidatorEnsayoSap") + " " + sMessageValidator);
                    }
                    BusyIndicator.hide();
                } else {
                    BusyIndicator.hide();
                    MessageToast.show(formatter.onGetI18nText(oThat,"smgNoEspecifSap"));
                }
            },

            _updateModelRestforContext:async function (sStep="") {
                await oThat._updateModelRest();
                if (sStep === 'procesoCuadro') {
                    await oThatConf.onGetPasosToAssignProcess();
                } else {
                    await oThatConf.onGetPasosToAssign();
                }
            },

            onChangeDataAutorization: function (aDataPasoOEvent, oValueOEvent, sPathOEvent, sObjectOEvent) {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos"),
                    aDataPaso = aDataPasoOEvent;
                
                if (!oValueOEvent) {
                    let oModelOEvent = aDataPasoOEvent.getSource().getParent().getParent().mBindingInfos.items.model;
                    aDataPaso = aDataPasoOEvent.getSource().getParent().getBindingContext(oModelOEvent).getObject();
                    aDataPaso.depende = null;
                    aDataPaso.dependeMdEstructuraPasoId = null;
                    aDataPaso.ordenPredecesor = null;
                }

                let sValueInput = oValueOEvent;
                if (sValueInput === '') {
                    let valueInputBind = sPathOEvent;
                    if (valueInputBind === 'depende') {
                        let lineaSeleccionada = sObjectOEvent;
                        let aContextValue = oThat.getView().getModel("aListPasoAssignResponsive").getData();
                        let oContextValue = aContextValue.find(itm=>itm.mdEstructuraPasoId === lineaSeleccionada.mdEstructuraPasoId);
                        oContextValue.depende = null;
                        oContextValue.dependeMdEstructuraPasoId = null;
                        oContextValue.ordenPredecesor = null;
                        oThat.getView().getModel("aListPasoAssignResponsive").refresh(true);
                    }
                }
                if (oDataSeleccionada.getData().estadoIdRmd_iMaestraId === sEstadoAutorizado) {
                    aDataPaso.flagModif = true;
                }
            },

            onSaveCantidadRm:async function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let aFilter = [];
                    aFilter.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    aFilter.push(new Filter("activo", "EQ", true));
                    aFilter.push(new Filter("estructuraRecetaInsumoId_estructuraRecetaInsumoId", "NE", null));
                    let aInsumoToPaso = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilter);
                    
                    let aFilterIns = [];
                    aFilterIns.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    aFilterIns.push(new Filter("activo", "EQ", true));
                    let aInsumo = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_RE_INSUMO", aFilterIns);

                    for await (const itmInsumo of aInsumo.results) {
                        let itemInsumo = aInsumoToPaso.results.filter(itm=>itm.estructuraRecetaInsumoId_estructuraRecetaInsumoId === itmInsumo.estructuraRecetaInsumoId);
                        let nCantidadInsumoGeneral = 0;
                        for await (const itm of itemInsumo) {
                            nCantidadInsumoGeneral += parseFloat(itm.cantidadInsumo);
                        }

                        let oData = {
                            cantidadRm: parseFloat(parseFloat(nCantidadInsumoGeneral).toFixed(3)),
                            fechaActualiza: new Date(),
                            usuarioActualiza: oInfoUsuario.data.usuario
                        }
        
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oData, itmInsumo.estructuraRecetaInsumoId);
                    }
                    await oThat.onGetMdEsReInsumo().then(function (oListMdEsReInsumo) {
                        let oModelInsumo = new JSONModel(oListMdEsReInsumo.results);
                        oModelInsumo.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelInsumo, "listMdEsReInsumo");
                        oThat.getView().getModel("listMdEsReInsumo").refresh(true);
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThatConf.onErrorMessage(oError, "errorSave");
                    });
                    sap.ui.core.BusyIndicator.hide();
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            onFormaterBodyForm: function(CompQty,cantidadRm){
                if(CompQty){
                    CompQty = CompQty.replace(/ /g, "");
                    CompQty = parseFloat(CompQty, 10);
                    cantidadRm = parseFloat(cantidadRm, 10);
                    if(CompQty !== cantidadRm){
                        return "PROCESSED";
                    }
                }
            },

            onValidateExistItem: async function (sTipo, bExiste, oData) {
                let bResponse = true;
                let iOrden, sEntity, iIdFuente, sIdFuente;
                if (sTipo === "ESTRUCTURA") {
                    sEntity = "MD_ESTRUCTURA";
                    iIdFuente = oData.estructuraId_estructuraId;
                    sIdFuente = "estructuraId_estructuraId";
                } else if (sTipo === "ETIQUETA") {
                    sEntity = "MD_ES_ETIQUETA";
                    iIdFuente = oData.etiquetaId_etiquetaId;
                    sIdFuente = "etiquetaId_etiquetaId";
                }
                if (bExiste){
                    let aFilter = [];
                    aFilter.push(new Filter(sIdFuente, "EQ", iIdFuente));
                    aFilter.push(new Filter("mdId_mdId", "EQ", oData.mdId_mdId));
                    aFilter.push(new Filter("activo", "EQ", true));
                    let aItemResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, sEntity, aFilter);
                    if(aItemResponse.results.length !== 0) {
                        bResponse = false;
                        iOrden = false;
                    }
                } 
                if (bResponse) {
                    let aFilter = [];
                    aFilter.push(new Filter("mdId_mdId", "EQ", oData.mdId_mdId));
                    aFilter.push(new Filter("activo", "EQ", true));
                    let aItemResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, sEntity, aFilter);
                    aItemResponse.results.sort(function (a, b) {
                        return b.orden - a.orden;
                    });
                    if (aItemResponse.results.length > 0) {
                        iOrden = parseInt(aItemResponse.results[0].orden) + 1;
                    } else {
                        iOrden = 1;
                    }  
                }
                return iOrden;
            },

            onChangePosition: function (oEvent, iPosition) {
                let i18nMax = '',
                    phI18nMax = '',
                    iValor = 0;

                if (oEvent) {
                    iValor = oEvent.getSource().getSelectedIndex();
                } else {
                    iValor = iPosition;
                }
                
                if (iValor === 0 || iValor === 2) {
                    i18nMax = formatter.onGetI18nText(oThat,"lbImagenWidthUpDown");
                    phI18nMax = formatter.onGetI18nText(oThat,"phlbImagenWidthUpDown");
                } else {
                    i18nMax = formatter.onGetI18nText(oThat,"lbImagenWidthRight");
                    phI18nMax = formatter.onGetI18nText(oThat,"phlbImagenWidthRight");
                }

                let oModelI18n = new JSONModel({
                    i18n: i18nMax,
                    phi18n: phI18nMax
                });

                oModelI18n.setSizeLimit(999999999);
                oThat.getView().setModel(oModelI18n, "sI18nMaxWidth");
                oThat.getView().getModel("sI18nMaxWidth").refresh(true);
            },

            onChangeVB: function (oEvent) {
                let oData = oEvent.getSource().getBindingContext("aListPasoAssignResponsive").getObject(),
                    oDataModel = oThat.getView().getModel("aListPasoAssignResponsive"),
                    aDataModel = oDataModel.getData();

                let oMdPaso = aDataModel.find(itm=>itm.mdEstructuraPasoId === oData.mdEstructuraPasoId);

                if (oMdPaso.vb) {
                    oMdPaso.rpor = true;
                }
                
                oDataModel.refresh(true);
            },
            onGenerarComparacion: function () { //mchpcode
                if (!this.oAddCompareRM) {
                    this.oAddCompareRM = sap.ui.xmlfragment(
                        "frgAdicCompareRM",
                        rootPath + ".view.fragment.editarRM.AdicCompareRM",
                        this
                    );
                   
                    // console.log("currentCode",currentCode);
                   
                    oThat.getView().addDependent(this.oAddCompareRM);
               
                    
                }
                // let lstMD = oThat.getView().getModel("listMD").getData();
                // let currentCode = oThat.getView().getModel("asociarDatos").getProperty("/codigo");
                // let lstMD = oThat.getView().getModel("localModel").getProperty("/listMDCompare");
                // let compareRM = lstMD.filter(item=> item.codigo != currentCode);
                // oThat.getView().setModel(new JSONModel(compareRM),"compareRM");
                // oThat.getView().getModel("oDataMdEstructura").setProperty("/description","");
                // oThat.getView().getModel("oDataMdEstructura").refresh();
                oThatConf.onRestoreFiltersCompare();
                this.oAddCompareRM.open();
            },
            onPressCompare:function(oEvent){
                // debugger; 
                let data = oEvent.getSource().getBindingContext("compareRM").getObject();
                console.log(data);
                // const { mdId, codigo } = data;

                oThatConf.onExportCompareXLS(data);
            },

            // Buscar por el filtro de comparación de MD.
            onSearchMdEstructureCompare: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgAdicCompareRM--idTblMdCompare");
                    sap.ui.getCore().byId("frgAdicCompareRM--cmbTipoComparacion").setValueState("None");
                    sap.ui.getCore().byId("frgAdicCompareRM--cmbTipoComparacion").setValueStateText("");
                    var oDataFilter;
                    oDataFilter = oThat.getView().getModel("oDataMdEstructura");
                    let type = oDataFilter.getData().code=="C" ? "codigo": "descripcion";
                    // console.log(valuefilter);
                    var aFilter = [];
                    if(oDataFilter.getData().code!=undefined){
                        if (oDataFilter.getData().description){

                            aFilter.push(
                                    new Filter(
                                         type,
                                            FilterOperator.Contains,
                                            oDataFilter.getData().description
                                        )
                                    );
                
                        }
                        aFilter.push(new Filter("activo", FilterOperator.EQ, true));
                        // if (estadoFilter.isValid) {
                        sTable.getBinding("items").filter(aFilter, FilterType.Application);
                    }else{
                        // var sTable = sap.ui.getCore().byId("frgAdicCompareRM--idTblMdCompare");
                        // debugger;
                        sap.ui.getCore().byId("frgAdicCompareRM--cmbTipoComparacion").setValueState("Error")
                        // sap.ui.getCore().byId("frgAdicCompareRM--cmbTipoComparacion").setValueStateText("Seleccione un tipo")
                    }
                } catch (oError) {
                    oThatConf.onErrorMessage(oError, "errorSave");
                }
            },
    
            onExportCompareXLS: async function (objMD) {
                BusyIndicator.show(0);
                // let itemsTree = oThat.getView().getModel("listMdEstructuraGeneral").getData(); //current md 
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                //getData Estructura
                let mdId_a, mdId_b;
                let aFilter = [];
                // let aRecetas = [];
                aFilter.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.mdId));
                let sExpand = "aPaso/pasoId,aPaso/tipoDatoId,estructuraId,aEquipo/equipoId,aInsumo,aUtensilio,aUtensilio/utensilioId,aEspecificacion,aEtiqueta/etiquetaId,aPasoInsumoPaso/pasoId,aPasoInsumoPaso/tipoDatoId,aPasoInsumoPaso/pasoHijoId,aPasoInsumoPaso/estructuraRecetaInsumoId,mdId,aEspecificacion/tipoDatoId";

                //Validar por tipo de dato

                let estructuras = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2,"MD_ESTRUCTURA",aFilter,sExpand)

                console.log(estructuras);


                //call RMD in parallelax

                let aFilter2 = [];
                aFilter2.push(new Filter("mdId_mdId", "EQ", objMD.mdId));

                let estructuras_alternas = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2,"MD_ESTRUCTURA",aFilter2,sExpand)

                // console.log( estructuras_alternas );
                  mdId_a = oDataSeleccionada.codigo;
                  mdId_b = objMD.codigo;
                let currentItem = null;
                let ws;
                const wb = XLSX.utils.book_new();
                let cellExcludes = ["A","B","C"]
                //Precauciones
                    //STATUS
                /**
                 * 1 NOT EQUALS
                 * 2 EMPTY LEFT
                 * 3 SUCCESS
                 * 0 empty rigth
                 */

                estructuras.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });

                estructuras_alternas.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });

                let data = [{
                    name: 'Codigo:',
                    description: mdId_a
                }, {
                    name: 'Descripción:',
                    description: oDataSeleccionada.descripcion
                }, {
                    name: 'Versión:',
                    description:  oDataSeleccionada.version
                }, {
                    name: 'Nivel:',
                    description:  oDataSeleccionada.nivelTxt
                }];

                let arrCompare1 = {codigo:mdId_b,descripcion:objMD.descripcion,version:objMD.version,nivel:objMD.nivelTxt}

                let max = estructuras.results.length > estructuras_alternas.results.length ? estructuras.results.length : estructuras_alternas.results.length;
                if(max>0 && estructuras.results.length>0){

                    for(let v = 0; v < max; v++) {
                        let item = estructuras.results[v] || {};
                        let item_alterEst = estructuras_alternas.results[v] || {};
                        
                    // }
                    // estructuras.results.map(item=>{
                        let tipo_estructura = (item.estructuraId) ? item.estructuraId.tipoEstructuraId_iMaestraId: 0;
                        let tipo_estructura_alter = (item_alterEst.estructuraId) ? item_alterEst.estructuraId.tipoEstructuraId_iMaestraId: 0;

                        if(tipo_estructura == objTipoEstructuraIMaestro.Cuadro || tipo_estructura_alter == objTipoEstructuraIMaestro.Cuadro ){
                                
                                currentItem = item;
                                let cuadros_alter = item_alterEst;
                                let _ws;
                                let nameSheet;
                            
                                let nameAlter = "";
                                // if(cuadros_alter.length>0)
                                if(cuadros_alter.hasOwnProperty("estructuraId"))
                                    nameAlter = cuadros_alter.estructuraId.descripcion;
        
                                

                                ws = XLSX.utils.json_to_sheet(data, {
                                    origin: "A1"
                                }); 
                                let nameCurrent = (currentItem.estructuraId)? currentItem.estructuraId.descripcion : null;
                                if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
                                    
                                    let type = currentItem.estructuraId.tipoEstructuraId_iMaestraId;

                                    let cuadro = currentItem.aPaso.results;
                                    // let cuadro_alter = cuadros_alter[0].aPaso.results;
                                    let cuadro_alter = cuadros_alter.aPaso.results;
                                    let arr_cuadros = [];
                                    let max = cuadro.length > cuadro_alter.length ? cuadro.length : cuadro_alter.length;
                                    
                                    cuadro.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });
        
                                    cuadro_alter.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });
        
                                    
                                    if(max>0){
        
                                        for (let x = 0; x < max; x++) {
        
            
                                            let paso = {};
                                            let paso_alt = null;
            
                                                let step = cuadro[x] || {};
        
                                                paso.orden=step.orden||"";
                                                paso.depende=step.depende||"";
                                                paso.codigo=(step.pasoId)?step.pasoId.codigo:""
                                                paso.descripcion=(step.pasoId)?step.pasoId.descripcion:""
                                                paso.tipo_dato=step.tipoDatoId?step.tipoDatoId.contenido:"";
                                                paso.val_inicial=step.valorInicial||"";
                                                paso.val_final=step.valorFinal||"";
                                                paso.margen=step.margen||"";
                                                paso.decimales=step.decimales||"";
                                                paso.estado_cc=step.estadoCC ||"";
                                                paso.estado_mov=step.estadoMov||"";
                                    
                                                let obj = {}
                                                paso_alt = cuadro_alter[x] || {};
        
                                                let objTemp={}
                                                objTemp.orden=paso_alt.orden||"";
                                                objTemp.depende=paso_alt.depende||"";
                                                objTemp.codigo=(paso_alt.pasoId)? (paso_alt.pasoId.codigo) :""
                                                objTemp.descripcion=(paso_alt.pasoId)?paso_alt.pasoId.descripcion:""
                                                objTemp.tipo_dato=paso_alt.tipoDatoId?paso_alt.tipoDatoId.contenido:"";
                                                objTemp.val_inicial=paso_alt.valorInicial||"";
                                                objTemp.val_final=paso_alt.valorFinal||"";
                                                objTemp.margen=paso_alt.margen||"";
                                                objTemp.decimales=paso_alt.decimales||"";
                                                objTemp.estado_cc=paso_alt.estadoCC  || "";
                                                objTemp.estado_mov=paso_alt.estadoMov || "";
            
                                                obj.orden1=paso_alt.orden || "";
                                                obj.depende1=paso_alt.depende || "";
                                                obj.codigo1=(paso_alt.pasoId) ? (paso_alt.pasoId.codigo) : "";
                                                obj.descripcion1=(paso_alt.pasoId) ? paso_alt.pasoId.descripcion : "";
                                                obj.tipo_dato1=paso_alt.tipoDatoId ? paso_alt.tipoDatoId.contenido : "";
                                                obj.val_inicial1=paso_alt.valorInicial || "";
                                                obj.val_final1=paso_alt.valorFinal || "";
                                                obj.margen1=paso_alt.margen || "";
                                                obj.decimales1=paso_alt.decimales || "";
                                                obj.estado_cc1=paso_alt.estadoCC  || "";
                                                obj.estado_mov1=paso_alt.estadoMov || "";
            
            
                                            let com_a = JSON.stringify(Object.values(paso).join(""));
                                            let com_b = JSON.stringify(Object.values(objTemp).join(""));
                                            if(com_a == com_b){
                                                obj.status = 3 //DATOS IGUALES
                                            }else if(paso.orden=="" && JSON.stringify(objTemp).length>2 ){
                                                obj.status = 2 // VACIO LEFT
                                            // }else if(objTemp.orden!="" && paso.orden!="" && paso.orden !== objTemp.orden  ){
                                            }else if(objTemp.orden!="" && paso.orden!="" && com_a != com_b ){
                                                obj.status = 1 // NO ES IGUAL
                                            }else{
                                                obj.status = 0 // Vacio Right
                                            }
                
                                            paso = {...paso,...obj};
        
                                            arr_cuadros.push(paso);
                                            
                                        }
        
                                        XLSX.utils.sheet_add_json(ws, arr_cuadros, { origin: "D6" });
                                        // oThatConf.validateSheetStructure(typeCurrent,currentItem);
                                        _ws =  oThatConf.validateSheetStructure(type,ws,currentItem,arrCompare1);
                                        // _ws =  oThatConf.estructuraCuadro(ws,currentItem,2,arrCompare1);
        
                                        var keys = Object.keys(_ws);
                                        //añadir el separador 
                                        keys.map((val, index)=>{
                                            let row =Number(val.substring(1));
                                            if(val.includes("Z") && val !== "Z2"  ){
        
                                                if(_ws[val].v==1){
                                                    //filtramos 
                                                    let filtro =keys.filter(cell => cell.includes(row) && (!cellExcludes.includes(cell.substring(0,1))) );
                                                    filtro.map(item=>{
                                                        _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                                        
                                                    })
                                                }
                                            }
                                            //validar para pintar las celdas
                                            if(val.includes("O") && val !== "O6" && row > 5 ){
                                                _ws[val].s= {border:{left: {style: "medium",color: {rgb:"111111"}}}};
                                            }
                                        })
        
                                        nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                   
                                        ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);

                                        XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                    }
    
                                }else if(cuadros_alter.hasOwnProperty("aPaso")){ 
                                    // if(cuadros_alter.aPaso.results.length>0){
                                        // let cuadro = (currentItem.aPaso) ? currentItem.aPaso.results:[];
                                        // let cuadro_alter = cuadros_alter.aPaso.results;
        
                                        let typeCurrent = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0;
                                        // OBJECT LEFT
                                        let arrData1 =  oThatConf.validateTypeStructure(typeCurrent,currentItem);
                                        if(arrData1.length>0){
                                            ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                            XLSX.utils.sheet_add_json(ws, arrData1, { origin: "D6" });
                                            _ws =  oThatConf.validateSheetStructure(typeCurrent,ws,currentItem,arrCompare1);
                                            // _ws =  oThatConf.estructuraCuadro(ws,currentItem,3);
                                            nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                         
                                            _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                            XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                        //OBJECT RIGTH
                                        }
                                        let type = cuadros_alter.estructuraId.tipoEstructuraId_iMaestraId;
                                        if(Object.values(objTipoEstructuraIMaestro).includes(type)){
                                            let data = [{
                                                name: 'Codigo:',
                                                description: arrCompare1.codigo
                                            }, {
                                                name: 'Descripción:',
                                                description: arrCompare1.descripcion
                                            }, {
                                                name: 'Versión:',
                                                description:  arrCompare1.version
                                            }, {
                                                name: 'Nivel:',
                                                description:  arrCompare1.nivel
                                            }];
    
                                            let arrData =  oThatConf.validateTypeStructure(type,cuadros_alter);
                                            if(arrData.length>0){
                                                ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                                XLSX.utils.sheet_add_json(ws, arrData, { origin: "D6" });
                                                _ws =  oThatConf.validateSheetStructure(type,ws,cuadros_alter,arrCompare1);
                                                nameSheet = oThatConf.replaceName(cuadros_alter,cuadros_alter.estructuraId.descripcion)
                                                _ws["!cols"] = oThatConf.formatterWidthCells(type); 
                                                XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                            }
                                        
                                        }
                                    // }
                                
                               
                                }else if(currentItem.hasOwnProperty("aPaso")){
    
                                    let cuadro = currentItem.aPaso.results;
                                    cuadro.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });
    
                                    let max = cuadro.length;
                                    let arr_cuadros = [];
                                    if(max>0){

                                        for (let i = 0; i < max; i++) {
            
                                            let paso = {};
                                            let step = cuadro[i] || {};  
        
                                            paso.orden=step.orden;
                                            paso.depende=step.depende;
                                            paso.codigo=(step.pasoId)? (step.pasoId.codigo) :""
                                            paso.descripcion=(step.pasoId)?step.pasoId.descripcion:""
                                            paso.tipo_dato=step.tipoDatoId?step.tipoDatoId.contenido:"";
                                            paso.val_inicial=step.valorInicial;
                                            paso.val_final=step.valorFinal;
                                            paso.margen=step.margen;
                                            paso.decimales=step.decimales;
                                            paso.estado_cc=step.estadoCC;
                                            paso.estado_mov=step.estadoMov;
                                       
                                            let obj = {}
        
                                                              
                                            obj.orden1="";
                                            obj.depende1="";
                                            obj.codigo1="";
                                            obj.descripcion1="";
                                            obj.tipo_dato1="";
                                            obj.val_inicial1="";
                                            obj.val_final1="";
                                            obj.margen1="";
                                            obj.decimales1="";
                                            obj.estado_cc1="";
                                            obj.estado_mov1="";
                
                                            paso = {...paso,...obj};
                                            
        
            
                                            arr_cuadros.push(paso);
            
                                        }
        
                                        XLSX.utils.sheet_add_json(ws, arr_cuadros, { origin: "D6" });
                                        _ws =  oThatConf.estructuraCuadro(ws,currentItem,0);
                                        nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
    
                                        _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                        XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
        
                                    }
                                }
                        }
                        
                        else if(tipo_estructura == objTipoEstructuraIMaestro.Equipos || tipo_estructura_alter==objTipoEstructuraIMaestro.Equipos){ //485
    
    
                            currentItem = item;
                            let equipos_alter = item_alterEst;
    
                            let nameAlter = "";
                            if(equipos_alter.hasOwnProperty("estructuraId"))
                                nameAlter = equipos_alter.estructuraId.descripcion;
    
                            let _ws;
                            let nameSheet;
    
    
                            ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                            let nameCurrent = (currentItem.estructuraId)? currentItem.estructuraId.descripcion : null;
                            if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
                            // if(currentItem.estructuraId.descripcion == nameAlter){
    
                                    let equipos = currentItem.aEquipo.results;  
                                    let utensilios = currentItem.aUtensilio.results;  
                                    // let equipo_alter = equipos_alter[0].aEquipo.results;
                                    let equipo_alter = equipos_alter.aEquipo.results;
                                    // let utensilio_alter = equipos_alter[0].aUtensilio.results;
                                    let utensilio_alter = equipos_alter.aUtensilio.results;
                                    
                                    let arr_equipos_rmd = [];
                                    equipos = [...equipos,...utensilios]
                                    equipo_alter = [...equipo_alter,...utensilio_alter];

                                    equipos.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });
    
                                    equipo_alter.sort(function (a, b) {
                                        return a.orden - b.orden;
                                    });
                                    let max = equipos.length > equipo_alter.length ? equipos.length : equipo_alter.length;
    
                                    if(max>0){
    
                                        for (let i = 0; i < max; i++) {
                                            let equipo = {};
            
                                            let eq = equipos[i] || {};
                                         
                                            equipo.orden = eq.orden || "";
                                            let tipo = (eq.equipoId) ? "EQUIPO": (eq.utensilioId)? "UTENSILIO" : "";
                                            equipo.codigo = tipo == "EQUIPO" ? eq.equipoId.equnr : tipo !==""? eq.utensilioId.codigo:"" ;
                                            equipo.descripcion =  tipo == "EQUIPO" ? eq.equipoId.eqktx : tipo !==""? eq.utensilioId.descripcion : ""; // (eq.equipoId)?eq.equipoId.eqktx : (eq.utensilioId)? eq.utensilioId.descripcion : "";
                                            
                                            let objTemp={};
                                            let obj={};
                                            
                                            let eq_alter = equipo_alter[i] || {};
                                            objTemp.orden = eq_alter.orden || "";
                                            let tipoAL = (eq_alter.equipoId) ? "EQUIPO": (eq_alter.utensilioId)? "UTENSILIO" : "";
                                            objTemp.codigo = tipoAL == "EQUIPO" ?   eq_alter.equipoId.equnr : tipoAL!=""? eq_alter.utensilioId.codigo:"" ;
                                            objTemp.descripcion = tipoAL == "EQUIPO" ?  eq_alter.equipoId.eqktx : tipoAL!="" ? eq_alter.utensilioId.descripcion:"" ;
                                             // (eq_alter.equipoId)?eq_alter.equipoId.eqktx : (eq_alter.utensilioId)? eq_alter.utensilioId.descripcion : "";
                                            
                                            
                                            obj.orden1 = eq_alter.orden|| "";
                                            obj.codigo1 = tipoAL == "EQUIPO" ?   eq_alter.equipoId.equnr : tipoAL!=""? eq_alter.utensilioId.codigo:"" ;
                                            obj.descripcion1 = tipoAL == "EQUIPO" ?  eq_alter.equipoId.eqktx : tipoAL!="" ? eq_alter.utensilioId.descripcion:"" ;
                                            
    

                                            let com_a = JSON.stringify(Object.values(equipo).join(""));
                                            let com_b = JSON.stringify(Object.values(objTemp).join(""));
                                            if(com_a == com_b){
                                                obj.status = 3 //DATOS IGUALES
                                            }else if(equipo.orden=="" && JSON.stringify(objTemp).length>2 ){
                                                obj.status = 2 // VACIO LEFT
                                            }else if(objTemp.orden!="" && equipo.orden!="" && com_a != com_b ){
                                                obj.status = 1 // NO ES IGUAL
                                            }else{
                                                obj.status = 0 // Vacio Right
                                            }
    
                                            equipo = {...equipo,...obj};
            
                                            arr_equipos_rmd.push(equipo);
                                        }
            
                                        XLSX.utils.sheet_add_json(ws, arr_equipos_rmd, { origin: "D6" });
                                        //TITULOS DE CABECERA
                                        _ws =  oThatConf.validateSheetStructure(tipo_estructura,ws,currentItem,arrCompare1);
                                        // _ws =  oThatConf.estructuraEquipo(ws,currentItem,1,arrCompare1);
            
                                       //validar para pintar las celdas
                                       var keys = Object.keys(_ws);
       
                                       keys.map((val)=>{
    
                                        
                                           let row =Number(val.substring(1));
                                           if(val.includes("J") && val !== "J6" ){
       
                                               // _ws[val].s= {border:{left: {style: "medium",color: {rgb:"111111"}}}};
                                               if(_ws[val].v==1){
                                                   //filtramos 
                                                   let filtro =keys.filter(cell => (cell.includes(row) && val.substring(1) == cell.substring(1))  &&  !cellExcludes.includes(cell.substring(0,1)) );
                                                   filtro.map(item=>{
                                                       _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                                   })
                                               }
                                           }
    
                                           if(val.includes("G") && val !== "G6" && row > 5){
                                            _ws[val].s= {border:{left: {style: "medium",color: {rgb:"111111"}}}};
                                            }
                                        
                                        })
            
                                    
                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet)
                                    }
    
                            }else if(equipos_alter.hasOwnProperty("aEquipo")){
                                let typeCurrent = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0
                               let arrData1 =  oThatConf.validateTypeStructure(typeCurrent,currentItem);
                               if(arrData1.length>0){
                                   ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                   XLSX.utils.sheet_add_json(ws, arrData1, { origin: "D6" });
                                   _ws =  oThatConf.validateSheetStructure(typeCurrent,ws,currentItem,arrCompare1);
                                //    _ws =  oThatConf.estructuraEquipo(ws,currentItem,3,arrCompare1);
                                   nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);

                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                   XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                }
                                let type = equipos_alter.estructuraId.tipoEstructuraId_iMaestraId;
                                if(Object.values(objTipoEstructuraIMaestro).includes(type)){
                                    
                                    let arrData =  oThatConf.validateTypeStructure(type,equipos_alter);
                                    //OBJECT RIGTH
                                    let data = [{
                                        name: 'Codigo:',
                                        description: arrCompare1.codigo
                                    }, {
                                        name: 'Descripción:',
                                        description: arrCompare1.descripcion
                                    }, {
                                        name: 'Versión:',
                                        description:  arrCompare1.version
                                    }, {
                                        name: 'Nivel:',
                                        description:  arrCompare1.nivel
                                    }];
                                    
                                     if(arrData.length>0){
                                           ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                           XLSX.utils.sheet_add_json(ws, arrData, { origin: "D6" });
                                           // debugger;
                                           _ws =  oThatConf.validateSheetStructure(type,ws,equipos_alter,arrCompare1);
                                                 // LONGITUD DE COLUMNAS
                                       
                                            _ws["!cols"] = oThatConf.formatterWidthCells(type); 
                                           nameSheet = oThatConf.replaceName(equipos_alter,equipos_alter.estructuraId.descripcion)
                                           XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                       }
                                }
                            } else if(currentItem.hasOwnProperty("aEquipo")){
    
                                // if( equipos_rmd.length>0){
                                    let equipos = currentItem.aEquipo.results;  
                                    let equipo_alter = []; //.filter(item => item.orden == eq.orden);
                                    let max = equipos.length > equipo_alter.length ? equipos.length : equipo_alter.length;
                                     let arr_equipos_rmd = [];
                                     if(max>0){
    
                                         for (let i = 0; i < max; i++) {
                                             // const element = array[i];
                                             let equipo = {};
             
             
                                             let eq = equipos[i] || {};
                                             equipo.orden = eq.orden || "";
                                             equipo.codigo = (eq.equipoId)?eq.equipoId.equnr : "";
                                             equipo.descripcion = (eq.equipoId)?eq.equipoId.eqktx: "";
                                             let obj={};
                                    
                                             // if(eq_alter.length>0){
                                                let eq_alter = equipos_alter[i]|| {};
                                                 obj.orden1 = eq_alter.orden|| "";
                                                 obj.codigo1 = (eq_alter.equipoId) ? eq_alter.equipoId.equnr: "";
                                                 obj.descripcion1 = (eq_alter.equipoId) ? eq_alter.equipoId.eqktx: "";
                                             // }
                                             
             
              
             
                                             equipo = {...equipo,...obj};
             
                                            
                                             arr_equipos_rmd.push(equipo);
                                         }
             
                                         XLSX.utils.sheet_add_json(ws, arr_equipos_rmd, { origin: "D6" });
                                         //TITULOS DE CABECERA
                                         _ws =  oThatConf.estructuraCuadro(ws,currentItem);
             
                                        _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                        nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
                                        XLSX.utils.book_append_sheet(wb, _ws, nameSheet)
                                     }
                            }
                            
                            
                        }
    
                        else if(tipo_estructura == objTipoEstructuraIMaestro.Condiciones || tipo_estructura_alter==objTipoEstructuraIMaestro.Condiciones){
    
                            currentItem = item;
    
                            let condiciones_alter =  item_alterEst;
    
                            let nameAlter = "";
                            if(condiciones_alter.hasOwnProperty("estructuraId"))
                                nameAlter = condiciones_alter.estructuraId.descripcion;
    
                                ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                            
                                let _ws, nameSheet;
                            
                            let nameCurrent = (currentItem.estructuraId)? currentItem.estructuraId.descripcion : null;
                            if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
                            
    
                                let condicion = currentItem.aPaso.results;
                                let condicion_alter = condiciones_alter.aPaso.results;
                                let max = condicion.length > condicion_alter.length ? condicion.length : condicion_alter.length;
                               
                                condicion.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
                                condicion_alter.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
    
                                let arr_condiciones = [];
                                if(max>0){
    
                                    
                                    for (let i = 0; i < max; i++) {
                                        // const element = array[i];
                                        //filtramos por el mismo # de orden
                                        let paso = {};
                                        let paso_alt = null;
    
                                        let step = condicion[i] || {};
                                    
                                        paso.orden=step.orden|| "";
                                        paso.depende=step.depende|| "";
                                        paso.codigo=step.pasoId.codigo|| "";
                                        paso.descripcion=step.pasoId.descripcion|| "";
                                        paso.tipo_dato=step.tipoDatoId?step.tipoDatoId.contenido:"";
                                        paso.val_inicial=step.valorInicial|| "";
                                        paso.val_final=step.valorFinal|| "";
                                        paso.margen=step.margen|| "";
                                        paso.decimales=step.decimales|| "";
                                        paso.estado_cc=step.estadoCC|| "";
                                        paso.estado_mov=step.estadoMov|| "";
                                
                                        let obj = {}
            
                                        //step2
                                            paso_alt = condicion_alter[i] || {};
                                            let objTemp = {};
                                            objTemp.orden=paso_alt.orden|| "";
                                            objTemp.depende=paso_alt.depende|| "";
                                            objTemp.codigo=paso_alt.pasoId.codigo|| "";
                                            objTemp.descripcion=paso_alt.pasoId.descripcion|| "";
                                            objTemp.tipo_dato=paso_alt.tipoDatoId?paso_alt.tipoDatoId.contenido:"";
                                            objTemp.val_inicial=paso_alt.valorInicial|| "";
                                            objTemp.val_final=paso_alt.valorFinal|| "";
                                            objTemp.margen=paso_alt.margen|| "";
                                            objTemp.decimales=paso_alt.decimales|| "";
                                            objTemp.estado_cc=paso_alt.estadoCC|| "";
                                            objTemp.estado_mov=paso_alt.estadoMov|| "";
                                          
                                            obj.orden1=paso_alt.orden|| "";
                                            obj.depende1=paso_alt.depende|| "";
                                            obj.codigo1=paso_alt.pasoId.codigo|| "";
                                            obj.descripcion1=paso_alt.pasoId.descripcion|| "";
                                            obj.tipo_dato1=paso_alt.tipoDatoId?paso_alt.tipoDatoId.contenido: "";
                                            obj.val_inicial1=paso_alt.valorInicial|| "";
                                            obj.val_final1=paso_alt.valorFinal|| "";
                                            obj.margen1=paso_alt.margen|| "";
                                            obj.decimales1=paso_alt.decimales|| "";
                                            obj.estado_cc1=paso_alt.estadoCC|| "";
                                            obj.estado_mov1=paso_alt.estadoMov|| "";
            

                                        let com_a = JSON.stringify(Object.values(paso).join(""));
                                        let com_b = JSON.stringify(Object.values(objTemp).join(""));
                                        if(com_a == com_b){
                                            obj.status = 3 //DATOS IGUALES
                                        }else if(paso.orden=="" && JSON.stringify(objTemp).length>2 ){
                                            obj.status = 2 // VACIO LEFT
                                        }else if(objTemp.orden!="" && paso.orden!="" && com_a != com_b ){
                                            obj.status = 1 // NO ES IGUAL
                                        }else{
                                            obj.status = 0 // Vacio Right
                                        }

            
                                        paso = {...paso,...obj};
                                   
                                        arr_condiciones.push(paso);
                                    }   
                                
                                    XLSX.utils.sheet_add_json(ws, arr_condiciones, { origin: "D6" });
    
                                    // _ws = oThatConf.estructuraCuadro(ws, currentItem)
                                    _ws = oThatConf.estructuraCuadro(tipo_estructura, ws, currentItem,arrCompare1)
                                    //añadir el separador 
                                  
                                   //validar para pintar las celdas
                                   var keys = Object.keys(_ws);
    
                                   keys.map((val)=>{
                                    let row =Number(val.substring(1));
                                    if(val.includes("Z") && val !== "Z6" ){
    
                                        if(_ws[val].v==1  ){
                                            //filtramos 
                                            let filtro =keys.filter(cell => cell.includes(row) && !cellExcludes.includes(cell.substring(0,1)));
                                            filtro.map(item=>{
                                                _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                            })
                                        }
                                    }
                                    //validar para pintar las celdas
                                    if(val.includes("O") && val !== "O2" &&   row > 5 ){
                                        _ws[val].s= {border:{left: {style: "medium",color: {rgb:"111111"}}}};
                                    }
                                    }) 
    
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)

                                    ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    XLSX.utils.book_append_sheet(wb, ws, nameSheet);
    
                                }
                            }else if(condiciones_alter.hasOwnProperty("aPaso")){
    
                                let typeCurrent = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0
                                //OBJECT LEFT
                                let arrData1 =  oThatConf.validateTypeStructure(typeCurrent,currentItem);
                                if(arrData1.length>0){
                                    ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                    XLSX.utils.sheet_add_json(ws, arrData1, { origin: "D6" });
                                    // _ws =  oThatConf.estructuraCuadro(ws,currentItem,3,arrCompare1);
                                    _ws =  oThatConf.estructuraCuadro(typeCurrent,ws,currentItem,arrCompare1);
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                    
                                    ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    // _ws["!cols"] = wscol<s;
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                //OBJECT RIGTH
                                }
                                let type = condiciones_alter.estructuraId.tipoEstructuraId_iMaestraId;
                                if(Object.values(objTipoEstructuraIMaestro).includes(type)){

                                    let arrData =  oThatConf.validateTypeStructure(type,condiciones_alter);
                                    let data = [{
                                        name: 'Codigo:',
                                        description: arrCompare1.codigo
                                    }, {
                                        name: 'Descripción:',
                                        description: arrCompare1.descripcion
                                    }, {
                                        name: 'Versión:',
                                        description:  arrCompare1.version
                                    }, {
                                        name: 'Nivel:',
                                        description:  arrCompare1.nivel
                                    }];
                                    
                                    if(arrData.length>0){
                                            ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                            XLSX.utils.sheet_add_json(ws, arrData, { origin: "D6" });
                                            _ws =  oThatConf.validateSheetStructure(type,ws,condiciones_alter,arrCompare1);
 
                                            ws["!cols"] = oThatConf.formatterWidthCells(type);
                                            nameSheet = oThatConf.replaceName(condiciones_alter,condiciones_alter.estructuraId.descripcion)
                                            XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                        }
                                }
        
     
                            }else if(currentItem.hasOwnProperty("aPaso")){
                                let condicion = currentItem.aPaso.results;
    
                                let condicion_alter = [];
    
                                let max = condicion.length > condicion_alter.length ? condicion.length : condicion_alter.length;
                               
                                condicion.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
                                condicion_alter.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
    
                                let arr_condiciones = [];
                                if(max>0){
    
                                    for (let i = 0; i < max; i++) {
                                        // const element = array[i];
                                        //filtramos por el mismo # de orden
                                        let paso = {};
                                        let paso_alt = null;
        
                                        let step = condicion[i] || {};
                                        
                                        if(step.orden!= undefined){
                                            paso.orden=step.orden|| "";
                                            paso.depende=step.depende|| "";
                                            paso.codigo=step.pasoId.codigo|| "";
                                            paso.descripcion=step.pasoId.descripcion|| "";
                                            paso.tipo_dato=step.tipoDatoId?step.tipoDatoId.contenido: "";
                                            paso.val_inicial=step.valorInicial|| "";
                                            paso.val_final=step.valorFinal|| "";
                                            paso.margen=step.margen|| "";
                                            paso.decimales=step.decimales|| "";
                                            paso.estado_cc=step.estadoCC|| "";
                                            paso.estado_mov=step.estadoMov|| "";
                                            
                                        }
                                        let obj = {}
            
                                        //step2
                                        paso_alt = condicion_alter[i] || {};
                                        if(paso_alt.orden!= undefined){
    
                                            obj.orden1=paso_alt.orden|| "";
                                            obj.depende1=paso_alt.depende|| "";
                                            obj.codigo1=paso_alt.pasoId.codigo|| "";
                                            obj.descripcion1=paso_alt.pasoId.descripcion|| "";
                                            obj.tipo_dato1=paso_alt.tipoDatoId?paso_alt.tipoDatoId.contenido: "";
                                            obj.val_inicial1=paso_alt.valorInicial|| "";
                                            obj.val_final1=paso_alt.valorFinal|| "";
                                            obj.margen1=paso_alt.margen|| "";
                                            obj.decimales1=paso_alt.decimales|| "";
                                            obj.estado_cc1=paso_alt.estadoCC|| "";
                                            obj.estado_mov1=paso_alt.estadoMov|| "";
            
                                        }
        
                                        paso = {...paso,...obj};
            
                                        if(Object.values(paso)===Object.values(obj)){
                                            obj.status = 3 //DATOS IGUALES
                                        }else if(JSON.stringify(paso).length==2 && JSON.stringify(obj).length>2 ){
                                            obj.status = 2 // VACIO LEFT
                                        }else if(JSON.stringify(obj).length>2){
                                            obj.status = 1 // NO ES IGUAL
                                        }
            
                                        esp = {...esp,...obj};
        
                                        arr_condiciones.push(esp);
                                    }   
                                   
                                    XLSX.utils.sheet_add_json(ws, arr_condiciones, { origin: "D6" });
        
                                    ws = oThatConf.estructuraCuadro(ws, currentItem)
                                    ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
                                    XLSX.utils.book_append_sheet(wb, ws, nameSheet)
                                }
                            }
    
                        }
    
                        else if(tipo_estructura == objTipoEstructuraIMaestro.Formula|| tipo_estructura_alter==objTipoEstructuraIMaestro.Formula){
                            currentItem = item;
                            //validamos en el otro md
                            let insumos_alterno = item_alterEst;
                            let arr_insumos = [];
    
                            let nameAlter ="";
                            if(insumos_alterno.hasOwnProperty("estructuraId"))
                            nameAlter = insumos_alterno.estructuraId.descripcion;
    
                            let _ws;
                            let nameSheet;
    
                            ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
    
                            let nameCurrent = (currentItem.estructuraId)? currentItem.estructuraId.descripcion : null;
                            if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
                            // if(currentItem.estructuraId.descripcion== nameAlter){
    
                                let insumos = currentItem.aInsumo.results;

                                
                                let insumos_alterno_current = [];
                                
                                if(insumos_alterno.aInsumo.results.length>0){
                                    insumos_alterno_current = insumos_alterno.aInsumo.results;
                                }
                                
                                insumos.sort((a,b)=> {return (a.ItemNo - b.ItemNo)});
                                insumos_alterno_current.sort((a,b)=> {return (a.ItemNo - b.ItemNo)});
                                let max = insumos.length > insumos_alterno_current.length ? insumos.length : insumos_alterno_current.length;
    
                                if(max>0){
    
                                    for (let i = 0; i < max; i++) {
                                        // const element = array[i];
                                        let insumo = {};
                                        // let insumo_alt = {};
        
                                        let ins = insumos[i] || {};
        
                                        insumo.codigo = ins.Component || '';
                                        insumo.descripcion = ins.Maktx || '';
                                        insumo.cantReceta = ins.CompQty || '';
                                        insumo.cantRMD = ins.cantidadRm> 0 ? ins.cantidadRm  : '';
                                        insumo.UM = ins.CompUnit || '';
        
                                        let ins_alt = insumos_alterno_current[i] || {};
        
                                        let objTemp = {};
    
                                        objTemp.codigo = ins_alt.Component || '';
                                        objTemp.descripcion = ins_alt.Maktx || '';
                                        objTemp.cantReceta = ins_alt.CompQty || '';
                                        objTemp.cantRMD = ins_alt.cantidadRm> 0 ?   ins_alt.cantidadRm : '';
                                        objTemp.UM = ins_alt.CompUnit || '';
                                        
                                        let obj = {};
                                        obj.codigo1 = ins_alt.Component || '';
                                        obj.descripcion1 = ins_alt.Maktx || '';
                                        obj.cantReceta1 = ins_alt.CompQty || '';
                                        obj.cantRMD1 = ins_alt.cantidadRm > 0 ?   ins_alt.cantidadRm : '';
                                        obj.UM1 = ins_alt.CompUnit || '';
                                    


                                        let com_a = JSON.stringify(Object.values(insumo).join(''));
                                        let com_b = JSON.stringify(Object.values(objTemp).join(''));
                                        if(com_a == com_b){
                                            obj.status = 3 //DATOS IGUALES
                                        }else if(insumo.codigo=="" && com_b.length>2 ){
                                            obj.status = 2 // VACIO LEFT
                                        }else if(!oThatConf._empty.includes(objTemp.codigo) && !oThatConf._empty.includes(insumo.codigo) && com_a != com_b ){
                                            obj.status = 1 // NO ES IGUAL
                                        }else{
                                            obj.status = 0 // Vacio Right
                                        }
            
                                        insumo = {...insumo, ...obj};
        
                                        arr_insumos.push(insumo);
                                    }
                                    
                                    XLSX.utils.sheet_add_json(ws, arr_insumos, { origin: "D6" });
                                    // _ws = oThatConf.estructuraFormula(ws,currentItem,1,arrCompare1);
                                    _ws = oThatConf.validateSheetStructure(tipo_estructura,ws,currentItem,arrCompare1);
                                   
        
                                   //validar para pintar las celdas
                                   var keys = Object.keys(_ws);
        
                                   keys.map((val)=>{
        
                                       let row =Number(val.substring(1));
                                       if(val.includes("N") && val !== "N6" ){
        
                                           if(_ws[val].v==1){
                                               //filtramos añadimos color a la celda
                                               let filtro =keys.filter(cell => cell.includes(row) && !cellExcludes.includes(cell.substring(0,1)) && row == cell.substring(1));
                                               filtro.map(item=>{
                                                   _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                               })
                                           }
                                       }
        
                                       //añadir el separador 
                                       if(val.includes("I") && row > 6   ){
                                        _ws[val].s= {border:{left: {style: "medium",color: {rgb:"111111"}}}};
                                        }
                                    })

                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                }
                            }else if(insumos_alterno.hasOwnProperty("aInsumo")){
                                let typeCurrent = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0
                                let arrData1 =  oThatConf.validateTypeStructure(typeCurrent,currentItem);
                                if(arrData1.length>0){
                                    ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                    XLSX.utils.sheet_add_json(ws, arrData1, { origin: "D6" });
                                    // _ws =  oThatConf.estructuraFormula(ws,currentItem,3,arrCompare1);
                                    _ws = oThatConf.validateSheetStructure(typeCurrent,ws,currentItem,arrCompare1);
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)

                                            
                              
                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                  //OBJECT RIGTH
                                }
                                let type = insumos_alterno.estructuraId.tipoEstructuraId_iMaestraId;
                                if(Object.values(objTipoEstructuraIMaestro).includes(type)){

                                    let arrData =  oThatConf.validateTypeStructure(type,insumos_alterno);
                                    let data = [{
                                        name: 'Codigo:',
                                        description: arrCompare1.codigo
                                    }, {
                                        name: 'Descripción:',
                                        description: arrCompare1.descripcion
                                    }, {
                                        name: 'Versión:',
                                        description:  arrCompare1.version
                                    }, {
                                        name: 'Nivel:',
                                        description:  arrCompare1.nivel
                                    }];
                                      if(arrData.length>0){
                                            ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                            XLSX.utils.sheet_add_json(ws, arrData, { origin: "D6" });
                                            // debugger;
                                            _ws =  oThatConf.validateSheetStructure(type,ws,insumos_alterno,arrCompare1);

                                            _ws["!cols"] = oThatConf.formatterWidthCells(type);
                                            nameSheet = oThatConf.replaceName(insumos_alterno,insumos_alterno.estructuraId.descripcion)
                                            XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                        }
                                }
        
                            }else if(currentItem.hasOwnProperty("aInsumo")){
                                // let insumos_alterno_current = [];
                                let insumos = currentItem.aInsumo.results;
                                let max = insumos.length 
                                if(max>0){
    
                                    for (let i = 0; i < max; i++) {
                                        let insumo = {};
        
                                        let ins = insumos[i]|| {};
        
                                        insumo.codigo = ins.Component || "";
                                        insumo.descripcion = ins.Maktx|| "";
                                        insumo.cantReceta = ins.CompQty|| "";
                                        insumo.cantRMD = ins.cantidadRm>0 ? ins.cantidadRm : "";
                                        insumo.UM = ins.CompUnit|| "";
                                  
        
                                        arr_insumos.push(insumo);
                                    }
                                    
                                    XLSX.utils.sheet_add_json(ws, arr_insumos, { origin: "D6" });
                                    _ws = oThatConf.estructuraFormula(ws,currentItem);
                                    // _ws = oThatConf.estructuraFormula(ws,currentItem);
                                    _ws =  oThatConf.validateSheetStructure(tipo_estructura,ws,currentItem,arrCompare1);
    
                                      //validar para pintar las celdas
                                    var keys = Object.keys(_ws);
    
                                   
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                }
                            }
                        }
    
                        else if(tipo_estructura == objTipoEstructuraIMaestro.Especificaciones || tipo_estructura_alter==objTipoEstructuraIMaestro.Especificaciones){ //486
                            currentItem = item;
                            //alterno
                            let especificaciones_alter = item_alterEst;
                            let _ws;
                            let nameSheet;
    
                            let nameAlter = "";
                            if(especificaciones_alter.hasOwnProperty("estructuraId"))
                                nameAlter = especificaciones_alter.estructuraId.descripcion;
    
                            ws = XLSX.utils.json_to_sheet( data ,{origin:"A1"});
    
                            //también tenemos que validar el nombre 
                            let nameCurrent = (currentItem.estructuraId) ? currentItem.estructuraId.descripcion : null;
                            if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
    
                                //capturamos la cantida de especificaciones de esta estructura
                                let especificacion = currentItem.aEspecificacion.results;
    
                                //capturamos la cantida de especificaciones de esta estructura alterna
                                let especificacion_alter = especificaciones_alter.aEspecificacion.results;
    
                                let max = especificacion.length > especificacion_alter.length ? especificacion.length : especificacion_alter.length;
                                
                                especificacion.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
                                especificacion_alter.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
                                let arr_especif = [];
                                if(max>0){
    
                                for (let i = 0; i < max; i++) {
                                    let esp = {};
                                    let esp_alt = null;
                                    
                                    let espec =especificacion[i] || {}; 
                                        esp.orden =espec["orden"] || ""; 
                                        // esp.ensayoHijo =espec["ensayoHijo"].trim() || ""; 
                                        esp.ensayoHijo =(espec["ensayoHijo"]) ? espec["ensayoHijo"].trim() : ""; 
                                        esp.tipoDatoId =espec["tipoDatoId"] ? espec["tipoDatoId"].contenido: ""; 
                                        esp.valorInicial =espec["valorInicial"] || ""; 
                                        esp.valorFinal =espec["valorFinal"] || ""; 
                                        esp.margen =espec["margen"] || ""; 
                                        esp.decimales =espec["decimales"] || ""; 
                                        esp.Merknr =espec["Merknr"] || ""; 
                                        esp.especificacion =(espec["especificacion"])?espec["especificacion"].trim() : ""; 
    
                                    esp_alt = especificacion_alter[i] || {};
                                    let objTemp = {};
                                        objTemp.orden =esp_alt["orden"] || ""; 
                                        objTemp.ensayoHijo =(esp_alt["ensayoHijo"]) ? esp_alt["ensayoHijo"].trim() : ""; 
                                        objTemp.tipoDatoId =(esp_alt["tipoDatoId"] ? esp_alt.tipoDatoId.contenido: ""); 
                                        objTemp.valorInicial =esp_alt["valorInicial"] || ""; 
                                        objTemp.valorFinal =esp_alt["valorFinal"] || ""; 
                                        objTemp.margen =esp_alt["margen"] || ""; 
                                        objTemp.decimales =esp_alt["decimales"] || ""; 
                                        objTemp.Merknr =esp_alt["Merknr"] || ""; 
                                        objTemp.especificacion =esp_alt["especificacion"] || ""; 
                                        
                                        let obj = {};
                                        obj.orden1 =esp_alt["orden"] || ""; 
                                        // obj.ensayoHijo1 =esp_alt["ensayoHijo"] || ""; 
                                        obj.ensayoHijo1 =(esp_alt["ensayoHijo"]) ? esp_alt["ensayoHijo"].trim() : ""; 
                                        obj.tipoDatoId1 =esp_alt["tipoDatoId"]? esp_alt["tipoDatoId"].contenido: ""; 
                                        obj.valorInicial1 =esp_alt["valorInicial"] || ""; 
                                        obj.valorFinal1 =esp_alt["valorFinal"] || ""; 
                                        obj.margen1 =esp_alt["margen"] || ""; 
                                        obj.decimales1 =esp_alt["decimales"] || ""; 
                                        obj.Merknr1 =esp_alt["Merknr"] || ""; 
                                        obj.especificacion1 =(esp_alt["especificacion"])?esp_alt["especificacion"].trim() : ""; 
    
                                  

                                    let com_a = JSON.stringify(esp);
                                    let com_b = JSON.stringify(objTemp);
                                    if(com_a == com_b){
                                        obj.status = 3 //DATOS IGUALES
                                    }else if(esp.orden=="" && com_b.length>2 ){
                                        obj.status = 2 // VACIO LEFT
                                    }else if(objTemp.orden!="" && esp.orden!="" && com_a != com_b ){
                                        obj.status = 1 // NO ES IGUAL
                                    }else{
                                        obj.status = 0 // Vacio Right
                                    }




                                    esp = {...esp,...obj};
    
                                    arr_especif.push(esp);
                                }
                               
                    
                                XLSX.utils.sheet_add_json(ws, arr_especif, { origin: "D6" });
                                 //TITULOS DE CABECERA
                                //  _ws = oThatConf.estructuraEspecificacion(ws,currentItem,1,arrCompare1);
                                 _ws = oThatConf.validateSheetStructure(tipo_estructura,ws,currentItem,arrCompare1);
    
                                //validar para pintar las celdas
                                var keys = Object.keys(_ws);
    
                                keys.map((val)=>{
    
                                    let row =Number(val.substring(1));
                                    if(val.includes("V") && val !== "V2" ){
    
                                        if(_ws[val].v==1){
                                            //filtramos 
                                            let filtro =keys.filter(cell => cell.includes(row) && !cellExcludes.includes(cell.substring(0,1)));
                                            filtro.map(item=>{
                                                _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                            })
                                        }
                                    }
    
                                    
                                });

                                // LONGITUD DE COLUMNAS
                                _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
                                XLSX.utils.book_append_sheet(wb, _ws, nameSheet)
                            }
    
                               
                            }else if(especificaciones_alter.hasOwnProperty("aEspecificacion")){
                                let typeCurrent = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0
                                  let arrData1 =  oThatConf.validateTypeStructure(typeCurrent,currentItem);
                                  if(arrData1.length>0){
                                      ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                      XLSX.utils.sheet_add_json(ws, arrData1, { origin: "D6" });
                                    //   _ws =  oThatConf.estructuraEspecificacion(ws,currentItem,3);
                                      _ws =  oThatConf.validateSheetStructure(tipo_estructura,ws,currentItem);
                                      nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                             
                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                      XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                    //OBJECT RIGTH
    
                                  }
                                    let type = especificaciones_alter.estructuraId.tipoEstructuraId_iMaestraId;
                                    if(Object.values(objTipoEstructuraIMaestro).includes(type)){
                                        let data = [{
                                            name: 'Codigo:',
                                            description: arrCompare1.codigo
                                        }, {
                                            name: 'Descripción:',
                                            description: arrCompare1.descripcion
                                        }, {
                                            name: 'Versión:',
                                            description:  arrCompare1.version
                                        }, {
                                            name: 'Nivel:',
                                            description:  arrCompare1.nivel
                                        }];
                                        let arrData =  oThatConf.validateTypeStructure(type,especificaciones_alter);
                                        if(arrData.length>0){
                                              ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                              XLSX.utils.sheet_add_json(ws, arrData, { origin: "A6" });
                                              _ws =  oThatConf.validateSheetStructure(type,ws,especificaciones_alter);
                                              _ws["!cols"] = oThatConf.formatterWidthCells(type);
                                              nameSheet = oThatConf.replaceName(especificaciones_alter,especificaciones_alter.estructuraId.descripcion)
                                              XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                          }
                                    }
                            }else if(currentItem.hasOwnProperty("aEspecificacion")){
    
                                //especificaciones se valida en una hoja sola
                                let especificacion = currentItem.aEspecificacion.results;
    
                                //capturamos la cantida de especificaciones de esta estructura alterna
                                let especificacion_alter = [];
    
                                let max = especificacion.length > especificacion_alter.length ? especificacion.length : especificacion_alter.length;
                                
                                especificacion.sort(function (a, b) {
                                    return a.orden - b.orden;
                                });
    
                                let arr_especif = [];
                                if(max>0){
                                    for (let i = 0; i < max; i++) {
                                        // const element = array[i];
                                        //filtramos por el mismo # de orden
                                        let esp = {};
                                        let esp_alt = null;
        
                                        let espec =especificacion[i] || {}; 
                                        esp.orden =espec["orden"] || ""; 
                                        esp.ensayoHijo =espec["ensayoHijo"] || ""; 
                                        esp.tipoDatoId =espec["tipoDatoId"]?espec["tipoDatoId"].contenido : ""; 
                                        esp.valorInicial =espec["valorInicial"] || ""; 
                                        esp.valorFinal =espec["valorFinal"] || ""; 
                                        esp.margen =espec["margen"] || ""; 
                                        esp.decimales =espec["decimales"] || ""; 
                                        esp.Merknr =espec["Merknr"] || ""; 
                                        esp.especificacion =espec["especificacion"] || ""; 
        
                                        arr_especif.push(esp);
                                    }

                                    XLSX.utils.sheet_add_json(ws, arr_especif, { origin: "D6" });
                                     //TITULOS DE CABECERA
                                     _ws = oThatConf.estructuraEspecificacion(ws,currentItem); 

                                    _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                    nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                    XLSX.utils.book_append_sheet(wb, _ws, nameSheet)
                                }
                            }
                        }
                    
                        else if(tipo_estructura == objTipoEstructuraIMaestro.Procesos || tipo_estructura_alter==objTipoEstructuraIMaestro.Procesos){
                            currentItem = item;
    
                            let procesos_alter = item_alterEst;
                            let _ws;
                            let nameSheet;
    
                            let aListaEstructurasExcelAlter = item_alterEst;
    
                            let aListaEstructurasExcel = currentItem; //[{}] 

                            let arrCabeceraAlter = [];
                            let oRowBinding = [];
    
                            // let a = Number(aListaEstructurasExcel.length) || 0;  
                            // let b = Number(aListaEstructurasExcelAlter.length) || 0;
                            // let max = a> b ? a: b;
                            let nameAlter="";
                            //LEFT
                            // tenga un objeto
                            // este tiene etiquetas
                            //RIGTH
                            //tenga un objeto
                            //Sea igual
                            //Sea diferente
                            //este no tiene etiquetas
                            if(aListaEstructurasExcelAlter.hasOwnProperty("estructuraId"))
                                nameAlter = aListaEstructurasExcelAlter.estructuraId.descripcion;
    
                            // let nameCurrent = (currentItem.estructuraId)? currentItem.estructuraId.descripcion : null;
                            // if(currentItem.estructuraId != undefined && nameCurrent == nameAlter){
                            // if(a==b){

                                // for (let v = 0; v < max; v++) {
                                    let oEstructura = aListaEstructurasExcel || {};
                                   
                                    let arrEtiq =[];

                                    if(oEstructura.hasOwnProperty("aEtiqueta")){
                                        oEstructura.aEtiqueta.results.sort(function (a, b) {
                                            return a.orden - b.orden;
                                        });

                                        arrEtiq = oEstructura.aEtiqueta.results;
                                    
                                    }
                                    
                                    let oEstructuraAlter = aListaEstructurasExcelAlter || {};
                                    let arrEtiqAlter =[];
                                    if(oEstructuraAlter.hasOwnProperty("aEtiqueta")){
                                        oEstructuraAlter.aEtiqueta.results.sort(function (a, b) {
                                            return a.orden - b.orden;
                                        });
                                        
                                        arrEtiqAlter = oEstructuraAlter.aEtiqueta.results;
                                    }

                                    
                                    //obtener etiquetas de los datos alternos
                                    
                                    let a = Number(arrEtiq.length) || 0;
                                    let b = Number(arrEtiqAlter.length) || 0;
                                    let max = a > b ? a: b;
                                    
                                    //ambas estructuras tienes etiquetas
                                    if(a>0 & b>0){ //a =1 & b=1
                                        for (let i = 0; i < max; i++) {
                                            let oEtiqueta = arrEtiq[i];
                                            let oEtiquetaAlter = arrEtiqAlter[i];
                                            let aPasosEtiqueta=[],aPasosEtiquetaAlter=[];
                                            let descrip  = (oEstructura != undefined && oEtiqueta != undefined ) ? (oEstructura.estructuraId.descripcion  +'-' + oEtiqueta.etiquetaId.descripcion) :"";
                                            
                                            oRowBinding.push({ "cabecera": descrip});

                                            if(oEtiqueta!==undefined){
                                                aPasosEtiqueta = oEstructura.aPaso.results.filter(itm=>itm.mdEsEtiquetaId_mdEsEtiquetaId === oEtiqueta.mdEsEtiquetaId);
                                                aPasosEtiqueta.sort(function (a, b) {
                                                    return a.orden - b.orden;
                                                });
                                            }

                                            if(oEtiquetaAlter!==undefined){
                                                 
                                                arrCabeceraAlter.push( oEstructuraAlter.estructuraId.descripcion + '-' + oEtiquetaAlter.etiquetaId.descripcion );
                                                aPasosEtiquetaAlter = oEstructuraAlter.aPaso.results.filter(itm=>itm.mdEsEtiquetaId_mdEsEtiquetaId === oEtiquetaAlter.mdEsEtiquetaId);
                                              
                                                aPasosEtiquetaAlter.sort(function (a, b) {
                                                    return a.orden - b.orden;
                                                });
                                            }

                                            let a = Number(aPasosEtiqueta.length) || 0;
                                            let b = Number(aPasosEtiquetaAlter.length) || 0;
                                            let max = a> b ? a: b;   
    
                                            //mapping to pasos 
                                            for (let y = 0; y < max; y++) {
                                                let oPasoEtiqueta = aPasosEtiqueta[y]  || {};
                                                let oPasoEtiquetaAlter = aPasosEtiquetaAlter[y] || {};
                                                //LEFT
                                                let oItem = {}
                                                // if(oEtiqueta != undefined){
                                                let orden0="";
                                                if(aPasosEtiqueta[y] != undefined ){
                                                // if(oPasoEtiqueta !== {}){
    
                                                    orden0 = (oEstructura.orden &&  oEtiqueta!=undefined && oPasoEtiqueta.orden!=undefined) ? 
                                                    (oEstructura.orden  + "."+oEtiqueta.orden +  '.'+oPasoEtiqueta.orden) :'';
                                                }
    
                                                    let estadoCC0 = (oPasoEtiqueta.estadoCC) ? 'SI' : (!oPasoEtiqueta.estadoCC && orden0!='' ) ? 'NO':'';
                                                    let estadoMov0 = (oPasoEtiqueta.estadoMov) ? 'SI' : (!oPasoEtiqueta.estadoMov && orden0!='' ) ? 'NO' : '' 
                                                    oItem = {
                                                        orden: orden0,
                                                        depende: oPasoEtiqueta.depende || '',
                                                        codigo: (oPasoEtiqueta.pasoId ? oPasoEtiqueta.pasoId.codigo : ''),
                                                        descripcion: (oPasoEtiqueta.pasoId ? oPasoEtiqueta.pasoId.descripcion.trim() : ''),
                                                        tipoDatoId: (oPasoEtiqueta.tipoDatoId ? oPasoEtiqueta.tipoDatoId.contenido: ''),
                                                        cantidadInsumo: '',
                                                        procesoMenor: '',
                                                        valorInicial: oPasoEtiqueta.valorInicial || '',
                                                        valorFinal: oPasoEtiqueta.valorFinal || '',
                                                        decimales: oPasoEtiqueta.decimales || '',
                                                        estadoCC: estadoCC0,
                                                        estadoMov: estadoMov0
                                                    };
                                                
                                                //RIGHT
                                                let oItemAlter={};
                                                let orden1="";
                                                if(aPasosEtiquetaAlter[y] != undefined ){
                                                    // if(oPasoEtiquetaAlter!=={}){
                                                        orden1 = (oEstructuraAlter.orden &&  oEtiquetaAlter!=undefined && oPasoEtiquetaAlter.orden!=undefined) ? (oEstructuraAlter.orden  + "."+oEtiquetaAlter.orden +  '.'+oPasoEtiquetaAlter.orden) :"";
                                                    }
                                                let estadoCC1 = (oPasoEtiquetaAlter.estadoCC) ? 'SI' :  (!oPasoEtiquetaAlter.estadoCC&& orden1!="") ? 'NO':'';
                                                let estadoMov1 = (oPasoEtiquetaAlter.estadoMov) ? 'SI' :(!oPasoEtiquetaAlter.estadoMov && orden1!='') ? 'NO':'';
                                              
                                                    oItemAlter = {
                                                        "":"",
                                                        orden1:orden1,
                                                        depende1: oPasoEtiquetaAlter.depende ||'',
                                                        codigo1: (oPasoEtiquetaAlter.pasoId ? oPasoEtiquetaAlter.pasoId.codigo : ''),
                                                        descripcion1: (oPasoEtiquetaAlter.pasoId ? oPasoEtiquetaAlter.pasoId.descripcion.trim() : ''),
                                                        tipoDatoId1: (oPasoEtiquetaAlter.tipoDatoId ? oPasoEtiquetaAlter.tipoDatoId.contenido : ''),
                                                        cantidadInsumo1: '',
                                                        procesoMenor1: '',
                                                        valorInicial1: oPasoEtiquetaAlter.valorInicial ||'',
                                                        valorFinal1: oPasoEtiquetaAlter.valorFinal ||'',
                                                        decimales1: oPasoEtiquetaAlter.decimales ||'',
                                                        estadoCC1: estadoCC1,
                                                        estadoMov1: estadoMov1
                                                    };
                                                   let  oItemAlterTemp = {
                                                        orden: orden1,
                                                        depende: oPasoEtiquetaAlter.depende ||'',
                                                        codigo: (oPasoEtiquetaAlter.pasoId ? oPasoEtiquetaAlter.pasoId.codigo : ''),
                                                        descripcion: (oPasoEtiquetaAlter.pasoId ? oPasoEtiquetaAlter.pasoId.descripcion.trim() : ''),
                                                        tipoDatoId: (oPasoEtiquetaAlter.tipoDatoId ? oPasoEtiquetaAlter.tipoDatoId.contenido : ''),
                                                        cantidadInsumo: '',
                                                        procesoMenor: '',
                                                        valorInicial: oPasoEtiquetaAlter.valorInicial ||'',
                                                        valorFinal: oPasoEtiquetaAlter.valorFinal ||'',
                                                        decimales: oPasoEtiquetaAlter.decimales ||'',
                                                        estadoCC: estadoCC1,
                                                        estadoMov: estadoMov1
                                                    };
    
    
                                                let aExistePasoMenor = oEstructura.aPasoInsumoPaso.results.filter(itm=>itm.pasoId_mdEstructuraPasoId === oPasoEtiqueta.mdEstructuraPasoId);
                                                let aExistePasoMenor1 = oEstructuraAlter.aPasoInsumoPaso.results.filter(itm=>itm.pasoId_mdEstructuraPasoId === oPasoEtiquetaAlter.mdEstructuraPasoId);
                                                if (aExistePasoMenor.length > 0) {
                                                    oItem.procesoMenor = 'SI';
                                                } else {
                                                    oItem.procesoMenor = (orden0!=''?'NO': '');  
                                                }
                                                if (aExistePasoMenor1.length > 0) {
                                                    oItemAlter.procesoMenor1 = 'SI';
                                                    oItemAlterTemp.procesoMenor = 'SI';
                                                } else {
                                                    oItemAlter.procesoMenor1 = (orden1!=''?"NO": ''); 
                                                    oItemAlterTemp.procesoMenor = (orden1!=''?"NO": ''); 
                                                }
                                                //merge entre los obj
                                                let comp_ItemA = JSON.stringify(Object.values(oItem).join(''));
                                                // let comp_ItemA = JSON.stringify(oItem);
                                                // let comp_ItemB = JSON.stringify(oItemAlterTemp);
                                                let comp_ItemB = JSON.stringify(Object.values(oItemAlterTemp).join(''));
                                                if(comp_ItemA == comp_ItemB){
                                                    oItemAlter.status = 3
                                                }else if(JSON.stringify(oItemAlterTemp).length<=2){
                                                    oItemAlter.status = 2
                                                }else if(oItemAlterTemp.codigo!=="" && oItem.codigo!="" && comp_ItemA != comp_ItemB){
                                                    oItemAlter.status = 1
                                                }else{
                                                    oItemAlter.status = 0
                                                } 
    
                                                oItem = {...oItem,...oItemAlter};
                                                oRowBinding.push(oItem);
    
                                                aExistePasoMenor.sort(function (a, b) {
                                                    return a.orden - b.orden;
                                                });
                                                aExistePasoMenor1.sort(function (a, b) {
                                                    return a.orden - b.orden;
                                                });
                                                let a = Number(aExistePasoMenor.length) || 0;
                                                let b = Number(aExistePasoMenor1.length) || 0;
                                                let max = a> b ? a: b;    
    
                                                for (let x = 0; x < max; x++) {
                                                    const oPasoInsumoPaso = aExistePasoMenor[x] || {};
                                                    const oPasoInsumoPasoAlter = aExistePasoMenor1[x] || {};
                                                    
                                                    let codigo,codigo1, descripcion,descripcion1;
                                                    if (!oPasoInsumoPaso.pasoHijoId_pasoId) {
                                                        codigo = oPasoInsumoPaso.Component;
    
                                                        descripcion = oPasoInsumoPaso.Maktx ? 'Proceso Menor: ' + oPasoInsumoPaso.Maktx : "";
                                                    } else {
                                                        codigo = oPasoInsumoPaso.pasoHijoId ? oPasoInsumoPaso.pasoHijoId.codigo : "";
                                                        let desc;
                                                        descripcion =(oPasoInsumoPaso.pasoHijoId ?'Proceso Menor: ' + oPasoInsumoPaso.pasoHijoId.descripcion.trim() : "");   
                                                       
                                                        // descripcion =  desc
                                                    }
                                                    if (!oPasoInsumoPasoAlter.pasoHijoId_pasoId) {
                                                        codigo1 = oPasoInsumoPasoAlter.Component|| "";
                                                        descripcion1 = ( oPasoInsumoPasoAlter.Maktx) ? 'Proceso Menor: ' + oPasoInsumoPasoAlter.Maktx :"";
                                                    } else {
                                                        codigo1 = oPasoInsumoPasoAlter.pasoHijoId ? oPasoInsumoPasoAlter.pasoHijoId.codigo : "";
                                                        let desc =(oPasoInsumoPasoAlter.pasoHijoId ? 'Proceso Menor: ' + oPasoInsumoPasoAlter.pasoHijoId.descripcion.trim() : "");   
                                                        descripcion1 = desc;
                                                    }
                                                    let ordenPM1="";
                                                    // if(oPasoInsumoPaso!=={} ){
                                                    if(aExistePasoMenor[x] != undefined ){
                                                        ordenPM1 =(oEstructura.orden && oEtiqueta!=undefined && oPasoEtiqueta.orden!=undefined) ? 
                                                        (oEstructura.orden+"."+oEtiqueta.orden+"."+oPasoEtiqueta.orden+"."+oPasoInsumoPaso.orden):"";
                                                    }
                                                    let estadoCC0 = (oPasoInsumoPaso.estadoCC) ? 'SI' :  (!oPasoInsumoPaso.estadoCC&& ordenPM1!="") ? 'NO':"";
                                                    let estadoMov0 = (oPasoInsumoPaso.estadoMov) ? 'SI' :(!oPasoInsumoPaso.estadoMov && ordenPM1!="") ? 'NO':"";
                                                
                                                    let oItemPM = {
                                                        orden: ordenPM1,
                                                        depende: '',
                                                        codigo: codigo || "",
                                                        descripcion: descripcion,
                                                        tipoDatoId: oPasoInsumoPaso.tipoDatoId ? oPasoInsumoPaso.tipoDatoId.contenido: "",
                                                        procesoMenor: '',
                                                        cantidadInsumo: oPasoInsumoPaso.cantidadInsumo,
                                                        valorInicial: oPasoInsumoPaso.valorInicial|| "",
                                                        valorFinal: oPasoInsumoPaso.valorFinal|| "",
                                                        decimales: oPasoInsumoPaso.decimales || "",
                                                        estadoCC: estadoCC0,
                                                        estadoMov: estadoMov0
                                                    };
                                                    let ordenPM2="";
                                                    if(aExistePasoMenor1[x] != undefined ){
    
                                                        ordenPM2 = (oEstructuraAlter.orden && oEtiquetaAlter!=undefined && oPasoEtiquetaAlter.orden!=undefined) ? 
                                                        (oEstructuraAlter.orden+"."+oEtiquetaAlter.orden+"."+oPasoEtiquetaAlter.orden+"."+oPasoInsumoPasoAlter.orden):"";
                                                    }
                                                    let estadoCC1 = (oPasoInsumoPasoAlter.estadoCC) ? 'SI' :  (!oPasoInsumoPasoAlter.estadoCC && ordenPM2!="") ? 'NO':"";
                                                    let estadoMov1 = (oPasoInsumoPasoAlter.estadoMov) ? 'SI' :(!oPasoInsumoPasoAlter.estadoMov && ordenPM2!="") ? 'NO':"";
                                                
                                                    let oItemPMAlterTemp = {
                                                        orden: ordenPM2,
                                                        depende: '',
                                                        codigo: codigo1 || "",
                                                        descripcion: descripcion1,
                                                        tipoDatoId: oPasoInsumoPasoAlter.tipoDatoId ? oPasoInsumoPasoAlter.tipoDatoId.contenido:"",
                                                        procesoMenor: '',
                                                        cantidadInsumo: oPasoInsumoPasoAlter.cantidadInsumo,
                                                        valorInicial: oPasoInsumoPasoAlter.valorInicial|| "",
                                                        valorFinal: oPasoInsumoPasoAlter.valorFinal || "",
                                                        decimales: oPasoInsumoPasoAlter.decimales|| "",
                                                        estadoCC: estadoCC1,
                                                        estadoMov: estadoMov1
                                                    };
                                                    let oItemPMAlter = {
                                                        orden1: ordenPM2,
                                                        depende1: '',
                                                        codigo1: codigo1,
                                                        descripcion1: descripcion1,
                                                        tipoDatoId1: (oPasoInsumoPasoAlter.tipoDatoId ? oPasoInsumoPasoAlter.tipoDatoId.contenido:""),
                                                        procesoMenor1: '',
                                                        cantidadInsumo1: oPasoInsumoPasoAlter.cantidadInsumo,
                                                        valorInicial1: oPasoInsumoPasoAlter.valorInicial || "",
                                                        valorFinal1: oPasoInsumoPasoAlter.valorFinal|| "",
                                                        decimales1: oPasoInsumoPasoAlter.decimales ||"",
                                                        estadoCC1: estadoCC1,
                                                        estadoMov1: estadoMov1
                                                    };
                                                    // if(oItemPMAlterTemp.orden=="6.5.3"){
                                                    //     console.log("SDSDSD");
                                                    // }
                                                    
                                            
                                                    
                                                    let com_a = JSON.stringify(Object.values(oItemPM).join(""));
                                                    let com_b = JSON.stringify(Object.values(oItemPMAlterTemp).join(""));
                                                    if(com_a == com_b){
                                                        oItemPMAlter.status = 3 //DATOS IGUALES
                                                    }else if(com_b.length<=2 ){
                                                        oItemPMAlter.status = 2 // VACIO LEFT
                                                    }else if(oItemPM.orden!="" && oItemPMAlterTemp.orden!="" && com_a != com_b ){
                                                        oItemPMAlter.status = 1 // NO ES IGUAL
                                                    }else{
                                                        oItemPMAlter.status = 0 // Vacio Right
                                                    }


                                                    oItemPM={...oItemPM,...oItemPMAlter};
                                                    oRowBinding.push(oItemPM);
                                                }
                                            }
                                        }
                                       
                                        ws =XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                        let type = currentItem.estructuraId.tipoEstructuraId_iMaestraId;
                                        XLSX.utils.sheet_add_json(ws, oRowBinding, { origin: "A6" });
                                        _ws =  oThatConf.validateSheetStructure(type,ws,currentItem,arrCompare1 );
    
                                        //objeto Right
                                        var keys = Object.keys(_ws);
                                        // var cabeceras = [];
                                        let p=0;
                                        //captura de datos y agregamos el siguiente campo para setear la cabecera
                                        let arrStates = [];
                                        keys.forEach(function (e,i) {
                                            let row =Number(e.substring(1)); 
                                            if (e.substring(0, 1) === "A" && e !== "A6" &&  Number(e.substring(1)) > 6 ) {
                                                // cabeceras.push(e);
                                                let column="N";
                                                let row =Number(e.substring(1));
                                                if(row>6){
                                                    let cell = column+row;
                                                    ws[cell] = {v:arrCabeceraAlter[p]}
                                                    p++;
                                                }
                                            }
                                            //capturamos el valor : AA77
                                            row =Number(e.substring(2));
                                            //obtener la columna para validar el color de la fila
                                            if(e.includes("AA") && e !== "AA6" ){
                                            
                                                if(_ws[e].v==1){
                                                    //filtramos 
                                                    arrStates.push(e);
                                                    // && e.substring(2).length == cell.substring(2).length
                                                    let filtro =keys.filter(cell => (cell.includes(row) ));
                                                    // la long debe ser solo la cantidad de columnas en este caso solo tenemos 26 
                                                    if(filtro.length>= 25 && row < 100 ){
                                                        //filtramos en cadena de 4
                                                        filtro = filtro.filter(payload => payload.length==3)
                                                    }else{
                                                        //filtramos en cadena de 5
                                                        filtro = filtro.filter(payload => payload.length==4)

                                                    }
                                                    //al final ingresamos el valor de AA+row
                                                    // filtro.push("N"+row);
                                                    filtro.push("AA"+row);
                                                    filtro.map(item=>{
                                                        _ws[item].s = { fill: { fgColor: { rgb: "FFFF00" } }}
                                                        
                                                    })    
                                                
                                                }
                                            }
                                        });
    
                                        nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion);
                                        _ws["!cols"] = oThatConf.formatterWidthCells(currentItem.estructuraId.tipoEstructuraId_iMaestraId);
                                        XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
    
                                    }else if(b>0){ // a = 0 & b=2
    
                                        let type = (procesos_alter.estructuraId)?procesos_alter.estructuraId.tipoEstructuraId_iMaestraId:0;
                                        if(Object.values(objTipoEstructuraIMaestro).includes(type)){
                                            let arrData =  oThatConf.validateTypeStructure(type,procesos_alter);
                                            if(arrData.length>0){
                                                  ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                                  XLSX.utils.sheet_add_json(ws, arrData, { origin: "A6" });
                                                  _ws =  oThatConf.validateSheetStructure(type,ws,procesos_alter,arrCompare1);
                                                  _ws["!cols"] = oThatConf.formatterWidthCells(type);
                                                  nameSheet = oThatConf.replaceName(procesos_alter,procesos_alter.estructuraId.descripcion)
                                                  XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                            }
                                            var cabeceras = [];
                                            
                                            cabeceras.forEach(function (obj) {
                                                ws[obj].s = { font: { bold: true, sN: 14, coloN: { rgb: "1F497D" } } };
                                            })
                                        }
    
    
                                    }else{ 
                                      
                                        let type = (currentItem.estructuraId)?currentItem.estructuraId.tipoEstructuraId_iMaestraId:0;
                                        if(Object.values(objTipoEstructuraIMaestro).includes(type)){
                                            let arrData =  oThatConf.validateTypeStructure(type,currentItem);
                                            if(arrData.length>0){
                                                  ws = XLSX.utils.json_to_sheet( data,{origin:"A1"});
                                                  XLSX.utils.sheet_add_json(ws, arrData, { origin: "A6" });
                                                  _ws =  oThatConf.validateSheetStructure(type,ws,currentItem,arrCompare1);
                                                  _ws["!cols"] = oThatConf.formatterWidthCells(type);
                                                  nameSheet = oThatConf.replaceName(currentItem,currentItem.estructuraId.descripcion)
                                                  XLSX.utils.book_append_sheet(wb, _ws, nameSheet);
                                            }
                                            var cabeceras = [];
                                            
                                            cabeceras.forEach(function (obj) {
                                                ws[obj].s = { font: { bold: true, sN: 14, coloN: { rgb: "1F497D" } } };
                                            })
                                        }
                                    }
                                // }
                            // }  
    
      
                        }
                      
                    // })
                    
                }
                    let nameExcel = `comparacion_${mdId_a}_${mdId_b}.xlsx`;
                    XLSX.writeFile(wb, nameExcel, { cellStyles: true });
                }
                else{
                    MessageToast.show(`No es posible realizar la comparación porque el MD con código ${mdId_a} no tiene estructuras asociadas`)
                }   
          
                BusyIndicator.hide();
                
            },

            estructuraCuadro:function(ws, currentItem,type=1,arrCompare1=""){
                    //TITULOS DE CABECERA
                    ws["A1"] = { v: ""}
                    ws["B1"] = { v: ""}

                    ws["A2"] = { v: "Codigo", s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                    ws["A3"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                    ws["A4"] = { v:'Versión', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                    ws["A5"] = { v:'nivel', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                  
                    ws["B2"].s =  { font: { bold: true }};
                    ws["B3"].s =  { font: { bold: true }};
                    ws["B4"].s =  { font: { bold: true }};
                    ws["B5"].s =  { font: { bold: true }};
                    if(arrCompare1!=""){
                            // //for arrayCompare
                            ws["O2"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                            ws["O3"] = { v:'Descripcion',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                            ws["O4"] = { v:'Versión', s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                            ws["O5"] = { v:'nivel',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                          
                            // DATOS DE ARRAYCOMPARE
                            ws["P2"] = { v: arrCompare1.codigo, s: { font: { bold: true } } };
                            ws["P3"] = { v: arrCompare1.descripcion, s: { font: { bold: true } } };
                            ws["P4"] = { v: arrCompare1.version,s: { font: { bold: true } } };
                            ws["P5"] = { v: arrCompare1.nivel,s: { font: { bold: true } } };
                    }

                    ws["A6"] = { v: "Orden",s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                    ws["B6"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                    ws["C6"] = { v:'Codigo', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                  
                    // DATOS DE CABECERA
                    ws["A7"] = { v: currentItem.orden, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["B7"] = { v: currentItem.estructuraId.descripcion, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["C7"] = { v: currentItem.estructuraId.codigo, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    
                    // if(type<=0){

                        //COLUMNAS DEL TREE TABLE DEL DETALLE 1
                        ws["D6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["E6"] = { v: "Depende", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["F6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["G6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["H6"] = { v: "Tipo Dato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["I6"] = { v: "Val. Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["J6"] = { v: "Val. Final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["K6"] = { v: "Margen", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["L6"] = { v: "# Decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["M6"] = { v: "Flag CC", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["N6"] = { v: "Flag Mov", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        
                        //COLUMNAS DEL TREE TABLE DEL DETALLE 2
                        ws["O6"] = { v: "Orden",s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["P6"] = { v: "Depende", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["Q6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["R6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["S6"] = { v: "Tipo Dato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["T6"] = { v: "Val. Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["U6"] = { v: "Val. Final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["V6"] = { v: "Margen", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["W6"] = { v: "# Decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["X6"] = { v: "Flag CC", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["Y6"] = { v: "Flag Mov", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        ws["Z6"] = { v: "S", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                        
                    
                   return ws;
            },
            estructuraEspecificacion:function (ws,currentItem,type=1,arrCompare1="") {
                ws["A1"] = { v: ""}
                ws["B1"] = { v: ""}
            
                ws["A2"] = { v: "Codigo", s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A3"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A4"] = { v:'Versión', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A5"] = { v:'nivel', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
              
                ws["B2"].s =  { font: { bold: true }};
                ws["B3"].s =  { font: { bold: true }};
                ws["B4"].s =  { font: { bold: true }};
                ws["B5"].s =  { font: { bold: true }};
                if(arrCompare1!=""){
                    // //for arrayCompare
                    ws["M2"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["M3"] = { v:'Descripcion',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["M4"] = { v:'Versión', s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["M5"] = { v:'nivel',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                  
                    // DATOS DE ARRAYCOMPARE
                    ws["N2"] = { v: arrCompare1.codigo, s: { font: { bold: true } } };
                    ws["N3"] = { v: arrCompare1.descripcion, s: { font: { bold: true } } };
                    ws["N4"] = { v: arrCompare1.version,s: { font: { bold: true } } };
                    ws["N5"] = { v: arrCompare1.nivel,s: { font: { bold: true } } };
            }
               
                ws["A6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } }
                ws["B6"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["C6"] = { v:'Codigo', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                
                // DATOS DE CABECERA
                ws["A7"] = { v: currentItem.orden, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["B7"] = { v: currentItem.estructuraId.descripcion, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["C7"] = { v: currentItem.estructuraId.codigo, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                
               //body
                ws["D6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["E6"] = { v: "ensayoHijo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["F6"] = { v: "TipoDato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["G6"] = { v: "Valor Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["H6"] = { v: "Valor final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["I6"] = { v: "Margen", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["J6"] = { v: "decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["K6"] = { v: "Merknr", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["L6"] = { v: "especificacion", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };

                ws["M6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["N6"] = { v: "ensayoHijo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["O6"] = { v: "TipoDato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["P6"] = { v: "Valor Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["Q6"] = { v: "Valor final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["R6"] = { v: "Margen", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["S6"] = { v: "decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["T6"] = { v: "Merknr", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["U6"] = { v: "especificacion", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["V6"] = { v: "estatus", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               
                
                return ws;
            },
            estructuraFormula:function(ws,currentItem,type=1,arrCompare1=""){
                ws["A1"] = { v: ""}
                ws["B1"] = { v: ""}

                ws["A2"] = { v: "Codigo", s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A3"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A4"] = { v:'Versión', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A5"] = { v:'nivel', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
              
                ws["B2"].s =  { font: { bold: true }};
                ws["B3"].s =  { font: { bold: true }};
                ws["B4"].s =  { font: { bold: true }};
                ws["B5"].s =  { font: { bold: true }};
                if(arrCompare1!=""){
                    // //for arrayCompare
                    ws["I2"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["I3"] = { v:'Descripcion',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["I4"] = { v:'Versión', s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["I5"] = { v:'nivel',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                  
                    // DATOS DE ARRAYCOMPARE
                    ws["J2"] = { v: arrCompare1.codigo, s: { font: { bold: true } } };
                    ws["J3"] = { v: arrCompare1.descripcion, s: { font: { bold: true } } };
                    ws["J4"] = { v: arrCompare1.version,s: { font: { bold: true } } };
                    ws["J5"] = { v: arrCompare1.nivel,s: { font: { bold: true } } };
               }
            

                //TITULOS DE CABECERA
                ws["A6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } }
                ws["B6"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["C6"] = { v:'Codigo', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                
                // DATOS DE CABECERA
                ws["A7"] = { v: currentItem.orden, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["B7"] = { v: currentItem.estructuraId.descripcion, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["C7"] = { v: currentItem.estructuraId.codigo, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                
                //COLUMNAS DEL TREE TABLE DEL DETALLE 1
                ws["D6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["E6"] = { v: "Descripcion", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["F6"] = { v: "Cantidad Receta", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["G6"] = { v: "Cantidad RMD", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["H6"] = { v: "UM", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                
                //COLUMNAS DEL TREE TABLE DEL DETALLE 2
                ws["I6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["J6"] = { v: "Descripcion", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["K6"] = { v: "Cantidad Receta", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["L6"] = { v: "Cantidad RMD", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["M6"] = { v: "UM", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["N6"] = { v: "Status", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };

                return ws;
            },
            estructuraEquipo:function(ws,currentItem,type=1,arrCompare1=""){
                ws["A1"] = { v: ""}
                ws["B1"] = { v: ""}   
            

                ws["A2"] = { v: "Codigo", s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A3"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A4"] = { v:'Versión', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A5"] = { v:'nivel', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
            
                ws["B2"].s =  { font: { bold: true }};
                ws["B3"].s =  { font: { bold: true }};
                ws["B4"].s =  { font: { bold: true }};
                ws["B5"].s =  { font: { bold: true }};
                if(arrCompare1!=""){
                    // DATOS DE ARRAYCOMPARE
                    ws["G2"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["G3"] = { v:'Descripcion',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["G4"] = { v:'Versión', s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["G5"] = { v:'nivel',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                          
                    // DATOS DE ARRAYCOMPARE
                    ws["H2"] = { v: arrCompare1.codigo, s: { font: { bold: true } } };
                    ws["H3"] = { v: arrCompare1.descripcion, s: { font: { bold: true } } };
                    ws["H4"] = { v: arrCompare1.version,s: { font: { bold: true } } };
                    ws["H5"] = { v: arrCompare1.nivel,s: { font: { bold: true } } };

            }
                ws["A6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } }
                ws["B6"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["C6"] = { v:'Codigo', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                
                // DATOS DE CABECERA
                ws["A7"] = { v: currentItem.orden, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["B7"] = { v: currentItem.estructuraId.descripcion, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["C7"] = { v: currentItem.estructuraId.codigo, s: { font: { bold: true }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                

               ws["D6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               ws["E6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               ws["F6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
              
               ws["G6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               ws["H6"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               ws["I6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               ws["J6"] = { v: "status", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               
               return ws;
            },
            estructuraProceso:function(ws,arrCompare1=""){
                ws["A1"] = { v: ""}
                ws["B1"] = { v: ""}
                
                ws["A2"] = { v: "Codigo", s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A3"] = { v:'Descripcion', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A4"] = { v:'Versión', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                ws["A5"] = { v:'nivel', s:{ font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } }};
                
                ws["B2"].s =  { font: { bold: true }};
                ws["B3"].s =  { font: { bold: true }};
                ws["B4"].s =  { font: { bold: true }};
                ws["B5"].s =  { font: { bold: true }};
                if(arrCompare1!=""){
                    //for arrayCompare
                    
                    ws["O2"] = { v: "Codigo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["O3"] = { v:'Descripcion',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["O4"] = { v:'Versión', s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                    ws["O5"] = { v:'nivel',s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                          
                    // DATOS DE ARRAYCOMPARE
                    ws["P2"] = { v: arrCompare1.codigo, s: { font: { bold: true } } };
                    ws["P3"] = { v: arrCompare1.descripcion, s: { font: { bold: true } } };
                    ws["P4"] = { v: arrCompare1.version,s: { font: { bold: true } } };
                    ws["P5"] = { v: arrCompare1.nivel,s: { font: { bold: true } } };

                }   
            
                //COLUMNAS DEL TREE TABLE DEL DETALLE
                ws["A6"] = { v: "#", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["B6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["C6"] = { v: "Depende", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["D6"] = { v: "Cod.", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["E6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["F6"] = { v: "Tipo Dato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["G6"] = { v: "Cantidad Insumo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["H6"] = { v: "Proc. Menor", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["I6"] = { v: "Val. Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["J6"] = { v: "Val. Final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["K6"] = { v: "# Decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["L6"] = { v: "Flag CC", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["M6"] = { v: "Flag Mov", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
               
                ws["O6"] = { v: "Orden", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["P6"] = { v: "Depende", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["Q6"] = { v: "Cod.", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["R6"] = { v: "Descripción", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["S6"] = { v: "Tipo Dato", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["T6"] = { v: "Cantidad Insumo", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["U6"] = { v: "Proc. Menor", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["V6"] = { v: "Val. Inicial", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["W6"] = { v: "Val. Final", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["X6"] = { v: "# Decimales", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["Y6"] = { v: "Flag CC", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                ws["Z6"] = { v: "Flag Mov", s: { font: { bold: true, sz: 14, color: { rgb: "1F497D" } }, fill: { fgColor: { rgb: "BFBFBF" } }, border: { top: { style: "medium", color: { rgb: "000000" } }, bottom: { style: "medium", color: { rgb: "000000" } }, left: { style: "medium", color: { rgb: "000000" } }, right: { style: "medium", color: { rgb: "000000" } } } } };
                return ws;
            },
            replaceName:function(current,fullname){
                let name =  `${current.mdId.codigo} - ${current.orden} - ${fullname.replaceAll(" / ","_").replaceAll(" ","_")}`;
                return name.substring(0,30);
            },
            //Retorna el tipo de estructura que se asignará en la hoja de Excel 
            validateTypeStructure:function(description,arrdataStructure){
                let arrdata;
               switch (description) {
                case objTipoEstructuraIMaestro.Equipos:
                      arrdata =  arrdataStructure.aEquipo.results;
                    let utensilio = arrdataStructure.aUtensilio.results;
                    arrdata = [...arrdata, ...utensilio];

                    return arrdata.map((eq)=>{
                        let equipo = {};

                        equipo.orden = eq.orden || "";
                        let tipo = (eq.equipoId) ? "EQUIPO": (eq.utensilioId)? "UTENSILIO" : "";
                        equipo.codigo = tipo == "EQUIPO" ? eq.equipoId.equnr : tipo !==""? eq.utensilioId.codigo:"" ;
                        equipo.descripcion =  tipo == "EQUIPO" ? eq.equipoId.eqktx : tipo !==""? eq.utensilioId.descripcion : "";
                       
                        return equipo;
                    })

                    break;

                case objTipoEstructuraIMaestro.Condiciones:
                    arrdata =  arrdataStructure.aPaso.results;

                    return arrdata.map((p)=>{
                        let paso = {};
                        paso.orden=p.orden||"";
                        paso.depende=p.depende||"";
                        paso.codigo=(p.pasoId)?p.pasoId.codigo:""
                        paso.descripcion=(p.pasoId)?p.pasoId.descripcion:""
                        paso.tipo_dato=p.tipoDatoId?p.tipoDatoId.contenido:"";
                        paso.val_inicial=p.valorInicial||"";
                        paso.val_final=p.valorFinal||"";
                        paso.margen=p.margen||"";
                        paso.decimales=p.decimales||"";
                        paso.estado_cc=p.estadoCC;
                        paso.estado_mov=p.estadoMov;
                        return paso;
                    })

                    break;
            
                case objTipoEstructuraIMaestro.Formula:

                    arrdata = arrdataStructure.aInsumo.results
                    return arrdata.map((ins)=>{
                        let insumo ={};
                        insumo.codigo = ins.Component;
                        insumo.descripcion = ins.Maktx;
                        insumo.cantReceta = ins.CompQty;
                        insumo.cantRMD = ins.cantidadRm;
                        insumo.UM = ins.CompUnit;

                        return insumo;
                    })
                    break;

                case objTipoEstructuraIMaestro.Especificaciones:

                    arrdata = arrdataStructure.aEspecificacion.results;

                        return arrdata.map(espec=>{
                            let esp = {};
                            // let espec =especificacion[i] || {}; 
                            esp.orden =espec["orden"] || ""; 
                            esp.ensayoHijo =espec["ensayoHijo"] || ""; 
                            esp.tipoDatoId =espec["tipoDatoId"]?espec["tipoDatoId"].contenido : ""; 
                            esp.valorInicial =espec["valorInicial"] || ""; 
                            esp.valorFinal =espec["valorFinal"] || ""; 
                            esp.margen =espec["margen"] || ""; 
                            esp.decimales =espec["decimales"] || ""; 
                            esp.Merknr =espec["Merknr"] || ""; 
                            esp.especificacion =espec["especificacion"] || ""; 
                            
                            return esp;
                        })

                        
                    
                    break;

                case objTipoEstructuraIMaestro.Procesos:
                
                    arrdata =  arrdataStructure.aEtiqueta.results;
                    var oRowBinding = [];

                    let max = arrdata.length;
                    for (let i = 0; i < max; i++) {
                        let oEtiqueta = arrdata[i] || {};

                        // let aPasosEtiqueta = arrdataStructure.aPaso.results.filter(itm=>itm.pasoId.etiquetaId_etiquetaId === oEtiqueta.etiquetaId_etiquetaId);
                        oRowBinding.push({ "cabecera": arrdataStructure.estructuraId.descripcion + '-' + oEtiqueta.etiquetaId.descripcion });
    

                        let aPasosEtiqueta = arrdataStructure.aPaso.results.filter(itm=>itm.mdEsEtiquetaId_mdEsEtiquetaId === oEtiqueta.mdEsEtiquetaId);
                        let aPasosEtiquetaAlter = []

                        aPasosEtiqueta.sort(function (a, b) {
                            return a.orden - b.orden;
                        });

                        // aPasosEtiquetaAlter.sort(function (a, b) {
                        //     return a.orden - b.orden;
                        // });

                        let a = Number(aPasosEtiqueta.length) || 0;
                        let b = Number(aPasosEtiquetaAlter.length) || 0;
                        let max = a> b ? a: b;   
                        
                        for (let y = 0; y < max; y++) {
                            let oPasoEtiqueta = aPasosEtiqueta[y]  || {};
                            // let oPasoEtiqueta = aPasosEtiquetaAlter[y] || {};
                        
                            //RIGHT
                            let oItem={};
                            oItem = {
                                orden: arrdataStructure.orden + '.' + oEtiqueta.orden + '.' + (oPasoEtiqueta.orden || ""),
                                depende: oPasoEtiqueta.depende ||"",
                                codigo: (oPasoEtiqueta.pasoId ? oPasoEtiqueta.pasoId.codigo : ""),
                                descripcion: (oPasoEtiqueta.pasoId ? oPasoEtiqueta.pasoId.descripcion : ""),
                                tipoDatoId: (oPasoEtiqueta.tipoDatoId ? oPasoEtiqueta.tipoDatoId.contenido : ""),
                                procesoMenor: '',
                                valorInicial: oPasoEtiqueta.valorInicial ||"",
                                valorFinal: oPasoEtiqueta.valorFinal ||"",
                                decimales: oPasoEtiqueta.decimales ||"",
                                estadoCC: oPasoEtiqueta.estadoCC ? 'SI' : 'NO',
                                estadoMov: oPasoEtiqueta.estadoMov ? 'SI' : 'NO'
                            };


                            let aExistePasoMenor = arrdataStructure.aPasoInsumoPaso.results.filter(itm=>itm.pasoId_mdEstructuraPasoId === oPasoEtiqueta.mdEstructuraPasoId);
                            let aExistePasoMenor1 = [];
                            if (aExistePasoMenor.length > 0) {
                                oItem.procesoMenor = 'SI';
                            } else {
                                oItem.procesoMenor = 'NO'; 
                            }
                            // if (aExistePasoMenor1.length > 0) {
                            //     oItem.procesoMenor1 = 'SI';
                            // } else {
                            //     oItem.procesoMenor1 = 'NO'; 
                            // }
                            //merge entre los obj
                            oRowBinding.push(oItem);

                            aExistePasoMenor.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            aExistePasoMenor1.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                            let a = Number(aExistePasoMenor.length) || 0;
                            let b = Number(aExistePasoMenor1.length) || 0;
                            let max = a> b ? a: b;    

                            for (let x = 0; x < max; x++) {
                                const oPasoInsumoPaso = aExistePasoMenor[x] || {};
                                // const oPasoInsumoPaso = aExistePasoMenor1[x] || {};
                                
                                let codigo,codigo1, descripcion,descripcion1;
                                if (!oPasoInsumoPaso.pasoHijoId_pasoId) {
                                    codigo = "";
                                    descripcion = ""
                                } else {
                                    codigo = ""
                                    descripcion = ""
                                }
                                // debugger;
                                if (!oPasoInsumoPaso.pasoHijoId_pasoId) {
                                    codigo1 = oPasoInsumoPaso.Component;
                                    descripcion1 = 'Proceso Menor: ' + oPasoInsumoPaso.Maktx;
                                } else {
                                    codigo1 = oPasoInsumoPaso.pasoHijoId ? oPasoInsumoPaso.pasoHijoId.codigo : "";
                                    let desc =(oPasoInsumoPaso.pasoHijoId ? 'Proceso Menor: ' + oPasoInsumoPaso.pasoHijoId.descripcion : "");   
                                    descripcion1 =    desc
                                }

                                let oItemPM = {
                                    orden: arrdataStructure.orden + '.' + oEtiqueta.orden + '.' + oPasoEtiqueta.orden + '.' + (oPasoInsumoPaso.orden|| ""),
                                    depende: '',
                                    codigo: codigo1,
                                    descripcion: descripcion1,
                                    tipoDatoId: (oPasoInsumoPaso.tipoDatoId ? oPasoInsumoPaso.tipoDatoId.contenido:""),
                                    procesoMenor: '',
                                    valorInicial: oPasoInsumoPaso.valorInicial,
                                    valorFinal: oPasoInsumoPaso.valorFinal,
                                    decimales: oPasoInsumoPaso.decimales,
                                    estadoCC: oPasoInsumoPaso.estadoCC ? 'SI' : 'NO',
                                    estadoMov: oPasoInsumoPaso.estadoMov ? 'SI' : 'NO'
                                };
                                // oItemPM=oItemPM;

                                oRowBinding.push(oItemPM);
                            }
                        }
                    }

                    return oRowBinding;

                break;

                case objTipoEstructuraIMaestro.Cuadro:
                    arrdata =  arrdataStructure.aPaso.results;

                    return arrdata.map((p)=>{
                        let paso = {};
                        paso.orden=p.orden||"";
                        paso.depende=p.depende||"";
                        paso.codigo=(p.pasoId)?p.pasoId.codigo:""
                        paso.descripcion=(p.pasoId)?p.pasoId.descripcion:""
                        paso.tipo_dato=p.tipoDatoId?p.tipoDatoId.contenido:"";
                        paso.val_inicial=p.valorInicial||"";
                        paso.val_final=p.valorFinal||"";
                        paso.margen=p.margen||"";
                        paso.decimales=p.decimales||"";
                        paso.estado_cc=p.estadoCC;
                        paso.estado_mov=p.estadoMov;
                        return paso;
                    })

                    break;

                default:
                        return []
                    break;            
                }
            },
            formatterWidthCells:function(description){
                let arrdata;
               switch (description) {
                case objTipoEstructuraIMaestro.Equipos:
                  
                        // LONGITUD DE COLUMNAS
                        return [
                            { width: 10 },
                            { width: 30 },
                            { width: 10 },
                            { width: 10 },
                            { width: 10 },
                            { width: 50 },
                            { width: 10 },
                            { width: 10 },
                            { width: 50 },
                            { width: 10 }
                        ];
                    break;

                case objTipoEstructuraIMaestro.Condiciones:
                    return [
                        { width: 12 },
                        { width: 14 },
                        { width: 10 },
                        { width: 8 },
                        { width: 8 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 12 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 }
                    ];
                    break;
            
                case objTipoEstructuraIMaestro.Formula:

                   
                 // LONGITUD DE COLUMNAS
                 return [
                    { width: 10 },
                    { width: 20 },
                    { width: 10 },
                    { width: 15 },
                    { width: 30 },
                    { width: 10 },
                    { width: 10 },
                    { width: 10 },
                    { width: 15 },
                    { width: 30 },
                    { width: 10 },
                    { width: 10 },
                    { width: 10 }
                ];
                    break;

                case objTipoEstructuraIMaestro.Especificaciones:

                   
                    // LONGITUD DE COLUMNAS
                    return [
                        { width: 10 },
                        { width: 20 },
                        { width: 10 },
                        { width: 20 },
                        { width: 20 },
                        { width: 20 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 50 },
                        { width: 10 },
                        { width: 20 },
                        { width: 20 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 50 }
                    ];
                    break;

                case objTipoEstructuraIMaestro.Procesos:
                
                    
                    return [
                        { width: 30 },
                        { width: 12 },
                        { width: 12 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 20 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 30 },
                        { width: 12 },
                        { width: 12 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 20 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                    ];

                break;

                case objTipoEstructuraIMaestro.Cuadro:
                    return [
                        { width: 12 },
                        { width: 14 },
                        { width: 10 },
                        { width: 8 },
                        { width: 8 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 12 },
                        { width: 8 },
                        { width: 100 },
                        { width: 15 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 },
                        { width: 10 }
                    ];
                    break;

                default:
                    break;            
                }
            },
            //formato que se visualizará en la hoja Excel
            validateSheetStructure:function(type,ws,item,arrCompare1=""){
                switch (type) {

                    case objTipoEstructuraIMaestro.Equipos:
                    
                        return  oThatConf.estructuraEquipo(ws,item,1,arrCompare1)
                        break;
    
                    case objTipoEstructuraIMaestro.Condiciones:

                      return  oThatConf.estructuraCuadro(ws,item,1,arrCompare1)
                        break;
                    case objTipoEstructuraIMaestro.Cuadro:

                      return  oThatConf.estructuraCuadro(ws,item,1,arrCompare1)
                        break;
    
                
                    case objTipoEstructuraIMaestro.Formula:


                        return oThatConf.estructuraFormula(ws,item,1,arrCompare1)
                        break;
    
                    case objTipoEstructuraIMaestro.Especificaciones:
    
                        return oThatConf.estructuraEspecificacion(ws,item,1,arrCompare1)
                        
                        break;
    
                    case objTipoEstructuraIMaestro.Procesos:
    
                        return oThatConf.estructuraProceso(ws,arrCompare1)
                    break;
    
                    default:
                    
                    
                        break;            
                    
                    }
            },

            updateOrderEquipment: async function () {
                BusyIndicator.show(0);
                let oModelGeneric = oThat.getView().getModel("aListEquipoAssignResponsive");
                let index = 0;
                oModelGeneric.getData().sort(function (a, b) {
                    return a.orden - b.orden;
                });
                for await(const obj of oModelGeneric.getData()){
                    index++;
                    let object= {
                        orden:index
                    }
                    if(obj.mdEstructuraEquipoId){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_EQUIPO", object, obj.mdEstructuraEquipoId);
                    } else if(obj.mdEstructuraUtensilioId){
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_UTENSILIO", object, obj.mdEstructuraUtensilioId);
                    }
                }
                await oThat.onGetDataEstructuraMD();
                await oThat.onCreateModelTree();
                await oThatConf.onOpenEquipo();
                BusyIndicator.hide();
            },
            onRestoreFiltersCompare:function(){
                

                let currentCode = oThat.getView().getModel("asociarDatos").getProperty("/codigo");
                let lstMD = oThat.getView().getModel("localModel").getProperty("/listMDCompare");
                let compareRM = lstMD.filter(item=> item.codigo != currentCode && item.estadoIdRmd_iMaestraId !== idEstadoRmdCancelado);
                oThat.getView().setModel(new JSONModel(compareRM),"compareRM");
                oThat.getView().getModel("oDataMdEstructura").setProperty("/description","");
                oThat.getView().getModel("oDataMdEstructura").setProperty("/code","");
                oThat.getView().getModel("oDataMdEstructura").refresh();

            },
            
            //Seteo de constantes
            onSetConstans:async function (aConstants) {
                try {
                    for await (const oConstante of aConstants.results) { 
                        if (oConstante.codigoSap === "IDTIPOEQUIPO") {
                            sIdTipoEquipo = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOUTENSILIO") {
                            sIdTipoUtensilio = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTCONDAMBIENTAL") {
                            sIdTipoEstructuraCondAmbiente = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTCUADRO") {
                            sIdTipoEstructuraCuadro = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTPROCESO") {
                            sIdTipoEstructuraProceso = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTFORMULA") {
                            sIdTipoEstructuraFormula = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTVERIFFIRMAS") {
                            sIdTipoEstructuraFirmas = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTPRCPROCESO") {
                            sIdEstadoProcesoPendiente = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATO") {
                            sIdTipoDato = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDINICIADO") {
                            estadoIngresadoRMD = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOVERIFCHECK") {
                            sIdTipoDatoVerificacionCheck = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATORANGO") {
                            sIdTipoDatoRango = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOREALIZADOPOR") {
                            sIdTipoDatoRealizadoPor = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOVISTOBUENO") {
                            sIdTipoDatoVistoBueno = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOFORMULA") {
                            sIdTipoDatoFormula = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOFECHAHORA") {
                            sIdTipoDatoFechayHora = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "TXTTIPOEQUIPO") {
                            sTxtTipoEquipo = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDTIPODATONUMERO") {
                            sTipoDatoNumero = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOCANTIDAD") {
                            sTipoDatoCantidad = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOMUESTRACC") {
                            sTipoDatoMuestraCC = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOTEXTO") {
                            sTipoDatoTexto = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
                            sEstadoAutorizado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "MAXCANTARCHIVOS") {
                            iMaxLengthArchivos = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDSUSPENDIDO") {
                            sEstadoSuspendido = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDCERRADO") {
                            sEstadoCerrado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATONOTIFICACION") {
                            sIdTipoDatoNotificacion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "CLVTIPOEQUIPOSAP") {
                            sTypeEquipment = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDTIPOENSAYOPADRE") {
                            sTypeEnsayoPadre = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATOENTREGA") {
                            sTipoDatoEntrega = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDCANCELADO") {
                            idEstadoRmdCancelado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDAIPRIO00") {
                            sAiPrio00 = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDAIPRIO01") {
                            sAiPrio01 = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDTIPOESTESPECIFICACIONES") {
                            sIdTipoEstructuraEspecificaciones = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTEQUIPO") {
                            sIdTipoEstructuraEquipo = parseInt(oConstante.contenido);
                        }
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetImagenSharepointCopiaNueva: async function (oPaso, oPasoObj) {
                // BusyIndicator.show(0);
                let urlGet = oPaso.mdId_mdId + "/" + oPaso.mdEstructuraId_mdEstructuraId + "/" + oPaso.mdEstructuraPasoId;
                if (oPaso.mdEsEtiquetaId_mdEsEtiquetaId) {
                    urlGet = oPaso.mdId_mdId + "/" + oPaso.mdEstructuraId_mdEstructuraId + "/" + oPaso.mdEsEtiquetaId_mdEsEtiquetaId + "/" + oPaso.mdEstructuraPasoId;
                }
                let oData = {
                    origen  : "ImagenMD",
                    url     :  urlGet
                }
                let oImagenCargada = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                let oDownloadImage = {
                    origen  : "ImagenMD",
                    codigoRM : urlGet,
                    Name : oImagenCargada[0].Name
                }
                let oImagenResult= await sharepointService.sharePointDownloadGeneral(oThat.mainModelv2, oDownloadImage);
                let len = oImagenResult.length;
                let bytes = new Uint8Array(len);
                for (let i = 0; i <len; i++) {
                    bytes[i]= oImagenResult.charCodeAt(i);
                }
                let arrBuffer =bytes.buffer;
                let base64 = new Uint8Array(arrBuffer);
                this.onConfirmSelectImagenCopiaNueva(base64, oPasoObj, oImagenCargada);
                // BusyIndicator.hide();
            },

            onConfirmSelectImagenCopiaNueva: async function(base64, oPasoObj, oImagenCargada) {
                // BusyIndicator.show(0);
                let sImagenRuta = oPasoObj.mdId_mdId + "/" + oPasoObj.mdEstructuraId_mdEstructuraId + "/" + oPasoObj.mdEstructuraPasoId;
                if (oPasoObj.mdEsEtiquetaId_mdEsEtiquetaId) {
                    sImagenRuta = oPasoObj.mdId_mdId + "/" + oPasoObj.mdEstructuraId_mdEstructuraId + "/" + oPasoObj.mdEsEtiquetaId_mdEsEtiquetaId + "/" + oPasoObj.mdEstructuraPasoId;
                }

                let obj = {
                    name: oImagenCargada[0].Name,
                    fileData: base64,
                    origen: "ImagenMD",
                    mdId: oPasoObj.mdId_mdId,
                    estructuraId: oPasoObj.mdEstructuraId_mdEstructuraId,
                    etiquetaId: oPasoObj.mdEsEtiquetaId_mdEsEtiquetaId,
                    pasoId: oPasoObj.mdEstructuraPasoId
                }

                let oParam = {
                    usuarioActualiza    : oInfoUsuario.data.usuario,
                    fechaActualiza      : new Date(),
                    archivoMD           : JSON.stringify(obj)
                }
                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, oPasoObj.mdId_mdId);
                // BusyIndicator.hide();
                // MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage73"));
            },

            onUpdateUtensiliosRMD: async function (oEvent) {
                let oUtensilioSelected = oEvent.getSource().getBindingContext("aListEquipoAssignResponsive").getObject();
                oThat.localModel.setProperty("/utensilioDefect", oUtensilioSelected);
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                let oResponseUtensilio = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "UTENSILIO", aFilter);
                oThat.localModel.setProperty("/aListUtensilios", oResponseUtensilio.results);
                if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment(rootPath + ".view.fragment.editarRM.ListUtensiliosCorregir", this);
					oThat.getView().addDependent(this.oDialog);
				}
				this.oDialog.open();
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

            onConfirmUtensilioSelected: async function (oEvent) {
                BusyIndicator.show(0);
                let utensilioDefectuoso = oThat.localModel.getProperty("/utensilioDefect");
                let aListSelected = oEvent.mParameters.selectedItem;
                aListSelected = aListSelected.getBindingContext("localModel").getObject();
                let oObj = {
                    utensilioId_utensilioId: aListSelected.utensilioId
                }
                await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_UTENSILIO", oObj, utensilioDefectuoso.mdEstructuraUtensilioId);

                let aFilterP = [];
                aFilterP.push(new Filter("utensilioId_utensilioId", "EQ", utensilioDefectuoso.utensilioId_utensilioId));
                let mdUtensilioDefectuoso = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "MD_ES_UTENSILIO", aFilterP);
                for await (const oUtenMD of mdUtensilioDefectuoso.results) {
                    let oObj = {
                        utensilioId_utensilioId: aListSelected.utensilioId
                    }
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "MD_ES_UTENSILIO", oObj, oUtenMD.mdEstructuraUtensilioId)
                }
                let aFilter = [];
                aFilter.push(new Filter("utensilioId_utensilioId", "EQ", utensilioDefectuoso.utensilioId_utensilioId));
                let rmdUtensilioAfectado = await Service.onGetDataGeneralFilters(oThatConf.mainModelv2, "RMD_ES_UTENSILIO", aFilter);
                for await (const oUtenRMD of rmdUtensilioAfectado.results) {
                    let oObj = {
                        utensilioId_utensilioId: aListSelected.utensilioId
                    }
                    await Service.onUpdateDataGeneral(oThatConf.mainModelv2, "RMD_ES_UTENSILIO", oObj, oUtenRMD.rmdEstructuraUtensilioId)
                }
                await oThat.onGetDataEstructuraMD();
                await oThat.onCreateModelTree();
                oThatConf.onOpenEquipo();
                BusyIndicator.hide();
            }
        };
    },
);