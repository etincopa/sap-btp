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
            const aEstados = await this.oServiceModel.readAsync("/ESTADO_HABILITADO", {});
            const aDetalle = await this.oServiceModel.readAsync("/LOG_DETALLE", oParam);

            var oLog = {
                "activo": "Estado",
                "sala": "Sala",
                "ipPc": "IP",
                "horaTaraManual": "Hora tara manual",
                "minutPesoManual": "Minuto peso manual",
                "horaLectEtiqueta": "Hora lectura etiqueta",
                "finLectEtiqueta": "Fin lectura etiqueta",
                "finPesoManual": "Fin peso manual",
                "finTaraManual": "Fin tara manual",
                "inicioLectEtiqueta": "Inicio lectura etiqueta",
                "inicioPesoManual": "Inicio peso manual",
                "inicioTaraManual": "Inicio tara manual",
                "oPlanta_iMaestraId": "Centro",
                "oEstado_iMaestraId": "Estado",
                "oEstadoTaraManual_iMaestraId": "Estado tara manual",
                "oEstadoPesoManual_iMaestraId": "Estado peso manual",
                "oEstadoLecturaEtiqueta_iMaestraId": "Estado lectura etiqueta",
                "usuarioActualiza": "Usuario actualiza",
                "usuarioRegistro": "Usuario registro",
                "fechaActualiza": "Fecha actualiza",
                "fechaRegistro": "Fecha registra"
            }
            
            aDetalle.forEach(element => {
                let oMaestraEstado = null 
                if (element.valorAnterior && element.valorAnterior != "null"){
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorAnterior);
                    if (oMaestraEstado){
                        element.valorAnterior = oMaestraEstado.descripcion;
                    }
                    oMaestraEstado = aPlantas.find(d => d.iMaestraId == element.valorAnterior);
                    if (oMaestraEstado){
                        element.valorAnterior = oMaestraEstado.descripcion;
                    }
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorAnterior);
                    if (oMaestraEstado){
                        element.valorAnterior = oMaestraEstado.descripcion;
                    }

                    if (element.campo == "activo"){
                        element.valorAnterior = element.valorAnterior == "true" ? "HABILITADO" : "DESHABILITADO";
                    }
                }else{
                    element.valorAnterior = "";
                }

                if (element.valorActual && element.valorActual != "null"){
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorActual);
                    if (oMaestraEstado){
                        element.valorActual = oMaestraEstado.descripcion;
                    }
                    oMaestraEstado = aPlantas.find(d => d.iMaestraId == element.valorActual);
                    if (oMaestraEstado){
                        element.valorActual = oMaestraEstado.descripcion;
                    }
                    oMaestraEstado = aEstados.find(d => d.iMaestraId == element.valorActual);
                    if (oMaestraEstado){
                        element.valorActual = oMaestraEstado.descripcion;
                    }
                    
                    if (element.campo == "activo"){
                        element.valorActual = element.valorActual == "true" ? "HABILITADO" : "DESHABILITADO";
                    }
                }else{
                    element.valorActual = "";
                }

                element.campo = oLog[element.campo]
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