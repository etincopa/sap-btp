sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
    "use strict";
    return {
        getUserApi: function () {
            /*	return new Promise(function (resolve) {
                    /*var userModel = new sap.ui.model.json.JSONModel("/services/userapi/attributes?multiValuesAsArrays=true", null, false);
                    userModel.attachRequestCompleted(function () {
                        var oUsuario = this.getData();
                        resolve(oUsuario);
                    });
                    let sUrl = sDestino;
                    let oModel = new JSONModel();
                    oModel.loadData(sUrl, null, true, "GET", false, true);
    
                    oModel.attachRequestCompleted((oRequest) => {
                    if (oRequest.getParameter("success")) {
                        let oData = oModel.getData();
                        resolve(oData);
                    } else {
                        reject("Ocurrio un error al recuperar los datos del usuario");
                    }
                    });
    
                    oModel.attachRequestFailed(() => {
                    reject("error");
                    });
                });*/
        },
        onGetProcesoFilter: function (oThes) {
            return new Promise(function (resolve, reject) {
                oThes.ODataMonitor().read("/ProcesoSet", {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onGetEstadosFilter: function (oThes) {
            return new Promise(function (resolve, reject) {
                oThes.ODataMonitor().read("/EstadoSet", {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onDataEmpleadoFilter: function (oThes, sUserIas) {
            return new Promise(function (resolve, reject) {
                oThes.ODataEntregasRendir().read("/IasSet('" + sUserIas + "')", {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onGetEstadoDocumentos: function (oThes, oFilters) {
            return new Promise(function (resolve, reject) {
                oThes.ODataMonitor().read("/EstadoFinalSet", {
                    headers: oFilters,
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onDeleteDocument: function (oThes, oFilters) {
            return new Promise(function (resolve, reject) {
                var sPath = oThes.ODataMonitor().createKey("EliminaDocumentoSet", {
                    TipoDocu: oFilters.TipoDocu,
                    NroDocumento: oFilters.NroDocumento,
                    Usuario: oFilters.Usuario,
                    NombreApellidos: oFilters.NombreApellidos,
                    Ruc: oFilters.Ruc,
                    IsScp: oFilters.IsScp,
                    MotivoRechazo: "",
                    IdTareaAprobacion: "",
                    WfFinalizado: ""
                });
                oThes.ODataMonitor().read("/" + sPath, {
                    headers: oFilters,
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onGetHistorialDocumento: function (oThes, oFilters) {
            return new Promise(function (resolve, reject) {
                oThes.ODataMonitor().read("/EstadoDetalleSet", {
                    headers: oFilters,
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        onGetHistorialDocumentoFFER: function (oThes, oFilters) {
            return new Promise(function (resolve, reject) {
                oThes.ODataMonitor().read("/FlujoWF_ERPSet", {
                    filters: [
                        new Filter("Bukrs", FilterOperator.EQ, oFilters.Bukrs),
                        new Filter("Belnr", FilterOperator.EQ, oFilters.Belnr),
                        new Filter("Gjahr", FilterOperator.EQ, oFilters.Gjahr),
                        new Filter("ProcesoWf", FilterOperator.EQ, oFilters.ProcesoWf)
                    ],
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
        getAprobadorReglasWfSAP: function (oThes, sociedad, proceso, nivelAprobacion, tablaFiltro, campoFiltro, tablaBuscada, campoBuscado,
            value_) {
            return new Promise(function (resolve, reject) {
                var query = "/zinaprobadoresSet(" +
                    "Bukrs='" + sociedad + "'," +
                    "Prcid='" + proceso + "'," +
                    "Rulid=''," +
                    "Tskid='" + nivelAprobacion + "'," +
                    "Tabname='" + tablaFiltro + "'," +
                    "Fieldname='" + campoFiltro + "'," +
                    "Value='" + value_ + "'," +
                    "Isfound=false," +
                    "TabSearch='" + tablaBuscada + "'," +
                    "FieldSearch='" + campoBuscado + "')/zaprobadoresmultout";
                console.log(query)
                oThes.getOwnerComponent().getModel("oUtilitiesModel").read(query, {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });

            });
        },
        getAprobadoresSAP: function (oThes, o, svalue) {
            var aAprobadores = [];
            var that = this;
            return new Promise(function (resolve, reject) {
                that.getAprobadorReglasWfSAP(oThes, o.sociedad, o.proceso, o.nivel, o.Tabname, o.Fieldname, o.TabSearch, o.FieldSearch,
                    svalue).then(function (res) {
                        if (res.results !== undefined) {
                            if (res.results.length > 0) {
                                res.results.map(function (x) {
                                    aAprobadores.push(x.Low);
                                });
                            }
                        }
                        console.log(aAprobadores)
                        resolve(aAprobadores);
                    }).catch(function (error) {
                        reject(error);
                        jQuery.sap.log.error(error);
                    });
            });
        },

        getAnulacionERFF: function (oThes, o, svalue) {
            return new Promise(function (resolve, reject) {
                var query = "/EstadoFinalSet(Bukrs='" + o.Bukrs + "',IdDocumento='" + o.NroDocumento + "')";
                oThes.ODataMonitor().update(query, o, {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },
    };
});