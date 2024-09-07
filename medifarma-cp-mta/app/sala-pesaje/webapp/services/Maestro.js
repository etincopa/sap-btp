sap.ui.define([
], function () {
	"use strict";
	return {
		oServiceModel: null,
		init: function(oServiceModel){
			this.oServiceModel = oServiceModel
		},
		obtenerSalaPesajes: async function(iPlantaId){
            let aSalaPesajes = [];

            if (iPlantaId != 0){
                let sFilter = "";
                if(iPlantaId) {
                    sFilter += "oPlanta_iMaestraId eq " + iPlantaId
            
                    var oParam = {
                        urlParameters: {
                            "$filter" : sFilter,
                            "$expand" : "oEstado,oPlanta"
                        }
                    };
                } else {
                    var oParam = {
                        urlParameters: {
                            "$expand" : "oEstado,oPlanta"
                        }
                    };
                }                

                aSalaPesajes = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
                aSalaPesajes = aSalaPesajes.filter(d => d.activo);
            }
 
            aSalaPesajes.splice(0, 0, {salaPesajeId: "", sala: "Seleccionar..."});
            
			return aSalaPesajes;
        },
		obtenerPlantas: async function(){
            const aPlantas = await this.oServiceModel.readAsync("/PLANTA", {});
            aPlantas.sort((a,b) => (a.contenido > b.contenido) ? 1 : ((b.contenido > a.contenido) ? -1 : 0));
            aPlantas.splice(0, 0, {iMaestraId: "", contenido: "Seleccionar..."});
			return aPlantas;
        },
        obtenerEstadosHabilitado: async function(){
            const aEstados = await this.oServiceModel.readAsync("/ESTADO_HABILITADO", {});
			return aEstados;
        }        
	};
});