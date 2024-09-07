sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "mif/rmd/solicitud/services/solicitud",
    "mif/rmd/solicitud/services/external/sharepoint",
    "mif/rmd/solicitud/services/external/workflow",
    "sap/m/PDFViewer",
    "mif/rmd/solicitud/utils/util",
    "sap/ui/core/BusyIndicator",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    '../controller/table'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, JSONModel, Fragment, MessageBox, MessageToast, Filter, FilterOperator, FilterType, solicitudService, sharepointService, workflowService, PDFViewer, util, BusyIndicator, Spreadsheet, exportLibrary,tablePdf) {
        "use strict";

        const rootPath = "mif.rmd.solicitud";
        var EdmType = exportLibrary.EdmType;
        let oThat;
        let oAplicacion,
            iMaxLengthArchivos,
            estadoAutorizado,
            estadoIngresado,
            estadoSolicitado,
            estadoSolicitudAprobada,
            estadoProcesoPendiente,
            estadoProcesoProceJefe,
            estadoProcesoProceGere,
            estadoProcesoDevueGeje,
            estadoProcesoDevueGere,
            estadoProcesoAprobGere,
            estadoProcesoDevJefeDT,
            estadoProcesoAprobJefeDT,
            oAplicacionSolicitudId,
            oAplicacionConfiguracionId,
            oRolJefeProduccion,
            oRolGerenteProduccion,
            oRolJefaturaDT,
            oRolJefeProduccionCod,
            oRolGerenteProduccionCod,
            oRolJefaturaDTCod,
            constanteEtapa,
            constanteArea,
            tipoGerenteProd,
            tipoJefaturaDT,
            sSistemaRMD,
            sSistemaRMDCod,
            sTipoEstructuraEspecificaciones;
        const sAppSolicitud = 'SOLIC',
            sAppConfiguracion = 'CONFIG';
        return Controller.extend("mif.rmd.solicitud.controller.MainView", {
        onInit: async function () {
            oThat = this;
            this.onInitialization();
            workflowService.setManifestObject(oThat);
            this.modelGeneral = this.getView().getModel("modelGeneral");
            this.mainModel = this.getView().getModel("mainModel");            
            this.modelGeneral.setSizeLimit(999999999);
            this.mainModelv2 = this.getView().getModel("mainModelv2");
            this.oModelErp = this.getOwnerComponent().getModel("PRODUCCION_SRV"); 
            this.oModelErpNec = this.getOwnerComponent().getModel("NECESIDADESRMD_SRV");

            // Obteniendo el ID de la aplicacion y las constantes
            let aAppConfig = await oThat.onGetAppConfiguration();
            if (aAppConfig.results.length > 0) {
                let oAppsSoli = aAppConfig.results.find(item => item.codigo === sAppSolicitud);
                if (oAppsSoli) {
                    oAplicacionSolicitudId = oAppsSoli.aplicacionId;
                }
                let oAppsConfig = aAppConfig.results.find(item => item.codigo === sAppConfiguracion);
                if (oAppsConfig) {
                    oAplicacionConfiguracionId = oAppsConfig.aplicacionId;
                }
                this.aConstantes = await oThat.onGetConstants();
                if (this.aConstantes.results.length > 0) {
                    await oThat.onSetConstans(this.aConstantes);
                    await oThat.onGetIdRoles();
                    await oThat.onGetIdSistema();
                    await oThat.onGetAreaOdata();
                    await oThat.onGetNivelOdata();
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
        },

        onInitApp: async function () {
            BusyIndicator.show(0);
            var aplicacionSelected = this.modelGeneral.getProperty("/aFilters/aplicacionId");
            if (aplicacionSelected === oAplicacionSolicitudId) {
                await oThat.onGetRecetas();    
            }            
            if(sap.ushell){
                var user = new sap.ushell.Container.getService("UserInfo").getUser();
                var emailUser = user.getEmail();   
            } else {
                // var emailUser = "yjaico@medifarma.com.pe";
                var emailUser = "mmontero@medifarma.com.pe";
                // var emailUser = "kzorrilla@medifarma.com.pe";
                // var emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
                // var emailUser = "axelronaldo.matienzoataucusi.sa@nttdata.com";
            }

            let UserFilter = [];
            UserFilter.push(new Filter("correo", 'EQ', emailUser));
            let oUsuarioFilter = await solicitudService.getData(this.mainModelv2, "/USUARIO", [], UserFilter);

            let UserSystemFilter = [];
            UserSystemFilter.push(new Filter("oSistema_sistemaId", 'EQ', sSistemaRMD));
            this.aUsuarioSystem = await solicitudService.getData(this.mainModelv2, "/USUARIO_SISTEMA", [], UserSystemFilter);

            let oUsuario = {results: []};

            for await (const oUsuarioSystem of this.aUsuarioSystem.results) {
                let oUsuarioFind = oUsuarioFilter.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId);
                if (oUsuarioFind) {
                    oUsuario.results.push(oUsuarioFind);
                }
            }

            if (oUsuario.results.length > 0){
                var oFilter = [];
                oFilter.push(new Filter("oUsuario_usuarioId", 'EQ', oUsuario.results[0].usuarioId));
                let sExpand = "oRol";
                let oUser = await solicitudService.getData(this.mainModelv2, "/UsuarioRol", sExpand, oFilter);
                let oUserFilterSystem = oUser.results.filter(item=>item.oRol.oSistema_sistemaId === sSistemaRMD);
                var oInfoUsuario = {
                    data    : oUsuario.results[0],
                    rol     : [],
                    funcionUsuario : {
                        registradorSolicitud    : false,
                        aprobadorSolicitud      : false,
                        aprobadorPrimerNivel    : false,
                        aprobadorSegundoNivel   : false,
                        aprobadorTercerNivel    : false
                    }
                }
                if(oUserFilterSystem.length > 0){
                    var aFilterAcc = [];
                    oUserFilterSystem.forEach(function(e){
                        oInfoUsuario.rol.push(e.oRol);
                        aFilterAcc.push(new Filter("oRol_rolId", 'EQ', e.oRol.rolId));
                    });
                    var mExpand = "oMaestraAccion";
                    aFilterAcc.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacion));
                    var infoAccionUsuario = await solicitudService.getData(this.mainModelv2, "/RolAppAcciones", mExpand, aFilterAcc);

                    infoAccionUsuario.results.forEach(function(e){
                        if (e.oMaestraAccion.contenido === "SOLICITUD") {
                            oInfoUsuario.funcionUsuario.registradorSolicitud = true;
                        }
                        if (e.oMaestraAccion.contenido === "APROBAR") {
                            oInfoUsuario.funcionUsuario.aprobadorSolicitud = true;
                        }
                        if (e.oMaestraAccion.contenido === "APROBAR NIVEL 1") {
                            oInfoUsuario.funcionUsuario.aprobadorPrimerNivel = true;
                        }
                        if (e.oMaestraAccion.contenido === "APROBAR NIVEL 2") {
                            oInfoUsuario.funcionUsuario.aprobadorSegundoNivel = true;
                        }
                        if (e.oMaestraAccion.contenido === "APROBAR NIVEL 3") {
                            oInfoUsuario.funcionUsuario.aprobadorTercerNivel = true;
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
                MessageBox.error("El usuario no se encuentra registrado", {
                    styleClass: "sapUiSizeCompact",
                    actions: [MessageBox.Action.OK],
                    onClose: async function (oAction) {
                        if (oAction === "OK") {
                            window.history.back();
                        }
                    }
                }); 
            }
            BusyIndicator.hide();
        },

        onGetDestinatarios: async function (mdId) {
            let aFilters = [];
            aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
            let sExpand = "usuarioId";
            let response = await solicitudService.getData(oThat.mainModelv2, "/MD_DESTINATARIOS", sExpand, aFilters);
            return response;
        },

        onGetRecetasMD: async function (mdId) {
            let aFilters = [];
            aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
            let sExpand = "recetaId";
            let response = await solicitudService.getData(oThat.mainModelv2, "/MD_RECETA", sExpand, aFilters);
            return response;
        },

        onRefreshSolicitud: async function (oFiltros, oDestinatarios, oRecetaId) {
            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            var aplicacionSelected = this.modelGeneral.getProperty("/aFilters/aplicacionId");
            let sExpand = "estadoIdRmd,estadoIdProceso,sucursalId,motivoId,aStatusProceso,nivelId";
            if(!oFiltros){
                oFiltros = [];
            }
            if (aplicacionSelected === oAplicacionSolicitudId) {
                if (!oFiltros.find(itm=>itm.sPath === 'codigoSolicitud')) {
                    oFiltros.push(new Filter("codigoSolicitud", "NE", null));
                }
            } else if (aplicacionSelected === oAplicacionConfiguracionId) {
                if (!oFiltros.find(itm=>itm.sPath === 'estadoIdProceso_iMaestraId')) {
                    oFiltros.push(new Filter("estadoIdProceso_iMaestraId", "NE", estadoProcesoPendiente));
                    oFiltros.push(new Filter("estadoIdRmd_iMaestraId", "EQ", estadoIngresado));
                }
            }
            var aListSolicitud = await solicitudService.getData(this.mainModelv2, "/MD", sExpand, oFiltros);
            
            for await (const oMD of aListSolicitud.results) {
                oMD.destinatariosMD = await oThat.onGetDestinatarios(oMD.mdId);
                oMD.aReceta = await oThat.onGetRecetasMD(oMD.mdId);
            }

            var aListMDForTable = [];
            var aListaMDFiltrado = [];
            var aListaMDFiltradoReceta = [];
            if (oDestinatarios) {
                aListSolicitud.results.forEach(function(e){
                    e.destinatariosMD.results.forEach(function(m){
                        if (m.usuarioId) {
                            if(m.usuarioId.usuario === oDestinatarios.toUpperCase()){
                                aListaMDFiltrado.push(e);
                            }
                        }
                    })
                });  
            } else {
                aListaMDFiltrado = aListSolicitud.results;
            }
            if (oRecetaId) {
                aListaMDFiltrado.forEach(function(e){
                    e.aReceta.results.forEach(function(m){
                        if(m.recetaId_recetaId === oRecetaId){
                            aListaMDFiltradoReceta.push(e);
                        }
                    })
                })
            } else {
                aListaMDFiltradoReceta = aListaMDFiltrado;
            }
        
            if (oInfoUsuario.funcionUsuario.aprobadorPrimerNivel || oInfoUsuario.funcionUsuario.aprobadorSegundoNivel || oInfoUsuario.funcionUsuario.aprobadorTercerNivel) {
                var sFilter = [];
                sFilter.push(new Filter("usuarioId_usuarioId", 'EQ', oInfoUsuario.data.usuarioId));
                var aListRmUsuario = await solicitudService.getData(this.mainModelv2, "/MD_DESTINATARIOS", [], sFilter);
                aListRmUsuario.results.forEach(function(obj){
                    var existe = aListaMDFiltradoReceta.find(item=>item.mdId === obj.mdId_mdId);
                    if(existe){
                        aListMDForTable.push(existe);
                    }
                });
            }

            if (oInfoUsuario.funcionUsuario.aprobadorSolicitud) {
                aListMDForTable = aListaMDFiltradoReceta;
            }

            if (oInfoUsuario.funcionUsuario.registradorSolicitud){
                var existe = aListaMDFiltradoReceta.filter(item=>item.usuarioRegistro === oInfoUsuario.data.usuario);
                if (existe.length > 0) {
                    existe.forEach(function(e){
                        aListMDForTable.push(e);
                    });
                }
            }

            aListMDForTable.forEach(function(e){
                if (e.version === 1) {
                    e.tipoMD = "Nuevo RMD"
                } else {
                    e.tipoMD = "Nueva Versión"
                }
                var arrayDest = [];
                e.destinatariosMD.results.forEach(function(obj){
                    if (obj.usuarioId) {
                        arrayDest.push(obj.usuarioId.usuario);
                    }
                });
                e.concatDestinatarios = arrayDest.join(",");
                var arrayReceta = [];
                e.aReceta.results.forEach(function(itm){
                    arrayReceta.push(itm.recetaId.codigo);
                })
                e.concatCodMaterial = arrayReceta.join(",");
                if (e.aStatusProceso.results.length > 0 && e.estadoIdRmd_iMaestraId !== estadoSolicitado && oAplicacion === oAplicacionSolicitudId) {
                    e.aStatusProceso.results = e.aStatusProceso.results.filter(item=>item.tipo === "SOLICITUD");
                    if(e.aStatusProceso.results.length > 0) {
                        e.aStatusProceso.results.sort(function (a, b) {
                            return a.fechaRegistro - b.fechaRegistro;
                        });
                        e.fechaAprob_Rech   = e.aStatusProceso.results[0].fechaRegistro;
                        e.usuarioAprob_Rech = e.aStatusProceso.results[0].usuarioRegistro;
                    }   
                }
                if(e.aStatusProceso.results.length > 0 && oAplicacion === oAplicacionConfiguracionId) {
                    e.aStatusProceso.results = e.aStatusProceso.results.filter(item=>item.tipo === "CONFIGURACION");
                    if(e.aStatusProceso.results.length > 0) {
                        e.aStatusProceso.results.sort(function (a, b) {
                            return a.fechaRegistro - b.fechaRegistro;
                        });
                        e.aStatusProceso.results.forEach(function(oEstatus){
                            if (oEstatus.estadoIdProceso_iMaestraId === estadoProcesoProceJefe || oEstatus.estadoIdProceso_iMaestraId === estadoProcesoProceGere || oEstatus.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {
                                e.fechaEnvioProd   = oEstatus.fechaRegistro;
                                e.usuarioEnvioProd = oEstatus.usuarioRegistro;
                            }
                        });
                    }    
                }
            });

            var helper = {};
            var aListMDTableReduce = aListMDForTable.reduce(function(r, o) {
                var key = o.mdId;
                if (!helper[key]) {
                    helper[key] = 1;
                    r.push(o);
                }
                return r;
            }, []);

            this.modelGeneral.setProperty("/aListaSolicitud", aListMDTableReduce);
            if (aListMDTableReduce.length === 0) {
                MessageBox.warning("No se encontró ningún registro.")
            }
        },

        onChangeRdb: function (oEvent) {
            let nSelected = oEvent.getSource().getSelectedIndex();
            var destinatariosNew = this.modelGeneral.getProperty("/newRMD/destinatarios");
            var destinatariosVersion = this.modelGeneral.getProperty("/newVersionRMD/destinatarios");
            this.modelGeneral.setProperty("/newRMD", {});
            this.modelGeneral.setProperty("/newVersionRMD", {});
            this.modelGeneral.setProperty("/newRMD/destinatarios", destinatariosNew);
            this.modelGeneral.setProperty("/newVersionRMD/destinatarios", destinatariosVersion);
            if (nSelected === 0) {
            this.onState(true, "new");
            this.onState(false, "version");
            } else {
            this.onState(false, "new");
            this.onState(true, "version");
            }
        },

        // Funcion para poner false o true a las propiedades de los componentes de la vista Ejem: (visible, enabled) 
        onState: function (bState, modelo) {
            let oModel = new JSONModel({
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

        onInitialization: function () {
            this.onState(true, "new");
            this.onState(false, "version");
        },

        onGetNewRequestRM: async function () {
            if (!this.oNewRequestRMD) {
                this.oNewRequestRMD = sap.ui.xmlfragment(
                    "frgNewRequestRMD",
                    rootPath + ".view.dialog.NewRequestRMD",
                    this
                );
                this.getView().addDependent(this.oNewRequestRMD);
            }

            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            var idDestinatariosVersion = sap.ui.core.Fragment.byId("frgNewRequestRMD", "idDestinatariosVersion");
            var idDestinatariosNew = sap.ui.core.Fragment.byId("frgNewRequestRMD", "idDestinatariosNew");
            var sExpand = "oRolWorkflow/aRolUsuarios/oUsuario";
            var oFilter = [];
            oFilter.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacion));
            oFilter.push(new Filter("oRol_rolId", 'EQ', oInfoUsuario.rol[0].rolId));
            var oDestinatarios = await solicitudService.getData(this.mainModelv2, "/ROLAPPWF", sExpand, oFilter);
            var aListDestinatarios = [];

            if(oDestinatarios.results.length > 0){
                oDestinatarios.results[0].oRolWorkflow.aRolUsuarios.results.forEach(function(e){
                    aListDestinatarios.push(e.oUsuario);
                });
                this.modelGeneral.setProperty("/destinations", aListDestinatarios);
                var array = [];
                aListDestinatarios.forEach(function(e){
                    array.push(e.usuarioId);
                });
                idDestinatariosNew.setSelectedKeys(array);
                idDestinatariosVersion.setSelectedKeys(array);
            }
            let aListRecetas = await solicitudService.getData(this.mainModelv2, "/RECETA", [], []);
            this.modelGeneral.setProperty("/RECETA", aListRecetas.results);
            this.oNewRequestRMD.open();
        },

        onCancelRequest: function () {
            var idRBG = sap.ui.core.Fragment.byId("frgNewRequestRMD", "rbg");
            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader2").setValue(null);
            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader3").setValue(null);
            this.modelGeneral.setProperty("/newRMD", {});
            this.modelGeneral.setProperty("/newVersionRMD", {});
            this.modelGeneral.setProperty("/aListaSeccionMD", []);
            this.modelGeneral.setProperty("/mdAsociadas", []);
            idRBG.setSelectedIndex(0);
            this.onState(true, "new");
            this.onState(false, "version");
            this.oNewRequestRMD.close();
        },

        onListDestinations: function (oEvent) {
            try {
                let oSource = oEvent.getSource();
                let oItem = oSource.getBindingContext("modelGeneral").getObject();
                if (!oThat._oPopover) {
                    Fragment.load({
                        id: "PopoverListDestinations",
                        name: rootPath + ".view.dialog.ListDestinations",
                        controller: oThat
                    }).then(function (oPopover) {
                        oThat._oPopover = oPopover;
                        oThat.getView().addDependent(oThat._oPopover);
                    }.bind(oThat));
                } 

                this.onGetDestinationsMd(oItem, function (getDestinatarios){
                    oThat.modelGeneral.setProperty("/destinationsMD", getDestinatarios);
                    oThat._oPopover.openBy(oSource);
                });               
            } catch (oError) {
            oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onGetDestinationsMd: function (oItem, callback){
            let sExpand = "destinatariosMD/usuarioId";
            var oFilter = [];
            oFilter.push(new Filter("mdId", 'EQ', oItem.mdId));
            solicitudService.getData(this.mainModelv2, "/MD", sExpand, oFilter).then(function (solicitudResult) {
                var objDestinatarios = [];
                solicitudResult.results[0].destinatariosMD.results.forEach(function(e){
                    if (e.usuarioId) {
                        objDestinatarios.push(e.usuarioId);
                    }
                });
                callback(objDestinatarios);
            });
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
                    let oErrorRes = JSON.parse(oError.responseText),
                    sErrorDetails = oErrorRes.error.innererror.errordetails;
                    MessageBox.error(sErrorDetails[0].message);
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

        onCreateRequest: function () {
            var idRBG = sap.ui.core.Fragment.byId("frgNewRequestRMD", "rbg");
            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            if(idRBG.getSelectedIndex() === 1) {
                var rmdSelected = oThat.modelGeneral.getProperty("/newVersionRMD");
                if((rmdSelected.mdId && rmdSelected.mdId !== "") && (rmdSelected.destinatarios && rmdSelected.destinatarios.length > 0) && (rmdSelected.adjuntos && rmdSelected.adjuntos.length > 0) && (rmdSelected.motivoId_motivoId && rmdSelected.motivoId_motivoId !== "")){
                    MessageBox.confirm(
                    oThat.getView().getModel("i18n").getResourceBundle().getText("confirmNewVersionRequest"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show();
                                var aFilter = [];
                                aFilter.push(new Filter("mdId", "EQ", rmdSelected.mdId));
                                let sExpand="destinatariosMD,aReceta"
                                var aResponse = await solicitudService.getData(oThat.mainModelv2, "/MD", sExpand, aFilter);
                                var aListSolicitud = aResponse.results[0];
                                var aListaReceta = aListSolicitud.aReceta;
                                delete aListSolicitud.aReceta;

                                var tipo = "1";
                                var año = (new Date().getFullYear()).toString();
                                var newCorrelativo;

                                solicitudService.getData(oThat.mainModelv2, "/MD", [], []).then(function (res) {
                                    if(res.results.length === 0) {
                                        newCorrelativo = "00001"
                                    } else {
                                        res.results.sort(function (a, b) {
                                            return b.codigoSolicitud - a.codigoSolicitud;
                                        });
                                        let lastCorrelativo;
                                        if (res.results[0]) {
                                            var lastCode =  res.results[0].codigoSolicitud;
                                            if(lastCode){
                                                lastCorrelativo = lastCode.substring(lastCode.length - 5, lastCode.length);
                                            } else {
                                                lastCorrelativo = "00000";
                                            }
                                        } else {
                                            lastCorrelativo = "00000";
                                        }
                                        var newValue = parseInt(lastCorrelativo) + 1;
                                        if (newValue < 10){
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
                                    let aVersionesAnteriores = res.results.filter(itm=>itm.descripcion === rmdSelected.descripcion && itm.estadoIdRmd_iMaestraId !== 466);
                                    aVersionesAnteriores.sort(function (a, b) {
                                        return b.codigo - a.codigo;
                                    });
                                    let codigoversionprincipal;
                                    codigoversionprincipal = aVersionesAnteriores[0].codigoversionprincipal;
                                    if(aVersionesAnteriores.length == 1){
                                        codigoversionprincipal = aVersionesAnteriores[0].codigo;
                                    }
                                    aVersionesAnteriores.sort(function (a, b) {
                                        return b.codigo - a.codigo;
                                    });
                                    let lastVersion = aVersionesAnteriores[0].version;
                                    aListSolicitud.codigo                   = null;
                                    aListSolicitud.mdId                     = util.onGetUUIDV4();
                                    aListSolicitud.version                  = lastVersion + 1;
                                    aListSolicitud.codigoSolicitud          = Newcodigo;
                                    aListSolicitud.fechaRegistro            = new Date();
                                    aListSolicitud.usuarioRegistro          = oInfoUsuario.data.usuario;
                                    aListSolicitud.estadoIdRmd_iMaestraId   = estadoSolicitado;
                                    aListSolicitud.motivoId_motivoId        = rmdSelected.motivoId_motivoId;
                                    aListSolicitud.areaRmdTxt               = rmdSelected.areaRmdTxt;
                                    aListSolicitud.nivelTxt                 = rmdSelected.nivelTxt;
                                    aListSolicitud.observacion              = rmdSelected.observacion;
                                    aListSolicitud.mdIdVersionAnt           = rmdSelected.mdId;
                                    aListSolicitud.fechaSolicitud           = new Date();
                                    aListSolicitud.estadoIdProceso_iMaestraId = estadoProcesoPendiente;
                                    aListSolicitud.fechaAutorizacion        = null;
                                    aListSolicitud.usuarioAutorizacion      = null;
                                    aListSolicitud.destinatariosMD          = [];
                                    aListSolicitud.codigoversionprincipal   = codigoversionprincipal;
                                    rmdSelected.destinatarios.forEach(function(e){
                                        var obj = {
                                            terminal                  : null,
                                            usuarioRegistro           : oInfoUsuario.data.usuario,
                                            fechaRegistro             : new Date(),
                                            activo                    : true,
                                            idMdDestinatarios         : util.onGetUUIDV4(),
                                            mdId_mdId                 : aListSolicitud.mdId,
                                            usuarioId_usuarioId       : e                                        
                                        }
                                        aListSolicitud.destinatariosMD.push(obj);
                                    });
                                    oThat.startInstance(aListSolicitud, oThat.fetchToken(), function(result){
                                        delete aListSolicitud.nivelMDWF;
                                        delete aListSolicitud.plantaMDWF;
                                        delete aListSolicitud.motivoMDWF;                                        
                                        aListSolicitud.wfInstanceId = result.id;
                                        solicitudService.crearSolicitud(oThat.mainModelv2, aListSolicitud).then(function () {

                                            // aListaReceta.results.forEach(async function(e, index){
                                            //     var updReceta = {
                                            //         'fechaActualiza'    : new Date(),
                                            //         'usuarioActualiza'  : oInfoUsuario.data.usuario,
                                            //         'activo'            : false,
                                            //     }
                                            //     await solicitudService.updateData(oThat.mainModelv2, "/MD_RECETA", updReceta, e.mdRecetaId);

                                            //     let oEstReInsumo = {
                                            //         mdRecetaId_mdRecetaId: e.mdRecetaId,
                                            //         fechaActualiza: new Date(),
                                            //         usuarioActualiza: oInfoUsuario.data.usuario,
                                            //         activo: false
                                            //     };
                                            //     await solicitudService.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oEstReInsumo);

                                            //     var createNewReceta = {
                                            //         fechaRegistro       : new Date(),
                                            //         usuarioRegistro     : oInfoUsuario.data.usuario,
                                            //         activo              : true,
                                            //         mdRecetaId          : util.onGetUUIDV4(),
                                            //         mdId_mdId           : aListSolicitud.mdId,
                                            //         recetaId_recetaId   : e.recetaId_recetaId,
                                            //         orden               : index + 1
                                            //     }
                                            //     await solicitudService.onCreate(oThat.mainModelv2, "/MD_RECETA", createNewReceta);
                                            // });

                                            rmdSelected.adjuntos.forEach(async function(e){
                                                e.mdId = aListSolicitud.mdId;
                                                var oParam = {
                                                    usuarioActualiza    : oInfoUsuario.data.usuario,
                                                    fechaActualiza      : new Date(),
                                                    archivoMD           : JSON.stringify(e)
                                                }
                                                await solicitudService.updateData(oThat.mainModelv2, "/MD", oParam, aListSolicitud.mdId);
                                            });
                                                                                
                                            oThat.oNewRequestRMD.close();
                                            oThat.modelGeneral.setProperty("/newRMD", {});
                                            oThat.modelGeneral.setProperty("/newVersionRMD", {});
                                            oThat.modelGeneral.setProperty("/aListaSeccionMD", []);
                                            oThat.modelGeneral.setProperty("/mdAsociadas", []);
                                            oThat.onRefreshSolicitud();
                                            BusyIndicator.hide();
                                            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader2").setValue(null);
                                            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader3").setValue(null);
                                            idRBG.setSelectedIndex(0);
                                            oThat.onState(true, "new");
                                            oThat.onState(false, "version");
                                            BusyIndicator.hide();  
                                            MessageBox.success("Se creó satisfactoriamente la nueva versión para la MD: " + Newcodigo + ".");
                                        }.bind(oThat), function (error) {
                                            BusyIndicator.hide();
                                            MessageBox.error("Ocurrió un error al registrar la solicitud.");
                                            console.log(error);
                                        });
                                    });  
                                });             
                            }
                        }
                    });
                } else {
                    MessageBox.warning("Por favor complete los campos obligatorios.");
                }
            } else {
                var oData = this.modelGeneral.getProperty("/newRMD");
                var oReturn = this.validateNewRMD(oData);
                if(oReturn){
                    MessageBox.confirm(
                    oThat.getView().getModel("i18n").getResourceBundle().getText("confirmAddNewRequest"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show();
                                var tipo = "1";
                                var año = (new Date().getFullYear()).toString();
                                var newCorrelativo;
                                solicitudService.getData(oThat.mainModelv2, "/MD", [], []).then(function (res) {
                                    if(res.results.length === 0) {
                                        newCorrelativo = "00001"
                                    } else {
                                        res.results.sort(function (a, b) {
                                            return b.codigoSolicitud - a.codigoSolicitud;
                                        });
                                        let lastCorrelativo;
                                        if (res.results[0]) {
                                            var lastCode =  res.results[0].codigoSolicitud;
                                            if(lastCode){
                                                lastCorrelativo = lastCode.substring(lastCode.length - 5, lastCode.length);
                                            } else {
                                                lastCorrelativo = "00000";
                                            }
                                        } else {
                                            lastCorrelativo = "00000";
                                        }
                                        var newValue = parseInt(lastCorrelativo) + 1;
                                        if (newValue < 10){
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
                                    var oParam = {
                                        fechaRegistro           : new Date(),
                                        mdId                    : util.onGetUUIDV4(),
                                        usuarioRegistro         : oInfoUsuario.data.usuario,
                                        activo                  : true,
                                        version                 : 1,
                                        estadoIdRmd_iMaestraId  : estadoSolicitado,
                                        codigoSolicitud         : Newcodigo,
                                        descripcion             : oData.descripcion,
                                        sucursalId_iMaestraId   : oData.sucursalId,
                                        motivoId_motivoId       : oData.motivoId,
                                        observacion             : oData.observacion,
                                        areaRmdTxt              : oData.areaRmdTxt,
                                        nivelTxt                : oData.nivelTxt,
                                        destinatariosMD         : []
                                    };
                                    oData.destinatarios.forEach(function(e){
                                        oParam.destinatariosMD.push({
                                            fechaRegistro       : new Date(),
                                            usuarioRegistro     : oInfoUsuario.data.usuario,
                                            activo              : true,
                                            idMdDestinatarios   : util.onGetUUIDV4(), 
                                            mdId_mdId           : oParam.mdId,
                                            usuarioId_usuarioId : e
                                        });
                                    });
                                    oThat.startInstance(oParam, oThat.fetchToken(), function(result){
                                        delete oParam.nivelMDWF;
                                        delete oParam.plantaMDWF;
                                        delete oParam.motivoMDWF;
                                        oParam.wfInstanceId = result.id;
                                        solicitudService.crearSolicitud(oThat.mainModelv2, oParam).then(function () {
                                            oData.adjuntos.forEach(async function(e){
                                                e.mdId = oParam.mdId;
                                                var itm = {
                                                    usuarioActualiza    : oInfoUsuario.data.usuario,
                                                    fechaActualiza      : new Date(),
                                                    archivoMD           : JSON.stringify(e)
                                                }
                                                await solicitudService.updateData(oThat.mainModelv2, "/MD", itm, oParam.mdId);
                                            });

                                            oThat.oNewRequestRMD.close();
                                            oThat.modelGeneral.setProperty("/newRMD", {});
                                            oThat.modelGeneral.setProperty("/newVersionRMD", {});
                                            oThat.modelGeneral.setProperty("/aListaSeccionMD", []);
                                            oThat.modelGeneral.setProperty("/mdAsociadas", []);
                                            oThat.onRefreshSolicitud();
                                            BusyIndicator.hide();
                                            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader2").setValue(null);
                                            sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader3").setValue(null);
                                            MessageBox.success("Se registró correctamente la solicitud: " + Newcodigo + ".");   
                                        }.bind(oThat), function (error) {
                                            BusyIndicator.hide();
                                            MessageBox.error("Ocurrió un error al registrar la solicitud.");
                                            console.log(error);
                                        });
                                    });    
                                });                        
                            }
                        }
                    });
                } else {
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("errorCreate"));
                }
                
            } 
        },

        onCrearSolicitud: async function (oParam) {
            var resultCrearSolicitud = await solicitudService.crearSolicitud(this.mainModelv2, oParam);
        },

        validateNewRMD: function (oData) {
            var data = true;
            if(!oData.adjuntos){
                data = false; 
            }
            if(oData.destinatarios){
                oData.destinatarios.join(",") !== "" ? "" : data = false;
            } else {
               data = false; 
            }            
            oData.descripcion ? "" :data = false;
            oData.sucursalId ? "" :data = false;
            oData.motivoId ? "" :data = false;
            oData.areaRmdTxt ? "": data = false;
            oData.nivelTxt ? "": data = false;
            return data;
        },

        onSearch: async function () {
            var flag = true;
            var aFilters = this.modelGeneral.getProperty("/aFilters");
            var aFilter = [];
            if(!aFilters.aplicacionId){
               MessageToast.show("Por favor seleccione una aplicación");
               flag = false;
            }
            if (flag) {
                BusyIndicator.show();
                if(aFilters.codigoSolicitud){
                    var oFilter = new Filter("codigoSolicitud", FilterOperator.Contains, aFilters.codigoSolicitud);
                    aFilter.push(oFilter);
                }
                if(aFilters.codigoRMD){
                    var oFilter = new Filter("codigo", FilterOperator.Contains, aFilters.codigoRMD);
                    aFilter.push(oFilter);
                }
                if(aFilters.nombreRMD){
                    var oFilter = this.createFilter("descripcion", FilterOperator.Contains, aFilters.nombreRMD, true);
                    aFilter.push(oFilter);
                }
                if(aFilters.sucursal){
                    var oFilter = new Filter("sucursalId_iMaestraId", "EQ", aFilters.sucursal);
                    aFilter.push(oFilter);
                }
                if(aFilters.estadoSolicitud){
                    var oFilter = new Filter("estadoIdRmd_iMaestraId", "EQ", aFilters.estadoSolicitud);
                    aFilter.push(oFilter);
                }
                if(aFilters.estadoProceso) {
                    var oFilter = new Filter("estadoIdProceso_iMaestraId", "EQ", aFilters.estadoProceso);
                    aFilter.push(oFilter);
                }
                if(aFilters.seccion){
                    var oFilter = new Filter("areaRmdTxt", "EQ", aFilters.seccion);
                    aFilter.push(oFilter);
                }
                if(aFilters.destinatariosMD) {
                    var oDestinatarioMD = aFilters.destinatariosMD;
                }
                if(aFilters.recetaId) {
                    var oRecetaId = aFilters.recetaId;
                }
                if(aFilters.fechaInicio) {
                    var fechaInicio = new Date(aFilters.fechaInicio);
                    var fechaFin = new Date(aFilters.fechaFin);
                    var oFilter = new Filter("fechaRegistro", "BT", fechaInicio, fechaFin);
                    aFilter.push(oFilter);
                }
                await this.onRefreshSolicitud(aFilter, oDestinatarioMD, oRecetaId);
                BusyIndicator.hide();
            }            
        },

        createFilter: function(key, operator, value, useToLower) {
            return new Filter(useToLower ? "tolower(" + key + ")" : key, operator, useToLower ? "'" + value.toLowerCase() + "'" : value);
        },

        onRestoreFilters: async function () {
            BusyIndicator.show();
            this.modelGeneral.setProperty("/oInfoUsuario", {});
            this.modelGeneral.setProperty("/aFilters", {});
            this.modelGeneral.setProperty("/aListaSolicitud", []);
            BusyIndicator.hide();
        },

        handleUploadComplete: function (oEvent) {
            var that = this;
            var oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                var reader = new FileReader();           
                reader.onload = function () {
                    let encoded = reader.result.toString();
                    let byteArray = encoded.split(',')[1];
                    var obj = {
                        'name': oFile.name,
                        'size': oFile.size,
                        'fileData': byteArray,
                        'Name': oFile.name
                    }
                    var newRMD = that.modelGeneral.getProperty("/newRMD");
                    if(!newRMD.adjuntos) {
                        newRMD.adjuntos = [];
                    }
                    newRMD.adjuntos.push(obj);
                    that.modelGeneral.refresh(true);
                };
                reader.onerror = async function (error) {
                    console.log('Error: ', error);
                };
                reader.readAsDataURL(oFile);
            }     
        },

        onEliminarNewAdjunto: function (oEvent) {
            var lineaSeleccionada = this.modelGeneral.getProperty("/newRMD");
            var oPath = oEvent.getSource().getParent().getBindingContextPath();             
            lineaSeleccionada.adjuntos.splice(oPath.split("/")[oPath.split("/").length - 1],1);
            this.modelGeneral.refresh(true);
        },

        handleUploadCompleteVersion: function (oEvent) {
            var that = this;
            var oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                var reader = new FileReader();
                reader.onload = function () {
                    let encoded = reader.result.toString();
                    let byteArray = encoded.split(',')[1];
                    var obj = {
                        'name': oFile.name,
                        'size': oFile.size,
                        'fileData': byteArray,
                        'Name': oFile.name
                    }
                    var newVersionRMD = that.modelGeneral.getProperty("/newVersionRMD");
                    if(!newVersionRMD.adjuntos) {
                        newVersionRMD.adjuntos = [];
                    }
                    newVersionRMD.adjuntos.push(obj);
                    that.modelGeneral.refresh(true);
                };
                reader.onerror = async function (error) {
                    console.log('Error: ', error);
                };
                reader.readAsDataURL(oFile);
            }    
        },

        onEliminarVersionAdjunto: function (oEvent) {
            var lineaSeleccionada = this.modelGeneral.getProperty("/newVersionRMD");
            var oPath = oEvent.getSource().getParent().getBindingContextPath();             
            lineaSeleccionada.adjuntos.splice(oPath.split("/")[oPath.split("/").length - 1],1);
            this.modelGeneral.refresh(true);
        },

        onViewAdjuntoMD: async function (oEvent) {
            let oSource = oEvent.getSource();
            if (!oThat.oListAdjuntos) {
                Fragment.load({
                    id: "frgAdjuntos",
                    name: rootPath + ".view.dialog.ListAdjuntos",
                    controller: oThat
                }).then(function (oPopover) {
                    oThat.oListAdjuntos = oPopover;
                    oThat.getView().addDependent(oThat.oListAdjuntos);
                }.bind(oThat));
            } 
            var oPath = oSource.getParent().getParent().getBindingContextPath(); 
            var lineaSeleccionada = this.modelGeneral.getProperty(oPath);
            if (oAplicacion===oAplicacionConfiguracionId) {
                lineaSeleccionada.origen = "Configuracion";
                var oData = {
                    mdId : lineaSeleccionada.mdId,
                    origen : "Solicitud"
                }
                var oAdjuntoSPSolic = await sharepointService.sharepointGet(oThat.mainModelv2, oData);
                oAdjuntoSPSolic.forEach(function (e){
                    e.codigoRM = lineaSeleccionada.mdId;
                });
            } else {
                lineaSeleccionada.origen = "Solicitud";
            }
            if(lineaSeleccionada){
                var oAdjuntoSP = await sharepointService.sharepointGet(oThat.mainModelv2, lineaSeleccionada);
                oAdjuntoSP.forEach(function (e){
                    e.codigoRM = lineaSeleccionada.mdId; 
                });
                if(oAdjuntoSPSolic){
                    if (oAdjuntoSPSolic.length > 0) {
                        oAdjuntoSP = oAdjuntoSP.concat(oAdjuntoSPSolic);
                    }
                }
                oThat.modelGeneral.setProperty("/Adjunto", oAdjuntoSP);
                oThat.oListAdjuntos.openBy(oSource);
            }             
        },

        onDownloadAdjunto: async function (oEvent) {
            var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelGeneral.sPath;
            var oAdjunto = this.modelGeneral.getProperty(sPath);
            var obj = {};
            obj.codigoRM = oAdjunto.codigoRM;
            obj.Name = oAdjunto.Name;
            if (oAplicacion===oAplicacionConfiguracionId) {
                obj.origen = "Configuracion";
            }
            var oDownloadResult = await sharepointService.sharePointDownload(this.mainModelv2, obj);
            if (oDownloadResult.statusCode === 404) {
                obj.origen = "Solicitud";
                oDownloadResult = await sharepointService.sharePointDownload(this.mainModelv2, obj);
            }
            var len = oDownloadResult.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i <len; i++) {
                bytes[i]= oDownloadResult.charCodeAt(i);
            }
            var arrBuffer =bytes.buffer;
            var blob = new Blob([arrBuffer],{
                type: "application/vnd.openxmlformats"
            });
            
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = oAdjunto.Name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);  
        },

        onCerrarAdjuntos: function () {
            oThat.modelGeneral.setProperty("/Adjunto", {});
            this.oListAdjuntos.close();
        },

        startInstance: async function (oData, token, callback) {
            var oInfoUser = this.modelGeneral.getProperty("/oInfoUsuario");
            var sFilter = [];
            
            oData.destinatariosMD.forEach(function(e){
                sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId));
            });
            oData.nivelMDWF = oData.nivelTxt;
            var filterMaestra = [];
            var codePlanta;
            filterMaestra.push(new Filter("iMaestraId", 'EQ', oData.sucursalId_iMaestraId));
            // filterMaestra.push(new Filter("iMaestraId", 'EQ', oData.nivelId_iMaestraId));
            var arrayMaestra = await solicitudService.getData(this.mainModelv2, "/MAESTRA", [], filterMaestra);
            arrayMaestra.results.forEach(function(e){
                // if (e.oMaestraTipo_maestraTipoId === 15) {
                //     oData.nivelMDWF = e.contenido;
                // }
                if (e.oMaestraTipo_maestraTipoId === 18) {
                    oData.plantaMDWF = e.contenido;
                    codePlanta = e.codigo;
                }
            });
            var filterMotivo = [];
            filterMotivo.push(new Filter("motivoId", 'EQ', oData.motivoId_motivoId));
            var arrayMotivo = await solicitudService.getData(this.mainModelv2, "/MOTIVO", [], filterMotivo);
            arrayMotivo.results.forEach(function(e){
                oData.motivoMDWF = e.descripcion;
            });
            var array = [];
            await solicitudService.getData(this.mainModelv2, "/USUARIO", [], sFilter).then(async function(res){
                let oUsuario = {results: []};

                for await (const oUsuarioSystem of oThat.aUsuarioSystem.results) {
                    let oUsuarioFind = res.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId);
                    if (oUsuarioFind) {
                        oUsuario.results.push(oUsuarioFind);
                    }
                }

                oUsuario.results.forEach(function(e){
                    if (e.oMaestraSucursal_codigo === codePlanta) {
                        array.push(e.correo);
                    }
                });

                var userData = {
                    'DISPLAYNAME': oInfoUser.data.nombre,
                    'DISPLAYLASTNAME': oInfoUser.data.apellidoPaterno,
                    'EMAIL': oInfoUser.data.correo
                }
                var approverUserData = {
                    'EMAIL': array.join(",")
                }
                var obj = {
                    'requestUserData': userData,
                    'bpRequestData': oData,
                    'approverUserData': approverUserData
                }
                
                $.ajax({
                    url: oThat.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/workflow-instances"),
                    method: "POST",
                    async: false,
                    contentType: "application/json",
                    headers: {
                        "X-CSRF-Token": token
                    },
                    data: JSON.stringify({
                        definitionId: "mif.rmd.solicitudrmd",
                        context: obj
                    }),
                    success: function (result, xhr, data) {
                        callback(result);
                    },
                    error: function (oError) {
                        var e = oError;
                    }
                });
            });
        },
        
        fetchToken: function () {
			var token;
			$.ajax({
				url: oThat.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/xsrf-token"),
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
        },

        onPressMD : async function (oEvent) {
            var that = this;
            BusyIndicator.show();
            if (!that.oDetalleRMD) {
                that.oDetalleRMD = sap.ui.xmlfragment(
                    "frgDetailRMD",
                    rootPath + ".view.dialog.DetailRMD",
                    that
                );
                that.getView().addDependent(that.oDetalleRMD);
            }
            var oContext = oEvent.getSource().getBindingContext("modelGeneral")
            var obj = {
                lineaSeleccionada: oContext.getObject(),
                pathSeleccionado: oContext.getPath(),
            }
            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            
            let sExpand = "oRolWorkflow/aRolUsuarios/oUsuario";
            var oFilter = [];
            oFilter.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacion));
            if(oAplicacion === oAplicacionSolicitudId) {
                oFilter.push(new Filter("oRol_rolId", 'EQ', oInfoUsuario.rol[0].rolId));
            } else {
                if (obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe || obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoDevueGeje) {
                    oFilter.push(new Filter("oRol_rolId", 'EQ', oRolJefeProduccion));
                } else if (obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere || obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoDevueGere) {
                    oFilter.push(new Filter("oRol_rolId", 'EQ', oRolGerenteProduccion));
                } else if (obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere || obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoDevJefeDT) {
                    oFilter.push(new Filter("oRol_rolId", 'EQ', oRolGerenteProduccion));
                }
            }
            var oDestinatarios = await solicitudService.getData(this.mainModelv2, "/ROLAPPWF", sExpand, oFilter);
            var aListDestinatarios = [];
            obj.lineaSeleccionada.debeAprobar = false;
            var existeDestinatario = obj.lineaSeleccionada.destinatariosMD.results.find(item=>item.usuarioId_usuarioId === oInfoUsuario.data.usuarioId);
            if (existeDestinatario) {
                if(obj.lineaSeleccionada.estadoIdRmd_iMaestraId === estadoSolicitado) {
                    obj.lineaSeleccionada.debeAprobar = true;
                }
                if(obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe && oInfoUsuario.rol[0].rolId === oRolJefeProduccion){
                    obj.lineaSeleccionada.debeAprobar = true;
                }
                if(obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere && oInfoUsuario.rol[0].rolId === oRolGerenteProduccion){
                    obj.lineaSeleccionada.debeAprobar = true;
                }
                if(obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere && oInfoUsuario.rol[0].rolId === oRolJefaturaDT){
                    obj.lineaSeleccionada.debeAprobar = true;
                }
            }
            if(oDestinatarios.results.length > 0) {
                oDestinatarios.results[0].oRolWorkflow.aRolUsuarios.results.forEach(function(e){
                    if (e.oUsuario) {
                        aListDestinatarios.push(e.oUsuario);
                    }
                });
            }
            this.modelGeneral.setProperty("/destinations", aListDestinatarios);
            var oAdjuntoSP = await sharepointService.sharepointGet(oThat.mainModelv2, oContext.getObject());
            oAdjuntoSP.forEach(function (e){
                e.codigoRM = oContext.getObject().mdId;
            });
            if (oAplicacion === oAplicacionConfiguracionId) {
                let oObj = {
                    origen: 'Configuracion',
                    idMd:  oContext.getObject().mdId
                }
                var oAdjuntoSPConfig = await sharepointService.sharepointGet(oThat.mainModelv2, oObj);
                oAdjuntoSPConfig.forEach(function (e){
                    e.codigoRM = oContext.getObject().mdId;
                });
                oAdjuntoSP = oAdjuntoSP.concat(oAdjuntoSPConfig);
            }
            var objDestinatarios = [];
            if (oAplicacion === oAplicacionSolicitudId) {
                // obj.lineaSeleccionada.destinatariosMD.results.forEach(function(e){
                //     objDestinatarios.push(e.usuarioId);
                // });
                aListDestinatarios.forEach(function(e){
                    objDestinatarios.push(e);
                });
            } else {
                obj.lineaSeleccionada.destinatariosMD.results.forEach(function(e){
                    if (e.usuarioId) {
                        objDestinatarios.push(e.usuarioId);
                    }
                });
            }
            that.modelGeneral.setProperty("/destinatariosBackup", objDestinatarios);
            var idDestinatarios = sap.ui.core.Fragment.byId("frgDetailRMD", "idDestinatariosEdit");
            var array = [];
            objDestinatarios.forEach(function(e){
                if (oAplicacion === oAplicacionSolicitudId || obj.lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {
                    array.push(e.usuarioId);
                }
            });
            idDestinatarios.setSelectedKeys(array);
            obj.lineaSeleccionada.adjuntos = oAdjuntoSP;
            var objLineaSeleccionadaToEdit = Object.assign({}, obj.lineaSeleccionada);
            that.modelGeneral.setProperty("/lineaSeleccionada", objLineaSeleccionadaToEdit);
            // that.onChangeSeccionMD(false, objLineaSeleccionadaToEdit);
            that.modelGeneral.setProperty("/lineaSeleccionadaBackUp", obj);      
            that.oDetalleRMD.open();
            BusyIndicator.hide();
        },

        onEliminarAdjunto: function (oEvent) {
            var lineaSeleccionada = this.modelGeneral.getProperty("/lineaSeleccionada");
            var oPath = oEvent.getSource().getParent().getBindingContextPath(); 
            var adjuntoSeleccionado = this.modelGeneral.getProperty(oPath);
            if(!adjuntoSeleccionado.nuevo){
                var obj = {
                    'codigoRM': lineaSeleccionada.mdId,
                    'Name': adjuntoSeleccionado.Name
                }
                var aListaAdjuntosEliminados = this.modelGeneral.getProperty("/adjuntoEliminado");
                aListaAdjuntosEliminados.push(obj);
                lineaSeleccionada.adjuntos.splice(oPath.split("/")[oPath.split("/").length - 1],1);
            } else {
                lineaSeleccionada.adjuntos.splice(oPath.split("/")[oPath.split("/").length - 1],1);
            }            
            this.modelGeneral.refresh(true);
        },

        onSubirAdjuntoEdit: function (oEvent) {
            var that = this;
            var oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                var reader = new FileReader();
                reader.onload = function () {
                    let encoded = reader.result.toString();
                    let byteArray = encoded.split(',')[1];
                    var obj = {
                        'name': oFile.name,
                        'size': oFile.size,
                        'fileData': byteArray,
                        'nuevo': true,
                        'Name': oFile.name
                    }
                    that.modelGeneral.getProperty("/lineaSeleccionada/adjuntos").push(obj);
                    that.modelGeneral.refresh(true);
                };
                reader.onerror = async function (error) {
                    console.log('Error: ', error);
                };
                reader.readAsDataURL(oFile);
            }
        },

        onAprobarSolicitud: function () {
            var that = this;
            var lineaSeleccionada = this.modelGeneral.getProperty("/lineaSeleccionada");
            var aListDestinatarios = this.modelGeneral.getProperty("/destinatariosEdit");
            if(aListDestinatarios.length === 0) {
                MessageBox.warning("Por favor seleccione destinatarios.");
                return;
            } else {
                MessageBox.confirm("¿Está seguro que desea realizar la aprobación?", {
                    styleClass: "sapUiSizeCompact",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: async function (oAction) {
                        if (oAction === "YES") {
                            BusyIndicator.show();
                            var oInfoUsuario = that.modelGeneral.getProperty("/oInfoUsuario");
                            if (lineaSeleccionada.estadoIdRmd_iMaestraId === estadoSolicitado) {
                                var obj = {
                                    usuarioActualiza            : oInfoUsuario.data.usuario,
                                    fechaActualiza              : new Date(),
                                    mdId                        : lineaSeleccionada.mdId,
                                    estadoIdRmd_iMaestraId      : estadoSolicitudAprobada,
                                    wfInstanceId                : null,
                                    estadoIdProceso_iMaestraId  : estadoProcesoPendiente,
                                    motivoId_motivoId           : lineaSeleccionada.motivoId_motivoId
                                }
                                var userTask =  "usertask2";
                                oParam = {
                                    fechaRegistro               : new Date(),
                                    usuarioRegistro             : oInfoUsuario.data.usuario,
                                    activo                      : true,
                                    idProceso                   : util.onGetUUIDV4(),
                                    mdId_mdId                   : lineaSeleccionada.mdId,
                                    tipo                        : "SOLICITUD"
                                }
                                let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                                if (!bValidateWorkflow) {
                                    MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                                    await oThat.onDeleteSolicitudError(lineaSeleccionada);
                                    that.oDetalleRMD.close();
                                    BusyIndicator.hide();
                                    that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                    that.onRefreshSolicitud();
                                    return false;
                                }
                                await solicitudService.onCreate(that.mainModelv2, "/MD_ESTATUSPROCESO", oParam);
                            } else {
                                var userTask;
                                let tipoUsuario;
                                var obj = {
                                    usuarioActualiza            : oInfoUsuario.data.usuario,
                                    fechaActualiza              : new Date(),
                                    mdId                        : lineaSeleccionada.mdId
                                }
                                
                                var oParam = {
                                    fechaRegistro               : new Date(),
                                    usuarioRegistro             : oInfoUsuario.data.usuario,
                                    activo                      : true,
                                    idProceso                   : util.onGetUUIDV4(),
                                    mdId_mdId                   : lineaSeleccionada.mdId,
                                    mensajeDT                   : lineaSeleccionada.mensajeDT,
                                    observacion                 : null,
                                    tipo                        : "CONFIGURACION"
                                }
                                if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe) {          //PRIMER NIVEL
                                    userTask =  "usertask6";
                                    obj.estadoIdProceso_iMaestraId = estadoProcesoProceGere;
                                    oParam.estadoIdProceso_iMaestraId = estadoProcesoProceGere;
                                    tipoUsuario = tipoGerenteProd;
                                    let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                                    if (!bValidateWorkflow) {
                                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                                        await oThat.onDeleteSolicitudError(lineaSeleccionada);
                                        that.oDetalleRMD.close();
                                        BusyIndicator.hide();
                                        that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                        that.onRefreshSolicitud();
                                        return false;
                                    }
                                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere) {   //SEGUNDO NIVEL
                                    userTask =  "usertask7";
                                    obj.estadoIdProceso_iMaestraId = estadoProcesoAprobGere;
                                    oParam.estadoIdProceso_iMaestraId = estadoProcesoAprobGere;
                                    tipoUsuario = tipoJefaturaDT;
                                    let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                                    if (!bValidateWorkflow) {
                                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                                        await oThat.onDeleteSolicitudError(lineaSeleccionada);
                                        that.oDetalleRMD.close();
                                        BusyIndicator.hide();
                                        that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                        that.onRefreshSolicitud();
                                        return false;
                                    }
                                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {   //TERCER NIVEL
                                    userTask =  "usertask8";
                                    obj.estadoIdRmd_iMaestraId = estadoAutorizado;
                                    obj.estadoIdProceso_iMaestraId = estadoProcesoAprobJefeDT;
                                    obj.fechaAutorizacion = new Date();
                                    obj.usuarioAutorizacion = oInfoUsuario.data.usuario;
                                    oParam.estadoIdProceso_iMaestraId = estadoProcesoAprobJefeDT;
                                    let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                                    if (!bValidateWorkflow) {
                                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                                        await oThat.onDeleteSolicitudError(lineaSeleccionada);
                                        that.oDetalleRMD.close();
                                        BusyIndicator.hide();
                                        that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                        that.onRefreshSolicitud();
                                        return false;
                                    }
                                    var updTraz = {
                                        activo                  : true,
                                        usuarioRegistro         : oInfoUsuario.data.usuario,
                                        fechaRegistro           : new Date(),
                                        idTrazabilidad          : util.onGetUUIDV4(),
                                        mdId_mdId               : lineaSeleccionada.mdId,
                                        estadoTrazab_iMaestraId : estadoAutorizado
                                    }
                                    await solicitudService.onCreate(that.mainModelv2, "/MD_TRAZABILIDAD", updTraz);
                                    var aListaAutorizado = that.modelGeneral.getProperty("/aListaAutorizado");
                                    aListaAutorizado.adjuntos.forEach(async function(e){
                                        e.origen = "AutorizadoMD";
                                        e.mdId = lineaSeleccionada.mdId;
                                        var oParam = {
                                            usuarioActualiza    : oInfoUsuario.data.usuario,
                                            fechaActualiza      : new Date(),
                                            archivoMD           : JSON.stringify(e)
                                        }
                                        await solicitudService.updateData(oThat.mainModelv2, "/MD", oParam, lineaSeleccionada.mdId);
                                    });

                                }
                                await solicitudService.onCreate(that.mainModelv2, "/MD_ESTATUSPROCESO", oParam);
                                // lineaSeleccionada.destinatariosMD.results.forEach(async function(e){
                                //     var updDestinatarios = {
                                //         usuarioActualiza    : oInfoUsuario.data.usuario,
                                //         fechaActualiza      : new Date(),
                                //         activo              : false
                                //     }
                                //     await solicitudService.updateData(that.mainModelv2, "/MD_DESTINATARIOS", updDestinatarios, e.idMdDestinatarios);
                                // });
                                if (lineaSeleccionada.estadoIdProceso_iMaestraId !== estadoProcesoAprobGere) {
                                    aListDestinatarios.forEach(async function(e){
                                        var objCreateDestinatarios = {
                                            usuarioRegistro           : oInfoUsuario.data.usuario,
                                            fechaRegistro             : new Date(),
                                            activo                    : true,
                                            idMdDestinatarios         : util.onGetUUIDV4(),
                                            mdId_mdId                 : lineaSeleccionada.mdId,
                                            tipo                      : tipoUsuario,
                                            usuarioId_usuarioId       : e                                        
                                        }
                                        await solicitudService.onCreate(that.mainModelv2, "/MD_DESTINATARIOS", objCreateDestinatarios);
                                    });
                                }
                            }                       
                            solicitudService.updateSolicitud(that.mainModelv2, "/MD", obj).then(async function(){ 
                                var task = await workflowService.getTaskContextByActivityId(lineaSeleccionada.wfInstanceId, userTask);
                                var cContext = Object.assign({}, task.context);
                                cContext.requestUserData = task.context.requestUserData;
                                cContext.bpRequestData = task.context.bpRequestData;
                                if (lineaSeleccionada.estadoIdRmd_iMaestraId === estadoSolicitado) {
                                    var filterMotivo = [];
                                    filterMotivo.push(new Filter("motivoId", 'EQ', obj.motivoId_motivoId));
                                    var arrayMotivo = await solicitudService.getData(oThat.mainModelv2, "/MOTIVO", [], filterMotivo);
                                    arrayMotivo.results.forEach(function(e){
                                        cContext.bpRequestData.motivoId_motivoId = obj.motivoId_motivoId;
                                        cContext.bpRequestData.motivoMDWF = e.descripcion;
                                    });
                                    cContext.action = "A";
                                    cContext.NameUserAprob = oInfoUsuario.data.nombre;
                                    cContext.LastNameUserAprob = oInfoUsuario.data.apellidoPaterno;                   
                                    await workflowService.completeTask(task.id, cContext);
                                    if (lineaSeleccionada.version !== 1) {
                                        await oThat.onRegistrarEstructurasNuevaVersion(lineaSeleccionada);
                                    }
                                    that.oDetalleRMD.close();
                                    BusyIndicator.hide();
                                    MessageBox.success("Se realizó la aprobación correctamente.");
                                    that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                    that.onRefreshSolicitud();
                                }
                                if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe || lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere || lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {
                                    var sFilter = [];
                                    aListDestinatarios.forEach(function (e) {
                                        sFilter.push(new Filter("usuarioId", 'EQ', e));
                                    });
                                    var array = [];
                                    solicitudService.getData(oThat.mainModelv2, "/USUARIO", [], sFilter).then(async function (res) {
                                        let oUsuario = {results: []};

                                        for await (const oUsuarioSystem of oThat.aUsuarioSystem.results) {
                                            let oUsuarioFind = res.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId);
                                            if (oUsuarioFind) {
                                                oUsuario.results.push(oUsuarioFind);
                                            }
                                        }

                                        oUsuario.results.forEach(function (e) {
                                            array.push(e.correo)
                                        });
                                        cContext.approverUserData = {
                                            'EMAIL': array.join(",")
                                        }
                                        cContext.actionChange = '';
                                        cContext.action = "A";
                                        cContext.NameUserAprob = oInfoUsuario.data.nombre;
                                        cContext.LastNameUserAprob = oInfoUsuario.data.apellidoPaterno;                   
                                        await workflowService.completeTask(task.id, cContext); 
                                        that.oDetalleRMD.close();
                                        BusyIndicator.hide();
                                        MessageBox.success("Se realizó la aprobación correctamente.");
                                        that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                        that.onRefreshSolicitud();
                                    });
                                }
                                BusyIndicator.hide();    
                            }, function (oError) {
                                console.log(oError)
                                BusyIndicator.hide();
                                MessageBox.alert("Ocurrió un error en la aprobación.", {
                                    icon : MessageBox.Icon.ERROR,
                                    title : "Error"
                                });
                            });                         
                        }
                    }
                });
            }
        },

        onRechazarSolicitud: async function (sText) {
            BusyIndicator.show();
            var that = this;
            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            var lineaSeleccionada = this.modelGeneral.getProperty("/lineaSeleccionada");
            if (lineaSeleccionada.estadoIdRmd_iMaestraId === estadoSolicitado) {
                var obj = {
                    usuarioActualiza        : oInfoUsuario.data.usuario,
                    fechaActualiza          : new Date(),
                    mdId                    : lineaSeleccionada.mdId,
                    estadoIdRmd_iMaestraId  : 470,
                    motivoRechazo           : sText,
                    motivoId_motivoId       : lineaSeleccionada.motivoId_motivoId
                } 
                var userTask =  "usertask2";
                let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                if (!bValidateWorkflow) {
                    MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                    await oThat.onDeleteSolicitudError(lineaSeleccionada);
                    that.oDetalleRMD.close();
                    BusyIndicator.hide();
                    that.modelGeneral.setProperty("/aListaSeccionMD", []);
                    that.onRefreshSolicitud();
                    return false;
                }
                oParam = {
                    fechaRegistro               : new Date(),
                    usuarioRegistro             : oInfoUsuario.data.usuario,
                    activo                      : true,
                    idProceso                   : util.onGetUUIDV4(),
                    mdId_mdId                   : lineaSeleccionada.mdId,
                    tipo                        : "SOLICITUD"
                }
                await solicitudService.onCreate(that.mainModelv2, "/MD_ESTATUSPROCESO", oParam);
            } else {
                var userTask 
                var obj = {
                    usuarioActualiza            : oInfoUsuario.data.usuario,
                    fechaActualiza              : new Date(),
                    mdId                        : lineaSeleccionada.mdId,
                    estadoIdProceso_iMaestraId  : estadoProcesoDevueGeje
                }
                var oParam = {
                    fechaRegistro               : new Date(),
                    usuarioRegistro             : oInfoUsuario.data.usuario,
                    activo                      : true,
                    idProceso                   : util.onGetUUIDV4(),
                    mdId_mdId                   : lineaSeleccionada.mdId,
                    mensajeDT                   : lineaSeleccionada.mensajeDT,
                    observacion                 : sText,
                    estadoIdProceso_iMaestraId  : estadoProcesoDevueGeje,
                    tipo                        : "CONFIGURACION"
                }
                if(lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe) {           //PRIMER NIVEL
                    userTask =  "usertask6";
                    obj.estadoIdProceso_iMaestraId = estadoProcesoDevueGeje;
                    oParam.estadoIdProceso_iMaestraId = estadoProcesoDevueGeje;
                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere) {   //SEGUNDO NIVEL
                    userTask =  "usertask7";
                    obj.estadoIdProceso_iMaestraId = estadoProcesoDevueGere;
                    oParam.estadoIdProceso_iMaestraId = estadoProcesoDevueGere;
                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {   //TERCER NIVEL
                    userTask =  "usertask8";
                    obj.estadoIdProceso_iMaestraId = estadoProcesoDevJefeDT;
                    oParam.estadoIdProceso_iMaestraId = estadoProcesoDevJefeDT;
                }
                let bValidateWorkflow = await oThat.onValidateWorkflow(lineaSeleccionada, userTask);
                if (!bValidateWorkflow) {
                    MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                    await oThat.onDeleteSolicitudError(lineaSeleccionada);
                    that.oDetalleRMD.close();
                    BusyIndicator.hide();
                    that.modelGeneral.setProperty("/aListaSeccionMD", []);
                    that.onRefreshSolicitud();
                    return false;
                }
                await solicitudService.onCreate(that.mainModelv2, "/MD_ESTATUSPROCESO", oParam);
            }
           
            solicitudService.updateSolicitud(this.mainModelv2, "/MD", obj).then(async function(){  
                var task = await workflowService.getTaskContextByActivityId(lineaSeleccionada.wfInstanceId, userTask);
                var cContext = Object.assign({}, task.context);
                cContext.requestUserData = task.context.requestUserData;
                cContext.bpRequestData = task.context.bpRequestData;
                cContext.NameUserAprob = oInfoUsuario.data.nombre;
                cContext.LastNameUserAprob = oInfoUsuario.data.apellidoPaterno;
                if (lineaSeleccionada.estadoIdRmd_iMaestraId === estadoSolicitado) {
                    var filterMotivo = [];
                    filterMotivo.push(new Filter("motivoId", 'EQ', obj.motivoId_motivoId));
                    var arrayMotivo = await solicitudService.getData(oThat.mainModelv2, "/MOTIVO", [], filterMotivo);
                    arrayMotivo.results.forEach(function(e){
                        cContext.bpRequestData.motivoId_motivoId = obj.motivoId_motivoId;
                        cContext.bpRequestData.motivoMDWF = e.descripcion;
                    });
                }
                if (lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceJefe || lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoProceGere || lineaSeleccionada.estadoIdProceso_iMaestraId === estadoProcesoAprobGere) {
                    cContext. approverUserData = {
                        'EMAIL': ''
                    }
                    cContext.actionChange = '';
                }
                cContext.action = "R";                    
                await workflowService.completeTask(task.id, cContext);
                that.oDetalleRMD.close();
                BusyIndicator.hide();
                MessageBox.success("Se realizó el rechazo correctamente.");
                that.modelGeneral.setProperty("/aListaSeccionMD", []);
                that.onRefreshSolicitud();
            }, function (oError) {
                console.log(oError)
                BusyIndicator.hide();
                MessageBox.alert("Ocurrió un error en el rechazo.", {
                    icon : MessageBox.Icon.ERROR,
                    title : "Error"
                });
            });
        },
        
        onRejectDialog: function () {
            var that = this;
			var oDialog = new sap.m.Dialog({
				title: "Motivo de Rechazo",
				type: "Message",
				content: [
					new sap.m.Label({
						text: "Ingrese un motivo de rechazo",
						labelFor: "submitDialogTextarea"
					}),
					new sap.m.TextArea("submitDialogTextarea", {
						liveChange: function (oEvent) {
                            if (oEvent.getParameters().value !== '') {
                                var parent = oEvent.getSource().getParent();
                                parent.getBeginButton().setEnabled(true);
                            }
						},
						width: "100%",
						required: true,
                        maxLength: 1000
                        
					})
				],
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Rechazar",
					enabled: false,
					press: function () {
						var sText = sap.ui.getCore().byId("submitDialogTextarea").getValue();
						that.onRechazarSolicitud(sText);
						oDialog.close();
					}
                }),
                endButton: new sap.m.Button({
					type: sap.m.ButtonType.Reject,
					text: "Cancelar",
					enabled: true,
					press: function () {
						sap.ui.getCore().byId("submitDialogTextarea").setValue("");
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
        },
        
        onGuardarSolicitud: async function () {
            var that = this;
            var oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            var objEdit = this.modelGeneral.getProperty("/lineaSeleccionada");
            var objBackUp = this.modelGeneral.getProperty("/lineaSeleccionadaBackUp");
            var CompararObjetos = JSON.stringify(objEdit) === JSON.stringify(objBackUp.lineaSeleccionada);
            var adjuntosEliminados = this.modelGeneral.getProperty("/adjuntoEliminado");
            var adjuntosAgregados = objEdit.adjuntos.filter(item=>item.nuevo === true);
            var destinatariosBackup = this.modelGeneral.getProperty("/destinatariosBackup");
            var destinatariosSeleccionados = this.modelGeneral.getProperty("/destinatariosEdit");
            var arrayDestSelec = [];
            var destAgregados = [];
            var destDeleted = [];
            destinatariosSeleccionados.forEach(function(e){
                var obj = {
                    usuarioId : e
                }
                arrayDestSelec.push(obj);
                var ofind = destinatariosBackup.find(item => item.usuarioId === e);
                if(!ofind) {
                    destAgregados.push(e);
                }
            });

            destinatariosBackup.forEach(function(e){
                var ofind = arrayDestSelec.find(item => item.usuarioId === e.usuarioId);
                if(!ofind) {
                    destDeleted.push(e.usuarioId);
                }
            });
            
  			if (CompararObjetos && destDeleted.length === 0 && destAgregados.length === 0) {
  				sap.m.MessageBox.show("No se realizaron cambios.", sap.m.MessageBox
  					.Icon.WARNING);
  				return;
            }

            MessageBox.confirm("¿Está seguro que desea reenviar la solicitud?", {
                styleClass: "sapUiSizeCompact",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: async function (oAction) {
                    if (oAction === "YES") {
                        let bValidateWorkflow = await oThat.onValidateWorkflow(objEdit, "usertask1");
                        if (!bValidateWorkflow) {
                            MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorWorkflow"));
                            await oThat.onDeleteSolicitudError(objEdit);
                            that.oDetalleRMD.close();
                            BusyIndicator.hide();
                            sap.ui.core.Fragment.byId("frgDetailRMD", "fileUploader4").setValue(null);
                            that.modelGeneral.setProperty("/aListaSeccionMD", []);
                            that.onRefreshSolicitud();
                            return false;
                        }
                        if(destDeleted.length > 0 || destAgregados.length > 0) {
                            for(var i = 0; i < objEdit.destinatariosMD.results.length; i++) {
                                var dest = objEdit.destinatariosMD.results[i];
                                var obj = {
                                    mdId: dest.idMdDestinatarios,
                                    activo: false
                                }
                                await solicitudService.updateSolicitud(that.mainModelv2, "/MD_DESTINATARIOS", obj);
                            }

                            destinatariosSeleccionados.forEach(async function (e){
                                var obj = {
                                    terminal                : null,
                                    usuarioRegistro         : oInfoUsuario.data.usuario,
                                    fechaRegistro           : new Date(),
                                    activo                  : true,
                                    idMdDestinatarios       : util.onGetUUIDV4(), 
                                    mdId_mdId               : objEdit.mdId,
                                    usuarioId_usuarioId     : e,
                                }
                                await solicitudService.addDestinatario(that.mainModelv2, obj);
                            });
                        }
                        
                        if(adjuntosEliminados.length > 0){
                            adjuntosEliminados.forEach(async function (e){
                                await sharepointService.sharepointDelete(that.mainModelv2, e);
                            })   
                        }
                        
                        if(adjuntosAgregados.length > 0){
                            adjuntosAgregados.forEach(async function(e){
                                e.mdId = objEdit.mdId;
                                var oParam = {
                                    usuarioActualiza    : oInfoUsuario.data.usuario,
                                    fechaActualiza      : new Date(),
                                    archivoMD           : JSON.stringify(e)
                                }
                                await solicitudService.updateData(oThat.mainModelv2, "/MD", oParam, objEdit.mdId);
                            });
                        }
                        that.modelGeneral.setProperty("/adjuntoEliminado", []);
                        var obj = {
                            'terminal'              : null,
                            'usuarioActualiza'      : oInfoUsuario.data.usuario,
                            'fechaActualiza'        : new Date(),
                            'mdId'                  : objEdit.mdId,
                            'codigoSolicitud'       : objEdit.codigoSolicitud,
                            'descripcion'           : objEdit.descripcion,
                            'estadoIdRmd_iMaestraId': estadoSolicitado,
                            'sucursalId_iMaestraId' : objEdit.sucursalId_iMaestraId,
                            'motivoId_motivoId'     : objEdit.motivoId_motivoId,
                            'observacion'           : objEdit.observacion,
                            'areaRmdTxt'            : objEdit.areaRmdTxt,
                            'nivelTxt'              : objEdit.nivelTxt
                        } 
                        BusyIndicator.show();
                        solicitudService.updateSolicitud(that.mainModelv2, "/MD", obj).then(async function(){
                            var sFilter = [];
                            destinatariosSeleccionados.forEach(function(e){
                                sFilter.push(new Filter("usuarioId_usuarioId", 'EQ', e))
                            });
                            let sExpand = "usuarioId";
                            var array = [];
                            solicitudService.getData(that.mainModelv2, "/MD_DESTINATARIOS", sExpand, sFilter).then(async function(res){
                                var helper = {};
                                var aListaDest = res.results.reduce(function(r, o) {
                                    var key = o.usuarioId_usuarioId;
                                    if (!helper[key]) {
                                        helper[key] = 1;
                                        r.push(o);
                                    }
                                    return r;
                                }, []);

                                aListaDest.forEach(function(e){
                                    array.push(e.usuarioId.correo)
                                });
                                var task = await workflowService.getTaskContextByActivityId(objEdit.wfInstanceId, "usertask1");
                                var cContext = Object.assign({}, task.context);
                                cContext.approverUserData.EMAIL = array.join(",");
                                cContext.bpRequestData = task.context.bpRequestData;
                                cContext.bpRequestData.descripcion = obj.descripcion;
                                cContext.bpRequestData.areaRmdTxt = obj.areaRmdTxt;
                                cContext.bpRequestData.observacion = obj.observacion;
                                cContext.bpRequestData.nivelMDWF = e.nivelTxt
                                var filterMaestra = [];
                                filterMaestra.push(new Filter("iMaestraId", 'EQ', obj.sucursalId_iMaestraId));
                                // filterMaestra.push(new Filter("iMaestraId", 'EQ', obj.nivelId_iMaestraId));
                                var arrayMaestra = await solicitudService.getData(oThat.mainModelv2, "/MAESTRA", [], filterMaestra);
                                arrayMaestra.results.forEach(function(e){
                                    // if (e.oMaestraTipo_maestraTipoId === 15) {
                                    //     cContext.bpRequestData.nivelMDWF = e.contenido;
                                    // }
                                    if (e.oMaestraTipo_maestraTipoId === 18) {
                                        cContext.bpRequestData.plantaMDWF = e.contenido;
                                    }
                                });
                                var filterMotivo = [];
                                filterMotivo.push(new Filter("motivoId", 'EQ', obj.motivoId_motivoId));
                                var arrayMotivo = await solicitudService.getData(oThat.mainModelv2, "/MOTIVO", [], filterMotivo);
                                arrayMotivo.results.forEach(function(e){
                                    cContext.bpRequestData.motivoMDWF = e.descripcion;
                                });
                                cContext.action = "R";                    
                                await workflowService.completeTask(task.id, cContext);
                                that.oDetalleRMD.close();
                                BusyIndicator.hide();
                                MessageBox.success("Se guardaron los cambios correctamente.");
                                sap.ui.core.Fragment.byId("frgDetailRMD", "fileUploader4").setValue(null);
                                that.modelGeneral.setProperty("/aListaSeccionMD", []);
                                that.onRefreshSolicitud();
                            });
                            
                        }, function (oError) {
                            console.log(oError)
                            BusyIndicator.hide();
                            MessageBox.alert("Ocurrió un error al guardar los cambios de la solicitud.", {
                                icon : MessageBox.Icon.ERROR,
                                title : "Error"
                            });
                        });
                    }
                }
            });    
        },

        onCancelarModifSolicitud: function () {
            this.modelGeneral.setProperty("/adjuntoEliminado", []);
            this.modelGeneral.setProperty("/aListaSeccionMD", []);
            sap.ui.core.Fragment.byId("frgDetailRMD", "fileUploader4").setValue(null);
            // var aListaArchivos = 
            oThat.modelGeneral.setProperty("/aListaAutorizado/adjuntos","");
            
            this.oDetalleRMD.close();
        },

        onExportXLS: function () {
            var nombreExcel = "Solicitudes de RMD";
            var oTable = this.getView().byId("tblRequestMD");
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

        createColumns: function() {
            var aCols = [];

            aCols.push({
                label: 'Codigo Solicitud',
                property: 'codigoSolicitud',
                type: EdmType.String
            });

            aCols.push({
                label: 'Codigo de material',
                property: 'concatCodMaterial',
                type: EdmType.String
            });

            aCols.push({
                label: 'Nombre de RMD',
                type: EdmType.String,
                property: 'descripcion'
            });

            aCols.push({
                label: 'Etapa',
                type: EdmType.String,
                property: 'nivelTxt'
            });

            aCols.push({
                label: 'Tipo',
                type: EdmType.String,
                property: 'tipoMD'
            });

            aCols.push({
                label: 'Estado',
                type: EdmType.String,
                property: 'estadoIdRmd/contenido'
            });

            aCols.push({
                label: 'Fecha Aprob./Rech.',
                type: EdmType.Date,
                property: 'fechaAprob_Rech'
            });

            aCols.push({
                label: 'Usuario Aprob./Rech.',
                type: EdmType.String,
                property: 'usuarioAprob_Rech'
            });

            aCols.push({
                label: 'Sección',
                type: EdmType.String,
                property: 'areaRmdTxt'
            });

            aCols.push({
                label: 'Planta',
                property: 'sucursalId/contenido',
                type: EdmType.String
            });

            aCols.push({
                label: 'Motivo de RMD',
                type: EdmType.String,
                property: 'motivoId/descripcion',
            });

            aCols.push({
                label: 'Observación',
                type: EdmType.String,
                property: 'observacion',
            });

            aCols.push({
                label: 'Destinatarios',
                type: EdmType.String,
                property: 'concatDestinatarios',
            });

            aCols.push({
                label: 'Usuario Solicitante',
                type: EdmType.String,
                property: 'usuarioRegistro',
            });

            aCols.push({
                label: 'Fecha Solicitud',
                type: EdmType.Date,
                property: 'fechaRegistro',
            });

            return aCols;
        },

        onChangePlanta: function (oEvent) {
            var oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("additionalText");
            var oFilter = [];
            oFilter.push(new Filter("Werks", 'EQ', oCodigoSelected))
            //metodo de read
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                solicitudService.getDataAjax(oCodigoSelected).then(function (oListArea) {
                    console.log(oListArea);
                    oThat.modelGeneral.setProperty("/aListaSecciones", oListArea);
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    console.log(oError);
                    sap.ui.core.BusyIndicator.hide();
                })
            });
        },

        _getAppModulePath: function () {
            const appId = this.getOwnerComponent().getManifestEntry("/sap.app/id"),
            appPath = appId.replaceAll(".", "/");

            return jQuery.sap.getModulePath(appPath);
        },

        onSelectMaterial: async function (oEvent) {
            var codMaterialSelected = oEvent.getSource().getSelectedKey();
            var sExpand = "mdId";
            var sFilter = [];
            sFilter.push(new Filter("recetaId_recetaId", 'EQ', codMaterialSelected))
            var aMdAsociadas = await solicitudService.getData(this.mainModelv2, "/MD_RECETA", sExpand, sFilter);
            var listaMdAsociadas = [];
            aMdAsociadas.results.forEach(function(e){
                if (e.mdId.estadoIdRmd_iMaestraId === estadoAutorizado) {
                    listaMdAsociadas.push(e.mdId);
                }
            });
            this.modelGeneral.setProperty("/mdAsociadas", listaMdAsociadas);

            var destinatariosVersion = this.modelGeneral.getProperty("/newVersionRMD/destinatarios");
            this.modelGeneral.setProperty("/newVersionRMD", {});
            this.modelGeneral.setProperty("/newVersionRMD/destinatarios", destinatariosVersion);

            if (listaMdAsociadas.length === 0) {
                MessageBox.warning("No hay RMD's asociadas a la receta o ya fueron solicitadas.");
            }
            if (listaMdAsociadas.length === 1) {
                sap.ui.core.Fragment.byId("frgNewRequestRMD", "idCodigoMaterial").setSelectedKey(listaMdAsociadas[0].mdId);
                this.onSelectRMDToVersion(listaMdAsociadas[0].mdId);
            }
            this.modelGeneral.setProperty("/newVersionRMD/recetaSelected", codMaterialSelected);
        },

        onSelectRMDToVersion: async function (oEvent) {
            if (oEvent.oSource) {
                var rmdSelected = oEvent.getSource().getSelectedKey();
            } else {
                var rmdSelected = oEvent;
            }
            if (rmdSelected && rmdSelected !== "") {
                var sExpand = "sucursalId";
                var sFilter = [];
                sFilter.push(new Filter("mdId", 'EQ', rmdSelected))
                var mdData = await solicitudService.getData(this.mainModelv2, "/MD", sExpand, sFilter);
                var recetaSelected = this.modelGeneral.getProperty("/newVersionRMD/recetaSelected");
                mdData.results[0].motivoId_motivoId = "";
                mdData.results[0].observacion = "";
                var destinatariosVersion = this.modelGeneral.getProperty("/newVersionRMD/destinatarios");
                this.modelGeneral.setProperty("/newVersionRMD", mdData.results[0]);
                this.modelGeneral.setProperty("/newVersionRMD/recetaSelected", recetaSelected);
                this.modelGeneral.setProperty("/newVersionRMD/destinatarios", destinatariosVersion);
                // this.onChangeSeccionMD(false, mdData.results[0]);
            }
        },

        onSelectAplicacion: function (oEvent) {
            oAplicacion = oEvent.getSource().getSelectedKey();
            this.modelGeneral.setProperty("/aFilters", []);
            this.modelGeneral.setProperty("/aFilters/aplicacionId", oAplicacion);
            this.modelGeneral.setProperty("/aListaSolicitud", []);
            this.onInitApp();
        },

        onCompararVersiones: function () {
            if (!oThat.oVersiones) {
                oThat.oVersiones = sap.ui.xmlfragment(
                    "frgVersiones",
                    rootPath + ".view.dialog.CompararVersiones",
                    oThat
                );
                oThat.getView().addDependent(oThat.oVersiones);
            }
            oThat.oVersiones.open();
        },
        validateName:function(sName){
            let char = [",",".","_","-"];
            
        },
        onUploadComparar: function (oEvent) {
            var that = this;
            var oFile = oEvent.getParameter("files")[0];
            // let validateExt = 
            // oFile.name = oFile.name.replaceAll(" ","");

            // that.modelGeneral.setProperty("/aListaArchivos", []);
            if (oFile) {
                if(!oFile.type.includes("pdf")){
                    MessageToast.show("Añadir archivos de tipo PDF")
                    return false;
                }
                let _name = "archivo"+ new Date().getTime() + ".pdf";
                var reader = new FileReader();
                reader.onload = function () {
                    let encoded = reader.result.toString();
                    let byteArray = encoded.split(',')[1];
                    var obj = {
                        'name':  _name,
                        'fileData': byteArray
                    }
                    var aListaArchivos = that.modelGeneral.getProperty("/aListaArchivos");
                    // var aListaArchivos = that.modelGeneral.getData().aListaArchivos;
                    // var aListaArchivos = oView.getModel("aListaArchivos");
                    if(!aListaArchivos.adjuntos) {
                        aListaArchivos.adjuntos = [];
                    }
                    aListaArchivos.adjuntos.push(obj);
                    that.modelGeneral.refresh(true);
                };
                reader.onerror = async function (error) {
                    console.log('Error: ', error);
                };
                reader.readAsDataURL(oFile);
            }
        },

        onUploadMDAutorizado: function (oEvent) {
            var that = this;
            var oFile = oEvent.getParameter("files")[0];
            that.modelGeneral.setProperty("/aListaAutorizado", []);
            if (oFile) {
                var reader = new FileReader();
                reader.onload = function () {
                    let encoded = reader.result.toString();
                    let byteArray = encoded.split(',')[1];
                    var obj = {
                        'name': oFile.name,
                        'fileData': byteArray
                    }
                    var aListaArchivos = that.modelGeneral.getProperty("/aListaAutorizado");
                    if(!aListaArchivos.adjuntos) {
                        aListaArchivos.adjuntos = [];
                    }
                    aListaArchivos.adjuntos.push(obj);
                    that.modelGeneral.refresh(true);
                };
                reader.onerror = async function (error) {
                    console.log('Error: ', error);
                };
                reader.readAsDataURL(oFile);
            }
        },

        onSendCompareVersion: async function() {
            var oDownloadResult = await this.onSendToCompare();
            if(oDownloadResult){

                var url = window.URL.createObjectURL(oDownloadResult);
                var a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'ResultCompararVersiones.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url); 
            }
        },

        onSendToCompare: function () {
            let that = this;
            BusyIndicator.show();
            var aListaArchivo = this.modelGeneral.getProperty("/aListaArchivos/adjuntos");
            if(aListaArchivo.length===2){

          
            var oBody = {
                "aLista": aListaArchivo
            };
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    xhrFields: {
                        responseType: 'blob'
                    },
                    url: "/srv_api/api/v1/rmd/compareVersion",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: JSON.stringify(oBody),
                    success: function (data) {
                        BusyIndicator.hide();
                        that.modelGeneral.setProperty("/aListaArchivos/adjuntos","");
                        resolve(data);
                    },
                    error: function (xhr, status, error) {
                        BusyIndicator.hide();
                        that.modelGeneral.setProperty("/aListaArchivos/adjuntos","");
                        reject(error);
                    }
                });
            });
            }
            else{
                MessageToast.show("Hubo un error al momento de adjuntar los archivos, intente nuevamente!");
                return false;
            }
        },

        onGetNivelOdata: async function () {
            BusyIndicator.show(0);
            let aFilters = [];
            aFilters.push(new Filter("AtinnText", "EQ", constanteEtapa));
            let oResponse = await solicitudService.getData(this.oModelErpNec, "/CaracteristicasSet", [], aFilters);
            this.modelGeneral.setProperty("/aListaNiveles", oResponse.results);
            BusyIndicator.hide();
        },

        onGetAreaOdata: async function () {
            BusyIndicator.show(0);
            let aFilters = [];
            aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
            let oResponse = await solicitudService.getData(this.oModelErpNec, "/CaracteristicasSet", [], aFilters);
            this.modelGeneral.setProperty("/aListaSecciones", oResponse.results);
            BusyIndicator.hide();
        },
        // Se agrega PDF
        onGetMd: function (mdId) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                let oFilterMd = [];
                oFilterMd.push(new Filter("mdId", FilterOperator.EQ, mdId));
                let sExpand = "estadoIdRmd,aReceta/recetaId,aTrazabilidad,aEstructura/estructuraId,aEstructura/aEquipo/equipoId,aEstructura/aEspecificacion/ensayoPadreId,aEstructura/aPasoInsumoPaso/estructuraRecetaInsumoId,aEstructura/aPaso/pasoId,aEstructura/aUtensilio/utensilioId,aEstructura/aEspecificacion,aEstructura/aInsumo,aEstructura/aEtiqueta/etiquetaId,aEstructura/aPasoInsumoPaso/pasoHijoId,aEstructura/mdId";
                // let sExpand = "aEstructura";
                solicitudService.getDataExpand(oThat.mainModelv2, "/MD", sExpand, oFilterMd).then(async function (oListMD) {
                    resolve(oListMD);
                }).catch(function (oError) {
                    reject(oError);
                })
            });
        },
        onDownloadPdfRmd: function(oEvent){
            oThat.onGetPdfViewerMo(oEvent, true);
        },
        onGetPdfViewerMo: function (oEvent, descargarPDF) {
            oThat.oSelectedObject = oEvent.getSource().getBindingContext("modelGeneral").getObject();

            Promise.all([this.onGetMd(oThat.oSelectedObject.mdId)]).then(async function (value) {
                var oDataSeleccionada = value[0].results[0].aEstructura;
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
                oDataSeleccionada.results = oDataSeleccionada.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                
                // oDataSeleccionada.results.forEach(async function (oData) {
                for await (const oData of oDataSeleccionada.results){
                    //ETIQUETA
                     if (oData.aEtiqueta.results.length > 0) {
                        //  oData.aEtiqueta.results = oData.estructuraId.aEtiqueta.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                         oData.aEtiqueta.results.sort(function (a, b) {
                             return a.orden - b.orden;
                         });
                     }
                     //PASO
                    //  if (oData.aPaso.results.length > 0) {
                    //     //  oData.aPaso.results = oData.aPaso.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                    //      oData.aPaso.results.sort(function (a, b) {
                    //          return a.orden - b.orden;
                    //      });
                    //  }
                    if (oData.aPaso.results.length > 0) {
                        // oData.aPaso.results = oData.aPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
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
                     //PASOINSUMOPASO
                     if (oData.aPasoInsumoPaso.results.length > 0) {
                        //  oData.aPasoInsumoPaso.results = oData.estructuraId.aPasoInsumoPaso.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                         oData.aPasoInsumoPaso.results.sort(function (a, b) {
                             return a.orden - b.orden;
                         });
                     }
                     //EQUIPO
                     if (oData.aEquipo.results.length > 0) {
                        //  oData.aEquipo.results = oData.aEquipo.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                         oData.aEquipo.results.sort(function (a, b) {
                             return a.orden - b.orden;
                         });
                     }
                     //UTENSILIO
                     if (oData.aUtensilio.results.length > 0) {
                        //  oData.aUtensilio.results = oData.aUtensilio.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                         oData.aUtensilio.results.sort(function (a, b) {
                             return a.orden - b.orden;
                         });
                     }
                     //INSUMO
                    //  if (oData.aInsumo.results.length > 0) {
                    //     //  oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.rmdId_rmdId == oThat.oSelectedObject.rmdId);
                    //      oData.aInsumo.results.sort(function (a, b) {
                    //          return a.orden - b.orden;
                    //      });
                    //  }
                    if (oData.aInsumo.results.length > 0) {
                        // oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        if(value[0].results[0].aReceta.results.length > 0){
                            oData.aInsumo.results = oData.aInsumo.results.filter(e=>e.mdRecetaId_mdRecetaId === value[0].results[0].aReceta.results[0].mdRecetaId);
                        }
                        oData.aInsumo.results.sort(function (a, b) {
                            return a.ItemNo - b.ItemNo;
                        });
                    }
                 }
                //  );
                
                tablePdf.onGeneratePdf(value[0].results[0],true,descargarPDF? false : true, oThat.modelGeneral.getProperty("/oInfoUsuario"));
                // if(descargarPDF){
                //     tablePdf.onGeneratePdf(value[0].results[0],false,descargarPDF, oThat.modelGeneral.getProperty("/oInfoUsuario"));
                // }else {
                //     tablePdf.onGeneratePdf(value[0].results[0],false,false, oThat.modelGeneral.getProperty("/oInfoUsuario"));
                // }

                sap.ui.core.BusyIndicator.hide();
            }).catch(function (oError) {
                sap.ui.core.BusyIndicator.hide();
                oThat.onErrorMessage(oError, "errorSave");
            });
        },

        onRegistrarEstructurasNuevaVersion: async function (lineaSeleccionada) {
            BusyIndicator.show(0);
            let oInfoUsuario = this.modelGeneral.getProperty("/oInfoUsuario");
            let tipo = "2";
            let newCorrelativo;
            let año = (new Date().getFullYear()).toString();
            await solicitudService.getData(oThat.mainModelv2, "/MD", [], []).then(async function (res) {
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
                // let oDataSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                let oParamMaster = {
                    usuarioRegistro: oInfoUsuario.data.usuario,
                    fechaRegistro: new Date(),
                    codigo: codigoGenerated,
                    estadoIdRmd_iMaestraId: estadoIngresado         
                }
                await solicitudService.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParamMaster, lineaSeleccionada.mdId);
                let updTraz = {
                    activo                  : true,
                    usuarioRegistro         : oInfoUsuario.data.usuario,
                    fechaRegistro           : new Date(),
                    idTrazabilidad          : util.onGetUUIDV4(),
                    mdId_mdId               : lineaSeleccionada.mdId,
                    estadoTrazab_iMaestraId : estadoIngresado
                }
                await solicitudService.onCreate(oThat.mainModelv2, "/MD_TRAZABILIDAD", updTraz);
                let aFilterReceta = [];
                let aRecetas = [];
                aFilterReceta.push(new Filter("mdId_mdId", "EQ", lineaSeleccionada.mdIdVersionAnt));
                let sExpandReceta = "aInsumos";
                let aRecetaMD = await solicitudService.getData(oThat.mainModelv2, "/MD_RECETA", sExpandReceta, aFilterReceta);
                for await (const oReceta of aRecetaMD.results) {
                    //AGREGAMOS LOS ID'S INSUMOS ANTIGUOS Y LO ENLAZAMOS CON EL NUEVO
                    let mdRecetaIdActual = util.onGetUUIDV4();
                    aRecetas.push({mdRecetaIdAntiguo: oReceta.mdRecetaId, mdRecetaIdActual: mdRecetaIdActual});

                    let oParamReceta = {
                        usuarioRegistro: oInfoUsuario.data.usuario,
                        fechaRegistro: new Date(),
                        activo: true,
                        mdRecetaId: mdRecetaIdActual,
                        mdId_mdId: lineaSeleccionada.mdId,
                        recetaId_recetaId : oReceta.recetaId_recetaId,
                        orden : oReceta.orden
                    }
                    await solicitudService.onCreate(oThat.mainModelv2, "/MD_RECETA", oParamReceta);
                }
                let aFilter = [];
                aFilter.push(new Filter("mdId_mdId", "EQ", lineaSeleccionada.mdIdVersionAnt));
                let sExpand = "aInsumo,aPaso/aFormula,aEquipo,aUtensilio,aEtiqueta,aPasoInsumoPaso/aFormula,aEspecificacion";
                let aEstructuraMD = await solicitudService.getData(oThat.mainModelv2, "/MD_ESTRUCTURA", sExpand, aFilter);
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
                            mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                        await solicitudService.onCreate(oThat.mainModelv2, "/MD_ESTRUCTURA", oParam);
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
                            mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                                    await oThat.onGetImagenSharepointCopiaNueva(oPaso, oPasoObj);
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId: lineaSeleccionada.mdId,
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
                                    mdId_mdId : lineaSeleccionada.mdId,
                                    ensayoPadreId_iMaestraId : oEspecificacion.ensayoPadreId_iMaestraId,
                                    ensayoHijo : oEspecificacion.ensayoHijo,
                                    especificacion: oEspecificacion.especificacion,
                                    tipoDatoId_iMaestraId : oEspecificacion.tipoDatoId_iMaestraId,
                                    valorInicial : oEspecificacion.valorInicial,
                                    valorFinal : oEspecificacion.valorFinal,
                                    margen : oEspecificacion.margen,
                                    decimales : oEspecificacion.decimales,
                                    orden : oEspecificacion.orden
                                }
                                oParam.aEspecificacion.push(oEspecificacionObj);
                            });
                        }
                        await solicitudService.onCreate(oThat.mainModelv2, "/MD_ESTRUCTURA", oParam);
                    }
                }
                if (aFormulaGeneral.aFormula.length > 0) {
                    await solicitudService.onCreate(oThat.mainModelv2, "/TABLAS_ARRAY_MD_SKIP", aFormulaGeneral);
                }
                BusyIndicator.hide();
            });
        },

        onValidateWorkflow: async function (lineaSeleccionada, userTask) {
            let response = true;
            var task = await workflowService.getTaskByActivityId(lineaSeleccionada.wfInstanceId, userTask);
            if (task.id) {
                response  = true;
            } else {
                response = false;
            }
            return response;
        },

        onDeleteSolicitudError: async function (lineaSeleccionada) {
            let obj = {
                activo : false
            }
            await solicitudService.onUpdateDataGeneral(oThat.mainModelv2, "MD", obj, lineaSeleccionada.mdId);
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
            await solicitudService.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, oPasoObj.mdId_mdId);
        },

        // Obtener la informacion de la App Configuracion.
        onGetAppConfiguration:async function () {
            return new Promise(async function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                var afilters = [];
                afilters.push(new Filter("codigo", "EQ", sAppSolicitud));
                afilters.push(new Filter("codigo", "EQ", sAppConfiguracion));
                await solicitudService.onGetDataGeneralFilters(oThat.mainModelv2, "APLICACION", afilters).then(async function (oListAppConfig) {
                    resolve(oListAppConfig);
                }).catch(function (oError) {
                    reject(oError);
                })
            });
        },

        // Obtener la informacion de las Constantes.
        onGetConstants:async function () {
            return new Promise(async function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                var oFilter = [
                    new Filter({
                        filters: [
                            new Filter("oAplicacion_aplicacionId", "EQ", oAplicacionSolicitudId),
                            new Filter("campo1", "EQ", 'X')
                        ],
                        and: false
                    })
                ];
                await solicitudService.onGetDataGeneralFilters(oThat.mainModelv2, "CONSTANTES", oFilter).then(async function (oListConstantes) {
                    resolve(oListConstantes);
                }).catch(function (oError) {
                    reject(oError);
                })
            });
        },

        //Seteo de constantes
        onSetConstans:async function (aConstants) {
            try {
                for await (const oConstante of aConstants.results) {
                    if (oConstante.codigoSap === "MAXCANTARCHIVOS") {
                        iMaxLengthArchivos = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
                        estadoAutorizado = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTRMDINICIADO") {
                        estadoIngresado = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTRMDSOLICITADO") {
                        estadoSolicitado = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTRMDSOLICITUDAPROBADA") {
                        estadoSolicitudAprobada = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCPROCESO") {
                        estadoProcesoPendiente = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCENPRODUCCION") {
                        estadoProcesoProceJefe = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCPRODGERENTE") {
                        estadoProcesoProceGere = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCDEVUELVEJEFE") {
                        estadoProcesoDevueGeje = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCDEVUELVEGERENTE") {
                        estadoProcesoDevueGere = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCAPROBACIONGERENTE") {
                        estadoProcesoAprobGere = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCDEVUELVEJEFEDT") {
                        estadoProcesoDevJefeDT = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "IDESTPRCAPROBACIONJEFEDT") {
                        estadoProcesoAprobJefeDT = parseInt(oConstante.contenido);
                    }
                    if (oConstante.codigoSap === "CODROLJEFEPROD") {
                        oRolJefeProduccionCod = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "CODROLGERENTEPROD") {
                        oRolGerenteProduccionCod = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "CODROLJEFEDT") {
                        oRolJefaturaDTCod = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "CARACTERISTICAETAPA") {
                        constanteEtapa = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "CARACTERISTICAAREA") {
                        constanteArea = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "TXTTIPOGERENTEPROD") {
                        tipoGerenteProd = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "TXTTIPOJEFATURADT") {
                        tipoJefaturaDT = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "IDSISTEMARMD") {
                        sSistemaRMDCod = oConstante.contenido;
                    }
                    if (oConstante.codigoSap === "IDTIPOESTESPECIFICACIONES") {
                        sTipoEstructuraEspecificaciones = parseInt(oConstante.contenido);
                    }
                }
            } catch (oError) {
                sap.ui.core.BusyIndicator.hide();
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener los ID's de los roles.
        onGetIdRoles:async function () {
            try {
                sap.ui.core.BusyIndicator.show(0);
                var afilters = [];
                afilters.push(new Filter("codigo", "EQ", oRolJefeProduccionCod));
                afilters.push(new Filter("codigo", "EQ", oRolGerenteProduccionCod));
                afilters.push(new Filter("codigo", "EQ", oRolJefaturaDTCod));
                await solicitudService.onGetDataGeneralFilters(oThat.mainModelv2, "ROL", afilters).then(async function (oListRol) {
                    let oRols; 
                    oRols = oListRol.results.find(item => item.codigo === oRolJefeProduccionCod);
                    if (oRols) {
                        oRolJefeProduccion = oRols.rolId;
                    }
                    oRols = oListRol.results.find(item => item.codigo === oRolGerenteProduccionCod);
                    if (oRols) {
                        oRolGerenteProduccion = oRols.rolId;
                    }
                    oRols = oListRol.results.find(item => item.codigo === oRolJefaturaDTCod);
                    if (oRols) {
                        oRolJefaturaDT = oRols.rolId;
                    }
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                })
            } catch (oError) {
                sap.ui.core.BusyIndicator.hide();
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener los ID's de los sistemas.
        onGetIdSistema:async function () {
            try {
                sap.ui.core.BusyIndicator.show(0);
                var afilters = [];
                afilters.push(new Filter("codigo", "EQ", sSistemaRMDCod));
                await solicitudService.onGetDataGeneralFilters(oThat.mainModelv2, "SISTEMA", afilters).then(async function (oListSystem) {
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
        }, 

        onGetRecetas: async function () {
            let aListRecetas = await solicitudService.onGetDataGeneralFilters(oThat.mainModelv2, "RECETA", [])
            oThat.modelGeneral.setProperty("/aListRecetas", aListRecetas.results);
        }
    });
});