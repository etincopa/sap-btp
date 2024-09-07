const cds = require("@sap/cds");

module.exports = {
  async buildZPL(oParam) {
    var sPlantillaZPL = "";
    const db = await cds.connect.to("db");
    const { PLANTILLA_IMPRESION, COLA_IMPRESION, COLA_IMPRESION_VARIABLES } =
      db.entities("mif.cp");

    const oCola = await SELECT.one.from(COLA_IMPRESION).where({
      colaImpresionId: oParam.colaImpresionId,
    });

    if (oCola) {
      const aVariable = await SELECT.from(COLA_IMPRESION_VARIABLES).where({
        oColaImpresion_colaImpresionId: oParam.colaImpresionId,
      });

      const oPlanitlla = await SELECT.one
        .from(PLANTILLA_IMPRESION)
        .where({
          plantillaImpresionId: oCola.oPlantilla_plantillaImpresionId,
        })
        .columns((A) => {
          A.plantillaImpresionId.as("plantillaImpresionId"),
            A.contenido.as("contenido");
        });

      if (oPlanitlla) {
        sPlantillaZPL = oPlanitlla.contenido;
        aVariable.forEach((o) => {
          sPlantillaZPL = sPlantillaZPL.replaceAll(o.codigo, o.valor);
        });
      }
    }

    return sPlantillaZPL;
  },
};
