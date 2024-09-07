const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports.recordLog = async function(tabla, usuario, codigo, newObj, currentObj){
    const service = await cds.connect.to("db");
    const {
        LOG,
        LOG_DETALLE
      } = service.entities("mif_admin.hdi");

    let oLog = {};

    oLog.logId = uuidv4();
    oLog.tabla = tabla;
    oLog.codigo = codigo;
    oLog.fechaRegistro = new Date();
    oLog.usuarioRegistro = usuario;

    const aLogDetalle = [];
    Object.keys(newObj).forEach(key => {
        if (currentObj[key] !== newObj[key] && key !== "fechaActualiza"){
            let oLogDetalle = {};
            oLogDetalle.detalleId = uuidv4();
            oLogDetalle.campo = key;
            oLogDetalle.tabla = tabla;
            oLogDetalle.codigo = codigo;    
            oLogDetalle.fechaRegistro = new Date();
            oLogDetalle.usuarioRegistro = usuario;                    
            oLogDetalle.valorAnterior = "" + currentObj[key]
            oLogDetalle.valorActual = "" + newObj[key]
            oLogDetalle.oLog_logId = oLog.logId;
            
            aLogDetalle.push(oLogDetalle)
        }
    });
    
    if (aLogDetalle.length != 0){
        await INSERT.into(LOG).entries(oLog);
        await INSERT.into(LOG_DETALLE).entries(aLogDetalle);
    }
}