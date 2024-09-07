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
                "$filter" : "codigo eq '" + id + "' and (campo eq 'oEstadoLecturaEtiqueta_iMaestraId' or campo eq 'finLectEtiqueta')"
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
                    case "oEstadoLecturaEtiqueta_iMaestraId":
                        element.campo = "Estado Lectura Etiqueta"
                        break;
                    case "finLectEtiqueta":
                        element.campo = "Fin Lectura Etiqueta"
                        break;
                    case "inicioLectEtiqueta":
                        element.campo = "Inicio Lectura Etiqueta"
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