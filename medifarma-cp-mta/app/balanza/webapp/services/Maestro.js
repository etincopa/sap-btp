sap.ui.define([], function () {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    obtenerSalaPesajes: async function (iPlantaId) {
      let aSalaPesajes = [];
      let aFilter = ["activo eq true"];

      if (iPlantaId != 0) {
        if (iPlantaId) {
          aFilter.push("oPlanta_iMaestraId eq " + iPlantaId);
        }
      }

      var oParam = {
        urlParameters: {
          $filter: aFilter.join(" and "),
          $expand: "oEstado,oPlanta",
          $orderby: "sala desc",
        },
      };

      aSalaPesajes = await this.oServiceModel.readAsync("/SALA_PESAJE", oParam);
      //aSalaPesajes = aSalaPesajes.filter(d => d.activo);
      aSalaPesajes.sort((a, b) =>
        a.sala > b.sala ? 1 : b.sala > a.sala ? -1 : 0
      );
      aSalaPesajes.splice(0, 0, { salaPesajeId: "", sala: "Seleccionar..." });

      return aSalaPesajes;
    },
    obtenerTipoBalanzas: async function () {
      const aTipoBalanzas = await this.oServiceModel.readAsync(
        "/TIPO_BALANZA",
        {}
      );
      aTipoBalanzas.splice(0, 0, {
        iMaestraId: "",
        contenido: "Seleccionar...",
      });

      return aTipoBalanzas;
    },
    obtenerUnidades: async function () {
      let aUnidades = await this.oServiceModel.readAsync("/UNIDAD", {});
      aUnidades = aUnidades.filter((d) => ["KG", "G"].includes(d.codigo));
      aUnidades.splice(0, 0, { iMaestraId: "", contenido: "Seleccionar..." });

      return aUnidades;
    },
    obtenerPuertosCom: async function () {
      const aUnidades = await this.oServiceModel.readAsync("/PUERTO_COM", {});
      aUnidades.splice(0, 0, { iMaestraId: "", contenido: "Seleccionar..." });

      return aUnidades;
    },
  };
});
