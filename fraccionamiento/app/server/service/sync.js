const core = require("./core");
const daoGrupoOrden = require("../dao/grupoOrden");
const daoConfig = require("../dao/config");
const config = require("../config/config");

exports.syncAll = async function (db) {
  daoConfig.guardarConfiguracion(db, config.getConfig());
  try {
    const o = await core.o();
    /*await core.persistance(o, db, "Maestra?$expand=oMaestraTipo");*/
    await core.persistance(o, db, "PLANTA", "plantaId");
    await core.persistance(
      o,
      db,
      "SALA_PESAJE?$expand=oPlanta,oEstadoPesoManual,oEstadoTaraManual,oEstadoLecturaEtiqueta"
    );
    await core.persistance(o, db, "IMPRESORA");
    await core.persistance(o, db, "GRUPO_ORDEN_ATENCION?$expand=oSalaPesaje");
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");
    await core.persistance(o, db, "ESTADO_ORDEN");
    await core.persistance(o, db, "ESTADO_CONSOLIDADO");
    await core.persistance(o, db, "GRUPO_ORDEN_CONSOLIDADO_DET");

    /*await core.persistance(o, db, "ESTADO_ORDEN");
    await core.persistance(o, db, "ESTADO_CONSOLIDADO");
    await core.persistance(o, db, "GRUPO_ORDEN_ATENCION?$expand=oSalaPesaje");
    await core.persistance(o, db, "GRUPO_ORDEN_DET");
    
    await core.persistance(o, db, "BALANZA?$expand=oUnidad,oPuertoCom");

    
    
    await core.persistance(o, db, "GRUPO_ORDEN_BULTO");
    await core.persistance(o, db, "GRUPO_ORDEN_BULTO_DET");
    await core.persistance(o, db, "TIPO_BULTO");
    await core.persistance(o, db, "UNIDAD");
    await core.persistance(o, db, "VIEW_USER_ROL_APP_ACCION");
    
    await core.persistance(o, db, "VIEW_PEDIDO_ORDEN_CONSOLIDADO");
    await core.persistance(o, db, "VIEW_PEDIDO_CONSOLIDADO");
    await core.persistance(o, db, "FACTOR_CONVERSION");*/

    
  } catch (ex) {
    console.log(ex);
  }
};
