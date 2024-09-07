const express = require("express");
const app = express();
const auth = require("./service/auth");
const sync = require("./service/sync");
const grupoOrdenService = require("./service/grupoOrden");
const daoCore = require("./dao/core");
const daoConfig = require("./dao/config");
const config = require("./config/config");
const oserver = require("simple-odata-server");
const adapter = require("simple-odata-server-nedb");
const fs = require("fs");
const serviceCore = require("./service/core");
const rootPath = require('electron-root-path').rootPath;
console.log("here");
app.use(express.json());

const db = daoCore.getDb();
const o = serviceCore.o();
let port = null;
let rawMetadata = fs.readFileSync(rootPath + "/app/server/metadata.json");
let model = JSON.parse(rawMetadata);
let buffer = new Array();
var odataServer = oserver()
  .model(model)
  .adapter(
    adapter(function (es, cb) {
      cb(null, db);
    })
  );

daoConfig.guardarConfiguracion(db, config.getConfig());

app.use("/odata/", function (req, res) {
  odataServer.handle(req, res);
});

app.use("/sync", async function (req, res) {
  await sync.syncAll(db);
  res.json({ data: "ok" });
});

app.post("/auth", async function (req, res) {
  const result = await auth.authUsuario(req.body.usuario, req.body.clave);
  res.json(result);
});

app.use("/impresoras", async function (req, res) {
  res.json({ iCode: "1", result: __global.aImpresoras });
});

app.post("/grupoOrden", async function (req, res) {
  const result = await grupoOrdenService.guardarGrupoOrden(
    o,
    db,
    req.body.oGrupoOrden,
    req.body.aDetalle
  );
  res.json(result);
});

app.post("/eliminarGrupoOrdenDet", async function (req, res) {
  const result = await grupoOrdenService.eliminarGrupoOrdenDet(
    o,
    db,
    req.body.oGrupoOrdenDetalle,
    req.body.sUsuario
  );
  res.json(result);
});

app.post("/grupoOrdenBulto", async function (req, res) {
  const result = await grupoOrdenService.guardarGrupoOrdenBulto(
    o,
    db,
    req.body.oGrupoOrdenBulto
  );
  res.json(result);
});

app.post("/actualizarTaraBulto", async function (req, res) {
  const result = await grupoOrdenService.actualizarTaraBulto(
    o,
    db,
    req.body.sGrupoOrdenFraccionamientoId,
    req.body.sGrupoOrdenBultoId,
    req.body.fTara,
    req.body.sUsuario
  );
  res.json(result);
});

app.post("/actualizarCantidadFraccion", async function (req, res) {
  const result = await grupoOrdenService.actualizarCantidadFraccion(
    o,
    db,
    req.body.sGrupoOrdenFraccionamientoId,
    req.body.fCantidad,
    req.body.iUnidad,
    req.body.bDuplicar,
    req.body.sUsuario
  );
  res.json(result);
});

app.post("/eliminarFraccion", async function (req, res) {
  const result = await grupoOrdenService.eliminarFraccion(
    o,
    db,
    req.body.sGrupoOrdenFraccionamientoId,
    req.body.sUsuario
  );
  res.json(result);
});

app.post("/actualizarTaraFraccion", async function (req, res) {
  const result = await grupoOrdenService.actualizarTaraFraccion(
    o,
    db,
    req.body.sGrupoOrdenFraccionamientoId,
    req.body.fTara
  );
  res.json(result);
});

app.post("/actualizarConsolidado", async function (req, res) {
  const result = await grupoOrdenService.actualizarConsolidado(o, db);
  res.json(result);
});

app.post("/actualizarBultos", async function (req, res) {
  const result = await grupoOrdenService.actualizarBultos(o, db);
  res.json(result);
});

app.post("/actualizarColaImpresion", async function (req, res) {
  const result = await grupoOrdenService.actualizarColaImpresion(
    o,
    db,
    req.body.oColaImpresion
  );
  res.json(result);
});

app.post("/actualizarColaImpresionVariable", async function (req, res) {
  const result = await grupoOrdenService.actualizarColaImpresionVariable(o, db);
  res.json(result);
});

app.post("/connectBalanza", async function (req, res) {
  const result = await grupoOrdenService.connectBalanza(
    o,
    req.body.sPort,
    req.body.sBoundRate,
    req.body.sParity,
    req.body.sDataBits,
    req.body.sStopBits,
    req.body.sComando
  );
  res.json(result);
});

app.post("/obtenerBulto", async function (req, res) {
  const result = await grupoOrdenService.obtenerBulto(
    o,
    req.body.sPedido,
    req.body.sOrden,
    req.body.sBulto,
    req.body.sGrupoOrdenFraccionamientoId
  );
  res.json(result);
});

app.post("/fnObtenerBultoQr", async function (req, res) {
  const result = await grupoOrdenService.fnObtenerBultoQr(
    o,
    req.body.IdBulto,
    req.body.CodigoInsumo,
    req.body.Lote,
    req.body.Etiqueta
  );
  res.json(result);
});

app.post("/obtenerBultosEnteros", async function (req, res) {
  const result = await grupoOrdenService.obtenerBultosERP(
    o,
    req.body.sPedido
  );
  res.json(result);
});

app.post("/guardarBultoERP", async function (req, res) {
  const result = await grupoOrdenService.guardarBultoERP(
    o,
    req.body.sIdBulto,
    req.body.sPedido,
    req.body.sOrden,
    req.body.sCentro,
    req.body.sTipo,
    req.body.sCantidadA,
    req.body.sTara,
    req.body.sUnidadMedida,
    req.body.sUsuarioAten,
    req.body.sCantConsumida,
    req.body.sNroItem
  );
  res.json(result);
});

app.post("/imprimirEtiqueta", async function (req, res) {
  const result = await grupoOrdenService.imprimirEtiqueta(
    o,
    req.body.sGrupoOrdenBultoId,
    req.body.sPlantillaImpresionId,
    req.body.sImpresoraId,
    req.body.sUsuario,
    req.body.sBultoIfa
  );
  res.json(result);
});

app.post("/imprimirEtiquetaIdentificacion", async function (req, res) {
  const result = await grupoOrdenService.imprimirEtiquetaIdentificacion(
    o,
    req.body.sImpresoraId,
    req.body.sUsuario,
    req.body.sEtiqueta
  );
  res.json(result);
});

app.use("/detenerPuertoCom", async function (req, res) {
  let result = {};
  try {
    console.log("Detener Puerto");
    port.close();
    result = { iCode: "1", oResult: "ok" };
  } catch (ex) {
    result = { iCode: "-1", sError: ex };
  }

  res.json(result);
});

app.listen(1337, () => {
  console.log("server is running");
});

/*
app.get("/buffer", function(req, res){
    res.json(buffer);
    buffer = [];
});
*/
