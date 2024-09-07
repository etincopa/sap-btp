sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"],
    function (Controller, MessageBox, utilities, History) {
        "use strict";
        return Controller.extend("com.everis.suppliers.invoiceregister.controller.Popover4", {
            setRouter: function (oRoute) {
                this.oRouter = oRoute;
            },
            getBindingParameters: function () {
                return {};
            },
            handleRadioButtonGroupsSelectedIndex: function () {
                var that = this;
                this.aRadioButtonGroupIds.forEach(function (e) {
                    var oRadioButtonGroups = that.byId(e);
                    var oBindingButton = oRadioButtonGroups ? oRadioButtonGroups.getBinding("buttons") : undefined;
                    if (oBindingButton) {
                        var oBindingIndex = oRadioButtonGroups.getBinding("selectedIndex");
                        var iIndexSelected = oRadioButtonGroups.getSelectedIndex();
                        oBindingButton.attachEventOnce("change", function () {
                            if (oBindingIndex) {
                                oBindingIndex.refresh(true);
                            } else {
                                oRadioButtonGroups.setSelectedIndex(iIndexSelected);
                            }
                        });
                    }
                });
            },
            convertTextToIndexFormatter: function (sIndex) {
                var oPopover = this.byId("sap_m_Popover_0-content-sap_m_RadioButtonGroup-1516985199825");
                var oBindingInfo = oPopover.getBindingInfo("buttons");
                if (oBindingInfo && oBindingInfo.binding) {
                    var oBindingPath = oBindingInfo.template.getBindingPath("text");
                    return oBindingInfo.binding.getContexts(oBindingInfo.startIndex, oBindingInfo.length).findIndex(function (e) {
                        return e.getProperty(oBindingPath) === sIndex;
                    });
                } else {
                    return oPopover.getButtons().findIndex(function (e) {
                        return e.getText() === sIndex;
                    });
                }
            },
            _onRadioButtonGroupSelect: function () {},
            onInit: function () {
                this._oDialog = this.getView().getContent()[0];
            },
            onExit: function () {
                this._oDialog.destroy();
            },
        });
    },
    true
);
