sap.ui.define(["sap/ui/model/Filter", "Hayduk/InformeDeFlota/model/Util"], function(Filter, Util) {
    "use strict";
    return {
        onPressColas: function(oEvent) {
            this.cola.readColaInfo(oEvent, true, this);
        },

        onRefreshCola: function(oEvent) {
            this.cola.readColaInfo(oEvent, false, this);
        },

        onExecOperation: function(oEvent) {
            var that = this;
            var itemOper = this._byId("tblColaOper").getSelectedItem();

            if (!itemOper) {
                sap.m.MessageBox.confirm("¿Desea ejecutar todas las operaciones en cola?", {
                    title: "Ejecutar Operaciones",
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            Util.excecuteOperations(that);
                        }
                    }
                });
            } else {
                var oOper = itemOper.getBindingContext("ColaOperSet").getObject();

                sap.m.MessageBox.confirm("¿Desea ejecutar la operación: " + oOper.Id + "?", {
                    title: "Ejecutar Operación",
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            // To avoid multiple clicking at save
                            const oSaveButton = that._byId("btnSaveInforme");
                            oSaveButton.setEnabled(false);

                            that.sendInformeData("/InformeFlotaDeepSet", JSON.parse(oOper.Data), true, oOper.Id, that);
                        }
                    }
                });
            }
        },

        onDeleteOperation: function(oEvent) {
            var that = this;
            var itemOper = this._byId("tblColaOper").getSelectedItem();
            if (!itemOper) {
                sap.m.MessageBox.warning("Seleccione una operación");
            } else {
                var oOper = itemOper.getBindingContext("ColaOperSet").getObject();

                sap.m.MessageBox.confirm("¿Desea eliminar la operación: " + oOper.Id + "?", {
                    title: "Eliminar Operación",
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            Util.deleteOperacion(oOper.Id, true, that);
                        }
                    }
                });
            }
        },

        readColaInfo: function(oEvent, bShowDialog, that) {
            var indexedDB = Util.getIndexDB();
            var oColaModel = that.getJsonModel("ColaOperSet");
            var aColasAux = {
                results: []
            };

            function showColaDialog() {
                if (bShowDialog) {
                    if (!that._colaOperDialog) {
                        that._colaOperDialog = sap.ui.xmlfragment(
                            "Hayduk.InformeDeFlota.view.fragments.dialogs.ColaOper",
                            that
                        );
                        that.getView().addDependent(that._colaOperDialog);
                    }

                    that._colaOperDialog.open();
                }
            }

            if (indexedDB) {
                var open = indexedDB.open("dbInformeFlota", 1);

                open.onsuccess = function() {
                    // Start a new transaction
                    var db = open.result;
                    var tx = db.transaction("ColaOperaciones", "readonly");
                    var store = tx.objectStore("ColaOperaciones");

                    // Query the data
                    var getOperaciones = store.getAll();

                    getOperaciones.onsuccess = function() {
                        if (getOperaciones.result.length) {
                            var aOperaciones = getOperaciones.result;
                            for (var i = 0; aOperaciones.length > i; i++) {
                                var oReturn = Util.getDateTime(aOperaciones[i].datetime);
                                var nVolumen = (aOperaciones[i].content.length * 2) / 1024 / 1024;

                                aColasAux.results.push({
                                    Id: aOperaciones[i].name,
                                    Date: oReturn.date,
                                    Time: oReturn.time,
                                    Volumen: nVolumen.toFixed(5),
                                    Data: aOperaciones[i].content
                                });
                            }
                            oColaModel.setData(aColasAux);
                            oColaModel.refresh(true);

                            showColaDialog();
                        } else {
                            if (bShowDialog) {
                                showColaDialog();
                            } else {
                                oColaModel.setData({
                                    results: []
                                });
                                oColaModel.refresh(true);
                            }
                        }
                    };

                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                };
            }
        },

        onCloseColaOper: function(oEvent) {
            this._colaOperDialog.close();
        },

        showNumCola: function(that) {
            var indexedDB = Util.getIndexDB();

            if (indexedDB) {
                var open = indexedDB.open("dbInformeFlota", 1);

                open.onsuccess = function() {
                    // Start a new transaction
                    var db = open.result;
                    var tx = db.transaction("ColaOperaciones", "readonly");
                    var store = tx.objectStore("ColaOperaciones");

                    // Query the data
                    var getOperaciones = store.getAll();

                    getOperaciones.onsuccess = function() {
                        if (getOperaciones.result.length) {
                            that.getJsonModel("Indicadores").setProperty("/NumCola", getOperaciones.result.length);
                            that._byId("btnColaOper").setType(sap.m.ButtonType.Accept);
                        } else {
                            that._byId("btnColaOper").setType(sap.m.ButtonType.Transparent);
                            that.getJsonModel("Indicadores").setProperty("/NumCola", 0);
                        }
                    };

                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                };
            }
        },

        showPopOver: function(oEvent) {
            var iTime = parseInt(Util.readLocalStorage("TimeInterval"), 0);
            if (isNaN(iTime)) {
                iTime = this.TIME_INTERVAL;
            }

            var sState = Util.readLocalStorage("EnvioAutom");

            if (!this._oColaPopover) {
                this._oColaPopover = sap.ui.xmlfragment(
                    "Hayduk.InformeDeFlota.view.fragments.dialogs.ColaPopOver",
                    this
                );

                this.getView().addDependent(this._oColaPopover);
            }
            this._byId("inpTimeInterval").setValue(iTime / 60000);

            if (sState && sState === "X") {
                this._byId("swEnvioAutom").setState(true);
                this._byId("inpTimeInterval").setEnabled(true);
            } else {
                this._byId("inpTimeInterval").setEnabled(false);
                this._byId("swEnvioAutom").setState(false);
            }

            this._oColaPopover.openBy(oEvent.getSource());
        },

        closePopOver: function(oEvent) {
            this._oColaPopover.close();
        },

        enableTime: function(oEvent) {
            var bState = oEvent.getParameter("state");
            this._byId("inpTimeInterval").setEnabled(bState);

            if (!bState) {
                this._byId("inpTimeInterval").setValue("");
            }
        },

        changeEnvio: function() {
            var that = this;
            var bState = this._byId("swEnvioAutom").getState();
            var iTime = this._byId("inpTimeInterval").getValue();
            if (bState) {
                this.intervalSend = setInterval(function() {
                    Util.excecuteOperations(that);
                }, iTime * 60000);

                if (iTime < 1) {
                    iTime = 1;
                }

                Util.saveLocalStorage("TimeInterval", String(iTime * 60000));
                Util.saveLocalStorage("EnvioAutom", "X");
                sap.m.MessageToast.show("Envío automático cada " + iTime + " min. activo");
            } else {
                if (this.intervalSend) {
                    Util.saveLocalStorage("EnvioAutom", "");
                    clearInterval(this.intervalSend);
                    sap.m.MessageToast.show("Envío automático desactivado");
                }
            }
            this._oColaPopover.close();
        }
    };
});
