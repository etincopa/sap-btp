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
                "$filter" : "codigo eq '" + id + "'"
            }};

            const aPlantas = await this.oServiceModel.readAsync("/PLANTA", {});

            const aDetalle = await this.oServiceModel.readAsync("/LOG_DETALLE", oParam);

            var oLog = {
                "nombre": "Nombre",
                "direccion": "Dirección",
                "estadoImpresora": "Estado impresora",
                "serie": "Serie",
                "activo": "Estado",
                "indicadorCp": "Central Pesada",
                "indicadorPicking": "Picking",
                "indicadorEtiqueta": "Etiqueta",
                "oPlanta_iMaestraId": "Centro",
                "usuarioActualiza": "Usuario actualiza",
                "usuarioRegistro": "Usuario registro",
                "fechaRegistro": "Fecha registro",
                "fechaActualiza": "Fecha actualiza",
            }

            aDetalle.forEach(element => {
                let oPlanta = null 
                if (element.valorAnterior && element.valorAnterior != "null"){
                    oPlanta = aPlantas.find(d => d.iMaestraId == element.valorAnterior);
                    if (oPlanta){
                        element.valorAnterior = oPlanta.descripcion;
                    }
                }else{
                    element.valorAnterior = "";
                }

                if (element.valorActual && element.valorActual != "null"){
                    oPlanta = aPlantas.find(d => d.iMaestraId == element.valorActual);
                    if (oPlanta){
                        element.valorActual = oPlanta.descripcion;
                    }
                }else{
                    element.valorActual = "";
                }

                element.campo = oLog[element.campo];

                switch(element.campo){
                    case "Picking":
                        element.valorAnterior = (element.valorAnterior == "true" ? "ON" : "OFF");
                        element.valorActual = (element.valorActual == "true" ? "ON" : "OFF");
                        break;
                    case "Etiqueta":
                        element.valorAnterior = (element.valorAnterior == "true" ? "ON" : "OFF");
                        element.valorActual = (element.valorActual == "true" ? "ON" : "OFF");
                        break;
                    case "Estado impresora":
                        element.valorAnterior = (element.valorAnterior == "true" ? "ON" : "OFF");
                        element.valorActual = (element.valorActual == "true" ? "ON" : "OFF");
                        break;
                    case "Central Pesada":
                        element.valorAnterior = (element.valorAnterior == "true" ? "ON" : "OFF");
                        element.valorActual = (element.valorActual == "true" ? "ON" : "OFF");
                        break;
                }
            });

            return aDetalle
        }
           
	};
});