exports.mapGrupoOrden = function (obj) {
  let result = {};
  result.fechaActualiza = obj.fechaActualiza;
  result.fechaRegistro = obj.fechaRegistro;
  result.usuarioActualiza = obj.usuarioActualiza;
  result.usuarioRegistro = obj.usuarioRegistro;
  result.activo = obj.activo;

  result.grupoOrdenId = obj.grupoOrdenId;
  result.codigo = obj.codigo;
  result.oSalaPesaje_salaPesajeId = obj.oSalaPesaje_salaPesajeId;

  return result;
};

exports.mapGrupoOrdenBulto = function (obj) {
  let result = {};
  result.fechaActualiza = obj.fechaActualiza;
  result.fechaRegistro = obj.fechaRegistro;
  result.usuarioActualiza = obj.usuarioActualiza;
  result.usuarioRegistro = obj.usuarioRegistro;
  result.activo = obj.activo;

  result.grupoOrdenBultoId = obj.grupoOrdenBultoId;
  result.codigo = obj.codigo;
  result.etiqueta = obj.etiqueta;
  result.bulto = obj.bulto;
  result.cantidad = obj.cantidad;
  result.tara = obj.tara;
  result.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId =
    obj.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId;
  result.oUnidad_iMaestraId = obj.oUnidad_iMaestraId;

  return result;
};

exports.mapGrupoOrdenDetalle = function (obj) {
  let result = {};

  result.fechaActualiza = obj.fechaActualiza;
  result.fechaRegistro = obj.fechaRegistro;
  result.usuarioActualiza = obj.usuarioActualiza;
  result.usuarioRegistro = obj.usuarioRegistro;
  result.activo = obj.activo;

  result.grupoOrdenDetalleId = obj.grupoOrdenDetalleId;
  result.codigo = obj.codigo;
  result.oGrupoOrden_grupoOrdenId = obj.oGrupoOrden_grupoOrdenId;
  result.oOrden_ordenId = obj.oOrden_ordenId;
  return result;
};
