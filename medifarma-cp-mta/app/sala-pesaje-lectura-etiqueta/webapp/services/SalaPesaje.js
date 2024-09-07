sap.ui.define([
], function () {
	"use strict";
	return {
		oServiceModel: null,
		init: function(oServiceModel){
			this.oServiceModel = oServiceModel
        },
        actualizarSala: async function(oSala){
            const bEditar = oSala.Editar;
            delete oSala.Editar;
            delete oSala.oPlanta;
            delete oSala.oEstado;
            delete oSala.oEstadoLecturaEtiqueta;
            console.log(oSala);
            if (bEditar){
                await this.oServiceModel.updateAsync("/SALA_PESAJE('" + oSala.salaPesajeId + "')", oSala);
            }
        },
		obtenerSalas: async function(iPlantaId){

            let sFilter = "activo eq true";

            if (iPlantaId != ""){
                sFilter += " and oPlanta_iMaestraId eq " + iPlantaId
            }
   
            
            let oParam = {};
            if (sFilter !== ""){
                oParam = {urlParameters: {
                    "$filter" : sFilter,
                    "$expand" : "oPlanta,oEstado,oEstadoLecturaEtiqueta"
                }};
            }else{
                oParam = {urlParameters: {
                    "$expand" : "oPlanta,oEstado,oEstadoLecturaEtiqueta"
                }};
            }

            let aSalas = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
			return aSalas;
        }
	};
});