sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "mif/rmd/configuracion/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("mif.rmd.configuracion.Component", {

        metadata: {
            manifest: "json",
            config: {
                fullWidth: true
            }
        },

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // set the filter model conf md
            this.setModel(models.crearDataFiltrosModel(), "oDataFilter");

            // set the new rmd model
            this.setModel(models.crearDataRMDModel(), "oDataNewMD");

            // set the filter md estructure model
            this.setModel(models.crearDataFiltrosMdEstructuraModel(), "oDataMdEstructura");

            // set the filter md es paso model
            this.setModel(models.crearDataFiltrosMdEsPasoModel(), "oDataMdEsPaso");

            // set the filter model receta
            this.setModel(models.crearDataFiltrosRecetaModel(), "oDataFilterReceta");

            // set the filter model especificacion
            this.setModel(models.crearDataFormEspecificacionesModel(), "oDataFormEspecificaciones");

            // set the filter model etiqueta
            this.setModel(models.crearDataFiltrosEtiquetaModel(), "oDataFilterEtiqueta");

            // set the filter model equipo/utensilio
            this.setModel(models.crearDataFiltrosEquipoUtensilioModel(), "oDataFilterEquipoUtensilio");

            // set the filter model filtro OP sin RMD
            this.setModel(models.crearDataFiltrosOpSinRmdModel(), "oDataFilterOpSinRmd");

            // set the filter md es paso model
            this.setModel(models.crearDataFiltrosMdEsPasoModel(), "oDataFilterAgrupador");
        }
    });
});
