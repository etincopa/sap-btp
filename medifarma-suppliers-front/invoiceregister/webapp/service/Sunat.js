sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";
    return {
        iMaxRetryForDocValidation: 100,
        getSunatStatus: function (oData, oThat, iRetry = 0) {
            try {
                let that = this;
                // let oData = that.getJsonData(numRuc, codComp, nroInvoice, fechaEmision, monto, numRucAcreedor);
                return new Promise(function (resolve, reject) {
                    that.consultSunat(oThat, "/sunatApiResponse", oData)
                        .then((iResult) => {
                            console.log("Intento: ", iRetry);
                            resolve(iResult);
                        })
                        .catch((err) => {
                            console.log("Intento: ", iRetry);
                            iRetry++;
                            if (iRetry === that.iMaxRetryForDocValidation) {
                                console.log("Error --- Sunat", err);
                                reject("Error al consultar a Sunat: " + err);
                            } else {
                                return that.getSunatStatus(oData, oThat, iRetry).then((iResult) => {
                                    resolve(iResult);
                                }).catch((err) => {
                                    reject(err);
                                });
                            }
                        });
                });
            } catch (err) {
                return false;
            }
        },
        getJsonData: function (numRuc, codComp, nroInvoice, fechaEmision, monto, numRucAcreedor) {
            codComp = this.tipoDocumento(codComp);

            return {
                "numRuc": numRuc,
                "codComp": codComp,
                "numeroSerie": nroInvoice.split("-")[0],
                "numero": nroInvoice.split("-")[1],
                "fechaEmision": fechaEmision.split("-").reverse().join("/"),
                "monto": monto.toString(),
                "numRucAcreedor": numRucAcreedor
            };
        },
        consultSunat: function (oThat, sPath, aData) {
            try {
                sPath = "odataSunat/api/v1/suppliers" + sPath;
                const sUrl = oThat.getOwnerComponent().getManifestObject().resolveUri(sPath);
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "POST",
                        crossDomain: true,
                        url: sUrl,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        data: JSON.stringify(aData),
                        success: function (data) {
                            if (data.status === "success") {
                                if (data.data.data) {
                                    let d = data.data.data;
                                    if (d.estadoCp && d.estadoCp !== "1") {
                                        resolve(0); // comprobante no válido
                                    } else if (d.estadoCp && d.estadoCp === "1") {
                                        resolve(1); // comprobante válido
                                    } else if (!d.estadoCp) {
                                        // respuesta incorrecta
                                        reject(-1);
                                    }
                                }
                            } else {
                                // error api sunat
                                reject(-1);
                            }
                        },
                        error: function (xhr, status, error) {
                            reject(error);
                        }
                    });
                });
            } catch (err) {
                console.log(err);
            }
        },
        estadoComprobante: function (estadoComprobante) {
            let estado = "";
            switch (estadoComprobante) {
                case "0":
                    estado = "NO EXISTE";
                    break;
                case "1":
                    estado = "ACEPTADO";
                    break;
                case "2":
                    estado = "ANULADO";
                    break;
                case "3":
                    estado = "AUTORIZADO";
                    break;
                case "4":
                    estado = "NO AUTORIZADO";
                    break;
                default: "-"
                    break;
            }
            return estado;
        },
        estadoRuc: function (estadoRuc) {
            let estado = "";
            switch (estadoRuc) {
                case "00":
                    estado = "ACTIVO";
                    break;
                case "01":
                    estado = "ACEPTADBAJA PROVISIONALO";
                    break;
                case "02":
                    estado = "BAJA PROV. POR OFICIO";
                    break;
                case "03":
                    estado = "SUSPENSION TEMPORAL";
                    break;
                case "10":
                    estado = "BAJA DEFINITIVA";
                    break;
                case "11":
                    estado = "BAJA DE OFICIO";
                    break;
                case "22":
                    estado = "INHABILITADO-VENT.UNICA";
                    break;
                default: "-"
                    break;
            }
            return estado;
        },
        estadoDomicilio: function (estadoDomicilio) {
            let estado = "";
            switch (estadoDomicilio) {
                case "00":
                    estado = "HABIDO";
                    break;
                case "09":
                    estado = "PENDIENTE";
                    break;
                case "11":
                    estado = "POR VERIFICAR";
                    break;
                case "12":
                    estado = "NO HABIDO";
                    break;
                case "20":
                    estado = "NO HALLADO";
                    break;
                default: "-"
                    break;
            }
            return estado;
        },
        tipoDocumento: function (tipo) {
            let type = "";
            switch (tipo) {
                case "02":
                    type = "R1"; //Recibo por Honorarios
                    break;
                case "07":
                    type = "07"; //NC
                    break;
                case "01":
                    type = "01"; //Factura
                    break;
                case "08":
                    type = "08"; //ND
                    break;
                default: ""
                    break;
            }
            return type;
        }
    };
});