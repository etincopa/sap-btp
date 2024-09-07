sap.ui.define(
    [
        "mif/rmd/configuracion/controller/BaseController",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/FilterType",
        "sap/ui/model/json/JSONModel",
        "mif/rmd/configuracion/utils/formatter",
        "sap/ui/core/Item",
        "mif/rmd/configuracion/controller/asignacion/Configuracion.controller",
        '../services/Service',
        '../services/external/sharepoint',
        '../services/external/workflow',
        "mif/rmd/configuracion/utils/util",
        "sap/ui/core/BusyIndicator",
        '../controller/table',
        'sap/ui/export/Spreadsheet',
        'sap/ui/export/library',
        '../controller/tableRMD',
        'sap/ui/core/Fragment',
    ],
    function (
        Controller,
        MessageBox,
        MessageToast,
        Filter,
        FilterOperator,
        FilterType,
        JSONModel,
        formatter,
        Item,
        Configuracion,
        Service,
        sharepointService,
        workflowService,
        util,
        BusyIndicator,
        tablePdf,
        Spreadsheet,
        exportLibrary,
        tablePdfRMD,
        Fragment
    ) {
        "use strict";
        let sRootPath,
            oThat,
            oInfoUsuario,
            oAplicacionConfiguracion,
            sIdTipoEstructuraFormula,
            sIdEstadoRMIniciado,
            sIdEstadoProcesoPendiente,
            sIdEstadoProcesoEnProduccion,
            oRolIDECod,
            oRolIDE,
            oRolRegistradorCod,
            oRolRegistrador,
            oRolJefeProduccionCod,
            oRolJefeProduccion,
            oRolGerenteProduccionCod,
            oRolGerenteProduccion,
            oRolJefaturaDTCod,
            oRolJefaturaDT,
            iNivelFabricacion,
            iNivelRecubrimiento,
            estadoAutorizado,
            iMaxLengthArchivos,
            sEstadoPermitidoProducto,
            constanteEtapa,
            constanteArea,
            tipoJefeProd,
            tipoAdicional,
            estadoCancelado,
            sIdPlanta,
            sTipoEstructuraEspecificaciones,
            sIdTipoEstructuraProceso,
            sIdNotificacion,
            sIdInicioCondicion,
            sIdFinCondicion,
            sIdEstadoRMSuspendido,
            sAiPrio00,
            sAiPrio01,
            sSistemaRMDCod,
            sSistemaRMD;
        const sAppConfiguracion = 'CONFIG',
            EdmType = exportLibrary.EdmType;
        var indexConfiguracion = 0;
        return Controller.extend("mif.rmd.configuracion.controller.MainView", {
            formatter: formatter,
            configuracion: Configuracion,
            onInit: async function () {
                oThat = this;
                oThat.onInitialModel();
                workflowService.setManifestObject(oThat);

                // Obteniendo el ID de la aplicacion y las constantes
                let aAppConfig = await oThat.onGetAppConfiguration();
                if (aAppConfig.results.length > 0) {
                    oAplicacionConfiguracion = aAppConfig.results[0].aplicacionId;
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

                //cargar pasos en modelo
                // Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO");
                
                oThat.oResourceBundle = oThat.getView().getModel("i18n").getResourceBundle();

                let emailUser = "";
                if (sap.ushell) {
                    var user = new sap.ushell.Container.getService("UserInfo").getUser();
                    if (user.getFirstName()!== 'Default')
                        emailUser = user.getEmail();   
                    else 
                        // emailUser = "ysabel.huamacto@medifarma.com.pe";
                        // emailUser = "rodolfo.simon.chung.arbildo@everis.nttdata.com";
                      // emailUser = "mferreyra@medifarma.com.pe";
                      emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
                } else {
                        // emailUser = "ysabel.huamacto@medifarma.com.pe";
                        // emailUser = "rodolfo.simon.chung.arbildo@everis.nttdata.com";
                        emailUser = "gianfranco.romano.paoli.rosas@everis.nttdata.com";
                        //emailUser = "mferreyra@medifarma.com.pe";
                }
                var UserFilter = [];
                UserFilter.push(new Filter("correo", 'EQ', emailUser));
                let oUsuarioFilter = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", UserFilter);

                let UserSystemFilter = [];
                UserSystemFilter.push(new Filter("oSistema_sistemaId", 'EQ', sSistemaRMD));
                this.aUsuarioSystem = await Service.onGetDataGeneralFilters(this.mainModelv2, "USUARIO_SISTEMA", UserSystemFilter);

                let oUsuario = {results: []};

                for await (const oUsuarioSystem of this.aUsuarioSystem.results) {
                    let oUsuarioFind = oUsuarioFilter.results.find(item=>item.usuarioId === oUsuarioSystem.oUsuario_usuarioId && oUsuarioSystem.oSistema_sistemaId === sSistemaRMD);
                    if (oUsuarioFind) {
                        oUsuario.results.push(oUsuarioFind);
                    }
                }

                if (oUsuario.results.length > 0){
                    var oFilter = [];
                    oFilter.push(new Filter("oUsuario_usuarioId", 'EQ', oUsuario.results[0].usuarioId));
                    let sExpand = "oRol";
                    let oUser = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "UsuarioRol", oFilter, sExpand);
                    let oUserFilterSystem = oUser.results.filter(item=>item.oRol.oSistema_sistemaId === sSistemaRMD);
                    oInfoUsuario = {
                        data    : oUsuario.results[0],
                        rol     : [],
                        funcionUsuario : {
                            configurarMD    : false
                        }
                    }
                    if(oUserFilterSystem.length > 0){
                        var aFilterAcc = [];
                        oUserFilterSystem.forEach(function(e){
                            oInfoUsuario.rol.push(e.oRol);
                            aFilterAcc.push(new Filter("oRol_rolId", 'EQ', e.oRol.rolId)); 
                        });
                        var mExpand = "oMaestraAccion";
                        aFilterAcc.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacionConfiguracion));
                        var infoAccionUsuario = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RolAppAcciones", aFilterAcc, mExpand);

                        infoAccionUsuario.results.forEach(function(e){
                            if (e.oMaestraAccion.contenido === "CONFIGURAR") {
                                oInfoUsuario.funcionUsuario.configurarMD = true; 
                            }
                        });

                        if (oInfoUsuario.funcionUsuario.configurarMD) {
                            oThat.onGetAreaOdata("/aListaSecciones");
                            oThat.onGetNivelOdata("/aListaNiveles");
                            oThat.onGetDataInitial();
                        } else {
                            MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage1"));
                        }

                        oThat.localModel.setProperty("/oInfoUsuario", oInfoUsuario);
                    } else {
                        MessageBox.error(formatter.onGetI18nText(oThat,"txtMessage2"), {
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
                    MessageBox.error(formatter.onGetI18nText(oThat,"txtMessage3"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.OK],
                        onClose: async function (oAction) {
                            if (oAction === "OK") {
                                window.history.back();
                            }
                        }
                    }); 
                }
            },

            onGetDataInitial: async function (oEvent, aFilter, bFlagFilterMaterial) {
                let aReason;
                if (oEvent) {                    
                    aReason = oEvent.getParameter("reason");
                } else if (oEvent === false) {
                    aReason = "Filter";
                } else {
                    aReason = "Initial";
                }
                let listMD, oModelMD;
                if (oThat.getView().getModel("listMD")){
                    oModelMD = oThat.getView().getModel("listMD");
                    listMD = oThat.getView().getModel("listMD").getData();
                    if (!listMD) {
                        listMD = [];
                    }
                } else {
                    listMD = [];
                }
                if (aReason === "Growing" || listMD.length === 0 || aReason === "Filter"){           
                    let values = await oThat.onGetMd(aFilter, bFlagFilterMaterial);
                    values.results.forEach(function(oMD){
                        if (oMD.codigoSolicitud) {
                            if (oMD.aTrazabilidad.results.length > 0) {
                                oMD.aTrazabilidad.results.sort(function (a, b) {
                                    return a.fechaRegistro - b.fechaRegistro;
                                });
                                oMD.fechaRegistro = oMD.aTrazabilidad.results[0].fechaRegistro;
                                oMD.usuarioRegistro = oMD.aTrazabilidad.results[0].usuarioRegistro;
                            }                        
                        }
                    });
                    if (aReason === "Initial" || aReason === "Filter") {
                        var oModel = new JSONModel(values.results);
                        oModel.setSizeLimit(999999999);
                        var oModelFilter = oModel.getData().filter(itm=>itm.codigo !== "" && itm.codigo !== null);
                        oModel.setData(oModelFilter);
                        oThat.getView().setModel(oModel, "listMD");
                        oThat.getView().getModel("listMD").refresh(true);
                    } else if (aReason === "Growing") {
                        oModelMD.setData(oModelMD.getData().concat(values.results));
                    }                 
                    oThat.localModel.setProperty("/listMDTemp",oModelFilter);
                    oThat.localModel.setProperty("/listMDCompare",oModelFilter);
                    // oThat.onSearch();
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            onInitialModel: function () {
                var oModel = new JSONModel([
                    {
                        code: "",
                        description: "",
                        level: "",
                        sucursal: "",
                        dateSol: "",
                        reason: "",
                        area: "",
                    },
                ]);
                //Modelo donde se guardaran los datos de la tabla de Emails
                this.getView().setModel(oModel, "oNewMd");

                this.oMainModel = this.getView().getModel("mainModel");
                this.mainModelv2 = this.getView().getModel("mainModelv2");
                this.oModelErpProd = oThat.getOwnerComponent().getModel("PRODUCCION_SRV");
                this.oModelErpNec = oThat.getOwnerComponent().getModel("NECESIDADESRMD_SRV");
                this.localModel = this.getView().getModel("localModel");

                // Input suggestion product del filtro de la pantalla principal.
                // var oInput = this.getView().byId("ipProduct");
                // oInput.setSuggestionRowValidator(this.suggestionRowValidator);
            },

            onGetConfigurationMaster: function () {
                if (!this.oConfiguration) {
                    var oCtrl = sap.ui.controller(
                        "mif.rmd.configuracion.controller.mantenimiento.Mantenimiento"
                    );
                    this.oConfiguration = sap.ui.xmlfragment(
                        "frgConfiguration",
                        sRootPath + ".view.fragment.Configuration",
                        oCtrl
                    );
                    this.getView().addDependent(this.oConfiguration);
                }
                this.onGetPasoUtensilio();
                this.onGetFiltroUtensilioMD();
                this.oConfiguration.open();
                let view = this.getView();
                oCtrl.getView = function () {
                    return view;
                };
                oCtrl.onAfterRendering(this);
            },

            onGetPasoUtensilio: async function() {
                let that = this;
                let sExpandPaso = "estructuraId,etiquetaId,estadoId,tipoDatoId,tipoLapsoId,tipoCondicionId";
                let sExpandUtensilio = "estadoId,tipoId";
                // let aListPasosLength = 1000;
                // let skipLine = 1000;
                let aFilter = [];
                aFilter.push(new Filter("activo", "EQ", true));
                let oResultPaso = await Service.onGetDataGeneralFiltersExpand(that.mainModelv2, "PASO", aFilter, sExpandPaso);
                // if(oResultPaso.results.length === 1000){
                //     while (aListPasosLength === 1000) {
                //         let aListPasoSkipData = await Service.onGetDataGeneralFiltersExpandSkip(that.mainModelv2, "PASO", aFilter, sExpandPaso, skipLine);
                //         aListPasosLength = aListPasoSkipData.results.length;
                //         oResultPaso.results = oResultPaso.results.concat(aListPasoSkipData.results);
                //         skipLine = skipLine + 1000;
                //     }
                // }
                this.localModel.setProperty("/aListaPasos", oResultPaso.results);
                let oResultUtensilio = await Service.onGetDataGeneralFiltersExpand(that.mainModelv2, "UTENSILIO", aFilter, sExpandUtensilio);
                oResultUtensilio.results.forEach(function(oUtensilio){
                    if(oUtensilio.clasificacionId_clasificacionUtensilioId === null) {
                        oUtensilio.bPerteneceAgrupador = 'NO';
                    } else {
                        oUtensilio.bPerteneceAgrupador = 'SI';
                    }
                });
                this.localModel.setProperty("/aListaUtensilio", oResultUtensilio.results);
            },

            onCloseConfiguration: function () {
                this.oConfiguration.close();
            },

            onNewStructure: function () {
                if (!this.oNewStructure) {
                    this.oNewStructure = sap.ui.xmlfragment(
                        "frgNewStructure",
                        sRootPath + ".view.fragment.configuration.new.NewStructure",
                        this
                    );
                    this.getView().addDependent(this.oNewStructure);
                }

                this.oNewStructure.open();
            },

            onCancelStructure: function () {
                this.oNewStructure.close();
            },
            // ACCION CREAR NUEVO RM
            onGetNewRM: function () {
                if (!this.oNewRM) {
                    this.oNewRM = sap.ui.xmlfragment(
                        "frgNewRM",
                        sRootPath + ".view.fragment.NewRM",
                        this
                    );
                    this.getView().addDependent(this.oNewRM);
                }
                this.getView().getModel("oDataNewMD").setProperty("/", []);
                this.oNewRM.open();
            },

            onCancelNewRM: function () {
                oThat.onCleanDataMD();
                this.oNewRM.close();
            },

            // ACCION ABRIR FRAGMENT ASOCIAR ARTICULOS A RM
            onGetAsociarArticulos: function () {
                if (!this.oAsociarArticulos) {
                    this.oAsociarArticulos = sap.ui.xmlfragment(
                        "frgAsocArtRM",
                        sRootPath + ".view.fragment.AsociarArt",
                        this
                    );
                    this.getView().addDependent(this.oAsociarArticulos);
                }
                oInfoUsuario.rol.forEach(function(e){
                    if(e.rolId === oRolJefaturaDT) {
                        oThat.localModel.setProperty("/esJefeDT", true);
                        oThat.localModel.setProperty("/esRegistrador", true);
                    }
                    if(e.rolId === oRolRegistrador) {
                        oThat.localModel.setProperty("/esRegistrador", true); 
                    }
                });
                this.oAsociarArticulos.open();
            },

            onCancelAsociarArticulos: function () {
                this.oAsociarArticulos.close();
            },

            // ACCION AGREGAR RECETAS EN ASOCIAR ARTICULOS RM
            onConfirmAgregarRecetas: async function () {
                BusyIndicator.show(0);
                var oMDSeleccionada = oThat.getView().getModel("asociarDatos");
                var oTblMdReceta = sap.ui.getCore().byId("frgAsocRecetas--idTblRecetas");
                var aPaths = oTblMdReceta._aSelectedPaths;
                var oListMdReceta = oThat.getView().getModel("aListReceta");
                var aListDataMdReceta = oListMdReceta.getData();
                let aFilter = [];
                aFilter.push(new Filter("mdId_mdId", "EQ", oMDSeleccionada.getData().mdId));
                let oResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD_RECETA", aFilter);
                if ((oResponse.results.length > 0 || aPaths.length > 1) && (oMDSeleccionada.getData().nivelTxt === iNivelFabricacion || oMDSeleccionada.getData().nivelTxt === iNivelRecubrimiento) && oMDSeleccionada.getData().masRecetas === false) {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage4"));
                    BusyIndicator.hide();
                    return;
                } else {
                    // Validacion para asignar recetas solo del mismo codigo.
                    // let oTblMdReceta = sap.ui.getCore().byId("frgAsocRecetas--idTblRecetas");
                        // aPaths = oTblMdReceta._aSelectedPaths,
                        // oListMdReceta = oThat.getView().getModel("aListReceta"),
                        // aListDataMdReceta = oListMdReceta.getData(),
                        // oListMdRecetas = oThat.getView().getModel("listMdReceta"),
                        // bFlagreceta = true;
                    
                    MessageBox.confirm(formatter.onGetI18nText(oThat, "sMesaggeSaveReceta"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === "OK") {
                                oThat.onAgregarRecetas().then(async function (oDataRegister, oError) {
                                    BusyIndicator.show(0);
                                    await oThat.onGetDataInitial();
                                    await oThat.actualizarCabeceraAsociarDatos();
                                    await oThat.onCancelAsociarRecetas();
                                    await oThat.onGetDataEstructuraMD();
                                    await oThat.onGetMdRecetaGeneral();
                                    let aListMdRecetaId = oThat.localModel.getProperty("/aListMdRecetaId");
                                    if (aListMdRecetaId.length > 0) {
                                        for await (const sId of aListMdRecetaId) {
                                            await oThat.onTratarInformacionDMS(sId, "ACTUALIZAR");
                                        }
                                    }
                                    MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDReceta"));
                                    BusyIndicator.hide();
                                }).catch(oError => {
                                    sap.ui.core.BusyIndicator.hide();
                                    oThat.onErrorMessage(oError, "errorSave");
                                });
                            }else{
                                BusyIndicator.hide();
                            }
                        },
                    });
                }
            },

            // Asignar receta a MD.
            onAgregarRecetas: async function () {
                sap.ui.core.BusyIndicator.show(0);
                return new Promise(async function (resolve, reject) {
                    let oTblMdReceta = sap.ui.getCore().byId("frgAsocRecetas--idTblRecetas"),
                        aPaths = oTblMdReceta._aSelectedPaths,
                        oListMdReceta = oThat.getView().getModel("aListReceta"),
                        aListDataMdReceta = oListMdReceta.getData(),
                        oMDSeleccionada = oThat.getView().getModel("asociarDatos"),
                        aSelectedReceta = [],
                        aSelectedDuplicateReceta = [];

                    await oThat.onGetMdEstructuraByMd().then(async function (oDataMdEstructura, oError) {
                        console.log(oDataMdEstructura);
                        let aMdEstructura = oDataMdEstructura.results;
                        let sIdEstructura = "";
                        let sMdIdEstructura = "";
                        let dDate = new Date();

                        for await (const item of aMdEstructura) {
                            if (item.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula) {
                                sMdIdEstructura = item.mdEstructuraId;

                                sIdEstructura = item.estructuraId_estructuraId;
                            }
                        }

                        if (sMdIdEstructura === "") {
                            await oThat.onGetEstructura().then(async function (aListEstructura, oError) {
                                const aEstructura = aListEstructura.results;
                                if (aListEstructura.results.length > 0) {
                                    let mdEstrucuturaId = util.onGetUUIDV4();
                                    let dDate = new Date();
                                    await aMdEstructura.sort((a, b) => {
                                        return (
                                            b.orden - a.orden
                                        );
                                    });
                                    let oMdEstructuraSave = {
                                        terminal: null,
                                        fechaRegistro: dDate,
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        activo: true,
                                        mdEstructuraId: mdEstrucuturaId,
                                        mdId_mdId: oMDSeleccionada.getData().mdId,
                                        estructuraId_estructuraId: aEstructura[0].estructuraId,
                                        orden: aMdEstructura[0] ? aMdEstructura[0].orden + 1 : 1
                                    }

                                    sIdEstructura = aEstructura[0].estructuraId;
                                    sMdIdEstructura = mdEstrucuturaId;

                                    await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTRUCTURA", oMdEstructuraSave).then(function (oDataSaved, oError) {
                                        MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMDEstructureInsumo"));
                                    }).catch(function (oError) {
                                        sap.ui.core.BusyIndicator.hide();
                                        reject(oError);
                                    });
                                } else {
                                    reject(MessageBox.error(formatter.onGetI18nText(oThat, "sNoEstructuraCreada")));
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;
                                }
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                reject(oError);
                            });
                        }

                        for await (const item of aPaths) {
                            const aData = aListDataMdReceta[item.split("/")[1]];
                            let arrRecetas = await oThat.onValidateReceta(aData);
                            arrRecetas = arrRecetas.results;
                            aData.activo = true;
                            aData.usuarioRegistro = oInfoUsuario.data.usuario;
                            aData.fechaRegistro = dDate;
                            delete aData.__metadata;
                            // aData.flagEnsayoSAP = false;
                            if(arrRecetas.length>0){
                                aData.recetaId = arrRecetas[0].recetaId;
                                aData.flagEnsayosap= false;
                                 // mcode
                                // let info = await that.onValidateReceta(element);
                                // if(info.results.length>0){
                                // let id = info.results[0].recetaId;
                                aData.usuarioActualiza = oInfoUsuario.data.usuario;
                                aData.fechaActualiza = new Date();
                                await  Service.onUpdateDataGeneral(oThat.mainModelv2,"RECETA",aData,aData.recetaId)
                            // }
                            } else {
                                aData.recetaId = util.onGetUUIDV4();
                                aSelectedReceta.push(aData);
                            }
                            aSelectedDuplicateReceta.push(aData);
                        }

                        // modelContext.setProperty("flagEnsayoSAP",true);

                        let oTablaArrayInsert = {};
                            oTablaArrayInsert.terminal         = null;
                            oTablaArrayInsert.usuarioRegistro  = "USUARIOTEST";
                            oTablaArrayInsert.fechaRegistro    = new Date();
                            oTablaArrayInsert.activo           = true;
                            oTablaArrayInsert.aReceta          = aSelectedReceta;
                            oTablaArrayInsert.id               = util.onGetUUIDV4();

                        await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oTablaArrayInsert).then(async function (oDataSaved, oError) {
                            let dDate = new Date();
                            let aListMdRecetaId = [];
                            for await (const v of aSelectedDuplicateReceta) {
                                let k = 0;
                                let aMdDataReceta = {
                                    aReceta: []
                                };

                                aMdDataReceta.aReceta.push(
                                    {
                                        terminal: null,
                                        fechaRegistro: dDate,
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        activo: true,
                                        mdRecetaId: util.onGetUUIDV4(),
                                        mdId_mdId: oMDSeleccionada.getData().mdId,
                                        recetaId_recetaId: v.recetaId,
                                        orden: k + 1
                                    }
                                );
                                let sFilter = [];
                                sFilter.push(new Filter("Matnr", 'EQ', v.Matnr));
                                sFilter.push(new Filter("Werks", "EQ", oMDSeleccionada.getData().sucursalId.codigo));
                                sFilter.push(new Filter("Stlal", "EQ", parseInt(v.Stlal).toString()));
                                let aListInsumos = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "MaterialSet", sFilter);
                                
                                // Insumos asignados a un paso.
                                let sFilterPI = [];
                                sFilterPI.push(new Filter("estructuraRecetaInsumoId_estructuraRecetaInsumoId", 'NE', null));
                                sFilterPI.push(new Filter("mdId_mdId", "EQ", oMDSeleccionada.getData().mdId));
                                sFilterPI.push(new Filter("activo", "EQ", true));
                                let aListPasosInsumos = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", sFilterPI);
                                aMdDataReceta.aReceta[0].aInsumos = [];
                                let aFilterInsumos = [];

                                for await (const itemI of aListInsumos.results) {
                                    let sCodigoInsumo = util.onGetUUIDV4();
                                    var oParam = {
                                        activo : true,
                                        fechaRegistro : dDate,
                                        usuarioRegistro : oInfoUsuario.data.usuario,
                                        estructuraRecetaInsumoId : sCodigoInsumo,
                                        mdId_mdId : oMDSeleccionada.getData().mdId,
                                        estructuraId_estructuraId : sIdEstructura,
                                        mdEstructuraId_mdEstructuraId : sMdIdEstructura,
                                        mdRecetaId_mdRecetaId : aMdDataReceta.aReceta[0].mdRecetaId,
                                        Matnr : itemI.Matnr,
                                        Werks : itemI.Werks,
                                        Maktx : itemI.Maktx,
                                        ItemCateg : itemI.ItemCateg,
                                        ItemNo : itemI.ItemNo,
                                        Component : itemI.Component,
                                        CompQty : itemI.CompQty,
                                        CompUnit : itemI.CompUnit,
                                        Txtadic : itemI.Txtadic,
                                        AiPrio : itemI.AiPrio
                                    }
                                    aMdDataReceta.aReceta[0].aInsumos.push(oParam);
                                    let aFindInsumo = aListPasosInsumos.results.filter(itm=>itm.Component === itemI.Component && itm.Matnr === itemI.Matnr);
                                    if (aFindInsumo.length > 0) {
                                        for await (const itemPI of aFindInsumo) {
                                            let aChangeIdInsumo = {
                                                mdEstructuraPasoInsumoPasoId: itemPI.mdEstructuraPasoInsumoPasoId,
                                                estructuraRecetaInsumoId: sCodigoInsumo
                                            };
                                            aFilterInsumos.push(aChangeIdInsumo);
                                        }
                                    }
                                }
                                
                                let oTablaArrayInsert = {};
                                    oTablaArrayInsert.terminal         = null;
                                    oTablaArrayInsert.usuarioRegistro  = "USUARIOTEST";
                                    oTablaArrayInsert.fechaRegistro    = new Date();
                                    oTablaArrayInsert.activo           = true;
                                    oTablaArrayInsert.aMdReceta        = aMdDataReceta.aReceta;
                                    oTablaArrayInsert.id               = util.onGetUUIDV4();
                                await oThat.onAsignRecetaToMd(oTablaArrayInsert).then(async function (oDataMdRecetaSaved, oError) {
                                    if (aListPasosInsumos.results.length > 0) {
                                        for await (const oItemI of aFilterInsumos) {
                                            let oDataInsumoPaso = {
                                                estructuraRecetaInsumoId_estructuraRecetaInsumoId: oItemI.estructuraRecetaInsumoId,
                                                fechaActualiza : dDate,
                                                usuarioActualiza : oInfoUsuario.data.usuario
                                            }

                                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", oDataInsumoPaso, oItemI.mdEstructuraPasoInsumoPasoId);
                                        }
                                    }
                                    let oMdUpdate = {
                                        af: "SI",
                                    }
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oMdUpdate, oMDSeleccionada.getData().mdId);
                                    if (Number(oMDSeleccionada.getData().estadoIdRmd_iMaestraId) === estadoAutorizado) {
                                        aListMdRecetaId.push(oTablaArrayInsert.aMdReceta[0].mdRecetaId);
                                    }
                                }).catch(oError => {
                                    sap.ui.core.BusyIndicator.hide();
                                    reject(oError);
                                });

                                k++;
                            }
                            oThat.localModel.setProperty("/aListMdRecetaId", aListMdRecetaId);
                            resolve(true);
                        }).catch(function (oError) {
                            sap.ui.core.BusyIndicator.hide();
                            reject(oError);
                        });
                    }).catch(oError => {
                        sap.ui.core.BusyIndicator.hide();
                        reject(oError);
                    });
                });
            },
            onValidateReceta: async function(item){
                try {
                    let aFilter = [];
                    aFilter.push(new Filter("Matnr","EQ",item.Matnr))
                    aFilter.push(new Filter("Verid","EQ",item.Verid))
                    return await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RECETA", aFilter);
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },
            // ACCION ABRIR FRAGMENT EDITAR RM
            onGetEditarRM: function () {
                if (!this.oEditarRM) {
                    this.oEditarRM = sap.ui.xmlfragment(
                        "frgEditRM",
                        sRootPath + ".view.fragment.EditarRM",
                        this.configuracion
                    );
                    this.getView().addDependent(this.oEditarRM);
                }

                this.oEditarRM.open();
                this.configuracion.onAfterRendering(this);
            },

            onCancelEditarRM: function () {
                this.oEditarRM.close();
            },

            // ACCION ABRIR FRAGMENT ASOCIAR RECETAS
            onAsociarRecetas: function () {
                let that = this;
                this.onGetReceta().then(async function (oListReceta, oError) {
                    var oDataFilterReceta = oThat.getView().getModel("oDataFilterReceta");
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    // oDataFilterReceta.getData().etapaBase = oDataSeleccionada.getData().nivelId_iMaestraId; // falta campo
                    oDataFilterReceta.getData().description = oDataSeleccionada.getData().descripcion;
                    oThat.getView().getModel("oDataFilterReceta").refresh(true);
                    let aRecetas = oListReceta.results;
                    let oListMdRecetas = oThat.getView().getModel("listMdReceta");
                    let aRecetasNoAsign = [];
                    let aRecetasFinal = [];
                    for await( const element of aRecetas) {
                       
                        let bFlag = true;
                        //validamos que esta la visibilidad de la receta
                        oListMdRecetas.getData().forEach(function (item) {
                            if (element.Matnr === item.recetaId.Matnr && element.Verid === item.recetaId.Verid) {
                                bFlag = false;
                                return false;
                            }
                        });

                        if (bFlag) {
                            aRecetasNoAsign.push(element);
                        }
                    }
                    // aRecetas.forEach(function (element) {

                        //validamos y actualizamos 
                       
                    // });

                    if (oDataFilterReceta.getData().etapaBase !== iNivelFabricacion){
                        let sExpandMD = "aReceta/recetaId"
                        let sFilterMD = [];
                        sFilterMD.push(new Filter("estadoIdRmd_iMaestraId", 'EQ', estadoAutorizado));
                        sFilterMD.push(new Filter("estadoIdRmd_iMaestraId", 'EQ', sIdEstadoRMIniciado));
                        let aListaMatnr = [];
                        let aListaMdAutorizado = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", sFilterMD, sExpandMD);
                        aListaMdAutorizado.results.forEach(function(e){
                            e.aReceta.results.forEach(function(itm){
                                if (itm.recetaId) {
                                    let matnr = itm.recetaId.Matnr ? itm.recetaId.Matnr : '';
                                    let verid = itm.recetaId.Verid ? itm.recetaId.Verid : '';
                                    aListaMatnr.push({Matnr: matnr, Verid: verid});
                                }
                            });
                        });
                        aRecetasNoAsign.forEach(function(obj){
                            let bMdFlag = true;
                            aListaMatnr.forEach(function (item) {
                                if (obj.Matnr === item.Matnr && obj.Verid === item.Verid) {
                                    bMdFlag = false;
                                    return false;
                                }
                            });

                            if (bMdFlag) {
                                aRecetasFinal.push(obj);
                            }
                        });
                    } else {
                        aRecetasFinal = aRecetasNoAsign;
                    }

                    // Ordenamiento segun sus campos.
                    await aRecetasFinal.sort((aPos, bPos) => {
                        return (
                            aPos.Matnr - bPos.Matnr ||
                            aPos.Verid - bPos.Verid
                        );
                    });

                    let oModelEst = new JSONModel(aRecetasFinal);
                    oModelEst.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEst, "aListReceta");
                    oThat.onAsociarRecetasFrg();
                    oThat.onSearchReceta();
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });
            },

            onAsociarRecetasFrg: function () {
                if (!this.oAsocRecetas) {
                    this.oAsocRecetas = sap.ui.xmlfragment(
                        "frgAsocRecetas",
                        sRootPath + ".view.fragment.asociarArt.AsocRecetas",
                        this
                    );
                    this.getView().addDependent(this.oAsocRecetas);
                }

                this.oAsocRecetas.open();
            },

            onCancelAsociarRecetas: function () {
                oThat.onCleanDataRecetas();
                this.oAsocRecetas.close();
            },

            // ACCION ABRIR FRAGMENT OP SIN RM
            onOpSinRM:async function () {
                try {
                    if (!this.oOpSinRM) {
                        this.oOpSinRM = sap.ui.xmlfragment(
                            "frgOpSinRM",
                            sRootPath + ".view.fragment.opSinRM.opSinRMInfo",
                            this
                        );
                        this.getView().addDependent(this.oOpSinRM);
                    }
                    this.oOpSinRM.open();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            _subtractTimeFromDate: function (objDate, intHours) {
                var numberOfMlSeconds = objDate.getTime();
                var addMlSeconds = intHours * 60 * 60000;
                var newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
                return newDateObj;
            },

            onGetMdRecetaOpSinRmd:async function () {
                try {   
                    BusyIndicator.show(0);
                    let sExpand = "mdId,recetaId";
                    let oData = await Service.onGetDataGeneralExpand(oThat.mainModelv2, "MD_RECETA", sExpand);
                    return oData.results;
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Mejorar Performance
            onGetOpsNoRmd:async function (aOps, aRecetas, dFechaInicio) {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    let aOrdenes = [];
                    for await (const v of aOps) {
                        let bFlagReceta = true;
                        for await (const itm of aRecetas) {
                            if (itm.mdId) {
                                if (itm.recetaId.Matnr === v.Matnr && itm.recetaId.Verid === v.Verid && itm.mdId.estadoIdRmd_iMaestraId === estadoAutorizado) {
                                    bFlagReceta = false;
                                    break;
                                }
                            }
                        }
                        if (bFlagReceta) {
                            aOrdenes.push(v);
                        }
                    }

                    let dDate = dFechaInicio;
                    
                    let oFecha = {
                        dia1: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate()))),
                        dia2: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia3: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia4: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia5: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia6: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia7: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia8: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia9: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia10: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia11: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia12: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia13: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia14: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1))),
                        dia15: formatter.formatDateFooter(new Date(dDate.setDate(dDate.getDate() + 1)))
                    };
                    
                    let aOrdenesSinRepetir = [];

                    aOrdenes.sort(function (a, b) {
                        return a.Gstrp - b.Gstrp;
                    });
                    
                    for await (const v of aOrdenes) {
                        var oRepetido = aOrdenesSinRepetir.find(item => item.Matnr === v.Matnr);

                        if (v.Gstrp !== null) {
                            let dDateFecha = formatter.formatDateUTC(v.Gstrp);
                            if (oFecha.dia1 === dDateFecha) {
                                if (oRepetido) oRepetido.dia1 = true;
                                v.dia1 = true;
                            } else if (oFecha.dia2 === dDateFecha) {
                                if (oRepetido) oRepetido.dia2 = true;
                                v.dia2 = true;
                            } else if (oFecha.dia3 === dDateFecha) {
                                if (oRepetido) oRepetido.dia3 = true;
                                v.dia3 = true;
                            } else if (oFecha.dia4 === dDateFecha) {
                                if (oRepetido) oRepetido.dia4 = true;
                                v.dia4 = true;
                            } else if (oFecha.dia5 === dDateFecha) {
                                if (oRepetido) oRepetido.dia5 = true;
                                v.dia5 = true;
                            } else if (oFecha.dia6 === dDateFecha) {
                                if (oRepetido) oRepetido.dia6 = true;
                                v.dia6 = true;
                            } else if (oFecha.dia7 === dDateFecha) {
                                if (oRepetido) oRepetido.dia7 = true;
                                v.dia7 = true;
                            } else if (oFecha.dia8 === dDateFecha) {
                                if (oRepetido) oRepetido.dia8 = true;
                                v.dia8 = true;
                            } else if (oFecha.dia9 === dDateFecha) {
                                if (oRepetido) oRepetido.dia9 = true;
                                v.dia9 = true;
                            } else if (oFecha.dia10 === dDateFecha) {
                                if (oRepetido) oRepetido.dia10 = true;
                                v.dia10 = true;
                            } else if (oFecha.dia11 === dDateFecha) {
                                if (oRepetido) oRepetido.dia11 = true;
                                v.dia11 = true;
                            } else if (oFecha.dia12 === dDateFecha) {
                                if (oRepetido) oRepetido.dia12 = true;
                                v.dia12 = true;
                            } else if (oFecha.dia13 === dDateFecha) {
                                if (oRepetido) oRepetido.dia13 = true;
                                v.dia13 = true;
                            } else if (oFecha.dia14 === dDateFecha) {
                                if (oRepetido) oRepetido.dia14 = true;
                                v.dia14 = true;
                            } else if (oFecha.dia15 === dDateFecha) {
                                if (oRepetido) oRepetido.dia15 = true;
                                v.dia15 = true;
                            }
                        }

                        if (!oRepetido) {
                            let aNiveles = oThat.localModel.getProperty('/aListaNiveles');
                            let sNivel = await aNiveles.find(item => item.Atwrt.includes(v.Dauat.slice(0,-1)));
                            let aReceta = [];
                            if (sNivel) {
                                aReceta = await oThat.onGetRecetaOp(v, sNivel.Atwrt);
                            }
                            if (aReceta) {
                                if (aReceta.length > 0) {
                                    v.Dispo = aReceta[0].Dispo;
                                    v.Dsnam = aReceta[0].Dsnam;
                                    v.DispoFlag = true;
                                }
                            } else {
                                v.DispoFlag = false;
                            }
                            let aPlantas = await oThat.onGetPlantas();

                            if (aPlantas) {
                                if (aPlantas.length > 0) {
                                    let oPlanta = await aPlantas.find(item => item.codigo === v.Pwerk);
                                    if (oPlanta) {
                                        v.planta = oPlanta.contenido;
                                    } else {
                                        v.planta = '';
                                    }
                                }
                            }
                            aOrdenesSinRepetir.push(v);
                        }
                    }

                    let oModel = new JSONModel(aOrdenesSinRepetir);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "aListOps");

                    let oModelF = new JSONModel(oFecha);
                    oModelF.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelF, "oFechaOpSinRmd");
                    sap.ui.core.BusyIndicator.hide();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener unos campos para completar la OP.
            onGetRecetaOp: async function (oData, sNivel) {
                try {
                    var afilters = [];
                    afilters.push(new Filter("Matnr", "EQ", oData.Matnr));
                    afilters.push(new Filter("Werks", "EQ", oData.Pwerk));
                    afilters.push(new Filter("PrfgF", "EQ", sEstadoPermitidoProducto));
                    afilters.push(new Filter("Atwrt", "EQ", sNivel));
                    let oDataResult = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "ProduccionVSet", afilters);
                    return oDataResult.results;
                } catch (oError) {
                    // sap.ui.core.BusyIndicator.hide();
                    // oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener lista de Plantas.
            onGetPlantas: async function () {
                try {
                    var afilters = [];
                    afilters.push(new Filter("oMaestraTipo_maestraTipoId", "EQ", sIdPlanta));
                    let oDataResult = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MAESTRA", afilters);
                    return oDataResult.results;
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    // oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetOPSinRMD: async function (dFechaInicio) {
                let fechaActual = oThat._subtractTimeFromDate(dFechaInicio, 5);
                let fechaFin = oThat._subtractTimeFromDate(new Date(new Date().setDate(dFechaInicio.getDate() +   14)), 5);
                let aFilters = [];
                aFilters.push(new Filter("Gstrp", "BT", fechaActual, fechaFin));
                let aOps = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "OrdenSet", aFilters);
                aOps = aOps.results.filter(item => !item.Stats.includes('CTEC'));
                let aRecetas = await oThat.onGetMdRecetaOpSinRmd();
                await oThat.onGetOpsNoRmd(aOps, aRecetas, dFechaInicio);
            },

            onSearchOpSinRmd: async function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgOpSinRM--idTblOpSinRmd");
                    var oDataFilter = this.getView().getModel("oDataFilterOpSinRmd");
                    var aFilter = [];

                    if (oDataFilter.getData().fechaInicio && oDataFilter.getData().fechaInicio !== '') {
                        await oThat.onGetOPSinRMD(new Date(oDataFilter.getData().fechaInicio));
                    } else {
                        MessageBox.error("Debe ingresar una fecha.");
                        return;
                    }

                    if (oDataFilter.getData().productoId && oDataFilter.getData().productoId !== '')
                        aFilter.push(
                            new Filter(
                                "Matnr",
                                FilterOperator.Contains,
                                oDataFilter.getData().productoId
                            )
                        );
                        // aFilter.push(
                        //     new Filter(
                        //         "DispoFlag",
                        //         FilterOperator.EQ,
                        //         oDataFilter.getData().Dispo
                        //     )
                        // );
                    if (oDataFilter.getData().etapa && oDataFilter.getData().etapa !== '')
                        aFilter.push(
                            new Filter(
                                "Dauat",
                                FilterOperator.Contains,
                                oDataFilter.getData().etapa
                            )
                        );
                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onRestoreFiltersOpSinRmd: function () {
                var oDataFilter = this.getView().getModel("oDataFilterOpSinRmd");
                oDataFilter.getData().productoId = '';
                oDataFilter.getData().etapa = '';
                this.onSearchOpSinRmd();
            },

            onValidationNumber: function (oEvent) {
                let sValueInput = oEvent.getSource().getValue();
                if (Number(sValueInput) === 0) {
                    if (sValueInput.split(".")[1]) {
                        if (sValueInput.split(".")[1].length > lineaSeleccionada.decimales) {
                            oEvent.getSource().setValue(Number(sValueInput).toFixed(lineaSeleccionada.decimales));
                            val = Number(sValueInput).toFixed(lineaSeleccionada.decimales);
                        }
                    }
                } else if (!Number(sValueInput)) {
                    oEvent.getSource().setValue(sValueInput.substring(0, sValueInput.length - 1));
                    val = sValueInput.substring(0, sValueInput.length - 1);
                } else {
                    if (sValueInput.split(".")[1]) {
                        if (sValueInput.split(".")[1].length > lineaSeleccionada.decimales) {
                            oEvent.getSource().setValue(Number(sValueInput).toFixed(lineaSeleccionada.decimales));
                            val = Number(sValueInput).toFixed(lineaSeleccionada.decimales);
                        }
                    }
                }
            },

            onCancelOpSinRM: function () {
                sap.ui.core.BusyIndicator.hide();
                this.onCleanFiltroOpSinRmd();
                this.oOpSinRM.close();
            },

            // ACCION ABRIR FRAGMENT VER OP
            onVerOP: async function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    if (!this.oVerOP) {
                        this.oVerOP = sap.ui.xmlfragment(
                            "frgVerOP",
                            sRootPath + ".view.fragment.VerOP",
                            this
                        );
                        this.getView().addDependent(this.oVerOP);
                    }

                    await oThat.onGetRMDVerOP();

                    
                    this.oVerOP.open();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Mejorar Performance
            onGetRMDVerOP:async function () {
                try {
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    aFilters.push(new Filter("estadoIdRmd_iMaestraId", "NE", null));
                    let sExpand = "mdId/estadoIdRmd,estadoIdRmd,aEstructura/estructuraId,aEstructura/aEquipo/equipoId,aEstructura/aPaso/pasoId,aEstructura/aUtensilio/utensilioId,aEstructura/aEspecificacion,aEstructura/aInsumo,aEstructura/aEtiqueta/etiquetaId,aEstructura/aPasoInsumoPaso/pasoHijoId,aEstructura/aPasoInsumoPaso/rmdEstructuraRecetaInsumoId,aReceta/recetaId";
                    var rmdResponse = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD", aFilters, sExpand);
                    rmdResponse.results.forEach(function(oRMD){
                        if (oRMD.estadoIdRmd_iMaestraId === 478) {
                            oRMD.fechaCierre = oRMD.fechaActualiza;
                        }
                    });
                    this.localModel.setProperty("/Estructura", rmdResponse.results);
                    sap.ui.core.BusyIndicator.hide();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onDeleteAsociacionOP: async function (oEvent) {
                try {
                    var oThat = this;
                    var lineaSeleccionada = oEvent.getSource().getBindingContext("localModel").getObject();
                    let aFilterEtiq = [];
                    aFilterEtiq.push(new Filter("orden", "EQ", lineaSeleccionada.ordenSAP));
                    // aFilterEtiq.push(new Filter("enlace", "EQ", true));
                    aFilterEtiq.push(new Filter("activo", "EQ", true));
                    aFilterEtiq.push(new Filter("estadoEtiqueta_iMaestraId", "NE", 803));
                    let aEtiqResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "ETIQUETAS_CONTROL", aFilterEtiq);
                    let aFilterNotif = [];
                    aFilterNotif.push(new Filter("orden", "EQ", lineaSeleccionada.ordenSAP));
                    aFilterNotif.push(new Filter("activo", "EQ", true));
                    let aNotifResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_TABLA_CONTROL", aFilterNotif);
                    let aFilterPasoAuto = [];
                    aFilterPasoAuto.push(new Filter("rmdId_rmdId", "EQ", lineaSeleccionada.rmdId));
                    aFilterPasoAuto.push(new Filter("automatico", "EQ", true));
                    aFilterPasoAuto.push(new Filter("fechaFin", "NE", null));
                    aFilterPasoAuto.push(new Filter("activo", "EQ", true));
                    let aNotifAutoma = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_LAPSO", aFilterPasoAuto);
                    if (aEtiqResponse.results.length === 0 && aNotifResponse.results.length === 0 && aNotifAutoma.results.length === 0) {
                        MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage5"), {
                            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: async function (sAction) {
                                if (sAction === "OK") {
                                    var oParam = {
                                        fechaActualiza: new Date(),
                                        usuarioActualiza : oInfoUsuario.data.usuario,
                                        ordenSAP : null,
                                        activo: false
                                    }
                                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "RMD", oParam, lineaSeleccionada.rmdId);
                                    MessageBox.success(formatter.onGetI18nText(oThat,"msgFreeOrden"));
                                    await oThat.onGetRMDVerOP();
                                }
                            },
                        });
                    } else {
                        MessageBox.error("No se puede liberar la OP debido a que tiene Notificaciones o Etiquetas activas");
                    }
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onCancelVerOP: function () {
                this.oVerOP.close();
            },

            // ACCION ABRIR PROD ESTATUS MAIN
            onProdEstatus: function (oEvent) {
                if (!this.oProdEstatus) {
                    this.oProdEstatus = sap.ui.xmlfragment(
                        "frgProdEstatus",
                        sRootPath + ".view.fragment.ProdEstatus",
                        this
                    );
                    this.getView().addDependent(this.oProdEstatus);
                }
               
                var lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("listMD").getObject();
                if (lineaSeleccionada.aStatusProceso.results.length > 0) {
                    var firstLinea = lineaSeleccionada.aStatusProceso.results.find(item => item.estadoIdProceso_iMaestraId === sIdEstadoProcesoEnProduccion);
                    lineaSeleccionada.aStatusProceso.results.forEach(function (e) {
                        e.fechaDT = firstLinea.fechaRegistro;
                        if (e.estadoIdProceso_iMaestraId === sIdEstadoProcesoEnProduccion) {
                            e.state = "Warning"
                        } else if (e.estadoIdProceso_iMaestraId === 459 || e.estadoIdProceso_iMaestraId === 460 || e.estadoIdProceso_iMaestraId === 463) {
                            e.state = "Error"
                        } else {
                            e.state = "Success"
                        }
                    });
                    this.localModel.setProperty("/lineaStatusProd", lineaSeleccionada.aStatusProceso.results);
                }
                this.oProdEstatus.open();
            },

            onCancelProdEstatus: function () {
                this.oProdEstatus.close();
            },
            onGetLstMdCurrent:async function (params) {
                let {mdId} = oThat.getView().getModel("asociarDatos").getData();
                let aFilter = [];
                aFilter.push(new Filter("mdId", "EQ", mdId));
                let sExpand = "estadoIdRmd,estadoIdProceso,sucursalId,motivoId,destinatariosMD/usuarioId,aStatusProceso/estadoIdProceso,aStatusProceso/mdId,aReceta/recetaId,aTrazabilidad/estadoTrazab";
                let informacion = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2,"MD",aFilter,sExpand)
                if(informacion.results.length>0){
                    //actualizamos el modelo de asociardatos
                    oThat.getView().getModel("asociarDatos").setData(informacion.results[0])
                }
                // ;
                console.log(informacion);
            },

            // MENU DE ACCIONES MAIN
            onMenuAction: async function (oEvent) {
                var press = oEvent.mParameters.item.getProperty("text");
                var obj = oEvent.getSource().getBindingContext("listMD").getObject();
                var oModel = new JSONModel(obj);
                oThat.getView().setModel(oModel, "asociarDatos");
                await this.onGetDataEstructuraMD();

                if (press === "Asociar fórmulas") {
                    this.onGetMdRecetaGeneral();
                    let oMDSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                    oMDSeleccionada.observacionBK = oMDSeleccionada.observacion;
                    oMDSeleccionada.codAgrupadorRecetaBK = oMDSeleccionada.codAgrupadorReceta;
                    oMDSeleccionada.codDefectoRecetaBK = oMDSeleccionada.codDefectoReceta;
                    oMDSeleccionada.masRecetasBK = oMDSeleccionada.masRecetas;
                    oMDSeleccionada.rptaValidacionBK = oMDSeleccionada.rptaValidacion;
                    oMDSeleccionada.estadoIdRmd_iMaestraIdBK = oMDSeleccionada.estadoIdRmd_iMaestraId;
                    oThat.getView().getModel("asociarDatos").refresh(true);
                    this.onGetAsociarArticulos();
                } else if (press === "Configurar el RMD") {
                    oThat.onCreateModelTree();
                    oThat.onCreateModelTreeProcess();
                    this.onGetEditarRM();
                } else if (press === "Ver OP") {
                    this.onVerOP();
                } else if (press === "Ver master") {
                    this.tratarInformacion(false, true);
                } else if (press === "Descargar master") {
                    this.tratarInformacion(false, false);
                } else if (press === "Cancelar el RMD") {
                    this.onCancelarRM();
                } else if (press === "Trazabilidad RMD") {
                    this.onOpenTrazabilidad();
                } else if (press === "Agregar Documento") {
                    this.onAgregarDocumento();
                } else if (press === "Notas Importantes") {
                    this.onVerNotasImportantes();
                }
            },

            onGetMdEstructura: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId($expand=estadoIdRmd),estructuraId($expand=tipoEstructuraId)";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilters, sExpand).then(function (oListMdEstructura) {
                        resolve(oListMdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsPaso: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,mdEstructuraId/estructuraId,tipoDatoId,pasoId($expand=tipoDatoId,estadoId,tipoLapsoId,tipoCondicionId,etiquetaId)";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEquipo: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,estructuraId,equipoId/tipoId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_EQUIPO", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsUtensilio: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,estructuraId,utensilioId/estadoId,utensilioId/tipoId,agrupadorId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_UTENSILIO", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEtiqueta: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,estructuraId,etiquetaId($expand=estructuraId($expand=tipoEstructuraId))";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_ETIQUETA", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsReInsumo: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "estructuraId,mdRecetaId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_RE_INSUMO", aFilters, sExpand).then(function (oListMdPaso) {
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsEspecificacion: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "estructuraId,mdId,ensayoPadreId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_ESPECIFICACION", aFilters, sExpand).then(function (oListMdPaso) {
                        // if(oListMdPaso.results.length>0){
                        //     oThat.localModel.setProperty("/flagEnsayoSAP",false);
                        // }
                        resolve(oListMdPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetMdEsPasoInsumoPaso: function (oDataPasoEtiqueta) {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId,mdEstructuraId,estructuraId,mdEsEtiquetaId,etiquetaId,pasoId/tipoDatoId,pasoId/pasoId/estadoId,pasoHijoId/tipoDatoId,pasoHijoId/estadoId,estructuraRecetaInsumoId,tipoDatoId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", aFilters, sExpand).then(function (oListMdEsPasoInsumoPaso) {
                        resolve(oListMdEsPasoInsumoPaso);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onGetDataEstructuraMD: async function () {
                BusyIndicator.show(0);
                await Promise.all([oThat.onGetMdEstructura(), oThat.onGetMdEsPaso(), oThat.onGetMdEsEquipo(), oThat.onGetMdEsUtensilio(), 
                    oThat.onGetMdEsEtiqueta(), oThat.onGetMdEsReInsumo(), oThat.onGetMdEsEspecificacion(), oThat.onGetMdEsPasoInsumoPaso()])
                    .then(async function(values) {
                    let oModelEst = new JSONModel(values[0].results);
                    oModelEst.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEst, "listMdEstructura");
                    oThat.getView().getModel("listMdEstructura").refresh(true);

                    let oModelPaso = new JSONModel(values[1].results);
                    oModelPaso.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelPaso, "listMdEsPaso");
                    oThat.getView().getModel("listMdEsPaso").refresh(true);

                    let oModelEquipo = new JSONModel(values[2].results);
                    oModelEquipo.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEquipo, "listMdEsEquipo");
                    oThat.getView().getModel("listMdEsEquipo").refresh(true);

                    let oModelUtensilio = new JSONModel(values[3].results);
                    oModelUtensilio.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelUtensilio, "listMdEsUtensilio");
                    oThat.getView().getModel("listMdEsUtensilio").refresh(true);

                    let oModelEtiqueta = new JSONModel(values[4].results);
                    oModelEtiqueta.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEtiqueta, "listMdEsEtiqueta");
                    oThat.getView().getModel("listMdEsEtiqueta").refresh(true);

                    let oModelInsumo = new JSONModel(values[5].results);
                    oModelInsumo.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelInsumo, "listMdEsReInsumo");
                    oThat.getView().getModel("listMdEsReInsumo").refresh(true);
                    // debugger;
                    let oModelEspecificacion = new JSONModel(values[6].results);
                    oModelEspecificacion.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEspecificacion, "listMdEsEspecificacion");
                    oThat.getView().getModel("listMdEsEspecificacion").refresh(true);

                    let oModelEsPasoInsumoPaso = new JSONModel(values[7].results);
                    oModelEsPasoInsumoPaso.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelEsPasoInsumoPaso, "listEsPasoInsumoPasoGeneral");
                    oThat.getView().getModel("listEsPasoInsumoPasoGeneral").refresh(true);
                    await oThat.onCompletarAsociarDatos();
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });

                // let sExpand = "estadoIdRmd,aEstructura/estructuraId,aEstructura/aEquipo/equipoId,aEstructura/aPaso/pasoId,aEstructura/aEtiqueta/etiquetaId,aEstructura/aUtensilio/utensilioId,aEstructura/aPasoInsumoPaso/pasoId,aEstructura/aInsumo,aEstructura/aEspecificacion,aTrazabilidad/estadoTrazab,aTrazabilidad/mdId,aReceta/recetaId,aEstructura/aPasoInsumoPaso/pasoHijoId,aEstructura/aPasoInsumoPaso/estructuraRecetaInsumoId";
                // let aFilter = [];
                // aFilter.push(new Filter("mdId", "EQ", mdId));
                // let oResponseGetStructure = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", aFilter, sExpand);
                // var oModel = new JSONModel(oResponseGetStructure.results[0]);
                // oThat.getView().setModel(oModel, "asociarDatosV2");
                BusyIndicator.hide();
            },

            onCompletarAsociarDatos: async function () {
                let oModelMdEstructura = oThat.getView().getModel("listMdEstructura"),
                    oModelMdEsPaso = oThat.getView().getModel("listMdEsPaso"),
                    oModelMdEsEquipo = oThat.getView().getModel("listMdEsEquipo"),
                    oModelMdEsUtensilio = oThat.getView().getModel("listMdEsUtensilio"),
                    oModelMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta"),
                    oModelMdEsReInsumo = oThat.getView().getModel("listMdEsReInsumo"),
                    oModelMdEsEspecificacion = oThat.getView().getModel("listMdEsEspecificacion"),
                    oModelMdEsPasoInsumoPaso = oThat.getView().getModel("listEsPasoInsumoPasoGeneral"),
                    oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    oDataSeleccionada.getData().aEstructura.results = [];
                for await (const item of oModelMdEstructura.getData()) {
                    const aFilterMdPaso = await oModelMdEsPaso.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
                    });

                    const aFilterMdEquipo = await oModelMdEsEquipo.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
                    });

                    const aFilterMdUtensilio = await oModelMdEsUtensilio.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
                    });

                    const aFilterMdEtiqueta = await oModelMdEsEtiqueta.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
                    });

                    const aFilterMdReInsumo = await oModelMdEsReInsumo.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEspecificacion = await oModelMdEsEspecificacion.getData().filter((oItem) => {
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                    });

                    const aFilterMdEsPasoInsumoPaso = await oModelMdEsPasoInsumoPaso.getData().filter((oItem) => {
                        return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        // return item.estructuraId_estructuraId === oItem.estructuraId_estructuraId;
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
                oThat.getView().getModel("asociarDatos").refresh(true);
            },

            onCreateModelTree: async function () {
                let oModelMdEstructura = oThat.getView().getModel("listMdEstructura"),
                    oModelMdEsPaso = oThat.getView().getModel("listMdEsPaso"),
                    oModelMdEsEquipo = oThat.getView().getModel("listMdEsEquipo"),
                    oModelMdEsUtensilio = oThat.getView().getModel("listMdEsUtensilio"),
                    oModelMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta"),
                    oModelMdEsReInsumo = oThat.getView().getModel("listMdEsReInsumo"),
                    oModelMdEsEspecificacion = oThat.getView().getModel("listMdEsEspecificacion"),
                    oDataSeleccionada = oThat.getView().getModel("asociarDatos");

                //validamos el flag de ensayos sap
             

                let oModelEstructuraPaso = [];

                if (oModelMdEstructura) {
                    for await (const item of oModelMdEstructura.getData()) {
                        const aFilterMdPaso = await oModelMdEsPaso.getData().filter((oItem) => {
                            return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        });
    
                        const aFilterMdEquipo = await oModelMdEsEquipo.getData().filter((oItem) => {
                            return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        });
    
                        const aFilterMdUtensilio = await oModelMdEsUtensilio.getData().filter((oItem) => {
                            return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        });
    
                        const aFilterMdEtiqueta = await oModelMdEsEtiqueta.getData().filter((oItem) => {
                            return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        });
                        
                        await oDataSeleccionada.getData().aReceta.results.sort(function (a, b) {
                            return (
                                a.Matnr - b.Matnr ||
                                a.Verid - b.Verid
                            );
                        });
                        
                        const aFilterMdReInsumo = await oModelMdEsReInsumo.getData().filter((oItem) => {
                            return (oItem.AiPrio === sAiPrio00 || oItem.AiPrio === sAiPrio01) && item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId && oItem.mdRecetaId_mdRecetaId === oDataSeleccionada.getData().aReceta.results[0].mdRecetaId;
                        });
    
                        const aFilterMdEspecificacion = await oModelMdEsEspecificacion.getData().filter((oItem) => {
                            return item.mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId;
                        });
                        //CONTAR AGRUPADORES
                        // const  aCountAgrupadores = await oModelMdEsUtensilio.getData().filter(val=> val.agrupadorId_clasificacionUtensilioId!=null && val.mdEstructuraId_mdEstructuraId === item.mdEstructuraId);
                        let iCantPosicionesPasos = aFilterMdPaso.length;
                        let iCantPosicionesEquipos = aFilterMdEquipo.length;
                        let iCantPosicionesUtensilios = aFilterMdUtensilio.length;
                        let iCantPosicionesEtiqueta = aFilterMdEtiqueta.length;
                        let iCantPosicionesInsumos = 0;
                        let iCantPosicionesEspecificaciones = aFilterMdEspecificacion.length;
                        // let iCantPosicionesAgrupadores = aCountAgrupadores.length;
    
                        if (oDataSeleccionada.getData().nivelTxt === iNivelFabricacion || oDataSeleccionada.getData().nivelTxt === iNivelRecubrimiento) {
                            iCantPosicionesInsumos = aFilterMdReInsumo.length;
                        }
                        
                        let iCantidadGeneral = 0;
                        if (iCantPosicionesEtiqueta > 0) {
                            iCantidadGeneral = iCantPosicionesEtiqueta;
                        } else if (iCantPosicionesEquipos > 0 || iCantPosicionesUtensilios > 0) {
                            // iCantidadGeneral = iCantPosicionesEquipos + iCantPosicionesUtensilios + iCantPosicionesAgrupadores;
                            iCantidadGeneral = iCantPosicionesEquipos + iCantPosicionesUtensilios;
                        } else if (iCantPosicionesInsumos > 0) {
                            iCantidadGeneral = iCantPosicionesInsumos;
                        } else if (iCantPosicionesPasos > 0) {
                            iCantidadGeneral = iCantPosicionesPasos;
                        } else if (iCantPosicionesEspecificaciones > 0) {
                            iCantidadGeneral = iCantPosicionesEspecificaciones;
                        }
    
                        oModelEstructuraPaso.push(
                            {
                                orden: item.orden,
                                descripcion_est: item.estructuraId.descripcion,
                                codigo_est: item.estructuraId.codigo,
                                cantidad_mde: iCantidadGeneral,
                                estadoIdRmd: item.mdId.estadoIdRmd.contenido,
                                numeracion_est: item.estructuraId.numeracion,
                                design: "Standard",
                                tipoEstructuraId: item.estructuraId.tipoEstructuraId_iMaestraId,
                                estructuraId_estructuraId: item.estructuraId_estructuraId,
                                mdId_mdId: item.mdId_mdId,
                                editMdPaso: false,
                                mdEstructuraId: item.mdEstructuraId,
                                nivelTxt: item.mdId.nivelTxt,
                                Posicion: []
                            }
                        );
                    }
    
                    oModelEstructuraPaso.sort(function (a, b) {
                        return a.orden - b.orden;
                    });
    
                    let oModel = new JSONModel(oModelEstructuraPaso);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMdEstructuraGeneral");
                }
            },

            onCreateModelTreeProcess: async function () {
                ;
                let oModelMdEsEtiqueta = oThat.getView().getModel("listMdEsEtiqueta"),
                    oModelMdEsPaso = oThat.getView().getModel("listMdEsPaso");

                let oModelEtiquetaPaso = [];

                if (oModelMdEsEtiqueta) {
                    for await (const item of oModelMdEsEtiqueta.getData()) {
                        const aFilterMdPaso = await oModelMdEsPaso.getData().filter((oItem) => {
                            return item.mdEstructuraId_mdEstructuraId === oItem.mdEstructuraId_mdEstructuraId && item.mdEsEtiquetaId === oItem.mdEsEtiquetaId_mdEsEtiquetaId;
                        });
    
                        let iCantPosicionesPasos = aFilterMdPaso.length;
    
                        oModelEtiquetaPaso.push(
                            {
                                orden: item.orden,
                                descripcion: item.etiquetaId.descripcion,
                                codigo: item.etiquetaId.codigo,
                                cantidad: iCantPosicionesPasos,
                                conforme: item.conforme,
                                procesoMenor: item.procesoMenor,
                                estructuraId_estructuraId: item.estructuraId_estructuraId,
                                etiquetaId_etiquetaId: item.etiquetaId_etiquetaId,
                                mdId_mdId: item.mdId_mdId,
                                mdEsEtiquetaId: item.mdEsEtiquetaId,
                                tipoEstructuraId : item.estructuraId.tipoEstructuraId_iMaestraId,
                                mdEstructuraId_mdEstructuraId: item.mdEstructuraId_mdEstructuraId
                            }
                        );
                    }
    
                    oModelEtiquetaPaso.sort(function (a, b) {
                        return a.orden - b.orden;
                    });
    
                    let oModel = new JSONModel(oModelEtiquetaPaso);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMdEsEtiquetaGeneral");
                }
            },

            // CREAR NUEVA RM
            onConfirmarCrearRM: function () {
                var oThat = this;
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage6"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            oThat.onInsertNewMD().then(function (oDataRegister) {
                                oThat.onGetDataInitial();
                                oThat.onCancelNewRM();
                                oThat.onCleanDataMD();
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrectMD"));
                            }).catch(oError => {
                                sap.ui.core.BusyIndicator.hide();
                                oThat.onErrorMessage(oError, "errorSave");
                            });
                        }
                    },
                });
            },

            // CONFIRMAR ONLINE EDITAR RM
            onConfirmarOnline: function () {
                var that = this;
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage7"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage8"));
                            that.onCancelEditarRM();
                            // MessageToast.show("Action selected: " + sAction);
                        }
                    },
                });
            },

            // EXPORT MESSAGE TOAST
            onExportXLS: function () {
                var sTableName = "RMD_Configuracion";
                var sTableId = "idTblConfigurationRmd";
                var oFunctionColum;
                oFunctionColum = this.createColumnMDExport();
                this.exportExcelConstructor(sTableName, sTableId, oFunctionColum);
                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage9"));
            },

            // ACEPTAR COPIAR A RM
            onAceptarCopiarARM: function () {
                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage10"));
                this.onCancelCopiarARM();
            },

            // ACEPTAR COPIAR DE RM
            onAceptarCopiarDeRM: function () {
                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage11"));
                this.onCancelCopiarDeRM();
            },

            // ABRIR FRAGMENT DE CREAR CONFIGURACIONES
            // Agregar Nueva Estructura
            onAddEstructura: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddEstructura) {
                    this.oAddEstructura = sap.ui.xmlfragment(
                        "frgAddEstructura",
                        sRootPath + ".view.fragment.configuration.new.NewStructure",
                        this
                    );
                    this.getView().addDependent(this.oAddEstructura);
                }

                this.oAddEstructura.open();
            },

            onCancelAddEstructura: function () {
                this.oAddEstructura.close();
            },

            // Agregar Nuevo Equipo
            onAddEquipo: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddEquipo) {
                    this.oAddEquipo = sap.ui.xmlfragment(
                        "frgAddEquipo",
                        sRootPath + ".view.fragment.configuration.new.NewEquipment",
                        this
                    );
                    this.getView().addDependent(this.oAddEquipo);
                }

                this.oAddEquipo.open();
            },

            onCancelAddEquipo: function () {
                this.oAddEquipo.close();
            },

            // Agregar Nuevo Label
            onAddEtiqueta: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddEtiqueta) {
                    this.oAddEtiqueta = sap.ui.xmlfragment(
                        "frgAddEtiqueta",
                        sRootPath + ".view.fragment.configuration.new.NewLabel",
                        this
                    );
                    this.getView().addDependent(this.oAddEtiqueta);
                }

                this.oAddEtiqueta.open();
            },

            onCancelAddEtiqueta: function () {
                this.oAddEtiqueta.close();
            },

            // Agregar Nuevo Motivo
            onAddReason: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddReason) {
                    this.oAddReason = sap.ui.xmlfragment(
                        "frgAddReason",
                        sRootPath + ".view.fragment.configuration.new.NewReason",
                        this
                    );
                    this.getView().addDependent(this.oAddReason);
                }

                this.oAddReason.open();
            },

            onCancelAddReason: function () {
                this.oAddReason.close();
            },

            // Agregar Nueva Step
            onAddPaso: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddPaso) {
                    this.oAddPaso = sap.ui.xmlfragment(
                        "frgAddPaso",
                        sRootPath + ".view.fragment.configuration.new.NewStep",
                        this
                    );
                    this.getView().addDependent(this.oAddPaso);
                }

                this.oAddPaso.open();
            },

            onCancelAddPaso: function () {
                this.oAddPaso.close();
            },

            // Agregar Nueva StepReason
            onAddStepReason: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddStepReason) {
                    this.oAddStepReason = sap.ui.xmlfragment(
                        "frgAddStepReason",
                        sRootPath + ".view.fragment.configuration.new.NewStepReason",
                        this
                    );
                    this.getView().addDependent(this.oAddStepReason);
                }

                this.oAddStepReason.open();
            },

            onCancelAddStepReason: function () {
                this.oAddStepReason.close();
            },

            // Agregar Nueva Utensil
            onAddUtensil: function (editar) {
                if (editar === 1) {
                    this.localModel.setProperty("/editar", 1);
                } else {
                    this.localModel.setProperty("/editar", 0);
                }
                this.localModel.refresh(true);
                if (!this.oAddUtensil) {
                    this.oAddUtensil = sap.ui.xmlfragment(
                        "frgAddUtensil",
                        sRootPath + ".view.fragment.configuration.new.NewUtensil",
                        this
                    );
                    this.getView().addDependent(this.oAddUtensil);
                }

                this.oAddUtensil.open();
            },

            onCancelAddUtensil: function () {
                this.oAddUtensil.close();
            },

            // ACEPTAR AGREGAR PASOS EDITAR RM
            onAgregarPasosEdit: function () {
                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage12"));
                this.onCancelAddEditarRM();
            },

            // ACEPTAR AGREGAR NUEVO Equipo
            onAgregarEquipo: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage13");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Equipo");
            },
            // ACEPTAR AGREGAR NUEVO Etiqueta
            onAgregarEtiqueta: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage14");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Etiqueta");
            },
            // ACEPTAR AGREGAR NUEVO Motivo
            onAgregarMotivo: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage15");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Motivo");
            },
            // ACEPTAR AGREGAR NUEVO Paso
            onAgregarPaso: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage16");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Paso");
            },
            // ACEPTAR AGREGAR NUEVO MotivoLapso
            onAgregarMotivoLapso: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage17");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "MotivoLapso");
            },
            // ACEPTAR AGREGAR NUEVA Estructura
            onAgregarEstructura: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage18");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Estructura");
            },
            // ACEPTAR AGREGAR NUEVO Utensil
            onAgregarUtensil: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage19");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "Utensil");
            },

            // ACEPTAR GUARDAR CAMBIOS DE CONFIGURACIONES
            onGuardarCambios: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage20");
                var result = formatter.onGetI18nText(oThat,"txtMessage8");
                this.onWarningBox(aviso, result, "GuardarConfig");
            },

            // ACEPTAR ELIMINAR CONFIGURACION DE MAESTRA
            onEliminarConfiguracion: function () {
                var aviso = formatter.onGetI18nText(oThat,"txtMessage21");
                var result = formatter.onGetI18nText(oThat,"txtMessage22");
                this.onWarningBox(aviso, result);
            },

            //modelo general para el creado de las configuraciones
            onWarningBox: function (avisoWarning, result, close) {
                var that = this;
                MessageBox.warning(avisoWarning, {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(result);

                            if (close === "Estructura") {
                                that.onCancelAddEstructura();
                            } else if (close === "Utensil") {
                                that.onCancelAddUtensil();
                            } else if (close === "MotivoLapso") {
                                that.onCancelAddStepReason();
                            } else if (close === "Motivo") {
                                that.onCancelAddReason();
                            } else if (close === "Etiqueta") {
                                that.onCancelAddEtiqueta();
                            } else if (close === "Equipo") {
                                that.onCancelAddEquipo();
                            } else if (close === "Paso") {
                                that.onCancelAddPaso();
                            } else if (close === "GuardarConfig") {
                                that.onCloseConfiguration();
                            }
                        }
                    },
                });
            },

            // SECCION EDITAR CONFIGURACIONES
            //editar Estructura
            onEditarEstructura: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddEstructura(editar);
            },

            // editar Equipos
            onEditarEquipos: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddEquipo(editar);
            },

            // editar Etiquetas
            onEditarEtiqueta: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddEtiqueta(editar);
            },

            // editar Motivos
            onEditarMotivo: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddReason(editar);
            },

            // editar Pasos
            onEditarPasos: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddPaso(editar);
            },

            // editar Motivo de Lapsos
            onEditarMotLapso: function (oEvent) {
                var editar = 1;
                var obj = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/obj_editar_config", obj);
                this.onAddStepReason(editar);
            },

            //EDITAR PASO EQUIPO -- editarRM
            onEditEquipo: function (oEvent) {
                var equipo = 1;
                var datos = oEvent
                    .getSource()
                    .getBindingContext("localModel")
                    .getObject();
                this.localModel.setProperty("/editarPaso", datos);
                this.onEditPasoRM(equipo);
            },

            // EDITAR PASO -- editarRM
            onEditPasoRM: function (oEvent) {
                if (oEvent === 1) {
                    this.localModel.setProperty("/editEquipo", oEvent);
                } else {
                    this.localModel.setProperty("/editEquipo", 0);
                    var datos = oEvent
                        .getSource()
                        .getBindingContext("localModel")
                        .getObject();
                    this.localModel.setProperty("/editarPaso", datos);
                }
                if (!this.oEditPasoRM) {
                    this.oEditPasoRM = sap.ui.xmlfragment(
                        "frgEditPasoRM",
                        sRootPath + ".view.fragment.editarRM.editar.EditarPaso",
                        this
                    );
                    this.getView().addDependent(this.oEditPasoRM);
                }

                this.oEditPasoRM.open();
            },
            onCanceloEditPasoRM: function () {
                this.oEditPasoRM.close();
            },

            // ACEPTAR EDITAR PASO -- editarRM
            onEditarPaso: function () {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage23"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage24"));
                            this.onCanceloEditPasoRM();
                        }
                    },
                });
            },

            //Eliminar Estructura
            onDelEstructura: function () {
                MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage25"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage26"));
                        }
                    },
                });
            },

            // eliminar asociar receta
            onDeleteAsocReceta: async function (oEvent) {
                let oDataMdReceta = oEvent.getSource().getBindingContext("listMdReceta").getObject();
                let oMDSeleccionada = oThat.getView().getModel("asociarDatos");
                var sFilter = [];
                sFilter.push(new Filter("mdId_mdId", 'EQ', oDataMdReceta.mdId_mdId));
                sFilter.push(new Filter("productoId", 'EQ', oDataMdReceta.recetaId.Matnr));
                sFilter.push(new Filter("verid", 'EQ', oDataMdReceta.recetaId.Verid));
                // var rmdResponse = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", sFilter);
                var flagExisteOP = false;
                
                // if (rmdResponse.results.length > 0) {
                //     rmdResponse.results.forEach(function(oItem){
                //         if(oItem.ordenSAP !== "" && oItem.ordenSAP !== null){
                //             if (oItem.productoId === oDataMdReceta.recetaId.Matnr){
                //                 flagExisteOP = true;
                //             }
                //         }
                //     });
                // }
                
                if (flagExisteOP) {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage27"));
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage28"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose:async function (sAction) {
                            if (sAction === "OK") {
                                await oThat.onBorrarRecetasAsignada(oDataMdReceta).then(async function (oDataRegister, oError) {
                                        // No desean que se elimine los insumos pasos.
                                        // /** mcode */
                                        // //ELIMINAMOS LOS INSUMOS 
                                        // let dataAsociados = oThat.getView().getModel("asociarDatos").getData();
                                        // //mapeamos las estructuras
                                        // //  dataAsociados.aEstructura.results.map(items=>{
                                        // for await (const items of dataAsociados.aEstructura.results){
                                        //     let obj = {
                                        //         fechaActualiza: new Date(),
                                        //         activo: false
                                        //     }
                                        //     // items.aPasoInsumoPaso.results.map(pasoInsumo=>{
                                        //     for (let pasoInsumo of items.aPasoInsumoPaso.results) {
                                        //         // se envia el odataContext 
                                        //         if(pasoInsumo.mdId_mdId==oDataMdReceta.mdId_mdId){
                                        //             await  Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_PASO_INSUMO_PASO", obj, pasoInsumo.mdEstructuraPasoInsumoPasoId)
                                        //         }
                                        //     }
                                        //     // })
                                        // }
                                        // })
                                    // await oThat.onGetDataEstructuraMD();
                                    if (Number(oMDSeleccionada.getData().estadoIdRmd_iMaestraId) === estadoAutorizado) {
                                        let pdfName = await oThat.generarNombre(oDataMdReceta);
                                        await oThat.sendDMS(pdfName, "", "ANULAR");
                                    }
                                    await oThat._updateModelRest();
                                    await oThat.onGetMdRecetaGeneral();
                                    await oThat.onGetDataInitial();
                                    oThat.getView().getModel("listMdReceta").refresh(true);
                                    await oThat.actualizarCabeceraAsociarDatos();
                                    MessageBox.success(formatter.onGetI18nText(oThat, "sDeleteCorrectMDReceta"));
                                    sap.ui.core.BusyIndicator.hide();
                                }).catch(oError => {
                                    sap.ui.core.BusyIndicator.hide();
                                    oThat.onErrorMessage(oError, "errorSave");
                                });
                            }
                        },
                    });
                }
            },

            onSearch: async function () {
                try {
                    var sTable = this.getView().byId("idTblConfigurationRmd");
                    var oDataFilter = this.getView().getModel("oDataFilter");
                    //actualizamos el modelo
                    let arrList = oThat.localModel.getProperty("/listMDTemp");
                    this.getView().getModel("listMD").setData(arrList);
                    var aFilter = [];

                    // let objFilter = {};
                    if (oDataFilter.getData().code)
                        aFilter.push(
                            new Filter(
                                "codigo",
                                FilterOperator.Contains,
                                oDataFilter.getData().code
                            )
                        );
                    if (oDataFilter.getData().description)
                        aFilter.push(new Filter("tolower(descripcion)", FilterOperator.Contains, "'" + oDataFilter.getData().description.toLowerCase().replace("'","''") + "'"));
                    if (oDataFilter.getData().stageProcess)
                        aFilter.push(
                            new Filter(
                                "estadoIdProceso_iMaestraId",
                                FilterOperator.EQ,
                                oDataFilter.getData().stageProcess
                            )
                        );
                    if (oDataFilter.getData().productid)
                        aFilter.push(
                            new Filter(
                                "codAgrupadorReceta",
                                FilterOperator.Contains,
                                oDataFilter.getData().productid
                            )
                        );
                    //if (oDataFilter.getData().formula)
                        // aFilter.push(new Filter("aReceta/results/recetaId", FilterOperator.Contains, oDataFilter.getData().formula));
                        // aFilter.push(new Filter("aReceta/results/0/recetaId/Matnr", FilterOperator.Contains, "5000010026"));
                    // if (oDataFilter.getData().area)
                    //     aFilter.push(
                    //         new Filter(
                    //             "sucursalId_iMaestraId",
                    //             FilterOperator.EQ,
                    //             oDataFilter.getData().area
                    //         )
                    //     );
                    if (oDataFilter.getData().level)
                        aFilter.push(
                            new Filter(
                                "nivelTxt",
                                FilterOperator.EQ,
                                oDataFilter.getData().level
                            )
                        );

                    if (!oDataFilter.getData().statusRMD || oDataFilter.getData().statusRMD === '') {
                        aFilter.push(
                            new Filter(
                                "estadoIdRmd_iMaestraId",
                                FilterOperator.NE,
                                estadoCancelado
                            )
                        );
                    } else {
                        aFilter.push(
                            new Filter(
                                "estadoIdRmd_iMaestraId",
                                FilterOperator.EQ,
                                oDataFilter.getData().statusRMD
                            )
                        );
                    }
                    if (oDataFilter.getData().area)
                        aFilter.push(
                            new Filter(
                                "areaRmdTxt",
                                FilterOperator.EQ,
                                oDataFilter.getData().area
                            )
                        );
                    if (oDataFilter.getData().planta)
                        aFilter.push(
                            new Filter(
                                "sucursalId_iMaestraId",
                                FilterOperator.EQ,
                                oDataFilter.getData().planta
                            )
                        );
                    let bFilterMaterial = false;
                    if (oDataFilter.getData().formula) {
                        bFilterMaterial = true
                    }

                    aFilter.push(new Filter("activo", FilterOperator.EQ, true));
                    indexConfiguracion = 0;
                    await oThat.onGetDataInitial(false, aFilter, bFilterMaterial);

                    let info = sTable.getBinding("items");
                    
                    await oThat.getItemsbyFilter(info,oDataFilter.getData());
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            getItemsbyFilter:async function(info,filters){
                let indicesSelected = info.aIndices;
                let arrListMDTemp = oThat.localModel.getProperty("/listMDTemp");
                let arrFilter = [];
                let newFilter = [];
                indicesSelected.reduce((k,i) => arrFilter.push(arrListMDTemp[i]) ,arrFilter);
                if(filters.formula.length>0){
                    //mapeamos los datos que tenemos 
                    await arrFilter.map((item)=>{
                        item.aReceta.results.map(({recetaId})=>{
                            if(recetaId.Matnr.includes(filters.formula)){
                                newFilter.push(item);
                            }
                        })
                    })
                    
                    arrFilter = newFilter;
                }

                // Eliminacion de duplicados.
                const sColumnRolesProfile = "current['codigo']";
                arrFilter = await this.onDeleteDuplicatesAllFields(arrFilter, sColumnRolesProfile);

                this.getView().getModel("listMD").setData(arrFilter);
                this.getView().getModel("listMD").refresh();
                console.log("----")
                console.log(arrFilter);
            },
            onInsertNewMD: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oMdModel = oThat.getView().getModel("oDataNewMD");
                    let oMdData = oMdModel.getData();

                    if (oMdData.descripcion === '' || !oMdData.descripcion) {
                        MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeDescripcionBlank"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    if (oMdData.nivelTxt === '' || !oMdData.nivelTxt) {
                        MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeNivelBlank"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    if (oMdData.sucursalId_iMaestraId === '' || !oMdData.sucursalId_iMaestraId) {
                        MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeSucursalBlank"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    // if (oMdData.fechaSolicitud === '' || !oMdData.fechaSolicitud) {
                    //     MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeFechaSolicitudBlank"));
                    //     sap.ui.core.BusyIndicator.hide();
                    //     return false;
                    // }
                    if (oMdData.motivoId_motivoId === '' || !oMdData.motivoId_motivoId) {
                        MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeMotivoBlank"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }
                    if(oMdData.areaRmdTxt === '' || !oMdData.areaRmdTxt){
                        MessageBox.error(formatter.onGetI18nText(oThat, "sMesaggeAreaBlank"));
                        sap.ui.core.BusyIndicator.hide();
                        return false;
                    }

                    var tipo = "2";
                    var newCorrelativo;
                    var anho = (new Date().getFullYear()).toString();
                    Service.onGetDataGeneral(oThat.mainModelv2, "MD").then(async function (res) {
                        if (res.results.length === 0) {
                            newCorrelativo = "00001"
                        } else {
                            res.results.sort(function (a, b) {
                                return b.codigo - a.codigo;
                            });
                            var lastCode = res.results[0].codigo;
                            if (lastCode === "" || lastCode === null){
                                lastCode = "00000"
                            }
                            let validateAnio = lastCode.substring(lastCode.length - 9, lastCode.length - 5);
                            if (anho === validateAnio) {
                                lastCode = res.results[0].codigo;
                            } else {
                                lastCode = "00000";
                            }
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
                        var Newcodigo = tipo + anho + newCorrelativo;
                        if (oMdData.codigoSolicitud) {
                            var updTraz = {
                                activo                  : true,
                                usuarioRegistro         : oInfoUsuario.data.usuario,
                                fechaRegistro           : new Date(),
                                idTrazabilidad          : util.onGetUUIDV4(),
                                mdId_mdId               : oMdData.mdId,
                                estadoTrazab_iMaestraId : sIdEstadoRMIniciado
                            }
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);
                            var oParam = {
                                fechaActualiza              : new Date(),
                                usuarioActualiza            : oInfoUsuario.data.usuario,
                                estadoIdRmd_iMaestraId      : sIdEstadoRMIniciado,
                                estadoIdProceso_iMaestraId  : sIdEstadoProcesoPendiente,
                                codigo                      : Newcodigo,
                                masRecetas                  : oMdData.nivelTxt === iNivelRecubrimiento || oMdData.nivelTxt === iNivelFabricacion ? false : true,
                                fechaSolicitud              : oMdData.fechaRegistro
                            }
                            Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, oMdData.mdId).then(function (oDataSaved) {
                                resolve(oDataSaved);
                            }).catch(function (oError) {
                                reject(oError);
                            });
                        } else {
                            var oParam = {
                                fechaRegistro               : new Date(),
                                usuarioRegistro             : oInfoUsuario.data.usuario,
                                activo                      : true,
                                mdId                        : util.onGetUUIDV4(),
                                estadoIdRmd_iMaestraId      : sIdEstadoRMIniciado,
                                estadoIdProceso_iMaestraId  : sIdEstadoProcesoPendiente,
                                codigo                      : Newcodigo,
                                version                     : 1,
                                descripcion                 : oMdData.descripcion,
                                nivelTxt                    : oMdData.nivelTxt,
                                sucursalId_iMaestraId       : oMdData.sucursalId_iMaestraId,
                                fechaSolicitud              : new Date(),
                                motivoId_motivoId           : oMdData.motivoId_motivoId,
                                areaRmdTxt                  : oMdData.areaRmdTxt,
                                masRecetas                  : oMdData.nivelTxt === iNivelRecubrimiento || oMdData.nivelTxt === iNivelFabricacion ? false : true,
                                codigoversionprincipal      : Newcodigo
                            }
                            var updTraz = {
                                activo                  : true,
                                usuarioRegistro         : oInfoUsuario.data.usuario,
                                fechaRegistro           : new Date(),
                                idTrazabilidad          : util.onGetUUIDV4(),
                                mdId_mdId               : oParam.mdId,
                                estadoTrazab_iMaestraId : sIdEstadoRMIniciado
                            }
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);
                            Service.onSaveDataGeneral(oThat.mainModelv2, "MD", oParam).then(function (oDataSaved) {
                                resolve(oDataSaved);
                            }).catch(function (oError) {
                                reject(oError);
                            });
                        }
                    });
                });
            },

            suggestionRowValidator: function (oColumnListItem) {
                var aCells = oColumnListItem.getCells();

                return new Item({
                    key: aCells[0].getText(),
                    text: aCells[1].getText()
                });
            },

            onSuggestionItemSelected: function () {
                var sKey = this.getView().byId("ipProduct").getSelectedKey();
                // this.getView().byId('ipProduct').setText(sKey);
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

            // Obtener la informacion de los MD.
            onGetMd: function (afilters, bFlagFilterMaterial) {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    afilters ? afilters : afilters = [];
                    if (afilters.length === 0) {
                        afilters.push(new Filter("estadoIdRmd_iMaestraId", "EQ", estadoAutorizado));
                        afilters.push(new Filter("estadoIdRmd_iMaestraId", "EQ", sIdEstadoRMIniciado));
                        // afilters.push(new Filter("estadoIdRmd_iMaestraId", "EQ", estadoCancelado));
                        afilters.push(new Filter("estadoIdRmd_iMaestraId", "EQ", sIdEstadoRMSuspendido));
                    }
                    let iSkip = indexConfiguracion;
                    let filtrosEstado = afilters.filter(itm=>itm.sPath === 'estadoIdRmd_iMaestraId');
                    let iTop = filtrosEstado.length !== 3 || bFlagFilterMaterial ? null : 100;
                    indexConfiguracion = indexConfiguracion + 100;
                    // let sExpand = "estadoIdRmd,estadoIdProceso,nivelId,sucursalId,motivoId,destinatariosMD/usuarioId,aStatusProceso/estadoIdProceso,aStatusProceso/mdId,aEstructura/estructuraId,aEstructura/aEquipo/equipoId,aEstructura/aPaso/pasoId,aEstructura/aEtiqueta/etiquetaId,aEstructura/aUtensilio/utensilioId,aEstructura/aPasoInsumoPaso/pasoId,aEstructura/aInsumo,aEstructura/aEspecificacion,aTrazabilidad/estadoTrazab,aTrazabilidad/mdId,aReceta/recetaId,aEstructura/aPasoInsumoPaso/pasoHijoId,aEstructura/aPasoInsumoPaso/estructuraRecetaInsumoId";
                    let sExpand = "estadoIdRmd,estadoIdProceso,sucursalId,motivoId,destinatariosMD/usuarioId,aStatusProceso/estadoIdProceso,aStatusProceso/mdId,aReceta/recetaId,aTrazabilidad/estadoTrazab";
                    await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD", afilters, sExpand, iTop, iSkip, 'fechaRegistro').then(async function (oListMD) {
                        await oListMD.results.sort((aPos, bPos) => {
                            return (
                                bPos.codigo - aPos.codigo ||
                                bPos.version - aPos.version
                            );
                        });
                        resolve(oListMD);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Obtener la lista de la tabla de la estructura del MD.
            onGetMdReceta: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var afilters = [];
                    afilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "mdId($expand=estadoIdRmd,sucursalId,nivelId),recetaId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_RECETA", afilters, sExpand).then(function (oListMdReceta) {
                        resolve(oListMdReceta);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Obtener la lista de la tabla de la estructura del MD.
            onGetReceta: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var afilters = [];
                    afilters.push(new Filter("Matnr", "EQ", ""));
                    afilters.push(new Filter("Werks", "EQ", oDataSeleccionada.getData().sucursalId.codigo));
                    afilters.push(new Filter("PrfgF", "EQ", sEstadoPermitidoProducto));
                    // afilters.push(new Filter("Mksp", "EQ", sSinBloqueoProducto));
                    afilters.push(new Filter("Atwrt", "EQ", oDataSeleccionada.getData().nivelTxt));
                    Service.onGetDataGeneralFilters(oThat.oModelErpNec, "ProduccionVSet", afilters).then(function (oListMdReceta) {
                        resolve(oListMdReceta);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Obtener la informacion de las estructuras asignadas a un MD.
            onGetMdEstructuraByMd: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                    var afilters = [];
                    afilters.push(new Filter("mdId_mdId", "EQ", oDataSeleccionada.getData().mdId));
                    let sExpand = "estructuraId";
                    Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", afilters, sExpand).then(function (aListMdEstructura) {
                        resolve(aListMdEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Obtener la estructura por tipo estructura de insumo.
            onGetEstructura: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var afilters = [];
                    afilters.push(new Filter("tipoEstructuraId_iMaestraId", "EQ", sIdTipoEstructuraFormula));
                    Service.onGetDataGeneralFilters(oThat.mainModelv2, "ESTRUCTURA", afilters).then(function (oListEstructura) {
                        resolve(oListEstructura);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            // Asignar la receta al MD.
            /**
             * @param {*} oTablaArrayInsert Objeto con  el array de las recetas e insumos que se van asignar.
             */
            onAsignRecetaToMd: function (oTablaArrayInsert) {
                return new Promise(async function (resolve, reject) {
                    await Service.onSaveDataGeneral(oThat.mainModelv2, "TABLAS_ARRAY_MD_SKIP", oTablaArrayInsert).then(async function (oDataSaved, oError) {
                        resolve(oDataSaved);
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            // Buscar las recetas por los filtros ingresados.
            onSearchReceta: function () {
                try {
                    var sTable = sap.ui.getCore().byId("frgAsocRecetas--idTblRecetas");
                    var oDataFilterReceta = this.getView().getModel("oDataFilterReceta");
                    var aFilter = [];
                    if (oDataFilterReceta.getData().code)
                        aFilter.push(
                            new Filter(
                                "Matnr",
                                FilterOperator.Contains,
                                oDataFilterReceta.getData().code
                            )
                        );
                    if (oDataFilterReceta.getData().description)
                        aFilter.push(
                            new Filter(
                                "Text1",
                                FilterOperator.Contains,
                                oDataFilterReceta.getData().description
                            )
                        );
                    if (oDataFilterReceta.getData().variante)
                        aFilter.push(
                            new Filter(
                                "Verid",
                                FilterOperator.Contains,
                                oDataFilterReceta.getData().variante
                            )
                        );

                    sTable.getBinding("items").filter(aFilter, FilterType.Application);
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            //eliminacion de etiqueta
            onBorrarRecetasAsignada: function (oDataMdReceta) {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    const oMdReceta = {
                        fechaActualiza: new Date(),
                        usuarioActualiza: oInfoUsuario.data.usuario,
                        mdRecetaId: oDataMdReceta.mdRecetaId,
                        activo: false
                    };
                    const sId = oDataMdReceta.mdRecetaId;
                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_RECETA", oMdReceta, sId).then( async function (oDataSaved) {
                        const oEstReInsumo = {
                            mdRecetaId_mdRecetaId: oDataMdReceta.mdRecetaId,
                            fechaActualiza: new Date(),
                            usuarioActualiza: oInfoUsuario.data.usuario,
                            activo: false
                        };
                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_ES_RE_INSUMO", oEstReInsumo).then(function (oDataSaved) {
                            resolve(oDataSaved);
                        }).catch(function (oError) {
                            reject(oError);
                        });
                    }).catch(function (oError) {
                        reject(oError);
                    });
                });
            },

            onGetMdRecetaGeneral:async function () {
                await this.onGetMdReceta().then(function (oListMdReceta, oError) {
                    let oModelMdReceta = new JSONModel(oListMdReceta.results);
                    oModelMdReceta.setSizeLimit(999999999);
                    oThat.getView().setModel(oModelMdReceta, "listMdReceta");
                    sap.ui.core.BusyIndicator.hide();
                }).catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                });
            },

            onEnviarRMD: async function (oEvent) {
                this.openFrgEnvio();
                var lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("listMD").getObject();
                var oData = {
                    url : lineaSeleccionada.mdId,
                    origen : "Solicitud"
                }
                var oAdjuntoSPSolic = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                oAdjuntoSPSolic.forEach(function (e){
                    e.codigoRM = lineaSeleccionada.mdId;
                    e.solicitud = true;
                });
                lineaSeleccionada.adjuntos = oAdjuntoSPSolic;
                this.localModel.setProperty("/lineaSeleccionadaWF", lineaSeleccionada);
                this.findDestinatariosWF();
                this.openEnvio.open();
            },

            findDestinatariosWF: async function () {
                let sExpand = "oRolWorkflow/aRolUsuarios/oUsuario,oRolWorkflow/aRolUsuarios/oRol";
                var oFilter = [];
                oFilter.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacionConfiguracion));
                oFilter.push(new Filter("oRol_rolId", 'EQ', oRolRegistrador));
                var oDestinatarios = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "ROLAPPWF", oFilter, sExpand);
                var aListDestinatarios = [];
                if (oDestinatarios.results.length > 0) {
                    oDestinatarios.results[0].oRolWorkflow.aRolUsuarios.results.forEach(function (e) {
                        if (e.oUsuario) {
                            e.oUsuario.rol = e.oRol.nombre;
                            aListDestinatarios.push(e.oUsuario);
                        }
                    });
                }
                this.localModel.setProperty("/destinations", aListDestinatarios);

                //OBTENEMOS LOS USUARIOS ADICIONALES
                let sExpandAd = "oUsuario,oRol";
                var oFilter = [];
                //ADICIONAR FILTRO POR AREA O SECCION
                oFilter.push(new Filter({
                    filters: [
                        (new Filter("oRol_rolId", 'EQ', oRolIDE))
                        // (new Filter("oRol_rolId", 'EQ', '1a18f941-9e62-48dc-84e8-54245db3f60a'))
                    ]
                }));
                var oDestinatariosAdicionales = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "UsuarioRol", oFilter, sExpandAd);
                let oUserFilterSystem = oDestinatariosAdicionales.results.filter(item=>item.oRol.oSistema_sistemaId === sSistemaRMD);
                var aListDestinatariosAdicional = [];
                oUserFilterSystem.forEach(function (e) {
                    e.oUsuario.rol = e.oRol.nombre;
                    aListDestinatariosAdicional.push(e.oUsuario);
                });
                this.localModel.setProperty("/destinationsAditional", aListDestinatariosAdicional);
            },

            openFrgEnvio: function () {
                if (!this.openEnvio) {
                    this.openEnvio = sap.ui.xmlfragment(
                        "frgOpenEnvio",
                        sRootPath + ".view.fragment.EnvioRMD",
                        this
                    );
                    this.getView().addDependent(this.openEnvio);
                }
            },

            onCancelEnviarRMD: function () {
                oThat.localModel.setProperty("/lineaSeleccionadaWF/adjuntos", null);
                oThat.localModel.setProperty("/lineaSeleccionadaWF/destinatarios", []);
                oThat.localModel.setProperty("/lineaSeleccionadaWF/destinatariosAdicionales", []);
                oThat.localModel.setProperty("/lineaSeleccionadaWF/mensajeDT", "");
                oThat.localModel.setProperty("/destinations", []);
                oThat.localModel.setProperty("/destinationsAditional", []);
                oThat.openEnvio.close();
            },

            onConfirmEnviarRMD: function () {
                var oContext = this.localModel.getProperty("/lineaSeleccionadaWF");
                var flagEnvio = true;
                if (!oContext.destinatarios || oContext.destinatarios.length === 0) {
                    flagEnvio = false;
                }
                if (!oContext.mensajeDT || oContext.mensajeDT === "") {
                    flagEnvio = false;
                }
                if (flagEnvio) {
                    MessageBox.confirm(formatter.onGetI18nText(oThat,"txtMessage29"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show();
                                // oContext.adjuntos.map(doc=>{
                                //     doc.mdId = oContext.mdId;
                                //     doc.origen = "Configuracion";
                                // });
                                // oContext.adjuntos.origen = "Configuracion";
                                // oContext.adjuntos.mdId = oContext.mdId;
                                var oObj = {
                                    fechaActualiza: new Date(),
                                    usuarioActualiza: oInfoUsuario.data.usuario,
                                    codigo : oContext.codigo,
                                    descripcion : oContext.descripcion,
                                    estadoIdProceso_iMaestraId: sIdEstadoProcesoEnProduccion,
                                    destinatariosMD: [],
                                    destinatariosMDAdic: []
                                };
                                oContext.destinatarios.forEach(function (e) {
                                    oObj.destinatariosMD.push({
                                        fechaRegistro: new Date(),
                                        usuarioRegistro: oInfoUsuario.data.usuario,
                                        activo: true,
                                        idMdDestinatarios: util.onGetUUIDV4(),
                                        mdId_mdId: oContext.mdId,
                                        usuarioId_usuarioId: e,
                                        tipo : tipoJefeProd
                                    });
                                });
                                if(oContext.destinatariosAdicionales) {
                                    oContext.destinatariosAdicionales.forEach(function (e) {
                                        oObj.destinatariosMDAdic.push({
                                            fechaRegistro: new Date(),
                                            usuarioRegistro: oInfoUsuario.data.usuario,
                                            activo: true,
                                            idMdDestinatarios: util.onGetUUIDV4(),
                                            mdId_mdId: oContext.mdId,
                                            usuarioId_usuarioId: e,
                                            tipo : tipoAdicional
                                        });
                                    });
                                }
                                var oParam = {
                                    fechaRegistro: new Date(),
                                    usuarioRegistro: oInfoUsuario.data.usuario,
                                    activo: true,
                                    idProceso: util.onGetUUIDV4(),
                                    mdId_mdId: oContext.mdId,
                                    mensajeDT: oContext.mensajeDT,
                                    observacion: null,
                                    tipo: "CONFIGURACION",
                                    estadoIdProceso_iMaestraId: sIdEstadoProcesoEnProduccion
                                }
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTATUSPROCESO", oParam);
                                oThat.startInstance(oObj, oThat.fetchToken(), async function (result) {
                                    oObj.wfInstanceId = result.id;
                                    for (var i = 0; i < oContext.destinatariosMD.results.length; i++) {
                                        var dest = oContext.destinatariosMD.results[i];
                                        var obj = {
                                            usuarioActualiza: oInfoUsuario.data.usuario,
                                            fechaActualiza: new Date(),
                                            activo: false
                                        }
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj, dest.idMdDestinatarios);
                                    }
    
                                    for (var j = 0; j < oObj.destinatariosMD.length; j++) {
                                        var obj = oObj.destinatariosMD[j];
                                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj);
                                    }
                                    for (var j = 0; j < oObj.destinatariosMDAdic.length; j++) {
                                        var objAdic = oObj.destinatariosMDAdic[j];
                                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", objAdic);
                                    }
                                    delete oObj.destinatariosMD;
                                    delete oObj.destinatariosMDAdic;
                                    //mapeamos el arreglo del 
                                    // oContext.adjuntos.map((ele,i)=>{
                                    if (oContext.adjuntos.length > 0) {
                                        for await(const ele of oContext.adjuntos){
                                            if (!ele.solicitud) {
                                                ele.origen = "Configuracion";
                                                ele.mdId = oContext.mdId;
                                                oObj.archivoMD = JSON.stringify(ele);
                                                
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oObj, oContext.mdId);
                                            } else{
                                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oObj, oContext.mdId);
                                            }
                                        }
                                    } else {
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oObj, oContext.mdId); 
                                    }
                                    // })
                                    oThat.openEnvio.close();
                                    BusyIndicator.hide();
                                    sap.ui.core.Fragment.byId("frgOpenEnvio", "fuEnvioRMD").setValue(null);
                                    oThat.onCancelEnviarRMD();
                                    oThat.onGetDataInitial();
                                    MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage30")); 
                                });
                            }
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage31"));
                }
            },
            startInstance:async function (oData, token, callback) {
                var sFilter = [];

                oData.destinatariosMD.forEach(function (e) {
                    sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId))
                });
                if (oData.destinatariosMDAdic) {
                    oData.destinatariosMDAdic.forEach(function (e) {
                        sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId))
                    });
                }
                var array = [];
                await Service.onGetDataGeneralFilters(this.mainModelv2, "USUARIO", sFilter).then(async function (res) {
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

                    var userData = {
                        'DISPLAYNAME': oInfoUsuario.data.nombre,
                        'DISPLAYLASTNAME': oInfoUsuario.data.apellidoPaterno,
                        'EMAIL': oInfoUsuario.data.correo
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
                            definitionId: "mif.rmd.AprobacionMd",
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

            onGetEditarInfoRM: function (oEvent) {
                if (!this.oEditarInfoRM) {
                    this.oEditarInfoRM = sap.ui.xmlfragment(
                        "frgEditInfoRM",
                        sRootPath + ".view.fragment.EditInfoRM",
                        this
                    );
                    this.getView().addDependent(this.oEditarInfoRM);
                }
                var lineaSeleccionada = oEvent.getSource().getBindingContext("listMD").getObject();
                var lineaSeleccionadaModif = Object.assign({}, lineaSeleccionada);
                this.localModel.setProperty("/editLineaRM", lineaSeleccionadaModif);
                this.localModel.setProperty("/editLineaRMBackUp", lineaSeleccionada);
                this.oEditarInfoRM.open();
            },

            onConfirmarEditInfoRM: function () {
                var ItemEditado = this.localModel.getProperty("/editLineaRM");
                var ItemBackUp = this.localModel.getProperty("/editLineaRMBackUp");
                var CompararObjetos = JSON.stringify(ItemEditado) === JSON.stringify(ItemBackUp);
                if (CompararObjetos) {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage32"));
                    return;
                }
                MessageBox.confirm(formatter.onGetI18nText(oThat,"txtMessage33"), {
                    styleClass: "sapUiSizeCompact",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: async function (oAction) {
                        if (oAction === "YES") {
                            BusyIndicator.show();
                            if (ItemEditado.fechaSolicitud) {
                                // var fechaSolicitud = ItemEditado.fechaSolicitud.split("/");
                            }
                            var oObj = {
                                usuarioActualiza: oInfoUsuario.data.usuario,
                                fechaActualiza: new Date(),
                                codigo: ItemEditado.codigo,
                                descripcion: ItemEditado.descripcion,
                                nivelTxt: ItemEditado.nivelTxt,
                                sucursalId_iMaestraId: ItemEditado.sucursalId_iMaestraId,
                                // fechaSolicitud          : new Date(fechaSolicitud[2], fechaSolicitud[1]-1, fechaSolicitud[0]),
                                motivoId_motivoId: ItemEditado.motivoId_motivoId,
                                areaRmdTxt: ItemEditado.areaRmdTxt
                            }
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oObj, ItemEditado.mdId);
                            BusyIndicator.hide();
                            oThat.oEditarInfoRM.close();
                            oThat.onGetDataInitial();
                            MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage34"));
                        }
                    }
                });
            },

            onCancelEditInfoRM: function () {
                this.localModel.setProperty("/editLineaRM", {});
                this.localModel.setProperty("/editLineaRMBackUp", {});
                this.localModel.setProperty("/asociarDatos", {});
                this.oEditarInfoRM.close();
            },

            onPressReenvio: async function (oEvent) {
                let lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("listMD").getObject();
                let aListDestinatarios = [],
                aListDestinatariosAdicionales = [];
                this.localModel.setProperty("/lineaReenvio", lineaSeleccionada);
                if (!this.openReEnvio) {
                    this.openReEnvio = sap.ui.xmlfragment(
                        "frgOpenReEnvio",
                        sRootPath + ".view.fragment.ReEnvioRMD",
                        this
                    );
                    this.getView().addDependent(this.openReEnvio);
                }
                await this.findDestinatariosWF();
                aListDestinatarios = lineaSeleccionada.destinatariosMD.results.filter(itm=>itm.tipo === tipoJefeProd);
                let aListKeys = [];
                aListDestinatarios.forEach(function(oUsuario){
                    aListKeys.push(oUsuario.usuarioId_usuarioId);
                });
                this.localModel.setProperty("/lineaReenvio/destinatarios", aListKeys);
                aListDestinatariosAdicionales = lineaSeleccionada.destinatariosMD.results.filter(itm=>itm.tipo === tipoAdicional);
                let aListKeyAdic = [];
                aListDestinatariosAdicionales.forEach(function(oUsuarioAdic){
                    aListKeyAdic.push(oUsuarioAdic.usuarioId_usuarioId);
                });
                this.localModel.setProperty("/lineaReenvio/destinatariosAdicionales", aListKeyAdic);
                this.localModel.setProperty("/lineaReenvio/mensajeDT", lineaSeleccionada.aStatusProceso.results[0].mensajeDT);
                let oData = {
                    url : lineaSeleccionada.mdId,
                    origen : 'Configuracion'
                }
                let aAdjuntos = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                this.localModel.setProperty("/lineaReenvio/adjuntos", aAdjuntos);
                this.openReEnvio.open();
            },

            onReEnviarRMD: function () {
                let lineaSeleccionada = this.localModel.getProperty("/lineaReenvio");
                let adjuntosEliminados = this.localModel.getProperty("/adjuntoEliminado");
                var adjuntosAgregados = lineaSeleccionada.adjuntos.filter(item=>item.nuevo === true);
                MessageBox.confirm(formatter.onGetI18nText(oThat,"txtMessage35"), {
                    styleClass: "sapUiSizeCompact",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: async function (oAction) {
                        if (oAction === "YES") {
                            BusyIndicator.show();
                            var oParam = {
                                usuarioActualiza            : oInfoUsuario.data.usuario,
                                fechaActualiza              : new Date(),
                                estadoIdProceso_iMaestraId  : sIdEstadoProcesoEnProduccion                                
                            }
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, lineaSeleccionada.mdId);

                            var updDestinatarios = {
                                destinatariosMD             : [],
                                destinatariosMDAdic         : []
                            }

                            lineaSeleccionada.destinatarios.forEach(function (e) {
                                updDestinatarios.destinatariosMD.push({
                                    fechaRegistro           : new Date(),
                                    usuarioRegistro         : oInfoUsuario.data.usuario,
                                    activo                  : true,
                                    idMdDestinatarios       : util.onGetUUIDV4(),
                                    mdId_mdId               : lineaSeleccionada.mdId,
                                    usuarioId_usuarioId     : e,
                                    tipo                    : 'DJEFPROD'
                                });
                            });
                            if (lineaSeleccionada.destinatariosAdicionales) {
                                lineaSeleccionada.destinatariosAdicionales.forEach(function (e) {
                                    updDestinatarios.destinatariosMDAdic.push({
                                        fechaRegistro           : new Date(),
                                        usuarioRegistro         : oInfoUsuario.data.usuario,
                                        activo                  : true,
                                        idMdDestinatarios       : util.onGetUUIDV4(),
                                        mdId_mdId               : lineaSeleccionada.mdId,
                                        usuarioId_usuarioId     : e,
                                        tipo                    : 'DADICION'
                                    });
                                });
                            }
                            for (var i = 0; i < lineaSeleccionada.destinatariosMD.results.length; i++) {
                                var dest = lineaSeleccionada.destinatariosMD.results[i];
                                var obj = {
                                    usuarioActualiza        : oInfoUsuario.data.usuario,
                                    fechaActualiza          : new Date(),
                                    activo                  : false
                                }
                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj, dest.idMdDestinatarios);
                            }

                            for (var j = 0; j < updDestinatarios.destinatariosMD.length; j++) {
                                var obj = updDestinatarios.destinatariosMD[j];
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj);
                            }

                            for (var j = 0; j < updDestinatarios.destinatariosMDAdic.length; j++) {
                                var objAdic = updDestinatarios.destinatariosMDAdic[j];
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", objAdic);
                            }

                            var oParamEstatus = {
                                fechaRegistro               : new Date(),
                                usuarioRegistro             : oInfoUsuario.data.usuario,
                                activo                      : true,
                                idProceso                   : util.onGetUUIDV4(),
                                mdId_mdId                   : lineaSeleccionada.mdId,
                                mensajeDT                   : lineaSeleccionada.mensajeDT,
                                observacion                 : null,
                                tipo                        : "CONFIGURACION",
                                estadoIdProceso_iMaestraId  : sIdEstadoProcesoEnProduccion
                            }
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_ESTATUSPROCESO", oParamEstatus);
                            var sFilter = [];
                            updDestinatarios.destinatariosMD.forEach(function (e) {
                                sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId))
                            });
                            updDestinatarios.destinatariosMDAdic.forEach(function (e) {
                                sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId))
                            });
                            var array = [];
                            await Service.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", sFilter).then(async function (res) {
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
                                var task = await workflowService.getTaskContextByActivityId(lineaSeleccionada.wfInstanceId, "usertask5");
                                var cContext = Object.assign({}, task.context);
                                cContext.approverUserData.EMAIL = array.join(",");
                                cContext.bpRequestData = task.context.bpRequestData;
                                cContext.action = "R";
                                await workflowService.completeTask(task.id, cContext);
                                if(adjuntosEliminados.length > 0){
                                    adjuntosEliminados.forEach(async function (e){
                                        await sharepointService.sharepointDelete(oThat.mainModelv2, e);
                                    })   
                                }
                                if(adjuntosAgregados.length > 0){
                                    for await (const e of adjuntosAgregados) {
                                        e.origen = 'Configuracion';
                                        e.mdId = lineaSeleccionada.mdId;
                                        var oParam = {
                                            usuarioActualiza    : oInfoUsuario.data.usuario,
                                            fechaActualiza      : new Date(),
                                            archivoMD           : JSON.stringify(e)
                                        }
                                        await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, lineaSeleccionada.mdId);
                                    }
                                }
                                sap.ui.core.Fragment.byId("frgOpenReEnvio", "fuReEnvioRMD").setValue(null);
                                oThat.onCancelReenvioRMD();
                                oThat.onGetDataInitial();
                                BusyIndicator.hide();
                                MessageBox.success("Se reenvió correctamente el RMD.");
                            });                            
                        }
                    }
                });
            },

            onCancelReenvioRMD: function () {
                this.localModel.setProperty("/lineaReenvio", {});
                this.openReEnvio.close();
            },

            // Resetear Model Filter Recetas.
            onCleanDataRecetas: function () {
                var oDataFilterReceta = oThat.getView().getModel("oDataFilterReceta");
                oDataFilterReceta.getData().code = "";
                oDataFilterReceta.getData().description = "";
                oDataFilterReceta.getData().variante = "";
                oDataFilterReceta.getData().etapaBase = "";
                oDataFilterReceta.refresh(true);
            },

            // Resetear Model Data MD.
            onCleanDataMD: function () {
                var oDataNewMD = oThat.getView().getModel("oDataNewMD");
                oDataNewMD.getData().fechaRegistro = null;
                oDataNewMD.getData().usuarioRegistro = "";
                oDataNewMD.getData().fechaActualiza = null;
                oDataNewMD.getData().usuarioActualiza = "";
                oDataNewMD.getData().activo = true;
                oDataNewMD.getData().mdId = "";
                oDataNewMD.getData().id = "";
                oDataNewMD.getData().codigo = "";
                oDataNewMD.getData().version = 1;
                oDataNewMD.getData().estadoIdRmd_iMaestraId = sIdEstadoRMIniciado;
                oDataNewMD.getData().productoId = "";
                oDataNewMD.getData().descripcion = "";
                oDataNewMD.getData().nivelTxt = "";
                oDataNewMD.getData().sucursalId_iMaestraId = "";
                oDataNewMD.getData().fechaSolicitud = null;
                oDataNewMD.getData().motivoId_motivoId = "";
                oDataNewMD.getData().observacion = "";
                oDataNewMD.getData().estadoIdProceso_iMaestraId = sIdEstadoProcesoPendiente;
                oDataNewMD.getData().fechaAutorizacion = null;
                oDataNewMD.getData().usuarioAutorizacion = "";
                oDataNewMD.getData().af = 'NO';
                oDataNewMD.getData().areaRmd = "";
                oDataNewMD.getData().areaRmdTxt = "";
                oDataNewMD.refresh(true);
                this.localModel.setProperty("/aListaSeccionMD", []);
            },

            // Resetear Model Filter MD.
            onCleanFilterMD: function () {
                var oDataFilter = oThat.getView().getModel("oDataFilter");
                oDataFilter.getData().code = "";
                oDataFilter.getData().description = "";
                oDataFilter.getData().stageProcess = "";
                oDataFilter.getData().productid = "";
                oDataFilter.getData().productdesc = "";
                oDataFilter.getData().formula = "";
                oDataFilter.getData().areaTxt = "";
                oDataFilter.getData().level = "";
                oDataFilter.getData().statusRMD = "";
                oDataFilter.getData().area = "";
                oDataFilter.getData().planta = "";
                oDataFilter.refresh(true);
                indexConfiguracion = 0;
                oThat.onGetDataInitial(false);
            },

            // Resetear Model Filtros OP sin RMD.
            onCleanFiltroOpSinRmd: function () {
                var oDataFilterOpSinRMD = oThat.getView().getModel("oDataFilterOpSinRmd");
                oDataFilterOpSinRMD.getData().productoId = "";
                oDataFilterOpSinRMD.getData().Dispo = false
                oDataFilterOpSinRMD.refresh(true);
                this.localModel.setProperty("/aListaSeccionMD", []);
            },

            // Obtener Data para el combobox del Area
            onGetArea: function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onGetDataGeneral(oModelErp, "ProduccionSet").then(function (oListArea) {
                        resolve(oListArea);
                    }).catch(function (oError) {
                        reject(oError);
                    })
                });
            },

            onSelectSolicitud: async function (oEvent) {
                if (oEvent.getSource().getSelectedItem() !== null) {
                    var solicitudSeleccionada = oEvent.getSource().getSelectedItem().getKey();
                    var sExpand = "estadoIdRmd,sucursalId,motivoId,destinatariosMD/usuarioId,aStatusProceso,aReceta/recetaId,nivelId";
                    var oFilter = [];
                    oFilter.push(new Filter("mdId", "EQ", solicitudSeleccionada));
                    var oDatSolicitudSelected = await Service.onGetDataGeneralFiltersExpand(this.mainModelv2, "MD", oFilter, sExpand);
                    oThat.onChangeSeccionMD(false, oDatSolicitudSelected.results[0])
                    this.getView().getModel("oDataNewMD").setProperty("/", oDatSolicitudSelected.results[0]);
                } else {
                    this.getView().getModel("oDataNewMD").setProperty("/", []);
                }
            },

            onChangeSeccionMD: async function (oEvent, lineaSeleccionada) {            
                if (oEvent) {
                    var oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("additionalText");
                    var oFilter = [];
                    oFilter.push(new Filter("Werks", 'EQ', oCodigoSelected));
                } else {
                    var oCodigoSelected = lineaSeleccionada.sucursalId.codigo;
                }
                
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.getDataAjax(oCodigoSelected).then(function (oListArea) {
                        oThat.localModel.setProperty("/aListaSeccionMD", oListArea);
                        if (oEvent) {
                            this.getView().getModel("oDataNewMD").setProperty("/areaRmd", "");
                        }
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                    })
                });
            },

            onSelectAreaEdit: function (oEvent) {
                var seccionSelected = oEvent.getSource().getSelectedItem().getProperty("text");
                this.getView().getModel("oDataNewMD").setProperty("/areaRmdTxt", seccionSelected);
            },

            onPressChangeDestinatario: function (oEvent) {
                var lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("listMD").getObject();
                this.localModel.setProperty("/lineaChangeDestinatarios", lineaSeleccionada);
                if (!this.openChangeDest) {
                    this.openChangeDest = sap.ui.xmlfragment(
                        "frgOpenChangeDest",
                        sRootPath + ".view.fragment.ChangeDestinatarios",
                        this
                    );
                    this.getView().addDependent(this.openChangeDest);
                }
                this.findChangeDestinatariosWF();
                this.openChangeDest.open();
            },

            findChangeDestinatariosWF: async function () {
                var lineaSeleccionada = this.localModel.getProperty("/lineaChangeDestinatarios");
                var rolId;
                if (lineaSeleccionada.estadoIdProceso_iMaestraId === sIdEstadoProcesoEnProduccion) {
                    rolId = oRolRegistrador;
                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === 458) {
                    rolId = oRolJefeProduccion;
                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === 461) {
                    rolId = oRolGerenteProduccion;
                }
                let sExpand = "oRolWorkflow/aRolUsuarios/oUsuario,oRolWorkflow/aRolUsuarios/oRol";
                var oFilter = [];
                oFilter.push(new Filter("oAplicacion_aplicacionId", 'EQ', oAplicacionConfiguracion));
                oFilter.push(new Filter("oRol_rolId", 'EQ', rolId));
                var oDestinatarios = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "ROLAPPWF", oFilter, sExpand);
                var aListDestinatarios = [];
                if (oDestinatarios.results.length > 0) {
                    oDestinatarios.results[0].oRolWorkflow.aRolUsuarios.results.forEach(function (e) {
                        e.oUsuario.rol = e.oRol.nombre;
                        aListDestinatarios.push(e.oUsuario);
                    });
                }
                this.localModel.setProperty("/destinations", aListDestinatarios);
            },

            onChangeDest: function () {
                var lineaSeleccionada = this.localModel.getProperty("/lineaChangeDestinatarios");
                MessageBox.confirm(formatter.onGetI18nText(oThat,"txtMessage36"), {
                    styleClass: "sapUiSizeCompact",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: async function (oAction) {
                        if (oAction === "YES") {
                            BusyIndicator.show();
                            var updDestinatarios = {
                                destinatariosMD             : []
                            }
                            lineaSeleccionada.destinatarios.forEach(function (e) {
                                updDestinatarios.destinatariosMD.push({
                                    fechaRegistro           : new Date(),
                                    usuarioRegistro         : oInfoUsuario.data.usuario,
                                    activo                  : true,
                                    idMdDestinatarios       : util.onGetUUIDV4(),
                                    mdId_mdId               : lineaSeleccionada.mdId,
                                    usuarioId_usuarioId     : e
                                });
                            });
                            for (var i = 0; i < lineaSeleccionada.destinatariosMD.results.length; i++) {
                                var dest = lineaSeleccionada.destinatariosMD.results[i];
                                var obj = {
                                    usuarioActualiza        : oInfoUsuario.data.usuario,
                                    fechaActualiza          : new Date(),
                                    activo                  : false
                                }
                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj, dest.idMdDestinatarios);
                            }
                            for (var j = 0; j < updDestinatarios.destinatariosMD.length; j++) {
                                var obj = updDestinatarios.destinatariosMD[j];
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_DESTINATARIOS", obj);
                            }
                            var sFilter = [];
                            updDestinatarios.destinatariosMD.forEach(function (e) {
                                sFilter.push(new Filter("usuarioId", 'EQ', e.usuarioId_usuarioId))
                            });
                            
                            var array = [];
                            await Service.onGetDataGeneralFilters(oThat.mainModelv2, "USUARIO", sFilter).then(async function (res) {
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
                                var userTask;
                                if (lineaSeleccionada.estadoIdProceso_iMaestraId === sIdEstadoProcesoEnProduccion) {
                                    userTask = "usertask6";
                                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === 458) {
                                    userTask = "usertask7";
                                } else if (lineaSeleccionada.estadoIdProceso_iMaestraId === 461) {
                                    userTask = "usertask8";
                                }
                                var task = await workflowService.getTaskContextByActivityId(lineaSeleccionada.wfInstanceId, userTask);
                                var cContext = Object.assign({}, task.context);
                                cContext.approverUserData.EMAIL = array.join(",");
                                cContext.bpRequestData = task.context.bpRequestData;
                                cContext.actionChange = "X";
                                await workflowService.completeTask(task.id, cContext);
                                oThat.onCancelChangeDest();
                                BusyIndicator.hide();
                                MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage37"));
                            });                            
                        }
                    }
                });
            },

            onCancelChangeDest: function () {
                this.localModel.setProperty("/lineaChangeDestinatarios", {});
                this.openChangeDest.close();
            },

            // handleUploadComplete: function (oEvent) {
            //     let that = this;
            //     let oFile = oEvent.getParameter("files")[0];
            //     if (oFile) {
            //         if(oFile.size / 1000000 <= iMaxLengthArchivos){
            //             let reader = new FileReader();
            //             reader.onload = function (result) {
            //                 let byteArray = new Uint8Array(result.target.result)
            //                 let obj = {
            //                     'name': oFile.name,
            //                     'size': oFile.size,
            //                     'fileData': byteArray,
            //                     'Name': oFile.name
            //                 }
            //                 // var newRMD = that.localModel.getProperty("/lineaSeleccionadaWF/adjuntos");
            //                 // if(!newRMD.adjuntos) {
            //                 //     newRMD.adjuntos = [];
            //                 // }
            //                 // newRMD.adjuntos.push(obj);
            //                 that.localModel.setProperty("/lineaSeleccionadaWF/adjuntos", obj);
            //                 that.localModel.refresh(true);
            //             };
            //             reader.readAsArrayBuffer(oFile);
            //         } else {
            //             MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage38"))
            //             sap.ui.core.Fragment.byId("frgNewRequestRMD", "fileUploader2").setValue(null);
            //         }
            //     }    
            // },

            handleUploadCompleteReEnvio: function (oEvent) {
                let that = this;
                let oFile = oEvent.getParameter("files")[0];
                if (oFile) {
                    if(oFile.size / 1000000 <= iMaxLengthArchivos){
                        let reader = new FileReader();
                        reader.onload = function (result) {
                            let byteArray = new Uint8Array(result.target.result)
                            let obj = {
                                name    : oFile.name,
                                size    : oFile.size,
                                fileData: byteArray,
                                nuevo   : true,
                                Name    : oFile.name
                            }
                            let newRMD = that.localModel.getProperty("/lineaReenvio");
                            if(!newRMD.adjuntos) {
                                newRMD.adjuntos = [];
                            }
                            newRMD.adjuntos.push(obj);
                            // that.localModel.setProperty("/lineaReenvio/adjuntos", obj);
                            that.localModel.refresh(true);
                        };
                        reader.readAsArrayBuffer(oFile);
                    } else {
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage38"))
                        sap.ui.core.Fragment.byId("frgOpenReEnvio", "fuReEnvioRMD").setValue(null);
                    }
                }    
            },

            onEliminarAdjuntoReenvio: function (oEvent) {
                let lineaSeleccionada = this.localModel.getProperty("/lineaReenvio");
                let sPath = oEvent.getSource().getParent().getBindingContextPath(); 
                let adjuntoSeleccionado = this.localModel.getProperty(sPath);
                if(!adjuntoSeleccionado.nuevo){
                    let obj = {
                        'codigoRM': lineaSeleccionada.mdId,
                        'Name': adjuntoSeleccionado.Name
                    }
                    let aListaAdjuntosEliminados = this.localModel.getProperty("/adjuntoEliminado");
                    aListaAdjuntosEliminados.push(obj);
                    lineaSeleccionada.adjuntos.splice(sPath.split("/")[sPath.split("/").length - 1],1);
                } else {
                    lineaSeleccionada.adjuntos.splice(sPath.split("/")[sPath.split("/").length - 1],1);
                }            
                this.localModel.refresh(true);
            },

            onChangePlanta: function (oEvent) {
                var oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("additionalText");
                var oFilter = [];
                oFilter.push(new Filter("Werks", 'EQ', oCodigoSelected));
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.getDataAjax(oCodigoSelected).then(function (oListArea) {
                        console.log(oListArea);
                        oThat.localModel.setProperty("/aListaSecciones", oListArea);
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        console.log(oError);
                        sap.ui.core.BusyIndicator.hide();
                    })
                });
            },

            onChangePlantaEditInfo: function (oEvent, plantaId) {
                let oCodigoSelected = "";
                if (oEvent) {
                    oCodigoSelected = oEvent.getSource().getSelectedItem().getProperty("additionalText");
                } else {
                    oCodigoSelected = plantaId;
                }
                var oFilter = [];
                oFilter.push(new Filter("Werks", 'EQ', oCodigoSelected));
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.getDataAjax(oCodigoSelected).then(function (oListArea) {
                        console.log(oListArea);
                        oThat.localModel.setProperty("/aListaSeccionesEditInfo", oListArea);
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(function (oError) {
                        console.log(oError);
                        sap.ui.core.BusyIndicator.hide();
                    })
                });
            },

            onCancelarRM: async function (lineaSeleccionada) {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                var sFilter = [];
                sFilter.push(new Filter("mdId_mdId", 'EQ', oDataSeleccionada.getData().mdId));
                var getRMD = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", sFilter);
                var flagCancelar = true;
                if (oDataSeleccionada.getData().aReceta.results.length || oDataSeleccionada.getData().estadoIdRmd_iMaestraId === estadoAutorizado) {
                    flagCancelar = false;
                }
                $.each(getRMD.results, function (k, v){
                    if (v.ordenSAP !== "" && v.ordenSAP !== null) {
                        flagCancelar = false;
                    }
                });
                if (flagCancelar) {
                    var that = this;
                    var oDialog = new sap.m.Dialog({
                        title: "Cancelar RMD",
                        type: "Message",
                        content: [
                            new sap.m.Label({
                                text: "Ingrese un motivo.",
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
                                required: true
                            })
                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Cancelar",
                            enabled: false,
                            press: async function () {
                                var sText = sap.ui.getCore().byId("submitDialogTextarea").getValue();
                                var oData = {
                                    usuarioActualiza        : oInfoUsuario.data.usuario,
                                    fechaActualiza          : new Date(),
                                    motivoCancelado         : sText,
                                    masRecetas              : lineaSeleccionada.getData().masRecetasBK,
                                    rptaValidacion          : lineaSeleccionada.getData().rptaValidacionBK,
                                    estadoIdRmd_iMaestraId  : lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK,
                                    observacion             : lineaSeleccionada.getData().observacionBK
                                }
                                await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oData, oDataSeleccionada.getData().mdId);
                                var updTraz = {
                                    activo                  : true,
                                    usuarioRegistro         : oInfoUsuario.data.usuario,
                                    fechaRegistro           : new Date(),
                                    idTrazabilidad          : util.onGetUUIDV4(),
                                    mdId_mdId               : oDataSeleccionada.getData().mdId,
                                    estadoTrazab_iMaestraId : estadoCancelado
                                }
                                await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);
                                oDialog.close();
                                oThat.onGetDataInitial();
                                MessageBox.success("Se guardaron los cambios correctamente.");
                            }
                        }),
                        endButton: new sap.m.Button({
                            type: sap.m.ButtonType.Reject,
                            text: "Cerrar",
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
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage39"))
                }
            },

            onOpenTrazabilidad: function () {
                if (!this.oTrazabilidadMD) {
                    this.oTrazabilidadMD = sap.ui.xmlfragment(
                        "frgTrazabilidad",
                        sRootPath + ".view.fragment.TrazabilidadMD",
                        this
                    );
                    this.getView().addDependent(this.oTrazabilidadMD);
                }
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                lineaSeleccionada.getData().aTrazabilidad.results.forEach(function (e) {
                    if (e.estadoTrazab_iMaestraId === estadoAutorizado || e.estadoTrazab_iMaestraId === sIdEstadoRMIniciado) {
                        e.state = "Success"
                    } else if (e.estadoTrazab_iMaestraId === estadoCancelado || e.estadoTrazab_iMaestraId === sIdEstadoRMSuspendido) {
                        e.state = "Error"
                    }
                });
                this.localModel.setProperty("/lineaTrazabilidad", lineaSeleccionada.getData().aTrazabilidad.results);
                this.oTrazabilidadMD.open();
            },

            onCancelTrazabilidad: function() {
                this.oTrazabilidadMD.close();
            },

            onConsumirPuestoTrabajo: async function () {
                try {
                    let { mdId } = oThat.getView().getModel("asociarDatos").getData();
                    let aFilters = [];
                    aFilters.push(new Filter("mdId_mdId", "EQ", mdId));
                    let sExpand = "recetaId";
                    let { results } = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_RECETA", aFilters, sExpand);
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
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            onSaveAsociarArticulos: async function () {
                BusyIndicator.show(0);
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                let estado = parseInt(lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK);
                let modelContext = oThat.localModel;
                if (parseInt(lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK) === estadoCancelado) {
                    if (lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK !== lineaSeleccionada.getData().estadoIdRmd_iMaestraId) {
                        this.onCancelarRM(lineaSeleccionada);
                    }
                } else {
                    // mcode
                    if (lineaSeleccionada.getData().estadoIdRmd_iMaestraId != lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK) {
                        if(estado === estadoAutorizado){
                            let aFilter = [];
                            let cod = lineaSeleccionada.getData().codigoversionprincipal || lineaSeleccionada.getData().codigo;
                            // aFilter.push(new Filter("codigoversionprincipal", "EQ", cod));
                            aFilter.push(new Filter({
                                filters: [
                                  new Filter("codigoversionprincipal", "EQ", cod),
                                  new Filter("codigo", "EQ", cod),
                                ],
                                and: false,
                            }))
                            let arrmdAvailable = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "MD", aFilter);
                            // let iValueActual = arrmdAvailable.results.findIndex(item => item.mdId === lineaSeleccionada.getData().mdId);
                            // arrmdAvailable.results.splice(iValueActual, 1);
                            let iValue = arrmdAvailable.results.findIndex(item => parseInt(item.estadoIdRmd_iMaestraId) === estadoAutorizado);
                            if (iValue > -1){
                                MessageBox.warning("Hay versiones que ya fueron autorizadas.");
                                BusyIndicator.hide();
                                return false;
                            }
                        }
                    }

                    // Aca el cambio

                    let dDate = lineaSeleccionada.getData().rptaValidacionDate;

                    var oParam = {
                        fechaActualiza : new Date(),
                        usuarioActualiza : oInfoUsuario.data.usuario,
                        masRecetas      : lineaSeleccionada.getData().masRecetasBK,
                        rptaValidacion : lineaSeleccionada.getData().rptaValidacionBK,
                        estadoIdRmd_iMaestraId : lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK,
                        observacion : lineaSeleccionada.getData().observacionBK,
                        codAgrupadorReceta : lineaSeleccionada.getData().codAgrupadorRecetaBK,
                        codDefectoReceta : lineaSeleccionada.getData().codDefectoRecetaBK,
                        rptaValidacionDate : dDate
                    }

                    if (lineaSeleccionada.getData().rptaValidacion != lineaSeleccionada.getData().rptaValidacionBK) {
                        dDate = new Date();
                        oParam.rptaValidacionDate = dDate;
                    }
                    let bFlagErrorNotif = true;
                    if (lineaSeleccionada.getData().estadoIdRmd_iMaestraId != lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK) {
                        if (Number(lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK) === estadoAutorizado) {
                            var sFilter = [];
                            sFilter.push(new Filter("mdId_mdId", 'EQ', lineaSeleccionada.getData().mdId));
                            sFilter.push(new Filter("estadoIdRmd_iMaestraId", "NE", null));
                            var oDataRmd = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD", sFilter);
                            var flagCancelar = true;
                            $.each(oDataRmd.results, function (k, v){
                                if (v.ordenSAP !== "" && v.ordenSAP !== null) {
                                    flagCancelar = false;
                                }
                            });
                            let aFilter = [];
                            aFilter.push(new Filter("mdId_mdId", FilterOperator.EQ, lineaSeleccionada.getData().mdId));
                            let sExpand = "aPaso/pasoId,estructuraId";
                            let aEstructuraMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "MD_ESTRUCTURA", aFilter, sExpand);
                            let oEstructuraProceso = aEstructuraMD.results.find(itm=>itm.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraProceso);
                            if (oEstructuraProceso) {
                                let aPasosNotificacion = oEstructuraProceso.aPaso.results.filter(itm=>itm.tipoDatoId_iMaestraId === sIdNotificacion);
                                await oThat.onConsumirPuestoTrabajo();
                                let aListPuestoTrab = oThat.getView().getModel("localModel").getProperty("/dataPuestoTrabajo");
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
                                        let flagPuestoTrab = true;
                                        if (aListPuestoTrab.length === 0) {
                                            flagPuestoTrab = false;
                                        } else {
                                            aListPuestoTrab.forEach(function(oPuestoTrabSAP){
                                                if (!aPuestoTrabajoPasos.find(itm=>itm.puestoTrabajo === oPuestoTrabSAP.Arbpl)) {
                                                    flagPuestoTrab = false;
                                                }
                                            });  
                                        }
                                        if (!flagPuestoTrab) {
                                            bFlagErrorNotif  = false;
                                        }                              
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
                                            let oFindClvPre = aClvModeloPasos.filter(itm=>itm.clvModelo === 'SETPRE');
                                            let oFindClvProceso = aClvModeloPasos.filter(itm=>itm.clvModelo === 'PROCESO');
                                            let oFindClvPost = aClvModeloPasos.filter(itm=>itm.clvModelo === 'SETPOST');
                                            if (oFindClvPre.length === 1 && oFindClvProceso.length === 1 && oFindClvPost.length === 1) {
                                                bFlagErrorNotif = bFlagErrorNotif ? true : false;
                                            } else {
                                                bFlagErrorNotif = false;
                                            }
                                            aClvModeloPasos.forEach(function(oCvlModelo){
                                                if (oCvlModelo.aPasos.length === 2) {
                                                    let oFindPasoInicio = oCvlModelo.aPasos.find(itm=>itm.pasoId.tipoCondicionId_iMaestraId === sIdInicioCondicion);
                                                    let oFindPasoFin = oCvlModelo.aPasos.find(itm=>itm.pasoId.tipoCondicionId_iMaestraId === sIdFinCondicion);
                                                    if (!oFindPasoInicio || !oFindPasoFin) {
                                                        bFlagErrorNotif = false;
                                                    }
                                                } else {
                                                    bFlagErrorNotif = false;
                                                }
                                                
                                            });
                                        });
                                    }
                                }
                            }
                            if (flagCancelar) {
                                oParam.fechaAutorizacion = new Date();
                                oParam.usuarioAutorizacion = oInfoUsuario.data.usuario;
                            }
                        }   
                    }

                    if (!bFlagErrorNotif) {
                        MessageBox.error("No se puede autorizar el RMD debido a que los pasos de Notificación están incorrectos.")
                        BusyIndicator.hide();
                        return false;
                    }
                    
                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", oParam, lineaSeleccionada.getData().mdId);
                    let bFlagmodified = false;
                    if (lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK !== lineaSeleccionada.getData().estadoIdRmd_iMaestraId) {
                        bFlagmodified = true;
                    }
                    MessageBox.success("Se guardaron los cambios correctamente.");
                    lineaSeleccionada.getData().rptaValidacionDate = dDate;
                    lineaSeleccionada.getData().masRecetas = lineaSeleccionada.getData().masRecetasBK;
                    lineaSeleccionada.getData().rptaValidacion = lineaSeleccionada.getData().rptaValidacionBK;
                    lineaSeleccionada.getData().estadoIdRmd_iMaestraId = parseInt(lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK);
                    lineaSeleccionada.getData().observacion = lineaSeleccionada.getData().observacionBK;
                    lineaSeleccionada.getData().codAgrupadorReceta = lineaSeleccionada.getData().codAgrupadorRecetaBK;
                    lineaSeleccionada.getData().codDefectoReceta = lineaSeleccionada.getData().codDefectoRecetaBK;
                    lineaSeleccionada.refresh(true);
                    if(modelContext.getProperty("/flagEstadoFormula")){ //validamos que se haya selecionado un estado previamente

                        var updTraz = {
                            activo                  : true,
                            usuarioRegistro         : oInfoUsuario.data.usuario,
                            fechaRegistro           : new Date(),
                            idTrazabilidad          : util.onGetUUIDV4(),
                            mdId_mdId               : lineaSeleccionada.getData().mdId,
                            estadoTrazab_iMaestraId : lineaSeleccionada.getData().estadoIdRmd_iMaestraIdBK
                        }

                        await Service.onSaveDataGeneral(oThat.mainModelv2, "MD_TRAZABILIDAD", updTraz);
                    }
                    await oThat.onGetDataInitial();
                    await oThat.actualizarCabeceraAsociarDatos();
                    modelContext.getData().flagEstadoFormula = false;
                    modelContext.refresh(true);
                    if (bFlagmodified) {
                        BusyIndicator.show(0);
                        if (Number(lineaSeleccionada.getData().estadoIdRmd_iMaestraId) === estadoAutorizado) {
                            for await (const oReceta of lineaSeleccionada.getData().aReceta.results) {
                                await oThat.onTratarInformacionDMS(oReceta.mdRecetaId, "ACTUALIZAR");
                            }
                        } else if (Number(lineaSeleccionada.getData().estadoIdRmd_iMaestraId) === sIdEstadoRMSuspendido){
                            for await (const oReceta of lineaSeleccionada.getData().aReceta.results) {
                                let pdfName = await oThat.generarNombre(oReceta);
                                await oThat.sendDMS(pdfName, "", "ANULAR");
                            }
                        }
                        BusyIndicator.hide();
                    }
                }
                BusyIndicator.hide();
            },
            onActualizarRecetas: async function(){
                BusyIndicator.show();
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                for await (const oReceta of lineaSeleccionada.getData().aReceta.results){
                    let aFilters = [];
                    aFilters.push(new Filter("Matnr", "EQ", oReceta.recetaId.Matnr));
                    aFilters.push(new Filter("Werks", "EQ", oReceta.recetaId.Werks));
                    aFilters.push(new Filter("PrfgF", "EQ", oReceta.recetaId.PrfgF));
                    aFilters.push(new Filter("Atwrt", "EQ", "" ));
                    aFilters.push(new Filter("Verid", "EQ", oReceta.recetaId.Verid));

                    let oResponse = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "ProduccionVSet", aFilters);
                    let data = {
                        Text1 : oResponse.results[0].Text1,
                        Mksp: oResponse.results[0].Mksp
                    };
                    await Service.onUpdateDataGeneral(oThat.mainModelv2, "RECETA", data, oReceta.recetaId_recetaId);
                }
                await oThat.onGetDataInitial();
                await oThat.actualizarCabeceraAsociarDatos();
                await oThat.onGetDataEstructuraMD();
                await oThat.onGetMdRecetaGeneral();
                BusyIndicator.hide();
            },
            onAgregarDocumento: async function () {
                BusyIndicator.show();
                if (!this.oAgregarDocumento) {
                    this.oAgregarDocumento = sap.ui.xmlfragment(
                        "frgAddDocument",
                        sRootPath + ".view.fragment.AddDocumento",
                        this
                    );
                    this.getView().addDependent(this.oAgregarDocumento);
                }
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                var oData = {
                    url : lineaSeleccionada.getData().mdId,
                    origen : "DocumentoMD"
                }
                var oAdjuntoSP = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                // var oData = {
                //     url : lineaSeleccionada.getData().mdId,
                //     origen : "Solicitud"
                // }
                // var oAdjuntoSPSolic = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                // oAdjuntoSPSolic.forEach(function (e){
                //     e.codigoRM = lineaSeleccionada.getData().mdId;
                //     e.enabled = false;
                // });
                oAdjuntoSP.forEach(function (e){
                    e.codigoRM = lineaSeleccionada.getData().mdId;
                    e.enabled = true;
                });
                // oAdjuntoSP = oAdjuntoSP.concat(oAdjuntoSPSolic);
                this.localModel.setProperty("/lineaAddDocumentos/adjuntos", oAdjuntoSP);
                this.oAgregarDocumento.open();
                BusyIndicator.hide();
            },

            onCancelAddDocumento: function () {
                this.localModel.setProperty("/lineaAddDocumentos", {});
                this.oAgregarDocumento.close();
            },

            onSubirAdjuntoEdit: function (oEvent) {
                var that = this;
                var oFile = oEvent.getParameter("files")[0];
                if (oFile) {
                    if(oFile.size / 1000000 <= iMaxLengthArchivos){
                        var reader = new FileReader();
                        reader.onload = function (result) {
                            var byteArray = new Uint8Array(result.target.result)
                            var obj = {
                                'name': oFile.name,
                                'size': oFile.size,
                                'fileData': byteArray,
                                'nuevo': true,
                                'Name': oFile.name
                            }
                            if(!that.localModel.getProperty("/lineaAddDocumentos/adjuntos")){
                                that.localModel.setProperty("/lineaAddDocumentos/adjuntos", []);
                            }
                            that.localModel.getProperty("/lineaAddDocumentos/adjuntos").push(obj);
                            that.localModel.refresh(true);
                        };
                        reader.readAsArrayBuffer(oFile);
                    } else {
                        MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage38"))
                    }
                }
                sap.ui.core.Fragment.byId("frgAddDocument", "fileUploaderAddDoc").setValue(null);
            },

            onConfirmAddDocumento: function () {
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                var listaAdjuntos = oThat.localModel.getProperty("/lineaAddDocumentos/adjuntos");
                if (listaAdjuntos.length > 0) {
                    BusyIndicator.show();
                    listaAdjuntos.forEach(async function(e, index){
                        if (e.nuevo) {
                            e.origen = "DocumentoMD"
                            e.mdId = lineaSeleccionada.getData().mdId;
                            var itm = {
                                usuarioActualiza    : oInfoUsuario.data.usuario,
                                fechaActualiza      : new Date(),
                                archivoMD           : JSON.stringify(e)
                            }
                            await Service.onUpdateDataGeneral(oThat.mainModelv2, "MD", itm, lineaSeleccionada.getData().mdId);
                        }
                        if (index === listaAdjuntos.length - 1) {
                            oThat.onCancelAddDocumento();
                            MessageBox.success(formatter.onGetI18nText(oThat,"txtMessage40"))
                            BusyIndicator.hide();
                        }
                    });
                } else {
                    MessageBox.warning(formatter.onGetI18nText(oThat,"txtMessage41"));
                }
            },
            onPrintRecetas: async function(oEvent){
              await  oThat.tratarInformacion(oEvent,true);
            },
            onDownloadRecetas: async  function(oEvent){
               await oThat.tratarInformacion(oEvent,false);
            },

            onTratarInformacionDMS: async function (mdRecetaId, sEstatus) {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let aDataEstructurasObject = Object.assign({}, oDataSeleccionada.getData());
                let aDataEstructuras = JSON.parse(JSON.stringify(aDataEstructurasObject));
                // let aDataEstructuras = oDataSeleccionada.getData();
                aDataEstructuras.aReceta.results = aDataEstructuras.aReceta.results.filter(itm=>itm.mdRecetaId === mdRecetaId);
                if(aDataEstructuras.aEstructura.results.length > 0){
                    var especificacionEstructura = aDataEstructuras.aEstructura.results.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sTipoEstructuraEspecificaciones);
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
                aDataEstructuras.aEstructura.results = oDataSeleccionada.getData().aEstructura.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                aDataEstructuras.aTrazabilidad.results.sort(function (a, b) {
                    return b.fechaRegistro - a.fechaRegistro;
                });
                let aDataEstructuraObject = JSON.parse(JSON.stringify(aDataEstructuras));
                for await (const oData of aDataEstructuraObject.aEstructura.results){
                    //ETIQUETA
                    if (oData.aEtiqueta.results.length > 0) {
                        oData.aEtiqueta.results = oData.aEtiqueta.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aEtiqueta.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //PASO
                    if (oData.aPaso.results.length > 0) {
                        oData.aPaso.results = oData.aPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
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
                        oData.aPasoInsumoPaso.results = oData.aPasoInsumoPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aPasoInsumoPaso.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //EQUIPO
                    if (oData.aEquipo.results.length > 0) {
                        oData.aEquipo.results = oData.aEquipo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aEquipo.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //UTENSILIO
                    if (oData.aUtensilio.results.length > 0) {
                        oData.aUtensilio.results = oData.aUtensilio.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aUtensilio.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //INSUMO
                    if (oData.aInsumo.results.length > 0) {
                        oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId && obj.mdRecetaId_mdRecetaId == mdRecetaId);
                        oData.aInsumo.results.sort(function (a, b) {
                            return a.ItemNo - b.ItemNo;
                        });
                    }
                    //ESPECIFICACIONES
                    if (oData.aEspecificacion.results.length > 0) {
                        let existeSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP !== null).length > 0 ? true : false;
                        let noExisteSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP === null).length > 0 ? true : false;
                        if (noExisteSap && !existeSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.orden - b.orden
                                );
                            });
                        } else if (existeSap && !noExisteSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.Merknr - b.Merknr
                                );
                            });
                        } else if (existeSap && noExisteSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.Merknr - b.Merknr &&
                                    a.orden - b.orden
                                );
                            });
                        }
                    }
                }
                let pdfBase64 = await tablePdf.onGeneratePdf(aDataEstructuraObject, true, false, oThat.localModel.getProperty("/oInfoUsuario"), null, "BASE64");
                let pdfName;
                if (aDataEstructuras.aReceta.results.length > 0) {
                    pdfName = await oThat.generarNombre(aDataEstructuras.aReceta.results[0]);
                }
                await oThat.sendDMS(pdfName, pdfBase64, sEstatus);
                // await oThat.onCompletarAsociarDatos();
            },

            tratarInformacion: async function (oEvent, VerPDF, oDataRmd) {
                if (oEvent) {
                    var oContext = oEvent.getSource();
                }
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let aDataEstructuras = oDataSeleccionada.getData();
                if(aDataEstructuras.aEstructura.results.length > 0){
                    var especificacionEstructura = aDataEstructuras.aEstructura.results.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sTipoEstructuraEspecificaciones);
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
                let mdRecetaId = "";
                aDataEstructuras.aEstructura.results = oDataSeleccionada.getData().aEstructura.results.sort(function (a, b) {
                    return a.orden - b.orden;
                });
                aDataEstructuras.aTrazabilidad.results.sort(function (a, b) {
                    return b.fechaRegistro - a.fechaRegistro;
                });
                // let aDataEstructuraObject = Object.assign({}, aDataEstructuras);
                let aDataEstructuraObject = JSON.parse(JSON.stringify(aDataEstructuras));
                if(oContext){
                    if(oContext.getProperty("text") === "Imprimir" || oContext.getProperty("text") === "Descargar"){
                        mdRecetaId = oContext.getParent().getParent().getBindingContext("listMdReceta").getObject().mdRecetaId;
                        aDataEstructuraObject.etapaReceta = oContext.getParent().getParent().getBindingContext("listMdReceta").getObject().recetaId.Atwrt;
                        aDataEstructuraObject.descripcionReceta = oContext.getParent().getParent().getBindingContext("listMdReceta").getObject().recetaId.Text1;
                        // aDataEstructuraObject.aEstructura.results = aDataEstructuraObject.aEstructura.results.filter (e => e.estructuraId.tipoEstructuraId_iMaestraId === 488);
                    }
                } else if(aDataEstructuraObject.aReceta.results.length > 1) {
                    //nuevo marin
                    if (oDataRmd) {
                        aDataEstructuraObject.aReceta.results = aDataEstructuraObject.aReceta.results.filter(itm => itm.recetaId.Matnr == oDataRmd.productoId && itm.recetaId.Verid == oDataRmd.verid);
                        if (aDataEstructuraObject.aReceta.results.length > 0) {
                            let aDataGeneral = aDataEstructuraObject.aEstructura.results;
                            let aInsumosFindEst = aDataGeneral.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula).aInsumo.results;
                            aInsumosFindEst = aInsumosFindEst.filter(itm => itm.mdRecetaId_mdRecetaId === aDataEstructuraObject.aReceta.results[0].mdRecetaId);
                            aDataGeneral.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula).aInsumo.results = aInsumosFindEst;
                        }
                    } else {
                        aDataEstructuraObject.aEstructura.results.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula).aInsumo.results = [];
                    }
                    //fin nuevo marin
                    // aDataEstructuraObject.aEstructura.results = aDataEstructuraObject.aEstructura.results.filter (e => e.estructuraId.tipoEstructuraId_iMaestraId != 40);
                }

                // aDataEstructuraObject.aEstructura.results.forEach(async function (oData) {
                for await (const oData of aDataEstructuraObject.aEstructura.results){
                   //ETIQUETA
                    if (oData.aEtiqueta.results.length > 0) {
                        oData.aEtiqueta.results = oData.aEtiqueta.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aEtiqueta.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //PASO
                    if (oData.aPaso.results.length > 0) {
                        oData.aPaso.results = oData.aPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
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
                        oData.aPasoInsumoPaso.results = oData.aPasoInsumoPaso.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aPasoInsumoPaso.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //EQUIPO
                    if (oData.aEquipo.results.length > 0) {
                        oData.aEquipo.results = oData.aEquipo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aEquipo.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //UTENSILIO
                    if (oData.aUtensilio.results.length > 0) {
                        oData.aUtensilio.results = oData.aUtensilio.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        oData.aUtensilio.results.sort(function (a, b) {
                            return a.orden - b.orden;
                        });
                    }
                    //INSUMO
                    if (oData.aInsumo.results.length > 0) {
                        if(mdRecetaId){
                            oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId && obj.mdRecetaId_mdRecetaId == mdRecetaId);
                        }else {
                            oData.aInsumo.results = oData.aInsumo.results.filter(obj => obj.mdId_mdId == oDataSeleccionada.getData().mdId);
                        }
                        oData.aInsumo.results.sort(function (a, b) {
                            return a.ItemNo - b.ItemNo;
                        });
                    }
                    //ESPECIFICACIONES
                    if (oData.aEspecificacion.results.length > 0) {
                        let existeSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP !== null).length > 0 ? true : false;
                        let noExisteSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP === null).length > 0 ? true : false;
                        if (noExisteSap && !existeSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.orden - b.orden
                                );
                            });
                        } else if (existeSap && !noExisteSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.Merknr - b.Merknr
                                );
                            });
                        } else if (existeSap && noExisteSap) {
                            await oData.aEspecificacion.results.sort((a, b) => {
                                return (
                                    a.Merknr - b.Merknr &&
                                    a.orden - b.orden
                                );
                            });
                        }
                    }
                }
                if (mdRecetaId) {
                    aDataEstructuraObject.aReceta.results = aDataEstructuraObject.aReceta.results.filter(oItem => oItem.mdRecetaId == mdRecetaId);
                }
                
                tablePdf.onGeneratePdf(aDataEstructuraObject, oContext? true:false, VerPDF, oThat.localModel.getProperty("/oInfoUsuario"), oDataRmd);
                await oThat.onCompletarAsociarDatos();
            },

            createColumnMDExport: function () {
                var aCols = [];

                aCols.push({
                    label: 'Código',
                    property: 'codigo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Código de Solicitud',
                    property: 'codigoSolicitud',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Versión',
                    type: EdmType.String,
                    property: 'version'
                });

                aCols.push({
                    label: 'Estado',
                    type: EdmType.String,
                    property: 'estadoIdRmd/contenido'
                });

                aCols.push({
                    label: 'Código por Defecto',
                    property: 'codDefectoReceta',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Código Agrupador',
                    property: 'codAgrupadorReceta',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    type: EdmType.String,
                    property: 'descripcion',
                });

                aCols.push({
                    label: 'Etapa',
                    type: EdmType.String,
                    property: 'nivelTxt',
                });

                aCols.push({
                    label: 'Fecha Registro',
                    type: EdmType.Date,
                    property: 'fechaRegistro',
                    format: "yyyy-mm-dd"
                });

                aCols.push({
                    label: 'Usuario Registro',
                    type: EdmType.String,
                    property: 'usuarioRegistro',
                });

                aCols.push({
                    label: 'Fecha Autorización',
                    type: EdmType.String,
                    property: 'fechaAut'
                });

                aCols.push({
                    label: 'Usuario Autorización',
                    type: EdmType.String,
                    property: 'usuarioAutorizacion',
                });

                aCols.push({
                    label: 'A/F',
                    type: EdmType.String,
                    property: 'af',
                });

                aCols.push({
                    label: 'Fecha Solicitud',
                    type: EdmType.Date,
                    property: 'fechaSolicitud',
                    format: "yyyy-mm-dd"
                });

                aCols.push({
                    label: 'Planta',
                    type: EdmType.String,
                    property: 'sucursalId/contenido',
                });

                aCols.push({
                    label: 'Sección',
                    type: EdmType.String,
                    property: 'areaRmdTxt',
                });

                aCols.push({
                    label: 'Motivo',
                    type: EdmType.String,
                    property: 'motivoId/descripcion',
                });

                aCols.push({
                    label: 'Observación',
                    type: EdmType.String,
                    property: 'observacion',
                });

                return aCols;
            },

            exportExcelConstructor: function (sTableName, sTableId, oFunctionColum, bFlag) {
                var nombreExcel = sTableName;
                let oTable;
                if (bFlag) {
                    oTable = sap.ui.getCore().byId(sTableId);

                } else {
                    oTable = this.getView().byId(sTableId);

                }
                var oRowBinding = oTable.getBinding('items');
                oRowBinding.getModel().getData().forEach(function(oLine){
                    if (oLine.fechaAutorizacion) {
                        oLine.fechaAut = formatter.formatDateExcel(oLine.fechaAutorizacion);
                    }
                });
                
                var aCols = oFunctionColum;

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
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            
            onVerNotasImportantes: async function () {
                var lineaSeleccionada = oThat.getView().getModel("asociarDatos");
                var aFilter = [];
                aFilter.push(new Filter("mdId_mdId", "EQ", lineaSeleccionada.getData().mdId));
                aFilter.push(new Filter("tipo", "EQ", "CONFIGURACION"));
                var aListRMD = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_OBSERVACION", aFilter);
                this.localModel.setProperty("/aListNotasImportantes", aListRMD.results);
                if (!this.oVerNotasImportantes) {
                    this.oVerNotasImportantes = sap.ui.xmlfragment(
                        "frgVerNotaImportante",
                        sRootPath + ".view.fragment.VerNotaImportante",
                        this
                    );
                    this.getView().addDependent(this.oVerNotasImportantes);
                }
                this.oVerNotasImportantes.open();
            },
            
            onCancelNotaImportante: function (){
                this.oVerNotasImportantes.close();
            },

            onGetFiltroUtensilioMD: async function () {
                let sExpand = "mdId"
                let aListMD = await Service.onGetDataGeneralExpand(oThat.mainModelv2, "MD_ES_UTENSILIO", sExpand);
                let aListMDs = [];
                aListMD.results.forEach(function(oMdId){
                    if (oMdId.mdId) {
                        aListMDs.push(oMdId.mdId);
                    }
                });
                let helper = {};
                aListMDs = aListMDs.reduce(function(r, o) {
                    let key = o.mdId;
                    if (!helper[key]) {
                        helper[key] = 1;
                        r.push(o);
                    }
                    return r;
                }, []);
                this.localModel.setProperty("/aListaMdFiltro", aListMDs);
            },
              //consumir odata de necesidades clavemodelo
            onConsumirNecesidadesClaveModelo: function () {
                // let oModel = this.getView().getModel("NECESIDADESRMD_SRV");
                Service.onGetDataGeneral(this.oModelErpNec, "ClaveModeloSet").then(({results}) => {
                    
                    oThat.getView().getModel("localModel").setProperty("/dataClaveModelo", results);
                    // console.log(data);
                
                })
                .catch(err=>{
                    console.log("Error al consumir odata de necesidades clavemodelo", err);
                })
            },
            

            onGetNivelOdata: async function (modelo) {
                BusyIndicator.show(0);
                let aFilters = [];
                aFilters.push(new Filter("AtinnText", "EQ", constanteEtapa));
                let oResponse = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "CaracteristicasSet", aFilters);

                oResponse.results.sort(function (a, b) {
                    return a.Atzhl - b.Atzhl;
                });
                
                this.localModel.setProperty(modelo, oResponse.results);
                BusyIndicator.hide();
            },

            onGetAreaOdata: async function (modelo) {
                BusyIndicator.show(0);
                let aFilters = [];
                aFilters.push(new Filter("AtinnText", "EQ", constanteArea));
                let oResponse = await Service.onGetDataGeneralFilters(oThat.oModelErpNec, "CaracteristicasSet", aFilters);
                this.localModel.setProperty(modelo, oResponse.results);
                BusyIndicator.hide();
            },

            onAddNotaImportante: function () {
                var lineaActual = oThat.getView().getModel("asociarDatos").getData();
                var oDialogNotas = new sap.m.Dialog({
                    title: "Ingresar Nota Importante",
                    type: "Message",
                    content: [
                        new sap.m.Label({
                            text: "Ingrese una nota importante",
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
                            required: true
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "Confirmar",
                        enabled: false,
                        press: async function () {
                            BusyIndicator.show(0);
                            var sText = sap.ui.getCore().byId("submitDialogTextarea").getValue();
                            var sobject = {
                                usuarioRegistro : oInfoUsuario.data.usuario,
                                fechaRegistro : new Date(),
                                activo : true,
                                rmdObservacionId : util.onGetUUIDV4(),
                                tipo    : "CONFIGURACION",
                                mdId_mdId : lineaActual.mdId,
                                nombre : oInfoUsuario.data.nombre,
                                apellido : oInfoUsuario.data.apellidoPaterno,
                                observacion : sText
                            }
                            await Service.onSaveDataGeneral(oThat.mainModelv2, "RMD_OBSERVACION", sobject);  
                            sap.ui.getCore().byId("submitDialogTextarea").setValue("");

                            var aFilter = [];
                            aFilter.push(new Filter("mdId_mdId", "EQ", lineaActual.mdId));
                            aFilter.push(new Filter("tipo", "EQ", "CONFIGURACION"));
                            var aListRMD = await Service.onGetDataGeneralFilters(oThat.mainModelv2, "RMD_OBSERVACION", aFilter);
                            oThat.localModel.setProperty("/aListNotasImportantes", aListRMD.results);

                            BusyIndicator.hide();
                            oDialogNotas.close();                   
                        }
                    }),
                    endButton: new sap.m.Button({
                        type: sap.m.ButtonType.Reject,
                        text: "Cancelar",
                        enabled: true,
                        press: function () {
                            sap.ui.getCore().byId("submitDialogTextarea").setValue("");
                            oDialogNotas.close();
                        }
                    }),
                    afterClose: function () {
                        oDialogNotas.destroy();
                    }
                });
        
                oDialogNotas.open();
            },

            onDownloadAdjuntoProd: async function (oEvent) {
                try {
                    BusyIndicator.show(0);
                    let oSource = oEvent.getSource();
                    let lineaSeleccionada = oThat.localModel.getProperty("/lineaStatusProd/0")
                    let oData = {
                        origen  : "Configuracion",
                        url     :  lineaSeleccionada.mdId_mdId
                    }                    
                    let oAdjuntoResponse = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oData);
                    oAdjuntoResponse.map(item=>{
                        item.origen = "Configuracion";
                        item.codigoRM =  lineaSeleccionada.mdId_mdId;
                    })
                    if (lineaSeleccionada.mdId.codigoSolicitud) {
                        let oObj = {
                            url : lineaSeleccionada.mdId_mdId,
                            origen : "Solicitud"
                        }
                        var oAdjuntoSPSolic = await sharepointService.sharePointGetGeneral(oThat.mainModelv2, oObj);
                        oAdjuntoSPSolic.forEach(function (e){
                            e.origen = "Solicitud";
                            e.codigoRM = lineaSeleccionada.mdId_mdId;
                        });
                        oAdjuntoResponse = oAdjuntoResponse.concat(oAdjuntoSPSolic);
                    }
                    console.log(oAdjuntoResponse);

                    oThat.localModel.setProperty("/aAdjuntosSharepoint",oAdjuntoResponse)

                    if (!oThat.oListAdjuntos) {
                        oThat.oListAdjuntos = sap.ui.xmlfragment(
                            "frgAdjuntos",
                            sRootPath + ".view.fragment.prodEstatus.ListAdjuntos",
                            this
                        );
                        this.getView().addDependent(oThat.oListAdjuntos); 
                        //otro metodo
                        // Fragment.load({
                        //     id: "frgAdjuntos",
                        //     name: sRootPath + ".view.fragment.prodEstatus.ListAdjuntos",
                        //     controller: oThat
                        // }).then(function (oPopover) {
                        //     oThat.oListAdjuntos = oPopover;
                        //     oThat.getView().addDependent(oThat.oListAdjuntos);
                        // }.bind(oThat));
                    }
                    
                    oThat.oListAdjuntos.openBy(oSource);
            
                } catch (error) {
                    MessageToast.show(error);
                    
                }
                finally{
                    BusyIndicator.hide();  
                }
            },
            onDownloadAdjunto: async function (oEvent) {
                var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel.sPath;
                var oAdjunto = this.localModel.getProperty(sPath);
                var obj = {};
                obj.codigoRM = oAdjunto.codigoRM;
                obj.Name = oAdjunto.Name;
                obj.origen = oAdjunto.origen;
                var oDownloadResult = await sharepointService.sharePointDownloadGeneral(this.mainModelv2, obj);
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
            onDeleteAdjunto: async function(oEvent){
               try {
                var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel.sPath;
                var oAdjunto = this.localModel.getProperty(sPath);
                var obj = {};
                obj.codigoRM = oAdjunto.codigoRM;
                obj.Name = oAdjunto.Name;
                obj.origen = oAdjunto.origen;

                await sharepointService.sharepointDeleteGeneral(this.mainModelv2, obj);
                MessageToast.show(formatter.onGetI18nText(oThat,"confirmDelete"));    
               } catch (error) {
                    MessageToast.show(error);                   
               }
            },
            onEliminarDocumentoMD: async function (oEvent) {
                let oMDSeleccionada = oThat.getView().getModel("asociarDatos").getData(); 
                let aListaAdjuntos = this.localModel.getProperty("/lineaAddDocumentos/adjuntos");
                let lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("localModel").getObject();
                let lineaSeleccionadaPath = oEvent.getSource().getParent().getBindingContext("localModel").getPath();
                if(!lineaSeleccionada.nuevo){
                    MessageBox.confirm(formatter.onGetI18nText(oThat,"confirmDeleteAdjunto"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function (oAction) {
                            if (oAction === "YES") {
                                BusyIndicator.show(0);
                                let oDeleteImage = {
                                    origen  : "DocumentoMD",
                                    codigoRM : oMDSeleccionada.mdId,
                                    Name : lineaSeleccionada.Name
                                }
                                await sharepointService.sharepointDeleteGeneral(oThat.mainModelv2, oDeleteImage);
                                aListaAdjuntos.splice(lineaSeleccionadaPath.split("/")[lineaSeleccionadaPath.split("/").length - 1],1);
                                oThat.localModel.refresh(true);
                                BusyIndicator.hide();
                                MessageBox.success("Se eliminó el adjunto correctamente");
                            }
                        }
                    });
                } else {
                    aListaAdjuntos.splice(lineaSeleccionadaPath.split("/")[lineaSeleccionadaPath.split("/").length - 1],1);
                    oThat.localModel.refresh(true);
                }
            },

            onDownloadAdjuntoMD: async function (oEvent) {
                let oMDSeleccionada = oThat.getView().getModel("asociarDatos").getData();
                let lineaSeleccionada = oEvent.getSource().getParent().getBindingContext("localModel").getObject();
                let oDownloadImage = {
                    origen  : "DocumentoMD",
                    codigoRM : oMDSeleccionada.mdId,
                    Name : lineaSeleccionada.Name
                }
                let oAdjuntoResponseDownload= await sharepointService.sharePointDownloadGeneral(oThat.mainModelv2, oDownloadImage);
                var len = oAdjuntoResponseDownload.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i <len; i++) {
                    bytes[i]= oAdjuntoResponseDownload.charCodeAt(i);
                }
                var arrBuffer =bytes.buffer;
                var blob = new Blob([arrBuffer],{
                    type: "application/vnd.openxmlformats"
                });
                
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = lineaSeleccionada.Name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            _updateModelRest:async function(){
                // await oThat.onGetLstMdCurrent();
                await oThat.onGetDataEstructuraMD();
                await oThat.onCreateModelTree();
                await oThat.onCreateModelTreeProcess();
              
            },
            onChangeEstadoFormula:function (oEvent) {
                this.localModel.setProperty("/flagEstadoFormula",true);
            },

            // Imprimir PDF con cabecera de RMD e Insumos.
            onPrintConfHeaderRmd:async function (oEvent) {
                let oDataOP = oEvent.getSource().getBindingContext("localModel").getObject();
                await this.tratarInformacion(false, true ,oDataOP);
            },

            onGetPdfViewerRmo:async function (oEvent, bDownload) {
                try {
                    if (!bDownload) {
                        bDownload = false;
                    }
                    let oDataOP = oEvent.getSource().getBindingContext("localModel").getObject();
                    var oDataSeleccionada = oDataOP.aEstructura;
                    oDataSeleccionada.results = oDataSeleccionada.results.sort(function (a, b) {
                        return a.orden - b.orden;
                    });

                    let aFilterUser = [];
                    aFilterUser.push(new Filter("rmdId_rmdId", FilterOperator.EQ, oDataOP.rmdId));
                    let sExpand = "usuarioId";
                    let aListUserRMD = await Service.onGetDataGeneralFiltersExpand(oThat.mainModelv2, "RMD_USUARIO", aFilterUser,sExpand);

                    oDataOP.aReceta.results = oDataOP.aReceta.results.filter(itm => itm.recetaId.Matnr == oDataOP.productoId && itm.recetaId.Verid == oDataOP.verid);
                    if (oDataOP.aReceta.results.length > 0) {
                        let aDataGeneral = oDataOP.aEstructura.results;
                        let aInsumosFindEst = aDataGeneral.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula).aInsumo.results;
                        aInsumosFindEst = aInsumosFindEst.filter(itm => itm.rmdRecetaId_rmdRecetaId === oDataOP.aReceta.results[0].rmdRecetaId);
                        aDataGeneral.find(e => e.estructuraId.tipoEstructuraId_iMaestraId === sIdTipoEstructuraFormula).aInsumo.results = aInsumosFindEst;
                    }

                    for await (const oData of oDataSeleccionada.results){
                        //ETIQUETA
                        if (oData.aEtiqueta.results.length > 0) {
                            oData.aEtiqueta.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        //PASO
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
                        //PASOINSUMOPASO
                        if (oData.aPasoInsumoPaso.results.length > 0) {
                            oData.aPasoInsumoPaso.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        //EQUIPO
                        if (oData.aEquipo.results.length > 0) {
                            oData.aEquipo.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        //UTENSILIO
                        if (oData.aUtensilio.results.length > 0) {
                            oData.aUtensilio.results.sort(function (a, b) {
                                return a.orden - b.orden;
                            });
                        }
                        //INSUMO
                        if (oData.aInsumo.results.length > 0) {
                            oData.aInsumo.results.sort(function (a, b) {
                                return a.ItemNo - b.ItemNo;
                            });
                        }
                        //ESPECIFICACIONES
                        if (oData.aEspecificacion.results.length > 0) {
                            let existeSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP !== null).length > 0 ? true : false;
                            let noExisteSap = oData.aEspecificacion.results.filter(itm=>itm.ensayoPadreSAP === null).length > 0 ? true : false;
                            if (noExisteSap && !existeSap) {
                                await oData.aEspecificacion.results.sort((a, b) => {
                                    return (
                                        a.orden - b.orden
                                    );
                                });
                            } else if (existeSap && !noExisteSap) {
                                await oData.aEspecificacion.results.sort((a, b) => {
                                    return (
                                        a.Merknr - b.Merknr
                                    );
                                });
                            } else if (existeSap && noExisteSap) {
                                await oData.aEspecificacion.results.sort((a, b) => {
                                    return (
                                        a.Merknr - b.Merknr &&
                                        a.orden - b.orden
                                    );
                                });
                            }
                        }
                    }

                    tablePdfRMD.onGeneratePdf(oDataOP, bDownload, oThat.localModel.getProperty("/oInfoUsuario"), oThat.localModel.getProperty("/LineaActualRMD"), aListUserRMD.results);

                    sap.ui.core.BusyIndicator.hide();
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetPdfViewerRmoDownload: async function(oEvent){
                oThat.onGetPdfViewerRmo(oEvent, true);
            },
            
            handleUploadComplete: function (oEvent) {
                var that = this;
                var oFiles = oEvent.getParameter("files");
                for( const file of oFiles){
                    if (file) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            let encoded = reader.result.toString();
                            let byteArray = encoded.split(',')[1];
                            var obj = {
                                'name': file.name,
                                'size': file.size,
                                'fileData': byteArray,
                                'Name': file.name
                            }
                            var newVersionRMD = that.localModel.getProperty("/lineaSeleccionadaWF");
                            if(!newVersionRMD.adjuntos) {
                                newVersionRMD.adjuntos = [];
                            }
                            newVersionRMD.adjuntos.push(obj);
                            that.localModel.refresh(true);
                        };
                        reader.onerror = async function (error) {
                            console.log('Error: ', error);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            },

            createColumnMDExportOPSinRmd: function () {
                var aCols = [];
                let oFechas = oThat.getView().getModel("oFechaOpSinRmd");
                
                aCols.push({
                    label: 'Orden',
                    property: 'Aufnr',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Planta',
                    property: 'planta',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Código',
                    property: 'Matnr',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Descripción',
                    property: 'Maktx',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Versión',
                    property: 'Verid',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Etapa',
                    property: 'Dauat',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Línea',
                    property: 'Dsnam',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Área',
                    type: EdmType.String,
                    property: 'Atwrt',
                });

                aCols.push({
                    label: oFechas.getData().dia1,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia1'
                });

                aCols.push({
                    label: oFechas.getData().dia2,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia2'
                });

                aCols.push({
                    label: oFechas.getData().dia3,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia3'
                });

                aCols.push({
                    label: oFechas.getData().dia4,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia4'
                });

                aCols.push({
                    label: oFechas.getData().dia5,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia5'
                });

                aCols.push({
                    label: oFechas.getData().dia6,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia6'
                });

                aCols.push({
                    label: oFechas.getData().dia7,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia7'
                });

                aCols.push({
                    label: oFechas.getData().dia8,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia8'
                });

                aCols.push({
                    label: oFechas.getData().dia9,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia9'
                });

                aCols.push({
                    label: oFechas.getData().dia10,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia10'
                });

                aCols.push({
                    label: oFechas.getData().dia11,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia11'
                });

                aCols.push({
                    label: oFechas.getData().dia12,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia12'
                });

                aCols.push({
                    label: oFechas.getData().dia13,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia13'
                });

                aCols.push({
                    label: oFechas.getData().dia14,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia14'
                });

                aCols.push({
                    label: oFechas.getData().dia15,
                    type: EdmType.Boolean,
                    trueValue: "Si",
                    falseValue: "No",
                    property: 'dia15'
                });

                return aCols;
            },

            // EXPORT MESSAGE TOAST
            onExportXLSOPSinRMD: function () {
                var sTableName = "OP_SIN_RMD";
                var sTableId = "frgOpSinRM--idTblOpSinRmd";
                var oFunctionColum;
                oFunctionColum = this.createColumnMDExportOPSinRmd();
                this.exportExcelConstructor(sTableName, sTableId, oFunctionColum, true);
                MessageToast.show(formatter.onGetI18nText(oThat,"txtMessage9"));
            },

            onStateBodyFormula: function(oEvent){
                console.log(oEvent);
                return Success;
            },

            sendDMS: async function (pdfName, pdfBase64, sEstatus) {
                let objSendDMS = {
                    Bukrs: "1000",
                    Dokar: "ZP3",
                    DocumentoRef: pdfName,
                    Dokst: "",
                    Operacion: sEstatus,
                    DMSMaterialSet: [
                        {
                            Bukrs: "1000",
                            Dokar: "ZP3",
                            DocumentoRef: pdfName,
                            Sign: "I",
                            Option: "EQ",
                            Low: pdfName.split("-")[0],
                            High: ""
                        }
                    ],
                    DMSDocumentoSet: [
                        {
                            Bukrs: "1000",
                            Dokar: "ZP3",
                            DocumentoRef: pdfName,
                            Bas64: pdfBase64,
                            Nombre: pdfName,
                            Extension: 'PDF'
                        }
                    ]
                }
                await Service.onSaveDataGeneral(oThat.oModelErpNec, "DMSHeaderSet", objSendDMS);
            },

            generarNombre: function (recetaSeleccionada) {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let sNombre = "";
                sNombre = recetaSeleccionada.recetaId.Matnr + "-" + recetaSeleccionada.recetaId.Verid + "-" + oDataSeleccionada.getData().codigo;
                return sNombre;
            },

            actualizarCabeceraAsociarDatos: async function () {
                let oDataSeleccionada = oThat.getView().getModel("asociarDatos");
                let aListMds = this.getView().getModel("listMD").getData();
                let obj = aListMds.find(itm=>itm.mdId === oDataSeleccionada.getData().mdId);
                obj.observacionBK = obj.observacion;
                obj.codAgrupadorRecetaBK = obj.codAgrupadorReceta;
                obj.codDefectoRecetaBK = obj.codDefectoReceta;
                obj.masRecetasBK = obj.masRecetas;
                obj.rptaValidacionBK = obj.rptaValidacion;
                obj.estadoIdRmd_iMaestraIdBK = obj.estadoIdRmd_iMaestraId;
                let oModel = new JSONModel(obj);
                oThat.getView().setModel(oModel, "asociarDatos");
                oThat.getView().getModel("asociarDatos").refresh(true);
                await oThat.onGetDataEstructuraMD();
            },

            // Obtener la informacion de la App Configuracion.
            onGetAppConfiguration:async function () {
                return new Promise(async function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var afilters = [];
                    afilters.push(new Filter("codigo", "EQ", sAppConfiguracion));
                    await Service.onGetDataGeneralFilters(oThat.mainModelv2, "APLICACION", afilters).then(async function (oListAppConfig) {
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
                                new Filter("oAplicacion_aplicacionId", "EQ", oAplicacionConfiguracion),
                                new Filter("campo1", "EQ", 'X')
                            ],
                            and: false
                        })
                    ];
                    await Service.onGetDataGeneralFilters(oThat.mainModelv2, "CONSTANTES", oFilter).then(async function (oListConstantes) {
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
                        if (oConstante.codigoSap === "IDTIPOESTFORMULA") {
                            sIdTipoEstructuraFormula = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDINICIADO") {
                            sIdEstadoRMIniciado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTPRCPROCESO") {
                            sIdEstadoProcesoPendiente = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTPRCENPRODUCCION") {
                            sIdEstadoProcesoEnProduccion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "CODROLIDE") {
                            oRolIDECod = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "CODROLREGISTRADOR") {
                            oRolRegistradorCod = oConstante.contenido;
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
                        if (oConstante.codigoSap === "TXTNIVELFABR") {
                            iNivelFabricacion = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "TXTNIVELRECBR") {
                            iNivelRecubrimiento = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDESTRMDAUTORIZADO") {
                            estadoAutorizado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "MAXCANTARCHIVOS") {
                            iMaxLengthArchivos = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTPERMITIDOPRODUCTO") {
                            sEstadoPermitidoProducto = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "CARACTERISTICAETAPA") {
                            constanteEtapa = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "CARACTERISTICAAREA") {
                            constanteArea = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "DESTJEFEPROD") {
                            tipoJefeProd = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "URL") {
                            tipoGerenteProd = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "URL") {
                            tipoJefaturaDT = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "ADICIONAL") {
                            tipoAdicional = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDESTRMDCANCELADO") {
                            estadoCancelado = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDPLANTA") {
                            sIdPlanta = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTESPECIFICACIONES") {
                            sTipoEstructuraEspecificaciones = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOESTPROCESO") {
                            sIdTipoEstructuraProceso = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPODATONOTIFICACION") {
                            sIdNotificacion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOCONDICIONINICIO") {
                            sIdInicioCondicion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDTIPOCONDICIONFIN") {
                            sIdFinCondicion = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDESTRMDSUSPENDIDO") {
                            sIdEstadoRMSuspendido = parseInt(oConstante.contenido);
                        }
                        if (oConstante.codigoSap === "IDSISTEMARMD") {
                            sSistemaRMDCod = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDAIPRIO00") {
                            sAiPrio00 = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDAIPRIO01") {
                            sAiPrio01 = oConstante.contenido;
                        }
                        if (oConstante.codigoSap === "IDAPPCONFIGURACION") {
                            sRootPath = oConstante.contenido;
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
                    afilters.push(new Filter("codigo", "EQ", oRolIDECod));
                    afilters.push(new Filter("codigo", "EQ", oRolRegistradorCod));
                    afilters.push(new Filter("codigo", "EQ", oRolJefeProduccionCod));
                    afilters.push(new Filter("codigo", "EQ", oRolGerenteProduccionCod));
                    afilters.push(new Filter("codigo", "EQ", oRolJefaturaDTCod));
                    await Service.onGetDataGeneralFilters(oThat.mainModelv2, "ROL", afilters).then(async function (oListRol) {
                        let oRols; 
                        oRols = oListRol.results.find(item => item.codigo === oRolIDECod);
                        if (oRols) {
                            oRolIDE = oRols.rolId;
                        }
                        oRols = oListRol.results.find(item => item.codigo === oRolRegistradorCod);
                        if (oRols) {
                            oRolRegistrador = oRols.rolId;
                        }
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
                    await Service.onGetDataGeneralFilters(oThat.mainModelv2, "SISTEMA", afilters).then(async function (oListSystem) {
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

            onDeleteDuplicatesAllFields:async function (aData, sColumns) {
                try {
                    const hash = {};
                    aData = await aData.filter((current) => {
                        const exists = !hash[eval(sColumns)];
                        hash[eval(sColumns)] = true;
        
                        return exists;
                    });
        
                    return aData;
                } catch (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    oThat.onErrorMessage(oError, "errorSave");
                }
            }
        });
    }
);
