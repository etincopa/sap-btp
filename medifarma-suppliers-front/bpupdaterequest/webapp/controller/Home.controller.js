sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../service/Service",
    "../service/SharePoint",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/SimpleType",
    "sap/ui/core/Fragment",
    "com/everis/suppliers/bpupdaterequest/model/formatter",
    "../service/Workflow",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "sap/ui/core/library",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/Button", 
    "../service/Message",
    "sap/m/MessageItem",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "com/everis/suppliers/bpupdaterequest/model/models"
], function (Controller, JSONModel, MessageBox, MessageToast, Service, SharePoint, BusyIndicator, SimpleType, Fragment, formatter,
    Workflow, MessagePopover, MessagePopoverItem, coreLibrary, Dialog, Label, Text, TextArea, Button, Message, MessageItem, Filter,
    Sorter, models) {
    "use strict";
    var oThat,
        oModelGeneral, oModelUtil,
        fragmentsPath = "com.everis.suppliers.bpupdaterequest.view",
        oListMasterGeneral = [],
        sEstado = "I",
        sCreatedByUser = "",
        sNumeroDoc="",
        aGroups=[],
        aGroupsAdmin=[],

        countRechazado = 0, //Master Solicitudes Rechazados
        countOtros = 0, //Master Solicitudes Otros status

        MotivoNotificacion = "",
        MotivoNotificacionMasivo = "",
        flagValidator = true,
        sUri = "",
        sAmbient = "",
        sProject = "",
        AssociatedAccountConst = "",
        AccountNumberConst = "",
        KeyControl = "",
        PaymentConditionConst = "",
        RelationshipCategoryConst = "",
        CountryIdConst = "";
    const oBankAction = {
        create: "Crear",
        read: "Mostrar",
        update: "Actualizar",
        delete: "Eliminar"
    };
    return Controller.extend("com.everis.suppliers.bpcreationrequest.controller.Home", {
        formatter: formatter,
        onInit: function () {
            oThat = this;
            Workflow.setManifestObject(oThat);
            sEstado = "I";
            oModelGeneral = this.getOwnerComponent().getModel("SUPPLIERS_SRV");
            oModelUtil = this.getOwnerComponent().getModel("UTILS_SRV");
            this.onIniciatorEnabledVisible();

            this.onIniciatorModels();
            //expira cada 12 horas
            this.uri = sUri; //"https://prueba92.sharepoint.com/sites/Everis_SCP/_api/web/";
            this.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");

            this.onGetData();
            this.onGetButtonsMassive();
            
            this.initConfig();

            // Obtener el usuario del IAS.
            this.readUserIasInfo().then((data) => {
                sCreatedByUser = data.Resources[0].userName;
                // sCreatedByUser = data.Resources[0].emails[0].value; //Solo desarrollo
                aGroups = data.Resources[0].groups;

                aGroupsAdmin = aGroups.filter(function (item) {
                    if (item.value.toUpperCase().indexOf("GRP_SUPPLIERS_ADMIN") > -1) {
                        return item;
                    }
                });

                let oGrupoAprobador = aGroups.find(function (item) {
                    if (item.display.toUpperCase().indexOf("PROVEEDORES_BP_APROBADOR") > -1) {
                        return item;
                    }
                });

                if(aGroupsAdmin.length > 0) {
                    
                } else {
                    var aAttributes = data.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                    if (aAttributes !== undefined) {
                        //name: "customAttribute1"
                        sNumeroDoc = data.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                    } else if (!oGrupoAprobador) {
                        MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("sErrorIASCustomAttributeRUC"));
                    }
                    var oDataGeneral = this.getView().getModel("DataGeneral");

                    oDataGeneral.getData().DocumentNumber = sNumeroDoc;
                    oDataGeneral.refresh(true);
                    //this.getView().byId(iptDocumentNumber);
                    
                   
                }
                this.onCreatedList();
            });
        },

        initConfig: function() {
            // TEST: Turn on Test mode when executed from localhost or (BAS) workspaces
            var bTestModeOn = window.location.host.includes("localhost");
            if(!bTestModeOn) {
                bTestModeOn = window.location.host.includes("workspaces-ws");
            }

            // Set configuration values
            this.oConfigModel = new JSONModel({
                testModeOn: bTestModeOn
            });

            if (bTestModeOn) {
                this._activateTestOptions();
            }
        },

        _activateTestOptions: function() {
            const btn1 = this.getView().byId("btnTestSave");
            const btn2 = this.getView().byId("btnTestRetrieve");
            btn1.setVisible(true);
            btn2.setVisible(true);
        },

        _deactivateTestOptions: function() {
            const btn1 = this.getView().byId("btnTestSave");
            const btn2 = this.getView().byId("btnTestRetrieve");
            btn1.setVisible(false);
            btn2.setVisible(false);
        },

        onAfterRendering: function () {
            try {
                var sIdSplit = oThat.createId("idsplit");
                var oSplit = document.getElementById(sIdSplit);
                var oChild = oSplit.firstElementChild;
                var startupParameters = $.getComponentDataMyInbox === undefined ? undefined : $.getComponentDataMyInbox.startupParameters;
                //valida si entra por el workflow
                oThat.myInbox = false;
                if (startupParameters !== undefined && startupParameters.hasOwnProperty("taskModel")) {
                    oChild.style.display = "none";
                } else {
                    oChild.style.display = "block";
                }
                var oModelUtils = oThat.getOwnerComponent().getModel("UTILS_SRV");
                var aFilters = [];
                aFilters.push(new Filter("Application", "EQ", 'SCP_SUPPLIERS'));
                aFilters.push(new Filter("Group1", "EQ", 'BPREQUEST'));
                aFilters.push(new Filter("Field", "EQ", 'BANCO_NACION_ID'));
                aFilters.push(new Filter("Sequence", "EQ", '1'));
   
               Promise.all([Service.onGetDataGeneralFilters(oModelUtils,'ParameterSet', aFilters)]).then((values) => {
                   oThat.aBancoNacion =  values;
               });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onConstanstInitial: function () {
            try {
                var oDataContactPerson = oThat.getView().getModel("DataContactPerson"),
                    oDataSociety = oThat.getView().getModel("DataSociety"),
                    oDataPurchaseOrg = oThat.getView().getModel("DataPurchaseOrg");

                oDataContactPerson.getData().RelationshipCategory = RelationshipCategoryConst;
                oDataContactPerson.refresh(true);

                oDataSociety.getData().PaymentCondition = PaymentConditionConst;
                oDataSociety.refresh(true);

                oDataPurchaseOrg.getData().PaymentCondition = PaymentConditionConst;
                oDataPurchaseOrg.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Inicializador de modelos de las tablas de los tabs.
        onIniciatorEnabledVisible: function () {
            oThat.onState(false, "generalPanel");
            oThat.onState(true, "general");
            oThat.onState(true, "requestValidation");
            oThat.onState(false, "requestValidationEdit");
            oThat.onState(true, "AddNewRequestBP");
            oThat.onState(false, "address");
            oThat.onState(false, "region");
            oThat.onState(true, "iconAdd");
            oThat.onState(false, "iconMinus");
            oThat.onState(false, "claveBanco");
            oThat.onState(false, "account");
            oThat.onState(true, "claveBancoRequired");
            oThat.onState(false, "timeLine");
            oThat.onState(false, "ubigeo");
            oThat.onState(true, "documentNumber");
            oThat.onState(false, "ubigeoRequired");
            oThat.onState(0, "count");
            oThat.onState(true, "requiredForLocal");
        },

        // Inicializador de modelos de las tablas de los tabs.
        onIniciatorModels: function () {
            var oModel = new JSONModel([]);
            var oModelB = new JSONModel([]);
            var oModelCP = new JSONModel([]);
            var oModelS = new JSONModel([]);
            var oModelPO = new JSONModel([]);
            var oModelFile = new JSONModel([]);
            var oModelFolder = new JSONModel([{
                Id: "DJ",
                Name: "DJ"
            }, {
                Id: "SR",
                Name: "SR"
            }, {
                Id: "EC",
                Name: "EC"
            }]);
            var oModelNameFile = new JSONModel({
                DJ: "",
                SR: "",
                EC: ""
            });
            var oModelSearch = new JSONModel({
                value: ""
            });
            //Modelo donde se guardaran los datos de la tabla de Emails
            oThat.getView().setModel(oModel, "listEmails");
            //Modelo donde se guardaran los datos de la tabla de Banco
            oThat.getView().setModel(oModelB, "listBanks");
            //Modelo donde se guardaran los datos de la tabla de Persona de contacto
            oThat.getView().setModel(oModelCP, "listContactPerson");
            //Modelo donde se guardaran los datos de la tabla de Sociedad
            oThat.getView().setModel(oModelSearch, "search");
            //Modelo donde se guardara la informacion del historial o time line
            oThat.getView().setModel(oModel, "listTimeLine");
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

        // Boton + para visualizar 3 campos mas sobre la direccion.
        onGetMoreAddress: function (oEvent) {
            var sIcon = oEvent.getSource().getSrc().split("//")[1];

            if (sIcon === "add") {
                oThat.onState(true, "address");
                oThat.onState(false, "iconAdd");
                oThat.onState(true, "iconMinus");
            } else {
                oThat.onState(false, "address");
                oThat.onState(true, "iconAdd");
                oThat.onState(false, "iconMinus");
            }
        },

        // Levantar el fragmento para agregar relacionados.
        onAddRelated: function () {
            if (!oThat.oRelated) {
                oThat.oRelated = sap.ui.xmlfragment("frgFormEstable", fragmentsPath + ".dialog.AddRelated", oThat);
                oThat.getView().addDependent(oThat.oRelated);
            }
            oThat.oRelated.open();
        },

        // Cerrar el fragmento de relacionados.
        onCancel: function () {
            oThat.oRelated.close();
        },

        // Borrar todos los combos
        onAddRequestBP: function () {
            MessageBox.confirm(
                oThat.getView().getModel("i18n").getResourceBundle().getText("confirmAddNewRequest"), {
                styleClass: "sapUiSizeCompact",
                Actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === "YES" || oAction === "OK" ) {
                        // Enabled en su forma inicial.
                        oThat.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");
                        oThat.onIniciatorEnabledVisible();
                        oThat.onCleanDataGeneral();
                        oThat.onCleanDataSuppliers();
                        oThat.onCleanDataBank();
                        oThat.onCleanDataContactPerson();
                        oThat.onCleanDataSociety();
                        oThat.onCleanDataPurchaseOrg();
                        oThat.onIniciatorModels();
                        oThat.sFullPath = undefined;
                        flagValidator = true;
                        sEstado = "I";
                        oThat.onGetAssociatedAccount();
                        
                        
                    }
                }
            }
            );
        },

        // Borrar la Data General
        onCleanDataGeneral: function () {
            var oDataGeneral = oThat.getView().getModel("DataGeneral");
            oDataGeneral.getData().BPGrouping = "";
            oDataGeneral.getData().DocumentType = "";
            if(sNumeroDoc){
                oDataGeneral.getData().DocumentNumber = sNumeroDoc;
            } else {
                oDataGeneral.getData().DocumentNumber = "";
            }
            
            oDataGeneral.getData().PersonType = 0;
            oDataGeneral.getData().Name = "";
            oDataGeneral.getData().Name2 = "";
            oDataGeneral.getData().Street = "";
            oDataGeneral.getData().StreetNumber = "";
            oDataGeneral.getData().District = "";
            oDataGeneral.getData().City = "";
            oDataGeneral.getData().Country = "";
            oDataGeneral.getData().Region = "";
            oDataGeneral.getData().Ubigee = "";
            oDataGeneral.getData().PostalCode = "";
            oDataGeneral.getData().TaxLocation = "";
            oDataGeneral.getData().Street2 = "";
            oDataGeneral.getData().Industry = "";
            oDataGeneral.getData().SearchName = "";
            oDataGeneral.getData().Commentary = "";
            oDataGeneral.getData().Language = "";
            oDataGeneral.refresh(true);
        },

        // Borrar tab de datos de proveedores.
        onCleanDataSuppliers: function () {
            var oDataSuppliers = oThat.getView().getModel("DataSuppliers");
            oDataSuppliers.getData().Phone = "";
            oDataSuppliers.getData().MobilePhone = "";
            oDataSuppliers.getData().Email = "";
            oDataSuppliers.getData().Commentary = "";
            oDataSuppliers.refresh(true);
        },

        // Borrar tab de banco.
        onCleanDataBank: function () {
            var oDataBank = oThat.getView().getModel("DataBank");
            oDataBank.getData().CountryID = "";
            oDataBank.getData().BankID = "";
            oDataBank.getData().BankDescription = "";
            oDataBank.getData().AccountNumber = "";
            oDataBank.getData().AccountType = "";
            oDataBank.getData().AccountDescription = "";
            oDataBank.getData().Currency = "";
            oDataBank.getData().CurrencyDescription = "";
            oDataBank.getData().ReferenceNumber = "";
            oDataBank.refresh(true);
            oThat.onState(false, "claveBanco");
            oThat.onState(true, "documentNumber");
        },

        // Borrar tab de persona de contacto.
        onCleanDataContactPerson: function () {
            var oDataContactPerson = oThat.getView().getModel("DataContactPerson");
            oDataContactPerson.getData().ContactPersonID = "";
            oDataContactPerson.getData().Name = "";
            oDataContactPerson.getData().Lastname = "";
            oDataContactPerson.getData().Phone = "";
            oDataContactPerson.getData().MobilePhone = "";
            oDataContactPerson.getData().Email = "";
            oDataContactPerson.getData().Commentary = "";
            oDataContactPerson.refresh(true);
        },

        // Borrar tab de Sociedad.
        onCleanDataSociety: function () {
            var oDataSociety = oThat.getView().getModel("DataSociety");
            oDataSociety.getData().CompanyID = "";
            oDataSociety.getData().CompanyDescription = "";
            oDataSociety.getData().AccountID = "";
            oDataSociety.getData().AccountDescription = "";
            // oDataSociety.getData().PaymentMethod = "";
            // oDataSociety.getData().PaymentMethodDescription = "";
            oDataSociety.getData().WithholdingTaxCodes = [];
            oDataSociety.refresh(true);
        },

        // Borrar tab de Sociedad.
        onCleanDataPurchaseOrg: function () {
            var oDataPurchaseOrg = oThat.getView().getModel("DataPurchaseOrg");
            oDataPurchaseOrg.getData().PurchasingOrganizationID = "";
            oDataPurchaseOrg.getData().PurcOrganizationDescription = "";
            oDataPurchaseOrg.getData().POCurrency = "";
            oDataPurchaseOrg.getData().POCurrencyDescription = "";
            oDataPurchaseOrg.getData().oDataPurchaseOrg = "";
            oDataPurchaseOrg.getData().Incoterms = "";
            oDataPurchaseOrg.getData().IncotermsDescription = "";
            oDataPurchaseOrg.refresh(true);
        },
        onClearButtons: function (sActions){
            /* Validar opciones de boton segun registros*/

            var bIsAdmin = aGroupsAdmin.length > 0 ? true : false;
            oThat.onState(true, "requestValidation");
            oThat.onState(false, "requestValidationEdit");
            oThat.onState(true, "AddNewRequestBP");
            
            if(sActions == "ITEMSELECT") {
                oThat.onState(false, "general");

                if(bIsAdmin) {
                    oThat.onState(false, "requestValidation");
                } else {
                    oThat.onState(false, "AddNewRequestBP");
                    oThat.onState(true, "requestValidationEdit");
                    oThat.onState(false, "requestValidation");
                }
            } else {

                if(bIsAdmin) {
                    
                } else {
                    if(countOtros > 0 || countRechazado > 0){
                        oThat.onState(false, "requestValidation");
                        oThat.onState(false, "AddNewRequestBP");
                    } else {

                    }
                }
            }       
            
        },

        // Crear la lista de posiciones.
        onCreatedList: function () {
            sap.ui.core.BusyIndicator.show(0);
            try {

                var aFilterUser = [];
                
                if(aGroupsAdmin.length > 0){
                    // Si es GRP_SUPPLIERS_ADMIN
                    //Si es ADMINISTRADOR, obtener todas las solicitudes WF

                } else {
                    //Si no es ADMINISTRADOR, obtener solo las solicitudes creadar por el usuario y numero documento asociado
                    
                    // if(sNumeroDoc){
                    //     aFilterUser.push(new Filter("DocumentNumber", "EQ", sNumeroDoc.toUpperCase()));
                    // } else {
                        aFilterUser.push(new Filter("WFCreatedByUser", "EQ", sCreatedByUser.toUpperCase()));
                    // }
                }


                countRechazado = 0; //Master Solicitudes Rechazados
                countOtros = 0; //Master Solicitudes Otros status

                Service.onGetDataGeneralFilters(oModelGeneral, "BPRequestChangeSet", aFilterUser).then(function (oListMaster) {
                    var master = oThat.getView().byId("idLista");
                    var oListDocumentType = oThat.getView().getModel("listDocumentType");
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

                        if (v.WFCreatedByTimestamp) {
                            v.WFCreatedByTimestampFormat = formatter.onGetFormatDate(v.WFCreatedByTimestamp);
                        } else {
                            v.WFCreatedByTimestampFormat = "";
                        }

                        if(v.WFStatus != "R") {
                            countOtros++;
                        } else {
                            countRechazado++;
                        }

                        var oFilterDocumentType = [];
                        oFilterDocumentType = oListDocumentType.getData().filter(function (item) {
                            if (item.DocumentTypeID === v.DocumentType) {
                                return item;
                            }
                        });
                        if (oFilterDocumentType.length > 0) {
                            v.DocumentTypeDescription = oFilterDocumentType[0].Description;
                        }
                    });

                    oListMasterGeneral = oListMaster.results;
                    var oModel = new JSONModel(oListMaster.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMaster");


                    var aSorter = [];
                    var oSorter = new Sorter({
                        path: 'RequestedOnDate', 
                        descending: true
                    });

                    aSorter.push(oSorter);
                    var oIdLista = oThat.getView().byId("idLista");
                    var oIdListaItems = oIdLista.getBinding("items");
                    oIdListaItems.sort(aSorter);

                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onSelectedFirstItem: function() {
            var bIsAdmin = aGroupsAdmin.length > 0 ? true : false;
            if(!bIsAdmin){
                try{
                    var oIdLista = oThat.getView().byId("idLista");
                    if (oIdLista.getItems().length > 0) {
                        var sBPRequestChangeID = oIdLista.getItems()[0].getBindingContext("listMaster").getObject().BPRequestChangeID;
                        oThat.onGetServiceRequestBP(sBPRequestChangeID);
                        oThat.onClearButtons("ITEMSELECT");
                        oIdLista.setSelectedItem(oIdLista.getItems()[0], true /*selected*/, false /*fire event*/);
                    }
                } catch (oError) {
                    console.log(oError);
                    oThat.onClearButtons("INIT");
                }
            }
        },

        // Leer datos de prueba.
        onGetTimeLine: function () {
            var sPath = sap.ui.require.toUrl("com/everis/suppliers/bpupdaterequest/model/uploadCollection.json");
            var oModel = new JSONModel(sPath);
            oThat.getView().setModel(oModel, "listTimeLine");
        },

        // Obtener la Data de Datos Generales y de los Tabs
        onGetData: function () {
            try {
                oThat.onGetConstants().then(function (oConstants) {
                    var oModel = new JSONModel(oConstants.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listConstants");

                    //Se obtiene la ruta de almacenamiento de archivos
                    var sValue = oConstants.results.find(oItem => {
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
                        if (v.Field === "BPREQUEST") {
                            sProject = v.ValueLow;
                        }
                        if (v.Field === "ASSOCIATED_ACCOUNT") {
                            AssociatedAccountConst = v.ValueLow;
                        }
                        if (v.Field === "ACCOUNT_NUMBER") {
                            AccountNumberConst = v.ValueLow;
                        }
                        if (v.Field === "KEY_CONTROL") {
                            KeyControl = v.ValueLow;
                        }
                        if (v.Field === "PAYMENT_CONDITION") {
                            PaymentConditionConst = v.ValueLow;
                        }
                        if (v.Field === "RELATIONSHIP_CATEGORY") {
                            RelationshipCategoryConst = v.ValueLow;
                        }
                        if (v.Field === "COUNTRYID") {
                            CountryIdConst = v.ValueLow;
                        }

                    });
                    oThat.onConstanstInitial();
                    oThat.onGetDocumentType().then(resultado => oThat.onGetCountry())
                        .then(resultado => oThat.onGetRamo()).then(resultado => oThat.onGetLanguage())
                        .then(resultado => oThat.onGetRelationShip()).then(resultado => oThat.onGetPayCondition())
                        .then(resultado => oThat.onGetSociety()).then(resultado => oThat.onGetPayMethod())
                        .then(resultado => oThat.onGetPurchaseOrg()).then(resultado => oThat.onGetIncoterms())
                        .then(resultado => oThat.onGetTypeTaxes()).then(resultado => oThat.onGetTypeAccount())
                        .then(resultado => oThat.onGetOrderCurrency()).then(resultado => oThat.onGetGrouping())
                        .then(resultado => oThat.onGetDistrict()).then(resultado => oThat.onGetCity())
                        .then(resultado => oThat.onGetTimeLine()).then(resultado => oThat.onGetCoin())
                        .then(resultado => {
                            oThat.onGetMyInbox($.getComponentDataMyInbox);
                            oThat.onGetDataOfNavigation();
                        }).then(resultado => {
                            oThat.onSelectedFirstItem();
                        });
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });

                //Obtiene el token
                Service.consult(oModelGeneral, "read", "/SPTokenSet('INVOICE')", "", "").then(response => {
                    BusyIndicator.hide();
                    oThat.bearer = response.Token;
                    if (response.Token.length === 0) {
                        MessageBox.error(formatter.onGetI18nText(oThat, "msgNotToken"));
                    }
                }).catch(err => {
                    MessageBox.error(formatter.onGetI18nText(oThat, "msgNotToken"));
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener la lista del combo de Tipo de Documento de los Datos Generales
        onGetDocumentType: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPDocumentTypeSet").then(function (oDocumentType) {
                    var oModel = new JSONModel(oDocumentType.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listDocumentType");
                    resolve(oDocumentType);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(reject);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del combo de Pais para los Datos Generales y el tab de Bancos
        onGetCountry: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "CountrySet").then(function (oCountry) {
                    var oModel = new JSONModel(oCountry.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listCountry");
                    resolve(oCountry);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista de Region de los Datos Generales
        onGetRegion: function (read) {
            try {
                if (read && read !== true) {
                    if (read.getParameters().value !== "") {
                        read.getSource().setValueState("Success");
                        read.getSource().setValueStateText("");
                    }
                }
                var DataGeneral = oThat.getView().getModel("DataGeneral");
                var DataAssociate = oThat.getView().getModel("associatedAccount");
                if (DataAssociate !== undefined && DataAssociate.getData().Country !== "") {
                    sap.ui.core.BusyIndicator.show(0);
                    Service.onGetDataCountryAsociation(oModelGeneral, "CountrySet", DataAssociate.getData().Country, "Regions").then(function (oRegion) {
                        var oModelR = new JSONModel(oRegion.results);
                        oModelR.setSizeLimit(999999999);
                        oThat.getView().setModel(oModelR, "listRegion");

                        oThat.onState(false, "ubigeo");
                        var oModel = new JSONModel([]);
                        oThat.getView().setModel(oModel, "listUbigeo");
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    }).finally(function () {
                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    oThat.onState(false, "region");
                    var oModel = new JSONModel([]);
                    oThat.getView().setModel(oModel, "listRegion");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener la lista del combo de Ramo de los Datos Generales
        onGetRamo: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPIndustrySet").then(function (oRamo) {
                    var oModel = new JSONModel(oRamo.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listRamo");
                    resolve(oRamo);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del combo de Idioma de los Datos Generales
        onGetLanguage: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPLanguageSet").then(function (oLanguage) {
                    var oModel = new JSONModel(oLanguage.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listLanguage");
                    resolve(oLanguage);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del combo de Funcion del tab de Persona de Contacto
        onGetRelationShip: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPRelationshipCategorySet").then(function (oRelation) {
                    var oModel = new JSONModel(oRelation.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listRelation");
                    resolve(oRelation);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del combo de Clave de Banco del tab de Bancos
        onGetBank: function () {
            try {
                sap.ui.core.BusyIndicator.show(0);
                var DataBank = oThat.getView().getModel("DataBank");
                var associatedAccount = oThat.getView().getModel("associatedAccount");
                if (DataBank.getData().CountryID !== "" || associatedAccount.getData().Country !== "") {
                    var iCountryId = (DataBank.getData().CountryID !== "") ? DataBank.getData().CountryID : associatedAccount.getData().Country;
                    if (iCountryId === CountryIdConst) {
                        oThat.onState(true, "claveBancoRequired");
                    } else {
                        oThat.onState(false, "claveBancoRequired");
                    }
                    Service.onGetDataCountryAsociation(oModelGeneral, "CountrySet", iCountryId, "Banks").then(function (oBank) {
                        oThat.onState(true, "claveBanco");
                        var oModel = new JSONModel(oBank.results);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "listBank");
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    }).finally(function () {
                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    oThat.onState(false, "claveBanco");
                    var oModel = new JSONModel([]);
                    oThat.getView().setModel(oModel, "listBank");
                    sap.ui.core.BusyIndicator.hide();
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener la lista del Matchcode de Condicion de pago del tab de Sociedad
        onGetPayCondition: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPPaymentConditionSet").then(function (oPayCondition) {
                    var oModel = new JSONModel(oPayCondition.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPayCondition");
                    resolve(oPayCondition);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del combo de Sociedad del tab de Sociedad
        onGetSociety: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPCompanySet").then(function (oSociety) {
                    var oModel = new JSONModel(oSociety.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listSociety");
                    resolve(oSociety);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Matchcode de Cuenta asociada del tab de Sociedad
        onGetAssociatedAccount: function () {
            try {
                return new Promise(function (resolve, reject) {
                    var DataSociety = oThat.getView().getModel("DataSociety");
                    var DataGeneral = oThat.getView().getModel("DataGeneral");
                    if (sNumeroDoc !== "") {
                        sap.ui.core.BusyIndicator.show(0);
                        Service.onGetDataAccountAsociation(oModelGeneral, "BPGeneralDataSet", sNumeroDoc, "Banks,ContactPersons").then(function (
                            oAssociatedAccount) {
                            if (oAssociatedAccount) {
                                oThat.onState(true, "account");
                                if (oAssociatedAccount.PersonType === "2") {
                                    oAssociatedAccount.PersonType = 0;
                                } else {
                                    oAssociatedAccount.PersonType = 1;
                                }
                                var oModel = new JSONModel(oAssociatedAccount);
                                oModel.setSizeLimit(999999999);
                                oThat.getView().setModel(oModel, "associatedAccount");
                                
                                DataSociety.getData().AccountID = oAssociatedAccount.DocumentNumber;
                                DataSociety.getData().AccountDescription = oAssociatedAccount.Name;
                                
                                oThat.getView().setModel(oModel,"DataGeneral");
                                let listTypeAccount = oThat.getView().getModel("listTypeAccount").getData()
                                let aBanks = oAssociatedAccount.Banks.results;
                                for (var i= 0 ; i< aBanks.length; i++){
                                   let x =  aBanks[i].AccountType
                                   var oFindType = listTypeAccount.find(oItem => {
                                       if (oItem.BankAccountTypeID === x)
                                         return oItem.Description;
                                   });
                                   aBanks[i].AccountDescription = oFindType ? oFindType.Description : '';
                                   aBanks[i].Action = oBankAction.read;
                                }

                                oThat.getView().setModel(new JSONModel(aBanks),"listBanks");
                                oThat.getView().setModel(new JSONModel(oAssociatedAccount.ContactPersons.results),"listContactPerson")
                                oThat.onGetRegion();
                                oThat.onGetBank();
                            }
                            resolve(oAssociatedAccount);
                        }).catch(function (oError) {
                            oThat.onErrorMessage(oError, "errorSave");
                            reject(oError);
                        }).finally(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                    } else {
                        oThat.onState(false, "account");
                        var oModel = new JSONModel([]);
                        oThat.getView().setModel(oModel, "associatedAccount");
                        resolve("");
                    }
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener la lista del Matchcode de Incoterms del tab de Organizacion de compras
        onGetPayMethod: function () {
            try {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var oDataSociety = oThat.getView().getModel("DataSociety");
                    Service.onGetDataGeneral(oModelGeneral, "BPPaymentMethodSet").then(function (oPayMethod) {
                        $.each(oPayMethod.results, function (k, v) {
                            oDataSociety.getData().PaymentMethod += v.PaymentMethodID;
                            if (oPayMethod.results.length - 1 === k) {
                                oDataSociety.getData().PaymentMethodDescription += v.Description;
                            } else {
                                oDataSociety.getData().PaymentMethodDescription += v.Description + ", ";
                            }
                        });
                        var oModel = new JSONModel(oPayMethod.results);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "listPayMethod");
                        resolve(oPayMethod);
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                        sap.ui.core.BusyIndicator.hide();
                        reject(oError);
                    }).finally(function () {
                        // sap.ui.core.BusyIndicator.hide();
                    });
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener la lista del combo de Organizacion de compras del tab de Organizacion de compras
        onGetPurchaseOrg: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPPurchasingOrganizationSet").then(function (oPurchaseOrg) {
                    var oModel = new JSONModel(oPurchaseOrg.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPurchaseOrg");
                    resolve(oPurchaseOrg);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Matchcode de Incoterms del tab de Organizacion de compras
        onGetIncoterms: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPIncotermsSet").then(function (oIcoterms) {
                    var oModel = new JSONModel(oIcoterms.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "incoterms");
                    resolve(oIcoterms);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Matchcode de retenciones del tab de Sociedad, tipo de retencion.
        onGetTypeTaxes: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPWithholdingTaxTypeSet").then(function (oTypeTaxes) {
                    var oModel = new JSONModel(oTypeTaxes.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listTypeTaxes");
                    resolve(oTypeTaxes);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    // sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Matchcode del indicador de retenciones del tab de Sociedad, tipo de retencion.
        onGetIndicatorTaxes: function (oEvent) {
            try {
                return new Promise(function (resolve, reject) {
                    sap.ui.core.BusyIndicator.show(0);
                    var sSelected = oEvent.getSource().getSelectedKey();
                    var oComboSelected = oEvent.getSource().getParent();
                    var oCombo = oComboSelected.getCells()[1];

                    Service.onGetDataIndicatorTaxes(oModelGeneral, "BPWithholdingTaxTypeSet", CountryIdConst, sSelected, "WithholdingTaxCodes").then(
                        function (oIndicatorTaxes) {
                            var oModel = new JSONModel(oIndicatorTaxes.results);
                            oModel.setSizeLimit(999999999);

                            oCombo.setModel(oModel, "listIndicatorTaxes");
                            resolve(oIndicatorTaxes);
                        }).catch(function (oError) {
                            oThat.onErrorMessage(oError, "errorSave");
                            reject(oError);
                        }).finally(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Tabla Constantes
        // Obtener la lista del Combobox tipo de cuenta del tab de banco.
        onGetTypeAccount: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BankAccountTypeSet").then(function (oTypeAccount) {
                    var oModel = new JSONModel(oTypeAccount.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listTypeAccount");
                    resolve(oTypeAccount);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox Moneda de Pedido del tab de organizacion de compras.
        onGetOrderCurrency: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPPurchaseOrderCurrencySet").then(function (oOrderCurrency) {
                    var oModel = new JSONModel(oOrderCurrency.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listOrderCurrency");
                    resolve(oOrderCurrency);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox Agrupacion de los Datos Generales.
        onGetGrouping: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPGroupingSet").then(function (oGrouping) {
                    var oModel = new JSONModel(oGrouping.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listGrouping");
                    resolve(oGrouping);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox Distrito de los Datos Generales.
        onGetDistrict: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPDistrictSet").then(function (oDistrict) {
                    var oModel = new JSONModel(oDistrict.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listDistrict");
                    resolve(oDistrict);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox Poblacion de los Datos Generales.
        onGetCity: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BPCitySet").then(function (oPoblation) {
                    var oModel = new JSONModel(oPoblation.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPoblation");
                    resolve(oPoblation);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox de moneda del tab de Bancos.
        onGetCoin: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetDataGeneral(oModelGeneral, "BankCurrencySet").then(function (oCoin) {
                    var oModel = new JSONModel(oCoin.results);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listCoin");
                    resolve(oCoin);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                    sap.ui.core.BusyIndicator.hide();
                    reject(oError);
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        // Obtener la lista del Combobox de Ubigeo de los Datos Generales.
        onGetUbigeo: function (read) {
            try {
                sap.ui.core.BusyIndicator.show(0);
                var DataGeneral = oThat.getView().getModel("DataGeneral");
                if (DataGeneral.getData().Country === CountryIdConst && DataGeneral.getData().Region !== "") {
                    oThat.onState(true, "ubigeoRequired");
                    if (read && read !== true) {
                        if (read.getParameters().value !== "") {
                            read.getSource().setValueState("Success");
                            read.getSource().setValueStateText("");
                        }
                    }
                    var aFilterUser = [];
                    aFilterUser.push(new Filter("RegionID", "StartsWith", DataGeneral.getData().Region));
                    Service.onGetDataGeneralFilters(oModelGeneral, "BPUbigeeSet", aFilterUser).then(function (oUbigeo) {
                        // if (!oThat.myInbox) {
                        oThat.onState(true, "ubigeo");
                        // } else {
                        // DataGeneral.getData().Ubigee = "";
                        // }
                        if (read === true) {
                            oThat.onState(false, "ubigeo");
                        } else {
                            DataGeneral.getData().Ubigee = "";
                        }
                        DataGeneral.refresh(true);
                        var oModel = new JSONModel(oUbigeo.results);
                        oModel.setSizeLimit(999999999);
                        oThat.getView().setModel(oModel, "listUbigeo");
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    }).finally(function () {
                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    oThat.onState(false, "ubigeoRequired");
                    oThat.onState(false, "ubigeo");
                    var oModel = new JSONModel([]);
                    oThat.getView().setModel(oModel, "listUbigeo");
                    sap.ui.core.BusyIndicator.hide();
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener las constantes de SAP.
        onGetConstants: function () {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                var aFilterUser = [];
                aFilterUser.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
                aFilterUser.push(new Filter("Group1", "EQ", "BPREQUEST"));
                aFilterUser.push(new Filter("Group1", "EQ", "SHAREPOINT"));
                aFilterUser.push(new Filter("Field", "EQ", "URL"));
                aFilterUser.push(new Filter("Field", "EQ", "LANDSCAPE"));
                aFilterUser.push(new Filter("Field", "EQ", "ROOT_DIRECTORY"));
                aFilterUser.push(new Filter("Field", "EQ", "BPREQUEST"));
                aFilterUser.push(new Filter("Field", "EQ", "ASSOCIATED_ACCOUNT"));
                aFilterUser.push(new Filter("Field", "EQ", "ACCOUNT_NUMBER"));
                aFilterUser.push(new Filter("Field", "EQ", "KEY_CONTROL"));
                aFilterUser.push(new Filter("Field", "EQ", "PAYMENT_CONDITION"));
                aFilterUser.push(new Filter("Field", "EQ", "RELATIONSHIP_CATEGORY"));
                aFilterUser.push(new Filter("Field", "EQ", "COUNTRYID"));
                Service.onGetDataGeneralFilters(oModelGeneral, "ConfigurationSet", aFilterUser).then(function (oConstants) {
                    resolve(oConstants);
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        onAddTaxes: function () {
            try {
                var oDataSociety = oThat.getView().getModel("DataSociety"),
                    aData = oDataSociety.getProperty("/WithholdingTaxCodes");

                var sDatoAccountDescription = JSON.parse(JSON.stringify(oDataSociety.getData())).AccountDescription;
                oThat.listMultiTaxesCount = aData.length;
                if (aData.length === 0) {
                    var oTaxe = {
                        BPRequestChangeID: oThat.uuid,
                        CompanyID: "",
                        WithholdingTaxType: "",
                        WithholdingTaxCode: "",
                        WithholdingTaxTypeDesc: "",
                        WithholdingTaxCodeDesc: "",
                        SubjectToWithholding: ""
                    };

                    aData.push(oTaxe);
                    oThat.getView().getModel("DataSociety").refresh(true);
                    oDataSociety.getData().AccountDescription = sDatoAccountDescription;
                }

                if (!oThat.oTaxes) {
                    oThat.oTaxes = sap.ui.xmlfragment("frgAddTaxes", fragmentsPath + ".dialog.AddTaxes", oThat);
                    oThat.getView().addDependent(oThat.oTaxes);
                }
                oThat.oTaxes.open();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
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
                            MessageBox.error(oError.responseJSON.response.description);
                        }
                    }
                } else if (oError.message) {
                    MessageBox.error(oError.message);
                } else if (oError.responseText) {
                    try {
                        var oErrorRes = JSON.parse(oError.responseText);
                        MessageBox.error(oErrorRes.error_description);
                    } catch (error) {
                        MessageBox.error(oError.responseText);
                    }
                } else {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText(textoI18n));
                }
            } catch (oErrorT) {
                oThat.onErrorMessage(oErrorT, "errorSave");
            }
        },

        // Abrir Matchcode de Cuenta Asociada del tab de sociedad.
        onMatchCodeAssociatedAccount: function () {
            if (!oThat.oAssociatedAccount) {
                oThat.oAssociatedAccount = sap.ui.xmlfragment("frgAssociatedAccount", fragmentsPath + ".dialog.MatchCodeAssociatedAccount", oThat);
                oThat.getView().addDependent(oThat.oAssociatedAccount);
            }
            oThat.oAssociatedAccount.open();
            var oModel = new JSONModel({
                "AssociatedAccount": "",
                "ExplainText": ""
            });
            oThat.getView().setModel(oModel, "MatchAssociatedAccount");
        },

        // Cerrar Matchcode de Cuenta Asociada del tab de sociedad.
        onCancelMatchCodeAssociatedAccount: function () {
            var oModel = new JSONModel([]);
            oModel.setSizeLimit(999999999);
            oThat.getView().setModel(oModel, "listAssociatedAccount");
            oThat.oAssociatedAccount.close();
        },

        // Buscar dentro del Matchcode de Cuenta Asociada del tab de sociedad.
        onSearchAssociatedAccount: function () {
            try {
                var oDataAssociatedAccount = oThat.getView().getModel("associatedAccount");
                var oMatchAssociatedAccount = oThat.getView().getModel("MatchAssociatedAccount");
                var oModel;

                if (oMatchAssociatedAccount.getData().AssociatedAccount.trim() === "" && oMatchAssociatedAccount.getData().ExplainText.trim() ===
                    "") {
                    oModel = new JSONModel(oDataAssociatedAccount.getData());
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listAssociatedAccount");
                } else {
                    var oDataAssociatedAccountSimulate = JSON.parse(JSON.stringify(oDataAssociatedAccount.getData()));
                    var oFilter = oDataAssociatedAccountSimulate.filter(function (e) {
                        return e.CompanyAccountID.toUpperCase().includes(oMatchAssociatedAccount.getData().AssociatedAccount.toUpperCase()) === true &&
                            e.Description.toUpperCase().includes(
                                oMatchAssociatedAccount.getData().ExplainText.toUpperCase()) === true;
                    });

                    oModel = new JSONModel(oFilter);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listAssociatedAccount");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener datos del seleccionado del Matchcode de Cuenta Asociada del tab de sociedad.
        onConfirmMatchCodeAssociatedAccount: function (oEvent) {
            try {
                var oDataTbl = oEvent.getParameter("listItem").getBindingContext("listAssociatedAccount").getObject(),
                    oDataSociety = oThat.getView().getModel("DataSociety");

                oDataSociety.getData().AccountID = oDataTbl.CompanyAccountID;
                oDataSociety.getData().AccountDescription = oDataTbl.Description;
                oDataSociety.refresh(true);
                var oModel = new JSONModel([]);
                oModel.setSizeLimit(999999999);
                oThat.getView().setModel(oModel, "listAssociatedAccount");
                oThat.oAssociatedAccount.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Abrir Matchcode de Condicion de Pago del tab de sociedad.
        onMatchCodePayCondition: function () {
            if (!oThat.oPayCondition) {
                oThat.oPayCondition = sap.ui.xmlfragment("frgPayCondition", fragmentsPath + ".dialog.MatchCodePayCondition", oThat);
                oThat.getView().addDependent(oThat.oPayCondition);
            }
            oThat.oPayCondition.open();
            var oModel = new JSONModel({
                "PayCondition": "",
                "ExplainText": ""
            });
            oThat.getView().setModel(oModel, "MatchPayCondition");
        },

        // Cerrar Matchcode de Condicion de Pago del tab de sociedad.
        onCancelMatchCodePayCondition: function () {
            oThat.oPayCondition.close();
        },

        // Cambio Kallpa, no se esta usando por un cambio que quiere Kallpa.
        // Buscar dentro del Matchcode de Condicion de Pago del tab de sociedad.
        onSearchPayCondition: function () {
            try {
                var oDataPayCondition = oThat.getView().getModel("payCondition");
                var oMatchPayCondition = oThat.getView().getModel("MatchPayCondition");
                var oModel;

                if (oMatchPayCondition.getData().PayCondition.trim() === "" && oMatchPayCondition.getData().ExplainText.trim() === "") {
                    oModel = new JSONModel(oDataPayCondition.getData());
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPayCondition");
                } else {
                    var oDataPayConditionSimulate = JSON.parse(JSON.stringify(oDataPayCondition.getData()));
                    var oFilter = oDataPayConditionSimulate.filter(function (e) {
                        return e.PaymentConditionID.toUpperCase().includes(oMatchPayCondition.getData().PayCondition.toUpperCase()) === true && e.Description
                            .toUpperCase().includes(
                                oMatchPayCondition.getData().ExplainText.toUpperCase()) === true;
                    });

                    oModel = new JSONModel(oFilter);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPayCondition");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener datos del seleccionado del Matchcode de Condicion de Pago del tab de sociedad.
        onConfirmMatchCodePayCondition: function (oEvent) {
            try {
                var oDataTbl = oEvent.getParameter("listItem").getBindingContext("listPayCondition").getObject(),
                    oDataSociety = oThat.getView().getModel("DataSociety");

                oDataSociety.getData().PaymentCondition = oDataTbl.PaymentConditionID;
                oDataSociety.getData().PaymentConditionDescription = oDataTbl.Description;
                oDataSociety.refresh(true);
                oThat.oPayCondition.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Abrir Matchcode de Vias de Pago del tab de sociedad.
        onMatchCodePayMethod: function () {
            if (!oThat.oPayMethod) {
                oThat.oPayMethod = sap.ui.xmlfragment("frgPayMethod", fragmentsPath + ".dialog.MatchCodePayMethod", oThat);
                oThat.getView().addDependent(oThat.oPayMethod);
            }
            oThat.oPayMethod.open();
        },

        // Cerrar Matchcode de Vias de Pago del tab de sociedad.
        onCancelMatchCodePayMethod: function () {
            oThat.oPayMethod.close();
        },

        // Obtener datos del seleccionado del Matchcode de Vias de Pago del tab de sociedad.
        onConfirmMatchCodePayMethod: function () {
            try {
                var aDataTable = sap.ui.getCore().byId("frgPayMethod--tblPayMethod").getSelectedItems(),
                    oDataSociety = oThat.getView().getModel("DataSociety"),
                    sSeleccionados = "";
                $.each(aDataTable, function (k, v) {
                    sSeleccionados += v.getCells()[0].getText();
                });

                oDataSociety.getData().PaymentMethod = sSeleccionados;
                oDataSociety.refresh(true);
                oThat.oPayMethod.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Abrir Matchcode de Condicion de Pago del tab de Organizacion de compras.
        onMatchCodePayConditionPurchase: function () {
            if (!oThat.oPayConditionPurchase) {
                oThat.oPayConditionPurchase = sap.ui.xmlfragment("frgPayConditionPurchase", fragmentsPath +
                    ".dialog.MatchCodePayConditionPurchase",
                    oThat);
                oThat.getView().addDependent(oThat.oPayConditionPurchase);
            }
            oThat.oPayConditionPurchase.open();
            var oModel = new JSONModel({
                "PayCondition": "",
                "ExplainText": ""
            });
            oThat.getView().setModel(oModel, "MatchPayConditionPurchase");
        },

        // Cerrar Matchcode de Condicion de Pago del tab de Organizacion de compras.
        onCancelMatchCodePayConditionPurchase: function () {
            oThat.oPayConditionPurchase.close();
        },

        // Buscar dentro del Matchcode de Condicion de Pago del tab de Organizacion de compras.
        onSearchPayConditionPurchase: function () {
            try {
                var oDataPayCondition = oThat.getView().getModel("payCondition");
                var oMatchPayCondition = oThat.getView().getModel("MatchPayConditionPurchase");
                var oModel;

                if (oMatchPayCondition.getData().PayCondition.trim() === "" && oMatchPayCondition.getData().ExplainText.trim() === "") {
                    oModel = new JSONModel(oDataPayCondition.getData());
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPayConditionPurchase");
                } else {
                    var oDataPayConditionSimulate = JSON.parse(JSON.stringify(oDataPayCondition.getData()));
                    var oFilter = oDataPayConditionSimulate.filter(function (e) {
                        return e.PaymentConditionID.toUpperCase().includes(oMatchPayCondition.getData().PayCondition.toUpperCase()) === true && e.Description
                            .toUpperCase().includes(
                                oMatchPayCondition.getData().ExplainText.toUpperCase()) === true;
                    });

                    oModel = new JSONModel(oFilter);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listPayConditionPurchase");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener datos del seleccionado del Matchcode de Condicion de Pago del tab de Organizacion de compras.
        onConfirmMatchCodePayConditionPurchase: function (oEvent) {
            try {
                var oDataTbl = oEvent.getParameter("listItem").getBindingContext("listPayConditionPurchase").getObject(),
                    oDataPurchaseOrg = oThat.getView().getModel("DataPurchaseOrg");

                oDataPurchaseOrg.getData().PaymentCondition = oDataTbl.PaymentConditionID;
                oDataPurchaseOrg.refresh(true);
                oDataPurchaseOrg.getData().PaymentConditionDescription = oDataTbl.Description;
                oDataPurchaseOrg.refresh(true);
                oThat.oPayConditionPurchase.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Abrir Matchcode de Incoterms del tab de Organizacion de compras.
        onMatchCodeIncoterms: function () {
            if (!oThat.oIncoterms) {
                oThat.oIncoterms = sap.ui.xmlfragment("frgIncoterms", fragmentsPath + ".dialog.MatchCodeIncoterms", oThat);
                oThat.getView().addDependent(oThat.oIncoterms);
            }
            oThat.oIncoterms.open();
            var oModel = new JSONModel({
                "Incoterms": "",
                "ExplainText": ""
            });
            oThat.getView().setModel(oModel, "MatchIncoterms");
        },

        // Cerrar Matchcode de Incoterms del tab de Organizacion de compras.
        onCancelMatchCodeIncoterms: function () {
            oThat.oIncoterms.close();
        },

        // Buscar dentro del Matchcode de Incoterms del tab de Organizacion de compras.
        onSearchIncoterms: function () {
            try {
                var oDataIncoterms = oThat.getView().getModel("incoterms");
                var oMatchIncoterms = oThat.getView().getModel("MatchIncoterms");
                var oModel;

                if (oMatchIncoterms.getData().Incoterms.trim() === "" && oMatchIncoterms.getData().ExplainText.trim() === "") {
                    oModel = new JSONModel(oDataIncoterms.getData());
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listIncoterms");
                } else {
                    var oDataIncotermsSimulate = JSON.parse(JSON.stringify(oDataIncoterms.getData()));
                    var oFilter = oDataIncotermsSimulate.filter(function (e) {
                        return e.IncotermsID.toUpperCase().includes(oMatchIncoterms.getData().Incoterms.toUpperCase()) === true && e.Description.toUpperCase()
                            .includes(
                                oMatchIncoterms.getData().ExplainText.toUpperCase()) === true;
                    });

                    oModel = new JSONModel(oFilter);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listIncoterms");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Obtener datos del seleccionado del Matchcode de Incoterms del tab de Organizacion de compras.
        onConfirmMatchCodeIncoterms: function (oEvent) {
            try {
                var oDataTbl = oEvent.getParameter("listItem").getBindingContext("listIncoterms").getObject(),
                    oDataPurchaseOrg = oThat.getView().getModel("DataPurchaseOrg");

                oDataPurchaseOrg.getData().Incoterms = oDataTbl.IncotermsID;
                oDataPurchaseOrg.getData().IncotermsDescription = oDataTbl.Description;
                oDataPurchaseOrg.refresh(true);
                oThat.oIncoterms.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Agregar email a la tabla del tab de datos del proveedor.
        onAddEmail: function () {
            try {
                var oDataSuppliers = oThat.getView().getModel("DataSuppliers"),
                    oListEmails = oThat.getView().getModel("listEmails");
                if (oDataSuppliers.getData().Email !== "") {
                    var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (!oDataSuppliers.getData().Email.match(rexMail)) {
                        MessageBox.error(oDataSuppliers.getData().Email + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                            "sErrorEMail"));
                    } else {
                        oListEmails.getData().push({
                            "BPRequestChangeID": oThat.uuid,
                            "Email": oDataSuppliers.getData().Email,
                            "Commentary": oDataSuppliers.getData().Commentary
                        });

                        var oModel = new JSONModel(oListEmails.getData());
                        oThat.getView().setModel(oModel, "listEmails");
                        oDataSuppliers.getData().Email = "";
                        oDataSuppliers.getData().Commentary = "";
                        oDataSuppliers.refresh(true);
                    }
                } else {
                    if (oDataSuppliers.getData().Email === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidEmail"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Borrar Email de la tabla.
        onDeleteEmail: function (oEvent) {
            try {
                var oListEmails = oThat.getView().getModel("listEmails"),
                    sParent = oEvent.getSource().getParent(),
                    oEmail = sParent.oBindingContexts.listEmails,
                    sPath = oEmail.getPath().split("/")[1];

                oListEmails.getData().splice(sPath, 1);
                oListEmails.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
      
        onChangeClaveBanco: function(oEvent){
           var oThat = this;
           if(oEvent.oSource.mProperties.selectedKey === "018"){
               var tipoList = this.getView().getModel("listCoin").getData().filter(o => { return o.BankCurrencyID == 'DET'});
               this.getView().getModel("listCoin").setData(tipoList);
            }else{
                sap.ui.core.BusyIndicator.show(0);
                this.oModelGeneral = this.getOwnerComponent().getModel("SUPPLIERS_SRV");
                this.oModelGeneral.read("/BankCurrencySet" , {
                    async: false,
                    success: function(oCoin) {
                        oThat.getView().getModel("listCoin").setData(oCoin.results)
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function(n) {
                       console.log(n);
                    }
                });
            }    
        },

        // Agregar Bancos a la tabla del tab de Banco.
        onAddBank: function () {
            try {
                var oDataBank = oThat.getView().getModel("DataBank"),
                    oListBanks = oThat.getView().getModel("listBanks"),
                    flag = true;
                // if (!oThat.validateComercialBank(oThat.oModelUtil, oDataBank.getData())){
                //     MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidSameBank"));
                //     return;
                // }    
                // Cambio Kallpa, cuando sea Peru el pais que se escoge; debe ser obligatorio clave banco de los contrario es opcional.
                // Cambio Kallpa, Se agrego como obligatorio el numero CCI o Reference Number.
                var rexNumber = /^\d*$/;
                if (oDataBank.getData().CountryID === CountryIdConst) {
                    if ((!oDataBank.getData().AccountNumber.match(rexNumber) || !oDataBank.getData().ReferenceNumber.match(rexNumber)) && oDataBank.getData()
                        .AccountType !== KeyControl) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidDataGeneralNumberBank"));
                        flag = false;
                    } else {
                        if (oDataBank.getData().CountryID !== "" && oDataBank.getData().BankID !== "" && oDataBank.getData().AccountNumber !== "" &&
                            oDataBank.getData().AccountType !== "" && oDataBank.getData().Currency !== "") {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                } else {
                    if (!oDataBank.getData().AccountNumber.match(rexNumber) && oDataBank.getData().AccountType !== KeyControl) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidDataGeneralNumberBank"));
                        flag = false;
                    } else {
                        if (oDataBank.getData().CountryID !== "" && oDataBank.getData().AccountNumber !== "" &&
                            oDataBank.getData().AccountType !== "" && oDataBank.getData().Currency !== "") {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }

                if (oDataBank.getData().ReferenceNumber.length > 0 && oDataBank.getData().ReferenceNumber.length !== 20) {
                    flag = false;
                }

                if (oListBanks.getData().length !== 0) {
                    oListBanks.getData().map((oBank) => {
                        if (oBank.Currency == oDataBank.getData().Currency && oBank.Action !== oBankAction.delete) { 
                            MessageBox.warning(
                                `${oThat.getView().getModel("i18n").getResourceBundle().getText("sCoinAlreadyInUse")} ${oDataBank.getData().CurrencyDescription}`);
                            flag = false;
                            return;
                        }
                    });
                }

                if (flag) {
                    oListBanks.getData().push({
                        "BPRequestChangeID": oThat.uuid,
                        "CountryID": oDataBank.getData().CountryID,
                        "BankID": oDataBank.getData().BankID,
                        "BankDescription": oDataBank.getData().BankDescription,
                        "AccountNumber": oDataBank.getData().AccountNumber,
                        "AccountType": oDataBank.getData().AccountType,
                        "AccountDescription": oDataBank.getData().AccountDescription,
                        "Currency": oDataBank.getData().Currency,
                        "CurrencyDescription": oDataBank.getData().CurrencyDescription,
                        "ReferenceNumber": oDataBank.getData().ReferenceNumber,
                        "Action" : oBankAction.create
                    });

                    oListBanks.refresh(true);
                    oThat.onCleanDataBank();
                } else {
                    if (oDataBank.getData().CountryID === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCountry"));
                    } else if (oDataBank.getData().AccountNumber === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidAccountNumber"));
                    } else if (oDataBank.getData().AccountType === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidAccountType"));
                    } else if (oDataBank.getData().Currency === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCoin"));
                    }

                    if (oDataBank.getData().CountryID === CountryIdConst) {
                        if (oDataBank.getData().BankID === "") {
                            MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidBank"));
                        }
                    }

                    if (oDataBank.getData().ReferenceNumber.length > 0 && oDataBank.getData().ReferenceNumber.length !== 20) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidReferenceNumber"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Agregar Bancos a la tabla del tab de Banco.
        onUpdBank: function () {
            try {
                oThat.sBankAction === oBankAction.update;
                var oDataBank = oThat.getView().getModel("DataBank"),
                    oListBanks = oThat.getView().getModel("listBanks"),
                    flag = true;
                /*if (!oThat.validateComercialBank(oThat.oModelUtil, oDataBank.getData())){
                    MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidSameBank"));
                    return;
                } */   
                // Cambio Kallpa, cuando sea Peru el pais que se escoge; debe ser obligatorio clave banco de los contrario es opcional.
                var rexNumber = /^\d*$/;
                if (oDataBank.getData().CountryID === CountryIdConst) {
                    if ((!oDataBank.getData().AccountNumber.match(rexNumber)) && oDataBank.getData()
                        .AccountType !== KeyControl) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidDataGeneralNumberBank"));
                        flag = false;
                    } else {
                        if (oDataBank.getData().CountryID !== "" && oDataBank.getData().BankID !== "" && oDataBank.getData().AccountNumber !== "" &&
                            oDataBank.getData().AccountType !== "" && oDataBank.getData().Currency !== "") {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                } else {
                    if (!oDataBank.getData().AccountNumber.match(rexNumber) && oDataBank.getData().AccountType !== KeyControl) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidDataGeneralNumberBank"));
                        flag = false;
                    } else {
                        if (oDataBank.getData().CountryID !== "" && oDataBank.getData().AccountNumber !== "" &&
                            oDataBank.getData().AccountType !== "" && oDataBank.getData().Currency !== "") {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }

                if (oListBanks.getData().length !== 0) {
                    oListBanks.getData().map((oBank) => {
                        if (JSON.stringify(oBank) !== oThat.sSelectedBank && oBank.Action !== oBankAction.delete && oBank.Currency == oDataBank.getData().Currency) { 
                            MessageBox.warning(
                                `${oThat.getView().getModel("i18n").getResourceBundle().getText("sCoinAlreadyInUse")} ${oDataBank.getData().CurrencyDescription}`);
                            flag = false;
                            return;
                        }
                    });
                }

                if (oDataBank.getData().ReferenceNumber.length > 0 && oDataBank.getData().ReferenceNumber.length !== 20) {
                    flag = false;
                }

                if (flag) {
                    var aLiskBanks = oListBanks.getData();
                    var oItemReplace = {
                        "BPRequestChangeID": oThat.uuid,
                        "CountryID": oDataBank.getData().CountryID,
                        "BankID": oDataBank.getData().BankID,
                        "BankDescription": oDataBank.getData().BankDescription,
                        "AccountNumber": oDataBank.getData().AccountNumber,
                        "AccountType": oDataBank.getData().AccountType,
                        "AccountDescription": oDataBank.getData().AccountDescription,
                        "Currency": oDataBank.getData().Currency,
                        "CurrencyDescription": oDataBank.getData().CurrencyDescription,
                        "ReferenceNumber": oDataBank.getData().ReferenceNumber,
                        "Action" : oThat.sBankAction
                    };
                    var itemReplace = aLiskBanks.findIndex((oItem) => {
                        return oThat.sSelectedBank == JSON.stringify(oItem)
                    });
                    if (itemReplace < 0) {
                        aLiskBanks.push(oItemReplace);
                    } else {
                        aLiskBanks[itemReplace] = oItemReplace;
                    }
                    oListBanks.refresh(true);
                    oThat.onCleanDataBank();
                    this.byId("btnUpdBank").setEnabled(false);
                } else {
                    if (oDataBank.getData().CountryID === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCountry"));
                    } else if (oDataBank.getData().AccountNumber === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidAccountNumber"));
                    } else if (oDataBank.getData().AccountType === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidAccountType"));
                    } else if (oDataBank.getData().Currency === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCoin"));
                    }

                    if (oDataBank.getData().CountryID === CountryIdConst) {
                        if (oDataBank.getData().BankID === "") {
                            MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidBank"));
                        }
                    }

                    if (oDataBank.getData().ReferenceNumber.length > 0 && oDataBank.getData().ReferenceNumber.length !== 20) {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidReferenceNumber"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Borrar Banco de la tabla.
        onDeleteBank: function (oEvent) {
            try {
                var oListBanks = oThat.getView().getModel("listBanks"),
                    sParent = oEvent.getSource().getParent(), //row
                    oTable = sParent.getParent(),
                    sPath = sParent.getBindingContextPath("listBanks");

                oListBanks.setProperty(`${sPath}/Action`, oBankAction.delete);
                oListBanks.refresh(true);
                oTable.getBinding("items").filter([new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.NE, oBankAction.delete)]);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onAddNewBank: function () {
            try {
                oThat.sBankAction = oBankAction.create;
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onUpdateBank: function (oEvent) {
            try {
                var oListBanks = oThat.getView().getModel("listBanks"),
                    sParent = oEvent.getSource().getParent(), oBankUpd ={},
                    sPath = sParent.getBindingContextPath("listBanks");

                if (oListBanks.getData().length > 0){
                    Object.assign(oBankUpd, oListBanks.getProperty(sPath));
                    oThat.getView().setModel(new JSONModel(oBankUpd), "DataBank");
                }
                oListBanks.refresh(true);
                oThat.sBankAction = oBankAction.update;
                oThat.sSelectedBank = JSON.stringify(oBankUpd);
                this.byId("btnUpdBank").setEnabled(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Agregar Persona de contacto a la tabla del tab de persona de contacto.
        onAddContactPerson: function () {
            try {
                var oDataContactPerson = oThat.getView().getModel("DataContactPerson"),
                    oListContactPerson = oThat.getView().getModel("listContactPerson");

                if (oDataContactPerson.getData().Name !== "" && oDataContactPerson.getData().RelationshipCategory !== "" && oDataContactPerson.getData()
                    .MobilePhone !==
                    "" && oDataContactPerson.getData().Email !== "") {
                    var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (!oDataContactPerson.getData().Email.match(rexMail)) {
                        MessageBox.error(oDataContactPerson.getData().Email + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                            "sErrorEMail"));
                    } else {
                        oListContactPerson.getData().push({
                            "BPRequestChangeID": oThat.uuid,
                            "Name": oDataContactPerson.getData().Name,
                            "Lastname" :oDataContactPerson.getData().Lastname,
                            "Sexo" : oThat.byId("rbg1").getSelectedButton().getText(),
                            "RelationshipCategory": oDataContactPerson.getData().RelationshipCategory,
                            "RelationshipCategoryDescription": oDataContactPerson.getData().RelationshipCategoryDescription,
                            "Phone": oDataContactPerson.getData().Phone,
                            "MobilePhone": oDataContactPerson.getData().MobilePhone,
                            "Email": oDataContactPerson.getData().Email,
                            "Commentary": oDataContactPerson.getData().Commentary,
                            "Action" : 'Crear'
                        });

                        var oModel = new JSONModel(oListContactPerson.getData());
                        oThat.getView().setModel(oModel, "listContactPerson");
                        oThat.onCleanDataContactPerson();
                    }
                } else {
                    if (oDataContactPerson.getData().Name === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidName"));
                    } else if (oDataContactPerson.getData().RelationshipCategory === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidFunction"));
                    } else if (oDataContactPerson.getData().MobilePhone === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCellphone"));
                    } else if (oDataContactPerson.getData().Email === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidEmail"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Agregar Persona de contacto a la tabla del tab de persona de contacto.
        onUpdContactPerson: function () {
            try {
                var oDataContactPerson = oThat.getView().getModel("DataContactPerson"),
                    oListContactPerson = oThat.getView().getModel("listContactPerson"),
                    flag = true;
                if (oDataContactPerson.getData().Name !== "" && oDataContactPerson.getData().RelationshipCategory !== "" && oDataContactPerson.getData()
                    .MobilePhone !==
                    "" && oDataContactPerson.getData().Email !== "") {
                    var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (!oDataContactPerson.getData().Email.match(rexMail)) {
                        MessageBox.error(oDataContactPerson.getData().Email + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                            "sErrorEMail"));
                    } else {
                        var aListContactPerson = oListContactPerson.getData();
                        var oItemReplace = {
                            "BPRequestChangeID": oThat.uuid,
                            "ContactPersonID": oDataContactPerson.getData().BPRequestID,
                            "Name": oDataContactPerson.getData().Name,
                            "RelationshipCategory": oDataContactPerson.getData().RelationshipCategory,
                            "RelationshipCategoryDescription": oDataContactPerson.getData().RelationshipCategoryDescription,
                            "Phone": oDataContactPerson.getData().Phone,
                            "MobilePhone": oDataContactPerson.getData().MobilePhone,
                            "Email": oDataContactPerson.getData().Email,
                            "Commentary": oDataContactPerson.getData().Commentary,
                            "Action" : 'Crear',
                            "__metadata" : {id : oDataContactPerson.getData().__metadata.id}
                        };
                        var itemReplace = aListContactPerson.findIndex(oItem => oItem.__metadata.id === oDataContactPerson.getData().__metadata.id);
                        aListContactPerson[itemReplace] = oItemReplace;
                        
                        var oModel = new JSONModel(oListContactPerson.getData());
                        oThat.getView().setModel(oModel, "listContactPerson");
                        oThat.onCleanDataContactPerson();
                    }
                } else {
                    if (oDataContactPerson.getData().Name === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidName"));
                    } else if (oDataContactPerson.getData().RelationshipCategory === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidFunction"));
                    } else if (oDataContactPerson.getData().MobilePhone === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidCellphone"));
                    } else if (oDataContactPerson.getData().Email === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidEmail"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Borrar Persona de contacto de la tabla.
        onDeleteContactPerson: function (oEvent) {
            try {
                var oListContactPerson = oThat.getView().getModel("listContactPerson"),
                    sParent = oEvent.getSource().getParent(),
                    sPath = sParent.getBindingContextPath("listContactPerson"),
                    iIndex = sPath.split("/")[1];
                oListContactPerson.getData().splice(iIndex, 1);
                oListContactPerson.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Borrar Persona de contacto de la tabla.
        onUpdateContactPerson: function (oEvent) {
            try {
                var oListContactPerson = oThat.getView().getModel("listContactPerson"),
                    sParent = oEvent.getSource().getParent(), oContactUpd ={},
                    oContactPerson = sParent.oBindingContexts.listContactPerson;
                  
                    oContactPerson.getObject().Action = 'Editar';
                    if (oContactPerson.oModel.getData().length > 0){
                        Object.assign(oContactUpd ,oContactPerson.oModel.getData()[0]);
                        oThat.getView().setModel(new JSONModel(oContactUpd),"DataContactPerson")
                    }
                oListContactPerson.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        // Agregar Sociedad a la tabla del tab de Sociedad.
        onAddSociety: function () {
            try {
                var oDataSociety = oThat.getView().getModel("DataSociety"),
                    oListTblSociety = oThat.getView().getModel("listTblSociety");

                if (oDataSociety.getData().CompanyID !== "" && oDataSociety.getData().AccountID !== "" && oDataSociety.getData().PaymentCondition !==
                    "" && oDataSociety.getData().PaymentMethod !== "") {
                    $.each(oDataSociety.getData().WithholdingTaxCodes, function (k, v) {
                        v.CompanyID = oDataSociety.getData().CompanyID;
                    });
                    oListTblSociety.getData().push({
                        "BPRequestChangeID": oThat.uuid,
                        "CompanyID": oDataSociety.getData().CompanyID,
                        "CompanyDescription": oDataSociety.getData().CompanyDescription,
                        "AccountID": oDataSociety.getData().AccountID,
                        "AccountDescription": oDataSociety.getData().AccountDescription,
                        "PaymentCondition": oDataSociety.getData().PaymentCondition,
                        "PaymentConditionDescription": oDataSociety.getData().PaymentConditionDescription,
                        "PaymentMethod": oDataSociety.getData().PaymentMethod,
                        "PaymentMethodDescription": oDataSociety.getData().PaymentMethodDescription,
                        "WithholdingTaxCodes": oDataSociety.getData().WithholdingTaxCodes
                    });

                    var oModel = new JSONModel(oListTblSociety.getData());
                    oThat.getView().setModel(oModel, "listTblSociety");
                    oThat.onCleanDataSociety();
                    oThat.onState(false, "account");
                } else {
                    if (oDataSociety.getData().CompanyID === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidSociety"));
                    } else if (oDataSociety.getData().AccountID === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidAssociatedAccount"));
                    } else if (oDataSociety.getData().PaymentCondition === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidPayCondition"));
                    } else if (oDataSociety.getData().PaymentMethod === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidPayMethod"));
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Borrar Sociedad de la tabla.
        onDeleteSociety: function (oEvent) {
            try {
                var oListTblSociety = oThat.getView().getModel("listTblSociety"),
                    sParent = oEvent.getSource().getParent(),
                    oSociety = sParent.oBindingContexts.listTblSociety,
                    sPath = oSociety.getPath().split("/")[1];

                oListTblSociety.getData().splice(sPath, 1);
                oListTblSociety.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Agregar Organizacion de Compras a la tabla del tab de Organizacion de Compras.
        onAddPurchaseOrg: function () {
            try {
                var oDataPurchaseOrg = oThat.getView().getModel("DataPurchaseOrg"),
                    oListTblPurchaseOrg = oThat.getView().getModel("listTblPurchaseOrg");

                // Cambio Kallpa, se borro Incoterms como obligatorio.
                if (oDataPurchaseOrg.getData().PurchasingOrganizationID !== "" && oDataPurchaseOrg.getData().POCurrency !== "" && oDataPurchaseOrg
                    .getData()
                    .PaymentCondition !== "") {
                    oListTblPurchaseOrg.getData().push({
                        "BPRequestChangeID": oThat.uuid,
                        "PurchasingOrganizationID": oDataPurchaseOrg.getData().PurchasingOrganizationID,
                        "PurcOrganizationDescription": oDataPurchaseOrg.getData().PurcOrganizationDescription,
                        "POCurrency": oDataPurchaseOrg.getData().POCurrency,
                        "POCurrencyDescription": oDataPurchaseOrg.getData().POCurrencyDescription,
                        "PaymentCondition": oDataPurchaseOrg.getData().PaymentCondition,
                        "PaymentConditionDescription": oDataPurchaseOrg.getData().PaymentConditionDescription,
                        "Incoterms": oDataPurchaseOrg.getData().Incoterms,
                        "IncotermsDescription": oDataPurchaseOrg.getData().IncotermsDescription
                    });

                    var oModel = new JSONModel(oListTblPurchaseOrg.getData());
                    oThat.getView().setModel(oModel, "listTblPurchaseOrg");
                    oThat.onCleanDataPurchaseOrg();
                } else {
                    if (oDataPurchaseOrg.getData().PurchasingOrganizationID === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidPurchaseOrganization"));
                    } else if (oDataPurchaseOrg.getData().POCurrency === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidOrderCurrency"));
                    } else if (oDataPurchaseOrg.getData().PaymentCondition === "") {
                        MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValidPaymentTerms"));
                    }
                    // Cambio Kallpa.
                    // else if (oDataPurchaseOrg.getData().Incoterms === "") {
                    // 	MessageBox.warning(oThat.getView().getModel("i18n").getResourceBundle().getText("sValididIncoterms"));
                    // }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Borrar Sociedad de la tabla.
        onDeletePurchaseOrg: function (oEvent) {
            try {
                var oListTblPurchaseOrg = oThat.getView().getModel("listTblPurchaseOrg"),
                    sParent = oEvent.getSource().getParent(),
                    oPurchaseOrg = sParent.oBindingContexts.listTblPurchaseOrg,
                    sPath = oPurchaseOrg.getPath().split("/")[1];

                oListTblPurchaseOrg.getData().splice(sPath, 1);
                oListTblPurchaseOrg.refresh(true);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Mensaje de confirmacion para la creacion de la solicitud.
        onRequestBP: function () {
            try {
                MessageBox.confirm(
                    oThat.getView().getModel("i18n").getResourceBundle().getText("confirmRequest"), {
                    styleClass: "sapUiSizeCompact",
                    Actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === "YES" || oAction=== 'OK') {
                            var oDataGeneral = oThat.getView().getModel("DataGeneral");
                            var sRuc = oDataGeneral.getData().DocumentNumber;
                            //Colocar en esa estructura Folder1/Folder2 

                            oThat.getDateRoute().then((sDate) => {
                                oThat.onValidationBeforeSaveRequestBP();
                                if (!flagValidator) {
                                    return false;
                                }
                                oThat.onSaveRequestBP();
                                
                            }).catch(oError => {
                                oThat.onErrorMessage(oError, "errorSave");
                                BusyIndicator.hide();
                            });
                        }
                    }
                }
                );
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
                BusyIndicator.hide();
            }
        },
        onRequestBPEdit: function(oEvent){
            var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
            var bIsAdmin = aGroupsAdmin.length > 0 ? true : false;
            
            if(!bIsAdmin && countOtros > 0 && sNumeroDoc) {
                //Si no es admin
                //Si tiene otroas solicitudes en curso
                //Tiene asignado un Numero Documento
                MessageBox.error(formatter.onGetI18nText(oThat, "sNoEditWF"));
                return
            }

            if(oDataGeneral.WFStatus != "R") {
                MessageBox.error(formatter.onGetI18nText(oThat, "sErrorEditWF"));
                return;
            }

            if(oThat.getView().getModel("file").getData().length) {
                 
            } else {
                var aFiles = oThat.getView().getModel("UploadFile").getData();
                aFiles.DJ = "";
                aFiles.SR = "";
                aFiles.EC = "";
                oThat.getView().getModel("UploadFile").refresh();

                MessageBox.warning(formatter.onGetI18nText(oThat, "sMissingAdjuntEdit"));
            }
            

            oThat.onState(true, "general");
            oThat.onState(true, "requestValidation");
            //oThat.onState(false, "documentNumber");
            //oThat.onState(false, "requestValidation");
        },

        // Crear la solicitud de registro de proveedor.
        onSaveRequestBP: function () {
            try {
                sap.ui.core.BusyIndicator.show(0);
                
                let oData = this.getBPRequestData();

                Service.onRefreshToken(oModelGeneral).then(function (oRefresh) {
                    Service.onSaveRequestChangeBP(oModelGeneral, oData).then(function (oSaveRequest) {
                        var messages = Message.onReadMessageSuccess(oSaveRequest, oSaveRequest.data.DocumentNumber);
                        if (messages.length > 0) {
                            var oModel = new JSONModel(messages);
                            oThat.getView().setModel(oModel, "message");
                            
                            if (sessionStorage.getItem("messages") === null || sessionStorage.getItem("messages") === "null") {
                                sessionStorage.setItem("messages", JSON.stringify(messages));
                            } else {
                                let messagesSessionStorage = JSON.parse(sessionStorage.getItem("messages"));
                                messagesSessionStorage = messagesSessionStorage.concat(messages);
                                sessionStorage.setItem("messages", JSON.stringify(messagesSessionStorage));
                            }

                            MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectSend"));
                        } else {
                            MessageBox.success(formatter.onGetI18nText(oThat, "sSaveCorrect"));
                        }
                        // var messages = JSON.parse(oSaveRequest.headers["sap-message"]);
                        // var oModel = new JSONModel(messages);
                        // oThat.getView().setModel(oModel, "message");

                        if (oThat.myInbox) {
                            // Workflow.onRefreshTask();
                            MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectReSend"));
                            sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                        } else {
                            oThat.uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");
                            oThat.onIniciatorEnabledVisible();
                            oThat.onCleanDataGeneral();
                            oThat.onCleanDataSuppliers();
                            oThat.onCleanDataBank();
                            oThat.onCleanDataContactPerson();
                            oThat.onCleanDataSociety();
                            oThat.onCleanDataPurchaseOrg();
                            oThat.onIniciatorModels();
                            oThat.onGetRegion();
                            oThat.onCreatedList();
                            oThat.sFullPath = undefined;
                            flagValidator = true;
                            sEstado = "I";
                            oThat.onState(messages.length, "count");
                        }
                    }).catch(function (oError) {
                        // oThat.onErrorMessage(oError, "errorSave");
                        //MessageToast.show(formatter.onGetI18nText(oThat, "sErrorGeneral"));
                        let messages = Message.onReadMessageError(oError, oData.DocumentNumber);
                        if(messages.length > 0) {
                            MessageBox.error(formatter.onGetI18nText(oThat, "sErrorGeneral") + " : " + messages[0].message);
                        } else {
                            MessageToast.show(formatter.onGetI18nText(oThat, "sErrorGeneral"));
                        }

                        if (messages.length > 0) {
                            oThat.onState(messages.length, "count");
                            var oModel = new JSONModel(messages);
                            oThat.getView().setModel(oModel, "message");

                            if (sessionStorage.getItem("messages") === null || sessionStorage.getItem("messages") === "null") {
                                sessionStorage.setItem("messages", JSON.stringify(messages));
                            } else {
                                let messagesSessionStorage = JSON.parse(sessionStorage.getItem("messages"));
                                messagesSessionStorage = messagesSessionStorage.concat(messages);
                                sessionStorage.setItem("messages", JSON.stringify(messagesSessionStorage));
                            }
                        } else {
                            oThat.onErrorMessage(oError, "sErrorGeneral");
                        }
                    }).finally(function () {
                        sap.ui.core.BusyIndicator.hide();
                    });
                }).catch(function (oError) {
                    console.error(oError);
                    MessageBox.error("Error desconocido", {
                        title: "Mensaje de error"
                    });
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        getBPRequestData: function() {
            let personTypeForData = "";
            const oDataGeneral = oThat.getView().getModel("DataGeneral"),
                oDataListBanks = oThat.getView().getModel("listBanks"),
                oDataListContactPerson = oThat.getView().getModel("listContactPerson");
                if (
                    oThat.getView().byId("rdbPersonType").getSelectedButton().getText() ===
                    oThat.getView().getModel("i18n").getResourceBundle().getText("lblOrganization")
                ) {
                    personTypeForData = "2"; // Organización
                } else {
                    personTypeForData = "1"; // Persona
                }

                var oDataGen = oDataGeneral.getData();
            var oData = {
                BPRequestChangeID: oThat.uuid,
                BPGrouping: oDataGen.BPGrouping,
                DocumentType: oDataGen.DocumentType,
                DocumentNumber: oDataGen.DocumentNumber,
                PersonType: personTypeForData,
                Name: oDataGen.Name,
                Name2: oDataGen.Name2,
                Street: oDataGen.Street,
                StreetNumber: "",
                District: oDataGen.District,
                City: oDataGen.City,
                Ubigee: oDataGen.Ubigee,
                Country: oDataGen.Country,
                Region: oDataGen.Region,
                PostalCode: oDataGen.PostalCode,
                Street2: oDataGen.Street2,
                Language: oDataGen.Language,
                WFStatus: sEstado,
                WFCreatedByUser: sCreatedByUser.toUpperCase(),
                //WFCreatedByTimestamp
                //WFChangedByUser
                //WFChangedByName
                //WFUserComment
                //RequestedOnDate
                //ApprovedOnDate
                Banks: oDataListBanks.getData().filter((oBank) => { return oBank.Action !== oBankAction.read }),
                ContactPersons: oDataListContactPerson.getData()
            };

            /*
            POST: .../BPRequestChangeSet
            Error: Property 'TaxLocation' is invalid
            OBS: Revisar las propiedades definidas en el $metadata

            var oData = {
                BPRequestChangeID: oThat.uuid,
                BPGrouping: oDataGeneral.getData().BPGrouping,
                DocumentType: oDataGeneral.getData().DocumentType,
                DocumentNumber: oDataGeneral.getData().DocumentNumber,
                PersonType: personTypeForData,
                Name: oDataGeneral.getData().Name,
                Name2: oDataGeneral.getData().Name2,
                Street: oDataGeneral.getData().Street,
                // Cambio que se agrega para kallpa
                // "StreetNumber": oDataGeneral.getData().StreetNumber,
                // TODO: Se usa?
                StreetNumber: "",
                District: oDataGeneral.getData().District,
                City: oDataGeneral.getData().City,
                Country: oDataGeneral.getData().Country,
                Region: oDataGeneral.getData().Region,
                Ubigee: oDataGeneral.getData().Ubigee,
                PostalCode: oDataGeneral.getData().PostalCode,
                TaxLocation: oDataGeneral.getData().TaxLocation,
                Street2: oDataGeneral.getData().Street2,
                Industry: oDataGeneral.getData().Industry,
                // "SearchName": oDataGeneral.getData().SearchName, // TODO: ???
                //SearchName: oDataGeneral.getData().DocumentNumber,
                Commentary: oDataGeneral.getData().Commentary,
                Language: oDataGeneral.getData().Language,
                WFStatus: sEstado,
                WFCreatedByUser: sCreatedByUser.toUpperCase(),
                Banks: oDataListBanks.getData().filter((oBank) => { return oBank.Action !== oBankAction.read }),
                ContactPersons: oDataListContactPerson.getData()
            };*/

            //Reasignar el BPRequestChangeID  a las asociaciones
            oData = Object.assign({}, oData);

            for (var key in oData.Banks){
                var oItem = oData.Banks[key];
                oItem.BPRequestChangeID = oThat.uuid;
                delete oItem.BPRequestID;
                delete oItem.DocumentNumber;
                delete oItem.__metadata;
            }

            for (var key in oData.ContactPersons){
                var oItem = oData.ContactPersons[key];
                oItem.BPRequestChangeID = oThat.uuid;
                delete oItem.BPRequestID;
                delete oItem.DocumentNumber;
                delete oItem.__metadata;
            }

            return oData;
        },

        // Crear la solicitud de registro de proveedor.
        onValidationBeforeSaveRequestBP: function () {
            
            try {
                var oDataGeneral = oThat.getView().getModel("DataGeneral"),
                    oDataListBanks = oThat.getView().getModel("listBanks"),
                    oDataListContactPerson = oThat.getView().getModel("listContactPerson"),
                    rexNumber = /^\d*$/;
                    flagValidator = true;
                    oDataGeneral.setProperty("/SearchName",oDataGeneral.DocumentNumber);
                    
            
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        ongetRequestBP: function (oEvent) {
            try {
                var oItem = oEvent.getParameter("listItem").getBindingContext("listMaster").getObject();
                MessageBox.confirm(
                    oThat.getView().getModel("i18n").getResourceBundle().getText("confirmGetOldRequest"), {
                    styleClass: "sapUiSizeCompact",
                    Actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === "YES" || oAction === 'OK') {
                            // Se ponen los campos en modo no editable
                            oThat.onState(false, "general");
                            oThat.onState(false, "documentNumber");
                            
                            oThat.onClearButtons("ITEMSELECT");
                            
                            // Se traeran los datos del BP seleccionado
                            oThat.onGetServiceRequestBP(oItem.BPRequestChangeID);
                        }
                    }
                }
                );
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onGetServiceRequestBP: function (BPRequestChangeID) {
            try {
                sap.ui.core.BusyIndicator.show(0);
                Service.onGetRequestBP(oModelGeneral, "BPRequestChangeSet", BPRequestChangeID).then(function (oRequestBP) {
                    // Setear data de Datos Generales.
                    if (oRequestBP.PersonType === "2") {
                        oRequestBP.PersonType = 0;
                    } else {
                        oRequestBP.PersonType = 1;
                    }
                    var oModelDataGeneral = new JSONModel(oRequestBP);
                    oThat.getView().setModel(oModelDataGeneral, "DataGeneral");
                    oThat.getView().getModel("DataGeneral").refresh(true);
                    oThat.onGetRegion(true);
                    //oThat.onGetUbigeo(true);

                    // Setear en la tabla de Bancos.
                    // Obtener descripcion de tipo de cuenta mediante el id.
                    var oListTypeAccount = oThat.getView().getModel("listTypeAccount");
                    $.each(oRequestBP.Banks.results, function (k, v) {
                        var oFilterTypeAccount = oListTypeAccount.getData().filter(function (item) {
                            if (item.BankAccountTypeID === v.AccountType) {
                                return item;
                            }
                        });
                        if (oFilterTypeAccount.length > 0) {
                            v.AccountDescription = oFilterTypeAccount[0].Description;
                        }
                    });
                    // Obtener descripcion de moneda mediante el id.
                    var oListCoin = oThat.getView().getModel("listCoin");
                    $.each(oRequestBP.Banks.results, function (k, v) {
                        var oFilterCoin = oListCoin.getData().filter(function (item) {
                            if (item.BankCurrencyID === v.Currency) {
                                return item;
                            }
                        });
                        if (oFilterCoin.length > 0) {
                            v.CurrencyDescription = oFilterCoin[0].Description;
                        }
                    });
                    var oModelBanks = new JSONModel(oRequestBP.Banks.results);
                    oThat.getView().setModel(oModelBanks, "listBanks");
                    oThat.getView().getModel("listBanks").refresh(true);

                    // Setear en la tabla de Persona de Contacto.
                    var oModelContactPersons = new JSONModel(oRequestBP.ContactPersons.results);
                    oThat.getView().setModel(oModelContactPersons, "listContactPerson");
                    oThat.getView().getModel("listContactPerson").refresh(true);

                    // Setear en el historial o time line.
                    /*$.each(oRequestBP.History.results, function (k, v) {
                        if (v.UserComment !== "") {
                            v.SystemComment = v.SystemComment + "\n" + v.UserComment;
                        }
                    });
                    var oModelHistory = new JSONModel(oRequestBP.History.results);
                    oThat.getView().setModel(oModelHistory, "listTimeLine");
                    oThat.getView().getModel("listTimeLine").refresh(true);

                    // Attachments
                    var aDataFolder = oThat.getView().getModel("folder").getData();
                    aDataFolder = aDataFolder.slice();
                    */
                    var sBPRequestChangeID = oRequestBP.BPRequestChangeID;
                    var sDocumentNumber = oRequestBP.DocumentNumber;
                    var sCreatedAt = oThat.formatDate(oRequestBP.WFCreatedByTimestamp);

                    // Enabled de todos los campos en false.
                    // oThat.onState(false, "region");
                    oThat.onState(false, "claveBanco");
                    oThat.onState(false, "account");
                    oThat.onState(false, "address");
                    // oThat.onState(false, "ubigeo");
                }).catch(function (oError) {
                    oThat.onErrorMessage(oError, "errorSave");
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onChangeCci: function(oEvent){
            try {
                var rexNumber = /^\d*$/;
                if (!oEvent.getParameters().value.match(rexNumber)) {
                    // MessageBox.error(oEvent.getParameters().value + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                    // 	"sErrorNumber"));
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(oThat.getView().getModel("i18n").getResourceBundle().getText(
                        "sErrorNumber"));
                } else {
                     if(oEvent.getParameters().value.length === 20){
                        oEvent.getSource().setValueState("Success");
                        oEvent.getSource().setValueStateText("");

                     }else{
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Debe Ingresar 20 Digitos ");

                     }
                    
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onChangeDocumentNumber: function (oEvent) {
            try {
                var rexNumber = /^\d*$/;
                if (!oEvent.getParameters().value.match(rexNumber)) {
                    // MessageBox.error(oEvent.getParameters().value + " " + oThat.getView().getModel("i18n").getResourceBundle().getText(
                    // 	"sErrorNumber"));
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(oThat.getView().getModel("i18n").getResourceBundle().getText(
                        "sErrorNumber"));
                } else {
                    oEvent.getSource().setValueState("Success");
                    oEvent.getSource().setValueStateText("");
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        //Guarda los archivos en un modelo
        onSaveFile: function (oEvent) {
            try {
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var oParameters = oEvent.getParameters("files");
                var oFile = oParameters.files[0];
                var oFileReader = new FileReader();
                var aDataFile = oThat.getView().getModel("file").getData();
                //aDataFile = aDataFile.slice();
                var aDataFolder = oThat.getView().getModel("folder").getData();
                aDataFolder = aDataFolder.slice();
                oFileReader.onloadend = function (e) {
                    var result = e.target.result;
                    var sFolder = "";
                    // DJ : Acta de declaración jurada, SR: Solicitud de la ficha RUC, EC:Encabezado del estado de cuenta bancario
                    var oFindFolder = aDataFolder.find(oItem => {
                        return oItem.Id === sCustom;
                    });
                    var oJson = {
                        Id: sCustom,
                        FileName: oFile.name,
                        ArrayBufferResult: result,
                        FolderName: oFindFolder.Name
                    };
                    var oFindFile = aDataFile.find(oItem => {
                        return oItem.Id === sCustom;
                    });
                    var bFind = true;
                    if (oFindFile === undefined) {
                        bFind = false;
                    }

                    if (bFind) {
                        aDataFile.find(v => v.Id == sCustom).FileName = oFile.name;
                        aDataFile.find(v => v.Id == sCustom).ArrayBufferResult = result;
                    } else {
                        aDataFile.push(oJson);
                    }
                    oThat.getView().getModel("UploadFile").setProperty("/" + oFindFolder.Id, oFile.name);

                };
                oFileReader.readAsArrayBuffer(oFile);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onSelectIconTabFilter: function (oEvent) {
            // var aDataFolder = oThat.getView().getModel("folder").getData();
            // var sKey = oEvent.getParameters("key").key;
            // var aFilter = [];
            // aDataFolder = aDataFolder.slice();
            // switch (sKey) {
            // case 'ADJ':
            // 	var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
            // 	oDataGeneral = Object.assign({}, oDataGeneral);
            // 	var sBPRequestChangeID = oDataGeneral.BPRequestChangeID;
            // 	var sDocumentNumber = oDataGeneral.DocumentNumber;
            // 	if (sBPRequestChangeID !== "" && sDocumentNumber !== "") {
            // 		BusyIndicator.show(0);
            // 		SharePoint.getFiles(oThat, aDataFolder, sAmbient, sProject, sDocumentNumber, sBPRequestChangeID);
            // 	}
            // 	break;
            // default:

            // }
        },
        onDowloadFormat: function (oEvent) {
            try {
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var aDataFolder = oThat.getView().getModel("folder").getData();
                aDataFolder = aDataFolder.slice();
                var aFilter = [];
                var oFindFolder = aDataFolder.find(oItem => {
                    return oItem.Id === sCustom;
                });

                SharePoint.downloadFile(oThat, oFindFolder.Name);
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onDowloadFile: function (oEvent) {
            try {
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var aDataFolder = oThat.getView().getModel("folder").getData();
                aDataFolder = aDataFolder.slice();
                var aFilter = [];
                var oFindFolder = aDataFolder.find(oItem => {
                    return oItem.Id === sCustom;
                });
                var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
                oDataGeneral = Object.assign({}, oDataGeneral);
                var sBPRequestChangeID = oDataGeneral.BPRequestChangeID;
                var sDocumentNumber = oDataGeneral.DocumentNumber;
                var sCreatedAt = oThat.formatDate(oDataGeneral.WFCreatedByTimestamp);
                if (sBPRequestChangeID !== "" && sDocumentNumber !== "") {
                    var sFolder = sAmbient + "/" +
                        sProject + "/" + sCreatedAt + "/" + sDocumentNumber + "/" + sBPRequestChangeID + "/" +
                        oFindFolder.Name;
                    SharePoint.downloadFile(oThat, sFolder);
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onDialogAddTaxes: function (oEvent) {
            try {
                var oDataSociety = oThat.getView().getModel("DataSociety"),
                    aData = oDataSociety.getProperty("/WithholdingTaxCodes");

                var sDatoAccountDescription = JSON.parse(JSON.stringify(oDataSociety.getData())).AccountDescription;
                var oTaxe = {
                    BPRequestChangeID: oThat.uuid,
                    CompanyID: "",
                    WithholdingTaxType: "",
                    WithholdingTaxCode: "",
                    WithholdingTaxTypeDesc: "",
                    WithholdingTaxCodeDesc: "",
                    SubjectToWithholding: ""
                };

                aData.push(oTaxe);
                oThat.getView().getModel("DataSociety").refresh(true);
                oDataSociety.getData().AccountDescription = sDatoAccountDescription;
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onConfirmAddTaxses: function (oEvent) {
            oThat.oTaxes.close();
        },

        //Al cancelar valida las filas que ya se habian ingresado con los nuevos 
        onCancelAddTaxses: function (oEvent) {
            try {
                var oSource = oEvent.getSource();
                var oDataSociety = oThat.getView().getModel("DataSociety"),
                    aData = oDataSociety.getProperty("/WithholdingTaxCodes"),
                    sDatoAccountDescription = JSON.parse(JSON.stringify(oDataSociety.getData())).AccountDescription;
                //cantidad anterior
                var iCount = oThat.listMultiTaxesCount;
                if (aData.length !== iCount) {
                    for (var i = aData.length - 1; i > iCount - 1; i--) {
                        aData.splice(i, 1);
                    }
                }
                oThat.getView().getModel("DataSociety").refresh(true);
                oDataSociety.getData().AccountDescription = sDatoAccountDescription;
                oThat.oTaxes.close();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onSelectCheckBoxAddTaxes: function (oEvent) {
            try {
                var bSelected = oEvent.getParameter("selected");
                var oItem = oEvent.getSource().getBindingContext("DataSociety").getObject();
                oItem.SubjectToWithholding = "";
                if (bSelected) {
                    oItem.SubjectToWithholding = "X";
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onTokenUpdateMultiTaxes: function (oEvent) {
            try {
                var oToken = oEvent.getParameter("token");
                if (oToken) {
                    var sPath = oToken.getBindingContext("DataSociety").getPath().split("/")[2];
					/*var aRemoveToken = oEvent.getParameter("removedTokens");
					var sPath = aRemoveToken[0].getBindingContext("DataSociety").getPath().split("/")[2];*/
                    var aData = oThat.getView().getModel("DataSociety").getProperty("/WithholdingTaxCodes");
                    aData.splice(sPath, 1);
                    oThat.getView().getModel("DataSociety").refresh(true);
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },
        onDetailTaxes: function (oEvent) {
            try {
                var oSource = oEvent.getSource();
                var oItem = oSource.getBindingContext("listTblSociety").getObject();
                if (!oThat._oPopover) {
                    Fragment.load({
                        id: "PopoverDetailTaxes",
                        name: fragmentsPath + ".dialog.DetailTaxes",
                        controller: oThat
                    }).then(function (oPopover) {
                        oThat._oPopover = oPopover;
                        oThat.getView().addDependent(oThat._oPopover);
                        //oThat._oPopover.bindElement(oCtx.getPath());
                        oThat._oPopover.setModel(new JSONModel(oItem.WithholdingTaxCodes));
                        oThat._oPopover.openBy(oSource);
                    }.bind(oThat));
                } else {
                    //oThat._oPopover.bindElement(oCtx.getPath());
                    oThat._oPopover.setModel(new JSONModel(oItem.WithholdingTaxCodes));
                    oThat._oPopover.openBy(oSource);
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Busqueda de la lista master.
        onSearchMaster: function (oEvent) {
            try {
                var sValue = oThat.getView().getModel("search"),
                    sQuery = sValue.getData().value,
                    oListMaster = JSON.parse(JSON.stringify(oListMasterGeneral));

                if (sQuery != "") {
                    // update list binding
                    var oListFilterMaster = oListMaster.filter(function (item) {
                        if (item.WFCreatedByName.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.WFStatus.toUpperCase().indexOf(sQuery.toUpperCase()) >
                            -1 || item.DocumentType.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.DocumentNumber.toUpperCase().indexOf(sQuery.toUpperCase()) >
                            -1 || item.RequestedOnDateFormat.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.ApprovedOnDateFormat.toUpperCase().indexOf(
                                sQuery.toUpperCase()) > -1) {
                            return item;
                        }
                    });

                    var master = oThat.getView().byId("idLista");
                    master.destroyItems();

                    var oModel = new JSONModel(oListFilterMaster);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMaster");
                    oThat.getView().getModel("listMaster").refresh(true);
                } else {
                    var master = oThat.getView().byId("idLista");
                    master.destroyItems();

                    var oModel = new JSONModel(oListMasterGeneral);
                    oModel.setSizeLimit(999999999);
                    oThat.getView().setModel(oModel, "listMaster");
                    oThat.getView().getModel("listMaster").refresh(true);
                }
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

        // Obtener los datos del usuario logeado del IAS.
        readUserIasInfo: function () {
            try {
                var that = this;
                return new Promise((resolve, reject) => {
                    var userModel = new JSONModel({});
                    var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    var sUserRole = "";
                    if (
                        this.oConfigModel.getProperty("/testModeOn") &&
                        (sMail === "DEFAULT_USER" || sMail === undefined)
                    ) {
                        if(sUserRole == "ADMIN"){
                            //sMail = "elvis.percy.garcia.tincopa@everis.com";
                            sMail = "suppliers.proveedor1@medifarma.com.pe";
                        } else if(sUserRole == "APROBADOR"){
                            //sMail = "franco.corvetto.nunes.curto@everis.nttdata.com";
                            sMail = "suppliers.proveedor1@medifarma.com.pe";
                        } else {
                            //PROVEEDOR
                            //sMail = "fcorvett@everis.com";
                            sMail = "suppliers.proveedor1@medifarma.com.pe";
                        }
                        
                        this._activateTestOptions();
                    }


                    var sPath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
                    const sUrl = that.getOwnerComponent().getManifestObject().resolveUri(sPath);
                    userModel.loadData(sUrl, null, true, "GET", null, null, {
                        "Content-Type": "application/scim+json"
                    }).then(() => {
                        var oDataTemp = userModel.getData();
                        resolve(oDataTemp);
                    }).catch(err => {
                        reject("Error");
                    });
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Mensajes de error, exito, warning.
        onMessagesButtonPress: function (oEvent) {
            try {
                // var oMessagesButton = oEvent.getSource();
                // var aMessage = this.getView().getModel("message").getData();
                // if (!oThat._messagePopover) {
                // 	oThat._messagePopover = new MessagePopover({
                // 		items: {
                // 			path: "message>/",
                // 			template: new MessagePopoverItem({
                // 				description: "{message>description}",
                // 				type: "{message>type}",
                // 				title: "{message>message}"
                // 			})
                // 		}
                // 	});
                // 	oMessagesButton.addDependent(oThat._messagePopover);
                // } else {
                // 	if (aMessage.length > 0) {
                // 		oThat._messagePopover.setModel(oThat._messagePopover.getModel("message"), "message");
                // 		oThat._messagePopover.getModel("message").setData(aMessage);
                // 	}
                // }

                // oThat._messagePopover.toggle(oMessagesButton);

                if (!oThat._oMessagePopover) {
                    // create popover lazily (singleton)
                    oThat._oMessagePopover = sap.ui.xmlfragment("onFrgMessagePopover", fragmentsPath + ".fragment.MessagePopover", oThat);
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
                                title: "{messageMyInbox>title}"
                            })
                        }
                    });
                    oMessagesButton.addDependent(oThat._messagePopoverMyInbox);
                }
                oThat._messagePopoverMyInbox.setModel(oModel, "messageMyInbox");
                oThat._messagePopoverMyInbox.toggle(oMessagesButton);
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
                var startupParameters = getComponentDataMyInbox === undefined ? undefined : getComponentDataMyInbox.startupParameters;
                //valida si entra por el workflow
                oThat.myInbox = false;
                console.log("StartupParameters:"+ startupParameters + "-"+startupParameters.hasOwnProperty("taskModel"))

                if (startupParameters !== undefined && startupParameters.hasOwnProperty("taskModel")) {
                    oThat.myInbox = true;
                    var taskModel = startupParameters.taskModel;
                    var taskData = taskModel.getData();
                    for (var key in taskData){
                    console.log(key + "-" + taskData[key])}
                    // startupParameters.inboxAPI.setShowFooter(false);
                    
                    Workflow.onGetContextWorkflow(taskData).then(function (oContextWorkflow) {
                        console.log("ID.." +oContextWorkflow.bpRequestData.BPREQUESTCHANGEID);
                        if (oContextWorkflow.bpRequestData){
                            for (var key in oContextWorkflow.bpRequestData)
                            console.log(key + "-" + oContextWorkflow.bpRequestData[key])
                        }
                        if (oContextWorkflow.bpRequestData !== undefined) {
                            console.log("ID.." +oContextWorkflow.bpRequestData.BPREQUESTCHANGEID);
                            oThat.onGetServiceRequestBP(oContextWorkflow.bpRequestData.BPREQUESTCHANGEID);
                        }
                        oContextWorkflow.task = {};
                        oContextWorkflow.task.Title = taskData.TaskTitle;
                        oContextWorkflow.task.Priority = taskData.Priority;
                        oContextWorkflow.task.Status = taskData.Status;

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
                                sBtnTxt: oThat.getView().getModel("i18n").getResourceBundle().getText("btnReject"),
                                onBtnPressed: function () {
                                    oThat.onRejectRequestBP();
                                }
                            };

                            // Button Approve
                            var oPositiveAction = {
                                sBtnTxt: oThat.getView().getModel("i18n").getResourceBundle().getText("btnApprove"),
                                onBtnPressed: function () {
                                    sessionStorage.setItem("messages", null);
                                    oThat.onApproveRejectRequestBP("A", "", oContextWorkflow.bpRequestData.BPREQUESTCHANGEID, oContextWorkflow.bpRequestData.DOCUMENTNUMBER);
                                }
                            };

                            // Add the Approve & Reject buttons
                            startupParameters.inboxAPI.addAction({
                                Action: oPositiveAction.sBtnTxt,
                                label: oPositiveAction.sBtnTxt,
                                type: "Accept"
                            }, oPositiveAction.onBtnPressed);

                            startupParameters.inboxAPI.addAction({
                                Action: oNegativeAction.sBtnTxt,
                                label: oNegativeAction.sBtnTxt,
                                type: "Reject"
                            }, oNegativeAction.onBtnPressed);

                            oThat.onState(false, "visible");
                            oThat.onState(true, "timeLine");
                            oThat.onState(false, "general");
                            oThat.onState(false, "requestValidation");
                            oThat.onState(false, "documentNumber");
                        } else {
                            // Button Reenvio
                            var oRequestAction = {
                                sBtnTxt: oThat.getView().getModel("i18n").getResourceBundle().getText("btnReRequestBP"),
                                onBtnPressed: function () {
                                    oThat.onRequestBP();
                                }
                            };

                            //Acciones del boton rechazar.
                            startupParameters.inboxAPI.addAction({
                                Action: oRequestAction.sBtnTxt,
                                label: oRequestAction.sBtnTxt,
                                type: "Accept"
                            }, oRequestAction.onBtnPressed);

                            sEstado = "T";
                            oThat.onIniciatorEnabledVisible();
                            oThat.onState(true, "visible");
                            oThat.onState(true, "timeLine");
                            oThat.onState(true, "general");
                            oThat.onState(true, "documentNumber");
                            oThat.onState(true, "requestValidation");
                            oThat.onState(true, "region");
                            oThat.onState(true, "ubigeo");
                            oThat.uuid = oContextWorkflow.bpRequestData.BPREQUESTCHANGEID;
                        }

                        // Button Messages
                        var oMessageAction = {
                            sBtnTxt: oThat.getView().getModel("i18n").getResourceBundle().getText("btnMessage"),
                            onBtnPressed: function (oEvent) {
                                var oMessagesButton = oEvent.getSource();
                                oThat.onMessagesButtonPressMyInbox(oMessagesButton);
                            }
                        };

                        //Acciones del boton Mensaje.
                        startupParameters.inboxAPI.addAction({
                            Action: oMessageAction.sBtnTxt,
                            label: oMessageAction.sBtnTxt,
                            type: "Emphasized"
                        }, oMessageAction.onBtnPressed);

                        startupParameters.inboxAPI.getDescription("NA", taskData.InstanceID).done(function (dataDescr) {
                            oContextWorkflow.task.Description = dataDescr.Description;
                            var oModel = new JSONModel(oContextWorkflow);
                            oThat.getView().setModel(oModel, "contextData");
                        }).fail(function (errorText) {
                            jQuery.sap.require("sap.m.MessageBox");
                            sap.m.MessageBox.error(errorText, {
                                title: "Mensaje de error"
                            });
                        });

                        oThat.onHiddenButtonsFooter();
                    }).catch(function (oError) {
                        oThat.onErrorMessage(oError, "errorSave");
                    }).finally(function () {
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
            if ((startupParams.businessKey && startupParams.businessKey[0])) {
                if (startupParams.businessKey !== undefined) {
                    sBusinessKey = startupParams.businessKey;
                } else {
                    sBusinessKey = startupParams.businessKey[0];
                }
                oThat.onState(false, "general");
                oThat.onState(false, "documentNumber");
                oThat.onState(false, "requestValidation");
                oThat.onGetServiceRequestBP(sBusinessKey);
            }
        },

        // Comentario para el rechazo.
        onRejectRequestBP: function () {
            try {
                MessageBox.confirm(oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelRequest"), {
                    title: "Confirmacion",
                    onClose: function (sActionClicked) {
                        if (sActionClicked === MessageBox.Action.OK) {
                            var dialog = new Dialog({
                                title: "Comentario",
                                type: "Message",
                                //Actions: ["Aceptar", "Cancelar"],
                                content: [
                                    new Label({
                                        text: oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelMotivo"),
                                        labelFor: "textarea"
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
                                        maxLength: 40
                                        //value: v1.COMMENTS
                                    })
                                ],
                                beginButton: new Button({
                                    text: "Aceptar",
                                    enabled: false,
                                    press: function () {
                                        dialog.close();
                                        var oContext = oThat.getView().getModel("contextData");
                                        sessionStorage.setItem("messages", null);
                                        oThat.onApproveRejectRequestBP("R", MotivoNotificacion, oContext.getData().bpRequestData.BPREQUESTCHANGEID, oContext.getData()
                                            .bpRequestData.DOCUMENTNUMBER);
                                        //oThat.onApproveRejectRequestBPPrueba("R", MotivoNotificacion, oContext.getData().bpRequestData.BPREQUESTCHANGEID);
                                        // sap.ui.core.BusyIndicator.hide();
                                    }
                                }),
                                endButton: new Button({
                                    text: "Cancelar",
                                    press: function () {
                                        dialog.close();
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            });
                            dialog.open();
                        }
                    }
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Aprobar o rechazar la solicitud.
        onApproveRejectRequestBP: function (status, comment, BPRequestChangeID, DocumentNumber) {
            try {
                var that = this;
                sap.ui.core.BusyIndicator.show(0);
                Service.onRefreshToken(oModelGeneral).then(function (oRefresh) {
                    var oContext = oThat.getView().getModel("contextData");
                    var oData = {
                        "WFStatus": status,
                        "WFCreatedByUser": sCreatedByUser,
                        "WFUserComment": comment
                    };

                    $.ajax({
                        type: "GET",
                        url: that.getOwnerComponent().getManifestObject().resolveUri("bpmworkflowruntime/v1/xsrf-token"),
                        headers: {
                            "X-CSRF-Token": "Fetch"
                        },
                        success: function (data, statusText, xhr) {
                            console.log(xhr.getResponseHeader("X-CSRF-Token"));
                            Service.onApproveRequestBP(oModelGeneral, oData, "BPRequestChangeSet", BPRequestChangeID).then(function (oApproveReject) {
                                // sessionStorage.setItem("messages", null);
                                //Workflow.onRefreshTask();
                                MessageToast.show(formatter.onGetI18nText(oThat, "sCorrectApproveReject"));
                                var messages = Message.onReadMessageSuccess(oApproveReject, DocumentNumber);
                                if (messages.length > 0) {
                                    oThat.onState(messages.length, "count");
                                    var oModel = new JSONModel(messages);
                                    oThat.getView().setModel(oModel, "message");
                                    // oThat.onMessageStrip(messages);
                                    if (sessionStorage.getItem("messages") === null || sessionStorage.getItem("messages") === "null") {
                                        sessionStorage.setItem("messages", JSON.stringify(messages));
                                    } else {
                                        var messagesSessionStorage = JSON.parse(sessionStorage.getItem("messages"));
                                        var cantidadData = messagesSessionStorage.length;
                                        messagesSessionStorage = messagesSessionStorage.concat(messages);
                                        sessionStorage.setItem("messages", JSON.stringify(messagesSessionStorage));
                                    }
                                } else {
                                    MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("sSaveCorrect"));
                                }
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(function (oError) {
                                // sessionStorage.setItem("messages", null);
                                var messages = Message.onReadMessageError(oError, DocumentNumber);
                                if (messages.length > 0) {
                                    oThat.onState(messages.length, "count");
                                    var oModel = new JSONModel(messages);
                                    oThat.getView().setModel(oModel, "message");
                                    // oThat.onMessageStrip(messages);
                                    if (sessionStorage.getItem("messages") === null || sessionStorage.getItem("messages") === "null") {
                                        sessionStorage.setItem("messages", JSON.stringify(messages));
                                    } else {
                                        var messagesSessionStorage = JSON.parse(sessionStorage.getItem("messages"));
                                        var cantidadData = messagesSessionStorage.length;
                                        messagesSessionStorage = messagesSessionStorage.concat(messages);
                                        sessionStorage.setItem("messages", JSON.stringify(messagesSessionStorage));
                                    }
                                } else {
                                    oThat.onErrorMessage(oError, "sErrorReject");
                                }
                                sap.ui.core.BusyIndicator.hide();
                            }).finally(function (err) {
                                // OJO: Probar con el otro refresh!.
                                sap.ui.getCore().byId(oThat.IdListMaster).getModel().refresh(true);
                                //	Workflow.onRefreshTask();
                                // sap.ui.core.BusyIndicator.hide();
                            });
                        },
                        error: function (errMsg) {
                            console.log(errMsg.statusText);
                        },
                        contentType: "application/json"
                    });

                }).catch(function (oError) {
                    console.log("error");
                    sap.ui.core.BusyIndicator.hide();
                }).finally(function () {
                    // sap.ui.core.BusyIndicator.hide();
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Aprobar o rechazar la solicitud.
        onApproveRejectRequestBPPrueba: function (status, comment, BPRequestChangeID) {
            try {
                Service.onRefreshToken(oModelGeneral).then(function (oRefresh) {
                    var oContext = oThat.getView().getModel("contextData");
                    var oData = {
                        "WFStatus": status,
                        "WFCreatedByUser": sCreatedByUser,
                        "WFUserComment": comment
                    };
                    // Service.onApproveRequestBP(oModelGeneral, oData, "BPRequestSet", BPRequestChangeID).then(function (oApproveReject) {
                    Workflow.completeTask(oThat);
                    // var messages = Message.onReadMessageSuccess(oApproveReject);
                    // if (messages.length > 0) {
                    // 	var oModel = new JSONModel(messages);
                    // 	oThat.getView().setModel(oModel, "message");
                    // 	oThat.onMessageStrip(messages);
                    // } else {
                    // 	MessageBox.success(oThat.getView().getModel("i18n").getResourceBundle().getText("sSaveCorrect"));
                    // }
                    // }).catch(function (oError) {
                    // 	var messages = Message.onReadMessageError(oError);
                    // 	if (messages.length > 0) {
                    // 		var oModel = new JSONModel(messages);
                    // 		oThat.getView().setModel(oModel, "message");
                    // 		oThat.onMessageStrip(messages);
                    // 	} else {
                    // 		oThat.onErrorMessage(oError, "sErrorReject");
                    // 	}
                    // }).finally(function () {
                    // 	Workflow.completeTask(oThat);
                    // 	sap.ui.core.BusyIndicator.hide();
                    // });
                }).catch(function (oError) {
                    console.log("error");
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Mostrar los botones del masivo y su logica.
        onGetButtonsMassive: function () {
            try {
                if ($.getComponentDataMyInbox !== undefined && $.getComponentDataMyInbox.startupParameters.hasOwnProperty("taskModel")) {
                    var sIdPrincipal = document.getElementById("application-WorkflowTask-DisplayMyInbox-content");
                    if (!sIdPrincipal) { // FLP Sandbox
                        sIdPrincipal = document.getElementById("application-fioriHtmlBuilder-display-content");
                    }

                    var sIdList = $("div[id$='--list']")[0].id;
                    var sBar = document.querySelectorAll("footer.sapMPageFooter")[0].firstChild.id;
                    oThat.IdListMaster = sIdList;
                    sap.ui.getCore().byId(sIdList).attachSelectionChange(function (oData, oEvent, oListener) {
                        if (oData.oSource.oPropagatedProperties.oModels.undefined.aTaskDefinitionIDFilterKeys) {
                            if (oData.oSource.oPropagatedProperties.oModels.undefined.aTaskDefinitionIDFilterKeys[0].split("@")[1] === "wfsuppliers") {
                                var aItems = sap.ui.getCore().byId(sIdList).getSelectedItems();
                                if (aItems.length > 0) {
                                    if (aItems[0].getParent().getMode() === "MultiSelect") {
                                        if (sap.ui.getCore().byId("PositiveCustom") === undefined) {
                                            sap.ui.getCore().byId(sBar).addContentLeft(new sap.m.Button("PositiveCustom", {
                                                text: oThat.getView().getModel("i18n").getResourceBundle().getText("btnApprove"),
                                                type: "Accept",
                                                visible: false,
                                                press: function (oEvent) {
                                                    var aSelectedItems = sap.ui.getCore().byId(sIdList).getSelectedItems();
                                                    var aItems = [];

                                                    for (var i = 0; i < aSelectedItems.length; i++) {
                                                        var oSelectedItem = aSelectedItems[i].getBindingContext().getObject();
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
                                                                Workflow.onGetContextWorkflow(v).then(function (oContextWorkflow) {
                                                                    oThat.onApproveRejectRequestBP("A", "", oContextWorkflow.bpRequestData.BPREQUESTCHANGEID, oContextWorkflow.bpRequestData
                                                                        .DOCUMENTNUMBER);
                                                                }).catch(function (oError) {
                                                                    oThat.onErrorMessage(oError, "errorSave");
                                                                }).finally(function () {
                                                                    sap.ui.core.BusyIndicator.hide();
                                                                });
                                                            });
                                                        } else {
                                                            BusyIndicator.hide();
                                                        }
                                                    }
                                                    positiveItems(aItems);
                                                }

                                            }));

                                        }
                                        if (sap.ui.getCore().byId("RejectCustom") === undefined) {
                                            sap.ui.getCore().byId(sBar).addContentLeft(new sap.m.Button("RejectCustom", {
                                                text: oThat.getView().getModel("i18n").getResourceBundle().getText("btnReject"),
                                                type: "Reject",
                                                visible: false,
                                                press: function (oEvent) {
                                                    var aSelectedItems = sap.ui.getCore().byId(sIdList).getSelectedItems();
                                                    var aItems = [];

                                                    for (var i = 0; i < aSelectedItems.length; i++) {
                                                        var oSelectedItem = aSelectedItems[i].getBindingContext().getObject();
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
                                                }
                                            }));
                                        }
                                        if (sap.ui.getCore().byId("RejectCustom") !== undefined) {
                                            sap.ui.getCore().byId("RejectCustom").setVisible(false);
                                        }
                                        if (sap.ui.getCore().byId("PositiveCustom") !== undefined) {
                                            sap.ui.getCore().byId("PositiveCustom").setVisible(false);
                                        }
                                        if (aItems.length > 0 && sap.ui.getCore().byId("RejectCustom") !== undefined && sap.ui.getCore().byId("PositiveCustom") !==
                                            undefined) {
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

        // Comentario para el rechazo masivo.
        onRejectRequestBPMasivo: function (aItems) {
            try {
                MessageBox.confirm(oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelRequest"), {
                    title: oThat.getView().getModel("i18n").getResourceBundle().getText("rjConfirm"),
                    Actions: ["Si", "No"],
                    onClose: function (sActionClicked) {
                        if (sActionClicked === "Si") {
                            var dialog = new Dialog({
                                title: oThat.getView().getModel("i18n").getResourceBundle().getText("rjComment"),
                                type: "Message",
                                //Actions: ["Aceptar", "Cancelar"],
                                content: [
                                    new Label({
                                        text: oThat.getView().getModel("i18n").getResourceBundle().getText("reCancelMotivo"),
                                        labelFor: "textarea"
                                    }),
                                    new TextArea("textarea", {
                                        liveChange: function (oEvent) {
                                            MotivoNotificacionMasivo = oEvent.getParameter("value");
                                            var parent = oEvent.getSource().getParent();

                                            parent.getBeginButton().setEnabled(MotivoNotificacionMasivo.length > 0);
                                        },
                                        width: "100%",
                                        placeholder: oThat.getView().getModel("i18n").getResourceBundle().getText("phrjComment"),
                                        rows: 5,
                                        cols: 20,
                                        maxLength: 40
                                        //value: v1.COMMENTS
                                    })
                                ],
                                beginButton: new Button({
                                    text: oThat.getView().getModel("i18n").getResourceBundle().getText("btnAccept"),
                                    enabled: false,
                                    press: function () {
                                        dialog.close();
                                        sessionStorage.setItem("messages", null);
                                        $.each(aItems, function (k, v) {
                                            Workflow.onGetContextWorkflow(v).then(function (oContextWorkflow) {
                                                oThat.onApproveRejectRequestBP("R", MotivoNotificacionMasivo, oContextWorkflow.bpRequestData.BPREQUESTCHANGEID,
                                                    oContextWorkflow.bpRequestData.DOCUMENTNUMBER);
                                            }).catch(function (oError) {
                                                oThat.onErrorMessage(oError, "errorSave");
                                            }).finally(function () {
                                                sap.ui.core.BusyIndicator.hide();
                                            });
                                        });
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                }),
                                endButton: new Button({
                                    text: oThat.getView().getModel("i18n").getResourceBundle().getText("btnCancel"),
                                    press: function () {
                                        dialog.close();
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            });
                            dialog.open();
                        }
                    }
                });
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onMessageStrip: function (messages) {
            try {
                var Dialogo = new sap.m.Dialog({
                    title: "Mensajes"
                });
                $.each(messages, function (key, item) {
                    var text = item.message;
                    var type = item.severity;
                    if (type == "info") {
                        type = "Information";
                    } else if (type == "warning") {
                        type = "Warning";
                    } else if (type == "success") {
                        type = "Success";
                    } else {
                        type = "Error";
                    }
                    var messageStrip = new sap.m.MessageStrip({
                        text: text,
                        type: type,
                        showIcon: true
                    });
                    var label = new sap.m.Label({
                        text: ""
                    });
                    Dialogo.addContent(messageStrip);
                    Dialogo.addContent(label);
                });
                var ButtonCerrar =
                    Dialogo.addButton(new sap.m.Button({
                        text: oThat.getView().getModel("i18n").getResourceBundle().getText("btnClose"),
                        type: "Reject",
                        press: function () {
                            Dialogo.close();
                        }
                    }));
                Dialogo.open();
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onRefreshToken: function () {
            Service.onRefreshToken(oModelGeneral).then(function (oApproveReject) {
                oThat.onTestUpdate();
            }).catch(function (oError) {
                console.log("error");
            }).finally(function () {
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onSemanticButtonPress: function () {
            var uuid = SharePoint.getUUIDV4().toUpperCase().replace(/-/gi, "");
            var oData = {
                "BPRequestChangeID": uuid,
                "BPGrouping": "NACI",
                "DocumentType": "PE1",
                "DocumentNumber": "90100190999",
                "PersonType": "2",
                "Name": "Nombre test",
                "Name2": "Nombre2 test",
                "Street": "1",
                "StreetNumber": "",
                "District": "01",
                "City": "01",
                "Country": "PE",
                "Region": "15",
                "PostalCode": "",
                "TaxLocation": "",
                "Street2": "",
                "Industry": "0000000010",
                "SearchName": "bus 1",
                "Commentary": "coom 0",
                "Language": "S",
                "WFStatus": "I",
                "WFCreatedByUser": "BP_SOLICITANTE1",
                "AdditionalData": {
                    "BPRequestChangeID": uuid,
                    "MobilePhone": "989659454",
                    "Phone": "5287176"
                },
                "Emails": [{
                    "BPRequestChangeID": uuid,
                    "Email": "test1@test.com",
                    "Commentary": "comm1"
                }],
                "Banks": [{
                    "BPRequestChangeID": uuid,
                    "CountryID": "PE",
                    "BankID": "003",
                    "BankDescription": "Banco Interbank",
                    "AccountNumber": "123",
                    "AccountType": "I",
                    "AccountDescription": "Cuenta Interbancaria",
                    "Currency": "1",
                    "CurrencyDescription": "Dólares",
                    "ReferenceNumber": "321"
                }],
                "ContactPersons": [{
                    "BPRequestChangeID": uuid,
                    "Name": "Contacto 1",
                    "RelationshipCategory": "0010",
                    "RelationshipCategoryDescription": "Persona de contacto",
                    "Phone": "5287176",
                    "MobilePhone": "983217451",
                    "Email": "test2@test.com",
                    "Commentary": "comm2"
                }],
                "Companies": [{
                    "BPRequestChangeID": uuid,
                    "CompanyID": "1150",
                    "CompanyDescription": "Termoselva S.R.L.",
                    "AccountID": "",
                    "AccountDescription": "",
                    "PaymentCondition": "C030",
                    "PaymentConditionDescription": "Crédito a 30 días",
                    "PaymentMethod": "E",
                    "PaymentMethodDescription": "Transferencia al Exterior",
                    "WithholdingTaxCodes": []
                }],
                "PurchasingOrganizations": [{
                    "BPRequestChangeID": uuid,
                    "PurchasingOrganizationID": "1001",
                    "PurcOrganizationDescription": "Kallpa Generación",
                    "POCurrency": "PEN",
                    "POCurrencyDescription": "Soles",
                    "PaymentCondition": "C030",
                    "PaymentConditionDescription": "Crédito a 30 días",
                    "Incoterms": "",
                    "IncotermsDescription": ""
                }]
            };
            Service.onSaveRequestBP(oModelGeneral, oData).then(function (oSaveRequest) {

            }).catch(function (oError) {

            }).finally(function () {
                sap.ui.core.BusyIndicator.hide();
            });
        },

        onValidatorColumns: function (oEvent) {
            try {
                if (oEvent.getParameters().value !== "") {
                    oEvent.getSource().setValueState("Success");
                    oEvent.getSource().setValueStateText("");
                }

                if (oEvent.getSource().getId().includes("cboGroup")) {
                    const oDataGeneral = oThat.getView().getModel("DataGeneral");
                    const isNoDomiciliado = oDataGeneral.getData().BPGrouping === "EXTR";
                    if (isNoDomiciliado) {
                        oThat.onState(false, "requiredForLocal");
                    } else {
                        oThat.onState(true, "requiredForLocal");
                    }
                }

            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        onSetAccountNumber: function () {
            try {
                var oDataBank = oThat.getView().getModel("DataBank");
                if (oDataBank.getData().AccountType === KeyControl) {
                    oThat.onState(false, "documentNumber");
                    oDataBank.getData().AccountNumber = AccountNumberConst;
                    oDataBank.refresh(true);
                } else {
                    oThat.onState(true, "documentNumber");
                    var rexNumber = /^\d*$/;
                    if (!oDataBank.getData().AccountNumber.match(rexNumber)) {
                        oDataBank.getData().AccountNumber = "";
                        oDataBank.refresh(true);
                    }
                }
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        },

        // Ocultar botones de Visualizar log, Reclamar y compartir.
        onHiddenButtonsFooter: function () {
            var sIdPrincipal = document.getElementById("application-WorkflowTask-DisplayMyInbox-content");
            if (!sIdPrincipal) { // FLP Sandbox
                sIdPrincipal = document.getElementById("application-fioriHtmlBuilder-display-content");
            }
            var iNumber = 2;
            if (this.getView().getModel("device").getData().system.phone) {
                iNumber = 1;
            }
            var sButtons = document.querySelectorAll("footer.sapMPageFooter")[iNumber].firstElementChild.childNodes[2];

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
        getDateRoute: function () {
            return this._getServerSystemTime().then((timestamp) => {
                return this.formatDate(timestamp);
            });
            // var d = new Date();
            // var aFecha = d.toISOString().split("T")[0].split("-");
            // return aFecha[0] + "/" + aFecha[1] + "/" + aFecha[2];
        },
        _getServerSystemTime: function() {
            return new Promise(function (resolve, reject) {
                Service.onGetDataGeneral(oModelGeneral, "SystemTimeSet").then((times) => {                    
                    if (times.results.length > 0) {
                        resolve(times.results[0].Timestamp);
                    } else {
                        const err = new Error(oThat.getView().getModel("i18n").getResourceBundle().getText("errorServerSystemTime"));
                        reject(err);
                    }
                }).catch(function (oError) {
                    reject(oError);
                });
            });
        },
        formatDate: function (date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('/');
        },
        _onSaveDataTestOnly: function() {
            try {
                const data = this.getBPRequestData();
                localStorage.setItem("storage_BPRequestData", JSON.stringify(data));
            } catch (error) {
                console.error(error);
            }
        },
        _onRetrieveDataTestOnly: function() {
            const strData = localStorage.getItem("storage_BPRequestData");
            const data =  strData && JSON.parse(strData);

            this._fillModelsData(data);
        },
        _fillModelsData: function(data) {
            const oDataGeneral = oThat.getView().getModel("DataGeneral"),
                oDataSuppliers = oThat.getView().getModel("DataSuppliers"),
                oDataListEmails = oThat.getView().getModel("listEmails"),
                oDataListBanks = oThat.getView().getModel("listBanks"),
                oDataListContactPerson = oThat.getView().getModel("listContactPerson"),
                oDataListSociety = oThat.getView().getModel("listTblSociety"),
                oDataListPurchaseOrg = oThat.getView().getModel("listTblPurchaseOrg");
            
                // oThat.getView().byId("rdbPersonType").getSelectedButton()

                oDataGeneral.setProperty("/BPGrouping", data.BPGrouping);
                oDataGeneral.setProperty("/DocumentType", data.DocumentType);
                oDataGeneral.setProperty("/DocumentNumber", data.DocumentNumber);
                oDataGeneral.setProperty("/Name", data.Name);
                oDataGeneral.setProperty("/Name2", data.Name2);
                oDataGeneral.setProperty("/Street", data.Street);
                oDataGeneral.setProperty("/District", data.District);
                oDataGeneral.setProperty("/City", data.City);
                oDataGeneral.setProperty("/Country", data.Country);
                
                this.getView().byId("cboCountry").fireChange();

                oDataGeneral.setProperty("/Region", data.Region);
                oDataGeneral.setProperty("/Ubigee", data.Ubigee);
                oDataGeneral.setProperty("/PostalCode", data.PostalCode);
                oDataGeneral.setProperty("/TaxLocation", data.TaxLocation);
                oDataGeneral.setProperty("/Street2", data.Street2);
                oDataGeneral.setProperty("/Industry", data.Industry);
                oDataGeneral.setProperty("/SearchName", data.SearchName);
                oDataGeneral.setProperty("/Commentary", data.Commentary);
                oDataGeneral.setProperty("/Language", data.Language);
                
                oDataSuppliers.setProperty("/MobilePhone", data.MobilePhone);
                oDataSuppliers.setProperty("/Phone", data.Phone);

                data.Emails.forEach((element) => {element.BPRequestChangeID = this.uuid;});
                oDataListEmails.setData(data.Emails);
                data.Banks.forEach((element) => {element.BPRequestChangeID = this.uuid;});
                oDataListBanks.setData(data.Banks);
                data.ContactPersons.forEach((element) => {element.BPRequestChangeID = this.uuid;});
                oDataListContactPerson.setData(data.ContactPersons);
                data.Companies.forEach((element) => {element.BPRequestChangeID = this.uuid;});
                oDataListSociety.setData(data.Companies);
                data.PurchasingOrganizations.forEach((element) => {element.BPRequestChangeID = this.uuid;});
                oDataListPurchaseOrg.setData(data.PurchasingOrganizations);

        },
        validateComercialBank: function(oModel,oBank){
            var sBancoNacion = oThat.aBancoNacion[0].results[0].ValueLow;
            var bReturn = true;

                if (oBank.BankID !== sBancoNacion){
                    var aBanks = oThat.getView().getModel("listBanks").getData();
                    for (var t=0 ; t <aBanks.length; t++){
                        if (oBank.BankID !== aBanks[0].BankID && aBanks[0].BankID !== sBancoNacion)
                        return false;
                    }
                }
                return bReturn;
        },
        // Obtener la lista del Matchcode de Cuenta asociada del tab de Sociedad
        onGetAssociatedAccountMockup: function () {
            try {
               oThat.onState(true, "account");
               var oModel = models.createModelBPMockup();
               oModel.setSizeLimit(999999999);
               oThat.getView().setModel(oModel, "DataGeneral");
                        
            } catch (oError) {
                oThat.onErrorMessage(oError, "errorSave");
            }
        }
    });
});