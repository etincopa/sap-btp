sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "./utilities",
        "sap/ui/core/routing/History",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function (Controller, MessageBox, utilities, History, MessageToast, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("com.everis.suppliers.invoiceregister.controller.Dialog1", {
            setRouter: function (oRouter) {
                this.oRouter = oRouter;
            },
            _onAllCheckSelect: function (oEvent) {
                var bSelect = oEvent.getParameters().selected;
                var oCntCheckbox = this.byId("cntCheckbox");
                var aItems = oCntCheckbox.getItems();
                jQuery.each(aItems, function () {
                    this.setSelected(bSelect);
                });
            },
            _onButtonPress: function (oEvent) {
                var sDialog = "Dialog2";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialog];
                var oSource = oEvent.getSource();
                var oBindingContext = oSource.getBindingContext();
                var sPath = oBindingContext ? oBindingContext.getPath() : null;
                var oXmlview;
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(
                        function () {
                            oXmlview = sap.ui.xmlview({ viewName: "com.everis.suppliers.invoiceregister.view." + sDialog });
                            this.getView().addDependent(oXmlview);
                            oXmlview.getController().setRouter(this.oRouter);
                            oDialog = oXmlview.getContent()[0];
                            this.mDialogs[sDialog] = oDialog;
                        }.bind(this)
                    );
                }
                //this.onCloseDialog();
                return new Promise(
                    function (resolve) {
                        oDialog.attachEventOnce("afterOpen", null, resolve);
                        oDialog.open();
                        if (oXmlview) {
                            oDialog.attachAfterOpen(function () {
                                oDialog.rerender();
                            });
                        } else {
                            oXmlview = oDialog.getParent();
                        }
                        var _oModel = this.getView().getModel();
                        if (_oModel) {
                            oXmlview.setModel(_oModel);
                        }
                        if (sPath) {
                            var oBindingParameters = oXmlview.getController().getBindingParameters();
                            oXmlview.bindObject({ path: sPath, parameters: oBindingParameters });
                        }
                    }.bind(this)
                ).catch(function (oError) {
                    if (oError !== undefined) {
                        MessageBox.error(oError.message);
                    }
                });
            },
            onSelectionChange: function () {
                var oIntervalo = this.getView().byId("intervalo");
                var oDesde = this.getView().byId("desde");
                var oHasta = this.getView().byId("hasta");
                if (oIntervalo.getSelected()) {
                    oDesde.setEnabled(true);
                    oHasta.setEnabled(true);
                } else {
                    oDesde.setEnabled(false);
                    oHasta.setEnabled(false);
                }
            },
            onAccept: function (oEvent) {
                this.getView().byId("Cancel").setVisible(true);
                var aFilters = [];
                var oCntCheckbox = this.byId("cntCheckbox");
                var aItems = oCntCheckbox.getItems();
                jQuery.each(aItems, function () {
                    var bSelect = this.getSelected();
                    if (bSelect) {
                        aFilters.push(new Filter({ path: "ItCompanyId", operator: FilterOperator.EQ, value1: this.getName() }));
                    }
                });
                $._companyFilter = new Filter({ filters: aFilters, and: false });
                this.onDisplayFilter(oEvent);
            },
            onCancel: function (oEvent) {
                this.onDisplayFilter(oEvent);
            },
            onCloseDialog: function () {
                this.byId("Dialog1").close();
            },
            _onButtonPress1: function () {
                var oContent = this.getView().getContent()[0];
                return new Promise(function (resolve) {
                    oContent.attachEventOnce("afterClose", null, resolve);
                    oContent.close();
                });
            },
            onInit: function () {
                this._oDialog = this.getView().getContent()[0];
                var oContent = this._oDialog.getContent()[1];
                var aItems = oContent.getBindingInfo("items");
                aItems.filters = $._logonData;
                oContent.bindAggregation("items", aItems);
            },
            onExit: function () {
                this._oDialog.destroy();
            },
            onDisplayFilter: function (oEvent) {
                var sDialog = "Dialog2";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialog];
                var oSource = oEvent.getSource();
                var oBindingContext = oSource.getBindingContext();
                var sPath = oBindingContext ? oBindingContext.getPath() : null;
                var oXmlview;
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(
                        function () {
                            oXmlview = sap.ui.xmlview({ viewName: "com.everis.suppliers.invoiceregister.view." + sDialog });
                            this.getView().addDependent(oXmlview);
                            oXmlview.getController().setRouter(this.oRouter);
                            oDialog = oXmlview.getContent()[0];
                            this.mDialogs[sDialog] = oDialog;
                        }.bind(this)
                    );
                }
                this.onCloseDialog();
                return new Promise(
                    function (resolve) {
                        oDialog.attachEventOnce("afterOpen", null, resolve);
                        oDialog.open();
                        if (oXmlview) {
                            oDialog.attachAfterOpen(function () {
                                oDialog.rerender();
                            });
                        } else {
                            oXmlview = oDialog.getParent();
                        }
                        var _oModel = this.getView().getModel();
                        if (_oModel) {
                            oXmlview.setModel(_oModel);
                        }
                        if (sPath) {
                            var oBindingParameters = oXmlview.getController().getBindingParameters();
                            oXmlview.bindObject({ path: sPath, parameters: oBindingParameters });
                        }
                    }.bind(this)
                ).catch(function (oError) {
                    if (oError !== undefined) {
                        MessageBox.error(oError.message);
                    }
                });
            }
        });
    },
    true
);
