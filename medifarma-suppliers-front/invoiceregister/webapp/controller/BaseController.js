/* eslint-disable consistent-this */
/* eslint-disable max-statements */
/* eslint-disable complexity */
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/Device",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/BusyIndicator",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "../model/formatter",
        "../service/oData",
        "../service/SharePoint",
        "../service/Sunat",
        "../service/DocumentService",
        "sap/base/Log",
    ],
    function (
        Controller,
        Device,
        MessageBox,
        Fragment,
        JSONModel,
        BusyIndicator,
        MessageToast,
        Filter,
        Formatter,
        oDataService,
        SharePoint,
        Sunat,
        DocumentService,
        Log
    ) {
        "use strict";

        return Controller.extend("com.everis.suppliers.invoiceregister.controller.BaseController", {
            getI18nText: function (sText) {
                return this.oView.getModel("i18n") === undefined
                    ? this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText)
                    : this.oView.getModel("i18n").getResourceBundle().getText(sText);
            },
            getResourceBundle: function () {
                return this.oView.getModel("i18n").getResourceBundle();
            },
            getModel: function (sModel) {
                return this.oView.getModel(sModel);
            },
            _byId: function (sName) {
                var cmp = this.byId(sName);
                if (!cmp) {
                    cmp = sap.ui.getCore().byId(sName);
                }
                return cmp;
            },
            getMessageBox: function (sType, sMessage) {
                return MessageBox[sType](sMessage);
            },
            setValidateStep: function (sIdStep, bValidate) {
                var oStep = this._byId(sIdStep);
                oStep.setValidated(bValidate);
            },
            removeZerosLeft: function (sValue) {
                var sReturn = "";
                if (sValue !== undefined) {
                    sReturn = sValue.replace(/^0+/, "");
                }
                return sReturn;
            },
            alrh450: function (sModel) {
                var _this = this;
                _this.oInterval = setInterval(this.myScanner, 1500, sModel, _this);
            },
            getDaysBefore: function (date, days) {
                var _24HoursInMilliseconds = 86400000;
                var daysAgo = new Date(date.getTime() + days * _24HoursInMilliseconds);
                daysAgo.setHours(0);
                daysAgo.setMinutes(0);
                daysAgo.setSeconds(0);
                return daysAgo;
            },
            clearInterval: function () {
                clearInterval(this.oInterval);
            },
            setFragment: function (that, sDialogName, sFragmentId, sNameFragment, sRoute) {
                try {
                    if (!that[sDialogName]) {
                        that[sDialogName] = sap.ui.xmlfragment(sFragmentId, sRoute + "." + sNameFragment, that);
                        that.getView().addDependent(that[sDialogName]);
                    }
                    that[sDialogName].addStyleClass(
                        "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
                    );
                } catch (err) {
                    Log.error("[SUPPLIERS]", err.toString());
                }
            },
            onFileSizeExceed: function () {
                MessageBox.error(this.getI18nText("msgFileSizeExceed"));
            },
            onFilenameLengthExceed: function () {
                MessageBox.error(this.getI18nText("msgFilenameLengthExceed"));
            },
            showErrorMessage: function (sError, sDetail) {
                var sDetail2 = String(sDetail);
                return MessageBox.error(sError, {
                    title: "Error",
                    details: sDetail2,
                    styleClass: "sapUiSizeCompact",
                    contentWidth: "100px",
                });
            },
            goNavConTo: function (sFragmentId, sNavId, sPageId) {
                Fragment.byId(sFragmentId, "btnIdNavDialog").setVisible(true);
                var oNavCon = Fragment.byId(sFragmentId, sNavId);
                var oDetailPage = Fragment.byId(sFragmentId, sPageId);
                oNavCon.to(oDetailPage);
            },
            getMessageBoxFlex: function (that, sType, sMessage, _this, aMessage, sAction, sRoute, sAction2) {
                return MessageBox[sType](sMessage, {
                    actions: [sAction, sAction2],
                    onClose: function (oAction) {
                        if (oAction === sAction && sRoute === "ErrorNotificNumber") {
                            that.createMessageLog(aMessage, that);
                        }
                        if (oAction === sAction && sRoute === "ErrorTakePhoto") {
                            that._onTakePhoto();
                        }
                        if (oAction === sAction && sRoute === "SuccesRegister") {
                            that.oRouter.navTo("RouteLaunchpadCreateNotific");
                        }
                        if (oAction === sAction2 && sRoute === "SuccessUpdateOffline") {
                            that.oRouter.navTo("RouteNotificationOff");
                        }
                        if (oAction === sAction2 && sRoute === "SuccesRegister") {
                            /*var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "#"
							}
						});*/
                            that.oRouter.navTo("RouteLaunchpad");
                        }
                        if (oAction === sAction && sRoute === "ErrorUpload") {
                            BusyIndicator.show();
                        }
                    },
                });
            },
            createColumnConfig: function () {
                var e = [];
                e.push({
                    label: "NUMERO DE ORDEN",
                    type: "number",
                    property: "PO_NUMBER",
                    scale: 0,
                });
                e.push({
                    property: "COMPANY",
                    type: "string",
                });
                e.push({
                    label: "VALOR TOTAL",
                    property: "TOTAL_VALUE",
                    type: "string",
                    scale: 2,
                    delimiter: true,
                });
                e.push({
                    label: "MONEDA",
                    property: "CURRENCY",
                    type: "string",
                });
                e.push({
                    label: "NUMERO DE FACTURA",
                    property: "REFERENCE",
                    type: "string",
                });
                e.push({
                    label: "FECHA",
                    property: "DOC_DATE",
                    type: "string",
                });
                e.push({
                    label: "TEXTO DE CABECERA",
                    property: "HEADER_TXT",
                    type: "string",
                });
                return e;
            },
            invoiceAlreadyRegistered: function (that, oResponse, oSource, l) {
                var bMasive = that.getView().getModel("ModelGlobal").getProperty("/Masive");
                if (oResponse.Response === "1") {
                    MessageBox.error(that.getI18nText("msginvoicealreadyregistered"));
                    oSource.setValue("");
                    //if (l > -1) {
                    if (bMasive) {
                        that.getView().getModel("Masivo").getData()[0].numeroFactura = "";
                        that.getView().getModel("Masivo").updateBindings(true);
                    }
                    return false;
                } else {
                    return true;
                }
            },
            validateInvoiceNumber: function () {
                /*var that = this;
			var t = this;
			var a = e.getDOMValue();
			var r = a.toUpperCase().replace(/\s/g, "");
			var o = r.split("-");
			var i = o.join("");
			var n = "";
			var l = e.getParent().getCells()[6];
			if (l === undefined) {
				n = e.getParent().getCells()[0].getSelectedKey()
			} else {
				n = e.getParent().getCells()[6].getSelectedKey()
			}
			var u = "";
			var d = this.getView().getModel("Usuario").getData().ruc;
			var g = this.getView().getModel("Contacto").getData().Legalenty === "EE" ? true : false;
			if (o.length === 2 && o[0].length == 4) {
				if (!/[^a-zA-Z0-9]/.test(i)) {
					if (g) {
						if (!this.onValidateFormatoNFactura(o[0])) {
							return MessageToast.show("Proveedor registrado como emisor electrónico, por favor ingrese una factura electrónica.")
						}
					}
					u = n + "-" + c.formatoReferencia(r);
					BusyIndicator.show(0);
					var sPath = that.oModel.createKey("/ReferenceSet", {
						Xblnr: u,
						Nif: d
					});
					oDataService.consult(that, "read", sPath, "", "").then(response => {
						BusyIndicator.hide();
						that.invoiceAlreadyRegistered(that, response, a, l);
					}).catch(err => {
						console.log(err);
					});
					e.setValue(c.formatoReferencia(r));
					return true;
				} else {
					MessageToast.show("No se permiten caracteres especiales");
					return false;
				}
			} else {
				MessageToast.show("N° Factura: Formato esperado XXXX-XXXXXXXX");
				return false;
			}
			return true;*/
            },
            saveFilesInRepository: function (
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
                fI18n,
                sMessageAnexo,
                sFolderNameFile,
                oDataDS
            ) {
                var aBase64Files = [];
                var sFileType = "";
                function convertFilesBlob(aUploadColletionItemsCopy) {
                    if (aUploadColletionItemsCopy.length > 0) {
                        var oUploadColletionItemsCopy = aUploadColletionItemsCopy.pop();
                        var oFileReader = new FileReader();
                        var oFileReaderBase64 = new FileReader();
                        if (oUploadColletionItemsCopy.name === aUploadAttachments.xml.name) {
                            sFileName = sReference + ".xml";
                            sFileType = "XML";
                        } else if (oUploadColletionItemsCopy.name === aUploadAttachments.pdf.name) {
                            sFileName = sReference + ".pdf";
                            sFileType = "PDF";
                        } else {
                            sFileName = oUploadColletionItemsCopy.name;
                            sFileType = sFileName.substring(sFileName.lastIndexOf(".") + 1).toUpperCase();
                        }
                        oFileReader.onloadend = function (e) {
                            var result = e.target.result;
                            aFilesSharePoint.push({
                                FileName: sFileName,
                                ArrayBufferResult: result,
                                FolderName: sFolderNameFile,
                            });
                            oFileReaderBase64.onloadend = function () {
                                var result = oFileReaderBase64.result;
                                aBase64Files.push({
                                    file: result.split(",")[1],
                                    type: sFileType,
                                    name: sFileName
                                });
                                convertFilesBlob(aUploadColletionItemsCopy);
                            }
                            oFileReaderBase64.readAsDataURL(oUploadColletionItemsCopy);
                        }
                        oFileReader.readAsArrayBuffer(oUploadColletionItemsCopy);
                    } else if (aFilesSharePoint.length > 0) {
                        if (sTypeRepository === "SHAREPOINT") {
                            //Sharepoint
                            that.saveDocumentsInSharepoint(
                                that,
                                aFilesSharePoint,
                                sFileName,
                                p,
                                aUploadColletionItems,
                                oAnexoSet,
                                oParentResponse,
                                fI18n,
                                sMessageAnexo,
                                sFolderNameFile
                            );
                        } else if (sTypeRepository === "DOCUMENTSERVICE") {
                            //DocumentService
                            that.saveDocumentsInDocumentService(
                                that,
                                aFilesSharePoint,
                                sFileName,
                                p,
                                aUploadColletionItems,
                                oAnexoSet,
                                oParentResponse,
                                fI18n,
                                oDataDS,
                                null,
                                sMessageAnexo
                            );
                        }
                        that.uploadFilesToArchiveLink(that, aBase64Files, oParentResponse, sMessageAnexo);
                    }
                }
                var aUploadColletionItemsCopy = aUploadColletionItems.slice();

                convertFilesBlob(aUploadColletionItemsCopy);
            },
            saveDocumentsInSharepoint: function (
                that,
                aFilesSharePoint,
                sFileName,
                iCount,
                aUploadColletionItems,
                oAnexoSet,
                oParentResponse,
                fI18n,
                sMessageAnexo,
                sFolderNameFile
            ) {
                SharePoint.createFolderDeep(that, that.sFullPath)
                    .then((response) => {
                        SharePoint.saveFiles(that, aFilesSharePoint)
                            .then((response) => {
                                //	if (iCount < aUploadColletionItems.length) {
                                for (var i = 0; i < aFilesSharePoint.length; i++) {
                                    var t = {
                                        PO_NUMBER: oAnexoSet.PO_NUMBER,
                                        RUC: oAnexoSet.RUC,
                                        FOLIO: oAnexoSet.FOLIO,
                                        FILENAME: aFilesSharePoint[i].FileName,
                                    };
                                    oAnexoSet.AnexoToFile.push(t);
                                }

                                //	}
                                //if (iCount === aUploadColletionItems.length - 1) {
                                oDataService
                                    .consult(that, "create", "/AnexoSet", oAnexoSet, "")
                                    .then((data) => {
                                        //Agrega un mensaje satisfactorio al log popover
                                        that._addPopoverMessage(
                                            "Success",
                                            fI18n.getText("PopTitle") + sMessageAnexo,
                                            "Anexos Guardados"
                                        );
                                        BusyIndicator.hide();
                                    })
                                    .catch((err) => {
                                        //Agrega un mensaje error al log popover
                                        that._addPopoverMessage(
                                            "Error",
                                            fI18n.getText("PopTitle") + sMessageAnexo,
                                            "Error al subir Anexos"
                                        );
                                        BusyIndicator.hide();
                                        Log.error("[SUPPLIERS]", err.toString());
                                    });
                                //}
                                iCount++;
                            })
                            .catch((err) => {
                                //Agrega un mensaje error al log popover
                                that._addPopoverMessage("Error", fI18n.getText("PopTitle") + sMessageAnexo, err);
                                Log.error("[SUPPLIERS]", err.toString());
                            });
                    })
                    .catch((err) => {
                        Log.error("[SUPPLIERS]", err.toString());
                    });
            },
            saveDocumentsInDocumentService: function (
                that,
                oBlob,
                sFileName,
                iCount,
                aUploadColletionItems,
                oAnexoSet,
                oParentResponse,
                fI18n,
                oDataDS,
                sReferencia,
                sMessageAnexo
            ) {
                DocumentService.getQuery(
                    "SELECT cmis:objectId FROM cmis:document WHERE IN_FOLDER('" +
                        oDataDS.FolderId +
                        "') AND cmis:name = '" +
                        sFileName +
                        "'"
                ).then(function (o) {
                    var s = o.results;
                    if (s.length > 0) {
                        var n = s[0].properties["cmis:objectId"].value;
                        DocumentService.deleteObject(oDataDS.FolderId, n).then(function (o) {
                            that.uploadFileInDocumentService(
                                that,
                                oBlob,
                                oDataDS,
                                sFileName,
                                oAnexoSet,
                                oParentResponse,
                                aUploadColletionItems,
                                fI18n,
                                iCount,
                                sMessageAnexo
                            );
                        });
                    } else {
                        that.uploadFileInDocumentService(
                            that,
                            oBlob,
                            oDataDS,
                            sFileName,
                            oAnexoSet,
                            oParentResponse,
                            aUploadColletionItems,
                            fI18n,
                            iCount,
                            sMessageAnexo
                        );
                    }
                });
            },
            uploadFileInDocumentService: function (
                that,
                oBlob,
                oDataDS,
                sFileName,
                oAnexoSet,
                oParentResponse,
                aUploadColletionItems,
                fI18n,
                iCount,
                sMessageAnexo
            ) {
                DocumentService.uploadFile(oBlob, oDataDS.FolderId, that, sFileName).then(function (e) {
                    if (e.message !== undefined) {
                        that._addPopoverMessage("Error", fI18n.getText("PopTitle") + sMessageAnexo, e.message);
                    } else {
                        if (iCount < aUploadColletionItems.length) {
                            var t = {
                                PO_NUMBER: oAnexoSet.PO_NUMBER,
                                RUC: oAnexoSet.RUC,
                                FOLIO: oAnexoSet.FOLIO,
                                FILENAME: sFileName,
                            };
                            oAnexoSet.AnexoToFile.push(t);
                        }
                    }
                    if (iCount === aUploadColletionItems.length - 1) {
                        oDataService
                            .consult(that, "create", "/AnexoSet", oAnexoSet, "")
                            .then((data) => {
                                that._addPopoverMessage(
                                    "Success",
                                    fI18n.getText("PopTitle") + sMessageAnexo,
                                    "Anexos Guardados"
                                );
                                BusyIndicator.hide();
                            })
                            .catch((err) => {
                                that._addPopoverMessage(
                                    "Error",
                                    fI18n.getText("PopTitle") + sMessageAnexo,
                                    "Error al subir Anexos"
                                );
                                BusyIndicator.hide();
                                Log.error("[SUPPLIERS]", err.toString());
                            });
                    }
                    iCount++;
                });
            },
            xmlCompleteFields: function (that, oEvent, oDataValidation, bMasivo) {},
            getFiltersConstant: function () {
                var aFilterUser = [];
                aFilterUser.push(new Filter("Aplication", "EQ", "SCP_SUPPLIERS"));
                aFilterUser.push(new Filter("Group1", "EQ", "SHAREPOINT"));
                aFilterUser.push(new Filter("Field", "EQ", "URL"));
                aFilterUser.push(new Filter("Field", "EQ", "LANDSCAPE"));
                aFilterUser.push(new Filter("Field", "EQ", "ROOT_DIRECTORY"));
                aFilterUser.push(new Filter("Field", "EQ", "PRE_REGISTER"));
                aFilterUser.push(new Filter("Group1", "EQ", "XML_TAG"));
                aFilterUser.push(new Filter("Field", "EQ", "DOCUMENT_TYPE"));

                return aFilterUser;
            },
            xmlValidation: function (that, oEvent, oDataValidation, bMasivo, aTag, oRowSelected) {
                var aDocumentType = that.getView().getModel("ModelGlobal").getProperty("/DocumentType");
                var sResultFile = oEvent.target.result;
                var xml = oEvent.target.result;
                var sTypeDocumentOfXML;
                var bValid = true;
                var bError = false;
                var sTextI18n = "";
                var o = xml.split("ï»¿");
                var oXmlTags;
                var sTag = "";
                var sEtiquete = "";
                if (o.length === 2) {
                    xml = o[1];
                }

                if (sResultFile.includes("href=" + '"recibo.xsl"' + "")) {
                    sTypeDocumentOfXML = "02";
                    if (oDataValidation.tipodocumento !== "02") {
                        bValid = false;
                        sTextI18n = "msgxmlbelongreceipt";
                    }
                } else if (sResultFile.includes("href=" + '"notacredito' + "") || sResultFile.includes("<CreditNote")) {
                    sTypeDocumentOfXML = "07";
                    if (oDataValidation.tipodocumento !== "07") {
                        bValid = false;
                        sTextI18n = "msgxmlbelongnote";
                    }
                } else {
                    sTypeDocumentOfXML = "01";
                    if (oDataValidation.tipodocumento !== "01") {
                        bValid = false;
                        sTextI18n = "msgxmlbelonginvoice";
                    }
                }
                var sAppUserRuc = that.getView().getModel("Usuario").getData().ruc;
                
                xml = new DOMParser().parseFromString(xml, "text/xml");
                xml = that.xmlToJson(xml);
                $.each(aTag, function (k, v) {
                    if (xml[v.text] !== undefined) {
                        oXmlTags = xml[v.text];
                        sTag = v.id;
                        sEtiquete = v.text;
                    }
                });
                if (oXmlTags === undefined) {
                    bValid = false;
                    sTextI18n = "msginvoicetagnotfound";
                    return {
                        Valid: bValid,
                        TextI18n: sTextI18n,
                        Error: bError,
                        TextError: "",
                    };
                }
                try {
                    // Lógica para parsear XML a formato JSON
                    var bNamespace = true;
                    var aKeys = [];
                    for (var key in oXmlTags["@attributes"]) {
                        if (key.includes(":")) {
                            aKeys.push(key.split(":")[1]);
                        }
                    }
                    for (var key in oXmlTags) {
                        if (oXmlTags[key].hasOwnProperty("@attributes")) {
                            var oAtributos = oXmlTags[key]["@attributes"];
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
                    var sTag = JSON.stringify(oXmlTags);
                    for (var i_ = 0; i_ < aKeysUnique.length; i_++) {
                        var sKey = aKeysUnique[i_];
                        var regex = new RegExp('"' + sKey + ":", "g");
                        //var sValid = '\"' + sKey + ':';
                        sTag = sTag.replace(regex, '"');
                    }
                    var oXmlTags = JSON.parse(sTag);

                    // En este punto oTag tiene el JSON con la data relevante del XML

                    // Verificar namespace y si existe InvoiceTypeCode en el XML
                    if (oXmlTags["cbc:InvoiceTypeCode"] === undefined) {
                        bNamespace = false;
                    }
                    var sInvoiceTypeCode = "";
                    if (bNamespace) {
                        sInvoiceTypeCode = oXmlTags["cbc:InvoiceTypeCode"];
                    } else {
                        sInvoiceTypeCode = oXmlTags.InvoiceTypeCode;
                    }

                    var sAccountingSupplierPartyPartyPartyIdentification = "";
                    var sAccountingSupplierPartyPartyPartyIdentificationIDtext = "";
                    var sAccountingSupplierPartyCustomerAssignedAccountIDtext = "";
                    var sAccountingCustomerPartyPartyPartyIdentification = "";
                    var sAccountingCustomerPartyPartyPartyIdentificationIDtext = "";
                    var sAccountingCustomerPartyCustomerAssignedAccountIDtext = "";
                    var sIssueDatetext = "";
                    var sID = "";
                    var sRequestedMonetaryTotal = "";
                    var sLegalMonetaryTotalPayableAmounttext = "";
                    var sRequestedMonetaryTotalPayableAmounttext = "";
                    var sDocumentCurrencyCode = "";
                    var sTaxTotalTaxAmountattributescurrencyID = "";

                    if (bNamespace) {
                        //
                        sAccountingSupplierPartyPartyPartyIdentification =
                            oXmlTags["cac:AccountingSupplierParty"]["cac:Party"]["cac:PartyIdentification"];
                        if (sAccountingSupplierPartyPartyPartyIdentification !== undefined) {
                            sAccountingSupplierPartyPartyPartyIdentificationIDtext =
                                oXmlTags["cac:AccountingSupplierParty"]["cac:Party"]["cac:PartyIdentification"]["cbc:ID"][
                                    "#text"
                                ];
                        }

                        if (oXmlTags["cac:AccountingSupplierParty"]["cbc:CustomerAssignedAccountID"] !== undefined) {
                            sAccountingSupplierPartyCustomerAssignedAccountIDtext =
                                oXmlTags["cac:AccountingSupplierParty"]["cbc:CustomerAssignedAccountID"]["#text"];
                        }
                        //
                        sAccountingCustomerPartyPartyPartyIdentification =
                            oXmlTags["cac:AccountingCustomerParty"]["cac:Party"]["cac:PartyIdentification"];
                        sAccountingCustomerPartyPartyPartyIdentificationIDtext =
                            oXmlTags["cac:AccountingCustomerParty"]["cac:Party"]["cac:PartyIdentification"]["cbc:ID"][
                                "#text"
                            ];
                        sAccountingCustomerPartyCustomerAssignedAccountIDtext =
                            oXmlTags["cac:AccountingCustomerParty"]["cbc:CustomerAssignedAccountID"]["#text"];
                        //
                        sIssueDatetext = oXmlTags["cbc:IssueDate"]["#text"];
                        //
                        sID = oXmlTags["cbc:ID"];
                        //
                        sRequestedMonetaryTotal = oXmlTags["cac:RequestedMonetaryTotal"];

                        //
                        if (oXmlTags.RequestedMonetaryTotal !== undefined) {
                            sRequestedMonetaryTotalPayableAmounttext =
                                oXmlTags["cac:RequestedMonetaryTotal"]["cbc:PayableAmount"]["#text"];
                        } else {
                            sLegalMonetaryTotalPayableAmounttext =
                                oXmlTags["cac:LegalMonetaryTotal"]["cbc:PayableAmount"]["#text"];
                        }

                        //
                        sDocumentCurrencyCode = oXmlTags["cbc:DocumentCurrencyCode"];
                        //
                        if (sDocumentCurrencyCode === undefined) {
                            sTaxTotalTaxAmountattributescurrencyID =
                                oXmlTags["cac:TaxTotal"]["cbc:TaxAmount"]["@attributes"].currencyID;
                        }
                    } else {
                        //
                        sAccountingSupplierPartyPartyPartyIdentification =
                            oXmlTags.AccountingSupplierParty.Party.PartyIdentification;
                        if (sAccountingSupplierPartyPartyPartyIdentification !== undefined) {
                            sAccountingSupplierPartyPartyPartyIdentificationIDtext =
                                oXmlTags.AccountingSupplierParty.Party.PartyIdentification.ID["#text"];
                        }

                        /*sAccountingSupplierPartyCustomerAssignedAccountIDtext = oTag["AccountingSupplierParty"]["CustomerAssignedAccountID"][
						"#text"
					];*/
                        if (oXmlTags.AccountingSupplierParty.CustomerAssignedAccountID !== undefined) {
                            sAccountingSupplierPartyCustomerAssignedAccountIDtext =
                                oXmlTags.AccountingSupplierParty.CustomerAssignedAccountID["#text"];
                        }

                        //
                        sAccountingCustomerPartyPartyPartyIdentification =
                            oXmlTags.AccountingCustomerParty.Party.PartyIdentification;

                        if (sAccountingCustomerPartyPartyPartyIdentification !== undefined) {
                            sAccountingCustomerPartyPartyPartyIdentificationIDtext =
                                oXmlTags.AccountingCustomerParty.Party.PartyIdentification.ID["#text"];
                        }
                        if (oXmlTags.AccountingCustomerParty.CustomerAssignedAccountID !== undefined) {
                            sAccountingCustomerPartyCustomerAssignedAccountIDtext =
                                oXmlTags.AccountingCustomerParty.CustomerAssignedAccountID["#text"];
                        }

                        //
                        sIssueDatetext = oXmlTags.IssueDate["#text"];
                        //
                        sID = oXmlTags.ID;
                        //
                        sRequestedMonetaryTotal = oXmlTags.RequestedMonetaryTotal;

                        //
                        if (oXmlTags.RequestedMonetaryTotal !== undefined) {
                            sRequestedMonetaryTotalPayableAmounttext =
                                oXmlTags.RequestedMonetaryTotal.PayableAmount["#text"];
                        } else {
                            sLegalMonetaryTotalPayableAmounttext = oXmlTags.LegalMonetaryTotal.PayableAmount["#text"];
                        }

                        //
                        sDocumentCurrencyCode = oXmlTags.DocumentCurrencyCode;
                        //
                        if (sDocumentCurrencyCode === undefined) {
                            sTaxTotalTaxAmountattributescurrencyID = oXmlTags.TaxTotal.TaxAmount["@attributes"].currencyID;
                        }
                    }
                    if (oDataValidation.tipodocumento === "02" && bValid) {
                        if (oXmlTags.TaxTotal && oXmlTags.TaxTotal.TaxSubtotal && oXmlTags.TaxTotal.TaxSubtotal.TaxableAmount) {
                            sLegalMonetaryTotalPayableAmounttext = oXmlTags.TaxTotal.TaxSubtotal.TaxableAmount["#text"];
                        }
                    }
                    if (oDataValidation.tipodocumento !== "07" && bValid) {
                        if (sInvoiceTypeCode !== undefined) {
                            //Tipo de documento
                            //var InvoiceTypeCode =	oTag["cbc:InvoiceTypeCode"]["#text"].replace(/ /g,"");
                            aDocumentType = aDocumentType.slice();
                            var oValidateType = aDocumentType.find((oItem) => {
                                return oItem.Codigo === sTypeDocumentOfXML;
                            });
                            if (oValidateType !== undefined) {
                                if (oRowSelected !== undefined) {
                                    oRowSelected.TIPDOCREFERENCE = sTypeDocumentOfXML;
                                } else if (bMasivo) {
                                    that.getView().getModel("Masivo").setProperty("/tipodocumento", sTypeDocumentOfXML);
                                    that.getView().getModel("Masivo").refresh();
                                }
                            } else {
                                bValid = false;
                                sTextI18n = "msgtagnotfounddocumenttype";
                            }
                        } else {
                            bValid = false;
                            sTextI18n = "msgtagnotfoundinvoicetypecode";
                        }
                    }

                    //Invoice
                    // Valida el número de ruc del proveedor
                    if (sAccountingSupplierPartyPartyPartyIdentification !== undefined) {
                        if (sAccountingSupplierPartyPartyPartyIdentificationIDtext !== sAppUserRuc && bValid) {
                            bValid = false;
                            sTextI18n = "msgrucnotmatch";
                            //return MessageToast.show("RUC no concuerda con RUC asignado al usuario.");
                        }
                    } else if (sAccountingSupplierPartyCustomerAssignedAccountIDtext !== sAppUserRuc && bValid) {
                        bValid = false;
                        sTextI18n = "msgrucnotmatch";
                        //return MessageToast.show("RUC no concuerda con RUC asignado al usuario.");
                    }
                    //Valida el número de ruc de la sociedad
                    if (sAccountingCustomerPartyPartyPartyIdentification !== undefined) {
                        if (
                            sAccountingCustomerPartyPartyPartyIdentificationIDtext !== oDataValidation.rucSociedad &&
                            bValid
                        ) {
                            bValid = false;
                            sTextI18n = "msgrucompanynotmatch";
                            //return MessageToast.show("RUC no concuerda con RUC asignado al usuario.");
                        }
                    } else if (
                        sAccountingCustomerPartyCustomerAssignedAccountIDtext !== oDataValidation.rucSociedad &&
                        bValid
                    ) {
                        bValid = false;
                        sTextI18n = "msgrucompanynotmatch";
                        //return MessageToast.show("RUC no concuerda con RUC asignado al usuario.");
                    }
                    //Invoice
                    if (sIssueDatetext !== oDataValidation.fechaFactura && bValid && oRowSelected === undefined) {
                        bValid = false;
                        sTextI18n = "msginvoicedatenotmatch";
                        //return MessageToast.show("Fecha de factura no concuerda con XML");
                    }
                    //Para Invoice, RxH y Nota de crédito
                    if (oRowSelected !== undefined) {
                        oRowSelected.FechaFacturaP = sIssueDatetext;
                    }
                    //Número de factura, RxH y Nota de Crédito
                    if (sInvoiceTypeCode !== undefined && sID !== undefined) {
                        var n = sID["#text"];
                        var iNumber = sTypeDocumentOfXML === "02" ? 7 : 8;

                        if (n.length > 12 && sTypeDocumentOfXML === "02") {
                            bValid = false;
                            sTextI18n = "msginvoicenumbermaxlength";
                        } else if (n.length > 13 && (sTypeDocumentOfXML === "01" || sTypeDocumentOfXML === "07")) {
                            bValid = false;
                            sTextI18n = "msginvoicenumbermaxlength";
                        }
                        n = Formatter.formatoReferencia(n, iNumber);
                        if (n !== oDataValidation.numeroFactura && bValid && oRowSelected === undefined) {
                            bValid = false;
                            sTextI18n = "msginvoicenumbernotmatch";
                            //return MessageToast.show("Número de Factura no concuerda con XML");
                        }
                        if (oRowSelected !== undefined && bValid) {
                            oRowSelected.REFERENCE = n;
                        }
                    } else if (sID !== undefined) {
                        var n = sID["#text"];
                        var iNumber = sTypeDocumentOfXML ? 7 : 8;
                        n = Formatter.formatoReferencia(n, iNumber);
                        if (n !== oDataValidation.numeroFactura && bValid && oRowSelected === undefined) {
                            bValid = false;
                            sTextI18n = "msginvoicenumbernotmatch";
                            //return MessageToast.show("Número de Factura no concuerda con XML");
                        }
                        if (oRowSelected !== undefined) {
                            oRowSelected.REFERENCE = n;
                        }
                    } else if (sEtiquete === "Invoice" && bValid) {
                        bValid = false;
                        sTextI18n = "msgtagnotfoundinvoicetypecodeorid";
                        //return MessageToast.show("Etiqueta cbc:InvoiceTypeCode ó cbc:ID no encontrada en XML");
                    }

                    //Invoice
                    if (oDataValidation.tipodocumento === "01" && !bMasivo) {
                        oDataValidation.total = oDataValidation.TOTAL_VALUE_IGV.replace(/\s/g, "");
                    } else if (!bMasivo) {
                        //oDataValidation.total = oDataValidation.TOTAL_VALUE_NO_IGV.replace(/\s/g, "");
                        oDataValidation.total = oDataValidation.TOTAL_VALUE_IGV.replace(/\s/g, "");
                    } else {
                        oDataValidation.total = oDataValidation.total.replace(/\s/g, "");
                    }
                    //Invoice
                    if (sRequestedMonetaryTotal === undefined) {
                        that.setTotalXMLValue(
                            parseFloat(sLegalMonetaryTotalPayableAmounttext.replace(/,/g, "")),
                            oDataValidation.total
                        );
                    //     if (
                    //         parseFloat(sLegalMonetaryTotalPayableAmounttext.replace(/,/g, "")) !==
                    //             parseFloat(oDataValidation.total) &&
                    //         bValid
                    //     ) {
                    //         bValid = false;
                    //         sTextI18n = "msginvoiceamountdifferent";
                    //         //return MessageToast.show("Monto de factura es distinto a XML");
                    //     }
                    // } else if (
                    //     parseFloat(sRequestedMonetaryTotalPayableAmounttext.replace(/,/g, "")) !==
                    //         parseFloat(oDataValidation.total) &&
                    //     bValid
                    // ) {
                    //     bValid = false;
                    //     sTextI18n = "msginvoiceamountdifferent";
                    //     //return MessageToast.show("Monto de factura es distinto a XML");
                    }
                    //Invoice
                    if (sDocumentCurrencyCode !== undefined) {
                        if (
                            sDocumentCurrencyCode["#text"] !== "" &&
                            sDocumentCurrencyCode["#text"] !== oDataValidation.moneda &&
                            bValid
                        ) {
                            bValid = false;
                            sTextI18n = "msgcurrenctynotmatch";
                            //return MessageToast.show("Moneda no concuerda con XML");
                        }
                    } else if (sTaxTotalTaxAmountattributescurrencyID !== oDataValidation.moneda && bValid) {
                        bValid = false;
                        sTextI18n = "msgcurrenctynotmatch";
                        //return MessageToast.show("Moneda no concuerda con XML");
                    }

                    //Sunat
                    let rucProveedor = "";
                    if (sAccountingSupplierPartyCustomerAssignedAccountIDtext !== "") {
                        rucProveedor = sAccountingSupplierPartyCustomerAssignedAccountIDtext;
                    } else if (sAccountingSupplierPartyPartyPartyIdentificationIDtext !== "") {
                        rucProveedor = sAccountingSupplierPartyPartyPartyIdentificationIDtext;
                    }
                    let rucAcreedor = "";
                    if (sAccountingCustomerPartyPartyPartyIdentificationIDtext !== "") {
                        rucAcreedor = sAccountingCustomerPartyPartyPartyIdentificationIDtext;
                    } else if (sAccountingCustomerPartyCustomerAssignedAccountIDtext !== "") {
                        rucAcreedor = sAccountingCustomerPartyCustomerAssignedAccountIDtext;
                    }

                    that.getView()
                        .getModel("sunatVariables")
                        .setData(
                            Sunat.getJsonData(
                                rucProveedor,
                                sTypeDocumentOfXML,
                                sID["#text"],
                                sIssueDatetext,
                                sLegalMonetaryTotalPayableAmounttext.replace(/,/g, "").toString(),
                                rucAcreedor
                            )
                        );

                    return {
                        Valid: bValid,
                        TextI18n: sTextI18n,
                        Error: bError,
                        TextError: "",
                    };
                } catch (err) {
                    // console.log(err);
                    return {
                        Valid: bValid,
                        TextI18n: sTextI18n,
                        Error: true,
                        TextError: err.message,
                    };
                    //return MessageToast.show(err.message);
                }
            },
            getDateRoute: function () {
                var d = new Date();
                var aFecha = d.toISOString().split("T")[0].split("-");
                //["2021", "04", "12"]
                return aFecha[0] + "/" + aFecha[1] + "/" + aFecha[2];
            },
            setTotalXMLValue: function (TOTAL_VALUE, TOTAL_VALUE_IGV) {
                let that = this;
                if (!that.getModel("oModelXMLValue")) {
                    let xml_total = {
                        TOTAL_VALUE: "0",
                        TOTAL_VALUE_IGV: "0",
                        TOTAL_VALUE_NO_IGV: "0",
                    };
                    that.getView().setModel(new JSONModel(xml_total), "oModelXMLValue");
                }

                that.getModel("oModelXMLValue").setProperty("/TOTAL_VALUE", TOTAL_VALUE.toString());
                that.getModel("oModelXMLValue").setProperty("/TOTAL_VALUE_IGV", TOTAL_VALUE_IGV.toString());
                that.getModel("oModelXMLValue").setProperty("/TOTAL_VALUE_NO_IGV", TOTAL_VALUE_IGV.toString());
            },
            uploadFilesToArchiveLink: function (that, aBase64Files, oParentResponse, sMessageAnexo) {
                var sBukrs = oParentResponse.COMPANY_CODE;
                var sBelnr = oParentResponse.Belnr;
                var sGjahr = oParentResponse.Gjahr;
                var sModulo = "MM";
                var oPayload = {
                    Bukrs: sBukrs,
                    Belnr: sBelnr,
                    Gjahr: sGjahr,
                    Modulo: sModulo,
                    PRNotPODocsSet: []
                };
                aBase64Files.forEach((oFile) => {
                    oPayload.PRNotPODocsSet.push({
                        Bukrs: oPayload.Bukrs,
                        Belnr: oPayload.Belnr,
                        Gjahr: oPayload.Gjahr,
                        Bas64: oFile.file,
                        Exten: oFile.type,
                        Nombre: oFile.name,
                        Return: ""
                    });
                });
                var oModel = that.getView().getModel();
                oModel.create("/PRNotPONewSet", oPayload, {
                    success: function (oResponse) {
                        that._addPopoverMessage(
                            "Success",
                            that.getI18nText("PopTitle") + sMessageAnexo,
                            "Anexos Guardados en ArchiveLink"
                        );
                    },
                    error: function (oError) {
                        MessageToast.show(that.getI18nText("ErrorArchiveLink"));
                    }
                });
            }
        });
    }
);
