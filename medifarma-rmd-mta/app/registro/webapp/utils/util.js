sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {
        onGetUUIDV4: function () {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }, 
        onFocusOut: function(oEvent) {
            var sValor, decimales;
            if(oEvent.srcControl) {
                sValor = oEvent.srcControl.getProperty("value");
                decimales = oEvent.srcControl.oParent.oParam.decimales;
                sValor = sValor == "" ? 0 : sValor;
                oEvent.srcControl.setValue(parseFloat(sValor).toFixed(decimales));
            }
        }, 
        onFocusOutRango: function(oEvent) {
            var sValor, decimales;
            if(oEvent.srcControl) {
                sValor = oEvent.srcControl.getProperty("value");
                decimales = oEvent.srcControl.oParent.oParam.decimales;
                sValor = sValor == "" ? 0 : sValor;
                oEvent.srcControl.setValue(parseFloat(sValor).toFixed(decimales));
            }
        },
        getVerificacionFirmas: function (aListVerificacionFirmas, model, that) {
            var aListObjectCase = [];
            var textoVerificado = "";

            aListVerificacionFirmas.results.forEach(eq => {
                var sobjectCase = {}
                sobjectCase.Id = eq.rmdPasoUsuarioId;
                sobjectCase.realizadoPor = eq.rmdEstructuraPasoId ? eq.rmdEstructuraPasoId.realizadoPor : true;
                sobjectCase.supervisadoPor = eq.rmdEstructuraPasoId ? eq.rmdEstructuraPasoId.verifCheck : false;
                sobjectCase.nombres = eq.rmdUsuarioId.nombre;
                sobjectCase.firma = eq.rmdUsuarioId.codigo;
                /* type = tipoId expand
                    calification = viene de sap no hay campo*/
                aListObjectCase.push(sobjectCase);
            });
            if (model) {
                that.modelGeneral.setProperty(model, aListObjectCase);
            }

            return aListObjectCase;
        },
        onUUID: function () {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
        onConvertDateForSap:function(oDate, flagUTC){
            var sDate = "";
            if (flagUTC) {
                var iDay = oDate ? oDate.getUTCDate() : oDate;
            } else {
                var iDay = oDate.getDate();
            }
            var iMonth = oDate.getMonth() + 1;

            var sDay = this.onAddCeros(iDay);
            var sMonth = this.onAddCeros(iMonth);

            var iAnio = oDate.getFullYear();

            sDate = iAnio + "-"+sMonth+"-"+sDay+"T00:00:00";

            return sDate;
        },
        onAddCeros:function(num){
            var sNum = "" + num;
            if(sNum.length === 1){
                sNum = "0"+sNum;
            }
            return sNum;
        },
        getRandomArbitrary: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        getRandomString:function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < 20; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
          }
          
    };
});