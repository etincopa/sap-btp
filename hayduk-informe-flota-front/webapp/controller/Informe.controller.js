sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/m/MessageToast",
        "Hayduk/InformeDeFlota/model/Util",
        "sap/ui/model/xml/XMLModel",
        "sap/ui/model/FilterOperator",
        "Hayduk/InformeDeFlota/controller/Matriculas",
        "Hayduk/InformeDeFlota/controller/Centros",
        "Hayduk/InformeDeFlota/controller/Puertos",
        "Hayduk/InformeDeFlota/controller/Clientes",
        "Hayduk/InformeDeFlota/controller/Operaciones",
        "Hayduk/InformeDeFlota/controller/Emisor",
        "Hayduk/InformeDeFlota/controller/Especie",
        "Hayduk/InformeDeFlota/controller/Tripulante",
        "Hayduk/InformeDeFlota/controller/Cargos",
        "Hayduk/InformeDeFlota/controller/Tripulacion",
        "Hayduk/InformeDeFlota/model/models",
        "Hayduk/InformeDeFlota/controller/Calas",
        "Hayduk/InformeDeFlota/controller/Horometro",
        "Hayduk/InformeDeFlota/controller/Combustible",
        "Hayduk/InformeDeFlota/controller/Observaciones",
        "sap/m/MessagePopover",
        "sap/m/MessageItem",
        "Hayduk/InformeDeFlota/controller/ColaOper",
        "Hayduk/InformeDeFlota/controller/Log",
        "Hayduk/InformeDeFlota/controller/Aprobaciones",
        "Hayduk/InformeDeFlota/controller/Descarga",
    ],
    function (
        Controller,
        JSONModel,
        Filter,
        MessageToast,
        Util,
        XMLModel,
        FilterOperator,
        Matriculas,
        Centros,
        Puertos,
        Clientes,
        Operaciones,
        Emisor,
        Especie,
        Tripulante,
        Cargos,
        Tripulacion,
        Models,
        Calas,
        Horometro,
        Combustible,
        Observaciones,
        MessagePopover,
        MessageItem,
        ColaOper,
        Log,
        Aprobaciones,
        Descarga
    ) {
        "use strict";
        //Branch bug-tripulanet
        return Controller.extend("Hayduk.InformeDeFlota.controller.Informe", {
            util: Util,
            matriculas: Matriculas,
            centros: Centros,
            puertos: Puertos,
            clientes: Clientes,
            oper: Operaciones,
            emisor: Emisor,
            especie: Especie,
            tripulante: Tripulante,
            cargos: Cargos,
            tripulacion: Tripulacion,
            calas: Calas,
            horometro: Horometro,
            combustible: Combustible,
            observaciones: Observaciones,
            cola: ColaOper,
            log: Log,
            descarga: Descarga,

            TIME_INTERVAL: 600000,

            bActualizarHorometro: true,
            bRegistrarDescarga: true,

            loadInforme: {
                Tripulacion: false,
                Horometro: false,
                Calas: false,
                CompEspecie: false,
                MuestreoCala: false,
                LongCalas: false,
                LogTicket: false,
            },

            loadDataMaestra: {
                Cargo: false,
                CausaNoPesca: false,
                CausaNoZarpe: false,
                Centro: false,
                CentroDescarga: false,
                Cliente: false,
                Destino: false,
                Emisor: false,
                Especie: false,
                EspecieCombo: false,
                Maquila: false,
                MatriTemporada: false,
                Matricula: false,
                MotivoNoZarpe: false,
                MotivoZarpe: false,
                Puerto: false,
                TallaEspecie: false,
                TipoInforme: false,
                TipoRed: false,
                TripPropuesta: false,
                Tripulante: false,
                TripulanteRegion: false,
                ZonaPesca: false,
            },

            onInit: async function () {
                var that = this;
                var oModel = new JSONModel([]);
                this.getView().setModel(oModel, "calasPost");

                oModel = new JSONModel([{ flag: true }]);
                this.getView().setModel(oModel, "flagEdit");
                if (navigator.onLine) {
                    localStorage.removeItem("CausaNoZarpeSet");
                }
                $.sap.sBtnEstadoDoc = false;
                $.sap.iValidarCalas = 0;

                //Crea variables globales para guardar las plantillas
                $.sap.calPlantilla1 = [];
                $.sap.editPlantilla1;
                $.sap.calPlantilla2 = [];
                $.sap.editPlantilla2;
                $.sap.calPlantilla3 = [];
                $.sap.editPlantilla3;
                $.sap.calPlantilla4 = [];
                $.sap.editPlantilla4;
                $.sap.calPlantilla5 = [];
                $.sap.editPlantilla5 = [];

                //Plantillas extra
                $.sap.calPlantilla6 = []; //Plantilla1  agregando %juvenil y %Caballa
                $.sap.editPlantilla6;
                $.sap.calPlantilla7 = []; //PLantilla1 agregando %juvenil
                $.sap.editPlantilla7;
                $.sap.calPlantilla8 = []; //Plantilla4  agregando %juvenil
                $.sap.editPlantilla8;
                $.sap.calPlantilla9 = []; //PLantilla4 agregando %juvenil y %Caballa
                $.sap.editPlantilla9;
                $.sap.calPlantilla10 = []; //Plantilla5  agregando %juvenil y %Caballa
                $.sap.editPlantilla10;
                $.sap.calPlantilla11 = []; //PLantilla5 agregando %juvenil
                $.sap.editPlantilla11;
                $.sap.calPlantilla12 = []; //Plantilla2  agregando %juvenil y %Caballa
                $.sap.editPlantilla12;
                $.sap.calPlantilla13 = []; //PLantilla2 agregando %juvenil
                $.sap.editPlantilla13;
                $.sap.calPlantilla14 = []; //Plantilla3  agregando %juvenil y %Caballa
                $.sap.editPlantilla14;
                $.sap.calPlantilla15 = []; //PLantilla3 agregando %juvenil
                $.sap.editPlantilla15;

                var sUrl = window.location.href;
                if (sUrl.indexOf("hc_back") > -1) {
                    window.history.go(-3);
                }

                Util.iniciarStorage();
                this.buildTallaReady = false;
                this.oInforme = {};
                this.aSuperLog = [];
                this.aLogAprobaciones = [];

                this.aClientesMerge = [];
                this.aEmisorMerge = [];
                this.aMatriculaMerge = [];

                var oModelAddExtensions = this.getOwnerComponent().getModel("addExtensions");
                oModelAddExtensions.loadData("./model/addExtensions.json").then(() => {
                    var oInformeModel = that.getInformeOdataModel();
                    oInformeModel.metadataLoaded().then(that.onMetadataLoaded.bind(that, oInformeModel));
                });

                this.oBotones = {
                    APRAOP: false,
                    APRAJF: false,
                    DESAPRO: false,
                    REGDES1: false,
                    REGDES: false,
                    ANUL_DESC: false,
                    APRO_HORO: false,
                    ANUL_HORO: false,
                    APROBACION_MENU: false,
                    REG_DESC_MENU: false,
                };

                this.setJsonModel(this.oBotones, "Botones", false);

                var oIndicadores = {
                    EstadoColor: "",
                    DescargaColor: "",
                    DescargaTexto: "",
                    CombustibleColor: "",
                    CombustibleTexto: "",
                    HorometroColor: "",
                    NumLog: 0,
                    NumCola: 0,
                };

                this.setJsonModel(oIndicadores, "Indicadores", false);

                var oConfiguracion = {
                    Editable: false,
                };
                this.setJsonModel(oConfiguracion, "Configuracion", false);

                var oZarpe = {
                    Estado: false,
                };

                this.setJsonModel(oZarpe, "Zarpe", false);

                var oPesca = {
                    Estado: false,
                };

                this.setJsonModel(oPesca, "Pesca", false);

                var oStorage = {
                    result: [],
                    Total: 0,
                };
                this.setJsonModel(oStorage, "StorageSet", true);
                this.setJsonModel(
                    {
                        results: [],
                    },
                    "ColaOperSet",
                    true
                );

                //Util.activarTestButton(this);
                this.setJsonModel({}, "SaveWarningSet", true);

                this.setJsonModel([], "TallaXEspecieSet", false);

                this.buildSearchTemplate();
                var aNoZarpe = [{ Motivo: "01" }, { Motivo: "02" }];
                for (var i = 0, n = aNoZarpe.length; i < n; i++) {
                    await this.obtenerCausaNoZarpe(aNoZarpe[i].Motivo);
                }
            },

            _byId: function (sName) {
                var cmp = this.byId(sName);
                if (!cmp) {
                    cmp = sap.ui.getCore().byId(sName);
                }
                return cmp;
            },

            // eslint-disable-next-line no-unused-vars
            onAfterRendering: function (oEvent) {
                //Get informe
                var that = this;

                ColaOper.showNumCola(this);

                this._byId("dpInforme").setBusy(true);
                setTimeout(function () {
                    if (!that.getJsonModel("InformeFlota")) {
                        that.onLogin();
                    } else {
                        var iTime = parseInt(Util.readLocalStorage("TimeInterval"), 0);
                        if (isNaN(iTime)) {
                            iTime = that.TIME_INTERVAL;
                        }

                        var sState = Util.readLocalStorage("EnvioAutom");

                        if (sState && sState === "X") {
                            that.intervalSend = setInterval(function () {
                                Util.excecuteOperations(that);
                            }, iTime);
                            sap.m.MessageToast.show("Envío automático cada " + iTime / 60000 + " min activo");
                        } else {
                            if (this.intervalSend) {
                                clearInterval(this.intervalSend);
                            }
                            sap.m.MessageToast.show(
                                "El envío automático está desactivado, si desea cambiar la configuración ingrese en Cola de Operaciones.",
                                {
                                    duration: 4000,
                                }
                            );
                        }
                        that._byId("dpInforme").setBusy(false);
                    }
                }, 4000);
            },

            checkLoadInforme: function () {
                var allLoaded = true;
                for (var key in this.loadInforme) {
                    if (Object.prototype.hasOwnProperty.call(this.loadInforme, key)) {
                        allLoaded &= this.loadInforme[key];
                    }
                }

                if (allLoaded) {
                    this.oInformeGuardado = this.getTodoInforme();
                    this._byId("dpInforme").setBusy(false);
                }
            },

            allLoadInformeFalse: function () {
                for (var key in this.loadInforme) {
                    if (Object.prototype.hasOwnProperty.call(this.loadInforme, key)) {
                        this.loadInforme[key] = false;
                    }
                }
            },

            setLoadDataMaestra: function (sEntidad, bState, that) {
                that.loadDataMaestra[sEntidad] = bState;
            },

            checkLoadDataMaestra: function () {
                var allLoaded = true;
                for (var key in this.loadDataMaestra) {
                    if (Object.prototype.hasOwnProperty.call(this.loadDataMaestra, key)) {
                        allLoaded &= this.loadDataMaestra[key];
                    }
                }

                if (allLoaded) {
                    this._byId("dpInforme").setBusy(false);
                    if (this._configDialog) {
                        this._configDialog.setBusy(false);
                    }
                }
            },

            allLoadDataMaestraFalse: function () {
                for (var key in this.loadDataMaestra) {
                    if (Object.prototype.hasOwnProperty.call(this.loadDataMaestra, key)) {
                        this.loadDataMaestra[key] = false;
                    }
                }
            },

            allLoadDataMaestraTrue: function () {
                for (var key in this.loadDataMaestra) {
                    if (Object.prototype.hasOwnProperty.call(this.loadDataMaestra, key)) {
                        this.loadDataMaestra[key] = true;
                    }
                }
            },

            modifyColaCounter: function () {
                ColaOper.showNumCola(this);
            },

            showLogDialog: function (sTitle, aList, sState, Width, Heigth, bButtonClean, that) {
                function deleteLog() {
                    that.aSuperLog = [];
                    oMessageLogView.destroyItems();
                    that.getJsonModel("Indicadores").setProperty("/NumLog", 0);
                }

                var oMessageLogView = new sap.m.MessageView({
                    showDetailsPageHeader: false,
                    itemSelect: function () {
                        oBackButton.setVisible(true);
                    },
                    items: {
                        path: "/",
                        template: new sap.m.MessageItem({
                            type: "{type}",
                            title: "{title}",
                            description: "{detalle}",
                            subtitle: "{subtitle}",
                            markupDescription: true,
                        }),
                    },
                });
                var oBackButton = new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                    visible: false,
                    press: function () {
                        oMessageLogView.navigateBack();
                        this.setVisible(false);
                    },
                });

                oMessageLogView.setModel(new sap.ui.model.json.JSONModel(aList));

                var oDialog = new sap.m.Dialog({
                    resizable: false,
                    content: oMessageLogView,
                    state: sState,
                    endButton: new sap.m.Button({
                        press: function () {
                            this.getParent().close();
                        },
                        text: "Cancelar",
                    }),
                    customHeader: new sap.m.Bar({
                        contentMiddle: [
                            new sap.m.Title({
                                text: sTitle,
                                titleStyle: "H4",
                            }),
                        ],
                        contentLeft: [oBackButton],
                    }),
                    contentHeight: Width,
                    contentWidth: Heigth,
                    verticalScrolling: false,
                });

                oDialog.addStyleClass("sapUiSizeCompact");

                if (bButtonClean) {
                    oDialog.setBeginButton(
                        new sap.m.Button({
                            type: sap.m.ButtonType.Reject,

                            // eslint-disable-next-line no-unused-vars
                            press: function (oEvent) {
                                deleteLog();
                            },
                            icon: "sap-icon://delete",
                            text: "Borrar",
                        })
                    );
                }

                oDialog.open();
            },

            ocultarBotones: function (sBoton) {
                var oBotonModel = this.getJsonModel("Botones");
                if (typeof sBoton === "undefined") {
                    for (var key in this.oBotones) {
                        if (Object.prototype.hasOwnProperty.call(this.oBotones, key)) {
                            oBotonModel.setProperty("/" + key, false);
                        }
                    }
                } else {
                    oBotonModel.setProperty("/" + sBoton, false);
                }
            },

            mostrarBoton: function (sBoton) {
                var oBotonModel = this.getJsonModel("Botones");
                oBotonModel.setProperty("/" + sBoton, true);
            },

            getInformeOdataModel: function () {
                this.getOwnerComponent().getModel("INFORME").refreshSecurityToken();
                return this.getOwnerComponent().getModel("INFORME");
            },

            onMetadataLoaded: function (myODataModel) {
                var that = this;
                var oData = {};
                var aResults = [];
                var Start;
                this.aEntities = [];
                var oPage = that._byId("dpInforme");
                //Info de las tablas
                var metadata = myODataModel.getServiceMetadata();
                // console.log(metadata);

                //Creación de modelos locales para datos maestros
                var aEntidades = metadata.dataServices.schema[0].entityType;
                for (var j = 0; aEntidades.length > j; j++) {
                    var sLabel = aEntidades[j].extensions[0].value;
                    //console.log(aEntidades[j].name);
                    if (aEntidades[j].name !== "InformeFlota") {
                        this[aEntidades[j].name + "Model"] = new JSONModel({
                            d: {
                                results: [],
                            },
                        });
                        this[aEntidades[j].name + "Model"].Nombre = aEntidades[j].name;
                        this[aEntidades[j].name + "Model"].Etiqueta = sLabel;
                        this.getView().setModel(this[aEntidades[j].name + "Model"], aEntidades[j].name + "Set");
                        this[aEntidades[j].name + "Model"].attachRequestCompleted(function () {
                            if (this.Nombre === "Horometro") {
                                if (this.getData().d.results.length !== 0) {
                                    var numInforme = that.getJsonModel("InformeFlota").getProperty("/Numero");
                                    var aFilter = [];
                                    if (numInforme.length) {
                                        aFilter.push(new Filter("Numinforme", "EQ", numInforme));
                                    } else {
                                        aFilter = [];
                                    }

                                    that.oFirstHorometer = this.getData().d.results[0];
                                    that._byId("txtEstadoHorometro").setText(
                                        that.oFirstHorometer.EstadoHorom + "-" + that.oFirstHorometer.EstadoHoromDesc
                                    );
                                    that._byId("iconEstadoHorom").setVisible(true);
                                    if (that.oFirstHorometer.EstadoHorom === "APH") {
                                        that.getJsonModel("Indicadores").setProperty("/HorometroColor", "#2B7D2B");
                                        that.rebindTable(
                                            that._byId("tblHorometro"),
                                            "HorometroSet>/d/results",
                                            aFilter,
                                            that.oViewHorometerTemplate,
                                            "Navigation"
                                        );
                                        that.ocultarBotones("APRO_HORO");
                                        that.mostrarBoton("ANUL_HORO");
                                        that._byId("swHorom").setState(false);
                                        that._byId("swHorom").setVisible(false);
                                        that._byId("txtGuardarHorom").setVisible(false);
                                    } else {
                                        that.getJsonModel("Indicadores").setProperty("/HorometroColor", "#2C4E6C");

                                        if (that.getJsonModel("Configuracion").getProperty("/Editable")) {
                                            that.rebindTable(
                                                that._byId("tblHorometro"),
                                                "HorometroSet>/d/results",
                                                aFilter,
                                                that.oEditableHorometerTemplate,
                                                "Edit"
                                            );
                                        }
                                        that.ocultarBotones("ANUL_HORO");
                                        that.mostrarBoton("APRO_HORO");
                                        that._byId("swHorom").setVisible(true);
                                        that._byId("txtGuardarHorom").setVisible(true);
                                    }

                                    if (that.oInformeGuardado) {
                                        that.oInformeGuardado.Horometros = that.getTodoInforme().Horometros;
                                    }

                                    if (!that.bActualizarHorometro && oPage.getBusy()) {
                                        oPage.setBusy(false);
                                    }
                                }
                            }

                            if (this.Nombre === "LogTicket") {
                                if (!that.bRegistrarDescarga && oPage.getBusy()) {
                                    oPage.setBusy(false);
                                }
                            }

                            if (this.Nombre === "Puerto") {
                                oData = this.getData();
                                if (oData.d.results.length !== 0) {
                                    Util.sortObjectArray(oData.d.results, "Numero");
                                }
                            }

                            if (this.Nombre === "Matricula") {
                                aResults = [];
                                Start = 0;
                                oData = this.getData();
                                aResults = oData.d.results;

                                if (aResults.length) {
                                    Start = aResults[0].End;
                                    Array.prototype.push.apply(that.aMatriculaMerge, aResults);
                                    //console.log(that.aClientesMerge);
                                    // if (Start) {
                                    // 	if (navigator.onLine) {
                                    // 		Util.readEntity("Matricula?$filter=Start eq " + Start, true, that);
                                    // 	}
                                    // } else {
                                    Util.sortObjectArray(that.aMatriculaMerge, "Numero");
                                    this.setData({
                                        d: {
                                            results: that.aMatriculaMerge,
                                        },
                                    });
                                    that.setLoadDataMaestra(this.Nombre, true, that);
                                    that.checkLoadDataMaestra();
                                    Util.saveEntity(this.Nombre, JSON.stringify(this.getData()), "X");

                                    // }
                                } else {
                                    Util.sortObjectArray(that.aMatriculaMerge, "Numero");
                                    this.setData({
                                        d: {
                                            results: that.aMatriculaMerge,
                                        },
                                    });
                                    that.setLoadDataMaestra(this.Nombre, true, that);
                                    that.checkLoadDataMaestra();
                                    Util.saveEntity(this.Nombre, JSON.stringify(this.getData()), "X");
                                }
                            }

                            if (this.Nombre === "Emisor") {
                                aResults = [];
                                Start = 0;
                                oData = this.getData();
                                aResults = oData.d.results;

                                if (aResults.length) {
                                    Start = aResults[0].End;
                                    Array.prototype.push.apply(that.aEmisorMerge, aResults);
                                    //console.log(that.aClientesMerge);
                                    if (Start) {
                                        Util.readEntity("Emisor?$filter=Start eq " + Start, true, that);
                                    } else {
                                        Util.sortObjectArray(that.aEmisorMerge, "Numero");
                                        this.setData({
                                            d: {
                                                results: that.aEmisorMerge,
                                            },
                                        });
                                        that.setLoadDataMaestra(this.Nombre, true, that);
                                        that.checkLoadDataMaestra();
                                        Util.saveEntity(this.Nombre, JSON.stringify(this.getData()), "X");
                                    }
                                }
                            }

                            //Llamadas multiples a cliente
                            if (this.Nombre === "Cliente") {
                                aResults = [];
                                Start = 0;
                                oData = this.getData();
                                aResults = oData.d.results;

                                if (aResults.length) {
                                    Start = aResults[0].End;
                                    Array.prototype.push.apply(that.aClientesMerge, aResults);
                                    //console.log(that.aClientesMerge);
                                    if (Start) {
                                        Util.readEntity("Cliente?$filter=Start eq " + Start, true, that);
                                    } else {
                                        Util.sortObjectArray(that.aClientesMerge, "Numero");
                                        this.setData({
                                            d: {
                                                results: that.aClientesMerge,
                                            },
                                        });
                                        that.setLoadDataMaestra(this.Nombre, true, that);
                                        that.checkLoadDataMaestra();
                                        Util.saveEntity(this.Nombre, JSON.stringify(this.getData()), "X");
                                    }
                                }
                            }

                            if (
                                this.Nombre === "Centro" ||
                                this.Nombre === "Especie" ||
                                this.Nombre === "Maquila" ||
                                this.Nombre === "TallaEspecie"
                            ) {
                                oData = this.getData();
                                if (oData.d.results.length !== 0) {
                                    Util.sortObjectArray(oData.d.results, "Identificador");
                                }

                                if (this.Nombre === "Especie") {
                                    for (var i = 0; oData.d.results.length > i; i++) {
                                        oData.d.results[i].Identificador = oData.d.results[i].Identificador.replace(
                                            /^(0+)/g,
                                            ""
                                        );
                                        //console.log(oData.d.results[i].Identificador);
                                    }
                                }
                            }

                            if (this.Nombre === "MatriTemporada") {
                                oData = this.getData();
                                if (oData.d.results.length !== 0) {
                                    Util.sortObjectArray(oData.d.results, "Matricula");
                                }
                            }

                            if (this.Nombre === "Tripulante") {
                                oData = this.getData();
                                //     console.log("Tripulante");
                                //     console.log(oData);
                                //     if (oData.d.results.length !== 0) {
                                //         Util.sortObjectArray(oData.d.results, "Dni");
                                //     }
                                // }

                                // if (this.Nombre === "TripulanteRegion") {
                                //     oData = this.getData();
                                //     console.log("TripulanteRegion");
                                //     console.log(oData);
                                if (oData.d.results.length !== 0) {
                                    Util.sortObjectArray(oData.d.results, "Dni");
                                }
                            }

                            if (this.Nombre === "TripPropuesta") {
                                oData = this.getData();
                                if (oData.d.results.length !== 0) {
                                    Util.sortObjectArray(oData.d.results, "Matricula");
                                }
                            }
                            if (this.Etiqueta !== "-") {
                                if (
                                    this.Nombre !== "Cliente" &&
                                    this.Nombre !== "Emisor" &&
                                    this.Nombre !== "Matricula"
                                ) {
                                    that.setLoadDataMaestra(this.Nombre, true, that);
                                    that.checkLoadDataMaestra();
                                    Util.saveEntity(this.Nombre, JSON.stringify(this.getData()), "X");
                                }
                            }

                            if (this.getData().d.results.length) {
                                var oDateTime = Util.getDateTime(new Date());

                                if (this.Nombre !== "Horometro" || this.Nombre !== "LogTicket") {
                                    that.aSuperLog.push({
                                        title: "Petición completa: " + this.Nombre,
                                        subtitle: oDateTime.date + "-" + oDateTime.time,
                                        type: "Success",
                                    });
                                } else {
                                    if (that.bActualizarHorometro && this.Nombre === "Horometro") {
                                        that.aSuperLog.push({
                                            title: "Petición completa: " + this.Nombre,
                                            subtitle: oDateTime.date + "-" + oDateTime.time,
                                            type: "Success",
                                        });
                                    }
                                    that.bActualizarHorometro = true;

                                    if (that.bRegistrarDescarga && this.Nombre === "LogTicket") {
                                        that.aSuperLog.push({
                                            title: "Petición completa: " + this.Nombre,
                                            subtitle: oDateTime.date + "-" + oDateTime.time,
                                            type: "Success",
                                        });
                                    }
                                    that.bRegistrarDescarga = true;
                                }

                                that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
                            }

                            that.onRefreshData();

                            switch (this.Nombre) {
                                case "Tripulacion":
                                    that.loadInforme.Tripulacion = true;
                                    break;
                                case "Horometro":
                                    that.loadInforme.Horometro = true;
                                    break;
                                case "Calas":
                                    that.loadInforme.Calas = true;
                                    //Actualizar footer
                                    var aItems = that._byId("tblCalas").getBinding("items").oList;
                                    var oColumn = that._byId("tblCalas").getColumns()[15];

                                    var fSumTotal = 0;
                                    for (var j = 0; aItems.length > j; j++) {
                                        var fSubSum = parseFloat(aItems[j].Tbode);
                                        if (!isNaN(fSubSum)) {
                                            fSumTotal += fSubSum;
                                        }
                                    }

                                    //console.log(aItems);
                                    oColumn.getFooter().setText(fSumTotal);
                                    break;
                                case "CompEspecie":
                                    that.loadInforme.CompEspecie = true;
                                    break;
                                case "MuestreoCala":
                                    that.loadInforme.MuestreoCala = true;
                                    break;
                                case "LongCalas":
                                    that.loadInforme.LongCalas = true;
                                    break;
                                case "LogTicket":
                                    that.loadInforme.LogTicket = true;
                                    //Check register
                                    Descarga.checkRegister(that);
                                    break;
                            }
                            that.checkLoadInforme();
                        });

                        this[aEntidades[j].name + "Model"].attachRequestFailed(function (oEvent) {
                            var oParams = oEvent.getParameters();

                            if (
                                oParams.statusCode !== "404" ||
                                (oParams.statusCode === 404 && oParams.responseText.indexOf("Cannot POST") === 0)
                            ) {
                                var oDateTime = Util.getDateTime(new Date());

                                that.aSuperLog.push({
                                    title: "Petición fallida: " + this.Nombre,
                                    subtitle: oDateTime.date + "-" + oDateTime.time,
                                    type: "Error",
                                    detalle: JSON.stringify(oParams),
                                });
                                that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
                                oPage.setBusy(false);
                                if (that._configDialog) {
                                    that._configDialog.setBusy(false);
                                }
                            }
                        });
                    }
                    if (sLabel !== "-") {
                        this.aEntities.push(aEntidades[j].name);
                        if (
                            aEntidades[j].name !== "Cliente" &&
                            aEntidades[j].name !== "Emisor" &&
                            aEntidades[j].name !== "Matricula"
                        ) {
                            Util.readEntity(aEntidades[j].name, true, this);
                        } else {
                            Util.readEntity(aEntidades[j].name + "?$filter=Start eq 1", true, this);
                        }
                    }
                }

                var aConfig = [];
                var oInforme = {};
                this.oInformeLabels = {};
                //Informe de flota
                var aInformeFlota = metadata.dataServices.schema[0].entityType[11].property;
                for (var i = 0; i < aInformeFlota.length; i++) {
                    var label = aInformeFlota[i].extensions[1].value;
                    this.oInformeLabels[aInformeFlota[i].name] = label;
                    //console.log(label);
                    oInforme[aInformeFlota[i].name] = "";
                    if (typeof aInformeFlota[i].nullable === "undefined") {
                        continue;
                    }
                    aConfig.push({
                        propertyName: aInformeFlota[i].name,
                        text: label,
                    });
                }
                oInforme.bVisibleRSW = false; // Agregado

                this.InformeNuevo = oInforme;
                this.setJsonModel(aConfig, "tblInforme", true);
                this.setJsonModel(oInforme, "InformeFlota", false);

                //Horómetros
                Horometro.buildTemplates(metadata, this);
                /*
            //Horómetros por default
            this.HorometroDefaultModel = new JSONModel();
            this.HorometroDefaultModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
            this.HorometroDefaultModel.attachRequestCompleted(function () {
                //console.log(this.getData());
                if (this.getData().d.results.length) {
                    Util.saveEntity("HorometroDefault", JSON.stringify(this.getData()), "X");
                    if (!that.getJsonModel("InformeFlota").getProperty("/Numero").length) {
                        that.cleanModel("HorometroSet");
                        that.setDataModel("HorometroSet", this.getData());
                    }
                    that.onRefreshData();
                    var oDateTime = Util.getDateTime(new Date());
                    that.aSuperLog.push({
                        title: "Petición completa: Horómetros",
                        subtitle: oDateTime.date + "-" + oDateTime.time,
                        type: "Success"
                    });
                    that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);
                }
            });

            this.HorometroDefaultModel.attachRequestFailed(function (oEvent) {
                var oParams = oEvent.getParameters();

                if (oParams.statusCode !== "404" || (oParams.statusCode === 404 && oParams.responseText.indexOf(
                        "Cannot POST") === 0)) {
                    var oDateTime = Util.getDateTime(new Date());

                    that.aSuperLog.push({
                        title: "Petición fallida: Horómetros",
                        subtitle: oDateTime.date + "-" + oDateTime.time,
                        type: "Error"
                    });
                    that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);

                }
            });

            this.aEntities.push("HorometroDefault"); */

                //Tripulación
                Tripulacion.buildTemplates(metadata, this);

                //Calas
                Calas.buildTemplates(metadata, this);

                //Muestreo
                Calas.buildTempMuestreo(metadata, this);

                aConfig = [];

                //Log de tickets

                var aTickets = metadata.dataServices.schema[0].entityType[20].property;
                for (i = 0; i < aTickets.length; i++) {
                    label = aTickets[i].extensions[1].value;

                    //console.log(label);
                    if (label === "-") {
                        continue;
                    }

                    aConfig.push({
                        propertyName: aTickets[i].name,
                        text: label,
                    });
                }

                this.setJsonModel(aConfig, "tblTicket", true);

                aConfig = [];

                //Comp. Especie

                var aCompEspecie = metadata.dataServices.schema[0].entityType[19].property;
                for (i = 0; i < aCompEspecie.length; i++) {
                    label = aCompEspecie[i].extensions[1].value;

                    //console.log(label);
                    if (label === "-") {
                        continue;
                    }

                    aConfig.push({
                        propertyName: aCompEspecie[i].name,
                        text: label,
                    });
                }

                this.setJsonModel(aConfig, "tblCompEspecie", true);
                this.util.crearPlantillas(this);
                sap.ui.core.BusyIndicator.hide();
            },

            setJsonModel: function (Object, ModelName, bOneWay) {
                var oModel = new JSONModel(Object);
                if (bOneWay) {
                    oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
                } else {
                    oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                }
                this.getView().setModel(oModel, ModelName);
            },

            getJsonModel: function (ModelName) {
                return this.getView().getModel(ModelName);
            },

            // eslint-disable-next-line no-unused-vars
            onSelectCorrectFields: function (oEvent) {
                if (!this.getJsonModel("Configuracion").getProperty("/Editable")) {
                    this.getJsonModel("Configuracion").setProperty("/Editable", true);
                    this.getJsonModel("Configuracion").setProperty("/Editable", false);
                }
                //this._byId("dpInforme").scrollTo(0, 0);
            },

            // eslint-disable-next-line no-unused-vars
            onLogin: function (oEvent) {
                // URL
                location.href =
                    "https://informeflotalogin-xxltdi2m6s.dispatcher.us2.hana.ondemand.com/?hc_back&saml2idp=awjv7cscn.accounts.ondemand.com";
            },

            //Editar informe
            onEditInforme: function (oEvent, flag) {
                if (!flag) {
                    var oModel = new JSONModel([{ flag: true }]);
                    this.getView().setModel(oModel, "flagEdit");
                }

                var that = this;
                if (oEvent) {
                    this.getJsonModel("Configuracion").setProperty("/Editable", true);
                }
                this._byId("btnViewInforme").setVisible(true);
                this._byId("btnEditarInforme").setVisible(false);
                this._byId("btnCargaArchivos").setEnabled(true);

                var numInforme = this.getJsonModel("InformeFlota").getProperty("/Numero");
                var sTipoRed = this.getJsonModel("InformeFlota").getProperty("/TipoRed");
                var sCentro = this.getJsonModel("InformeFlota").getProperty("/Centro");
                var sEspecie = this.getJsonModel("InformeFlota").getProperty("/Especie");

                if (numInforme) {
                    if (this.oFirstHorometer && this.oFirstHorometer.EstadoHorom !== "APH") {
                        this.rebindTable(
                            this._byId("tblHorometro"),
                            "HorometroSet>/d/results",
                            [new Filter("Numinforme", "EQ", numInforme)],
                            this.oEditableHorometerTemplate,
                            "Edit"
                        );
                    }
                    this._byId("tblTripulacion").setMode(sap.m.ListMode.Delete);
                    this.rebindTable(
                        this._byId("tblTripulacion"),
                        "TripulacionSet>/d/results",
                        [new Filter("Numinforme", "EQ", numInforme)],
                        this.oEditableTripTemplate,
                        "Edit"
                    );
                }

                this.util.obtenerPlantilla(sCentro, sEspecie, sTipoRed, "Edit", this);
                // if (sTipoRed === "03") {
                // 	//Plantilla Calas 2
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], this.oEditCalasPlantilla2,
                // 		"Edit");

                // } else if (sTipoRed === "04") {
                // 	//Plantilla Calas 3
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], this.oEditCalasPlantilla3,
                // 		"Edit");
                // } else {
                // 	//Plantilla Calas 1
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], oRecoverCells,
                // 		"Edit");
                // }
                if (oEvent) {
                    oEvent.getSource().setVisible(false);
                }
                this.validarBotones();

                if (oEvent) {
                    that.oInformeGuardado = that.getTodoInforme();
                }

                if (
                    that.oInformeGuardado.Horometros.length &&
                    that.oInformeGuardado.Horometros[0].EstadoHorom === "APH"
                ) {
                    that.ocultarBotones("APRO_HORO");
                    that.mostrarBoton("ANUL_HORO");
                } else {
                    that.ocultarBotones("ANUL_HORO");
                    that.mostrarBoton("APRO_HORO");
                }

                if (that.getJsonModel("Indicadores").getProperty("/DescargaTexto") === "Registrado") {
                    that.ocultarBotones("REGDES");
                } else {
                    that.mostrarBoton("REGDES");
                }
            },

            validarBotones: function () {
                //Mostrar/Ocultar botones
                var aBotones = this.getJsonModel("InformeFlota").getProperty("/Botones").trim().split("");

                if (aBotones.length) {
                    for (var i = 0; aBotones.length > i; i++) {
                        var sBoton;
                        switch (i) {
                            case 1:
                                sBoton = "APRAOP";
                                break;
                            case 2:
                                sBoton = "APRAJF";
                                break;
                            case 3:
                                sBoton = "DESAPRO";
                                break;
                            case 4:
                                sBoton = "REGDES";
                                break;
                            case 5:
                                sBoton = "REGDES1";
                                break;
                            case 6:
                                sBoton = "ANUL_DESC";
                                break;
                            case 7:
                                sBoton = "APRO_HORO";
                                break;
                            case 8:
                                sBoton = "ANUL_HORO";
                                break;
                        }

                        if (aBotones[i] === "1") {
                            this.mostrarBoton(sBoton);
                        } else {
                            this.ocultarBotones(sBoton);
                        }
                    }

                    var oBotones = this.getJsonModel("Botones").getData();

                    if (oBotones.APRAOP || oBotones.APRAJF || oBotones.DESAPRO) {
                        this.mostrarBoton("APROBACION_MENU");
                    } else {
                        this.ocultarBotones("APROBACION_MENU");
                    }

                    if (oBotones.REGDES1 || oBotones.REGDES || oBotones.ANUL_DESC) {
                        this.mostrarBoton("REG_DESC_MENU");
                    } else {
                        this.ocultarBotones("REG_DESC_MENU");
                    }
                }
            },

            //Visualizar informe
            // eslint-disable-next-line no-unused-vars
            onViewInforme: function (oEvent) {
                this.getJsonModel("Configuracion").setProperty("/Editable", false);
                var numInforme = this.getJsonModel("InformeFlota").getProperty("/Numero");
                if (numInforme.length) {
                    this._byId("btnEditarInforme").setVisible(true);
                } else {
                    this._byId("btnEditarInforme").setVisible(false);
                }
                this._byId("btnViewInforme").setVisible(false);
                this._byId("btnCargaArchivos").setEnabled(false);

                var sTipoRed = this.getJsonModel("InformeFlota").getProperty("/TipoRed"),
                    sCentro = this.getJsonModel("InformeFlota").getProperty("/Centro"),
                    sEspecie = this.getJsonModel("InformeFlota").getProperty("/Especie");

                if (numInforme) {
                    this.rebindTable(
                        this._byId("tblHorometro"),
                        "HorometroSet>/d/results",
                        [new Filter("Numinforme", "EQ", numInforme)],
                        this.oViewHorometerTemplate,
                        "Navigation"
                    );

                    this._byId("tblTripulacion").setMode(sap.m.ListMode.None);
                    this.rebindTable(
                        this._byId("tblTripulacion"),
                        "TripulacionSet>/d/results",
                        [new Filter("Numinforme", "EQ", numInforme)],
                        this.oViewTripTemplate,
                        "Navigation"
                    );
                }

                this.util.obtenerPlantilla(sCentro, sEspecie, sTipoRed, "Navigation", this);
                // if (sTipoRed === "03") {
                // 	//Plantilla Calas 2
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], this.oViewCalasPlantilla2,
                // 		"Navigation");
                // } else if (sTipoRed === "04") {
                // 	//Plantilla Calas 3
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], this.oViewCalasPlantilla3,
                // 		"Navigation");
                // } else {
                // 	//Plantilla Calas 1
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", numInforme)], this.oViewCalasPlantilla1,
                // 		"Navigation");
                // }

                var estadoInforme = this.getJsonModel("InformeFlota").getProperty("/Estado");

                if (estadoInforme === "CRE") {
                    this.ocultarBotones("DESAPRO");
                } else if (estadoInforme === "AJF") {
                    this._byId("btnEditarInforme").setVisible(false);
                } else if (estadoInforme === "AOP") {
                    this.ocultarBotones("DESAPRO");
                }

                this.ocultarBotones("REGDES");
                this.ocultarBotones("REGDES1");
                this.ocultarBotones("ANUL_DESC");
                this.ocultarBotones("APRO_HORO");
                this.ocultarBotones("ANUL_HORO");
            },

            // Nuevo informe de flota
            // eslint-disable-next-line no-unused-vars
            onNewInforme: function (oEvent) {
                var sNone = sap.ui.core.ValueState.None;
                for (var key in this.InformeNuevo) {
                    if (Object.prototype.hasOwnProperty.call(this.InformeNuevo, key)) {
                        if (key == "bVisibleRSW") {
                            this.getJsonModel("InformeFlota").setProperty("/" + key, false);
                        } else {
                            this.getJsonModel("InformeFlota").setProperty("/" + key, "");
                        }
                    }
                }

                this.ocultarBotones();

                this.aTallas = undefined;
                this.getJsonModel("InformeFlota").setProperty("/IndicadorZarpe", "X");
                this.getJsonModel("InformeFlota").setProperty("/IndicadorPesca", "X");

                this._byId("cbxCausaNoPesca").setEnabled(false);
                this.getJsonModel("Zarpe").setProperty("/Estado", true);
                this.getJsonModel("Pesca").setProperty("/Estado", true);

                this._byId("inpConsumoFaena").setValue("");
                this._byId("inpConsumoDescarga").setValue("");
                this._byId("inpEspecie").setValue("");

                this._byId("inpCentro").setValue("");
                this._byId("inpCentro").setValueState(sap.ui.core.ValueState.None);

                this._byId("inpCentroDescarga").setValue("");
                this._byId("inpPtoArribo").setValue("");
                this._byId("inpPuertoZarpe").setValue("");
                //this._byId("feCentro").setVisible(false);
                //this._byId("feEmpMaquila").setVisible(false);
                this._byId("iconEstadoInforme").setVisible(false);
                this._byId("pnlCalas").setVisible(false);

                this._byId("txtEmisor").setText("");
                this._byId("txtCliente").setText("");
                this._byId("txtPuertoArribo").setText("");
                this._byId("txtPuertoZarpe").setText("");

                this._byId("cbxTipoInforme").setSelectedKey("P");
                this._byId("cbxTipoInforme").setValueState(sap.ui.core.ValueState.None);
                this._byId("cbxTipoInforme").fireChange();
                this._byId("cbxTipoInforme").fireSelectionChange();

                this._byId("feEmisor").setVisible(false);

                this.numero = undefined;
                this.numeroCala = undefined;
                this.numeroMuestreo = undefined;

                this._byId("inpConsumoFaena").setValue("0.00");
                this._byId("inpConsumoDescarga").setValue("0.00");

                this.cleanModel("TripulacionSet");
                this.buildTallaReady = false;
                this.cleanModel("CalasSet");
                this.cleanModel("CompEspecieSet");
                this.cleanModel("MuestreoCalaSet");

                this.getJsonModel("Configuracion").setProperty("/Editable", true);
                this._byId("btnViewInforme").setVisible(false);
                this._byId("btnShowTimes").setVisible(false);
                this._byId("btnEditarInforme").setVisible(false);

                this._byId("tblTripulacion").setMode(sap.m.ListMode.Delete);
                this.rebindTable(
                    this._byId("tblTripulacion"),
                    "TripulacionSet>/d/results",
                    [new Filter("Numinforme", "EQ", "")],
                    this.oEditableTripTemplate,
                    "Edit"
                );

                //Util.readEntity("HorometroDefault", true, this, "Horometro");
                this.cleanModel("HorometroSet");
                this.rebindTable(
                    this._byId("tblHorometro"),
                    "HorometroSet>/d/results",
                    [],
                    this.oEditableHorometerTemplate,
                    "Edit"
                );

                this._byId("btnNewInforme").setVisible(true);

                //Reset estados

                this._byId("txtEstadoHorometro").setText("");
                this._byId("iconEstadoHorom").setVisible(false);
                /*
                                this._byId("dpLlegadaZonaPesca").setValueState(sNone);
                                this._byId("tpLlegadaZonaPesa").setValueState(sNone);
                                this._byId("dpSalidaPesca").setValueState(sNone);
                                this._byId("tpSalidaPesca").setValueState(sNone);
                
                                this._byId("dpZarpe").setValueState(sNone);
                                this._byId("tpZarpe").setValueState(sNone);
                */
                this._byId("itbGeneral").setSelectedKey("TRIP");

                this.getJsonModel("Indicadores").setProperty("/DescargaColor", "");
                this.getJsonModel("Indicadores").setProperty("/DescargaTexto", "");
                this._byId("iconDescarga").setVisible(false);

                this.getJsonModel("Indicadores").setProperty("/CombustibleColor", "");
                this.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "");
                this._byId("iconCombustible").setVisible(false);
                this._byId("btnCargaArchivos").setEnabled(false);
                this.getView().byId("rbgRSW").setSelectedIndex(-1);
                this.getView().byId("inpLlegadaZonaPesca").setValue("");
                this.getView().byId("inpSalidaPesca").setValue("");
                this.getView().byId("inpZarpe").setValue("");
                this.getView().byId("inpArribo").setValue("");
                this.getView().byId("inpDescarga").setValue("");
                this.getView().byId("inpDescarga2").setValue("");
                this.getView().byId("txtOperativoLim").setValue("");
                this.getView().byId("txtOperativoLim").setVisible(false);

                var oModel = new JSONModel([]);
                this.getView().setModel(oModel, "calasPost");

                this.getJsonModel("MuestreoCalaSet").getData().d.results = [];
                this.getJsonModel("LongCalasSet").getData().d.results = [];
            },

            cleanModel: function (sModelName) {
                this.getJsonModel(sModelName).setData({
                    d: {
                        results: [],
                    },
                });
                this.getJsonModel(sModelName).refresh(true);
            },

            setDataModel: function (sModelName, aData) {
                this.getJsonModel(sModelName).setData(aData);
                this.getJsonModel(sModelName).refresh(true);
            },

            //Cambiar plantilla de la tabla para hacerla editable
            rebindTable: function (oTable, sPath, aFilters, oTemplate, sKeyboardMode) {
                // if (sPath === "CalasSet>/d/results") {
                // 	var oItems = oTable.getItems(),
                // 		iLength = oItems.length;

                // 	for (var i = 0, n = iLength; i < n; i++) {
                // 		// oItems[i].destroyCells();
                // 		oItems[i].removeAllCells();
                // 	}
                // 	if (iLength >= 1) {
                // 		// oTable.destroyItems();
                // 		oTable.removeAllItems();
                // 		oTable.unbindItems();
                // 		oTable.removeAllColumns();
                // 	}
                // }
                oTable
                    .bindItems({
                        path: sPath,
                        filters: aFilters,
                        template: oTemplate,
                    })
                    .setKeyboardMode(sKeyboardMode);
            },

            //Buscar Informe
            // eslint-disable-next-line no-unused-vars
            onSearchInforme: function (oEvent) {
                if (!this._informeDialog) {
                    this._informeDialog = sap.ui.xmlfragment(
                        "Hayduk.InformeDeFlota.view.fragments.dialogs.BuscarInforme",
                        this
                    );
                    this.getView().addDependent(this._informeDialog);
                }
                this._informeDialog.open();
            },

            buildSearchTemplate: function () {
                var that = this;
                var aCellsSearch = [];

                aCellsSearch.push(
                    new sap.m.Text({
                        text: "{INFORME>Numero}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>Tipo}",
                        text: "{INFORME>TipoDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>Centro}",
                        text: "{INFORME>CentroDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.Text({
                        text: "{INFORME>Matricula}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.Text({
                        text: "{INFORME>Embarcacion}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>Especie}",
                        text: "{INFORME>EspecieDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>Estado}",
                        text: "{INFORME>EstadoDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>FechaZarpe}",
                        text: "{INFORME>HoraZarpe}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>FechaArribo}",
                        text: "{INFORME>HoraArribo}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>PuertoArribo}",
                        text: "{INFORME>PuertoArriboDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>CentroDescarga}",
                        text: "{INFORME>CentroDescargaDesc}",
                    })
                );

                aCellsSearch.push(
                    new sap.m.ObjectIdentifier({
                        title: "{INFORME>Destino}",
                        text: "{INFORME>DestinoDesc}",
                    })
                );

                this.SearchTemplate = new sap.m.ColumnListItem({
                    cells: aCellsSearch,
                    type: sap.m.ListType.Navigation,
                    press: function (oEvent) {
                        that.onPressInforme(oEvent);
                    },
                });
            },

            // eslint-disable-next-line no-unused-vars
            onCloseSearchInforme: function (oEvent) {
                this._informeDialog.close();
            },

            // eslint-disable-next-line no-unused-vars
            onSubmitFilter: function (oEvent) {
                this._byId("ftbBuscarInforme").fireSearch();
            },

            onSearch: function (oEvent) {
                var aFilterGroups = oEvent.getSource().getFilterGroupItems();
                var aFilters = [];
                var oTblBuscarInforme = this._byId("tblInforme");

                for (var i = 0; aFilterGroups.length > i; i++) {
                    var sControlType = aFilterGroups[i].getControl().getMetadata().getName();

                    if (sControlType !== "sap.m.DatePicker") {
                        if (aFilterGroups[i].getControl().getSelectedKey()) {
                            aFilters.push(
                                new Filter(
                                    aFilterGroups[i].getName(),
                                    FilterOperator.EQ,
                                    aFilterGroups[i].getControl().getSelectedKey()
                                )
                            );
                        } else if (aFilterGroups[i].getControl().getValue() && sControlType === "sap.m.Input") {
                            aFilters.push(
                                new Filter(
                                    aFilterGroups[i].getName(),
                                    FilterOperator.EQ,
                                    aFilterGroups[i].getControl().getValue().trim()
                                )
                            );
                        }
                    } else {
                        if (aFilterGroups[i].getControl().getValue()) {
                            aFilters.push(
                                new Filter(
                                    aFilterGroups[i].getName(),
                                    FilterOperator.EQ,
                                    aFilterGroups[i].getControl().getValue()
                                )
                            );
                        }
                    }
                }

                // console.log(aFilters);

                if (aFilters.length) {
                    oTblBuscarInforme.bindItems({
                        path: "INFORME>/InformeFlotaSet",
                        template: this.SearchTemplate,
                        templateShareable: true,
                        filters: aFilters,
                    });
                } else {
                    sap.m.MessageBox.error("Por favor indique al menos un filtro");
                }

                //this._byId("tblInforme").getBinding("items").filter(aFilters);
                //console.log(aFilters);
            },

            onClear: function (oEvent) {
                var aFilterGroups = oEvent.getSource().getFilterGroupItems();

                for (var i = 0; aFilterGroups.length > i; i++) {
                    var sControlType = aFilterGroups[i].getControl().getMetadata().getName();

                    if (sControlType !== "sap.m.DatePicker") {
                        aFilterGroups[i].getControl().setSelectedKey("");
                        aFilterGroups[i].getControl().setValue("");
                    } else if (sControlType === "sap.m.Input") {
                        aFilterGroups[i].getControl().setValue("");
                    } else {
                        aFilterGroups[i].getControl().setValue("");
                    }
                }
            },

            //Refresh

            // eslint-disable-next-line no-unused-vars
            onRefreshInforme: function (oEvent) {
                this._byId("tblInforme").getModel("INFORME").refresh();
            },

            // eslint-disable-next-line no-unused-vars
            onRefreshCompEspecie: function (oEvent) {
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                if (nNumero.length) {
                    Util.readInformeEntity("CompEspecie", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
                }
            },

            // eslint-disable-next-line no-unused-vars
            onRefreshLogTicket: function (oEvent) {
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                if (nNumero.length) {
                    Util.readInformeEntity("LogTicket", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
                }
            },

            //Descargas XML
            onXLSInformes: function (oEvent) {
                this.onXLSDownload(oEvent, "tblInforme", "InformesFlota", false);
            },

            onXLSTickets: function (oEvent) {
                this.onXLSDownload(oEvent, "tblTicket", "Tickets", true);
            },

            onXLSCompEspecie: function (oEvent) {
                this.onXLSDownload(oEvent, "tblCompEspecie", "CompEspecie", true);
            },

            onXLSDownload: function (oEvent, sTable, sFileName, bJson) {
                jQuery.sap.require("sap.ui.export.Spreadsheet");
                var nInforme = this.getJsonModel("InformeFlota").getProperty("/Numero");
                var tblInformes = this._byId(sTable);
                var aConfig = this.getJsonModel(sTable).getData();
                var aXLSCols = [];
                var dataSource;

                for (var i = 0; i < aConfig.length; i++) {
                    aXLSCols.push({
                        label: aConfig[i].text,
                        property: aConfig[i].propertyName,
                    });
                }

                var oRowBinding = tblInformes.getBinding("items");
                //console.log(oRowBinding.oList);
                var oModel = oRowBinding.getModel();
                var oModelInterface = oModel.getInterface();

                var date = new Date();
                var sDate = date.getMonth() + 1 + "-" + date.getFullYear();
                var FileName;

                if (!nInforme.length) {
                    FileName = sDate + "-" + sFileName + ".xlsx";
                } else {
                    FileName = sDate + "-" + nInforme + " - " + sFileName + ".xlsx";
                }

                if (bJson) {
                    dataSource = oRowBinding.oList;
                    //console.log(aConfig);
                    //console.log(dataSource);
                } else {
                    dataSource = {
                        type: "oData",
                        dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                        serviceUrl: oModelInterface.sServiceUrl,
                        headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
                        count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                        useBatch: oModelInterface.getProperty("bUseBatch"),
                        sizeLimit: oModelInterface.iSizeLimit,
                    };
                }

                var oSettings = {
                    workbook: {
                        columns: aXLSCols,
                    },
                    fileName: FileName,
                    dataSource: dataSource,
                    worker: false,
                };

                new sap.ui.export.Spreadsheet(oSettings).build();
            },

            // eslint-disable-next-line no-unused-vars
            refreshInforme: function (oEvent) {
                var sNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                var that = this;
                var oPage = this._byId("dpInforme");
                if (sNumero.length) {
                    sap.m.MessageBox.confirm("¿Desea refrescar el informe? Perderá los datos no guardados.", {
                        title: "Refrescar Informe de Flota",
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                oPage.setBusy(true);
                                var oModel = that.getInformeOdataModel();
                                oModel.read("/InformeFlotaSet('" + sNumero + "')", {
                                    success: function (oData) {
                                        that.getJsonModel("Configuracion").setProperty("/Editable", true);
                                        that.processInformeSelected(oData, false);
                                        that.getJsonModel("Configuracion").setProperty("/Editable", false);
                                    },
                                    error: function (oError) {
                                        //console.log(oError);
                                        sap.m.MessageBox.error("No fue posible obtener la data del informe.", {
                                            title: "Refrescar Informe de Flota",
                                            details: oError.message,
                                        });
                                    },
                                });
                            }
                        },
                    });
                } else {
                    sap.m.MessageBox.warning("No está visualizando ni editando un informe previamente guardado.", {
                        title: "Refrescar Informe de Flota",
                    });
                }
            },

            regreshAfterSave: function (data, that) {
                that._byId("dpInforme").setBusy(true);
                var sNumero = data.Numero;
                var oModel = that.getInformeOdataModel();
                that.allLoadInformeFalse();
                oModel.read("/InformeFlotaSet('" + sNumero + "')", {
                    success: function (oData) {
                        that.getJsonModel("Configuracion").setProperty("/Editable", true);
                        that.processInformeSelected(oData, false);
                        //Edit

                        that.onEditInforme(false, true);
                    },
                    error: function (oError) {
                        //console.log(oError);
                        var sMessage = "No fue posible obtener la data del informe.";
                        var oDateTime = Util.getDateTime(new Date());

                        that.aSuperLog.push({
                            title: sMessage,
                            subtitle: oDateTime.date + "-" + oDateTime.time,
                            type: "Error",
                            detalle: oError.responseText,
                        });
                        that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);

                        sap.m.MessageToast.show(sMessage);
                    },
                });
            },

            onPressInforme: function (oEvent) {
                var oModel = new JSONModel([{ flag: true }]);
                this.getView().setModel(oModel, "flagEdit");

                var calas = this._byId("tblCalas").getBinding("items").oList;

                $.each(calas, function (k, v) {
                    v.Juven_Jure = "";
                });

                var oCalasPostModel = new JSONModel([]);
                this.getView().setModel(oCalasPostModel, "calasPost");

                var sNone = sap.ui.core.ValueState.None;

                this._byId("dpInforme").setBusy(true);
                this.allLoadInformeFalse();
                this.ocultarBotones();
                /*                this._byId("dpLlegadaZonaPesca").setValueState(sNone);
                                this._byId("tpLlegadaZonaPesa").setValueState(sNone);
                                this._byId("dpSalidaPesca").setValueState(sNone);
                                this._byId("tpSalidaPesca").setValueState(sNone);
                
                                this._byId("dpZarpe").setValueState(sNone);
                                this._byId("tpZarpe").setValueState(sNone);
                */
                this.oInforme = oEvent.getSource().getBindingContext("INFORME").getObject();

                this.Matricula = this.oInforme.Matricula;

                // Setear temporada para que sea aplicado en filtros (p.ej. tripulantes)
                this.matriculas.setTemporada(this.Matricula, this);

                this.getJsonModel("Configuracion").setProperty("/Editable", true);
                this.processInformeSelected(this.oInforme, false);
                this.getJsonModel("Configuracion").setProperty("/Editable", false);
                if (this.oInforme.Estado === "CRE") {
                    this._byId("btnEditarInforme").setVisible(true);
                    //btnViewInforme
                    this._byId("btnViewInforme").setVisible(false);
                } else {
                    this._byId("btnEditarInforme").setVisible(false);
                    this._byId("btnViewInforme").setVisible(false);
                }
                this._byId("btnShowTimes").setVisible(true);
                this._byId("tblTripulacion").setMode(sap.m.ListMode.None);
                this._byId("btnCargaArchivos").setEnabled(false);
                $.sap.sBtnEstadoDoc = false;

                this.onCloseSearchInforme();
            },

            processInformeSelected: function (oInforme, bInit) {
                //var sService = Models.getService();
                var that = this;

                this.buildTallaReady = false;
                this.aTallas = undefined;
                this._byId("pnlCalas").setVisible(true);

                if (oInforme.Estado === "CRE") {
                    this.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2C4E6C");
                } else {
                    this.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2B7D2B");
                }

                /*	if (oInforme.RegistroDescarga) {
                    this.getJsonModel("Indicadores").setProperty("/DescargaColor", "#2B7D2B");
                    this.getJsonModel("Indicadores").setProperty("/DescargaTexto", "Registrado");

                } else {
                    this.getJsonModel("Indicadores").setProperty("/DescargaColor", "#BB0000");
                    this.getJsonModel("Indicadores").setProperty("/DescargaTexto", "No Registrado");
                } */

                if (oInforme.RegistroCombustible === "2") {
                    this.getJsonModel("Indicadores").setProperty("/CombustibleColor", "#2B7D2B");
                    this.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "Registrado");
                } else {
                    this.getJsonModel("Indicadores").setProperty("/CombustibleColor", "#BB0000");
                    this.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "No Registrado");
                }

                // console.log(oInforme);

                this._byId("iconEstadoInforme").setVisible(!bInit);
                this._byId("iconDescarga").setVisible(!bInit);
                this._byId("iconCombustible").setVisible(!bInit);
                if (bInit) {
                    this.getJsonModel("Indicadores").setProperty("/EstadoColor", "");
                    this.getJsonModel("Indicadores").setProperty("/DescargaColor", "");
                    this.getJsonModel("Indicadores").setProperty("/DescargaTexto", "");
                    this.getJsonModel("Indicadores").setProperty("/CombustibleColor", "");
                    this.getJsonModel("Indicadores").setProperty("/CombustibleTexto", "");
                }

                //Datos de Operación

                if (oInforme.IndicadorZarpe !== "") {
                    this.getJsonModel("Zarpe").setProperty("/Estado", true);
                } else {
                    this.getJsonModel("Zarpe").setProperty("/Estado", false);
                }

                //Datos de pesca
                if (oInforme.IndicadorPesca !== "") {
                    this._byId("cbxCausaNoPesca").setEnabled(false);
                    this.getJsonModel("Pesca").setProperty("/Estado", true);
                } else {
                    this._byId("cbxCausaNoPesca").setSelectedKey(oInforme.CausaNoPesca);
                    this._byId("cbxCausaNoPesca").setEnabled(true);
                    this.getJsonModel("Pesca").setProperty("/Estado", false);
                }

                //Validando que no muestren campos 0000000
                var aHoras = [
                    "HoraArribo",
                    "HoraCrea",
                    "HoraFinDesc",
                    "HoraFinZonaPesca",
                    "HoraIniDesc",
                    "HoraIniZonaPesca",
                    "HoraModif",
                    "HoraZarpe",
                ];

                for (var i = 0, n = aHoras.length; i < n; i++) {
                    if (oInforme[aHoras[i]] === "00:00:00") {
                        oInforme[aHoras[i]] = "";
                    }
                }

                //Operacion - RSW
                var iRsw = 0;
                var bVerify = false;
                var oModelListRsw = this.getOwnerComponent().getModel("listRsw");
                var oDataListRsw = JSON.parse(oModelListRsw.getJSON());

                switch (oInforme["Condiciones"]) {
                    case "OPER":
                        iRsw = 0;
                        break;
                    case "OPER_LIM":
                        iRsw = 1;
                        break;
                    case "INOPER":
                        iRsw = 2;
                        break;
                    default:
                }

                this.getView().byId("rbgRSW").setSelectedIndex(iRsw);

                $.each(oDataListRsw.listRsw, function (key, value) {
                    if (oInforme["Centro"] === value) {
                        bVerify = true;
                        return false;
                    }
                });

                if (bVerify) {
                    this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", true);
                } else {
                    this.getJsonModel("InformeFlota").setProperty("/bVisibleRSW", false);
                }

                if (iRsw === 1) {
                    this.byId("txtOperativoLim").setVisible(true);
                    this.byId("txtOperativoLim").setValue(oInforme["NotasRSW"]);
                } else {
                    this.byId("txtOperativoLim").setVisible(false);
                    this.byId("txtOperativoLim").setValue("");
                }

                this.setJsonModel(oInforme, "InformeFlota", false);
                //Combustible

                if (oInforme.StockZarpe.length === 0) {
                    oInforme.StockZarpe = "0";
                }
                if (oInforme.AbastFaena.length === 0) {
                    oInforme.AbastFaena = "0";
                }
                if (oInforme.StockArribo.length === 0) {
                    oInforme.StockArribo = "0";
                }
                if (oInforme.StockFinDescarga.length === 0) {
                    oInforme.StockFinDescarga = "0";
                }
                if (oInforme.AbastDescarga.length === 0) {
                    oInforme.AbastDescarga = "0";
                }

                var fStockZarpe = parseFloat(oInforme.StockZarpe.replace(",", ""));
                var fAbastFaena = parseFloat(oInforme.AbastFaena.replace(",", ""));
                var fStockArribo = parseFloat(oInforme.StockArribo.replace(",", ""));

                var fStockFinDescarga = parseFloat(oInforme.StockFinDescarga.replace(",", ""));
                var fAbastDescarga = parseFloat(oInforme.AbastDescarga.replace(",", ""));

                var aConsumoFaena = fStockZarpe + fAbastFaena - fStockArribo;
                var aConsumoDescarga = fStockArribo - fStockFinDescarga + fAbastDescarga;
                this._byId("inpConsumoFaena").setValue(Util.addZeroes(String(aConsumoFaena)));
                this._byId("inpConsumoDescarga").setValue(Util.addZeroes(String(aConsumoDescarga)));

                //Tripulación
                Util.readInformeEntity("Tripulacion", "?$filter=Numinforme eq '" + oInforme.Numero + "'", bInit, this);

                if (this.oViewTripTemplate) {
                    this.rebindTable(
                        this._byId("tblTripulacion"),
                        "TripulacionSet>/d/results",
                        [new Filter("Numinforme", "EQ", oInforme.Numero)],
                        this.oViewTripTemplate,
                        "Navigation"
                    );
                }

                //Horómetros
                Util.readInformeEntity("Horometro", "?$filter=Numinforme eq '" + oInforme.Numero + "'", bInit, this);
                if (this.oViewHorometerTemplate) {
                    this.rebindTable(
                        this._byId("tblHorometro"),
                        "HorometroSet>/d/results",
                        [new Filter("Numinforme", "EQ", oInforme.Numero)],
                        this.oViewHorometerTemplate,
                        "Navigation"
                    );
                }
                //Calas
                Util.readInformeEntity("Calas", "?$filter=Numinf eq '" + oInforme.Numero + "'", bInit, this);

                if (this.oViewCalasTemplate) {
                    this.rebindTable(
                        this._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", oInforme.Numero)],
                        this.oViewCalasTemplate,
                        "Navigation"
                    );
                }
                this.CalasModel.refresh(true);

                this.util.obtenerPlantilla(oInforme.Centro, oInforme.Especie, oInforme.TipoRed, "Navigation", this);
                // if (oInforme.TipoRed === "03") {
                // 	//Plantilla Calas 2
                // 	Calas.bindColumns("CalasPlantilla2>/", this.oColsCalaPlantilla2, this);
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", oInforme.Numero)], this.oViewCalasPlantilla2,
                // 		"Navigation");
                // } else if (oInforme.TipoRed.IdTipoRed === "04") {
                // 	//Plantilla Calas 3
                // 	Calas.bindColumns("CalasPlantilla3>/", this.oColsCalaPlantilla3, this);
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", oInforme.Numero)], this.oViewCalasPlantilla3,
                // 		"Navigation");
                // } else {
                // 	//Plantilla Calas 1
                // 	Calas.bindColumns("CalasPlantilla1>/", this.oColsCalaPlantilla1, this);
                // 	this.rebindTable(this._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", oInforme.Numero)], this.oViewCalasPlantilla1,
                // 		"Navigation");
                // }

                // Validación para las columnas
                if (that.oInforme.Especie == "16000002") {
                    Util.esconderColumna(true, that);
                } else {
                    Util.esconderColumna(false, that);
                }

                Util.esconderFechayHora(false, that);
                Util.setNombreColumna(that);

                //Comp. Especie
                Util.readInformeEntity("CompEspecie", "?$filter=Numinforme eq '" + oInforme.Numero + "'", bInit, this);

                //Muestreos
                Util.readInformeEntity("MuestreoCala", "?$filter=Numinforme eq '" + oInforme.Numero + "'", bInit, this);

                //Tallas
                Util.readInformeEntity("LongCalas", "?$filter=Numinforme eq '" + oInforme.Numero + "'", bInit, this);

                //Log ticket
                if (!bInit)
                    Util.readInformeEntity(
                        "LogTicket",
                        "?$filter=Numinforme eq '" + oInforme.Numero + "'",
                        bInit,
                        this
                    );

                //Descarga
                //Cliente

                var aCliente = this.getJsonModel("ClienteSet").getData().d.results;
                var numCliente = Util.binarySearch(aCliente, oInforme.Cliente, "Numero");
                if (numCliente !== -1) {
                    this._byId("txtCliente").setText(aCliente[numCliente]["Nombre"]);
                    this._byId("feTxtCliente").setVisible(true);
                } else {
                    this._byId("feTxtCliente").setVisible(false);
                }

                //Puertos
                this._byId("txtPuertoZarpe").setText("");
                var oPtoZarpe = Puertos.getPuertoTxt(oInforme.PtoZarpe, this);
                if (oPtoZarpe.Puerto) this._byId("txtPuertoZarpe").setText(oPtoZarpe.Puerto.Nombre);

                this._byId("txtPuertoArribo").setText("");
                var oPuertoArribo = Puertos.getPuertoTxt(oInforme.PuertoArribo, this);
                if (oPuertoArribo.Puerto) this._byId("txtPuertoArribo").setText(oPuertoArribo.Puerto.Nombre);

                if (oInforme.Tipo === "T") {
                    this._byId("cbxInformativo").setEditable(true);
                } else {
                    this._byId("cbxInformativo").setSelected(false);
                    this._byId("cbxInformativo").setEditable(false);
                }

                if (oInforme.Tipo !== "P") {
                    this._byId("feCentro").setVisible(false);
                    this._byId("itfHorometro").setVisible(false);
                    this._byId("feEmisor").setVisible(true);
                } else {
                    this._byId("feCentro").setVisible(true);
                    this._byId("itfHorometro").setVisible(false);
                    this._byId("feEmisor").setVisible(false);
                }
                /*
            if (oInforme.Tipo === "M") {
                this._byId("feEmpMaquila").setVisible(true);
            } else {
                this._byId("feEmpMaquila").setVisible(false);
            } */

                //Guardar data del informe localmente
                //Util.saveEntity("InformeFlota", JSON.stringify(oInforme), '');
                //this._byId("dpInforme").setBusy(false);

                if (!bInit) {
                    this._byId("btnNewInforme").setVisible(true);
                }

                if (oInforme.Estado === "CRE") {
                    this.ocultarBotones("DESAPRO");
                } else if (oInforme.Estado === "AJF") {
                    this._byId("btnEditarInforme").setVisible(false);
                } else if (oInforme.Estado === "AOP") {
                    this.ocultarBotones("DESAPRO");
                }

                var sBoton = oInforme.Botones;
                if (sBoton.length) {
                    if (sBoton.charAt(0) === "1") {
                        this._byId("btnEditarInforme").setVisible(true);
                    } else {
                        this._byId("btnEditarInforme").setVisible(false);
                    }
                }

                if (oInforme.FecIniZonaPesca === "" && oInforme.HoraIniZonaPesca === "") {
                    this.getView().byId("inpLlegadaZonaPesca").setValue("");
                }
                if (oInforme.FecFinZonaPesca === "" && oInforme.HoraFinZonaPesca === "") {
                    this.getView().byId("inpSalidaPesca").setValue("");
                }
                if (oInforme.FechaZarpe === "" && oInforme.HoraZarpe === "") {
                    this.getView().byId("inpZarpe").setValue("");
                }
                if (oInforme.FechaArribo === "" && oInforme.HoraArribo === "") {
                    this.getView().byId("inpArribo").setValue("");
                }
                if (oInforme.FechaIniDesc === "" && oInforme.HoraIniDesc === "") {
                    this.getView().byId("inpDescarga").setValue("");
                }
                if (oInforme.FechaFinDesc === "" && oInforme.HoraFinDesc === "") {
                    this.getView().byId("inpDescarga2").setValue("");
                }
            },

            //Tickets
            // eslint-disable-next-line no-unused-vars
            onPressTicket: function (oEvent) {
                if (!this._ticketDialog) {
                    this._ticketDialog = sap.ui.xmlfragment(
                        "Hayduk.InformeDeFlota.view.fragments.informatives.Tickets",
                        this
                    );
                    this.getView().addDependent(this._ticketDialog);
                }
                this._byId("tblTicket").getModel("LogTicketSet").refresh();
                this._ticketDialog.open();
            },

            onCloseTickets: function () {
                this._ticketDialog.close();
            },

            //Datos de gestión
            // eslint-disable-next-line no-unused-vars
            onPressDatosGestion: function (oEvent) {
                if (!this._gestionDialog) {
                    this._gestionDialog = sap.ui.xmlfragment(
                        "Hayduk.InformeDeFlota.view.fragments.informatives.DatosGestion",
                        this
                    );
                    this.getView().addDependent(this._gestionDialog);
                }
                this._gestionDialog.open();
            },

            // eslint-disable-next-line no-unused-vars
            onCloseGestion: function (oEvent) {
                this._gestionDialog.close();
            },

            //Tiempos
            // eslint-disable-next-line no-unused-vars
            onPressTiempos: function (oEvent) {
                if (!this._tiemposDialog) {
                    this._tiemposDialog = sap.ui.xmlfragment(
                        "Hayduk.InformeDeFlota.view.fragments.informatives.Tiempos",
                        this
                    );
                    this.getView().addDependent(this._tiemposDialog);
                }
                this._tiemposDialog.open();
            },

            // eslint-disable-next-line no-unused-vars
            onCloseTiempos: function (oEvent) {
                this._tiemposDialog.close();
            },

            //Lectura Storage
            // eslint-disable-next-line no-unused-vars
            onCheckStorage: function (oEvent) {
                var that = this;
                var indexedDB = Util.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readonly");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var getEntidades = store.getAll();

                        getEntidades.onsuccess = function () {
                            if (getEntidades.result.length !== 0) {
                                //console.log(getEntidades.result);
                                Util.updStorageInfo(getEntidades.result, that);
                            }
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            Util.openStorageDialog(that);
                            db.close();
                        };
                    };
                }
            },

            // eslint-disable-next-line no-unused-vars
            onDownloadData: function (oEvent) {
                var that = this;
                var sService = Models.getService();
                var oPage = this._byId("dpInforme");
                sap.m.MessageBox.confirm(
                    "¿Desea actualizar el Almacenamiento Local? Esta actividad puede tardar unos minutos",
                    {
                        title: "Actulizar Datos",
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                // console.log(that.aEntities);
                                oPage.setBusy(true);
                                that._configDialog.setBusy(true);
                                that.allLoadDataMaestraFalse();
                                for (var i = 0; that.aEntities.length > i; i++) {
                                    //console.log(that.aEntities[i]);
                                    if (that.aEntities[i] !== "HorometroDefault") {
                                        if (
                                            that.aEntities[i] !== "Cliente" &&
                                            that.aEntities[i] !== "Emisor" &&
                                            that.aEntities[i] !== "Matricula"
                                        ) {
                                            that[that.aEntities[i] + "Model"].loadData(
                                                sService + that.aEntities[i] + "Set"
                                            );
                                        } else {
                                            if (that.aEntities[i] === "Cliente") {
                                                that.aClientesMerge = [];
                                            }
                                            if (that.aEntities[i] === "Emisor") {
                                                that.aEmisorMerge = [];
                                            }
                                            if (that.aEntities[i] === "Matricula") {
                                                that.aMatriculaMerge = [];
                                            }
                                            that.util.deleteEntidad(that.aEntities[i], sService, that);
                                        }
                                    } else {
                                        that[that.aEntities[i] + "Model"].loadData(sService + "HorometroSet");
                                    }
                                }
                            }
                        },
                    }
                );
            },

            onRefreshData: function () {
                var that = this;
                var indexedDB = Util.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readonly");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var getEntidades = store.getAll();

                        getEntidades.onsuccess = function () {
                            if (getEntidades.result.length !== 0) {
                                Util.updStorageInfo(getEntidades.result, that);
                            } else {
                                Util.updStorageInfo([], that);
                            }
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            onSelectTipoInforme: function (oEvent) {
                if (oEvent.getParameter("selectedItem")) {
                    var sTipoInforme = oEvent
                        .getParameter("selectedItem")
                        .getBindingContext("TipoInformeSet")
                        .getObject().IdTipoInforme;
                    var sEspecie = this.getJsonModel("InformeFlota").getProperty("/Especie");

                    if (sTipoInforme === "T") {
                        this._byId("cbxInformativo").setEditable(true);
                    } else {
                        this._byId("cbxInformativo").setSelected(false);
                        this._byId("cbxInformativo").setEditable(false);
                    }
                    /*
                if (sTipoInforme === "M") {
                    this._byId("feEmpMaquila").setVisible(true);
                } else {
                    this._byId("feEmpMaquila").setVisible(false);
                } */

                    if (sTipoInforme === "P") {
                        this._byId("feCentro").setVisible(true);
                        this._byId("inpMatricula").setEditable(false);
                        this._byId("itfHorometro").setVisible(false);
                        this._byId("feEmisor").setVisible(false);
                    } else {
                        this._byId("inpCentro").setValue("");
                        this._byId("feCentro").setVisible(false);
                        this._byId("itfHorometro").setVisible(false);
                        this._byId("feEmisor").setVisible(true);
                        //console.log(sEspecie);
                        if (sEspecie.length) {
                            this._byId("inpMatricula").setEditable(true);
                            this.getJsonModel("InformeFlota").setProperty("/Matricula", "");
                            this.getJsonModel("InformeFlota").setProperty("/Embarcacion", "");
                            this.getJsonModel("InformeFlota").setProperty("/Capacidad", "0.000");
                        } else {
                            this._byId("inpMatricula").setEditable(false);
                            this.getJsonModel("InformeFlota").setProperty("/Matricula", "");
                            this.getJsonModel("InformeFlota").setProperty("/Embarcacion", "");
                            this.getJsonModel("InformeFlota").setProperty("/Capacidad", "0.000");
                        }
                    }
                }
            },

            onChangeTipoInforme: function (oEvent) {
                var oCbxTipoInf = oEvent.getSource();
                var sKey = oCbxTipoInf.getSelectedKey();
                if (!sKey) {
                    oCbxTipoInf.setValueState(sap.ui.core.ValueState.Error);
                } else {
                    oCbxTipoInf.setValueState(sap.ui.core.ValueState.None);
                }
            },

            // eslint-disable-next-line no-unused-vars
            saveInforme: function (oEvent) {
                var that = this;
                var oData = this.getTodoInforme();
                delete oData.DatosGenerales.bVisibleRSW;
                var bIndZarpe = this._byId("cbZarpe").getState();
                var bIndPesca = this._byId("cbPesca").getState();
                this.aSaveWarning = [];
                var existeGUID = this.existeGUID();
                if (existeGUID) oData.GUID = this.guid();

                function Save() {
                    that._byId("dpInforme").setBusy(true);
                    delete oData.DatosGenerales["__metadata"];

                    //Limpieza de calas
                    var oCalasCampos = {};
                    var sTipoRed = oData.DatosGenerales.TipoRed;

                    if (sTipoRed === "03") {
                        //Plantilla Calas 2
                        oCalasCampos = that.oCalas2;
                    } else if (sTipoRed === "04") {
                        //Plantilla Calas 3
                        oCalasCampos = that.oCalas3;
                    } else {
                        //Plantilla Calas 1
                        oCalasCampos = that.oCalas1;
                    }

                    for (var i = 0; oData.Calas.length > i; i++) {
                        var oCala = oData.Calas[i];
                        delete oCala["__metadata"];

                        for (var key in oCala) {
                            if (Object.prototype.hasOwnProperty.call(oCala, key)) {
                                // eslint-disable-next-line no-empty
                                if (key === "Numinf" || key === "Ernam") {
                                } else if (key in oCalasCampos === false) {
                                    if (oCala[key] === "") {
                                        oCala[key] = "";
                                    }
                                }
                            }
                        }
                    }

                    for (i = 0; oData.Tripulacion.length > i; i++) {
                        var oTripulante = oData.Tripulacion[i];
                        delete oTripulante["__metadata"];
                        delete oTripulante["Matricula"];
                    }

                    Util.cleanArrays(oData.HojasMuestreo, "__metadata");
                    Util.cleanArrays(oData.Horometros, "__metadata");

                    if (bIndZarpe) {
                        oData.DatosGenerales.MotivoNoZarpe = "";
                        oData.DatosGenerales.CausaNoZarpe = "";
                    } else {
                        oData.Calas = [];
                        oData.HojasMuestreo = [];
                        oData.LongCalas = [];
                        that._byId("txtPuertoZarpe").setText("");
                        oData.DatosGenerales.TipoRed = "";
                        oData.DatosGenerales.MotivoZarpe = "";
                        oData.DatosGenerales.PtoZarpe = "";
                        // oData.DatosGenerales.FechaZarpe = "";
                        // oData.DatosGenerales.HoraZarpe = "";
                    }

                    if (bIndPesca) {
                        oData.DatosGenerales.CausaNoPesca = "";
                    }

                    // console.log(oData);

                    //Se cambia el formato de la fecha de yyyy-mm-dd a dd/mm/yyyy
                    // eslint-disable-next-line no-redeclare
                    for (var i = 0, n = oData.Calas.length; i < n; i++) {
                        // Fechas
                        oData.Calas[i].Feccal1 = Util.newFormatDate(oData.Calas[i].Feccal1);
                        oData.Calas[i].Feccal2 = Util.newFormatDate(oData.Calas[i].Feccal2);
                        oData.Calas[i].Fecsal = Util.newFormatDate(oData.Calas[i].Fecsal);
                        oData.Calas[i].Fecvirado = Util.newFormatDate(oData.Calas[i].Fecvirado);
                        oData.Calas[i].Fecvirado2 = Util.newFormatDate(oData.Calas[i].Fecvirado2);

                        // Horas
                        oData.Calas[i].Horcal1 = Util.newFormatHour(oData.Calas[i].Horcal1);
                        oData.Calas[i].Horcal2 = Util.newFormatHour(oData.Calas[i].Horcal2);
                        oData.Calas[i].Horsal = Util.newFormatHour(oData.Calas[i].Horsal);
                        oData.Calas[i].Horvirado = Util.newFormatHour(oData.Calas[i].Horvirado);
                        oData.Calas[i].Horvirado2 = Util.newFormatHour(oData.Calas[i].Horvirado2);

                        //Nueva validación para la columna "%Juv C"
                        // if (oData.DatosGenerales.Centro !== "H307" && oData.DatosGenerales.Especie === "16000018") {
                        // 	oData.Calas[i].Juven_Caba = oData.Calas[i].Juven_Jure;
                        // 	oData.Calas[i].Juven_Jure = "";
                        // }
                    }

                    var oModel = new JSONModel([{ flag: true }]);
                    that.getView().setModel(oModel, "flagEdit");

                    var calasPost = that.getView().getModel("calasPost").getData();

                    $.each(oData.Calas, function (k, v) {
                        if (calasPost.length > 0) {
                            if (calasPost[k] != undefined) {
                                v.Juven_Jure = calasPost[k].Juven_Jure;
                                v.Juven_Anch = calasPost[k].Juven_Anch;
                                v.Juven_Merl = calasPost[k].Juven_Merl;
                            }
                        }
                    });

                    var oCalasPostModel = new JSONModel([]);
                    that.getView().setModel(oCalasPostModel, "calasPost");

                    that.sendInformeData("/InformeFlotaDeepSet", oData, false, "", that);
                }

                var bNoError = true;

                if (!oData.DatosGenerales.Tipo.length) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe seleccionar un tipo de informe.",
                        description: "",
                    });
                }

                if (oData.DatosGenerales.Tipo === "P" && !oData.DatosGenerales.Centro.length) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe especificar un centro.",
                        description: "",
                    });
                }

                if (!oData.DatosGenerales.Matricula.length) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe ingresar una matrícula.",
                        description: "",
                    });
                }

                var oDateFecZarpe = Util.getDateObjectValue(
                    oData.DatosGenerales.FechaZarpe,
                    oData.DatosGenerales.HoraZarpe,
                    "/",
                    ":"
                );
                var oDateLlegadaPesca = Util.getDateObjectValue(
                    oData.DatosGenerales.FecIniZonaPesca,
                    oData.DatosGenerales.HoraIniZonaPesca,
                    "/",
                    ":"
                );
                var oDateSalidaPesca = Util.getDateObjectValue(
                    oData.DatosGenerales.FecFinZonaPesca,
                    oData.DatosGenerales.HoraFinZonaPesca,
                    "/",
                    ":"
                );

                if (oDateFecZarpe && oDateLlegadaPesca && bIndZarpe) {
                    if (oDateLlegadaPesca <= oDateFecZarpe) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "La fecha de llegada a la zona de pesca debe ser mayor a la fecha de zarpe.",
                            description: "",
                        });
                    }
                }

                if (oDateSalidaPesca && oDateLlegadaPesca && bIndPesca) {
                    if (oDateLlegadaPesca >= oDateSalidaPesca) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "La fecha de salida a la zona de pesca debe ser mayor a la fecha de llegada.",
                            description: "",
                        });
                    }
                }

                var oDateArribo = Util.getDateObjectValue(
                    oData.DatosGenerales.FechaArribo,
                    oData.DatosGenerales.HoraArribo,
                    "/",
                    ":"
                );
                var oDateDesc1 = Util.getDateObjectValue(
                    oData.DatosGenerales.FechaIniDesc,
                    oData.DatosGenerales.HoraIniDesc,
                    "/",
                    ":"
                );
                var oDateDesc2 = Util.getDateObjectValue(
                    oData.DatosGenerales.FechaFinDesc,
                    oData.DatosGenerales.HoraFinDesc,
                    "/",
                    ":"
                );

                if (oDateArribo && oDateSalidaPesca) {
                    if (oDateArribo <= oDateSalidaPesca) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "La fecha de arribo debe ser mayor a la fecha de salida de zona de pesca.",
                            description: "",
                        });
                    }
                }

                if (oDateArribo && oDateDesc1) {
                    if (oDateArribo >= oDateDesc1) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "La fecha de descarga debe ser mayor a la fecha de arribo.",
                            description: "",
                        });
                    }
                }

                if (oDateDesc1 && oDateDesc2) {
                    if (oDateDesc1 >= oDateDesc2) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "La fecha de fin de descarga debe ser mayor a la fecha de inicio.",
                            description: "",
                        });
                    }
                }

                //Validar Tripulación
                var bPatron1 = false,
                    bPatron2 = false;
                for (var i = 0; oData.Tripulacion.length > i; i++) {
                    var oTripulante = oData.Tripulacion[i];
                    if (oTripulante.Cargo === "PA1" || oTripulante.Cargo === "PR1" || oTripulante.Cargo === "PR2") {
                        bPatron1 = true;
                    }

                    if (oTripulante.Cargo === "PA2" || oTripulante.Cargo === "PS1" || oTripulante.Cargo === "PS2") {
                        bPatron2 = true;
                    }
                }

                //Para el caso de informes de flota de la especie atún 16000002 no debe validar segundo patrón
                if (oData.DatosGenerales.Especie === "16000002") {
                    bPatron2 = true;
                }

                if (!bPatron1) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe haber al menos un Patrón por Embarcación.",
                        subtitle: "",
                        description: "",
                    });
                }

                if (!bPatron2) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe haber al menos un Segundo Patrón por Embarcación.",
                        subtitle: "",
                        description: "",
                    });
                }

                var bTripWhite = Util.detectWhitePropArray(oData.Tripulacion, ["Cargo", "Dni", "Cargodesc", "Nombre"]);

                if (bTripWhite) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Campos vacíos en Tripulación.",
                        description: "",
                    });
                }

                //Validar  Calas
                if (oData.Calas.length && !oData.DatosGenerales.TipoRed.length) {
                    bNoError = false;
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Debe seleccionar un tipo de red para las calas.",
                        description: "",
                    });
                }

                var aCalasError = [];
                // eslint-disable-next-line no-redeclare
                for (var i = 0; oData.Calas.length > i; i++) {
                    var oCala = oData.Calas[i];
                    var oDateInicio;
                    var oDateFin;
                    var bCalaOk = true;
                    var aCalaErr = [];
                    var sDateIni = "",
                        sDateFin = "",
                        sHoraIni = "",
                        sHoraFin = "",
                        oDateFormat;

                    sDateIni = oCala.Feccal1;
                    sDateFin = oCala.Feccal2;
                    sHoraIni = oCala.Horcal1;
                    sHoraFin = oCala.Horcal2;
                    // Nueva validación por el formato de la fecha y hora
                    if (oCala.Feccal1.length === 8 || oCala.Horcal1.length === 6) {
                        oDateFormat = Util.formatDateAndHour(oCala.Feccal1, oCala.Horcal1);
                        sDateIni = oDateFormat.date;
                        sHoraIni = oDateFormat.time;

                        oDateInicio = Util.getDateObjectValue2(sDateIni, sHoraIni, "-", ":");
                    } else {
                        oDateInicio = Util.getDateObjectValue2(oCala.Feccal1, oCala.Horcal1, "-", ":");
                    }
                    if (oCala.Feccal2.length === 8 || oCala.Horcal2.length === 6) {
                        oDateFormat = Util.formatDateAndHour(oCala.Feccal2, oCala.Horcal2);
                        sDateFin = oDateFormat.date;
                        sHoraFin = oDateFormat.time;

                        oDateFin = Util.getDateObjectValue2(sDateFin, sHoraFin, "-", ":");
                    } else {
                        oDateFin = Util.getDateObjectValue2(oCala.Feccal2, oCala.Horcal2, "-", ":");
                    }

                    if (i === 0 && oDateLlegadaPesca) {
                        if (oDateLlegadaPesca >= oDateInicio) {
                            bNoError = false;
                            aCalaErr.push(
                                "-Fecha de llegada a zona de pesca mayor o igual que inicio de primera cala<br>Fecha llegada  zona pesca: " +
                                oData.DatosGenerales.FecIniZonaPesca +
                                " " +
                                oData.DatosGenerales.HoraIniZonaPesca +
                                " - Fecha inicio cala: " +
                                sDateIni +
                                " " +
                                sHoraIni
                            );
                        }
                    }

                    if (oDateInicio && oDateFin && oDateInicio >= oDateFin) {
                        bNoError = false;
                        aCalaErr.push(
                            "-Fecha de inicio mayor o igual que fecha de fin<br>Fecha inicio cala: " +
                            sDateIni +
                            " " +
                            sHoraIni +
                            " - Fecha fin cala: " +
                            sDateFin +
                            " " +
                            sHoraFin
                        );
                    }

                    if (i > 0) {
                        var oCalaAnt = oData.Calas[i - 1];
                        var oDataFinAnterior = Util.getDateObjectValue2(oCalaAnt.Feccal2, oCalaAnt.Horcal2, "-", ":");
                        if (oDataFinAnterior >= oDateInicio) {
                            bNoError = false;
                            aCalaErr.push(
                                "-Fecha de inicio menor o igual que fin de cala anterior<br>Fecha inicio cala: " +
                                oCala.Feccal1 +
                                " " +
                                oCala.Horcal1 +
                                " - Fecha fin cala anterior: " +
                                oCalaAnt.Feccal2 +
                                " " +
                                oCalaAnt.Horcal2
                            );
                        }
                    }

                    if (i === oData.Calas.length - 1) {
                        if (oDateFin >= oDateSalidaPesca) {
                            bNoError = false;
                            aCalaErr.push(
                                "-Fecha de salida de zona de pesca menor o igual que fin de última cala<br>Fecha salida zona pesca: " +
                                oData.DatosGenerales.FecFinZonaPesca +
                                " " +
                                oData.DatosGenerales.HoraFinZonaPesca +
                                " - Fecha fin cala: " +
                                sDateFin +
                                " " +
                                sHoraFin
                            );
                        }
                    }

                    //Validar latitudes longitudes
                    if (isNaN(parseInt(oCala.Latgra, 0))) {
                        bNoError = false;
                        aCalaErr.push("-Latitud en grados no válida");
                    } else {
                        var iLatGra = parseInt(oCala.Latgra, 0);
                        if (iLatGra < 0 || iLatGra > 90) {
                            bNoError = false;
                            aCalaErr.push("-Latitud en grados fuera de rango 0 - 90");
                        }
                    }

                    if (isNaN(parseInt(oCala.Latmin, 0))) {
                        bNoError = false;
                        aCalaErr.push("-Latitud en minutos no válida");
                    } else {
                        var iLatmin = parseInt(oCala.Latmin, 0);
                        if (iLatmin < 0 || iLatmin > 59) {
                            bNoError = false;
                            aCalaErr.push("-Latitud en minutos fuera de rango 0 - 59");
                        }
                    }

                    if (isNaN(parseInt(oCala.Longra, 0))) {
                        bNoError = false;
                        aCalaErr.push("-Longitud en grados no válida");
                    } else {
                        var iLongra = parseInt(oCala.Longra, 0);
                        if (iLongra < 0 || iLongra > 180) {
                            bNoError = false;
                            aCalaErr.push("-Longitud en grados fuera de rango 0 - 180");
                        }
                    }

                    if (isNaN(parseInt(oCala.Lonmin, 0))) {
                        bNoError = false;
                        aCalaErr.push("-Longitud en minutos no válida");
                    } else {
                        var iLonmin = parseInt(oCala.Lonmin, 0);
                        if (iLonmin < 0 || iLonmin > 59) {
                            bNoError = false;
                            aCalaErr.push("-Longitud en minutos fuera de rango 0 - 59");
                        }
                    }
                    bCalaOk = bNoError;
                    if (!bCalaOk) {
                        aCalaErr.unshift("<strong>N° " + oCala.Numcala + "</strong>");
                        aCalasError.push(aCalaErr.join("<br>"));
                    }
                }

                if (oData.Calas.length && !bNoError) {
                    this.aSaveWarning.push({
                        type: "Error",
                        title: "Errores en calas.",
                        subtitle: "Click para más información",
                        description: aCalasError.join("<br><br>"),
                    });
                }

                 //Validar Pestaña Operaciones - RSW
                var bVerify = false,
                    oModelListRsw = this.getOwnerComponent().getModel("listRsw"),
                    oDataListRsw = JSON.parse(oModelListRsw.getJSON()),
                    iRSW = this.getView().byId("rbgRSW").getSelectedIndex(),
                    sCondicion = "",
                    sNotasRSW = "";

                $.each(oDataListRsw.listRsw, function (key, value) {
                    if (oData.DatosGenerales.Centro === value) {
                        bVerify = true;
                        return false;
                    }
                });

                if (bVerify) {
                    if (isNaN(iRSW) || iRSW === -1) {
                        bNoError = false;
                        this.aSaveWarning.push({
                            type: "Error",
                            title: "Debe seleccionar la condición de la pestaña RSW.",
                            description: "• Operativo<br>• Operativo con Limitaciones<br>• Inoperativo",
                        });
                    } else {
                        switch (iRSW) {
                            case 0:
                                sCondicion = "OPER";
                                break;
                            case 1:
                                sCondicion = "OPER_LIM";
                                sNotasRSW = this.byId("txtOperativoLim").getValue();
                                break;
                            case 2:
                                sCondicion = "INOPER";
                                break;
                            default:
                        }
                        oData.DatosGenerales.NotasRSW = sNotasRSW;
                    }
                }

                oData.DatosGenerales.Condiciones = sCondicion;

                var bPropWhites = this.validarInforme(oData);

                if (!bPropWhites && !bNoError) {
                    sap.m.MessageBox.confirm("¿Desea guardar el Informe de Flota?", {
                        title: "Guardar Informe de Flota",
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                // Evitar que se presione múltiples veces
                                if (this._saveButtonPressed) {
                                    return;
                                }
                                sap.ui.core.BusyIndicator.show(0);
                                this._saveButtonPressed = true;

                                Save(); // Guardar Informe de Flota
                            }
                        },
                    });
                } else {
                    var oSaveWarningModel = this.getJsonModel("SaveWarningSet");
                    var oMessageView = new sap.m.MessageView({
                        showDetailsPageHeader: false,
                        itemSelect: function () {
                            oBackButton.setVisible(true);
                        },
                        items: {
                            path: "/results",
                            template: new sap.m.MessageItem({
                                type: "{type}",
                                title: "{title}",
                                description: "{description}",
                                subtitle: "{subtitle}",
                                markupDescription: true,
                            }),
                        },
                    }),
                        oBackButton = new sap.m.Button({
                            icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                            visible: false,
                            press: function () {
                                oMessageView.navigateBack();
                                this.setVisible(false);
                            },
                        });

                    oMessageView.setModel(oSaveWarningModel);

                    var sState;
                    if (bNoError) {
                        sState = "Warning";
                    } else {
                        sState = "Error";
                    }

                    this.oDialogWarnings = new sap.m.Dialog({
                        resizable: false,
                        content: oMessageView,
                        state: sState,
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Accept,
                            visible: bNoError,
                            press: function () {
                                // Evitar que se presione múltiples veces
                                this.setEnabled(false);
                                if (this._saveButtonPressed) {
                                    return;
                                }
                                sap.ui.core.BusyIndicator.show(0);
                                this._saveButtonPressed = true;

                                Save(); // Guardar Informe de Flota
                                this.getParent().close();
                            },
                            icon: "sap-icon://save",
                            text: "Guardar",
                        }),
                        endButton: new sap.m.Button({
                            press: function () {
                                this.getParent().close();
                            },
                            text: "Cancelar",
                        }),
                        customHeader: new sap.m.Bar({
                            contentMiddle: [
                                new sap.m.Title({
                                    text: "Guardar Informe de Flota",
                                    titleStyle: "H4",
                                }),
                            ],
                            contentLeft: [oBackButton],
                        }),
                        contentHeight: "30%",
                        contentWidth: "30%",
                        verticalScrolling: false,
                    });
                    this.oDialogWarnings.addStyleClass("sapUiSizeCompact");
                    this.oDialogWarnings.open();
                }
            },

            actualDataAfterSave: function (data, bSuccess, that) {
                if (data.Numero.length) that.getJsonModel("InformeFlota").setProperty("/Numero", data.Numero);

                that.getJsonModel("InformeFlota").setProperty("/Estado", data.DatosGenerales.Estado);
                that.getJsonModel("InformeFlota").setProperty("/EstadoDesc", data.DatosGenerales.EstadoDesc);
                that.getJsonModel("InformeFlota").setProperty("/Botones", data.DatosGenerales.Botones);

                //Datos de auditoria
                var oCrea = Util.formatDate(data.DatosGenerales.FechaCrea, data.DatosGenerales.HoraCrea);

                if (oCrea.date) {
                    that.getJsonModel("InformeFlota").setProperty("/FechaCrea", data.DatosGenerales.FechaCrea);
                }

                if (oCrea.time) {
                    that.getJsonModel("InformeFlota").setProperty("/HoraCrea", data.DatosGenerales.HoraCrea);
                }

                that.getJsonModel("InformeFlota").setProperty("/UserCrea", data.DatosGenerales.UserCrea);

                var oModif = Util.formatDate(data.DatosGenerales.FechaModif, data.DatosGenerales.HoraModif);
                //console.log(oModif);
                if (oModif.date) {
                    that.getJsonModel("InformeFlota").setProperty("/FechaModif", data.DatosGenerales.FechaModif);
                }

                if (oModif.time) {
                    that.getJsonModel("InformeFlota").setProperty("/HoraModif", data.DatosGenerales.HoraModif);
                }

                that.getJsonModel("InformeFlota").setProperty("/UserModif", data.DatosGenerales.UserModif);

                that._byId("iconEstadoInforme").setVisible(true);

                if (data.DatosGenerales.Estado === "CRE") {
                    that.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2C4E6C");
                } else {
                    that.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2B7D2B");
                }

                //Actualizar horómetros
                if (data.Horometros && data.Numero.length) {
                    var aHorometros = data.Horometros.results;
                    if (aHorometros.length) {
                        that.cleanModel("HorometroSet");
                        var oData = {
                            d: {
                                results: aHorometros,
                            },
                        };
                        that.setDataModel("HorometroSet", oData);
                        //console.log(aHorometros);
                        that.rebindTable(
                            that._byId("tblHorometro"),
                            "HorometroSet>/d/results",
                            [new Filter("Numinforme", "EQ", data.Numero)],
                            that.oEditableHorometerTemplate,
                            "Edit"
                        );
                        //console.log(that._byId("tblHorometro").getBinding("items").oList);
                    }
                }

                that.validarBotones();
                // console.log(data);
                if (bSuccess) {
                    that.oInformeGuardado = that.getTodoInforme();

                    if (
                        that.oInformeGuardado.Horometros.length &&
                        that.oInformeGuardado.Horometros[0].EstadoHorom === "APH"
                    ) {
                        that.ocultarBotones("APRO_HORO");
                        that.mostrarBoton("ANUL_HORO");
                        that._byId("swHorom").setState(false);
                        that._byId("swHorom").setVisible(false);
                        that._byId("txtGuardarHorom").setVisible(false);
                    } else {
                        that.ocultarBotones("ANUL_HORO");
                        that.mostrarBoton("APRO_HORO");
                        that._byId("swHorom").setState(true);
                        that._byId("swHorom").setVisible(true);
                        that._byId("txtGuardarHorom").setVisible(true);
                    }

                    //Calas
                    var aCalas = that.getJsonModel("CalasSet").getData().d.results;
                    for (var x = 0; aCalas.length > x; x++) {
                        aCalas[x].Numinf = data.Numero;
                    }
                    this.util.obtenerPlantilla(
                        data.DatosGenerales.Centro,
                        data.DatosGenerales.Especie,
                        data.DatosGenerales.TipoRed,
                        "Edit",
                        this
                    );
                    // if (data.DatosGenerales.TipoRed === "03") {
                    // 	//Plantilla Calas 2
                    // 	that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", data.Numero)], that.oEditCalasPlantilla2,
                    // 		"Edit");

                    // } else if (data.DatosGenerales.TipoRed === "04") {
                    // 	//Plantilla Calas 3
                    // 	that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", data.Numero)], that.oEditCalasPlantilla3,
                    // 		"Edit");
                    // } else {
                    // 	//Plantilla Calas 1
                    // 	that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [new Filter("Numinf", "EQ", data.Numero)], that.oEditCalasPlantilla1,
                    // 		"Edit");
                    // }
                }
            },

            sendInformeData: async function (sPath, oData, bExec, sId, that) {
                var oModel = that.getInformeOdataModel();
                var bHorometro = that._byId("swHorom").getState();
                var existeGUID = this.existeGUID();
                var aArchivosAdjuntos = oData.Documentos;

                if (!bHorometro) {
                    oData.Horometros = [];
                }

                if (oData.Operacion === "C") {
                    oData.Horometros = [];
                }

                if (that.oFirstHorometer) {
                    if (that.oFirstHorometer.EstadoHorom === "APH") {
                        oData.Horometros = [];
                    }
                }

                if (existeGUID) {
                    oData.DatosGenerales.GUID = oData.GUID;
                }

                if (oData.LongCalas.length == 0) {
                    oData.LongCalas = await this.readLongColas();
                }

                if (oData.LongCalas == "") {
                    oData.LongCalas = [];
                }

                that._byId("btnCargaArchivos").setEnabled(true);

                if (navigator.onLine) {
                    delete oData.Documentos;
                }

                console.log("[DEBUG] guardando informe...");
                console.log(oData);
                oModel.create(sPath, oData, {
                    success: async function (data) {
                        that._saveButtonPressed = false;

                        sap.m.MessageToast.show("Operación completa, por favor revise el Log", {
                            duration: 4000,
                        });

                        Log.addLogEntry(that, data.Return.results);

                        var bSuccess = true;
                        for (var i = 0; data.Return.results.length > i; i++) {
                            if (data.Return.results[i].Tipo === "E") {
                                bSuccess = false;
                                break;
                            }
                        }

                        if (bExec) {
                            Util.deleteOperacion(sId, false, that);
                        }
                        if (aArchivosAdjuntos !== undefined) {
                            if (aArchivosAdjuntos.length >= 1) {
                                await that.tripulacion.guardarDocumentos(aArchivosAdjuntos, data.Numero, oModel, that);
                            }
                        }

                        $.sap.sBtnEstadoDoc = true;
                        that.regreshAfterSave(data, that);
                        that.actualDataAfterSave(data, bSuccess, that);
                        //that._byId("dpInforme").setBusy(false);
                        const oSaveButton = that._byId("btnSaveInforme");
                        oSaveButton.setEnabled(true);

                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (error) {
                        that._saveButtonPressed = false;

                        // console.log(error);
                        var sMessage;

                        if (bExec) {
                            sMessage = "Ocurrió un error al ejecutar la operación en la cola";
                        } else {
                            sMessage = "Ocurrió un error durante la operación, esta será guardada en la cola";
                            if (!navigator.onLine) {
                                oData.Documentos = [];
                            }
                            Util.saveObjectCola(oData, oData.DatosGenerales.Numero, that);
                        }
                        var oDateTime = Util.getDateTime(new Date());

                        that.aSuperLog.push({
                            title: sMessage,
                            subtitle: oDateTime.date + "-" + oDateTime.time,
                            type: "Error",
                            detalle: error.responseText,
                        });
                        that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);

                        sap.m.MessageToast.show(sMessage);
                        that._byId("dpInforme").setBusy(false);

                        sap.ui.core.BusyIndicator.hide();

                        // To avoid multiple clicking at save
                        const oSaveButton = that._byId("btnSaveInforme");
                        oSaveButton.setEnabled(true);
                    },
                });
            },

            sendInformeDataRecursive: function (sPath, Index, aOperaciones, that) {
                if (aOperaciones.length === Index) return "FINISHED";

                var oModel = that.getInformeOdataModel();
                var oOperacion = JSON.parse(aOperaciones[Index].content);

                var bHorometro = that._byId("swHorom").getState();
                if (!bHorometro) {
                    oOperacion.Horometros = [];
                }

                if (oOperacion.Operacion === "C") {
                    oOperacion.Horometros = [];
                }

                oModel.create(sPath, oOperacion, {
                    success: function (data) {
                        Log.addLogEntry(that, data.Return.results);

                        var bSuccess = true;
                        for (var i = 0; data.Return.results.length > i; i++) {
                            if (data.Return.results[i].Tipo === "E") {
                                bSuccess = false;
                                break;
                            }
                        }

                        var numInfActual = that.getJsonModel("InformeFlota").getProperty("/Numero");
                        if (numInfActual === data.Numero || !numInfActual.length) {
                            that.actualDataAfterSave(data, bSuccess, that);
                        }

                        Util.deleteOperacion(aOperaciones[Index].name, false, that);
                        Index++;

                        const sRecursionResult = that.sendInformeDataRecursive(sPath, Index, aOperaciones, that);
                        if (sRecursionResult === "FINISHED") {
                            // To avoid multiple clicking at save
                            const oSaveButton = that._byId("btnSaveInforme");
                            oSaveButton.setEnabled(true);
                        }
                        //console.log(data);
                    },
                    error: function (error) {
                        //console.log(error);

                        var sMessage = "Ocurrió un error al ejecutar la operación en la cola";
                        Util.saveObjectCola(oOperacion, oOperacion.DatosGenerales.Numero, that);
                        sap.m.MessageToast.show(sMessage);

                        var oDateTime = Util.getDateTime(new Date());

                        that.aSuperLog.push({
                            title: sMessage,
                            subtitle: oDateTime.date + "-" + oDateTime.time,
                            type: "Error",
                            detalle: error.responseText,
                        });
                        that.getJsonModel("Indicadores").setProperty("/NumLog", that.aSuperLog.length);

                        // To avoid multiple clicking at save
                        const oSaveButton = that._byId("btnSaveInforme");
                        oSaveButton.setEnabled(true);
                    },
                });
            },

            // eslint-disable-next-line no-unused-vars
            getTodoInforme: function (oEvent) {
                var calasAnt = this._byId("tblCalas").getBinding("items").oList;
                // calasPost = this.getView().getModel("calasPost").getData();

                // $.each(calasAnt, function(k , v){
                // 	if(calasPost.length > 0){
                // 		v.Juven_Jure = calasPost[k].Juven_Jure;
                // 		v.Juven_Anch = calasPost[k].Juven_Anch;
                // 		v.Juven_Merl = calasPost[k].Juven_Merl;
                // 	}
                // });

                var oData = {
                    Numero: "",
                    Operacion: "",
                    Calas: calasAnt,
                    DatosGenerales: this.getJsonModel("InformeFlota").getData(),
                    HojasMuestreo: this.getJsonModel("MuestreoCalaSet").getData().d.results,
                    Horometros: this._byId("tblHorometro").getBinding("items").oList,
                    LongCalas: [],
                    Return: [],
                    Tripulacion: this.getJsonModel("TripulacionSet").getData().d.results,
                };

                if (!oData.DatosGenerales.Numero.length) {
                    oData.Operacion = "C";
                } else {
                    oData.Operacion = "M";
                }

                //Seleccionar solo tallas con muestreo

                if (this.aTallas) {
                    for (var i = 0; oData.HojasMuestreo.length > i; i++) {
                        var oMuestreo = oData.HojasMuestreo[i];
                        for (var j = 0; this.aTallas.length > j; j++) {
                            var oTallaEsp = this.aTallas[j];
                            if (
                                oTallaEsp.Numcala === oMuestreo.Numcala &&
                                oTallaEsp.Nummuestreo === oMuestreo.Nummuestreo
                            ) {
                                for (var x = 0; oTallaEsp.Tallas.length > x; x++) {
                                    oTallaEsp.Tallas[x].Talla = oTallaEsp.Tallas[x].Talla.toString();
                                    oTallaEsp.Tallas[x].Cantidad = oTallaEsp.Tallas[x].Cantidad.toString();
                                    oData.LongCalas.push(oTallaEsp.Tallas[x]);
                                }
                            }
                        }
                    }
                }
                //console.log(oData);
                return Util.deepCloneArray(oData);
            },

            // eslint-disable-next-line no-unused-vars
            onGuardarBorrador: function (oEvent) {
                var oData = this.getTodoInforme();
                sap.m.MessageToast.show("Se guardó informe en borrador...");
                if (oData.DatosGenerales.Numero.length) {
                    oData.DatosGenerales.Numero = "";
                    oData.DatosGenerales.Estado = "";
                    oData.DatosGenerales.EstadoDesc = "";

                    oData.DatosGenerales.RegistroDescarga = "";
                    oData.DatosGenerales.RegistroCombustible = "";
                    oData.DatosGenerales.OrdenProd = "";
                    oData.DatosGenerales.OrdenCompra = "";

                    oData.DatosGenerales.UserCrea = "";
                    oData.DatosGenerales.UserModif = "";
                    oData.DatosGenerales.UserCrea = "";
                    oData.DatosGenerales.FechaModif = "";
                    oData.DatosGenerales.FechaCrea = "";
                    oData.DatosGenerales.HoraCrea = "";
                    oData.DatosGenerales.HoraModif = "";

                    oData.DatosGenerales.Botones = "";

                    oData.DatosGenerales.HoraCrea = "";
                    oData.DatosGenerales.HoraModif = "";

                    oData.DatosGenerales.UserCrea = "";
                    oData.DatosGenerales.UserModif = "";

                    Util.cleanPropsArray(oData.Horometros, ["Numinforme", "EstadoHorom", "EstadoHoromDesc"]);
                    Util.cleanPropsArray(oData.Calas, ["Numinf"]);
                    Util.cleanPropsArray(oData.HojasMuestreo, ["Numinforme"]);
                    Util.cleanPropsArray(oData.Tripulacion, ["Numinforme"]);
                    Util.cleanPropsArray(oData.LongCalas, ["Numinforme"]);
                }
                //console.log(oData);
                var aCompEspecie = this.getJsonModel("CompEspecieSet").getData();

                Util.saveEntity("InformeFlota", JSON.stringify(oData.DatosGenerales), "");

                Util.saveEntity(
                    "Horometro",
                    JSON.stringify({
                        d: {
                            results: oData.Horometros,
                        },
                    }),
                    ""
                );

                Util.saveEntity(
                    "Calas",
                    JSON.stringify({
                        d: {
                            results: oData.Calas,
                        },
                    }),
                    ""
                );

                Util.saveEntity(
                    "MuestreoCala",
                    JSON.stringify({
                        d: {
                            results: oData.HojasMuestreo,
                        },
                    }),
                    ""
                );

                Util.saveEntity(
                    "Tripulacion",
                    JSON.stringify({
                        d: {
                            results: oData.Tripulacion,
                        },
                    }),
                    ""
                );

                Util.saveEntity("CompEspecie", JSON.stringify(aCompEspecie), "");

                Util.saveEntity(
                    "LongCalas",
                    JSON.stringify({
                        d: {
                            results: oData.LongCalas,
                        },
                    }),
                    ""
                );
            },

            validarInforme: function (oDataInforme) {
                var sTipoInforme = oDataInforme.DatosGenerales.Tipo;
                var bIndZarpe = this._byId("cbZarpe").getState();
                var bIndPesca = this._byId("cbPesca").getState();
                var sTipoRed = oDataInforme.DatosGenerales.TipoRed;
                var oInformeTemplate = Util.cloneObject(this.InformeNuevo);
                var bHorometroWhite = false;
                var oCalasCampos;

                var oSaveWarningModel = this.getJsonModel("SaveWarningSet");

                var bWhite = false;

                //Limpiar Informe
                delete oInformeTemplate.Numero;
                delete oInformeTemplate.TipoDesc;
                delete oInformeTemplate.CentroDesc;
                delete oInformeTemplate.PuertoArriboDesc;
                delete oInformeTemplate.CentroDescargaDesc;
                delete oInformeTemplate.DestinoDesc;
                delete oInformeTemplate.EspecieDesc;
                delete oInformeTemplate.UserModif;
                delete oInformeTemplate.UserCrea;
                delete oInformeTemplate.FechaModif;
                delete oInformeTemplate.FechaCrea;
                delete oInformeTemplate.HoraModif;
                delete oInformeTemplate.HoraCrea;
                delete oInformeTemplate.CheckInformativo;
                delete oInformeTemplate.IndicadorPesca;
                delete oInformeTemplate.IndicadorZarpe;
                delete oInformeTemplate.Estado;
                delete oInformeTemplate.EstadoDesc;
                delete oInformeTemplate.EstadoHorometro;
                delete oInformeTemplate.EstadoHorometroDesc;
                delete oInformeTemplate.RegistroCombustible;
                delete oInformeTemplate.RegistroDescarga;
                delete oInformeTemplate.OrdenProd;
                delete oInformeTemplate.OrdenCompra;
                delete oInformeTemplate.DocMaquila;
                delete oInformeTemplate.Botones;

                switch (sTipoInforme) {
                    case "P":
                        delete oInformeTemplate.Emisor;
                        delete oInformeTemplate.EmpMaquila;
                        bHorometroWhite = Util.detectWhitePropArray(oDataInforme.Horometros, ["Horzarpe", "Horarribo"]);
                        if (bHorometroWhite) {
                            bWhite |= true;
                            this.aSaveWarning.push({
                                type: "Warning",
                                title: "Campos vacíos en Horómetros.",
                                description: "",
                            });
                        }
                        break;
                    case "T":
                        delete oInformeTemplate.Centro;
                        delete oInformeTemplate.EmpMaquila;
                        break;
                    /*
            case "M":
                delete oInformeTemplate.Centro;
                break; */
                }

                //console.log(bIndZarpe);
                if (bIndZarpe) {
                    var bMuestreoWhite = Util.detectWhitePropArray(oDataInforme.HojasMuestreo, [
                        "Cantidad",
                        "Descripcion",
                        "Especie",
                        "Moda",
                        "Numcala",
                        "Nummuestreo",
                        "Porcentaje",
                        "Tmax",
                        "Tmin",
                    ]);
                    //console.log(oDataInforme.HojasMuestreo);
                    delete oInformeTemplate.MotivoNoZarpe;
                    delete oInformeTemplate.CausaNoZarpe;

                    //Validar Calas:
                    if (sTipoRed === "03") {
                        //Plantilla Calas 2
                        oCalasCampos = this.oCalas2;
                    } else if (sTipoRed === "04") {
                        //Plantilla Calas 3
                        oCalasCampos = this.oCalas3;
                    } else {
                        //Plantilla Calas 1
                        oCalasCampos = this.oCalas1;
                    }

                    var aCalasProps = [];
                    for (var key in oCalasCampos) {
                        if (Object.prototype.hasOwnProperty.call(oCalasCampos, key)) {
                            aCalasProps.push(key);
                        }
                    }

                    var bCalasWhite = Util.detectWhitePropArray(oDataInforme.Calas, aCalasProps);
                } else {
                    delete oInformeTemplate.TipoRed;
                    delete oInformeTemplate.MotivoZarpe;
                    delete oInformeTemplate.PtoZarpe;
                    delete oInformeTemplate.FechaZarpe;
                    delete oInformeTemplate.HoraZarpe;
                }

                if (bIndPesca) {
                    delete oInformeTemplate.CausaNoPesca;
                } else {
                    delete oInformeTemplate.FecIniZonaPesca;
                    delete oInformeTemplate.HoraIniZonaPesca;
                    delete oInformeTemplate.FecFinZonaPesca;
                    delete oInformeTemplate.HoraFinZonaPesca;
                }

                //Validar Informe
                var aInfProps = [];
                for (var x in oInformeTemplate) {
                    if (Object.prototype.hasOwnProperty.call(oInformeTemplate, x)) {
                        aInfProps.push(x);
                    }
                }

                delete aInfProps[34];
                var oInfReturn = Util.returnWhiteProperties(oDataInforme.DatosGenerales, aInfProps, this);

                if (oInfReturn.bWhite) {
                    bWhite |= true;
                    this.aSaveWarning.push({
                        type: "Warning",
                        title: "Campos vacíos en Informe de flota:",
                        subtitle: "Click para más información",
                        description: oInfReturn.properties.join("<br>"),
                    });
                }

                if (bCalasWhite) {
                    bWhite |= true;
                    this.aSaveWarning.push({
                        type: "Warning",
                        title: "Campos vacíos en Calas.",
                        description: "",
                    });
                }

                if (bMuestreoWhite) {
                    bWhite |= true;
                    this.aSaveWarning.push({
                        type: "Warning",
                        title: "Campos vacíos en Muestreos de Calas.",
                        description: "",
                    });
                }

                oSaveWarningModel.setData({
                    results: this.aSaveWarning,
                });
                oSaveWarningModel.refresh(true);
                //console.log(oSaveWarningModel);
                return bWhite;
            },

            // eslint-disable-next-line no-unused-vars
            recoverInforme: function (oEvent) {
                var that = this;
                sap.m.MessageBox.confirm("¿Desea recuperar el informe guardado? Se sobrescribirá el informe actual", {
                    title: "Recuperar Informe",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            Util.readInforme(that);
                        }
                    },
                });
            },

            //Aprobación

            actualizarInforme: function (oEvent) {
                var that = this;
                var sEstado = oEvent.getSource().getKey();
                var oModel = this.getInformeOdataModel();
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                var sMensaje, sPregunta, sTitulo;
                var bValidaciones = true;
                var oPage = this._byId("dpInforme");

                switch (sEstado) {
                    case "AOP":
                        sMensaje = "Informe de Flota " + nNumero + " aprobado por Operador de Radio";
                        sPregunta = "¿Desea aprobar Informe de Flota " + nNumero + "?";
                        sTitulo = "Aprobar Informe de Flota";
                        bValidaciones = Aprobaciones.validarOperadorRadio(this);
                        break;
                    case "AJF":
                        sMensaje = "Informe de Flota " + nNumero + " aprobado por Jefe de Flota";
                        sPregunta = "¿Desea aprobar Informe de Flota " + nNumero + "?";
                        sTitulo = "Aprobar Informe de Flota";
                        bValidaciones = Aprobaciones.validarJefeFlota(this);
                        break;
                    case "CRE":
                        sMensaje = "Informe de Flota " + nNumero + " desaprobado";
                        sPregunta = "¿Desea desaprobar Informe de Flota " + nNumero + "?";
                        sTitulo = "Desaprobar Informe de Flota";
                        bValidaciones = Aprobaciones.validarDesaprobacion(this);
                        break;
                }

                if (!bValidaciones) {
                    return false;
                } else {
                    sap.m.MessageBox.confirm(sPregunta, {
                        title: sTitulo,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                oPage.setBusy(true);
                                if (nNumero.length && sEstado.length) {
                                    var oData = {
                                        Numero: nNumero,
                                        Estado: sEstado,
                                        Informe: {},
                                        Return: [],
                                    };

                                    oModel.create("/ActualizarInformeSet", oData, {
                                        success: function (data) {
                                            // console.log(data);

                                            var oInformeModel = that.getJsonModel("InformeFlota");
                                            oInformeModel.setProperty("/Estado", data.Informe.Estado);
                                            oInformeModel.setProperty("/EstadoDesc", data.Informe.EstadoDesc);
                                            oInformeModel.setProperty("/Botones", data.Informe.Botones);

                                            if (data.Informe.Estado === "CRE") {
                                                that.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2C4E6C");
                                            } else {
                                                that.getJsonModel("Indicadores").setProperty("/EstadoColor", "#2B7D2B");
                                            }

                                            var bTodoOk = true;
                                            var sError = "";
                                            for (var i = 0; data.Return.results.length > i; i++) {
                                                if (data.Return.results[i].Tipo === "E") {
                                                    bTodoOk = false;
                                                    sError = data.Return.results[i].Mensaje;
                                                    break;
                                                }
                                            }

                                            if (bTodoOk) {
                                                sap.m.MessageToast.show(sMensaje);
                                                that.onViewInforme();
                                            } else {
                                                sap.m.MessageBox.error(sError);
                                            }

                                            that.validarBotones();

                                            Log.addLogEntry(that, data.Return.results);
                                            oPage.setBusy(false);
                                        },
                                        error: function (error) {
                                            // console.log(error);

                                            var sMessage = "Ocurrió un error al actualizar el estado del informe";

                                            sap.m.MessageToast.show(sMessage);

                                            var oDateTime = Util.getDateTime(new Date());

                                            that.aSuperLog.push({
                                                title: sMessage,
                                                subtitle: oDateTime.date + "-" + oDateTime.time,
                                                type: "Error",
                                                detalle: error.responseText,
                                            });

                                            that.getJsonModel("Indicadores").setProperty(
                                                "/NumLog",
                                                that.aSuperLog.length
                                            );
                                            oPage.setBusy(false);
                                        },
                                    });
                                }
                            }
                        },
                    });
                }
            },

            readInforme: function () {
                var oModel = this.getInformeOdataModel();
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                if (nNumero.length) {
                    oModel.read("/InformeFlotaSet('" + nNumero + "')", {
                        // eslint-disable-next-line no-unused-vars
                        success: function (oData) {
                            // console.log(oData);
                        },
                        // eslint-disable-next-line no-unused-vars
                        error: function (oError) {
                            // console.log(oError);
                        },
                    });
                }
            },
            guid: function () {
                function _p8(s) {
                    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                }
                return _p8() + _p8(true) + _p8(true) + _p8();
            },
            readLongColas: async function () {
                var oModel = this.getInformeOdataModel();
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                // eslint-disable-next-line no-unused-vars
                return new Promise((resolve, reject) => {
                    oModel.read("/LongCalasSet", {
                        filters: [new Filter("Numinforme", "EQ", nNumero)],
                        success: function (oData) {
                            console.log("[DEBUG] getting LongCalasSet...");
                            console.log(oData ? oData.results : oData);
                            resolve(oData ? oData.results : "");
                        },
                        // eslint-disable-next-line no-unused-vars
                        error: function (oError) {
                            console.error("[DEBUG] getting LongCalasSet...");
                            resolve("");
                        },
                    });
                });
            },
            existeGUID: function () {
                var existeGUID = false;
                var entidades = this.getInformeOdataModel().getServiceMetadata().dataServices.schema[0].entityType;
                for (var j = 0; entidades.length > j; j++) {
                    if (entidades[j].name === "InformeFlota") {
                        var propiedades = entidades[j].property;
                        for (var k = 0; propiedades.length > k; k++) {
                            if (propiedades[k].name === "GUID") existeGUID = true;
                        }
                    }
                }
                return existeGUID;
            },
            onChangeRsw: function (oEvent) {
                var sKeySelected = oEvent.getParameter("selectedIndex"),
                    oTxtOperLim = this.byId("txtOperativoLim");

                if (sKeySelected === 1) {
                    oTxtOperLim.setVisible(true);
                } else {
                    oTxtOperLim.setVisible(false);
                }
            },
            obtenerCausaNoZarpe: function (sMotivo) {
                // eslint-disable-next-line no-unused-vars
                return new Promise((resolve, reject) => {
                    var oModel = this.getInformeOdataModel();
                    oModel.read("/CausaNoZarpeSet", {
                        filters: [new Filter("Motivo", "EQ", sMotivo)],
                        success: function (oData) {
                            var aData = oData.results;
                            if (localStorage.getItem("CausaNoZarpeSet") === null) {
                                localStorage.setItem("CausaNoZarpeSet", JSON.stringify(aData));
                            } else {
                                var aDataBefore = JSON.parse(localStorage.getItem("CausaNoZarpeSet"));
                                aDataBefore = aDataBefore.concat(aData);
                                localStorage.setItem("CausaNoZarpeSet", JSON.stringify(aDataBefore));
                                console.log(aDataBefore);
                            }
                            resolve(true);
                        },
                    });
                });
            },
        });
    }
);
