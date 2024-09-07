sap.ui.define([
], function () {
	"use strict";
	return {
		oServiceModel: null,
		init: function(oServiceModel){
			this.oServiceModel = oServiceModel
        },
        actualizarImpresora: async function(oImpresora){
            const bEditar = oImpresora.Editar;
            delete oImpresora.Editar;
            delete oImpresora.oPlanta;
            
            if (bEditar){
                await this.oServiceModel.updateAsync("/IMPRESORA('" + oImpresora.impresoraId + "')", oImpresora);
            }else{
                oImpresora.activo = true;
                await this.oServiceModel.createAsync("/IMPRESORA", oImpresora);
            }
        },
		obtenerImpresoras: async function(oFiltro){

            var 
            iPlantaId = oFiltro.plantaId,
            estadoImpresora = oFiltro.estadoImpresora,
            indicadorCp = oFiltro.indicadorCp,
            indicadorPicking = oFiltro.indicadorPicking,
            indicadorEtiqueta = oFiltro.indicadorEtiqueta;

            let sFilter = "";

            if (iPlantaId != "" && iPlantaId != "0" && iPlantaId != undefined){
                sFilter += "oPlanta_iMaestraId eq " + iPlantaId
            }
            if (estadoImpresora != "" && estadoImpresora != "0" && estadoImpresora != undefined){
                if(sFilter != ""){
                    sFilter += " and ";
                }
                sFilter += "estadoImpresora eq " + estadoImpresora
            }
            if (indicadorCp != ""  && indicadorCp != "0" && indicadorCp != undefined){
                if(sFilter != ""){
                    sFilter += " and ";
                }
                sFilter += "indicadorCp eq " + indicadorCp
            }
            if (indicadorPicking != ""  && indicadorPicking != "0" && indicadorPicking != undefined){
                if(sFilter != ""){
                    sFilter += " and ";
                }
                sFilter += "indicadorPicking eq " + indicadorPicking
            }
            if (indicadorEtiqueta != ""  && indicadorEtiqueta != "0" && indicadorEtiqueta != undefined){
                if(sFilter != ""){
                    sFilter += " and ";
                }
                sFilter += "indicadorEtiqueta eq " + indicadorEtiqueta
            }
            
            let oParam = {};
            if (sFilter !== ""){
                oParam = {urlParameters: {
                    "$filter" : sFilter,
                    "$expand" : "oPlanta"
                }};
            }else{
                oParam = {urlParameters: {
                    "$expand" : "oPlanta"
                }};
            }

            const aImpresoras = await this.oServiceModel.readAsync("/IMPRESORA", oParam);
			return aImpresoras;
        }
	};
});