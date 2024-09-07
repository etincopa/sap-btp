const core = require("./core");
const map = require("../map/map");

exports.guardarGrupoOrden = async function (o, db, oGrupoOrden, aDetalle) {
  let result = {};
  let sUsuario = {};
  try {
    if (oGrupoOrden._id) {
      oGrupoOrden = map.mapGrupoOrden(oGrupoOrden);
      sUsuario = oGrupoOrden.usuarioActualiza;
      await o
        .patch("GRUPO_ORDEN('" + oGrupoOrden.grupoOrdenId + "')", oGrupoOrden)
        .query();
    } else {
      oGrupoOrden = map.mapGrupoOrden(oGrupoOrden);
      sUsuario = oGrupoOrden.usuarioRegistro;
      console.log(oGrupoOrden);
      await o.post("GRUPO_ORDEN", oGrupoOrden).query();
    }

    for await (var detalle of aDetalle) {
      if (detalle._id) {
        detalle = map.mapGrupoOrdenDetalle(detalle);
        await o
          .patch(
            "GRUPO_ORDEN_DET('" + detalle.grupoOrdenDetalleId + "')",
            detalle
          )
          .query();
      } else {
        detalle = map.mapGrupoOrdenDetalle(detalle);
        await o.post("GRUPO_ORDEN_DET", detalle).query();
      }
    }

    await this.generarConsolidado(o, oGrupoOrden.grupoOrdenId, sUsuario);

    //sincronizar data
    await core.persistance(o, db, "GRUPO_ORDEN_ATENCION");
    await core.persistance(o, db, "GRUPO_ORDEN_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_CONSOLIDADO_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");

    result = { iCode: "1", oResult: "1" };
  } catch (ex) {
    console.log(ex);
    result = { iCode: "-1", sError: ex };
  }
  return result;
};

exports.guardarGrupoOrdenBulto = async function (o, db, oGrupoOrdenBulto) {
  let result = {};

  try {
    oGrupoOrden = map.mapGrupoOrdenBulto(oGrupoOrdenBulto);

    await o.post("GRUPO_ORDEN_BULTO", oGrupoOrdenBulto).query();

    //sincronizar data
    await core.persistance(o, db, "GRUPO_ORDEN_BULTO");
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_CONSOLIDADO_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_ATENCION");
    await core.persistance(o, db, "ORDEN?$expand=oEstado");

    result = { iCode: "1", oResult: oGrupoOrdenBulto.grupoOrdenBultoId };
  } catch (ex) {
    console.log(ex);
    result = { iCode: "-1", sError: ex };
  }
  return result;
};

exports.actualizarConsolidado = async function (o, db) {
  let result = {};
  try {
    await core.persistance(o, db, "GRUPO_ORDEN_CONSOLIDADO_DET");
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");

    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }
  return result;
};

exports.actualizarTaraBulto = async function (
  o,
  db,
  sGrupoOrdenFraccionamientoId,
  sGrupoOrdenBultoId,
  fTara,
  sUsuario
) {
  let result = {};
  try {
    await o
      .get(
        "/browse/bultoActualizarTara(grupoOrdenFraccionamientoId='" +
          sGrupoOrdenFraccionamientoId +
          "',grupoOrdenBultoId='" +
          sGrupoOrdenBultoId +
          "',tara=" +
          fTara +
          ",usuario='" +
          sUsuario +
          "')"
      )
      .fetch();
    await core.persistance(o, db, "GRUPO_ORDEN_BULTO");
    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }
  return result;
};

exports.actualizarCantidadFraccion = async function (
  o,
  db,
  sGrupoOrdenFraccionamientoId,
  fCantidad,
  iUnidad,
  bDuplicar,
  sUsuario
) {
  let result = {};
  try {
    await o
      .get(
        "/browse/fraccionActualizarCantidad(grupoOrdenFraccionamientoId='" +
          sGrupoOrdenFraccionamientoId +
          "',cantidad=" +
          fCantidad +
          ",unidad='" +
          iUnidad +
          "',duplicar=" +
          bDuplicar +
          ",usuario='" +
          sUsuario +
          "')"
      )
      .fetch();
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");

    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }
  return result;
};

(exports.eliminarFraccion = async function (
  o,
  db,
  sGrupoOrdenFraccionamientoId,
  sUsuario
) {
  let result = {};
  try {
    const oGrupoOrdenFrac = {
      grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
      activo: false,
      usuarioActualiza: sUsuario,
      fechaActualiza: new Date(),
    };

    await o
      .patch(
        "GRUPO_ORDEN_FRAC('" + sGrupoOrdenFraccionamientoId + "')",
        oGrupoOrdenFrac
      )
      .query();
    await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");

    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }
  return result;
}),
  (exports.actualizarTaraFraccion = async function (
    o,
    db,
    sGrupoOrdenFraccionamientoId,
    fTara
  ) {
    let result = {};
    try {
      const oGrupoOrdenFrac = {
        grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
        tara: fTara,
      };

      await o
        .patch(
          "GRUPO_ORDEN_FRAC('" + sGrupoOrdenFraccionamientoId + "')",
          oGrupoOrdenFrac
        )
        .query();
      await core.persistance(o, db, "GRUPO_ORDEN_FRAC_DET");

      result = { iCode: "1", oResult: "ok" };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }
    return result;
  });

