sap.ui.define(
    [
        "../controller/BaseController",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "../model/formatter",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
    ],
    function (BaseController, Controller, Filter, Formatter, Fragment, JSONModel, MessageBox) {
        "use strict";
        var sRoute = "com.everis.suppliers.potracking.view.dialog";
        return BaseController.extend("com.everis.suppliers.potracking.controller.Home", {
            formatter: Formatter,
            onInit: function () {
                var that = this;
                that.Nif = "2000000000";

                // this._byId("fltbIdTrackOC")._oSearchButton.setText(this.getI18nText("txtbtnsearch"));
                this.readUserIasInfo().then(function (data) {
                    var oTblIdTracking = that.getView().byId("tblIdQuotation");
                    var aFilter = [];
                    that.Nif = data.oData.ruc;
                    if (data.oData.ruc.length === 0) {
                        MessageBox.error(that.getI18nText("sErrorIASCustomAttributeRUC"));
                    } else {
                        aFilter.push(new Filter("Nif", "EQ", that.Nif));
                        // that.onSearch();
                        // oTblIdTracking.getBinding("items").filter(aFilter);
                    }
                });

                // this.getOwnerComponent().getModel()
                // 	.metadataLoaded()
                // 	.then(function (odata) {
                // 		console.log(odata);
                // 	}.bind(this));
            },
            onSearch: function (oEvent) {
                var oItIdMaster = this.getView().byId("itIdMaster");
                var sKey = oItIdMaster.getSelectedKey();
                var aFilter = [];

                var aFilterHeader = this.getFilter(this);
                if (!aFilterHeader) return;
                aFilter = aFilter.concat(aFilterHeader);
                aFilter.push(new Filter("Nif", "EQ", this.Nif));
                this.getView().byId("vsdFilterBarOrder").setVisible(false);
                this.getView().byId("vsdFilterBarPayment").setVisible(false);
                this.getView().byId("vsdFilterBarInvoice").setVisible(false);
                this.getView().byId("vsdFilterBarQuotation").setVisible(false);
                this.getView().byId("tblIdPayment").getBinding("items").filter(aFilter);
                this.getView().byId("tblIdInvoice").getBinding("items").filter(aFilter);
                this.getView().byId("tblIdQuotation").getBinding("items").filter(aFilter);
                this.getView().byId("tblIdOrder").getBinding("items").filter(aFilter);
            },
            onAfterRendering: function (oEvent) {
                var oTblIdTracking = this.getView().byId("tblIdQuotation");
                var aFilter = [];
                aFilter.push(new Filter("Nif", "EQ", this.Nif));
                //oTblIdTracking.getBinding("items").filter(aFilter);
            },
            onPressBack: function (oEvent) {
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                this.byId("navcIdOC" + sCustom).to(this.getView().createId("TBLE" + sCustom));
            },
            onNavChange: function (oEvent) {
                /*	var oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
				var aFilters = [];
				aFilters.push(new Filter("Codecsr", 'EQ', Codecsr));
				this.byId("tblIdTrackingDetail").getBinding("items").filter(aFilters);*/
                var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
                var oTblIdTrackingDetail = this.getView().byId("tblId" + sCustom + "Detail");
                var aFilter = [];
                if (sCustom === "Payment") {
                    aFilter.push(new Filter("FiscalYear", "EQ", oObject.FiscalYear));
                    aFilter.push(new Filter("Company", "EQ", oObject.Company));
                }
                aFilter.push(new Filter("OptionId", "EQ", oObject.OptionId));
                aFilter.push(new Filter("Document", "EQ", oObject.Document));
                aFilter.push(new Filter("StatusText", "EQ", oObject.StatusText));
                aFilter.push(new Filter("StatusColor", "EQ", oObject.StatusColor));
                oTblIdTrackingDetail.getBinding("items").filter(aFilter);
                this.byId("navcIdOC" + sCustom).to(this.getView().createId("TBDT" + sCustom));
            },
            onPressFilter: function (oEvent) {
                var oItIdMaster = this.getView().byId("itIdMaster");
                var sKey = oItIdMaster.getSelectedKey();
                var sFragmentId = "",
                    sDialogName = "",
                    sField = "";
                var aFilter = [];
                switch (sKey) {
                    case "itfIdPay":
                        sFragmentId = "FragmentIdPay";
                        sDialogName = "DialogNamePay";
                        sField = "PAYMENT";
                        break;
                    case "itfIdInvoice":
                        sFragmentId = "FragmentIdInvoice";
                        sDialogName = "DialogNameInvoice";
                        sField = "INVOICE";
                        break;
                    case "itfIdQuotation":
                        sFragmentId = "FragmentIdQuotation";
                        sDialogName = "DialogNameQuotation";
                        sField = "QUOTATION";
                        break;
                    case "itfIdOrder":
                        sFragmentId = "FragmentIdOrder";
                        sDialogName = "DialogNameOrder";
                        sField = "ORDER";
                        break;
                    default:
                }
                aFilter.push(new Filter("Field", "EQ", sField));
                this.setFragment(this, sDialogName, sFragmentId, "Filter", sRoute);
                sap.ui.core.Fragment.byId(sFragmentId, "vsfIdFiler").getBinding("items").filter(aFilter);
                this[sDialogName].open();
            },
            handleFilterDialogConfirm: function (oEvent) {
                var oItIdMaster = this.getView().byId("itIdMaster");
                var sKey = oItIdMaster.getSelectedKey();
                var sId = "";
                var mParams = oEvent.getParameters(),
                    aFilters = [];

                mParams.filterItems.forEach(function (oItem) {
                    var sKey = oItem.getKey(),
                        oFilter = new Filter("StatusId", "NE", sKey);
                    aFilters.push(oFilter);
                });

                switch (sKey) {
                    case "itfIdPay":
                        sId = "Payment";
                        break;
                    case "itfIdInvoice":
                        sId = "Invoice";
                        break;
                    case "itfIdQuotation":
                        sId = "Quotation";
                        break;
                    case "itfIdOrder":
                        sId = "Order";
                        break;
                    default:
                }
                aFilters.push(new Filter("Nif", "EQ", this.Nif));
                var aFilterHeader = this.getFilter(this);
                aFilters = aFilters.concat(aFilterHeader);
                var oTable = this.byId("tblId" + sId),
                    oBinding = oTable.getBinding("items");
                // apply filter settings
                oBinding.filter(aFilters);
                // update filter bar
                this.byId("vsdFilterBar" + sId).setVisible(mParams.filterItems > 0);
                this.byId("vsdFilterLabel" + sId).setText(mParams.filterString);
            },
            onSearchRegister: function (oEvent) {
                var aFilters = [];
                var oItIdMaster = this.getView().byId("itIdMaster");
                var sKey = oItIdMaster.getSelectedKey();
                var sId = "";
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("Search", "Contains", sQuery);
                    aFilters.push(filter);
                }
                switch (sKey) {
                    case "itfIdPay":
                        sId = "Payment";
                        break;
                    case "itfIdInvoice":
                        sId = "Invoice";
                        break;
                    case "itfIdQuotation":
                        sId = "Quotation";
                        break;
                    case "itfIdOrder":
                        sId = "Order";
                        break;
                    default:
                }
                aFilters.push(new Filter("Nif", "EQ", this.Nif));
                var aFilterHeader = this.getFilter(this);
                aFilters = aFilters.concat(aFilterHeader);
                var oTable = this.byId("tblId" + sId),
                    oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
                // update filter bar
                this.byId("vsdFilterBar" + sId).setVisible(false);
                this.byId("vsdFilterLabel" + sId).setText("");
            },
            onSelectIconTabFilter: function (oEvent) {
                var sKey = oEvent.getParameters("key").key;
                var sId = "";
                var aFilter = [];
                switch (sKey) {
                    case "itfIdPay":
                        sId = "Payment";
                        break;
                    case "itfIdInvoice":
                        sId = "Invoice";
                        break;
                    case "itfIdQuotation":
                        sId = "Quotation";
                        break;
                    case "itfIdOrder":
                        sId = "Order";
                        break;
                    default:
                        aFilter.push(new Filter("OptionId", "EQ", "P"));
                }
                var aFilterHeader = this.getFilter(this);
                aFilter = aFilter.concat(aFilterHeader);
                aFilter.push(new Filter("Nif", "EQ", this.Nif));
                var oTblIdTracking = this.getView().byId("tblId" + sId);
                oTblIdTracking.getBinding("items").filter(aFilter);
            },
            getFilter: function (that) {
                var oFilter = that.getView().getModel("modelGlobal").getProperty("/Filter"),
                    aFilter = [];

                if (oFilter.Company.length === 0) {
                    MessageBox.error(this.getI18nText("txtmsgerrorseleccionarsociedad"));
                    return;
                }

                if (oFilter.OptionDate !== "" && oFilter.OptionDate !== null) {
                    if (oFilter.OptionDate === "0" || oFilter.OptionDate === "1") {
                        var sDate = this.onGetFormatDate(oFilter.OptionDate);

                        aFilter.push(
                            new Filter(
                                "DocumentDate",
                                "BT",
                                sDate.split("/")[0] + "T00:00:00",
                                sDate.split("/")[1] + "T00:00:00"
                            )
                        );
                    } else {
                        aFilter.push(
                            new Filter(
                                "DocumentDate",
                                "BT",
                                oFilter.DocumentDate.split(" - ")[0] + "T00:00:00",
                                oFilter.DocumentDate.split(" - ")[1] + "T00:00:00"
                            )
                        );
                    }
                }

                if (oFilter.Folio !== "") {
                    aFilter.push(new Filter("Folio", "EQ", oFilter.Folio));
                }

                // Multicombobox Sociedad GRPR
                // if (oFilter.Company !== "") {
                if (oFilter.Company.length > 0) {
                    $.each(oFilter.Company, function (k, v) {
                        aFilter.push(new Filter("Company", "EQ", v));
                    });
                }

                if (oFilter.QuotationNumber !== "") {
                    aFilter.push(new Filter("QuotationNumber", "EQ", oFilter.QuotationNumber));
                }

                if (oFilter.MaterialDocument !== "") {
                    aFilter.push(new Filter("MaterialDocument", "EQ", oFilter.MaterialDocument));
                }

                if (oFilter.Order !== "") {
                    aFilter.push(new Filter("Order", "EQ", oFilter.Order));
                }
                return aFilter;
            },
            readUserIasInfo: function () {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var userModel = new JSONModel({});
                    var sMail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    if (sMail === "DEFAULT_USER" || sMail === undefined) sMail = "proveedor_everis1@yopmail.com";
                    var sPath = 'iasscim/Users?filter=emails.value eq "' + sMail + '"';
                    const sUrl = that.getOwnerComponent().getManifestObject().resolveUri(sPath);
                    userModel
                        .loadData(sUrl, null, true, "GET", null, null, {
                            "Content-Type": "application/scim+json",
                        })
                        .then(() => {
                            console.log("***IAS**");
                            var oDataTemp = userModel.getData();
                            var oData = {};
                            var aAttributes =
                                oDataTemp.Resources[0]["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
                            if (aAttributes !== undefined) {
                                oData = {
                                    oData: {
                                        ruc: oDataTemp.Resources[0][
                                            "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
                                        ].attributes[0].value,
                                    },
                                };
                            } else {
                                oData = {
                                    oData: {
                                        ruc: "",
                                    },
                                };
                            }
                            resolve(oData);
                            console.log(userModel.getData());
                        })
                        .catch((err) => {
                            console.log("***fail**");
                            reject("Error");
                        });
                });
            },

            // Cuando se va a seleccionar un rango en las fechas GRPR
            onSelectionChange: function (oEvent) {
                var oView = this.getView();
                var oItem = oEvent.getSource();
                var oKey = oItem.getSelectedKey();
                if (oKey === "99") {
                    if (!this.pressDialog) {
                        this.pressDialog = sap.ui.xmlfragment(
                            oView.getId(),
                            "com.everis.suppliers.potracking.view.dialog.DateRange",
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

            onFilterDateClean: function () {
                var oDataFilters = this.getView().getModel("modelGlobal").getProperty("/Filter");
                oDataFilters.getData().OptionDate = "0";
                oDataFilters.refresh();
            },

            onDialogBtnClose: function () {
                this.onFilterDateClean();
                // var oCbxFecha = this._byId("idCmbFecha");
                // oCbxFecha.setSelectedKey("0");
                this.pressDialog.close();
            },

            onGetFormatDate: function (sOption) {
                var dMyDate = new Date(),
                    dDateToday = new Date();

                if (sOption === "0") {
                    dMyDate.setDate(dMyDate.getDate() - 30);
                } else if (sOption === "1") {
                    dMyDate.setDate(dMyDate.getDate() - 15);
                }
                return Formatter.formatDate(dMyDate) + "/" + Formatter.formatDate(dDateToday);
            },
        });
    }
);
