sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessagePopover",
        "sap/m/MessagePopoverItem",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/ui/core/BusyIndicator",
        "../service/SharePoint",
        "sap/ui/model/Filter",
        "../service/Service",
        "com/everis/suppliers/invoiceregisternotoc/model/formatter",
        "../service/Message",
        "../service/Workflow",
        "sap/m/MessageToast",
        "sap/m/Dialog",
        "sap/m/Label",
        "sap/m/Text",
        "sap/m/TextArea",
        'sap/m/Button',
        '../service/Sunat',
        '../service/DocumentClassUtil'
    ],
    function (
        Controller,
        MessagePopover,
        MessagePopoverItem,
        JSONModel,
        MessageBox,
        BusyIndicator,
        SharePoint,
        Filter,
        Service,
        formatter,
        Message,
        Workflow,
        MessageToast,
        Dialog,
        Label,
        Text,
        TextArea,
        Button,
        Sunat,
        DocumentClassUtil
    ) {
        "use strict";
        var oThat,
            fragmentsPath = "com.everis.suppliers.invoiceregisternotoc.view",
            sEstado = "I",
            oModelGeneral,
            oModelUtils,
            oModelUtilsMM,
            bValidateSunat = true,
            sCreatedByUser = "",
            sUserLoginName = "",
            sCreatedByRuc = "",
            MotivoNotificacion = "",
            MotivoNotificacionMasivo = "",
            oListMasterGeneral = [],
            flagValidator = true,
            sUri = "",
            sAmbient = "",
            sProject = "",
            idApp = "",
            oDocumentClassConst1 = "",
            oDocumentClassConst2 = "",
            aTag = [],
            aCustomerRucs = [],
            bIsGenericUser = false,
            aDocumentClassData = [],
            aSociety = [],
            sSocietyNif = "",
            fFlagValidationDocument = true;

        const PREFIX_SUNAT = {
            FACTURA: "01",
            BOLETA: "02",
            NOTA_CREDITO: "07",
            NOTA_DEBITO: "08",
        };
        return Controller.extend("com.everis.suppliers.invoiceregisternotoc.controller.Home", {
            formatter: formatter,
            onInit: function () {
                oThat = this;
                Workflow.setManifestObject(oThat);
                sEstado = "I";
                aTag = [];

                oModelGeneral = oThat.getOwnerComponent().getModel("SUPPLIERS_SRV");
                oModelUtils = oThat.getOwnerComponent().getModel("UTILS_SRV");
                oModelUtilsMM = oThat.getOwnerComponent().getModel("MM_UTILS_SRV");
                Promise.all([oThat.validateSUNAT(oModelUtils)]).then((values) => {
                    oThat.bValidateSunat = (values[0].results[0].ValueLow == 'X') ? true : false;
                });

                oThat.onIniciatorEnabledVisible();
                // sAmbient/app/ruc/referencia
                oThat.onIniciatorModels();
                oThat.setAreaData(oModelGeneral);
                //expira cada 12 horas
                oThat.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");

                Promise.all([oThat.onGetData(), oThat.readUserIasInfo()]).then((values) => {
                    const data = values[1];
                    //sCreatedByUser = data.Resources[0].userName;
                    sUserLoginName = data.Resources[0].userName;
                    sCreatedByUser = data.Resources[0].emails[0].value; //Solo desarrollo
                    var aAttributes = data.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                    if (aAttributes !== undefined) {
                        sCreatedByRuc = aAttributes.attributes[0].value;

                        // Validar si RUC asociado a usuario IAS es de proveedor o Kallpa
                        if (aCustomerRucs.includes(sCreatedByRuc)) {
                            bIsGenericUser = true;

                            // Habilitar campo RUC Proveedor para input del u suario
                            oThat.onState(true, "supplierRuc");
                        } else {
                            bIsGenericUser = false;

                            // Setear Ruc Proveedor
                            oThat.updateSupplierRuc(sCreatedByRuc);
                            // oThat.onState(false, "supplierRuc");
                        }
                    }

                    // Guardar Document Class y determinar cuáles mostrar en combobox
                    aDocumentClassData = values[0].results;

                    var oDataGeneral = oThat.getView().getModel("DataGeneral");
                    oThat.setDocumentClassData(!oDataGeneral.getData().CheckElectronicSupplier);

                    oThat.onCreatedList();
                    oThat.loadConstants();
                }).catch(() => {
                    sap.ui.core.BusyIndicator.hide();
                });

                //Se obtiene token Sharepoint
                BusyIndicator.show(0);

                Service.consult(oModelGeneral, "/SPTokenSet('INVOICE')", "", "")
                    .then((response) => {
                        oThat.bearer = response.Token;
                        if (response.Token.length === 0) {
                            MessageBox.error(formatter.onGetI18nText(oThat, "msgNotToken"));
                        }
                    })
                    .catch((err) => {
                        MessageBox.error(formatter.onGetI18nText(oThat, "msgNotToken"));
                    })
                    .finally(() => {
                        BusyIndicator.hide();
                    });
            },

            setDocumentClassData: function (bIsGenericUser) {
                let sApplicationFilter;
                let aDocumentClassDataTmp;

                if (bIsGenericUser) {
                    aDocumentClassDataTmp = aDocumentClassData;
                } else {
                    sApplicationFilter = "DOCUMENTCLASS";
                    aDocumentClassDataTmp = aDocumentClassData.filter((x) => {
                        return x.Application === sApplicationFilter;
                    });
                }

                const oDocumentClassModel = new JSONModel(aDocumentClassDataTmp);
                oDocumentClassModel.setSizeLimit(999999999);
                oThat.getView().setModel(oDocumentClassModel, "listDocumentClass");

                oThat.getView().byId("iptReference").fireChange();
            },

            onAfterRendering: function () {
                try {
                    var sIdSplit = oThat.createId("idsplit");
                    var oSplit = document.getElementById(sIdSplit);
                    var oChild = oSplit.firstElementChild;
                    var startupParameters =
                        $.getComponentDataMyInbox === undefined
                            ? undefined
                            : $.getComponentDataMyInbox.startupParameters;
                    //valida si entra por el workflow
                    oThat.myInbox = false;
                    if (startupParameters !== undefined && startupParameters.hasOwnProperty("taskModel")) {
                        oThat.myInbox = true;
                        oChild.style.display = "none";
                    } else {
                        oChild.style.display = "block";
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onIniciatorModels: function () {
                var oModel = new JSONModel([]);
                var oModelFile = new JSONModel([]);
                var oModelFolder = new JSONModel([
                    {
                        Id: "XML",
                        Name: "XML",
                    },
                    {
                        Id: "AR1",
                        Name: "AR1",
                    },
                    {
                        Id: "AR2",
                        Name: "AR2",
                    },
                    {
                        Id: "AR3",
                        Name: "AR3",
                    },
                ]);
                var oModelNameFile = new JSONModel({
                    XML: "",
                    AR1: "",
                    AR2: "",
                    AR3: "",
                });
                var oModelSearch = new JSONModel({
                    value: "",
                });
                //Modelo donde se guardaran rutas de archivos individuales
                oThat.getView().setModel(oModelFile, "file");
                //Modelo donde se guardaran rutas de archivos individuales
                oThat.getView().setModel(oModelFolder, "folder");
                //Modelo que guarda nombre de los archivos que vas adjuntando
                oThat.getView().setModel(oModelNameFile, "UploadFile");
                //Modelo para hacer busqueda en la lista del master
                oThat.getView().setModel(oModelSearch, "search");
                //Modelo donde se guardara la informacion del historial o time line
                oThat.getView().setModel(oModel, "listTimeLine");

                //Upload collection para AR3
                var oUploadCollectionModel = new JSONModel({
                    items: [],
                    sharepointFiles: [],
                    maximumFileSize: 10,
                    uploadEnabled: true,
                    uploadButtonInvisible: false,
                    enableDelete: true,
                    visibleDelete: true
                });
                oThat.getView().setModel(oUploadCollectionModel, "UploadCollectionModel");
            },

            // Inicializador de modelos de las tablas de los tabs.
            onIniciatorEnabledVisible: function () {
                oThat.onState(true, "general");
                oThat.onState(false, "btnDown");
                oThat.onState(false, "visible");
                oThat.onState(false, "timeLine");
                oThat.onState(false, "voucher");
                oThat.onState(0, "count");
                oThat.onState(bIsGenericUser, "supplierRuc");
                oThat.onState(true, "xmlVisible");
                oThat.onState(formatter.onGetI18nText(oThat, "phlblNroCompro"), "placeholderNDocument");
            },

            onState: function (bState, modelo) {
                var oModel = new JSONModel({
                    state: bState
                });
                if (oThat.getView().getModel(modelo)) {
                    oThat.getView().getModel(modelo).setProperty("/state", bState);
                } else {
                    oThat.getView().setModel(oModel, modelo);
                }
                // oThat.getView().setModel(oModel, modelo);
                oThat.getView().getModel(modelo).refresh(true);
            },

            // Borrar la Data General
            onCleanDataGeneral: function () {
                var oDataGeneral = oThat.getView().getModel("DataGeneral");
                oDataGeneral.getData().Operation = "";
                oDataGeneral.getData().DocumentClass = "";
                oDataGeneral.getData().AreaID = "";
                oDataGeneral.getData().Company = "";
                oDataGeneral.getData().InvoiceDate = "";
                oDataGeneral.getData().VoucherNumber = "";
                oDataGeneral.getData().Currency = "";
                oDataGeneral.getData().InvoiceReference = "";
                oDataGeneral.getData().Amount = "";
                oDataGeneral.getData().CheckElectronicSupplier = true;
                oDataGeneral.getData().CheckSunat = true;
                if (bIsGenericUser) {
                    oDataGeneral.getData().Ruc = "";
                    oDataGeneral.getData().SupplierName = "";
                }
                oDataGeneral.getData().FormVisible = false;
                oDataGeneral.getData().StatusSunat = "-";
                oDataGeneral.refresh(true);

                var oDataFiles = oThat.getView().getModel("UploadFile");
                oDataFiles.getData().XML = "";
                oDataFiles.getData().AR1 = "";
                oDataFiles.getData().AR2 = "";
                oDataFiles.getData().AR3 = "";
                oDataFiles.refresh(true);

                oThat.setDocumentClassData(!oDataGeneral.getData().CheckElectronicSupplier);
            },

            // Crear la lista de posiciones.
            onCreatedList: function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    var aFilterUser = [];
                    aFilterUser.push(new Filter("WFRequestUser", "EQ", sCreatedByUser.toUpperCase()));
                    Service.onGetDataGeneralFilters(oModelGeneral, "PRNotPurchaseOrderSet", aFilterUser)
                        .then(function (oListMaster) {
                            var master = oThat.getView().byId("idLista");
                            master.destroyItems();

                            $.each(oListMaster.results, function (k, v) {
                                if (v.RequestedOnDate) {
                                    v.RequestedOnDateFormat = formatter.onGetFormatDate(v.RequestedOnDate);
                                } else {
                                    v.RequestedOnDateFormat = "";
                                }

                                if (v.ApprovedOnDate) {
                                    v.ApprovedOnDateFormat = formatter.onGetFormatDate(v.ApprovedOnDate);
                                } else {
                                    v.ApprovedOnDateFormat = "";
                                }
                            });

                            oListMasterGeneral = oListMaster.results;
                            var oModel = new JSONModel(oListMaster.results);
                            oModel.setSizeLimit(999999999);
                            oThat.getView().setModel(oModel, "listMaster");
                        })
                        .catch(function (oError) {
                            oThat.onErrorMessage(oError, "errorSave");
                        })
                        .finally(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            loadConstants: function () {
                var that = this;
                Service.onGetDataGeneral(oModelGeneral, "ListaSet").then((oResult) => {
                    var oModel = new JSONModel(oResult.results);
                    that.getView().setModel(oModel, "oModelConstants");
                }).catch((oError) => {
                    that.onErrorMessage(oError, "errorSave");
                });
            },

            // Obtener la Data de Datos Generales y de los Tabs
            onGetData: function () {
                let oDocumentClass;
                return new Promise(function (resolve, reject) {
                    try {
                        oThat
                            .onGetConstants()
                            .then(function (oConstants) {
                                var oModel = new JSONModel(oConstants.results);
                                oModel.setSizeLimit(999999999);
                                oThat.getView().setModel(oModel, "listConstants");
                                //Se obtiene la ruta de almacenamiento de archivos
                                var sValue = oConstants.results.find((oItem) => {
                                    return oItem.Group1 === "SHAREPOINT" && oItem.Field === "ROOT_DIRECTORY";
                                });
                                if (sValue === undefined) {
                                    MessageBox.error(formatter.onGetI18nText(oThat, "msgNotRouteFolder"));
                                } else {
                                    SharePoint.setValueRoot(sValue.ValueLow);
                                }
                                $.each(oConstants.results, function (k, v) {
                                    if (v.Field === "URL") {
                                        sUri = v.ValueLow;
                                        oThat.uri = sUri;
                                    }
                                    if (v.Field === "LANDSCAPE") {
                                        sAmbient = v.ValueLow;
                                    }
                                    if (v.Field === "PR_NOT_PORDER") {
                                        sProject = v.ValueLow;
                                    }
                                    if (v.Field === "BLART" && v.Sequence.trim() === "1") {
                                        oDocumentClassConst1 = v.ValueLow;
                                    }
                                    if (v.Field === "BLART" && v.Sequence.trim() === "2") {
                                        oDocumentClassConst2 = v.ValueLow;
                                    }
                                    if (v.Field === "ID_APPLICATION") {
                                        idApp = v.ValueLow;
                                    }
                                    if (v.Group1 === "XML_TAG" && v.Field === "DOCUMENT_TYPE") {
                                        aTag.push({
                                            id: v.ValueLow,
                                            text: v.ValueHigh,
                                        });
                                    }
                                    if (v.Group1 === "MIF_RUC" && v.Field === "RUC") {
                                        aCustomerRucs.push(v.ValueLow);
                                    }
                                });

                                oThat
                                    .onGetOperation()
                                    .then((resultado) => oThat.onGetDocumentClass())
                                    .then((resultado) => {
                                        oDocumentClass = resultado;
                                        oThat.onGetSociety();
                                    })
                                    .then((resultado) => oThat.onGetCoin())
                                    .then((resultado) => {
                                        oThat.onGetMyInbox($.getComponentDataMyInbox);
                                        oThat.onGetDataOfNavigation();
                                        resolve(oDocumentClass);
                                    });
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                sap.ui.core.BusyIndicator.hide();
                                resolve(oDocumentClass);
                            })
                            .finally(function () { });
                    } catch (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                        resolve();
                    }
                });
            },

            // Obtener los datos del usuario logeado del IAS.
            readUserIasInfo: function () {
                try {
                    var that = this;
                    return new Promise(function (resolve, reject) {
                        var userModel = new JSONModel({});
                        var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();

                        if (sMail === "DEFAULT_USER" || sMail === undefined) {
                            sMail = "suppliers.proveedor1@medifarma.com.pe";
                            //sMail = "fcorvett@everis.com";
                            // sMail = "qas_generico_kallpa1@yopmail.com";
                        }

                        var sPath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
                        const sUrl = that.getOwnerComponent().getManifestObject().resolveUri(sPath);
                        userModel
                            .loadData(sUrl, null, true, "GET", null, null, {
                                "Content-Type": "application/scim+json",
                            })
                            .then(() => {
                                var oDataTemp = userModel.getData();
                                resolve(oDataTemp);
                            })
                            .catch((err) => {
                                reject("Error");
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            enableDisableFileDownload: function () {
                oThat.getView().byId("iptReference");
            },
            // Borrar todos los combos
            onAddRequestInvoice: function () {
                try {
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("confirmAddNewRequest"),
                        {
                            styleClass: "sapUiSizeCompact",
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            onClose: function (oAction) {
                                if (oAction === "YES") {
                                    // Enabled en su forma inicial.
                                    oThat.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");
                                    oThat.onIniciatorEnabledVisible();
                                    oThat.onCleanDataGeneral();
                                    oThat.onIniciatorModels();
                                    oThat.onCreatedList();
                                    oThat.sFullPath = undefined;
                                    flagValidator = true;
                                    sEstado = "I";
                                    oThat.onState(false, "timeLine");
                                }
                            },
                        }
                    );
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Mensajes de error, exito, warning.
            onMessagesButtonPress: function (oEvent) {
                try {
                    // var oMessagesButton = oEvent.getSource();
                    // if (!oThat._messagePopover) {
                    // 	oThat._messagePopover = new MessagePopover({
                    // 		items: {
                    // 			path: "message>/",
                    // 			template: new MessagePopoverItem({
                    // 				description: "{message>description}",
                    // 				type: "{message>type}",
                    // 				title: "{message>title}"
                    // 			})
                    // 		}
                    // 	});
                    // 	oMessagesButton.addDependent(oThat._messagePopover);
                    // }
                    // oThat._messagePopover.toggle(oMessagesButton);
                    if (!oThat._oMessagePopover) {
                        // create popover lazily (singleton)
                        oThat._oMessagePopover = sap.ui.xmlfragment(
                            "onFrgMessagePopover",
                            fragmentsPath + ".fragment.MessagePopover",
                            oThat
                        );
                        oThat.getView().addDependent(oThat._oMessagePopover);
                    }
                    oThat._oMessagePopover.openBy(oEvent.getSource());
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onMessagesButtonPressMyInbox: function (oEvent) {
                try {
                    var messages = JSON.parse(sessionStorage.getItem("messages"));
                    $.each(messages, function (key, item) {
                        item.description = item.message;
                        var type = item.severity;
                        if (type == "info") {
                            item.type = "Information";
                        } else if (type == "warning") {
                            item.type = "Warning";
                        } else if (type == "success") {
                            item.type = "Success";
                        } else {
                            item.type = "Error";
                        }
                    });
                    var oModel = new JSONModel(messages);
                    oThat.getView().setModel(oModel, "messageMyInbox");

                    var oMessagesButton = oEvent;
                    if (!oThat._messagePopoverMyInbox) {
                        oThat._messagePopoverMyInbox = new MessagePopover({
                            items: {
                                path: "messageMyInbox>/",
                                template: new MessagePopoverItem({
                                    description: "{messageMyInbox>description}",
                                    type: "{messageMyInbox>type}",
                                    title: "{messageMyInbox>title}",
                                }),
                            },
                        });
                        oMessagesButton.addDependent(oThat._messagePopoverMyInbox);
                    }
                    oThat._messagePopoverMyInbox.setModel(oModel, "messageMyInbox");
                    oThat._messagePopoverMyInbox.toggle(oMessagesButton);
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetTestData: function () {
                var jDatos = sap.ui.require.toUrl("com/everis/suppliers/invoiceregisternotoc/model/dataGeneral.json");
                var oModel = new JSONModel(jDatos);
                this.getView().setModel(oModel, "listGroup");
            },

            onChooseDocumentType: function (oEvent) {
                try {
                    var sDocumentType = oEvent.getSource().getSelectedKey(),
                        oDataGeneral = oThat.getView().getModel("DataGeneral");

                    if (sDocumentType === oDocumentClassConst1 || sDocumentType === oDocumentClassConst2) {
                        oThat.onState(true, "visible");
                    } else {
                        oThat.onState(false, "visible");
                    }

                    if (sDocumentType !== "") {
                        oEvent.getSource().setValueState("Success");
                        oEvent.getSource().setValueStateText("");

                        oDataGeneral.getData().VoucherNumber =
                            sDocumentType + oDataGeneral.getData().VoucherNumber.slice(2);
                        oThat.onState(true, "voucher");

                        oThat.getView().byId("iptReference").fireChange();
                    } else {
                        oDataGeneral.getData().VoucherNumber = "";
                        oThat.onState(false, "voucher");
                    }

                    oDataGeneral.refresh(true);
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista del combo de Operacion.
            onGetOperation: function () {
                try {
                    return new Promise(function (resolve, reject) {
                        sap.ui.core.BusyIndicator.show(0);
                        Service.onGetDataGeneral(oModelGeneral, "OperationSet")
                            .then(function (oOperation) {
                                var oModel = new JSONModel(oOperation.results);
                                oModel.setSizeLimit(999999999);
                                oThat.getView().setModel(oModel, "listOperation");
                                resolve(oOperation);
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                reject(oError);
                                sap.ui.core.BusyIndicator.hide();
                            })
                            .finally(function () {
                                // sap.ui.core.BusyIndicator.hide();
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista del combo de Clase Documento.
            onGetDocumentClass: function () {
                try {
                    return new Promise(function (resolve, reject) {
                        sap.ui.core.BusyIndicator.show(0);
                        Service.onGetDataGeneral(oModelGeneral, "DocumentClassSet")
                            .then(function (oDocumentClass) {
                                resolve(oDocumentClass);
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                reject(oError);
                                sap.ui.core.BusyIndicator.hide();
                            })
                            .finally(function () {
                                // sap.ui.core.BusyIndicator.hide();
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista del combo de Sociedad.
            onGetSociety: function () {
                try {
                    return new Promise(function (resolve, reject) {
                        sap.ui.core.BusyIndicator.show(0);
                        var aFilterUser = [];
                        aFilterUser.push(new Filter("Application", "EQ", idApp));
                        Service.onGetDataGeneralFilters(oModelGeneral, "CompanySet", aFilterUser)
                            .then(function (oSociety) {
                                aSociety = oSociety.results;
                                var oModel = new JSONModel(oSociety.results);
                                oModel.setSizeLimit(999999999);
                                oThat.getView().setModel(oModel, "listSociety");
                                resolve(oSociety);
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                reject(oError);
                                sap.ui.core.BusyIndicator.hide();
                            })
                            .finally(function () {
                                // sap.ui.core.BusyIndicator.hide();
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener la lista del Combobox de moneda.
            onGetCoin: function () {
                try {
                    return new Promise(function (resolve, reject) {
                        sap.ui.core.BusyIndicator.show(0);
                        var aFilterUser = [];
                        aFilterUser.push(new Filter("Application", "EQ", idApp));
                        Service.onGetDataGeneralFilters(oModelGeneral, "CurrencySet", aFilterUser)
                            .then(function (oCoin) {
                                var oModel = new JSONModel(oCoin.results);
                                oModel.setSizeLimit(999999999);
                                oThat.getView().setModel(oModel, "listCoin");
                                resolve(oCoin);
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                reject(oError);
                            })
                            .finally(function () {
                                sap.ui.core.BusyIndicator.hide();
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener las constantes de SAP.
            onGetConstants: function () {
                try {
                    return new Promise(function (resolve, reject) {
                        sap.ui.core.BusyIndicator.show(0);
                        var aFilterUser = [];
                        aFilterUser.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
                        aFilterUser.push(new Filter("Group1", "EQ", "PR_NOT_PORDER"));
                        aFilterUser.push(new Filter("Group1", "EQ", "SHAREPOINT"));
                        aFilterUser.push(new Filter("Group1", "EQ", "XML_TAG"));
                        aFilterUser.push(new Filter("Group1", "EQ", "MIF_RUC"));
                        aFilterUser.push(new Filter("Field", "EQ", "ROOT_DIRECTORY"));
                        aFilterUser.push(new Filter("Field", "EQ", "URL"));
                        aFilterUser.push(new Filter("Field", "EQ", "LANDSCAPE"));
                        aFilterUser.push(new Filter("Field", "EQ", "PR_NOT_PORDER"));
                        aFilterUser.push(new Filter("Field", "EQ", "BLART"));
                        aFilterUser.push(new Filter("Field", "EQ", "ID_APPLICATION"));
                        aFilterUser.push(new Filter("Field", "EQ", "DOCUMENT_TYPE"));
                        aFilterUser.push(new Filter("Field", "EQ", "RUC"));
                        Service.onGetDataGeneralFilters(oModelGeneral, "ConfigurationSet", aFilterUser)
                            .then(function (oConstants) {
                                resolve(oConstants);
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                                sap.ui.core.BusyIndicator.hide();
                            })
                            .finally(function () {
                                // sap.ui.core.BusyIndicator.hide();
                            });
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onValidRegisterWSDL: function (oDataReceive, oDataCredential, RUC) {
                return new Promise((resolve, reject) => {
                    var oReturnWSDL = {
                        bvalid: false,
                        oResult: {},
                    };

                    var sSoapBody = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ws="http://ws.online.asp.core.paperless.cl">
		   <soap:Header/>
		   <soap:Body>
		      <ws:OnlineRecoveryRec>
		         <ws:ruc>${oDataReceive.RUC_SOCIEDAD}</ws:ruc>
		         <ws:login>${oDataCredential.user.ValueLow}</ws:login>
		         <ws:clave>${oDataCredential.pass.ValueLow}</ws:clave>
		         <ws:rucEmisor>${RUC}</ws:rucEmisor>
		         <ws:tipoDoc>${oDataReceive.TIPO_DOCU}</ws:tipoDoc>
		         <ws:folio>${oDataReceive.NUM_FACTURA}</ws:folio>
		         <ws:tipoRetorno>${oDataCredential.tipo_retorno.ValueLow}</ws:tipoRetorno>
		      </ws:OnlineRecoveryRec>
		   </soap:Body>
		</soap:Envelope>`;

                    $.ajax({
                        url: "/service_wsdl/cxf/S4HANA_PAPERLESS_R2R_Facturacion_electronica_validacion_proveedores?wsdl",
                        contentType: "text/xml; charset=utf-8",
                        type: "POST",
                        dataType: "xml",
                        async: false,
                        data: sSoapBody,
                        success: (oResult) => {
                            oReturnWSDL.bvalid = false;
                            oReturnWSDL.oResult = oResult;
                            resolve(oReturnWSDL);
                        },
                        error: (err) => {
                            reject(err);
                        },
                    });
                });
            },

            onRegistrarwithCheckServiceWsdl: function (data) {
                return new Promise((resolve, reject) => {
                    var aFilter = [];

                    aFilter.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
                    aFilter.push(new Filter("Group1", "EQ", "INVOICEREG"));
                    aFilter.push(new Filter("Field", "EQ", "WS_USER"));
                    aFilter.push(new Filter("Field", "EQ", "WS_PASSWORD"));
                    aFilter.push(new Filter("Field", "EQ", "WS_RUC"));
                    aFilter.push(new Filter("Field", "EQ", "WS_TIPO_DOC"));
                    aFilter.push(new Filter("Field", "EQ", "WS_TIPO_RETORNO"));
                    aFilter.push(new Filter("Field", "EQ", "WS_OK_CODE"));

                    //var oModelContacto = this.getView().getModel("Contacto");
                    var RUC = sCreatedByRuc;

                    var oJSONCredentials = {};

                    Service.onGetDataGeneralFilters(oModelGeneral, "ConfigurationSet", aFilter)
                        .then(function (oConstants) {
                            var response = oConstants.results;

                            oJSONCredentials.user = response.find((ele) => {
                                return ele.Field === "WS_USER";
                            });

                            oJSONCredentials.pass = response.find((ele) => {
                                return ele.Field === "WS_PASSWORD";
                            });

                            oJSONCredentials.tipo_retorno = response.find((ele) => {
                                return ele.Field === "WS_TIPO_RETORNO";
                            });

                            oJSONCredentials.code_ok = response.find((ele) => {
                                return ele.Field === "WS_OK_CODE";
                            });

                            return oThat.onValidRegisterWSDL(data, oJSONCredentials, RUC);
                        })
                        .then((oResultData) => {
                            var xReturn = oResultData.oResult.getElementsByTagName("ns:return");
                            var sValue = xReturn[0].childNodes[0].nodeValue;

                            var DOM = new DOMParser();
                            var oValue = DOM.parseFromString(sValue, "text/xml");

                            var CoderResult = oValue.getElementsByTagName("Codigo")[0].textContent;

                            if (CoderResult === oJSONCredentials.code_ok.ValueLow) {
                                resolve(true);
                            } else {
                                var oMessage = [
                                    {
                                        title: data.NUM_FACTURA,
                                        description: sValue,
                                        type: "Error",
                                    },
                                ];

                                oThat.onState(1, "count");
                                var oModel = new JSONModel(oMessage);
                                oThat.getView().setModel(oModel, "message");

                                resolve(false);
                            }
                        })
                        .catch(function (oError) {
                            oThat.onErrorMessage(oError, "errorSave");
                            reject(oError);
                        })
                        .finally(() => {
                            sap.ui.core.BusyIndicator.hide();
                        });
                });
            },

            // Mensaje de confirmacion para la creacion de la solicitud.
            onRequestInvoice: function () {
                try {
                    var oDataGeneral = oThat.getView().getModel("DataGeneral");

                    MessageBox.confirm(formatter.onGetI18nText(oThat, "confirmRequest"), {
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: (oAction) => {
                            if (oAction === "YES") {
                                oThat.onValidationBeforeSaveRequestInvoicenotoc();

                                if (!flagValidator) {
                                    return false;
                                }
                                var oData = Object.assign({}, oDataGeneral.getData());

                                if (!fFlagValidationDocument) {
                                    /*
                                        Obtener el motivo por el cual no se va ejecutar el proceso
                                    */
                                    let sValue = oData.VoucherNumber.replace(/[-\s]/g, "");
                                    if (!/^[0-9]+$/.test(sValue)) {
                                        MessageBox.error(
                                            formatter.onGetI18nText(oThat, "msgFormatNotElectronicSupplier") + sValue
                                        );
                                        return false;
                                    }

                                    const prefix = DocumentClassUtil.getPrefix(this, oDataGeneral.getData().DocumentClass);

                                    if (prefix === PREFIX_SUNAT.FACTURA || prefix === PREFIX_SUNAT.NOTA_CREDITO || prefix === PREFIX_SUNAT.NOTA_DEBITO) {
                                        MessageBox.error(formatter.onGetI18nText(oThat, "sValidDataNumberCompro01"));
                                    } else if (prefix === PREFIX_SUNAT.BOLETA) {
                                        MessageBox.error(formatter.onGetI18nText(oThat, "sValidDataNumberCompro02"));
                                    } else if (prefix === "14") {
                                        // TODO: Clase documento 14 ?
                                        MessageBox.error(formatter.onGetI18nText(oThat, "sValidDataNumberCompro04"));
                                    } else if (prefix === "91") {
                                        // TODO: Clase documento 91 ?
                                        MessageBox.error(formatter.onGetI18nText(oThat, "sValidDataNumberCompro04"));
                                    }
                                    return false;
                                }

                                oThat.onGetCompanyNifSelected(oDataGeneral.getData().Company);
                                var sDate = oThat.getDateRoute(new Date());
                                var oUploadFile = oThat.getView().getModel("UploadFile").getData(),
                                    aFiles = oThat.getView().getModel("file").getData(),
                                    //Colocar en esa estructura Folder1/Folder2
                                    sRoute =
                                        sAmbient +
                                        "/" +
                                        sProject +
                                        "/" +
                                        sSocietyNif +
                                        "/" +
                                        sDate +
                                        "/" +
                                        oDataGeneral.getData().Ruc; //"DEV/SOLICITUDPROVEEDORES/20200120001"; //El ruc debe ser dinamico
                                //Ruta completa donde se guardan los archivos
                                // oThat.sFullPath = sRoute + "/" + oThat.uuid; // en ves de ir el string en duro PRUEBA debe ir oThat.uuid o traer el uuid que se guardo
                                oThat.sFullPath = sRoute + "/" + oDataGeneral.getData().VoucherNumber + "/" + oThat.uuid;

                                /*=============================== CAMBIO VALIDACIÓN FACTURA ===============================*/

                                var bCheckFactura = oDataGeneral.getProperty("/CheckFactura");

                                if (bCheckFactura) {
                                    var oComboxSociedData = oThat
                                        .getView()
                                        .byId("cboSociety")
                                        .getSelectedItem()
                                        .getBindingContext("listSociety")
                                        .getObject();
                                    var VoucherNumber = oDataGeneral.getData().VoucherNumber;

                                    VoucherNumber = VoucherNumber.substr(
                                        VoucherNumber.indexOf("-") + 1,
                                        VoucherNumber.length
                                    );

                                    var oJSON = {
                                        RUC_SOCIEDAD: oComboxSociedData.CompanyNif,
                                        TIPO_DOCU: oDataGeneral.getData().DocumentClass,
                                        NUM_FACTURA: VoucherNumber,
                                    };

                                    /*
                                    Validar si los documentos obligatorios fueron cargados:
                                    - AR1: (PDF) Adjunto 1
                                    
                                    SI: Proveedor electrónico                                        
                                        - XML
                                    */

                                    if (oUploadFile.AR1 === "") {
                                        MessageBox.error(
                                            formatter.onGetI18nText(oThat, "sMissingAdjuntPDF")
                                        );
                                        return;
                                    }

                                    const bElectronicCheck = oDataGeneral.getData().CheckElectronicSupplier;
                                    if (bElectronicCheck && oUploadFile.XML === "") {
                                        MessageBox.error(
                                            formatter.onGetI18nText(oThat, "sMissingAdjunt")
                                        );
                                        return;
                                    }

                                    oThat
                                        .onRegistrarwithCheckServiceWsdl(oJSON)
                                        .then((bResult) => {
                                            if (bResult) {
                                                SharePoint.createFolderDeep(oThat, oThat.sFullPath)
                                                    .then((resolve) => {
                                                        SharePoint.saveFiles(oThat, aFiles)
                                                            .then((response) => {
                                                                sap.ui.core.BusyIndicator.show(0);
                                                                oThat.onSaveRequestInvoicenotoc();
                                                            })
                                                            .catch((err) => {
                                                                MessageBox.error(
                                                                    formatter.onGetI18nText(oThat, "sErrorAdjuntos") +
                                                                    " " +
                                                                    JSON.parse(err.responseText).error_description
                                                                );
                                                            });
                                                    })
                                                    .catch((oError) => {
                                                        oThat.onErrorMessage(oError, "errorSave");
                                                    });
                                            }
                                        })
                                        .catch((oError) => {
                                            console.log(oError);
                                        });

                                    /*=============================== END VALIDACIÓN FACTURA ===============================*/
                                } else {

                                    /*
                                    Validar si los documentos obligatorios fueron cargados:
                                    - AR1: (PDF) Adjunto 1
                                    
                                    SI: Proveedor electrónico                                        
                                        - XML
                                    */

                                    if (oUploadFile.AR1 === "") {
                                        MessageBox.error(
                                            formatter.onGetI18nText(oThat, "sMissingAdjuntPDF")
                                        );
                                        return;
                                    }

                                    const bElectronicCheck = oDataGeneral.getData().CheckElectronicSupplier;
                                    if (bElectronicCheck && oUploadFile.XML === "") {
                                        MessageBox.error(
                                            formatter.onGetI18nText(oThat, "sMissingAdjunt")
                                        );
                                        return;
                                    }

                                    SharePoint.createFolderDeep(oThat, oThat.sFullPath)
                                        .then((resolve) => {

                                            SharePoint.saveFiles(oThat, aFiles)
                                                .then((response) => {
                                                    sap.ui.core.BusyIndicator.show(0);
                                                    oThat.onSaveRequestInvoicenotoc();
                                                })
                                                .catch((err) => {
                                                    MessageBox.error(
                                                        formatter.onGetI18nText(oThat, "sErrorAdjuntos") +
                                                        " " +
                                                        JSON.parse(err.responseText).error_description
                                                    );
                                                });
                                        })
                                        .catch((oError) => {
                                            oThat.onErrorMessage(oError, "errorSave");
                                        });
                                }
                            }
                        },
                    });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Crear la solicitud de preregistro sin oc.
            onSaveRequestInvoicenotoc: function () {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    var oDataGeneral = oThat.getView().getModel("DataGeneral"),
                        DocumentNum = oDataGeneral.getData().VoucherNumber;

                    oThat.onValidateDate(oDataGeneral.getData().InvoiceDate);

                    var oData = {
                        PRNotPurchaseOrderID: oThat.uuid,
                        Operation: oDataGeneral.getData().Operation,
                        DocumentClass: oDataGeneral.getData().DocumentClass,
                        Company: oDataGeneral.getData().Company,
                        InvoiceDate: oDataGeneral.getData().InvoiceDate,
                        VoucherNumber: oDataGeneral.getData().VoucherNumber,
                        Currency: oDataGeneral.getData().Currency,
                        InvoiceReference: oDataGeneral.getData().InvoiceReference,
                        Amount: oDataGeneral.getData().Amount,
                        WFStatus: sEstado,
                        WFCreatedByUser: sCreatedByUser.toUpperCase(),
                        WFRequestUser: sCreatedByUser.toUpperCase(),
                        Ruc: oDataGeneral.getData().Ruc,
                        AreaID: oDataGeneral.getData().AreaID,
                        RequesterUserName: sUserLoginName
                    };
                    Service.onRefreshToken(oModelGeneral)
                        .then(function (oRefresh) {
                            let oParameterAprovers = {
                                Bukrs: '1000',
                                Prcid: 'P030',
                                Rulid: '',
                                Tskid: 'S001',
                                Tabname: 'TBPREQAREA',
                                Fieldname: 'AREAID',
                                Value: oData.AreaID,
                                Isfound: false,
                                TabSearch: 'PA0001',
                                FieldSearch: 'PLANS'
                            };
                            Service.onGetRequestEntity(oModelUtilsMM, "zinaprobadoresSet", oParameterAprovers
                            ).then(function (aAprovers) {
                                let oApprover = "";
                                if (aAprovers.results !== undefined) {
                                    if (aAprovers.results.length > 0) {
                                        oApprover = aAprovers.results[0].Low;
                                    }
                                    else {
                                        MessageToast.show(formatter.onGetI18nText(oThat, "appSinAprobadorNivelX"))
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                }
                                if (oApprover !== "") {
                                    oData.WFCreatedByUser= oApprover.toUpperCase();
                                    oParameterAprovers.Isfound = oParameterAprovers.Isfound ? 'X' : '';
                                    oData.JApprover_data = JSON.stringify(oParameterAprovers);
                                    Service.onSaveRequestBP(oModelGeneral, "PRNotPurchaseOrderSet", oData).then(function (oSaveRequest) {
                                        var messages = Message.onReadMessageSuccess(oSaveRequest, DocumentNum);
                                        if (messages.length > 0) {
                                            var oModel = new JSONModel(messages);
                                            oThat.getView().setModel(oModel, "message");
                                            MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectSend"));
                                        } else {
                                            MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrect"));
                                        }

                                        if (oThat.myInbox) {
                                            // Workflow.onRefreshTask();
                                            MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectReSend"));
                                            sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                                        } else {
                                            oThat.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");
                                            oThat.onIniciatorEnabledVisible();
                                            oThat.onCleanDataGeneral();
                                            oThat.onIniciatorModels();
                                            oThat.onCreatedList();
                                            oThat.sFullPath = undefined;
                                            flagValidator = true;
                                            sEstado = "I";
                                            oThat.onState(messages.length, "count");
                                        }
                                    }).catch(function (oError) {
                                        var messages = Message.onReadMessageError(oError, DocumentNum);
                                        if (messages.length > 0) {
                                            oThat.onState(messages.length, "count");
                                            var oModel = new JSONModel(messages);
                                            oThat.getView().setModel(oModel, "message");
                                            var message = messages[0];
                                            MessageBox[message.severity](message.description);
                                        } else {
                                            oThat.onErrorMessage(oError, "sErrorGeneral");
                                        }
                                    }).finally(function () {
                                        sap.ui.core.BusyIndicator.hide();
                                    });
                                }
                            }).catch(function (oError) {
                                MessageToast.show(formatter.onGetI18nText(oThat, "sErrorAprover"));
                                var messages = Message.onReadMessageError(oError, DocumentNum);
                                if (messages.length > 0) {
                                    oThat.onState(messages.length, "count");
                                    var oModel = new JSONModel(messages);
                                    oThat.getView().setModel(oModel, "message");
                                } else {
                                    oThat.onErrorMessage(oError, "sErrorAprover");
                                }
                            })
                        })
                        .catch(function (oError) {
                            console.log("error");
                            sap.ui.core.BusyIndicator.hide();
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onValidateDate: function (date) {
                try {
                    var sDateValidate = date.indexOf("T"),
                        sDateValidate2 = date.indexOf("/"),
                        oDataGeneral = oThat.getView().getModel("DataGeneral");
                    if (sDateValidate === -1) {
                        if (sDateValidate2 === -1) {
                            var sDateFormatter = formatter.onGetFormatDate(date),
                                sDatePartsFormatter = sDateFormatter.split("/");
                            oDataGeneral.getData().InvoiceDate =
                                sDatePartsFormatter[2] +
                                "-" +
                                sDatePartsFormatter[1] +
                                "-" +
                                sDatePartsFormatter[0] +
                                "T00:00:00";
                        } else {
                            var sDateParts = date.split("/");
                            oDataGeneral.getData().InvoiceDate =
                                sDateParts[2] + "-" + sDateParts[1] + "-" + sDateParts[0] + "T00:00:00";
                        }
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetRequestInvoice: function (oEvent) {
                try {
                    var oItem = oEvent.getParameter("listItem").getBindingContext("listMaster").getObject();
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("confirmGetOldRequest"),
                        {
                            styleClass: "sapUiSizeCompact",
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            onClose: function (oAction) {
                                if (oAction === "YES") {
                                    // Se ponen los campos en modo no editable
                                    oThat.onState(false, "general");
                                    oThat.onState(true, "btnDown");
                                    oThat.onState(false, "documentNumber");
                                    // Se traeran los datos del BP seleccionado
                                    oThat.onGetServiceRequestInvoice(oItem.PRNotPurchaseOrderID);
                                }
                            },
                        }
                    );
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetServiceRequestInvoice: function (PRNotPurchaseOrderID) {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onGetRequestInvoice(oModelGeneral, "PRNotPurchaseOrderSet", PRNotPurchaseOrderID)
                        .then(function (oRequestInvoice) {
                            // Setear data de Datos Generales.
                            oRequestInvoice.InvoiceDate = formatter.onGetFormatDate(oRequestInvoice.InvoiceDate);
                            let bProveedorElectronico = false;
                            if (
                                oRequestInvoice.DocumentClass === oDocumentClassConst1 ||
                                oRequestInvoice.DocumentClass === oDocumentClassConst2
                            ) {
                                oThat.onState(true, "visible");
                            } else {
                                oThat.onState(false, "visible");
                            }
                            var oModelDataGeneral = new JSONModel(oRequestInvoice);
                            oThat.getView().setModel(oModelDataGeneral, "DataGeneral");
                            oThat.getView().getModel("DataGeneral").refresh(true);

                            //-------------------------Sunat --------
                            oThat.setSunatVariablesAprobador(oRequestInvoice);
                            var bCheckSunat = oThat.getView().getModel("DataGeneral").getProperty("/CheckSunat");

                            if (bCheckSunat) {
                                Sunat.getSunatStatus(oThat.getView().getModel("sunatVariables").getData(), oThat).then(nSunat => {
                                    oThat.getView().getModel("DataGeneral").setProperty("/FormVisible", true);
                                    switch (nSunat) {
                                        case -1:
                                            oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Reintentar");
                                            break;
                                        case 0:
                                            oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Rechazado");
                                            break;
                                        default:
                                            oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Aceptado");
                                            break;
                                    }
                                }).catch(err => {
                                    console.log(err);
                                });
                                //
                            }

                            // Setear en el historial o time line.
                            $.each(oRequestInvoice.History.results, function (k, v) {
                                if (v.UserComment !== "") {
                                    v.SystemComment = v.SystemComment + "\n" + v.UserComment;
                                }
                            });
                            var oModelHistory = new JSONModel(oRequestInvoice.History.results);
                            oThat.getView().setModel(oModelHistory, "listTimeLine");
                            oThat.getView().getModel("listTimeLine").refresh(true);
                            oThat.onState(true, "timeLine");

                            // Attachments
                            var oUploadCollectionModel = oThat.getView().getModel("UploadCollectionModel");
                            var aUploadCollectionFiles = oUploadCollectionModel.getData().items;
                            oThat.toggleFunctionality(oUploadCollectionModel, false);
                            var aDataFolder = oThat.getView().getModel("folder").getData();
                            aDataFolder = aDataFolder.slice();

                            var sPRNotPurchaseOrderID = oRequestInvoice.PRNotPurchaseOrderID;
                            var oDate = oRequestInvoice.RequestedOnDate;
                            oDate.setDate(oDate.getDate() + 1); // due to UTC to GMT problem
                            var sDate = oThat.getDateRoute(oDate);
                            var sDocumentNumber = oRequestInvoice.Ruc;
                            var sVoucherNumber = oRequestInvoice.VoucherNumber;

                            if (sPRNotPurchaseOrderID !== "" && sDocumentNumber !== "") {
                                BusyIndicator.show(0);
                                oThat.onGetCompanyNifSelected(oRequestInvoice.Company);
                                oThat.selectVoucherNumber = sVoucherNumber;
                                var sRootComplete = sAmbient + "/" + sProject + "/" + sSocietyNif + "/" + sDate + "/" + sDocumentNumber + "/" + oThat.selectVoucherNumber + "/" + sPRNotPurchaseOrderID;
                                SharePoint.getFiles(oThat, aDataFolder, sRootComplete);
                                SharePoint.getFileListForUploadCollection(oThat, "AR3", sRootComplete).then((aResults) => {
                                    if (aResults.length !== 0){
                                        aResults.forEach((oItem) => {
                                            aUploadCollectionFiles.push({
                                                fileName: oItem.Name
                                            });
                                        });
                                        oUploadCollectionModel.refresh();
                                    }
                                });
                            }

                            // Leer Razon Social
                            oThat.updateSupplierRuc(sDocumentNumber);
                        })
                        .catch(function (oError) {
                            oThat.onErrorMessage(oError, "errorSave");
                        })
                        .finally(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener el Ruc de la Sociedad Seleccionada
            onGetCompanyNifSelected: function (companyID) {
                var oFindSociety = aSociety.find((oItem) => {
                    return oItem.CompanyID === companyID;
                });

                if (oFindSociety) {
                    sSocietyNif = oFindSociety.CompanyNif;
                } else {
                    sSocietyNif = "";
                }
            },

            // Crear la solicitud de preregistro sin oc.
            onValidationBeforeSaveRequestInvoicenotoc: function () {
                try {
                    var oDataGeneral = oThat.getView().getModel("DataGeneral"),
                        rexNumber = /[^a-zA-Z0-9]/,
                        regExpImport = /^\d+(\.\d{0,2})?$/;

                    if (
                        oDataGeneral.getData().DocumentClass !== "" &&
                        oDataGeneral.getData().Company !== "" &&
                        oDataGeneral.getData().InvoiceDate !== "" &&
                        oDataGeneral.getData().VoucherNumber !== "" &&
                        oDataGeneral.getData().Currency !== "" &&
                        oDataGeneral.getData().Amount !== "" &&
                        oDataGeneral.getData().Ruc !== ""
                    ) {
                        if (!oDataGeneral.getData().Amount.match(regExpImport)) {
                            oThat.getView().byId("iptAmount").setValueState("Error");
                            oThat
                                .getView()
                                .byId("iptAmount")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorNumber"));
                            flagValidator = false;
                            return;
                        } else {
                            oThat.getView().byId("iptAmount").setValueState("Success");
                            oThat.getView().byId("iptAmount").setValueStateText("");
                            flagValidator = true;
                        }

                        if (
                            oDataGeneral.getData().DocumentClass === oDocumentClassConst1 ||
                            oDataGeneral.getData().DocumentClass === oDocumentClassConst2
                        ) {
                            if (oDataGeneral.getData().InvoiceReference === "") {
                                oThat.getView().byId("iptReference").setValueState("Error");
                                oThat
                                    .getView()
                                    .byId("iptReference")
                                    .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                                MessageBox.warning(formatter.onGetI18nText(oThat, "sValidDataNumberReference"));
                                flagValidator = false;
                                return;
                            } else {
                                oThat.getView().byId("iptReference").setValueState("Success");
                                oThat.getView().byId("iptReference").setValueStateText("");
                                flagValidator = true;
                            }

                            var sInvoiceReferenceParts = oDataGeneral.getData().InvoiceReference.split("-");
                            var sInvoiceReferenceString = sInvoiceReferenceParts.join("");

                            if (
                                !rexNumber.test(sInvoiceReferenceString) &&
                                oDataGeneral.getData().InvoiceReference.length === 16
                            ) {
                                flagValidator = true;
                            } else {
                                MessageBox.warning(formatter.onGetI18nText(oThat, "sValidDataNumberReference"));
                                flagValidator = false;
                                return;
                            }
                        }

                        // var sVoucherNumberParts = oDataGeneral.getData().VoucherNumber.split("-");
                        // var sVoucherNumberString = sVoucherNumberParts.join("");

                        // if (!rexNumber.test(sVoucherNumberString) && oDataGeneral.getData().VoucherNumber.length === 16) {
                        // 	flagValidator = true;
                        // } else {
                        // 	MessageBox.warning(formatter.onGetI18nText(oThat, "sValidDataNumberCompro"));
                        // 	flagValidator = false;
                        // 	return;
                        // }
                    } else {
                        if (oDataGeneral.getData().DocumentClass === "") {
                            oThat.getView().byId("cboDocumentClass").setValueState("Error");
                            oThat
                                .getView()
                                .byId("cboDocumentClass")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("cboDocumentClass").setValueState("Success");
                            oThat.getView().byId("cboDocumentClass").setValueStateText("");
                        }
                        if (oDataGeneral.getData().Company === "") {
                            oThat.getView().byId("cboSociety").setValueState("Error");
                            oThat
                                .getView()
                                .byId("cboSociety")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("cboSociety").setValueState("Success");
                            oThat.getView().byId("cboSociety").setValueStateText("");
                        }
                        if (oDataGeneral.getData().InvoiceDate === "") {
                            oThat.getView().byId("dpDate").setValueState("Error");
                            oThat
                                .getView()
                                .byId("dpDate")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("dpDate").setValueState("Success");
                            oThat.getView().byId("dpDate").setValueStateText("");
                        }
                        if (oDataGeneral.getData().VoucherNumber === "") {
                            oThat.getView().byId("iptVoucherNumber").setValueState("Error");
                            oThat
                                .getView()
                                .byId("iptVoucherNumber")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("iptVoucherNumber").setValueState("Success");
                            oThat.getView().byId("iptVoucherNumber").setValueStateText("");
                        }
                        if (oDataGeneral.getData().Currency === "") {
                            oThat.getView().byId("cboCurrency").setValueState("Error");
                            oThat
                                .getView()
                                .byId("cboCurrency")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("cboCurrency").setValueState("Success");
                            oThat.getView().byId("cboCurrency").setValueStateText("");
                        }
                        if (oDataGeneral.getData().Amount === "") {
                            oThat.getView().byId("iptAmount").setValueState("Error");
                            oThat
                                .getView()
                                .byId("iptAmount")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("iptAmount").setValueState("Success");
                            oThat.getView().byId("iptAmount").setValueStateText("");
                        }
                        if (oDataGeneral.getData().Ruc === "") {
                            oThat.getView().byId("iptSupplierRUC").setValueState("Error");
                            oThat
                                .getView()
                                .byId("iptSupplierRUC")
                                .setValueStateText(formatter.onGetI18nText(oThat, "sErrorValidator"));
                        } else {
                            oThat.getView().byId("iptSupplierRUC").setValueState("Success");
                            oThat.getView().byId("iptSupplierRUC").setValueStateText("");
                        }

                        MessageBox.warning(formatter.onGetI18nText(oThat, "sValidDataGeneral"));
                        flagValidator = false;
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onSaveFile: function (oEvent) {
                try {
                    var oSource = oEvent.getSource();
                    var sCustom = oSource.data("custom");
                    var aFile = Array.from(oEvent.getParameter("files"));
                    var aDataFile = oThat.getView().getModel("file").getData();
                    var aDataFolder = oThat.getView().getModel("folder").getData();
                    function readFiles(index) {
                        if (index === aFile.length) return;
                        var oFile = aFile[index];
                        var reader = new FileReader();
                        // var oDataUploadAttachments = this["dialogUploadAttachments"].getModel("UploadAttachments").getData();
                        if (oFile) {
                            switch (sCustom) {
                                case "XML":
                                    reader.onloadend = function (oEventLoad) {
                                        var bCheckSunat = oThat.getView().getModel("DataGeneral").getProperty("/CheckSunat");
                                        oThat.getView().getModel("DataGeneral").setProperty("/FormVisible", false);
                                        oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "-");
                                        oThat.setSunatVariables(oThat);
                                        var oXmlValidator = oThat.onGetXml(oEventLoad);

                                        if (!oXmlValidator.Valid) {
                                            MessageBox.error(formatter.onGetI18nText(oThat, oXmlValidator.TextI18n));
                                            oSource.setValue("");
                                        } else {
                                            //Validar con Sunat

                                            debugger;
                                            if (bCheckSunat) {
                                                Sunat.getSunatStatus(oThat.getView().getModel("sunatVariables").getData(), oThat)
                                                    .then(nSunat => {
                                                        oThat.getView().getModel("DataGeneral").setProperty("/FormVisible", true);
                                                        switch (nSunat) {
                                                            case -1:
                                                                MessageBox.error(formatter.onGetI18nText(oThat, "msgsunatstatusresponse"));
                                                                oSource.setValue("");
                                                                oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Reintentar");
                                                                break;
                                                            case 0:
                                                                MessageBox.error(formatter.onGetI18nText(oThat, "msgsunatstatuserror"));
                                                                oSource.setValue("");
                                                                oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Rechazado");
                                                                break;
                                                            default:
                                                                MessageBox.success(formatter.onGetI18nText(oThat, "msgsunatstatussuccess"));
                                                                oThat.getView().getModel("DataGeneral").setProperty("/StatusSunat", "Aceptado");
                                                                oThat.onSaveModelFile(oEventLoad, aDataFolder, sCustom, oFile, aDataFile);
                                                                break;
                                                        }
                                                    }).catch(err => {
                                                        MessageBox.error(
                                                            err
                                                        );
                                                    });
                                            } else {
                                                //Agrega el documento al modelo: UploadFile
                                                oThat.onSaveModelFile(oEventLoad, aDataFolder, sCustom, oFile, aDataFile);
                                            }
                                        }
                                        readFiles(index + 1);
                                    };
                                    reader.onerror = function (oEventError) {
                                        MessageToast.show(formatter.onGetI18nText(oThat, "sErrorXml"));
                                    };
                                    reader.readAsBinaryString(oFile);
                                    break;
                                default:
                                    reader.onloadend = function (e) {
                                        oThat.onSaveModelFile(e, aDataFolder, sCustom, oFile, aDataFile);
                                        readFiles(index + 1);
                                    };
                                    reader.readAsArrayBuffer(oFile);
                                    break;
                            }
                        }
                    }
                    readFiles(0);
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onSaveModelFile: function (oEvent, aDataFolder, sCustom, oFile, aDataFile) {
                try {
                    var result = oEvent.target.result;
                    // DJ : Acta de declaración jurada, SR: Solicitud de la ficha RUC, EC:Encabezado del estado de cuenta bancario
                    var oFindFolder = aDataFolder.find((oItem) => {
                        return oItem.Id === sCustom;
                    });
                    var oJson = {
                        Id: sCustom,
                        FileName: oFile.name,
                        ArrayBufferResult: result,
                        FolderName: oFindFolder.Name,
                    };
                    var oFindFile = aDataFile.find((oItem) => {
                        return oItem.Id === sCustom;
                    });
                    var bFind = true;
                    if (oFindFile === undefined) {
                        bFind = false;
                    }

                    if (bFind && sCustom !== "AR3") {
                        aDataFile.find((v) => v.Id === sCustom).FileName = oFile.name;
                        aDataFile.find((v) => v.Id === sCustom).ArrayBufferResult = result;
                    } else {
                        aDataFile.push(oJson);
                    }
                    if (sCustom !== "AR3") {
                        oThat
                            .getView()
                            .getModel("UploadFile")
                            .setProperty("/" + oFindFolder.Id, oFile.name);
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onGetXml: function (oEvent) {
                let bReciboFlag = false;
                var oDataGeneral = oThat.getView().getModel("DataGeneral");
                var sResultFile = oEvent.target.result;
                var sTextI18n = "";
                var bError = false;
                var bValid = true;
                var oResultSplit = sResultFile.split("ï»¿");
                var oTag;
                var sTag = "";
                if (oResultSplit.length === 2) {
                    sResultFile = oResultSplit[1];
                }

                // Flag si tiene tag Recibo
                if (sResultFile.includes("href=" + '"recibo.xsl"' + "")) {
                    bReciboFlag = true;
                }

                sResultFile = new DOMParser().parseFromString(sResultFile, "text/xml");
                sResultFile = oThat.xmlToJson(sResultFile);

                $.each(aTag, function (k, v) {
                    if (sResultFile[v.text] !== undefined) {
                        oTag = sResultFile[v.text];
                        sTag = v.id;
                    }
                });


                // Si tiene tag de Invoice (01), verificar si es Recibo
                if (sTag === PREFIX_SUNAT.FACTURA && bReciboFlag) {
                    sTag = PREFIX_SUNAT.BOLETA; // Recibo
                }

                if (oTag === undefined) {
                    bValid = false;
                    sTextI18n = "msginvoicetagnotfound";
                    //return MessageToast.show("Etiqueta Invoice no encontrado en el XML");
                }

                var bNamespace = true;
                var aKeys = [];
                let invoiceType_ = "";

                try {
                    for (var key in oTag["@attributes"]) {
                        if (key.includes(":")) {
                            aKeys.push(key.split(":")[1]);
                        }
                    }
                    for (var key in oTag) {
                        if (oTag[key].hasOwnProperty("@attributes")) {
                            var oAtributos = oTag[key]["@attributes"];
                            for (var property in oAtributos) {
                                if (property.includes(":")) {
                                    aKeys.push(property.split(":")[1]);
                                }
                            }
                        }
                    }


                    var aKeysUnique = aKeys.filter(function (item, pos, self) {
                        return self.indexOf(item) == pos;
                    });

                    invoiceType_ = sTag;
                    sTag = JSON.stringify(oTag);
                    for (var i = 0; i < aKeysUnique.length; i++) {
                        var sKey = aKeysUnique[i];
                        var regex = new RegExp('"' + sKey + ":", "g");
                        //var sValid = '\"' + sKey + ':';
                        sTag = sTag.replace(regex, '"');
                    }

                    oTag = JSON.parse(sTag);
                    if (oTag["cbc:InvoiceTypeCode"] === undefined) {
                        bNamespace = false;
                    }

                } catch (oError) {
                    bValid = false;
                    sTextI18n = "msginvoicetagnotfound";
                }

                if (!bValid) {
                    return {
                        Valid: bValid,
                        TextI18n: sTextI18n,
                        Error: bError,
                        TextError: "",
                    };
                } else {
                    try {
                        var sXmlRuc = "";
                        // Obtener RUC del XML
                        if (oTag["AccountingSupplierParty"]["Party"]["PartyIdentification"] !== undefined) {
                            sXmlRuc = oTag["AccountingSupplierParty"]["Party"]["PartyIdentification"]["ID"]["#text"];
                        } else if (oTag["AccountingSupplierParty"]["CustomerAssignedAccountID"] !== undefined) {
                            sXmlRuc = oTag["AccountingSupplierParty"]["CustomerAssignedAccountID"]["#text"];
                        } else {
                            return {
                                Valid: false,
                                TextI18n: "msgrucnotfoundinxml",
                                Error: bError,
                                TextError: "",
                            };
                        }
                        if (bIsGenericUser) {
                            oThat.updateSupplierRuc(sXmlRuc);
                        } else {
                            // Validar Xml Ruc con User Ruc (custom attribute 1)
                            if (sXmlRuc !== sCreatedByRuc) {
                                bValid = false;
                                sTextI18n = "msgrucnotmatch";
                            }
                        }

                        if (!bValid) {
                            return {
                                Valid: bValid,
                                TextI18n: sTextI18n,
                                Error: bError,
                                TextError: "",
                            };
                        } else {
                            const aCompanies = oThat.getView().getModel("listSociety").getData();
                            const oMatchedCompany = aCompanies.find((x) => {
                                if (oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"] !== undefined) {
                                    return (
                                        x.CompanyNif ==
                                        oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"]["ID"]["#text"]
                                    );
                                } else {
                                    return (
                                        x.CompanyNif ==
                                        oTag["AccountingCustomerParty"]["CustomerAssignedAccountID"]["#text"]
                                    );
                                }
                            });

                            if (oMatchedCompany && oMatchedCompany["Bukrs"]) {
                                oDataGeneral.getData().Company = oMatchedCompany["Bukrs"];
                            } else {
                                oDataGeneral.getData().Company = "";
                            }

                            if (oTag["IssueDate"] !== undefined) {
                                oDataGeneral.getData().InvoiceDate = oTag["IssueDate"]["#text"] + "T00:00:00";
                                oThat.byId("dpDate").fireChange({value: oDataGeneral.getData().InvoiceDate, valid: true});
                            } else {
                                oDataGeneral.getData().InvoiceDate = "";
                            }
                            if (oTag["InvoiceTypeCode"] !== undefined) {
                                if (bReciboFlag) {
                                    invoiceType_ = PREFIX_SUNAT.BOLETA; // Recibo
                                    oDataGeneral.getData().DocumentClass = invoiceType_;
                                } else {
                                    oDataGeneral.getData().DocumentClass = oTag["InvoiceTypeCode"]["#text"];
                                    invoiceType_ = PREFIX_SUNAT.FACTURA;
                                }
                            } else {
                                if (oTag["CreditNoteLine"] !== undefined) {
                                    invoiceType_ = PREFIX_SUNAT.NOTA_CREDITO;
                                }
                                if (oTag["DebitNoteLine"] !== undefined) {
                                    invoiceType_ = PREFIX_SUNAT.NOTA_DEBITO;
                                }

                                oDataGeneral.getData().DocumentClass = invoiceType_;
                                oThat.onState(true, "visible");
                            }
                            if (oTag["ID"] !== undefined) {
                                oDataGeneral.getData().VoucherNumber =
                                    oDataGeneral.getData().DocumentClass + "-" + oTag["ID"]["#text"];
                            } else {
                                oDataGeneral.getData().VoucherNumber = "";
                            }

                            if (oTag["DocumentCurrencyCode"] !== undefined) {
                                oDataGeneral.getData().Currency = oTag["DocumentCurrencyCode"]["#text"];
                            } else if (oTag["TaxTotal"] !== undefined) {
                                oDataGeneral.getData().Currency =
                                    oTag["TaxTotal"]["TaxAmount"]["@attributes"]["currencyID"];
                            } else {
                                oDataGeneral.getData().Currency = "";
                            }

                            oDataGeneral.getData().Amount = "";
                            if (bReciboFlag) {
                                if (oTag["TaxTotal"] !== undefined && oTag["TaxTotal"]["TaxSubtotal"]["TaxableAmount"] !== undefined) {
                                    oDataGeneral.getData().Amount = parseFloat(
                                        oTag["TaxTotal"]["TaxSubtotal"]["TaxableAmount"]["#text"]
                                    ).toString();
                                }
                            } else {
                                if (oTag["LegalMonetaryTotal"] !== undefined && oTag["LegalMonetaryTotal"]["PayableAmount"] !== undefined) {
                                    oDataGeneral.getData().Amount = parseFloat(
                                        oTag["LegalMonetaryTotal"]["PayableAmount"]["#text"]
                                    ).toString();
                                } else if (oTag["RequestedMonetaryTotal"] !== undefined && oTag["RequestedMonetaryTotal"]["PayableAmount"] !== undefined) {
                                    oDataGeneral.getData().Amount = parseFloat(
                                        oTag["RequestedMonetaryTotal"]["PayableAmount"]["#text"]
                                    ).toString();
                                }
                            }

                            if (oTag["BillingReference"] !== undefined) {
                                if (oTag["BillingReference"]["InvoiceDocumentReference"] !== undefined) {
                                    if (
                                        oTag["BillingReference"]["InvoiceDocumentReference"]["DocumentTypeCode"] !==
                                        undefined
                                    ) {
                                        if (oTag["BillingReference"]["InvoiceDocumentReference"]["ID"] !== undefined) {
                                            oDataGeneral.getData().InvoiceReference =
                                                oTag["BillingReference"]["InvoiceDocumentReference"][
                                                "DocumentTypeCode"
                                                ]["#text"] +
                                                "-" +
                                                oTag["BillingReference"]["InvoiceDocumentReference"]["ID"]["#text"];
                                        } else {
                                            oDataGeneral.getData().InvoiceReference = "";
                                        }
                                    }
                                } else {
                                    oDataGeneral.getData().InvoiceReference = "";
                                }
                            } else {
                                oDataGeneral.getData().InvoiceReference = "";
                            }

                            oDataGeneral.refresh(true);

                            if (oDataGeneral.getData().InvoiceReference !== "") {
                                oThat.getView().byId("iptReference").fireChange();
                            }

                            if (oDataGeneral.getData().VoucherNumber !== "") {
                                oThat.getView().byId("iptVoucherNumber").fireChange();
                                oThat.onState(true, "voucher");
                            }

                            //Sunat 
                            let rucProveedor = sCreatedByRuc;

                            let rucAcreedor = "";
                            if (oTag["AccountingCustomerParty"] &&
                                oTag["AccountingCustomerParty"]["Party"] &&
                                oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"] &&
                                oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"]["ID"] &&
                                oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"]["ID"]["#text"] !== "")
                                rucAcreedor = oTag["AccountingCustomerParty"]["Party"]["PartyIdentification"]["ID"]["#text"];
                            else if (oTag["AccountingCustomerParty"] &&
                                oTag["AccountingCustomerParty"]["CustomerAssignedAccountID"] &&
                                oTag["AccountingCustomerParty"]["CustomerAssignedAccountID"]["#text"] !== "") {
                                rucAcreedor = oTag["AccountingCustomerParty"]["CustomerAssignedAccountID"]["#text"];
                            }

                            oThat.getView().getModel("sunatVariables").setData(
                                Sunat.getJsonData(oDataGeneral.getData().Ruc, invoiceType_, oTag["ID"]["#text"], oTag["IssueDate"]["#text"],
                                    oDataGeneral.getData().Amount, rucAcreedor));

                            return {
                                Valid: bValid,
                                TextI18n: sTextI18n,
                                Error: bError,
                                TextError: "",
                            };
                        }
                    } catch (err) {
                        return MessageToast.show(err.message);
                    }
                }
            },

            xmlToJson: function (e) {
                try {
                    var t = {};
                    if (e.nodeType === 1) {
                        if (e.attributes.length > 0) {
                            t["@attributes"] = {};
                            for (var a = 0; a < e.attributes.length; a++) {
                                var r = e.attributes.item(a);
                                t["@attributes"][r.nodeName] = r.nodeValue;
                            }
                        }
                    } else if (e.nodeType === 3) {
                        t = e.nodeValue;
                    }
                    if (e.hasChildNodes()) {
                        for (var o = 0; o < e.childNodes.length; o++) {
                            var s = e.childNodes.item(o);
                            var i = s.nodeName;
                            if (typeof t[i] === "undefined") {
                                t[i] = this.xmlToJson(s);
                            } else {
                                if (typeof t[i].push === "undefined") {
                                    var n = t[i];
                                    t[i] = [];
                                    t[i].push(n);
                                }
                                t[i].push(this.xmlToJson(s));
                            }
                        }
                    }
                    return t;
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onInvoiceDateChange: function (oEvent) {
                var oParameter = oEvent.getParameter("valid");
                if (!oParameter) {
                    oEvent.getSource().setValue("");
                    return MessageToast.show("Fecha Incorrecta.");
                } else {
                    var aConstants = this.getView().getModel("oModelConstants").getData();
                    var sDocSunatDate = aConstants.find((oConstant) => {
                        return oConstant.FIELD === "DOC_SUNAT_DATE"
                    }).VALUE_LOW;
                    var oDocSunatDate = new Date(`${sDocSunatDate.split(".")[2]}-${sDocSunatDate.split(".")[1]}-${sDocSunatDate.split(".")[0]}`);
                    var oSelectedDate = new Date(oEvent.getParameter("value"));
                    if (oSelectedDate < oDocSunatDate) {
                        oEvent.getSource().setValue("");
                        this.getView().getModel("DataGeneral").getData().InvoiceDate = "";
                        return MessageBox.error(`${formatter.onGetI18nText(this, "msginvoicedatetooold")} ${sDocSunatDate}.`);
                    }
                }
            },

            onReferenceChange: function (oEvent) {
                try {
                    var oSource = oEvent.getSource();
                    var oParameters = oEvent.getParameters();
                    var sValor = oSource.getValue().toUpperCase().replace(/\s/g, "");
                    var sValorParts = sValor.split("-");
                    var sValorString = sValorParts.join("");
                    var oDataGeneral = oThat.getView().getModel("DataGeneral"),
                        listDocumentClass = oThat.getView().getModel("listDocumentClass");
                    let sKey = "";

                    listDocumentClass.getData().forEach((element) => {
                        if (element.DocumentClassID === oDataGeneral.getData().DocumentClass) {
                            sKey = element.DocumentPrefix;
                        }
                    });

                    if (sKey == "") {
                        sKey = oDataGeneral.getData().DocumentClass;

                        listDocumentClass.getData().forEach((element) => {
                            if (element.DocumentPrefix === sKey) {
                                oDataGeneral.getData().DocumentClass = element.DocumentClassID;
                            }
                        });

                    }

                    var sVoucher = oDataGeneral.getData().VoucherNumber.split("-");
                    if (sVoucher.length >= 1) {
                        sVoucher[0] = sKey;
                    }


                    oDataGeneral.getData().VoucherNumber = sVoucher.join("-");
                    oDataGeneral.refresh();
                    switch (sKey) {
                        case PREFIX_SUNAT.FACTURA:
                            oThat.onValidVoucherNumber1(
                                true,
                                oSource,
                                oParameters,
                                "phlblNroCompro01",
                                sValorParts,
                                sValorString,
                                sValor,
                                16
                            );
                            break;
                        case PREFIX_SUNAT.BOLETA:
                            oThat.onValidVoucherNumber1(
                                true,
                                oSource,
                                oParameters,
                                "phlblNroCompro02",
                                sValorParts,
                                sValorString,
                                sValor,
                                15
                            );
                            break;
                        case PREFIX_SUNAT.NOTA_CREDITO:
                            oThat.onValidVoucherNumber1(
                                true,
                                oSource,
                                oParameters,
                                "phlblNroCompro01",
                                sValorParts,
                                sValorString,
                                sValor,
                                16
                            );
                            break;
                        case PREFIX_SUNAT.NOTA_DEBITO:
                            oThat.onValidVoucherNumber1(
                                true,
                                oSource,
                                oParameters,
                                "phlblNroCompro01",
                                sValorParts,
                                sValorString,
                                sValor,
                                16
                            );
                            break;
                        case "14":
                            oThat.onValidVoucherNumber2(
                                oSource,
                                oParameters,
                                "phlblNroCompro04",
                                sValorParts,
                                sValorString,
                                sValor,
                                16
                            );
                            break;
                        case "91":
                            oThat.onValidVoucherNumber2(
                                oSource,
                                oParameters,
                                "phlblNroCompro04",
                                sValorParts,
                                sValorString,
                                sValor,
                                23
                            );
                            break;
                        default:
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onValidVoucherNumber1: function (
                sType,
                oSource,
                oParameters,
                sI18n,
                sValorParts,
                sValorString,
                sValor,
                nQuantity
            ) {
                var bElectronicSupplier = oThat
                    .getView()
                    .getModel("DataGeneral")
                    .getProperty("/CheckElectronicSupplier");
                if (sType) {
                    var sValorFormatter = "";
                    var nFormatQuantity = nQuantity - 8;
                }
                oThat.onState(nQuantity, "quantity");
                oThat.onState(formatter.onGetI18nText(oThat, sI18n), "placeholderNDocument");
                if (sValorParts.length === 3 && sValorParts[1].length === 4) {
                    if (!/[^a-zA-Z0-9]/.test(sValorString)) {
                        if (!/[a-zA-Z]/.test(sValorString) && bElectronicSupplier) {
                            //oSource.setValue("");
                            fFlagValidationDocument = false;
                            return MessageBox.error(
                                formatter.onGetI18nText(oThat, "msgFormatForElectronicSupplier") + sValorParts[1]
                            );
                        }
                        if (sType) {
                            sValorFormatter = formatter.onGetFormatReference(sValor, 3, nFormatQuantity);
                        } else {
                            sValorFormatter = sValor;
                        }
                        // if (sCustom === "invoiceReference") {
                        // 	oThat.onValidateReference(sValorFormatter, oSource);
                        // }
                        oSource.setValue(sValorFormatter);
                        if (oParameters.value !== "") {
                            oSource.setValueState("Success");
                            oSource.setValueStateText("");
                        }
                        fFlagValidationDocument = true;
                    } else {
                        fFlagValidationDocument = false;
                        return MessageToast.show(formatter.onGetI18nText(oThat, "msgformatterinvoicespecial"));
                    }
                } else {
                    fFlagValidationDocument = false;
                    return MessageToast.show(formatter.onGetI18nText(oThat, "msgformatterinvoice01"));
                }
            },

            onValidVoucherNumber2: function (
                oSource,
                oParameters,
                sI18n,
                sValorParts,
                sValorString,
                sValor,
                nQuantity
            ) {
                oThat.onState(nQuantity, "quantity");
                oThat.onState(formatter.onGetI18nText(oThat, sI18n), "placeholderNDocument");
                if (sValorParts.length === 2) {
                    if (sValorParts[1] !== "") {
                        if (!/[^a-zA-Z0-9]/.test(sValorString)) {
                            // if (!/[a-zA-Z]/.test(sValorString)) {
                            // 	oSource.setValue("");
                            // 	fFlagValidationDocument = false;
                            // 	return MessageBox.error(formatter.onGetI18nText(oThat, "msgFormatForElectronicSupplier") + sValorParts[1]);
                            // }

                            // if (sCustom === "invoiceReference") {
                            // 	oThat.onValidateReference(sValorFormatter, oSource);
                            // }
                            oSource.setValue(sValor);
                            if (oParameters.value !== "") {
                                oSource.setValueState("Success");
                                oSource.setValueStateText("");
                            }
                            fFlagValidationDocument = true;
                        } else {
                            fFlagValidationDocument = false;
                            return MessageToast.show(formatter.onGetI18nText(oThat, "msgformatterinvoicespecial"));
                        }
                    } else {
                        fFlagValidationDocument = false;
                        return MessageToast.show(formatter.onGetI18nText(oThat, "msgformatterinvoice04"));
                    }
                } else {
                    fFlagValidationDocument = false;
                    return MessageToast.show(formatter.onGetI18nText(oThat, "msgformatterinvoice04"));
                }
            },

            onValidateReference: function (sValorFormatter, oSource) {
                try {
                    BusyIndicator.show(0);
                    var sPath = oModelGeneral.createKey("/ReferenceSet", {
                        Xblnr: sValorFormatter,
                        Nif: sCreatedByRuc,
                    });
                    Service.consult(oModelGeneral, sPath)
                        .then((response) => {
                            BusyIndicator.hide();
                            oThat.invoiceAlreadyRegistered(response, oSource);
                        })
                        .catch((err) => {
                            BusyIndicator.hide();
                            oThat.onErrorMessage(err, "errorSave");
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            invoiceAlreadyRegistered: function (oResponse, oSource) {
                if (oResponse.Response === "") {
                    MessageBox.error(formatter.onGetI18nText(oThat, "msginvoicealreadyregistered"));
                    oSource.setValue("");
                    return;
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
                                    MessageBox.error(
                                        this.getView().getModel("i18n").getResourceBundle().getText(textoI18n)
                                    );
                                }
                            } else {
                                MessageBox.error(oError.responseJSON.response.description);
                            }
                        }
                    } else if (oError.message) {
                        MessageBox.error(oError.message);
                    } else if (oError.responseText) {
                        MessageBox.error(oError.responseText);
                    } else {
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onValidatorColumns: function (oEvent) {
                if (oEvent.getParameters().value !== "") {
                    oEvent.getSource().setValueState("Success");
                    oEvent.getSource().setValueStateText("");
                }
            },

            // Busqueda de la lista master.
            onSearchMaster: function (oEvent) {
                try {
                    var sValue = oThat.getView().getModel("search"),
                        sQuery = sValue.getData().value,
                        oListMaster = JSON.parse(JSON.stringify(oListMasterGeneral)),
                        oModel = "",
                        oListFilterMaster = [],
                        master = oThat.getView().byId("idLista");

                    master.destroyItems();

                    if (sQuery !== "") {
                        // update list binding
                        oListFilterMaster = oListMaster.filter(function (item) {
                            var WFStatus = formatter.onGetStatus(item.WFStatus).toUpperCase();
                            if (
                                item.VoucherNumber.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 ||
                                item.WFCreatedByName.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 ||
                                WFStatus.indexOf(sQuery.toUpperCase()) > -1 ||
                                item.Ruc.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 ||
                                item.RequestedOnDateFormat.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 ||
                                item.ApprovedOnDateFormat.toUpperCase().indexOf(sQuery.toUpperCase()) > -1
                            ) {
                                return item;
                            }
                        });

                        oModel = new JSONModel(oListFilterMaster);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "listMaster");
                        oThat.getView().getModel("listMaster").refresh(true);
                    } else {
                        oModel = new JSONModel(oListMasterGeneral);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "listMaster");
                        oThat.getView().getModel("listMaster").refresh(true);
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Descargar los archivos.
            onDowloadFormat: function (oEvent) {
                try {
                    var oSource = oEvent.getSource();
                    var sCustom = oSource.data("custom");
                    var aDataFolder = oThat.getView().getModel("folder").getData();
                    aDataFolder = aDataFolder.slice();
                    var oFindFolder = aDataFolder.find((oItem) => {
                        return oItem.Id === sCustom;
                    });

                    SharePoint.downloadFile(oThat, oFindFolder.Name);
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Descargar los archivos.
            onDowloadFile: function (oEvent) {
                try {
                    var oSource = oEvent.getSource();
                    var sCustom = oSource.data("custom");
                    var aDataFolder = oThat.getView().getModel("folder").getData();
                    aDataFolder = aDataFolder.slice();
                    var oFindFolder = aDataFolder.find((oItem) => {
                        return oItem.Id === sCustom;
                    });
                    var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
                    oDataGeneral = Object.assign({}, oDataGeneral);
                    var sPRNotPurchaseOrderID = oDataGeneral.PRNotPurchaseOrderID;
                    var sVoucherNumber = oDataGeneral.VoucherNumber;
                    var sDocumentNumber = oDataGeneral.Ruc;
                    var sDate = oThat.getDateRoute(oDataGeneral.WFCreatedByTimestamp);
                    if (sPRNotPurchaseOrderID !== "" && sDocumentNumber !== "") {
                        oThat.onGetCompanyNifSelected(oDataGeneral.Company);
                        var sFolder = sAmbient + "/" + sProject + "/" + sSocietyNif + "/" + sDate + "/" + sDocumentNumber + "/" + oThat.selectVoucherNumber + "/" + sPRNotPurchaseOrderID + "/" + oFindFolder.Name;
                        SharePoint.downloadFile(oThat, sFolder);
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            onDowloadFileArchiveLink: function (sCustom) {
                return new Promise(function (resolve, reject) {
                    try {
                        // var oSource = oEvent.getSource();
                        // var sCustom = "AR1";
                        var aDataFolder = oThat.getView().getModel("folder").getData();
                        aDataFolder = aDataFolder.slice();
                        var oFindFolder = aDataFolder.find((oItem) => {
                            return oItem.Id === sCustom;
                        });
                        var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
                        oDataGeneral = Object.assign({}, oDataGeneral);
                        var sPRNotPurchaseOrderID = oDataGeneral.PRNotPurchaseOrderID;
                        var sVoucherNumber = oDataGeneral.VoucherNumber;
                        var sDocumentNumber = oDataGeneral.Ruc;
                        var sDate = oThat.getDateRoute(oDataGeneral.WFCreatedByTimestamp);
                        if (sPRNotPurchaseOrderID !== "" && sDocumentNumber !== "") {
                            oThat.onGetCompanyNifSelected(oDataGeneral.Company);
                            var sFolder = sAmbient + "/" + sProject + "/" + sSocietyNif + "/" + sDate + "/" + sDocumentNumber + "/" + oThat.selectVoucherNumber + "/" + sPRNotPurchaseOrderID + "/" + oFindFolder.Name;
                            
                            SharePoint.downloadFileArchiveLink(oThat, sFolder).then(function(value) {
                                // return value;
                                console.log(value); // "Success!"  
                                resolve(value);
                            }).catch(function(e) {
                                console.log(e); // "oh, no!"
                                reject(e);
                            });                    
                        }
                    } catch (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    }
                });
            },

            onChangeImport: function (oEvent) {
                try {
                    var rexNumber = /^\d+(\.\d{0,2})?$/;
                    if (!oEvent.getParameters().value.match(rexNumber)) {
                        // MessageBox.error(oEvent.getParameters().value + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                        // 	"sErrorNumber"));
                        oEvent.getSource().setValueState("Error");
                        oEvent
                            .getSource()
                            .setValueStateText(
                                oThat.getView().getModel("i18n").getResourceBundle().getText("sErrorNumber")
                            );
                    } else {
                        oEvent.getSource().setValueState("Success");
                        oEvent.getSource().setValueStateText("");
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Obtener contexto del workflow y setear valores.
            onGetMyInbox: function (getComponentDataMyInbox) {
                try {
                    sap.ui.core.BusyIndicator.show(0);
                    var sIdSplit = oThat.createId("idsplit");
                    var oSplit = document.getElementById(sIdSplit);
                    var oChild = oSplit.firstElementChild;
                    var startupParameters =
                        getComponentDataMyInbox === undefined ? undefined : getComponentDataMyInbox.startupParameters;
                    //valida si entra por el workflow
                    oThat.myInbox = false;
                    if (startupParameters !== undefined && startupParameters.hasOwnProperty("taskModel")) {
                        oThat.onGetButtonsMassive();
                        oThat.myInbox = true;
                        var taskModel = startupParameters.taskModel;
                        var taskData = taskModel.getData();
                        Workflow.onGetContextWorkflow(taskData)
                            .then(function (oContextWorkflow) {
                                if (oContextWorkflow.prnRequestData !== undefined) {
                                    oThat.onGetServiceRequestInvoice(
                                        oContextWorkflow.prnRequestData.PRNOTPURCHASEORDERID
                                    );
                                }
                                oContextWorkflow.task = {};
                                oContextWorkflow.task.Title = taskData.TaskTitle;
                                oContextWorkflow.task.Priority = taskData.Priority;
                                oContextWorkflow.task.Status = taskData.Status;
                                sCreatedByRuc = oContextWorkflow.prnRequestData.RUC;

                                if (taskData.Priority === "HIGH") {
                                    oContextWorkflow.task.PriorityState = "Warning";
                                } else if (taskData.Priority === "VERY HIGH") {
                                    oContextWorkflow.task.PriorityState = "Error";
                                } else {
                                    oContextWorkflow.task.PriorityState = "Success";
                                }
                                oContextWorkflow.task.CreatedOn = taskData.CreatedOn.toDateString();

                                if (oContextWorkflow.status === "P" || oContextWorkflow.status === "T") {
                                    // Button Reject
                                    var oNegativeAction = {
                                        sBtnTxt: oThat
                                            .getView()
                                            .getModel("i18n")
                                            .getResourceBundle()
                                            .getText("btnReject"),
                                        onBtnPressed: function (oEvent) {
                                            oThat.lockApproveRejectButtons(oEvent.getSource());
                                            oThat.onRejectRequestInvoice();
                                        },
                                    };

                                    // Button Approve
                                    var oPositiveAction = {
                                        sBtnTxt: oThat
                                            .getView()
                                            .getModel("i18n")
                                            .getResourceBundle()
                                            .getText("btnApprove"),
                                        onBtnPressed: function (oEvent) {
                                            oThat.lockApproveRejectButtons(oEvent.getSource());
                                            sessionStorage.setItem("messages", null);
                                            oThat.onApproveRejectRequestInvoice(
                                                "A",
                                                "",
                                                oContextWorkflow.prnRequestData.PRNOTPURCHASEORDERID,
                                                oContextWorkflow.prnRequestData.VOUCHERNUMBER
                                            );
                                        },
                                    };

                                    // Add the Approve & Reject buttons
                                    startupParameters.inboxAPI.addAction(
                                        {
                                            action: oPositiveAction.sBtnTxt,
                                            label: oPositiveAction.sBtnTxt,
                                            type: "Accept",
                                        },
                                        oPositiveAction.onBtnPressed
                                    );

                                    startupParameters.inboxAPI.addAction(
                                        {
                                            action: oNegativeAction.sBtnTxt,
                                            label: oNegativeAction.sBtnTxt,
                                            type: "Reject",
                                        },
                                        oNegativeAction.onBtnPressed
                                    );

                                    oThat.onState(false, "visible");
                                    oThat.onState(true, "timeLine");
                                    oThat.onState(false, "general");
                                    oThat.onState(false, "voucher");
                                } else {
                                    // Button Reenvio
                                    var oRequestAction = {
                                        sBtnTxt: oThat
                                            .getView()
                                            .getModel("i18n")
                                            .getResourceBundle()
                                            .getText("btnReRequestBP"),
                                        onBtnPressed: function () {
                                            oThat.onRequestInvoice();
                                        },
                                    };

                                    //Acciones del boton rechazar.
                                    startupParameters.inboxAPI.addAction(
                                        {
                                            action: oRequestAction.sBtnTxt,
                                            label: oRequestAction.sBtnTxt,
                                            type: "Accept",
                                        },
                                        oRequestAction.onBtnPressed
                                    );

                                    sEstado = "T";
                                    oThat.onIniciatorEnabledVisible();
                                    oThat.onState(true, "visible");
                                    oThat.onState(true, "timeLine");
                                    oThat.onState(true, "general");
                                    oThat.onState(true, "voucher");
                                    oThat.uuid = oContextWorkflow.prnRequestData.PRNOTPURCHASEORDERID;
                                }

                                // Button Messages
                                var oMessageAction = {
                                    sBtnTxt: oThat.getView().getModel("i18n").getResourceBundle().getText("btnMessage"),
                                    onBtnPressed: function (oEvent) {
                                        var oMessagesButton = oEvent.getSource();
                                        oThat.onMessagesButtonPressMyInbox(oMessagesButton);
                                    },
                                };

                                //Acciones del boton Mensaje.
                                startupParameters.inboxAPI.addAction(
                                    {
                                        action: oMessageAction.sBtnTxt,
                                        label: oMessageAction.sBtnTxt,
                                        type: "Emphasized",
                                    },
                                    oMessageAction.onBtnPressed
                                );

                                startupParameters.inboxAPI
                                    .getDescription("NA", taskData.InstanceID)
                                    .done(function (dataDescr) {
                                        oContextWorkflow.task.Description = dataDescr.Description;
                                        var oModel = new JSONModel(oContextWorkflow);
                                        oThat.getView().setModel(oModel, "contextData");
                                    })
                                    .fail(function (errorText) {
                                        jQuery.sap.require("sap.m.MessageBox");
                                        sap.m.MessageBox.error(errorText, {
                                            title: "Mensaje de error",
                                        });
                                    });

                                oThat.onHiddenButtonsFooter();
                            })
                            .catch(function (oError) {
                                oThat.onErrorMessage(oError, "errorSave");
                            })
                            .finally(function () {
                                sap.ui.core.BusyIndicator.hide();
                            });
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },
            //Obtiene el business key de la navegacion y carga la data
            onGetDataOfNavigation: function () {
                var sBusinessKey;
                var startupParams = oThat.getOwnerComponent().getComponentData().startupParameters; // get Startup params from Owner Component
                if (startupParams.businessKey && startupParams.businessKey[0]) {
                    if (startupParams.businessKey !== undefined) {
                        sBusinessKey = startupParams.businessKey;
                    } else {
                        sBusinessKey = startupParams.businessKey[0];
                    }
                    oThat.onState(false, "general");
                    oThat.onState(false, "documentNumber");
                    oThat.onState(false, "supplierRuc");

                    oThat.onGetServiceRequestInvoice(sBusinessKey);
                }
            },
            // Comentario para el rechazo.
            onRejectRequestInvoice: function () {
                try {
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelRequest"),
                        {
                            title: "Confirmacion",
                            actions: ["Si", "No"],
                            onClose: function (sActionClicked) {
                                if (sActionClicked === "Si") {
                                    var dialog = new Dialog({
                                        title: "Comentario",
                                        type: "Message",
                                        //actions: ["Aceptar", "Cancelar"],
                                        content: [
                                            new Label({
                                                text: oThat
                                                    .getView()
                                                    .getModel("i18n")
                                                    .getResourceBundle()
                                                    .getText("reCancelMotivo"),
                                                labelFor: "textarea",
                                            }),
                                            new TextArea("textarea", {
                                                liveChange: function (oEvent) {
                                                    MotivoNotificacion = oEvent.getParameter("value");
                                                    var parent = oEvent.getSource().getParent();

                                                    parent.getBeginButton().setEnabled(MotivoNotificacion.length > 0);
                                                },
                                                width: "100%",
                                                placeholder: "Comentario...",
                                                rows: 5,
                                                cols: 20,
                                                maxLength: 40,
                                                //value: v1.COMMENTS
                                            }),
                                        ],
                                        beginButton: new Button({
                                            text: "Aceptar",
                                            enabled: false,
                                            press: function () {
                                                dialog.close();
                                                var oContext = oThat.getView().getModel("contextData");
                                                sessionStorage.setItem("messages", null);
                                                oThat.onApproveRejectRequestInvoice(
                                                    "R",
                                                    MotivoNotificacion,
                                                    oContext.getData().prnRequestData.PRNOTPURCHASEORDERID,
                                                    oContext.getData().prnRequestData.VOUCHERNUMBER
                                                );
                                            },
                                        }),
                                        endButton: new Button({
                                            text: "Cancelar",
                                            press: function () {
                                                dialog.close();
                                                sap.ui.core.BusyIndicator.hide();
                                            },
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                            sap.ui.core.BusyIndicator.hide();
                                        },
                                    });
                                    dialog.open();
                                }
                            },
                        }
                    );
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Refrescar la lista master.
            onRefreshRequestBP: function () {
                oThat.onCreatedList();
                var oModelSearch = new JSONModel([]);
                oThat.getView().setModel(oModelSearch, "search");
            },


            saveFilesInRepository: function (blob,data) {
                var that = this;
               var aBase64Files = [];
               var sFileType = "";

               var reader = new FileReader();
               reader.readAsDataURL(blob);
               reader.onloadend = function () {
               var base64String = reader.result;
               console.log('Base64 String - ', base64String);
             
               // Simply Print the Base64 Encoded String,
               // without additional data: Attributes.
               console.log('Base64 String without Tags- ', 
              base64String.substr(base64String.indexOf(', ') + 1));
             /*  var oFileReaderBase64 = new FileReader();
               oFileReaderBase64.onloadend = function () {
                   console.log(oFileReaderBase64);
                   var result = oFileReaderBase64.result;
                   aBase64Files.push({
                       file: result,
                       type: sFileType
                   });
                   oFileReaderBase64.readAsDataURL(blob);
                   that.uploadFilesToArchiveLink(that, aBase64Files, data);
               }*/
            }
            },
            //Cargar ArchiveLink
            uploadFilesToArchiveLink: function (oModel, sEntidad, oPayload) {
                return new Promise(function (resolve, reject) {
                    Service.onRefreshToken(oModel).then(() => {
                        Service.onSaveRequestBP(oModel, sEntidad, oPayload).then((oResult) => {
                            resolve(oResult);
                        }).catch((oError) => {
                            reject(oError)
                        });
                    }).catch((oError) => {
                        reject(oError);
                    });
                });
            },
            // Aprobar o rechazar la solicitud.
            onApproveRejectRequestInvoice: function (status, comment, PRNotPurchaseOrderID, DocumentNumber) {
                try {
                    var oThat = this;
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onRefreshToken(oModelGeneral)
                        .then(function (oRefresh) {
                            var oContext = oThat.getView().getModel("contextData");
                            var oData = {
                                WFStatus: status,
                                WFCreatedByUser: sCreatedByUser,
                                WFUserComment: comment,
                                ApproverUserName: sUserLoginName
                            };

                            $.ajax({
                                type: "GET",
                                url: oThat.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/xsrf-token"),
                                headers: {
                                    "X-CSRF-Token": "Fetch",
                                },
                                success: function (data, statusText, xhr) {
                                    console.log(xhr.getResponseHeader("X-CSRF-Token"));
                                    Service.onApproveRequestInvoice(
                                        oModelGeneral,
                                        oData,
                                        "PRNotPurchaseOrderSet",
                                        PRNotPurchaseOrderID
                                    ).then(function (oApproveReject) {
                                        MessageToast.show(
                                            formatter.onGetI18nText(oThat, "sCorrectApproveReject")
                                        );
                                        var messages = Message.onReadMessageSuccess(
                                            oApproveReject,
                                            DocumentNumber
                                        );
                                        if (messages.length > 0) {
                                            oThat.onState(messages.length, "count");
                                            var oModel = new JSONModel(messages);
                                            oThat.getView().setModel(oModel, "message");
                                            // oThat.onMessageStrip(messages);
                                            if (
                                                sessionStorage.getItem("messages") === null ||
                                                sessionStorage.getItem("messages") === "null"
                                            ) {
                                                sessionStorage.setItem("messages",JSON.stringify(messages));
                                            } else {
                                                var messagesSessionStorage = JSON.parse(
                                                    sessionStorage.getItem("messages")
                                                );
                                                var cantidadData = messagesSessionStorage.length;
                                                messagesSessionStorage = messagesSessionStorage.concat(messages);
                                                sessionStorage.setItem("messages",JSON.stringify(messagesSessionStorage));
                                            }
                                        } else {
                                            MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("sSaveCorrect"));
                                        }

                                        // carga a ArchiveLink
                                        sap.ui.core.BusyIndicator.show(0);
                                        var oPayload = {
                                            Prnotpurchaseorderid: PRNotPurchaseOrderID,
                                            Modulo: "FI",
                                            PRNotPODocsSet: []
                                        };
                                        oThat.oPayload = oPayload;
                                        var aBlobFiles = [];
                                        var oUploadFile = oThat.getView().getModel("UploadFile").getData();
                                        Object.keys(oUploadFile).forEach((sKey) => {
                                            if (oUploadFile[sKey]) {
                                                aBlobFiles.push(oThat.onDowloadFileArchiveLink(sKey));
                                            }
                                        });
                                        Promise.all(aBlobFiles).then(function (aBlob) {
                                            function readBlob(aBlob) {
                                                if (aBlob.length > 0) {
                                                    var oBlob = aBlob.pop();
                                                    var reader = new FileReader();
                                                    reader.onloadend = function () {
                                                        oThat.base64String = reader.result;
                                                        var base64 = oThat.base64String.split(",")[1];
                                                        oThat.oPayload.PRNotPODocsSet.push({
                                                            Prnotpurchaseorderid: PRNotPurchaseOrderID,
                                                            Bas64: base64,
                                                            Nombre: oBlob.fileName,
                                                            Exten: oBlob.fileName.substring(oBlob.fileName.lastIndexOf(".") + 1).toUpperCase(),
                                                            Return: "",
                                                        });
                                                        readBlob(aBlob);
                                                    };
                                                    reader.readAsDataURL(oBlob.blob);
                                                } else {
                                                    oThat.uploadFilesToArchiveLink(oModelGeneral, "PRNotPONewSet", oThat.oPayload).then(function (oResult) {
                                                        console.log(oResult);
                                                        MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("msgAnexosGuardadosArchiveLink"));
                                                        sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                                                        sap.ui.core.BusyIndicator.hide();
                                                    }).catch(function (oError) {
                                                        console.log(oError);
                                                        MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("msgErrorCargaArchiveLink"));
                                                        sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                                                        sap.ui.core.BusyIndicator.hide();
                                                    });
                                                }
                                            }
                                            var aBlobFiles = [];
                                            aBlob.forEach((aBlob) => {
                                                aBlobFiles = aBlobFiles.concat(aBlob);
                                            });
                                            readBlob(aBlobFiles);
                                        }).catch(function (o) {
                                            console.log(o);
                                            sap.ui.core.BusyIndicator.hide();
                                        });
                                    }).catch(function (oError) {
                                        // sessionStorage.setItem("messages", null);
                                        var messages = Message.onReadMessageError(oError, DocumentNumber);
                                        if (messages.length > 0) {
                                            oThat.onState(messages.length, "count");
                                            var oModel = new JSONModel(messages);
                                            oThat.getView().setModel(oModel, "message");
                                            // oThat.onMessageStrip(messages);
                                            if (
                                                sessionStorage.getItem("messages") === null ||
                                                sessionStorage.getItem("messages") === "null"
                                            ) {
                                                sessionStorage.setItem("messages", JSON.stringify(messages));
                                            } else {
                                                var messagesSessionStorage = JSON.parse(
                                                    sessionStorage.getItem("messages")
                                                );
                                                var cantidadData = messagesSessionStorage.length;
                                                messagesSessionStorage = messagesSessionStorage.concat(messages);
                                                sessionStorage.setItem(
                                                    "messages",
                                                    JSON.stringify(messagesSessionStorage)
                                                );
                                            }
                                        } else {
                                            oThat.onErrorMessage(oError, "sErrorReject");
                                        }
                                        sap.ui.core.BusyIndicator.hide();
                                    });
                                },
                                error: function (errMsg) {
                                    console.log(errMsg.statusText);
                                },
                                contentType: "application/json",
                            });
                        })
                        .catch(function (oError) {
                            console.log("error");
                            sap.ui.core.BusyIndicator.hide();
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Mostrar los botones del masivo y su logica.
            onGetButtonsMassive: function () {
                try {
                    if (
                        $.getComponentDataMyInbox !== undefined &&
                        $.getComponentDataMyInbox.startupParameters.hasOwnProperty("taskModel")
                    ) {
                        var sIdPrincipal = document.getElementById("application-WorkflowTask-DisplayMyInbox-content");
                        if (!sIdPrincipal) {
                            // FLP Sandbox
                            sIdPrincipal = document.getElementById("application-fioriHtmlBuilder-display-content");
                        }
                        var sIdList = $("div[id$='--list']")[0].id;
                        var sBar = document.querySelectorAll("footer.sapMPageFooter")[0].firstChild.id;
                        oThat.IdListMaster = sIdList;
                        sap.ui
                            .getCore()
                            .byId(sIdList)
                            .attachSelectionChange(function (oData, oEvent, oListener) {
                                if (oData.oSource.oPropagatedProperties.oModels.undefined.aTaskDefinitionIDFilterKeys) {
                                    if (
                                        oData.oSource.oPropagatedProperties.oModels.undefined.aTaskDefinitionIDFilterKeys[0].split(
                                            "@"
                                        )[1] === "wfsuppliers"
                                    ) {
                                        var aItems = sap.ui.getCore().byId(sIdList).getSelectedItems();
                                        if (aItems.length > 0) {
                                            if (aItems[0].getParent().getMode() === "MultiSelect") {
                                                if (sap.ui.getCore().byId("PositiveCustom") === undefined) {
                                                    sap.ui
                                                        .getCore()
                                                        .byId(sBar)
                                                        .addContentLeft(
                                                            new sap.m.Button("PositiveCustom", {
                                                                text: oThat
                                                                    .getView()
                                                                    .getModel("i18n")
                                                                    .getResourceBundle()
                                                                    .getText("btnApprove"),
                                                                type: "Accept",
                                                                visible: false,
                                                                press: function (oEvent) {
                                                                    var aSelectedItems = sap.ui
                                                                        .getCore()
                                                                        .byId(sIdList)
                                                                        .getSelectedItems();
                                                                    var aItems = [];

                                                                    for (var i = 0; i < aSelectedItems.length; i++) {
                                                                        var oSelectedItem = aSelectedItems[i]
                                                                            .getBindingContext()
                                                                            .getObject();
                                                                        aItems.push(oSelectedItem);
                                                                    }
                                                                    BusyIndicator.show(0);

                                                                    function positiveItems(aItems) {
                                                                        if (aItems.length > 0) {
                                                                            // var oItems = aItems.pop();
                                                                            // oThat._triggerComplete(oItems.InstanceID, true).then(function (resolve) {
                                                                            // 	positiveItems(aItems);
                                                                            // });
                                                                            sessionStorage.setItem("messages", null);
                                                                            $.each(aItems, function (k, v) {
                                                                                Workflow.onGetContextWorkflow(v)
                                                                                    .then(function (oContextWorkflow) {
                                                                                        oThat.onApproveRejectRequestBP(
                                                                                            "A",
                                                                                            "",
                                                                                            oContextWorkflow
                                                                                                .bpRequestData
                                                                                                .BPREQUESTID,
                                                                                            oContextWorkflow
                                                                                                .bpRequestData
                                                                                                .DOCUMENTNUMBER
                                                                                        );
                                                                                    })
                                                                                    .catch(function (oError) {
                                                                                        oThat.onErrorMessage(
                                                                                            oError,
                                                                                            "errorSave"
                                                                                        );
                                                                                    })
                                                                                    .finally(function () {
                                                                                        sap.ui.core.BusyIndicator.hide();
                                                                                    });
                                                                            });
                                                                        } else {
                                                                            BusyIndicator.hide();
                                                                        }
                                                                    }
                                                                    positiveItems(aItems);
                                                                },
                                                            })
                                                        );
                                                }
                                                if (sap.ui.getCore().byId("RejectCustom") === undefined) {
                                                    sap.ui
                                                        .getCore()
                                                        .byId(sBar)
                                                        .addContentLeft(
                                                            new sap.m.Button("RejectCustom", {
                                                                text: oThat
                                                                    .getView()
                                                                    .getModel("i18n")
                                                                    .getResourceBundle()
                                                                    .getText("btnReject"),
                                                                type: "Reject",
                                                                visible: false,
                                                                press: function (oEvent) {
                                                                    var aSelectedItems = sap.ui
                                                                        .getCore()
                                                                        .byId(sIdList)
                                                                        .getSelectedItems();
                                                                    var aItems = [];

                                                                    for (var i = 0; i < aSelectedItems.length; i++) {
                                                                        var oSelectedItem = aSelectedItems[i]
                                                                            .getBindingContext()
                                                                            .getObject();
                                                                        aItems.push(oSelectedItem);
                                                                    }
                                                                    BusyIndicator.show(0);

                                                                    function positiveItems(aItems) {
                                                                        if (aItems.length > 0) {
                                                                            // var oItems = aItems.pop();
                                                                            // oThat._triggerComplete(oItems.InstanceID, false).then(function (resolve) {
                                                                            // 	positiveItems(aItems);
                                                                            // });
                                                                            oThat.onRejectRequestBPMasivo(aItems);
                                                                        } else {
                                                                            BusyIndicator.hide();
                                                                        }
                                                                    }
                                                                    positiveItems(aItems);
                                                                },
                                                            })
                                                        );
                                                }
                                                if (sap.ui.getCore().byId("RejectCustom") !== undefined) {
                                                    sap.ui.getCore().byId("RejectCustom").setVisible(false);
                                                }
                                                if (sap.ui.getCore().byId("PositiveCustom") !== undefined) {
                                                    sap.ui.getCore().byId("PositiveCustom").setVisible(false);
                                                }
                                                if (
                                                    aItems.length > 0 &&
                                                    sap.ui.getCore().byId("RejectCustom") !== undefined &&
                                                    sap.ui.getCore().byId("PositiveCustom") !== undefined
                                                ) {
                                                    sap.ui.getCore().byId("RejectCustom").setVisible(true);
                                                    sap.ui.getCore().byId("PositiveCustom").setVisible(true);
                                                }
                                            } else {
                                                if (sap.ui.getCore().byId("RejectCustom") !== undefined) {
                                                    sap.ui.getCore().byId("RejectCustom").setVisible(false);
                                                }
                                                if (sap.ui.getCore().byId("PositiveCustom") !== undefined) {
                                                    sap.ui.getCore().byId("PositiveCustom").setVisible(false);
                                                }
                                            }
                                        }
                                    } else {
                                        MessageToast.show(formatter.onGetI18nText(oThat, "sMassiveFalse"));
                                    }
                                }
                            });
                    }
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },

            // Ocultar botones de Visualizar log, Reclamar y compartir.
            onHiddenButtonsFooter: function () {
                var sIdPrincipal = document.getElementById("application-WorkflowTask-DisplayMyInbox-content");
                if (!sIdPrincipal) {
                    // FLP Sandbox
                    sIdPrincipal = document.getElementById("application-fioriHtmlBuilder-display-content");
                }
                var iNumber = 2;
                if (this.getView().getModel("device").getData().system.phone) {
                    iNumber = 1;
                }
                var sButtons =
                    document.querySelectorAll("footer.sapMPageFooter")[iNumber].firstElementChild.childNodes[2];

                var sButtonLog = $("[id$='--LogButtonID']")[0].id;
                var sButtonLogParts = sButtonLog.split("--")[1];
                if (sButtonLogParts) {
                    if (sButtonLogParts === "LogButtonID") {
                        var sButtonLog = sButtons.childNodes[0].dataset.sapUi;
                        var sButtonClaim = sButtons.childNodes[1].id;
                        var sButtonShare = sButtons.childNodes[2].dataset.sapUi;
                    } else {
                        var sButtonLog = sButtons.childNodes[3].dataset.sapUi;
                        var sButtonClaim = sButtons.childNodes[4].id;
                        var sButtonShare = sButtons.childNodes[6].dataset.sapUi;
                    }
                }

                sap.ui.getCore().byId(sButtonLog).setVisible(false);
                document.getElementById(sButtonClaim).setAttribute("visible", false);
                sap.ui.getCore().byId(sButtonShare).setVisible(false);
            },

            onSupplierRucLiveChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();
                sValue = sValue.replace(/[^\d]/g, "");
                oInput.setValue(sValue);
            },

            onSupplierRucChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sInputRuc = oInput.getValue();

                oThat
                    .updateSupplierRuc(sInputRuc)
                    .then(() => {
                        oInput.setValueState("Success");
                    })
                    .catch(() => {
                        oInput.setValueState("Error");
                    });
            },
            onSelectSunatCheck: function (oEvent) {
                const bSelected = oEvent.getSource().getSelected();
                //const bSelected = oEvent.getParameter("selected");

                const oDataUploadFile = oThat.getView().getModel("UploadFile");
                if (oDataUploadFile.getData().XML != "") {
                    oDataUploadFile.getData().XML = "";
                    oDataUploadFile.refresh(true);

                    const oDataFile = oThat.getView().getModel("file");
                    const n = oDataFile.getData().findIndex((x) => {
                        return x.Id == "XML";
                    });
                    if (n !== -1) {
                        oDataFile.getData().splice(n);
                    }
                    oDataFile.refresh(true);
                }


            },
            onElectronicSupplierCheck: function (oEvent) {
                const bSelected = oEvent.getParameter("selected");
                // Cambio MediFarma, para que si se deshabilita proveedor electrónico se deshabilite SUNAT
                oThat.getView().byId("chkSunat").setSelected(bSelected);
                if (bSelected) {
                    oThat.onState(true, "xmlVisible");
                    // No se listan los documentos de Usuario Generico cuando el check está desmarcado
                } else {
                    oThat.onState(false, "xmlVisible");

                    // Limpiar modelos
                    const oDataUploadFile = oThat.getView().getModel("UploadFile");
                    oDataUploadFile.getData().XML = "";
                    oDataUploadFile.refresh(true);

                    const oDataFile = oThat.getView().getModel("file");
                    const n = oDataFile.getData().findIndex((x) => {
                        return x.Id == "XML";
                    });
                    if (n !== -1) {
                        oDataFile.getData().splice(n);
                    }
                    oDataFile.refresh(true);
                }

                const oDataGeneral = oThat.getView().getModel("DataGeneral");
                oThat.setDocumentClassData(!oDataGeneral.getData().CheckElectronicSupplier);
            },

            updateSupplierRuc: function (sRuc) {
                return new Promise((resolve, reject) => {
                    const oDataGeneral = oThat.getView().getModel("DataGeneral");
                    oDataGeneral.getData().Ruc = sRuc;

                    // Buscar Razón Social desde ERP para el RUC obtenido en el XML
                    if (sRuc) {
                        const sPath = oModelGeneral.createKey("/SupplierSet", {
                            Application: "INVOICEREGISTERNOTOC",
                            Ruc: sRuc,
                        });

                        Service.consult(oModelGeneral, sPath)
                            .then((oRucInfo) => {
                                console.log(oRucInfo);
                                oDataGeneral.getData().SupplierName = oRucInfo.RazonSocial;
                                resolve();
                            })
                            .catch(function (oError) {
                                MessageToast.show(
                                    formatter.onGetI18nText(oThat, "msgErrorSupplierRucERP") + " " + sRuc
                                );
                                oDataGeneral.getData().SupplierName = "";
                                reject();
                            })
                            .finally(function () {
                                // sap.ui.core.BusyIndicator.hide();
                                oDataGeneral.refresh(true);
                            });
                    } else {
                        oDataGeneral.getData().SupplierName = "";
                        oDataGeneral.refresh(true);
                        reject();
                    }
                });
            },
            // Aprobar o rechazar la solicitud.
            onApproveRejectRequestBP: function (status, comment, BPRequestID, DocumentNumber) {
                try {
                    var that = this;
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onRefreshToken(oModelGeneral)
                        .then(function (oRefresh) {
                            var oContext = oThat.getView().getModel("contextData");
                            var oData = {
                                WFStatus: status,
                                WFCreatedByUser: sCreatedByUser,
                                WFUserComment: comment,
                            };

                            $.ajax({
                                type: "GET",
                                url: that.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/xsrf-token"),
                                headers: {
                                    "X-CSRF-Token": "Fetch",
                                },
                                success: function (data, statusText, xhr) {
                                    console.log(xhr.getResponseHeader("X-CSRF-Token"));
                                    Service.onApproveRequestBP(oModelGeneral, oData, "BPRequestSet", BPRequestID)
                                        .then(function (oApproveReject) {
                                            // sessionStorage.setItem("messages", null);
                                            //Workflow.onRefreshTask();
                                            MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectApproveReject"));
                                            var messages = Message.onReadMessageSuccess(oApproveReject, DocumentNumber);
                                            if (messages.length > 0) {
                                                oThat.onState(messages.length, "count");
                                                var oModel = new JSONModel(messages);
                                                oThat.getView().setModel(oModel, "message");
                                                // oThat.onMessageStrip(messages);
                                                if (
                                                    sessionStorage.getItem("messages") === null ||
                                                    sessionStorage.getItem("messages") === "null"
                                                ) {
                                                    sessionStorage.setItem("messages", JSON.stringify(messages));
                                                } else {
                                                    var messagesSessionStorage = JSON.parse(
                                                        sessionStorage.getItem("messages")
                                                    );
                                                    var cantidadData = messagesSessionStorage.length;
                                                    messagesSessionStorage = messagesSessionStorage.concat(messages);
                                                    sessionStorage.setItem(
                                                        "messages",
                                                        JSON.stringify(messagesSessionStorage)
                                                    );
                                                }
                                            } else {
                                                MessageBox.success(
                                                    oThat
                                                        .getView()
                                                        .getModel("i18n")
                                                        .getResourceBundle()
                                                        .getText("sSaveCorrect")
                                                );
                                            }
                                            sap.ui.core.BusyIndicator.hide();
                                        })
                                        .catch(function (oError) {
                                            // sessionStorage.setItem("messages", null);
                                            var messages = Message.onReadMessageError(oError, DocumentNumber);
                                            if (messages.length > 0) {
                                                oThat.onState(messages.length, "count");
                                                var oModel = new JSONModel(messages);
                                                oThat.getView().setModel(oModel, "message");
                                                // oThat.onMessageStrip(messages);
                                                if (
                                                    sessionStorage.getItem("messages") === null ||
                                                    sessionStorage.getItem("messages") === "null"
                                                ) {
                                                    sessionStorage.setItem("messages", JSON.stringify(messages));
                                                } else {
                                                    var messagesSessionStorage = JSON.parse(
                                                        sessionStorage.getItem("messages")
                                                    );
                                                    var cantidadData = messagesSessionStorage.length;
                                                    messagesSessionStorage = messagesSessionStorage.concat(messages);
                                                    sessionStorage.setItem(
                                                        "messages",
                                                        JSON.stringify(messagesSessionStorage)
                                                    );
                                                }
                                            } else {
                                                oThat.onErrorMessage(oError, "sErrorReject");
                                            }
                                            sap.ui.core.BusyIndicator.hide();
                                        })
                                        .finally(function (err) {
                                            // OJO: Probar con el otro refresh!.
                                            sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                                            //	Workflow.onRefreshTask();
                                            // sap.ui.core.BusyIndicator.hide();
                                        });
                                },
                                error: function (errMsg) {
                                    console.log(errMsg.statusText);
                                },
                                contentType: "application/json",
                            });
                        })
                        .catch(function (oError) {
                            console.log("error");
                            sap.ui.core.BusyIndicator.hide();
                        })
                        .finally(function () {
                            // sap.ui.core.BusyIndicator.hide();
                        });
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },
            // Comentario para el rechazo masivo.
            onRejectRequestBPMasivo: function (aItems) {
                try {
                    MessageBox.confirm(
                        oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelRequest"),
                        {
                            title: oThat.getView().getModel("i18n").getResourceBundle().getText("rjConfirm"),
                            actions: ["Si", "No"],
                            onClose: function (sActionClicked) {
                                if (sActionClicked === "Si") {
                                    var dialog = new Dialog({
                                        title: oThat
                                            .getView()
                                            .getModel("i18n")
                                            .getResourceBundle()
                                            .getText("rjComment"),
                                        type: "Message",
                                        //actions: ["Aceptar", "Cancelar"],
                                        content: [
                                            new Label({
                                                text: oThat
                                                    .getView()
                                                    .getModel("i18n")
                                                    .getResourceBundle()
                                                    .getText("reCancelMotivo"),
                                                labelFor: "textarea",
                                            }),
                                            new TextArea("textarea", {
                                                liveChange: function (oEvent) {
                                                    MotivoNotificacionMasivo = oEvent.getParameter("value");
                                                    var parent = oEvent.getSource().getParent();

                                                    parent
                                                        .getBeginButton()
                                                        .setEnabled(MotivoNotificacionMasivo.length > 0);
                                                },
                                                width: "100%",
                                                placeholder: oThat
                                                    .getView()
                                                    .getModel("i18n")
                                                    .getResourceBundle()
                                                    .getText("phrjComment"),
                                                rows: 5,
                                                cols: 20,
                                                maxLength: 40,
                                                //value: v1.COMMENTS
                                            }),
                                        ],
                                        beginButton: new Button({
                                            text: oThat
                                                .getView()
                                                .getModel("i18n")
                                                .getResourceBundle()
                                                .getText("btnAccept"),
                                            enabled: false,
                                            press: function () {
                                                dialog.close();
                                                sessionStorage.setItem("messages", null);
                                                $.each(aItems, function (k, v) {
                                                    Workflow.onGetContextWorkflow(v)
                                                        .then(function (oContextWorkflow) {
                                                            oThat.onApproveRejectRequestBP(
                                                                "R",
                                                                MotivoNotificacionMasivo,
                                                                oContextWorkflow.bpRequestData.BPREQUESTID,
                                                                oContextWorkflow.bpRequestData.DOCUMENTNUMBER
                                                            );
                                                        })
                                                        .catch(function (oError) {
                                                            oThat.onErrorMessage(oError, "errorSave");
                                                        })
                                                        .finally(function () {
                                                            sap.ui.core.BusyIndicator.hide();
                                                        });
                                                });
                                                sap.ui.core.BusyIndicator.hide();
                                            },
                                        }),
                                        endButton: new Button({
                                            text: oThat
                                                .getView()
                                                .getModel("i18n")
                                                .getResourceBundle()
                                                .getText("btnCancel"),
                                            press: function () {
                                                dialog.close();
                                                sap.ui.core.BusyIndicator.hide();
                                            },
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                            sap.ui.core.BusyIndicator.hide();
                                        },
                                    });
                                    dialog.open();
                                } else {
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            },
                        }
                    );
                } catch (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }
            },
            getDateRoute: function (d) {
                if (d == undefined) {
                    d = new Date();
                }
                let month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                return [year, month, day].join('/');
            },
            setSunatVariables: function (that) {
                let jData = {
                    "numRuc": "",
                    "codComp": "",
                    "numeroSerie": "",
                    "numero": "",
                    "fechaEmision": "",
                    "monto": "",
                    "numRucAcreedor": ""
                };
                that.getView().setModel(new sap.ui.model.json.JSONModel(jData), "sunatVariables");
            },
            setSunatVariablesAprobador: function (oData) {
                var that = this;
                // TODO: Revisar!!! esta en duro
                let DocumentClass = that.tipoDocumento(oData.DocumentClass);
                let jData = {
                    "numRuc": oData.Ruc,
                    "codComp": DocumentClass,
                    "numeroSerie": oData.VoucherNumber.split("-")[1],
                    "numero": oData.VoucherNumber.split("-")[2],
                    "fechaEmision": oData.InvoiceDate,
                    "monto": oData.Amount,
                    "numRucAcreedor": that.getRuc(oData.Company)
                };
                that.getView().setModel(new sap.ui.model.json.JSONModel(jData), "sunatVariables");
            },
            tipoDocumento: function (tipo) {
                let type = "";
                switch (tipo) {
                    case PREFIX_SUNAT.BOLETA:
                        type = "R1"; //Recibo por Honorarios
                        break;
                    case PREFIX_SUNAT.NOTA_CREDITO:
                        type = "07"; //NC
                        break;
                    case PREFIX_SUNAT.FACTURA:
                        type = "01"; //Factura
                        break;
                    case PREFIX_SUNAT.NOTA_DEBITO:
                        type = "08"; //ND
                        break;
                    default: ""
                        break;
                }
                return type;
            },
            getRuc: function (Bukrs) {
                let sociedades = [
                    {
                        "Bukrs": "1110",
                        "Butxt": "Kallpa GeneraciÃ³n S.A.",
                        "CompanyNif": "20538810682"
                    },
                    {
                        "Bukrs": "1120",
                        "Butxt": "Orazul Energy PerÃº S.A.",
                        "CompanyNif": "20601605385"
                    },
                    {
                        "Bukrs": "1130",
                        "Butxt": "Samay I S.A.",
                        "CompanyNif": "20537698889"
                    },
                    {
                        "Bukrs": "1140",
                        "Butxt": "AguaytÃ­a Energy del PerÃº",
                        "CompanyNif": "20297660536"
                    },
                    {
                        "Bukrs": "1150",
                        "Butxt": "Termoselva S.R.L.",
                        "CompanyNif": "20352427081"
                    }
                ];
                let sociedad = sociedades.filter(function (e) { return (e.Bukrs === Bukrs) });
                if (sociedad.length > 0)
                    return sociedad[0].CompanyNif;
                else
                    return "20538810682";
            },
            validateSUNAT: function (oModel) {
                //var url = '/ParameterSet(Application=\'SCP_SUPPLIERS\',Group1=\'INVOICEREG_NOTOC\',Field=\'SUNAT_VALIDATION\',Sequence=\'1\')';
                var filters = [];
                filters.push(new Filter("Application", "EQ", 'SCP_SUPPLIERS'));
                filters.push(new Filter("Group1", "EQ", 'INVOICEREG_NOTOC'));
                filters.push(new Filter("Field", "EQ", 'SUNAT_VALIDATION'));
                filters.push(new Filter("Sequence", "EQ", '1'));

                return Service.onGetDataGeneralFilters(oModel, 'ParameterSet', filters);
            },
            setAreaData: function (oModel) {
                Service.onGetDataGeneral(oModel, 'AreaSet').then((data) => {
                    oThat.getView().setModel(new sap.ui.model.json.JSONModel(data.results), "listArea")
                })
                    .catch(function (oError) {
                        MessageToast.show(
                            formatter.onGetI18nText(oThat, "msgErrorAreas")
                        );
                    })
                    .finally(function () {

                    });
            },
            lockApproveRejectButtons: function (oButton) {
                oButton.setEnabled(false);
            },

            // AR3 - Upload collection methods
            toggleFunctionality: function (oUploadCollectionModel, bActive) {
                oUploadCollectionModel.setProperty("/uploadEnabled", bActive);
                oUploadCollectionModel.setProperty("/uploadButtonInvisible", bActive);
                oUploadCollectionModel.setProperty("/enableDelete", bActive);
                oUploadCollectionModel.setProperty("/visibleDelete", bActive);
            },

            onOpenUploadCollection: function (oEvent) {
                if (!this.oUploadCollectionDialog) {
                    this.oUploadCollectionDialog = sap.ui.xmlfragment("com.everis.suppliers.invoiceregisternotoc.view.dialog.UploadCollectionDialog", this);
                }

                //to get access to the controller's model
                this.getView().addDependent(this.oUploadCollectionDialog);
                this.oUploadCollectionDialog.setBindingContext(new sap.ui.model.Context(
                    this.getView().getModel("UploadCollectionModel"),
                    "UploadCollectionModel"
                ));
                this.oUploadCollectionDialog.open();
            },

            onCloseDialog: function (oEvent) {
                this.oUploadCollectionDialog.close();
            },

            onChange: function (oEvent) {
                debugger
                var aFiles = Array.from(oEvent.getParameter("files"));
                var oUploadCollectionModel = this.getView().getModel("UploadCollectionModel");
                var aUploadCollectionFiles = oUploadCollectionModel.getData().items;
                var aDataFile = oThat.getView().getModel("file").getData();
                var aDataFolder = oThat.getView().getModel("folder").getData();
                var that = this;
                function readFiles(index) {
                    if (aFiles.length === index) return;
                    var oNewFile = aFiles[index];
                    var oExistingFile = aUploadCollectionFiles.find((oFile) => {
                        return oFile.fileName === oNewFile.name
                    });
                    if (!oExistingFile) {
                        aUploadCollectionFiles.push({
                            fileName: oNewFile.name
                        });
                        oUploadCollectionModel.refresh();
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                            that.onSaveModelFile(e, aDataFolder, "AR3", oNewFile, aDataFile);
                            readFiles(index + 1);
                        }
                        reader.readAsArrayBuffer(oNewFile);
                    } else {
                        readFiles(index + 1);
                    }
                }
                readFiles(0);
            },

            onFileDeleted: function (oEvent) {
                debugger
                var sFilename = oEvent.getParameter("item").getFileName();
                var oUploadCollectionModel = this.getView().getModel("UploadCollectionModel");
                var aUploadCollectionFiles = oUploadCollectionModel.getData().items;
                var oDataFileModel = oThat.getView().getModel("file");
                var aDataFile = oDataFileModel.getData();
                aUploadCollectionFiles.forEach((oFile, index) => {
                    if (oFile.fileName === sFilename) {
                        aUploadCollectionFiles.splice(index, 1);
                    }
                });
                oUploadCollectionModel.refresh();
                aDataFile.forEach((oItem, index) => {
                    if (oItem.FolderName === "AR3" && oItem.FileName === sFilename) {
                        aDataFile.splice(index, 1);
                    }
                });
                oDataFileModel.refresh();
            },

            onFileSizeExceed: function (oEvent) {
                debugger
                var oFile = oEvent.getParameter("files")[0]; // siempre es el primero en disparar el evento
                var oUploadCollectionModel = this.getView().getModel("UploadCollectionModel");
                var aUploadCollectionMaxFileSize = oUploadCollectionModel.getData().maximumFileSize;
                MessageToast.show(
                    `${formatter.onGetI18nText(this, "msgErrorFileSizeExceed")} (${aUploadCollectionMaxFileSize}MB): ${oFile.name} [${Math.floor(oFile.fileSize*100)/100}MB]`
                );
            },

            onTypeMissmatch: function (oEvent) {
                debugger
                var oFile = oEvent.getParameter("files")[0]; // siempre es el primero en disparar el evento
                MessageToast.show(
                    `${formatter.onGetI18nText(this, "msgErrorTypeMissmatch")} ${oFile.fileType}`
                );
            }
            // AR3 - Upload collection methods
        });

    }
);
