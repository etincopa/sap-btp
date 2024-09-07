sap.ui.define(
    [
        "com/everis/suppliers/accountstatus/controller/BaseController",
        "sap/ui/model/Filter",
        "sap/m/TablePersoController",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "../service/Sunat",
        "../model/formatter",
    ],
    function (
        BaseController,
        Filter,
        TablePersoController,
        MessageBox,
        Device,
        JSONModel,
        MessageToast,
        Sunat,
        Formatter
    ) {
        "use strict";
        var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
        return BaseController.extend("com.everis.suppliers.accountstatus.controller.Principal", {
            formatter: Formatter,
            onInit: function () {
                var that = this;
                this.oTable = this._byId("tblEstadoCuenta");
                this.oTable.setSticky(["ColumnHeaders", "HeaderToolbar"]);

                this.oFilterBar = this._byId("ftbEstadoCuenta");
                this.oRouter = this.getOwnerComponent().getRouter();

                // Create a persistence key
                var oPersId = {
                    container: "TablePersonalization",
                    item: "EstadoCuentaProveedor",
                };

                // Get a personalization service provider from the shell (or create your own)
                var oProvider = sap.ushell.Container.getService("Personalization").getPersonalizer(oPersId);

                if (!this._oTPC) {
                    // init and activate controller
                    this._oTPC = new TablePersoController({
                        table: this.oTable,
                        //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                        componentName: "EstadoCuentaProveedor",
                        persoService: oProvider,
                    }).activate();
                }

                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.metadataLoaded().then(this.onMetadataLoaded.bind(this, oDataModel));

                var oConfigModel = new JSONModel({
                    thereIsData: false,
                });
                this.getView().setModel(oConfigModel, "Config");

                this.readUserIasInfo().then(
                    function (oModelUser) {
                        var oData = oModelUser.getData();
                        if (oData.ruc.length === 0) {
                            //Duro texto
                            MessageBox.error(that.getI18nText("sErrorIASCustomAttributeRUC"));
                        }
                        that.getView().setModel(oModelUser, "User");
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },

            onMetadataLoaded: function (myODataModel) {
                var metadata = myODataModel.getServiceMetadata();
                var aInvoiceHeader = metadata.dataServices.schema[0].entityType[4].property;
                this.sorteableCols = [];
                for (var i = 0; i < aInvoiceHeader.length; i++) {
                    var aExtensions = aInvoiceHeader[i].extensions;

                    var falseSorter = aExtensions.filter(function (e) {
                        return e.name === "sortable" && e.value === "false";
                    });

                    if (!falseSorter || !falseSorter.length) {
                        var aLabel = aExtensions.filter(function (e) {
                            return e.name === "label";
                        });

                        var selected = false;
                        if (aInvoiceHeader[i].name === "INVOICENUMBER") {
                            selected = true;
                        }

                        this.sorteableCols.push({
                            text: aLabel[0].value,
                            key: aInvoiceHeader[i].name,
                            selected: selected,
                        });
                    }
                }

                // Load data with default filters
                // this.onSearch();
            },

            onAfterRendering: function () {
                if (!Device.system.desktop) {
                    this.oFilterBar.setUseToolbar(true);
                }
            },

            onExit: function () {
                this._oTPC.destroy();
                if (this.createViewSettingsDialog !== undefined) {
                    this.createViewSettingsDialog.destroy();
                }
            },

            onSelectionChange: function (oEvent) {
                var oView = this.getView();
                var oItem = oEvent.getSource();
                var oKey = oItem.getSelectedKey();
                if (oKey === "99") {
                    if (!this.pressDialog) {
                        this.pressDialog = sap.ui.xmlfragment(
                            oView.getId(),
                            "com.everis.suppliers.accountstatus.view.fragment.PressDialog",
                            this
                        );
                        //to get access to the global model
                        this.getView().addDependent(this.pressDialog);
                    }
                    this.pressDialog.open();
                }
            },

            onDialogBtnPress: function (oEvent) {
                var oCombo = this.byId("idCmbFecha");
                var oIndex = oCombo.getItems().length;
                var oPicker = this.byId("DRS1");
                var bFlag = true;
                jQuery.each(oCombo.getItems(), function () {
                    if (this.getText() === oPicker.getValue()) {
                        bFlag = false;
                        sap.m.MessageToast.show("El rango de fechas seleccionado ya se encuentra en la lista");
                        return;
                    }
                });
                if (bFlag && oPicker) {
                    oCombo.insertItem(
                        new sap.ui.core.Item({
                            text: oPicker.getValue(),
                            key: oIndex + 1,
                        }),
                        oIndex + 1
                    );
                    oCombo.setSelectedKey(oIndex + 1);
                } else {
                    oCombo.setSelectedKey(oIndex);
                }
                this.pressDialog.close();
            },

            onDialogBtnClose: function () {
                var oCbxFecha = this._byId("idCmbFecha");
                oCbxFecha.setSelectedKey("0");
                this.pressDialog.close();
            },

            onGetDateFilter: function () {
                var oCbxFecha = this._byId("idCmbFecha");
                var sKey = oCbxFecha.getSelectedKey();

                function formatDate(oDate) {
                    function formatDayMonth(oValue) {
                        return oValue < 10 ? "0" + oValue : oValue;
                    }
                    var sResult = "";
                    var oMonth = oDate.getMonth();
                    oMonth++;
                    var oDay = oDate.getDate();
                    return sResult.concat(oDate.getFullYear(), formatDayMonth(oMonth), formatDayMonth(oDay));
                }

                if (sKey.length && sKey) {
                    var myDate = new Date();

                    if (sKey === "99") {
                        return false;
                    }

                    switch (sKey) {
                        case "0":
                            myDate.setDate(myDate.getDate() - 30);
                            return new Filter("ItRequestDate", "GE", formatDate(myDate));
                        case "1":
                            myDate.setDate(myDate.getDate() - 15);
                            return new Filter("ItRequestDate", "GE", formatDate(myDate));
                        case "4":
                            var res = oCbxFecha.getSelectedItem().getText().split(" - ");
                            var oDateFrom = res[0].substr(6, 4) + res[0].substr(3, 2) + res[0].substr(0, 2);
                            var oDateTo = res[1].substr(6, 4) + res[1].substr(3, 2) + res[1].substr(0, 2);
                            return new Filter("ItRequestDate", "BT", oDateFrom, oDateTo);

                        case "98":
                            myDate.setFullYear(2017, 7, 5);
                            break;
                        default:
                            res = oCbxFecha.getSelectedItem().getText().split(" - ");
                            oDateFrom = res[0].substr(6, 4) + res[0].substr(3, 2) + res[0].substr(0, 2);
                            oDateTo = res[1].substr(6, 4) + res[1].substr(3, 2) + res[1].substr(0, 2);
                            return new Filter("ItRequestDate", "BT", oDateFrom, oDateTo);
                    }
                }
            },

            onGetCompanyFilter: function () {
                var oFilter = this.getView().getModel("filters");
                var aFilters = [];
                if (oFilter.getData().Bukrs && oFilter.getData().Bukrs.length) {
                    for (var i = 0; i < oFilter.getData().Bukrs.length; i++) {
                        aFilters.push(new Filter("ItCompanyId", "EQ", oFilter.getData().Bukrs[i]));
                    }

                    return new Filter({
                        filters: aFilters,
                        and: false,
                    });
                }
            },

            onGetUserFilter: function () {
                var oUser = this.getView().getModel("User").getData();
                var sUser = oUser.ruc;
                //var sUser = sap.ushell.Container.getService("UserInfo").getUser().getId();
                //if (sUser === "DEFAULT_USER") sUser = "20200120001";
                return new Filter("ItTaxIdNumber", "EQ", sUser);
            },

            onSearch: function (oEvent) {
                this.oDateFilter = this.onGetDateFilter();
                this.oCompanyFilter = this.onGetCompanyFilter();
                var oUserFilter = this.onGetUserFilter();
                var bError = false;
                var sText = "";

                var aFilters = [];

                if (this.oDateFilter) {
                    aFilters.push(this.oDateFilter);
                } else {
                    sText = "-Debe seleccionar un rango de fechas válido.";
                    bError = true;
                }
                // Sino se selecciona sociedad que devuelva de todas las sociedades.
                // if (this.oCompanyFilter) {
                // 	aFilters.push(this.oCompanyFilter);
                // } else {
                // 	sText = "\n-Debe seleccionar al menos una sociedad.";
                // 	bError = true;
                // }
                if (this.oCompanyFilter) {
                    if (this.oCompanyFilter.aFilters.length) {
                        var aFiltersCompany = this.oCompanyFilter.aFilters;
                        for (var i = 0; i < aFiltersCompany.length; i++) {
                            aFilters.push(aFiltersCompany[i]);
                        }
                    }
                }
                if (oUserFilter) aFilters.push(oUserFilter);

                if (bError) {
                    MessageBox.error(sText);
                    return false;
                }
                this.oTable.setBusy(true);
                this.oTable.getBinding("items").filter(aFilters);
            },

            onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
            },

            // Para Clasificar.
            onSortButtonPressed: function (oEvent) {
                if (!this.createViewSettingsDialog) {
                    this.createViewSettingsDialog = sap.ui.xmlfragment(
                        "com.everis.suppliers.accountstatus.view.fragment.SortDialog",
                        this
                    );
                }

                if (this.sorteableCols && this.sorteableCols.length) {
                    var oColModel = new JSONModel(this.sorteableCols);
                    this.createViewSettingsDialog.setModel(oColModel);
                }

                this.createViewSettingsDialog.open();
            },

            // Para Clasificar.
            onCloseSortDialog: function (oEvent) {
                this.createViewSettingsDialog.close();
            },

            // Para Clasificar.
            onHandleSortDialogConfirm: function (oEvent) {
                var mParams = oEvent.getParameters(),
                    oBinding = this.oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];
                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                oBinding.sort(aSorters);

                var aColumns = this.oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    if (aColumns[i].data("property").replace("_TXT", "") === sPath) {
                        var sIndicator = "Descending";
                        if (!bDescending) {
                            sIndicator = "Ascending";
                        }
                        aColumns[i].setSortIndicator(sIndicator);
                    } else {
                        aColumns[i].setSortIndicator(null);
                    }
                }
            },

            onSearchFreeText: function (oEvent) {
                if (!this.oCompanyFilter || !this.oDateFilter) {
                    MessageToast.show("Debe ejecutar una búsqueda en la barra de filtros.");
                    return false;
                }

                var sQuery = oEvent.getParameter("query");
                var oUserFilter = this.onGetUserFilter();

                var aFilters = [];

                aFilters.push(new Filter("FreeText", "EQ", sQuery));
                aFilters.push(this.oDateFilter);
                aFilters.push(this.oCompanyFilter);
                aFilters.push(oUserFilter);

                this.oTable.setBusy(true);
                this.oTable.getBinding("items").filter(aFilters);
            },

            onRestoreFilters: function () {
                var oFilters = this.getView().getModel("filters");
                var oBj = {
                    DateCreation: "0",
                    Bukrs: [],
                };

                oFilters.setProperty("/", oBj);
                oFilters.refresh();
            },
            readUserIasInfo: function () {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var userModel = new JSONModel({});
                    var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    if (sMail === "DEFAULT_USER" || sMail === undefined) 
                        sMail = "suppliers.proveedor1@medifarma.com.pe";
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
                            }
                            var oUserModel = new JSONModel(oData);
                            resolve(oUserModel);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            rowLoaded: function (oEvent) {
                console.log(oEvent);
            },
            onPressLoadSunat: function (oEvent) {
                let oSource = oEvent.getSource();
                oSource.setBusy(true);
                let oData = oSource.getBindingContext().getObject();
                let oSociedad = this.getView().byId("mbxSociedad").getModel();
                oData.rucAcreedor = oSociedad.getContext("/CompanySet('" + oData.COMPANY + "')").getObject().CompanyNif;
                let data = Sunat.getJsonDataSunat(oData);
                Sunat.getSunatStatus(data, this)
                    .then((nSunat) => {
                        switch (nSunat) {
                            case -1:
                                oSource.setType("Negative");
                                oSource.setIcon("sap-icon://decline");
                                oSource.setText("Reintentar");
                                oSource.setBusy(false);
                                break;
                            case 0:
                                oSource.setType("Negative");
                                oSource.setIcon("sap-icon://decline");
                                oSource.setText("Rechazado");
                                oSource.setBusy(false);
                                break;
                            default:
                                oSource.setType("Emphasized");
                                oSource.setIcon("sap-icon://accept");
                                oSource.setActiveIcon();
                                oSource.setText("Aceptado");
                                oSource.setBusy(false);
                                break;
                        }
                    })
                    .catch((err) => {
                        oSource.setType("Transparent");
                        oSource.setIcon("sap-icon://collections-insight");
                        console.log(err);
                        oSource.setBusy(false);
                    });
            },
            onCommentPress: function (oEvent){
                var t = oEvent.getSource().getBindingContext().getObject();
                    MessageBox.information("Comentarios", {
                    title: "Information",
                    id: "messageBoxId1",
                    details: t.Notas,
                    contentWidth: "100px",
                    styleClass: sResponsivePaddingClasses
                });
		}
        });
    }
);
