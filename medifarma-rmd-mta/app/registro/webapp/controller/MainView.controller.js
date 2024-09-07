sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "mif/rmd/registro/services/registro",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "mif/rmd/registro/utils/util",
    '../controller/table',
    "sap/ui/model/json/JSONModel",
    'mif/rmd/registro/services/external/sharepoint',
    "mif/rmd/registro/utils/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, registroService, BusyIndicator, Filter, FilterOperator, util, tablePdf, JSONModel,sharepointService, formatter) {
        "use strict";
        JsBarcode:true;
        let sRootPath,
            sSistemaRMD,
            sSistemaRMDCod,
            idEstadoHabilitado,
            stipoDatoNotificacion,
            sIdTipoEstructuraProceso,
            sIdInicioCondicion,
            sIdFinCondicion,
            sTipoEstructuraEspecificaciones,
            sEstadoAutorizado,
            idRolAuxiliar,
            constanteArea,
            oInfoUsuario,
            oAplicacionRegistro,
            oRolAuxiliar,
            sUsuarioRegulNotif,
            oThat;
        const sAppRegistro = 'REGIS';
        return Controller.extend("mif.rmd.registro.controller.MainView", {
            onInit: async function () {
                oThat = this;
                Array.prototype.groupBy = function (prop) {
                    return this.reduce(function (groups, item) {
                        const val = item[prop]
                        groups[val] = groups[val] || []
                        groups[val].push(item)
                        return groups
                    }, {})
                }
            },

            onInitialModel: function () {
                this.modelGeneral = this.getView().getModel("modelGeneral");
                this.mainModelv2 = this.getView().getModel("mainModelv2");
                this.modelEstructura = this.getView().getModel("modelEstructura");
                this.modelNecesidad = this.getView().getModel("NECESIDADESRMD_SRV");
                this.modelCentralPesadas = this.getView().getModel("CENTRALPESADAS_SRV");
                this.modelImpresionOrd = this.getView().getModel("IMPRESIONORD_SRV");
                this.i18n = this.getView().getModel("i18n").getResourceBundle();

                let oModelEst = new JSONModel([]);
                oModelEst.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEst, "listRmdEstructura");
                
                let oModelPaso = new JSONModel([]);
                oModelPaso.setSizeLimit(999999999);
                oThat.getView().setModel(oModelPaso, "listRmdEsPaso");

                let oModelEquipo = new JSONModel([]);
                oModelEquipo.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEquipo, "listRmdEsEquipo");

                let oModelUtensilio = new JSONModel([]);
                oModelUtensilio.setSizeLimit(999999999);
                oThat.getView().setModel(oModelUtensilio, "listRmdEsUtensilio");

                let oModelEtiqueta = new JSONModel([]);
                oModelEtiqueta.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEtiqueta, "listRmdEsEtiqueta");

                let oModelInsumo = new JSONModel([]);
                oModelInsumo.setSizeLimit(999999999);
                oThat.getView().setModel(oModelInsumo, "listRmdEsReInsumo");

                let oModelEspecificacion = new JSONModel([]);
                oModelEspecificacion.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEspecificacion, "listRmdEsEspecificacion");    

                let oModelEsPasoInsumoPaso = new JSONModel([]);
                oModelEsPasoInsumoPaso.setSizeLimit(999999999);
                oThat.getView().setModel(oModelEsPasoInsumoPaso, "listEsPasoInsumoPasoGeneral");
            },

            onAfterRendering: async function () {
                await oThat.onInitialModel();
                await oThat.onGetConstantsSet();
                await oThat.onGetUserValidation();
            },

            onGetConstantsSet: async function () {
                try {
                    let aAppConfig = await oThat.onGetAppConfiguration();
                    if (aAppConfig.results.length > 0) {
                        oAplicacionRegistro = aAppConfig.results[0].aplicacionId;
                        this.aConstantes = await oThat.onGetConstants();
                        if (this.aConstantes.results.length > 0) {
                            await oThat.onSetConstans(this.aConstantes);
                            await oThat.onGetIdRoles();
                            await oThat.onGetIdSistema();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoConstants"));
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        }
                    } else {
                        MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessageNoAppFind"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                } catch (oError) {
                    BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetUserValidation: async function () {
                try {
                    if (sap.ushell) {
                        var user = new sap.ushell.Container.getService("UserInfo").getUser();
                        var emailUser = user.getEmail();
                    } else {
                        // var emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
                        var emailUser = "cmacalupu@medifarma.com.pe";
                        // var emailUser = "marineduardo.floressilvestre.sa@everis.nttdata.com";
                        // var emailUser = "john.godoy@medifarma.com.pe";
                        // var emailUser = "jcornejo@medifarma.com.pe";
                        // var emailUser = "roci0906@hotmail.com";
                        // var emailUser = "pricaldi@medifarma.com.pe";
                        // var emailUser = "pedro.lujan@medifarma.com.pe";
                        // var emailUser = "gponceb@medifarma.com.pe";
                        // var emailUser = "mferreyra@medifarma.com.pe";
                        // var emailUser = "jrojasm@medifarma.com.pe";
                        // var emailUser = "kzorrilla@medifarma.com.pe";
                        // var emailUser = "procesos.prd@medifarma.com.pe";
                        // var emailUser = "jperezj@medifarma.com.pe";
                        // var emailUser = "procesos.prd@medifarma.com.pe";
                        // var emailUser = "vpingol@medifarma.com.pe";
                    }
                    var UserFilter = [];
                    UserFilter.push(new Filter("correo", 'EQ', emailUser));
                    let oUsuarioFilter = await registroService.getDataFilter(this.mainModelv2, "/USUARIO", UserFilter);

                    let UserSystemFilter = [];
                    UserSystemFilter.push(new Filter("oSistema_sistemaId", 'EQ', sSistemaRMD));
                    this.aUsuarioSystem = await registroService.onGetDataGeneralFilters(this.mainModelv2, "USUARIO_SISTEMA", UserSystemFilter);
                    this.modelGeneral.setProperty("/oInfoUsuarioSistema", this.aUsuarioSystem.results);

                    let oUsuario = {results: []};

                    for await (const oUsuarioSystem of this.aUsuarioSystem.results) {
                        let oUsuarioFind = oUsuarioFilter.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId && oUsuarioSystem.oSistema_sistemaId === sSistemaRMD);
                        if (oUsuarioFind) {
                            oUsuario.results.push(oUsuarioFind);
                        }
                    }

                    if (oUsuario.results.length > 0) {
                        var oFilter = [];
                        oFilter.push(new Filter("oUsuario_usuarioId", 'EQ', oUsuario.results[0].usuarioId));
                        let sExpand = "oRol";
                        let oUser = await registroService.getDataExpand(this.mainModelv2, "/UsuarioRol", sExpand, oFilter);

                        let oUserFilterSystem = oUser.results.filter(item=>item.oRol.oSistema_sistemaId === sSistemaRMD);
                            
                        if (oUserFilterSystem.length > 0) {
                            oInfoUsuario = {
                                data: oUsuario.results[0],
                                rol: [],
                                funcionUsuario: {
                                    habilitarRMD: false,
                                    registroCC: false,
                                    registroCP: false,
                                    registroP: false,
                                    registroVB: false,
                                    cierreRMD: false,
                                    agregarEquipo: false,
                                    reaperturaRMD: false,
                                    registroLector: false,
                                    asignarUsuarioRMD: false,
                                    verificarInsumoFab: false,
                                    verificarInsumoAcEnv: false,
                                    aplicaNoAplica: false,
                                    crearFraccion: false,
                                    crarParcial: false,
                                    crearLapso: false,
                                    crearReproceso: false,
                                    generarEtiquetaHU: false,
                                    imprimirEtiqueta: false,
                                    generarNotificacionesRMD: false,
                                    observacionPaso: false,
                                    observacionHistorialPaso: false,
                                    registroMuestreo: false,
                                    registroEspecificaciones: false
                                }
                            }

                            var aFilterAcc = [];
                            oUserFilterSystem.forEach(function (e) {
                                var oColorStatus = {
                                    "color": "",
                                    "colorHex": "",
                                    "colorRgb": ""
                                };

                                e.codigo = e.oRol.codigo;

                                if (e.codigo == "RMD_REGISTRADOR") {
                                    oColorStatus.color = "Negro";
                                    oColorStatus.colorHex = "000000";
                                    oColorStatus.colorRgb = "0, 0, 0";
                                } else if (e.codigo == "RMD_JEFE_DE_PRODUCCION") {
                                    oColorStatus.color = "Azul";
                                    oColorStatus.colorHex = "#0000ff";
                                    oColorStatus.colorRgb = "0, 0, 255";
                                } else if (e.codigo == "RMD_GERENTE_DE_PRODUCCION") {
                                    oColorStatus.color = "Negro";
                                    oColorStatus.colorHex = "000000";
                                    oColorStatus.colorRgb = "0, 0, 0";
                                } else if (e.codigo == "RMD_JEFATURA_DOCUMENTACION") {
                                    oColorStatus.color = "Negro";
                                    oColorStatus.colorHex = "000000";
                                    oColorStatus.colorRgb = "0, 0, 0";
                                } else if (e.codigo == "RMD_AUXILIAR") {
                                    oColorStatus.color = "Turquesa";
                                    oColorStatus.colorHex = "#5dc1b9";
                                    oColorStatus.colorRgb = "93, 193, 185";
                                } else if (e.codigo == "RMD_SUPERVISOR") {
                                    oColorStatus.color = "Morado";
                                    oColorStatus.colorHex = "#8c004b";
                                    oColorStatus.colorRgb = "140, 0, 75";
                                } else if (e.codigo == "RMD_CONTROL_CALIDAD") {
                                    oColorStatus.color = "Rojo";
                                    oColorStatus.colorHex = "#FF0000";
                                    oColorStatus.colorRgb = "255, 0, 0";
                                } else if (e.codigo == "RMD_CONTROL_PROCESOS") {
                                    oColorStatus.color = "Negro";
                                    oColorStatus.colorHex = "#000000";
                                    oColorStatus.colorRgb = "0, 0, 0";
                                } else {
                                    oColorStatus.color = "Negro";
                                    oColorStatus.colorHex = "000000";
                                    oColorStatus.colorRgb = "0, 0, 0";
                                }

                                e.oRol.oColorStatus = oColorStatus;
                                oInfoUsuario.rol.push(e.oRol);
                                aFilterAcc.push(new Filter("oRol_rolId", 'EQ', e.oRol.rolId));
                            });
                            var mExpand = "oMaestraAccion";
                            aFilterAcc.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacionRegistro));
                            var infoAccionUsuario = await registroService.getDataExpand(this.mainModelv2, "/RolAppAcciones", mExpand, aFilterAcc);

                            oInfoUsuario.funcionUsuario.regularizarNotif = sUsuarioRegulNotif === oInfoUsuario.data.usuario ? true : false;
                            infoAccionUsuario.results.forEach(function (e) {
                                if (e.oMaestraAccion.codigo === "ACCSTATE") {
                                    oInfoUsuario.funcionUsuario.habilitarRMD = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREGISTERCC") {
                                    oInfoUsuario.funcionUsuario.registroCC = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREGISTERCP") {
                                    oInfoUsuario.funcionUsuario.registroCP = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREGISTER") {
                                    oInfoUsuario.funcionUsuario.registroP = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREGISTERVB") {
                                    oInfoUsuario.funcionUsuario.registroVB = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCCIERRERMD") {
                                    oInfoUsuario.funcionUsuario.cierreRMD = true;
                                }
                                if(e.oMaestraAccion.codigo === "ACCADDEQ") {
                                    oInfoUsuario.funcionUsuario.agregarEquipo = true;
                                }
                                if(e.oMaestraAccion.codigo === "ACCOPENING") {
                                    oInfoUsuario.funcionUsuario.reaperturaRMD = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCLECTOR") {
                                    oInfoUsuario.funcionUsuario.registroLector = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCASIGNUSER") {
                                    oInfoUsuario.funcionUsuario.asignarUsuarioRMD = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCVERIFYINSF") {
                                    oInfoUsuario.funcionUsuario.verificarInsumoFab = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCVERIFYINSAE") {
                                    oInfoUsuario.funcionUsuario.verificarInsumoAcEnv = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCAPPLY") {
                                    oInfoUsuario.funcionUsuario.aplicaNoAplica = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCFRACTION") {
                                    oInfoUsuario.funcionUsuario.crearFraccion = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCPARCIAL") {
                                    oInfoUsuario.funcionUsuario.crarParcial = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCLAPSOS") {
                                    oInfoUsuario.funcionUsuario.crearLapso = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREPROCESS") {
                                    oInfoUsuario.funcionUsuario.crearReproceso = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCTICKET") {
                                    oInfoUsuario.funcionUsuario.generarEtiquetaHU = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCPRINT") {
                                    oInfoUsuario.funcionUsuario.imprimirEtiqueta = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCNOTIFICATION") {
                                    oInfoUsuario.funcionUsuario.generarNotificacionesRMD = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCOBSPASO") {
                                    oInfoUsuario.funcionUsuario.observacionPaso = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCHISTORIAL") {
                                    oInfoUsuario.funcionUsuario.observacionHistorialPaso = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCMUESTREO") {
                                    oInfoUsuario.funcionUsuario.registroMuestreo = true;
                                }
                                if (e.oMaestraAccion.codigo === "ACCREGISTERESP") {
                                    oInfoUsuario.funcionUsuario.registroEspecificaciones = true;
                                }
                            });

                            this.modelGeneral.setProperty("/oInfoUsuario", oInfoUsuario);
                        } else {
                            MessageBox.error("El usuario no tiene un rol asignado.", {
                                styleClass: "sapUiSizeCompact",
                                actions: [MessageBox.Action.OK],
                                onClose: async function (oAction) {
                                    if (oAction === "OK") {
                                        window.history.back();
                                    }
                                }
                            });
                        }
                    } else {
                        MessageBox.error("No ha sido registrado el usuario en la app de Gestión de Usuarios.", {
                            styleClass: "sapUiSizeCompact",
                            actions: [MessageBox.Action.OK],
                            onClose: async function (oAction) {
                                if (oAction === "OK") {
                                    window.history.back();
                                }
                            }
                        });
                    }
                } catch (oError) {
                    BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onSearchLote: function () {
                oThat.onOrdenesABAP();
            },

            onOrdenesABAP: async function () {
                var v_lote = oThat.modelGeneral.getProperty("/loteFilter");

                if (v_lote === "") {
                    MessageBox.warning(oThat.i18n.getText("loteObligatorio"));
                    return;
                }
                v_lote = v_lote.toUpperCase();

                var oFilter = [];
                BusyIndicator.show();
                oFilter.push(new Filter("Charg", FilterOperator.EQ, v_lote));
                oFilter.push(new Filter("Aufnr", FilterOperator.EQ, ""));
                await registroService.onGetDataGeneralFilters(oThat.modelNecesidad, "OrdenSet", oFilter).then(function (oListOrden) {
                    oListOrden.results.forEach(element => {
                        if (element.Vfdat !== null) {
                            element.VfdatBTP = element.Vfdat;
                        }
                    });
                    oThat.modelGeneral.setProperty("/ordenesAbap", oListOrden.results);
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    console.log(oError);
                    sap.ui.core.BusyIndicator.hide();
                })
            },

            onMdList: async function (LineaActual) {
                let sExpand = "estadoIdRmd,mdId/estadoIdRmd";
                let sExpandNivel = "estadoIdRmd,nivelId,sucursalId,aReceta/recetaId";
                var aFilterMd = [],
                    oFilterRmd = [];
                aFilterMd.push(new Filter("estadoIdRmd_iMaestraId", FilterOperator.EQ, sEstadoAutorizado));
                oFilterRmd.push(new Filter("productoId", FilterOperator.EQ, LineaActual.Matnr));
                oFilterRmd.push(new Filter("ordenSAP", FilterOperator.EQ, LineaActual.Aufnr));
                // let aListMD;
                // let aFilterReceta = [];
                // aFilterReceta.push(new Filter("Matnr", "EQ", LineaActual.Matnr));
                // aFilterReceta.push(new Filter("Verid", "EQ", LineaActual.Verid));                
                // let aListReceta = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RECETA", aFilterReceta);

                // if (aListReceta.results.length > 0) {
                //     let aFilterMDReceta = [];
                //     aFilterMDReceta.push(new Filter("recetaId_recetaId", "EQ", aListReceta.results[0].recetaId));
                //     let aListMDReceta = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_RECETA", aFilterMDReceta);
                //     if (aListMDReceta.results.length > 0) {
                //         aFilterMd.push(new Filter("estadoIdRmd_iMaestraId", FilterOperator.EQ, sEstadoAutorizado));
                //         let aListMds = [];
                //         aListMDReceta.results.forEach(function(oRece){
                //             aListMds.push(new Filter("mdId", "EQ", oRece.mdId_mdId))
                //         });
                //         aFilterMd.push(new Filter({
                //             filters: aListMds,
                //             and: false,
                //         }))
                //         aListMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", aFilterMd, sExpandNivel);
                //     }
                // } else {
                //     aListMD = {results: []}; 
                // }
                let aListMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", aFilterMd, sExpandNivel);
                let aListRMD = await registroService.getDataExpand(oThat.mainModelv2, "/RMD", sExpand, oFilterRmd);
                oThat.modelGeneral.setProperty("/LineaActualRMDdata", aListRMD);
                let aListMDFinal = [];
                let aListMDTable = [];
                if(aListRMD.results.length > 0){
                    let aFilter= [];
                    aFilter.push(new Filter("mdId", "EQ", aListRMD.results[0].mdId_mdId));
                    let aMdResponse = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", aFilter, sExpandNivel);
                    for await (const oMd of aMdResponse.results) {
                        oMd.Matnr = LineaActual.Matnr;
                        oMd.rm = oMd.estadoIdRmd.codigo !== "A" ? "A" : oMd.estadoIdRmd.codigo;
                        oMd.rmdId = "";
                        oMd.estadoIdRmd = "";
                        oMd.stateRMD = "";
                        let aListRMDTable = aListRMD.results;
                        for await (const oRMD of aListRMDTable) {
                            oMd.rmdId = oRMD.rmdId;
                            oMd.estadoIdRmd = oRMD.estadoIdRmd_iMaestraId;
                            if (oRMD.estadoIdRmd_iMaestraId != null) {
                                oMd.stateRMD = oRMD.estadoIdRmd.contenido;
                            }
                            aListMDTable.push(JSON.parse(JSON.stringify(oMd)));
                        }
                    }
                } else {
                    for await (const oMd of aListMD.results) {
                        for await (const oReceta of oMd.aReceta.results) {
                            if (oReceta.recetaId.Matnr === LineaActual.Matnr && oReceta.recetaId.Verid === LineaActual.Verid) {
                                aListMDFinal.push(JSON.parse(JSON.stringify(oMd)));
                            }
                        }
                    }
                    for await (const oMd of aListMDFinal) {
                        oMd.Matnr = LineaActual.Matnr;
                        oMd.rm = oMd.estadoIdRmd.codigo !== "A" ? "A" : oMd.estadoIdRmd.codigo;
                        oMd.rmdId = "";
                        oMd.estadoIdRmd = "";
                        oMd.stateRMD = "";
                        let aListRMDTable = aListRMD.results.filter(itm=>itm.mdId_mdId === oMd.mdId);
                        if(aListRMDTable.length === 0) {
                            aListMDTable.push(JSON.parse(JSON.stringify(oMd)));
                        } else {
                            for await (const oRMD of aListRMDTable) {
                                oMd.rmdId = oRMD.rmdId;
                                oMd.estadoIdRmd = oRMD.estadoIdRmd_iMaestraId;
                                if (oRMD.estadoIdRmd_iMaestraId != null) {
                                    oMd.stateRMD = oRMD.estadoIdRmd.contenido;
                                }
                                aListMDTable.push(JSON.parse(JSON.stringify(oMd)));
                            }
                        }
                    }
                }
                oThat.modelGeneral.setProperty("/Mds", aListMDTable);
                oThat.modelGeneral.setProperty("/LineaActualRMD", LineaActual);
                
                for await (const oMd of aListMDTable) {
                    if (oMd.rmdId) {
                        let oObj = {
                            expira: LineaActual.Vfdat,
                            vfdat: LineaActual.Vfdat
                        }
                        await registroService.onUpdateDataGeneral(oThat.mainModelv2, "RMD", oObj, oMd.rmdId);
                    }
                }                
            },

            onDetailRmd: async function (oEvent) {
                BusyIndicator.show(0);
                var LineaActual = oEvent.getParameter("listItem").getBindingContext("modelGeneral").getObject();

                await this.onMdList(LineaActual);

                return new Promise(async function (resolve, reject) {
                    var oFilter = [];
                    oFilter.push(new Filter("Aufnr", FilterOperator.EQ, LineaActual.Aufnr));
                    await registroService.onGetDataGeneralFilters(oThat.modelImpresionOrd, "OrdenSet", oFilter).then(function (oListOrden) {
                        LineaActual.Pdf64 = "";
                        oListOrden.results.forEach(function (values) {
                            if (LineaActual.Aufnr == values.Aufnr) {
                                LineaActual.Pdf64 = values.Pdf64;
                            }
                        });
                        if (!oThat.onMds) {
                            oThat.onMds = sap.ui.xmlfragment(
                                "frgMds",
                                sRootPath + ".view.dialog.Mds",
                                oThat
                            );
                            oThat.getView().addDependent(oThat.onMds);
                        }
                        oThat.onMds.open();
                        BusyIndicator.hide();

                    }).catch(function (oError) {
                        console.log(oError);
                        MessageBox.error("Coordinar con TI - Error SAP:\n Revisar Tx. ZPPPT_003 con la Orden "+ LineaActual.Aufnr +", para la funcionalidad de impresión.");
                        sap.ui.core.BusyIndicator.hide();
                    })
                });


            },

            onDetailRmdGo: async function (oEvent) {
                var LineaActual = oEvent.getParameter("listItem").getBindingContext("modelGeneral").getObject();
                let lineaActualRMD = oThat.modelGeneral.getProperty("/LineaActualRMD");
                if (!(LineaActual.rm === "A" || LineaActual.rm === "SS")) {
                    MessageBox.warning("El RMD no está Autorizado.");
                    return;
                }
                let aFilterUser = [];
                aFilterUser.push(new Filter("rmdId_rmdId", FilterOperator.EQ, LineaActual.rmdId));
                aFilterUser.push(new Filter("rol", FilterOperator.EQ, "AUXILIAR"));
                let aListUserRMD = await registroService.getDataFilter(oThat.mainModelv2, "/RMD_USUARIO", aFilterUser);

                if (oInfoUsuario.funcionUsuario.habilitarRMD){
                    if (aListUserRMD.results.length === 0) {
                        let sMessage = LineaActual.stateRMD === "Habilitado" || LineaActual.stateRMD === "En Proceso" || LineaActual.stateRMD === 'Cerrado' || LineaActual.stateRMD === 'Reaperturado' || LineaActual.stateRMD === 'Parada' ? "Debe asignar algún usuario antes de continuar al Registro de Manufactura Digital." : "Debe asignar algún usuario antes de Habilitar el Registro de Manufactura Digital.";
                        MessageBox.warning(sMessage);
                        return;
                    }
                } else {
                    if (oInfoUsuario.rol[0].codigo == "RMD_AUXILIAR") {
                        let perteneceUsuario = aListUserRMD.results.find(itm=>itm.codigo === oInfoUsuario.data.usuario);
                        if (!perteneceUsuario) {
                            MessageBox.warning("Su usuario no ha sido asignado para el RMD.");
                            return;    
                        } else {
                            oInfoUsuario.data.bReemplazo = perteneceUsuario.bReemplazo;
                            this.modelGeneral.setProperty("/oInfoUsuario", oInfoUsuario);
                        }
                    }
                    if (aListUserRMD.results.length === 0) {
                        let sMessage = LineaActual.stateRMD === "Habilitado" || LineaActual.stateRMD === "En Proceso" || LineaActual.stateRMD === 'Cerrado' || LineaActual.stateRMD === 'Reaperturado' || LineaActual.stateRMD === 'Parada' ? "Se debe asignar algún usuario antes de continuar al Registro de Manufactura Digital." : "Se debe Habilitar el Registro de Manufactura Digital para que pueda continuar.";
                        MessageBox.warning(sMessage);
                        return;
                    }
                }
                oThat.modelGeneral.setProperty("/LineaActualMD", LineaActual);
                let aFiltersRMD = [];
                aFiltersRMD.push(new Filter("rmdId", "EQ", LineaActual.rmdId));
                let sExpand = "mdId/estadoIdRmd,estadoIdRmd,aReceta/recetaId";
                let aResponseRMD = await registroService.getDataExpand(oThat.mainModelv2, "/RMD", sExpand, aFiltersRMD);
                if (!aResponseRMD.results[0].loteAnt) {
                    if (!aResponseRMD.results[0].loteProv) {
                        aResponseRMD.results[0].loteVistaRMD = '';
                        aResponseRMD.results[0].loteEtiqueta = aResponseRMD.results[0].lote;
                    } else {
                        aResponseRMD.results[0].loteVistaRMD = aResponseRMD.results[0].loteProv;
                        aResponseRMD.results[0].loteEtiqueta = aResponseRMD.results[0].loteProv;
                    }
                } else {
                    aResponseRMD.results[0].loteVistaRMD = aResponseRMD.results[0].loteAnt;
                    aResponseRMD.results[0].loteEtiqueta = aResponseRMD.results[0].loteAnt;
                }
                let oModel = new JSONModel(aResponseRMD.results[0]);
                oThat.getOwnerComponent().setModel(oModel, "asociarDatos");

                if (LineaActual.estadoIdRmd === null) {
                    if (oInfoUsuario.funcionUsuario.habilitarRMD) {
                        if (!lineaActualRMD.Vfdat) {
                            MessageBox.warning("No se puede realizar la habilitación porque no tiene fecha de expira.")
                            return;
                        }
                        MessageBox.confirm(
                            oThat.getView().getModel("i18n").getResourceBundle().getText("confirmAvailable"), {
                            styleClass: "sapUiSizeCompact",
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            onClose: async function (oAction) {
                                if (oAction === "YES") {
                                    BusyIndicator.show(0);
                                    var date = new Date();
                                    let dateNowFormat = formatter.formatDateFooterEspecificaciones(date);
                                    var time = new Date(dateNowFormat).getTime();
                                    var aFilter = [];
                                    var aEquiposError = [];
                                    var sMensajeError  = null;
                                    aFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));
                                    var aListEquipo = await registroService.getDataExpand(oThat.mainModelv2, "/MD_ES_EQUIPO", "equipoId", aFilter);
                                    var booleanValidateCalibre = false;
                                    for await (const element of aListEquipo.results) {
                                        let entity = "/CalibracionSet('" + element.equipoId.equnr + "')";
                                        let oEquipoSap = await registroService.getDataAll(oThat.modelNecesidad, entity);
                                        if(oEquipoSap.Nplda) {
                                            if (time > oEquipoSap.Nplda.getTime()) {
                                                booleanValidateCalibre = true;
                                                let obj = {
                                                    eqktx : element.equipoId.eqktx,
                                                    equnr : element.equipoId.equnr,
                                                };
                                                aEquiposError.push(obj);
                                            } else {
                                                let oData = {
                                                    gstrp : oEquipoSap.Nplda
                                                }
                                                await registroService.onUpdateDataGeneral(oThat.mainModelv2, "EQUIPO", oData, element.equipoId_equipoId);
                                            }
                                        }    
                                    }
                                    if (booleanValidateCalibre) {
                                        aEquiposError.forEach( function(e){
                                            sMensajeError = sMensajeError ? (sMensajeError +"\n"+e.equnr + "-" + e.eqktx) : e.equnr + " - " + e.eqktx;
                                        })
                                        BusyIndicator.hide();
                                        MessageBox.error((oThat.i18n.getText("errorValidateCalibracionCalificacion") + (sMensajeError ? "\n" + sMensajeError : "")));
                                        return;
                                    }
                                    oThat.onMds.close();
                                    await oThat.setEstructurasRmd(LineaActual);
                                    BusyIndicator.hide();
                                }
                            }
                        }
                        );
                    } else {
                        MessageBox.warning(
                            oThat.getView().getModel("i18n").getResourceBundle().getText("actionNotAllowedRol"))
                    }

                } else {
                    if (oInfoUsuario) {
                        if (oInfoUsuario.funcionUsuario.registroCC || oInfoUsuario.funcionUsuario.registroCP
                            || oInfoUsuario.funcionUsuario.registroP || oInfoUsuario.funcionUsuario.registroVB
                            || oInfoUsuario.funcionUsuario.registroLector || oInfoUsuario.funcionUsuario.cierreRMD
                            || oInfoUsuario.funcionUsuario.agregarEquipo || oInfoUsuario.funcionUsuario.reaperturaRMD
                            || oInfoUsuario.funcionUsuario.habilitarRMD) {

                            oThat.onMds.close();
                            oThat.onListFraction(LineaActual);
                        } else {
                            MessageBox.warning(
                                oThat.getView().getModel("i18n").getResourceBundle().getText("actionNotAllowed"))
                        }
                    }
                }
            },
            setEstructurasRmdInsumo: async function (LineaActual) {
                var oFilter = [];

                oFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));

                var aListEstructura = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ESTRUCTURA", oFilter);
                var aListPaso = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_PASO", oFilter);
                var aListEquipo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_EQUIPO", oFilter);
                var aListUtensilio = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_UTENSILIO", oFilter);
                var aListEspecificacion = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_ESPECIFICACION", oFilter);
                var aListReceta = await registroService.getDataFilter(oThat.mainModelv2, "/MD_RECETA", oFilter);
                var aListInsumo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_RE_INSUMO", oFilter);

                var sobject = {};
                sobject.terminal = null;
                sobject.usuarioRegistro = oInfoUsuario.data.usuario;
                sobject.fechaRegistro = new Date();
                sobject.activo = true;
                sobject.aEstructura = [];
                sobject.aPaso = [];
                sobject.aEquipo = [];
                sobject.aUtensilio = [];
                sobject.aEspecificacion = [];
                sobject.aReceta = [];
                sobject.aInsumo = [];
                sobject.Id = util.onGetUUIDV4();

                var tListReceta = aListReceta.results;
                tListReceta.forEach(element => {
                    delete element["mdRecetaId"];
                    delete element["mdEstructuraRecetaId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["estructuraId"];
                    delete element["estructuraId_estructuraId"];
                    delete element["aplica"];
                    delete element["__metadata"];

                    var sobjectR = element;
                    sobjectR.terminal = null;
                    sobjectR.fechaActualiza = null;
                    sobjectR.usuarioActualiza = null;
                    sobjectR.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectR.fechaRegistro = new Date();
                    sobjectR.activo = true;

                    sobjectR.rmdRecetaId = util.onGetUUIDV4();
                    sobjectR.rmdId_rmdId = LineaActual.rmdId;
                });


                aListEstructura.results.forEach(element => {

                    var tListPaso = aListPaso.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEquipo = aListEquipo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListUtensilio = aListUtensilio.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEspecificacion = aListEspecificacion.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListInsumo = aListInsumo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);

                    delete element["mdEstructuraId"];
                    delete element["estructuraId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["__metadata"];

                    var sobjectEs = element;
                    sobjectEs.terminal = null;
                    sobjectEs.fechaActualiza = null;
                    sobjectEs.usuarioActualiza = null;
                    sobjectEs.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectEs.fechaRegistro = new Date();
                    sobjectEs.activo = true;

                    sobjectEs.rmdEstructuraId = "b0686a97-7fa4-4b6a-9e77-da37a97e503f";
                    sobjectEs.rmdId_rmdId = LineaActual.rmdId;

                    sobject.aEstructura = [];


                    tListInsumo.forEach(element => {
                        delete element["estructuraRecetaInsumoId"];
                        delete element["mdId"];
                        delete element["mdId_mdId"];
                        delete element["estructuraId"];
                        delete element["estructuraId_estructuraId"];
                        delete element["mdEstructuraId_mdEstructuraId"];
                        delete element["mdEstructuraId"];
                        delete element["__metadata"];
                        delete element["mdRecetaId_mdRecetaId"];
                        delete element["mdRecetaId"];

                        var sobjectI = element;
                        sobjectI.terminal = null;
                        sobjectI.fechaActualiza = null;
                        sobjectI.usuarioActualiza = null;
                        sobjectI.usuarioRegistro = oInfoUsuario.data.usuario;
                        sobjectI.fechaRegistro = new Date();
                        sobjectI.activo = true;

                        sobjectI.rmdEstructuraRecetaInsumoId = util.onGetUUIDV4();
                        sobjectI.rmdEstructuraId_rmdEstructuraId = sobjectEs.rmdEstructuraId;
                        sobjectI.rmdRecetaId_recetaId = "f0d1f326-c7b6-4861-9f3a-2b22882fda65";
                        sobjectI.rmdId_rmdId = LineaActual.rmdId;

                        sobject.aInsumo.push(sobjectI);
                    });

                });

                registroService.createData(oThat.mainModelv2, "/RMD_ESTRUCTURA_SKIP", sobject).then(function () {
                    oThat.getEstructurasRmd(LineaActual);
                }.bind(oThat), function (error) {
                    MessageBox.error("Ocurrió un error al registrar las estructuras RMD seleccionados.");
                    BusyIndicator.hide();
                });
            },
            setEstructurasRmdInsumoTest: async function (LineaActual) {
                var oFilter = [];

                oFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));

                var aListEstructura = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ESTRUCTURA", oFilter);
                var aListPaso = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_PASO", oFilter);
                var aListEquipo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_EQUIPO", oFilter);
                var aListUtensilio = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_UTENSILIO", oFilter);
                var aListEspecificacion = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_ESPECIFICACION", oFilter);
                var aListReceta = await registroService.getDataFilter(oThat.mainModelv2, "/MD_RECETA", oFilter);
                var aListInsumo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_RE_INSUMO", oFilter);

                var sobject = {};
                sobject.terminal = null;
                sobject.usuarioRegistro = oInfoUsuario.data.usuario;
                sobject.fechaRegistro = new Date();
                sobject.activo = true;
                sobject.aEstructura = [];
                sobject.aPaso = [];
                sobject.aEquipo = [];
                sobject.aUtensilio = [];
                sobject.aEspecificacion = [];
                sobject.aReceta = [];
                sobject.aInsumo = [];
                sobject.Id = util.onGetUUIDV4();

                var tListReceta = aListReceta.results;
                tListReceta.forEach(element => {
                    delete element["mdRecetaId"];
                    delete element["mdEstructuraRecetaId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["estructuraId"];
                    delete element["estructuraId_estructuraId"];
                    delete element["aplica"];
                    delete element["__metadata"];

                    var sobjectR = element;
                    sobjectR.terminal = null;
                    sobjectR.fechaActualiza = null;
                    sobjectR.usuarioActualiza = null;
                    sobjectR.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectR.fechaRegistro = new Date();
                    sobjectR.activo = true;

                    sobjectR.rmdRecetaId = util.onGetUUIDV4();
                    sobjectR.rmdId_rmdId = LineaActual.rmdId;
                });


                aListEstructura.results.forEach(element => {

                    var tListPaso = aListPaso.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEquipo = aListEquipo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListUtensilio = aListUtensilio.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEspecificacion = aListEspecificacion.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListInsumo = aListInsumo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);

                    delete element["mdEstructuraId"];
                    delete element["estructuraId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["__metadata"];

                    var sobjectEs = element;
                    sobjectEs.terminal = null;
                    sobjectEs.fechaActualiza = null;
                    sobjectEs.usuarioActualiza = null;
                    sobjectEs.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectEs.fechaRegistro = new Date();
                    sobjectEs.activo = true;

                    sobjectEs.rmdEstructuraId = "b0686a97-7fa4-4b6a-9e77-da37a97e503f";
                    sobjectEs.rmdId_rmdId = LineaActual.rmdId;

                    sobject.aEstructura = [];


                    tListInsumo.forEach(element => {
                        delete element["estructuraRecetaInsumoId"];
                        delete element["mdId"];
                        delete element["mdId_mdId"];
                        delete element["estructuraId"];
                        delete element["estructuraId_estructuraId"];
                        delete element["mdEstructuraId_mdEstructuraId"];
                        delete element["mdEstructuraId"];
                        delete element["__metadata"];
                        delete element["mdRecetaId_mdRecetaId"];
                        delete element["mdRecetaId"];

                        var sobjectI = element;
                        sobjectI.terminal = null;
                        sobjectI.fechaActualiza = null;
                        sobjectI.usuarioActualiza = null;
                        sobjectI.usuarioRegistro = oInfoUsuario.data.usuario;
                        sobjectI.fechaRegistro = new Date();
                        sobjectI.activo = true;

                        sobjectI.rmdEstructuraRecetaInsumoId = util.onGetUUIDV4();
                        sobjectI.rmdEstructuraId_rmdEstructuraId = sobjectEs.rmdEstructuraId;
                        sobjectI.rmdRecetaId_recetaId = "f0d1f326-c7b6-4861-9f3a-2b22882fda65";
                        sobjectI.rmdId_rmdId = LineaActual.rmdId;

                        sobject.aInsumo.push(sobjectI);
                    });

                });
                BusyIndicator.hide();
                return new Promise(function(resolve,reject){
                    registroService.createData(oThat.mainModelv2, "/RMD_ESTRUCTURA_SKIP", sobject).then(function () {
                        resolve("success");
                    }.bind(oThat), function (error) {
                        reject("error");
                    });
                });
                
            },
            setEstructurasRmdPrueba: async function (LineaActual) {
                var oFilter = [];

                oFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));

                var aListEstructura = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ESTRUCTURA", oFilter);
                var aListPaso = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_PASO", oFilter);
                var aListEquipo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_EQUIPO", oFilter);
                var aListUtensilio = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_UTENSILIO", oFilter);
                var aListEspecificacion = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_ESPECIFICACION", oFilter);

                var sobject = {};
                sobject.terminal = null;
                sobject.usuarioRegistro = oInfoUsuario.data.usuario;
                sobject.fechaRegistro = new Date();
                sobject.activo = true;
                sobject.aEstructura = [];
                sobject.aPaso = [];
                sobject.aEquipo = [];
                sobject.aUtensilio = [];
                sobject.aEspecificacion = [];
                sobject.Id = util.onGetUUIDV4();

                aListEstructura.results.forEach(element => {

                    var tListPaso = aListPaso.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEquipo = aListEquipo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListUtensilio = aListUtensilio.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEspecificacion = aListEspecificacion.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);

                    delete element["mdEstructuraId"];
                    delete element["estructuraId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["__metadata"];

                    var sobjectEs = element;
                    sobjectEs.terminal = null;
                    sobjectEs.fechaActualiza = null;
                    sobjectEs.usuarioActualiza = null;
                    sobjectEs.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectEs.fechaRegistro = new Date();
                    sobjectEs.activo = true;

                    sobjectEs.rmdEstructuraId = "ef8d5600-c136-4a30-8e33-d886ffbb026b";
                    sobjectEs.rmdId_rmdId = LineaActual.rmdId;

                    sobject.aEstructura = [];


                    tListEspecificacion.forEach(element => {
                        delete element["especificaionId"];
                        delete element["estructuraId"];
                        delete element["mdId"];
                        delete element["mdId_mdId"];
                        delete element["mdEstructuraEspecificacionId"];
                        delete element["estructuraId_estructuraId"];
                        delete element["mdEstructuraId_mdEstructuraId"];
                        delete element["mdEstructuraId"];
                        delete element["__metadata"];

                        var sobjectEp = element;
                        sobjectEp.terminal = null;
                        sobjectEp.fechaActualiza = null;
                        sobjectEp.usuarioActualiza = null;
                        sobjectEp.usuarioRegistro = oInfoUsuario.data.usuario;
                        sobjectEp.fechaRegistro = new Date();
                        sobjectEp.activo = true;

                        sobjectEp.rmdEstructuraEspecificacionId = util.onGetUUIDV4();
                        sobjectEp.rmdEstructuraId_rmdEstructuraId = sobjectEs.rmdEstructuraId;
                        sobjectEp.rmdId_rmdId = LineaActual.rmdId;
                        sobjectEp.aplica = true;

                        sobject.aEspecificacion.push(sobjectEp);
                    });

                });

                registroService.createData(oThat.mainModelv2, "/RMD_ESTRUCTURA_SKIP", sobject).then(function () {
                    oThat.getEstructurasRmd(LineaActual);
                }.bind(oThat), function (error) {
                    MessageBox.error("Ocurrió un error al registrar las estructuras RMD seleccionados.");
                    BusyIndicator.hide();
                });
            },

            onGetMdEsPaso: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    let sExpand = "pasoId";
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEquipo: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_EQUIPO", aFilters).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsUtensilio: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_UTENSILIO", aFilters).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEtiqueta: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_ETIQUETA", aFilters).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsReInsumo: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_RE_INSUMO", aFilters).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEspecificacion: function (mdId) {
                return new Promise(function (resolve, reject) {
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_ESPECIFICACION", aFilters).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsPasoInsumoPaso: function (mdId) {
                return new Promise(function (resolve, reject) {
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilters).then(function (oListMdEsPasoInsumoPaso) {
                        resolve(oListMdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },
            setEstructurasRmd: async function (LineaActual) {
                let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                let aFilterReceta = [];
                aFilterReceta.push(new Filter("mdId_mdId", "EQ", LineaActual.mdId));
                let sExpandReceta = "aInsumos";
                let aRecetaMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_RECETA", aFilterReceta, sExpandReceta);
                let aFilters = [];
                aFilters.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));
                let sExpands = "estructuraId";
                let aEstructuraMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilters, sExpands);
                let oModelPaso, oModelEquipo, oModelUtensilio, oModelEtiqueta, oModelInsumo, oModelEspecificacion, oModelEsPasoInsumoPaso;
                await Promise.all([oThat.onGetMdEsPaso(LineaActual.mdId), oThat.onGetMdEsEquipo(LineaActual.mdId), oThat.onGetMdEsUtensilio(LineaActual.mdId), 
                    oThat.onGetMdEsEtiqueta(LineaActual.mdId), oThat.onGetMdEsReInsumo(LineaActual.mdId), oThat.onGetMdEsEspecificacion(LineaActual.mdId), oThat.onGetMdEsPasoInsumoPaso(LineaActual.mdId)]).then(async function(values) {
                    oModelPaso = values[0].results;
                    oModelEquipo = values[1].results;
                    oModelUtensilio = values[2].results;
                    oModelEtiqueta = values[3].results;
                    oModelInsumo = values[4].results;
                    oModelEspecificacion = values[5].results;
                    oModelEsPasoInsumoPaso = values[6].results;
                }).catch(function (oError) {
                    BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });
                for await (const item of aEstructuraMD.results) {
                    const aFilterMdPaso = await oModelPaso.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEquipo = await oModelEquipo.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdUtensilio = await oModelUtensilio.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEtiqueta = await oModelEtiqueta.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdReInsumo = await oModelInsumo.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEspecificacion = await oModelEspecificacion.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEsPasoInsumoPaso = await oModelEsPasoInsumoPaso.filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });
                    
                    item.aPaso.results = [];
                    item.aEquipo.results = [];
                    item.aUtensilio.results = [];
                    item.aEtiqueta.results = [];
                    item.aPasoInsumoPaso.results = [];
                    item.aInsumo.results = [];
                    item.aEspecificacion.results = [];

                    item.aPaso.results = aFilterMdPaso;
                    item.aEquipo.results = aFilterMdEquipo;
                    item.aUtensilio.results = aFilterMdUtensilio;
                    item.aEtiqueta.results = aFilterMdEtiqueta;
                    item.aPasoInsumoPaso.results = aFilterMdEsPasoInsumoPaso;
                    item.aInsumo.results = aFilterMdReInsumo;
                    item.aEspecificacion.results = aFilterMdEspecificacion;
                };
                let oEstructuraProceso = aEstructuraMD.results.find(itm=>itm.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso);
                let bFlagErrorNotif = true;
                if (oEstructuraProceso) {
                    let aPasosNotificacion = oEstructuraProceso.aPaso.results.filter(itm=>itm.tipoDatoId_iMaestraId === stipoDatoNotificacion);
                    if (aPasosNotificacion.length > 0) {
                        let helper = {};
                        let aPuestoTrabajoPasos = aPasosNotificacion.reduce(function(r, o) {
                            let key = o.puestoTrabajo;
                            if (!helper[key]) {
                                helper[key] = {"puestoTrabajo" : o.puestoTrabajo, aPasos: [o]};
                                r.push(helper[key]);
                            } else {
                                helper[key].aPasos.push(o);
                            }
                            return r;
                        }, []);
                        if (aPuestoTrabajoPasos.length === 0) {
                            bFlagErrorNotif = false;
                        } else {
                            aPuestoTrabajoPasos.forEach(function(oPuestoTrabajo) {
                                let helper = {};
                                let aClvModeloPasos = oPuestoTrabajo.aPasos.reduce(function(r, o) {
                                    let key = o.clvModelo;
                                    if (!helper[key]) {
                                        helper[key] = {"puestoTrabajo" : o.puestoTrabajo, "clvModelo" : o.clvModelo, aPasos: [o]};
                                        r.push(helper[key]);
                                    } else {
                                        helper[key].aPasos.push(o);
                                    }
                                    return r;
                                }, []);
                                let oFidClvPre = aClvModeloPasos.find(itm=>itm.clvModelo === 'SETPRE');
                                let oFidClvProceso = aClvModeloPasos.find(itm=>itm.clvModelo === 'PROCESO');
                                let oFidClvPost = aClvModeloPasos.find(itm=>itm.clvModelo === 'SETPOST');
                                if (oFidClvPre && oFidClvProceso && oFidClvPost) {
                                    bFlagErrorNotif = true;
                                } else {
                                    bFlagErrorNotif = false;
                                }
                                aClvModeloPasos.forEach(function(oCvlModelo){
                                    let oFindPasoInicio = oCvlModelo.aPasos.find(itm=>itm.pasoId.tipoCondicionId_iMaestraId === sIdInicioCondicion);
                                    let oFindPasoFin = oCvlModelo.aPasos.find(itm=>itm.pasoId.tipoCondicionId_iMaestraId === sIdFinCondicion);
                                    if (!oFindPasoInicio || !oFindPasoFin) {
                                        bFlagErrorNotif = false;
                                    }
                                });
                            });
                        }
                    }
                }
                if (bFlagErrorNotif){
                    let aFilter = [];
                    aFilter.push(new Filter("rmdId", "EQ", LineaActual.rmdId));
                    let aRMD = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", aFilter);

                    if (aRMD.results[0].estadoIdRmd_iMaestraId ===idEstadoHabilitado) {
                        BusyIndicator.hide();
                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("smgValidationRmdHabilitado"));
                        return false;
                    }
                    let sobject = {
                        fechaActualiza : new Date(),
                        usuarioActualiza : oInfoUsuario.data.usuario,
                        rmdId : LineaActual.rmdId,
                        fraccion : 1,
                        estadoIdRmd_iMaestraId : idEstadoHabilitado,
                        fechaHabilita: new Date(),
                        usuarioHabilita: oInfoUsuario.data.usuario
                    };
                    await registroService.updateStatusRmd(oThat.mainModelv2, "/RMD", sobject);
                    let oUsuarioParam =  {
                        usuarioRegistro: oInfoUsuario.data.usuario,
                        fechaRegistro: new Date(),
                        activo: true,
                        rmdUsuarioId : util.onGetUUIDV4(),
                        rmdId_rmdId  : LineaActual.rmdId,
                        codigo       : oInfoUsuario.data.usuario,
                        nombre       : oInfoUsuario.data.nombre,
                        usuarioId_usuarioId : oInfoUsuario.data.usuarioId,
                        rol          : "JEFE_PROD"
                    }
                    await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_USUARIO", oUsuarioParam);

                    let aListIdsReceta = [];
                    for await (const oReceta of aRecetaMD.results) {
                        let oParamReceta = {
                            usuarioRegistro: oInfoUsuario.data.usuario,
                            fechaRegistro: new Date(),
                            activo: true,
                            fraccion: 1,
                            rmdRecetaId: util.onGetUUIDV4(),
                            rmdId_rmdId: LineaActual.rmdId,
                            recetaId_recetaId : oReceta.recetaId_recetaId,
                            orden : oReceta.orden
                        }
                        let objIdReceta = {
                            mdRecetaId : oReceta.mdRecetaId,
                            rmdRecetaId : oParamReceta.rmdRecetaId
                        }
                        aListIdsReceta.push(objIdReceta);
                        await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_RECETA", oParamReceta);
                    }

                    let aListEstructurasRMD = [];
                    let aListIdsInsumos = [];
                    for await (const oEstructuraOnlyInsumo of aEstructuraMD.results) {
                        if(oEstructuraOnlyInsumo.aInsumo.results.length > 0){
                            let oParam = {
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaRegistro: new Date(),
                                activo: true,
                                fraccion: 1,
                                rmdEstructuraId: util.onGetUUIDV4(),
                                orden: oEstructuraOnlyInsumo.orden,
                                rmdId_rmdId: LineaActual.rmdId,
                                estructuraId_estructuraId: oEstructuraOnlyInsumo.estructuraId_estructuraId,
                                aPaso: [],
                                aEquipo : [],
                                aUtensilio : [],
                                aEtiqueta: [],
                                aPasoInsumoPaso: [],
                                aEspecificacion: [],
                                aInsumo: []
                            }

                            if (oEstructuraOnlyInsumo.aInsumo.results.length > 0) {
                                let aFilters = [];
                                aFilters.push(new Filter("Aufnr", "EQ", oDataSeleccionada.getData().ordenSAP));
                                let oResponseInsumoSAP = await registroService.onGetDataGeneralFilters(oThat.modelNecesidad, "VerificaInsumosSet", aFilters);
                                const oResponseInsumoSAPAcumulado = oResponseInsumoSAP.results.reduce((acumulador, valorActual) => {
                                    const elementoYaExiste = acumulador.find(elemento => elemento.Aufnr === valorActual.Aufnr && elemento.Matnr === valorActual.Matnr && elemento.Posnr === valorActual.Posnr);
                                    if (elementoYaExiste) {
                                      return acumulador.map((elemento) => {
                                        if (elemento.Aufnr === valorActual.Aufnr && elemento.Matnr === valorActual.Matnr && elemento.Posnr === valorActual.Posnr) {
                                          return {
                                            ...elemento,
                                            Bdmng: (parseFloat(elemento.Bdmng) + parseFloat(valorActual.Bdmng)).toFixed(3)
                                          }
                                        }
                                  
                                        return elemento;
                                      });
                                    }
                                  
                                    return [...acumulador, valorActual];
                                }, []);
                                oResponseInsumoSAP.results = oResponseInsumoSAPAcumulado;
                                for await (const oInsumo of oEstructuraOnlyInsumo.aInsumo.results) {
                                    let matchRecetaId = aListIdsReceta.find(itm=>itm.mdRecetaId === oInsumo.mdRecetaId_mdRecetaId);
                                    let existeInsumoSAP = oResponseInsumoSAP.results.find(itm=>itm.Matnr === oInsumo.Component);
                                    let oInsumoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraRecetaInsumoId: util.onGetUUIDV4(),
                                        rmdId_rmdId: LineaActual.rmdId,
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdRecetaId_rmdRecetaId : matchRecetaId ? matchRecetaId.rmdRecetaId : null,
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
                                        AiPrio : oInsumo.AiPrio,
                                        enabledCheck: true,
                                        fraccion: 1,
                                        cantidadOP: existeInsumoSAP ? parseFloat(existeInsumoSAP.Bdmng) : 0,
                                        adicional: existeInsumoSAP ? parseInt(existeInsumoSAP.Posnr) > 2000 ? true : false : false,
                                        visibleInsumo: existeInsumoSAP && !(oInsumo.CompQty.includes("-")) ? true : false,
                                        ifa: existeInsumoSAP ? existeInsumoSAP.Atwrt === 'X' ? true : false : false,
                                        Mtart: existeInsumoSAP ? existeInsumoSAP.Mtart : null,
                                        umb: existeInsumoSAP ? existeInsumoSAP.Meins : null,
                                        Charg: existeInsumoSAP ? existeInsumoSAP.Charg : null
                                    }
                                    let objInsumoIds = {
                                        estructuraRecetaInsumoId : oInsumo.estructuraRecetaInsumoId,
                                        rmdEstructuraRecetaInsumoId : oInsumoObj.rmdEstructuraRecetaInsumoId
                                    }
                                    aListIdsInsumos.push(objInsumoIds);
                                    oParam.aInsumo.push(oInsumoObj);
                                }
                            }
                            await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_ESTRUCTURA", oParam);
                        }
                    }
                    for await (const oEstructura of aEstructuraMD.results) {
                        if (oEstructura.aInsumo.results.length === 0) {
                            let oParam = {
                                usuarioRegistro: oInfoUsuario.data.usuario,
                                fechaRegistro: new Date(),
                                activo: true,
                                fraccion: 1,
                                rmdEstructuraId: util.onGetUUIDV4(),
                                orden: oEstructura.orden,
                                rmdId_rmdId: LineaActual.rmdId,
                                estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                                aPaso: [],
                                aEquipo : [],
                                aUtensilio : [],
                                aEtiqueta: [],
                                aPasoInsumoPaso: [],
                                aEspecificacion: [],
                                aInsumo: []
                            }
                            aListEstructurasRMD.push(oParam);
                            let aListIdPaso = [];
                            if (oEstructura.aPaso.results.length > 0) {
                                for await (const oPaso of oEstructura.aPaso.results) {
                                    if (oPaso.tipoDatoId_iMaestraId === stipoDatoNotificacion) { //SE REGISTRA LAPSO
                                        let oPasoObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            rmdEstructuraPasoId: util.onGetUUIDV4(),
                                            rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                            rmdId_rmdId: LineaActual.rmdId,
                                            pasoId_pasoId: oPaso.pasoId_pasoId,
                                            orden: oPaso.orden,
                                            valorInicial: oPaso.valorInicial,
                                            valorFinal: oPaso.valorFinal,
                                            margen: oPaso.margen,
                                            decimales: oPaso.decimales,
                                            mdEstructuraPasoIdDepende: oPaso.mdEstructuraPasoIdDepende,
                                            depende: oPaso.depende,
                                            dependeRmdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                            estadoCC: oPaso.estadoCC,
                                            estadoMov: oPaso.estadoMov,
                                            pmop: oPaso.pmop,
                                            genpp: oPaso.genpp,
                                            tab: oPaso.tab,
                                            edit: oPaso.edit,
                                            rpor: oPaso.rpor,
                                            vb: oPaso.vb,
                                            formato : oPaso.formato,
                                            imagen : false,
                                            tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                            puestoTrabajo : oPaso.puestoTrabajo,
                                            clvModelo : oPaso.clvModelo,
                                            automatico : oPaso.automatico,
                                            aplica: true,
                                            fraccion: 1
                                        }
                                        let objPaso = {
                                            mdEstructuraPasoId : oPaso.mdEstructuraPasoId,
                                            rmdEstructuraPasoId : oPasoObj.rmdEstructuraPasoId
                                        }
                                        aListIdPaso.push(objPaso);
                                        oParam.aPaso.push(oPasoObj);
                                        if (oPaso.pasoId.tipoCondicionId_iMaestraId === sIdInicioCondicion) {
                                            let pasoLapsoFin = oEstructura.aPaso.results.find(itm=>itm.clvModelo === oPaso.clvModelo && itm.puestoTrabajo === oPaso.puestoTrabajo && itm.pasoId.tipoCondicionId_iMaestraId === sIdFinCondicion); 
                                            if(pasoLapsoFin){
                                                let sobjectTrama = {
                                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                                    fechaRegistro: new Date(),
                                                    activo : true,
                                                    rmdLapsoId : util.onGetUUIDV4(),
                                                    rmdId_rmdId : LineaActual.rmdId,
                                                    Anular : false,
                                                    descripcion: oPaso.pasoId.descripcion + " - " + pasoLapsoFin.pasoId.descripcion,
                                                    tipoDatoId: (oPaso.tipoDatoId_iMaestraId).toString(),
                                                    automatico: pasoLapsoFin.automatico === null ? false : pasoLapsoFin.automatico,
                                                    pasoId_mdEstructuraPasoId: oPaso.mdEstructuraPasoId,
                                                    pasoIdFin_mdEstructuraPasoId: pasoLapsoFin.mdEstructuraPasoId,
                                                    fraccion: 1
                                                };
                                                await registroService.createData(oThat.mainModelv2, "/RMD_LAPSO", sobjectTrama);
                                            }
                                        }
                                    } else {
                                        let oPasoObj = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            rmdEstructuraPasoId: util.onGetUUIDV4(),
                                            rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                            rmdId_rmdId: LineaActual.rmdId,
                                            pasoId_pasoId: oPaso.pasoId_pasoId,
                                            orden: oPaso.orden,
                                            valorInicial: oPaso.valorInicial,
                                            valorFinal: oPaso.valorFinal,
                                            margen: oPaso.margen,
                                            decimales: oPaso.decimales,
                                            mdEstructuraPasoIdDepende: oPaso.mdEstructuraPasoIdDepende,
                                            depende: oPaso.depende,
                                            dependeRmdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                            estadoCC: oPaso.estadoCC,
                                            estadoMov: oPaso.estadoMov,
                                            pmop: oPaso.pmop,
                                            genpp: oPaso.genpp,
                                            tab: oPaso.tab,
                                            edit: oPaso.edit,
                                            rpor: oPaso.rpor,
                                            vb: oPaso.vb,
                                            formato : oPaso.formato,
                                            imagen : false,
                                            tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                            puestoTrabajo : oPaso.puestoTrabajo,
                                            clvModelo : oPaso.clvModelo,
                                            automatico : oPaso.automatico,
                                            aplica: true,
                                            fraccion: 1
                                        }
                                        let objPaso = {
                                            mdEstructuraPasoId : oPaso.mdEstructuraPasoId,
                                            rmdEstructuraPasoId : oPasoObj.rmdEstructuraPasoId
                                        }
                                        aListIdPaso.push(objPaso);
                                        oParam.aPaso.push(oPasoObj);
                                    }
                                }
                            }
        
                            if (oEstructura.aEquipo.results.length > 0) {
                                oEstructura.aEquipo.results.forEach(async function (oEquipo) {
                                    let oEquipoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraEquipoId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: LineaActual.rmdId,
                                        equipoId_equipoId: oEquipo.equipoId_equipoId,
                                        orden: oEquipo.orden,
                                        aplica: true,
                                        fraccion: 1
                                    }
                                    oParam.aEquipo.push(oEquipoObj);
                                });
                            }
                
                            if (oEstructura.aUtensilio.results.length > 0) {
                                oEstructura.aUtensilio.results.forEach(async function (oUtensilio) {
                                    let oUtensiliooBJ = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraUtensilioId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: LineaActual.rmdId,
                                        utensilioId_utensilioId: oUtensilio.utensilioId_utensilioId,
                                        agrupadorId_clasificacionUtensilioId : oUtensilio.agrupadorId_clasificacionUtensilioId,
                                        orden: oUtensilio.orden,
                                        aplica: true,
                                        fraccion: 1
                                    }
                                    oParam.aUtensilio.push(oUtensiliooBJ);
                                });
                            }
                
                            if (oEstructura.aEtiqueta.results.length > 0) {
                                oEstructura.aEtiqueta.results.forEach(async function (oEtiqueta) {
                                    let oEtiquetaObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEsEtiquetaId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: LineaActual.rmdId,
                                        etiquetaId_etiquetaId: oEtiqueta.etiquetaId_etiquetaId,
                                        orden: oEtiqueta.orden,
                                        conforme: oEtiqueta.conforme,
                                        procesoMenor: oEtiqueta.procesoMenor,
                                        fraccion: 1
                                    }
                                    oParam.aEtiqueta.push(oEtiquetaObj);
                                });
                            }
                
                            if (oEstructura.aPasoInsumoPaso.results.length > 0) {
                                for await (const oProcesoMenor of oEstructura.aPasoInsumoPaso.results) {
                                    let existePasoPadre = aListIdPaso.find(itm=>itm.mdEstructuraPasoId === oProcesoMenor.pasoId_mdEstructuraPasoId)
                                    let existeInsumo = aListIdsInsumos.find(itm=>itm.estructuraRecetaInsumoId === oProcesoMenor.estructuraRecetaInsumoId_estructuraRecetaInsumoId);
                                    let estructuraRecta = null;
                                    if (existeInsumo) {
                                        estructuraRecta = existeInsumo.rmdEstructuraRecetaInsumoId;
                                    }
                                    let oProcesoMenorObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraPasoInsumoPasoId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: LineaActual.rmdId,
                                        pasoId_rmdEstructuraPasoId: existePasoPadre.rmdEstructuraPasoId,
                                        pasoHijoId_pasoId : oProcesoMenor.pasoHijoId_pasoId !== null ? oProcesoMenor.pasoHijoId_pasoId : null,
                                        tipoDatoId_iMaestraId : oProcesoMenor.tipoDatoId_iMaestraId,
                                        rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId : estructuraRecta,
                                        mdEstructuraPasoInsumoPasoIdAct: oProcesoMenor.mdEstructuraPasoInsumoPasoIdAct,
                                        etiquetaId_etiquetaId: oProcesoMenor.etiquetaId_etiquetaId,
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
                                        aplica: true,
                                        fraccion: 1,
                                        Component: oProcesoMenor.Component,
                                        Matnr: oProcesoMenor.Matnr,
                                        Maktx: oProcesoMenor.Maktx,
                                        CompUnit: oProcesoMenor.CompUnit
                                    }
                                    oParam.aPasoInsumoPaso.push(oProcesoMenorObj);
                                }
                            }
        
                            if (oEstructura.aEspecificacion.results.length > 0) {
                                oEstructura.aEspecificacion.results.forEach(async function (oEspecificacion) {
                                    let oEspecificacionObj = {
                                        usuarioRegistro : oInfoUsuario.data.usuario,
                                        fechaRegistro : new Date(),
                                        activo : true,
                                        rmdEstructuraEspecificacionId : util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId : oParam.rmdEstructuraId,
                                        rmdId_rmdId: LineaActual.rmdId,
                                        ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                        ensayoPadreSAP : oEspecificacion.ensayoPadreSAP,
                                        ensayoHijo : oEspecificacion.ensayoHijo,
                                        especificacion: oEspecificacion.especificacion,
                                        tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                        valorInicial : oEspecificacion.valorInicial,
                                        valorFinal : oEspecificacion.valorFinal,
                                        margen : oEspecificacion.margen,
                                        decimales : oEspecificacion.decimales,
                                        orden : oEspecificacion.orden,
                                        aplica : true,
                                        Merknr : oEspecificacion.Merknr,
                                        fraccion: 1
                                    }
                                    oParam.aEspecificacion.push(oEspecificacionObj);
                                });
                            }
                            await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_ESTRUCTURA", oParam);
                        }
                    }
                    let aFilterEstructuraRMD = [], aFilterEstructuraMD = [];
                    aFilterEstructuraRMD.push(new Filter("rmdId_rmdId", "EQ", LineaActual.rmdId));
                    aFilterEstructuraMD.push(new Filter("mdId_mdId", "EQ", LineaActual.mdId));
                    let aListRMDEst = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_ESTRUCTURA", aFilterEstructuraRMD);
                    let aListMDEst = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ESTRUCTURA", aFilterEstructuraMD);
                    if (aListRMDEst.results.length !== aListMDEst.results.length) {
                        let aFilterRMD = [];
                        aFilterRMD.push(new Filter("rmdId", "EQ", LineaActual.rmdId));
                        let aRmd = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", aFilterRMD);
                        let oObj = {
                            activo: false
                        }
                        await registroService.onUpdateDataGeneral(oThat.mainModelv2, "RMD", oObj, LineaActual.rmdId);
                        aRmd.results[0].rmdId = util.onGetUUIDV4();
                        aRmd.results[0].estadoIdRmd_iMaestraId = null
                        delete aRmd.results[0].aEstructura;
                        delete aRmd.results[0].aNotasImportantes;
                        delete aRmd.results[0].aReceta;
                        delete aRmd.results[0].aUsuarioRmd;
                        delete aRmd.results[0].estadoIdRmd;
                        delete aRmd.results[0].mdId;
                        await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD", aRmd.results[0])
                        let aFilterUsuario = [];
                        aFilterUsuario.push(new Filter("rmdId_rmdId", "EQ", LineaActual.rmdId));
                        let aListUser = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_USUARIO", aFilterUsuario);
                        for await (const oUser of aListUser.results) {
                            let oObjUser = {
                                rmdId_rmdId: aRmd.results[0].rmdId
                            }
                            await registroService.onUpdateDataGeneral(oThat.mainModelv2, "RMD_USUARIO", oObjUser, oUser.rmdUsuarioId);
                        }
                        MessageBox.error("No se pudo habilitar el RMD, verificar su conexión a internet y volver a intentar");
                        return false;
                    }
                    await oThat.getEstructurasRmdRefactory(1);
                    oThat.onRouteDetailView();
                } else {
                    MessageBox.error("No se puede habilitar el RMD debido a que los pasos de Notificación están incorrectos.")
                    return false;
                }
            },

            getFormulas: function (aListInsumo, aListInsumoHistorico, model) {
                var aListObjectCase = [];
                var textoVerificado = "";

                aListInsumo.results.sort((a, b) => a.orden - b.orden);

                aListInsumo.results.forEach(eq => {
                    var sobjectCase = {}
                    sobjectCase.Id = eq.rmdEstructuraRecetaInsumoId;
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = eq.rmdEstructuraId_rmdEstructuraId;
                    sobjectCase.fechaActualiza = eq.fechaActualiza;
                    sobjectCase.rmdEstructuraId = eq.rmdEstructuraId;
                    sobjectCase.recetaId = eq.rmdRecetaId_recetaId;
                    sobjectCase.numeroBultos = eq.numeroBultos;
                    sobjectCase.vistoBueno = eq.vistoBueno;

                    sobjectCase.cantidadReceta = eq.CompQty;
                    sobjectCase.cantidadRm = eq.cantidadRm;
                    sobjectCase.stateText = "None";
                    if (eq.cantidadReceta != eq.cantidadRm) {
                        sobjectCase.stateText = "Warning";
                    }
                    sobjectCase.codigo = eq.Component;
                    sobjectCase.descripcion = eq.Maktx;
                    sobjectCase.orden = eq.Component;
                    sobjectCase.um = eq.CompUnit;
                    sobjectCase.usuarioActualiza = eq.usuarioActualiza;
                    sobjectCase.cantidadBarCode = eq.cantidadBarCode;

                    var tListInsumoHistorico = aListInsumoHistorico.results.filter(item => item.rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId === eq.rmdEstructuraRecetaInsumoId && item.rmdEstructuraId_rmdEstructuraId === eq.rmdEstructuraId_rmdEstructuraId);

                    var tUltimoListInsumoHistorico = {};

                    if (tListInsumoHistorico.length > 0) {
                        tListInsumoHistorico.sort((a, b) => a.fechaRegistro.getTime() - b.fechaRegistro.getTime());
                        tUltimoListInsumoHistorico = tListInsumoHistorico[tListInsumoHistorico.length - 1];
                    }

                    sobjectCase.historico = tListInsumoHistorico;
                    sobjectCase.ultimaAccion = tUltimoListInsumoHistorico;
                    aListObjectCase.push(sobjectCase);
                });

                oThat.modelGeneral.setProperty(model, aListObjectCase);

            },

            getEspecificacion: function (aListEspecificacion, model) {
                var aListObjectCase = [];
                var textoVerificado = "";

                aListEspecificacion.results.sort((a, b) => a.orden - b.orden);

                aListEspecificacion.results.forEach(eq => {
                    var sobjectCase = {}
                    sobjectCase.Id = eq.rmdEstructuraEspecificacionId;
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = eq.rmdEstructuraId_rmdEstructuraId;
                    sobjectCase.descripcion = "";
                    sobjectCase.activo = "";
                    sobjectCase.codigo = "";
                    sobjectCase.resultados = eq.resultados;
                    sobjectCase.tipodato = eq.tipoDatoId_iMaestraId;
                    sobjectCase.fechaActualiza = eq.fechaActualiza;
                    if (eq.ensayoPadreId) {
                        sobjectCase.descripcion = eq.ensayoPadreId.contenido;
                        sobjectCase.activo = eq.ensayoPadreId.activo;
                        sobjectCase.codigo = eq.ensayoPadreId.codigo;
                    }
                    sobjectCase.ensayoHijo = eq.ensayoHijo;
                    sobjectCase.especificacion = eq.especificacion;
                    sobjectCase.usuarioActualiza = eq.usuarioActualiza;
                    aListObjectCase.push(sobjectCase);
                });

                oThat.modelGeneral.setProperty(model, aListObjectCase);

            },

            getProcesos: function (aListEtiqueta, aListPasoInsumo, aListPasoHistorico, model) {
                var aListObjectCase = [];
                var textoVerificado = "";

                aListEtiqueta.results.sort((a, b) => a.orden - b.orden);

                aListEtiqueta.results.forEach(eq => {
                    var sobjectCase = {}
                    sobjectCase.Id = eq.rmdEsEtiquetaId;
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = eq.rmdEstructuraId_rmdEstructuraId;
                    sobjectCase.rmdEsEtiquetaId = eq.rmdEsEtiquetaId;
                    sobjectCase.fechaActualiza = eq.fechaActualiza;
                    sobjectCase.rmdEstructuraId = eq.rmdEstructuraId;
                    sobjectCase.vistoBueno = eq.vistoBueno;

                    if (eq.etiquetaId) {
                        sobjectCase.codigoEtiqueta = eq.etiquetaId.codigo;
                        sobjectCase.descripcionEtiqueta = eq.etiquetaId.descripcion;
                    }
                    sobjectCase.orden = eq.orden;
                    sobjectCase.um = eq.um;
                    sobjectCase.usuarioActualiza = eq.usuarioActualiza;
                    sobjectCase.paso = [];

                    aListPasoInsumo.results.forEach(value => {
                        var sobjectCase2 = {};
                        if (eq.etiquetaId_etiquetaId == value.etiquetaId_etiquetaId) {
                            sobjectCase.paso.push(value);
                        }
                    });

                    aListObjectCase.push(sobjectCase);
                });

                aListObjectCase.forEach(eq => {
                    var arrId = [];
                    eq.paso.forEach(eq2 => {
                        arrId.push(eq2.rmdEstructuraPasoInsumoPasoId);
                    });
                    eq.arrId = arrId;
                });

                $.each(aListObjectCase, function (x, y) {
                    var paso = [];

                    y.paso.sort((a, b) => a.orden - b.orden);

                    $.each(y.paso.groupBy('pasoId_pasoId'), function (datax, datay) {
                        var hijopaso = [];
                        var objPaso = {
                            "id": datay[0].rmdEstructuraPasoInsumoPasoId,
                            "rmdEstructuraId_rmdEstructuraId": datay[0].rmdEstructuraId_rmdEstructuraId,
                            "pasoId_pasoId": datay[0].pasoId_pasoId,
                            "codigo": datay[0].pasoId.codigo,
                            "decimales": datay[0].pasoId.decimales,
                            "descripcion": datay[0].pasoId.descripcion,
                            "margen": datay[0].pasoId.margen,
                            "numeracion": datay[0].pasoId.numeracion,
                            "tipoLapsoId_motivoLapsoId": datay[0].pasoId.tipoLapsoId_motivoLapsoId,
                            "usuarioActualiza": datay[0].pasoId.usuarioActualiza,
                            "usuarioRegistro": datay[0].pasoId.usuarioRegistro,
                            "valorFinal": datay[0].pasoId.valorFinal,
                            "valorInicial": datay[0].pasoId.valorInicial,
                            "orden": datay[0].orden,
                            "aplica": datay[0].aplica,
                            "vistoBueno": datay[0].vistoBuenoPaso === null ? false : datay[0].vistoBuenoPaso,
                            "vistoBuenoPaso": datay[0].vistoBuenoPaso === null ? false : datay[0].vistoBuenoPaso,
                            "usuarioActualiza": datay[0].usuarioActualiza,
                            "fechaActualizaPaso": datay[0].fechaActualizaPaso,
                            "etiquetaId_etiquetaId": datay[0].etiquetaId_etiquetaId,
                            "rmdEsEtiquetaId": y.rmdEsEtiquetaId,
                            "pasoHijo": []
                        };

                        $.each(datay, function (hijox, hijoy) {
                            var objHijoPaso = {
                                "estructura": "",
                            };

                            objHijoPaso.rmdEstructuraPasoInsumoPasoId = hijoy.rmdEstructuraPasoInsumoPasoId;
                            objHijoPaso.aplica = hijoy.aplica;
                            objHijoPaso.vistoBueno = hijoy.vistoBueno;
                            objHijoPaso.usuarioActualiza = hijoy.usuarioActualiza;
                            objHijoPaso.fechaActualizaPaso = hijoy.fechaActualiza;

                            if (hijoy.pasoHijoId) {
                                objHijoPaso.id = hijoy.pasoHijoId_pasoId;
                                objHijoPaso.estructura = "hijo";
                                objHijoPaso.decimales = hijoy.pasoHijoId.decimales;
                                objHijoPaso.codigo = hijoy.pasoHijoId.codigo;
                                objHijoPaso.descripcion = hijoy.pasoHijoId.descripcion;
                                objHijoPaso.fechaActualiza = hijoy.pasoHijoId.fechaActualiza;
                                objHijoPaso.estadoId_iMaestraId = hijoy.pasoHijoId.estadoId_iMaestraId;
                                objHijoPaso.margen = hijoy.pasoHijoId.margen;
                                objHijoPaso.numeracion = hijoy.pasoHijoId.numeracion;
                                objHijoPaso.valorFinal = hijoy.pasoHijoId.valorFinal;
                                objHijoPaso.valorInicial = hijoy.pasoHijoId.valorInicial;
                            } else if (hijoy.rmdEstructuraRecetaInsumoId) {
                                objHijoPaso.id = hijoy.rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId;
                                objHijoPaso.estructura = "receta";
                                objHijoPaso.cantidadReceta = hijoy.rmdEstructuraRecetaInsumoId.CompQty;
                                objHijoPaso.codigo = hijoy.rmdEstructuraRecetaInsumoId.Component;
                                objHijoPaso.descripcion = hijoy.rmdEstructuraRecetaInsumoId.Maktx;
                                objHijoPaso.fechaActualiza = hijoy.rmdEstructuraRecetaInsumoId.fechaActualiza;
                                objHijoPaso.numeroBultos = hijoy.rmdEstructuraRecetaInsumoId.numeroBultos;
                                objHijoPaso.orden = hijoy.rmdEstructuraRecetaInsumoId.Maktx;
                                objHijoPaso.sustituto = hijoy.rmdEstructuraRecetaInsumoId.sustituto;
                                objHijoPaso.um = hijoy.rmdEstructuraRecetaInsumoId.CompUnit;
                                objHijoPaso.valorFinal = hijoy.rmdEstructuraRecetaInsumoId.valorFinal;
                                objHijoPaso.valorInicial = hijoy.rmdEstructuraRecetaInsumoId.valorInicial;
                            }

                            hijopaso.push(objHijoPaso);
                        });

                        objPaso.pasoHijo = hijopaso;

                        paso.push(objPaso);
                    });
                    y.paso = paso;
                });

                var aEstructuraEtiqueta = [];

                $.each(aListObjectCase, function (x, y) {
                    var sobjectEstructuraCase = {};
                    var numEtiqueta = y.codigoEtiqueta.toString();
                    sobjectEstructuraCase.num = numEtiqueta + ".";
                    sobjectEstructuraCase.estructura = "etiqueta";
                    sobjectEstructuraCase.visible = false;
                    sobjectEstructuraCase.id = y.Id;
                    sobjectEstructuraCase.vistoBueno = y.vistoBueno === null ? false : y.vistoBueno;
                    sobjectEstructuraCase.rmdEstructuraId_rmdEstructuraId = y.rmdEstructuraId_rmdEstructuraId;
                    sobjectEstructuraCase.descripcion = y.descripcionEtiqueta;
                    aEstructuraEtiqueta.push(sobjectEstructuraCase);
                    $.each(y.paso, function (datax, datay) {
                        var sobjectEstructuraPasoCase = {};
                        var numEtiquetaPaso = numEtiqueta + "." + (parseInt(datax) + 1).toString();
                        sobjectEstructuraPasoCase.num = numEtiquetaPaso + ".";
                        sobjectEstructuraPasoCase.estructura = "paso";
                        sobjectEstructuraPasoCase.visible = true;
                        sobjectEstructuraPasoCase.id = datay.pasoId_pasoId;
                        sobjectEstructuraPasoCase.arrId = y.arrId;
                        sobjectEstructuraPasoCase.rmdEstructuraId_rmdEstructuraId = datay.rmdEstructuraId_rmdEstructuraId;
                        sobjectEstructuraPasoCase.descripcion = datay.descripcion;
                        sobjectEstructuraPasoCase.vistoBueno = datay.vistoBueno;
                        sobjectEstructuraPasoCase.vistoBuenoPaso = datay.vistoBuenoPaso;
                        sobjectEstructuraPasoCase.aplica = datay.aplica === null ? true : datay.aplica;
                        sobjectEstructuraPasoCase.etiquetaId = datay.etiquetaId_etiquetaId;
                        sobjectEstructuraPasoCase.rmdEsEtiquetaId = datay.rmdEsEtiquetaId;
                        sobjectEstructuraPasoCase.usuarioActualiza = datay.usuarioActualiza;
                        sobjectEstructuraPasoCase.fechaActualiza = datay.fechaActualiza;
                        aEstructuraEtiqueta.push(sobjectEstructuraPasoCase);
                        $.each(datay.pasoHijo, function (datahijox, datahijoy) {
                            var sobjectEstructuraHijoPasoCase = {};
                            var numEtiquetaHijoPaso = numEtiquetaPaso + "." + (parseInt(datahijox) + 1).toString();
                            sobjectEstructuraHijoPasoCase.num = numEtiquetaHijoPaso + ".";;
                            sobjectEstructuraHijoPasoCase.estructura = datahijoy.estructura;
                            sobjectEstructuraHijoPasoCase.visible = true;
                            sobjectEstructuraHijoPasoCase.id = datahijoy.id;
                            sobjectEstructuraHijoPasoCase.rmdEstructuraPasoInsumoPasoId = datahijoy.rmdEstructuraPasoInsumoPasoId;
                            sobjectEstructuraHijoPasoCase.descripcion = datahijoy.descripcion;
                            sobjectEstructuraHijoPasoCase.vistoBueno = datahijoy.vistoBueno;
                            sobjectEstructuraHijoPasoCase.aplica = datahijoy.aplica === null ? true : datahijoy.aplica;
                            sobjectEstructuraHijoPasoCase.rmdEstructuraId_rmdEstructuraId = datay.rmdEstructuraId_rmdEstructuraId;
                            sobjectEstructuraHijoPasoCase.usuarioActualiza = datahijoy.usuarioActualiza;
                            sobjectEstructuraHijoPasoCase.fechaActualiza = datahijoy.fechaActualizaPaso;
                            aEstructuraEtiqueta.push(sobjectEstructuraHijoPasoCase);
                        });
                    });
                });

                $.each(aEstructuraEtiqueta, function (x, y) {
                    var tListInsumoHistorico = [];
                    if (y.estructura == "paso") {
                        tListInsumoHistorico = aListPasoHistorico.results.filter(item => item.pasoId_pasoId === y.id && item.rmdEstructuraId_rmdEstructuraId === y.rmdEstructuraId_rmdEstructuraId);
                    } else if (y.estructura == "receta") {
                        tListInsumoHistorico = aListPasoHistorico.results.filter(item => item.rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId === y.id && item.rmdEstructuraId_rmdEstructuraId === y.rmdEstructuraId_rmdEstructuraId);
                    } else if (y.estructura == "hijo") {
                        tListInsumoHistorico = aListPasoHistorico.results.filter(item => item.pasoHijoId_pasoId === y.id && item.rmdEstructuraId_rmdEstructuraId === y.rmdEstructuraId_rmdEstructuraId);
                    }

                    var tUltimoListInsumoHistorico = {};

                    if (tListInsumoHistorico.length > 0) {
                        tListInsumoHistorico.sort((a, b) => a.fechaRegistro.getTime() - b.fechaRegistro.getTime());
                        tUltimoListInsumoHistorico = tListInsumoHistorico[tListInsumoHistorico.length - 1];
                    }
                    y.historico = tListInsumoHistorico;
                    y.ultimaAccion = tUltimoListInsumoHistorico;
                });

                oThat.modelGeneral.setProperty(model, aEstructuraEtiqueta);

            },

            getPasos: function (aListPaso, aListPasoHistorico, model) {
                var aListObjectCase = [];
                aListPaso.results = aListPaso.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                aListPaso.results.forEach(e => {
                    var sobjectCase = {}
                    sobjectCase.oPaso = e;
                    sobjectCase.formato = e.formato === null ? false : e.formato;
                    sobjectCase.imagen = e.imagen === null ? false : e.imagen;
                    sobjectCase.pasoId = e.rmdEstructuraPasoId;
                    sobjectCase.description = e.pasoId.descripcion;
                    sobjectCase.margen = e.margen;
                    sobjectCase.decimales = e.decimales;
                    sobjectCase.fechaActualiza = e.fechaActualiza;
                    sobjectCase.usuarioActualiza = e.usuarioActualiza;
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = e.rmdEstructuraId_rmdEstructuraId;
                    sobjectCase.tipodato = e.tipoDatoId_iMaestraId;
                    sobjectCase.depende = e.depende;
                    sobjectCase.estadoCC = e.estadoCC;
                    sobjectCase.valorInicial = e.valorInicial;
                    sobjectCase.valorFinal = e.valorFinal;
                    sobjectCase.styleUser = e.styleUser;
                    sobjectCase.rmdId_rmdId = e.rmdId_rmdId;
                    aListObjectCase.push(sobjectCase);
                });

                oThat.modelGeneral.setProperty(model, aListObjectCase);
            },

            getEquipos: function (aListEquipo, aListUtensilio, aListInsumoHistorico, aListTipo, model) {
                var aListObjectCase = [];
                var date = new Date();
                var time = date.getTime();
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MM-YYYY HH:MM" });
                aListEquipo.results.sort((a, b) => a.orden - b.orden);

                aListEquipo.results.forEach(eq => {
                    var sobjectCase = {}
                    sobjectCase.Id = eq.rmdEstructuraEquipoId;
                    sobjectCase.tipoId_iMaestraId = "";
                    sobjectCase.description = "";
                    sobjectCase.code = "";
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = eq.rmdEstructuraId_rmdEstructuraId;
                    sobjectCase.equipoId = eq.equipoId_equipoId;
                    var stateCalibracion = "None";
                    if (eq.equipoId) {
                        sobjectCase.tipoId_iMaestraId = eq.equipoId.tipoId_iMaestraId;
                        sobjectCase.description = eq.equipoId.eqktx;
                        sobjectCase.code = eq.equipoId.equnr;
                        sobjectCase.dateCalibracion = dateFormat.format(new Date(eq.equipoId.gstrp));
                        sobjectCase.descCalibracion = eq.equipoId.ktext;
                        if (eq.equipoId.gstrp.getTime() >= time) {
                            stateCalibracion = "Success";
                        } else {
                            stateCalibracion = 'Error';
                        }
                        sobjectCase.stateCalibracion = stateCalibracion;
                    }
                    sobjectCase.vistoBueno = eq.vistoBueno;
                    sobjectCase.aplica = eq.aplica === null ? true : eq.aplica;
                    sobjectCase.tipo = "EQUIPO";
                    sobjectCase.descriptionTipo = "";
                    sobjectCase.usuarioActualiza = eq.usuarioActualiza;

                    var tListInsumoHistorico = aListInsumoHistorico.results.filter(item => item.rmdEstructuraEquipoId_rmdEstructuraEquipoId === eq.rmdEstructuraEquipoId && item.rmdEstructuraId_rmdEstructuraId === eq.rmdEstructuraId_rmdEstructuraId);


                    var tUltimoListInsumoHistorico = {};

                    if (tListInsumoHistorico.length > 0) {
                        tListInsumoHistorico.sort((a, b) => a.fechaRegistro.getTime() - b.fechaRegistro.getTime());
                        tUltimoListInsumoHistorico = tListInsumoHistorico[tListInsumoHistorico.length - 1];
                    }

                    sobjectCase.historico = tListInsumoHistorico;
                    sobjectCase.ultimaAccion = tUltimoListInsumoHistorico;

                    aListObjectCase.push(sobjectCase);
                });

                aListUtensilio.results.sort((a, b) => a.orden - b.orden);

                aListUtensilio.results.forEach(u => {
                    var sobjectCase = {}
                    sobjectCase.Id = u.rmdEstructuraUtensilioId;
                    sobjectCase.tipoId_iMaestraId = "";
                    sobjectCase.description = "";
                    sobjectCase.code = "";
                    sobjectCase.rmdEstructuraId_rmdEstructuraId = u.rmdEstructuraId_rmdEstructuraId;
                    if (u.utensilioId) {
                        sobjectCase.tipoId_iMaestraId = u.utensilioId.tipoId_iMaestraId;
                        sobjectCase.description = u.utensilioId.descripcion;
                        sobjectCase.code = u.utensilioId.codigo;
                    }
                    sobjectCase.vistoBueno = u.vistoBueno;
                    sobjectCase.tipo = "UTENSILIO";
                    sobjectCase.descriptionTipo = "";
                    sobjectCase.usuarioActualiza = u.usuarioActualiza;
                    sobjectCase.aplica = u.aplica;


                    var tListInsumoHistorico = [];

                    var tUltimoListInsumoHistorico = {};

                    if (tListInsumoHistorico.length > 0) {
                        tListInsumoHistorico.sort((a, b) => a.fechaRegistro.getTime() - b.fechaRegistro.getTime());
                        tUltimoListInsumoHistorico = tListInsumoHistorico[tListInsumoHistorico.length - 1];
                    }

                    sobjectCase.historico = tListInsumoHistorico;
                    sobjectCase.ultimaAccion = tUltimoListInsumoHistorico;

                    aListObjectCase.push(sobjectCase);
                });


                aListTipo.results.forEach(val => {
                    aListObjectCase.forEach(eq => {
                        if (val.iMaestraId == eq.tipoId_iMaestraId) {
                            eq.descriptionTipo = val.contenido;
                        }
                    });
                });

                oThat.modelGeneral.setProperty(model, aListObjectCase);
            },

            onCancelMds: function (sobject) {
                oThat.onMds.close();
            },

            setUpdateRmd: async function (sobject) {
                var sUpdate = await registroService.updateStatusRmd(oThat.mainModelv2, "/RMD", sobject);
            },

            setUpdateRmdTest: async function (sobject) {                
                var sUpdate = await registroService.updateStatusRmd(oThat.mainModelv2, "/RMD", sobject);                                
            },

            onGetUsers: async function () {
                BusyIndicator.show(0);
                let oFilterUser = [];
                let oFilterCalificadoUser = [];
                let oFilterUserRol = [];
                let LineaActualMD = oThat.modelGeneral.getProperty("/LineaActualMD");

                oFilterUser.push(new Filter("rmdId_rmdId", FilterOperator.EQ, LineaActualMD.rmdId));
                oFilterUser.push(new Filter("rol", FilterOperator.EQ, "AUXILIAR"));
                oFilterCalificadoUser.push(new Filter("oMaestraNivel", FilterOperator.Contains, LineaActualMD.nivelTxt));
                oFilterUserRol.push(new Filter("oRol_rolId", FilterOperator.EQ, idRolAuxiliar));

                let aListUserRMD = await registroService.getDataFilter(oThat.mainModelv2, "/RMD_USUARIO", oFilterUser);

                let aListUserAbapFilter = await registroService.getDataFilter(oThat.mainModelv2, "/USUARIO", oFilterCalificadoUser);
                let aListUserAbap = {results: []};

                for await (const oUsuarioSystem of this.aUsuarioSystem.results) {
                    let oUsuarioFind = aListUserAbapFilter.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId);
                    if (oUsuarioFind) {
                        aListUserAbap.results.push(oUsuarioFind);
                    }
                }

                let sExpand = "oRol";
                let aListUsersRol = await registroService.getDataExpand(oThat.mainModelv2, "/UsuarioRol", sExpand, oFilterUserRol);
                let oUserFilterSystem = aListUsersRol.results.filter(item=>item.oRol.oSistema_sistemaId === sSistemaRMD);

                let aListUserABAP = [];

                aListUserAbap.results.forEach(element => {
                    let ofindRMD = aListUserRMD.results.find(item => item.codigo === element.usuario);

                    if (!ofindRMD) {
                        aListUserABAP.push(element);
                    }
                });

                let aListUserAbapRolAux = [];

                aListUserABAP.forEach(element => {
                    let ofindRol = oUserFilterSystem.find(item => item.oUsuario_usuarioId === element.usuarioId)

                    if (ofindRol) {
                        aListUserAbapRolAux.push(element);
                    }
                });
                
                oThat.modelGeneral.setProperty("/usuariosRmd", aListUserRMD.results);
                oThat.modelGeneral.setProperty("/usuariosAbap", aListUserAbapRolAux);

                oThat.modelGeneral.refresh(true);
                BusyIndicator.hide();
            },

            onAssignUser: function (oEvent) {
                var LineaActual = oEvent.getSource().getBindingContext("modelGeneral").getObject();
                oThat.modelGeneral.setProperty("/LineaActualMD", LineaActual);

                oThat.onGetUsers();
                if (!this.onListUser) {
                    this.onListUser = sap.ui.xmlfragment(
                        "frgListUser",
                        sRootPath + ".view.dialog.ListUserAssign",
                        this
                    );
                    this.getView().addDependent(this.onListUser);
                }
                this.onListUser.open();

                sap.ui.core.Fragment.byId("frgListUser", "idtableUserRmd").removeSelections(true);
            },

            onRefreshUsers: function () {
                oThat.onGetUsers();
            },

            onSearchUsers: function (oEvent) {
                var filtroTablaUser = [];
                var sQuery = oEvent.getParameter("query");
                var oDataFilter = this.getView().getModel("oDataFilter");
                var aFilter = [];
                if (oDataFilter.getData().code) {
                    aFilter.push(
                        new Filter(
                            "usuario",
                            FilterOperator.Contains,
                            oDataFilter.getData().code
                        )
                    );
                }
                if (oDataFilter.getData().name) {
                    aFilter.push(
                        new Filter(
                            "nombre",
                            FilterOperator.Contains,
                            oDataFilter.getData().name
                        )
                    );
                }
                if (oDataFilter.getData().planta) {
                    aFilter.push(
                        new Filter(
                            "oMaestraSucursal_codigo",
                            FilterOperator.EQ,
                            parseInt(oDataFilter.getData().planta)
                        )
                    );
                }
                if (oDataFilter.getData().area) {
                    aFilter.push(
                        new Filter(
                            "seccionTxt",
                            FilterOperator.Contains,
                            oDataFilter.getData().area
                        )
                    );
                }

                var tablaUser = sap.ui.core.Fragment.byId("frgAddUser", "idTableUsersABAP");
                var binding = tablaUser.getBinding("items");
                binding.filter(aFilter);

                oThat.modelGeneral.refresh(true);
            },

            onAddUsers: async function () {
                BusyIndicator.show(0);
                var table = sap.ui.core.Fragment.byId("frgAddUser", "idTableUsersABAP");
                var rowItems = table.getSelectedItems();
                var aObject = {};
                var aObjectList = [];
                var LineaActualRMD = oThat.modelGeneral.getProperty("/LineaActualRMD");
                var LineaActualMD = oThat.modelGeneral.getProperty("/LineaActualMD");

                if (rowItems.length === 0) {
                    MessageBox.warning("Debe seleccionar al menos un auxiliar.");
                    BusyIndicator.hide();
                    return;
                }
                let aFilters = [];
                aFilters.push(new Filter("ordenSAP", "EQ", LineaActualRMD.Aufnr));
                let oResponseRMD = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", aFilters);
                if (oResponseRMD.results.length !== 0) {
                    LineaActualMD.rmdId = oResponseRMD.results[0].rmdId;
                }
                if (LineaActualMD.rmdId === "") {
                    aObject.terminal = null;
                    aObject.usuarioRegistro = oInfoUsuario.data.usuario;
                    aObject.fechaRegistro = new Date();
                    aObject.activo = true;
                    aObject.rmdId = util.onGetUUIDV4();
                    aObject.ordenSAP = LineaActualRMD.Aufnr;
                    aObject.centro = LineaActualRMD.Pwerk;
                    aObject.etapa = LineaActualRMD.Dauat;
                    aObject.vte = LineaActualRMD.vte
                    aObject.productoId = LineaActualRMD.Matnr;
                    aObject.descripcion = LineaActualRMD.Text1;
                    aObject.lote = LineaActualRMD.Charg;
                    aObject.loteProv = LineaActualRMD.LoteProv;
                    aObject.loteAnt = LineaActualRMD.LoteAntiguo;
                    aObject.fechaInicio = new Date();
                    aObject.expira = LineaActualRMD.VfdatBTP;
                    aObject.mdId_mdId = LineaActualMD.mdId;
                    aObject.estadoIdOP = LineaActualRMD.estadoIdOP;
                    aObject.areaRmdTxt = LineaActualMD.areaRmdTxt;
                    aObject.aUsuarioRmd = [];
                    aObject.fraccion = 1;
                    aObject.dauart = LineaActualRMD.Dauat;
                    aObject.lgort = LineaActualRMD.Lgort;
                    aObject.posnr = LineaActualRMD.Posnr;
                    aObject.stats = LineaActualRMD.Stats;
                    aObject.verid = LineaActualRMD.Verid;
                    if (LineaActualRMD.Vfdat !== null) {
                        LineaActualRMD.VfdatBTP = LineaActualRMD.Vfdat;
                        aObject.vfdat = LineaActualRMD.VfdatBTP;
                    }
                    aObject.vfmng = LineaActualRMD.Vfmng;
                    aObject.Sbmng = LineaActualRMD.Sbmng;
                    aObject.Sbmeh = LineaActualRMD.Sbmeh;
                    aObject.Amein = LineaActualRMD.Amein;
                    aObject.Psmng = LineaActualRMD.Psmng;
                    aObject.Umrez1 = LineaActualRMD.Umrez1;
                    aObject.Umrez2 = LineaActualRMD.Umrez2;
                    for (var i = 0; i < rowItems.length; i++) {
                        let infoUser = rowItems[i].getBindingContext("modelGeneral").getObject();
                        var v_user = {};
                        v_user.terminal = null;
                        v_user.usuarioRegistro = oInfoUsuario.data.usuario;
                        v_user.fechaRegistro = new Date();
                        v_user.activo = true;
                        v_user.rmdUsuarioId = util.onGetUUIDV4();
                        v_user.rmdId_rmdId = aObject.rmdId;
                        v_user.codigo = rowItems[i].mAggregations.cells[0].getProperty("text");
                        v_user.nombre = rowItems[i].mAggregations.cells[1].getProperty("text");
                        v_user.rol = "AUXILIAR";
                        v_user.usuarioId_usuarioId = infoUser.usuarioId;
                        v_user.bReemplazo = infoUser.bReemplazo? infoUser.bReemplazo : false;
                        aObject.aUsuarioRmd.push(v_user)
                    }
                    registroService.createData(oThat.mainModelv2, "/RMD", aObject).then(function () {
                        oThat.modelGeneral.setProperty("/LineaActualMD/rmdId", aObject.rmdId);
                        oThat.onAddUser.close();
                        oThat.onGetUsers();
                        oThat.onMdList(LineaActualRMD);
                        BusyIndicator.hide();
                        MessageBox.success("Se registraron correctamente los usuarios seleccionados.")
                    }.bind(oThat), function (error) {
                        MessageBox.error("Ocurrió un error al registrar los usuarios seleccionados.");
                        BusyIndicator.hide();
                    });
                } else {
                    let aFilter = [];
                    aFilter.push(new Filter("rmdId_rmdId", "EQ", LineaActualMD.rmdId));
                    let aListUserRMD = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_USUARIO", aFilter);
                    for (var i = 0; i < rowItems.length; i++) {
                        let infoUser = rowItems[i].getBindingContext("modelGeneral").getObject();
                        let bExisteUser = aListUserRMD.results.find(itm=>itm.usuarioId_usuarioId === infoUser.usuarioId);
                        if (!bExisteUser){
                            var v_user = {};
                            v_user.terminal = null;
                            v_user.usuarioRegistro = oInfoUsuario.data.usuario;
                            v_user.fechaRegistro = new Date();
                            v_user.activo = true;
                            v_user.rmdUsuarioId = util.onGetUUIDV4();
                            v_user.rmdId_rmdId = LineaActualMD.rmdId;
                            v_user.codigo = rowItems[i].mAggregations.cells[0].getProperty("text");
                            v_user.nombre = rowItems[i].mAggregations.cells[1].getProperty("text");
                            v_user.rol = "AUXILIAR";
                            v_user.usuarioId_usuarioId = infoUser.usuarioId;
                            v_user.bReemplazo = infoUser.bReemplazo? infoUser.bReemplazo : false;
                            aObjectList.push(v_user)
                        }
                    }

                    registroService.createMultipleUsersFunction(oThat.mainModelv2, aObjectList).then(function () {
                        oThat.onAddUser.close();
                        oThat.onMdList(LineaActualRMD);
                        oThat.onGetUsers();
                        BusyIndicator.hide();
                        MessageBox.success("Se registraron correctamente los usuarios seleccionados.")
                    }.bind(oThat), function (error) {
                        MessageBox.error("Ocurrió un error al registrar los usuarios seleccionados.");
                        BusyIndicator.hide();
                    });
                }
            },

            onDeleteUsers: async function () {
                var table = sap.ui.core.Fragment.byId("frgListUser", "idtableUserRmd");
                var rowItems = table.getSelectedItems();

                if (rowItems.length === 0) {
                    MessageBox.warning("Debe seleccionar al menos un usuario asignado.");
                    return;
                }
                BusyIndicator.show(0);
                for (var i = 0; i < rowItems.length; i++) {
                    var sobject = {};
                    var linea = rowItems[i].getBindingContext("modelGeneral").getObject();

                    sobject.activo = false;
                    sobject.fechaActualiza = new Date();
                    sobject.usuarioActualiza = oInfoUsuario.data.usuario;
                    sobject.rmdUsuarioId = linea.rmdUsuarioId;

                    await registroService.updateUserMrd(oThat.mainModelv2, "/RMD_USUARIO", sobject);
                }

                oThat.onListUser.close();
                oThat.onOrdenesABAP();
                MessageBox.success("Se eliminaron correctamente los usuarios seleccionados.");
                BusyIndicator.hide();
            },

            onCancelListUser: function () {
                this.onListUser.close();
            },

            onAddUserToAssign: function () {
                if (!this.onAddUser) {
                    this.onAddUser = sap.ui.xmlfragment(
                        "frgAddUser",
                        sRootPath + ".view.dialog.AssignUser",
                        this
                    );
                    this.getView().addDependent(this.onAddUser);
                }
                this.onGetAreaOdata("/aListaSecciones");
                this.onAddUser.open();
                sap.ui.core.Fragment.byId("frgAddUser", "idTableUsersABAP").removeSelections(true);
            },

            onGetAreaOdata: async function (modelo) {
                BusyIndicator.show(0);
                let aFilters = [];
                aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
                let oResponse = await registroService.onGetDataGeneralFilters(this.modelNecesidad, "CaracteristicasSet", aFilters);
                this.modelGeneral.setProperty(modelo, oResponse.results);
                BusyIndicator.hide();
            },

            onCancelAddUser: function () {
                this.onAddUser.close();
            },

            onAssignCorrect: function () {
                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("successAssignUser"));
            },

            onDeleteUser: function () {
                this.onCancelListUser();
                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("successDeleteUser"));
            },

            onGetPdfViewerOpp: function () {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var sTitle = oBundle.getText("tltPdfOpp");
                var LineaActual = oThat.modelGeneral.getProperty("/LineaActualRMD");
                var base64EncodedPDF = LineaActual.Pdf64;

                var decodedPdfContent = atob(base64EncodedPDF);
                var byteArray = new Uint8Array(decodedPdfContent.length)
                for (var i = 0; i < decodedPdfContent.length; i++) {
                    byteArray[i] = decodedPdfContent.charCodeAt(i);
                }
                var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                var _pdfurl = URL.createObjectURL(blob);

                this._PDFViewer = new sap.m.PDFViewer({
                    title: sTitle,
                    width: "auto",
                    source: _pdfurl // my blob url
                });
                jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                this._PDFViewer.open();
            },

            onCancelPDFViewerOpp: function () {
                this.onPdfViewerOpp.close();
            },

            onGenerateReProcess: function (oEvent) {
                try {
                    let lineaSeleccionada = oEvent.getSource().getBindingContext("modelGeneral").getObject();
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("confirmReprocess"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show(0);
                                let aFilter = [];
                                aFilter.push(new Filter("rmdId", "EQ", lineaSeleccionada.rmdId));
                                let sExpand = "aUsuarioRmd"
                                let aRMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD", aFilter, sExpand);
                                let oRMD = aRMD.results[0];
                                let fechaExpira;
                                oRMD.VfdatBTP = null;
                                if (oRMD.Vfdat !== null) {
                                    oRMD.VfdatBTP = oRMD.Vfdat;
                                }
                                let oParam = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdId: util.onGetUUIDV4(),
                                    fraccion: 1,
                                    codigo: oRMD.codigo,
                                    ordenSAP: oRMD.ordenSAP,
                                    centro: oRMD.centro,
                                    etapa: oRMD.etapa,
                                    vte: oRMD.vte,
                                    productoId: oRMD.productoId,
                                    descripcion: oRMD.descripcion + "(Reproceso)",
                                    lote: oRMD.lote,
                                    expira: oRMD.expira,
                                    estadoIdOP: oRMD.estadoIdOP,
                                    mdId_mdId: oRMD.mdId_mdId,
                                    estadoIdRmd_iMaestraId: idEstadoHabilitado,
                                    fechaInicio: new Date(),
                                    dauart: oRMD.Dauat,
                                    lgort: oRMD.lgort,
                                    posnr: oRMD.posnr,
                                    stats: oRMD.stats,
                                    verid: oRMD.verid,
                                    vfdat: oRMD.vfdat,
                                    vfmng: oRMD.vfmng,
                                    Sbmng: oRMD.Sbmng,
                                    Sbmeh: oRMD.Sbmeh,
                                    Amein: oRMD.Amein,
                                    Psmng: oRMD.Psmng,
                                    Umrez1: oRMD.Umrez1,
                                    Umrez2: oRMD.Umrez2,
                                    aUsuarioRmd: []
                                }
                                for await (const oUsuario of oRMD.aUsuarioRmd.results) {
                                    let aFiterAdmin = [];
                                    aFiterAdmin.push(new Filter("usuarioId", "EQ", oUsuario.usuarioId_usuarioId));
                                    aFiterAdmin.push(new Filter("activo", "EQ", true));
                                    let aUserAdminResponseFilter = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", aFiterAdmin);

                                    if (aUserAdminResponseFilter.results.length > 0) {
                                        let oObjUsuario = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            rmdUsuarioId: util.onGetUUIDV4(),
                                            rmdId_rmdId: oParam.rmdId,
                                            codigo: oUsuario.codigo,
                                            nombre: oUsuario.nombre,
                                            rol: oUsuario.rol,
                                            usuarioId_usuarioId: oUsuario.usuarioId_usuarioId
                                        }
                                        oParam.aUsuarioRmd.push(oObjUsuario);
                                    }
                                }
                                await registroService.createData(oThat.mainModelv2, "/RMD", oParam);
                                await oThat.createEstructura(lineaSeleccionada, oParam, oParam.fraccion);
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("successReprocess"));
                            }
                        }
                    });
                } catch (oError) {
                    BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGenerateParcial: function (oEvent) {
                try {
                    let lineaSeleccionada = oEvent.getSource().getBindingContext("modelGeneral").getObject();
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("confirmParcial"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show(0);
                                let aFilter = [];
                                aFilter.push(new Filter("rmdId", "EQ", lineaSeleccionada.rmdId));
                                let sExpand = "aUsuarioRmd"
                                let aRMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD", aFilter, sExpand);
                                let oRMD = aRMD.results[0];
                                let fechaExpira;
                                oRMD.VfdatBTP = null;
                                if (oRMD.Vfdat !== null) {
                                    oRMD.VfdatBTP = oRMD.Vfdat;
                                }
                                let oParam = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdId: util.onGetUUIDV4(),
                                    fraccion: 1,
                                    codigo: oRMD.codigo,
                                    ordenSAP: oRMD.ordenSAP,
                                    centro: oRMD.centro,
                                    etapa: oRMD.etapa,
                                    vte: oRMD.vte,
                                    productoId: oRMD.productoId,
                                    descripcion: oRMD.descripcion,
                                    lote: oRMD.lote,
                                    expira: oRMD.expira,
                                    estadoIdOP: oRMD.estadoIdOP,
                                    mdId_mdId: oRMD.mdId_mdId,
                                    estadoIdRmd_iMaestraId: idEstadoHabilitado,
                                    fechaInicio: new Date(),
                                    dauart: oRMD.Dauat,
                                    lgort: oRMD.lgort,
                                    posnr: oRMD.posnr,
                                    stats: oRMD.stats,
                                    verid: oRMD.verid,
                                    vfdat: oRMD.vfdat,
                                    vfmng: oRMD.vfmng,
                                    Sbmng: oRMD.Sbmng,
                                    Sbmeh: oRMD.Sbmeh,
                                    Amein: oRMD.Amein,
                                    Psmng: oRMD.Psmng,
                                    Umrez1: oRMD.Umrez1,
                                    Umrez2: oRMD.Umrez2,
                                    aUsuarioRmd: []
                                }
                                for await (const oUsuario of oRMD.aUsuarioRmd.results) {
                                    let aFiterAdmin = [];
                                    aFiterAdmin.push(new Filter("usuarioId", "EQ", oUsuario.usuarioId_usuarioId));
                                    aFiterAdmin.push(new Filter("activo", "EQ", true));
                                    let aUserAdminResponseFilter = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", aFiterAdmin);

                                    if (aUserAdminResponseFilter.results.length > 0) {
                                        let oObjUsuario = {
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            fechaRegistro: new Date(),
                                            activo: true,
                                            rmdUsuarioId: util.onGetUUIDV4(),
                                            rmdId_rmdId: oParam.rmdId,
                                            codigo: oUsuario.codigo,
                                            nombre: oUsuario.nombre,
                                            rol: oUsuario.rol,
                                            usuarioId_usuarioId: oUsuario.usuarioId_usuarioId
                                        }
                                        oParam.aUsuarioRmd.push(oObjUsuario);
                                    }
                                }
                                await registroService.createData(oThat.mainModelv2, "/RMD", oParam);
                                await oThat.createEstructura(lineaSeleccionada, oParam, oParam.fraccion);
                                BusyIndicator.hide();
                                MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("successParcial"));
                            }
                        }
                    });
                } catch (oError) {
                    BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onListFraction: async function () {
                var oFilterMd = [],
                    oFilterRmd = [];

                oThat.onMds.close();

                var LineaActual = oThat.modelGeneral.getProperty("/LineaActualMD");

                oFilterRmd.push(new Filter("rmdId", FilterOperator.EQ, LineaActual.rmdId));
                let aListRMD = await registroService.getDataFilter(oThat.mainModelv2, "/RMD", oFilterRmd);
                let sUltimaFraccion = aListRMD.results[0].fraccion;


                if (sUltimaFraccion > 1) {
                    let aListFracciones = [];
                    for (let i = 0; i < sUltimaFraccion; i++) {
                        let obj = {
                            rmdId : LineaActual.rmdId,
                            fraccion : i + 1
                        }
                        aListFracciones.push(obj);
                    }
                    oThat.modelGeneral.setProperty("/cmbFraction", aListFracciones);

                    if (!this.onFraction) {
                        this.onFraction = sap.ui.xmlfragment(
                            "frgFraction",
                            sRootPath + ".view.dialog.ListFraction",
                            this
                        );
                        this.getView().addDependent(this.onFraction);
                    }

                    this.onFraction.open();
                } else {
                    oThat.onMds.close();
                    BusyIndicator.show(0);
                    await oThat.getEstructurasRmdRefactory(1);
                    BusyIndicator.hide();
                    oThat.onRouteDetailView();
                }

            },

            onCancelFraction: function () {
                this.onFraction.close();
            },

            onSelectFraccion: function (oEvent) {
                let oSource = oEvent.getSource();
                let selectItem = oSource.getSelectedItem();
                let value = oSource.getValue();
                if (value) {
                    if (!selectItem) {
                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("errorRmdSelected"));
                        oSource.setValue("");
                        oThat.modelGeneral.setProperty("/selectFraccionRmdId", "");
                        oThat.modelGeneral.refresh(true);
                        return;
                    }

                    if (selectItem.getKey() == "") {
                        oThat.modelGeneral.setProperty("/selectFraccionRmdId", "");
                    } else {
                        oThat.modelGeneral.setProperty("/selectFraccionRmdId", value);
                    }
                }

            },

            onConfirmFraction: async function () {
                let selectFraccion = oThat.modelGeneral.getProperty("/selectFraccionRmdId");
                BusyIndicator.show(0);
                await oThat.getEstructurasRmdRefactory(parseInt(selectFraccion));
                BusyIndicator.hide();
                oThat.onRouteDetailView();
            },
            
            setEstructurasRmdProcesos: async function (LineaActual) {
                var oFilter = [];

                oFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, LineaActual.mdId));

                var aListEstructura = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ESTRUCTURA", oFilter);
                var aListPaso = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_PASO", oFilter);
                var aListEquipo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_EQUIPO", oFilter);
                var aListUtensilio = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_UTENSILIO", oFilter);
                var aListEspecificacion = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_ESPECIFICACION", oFilter);
                var aListReceta = await registroService.getDataFilter(oThat.mainModelv2, "/MD_RECETA", oFilter);
                var aListInsumo = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_RE_INSUMO", oFilter);
                var aListEtiqueta = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_ETIQUETA", oFilter);
                var aListPasoInsumoPaso = await registroService.getDataFilter(oThat.mainModelv2, "/MD_ES_PASO_INSUMO_PASO", oFilter);

                var sobject = {};
                sobject.terminal = null;
                sobject.usuarioRegistro = oInfoUsuario.data.usuario;
                sobject.fechaRegistro = new Date();
                sobject.activo = true;
                sobject.aEstructura = [];
                sobject.aPaso = [];
                sobject.aEquipo = [];
                sobject.aUtensilio = [];
                sobject.aEspecificacion = [];
                sobject.aReceta = [];
                sobject.aInsumo = [];
                sobject.aEtiqueta = [];
                sobject.aPasoInsumoPaso = [];
                sobject.Id = util.onGetUUIDV4();

                aListEstructura.results.forEach(element => {

                    var tListPaso = aListPaso.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEquipo = aListEquipo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListUtensilio = aListUtensilio.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEspecificacion = aListEspecificacion.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListInsumo = aListInsumo.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListEtiqueta = aListEtiqueta.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);
                    var tListPasoInsumoPaso = aListPasoInsumoPaso.results.filter(item => item.mdId_mdId === element.mdId_mdId && item.estructuraId_estructuraId === element.estructuraId_estructuraId);


                    delete element["mdEstructuraId"];
                    delete element["estructuraId"];
                    delete element["mdId"];
                    delete element["mdId_mdId"];
                    delete element["__metadata"];

                    var sobjectEs = element;
                    sobjectEs.terminal = null;
                    sobjectEs.fechaActualiza = null;
                    sobjectEs.usuarioActualiza = null;
                    sobjectEs.usuarioRegistro = oInfoUsuario.data.usuario;
                    sobjectEs.fechaRegistro = new Date();
                    sobjectEs.activo = true;

                    sobjectEs.rmdEstructuraId = "b0686a97-7fa4-4b6a-9e77-da37a97e503f";
                    sobjectEs.rmdId_rmdId = LineaActual.rmdId;

                    sobject.aEstructura = [];
                });

                registroService.createData(oThat.mainModelv2, "/RMD_ESTRUCTURA_SKIP", sobject).then(function () {
                    oThat.getEstructurasRmd(LineaActual);
                }.bind(oThat), function (error) {
                    MessageBox.error("Ocurrió un error al registrar las estructuras RMD seleccionados.");
                    BusyIndicator.hide();
                });
            },
            _groupBy: function (array, groups, valueKey) {
                var map = new Map;
                groups = [].concat(groups);
                return array.reduce((r, o) => {
                    groups.reduce((m, k, i, {
                        length
                    }) => {
                        var child;
                        if (m.has(o[k])) return m.get(o[k]);
                        if (i + 1 === length) {
                            child = Object.assign(...groups.map(k => ({
                                [k]: o[k]
                            })), {
                                [valueKey]: 0
                            });
                            r.push(child);
                        } else {
                            child = new Map;
                        }
                        m.set(o[k], child);
                        return child;
                    }, map)[valueKey] += +o[valueKey];
                    return r;
                }, [])
            },
            onGetRmd: function (rmdId) {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oFilterRmd = [];
                    oFilterRmd.push(new Filter("rmdId", FilterOperator.EQ, rmdId));
                    let sExpand = "mdId/estadoIdRmd,aReceta/recetaId,aEstructura/estructuraId,aEstructura/aEquipo/equipoId,aEstructura/aPaso/pasoId,aEstructura/aUtensilio/utensilioId,aEstructura/aEspecificacion/ensayoPadreId,aEstructura/aInsumo,aEstructura/aEtiqueta/etiquetaId,aEstructura/aPasoInsumoPaso/pasoHijoId,aEstructura/aPasoInsumoPaso/rmdEstructuraRecetaInsumoId";
                    registroService.getDataExpand(oThat.mainModelv2, "/RMD", sExpand, oFilterRmd).then(async function (oListRMD) {
                        resolve(oListRMD);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },
            onDownloadPdfRmd: async function(oEvent){
                oThat.onGetPdfViewerRmo(oEvent, true);
            },
            
            onGetPdfViewerRmo: function (oEvent, descargarPDF) {
                oThat.oSelectedObject = oEvent.getSource().getBindingContext("modelGeneral").getObject();
                let arrayFind = [];

                Promise.all([this.onGetRmd(oThat.oSelectedObject.rmdId)]).then( async function(value) {
                    var oDataSeleccionada = value[0].results[0].aEstructura;
                    if (!value[0].results[0].loteAnt) {
                        if (!value[0].results[0].loteProv) {
                            value[0].results[0].loteVistaRMD = ' ';
                        } else {
                            value[0].results[0].loteVistaRMD = value[0].results[0].loteProv;
                        }
                    } else {
                        value[0].results[0].loteVistaRMD = value[0].results[0].loteAnt;
                    }
                    let sMaterial = value[0].results[0].productoId;
                    let sVersion = value[0].results[0].verid;
                    let aRecetaSelected = value[0].results[0].aReceta.results.filter(itm=>itm.recetaId.Matnr === sMaterial && itm.recetaId.Verid === sVersion);
                    if(oDataSeleccionada.results.length > 0){
                        var especificacionEstructura = oDataSeleccionada.results.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sTipoEstructuraEspecificaciones);
                        if(especificacionEstructura){
                            if(especificacionEstructura.aEspecificacion.results.length > 0){
                                let existeSap = especificacionEstructura.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP !== null).length > 0 ? true : false;
                                let noExisteSap = especificacionEstructura.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP === null).length > 0 ? true : false;
                                if (noExisteSap && !existeSap) {
                                    await especificacionEstructura.aEspecificacion.results.sort((a, b) => {
                                        return (
                                            a.fechaRegistro - b.fechaRegistro
                                        );
                                    });
                                } else if (existeSap && !noExisteSap) {
                                    await especificacionEstructura.aEspecificacion.results.sort((a, b) => {
                                        return (
                                            a.Merknr - b.Merknr
                                        );
                                    });
                                } else if (existeSap && noExisteSap) {
                                    await especificacionEstructura.aEspecificacion.results.sort((a, b) => {
                                        return (
                                            a.Merknr - b.Merknr &&
                                            a.fechaRegistro - b.fechaRegistro
                                        );
                                    });
                                }
                            }
                        }
                    }
                    var fracciones = [];
                    oDataSeleccionada.results.reduce(function (previousValue, currentValue) {
                        if(previousValue != currentValue.fraccion){
                            return fracciones.push(currentValue.fraccion);
                        }else {
                            return currentValue.fraccion;
                        }
                    },[]);

                    for await (const fraccionActual of fracciones){
                        let aFilters = [];
                        let sExpand = "usuarioId";
                        aFilters.push(new Filter("rmdId_rmdId", "EQ", oThat.oSelectedObject.rmdId));
                        aFilters.push(new Filter("fraccion", "EQ", fraccionActual));
                        var aLapsoSelected = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_VERIFICACION_FIRMAS", aFilters, sExpand);
                        if(aLapsoSelected.results){
                            if(aLapsoSelected.results.length >0){
                                aLapsoSelected.results.forEach( function(e){
                                    arrayFind.push(e);
                                })
                            }
                        }
                    }
                    

                    
                    oDataSeleccionada.results = oDataSeleccionada.results.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    for await (const oData of oDataSeleccionada.results){
                        if (oData.aEtiqueta.results.length > 0) {
                            oData.aEtiqueta.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        if (oData.aPaso.results.length > 0) {
                            BusyIndicator.show(0);
                            for await (const oPasoData of oData.aPaso.results){
                                if(oPasoData.imagen){
                                    let oData = {
                                        origen  : "ImagenMD",
                                        url     :  oPasoData.imagenRuta
                                    }
                                    let oImagenCargada = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                                    if(oImagenCargada.length>0){
                                    let oDownloadImage = {
                                        origen  : "ImagenMD",
                                        codigoRM : oPasoData.imagenRuta,
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
                                    oPasoData.imagenBase64 = img;
                                    }
                                }
                            }
                            BusyIndicator.hide();
                            oData.aPaso.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        if (oData.aPasoInsumoPaso.results.length > 0) {
                            oData.aPasoInsumoPaso.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        if (oData.aEquipo.results.length > 0) {
                            oData.aEquipo.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        if (oData.aUtensilio.results.length > 0) {
                            oData.aUtensilio.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        if (oData.aInsumo.results.length > 0) {
                            let aRecetaFracc = aRecetaSelected.find(itm=>itm.fraccion === oData.aInsumo.results[0].fraccion);
                            oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.rmdRecetaId_rmdRecetaId == aRecetaFracc.rmdRecetaId);
                            oData.aInsumo.results.sort(function (a, b) {
                                return a.ItemNo - b.ItemNo;
                            });
                        }
                    }

                    oDataSeleccionada.results = oDataSeleccionada.results.sort(function (a, b) {
                        return a.fraccion - b.fraccion;
                    });

                    if(descargarPDF){
                        tablePdf.onGeneratePdf(value[0].results[0],descargarPDF,oThat.modelGeneral.getProperty("/oInfoUsuario"), oThat.modelGeneral.getProperty("/LineaActualRMD"),arrayFind,fracciones, arrayFind);
                    }else {
                        tablePdf.onGeneratePdf(value[0].results[0],false, oThat.modelGeneral.getProperty("/oInfoUsuario"), oThat.modelGeneral.getProperty("/LineaActualRMD"),arrayFind,fracciones, arrayFind);
                    }

                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });
            },

            onRestoreFilters: function () {
                this.modelGeneral.getData().loteFilter = '';
                this.modelGeneral.getData().ordenesAbap = []
            },

            getEstructurasRmdRefactory: async function (sFraccion) {
                var timeReceta= new Date().getTime();  
                await oThat.onGetRmdReceta(sFraccion);
                await Promise.all([oThat.onGetRmdEstructura(sFraccion), oThat.onGetRmdEsPaso(sFraccion), oThat.onGetRmdEsEquipo(sFraccion), oThat.onGetRmdEsUtensilio(sFraccion), 
                    oThat.onGetRmdEsEtiqueta(sFraccion), oThat.onGetRmdEsReInsumo(sFraccion), oThat.onGetRmdEsEspecificacion(sFraccion), oThat.onGetRmdEsPasoInsumoPaso(sFraccion)])
                    .then(async function(values) {
                    var timedetallfactory = new Date().getTime();
                    oThat.getView().getModel("listRmdEstructura").setData([]);
                    oThat.getView().getModel("listRmdEstructura").setData(values[0].results);
                    oThat.getView().getModel("listRmdEstructura").refresh(true);

                    oThat.getView().getModel("listRmdEsPaso").setData([]);
                    oThat.getView().getModel("listRmdEsPaso").setData(values[1].results);
                    oThat.getView().getModel("listRmdEsPaso").refresh(true);

                    oThat.getView().getModel("listRmdEsEquipo").setData([]);
                    oThat.getView().getModel("listRmdEsEquipo").setData(values[2].results);
                    oThat.getView().getModel("listRmdEsEquipo").refresh(true);

                    oThat.getView().getModel("listRmdEsUtensilio").setData([]);
                    oThat.getView().getModel("listRmdEsUtensilio").setData(values[3].results);
                    oThat.getView().getModel("listRmdEsUtensilio").refresh(true);

                    oThat.getView().getModel("listRmdEsEtiqueta").setData([]);
                    oThat.getView().getModel("listRmdEsEtiqueta").setData(values[4].results);
                    oThat.getView().getModel("listRmdEsEtiqueta").refresh(true);

                    oThat.getView().getModel("listRmdEsReInsumo").setData([]);
                    oThat.getView().getModel("listRmdEsReInsumo").setData(values[5].results);
                    oThat.getView().getModel("listRmdEsReInsumo").refresh(true);

                    oThat.getView().getModel("listRmdEsEspecificacion").setData([]);
                    oThat.getView().getModel("listRmdEsEspecificacion").setData(values[6].results);
                    oThat.getView().getModel("listRmdEsEspecificacion").refresh(true);

                    oThat.getView().getModel("listEsPasoInsumoPasoGeneral").setData([]);
                    oThat.getView().getModel("listEsPasoInsumoPasoGeneral").setData(values[7].results);
                    oThat.getView().getModel("listEsPasoInsumoPasoGeneral").refresh(true);
                    await oThat.onCompletarAsociarDatos();
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                });

            },

            onRouteDetailView: function () {
                if (sap.ui.getCore().byId("frgAdicNewMdEquipment--idTblEquipment")) {
                    sap.ui.getCore().byId("frgAdicNewMdEquipment--idTblEquipment").destroy();
                }
                var router = oThat.getOwnerComponent().getRouter();
                if (router._oViews._oCache.view["mif.rmd.registro.view.DetailMainView"]) {
                    delete router._oViews._oCache.view["mif.rmd.registro.view.DetailMainView"];
                }

                if(this.onFraction){
                    this.onFraction.close();
                }

                router.navTo("RouteDetailMainView",{});
            },

            onGetRmdEstructura: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "estructuraId";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ESTRUCTURA", aFilters, sExpand).then(function (oListRmdEstructura) {
                        resolve(oListRmdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsPaso: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "tipoDatoId,pasoId";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_PASO", aFilters, sExpand).then(function (oListRmdPaso) {
                        resolve(oListRmdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsEquipo: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "equipoId/tipoId";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_EQUIPO", aFilters, sExpand).then(function (oListRmdPaso) {
                        resolve(oListRmdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsUtensilio: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "utensilioId/estadoId,utensilioId/tipoId,agrupadorId";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_UTENSILIO", aFilters, sExpand).then(function (oListRmdPaso) {
                        resolve(oListRmdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsEtiqueta: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "etiquetaId($expand=estructuraId($expand=tipoEstructuraId))";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_ETIQUETA", aFilters, sExpand).then(function (oListRmdPaso) {
                        resolve(oListRmdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsReInsumo: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    try {
                        let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                        let sMaterial = oDataSeleccionada.getData().productoId;
                        let sVersion = oDataSeleccionada.getData().verid;   
                        let aRecetaSelected = oDataSeleccionada.getData().aReceta.results.find(itm=>itm.recetaId.Matnr === sMaterial && itm.recetaId.Verid === sVersion);
                        var aFilters = [];
                        aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                        aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                        aFilters.push(new Filter("rmdRecetaId_rmdRecetaId", "EQ", aRecetaSelected.rmdRecetaId));
                        let sExpand = "rmdEstructuraId,rmdRecetaId";
                        await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_RE_INSUMO", aFilters, sExpand).then(function (oListRmdEsReInsumo) {
                            resolve(oListRmdEsReInsumo);
                        }).catch(function (oError) {
                            reject(oError);
                        })
                    } catch (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        oThat.onErrorMessage(oError, "errorSave");
                    }
                });
            },

            onGetRmdEsEspecificacion: function (sFraccion) {
                return new Promise(async function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "rmdEstructuraId,ensayoPadreId";
                    await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_ESPECIFICACION", aFilters, sExpand).then(function (oListRmdEsEspecificacion) {
                        resolve(oListRmdEsEspecificacion);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdEsPasoInsumoPaso: function (sFraccion) {
                return new Promise(function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    let aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "rmdEstructuraId,etiquetaId,tipoDatoId,pasoId,pasoId/pasoId,pasoHijoId,rmdEstructuraRecetaInsumoId";
                    registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ES_PASO_INSUMO_PASO", aFilters, sExpand).then(function (oListRmdEsPasoInsumoPaso) {
                        resolve(oListRmdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetRmdReceta: function (sFraccion) {
                return new Promise(function (resolve, reject) {
                    let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    let aFilters = [];
                    aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                    aFilters.push(new Filter("fraccion", "EQ", sFraccion));
                    let sExpand = "recetaId";
                    registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_RECETA", aFilters, sExpand).then(function (oListRmdReceta) {
                        oDataSeleccionada.getData().aReceta = oListRmdReceta;
                        oDataSeleccionada.refresh(true);
                        resolve(oListRmdReceta);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onCompletarAsociarDatos: async function () {
                let oModelRmdEstructura = oThat.getView().getModel("listRmdEstructura"),
                    oModelRmdEsPaso = oThat.getView().getModel("listRmdEsPaso"),
                    oModelRmdEsEquipo = oThat.getView().getModel("listRmdEsEquipo"),
                    oModelRmdEsUtensilio = oThat.getView().getModel("listRmdEsUtensilio"),
                    oModelRmdEsEtiqueta = oThat.getView().getModel("listRmdEsEtiqueta"),
                    oModelRmdEsReInsumo = oThat.getView().getModel("listRmdEsReInsumo"),
                    oModelRmdEsEspecificacion = oThat.getView().getModel("listRmdEsEspecificacion"),
                    oModelRmdEsPasoInsumoPaso = oThat.getView().getModel("listEsPasoInsumoPasoGeneral"),
                    oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                    oDataSeleccionada.getData().aEstructura.results = [];
                let orden = 0;
                oModelRmdEstructura.getData().sort(function (a, b) {
                    return a.orden - b.orden;
                });
                
                for await (const item of oModelRmdEstructura.getData()) {
                    if (item.estructuraId.numeracion) {
                        orden = orden + 1;
                        item.ordenFinal = orden; 
                    } else {
                        item.ordenFinal = null;
                    }
                    const aFilterMdPaso = await oModelRmdEsPaso.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdEquipo = await oModelRmdEsEquipo.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdUtensilio = await oModelRmdEsUtensilio.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdEtiqueta = await oModelRmdEsEtiqueta.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdReInsumo = await oModelRmdEsReInsumo.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdEspecificacion = await oModelRmdEsEspecificacion.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });

                    const aFilterMdEsPasoInsumoPaso = await oModelRmdEsPasoInsumoPaso.getData().filter((oItem) => {
                        return item.rmdEstructuraId === oItem.rmdEstructuraId_rmdEstructuraId;
                    });
                    
                    item.aPaso.results = [];
                    item.aEquipo.results = [];
                    item.aUtensilio.results = [];
                    item.aEtiqueta.results = [];
                    item.aPasoInsumoPaso.results = [];
                    item.aInsumo.results = [];
                    item.aEspecificacion.results = [];

                    item.aPaso.results = aFilterMdPaso;
                    item.aEquipo.results = aFilterMdEquipo;
                    item.aUtensilio.results = aFilterMdUtensilio;
                    item.aEtiqueta.results = aFilterMdEtiqueta;
                    item.aPasoInsumoPaso.results = aFilterMdEsPasoInsumoPaso;
                    item.aInsumo.results = aFilterMdReInsumo;
                    item.aEspecificacion.results = aFilterMdEspecificacion;
                    oDataSeleccionada.getData().aEstructura.results.push(item);
                };                
                oThat.getOwnerComponent().getModel("asociarDatos").refresh(true);
                await oThat.onUpdatePasosPM();
            },

            onUpdatePasosPM: async function () {
                let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                let sMaterial = oDataSeleccionada.getData().productoId;
                let sVersion = oDataSeleccionada.getData().verid;
                let aRecetaSelected = oDataSeleccionada.getData().aReceta.results.find(itm=>itm.recetaId.Matnr === sMaterial && itm.recetaId.Verid === sVersion);
                let fraccionActual = oDataSeleccionada.getData().aEstructura.results[0].fraccion;
                let aFilters = [];
                aFilters.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                aFilters.push(new Filter("fraccion", "EQ", fraccionActual));
                aFilters.push(new Filter("rmdRecetaId_rmdRecetaId", "EQ", aRecetaSelected.rmdRecetaId));
                let aListInsumos = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_ES_RE_INSUMO", aFilters);
                let aListInsumosPrincipales = aListInsumos.results.filter(itm=>+itm.ItemNo < 1000 && +itm.ItemNo % 10 === 0);
                for await (const oInsumo of aListInsumosPrincipales){
                    if (!oInsumo.visibleInsumo) {
                        let oInsumoAlternativo = aListInsumos.results.find(itm=>+itm.ItemNo > +oInsumo.ItemNo && +itm.ItemNo < +oInsumo.ItemNo +10);
                        if (oInsumoAlternativo) {
                            let aFilter = [];
                            aFilter.push(new Filter("rmdId_rmdId", "EQ", oDataSeleccionada.getData().rmdId));
                            aFilter.push(new Filter("fraccion", "EQ", fraccionActual));
                            aFilter.push(new Filter("rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId", "EQ", oInsumo.rmdEstructuraRecetaInsumoId));
                            let aListPasosPM = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_ES_PASO_INSUMO_PASO", aFilter);
                            if (aListPasosPM.results.length > 0) {
                                for await (const oPasoPM of aListPasosPM.results) {
                                    let oObj = {
                                        rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId: oInsumoAlternativo.rmdEstructuraRecetaInsumoId,
                                        // usuarioActualiza: oInfoUsuario.data.usuario,
                                        fechaActualiza: new Date()
                                    }
                                    await registroService.onUpdateDataGeneral(oThat.mainModelv2, "RMD_ES_PASO_INSUMO_PASO", oObj, oPasoPM.rmdEstructuraPasoInsumoPasoId);
                                }
                            }
                        }
                    }
                }   
            },

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

            createEstructura: async function (oData, rmdNew, sFraccion, sTipo) {
                let oDataSeleccionada = oThat.getOwnerComponent().getModel("asociarDatos");
                let aFilterReceta = [];
                aFilterReceta.push(new Filter("rmdId_rmdId", "EQ", oData.rmdId));
                aFilterReceta.push(new Filter("fraccion", "EQ", 1));
                let aRecetaMD = await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_RECETA", aFilterReceta);
                let aListIdsReceta = [];
                for await (const oReceta of aRecetaMD.results) {
                    let oParamReceta = {
                        usuarioRegistro: oInfoUsuario.data.usuario,
                        fechaRegistro: new Date(),
                        activo: true,
                        fraccion: sFraccion,
                        rmdRecetaId: util.onGetUUIDV4(),
                        rmdId_rmdId: rmdNew.rmdId,
                        recetaId_recetaId : oReceta.recetaId_recetaId,
                        orden : oReceta.orden
                    }
                    let objIdReceta = {
                        mdRecetaId : oReceta.rmdRecetaId,
                        rmdRecetaId : oParamReceta.rmdRecetaId
                    }
                    aListIdsReceta.push(objIdReceta);
                    await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_RECETA", oParamReceta);
                }

                let aFilter = [];
                aFilter.push(new Filter("rmdId_rmdId", FilterOperator.EQ, oData.rmdId));
                aFilter.push(new Filter("fraccion", "EQ", 1));
                let sExpand = "aPaso/pasoId,aEquipo,aUtensilio,aEtiqueta,aPasoInsumoPaso,aEspecificacion,aInsumo";
                let aEstructuraMD = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_ESTRUCTURA", aFilter, sExpand);
                let aListEstructurasRMD = [];
                let aListIdsInsumos = [];
                for await (const oEstructuraOnlyInsumo of aEstructuraMD.results) {
                    if(oEstructuraOnlyInsumo.aInsumo.results.length > 0){
                        let oParam = {
                            usuarioRegistro: oInfoUsuario.data.usuario,
                            fraccion: sFraccion, 
                            fechaRegistro: new Date(),
                            activo: true,
                            rmdEstructuraId: util.onGetUUIDV4(),
                            orden: oEstructuraOnlyInsumo.orden,
                            rmdId_rmdId: rmdNew.rmdId,
                            estructuraId_estructuraId: oEstructuraOnlyInsumo.estructuraId_estructuraId,
                            aPaso: [],
                            aEquipo : [],
                            aUtensilio : [],
                            aEtiqueta: [],
                            aPasoInsumoPaso: [],
                            aEspecificacion: [],
                            aInsumo: []
                        }

                        if (oEstructuraOnlyInsumo.aInsumo.results.length > 0) {
                            for await (const oInsumo of oEstructuraOnlyInsumo.aInsumo.results) {
                                let matchRecetaId = aListIdsReceta.find(itm=>itm.mdRecetaId === oInsumo.rmdRecetaId_rmdRecetaId);
                                let oInsumoObj = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdEstructuraRecetaInsumoId: util.onGetUUIDV4(),
                                    rmdId_rmdId: rmdNew.rmdId,
                                    rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                    rmdRecetaId_rmdRecetaId : matchRecetaId.rmdRecetaId,
                                    cantidadRm : oInsumo.cantidadRm,
                                    cantidadBarCode : sTipo ? null : oInsumo.cantidadBarCode,
                                    verifCheck: sTipo ? null : oInsumo.verifCheck,
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
                                    Txtadic: oInsumo.Txtadic,
                                    enabledCheck: oInsumo.enabledCheck,
                                    firstFechaActualiza: sTipo ? null : oInsumo.firstFechaActualiza,
                                    usuarioVerificador: sTipo ? null : oInsumo.usuarioVerificador,
                                    numeroBultos: sTipo ? null : oInsumo.numeroBultos,
                                    fraccion: sFraccion,
                                    cantidadOP: oInsumo.cantidadOP,
                                    adicional: oInsumo.adicional,
                                    visibleInsumo: oInsumo.visibleInsumo,
                                    ifa: oInsumo.ifa,
                                    Mtart: oInsumo.Mtart,
                                    umb: oInsumo.umb,
                                    Charg: oInsumo.Charg,
                                    AiPrio: oInsumo.AiPrio,
                                    codigo: oInsumo.codigo,
                                    descripcion: oInsumo.descripcion,
                                    cantidadReceta: oInsumo.cantidadReceta,
                                    um: oInsumo.um,
                                    orden: oInsumo.orden,
                                    sustituto: oInsumo.sustituto,
                                    styleUser: sTipo ? null : oInsumo.styleUser,
                                    flagEditado: sTipo ? null : oInsumo.flagEditado
                                }
                                let objInsumoIds = {
                                    estructuraRecetaInsumoId : oInsumo.rmdEstructuraRecetaInsumoId,
                                    rmdEstructuraRecetaInsumoId : oInsumoObj.rmdEstructuraRecetaInsumoId
                                }
                                aListIdsInsumos.push(objInsumoIds);
                                oParam.aInsumo.push(oInsumoObj);
                            }
                        }
                        await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_ESTRUCTURA", oParam);
                    }
                }
                for await (const oEstructura of aEstructuraMD.results) {
                    if (oEstructura.aInsumo.results.length === 0) {
                        let oParam = {
                            usuarioRegistro: oInfoUsuario.data.usuario,
                            fraccion: sFraccion, 
                            fechaRegistro: new Date(),
                            activo: true,
                            rmdEstructuraId: util.onGetUUIDV4(),
                            orden: oEstructura.orden,
                            rmdId_rmdId: rmdNew.rmdId,
                            estructuraId_estructuraId: oEstructura.estructuraId_estructuraId,
                            aPaso: [],
                            aEquipo : [],
                            aUtensilio : [],
                            aEtiqueta: [],
                            aPasoInsumoPaso: [],
                            aEspecificacion: [],
                            aInsumo: []
                        }
                        aListEstructurasRMD.push(oParam);
    
                        let aListIdPaso = [];
                        if (oEstructura.aPaso.results.length > 0) {
                            for await (const oPaso of oEstructura.aPaso.results) {
                                if (oPaso.tipoDatoId_iMaestraId === stipoDatoNotificacion) { //SE REGISTRA LAPSO
                                    let oPasoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraPasoId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: rmdNew.rmdId,
                                        pasoId_pasoId: oPaso.pasoId_pasoId,
                                        orden: oPaso.orden,
                                        valorInicial: oPaso.valorInicial,
                                        valorFinal: oPaso.valorFinal,
                                        margen: oPaso.margen,
                                        decimales: oPaso.decimales,
                                        mdEstructuraPasoIdDepende: oPaso.mdEstructuraPasoIdDepende,
                                        depende: oPaso.depende,
                                        dependeRmdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                        estadoCC: oPaso.estadoCC,
                                        estadoMov: oPaso.estadoMov,
                                        pmop: oPaso.pmop,
                                        genpp: oPaso.genpp,
                                        tab: oPaso.tab,
                                        edit: oPaso.edit,
                                        rpor: oPaso.rpor,
                                        vb: oPaso.vb,
                                        formato : oPaso.formato,
                                        imagen : false,
                                        tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                        puestoTrabajo : oPaso.puestoTrabajo,
                                        clvModelo : oPaso.clvModelo,
                                        automatico : oPaso.automatico,
                                        aplica: true,
                                        fraccion: sFraccion
                                    }
                                    let objPaso = {
                                        mdEstructuraPasoId : oPaso.rmdEstructuraPasoId,
                                        rmdEstructuraPasoId : oPasoObj.rmdEstructuraPasoId
                                    }
                                    aListIdPaso.push(objPaso);
                                    oParam.aPaso.push(oPasoObj);
                                    if (oPaso.pasoId.tipoCondicionId_iMaestraId === sIdInicioCondicion) {
                                        let pasoLapsoFin = oEstructura.aPaso.results.find(itm=>itm.clvModelo === oPaso.clvModelo && itm.puestoTrabajo === oPaso.puestoTrabajo && itm.pasoId.tipoCondicionId_iMaestraId === sIdFinCondicion); 
                                        if(pasoLapsoFin){
                                            let sobjectTrama = {
                                                usuarioRegistro: oInfoUsuario.data.usuario,
                                                fechaRegistro: new Date(),
                                                activo : true,
                                                rmdLapsoId : util.onGetUUIDV4(),
                                                rmdId_rmdId : rmdNew.rmdId,
                                                Anular : false,
                                                descripcion: oPaso.pasoId.descripcion + " - " + pasoLapsoFin.pasoId.descripcion,
                                                tipoDatoId: (oPaso.tipoDatoId_iMaestraId).toString(),
                                                automatico: pasoLapsoFin.automatico === null ? false : pasoLapsoFin.automatico,
                                                pasoId_mdEstructuraPasoId: oPaso.mdEstructuraPasoIdDepende,
                                                pasoIdFin_mdEstructuraPasoId: pasoLapsoFin.mdEstructuraPasoIdDepende,
                                                fraccion: sFraccion
                                            };
                                            await registroService.createData(oThat.mainModelv2, "/RMD_LAPSO", sobjectTrama);
                                        }
                                    }
                                } else {
                                    let oPasoObj = {
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        fechaRegistro: new Date(),
                                        activo: true,
                                        rmdEstructuraPasoId: util.onGetUUIDV4(),
                                        rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                        rmdId_rmdId: rmdNew.rmdId,
                                        pasoId_pasoId: oPaso.pasoId_pasoId,
                                        orden: oPaso.orden,
                                        valorInicial: oPaso.valorInicial,
                                        valorFinal: oPaso.valorFinal,
                                        margen: oPaso.margen,
                                        decimales: oPaso.decimales,
                                        mdEstructuraPasoIdDepende: oPaso.mdEstructuraPasoIdDepende,
                                        depende: oPaso.depende,
                                        dependeRmdEstructuraPasoId: oPaso.dependeMdEstructuraPasoId,
                                        estadoCC: oPaso.estadoCC,
                                        estadoMov: oPaso.estadoMov,
                                        pmop: oPaso.pmop,
                                        genpp: oPaso.genpp,
                                        tab: oPaso.tab,
                                        edit: oPaso.edit,
                                        rpor: oPaso.rpor,
                                        vb: oPaso.vb,
                                        formato : oPaso.formato,
                                        imagen : false,
                                        tipoDatoId_iMaestraId: oPaso.tipoDatoId_iMaestraId,
                                        puestoTrabajo : oPaso.puestoTrabajo,
                                        clvModelo : oPaso.clvModelo,
                                        automatico : oPaso.automatico,
                                        aplica: true,
                                        fraccion: sFraccion
                                    }
                                    let objPaso = {
                                        mdEstructuraPasoId : oPaso.rmdEstructuraPasoId,
                                        rmdEstructuraPasoId : oPasoObj.rmdEstructuraPasoId
                                    }
                                    aListIdPaso.push(objPaso);
                                    oParam.aPaso.push(oPasoObj);
                                }
                            }
                        }
    
                        if (oEstructura.aEquipo.results.length > 0) {
                            oEstructura.aEquipo.results.forEach(async function (oEquipo) {
                                let oEquipoObj = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdEstructuraEquipoId: util.onGetUUIDV4(),
                                    rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                    rmdId_rmdId: rmdNew.rmdId,
                                    equipoId_equipoId: oEquipo.equipoId_equipoId,
                                    orden: oEquipo.orden,
                                    aplica: true,
                                    fraccion: sFraccion
                                }
                                oParam.aEquipo.push(oEquipoObj);
                            });
                        }
            
                        if (oEstructura.aUtensilio.results.length > 0) {
                            oEstructura.aUtensilio.results.forEach(async function (oUtensilio) {
                                let oUtensiliooBJ = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdEstructuraUtensilioId: util.onGetUUIDV4(),
                                    rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                    rmdId_rmdId: rmdNew.rmdId,
                                    utensilioId_utensilioId: oUtensilio.utensilioId_utensilioId,
                                    agrupadorId_clasificacionUtensilioId : oUtensilio.agrupadorId_clasificacionUtensilioId,
                                    orden: oUtensilio.orden,
                                    aplica: true,
                                    fraccion: sFraccion
                                }
                                oParam.aUtensilio.push(oUtensiliooBJ);
                            });
                        }
            
                        if (oEstructura.aEtiqueta.results.length > 0) {
                            oEstructura.aEtiqueta.results.forEach(async function (oEtiqueta) {
                                let oEtiquetaObj = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdEsEtiquetaId: util.onGetUUIDV4(),
                                    rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                    rmdId_rmdId: rmdNew.rmdId,
                                    etiquetaId_etiquetaId: oEtiqueta.etiquetaId_etiquetaId,
                                    orden: oEtiqueta.orden,
                                    conforme: oEtiqueta.conforme,
                                    procesoMenor: oEtiqueta.procesoMenor,
                                    fraccion: sFraccion
                                }
                                oParam.aEtiqueta.push(oEtiquetaObj);
                            });
                        }
            
                        if (oEstructura.aPasoInsumoPaso.results.length > 0) {
                            for await (const oProcesoMenor of oEstructura.aPasoInsumoPaso.results) {
                                let existePasoPadre = aListIdPaso.find(itm=>itm.mdEstructuraPasoId === oProcesoMenor.pasoId_rmdEstructuraPasoId)
                                let existeInsumo = aListIdsInsumos.find(itm=>itm.estructuraRecetaInsumoId === oProcesoMenor.rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId);
                                let estructuraRecta = null;
                                if (existeInsumo) {
                                    estructuraRecta = existeInsumo.rmdEstructuraRecetaInsumoId;
                                }
                                let oProcesoMenorObj = {
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    fechaRegistro: new Date(),
                                    activo: true,
                                    rmdEstructuraPasoInsumoPasoId: util.onGetUUIDV4(),
                                    rmdEstructuraId_rmdEstructuraId: oParam.rmdEstructuraId,
                                    rmdId_rmdId: rmdNew.rmdId,
                                    pasoId_rmdEstructuraPasoId: existePasoPadre.rmdEstructuraPasoId,
                                    pasoHijoId_pasoId : oProcesoMenor.pasoHijoId_pasoId !== null ? oProcesoMenor.pasoHijoId_pasoId : null,
                                    tipoDatoId_iMaestraId : oProcesoMenor.tipoDatoId_iMaestraId,
                                    rmdEstructuraRecetaInsumoId_rmdEstructuraRecetaInsumoId : estructuraRecta,
                                    etiquetaId_etiquetaId: oProcesoMenor.etiquetaId_etiquetaId,
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
                                    aplica: true,
                                    fraccion: sFraccion,
                                    Component: oProcesoMenor.Component,
                                    Matnr: oProcesoMenor.Matnr,
                                    Maktx: oProcesoMenor.Maktx,
                                    CompUnit: oProcesoMenor.CompUnit
                                }
                                oParam.aPasoInsumoPaso.push(oProcesoMenorObj);
                            }
                        }
    
                        if (oEstructura.aEspecificacion.results.length > 0) {
                            oEstructura.aEspecificacion.results.forEach(async function (oEspecificacion) {
                                let oEspecificacionObj = {
                                    usuarioRegistro : oInfoUsuario.data.usuario,
                                    fechaRegistro : new Date(),
                                    activo : true,
                                    rmdEstructuraEspecificacionId : util.onGetUUIDV4(),
                                    rmdEstructuraId_rmdEstructuraId : oParam.rmdEstructuraId,
                                    rmdId_rmdId: rmdNew.rmdId,
                                    ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                    ensayoPadreSAP : oEspecificacion.ensayoPadreSAP,
                                    ensayoHijo : oEspecificacion.ensayoHijo,
                                    especificacion: oEspecificacion.especificacion,
                                    tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                    valorInicial : oEspecificacion.valorInicial,
                                    valorFinal : oEspecificacion.valorFinal,
                                    margen : oEspecificacion.margen,
                                    decimales : oEspecificacion.decimales,
                                    orden : oEspecificacion.orden,
                                    aplica : true,
                                    Merknr : oEspecificacion.Merknr,
                                    fraccion: sFraccion
                                }
                                oParam.aEspecificacion.push(oEspecificacionObj);
                            });
                        }
                        await registroService.onSaveDataGeneral(oThat.mainModelv2, "RMD_ESTRUCTURA", oParam);
                    }
                }
            },

            onChangeEstructuraIndividual: async function (aListaRmdItem) {
                try {
                    let sEntity;
                    let aFilter = [], sExpand;
                    let aModelPaso = oThat.getView().getModel("listRmdEsPaso").getData();
                    let aModelEquipo = oThat.getView().getModel("listRmdEsEquipo").getData();
                    let aModelUtensilio = oThat.getView().getModel("listRmdEsUtensilio").getData();
                    let aModelPasoInsumoPaso = oThat.getView().getModel("listEsPasoInsumoPasoGeneral").getData();
                    let aModelEspecificacion = oThat.getView().getModel("listRmdEsEspecificacion").getData(); 

                    if (aListaRmdItem.sTipo === 'PROCEDIMIENTO' || aListaRmdItem.sTipo === 'CUADRO' || aListaRmdItem.sTipo === 'CONDICIONAMBIENTAL') {
                        sEntity = 'RMD_ES_PASO';
                        aFilter.push(new Filter ("rmdEstructuraPasoId", "EQ", aListaRmdItem.rmdEstructuraPasoId));
                        sExpand = "tipoDatoId,pasoId";
                    } else if (aListaRmdItem.sTipo === 'PROCEDIMIENTOPM') {
                        sEntity = 'RMD_ES_PASO_INSUMO_PASO';
                        aFilter.push(new Filter ("rmdEstructuraPasoInsumoPasoId", "EQ", aListaRmdItem.rmdEstructuraPasoInsumoPasoId));
                        sExpand = "rmdEstructuraId,etiquetaId,pasoId,pasoId/pasoId,pasoHijoId,rmdEstructuraRecetaInsumoId";
                    } else if (aListaRmdItem.sTipo === 'EQUIPO') {
                        sEntity = 'RMD_ES_EQUIPO';
                        aFilter.push(new Filter ("rmdEstructuraEquipoId", "EQ", aListaRmdItem.rmdEstructuraEquipoId));
                        sExpand = "equipoId/tipoId";
                    } else if (aListaRmdItem.sTipo === 'UTENSILIO') {
                        sEntity = 'RMD_ES_UTENSILIO';
                        aFilter.push(new Filter ("rmdEstructuraUtensilioId", "EQ", aListaRmdItem.rmdEstructuraUtensilioId));
                        sExpand = "utensilioId/estadoId,utensilioId/tipoId,agrupadorId";
                    } else if (aListaRmdItem.sTipo === 'ESPECIFICACIONES') {
                        sEntity = 'RMD_ES_ESPECIFICACION';
                        aFilter.push(new Filter ("rmdEstructuraEspecificacionId", "EQ", aListaRmdItem.rmdEstructuraEspecificacionId));
                        sExpand = "rmdEstructuraId,ensayoPadreId";
                    }
                    let oResponse = await registroService.onGetDataGeneralFiltersExpand(oThat.mainModelv2, sEntity, aFilter, sExpand);
                    let aResponse;
                    if (aListaRmdItem.sTipo === 'PROCEDIMIENTO' || aListaRmdItem.sTipo === 'CUADRO' || aListaRmdItem.sTipo === 'CONDICIONAMBIENTAL') {
                        aResponse = aModelPaso.map(obj => oResponse.results.find(o => o.rmdEstructuraPasoId === obj.rmdEstructuraPasoId) || obj);
                        let oModelPaso = new JSONModel(aResponse);
                        oModelPaso.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelPaso, "listRmdEsPaso");
                        oThat.getView().getModel("listRmdEsPaso").refresh(true);
                    } else if (aListaRmdItem.sTipo === 'PROCEDIMIENTOPM') {
                        aResponse = aModelPasoInsumoPaso.map(obj => oResponse.results.find(o => o.rmdEstructuraPasoInsumoPasoId === obj.rmdEstructuraPasoInsumoPasoId) || obj);
                        let oModelPaso = new JSONModel(aResponse);
                        oModelPaso.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelPaso, "listEsPasoInsumoPasoGeneral");
                        oThat.getView().getModel("listEsPasoInsumoPasoGeneral").refresh(true);
                    } else if (aListaRmdItem.sTipo === 'EQUIPO') {
                        aResponse = aModelEquipo.map(obj => oResponse.results.find(o => o.rmdEstructuraEquipoId === obj.rmdEstructuraEquipoId) || obj);
                        let oModelPaso = new JSONModel(aResponse);
                        oModelPaso.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelPaso, "listRmdEsEquipo");
                        oThat.getView().getModel("listRmdEsEquipo").refresh(true);
                    } else if (aListaRmdItem.sTipo === 'UTENSILIO') {
                        aResponse = aModelUtensilio.map(obj => oResponse.results.find(o => o.rmdEstructuraUtensilioId === obj.rmdEstructuraUtensilioId) || obj);
                        let oModelPaso = new JSONModel(aResponse);
                        oModelPaso.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelPaso, "listRmdEsUtensilio");
                        oThat.getView().getModel("listRmdEsUtensilio").refresh(true);
                    } else if (aListaRmdItem.sTipo === 'ESPECIFICACIONES') {
                        aResponse = aModelEspecificacion.map(obj => oResponse.results.find(o => o.rmdEstructuraEspecificacionId === obj.rmdEstructuraEspecificacionId) || obj);
                        let oModelPaso = new JSONModel(aResponse);
                        oModelPaso.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelPaso, "listRmdEsEspecificacion");
                        oThat.getView().getModel("listRmdEsEspecificacion").refresh(true);
                    }
                    await oThat.onCompletarAsociarDatos();
                } catch (oError) {
                    MessageBox.error(oError);
                }
            },

            onGetAppConfiguration:async function () {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var afilters = [];
                    afilters.push(new Filter("codigo", "EQ", sAppRegistro));
                    await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "APLICACION", afilters).then(async function (oListAppConfig) {
                        resolve(oListAppConfig);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetConstants:async function () {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var oFilter = [
                        new Filter({
                            filters: [
                                new Filter("oAplicacion_aplicacionId", "EQ", oAplicacionRegistro),
                                new Filter("campo1", "EQ", 'X')
                            ],
                            and: false
                        })
                    ];
                    await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "CONSTANTES", oFilter).then(async function (oListConstantes) {
                        resolve(oListConstantes);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onSetConstans:async function (aConstants) {
                try {
                    for await (const oConstante of aConstants.results) {
                        if (oConstante.codigoSap === "CODROLAUXILIAR") {
                            oRolAuxiliar = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
                            sEstadoAutorizado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDHABILITADO") {
                            idEstadoHabilitado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "CARACTERISTICAAREA") {
                            constanteArea = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDTIPOESTESPECIFICACIONES") {
                            sTipoEstructuraEspecificaciones = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTPROCESO") {
                            sIdTipoEstructuraProceso = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATONOTIFICACION") {
                            stipoDatoNotificacion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOCONDICIONINICIO") {
                            sIdInicioCondicion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOCONDICIONFIN") {
                            sIdFinCondicion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDSISTEMARMD") {
                            sSistemaRMDCod = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDAPPREGISTRO") {
                            sRootPath = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "USUARIOREGULARIZAR") {
                            sUsuarioRegulNotif = oConstante.contenido
                        }
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetIdRoles:async function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    var afilters = [];
                    afilters.push(new Filter("codigo", "EQ", oRolAuxiliar));
                    await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "ROL", afilters).then(async function (oListRol) {
                        if (oListRol.results.length > 0) {
                            idRolAuxiliar = oListRol.results[0].rolId;
                        }
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    })
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetIdSistema:async function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    var afilters = [];
                    afilters.push(new Filter("codigo", "EQ", sSistemaRMDCod));
                    await registroService.onGetDataGeneralFilters(oThat.mainModelv2, "SISTEMA", afilters).then(async function (oListSystem) {
                        let oSistemas; 
                        oSistemas = oListSystem.results.find(item => item.codigo === sSistemaRMDCod);
                        if (oSistemas) {
                            sSistemaRMD = oSistemas.sistemaId;
                        }
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    })
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            }
        });
    });
