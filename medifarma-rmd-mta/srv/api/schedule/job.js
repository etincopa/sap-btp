// asumed we did that before:
const cds = require("@sap/cds");
const moment = require("moment");
const jsonToxlsx = require('./jsontoxslx');
const {createMail} = require('./smtp');
const erpsrv = require("../controllers/erpOdataSrv");

const formatterDays = () => {
  let object = {};
  for (let i = 0; i < 15; i++) {
    object[`dia` + (i + 1)] = moment(new Date()).add(i, "d").tz("America/Lima").format("DD-MM-YYYY");
  }
  return object;
};
const createQuery = async (req) => {
  console.log("wait");
  const serviceExt = await cds.connect.to("Z_PP_NECESIDADESRMD_SRV");
  const serviceRMD = await cds.connect.to("db");
  let { RMD, MAESTRA, MIF_ADMIN_HDI_MAESTRA,VIEW_DESTINATARIOS } = serviceRMD.entities;
  let { OrdenSet, ProduccionVSet, CaracteristicasSet } = serviceExt.entities;
   
  try {
    console.log("run");
    let oFecha = formatterDays();

    let payDestinatarios = [];
    payDestinatarios = await serviceRMD.tx(req).run(SELECT.from`VIEW_DESTINOS`);
    console.log("================")   
    console.log("payDestinatarios ",payDestinatarios.length)
    console.log("================")
    
    //filtramos los correos
    let destinosAddress = [];
    destinosAddress = payDestinatarios.reduce((arr,curr) => arr.concat(curr.CORREO),[]);
    console.log("destinosAddress ", destinosAddress);

    let payPlantas = [];
    payPlantas =await serviceRMD.tx(req).run(SELECT.from`MIF_ADMIN_HDI_MAESTRA`.where`oMaestraTipo_maestraTipoId in (18,54)`);
    
    console.log("================")
    console.log("payPlantas",payPlantas.length)
    console.log("================")

    let sIdRMDAutorizado =  payPlantas.find(payload => payload.codigoSap=="IDESTRMDAUTORIZADO");
    let sCaracteristicaEtapa =  payPlantas.find(payload => payload.codigoSap=="CARACTERISTICAETAPA");
    
    console.log("================")
    console.log("dato",sCaracteristicaEtapa)
    console.log("================")

    let payOrden = [];
    let fechaActual = new Date().toISOString().slice(0,-1);
    let fechaFin = new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0,-1);
    var sFilterP = `?$filter=(Gstrp ge datetime'${fechaActual}' and Gstrp le datetime'${fechaFin}')`;
    console.log(sFilterP);
    payOrden = await erpsrv.getDinamicSet("/OrdenSet" + sFilterP);
    payOrden = payOrden.filter(item => !item.Stats.includes('CTEC'));
    payOrden.forEach(function(oOrd){
      oOrd.Gstrp = new Date(Number((oOrd.Gstrp).split("(")[1].split(")")[0]))
    });
    console.log("================")   
    console.log("payOrden ",payOrden.length)
    console.log("================")

    let payNivel = [];
    var sFilterN = `?$filter=AtinnText eq '${sCaracteristicaEtapa.contenido}'`;
    payNivel = await erpsrv.getDinamicSet("/CaracteristicasSet" + sFilterN);
    console.log("================")
    console.log("payNivel",payNivel.length)
    console.log("================")

    let payMDRecetas = [];
    payMDRecetas = await serviceRMD.tx(req).run(
      `SELECT * from MIF_RMD_MD_RECETA mrmr 
      LEFT JOIN MIF_RMD_MD MD on MD.mdId = mrmr.MDID_MDID 
      LEFT JOIN MIF_RMD_RECETA r on r.recetaId = mrmr.RECETAID_RECETAID
      WHERE mrmr.ACTIVO = true AND MD.ACTIVO = true AND r.ACTIVO = true`);
    console.log("================")
    console.log("payRMD",payMDRecetas.length)
    console.log("================")

    let aOrdenes = [];

    for await (const itemx of payOrden) {
      let bflag = true;
      for await (const element of payMDRecetas) {
        if (element.MDID) {
          if (element.MATNR === itemx.Matnr && element.VERID === itemx.Verid && element.ESTADOIDRMD_IMAESTRAID == sIdRMDAutorizado.contenido){
            bflag = false;
            break;
          }
        }
      }
      if (bflag) {
        aOrdenes.push(itemx);
      }
    }

    console.log("=======");
    console.log("Ordenes con Repetidos", aOrdenes.length);
    let aOrdenesSinRepetir = [];

    aOrdenes.sort(function (a, b) {
      return a.Gstrp - b.Gstrp;
    });

    for await (const v of aOrdenes) {
      let oRepetido = aOrdenesSinRepetir.find((item) => item.Matnr === v.Matnr);

      if (v.Gstrp != null) {
        let dDateFecha = `${
          v.Gstrp.getUTCDate().toString().padStart(2, '0')}-${
          (v.Gstrp.getUTCMonth()+1).toString().padStart(2, '0')}-${
          v.Gstrp.getUTCFullYear().toString().padStart(4, '0')}`;

        if (oFecha.dia1 == dDateFecha) {
          if (oRepetido) {oRepetido.dia1 = true;}
          v.dia1 = true;
        } else if (oFecha.dia2 === dDateFecha) {
          if (oRepetido) {oRepetido.dia2 = true;}
          v.dia2 = true;
        } else if (oFecha.dia3 === dDateFecha) {
          if (oRepetido) {oRepetido.dia3 = true;}
          v.dia3 = true;
        } else if (oFecha.dia4 === dDateFecha) {
          if (oRepetido) {oRepetido.dia4 = true;}
          v.dia4 = true;
        } else if (oFecha.dia5 === dDateFecha) {
          if (oRepetido) {oRepetido.dia5 = true;}
          v.dia5 = true;
        } else if (oFecha.dia6 === dDateFecha) {
          if (oRepetido) {oRepetido.dia6 = true;}
          v.dia6 = true;
        } else if (oFecha.dia7 === dDateFecha) {
          if (oRepetido) {oRepetido.dia7 = true;}
          v.dia7 = true;
        } else if (oFecha.dia8 === dDateFecha) {
          if (oRepetido) {oRepetido.dia8 = true;}
          v.dia8 = true;
        } else if (oFecha.dia9 === dDateFecha) {
          if (oRepetido) {oRepetido.dia9 = true;}
          v.dia9 = true;
        } else if (oFecha.dia10 === dDateFecha) {
          if (oRepetido) {oRepetido.dia10 = true;}
          v.dia10 = true;
        } else if (oFecha.dia11 === dDateFecha) {
          if (oRepetido) {oRepetido.dia11 = true;}
          v.dia11 = true;
        } else if (oFecha.dia12 === dDateFecha) {
          if (oRepetido) {oRepetido.dia12 = true;}
          v.dia12 = true;
        } else if (oFecha.dia13 === dDateFecha) {
          if (oRepetido) {oRepetido.dia13 = true;}
          v.dia13 = true;
        } else if (oFecha.dia14 === dDateFecha) {
          if (oRepetido) {oRepetido.dia14 = true;}
          v.dia14 = true;
        } else if (oFecha.dia15 === dDateFecha) {
          if (oRepetido) {oRepetido.dia15 = true;}
          v.dia15 = true;
        }
      }

      if (!oRepetido) {
        let sNivel = payNivel.find((item) => item.Atwrt.includes(v.Dauat.slice(0,-1)));
        let aReceta = [];

        if (sNivel) {
          var sFilterRS = `?$filter=PrfgF eq '1' and  Matnr eq '${v.Matnr}' and Werks eq '${v.Pwerk}' and Atwrt eq '${sNivel.Atwrt}'`
          aReceta = await erpsrv.getDinamicSet("/ProduccionVSet" + sFilterRS)[0];
        }

        if (aReceta) {
            v.Dispo = aReceta.Dispo;
            v.Dsnam = aReceta.Dsnam;
            v.DispoFlag = true;
        } else {
          v.DispoFlag = false;
        }

        if (payPlantas.length > 0) {
          let oPlanta = payPlantas.find((item) => item.codigo === v.Pwerk);
          if (oPlanta) {
            v.planta = oPlanta.contenido;
          } else {
            v.planta = "";
          }
        }
        aOrdenesSinRepetir.push(v);
      }
    }
    console.log(oFecha);
    
    const bufferData = await jsonToxlsx(aOrdenesSinRepetir,oFecha);
    await createMail(bufferData,destinosAddress);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createQuery,
};
