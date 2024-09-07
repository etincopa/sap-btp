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
 
            aSalaPesajes.sort((a,b) => (a.sala > b.sala) ? 1 : ((b.sala > a.sala) ? -1 : 0));
            aSalaPesajes.splice(0, 0, {salaPesajeId: "", sala: "Seleccionar..."});
            
			return aSalaPesajes;
        },
	};
});