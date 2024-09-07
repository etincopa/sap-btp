sap.ui.define([], function () {
  "use strict";
  return {
    oServiceModel: null,
    init: function (oServiceModel) {
      this.oServiceModel = oServiceModel;
    },
    obtenerLogDetalle: async function (id, self) {
      const oParam = {
        urlParameters: {
          $filter: "codigo eq '" + id + "'",
        },
      };

      const aSalaPesajes = self.getProperty("/SalaPesajesAll");
      const aTipoBalanzas = self.getProperty("/Balanza_TipoBalanzas");
      const aUnidades = self.getProperty("/Balanza_Unidades");
      const aPuertosCom = self.getProperty("/Balanza_PuertosCom");
      const aDetalle = await this.oServiceModel.readAsync(
        "/LOG_DETALLE",
        oParam
      );

      var oLog = {
        codigo: "Código",
        oPlanta_iMaestraId: "Centro",
        serie: "Serie",
        marca: "Marca",
        modelo: "Modelo",
        oUnidad_iMaestraId: "Unidad",
        oTipoBalanza_iMaestraId: "Tipo de Balanza",
        oPuertoCom_iMaestraId: "Puero COM",
        conexion: "Conexión",
        boundRate: "Bound Rate",
        parity: "Parity",
        stopBits: "Stop Bits",
        dataBits: "Data Bits",
        cantidadDecimales: "Cantidad decimales",
        capacidadMinimo: "Capacidad minima",
        capacidadMaximo: "Capacidad maxima",
        tolerancia: "Tolerancia",
        precision: "Precisión",
        activoBalanza: "Estado balanza",
        usuarioActualiza: "Usuario actualiza",
        usuarioRegistro: "Usuario registro",
        fechaRegistro: "Fecha registro",
        fechaActualiza: "Fecha actualiza",
        oSalaPesaje_salaPesajeId: "Sala",
      };

      aDetalle.forEach((element) => {
        let oMaestraData = null;
        if (element.valorAnterior && element.valorAnterior != "null") {
          oMaestraData = aSalaPesajes.find(
            (d) => d.salaPesajeId == element.valorAnterior
          );
          if (oMaestraData) {
            element.valorAnterior = oMaestraData.sala;

            if (oMaestraData.oPlanta) {
              var oPlanta = oMaestraData.oPlanta;
              element.valorAnterior =
                element.valorAnterior + " (" + oPlanta.contenido + ")";
            }
          }
          oMaestraData = aTipoBalanzas.find(
            (d) => d.iMaestraId == element.valorAnterior
          );
          if (oMaestraData) {
            element.valorAnterior = oMaestraData.descripcion;
          }
          oMaestraData = aUnidades.find(
            (d) => d.iMaestraId == element.valorAnterior
          );
          if (oMaestraData) {
            element.valorAnterior = oMaestraData.codigo;
          }
          oMaestraData = aPuertosCom.find(
            (d) => d.iMaestraId == element.valorAnterior
          );
          if (oMaestraData) {
            element.valorAnterior = oMaestraData.descripcion;
          }
        } else {
          element.valorAnterior = "";
        }

        if (element.valorActual && element.valorActual != "null") {
          oMaestraData = aSalaPesajes.find(
            (d) => d.salaPesajeId == element.valorActual
          );
          if (oMaestraData) {
            element.valorActual = oMaestraData.sala;
            if (oMaestraData.oPlanta) {
              var oPlanta = oMaestraData.oPlanta;
              element.valorActual =
                element.valorActual + " (" + oPlanta.contenido + ")";
            }
          }
          oMaestraData = aTipoBalanzas.find(
            (d) => d.iMaestraId == element.valorActual
          );
          if (oMaestraData) {
            element.valorActual = oMaestraData.descripcion;
          }
          oMaestraData = aUnidades.find(
            (d) => d.iMaestraId == element.valorActual
          );
          if (oMaestraData) {
            element.valorActual = oMaestraData.codigo;
          }
          oMaestraData = aPuertosCom.find(
            (d) => d.iMaestraId == element.valorActual
          );
          if (oMaestraData) {
            element.valorActual = oMaestraData.descripcion;
          }
        } else {
          element.valorActual = "";
        }

        element.campo = oLog[element.campo];

        switch (element.campo) {
          case "Conexión":
            element.valorAnterior =
              element.valorAnterior == "true" ? "ON" : "OFF";
            element.valorActual = element.valorActual == "true" ? "ON" : "OFF";
            break;
          case "Estado balanza":
            element.valorAnterior =
              element.valorAnterior == "X" ? "HABILITADO" : "DESHABILITADO";
            element.valorActual =
              element.valorActual == "X" ? "HABILITADO" : "DESHABILITADO";
            break;
        }
      });

      return aDetalle;
    },
  };
});
