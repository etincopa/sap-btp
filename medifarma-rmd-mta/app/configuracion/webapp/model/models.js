sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        // Modelo de los filtros de la conf..
        crearDataFiltrosModel: function () {
            var oModel = new JSONModel({
                code: "",
                description: "",
                stageProcess: "",
                productid: "",
                productdesc: "",
                formula: "",
                area: "",
                level: "",
                statusRMD: ""
            });
            return oModel;
        },

        // Modelo de los filtros de la conf..
        crearDataRMDModel: function () {
            var oModel = new JSONModel({
                fechaRegistro: null,
                usuarioRegistro: "",
                fechaActualiza: null,
                usuarioActualiza: "",
                activo: true,
                mdId: "",
                id: "",
                codigo: "",
                version: 1,
                estadoIdRmd_iMaestraId: 467,
                productoId: "",
                descripcion: "",
                nivelId_iMaestraId: "",
                sucursalId_iMaestraId: "",
                fechaSolicitud: null,
                motivoId: "",
                observacion: "",
                estadoIdProceso_iMaestraId: 456,
                fechaAutorizacion: null,
                usuarioAutorizacion: "",
                af: 'NO'
            });
            return oModel;
        },

        // Modelo de los filtros de las estructuras asignadas a un MD.
        crearDataFiltrosMdEstructuraModel: function () {
            var oModel = new JSONModel({
                description: ""
            });
            return oModel;
        },

        // Modelo de los filtros de los pasos a asignar a una estructura.
        crearDataFiltrosMdEsPasoModel: function () {
            var oModel = new JSONModel({
                codigo: "",
                descripcion: "",
                numeracion: true,
                estructuraId_estructuraId: "",
                etiquetaId_etiquetaId: ""
            });
            return oModel;
        },

        // Modelo de los filtros de la receta.
        crearDataFiltrosRecetaModel: function () {
            var oModel = new JSONModel({
                code: "",
                description: "",
                variante: "",
                etapaBase: ""
            });
            return oModel;
        },

        // Modelo del formulario de especificacion.
        crearDataFormEspecificacionesModel: function () {
            var oModel = new JSONModel({
                estructuraId_estructuraId: "",
                mdId_mdId: "",
                ensayoPadreId_iMaestraId: "",
                ensayoHijo: "",
                especificacion: "",
                tipoDatoId_iMaestraId: "",
                valorInicial: null,
                valorFinal: null,
                margen: null,
                decimales: null,
                orden: ""
            });
            return oModel;
        },

        // Modelo de los filtros de las etiquetas para asignar a una estructura de un MD.
        crearDataFiltrosEtiquetaModel: function () {
            var oModel = new JSONModel({
                descripcion: ""
            });
            return oModel;
        },

        // Modelo de los filtros de los equipos y utensilios.
        crearDataFiltrosEquipoUtensilioModel: function () {
            var oModel = new JSONModel({
                equipment: "",
                descript: "",
                abcindic: "",
                txt30: "",
                swerk: ""
            });
            return oModel;
        },

        // Modelo de los filtros de la OP sin RMD.
        crearDataFiltrosOpSinRmdModel: function () {
            var oModel = new JSONModel({
                productoId: "",
                Dispo: false,
                etapa: ""
            });
            return oModel;
        },
    };
});