(exports.actualizarBultos = async function (o, db) {
  let result = {};
  try {
    await core.persistance(o, db, "GRUPO_ORDEN_BULTO");

    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }
  return result;
}),
  (exports.generarConsolidado = async function (o, sGrupoOrdenId, sUsuario) {
    let result = {};
    try {
      const response = await o
        .get(
          "/browse/grupoOrdenGenerarConsolidado(grupoOrdenId='" +
            sGrupoOrdenId +
            "',usuario='" +
            sUsuario +
            "')"
        )
        .fetch();
      const data = await response.json();

      result = { iCode: "1", oResult: data };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }

    return result;
  }),
  (exports.actualizarColaImpresion = async function (o, db, oColaImpresion) {
    let result = {};
    try {
      await o.post("COLA_IMPRESION", oColaImpresion).query();

      await core.persistance(o, db, "COLA_IMPRESION");

      result = { iCode: "1", oResult: "ok" };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }
    return result;
  }),
  (exports.obtenerBulto = async function (
    o,
    sPedido,
    sOrden,
    sBulto,
    sGrupoOrdenFraccionamientoId
  ) {
    let result = {};
    try {
      const response = await o
        .get(
          "/browse/obtenerBulto(pedido='" +
            sPedido +
            "',orden='" +
            sOrden +
            "',bulto='" +
            sBulto +
            "',grupoOrdenFraccionamientoId='" +
            sGrupoOrdenFraccionamientoId +
            "')"
        )
        .fetch();
      const data = await response.json();

      result = { iCode: "1", oResult: data };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }

    return result;
  }),
  (exports.fnObtenerBultoQr = async function (
    o,
    IdBulto,
    CodigoInsumo,
    Lote,
    Etiqueta
  ) {
    let result = {};
    try {
      const response = await o
        .get(
          "/browse/fnObtenerBultoQr(IdBulto='" +
            IdBulto +
            "',CodigoInsumo='" +
            CodigoInsumo +
            "',Lote='" +
            Lote +
            "',Etiqueta='" +
            Etiqueta +
            "')"
        )
        .fetch();
      const data = await response.json();

      result = { iCode: "1", oResult: data };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }

    return result;
  }),
  (exports.obtenerBultosERP = async function (o, sPedido) {
    let result = {};
    try {
      const response = await o
        .get("/browse/obtenerBultosEnteros(pedido='" + sPedido + "')")
        .fetch();
      const data = await response.json();

      result = { iCode: "1", oResult: data };
    } catch (ex) {
      result = { iCode: "-1", sError: ex };
    }

    return result;
  });

exports.guardarBultoERP = async function (
  o,
  sIdBulto,
  sPedido,
  sOrden,
  sCentro,
  sTipo,
  sCantidadA,
  sTara,
  sUnidadMedida,
  sUsuarioAten,
  sCantConsumida,
  sNroItem
) {
  let result = {};
  try {
    const response = await o
      .get(
        "/browse/guardarBultoERP(sIdBulto='" +
          sIdBulto +
          "',sPedido='" +
          sPedido +
          "',sOrden='" +
          sOrden +
          "',sCentro='" +
          sCentro +
          "',sTipo='" +
          sTipo +
          "',sCantidadA='" +
          sCantidadA +
          "',sTara='" +
          sTara +
          "',sUnidadMedida='" +
          sUnidadMedida +
          "',sUsuarioAten='" +
          sUsuarioAten +
          "',sCantConsumida='" +
          sCantConsumida +
          "',sNroItem='" +
          sNroItem +
          "')"
      )
      .fetch();
    const data = await response.json();

    result = { iCode: "1", oResult: data };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  return result;
};

exports.imprimirEtiqueta = async function (
  o,
  sGrupoOrdenBultoId,
  sPlantillaImpresionId,
  sImpresoraId,
  sUsuario,
  sBultoIfa
) {
  let result = {};
  try {
    const response = await o
      .get(
        "/browse/fnPrintBultoFraccion(grupoOrdenBultoId='" +
          sGrupoOrdenBultoId +
          "',plantillaImpresionId='" +
          sPlantillaImpresionId +
          "',impresoraId='" +
          sImpresoraId +
          "',usuario='" +
          sUsuario +
          "',bultoIfa='" +
          sBultoIfa +
          "')"
      )
      .fetch();
    const data = await response.json();

    result = { iCode: "1", oResult: data };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  return result;
};

exports.imprimirEtiquetaIdentificacion = async function (
  o,
  sImpresoraId,
  sUsuario,
  sEtiqueta
) {
  let result = {};
  try {
    const response = await o
      .get(
        "/browse/fnPrintIdentificacion(impresoraId='" +
          sImpresoraId +
          "',usuario='" +
          sUsuario +
          "',etiqueta='" +
          sEtiqueta +
          ")"
      )
      .fetch();
    const data = await response.json();

    result = { iCode: "1", oResult: data };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  return result;
};
