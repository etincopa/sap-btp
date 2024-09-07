sap.ui.define(
    [
        "sap/m/MessageBox",
        "Hayduk/InformeDeFlota/model/models",
        "sap/ui/model/Filter",
        "sap/ui/core/format/DateFormat",
        "sap/m/MessageToast",
    ],
    function (MessageBox, Models, Filter, DateFormat, MessageToast) {
        "use strict";
        return {
            sortArrayDate: function (list) {
                var that = this;

                function compare(a, b) {
                    var aDatesA = a.subtitle.split("-");
                    var oDateA = that.getDateObjectValue2(aDatesA[0], aDatesA[1], "/", ":");

                    var aDatesB = b.subtitle.split("-");
                    var oDateB = that.getDateObjectValue2(aDatesB[0], aDatesB[1], "/", ":");

                    if (oDateA > oDateB) return -1;
                    if (oDateA < oDateB) return 1;
                    return 0;
                }

                list.sort(compare);
            },
            /*
            validatesDatesArrDesc: function (oEvent) {
                this.util.validateArriboDate(oEvent, this);
                this.util.validateDescarDate(oEvent, this);
            },
            */
            /*
            validateDescarDate: function (oEvent, that) {
                var util;
                if (typeof that === "undefined") {
                    that = this;
                    util = this.util;
                } else {
                    util = this;
                }

                if (util.validateDateTime(oEvent)) {
                    var sError = sap.ui.core.ValueState.Error;
                    var sNone = sap.ui.core.ValueState.None;

                    var oDPDesc = that._byId("dpDescarga");
                    var oTPDesc = that._byId("tpDescarga");

                    var oDPDesc2 = that._byId("dpDescarga2");
                    var oTPDesc2 = that._byId("tpDescarga2");

                    var oDateDescarga = util.getDateObject(oDPDesc, oTPDesc, "/", ":");
                    var oDateDescarga2 = util.getDateObject(oDPDesc2, oTPDesc2, "/", ":");

                    if (oDateDescarga >= oDateDescarga2) {
                        oDPDesc.setValueState(sError);
                        oTPDesc.setValueState(sError);
                        oDPDesc2.setValueState(sError);
                        oTPDesc2.setValueState(sError);
                        that.byId("inpDescarga").setValueState("Error");
                        that.byId("inpDescarga2").setValueState("Error");
                        sap.m.MessageBox.error("La fecha de fin de descarga debe ser mayor a la fecha de inicio.");
                    } else {
                        oDPDesc.setValueState(sNone);
                        oTPDesc.setValueState(sNone);
                        oDPDesc2.setValueState(sNone);
                        oTPDesc2.setValueState(sNone);
                        that.byId("inpDescarga").setValueState("None");
                        that.byId("inpDescarga2").setValueState("None");
                    }
                }
            },
            */
            /*
            validateArriboDate: function (oEvent, that) {
                var util,
                    sMensaje = "",
                    bErrorArribo = false;
                if (typeof that === "undefined") {
                    that = this;
                    util = this.util;
                } else {
                    util = this;
                }

                if (util.validateDateTime(oEvent)) {
                    var sError = sap.ui.core.ValueState.Error;
                    var sNone = sap.ui.core.ValueState.None;

                    var oDPArribo = that._byId("dpArribo");
                    var oTPArribo = that._byId("tpArribo");

                    var oDPDesc = that._byId("dpDescarga");
                    var oTPDesc = that._byId("tpDescarga");

                    var oDPSalidaZonaPesca = that._byId("dpSalidaPesca");
                    var oTPSalidaZonaPesca = that._byId("tpSalidaPesca");

                    var oDateArribo = util.getDateObject(oDPArribo, oTPArribo, "/", ":");
                    var oDateDescarga = util.getDateObject(oDPDesc, oTPDesc, "/", ":");

                    var oDateSalida = util.getDateObject(oDPSalidaZonaPesca, oTPSalidaZonaPesca, "/", ":");

                    if (oDateArribo >= oDateDescarga) {
                        oDPArribo.setValueState(sError);
                        oTPArribo.setValueState(sError);
                        oDPDesc.setValueState(sError);
                        oTPDesc.setValueState(sError);
                        that.byId("inpArribo").setValueState("Error");
                        that.byId("inpDescarga").setValueState("Error");
                        sMensaje = "La fecha de descarga debe ser mayor a la fecha de arribo.";
                        bErrorArribo = true;
                    } else {
                        oDPArribo.setValueState(sNone);
                        oTPArribo.setValueState(sNone);
                        oDPDesc.setValueState(sNone);
                        oTPDesc.setValueState(sNone);
                        that.byId("inpArribo").setValueState("None");
                        that.byId("inpDescarga").setValueState("None");
                    }

                    if (oDateArribo <= oDateSalida) {
                        oDPArribo.setValueState(sError);
                        oTPArribo.setValueState(sError);
                        oDPSalidaZonaPesca.setValueState(sError);
                        oTPSalidaZonaPesca.setValueState(sError);
                        that.byId("inpArribo").setValueState("Error");
                        // that.byId("inpSalidaZonaPesca").setValueState("Error");
                        if (that.byId("inpSalidaZonaPesca")) {
                            that.byId("inpSalidaZonaPesca").setValueState("Error");
                        }
                        sMensaje += "\nLa fecha de arribo debe ser mayor a la fecha de salida de zona de pesca.";
                    } else {
                        if (!bErrorArribo) {
                            oDPArribo.setValueState(sNone);
                            oTPArribo.setValueState(sNone);
                            that.byId("inpArribo").setValueState("None");
                            if (that.byId("inpSalidaZonaPesca")) {
                                that.byId("inpSalidaZonaPesca").setValueState("None");
                            }
                        }

                        oDPSalidaZonaPesca.setValueState(sNone);
                        oTPSalidaZonaPesca.setValueState(sNone);
                    }

                    if (sMensaje.length) {
                        sap.m.MessageBox.error(sMensaje);
                    }
                }
            },
            */
            /*
            validatesDates: function (oEvent) {
                this.util.validateZonaPesca(oEvent, this);
                this.util.validateZonaPesca2(oEvent, this);
            },
            */
            /*
            validateZonaPesca: function (oEvent, that) {
                var util;
                if (typeof that === "undefined") {
                    that = this;
                    util = this.util;
                } else {
                    util = this;
                }

                if (util.validateDateTime(oEvent)) {
                    var sError = sap.ui.core.ValueState.Error;
                    var sNone = sap.ui.core.ValueState.None;

                    var oDPLlegadaZonaPesca = that._byId("dpLlegadaZonaPesca");
                    var oTPLlegadaZonaPesca = that._byId("tpLlegadaZonaPesa");

                    var oDPZarpe = that._byId("dpZarpe");
                    var oTPZarpe = that._byId("tpZarpe");

                    var oDateLlegada = util.getDateObject(oDPLlegadaZonaPesca, oTPLlegadaZonaPesca, "/", ":");
                    var oDateZarpe = util.getDateObject(oDPZarpe, oTPZarpe, "/", ":");

                    if (oDateLlegada <= oDateZarpe) {
                        oDPLlegadaZonaPesca.setValueState(sError);
                        oTPLlegadaZonaPesca.setValueState(sError);
                        oDPZarpe.setValueState(sError);
                        oTPZarpe.setValueState(sError);
                        that.byId("inpLlegadaZonaPesca").setValueState("Error");
                        that.byId("inpZarpe").setValueState("Error");
                        sap.m.MessageBox.error(
                            "La fecha de llegada a la zona de pesca debe ser mayor a la fecha de zarpe."
                        );
                    } else {
                        oDPLlegadaZonaPesca.setValueState(sNone);
                        oTPLlegadaZonaPesca.setValueState(sNone);
                        oDPZarpe.setValueState(sNone);
                        oTPZarpe.setValueState(sNone);
                        that.byId("inpZarpe").setValueState("None");
                        that.byId("inpLlegadaZonaPesca").setValueState("None");
                    }
                }
            },
            */
            /*
            validateZonaPesca2: function (oEvent, that) {
                var util,
                    sMensaje = "",
                    bSalidaError = false;
                if (typeof that === "undefined") {
                    that = this;
                    util = this.util;
                } else {
                    util = this;
                }

                if (util.validateDateTime(oEvent)) {
                    var sError = sap.ui.core.ValueState.Error;
                    var sNone = sap.ui.core.ValueState.None;

                    var oDPLlegadaZonaPesca = that._byId("dpLlegadaZonaPesca");
                    var oTPLlegadaZonaPesca = that._byId("tpLlegadaZonaPesa");

                    var oDPSalidaZonaPesca = that._byId("dpSalidaPesca");
                    var oTPSalidaZonaPesca = that._byId("tpSalidaPesca");

                    var oDPArribo = that._byId("dpArribo");
                    var oTPArribo = that._byId("tpArribo");

                    var oDateLlegada = util.getDateObject(oDPLlegadaZonaPesca, oTPLlegadaZonaPesca, "/", ":");
                    var oDateSalida = util.getDateObject(oDPSalidaZonaPesca, oTPSalidaZonaPesca, "/", ":");

                    if (oDateLlegada >= oDateSalida) {
                        oDPLlegadaZonaPesca.setValueState(sError);
                        oTPLlegadaZonaPesca.setValueState(sError);
                        oDPSalidaZonaPesca.setValueState(sError);
                        oTPSalidaZonaPesca.setValueState(sError);
                        bSalidaError = true;
                        that.byId("inpLlegadaZonaPesca").setValueState("Error");
                        if (that.byId("inpSalidaZonaPesca")) {
                            that.byId("inpSalidaZonaPesca").setValueState("Error");
                        }
                        sMensaje = "La fecha de salida a la zona de pesca debe ser mayor a la fecha de llegada.";
                    } else {
                        oDPLlegadaZonaPesca.setValueState(sNone);
                        oTPLlegadaZonaPesca.setValueState(sNone);
                        oDPSalidaZonaPesca.setValueState(sNone);
                        oTPSalidaZonaPesca.setValueState(sNone);
                        that.byId("inpLlegadaZonaPesca").setValueState("None");
                        // that.byId("inpSalidaZonaPesca").setValueState("None");
                        if (that.byId("inpSalidaZonaPesca")) {
                            that.byId("inpSalidaZonaPesca").setValueState("None");
                        }
                    }

                    var oDateArribo = util.getDateObject(oDPArribo, oTPArribo, "/", ":");

                    if (oDateArribo <= oDateSalida) {
                        oDPArribo.setValueState(sError);
                        oTPArribo.setValueState(sError);
                        oDPSalidaZonaPesca.setValueState(sError);
                        oTPSalidaZonaPesca.setValueState(sError);
                        that.byId("inpArribo").setValueState("Error");
                        // that.byId("inpSalidaZonaPesca").setValueState("Error");
                        if (that.byId("inpSalidaZonaPesca")) {
                            that.byId("inpSalidaZonaPesca").setValueState("Error");
                        }
                        sMensaje += "La fecha de arribo es menor que la fecha de salida de zona de pesca.";
                    } else {
                        oDPArribo.setValueState(sNone);
                        oTPArribo.setValueState(sNone);
                        that.byId("inpArribo").setValueState("None");
                        if (bSalidaError) {
                            oDPSalidaZonaPesca.setValueState(sNone);
                            oTPSalidaZonaPesca.setValueState(sNone);

                            // that.byId("inpSalidaZonaPesca").setValueState("Error");
                            if (that.byId("inpSalidaZonaPesca")) {
                                that.byId("inpSalidaZonaPesca").setValueState("Error");
                            }
                        }
                    }

                    if (sMensaje.length) {
                        sap.m.MessageBox.error(sMensaje);
                    }
                }
            },*/

            //
            getDateObject: function (oDpControl, oTpControl, cDate, cHour) {
                var aDLlegada = oDpControl.getValue().split(cDate);
                var aTLlegada = oTpControl.getValue().split(cHour);

                return new Date(aDLlegada[2], aDLlegada[1] - 1, aDLlegada[0], aTLlegada[0], aTLlegada[1], aTLlegada[2]);
            },

            getDateObjectValue: function (sDate, sTime, cDate, cHour) {
                var aDLlegada = sDate.split(cDate);
                var aTLlegada = sTime.split(cHour);

                return new Date(aDLlegada[2], aDLlegada[1] - 1, aDLlegada[0], aTLlegada[0], aTLlegada[1], aTLlegada[2]);
            },

            getDateObjectValue2: function (sDate, sTime, cDate, cHour) {
                var aDLlegada = sDate.split(cDate);
                var aTLlegada = sTime.split(cHour);

                if (aDLlegada.length != 3 || aTLlegada.length != 3) {
                    // fecha y hora retornada por SAP yyyyMMdd y hhmmss respectivamente
                    var nYear = Number(sDate.substring(0, 4));
                    var nMonth = Number(sDate.substring(4, 6)) - 1;
                    var nDate = Number(sDate.substring(6));
                    var nHours = Number(sTime.substring(0, 2));
                    var nMinutes = Number(sTime.substring(2, 4));
                    var nSeconds = Number(sTime.substring(4));
                    return new Date(nYear, nMonth, nDate, nHours, nMinutes, nSeconds);
                } else {
                    return new Date(
                        aDLlegada[0],
                        aDLlegada[1] - 1,
                        aDLlegada[2],
                        aTLlegada[0],
                        aTLlegada[1],
                        aTLlegada[2]
                    );
                }
            },

            formatDate: function (sDate, sTime) {
                var oReturn = {
                    date: undefined,
                    time: undefined,
                };

                if (sDate && sDate.length === 8) {
                    oReturn.date = sDate.substring(6, 8) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(0, 4);
                }

                if (sTime && sTime.length === 6) {
                    oReturn.time = sTime.substring(0, 2) + ":" + sTime.substring(2, 4) + ":" + sTime.substring(4, 6);
                }

                return oReturn;
            },

            validateDateTime: function (oEvent) {
                var oControl = oEvent.getSource();
                var bValid = oEvent.getParameter("valid");
                //Cam
                if (bValid) {
                    oControl.setValueState(sap.ui.core.ValueState.None);
                } else if (!bValid || oControl.getValue() === "") {
                    oControl.setValueState(sap.ui.core.ValueState.None);
                    //oControl.setValueState(sap.ui.core.ValueState.Error);
                }

                if (oControl.getValueState() === sap.ui.core.ValueState.Error) {
                    return false;
                } else {
                    return true;
                }
            },

            xmlToJson: function (xml) {
                var that = this;
                // Create the return object
                var obj = {};

                if (xml.nodeType == 1) {
                    // element
                    // do attributes
                    if (xml.attributes.length > 0) {
                        obj["@attributes"] = {};
                        for (var j = 0; j < xml.attributes.length; j++) {
                            var attribute = xml.attributes.item(j);
                            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                        }
                    }
                } else if (xml.nodeType == 3) {
                    // text
                    obj = xml.nodeValue;
                }

                // do children
                if (xml.hasChildNodes()) {
                    for (var i = 0; i < xml.childNodes.length; i++) {
                        var item = xml.childNodes.item(i);
                        var nodeName = item.nodeName;
                        if (typeof obj[nodeName] == "undefined") {
                            obj[nodeName] = that.xmlToJson(item);
                        } else {
                            if (typeof obj[nodeName].push == "undefined") {
                                var old = obj[nodeName];
                                obj[nodeName] = [];
                                obj[nodeName].push(old);
                            }
                            obj[nodeName].push(that.xmlToJson(item));
                        }
                    }
                }
                return obj;
            },

            addZeroes: function (num) {
                var value = Number(num);
                var res = num.split(".");
                if (res.length == 1 || res[1].length < 3) {
                    value = value.toFixed(3);
                }
                return value;
            },

            isEmpty: function (obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) return false;
                }

                return JSON.stringify(obj) === JSON.stringify({});
            },

            getDateTime: function (oDate) {
                var oReturn = {
                    date: undefined,
                    time: undefined,
                };

                var sYear = oDate.getFullYear(),
                    sMonth = this.paddZeroes(oDate.getMonth() + 1, 2),
                    sDay = this.paddZeroes(oDate.getDate(), 2),
                    sHour = this.paddZeroes(oDate.getHours(), 2),
                    sMin = this.paddZeroes(oDate.getMinutes(), 2),
                    sSec = this.paddZeroes(oDate.getSeconds(), 2);

                oReturn.date = sDay + "/" + sMonth + "/" + sYear;
                oReturn.time = sHour + ":" + sMin + ":" + sSec;

                return oReturn;
            },

            //Manejo de storage

            saveLocalStorage: function (sId, sValue) {
                jQuery.sap.require("jquery.sap.storage");
                var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
                var sIdentifier = "iflota-" + sId;
                oStorage.put(sIdentifier, sValue);
            },

            readLocalStorage: function (sId) {
                jQuery.sap.require("jquery.sap.storage");
                var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
                var sIdentifier = "iflota-" + sId;
                return oStorage.get(sIdentifier);
            },

            getIndexDB: function () {
                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

                if (!indexedDB) {
                    sap.m.MessageBox.error("No se soporta IndexDB.");
                    return false;
                } else {
                    return indexedDB;
                }
            },

            saveEntity: function (sId, sObject, bUpd) {
                var indexedDB = this.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    //Crando el esquema

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("Entidades", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readwrite");
                        var store = tx.objectStore("Entidades");

                        // Add some data
                        store.put({
                            name: sId,
                            updatable: bUpd,
                            content: sObject,
                        });

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            readEntity: function (sId, bOneWay, that, sEntity) {
                var sService = Models.getService();
                var self = this;
                var sFilter = "";
                // console.log(sId);
                var aEntidad = sId.split("?");
                // console.log(aEntidad);
                if (aEntidad.length > 1) {
                    sId = aEntidad[0];
                    sFilter = "?" + aEntidad[1];
                }

                if (typeof sEntity === "undefined") {
                    sEntity = sId;
                }

                var indexedDB = this.getIndexDB();
                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("Entidades", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readonly");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var getEntidad = store.get(sId);

                        getEntidad.onsuccess = function () {
                            if (getEntidad.result) {
                                that.setJsonModel(JSON.parse(getEntidad.result.content), sId + "Set", bOneWay);
                                that._byId("dpInforme").setBusy(false);
                            } else {
                                if (!sFilter.length) {
                                    that[sId + "Model"].loadData(sService + sEntity + "Set");
                                } else {
                                    that[sId + "Model"].loadData(sService + sEntity + "Set" + sFilter);
                                }
                            }
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            readInformeEntity: function (sId, sFilters, bInit, that) {
                var sService = Models.getService();

                var indexedDB = this.getIndexDB();
                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("Entidades", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readonly");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var getEntidad = store.get(sId);

                        getEntidad.onsuccess = function () {
                            if (getEntidad.result && bInit) {
                                that[sId + "Model"].setData(JSON.parse(getEntidad.result.content));
                                //console.log(JSON.parse(getEntidad.result.content));
                                switch (sId) {
                                    case "Tripulacion":
                                        that.loadInforme.Tripulacion = true;
                                        break;
                                    case "Horometro":
                                        that.loadInforme.Horometro = true;
                                        break;
                                    case "Calas":
                                        that.loadInforme.Calas = true;
                                        //Actualizar footer
                                        var aItems = that._byId("tblCalas").getBinding("items").oList;
                                        var oColumn = that._byId("tblCalas").getColumns()[15];

                                        var fSumTotal = 0;
                                        for (var i = 0; aItems.length > i; i++) {
                                            var fSubSum = parseFloat(aItems[i].Tbode);
                                            if (!isNaN(fSubSum)) {
                                                fSumTotal += fSubSum;
                                            }
                                        }

                                        //console.log(aItems);
                                        oColumn.getFooter().setText(fSumTotal);
                                        break;
                                    case "CompEspecie":
                                        that.loadInforme.CompEspecie = true;
                                        break;
                                    case "MuestreoCala":
                                        that.loadInforme.MuestreoCala = true;
                                        break;
                                    case "LongCalas":
                                        that.loadInforme.LongCalas = true;
                                        break;
                                    case "LogTicket":
                                        that.loadInforme.LogTicket = true;
                                        break;
                                }
                                that.checkLoadInforme();
                            } else {
                                that[sId + "Model"].loadData(sService + sId + "Set" + sFilters);
                            }
                            that[sId + "Model"].refresh();
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            readInforme: function (that) {
                var indexedDB = this.getIndexDB();
                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("Entidades", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readonly");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var getInforme = store.get("InformeFlota");

                        getInforme.onsuccess = function () {
                            if (getInforme.result) {
                                that.onNewInforme();

                                that.getJsonModel("InformeFlota").setData(JSON.parse(getInforme.result.content));

                                that.oInforme = JSON.parse(getInforme.result.content);

                                that.processInformeSelected(that.oInforme, true);

                                if (that.oInforme.Estado === "CRE") {
                                    that._byId("btnEditarInforme").setVisible(true);
                                } else {
                                    that._byId("btnEditarInforme").setVisible(false);
                                }
                                that._byId("btnShowTimes").setVisible(true);

                                // that._byId("itbGeneral").fireSelect();
                                // that._byId("tblCalas").removeAllItems();

                                // Nueva variable para las celdas
                                // var oRecoverCells = that.util.obtenerPlantilla(that.oInforme.Centro, that.oInforme.Especie, that.oInforme.TipoRed, that);

                                //Plantillas de edición para tablas
                                that.rebindTable(
                                    that._byId("tblHorometro"),
                                    "HorometroSet>/d/results",
                                    [],
                                    that.oEditableHorometerTemplate,
                                    "Edit"
                                );

                                that._byId("tblTripulacion").setMode(sap.m.ListMode.Delete);
                                that.rebindTable(
                                    that._byId("tblTripulacion"),
                                    "TripulacionSet>/d/results",
                                    [],
                                    that.oEditableTripTemplate,
                                    "Edit"
                                );

                                that.util.obtenerPlantilla(
                                    that.oInforme.Centro,
                                    that.oInforme.Especie,
                                    that.oInforme.TipoRed,
                                    "Edit",
                                    that
                                );
                                // if (that.oInforme.TipoRed === "03") {
                                //  //Plantilla Calas 2
                                //  that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [], that.oEditCalasPlantilla2, //that.oEditCalasPlantilla2,
                                //      "Edit");

                                // } else if (that.oInforme.TipoRed === "04") {
                                //  //Plantilla Calas 3
                                //  that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [], that.oEditCalasPlantilla3, //that.oEditCalasPlantilla3
                                //      "Edit");
                                // } else {
                                //  //Plantilla Calas 1
                                //  that.rebindTable(that._byId("tblCalas"), "CalasSet>/d/results", [], that.oEditCalasPlantilla1, //that.oEditCalasPlantilla1
                                //      "Edit");
                                // }

                                // Validación para las columnas
                                if (that.oInforme.Especie == "16000002") {
                                    that.util.esconderColumna(true, that);
                                } else {
                                    that.util.esconderColumna(false, that);
                                }

                                that.util.esconderFechayHora(false, that);
                                that.util.setNombreColumna(that);

                                sap.m.MessageToast.show("Informe recuperado.");
                            } else {
                                sap.m.MessageBox.show("No hay informes guardados en borrador.", {
                                    title: "Recuperación de Informe",
                                });
                            }
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            openStorageDialog: function (that) {
                if (!that._configDialog) {
                    that._configDialog = sap.ui.xmlfragment(
                        "Hayduk.InformeDeFlota.view.fragments.dialogs.Storage",
                        that
                    );
                    that.getView().addDependent(that._configDialog);
                }
                that._byId("itbStorage").setSelectedKey("dat");
                that._byId("itbStorage").fireSelect();
                that._configDialog.open();
            },

            onCloseStorageDialog: function (oEvent) {
                this._configDialog.close();
            },

            handleStorageSelect: function (oEvent) {
                var sKey = oEvent.getParameter("key");
                var oStorage = this.getJsonModel("StorageSet").getData();
                var oBinding = this._byId("tblStorage").getBindingInfo("items");
                if (sKey === "inf") {
                    oBinding.filters = new sap.ui.model.Filter({
                        filters: [new Filter("Updatable", sap.ui.model.FilterOperator.EQ, "")],
                        and: true,
                    });

                    //this._byId("titVolumen").setText("Volumen de Datos " + oStorage.TotalInforme + " MB");
                    this._byId("titMaestro").setVisible(false);
                    this._byId("titInforme").setVisible(true);

                    this._byId("btnSincronizar").setVisible(false);
                    this._byId("colAction").setVisible(false);
                    this._byId("txtMensInforme").setVisible(true);
                } else {
                    oBinding.filters = new sap.ui.model.Filter({
                        filters: [new Filter("Updatable", sap.ui.model.FilterOperator.EQ, "X")],
                        and: true,
                    });
                    //this._byId("titVolumen").setText("Volumen de Datos " + oStorage.Total + " MB");
                    this._byId("titMaestro").setVisible(true);
                    this._byId("titInforme").setVisible(false);

                    this._byId("btnSincronizar").setVisible(true);
                    this._byId("colAction").setVisible(true);
                    this._byId("txtMensInforme").setVisible(false);
                }

                this._byId("tblStorage").bindAggregation("items", oBinding);
            },

            deleteEntidad: function (sName, sService, that) {
                var indexedDB = this.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("Entidades", "readwrite");
                        var store = tx.objectStore("Entidades");

                        // Query the data
                        var delOper = store.delete(sName);

                        delOper.onsuccess = function () {
                            that[sName + "Model"].loadData(sService + sName + "Set?$filter=Start eq 1");
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            onSyncEntity: function (oEvent) {
                var that = this;
                var oEntity = oEvent.getSource().getParent().getBindingContext("StorageSet").getObject();
                var sService = Models.getService();
                that.btnSync = oEvent.getSource();

                sap.m.MessageBox.confirm("¿Desea actualizar los datos de: " + oEntity.Entidad + "?", {
                    title: "Actualizar Datos",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            that.btnSync.setVisible(false);

                            if (that._configDialog) {
                                that._configDialog.setBusy(true);
                            }

                            that.allLoadDataMaestraTrue();
                            that.loadDataMaestra[oEntity.Entidad] = false;

                            if (
                                oEntity.Entidad !== "Cliente" &&
                                oEntity.Entidad !== "Emisor" &&
                                oEntity.Entidad !== "Matricula"
                            ) {
                                that[oEntity.Entidad + "Model"].loadData(sService + oEntity.Entidad + "Set");
                            } else {
                                if (oEntity.Entidad === "Cliente") {
                                    that.aClientesMerge = [];
                                }
                                if (oEntity.Entidad === "Emisor") {
                                    that.aEmisorMerge = [];
                                }
                                if (oEntity.Entidad === "Matricula") {
                                    that.aMatriculaMerge = [];
                                }
                                that.util.deleteEntidad(oEntity.Entidad, sService, that);
                                //that[oEntity.Entidad + "Model"].loadData(sService + oEntity.Entidad + "Set?$filter=Start eq 1");
                            }
                        }
                    },
                });
            },

            updStorageInfo: function (aEntidades, that) {
                var oStorageModel = that.getJsonModel("StorageSet");
                var oStorage = oStorageModel.getData();
                oStorage.result = [];
                oStorage.Total = 0;
                oStorage.TotalInforme = 0;
                for (var i = 0; aEntidades.length > i; i++) {
                    var nVolumen = (aEntidades[i].content.length * 2) / 1024 / 1024;
                    oStorage.result.push({
                        Entidad: aEntidades[i].name,
                        Updatable: aEntidades[i].updatable,
                        Volumen: nVolumen.toFixed(5),
                    });
                    if (aEntidades[i].updatable === "X") {
                        oStorage.Total += nVolumen;
                    } else {
                        oStorage.TotalInforme += nVolumen;
                    }
                }

                oStorage.Total = oStorage.Total.toFixed(5);
                oStorage.TotalInforme = oStorage.TotalInforme.toFixed(5);
                oStorageModel.refresh(true);
                that.checkLoadDataMaestra();
            },

            //Búsquedas

            sortObjectArray: function (list, property) {
                function compare(a, b) {
                    if (a[property] < b[property]) return -1;
                    if (a[property] > b[property]) return 1;
                    return 0;
                }

                list.sort(compare);
            },

            deepCloneArray: function (aArray) {
                return JSON.parse(JSON.stringify(aArray));
            },

            binarySearch: function (list, value, property) {
                //this.sortObjectArray(list, property);

                var start = 0;
                var stop = list.length - 1;
                var middle = Math.floor((start + stop) / 2);

                // While the middle is not what we're looking for and the list does not have a single item

                if (list.length > 0) {
                    while (list[middle][property] !== value && start < stop) {
                        if (value < list[middle][property]) {
                            stop = middle - 1;
                        } else {
                            start = middle + 1;
                        }

                        // recalculate middle on every iteration
                        middle = Math.floor((start + stop) / 2);
                        if (middle === -1) {
                            break;
                        }
                    }
                }

                // if the current middle item is what we're looking for return it's index, else return -1
                if (middle === -1) {
                    return -1;
                } else {
                    return list[middle][property] !== value ? -1 : middle;
                }
            },

            findFirstIndex: function (list, value, property) {
                function findFirst(element) {
                    return element[property] == value;
                }
                return list.findIndex(findFirst);
            },

            secuencialSearch: function (list, value, property) {
                var nPos = -1;
                for (var i = 0; list.length > i; i++) {
                    if (list[i][property] === value) {
                        nPos = i;
                        break;
                    }
                }
                return nPos;
            },

            removeDuplicates: function (arr, prop) {
                var obj = {};
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (!obj[arr[i][prop]]) obj[arr[i][prop]] = arr[i];
                }
                var newArr = [];
                for (var key in obj) newArr.push(obj[key]);
                return newArr;
            },

            collectArray: function (list, identifier, propToSum) {
                var newArr = [];
                $.each(list, function (index, element) {
                    if (newArr[element[identifier]] == undefined) newArr[element[identifier]] = 0;
                    newArr[element[identifier]] += element[propToSum];
                });
                return newArr;
            },

            toUpperCase: function (oEvent) {
                var value = oEvent.getParameter("value");
                oEvent.getSource().setValue(value.toUpperCase());
            },

            onlyNumeric: function (oEvent) {
                var regex = /^\d+(\.\d+)?$/;
                if (this.validateNumeric) {
                    this.validateNumeric(oEvent, regex, /[^\d\/./?\d]/g, true);
                } else {
                    this.util.validateNumeric(oEvent, regex, /[^\d\/./?\d]/g, true);
                }
            },
            //Se agrego el metodo para restringir los valores decimales
            onlyNumericDecimal: function (oEvent, iMaxDigInteger, iMaxDigDecimal) {
                var regex = /^\d+(\.\d+)?$/;
                if (this.validateNumeric) {
                    this.validateNumericDecimal(oEvent, regex, /[^\d\/./?\d]/g, true, iMaxDigInteger, iMaxDigDecimal);
                } else {
                    this.util.validateNumericDecimal(
                        oEvent,
                        regex,
                        /[^\d\/./?\d]/g,
                        true,
                        iMaxDigInteger,
                        iMaxDigDecimal
                    );
                }
            },
            validateNumericDecimal: function (oEvent, regex, rgxReplace, bFloat, iMaxDigInteger, iMaxDigDecimal) {
                var value = oEvent.getParameter("value");
                var iPos;

                //  if (!regex.test(value) || value.length <= iMaxDigInteger + iMaxDigDecimal + 1) {
                var iInputValue = value.replace(rgxReplace, "");
                /*  if(iInputValue.charAt(0) === "0"){
                        iInputValue = iInputValue.substr(1);
                  } */
                function remove_character(str, char_pos) {
                    var sPart1 = str.substring(0, char_pos);
                    var sPart2 = str.substring(char_pos + 1, str.length);
                    return sPart1 + sPart2;
                }
                if (iInputValue.indexOf(".") !== iInputValue.lastIndexOf(".")) {
                    var iCantPoint = iInputValue.lastIndexOf(".");
                    iInputValue = iInputValue.substring(0, iCantPoint);
                }

                if (iInputValue.indexOf(".") > 0) {
                    var sInputTemp = iInputValue.split(".")[0];
                    if (sInputTemp.length > iMaxDigInteger) {
                        iInputValue = remove_character(iInputValue, sInputTemp.length - 1);
                    }
                } else {
                    if (iInputValue.length > iMaxDigInteger) {
                        iInputValue = remove_character(iInputValue, iInputValue.length - 1);
                    }
                }

                if (iInputValue.indexOf(".") + 1 < iInputValue.length && iInputValue.indexOf(".") !== -1) {
                    var sInputTemp = iInputValue.split(".")[1];
                    if (sInputTemp.length > iMaxDigDecimal) {
                        iInputValue = remove_character(iInputValue, iInputValue.length - 1);
                    }
                }

                for (var i = 0; iInputValue.length > i; i++) {
                    if (iInputValue.charAt(i) === value.charAt(i)) {
                        continue;
                    } else {
                        iPos = i;
                        break;
                    }
                }
                if (bFloat) {
                    var parts = iInputValue.split(".");

                    if (parts.length > 1) {
                        iInputValue = parts[0] + "." + parts[1];
                    }
                }
                oEvent.getSource().setValue(iInputValue);
                this.setCursorPosition(oEvent.getSource().getId(), iInputValue, iPos);
                //  }
            },
            onlyInteger: function (oEvent) {
                if (this.validateNumeric) {
                    this.validateNumeric(oEvent, /^[0-9]+$/, /[^\d]+/g, false);
                } else {
                    this.util.validateNumeric(oEvent, /^[0-9]+$/, /[^\d]+/g, false);
                }
            },

            validateNumeric: function (oEvent, regex, rgxReplace, bFloat) {
                var value = oEvent.getParameter("value");
                var iPos;

                if (!regex.test(value)) {
                    var iInputValue = value.replace(rgxReplace, "");
                    /*  if(iInputValue.charAt(0) === "0"){
                        iInputValue = iInputValue.substr(1);
                      } */
                    for (var i = 0; iInputValue.length > i; i++) {
                        if (iInputValue.charAt(i) === value.charAt(i)) {
                            continue;
                        } else {
                            iPos = i;
                            break;
                        }
                    }
                    if (bFloat) {
                        var parts = iInputValue.split(".");

                        if (parts.length > 1) {
                            iInputValue = parts[0] + "." + parts[1];
                        }
                    }
                    oEvent.getSource().setValue(iInputValue);
                    this.setCursorPosition(oEvent.getSource().getId(), iInputValue, iPos);
                }
            },

            setCursorPosition: function (id, iInputValue, iPos) {
                $.fn.setCursorPosition = function (pos) {
                    this.each(function (index, elem) {
                        if (elem.setSelectionRange) {
                            elem.setSelectionRange(pos, pos);
                        } else if (elem.createTextRange) {
                            var range = elem.createTextRange();
                            range.collapse(true);
                            range.moveEnd("character", pos);
                            range.moveStart("character", pos);
                            range.select();
                        }
                    });
                    return this;
                };

                if (iPos === undefined) {
                    iPos = iInputValue.length;
                }

                $("input[id^='" + id + "']")
                    .focus()
                    .setCursorPosition(iPos);
            },

            paddZeroes: function (number, size) {
                number = number.toString();
                while (number.length < size) number = "0" + number;
                return number;
            },

            cloneObject: function (obj) {
                if (null === obj || "object" !== typeof obj) return obj;
                var copy = obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                }
                return copy;
            },

            cleanArrays: function (list, property) {
                for (var i in list) {
                    delete list[i][property];
                }
            },

            cleanPropsArray: function (list, aProperties) {
                for (var i in list) {
                    for (var j in aProperties) {
                        list[i][aProperties[j]] = "";
                    }
                }
            },

            detectWhitePropArray: function (list, aProperties) {
                var bWhite = false;
                for (var i in list) {
                    if (this.detectWhiteProperty(list[i], aProperties)) {
                        bWhite = true;
                        break;
                    }
                }
                return bWhite;
            },

            detectWhiteProperty: function (oObject, aProperties) {
                var bWhite = false;

                if (typeof aProperties === "undefined") {
                    for (var key in oObject) {
                        if (oObject.hasOwnProperty(key)) {
                            if (!oObject[key].length) {
                                bWhite = true;
                                break;
                            }
                        }
                    }
                } else {
                    for (var i in aProperties) {
                        if (!oObject[aProperties[i]].length) {
                            bWhite = true;
                            break;
                        }
                    }
                }

                return bWhite;
            },

            returnWhiteProperties: function (oObject, aProperties, that) {
                var oReturn = {
                    bWhite: false,
                    properties: [],
                };

                for (var i in aProperties) {
                    if (oObject[aProperties[i]] !== undefined) {
                        if (!oObject[aProperties[i]].length) {
                            oReturn.bWhite = true;
                            //console.log(aProperties[i]);
                            oReturn.properties.push(that.oInformeLabels[aProperties[i]]);
                        }
                    }
                    // if (!oObject[aProperties[i]].length) {}
                }
                oReturn.properties.sort();
                return oReturn;
            },

            activarTestButton: function (that) {
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "/services/userapi/attributes",
                    dataType: "json",
                    success: function (data, textStatus, jqXHR) {
                        var user = data.name;
                        console.log(user);
                        if (user !== "testfiori") {
                            that._byId("btnTest").setVisible(true);
                        }
                    },
                });
            },

            iniciarStorage: function () {
                var indexedDB = this.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onupgradeneeded = function () {
                        var db = open.result;

                        db.createObjectStore("Entidades", {
                            keyPath: "name",
                        });

                        db.createObjectStore("ColaOperaciones", {
                            keyPath: "name",
                        });
                    };
                }
            },

            //Cola de operaciones
            /* 
               Para operaciones de creación se consideran aquellas que no tienen número de informe
               en esos casos se crea un objeto de creación "Creación", solo se admite una operación
               de este tipo en la cola.
               
               Las modificaciones se identifican ya que existe número de informe, en este caso se 
               guardan por dicho número. Si llega otra operación con un mismo número esta sobrescribe
               a la anterior que posee el mismo identificador.
            */
            saveObjectCola: function (oObject, sNumero, that) {
                var indexedDB = this.getIndexDB();
                var type = oObject.Operacion;

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    //Crando el esquema

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("ColaOperaciones", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("ColaOperaciones", "readwrite");
                        var store = tx.objectStore("ColaOperaciones");

                        if (!sNumero.length) {
                            sNumero = "Creacion";
                        }

                        var sObject = JSON.stringify(oObject);

                        // Add some data
                        store.put({
                            name: sNumero,
                            type: type,
                            datetime: new Date(),
                            content: sObject,
                        });

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            that.modifyColaCounter();
                            db.close();
                        };
                    };
                }
            },

            // Nueva función mas los archivos (pdf, jpg) - Mejora
            saveObjectColaWithFiles: function (oDocumento, that) {
                var aInformeAux = {};
                var oInforme = {};
                var sNumero = "";
                var indexedDB = this.getIndexDB();
                var type = "";
                var aDocumentos;

                aInformeAux.results = [];
                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    //Crando el esquema
                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("ColaOperaciones", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = async function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("ColaOperaciones", "readwrite");
                        var store = tx.objectStore("ColaOperaciones");

                        oInforme = await that.util.obtenerInforme(store, that);

                        type = oInforme.Operacion;
                        if (oDocumento.length !== undefined) {
                            oInforme.Documentos = oDocumento;
                        } else {
                            aDocumentos = oInforme.Documentos;
                            aDocumentos.push(oDocumento);
                            oInforme.Documentos = aDocumentos;
                        }

                        if (!sNumero.length) {
                            sNumero = "Creacion";
                        }

                        that.setJsonModel(oInforme.Documentos, "Documentos", true);
                        that.getJsonModel("Documentos").refresh(true);
                        var sObject = JSON.stringify(oInforme);

                        // Add some data
                        store.put({
                            name: sNumero,
                            type: type,
                            datetime: new Date(),
                            content: sObject,
                        });

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            that.modifyColaCounter();
                            db.close();
                        };
                    };
                }
            },
            obtenerDocumentosOff: function (that) {
                return new Promise((resolve, reject) => {
                    var indexedDB = this.getIndexDB();

                    if (indexedDB) {
                        var open = indexedDB.open("dbInformeFlota", 1);

                        open.onsuccess = async function () {
                            var db = open.result;
                            var tx = db.transaction("ColaOperaciones", "readwrite");
                            var store = tx.objectStore("ColaOperaciones");
                            var oInforme = await that.util.obtenerInforme(store, that);

                            tx.oncomplete = function () {
                                db.close();
                            };

                            resolve(oInforme.Documentos);
                        };
                    }
                });
            },
            obtenerInforme: function (store, that) {
                return new Promise((resolve, reject) => {
                    var aInformeAux = {};
                    var oInforme = {};
                    var getOperaciones = store.getAll();

                    aInformeAux.results = [];
                    getOperaciones.onsuccess = function () {
                        if (getOperaciones.result.length) {
                            var aOperaciones = getOperaciones.result;
                            for (var i = 0; aOperaciones.length > i; i++) {
                                var oReturn = that.util.getDateTime(aOperaciones[i].datetime);
                                var nVolumen = (aOperaciones[i].content.length * 2) / 1024 / 1024;

                                aInformeAux.results.push({
                                    Id: aOperaciones[i].name,
                                    Date: oReturn.date,
                                    Time: oReturn.time,
                                    Volumen: nVolumen.toFixed(5),
                                    Data: aOperaciones[i].content,
                                });
                            }

                            oInforme = JSON.parse(aInformeAux.results[0].Data);
                            resolve(oInforme);
                        }
                    };
                });
            },

            /*
               Trata de enviar los objectos de la cola hacía el servidor
            */

            excecuteOperations: function (that) {
                var sService = Models.getService();
                var indexedDB = this.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    //Crando el esquema

                    open.onupgradeneeded = function () {
                        var db = open.result;
                        var store = db.createObjectStore("ColaOperaciones", {
                            keyPath: "name",
                        });
                    };

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("ColaOperaciones", "readwrite");
                        var store = tx.objectStore("ColaOperaciones");

                        // Query the data
                        var getOperaciones = store.getAll();

                        getOperaciones.onsuccess = function () {
                            if (getOperaciones.result.length !== 0) {
                                var aOperaciones = getOperaciones.result;

                                // To avoid multiple clicking at save
                                const oSaveButton = that._byId("btnSaveInforme");
                                oSaveButton.setEnabled(false);

                                that.sendInformeDataRecursive("/InformeFlotaDeepSet", 0, aOperaciones, that);
                            }
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            db.close();
                        };
                    };
                }
            },

            deleteOperacion: function (sName, bMessage, that) {
                var indexedDB = this.getIndexDB();

                if (indexedDB) {
                    var open = indexedDB.open("dbInformeFlota", 1);

                    open.onsuccess = function () {
                        // Start a new transaction
                        var db = open.result;
                        var tx = db.transaction("ColaOperaciones", "readwrite");
                        var store = tx.objectStore("ColaOperaciones");

                        // Query the data
                        var delOper = store.delete(sName);

                        delOper.onsuccess = function () {
                            if (bMessage) sap.m.MessageToast.show("Operación eliminada");
                            that.cola.readColaInfo(null, false, that);
                        };

                        // Close the db when the transaction is done
                        tx.oncomplete = function () {
                            that.modifyColaCounter();
                            db.close();
                        };
                    };
                }
            },

            ExcelDateToJSDate: function (serial) {
                var utc_days = Math.floor(serial - 25569);
                var utc_value = utc_days * 86400;
                var date_info = new Date(utc_value * 1000);

                var fractional_day = serial - Math.floor(serial) + 0.0000001;

                var total_seconds = Math.floor(86400 * fractional_day);

                var seconds = total_seconds % 60;

                total_seconds -= seconds;

                var hours = Math.floor(total_seconds / (60 * 60));
                var minutes = Math.floor(total_seconds / 60) % 60;

                return new Date(
                    date_info.getFullYear(),
                    date_info.getMonth(),
                    date_info.getDate() + 1,
                    hours,
                    minutes,
                    seconds
                );
            },

            //Funcion para formatear las fechas
            handleLiveChange: function (oEvent) {
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

                if (bValidate == true) {
                    oEvent.getSource().setValue(DateTime);
                    switch (oEvent.getSource().sId.split("--")[1]) {
                        case "inpZarpe":
                            //this.byId("dpZarpe").setValue(fecha);
                            //this.byId("tpZarpe").setValue(hora);
                            //this.byId("tpZarpe").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaZarpe", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraZarpe", hora);
                            break;

                        case "inpLlegadaZonaPesca":
                            //this.byId("dpLlegadaZonaPesca").setValue(fecha);
                            //this.byId("tpLlegadaZonaPesa").setValue(hora);
                            //this.byId("tpLlegadaZonaPesa").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FecIniZonaPesca", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraIniZonaPesca", hora);
                            break;

                        case "inpSalidaPesca":
                            //this.byId("dpSalidaPesca").setValue(fecha);
                            //this.byId("tpSalidaPesca").setValue(hora);
                            //this.byId("tpSalidaPesca").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FecFinZonaPesca", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraFinZonaPesca", hora);
                            break;
                        case "inpArribo":
                            //this.byId("dpArribo").setValue(fecha);
                            //this.byId("tpArribo").setValue(hora);
                            //this.byId("tpArribo").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaArribo", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraArribo", hora);
                            break;

                        case "inpDescarga":
                            //this.byId("dpDescarga").setValue(fecha);
                            //this.byId("tpDescarga").setValue(hora);
                            //this._byId("tpDescarga").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaIniDesc", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraIniDesc", hora);
                            break;

                        case "inpDescarga2":
                            //this.byId("dpDescarga2").setValue(fecha);
                            //this.byId("tpDescarga2").setValue(hora);
                            //this.byId("tpDescarga2").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaFinDesc", fecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraFinDesc", hora);
                            break;
                    }
                } else {
                    oEvent.getSource().setValue("");
                    switch (oEvent.getSource().sId.split("--")[1]) {
                        case "inpZarpe":
                            //this.byId("dpZarpe").setValue(fecha);
                            //this.byId("tpZarpe").setValue(hora);
                            //this.byId("tpZarpe").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaZarpe", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraZarpe", sHora);
                            break;

                        case "inpLlegadaZonaPesca":
                            //this.byId("dpLlegadaZonaPesca").setValue(fecha);
                            //this.byId("tpLlegadaZonaPesa").setValue(hora);
                            //this.byId("tpLlegadaZonaPesa").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FecIniZonaPesca", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraIniZonaPesca", sHora);
                            break;

                        case "inpSalidaPesca":
                            //this.byId("dpSalidaPesca").setValue(fecha);
                            //this.byId("tpSalidaPesca").setValue(hora);
                            //this.byId("tpSalidaPesca").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FecFinZonaPesca", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraFinZonaPesca", sHora);
                            break;
                        case "inpArribo":
                            //this.byId("dpArribo").setValue(fecha);
                            //this.byId("tpArribo").setValue(hora);
                            //this.byId("tpArribo").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaArribo", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraArribo", sHora);
                            break;

                        case "inpDescarga":
                            //this.byId("dpDescarga").setValue(fecha);
                            //this.byId("tpDescarga").setValue(hora);
                            //this._byId("tpDescarga").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaIniDesc", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraIniDesc", sHora);
                            break;

                        case "inpDescarga2":
                            //this.byId("dpDescarga2").setValue(fecha);
                            //this.byId("tpDescarga2").setValue(hora);
                            //this.byId("tpDescarga2").fireChange(true);
                            this.getJsonModel("InformeFlota").setProperty("/FechaFinDesc", sFecha);
                            this.getJsonModel("InformeFlota").setProperty("/HoraFinDesc", sHora);
                            break;
                    }
                    MessageToast.show("Fecha Ingresada no Valida");
                }
            },

            // Nuevo formato para Calas yyyy-mm-dd a dd/mm/yyyy yyyymmdd
            newFormatDate: function (sDate) {
                var sNewDate = "";
                if (sDate !== "") {
                    sNewDate = sDate.replace(/-/g, "");
                }

                return sNewDate;
            },

            newFormatHour: function (sHour) {
                var sNewHour = "";
                if (sHour !== "") {
                    sNewHour = sHour.replace(/:/g, "");
                }

                return sNewHour;
            },

            // Nuevo formato para Calas yyyymmdd a yyyy-mm-dd y hhmmss a hh:mm:ss
            formatDateAndHour: function (sDate, sTime) {
                var oReturn = {
                    date: sDate,
                    time: sTime,
                };

                if (sDate && sDate.length === 8) {
                    oReturn.date = sDate.substring(0, 4) + "-" + sDate.substring(4, 6) + "-" + sDate.substring(6, 8);
                }

                if (sTime && sTime.length === 6) {
                    oReturn.time = sTime.substring(0, 2) + ":" + sTime.substring(2, 4) + ":" + sTime.substring(4, 6);
                }

                return oReturn;
            },

            // Columna Salmuera
            esconderColumna: function (sModo, that) {
                var oColumns = that._byId("tblCalas").getColumns();
                for (var i = 0, n = oColumns.length; i < n; i++) {
                    if (oColumns[i].getHeader().getText() == "Fecha y Hora Salmuera") {
                        oColumns[i].setVisible(sModo);
                    }
                    if (oColumns[i].getHeader().getText() == "% Juv Anch" && sModo) {
                        oColumns[i].setVisible(false);
                    } else if (oColumns[i].getHeader().getText() == "% Juv Anch" && !sModo) {
                        oColumns[i].setVisible(true);
                    }
                }
            },

            esconderFechayHora: function (sModo, that) {
                var oColumns = that._byId("tblCalas").getColumns();
                for (var i = 0, n = oColumns.length; i < n; i++) {
                    if (
                        oColumns[i].getHeader().getText() == "Fecha Inicio" ||
                        oColumns[i].getHeader().getText() == "Hora Inicio" ||
                        oColumns[i].getHeader().getText() == "Fecha Fin" ||
                        oColumns[i].getHeader().getText() == "Hora Fin" ||
                        oColumns[i].getHeader().getText() == "Fecha Salmuera" ||
                        oColumns[i].getHeader().getText() == "Hora Salmuera"
                    ) {
                        oColumns[i].setVisible(sModo);
                    }
                }
            },

            setNombreColumna: function (that) {
                var oColumns = that._byId("tblCalas").getColumns();
                for (var i = 0, n = oColumns.length; i < n; i++) {
                    if (oColumns[i].getHeader().getText() == "Eficiencia") {
                        oColumns[i].getHeader().setText("% Juv Anch");
                    }
                }
            },

            // Obtener Plantilla
            obtenerPlantilla: function (sCentro, sEspecie, sTipoRed, sModo, that) {
                var numInforme = that.getJsonModel("InformeFlota").getProperty("/Numero");
                // var oModelAddBod = that.getOwnerComponent().getModel("addBod");
                // var oDataAddBod = JSON.parse(oModelAddBod.getJSON());
                var oCentro = sCentro;
                var oEspecie = sEspecie;
                // var plantilla1 = that.getJsonModel("CalasPlantilla1").getData();
                // var oEditCalasPlantilla1 = that.oEditCalasPlantilla1;

                if (!numInforme) {
                    numInforme = "";
                }
                that._byId("pnlCalas").setVisible(true);

                //Columnas
                if (sTipoRed === "03" || sTipoRed == "03") {
                    var oJuvJ12 = $.sap.calPlantilla12.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ13 = $.sap.calPlantilla13.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ2 = $.sap.calPlantilla2.find((oPosition) => oPosition.propertyName === "Efici");

                    if (oJuvJ12 !== undefined) {
                        oJuvJ12.text = "% Juv Anch";
                    }
                    if (oJuvJ13 !== undefined) {
                        oJuvJ13.text = "% Juv Anch";
                    }
                    if (oJuvJ2 !== undefined) {
                        oJuvJ2.text = "% Juv Anch";
                    }
                    //Plantilla Calas 2
                    switch (oEspecie) {
                        case "16000000":
                            that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla12);
                            that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                            break;
                        case "16000002":
                            that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla12);
                            that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                            break;
                        case "16000018":
                            that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla13);
                            that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                            break;
                        case "16000022":
                            that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla12);
                            that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                            break;
                        default:
                            that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla2);
                            that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                            break;
                    }
                } else if (sTipoRed === "04" || sTipoRed == "04") {
                    var oJuvJ14 = $.sap.calPlantilla14.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ15 = $.sap.calPlantilla15.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ3 = $.sap.calPlantilla3.find((oPosition) => oPosition.propertyName === "Efici");

                    if (oJuvJ14 !== undefined) {
                        oJuvJ14.text = "% Juv Anch";
                    }
                    if (oJuvJ15 !== undefined) {
                        oJuvJ15.text = "% Juv Anch";
                    }
                    if (oJuvJ3 !== undefined) {
                        oJuvJ3.text = "% Juv Anch";
                    }
                    //Plantilla Calas 3
                    switch (oEspecie) {
                        case "16000000":
                            that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla14);
                            that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                            break;
                        case "16000002":
                            that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla14);
                            that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                            break;
                        case "16000018":
                            that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla15);
                            that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                            break;
                        case "16000022":
                            that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla14);
                            that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                            break;
                        default:
                            that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla3);
                            that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                            break;
                    }
                } else {
                    var oJuvJ8 = $.sap.calPlantilla8.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ9 = $.sap.calPlantilla9.find((oPosition) => oPosition.propertyName === "Efici");
                    var oJuvJ4 = $.sap.calPlantilla4.find((oPosition) => oPosition.propertyName === "Efici");

                    if (oJuvJ8 !== undefined) {
                        oJuvJ8.text = "% Juv Anch";
                    }
                    if (oJuvJ9 !== undefined) {
                        oJuvJ9.text = "% Juv Anch";
                    }
                    if (oJuvJ4 !== undefined) {
                        oJuvJ4.text = "% Juv Anch";
                    }
                    //Plantilla Calas 1
                    //Agregue una condicional
                    if (oCentro == "H307") {
                        // if (oEspecie === "16000000") {
                        //     oEspecie = "";
                        // }
                        switch (oEspecie) {
                            case "16000000":
                                var oJuvJ8 = $.sap.calPlantilla8.find(
                                    (oPosition) => oPosition.propertyName === "Juven_Anch"
                                );

                                if (oJuvJ8 !== undefined) {
                                    oJuvJ8.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla8);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000002":
                                var oJuvJ8 = $.sap.calPlantilla8.find(
                                    (oPosition) => oPosition.propertyName === "Juven_Anch"
                                );

                                if (oJuvJ8 !== undefined) {
                                    oJuvJ8.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla8);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000018":
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla9);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000022":
                                var oJuvJ8 = $.sap.calPlantilla8.find(
                                    (oPosition) => oPosition.propertyName === "Juven_Anch"
                                );

                                if (oJuvJ8 !== undefined) {
                                    oJuvJ8.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla8);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            default:
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla4);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                        }
                        that.oper.esconderColumnaEspecifica("Bod. Tunel", false, that);
                        that.oper.esconderColumnaEspecifica("Bod. Popa", false, that);
                    } else if (oCentro == "" && oEspecie == "16000002") {
                        var oJuvJ10 = $.sap.calPlantilla10.find((oPosition) => oPosition.propertyName === "Efici");
                        if (oJuvJ10 !== undefined) {
                            oJuvJ10.text = "% Juv Anch";
                        }
                        that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla10);
                        that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    } else {
                        if (oEspecie === "16000000") {
                            oEspecie = "";
                        }
                        switch (oEspecie) {
                            case "16000000":
                                var oJuvJ6 = $.sap.calPlantilla6.find(
                                    (oPosition) => oPosition.propertyName === "Juven_Anch"
                                );

                                if (oJuvJ6 !== undefined) {
                                    oJuvJ6.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla6);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000002":
                                var oJuvJ10 = $.sap.calPlantilla10.find(
                                    (oPosition) => oPosition.propertyName === "Efici"
                                );
                                if (oJuvJ10 !== undefined) {
                                    oJuvJ10.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla10);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000018":
                                var oJuvJ = $.sap.calPlantilla7.find(
                                        (oPosition) => oPosition.propertyName === "Juven_Anch"
                                    ),
                                    oJuvC = $.sap.calPlantilla7.find(
                                        (oPosition) => oPosition.propertyName === "Juven_Jure"
                                    );

                                if (oJuvJ !== undefined) {
                                    oJuvJ.text = "% Juv J";
                                }
                                if (oJuvC !== undefined) {
                                    oJuvC.text = "% Juv C";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla7);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            case "16000022":
                                var oJuvJ6 = $.sap.calPlantilla6.find(
                                    (oPosition) => oPosition.propertyName === "Efici"
                                );
                                if (oJuvJ6 !== undefined) {
                                    oJuvJ6.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla6);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                            default:
                                var oJuvJ1 = $.sap.calPlantilla1.find(
                                    (oPosition) => oPosition.propertyName === "Juven_Anch"
                                );
                                if (oJuvJ1 !== undefined) {
                                    oJuvJ1.text = "% Juv Anch";
                                }
                                that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla1);
                                that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                                break;
                        }
                    }
                }

                //Celdas
                // if (that.getJsonModel("Configuracion").getProperty("/Editable")) {
                if (sTipoRed === "03" || sTipoRed === "03") {
                    //Plantilla Calas 2
                    switch (oEspecie) {
                        case "16000000":
                            that.util.setModoCeldas($.sap.editPlantilla12, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla12,
                                sModo
                            );
                            break;
                        case "16000002":
                            that.util.setModoCeldas($.sap.editPlantilla12, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla12,
                                sModo
                            );
                            break;
                        case "16000018":
                            that.util.setModoCeldas($.sap.editPlantilla13, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla13,
                                sModo
                            );
                            break;
                        case "16000022":
                            that.util.setModoCeldas($.sap.editPlantilla12, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla12,
                                sModo
                            );
                            break;
                        default:
                            that.util.setModoCeldas($.sap.editPlantilla2, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla2,
                                sModo
                            );
                            break;
                    }
                } else if (sTipoRed === "04" || sTipoRed === "04") {
                    //Plantilla Calas 3
                    switch (oEspecie) {
                        case "16000000":
                            that.util.setModoCeldas($.sap.editPlantilla14, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla14,
                                sModo
                            );
                            break;
                        case "16000002":
                            that.util.setModoCeldas($.sap.editPlantilla14, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla14,
                                sModo
                            );
                            break;
                        case "16000018":
                            that.util.setModoCeldas($.sap.editPlantilla15, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla15,
                                sModo
                            );
                            break;
                        case "16000022":
                            that.util.setModoCeldas($.sap.editPlantilla14, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla14,
                                sModo
                            );
                            break;
                        default:
                            that.util.setModoCeldas($.sap.editPlantilla3, sModo);
                            that.rebindTable(
                                that._byId("tblCalas"),
                                "CalasSet>/d/results",
                                [new Filter("Numinf", "EQ", numInforme)],
                                $.sap.editPlantilla3,
                                sModo
                            );
                            break;
                    }
                } else {
                    //Plantilla Calas 1
                    //that.oEditCalasPlantilla1;
                    if (oCentro == "H307") {
                        // if (oEspecie === "16000000") {
                        //     oEspecie = "";
                        // }
                        switch (oEspecie) {
                            case "16000000":
                                that.util.setModoCeldas($.sap.editPlantilla8, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla8,
                                    sModo
                                );
                                break;
                            case "16000002":
                                that.util.setModoCeldas($.sap.editPlantilla8, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla8,
                                    sModo
                                );
                                break;
                            case "16000018":
                                that.util.setModoCeldas($.sap.editPlantilla9, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla9,
                                    sModo
                                );
                                break;
                            case "16000022":
                                that.util.setModoCeldas($.sap.editPlantilla8, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla8,
                                    sModo
                                );
                                break;
                            default:
                                that.util.setModoCeldas($.sap.editPlantilla4, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla4,
                                    sModo
                                );
                                break;
                        }
                    } else if (oCentro == "" && oEspecie == "16000002") {
                        that.util.setModoCeldas($.sap.editPlantilla10, sModo);
                        that.rebindTable(
                            that._byId("tblCalas"),
                            "CalasSet>/d/results",
                            [new Filter("Numinf", "EQ", numInforme)],
                            $.sap.editPlantilla10,
                            sModo
                        );
                    } else {
                        switch (oEspecie) {
                            case "16000000":
                                that.util.setModoCeldas($.sap.editPlantilla6, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla6,
                                    sModo
                                );
                                break;
                            case "16000002":
                                that.util.setModoCeldas($.sap.editPlantilla10, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla10,
                                    sModo
                                );
                                break;
                            case "16000018":
                                that.util.setModoCeldas($.sap.editPlantilla7, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla7,
                                    sModo
                                );
                                break;
                            case "16000022":
                                that.util.setModoCeldas($.sap.editPlantilla6, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla6,
                                    sModo
                                );
                                break;
                            default:
                                that.util.setModoCeldas($.sap.editPlantilla1, sModo);
                                that.rebindTable(
                                    that._byId("tblCalas"),
                                    "CalasSet>/d/results",
                                    [new Filter("Numinf", "EQ", numInforme)],
                                    $.sap.editPlantilla1,
                                    sModo
                                );
                                break;
                        }
                    }
                }
                // }

                //Ocultar columnas para la especie 16000002
                if (oEspecie == "16000002") {
                    that.oper.esconderColumna(true, that);
                } else {
                    that.oper.esconderColumna(false, that);
                }

                that.oper.esconderFechayHora(false, that);
                //Setear ancho a las columnas
                var aColumnasWidht = [
                    { nombre: "Fondo", ancho: "100px" },
                    { nombre: "TSM", ancho: "100px" },
                    { nombre: "Profundidad", ancho: "100px" },
                    { nombre: "Bod 1", ancho: "73px" },
                    { nombre: "Bod 2", ancho: "75px" },
                    { nombre: "Bod 3", ancho: "75px" },
                    { nombre: "Bod 4", ancho: "75px" },
                    { nombre: "Bod 5", ancho: "75px" },
                    { nombre: "Bod 6", ancho: "75px" },
                    { nombre: "Bod 7", ancho: "75px" },
                    { nombre: "Bod 8", ancho: "75px" },
                    { nombre: "Bod. Total", ancho: "90px" },
                    { nombre: "Bod. Proa", ancho: "90px" },
                    { nombre: "Bod. Tunel", ancho: "90px" },
                    { nombre: "Bod. Popa", ancho: "90px" },
                    { nombre: "% Juv J", ancho: "90px" },
                    { nombre: "% Juv C", ancho: "90px" },
                    { nombre: "LONG °", ancho: "65px" },
                ];
                that.oper.setWithColumna(aColumnasWidht, that);
            },
            crearPlantillas: function (that) {
                var oModelAddBod = that.getOwnerComponent().getModel("addBod");
                var numInforme = that.getJsonModel("InformeFlota").getProperty("/Numero");
                var oDataAddBod = JSON.parse(oModelAddBod.getJSON());
                var plantilla1 = that.getJsonModel("CalasPlantilla1").getData();
                var oEditCalasPlantilla1 = that.oEditCalasPlantilla1;
                if (!oEditCalasPlantilla1.mAggregations.cells) oEditCalasPlantilla1.mAggregations.cells = [];

                if ($.sap.calPlantilla4.length == 0) {
                    createPlantilla4(plantilla1, oEditCalasPlantilla1, oDataAddBod, that);
                }
                plantilla1 = that.getJsonModel("CalasPlantilla1").getData();
                if ($.sap.calPlantilla5.length == 0) {
                    createPlantilla5(plantilla1, oEditCalasPlantilla1, oDataAddBod, that);
                    createPlantillasExtra(oDataAddBod, that);
                }
                that._byId("pnlCalas").setVisible(false);
                function createPlantilla4(plantilla1, oEditCalasPlantilla1, oDataAddBod, that) {
                    var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;
                    var e = oEditCalasPlantilla1;
                    $.sap.calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));
                    $.sap.editPlantilla1 = $.extend(true, {}, e);
                    console.log($.sap.editPlantilla1);

                    plantilla1[18] = oDataAddBod.Bod1_Extens; //15
                    plantilla1[19] = oDataAddBod.Bod2_Extens; //16
                    plantilla1[20] = oDataAddBod.Bod3_Extens; //17

                    plantilla1.splice(21, 0, oDataAddBod.Bod4_Extens); //18
                    plantilla1.splice(22, 0, oDataAddBod.Bod5_Extens); //19
                    plantilla1.splice(23, 0, oDataAddBod.Bod6_Extens); //20
                    plantilla1.splice(24, 0, oDataAddBod.Bod7_Extens); //21
                    plantilla1.splice(25, 0, oDataAddBod.Bod8_Extens); //22
                    plantilla1.splice(26, 1); //Eliminar duplicado Tunel
                    plantilla1.splice(26, 1); //Eliminar duplicado Popa

                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 104);
                    }

                    $.sap.calPlantilla4 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla4 = $.extend(true, {}, oEditCalasPlantilla1);

                    that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla1);
                    that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla1,
                        "Edit"
                    );
                }

                function createPlantilla5(plantilla1, oEditCalasPlantilla1, oDataAddBod, that) {
                    var e = $.sap.editPlantilla1;
                    var cloneEditPlantilla5 = $.extend(true, 0, e);
                    cloneEditPlantilla5.mAggregations.cells = [];
                    var aCellsEdit = cloneEditPlantilla5.mAggregations.cells;
                    $.sap.calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));

                    plantilla1[18] = oDataAddBod.Bod1_Extens; //15
                    plantilla1[19] = oDataAddBod.Bod2_Extens; //16
                    plantilla1[20] = oDataAddBod.Bod3_Extens; //17
                    plantilla1.splice(21, 1, oDataAddBod.Bod4_Extens); //Remplazar duplicado Tunel por Bod04
                    plantilla1.splice(22, 1, oDataAddBod.Bod5_Extens); //Remplazar duplicado Popa por Bod05

                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 105);
                    }

                    $.sap.calPlantilla5 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla5 = $.extend(true, {}, cloneEditPlantilla5);

                    that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla1);
                    that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        cloneEditPlantilla5,
                        "Edit"
                    );
                }

                function createPlantillasExtra(oDataAddBod, that) {
                    debugger;
                    var plantilla1 = that.getJsonModel("CalasPlantilla1").getData();
                    $.sap.calPlantilla1 = JSON.parse(JSON.stringify(plantilla1));
                    var e = $.sap.editPlantilla1;
                    var oEditCalasPlantilla1 = $.extend(true, {}, e);
                    var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(22, 0, oDataAddBod.Juven_Anch); //19
                    plantilla1.splice(23, 1); //20

                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 106);
                    }

                    //Guardo la Plantilla 6
                    $.sap.calPlantilla6 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla6 = $.extend(true, {}, oEditCalasPlantilla1);

                    var oEditCalasPlantilla1 = $.extend(true, {}, e);
                    var aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(23, 0, oDataAddBod.Juven_Caba); //20
                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 107);
                    }

                    //Guardo La plantilla 7
                    $.sap.calPlantilla7 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla7 = $.extend(true, {}, oEditCalasPlantilla1);

                    //Seteo el modelo de la plantilla1
                    that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla4);
                    that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla4,
                        "Edit"
                    );

                    ////////////////////////////////////////////////////////////////////////////////////////////7
                    plantilla1 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    e = $.sap.editPlantilla4;
                    oEditCalasPlantilla1 = $.extend(true, {}, e);
                    oEditCalasPlantilla1.mAggregations.cells = [];
                    aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(27, 0, oDataAddBod.Juven_Anch); //24
                    plantilla1.splice(28, 1); //25

                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 108);
                    }

                    //Guardo la Plantilla 8
                    $.sap.calPlantilla8 = JSON.parse(JSON.stringify(plantilla1));
                    $.sap.editPlantilla8 = $.extend(true, {}, oEditCalasPlantilla1);

                    oEditCalasPlantilla1 = $.extend(true, {}, e);
                    oEditCalasPlantilla1.mAggregations.cells = [];
                    aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(28, 0, oDataAddBod.Juven_Caba); //25
                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 109);
                    }

                    //Guardo La plantilla 9
                    $.sap.calPlantilla9 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla9 = $.extend(true, {}, oEditCalasPlantilla1);

                    that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla5);
                    that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla5,
                        "Edit"
                    );
                    /////////////////////////////////////////////////////////////////////////////////////77/////////////77
                    plantilla1 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    e = $.sap.editPlantilla5;
                    oEditCalasPlantilla1 = $.extend(true, {}, e);
                    oEditCalasPlantilla1.mAggregations.cells = [];
                    aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(24, 0, oDataAddBod.Juven_Anch); //21
                    plantilla1.splice(25, 1); //22
                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 110);
                    }

                    //Guardo la Plantilla 10
                    $.sap.calPlantilla10 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla10 = $.extend(true, {}, oEditCalasPlantilla1);

                    oEditCalasPlantilla1 = $.extend(true, {}, e);
                    oEditCalasPlantilla1.mAggregations.cells = [];
                    aCellsEdit = oEditCalasPlantilla1.mAggregations.cells;

                    plantilla1.splice(25, 0, oDataAddBod.Juven_Caba); //22
                    for (let o of plantilla1) {
                        that.calas.buildItems(o, aCellsEdit, that, 111);
                    }

                    //Guardo La plantilla 11
                    $.sap.calPlantilla11 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla1").getData()));
                    $.sap.editPlantilla11 = $.extend(true, {}, oEditCalasPlantilla1);

                    that.getJsonModel("CalasPlantilla1").setData($.sap.calPlantilla1);
                    that.calas.bindColumns("CalasPlantilla1>/", that.oColsCalaPlantilla1, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla1,
                        "Edit"
                    );

                    //////////////////////////////////////////77///////////////////////////////////////////////////////////////////////////////////777777

                    var plantilla2 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
                    $.sap.calPlantilla2 = JSON.parse(JSON.stringify(plantilla2));
                    e = that.oEditCalasPlantilla2;
                    $.sap.editPlantilla2 = $.extend(true, {}, e);
                    var oEditCalasPlantilla2 = $.extend(true, {}, e);
                    aCellsEdit = oEditCalasPlantilla2.mAggregations.cells;

                    plantilla2.splice(29, 0, oDataAddBod.Juven_Anch); //26
                    that.calas.buildItems(plantilla2[29], aCellsEdit, that, 4); //26
                    oEditCalasPlantilla2.mAggregations.cells.splice(
                        29,
                        0,
                        oEditCalasPlantilla2.mAggregations.cells[31]
                    ); //26 - 28
                    oEditCalasPlantilla2.removeCell(32); //29

                    plantilla2.splice(30, 1); //27
                    oEditCalasPlantilla2.removeCell(30); //27
                    //Guardo la Plantilla 12
                    $.sap.calPlantilla12 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
                    $.sap.editPlantilla12 = $.extend(true, {}, oEditCalasPlantilla2);

                    plantilla2.splice(30, 0, oDataAddBod.Juven_Caba); //27
                    that.calas.buildItems(plantilla2[30], aCellsEdit, that, 4); //27
                    oEditCalasPlantilla2.mAggregations.cells.splice(
                        30,
                        0,
                        oEditCalasPlantilla2.mAggregations.cells[31]
                    ); //27 - 28
                    oEditCalasPlantilla2.removeCell(32); //29

                    //Guardo La plantilla 13
                    $.sap.calPlantilla13 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla2").getData()));
                    $.sap.editPlantilla13 = $.extend(true, {}, oEditCalasPlantilla2);

                    that.getJsonModel("CalasPlantilla2").setData($.sap.calPlantilla2);
                    that.calas.bindColumns("CalasPlantilla2>/", that.oColsCalaPlantilla2, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla2,
                        "Edit"
                    );

                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    var plantilla3 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
                    $.sap.calPlantilla3 = JSON.parse(JSON.stringify(plantilla3));
                    e = that.oEditCalasPlantilla3;
                    $.sap.editPlantilla3 = $.extend(true, {}, e);
                    var oEditCalasPlantilla3 = $.extend(true, {}, e);
                    aCellsEdit = oEditCalasPlantilla3.mAggregations.cells;

                    plantilla3.splice(27, 0, oDataAddBod.Juven_Anch); //24
                    that.calas.buildItems(plantilla3[27], aCellsEdit, that, 5); //24
                    oEditCalasPlantilla3.mAggregations.cells.splice(
                        27,
                        0,
                        oEditCalasPlantilla3.mAggregations.cells[29]
                    ); //24 - 26
                    oEditCalasPlantilla3.removeCell(30); //27

                    plantilla3.splice(28, 1); //25
                    oEditCalasPlantilla3.removeCell(28); //25

                    //Guardo la Plantilla 14
                    $.sap.calPlantilla14 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
                    $.sap.editPlantilla14 = $.extend(true, {}, oEditCalasPlantilla3);

                    plantilla3.splice(28, 0, oDataAddBod.Juven_Caba); //25
                    that.calas.buildItems(plantilla3[28], aCellsEdit, that, 5); //25
                    oEditCalasPlantilla3.mAggregations.cells.splice(
                        28,
                        0,
                        oEditCalasPlantilla3.mAggregations.cells[29]
                    ); //25 - 26
                    oEditCalasPlantilla3.removeCell(30); //27

                    //Guardo La plantilla 15
                    $.sap.calPlantilla15 = JSON.parse(JSON.stringify(that.getJsonModel("CalasPlantilla3").getData()));
                    $.sap.editPlantilla15 = $.extend(true, {}, oEditCalasPlantilla3);

                    that.getJsonModel("CalasPlantilla3").setData($.sap.calPlantilla3);
                    that.calas.bindColumns("CalasPlantilla3>/", that.oColsCalaPlantilla3, that);
                    that.rebindTable(
                        that._byId("tblCalas"),
                        "CalasSet>/d/results",
                        [new Filter("Numinf", "EQ", numInforme)],
                        $.sap.editPlantilla3,
                        "Edit"
                    );
                }
            },
            setModoCeldas: function (oPlantilla, sModo) {
                var oCells = oPlantilla.getCells(),
                    bModo = false;

                if (sModo == "Edit") {
                    bModo = true;
                }

                for (var i = 0, n = oCells.length; i < n; i++) {
                    if (oCells[i].getId().indexOf("txt") == -1 && oCells[i].getId().indexOf("text") == -1) {
                        oCells[i].setEnabled(bModo);
                    }
                }
            },
        };
    }
);
