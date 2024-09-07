sap.ui.define([], function () {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    validarNombre: async function (balanzaId, codigo, iSalaId) {
      let sFilter = "";

      if (balanzaId && balanzaId != "" && balanzaId != "0") {
        sFilter += "balanzaId ne '" + balanzaId + "'";
      }

      if (iSalaId && iSalaId != "" && iSalaId != "0") {
        if (sFilter && sFilter != "") {
          sFilter += " and ";
        }
        sFilter += "oSalaPesaje_salaPesajeId eq '" + iSalaId + "'";
      }

      if (codigo && codigo != "") {
        if (sFilter && sFilter != "") {
          sFilter += " and ";
        }
        sFilter += "codigo eq '" + codigo + "'";
      }

      const oParam = {
        urlParameters: {
          $filter: sFilter,
        },
      };

      const aResp = await this.oServiceModel.readAsync("/BALANZA", oParam);
      return aResp.length != 0;
    },
    actualizarBalanza: async function (oBalanza) {
      const bEditar = oBalanza.Editar;
      delete oBalanza.Editar;
      delete oBalanza.oUnidad;
      delete oBalanza.oTipoBalanza;
      delete oBalanza.oPuertoCom;
      delete oBalanza.oSalaPesaje;

      if (bEditar) {
        await this.oServiceModel.updateAsync(
          "/BALANZA('" + oBalanza.balanzaId + "')",
          oBalanza
        );
      } else {
        oBalanza.activo = true;
        await this.oServiceModel.createAsync("/BALANZA", oBalanza);
      }
    },
    obtenerBalanzas: async function (iPlantaId, sSalaPesajeId) {
      let sFilter = "";

      if (iPlantaId && iPlantaId != "" && iPlantaId != "0") {
        sFilter += "oSalaPesaje/oPlanta_iMaestraId eq " + iPlantaId;
      }

      if (sSalaPesajeId && sSalaPesajeId != "" && sSalaPesajeId != "0") {
        if (sFilter && sFilter != "") {
          sFilter += " and ";
        }
        sFilter += "oSalaPesaje_salaPesajeId eq '" + sSalaPesajeId + "'";
      }

      let oParam = {};
      if (sFilter !== "") {
        oParam = {
          urlParameters: {
            $filter: sFilter,
            $expand:
              "oUnidad,oPuertoCom,oTipoBalanza,oSalaPesaje,oSalaPesaje/oPlanta",
          },
        };
      } else {
        oParam = {
          urlParameters: {
            $expand:
              "oUnidad,oPuertoCom,oTipoBalanza,oSalaPesaje,oSalaPesaje/oPlanta",
          },
        };
      }

      const aBalanzas = await this.oServiceModel.readAsync("/BALANZA", oParam);

      return aBalanzas;
    },
  };
});
