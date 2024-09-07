sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "./utilities",
        "sap/ui/core/routing/History",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    function (Controller, MessageBox, utilities, History, MessageToast, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("com.everis.suppliers.invoiceregister.controller.Dialog2", {
            setRouter: function (oRoute) {
                this.oRouter = oRoute;
            },
            getBindingParameters: function () {
                return {};
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
                    oDesde.setVisible(true);
                    oDesde.setValue("01/01/2018");
                    oHasta.setVisible(true);
                    var oDate = new Date();
                    var sDate = oDate.getDate();
                    var sMonth = oDate.getMonth() + 1;
                    var sYear = oDate.getFullYear();
                    sDate = sDate < 10 ? "0" + sDate : sDate;
                    sMonth = sMonth < 10 ? "0" + sMonth : sMonth;
                    oDate = sDate + "/" + sMonth + "/" + sYear;
                    oHasta.setValue(oDate);
                } else {
                    oDesde.setVisible(false);
                    oHasta.setVisible(false);
                }
            },
            onAccept: function () {
                this.getView().byId("Cancel").setVisible(true);
                var iSelectedIndex = this.getView()
                    .byId("sap_m_Dialog_0-content-sap_m_VBox-1517808956268-items-sap_m_RadioButtonGroup-1517808979426")
                    .getSelectedIndex();
                var sFHasta = new Date();
                var sFDesde;
                if (iSelectedIndex === 0) {
                    sFDesde = new Date(new Date() - 24 * 60 * 60 * 1e3 * 30);
                } else if (iSelectedIndex === 1) {
                    sFDesde = new Date(new Date() - 24 * 60 * 60 * 1e3 * 15);
                } else if (iSelectedIndex === 2) {
                    sFDesde = new Date(new Date() - 24 * 60 * 60 * 1e3 * 7);
                } else if (iSelectedIndex === 3) {
                    var sFHastaTemp = this._formatDate(
                        new Date(this.getView().byId("hasta").getDateValue()).toLocaleDateString()
                    );
                    var sFDesdeTemp = this._formatDate(
                        new Date(this.getView().byId("desde").getDateValue()).toLocaleDateString()
                    );
                    var sFLimitTemp = this._formatDate(new Date("Wed Dec 31 1969 19:00:00 GMT-0500 (-05)").toLocaleDateString());
                    if (sFHastaTemp === sFLimitTemp || sFDesdeTemp === sFLimitTemp) {
                        MessageToast.show("No se ha seleccionado un intervalo adecuado");
                        return;
                    } else {
                        sFHasta = this._formatDate(
                            new Date(this.getView().byId("hasta").getDateValue()).toLocaleDateString()
                        );
                        sFDesde = this._formatDate(
                            new Date(this.getView().byId("desde").getDateValue()).toLocaleDateString()
                        );
                    }
                    if (sFHasta < sFDesde) {
                        MessageToast.show("No se ha seleccionado un intervalo adecuado");
                        return;
                    }
                }
                var aFilter = [];
                aFilter.push(new Filter({ path: "ItRequestDate", operator: FilterOperator.BT, value1: sFDesde, value2: sFHasta }));
                $._dateFilter = new Filter({ filters: aFilter, and: false });
                
                var aFilter = [];
                aFilter.push($._companyFilter);
                aFilter.push($._dateFilter);
                aFilter.push($._logonData);
                $._Filter = new Filter({ filters: aFilter, and: true });
                
                var aFilter = [];
                aFilter.push($._Filter);
                var oParent = this.getView().getParent().getParent();
                var POHeaderTableItems = oParent.byId("POHeaderTable").getBinding("items");
                POHeaderTableItems.filter(aFilter);
                oParent.getContent()[0].setVisible(true);
                this.onCloseDialog();
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
            onCancel: function () {
                this.onCloseDialog();
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
            },
            onExit: function () {
                this._oDialog.destroy();
            },
            onCloseDialog: function () {
                this.byId("Dialog2").close();
            }
        });
    },
    true
);
