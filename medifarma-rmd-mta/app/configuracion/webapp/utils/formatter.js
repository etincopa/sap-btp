sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
    "use strict";

    return {
        onGetStateProduction: function (status) {
            if (status === 456) {
                return "PENDIENTE";
            } else if (status === 457 || status === 458) {
                return "ENVIADO";
            } else if (status === 459 || status === 460 || status ===463) {
                return "RECHAZADO";
            } else if (status === 462 || status === 461) {
                return "APROBADO";
            } else {
                return "None";
            }
        },

        onGetState: function (status) {
            if (status === 457 || status === 458) {
                return "Warning";
            } else if (status === 459 || status === 460 || status ===463) {
                return "Error";
            } else if (status === 462 || status === 461) {
                return "Success";
            } else {
                return "None";
            }
        },

        onGetI18nText: function (oThat, sText) {
            return oThat.oView.getModel("i18n") === undefined ? oThat.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText) :
                oThat.oView.getModel("i18n").getResourceBundle().getText(sText);
        },
        
        onFormatDate: function (oDate) {
            if (oDate) {
                return String(oDate.getDate()).padStart(2, 0) + " - " + String(oDate.getMonth() + 1).padStart(2, 0) + " - " + oDate.getFullYear();
            }
        },

        onFormatBool: function (bValue) {
            if (bValue) {
                if (bValue === true) {
                    return "Si"
                } else if (bValue === false) {
                    return "No"
                }
            }
        },

        onFormatToInt: function(sId){
            if(sId){
                return parseInt(sId);
            }
        },

        onFormatRMAsociadas: async function(paso, md){
            let sValor = "";
            return new Promise(function (resolve, reject) {
                this.mainModelv2.read("/MD_ES_PASO", {
                    async: false,
                    filters: [new Filter("pasoId_pasoId", FilterOperator.EQ, paso)],
                    success: function (result) {
                        sValor = (result.results.length).toString();
                        resolve(sValor);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        },

        onFormatterStateProduct: function (sState) {
            let sStateText = "";
            if (sState === "") {
                sStateText = "No Bloqueado";
            } else if (sState === "1") {
                sStateText = "Bloqueado para cada utilización";
            } else if (sState === "2") {
                sStateText = "Bloqueado para aprovisionamiento automático";
            }
            return sStateText;
        },

        onFormatterUndefined: function (oValue) {
            let bResponse = true;
            if (oValue === null) {
                bResponse = false;
            } else if (oValue === undefined) {
                bResponse = false;
            } else if (oValue === "") {
                bResponse = false;
            }
            return bResponse;
        },
        formatterNumber:function(sNumber){
                return new Intl.NumberFormat('en-ES', {style: 'decimal', minimumFractionDigits: 2}).format(sNumber);
        },
        isNotAvailable:function(value){

            let _ = [undefined,null,0,NaN,false,""];
            return _.includes(value);
        },

        onGetStateTableStatus: function (state) {
            let sResponse = "";
            if (state === "En Produccion (Jefe)") {
                sResponse = "Enviado";
            } else if (state === "En Produccion (Gerente)") {
                sResponse = "Aprobado (Jefe)";
            } else {
                sResponse  = state;
            }
            return sResponse;
        },

        formatDateFooter : function (oDate) {
            return (`${
                oDate.getDate().toString().padStart(2, '0')}-${
                (oDate.getMonth()+1).toString().padStart(2, '0')}-${
                oDate.getFullYear().toString().padStart(4, '0')}`);
        },

        formatDateExcel: function (oDate) {
            return (`${
                oDate.getFullYear().toString().padStart(4, '0')}-${
                (oDate.getMonth()+1).toString().padStart(2, '0')}-${
                oDate.getDate().toString().padStart(2, '0')}`);
        },

        formatDateUTC: function (oDate) {
			return (`${
                oDate.getUTCDate().toString().padStart(2, '0')}-${
				(oDate.getUTCMonth()+1).toString().padStart(2, '0')}-${
				oDate.getUTCFullYear().toString().padStart(4, '0')}`);
		},

        formatDecimal : function (nValue) {
            let datoFinal = '';
            if (nValue) {
                let datos = parseFloat(nValue).toFixed(3).toString().split('.'),
                    array = datos[0].toString().split(''),
                    decimales = datos[1],
                    finalDec = '',
                    index = -3;
                while (array.length + index > 0) {
                    array.splice(index, 0, ' ');
                    // Decrement by 4 since we just added another unit to the array.
                    index -= 4;
                }
                if (decimales) {
                    finalDec = '.' + decimales;
                }
                datoFinal = array.join('') + finalDec;
            }
            
            return datoFinal;
        }
    };
});