/* global XLSX:true */
sap.ui.define(
    [
        "sap/ui/model/Filter",
        "Hayduk/InformeDeFlota/model/Util",
        "sap/m/DatePicker",
        "sap/m/Text",
        "sap/m/TimePicker",
        "sap/m/Input",
        "sap/m/ColumnListItem",
        "sap/m/Column",
        "Hayduk/InformeDeFlota/controller/Especie",
        "sap/ui/model/json/JSONModel",
        "Hayduk/InformeDeFlota/js/xlsxfull",
    ],
    function (Filter, Util, DatePicker, Text, TimePicker, Input, ColumnListItem, Column, Especie, JSONModel, xlsxfull) {
        "use strict";

        var jureMel = [];

        return {
            buildTemplates: function (metadata, that) {
                var aConfigPlantilla1 = [],
                    aConfigPlantilla2 = [],
                    aConfigPlantilla3 = [];
                that.oCalas = {};
                that.oCalas1 = {};
                that.oCalas2 = {};
                that.oCalas3 = {};
                var aCalas = metadata.dataServices.schema[0].entityType[17].property;

                //Agrego las extensiones faltantes
                var oModelAddExtensions = that.getOwnerComponent().getModel("addExtensions");
                var oDataAddExtensions = JSON.parse(oModelAddExtensions.getJSON());

                for (var i = 0; i < aCalas.length; i++) {
                    that.oCalas[aCalas[i].name] = "";

                    var aExtensions = aCalas[i].extensions;

                    //Seteo nuevas extensiones para los nuevos campos creados
                    switch (i) {
                        case 17:
                            aCalas[i].extensions = oDataAddExtensions.Bod4_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Bod4_Extens.concat(aExtensions);
                            break;
                        case 18:
                            aCalas[i].extensions = oDataAddExtensions.Bod5_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Bod5_Extens.concat(aExtensions);
                            break;
                        case 19:
                            aCalas[i].extensions = oDataAddExtensions.Bod6_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Bod6_Extens.concat(aExtensions);
                            break;
                        case 20:
                            aCalas[i].extensions = oDataAddExtensions.Bod7_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Bod7_Extens.concat(aExtensions);
                            break;
                        case 21:
                            aCalas[i].extensions = oDataAddExtensions.Bod8_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Bod8_Extens.concat(aExtensions);
                            break;
                        case 50:
                            aCalas[i].extensions = oDataAddExtensions.FecSal_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.FecSal_Extens.concat(aExtensions);
                            break;
                        case 51:
                            aCalas[i].extensions = oDataAddExtensions.HorSal_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.HorSal_Extens.concat(aExtensions);
                            break;
                        case 52:
                            aCalas[i].extensions = oDataAddExtensions.Fondo_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Fondo_Extens.concat(aExtensions);
                            break;
                        case 53:
                            aCalas[i].extensions = oDataAddExtensions.Juven_anch_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Juven_anch_Extens.concat(aExtensions);
                            break;
                        case 54:
                            aCalas[i].extensions = oDataAddExtensions.Juven_jure_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Juven_jure_Extens.concat(aExtensions);
                            break;
                        case 55:
                            aCalas[i].extensions = oDataAddExtensions.Juven_jure_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Juven_jure_Extens.concat(aExtensions);
                            break;
                        case 56:
                            aCalas[i].extensions = oDataAddExtensions.Juven_jure_Extens.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.Juven_jure_Extens.concat(aExtensions);
                            break;
                        // case 56:
                        //  aCalas[i].extensions = oDataAddExtensions.Juven_jure_Extens.concat(aCalas[i].extensions);
                        //  aExtensions = oDataAddExtensions.Juven_jure_Extens.concat(aExtensions);
                        //  break;
                        case 57:
                            aCalas[i].extensions = oDataAddExtensions.FecHorIniTxt.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.FecHorIniTxt.concat(aExtensions);
                            break;
                        case 58:
                            aCalas[i].extensions = oDataAddExtensions.FecHorFinTxt.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.FecHorFinTxt.concat(aExtensions);
                            break;
                        case 59:
                            aCalas[i].extensions = oDataAddExtensions.FecHorSalTxt.concat(aCalas[i].extensions);
                            aExtensions = oDataAddExtensions.FecHorSalTxt.concat(aExtensions);
                            break;
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////////////7777

                    if (
                        aCalas[i].name == "Juven_Anch" ||
                        aCalas[i].name == "Juven_Caba" ||
                        aCalas[i].name == "Juven_Jure"
                    ) {
                        aExtensions[1].value = "";
                    }

                    var oItem = {
                        propertyName: aCalas[i].name,
                        text: aExtensions[13].value, //Label
                        control: aExtensions[0].value,
                        tipo: aExtensions[9].value,
                        visible: aExtensions[10].value,
                        editable: aExtensions[1].value,
                        excel: aExtensions[2].value,
                        width: aExtensions[11].value.toLowerCase(),
                        maxLength: aCalas[i].maxLength,
                        posicion1: parseInt(aExtensions[6].value, 0),
                        posicion2: parseInt(aExtensions[7].value, 0),
                        posicion3: parseInt(aExtensions[8].value, 0),
                    };

                    if (aCalas[i].name === "Tbode") {
                        oItem.footerVisible = true;
                    } else {
                        oItem.footerVisible = false;
                    }

                    aConfigPlantilla1.push(oItem);
                    aConfigPlantilla2.push(oItem);
                    aConfigPlantilla3.push(oItem);
                }

                Util.sortObjectArray(aConfigPlantilla1, "posicion1");
                Util.sortObjectArray(aConfigPlantilla2, "posicion2");
                Util.sortObjectArray(aConfigPlantilla3, "posicion3");

                that.setJsonModel(aConfigPlantilla1, "CalasPlantilla1", false);
                that.setJsonModel(aConfigPlantilla2, "CalasPlantilla2", false);
                that.setJsonModel(aConfigPlantilla3, "CalasPlantilla3", false);

                //Plantilla 1
                var ColsPlantilla1 = [],
                    aCellsView = [],
                    aCellsEdit = [];
                for (i = 0; aConfigPlantilla1.length > i; i++) {
                    //Columnas
                    if (aConfigPlantilla1[i].posicion1) {
                        ColsPlantilla1.push(aConfigPlantilla1[i]);
                        that.oCalas1[aConfigPlantilla1[i].propertyName] = "";

                        // if (aConfigPlantilla1[i].propertyName == "Efici") {
                        //     aConfigPlantilla1[i].propertyName = "Juven_Anch";
                        //     aConfigPlantilla1[i].control = "1";
                        //     aConfigPlantilla1[i].editable = "";
                        // }

                        aCellsView.push(
                            new Text({
                                text: "{CalasSet>" + aConfigPlantilla1[i].propertyName + "}",
                            })
                        );

                        //this.buildItems(aConfigPlantilla1[i], aCellsEdit, that, 1);
                    }
                }

                that.setJsonModel(ColsPlantilla1, "CalasPlantilla1", false);
                that.oColsCalaPlantilla1 = new Column({
                    header: [
                        new Text({
                            text: "{CalasPlantilla1>text}",
                        }),
                    ],
                    width: "{CalasPlantilla1>width}",
                    footer: [
                        new Text("txtSumTBode", {
                            text: "",
                            visible: "{CalasPlantilla1>footerVisible}",
                        }),
                    ],
                });

                that.oViewCalasPlantilla1 = new ColumnListItem({
                    cells: aCellsView,
                });

                that.oEditCalasPlantilla1 = new ColumnListItem({
                    cells: aCellsEdit,
                });

                //Plantilla 2
                var ColsPlantilla2 = [];
                aCellsView = [];
                aCellsEdit = [];
                for (i = 0; aConfigPlantilla2.length > i; i++) {
                    //Columnas
                    if (aConfigPlantilla2[i].posicion2) {
                        ColsPlantilla2.push(aConfigPlantilla2[i]);
                        that.oCalas2[aConfigPlantilla2[i].propertyName] = "";
                        aCellsView.push(
                            new Text({
                                text: "{CalasSet>" + aConfigPlantilla2[i].propertyName + "}",
                            })
                        );

                        this.buildItems(aConfigPlantilla2[i], aCellsEdit, that, 2);
                    }
                }

                that.setJsonModel(ColsPlantilla2, "CalasPlantilla2", false);
                that.oColsCalaPlantilla2 = new Column({
                    header: [
                        new Text({
                            text: "{CalasPlantilla2>text}",
                        }),
                    ],
                    width: "{CalasPlantilla2>width}",
                });

                that.oViewCalasPlantilla2 = new ColumnListItem({
                    cells: aCellsView,
                });

                that.oEditCalasPlantilla2 = new ColumnListItem({
                    cells: aCellsEdit,
                });

                //Plantilla 3
                var ColsPlantilla3 = [];
                aCellsView = [];
                aCellsEdit = [];
                for (i = 0; aConfigPlantilla3.length > i; i++) {
                    //Columnas
                    if (aConfigPlantilla3[i].posicion3) {
                        ColsPlantilla3.push(aConfigPlantilla3[i]);
                        that.oCalas3[aConfigPlantilla3[i].propertyName] = "";
                        aCellsView.push(
                            new Text({
                                text: "{CalasSet>" + aConfigPlantilla3[i].propertyName + "}",
                            })
                        );

                        this.buildItems(aConfigPlantilla3[i], aCellsEdit, that, 3);
                    }
                }

                that.setJsonModel(ColsPlantilla3, "CalasPlantilla3", false);
                that.oColsCalaPlantilla3 = new Column({
                    header: [
                        new Text({
                            text: "{CalasPlantilla3>text}",
                        }),
                    ],
                    width: "{CalasPlantilla3>width}",
                });

                that.oViewCalasPlantilla3 = new ColumnListItem({
                    cells: aCellsView,
                });

                that.oEditCalasPlantilla3 = new ColumnListItem({
                    cells: aCellsEdit,
                });
            },

            buildItems: function (aConfigPlantilla, aCellsEdit, that, iPlantilla) {
                var oInput;

                function eventoBodega(oEvent) {
                    Util.onlyNumeric(oEvent);
                    var aAriaLabeled = oEvent.getSource().getAriaLabelledBy();
                    var oTBode,
                        fSuma = 0.0;

                    // if (that.getJsonModel("CalasPlantilla1").getData().length == 26) {
                    var valor1 = oEvent.getSource().getValue(),
                        valor2 = that._byId(aAriaLabeled[0]).getValue(),
                        valor3 = that._byId(aAriaLabeled[1]).getValue(),
                        valor4 = that._byId(aAriaLabeled[2]).getValue(),
                        valor5 = that._byId(aAriaLabeled[3]).getValue(),
                        valor6 = that._byId(aAriaLabeled[4]).getValue(),
                        valor7 = that._byId(aAriaLabeled[5]).getValue(),
                        valor8 = that._byId(aAriaLabeled[6]).getValue();

                    if (!isNaN(parseFloat(valor1))) {
                        fSuma += parseFloat(valor1);
                    }

                    if (!isNaN(parseFloat(valor2))) {
                        fSuma += parseFloat(valor2);
                    }

                    if (!isNaN(parseFloat(valor3))) {
                        fSuma += parseFloat(valor3);
                    }
                    if (!isNaN(parseFloat(valor4))) {
                        fSuma += parseFloat(valor4);
                    }
                    if (!isNaN(parseFloat(valor5))) {
                        fSuma += parseFloat(valor5);
                    }
                    if (!isNaN(parseFloat(valor6))) {
                        fSuma += parseFloat(valor6);
                    }
                    if (!isNaN(parseFloat(valor7))) {
                        fSuma += parseFloat(valor7);
                    }
                    if (!isNaN(parseFloat(valor8))) {
                        fSuma += parseFloat(valor8);
                    }

                    oTBode = that._byId(aAriaLabeled[7]);

                    // } else {
                    //  var valor1 = oEvent.getSource().getValue(),
                    //      valor2 = that._byId(aAriaLabeled[0]).getValue(),
                    //      valor3 = that._byId(aAriaLabeled[1]).getValue();

                    //  if (!isNaN(parseFloat(valor1))) {
                    //      fSuma += parseFloat(valor1);
                    //  }

                    //  if (!isNaN(parseFloat(valor2))) {
                    //      fSuma += parseFloat(valor2);
                    //  }

                    //  if (!isNaN(parseFloat(valor3))) {
                    //      fSuma += parseFloat(valor3);
                    //  }
                    //   oTBode = that._byId(aAriaLabeled[7]);
                    // }
                    var oColItem = oTBode.getParent();
                    oTBode.setText(fSuma);

                    var aItems = that._byId("tblCalas").getBinding("items").oList;
                    var iIndex = oColItem.indexOfCell(oTBode);
                    var oColumn = that._byId("tblCalas").getColumns()[iIndex];

                    var fSumTotal = 0;
                    for (var i = 0; aItems.length > i; i++) {
                        var fSubSum = parseFloat(aItems[i].Tbode);
                        if (!isNaN(fSubSum)) {
                            fSumTotal += fSubSum;
                        }
                    }

                    oColumn.getFooter().setText(fSumTotal);

                    that.calas._totalColumnasCalas(aItems, oEvent, that);
                }

                function getZonaPescaLatGra(oEvent) {
                    Util.onlyInteger(oEvent);
                    var aZonaPesca = that.getJsonModel("ZonaPescaSet").getData().d.results,
                        aAriaLabeled = oEvent.getSource().getAriaLabelledBy(),
                        sLatGrados = oEvent.getSource().getValue(),
                        sLatMin = that._byId(aAriaLabeled[0]).getValue(),
                        sCoorndenada = "";

                    if (sLatGrados.length < 2) {
                        sCoorndenada += "0" + sLatGrados;
                    } else if (sLatGrados.length === 0) {
                        sCoorndenada += "00";
                    } else {
                        sCoorndenada += sLatGrados;
                    }

                    if (sLatMin.length < 2) {
                        sCoorndenada += "0" + sLatMin;
                    } else if (sLatMin.length === 0) {
                        sCoorndenada += "00";
                    } else {
                        sCoorndenada += sLatMin;
                    }

                    for (var i = 0; aZonaPesca.length > i; i++) {
                        if (aZonaPesca[i].Latmin <= sCoorndenada && sCoorndenada <= aZonaPesca[i].Latmax) {
                            that._byId(aAriaLabeled[1]).setText(aZonaPesca[i].Zonpes);
                            that._byId(aAriaLabeled[2]).setText(aZonaPesca[i].Zonafao); //+OOV
                            break;
                        }
                    }
                }

                function getZonaPescaLatMin(oEvent) {
                    Util.onlyInteger(oEvent);
                    var aZonaPesca = that.getJsonModel("ZonaPescaSet").getData().d.results,
                        aAriaLabeled = oEvent.getSource().getAriaLabelledBy(),
                        sLatMin = oEvent.getSource().getValue(),
                        sLatGrados = that._byId(aAriaLabeled[0]).getValue(),
                        sCoorndenada = "";

                    if (sLatGrados.length < 2) {
                        sCoorndenada += "0" + sLatGrados;
                    } else if (sLatGrados.length === 0) {
                        sCoorndenada += "00";
                    } else {
                        sCoorndenada += sLatGrados;
                    }

                    if (sLatMin.length < 2) {
                        sCoorndenada += "0" + sLatMin;
                    } else if (sLatMin.length === 0) {
                        sCoorndenada += "00";
                    } else {
                        sCoorndenada += sLatMin;
                    }

                    for (var i = 0; aZonaPesca.length > i; i++) {
                        if (String(aZonaPesca[i].Latmin) <= sCoorndenada && sCoorndenada <= aZonaPesca[i].Latmax) {
                            that._byId(aAriaLabeled[1]).setText(aZonaPesca[i].Zonpes);
                            that._byId(aAriaLabeled[2]).setText(aZonaPesca[i].Zonafao); //+OOV
                            break;
                        }
                    }
                }

                switch (aConfigPlantilla.control) {
                    //Text
                    case "1":
                        if (aConfigPlantilla.propertyName === "Tbode") {
                            aCellsEdit.push(
                                new Text({
                                    id: "txtBodtotal" + iPlantilla,
                                    text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                })
                            );
                        } else if (aConfigPlantilla.propertyName === "Zonpes") {
                            var txtJZonpes = "txtZonpes" + iPlantilla;
                            var zonpesFilter = aCellsEdit.filter((x) => x.sId.includes(txtJZonpes));
                            if (zonpesFilter.length === 0) {
                                aCellsEdit.push(
                                    new Text({
                                        id: "txtZonpes" + iPlantilla,
                                        text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    })
                                );
                            }
                        } //+OOV
                        else if (aConfigPlantilla.propertyName === "Zonafao") {
                            aCellsEdit.push(
                                new Text({
                                    id: "txtZonafao" + iPlantilla,
                                    text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                })
                            );
                        } else if (aConfigPlantilla.propertyName === "Juven_Anch") {
                            var txtJuvRep = "txtJuvenAnch" + iPlantilla;
                            var juvFilter = aCellsEdit.filter((x) => x.sId.includes(txtJuvRep));
                            if (juvFilter.length === 0) {
                                aCellsEdit.push(
                                    new Text({
                                        id: "txtJuvenAnch" + iPlantilla,
                                        text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    })
                                );
                            }
                        } else if (aConfigPlantilla.propertyName === "Juven_Caba") {
                            aCellsEdit.push(
                                new Text({
                                    id: "txtJuvenCaba" + iPlantilla,
                                    text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                })
                            );
                        } else if (aConfigPlantilla.propertyName === "Juven_Jure") {
                            aCellsEdit.push(
                                new Text({
                                    id: "txtJuvenJure" + iPlantilla,
                                    text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                })
                            );
                        } else {
                            aCellsEdit.push(
                                new Text({
                                    text: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                })
                            );
                        }

                        break;
                    //Input
                    case "2":
                        switch (aConfigPlantilla.propertyName) {
                            case "FecHorIniTxt":
                                oInput = new Input({
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    placeholder: "dd/mm/aaaa hh:mm:ss",
                                    submit: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                    change: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                });
                                oInput.setMaxLength(19);
                                break;
                            case "FecHorFinTxt":
                                oInput = new Input({
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    placeholder: "dd/mm/aaaa hh:mm:ss",
                                    submit: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                    change: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                });
                                oInput.setMaxLength(19);
                                break;
                            case "FecHorSalTxt":
                                oInput = new Input({
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    placeholder: "dd/mm/aaaa hh:mm:ss",
                                    submit: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                    change: function (oEvent) {
                                        that.calas.setFormaterDate(oEvent);
                                    },
                                });
                                oInput.setMaxLength(19);
                                break;
                            case "Proa":
                                oInput = new Input({
                                    id: "inpBodproa" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Tunel":
                                try {
                                    that._byId("inpBodtunel").destroy();
                                } catch (oError) {}
                                oInput = new Input({
                                    id: "inpBodtunel" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Popa":
                                try {
                                    that._byId("inpBodpopa").destroy();
                                } catch (oError) {}
                                oInput = new Input({
                                    id: "inpBodpopa" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Bod04":
                                oInput = new Input({
                                    id: "inpBod4" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;

                            case "Bod05":
                                oInput = new Input({
                                    id: "inpBod5" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Bod06":
                                oInput = new Input({
                                    id: "inpBod6" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Bod07":
                                oInput = new Input({
                                    id: "inpBod7" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod8" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Bod08":
                                oInput = new Input({
                                    id: "inpBod8" + iPlantilla,
                                    ariaLabelledBy: [
                                        "inpBodtunel" + iPlantilla,
                                        "inpBodproa" + iPlantilla,
                                        "inpBodpopa" + iPlantilla,
                                        "inpBod4" + iPlantilla,
                                        "inpBod5" + iPlantilla,
                                        "inpBod6" + iPlantilla,
                                        "inpBod7" + iPlantilla,
                                        "txtBodtotal" + iPlantilla,
                                    ],
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        eventoBodega(oEvent);
                                        that.calas.calculateCompEspecie(that);
                                    },
                                });
                                break;
                            case "Latgra":
                                oInput = new Input({
                                    id: "inpLatgra" + iPlantilla,
                                    //ariaLabelledBy: ["inpLatmin" + iPlantilla, "txtZonpes" + iPlantilla], //-OOV
                                    ariaLabelledBy: [
                                        "inpLatmin" + iPlantilla,
                                        "txtZonpes" + iPlantilla,
                                        "txtZonafao" + iPlantilla,
                                    ], //+OOV
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        getZonaPescaLatGra(oEvent);
                                    },
                                });

                                break;

                            case "Latmin":
                                oInput = new Input({
                                    id: "inpLatmin" + iPlantilla,
                                    //ariaLabelledBy: ["inpLatgra" + iPlantilla, "txtZonpes" + iPlantilla], //-OOV
                                    ariaLabelledBy: [
                                        "inpLatgra" + iPlantilla,
                                        "txtZonpes" + iPlantilla,
                                        "txtZonafao" + iPlantilla,
                                    ], //+OOV
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        getZonaPescaLatMin(oEvent);
                                    },
                                });

                                break;
                            case "Fondo":
                                oInput = new Input({
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                    liveChange: function (oEvent) {
                                        //  Util.onlyNumeric(oEvent);
                                        Util.onlyNumericDecimal(oEvent, 3, 2);
                                    },
                                });
                                break;
                            default:
                                oInput = new Input({
                                    value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                });
                                switch (aConfigPlantilla.tipo) {
                                    case "1":
                                        oInput.attachLiveChange(function (oEvent) {
                                            Util.onlyInteger(oEvent);
                                        });
                                        break;
                                    case "2":
                                        oInput.attachLiveChange(function (oEvent) {
                                            Util.onlyNumeric(oEvent);
                                        });
                                        break;
                                }
                        }
                        if (aConfigPlantilla.maxLength) {
                            oInput.setMaxLength(parseInt(aConfigPlantilla.maxLength, 0));
                        }

                        aCellsEdit.push(oInput);
                        break;
                    //DatePicker
                    case "3":
                        aCellsEdit.push(
                            new DatePicker({
                                value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                //value: "{CalasSet>" + aConfigPlantilla.propertyName + ", type:'sap.ui.model.type.Date', formatOptions: { style: 'short', strictParsing: true}}",
                                valueFormat: "yyyy-MM-dd",
                                displayFormat: "short",
                            })
                        );
                        break;
                    //TimePicker
                    case "4":
                        aCellsEdit.push(
                            new TimePicker({
                                value: "{CalasSet>" + aConfigPlantilla.propertyName + "}",
                                //value: "{CalasSet>" + aConfigPlantilla.propertyName + ", type:'sap.ui.model.type.Time', formatOptions: { controlId: 'timeCtrl'}}",
                                valueFormat: "HH:mm:ss",
                            })
                        );
                        break;
                }
            },

            bindColumns: function (sPath, oPlantilla, that) {
                that._byId("tblCalas").bindAggregation("columns", {
                    path: sPath,
                    template: oPlantilla,
                });
            },

            addCala: function (oEvent) {
                var sTipoRed = this.getJsonModel("InformeFlota").getProperty("/TipoRed");
                var oCalasModel = this._byId("tblCalas").getModel("CalasSet");
                var aCalas = oCalasModel.getData();
                var oCalas = Util.cloneObject(this.oCalas);

                if (!sTipoRed.length) {
                    sap.m.MessageBox.error("Debe seleccionar un tipo de red", {
                        title: "Agregar nueva cala",
                    });
                    return false;
                }

                if (aCalas.d.results.length > 0 && !this.numeroCala) {
                    this.numeroCala = parseInt(aCalas.d.results[aCalas.d.results.length - 1].Numcala, 0);
                }

                this.numeroCala = this.numeroCala + 1;
                if (isNaN(parseInt(this.numeroCala, 0))) {
                    oCalas.Numcala = 1;
                } else {
                    oCalas.Numcala = this.numeroCala;
                }

                if (!this.getJsonModel("InformeFlota")) {
                    oCalas.Numinf = "";
                } else {
                    oCalas.Numinf = this.getJsonModel("InformeFlota").getProperty("/Numero");
                }

                oCalas.Numcala = Util.paddZeroes(oCalas.Numcala, 3);

                aCalas.d.results.push(oCalas);
                oCalasModel.refresh(true);
                console.log(oCalasModel);
            },

            onDeleteCala: function (oEvent) {
                var itemCalas = this._byId("tblCalas").getSelectedItem();
                if (!itemCalas) {
                    return sap.m.MessageBox.warning("Seleccione una cala");
                }
                var oTabla = this._byId("tblCalas");
                var oModel = oTabla.getModel("CalasSet");
                var aData = oModel.getData().d.results;
                var that = this;
                var selection = oTabla._aSelectedPaths[0].split("/")[3];
                var calas = this.getView().getModel("calasPost").getData();
                var oCala = itemCalas.getBindingContext("CalasSet").getObject();
                var nIndex = oTabla.indexOfItem(itemCalas);
                sap.m.MessageBox.confirm("¿Desea eliminar la cala número:" + oCala.Numcala + " ?", {
                    title: "Eliminar Cala",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            //elimina la muestreo de la cala
                            var sNumcala = aData[nIndex].Numcala;
                            that.calas.deleteInternoCala(sNumcala, "MuestreoCalaSet", that);
                            //elimina los registros del detalle de muestreo x cala
                            that.calas.deleteInternoCala(sNumcala, "LongCalasSet", that);
                            //elimina detalle de tallas de los muestreos
                            that.calas.deleteInternoCala(sNumcala, "aTallas", that);
                            //elimina la cala
                            aData[nIndex].Numcala;
                            aData.splice(nIndex, 1);
                            calas.splice(selection, 1);

                            var oModel2 = new JSONModel(calas);
                            that.getView().setModel(oModel2, "calasPost");

                            for (var i = 0; aData.length > i; i++) {
                                aData[i].Numcala = Util.paddZeroes(i + 1, 3);
                            }
                            that.numeroCala = undefined;

                            oModel.refresh(true);
                            oTabla.removeSelections(true);
                            sap.m.MessageToast.show("Cala eliminada correctamente");
                        }
                    },
                });
            },
            //Elimina los valores asociados a una cala ya sea el muestreo o el detalla del muestreo en ese caso la talla
            deleteInternoCala: function (sNumcala, Modelo, that) {
                // como no existe el modelo aTallas coge de that.aTallas
                if (Modelo == "aTallas") {
                    var aDataInternoCala = that.aTallas;
                } else {
                    aDataInternoCala = that.getJsonModel(Modelo).getData().d.results;
                }

                var aIndex = [];
                for (var i in aDataInternoCala) {
                    if (aDataInternoCala[i].Numcala === sNumcala) {
                        aIndex.push(i);
                    }
                }

                var nLengthIndex = aIndex.length - 1;

                for (var j = nLengthIndex; j >= 0; j--) {
                    aDataInternoCala.splice(aIndex[j], 1);
                }
            },
            onRefreshCalas: function (oEvent) {
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                if (nNumero.length) {
                    this.buildTallaReady = false;
                    this.aTallas = undefined;
                    Util.readInformeEntity("Calas", "?$filter=Numinf eq '" + nNumero + "'", false, this);
                    Util.readInformeEntity("MuestreoCala", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
                    Util.readInformeEntity("LongCalas", "?$filter=Numinforme eq '" + nNumero + "'", false, this);
                }
            },

            onXLSCalas: function (oEvent) {
                jQuery.sap.require("sap.ui.export.Spreadsheet");
                var sTipoRed = this.getJsonModel("InformeFlota").getProperty("/TipoRed");
                var aConfig = [];
                var aXLSCols = [];

                if (sTipoRed === "03") {
                    //Plantilla Calas 2
                    aConfig = this.getJsonModel("CalasPlantilla2").getData();
                } else if (sTipoRed === "04") {
                    //Plantilla Calas 3
                    aConfig = this.getJsonModel("CalasPlantilla3").getData();
                } else {
                    //Plantilla Calas 1
                    aConfig = this.getJsonModel("CalasPlantilla1").getData();
                }

                for (var i = 0; aConfig.length > i; i++) {
                    if (aConfig[i].excel === "X") {
                        aXLSCols.push({
                            label: aConfig[i].text,
                            property: aConfig[i].propertyName,
                        });
                    }
                }

                var oRowBinding = this._byId("tblCalas").getBinding("items");
                var date = new Date();
                var sDate = date.getMonth() + 1 + "-" + date.getFullYear();
                var FileName = sDate + "-" + "Calas" + ".xlsx";

                var oSettings = {
                    workbook: {
                        columns: aXLSCols,
                    },
                    fileName: FileName,
                    dataSource: oRowBinding.oList,
                    worker: false,
                };

                if (oRowBinding.oList.length > 0) {
                    new sap.ui.export.Spreadsheet(oSettings).build();
                } else {
                    sap.m.MessageBox.warning("No hay datos para descargar.");
                }
            },

            onRefreshMuestreo: function (oEvent) {
                this._byId("tblMuestreo").getModel("MuestreoCalaSet").refresh();
            },

            //Muestreo

            buildTempMuestreo: function (metadata, that) {
                var aConfig = [],
                    aCells = [],
                    aCellsView = [];
                //Solo es para agregar campo porcentaje juvenil ya que por ahora no hay
                var aMuestreo = metadata.dataServices.schema[0].entityType[18].property;

                that.oMuestreo = {};
                var oInput;

                for (var i = 0; i < aMuestreo.length; i++) {
                    var label = aMuestreo[i].extensions[1].value;
                    var updatable = aMuestreo[i].extensions[3].name;

                    if (i >= 5) {
                        that.oMuestreo[aMuestreo[i].name] = "0.00";
                    } else {
                        that.oMuestreo[aMuestreo[i].name] = "";
                    }
                    //console.log(label);
                    if (label === "-") {
                        continue;
                    }

                    if (updatable === "updatable") {
                        if (aMuestreo[i].name === "Descripcion") {
                            aCells.push(
                                new Text({
                                    id: "txtDescEspcie",
                                    text: "{MuestreoCalaSet>" + aMuestreo[i].name + "}",
                                })
                            );
                        } else {
                            aCells.push(
                                new Text({
                                    text: "{MuestreoCalaSet>" + aMuestreo[i].name + "}",
                                })
                            );
                        }
                    } else {
                        switch (aMuestreo[i].name) {
                            case "Especie":
                                oInput = new Input({
                                    id: "inpEspecie",
                                    showValueHelp: true,
                                    ariaLabelledBy: ["txtDescEspcie"],
                                    valueHelpRequest: function (oEvent) {
                                        Especie.handleEpecieComboHelp(oEvent, that);
                                    },
                                    liveChange: function (oEvent) {
                                        Especie.onLiveChangeEspecieCombo(oEvent, that);
                                    },
                                    value: "{MuestreoCalaSet>" + aMuestreo[i].name + "}",
                                });
                                break;
                            case "Porcentaje":
                                oInput = new Input({
                                    value: "{MuestreoCalaSet>" + aMuestreo[i].name + "}",
                                    liveChange: function (oEvent) {
                                        Util.onlyNumeric(oEvent);
                                    },
                                });
                                break;
                        }

                        aCells.push(oInput);
                    }

                    aConfig.push({
                        propertyName: aMuestreo[i].name,
                        text: label,
                    });

                    aCellsView.push(
                        new Text({
                            text: "{MuestreoCalaSet>" + aMuestreo[i].name + "}",
                        })
                    );
                }

                that.setJsonModel(aConfig, "tblMuestreo", true);
                //console.log(aCells);
                //console.log(aCellsView);
                that.oEditableMuestreoTemplate = new sap.m.ColumnListItem({
                    cells: aCells,
                });

                that.oViewMuestreoTemplate = new sap.m.ColumnListItem({
                    cells: aCellsView,
                });
            },

            onPressMuestreo: function (oEvent) {
                var bEditable = this.getJsonModel("Configuracion").getProperty("/Editable");
                var aCalas = this._byId("tblCalas").getSelectedItem();

                if (!aCalas) {
                    sap.m.MessageBox.warning("Seleccione una cala");
                } else {
                    var oCala = aCalas.getBindingContext("CalasSet").getObject();

                    if (!this._muestreoDialog) {
                        this._muestreoDialog = sap.ui.xmlfragment(
                            "Hayduk.InformeDeFlota.view.fragments.dialogs.Muestreo",
                            this
                        );
                        this.getView().addDependent(this._muestreoDialog);
                    }
                    var oTblMuestreo = this._byId("tblMuestreo");

                    if (bEditable) {
                        this.rebindTable(
                            oTblMuestreo,
                            "MuestreoCalaSet>/d/results",
                            [],
                            this.oEditableMuestreoTemplate,
                            "Edit"
                        );
                        //oTblMuestreo.setMode(sap.m.ListMode.SingleSelectLeft);
                    } else {
                        this.rebindTable(
                            oTblMuestreo,
                            "MuestreoCalaSet>/d/results",
                            [],
                            this.oViewMuestreoTemplate,
                            "Navigation"
                        );
                        //oTblMuestreo.setMode(sap.m.ListMode.None);
                    }

                    if (oCala.Numinf.length) {
                        oTblMuestreo.getBinding("items").filter([new Filter("Numcala", "EQ", oCala.Numinf)]);
                    }

                    var oInfo = {
                        Titulo: "Hoja Muestreo Cala: " + oCala.Numcala,
                    };

                    var oModel = new JSONModel(oInfo);
                    this._muestreoDialog.setModel(oModel);
                    this._byId("tblMuestreo").getModel("MuestreoCalaSet").refresh();
                    this._byId("tblMuestreo")
                        .getBinding("items")
                        .filter([new Filter("Numcala", sap.ui.model.FilterOperator.Contains, oCala.Numcala)]);

                    this._muestreoDialog.open();
                }
            },

            addMuestreoCala: function (oEvent) {
                var oMuestreoModel = this._byId("tblMuestreo").getModel("MuestreoCalaSet");
                var aMuestreo = oMuestreoModel.getData();
                var oMuestreo = Util.cloneObject(this.oMuestreo);
                var aCalas = this._byId("tblCalas").getSelectedItem();
                var sEspecie = this.getJsonModel("InformeFlota").getProperty("/Especie");
                Util.sortObjectArray(aMuestreo.d.results, "Nummuestreo");
                //Separar por cala

                var aMuestreos = [];
                if (!aCalas) {
                    sap.m.MessageBox.warning("Seleccione una cala");
                    return false;
                } else {
                    var oCala = aCalas.getBindingContext("CalasSet").getObject();

                    if (this.CalaActual && this.CalaActual !== oCala.Numcala) this.numeroMuestreo = undefined;

                    if (oCala.Numcala.length) {
                        oMuestreo.Numcala = oCala.Numcala;
                    } else {
                        oMuestreo.Numcala = "";
                    }

                    for (var i = 0; aMuestreo.d.results.length > i; i++) {
                        if (aMuestreo.d.results[i].Numcala === oCala.Numcala) {
                            aMuestreos.push(aMuestreo.d.results[i]);
                        }
                    }
                }

                if (aMuestreos.length > 0 && !this.numeroMuestreo) {
                    this.numeroMuestreo = parseInt(aMuestreos[aMuestreos.length - 1].Nummuestreo, 0);
                }
                this.numeroMuestreo = this.numeroMuestreo + 1;

                if (isNaN(parseInt(this.numeroMuestreo, 0))) {
                    oMuestreo.Nummuestreo = 1;
                } else {
                    oMuestreo.Nummuestreo = this.numeroMuestreo;
                }

                if (!this.getJsonModel("InformeFlota")) {
                    oMuestreo.Numinforme = "";
                } else {
                    oMuestreo.Numinforme = this.getJsonModel("InformeFlota").getProperty("/Numero");
                }

                if (sEspecie === "16000000") {
                    var aEspecies = this.getJsonModel("EspecieComboSet").getData().d.results;
                    var nPos = Util.binarySearch(aEspecies, "01", "Identificador");
                    oMuestreo.Especie = "01";
                    if (nPos !== -1) {
                        oMuestreo.Descripcion = aEspecies[nPos].Nombre;
                    }
                }

                oMuestreo.Nummuestreo = Util.paddZeroes(oMuestreo.Nummuestreo, 3);
                //console.log(this.oCalas);
                aMuestreo.d.results.push(oMuestreo);
                oMuestreoModel.refresh(true);
                this.CalaActual = oCala.Numcala;
            },

            deleteMuestreoCala: function (oEvent) {
                var oTabla = this._byId("tblMuestreo");
                var itemMuestreo = oTabla.getSelectedItem(),
                    oModel = oTabla.getModel("MuestreoCalaSet"),
                    aData = oModel.getData().d.results,
                    that = this;
                if (!itemMuestreo) {
                    sap.m.MessageBox.warning("Seleccione un muestreo");
                } else {
                    var oCala = this._byId("tblCalas").getSelectedItem().getBindingContext("CalasSet").getObject();
                    var oMuestreo = itemMuestreo.getBindingContext("MuestreoCalaSet").getObject();
                    var nIndex;

                    for (var i = 0; aData.length > i; i++) {
                        if (aData[i].Numcala === oCala.Numcala && aData[i].Nummuestreo === oMuestreo.Nummuestreo) {
                            nIndex = i;
                            break;
                        }
                    }

                    sap.m.MessageBox.confirm("¿Desea eliminar el muestreo número:" + oMuestreo.Nummuestreo + " ?", {
                        title: "Eliminar Muestreo",
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                if (aData[nIndex].Especie != "06") {
                                    oCala.Juven_Anch = "";
                                    if (aData[nIndex].Especie == "10") {
                                        oCala.Juven_Jure = "";
                                    }

                                    if (aData[nIndex].Especie == "01") {
                                        oCala.Juven_Anch = "";
                                    }

                                    if (aData[nIndex].Especie == "11") {
                                        oCala.Juven_Merl = "";
                                    }
                                } else {
                                    oCala.Juven_Caba = "";
                                }
                                that._byId("tblCalas")
                                    .getSelectedItem()
                                    .getBindingContext("CalasSet")
                                    .getModel()
                                    .refresh(true);

                                aData.splice(nIndex, 1);
                                if (that.aTallas) that.aTallas.splice(nIndex, 1);

                                var aMuestreo = [];
                                for (i = 0; aData.length > i; i++) {
                                    if (aData[i].Numcala === oCala.Numcala) aMuestreo.push(aData[i]);
                                }

                                for (i = 0; aMuestreo.length > i; i++) {
                                    aMuestreo[i].Nummuestreo = Util.paddZeroes(i + 1, 3);
                                }

                                that._byId("tblMuestreo").removeSelections(true);

                                that.numeroMuestreo = undefined;

                                //console.log(aData);
                                oModel.refresh(true);
                                sap.m.MessageToast.show("Muestreo eliminado correctamente");
                            }
                        },
                    });

                    // var itemCells= tblCalas.getSelectedItem().getCells();
                    // var txtJuvenAnch,txtJuvenJure;
                    // var bValidAnch=false,bValidJure=false;

                    // $.each(itemCells,function(key,value){
                    //  if(value.sId.indexOf("txtJuvenAnch",0)!=-1){
                    //      txtJuvenAnch=itemCells[key];
                    //      bValidAnch=true;
                    //  }
                    //  if(value.sId.indexOf("txtJuvenCaba",0)!=-1){
                    //      txtJuvenJure=itemCells[key];
                    //      bValidJure=true;
                    //  }
                    // });
                }
            },

            onUpdFinTblMuestreo: function (oEvent) {
                var that = this;
                var oTableTrip = oEvent.getSource();
                var aItems = oTableTrip.getItems();

                function validateEspecie(sValue) {
                    if (sValue.length < 2) {
                        return false;
                    }

                    var aEspecies = that.getJsonModel("EspecieComboSet").getData().d.results;
                    var nPos = -1;
                    var aPos;
                    // nPos = Util.binarySearch(aEspecies, sValue, "Identificador");
                    aPos = aEspecies.filter((oPos) => oPos.Identificador == sValue);
                    // if (nPos === -1) {
                    if (aPos.length < 0) {
                        return false;
                    } else {
                        return true;
                    }
                }

                for (var i in aItems) {
                    var bFilaCorrecta = true;
                    var aCells = aItems[i].getCells();

                    var oEspecie = aCells[1];

                    //Validar Cargo
                    var sControlType = oEspecie.getMetadata().getName();

                    if (sControlType === "sap.m.Text") {
                        if (!validateEspecie(oEspecie.getText(), aItems[i])) {
                            aItems[i].setHighlight(sap.ui.core.MessageType.Error);
                            bFilaCorrecta &= false;
                        }

                        if (bFilaCorrecta) {
                            aItems[i].setHighlight(sap.ui.core.MessageType.None);
                        }
                    } else if (sControlType === "sap.m.Input") {
                        if (!validateEspecie(oEspecie.getValue(), aItems[i])) {
                            oEspecie.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            oEspecie.setValueState(sap.ui.core.ValueState.None);
                        }
                    }
                }
            },

            onXLSMuestreo: function (oEvent) {
                this.onXLSDownload(oEvent, "tblMuestreo", "Muestreo", true);
            },

            onCloseMuestreo: function (oEvent) {
                this._muestreoDialog.close();
                this.calas.calculateCompEspecie(this);
            },

            //Tallas por especie

            buildTallasEspecie: function (that) {
                //if (that.buildTallaReady) return false;
                if (!that.aTallas) that.aTallas = [];
                var aMuestreos = that.getJsonModel("MuestreoCalaSet").getData().d.results;
                var aLongitudes = that.getJsonModel("LongCalasSet").getData().d.results;
                var aTallasOff = that.aTallas;
                //console.log(aMuestreos);
                //console.log(aLongitudes);
                if (aLongitudes.length) {
                    that.aTallas = [];
                    for (var i = 0; aMuestreos.length > i; i++) {
                        var oTallas = {
                            Numcala: aMuestreos[i].Numcala,
                            Nummuestreo: aMuestreos[i].Nummuestreo,
                            Especie: aMuestreos[i].Especie,
                            Tallas: [],
                        };

                        for (var j = 0; aLongitudes.length > j; j++) {
                            if (
                                aLongitudes[j].Numcala === aMuestreos[i].Numcala &&
                                aLongitudes[j].Nummuestreo === aMuestreos[i].Nummuestreo
                            ) {
                                aLongitudes[j].Cantidad = parseFloat(aLongitudes[j].Cantidad);
                                oTallas.Tallas.push(aLongitudes[j]);
                            }
                        }

                        if (oTallas.Tallas.length) {
                            that.aTallas.push(oTallas);
                        } else {
                            var aTallasOffX = aTallasOff.filter(
                                (oPos) =>
                                    oPos.Numcala === aMuestreos[i].Numcala &&
                                    oPos.Nummuestreo === aMuestreos[i].Nummuestreo
                            );
                            if (aTallasOffX.length === 1) {
                                oTallas.Tallas = aTallasOffX[0].Tallas;
                                that.aTallas.push(oTallas);
                            }
                        }
                    }
                } else {
                    // that.aTallas = undefined;
                }

                that.buildTallaReady = true;
                //console.log(that.aTallas);
            },

            onPressShowTallaEspecie: function (oEvent) {
                this.calas.buildTallasEspecie(this);
                var oTblMuestreo = this._byId("tblMuestreo"),
                    itemMuestreo = oTblMuestreo.getSelectedItem();
                var nNumero = this.getJsonModel("InformeFlota").getProperty("/Numero");
                var aListaTallas = {
                    d: {
                        results: [],
                    },
                };

                var aTallasEspecie = this.getJsonModel("TallaEspecieSet").getData().d.results;

                function ConstruirTallas(oMuestreo, nPos) {
                    //Revisar número d informe

                    if (!nNumero.length) {
                        nNumero = "";
                    }

                    var oTalla = aTallasEspecie[nPos];

                    var aRango = oTalla.Talla.split("-");
                    //console.log(aRango);
                    var fInicio = parseFloat(aRango[0]),
                        fFin = parseFloat(aRango[1]);
                    var nNum = fInicio;
                    while (fFin >= nNum) {
                        if (nNum < 20) {
                            aListaTallas.d.results.push({
                                Numinforme: nNumero,
                                Numcala: oMuestreo.Numcala,
                                Nummuestreo: oMuestreo.Nummuestreo,
                                Talla: nNum,
                                Cantidad: 0,
                            });
                            nNum += 0.5;
                        } else {
                            aListaTallas.d.results.push({
                                Numinforme: nNumero,
                                Numcala: oMuestreo.Numcala,
                                Nummuestreo: oMuestreo.Nummuestreo,
                                Talla: nNum,
                                Cantidad: 0,
                            });
                            nNum += 1;
                        }
                    }
                }

                if (!itemMuestreo) {
                    sap.m.MessageBox.warning("Seleccione un muestreo");
                } else {
                    var oMuestreo = itemMuestreo.getBindingContext("MuestreoCalaSet").getObject();

                    var bEditable = this.getJsonModel("Configuracion").getProperty("/Editable");

                    if (oMuestreo.Especie.length) {
                        //console.log(aTallasEspecie);
                        var nPos = -1;
                        nPos = Util.binarySearch(aTallasEspecie, oMuestreo.Especie, "Identificador");

                        if (nPos === -1) {
                            sap.m.MessageBox.alert("No existen tallas para la especie indicada");
                        } else {
                            if (this.aTallas) {
                                for (var j = 0; this.aTallas.length > j; j++) {
                                    var oTallaEsp = this.aTallas[j];
                                    if (
                                        oTallaEsp.Numcala === oMuestreo.Numcala &&
                                        oTallaEsp.Nummuestreo === oMuestreo.Nummuestreo &&
                                        oTallaEsp.Especie === oMuestreo.Especie
                                    ) {
                                        aListaTallas.d.results = oTallaEsp.Tallas;
                                        break;
                                    }
                                }

                                if (aListaTallas.d.results.length) {
                                    Util.sortObjectArray(aListaTallas.d.results, "Talla");
                                } else {
                                    ConstruirTallas(oMuestreo, nPos);
                                }
                            } else {
                                ConstruirTallas(oMuestreo, nPos);
                            }

                            var oInfo = {
                                Titulo:
                                    "Hoja de detalle- Cala:" +
                                    oMuestreo.Numcala +
                                    " Muestreo: " +
                                    oMuestreo.Nummuestreo,
                                Especie: "Especie: " + oMuestreo.Descripcion,
                            };

                            Util.sortObjectArray(aListaTallas.d.results, "Talla");
                            var oModelInfo = new JSONModel(oInfo);
                            //this.setJsonModel(aListaTallas, "TallaXEspecieSet", false);
                            this.getJsonModel("TallaXEspecieSet").setData(aListaTallas);
                            this.getJsonModel("TallaXEspecieSet").refresh(true);
                            //Mostrar diálogo
                            if (!this._tallasDialog) {
                                this._tallasDialog = sap.ui.xmlfragment(
                                    "Hayduk.InformeDeFlota.view.fragments.dialogs.TallaEspecie",
                                    this
                                );
                                this.getView().addDependent(this._tallasDialog);
                            }
                            this._tallasDialog.setModel(oModelInfo);
                            this._tallasDialog.open();
                        }
                    } else {
                        sap.m.MessageBox.warning("Debe indicar una especie");
                    }
                }
            },

            onAcceptTallas: function (oEvent) {
                var aTallasModel = Util.deepCloneArray(this.getJsonModel("TallaXEspecieSet").getData().d.results);
                var oTblMuestreo = this._byId("tblMuestreo"),
                    itemMuestreo = oTblMuestreo.getSelectedItem().getBindingContext("MuestreoCalaSet").getObject(),
                    itemMuestreoCells = oTblMuestreo.getSelectedItem().getCells();
                var iCantidad = 0;
                var that = this;

                for (var i in aTallasModel) {
                    if (aTallasModel[i].Cantidad === "") aTallasModel[i].Cantidad = 0;
                    aTallasModel[i].Cantidad = parseInt(aTallasModel[i].Cantidad, 0);
                    iCantidad += aTallasModel[i].Cantidad;
                }

                Util.sortObjectArray(aTallasModel, "Cantidad");

                var oInpModa = itemMuestreoCells[4],
                    oInpTallaMin = itemMuestreoCells[5],
                    oInpTallaMax = itemMuestreoCells[6],
                    oInpCantidad = itemMuestreoCells[7],
                    oInpJuvenil = itemMuestreoCells[8];

                //Funcion para cargar los porcentajes juveniles
                function cargarPorJuvenil() {
                    var oModelEspMin = that.getOwnerComponent().getModel("listEspecieTallaMin");
                    var oDataEspMin = JSON.parse(oModelEspMin.getJSON());
                    var Especie = itemMuestreo.Especie;
                    var TallaMedia,
                        CantMen = 0,
                        CantMay = 0;
                    var porJuven = 0.0;
                    // var porcentaje = parseInt(itemMuestreo.Porcentaje, 0);
                    var porcentaje = 100;

                    //Busco la talla media correspondiente a la especie
                    $.each(oDataEspMin.list, function (key, value) {
                        if (Especie === value.Id) {
                            TallaMedia = parseInt(value.Talla, 0);
                            return false;
                        }
                    });

                    for (var i = 0; i < aTallasModel.length; i++) {
                        if (aTallasModel[i].Talla < TallaMedia) {
                            CantMen = CantMen + aTallasModel[i].Cantidad;
                        }
                        CantMay = CantMay + aTallasModel[i].Cantidad;
                    }
                    if (TallaMedia == 0) {
                        porJuven = 0;
                    } else {
                        porJuven = (CantMen / CantMay) * porcentaje;
                    }
                    return porJuven;
                }

                //Seteando valores
                function guardarTallas() {
                    var bEncontrada = false;
                    if (!that.aTallas) that.aTallas = [];

                    for (var y = 0; that.aTallas.length > y; y++) {
                        var oTallaEsp = that.aTallas[y];
                        if (
                            oTallaEsp.Numcala === itemMuestreo.Numcala &&
                            oTallaEsp.Nummuestreo === itemMuestreo.Nummuestreo &&
                            oTallaEsp.Especie === itemMuestreo.Especie
                        ) {
                            that.aTallas.Tallas = oTallaEsp.Tallas;
                            bEncontrada = true;
                            break;
                        }
                    }
                    if (!bEncontrada)
                        that.aTallas.push({
                            Numcala: itemMuestreo.Numcala,
                            Nummuestreo: itemMuestreo.Nummuestreo,
                            Especie: itemMuestreo.Especie,
                            Tallas: aTallasModel,
                        });
                }

                if (iCantidad) {
                    guardarTallas();
                    var porJuven = cargarPorJuvenil();
                    oInpJuvenil.setText(porJuven.toFixed(2));
                    oInpModa.setText(aTallasModel[aTallasModel.length - 1].Talla);
                    oInpCantidad.setText(iCantidad);

                    Util.sortObjectArray(aTallasModel, "Talla");

                    for (i = 0; aTallasModel.length > i; i++) {
                        if (aTallasModel[i].Cantidad) {
                            oInpTallaMin.setText(aTallasModel[i].Talla);
                            break;
                        }
                    }

                    for (i = aTallasModel.length - 1; i >= 0; i--) {
                        if (aTallasModel[i].Cantidad) {
                            oInpTallaMax.setText(aTallasModel[i].Talla);
                            break;
                        }
                    }
                    var tblCalas = this._byId("tblCalas");
                    var itemCells = tblCalas.getSelectedItem().getCells();
                    var txtJuvenAnch, txtJuvenJure;
                    var bValidAnch = false,
                        bValidJure = false;
                    var bAnchValue = false;
                    var selection = tblCalas._aSelectedPaths[0].split("/")[3];

                    jureMel = that.getView().getModel("calasPost").getData();

                    if (jureMel[selection] == undefined) {
                        jureMel[selection] = {
                            Juven_Jure: "",
                            Juven_Anch: "",
                            Juven_Merl: "",
                        };
                    }

                    $.each(itemCells, function (key, value) {
                        if (value.sId.indexOf("txtJuvenAnch", 0) != -1) {
                            txtJuvenAnch = itemCells[key];
                            bValidAnch = true;
                        }
                        if (value.sId.indexOf("txtJuvenCaba", 0) != -1) {
                            txtJuvenJure = itemCells[key];
                            bValidJure = true;
                        }

                        var bindings = value.getBindingContext("CalasSet").getModel().getBindings();
                        var sPath = bindings[key + 1].sPath;

                        if (sPath && sPath.includes("Juven_Anch")) {
                            txtJuvenAnch = itemCells[key];
                            bValidAnch = true;
                            //bAnchValue = true;
                        }
                    });

                    // if(bValidAnch){
                    //  txtJuvenAnch.setText(porJuven.toFixed(2));
                    // }
                    // if(bValidJure){
                    //  txtJuvenJure.setText(porJuven.toFixed(2));
                    // }

                    if (bValidAnch) {
                        if (itemMuestreo.Especie != "06" && itemMuestreo.Descripcion != "CABALLA") {
                            if (itemMuestreo.Especie == "10" && itemMuestreo.Descripcion == "JUREL") {
                                txtJuvenAnch.setText(porJuven.toFixed(2));
                                jureMel[selection].Juven_Jure = porJuven.toFixed(2);
                            }

                            if (itemMuestreo.Especie == "01" && itemMuestreo.Descripcion == "ANCHOVETA") {
                                // if (bAnchValue) {
                                //    txtJuvenAnch.setValue(porJuven.toFixed(2));
                                //    jureMel[selection].Juven_Anch = porJuven.toFixed(2);
                                //} else {
                                txtJuvenAnch.setText(porJuven.toFixed(2));
                                jureMel[selection].Juven_Anch = porJuven.toFixed(2);
                                // }
                            }

                            if (itemMuestreo.Especie == "11" && itemMuestreo.Descripcion == "MERLUZA") {
                                txtJuvenAnch.setText(porJuven.toFixed(2));
                                jureMel[selection].Juven_Merl = porJuven.toFixed(2);
                            }
                        }
                    }
                    if (bValidJure) {
                        if (itemMuestreo.Especie == "06" && itemMuestreo.Descripcion == "CABALLA") {
                            txtJuvenJure.setText(porJuven.toFixed(2));
                        }
                    }
                }

                var oModel = new JSONModel(jureMel);

                this.getView().setModel(oModel, "calasPost");

                //console.log(this.aTallas);
                this._tallasDialog.close();
            },

            onCloseTallas: function (oEvent) {
                this._tallasDialog.close();
            },

            calculateCompEspecie: function (that) {
                var nInforme = that.getJsonModel("InformeFlota").getProperty("/Numero");

                function addComposicion(list, Numespecie, Descripcion, Porcentaje, Cantidad) {
                    var oCompEspecie = {
                        Numinforme: nInforme,
                        Numespecie: Numespecie,
                        Descripcion: Descripcion,
                        Porcentaje: Porcentaje,
                        Cantidad: Cantidad,
                    };
                    list.push(oCompEspecie);
                }

                var bEditable = that.getJsonModel("Configuracion").getProperty("/Editable");
                if (!bEditable) {
                    return false;
                }

                var aCalas = Util.deepCloneArray(that._byId("tblCalas").getBinding("items").oList);
                var aMuestreos = Util.deepCloneArray(that.getJsonModel("MuestreoCalaSet").getData().d.results);
                var aCompEspecie = {
                    d: {
                        results: [],
                    },
                };
                var aCompEspecieAux = [];

                if (aCalas.length && aMuestreos.length) {
                    Util.sortObjectArray(aMuestreos, "Numcala");
                    Util.sortObjectArray(aCalas, "Numcala");

                    var fTotal = 0.0;

                    for (var i = 0; aCalas.length > i; i++) {
                        if (!isNaN(parseFloat(aCalas[i].Tbode))) {
                            fTotal += parseFloat(aCalas[i].Tbode);
                        }
                    }

                    for (i = 0; aMuestreos.length > i; i++) {
                        var nPos = Util.binarySearch(aCalas, aMuestreos[i].Numcala, "Numcala");
                        var nPorcentaje = parseFloat(aMuestreos[i].Porcentaje);
                        if (nPos !== -1 && !isNaN(parseFloat(aCalas[nPos].Tbode)) && !isNaN(nPorcentaje)) {
                            var Cantidad = (parseFloat(aCalas[nPos].Tbode) * nPorcentaje) / 100;

                            addComposicion(
                                aCompEspecieAux,
                                aMuestreos[i].Especie,
                                aMuestreos[i].Descripcion,
                                nPorcentaje,
                                Cantidad
                            );
                        }
                    }

                    //Util.sortObjectArray(aCompEspecieAux, "Numespecie");

                    var aSumas = Util.collectArray(aCompEspecieAux, "Numespecie", "Cantidad");

                    aCompEspecieAux = Util.removeDuplicates(aCompEspecieAux, "Numespecie");

                    for (i = 0; aCompEspecieAux.length > i; i++) {
                        aCompEspecieAux[i].Cantidad = aSumas[aCompEspecieAux[i].Numespecie];
                        aCompEspecieAux[i].Porcentaje = ((100 * aCompEspecieAux[i].Cantidad) / fTotal).toFixed(3);
                        aCompEspecie.d.results.push(aCompEspecieAux[i]);
                    }
                    that.getJsonModel("CompEspecieSet").setData(aCompEspecie);
                    that.getJsonModel("CompEspecieSet").refresh(true);
                    //console.log(aCompEspecie);
                }
            },
            onUploadXLSX: function (oEvent) {
                var that = this;
                var bTodoOk = true;
                var aData = {
                    d: {
                        results: [],
                    },
                };

                var sTipoRed = this.getJsonModel("InformeFlota").getProperty("/TipoRed");

                if (!sTipoRed.length) {
                    sap.m.MessageBox.error("Debe seleccionar un tipo de red", {
                        title: "Cargar calas",
                    });
                    return false;
                }

                function processXLSX(file) {
                    bTodoOk = true;
                    if (file && window.FileReader) {
                        var reader = new FileReader();
                        var result = {},
                            data;

                        reader.onload = function (e) {
                            data = e.target.result;
                            var wb = XLSX.read(data, {
                                type: "binary",
                            });

                            wb.SheetNames.forEach(function (sheetName) {
                                var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                                if (roa.length > 0) {
                                    result[sheetName] = roa;
                                }
                                //console.log(result);
                                var aExcel = result[sheetName];
                                for (var i = 0; aExcel.length > i; i++) {
                                    //Validar excel
                                    if (
                                        !aExcel[i].hasOwnProperty("N.") ||
                                        !aExcel[i].hasOwnProperty("Zona de pesca") ||
                                        !aExcel[i].hasOwnProperty("Fecha inicio") ||
                                        !aExcel[i].hasOwnProperty("Lat. Grados") ||
                                        !aExcel[i].hasOwnProperty("Lat. Minutos") ||
                                        !aExcel[i].hasOwnProperty("Long. Grados") ||
                                        !aExcel[i].hasOwnProperty("Long. Minutos") ||
                                        !aExcel[i].hasOwnProperty("Fecha fin") ||
                                        !aExcel[i].hasOwnProperty("Toneladas de pesca")
                                    ) {
                                        bTodoOk = false;
                                        break;
                                    }

                                    var oCalas = Util.cloneObject(that.oCalas);

                                    oCalas.Numcala = Util.paddZeroes(aExcel[i]["N."], 3);
                                    oCalas.Zonpes = aExcel[i]["Zona de pesca"];
                                    //console.log(aExcel[i]);
                                    var oDateInicio = Util.getDateTime(
                                        Util.ExcelDateToJSDate(aExcel[i]["Fecha inicio"])
                                    );

                                    var sDateInicio = oDateInicio.date.split("/");
                                    oCalas.Feccal1 = sDateInicio[2] + "-" + sDateInicio[1] + "-" + sDateInicio[0];
                                    oCalas.Horcal1 = oDateInicio.time;

                                    var oDateFin = Util.getDateTime(Util.ExcelDateToJSDate(aExcel[i]["Fecha fin"]));

                                    var sDateFin = oDateFin.date.split("/");
                                    oCalas.Feccal2 = sDateFin[2] + "-" + sDateFin[1] + "-" + sDateFin[0];
                                    oCalas.Horcal2 = oDateFin.time;

                                    oCalas.Latgra = parseInt(aExcel[i]["Lat. Grados"], 0);
                                    if (oCalas.Latgra < 0) oCalas.Latgra *= -1;

                                    oCalas.Latmin = parseInt(aExcel[i]["Lat. Minutos"], 0);

                                    oCalas.Longra = parseInt(aExcel[i]["Long. Grados"], 0);
                                    if (oCalas.Longra < 0) oCalas.Longra *= -1;

                                    oCalas.Lonmin = parseInt(aExcel[i]["Long. Minutos"], 0);

                                    if (!that.getJsonModel("InformeFlota")) {
                                        oCalas.Numinf = "";
                                    } else {
                                        oCalas.Numinf = that.getJsonModel("InformeFlota").getProperty("/Numero");
                                    }

                                    aData.d.results.push(oCalas);
                                }
                                if (bTodoOk) {
                                    Util.sortObjectArray(aData.d.results, "Numcala");
                                    that.cleanModel("CalasSet");
                                    that.setDataModel("CalasSet", aData);
                                    that.oDialogXLSXCalas.close();
                                } else {
                                    sap.m.MessageToast.show("Excel no válido");
                                    oFileUploader.setValueState(sap.ui.core.ValueState.Error);
                                }
                                //console.log(that._byId("tblTripulacion").getModel("TripulacionSet"));
                            });
                            return result;
                        };
                        reader.readAsBinaryString(file);
                    }
                }

                var oFileUploader = new sap.ui.unified.FileUploader({
                    fileType: ["xlsx"],
                    buttonText: "Seleccionar",
                    placeholder: "Archivo de calas",
                    change: function (oEvent) {
                        this.setValueState(sap.ui.core.ValueState.None);
                        if (oEvent.getParameter("files") && oEvent.getParameter("files")[0]) {
                            that.xlsxCalas = oEvent.getParameter("files")[0];
                        }
                    },
                    typeMissmatch: function (oEvent) {
                        this.setValueState(sap.ui.core.ValueState.Error);
                    },
                });

                oFileUploader.addStyleClass("sapUiMediumMarginBegin");

                this.oDialogXLSXCalas = new sap.m.Dialog({
                    resizable: false,
                    content: [oFileUploader],
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Accept,
                        icon: "sap-icon://upload",
                        press: function () {
                            var sEstado = oFileUploader.getValueState();
                            if (sEstado !== sap.ui.core.ValueState.Error) {
                                processXLSX(that.xlsxCalas);
                            }
                        },
                        text: "Cargar",
                    }),
                    endButton: new sap.m.Button({
                        press: function () {
                            this.getParent().close();
                        },
                        text: "Cancelar",
                    }),
                    customHeader: new sap.m.Bar({
                        contentMiddle: [
                            new sap.m.Title({
                                text: "Cargar XLSX Calas",
                                titleStyle: "H4",
                            }),
                        ],
                    }),
                    contentHeight: "8%",
                    contentWidth: "15%",
                    verticalScrolling: false,
                });

                this.oDialogXLSXCalas.addStyleClass("sapUiSizeCompact");

                this.oDialogXLSXCalas.open();
            },

            //Funcion para formatear las fechas
            setFormaterDate: function (oEvent) {
                var text = oEvent.getParameter("value");
                var bValidate = true;
                var aText,
                    sFecha = "",
                    sHora = "";

                text = text.replace(/[/:]/g, "");
                if (text.length === 15 || text.length === 13) {
                    aText = text.split(" ");
                    sFecha = aText[0].substring(0, 4) + aText[0].substring(aText[0].length - 2);
                    sHora = aText[1].substring(0, 4);

                    text = sFecha + " " + sHora;
                }

                if (text.length == 11 && text.indexOf(" ") != -1) {
                    var fecha = text.split(" ")[0];

                    var hora = text.split(" ")[1];
                    var fDia = fecha[0] + fecha[1],
                        fMes = fecha[2] + fecha[3],
                        fAnio = fecha[4] + fecha[5];

                    var numdiasMes = new Date(fAnio, fMes, 0).getDate();
                    //Antes estaba <= y se coloco < puesto numdiasMes te da el último día de cada mes
                    //entonces en el caso que se envie una fecha con dia 32 o mayor a este número entrará al if
                    //y saldrá el mensaje que introdujo una fecha invalida
                    if (numdiasMes < fDia) {
                        bValidate = false;
                    }
                    if (parseInt(fMes) > "12") {
                        bValidate = false;
                    }
                    fecha = fDia + "/" + fMes + "/20" + fAnio;

                    if (hora.length == 2) {
                        hora = hora + "00"; // completar minutos
                    }

                    var hHora = hora[0] + hora[1],
                        hMin = hora[2] + hora[3];

                    if (parseInt(hHora) > 24) {
                        bValidate = false;
                    }
                    if (parseInt(hMin) > 59) {
                        bValidate = false;
                    }

                    hora = hHora + ":" + hMin + ":00";

                    var DateTime = fecha + " " + hora;
                } else {
                    bValidate = false;
                }

                var sPathInput = oEvent.getSource().getBindingPath("value");
                var aCells = oEvent.getSource().getParent().getCells(),
                    sFecCell = "",
                    sHorCell = "";
                switch (sPathInput) {
                    case "FecHorIniTxt":
                        sFecCell = "Feccal1";
                        sHorCell = "Horcal1";
                        break;
                    case "FecHorFinTxt":
                        sFecCell = "Feccal2";
                        sHorCell = "Horcal2";
                        break;
                    case "FecHorSalTxt":
                        sFecCell = "Fecsal";
                        sHorCell = "Horsal";
                        break;
                    default:
                }
                if (bValidate == true) {
                    /*    var sPathInput = oEvent.getSource().getBindingPath("value");
                        var aCells = oEvent.getSource().getParent().getCells(),
                            sFecCell = "",
                            sHorCell = "";*/
                    oEvent.getSource().setValue(DateTime);

                    /*    switch (sPathInput) {
                            case "FecHorIniTxt":
                                sFecCell = "Feccal1";
                                sHorCell = "Horcal1";
                                break;
                            case "FecHorFinTxt":
                                sFecCell = "Feccal2";
                                sHorCell = "Horcal2";
                                break;
                            case "FecHorSalTxt":
                                sFecCell = "Fecsal";
                                sHorCell = "Horsal";
                                break;
                            default:
                        }*/

                    for (var i = 0, n = aCells.length; i < n; i++) {
                        var sPath = "";

                        if (aCells[i].getBindingPath("text") !== undefined) {
                            sPath = aCells[i].getBindingPath("text");
                        } else if (aCells[i].getBindingPath("value") !== undefined) {
                            sPath = aCells[i].getBindingPath("value");
                        }

                        if (sPath == sFecCell) {
                            aCells[i].setValue("20" + fAnio + "-" + fMes + "-" + fDia);
                        }
                        if (sPath == sHorCell) {
                            aCells[i].setValue(hora);
                        }
                    }
                } else {
                    //sap.m.MessageToast.show("Fecha Ingresada no Valida");
                    for (var i = 0, n = aCells.length; i < n; i++) {
                        var sPath = "";

                        if (aCells[i].getBindingPath("text") !== undefined) {
                            sPath = aCells[i].getBindingPath("text");
                        } else if (aCells[i].getBindingPath("value") !== undefined) {
                            sPath = aCells[i].getBindingPath("value");
                        }

                        if (sPath == sFecCell) {
                            aCells[i].setValue("");
                        }
                        if (sPath == sHorCell) {
                            aCells[i].setValue("");
                        }
                    }
                    /*    oEvent.getSource().getParent().getCells()[2].setValue("");
                        oEvent.getSource().getParent().getCells()[4].setValue("");*/
                }
            },
            _cargaFinalTabla: function (oEvent) {
                var that = this;
                var aColumns = oEvent.getSource().getColumns();
                // var aItems = oEvent.getSource().getItems();
                var aItems = this._byId("tblCalas").getBinding("items").oList,
                    flagEdit = this.getView().getModel("flagEdit").getData();
                jureMel = that.getView().getModel("calasPost").getData();

                if (aItems.length >= 1) {
                    if (flagEdit[0].flag) {
                        $.each(aItems, function (k, v) {
                            if (v.Juven_Jure != "") {
                                if (parseInt(v.Juven_Jure) != 0) {
                                    jureMel[k] = {
                                        Juven_Jure: v.Juven_Jure,
                                        Juven_Anch: v.Juven_Anch,
                                        Juven_Merl: v.Juven_Merl,
                                    };
                                    v.Juven_Anch = v.Juven_Jure;

                                    var oModel = new JSONModel([
                                        {
                                            flag: false,
                                        },
                                    ]);
                                    that.getView().setModel(oModel, "flagEdit");
                                }
                            }
                        });

                        var oModel = new JSONModel(jureMel);
                        this.getView().setModel(oModel, "calasPost");
                        this._byId("tblCalas").getModel("CalasSet").refresh();
                    } else {
                        var calasPost = this.getView().getModel("calasPost").getData();

                        $.each(aItems, function (k, v) {
                            if (calasPost.length > 0) {
                                v.Juven_Jure = calasPost[k].Juven_Jure;
                                v.Juven_Anch = calasPost[k].Juven_Jure;
                                v.Juven_Merl = calasPost[k].Juven_Merl;
                            }
                        });
                        this._byId("tblCalas").getModel("CalasSet").refresh();
                    }

                    var oColumn;
                    var aHeaderToKey = [
                        {
                            Header: "Bod. Proa",
                            Key: "Proa",
                        },
                        {
                            Header: "Bod. Tunel",
                            Key: "Tunel",
                        },
                        {
                            Header: "Bod. Popa",
                            Key: "Popa",
                        },
                        {
                            Header: "Bod 1",
                            Key: "Proa",
                        },
                        {
                            Header: "Bod 2",
                            Key: "Tunel",
                        },
                        {
                            Header: "Bod 3",
                            Key: "Popa",
                        },
                        {
                            Header: "Bod 4",
                            Key: "Bod04",
                        },
                        {
                            Header: "Bod 5",
                            Key: "Bod05",
                        },
                        {
                            Header: "Bod 6",
                            Key: "Bod06",
                        },
                        {
                            Header: "Bod 7",
                            Key: "Bod07",
                        },
                        {
                            Header: "Bod 8",
                            Key: "Bod08",
                        },
                        {
                            Header: "Bod. Total",
                            Key: "Tbode",
                        },
                    ];

                    for (var i = 0, n = aHeaderToKey.length; i < n; i++) {
                        var fSumTotal = 0;
                        oColumn = aColumns.find(
                            (oPosition) => oPosition.getHeader().getText() === aHeaderToKey[i].Header
                        );

                        if (oColumn !== undefined) {
                            for (var o = 0, m = aItems.length; o < m; o++) {
                                var fSubSum = parseFloat(aItems[o][aHeaderToKey[i].Key]);
                                if (!isNaN(fSubSum)) {
                                    fSumTotal += fSubSum;
                                }
                            }
                            oColumn.getFooter().setText(fSumTotal);
                            oColumn.getFooter().setVisible(true);
                            fSumTotal = 0;
                        }
                    }

                    // var oColumn = aColumns.find(oPosition => oPosition.getHeader().getText() === "Bod. Total");
                    // var fSumTotal = 0;

                    // for (var i = 0, n = aItems.length; i < n; i++) {
                    //  var oCells = aItems[i].getCells().find(oPosition => oPosition.getId().indexOf("Bodtotal") >= 0);
                    //  var fSubSum = parseFloat(oCells.getText());
                    //  if (!isNaN(fSubSum)) {
                    //      fSumTotal += fSubSum;
                    //  }
                    // }
                    // oColumn.getFooter().setText(fSumTotal);
                }
            },

            _totalColumnasCalas: function (aItems, oEvent, that) {
                var oColumnLabel,
                    oParentColumn,
                    iIndex,
                    oColumnIndex,
                    sHeaderText,
                    sKey,
                    iRow = oEvent.getParameter("id");
                var sTotalColumn = parseFloat(oEvent.getSource().getValue());
                var aHeaderToKey = [
                    {
                        Header: "Bod. Proa",
                        Key: "Proa",
                    },
                    {
                        Header: "Bod. Tunel",
                        Key: "Tunel",
                    },
                    {
                        Header: "Bod. Popa",
                        Key: "Popa",
                    },
                    {
                        Header: "Bod 1",
                        Key: "Proa",
                    },
                    {
                        Header: "Bod 2",
                        Key: "Tunel",
                    },
                    {
                        Header: "Bod 3",
                        Key: "Popa",
                    },
                    {
                        Header: "Bod 4",
                        Key: "Bod04",
                    },
                    {
                        Header: "Bod 5",
                        Key: "Bod05",
                    },
                    {
                        Header: "Bod 6",
                        Key: "Bod06",
                    },
                    {
                        Header: "Bod 7",
                        Key: "Bod07",
                    },
                    {
                        Header: "Bod 8",
                        Key: "Bod08",
                    },
                ];

                oParentColumn = oEvent.getSource().getParent();
                oColumnLabel = oEvent.getSource();
                iRow = parseInt(iRow.charAt(iRow.length - 1));
                iIndex = oParentColumn.indexOfCell(oColumnLabel);
                oColumnIndex = that._byId("tblCalas").getColumns()[iIndex];
                sHeaderText = oColumnIndex.getHeader().getText();
                sKey = aHeaderToKey.find((oPosition) => oPosition.Header === sHeaderText).Key;

                if (isNaN(sTotalColumn)) {
                    sTotalColumn = 0;
                }

                for (var i = 0, n = aItems.length; i < n; i++) {
                    if (iRow !== i) {
                        var fSubSum = parseFloat(aItems[i][sKey]);
                        if (!isNaN(fSubSum)) {
                            sTotalColumn += fSubSum;
                        }
                    }
                }

                oColumnIndex.getFooter().setText(sTotalColumn);
                oColumnIndex.getFooter().setVisible(true);
            },
        };
    }
);
