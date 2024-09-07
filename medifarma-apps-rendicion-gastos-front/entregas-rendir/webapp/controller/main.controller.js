sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/odata/v4/ODataModel",
        "everis/apps/entregasRendir/controller/Workflow",
        "everis/apps/entregasRendir/controller/File",
        "everis/apps/entregasRendir/model/Formatter",
        "everis/apps/entregasRendir/controller/DocumentService",
        "sap/m/MessageToast",
        "sap/ui/core/ValueState",
        "everis/apps/entregasRendir/utils/Validator",
        "sap/ui/core/BusyIndicator",
        "sap/base/Log",
        "everis/apps/entregasRendir/lib/Backend",
        "everis/apps/entregasRendir/lib/Developer",
        "everis/apps/entregasRendir/lib/Sharepoint"
        // "../lib/Backend",
        // "../lib/Developer",
        //"../lib/Sharepoint"

    ],
    function (
        Controller,
        MessageBox,
        Filter,
        FilterOperator,
        JSONModel,
        ODataModel,
        Workflow,
        File,
        formatter,
        DS,
        MessageToast,
        ValueState,
        Validator,
        BusyIndicator,
        Log,
        Backend,
        Developer,
        Sharepoint
    ) {
        "use strict";
        return Controller.extend("everis.apps.entregasRendir.controller.main", {
            formatter: formatter,
            xmlFragmentConceptoHelp: "everis.apps.entregasRendir.view.fragment.conceptoDialogHelp",
            xmlFragmentTipoObjetoCostoHelp: "everis.apps.entregasRendir.view.fragment.tipoObjetoCostoDialogHelp",
            xmlFragmentObjetoCostoHelp: "everis.apps.entregasRendir.view.fragment.objetoCostoDialogHelp",
            xmlFragmentOrdenHelp: "everis.apps.entregasRendir.view.fragment.ordenDialogHelp",
            file: File,
            xmlFragmentFilterDialog: "everis.apps.entregasRendir.view.fragment.FilterDialog",
            onInit: function () {
                var that = this;
                sap.ui.core.BusyIndicator.show(0);

                this._initConfig();
                this._initState();

                Backend.initialize(this.getOwnerComponent().getModel("UtilsModel"));
                Backend
                    .getParameters("RENDICION_GASTOS", null)
                    .then((aParameters) => {
                        const aParamsToParse = this.getOwnerComponent().getModel("Config").getData().parameters;
                        this._setParameters(aParameters);
                        return Backend.parseParameters(aParameters, aParamsToParse);
                    })
                    .then((paramValues) => {
                        this.setLocalModels();
                        this.setupValidation();
                        var oParemtesrmodel = {
                            AMBIENTE: "DEV",
                            BUSQUEDA_CAMPO: "PLANS",
                            BUSQUEDA_TABLA: "PA0001",
                            CAJA_REEMBOLSO: "C006",
                            FILTRO_CAMPO: "SOLICITANTE1",
                            GROUP_ADMIN: "RENDICION_GASTOS_ADMIN",
                            FILTRO_TABLA: "ZST_ENTREGARENDIR",
                            GASTO_NIVEL_APROBACION_1: "G001",
                            GASTO_NIVEL_APROBACION_2: "G002",
                            GASTO_NIVEL_APROBACION_3: "G003",
                            PROCESO: "P020",
                            REGLA: "",
                            MONEDA: ['PEN', 'USD'],
                            SOCIEDAD_CARPETA:[
                              {  valueHigh: "20521586134",
                                 valueLow: "1000"
                              }                    
                            ],
                            SOLICITUD_NIVEL_APROBACION_1: "S001",
                            SOLICITUD_NIVEL_APROBACION_2: "S002"
                        };
                        sap.ui.getCore().setModel(new JSONModel(paramValues["ENTREGAS_RENDIR"]), "ParametersModel");
                        this._parameters = sap.ui.getCore().getModel("ParametersModel").getData();
                        this.parameters = sap.ui.getCore().getModel("ParametersModel").getData();
                        var oSharePoint = {
                            ROOT_DIRECTORY: "Documentos Compartidos",
                            URL: "https://medifarmape.sharepoint.com/sites/Aplicaciones_SAP_REPO/_api/web/"
                        }
                        this._initSharepoint(paramValues["SHAREPOINT"]);
                        //this._initSharepoint(paramValues["SHAREPOINT"]);
                        return this.getUserApi();
                    })
                    .then((oUserApi) => {
                        // TODO:
                        let isUserSolicitante = oUserApi.groups.find((x) => x.value === this.parameters.GROUP_ADMIN) ? "" : "X";

                        this.oGeneral = new JSONModel({
                            lableTipoObjetoCosto: "Tipo Objeto Costo",
                            labelObjetoCosto: "Centro de Coste",
                            enableObjetoCosto: true,
                            isAdmin: isUserSolicitante === "X",
                            displayAdicionales: false
                        });
                        this.getView().setModel(this.oGeneral, "oGeneral");
                        this.getentregaAdicional();
                        this.onGetIasData(oUserApi.name, isUserSolicitante).then(() => {
                            that.getSAPEmailSolicitante(oUserApi);
                        }).catch((msg) => {
                            that.showMessageBoxAndBack(msg, "error");
                        });
                    })
                    .catch((error) => {
                        this.showMessageBoxAndBack(error.message, "error");
                    })
                    .finally(() => {
                        sap.ui.core.BusyIndicator.hide();
                    });
            },

            getentregaAdicional: function () {
                var that = this;
                var oModel = this.getOwnerComponent().getModel("oEntregaModel");
                sap.ui.core.BusyIndicator.show(0);
                oModel.read("/ERAdicionalSet", {
                    //  filters: aFilter,
                    async: false,
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        that.getView().setModel(new JSONModel(result.results), "oAdicionalModel");
                        //sap.ui.getCore().setModel(result.results, "oTablaDetSolicitud");
                        // this.getView().byId("idFragDetSolicitud--idTablaDetSolicitud").setModel(new JSONModel(result.results));
                    },
                    error: (error) => {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(that.getI18nText("msgServicioOdataError"), {
                            title: "Error",
                            details: "<p><strong>Datos del error:</strong></p>\n" +
                                "<ul>" +
                                `<li>Código: <strong>${error.statusCode}</strong></li>` +
                                `<li>Estado: ${error.statusText}</li>` +
                                `<li>Mensaje: ${error.message}</li>` +
                                "</ul>",
                            contentWidth: "100px",
                            styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                            onclose: function () {
                                window.history.go(-1);
                            }
                        });
                    },
                });
            },

            _setParameters: function (aParameters) {
                const aParamsToParse = this.getOwnerComponent().getModel("Config").oData.parameters;

                this.parameters = {};

                aParamsToParse["ENTREGAS_RENDIR"].forEach((param) => {
                    const foundParams = aParameters.filter((x) => x.Field === param.key);

                    if (param.array) {
                        if (param.highValue) {
                            this.parameters[param.key] = foundParams.map((p) => {
                                return { valueLow: p.ValueLow, valueHigh: p.ValueHigh };
                            });
                        } else {
                            this.parameters[param.key] = foundParams.map((p) => p.ValueLow);
                        }
                    } else if (foundParams.length === 0 && param.mandatory) {
                        Log.error("[ER] main.controller - _setParameters - Mandatory parameter not set", param.key);
                        throw new Error(this.getI18nText("mandatoryParameter", [param.key]));
                    } else {
                        this.parameters[param.key] = foundParams[0].ValueLow;
                    }
                });
            },
            _initSharepoint: function (oValues) {
                Sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
                Sharepoint.setUrl(oValues.URL);
                Sharepoint.setGetTokenFn(() => {
                    return Backend.getSharepointToken("RENDICION_GASTOS");
                });
            },
            _initState: function () {
                this.state = {
                    hasSolicitudes: false,
                    bRucProveedor: false,
                    plans: "",
                    tablaFiltro: "",
                    campoFiltro: "",
                    // estadoFiles: 0, NO USADO
                };

                this.listaGasto = [];
            },
            _initConfig: function () {
                // TEST: Turn on Test mode when executed from localhost or (BAS) workspaces
                let bTestModeOn = window.location.host.includes("localhost") || window.location.host.includes("workspaces-ws");

                // Set configuration values
                // Use it like `this.configModel.testModeOn`
                this.config = {
                    testModeOn: bTestModeOn,
                };

                if (this.config.testModeOn) {
                    Log.setLevel(Log.Level.DEBUG);
                    Log.info("[ER] main.controller - _initConfig", "Modo test activado");
                } else {
                    Log.setLevel(Log.Level.INFO);
                }
            },
            onAfterRendering: function () { },
            onBeforeRendering: function () { },
            onChange: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                let file = oEvent.getParameter("files")[0];
                //let file = oEvent.getParameter("files");
                let jsondataAdjunto;
                this.base64coonversionMethod(file).then((result) => {
                    jsondataAdjunto = {
                        LoioId: jQuery.now().toString(),
                        flagLogioId: true,
                        Descript: this.llamada(file.name).replace("." + this.getFileExtension(file.name), ""), //pguevarl - file.name.replace("." + this.getFileExtension(file.name), ""),
                        DocType: this.getFileExtension(file.name),
                        mimeType: file.type,
                        FileName: this.llamada(file.name), //pguevarl - file.name,
                        Data: result,
                    };
                    this.getView().getModel("Documents").getData().unshift(jsondataAdjunto);
                    this.getView().getModel("Documents").refresh();
                    this.getView().getModel("Documents").updateBindings(true);
                });
            },
            onChangeDevolucion: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                let file = oEvent.getParameter("files")[0];
                //let file = oEvent.getParameter("files");
                let jsondataAdjunto;
                this.base64coonversionMethod(file).then((result) => {
                    jsondataAdjunto = {
                        LoioId: jQuery.now().toString(),
                        flagLogioId: true,
                        Descript: this.llamada(file.name).replace("." + this.getFileExtension(file.name), ""), //pguevarl - file.name.replace("." + this.getFileExtension(file.name), ""),
                        DocType: this.getFileExtension(file.name),
                        mimeType: file.type,
                        FileName: this.llamada(file.name), //pguevarl - file.name,
                        Data: result,
                    };
                    this.getView().getModel("DocumentsDevolucion").getData().unshift(jsondataAdjunto);
                    this.getView().getModel("DocumentsDevolucion").refresh();
                    this.getView().getModel("DocumentsDevolucion").updateBindings(true);
                });
            },
            base64coonversionMethod: function (file) {
                return new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = (readerEvt) => {
                        let binaryString = readerEvt.target.result;
                        //resolve(this.base64toHEX(btoa(binaryString)));
                        resolve(this.getBlobFromFile(binaryString));
                        // console.log(this.toHexString(binaryString))
                        // resolve(binaryString);
                    };
                    reader.readAsDataURL(file);
                    //reader.readAsBinaryString(file);
                });
            },
            base64toHEX: function (base64) {
                let raw = atob(base64);
                let HEX = "",
                    _hex;
                for (let i = 0; i < raw.length; i++) {
                    _hex = raw.charCodeAt(i).toString(16);
                    HEX += _hex.length == 2 ? _hex : "0" + _hex;
                }
                return HEX.toUpperCase();
            },
            getBlobFromFile: function (sFile) {
                let contentType = sFile.substring(5, sFile.indexOf(";base64,"));

                let base64_marker = "data:" + contentType + ";base64,";
                let base64Index = base64_marker.length;
                contentType = contentType || "";
                let sliceSize = 512;
                let byteCharacters = window.atob(sFile.substring(base64Index)); //method which converts base64 to binary
                let byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    let slice = byteCharacters.slice(offset, offset + sliceSize);
                    let byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    let byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                let blob = new Blob(byteArrays, {
                    type: contentType,
                });

                return blob;
            },
            getFileExtension: function (filename) {
                let ext = /^.+\.([^.]+)$/.exec(filename);
                return ext == null ? "" : ext[1];
            },
            setLocalModels: function () {
                // Inicio - Se agrega esta sección ya que no hay un lugar mejor
                this.state.tablaFiltro = this.parameters.FILTRO_TABLA;
                this.state.campoFiltro = this.parameters.FILTRO_CAMPO;
                // Fin

                this.getView().setModel(
                    new JSONModel(
                        this.parameters.MONEDA.map((x) => {
                            return {
                                Waers: x,
                            };
                        })
                    ),
                    "moneda"
                );

                this.getView().setModel(null, "devolucion");
                let oisMobile = sap.ui.Device.system.phone,
                    oVariablesGlobales = {};
                oVariablesGlobales.repeticion = 0;
                oVariablesGlobales.carpetaEntregasRendir = "ENTREGASRENDIR";
                oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
                oVariablesGlobales.carpetaGasto = "GASTOS";
                sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");
                if (!oisMobile) {
                    this.getView().byId("idPagCrearSolicitud").setShowNavButton(false);
                }
                let oModel = new JSONModel([]);
                this.getView().setModel(oModel, "Documents");
                let oModelDev = new JSONModel([]);
                this.getView().setModel(oModelDev, "DocumentsDevolucion");
                let oModelDocSolicitud = new JSONModel([]);
                this.getView().setModel(oModelDocSolicitud, "DocumentsSolicitud");
                //LR 26/12
                let oModelView = new JSONModel([]);
                this.getView().setModel(oModelView, "Documentos");
                //Variables DocumentService
                let fileUploadImagenes = [];
                sap.ui.getCore().setModel(fileUploadImagenes, "fileUploadImagenes");
                let fileUploadImagenesDevolucion = [];
                sap.ui.getCore().setModel(fileUploadImagenesDevolucion, "fileUploadImagenesDevolucion");

                // let idrepositorio = "1a084adbc0dc11ba63fc49e5"; //PRD
                let idrepositorio = "ea56a4f9aff8479818fc49e5"; //QAS

                // TODO: FIX:
                let carpetaP = "Prueba/Repositorio";
                let route = {};

                route.subcarpeta01 = "ENTREGASRENDIR";
                route.subcarpeta02 = "SOLICITUDES";
                route.solicitud = "6000000044100024";
                sap.ui.getCore().setModel(idrepositorio, "idrepositorio");
                sap.ui.getCore().setModel(carpetaP, "carpetaP");
                sap.ui.getCore().setModel(route, "route");

                /*********11/09/2019*******/
                let temp = {
                    tiposObjetosCosto: [],
                    objetosCosto: [],
                    Rstyp: {
                        code: "",
                        name: "",
                    },
                    Kostl: {
                        code: "",
                        name: "",
                    },
                    Bukrs: {
                        code: "",
                    },
                    conceptos: [],
                    idFolderSolicitudGenerada: "",
                };
                this.oVariablesJSONModel = new JSONModel(temp);
                this.getView().setModel(this.oVariablesJSONModel, "oVariablesJSONModel");
            },
            getUserApi: function () {
                return new Promise((resolve, reject) => {
                    /*let userModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true", null, false);
                          userModel.attachRequestCompleted(function () {
                              let oUsuario = this.getData();
                              resolve(oUsuario);
                          });*/
                    /*
                          let sUrl = sDestino;
                          let oModel = new JSONModel();
                          oModel.loadData(sUrl, null, true, "GET", false, true);
          
                          oModel.attachRequestCompleted((oRequest) => {
                          if (oRequest.getParameter("success")) {
                              let oData = oModel.getData();
                              resolve(oData);
                          } else {
                              reject("Ocurrio un error al recuperar los datos del usuario");
                          }
                          });
          
                          oModel.attachRequestFailed(() => {
                          reject("error");
                          });*/
                    let sEmail = "";
                    // if (!this.configModel.testModeOn) {
                    // If not in test mode
                    if (sap.ushell !== undefined) {
                        sEmail = sap.ushell.Container.getUser().getEmail();
                    }

                    if (sEmail) {
                        Log.info("[ER] main.controller - getUserApi - User Mail", sEmail);
                    } else if (this.config.testModeOn) {
                        sEmail = "hmunoz@everis.com";
                    }

                    // if (sMail === "DEFAULT_USER" || sMail === undefined) {
                    // 	sMail = "bvillavi@everis.com"
                    // };
                    const sPath = 'iasscim/Users?filter=emails.value eq "' + sEmail + '"';
                    const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(sPath);
                    $.ajax({
                        url: sUrl,
                        // data: formData,
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

                            Log.info("[ER] main.controller - getUserApi - IAS SCIM API Result", JSON.stringify(oData));
                            /*if (aAttributes !== undefined) {
                                          oData.ruc = oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                                      }*/
                            // let oUserModel = new JSONModel(oData);
                            resolve(oData);
                        },
                        error: function (error) {
                            reject(error);
                        },
                    });
                    // } else {
                    //   resolve({
                    //     company: "",
                    //     email: "ctapisab@everis.com",
                    //     emails: [{ value: "ctapisab@everis.com" }],
                    //     firstName: "Christian",
                    //     groups: [],
                    //     lastName: "Tapia Sabogal",
                    //     loginName: "HMUÑOZ",
                    //     name: "HMUÑOZ",
                    //     ruc: "",
                    //   });
                    // }
                });
            },
            onGetIasData: function (idIas, isUserSolicitante) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    that.getView().setBusyIndicatorDelay(0);
                    that.getView().setBusy(true);
                    that.getOwnerComponent().getModel("oEntregaModel").read("/IasSet('" + idIas + "')", {
                        success: (result, status, xhr) => {
                            that.getView().setBusy(false);
                            if (result.Bukrs) {
                                sap.ui.getCore().setModel(result, "oModelIas");
                                sap.ui.core.BusyIndicator.hide();
                                result.isUserSolicitante = isUserSolicitante;
                                sap.ui.getCore().setModel(result, "InfoIas");
                                const oSociedadCarpeta = that.parameters.SOCIEDAD_CARPETA.find((x) => x.valueLow === result.Bukrs);
                                if (oSociedadCarpeta) {
                                    that.onCrearSolicitud();
                                    resolve();
                                } else {
                                    that.getView().setBusy(false);
                                    let msg = "Su usuario no tiene asignada una sociedad válida.";
                                    reject(msg);
                                }
                            } else {
                                that.getView().setBusy(false);
                                let msg = "Su usuario no se encuentra registrado correctamente en SAP.";
                                reject(msg);
                            }
                        },
                        error: function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error(that.getI18nText("msgServicioOdataError"), {
                                title: "Error",
                                details: "<p><strong>Datos del error:</strong></p>\n" +
                                    "<ul>" +
                                    `<li>Código: <strong>${error.statusCode}</strong></li>` +
                                    `<li>Estado: ${error.statusText}</li>` +
                                    `<li>Mensaje: ${error.message}</li>` +
                                    "</ul>",
                                contentWidth: "100px",
                                styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                onClose: function () {
                                    window.history.go(-1);
                                }
                            });
                        },
                    });
                });
            },
            //navButtonPress desde Gastos
            onIrListaMSolicitud: function () {
                this.onCargarListaMSolicitud();
                this.onCargarListaGastos();
                this.onIrListaDSolicitud();
                this.onNavToPage("idListaSolicitud");
            },
            //llenado de lista Master de solicitud
            onCargarListaMSolicitud: function () {
                let ODataEntrega = this.getOwnerComponent().getModel("oEntregaModel");
                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                if (typeof InfoIas === "undefined" || InfoIas === "") {
                    let msg = "El usuario no se encuentra registrado en SAP.";
                    this.showMessageBoxAndBack(msg, "error");
                } else {
                    this._oModelHeaders = {
                        Bukrs: InfoIas.Bukrs,
                        UsuarioIas: InfoIas.Sysid,
                        isUserSolicitante: InfoIas.isUserSolicitante,
                    };
                    ODataEntrega.read("/zsolicitudSet", {
                        headers: this._oModelHeaders,
                        success: (result, status, xhr) => {
                            sap.ui.core.BusyIndicator.hide();
                            if (result.results.length > 0) {
                                this.state.hasSolicitudes = true;
                                let oPrimerSolicitud = result.results[result.results.length - 1];
                                $.each(result.results, (key, value) => {
                                    let monto = String(value.Wrbtr);
                                    value.Wrbtr = monto.substring(0, monto.length - 1);
                                    //LR 29/12
                                    value.Wrbtr = parseFloat(value.Wrbtr).toFixed(2);
                                    value.fechaSeteada = this.setFormatterDate(value.Bldat, "0");
                                });
                                let listaSol = new JSONModel(result.results);
                                this.listSolic = result.results;
                                listaSol.setSizeLimit(999999999);

                                this.getView().byId("idFragListaSolicitud--idListaSolicitud").setModel(listaSol);
                                this.onPrimerSolicitud(oPrimerSolicitud);
                                if (this.state.hasSolicitudes) {
                                    this.onCargarListaGastos();
                                }
                                if (oPrimerSolicitud.Status !== "A") {
                                    this.byId("idCrearGastoxSol").setVisible(false);
                                } else {
                                    this.byId("idCrearGastoxSol").setVisible(true);
                                }
                            } else {
                                this.byId("idCrearGastoxSol").setVisible(false);
                            }
                        },
                        error: (oError) => {
                            // Error
                            sap.ui.core.BusyIndicator.hide();
                            if (oError.responseText !== "") {
                                let txt =
                                    "Ocurrió un error en SAP.\n\n" +
                                    JSON.parse(oError.responseText).error.message.value +
                                    "\n" +
                                    JSON.parse(oError.responseText).error.code;
                                MessageBox.error(txt);
                            } else {
                                MessageBox.error(
                                    "Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas."
                                );
                            }
                        },
                    });
                }
            },

            //llenar Primer solicitud
            onPrimerSolicitud: function (oPrimerSolicitud) {
                this.byId("idPagDetSolicitud").setTitle("Solicitud N°" + oPrimerSolicitud.ParkedDocument);
                let sZcat = oPrimerSolicitud.Zcat + " - " + oPrimerSolicitud.ZcatText;
                oPrimerSolicitud.sZcatCompleto = sZcat;
                sap.ui.getCore().setModel(oPrimerSolicitud, "oSolicitudSeleccionada");
                this.getView().byId("idFragDetSolicitud--idDetSolicitud").setModel(new JSONModel(oPrimerSolicitud));
                this.onCargarTablaDetSolicitud();
            },
            //llena la tabla detalle de solicitud ///funcion provisional
            onCargarTablaDetSolicitud: function () {
                let oModel = this.getOwnerComponent().getModel("oEntregaModel"),
                    aFilter = [],
                    oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
                aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionada.Bukrs));
                aFilter.push(new Filter("Belnr", FilterOperator.EQ, oSolicitudSeleccionada.ParkedDocument));
                aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oSolicitudSeleccionada.Gjahr));
                sap.ui.core.BusyIndicator.show(0);
                oModel.read("/DetSolicitudSet", {
                    filters: aFilter,
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        $.each(result.results, function (key, value) {
                            let monto = String(value.Wrbtr);
                            value.Wrbtr = monto.substring(0, monto.length - 1);
                        });
                        sap.ui.getCore().setModel(result.results, "oTablaDetSolicitud");
                        this.getView().byId("idFragDetSolicitud--idTablaDetSolicitud").setModel(new JSONModel(result.results));
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(error);
                    },
                });
            },
            //al hacer click sobre el botón de navegación hacia Gastos
            onIrListaMGasto: function () {
                this.onCargarListaGastos();
                this.onIrListaDGastos();
                this.onNavToPage("idListaGastos");
            },
            //Se llama al hacer clic sobre un elemento de la lista de Solicitudes
            onSeleccionSolicitud: function (oEvent) {
                let oSolSelecionada = oEvent.getSource().getBindingContext().getObject();
                oSolSelecionada.sZfondoCompleto = "";
                oSolSelecionada.sZcatCompleto = "";
                this.byId("idPagDetSolicitud").setTitle("Solicitud N°" + oSolSelecionada.ParkedDocument);
                this.onNavToPage("idPagDetSolicitud");
                let sZfondo, sZcat;
                sZcat = oSolSelecionada.Zcat + " - " + oSolSelecionada.ZcatText;
                oSolSelecionada.sZfondoCompleto = sZfondo;
                oSolSelecionada.sZcatCompleto = sZcat;
                sap.ui.getCore().setModel(oSolSelecionada, "oSolicitudSeleccionada");
                this.getView().byId("idFragDetSolicitud--idDetSolicitud").setModel(new JSONModel(oSolSelecionada));
                this.onCargarTablaDetSolicitud();
                if (oSolSelecionada.Status !== "A") {
                    this.byId("idCrearGastoxSol").setVisible(false);
                } else {
                    this.byId("idCrearGastoxSol").setVisible(true);
                }
                //llamar odata donde se debe modificar el formulario y la tabla detalle
            },
            onFilterS: function () {
                this.onFilter("S");
            },
            onFilter: function (tipo) {
                this._oDialog = sap.ui.xmlfragment("Filtros", this.xmlFragmentFilterDialog, this);
                this._oDialog.open();
                sap.ui.getCore().byId("Filtros--idConstante").setValue(tipo);
            },
            onChangePrincipal: function () {
                let filtro = sap.ui.getCore().byId("Filtros--idFilterPrincipal"),
                    numDoc = sap.ui.getCore().byId("Filtros--idNumDoc"),
                    oFecha = sap.ui.getCore().byId("Filtros--idFecha"),
                    tipo = sap.ui.getCore().byId("Filtros--idTipo");
                let key = filtro.getSelectedKey();
                if (key === "0") {
                    numDoc.setVisible(true);
                    tipo.setVisible(false);
                    oFecha.setVisible(false);
                } else if (key === "1") {
                    numDoc.setVisible(false);
                    tipo.setVisible(true);
                    oFecha.setVisible(false);
                } else if (key === "2") {
                    numDoc.setVisible(false);
                    tipo.setVisible(false);
                    oFecha.setVisible(true);
                }
            },
            onFiltrar: function () {
                let filtro = sap.ui.getCore().byId("Filtros--idFilterPrincipal"),
                    stipDoc = sap.ui.getCore().byId("Filtros--idConstante").getValue(),
                    oFecha = this.setFormatterDate(sap.ui.getCore().byId("Filtros--idFecha").getDateValue(), "1"),
                    numDoc = sap.ui.getCore().byId("Filtros--idNumDoc"),
                    oList,
                    tipo = sap.ui.getCore().byId("Filtros--idTipo"),
                    aFilter = [];
                let key = filtro.getSelectedKey(),
                    keyTipo = tipo.getSelectedKey();
                if (key === "0") {
                    aFilter.push(new Filter("ParkedDocument", FilterOperator.Contains, numDoc.getValue()));
                } else if (key === "1") {
                    aFilter.push(new Filter("Status", FilterOperator.Contains, keyTipo));
                } else if (key === "2") {
                    aFilter.push(new Filter("fechaSeteada", FilterOperator.Contains, oFecha));
                }

                if (stipDoc === "G") {
                    oList = this.getView().byId("idFragListaGastos--idListaGasto");
                } else {
                    oList = this.getView().byId("idFragListaSolicitud--idListaSolicitud");
                }
                let oBinding = oList.getBinding("items");
                oBinding.filter(aFilter, "Application");
                oBinding.refresh(true);
                this._oDialog.destroy();
            },
            onCancelar: function () {
                this._oDialog.destroy();
            },
            //Llamar a la pagina de crear solicitud
            onCrearSolicitud: function () {
                let resultPendiente = [];
                if (this.listSolic !== undefined) {
                    resultPendiente = this.listSolic.filter(function (ele) {
                        return ele.Status === "P" && !ele.FlagRev;
                    });
                }
                //resultPendiente = []; //BRAD
                if (resultPendiente.length >= 2) {
                    let message = "Usted tiene dos o más Solicitudes pendientes de aprobar.";
                    MessageBox.error(message);
                } else {
                    this.getView().byId("idFragCrearSolicitud--idFechaCont")._bMobile = true;
                    this.getView().byId("idFragCrearSolicitud--idFecha")._bMobile = true;

                    this.getView().byId("idFragCrearSolicitud--idFecha").setValue(this.fnFormatearFechaVista(new Date()));
                    this.getView().byId("idFragCrearSolicitud--idFechaCont").setValue(this.fnFormatearFechaVista(new Date()));

                    this.getView().byId("idFragCrearSolicitud--idFecha").setMinDate(new Date());
                    this.getView().byId("idFragCrearSolicitud--idFechaCont").setMinDate(new Date());

                    let oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel"),
                        InfoIas = sap.ui.getCore().getModel("InfoIas"),
                        sZfondo,
                        sZcat;

                    let oSolicitudSeleccionada = {};
                    oModelMaestroSolicitudes.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='E001')", {
                        success: (result, status, xhr) => {
                            sap.ui.core.BusyIndicator.hide();

                            this.sZcatNom = result.Txt50;
                            oSolicitudSeleccionada.Zcat = result.Zcat;
                            let resultF = [];
                            sap.ui.getCore().setModel(resultF, "InfoFondoFijo");
                            this.sZfondo = InfoIas.Zfondo + " - " + resultF.Txt50;
                            this.sZcat = "E001 - " + this.sZcatNom;
                            this.sZfondoNom = resultF.Txt50;
                            oSolicitudSeleccionada.Zfondo = resultF.Zfondo;
                            oSolicitudSeleccionada.sZfondoCompleto = this.sZfondo;
                            oSolicitudSeleccionada.sZcatCompleto = this.sZcat;
                            oSolicitudSeleccionada.Hkont = "";
                            if (resultF.Waers === undefined) {
                                oSolicitudSeleccionada.Waers = "PEN";
                            }

                            this.sZfondo = oSolicitudSeleccionada.Zfondo + " - " + this.sZfondoNom;
                            oSolicitudSeleccionada.sZfondoCompleto = this.sZfondo;
                            oSolicitudSeleccionada.sZcatCompleto = this.sZcat;
                            if (typeof oSolicitudSeleccionada.Kostl === "undefined") {
                                // oSolicitudSeleccionada.Kostl = oSolicitudSeleccionada.Kostl; // TODO: ???
                            }

                            this.getView()
                                .byId("idFragCrearSolicitud--frmCrearSoli")
                                .setModel(new JSONModel(oSolicitudSeleccionada));
                            sap.ui.getCore().setModel(oSolicitudSeleccionada, "oCreacionSolicitud");
                            // this.onNavToPage("idPagCrearSolicitud");
                            let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");
                            oTable.setModel(new JSONModel([]));
                            this.getView().byId("idFragCrearSolicitud--idWaers").setEnabled(true);
                        },
                        error: (xhr, status, error) => {
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                }
            },
            onChangeImportes: function (oEvent) {
                let nameControl = oEvent.getSource().data("nameControl"),
                    cad = this.getView().byId(nameControl).getValue(),
                    cade = cad.replace(/[^0-9.]/, ""),
                    oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
                oVariablesGlobales.repeticion = 0;
                for (let i = 0; i < cade.length; i++) {
                    if (cade.charAt(i) == ".") {
                        oVariablesGlobales.repeticion++;
                    }
                }
                if (oVariablesGlobales.repeticion >= 2) {
                    cade = cade.substr(0, cade.length - 1);
                    oVariablesGlobales.repeticion = 0;
                }
                for (let pos = 0; pos < cade.length; pos++) {
                    if (cade.charAt(pos) === ".") {
                        cade = cade.substr(0, pos + 3);
                    }
                }

                if (cade.indexOf(".") >= 0) {
                    //es un decimal
                    let t = cade.split(".");
                    cade = (t[0].length ? parseInt(t[0]).toString() : "0") + "." + t[1].padEnd(2, "0");
                } else {
                    cade = (cade.length ? parseInt(cade).toString() : "0") + ".00";
                }

                this.getView().byId(nameControl).setValue(cade);
            },
            fnDisabledMonedas: function (oWaers) {
                let keys = oWaers.getKeys();
                let keySelected = oWaers.getValue();
                let items = oWaers.getItems();
                let index = keys.indexOf(keySelected);
                $.each(items, function (k, v) {
                    v.setEnabled(false);
                });
                items[index].setEnabled(true);
            },
            fnAgregarDetalleSolicitud: function () {
                let oDetSol = {};
                let oDes = this.getView().byId("idFragCrearSolicitud--idDes"),
                    oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
                    oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
                    FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
                    oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
                    oImporteDet = this.getView().byId("idFragCrearSolicitud--idImporteDetalle"),
                    oConcepto = this.getView().byId("idFragCrearSolicitud--idConcepto");

                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");

                let aTemp = oImporteDet.getValue();
                oImporteDet.setValue(String(Number(aTemp)));

                oDes.setValueState("None");
                oConcepto.setValueState("None");
                oImporteDet.setValueState("None");

                if (this.onValidarVacio(oDes.getValue())) {
                    oDes.setValueState("Error");
                    return;
                }

                if (this.onValidarVacio(oConcepto.getValue())) {
                    oConcepto.setValueState("Error");
                    return;
                }

                if (this.onValidarVacio(oImporteDet.getValue())) {
                    oImporteDet.setValueState("Error");
                    return;
                }

                //Validacion adicional
                if (oImporteDet.getValue()) {
                    if (oImporteDet.getValue() === "0") {
                        oImporteDet.setValueState("Error");
                        return;
                    }
                }

                oDetSol.Bukrs = InfoIas.Bukrs;
                oDetSol.Belnr = "";
                oDetSol.Gjahr = "";
                oDetSol.Usuario = "";
                oDetSol.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                oDetSol.Budat = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00";
                oDetSol.Blart = "";
                oDetSol.Detalle = oDes.getValue();
                oDetSol.Wrbtr = oImporteDet.getValue();
                oDetSol.Waers = oWaers.getValue();
                oDetSol.Zconc = oConcepto.getValue();

                let aFilas = oTable.getModel().getData();
                if (aFilas.length === 0) {
                    oWaers.setEnabled(false);
                    //LR 27/12
                    oImport.setValue(parseFloat(oImporteDet.getValue()).toFixed(2));
                    oDetSol.Nrpos = "1";
                    aFilas.push(oDetSol);
                    oTable.setModel(new JSONModel(aFilas));
                    oTable.getModel().refresh(true);
                    this.byId("idFragCrearSolicitud--idImporteDetalle").setValue("");
                    this.byId("idFragCrearSolicitud--idDes").setValue("");
                    this.byId("idFragCrearSolicitud--idConcepto").setValue("");
                } else {
                    let sSuma = 0;
                    $.each(aFilas, function (key, value) {
                        sSuma += Number(value.Wrbtr);
                    });
                    let icalculo = Number(oDetSol.Wrbtr) + sSuma;

                    let Nrpos = aFilas[aFilas.length - 1];
                    oDetSol.Nrpos = String(Number(Nrpos.Nrpos) + 1);
                    aFilas.push(oDetSol);
                    oTable.setModel(new JSONModel(aFilas));
                    oTable.getModel().refresh(true);
                    //LR 27/12
                    this.byId("idFragCrearSolicitud--idImporteTotal").setValue(parseFloat(icalculo).toFixed(2));
                    this.byId("idFragCrearSolicitud--idImporteDetalle").setValue("");
                    this.byId("idFragCrearSolicitud--idDes").setValue("");
                    this.byId("idFragCrearSolicitud--idConcepto").setValue("");
                }
                this.fnRemoverConcepto(oDetSol.Zconc);
                sap.ui.getCore().setModel(aFilas, "oModelTablaDetSolicitud");
            },
            fnBorraFila: function (oEvent) {
                let removed = [];
                let nameControl = oEvent.getSource().data("nameControl");
                let oFila = oEvent.getSource().getParent(),
                    oTbl = this.getView().byId(nameControl),
                    idx = Number(oFila.getBindingContextPath().split("/")[1]),
                    oImporteTotal = this.getView().byId("idFragCrearSolicitud--idImporteTotal");
                if (idx !== -1) {
                    let oModel = oTbl.getModel(),
                        data = oModel.getData();
                    oImporteTotal.setValue(Number(oImporteTotal.getValue().replace(',' ,'')) - Number(data[idx].Wrbtr));
                    removed = data.splice(idx, 1);
                    // Check return value of data. // If data has an hierarchy. Ex: data.results
                    // let removed =data.results.splice(idx,1);
                    oModel.setData(data);
                }

                let aDataPos = oTbl.getModel().getData(),
                    iPosicion = 0;

                $.each(aDataPos, function (pos, ele) {
                    iPosicion++;
                    ele.Nrpos = String(iPosicion);
                });
                oTbl.getModel().setData(aDataPos);
                if (oTbl.getModel().getData().length === 0) {
                    this.getView().byId("idFragCrearSolicitud--idWaers").setEnabled(true);
                }

                this.fnAgregarConcepto(removed[0].Zconc);
            },
            //evento que se llama desde botón Cancelar en la vista Crear Solicitud
            onIrListaDSolicitud: function () {
                this.fnLimpiarCamposCrearSolicitud();
                this.fnLimpiarCamposCrearGastos();
                this.onNavToPage("idPagDetSolicitud");
            },
            fnLimpiarCamposCrearSolicitud: function () {
                //obtengo los ID
                let oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
                    oOperacion = this.getView().byId("idFragCrearSolicitud--idOperacion"),
                    oCuenMayor = this.getView().byId("idFragCrearSolicitud--idCuentaMyr"),
                    oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
                    FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
                    oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
                    oRef = this.getView().byId("idFragCrearSolicitud--idReferencia"),
                    oDes = this.getView().byId("idFragCrearSolicitud--idDes"),
                    oImporteDetalle = this.getView().byId("idFragCrearSolicitud--idImporteDetalle"),
                    oTipoObjCosto = this.getView().byId("idFragCrearSolicitud--inputTipImp"),
                    oObjCosto = this.getView().byId("idFragCrearSolicitud--inputCeCo"),
                    oObservaciones = this.getView().byId("idFragCrearSolicitud--inputObser");
                this.getView().byId("idFragCrearSolicitud--idWaers").setEnabled(true);
                //Seteo el estado a ninguno para recien poder validar si es que estan vacios
                oFecDoc.setValueState("None");
                oOperacion.setValueState("None");
                oCuenMayor.setValueState("None");
                oImport.setValueState("None");
                FechCon.setValueState("None");
                oWaers.setValueState("None");
                oRef.setValueState("None");
                oDes.setValueState("None");
                oImporteDetalle.setValueState("None");
                oTipoObjCosto.setValueState("None");
                oObjCosto.setValueState("None");
                oObservaciones.setValueState("None");

                // this.getView().byId("idFragCrearSolicitud--idFecha").setValue("");
                oDes.setValue("");
                // this.getView().byId("idFragCrearSolicitud--idFechaCont").setValue("");
                this.getView().byId("idFragCrearSolicitud--idReferencia").setValue("");
                oImporteDetalle.setValue("");
                oImport.setValue("0.00");

                oTipoObjCosto.setValue("");
                oObjCosto.setValue("");
                oObservaciones.setValue("");

                this.oVariablesJSONModel.setProperty("/conceptos/", []);

                let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");
                oTable.setModel(new JSONModel([]));

                //LIMPIAR ADJUNTO
                const oAdjModel = this.getView().getModel("DocumentsSolicitud");
                oAdjModel.setData([]);
            },
            onCrearNuevaSolicitud: function () {
                //Verifica si existe aprobador del primer nivel
                /********* Obteniene lista de aprobadores desde SAP ********/
                let InfoIas = sap.ui.getCore().getModel("InfoIas");

                const sKstrg = this.getView().byId("idFragCrearSolicitud--inputTipImp").getValue().split(" - ", 1)[0];
                let sAufnr = "",
                    sKostl = "";
                if (sKstrg == "K") {
                    sKostl = this.getView().byId("idFragCrearSolicitud--inputCeCo").getValue().split(" - ", 1)[0];
                    sAufnr = "";
                    this.state.tablaFiltro = "CSKS";
                    this.state.campoFiltro = "KOSTL";
                    this.state.plans = sKostl;
                } else if (sKstrg == "F") {
                    sAufnr = this.getView().byId("idFragCrearSolicitud--inputCeCo").getValue().split(" - ", 1)[0];
                    sKostl = "";
                    this.state.tablaFiltro = "COBL";
                    this.state.campoFiltro = "AUFNR";
                    this.state.plans = sAufnr;
                }

                let query =
                    "/zinaprobadoresSet(" +
                    "Bukrs='" +
                    InfoIas.Bukrs +
                    "'," +
                    "Prcid='" +
                    this.parameters.PROCESO +
                    "'," +
                    "Rulid='" +
                    this.parameters.REGLA +
                    "'," +
                    "Tskid='" +
                    this.parameters.SOLICITUD_NIVEL_APROBACION_1 +
                    "'," +
                    "Tabname='" +
                    this.state.tablaFiltro +
                    "'," +
                    "Fieldname='" +
                    this.state.campoFiltro +
                    "'," +
                    "Value='" +
                    // InfoIas.Plans +
                    this.state.plans +
                    "'," +
                    "Isfound=false," +
                    "TabSearch='" +
                    this.parameters.BUSQUEDA_TABLA +
                    "'," +
                    "FieldSearch='" +
                    this.parameters.BUSQUEDA_CAMPO +
                    "')/zaprobadoresmultout";
                console.log(query);
                this.getView().setBusyIndicatorDelay(0);
                this.getView().setBusy(true);
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read(query, {
                        success: (res) => {
                            this.getView().setBusy(false);
                            if (res.results !== undefined) {
                                if (res.results.length > 0) {
                                    console.log("APROBADOR PRIMER NIVEL");
                                    console.log(res.results[0].Low);
                                    this.onNuevoDetSolicitud();
                                    //	this.onGetSolicitudAprobadoresSegundoNivel();
                                } else {
                                    this.showMessageBox(this.getI18nText("appSinAprobadorPrimerNivel"), "error");
                                }
                            }
                        },
                        error: (err) => {
                            this.getView().setBusy(false);
                            let msj = this.getI18nText("appErrorMsg");
                            this.showMessageBox(msj, "error");
                        },
                    });
            },
            onGetSolicitudAprobadoresSegundoNivel: function () {
                //Verifica si existe aprobador del primer nivel
                /********* Obteniene lista de aprobadores desde SAP ********/
                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                let query =
                    "/zinaprobadoresSet(" +
                    "Bukrs='" +
                    InfoIas.Bukrs +
                    "'," +
                    "Prcid='" +
                    this.parameters.PROCESO +
                    "'," +
                    "Rulid='" +
                    this.parameters.REGLA +
                    "'," +
                    "Tskid='" +
                    this.parameters.SOLICITUD_NIVEL_APROBACION_2 +
                    "'," +
                    "Tabname='" +
                    this.state.tablaFiltro +
                    "'," +
                    "Fieldname='" +
                    this.state.campoFiltro +
                    "'," +
                    "Value='" +
                    InfoIas.Plans +
                    "'," +
                    "Isfound=false," +
                    "TabSearch='" +
                    this.parameters.BUSQUEDA_TABLA +
                    "'," +
                    "FieldSearch='" +
                    this.parameters.BUSQUEDA_CAMPO +
                    "')/zaprobadoresmultout";
                console.log(query);
                this.getView().setBusyIndicatorDelay(0);
                this.getView().setBusy(true);
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read(query, {
                        success: (res) => {
                            this.getView().setBusy(false);
                            if (res.results !== undefined) {
                                if (res.results.length > 0) {
                                    console.log("APROBADOR SEGUNDO NIVEL");
                                    console.log(res.results[0].Low);
                                    this.onNuevoDetSolicitud();
                                } else {
                                    this.showMessageBox(this.getI18nText("appSinAprobadorSegundoNivel"), "error");
                                }
                            }
                        },
                        error: (err) => {
                            this.getView().setBusy(false);
                            let msj = this.getI18nText("appErrorMsg");
                            this.showMessageBox(msj, "error");
                        },
                    });
            },
            onNuevoDetSolicitud: function () {
                //variables de los datos del fondo del usuario
                // let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"), NO USADO
                let oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud").getModel().getData(),
                    msjErrorCamposObligatorios = this.getI18nText("txtCompletarCamposObligatorios");

                if (oTable.length <= 0) {
                    let msj = "Por favor ingrese al menos un detalle de solicitud.";
                    this.showMessageBox(msj, "warning");
                    return;
                }
                //obtengo los ID
                let oFecDoc = this.getView().byId("idFragCrearSolicitud--idFecha"),
                    FechCon = this.getView().byId("idFragCrearSolicitud--idFechaCont"),
                    oOperacion = this.getView().byId("idFragCrearSolicitud--idOperacion"),
                    oCuenMayor = this.getView().byId("idFragCrearSolicitud--idCuentaMyr"),
                    oImport = this.getView().byId("idFragCrearSolicitud--idImporteTotal"),
                    oWaers = this.getView().byId("idFragCrearSolicitud--idWaers"),
                    oRef = this.getView().byId("idFragCrearSolicitud--idReferencia"),
                    oTipoObjCosto = this.getView().byId("idFragCrearSolicitud--inputTipImp"),
                    oObjCosto = this.getView().byId("idFragCrearSolicitud--inputCeCo"),
                    oObservaciones = this.getView().byId("idFragCrearSolicitud--inputObser"),
                    oAdicional = this.getView().byId("idFragCrearSolicitud--idAdicionales");
                //Seteo el estado a ninguno para recien poder validar si es que estan vacios
                oFecDoc.setValueState("None");
                oOperacion.setValueState("None");
                oCuenMayor.setValueState("None");
                oImport.setValueState("None");
                FechCon.setValueState("None");
                oWaers.setValueState("None");
                oRef.setValueState("None");
                oTipoObjCosto.setValueState("None");
                oObjCosto.setValueState("None");
                oObservaciones.setValueState("None");
                oAdicional.setValueState("None");
                //valido si algun campo esta vacio

                if (this.onValidarVacio(oFecDoc.getValue())) {
                    oFecDoc.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(oOperacion.getValue())) {
                    oOperacion.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }

                if (this.onValidarVacio(oImport.getValue())) {
                    oImport.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(FechCon.getValue())) {
                    FechCon.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(oWaers.getValue())) {
                    oWaers.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(oRef.getValue())) {
                    oRef.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(oTipoObjCosto.getValue())) {
                    oRef.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.onValidarVacio(oObjCosto.getValue())) {
                    oRef.setValueState("Error");
                    MessageBox.error(msjErrorCamposObligatorios);
                    return;
                }
                if (this.oGeneral.getProperty("/displayAdicionales")) {
                    if (this.onValidarVacio(oAdicional.getValue())) {
                        oAdicional.setValueState("Error");
                        MessageBox.error(msjErrorCamposObligatorios);
                        return;
                    }
                }
                //Calcular si el monto total de los importes en verde es mayor o igual al del importe total que se genera
                // fMontoEvaluar = Number(oImport.getValue()) + oVariablesGlobales.ImporteTotalSolicitudes; NO UTILIZADO
                //luego de la validación guardo los vaLores en un json para añadirlos a la tabla detalle
                let oCabSol = {},
                    InfoIas = sap.ui.getCore().getModel("InfoIas"),
                    oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel");

                oCabSol.Bukrs = InfoIas.Bukrs;
                oCabSol.ParkedDocument = "";
                oCabSol.Gjahr = String(new Date().getFullYear());
                oCabSol.Budat = this.fnFormatearFechaSAP(FechCon.getValue()) + "T00:00:00";
                oCabSol.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                oCabSol.Xblnr = oRef.getValue();
                oCabSol.Ztyp = "S";
                oCabSol.Waers = oWaers.getValue();
                oCabSol.Wrbtr = oImport.getValue();
                oCabSol.Status = "";
                oCabSol.Bktxt = InfoIas.Pname.substring(0, 25);
                oCabSol.Sgtxt = oRef.getValue();
                oCabSol.Hkont = ""; //oCuenMayor.getValue();
                oCabSol.Zcat = oOperacion.getValue().substr(0, 4);
                oCabSol.Segment = "S00";
                oCabSol.Uname = InfoIas.Sysid;

                oCabSol.Kstrg = this.oVariablesJSONModel.getData().Rstyp.code;

                if (oCabSol.Kstrg === "F") {
                    oCabSol.Aufnr = this.oVariablesJSONModel.getData().Kostl.code;
                } else {
                    oCabSol.Kostl = this.oVariablesJSONModel.getData().Kostl.code;
                }

                oCabSol.Zobserv = oObservaciones.getValue();
                oCabSol.Eratx = oAdicional.getSelectedKey();

                sap.ui.core.BusyIndicator.show(0);
                console.log("oCabSol");
                console.log(oCabSol);
                oModelMaestroSolicitudes.create("/zsolicitudSet", oCabSol, {
                    success: (oData, oResponse) => {
                        let msg = JSON.parse(oResponse.headers["sap-message"]);
                        if (msg.severity === "success") {
                            //MessageBox.success(msg.message);
                            console.log(oData);
                            this.fnGrabarDetalleSolicitud(oData);
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error(msg.message);
                        }
                    },
                    error: (oError) => {
                        // Error
                        sap.ui.core.BusyIndicator.hide();
                        if (oError.responseText !== "") {
                            let txt =
                                "Ocurrió un error en SAP.\n\n" +
                                JSON.parse(oError.responseText).error.message.value +
                                "\n" +
                                JSON.parse(oError.responseText).error.code;
                            MessageBox.error(txt);
                        } else {
                            MessageBox.error(
                                "Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas."
                            );
                        }
                    },
                });
                //al terminar debe añadirse acá el limpiado de los campos
            },
            fnGrabarDetalleSolicitud: function (oData) {
                let oModelTablaDetSolicitud = sap.ui.getCore().getModel("oModelTablaDetSolicitud"),
                    oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
                oVariablesGlobales.Flag = 0;

                $.each(oModelTablaDetSolicitud, function (key, value) {
                    value.Nrpos = String(value.Nrpos);
                    value.Belnr = oData.ParkedDocument;
                    value.Bukrs = oData.Bukrs;
                    value.Gjahr = oData.Gjahr;
                    value.Blart = oData.Blart;
                });

                this.fnServicioDetSolicitud(oModelTablaDetSolicitud);
            },
            fnServicioDetSolicitud: function (oModelTablaDetSolicitud) {
                var that =this;
                let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
                    oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel");

                let oDocumento = oModelTablaDetSolicitud[oVariablesGlobales.Flag];

                oModelMaestroSolicitudes.create("/DetSolicitudSet", oDocumento, {
                    success: () => {
                        oVariablesGlobales.Flag++;

                        if (oVariablesGlobales.Flag === oModelTablaDetSolicitud.length) {
                            oVariablesGlobales.Flag = 0;
                            this.fnWorkFlow(oDocumento).then(() => {
                                return that.fnSubirObservacionDS(oDocumento);
                            }).then(() => {
                                return that.uploadArchiveLink(oDocumento);
                            }).then(() => {
                                that.fnLimpiarCamposCrearSolicitud();
                                let msj = "Se ha registrado la solicitud " + oDocumento.Belnr + ".";
                                that.showMessageBox(msj, "success");
                            }).catch((error) => {
                                console.log(error);
                                BusyIndicator.hide();
                            });
                        } else {
                            this.fnServicioDetSolicitud(oModelTablaDetSolicitud);
                        }
                    },
                    error: (oError) => {
                        console.log(oError);
                        BusyIndicator.hide();
                        let msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + oDocumento.Nrpos + ".";
                        this.showMessageBox(msj, "error");
                        return;
                    },
                });
            },
            handleUploadComplete: function () {
                alert("handleUploadComplete");
            },
            //{@pguevarl - observacion Pto. 2 (validacion de serie y correlativo para ciertos códigos sunat) - agregué la función onFilterSunat
            onFilterSunat: function (oEvent) {
                let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey(),
                    idCorr = this.getView().byId("idFragCrearGasto--idCorr"),
                    idSerie = this.getView().byId("idFragCrearGasto--idSerie");

                if (idTipoDocS == "05") {
                    idSerie.setMaxLength(4);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setMaxLength(11);
                    idCorr.setPlaceholder("XXXXXXXXXXX"); //correlativo
                } else if (idTipoDocS == "12") {
                    idSerie.setMaxLength(20);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setMaxLength(20);
                    idCorr.setPlaceholder("XXXXXXXX"); //correlativo
                } else if (idTipoDocS == "00") {
                    idSerie.setMaxLength(20);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setMaxLength(20);
                    idCorr.setPlaceholder("XXXXXXXX"); //correlativo
                } else if (idTipoDocS == "11") {
                    idSerie.setMaxLength(20);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setMaxLength(15);
                    idCorr.setPlaceholder("XXXXXXXX"); //correlativo
                } else if (idTipoDocS == "13") {
                    idSerie.setMaxLength(20);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setMaxLength(20);
                    idCorr.setPlaceholder("XXXXXXXX"); //correlativo
                } else {
                    idSerie.setValue("");
                    idSerie.setMaxLength(4);
                    idSerie.setPlaceholder("XXXX"); //serie
                    idCorr.setValue(""); //correlativo
                    idCorr.setMaxLength(8);
                    idCorr.setPlaceholder("XXXXXXXX"); //correlativo
                }
            },
            //}@pguevarl
            fnAgregarDetGasto: function () {
                let InfoIas = sap.ui.getCore().getModel("InfoIas"),
                    oTable = this.getView().byId("idFragCrearGasto--idTablaDetGastos"),
                    aFilas = oTable.getModel().getData(),
                    oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");

                let aDetGasto = {},
                    aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
                    oFecDoc = this.getView().byId("idFragCrearGasto--idFecha"),
                    oFechCon = this.getView().byId("idFragCrearGasto--idFechaCont");

                let oIdSol = this.getView().byId("idFragCrearGasto--idSol"),
                    oIdOperacion = this.getView().byId("idFragCrearGasto--idOperacion"),
                    oIdCeco = this.getView().byId("idFragCrearGasto--idCeco"),
                    oIdTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS"),
                    oIdCorr = this.getView().byId("idFragCrearGasto--idCorr"),
                    oIdRuc = this.getView().byId("idFragCrearGasto--idRUC"),
                    oIdIndImp = this.getView().byId("idFragCrearGasto--idIndImp"),
                    oIdCuentaMyr = this.getView().byId("idFragCrearGasto--idCuentaMyr"),
                    oIdImporteD = this.getView().byId("idFragCrearGasto--idImporteD"),
                    oIdSerie = this.getView().byId("idFragCrearGasto--idSerie"),
                    oIdRazSoc = this.getView().byId("idFragCrearGasto--idRazSoc"),
                    oIdFechaFactura = this.getView().byId("idFragCrearGasto--idFechaFactura"),
                    oIdCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
                    oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso"),
                    oIdDevolucion = this.getView().byId("idFragCrearGasto--idDevolucion"),
                    oIdReembolso = this.getView().byId("idFragCrearGasto--idReembolso"),
                    oIdMoneda = this.getView().byId("idFragCrearGasto--idWaers"),
                    oIdImporteTotalGasto = this.getView().byId("idFragCrearGasto--idImporteTotal");

                let aTemp = oIdImporteD.getValue();
                oIdImporteD.setValue(String(Number(aTemp)));

                oIdTipoDocS.setValueState("None");
                oIdCorr.setValueState("None");
                oIdRuc.setValueState("None");
                oIdIndImp.setValueState("None");
                oIdCuentaMyr.setValueState("None");
                oIdImporteD.setValueState("None");
                oIdSerie.setValueState("None");
                oIdRazSoc.setValueState("None");
                oIdFechaFactura.setValueState("None");

                if (this.onValidarVacio(oIdTipoDocS._getSelectedItemText())) {
                    oIdTipoDocS.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdCorr.getValue())) {
                    oIdCorr.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdRuc.getValue())) {
                    oIdRuc.setValueState("Error");
                    return;
                }
                if (!this.state.bRucProveedor) {
                    let msj = "El RUC no se encuentra registrado como proveedor.";
                    this.showMessageBox(msj, "error");
                    return;
                }
                if (this.onValidarVacio(oIdIndImp._getSelectedItemText())) {
                    oIdIndImp.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdCuentaMyr.getValue())) {
                    oIdCuentaMyr.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdImporteD.getValue())) {
                    oIdImporteD.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdSerie.getValue())) {
                    oIdSerie.setValueState("Error");
                    return;
                }
                //{@pguevarl
                if (oIdTipoDocS.getSelectedKey() == "05") {
                    if (oIdSerie.getValue().length < 3) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener de 3 a 4 caracteres");
                        return;
                    }
                    if (oIdCorr.getValue().length == 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener de 1 a 11 caracteres");
                        return;
                    }
                }
                if (
                    oIdTipoDocS.getSelectedKey() == "12" ||
                    oIdTipoDocS.getSelectedKey() == "00" ||
                    oIdTipoDocS.getSelectedKey() == "11" ||
                    oIdTipoDocS.getSelectedKey() == "13"
                ) {
                    if (oIdSerie.getValue().length == 0) {
                        oIdSerie.setValueState("Error");
                        MessageToast.show("La serie debe tener al menos 1 caracter");
                        return;
                    }
                    if (oIdCorr.getValue().length == 0) {
                        oIdCorr.setValueState("Error");
                        MessageToast.show("El correlativo debe tener al menos 1 caracter");
                        return;
                    }
                }
                if (oIdSerie.getValue().length + oIdCorr.getValue().length > 16) {
                    MessageToast.show("La cantidad máxima de serie + correlativo es de 16 caracteres");
                    return;
                }
                //}@pguevarl
                if (this.onValidarVacio(oIdRazSoc.getValue())) {
                    oIdRazSoc.setValueState("Error");
                    return;
                }
                if (this.onValidarVacio(oIdFechaFactura.getValue())) {
                    oIdFechaFactura.setValueState("Error");
                    return;
                }
                this.solicitudGasto = oIdSol.getValue();
                //Modelo para enviar al Odata Detalle de Gasto
                //aDetGasto.ZCat = oSolicitudSeleccionada.Zcat;oIdOperacion
                aDetGasto.ZCat = oIdOperacion.getSelectedKey();
                aDetGasto.Bukrs = InfoIas.Bukrs;
                aDetGasto.Belnr = "";
                aDetGasto.Gjahr = "";
                aDetGasto.Usuario = "";
                aDetGasto.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()) + "T00:00:00";
                aDetGasto.Budat = this.fnFormatearFechaSAP(oFechCon.getValue()) + "T00:00:00";
                aDetGasto.Blart = "";
                aDetGasto.BelnrSol = oIdSol.getValue();
                aDetGasto.Detalle = "";
                aDetGasto.Wrbtr = oIdImporteD.getValue();
                aDetGasto.Ztype = "G";
                aDetGasto.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code"); //this.getView().byId("idFragCrearGasto--idCeco").getValue();
                aDetGasto.Waers = oIdMoneda.getValue();
                aDetGasto.BukrsSol = InfoIas.Bukrs;
                aDetGasto.GjahrSol = oSolicitudSeleccionada.Gjahr;
                aDetGasto.Saknr = oIdCuentaMyr.getValue();
                aDetGasto.Sgtxt = oIdRazSoc.getValue();
                aDetGasto.Dzuonr = oIdRuc.getValue();
                aDetGasto.Serie = oIdSerie.getValue();
                aDetGasto.Correlativo = oIdCorr.getValue();
                aDetGasto.Mwskz = oIdIndImp.getSelectedKey();
                aDetGasto.Imagen = this.getView().getModel("Documents").getData();
                // let values = 0;
                // $.each(aFilas, function (key, value) {
                // 		if (aDetGasto.Serie == value.oSerie && aDetGasto.Correlativo == value.oCorrelativo) {
                // 			values = 1;
                // 			let msjs = "Verifica el correlativo de la factura.";
                // 			MessageToast.show(msjs);
                // 			return false;
                // 		}
                // 	});
                // if (values == 1){
                // 	return;
                // }
                //LR 12/12/2019
                //pguevarl - comenté esto ya que algunos docsunat permiten tener más de 9 dígitos
                /*if ((aDetGasto.Correlativo).length > 8){
                        let msjs = "Cantidad de dígitos mayor a la permitida";
                        MessageToast.show(msjs);
                        return;
                    }*/
                //Json del detalle de Gasto
                let aFilaJGasto = {};
                aFilaJGasto.Parked_Document = "";
                aFilaJGasto.Wbtr_sol = "";
                aFilaJGasto.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()).replace(/-/gi, "");
                aFilaJGasto.Zcat = oIdOperacion.getSelectedKey();
                aFilaJGasto.Kostl = this.oVariablesJSONModel.getProperty("/Kostl/code"); // oIdCeco.getValue();
                aFilaJGasto.Tax_code = oIdIndImp.getSelectedKey();
                if (oIdFechaFactura.getDateValue() === null) {
                    aFilaJGasto.Xref_1 = this.fnFormatearFechaFactura2(oIdFechaFactura.getValue()).replace(/-/gi, "");
                } else {
                    aFilaJGasto.Xref_1 = this.fnFormatearFechaFactura1(oIdFechaFactura.getDateValue()).replace(/-/gi, "");
                }
                aFilaJGasto.Xref_2 = oIdRuc.getValue(); //oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue();
                aFilaJGasto.Sgtxt = oIdRazSoc.getValue();
                aFilaJGasto.Zuonr = oIdTipoDocS.getSelectedKey() + oIdSerie.getValue() + oIdCorr.getValue(); //oIdRuc.getValue();
                aFilaJGasto.Budat = this.fnFormatearFechaSAP(oFechCon.getValue()).replace(/-/gi, "");
                aFilaJGasto.Hkont = oIdCuentaMyr.getValue();
                aFilaJGasto.Wrbtr = oIdImporteD.getValue();
                aFilaJGasto.Waers = oIdMoneda.getValue();

                aFilaJGasto.Imp_total = oIdImporteTotalGasto.getValue();
                if (oIdCheckDevol.getSelected() === true) {
                    aFilaJGasto.Flag_dev = "X";
                    aFilaJGasto.Sgtxt_dev = oIdDevolucion.getValue();
                } else {
                    aFilaJGasto.Flag_dev = "";
                    aFilaJGasto.Sgtxt_dev = "";
                }

                if (oIdCheckReembolso.getSelected() === true) {
                    aFilaJGasto.Flag_reembolso = "X";
                    aFilaJGasto.Sgtxt_dev = oIdReembolso.getValue();
                } else {
                    aFilaJGasto.Flag_reembolso = "";
                    aFilaJGasto.Sgtxt_dev = "";
                }
                aFilaJGasto.Ztype = "G";
                aFilaJGasto.Bukrs = InfoIas.Bukrs;
                //4 campos solo para la tabla
                aFilaJGasto.oKostl = this.oVariablesJSONModel.getData().Kostl.name;
                aFilaJGasto.oOperacion = oIdOperacion._getSelectedItemText().substr(7, 100);
                aFilaJGasto.oCtaMyr = oIdCuentaMyr.getValue();
                aFilaJGasto.oSerie = oIdSerie.getValue();
                aFilaJGasto.oCorrelativo = oIdCorr.getValue();
                aFilaJGasto.oIndImp = oIdIndImp._getSelectedItemText();

                //aFilaJGasto.oImagen = this.getView().getModel("Documents").getData();

                if (aFilas.length === 0) {
                    aDetGasto.Nrpos = "1";
                    aFilaJGasto.Nposit = "1";
                    aFilas.push(aFilaJGasto);
                    aTablaDetGasto.push(aDetGasto);
                    oTable.setModel(new JSONModel(aFilas));
                    oTable.getModel().refresh(true);
                    oIdImporteTotalGasto.setValue(aFilaJGasto.Wrbtr);
                } else {
                    let sSuma = 0;
                    $.each(aFilas, function (key, value) {
                        sSuma += Number(value.Wrbtr);
                    });
                    sSuma = sSuma + Number(aFilaJGasto.Wrbtr);
                    //LR 11/12/19
                    sSuma = parseFloat(sSuma).toFixed(2);
                    this.getView().byId("idFragCrearGasto--idImporteTotal").setValue(sSuma);
                    let Nrpos = aFilas[aFilas.length - 1];
                    aDetGasto.Nrpos = String(Number(Nrpos.Nposit) + 1);
                    aFilaJGasto.Nposit = String(Number(Nrpos.Nposit) + 1);
                    aFilas.push(aFilaJGasto);
                    oTable.setModel(new JSONModel(aFilas));
                    aTablaDetGasto.push(aDetGasto);
                    oTable.getModel().refresh(true);
                    oIdImporteTotalGasto.setValue(sSuma);
                }

                let aDetGDS = JSON.parse(JSON.stringify(aDetGasto));
                aDetGDS.Imagen = this.getView().getModel("Documents").getData();
                let aTDS = [];
                aTDS.push(aDetGDS);
                // LR 31/12
                let documentos = [];

                $.each(aTablaDetGasto, function (key, value) {
                    documentos.push(value);
                });

                // let documents =  sap.ui.getCore().getModel("DocumentsForPosition");
                // let aDetdocuments = {};
                // aDetdocuments.push(documents);
                // if( aTablaDetGasto.lenght > 1 ){

                // }else{
                this.getView().setModel(new JSONModel(documentos), "DocumentsForPosition");
                // }

                oIdCorr.setValue("");
                oIdRuc.setValue("");
                oIdImporteD.setValue("");
                oIdSerie.setValue("");
                oIdRazSoc.setValue("");
                this.getView().byId("idFragCrearGasto--idTipoDocS").setSelectedKey();
                this.getView().byId("idFragCrearGasto--idIndImp").setSelectedKey();
                //LR 23/12/19
                oIdCuentaMyr.setValue("");
                this.getView().byId("idFragCrearGasto--idOperacion").setSelectedKey();

                this.fnChangeTxt();
                //oIdFechaFactura.setValue(this.fnFormatearFechaVista(new Date()));
                oIdFechaFactura.setValue("");
                oIdCeco.setValue("");

                sap.ui.getCore().setModel(aFilas, "oJGasto");
                sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
                this.getView().getModel("Documents").setData([]);
            },
            tbDeclaracioncli: function () {
                alert("tbDeclaracioncli");
            },
            presionarBoleta: function (oEvent) {
                let idx = oEvent.getSource().getParent().getBindingContextPath();

                this.getView().getModel("Documentos").setData([]);
                idx = idx = idx.charAt(idx.lastIndexOf("/") + 1);

                let adj = sap.ui.getCore().getModel("aTablaDetGasto")[idx].Imagen;
                this.getView().getModel("Documentos").setData(adj);
                // this.state.estadoFiles = 2;
                if (this._dialogAttach) {
                    this._dialogAttach = sap.ui.xmlfragment("everis.apps.entregasRendir.view.fragment.AttachView", this);
                    this.getView().addDependent(this._dialogAttach);
                }
                this._dialogAttach.open();
                // let aFiles = this.getView().getModel("DocumentsForPosition").getData();
                // debugger;
                // let fila = oEvent.getSource().getBindingContext().getObject();
                // let oImgBase = this.fnGetBase64(fila.oImagen);
                // let tipo = fila.oImagen["type"];
            },
            fnGetBase64: function (file) {
                let reader = new FileReader();
                reader.readAsDataURL(file[0]);
                reader.onload = () => {
                    this.fnAbrirArchivo(file, reader.result);
                };
                reader.onerror = (error) => {
                    console.log("Error: ", error);
                };
            },
            fnAbrirArchivo: function (file, fileB) {
                let element = document.createElement("a");
                element.setAttribute("href", fileB);
                element.setAttribute("download", file["name"]);
                element.style.display = "none";
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            },
            fnBorraFilaGasto: function (oEvent) {
                let nameControl = oEvent.getSource().data("nameControl");
                let oFila = oEvent.getSource().getParent(),
                    oTbl = this.getView().byId(nameControl),
                    aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
                    idx = oFila.getBindingContextPath(),
                    oImporteTotal = this.getView().byId("idFragCrearGasto--idImporteTotal");
                idx = idx.charAt(idx.lastIndexOf("/") + 1);
                idx = parseFloat(idx);
                if (idx !== -1) {
                    oImporteTotal.setValue(oImporteTotal.getValue() - Number(aTablaDetGasto[idx].Wrbtr));
                    let oModel = oTbl.getModel(),
                        data = oModel.getData();
                    data.splice(idx, 1);
                    aTablaDetGasto.splice(idx, 1);
                    // Check return value of data. // If data has an hierarchy. Ex: data.results
                    // let removed =data.results.splice(idx,1);
                    oModel.setData(data);
                }

                let aDataPos = oTbl.getModel().getData(),
                    iPosicion = 0;

                $.each(aDataPos, function (pos, ele) {
                    iPosicion++;
                    ele.Nposit = String(iPosicion);
                });
                oTbl.getModel().setData(aDataPos);

                let iPosicionG = 0;

                $.each(aTablaDetGasto, function (pos, ele) {
                    iPosicionG++;
                    ele.Nrpos = String(iPosicionG);
                });
                sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
            },
            /****************************GASTOS**********************************/
            onIrListaDGastos: function () {
                this.onNavToPage("idPagDetGasto");
            },
            fnLimpiarCamposCrearGastos: function () {
                let oIdTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS"),
                    oIdCorr = this.getView().byId("idFragCrearGasto--idCorr"),
                    oIdRuc = this.getView().byId("idFragCrearGasto--idRUC"),
                    oIdIndImp = this.getView().byId("idFragCrearGasto--idIndImp"),
                    oIdCuentaMyr = this.getView().byId("idFragCrearGasto--idCuentaMyr"),
                    oIdImporteD = this.getView().byId("idFragCrearGasto--idImporteD"),
                    oIdSerie = this.getView().byId("idFragCrearGasto--idSerie"),
                    oIdRazSoc = this.getView().byId("idFragCrearGasto--idRazSoc"),
                    oIdCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
                    oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso"),
                    oIdDevolucion = this.getView().byId("idFragCrearGasto--idDevolucion"),
                    oIdReembolso = this.getView().byId("idFragCrearGasto--idReembolso"),
                    oIdImporteTotal = this.getView().byId("idFragCrearGasto--idImporteTotal"),
                    oIdFechaFactura = this.getView().byId("idFragCrearGasto--idFechaFactura");

                oIdCorr.setValue("");
                oIdRuc.setValue("");
                this.getView().byId("idFragCrearGasto--idImporteD").setValue("");
                oIdSerie.setValue("");
                oIdRazSoc.setValue("");
                oIdFechaFactura.setValue("");
                oIdImporteD.setValue("");
                oIdCheckDevol.setSelected(false);
                oIdCheckReembolso.setSelected(false);
                oIdImporteTotal.setValue("");
                oIdDevolucion.setValue("");
                oIdReembolso.setValue("");
                oIdReembolso.setEditable(false);

                oIdCorr.setValueState("None");
                oIdRuc.setValueState("None");
                oIdIndImp.setValueState("None");
                oIdCuentaMyr.setValueState("None");
                oIdImporteD.setValueState("None");
                oIdSerie.setValueState("None");
                oIdRazSoc.setValueState("None");
                oIdFechaFactura.setValueState("None");
                oIdTipoDocS.setValueState("None");
                oIdImporteD.setValueState("None");

                let oTable = this.getView().byId("idFragCrearGasto--idTablaDetGastos");
                oTable.setModel(new JSONModel([]));
            },
            onSeleccionGastos: function (oEvent) {
                let oGastoSeleccionado = oEvent.getSource().getBindingContext().getObject();
                oGastoSeleccionado.sZfondoCompleto = "";
                oGastoSeleccionado.sZcatCompleto = "";
                this.byId("idPagDetGasto").setTitle("Gasto de E.R. N°" + oGastoSeleccionado.ParkedDocument);
                sap.ui.getCore().setModel(oGastoSeleccionado, "oGastoSeleccionado");
                this.getView().byId("idFragDetGasto--idDetGastos").setModel(new JSONModel(oGastoSeleccionado));
                oGastoSeleccionado = this.addDevolucionUrl(oGastoSeleccionado);
                this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").setModel(new JSONModel(oGastoSeleccionado));
                this.fnCargarTablaDetGastos();
                this.onNavToPage("idPagDetGasto");
                //llamar odata donde se debe modificar el formulario y la tabla detalle
            },

            addDevolucionUrl: function (oData) {
                let sNroGasto = oData.ParkedDocument + oData.Bukrs + oData.Gjahr;
                let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                let route = sap.ui.getCore().getModel("route");
                let sDir =
                    "/cmis/" +
                    idrepositorio +
                    "/root/" +
                    this.parameters.AMBIENTE +
                    "/" +
                    route.carpetaSociedad +
                    "/" +
                    route.subcarpeta01 +
                    "/" +
                    "Devolucion" +
                    "/";
                let imagenes = this.listarDocumentos(sDir, sNroGasto);
                if (typeof imagenes[0] !== "undefined") {
                    oData.urlImagenDevolucion = imagenes[0].url;
                    oData.visibleBtnDevolucion = true;
                } else {
                    oData.visibleBtnDevolucion = false;
                }
                return oData;
            },
            fnCargarTablaDetGastos: function () {
                let oModel = this.getOwnerComponent().getModel("oEntregaModel"),
                    aFilter = [],
                    oGastoSeleccionado = sap.ui.getCore().getModel("oGastoSeleccionado");
                this.getView().byId("idFragDetGasto--idTablaDetGastos").setModel(new JSONModel([]));
                aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oGastoSeleccionado.Bukrs));
                aFilter.push(new Filter("Belnr", FilterOperator.EQ, oGastoSeleccionado.ParkedDocument));
                aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oGastoSeleccionado.Gjahr));
                sap.ui.core.BusyIndicator.show(0);
                oModel.read("/DetGastoSet", {
                    filters: aFilter,
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();

                        // let sNroGasto = oGastoSeleccionado.ParkedDocument + oGastoSeleccionado.Bukrs + oGastoSeleccionado.Gjahr;
                        // let ambiente = sap.ui.getCore().getModel("ambiente");
                        // let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                        // let carpetaP = sap.ui.getCore().getModel("carpetaP");
                        let route = sap.ui.getCore().getModel("route");
                        route.subcarpeta02 = "Gastos";
                        // let sDir =
                        //   "/cmis/" +
                        //   idrepositorio +
                        //   "/root/" +
                        //   ambiente +
                        //   "/" +
                        //   route.carpetaSociedad +
                        //   "/" +
                        //   route.subcarpeta01 +
                        //   "/" +
                        //   route.subcarpeta02 +
                        //   "/";

                        this.fnCargarDataOperacion();
                        let operaciones = sap.ui.getCore().getModel("aComboOperacion");

                        $.each(result.results, function (key, value) {
                            if (value.Mwskz === "C7") {
                                value.Mwskz = "0%";
                            } else {
                                value.Mwskz = "18%";
                            }

                            $.each(operaciones, function (keyOp, valueOp) {
                                if (valueOp.Zcat === value.ZCat) {
                                    value.ZCat = valueOp.Txt50;
                                }
                            });
                        });

                        sap.ui.getCore().setModel(result.results, "idTablaDetGastos");
                        this.getView().byId("idFragDetGasto--idTablaDetGastos").setModel(new JSONModel(result.results));
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(error);
                    },
                });
            },
            onPrimerGastos: function (oPrimerGasto) {
                this.byId("idPagDetGasto").setTitle("Gasto de E.R. N°" + oPrimerGasto.ParkedDocument);
                let sZcat;
                sZcat = oPrimerGasto.Zcat + " - " + oPrimerGasto.ZcatText;
                oPrimerGasto.sZcatCompleto = sZcat;
                sap.ui.getCore().setModel(oPrimerGasto, "oGastoSeleccionado");
                this.getView().byId("idFragDetGasto--idDetGastos").setModel(new JSONModel(oPrimerGasto));
                oPrimerGasto = this.addDevolucionUrl(oPrimerGasto);
                this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").setModel(new JSONModel(oPrimerGasto));
                this.fnCargarTablaDetGastos();
            },
            //Funcion para extraer archivos por carpetas
            listarDocumentos: function (dir, stext) {
                let dirr = dir + "/" + stext;
                let archivos = [];
                $.ajax(dirr + "?cmisselector=children", {
                    type: "GET",
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (respon) {
                        $.each(respon.objects, function (id, itm) {
                            archivos.push({
                                url: dirr + "/" + itm.object.properties["cmis:name"].value,
                                fileName: itm.object.properties["cmis:name"].value,
                                documentId: itm.object.properties["cmis:objectId"].value,
                                Type: itm.object.properties["cmis:objectTypeId"].value,
                                mimeType: itm.object.properties["cmis:contentStreamMimeType"].value,
                            });
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        if (error.responseJSON.exception === "objectNotFound") {
                            console.log("Error!! no se puede obterner cantidad de archivos");
                        }
                    },
                });
                return archivos;
            },
            obtenerSolicitud: function (sTipoDoc, sIdDoc) {
                let route = sap.ui.getCore().getModel("route");
                let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                // let carpetaP = sap.ui.getCore().getModel("carpetaP");
                let obj = [];
                route.subcarpeta02 = sTipoDoc;
                route.solicitud = sIdDoc;
                let repoUrl =
                    "/cmis/" +
                    idrepositorio +
                    "/root/" +
                    this.parameters.AMBIENTE +
                    "/" +
                    route.carpetaSociedad +
                    "/" +
                    route.subcarpeta01 +
                    "/" +
                    route.subcarpeta02 +
                    "/";
                $.ajax(repoUrl + "?cmisselector=children", {
                    type: "GET",
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        $.each(response.objects, function (idx, item) {
                            obj.push({
                                file: item.object.properties["cmis:name"].value,
                            });
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        if (error.responseJSON.exception === "objectNotFound") {
                            console.log("Error!! no se puede obterner cantidad de archivos");
                        }
                    },
                });
                return obj;
            },
            //llenado de lista de gastos
            onCargarListaGastos: function () {
                if (!this.state.hasSolicitudes) {
                    return;
                }
                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                if (typeof InfoIas === "undefined" || InfoIas === "") {
                    // Empty
                } else {
                    let oModelMaestro = this.getOwnerComponent().getModel("oEntregaModel");
                    this._oModelHeaders = {
                        Bukrs: InfoIas.Bukrs,
                        UsuarioIas: InfoIas.Sysid,
                        isUserSolicitante: InfoIas.isUserSolicitante,
                    };
                    oModelMaestro.read("/zgastoSet", {
                        headers: this._oModelHeaders,
                        success: (result, status, xhr) => {
                            sap.ui.core.BusyIndicator.hide();
                            if (result.results.length > 0) {
                                $.each(result.results, (key, value) => {
                                    let monto = String(value.Wrbtr);
                                    value.Wrbtr = monto.substring(0, monto.length - 1);
                                    //LR 29/12
                                    value.Wrbtr = parseFloat(value.Wrbtr).toFixed(2);
                                    //agrego un campo para hacer un flitro luego
                                    value.fechaSeteada = this.setFormatterDate(value.Bldat, "0");
                                });

                                let oPrimerGasto = result.results[result.results.length - 1];
                                let listaGasto = new JSONModel(result.results);
                                this.listaGasto = result.results;
                                listaGasto.setSizeLimit(999999999);
                                this.getView().byId("idFragListaGastos--idListaGasto").setModel(listaGasto);
                                this.onPrimerGastos(oPrimerGasto);
                            }
                        },
                        error: (xhr, status, error) => {
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                }
            },
            onFilterG: function () {
                this.onFilter("G");
            },
            fnChangeTxt: function () {
                let op = this.getView().byId("idFragCrearGasto--idOperacion").getSelectedKey();
                let oModel = this.getOwnerComponent().getModel("oEntregaModel"),
                    InfoIas = sap.ui.getCore().getModel("InfoIas");
                sap.ui.core.BusyIndicator.show(0);
                oModel.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + op + "')", {
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (result.Txt50 !== "") {
                            this.getView().byId("idFragCrearGasto--idCuentaMyr").setValue(result.Hkont);
                            this.getView().byId("idFragCrearGasto--idButtonAdd").setVisible(true);
                        } else {
                            this.getView().byId("idFragCrearGasto--idCuentaMyr").setValue("No existe Cuenta Mayor");
                            this.getView().byId("idFragCrearGasto--idButtonAdd").setVisible(false);
                        }
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            },
            //pguevarl - lo comenté ya que no se usa, ahora se usará "onFilterSunat"
            /*onFilterPosts: function () {
                  // alert(" onFilterPosts ");
              },*/
            fnCargarDataOperacion: function () {
                let oModel = this.getOwnerComponent().getModel("oEntregaModel"),
                    aComboOperacion = [],
                    aFilter = [],
                    oSolicitudSeleccionado = sap.ui.getCore().getModel("oSolicitudSeleccionada");
                sap.ui.core.BusyIndicator.show(0);
                aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oSolicitudSeleccionado.Bukrs));
                aFilter.push(new Filter("Type", FilterOperator.EQ, "G"));
                oModel.read("/OperacionSet", {
                    filters: aFilter,
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        $.each(result.results, (pos, ele) => {
                            aComboOperacion.push(ele);
                        });
                        sap.ui.getCore().setModel(aComboOperacion, "aComboOperacion");
                        this.getView().byId("idFragCrearGasto--idOperacion").setModel(new JSONModel(aComboOperacion));
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            },
            _byId: function (idName) {
                let byId = this.byId(idName);
                if (!byId) {
                    byId = sap.ui.getCore().byId(idName);
                }
                return byId;
            },
            fnEventoDevolucion: function () {
                let oInputDev = this.getView().byId("idFragCrearGasto--idDevolucion"),
                    oCheckDev = this.getView().byId("idFragCrearGasto--idCheckDevol");
                let btnAdjDevolucion = this.getView().byId("idFragCrearGasto--btnAdjDevolucion");
                if (oCheckDev.getSelected() === true) {
                    this.getView().byId("idFragCrearGasto--idCheckReembolso").setSelected(false);
                    this.fnEventoReembolso();
                    btnAdjDevolucion.setEnabled(true);
                    oInputDev.setEditable(true);
                } else {
                    oInputDev.setValue("");
                    this.getView().getModel("DocumentsDevolucion").setData([]);
                    btnAdjDevolucion.setEnabled(false);
                    oInputDev.setEditable(false);
                }
            },
            fnEventoReembolso: function () {
                let oInputReem = this.getView().byId("idFragCrearGasto--idReembolso"),
                    oCheckReem = this.getView().byId("idFragCrearGasto--idCheckReembolso");

                if (oCheckReem.getSelected() === true) {
                    this.getView().byId("idFragCrearGasto--idCheckDevol").setSelected(false);
                    this.fnEventoDevolucion();
                    oInputReem.setEditable(true);
                } else {
                    oInputReem.setValue("");
                    oInputReem.setEditable(false);
                }
            },
            //Llamar a la pagina de crear gasto
            onCrearGasto: function () {
                let resultPendiente = [];
                let nroSol = this.getView().byId("idFragDetSolicitud--idNroSolicitud").getValue();
                let Gjahr = this.getView().byId("idFragDetSolicitud--idDetSolicitud").getModel().getData().Gjahr;
                if (this.listaGasto !== undefined) {
                    resultPendiente = this.listaGasto.filter(function (ele) {
                        return (
                            ele.Sgtxt === nroSol && (ele.Status === "P" || ele.Status === "A") && !ele.FlagRev && ele.Gjahr === Gjahr
                        );
                    });
                }
                //resultPendiente = []; //BRAD
                if (resultPendiente.length >= 1) {
                    let message = "La solicitud ya tiene un gasto asociado.";
                    MessageBox.error(message);
                    return;
                }
                let aTablaDetGasto = [];
                let route = sap.ui.getCore().getModel("route");
                route.subcarpeta02 = "Gastos";
                sap.ui.getCore().setModel(aTablaDetGasto, "aTablaDetGasto");
                let oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada");
                if (oSolicitudSeleccionada === undefined) {
                    let msj = "Por favor seleccione una solicitud.";
                    MessageBox.error(msj);
                    return;
                }
                this.getView().byId("idFragCrearGasto--idFechaFactura")._bMobile = true;
                this.getView().byId("idFragCrearGasto--idFecha")._bMobile = true;
                this.getView().byId("idFragCrearGasto--idFechaCont")._bMobile = true;

                this.getView().byId("idFragCrearGasto--idFechaFactura").setValue(this.fnFormatearFechaVista(new Date()));
                this.getView().byId("idFragCrearGasto--idFecha").setValue(this.fnFormatearFechaVista(new Date()));
                this.getView().byId("idFragCrearGasto--idFechaCont").setValue(this.fnFormatearFechaVista(new Date()));

                // this.getView().byId("idFragCrearGasto--idFechaFactura").setMinDate(new Date());
                let dFechaFectura = this.getView().byId("idFragDetSolicitud--idFecha").getDateValue();
                this.getView().byId("idFragCrearGasto--idFechaFactura").setMinDate(dFechaFectura);
                this.getView().byId("idFragCrearGasto--idFecha").setMinDate(new Date());
                this.getView().byId("idFragCrearGasto--idFechaCont").setMinDate(new Date());

                if (oSolicitudSeleccionada.ParkedDocument !== "" && oSolicitudSeleccionada.ParkedDocument !== undefined) {
                    let modeloSol = {};
                    this.fnCargarDataComboSunat();
                    this.fnCargarDataOperacion();
                    this.loadCentroCostoList();
                    modeloSol.oFecDoc = this.getView().byId("idFragDetSolicitud--idFecha").getValue();
                    modeloSol.oOperacion = this.getView().byId("idFragDetSolicitud--idOperacion").getValue().substr(0, 4);
                    modeloSol.oSol = oSolicitudSeleccionada.ParkedDocument;
                    modeloSol.oTotalSol = oSolicitudSeleccionada.Wrbtr;
                    modeloSol.oDes = "Movilidad";
                    modeloSol.FechCon = this.getView().byId("idFragDetSolicitud--idFechaCont").getValue();
                    modeloSol.oWaers = this.getView().byId("idFragDetSolicitud--idWaers").getValue();
                    modeloSol.Kostl = sap.ui.getCore().getModel("InfoIas").Kostl;
                    modeloSol.oRef = "GASTO." + oSolicitudSeleccionada.ParkedDocument;
                    let oFormGasto = this.getView("idFragCrearGasto");
                    oFormGasto.setModel(new JSONModel(modeloSol));

                    sap.ui.core.BusyIndicator.show(0);
                    setTimeout(() => {
                        sap.ui.core.BusyIndicator.hide();
                        this.fnChangeTxt();
                        let oTable = this.getView().byId("idFragCrearGasto--idTablaDetGastos");
                        oTable.setModel(new JSONModel([]));
                        this.onNavToPage("idPagCrearGasto");
                    }, 1500);
                } else {
                    let msj = "Seleccione una solicitud.";
                    this.showMessageBox(msj, "warning");
                }
            },
            fnCargarDataComboSunat: function () {
                let oModel = this.getOwnerComponent().getModel("oModelMaster"),
                    aComboSunat = [];
                sap.ui.core.BusyIndicator.show(0);
                oModel.read("/ListasSet", {
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        $.each(result.results, (pos, ele) => {
                            aComboSunat.push(ele);
                        });
                        this.getView().byId("idFragCrearGasto--idTipoDocS").setModel(new JSONModel(aComboSunat));
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            },
            onCrearNuevoGasto: function (Bevent) {
                //bloquear boton
                this.getView().byId("btnGrabar").setEnabled(false);

                //Verifica si existe aprobador del primer nivel
                /********* Obteniene lista de aprobadores desde SAP ********/
                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                let query =
                    "/zinaprobadoresSet(" +
                    "Bukrs='" +
                    InfoIas.Bukrs +
                    "'," +
                    "Prcid='" +
                    this.parameters.PROCESO +
                    "'," +
                    "Rulid='" +
                    this.parameters.REGLA +
                    "'," +
                    "Tskid='" +
                    this.parameters.GASTO_NIVEL_APROBACION_1 +
                    "'," +
                    "Tabname='" +
                    this.state.tablaFiltro +
                    "'," +
                    "Fieldname='" +
                    this.state.campoFiltro +
                    "'," +
                    "Value='" +
                    InfoIas.Plans +
                    "'," +
                    "Isfound=false," +
                    "TabSearch='" +
                    this.parameters.BUSQUEDA_TABLA +
                    "'," +
                    "FieldSearch='" +
                    this.parameters.BUSQUEDA_CAMPO +
                    "')/zaprobadoresmultout";
                console.log(query);
                this.getView().setBusyIndicatorDelay(0);
                this.getView().setBusy(true);
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read(query, {
                        success: (res) => {
                            this.getView().setBusy(false);
                            if (res.results !== undefined) {
                                if (res.results.length > 0) {
                                    console.log("APROBADOR PRIMER NIVEL");
                                    console.log(res.results[0].Low);
                                    this.grabarNuevoGasto(); //Primero verifica si tiene aprobadores de segundo nivel
                                } else {
                                    this.showMessageBox(this.getI18nText("appSinAprobadorSegundoNivel"), "error");
                                }
                            }
                        },
                        error: (err) => {
                            this.getView().setBusy(false);
                            let msj = this.getI18nText("appErrorMsg");
                            this.showMessageBox(msj, "error");
                        },
                    });
            },
            grabarNuevoGasto: function () {
                //Verifica si existe aprobador del segundo nivel
                /********* Obteniene lista de aprobadores desde SAP ********/
                let InfoIas = sap.ui.getCore().getModel("InfoIas");
                let query =
                    "/zinaprobadoresSet(" +
                    "Bukrs='" +
                    InfoIas.Bukrs +
                    "'," +
                    "Prcid='" +
                    this.parameters.PROCESO +
                    "'," +
                    "Rulid='" +
                    this.parameters.REGLA +
                    "'," +
                    "Tskid='" +
                    this.parameters.GASTO_NIVEL_APROBACION_2 +
                    "'," +
                    "Tabname='" +
                    this.state.tablaFiltro +
                    "'," +
                    "Fieldname='" +
                    this.state.campoFiltro +
                    "'," +
                    "Value='" +
                    InfoIas.Plans +
                    "'," +
                    "Isfound=false," +
                    "TabSearch='" +
                    this.parameters.BUSQUEDA_TABLA +
                    "'," +
                    "FieldSearch='" +
                    this.parameters.BUSQUEDA_CAMPO +
                    "')/zaprobadoresmultout";
                console.log(query);
                this.getView().setBusyIndicatorDelay(0);
                this.getView().setBusy(true);
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read(query, {
                        success: (res) => {
                            this.getView().setBusy(false);
                            if (res.results !== undefined) {
                                if (res.results.length > 0) {
                                    console.log("APROBADOR SEGUNDO NIVEL");
                                    console.log(res.results[0].Low);
                                    this.fnGrabarGasto(); //llama a la creación del gasto
                                } else {
                                    this.showMessageBox(this.getI18nText("appSinAprobadorSegundoNivel"), "error");
                                }
                            }
                        },
                        error: (err) => {
                            this.getView().setBusy(false);
                            let msj = this.getI18nText("appErrorMsg");
                            this.showMessageBox(msj, "error");
                        },
                    });
            },
            fnGrabarGasto: function () {
                let aFilaGrabaGasto = {},
                    aJSolicitud = {},
                    oSolicitudSeleccionada = sap.ui.getCore().getModel("oSolicitudSeleccionada"),
                    oModelMaster = this.getOwnerComponent().getModel("oEntregaModel"),
                    oJGasto = this.getView().byId("idFragCrearGasto--idTablaDetGastos").getModel().getData(),
                    InfoIas = sap.ui.getCore().getModel("InfoIas"),
                    oFecDoc = this.getView().byId("idFragCrearGasto--idFecha"),
                    oIdImporteTotal = this.getView().byId("idFragCrearGasto--idImporteTotal"),
                    // idImporteD = this.getView().byId("idFragCrearGasto--idImporteD"),
                    idImporteS = this.getView().byId("idFragCrearGasto--idImporteS"),
                    oidCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
                    oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso"),
                    oIdDevolucion = this.getView().byId("idFragCrearGasto--idDevolucion"),
                    oIdReembolso = this.getView().byId("idFragCrearGasto--idReembolso"),
                    FechCon = this.getView().byId("idFragCrearGasto--idFechaCont"),
                    oTableCrearGasto = this.getView().byId("idFragCrearGasto--idTablaDetGastos");
                let oTableGastoWorkflow = [];
                oTableGastoWorkflow = this.cloneObj(
                    this.getView().byId("idFragCrearGasto--idTablaDetGastos").getModel().getData()
                );

                //this.getView().setModel(new JSONModel(oBtnDevolucion.getModel("DocumentsDevolucion").getData()),"DocumentsForPosition");
                if (oTableCrearGasto.getModel().getData().length <= 0) {
                    let msj = "Debe agregar al menos una fila.";
                    this.showMessageBox(msj, "warning");
                    //LR 27/12
                    this.getView().byId("btnGrabar").setEnabled(true);
                    return;
                }

                if (Number(idImporteS.getValue()) > Number(oIdImporteTotal.getValue())) {
                    if (oIdDevolucion.getValue() === "") {
                        let msj = "Debe seleccionar el checkbox y agregar una devolución.";
                        this.showMessageBox(msj, "warning");
                        //LR 27/12
                        this.getView().byId("btnGrabar").setEnabled(true);
                        return;
                    }
                }
                if (Number(idImporteS.getValue()) < Number(oIdImporteTotal.getValue())) {
                    if (!oIdCheckReembolso.getSelected()) {
                        let msj = "Debe seleccionar el checkbox de reembolso.";
                        this.showMessageBox(msj, "warning");
                        //LR 27/12
                        this.getView().byId("btnGrabar").setEnabled(true);
                        return;
                    }
                }

                this.getView().byId("btnGrabar").setEnabled(false);

                aJSolicitud.Zflag = "";
                aJSolicitud.Zcat = oSolicitudSeleccionada.Zcat;
                aJSolicitud.Ztyp = "S";
                aJSolicitud.Wrbtr = oSolicitudSeleccionada.Wrbtr;
                aJSolicitud.Tax_code = "";
                aJSolicitud.Kunnr = "";
                aJSolicitud.Hkont = oSolicitudSeleccionada.Hkont;
                aJSolicitud.Xblnr = oSolicitudSeleccionada.Xblnr;
                aJSolicitud.Waers = oSolicitudSeleccionada.Waers;
                aJSolicitud.Bktxt = InfoIas.Pname.substring(0, 25);
                aJSolicitud.Sgtxt = "";
                aJSolicitud.Xref_1 = "";
                aJSolicitud.Zuonr = "";
                aJSolicitud.Budat = this.fnFormatearFechaSAP(FechCon.getValue()).replace(/-/gi, "");
                aJSolicitud.Bldat = this.fnFormatearFechaSAP(oFecDoc.getValue()).replace(/-/gi, "");
                aJSolicitud.Kostl = oSolicitudSeleccionada.Kostl;
                aJSolicitud.Segment = "";
                aJSolicitud.Parked_document = oSolicitudSeleccionada.ParkedDocument;
                aJSolicitud.Flag_rev = "";
                aJSolicitud.Rev_document = "";
                aJSolicitud.Doc_asoc = "";
                aJSolicitud.Light = "";

                sap.ui.getCore().setModel(oTableGastoWorkflow, "oTableGastoWorkflow");
                $.each(oJGasto, function (key, value) {
                    //LR 12/12/19
                    //pguevarl - comenté esto ya que algunos docsunat permiten tener más de 9 dígitos
                    /*if ((value.oCorrelativo).length > 8){
                              let msjs = "Cantidad de dígitos mayor a la permitida";
                              MessageToast.show(msjs);
                              return;
                          }*/
                    if (oidCheckDevol.getSelected() === true) {
                        value.Flag_dev = "X";
                        value.Sgtxt_dev = oIdDevolucion.getValue();
                        delete value.oOperacion;
                        delete value.oCtaMyr;
                        delete value.oSerie;
                        delete value.oCorrelativo;
                        delete value.oIndImp;
                    } else {
                        value.Flag_dev = "";
                        delete value.oOperacion;
                        delete value.oCtaMyr;
                        delete value.oSerie;
                        delete value.oCorrelativo;
                        delete value.oIndImp;
                    }
                    if (oIdCheckReembolso.getSelected() === true) {
                        value.Flag_reembolso = "X";
                        value.Sgtxt_dev = oIdReembolso.getValue();
                        delete value.oOperacion;
                        delete value.oCtaMyr;
                        delete value.oSerie;
                        delete value.oCorrelativo;
                        delete value.oIndImp;
                    } else {
                        value.Flag_reembolso = "";
                        delete value.oOperacion;
                        delete value.oCtaMyr;
                        delete value.oSerie;
                        delete value.oCorrelativo;
                        delete value.oIndImp;
                    }
                });
                //Fila a mandar hacia la cabecera de Gasto
                aFilaGrabaGasto.Bukrs = oSolicitudSeleccionada.Bukrs;
                aFilaGrabaGasto.Hkont = oSolicitudSeleccionada.Hkont;
                aFilaGrabaGasto.JSolicitud = JSON.stringify(aJSolicitud);
                aFilaGrabaGasto.Belnr = oSolicitudSeleccionada.ParkedDocument;
                aFilaGrabaGasto.JGasto = JSON.stringify(oJGasto);
                aFilaGrabaGasto.Txt50 = "";
                aFilaGrabaGasto.Gjahr = oSolicitudSeleccionada.Gjahr;
                aFilaGrabaGasto.Usnam = InfoIas.Sysid;
                aFilaGrabaGasto.Zfondo = oSolicitudSeleccionada.Zfondo;
                aFilaGrabaGasto.Blart = oSolicitudSeleccionada.Blart;
                aFilaGrabaGasto.Budat =
                    this.fnFormatearFechaSAP(this.fnFormatearFechaVista(oSolicitudSeleccionada.Budat)) + "T00:00:00";
                aFilaGrabaGasto.Bldat =
                    this.fnFormatearFechaSAP(this.fnFormatearFechaVista(oSolicitudSeleccionada.Bldat)) + "T00:00:00";
                aFilaGrabaGasto.BktxtSol = oSolicitudSeleccionada.BktxtSol;
                aFilaGrabaGasto.BktxtDoc = oSolicitudSeleccionada.BktxtDoc;
                aFilaGrabaGasto.Xblnr = oSolicitudSeleccionada.Xblnr;
                aFilaGrabaGasto.Zcat = oSolicitudSeleccionada.Zcat;
                aFilaGrabaGasto.Type = "G";
                aFilaGrabaGasto.Waers = oSolicitudSeleccionada.Waers;
                aFilaGrabaGasto.Wrbtr = oIdImporteTotal.getValue();
                aFilaGrabaGasto.Status = oSolicitudSeleccionada.Status;
                aFilaGrabaGasto.Augbl = "";
                aFilaGrabaGasto.Augdt = this.fnFormatearFechaSAP(this.fnFormatearFechaVista(new Date())) + "T00:00:00";
                aFilaGrabaGasto.Xreverse = oSolicitudSeleccionada.Xreverse;
                aFilaGrabaGasto.Bukrss = "";

                sap.ui.core.BusyIndicator.show(0);
                oModelMaster.create("/GastoSet", aFilaGrabaGasto, {
                    success: (oData, oResponse) => {
                        // Success
                        this.fnSubirArchivosDevolucion(oData);
                        this.fnGrabarDetalleGasto(oData);
                        sap.ui.getCore().setModel(oData, "aRespuestaGasto");
                    },
                    error: (oError) => {
                        // Error
                        sap.ui.core.BusyIndicator.hide();
                        if (oError.responseText !== "") {
                            let txt =
                                "Ocurrió un error en SAP.\n\n" +
                                JSON.parse(oError.responseText).error.message.value +
                                "\n" +
                                JSON.parse(oError.responseText).error.code;
                            MessageBox.error(txt);
                        } else {
                            MessageBox.error(
                                "Ocurrió un error al intentar crear su documento, póngase en contacto con su departamento de Sistemas."
                            );
                        }
                    },
                });
            },
            cloneObj: function (mainObj) {
                return JSON.parse(JSON.stringify(mainObj));
            },
            onPressItemDownload: function (oEvent) {
                let oSource = oEvent.getSource();
                let object = oSource.getBindingContext().getObject();
                //sap.m.URLHelper.redirect(url,true);

                //	let blob = new Blob(object.size, {type : object.size});
                let file_path = object.url;
                let a = document.createElement("A");
                a.href = file_path;
                a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                //	window.location.href = object.url;
                //sap.ui.core.util.File.save(blob,object.name.slice(0,object.name.lastIndexOf(".")), object.mimeType.split("/")[1]);
                //	sap.ui.core.util.File.save(blob,object.name.slice(0,object.name.lastIndexOf(".")), object.name.slice(object.name.lastIndexOf(".")+1));
            },
            fnAbrir: function (oEvent) {
                let urlDS = undefined;
                let oSource = oEvent.getSource();
                let id = oSource.getId();
                let formDetGasto = this.getView().byId("idFragDetGasto--idDetDevolucionReembolso").getModel().getData();
                if (id.indexOf("btnDownloadTable") > -1) {
                    let tableData = oSource.getParent().getParent().getModel().getData();
                    let sPath = oSource.getBindingContext().getPath().split("/")[1];
                    let object = tableData[sPath];
                    urlDS =
                        this.parameters.AMBIENTE +
                        "/" +
                        sap.ui.getCore().getModel("route").carpetaSociedad +
                        "/" +
                        "ENTREGASRENDIR" +
                        "/" +
                        "GASTOS" +
                        "/" +
                        object.Belnr +
                        object.Bukrs +
                        object.Gjahr +
                        "/" +
                        object.Nrpos;
                } else {
                    urlDS =
                        this.parameters.AMBIENTE +
                        "/" +
                        sap.ui.getCore().getModel("route").carpetaSociedad +
                        "/" +
                        "ENTREGASRENDIR" +
                        "/" +
                        "DEVOLUCION" +
                        "/" +
                        formDetGasto.ParkedDocument +
                        formDetGasto.Bukrs +
                        formDetGasto.Gjahr;
                }

                if (!this._dialogDownload) {
                    this._dialogDownload = sap.ui.xmlfragment("everis.apps.entregasRendir.view.fragment.DownloadFile", this);
                    this.getView().addDependent(this._dialogDownload);
                }
                let aDownload = [];
                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        let children = JSON.parse(this.responseText);
                        //	let str = "<ul>";
                        //let repoUrl = "/cmis/69055723e854a72d3e458fc5/root/" + urlDS + "/";
                        let repoUrl = this.responseURL + "/";
                        for (let i = 0; i < children.objects.length; i++) {
                            let oDownload = {};
                            if (children.objects[i].object.properties["cmis:baseTypeId"].value == "cmis:folder") {
                                // empty
                            } else {
                                let name = children.objects[i].object.properties["cmis:name"].value;
                                let mimeType = children.objects[i].object.properties["cmis:contentStreamMimeType"].value;
                                let size = children.objects[i].object.properties["cmis:contentStreamLength"].value;

                                oDownload.url = repoUrl + name;
                                oDownload.name = name;
                                oDownload.mimeType = mimeType;
                                oDownload.size = size;
                                //	str += '<li><a href="' + repoUrl + name + '">' + name + '</a></li>';
                            }

                            aDownload.push(oDownload);
                        }

                        this._dialogDownload.setModel(new JSONModel(aDownload));
                        this._dialogDownload.getModel().updateBindings();
                        this._dialogDownload.open();
                        //	str += "</ul>";
                        //	document.getElementById("listchildren").innerHTML = str;
                    } else if (this.readyState == 4 && this.status == 404) {
                        MessageBox.warning(this.getI18nText("noAdjunt"));
                    }
                };
                // xhttp.open("GET",
                // 	"/cmis/69055723e854a72d3e458fc5/root/" + urlDS,
                // 	true);
                // xhttp.send();

                xhttp.open("GET", "/cmis/1a084adbc0dc11ba63fc49e5/root/" + urlDS, true);
                xhttp.send();

                // let posUrl = oEvent.getSource().data("posUrl");
                // if (posUrl !== null) {
                // 	sap.m.URLHelper.redirect(posUrl, true);
                // } else {
                // 	MessageBox.alert("No contiene archivo guardado");
                // }
            },
            onCloseDialogDownload: function () {
                this._dialogDownload.close();
            },

            onCloseDialog: function (oEvent) {
                this._oDialogFiles.close();
            },
            //LR ABRIR HISTORIAL GASTOS

            // fnAbrirDevolucion: function (oEvent) {

            // 	let posUrl = oEvent.getSource().data("posUrl");
            // 	if (posUrl !== null) {
            // 		sap.m.URLHelper.redirect(posUrl, true);
            // 	} else {
            // 		MessageBox.alert("No contiene archivo guardado");
            // 	}
            // },
            setFormatterDate: function (pValue, val) {
                if (pValue !== null && pValue !== undefined) {
                    let d = new Date(pValue);
                    if (val === "0") {
                        d.setDate(d.getDate() + 1);
                    } else {
                        d.setDate(d.getDate());
                    }
                    let month = "" + (d.getMonth() + 1),
                        day = "" + d.getDate(),
                        year = d.getFullYear();
                    if (month.length < 2) month = "0" + month;
                    if (day.length < 2) day = "0" + day;

                    return [day, month, year].join("-");
                } else {
                    return "";
                }
            },
            fnFormatearFechaVista: function (pValue) {
                if (pValue !== null && pValue !== undefined) {
                    let d = new Date(pValue);
                    let month = "" + (d.getMonth() + 1),
                        day = "" + d.getDate(),
                        year = "" + d.getFullYear();

                    if (month.length < 2) month = "0" + month;
                    if (day.length < 2) day = "0" + day;

                    return [day, month, year].join("-");
                } else {
                    return "";
                }
            },
            onIrHome: function () {
                alert("Back to Home");
            },
            //Funcion para cambiar de pagina
            onNavToPage: function (sID) {
                this.onGetSplitAppObj().to(this.createId(sID));
            },
            //Funcion para obtener el id del split(se usa en el cambio de pagina)
            onGetSplitAppObj: function () {
                let result = this.byId("idSplitFondoFijo");
                return result;
            },
            onValidarVacio: function (valor) {
                valor = valor === undefined ? "" : valor;
                if (!valor || 0 === valor.trim().length) {
                    return true;
                } else {
                    return false;
                }
            },
            showMessageBox: function (msg, Method) {
                if (Method === "warning") {
                    sap.m.MessageBox.warning(msg, {
                        title: "Alerta",
                        actions: ["Aceptar"],
                        onClose: function (sActionClicked) { },
                    });
                }
                if (Method === "error") {
                    sap.m.MessageBox.error(msg, {
                        title: "Error",
                        actions: ["Aceptar"],
                        onClose: function (sActionClicked) { },
                    });
                }
                if (Method === "show") {
                    sap.m.MessageBox.show(msg, {
                        title: "Mensaje",
                        actions: ["Aceptar"],
                        onClose: function (sActionClicked) { },
                    });
                }
                if (Method === "success") {
                    sap.m.MessageBox.success(msg, {
                        title: "Éxito",
                        actions: ["Aceptar"],
                        onClose: function (sActionClicked) { },
                    });
                }
            },
            showMessageBoxAndBack: function (msg, Method) {
                let oCrossAppNavigator;
                let bCross = false;
                if (sap.ushell !== undefined) {
                    oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    bCross = true;
                }
                sap.m.MessageBox[Method](msg, {
                    actions: ["Volver al Portal"],
                    emphasizedAction: "Volver al Portal",
                    onClose: function () {
                        if (bCross) {
                            oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: "#",
                                },
                            });
                        }
                    },
                });
            },
            fnFormatearFechaSAP: function (pValue) {
                let iDia = pValue.substr(0, 2);
                let iMes = pValue.substr(3, 2);
                let iYear = pValue.substr(6, 4);
                return [iYear, iMes, iDia].join("-");
            },
            fnGrabarDetalleGasto: function (oData) {
                let aTablaDetGasto = sap.ui.getCore().getModel("aTablaDetGasto"),
                    oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
                oVariablesGlobales.Flag = 0;

                $.each(aTablaDetGasto, function (key, value) {
                    value.Nrpos = String(value.Nrpos);
                    value.Belnr = oData.Belnr;
                    value.Bukrs = oData.Bukrs;
                    value.Gjahr = oData.Gjahr;
                    value.Blart = oData.Blart;
                });
                this.fnServicioGrabarDetalleGasto(aTablaDetGasto);
            },
            fnServicioGrabarDetalleGasto: function (aTablaDetGasto) {
                //LR se agrego para que no permita dar varios click .
                this.getView().byId("btnGrabar").setEnabled(false);
                //se agrego para que no permita dar varios click .
                let oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
                    oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel"),
                    aFilaDetGasto = {};

                let aEntrada = aTablaDetGasto[oVariablesGlobales.Flag];
                aFilaDetGasto = aEntrada;
                sap.ui.getCore().setModel(aFilaDetGasto, "aFilaDetGasto");
                let imagen = aEntrada.Imagen;
                delete aEntrada.Imagen;

                delete aEntrada.path;

                oModelMaestroSolicitudes.create("/DetGastoSet", aEntrada, {
                    success: (oData, oResponse) => {
                        oVariablesGlobales.Flag++;

                        if (oVariablesGlobales.Flag === aTablaDetGasto.length) {
                            oVariablesGlobales.Flag = 0;
                            this.onCargarListaGastos();
                            MessageBox.success("Se ha registrado el gasto " + aEntrada.Belnr + ".");
                            aEntrada.Imagen = imagen;
                            this.fnSubirArchivos();
                            this.fnWorkFlow(aEntrada, "G");
                            this.fnLimpiarCamposCrearGastos();
                            this.onIrListaDSolicitud();
                            sap.ui.core.BusyIndicator.hide();
                            //LR desbloquee el boton
                            //this.getView().byId("btnGrabar").setEnabled(true);//pguevarl - comenté esto porque estaba mal declarado
                            this.getView().byId("btnGrabar").setEnabled(true); //pguevarl
                        } else {
                            aEntrada.Imagen = imagen;
                            this.fnSubirArchivos();
                            this.fnServicioGrabarDetalleGasto(aTablaDetGasto);
                        }
                    },
                    error: (oError) => {
                        //this.getView().byId("btnGrabar").setEnabled(true);//pguevarl - comenté esto porque estaba mal declarado
                        this.getView().byId("btnGrabar").setEnabled(true); //pguevarl
                        sap.ui.core.BusyIndicator.hide();
                        let msj = "Ocurrió un error en SAP.\n\nNo se ha podido registrar la fila " + aEntrada.Nrpos + ".";
                        this.showMessageBox(msj, "error");
                        return;
                    },
                });
            },
            fnSubirArchivos: function () {
                let aFilaDetGasto = sap.ui.getCore().getModel("aFilaDetGasto"),
                    fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");
                // sIdGasto = "";

                if (aFilaDetGasto.Imagen === null || typeof aFilaDetGasto.Imagen === "undefined") {
                    return;
                } else {
                    fileUploadImagenes[0] = aFilaDetGasto.Imagen;
                    // sIdGasto = "" + aFilaDetGasto.Belnr + aFilaDetGasto.Bukrs + aFilaDetGasto.Gjahr;
                    let param = [];
                    param.Belnr = aFilaDetGasto.Belnr;
                    param.Bukrs = aFilaDetGasto.Bukrs;
                    param.Gjahr = aFilaDetGasto.Gjahr;

                    this.fnImport(param);
                }
            },
            fnSubirArchivosDevolucion: function (gasto) {
                // let fileDevolucion = sap.ui.getCore().getModel("devolucion"),
                //   fileUploadImagenesDevolucion = sap.ui.getCore().getModel("fileUploadImagenesDevolucion"),
                //   sIdGasto = "";

                //	fileUploadImagenesDevolucion[0] = fileDevolucion.Imagen;

                // sIdGasto = "" + gasto.Belnr + gasto.Bukrs + gasto.Gjahr;
                let param = [];
                param.Belnr = gasto.Belnr;
                param.Bukrs = gasto.Bukrs;
                param.Gjahr = gasto.Gjahr;

                this.fnImportDevolucion(param);
            },
            fnWorkFlow: function (aData) {
                var that = this;
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: that._getAppModulePath() + "/bpmworkflowruntime/v1/xsrf-token",
                        method: "GET",
                        async: false,
                        headers: {
                            "X-CSRF-Token": "Fetch",
                        },
                        success: function (result, xhr, data) {
                            let sToken = data.getResponseHeader("X-CSRF-Token");
                            that.fnStartInstanceS(sToken, aData).then(() => {
                                resolve();
                              }).catch((error) => {
                                console.log(error);
                                reject();
                              });
                        },
                    });
                });
            },
            fnFetchToken: function () {
                let sToken;
                $.ajax({
                    url: this._getAppModulePath() + "/bpmworkflowruntime/v1/xsrf-token",
                    method: "GET",
                    async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch",
                    },
                    success: function (result, xhr, data) {
                        sToken = data.getResponseHeader("X-CSRF-Token");
                    },
                });
                return sToken;
            },
            fnStartInstanceS: function (token, oData) {
                var that = this;
                return new Promise((resolve, reject) => {
                    let oModelTablaDetSolicitud = sap.ui.getCore().getModel("oModelTablaDetSolicitud"),
                        aData = {},
                        InfoIas = sap.ui.getCore().getModel("InfoIas"),
                        oTotal = {},
                        // oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales"),
                        oModelMaestroSolicitudes = that.getOwnerComponent().getModel("oEntregaModel");
                    oTotal.Detalle = "Total";
                    oTotal.Wrbtr = that.getView().byId("idFragCrearSolicitud--idImporteTotal").getValue();
                    oTotal.Waers = that.getView().byId("idFragCrearSolicitud--idWaers").getProperty("value");
                    oModelTablaDetSolicitud.push(oTotal);

                    let oOperacion = that.getView().byId("idFragCrearSolicitud--idOperacion"),
                        oMoneda = that.getView().byId("idFragCrearSolicitud--idWaers"),
                        oReferenciaGeneral = that.getView().byId("idFragCrearSolicitud--idReferencia");

                    let oTipoObjCosto = that.getView().byId("idFragCrearSolicitud--inputTipImp"),
                        oObjCosto = that.getView().byId("idFragCrearSolicitud--inputCeCo"),
                        oObservaciones = that.getView().byId("idFragCrearSolicitud--inputObser"),
                        oAdicional = that.getView().byId("idFragCrearSolicitud--idAdicionales");

                    aData.KSRTG = oData.Ksrtg;
                    if (aData.KSRTG === "K") {
                        aData.KOSTL = oData.Kostl;
                        aData.AUFNR = "";
                    } else if (aData.KSRTG === "F") {
                        aData.KOSTL = "";
                        aData.AUFNR = oData.Aufnr;
                    }

                    aData.NombreDocumento = "Solicitud";
                    aData.Nivel = "1";
                // aData.Nivel = "2";
                    aData.Bukrs = oData.Bukrs;
                    aData.Belnr = oData.Belnr;
                    aData.Gjahr = oData.Gjahr;
                    aData.Prcid = that.parameters.PROCESO;
                    aData.Rulid = "";
                    aData.Iskid = that.parameters.SOLICITUD_NIVEL_APROBACION_1;
                    aData.IskidL2 = that.parameters.SOLICITUD_NIVEL_APROBACION_2;
                    aData.Tabname = that.state.tablaFiltro;
                    aData.Fieldname = that.state.campoFiltro;
                    aData.Pname = InfoIas.Pname.substring(0, 25);
                    // aData.Value = InfoIas.Plans;
                    aData.Value = that.state.plans;
                    aData.Isfound = false;
                    aData.Tabname_search = that.parameters.BUSQUEDA_TABLA;
                    aData.Fieldname_search = that.parameters.BUSQUEDA_CAMPO;
                    aData.Usuario = InfoIas.Sysid;
                    aData.Fecha = that.fnFormatearFechaVista(new Date());
                    aData.ImporteTotal =
                        that.getView().byId("idFragCrearSolicitud--idImporteTotal").getValue() +
                        " " +
                        that.getView().byId("idFragCrearSolicitud--idWaers").getValue();
                    aData.DetalleSol = oModelTablaDetSolicitud;
                    aData.CorporativeEmail = InfoIas.CorporativeEmail;
                    aData.PersonalEmail = InfoIas.PersonalEmail;
                    aData.Type = "S";

                    aData.SociedadTxt = InfoIas.Butxt;

                    aData.Operacion = oOperacion.getValue();
                    aData.Moneda = oMoneda.getValue();
                    aData.ReferenciaGeneral = oReferenciaGeneral.getValue();

                    aData.Kstrg = oTipoObjCosto.getValue();
                    let sTipo = that.oVariablesJSONModel.getData().Rstyp.code;

                    if (sTipo === "F") {
                        aData.Aufnr = oObjCosto.getValue();
                    } else {
                        aData.Kostl = oObjCosto.getValue();
                    }

                    aData.Zobserv = oObservaciones.getValue();
                    if (that.oGeneral.getProperty("/displayAdicionales")) {
                        aData.FlagAdicional = true;
                        aData.Eratx = oAdicional.getValue();
                    } else {
                        aData.FlagAdicional = false;
                    }
                    aData.idFolderSolicitudGenerada = that.oVariablesJSONModel.getProperty("/idFolderSolicitudGenerada");
                    aData.identificadorAplicacion = "Entregas a Rendir";

                    BusyIndicator.show(0);

                    $.ajax({
                        url: that._getAppModulePath() + "/bpmworkflowruntime/v1/workflow-instances",
                        method: "POST",
                        async: false,
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": token,
                        },
                        data: JSON.stringify({
                            definitionId: "aprobarentregarendir",
                            context: aData,
                        }),
                        success: (result, xhr, data) => {
                            if (result.status === "RUNNING") {
                                console.log("Solicitud Enviada");
                                let oActualizarWorkflowId = {};
                                oActualizarWorkflowId.IdWorkflow = result.id;
                                oActualizarWorkflowId.Ztyp = "U";
                                oModelMaestroSolicitudes.update(
                                    "/zsolicitudSet(Bukrs='" +
                                    aData.Bukrs +
                                    "',ParkedDocument='" +
                                    aData.Belnr +
                                    "',Gjahr='" +
                                    aData.Gjahr +
                                    "')",
                                    oActualizarWorkflowId,
                                    {
                                        success: () => {
                                            console.log("Se actualizó id de workflow");
                                            MessageToast.show(that.getI18nText("msgWorkflowSuccess"));
                                            BusyIndicator.hide();
                                            resolve();
                                        },
                                        error: (error) => {
                                            console.log(error);
                                            console.log("No se actualizó id de workflow");
                                            MessageBox.error(that.getI18nText("msgWorkflowError"));
                                            reject();
                                        },
                                    }
                                );
                            } else {
                                console.log("No se envio la solicitud");
                                MessageBox.error(that.getI18nText("msgWorkflowError"));
                                reject();
                            }
                        },
                        error: (error) => {
                            console.log(error);
                            MessageBox.error(that.getI18nText("msgWorkflowError"));
                            reject();
                          }
                    });
                });
            },
            _getAppModulePath: function () {
                const appId = this.getOwnerComponent().getManifestEntry("/sap.app/id"),
                    appPath = appId.replaceAll(".", "/");

                return jQuery.sap.getModulePath(appPath);
            },
            fnStartInstanceG: function (token, oData) {
                let aTablaDetGasto = sap.ui.getCore().getModel("oTableGastoWorkflow"),
                    aData = {},
                    InfoIas = sap.ui.getCore().getModel("InfoIas");
                aData.Nivel = 1;
                aData.NombreDocumento = "Rendición";
                aData.Bukrs = oData.Bukrs;
                aData.Belnr = oData.Belnr;
                aData.Gjahr = oData.Gjahr;
                aData.Prcid = this.parameters.PROCESO;
                aData.Rulid = this.parameters.REGLA;
                aData.Iskid = this.parameters.GASTO_NIVEL_APROBACION_1;
                aData.IskidL2 = this.parameters.GASTO_NIVEL_APROBACION_2;
                aData.Tabname = this.state.tablaFiltro;
                aData.Fieldname = this.state.campoFiltro;
                aData.Pname = InfoIas.Pname.substring(0, 25);
                aData.Value = InfoIas.Plans;
                aData.Isfound = false;
                aData.Tabname_search = this.parameters.BUSQUEDA_TABLA;
                aData.Fieldname_search = this.parameters.BUSQUEDA_CAMPO;
                aData.Usuario = InfoIas.Sysid;
                aData.Fecha = this.fnFormatearFechaVista(new Date());
                let sImporteRendido = this.getView().byId("idFragCrearGasto--idImporteTotal").getValue();
                let sMoneda = this.getView().byId("idFragCrearGasto--idWaers").getValue();
                let sImporteSolicitud = this.getView().byId("idFragCrearGasto--idImporteS").getValue();
                aData.ImporteTotal = sImporteRendido + " " + sMoneda; //Importe de solicitud
                aData.ImporteRendido = sImporteRendido + " " + sMoneda;
                aData.hasReembolsoDevolucion = false;
                let oIdCheckDevol = this.getView().byId("idFragCrearGasto--idCheckDevol"),
                    oIdCheckReembolso = this.getView().byId("idFragCrearGasto--idCheckReembolso");

                //LR 18/12/2019
                sImporteSolicitud = parseFloat(sImporteSolicitud).toFixed(2);
                sImporteRendido = parseFloat(sImporteRendido).toFixed(2);

                if (oIdCheckDevol.getSelected() === true) {
                    aData.hasReembolsoDevolucion = true;
                    aData.ImporteReembolsoDevolucion =
                        String(parseFloat(sImporteSolicitud - sImporteRendido).toFixed(2)) + " " + sMoneda;
                    aData.TextoReembolsoDevolucion = " y un importe de devolución de " + aData.ImporteReembolsoDevolucion;
                }
                if (oIdCheckReembolso.getSelected() === true) {
                    aData.hasReembolsoDevolucion = true;
                    aData.ImporteReembolsoDevolucion =
                        String(parseFloat(sImporteRendido - sImporteSolicitud).toFixed(2)) + " " + sMoneda;
                    aData.TextoReembolsoDevolucion = " y un importe de reembolso de " + aData.ImporteReembolsoDevolucion;
                }
                let anio, mes, dia;
                $.each(aTablaDetGasto, function (key, value) {
                    anio = value.Bldat.substr(0, 4);
                    mes = value.Bldat.substr(4, 2);
                    dia = value.Bldat.substr(6, 2);
                    value.Bldat = dia + "/" + mes + "/" + anio;
                });
                aData.DetalleSol = aTablaDetGasto;
                aData.CorporativeEmail = InfoIas.CorporativeEmail;
                aData.PersonalEmail = InfoIas.PersonalEmail;
                aData.Type = "G";
                aData.identificadorAplicacion = "Entregas a Rendir";

                $.ajax({
                    url: this._getAppModulePath() + "/bpmworkflowruntime/v1/workflow-instances",
                    method: "POST",
                    async: false,
                    contentType: "application/json",
                    headers: {
                        "X-CSRF-Token": token,
                    },
                    data: JSON.stringify({
                        definitionId: "aprobarentregarendir",
                        context: aData,
                    }),
                    success: function (result, xhr, data) {
                        if (result.status === "RUNNING") {
                            console.log("Solicitud Enviada");
                        } else {
                            console.log("No se envio la solicitud");
                        }
                    },
                });
            },
            onChangeDocDevolucion: function (oEvent) {
                let fileUploadImagenesDevolucion = sap.ui.getCore().getModel("fileUploadImagenesDevolucion");
                // let fileDevolucion = sap.ui.getCore().getModel("devolucion");
                if (oEvent.getParameter("files") !== undefined && oEvent.getParameter("files")[0] !== undefined) {
                    fileUploadImagenesDevolucion[0] = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
                    //	fileDevolucion.setData(fileUploadImagenesDevolucion[0]);
                } else {
                    fileUploadImagenesDevolucion.splice(0, 1);
                }
                sap.ui.getCore().setModel(fileUploadImagenesDevolucion, "fileUploadImagenesDevolucion");
                return fileUploadImagenesDevolucion;
            },
            //Obtiene el archivo desde el control sapui5 FileUploader
            onChangeDoc: function (oEvent) {
                let fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");
                if (oEvent.getParameter("files") != undefined && oEvent.getParameter("files")[0] != undefined) {
                    fileUploadImagenes[0] = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
                } else {
                    fileUploadImagenes.splice(0, 1);
                }
                sap.ui.getCore().setModel(fileUploadImagenes, "fileUploadImagenes");
                return fileUploadImagenes;
            },
            obtenerCantidadArchivos: function (sTipoDoc, sIdDoc) {
                //Get VariableGlobal
                let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                // let carpetaP = sap.ui.getCore().getModel("carpetaP");
                let route = sap.ui.getCore().getModel("route");
                route.subcarpeta02 = sTipoDoc;
                route.solicitud = sIdDoc;

                sap.ui.core.BusyIndicator.show(0);
                let cantarchivos = 0;
                let repoUrl =
                    "/cmis/" +
                    idrepositorio +
                    "/root/" +
                    this.parameters.AMBIENTE +
                    "/" +
                    route.subcarpeta01 +
                    "/" +
                    route.subcarpeta02 +
                    "/" +
                    route.solicitud +
                    "/";
                $.ajax(repoUrl + "?cmisselector=children", {
                    type: "GET",
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        cantarchivos = response.objects.length;
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (error) {
                        console.log(error);
                        if (error.responseJSON.exception === "objectNotFound") {
                            console.log("Error!! no se puede obtener cantidad de archivos");
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
                return cantarchivos;
            },
            oCrearSubCarpetas: function (url1, foldername) {
                let sDireccion;
                let data = {
                    "propertyId[0]": "cmis:objectTypeId",
                    "propertyValue[0]": "cmis:folder",
                    "propertyId[1]": "cmis:name",
                    "propertyValue[1]": foldername,
                    cmisaction: "createFolder",
                };
                let formData = new FormData();
                jQuery.each(data, function (key, value) {
                    formData.append(key, value);
                });
                $.ajax(url1, {
                    type: "POST",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        sDireccion = url1 + "/" + foldername;
                    }.bind(this),
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
                return sDireccion;
            },
            oListarCarpetas: function (url) {
                let obj = [];
                $.ajax(url + "?cmisselector=children", {
                    type: "GET",
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        $.each(response.objects, function (idx, item) {
                            obj.push({
                                folderName: item.object.properties["cmis:name"].value,
                            });
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        if (error.responseJSON.exception === "objectNotFound") {
                            console.log("Error!! no se puede obterner cantidad de archivos");
                        }
                    },
                });
                return obj;
            },
            //Subir archivo
            fnImport: function (dt) {
                let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                // let carpetaP = sap.ui.getCore().getModel("carpetaP");
                let fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenes");
                let route = sap.ui.getCore().getModel("route");
                let sDireccion = false;

                let sUrl =
                    "/cmis/" +
                    idrepositorio +
                    "/root/" +
                    this.parameters.AMBIENTE +
                    "/" +
                    route.carpetaSociedad +
                    "/" +
                    route.subcarpeta01 +
                    "/" +
                    route.subcarpeta02;
                let sUrlplus = dt.Belnr + dt.Bukrs + dt.Gjahr; //sNumeroDoc+sSociedad+sEjercicio
                console.log(sUrl);
                console.log(sUrlplus);
                let status;
                let sDataFolder = this.oListarCarpetas(sUrl);
                $.each(sDataFolder, (idex, item) => {
                    if (!status) {
                        if (sUrlplus === item.folderName) {
                            sDireccion = sUrl + "/" + sUrlplus;
                            status = true;
                        } else {
                            sDireccion = false;
                        }
                    }
                });
                if (sDireccion === false) {
                    sDireccion = this.oCrearSubCarpetas(sUrl, sUrlplus);
                }

                let count = this.oListarCarpetas(sDireccion);
                let namefile = "";
                namefile = "detalle_gasto_" + (count.length + 1);
                let data = {
                    "propertyId[0]": "cmis:objectTypeId",
                    "propertyValue[0]": "cmis:document",
                    "propertyId[1]": "cmis:name",
                    "propertyValue[1]": namefile,
                    cmisaction: "createDocument",
                };

                let formData = new FormData();
                formData.append("datafile", fileUploadImagenes[0]);
                jQuery.each(data, function (key, value) {
                    formData.append(key, value);
                });

                $.ajax(sDireccion, {
                    type: "POST",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        fileUploadImagenes = [];
                    }.bind(this),
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + error.responseJSON.message);
                    },
                });
            },
            fnImportDevolucion2: function (dt) {
                let idrepositorio = sap.ui.getCore().getModel("idrepositorio");
                // let carpetaP = sap.ui.getCore().getModel("carpetaP");
                let fileUploadImagenes = sap.ui.getCore().getModel("fileUploadImagenesDevolucion");
                let route = sap.ui.getCore().getModel("route");
                let sDireccion = false;
                let oCheckDev = this.getView().byId("idFragCrearGasto--idCheckDevol");
                let isDevolucion = oCheckDev.getSelected();

                if (!isDevolucion) {
                    return;
                }

                let sUrl = "/cmis/" + idrepositorio + "/root/" + this.parameters.AMBIENTE + "/";
                sUrl = sUrl + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + "Devolucion";
                let sUrlplus = dt.Belnr + dt.Bukrs + dt.Gjahr; //sNumeroDoc+sSociedad+sEjercicio
                console.log(sUrl);
                console.log(sUrlplus);
                let status;
                let sDataFolder = this.oListarCarpetas(sUrl);
                $.each(sDataFolder, function (idex, item) {
                    if (!status) {
                        if (sUrlplus === item.folderName) {
                            sDireccion = sUrl + "/" + sUrlplus;
                            status = true;
                        } else {
                            sDireccion = false;
                        }
                    }
                });
                if (sDireccion === false) {
                    sDireccion = this.oCrearSubCarpetas(sUrl, sUrlplus);
                }

                //let count = this.oListarCarpetas(sDireccion);
                let namefile = "";
                namefile = "detalle_devolucion";
                let data = {
                    "propertyId[0]": "cmis:objectTypeId",
                    "propertyValue[0]": "cmis:document",
                    "propertyId[1]": "cmis:name",
                    "propertyValue[1]": namefile,
                    cmisaction: "createDocument",
                };

                let formData = new FormData();
                formData.append("datafile", fileUploadImagenes[0]);
                jQuery.each(data, function (key, value) {
                    formData.append(key, value);
                });
                console.log(sDireccion);
                $.ajax(sDireccion, {
                    type: "POST",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    async: false,
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        fileUploadImagenes = [];
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + error.message);
                    },
                });
            },
            fnImportDevolucion: function (oEvent) {
                let route = sap.ui.getCore().getModel("route");
                let gasto = oEvent.Belnr + "" + oEvent.Bukrs + oEvent.Gjahr;
                this.gastDS2 = gasto;
                let aFiles = this.getView().getModel("DocumentsForPosition").getData();
                //	aFiles = JSON.parse(JSON.stringify(aFiles));
                let aFilesDev = this.getView().getModel("DocumentsDevolucion").getData();
                //aFilesDev = JSON.parse(JSON.stringify(aFilesDev));
                let pathSegments = [];
                let oDictionary = {
                    ambiente: undefined,
                    app: undefined,
                    ruc: undefined,
                    tipo: undefined,
                    nrosolicitud: undefined,
                    posicion: {},
                };
                let aFilesDS = [];
                for (let i = 0; i < aFiles.length; i++) {
                    aFiles[i].path =
                        this.parameters.AMBIENTE +
                        "/" +
                        route.carpetaSociedad +
                        "/" +
                        "ENTREGASRENDIR" +
                        "/" +
                        "GASTOS" +
                        "/" +
                        gasto +
                        "/" +
                        aFiles[i].Nrpos;
                    for (let j = 0; j < aFiles[i].Imagen.length; j++) {
                        let file = aFiles[i].Imagen[j];
                        let oFilesDS = {};
                        oFilesDS.name = file.FileName;
                        oFilesDS.path = aFiles[i].path;
                        oFilesDS.BlobFile = file.Data;
                        aFilesDS.push(oFilesDS);
                    }

                    pathSegments.push({
                        path: aFiles[i].path,
                        name: aFiles[i].Nrpos,
                        posicion: aFiles[i].Nrpos,
                        type: "posicion",
                    });

                    oDictionary.posicion[aFiles[i].Nposit] = undefined;
                }

                pathSegments.push({
                    path:
                        this.parameters.AMBIENTE +
                        "/" +
                        route.carpetaSociedad +
                        "/" +
                        "ENTREGASRENDIR" +
                        "/" +
                        "GASTOS" +
                        "/" +
                        gasto,
                    name: gasto,
                    posicion: undefined,
                    type: "nrosolicitud",
                });

                pathSegments.push({
                    path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "GASTOS",
                    name: "GASTOS",
                    posicion: undefined,
                    type: "tipo",
                });

                pathSegments.push({
                    path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR",
                    name: "ENTREGASRENDIR",
                    posicion: undefined,
                    type: "app",
                });

                pathSegments.push({
                    path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad,
                    name: route.carpetaSociedad,
                    posicion: undefined,
                    type: "ruc",
                });

                //oDictionary.RI = undefined;

                pathSegments.push({
                    path: this.parameters.AMBIENTE,
                    name: this.parameters.AMBIENTE,
                    posicion: undefined,
                    type: "ambiente",
                });
                DS.sendFiles(pathSegments, aFilesDS, oDictionary, this)
                    .then(function (sResolve) {
                        jQuery.sap.log.info(sResolve);
                        if (aFilesDev.length > 0) {
                            pathSegments = [];
                            oDictionary = {
                                ambiente: undefined,
                                app: undefined,
                                ruc: undefined,
                                tipo: undefined,
                                nrosolicitud: undefined,
                            };
                            for (let i = 0; i < aFilesDev.length; i++) {
                                aFilesDev[i].path =
                                    this.parameters.AMBIENTE +
                                    "/" +
                                    route.carpetaSociedad +
                                    "/" +
                                    "ENTREGASRENDIR" +
                                    "/" +
                                    "DEVOLUCION" +
                                    "/" +
                                    this.gastDS2;

                                aFilesDev[i].name = aFilesDev[i].FileName;
                                aFilesDev[i].BlobFile = aFilesDev[i].Data;
                            }

                            pathSegments.push({
                                path:
                                    this.parameters.AMBIENTE +
                                    "/" +
                                    route.carpetaSociedad +
                                    "/" +
                                    "ENTREGASRENDIR" +
                                    "/" +
                                    "DEVOLUCION" +
                                    "/" +
                                    this.gastDS2,
                                name: this.gastDS2,
                                posicion: undefined,
                                type: "nrosolicitud",
                            });

                            pathSegments.push({
                                path:
                                    this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR" + "/" + "DEVOLUCION",
                                name: "DEVOLUCION",
                                posicion: undefined,
                                type: "tipo",
                            });

                            pathSegments.push({
                                path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + "ENTREGASRENDIR",
                                name: "ENTREGASRENDIR",
                                posicion: undefined,
                                type: "app",
                            });

                            pathSegments.push({
                                path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad,
                                name: route.carpetaSociedad,
                                posicion: undefined,
                                type: "ruc",
                            });

                            //oDictionary.RI = undefined;

                            pathSegments.push({
                                path: this.parameters.AMBIENTE,
                                name: this.parameters.AMBIENTE,
                                posicion: undefined,
                                type: "ambiente",
                            });

                            DS.sendFiles(pathSegments, aFilesDev, oDictionary, this)
                                .then((sResolve2) => {
                                    jQuery.sap.log.info(sResolve2);
                                    this.getView().getModel("DocumentsDevolucion").setData([]);
                                })
                                .catch((sError2) => {
                                    jQuery.sap.log.error(sError2);
                                    sap.ui.core.BusyIndicator.hide();
                                });
                        }
                    })
                    .catch((sError) => {
                        jQuery.sap.log.error(sError);
                        sap.ui.core.BusyIndicator.hide();
                    });
            },
            onValidRuc: function (oEvent) {
                let oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel");
                let input = oEvent.getSource();
                let val = oEvent.getSource().getValue();
                if (val !== this.onValidNumber(input.getValue())) {
                    input.setValue(this.onValidNumber(input.getValue()));
                }
                if (val.length === 11) {
                    // let sPath
                    let sPath = oModelMaestroSolicitudes.createKey("zrucSet", {
                        IpRuc: val,
                    });
                    oModelMaestroSolicitudes.read("/" + sPath, {
                        success: (result) => {
                            console.log(result);
                            if (result.EpReturn) {
                                this.state.bRucProveedor = true;
                                this.getView().byId("idFragCrearGasto--idRazSoc").setValue(result.EpName);
                            } else {
                                let msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
                                input.setValue("");
                                this.state.bRucProveedor = false;
                                MessageBox.warning(msj);
                            }
                        },
                        error: (error) => {
                            let msj = "Proveedor no registrado, comuníquese con su Administrador.\nN° RUC ingresado: " + val;
                            input.setValue("");
                            this.state.bRucProveedor = false;
                            MessageBox.warning(msj);
                        },
                    });
                } else {
                    this.getView().byId("idFragCrearGasto--idRazSoc").setValue("");
                }
            },
            fnFormatearFechaFactura2: function (pValue) {
                let iDia = pValue.substring(0, 2);
                let iYear = pValue.substring(6, 10);
                let iMes = Number(pValue.substring(3, 5));
                if (iMes < 10) {
                    iMes = "0" + iMes;
                }
                return [iDia, iMes, iYear].join(".");
            },
            fnFormatearFechaFactura1: function (pValue) {
                let iDia = Number(pValue.getDate());
                if (iDia < 10) {
                    iDia = "0" + iDia;
                }
                let iYear = pValue.getFullYear();
                let iMes = pValue.getMonth() + 1;
                if (iMes < 10) {
                    iMes = "0" + iMes;
                }
                return [iDia, iMes, iYear].join(".");
            },
            onValidNumber: function (str) {
                return str.replace(/[^\d]/g, "");
            },
            onCorrelativoChange: function (oEvent) {
                let oInput = oEvent.getSource();
                let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
                //{@pguevarl - agregué
                let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey();
                //@}pguevarl
                if (!/[^a-zA-Z0-9]/.test(reference)) {
                    //oInput.setValue(reference.padStart(8, 0)); //@pguevarl - comentado
                    //{@pguevarl - agregué
                    if (oInput.getValue().length == 0) {
                        oInput.setValueState("Error");
                        return MessageToast.show("El correlativo debe tener al menos 1 caracter");
                    } else {
                        oInput.setValueState("None");
                    }
                    if (
                        idTipoDocS == "05" ||
                        idTipoDocS == "12" ||
                        idTipoDocS == "00" ||
                        idTipoDocS == "11" ||
                        idTipoDocS == "13"
                    ) {
                        if (oInput.getValue().length == 0) {
                            oInput.setValueState("Error");
                            return MessageToast.show("El correlativo debe tener al menos 1 caracter");
                        } else {
                            oInput.setValueState("None");
                        }
                    } else {
                        oInput.setValue(reference.padStart(8, 0));
                    }
                    //@}pguevarl
                } else {
                    return MessageToast.show("No se permiten caracteres especiales");
                }

                return null;
            },
            //<!--se agrego un metodo para validar la cantidad de numero sea 8-->
            onCorrelativoLiveChange: function (oEvent) {
                let value = oEvent.getSource().getValue();
                let bNotnumber = isNaN(value);
                if (bNotnumber === true) {
                    oEvent.getSource().setValue(value.substring(0, value.length - 1));
                }
            },
            //<!--se agrego un metodo para validar la cantidad de numero sea 8-->
            onlyNumber: function (oEvent) {
                let _oInput = oEvent.getSource();
                let val = _oInput.getValue();
                val = val.replace(/[^\d]/g, "");
                _oInput.setValue(val);
            },
            getI18nText: function (val, params) {
                if (params && params.length > 0) {
                    return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val, params);
                } else {
                    return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(val);
                }
            },
            onOpenDialogAttach: function () {
                //if (this._dialogAttach) {
                //this.getView().getModel("Documents").setData([]);
                this._dialogAttach = sap.ui.xmlfragment("everis.apps.entregasRendir.view.fragment.Attach", this);
                this.getView().addDependent(this._dialogAttach);
                //}
                // if  ( $.estadoFiles === 2 ) {
                // 	this.getView().getModel("Documents").setData([]);
                // }

                this._dialogAttach.open();
            },
            onOpenDialogAttachDevolucion: function () {
                if (!this._dialogAttachDevolucion) {
                    this._dialogAttachDevolucion = sap.ui.xmlfragment(
                        "everis.apps.entregasRendir.view.fragment.AttachDevolucion",
                        this
                    );
                    this.getView().addDependent(this._dialogAttachDevolucion);
                }
                this._dialogAttachDevolucion.open();
            },
            onCloseDialogAttach: function () {
                this._dialogAttach.close();
                this._dialogAttach.destroy();
            },
            onCloseDialogAttachDevolucion: function () {
                this._dialogAttachDevolucion.close();
            },
            uploadComplete: function (oEvent) {
                sap.ui.core.BusyIndicator.hide();
            },
            onFileDeleted: function (oEvent) {
                let dataView = this.getView().getModel("Documents").getData();
                // 	idx;
                // let files = dataView;
                sap.ui.core.BusyIndicator.show();
                //let objectFile = oEvent.getSource().getBindingContext("Documents").getObject();
                let objectFile = oEvent.getSource().getBindingContext("Documents").getPath();
                let sPath = objectFile.split("/")[1];
                dataView.splice(sPath, 1);
                this.getView().getModel("Documents").updateBindings();
                sap.ui.core.BusyIndicator.hide();
            },
            onFileDeletedDevolucion: function (oEvent) {
                let dataView = this.getView().getModel("DocumentsDevolucion").getData();
                // 	idx;
                // let files = dataView;
                sap.ui.core.BusyIndicator.show();
                //let objectFile = oEvent.getSource().getBindingContext("Documents").getObject();
                let objectFile = oEvent.getSource().getBindingContext("DocumentsDevolucion").getPath();
                let sPath = objectFile.split("/")[1];
                dataView.splice(sPath, 1);
                this.getView().getModel("DocumentsDevolucion").updateBindings();
                sap.ui.core.BusyIndicator.hide();
            },
            onSerieChange: function (oEvent) {
                let oInput = oEvent.getSource();
                let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
                //{@pguevarl - agregué
                let idTipoDocS = this.getView().byId("idFragCrearGasto--idTipoDocS").getSelectedKey();
                //@}pguevarl
                if (!/[^a-zA-Z0-9]/.test(reference)) {
                    //oInput.setValue(reference.padStart(4, 0)); //@pguevarl - comentado
                    //{@pguevarl - agregué
                    if (idTipoDocS == "05") {
                        if (oInput.getValue().length <= 3) {
                            oInput.setValue(reference.padStart(3, 0));
                        } else if (oInput.getValue().length == 4) {
                            oInput.setValue(reference.padStart(4, 0));
                        }
                    } else if (idTipoDocS !== "12" && idTipoDocS !== "00" && idTipoDocS !== "11" && idTipoDocS !== "13") {
                        oInput.setValue(reference.padStart(4, 0));
                    }
                    //@}pguevarl
                } else {
                    return MessageToast.show("No se permiten caracteres especiales");
                }

                return null;
            },
            onSerieLiveChange: function (oEvent) {
                let oInput = oEvent.getSource();
                let reference = oInput.getValue().toUpperCase().replace(/\s/g, "");
                if (/[^a-zA-Z0-9]/.test(reference)) {
                    let index = reference.length - 1;
                    oInput.setValue(reference.slice(0, index));
                }
            },
            setupValidation: function () {
                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });

                let validator = new Validator();
                validator.validate();
            },
            /*--------Tipo Objeto de Costo MatchCode----------*/
            handleValueHelp_ti: function (oEvent) {
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentTipoObjetoCostoHelp, this);
                    this._oModelHeaders = {};
                    sap.ui.core.BusyIndicator.show();
                    this.getOwnerComponent()
                        .getModel("oUtilitiesModel")
                        .read("/ztipoobjcostoreservaSet", {
                            headers: this._oModelHeaders,
                            success: (res) => {
                                if (res.results.length > 0) {
                                    let temp = [];
                                    res.results.map((x) => {
                                        if (x.Rstyp !== "U") {
                                            temp.push(x);
                                        }
                                    });
                                    this.oVariablesJSONModel.setProperty("/tiposObjetosCosto/", temp);
                                } else {
                                    this.oVariablesJSONModel.setProperty("/tiposObjetosCosto/", "");
                                }
                                sap.ui.core.BusyIndicator.hide();
                            },
                            error: (err) => {
                                sap.ui.core.BusyIndicator.hide();
                                let msj = this.getI18nText("appErrorMsg");
                                this.showMessageBox(msj, "warning");
                            },
                        });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                //create a filter for the binding
                let sInputValue = this.getView().byId(this.inputId).getValue();
                let oFilter = null;
                oFilter = this.filterTipoObjetoCosto_(sInputValue);
                this._valueHelpDialog.getBinding("items").filter([oFilter]);
                // open value help dialog filtered by the input value
                this._valueHelpDialog.open(sInputValue);
                //this._valueHelpDialog.open();
            },
            _handleValueHelpSearch_ti: function (evt) {
                let sInputValue = evt.getParameter("value");
                let oFilter = null;
                oFilter = this.filterTipoObjetoCosto_(sInputValue);
                evt.getSource().getBinding("items").filter([oFilter]);
            },
            filterTipoObjetoCosto_: function (sInputValue) {
                let sTemp = sInputValue.split(" - ");
                let oFilter = null;
                if (sTemp.length > 1) {
                    let sMesscode = sTemp[0];
                    let sName = sTemp[1];
                    //sInputValue = sName + " - " + sMesscode;
                    oFilter = new Filter(
                        [
                            new Filter("Rsttx", FilterOperator.Contains, sName),
                            new Filter("Rstyp", FilterOperator.Contains, sMesscode),
                        ],
                        false
                    );
                } else {
                    oFilter = new Filter(
                        [
                            new Filter("Rsttx", FilterOperator.Contains, sInputValue),
                            new Filter("Rstyp", FilterOperator.Contains, sInputValue),
                        ],
                        false
                    );
                }
                return oFilter;
            },
            /*--------Centro de coste - Objeto de Costo MatchCode - ----------*/
            handleValueHelp_obj: function (oEvent) {
                let tipObjCosto = this.oVariablesJSONModel.getProperty("/Rstyp/code");
                if (tipObjCosto === "K") {
                    this.handleValueHelp_cc(oEvent);
                }
                if (tipObjCosto === "F") {
                    this.handleValueHelp_or(oEvent);
                }
            },
            loadCentroCostoList: function () {
                let sSociedad = sap.ui.getCore().getModel("InfoIas").Bukrs;
                let sCentroCosto = sap.ui.getCore().getModel("InfoIas").Kostl;
                this._oModelHeaders = {
                    bukrs: sSociedad,
                };
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read("/zobjcostoSet", {
                        headers: this._oModelHeaders,
                        success: (res) => {
                            if (res.results.length > 0) {
                                let element = [];
                                element = res.results.filter((ele) => {
                                    return ele.Kostl === sCentroCosto;
                                });
                                if (element.length === 1) {
                                    console.log(element);
                                    //	this.getView().byId("idFragCrearGasto--idCeco").setValue(element[0].Kostl + " - " + element[0].Ktext);
                                    this.getView()
                                        .getModel()
                                        .setProperty("/KostlKtext", element[0].Kostl + " - " + element[0].Ktext);
                                    this.oVariablesJSONModel.setProperty("/Kostl/code", element[0].Kostl);
                                    this.oVariablesJSONModel.setProperty("/Kostl/name", element[0].Ktext);
                                }
                                this.oVariablesJSONModel.setProperty("/objetosCosto/", res.results);
                            } else {
                                this.oVariablesJSONModel.setProperty("/objetosCosto/", "");
                            }
                        },
                        error: (err) => {
                            let msj = this.getI18nText("appErrorMsg");
                            this.showMessageBox(msj, "warning");
                        },
                    });
            },
            handleValueHelp_cc: function (oEvent) {
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentObjetoCostoHelp, this);
                    let v_soc = this.oVariablesJSONModel.getProperty("/Bukrs/code");
                    // let v_centro = this.oVariablesJSONModel.getProperty("/Werks/code");
                    let v_tipObjCosto = this.oVariablesJSONModel.getProperty("/Rstyp/code");
                    this._oModelHeaders = {
                        bukrs: v_soc,
                        // "werks": v_centro,
                        Rstyp: v_tipObjCosto,
                    };

                    sap.ui.core.BusyIndicator.show();

                    this.getOwnerComponent()
                        .getModel("oUtilitiesModel")
                        .read("/zobjcostoSet", {
                            headers: this._oModelHeaders,
                            success: (res) => {
                                if (res.results.length > 0) {
                                    this.oVariablesJSONModel.setProperty("/objetosCosto/", res.results);
                                } else {
                                    this.oVariablesJSONModel.setProperty("/objetosCosto/", "");
                                }
                                sap.ui.core.BusyIndicator.hide();
                            },
                            error: (err) => {
                                sap.ui.core.BusyIndicator.hide();
                                let msj = this.getI18nText("appErrorMsg");
                                this.showMessageBox(msj, "warning");
                            },
                        });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                //create a filter for the binding
                let sInputValue = this.byId(this.inputId).getValue();
                let oFilter = null;
                oFilter = this.filterObjetoCosto_(sInputValue);
                this._valueHelpDialog.getBinding("items").filter([oFilter]);
                // open value help dialog filtered by the input value
                this._valueHelpDialog.open(sInputValue);
            },
            _handleValueHelpSearch_cc: function (evt) {
                let sInputValue = evt.getParameter("value");
                let oFilter = null;
                oFilter = this.filterObjetoCosto_(sInputValue);
                evt.getSource().getBinding("items").filter([oFilter]);
            },
            filterObjetoCosto_: function (sInputValue) {
                let sTemp = sInputValue.split(" - ");
                let oFilter = null;
                if (sTemp.length > 1) {
                    let sMesscode = sTemp[0];
                    let sName = sTemp[1];
                    //sInputValue = sName + " - " + sMesscode;
                    oFilter = new Filter(
                        [
                            new Filter("Kostl", FilterOperator.Contains, sMesscode),
                            new Filter("Ktext", FilterOperator.Contains, sName),
                        ],
                        false
                    );
                } else {
                    oFilter = new Filter(
                        [
                            new Filter("Kostl", FilterOperator.Contains, sInputValue),
                            new Filter("Ktext", FilterOperator.Contains, sInputValue),
                        ],
                        false
                    );
                }
                return oFilter;
            },
            /*--------Orden - Objeto de Costo MatchCode - ----------*/
            handleValueHelp_or: function (oEvent) {
                this.inputId = oEvent.getSource().getId();
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentOrdenHelp, this);
                    let v_soc = this.oVariablesJSONModel.getProperty("/Bukrs/code");
                    // let v_centro = this.oVariablesJSONModel.getProperty("/Werks/code");
                    let v_centro = "1400"; //necesario para no mostrar control vacío
                    // let v_almacen = this.oVariablesJSONModel.getProperty("/Lgort/code");
                    // let v_tipObjCosto = this.oVariablesJSONModel.getProperty("/Rstyp/code");
                    this._oModelHeaders = {
                        bukrs: v_soc,
                        werks: v_centro,
                    };

                    BusyIndicator.show();

                    this.getOwnerComponent()
                        .getModel("oUtilitiesModel")
                        .read("/zordenSet", {
                            headers: this._oModelHeaders,
                            success: (res) => {
                                if (res.results.length > 0) {
                                    this.oVariablesJSONModel.setProperty("/ordenes/", res.results);
                                } else {
                                    this.oVariablesJSONModel.setProperty("/ordenes/", "");
                                }
                                BusyIndicator.hide();
                            },
                            error: (err) => {
                                BusyIndicator.hide();
                                let msj = this.getI18nText("appErrorMsg");
                                this.showMessageBox(msj, "warning");
                            },
                        });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                //create a filter for the binding
                let sInputValue = this.getView().byId(this.inputId).getValue();
                let oFilter = null;
                oFilter = this.filterOrden_(sInputValue);
                this._valueHelpDialog.getBinding("items").filter([oFilter]);
                // open value help dialog filtered by the input value
                this._valueHelpDialog.open(sInputValue);
                //this._valueHelpDialog.open();
            },
            _handleValueHelpSearch_or: function (evt) {
                let sInputValue = evt.getParameter("value");
                let oFilter = null;
                oFilter = this.filterOrden_(sInputValue);
                evt.getSource().getBinding("items").filter([oFilter]);
            },
            filterOrden_: function (sInputValue) {
                let sTemp = sInputValue.split(" - ");
                let oFilter = null;
                if (sTemp.length > 1) {
                    let sMesscode = sTemp[0];
                    let sName = sTemp[1];
                    //sInputValue = sName + " - " + sMesscode;
                    oFilter = new Filter(
                        [
                            new Filter("Ktext", FilterOperator.Contains, sName),
                            new Filter("Aufnr", FilterOperator.Contains, sMesscode),
                        ],
                        false
                    );
                } else {
                    oFilter = new Filter(
                        [
                            new Filter("Ktext", FilterOperator.Contains, sInputValue),
                            new Filter("Aufnr", FilterOperator.Contains, sInputValue),
                        ],
                        false
                    );
                }
                return oFilter;
            },
            onCloseDialogTipoObjCosto: function (evt) {
                let oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    let oInput = sap.ui.getCore().byId(this.inputId);
                    let code_ = oSelectedItem.getInfo();
                    let name_ = oSelectedItem.getTitle();
                    let desc_ = code_ + " - " + name_;
                    oInput.setValue(desc_);
                    // let dialogName = evt.getSource().getProperty("title");
                    this.oGeneral.setProperty("/enableObjetoCosto", true);
                    this.oVariablesJSONModel.setProperty("/Rstyp/code", code_);
                    this.oVariablesJSONModel.setProperty("/Rstyp/name", name_);
                    //	this.setEnableClearForm(this.inputId);
                    //	this.afterSelectItem(dialogName, code_, name_, desc_);
                }
                this._valueHelpDialog = null;
                evt.getSource().getBinding("items").filter([]);
            },
            onCloseDialogCentroCosto: function (evt) {
                let oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    let oInput = sap.ui.getCore().byId(this.inputId);
                    let code_ = oSelectedItem.getInfo();
                    let name_ = oSelectedItem.getTitle();
                    let desc_ = code_ + " - " + name_;
                    oInput.setValue(desc_);
                    // let dialogName = evt.getSource().getProperty("title");
                    this.oGeneral.setProperty("/enableObjetoCosto", true);
                    this.oVariablesJSONModel.setProperty("/Kostl/code", code_);
                    this.oVariablesJSONModel.setProperty("/Kostl/name", name_);
                }
                this._valueHelpDialog = null;
                evt.getSource().getBinding("items").filter([]);
            },
            onChangeInput: function (evt) {
                // let id = evt.getParameter("id");
                this.oGeneral.setProperty("/enableObjetoCosto", true);
            },
            onFormatDecimal: function (oEvent) {
                let oInput = oEvent.getSource();
                let aTemp = oInput.split(".");
                if (aTemp.length > 1) {
                    oInput.setValue(aTemp[1].padEnd(2, "0"));
                }
            },
            //{@pguevarl - agregué la función codificarEntidad para el punto 3
            codificarEntidad: function (str2, bSolicitud) {
                let array = [];
                let longitud = str2.length;
                for (let i = str2.length - 1; i >= 0; i--) {
                    array.unshift(["", str2[i].charCodeAt(), ";"].join(""));
                }
                let texto = array.join("");
                while (longitud > 0) {
                    //pguevarl
                    //vocales X
                    //ñ
                    texto = texto.replace("241;", "110;");
                    //Ñ
                    texto = texto.replace("209;", "78;");
                    //a
                    texto = texto.replace("228;", "97;");
                    texto = texto.replace("226;", "97;");
                    texto = texto.replace("224;", "97;");
                    texto = texto.replace("229;", "97;");
                    //A
                    texto = texto.replace("196;", "65;");
                    texto = texto.replace("197;", "65;");
                    texto = texto.replace("192;", "65;");
                    texto = texto.replace("195;", "65;");
                    //e
                    texto = texto.replace("234;", "101;");
                    texto = texto.replace("235;", "101;");
                    texto = texto.replace("232;", "101;");
                    //E
                    texto = texto.replace("202;", "69;");
                    texto = texto.replace("200;", "69;");
                    //i
                    texto = texto.replace("239;", "105;");
                    texto = texto.replace("236;", "105;");
                    //I
                    texto = texto.replace("206;", "73;"); // Í,I
                    texto = texto.replace("207;", "73;"); // Í,I
                    //o
                    texto = texto.replace("242;", "111;"); // ó,o
                    texto = texto.replace("244;", "111;"); // ó,o
                    //O
                    texto = texto.replace("210;", "79;"); // Ó,O
                    texto = texto.replace("213;", "79;"); // Ó,O
                    //u
                    texto = texto.replace("249;", "117;"); // ú,u
                    texto = texto.replace("251;", "117;"); // ú,u
                    texto = texto.replace("252;", "117;"); // ú,u
                    //U
                    texto = texto.replace("217;", "85;"); // Ú,U
                    texto = texto.replace("219;", "85;"); // Ú,U
                    texto = texto.replace("220;", "85;"); // Ú,U

                    //vocales minusculas
                    texto = texto.replace("225;", "97;"); // á,a
                    texto = texto.replace("233;", "101;"); // é,e
                    texto = texto.replace("237;", "105;"); // í,i
                    texto = texto.replace("243;", "111;"); // ó,o
                    texto = texto.replace("250;", "117;"); // ú,u
                    //vocales MAYUSCULAS
                    texto = texto.replace("193;", "65;"); // Á,A
                    texto = texto.replace("201;", "69;"); // É,E
                    texto = texto.replace("205;", "73;"); // Í,I
                    texto = texto.replace("211;", "79;"); // Ó,O
                    texto = texto.replace("218;", "85;"); // Ú,U
                    //numeros
                    if (!bSolicitud) {
                        texto = texto.replace("48;", ""); // 0
                    }

                    longitud--;
                }

                return texto;
            },
            //}@pguevarl
            //{@pguevarl - agregué la función decodificarEntidad para el punto 3
            decodificarEntidad: function (str1) {
                let texto = str1.replace(/(\d+);/g, function (match, dec) {
                    if (dec >= 48 && dec <= 57) {
                        //numeros
                        return String.fromCharCode(dec);
                    } else if (dec >= 97 && dec <= 122) {
                        //minusculas
                        return String.fromCharCode(dec);
                    } else if (dec >= 65 && dec <= 90) {
                        //mayúsculas
                        return String.fromCharCode(dec);
                    } else if (
                        //simbolos
                        dec == 45 || // -
                        dec == 95 || // _
                        dec == 46 || // .
                        dec == 32 || // espacio
                        dec == 39 // '
                    ) {
                        return String.fromCharCode(dec);
                    } else {
                        return "";
                    }
                });
                return texto;
            },
            //}@pguevarl
            //{@pguevarl - agregué la función llamada para el punto 3
            llamada: function (text, bSolicitud = false) {
                //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
                let fin = this.codificarEntidad(text, bSolicitud);
                fin = this.decodificarEntidad(fin);
                return fin;
            },
            //}@pguevarl
            fnSubirObservacionDS: function (oEntrada) {
                var that = this;
                return new Promise((resolve, reject) => {
                    var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
                    var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
                    var sSolicitud = oEntrada.Belnr + oEntrada.Bukrs + oEntrada.Gjahr;
                    // route.carpetaSociedad = RucSociedad.Paval;
                    const aFiles = that.getView().getModel("DocumentsSolicitud").getData();
                    if (aFiles.length === 0) {
                        resolve();
                    }
                    const sPath = `${oParametersModel.AMBIENTE}/${oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
                        return oSociedad.valueLow === oEntrada.Bukrs
                    }).valueHigh}/${oVariablesGlobales.carpetaEntregasRendir}/${oVariablesGlobales.carpetaSolicitud}/${sSolicitud}`;

                    BusyIndicator.show(0);

                    // Create folder
                    Sharepoint
                        .createFolderDeep(sPath)
                        .then(() => {
                            const aFilesToUpload = aFiles.map((x) => {
                                return {
                                    folderName: "",
                                    fileName: x.FileName,
                                    data: x.Data,
                                    size: x.Data.size,
                                };
                            });

                            // Upload files
                            return Sharepoint.saveFiles(sPath, aFilesToUpload);
                        })
                        .then((sResolve) => {
                            MessageToast.show(that.getI18nText("msgSharepointSuccess"));
                            that.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve);
                            BusyIndicator.hide();
                            resolve();
                        })
                        .catch((error) => {
                            Log.error("[CC] MasterDetalleFF.controller - fnSubirObservacionDS", error);
                            MessageBox.error("No se pudieron subir los archivos. Error: " + error.message);
                            reject();
                        });
                });
            },

            blobToBase64String: function (blobFile) {
              return new Promise(function (resolve) {
                var reader = new FileReader();
                reader.onload = function (readerEvt) {
                  var base64String = readerEvt.target.result;
                  resolve(base64String);
                };
                reader.readAsDataURL(blobFile);
              });
            },
      
            uploadArchiveLink: function (oDocument) {
                var that = this;
                return new Promise((resolve, reject) => {
                    var oModelEntregaRendir = that.getOwnerComponent().getModel("oEntregaModel");
                    var aFiles = that.getView().getModel("DocumentsSolicitud").getData();
                    if (aFiles.length === 0) {
                        resolve(); 
                    }
                    var aFilesTobeConverted = [];
                    aFiles.forEach((oFile) => {
                        aFilesTobeConverted.push(that.blobToBase64String(oFile.Data));
                    });
                    BusyIndicator.show(0);
                    Promise.all(aFilesTobeConverted).then((aBase64String) => {
                        var oArchiveLinkPayload = {
                            Bukrs: oDocument.Bukrs,
                            Belnr: oDocument.Belnr,
                            Gjahr: oDocument.Gjahr,
                            Modulo: "FI",
                            ArchiveDocSet: []
                        };
                        aBase64String.forEach((sBase64String, index) => {
                            var sFileName = aFiles[index].FileName;
                            oArchiveLinkPayload.ArchiveDocSet.push({
                                Bukrs: oDocument.Bukrs,
                                Belnr: oDocument.Belnr,
                                Gjahr: oDocument.Gjahr,
                                Bas64: sBase64String.split(",")[1],
                                Exten: sFileName.substring(sFileName.lastIndexOf(".") + 1).toUpperCase(),
                                Nombre: sFileName,
                                Return: ""
                            });
                        });
                        oModelEntregaRendir.create("/ArchiveHeaderSet", oArchiveLinkPayload, {
                            success: function (oResponse) {
                                console.log(oResponse);
                                MessageToast.show(that.getI18nText("msgArchiveLinkSuccess"));
                                that.getView().getModel("DocumentsSolicitud").setData([]);
                                BusyIndicator.hide();
                                resolve();
                            },
                            error: function (oError) {
                                console.error("[ArchiveLink - Carga SAP]", oError);
                                MessageBox.error(that.getI18nText("msgArchiveLinkError"));
                                reject();
                            }
                        });
                    }).catch((oError) => {
                        console.error("[ArchiveLink - Conversión Blob]", oError);
                        MessageBox.error(that.getI18nText("msgArchiveLinkError"));
                        reject();
                    });
                });
            },

            fnSubirObservacionDS_0: function (aEntrada) {
                // sNroSolicitud = "6000000044100777"; //test
                let route = sap.ui.getCore().getModel("route");
                // route.solicitud = sNroSolicitud;
                route.solicitud = aEntrada.Belnr + aEntrada.Bukrs + aEntrada.Gjahr;
                let aFiles = this.getView().getModel("DocumentsSolicitud").getData();
                if (aFiles.length) {
                    // let pathSegments = [];
                    // let oDictionary = {
                    // 	ambiente: undefined,
                    // 	app: undefined,
                    // 	ruc: undefined,
                    // 	tipo: undefined,
                    // 	nrosolicitud: undefined,
                    // 	posicion: {}
                    // };
                    // let aFilesDS = [];
                    // for (let i = 0; i < aFiles.length; i++) {
                    // 	aFiles[i].path = this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02 + "/" + route.solicitud;
                    // 	let oFilesDS = {};
                    // 	oFilesDS.name = aFiles[i].FileName;
                    // 	oFilesDS.path = aFiles[i].path;
                    // 	oFilesDS.BlobFile = aFiles[i].Data;
                    // 	aFilesDS.push(oFilesDS);
                    // }

                    // pathSegments.push({
                    // 	path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02 + "/" + route.solicitud,
                    // 	name: route.solicitud,
                    // 	posicion: undefined,
                    // 	type: "nrosolicitud"
                    // });

                    // pathSegments.push({
                    // 	path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01 + "/" + route.subcarpeta02,
                    // 	name: route.subcarpeta02,
                    // 	posicion: undefined,
                    // 	type: "tipo"
                    // });

                    // pathSegments.push({
                    // 	path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad + "/" + route.subcarpeta01,
                    // 	name: route.subcarpeta01,
                    // 	posicion: undefined,
                    // 	type: "app"
                    // });

                    // pathSegments.push({
                    // 	path: this.parameters.AMBIENTE + "/" + route.carpetaSociedad,
                    // 	name: route.carpetaSociedad,
                    // 	posicion: undefined,
                    // 	type: "ruc"
                    // });

                    // pathSegments.push({
                    // 	path: this.parameters.AMBIENTE,
                    // 	name: this.parameters.AMBIENTE,
                    // 	posicion: undefined,
                    // 	type: "ambiente"
                    // });

                    // DS.sendFiles(pathSegments, aFilesDS, oDictionary, this).then(function (sResolve) {
                    // 	jQuery.sap.log.info(sResolve);
                    // 	this.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve);
                    // 	this.getView().getModel("DocumentsSolicitud").setData([]);
                    // 	sap.m.MessageBox.success("El archivo fue cargado correctamente.");
                    // 	this.fnWorkFlow(aEntrada, "S");
                    // }).catch(function (sError) {
                    // 	jQuery.sap.log.error(sError);
                    // 	sap.ui.core.BusyIndicator.hide();
                    // 	sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + sError.message);
                    // });
                    /////JORDAN////////////////
                    let sRoute =
                        this.parameters.AMBIENTE +
                        "/" +
                        route.carpetaSociedad +
                        "/" +
                        route.subcarpeta01 +
                        "/" +
                        route.subcarpeta02;

                    DS.getCreateFolder(sRoute, route.solicitud).then((oResult) => {
                        ///Crea el folder y luega hace varias promesas asincronas para guardar los archivos
                        //Agrego path a cada elemento
                        for (let i = 0; i < aFiles.length; i++) {
                            aFiles[i].path = sRoute + "/" + route.solicitud;
                        }
                        //Promesa asincrona para agregar todos los archivos en la carpeta de solicitud
                        Promise.all(
                            aFiles.map((file) => {
                                DS.addFile(file.path, file).then((oResult2) => {
                                    console.log("Se agrego archivo");
                                });
                            })
                        )
                            .then((sResolve) => {
                                jQuery.sap.log.info(sResolve);
                                this.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", sResolve);
                                this.getView().getModel("DocumentsSolicitud").setData([]);
                                sap.m.MessageBox.success("El archivo fue cargado correctamente.");
                                this.fnWorkFlow(aEntrada, "S");

                                sap.ui.core.BusyIndicator.hide();
                            })
                            .catch((sError) => {
                                jQuery.sap.log.error(sError);
                                sap.ui.core.BusyIndicator.hide();
                                sap.m.MessageBox.error("No se pudo subir el archivo. Error: " + sError.message);
                            });
                    });

                    ////////////////////////////
                } else {
                    ///JORDAN Si no hay adjuntos solo creara el folder////
                    let sRoute =
                        this.parameters.AMBIENTE +
                        "/" +
                        route.carpetaSociedad +
                        "/" +
                        route.subcarpeta01 +
                        "/" +
                        route.subcarpeta02;

                    DS.getCreateFolder(sRoute, route.solicitud).then((oResult) => {
                        jQuery.sap.log.info(oResult);
                        this.oVariablesJSONModel.setProperty("/idFolderSolicitudGenerada", oResult);
                        this.getView().getModel("DocumentsSolicitud").setData([]);
                        this.fnWorkFlow(aEntrada, "S");
                        sap.ui.core.BusyIndicator.hide();
                    });
                }
                ////////////////////////////////////////////////////7
            },

            onChangeSolicitud: function (oEvent) {
                let oModelDocSolicitud = this.getView().getModel("DocumentsSolicitud");
                sap.ui.core.BusyIndicator.show();
                let file = oEvent.getParameter("files")[0];
                let jsondataAdjunto;
                this.base64coonversionMethod(file).then((result) => {
                    jsondataAdjunto = {
                        LoioId: jQuery.now().toString(),
                        flagLogioId: true,
                        //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
                        Descript: this.llamada(file.name, true).replace("." + this.getFileExtension(file.name), ""),
                        DocType: this.getFileExtension(file.name),
                        mimeType: file.type,
                        //se añade segundo parámetro para evitar que se supriman los "0" del nombre del adjunto para solicitudes
                        FileName: this.llamada(file.name, true),
                        Data: result,
                    };
                    oModelDocSolicitud.getData().unshift(jsondataAdjunto);
                    oModelDocSolicitud.refresh();
                    oModelDocSolicitud.updateBindings(true);
                });
            },

            onFileDeletedSolicitud: function (oEvent) {
                let dataView = this.getView().getModel("DocumentsSolicitud").getData();
                // let files = dataView;
                sap.ui.core.BusyIndicator.show();
                let objectFile = oEvent.getSource().getBindingContext("DocumentsSolicitud").getPath();
                let sPath = objectFile.split("/")[1];
                dataView.splice(sPath, 1);
                this.getView().getModel("DocumentsSolicitud").updateBindings();
                sap.ui.core.BusyIndicator.hide();
            },

            onOpenDialogAttachSolicitud: function () {
                if (!this._dialogAttachSolicitud) {
                    this._dialogAttachSolicitud = sap.ui.xmlfragment(
                        "everis.apps.entregasRendir.view.fragment.AttachSolicitud",
                        this
                    );
                    this.getView().addDependent(this._dialogAttachSolicitud);
                }
                this._dialogAttachSolicitud.open();
            },

            onCloseDialogAttachSolicitud: function () {
                this._dialogAttachSolicitud.close();
            },

            getThisUserInformation: function () {
                /*let userModel = new JSONModel();
                    userModel.loadData("/services/userapi/attributes?multiValuesAsArrays=true", null, false);
                    this.getView().setModel(userModel.getData(), "userapi");
                    return userModel.getData().name;*/
                /*let sUrl = sDestino;
                    let oModel = new JSONModel();
                    oModel.loadData(sUrl, null, true, "GET", false, true);*/
                /*oModel.attachRequestCompleted((oRequest) => {
                    if (oRequest.getParameter("success")) {
                        let oData = oModel.getData();
                        resolve(oData);
                    } else {
                        reject("Ocurrio un error al recuperar los datos del usuario");
                    }
                    });*/
                /*return oModel.getData().name;*/
            },

            getSAPEmailSolicitante: function (oUserApi) {
                //let sUser = this.getThisUserInformation();

                //let sUser = "Q08275964"; //test*
                let sUser = oUserApi.name;
                //let sUser = "9999"; //test*
                this.oVariablesJSONModel.setProperty("/UsuarioSolicitante", sUser);
                let query = "/zemailSet(UserId='" + sUser + "')";
                let isExistEmail = false;
                this.getOwnerComponent()
                    .getModel("oUtilitiesModel")
                    .read(query, {
                        success: (res) => {
                            if (res.EmailCorp !== undefined && res.EmailCorp !== "") {
                                this.oVariablesJSONModel.setProperty("/EmailCorporativoSolicitante", res.EmailCorp);
                                isExistEmail = true;
                            }
                            if (res.EmailPers !== undefined && res.EmailPers !== "") {
                                this.oVariablesJSONModel.setProperty("/EmailPersonalSolicitante", res.EmailPers);
                                isExistEmail = true;
                            }
                            if (!isExistEmail) {
                                let msj =
                                    "Su usuario no tiene registrado un correo electrónico Corporativo en SAP ERP. Usuario " + sUser + ".";
                                this.showMessageBox(msj, "warning");
                            }
                            if (res.Butxt !== undefined && res.Butxt !== "") {
                                this.oVariablesJSONModel.setProperty("/SociedadSolicitante", res.Bukrs);
                                this.oVariablesJSONModel.setProperty("/Bukrs/value", res.Bukrs + " - " + res.Butxt);
                            }
                            if (res.Bukrs !== undefined && res.Bukrs !== "") {
                                this.oVariablesJSONModel.setProperty("/SociedadSolicitante", res.Bukrs);
                                this.oVariablesJSONModel.setProperty("/Bukrs/code", res.Bukrs);
                            } else {
                                let msg = "Usted no tiene sociedad asignada en SAP ERP. Usuario " + sUser + ".";
                                this.showMessageBoxAndBack(msg, "error");
                            }
                        },
                        error: (err) => {
                            sap.ui.core.BusyIndicator.hide();
                            let msg = "Su usuario no se encuentra registrado en SAP ERP. Usuario " + sUser + ".";
                            this.showMessageBoxAndBack(msg, "warning");
                        },
                    });
            },

            handleConceptValueHelp: function (oEvent) {
                this.inputId = oEvent.getSource().getId();
                let aConceptos = this.oVariablesJSONModel.getData().conceptos;
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(this.xmlFragmentConceptoHelp, this);
                    sap.ui.core.BusyIndicator.show();

                    if (aConceptos.length === 0) {
                        this.getOwnerComponent()
                            .getModel("oEntregaModel")
                            .read("/ConceptoSet", {
                                success: (res) => {
                                    //Validacion cuando se completan todos los elementos
                                    const oTable = this.getView().byId("idFragCrearSolicitud--idTableCrearSolicitud");
                                    const aTableModel = oTable.getModel().getData();
                                    if (aTableModel.length === res.results.length) {
                                        sap.ui.core.BusyIndicator.hide();
                                    } else {
                                        this.oVariablesJSONModel.setProperty("/conceptos/", res.results);
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                },
                                error: (err) => {
                                    sap.ui.core.BusyIndicator.hide();
                                    let msj = this.getI18nText("appErrorMsg");
                                    this.showMessageBox(msj, "warning");
                                },
                            });
                    }
                    sap.ui.core.BusyIndicator.hide();
                    // let temp = [{c:"Alimentación"},{c:"Hospedaje"},{c:"Movilidad"}];
                    // this.oVariablesJSONModel.setProperty("/conceptos/", temp);
                    this.getView().addDependent(this._valueHelpDialog);
                }
                let sInputValue = this.getView().byId(this.inputId).getValue();
                // open value help dialog filtered by the input value
                this._valueHelpDialog.open(sInputValue);
            },

            handleConceptValueHelpSearch: function (oEvent) {
                let sValue = oEvent.getParameter("value");
                let oFilter = new Filter("Zconc", FilterOperator.Contains, sValue);
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            handleConceptValueHelpClose: function (oEvent) {
                let oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    let conceptInput = this.byId(this.inputId);
                    conceptInput.setValue(oSelectedItem.getTitle());
                }
                this._valueHelpDialog = null;
                oEvent.getSource().getBinding("items").filter([]);
            },

            fnRemoverConcepto: function (sConcepto) {
                let aConceptos = this.oVariablesJSONModel.getProperty("/conceptos");
                for (let i = 0; i < aConceptos.length; i++) {
                    if (aConceptos[i].Zconc === sConcepto) {
                        aConceptos.splice(i, 1);
                        this.oVariablesJSONModel.setProperty("/conceptos/", aConceptos);
                        return;
                    }
                }
            },

            fnAgregarConcepto: function (sConcepto) {
                let aConceptos = this.oVariablesJSONModel.getProperty("/conceptos");
                for (let i = 0; i < aConceptos.length; i++) {
                    if (aConceptos[i].Zconc === sConcepto) {
                        return;
                    }
                }
                aConceptos.push({
                    Zconc: sConcepto,
                });
                this.oVariablesJSONModel.setProperty("/conceptos/", aConceptos);
            },
            onChangeValueMoneda: function (oEvent) {
                const oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValue("");
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Por favor ingrese un valor correcto!");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None);
                }
            },

            onChangeAdicional: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");
                this.oGeneral.setProperty("/displayAdicionales", bSelected);
                if (!bSelected) {
                    var oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel");
                    var InfoIas = sap.ui.getCore().getModel("InfoIas");
                    var that = this;
                    sap.ui.core.BusyIndicator.show(0);
                    oModelMaestroSolicitudes.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='E001')", {
                        success: (result, status, xhr) => {
                            sap.ui.core.BusyIndicator.hide();
                            var sOperacion = `${result.Zcat} - ${result.Txt50}`;
                            var oModelFragSolicitud = that.getView().byId("idFragCrearSolicitud--frmCrearSoli").getModel();
                            oModelFragSolicitud.setProperty("/sZcatCompleto", sOperacion);
                        },
                        error: (xhr, status, error) => {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            },

            onAdicionalSelectionChange: function (oEvent) {
                var oComboAdicional = oEvent.getSource();
                var sCodAdicional = oComboAdicional.getSelectedKey();
                var oModelMaestroSolicitudes = this.getOwnerComponent().getModel("oEntregaModel");
                var InfoIas = sap.ui.getCore().getModel("InfoIas");
                var that = this;
                sap.ui.core.BusyIndicator.show(0);
                oModelMaestroSolicitudes.read("/OperacionSet(Bukrs='" + InfoIas.Bukrs + "',Zcat='" + sCodAdicional + "')", {
                    success: (result, status, xhr) => {
                        sap.ui.core.BusyIndicator.hide();
                        var sOperacion = `${result.Zcat} - ${result.Txt50}`;
                        var oModelFragSolicitud = that.getView().byId("idFragCrearSolicitud--frmCrearSoli").getModel();
                        oModelFragSolicitud.setProperty("/sZcatCompleto", sOperacion);
                    },
                    error: (xhr, status, error) => {
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
        });
    }
);
