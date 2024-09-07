/* eslint-disable complexity */
/* eslint-disable max-statements */
sap.ui.define(
    [
        "../controller/BaseController",
        "sap/m/MessageBox",
        "./utilities",
        "sap/ui/core/routing/History",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/export/Spreadsheet",
        "../model/formatter",
        "sap/ui/model/Sorter",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/m/BusyDialog",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/UploadCollection",
        "../model/DocumentService",
        "../utils/xml",
        "../service/oData",
        "sap/ui/core/BusyIndicator",
        "../service/SharePoint",
        "../service/Sunat",
        "sap/base/Log",
    ],
    function (
        BaseController,
        MessageBox,
        Utilites,
        History,
        MessageToast,
        Filter,
        FilterOperator,
        Spreadsheet,
        Formatter,
        Sorter,
        JSONModel,
        Fragment,
        BusyDialog,
        Dialog,
        Button,
        UploadCollection,
        DocumentService,
        xmljs,
        oDataService,
        BusyIndicator,
        SharePoint,
        Sunat,
        Log
    ) {
        "use strict";
        $._oMessageTemplate = new sap.m.MessagePopoverItem({
            type: "{type}",
            title: "{title}",
            description: "{description}",
            subtitle: "{subtitle}",
            counter: "{counter}",
        });
        $._oMessagePopover = new sap.m.MessagePopover({
            items: {
                path: "/",
                template: $._oMessageTemplate,
            },
        });
        $._popoverData = [];
        $._popoverCount = 0;
        $._popoverModel = new sap.ui.model.json.JSONModel();
        var m;
        var b;
        var sUri = "",
            sAmbient = "",
            sProject = "",
            sTypeRepository = "SHAREPOINT", //Textos validos son, DOCUMENTSERVICE y SHAREPOINT
            sRouteDialog = "com.everis.suppliers.invoiceregister.view.dialog",
            aTag = [];

        var RegexElectronic = /^[a-zA-Z0-9]{4}[-]\d\d*$/;
        var RegexAlphaNumeric = /^[a-zA-Z0-9][a-zA-Z0-9]*$/;
        var RegexNotElectronic = /^\d\d\d\d[-]\d\d*$/;

        return BaseController.extend("com.everis.suppliers.invoiceregister.controller.CabeceraOc", {
            formatter: Formatter,
            onInit: function () {
                this.uri = sUri;
                //this._byId("smartFilterBar")._oSearchButton.setText(this.getI18nText("txtbtnsearch"));
                var otableMode = new JSONModel({
                    tableMode: "SingleSelectLeft",
                });
                this.getView().setModel(otableMode, "EventosModel");
                this.getView().getModel("EventosModel").updateBindings();
                this.oCboIndexuno = "0";
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oModel = this.getOwnerComponent().getModel();
                $._popoverModel.setData($._popoverData);
                $._oMessagePopover.setModel($._popoverModel);
                this.oCbo = [];
                this.bFlagEstateView = true;
                this.oRules = new Object();
                var oRegistro = new JSONModel({
                    Registro: [],
                });
                this.getView().setModel(oRegistro, "UploadModel");

                // TEST: Turn on Test mode when executed from localhost
                const bTestModeOn = window.location.host.includes("localhost");

                // Set configuration values
                this.oConfigModel = new JSONModel({
                    testModeOn: bTestModeOn,
                    devSunat: true,
                });

                this.initConfig();
                this.loadConstants();
            },
            initConfig: function () {
                if (this.oConfigModel.getProperty("/testModeOn")) {
                    Log.setLevel(Log.Level.DEBUG);
                }
            },
            loadConstants: function () {
                var that = this;
                oDataService.consult(this, "read", "/ListaSet").then((oResult) => {
                    var oModel = new JSONModel(oResult.results);
                    that.getView().setModel(oModel, "oModelConstants");
                }).catch((err) => {
                    Log.error("[SUPPLIERS]", err.toString());
                });
            },
            onAfterRendering: function (oEvent) {
                this.byId("POHeaderTable").setSticky(["ColumnHeaders", "HeaderToolbar"]);
                this._BusyDialog = new BusyDialog({
                    cancelButtonText: "Aceptar",
                    title: "Verificando Usuario",
                    customIcon: "none",
                    showCancelButton: false,
                });
                this._BusyDialog.open();
                this._BusyDialog.attachClose("", (e) => {
                    if (e.getParameters().cancelPressed) {
                        window.history.go(-1);
                    }
                });
                
                var that = this;
                //	this.readUserApiInfo().then(function (e) {
                this.readUserIasInfo().then((oUserModel) => {
                    oUserModel.getData().company = "0001";
                    this.getView().setModel(oUserModel, "Usuario");
                    var oUsuario = oUserModel.getData();
                    this.oModel.read(
                        "/ContactSet(Ruc='" +
                            (oUsuario.ruc ? oUsuario.ruc.trim() : '') +
                            "',Sociedad='" +
                            oUsuario.company +
                            "',Dni='')",
                        {
                            success: (oData, oResponse) => {
                                DocumentService.setCmisId(oData.Root);
                                let oDocumentService = {
                                    folder: oData.Folder,
                                    FolderId: oData.FolderId,
                                };
                                //Document Service
                                this.getView().setModel(new JSONModel(oDocumentService), "documentService");
                                if (oData.Partner1 !== "" || oData.Partner1 !== undefined) {
                                    var aFilters = [];
                                    var sFilterDateKey = this._byId("idCmbFecha").getSelectedKey();
                                    var sDocTypeSunat = this._byId("idCmbDocumentType").getSelectedKey();
                                    var oDate = this.fechaFiltro(sFilterDateKey, "idCmbFecha");
                                    aFilters.push(
                                        new Filter({
                                            path: "ItTaxIdNumber",
                                            operator: FilterOperator.EQ,
                                            value1: oData.Ruc,
                                        })
                                    );
                                    aFilters.push(
                                        new Filter({
                                            path: "ItCompanyId",
                                            operator: FilterOperator.EQ,
                                            value1: oData.Sociedad,
                                        })
                                    );
                                    aFilters.push(
                                        new Filter({
                                            path: "ClasePedido",
                                            operator: FilterOperator.EQ,
                                            value1: "0",
                                        })
                                    );
                                    aFilters.push(
                                        new Filter({
                                            path: "FECHA_FACTURA",
                                            operator: "GE",
                                            value1: oDate.startDate,
                                        })
                                    );
                                    aFilters.push(
                                        new Filter({
                                            path: "DocTypeSunat",
                                            operator: "EQ",
                                            value1: sDocTypeSunat,
                                        })
                                    );
                                    this.getView().setModel(new JSONModel(oData), "Contacto");
                                    var oPOHeaderTable = this.getView().byId("POHeaderTable");
                                    oPOHeaderTable._getSelectAllCheckbox().setEnabled(false);
                                    var aPOHeaderTableItems = oPOHeaderTable.getBinding("items");
                                    aPOHeaderTableItems.filter(
                                        new Filter({
                                            filters: aFilters,
                                            and: true,
                                        })
                                    );

                                    this.getDocumentTypeForTable(this, sDocTypeSunat);
                                    this._BusyDialog.close();
                                }
                                this._BusyDialog.setShowCancelButton(true);
                            },
                            error: function (oError) {
                                Log.error("[SUPPLIERS]", oError.toString());
                                that._BusyDialog.setText("Error al verificar usuario");
                                that._BusyDialog.setShowCancelButton(true);
                            },
                        }
                    );
                });

                BusyIndicator.show(0);
                //Se obtiene el token
                oDataService
                    .consult(this, "read", "/SPTokenSet('INVOICE')", "", "")
                    .then((response) => {
                        BusyIndicator.hide();
                        this.bearer = response.Token;
                        if (response.Token.length === 0) {
                            MessageBox.error(this.getI18nText("msgNotToken"));
                        }
                    })
                    .catch((err) => {
                        Log.error("[SUPPLIERS]", err.toString());
                    });

                //Se obtiene las costantes para guardar los archivos
                var aFilters = this.getFiltersConstant();
                oDataService
                    .consult(this, "read", "/ConfigurationSet", "", aFilters)
                    .then((response) => {
                        response = response.results;
                        //Se obtiene la url
                        sUri = response.find((oItem) => {
                            return oItem.Group1 === "SHAREPOINT" && oItem.Field === "URL";
                        });
                        if (sUri === undefined) {
                            MessageBox.error(this.getI18nText("msgNotUrl"));
                        } else {
                            sUri = sUri.ValueLow;
                            this.uri = sUri;
                        }
                        //Se obtiene la ruta de almacenamiento de archivos
                        sAmbient = response.find((oItem) => {
                            return oItem.Group1 === "SHAREPOINT" && oItem.Field === "LANDSCAPE";
                        });
                        if (sAmbient === undefined) {
                            MessageBox.error(this.getI18nText("msgNotRouteFolder"));
                        } else {
                            sAmbient = sAmbient.ValueLow;
                        }
                        //Se obtiene la ruta de almacenamiento de archivos
                        var sValue = response.find((oItem) => {
                            return oItem.Group1 === "SHAREPOINT" && oItem.Field === "ROOT_DIRECTORY";
                        });
                        if (sValue === undefined) {
                            MessageBox.error(this.getI18nText("msgNotRouteFolder"));
                        } else {
                            SharePoint.setValueRoot(sValue.ValueLow);
                        }
                        //Se obtiene la ruta de almacenamiento de archivos
                        sProject = response.find((oItem) => {
                            return oItem.Group1 === "SHAREPOINT" && oItem.Field === "PRE_REGISTER";
                        });
                        if (sProject === undefined) {
                            MessageBox.error(this.getI18nText("msgNotRouteFolder"));
                        } else {
                            sProject = sProject.ValueLow;
                        }
                        var aXmlTag = response.filter((oItem) => {
                            return oItem.Group1 === "XML_TAG" && oItem.Field === "DOCUMENT_TYPE";
                        });

                        for (var i = 0; i < aXmlTag.length; i++) {
                            var oXmlTag = aXmlTag[i];
                            aTag.push({
                                id: oXmlTag.ValueLow,
                                text: oXmlTag.ValueHigh,
                            });
                        }
                    })
                    .catch((err) => {
                        Log.error("[SUPPLIERS]", err.toString());
                    });
            },
            getDocumentTypeForTable: function (oThat, sCode) {
                var that = oThat;
                var aFilter = [];
                aFilter.push(
                    new Filter({
                        path: "Codigo",
                        operator: "EQ",
                        value1: sCode,
                    })
                );
                aFilter.push(
                    new Filter({
                        path: "Filter",
                        operator: "EQ",
                        value1: false,
                    })
                );
                oDataService
                    .consult(that, "read", "/DocumentTypeSet", "", aFilter)
                    .then((response) => {
                        BusyIndicator.hide();
                        response = response.results;
                        var aDocumentType = response;
                        
                        // +[EGT] {
                        //Aqui logica para indentificar documentos con Proveedor Electronico
                        //Descripcion = NoES_Factura
                        for (var tIndex in aDocumentType) {
                            if ({}.hasOwnProperty.call(aDocumentType, tIndex)) {
                                var oDocumentType = aDocumentType[tIndex];
                                if(oDocumentType.IsElectronicSupplier == undefined){
                                    var aDTSplit = oDocumentType.Descripcion.split("_");
                                    oDocumentType.IsElectronicSupplier = true;
                                    if(aDTSplit.length > 1 && aDTSplit[0].trim() == "NoES") {
                                        //NoES = No Electronic Supplier
                                        oDocumentType.IsElectronicSupplier = false;
                                        oDocumentType.Descripcion = aDTSplit[1];
                                    }
                                } 
                            }
                        }
                        // +[EGT] }
 
                        that.getModel("ModelGlobal").setProperty("/DocumentType", response);
                        // TODO: Se quita refresh(true), por error Cannot set property 'files' of undefined
                        that.getModel("ModelGlobal").refresh();
                    })
                    .catch((err) => {
                        Log.error("[SUPPLIERS]", err.toString());
                    });
            },
            onColumns: function () {
                var e = this._getSmartTable();
                if (e) {
                    e.openPersonalisationDialog("Columns");
                }
            },
            addMsg: function () {
                if (this.getOwnerComponent().getModel("oMsg")) {
                    var aMessages = this.getOwnerComponent().getModel("oMsg").arreglo;
                    for (var tIndex = 0; tIndex < aMessages.length; tIndex++) {
                        this._addPopoverMessage(aMessages[tIndex].type, aMessages[tIndex].title, aMessages[tIndex].msg);
                    }
                }
            },
            _handleMessagePopoverPress: function (oEvent) {
                if (!$._oMessagePopover.isOpen()) {
                    $._oMessagePopover.openBy(oEvent.getSource());
                } else {
                    $._oMessagePopover.close();
                }
            },
            _updatePopoverCounter: function () {
                $._popoverCount = $._popoverCount + 1;
                if (this.getView()) {
                    this.getView()
                        .byId("popoverButton")
                        .setText("Mensajes (" + $._popoverCount + ")");
                }
            },
            _addPopoverMessage: function (sType, sTitle, sDescription) {
                $._popoverData.unshift({
                    type: sType,
                    title: sTitle,
                    description: sDescription,
                });
                $._popoverModel.setData($._popoverData);
                this._updatePopoverCounter();
            },
            total: 0,
            onSelectCheckbox: function (oEvent) {
                var that = this;
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var oEventSource = oEvent.getSource();
                var oSelectData = oEventSource.getSelected();
                switch (sCustom) {
                    case "masive":
                        if (oSelectData) {
                            this.getView().getModel("EventosModel").setProperty("/tableMode", "MultiSelect");
                        } else {
                            this.getView().getModel("EventosModel").setProperty("/tableMode", "SingleSelectLeft");
                            this._byId("POHeaderTable").removeSelections();
                        }
                        var oPOHeaderTable = this._byId("POHeaderTable");
                        //var o = r.getSelectedItems();
                        this.total = 0;
                        var oUploadModel = oSource.getModel("UploadModel");
                        var iIndexRegistro = oUploadModel
                            .getData()
                            .Registro.findIndex((tItem) => tItem.DN_NUMBER === "Masivo" && tItem.PO_NUMBER === "Masivo");
                        if (iIndexRegistro >= 0) {
                            oUploadModel.getData().Registro.splice(iIndexRegistro, 1);
                            oUploadModel.refresh();
                        }
                        var aPOHeaderTableItems = oPOHeaderTable.getItems();
                        oUploadModel = oSource.getModel("UploadModel");
                        if (oSelectData) {
                            oPOHeaderTable._getSelectAllCheckbox().setEnabled(true);
                            for (var tIndex in aPOHeaderTableItems) {
                                if ({}.hasOwnProperty.call(aPOHeaderTableItems, tIndex)) {
                                    //Duro
                                    var aCells = aPOHeaderTableItems[tIndex].getCells();
                                    aCells[8].setValue("");
                                    aCells[9].setValue("");
                                    aCells[10].setValue("");
                                }
                            }
                            oUploadModel.setProperty("/Registro", []);
                        } else {
                            oPOHeaderTable._getSelectAllCheckbox().setEnabled(false);
                            for (var tIndex in aPOHeaderTableItems) {
                                if ({}.hasOwnProperty.call(aPOHeaderTableItems, tIndex)) {
                                    var aCells = aPOHeaderTableItems[tIndex];
                                    aCells.getMultiSelectControl().setSelected(false);
                                }
                            }
                        }
                        that.getModel("ModelGlobal").setProperty("/Masive", oSelectData);
                        break;
                    case "electronicsupplier":
                        that.getModel("ModelGlobal").setProperty("/ElectronicSupplier", oSelectData);
                        break;
                    default:
                }
            },
            enableAllTable: function () {
                var that = this;
                var oPOHeaderTable = this._byId("POHeaderTable");
                var aItems = oPOHeaderTable.getItems();
                var aSelectdItems = oPOHeaderTable.getSelectedItems();
                that.getModel("ModelGlobal").setProperty("/Masive", false);
            },
            onSelectionChangeTable: function (oEvent) {
                var that = this;
                var reader = new FileReader();
                //var r = oEvent.getSource().getId();
                var bChkMASIVO = that._byId("chkMASIVO").getSelected();
                var bElectronicSupplier = that.getModel("ModelGlobal").getProperty("/ElectronicSupplier");
                var sMessage = "";
                if (!oEvent.getParameters().listItem.getSelected()) {
                    var aCells = oEvent.getParameters().listItem.getCells();
                    if (!bChkMASIVO) {
                        //duro
                        aCells[7].setEnabled(true);
                        aCells[8].setEnabled(true);
                        aCells[9].setEnabled(true);
                        aCells[10].setEnabled(true);
                        aCells[11].setEnabled(true);
                    }
                    return;
                } else {
                    if (!bChkMASIVO) {
                        that.enableAllTable();
                        that.oRules = oEvent.getParameters().listItem.getBindingContext().getObject();
                        if (
                            that.oRules.REFERENCE === "" &&
                            (that.oRules.FechaFacturaP === null || that.oRules.FechaFacturaP === "") &&
                            that.oRules.HEADER_TEXT === ""
                        ) {
                            oEvent.getParameters().listItem.setSelected(false);
                            return MessageToast.show("Ingrese Número de Factura, Fecha, texto de cabecera");
                        } else {
                            if (that.oRules.REFERENCE === "") {
                                sMessage = sMessage === "" ? "Ingrese Número de factura" : "";
                            } else if (that.oRules.FechaFacturaP === null) {
                                sMessage = sMessage === "" ? "Ingrese fecha factura" : sMessage.concat(", fecha factura");
                            } else if (that.oRules.HEADER_TEXT === "") {
                                sMessage = sMessage === "" ? "Ingrese texto de cabecera" : sMessage.concat(", texto de cabecera");
                            } else if (that.oRules.DescripcionGrHes === "") {
                                sMessage = sMessage === "" ? "No se puede hacer el pre registro a este documento" : sMessage.concat(", no se puede hacer el pre registro a este documento");
                            }
                            if (sMessage !== "") {
                                oEvent.getParameters().listItem.setSelected(false);
                                return MessageToast.show(sMessage);
                            }
                        }
                        var _oModel = that.getView().getModel();
                        var oUsuario = that.getView().getModel("Usuario").getData();
                        var sRuc = oUsuario.ruc;
                        var sBukrs = oUsuario.company;
                        var sNumfactura = that.oRules.TIPDOCREFERENCE + "-" + that.oRules.REFERENCE;
                        return new Promise(function (resolve, reject) {
                            _oModel.read("/InvoiceNumberSet(Numfactura='" + sNumfactura + "',Bukrs='" + sBukrs + "')", {
                                success: function (oSuccess) {
                                    resolve(oSuccess.Message);
                                },
                                error: function (oError) {
                                    reject("Error");
                                },
                            });
                        }).then(function (response) {
                            /*var sPath = that.oModel.createKey("/ReferenceSet", {
							Xblnr: u,
							Nif: d
						});
						oDataService.consult(that, "read", sPath, "", "").then(response => {
							BusyIndicator.hide();
							that.invoiceAlreadyRegistered(that, response, a, l);
						}).catch(err => {
							console.log(err);
						});*/
                            var oUploadModel = that.getView().getModel("UploadModel");
                            var oUploadData = oUploadModel.getData();
                            oUploadData = oUploadData.Registro.filter(
                                (tItem) => tItem.DN_NUMBER === that.oRules.DN_NUMBER && tItem.PO_NUMBER === that.oRules.PO_NUMBER
                            );
                            if (oUploadData.length === 0) {
                                oUploadModel.getData().Registro.push({
                                    DN_NUMBER: that.oRules.DN_NUMBER,
                                    PO_NUMBER: that.oRules.PO_NUMBER,
                                    DescripcionGrHes: that.oRules.DescripcionGrHes, // TODO: Se usa? sirve?
                                    uploadCollection: [],
                                    blobs: [],
                                    xml: {
                                        name: "",
                                    },
                                    pdf: {
                                        name: "",
                                    },
                                });
                                oUploadModel.refresh();
                                oUploadData = oUploadModel.getData().Registro;
                            }
                            if (oUploadData[0].xml.name === "" && bElectronicSupplier) {
                                return MessageBox.error(that.getI18nText("msgAttachmentInvoiceXml"));
                            } else if (oUploadData[0].pdf.name === "" && !bElectronicSupplier) {
                                return MessageBox.error(that.getI18nText("msgAttachmentInvoicePdf"));
                            }
                            oUploadModel.refresh();
                            if (that.onValidateFormatoNFactura(sNumfactura) && bElectronicSupplier) {
                                var oFileXml = oUploadData[0].xml.file;
                                var oBlobs = oUploadData[0].blobs;
                                var aFile = [];
                                aFile.push(oFileXml);
                                aFile.push(oUploadData[0].pdf.file);
                                //var oFileXml = o[0].blobs.filter(e => e.type === "text/xml");
                                if (xmljs.onValidationAdjunt(aFile) || xmljs.onValidationAdjuntOtros(oBlobs)) {
                                    that.byId("POHeaderTable").getSelectedItem().setSelected(false);
                                } else {
                                    reader.onload = function (oEvent) {
                                        var oDataValidation = Object.assign({}, that.oRules);
                                        oDataValidation.tipodocumento = oDataValidation.TIPDOCREFERENCE;
                                        oDataValidation.fechaFactura = oDataValidation.FechaFacturaP;
                                        oDataValidation.moneda = oDataValidation.CURRENCY;
                                        oDataValidation.numeroFactura = oDataValidation.REFERENCE;
                                        oDataValidation.rucSociedad = oDataValidation.CompanyNif;
                                        that.setSunatVariables(that);
                                        var oXmlValidation = that.xmlValidation(
                                            that,
                                            oEvent,
                                            oDataValidation,
                                            false,
                                            aTag
                                        );
                                        // Sunat.getSunatStatus(that.getView().getModel("sunatVariables").getData(), that)
                                        //     .then((nSunat) => {
                                                // if (that.oConfigModel.getProperty("/devSunat")) {
                                                //     switch (nSunat) {
                                                //         case -1:
                                                //             oXmlValidation = {
                                                //                 Valid: false,
                                                //                 TextI18n: "msgsunatstatusresponse",
                                                //             };
                                                //             break;
                                                //         case 0:
                                                //             oXmlValidation = {
                                                //                 Valid: false,
                                                //                 TextI18n: "msgsunatstatuserror",
                                                //             };
                                                //             break;
                                                //         default:
                                                //             oXmlValidation = {
                                                //                 Valid: true,
                                                //             };
                                                //             break;
                                                //     }
                                                // }

                                                if (oXmlValidation.Error) {
                                                    that.byId("POHeaderTable").getSelectedItem().setSelected(false);
                                                    return MessageBox.error(oXmlValidation.TextError);
                                                } else if (!oXmlValidation.Valid) {
                                                    that.byId("POHeaderTable").getSelectedItem().setSelected(false);
                                                    return MessageBox.error(that.getI18nText(oXmlValidation.TextI18n));
                                                }

                                                var aPOHeaderCells = that.byId("POHeaderTable").getSelectedItem().getCells();
                                                //Duro
                                                aPOHeaderCells[7].setEnabled(false);
                                                aPOHeaderCells[8].setEnabled(false);
                                                aPOHeaderCells[9].setEnabled(false);
                                                aPOHeaderCells[10].setEnabled(false);
                                                aPOHeaderCells[11].setEnabled(false);
                                                sMessage = sRuc + "-" + sNumfactura;
                                            // })
                                            // .catch((err) => {
                                            //     Log.error("[SUPPLIERS]", err.toString());
                                            // });
                                    };
                                    reader.onerror = function (e) {
                                        MessageToast.show("Error al leer documento XML");
                                    };
                                    reader.readAsBinaryString(oFileXml);
                                }
                            } else {
                                if (oUploadData[0].pdf.name === "" && !bElectronicSupplier) {
                                    return MessageBox.error(that.getI18nText("msgAttachmentInvoicePdf"));
                                }
                                //var h = that.getView().getModel("Usuario").getData();
                            }
                        });
                    }
                }
            },
            onChangeType: function (e) {},
            deleteDuplicates: function (aData) {
                return aData.reduce(
                    function (previous, current) {
                        var aTemp = [current.PO_NUMBER, current.DnNumber, current.ITEMNUMBER, current.LINENUMBER].join("|");
                        if (previous.temp.indexOf(aTemp) === -1) {
                            previous.out.push(current);
                            previous.temp.push(aTemp);
                        }
                        return previous;
                    },
                    {
                        temp: [],
                        out: [],
                    }
                ).out;
            },
            setSunatVariables: function (that) {
                let oSunatVariables = {
                    numRuc: "",
                    codComp: "",
                    numeroSerie: "",
                    numero: "",
                    fechaEmision: "",
                    monto: "",
                    numRucAcreedor: "",
                };
                that.getView().setModel(new sap.ui.model.json.JSONModel(oSunatVariables), "sunatVariables");
            },
            onValidateDate: function (oEvent) {
                var oParameter = oEvent.getParameter("valid");
                if (!oParameter) {
                    oEvent.getSource().setValue("");
                    return MessageBox.error("Fecha Incorrecta.");
                } else {
                    var aConstants = this.getView().getModel("oModelConstants").getData();
                    var sDocSunatDate = aConstants.find((oConstant) => {
                        return oConstant.FIELD === "DOC_SUNAT_DATE"
                    }).VALUE_LOW;
                    var oDocSunatDate = new Date(`${sDocSunatDate.split(".")[2]}-${sDocSunatDate.split(".")[1]}-${sDocSunatDate.split(".")[0]}`);
                    var oSelectedDate = new Date(oEvent.getParameter("value"));
                    if (oSelectedDate < oDocSunatDate) {
                        oEvent.getSource().setValue("");
                        if (this.getModel("Masivo")) {
                            this.getModel("Masivo").setProperty("/0/numeroFactura", "");
                            this.getModel("Masivo").setProperty("/0/fechaFactura", "");
                        }
                        return MessageBox.error(`${this.getI18nText("msginvoicedatetooold")} ${sDocSunatDate}.`);
                    }
                }
            },
            onChangeInputReference: function (oEvent) {
                var that = this;
                var oSource = oEvent.getSource();
                var oItemSelected = {};
                var Regex;
                var sTypeDocument = "";
                var sRuc = that.getView().getModel("Usuario").getData().ruc;
                var bMasive = that.getView().getModel("ModelGlobal").getProperty("/Masive");
                var bElectronicSupplier = this.getModel("ModelGlobal").getProperty("/ElectronicSupplier");
                try {
                    if (!bMasive) {
                        oItemSelected = oSource.getBindingContext().getObject();
                        sTypeDocument = oItemSelected.TIPDOCREFERENCE;
                    } else {
                        oItemSelected = oSource.getBindingContext("Masivo").getObject();
                        sTypeDocument = oItemSelected.tipodocumento;
                    }
                    if (bElectronicSupplier) {
                        Regex = RegexElectronic;
                    } else {
                        Regex = RegexNotElectronic;
                        if (sTypeDocument === "14" || sTypeDocument === "91") {
                            Regex = RegexAlphaNumeric;
                        }
                    }
                    var sValue = oSource.getValue().toUpperCase().replace(/\s/g, "");
                    sValue = sValue.toUpperCase();
                    //Valida el formato
                    if (Regex.test(sValue)) {
                        if (!/[^a-zA-Z0-9-]/.test(sValue)) {
                            if (!this.onValidateFormatoNFactura(sValue) && bElectronicSupplier) {
                                oSource.setValue("");
                                return MessageBox.error(that.getI18nText("msgFormatForElectronicSupplier") + sValue);
                            }
                            if (sTypeDocument !== "14" && sTypeDocument !== "91") {
                                var iNumber = sTypeDocument === "02" ? 7 : 8;
                                var sDocumento = sTypeDocument + "-" + Formatter.formatoReferencia(sValue, iNumber);
                                BusyIndicator.show(0);
                                //Valida si el documento ya existe en sap
                                var sPath = that.oModel.createKey("/ReferenceSet", {
                                    Xblnr: sDocumento,
                                    Nif: sRuc,
                                });
                                oDataService
                                    .consult(that, "read", sPath, "", "")
                                    .then((response) => {
                                        BusyIndicator.hide();
                                        if(that.invoiceAlreadyRegistered(that, response, oSource)) {
                                            oSource.setValue(Formatter.formatoReferencia(sValue, iNumber).toUpperCase());
                                        }
                                    })
                                    .catch((err) => {
                                        Log.error("[SUPPLIERS]", err.toString());
                                    });
                            } else {
                                oSource.setValue(sValue.toUpperCase());
                            }
                        } else {
                            return MessageBox.error(that.getI18nText("msgNotSpecialCharacter"));
                        }
                    } else {
                        if (/[^a-zA-Z0-9-]/.test(sValue)) {
                            return MessageBox.error(that.getI18nText("msgNotSpecialCharacter"));
                        }
                        var sFormat = that.getI18nText("msgFormatInvoice");
                        var sStructureFormat = "";
                        if (sTypeDocument !== "14" && sTypeDocument !== "91") {
                            if (sTypeDocument === "02") {
                                sStructureFormat = that.getI18nText("plhStrucRxHNoElectronic");
                            } else {
                                sStructureFormat = that.getI18nText("plhStrucInvNoElectronic");
                            }
                        } else {
                            sStructureFormat = that.getI18nText("plhStrucServPuElectronic");
                        }
                        return MessageBox.error(sFormat + " " + sStructureFormat);
                    }
                } catch (err) {
                    MessageToast.show(err);
                }
            },
            onValidaNumeroFactura: function (oSource) {
                var that = this;
                return new Promise((resolve, reject) => {
                    //var oSource = oEvent.getSource();
                    var oItemSelected = {};
                    var Regex;
                    var sTypeDocument = "";
                    var sRuc = that.getView().getModel("Usuario").getData().ruc;
                    var bMasive = that.getView().getModel("ModelGlobal").getProperty("/Masive");
                    var bElectronicSupplier = this.getModel("ModelGlobal").getProperty("/ElectronicSupplier");
                    try {
                        if (!bMasive) {
                            oItemSelected = oSource.getBindingContext().getObject();
                            sTypeDocument = oItemSelected.TIPDOCREFERENCE;
                        } else {
                            oItemSelected = oSource.getBindingContext("Masivo").getObject();
                            sTypeDocument = oItemSelected.tipodocumento;
                        }
                        if (bElectronicSupplier) {
                            Regex = RegexElectronic;
                        } else {
                            Regex = RegexNotElectronic;
                            if (sTypeDocument === "14" || sTypeDocument === "91") {
                                Regex = RegexAlphaNumeric;
                            }
                        }
                        var sValue = oSource.getValue().toUpperCase().replace(/\s/g, "");
                        sValue = sValue.toUpperCase();
                        //Valida el formato
                        if (Regex.test(sValue)) {
                            if (!/[^a-zA-Z0-9-]/.test(sValue)) {
                                if (!this.onValidateFormatoNFactura(sValue) && bElectronicSupplier) {
                                    oSource.setValue("");
                                    MessageBox.error(that.getI18nText("msgFormatForElectronicSupplier") + sValue);
                                    resolve(false);
                                }
                                if (sTypeDocument !== "14" && sTypeDocument !== "91") {
                                    var iNumber = sTypeDocument === "02" ? 7 : 8;
                                    var sDocumento = sTypeDocument + "-" + Formatter.formatoReferencia(sValue, iNumber);
                                    BusyIndicator.show(0);
                                    //Valida si el documento ya existe en sap
                                    var sPath = that.oModel.createKey("/ReferenceSet", {
                                        Xblnr: sDocumento,
                                        Nif: sRuc,
                                    });
                                    oDataService
                                        .consult(that, "read", sPath, "", "")
                                        .then((response) => {
                                            BusyIndicator.hide();
                                            var isNotRegistered = that.invoiceAlreadyRegistered(that, response, oSource);
                                            if (isNotRegistered) {
                                                oSource.setValue(Formatter.formatoReferencia(sValue, iNumber).toUpperCase());
                                                resolve(true);
                                            }
                                            resolve(false);
                                        })
                                        .catch((err) => {
                                            Log.error("[SUPPLIERS]", err.toString());
                                        });
                                } else {
                                    oSource.setValue(sValue.toUpperCase());
                                    resolve(true);
                                }
                            } else {
                                MessageBox.error(that.getI18nText("msgNotSpecialCharacter"));
                                resolve(false);
                            }
                        } else {
                            if (/[^a-zA-Z0-9-]/.test(sValue)) {
                                MessageBox.error(that.getI18nText("msgNotSpecialCharacter"));
                                resolve(false);
                            }
                            var sFormat = that.getI18nText("msgFormatInvoice");
                            var sStructureFormat = "";
                            if (sTypeDocument !== "14" && sTypeDocument !== "91") {
                                if (sTypeDocument === "02") {
                                    sStructureFormat = that.getI18nText("plhStrucRxHNoElectronic");
                                } else {
                                    sStructureFormat = that.getI18nText("plhStrucInvNoElectronic");
                                }
                            } else {
                                sStructureFormat = that.getI18nText("plhStrucServPuElectronic");
                            }
                            MessageBox.error(sFormat + " " + sStructureFormat);
                            resolve(false);
                        }
                    } catch (err) {
                        MessageToast.show(err);
                    }
                });
            },
            onValidaNumeroFactura2: function (e) {
                var that = this;
                var t = this;
                var a = e.getValue();
                var r = a.toUpperCase().replace(/\s/g, "");
                var o = r.split("-");
                var i = o.join("");
                var n = "";
                var aCells = e.getParent().getCells();
                var l = aCells.find((oItem) => oItem.data("custom") === "selectDocumentType");
                if (l === undefined) {
                    n = aCells[0].getSelectedKey();
                } else {
                    n = aCells.find((oItem) => oItem.data("custom") === "selectDocumentType").getSelectedKey();
                    //n = oSource.getParent().getCells()[6].getSelectedKey();
                }

                var u = "";
                var d = this.getView().getModel("Usuario").getData().ruc;
                //var g = this.getView().getModel("Contacto").getData().Legalenty === "EE" ? true : false;
                var g = this.getModel("ModelGlobal").getProperty("/ElectronicSupplier");
                if (o.length === 2 && o[0].length == 4) {
                    if (!/[^a-zA-Z0-9]/.test(i)) {
                        if (/[a-zA-Z]/.test(i) && !g) {
                            e.setValue("");
                            MessageBox.error(that.getI18nText("msgFormatForElectronicSupplier") + o[0]);
                            return false;
                        }
                        if (g) {
                            if (!this.onValidateFormatoNFactura(o[0])) {
                                return MessageToast.show(
                                    "Proveedor registrado como emisor electrónico, por favor ingrese una factura electrónica."
                                );
                            }
                        }
                        u = n + "-" + Formatter.formatoReferencia(r);
                        BusyIndicator.show(0);
                        var sPath = that.oModel.createKey("/ReferenceSet", {
                            Xblnr: u,
                            Nif: d,
                        });
                        oDataService
                            .consult(that, "read", sPath, "", "")
                            .then((response) => {
                                BusyIndicator.hide();
                                that.invoiceAlreadyRegistered(that, response, e);
                            })
                            .catch((err) => {
                                Log.error("[SUPPLIERS]", err.toString());
                            });
                        e.setValue(Formatter.formatoReferencia(r));
                        return true;
                    } else {
                        MessageToast.show("No se permiten caracteres especiales");
                        return false;
                    }
                } else {
                    var sFormat = that.getI18nText("msgFormatInvoice");
                    var sStructureFormat = "";
                    if (g) {
                        sStructureFormat = that.getI18nText("plhStrucInvElectronic");
                    } else {
                        sStructureFormat = that.getI18nText("plhStrucInvNoElectronic");
                    }
                    MessageBox.error(sFormat + " " + sStructureFormat);
                    //MessageToast.show("N° Factura: Formato esperado XXXX-XXXXXXXX");
                    return false;
                }
                return true;
            },
            clearTable: function () {
                //var oChkMASIVO = this._byId("chkMASIVO");
                //    oChkMASIVO.setSelected(false);

                var oPOHeaderTable = this._byId("POHeaderTable");
                var oPOHeaderTSelectItems = oPOHeaderTable.getSelectedItems();
                
                //var r = oPOHeaderTable.getItems();
                oPOHeaderTable._selectAllCheckBox.setSelected(false);
                oPOHeaderTable._getSelectAllCheckbox().setEnabled(false);
                var oUploadModel = this.getView().getModel("UploadModel");
                for (var tIndex in oPOHeaderTSelectItems) {
                    if ({}.hasOwnProperty.call(oPOHeaderTSelectItems, tIndex)) {
                        //Duro
                        oPOHeaderTSelectItems[tIndex].getCells()[8].setValue("");
                        oPOHeaderTSelectItems[tIndex].getCells()[9].setValue("");
                        oPOHeaderTSelectItems[tIndex].getCells()[10].setValue("");
                        if (oPOHeaderTSelectItems[tIndex].getMultiSelectControl() !== undefined) {
                            oPOHeaderTSelectItems[tIndex].getMultiSelectControl().setSelected(false);
                        }
                        //Duro
                        oPOHeaderTSelectItems[tIndex].getCells()[7].setEnabled(true);
                        oPOHeaderTSelectItems[tIndex].getCells()[8].setEnabled(true);
                        oPOHeaderTSelectItems[tIndex].getCells()[9].setEnabled(true);
                        oPOHeaderTSelectItems[tIndex].getCells()[10].setEnabled(true);
                        oPOHeaderTSelectItems[tIndex].getCells()[11].setEnabled(true);
                    }
                }
                this.getModel("ModelGlobal").setProperty("/Masive", false);
                this.getModel("ModelGlobal").setProperty("/ElectronicSupplier", true);
                this.getView().getModel("EventosModel").setProperty("/tableMode", "SingleSelectLeft");
                oUploadModel.setProperty("/Registro", []);
                oUploadModel.refresh();
                oPOHeaderTable.removeSelections();
            },
            onDialogMCancel: function (oEvent) {
                this.getView().getModel("EventosModel").setProperty("/tableMode", "SingleSelectLeft");
                this.getView().getModel("EventosModel").updateBindings();
                this.getModel("ModelGlobal").setProperty("/Masive", false);
                this.clearTable();

                var oParent = oEvent.getSource().getParent();
                oParent.close();
            },
            onDialogMOk: async function (oEvent) {
                var that = this;
                var aMasivoData = that.getView().getModel("Masivo").getData();
                var sMessage = "";
                var oTablaMasivo = sap.ui.getCore().byId("idMasivoDialog--idTablaMasivo");
                var bExecute = true;
                for (var tIndex in aMasivoData) {
                    if ({}.hasOwnProperty.call(aMasivoData, tIndex)) {
                        var oMasivoData = aMasivoData[tIndex];
                        if (oMasivoData.numeroFactura === "" && oMasivoData.fechaFactura === "" && oMasivoData.textoCabecera === "") {
                            return MessageToast.show(
                                "Complete los campos Número de factura, fecha factura y texto de cabecera"
                            );
                        } else {
                            var bIsOk = await that.onValidaNumeroFactura(oTablaMasivo.getItems()[0].getCells()[1]);
                            if (!bIsOk) {
                                return;
                            }
                            if (oMasivoData.numeroFactura === "") {
                                sMessage = "Complete campo Número de factura";
                            }
                            if (oMasivoData.fechaFactura === "") {
                                sMessage = sMessage == "" ? "Complete campo fecha factura" : sMessage.concat(", fecha factura");
                            }
                            if (oMasivoData.textoCabecera === "") {
                                sMessage = sMessage == "" ? "Complete campo texto de cabecera" : sMessage.concat(", texto de cabecera");
                            }
                            if (sMessage !== "") {
                                return MessageToast.show(sMessage);
                            }
                        }
                    }
                }
                that.onMassivePreRegister();
            },
            onMassivePreRegister: function (oEvent) {
                var that = this;
                var reader = new FileReader();
                var aMasivoData = that.getView().getModel("Masivo").getData();
                var oInvoiceData = aMasivoData[0];
                var oPOHeaderTable = that._byId("POHeaderTable");
                var oPOHeaderTSelectItems = oPOHeaderTable.getSelectedItems();
                var oUsuario = that.getView().getModel("Usuario").getData();
                var _oModel = that.getView().getModel();
                var bElectronicSupplier = that.getModel("ModelGlobal").getData().ElectronicSupplier;

                for (var tIndex in oPOHeaderTSelectItems) {
                    if ({}.hasOwnProperty.call(oPOHeaderTSelectItems, tIndex)) {
                        var aCells = oPOHeaderTSelectItems[tIndex].getCells();
                        aCells
                            .find((oItem) => oItem.data("custom") === "selectDocumentType")
                            .setSelectedKey(oInvoiceData.tipodocumento);
                        //i[f].getCells()[6].setSelectedKey(r[0].tipodocumento);
                        if (oInvoiceData.tipodocumento === "01") {
                            var sTxtTotalValue = aCells
                                .find((oItem) => oItem.data("custom") === "txtTotalValueIgv")
                                .getText();
                            aCells.find((oItem) => oItem.data("custom") === "txtTotalValue").setText(sTxtTotalValue);
                            //i[f].getCells()[4].setText(i[f].getCells()[13].getText())
                        } else {
                            var sTxtTotalNoValue = aCells
                                .find((oItem) => oItem.data("custom") === "txtTotalValueNoIgv")
                                .getText();
                            aCells.find((oItem) => oItem.data("custom") === "txtTotalValue").setText(sTxtTotalNoValue);
                            //i[f].getCells()[4].setText(i[f].getCells()[12].getText())
                        }
                        /*i[f].getCells()[7].setValue(r[0].numeroFactura);
                        i[f].getCells()[8].setValue(r[0].fechaFactura);
                        i[f].getCells()[9].setValue(r[0].textoCabecera);*/
                        aCells.find((oItem) => oItem.data("custom") === "inputReference").setValue(oInvoiceData.numeroFactura);
                        aCells.find((oItem) => oItem.data("custom") === "dateInvoiceDate").setValue(oInvoiceData.fechaFactura);
                        aCells.find((oItem) => oItem.data("custom") === "inputHeader").setValue(oInvoiceData.textoCabecera);
                    }
                }
                
                var sInvoiceNumber = oInvoiceData.tipodocumento + "-" + oInvoiceData.numeroFactura;
                return new Promise(function (resolve, reject) {
                    var sBukrs = oUsuario.company;
                    _oModel.read("/InvoiceNumberSet(Numfactura='" + sInvoiceNumber + "',Bukrs='" + sBukrs + "')", {
                        success: function (oSuccess) {
                            resolve(that.Message);
                        },
                        error: function (oError) {
                            reject("Error");
                        },
                    });
                }).then(
                    function (response) {
                        var aDataMasivo = that.getView().getModel("Masivo").getData();
                        var oUploadModel = that.getView().getModel("UploadModel");
                        var oUploadData = oUploadModel.getData();
                        oUploadData = oUploadData.Registro.filter((tItem) => tItem.DN_NUMBER === "Masivo" && tItem.PO_NUMBER === "Masivo");
                        if (oUploadData.length === 0) {
                            oUploadModel.getData().Registro.push({
                                DN_NUMBER: "Masivo",
                                PO_NUMBER: "Masivo",
                                DescripcionGrHes: "",
                                uploadCollection: [],
                                blobs: [],
                                xml: {
                                    name: "",
                                },
                                pdf: {
                                    name: "",
                                },
                            });
                            oUploadModel.refresh();
                            oUploadData = oUploadModel.getData().Registro;
                        }
                        /*if (n[0].blobs.length === 0) {
					return MessageToast.show("Es necesario adjuntar un archivo");
				}*/
                        if (oUploadData[0].xml.name === "" && bElectronicSupplier) {
                            return MessageBox.error(that.getI18nText("msgAttachmentInvoiceXml"));
                        } else if (oUploadData[0].pdf.name === "" && !bElectronicSupplier) {
                            return MessageBox.error(that.getI18nText("msgAttachmentInvoicePdf"));
                        }
                        _oModel.refresh();
                        if (that.onValidateFormatoNFactura(oInvoiceData.numeroFactura) && bElectronicSupplier) {
                            //var oFileXml = n[0].xml.filter(e => e.type === "text/xml");
                            var oFileXml = oUploadData[0].xml.file;
                            var oBlobs = oUploadData[0].blobs;
                            var aFile = [];
                            aFile.push(oFileXml);
                            aFile.push(oUploadData[0].pdf.file);
                            if (!xmljs.onValidationAdjunt(aFile) || xmljs.onValidationAdjuntOtros(oBlobs)) {
                                reader.onload = function (oEvent) {
                                    var oDataValidation = Object.assign({}, aDataMasivo[0]);
                                    that.setSunatVariables(that);
                                    var oXmlValidation = that.xmlValidation(that, oEvent, oDataValidation, true, aTag);

                                    // Sunat.getSunatStatus(that.getView().getModel("sunatVariables").getData(), that)
                                    //     .then((nSunat) => {
                                    //         if (that.oConfigModel.getProperty("/devSunat")) {
                                    //             switch (nSunat) {
                                    //                 case -1:
                                    //                     oXmlValidation = {
                                    //                         Valid: false,
                                    //                         TextI18n: "msgsunatstatusresponse",
                                    //                     };
                                    //                     break;
                                    //                 case 0:
                                    //                     oXmlValidation = {
                                    //                         Valid: false,
                                    //                         TextI18n: "msgsunatstatuserror",
                                    //                     };
                                    //                     break;
                                    //                 default:
                                    //                     oXmlValidation = {
                                    //                         Valid: true,
                                    //                     };
                                    //                     break;
                                    //             }
                                    //         }

                                            if (oXmlValidation.Error) {
                                                return MessageBox.error(oXmlValidation.TextError);
                                            } else if (!oXmlValidation.Valid) {
                                                return MessageBox.error(that.getI18nText(oXmlValidation.TextI18n));
                                            }
                                        // })
                                        // .catch((err) => {
                                        //     Log.error("[SUPPLIERS]", err.toString());
                                        // });
                                    //that.onRegistrar();
                                    that.onRegistrarwithCheckServiceWsdl(aDataMasivo[0]); //CAMBIO WSDL
                                    that._getDialogM.close();
                                };
                                reader.onerror = function (e) {
                                    MessageToast.show("Error al leer documento XML");
                                };
                                reader.readAsBinaryString(oFileXml);
                            }
                        } else {
                            if (oUploadData[0].pdf.name === "" && !bElectronicSupplier) {
                                return MessageBox.error(that.getI18nText("msgAttachmentInvoicePdf"));
                            }

                            /*if (n[0].blobs.length > 1) {
                                return MessageToast.show("Solo se permite adjuntar un archivo PDF");
                            }
                            var h = n[0].blobs.filter(e => e.type === "application/pdf");
                            if (h.length === 0) {
                                return MessageToast.show("Archivo PDF obligatorio!");
                            } else if (h.length > 1) {
                                return MessageToast.show("Solo se permite un archivo PDF");
                            }*/

                            //that.onRegistrar();
                            that.onRegistrarwithCheckServiceWsdl(aDataMasivo[0]); //CAMBIO WSDL
                            that._getDialogM.close();
                        }
                        //that.getView().getModel("EventosModel").setProperty("/tableMode", "SingleSelectLeft");
                    },
                    function (err) {
                        Log.error("[SUPPLIERS]", err.toString());
                    }
                );
            },

            onValidRegisterWSDL: function (oDataReceive, oDataCredential, RUC) {
                return new Promise((resolve) => {
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
		         <ws:tipoDoc>${oDataReceive.TIPDOCREFERENCE || oDataReceive.tipodocumento}</ws:tipoDoc>
		         <ws:folio>${oDataReceive.REFERENCE || oDataReceive.numeroFactura}</ws:folio>
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
                            MessageBox.error(err);
                        },
                    });
                });
            },

            onRegistrarwithCheckServiceWsdl: function (data) {
                var aFilter = [];

                Log.info("[SUPPLIERS]", $._popoverModel);

                aFilter.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
                aFilter.push(new Filter("Group1", "EQ", "INVOICEREG"));
                aFilter.push(new Filter("Field", "EQ", "WS_USER"));
                aFilter.push(new Filter("Field", "EQ", "WS_PASSWORD"));
                aFilter.push(new Filter("Field", "EQ", "WS_RUC"));
                aFilter.push(new Filter("Field", "EQ", "WS_TIPO_DOC"));
                aFilter.push(new Filter("Field", "EQ", "WS_TIPO_RETORNO"));
                aFilter.push(new Filter("Field", "EQ", "WS_OK_CODE"));

                var oModelGlobal = this.getOwnerComponent().getModel("ModelGlobal");
                var bCheckFactura = oModelGlobal.getProperty("/CheckFactura");

                var oModelContacto = this.getView().getModel("Contacto");
                var RUC = oModelContacto.getProperty("/Ruc");

                var oJSONCredentials = {};

                oDataService
                    .consult(this, "read", "/ConfigurationSet", "", aFilter)
                    .then((response) => {
                        response = response.results;

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

                        if (bCheckFactura) {
                            return this.onValidRegisterWSDL(data, oJSONCredentials, RUC);
                        } else {
                            this.onRegistrar();
                        }
                    })
                    .then((oResultData) => {
                        if (oResultData) {
                            var xReturn = oResultData.oResult.getElementsByTagName("ns:return");
                            var sValue = xReturn[0].childNodes[0].nodeValue;

                            var DOM = new DOMParser();
                            var oValue = DOM.parseFromString(sValue, "text/xml");

                            var CoderResult = oValue.getElementsByTagName("Codigo")[0].textContent;

                            if (CoderResult === oJSONCredentials.code_ok.ValueLow) {
                                this.onRegistrar();
                            } else {
                                this._addPopoverMessage("Error", "Error al verificar la información", sValue);

                                MessageBox.error("Error al verificar la información", {
                                    title: "Error",
                                    id: "messageBoxId1",
                                    details: sValue,
                                    contentWidth: "100px",
                                });
                            }
                        }
                    });
            },

            onDialogMasivo: function () {
                var that = this;
                if (!that._getDialogM) {
                    that._getDialogM = sap.ui.xmlfragment(
                        "idMasivoDialog",
                        "com.everis.suppliers.invoiceregister.view.fragments.Masivo",
                        that
                    );
                    that.getView().addDependent(that._getDialogM);
                }
                var oMasivo = [
                    {
                        tipodocumento: "01",
                        numeroFactura: "",
                        fechaFactura: "",
                        total: String(that.total),
                        textoCabecera: "",
                        moneda: that.moneda,
                        rucSociedad: that.rucSociedad,
                    },
                ];
                var oMasivoModel = new JSONModel(oMasivo);
                that.getView().setModel(oMasivoModel, "Masivo");
                that._getDialogM.open();
            },
            flag: false,
            onPreRegistrar: async function () {
                var that = this;
                var sMoneda = "";
                var oPOHeaderTable = this.getView().byId("POHeaderTable");
                var aSelectedItems = oPOHeaderTable.getSelectedItems();
                if (aSelectedItems.length === 0) {
                    return MessageToast.show("No ha seleccionado ninguno.");
                }
                this.total = 0;
                for (var tIndex in aSelectedItems) {
                    if ({}.hasOwnProperty.call(aSelectedItems, tIndex)) {
                        var oSelectItem = aSelectedItems[tIndex];
                        var sCurrentMoneda = oSelectItem.getCells()[6].getText();
                        //Duro
                        //var i = oSelectItem.getCells()[5].getText();
                        var oItem = oSelectItem.getBindingContext().getObject();
                        //	this.total += parseFloat(Number(i.replace(/,/g, "")));
                        this.total += parseFloat(Number(oItem.TOTAL_VALUE.replace(/,/g, "")));

                        //Validacion de registros selecionados que tengan la misma Moneda
                        if (tIndex - 1 >= 0) {
                            sMoneda = aSelectedItems[tIndex - 1].getCells()[6].getText(); //Moneda
                        }
                        if (sMoneda !== "" && sMoneda !== sCurrentMoneda) {
                            return MessageBox.error(that.getI18nText("msgDiffMoney"));
                        }

                        this.moneda = sCurrentMoneda;
                        this.rucSociedad = oItem.CompanyNif;
                    }
                }

                this.total = parseFloat(this.total).toFixed(2);
                var bSelectedChkMASIVO = this._byId("chkMASIVO").getSelected();
                var bExistStyleClass = !!this.getView().$().closest(".sapUiSizeCompact").length;
                var bIsOkNumFact = true;
                var oItemSelected;
                if (!bSelectedChkMASIVO) {
                    for (var tIndex in aSelectedItems) {
                        if ({}.hasOwnProperty.call(aSelectedItems, tIndex)) {
                            var oSelectedItems = aSelectedItems[tIndex];
                            //Duro
                            var oInputNumFact = oSelectedItems.getCells()[8];
                            oItemSelected = oSelectedItems.getBindingContext().getObject();
                            bIsOkNumFact = await this.onValidaNumeroFactura(oInputNumFact);
                            if (!bIsOkNumFact) {
                                return;
                            }
                        }
                    }
                }
                if (bIsOkNumFact || !bSelectedChkMASIVO) {
                    MessageBox.confirm("Desea pre-registrar?", {
                        actions: ["Si", "No"],
                        styleClass: bExistStyleClass ? "sapUiSizeCompact" : "",
                        onClose: function (t) {
                            if (t === "Si") {
                                if (bSelectedChkMASIVO) {
                                    that.flag = true;
                                    that.onDialogMasivo();
                                } else {
                                    for (var tIndex in aSelectedItems) {
                                        if ({}.hasOwnProperty.call(aSelectedItems, tIndex)) {
                                            //Duro
                                            if (
                                                aSelectedItems[tIndex].getCells()[8].getValue() === "" &&
                                                aSelectedItems[tIndex].getCells()[9].getValue() === "" &&
                                                aSelectedItems[tIndex].getCells()[10].getValue() === ""
                                            ) {
                                                return MessageBox.error(that.getI18nText("msgcompletefields"));
                                            }
                                        }
                                    }
                                    that.flag = false;
                                    //that.onRegistrar();
                                    that.onRegistrarwithCheckServiceWsdl(oItemSelected); //CAMBIO WSDL
                                }
                            } else {
                                
                                try {
                                    var aPOHeaderCells = that.byId("POHeaderTable");
                                    var aItems = aPOHeaderCells.getSelectedItem().getCells();
                                    //Duro
                                    aItems[7].setEnabled(true);
                                    aItems[8].setEnabled(true);
                                    aItems[9].setEnabled(true);
                                    aItems[10].setEnabled(true);
                                    aItems[11].setEnabled(true);
                                
                                    aPOHeaderCells.getSelectedItem().setSelected(false);

                                    if(that.oConfigModel.getProperty("/devSunat")){
                                        var oDataUploadAttachments = this["dialogUploadAttachments"].getModel("UploadAttachments").getData();
                                        oDataUploadAttachments.xml = {
                                            name: "",
                                        };
                                        that["dialogUploadAttachments"].getModel("UploadAttachments").refresh();
                                    }
                                    

                                } catch (oError) {
                                    Log.error("[SUPPLIERS]", oError.toString());
                                }
                                
                            }
                        },
                    });
                }
            },

            onRegistrar: function () {
                var that = this;
                var i18n = that.getView().getModel("i18n").getResourceBundle();
                var aItems = [];
                var oPOHeaderTable = that._byId("POHeaderTable");
                var aSelectItem = oPOHeaderTable.getSelectedItems();
                //var sKey = that.byId("idCmbTipoPed").getSelectedKey();
                for (var tIndex = 0; tIndex < aSelectItem.length; tIndex++) {
                    aItems.push(aSelectItem[tIndex].getBindingContext().getObject());
                }
                var oData = {};
                oData.arreglo = aItems;
                /*
                if (oData.arreglo[0].TIPDOCREFERENCE == "01") {
                    oData.arreglo[0].TIPDOCREFERENCE = "RE";
                }
                */
                var POHeaderData = new JSONModel(oData);
                that.getOwnerComponent().setModel(POHeaderData, "POHeader");
                
                var oPOHeaderData, oDetallePOData, aTableSelectItem;
                var oCabData = {};
                aTableSelectItem = aSelectItem;
                oCabData.arr = aSelectItem;
                that.getOwnerComponent().setModel(oCabData, "cab");
                if (that.getOwnerComponent().getModel("POHeader")) {
                    oPOHeaderData = JSON.parse(that.getOwnerComponent().getModel("POHeader").getJSON()).arreglo;
                }
                if (that.getOwnerComponent().getModel("oDetallePO")) {
                    oDetallePOData = JSON.parse(that.getOwnerComponent().getModel("oDetallePO").getJSON()).arreglo;
                    oDetallePOData = that.deleteDuplicates(oDetallePOData);
                }
                if (that.getOwnerComponent().getModel("cab")) {
                    aTableSelectItem = that.getOwnerComponent().getModel("cab").arr;
                }
                
                if (that.getOwnerComponent().getModel("POHeader")) {
                    if (that.flag) {
                        that.doRegistrar2(aTableSelectItem, oPOHeaderData, oDetallePOData, 0);
                    } else {
                        that.doRegistrar(aTableSelectItem, oPOHeaderData, oDetallePOData, 0);
                    }
                } else {
                    MessageToast.show(i18n.getText("NoPos"));
                }
            },
            doRegistrar2: function (aTableSelectItem, aHeaderData, aDetalleData, iIndex) {
                var aSelectCell = aTableSelectItem[iIndex].getCells();
                var oHeaderData = aHeaderData[iIndex];
                var oEntry = {};
                var oMasivoData = this.getView().getModel("Masivo").getData();
                var oUsuarioData = this.getView().getModel("Usuario").getData();
                var aConstants = this.getView().getModel("oModelConstants").getData();
                var bIsElectronicSupplier = this.getView().getModel("ModelGlobal").getData().ElectronicSupplier;
                var oModelXMLValue = {
                    TOTAL_VALUE: oMasivoData[0].total
                };
                if (bIsElectronicSupplier) {
                    oModelXMLValue = this.getView().getModel("oModelXMLValue").getData();
                }
                var sTipoDocumento = this.getView().byId("idCmbDocumentType").getSelectedKey();
                switch (sTipoDocumento) {
                    case "XX":
                        oEntry.DOCUMENTTYPE = "KR";
                        break;
                    case "NC":
                        oEntry.DOCUMENTTYPE = "KG";
                        break;
                    default:
                        oEntry.DOCUMENTTYPE = "KR";
                        break;
                }
                oEntry.ClasePedido = oHeaderData.ClasePedido;
                oEntry.SUPPLIERID = oUsuarioData.ruc;
                oEntry.PAYMENT_TERMS = "";
                oEntry.PO_NUMBER = "";
                //Duro
                oEntry.REFERENCE = oMasivoData[0].tipodocumento + "-" + aSelectCell[8].getValue();
                oEntry.TOTAL_VALUE = oMasivoData[0].total;
                oEntry.TOTAL_XML = oModelXMLValue.TOTAL_VALUE;
                oEntry.CURRENCY = oHeaderData.CURRENCY;
                oEntry.COMPANY_CODE = oHeaderData.ItCompanyId;
                oEntry.ORDER_DATE = "";
                oEntry.TYPE = "";
                oEntry.MESSAGE = "";
                oEntry.COMPANY = oHeaderData.COMPANY;
                //oEntry.DN_NUMBER = oHeaderData.DN_NUMBER;
                oEntry.DN_NUMBER = "";
                oEntry.HEADER_TEXT = oMasivoData[0].textoCabecera;
                oEntry.PSTYP = oHeaderData.PSTYP;
                oEntry.DocumentTypeId = oHeaderData.DocumentTypeId;
                oEntry.DocTypeSunat = oHeaderData.DocTypeSunat;
                oEntry.TIPDOCREFERENCE = oHeaderData.TIPDOCREFERENCE;
                //Duro
                var sDocDate = aSelectCell[9].getValue();
                oEntry.DOC_DATE = sDocDate.substring(0, 4) + sDocDate.substring(5, 7) + sDocDate.substring(8, 10);

                var aPosItems = [];
                for (var tIndex in aTableSelectItem) {
                    if ({}.hasOwnProperty.call(aTableSelectItem, tIndex)) {
                        var oItem = {};
                        var aTableCell = aTableSelectItem[tIndex].getCells();
                        var oHeader = aHeaderData[tIndex];

                        oItem.SUPPLIERID = oUsuarioData.ruc;
                        oItem.RNG_REQUEST_DATE = oMasivoData[0].fechaFactura;
                        oItem.RNG_COMPANY_ID = oHeader.ItCompanyId;
                        oItem.PO_NUMBER = oHeader.PO_NUMBER;
                        oItem.CURRENCY = oHeader.CURRENCY;
                        oItem.DN_NUMBER = oHeader.DN_NUMBER;
                        //Duro
                        oItem.WRBTR = aTableCell[5].getText().replace(/,/g, "");
                        // oItem.DM_NUMBER = aTableCell[1].getText();
                        oItem.DM_NUMBER = oHeader.DM_NUMBER;
                        aPosItems.push(oItem);
                    }
                }
                oEntry.RegHeaderToPos = aPosItems;
                oEntry.PoLineSet = [];
                this.serviceCreateInvoiceRegSet(this, oEntry, oHeaderData);
            },
            serviceCreateInvoiceRegSet: function (that, oEntry, oRegisterRow) {
                var that = this;
                var i18n = that.getView().getModel("i18n").getResourceBundle();
                var _oModel = that.getView().getModel();
                var sRucCompany = oRegisterRow.CompanyNif;
                _oModel.create("/InvoiceRegSet", oEntry, {
                    success: function (oData, oResponse) {
                        var oResponseData = oResponse.data;
                        if (oResponseData.TYPE === "E") {
                            MessageBox.error(oResponseData.MESSAGE);
                            if (oResponseData.MESSAGE.includes("tolerancia")) {
                                that._addPopoverMessage(
                                    "Error",
                                    i18n.getText("PopTitle") + oResponseData.REFERENCE,
                                    i18n.getText("msgtoleranceexceeded")
                                );
                            } else {
                                that._addPopoverMessage(
                                    "Error",
                                    i18n.getText("PopTitle") + oResponseData.REFERENCE,
                                    oResponseData.MESSAGE
                                );
                            }
                        } else {
                            MessageToast.show(oResponseData.MESSAGE);
                            that._addPopoverMessage(
                                "Success",
                                i18n.getText("PopTitle") + oResponseData.REFERENCE,
                                oResponseData.MESSAGE
                            );
                            //Variable para SharePoint
                            var sFolderNameFile = oResponseData.REFERENCE;
                            var oUploadModel = that.getView().getModel("UploadModel");
                            var oDocumentService = that.getView().getModel("documentService").getData();

                            var aUploadAttachments = oUploadModel
                                .getData()
                                .Registro.filter(
                                    (tItem) => tItem.DN_NUMBER === "Masivo" && tItem.PO_NUMBER === "Masivo"
                                )[0];

                            var oFechaDocumento = new Date();
                            oFechaDocumento.setFullYear(
                                oEntry.DOC_DATE.substr(0, 4),
                                oEntry.DOC_DATE.substr(4, 2) - 1,
                                oEntry.DOC_DATE.substr(6, 2)
                            );
                            var oAnexo = {
                                PO_NUMBER: oEntry.COMPANY_CODE,
                                RUC: oEntry.SUPPLIERID,
                                FOLIO: oEntry.REFERENCE,
                                RAZON_SOCIAL: "",
                                FECHA_DOCUMENTO: oFechaDocumento,
                                MONEDA: oEntry.CURRENCY,
                                AnexoToFile: [],
                            };
                            if (oUploadModel.ConexionPIPO === "X") {
                                oAnexo.MONTO = oUploadModel.TOTAL_XML;
                            } else {
                                oAnexo.MONTO = oUploadModel.TOTAL_VALUE;
                            }

                            var sDate = that.getDateRoute(new Date());
                            var sRoute = sAmbient + "/" + sProject + "/" + sRucCompany + "/" + sDate + "/" + oAnexo.RUC,
                                oDataDS = oDocumentService,
                                oParentResponse = oResponseData,
                                sMessageAnexo = oResponseData.REFERENCE;
                            var aUploadColletionItems = [];
                            var sReference = oData.REFERENCE;

                            if(aUploadAttachments){
                                //Archivos restantes
                                if (aUploadAttachments.blobs && aUploadAttachments.blobs.length > 0) {
                                    aUploadColletionItems = aUploadColletionItems.concat(aUploadAttachments.blobs);
                                }
                                //Xml de la factura
                                if (aUploadAttachments.xml.name !== "") {
                                    aUploadColletionItems.push(aUploadAttachments.xml.file);
                                }
                                //Pdf de la factura
                                if (aUploadAttachments.pdf.name !== "") {
                                    aUploadColletionItems.push(aUploadAttachments.pdf.file);
                                }
                            }
                            that.sFullPath = sRoute;
                            var sFileName = "";

                            var aFilesSharePoint = [],
                                oAnexoSet = oAnexo,
                                p = 0;

                            that.saveFilesInRepository(
                                that,
                                sTypeRepository,
                                aUploadColletionItems,
                                aUploadAttachments,
                                sFileName,
                                sReference,
                                aFilesSharePoint,
                                p,
                                oAnexoSet,
                                oParentResponse,
                                i18n,
                                sMessageAnexo,
                                sFolderNameFile,
                                oDataDS
                            );
                        }
                        that.getView().getModel().refresh();
                        that.clearTable();
                        that.sendData();
                    },
                    error: (oError) => {
                        MessageToast.show(i18n.getText("Error"));
                        that._addPopoverMessage(
                            "Error",
                            i18n.getText("PopTitle") + oEntry.REFERENCE,
                            i18n.getText("ErrorMsg")
                        );
                    },
                });
            },
            doRegistrar: function (aTable, aSelectedData, aPosItems, index) {
                var that = this;
                var i18n = that.getView().getModel("i18n").getResourceBundle();
                var _oModel = that.getView().getModel();
                var oTableIndex = aTable[index];
                var oSelectedData = aSelectedData[index];
                var oEntry = {};
                var oUsuario = that.getView().getModel("Usuario").getData();
                var aConstants = this.getView().getModel("oModelConstants").getData();
                oEntry.ConexionPIPO = "";
                var oChkPIPO = that._byId("chkPIPO");
                var oModelXMLValue = that.getView().getModel("oModelXMLValue") ? that.getView().getModel("oModelXMLValue").getData() : {TOTAL_VALUE: oTableIndex.getCells()[5].getText().replace(/,/g, "")};
                if (oChkPIPO.getSelected()) {
                    oEntry.ConexionPIPO = "X";
                    oModelXMLValue = that.getView().getModel("oModelXMLValue").getData();
                }
                var sDocumentType = oTableIndex
                    .getCells()
                    .find((oItem) => oItem.data("custom") === "selectDocumentType")
                    .getSelectedKey();
                var sReferenceValue = oTableIndex
                    .getCells()
                    .find((oItem) => oItem.data("custom") === "inputReference")
                    .getValue();
                var sTipoDocumento = this.getView().byId("idCmbDocumentType").getSelectedKey();
                switch (sTipoDocumento) {
                    case "XX":
                        oEntry.DOCUMENTTYPE = "KR";
                        break;
                    case "NC":
                        oEntry.DOCUMENTTYPE = "KG";
                        break;
                    default:
                        oEntry.DOCUMENTTYPE = "KR";
                        break;
                }
                oEntry.ClasePedido = oSelectedData.ClasePedido;
                oEntry.SUPPLIERID = oUsuario.ruc;
                oEntry.PAYMENT_TERMS = "";
                oEntry.PO_NUMBER = oSelectedData.PO_NUMBER;
                //	oEntry.REFERENCE = oTableIndex.getCells()[6].getSelectedKey() + "-" + oTableIndex.getCells()[7].getValue();
                oEntry.REFERENCE = sDocumentType + "-" + sReferenceValue;
                //Duro
                oEntry.TOTAL_VALUE = oTableIndex.getCells()[5].getText().replace(/,/g, "");
                oEntry.TOTAL_XML = oModelXMLValue.TOTAL_VALUE;
                oEntry.CURRENCY = oSelectedData.CURRENCY;
                oEntry.COMPANY_CODE = oSelectedData.ItCompanyId;
                oEntry.ORDER_DATE = "";
                oEntry.TYPE = "";
                oEntry.MESSAGE = "";
                oEntry.COMPANY = oSelectedData.COMPANY;
                //oEntry.DN_NUMBER = oTableIndex.getCells()[1].getText(); //Description GR/HES //-[EGT]
                oEntry.DN_NUMBER = oSelectedData.DN_NUMBER; //+[EGT]
                oEntry.DM_NUMBER = oSelectedData.DM_NUMBER;
                oEntry.PSTYP = oSelectedData.PSTYP;
                oEntry.DocumentTypeId = oSelectedData.DocumentTypeId;
                oEntry.DocTypeSunat = oSelectedData.DocTypeSunat;
                oEntry.TIPDOCREFERENCE = oSelectedData.TIPDOCREFERENCE;
                oEntry.HEADER_TEXT = oSelectedData.HEADER_TEXT;
                //Duro
                var sDocDate = oTableIndex.getCells()[9].getValue();
                oEntry.DOC_DATE = sDocDate.substring(0, 4) + sDocDate.substring(5, 7) + sDocDate.substring(8, 10);
                var aPosition = [];
                aPosItems = undefined;
                if (aPosItems) {
                    for (var aIndex = 0; aIndex < aPosItems.length; aIndex++) {
                        var oItem = aPosItems[aIndex];
                        if (oItem.PO_NUMBER === oEntry.PO_NUMBER) {
                            var oJson = {};
                            oJson.PO_NUMBER = oItem.PO_NUMBER;
                            oJson.PO_UNIT = oItem.PO_UNIT;
                            oJson.ItCompanyId = oItem.ItCompanyId;
                            oJson.ITEMNUMBER = oItem.ITEMNUMBER;
                            oJson.MATERIALNUMBER = oItem.MATERIALNUMBER;
                            //oJson.DN_NUMBER = oItem.DN_NUMBER;
                            oJson.ITEMDESCRIPTION = oItem.ITEMDESCRIPTION;
                            oJson.QUANTITY = oItem.QUANTITY.replace(/,/g, "");
                            oJson.UNITPRICE = oItem.UNITPRICE.replace(/,/g, "");
                            oJson.CURRENCY = oItem.CURRENCY;
                            oJson.SUBTOTAL = oItem.SUBTOTAL.replace(/,/g, "");
                            aPosition.push(oJson);
                        }
                    }
                }
                oEntry.RegHeaderToPos = [];
                oEntry.PoLineSet = [];
                if (oSelectedData.DocumentType === "SERVICIOS") {
                    oEntry.PoLineSet = aPosition;
                } else {
                    oEntry.RegHeaderToPos = aPosition;
                }
                var sRucCompany = oSelectedData.CompanyNif;
                BusyIndicator.show(0);
                _oModel.create("/InvoiceRegSet", oEntry, {
                    success: function (oData, oResponse) {

                        var oRespData = oResponse.data;
                        
                        if (oRespData.TYPE === "E") {
                            MessageBox.error(oRespData.MESSAGE);
                            if (oRespData.MESSAGE.includes("tolerancia")) {
                                that._addPopoverMessage(
                                    "Error",
                                    i18n.getText("PopTitle") + oRespData.DN_NUMBER,
                                    i18n.getText("msgtoleranceexceeded")
                                );
                            } else {
                                that._addPopoverMessage(
                                    "Error",
                                    i18n.getText("PopTitle") + oRespData.DN_NUMBER,
                                    oRespData.MESSAGE
                                );
                            }
                        } else {
                            MessageToast.show(oRespData.MESSAGE);
                            that._addPopoverMessage("Success", i18n.getText("PopTitle") + oRespData.DN_NUMBER, oRespData.MESSAGE);
                            //Variable para SharePoint
                            var sFolderNameFile = oRespData.REFERENCE;
                            var oUploadModel = that.getView().getModel("UploadModel");
                            var oDocumentService = that.getView().getModel("documentService").getData();
                            var aUploadAttachments = oUploadModel
                                .getData()
                                .Registro.filter(
                                    //(oItem) => oItem.DescripcionGrHes === oEntry.DN_NUMBER && oItem.PO_NUMBER === oEntry.PO_NUMBER
                                    (oItem) => oItem.DN_NUMBER === oEntry.DN_NUMBER && oItem.PO_NUMBER === oEntry.PO_NUMBER
                                )[0];
                            
                            var oFechaDocumento = new Date();
                            oFechaDocumento.setFullYear(
                                oEntry.DOC_DATE.substr(0, 4),
                                oEntry.DOC_DATE.substr(4, 2) - 1,
                                oEntry.DOC_DATE.substr(6, 2)
                            );
                            var oAnexo = {
                                PO_NUMBER: oEntry.COMPANY_CODE,
                                RUC: oEntry.SUPPLIERID,
                                FOLIO: oEntry.REFERENCE,
                                RAZON_SOCIAL: "",
                                FECHA_DOCUMENTO: oFechaDocumento,
                                MONEDA: oEntry.CURRENCY,
                                AnexoToFile: [],
                            };
                            if (oEntry.ConexionPIPO === "X") {
                                oAnexo.MONTO = oEntry.TOTAL_XML;
                            } else {
                                oAnexo.MONTO = oEntry.TOTAL_VALUE;
                            }
                            var sDate = that.getDateRoute(new Date());
                            var sRoute = sAmbient + "/" + sProject + "/" + sRucCompany + "/" + sDate + "/" + oAnexo.RUC,
                                oDataDS = oDocumentService,
                                oParentResponse = oRespData,
                                sMessageAnexo = oRespData.DN_NUMBER;
                            var aUploadColletionItems = [];
                            var sReference = oData.REFERENCE;

                            if(aUploadAttachments){
                            
                                //Archivos restantes
                                if (aUploadAttachments.blobs && aUploadAttachments.blobs.length > 0) {
                                    aUploadColletionItems = aUploadColletionItems.concat(aUploadAttachments.blobs);
                                }
                                //Xml de la factura
                                if (aUploadAttachments.xml.name !== "") {
                                    aUploadColletionItems.push(aUploadAttachments.xml.file);
                                }
                                //Pdf de la factura
                                if (aUploadAttachments.pdf.name !== "") {
                                    aUploadColletionItems.push(aUploadAttachments.pdf.file);
                                }
                            }
                            that.sFullPath = sRoute;
                           
                            var aFilesSharePoint = [],
                                oAnexoSet = oAnexo,
                                p = 0,
                                sFileName = "";
                            that.saveFilesInRepository(
                                that,
                                sTypeRepository,
                                aUploadColletionItems,
                                aUploadAttachments,
                                sFileName,
                                sReference,
                                aFilesSharePoint,
                                p,
                                oAnexoSet,
                                oParentResponse,
                                i18n,
                                sMessageAnexo,
                                sFolderNameFile,
                                oDataDS
                            );
                        }
                        index++;
                        if (index < aSelectedData.length) {
                            that.doRegistrar(aTable, aSelectedData, aPosItems, index);
                        } else {
                            BusyIndicator.hide();
                            that.getView().getModel().refresh();
                            // that.clearTable();
                            that.sendData();
                        }
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageToast.show(i18n.getText("Error"));
                        that._addPopoverMessage("Error", i18n.getText("PopTitle") + oEntry.PO_NUMBER, i18n.getText("ErrorMsg"));
                        index++;
                        if (index < aSelectedData.length) {
                            that.doRegistrar(aTable, aSelectedData, aPosItems, index);
                        } else {
                            that.getView().getModel().refresh();
                            // that.clearTable();
                            that.sendData();
                        }
                    },
                });
            },

            _onPageNavButtonPress: function () {
                var oInstance = History.getInstance();
                var oPreviousHash = oInstance.getPreviousHash();
                var oQueryParameters = this.getQueryParameters(window.location);
                if (oPreviousHash !== undefined || oQueryParameters.navBackToLaunchpad) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("default", true);
                }
            },
            getQueryParameters: function (oLocation) {
                var oDecodeURI = {};
                var aSearch = oLocation.search.substring(1).split("&");
                for (var iIndex = 0; iIndex < aSearch.length; iIndex++) {
                    var aUri = aSearch[iIndex].split("=");
                    oDecodeURI[aUri[0]] = decodeURIComponent(aUri[1]);
                }
                return oDecodeURI;
            },
            onDisplayFilter: function (oEvent) {
                var sDialogName = "Dialog1";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                var sPath;
                var oView;
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(
                        function () {
                            oView = sap.ui.xmlview({
                                viewName: "com.everis.suppliers.invoiceregister.view." + sDialogName,
                            });
                            this.getView().addDependent(oView);
                            oView.getController().setRouter(this.oRouter);
                            oDialog = oView.getContent()[0];
                            this.mDialogs[sDialogName] = oDialog;
                        }.bind(this)
                    );
                }
                return new Promise(
                    function (e) {
                        oDialog.attachEventOnce("afterOpen", null, e);
                        oDialog.open();
                        if (oView) {
                            oDialog.attachAfterOpen(function () {
                                oDialog.rerender();
                            });
                        } else {
                            oView = oDialog.getParent();
                        }
                        var _oModel = this.getView().getModel();
                        if (_oModel) {
                            oView.setModel(_oModel);
                        }
                        if (sPath) {
                            var aParameters = oView.getController().getBindingParameters();
                            oView.bindObject({
                                path: sPath,
                                parameters: aParameters,
                            });
                        }
                    }.bind(this)
                ).catch(function (oError) {
                    if (oError !== undefined) {
                        MessageBox.error(oError.message);
                    }
                });
            },
            _onButtonPress1: function (oEvent) {
                
                var sDialogName = "Dialog4";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                var oEventSource = oEvent.getSource();
                var oBindingContext = oEventSource.getBindingContext();
                var sPath = oBindingContext ? oBindingContext.getPath() : null;
                var oView;
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(
                        function () {
                            oView = sap.ui.xmlview({
                                viewName: "com.everis.suppliers.invoiceregister.view." + sDialogName,
                            });
                            this.getView().addDependent(oView);
                            oView.getController().setRouter(this.oRouter);
                            oDialog = oView.getContent()[0];
                            this.mDialogs[sDialogName] = oDialog;
                        }.bind(this)
                    );
                }

                return new Promise(
                    function (e) {
                        oDialog.attachEventOnce("afterOpen", null, e);
                        oDialog.open();
                        if (oView) {
                            oDialog.attachAfterOpen(function () {
                                oDialog.rerender();
                            });
                        } else {
                            oView = oDialog.getParent();
                        }
                        var _oModel = this.getView().getModel();
                        if (_oModel) {
                            oView.setModel(_oModel);
                        }
                        if (sPath) {
                            var aParameters = oView.getController().getBindingParameters();
                            oView.bindObject({
                                path: sPath,
                                parameters: aParameters,
                            });
                        }
                    }.bind(this)
                ).catch(function (oError) {
                    if (oError !== undefined) {
                        MessageBox.error(oError.message);
                    }
                });
            },
            _onLinkPress: function (oEvent) {
                var oEventBContext = oEvent.getSource().getBindingContext();
                var oData = oEventBContext.getObject();
                var oTipDoc = new JSONModel({
                    TipDoc: oData.TIPDOCREFERENCE,
                    DocTypeSunat: oData.DocTypeSunat,
                });
                sap.ui.getCore().setModel(oTipDoc, "TipDoc");
                //var sContext = "PurchaseOrderHeaderSet(DN_NUMBER='1000000323',ItTaxIdNumber='20554266437',PO_NUMBER='4500000329')";
                var sContext = oEventBContext.getPath().substr(1);
                if (oData.DocumentType === "SERVICIOS") {
                    if (oData.DocTypeSunat === "AN") {
                        this.oRouter.navTo("DetalleOcContext", {
                            context: sContext,
                            clasePedido: oData.DocumentTypeId
                        });
                    } else {
                        this.oRouter.navTo("PoLineContext", {
                            context: sContext
                        });
                    }
                } else {
                    this.oRouter.navTo("DetalleOcContext", {
                        context: sContext,
                        clasePedido: oData.DocumentTypeId
                    });
                }
            },
            onDialogOk: function (oEvent) {
                var oParent = oEvent.getSource().getParent();
                var oRdBtnOrderedT = this._byId("idRdBtnOrderedT");
                var sOrderedTypeSelect = oRdBtnOrderedT.getSelectedButton().getText();
                var aOrderedType = this.getView().getModel("OrderedType").getData();
                var aFilter = [];
                var sTipoPedKey = aOrderedType.find(function (tItem) {
                    return tItem.Batxt === sOrderedTypeSelect;
                }).Bsart;
                this.byId("idCmbTipoPed").setSelectedKey(sTipoPedKey);
                //var c = sTipoPedKey;
                aFilter.push(
                    new Filter({
                        filters: [new Filter("ClasePedido", "EQ", sTipoPedKey)],
                    })
                );
                var oDate = new Date();
                var sDateLocale1 = "";
                var sDateLocale2 = "";
                sDateLocale1 = oDate.toLocaleString("en-GB", {
                    timeZone: "UTC",
                });
                sDateLocale1 = sDateLocale1.substring(6, 10) + sDateLocale1.substring(3, 5) + sDateLocale1.substring(0, 2);
                
                oDate.setDate(oDate.getDate() - 30);
                sDateLocale2 = oDate.toLocaleString("en-GB", {
                    timeZone: "UTC",
                });
                sDateLocale2 = sDateLocale2.substring(6, 10) + sDateLocale2.substring(3, 5) + sDateLocale2.substring(0, 2);
                aFilter.push(
                    new Filter({
                        filters: [new Filter("ItRequestDate", "BT", sDateLocale2, sDateLocale1)],
                    })
                );
                aFilter.push(
                    new Filter({
                        path: "ItTaxIdNumber",
                        operator: FilterOperator.EQ,
                        value1: this.oUser_,
                    })
                );
                var oPOHeaderTable = this.getView().byId("POHeaderTable");
                var oPOHeaderTableItems = oPOHeaderTable.getBinding("items");
                oPOHeaderTableItems.filter(
                    new Filter({
                        filters: aFilter,
                        and: true,
                    })
                );
                oParent.close();
            },

            _formatDate: function (oDate) {
                var sDia, sMes, sAnio;
                if (oDate.substr(1, 1) === "/") {
                    sDia = "0" + oDate.substr(0, 1);
                    if (oDate.substr(3, 1) === "/") {
                        sMes = "0" + oDate.substr(2, 1);
                        sAnio = oDate.substr(4, 4);
                    } else {
                        sMes = oDate.substr(2, 2);
                        sAnio = oDate.substr(5, 4);
                    }
                } else {
                    sDia = oDate.substr(0, 2);
                    if (oDate.substr(4, 1) === "/") {
                        sMes = "0" + oDate.substr(3, 1);
                        sAnio = oDate.substr(5, 4);
                    } else {
                        sMes = oDate.substr(3, 2);
                        sAnio = oDate.substr(6, 4);
                    }
                }
                var sDDMMYYYY = sDia + "/" + sMes + "/" + sAnio;
                return sDDMMYYYY;
            },
            onUpdateFinished: function (oEvent) {
                var iTableItems = oEvent.getSource().getItems().length;
                var oTableHeader = oEvent.getSource().getHeaderToolbar();
                oTableHeader.getContent()[0].setText("Pedidos (" + iTableItems + ")");
            },
            formatNumber: function (sNumber) {
                jQuery.sap.require("sap.ui.core.format.NumberFormat");
                var oLocale = new sap.ui.core.Locale("en-US");
                var oFormatOptions = {
                    minIntegerDigits: 3,
                    minFractionDigits: 2,
                    maxFractionDigits: 2,
                    groupingSeparator: ",",
                };
                var oFloatInstance = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
                return oFloatInstance.format(sNumber).replace(/^\b0+\B/, "");
            },
            fechaFiltro: function (key, control) {
                const oControl = this._byId(control);
                oControl.setSelectedKey(key);
                const oResult = {
                    startDate: "",
                    endDate: "",
                };

                /* -[EGT] { 
                if (key === "99") {
                    const aParts = oControl.getSelectedItem().getText().split(" - ");
                    oResult.startDate = aParts[0].substr(6, 4) + aParts[0].substr(3, 2) + aParts[0].substr(0, 2);
                    oResult.endDate = aParts[1].substr(6, 4) + aParts[1].substr(3, 2) + aParts[1].substr(0, 2);
                    return oResult;
                } else {
                    const iDays = this.getDaysFromFilter(key);
                    oResult.startDate = this.substractFromToday(iDays);
                    return oResult;
                }
                -[EGT] } */

                //+[EGT] {
                if (key === "0" || key === "1") { //Selected 15 - 30 Days
                    const iDays = parseInt(oControl.setSelectedKey(key).getSelectedItem().getText());
                    //const iDays = this.getDaysFromFilter(key);
                    oResult.startDate = this.substractFromToday(iDays);
                    return oResult;
                } else { //Selected Range Date
                    const aParts = oControl.getSelectedItem().getText().split(" - ");
                    oResult.startDate = aParts[0].substr(6, 4) + aParts[0].substr(3, 2) + aParts[0].substr(0, 2);
                    oResult.endDate = aParts[1].substr(6, 4) + aParts[1].substr(3, 2) + aParts[1].substr(0, 2);
                    return oResult;
                }
                //+[EGT] }
            },
            getDaysFromFilter: function(key) {
                // TODO: to be implemented
                return 30;
            },
            substractFromToday: function (days) {
                const dDate = new Date();

                 //+[EGT] {
                if(!days){
                    dDate.setFullYear(2017, 7, 5);
                } else { //Restar Num. Dias a la fecha Actual
                    dDate.setDate(dDate.getDate() - days);
                }
                //+[EGT] }

                const dNewDate = new Date(dDate);
                const sNewDateString = dNewDate.toLocaleString("en-GB", {
                    timeZone: "UTC",
                });
                const sYear = sNewDateString.substring(6, 10);
                const sMonth = sNewDateString.substring(3, 5);
                const sDay = sNewDateString.substring(0, 2);

                return sYear + sMonth + sDay;
            },
            sendData: function (oEvent) {
                
                var that = this;
                var aFilter = [];
                var aSmartFilterBar = that._byId("smartFilterBar")._retrieveCurrentSelectionSet();
                that._byId("chkMASIVO").setSelected(false);
                that.getView().getModel("EventosModel").setProperty("/tableMode", "SingleSelectLeft");
                that.flag = false;
                var sFilterDateKey = that._byId("idCmbFecha").getSelectedKey();
                var sClasePedidoKey = that._byId("idCmbTipoPed").getSelectedKey();
                aSmartFilterBar = aSmartFilterBar ? aSmartFilterBar : [];

                that.clearTable();
                for (var tIndex = 0; tIndex < aSmartFilterBar.length; tIndex++) {
                    var oBinding = aSmartFilterBar[tIndex].getBinding("value");
                    if (oBinding) {
                        var oData = oBinding.getModel().getData()[oBinding.getPath().substr(1).split("/")[0]];
                        var aNewFilter = [];
                        jQuery.each(oData.ranges, function (key, value) {
                            if (!value.exclude) {
                                aNewFilter.push(new Filter(value.keyField, value.operation, value.value1));
                            } else {
                                aNewFilter.push(new Filter(value.keyField, "NE", value.value1));
                            }
                        });
                        if (aNewFilter.length) {
                            aFilter.push(
                                new Filter({
                                    filters: aNewFilter,
                                })
                            );
                        }
                    }
                }

                var oContacto = that.getView().getModel("Contacto").getData();
                var sItCompanyId = that.getView().byId("mbxSociedad").getSelectedKey();
                var sDocTypeSunat = that.getView().byId("idCmbDocumentType").getSelectedKey();

                aFilter.push(
                    new Filter({
                        path: "ItTaxIdNumber",
                        operator: FilterOperator.EQ,
                        value1: oContacto.Ruc,
                    })
                );
                aFilter.push(
                    new Filter({
                        path: "ItCompanyId",
                        operator: FilterOperator.EQ,
                        value1: sItCompanyId,
                    })
                );
                aFilter.push(
                    new Filter({
                        path: "DocTypeSunat",
                        operator: "EQ",
                        value1: sDocTypeSunat,
                    })
                );
                var oDate = that.fechaFiltro(sFilterDateKey, "idCmbFecha");
                if (sFilterDateKey === "98" || sFilterDateKey === "0" || sFilterDateKey === "1") {
                    aFilter.push(
                        new Filter({
                            filters: [new Filter("FECHA_FACTURA", "GE", oDate.startDate)],
                        })
                    );
                } else {
                    aFilter.push(
                        new Filter({
                            filters: [new Filter("FECHA_FACTURA", "BT", oDate.startDate, oDate.endDate)],
                        })
                    );
                }
                
                aFilter.push(
                    new Filter({
                        filters: [new Filter("ClasePedido", "EQ", sClasePedidoKey)],
                    })
                );

                var oPOHeaderTableItems = that.getView().byId("POHeaderTable").getBinding("items");
                oPOHeaderTableItems.filter(
                    new Filter({
                        filters: aFilter,
                        and: true,
                    })
                );
                that.getDocumentTypeForTable(that, sDocTypeSunat);
                if (sDocTypeSunat === "AN") {
                    that.getView().getModel("ModelGlobal").setProperty("/Anticipo", true);
                } else {
                    that.getView().getModel("ModelGlobal").setProperty("/Anticipo", false);
                }
            },
            handleSortButtonPressed: function (oEvent) {
                var _oView = this.getView();
                this.createViewSettingsDialog = sap.ui.xmlfragment(
                    _oView.getId(),
                    "com.everis.suppliers.invoiceregister.view.fragments.SortDialog",
                    this
                );
                this.createViewSettingsDialog.open();
            },
            handleSortDialogConfirm: function (oEvent) {
                var oPOHeaderTable = this.byId("POHeaderTable"),
                    oParameters = oEvent.getParameters(),
                    oPOHeaderTableItems = oPOHeaderTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorter = [];
                    sPath = oParameters.sortItem.getKey();
                bDescending = oParameters.sortDescending;
                aSorter.push(new Sorter(sPath, bDescending));
                oPOHeaderTableItems.sort(aSorter);
            },
            _onSelectionChange: function (oEvent) {
                const selectedKey = oEvent.getParameters().selectedItem.getKey();
                if (selectedKey === "99") {
                    if (!this.pressDialog) {
                        this.pressDialog = sap.ui.xmlfragment(
                            this.getView().getId(),
                            "com.everis.suppliers.invoiceregister.view.fragments.PressDialog",
                            this
                        );
                        this.getView().addDependent(this.pressDialog);
                    }
                    this.pressDialog.open();
                } else {
                    this.oCboIndex = selectedKey;
                }
            },
            _onDialogBtnPress: function (oEvent) {
                var oCmbFecha = this.byId("idCmbFecha");
                var iKey = oCmbFecha.getItems().length;
                this.oCboIndex = iKey;
                var sRangeDate = this.byId("DRS1").getValue();
                var bExistRangeDate = true;
                jQuery.each(oCmbFecha.getItems(), function () {
                    if (this.getText() === sRangeDate) {
                        bExistRangeDate = false;
                        MessageToast.show("El rango de fechas seleccionado ya se encuentra en la lista");
                        return;
                    }
                });
                if (bExistRangeDate && sRangeDate) {
                    oCmbFecha.insertItem(
                        new sap.ui.core.Item({
                            text: sRangeDate,
                            key: iKey,
                        }),
                        iKey
                    );
                    oCmbFecha.setSelectedKey(iKey);
                } else {
                    oCmbFecha.setSelectedKey(iKey - 1);
                }
                this.pressDialog.close();
            },
            _onDialogClose: function (oEvent) {
                if (this.pressDialog) {
                    this._byId("idCmbFecha").setSelectedKey(this.oCboIndex);
                    this.pressDialog.close();
                }
            },
            onExport: function (oEvent) {
                var oColumn, oSpreadsheet;
                var oPOHeaderTable = this.getView().byId("POHeaderTable");
                oColumn = this.createColumnConfig();
                var oPOHeaderTableItems = oPOHeaderTable.getItems();
                var aDataSource = [];
                jQuery.each(oPOHeaderTableItems, function () {
                    var oDataSource = {};
                    var aCells = this.getCells();
                    var sDocumentType = this.getCells()
                        .find((oItem) => oItem.data("custom") === "selectDocumentType")
                        .getSelectedKey();
                    var sReferenceValue = this.getCells()
                        .find((oItem) => oItem.data("custom") === "inputReference")
                        .getValue();
                    //Duro
                    oDataSource["PO_NUMBER"] = aCells[4].getText();
                    oDataSource["COMPANY"] = aCells[12].getText();
                    oDataSource["DOCUMENTTYPE"] = aCells[0].getText();
                    oDataSource["TOTAL_VALUE"] = aCells[5].getText();
                    oDataSource["CURRENCY"] = aCells[6].getText();
                    oDataSource["REFERENCE"] = sDocumentType + "-" + sReferenceValue;
                    oDataSource["DOC_DATE"] = aCells[9].getValue();
                    oDataSource["HEADER_TXT"] = aCells[10].getValue();
                    aDataSource.push(oDataSource);
                });
                oSpreadsheet = {
                    workbook: {
                        columns: oColumn,
                    },
                    dataSource: aDataSource,
                    worker: false,
                    fileName: "preRegistroFactura",
                };
                new Spreadsheet(oSpreadsheet).build().then(function () {
                    MessageToast.show("Spreadsheet export has finished");
                });
            },
            refresh: function () {
                var that = this;
                var _oModel = that.getView().getModel();
                _oModel.read("/DirssSet", {
                    success: function (oResponse) {
                        var aOrderedType = new JSONModel(oResponse.results);
                        that.getView().setModel(aOrderedType, "OrderedType");
                        that.getView().getModel("OrderedType").updateBindings(true);
                    },
                    error: function (e) {},
                });
            },
            onBeforeUploadStarts: function (e) {},
            onValidateFormatoNFactura: function (sNumFact) {
                sNumFact = sNumFact.replace(/[-\s]/g, "");
                var t = /^[0-9]+$/;
                var a = /^[A-Z]+$/i;
                var r = /^[a-zA-Z0-9]+$/;
                if (t.test(sNumFact) || a.test(sNumFact)) {
                    return false;
                } else {
                    return r.test(sNumFact);
                }
            },
            onValidateNumXml: function (e) {
                var t = e[0].filter((e) => e.type === "text/xml");
                return t.length > 1;
            },
            onPressUploadAttachments: function (oEvent) {
                var oModelUploadModel = this.getView().getModel("UploadModel");
                var aDataUploadModel = oModelUploadModel.getData().Registro;
                var bCheckMasive = this._byId("chkMASIVO").getSelected();
                //En oRowSelected se guardan los datos de la fila a la que se estan cargando los archivos
                if (!bCheckMasive) {
                    this.oRowSelected = oEvent.getSource().getBindingContext().getObject();
                    this.oRowSelectedForUpdate = oEvent.getSource().getParent().getCells();
                    var oItemSelected = oEvent.getSource().getBindingContext().getObject();
                    this.getView().setModel(new JSONModel(oItemSelected), "Line");
                } else {
                    this.oRowSelected = oEvent.getSource().getBindingContext("Masivo").getObject();
                }

                // Se agrega DescripcionGrHes para uso en lógica de obtención de registro seleccionado, ya que DN_NUMBER ya no siempre trae el mismo valor
                // TODO: Validar caso en que PO_NUMBER y DescripcionGrHes es igual
                var sDnNumber = bCheckMasive ? "Masivo" : oItemSelected.DN_NUMBER;
                var sPoNumber = bCheckMasive ? "Masivo" : oItemSelected.PO_NUMBER;
                var sDescripcionGrHes = bCheckMasive ? "Masivo" : oItemSelected.DescripcionGrHes;
                var oRegister = {
                    DN_NUMBER: sDnNumber,
                    PO_NUMBER: sPoNumber,
                    DescripcionGrHes: sDescripcionGrHes,
                    uploadCollection: [],
                    blobs: [],
                    xml: {
                        name: "",
                        file: {},
                    },
                    pdf: {
                        name: "",
                        file: {},
                    },
                };
                if (aDataUploadModel.length === 0) {
                    aDataUploadModel.push(oRegister);
                } else {
                    var aDataUploadFilter = aDataUploadModel.filter(
                        (tItem) => tItem.DN_NUMBER === sDnNumber && tItem.PO_NUMBER === sPoNumber
                    );
                    if (aDataUploadFilter.length === 0) {
                        aDataUploadModel.unshift(oRegister);
                    }
                }
                var oDataFilter = aDataUploadModel.filter(
                    (tItem) => tItem.DN_NUMBER === sDnNumber && tItem.PO_NUMBER === sPoNumber
                );
                var oModel = new JSONModel(oDataFilter[0]);

                this.setFragment(this, "dialogUploadAttachments", "idUploadAttachments", "UploadDialog", sRouteDialog);
                this["dialogUploadAttachments"].setModel(oModel, "UploadAttachments");
                this["dialogUploadAttachments"].open();
            },
            _onChangeAddFile: function (oEvent) {
                var oParameters = oEvent.getParameters("files");
                var oFile = oParameters.files[0];
                var oDataUploadAttachments = this["dialogUploadAttachments"].getModel("UploadAttachments").getData();
                var oFind = oDataUploadAttachments.blobs.find((e) => e.name === oFile.name);
                if (oFind === undefined) {
                    oDataUploadAttachments.blobs.push(oFile);
                } else {
                    MessageBox.error(this.getI18nText("msgSameFilename"));
                }

                this["dialogUploadAttachments"].getModel("UploadAttachments").refresh();
            },
            onPressFileRemove: function (oEvent) {
                var oSource = oEvent.getSource();
                var oBContext = oSource.getBindingContext("UploadAttachments");
                var sPath = oBContext.getPath().split("/")[2];
                var aFile = this["dialogUploadAttachments"].getModel("UploadAttachments").getData();
                aFile.blobs.splice(sPath, 1);
                this["dialogUploadAttachments"].getModel("UploadAttachments").updateBindings();
            },
            onSaveFile: function (oEvent) {
                var that = this;
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var oParameters = oEvent.getParameters("files");
                var oFile = oParameters.files[0];
                var reader = new FileReader();
                var oDataUploadAttachments = this["dialogUploadAttachments"].getModel("UploadAttachments").getData();
                switch (sCustom) {
                    case "XML":
                        reader.onload = function (oEvent) {
                            that.setTotalXMLValue(0, 0);
                            var oDataValidation = Object.assign({}, that.oRowSelected);
                            that.oRowSelected = Object.assign({}, that.oRowSelected);
                            var bMasive = false;
                            if (
                                !oDataValidation.hasOwnProperty("tipodocumento") &&
                                !oDataValidation.hasOwnProperty("fechaFactura") &&
                                !oDataValidation.hasOwnProperty("moneda") &&
                                !oDataValidation.hasOwnProperty("numeroFactura")
                            ) {
                                oDataValidation.tipodocumento = oDataValidation.TIPDOCREFERENCE;
                                oDataValidation.fechaFactura = oDataValidation.FechaFacturaP;
                                oDataValidation.moneda = oDataValidation.CURRENCY;
                                oDataValidation.numeroFactura = oDataValidation.REFERENCE;
                                oDataValidation.rucSociedad = oDataValidation.CompanyNif;
                            } else {
                                bMasive = true;
                            }
                            that.setSunatVariables(that);
                            var oXmlValidation = that.xmlValidation(
                                that,
                                oEvent,
                                oDataValidation,
                                bMasive,
                                aTag,
                                that.oRowSelected
                            );
                            var oItemTableSelected = that.byId("POHeaderTable").getSelectedItem();
                            if (oXmlValidation.Error) {
                                if (oItemTableSelected !== null && !bMasive) {
                                    oItemTableSelected.setSelected(false);
                                }
                                oDataUploadAttachments.xml = {
                                    name: "",
                                };
                                that["dialogUploadAttachments"].getModel("UploadAttachments").refresh();
                                return MessageBox.error(oXmlValidation.TextError);
                            } else if (!oXmlValidation.Valid) {
                                if (oItemTableSelected !== null && !bMasive) {
                                    oItemTableSelected.setSelected(false);
                                }
                                oDataUploadAttachments.xml = {
                                    name: "",
                                };
                                that["dialogUploadAttachments"].getModel("UploadAttachments");
                                return MessageBox.error(that.getI18nText(oXmlValidation.TextI18n));
                            }
                            Sunat.getSunatStatus(that.getView().getModel("sunatVariables").getData(), that)
                                .then((nSunat) => {
                                    if (that.oConfigModel.getProperty("/devSunat")) {
                                        switch (nSunat) {
                                            case -1:
                                                oXmlValidation = {
                                                    Valid: false,
                                                    TextI18n: "msgsunatstatusresponse",
                                                };
                                                break;
                                            case 0:
                                                oXmlValidation = {
                                                    Valid: false,
                                                    TextI18n: "msgsunatstatuserror",
                                                };
                                                break;
                                            default:
                                                MessageToast.show(that.getI18nText("msgsunatstatussuccess"));
                                                break;
                                        }
                                    }
                                    if (!oXmlValidation.Valid) {
                                        if (oItemTableSelected !== null && !bMasive) {
                                            oItemTableSelected.setSelected(false);
                                        }
                                        oDataUploadAttachments.xml = {
                                            name: "",
                                        };
                                        that["dialogUploadAttachments"].getModel("UploadAttachments");
                                        return MessageBox.error(that.getI18nText(oXmlValidation.TextI18n));
                                    }
                                })
                                .catch((errMsg) => {
                                    Log.error("[SUPPLIERS]", errMsg.toString());
                                    MessageBox.error(errMsg);
                                });

                            if (!bMasive) {
                                //Duro
                                that.oRowSelectedForUpdate[8].setValue(that.oRowSelected.REFERENCE);
                                that.oRowSelectedForUpdate[9].setValue(that.oRowSelected.FechaFacturaP);
                                that.byId("dpDate").fireChange({value: that.oRowSelected.FechaFacturaP, valid: true});
                            } else {
                                that.getModel("Masivo").setProperty("/0/numeroFactura", that.oRowSelected.REFERENCE);
                                that.getModel("Masivo").setProperty("/0/fechaFactura", that.oRowSelected.FechaFacturaP);
                                that._byId("idMasivoDialog--dpMasivoFechaFactura").fireChange({value: that.oRowSelected.FechaFacturaP, valid: true});
                            }

                            //oDataUploadAttachments.xml = oFile;
                            oDataUploadAttachments.xml.name = oFile.name;
                            oDataUploadAttachments.xml.file = oFile;
                        };
                        reader.onerror = function (oEvent) {
                            MessageToast.show("Error al leer documento XML");
                        };
                        reader.readAsBinaryString(oFile);
                        break;
                    case "PDF":
                        //oDataUploadAttachments.pdf = oFile;
                        oDataUploadAttachments.pdf.name = oFile.name;
                        oDataUploadAttachments.pdf.file = oFile;
                        break;
                    default:
                }
            },
            onClose: function (oEvent) {
                var oSource = oEvent.getSource();
                var oParent = oSource.getParent();
                oParent.close();
            },
            onChangeUpload: function (e) {},
            xmlToJson: function (sXml) {
                var aNodes = {};
                if (sXml.nodeType === 1) {
                    if (sXml.attributes.length > 0) {
                        aNodes["@attributes"] = {};
                        for (var tIndex = 0; tIndex < sXml.attributes.length; tIndex++) {
                            var oNode = sXml.attributes.item(tIndex);
                            aNodes["@attributes"][oNode.nodeName] = oNode.nodeValue;
                        }
                    }
                } else if (sXml.nodeType === 3) {
                    aNodes = sXml.nodeValue;
                }
                if (sXml.hasChildNodes()) {
                    for (var tIndex = 0; tIndex < sXml.childNodes.length; tIndex++) {
                        var oNode = sXml.childNodes.item(tIndex);
                        var sNodeName = oNode.nodeName;
                        if (typeof aNodes[sNodeName] === "undefined") {
                            aNodes[sNodeName] = this.xmlToJson(oNode);
                        } else {
                            if (typeof aNodes[sNodeName].push === "undefined") {
                                var n = aNodes[sNodeName];
                                aNodes[sNodeName] = [];
                                aNodes[sNodeName].push(n);
                            }
                            aNodes[sNodeName].push(this.xmlToJson(oNode));
                        }
                    }
                }
                return aNodes;
            },
            readUserApiInfo: function () {
                return new Promise(function (e, t) {
                    var a = new JSONModel("/services/userapi/attributes");
                    a.attachRequestCompleted(function () {
                        e(a);
                    });
                    a.attachRequestFailed(function () {
                        t("Error");
                    });
                });
            },
            onExit: function () {
                this._BusyDialog.close();
            },
            onSelectChange: function (oEvent) {
                var oData = oEvent.getSource().getBindingContext().getObject();
                var sSelectedKey = oEvent.getSource().getSelectedKey();
                var oPOHeaderTable = this._byId("POHeaderTable");
                //Duro
                var oPOHeaderTableItems = oPOHeaderTable
                    .getItems()
                    .filter(
                        (e) => e.getCells()[4].getText() === oData.DM_NUMBER
                    );
                if (oPOHeaderTableItems.length > 0) {
                    if (sSelectedKey === "01") {
                        oPOHeaderTableItems[0].getCells()[5].setText(oData.TOTAL_VALUE_IGV);
                    } else {
                        oPOHeaderTableItems[0].getCells()[5].setText(oData.TOTAL_VALUE_NO_IGV);
                    }
                }
            },
            onSelectMassiveChange: function (oEvent) {
                var oMasivoData = this.getView().getModel("Masivo").getData();
                var oPOHeaderTable = this.getView().byId("POHeaderTable");
                var oPOHeaderTableItems = oPOHeaderTable.getSelectedItems();
                if (oMasivoData.length > 0) {
                    oMasivoData[0].total = 0;
                    for (var tIndex in oPOHeaderTableItems) {
                        if ({}.hasOwnProperty.call(oPOHeaderTableItems, tIndex)) {
                        
                            /*if (t[0].tipodocumento === "01") {
                                //Duro
                                var s = r[o].getCells()[14].getText();
                                t[0].total += parseFloat(Number(s.replace(/,/g, "")))
                            } else {
                                //Duro
                                var s = r[o].getCells()[13].getText();
                                t[0].total += parseFloat(Number(s.replace(/,/g, "")))
                            }*/
                            var sTotal = oPOHeaderTableItems[tIndex].getCells()[14].getText();
                            oMasivoData[0].total += parseFloat(Number(sTotal.replace(/,/g, "")));
                        }
                    }
                    oMasivoData[0].total = String(parseFloat(oMasivoData[0].total).toFixed(2));
                }
            },
            readUserIasInfo: function () {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var userModel = new JSONModel({});
                    var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    if (sMail === "DEFAULT_USER" || sMail === undefined) {
                        sMail = "fcorvett@everis.com";
                    }
                    //var sMail = "juan_perez@gmail.com";
                    var sPath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
                    const sUrl = that.getOwnerComponent().getManifestObject().resolveUri(sPath);
                    userModel
                        .loadData(sUrl, null, true, "GET", null, null, {
                            "Content-Type": "application/scim+json",
                        })
                        .then(() => {
                            var oDataTemp = userModel.getData();
                            var oData = {};
                            var aAttributes =
                                oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                            oData = {
                                company: "",
                                email: oDataTemp.Resources[0].emails[0].value,
                                emails: oDataTemp.Resources[0].emails[0].value,
                                firstName: oDataTemp.Resources[0].name.givenName,
                                groups: oDataTemp.Resources[0].groups,
                                lastName: oDataTemp.Resources[0].name.familyName,
                                loginName: oDataTemp.Resources[0].userName,
                                name: oDataTemp.Resources[0].userName,
                                ruc: "",
                            };
                            if (aAttributes !== undefined) {
                                oData.ruc =
                                    oDataTemp.Resources[0][
                                        "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
                                    ].attributes[0].value;
                            } else {
                                MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErrorIASCustomAttributeRUC"));
                            }
                            var oUserModel = new JSONModel(oData);
                            resolve(oUserModel);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            getDateRoute: function (oDate) {
                let month = "" + (oDate.getMonth() + 1),
                    day = "" + oDate.getDate(),
                    year = oDate.getFullYear();

                if (month.length < 2) {
                    month = "0" + month;
                }
                if (day.length < 2) {
                    day = "0" + day;
                }
                return [year, month, day].join("/");
            },
            onSelectDevSunat: function (oEvent) {
                const selected = oEvent.getSource().getSelected();

                this.oConfigModel.setProperty("/devSunat", selected);

                Log.info("[SUPPLIERS]", "devSunat set to " + selected);
            },
        });
    },
    true
);
