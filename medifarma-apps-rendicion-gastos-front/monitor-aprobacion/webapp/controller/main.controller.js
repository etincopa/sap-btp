sap.ui.define([
    "com/everis/monitorDocumentos/controller/baseController",
    "com/everis/monitorDocumentos/controller/Service",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/commons/util/DateUtils",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/everis/monitorDocumentos/controller/Workflow",
    "../model/formatter",
    "sap/base/Log",
     "../lib/Backend",
    "../lib/Developer",
    "../lib/Sharepoint"
], function (Controller, Service, MessageToast, JSONModel, DateUtils, MessageBox, History, WF, Formatter, Log,  Backend,Developer,Sharepoint) {
    "use strict";
    var oDialog, oThes;
    $.estadoNoConsiderado = "CREADO";
    $.estadoSelected = "9999999999";
    $.estadoGetTodos = "9999999999";
    $.aplicacionSelected = "0000000003";
    $.idEstadoHistorialCreadoSRV = "0000000000";
    $.estadoHistorialCreadoSRV = "PENDIENTE";
    $.estadoCreado = "0000000001";
    $.estadoPendiente = "0000000002";
    $.motivoRechazoERFF = "Anulado en el monitor de estados de aprobación";
    $.visibilidadFFER = false; //controla la visibilidad de la columna Etapa y el botón modificar documento
    return Controller.extend("com.everis.monitorDocumentos.controller.main", {
        xmlFragmentLogDialog: "com.everis.monitorDocumentos.view.fragment.detalleEvaluaciones",
        jFiltrosIniciales: {
            "fechaInicial": new Date((new Date()).setMonth((new Date()).getMonth() - 1)),
            "fechaFinal": new Date(),
            "subProcesoSelectd": $.aplicacionSelected,
            "estado": $.estadoSelected,
            "nroDocumento": null,
            "sociedad": "",
            "nombreSociedad": null,
            "usuarioIAS": null,
            "nombresApellidos": "",
            "roles": [],
            "procesos": [],
            "ruc": "",
            "visibilidadFFER": $.visibilidadFFER
        },
        jRoles: [{
            "idProceso": "P010",
            "nombre": "Fondo_Fijo"
        }, {
            "idProceso": "P020",
            "nombre": "Entrega_Rendir"
        }],

        aDisabledDeletedState: [{
            "estado": "0000000005"
        }, {
            "estado": "0000000004"
        }],
        arrayColores: [{
            "estado": "0000000001",
            "nombreEstado": "CREADO",
            "color": "#6C7156"
        }, {
            "estado": "0000000002",
            "nombreEstado": "PENDIENTE",
            "color": "#ffcc00"
        }, {
            "estado": "0000000000",
            "nombreEstado": "PENDIENTE",
            "color": "#ffcc00"
        }, {
            "estado": "0000000003",
            "nombreEstado": "APROBADO",
            "color": "#57A639"
        }, {
            "estado": "0000000004",
            "nombreEstado": "RECHAZADO",
            "color": "#e60000"
        }, {
            "estado": "0000000005",
            "nombreEstado": "ANULADO",
            "color": "#e60000"
        }, {
            "estado": "9999999999",
            "nombreEstado": "TODOS",
            "color": ""
        }],
        detalleFormatDetalleHistorial: {
            "0000000000": {
                "accion": "generó el documento.",
                "icon": "sap-icon://create",
                "status": "Information"
            },
            "0000000003": {
                "accion": "aprobó el documento.",
                "icon": "sap-icon://employee-approvals",
                "status": "Success"
            },
            "0000000004": {
                "accion": "rechazó el documento.",
                "icon": "sap-icon://employee-rejections",
                "status": "Error"
            },
            "0000000005": {
                "accion": "eliminó el documento.",
                "icon": "sap-icon://delete",
                "status": "Error"
            },
            "0000000002": {
                "accion": "pendiente de aprobación.",
                "icon": "sap-icon://away",
                "status": "Warning"
            }
        },
        formatDetalleHistorialFFER: {
            "0000000000": {
                "accion": "generó el documento.",
                "icon": "sap-icon://document-text",
                "status": "Information"
            },
            "0000000002": {
                "accion": "Pendiente de aprobación.",
                "icon": "sap-icon://customer",
                "status": "Warning"
            },
            "0000000003": {
                "accion": "aprobó el documento.",
                "icon": "sap-icon://employee-approvals",
                "status": "Success"
            },
            "0000000004": {
                "accion": "rechazó el documento.",
                "icon": "sap-icon://employee-rejections",
                "status": "Error"
            },
            "0000000005": {
                "accion": "anuló el documento.",
                "icon": "sap-icon://delete",
                "status": "Error"
            },
            "0000000006": {
                "accion": "contabilizó el documento.",
                "icon": "sap-icon://accounting-document-verification",
                "status": "Information"
            }
        },
        detalleAprobadoresByProceso: {
            "0000000001": {
                "accion": "generó el documento.",
                "icon": "sap-icon://create",
                "status": "Information"
            },
            "0000000002": {
                "accion": "aprobó el documento.",
                "icon": "sap-icon://employee-approvals",
                "status": "Success"
            },
            "0000000003": {
                "accion": "rechazó el documento.",
                "icon": "sap-icon://employee-rejections",
                "status": "Error"
            },
            "0000000004": {
                "accion": "eliminó el documento.",
                "icon": "sap-icon://delete",
                "status": "Error"
            }
        },
        NomenclaturaTarea: {
            "P100": "N00",
            "P200": "T00",
            "P500": "L00"
        },
        reglasWF: {
            "P100": {
                "tareas": ["N001", "N002"],
                "N001": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "N001",
                    "valor": "",
                    'Tabname': 'CSKS',
                    'Fieldname': 'KOSTL',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'
                },
                "N002": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "N002",
                    "valor": "",
                    'Tabname': 'CSKS',
                    'Fieldname': 'KOSTL',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'
                }
            },
            "P200": {
                "tareas": ["T001", "T002"],
                "T001": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "T001",
                    "valor": "",
                    'Tabname': 'ZUSER_SOL',
                    'Fieldname': 'SOLICITANTE',
                    'TabSearch': 'ZUSER_SOL',
                    'FieldSearch': 'APROBADOR1'

                },
                "T002": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "T002",
                    "valor": "",
                    'Tabname': 'ZUSER_SOL',
                    'Fieldname': 'SOLICITANTE',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'

                }
            },
            "P500": {
                "tareas": ["L001", "L002", "L003"],
                "L001": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "L001",
                    "valor": "",
                    'Tabname': 'CSKS',
                    'Fieldname': 'KOSTL',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'
                },
                "L002": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "L002",
                    "valor": "",
                    'Tabname': 'CSKS',
                    'Fieldname': 'KOSTL',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'
                },
                "L003": {
                    "sociedad": "",
                    "proceso": "",
                    "nivel": "L003",
                    "valor": "",
                    'Tabname': 'T001L',
                    'Fieldname': 'LGORT',
                    'TabSearch': 'PA0001',
                    'FieldSearch': 'PLANS'
                }
            }
        },
        handleRouteMatched: function (oEvent) { },
        onInit: function () {
           
    
            //	jQuery.sap.debug(false);
            var that = this;
            oThes = this;
            that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            that.oRouter.getTarget("main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            that.loadProcesosFilter();
            that.loadEstadoFilter();
            const oModel = this.getOwnerComponent().getModel("oCajaChicaFFModel"),
                oisMobile = sap.ui.Device.system.phone;

            oModel.attachMetadataFailed(() => {
                MessageBox.error("Error al comunicarse con el servidor. Intentar de nuevo más tarde.");
            });
            Backend.initialize(this.getOwnerComponent().getModel("UtilsModel"));

            Backend
                .getParameters("RENDICION_GASTOS", null)
                .then((aParameters) => {
                    Log.info("[CC] Home.controller - onInit", "Parameters loaded");

                    const aParamsToParse = this.getOwnerComponent().getModel("Config").getData().parameters;

                    return Backend.parseParameters(aParameters, aParamsToParse);
                })
                .then((paramValues) => {
                    sap.ui.getCore().setModel(new JSONModel(paramValues["CAJA_CHICA"]), "ParametersModel");
                    this._initSharepoint(paramValues["SHAREPOINT"]);
                    return this.getUserApi();
                })
                .then((oUserApi) => {
                    sap.ui.getCore().setModel(new JSONModel(oUserApi), "oUserIAS");

                    //BRAD CAMBIO displayName POR NAME name
                    
                    oUserApi.name = oUserApi.userName
                    return new Promise((resolve, reject) => {
                        oModel.read("/IasSet('" + oUserApi.name + "')", {
                            success: (result) => {
                                Log.info("[CC] Home.controller - onInit", "IasSet loaded " + oUserApi.name);
                                sap.ui.getCore().setModel(new JSONModel(result), "oUserSap");
                                this.loadUserData();
                                resolve();
                            },
                            error: function (xhr, status, error) {
                                MessageBox.error(error);
                                reject(error);
                            },
                        });
                    });
                })
                .catch((err) => {
                    Log.error("[CC] Home.controller - onInit", err);
                    MessageBox.error("Ha ocurrido un error al recuperar la informacion del usuario");
                })
                .finally(() => {
                    sap.ui.getCore().setModel(new JSONModel({}), "HomeLoadedModel");
                    Log.info("[CC] Home.controller - onInit", "Home finished loading");

                    sap.ui.core.BusyIndicator.hide();
                });
            //that.loadUserData(); //Carga portal, sociedad y roles
            
        },
        getUserApi: function () {
            return new Promise((resolve, reject) => {
                let sEmail = "";

                if (sap.ushell !== undefined) {
                    sEmail = sap.ushell.Container.getUser().getEmail();
                }

                if (sEmail) {
                    Log.info("[CC] Home.controller getUserApi - User Mail", sEmail);
                } else if (Developer.isTestMode()) {
                    sEmail = "hmunoz@everis.com";
                }

                const sPath = 'iasscim/Users?filter=emails.value eq "' + sEmail + '"';
                const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(sPath);
                $.ajax({
                    url: sUrl,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: "GET",
                    success: function (data) {
                        let oData = {};
                        //let aAttributes = oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                        oData = {
                            company: "",
                            email: data.Resources[0].emails[0].value,
                            emails: data.Resources[0].emails[0].value,
                            firstName: data.Resources[0].name.givenName,
                            groups: data.Resources[0].groups,
                            lastName: data.Resources[0].name.familyName,
                            loginName: data.Resources[0].userName,
                            name: data.Resources[0].userName, // Se usa para validar usuario en SAP
                            ruc: "",
                        };

                        Log.info("[CC] Home.controller - getUserApi - IAS SCIM API Result", JSON.stringify(oData));
                        resolve(data.Resources[0])
                        //resolve(oData);
                    },
                    error: function (error) {
                        reject(error);
                    },
                });
            });
        },
        loadUserData: function () {
            var oUserIAS = sap.ui.getCore().getModel("oUserIAS").getData();
            var oUserSap = sap.ui.getCore().getModel("oUserSap").getData();
            // FIXME: 
			

            //oThes.jFiltrosIniciales.procesos = oThes.getListaProcesos(oUserApi.groups);
            oThes.jFiltrosIniciales.procesos = ["P010","P020"];
            // P300 , P400
            oThes.jFiltrosIniciales.usuarioIAS = oUserIAS.userName;
           // oThes.jFiltrosIniciales.roles = oUserIAS.groups;
            oThes.jFiltrosIniciales.roles = ["Fondo_fijo","Entrega_Rendir"]
            oThes.jFiltrosIniciales.ruc = oUserSap.ruc2 === undefined ? "" : oUserSap.ruc2;
            oThes.jFiltrosIniciales.nombresApellidos = oUserSap.Pname;
            oThes.setModel(new JSONModel(oThes.jFiltrosIniciales), "oModelFilter");
            oThes.getSociedadPortal().then(function (result) {
                oThes.getEstadoFinalDetalle();
            });

        },
        getListaProcesos: function (vRoles) {
            debugger
            var procesos = [];
            vRoles.map(function (rol) {
                for (var i = 0; i < oThes.jRoles.length; i++) {
                    if (rol === oThes.jRoles[i].nombre) {
                        procesos.push(oThes.jRoles[i].idProceso);
                    }
                }
            });
            return procesos;
        },
        getSociedadPortal: function () {
            return new Promise(function (resolve, reject) {
                var oComponentData = oThes.getComponentData();
                //El usuario ha ingresado al portal de clientes
                if (oComponentData &&
                    oComponentData.startupParameters &&
                    oComponentData.startupParameters.BUKRS &&
                    oComponentData.startupParameters.BUKRS.length > 0 || true //test 
                ) {
                    var sSociedad = "1000"; //test*
                    //var sSociedad = oComponentData.startupParameters.BUKRS[0];
                    sap.ui.getCore().AppContext.sCurrentMandt = sSociedad;
                    oThes.getModel("oModelFilter").setProperty("/sociedad", sSociedad);
                   // $.aplicacionSelected = "0000000004";
                    //oThes.jFiltrosIniciales.subProcesoSelectd = $.aplicacionSelected;
                    var procesoSelected = oThes.byId("comboProceso").getSelectedKey()
                    oThes.getModel("oModelFilter").setProperty("/subProcesoSelectd", procesoSelected);
                    oThes.getModel("oModelFilter").updateBindings();
                    resolve(oThes.getModel("oModelFilter"));
                } else { //El usuario ha ingresado al portal de colaboradores
                    var sUserIas = oThes.getModel("oModelFilter").getData().usuarioIAS;
                    Service.onDataEmpleadoFilter(oThes, sUserIas).then(function (res) {
                        jQuery.sap.log.info(res);
                        oThes.getModel("oModelFilter").setProperty("/sociedad", res.Bukrs);
                        oThes.getModel("oModelFilter").setProperty("/nombreSociedad", res.Butxt);
                        resolve(oThes.getModel("oModelFilter"));
                    }).catch(function (error) {
                        reject(error);
                        jQuery.sap.log.error(error);
                    });
                }

            });
        },
        loadProcesosFilter: function () {
            var that = this;
            Service.onGetProcesoFilter(that).then(function (res) {
                //res.results = that.setProcesosByRoles(res.results);
                var oModel = new sap.ui.model.json.JSONModel(res.results);
                oModel.setSizeLimit(res.results.length);
                that.getView().byId("comboProceso").setModel(oModel);
            }).catch(function (error) {
                jQuery.sap.log.error(error);
            });

        },
        setProcesosByRoles: function (vAllProcesos) {
            var oProcesoByRol = oThes.getModel("oModelFilter").getData().procesos;
            var vProcesos = [];
            vAllProcesos.map(function (item) {
                if (oProcesoByRol.includes(item.IdProceso)) {
                    vProcesos.push(item);
                }
            });
            return vProcesos;
        },
        loadEstadoFilter: function () {
            var that = this;
            Service.onGetEstadosFilter(that).then(function (res) {
                res.results = that.setEstadosFilter(res.results);
                var oModel = new sap.ui.model.json.JSONModel(res.results);
                oModel.setSizeLimit(res.results.length);
                that.getView().byId("comboEstado").setModel(oModel);
            }).catch(function (error) {
                jQuery.sap.log.error(error);
            });
        },
        setEstadosFilter: function (vAllEstados) {
            var vEstados = [];
            vAllEstados.map(function (item) {
                if ((item.Vtext).indexOf($.estadoNoConsiderado) < 0) {
                    vEstados.push(item);
                }
            });
            return vEstados;
        },
        onReset: function (oEvent) {
            var sMessage = "onReset trigered";
            MessageToast.show(sMessage);
        },

        onSearch: function (oEvent) {
            oThes.getEstadoFinalDetalle();
        },
        _initSharepoint: function (oValues) {
           Sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
           Sharepoint.setUrl(oValues.URL);
           Sharepoint.setGetTokenFn(() => {
                return Backend.getSharepointToken("RENDICION_GASTOS");
            });
        },
        getEstadoFinalDetalle: function () {
            var oFilter = oThes.getFiltroEstadosFinalesSRV();
            oThes.getView().setBusyIndicatorDelay(0);
            oThes.getView().setBusy(true);
            Service.onGetEstadoDocumentos(oThes, oFilter).then(function (result) {
                oThes.getView().setBusy(false);
                var data = [];
                //caso especial para ff y er
                if (oThes.jFiltrosIniciales.subProcesoSelectd === "0000000005" || oThes.jFiltrosIniciales.subProcesoSelectd === "0000000006") {
                    $.visibilidadFFER = true;
                    oThes.jFiltrosIniciales.visibilidadFFER = true;
                    oThes.getModel("oModelFilter").setProperty("/visibilidadFFER", $.visibilidadFFER);
                    oThes.getModel("oModelFilter").updateBindings();
                } else {
                    $.visibilidadFFER = false;
                    oThes.jFiltrosIniciales.visibilidadFFER = false;
                    oThes.getModel("oModelFilter").setProperty("/visibilidadFFER", $.visibilidadFFER);
                    oThes.getModel("oModelFilter").updateBindings();
                }

                if (result.results.length > 0) {
                    data = oThes.formatTable(result.results);
                    oThes.setModel(new JSONModel(data), "oModelDocumento");
                    oThes.getModel("oModelDocumento").updateBindings();
                    oThes.getModel("oModelDocumento").refresh();

                } else {
                    oThes.setModel(new JSONModel(), "oModelDocumento");
                    oThes.getModel("oModelDocumento").updateBindings();
                    oThes.getModel("oModelDocumento").refresh();
                }

            }).catch(function (error) {
                oThes.getView().setBusy(false);
                jQuery.sap.log.error(error);
            });
        },
        getFiltroEstadosFinalesSRV: function () {
            var oDataTemp = oThes.getModel("oModelFilter").getData();
            // modificado por Juan 19/11/2019
            var FechaIni = oDataTemp.fechaInicial.toISOString();
            FechaIni = FechaIni.replace("-", "").replace("-", "");
            FechaIni = FechaIni.substring(0, 8);

            var FechaFin = oDataTemp.fechaFinal.toISOString();
            FechaFin = FechaFin.replace("-", "").replace("-", "");
            FechaFin = FechaFin.substring(0, 8);
            // modificado por Juan 19/11/2019
  var oDataFilters = {
                "Sociedad": "1000",
                "UsuarioIAS": oDataTemp.usuarioIAS,
                "Proceso": oDataTemp.subProcesoSelectd,
                // modificado por Juan 19/11/2019
                "FechaFinal": FechaFin,
                "FechaInicial": FechaIni,
                // modificado por Juan 19/11/2019
                "NroDocumento": oDataTemp.nroDocumento,
                "Estado": oDataTemp.estado === $.estadoGetTodos ? "" : oDataTemp.estado
            };

            /*var oDataFilters = {
                "Sociedad": oDataTemp.sociedad,
                "UsuarioIAS": oDataTemp.usuarioIAS,
                "Proceso": oDataTemp.subProcesoSelectd,
                // modificado por Juan 19/11/2019
                "FechaFinal": FechaFin,
                "FechaInicial": FechaIni,
                // modificado por Juan 19/11/2019
                "NroDocumento": oDataTemp.nroDocumento,
                "Estado": oDataTemp.estado === $.estadoGetTodos ? "" : oDataTemp.estado
            };*/
            return oDataFilters;
        },
        formatTable: function (vData) {
            vData.map(function (item) {
                var condicion1 = true,
                    condicion2 = true;
                item.fechaCreacion = oThes.setDateFrontFormat(item.Erdat);
                item.Vtext = item.IdStatus === $.idEstadoHistorialCreadoSRV ? $.estadoHistorialCreadoSRV : item.Vtext;
                item.hasMotivo = item.MotivoRechazo === "" ? false : true;
                item.colorEstado = oThes.getColorEstado(item.IdStatus);

                if (item.IdProceso === "P200" && item.WfFinalizado === "X") {
                    condicion1 = false;
                }
                condicion2 = oThes.getDeletable(item.IdStatus);

                item.enableDelete = (condicion1 && condicion2);

                if (item.IdStatus === $.estadoCreado || item.IdStatus === $.estadoPendiente || item.IdStatus === "0000000004") {
                    if (item.FlagAprob === true) {
                        ///PREGUNTA SI ESTA RECHAZADO PARA QUE SE ACTIVE LA MODIFICACION
                        if (item.IdStatus === "0000000004") {
                            item.enableEdit = true;
                        } else {
                            item.enableEdit = false;
                        }
                    } else {
                        item.enableEdit = true;
                    }
                } else {
                    item.enableEdit = false;
                }
            });
            return vData;
        },
        getDeletable: function (sEstado) {
            var bInhabilitar = [];
            bInhabilitar = oThes.aDisabledDeletedState.filter(function (ele) {
                if (ele.estado === sEstado)
                    return ele;
            });
            if (bInhabilitar.length > 0) return false;
            else return true;
        },
        getColorEstado: function (sEstado) {
            var bHabilitar = [];
            bHabilitar = oThes.arrayColores.filter(function (ele) {
                return (ele.estado === sEstado);
            });
            return bHabilitar[0].color;
        },
        setDateFrontFormat: function (current_datetime) {
            var formatted_date = oThes.appendLeadingZeroes(current_datetime.getUTCDate()) + "/" +
                oThes.appendLeadingZeroes(current_datetime.getUTCMonth() + 1) + "/" +
                current_datetime.getUTCFullYear();
            return formatted_date;
        },
        setDateFormat: function (current_datetime) {
            var formatted_date = current_datetime.getFullYear() +
                oThes.appendLeadingZeroes(current_datetime.getMonth() + 1) +
                oThes.appendLeadingZeroes(current_datetime.getDate());
            return formatted_date;
        },
        appendLeadingZeroes: function (n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n;
        },
        onMotivoDialog: function (oEvent) {
            this._oPopoverRechazo = undefined;
            var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            //var index = oEvent.getSource().getBindingContext("oModelDocumento").sPath;
            if (!this._oPopoverRechazo) {
                this._oPopoverRechazo = sap.ui.xmlfragment("com.everis.monitorDocumentos.view.fragment.detalleMotivoRechazo", this);
                this._oPopoverRechazo.setModel(new JSONModel(oObject), "oModelRechazo");
                this.getView().addDependent(this._oPopoverRechazo);
            }

            this._oPopoverRechazo.openBy(oEvent.getSource());
        },
        handleCloseButtonRechazo: function (oEvent) {
            this._oPopoverRechazo.close();
            this._oPopoverRechazo = undefined;
        },
        onPressDelete: function (oEvent) {
            var that = this;
            var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            var msg = "¿Desea eliminar el documento?";
            sap.m.MessageBox.warning(msg, {
                title: "Atención",
                actions: ["Aceptar", "Cancelar"],
                onClose: function (sActionClicked) {
                    if (sActionClicked === "Aceptar") {
                        oThes.getView().setBusyIndicatorDelay(0);
                        oThes.getView().setBusy(true);
                        ///RECHAZO ANULACION ER FF
                        if (oObject.ProcesoWf === "0000000001" || oObject.ProcesoWf === "0000000002") {
                            if (oObject.Zetapa === "SOLICITUD" || oObject.Zetapa === "RENDICIÓN") {
                                //Buscar TaskInstanceId
                                var taskUSer = {};
                                WF.getExecutionLogs(that, oObject.IdWorkflow).then(function (res) {
                                    var aHistorialCompleto = res;
                                    var oRegistro = {};

                                    while (aHistorialCompleto.length > 0) {
                                        oRegistro = aHistorialCompleto.shift();
                                        if (oRegistro.type === "USERTASK_CREATED") {
                                            taskUSer = oRegistro;

                                        }
                                    }
                                    if (taskUSer.taskId.length > 0) {
                                        ///Rechazar WF SCP
                                        var contextReject = {
                                            "MotRechz": $.motivoRechazoERFF,
                                            "stage": false
                                        };
                                        WF.rejectTask(taskUSer.taskId, contextReject).then(function (response) {
                                            that.getView().setBusy(false);
                                            MessageBox.success("Se rechazo el documento correctamente", {
                                                actions: [MessageBox.Action.OK],
                                                emphasizedAction: MessageBox.Action.OK,
                                                onClose: function (sAction) {
                                                    oThes.getEstadoFinalDetalle();
                                                }
                                            });



                                            return;

                                        }).catch(function (error) {
                                            that.getView().setBusy(false);
                                            jQuery.sap.log.error(error);
                                            if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
                                                MessageToast.show(error.message);
                                            }
                                        });

                                    } else {
                                        MessageToast.show("No existe el User Taskinstance Workflow! ");
                                        return;
                                    }

                                }).catch(function (error) {
                                    that.getView().setBusy(false);
                                    jQuery.sap.log.error(error);
                                    if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
                                        MessageToast.show(error.message);
                                    }
                                });

                            } else {
                                var objAnulacionSap = {
                                    "Bukrs": oObject.Bukrs,
                                    "NroDocumento": oObject.NroDocumento,
                                    "Gjahr": oObject.Gjahr,
                                    "Ztype": "B",
                                    "ProcesoWf": oObject.ProcesoWf
                                };

                                Service.getAnulacionERFF(oThes, objAnulacionSap).then(function (result) {
                                    oThes.getView().setBusy(false);
                                    var msj = "El documento fue anulado éxitosamente.";
                                    that.showMessageBox(msj, "success");
                                    oThes.getEstadoFinalDetalle();

                                }).catch(function (error) {
                                    oThes.getView().setBusy(false);
                                    var msj = "Error ,comunicarse con el Departamento Sistemas.";
                                    that.showMessageBox(msj, "error");
                                    jQuery.sap.log.error(error);
                                });
                            }
                        } else {
                            var oParametrosInput = oThes.formatDeleteParameters(oObject);
                            Service.onDeleteDocument(oThes, oParametrosInput).then(function (result) {
                                oThes.getView().setBusy(false);
                                if (result.Ok === "X") {
                                    var msj = result.Resultado === "" ? result.Resultado : "El documento fue eliminado éxitosamente.";
                                    that.showMessageBox(msj, "success");
                                    oThes.getEstadoFinalDetalle();
                                } else {
                                    if (result.Resultado === "No se puede borrar el documento") {
                                        result.Resultado = "No se puede borrar el documento ya que se ha realizado el despacho correspondiente.";
                                    }
                                    that.showMessageBox(result.Resultado, "error");
                                }
                            }).catch(function (error) {
                                jQuery.sap.log.error(error);
                            });
                        }

                    }
                }
            });
        },
        formatDeleteParameters: function (oData) {
            var oUsuario = oThes.getModel("oModelFilter").getData();
            var jParameters = {
                TipoDocu: (oData.ProcesoWf).slice(9, 10),
                NroDocumento: oData.NroDocumento,
                Usuario: oUsuario.usuarioIAS,
                NombreApellidos: oUsuario.nombresApellidos,
                Ruc: oUsuario.ruc,
                IsScp: "X"
            };
            return jParameters;
        },
        //*****************Dialogo Historial de Aprobación*****************************
        onLogDialog: function (oEvent) {
            var that = this;
            var oView = that.getView();
            that.jModelTimeline = new sap.ui.model.json.JSONModel();
            var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            var casoEspecial = false; //identificar caso especial (FF y ER)
            var oFilter = {};
            if (oObject.ProcesoWf === "0000000001" || oObject.ProcesoWf === "0000000002") {
                oFilter = that.getFiltroHistorialFFER(oObject);
                casoEspecial = true;
            } else {
                oFilter = that.getFiltroHistorialSRV(oObject);
            }

            oDialog = oView.byId("idLogDialog");

            var oData = "";
            if (!oDialog) {
                if (casoEspecial) {
                    var aHistorialFiltrado = [];
                    oView.setBusy(true);
                    WF.getExecutionLogs(that, oObject.IdWorkflow).then(function (res) {
                        var aHistorialCompleto = res;
                        var oRegistro = {};

                        while (aHistorialCompleto.length > 0) {
                            oRegistro = aHistorialCompleto.shift();
                            if (oRegistro.type === "WORKFLOW_STARTED") {
                                aHistorialFiltrado.push(oRegistro);
                            } else if (oRegistro.type === "USERTASK_CREATED") {
                                aHistorialFiltrado.push(oRegistro);
                            } else if (oRegistro.type === "USERTASK_COMPLETED") {
                                if (oObject.ProcesoWf === "0000000002") { //ER

                                    var statusTask = res.filter(function (o) {
                                        if ((o.activityId === "servicetask8" || o.activityId === "servicetask11") && o.type === "SERVICETASK_COMPLETED") {
                                            return o;
                                        } else if (o.activityId === "servicetask4" && o.type === "SERVICETASK_COMPLETED") { //Aprobado
                                            return o;
                                        } else if (o.activityId === "servicetask5" && o.type === "SERVICETASK_COMPLETED") { // Rechazado
                                            return o;
                                        }
                                    });
                                    oRegistro.status = statusTask[0].subject;

                                } else { //FF
                                    var statusTask = res.filter(function (o) {
                                        if (o.activityId === "servicetask7" && o.type === "SERVICETASK_COMPLETED" && o.id > oRegistro.id) { //Aprobado Primer nivel
                                            return o;
                                        } else if (o.activityId === "servicetask3" && o.type === "SERVICETASK_COMPLETED" && // Aprobado 2°Nivel
                                            o.id > oRegistro.id) { //Aprobado
                                            return o;
                                        } else if (o.activityId === "servicetask5" && o.type === "SERVICETASK_COMPLETED" &&
                                            o.id > oRegistro.id) { // Rechazado
                                            return o;
                                        }
                                    });
                                    oRegistro.status = statusTask[0].subject;
                                }
                                aHistorialFiltrado.push(oRegistro);
                            } else if (oRegistro.type === "WORKFLOW_CANCELED") {
                                aHistorialFiltrado.push(oRegistro);
                            }
                        }
                        aHistorialFiltrado.forEach((o) => {
                            if (o.recipiemUsers) {
                                o.userId = o.recipiemUsers[0]
                            }
                        });
                        Service.onGetHistorialDocumentoFFER(that, oFilter).then(function (result) {
                            var aDetalleSAP = result.results;
                            oDialog = sap.ui.xmlfragment("idLogDialog", that.xmlFragmentLogDialog, that);
                            sap.ui.getCore().byId("idLogDialog--idDialogo").setTitle(oObject.VtextProceso + " N°" + oObject.NroDocumento);
                            oView.addDependent(oDialog);
                            oDialog.open();
                            //oDialog.setBusy(true);
                            var history = that.elaborarFlujoDeAprobacionERFF(oObject, aHistorialFiltrado, aDetalleSAP);

                            oDialog.setModel(new JSONModel(history), "oModelTimeLine");
                            oDialog.getModel("oModelTimeLine").updateBindings();
                            sap.ui.getCore().byId("idLogDialog--idTimeline").setBusy(false);
                            that.getView().setBusy(false);
                        }).catch(function (error) {
                            that.getView().setBusy(false);
                            jQuery.sap.log.error(error);
                        });
                    }).catch(function (error) {
                        that.getView().setBusy(false);
                        jQuery.sap.log.error(error);
                        if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
                            MessageToast.show(error.message);
                        }
                    });
                } else {
                    Service.onGetHistorialDocumento(that, oFilter).then(function (result) {
                        if (result.results.length > 0) {
                            oDialog = sap.ui.xmlfragment("idLogDialog", that.xmlFragmentLogDialog, that);
                            sap.ui.getCore().byId("idLogDialog--idDialogo").setTitle(oObject.VtextProceso + " N°" + oObject.NroDocumento);
                            oView.addDependent(oDialog);
                            oDialog.open();
                            oDialog.setBusy(true);
                            if (oObject.WfFinalizado === "X") {
                                oData = oThes.formatDetalleWorkflowCompleto(result.results);
                                oDialog.setBusy(false);
                            } else {
                                oData = oThes.formatDetalleWorkflowCompleto(result.results);
                                WF.getExecutionLogs(that, oObject.IdWorkflow).then(function (res) {
                                    if (res[res.length - 1].type === "USERTASK_CREATED") {
                                        var oTareaWF = res[res.length - 1];
                                        var vAprobadorPendiente = oTareaWF.recipientUsers;
                                        var idTareaAprobacion = oThes.NomenclaturaTarea[oObject.IdProceso] + oTareaWF.activityId.split("usertask")[1];
                                        oData = oThes.onCompleteFlujoAprobacion(oData, vAprobadorPendiente, oObject, idTareaAprobacion, oObject.WfSearchValue);
                                        oDialog.getModel("oModelTimeLine").updateBindings();
                                    } else {
                                        oData = oThes.onAddTareasFaltantes(oObject, oData, oObject.WfSearchValue);
                                        oDialog.getModel("oModelTimeLine").updateBindings();
                                    }
                                    oDialog.setBusy(false);
                                }).catch(function (error) {
                                    jQuery.sap.log.error(error);
                                    if (error.code === "bpm.workflowruntime.rest.instance.not.found") {
                                        MessageToast.show(error.message);
                                    }
                                });

                            }
                            oDialog.setModel(new JSONModel(oData), "oModelTimeLine");
                            oDialog.getModel("oModelTimeLine").updateBindings();
                            sap.ui.getCore().byId("idLogDialog--idTimeline").setBusy(false);

                        } else {
                            that.setModel(new JSONModel(), "oModelTimeLine");
                            sap.ui.getCore().byId("idLogDialog--idDialogo").setTitle(oObject.VtextProceso + " N°" + oObject.NroDocumento);

                        }

                    }).catch(function (error) {
                        oThes.getView().setBusy(false);
                        jQuery.sap.log.error(error);
                    });
                }
            }
        },
        getHistorialDetalle: function (oFilter) {
            oThes.getView().setBusyIndicatorDelay(0);
            oThes.getView().setBusy(true);
            Service.onGetHistorialDocumento(oThes, oFilter).then(function (result) {
                oThes.getView().setBusy(false);
                if (result.results.length > 0) {
                    var data = oThes.formatTable(result.results);
                    oThes.setModel(new JSONModel(data), "oModelDocumento");
                } else {
                    oThes.setModel(new JSONModel(), "oModelDocumento");
                }
            }).catch(function (error) {
                oThes.getView().setBusy(false);
                jQuery.sap.log.error(error);
            });
        },
        getFiltroHistorialSRV: function (oData) {
            var temp = {
                "Sociedad": oData.Bukrs,
                "Proceso": oData.ProcesoWf,
                "NroDocumento": oData.NroDocumento
            };
            return temp;
        },
        getFiltroHistorialFFER: function (oData) {
            var temp = {
                "Bukrs": oData.Bukrs,
                "ProcesoWf": oData.ProcesoWf,
                "Belnr": oData.NroDocumento,
                "Gjahr": oData.Gjahr
            };
            return temp;
        },
        handleCloseButton: function (oEvent) {
            oDialog.close();
            oDialog.destroy();
        },
        onExit: function () {
            if (this._oPopover) {
                this._oPopover.destroy();
            }
        },
        formatDetalleWorkflowCompleto: function (result) {
            var vResponse = [];
            result.map(function (item) {
                var d = oThes.detalleFormatDetalleHistorial[item.IdStatus];
                var temp = {
                    "Nombres": item.NombreApellidos,
                    "Title": d.accion,
                    "Photo": "",
                    "Icon": d.icon,
                    "Text": "", //item.IdTareaAprobacion,
                    "Date": oThes.setDateFrontFormat(item.Erdat) + " " + item.Erzet,
                    "Status": d.status,
                    "IdTarea": item.IdTareaAprobacion,
                    "User": item.Uname ? (item.Uname).toUpperCase() : ""
                };
                vResponse.push(temp);
            });
            return vResponse;
        },
        onCompleteFlujoAprobacion: function (oData, vAprobadorPendiente, oDocumento, idTareaAprobacion, WfSearchValue) {
            var that = this;
            oData = that.addTareaEvaluacion(oData, vAprobadorPendiente, idTareaAprobacion);
            if (oDocumento.IdProceso === "P200") {
                for (var i = 0; i < vAprobadorPendiente.length; i++) {
                    if (i > 0) WfSearchValue = WfSearchValue + "|";
                    WfSearchValue = WfSearchValue + vAprobadorPendiente[i];
                }
            }
            var aTarea = this.reglasWF[oDocumento.IdProceso].tareas;
            var ultimaTarea = aTarea[aTarea.length - 1];
            if (ultimaTarea !== idTareaAprobacion) {
                oData = that.onAddTareasFaltantes(oDocumento, oData, WfSearchValue);
            }
            return oData;
        },
        onAddTareasFaltantes: function (oDocumento, oData, WfSearchValue) {
            var reglasFaltantesWF = oThes.getReglasAprobadoresFaltantes(oDocumento, oData, WfSearchValue);
            if (oDocumento.IdProceso === "P200") {
                var oFlujoData = oThes.onGetFlujoAprobadoresEvaluacionPedidoVenta(reglasFaltantesWF, oData);
            } else {
                var oFlujoData = oThes.onGetFlujoAprobadoresEvaluacion(reglasFaltantesWF, oData);
            }
            return oFlujoData;
        },
        onGetFlujoAprobadoresEvaluacion: function (aRegla, oDataFlujo) {
            aRegla.map(function (o) {
                Service.getAprobadorReglasWfSAP(oThes, o.sociedad, o.proceso, o.nivel, o.Tabname, o.Fieldname, o.TabSearch, o.FieldSearch,
                    o.valor).then(function (res) {
                        console.log(res)
                        var vAprobadores = [];
                        if (res.results !== undefined) {
                            if (res.results.length > 0) {
                                for (var i = 0; i < res.results.length; i++) {
                                    vAprobadores.push(res.results[i].Low);
                                }
                                oDataFlujo = oThes.addTareaEvaluacion(oDataFlujo, vAprobadores, o.nivel);
                                oDialog.getModel("oModelTimeLine").updateBindings();
                            }
                        }
                    }).catch(function (error) {
                        if (JSON.parse(error.responseText).error.message.value !== undefined) {
                            var msg = JSON.parse(error.responseText).error.message.value;
                            oThes.showMessageBox(msg, "error");
                        }
                        jQuery.sap.log.error(error);
                    });
            });
            return oDataFlujo;
        },
        getQuienAproboPrimerNivel: function (oDataFlujo) {
            var temp = [];
            temp = oDataFlujo.filter(function (ele) {
                if (ele.IdTarea === "T001")
                    return ele;
            });
            if (temp.length > 0) return temp[0].User;
            else return "";
        },
        onGetFlujoAprobadoresEvaluacionPedidoVenta: function (aRegla, oDataFlujo) {
            if (aRegla.length === 0) { }
            if (aRegla.length === 1) { //falta aprobar el segundo nivel, valor viene vacio
                aRegla[0].valor = oThes.getQuienAproboPrimerNivel(oDataFlujo);
                oThes.getAprobadoresPorNivel(aRegla[0], oDataFlujo);
            }
            if (aRegla.length === 2) { //faltan aprobbar 2 niveles
                var o = aRegla[0];
                var iNroValoresBuscados = o.valor.split("|").length; //Pedido de ventas
                //Pedido de Ventas tiene varios valores buscados
                var aValores = o.valor.split("|");
                //Llama a las promesas tantas veces como iNroValoresBuscados
                var aListaAprobadores = [];
                oThes.ejemplo(o, aValores, iNroValoresBuscados, aListaAprobadores).then(function (result) {
                    oDataFlujo = oThes.addTareaEvaluacion(oDataFlujo, result, o.nivel);
                    oDialog.getModel("oModelTimeLine").updateBindings();
                    var aprobadoresPrimerNivel = "";
                    for (var i = 0; i < result.length; i++) {
                        if (i === 0) {
                            aprobadoresPrimerNivel = result[i];
                        } else {
                            aprobadoresPrimerNivel = aprobadoresPrimerNivel + "|" + result[i];
                        }
                    }
                    aRegla[1].valor = aprobadoresPrimerNivel;
                    oThes.getAprobadoresPorNivel(aRegla[1], oDataFlujo);
                }).catch(function (error) {
                    if (JSON.parse(error.responseText).error.message.value !== undefined) {
                        var msg = JSON.parse(error.responseText).error.message.value;
                        oThes.showMessageBox(msg, "error");
                    }
                    jQuery.sap.log.error(error);
                });
            }
            return oDataFlujo;
        },
        getAprobadoresPorNivel: function (o, oDataFlujo) {
            var iNroValoresBuscados = o.valor.split("|").length; //Pedido de ventas
            //Pedido de Ventas tiene varios valores buscados
            var aValores = o.valor.split("|");
            //Llama a las promesas tantas veces como iNroValoresBuscados
            var aListaAprobadores = [];
            oThes.ejemplo(o, aValores, iNroValoresBuscados, aListaAprobadores).then(function (result) {
                oDataFlujo = oThes.addTareaEvaluacion(oDataFlujo, result, o.nivel);
                oDialog.getModel("oModelTimeLine").updateBindings();
            }).catch(function (error) {
                if (JSON.parse(error.responseText).error.message.value !== undefined) {
                    var msg = JSON.parse(error.responseText).error.message.value;
                    oThes.showMessageBox(msg, "error");
                }
                jQuery.sap.log.error(error);
            });
            return oDataFlujo;
        },
        ejemplo: function (o, svalue_, iValoresLength, aListaAprobadores) {
            var i = iValoresLength;
            return new Promise(function (resolve, reject) {
                Service.getAprobadoresSAP(oThes, o, svalue_[i - 1]).then(function (result) {
                    aListaAprobadores = aListaAprobadores.concat(result);
                    i--;
                    if (i === 0 || i === "0") { //terminó de consultar a todos los aprobadores
                        resolve(aListaAprobadores);
                    } else { //Consulta un nivel más de aprobación
                        oThes.ejemplo(o, svalue_, i, aListaAprobadores).then(function (result2) {
                            resolve(result2);
                        });
                    }
                }).catch(function (error) {
                    reject(error);
                    jQuery.sap.log.error(error);
                });
            });
        },
        addTareaEvaluacion: function (oData, vAprobadorPendiente, idTareaAprobacion) {
            var d = oThes.detalleFormatDetalleHistorial[$.estadoPendiente];
            var sNombresAprobador = "";
            var usuarios = "";
            for (var i = 0; i < vAprobadorPendiente.length; i++) {
                sNombresAprobador = sNombresAprobador + oThes.getIASInformation(vAprobadorPendiente[i]) + ",\n ";
                if (i === 0) {
                    usuarios = vAprobadorPendiente[i];
                } else {
                    usuarios = usuarios + "|" + vAprobadorPendiente[i];
                }
            }
            var text = (sNombresAprobador.length > 30 && sap.ui.Device.browser.mobile) ? "Pueden aprobar:\n" + sNombresAprobador : "";
            var temp = {
                "Nombres": sNombresAprobador,
                "Title": d.accion,
                "Photo": "",
                "Icon": d.icon,
                "Text": text,
                "Date": "",
                "Status": d.status,
                "IdTarea": idTareaAprobacion,
                "User": usuarios
            };
            oData.push(temp);
            return oData;
        },
        getReglasAprobadoresFaltantes: function (oDocumento, oData, WfSearchValue) {
            var vTareasSinEvaluar = [];
            var vTareas = oThes.reglasWF[oDocumento.IdProceso].tareas;
            for (var j = vTareas.length - 1; j >= 0; j--) {
                var isEvaluated = false;
                for (var i = oData.length - 1; i >= 0; i--) {
                    if (oData[i].IdTarea === vTareas[j]) {
                        isEvaluated = true;
                    }
                }
                if (!isEvaluated) {
                    var temp = oThes.reglasWF[oDocumento.IdProceso][vTareas[j]];
                    temp.sociedad = oDocumento.Bukrs;
                    temp.proceso = oDocumento.IdProceso;
                    vTareasSinEvaluar.push(temp);
                }
            }
            var oReglasWF = oThes.onGetReglasFaltantesWF(oDocumento.IdProceso, WfSearchValue, vTareasSinEvaluar.reverse());
            return oReglasWF;
        },
        onGetReglasFaltantesWF: function (IdProceso, vReglas, vTareasSinEvaluar) {
            var result = [];
            var temp = vReglas.split(",");
            temp.map(function (item) {
                var vTask = item.split(";");
                var bHabilitar = [];
                bHabilitar = vTareasSinEvaluar.filter(function (ele) {
                    return (ele.nivel === vTask[0]);
                });
                if (bHabilitar.length > 0) {
                    var aValores = vTask[1].split(":");
                    bHabilitar[0].Tabname = aValores[0];
                    bHabilitar[0].Fieldname = aValores[1];
                    bHabilitar[0].valor = aValores[2];
                    result.push(bHabilitar[0]);
                }
            });
            return result;
        },
        //****************************End Timeline**************************************************

        // --------------------------- Navegación visualizar el detalle ----------------------------
        navToDetail: function (oEvent) {
            var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            var sEtapa = oObject.Zetapa;
            var sProceso = oObject.IdProceso;
            var sSubProceso = oObject.ProcesoWf;
            var sId = oEvent.getSource().getBindingContext("oModelDocumento").getObject().NroDocumento;
            var oModelDocumento = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            return new Promise(function (fnResolve) {
                switch (sSubProceso) {
                    case "0000000005":
                        this.doNavigateReserva("detail", sId, sSubProceso, fnResolve, "");
                        break;
                    case "0000000006":
                        this.doNavigateReserva("detail", sId, sSubProceso, fnResolve, "");
                        break;
                    case "0000000004":
                        this.doNavigate("detailPVenta", sId, fnResolve, "");
                        break;
                    case "0000000003":
                        this.doNavigate("detailIntercompany", sId, fnResolve, "");
                        break;
                    case "0000000001":
                        if (sEtapa == "RENDICIÓN") {
                            this.doNavigateFondoFijo("detailRendicionFF", oModelDocumento, fnResolve, "", false);
						} else {
                            this.doNavigateFondoFijo("detailFondoFijo", oModelDocumento, fnResolve, "", false);
						}
						break;
                    case "0000000002":
                        if (sEtapa == "RENDICIÓN") {
                            this.doNavigateEntregaRendir("detailRendicionER", oModelDocumento, fnResolve, "", false);
						} else {
                            this.doNavigateEntregaRendir("detailEntregaRendir", oModelDocumento, fnResolve, "", false);
                        }
                        break;
                    default:
                        //console.log("Detalle del Documento en Desarrollo.");
                        break;
                }
            }.bind(this))
                .catch(function (err) {
                    if (err !== undefined) {
                        sap.m.MessageBox.error(err.message);
                    }
                });
        },
        navToEdit: function (oEvent) {
            var oObject = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            var sProceso = oObject.IdProceso;
            var sSubProceso = oObject.ProcesoWf;
            var sId = oEvent.getSource().getBindingContext("oModelDocumento").getObject().NroDocumento;
            var oModelDocumento = oEvent.getSource().getBindingContext("oModelDocumento").getObject();
            var sEtapa = oObject.Zetapa;
			var sEstado = oObject.Vtext;
            return new Promise(function (fnResolve) {
                switch (sSubProceso) {
                    case "0000000005":
                        this.doNavigateReserva("detail", sId, sSubProceso, fnResolve, "");
                        break;
                    case "0000000006":
                        this.doNavigateReserva("detail", sId, sSubProceso, fnResolve, "");
                        break;
                    case "0000000004":
                        this.doNavigate("detailPVenta", sId, fnResolve, "");
                        break;
                    case "0000000003":
                        this.doNavigate("detailIntercompany", sId, fnResolve, "");
                        break;
                    case "0000000001":
                      //  this.doNavigateFondoFijo("detailFondoFijo", oModelDocumento, fnResolve, "", true);
                       // break;
                       if (sEtapa == "SOLICITUD") {
							if (sEstado == "PENDIENTE") {
								this.validarNumModifSolicitudFF(oModelDocumento, fnResolve);
							} else if (sEstado == "RECHAZADO") {
								this.validarNumModifSolicitudFF(oModelDocumento, fnResolve);
							}
						}
						if (sEtapa == "RENDICIÓN") {
							this.validarNumModifRenficionFF(oModelDocumento, fnResolve);
						}
						break;
                    case "0000000002":
                      //  this.doNavigateEntregaRendir("detailEntregaRendir", oModelDocumento, fnResolve, "", true);
                       // break;
                        if (sEtapa == "SOLICITUD") {
							if (sEstado == "PENDIENTE") {
								this.validarNumModifSolicitudER(oModelDocumento, fnResolve);
							} else if (sEstado == "RECHAZADO") {
								this.validarNumModifSolicitudER(oModelDocumento, fnResolve);
							}
						}
						if (sEtapa == "RENDICIÓN") {
							this.validarNumModifRendicionER(oModelDocumento, fnResolve);
						}
						break;
                    default:
                        //console.log("Detalle del Documento en Desarrollo.");
                        break;
                }
            }.bind(this))
                .catch(function (err) {
                    if (err !== undefined) {
                        sap.m.MessageBox.error(err.message);
                    }
                });
        },
        validarNumModifSolicitudFF: function (oModelDocumento, fnResolve) {
			var oThes = this;
            oThes.doNavigateFondoFijo("detailFondoFijo", oModelDocumento, fnResolve, "", true);

		/*	oThes.getOwnerComponent().getModel("oDataModelFondoFijo").read("/ModifiDocSet(BELNR='" + oModelDocumento.NroDocumento +
				"',BUKRS='" + oModelDocumento.Bukrs + "',GJAHR='" + oModelDocumento.Gjahr + "')", {
					success: function (result) {
						var nroModif = parseInt(result.NROMODIF, 10);
						if (nroModif < 2) {
							oThes.doNavigateFondoFijo("detailFondoFijo", oModelDocumento, fnResolve, "", true);
						} else {
							MessageBox.error("Este documento ya se ha modificado mas de 2 veces");
						}
					},
					error: function (error) {
						console.log(error)
					}
				})*/
		},
        validarNumModifRenficionFF: function (oModelDocumento, fnResolve) {
			var oThes = this;
            oThes.doNavigateFondoFijo("detailRendicionFF", oModelDocumento, fnResolve, "", true);
		/*	oThes.getOwnerComponent().getModel("oDataModelFondoFijo").read("/ModifiDocSet(BELNR='" + oModelDocumento.NroDocumento +
				"',BUKRS='" + oModelDocumento.Bukrs + "',GJAHR='" + oModelDocumento.Gjahr + "')", {
					success: function (result) {
						var nroModif = parseInt(result.NROMODIF, 10);
						if (nroModif < 2) {
							oThes.doNavigateFondoFijo("detailRendicionFF", oModelDocumento, fnResolve, "", true);
						} else {
							MessageBox.error("Este documento ya se ha modificado mas de 2 veces");
						}
					},
					error: function (error) {
						console.log(error)
					}
				})*/
		},
        validarNumModifSolicitudER: function (oModelDocumento, fnResolve) {
			var oThes = this;
            oThes.doNavigateEntregaRendir("detailEntregaRendir", oModelDocumento, fnResolve, "", true);

			/*oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ModifiDocSet(BELNR='" + oModelDocumento.NroDocumento +
				"',BUKRS='" + oModelDocumento.Bukrs + "',GJAHR='" + oModelDocumento.Gjahr + "')", {
					success: function (result) {
						var nroModif = parseInt(result.NROMODIF, 10);
						if (nroModif < 2) {
							oThes.doNavigateEntregaRendir("detailEntregaRendir", oModelDocumento, fnResolve, "", true);
						} else {
							MessageBox.error("Este documento ya se ha modificado  2 veces");
						}
					},
					error: function (error) {
						console.log(error)
					}
				})*/

		},
        validarNumModifRendicionER: function (oModelDocumento, fnResolve) {
			var oThes = this;
            oThes.doNavigateEntregaRendir("detailRendicionER", oModelDocumento, fnResolve, "", true);

			/*oThes.getOwnerComponent().getModel("oDataModelEntregasRendir").read("/ModifiDocSet(BELNR='" + oModelDocumento.NroDocumento +
				"',BUKRS='" + oModelDocumento.Bukrs + "',GJAHR='" + oModelDocumento.Gjahr + "')", {
					success: function (result) {
						var nroModif = parseInt(result.NROMODIF, 10);
						if (nroModif < 2) {
							oThes.doNavigateEntregaRendir("detailRendicionER", oModelDocumento, fnResolve, "", true);
						} else {
							MessageBox.error("Este documento ya se ha modificado  2 veces");
						}
					},
					error: function (error) {
						console.log(error)
					}
				})*/

		},
        doNavigate: function (sRouteName, sId, fnPromiseResolve, sViaRelation) {
            var sId_ = "";
            if (sId !== undefined) {
                sId_ = sId;
            } else {
                sId_ = 0;
            }
            //alert(sRouteName);
            this.oRouter.navTo(sRouteName, {
                idDocumento: sId_
            }, false);

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }
        },
        doNavigateReserva: function (sRouteName, sId, sSubProceso, fnPromiseResolve, sViaRelation) {
            var nameSubProceso = "";
            if (sSubProceso === "0000000001") {
                nameSubProceso = "-CONSUMO";
            }
            if (sSubProceso === "0000000002") {
                nameSubProceso = "-CONSIGNACION";
            }
            var sId_ = "";
            if (sId !== undefined) {
                sId_ = sId;
            } else {
                sId_ = 0;
            }
            //alert(sRouteName);
            sId_ = sId_ + nameSubProceso;
            this.oRouter.navTo(sRouteName, {
                idDocumento: sId_
            }, false);

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }
        },
        doNavigateFondoFijo: function (sRouteName, oModelDocumento, fnPromiseResolve, sViaRelation, enabledCampos) {
            this.oRouter.navTo(sRouteName, {
                Bukrs: oModelDocumento.Bukrs,
                Belnr: oModelDocumento.NroDocumento,
                Gjahr: oModelDocumento.Gjahr,
                Retiro: oModelDocumento.Zretiro,
                Enabled: enabledCampos
            }, false);

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }
        },
        doNavigateEntregaRendir: function (sRouteName, oModelDocumento, fnPromiseResolve, sViaRelation, enabledCampos) {
            this.oRouter.navTo(sRouteName, {
                Bukrs: oModelDocumento.Bukrs,
                Belnr: oModelDocumento.NroDocumento,
                Gjahr: oModelDocumento.Gjahr,
                Enabled: enabledCampos
            }, false);

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }
        },
        getIASInformation: function (sUserEmail) {
            var that = this;
            var sUserFullname = "";
            if (!sUserEmail) {
                return sUserFullname;
            }

            const sPath = 'iasscim/Users?filter=emails.value eq "' + sUserEmail + '"';
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(sPath);
            $.ajax({
                url: sUrl,
                cache: false,
                async: false,
                contentType: false,
                processData: false,
                type: "GET",
                success: function (data) {
                    console.log("USUARIO", data);
                    if (data.Resources[0]) {
                        var oDataAprobador = data.Resources[0];
                        sUserFullname = `${oDataAprobador.name.givenName || ""} ${oDataAprobador.name.familyName || ""}`;
                        // return oDataAprobador.name.givenName + " " + oDataAprobador.name.familyName;
                    }
                    //let aAttributes = oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                    /*   oData = {
                           company: "",
                           email: data.Resources[0].emails[0].value,
                           emails: data.Resources[0].emails[0].value,
                           firstName: data.Resources[0].name.givenName,
                           groups: data.Resources[0].groups,
                           lastName: data.Resources[0].name.familyName,
                           loginName: data.Resources[0].userName,
                           name: data.Resources[0].userName, // Se usa para validar usuario en SAP
                           ruc: "",
                       };
        
                       Log.info("[CC] Home.controller - getUserApi - IAS SCIM API Result", JSON.stringify(oData)); */
                    //resolve(data.Resources[0])
                    //resolve(oData);
                },
                error: function (error) {
                    Log.info("[CC] Home.controller - getUserApi - IAS SCIM API Result", error);
				    MessageBox.error(that.getI18nText("msgErrorIasApi"));
                },
            });

            return sUserFullname;
        },
        // --------------------------- End Navegación visualizar el detalle ------------------------

        elaborarFlujoDeAprobacionERFF: function (oObject, aHistorialFiltrado, aDetalleSAP) {
            var formato, aHistorialERFF = [],
                that = this;
			/*	"0000000000": {
					"accion": "generó el documento.",
					"icon": "sap-icon://document-text",
					"status": "Information"
				},
				"0000000002": {
					"accion": "pendiente de aprobación.",
					"icon": "sap-icon://customer",
					"status": "Warning"
				},
				"0000000003": {
					"accion": "aprobó el documento.",
					"icon": "sap-icon://employee-approvals",
					"status": "Success"
				},
				"0000000004": {
					"accion": "rechazó el documento.",
					"icon": "sap-icon://employee-rejections",
					"status": "Error"
				},
				"0000000005": {
					"accion": "anuló el documento.",
					"icon": "sap-icon://delete",
					"status": "Error"
				},
				"0000000006": {
					"accion": "contabilizó el documento.",
					"icon": "sap-icon://accounting-document-verification",
					"status": "Error"
				}*/
            var aFormatter = that.formatDetalleHistorialFFER;
            aHistorialFiltrado.forEach(function (o) {

                var oTimelineItem = {};
                 console.log("debe ser correo",o.userId)
                if (o.type === "WORKFLOW_STARTED") {
                    formato = aFormatter["0000000000"];
                    oTimelineItem.Icon = formato.icon;
                    oTimelineItem.Title = formato.accion;
                    oTimelineItem.Status = formato.status;
                  //  oTimelineItem.User = o.userId;
                    oTimelineItem.User = that.getIASInformation(o.userId);
                    console.log(oTimelineItem.User);
                  //  oTimelineItem.Date = Formatter.dateView(o.timestamp);
                    //oTimelineItem.Text="Etapa Solicitud";

                } else if (o.type === "USERTASK_CREATED") {
                    formato = aFormatter["0000000002"];
                    oTimelineItem.Icon = formato.icon;
                    oTimelineItem.Title = formato.accion;
                    oTimelineItem.Status = formato.status;
                    //oTimelineItem.User = o.userId;
                    oTimelineItem.User = that.getIASInformation(o.userId);
                    console.log(oTimelineItem.User);
                    oTimelineItem.Date = Formatter.dateView(o.timestamp);
                } else if (o.type === "USERTASK_COMPLETED") {
                    if (o.status.split(" ")[0].toUpperCase() === "APROBAR" || o.status.split(" ")[1].toUpperCase() ===
                        "APROBADOR") {
                        formato = aFormatter["0000000003"];
                        oTimelineItem.Icon = formato.icon;
                        oTimelineItem.Title = formato.accion;
                        oTimelineItem.Status = formato.status;
                      //  oTimelineItem.User = o.userId;
                       oTimelineItem.User = that.getIASInformation(o.userId);
                       console.log(oTimelineItem.User);
                        oTimelineItem.Date = Formatter.dateView(o.timestamp);
                    } else {
                        formato = aFormatter["0000000004"];
                        oTimelineItem.Icon = formato.icon;
                        oTimelineItem.Title = formato.accion;
                        oTimelineItem.Status = formato.status;
                       // oTimelineItem.User = o.userId;
                        oTimelineItem.User = that.getIASInformation(o.userId);
                        console.log(oTimelineItem.User);
                        oTimelineItem.Date = Formatter.dateView(o.timestamp);
                    }

                } else if (o.type === "WORKFLOW_CANCELED") {
                    formato = aFormatter["0000000005"];
                    oTimelineItem.Icon = formato.icon;
                    oTimelineItem.Title = formato.accion;
                    oTimelineItem.Status = formato.status;
                   // oTimelineItem.User = o.userId;
                    oTimelineItem.User = that.getIASInformation(o.userId);
                    console.log(oTimelineItem.User);
                    oTimelineItem.Date = Formatter.dateView(o.timestamp);
                }

                aHistorialERFF.push(oTimelineItem);
            });

            ///Estados ERP

            aDetalleSAP.forEach(function (o) {

                var oTimelineItem = {};
                if (o.Action === "ANULÓ EL DOCUMENTO") {

                    formato = aFormatter["0000000005"];
                    oTimelineItem.Icon = formato.icon;
                    oTimelineItem.Title = formato.accion;
                    oTimelineItem.Status = formato.status;
                    oTimelineItem.User = o.NameText;
                    oTimelineItem.Date =  (!o.DateTime == null ) ? o.DateTime.toLocaleString(): "";
                } else
                    if (o.Action === "CONTABILIZÓ EL DOCUMENTO") {
                        formato = aFormatter["0000000006"];
                        oTimelineItem.Icon = formato.icon;
                        oTimelineItem.Title = formato.accion;
                        oTimelineItem.Status = formato.status;
                        oTimelineItem.User = o.NameText;
                        oTimelineItem.Date = (!o.DateTime == null ) ? o.DateTime.toLocaleString(): "";
                        //oTimelineItem.Text="Etapa Solicitud";

                    } else if (o.Action === "RECHAZÓ EL DOCUMENTO") {
                        formato = aFormatter["0000000004"];
                        oTimelineItem.Icon = formato.icon;
                        oTimelineItem.Title = formato.accion;
                        oTimelineItem.Status = formato.status;
                        oTimelineItem.User = o.NameText;
                        oTimelineItem.Date = (!o.DateTime == null ) ? o.DateTime.toLocaleString(): "";
                    }

                if (Object.entries(oTimelineItem).length !== 0) {
                    aHistorialERFF.push(oTimelineItem);
                }

            });

			/*		var oUltimoRegistroHistorial = aHistorialFiltrado[aHistorialFiltrado.length - 1];
					var bFlujoTerminado,
						bAnulado;
					var aFormatter = this.formatDetalleHistorialFFER;
					var oFormato = {};
					var aData = [];

					if (oUltimoRegistroHistorial.type === "USERTASK_COMPLETED" || oUltimoRegistroHistorial.type === "WORKFLOW_CANCELED") {
						bFlujoTerminado = true;
					} else {
						bFlujoTerminado = false;
					}

					var oTimelineItem = {};

					if (!bFlujoTerminado) {
						var oInicioFlujo = aHistorialFiltrado.shift();
						oFormato = aFormatter["0000000000"];
						oTimelineItem = {
							"Nombres": this.getIASInformation(oInicioFlujo.userId),
							"Title": oFormato.accion,
							"Photo": "",
							"Icon": oFormato.icon,
							"Date": oInicioFlujo.timestamp,
							"Status": oFormato.status
						};
						aData.push(oTimelineItem);
					} else {
						bAnulado = aDetalleSAP[0].Action === "ANULÓ EL DOCUMENTO" ? true : false;
					}

					oTimelineItem = {
						"Nombres": sNombresAprobador,
						"Title": d.accion,
						"Photo": "",
						"Icon": d.icon,
						"Text": text,
						"Date": "",
						"Status": d.status,
						"User": usuarios
					};*/
            return aHistorialERFF;
        },
        //Llamar a la pagina de crear gasto

    });
});