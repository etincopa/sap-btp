sap.ui.define([
], function () {
	"use strict";
	return {
		oServiceModel: null,
		init: function(oServiceModel){
			this.oServiceModel = oServiceModel
		},
		obtenerLogDetalle: async function(id){
            const oParam = {urlParameters: {
                "$filter" : "codigo eq '" + id + "' and (campo eq 'oEstadoPesoManual_iMaestraId' or campo eq 'finPesoManual')"
            }};

            const aEstados = await this.oServiceModel.readAsync("/ESTADO_HABILITADO", {});
            const aDetalle = await this.oServiceModel.readAsync("/LOG_DETALLE", oParam);

            aDetalle.forEach(element => {
                let oMaestraEstado = null 
                if (element.valorAnterior && element.valorAnterior != "null"){
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorAnterior);
                    if (oMaestraEstado){
                        element.valorAnterior = oMaestraEstado.descripcion;
                    }
                }else{
                    element.valorAnterior = "";
                }

                if (element.valorActual && element.valorActual != "null"){
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorActual);
                    if (oMaestraEstado){
                        element.valorActual = oMaestraEstado.descripcion;
                    }
                }else{
                    element.valorActual = "";
                }

                switch(element.campo){
                    case "oEstadoPesoManual_iMaestraId":
                        element.campo = "Estado Peso Manual"
                        break;
                    case "finPesoManual":
                        element.campo = "Fin Peso Manual"
                        break;
                    case "inicioPesoManual":
                        element.campo = "Inicio Peso Manual"
                        break;
                }
            });

            return aDetalle
        },
        
        formatoFechaLog: function(date){
            var bValido = new String(date).indexOf("-") > 0;
            if (bValido){
                const oFormat = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "dd/MM/yyyy HH:mm"
                });          
                
                const dFecha = new Date(date) 
                return oFormat.format(dFecha, false);
            }else{
                return date;
            }
        }
	};
});