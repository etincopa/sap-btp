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
            delete oSala.aProgramacion;
            delete oSala.oEstadoTaraManual;

            if (bEditar){
                await this.oServiceModel.updateAsync("/SALA_PESAJE('" + oSala.salaPesajeId + "')", oSala);
            }else{
                oSala.activo = true;
                await this.oServiceModel.createAsync("/SALA_PESAJE", oSala);

            }
        },
        validarNombre: async function(salaPesajeId, sala){

            const oParam = {urlParameters: {
                "$filter" : "salaPesajeId ne '" + salaPesajeId + "' and sala eq '" + sala + "'"
            }};

            const aSalas = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
			return aSalas.length != 0;
        },
        validarIp: async function(salaPesajeId, sala){

            const oParam = {urlParameters: {
                "$filter" : "salaPesajeId ne '" + salaPesajeId + "' and ipPc eq '" + sala + "'"
            }};

            const aSalas = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
			return aSalas.length != 0;
        },        
		obtenerSalas: async function(iPlantaId){

            let sFilter = "";

            if (iPlantaId != ""){
                sFilter += "oPlanta_iMaestraId eq " + iPlantaId
            }
   
            
            let oParam = {};
            if (sFilter !== ""){
                oParam = {urlParameters: {
                    "$filter" : sFilter,
                    "$expand" : "oPlanta,oEstado"
                }};
            }else{
                oParam = {urlParameters: {
                    "$expand" : "oPlanta,oEstado"
                }};
            }

            const aSalas = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
			return aSalas;
        }
	};
});