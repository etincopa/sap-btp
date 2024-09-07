const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");
const crypto = require("./services/crypto");
const log = require("./log");

const scim = require("./api/controllers/ias-controller");
const erpsrv = require("./api/controllers/erpOdataSrv-controller");

var browser = require("browser-detect");

const {
  MIF_ADMIN_HDI_AUDITORIA,
  SEQUENCE_CUSTOM,
  TIPO_PEDIDO,
  TIPO_PEDIDO_DETALLE,
  GRUPO_ORDEN,
  GRUPO_ORDEN_DET_INSUMO_CONSOLIDADO,
  GRUPO_ORDEN_DET_INSUMO,
  GRUPO_ORDEN_DET,
  GRUPO_ORDEN_CONSOLIDADO,
  GRUPO_ORDEN_FRAC,
  GRUPO_ORDEN_FRAC_DET,
  GRUPO_ORDEN_BULTO,
  ORDEN_FRACCION,
  ORDEN_DETALLE,
  MIF_ADMIN_HDI_MAESTRA_TIPO,
  MIF_ADMIN_HDI_MAESTRA,
  MIF_ADMIN_HDI_USUARIO,
  VIEW_PEDIDO_CONSOLIDADO,
  VIEW_USER_ROL_APP_ACCION,
  SALA_PESAJE,
  PLANTILLA_IMPRESION,
  COLA_IMPRESION,
  IMPRESORA,
  BALANZA,
  COLA_IMPRESION_VARIABLES,
  VIEW_MAESTRA,
} = cds.entities("mif.cp");

module.exports = cds.service.impl(function () {
  this.before(["CREATE", "UPDATE", "DELETE"], async (req) => {
    try {
      const oData = req.data ? JSON.stringify(req.data) : null;
      const aAudit = [];
      const oAudit = {};
      var oBrowser = browser(req.headers["user-agent"]);
      oAudit.applicationName = "CP";
      oAudit.timestamp = new Date();
      oAudit.host = req.getUrlObject().host;
      oAudit.port = null;
      oAudit.serviceName = req.path;
      //oAudit.connectionId = null;
      oAudit.clientHost = req.headers["x-forwarded-host"];
      console.log("req.headers", req.headers);
      oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
      //oAudit.clientPid = null;//req.headers["x-correlation-id"];
      //oAudit.clientPort = null;
      console.log(req.user);
      oAudit.userName = req.user.id;
      oAudit.eventStatus = "Process";
      oAudit.eventLevel = null;
      oAudit.eventAction = req.event;
      oAudit.action = req.event;
      //oAudit.schemaName = null;
      //oAudit.sKey = null;
      oAudit.value = oData;
      oAudit.statementString = req.target.query
        ? JSON.stringify(req.target.query)
        : null;
      //oAudit.sKey = sKey;
      //oAudit.sValue = oData[sKey].toString();
      //oAudit.originDatabaseName = null;
      oAudit.lang = req.locale;
      oAudit.device = oBrowser.mobile ? "mobile" : "desktop";
      //console.log("device",req.device);
      //console.log("browser",browser());
      //console.log("user-agent",req.headers['user-agent']);

      oAudit.so = oBrowser.os ? oBrowser.os : null;
      oAudit.soVersion = oBrowser.os ? oBrowser.os : null;

      oAudit.browser = oBrowser.name ? oBrowser.name : null;
      oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
      oAudit.stackError = null;
      aAudit.push(oAudit);
      console.log("Antes de insertar");
      const tx = cds.transaction(req);
      const oRow = await tx.run(
        INSERT.into(MIF_ADMIN_HDI_AUDITORIA).entries(aAudit)
      );
      return oRow;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  });

  this.after(["CREATE", "UPDATE", "DELETE"], async (result, req) => {
    try {
      const oData = req.data ? JSON.stringify(req.data) : null;
      const aAudit = [];
      const oAudit = {};
      var oBrowser = browser(req.headers["user-agent"]);
      oAudit.applicationName = "CP";
      oAudit.timestamp = new Date();
      oAudit.host = req.getUrlObject().host;
      oAudit.port = null;
      oAudit.serviceName = req.path;
      // oAudit.connectionId = null;
      oAudit.clientHost = req.headers["x-forwarded-host"];
      console.log("req.headers", req.headers);
      oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
      // oAudit.clientPid = null;
      // oAudit.clientPort = null;
      console.log(req.user);
      oAudit.userName = req.user.id;
      oAudit.eventStatus = "Success";
      oAudit.eventLevel = null;
      oAudit.eventAction = req.event;
      oAudit.action = req.event;
      // oAudit.schemaName = null;
      // oAudit.sKey = null;
      oAudit.value = oData;
      oAudit.statementString = req.target.query
        ? JSON.stringify(req.target.query)
        : null;
      // oAudit.originDatabaseName = null;
      oAudit.lang = req.locale;
      oAudit.device = oBrowser.mobile ? "mobile" : "desktop";
      //console.log("device",req.device);
      //console.log("browser",browser());
      //console.log("user-agent",req.headers['user-agent']);
      oAudit.so = oBrowser.os ? oBrowser.os : null;
      oAudit.soVersion = oBrowser.os ? oBrowser.os : null;
      oAudit.browser = oBrowser.name ? oBrowser.name : null;
      oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
      oAudit.stackError = null;
      aAudit.push(oAudit);
      console.log("despues de insertar");
      const tx = cds.transaction(req);
      const oRow = await tx.run(
        INSERT.into(MIF_ADMIN_HDI_AUDITORIA).entries(aAudit)
      );
      return oRow;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  });

  this.on("error", async (err, req) => {
    try {
      console.log("ERROR GENERAL!!! ");
      console.log(req.data);
      console.log(err);
      const oData = req.data ? JSON.stringify(req.data) : null;
      const aAudit = [];
      const oAudit = {};
      var oBrowser = browser(req.headers["user-agent"]);
      oAudit.applicationName = "CP";
      oAudit.timestamp = new Date();
      oAudit.host = req.getUrlObject().host;
      oAudit.port = null;
      oAudit.serviceName = req.path;
      //oAudit.connectionId = null;
      oAudit.clientHost = req.headers.host;
      oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
      //oAudit.clientPid = null;//req.headers["x-correlation-id"];
      //oAudit.clientPort = null;
      oAudit.userName = req.user.id;
      oAudit.eventStatus = "Error";
      oAudit.eventLevel = err.level ? err.level : null;
      oAudit.eventAction = req.event;
      oAudit.action = req.event;
      //oAudit.schemaName = null;
      //oAudit.sKey = null;
      oAudit.value = oData;
      oAudit.statementString = req.target.query
        ? JSON.stringify(req.target.query)
        : null;
      //oAudit.sKey = sKey;
      //oAudit.sValue = oData[sKey].toString();
      //oAudit.originDatabaseName = null;
      oAudit.lang = req.locale;
      oAudit.device = oBrowser.mobile ? "mobile" : "desktop";
      console.log("device", req.device);
      console.log("browser", browser());
      console.log("user-agent", req.headers["user-agent"]);

      oAudit.so = oBrowser.os ? oBrowser.os : null;
      oAudit.soVersion = oBrowser.os ? oBrowser.os : null;

      oAudit.browser = oBrowser.name ? oBrowser.name : null;
      oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
      oAudit.stackError = err;
      aAudit.push(oAudit);

      //const db = await cds.connect.to ('db')
      //const { AUDITORIA } = db.entities ('mif_admin.hdi')
      const tx = cds.transaction();
      const oRow = await tx.run(
        INSERT.into(MIF_ADMIN_HDI_AUDITORIA).entries(aAudit)
      );
      return oRow;
    } catch (error) {
      return error;
    }
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Obtiene y verifica el tipo de pedido que se pretende crear.
   * - Segun el tipo de pedido obtiene la secuencia que corresponde y aumenta en +1 el correlativo.
   * - Asigna el correlativo al pedido que se pretende crear.
   * - Actualiza la entidad SEQUENCE_CUSTOM con el nuevo correlativo
   */
  this.before("CREATE", "PEDIDO", async (req) => {
    const tx = cds.transaction(req);
    const oObject = req.data;
    oObject.fechaRegistro = new Date();
    oObject.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);

    var oSql = {
      SELECT: {
        //one: true,
        from: {
          join: "inner",
          args: [
            { ref: [`${TIPO_PEDIDO_DETALLE.name}`], as: "A" },
            { ref: [`${TIPO_PEDIDO.name}`], as: "B" },
          ],
          on: [
            "(",
            { ref: ["A", "oTipoPedido_tpedidoId"] },
            "=",
            { ref: ["B", "tpedidoId"] },
            ")",
          ],
        },
        where: [
          { ref: ["A", "tPedidoDetId"] },
          "=",
          { val: oObject.oTipoPedidoDetalle_tPedidoDetId },
        ],
        columns: [
          { ref: ["A", "tPedidoDetId"], as: "tPedidoDetId" },
          { ref: ["A", "codigo"], as: "tipoDetCodigo" },
          { ref: ["B", "tpedidoId"], as: "tpedidoId" },
          { ref: ["B", "codigo"], as: "tipoCodigo" },
        ],
      },
    };

    var oTipoPedido = await tx.run(oSql);

    const oSequence = await tx.run(
      SELECT.one.from(SEQUENCE_CUSTOM).where({
        activo: true,
      })
    );

    var iSeqCP = oSequence.pedidoCP;
    var iSeqAM = oSequence.pedidoAM;
    if (oTipoPedido && oTipoPedido.length) {
      oTipoPedido = oTipoPedido[0];
      if (oTipoPedido && oTipoPedido.tipoCodigo == "PCP") {
        iSeqCP = iSeqCP + 1;
        oObject.numPedido = iSeqCP;
      } else if (oTipoPedido && oTipoPedido.tipoCodigo == "PAI") {
        iSeqAM = iSeqAM + 1;
        oObject.numPedido = iSeqAM;
      }

      const iAffectedRows = await tx.run(
        UPDATE(SEQUENCE_CUSTOM)
          .set({
            pedidoCP: iSeqCP,
            pedidoAM: iSeqAM,
          })
          .where({
            sequenceId: oSequence.sequenceId,
          })
      );
    }

    return oObject;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Actualiza las propiedades de auditoria
   */
  this.before("CREATE", "SALA_PESAJE", async (req) => {
    const oSalaPesaje = req.data;
    oSalaPesaje.fechaRegistro = new Date();
    oSalaPesaje.usuarioRegistro = oSalaPesaje.usuarioActualiza;
    oSalaPesaje.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oSalaPesaje;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Obtiene los registros actuales para comparar las propiedades
   *   que se estan modificando (cambiando de valor)
   * - Almacena los registros (propiedades) que se estan cambiando
   *   de valor en un log (LOG, LOG_DETALLE)
   * - Actualiza las propiedades de auditoria
   */
  this.before("UPDATE", "SALA_PESAJE", async (req) => {
    const oSalaPesaje = req.data;
    const tx = cds.transaction(req);
    const oObj = await tx.run(
      SELECT.one.from(SALA_PESAJE).where({
        salaPesajeId: oSalaPesaje.salaPesajeId,
      })
    );

    await log.recordLog(
      "SALA_PESAJE",
      oSalaPesaje.usuarioActualiza,
      oSalaPesaje.salaPesajeId,
      oSalaPesaje,
      oObj
    );

    oSalaPesaje.fechaActualiza = new Date();
    oSalaPesaje.usuarioActualiza = oSalaPesaje.usuarioActualiza;
    oSalaPesaje.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oSalaPesaje;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Actualiza las propiedades de auditoria
   */
  this.before("CREATE", "IMPRESORA", async (req) => {
    const oImpresora = req.data;
    oImpresora.fechaRegistro = new Date();
    oImpresora.usuarioRegistro = oImpresora.usuarioActualiza;
    oImpresora.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oImpresora;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Obtiene los registros actuales para comparar las propiedades
   *   que se estan modificando (cambiando de valor)
   * - Almacena los registros (propiedades) que se estan cambiando
   *   de valor en un log (LOG, LOG_DETALLE)
   * - Actualiza las propiedades de auditoria
   */
  this.before("UPDATE", "IMPRESORA", async (req) => {
    const oImpresora = req.data;
    const tx = cds.transaction(req);
    const oObj = await tx.run(
      SELECT.one.from(IMPRESORA).where({
        impresoraId: oImpresora.impresoraId,
      })
    );

    await log.recordLog(
      "IMPRESORA",
      oImpresora.usuarioActualiza,
      oImpresora.impresoraId,
      oImpresora,
      oObj
    );

    oImpresora.fechaActualiza = new Date();
    oImpresora.usuarioActualiza = oImpresora.usuarioActualiza;
    oImpresora.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oImpresora;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Actualiza las propiedades de auditoria
   */
  this.before("CREATE", "BALANZA", async (req) => {
    const oGrupoOrden = req.data;
    oGrupoOrden.fechaRegistro = new Date();
    oGrupoOrden.usuarioRegistro = req.user.id;
    oGrupoOrden.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oGrupoOrden;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Obtiene los registros actuales para comparar las propiedades
   *   que se estan modificando (cambiando de valor)
   * - Almacena los registros (propiedades) que se estan cambiando
   *   de valor en un log (LOG, LOG_DETALLE)
   * - Actualiza las propiedades de auditoria
   */
  this.before("UPDATE", "BALANZA", async (req) => {
    const oBalanza = req.data;

    const tx = cds.transaction(req);
    const oObj = await tx.run(
      SELECT.one.from(BALANZA).where({
        balanzaId: oBalanza.balanzaId,
      })
    );

    await log.recordLog(
      "BALANZA",
      oBalanza.usuarioActualiza,
      oBalanza.balanzaId,
      oBalanza,
      oObj
    );

    oBalanza.fechaActualiza = new Date();
    oBalanza.usuarioActualiza = oBalanza.usuarioActualiza;
    oBalanza.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oBalanza;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Obtiene los registros de grupo de ordenes segun la Sala de pesaje
   * - Evalua si existen registros:
   *   Si existe obtiene el ultimo registro y aumenta en +1 la secuencia de la propiedad codigo
   *   Caso contrario incializa en 0
   * - Actualiza las propiedades de auditoria
   */
  this.before("CREATE", "GRUPO_ORDEN", async (req) => {
    const oGrupoOrden = req.data;
    const tx = cds.transaction(req);

    const aGrupoOrdenes = await tx.run(
      SELECT.from(GRUPO_ORDEN)
        .where({
          oSalaPesaje_salaPesajeId: oGrupoOrden.oSalaPesaje_salaPesajeId,
          activo: true,
        })
        .orderBy("codigo")
    );

    var iMaxIdx = aGrupoOrdenes.length - 1;
    oGrupoOrden.codigo =
      aGrupoOrdenes.length == 0 ? 1 : aGrupoOrdenes[iMaxIdx].codigo + 1;
    oGrupoOrden.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oGrupoOrden;
  });

  /**
   * Evento BEFORE (Se ejecuta antes de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - Actualiza las propiedades de auditoria
   */
  this.before("CREATE", "GRUPO_ORDEN_BULTO", async (req) => {
    const oGrupoOrdenBulto = req.data;
    oGrupoOrdenBulto.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
    return oGrupoOrdenBulto;
  });

  /**
   * Evento ON (Se ejecuta al momento de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - 1.- Obtiene los registros de los estados de procesos de la tabla MAESTRA
   * - 2.- Obtiene el detalle de la Fraccion del grupo de ordenes (GRUPO_ORDEN_FRAC_DET)
   * - 3.- Si el registro obtenido (GRUPO_ORDEN_FRAC_DET) tiene el estado PENDIENTE PESAJE
   *       Actualiza todos los registros de GRUPO_ORDEN_FRAC a PESAJE FINALIZADO
   * - 4.- Obtiene y verifica si el grupo de ordenes fraccionadas (GRUPO_ORDEN_FRAC)
   *       existen items cuyo estado sea PENDIENTE PESAJE.
   *          Si Existen items cuyo estado sean PENDIENTE PESAJE el grupo de ordenes
   *          (GRUPO_ORDEN_CONSOLIDADO) pasara al estado PESANDO EN SALA.
   *
   *          Caso contrario el grupo de ordenes pasara al estado PESAJE FINALIZADO.
   * - 5.- Actualiza las propiedades de auditoria
   */
  this.on("CREATE", "GRUPO_ORDEN_BULTO", async (req) => {
    const oGrupoOrdenBulto = req.data;
    const tx = cds.transaction(req);

    /**
     * 1.- Obtiene los registros de los estados de procesos de la tabla MAESTRA
     */

    const oEstadosInsumo = await tx.run(
      SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
        oMaestraTipo_maestraTipoId: 15, //ESTADOS INSUMO
      })
    );

    const oInsumoPesajeFin = oEstadosInsumo.find(
      (d) => d.codigo == "PAIPEFI" //PESAJE FINALIZADO
    );
    const oInsumoPesajePendiente = oEstadosInsumo.find(
      (d) => d.codigo == "PAIPEPE" //PENDIENTE PESAJE
    );
    const oInsumoPesajePesando = oEstadosInsumo.find(
      (d) => d.codigo == "PAIPESA" //PESANDO EN SALA
    );

    /**
     * 2.- Obtiene el detalle de la Fraccion del grupo de ordenes
     */
    const oFracDet = await tx.run(
      SELECT.one.from(GRUPO_ORDEN_FRAC_DET).where({
        grupoOrdenFraccionamientoId:
          oGrupoOrdenBulto.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId,
      })
    );

    //SE ACTUALIZA EL ESTADO DE LA FRACCION A FINALIZADO
    if (oFracDet) {
      /*
       * 3.- Si el registro obtenido (GRUPO_ORDEN_FRAC_DET) tiene el estado PENDIENTE PESAJE
       *       Actualiza todos los registros de GRUPO_ORDEN_FRAC a PESAJE FINALIZADO
       */
      if (oFracDet.FracEstado_iMaestraId == oInsumoPesajePendiente.iMaestraId) {
        await tx.run(
          UPDATE(GRUPO_ORDEN_FRAC)
            .set({
              oEstado_iMaestraId: oInsumoPesajeFin.iMaestraId,
            })
            .where({
              grupoOrdenFraccionamientoId:
                oGrupoOrdenBulto.oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId,
            })
        );

        /*
         * 4.- Obtiene y verifica si el grupo de ordenes fraccionadas (GRUPO_ORDEN_FRAC)
         *       existen items cuyo estado sea PENDIENTE PESAJE.
         *          Si Existen items cuyo estado sean PENDIENTE PESAJE el grupo de ordenes
         *          (GRUPO_ORDEN_CONSOLIDADO) pasara al estado PESANDO EN SALA.
         *
         *          Caso contrario el grupo de ordenes pasara al estado PESAJE FINALIZADO.
         */
        const aItemsFracPendientes = await tx.run(
          SELECT.from(GRUPO_ORDEN_FRAC).where({
            oEstado_iMaestraId: oInsumoPesajePendiente.iMaestraId,
            oGrupoOrdenConsolidado_grupoOrdenConsolidadoId:
              oFracDet.grupoOrdenConsolidadoId,
          })
        );

        var iEstadoConsolidado = oInsumoPesajePesando.iMaestraId;
        if (aItemsFracPendientes.length == 0) {
          iEstadoConsolidado = oInsumoPesajeFin.iMaestraId;
        }

        await tx.run(
          UPDATE(GRUPO_ORDEN_CONSOLIDADO)
            .set({
              oEstado_iMaestraId: iEstadoConsolidado,
            })
            .where({
              grupoOrdenConsolidadoId: oFracDet.grupoOrdenConsolidadoId,
              codigoInsumo: oGrupoOrdenBulto.codigoInsumo,
            })
        );
      }
    }

    /*
      console.log(req.data); (¿Por que las fechas no se muestran?)
      Error: The following problem occurred: Invalid date/time value
      Error: Uncaught TypeError: Cannot read properties of undefined (reading 'body')
      {message: 'Invalid date/time value'}
    */
    req.data.fechaRegistro = new Date();
    await tx.run(req.query);

    return oGrupoOrdenBulto;
  });

  /**
   * Evento ON (Se ejecuta al momento de persistir la data a la enitdad)
   * Realiza lo siguiente:
   * - 1.- Obtiene los registros de los estados de procesos de la tabla MAESTRA
   * 2.- Obtiene todos los registros del grupo de ordenes (GRUPO_ORDEN_CONSOLIDADO)
   *     cuyo estado sea PENDIENTE PESAJE.
   *
   *  - Elimina todos los registros asociados al grupo de ordenes
   *    (GRUPO_ORDEN_FRAC, GRUPO_ORDEN_CONSOLIDADO).
   *
   * 3.- Obtiene el detalle de grupo de ordenes (GRUPO_ORDEN_DET)
   *     si el Id de la Orden Fraccion es NULL o Vacio.
   *
   *   - Actualiza (revertir estados) de los registros de la ORDEN_FRACCION al estado PROGRAMADO EN SALA
   *
   * - 5.- Actualiza las propiedades de auditoria
   */
  this.on("UPDATE", "GRUPO_ORDEN_DET", async (req) => {
    const oGrupoOrdenDet = req.data;
    const tx = cds.transaction(req);

    if (oGrupoOrdenDet.activo == false) {
      /**
       * Verifica si se esta eliminando algun items de GRUPO_ORDEN_DET
       * del grupo de fraccionamiento (GRUPO_ORDEN).
       *
       * Estructura Tablas:
       * (Grupos)                    (Items: Asocia el GRUPO_ORDEN con ORDEN_FRACCION)
       * GRUPO_ORDEN  1 ----- *      GRUPO_ORDEN_DET
       *                             - ORDEN_FRACCION (id)
       *                             - GRUPO_ORDEN (id)
       */

      /**
       * 1.- Obtiene los registros de los estados de procesos de la tabla MAESTRA
       */
      const oEstadosInsumo = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
          oMaestraTipo_maestraTipoId: 15, // ESTADOS INSUMOS
        })
      );

      const oEstadosOrden = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
          oMaestraTipo_maestraTipoId: 14, // ESTADOS ORDEN / FRACCION
        })
      );

      const oInsumoPesajePendiente = oEstadosInsumo.find(
        (d) => d.codigo == "PAIPEPE" // PENDIENTE PESAJE
      );

      const oOrdenProgramadoSala = oEstadosOrden.find(
        (d) => d.codigo == "PAOPRSA" // PROGRAMADO EN SALA
      );

      /**
       * 2.- Obtiene todos los registros del grupo de ordenes (GRUPO_ORDEN_CONSOLIDADO)
       * cuyo estado sea PENDIENTE PESAJE.
       *
       *  - Elimina todos los registros asociados al grupo de ordenes
       *    (GRUPO_ORDEN_FRAC, GRUPO_ORDEN_CONSOLIDADO).
       */
      const oGrupoOrdenConsolidado = await tx.run(
        SELECT.from(GRUPO_ORDEN_CONSOLIDADO).where({
          oGrupoOrden_grupoOrdenId: oGrupoOrdenDet.oGrupoOrden_grupoOrdenId,
          oEstado_iMaestraId: oInsumoPesajePendiente.iMaestraId,
        })
      );

      oGrupoOrdenConsolidado.forEach(async function (consolidado) {
        await tx.run(
          UPDATE(GRUPO_ORDEN_FRAC)
            .set({
              activo: false,
              usuarioActualiza: oGrupoOrdenDet.usuarioActualiza,
              fechaActualiza: new Date(),
            })
            .where({
              oGrupoOrdenConsolidado_grupoOrdenConsolidadoId:
                consolidado.grupoOrdenConsolidadoId,
            })
        );

        await tx.run(
          UPDATE(GRUPO_ORDEN_CONSOLIDADO)
            .set({
              activo: false,
              usuarioActualiza: oGrupoOrdenDet.usuarioActualiza,
              fechaActualiza: new Date(),
            })
            .where({
              grupoOrdenConsolidadoId: consolidado.grupoOrdenConsolidadoId,
            })
        );
      });

      /**
       * 3.- Obtiene el detalle de grupo de ordenes (GRUPO_ORDEN_DET)
       *     si el Id de la Orden Fraccion es NULL o Vacio.
       *   - Actualiza (revertir estados) de los registros de la ORDEN_FRACCION al estado PROGRAMADO EN SALA
       */
      var sOrdenFraccionId = oGrupoOrdenDet.oOrdenFraccion_ordenFraccionId;
      if (sOrdenFraccionId == null || sOrdenFraccionId == "") {
        const oGrupoOrdenDetalle = await tx.run(
          SELECT.one.from(GRUPO_ORDEN_DET).where({
            grupoOrdenDetalleId: oGrupoOrdenDet.grupoOrdenDetalleId,
          })
        );
        sOrdenFraccionId = oGrupoOrdenDetalle.oOrdenFraccion_ordenFraccionId;
      }

      await tx.run(
        UPDATE(ORDEN_FRACCION)
          .set({
            oEstado_iMaestraId: oOrdenProgramadoSala.iMaestraId,
          })
          .where({
            ordenFraccionId: sOrdenFraccionId,
          })
      );
    }

    oGrupoOrdenDet.fechaActualiza = new Date();
    await tx.run(req.query);
    return oGrupoOrdenDet;
  });

  //# ------------------------------------------------------------
  //#   CUSTOM METHODS POST:  ACTION
  //# ------------------------------------------------------------

  /**
   * Evento CUSTOMIZADO (Se ejecuta mediante el metodo POST del servicio oData)
   * Funcion para: Registro directo a las tablas de impresion (COLA_IMPRESION, COLA_IMPRESION_VARIABLES)
   *               segun plantilla desde un arrego de variables  para el envio a la cola de impresión.
   *
   * Realiza lo siguiente:
   * - Obtiene los registros enviados en el Body: aColaImpresion
   * - Captura los valores y ids para el envio a la cola de impresion:
   *      impresoraId
   *      plantillaImpresionId
   *      aVariable
   * - Registra los datos en las tablas (COLA_IMPRESION, COLA_IMPRESION_VARIABLES) para el envio a la cola de impresión.
   */
  this.on("acAddColaImpresion", async (req) => {
    /**
         * POST: .../v2/browse/acAddColaImpresion
         * Content-Type : application/json
         * Accept : application/json
         * 
         * BODY:
         * -----------
          { 
            "aColaImpresion": [
              {
                "impresoraId": "",
                "plantillaImpresionId": "",
                "usuario" : "",
                "descripcion": "",
                "enviado": true,
                "aVariable": [
                  {
                    "codigo": "",
                    "valor": ""
                  }, ...
                ]
              }, ...
            ]
          }
         */

    const tx = cds.transaction(req);
    const oData = req.data;
    const aColaImpresion = oData.aColaImpresion;
    var oReturn = {
      code: "S",
      message: "Success",
      oError: null,
      aResult: null,
    };
    var oAudit = {
      activo: true,
      usuarioRegistro: "",
      fechaRegistro: new Date(),
      terminal: "",
    };
    var aResult = [];
    try {
      for (var keyCol in aColaImpresion) {
        var oCola = aColaImpresion[keyCol];
        oAudit.usuarioRegistro = oCola.usuario ? oCola.usuario : "";
        /**
         * COLA_IMPRESION
         */
        var sColaImpresionId = uuidv4();
        var oEntity = {
          colaImpresionId: sColaImpresionId,
          descripcion: oCola.descripcion,
          enviados: true,
          oImpresora_impresoraId: oCola.impresoraId,
          oPlantilla_plantillaImpresionId: oCola.plantillaImpresionId,
        };
        var oColaImpresion = { ...oEntity, ...oAudit };
        /**
         * COLA_IMPRESION_VARIABLES
         */
        var aColaImpresionVariable = [];
        var aVariables = oCola.aVariable;

        if (oCola.plantillaImpresionId == "ZPL01") {
          var oUnidad = aVariables.find((d) => d.codigo == "#16#");
          const oUnidadMaestra = await tx.run(
            SELECT.one.from(MIF_ADMIN_HDI_MAESTRA).where({
              codigo: _toUpperCase(oUnidad.valor),
              oMaestraTipo_maestraTipoId: 19,
            })
          );

          var bMostrarInfo = false;
          if (
            _toUpperCase(oUnidadMaestra.codigoSap) ==
            _toUpperCase(oUnidad.valor)
          ) {
            bMostrarInfo = true;
          }

          oUnidad.valor = !bMostrarInfo
            ? oUnidad.valor
            : oUnidadMaestra.codigoSap;

          var oVariable14 = aVariables.find((d) => d.codigo == "#14#");
          oVariable14.valor = !bMostrarInfo ? "" : oVariable14.valor;

          var oVariable15 = aVariables.find((d) => d.codigo == "#15#");
          oVariable15.valor = !bMostrarInfo ? "" : oVariable15.valor;

          var oVariable27 = aVariables.find((d) => d.codigo == "#27#");
          oVariable27.valor = !bMostrarInfo ? "CANTIDAD" : "P.NETO";

          var oVariable28 = aVariables.find((d) => d.codigo == "#28#");
          oVariable28.valor = !bMostrarInfo ? "" : "P.TARA";

          var oVariable29 = aVariables.find((d) => d.codigo == "#29#");
          oVariable29.valor = !bMostrarInfo ? "" : "P.BRUTO";

          var oVariable30 = aVariables.find((d) => d.codigo == "#16B#");
          oVariable30.valor = !bMostrarInfo ? "" : oUnidadMaestra.codigoSap;

          var oVariable31 = aVariables.find((d) => d.codigo == "#16T#");
          oVariable31.valor = !bMostrarInfo ? "" : oUnidadMaestra.codigoSap;
        }

        for (var keyVar in aVariables) {
          var oItem = aVariables[keyVar];

          var sVariableId = uuidv4();
          var oEntity = {
            colaImpresionVariableId: sVariableId,
            oColaImpresion_colaImpresionId: sColaImpresionId,
            codigo: oItem.codigo,
            valor: oItem.valor,
          };
          var oColaImpresionVariable = { ...oEntity, ...oAudit };
          aColaImpresionVariable.push(oColaImpresionVariable);
        }
        var iRowI = await tx.run(
          INSERT.into(COLA_IMPRESION).entries(oColaImpresion)
        );
        if (iRowI.results.length) {
          var oInsertQuery = {
            INSERT: {
              into: { ref: [`${COLA_IMPRESION_VARIABLES.name}`], as: "New" },
              entries: aColaImpresionVariable,
            },
          };
          const iRowsI = await tx.run(oInsertQuery);
          if (iRowsI.results.length) {
            aResult.push(
              oCola.descripcion + ": Se envio a la cola de impresión."
            );

            /**
             * Habilitar cola de imprecion
             */
            await tx.run(
              UPDATE(COLA_IMPRESION)
                .set({
                  enviados: false,
                })
                .where({
                  colaImpresionId: sColaImpresionId,
                })
            );
          } else {
            aResult.push(
              oCola.descripcion +
                ": No se crearon las variables de la etiqueta."
            );
          }
        } else {
          aResult.push(
            oCola.descripcion +
              ": No se puedo crear la cola de impresión, vuelve a intentarlo mas tarde."
          );
        }
      }
      oReturn.aResult = aResult;
    } catch (oError) {
      oReturn.code = "E";
      oReturn.oError = oError;
      (oReturn.message = "Error general no se proceso la solicitud!"),
        (oReturn.aResult = "");
    }
    return oReturn;
  });

  this.on("acPostErpDinamic", async (req) => {
    /**
     * POST: .../v2/browse/acPostErpDinamic
     * Content-Type : application/json
     * Accept : application/json
     *
     * BODY:
     * -----------
     * {
     *    entity: AtendidoSet
     *    oBody: JSON.stringify({ ... })
     * }
     */

    var oData = req.data;
    var oParam = {
      sEntity: oData.entity,
      oBody: JSON.parse(oData.oBody),
    };
    try {
      var data = await erpsrv.postDinamicSet(
        "/" + oParam.sEntity,
        oParam.oBody
      );
      return data;
    } catch (error) {
      return req.reject(error);
    }
  });

  this.on("acSetEtiquetaErp", async (req) => {
    /**
     * POST: .../v2/browse/acSetEtiquetaErp
     * Content-Type : application/json
     * Accept : application/json
     *
     * BODY:
     * -----------
     * {
     *    oBody: JSON.stringify({ ... })
     * }
     */
    var oData = req.data;
    var aItem = JSON.parse(oData.oBody);
    var AtendidoItemSet = [];
    for (var key in aItem) {
      var oItem = aItem[key];
      if (!oItem.Etiqueta && !oItem.SS) {
        var sPrefixTipo = "";
        if (oItem.Tipo == "ENTERO") sPrefixTipo = "E";
        if (oItem.Tipo == "ENTERO_ALM") sPrefixTipo = "E";
        if (oItem.Tipo == "FRACCION") sPrefixTipo = "F";
        if (oItem.Tipo == "IFA") sPrefixTipo = "I";
        if (oItem.Tipo == "IDEN_PROD") sPrefixTipo = "P";
        if (oItem.Tipo == "SALDO") sPrefixTipo = "C";
        if (oItem.Tipo == "SALDO_ALM") sPrefixTipo = "G";
        if (oItem.Tipo == "SALDO_FRAC_ALM") sPrefixTipo = "G";

        var sFilter = "?$filter=Tipo_Etiqueta eq '" + sPrefixTipo + "'";
        var data = await erpsrv.getDinamicSet(
          "/Secuencia_EtiquetaSet" + sFilter
        );
        var oSeqEtiqueta = data.d.results[0];
        if (oSeqEtiqueta) {
          oItem.Etiqueta = oSeqEtiqueta.Etiqueta;
        } else {
          continue;
        }
      }

      oItem.CantidadA = formatWeight(oItem.CantidadA);
      oItem.Tara = formatWeight(+oItem.Tara);
      oItem.CantConsumida = formatWeight(oItem.CantConsumida);

      delete oItem.SS;

      AtendidoItemSet.push(oItem);
    }

    if (AtendidoItemSet && AtendidoItemSet.length) {
      var oBody = {
        Pedido: "",
        Centro: "",
        AtendidoItemSet: AtendidoItemSet,
      };

      try {
        var data = await erpsrv.postDinamicSet("/AtendidoSet", oBody);
        if (data.d) {
          return { data: data.d };
        } else {
          return { data };
        }
      } catch (error) {
        return req.reject(error);
      }
    } else {
      return req.reject("Erro al generar las secuencias.");
    }
  });

  //# ------------------------------------------------------------
  //#   CUSTOM METHODS GET:  FUNCTION
  //# ------------------------------------------------------------
  this.on("fnGetErpDinamic", async (req) => {
    /**
     * GET: .../v2/browse/fnGetErpDinamic?entity='OrdenSet'&urlParameters='{}'&filters='[{"sPath":"Aufnr","sOperator":"EQ","oValue1":"","oValue2":""}]'
     *
     * entity: OrdenSet
     * urlParameters: { "$filter": ..., "$expand":..., "$orderby": ..., "$select":... }
     * filters: [{"sPath": "Aufnr", "sOperator": "EQ", "oValue1": "", "oValue2": ""}]
     *
     */

    const oData = req.data;
    var sParams = "",
      sEntity = oData.entity,
      aFilter = JSON.parse(oData.filters),
      oUrlParams = JSON.parse(oData.urlParameters);

    sParams = buildParams(oUrlParams, aFilter);
    var data = await erpsrv.getDinamicSet("/" + sEntity + sParams);
    return data;
  });

  /**
   * function que permite actualizar la cantidad y duplicar
   */
  this.on("fraccionActualizarCantidad", async (req) => {
    let result = false;
    try {
      const tx = cds.transaction(req);
      const sTerminal = _xForwardedFor(req.headers["x-forwarded-for"]);

      const sGrupoOrdenFraccionamientoId = req.data.grupoOrdenFraccionamientoId;
      const fCantidad = parseFloat(req.data.cantidad);
      const sUnidad = req.data.unidad;
      const bDuplicar = req.data.duplicar == "true";
      const sUsuario = req.data.usuario;

      const sOrdenDetalleId = req.data.ordenDetalleId;

      if (bDuplicar) {
        //Obtiene la fraccion a duplicar
        var oFraccionamiento = await tx.run(
          SELECT.one.from(GRUPO_ORDEN_FRAC_DET).where({
            ordenDetalleId: sOrdenDetalleId,
          })
        );

        var aFraccionamientos = await tx.run(
          SELECT.from(GRUPO_ORDEN_FRAC_DET)
            .where({
              ordenFraccionId: oFraccionamiento.ordenFraccionId,
              ordenNumero: oFraccionamiento.ordenNumero,
              codigoInsumo: oFraccionamiento.codigoInsumo,
              loteInsumo: oFraccionamiento.loteInsumo,
              numFraccion: oFraccionamiento.numFraccion,
            })
            .orderBy("numSubFraccion")
        );

        //Se duplica ORDEN_DETALLE

        var oOrdenDetalle = await tx.run(
          SELECT.one.from(ORDEN_DETALLE).where({
            ordenDetalleId: sOrdenDetalleId,
          })
        );

        var iNumeroSubFraccion =
          aFraccionamientos[aFraccionamientos.length - 1].numSubFraccion + 1;

        var oNuevaOrdenDetalle = {};
        oNuevaOrdenDetalle = oOrdenDetalle;
        oNuevaOrdenDetalle.usuarioActualiza = null;
        oNuevaOrdenDetalle.fechaActualiza = null;
        oNuevaOrdenDetalle.verificacionEstado = null;
        oNuevaOrdenDetalle.verificacionUsu = null;
        oNuevaOrdenDetalle.verificacionFec = null;
        oNuevaOrdenDetalle.ordenDetalleId = uuidv4();
        oNuevaOrdenDetalle.oOrdenFraccion_ordenFraccionId =
          oFraccionamiento.ordenFraccionId;
        oNuevaOrdenDetalle.terminal = sTerminal;
        oNuevaOrdenDetalle.numSubFraccion = iNumeroSubFraccion;
        oNuevaOrdenDetalle.usuarioRegistro = sUsuario;
        oNuevaOrdenDetalle.fechaRegistro = dFechaActual;

        await tx.run(INSERT.into(ORDEN_DETALLE).entries(oNuevaOrdenDetalle));

        var dFechaActual = new Date();
        //var iNumeroFraccion = oFraccionamiento.numSubFraccion + 1;

        //Se duplica GRUPO_ORDEN_FRAC
        const oNewFracc = {};
        oNewFracc.grupoOrdenFraccionamientoId = uuidv4();
        oNewFracc.terminal = sTerminal;
        oNewFracc.oGrupoOrdenDetalle_grupoOrdenDetalleId =
          oFraccionamiento.grupoOrdenDetalleId;
        oNewFracc.oGrupoOrdenConsolidado_grupoOrdenConsolidadoId =
          oFraccionamiento.grupoOrdenConsolidadoId;
        oNewFracc.activo = true;
        oNewFracc.numFraccion = iNumeroSubFraccion;
        oNewFracc.sugerido = oFraccionamiento.sugerido;
        oNewFracc.entero = oFraccionamiento.entero;
        oNewFracc.requerido = oFraccionamiento.requerido;
        oNewFracc.requeridoFinal = fCantidad;
        oNewFracc.usuarioRegistro = sUsuario;
        oNewFracc.fechaRegistro = dFechaActual;
        oNewFracc.unidad = sUnidad;
        oNewFracc.oInsumo_ordenDetalleId = oNuevaOrdenDetalle.ordenDetalleId;
        oNewFracc.pPLoteLog = oFraccionamiento.pPLoteLog;
        oNewFracc.pTInsumo = oFraccionamiento.pTInsumo;
        oNewFracc.tara = 0.0;
        oNewFracc.oEstado_iMaestraId = oFraccionamiento.InsumoEstado_iMaestraId;
        oNewFracc.duplicado = "X";

        await tx.run(INSERT.into(GRUPO_ORDEN_FRAC).entries(oNewFracc));
      } else {
        await tx.run(
          UPDATE(ORDEN_DETALLE)
            .set({
              requeridoFinal: fCantidad,
              usuarioActualiza: sUsuario,
              fechaActualiza: new Date(),
            })
            .where({
              ordenDetalleId: sOrdenDetalleId,
            })
        );

        //Actualiza la cantidad a Pesar
        await tx.run(
          UPDATE(GRUPO_ORDEN_FRAC)
            .set({
              requeridoFinalConv: fCantidad,
              unidad: sUnidad,
              usuarioActualiza: sUsuario,
              fechaActualiza: new Date(),
            })
            .where({
              grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
            })
        );
      }

      return true;
    } catch (err) {
      console.log(err);
    }
    return result;
  });

  this.on("grupoOrdenGenerarConsolidado", async (req) => {
    let result = false;
    try {
      const tx = cds.transaction(req);
      const sGrupoOrdenId = req.data.grupoOrdenId;
      const sUsuario = req.data.usuario;

      const aInsumos = await tx.run(
        SELECT.from(GRUPO_ORDEN_DET_INSUMO_CONSOLIDADO).where({
          grupoOrdenId: sGrupoOrdenId,
        })
      );

      const aMaestraTipo = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA_TIPO).where({
          activo: true,
        })
      );
      const aMaestra = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
          activo: true,
        })
      );
      var aConstant = aMaestra.reduce(function (r, a) {
        var sKey = "NONE";
        var oMaestraTipo = aMaestraTipo.find(
          (o) => o.maestraTipoId === a.oMaestraTipo_maestraTipoId
        );
        if (oMaestraTipo) {
          sKey = oMaestraTipo.tabla;
        }
        r[sKey] = r[sKey] || [];
        r[sKey].push(a);
        return r;
      }, Object.create(null));

      var aEstadoAllInsumo = aConstant["ESTADO_CP_INSUMO"];

      oEstadoItemPendiente = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEPE"
      );
      oEstadoItemProduccion = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEPR"
      );
      oEstadoPesajeFinItem = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEFI"
      );

      var aInsumosC = _UniqByKeepFirst(
        aInsumos,
        (it) => it.numOrden + "_" + it.codigoInsumo
      );
      var aPedidos = aInsumosC.map((d) => d.numPedido);

      var aTipos = ["ENTERO", "ENTERO_ALM", "SALDO_FRAC_ALM", "SALDO_ALM"];

      var aOrdenes = aInsumosC.map((d) => d.numOrden);
      var aReservaNum = aInsumosC.map((d) => d.reservaNum);

      var aTiposFilter = aTipos.map((d) => "Tipo eq '" + d + "'");
      var aPedidoFilter = aPedidos.map((d) => "Pedido eq '" + d + "'");
      var aOrdenesFilter = aOrdenes.map((d) => "Orden eq '" + d + "'");
      var aReservaNumFilter = aReservaNum.map((d) => "Rsnum eq '" + d + "'");

      var sFilterP =
        "?$filter=(" +
        aPedidoFilter.join(" or ") +
        ") and (" +
        aTiposFilter.join(" or ") +
        ")";
      sFilterP += " and (" + aOrdenesFilter.join(" or ") + ")";
      var _data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilterP);

      var sFilterR = "?$filter=Bwart eq '' and Werks eq ''";
      sFilterR += " and (" + aReservaNumFilter.join(" or ") + ")";
      var _dataReserva = await erpsrv.getDinamicSet("/ReservaSet" + sFilterR);

      var aFracciones = [];
      for await (const item of aInsumos) {
        let oGrupoOrdenConsolidado = await tx.run(
          SELECT.one.from(GRUPO_ORDEN_CONSOLIDADO).where({
            oGrupoOrden_grupoOrdenId: sGrupoOrdenId,
            codigoInsumo: item.codigoInsumo,
            lote: item.lote,
            activo: true,
          })
        );

        var iRowI = [];
        if (oGrupoOrdenConsolidado == null) {
          oGrupoOrdenConsolidado = {};
          oGrupoOrdenConsolidado.grupoOrdenConsolidadoId = uuidv4();
          oGrupoOrdenConsolidado.terminal = _xForwardedFor(
            req.headers["x-forwarded-for"]
          );
          oGrupoOrdenConsolidado.usuarioRegistro = sUsuario;
          oGrupoOrdenConsolidado.codigoInsumo = item.codigoInsumo;
          oGrupoOrdenConsolidado.descripcion = item.descripcion;
          oGrupoOrdenConsolidado.lote = item.lote;
          oGrupoOrdenConsolidado.centro = item.centro;
          oGrupoOrdenConsolidado.activo = true;
          oGrupoOrdenConsolidado.oGrupoOrden_grupoOrdenId = sGrupoOrdenId;

          await tx.run(
            INSERT.into(GRUPO_ORDEN_CONSOLIDADO).entries(oGrupoOrdenConsolidado)
          );
        }

        const aDetalleInsumos = await tx.run(
          SELECT.from(GRUPO_ORDEN_DET_INSUMO).where({
            grupoOrdenId: sGrupoOrdenId,
            codigoInsumo: item.codigoInsumo,
            lote: item.lote,
            numFraccion: item.numFraccion,
          })
        );

        var iFrac = 1;
        for await (const detalle of aDetalleInsumos) {
          try {
            var fCantidadA = 0;
            if (_data.d) {
              var aDataP = _data.d.results;
              aDataP = aDataP.filter(
                (d) =>
                  [
                    "ENTERO",
                    "ENTERO_ALM",
                    "SALDO_FRAC_ALM",
                    "SALDO_ALM",
                  ].includes(d.Tipo) &&
                  +d.Fraccion == +detalle.numFraccion &&
                  +d.Subfraccion == +detalle.numSubFraccion &&
                  d.Lote == detalle.lote &&
                  d.Orden == detalle.numOrden &&
                  d.CodigoInsumo == detalle.codigoInsumo
              );
              aDataP.forEach(function (d) {
                fCantidadA += parseFloat(d.CantidadA);
              });
            }

            var bPesadoMaterialPr = false;
            var sPesadoMaterialPr = "";
            if (_dataReserva.d) {
              var aDataReserva = _dataReserva.d.results;
              var oReserva = aDataReserva.find((o) => {
                detalle.codigoInsumo == o.Matnr && detalle.lote == o.Charg;
              });

              sPesadoMaterialPr = oReserva ? oReserva.PesadoMaterialPrd : "";
            }

            bPesadoMaterialPr =
              detalle.insumoEstado == "PAIPEPR" || sPesadoMaterialPr == "X";

            var fRequeridoFinal = detalle.sugerido - fCantidadA;
            var fRequeridoFinalConv = fRequeridoFinal;
            var fFactorConversion = 0;

            /**
             * EVALUA SI REQUIERE CONVERSION POR DIMENSIONES DIFERENTES
             * UNIDAD -> MASA
             */
            debugger;
            var checkDimensionUnits = _checkDimensionUnits(
              "KG",
              detalle.unidad
            );
            if (checkDimensionUnits == "FACT") {
              let oOrdenDetalle = await tx.run(
                SELECT.one.from(ORDEN_DETALLE).where({
                  ordenDetalleId: detalle.ordenDetalleId,
                })
              );

              var sFilterVC =
                "?$filter=LoteInsumo eq '" +
                oOrdenDetalle.lote +
                "' and CodigoInsumo eq '" +
                oOrdenDetalle.codigoInsumo +
                "' and Centro eq '" +
                oOrdenDetalle.centro +
                "'";

              var aValoresPropCaracteristicas = await erpsrv.getDinamicSet(
                "/ValoresPropCaracteristicasSet" + sFilterVC
              );
              var aValoresPropCaract = [];

              if (!aValoresPropCaracteristicas.error) {
                aValoresPropCaract = aValoresPropCaracteristicas.d.results;
              }

              if (aValoresPropCaract && aValoresPropCaract.length > 0) {
                var oValoresPropCaracteristica = aValoresPropCaract[0];
                if (oValoresPropCaracteristica) {
                  fFactorConversion =
                    detalle.unidad.toUpperCase() == "MLL"
                      ? +oValoresPropCaracteristica.AtflvPesPro.replace(
                          ",",
                          "."
                        )
                      : +oValoresPropCaracteristica.AtflvPesEsp.replace(
                          ",",
                          "."
                        );
                }
              }

              var factConvertDimension = {};
              if (detalle.unidad.toUpperCase() == "MLL") {
                /**
                 * DIMENSION: UNIDAD
                 * VALORES: MLL - MILLARES
                 */
                factConvertDimension = _factConvertDimension(
                  "UNIDAD",
                  fRequeridoFinal,
                  detalle.unidad.toUpperCase(),
                  "MASA",
                  "KG",
                  fFactorConversion
                );
              } else {
                /**
                 * DIMENSION: VOLUMEN
                 * VALORES: ML - MILILITROS
                 * VALORES: L - LITROS
                 */

                //Convertir la unidad origen a la unidad base L
                var jsConvertUnits1 = _jsConvertUnits(
                  "VOLUMEN",
                  detalle.unidad.toUpperCase(),
                  "L",
                  fRequeridoFinal
                );

                //Convertir la unidad base L a la dimension de MASA aplicando el factor de conversion (Unidad base en Masa es KG)
                factConvertDimension = _factConvertDimension(
                  "VOLUMEN",
                  jsConvertUnits1,
                  "L",
                  "MASA",
                  "KG",
                  fFactorConversion
                );
              }

              fRequeridoFinalConv = factConvertDimension.value.toFixed(3);
            }

            let oFraccionamiento = await tx.run(
              SELECT.one.from(GRUPO_ORDEN_FRAC).where({
                oGrupoOrdenDetalle_grupoOrdenDetalleId:
                  detalle.grupoOrdenDetalleId,
                numFraccion: detalle.numFraccion,
                numSubFraccion: detalle.numSubFraccion,
                oGrupoOrdenConsolidado_grupoOrdenConsolidadoId:
                  oGrupoOrdenConsolidado.grupoOrdenConsolidadoId,
                oInsumo_ordenDetalleId: detalle.ordenDetalleId,
                activo: true,
              })
            );

            const iRowU = await tx.run(
              UPDATE(ORDEN_DETALLE)
                .set({
                  cantAtendida: fCantidadA,
                  requeridoFinal: fRequeridoFinalConv,
                })
                .where({ ordenDetalleId: detalle.ordenDetalleId })
            );

            if (oFraccionamiento == null) {
              oFraccionamiento = {};
              oFraccionamiento.terminal = oGrupoOrdenConsolidado.terminal;
              oFraccionamiento.usuarioRegistro = sUsuario;
              oFraccionamiento.activo = true;
              oFraccionamiento.grupoOrdenFraccionamientoId = uuidv4();
              oFraccionamiento.oGrupoOrdenDetalle_grupoOrdenDetalleId =
                detalle.grupoOrdenDetalleId;
              oFraccionamiento.oGrupoOrdenConsolidado_grupoOrdenConsolidadoId =
                oGrupoOrdenConsolidado.grupoOrdenConsolidadoId;
              oFraccionamiento.numFraccion = detalle.numFraccion;
              oFraccionamiento.numSubFraccion = detalle.numSubFraccion;
              oFraccionamiento.sugerido = detalle.sugerido;
              oFraccionamiento.cantSugerida = detalle.cantSugerida;
              oFraccionamiento.entero = fCantidadA;
              oFraccionamiento.requerido = detalle.cantRequerida;
              oFraccionamiento.requeridoFinal = fRequeridoFinal;
              oFraccionamiento.requeridoFinalConv = fRequeridoFinalConv;
              oFraccionamiento.unidad = detalle.unidad;
              oFraccionamiento.pPLoteLog = detalle.pPLoteLog;
              oFraccionamiento.pTInsumo = detalle.pTInsumo;
              oFraccionamiento.tara = 0;

              if (bPesadoMaterialPr) {
                oFraccionamiento.oEstado_iMaestraId =
                  oEstadoItemProduccion.iMaestraId;
              } else {
                oFraccionamiento.oEstado_iMaestraId =
                  fRequeridoFinal > 0
                    ? oEstadoItemPendiente.iMaestraId
                    : oEstadoPesajeFinItem.iMaestraId;
              }

              oFraccionamiento.oInsumo_ordenDetalleId = detalle.ordenDetalleId;

              await tx.run(
                INSERT.into(GRUPO_ORDEN_FRAC).entries(oFraccionamiento)
              );

              if (fRequeridoFinal <= 0 || bPesadoMaterialPr) {
                await tx.run(
                  UPDATE(GRUPO_ORDEN_CONSOLIDADO)
                    .set({
                      oEstado_iMaestraId: bPesadoMaterialPr
                        ? oEstadoItemProduccion.iMaestraId
                        : oEstadoPesajeFinItem.iMaestraId,
                    })
                    .where({
                      grupoOrdenConsolidadoId:
                        oFraccionamiento.oGrupoOrdenConsolidado_grupoOrdenConsolidadoId,
                    })
                );
              }

              oFraccionamiento.ordenFraccionId = detalle.ordenFraccionId;
              oFraccionamiento.numPedido = detalle.numPedido;

              aFracciones.push(oFraccionamiento);

              iFrac++;
            }
          } catch (error) {
            console.log(error);
          }
        }
      }

      var oOrdenes = _UniqByKeepFirst(aFracciones, (it) => it.ordenFraccionId);
      for await (const e of oOrdenes) {
        await _fnUpdateOrdenFrac(
          req,
          e.numPedido,
          e.ordenFraccionId,
          sUsuario,
          true
        );
      }

      result = true;

      return result;
    } catch (err) {
      console.log(err);
    }
    return result;
  });

  this.on("grupoOrdenRegenerarConsolidado", async (req) => {
    let result = false;
    try {
      const tx = cds.transaction(req);
      const sGrupoOrdenId = req.data.grupoOrdenId;
      const sUsuario = req.data.usuario;

      const aInsumos = await tx.run(
        SELECT.from(GRUPO_ORDEN_FRAC_DET).where({
          grupoOrdenId: sGrupoOrdenId,
        })
      );

      const aMaestraTipo = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA_TIPO).where({
          activo: true,
        })
      );
      const aMaestra = await tx.run(
        SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
          activo: true,
        })
      );
      var aConstant = aMaestra.reduce(function (r, a) {
        var sKey = "NONE";
        var oMaestraTipo = aMaestraTipo.find(
          (o) => o.maestraTipoId === a.oMaestraTipo_maestraTipoId
        );
        if (oMaestraTipo) {
          sKey = oMaestraTipo.tabla;
        }
        r[sKey] = r[sKey] || [];
        r[sKey].push(a);
        return r;
      }, Object.create(null));

      var aEstadoAllInsumo = aConstant["ESTADO_CP_INSUMO"];

      oEstadoItemPendiente = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEPE"
      );
      oEstadoItemProduccion = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEPR"
      );
      oEstadoPesajeFinItem = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPEFI"
      );

      var aPedidos = aInsumos.map((d) => d.numPedido);
      aPedidos = _UniqByKeepFirst(aPedidos, (it) => it);

      var aTipos = ["ENTERO", "ENTERO_ALM", "SALDO_FRAC_ALM", "SALDO_ALM"];

      var aOrdenes = aInsumos.map((d) => d.ordenNumero);
      aOrdenes = _UniqByKeepFirst(aOrdenes, (it) => it);

      var aReservaNum = aInsumos.map((d) => d.reservaNum);

      var aReservas = _UniqByKeepFirst(aReservaNum, (it) => it);

      var aTiposFilter = aTipos.map((d) => "Tipo eq '" + d + "'");
      var aPedidoFilter = aPedidos.map((d) => "Pedido eq '" + d + "'");
      var aOrdenesFilter = aOrdenes.map((d) => "Orden eq '" + d + "'");
      var aReservaNumFilter = aReservas.map((d) => "Rsnum eq '" + d + "'");

      var sFilterP =
        "?$filter=(" +
        aPedidoFilter.join(" or ") +
        ") and (" +
        aTiposFilter.join(" or ") +
        ")";
      sFilterP += " and (" + aOrdenesFilter.join(" or ") + ")";
      var _data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilterP);

      var sFilterR = "?$filter=Bwart eq '' and Werks eq ''";
      sFilterR += " and (" + aReservaNumFilter.join(" or ") + ")";
      var _dataReserva = await erpsrv.getDinamicSet("/ReservaSet" + sFilterR);

      var aFracciones = [];
      for await (const item of aInsumos) {
        let oGrupoOrdenConsolidado = await tx.run(
          SELECT.one.from(GRUPO_ORDEN_CONSOLIDADO).where({
            grupoOrdenConsolidadoId: item.grupoOrdenConsolidadoId,
            activo: true,
          })
        );
        let oFraccionamiento = await tx.run(
          SELECT.one.from(GRUPO_ORDEN_FRAC).where({
            grupoOrdenFraccionamientoId: item.grupoOrdenFraccionamientoId,
            activo: true,
          })
        );

        var fCantidadA = 0;
        if (_data.d) {
          var aDataP = _data.d.results;
          aDataP = aDataP.filter(
            (d) =>
              ["ENTERO", "ENTERO_ALM", "SALDO_FRAC_ALM", "SALDO_ALM"].includes(
                d.Tipo
              ) &&
              +d.Fraccion == +item.numFraccion &&
              +d.Subfraccion == +item.numSubFraccion &&
              d.Lote == item.loteInsumo &&
              d.Orden == item.ordenNumero &&
              d.CodigoInsumo == item.codigoInsumo
          );
          aDataP.forEach(function (d) {
            fCantidadA += parseFloat(d.CantidadA);
          });
        }

        var bPesadoMaterialPr = false;
        var sPesadoMaterialPr = "";
        if (_dataReserva.d) {
          var aDataReserva = _dataReserva.d.results;
          var oReserva = aDataReserva.find((o) => {
            item.codigoInsumo == o.Matnr && item.loteInsumo == o.Charg;
          });

          sPesadoMaterialPr = oReserva ? oReserva.PesadoMaterialPrd : "";
        }

        bPesadoMaterialPr =
          item.InsumoCodigoEstado == "PAIPEPR" || sPesadoMaterialPr == "X";

        if (bPesadoMaterialPr) {
          await tx.run(
            UPDATE(GRUPO_ORDEN_FRAC)
              .set({
                oEstado_iMaestraId: oEstadoItemProduccion.iMaestraId,
              })
              .where({
                grupoOrdenFraccionamientoId:
                  oFraccionamiento.grupoOrdenFraccionamientoId,
              })
          );

          await tx.run(
            UPDATE(GRUPO_ORDEN_CONSOLIDADO)
              .set({
                oEstado_iMaestraId: oEstadoItemProduccion.iMaestraId,
              })
              .where({
                grupoOrdenConsolidadoId:
                  oGrupoOrdenConsolidado.grupoOrdenConsolidadoId,
              })
          );
        }

        aFracciones.push(oFraccionamiento);
      }

      var oOrdenes = _UniqByKeepFirst(aFracciones, (it) => it.ordenFraccionId);
      for await (const e of oOrdenes) {
        await _fnUpdateOrdenFrac(
          req,
          e.numPedido,
          e.ordenFraccionId,
          sUsuario,
          true
        );
      }

      result = true;

      return result;
    } catch (err) {
      console.log(err);
    }
    return result;
  });

  /**
   * Evento CUSTOMIZADO (Se ejecuta mediante el metodo GET del servicio oData)
   * Funcion para: Logeo, verificacion y obtención de roles BTP
   *
   * Realiza lo siguiente:
   * - Obtiene el usuario (MIF_ADMIN_HDI_USUARIO) segun parametro: @usuario
   * - Desencripta la clave del registro y compara con el parametro: @clave
   * - Verifica si el usuario esta vigente y activo.
   * - Si el Usuario y Clave es correcto obtiene los
   *   Roles y Acciones BTP del usuario (VIEW_USER_ROL_APP_ACCION) para el
   *   aplicativo segun parametro: @app
   * - Verifica y obtienes los grupos IAS si tiene correo asociado.
   */
  this.on("fnLogin", async (req) => {
    //GET ../v2/browse/fnLogin?usuario='EGARCITI'&clave='1234'&app='FRAC'
    //GET ../browse/fnLogin(usuario='EGARCITI',clave='1234',app='FRAC')

    let result = false;
    try {
      const tx = cds.transaction(req);
      const data = req.data;
      const app = data.app;
      const usuario = data.usuario.toUpperCase();

      const oUsuario = await tx.run(
        SELECT.one
          .from(MIF_ADMIN_HDI_USUARIO)
          .where({
            activo: true,
            and: {
              usuario: usuario, //Usuario (BTP)
              or: {
                numeroDocumento: usuario, //DNI (BTP)
                or: {
                  correo: usuario.toLowerCase(), //Correo (IAS)
                  or: {
                    usuarioIas: usuario, //Usuario P (IAS)
                  },
                },
              },
            },
          })
          .columns((A) => {
            A.usuarioId.as("usuarioId"),
              A.clave.as("clave"),
              A.usuario.as("usuario"),
              A.usuarioSap.as("usuarioSap"),
              A.usuarioIas.as("usuarioIas"),
              A.nombre.as("nombre"),
              A.nombreMostrar.as("nombreMostrar"),
              A.correo.as("correo"),
              A.apellidoPaterno.as("apellidoPaterno"),
              A.apellidoMaterno.as("apellidoMaterno"),
              A.tipoDocumento.as("tipoDocumento"),
              A.numeroDocumento.as("numeroDocumento"),
              A.experiencia.as("experiencia"),
              A.telefono.as("telefono"),
              A.Movil.as("Movil"),
              A.fechaVigInicio.as("fechaVigInicio"),
              A.fechaVigFin.as("fechaVigFin"),
              A.activo.as("activo");
          })
      );

      if (oUsuario && oUsuario.activo) {
        var dateFrom = getTimestampToMDY(new Date(oUsuario.fechaVigInicio));
        var dateTo = getTimestampToMDY(new Date(oUsuario.fechaVigFin));
        var dateNow = getTimestampToMDY(new Date());
        //Valida si la fecha actual esta en el rango de vigencia del usuario
        var bVigencia = checkDateBT(dateFrom, dateTo, dateNow);
        if (bVigencia) {
          var clave = oUsuario.clave;
          var isIasAuth =
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
              data.usuario
            ) && data.usuario == data.clave;

          if (!isIasAuth) {
            try {
              //crypto.encrypt2(data.clave);
              clave = crypto.decrypt2(oUsuario.clave);
            } catch (oError) {
              throw {
                message:
                  "AUTH: No hemos podido autenticarle cominiquese con un adminitrador y/o reinicie la clave. " +
                  "Error en la encriptación/desencriptación de credenciales.",
                oError: oError,
              };
            }
          }

          if (!isIasAuth && data.clave != clave) {
            if (!(data.clave.indexOf(" ") >= 0)) {
              if (oUsuario.usuarioIas && oUsuario.usuarioIas.trim() != "") {
                var sAuth = btoa(oUsuario.correo + ":" + data.clave);
                var oConnectIas = await scim.checkCredential(sAuth);
                if (oConnectIas && !oConnectIas.error) {
                  isIasAuth = true;
                } else {
                  throw {
                    message:
                      "IAS: No hemos podido autenticarle Usuario/Clave incorrecto. Vuelva a intentarlo. " +
                      "Verifica que tu usuario no esté bloqueada por intentos fallidos.",
                    oError: ConnectIas.error,
                  };
                }
              }
            }
          }

          if (data.clave == clave || isIasAuth) {
            const aRol = await tx.run(
              SELECT.from(VIEW_USER_ROL_APP_ACCION)
                .where({
                  usuarioId: oUsuario.usuarioId,
                  aplicacion: app.toUpperCase(),
                })
                .columns((A) => {
                  A.rolId.as("rolId"),
                    A.rol.as("rol"),
                    A.accion.as("accion"),
                    A.aplicacion.as("aplicacion");
                })
            );

            delete oUsuario.clave;
            var sEntity =
              'Users?filter=emails.value eq "' +
              oUsuario.correo.toLowerCase() +
              '"';

            var userInfo = null;
            var oResource = null;
            try {
              userInfo = await scim.readDinamic(sEntity);
              oResource = userInfo.Resources[0];
            } catch (oError) {}

            //Validar roles de aplicacion
            var bPermision = true;
            var aRoleIas = _getGroupAppIas(app);
            if (aRoleIas) {
              bPermision = false;
              if (oResource && bPermision == false) {
                //App Movile Group Ias
                for (var key in oResource.groups) {
                  var oGroup = oResource.groups[key];
                  if (aRoleIas.includes(oGroup.value.toUpperCase())) {
                    bPermision = true;
                    break;
                  }
                }
              }
            }

            oResource = _getUserInfo(oResource);

            result = {
              results: [
                {
                  oUsuario: oUsuario,
                  aRol: aRol && aRol.length ? aRol : false,
                  scim: oResource,
                },
              ],
            };
          } else {
            result = {
              results: [
                {
                  sMessage:
                    "No hemos podido autenticarle. Vuelva a intentarlo.",
                  bStatus: false,
                  oError: "Usuario/Clave incorrecto",
                },
              ],
            };
          }
        } else {
          result = {
            results: [
              {
                sMessage:
                  "El usuario no esta vigente, comuníquese con su administrador para actualizar su fecha de vigencia.",
                bStatus: false,
                oError:
                  "El usuario no esta vigente, comuníquese con su administrador para actualizar su fecha de vigencia.",
              },
            ],
          };
        }
      } else {
        result = {
          results: [
            {
              sMessage:
                "El usuario no esta activo/registrado, comuníquese con su administrador.",
              bStatus: false,
              oError:
                "El usuario no esta activo/registrado, comuníquese con su administrador.",
            },
          ],
        };
      }
    } catch (oError) {
      result = {
        results: [
          {
            sMessage: oError.message,
            bStatus: false,
            oError: oError,
          },
        ],
      };
    }
    return result;
  });

  this.on("fnResetBultoIFA", async (req) => {
    //GET ../v2/browse/fnResetBultoIFA?grupoOrdenBultoId='12345'
    //GET ../browse/fnResetBultoIFA(grupoOrdenBultoId='12345')

    let result = false;
    try {
      const tx = cds.transaction(req);
      const data = req.data;
      const sGrupoOrdenBultoId = data.grupoOrdenBultoId;

      let oFiltro = {};

      if (!sGrupoOrdenBultoId) {
        return {
          results: [
            {
              sMessage: "El codigo de bulto es requerido.",
              bStatus: false,
            },
          ],
        };
      }

      oFiltro.oBultoOriginal_grupoOrdenBultoId = sGrupoOrdenBultoId;

      const iRowsUpdate = await tx.run(
        UPDATE(GRUPO_ORDEN_BULTO).set({ activo: false }).where(oFiltro)
      );

      result = {
        results: [
          {
            sMessage:
              "Los Bultos Saldos relacionados al Bulto IFA fueron bloqueados.",
            bStatus: true,
          },
        ],
      };
    } catch (oError) {
      result = {
        results: [
          {
            sMessage: oError.message,
            bStatus: false,
            oError: oError,
          },
        ],
      };
    }
    return result;
  });

  /**
   * Evento CUSTOMIZADO (Se ejecuta mediante el metodo GET del servicio oData)
   * Funcion para: Contruir etiquetas segun plantilla y tipo de bulto
   *               y envio a la cola de impresión.
   *
   * Realiza lo siguiente:
   * 1.- Obtiene los registros del bulto segun parametro: @etiqueta del servicio ERP @AtendidoItemSet
   * 2.- Obtiene la planantilla de impresion (PLANTILLA_IMPRESION) segun el tipo de bulto obtenido en en paso anterior (1).
   * 3.- Obtiene los registros del pedido (VIEW_PEDIDO_CONSOLIDADO)
   *     asociados al bulto obtenido en el paso anterior (1).
   * 4.- Obtiene detalles del insumo ( @ReservaSet ) asociado al bulto obtenido en el paso anterior (1).
   * 5.- Obtiene las caractericas del insumo ( @ValoresPropCaracteristicasSet ) asociado al bulto obtenido en el paso anterior (1).
   * 6.- Obtiene y agrupa todos los registros asociados a la etiqueta para inciar la contruccion de la etiqueta se replazan las variables
   *     segun plantilla.
   *   - Para contruir las variables de las plantillas se invoca a los metodos:
   *     @_buildVariableColaImpresionXXX : donde XXX es el tipo de etiqueta a construir.
   *      _buildVariableColaImpresionEE (ENTERO_ALM)
   *      _buildVariableColaImpresionMP (ENTERO, FRACCION)
   *      _buildVariableColaImpresionID (IDEN_PROD)
   *      _buildVariableColaImpresionSA (SALDO, SALDO_ALM, SALDO_FRAC_ALM )
   *      _buildVariableColaImpresionIFA (IFA)
   *
   * 7.- Envia los registros a la entidad COLA_IMPRESION y COLA_IMPRESION_VARIABLES,
   *     de esta manera se realiza el envio de la etiqueta a la cola de impresion.
   * 8.- Actualiza el contador de impresiones/reimpresion del bulto enviando los registros al servicio ERP @AtendidoSet
   */
  this.on("fnSendPrintBulto", async (req) => {
    //GET ../v2/browse/fnSendPrintBulto?impresoraId='59dd9871-22b0-4726-9353-902e37ff4f46'&etiqueta='E00000343'&usuario='EGARCIA'&bSaldo='X'&tipo='AM'&idBulto=''
    //GET ../browse/fnSendPrintBulto(impresoraId='59dd9871-22b0-4726-9353-902e37ff4f46', etiqueta='E00000343', usuario='EGARCIA', bSaldo='X', tipo='AM', idBulto='')
    const tx = cds.transaction(req);
    const data = req.data;
    var oBulto = null;
    var oReserva = null;
    var oInsumo = null;
    var aPlantilla = [];
    var oPlantilla = null;
    var sNomprePlantilla = null;
    var aResult = [];
    var aError = [];
    var aAtendidoItemSet = [];
    var oReturn = {
      code: "S",
      message: "Success",
      oError: null,
      aResult: null,
    };
    var oAudit = {
      activo: true,
      usuarioRegistro: "",
      fechaRegistro: new Date(),
      terminal: "",
    };
    try {
      const sImpresoraId = data.impresoraId;
      const sUsuario = data.usuario;
      const aSaldoParam = data.bSaldo.split("|");
      const bSaldo = aSaldoParam.length ? aSaldoParam[0] : "";
      const sCodigoBalanza = aSaldoParam.length > 1 ? aSaldoParam[1] : "";
      const sPesoNeto = aSaldoParam.length > 2 ? aSaldoParam[2] : "";
      const sPesoTara = aSaldoParam.length > 3 ? aSaldoParam[3] : "";
      const sIdBultoSaldo = aSaldoParam.length > 4 ? aSaldoParam[4] : "";
      const sUnidadSaldo = aSaldoParam.length > 5 ? aSaldoParam[5] : "";
      const sTipo = data.tipo;
      const sIdBulto = data.idBulto;

      var aEtiqueta = data.etiqueta.split(",");
      var aFilter = [];
      var bValidarHu = false;
      var sEntidad = "/AtendidoItemSet";
      for (var key in aEtiqueta) {
        var sEtiqueta = aEtiqueta[key];
        if (sIdBulto && sEtiqueta) {
          aFilter.push(
            "Etiqueta eq '" + sEtiqueta + "' and IdBulto eq '" + sIdBulto + "'"
          );
        } else if (["X", "PT", "IFA"].includes(bSaldo)) {
          if (sIdBulto) {
            aFilter.push("Hu eq '" + sIdBulto + "'");
            sEntidad = "/ValidarHuSet";
            bValidarHu = true;
          } else {
            aFilter.push("IdBulto eq '" + sEtiqueta + "' and Tipo eq 'SALDO'");
          }
        } else if (sEtiqueta && sTipo == "ETIQUETA_IFA") {
          aFilter.push("Etiqueta eq '" + sEtiqueta + "' and Tipo eq 'IFA'");
        } else {
          aFilter.push("Etiqueta eq '" + sEtiqueta + "'");
        }
      }
      if (aFilter.length == 0) {
        throw {
          message: "No se encontro informacion de la etiqueta para imprimir.",
        };
      }

      aFilter = _UniqByKeepFirst(aFilter, (it) => it);
      var sFilter = "?$filter=(" + aFilter.join(" or ") + ")";
      var aBulto = await erpsrv.getDinamicSet(sEntidad + sFilter);

      if (!aBulto.error) {
        aBulto = aBulto.d.results;
        aPlantilla = await tx.run(
          SELECT.from(PLANTILLA_IMPRESION)
            .where({
              activo: true,
            })
            .columns((A) => {
              A.plantillaImpresionId.as("plantillaImpresionId"),
                A.nombre.as("nombre");
            })
        );

        if (sTipo == "AM") {
          var aReimp = [];
          var iCantidadA = 0;
          var iTara = 0;
          var iNumBulto = aBulto.length;
          aBulto.forEach(function (o) {
            iCantidadA += +o.CantidadA;
            iTara += +o.Tara;
            aReimp.push(o.Reimpresion);
          });

          var iReimpresion = Math.max(...aReimp);

          aBulto.forEach(function (o) {
            o.Reimpresion = (iReimpresion + 1).toString();
            o.Impresion = "X";
            aAtendidoItemSet.push(o);
          });

          var oBulto = Object.assign({}, aBulto[0]);
          if (!sIdBulto) {
            /** Si almacen imprime en grupo, no enviar la HU a la etiqueta */
            oBulto.IdBulto = "";
          }
          oBulto.CantidadA = iCantidadA;
          oBulto.Tara = iTara;
          oBulto.NroItem = iNumBulto.toString();
          aBulto = [oBulto];
        }

        aBulto = aBulto.sort((a, b) => (+a.NroItem > +b.NroItem ? 1 : -1));
        for await (const oItem of aBulto) {
          oBulto = Object.assign({}, oItem);
          var oFilter = {
            pedidoNumero: oBulto.Pedido,
            ordenNumero: oBulto.Orden,
            insumoCodigo: oBulto.CodigoInsumo,
            insumoLote: oBulto.Lote,
            numFraccion: +oBulto.Fraccion,
            numSubFraccion: +oBulto.Subfraccion,
          };

          if (["ENTERO", "FRACCION", "IFA"].includes(oBulto.Tipo)) {
            sNomprePlantilla = "BULTO_ENTERO";
            if (oBulto.Tipo == "FRACCION") {
              sNomprePlantilla = "BULTO_FRACCION";
            }
            if (oBulto.Tipo == "IFA") {
              sNomprePlantilla = "BULTO_IFA";
            }
          }

          if (["SALDO"].includes(oBulto.Tipo) || bValidarHu) {
            sNomprePlantilla = "BULTO_SALDO";

            oFilter = {
              insumoCodigo: oBulto.CodigoInsumo,
              insumoLote: oBulto.Lote,
            };
          }

          if (["IDEN_PROD"].includes(oBulto.Tipo)) {
            sNomprePlantilla = "IDEN_PRODUCTO";

            oFilter = {
              pedidoNumero: oBulto.Pedido,
              ordenNumero: oBulto.Orden,
              numFraccion: +oBulto.Fraccion,
            };
          }

          if (sTipo == "AM") {
            if (
              ["ENTERO", "ENTERO_ALM"].includes(oBulto.Tipo) ||
              bSaldo == "GROUP"
            ) {
              sNomprePlantilla = "ENV_EMPAQ";
            } else {
              if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
                sNomprePlantilla = "BULTO_SALDO";
              }
            }
          } else {
            if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
              sNomprePlantilla = "ENV_EMPAQ";
            }
          }

          if (!bValidarHu) {
            oInsumo = await tx.run(
              SELECT.one
                .from(VIEW_PEDIDO_CONSOLIDADO)
                .where(oFilter)
                .columns((A) => {
                  A.PedidoTipo.as("PedidoTipo"),
                    A.PedidoTipoD.as("PedidoTipoD"),
                    A.PedidoCentro.as("PedidoCentro"),
                    A.reservaNum.as("reservaNum"),
                    A.reservaPos.as("reservaPos"),
                    A.pedidoNumero.as("pedidoNumero"),
                    A.ordenNumero.as("ordenNumero"),
                    A.OrdenDescrip.as("OrdenDescrip"),
                    A.ordenCodProd.as("ordenCodProd"),
                    A.ordenLote.as("ordenLote"),
                    //A.ordenFechaVencimiento.as("ordenFechaVencimiento"),
                    A.cantPedida.as("cantPedida"),
                    A.cantSugerida.as("cantSugerida"),
                    A.insumoCodigo.as("insumoCodigo"),
                    A.insumoLote.as("insumoLote"),
                    A.insumoDescrip.as("insumoDescrip"),
                    A.insumoUmb.as("insumoUmb"),
                    A.pickingIniFec.as("pickingIniFec"),
                    A.pesajeIniFec.as("pesajeIniFec"),
                    A.numFraccion.as("numFraccion"),
                    A.numSubFraccion.as("numSubFraccion");
                })
            );
          }

          /*
          if (oInsumo) {
            if (!["IDEN_PROD"].includes(oBulto.Tipo)) {
              var sFilter = "?$filter=Rsnum eq '" + oInsumo.reservaNum + "'";
              var aReserva = await erpsrv.getDinamicSet(
                "/ReservaSet" + sFilter
              );
              if (!aReserva.error) {
                var aReserva = aReserva.d.results;
                oReserva = aReserva.find(
                  (d) =>
                    d.Matnr == oInsumo.insumoCodigo &&
                    d.Charg == oInsumo.insumoLote
                );
              }
            }
          }
          */

          oPlantilla = aPlantilla.find((d) => d.nombre == sNomprePlantilla);
          if (oPlantilla) {
            var aVariableColaImpresion = [];
            if (sTipo == "AM") {
            } else {
              if (oBulto.Reimpresion == "") {
                oBulto.Reimpresion = "0";
                oBulto.Impresion = "X";
              } else {
                oBulto.Reimpresion = (+oBulto.Reimpresion + 1).toString();
              }
            }

            var sMaterialCaractFilter =
              "?$filter=LoteInsumo eq '" +
              oBulto.Lote +
              "' and CodigoInsumo eq '" +
              oBulto.CodigoInsumo +
              "' and Centro eq '" +
              oBulto.Centro +
              "'";

            var aMaterialCaractData = await erpsrv.getDinamicSet(
              "/ValoresPropCaracteristicasSet" + sMaterialCaractFilter
            );

            var oMaterialCaractData = {};
            if (!aMaterialCaractData.error) {
              oMaterialCaractData = aMaterialCaractData.d.results[0];
            }

            if (
              ["ENTERO", "FRACCION", "IFA", "SALDO"].includes(oBulto.Tipo) ||
              bValidarHu
            ) {
              if (bValidarHu) {
                oBulto.UnidadM = oBulto.Vemeh;
              }
              const oUnidad = await tx.run(
                SELECT.one.from(MIF_ADMIN_HDI_MAESTRA).where({
                  codigo: _toUpperCase(oBulto.UnidadM),
                  oMaestraTipo_maestraTipoId: 19,
                })
              );

              oBulto.UnidadC = oUnidad.codigoSap;
            }

            if (["ENTERO", "FRACCION", "IFA"].includes(oBulto.Tipo)) {
              aVariableColaImpresion = _buildVariableColaImpresionMP(
                oBulto,
                oReserva,
                oInsumo,
                sUsuario,
                oMaterialCaractData
              );
            }
            if (["SALDO"].includes(oBulto.Tipo) || bValidarHu) {
              oBulto.bSaldo = bSaldo;
              oBulto.balanza = sCodigoBalanza;
              oBulto.pesoNeto = sPesoNeto;
              oBulto.pesoTara = sPesoTara;
              oBulto.idBultoNuevo = sIdBultoSaldo;
              oBulto.unidadBalanzaSaldo = sUnidadSaldo;

              if (["IFA"].includes(bSaldo)) {
                aVariableColaImpresion = await _buildVariableColaImpresionSAIFA(
                  oBulto,
                  oInsumo,
                  oMaterialCaractData,
                  sUsuario
                );
              } else {
                if (bValidarHu) {
                  aVariableColaImpresion =
                    await _buildVariableColaImpresionSAFrac(oBulto, sUsuario);
                } else {
                  aVariableColaImpresion = await _buildVariableColaImpresionSA(
                    oBulto,
                    oInsumo,
                    oMaterialCaractData,
                    sUsuario
                  );
                }
              }
            }
            if (["IDEN_PROD"].includes(oBulto.Tipo)) {
              var aMaestra = await tx.run(
                SELECT.from(VIEW_MAESTRA).where({
                  tabla: "PLANTA",
                })
              );

              aVariableColaImpresion = _buildVariableColaImpresionID(
                oBulto,
                oInsumo,
                aMaestra
              );
            }

            if (sTipo == "AM") {
              if (
                ["ENTERO", "ENTERO_ALM"].includes(oBulto.Tipo) ||
                bSaldo == "GROUP"
              ) {
                aVariableColaImpresion = _buildVariableColaImpresionEE(
                  oBulto,
                  oInsumo,
                  oMaterialCaractData,
                  sUsuario
                );
              } else {
                if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
                  aVariableColaImpresion = await _buildVariableColaImpresionSA(
                    oBulto,
                    oInsumo,
                    oMaterialCaractData,
                    sUsuario
                  );
                }
              }
            } else {
              if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
                aVariableColaImpresion = _buildVariableColaImpresionEE(
                  oBulto,
                  oInsumo,
                  oMaterialCaractData,
                  sUsuario
                );
              }
            }
            if (sTipo == "ETIQUETA_IFA") {
              aVariableColaImpresion = _buildVariableColaImpresionIFA(
                oBulto,
                oReserva,
                oInsumo,
                sUsuario,
                oMaterialCaractData
              );
            }
            /**
             * GENERAR REGISTROS DE IMPRESION
             *
             */
            var aColaImpresion = [
              {
                impresoraId: sImpresoraId,
                plantillaImpresionId: oPlantilla.plantillaImpresionId,
                usuario: sUsuario,
                descripcion:
                  oBulto.Tipo +
                  " " +
                  oBulto.Etiqueta +
                  " " +
                  oBulto.Pedido +
                  " " +
                  oBulto.NroItem,
                enviados: true,
                aVariable: aVariableColaImpresion,
              },
            ];

            if (aVariableColaImpresion.length) {
              for await (const oCola of aColaImpresion) {
                oAudit.usuarioRegistro = oCola.usuario ? oCola.usuario : "";
                /**
                 * COLA_IMPRESION
                 */
                var sColaImpresionId = uuidv4();
                var oEntity = {
                  colaImpresionId: sColaImpresionId,
                  descripcion: oCola.descripcion,
                  enviados: oCola.enviados,
                  oImpresora_impresoraId: oCola.impresoraId,
                  oPlantilla_plantillaImpresionId: oCola.plantillaImpresionId,
                };
                var oColaImpresion = { ...oEntity, ...oAudit };
                /**
                 * COLA_IMPRESION_VARIABLES
                 */
                var aColaImpresionVariable = [];
                for (var keyVar in oCola.aVariable) {
                  var oVar = oCola.aVariable[keyVar];

                  var sVariableId = uuidv4();
                  var oEntity = {
                    colaImpresionVariableId: sVariableId,
                    oColaImpresion_colaImpresionId: sColaImpresionId,
                    codigo: oVar.codigo,
                    valor: oVar.valor ? oVar.valor : "",
                  };
                  var oColaImpresionVariable = { ...oEntity, ...oAudit };
                  aColaImpresionVariable.push(oColaImpresionVariable);
                }
                var iRowI = await tx.run(
                  INSERT.into(COLA_IMPRESION).entries(oColaImpresion)
                );
                if (iRowI.results.length) {
                  var oInsertQuery = {
                    INSERT: {
                      into: {
                        ref: [`${COLA_IMPRESION_VARIABLES.name}`],
                        as: "New",
                      },
                      entries: aColaImpresionVariable,
                    },
                  };
                  const iRowsI = await tx.run(oInsertQuery);
                  if (iRowsI.results.length) {
                    await tx.run(
                      UPDATE(COLA_IMPRESION)
                        .set({
                          enviados: false,
                        })
                        .where({
                          colaImpresionId: sColaImpresionId,
                        })
                    );
                    /** Actualizar conteo de impresion/reimpresion */
                    if (sTipo == "AM") {
                    } else {
                      aAtendidoItemSet.push(oBulto);
                    }
                  } else {
                    aError.push({
                      message: "Error al crear las variables de la etiqueta.",
                    });
                  }
                } else {
                  aError.push({
                    message:
                      "Error al enviar a la cola de impresión, vuelve a intentarlo mas tarde.",
                  });
                }
              }
            } else {
              aError.push({
                message: "Error al generar las variables de impresión.",
              });
            }
          } else {
            aError.push({
              message:
                "No se encontro la plantilla, verifique que esten activas.",
            });
          }
        }
      } else {
        throw { message: "No se encontro la etiqueta." };
      }

      if (aAtendidoItemSet && aAtendidoItemSet.length && !bValidarHu) {
        for (var oAtenUpd of aAtendidoItemSet) {
          delete oAtenUpd.Mblnr;
          delete oAtenUpd.Mjahr;
          delete oAtenUpd.TypeTras;
          delete oAtenUpd.FechaTras;
          delete oAtenUpd.UnidadC;
          delete oAtenUpd.bSaldo;
          delete oAtenUpd.balanza;
          delete oAtenUpd.LoteProv;
          delete oAtenUpd.__metadata;

          Object.keys(oAtenUpd).forEach((key) => {
            if (oAtenUpd[key] === undefined) {
              delete oAtenUpd[key];
            }
          });
        }
        var oAtendido = {
          Pedido: "",
          Centro: "",
          AtendidoItemSet: aAtendidoItemSet,
        };

        var oUpdateBulto = await erpsrv.postDinamicSet(
          "/AtendidoSet",
          oAtendido
        );

        if (typeof oUpdateBulto.length == "number") {
          aResult = oUpdateBulto;
        } else {
          aResult.push(oUpdateBulto.d);
        }
      }

      if (aError && aError.length) {
        throw { aError: aError };
      }

      oReturn.aResult = aResult;
    } catch (oError) {
      oReturn.code = "E";
      oReturn.oError = oError;
      oReturn.message = "Error general no se proceso la solicitud!";
      oReturn.aResult = "";

      throw oReturn;
    }
    return oReturn;
  });

  this.on("fnGetEtiquetasDespacho", async (req) => {
    /**
     * GET: .../v2/browse/fnGetEtiquetasDespacho?Orden=300000477
     */

    /**
     Generar un archivo que tenga todos los tickets virtuales de atención de todos los componentes de una orden de producción, 
     estos deben ser ordenados por la posición de la orden de producción.
     */
    //var self = this;
    const tx = cds.transaction(req);
    const oInfo = req.data;

    var aOrden = oInfo.Orden.split(",");
    var aOrdenFilter = aOrden.map((d) => "Orden eq '" + d + "'");
    var sFilterP = "?$filter=(" + aOrdenFilter.join(" or ") + ")";
    var aResponse = [];
    var aBulto = [];
    var aPlantilla = [];
    var bValidarHu = false;
    var oReserva = null;
    var oInsumo = null;

    /**
     Los tipos de etiqueta que se deben considerar son:
  
     Tipo de impresion [CP: Central Pesada]
      ENTERO – etiqueta de atención de un entero.
      FRACCION – etiqueta de atención que se genera en el pesaje.
      IFA – etiqueta de atención que se genera al pesar un material que se pesa en producción.
  
     Tipo de impresion [AM: Almacen Materiales]
      ENTERO_ALM – etiqueta de atención de un entero de almacén.
      SALDO_FRAC_ALM – etiqueta de atención de una fracción en el almacén.
      SALDO_ALM – etiqueta de atención de un saldo de almacén.
     */

    var aTipos = [
      "ENTERO",
      "FRACCION",
      "IFA",
      "ENTERO_ALM",
      "SALDO_FRAC_ALM",
      "SALDO_ALM",
    ];
    var aTiposFilter = aTipos.map((d) => "Tipo eq '" + d + "'");

    var sPrefixFilter = "?$filter=";
    var sFilterP = "(" + aOrdenFilter.join(" or ") + ")";
    sFilterP += " and (" + aTiposFilter.join(" or ") + ")";
    sFilterP = sPrefixFilter + sFilterP;

    try {
      var data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilterP);
      if (data && data.d) {
        aBulto = data.d.results;

        /**
         * - Filtrar solo aquellos bultos con IdBulto
         */
        aBulto = aBulto.filter((o) => {
          return o.IdBulto != "";
        });
      }

      var aBultoCP = [];
      var aBultoAM = [];
      aBulto.forEach(function (o) {
        if (["ENTERO_ALM", "SALDO_FRAC_ALM", "SALDO_ALM"].includes(o.Tipo)) {
          aBultoAM.push(o);
        } else {
          aBultoCP.push(o);
        }
      });

      if (aBultoAM.length > 0) {
        /**
         * - Para pedidos de Almacen de Materiales,
         *   se agrupan las etiquetas segun el campo Etiqueta
         */

        var aBultoAM_ = [];

        aBultoAM = aBultoAM.sort((a, b) =>
          +a.Etiqueta > +b.Etiqueta ? 1 : -1
        );

        var aBultoAM_GR = aBultoAM.reduce(function (r, a) {
          var sKey = a.Etiqueta;
          r[sKey] = r[sKey] || [];
          r[sKey].push(a);
          return r;
        }, Object.create(null));

        for (var key in aBultoAM_GR) {
          var aBultoAM_Temp = aBultoAM_GR[key];

          var aReimp = [];
          var iCantidadA = 0;
          var iTara = 0;
          var iNumBulto = aBultoAM_Temp.length;

          aBultoAM_Temp.forEach(function (o) {
            iCantidadA += +o.CantidadA;
            iTara += +o.Tara;
            aReimp.push(o.Reimpresion);
          });

          var iReimpresion = Math.max(...aReimp);

          aBultoAM_Temp.forEach(function (o) {
            o.Reimpresion = (iReimpresion + 1).toString();
            o.Impresion = "X";
          });

          var oBulto = Object.assign({}, aBultoAM_Temp[0]);

          oBulto.Tipo = "ENTERO_ALM"; //Todas la etiquetas que se agrupan se imprimen con ENTERO_ALMs

          /**
           * Si almacen imprime en grupo, no enviar la HU a la etiqueta
           */
          oBulto.IdBulto = "";

          oBulto.CantidadA = iCantidadA;
          oBulto.Tara = iTara;
          oBulto.NroItem = iNumBulto.toString();

          aBultoAM_.push(oBulto);
        }

        aBultoAM = aBultoAM_;
      }

      /**
       * - Ordenar los registros de la orden por su posición
       */

      aBulto = aBultoCP.concat(aBultoAM);
      aBulto = sortByAttribute(aBulto, "Orden", "Posnr", "Tipo");

      /**
       * Obtener las plantillas ZPL
       */

      aPlantilla = await tx.run(
        SELECT.from(PLANTILLA_IMPRESION)
          .where({
            activo: true,
          })
          .columns((A) => {
            A.plantillaImpresionId.as("plantillaImpresionId"),
              A.nombre.as("nombre"),
              A.contenido.as("contenido");
          })
      );

      var aUnidad = await tx.run(
        SELECT.from(VIEW_MAESTRA).where({
          tabla: "UNIDAD",
        })
      );

      var aRsnum = [];
      var aRsnumResp = [];

      var aCaract = [];
      var aCaractRest = [];

      for (var oBulto of aBulto) {
        var aVariableColaImpresion = [];
        delete oBulto.__metadata;

        var oFilter = {
          pedidoNumero: oBulto.Pedido,
          ordenNumero: oBulto.Orden,
          insumoCodigo: oBulto.CodigoInsumo,
          insumoLote: oBulto.Lote,
          numFraccion: +oBulto.Fraccion,
          numSubFraccion: +oBulto.Subfraccion,
        };

        if (["SALDO"].includes(oBulto.Tipo)) {
          oFilter = {
            insumoCodigo: oBulto.CodigoInsumo,
            insumoLote: oBulto.Lote,
          };
        }

        if (["IDEN_PROD"].includes(oBulto.Tipo)) {
          oFilter = {
            pedidoNumero: oBulto.Pedido,
            ordenNumero: oBulto.Orden,
            numFraccion: +oBulto.Fraccion,
          };
        }

        /**
         * bSaldo == "GROUP" -> Impresión en grupo
         */
        oInsumo = await tx.run(
          SELECT.one
            .from(VIEW_PEDIDO_CONSOLIDADO)
            .where(oFilter)
            .columns((A) => {
              A.PedidoTipo.as("PedidoTipo"),
                A.PedidoTipoD.as("PedidoTipoD"),
                A.PedidoCentro.as("PedidoCentro"),
                A.reservaNum.as("reservaNum"),
                A.reservaPos.as("reservaPos"),
                A.pedidoNumero.as("pedidoNumero"),
                A.ordenNumero.as("ordenNumero"),
                A.OrdenDescrip.as("OrdenDescrip"),
                A.ordenCodProd.as("ordenCodProd"),
                A.ordenLote.as("ordenLote"),
                A.cantPedida.as("cantPedida"),
                A.cantSugerida.as("cantSugerida"),
                A.insumoCodigo.as("insumoCodigo"),
                A.insumoLote.as("insumoLote"),
                A.insumoDescrip.as("insumoDescrip"),
                A.insumoUmb.as("insumoUmb"),
                A.pickingIniFec.as("pickingIniFec"),
                A.pesajeIniFec.as("pesajeIniFec"),
                A.numFraccion.as("numFraccion"),
                A.numSubFraccion.as("numSubFraccion");
            })
        );

        /**
         * Obtener caracteristicas del material
         */

        var oMaterialCaractData = {};

        var oCaract = aCaract.find(
          (o) =>
            o.LoteInsumo == oBulto.Lote &&
            o.CodigoInsumo == oBulto.CodigoInsumo &&
            o.Centro == oBulto.Centro
        );

        if (!oCaract) {
          aCaract.push({
            LoteInsumo: oBulto.Lote,
            CodigoInsumo: oBulto.CodigoInsumo,
            Centro: oBulto.Centro,
          }); //Guarda temporalmente para verificar si ya se ha consultado antes la Caracteristica y poder reutilizar en el bucle

          var sMaterialCaractFilter =
            "?$filter=LoteInsumo eq '" +
            oBulto.Lote +
            "' and CodigoInsumo eq '" +
            oBulto.CodigoInsumo +
            "' and Centro eq '" +
            oBulto.Centro +
            "'";

          var aMaterialCaractData = await erpsrv.getDinamicSet(
            "/ValoresPropCaracteristicasSet" + sMaterialCaractFilter
          );

          if (!aMaterialCaractData.error) {
            oMaterialCaractData = aMaterialCaractData.d.results[0];
            aCaractRest = aCaractRest.concat([oMaterialCaractData]); //Guarda temporalmente para verificar si ya se ha consultado antes la Caracteristica y poder reutilizar en el bucle
          }
        } else {
          oMaterialCaractData = aCaractRest.find(
            (o) =>
              o.LoteInsumo == oBulto.Lote &&
              o.CodigoInsumo.includes(oBulto.CodigoInsumo) &&
              o.Centro == oBulto.Centro
          );
        }

        if (oInsumo) {
          var aReserva = [];

          if (["ENTERO", "FRACCION", "IFA"].includes(oBulto.Tipo)) {
            var oRsnum = aRsnum.find((d) => d.Rsnum == oInsumo.reservaNum);
            if (!oRsnum) {
              aRsnum.push({ Rsnum: oInsumo.reservaNum }); //Guarda temporalmente para verificar si el RSNUM ya se ha consultado antes y poder reutilizar en el bucle

              var sFilter = "?$filter=Rsnum eq '" + oInsumo.reservaNum + "'";
              aReserva = await erpsrv.getDinamicSet("/ReservaSet" + sFilter);
              if (!aReserva.error) {
                aReserva = aReserva.d.results;
                aRsnumResp = aRsnumResp.concat(aReserva); //Guarda temporalmente para verificar si el RSNUM ya se ha consultado antes y poder reutilizar en el bucle
              } else {
                aReserva = [];
              }
            } else {
              aReserva = aRsnumResp.filter(
                (o) => o.Rsnum == oInsumo.reservaNum
              );
            }

            oReserva = aReserva.find(
              (o) =>
                o.Matnr == oInsumo.insumoCodigo && o.Charg == oInsumo.insumoLote
            );
          }
        }

        if (["ENTERO", "FRACCION", "IFA", "SALDO"].includes(oBulto.Tipo)) {
          if (bValidarHu) {
            oBulto.UnidadM = oBulto.Vemeh;
          }

          var oUnidad = aUnidad.find(
            (o) => o.codigo === _toUpperCase(oBulto.UnidadM)
          );
          oBulto.UnidadC = oUnidad.codigoSap;
        }

        var sNomprePlantilla = "";
        switch (oBulto.Tipo) {
          case "ENTERO":
            sNomprePlantilla = "BULTO_ENTERO";
            break;
          case "FRACCION":
            sNomprePlantilla = "BULTO_FRACCION";
            break;
          case "IFA":
            sNomprePlantilla = "BULTO_IFA";
            break;
          case "ENTERO_ALM":
            sNomprePlantilla = "ENV_EMPAQ";
            break;
          case "SALDO_FRAC_ALM":
            sNomprePlantilla = "BULTO_SALDO";
            break;
          case "SALDO_ALM":
            sNomprePlantilla = "BULTO_SALDO";
            break;
          case "SALDO":
            sNomprePlantilla = "BULTO_SALDO";
            break;
          case "IDEN_PROD":
            sNomprePlantilla = "IDEN_PRODUCTO";
            break;
          default:
            break;
        }
        var oPlantilla = aPlantilla.find((o) => o.nombre === sNomprePlantilla);

        switch (oBulto.Tipo) {
          case "ENTERO":
            aVariableColaImpresion = _buildVariableColaImpresionMP(
              oBulto,
              oReserva,
              oInsumo,
              "",
              oMaterialCaractData
            );
            break;

          case "FRACCION":
            aVariableColaImpresion = _buildVariableColaImpresionMP(
              oBulto,
              oReserva,
              oInsumo,
              "",
              oMaterialCaractData
            );
            break;

          case "IFA":
            aVariableColaImpresion = _buildVariableColaImpresionIFA(
              oBulto,
              oReserva,
              oInsumo,
              "",
              oMaterialCaractData
            );
            break;

          case "ENTERO_ALM":
            /**
             * bSaldo == "GROUP" -> Impresión en grupo
             */
            aVariableColaImpresion = _buildVariableColaImpresionEE(
              oBulto,
              oInsumo,
              oMaterialCaractData,
              ""
            );
            break;

          case "SALDO_FRAC_ALM" || "SALDO_ALM":
            aVariableColaImpresion = await _buildVariableColaImpresionSA(
              oBulto,
              oInsumo,
              oMaterialCaractData,
              ""
            );
            break;

          case "SALDO":
            aVariableColaImpresion = await _buildVariableColaImpresionSA(
              oBulto,
              oInsumo,
              oMaterialCaractData,
              ""
            );
            break;

          case "IDEN_PROD":
            var aMaestra = await tx.run(
              SELECT.from(VIEW_MAESTRA).where({
                tabla: "PLANTA",
              })
            );
            aVariableColaImpresion = _buildVariableColaImpresionID(
              oBulto,
              oInsumo,
              aMaestra
            );
            break;
          default:
            break;
        }

        var sPlantillaZPL = oPlantilla.contenido;
        aVariableColaImpresion.forEach((o) => {
          sPlantillaZPL = sPlantillaZPL.replaceAll(o.codigo, o.valor);
        });

        oBulto.zpl = sPlantillaZPL;

        aResponse.push({
          Pedido: oBulto.Pedido,
          Orden: oBulto.Orden,
          Posnr: oBulto.Posnr,
          Fraccion: oBulto.Fraccion,
          CodigoInsumo: oBulto.CodigoInsumo,
          Lote: oBulto.Lote,
          Subfraccion: oBulto.Subfraccion,
          Tipo: oBulto.Tipo,
          IdBulto: oBulto.IdBulto,
          Etiqueta: oBulto.Etiqueta,
          zpl: oBulto.zpl,
        });
      }

      //aResponse = aBulto;
    } catch (oError) {}
    return { data: aResponse };
  });

  this.on("fnValidate", async (req) => {
    const oInfo = req.data;

    try {
      var isIasAuth = false;
      const oConnectIas = await scim.checkCredential(oInfo.auth);
      if (oConnectIas && !oConnectIas.error) {
        isIasAuth = true;
      } else {
        throw {
          message:
            "IAS: No hemos podido autenticarle Usuario/Clave incorrecto. Vuelva a intentarlo. " +
            "Verifica que tu usuario no esté bloqueada por intentos fallidos.",
          oError: ConnectIas.error,
        };
      }

      return isIasAuth ? "1" : "0";
    } catch (oError) {
      return { error: oError };
    }
  });

  this.on("obtenerBulto", async (req) => {
    const oInfo = req.data;
    const tx = cds.transaction(req);

    var oResult = {};

    var sFilter =
      "?$filter=Pedido eq '" +
      oInfo.pedido +
      "' and IdBulto eq '" +
      oInfo.bulto +
      "'";

    var data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilter);

    var oBulto = {};
    if (!data.error) {
      var oBulto = data.d.results;
      oBulto = oBulto[0];

      const oFracDet = await tx.run(
        SELECT.one.from(GRUPO_ORDEN_FRAC_DET).where({
          grupoOrdenFraccionamientoId: oInfo.grupoOrdenFraccionamientoId,
        })
      );

      const oOrdenDet = await tx.run(
        SELECT.one.from(ORDEN_DETALLE).where({
          oOrden_ordenId: oFracDet.ordenId,
          codigoInsumo: oBulto.CodigoInsumo,
        })
      );

      var sFilter =
        "?$filter=Rsnum eq '" +
        oOrdenDet.reservaNum +
        "' and Rspos eq '" +
        oOrdenDet.reservaPos +
        "'";
      var aReserva = await erpsrv.getDinamicSet("/ReservaSet" + sFilter);
      if (!aReserva.error) {
        oReserva = aReserva.d.results[0];
      }

      if (oReserva) {
        oBulto.FeCaduc = oReserva.FeCaduc
          ? getTimestampToYMD(formatDateJson(oReserva.FeCaduc))
          : "0000-00-00";
      }

      var sMaterialCaractFilter =
        "?$filter=Atinn eq 'PESADO_MATERIAL_PR' and Matnr eq '" +
        oBulto.CodigoInsumo +
        "'";
      var oMaterialCaractData = await erpsrv.getDinamicSet(
        "/MaterialCaractSet" + sMaterialCaractFilter
      );

      var oMaterialIFA = oMaterialCaractData.d;

      if (oMaterialIFA) {
        oBulto.Ifa =
          oMaterialIFA.results.length > 0 ? oMaterialIFA.results[0].Atwrt : "";
      } else {
        oBulto.Ifa = "";
      }
    } else {
      oBulto = {};
    }

    return { data: oBulto };
  });

  this.on("obtenerBultosEnteros", async (req) => {
    const oInfo = req.data;

    var aPedidos = oInfo.pedidos.split(",");
    var aPedidosFilter = aPedidos.map((d) => "Pedido eq '" + d + "'");
    var sFilterP = "?$filter=(" + aPedidosFilter.join(" or ") + ")";
    var aResponse = [];

    try {
      var data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilterP);
      if (data && data.d) {
        var self = this;
        aResponse = data.d.results.filter((d) => d.Tipo == "ENTERO");

        aResponse.forEach(function (e) {
          e.FechaAte = e.FechaAte ? self.formatDateJson(e.FechaAte) : "";
        });
      }
    } catch (oError) {}

    return { data: aResponse };
  });

  this.on("fnUpdateOrdenFrac", async (req) => {
    const tx = cds.transaction(req);
    const data = req.data;
    var ordenFraccionId = data.ordenFraccionId;
    var pedidoId = data.pedidoId;
    var usuario = data.usuario;
    var oResp = await _fnUpdateOrdenFrac(
      req,
      pedidoId,
      ordenFraccionId,
      usuario,
      false
    );

    if (oResp && oResp.length > 0) {
      for await (const d of oResp) {
        await tx.run(
          UPDATE(ORDEN_DETALLE)
            .set({
              oEstado_iMaestraId: d.iEstadoDetalleId,
            })
            .where({
              ordenDetalleId: d.iOrdenDetalleId,
            })
        );

        await tx.run(
          UPDATE(GRUPO_ORDEN_CONSOLIDADO)
            .set({
              oEstado_iMaestraId: d.iEstadoConsolidadoId,
            })
            .where({
              grupoOrdenConsolidadoId: d.iConsolidadoId,
            })
        );

        await tx.run(
          UPDATE(ORDEN_FRACCION)
            .set({
              oEstado_iMaestraId: d.iEstadoOrdenId,
              pesajeIniUsu: d.sPesajeIniUsu,
              pesajeIniFec: d.dPesajeIniFec,
              pesajeFinUsu: d.sPesajeFinUsu,
              pesajeFinFec: d.dPesajeFinFec,
            })
            .where({
              ordenFraccionId: d.iOrdenId,
            })
        );
      }
    }

    return { data: true };
  });

  this.on("fnUpdateCantidadConversion", async (req) => {
    const tx = cds.transaction(req);
    const data = req.data;
    var ordenFraccionId = data.ordenFraccionId;
    var grupoOrdenFraccionamientoId = data.grupoOrdenFraccionamientoId;
    var usuario = data.usuario;

    try {
      var aOrdenFrac = await tx.run(
        SELECT.one.from(GRUPO_ORDEN_FRAC_DET).where({
          ordenFraccionId: ordenFraccionId,
          grupoOrdenFraccionamientoId: grupoOrdenFraccionamientoId,
        })
      );

      var oGrupoOrdenFrac = await tx.run(
        SELECT.one.from(GRUPO_ORDEN_FRAC).where({
          grupoOrdenFraccionamientoId: grupoOrdenFraccionamientoId,
        })
      );

      var fFactorConversion = 0;

      /**
       * EVALUA SI REQUIERE CONVERSION POR DIMENSIONES DIFERENTES
       * UNIDAD -> MASA
       */
      debugger;
      var checkDimensionUnits = _checkDimensionUnits("KG", aOrdenFrac.unidad);
      if (checkDimensionUnits == "FACT") {
        var sFilterVC =
          "?$filter=LoteInsumo eq '" +
          aOrdenFrac.loteInsumo +
          "' and CodigoInsumo eq '" +
          aOrdenFrac.codigoInsumo +
          "' and Centro eq '" +
          aOrdenFrac.centro +
          "'";

        var aValoresPropCaracteristicas = await erpsrv.getDinamicSet(
          "/ValoresPropCaracteristicasSet" + sFilterVC
        );
        var aValoresPropCaract = [];

        if (!aValoresPropCaracteristicas.error) {
          aValoresPropCaract = aValoresPropCaracteristicas.d.results;
        }

        if (aValoresPropCaract && aValoresPropCaract.length > 0) {
          var oValoresPropCaracteristica = aValoresPropCaract[0];
          if (oValoresPropCaracteristica) {
            fFactorConversion =
              aOrdenFrac.unidad.toUpperCase() == "MLL"
                ? +oValoresPropCaracteristica.AtflvPesPro.replace(",", ".")
                : +oValoresPropCaracteristica.AtflvPesEsp.replace(",", ".");
          }
        }

        var factConvertDimension = {};
        if (aOrdenFrac.unidad.toUpperCase() == "MLL") {
          /**
           * DIMENSION: UNIDAD
           * VALORES: MLL - MILLARES
           */
          factConvertDimension = _factConvertDimension(
            "UNIDAD",
            oGrupoOrdenFrac.requeridoFinal,
            aOrdenFrac.unidad.toUpperCase(),
            "MASA",
            "KG",
            fFactorConversion
          );
        } else {
          /**
           * DIMENSION: VOLUMEN
           * VALORES: ML - MILILITROS
           * VALORES: L - LITROS
           */

          //Convertir la unidad origen a la unidad base L
          var jsConvertUnits1 = _jsConvertUnits(
            "VOLUMEN",
            aOrdenFrac.unidad.toUpperCase(),
            "L",
            oGrupoOrdenFrac.requeridoFinal
          );

          //Convertir la unidad base L a la dimension de MASA aplicando el factor de conversion (Unidad base en Masa es KG)
          factConvertDimension = _factConvertDimension(
            "VOLUMEN",
            jsConvertUnits1,
            "L",
            "MASA",
            "KG",
            fFactorConversion
          );
        }

        oGrupoOrdenFrac.requeridoFinal = factConvertDimension.value.toFixed(3);
      }

      await tx.run(
        UPDATE(ORDEN_DETALLE)
          .set({
            requeridoFinal: oGrupoOrdenFrac.requeridoFinal,
          })
          .where({ ordenDetalleId: aOrdenFrac.ordenDetalleId })
      );

      await tx.run(
        UPDATE(GRUPO_ORDEN_FRAC)
          .set({
            requeridoFinalConv: oGrupoOrdenFrac.requeridoFinal,
          })
          .where({
            grupoOrdenFraccionamientoId: aOrdenFrac.grupoOrdenFraccionamientoId,
          })
      );

      return { data: true };
    } catch (error) {
      return req.reject(error);
    }
  });

  this.on("fnSetEtiquetaErp", async (req) => {
    var oInfo = Object.assign({}, req.data);
    //fnSetEtiquetaErp?Pedido=70000073&Centro=1021&Orden=300000477&CodigoInsumo=1000010118&Lote=MP00020801&Tipo=IFA&NroItem=1&IdBulto=&IdPos=1&CantidadA=0&Tara=0&UnidadM=KG&Almacen=W001&Status=&Etiqueta=&UsuarioAte=EGARCITI&Impresion=X&Reimpresion=0&DocMat=&CantConsumida='0.000'
    if (!oInfo.Etiqueta) {
      var sPrefixTipo = "";
      if (oInfo.Tipo == "ENTERO") sPrefixTipo = "E";
      if (oInfo.Tipo == "SALDO") sPrefixTipo = "C";
      if (oInfo.Tipo == "SALDO_ALM") sPrefixTipo = "G";
      if (oInfo.Tipo == "SALDO_FRAC_ALM") sPrefixTipo = "G";
      if (oInfo.Tipo == "FRACCION") sPrefixTipo = "F";
      if (oInfo.Tipo == "IFA") sPrefixTipo = "I";
      if (oInfo.Tipo == "IDEN_PROD") sPrefixTipo = "P";

      var sFilter = "?$filter=Tipo_Etiqueta eq '" + sPrefixTipo + "'";
      var data = await erpsrv.getDinamicSet("/Secuencia_EtiquetaSet" + sFilter);
      var oSeqEtiqueta = data.d.results[0];
      if (oSeqEtiqueta) {
        oInfo.Etiqueta = oSeqEtiqueta.Etiqueta;
      } else {
        return { data: [{ error: "Error Generar Data" }] };
      }
    }

    var oBody = {
      Pedido: oInfo.Pedido,
      Centro: oInfo.Centro,
      AtendidoItemSet: [
        {
          Pedido: oInfo.Pedido,
          Centro: oInfo.Centro,
          Orden: oInfo.Orden,
          CodigoInsumo: oInfo.CodigoInsumo,
          Lote: oInfo.Lote,
          Tipo: oInfo.Tipo,
          NroItem: oInfo.NroItem,
          IdBulto: oInfo.IdBulto,
          IdPos: oInfo.IdPos,
          CantidadA: formatWeight(oInfo.CantidadA),
          Tara: formatWeight(oInfo.Tara),
          UnidadM: oInfo.UnidadM,
          Almacen: oInfo.Almacen,
          Status: oInfo.Status,
          Etiqueta: oInfo.Etiqueta,
          UsuarioAte: oInfo.UsuarioAte,
          Impresion: oInfo.Impresion,
          Reimpresion: oInfo.Reimpresion,
          DocMat: oInfo.DocMat,
          CantConsumida: formatWeight(oInfo.CantConsumida),
        },
      ],
    };
    try {
      var data = await erpsrv.postDinamicSet("/AtendidoSet", oBody);
      return { data: data.d };
    } catch (error) {
      return req.reject(error);
    }
  });
});

sortByAttribute = function (array, ...attrs) {
  /** USE:
   var aSort = sortByAttribute(
            aContentList,
            "ordenNumero",
            "ordenPos",
            "numFraccion",
            "numSubFraccion",
            "codigoInsumo",
            "lote"
          );
   */
  let predicates = attrs.map((pred) => {
    let descending = pred.charAt(0) === "-" ? -1 : 1;
    pred = pred.replace(/^-/, "");
    return {
      getter: (o) => o[pred],
      descend: descending,
    };
  });
  return array
    .map((item) => {
      return {
        src: item,
        compareValues: predicates.map((predicate) => predicate.getter(item)),
      };
    })
    .sort((o1, o2) => {
      let i = -1,
        result = 0;
      while (++i < predicates.length) {
        if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
        if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
        if ((result *= predicates[i].descend)) break;
      }
      return result;
    })
    .map((item) => item.src);
};
_fnUpdateOrdenConsolidado = async function (req, sConsolidadoId, aConstant) {
  const tx = cds.transaction(req);

  var aEstadoAllInsumo = aConstant["ESTADO_CP_INSUMO"];
  var iPENDIENTE_PESAJE = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEPE");
  var iPESANDO_EN_SALA = aEstadoAllInsumo.find((o) => o.codigo === "PAIPESA");
  var iPESAJE_FINALIZADO = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEFI");
  var iPESAJE_PRODUCCION = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEPR");
  var iPESAJE_ANULADO = aEstadoAllInsumo.find((o) => o.codigo === "PAIANUL");

  var aOrdenFracConsolidado = await tx.run(
    SELECT.from(GRUPO_ORDEN_FRAC).where({
      oGrupoOrdenConsolidado_grupoOrdenConsolidadoId: sConsolidadoId,
    })
  );

  var aEstados = [];
  if (aOrdenFracConsolidado && aOrdenFracConsolidado.length > 0) {
    aOrdenFracConsolidado.forEach((es) => {
      aEstados.push(es.oEstado_iMaestraId);
    });
  }

  var aEstadoConsolidado = _UniqByKeepFirst(aEstados, (it) => it);

  var iLen = aEstadoConsolidado.length;
  if (iLen == 0) {
    sEstado = "PEFI";
    oEstado = iPESAJE_FINALIZADO;
  } else if (iLen == 1) {
    if (aEstadoConsolidado[0] == iPENDIENTE_PESAJE.iMaestraId) {
      oEstado = iPENDIENTE_PESAJE;
    } else if (aEstadoConsolidado[0] == iPESAJE_PRODUCCION.iMaestraId) {
      oEstado = iPESAJE_PRODUCCION;
    } else if (aEstadoConsolidado[0] == iPESAJE_ANULADO.iMaestraId) {
      oEstado = iPESAJE_ANULADO;
    } else {
      oEstado = iPESAJE_FINALIZADO;
    }
  } else {
    var aFracs = aEstadoConsolidado.filter(
      (d) => d == iPENDIENTE_PESAJE.iMaestraId
    );
    if (aFracs.length > 0) {
      oEstado = iPESANDO_EN_SALA;
    } else {
      oEstado = iPESAJE_FINALIZADO;
    }
  }

  await tx.run(
    UPDATE(GRUPO_ORDEN_CONSOLIDADO)
      .set({
        oEstado_iMaestraId: oEstado.iMaestraId,
      })
      .where({
        grupoOrdenConsolidadoId: sConsolidadoId,
      })
  );

  return {
    iEstadoConsolidadoId: oEstado.iMaestraId,
    iConsolidadoId: sConsolidadoId,
  };
};

_fnUpdateOrdenFrac = async function (
  req,
  pedidoId,
  ordenFraccionId,
  usuario,
  consolidado
) {
  const tx = cds.transaction(req);

  const aMaestraTipo = await tx.run(
    SELECT.from(MIF_ADMIN_HDI_MAESTRA_TIPO).where({
      activo: true,
    })
  );
  const aMaestra = await tx.run(
    SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
      activo: true,
    })
  );
  var aConstant = aMaestra.reduce(function (r, a) {
    var sKey = "NONE";
    var oMaestraTipo = aMaestraTipo.find(
      (o) => o.maestraTipoId === a.oMaestraTipo_maestraTipoId
    );
    if (oMaestraTipo) {
      sKey = oMaestraTipo.tabla;
    }
    r[sKey] = r[sKey] || [];
    r[sKey].push(a);
    return r;
  }, Object.create(null));

  var oPENDIENTE_PESAJE = null;
  var oPESANDO_EN_SALA = null;
  var oPESAJE_FINALIZADO = null;
  var iPENDIENTE_PESAJE = null;
  var iPESANDO_EN_SALA = null;
  var iPESAJE_FINALIZADO = null;
  var iPESAJE_PRODUCCION = null;
  var iPESAJE_ANULADO = null;

  var aOrdenFrac = await tx.run(
    SELECT.from(GRUPO_ORDEN_FRAC_DET).where({
      ordenFraccionId: ordenFraccionId,
    })
  );

  if (aOrdenFrac && aOrdenFrac.length) {
    aOrdenFrac = aOrdenFrac.filter((o) => {
      /**
       * Filtrar solo registros que no esten anulados
       */
      return !(o.InsumoCodigoEstado == "PAIANUL");
    });

    var oOrdenFrac = aOrdenFrac[0];
    if (oOrdenFrac.tipoPedido == "PAI") {
      var aEstadoAllOrden = aConstant["ESTADO_AM_ORDEN"];
      var aEstadoAllInsumo = aConstant["ESTADO_AM_INSUMO"];

      oPROGRAMADO_EN_SALA = aEstadoAllOrden.find((o) => o.codigo === "AMOPRSA");
      oPESANDO_EN_SALA = aEstadoAllOrden.find((o) => o.codigo === "AMOPESA");
      oPESAJE_FINALIZADO = aEstadoAllOrden.find((o) => o.codigo === "AMOPEFI");

      iPENDIENTE_PESAJE = aEstadoAllInsumo.find((o) => o.codigo === "AMIPEPE");
      iPESANDO_EN_SALA = aEstadoAllInsumo.find((o) => o.codigo === "AMIPESA");
      iPESAJE_FINALIZADO = aEstadoAllInsumo.find((o) => o.codigo === "AMIPEFI");
    } else {
      var aEstadoAllOrden = aConstant["ESTADO_CP_ORDEN"];
      var aEstadoAllInsumo = aConstant["ESTADO_CP_INSUMO"];

      oPROGRAMADO_EN_SALA = aEstadoAllOrden.find((o) => o.codigo === "PAOPRSA");
      oPENDIENTE_PESAJE = aEstadoAllOrden.find((o) => o.codigo === "PAOPEPE");
      oPESANDO_EN_SALA = aEstadoAllOrden.find((o) => o.codigo === "PAOPESA");
      oPESAJE_FINALIZADO = aEstadoAllOrden.find((o) => o.codigo === "PAOPEFI");

      oPESAJE_ENTREGPARCIAL = aEstadoAllOrden.find(
        (o) => o.codigo === "PAOPARC"
      );
      oPESAJE_ENTREGTOTAL = aEstadoAllOrden.find((o) => o.codigo === "PAOTOT");
      oPESAJE_ENTREGFISICA = aEstadoAllOrden.find(
        (o) => o.codigo === "PAOENFI"
      );

      iPENDIENTE_PESAJE = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEPE");
      iPESANDO_EN_SALA = aEstadoAllInsumo.find((o) => o.codigo === "PAIPESA");
      iPESAJE_FINALIZADO = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEFI");

      iPESAJE_PRODUCCION = aEstadoAllInsumo.find((o) => o.codigo === "PAIPEPR");

      iPESAJE_ANULADO = aEstadoAllInsumo.find((o) => o.codigo === "PAIANUL");
      iPESAJE_ENTREGPARCIAL = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIPARC"
      );
      iPESAJE_ENTREGTOTAL = aEstadoAllInsumo.find((o) => o.codigo === "PAITOT");
      iPESAJE_ENTREGTOTAL_IFA = aEstadoAllInsumo.find(
        (o) => o.codigo === "PAIETIFA"
      );
    }

    /**
     *
     * INSUMO
     */
    var aEstadoInsumo = [];
    for (var oInsumo of aOrdenFrac) {
      if (oInsumo.InsumoCodigoEstado != iPESAJE_PRODUCCION.codigo) {
        var oEstadoInsumo = null;
        var isEdit = false;

        if (
          [
            iPESAJE_ENTREGPARCIAL.codigo,
            iPESAJE_ENTREGTOTAL.codigo,
            iPESAJE_ENTREGTOTAL_IFA.codigo,
          ].includes(oInsumo.InsumoCodigoEstado)
        ) {
          //Si los estados de los items son Entrega parcial, Entrega total o Entrega total ifa los estados no se modifican
          aEstadoInsumo.push(oInsumo.InsumoCodigoEstado);
        } else if (
          (oInsumo.atendido && +oInsumo.atendido > 0) ||
          oInsumo.requeridoFinal == 0
        ) {
          //Pesaje Finalizado
          if (oInsumo.InsumoCodigoEstado != iPESAJE_FINALIZADO.codigo) {
            oInsumo.InsumoCodigoEstado = iPESAJE_FINALIZADO.codigo;
            oEstadoInsumo = iPESAJE_FINALIZADO;
            isEdit = true;
          }
        } else {
          //Pendiente Pesaje
          if (
            oInsumo.InsumoCodigoEstado != iPENDIENTE_PESAJE.codigo &&
            oInsumo.FracCodigoEstado != iPESAJE_FINALIZADO.codigo
          ) {
            oInsumo.InsumoCodigoEstado = iPENDIENTE_PESAJE.codigo;
            oEstadoInsumo = iPENDIENTE_PESAJE;
            isEdit = true;
          }
        }

        aEstadoInsumo.push(oInsumo.InsumoCodigoEstado);
        if (isEdit) {
          var oOrdenUpdate = {
            oEstado_iMaestraId: oEstadoInsumo.iMaestraId,
          };
          await tx.run(
            UPDATE(ORDEN_DETALLE).set(oOrdenUpdate).where({
              ordenDetalleId: oInsumo.ordenDetalleId,
            })
          );
        }
      } else {
        //Si Pesaje por produccion tomar como si fuera un estado Finalizado (a nivel Logico)
        aEstadoInsumo.push(iPESAJE_FINALIZADO.codigo);
      }

      await _fnUpdateOrdenConsolidado(
        req,
        oInsumo.grupoOrdenConsolidadoId,
        aConstant
      );
    }

    aEstadoInsumo = _UniqByKeepFirst(aEstadoInsumo, (it) => it);

    /**
     *
     * ORDEN
     */
    var sCodigoOrdenEstado = aOrdenFrac[0].oEstado_codigo;
    if (
      [oPESAJE_ENTREGTOTAL.codigo, oPESAJE_ENTREGFISICA.codigo].includes(
        sCodigoOrdenEstado
      )
    ) {
    } else {
      var oEstadoOrden = null;
      if (aEstadoInsumo && aEstadoInsumo.length) {
        var aLeng = aEstadoInsumo.length;
        if (aLeng == 1) {
          var oEstadoInsumo = aEstadoInsumo[0];
          if (oEstadoInsumo == iPENDIENTE_PESAJE.codigo) {
            oEstadoOrden = oPENDIENTE_PESAJE;
          } else if (
            [iPESAJE_FINALIZADO.codigo, iPESAJE_PRODUCCION.codigo].includes(
              oEstadoInsumo
            )
          ) {
            oEstadoOrden = oPESAJE_FINALIZADO;
          }
        } else {
          oEstadoOrden = oPESANDO_EN_SALA;

          if (aEstadoInsumo.includes(iPENDIENTE_PESAJE.codigo)) {
            oEstadoOrden = oPESANDO_EN_SALA;
          } else if (
            aEstadoInsumo.includes(iPESAJE_ENTREGPARCIAL.codigo) ||
            aEstadoInsumo.includes(iPESAJE_ENTREGTOTAL.codigo)
          ) {
            oEstadoOrden = oPESAJE_ENTREGPARCIAL;
          }
        }

        var aDataFraccion = [];

        var oPesajeIni = {};

        if (
          oEstadoOrden.codigo == oPESAJE_FINALIZADO.codigo ||
          oEstadoOrden.codigo == oPESAJE_ENTREGPARCIAL.codigo ||
          (oEstadoOrden.codigo == oPESANDO_EN_SALA.codigo &&
            !oOrdenFrac.OrdenPesajeFechaIni)
        ) {
          var sFilterP =
            "?$filter=Pedido eq '" +
            oOrdenFrac.numPedido +
            "' and Tipo eq 'FRACCION' and Orden eq '" +
            oOrdenFrac.ordenNumero +
            "'";
          var _data = await erpsrv.getDinamicSet("/AtendidoItemSet" + sFilterP);

          if (_data.d) {
            aDataFraccion = _data.d.results;
            aDataFraccion = aDataFraccion.filter(
              (d) => +d.Fraccion == +oOrdenFrac.numFraccion
            );

            aDataFraccion.forEach(function (d) {
              if (d.HoraAte) {
                d.HoraAte = _formatTimeUnit(d.HoraAte);
              }
              //d.FechaAte = getTimestampToYMD(formatDateJson(d.FechaAte));
              var dNewFechaAte = _addHoursToDate(formatDateJson(d.FechaAte), 5);
              d.FechaAte = getTimestampToYMD(dNewFechaAte);
              d.FechaHoraAte = new Date(d.FechaAte + "T" + d.HoraAte);
            });
            aDataFraccion = aDataFraccion.sort((a, b) =>
              a.FechaHoraAte > b.FechaHoraAte
                ? 1
                : b.FechaHoraAte > a.FechaHoraAte
                ? -1
                : 0
            );
          }

          var bOrdenFinalizado =
            oEstadoOrden.codigo == oPESAJE_FINALIZADO.codigo ||
            oEstadoOrden.codigo == oPESAJE_ENTREGPARCIAL.codigo;

          if (!oOrdenFrac.OrdenPesajeFechaIni) {
            oPesajeIni = {
              pesajeIniUsu:
                aDataFraccion.length > 0
                  ? aDataFraccion[0].UsuarioAte
                  : bOrdenFinalizado
                  ? usuario
                  : null,
              pesajeIniFec:
                aDataFraccion.length > 0
                  ? _addHoursToDate(aDataFraccion[0].FechaHoraAte, 5)
                  : bOrdenFinalizado
                  ? new Date()
                  : null,
            };
          }
        }

        var iUltimaFraccion = aDataFraccion.length - 1;
        var oOrdenUpdate = {
          oEstado_iMaestraId: oEstadoOrden.iMaestraId,
          pesajeFinUsu: bOrdenFinalizado
            ? aDataFraccion.length > 0
              ? aDataFraccion[iUltimaFraccion].UsuarioAte
              : usuario
            : null,
          pesajeFinFec: bOrdenFinalizado
            ? aDataFraccion.length > 0
              ? _addHoursToDate(aDataFraccion[iUltimaFraccion].FechaHoraAte, 5)
              : new Date()
            : null,
        };

        oOrdenUpdate = { ...oOrdenUpdate, ...oPesajeIni };
        await tx.run(
          UPDATE(ORDEN_FRACCION).set(oOrdenUpdate).where({
            ordenFraccionId: oOrdenFrac.ordenFraccionId,
          })
        );
      }
    }

    return [];
  }
};

_xForwardedFor = function (sXForwardedFor) {
  try {
    return sXForwardedFor.split(",")[0];
  } catch (error) {
    return "";
  }
};

_now = function () {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
};
_getGroupAppIas = function (sAppName) {
  var aRoleIAS = false;
  if (sAppName.toUpperCase() == "PESAJEIMPBULTOSALDO")
    aRoleIAS = ["TITAN_MOVILE_PESAJEIMPBULTOSALDO", "PORTAL_ADMIN"];

  if (sAppName.toUpperCase() == "MANEJOPEDIDOS")
    aRoleIAS = ["TITAN_MOVILE_CENTRALPESADA", "PORTAL_ADMIN"];

  if (sAppName.toUpperCase() == "CENTRALPESADASPROGRAMACION")
    aRoleIAS = ["TITAN_MOVILE_CENTRALPESADASPROGRAMACION", "PORTAL_ADMIN"];

  return aRoleIAS;
};
_getUserInfo = function (oResource) {
  var oInfo = null;
  if (oResource) {
    oInfo = {
      //userUuid: oResource.userUuid,
      id: oResource.id,
      emails: oResource.emails,
      groups: oResource.groups,
      loginName: oResource.userName,
      displayName: oResource.displayName,
      firstName: oResource.name.givenName,
      lastName: oResource.name.familyName,
    };
    var aAttr =
      oResource["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
    if (aAttr !== undefined) {
      oInfo.attributes = aAttr.attributes;
    }

    var oUser =
      oResource["urn:ietf:params:scim:schemas:extension:sap:2.0:User"];
    if (oUser) {
      oInfo.email = oUser.emails[0].value;
      oInfo.userId = oUser.userId;
    }
  }

  return oInfo;
};

function formatDateJson(d) {
  var m = d.match(/\/Date\((\d+)\)\//);
  return m ? new Date(+m[1]) : null;
}

_toUpperCase = function (sVal) {
  if (sVal) sVal = sVal.toUpperCase();
  return sVal;
};

_buildVariableColaImpresionEE = function (
  oBulto,
  oInsumo,
  oMaterialCarac,
  sUsuario
) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());
  var sFecVence = oMaterialCarac
    ? oMaterialCarac.Fecaduc
      ? oMaterialCarac.Fecaduc
      : "0000-00-00"
    : "0000-00-00";

  var sFecAten = getTimestampToYMD(formatDateJson(oBulto.FechaAte));

  aVariable.push({ codigo: "#01#", valor: oBulto.Orden });
  aVariable.push({ codigo: "#02#", valor: sFecAten });
  aVariable.push({ codigo: "#03#", valor: oBulto.Reimpresion });
  aVariable.push({ codigo: "#04#", valor: oInsumo.OrdenDescrip });
  aVariable.push({ codigo: "#05#", valor: oInsumo.ordenCodProd });
  aVariable.push({ codigo: "#06#", valor: oInsumo.ordenLote });
  aVariable.push({ codigo: "#07#", valor: oInsumo.insumoCodigo });
  aVariable.push({ codigo: "#08#", valor: oInsumo.insumoDescrip });
  aVariable.push({ codigo: "#09#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Lote });

  aVariable.push({ codigo: "#13#", valor: oInsumo.cantSugerida }); //Cantidad Sugerida
  aVariable.push({ codigo: "#14#", valor: formatWeight(oBulto.CantidadA) }); //Cantidad Entregada
  aVariable.push({ codigo: "#16#", valor: oBulto.UnidadM });
  aVariable.push({ codigo: "#16T#", valor: oBulto.UnidadM });
  aVariable.push({ codigo: "#16B#", valor: oBulto.UnidadM });

  aVariable.push({ codigo: "#18#", valor: oBulto.IdBulto });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });

  aVariable.push({ codigo: "#21#", valor: oBulto.UsuarioAte });
  aVariable.push({ codigo: "#22#", valor: oBulto.UsuarioVerificadorBulto });
  aVariable.push({ codigo: "#23#", valor: oBulto.Etiqueta });
  aVariable.push({ codigo: "#24#", valor: oBulto.NroItem });

  var sFactorConversion = "";
  var fFactorConversion = 0;
  if (oMaterialCarac) {
    if (oMaterialCarac.AtflvPesEsp) {
      fFactorConversion = oMaterialCarac.AtflvPesEsp.replace(
        ",",
        "."
      ).replaceAll(" ", "");
      sFactorConversion = "F.c: " + parseFloat(fFactorConversion).toFixed(4);
    }
  }

  var fCantidadA = 0;
  if (fFactorConversion > 0) {
    fCantidadA = oBulto.CantidadA * fFactorConversion;
  }

  aVariable.push({ codigo: "#25#", valor: "" }); //Observaciones

  aVariable.push({
    codigo: "#26#",
    valor: oMaterialCarac ? oMaterialCarac.CondAlmc : "",
  }); //Condiciones Ambientales

  aVariable.push({ codigo: "#100#", valor: String(oInsumo.numFraccion) });

  return aVariable;
};

_buildVariableColaImpresionMP = function (
  oBulto,
  oReserva,
  oInsumo,
  sUsuario,
  oMaterialCarac
) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());
  var sFecVence = oMaterialCarac
    ? oMaterialCarac.Fecaduc
      ? oMaterialCarac.Fecaduc
      : "0000-00-00"
    : "0000-00-00";
  var sFecAten = getTimestampToYMD(formatDateJson(oBulto.FechaAte));
  aVariable.push({ codigo: "#01#", valor: oBulto.Orden });
  aVariable.push({ codigo: "#02#", valor: sFecAten });
  aVariable.push({ codigo: "#03#", valor: oBulto.Reimpresion });
  aVariable.push({
    codigo: "#04#",
    valor: oInsumo.OrdenDescrip ? oInsumo.OrdenDescrip : "",
  });
  aVariable.push({ codigo: "#05#", valor: oInsumo.ordenCodProd });
  aVariable.push({ codigo: "#06#", valor: oInsumo.ordenLote });
  aVariable.push({ codigo: "#07#", valor: oInsumo.insumoCodigo });
  aVariable.push({ codigo: "#08#", valor: oInsumo.insumoDescrip });
  aVariable.push({ codigo: "#09#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Lote });

  var sPotPrac = "";
  if (oMaterialCarac) {
    if (oMaterialCarac.Pprac) {
      sPotPrac = formatPorcent(+oMaterialCarac.Pprac);
    } else {
      sPotPrac = "-";
    }
  } else {
    sPotPrac = "-";
  }

  aVariable.push({
    codigo: "#11#",
    valor: sPotPrac != "0.00" ? sPotPrac : "-",
  }); //Potencia Practica
  aVariable.push({ codigo: "#12#", valor: oInsumo.cantSugerida }); //Cantidad Sugerida
  aVariable.push({ codigo: "#18#", valor: oBulto.IdBulto });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#21#", valor: oBulto.UsuarioAte });
  if (oBulto.Tipo == "IFA") {
    aVariable.push({ codigo: "#22#", valor: "" });
  } else {
    aVariable.push({ codigo: "#22#", valor: oBulto.UsuarioVerificadorBulto });
  }

  aVariable.push({ codigo: "#23#", valor: oBulto.Etiqueta });
  aVariable.push({ codigo: "#24#", valor: oBulto.NroItem });
  var sFactorConversion = "";
  var fFactorConversion = 0;
  if (oMaterialCarac) {
    var sUnidadM = _toUpperCase(oBulto.UnidadM);
    if (sUnidadM == "MLL") {
      if (oMaterialCarac.AtflvPesPro) {
        fFactorConversion = +oMaterialCarac.AtflvPesPro.replace(",", ".");
        sFactorConversion = "F.c: " + parseFloat(fFactorConversion);
      }
    } else if (sUnidadM == "L" || sUnidadM == "ML") {
      if (oMaterialCarac.AtflvPesEsp) {
        fFactorConversion = +oMaterialCarac.AtflvPesEsp.replace(",", ".");
        sFactorConversion = "F.c: " + parseFloat(fFactorConversion);
      }
    }
  }

  var fCantidadA = oBulto.BalanzaPeso;
  var fTara = oBulto.Tara;

  var bMostrarInfo = false;
  if (_toUpperCase(oBulto.UnidadC) == _toUpperCase(oBulto.UnidadM)) {
    bMostrarInfo = true;
  } else {
    if (oBulto.Tipo == "ENTERO") {
      bMostrarInfo = false;
    } else {
      bMostrarInfo = true;
    }
  }
  var sUMB = !bMostrarInfo ? oBulto.UnidadM : oBulto.BalanzaUnidadM;
  switch (oBulto.Tipo) {
    case "FRACCION":
      aVariable.push({
        codigo: "#25#",
        valor:
          _toUpperCase(oBulto.UnidadC) != _toUpperCase(oBulto.UnidadM)
            ? (sFactorConversion != "" ? sFactorConversion + " - " : "") +
              parseFloat(oBulto.CantidadA).toFixed(3) +
              " " +
              oInsumo.insumoUmb +
              " - "
            : "",
      }); //Observaciones
      break;
    case "ENTERO":
      fCantidadA = oBulto.CantidadA;
      sUMB = oBulto.UnidadM;
      aVariable.push({
        codigo: "#25#",
        valor: "Id bulto: " + oBulto.IdBulto,
      }); //Observaciones
      break;
    default:
      //Observaciones
      aVariable.push({
        codigo: "#25#",
        valor: "",
      });
      break;
  }
  aVariable.push({
    codigo: "#26#",
    valor: oMaterialCarac ? oMaterialCarac.CondAlmc : "",
  }); //Condiciones Ambientales
  aVariable.push({ codigo: "#16#", valor: sUMB });
  aVariable.push({ codigo: "#16T#", valor: !bMostrarInfo ? "" : sUMB });
  aVariable.push({ codigo: "#16B#", valor: !bMostrarInfo ? "" : sUMB });
  aVariable.push({ codigo: "#13#", valor: formatWeight(fCantidadA) });
  aVariable.push({
    codigo: "#14#",
    valor: !bMostrarInfo ? "" : formatWeight(fTara),
  });
  aVariable.push({
    codigo: "#15#",
    valor: !bMostrarInfo ? "" : formatWeight(+fCantidadA + +oBulto.Tara),
  });
  aVariable.push({
    codigo: "#27#",
    valor: !bMostrarInfo ? "CANTIDAD" : "P.NETO",
  });
  aVariable.push({ codigo: "#28#", valor: !bMostrarInfo ? "" : "P.TARA" });
  aVariable.push({ codigo: "#29#", valor: !bMostrarInfo ? "" : "P.BRUTO" });

  aVariable.push({ codigo: "#100#", valor: String(oInsumo.numFraccion) });
  aVariable.push({ codigo: "#101#", valor: String(oInsumo.numSubFraccion) });

  return aVariable;
};

_buildVariableColaImpresionIFA = function (
  oBulto,
  oReserva,
  oInsumo,
  sUsuario,
  oMaterialCarac
) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());
  var sFecVence = oMaterialCarac
    ? oMaterialCarac.Fecaduc
      ? oMaterialCarac.Fecaduc
      : "0000-00-00"
    : "0000-00-00";
  var sFecAten = getTimestampToYMD(formatDateJson(oBulto.FechaAte));
  aVariable.push({ codigo: "#01#", valor: oBulto.Orden });
  aVariable.push({ codigo: "#02#", valor: sFecAten });
  aVariable.push({ codigo: "#03#", valor: oBulto.Reimpresion });
  aVariable.push({
    codigo: "#04#",
    valor: oInsumo.OrdenDescrip ? oInsumo.OrdenDescrip : "",
  });
  aVariable.push({ codigo: "#05#", valor: oInsumo.ordenCodProd });
  aVariable.push({ codigo: "#06#", valor: oInsumo.ordenLote });
  aVariable.push({ codigo: "#07#", valor: oInsumo.insumoCodigo });
  aVariable.push({ codigo: "#08#", valor: oInsumo.insumoDescrip });
  aVariable.push({ codigo: "#09#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Lote });

  var sPotPrac = "";
  if (oMaterialCarac) {
    if (oMaterialCarac.Pprac) {
      sPotPrac = formatPorcent(+oMaterialCarac.Pprac);
    } else {
      sPotPrac = "-";
    }
  } else {
    sPotPrac = "-";
  }

  aVariable.push({
    codigo: "#11#",
    valor: sPotPrac != "0.00" ? sPotPrac : "-",
  }); //Potencia Practica
  aVariable.push({ codigo: "#12#", valor: oInsumo.cantSugerida }); //Cantidad Sugerida
  aVariable.push({ codigo: "#18#", valor: oBulto.IdBulto });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });

  if (oBulto.Tipo == "IFA") {
    aVariable.push({ codigo: "#21#", valor: oBulto.VerificadoPor });
    aVariable.push({ codigo: "#22#", valor: oBulto.RealizadoPor });
  } else {
    aVariable.push({ codigo: "#21#", valor: oBulto.UsuarioAte });
    aVariable.push({ codigo: "#22#", valor: oBulto.UsuarioVerificadorBulto });
  }

  aVariable.push({ codigo: "#23#", valor: oBulto.Etiqueta });
  aVariable.push({ codigo: "#24#", valor: oBulto.NroItem });
  var sFactorConversion = "";
  var fFactorConversion = 0;
  if (oMaterialCarac) {
    var sUnidadM = _toUpperCase(oBulto.UnidadM);
    if (sUnidadM == "MLL") {
      if (oMaterialCarac.AtflvPesPro) {
        fFactorConversion = +oMaterialCarac.AtflvPesPro.replace(",", ".");
        sFactorConversion = "F.c: " + parseFloat(fFactorConversion);
      }
    } else if (sUnidadM == "L" || sUnidadM == "ML") {
      if (oMaterialCarac.AtflvPesEsp) {
        fFactorConversion = +oMaterialCarac.AtflvPesEsp.replace(",", ".");
        sFactorConversion = "F.c: " + parseFloat(fFactorConversion);
      }
    }
  }

  var fCantidadA = oBulto.CantidadA;
  var fTara = oBulto.Tara;

  var bMostrarInfo = false;
  if (_toUpperCase(oBulto.UnidadC) == _toUpperCase(oBulto.UnidadM)) {
    bMostrarInfo = true;
  } else {
    if (oBulto.Tipo == "ENTERO") {
      bMostrarInfo = false;
    } else {
      bMostrarInfo = true;
    }
  }
  var sUMB = !bMostrarInfo ? oBulto.UnidadM : oBulto.BalanzaUnidadM;
  switch (oBulto.Tipo) {
    case "FRACCION":
      aVariable.push({
        codigo: "#25#",
        valor:
          _toUpperCase(oBulto.UnidadC) != _toUpperCase(oBulto.UnidadM)
            ? (sFactorConversion != "" ? sFactorConversion + " - " : "") +
              parseFloat(oBulto.CantidadA).toFixed(3) +
              " " +
              oInsumo.insumoUmb +
              " - "
            : "",
      }); //Observaciones
      break;
    case "ENTERO":
      fCantidadA = oBulto.CantidadA;
      sUMB = oBulto.UnidadM;
      aVariable.push({
        codigo: "#25#",
        valor: "Id bulto: " + oBulto.IdBulto,
      }); //Observaciones
      break;
    default:
      //Observaciones
      aVariable.push({
        codigo: "#25#",
        valor: "",
      });
      break;
  }
  aVariable.push({
    codigo: "#26#",
    valor: oMaterialCarac ? oMaterialCarac.CondAlmc : "",
  }); //Condiciones Ambientales
  aVariable.push({ codigo: "#16#", valor: sUMB });
  aVariable.push({ codigo: "#16T#", valor: !bMostrarInfo ? "" : sUMB });
  aVariable.push({ codigo: "#16B#", valor: !bMostrarInfo ? "" : sUMB });
  aVariable.push({ codigo: "#13#", valor: formatWeight(fCantidadA) });
  aVariable.push({
    codigo: "#14#",
    valor: !bMostrarInfo ? "" : formatWeight(fTara),
  });
  aVariable.push({
    codigo: "#15#",
    valor: !bMostrarInfo ? "" : formatWeight(+fCantidadA + +oBulto.Tara),
  });
  aVariable.push({
    codigo: "#27#",
    valor: !bMostrarInfo ? "CANTIDAD" : "P.NETO",
  });
  aVariable.push({ codigo: "#28#", valor: !bMostrarInfo ? "" : "P.TARA" });
  aVariable.push({ codigo: "#29#", valor: !bMostrarInfo ? "" : "P.BRUTO" });

  aVariable.push({ codigo: "#100#", valor: String(oInsumo.numFraccion) });
  aVariable.push({ codigo: "#101#", valor: String(oInsumo.numSubFraccion) });

  return aVariable;
};

_buildVariableColaImpresionSAIFA = async function (
  oBulto,
  oInsumo,
  oMaterialCarac,
  sUsuario
) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());

  var sLoteProvCaractFilter =
    "?$filter=Matnr eq '" +
    oBulto.CodigoInsumo +
    "' and Charg eq '" +
    oBulto.Lote +
    "'";

  var aLoteProvCaractData = await erpsrv.getDinamicSet(
    "/LoteProvCaractSet" + sLoteProvCaractFilter
  );

  var oLoteProvCaractData = {};
  if (!aLoteProvCaractData.error) {
    oLoteProvCaractData = aLoteProvCaractData.d.results[0];
  }

  var sLoteProv =
    oLoteProvCaractData && oLoteProvCaractData.Atwrt
      ? oLoteProvCaractData.Atwrt
      : "";

  var bPotenciaTeor = ["IFA"].includes(oBulto.bSaldo);
  var oValidarHU = null;
  if (bPotenciaTeor) {
    var sFilter =
      "?$filter=Hu eq '" +
      oBulto.IdBulto +
      "' and Codigoinsumo eq '" +
      oBulto.CodigoInsumo +
      "' and Loteinsumo eq '" +
      oBulto.Lote +
      "' and Centroinsumo eq '" +
      oBulto.Centro +
      "'";
    var aValidarHU = await erpsrv.getDinamicSet("/ValidarHuSet" + sFilter);
    if (!aValidarHU.error) {
      oValidarHU = aValidarHU.d.results[0];
    }
  }

  var sFecVence = oMaterialCarac ? oMaterialCarac.Fecaduc : "0000-00-00";

  var sUMB = _toUpperCase(oBulto.UnidadM);
  var sNeto = !bPotenciaTeor
    ? formatWeight(oBulto.pesoNeto)
    : formatWeight(oValidarHU ? oValidarHU.Vemng : 0);

  var sTara = formatWeight(+oValidarHU.Tarag),
    sBruto = formatWeight(+sNeto + +oValidarHU.Tarag);
  var bUnidadOtro = false;
  if (_toUpperCase(oBulto.UnidadC) != _toUpperCase(oBulto.UnidadM)) {
    bUnidadOtro = true;
  }

  aVariable.push({ codigo: "#02#", valor: sNow });
  aVariable.push({ codigo: "#07#", valor: oInsumo.insumoCodigo });
  aVariable.push({ codigo: "#08#", valor: oInsumo.insumoDescrip });
  aVariable.push({ codigo: "#29#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#13#", valor: sNeto });
  aVariable.push({ codigo: "#14#", valor: sTara });
  aVariable.push({ codigo: "#15#", valor: bUnidadOtro ? "-" : sBruto });

  aVariable.push({ codigo: "#16#", valor: oBulto.UnidadM });
  if (["IFA"].includes(oBulto.bSaldo)) {
    aVariable.push({
      codigo: "#16T#",
      valor: oBulto.UnidadM,
    });
    aVariable.push({
      codigo: "#16B#",
      valor: bUnidadOtro ? "" : oBulto.UnidadM,
    });
  } else {
    aVariable.push({
      codigo: "#16T#",
      valor: "",
    });
    aVariable.push({
      codigo: "#16B#",
      valor: "",
    });
  }

  aVariable.push({ codigo: "#18#", valor: oBulto.IdBulto });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#23#", valor: "" });
  aVariable.push({
    codigo: "#24#",
    valor: "-",
  });
  aVariable.push({ codigo: "#26#", valor: "" }); //Condiciones Ambiantales
  aVariable.push({ codigo: "#27#", valor: "-" }); //REF (Numero Orden Compra)
  aVariable.push({ codigo: "#28#", valor: sLoteProv }); //Lote Proveedor
  aVariable.push({ codigo: "#30#", valor: oBulto.IdBulto });
  aVariable.push({
    codigo: "#31#",
    valor: ["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)
      ? ""
      : "CONTROLADO",
  });
  return aVariable;
};

_buildVariableColaImpresionID = function (oBulto, oInsumo, aMaestra) {
  var aVariable = [];

  var sNow = getTimestampToYMD(formatDateJson(oBulto.FechaAte));
  var sPickingIniFec = oInsumo
    ? oInsumo.pickingIniFec
      ? getTimestampToYMD(new Date(oInsumo.pickingIniFec))
      : "0000-00-00"
    : "0000-00-00";

  var sPesajeIniFec = oInsumo
    ? oInsumo.pesajeIniFec
      ? getTimestampToYMD(new Date(oInsumo.pesajeIniFec))
      : "0000-00-00"
    : "0000-00-00";

  aVariable.push({ codigo: "#01#", valor: oInsumo.ordenNumero });
  aVariable.push({ codigo: "#02#", valor: sNow });
  aVariable.push({ codigo: "#04#", valor: oInsumo.OrdenDescrip });
  aVariable.push({ codigo: "#05#", valor: oInsumo.ordenCodProd });
  aVariable.push({ codigo: "#06#", valor: oInsumo.ordenLote });

  var sPrepare = sPesajeIniFec;
  var sLblOrd = "Ord. Fab";
  if (["PAI"].includes(oInsumo.PedidoTipo)) {
    sPrepare = sPickingIniFec;
    sLblOrd = "Ord. Aco/Env";
  }

  aVariable.push({ codigo: "#L010#", valor: sLblOrd });
  aVariable.push({ codigo: "#09#", valor: sPrepare });
  aVariable.push({ codigo: "#18#", valor: oBulto.IdBulto });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#21#", valor: oBulto.UsuarioAte });
  aVariable.push({ codigo: "#23#", valor: oBulto.Etiqueta });
  aVariable.push({ codigo: "#40#", valor: oInsumo.pedidoNumero });
  aVariable.push({ codigo: "#42#", valor: String(oInsumo.PedidoTipoD) }); //Tipo de Pedido

  const oMaestraCentro = aMaestra.find(
    (d) => d.codigoSap == oInsumo.PedidoCentro
  );
  aVariable.push({
    codigo: "#41#",
    valor: oMaestraCentro ? oMaestraCentro.contenido : oInsumo.PedidoCentro,
  });
  aVariable.push({ codigo: "#100#", valor: String(oInsumo.numFraccion) });
  return aVariable;
};

_buildVariableColaImpresionSA = async function (
  oBulto,
  oInsumo,
  oMaterialCarac,
  sUsuario
) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());

  var sLoteProvCaractFilter =
    "?$filter=Matnr eq '" +
    oBulto.CodigoInsumo +
    "' and Charg eq '" +
    oBulto.Lote +
    "'";

  var aLoteProvCaractData = await erpsrv.getDinamicSet(
    "/LoteProvCaractSet" + sLoteProvCaractFilter
  );

  var oLoteProvCaractData = {};
  if (!aLoteProvCaractData.error) {
    oLoteProvCaractData = aLoteProvCaractData.d.results[0];
  }

  var sLoteProv =
    oLoteProvCaractData && oLoteProvCaractData.Atwrt
      ? oLoteProvCaractData.Atwrt
      : "";

  var bPotenciaTeor = ["PT"].includes(oBulto.bSaldo);

  var sFecVence = oMaterialCarac ? oMaterialCarac.Fecaduc : "0000-00-00";

  var sUMB = _toUpperCase(oBulto.UnidadM);
  var sNeto = oBulto.pesoNeto;

  if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
    sNeto = formatWeight(oBulto.CantidadA);
  }

  var sUnidad =
    oBulto.unidadBalanzaSaldo != ""
      ? oBulto.unidadBalanzaSaldo
      : oBulto.UnidadM;

  var sTara = ["PT", "X"].includes(oBulto.bSaldo)
    ? formatWeight(oBulto.pesoTara)
    : "-";

  var sBruto = ["PT", "X"].includes(oBulto.bSaldo)
    ? formatWeight(+oBulto.pesoNeto + +oBulto.pesoTara)
    : "-";

  if (["X"].includes(oBulto.bSaldo)) {
    sTara = formatWeight(oBulto.pesoTara);
    sBruto = formatWeight(+oBulto.pesoNeto + +oBulto.pesoTara);
  }

  var bUnidadOtro = false;
  if (
    _toUpperCase(oBulto.UnidadC) != _toUpperCase(oBulto.UnidadM) ||
    ["PT"].includes(oBulto.bSaldo)
  ) {
    bUnidadOtro = true;
  }

  aVariable.push({ codigo: "#02#", valor: sNow });
  aVariable.push({ codigo: "#07#", valor: oInsumo.insumoCodigo });
  aVariable.push({ codigo: "#08#", valor: oInsumo.insumoDescrip });
  aVariable.push({ codigo: "#29#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#13#", valor: sNeto });
  aVariable.push({ codigo: "#14#", valor: sTara });
  aVariable.push({ codigo: "#15#", valor: bUnidadOtro ? "-" : sBruto });

  if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
    aVariable.push({ codigo: "#22#", valor: oBulto.UsuarioVerificadorBulto });
  }

  aVariable.push({ codigo: "#16#", valor: sUnidad });
  if (["X"].includes(oBulto.bSaldo)) {
    aVariable.push({
      codigo: "#16T#",
      valor: sUnidad,
    });
    aVariable.push({
      codigo: "#16B#",
      valor: bUnidadOtro ? "" : sUnidad,
    });
  } else {
    aVariable.push({
      codigo: "#16T#",
      valor: "",
    });
    aVariable.push({
      codigo: "#16B#",
      valor: "",
    });
  }

  var sIdBulto =
    oBulto.idBultoNuevo && oBulto.idBultoNuevo != ""
      ? oBulto.idBultoNuevo
      : oBulto.IdBulto;
  aVariable.push({
    codigo: "#18#",
    valor: sIdBulto,
  });
  aVariable.push({ codigo: "#19#", valor: oBulto.CodigoInsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Lote });
  aVariable.push({ codigo: "#23#", valor: "" });
  aVariable.push({
    codigo: "#24#",
    valor: "-",
  });
  aVariable.push({ codigo: "#26#", valor: "" }); //Condiciones Ambiantales
  aVariable.push({ codigo: "#27#", valor: "-" }); //REF (Numero Orden Compra)
  aVariable.push({ codigo: "#28#", valor: sLoteProv }); //Lote Proveedor
  aVariable.push({
    codigo: "#30#",
    valor: sIdBulto,
  });
  aVariable.push({
    codigo: "#31#",
    valor: ["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)
      ? ""
      : oMaterialCarac.CondControl,
  });

  aVariable.push({
    codigo: "#32#",
    valor: ["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)
      ? ""
      : oMaterialCarac.CondAlmc,
  });

  return aVariable;
};

_buildVariableColaImpresionSAFrac = async function (oBulto, sUsuario) {
  var aVariable = [];
  var sNow = getTimestampToYMD(new Date());

  var sLoteProvCaractFilter =
    "?$filter=Matnr eq '" +
    oBulto.Codigoinsumo +
    "' and Charg eq '" +
    oBulto.Loteinsumo +
    "'";

  var aLoteProvCaractData = await erpsrv.getDinamicSet(
    "/LoteProvCaractSet" + sLoteProvCaractFilter
  );

  var oLoteProvCaractData = {};
  if (!aLoteProvCaractData.error) {
    oLoteProvCaractData = aLoteProvCaractData.d.results[0];
  }

  var sMaterialCaractFilter =
    "?$filter=LoteInsumo eq '" +
    oBulto.Loteinsumo +
    "' and CodigoInsumo eq '" +
    oBulto.Codigoinsumo +
    "' and Centro eq '" +
    oBulto.Centroinsumo +
    "'";

  var aMaterialCaractData = await erpsrv.getDinamicSet(
    "/ValoresPropCaracteristicasSet" + sMaterialCaractFilter
  );

  var oMaterialCaractData = {};
  if (!aMaterialCaractData.error) {
    oMaterialCaractData = aMaterialCaractData.d.results[0];
  }

  var sValidarMaterialFilter =
    "?$filter=Matnr eq '" +
    oBulto.Codigoinsumo +
    "' and Charg eq '" +
    oBulto.Loteinsumo +
    "'";

  var aValidarMaterialData = await erpsrv.getDinamicSet(
    "/ValidarMaterialSet" + sValidarMaterialFilter
  );

  var oValidarMaterialData = {};
  if (!aValidarMaterialData.error) {
    oValidarMaterialData = aValidarMaterialData.d.results[0];
  }

  var sLoteProv =
    oLoteProvCaractData && oLoteProvCaractData.Atwrt
      ? oLoteProvCaractData.Atwrt
      : "";
  var sFecVence = oMaterialCaractData
    ? oMaterialCaractData.Fecaduc
    : "0000-00-00";
  var sNeto = oBulto.pesoNeto;

  if (["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)) {
    sNeto = formatWeight(oBulto.CantidadA);
  }

  var sUnidad =
    oBulto.unidadBalanzaSaldo != ""
      ? oBulto.unidadBalanzaSaldo
      : oBulto.UnidadM;

  var sTara = ["PT", "X"].includes(oBulto.bSaldo)
    ? formatWeight(oBulto.pesoTara)
    : "-";

  var sBruto = ["PT", "X"].includes(oBulto.bSaldo)
    ? formatWeight(+oBulto.pesoNeto + +oBulto.pesoTara)
    : "-";

  if (["X"].includes(oBulto.bSaldo)) {
    sTara = formatWeight(oBulto.pesoTara);
    sBruto = formatWeight(+oBulto.pesoNeto + +oBulto.pesoTara);
  }

  if (["PT"].includes(oBulto.bSaldo)) {
    sTara = formatWeight(oBulto.Tarag);
  }

  var bUnidadOtro = false;
  if (
    _toUpperCase(oBulto.UnidadC) != _toUpperCase(oBulto.UnidadM) ||
    ["PT"].includes(oBulto.bSaldo)
  ) {
    bUnidadOtro = true;
  }

  aVariable.push({ codigo: "#02#", valor: sNow });
  aVariable.push({ codigo: "#07#", valor: oBulto.Codigoinsumo });
  aVariable.push({
    codigo: "#08#",
    valor: oValidarMaterialData ? oValidarMaterialData.Maktx : "",
  });
  aVariable.push({ codigo: "#29#", valor: sFecVence });
  aVariable.push({ codigo: "#10#", valor: oBulto.Loteinsumo });
  aVariable.push({ codigo: "#13#", valor: sNeto });
  aVariable.push({ codigo: "#14#", valor: sTara });
  aVariable.push({ codigo: "#15#", valor: bUnidadOtro ? "-" : sBruto });

  aVariable.push({ codigo: "#16#", valor: sUnidad });
  if (["X", "PT"].includes(oBulto.bSaldo)) {
    aVariable.push({
      codigo: "#16T#",
      valor: sUnidad,
    });
    aVariable.push({
      codigo: "#16B#",
      valor: bUnidadOtro ? "" : sUnidad,
    });
  } else {
    aVariable.push({
      codigo: "#16T#",
      valor: "",
    });
    aVariable.push({
      codigo: "#16B#",
      valor: "",
    });
  }

  var sIdBulto =
    oBulto.idBultoNuevo && oBulto.idBultoNuevo != ""
      ? oBulto.idBultoNuevo
      : oBulto.IdBulto;
  aVariable.push({
    codigo: "#18#",
    valor: sIdBulto,
  });
  aVariable.push({ codigo: "#19#", valor: oBulto.Codigoinsumo });
  aVariable.push({ codigo: "#20#", valor: oBulto.Loteinsumo });
  aVariable.push({ codigo: "#23#", valor: "" });
  aVariable.push({
    codigo: "#24#",
    valor: "-",
  });
  aVariable.push({ codigo: "#26#", valor: "" }); //Condiciones Ambiantales
  aVariable.push({ codigo: "#27#", valor: "-" }); //REF (Numero Orden Compra)
  aVariable.push({ codigo: "#28#", valor: sLoteProv }); //Lote Proveedor
  aVariable.push({
    codigo: "#30#",
    valor: sIdBulto,
  });
  aVariable.push({
    codigo: "#31#",
    valor: ["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)
      ? ""
      : oMaterialCaractData.CondControl,
  });

  aVariable.push({
    codigo: "#32#",
    valor: ["SALDO_FRAC_ALM", "SALDO_ALM"].includes(oBulto.Tipo)
      ? ""
      : oMaterialCaractData.CondAlmc,
  });
  return aVariable;
};

formatPorcent = function (coin) {
  if (!coin) coin = 0;

  coin = +coin;
  var mOptions = {
    groupingSeparator: "",
    decimalSeparator: ".",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  };
  return formatDecimal(
    coin,
    mOptions.maxFractionDigits,
    mOptions.decimalSeparator,
    mOptions.groupingSeparator
  );
};
formatWeight = function (coin) {
  if (!coin) coin = 0;

  coin = +coin;
  var mOptions = {
    groupingSeparator: "",
    decimalSeparator: ".",
    minFractionDigits: 3,
    maxFractionDigits: 3,
  };
  return formatDecimal(
    coin,
    mOptions.maxFractionDigits,
    mOptions.decimalSeparator,
    mOptions.groupingSeparator
  );
};
formatDecimal = function (number, decPlaces, decSep, thouSep) {
  (decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces),
    (decSep = typeof decSep === "undefined" ? "." : decSep);
  thouSep = typeof thouSep === "undefined" ? "," : thouSep;
  var sign = number < 0 ? "-" : "";
  var i = String(
    parseInt((number = Math.abs(Number(number) || 0).toFixed(decPlaces)))
  );
  var j = (j = i.length) > 3 ? j % 3 : 0;

  return (
    sign +
    (j ? i.substr(0, j) + thouSep : "") +
    i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
    (decPlaces
      ? decSep +
        Math.abs(number - i)
          .toFixed(decPlaces)
          .slice(2)
      : "")
  );
};

getTimestampToYMD = function (oDate) {
  //Type="Edm.DateTime"
  if (!oDate) {
    //d = new Date();
    return "";
  }
  let month = "" + (oDate.getMonth() + 1),
    day = "" + oDate.getDate(),
    year = oDate.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
};

getTimestampToMDY = function (oDate) {
  if (oDate == undefined) {
    return "";
  }
  let month = "" + (oDate.getMonth() + 1),
    day = "" + oDate.getDate(),
    year = oDate.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [month, day, year].join("/");
};

checkDateBT = function (dateFrom, dateTo, dateCheck) {
  var from = new Date(dateFrom);
  var to = new Date(dateTo);
  var check = new Date(dateCheck);

  //Valida si la fecha actual esta en el rango de vigencia del usuario
  if (check > from && check < to) {
    return true;
  } else {
    return false;
  }
};

buildParams = function (oUrlParams, aFilter) {
  var sParams = "";
  var sPrefixExpand = "$expand=";
  var sPrefixFilter = "$filter=";
  var sPrefixSelect = "$select=";
  var sPrefixOrderBy = "$orderby=";
  var sFilter = "";

  if (oUrlParams["$filter"]) {
    sParams =
      sParams + (sParams ? "&" : "?") + sPrefixExpand + oUrlParams["$filter"];
  } else {
    sFilter = formatFilter(aFilter);
    if (sFilter) {
      sParams = sParams + (sParams ? "&" : "?") + sPrefixFilter + sFilter;
    }
  }
  if (oUrlParams["$expand"]) {
    sParams =
      sParams + (sParams ? "&" : "?") + sPrefixExpand + oUrlParams["$expand"];
  }
  if (oUrlParams["$select"]) {
    sParams =
      sParams + (sParams ? "&" : "?") + sPrefixSelect + oUrlParams["$select"];
  }
  if (oUrlParams["$orderby"]) {
    sParams =
      sParams + (sParams ? "&" : "?") + sPrefixOrderBy + oUrlParams["$orderby"];
  }

  return sParams;
};

formatFilter = function (aFilter) {
  var aFilterFormat = [];
  if (aFilter && aFilter.length) {
    var aFilterGroup = aFilter.reduce(function (r, a) {
      var sKey = a.sPath;
      r[sKey] = r[sKey] || [];
      r[sKey].push(a);
      return r;
    }, Object.create(null));

    for (var key in aFilterGroup) {
      var aPath = aFilterGroup[key];

      if (aPath.length > 1) {
        var aPathGroup = [];
        for (var keyP in aPath) {
          var oItem = aPath[keyP];
          aPathGroup.push(getFilter(oItem));
        }
        aFilterFormat.push("(" + aPathGroup.join(" or ") + ")");
      } else {
        var oItem = aPath[0];
        var aPathGroup = [];
        aPathGroup.push(getFilter(oItem));
        aFilterFormat.push(aPathGroup.join(" or "));
      }
    }
  }

  return aFilterFormat.join(" and ");
};
getFilter = function (oFilter) {
  var sFormat = "";
  var isDate = false;
  switch (oFilter.sOperator.toUpperCase()) {
    case "EQ":
      oFilter.sOperator = oFilter.sOperator.toLowerCase();
      isDate = checkDate(oFilter.oValue1);
      if (isDate) {
        oFilter.oValue1 = oFilter.oValue1.replace("Z", "");
      }
      sFormat =
        oFilter.sPath +
        " " +
        oFilter.sOperator +
        " " +
        (isDate ? "datetime" : "") +
        "" +
        (oFilter.oValue1 ? "'" + oFilter.oValue1 + "'" : "''");
      break;

    case "BT":
      oFilter.sOperator = oFilter.sOperator.toLowerCase();
      isDate = checkDate(oFilter.oValue1);
      if (isDate) {
        oFilter.oValue1 = oFilter.oValue1.replace("Z", "");
        oFilter.oValue2 = oFilter.oValue2.replace("Z", "");
      }
      sFormat =
        oFilter.sPath +
        " ge " +
        (isDate ? "datetime" : "") +
        "" +
        (oFilter.oValue1 ? "'" + oFilter.oValue1 + "'" : "''") +
        " and " +
        oFilter.sPath +
        " le " +
        (isDate ? "datetime" : "") +
        "" +
        (oFilter.oValue2 ? "'" + oFilter.oValue2 + "'" : "''");
      sFormat = "(" + sFormat + ")";
      break;

    default:
      break;
  }
  return sFormat;
};
checkDate = function (_date) {
  const _regExp = new RegExp(
    "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
  );
  return _regExp.test(_date);
};
_addHourDate = function (input, hours) {
  if (input) {
    var a = new Date(input);
    return new Date(a.setHours(a.getHours() + hours));
  }

  return ["0000", "00", "00"].join("-") + "T00:00";
};
_getTimeUnit = function (input, unit) {
  var index = input.indexOf(unit);
  var output = "00";
  if (index < 0) {
    return output; // unit isn't in the input
  }

  if (isNaN(input.charAt(index - 2))) {
    return "0" + input.charAt(index - 1);
  } else {
    return input.charAt(index - 2) + input.charAt(index - 1);
  }
};
_formatTimeUnit = function (input) {
  var hours = _getTimeUnit(input, "H");
  var minutes = _getTimeUnit(input, "M");
  var seconds = _getTimeUnit(input, "S");
  return [hours, minutes, seconds].join(":");
};
_formatDateUnit = function (input) {
  if (input) {
    var a = new Date(input);
    a = new Date(a.setHours(a.getHours() + 5));
    var month = "" + (a.getUTCMonth() + 1),
      day = "" + a.getUTCDate(),
      year = a.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-") + "T00:00";
  }

  return ["0000", "00", "00"].join("-") + "T00:00";
};
_UniqByKeepFirst = function (aData, key) {
  var seen = new Set();
  return aData.filter((item) => {
    var k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
};
_formatCharSpecial = function (sText) {
  sText = sText.replaceAll(/</g, "&#60;");
  sText = sText.replaceAll(/</g, "&#62;");
  return sText;
};

_addHoursToDate = function (objDate, intHours) {
  var numberOfMlSeconds = objDate.getTime();
  var addMlSeconds = intHours * 60 * 60000;
  var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);
  return newDateObj;
};

_factConvertDimension = function (
  dimencionFrom,
  subjectFrom,
  from,
  dimencionTo,
  to,
  fact
) {
  //this._factConvertDimension("VOLUMEN", 181.8, "L", "MASA", "KG", 0.909);
  var oDimen = {
    VOLUMEN: {
      MASA: {
        from: "L",
        to: "KG",
        operation: "*",
      },
    },
    MASA: {
      VOLUMEN: {
        from: "KG",
        to: "L",
        operation: "/",
      },
      UNIDAD: {
        from: "KG",
        to: "MLL",
        operation: "/",
      },
    },
    UNIDAD: {
      MASA: {
        from: "MLL",
        to: "KG",
        operation: "*",
      },
    },
  };

  /**
   * Evalua que las dimenciones y unidades de medidas cumplan con la logica de conversion
   */
  var oConvertFact = oDimen[dimencionFrom][dimencionTo];
  if (from == oConvertFact.from && to == oConvertFact.to) {
    if (oConvertFact.operation == "*") {
      oConvertFact.value = subjectFrom * fact;
      return oConvertFact;
    } else if (oConvertFact.operation == "/") {
      oConvertFact.value = subjectFrom / fact;
      return oConvertFact;
    }
    return "NONE";
  } else {
    return "NONE";
  }
};
_checkTipoBalanza = function (from, subject) {
  //this._checkTipoBalanza("KG", 181.8);
  var aTipoBalanzaReq = [
    { balanza: "ANALITICA", umb: "G", from: 0, to: 100, baseUmb: "G" },
    { balanza: "MESA", umb: "G", from: 100, to: 32000, baseUmb: "KG" },
    { balanza: "PISO", umb: "G", from: 32000, to: 150000, baseUmb: "KG" },
  ];

  subject = this._jsConvertUnits("MASA", from, "G", subject);

  var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
    return subject > o.from && subject <= o.to;
  });

  return oTipoBalanzaReq;
};
_checkDimensionUnits = function (from, to) {
  //this._checkDimensionUnits( objBalanza.oUnidad.codigo, oFraccionamiento.unidad);
  to = to.toString().toUpperCase().trim();
  from = from.toString().toUpperCase().trim();

  var MASA = ["MCG", "MG", "G", "KG", "TON", "OZ", "LB"];
  var VOLUMEN = [
    "BOE",
    "FT3",
    "IN3",
    "YD3",
    "MM3",
    "CM3",
    "M3",
    "L",
    "ML",
    "CL",
    "DL",
    "HL",
  ];

  var UNIDAD = ["MLL"];

  var toDimension = VOLUMEN.includes(to)
    ? "VOLUMEN"
    : MASA.includes(to)
    ? "MASA"
    : "NONE";

  if (toDimension == "NONE") {
    toDimension = UNIDAD.includes(to)
      ? "UNIDAD"
      : MASA.includes(to)
      ? "MASA"
      : "NONE";
  }

  var fromDimension = VOLUMEN.includes(from)
    ? "VOLUMEN"
    : MASA.includes(from)
    ? "MASA"
    : "NONE";

  if (fromDimension == "NONE") {
    fromDimension = UNIDAD.includes(from)
      ? "UNIDAD"
      : MASA.includes(from)
      ? "MASA"
      : "NONE";
  }

  if (toDimension == "NONE" || fromDimension == "NONE") {
    // Una de las unidades de conversion no esta registrado en el calculo de conversion
    return "NONE";
  } else {
    if (toDimension == fromDimension) {
      //La unidades pertenecen a la misma dimension y pueden realizarse el calculo de conversion
      return toDimension;
    } else {
      // Requiere Aplicar factor de conversion por DIMENSIONES diferentes
      /**
       * VOLUMEN A MASA: se requiere que la unidad del volumen sea L (Litros)  para pasar a KG (Kilogramos)
       * MASA A VOLUMEN: se requiere que la unidad de la masa sea KG (Kilogramos) para pasar a  L (Litros)
       */
      return "FACT";
    }
  }
};

_jsConvertUnits = function (dimencion, from, to, subject) {
  //this._jsConvertUnits("MASA", "KG", "G", 165.2562);
  var oConversion = {
    special: {
      TEMPERATURA: {
        Kelvin: {
          toKelvin: function (e) {
            return e;
          },
          toCelsius: function (e) {
            return e - 273.15;
          },
          toFahrenheit: function (e) {
            return e * (9 / 5) - 459.67;
          },
          toRankine: function (e) {
            return e * (9 / 5);
          },
        },
        Celsius: {
          toKelvin: function (e) {
            return e + 273.15;
          },
          toCelsius: function (e) {
            return e;
          },
          toFahrenheit: function (e) {
            return e * (9 / 5) + 32;
          },
          toRankine: function (e) {
            return (e + 273.15) * (9 / 5);
          },
        },
        Fahrenheit: {
          toKelvin: function (e) {
            return ((e + 459.67) * 5) / 9;
          },
          toCelsius: function (e) {
            return ((e - 32) * 5) / 9;
          },
          toFahrenheit: function (e) {
            return e;
          },
          toRankine: function (e) {
            return e + 459.67;
          },
        },
        Rankine: {
          toKelvin: function (e) {
            return (e * 5) / 9;
          },
          toCelsius: function (e) {
            return ((e - 491.67) * 5) / 9;
          },
          toFahrenheit: function (e) {
            return e;
          },
          toRankine: function (e) {
            return (e * 9) / 5;
          },
        },
      },
    },
    master: {
      TEMPERATURA: {
        Celsius: "1",
        Kelvin: "1",
        Fahrenheit: "1",
        Rankine: "1",
      },
      DATA: {
        Bit: "1",
        Kilobit: "0.001",
        Megabit: "0.000001",
        Gigabit: "1.0e-9",
        Terabit: "1.0e-12",
        Petabit: "1.0e-15",
        Exabit: "1.0e-18",
        Zettabit: "1.0e-21",
        Yottabit: "1.0e-24",
        Byte: "0.125",
        Kilobyte: "0.00012207",
        Megabyte: "1.1920929e-7",
        Gigabyte: "1.16415322e-10",
        Terabyte: "1.13686838e-13",
        Petabyte: "1.11022302e-16",
        Exabyte: "1.08420217e-19",
        Zettabyte: "1.05879118e-22",
        Yottabyte: "1.03397577e-25",
      },
      DATA_TRASFER: {
        "Bit/Second": "1048576",
        "Bit/Minute": "62914560",
        "Bit/Hour": "3774873600",
        "Byte/Second": "131072",
        "Byte/Minute": "7864320",
        "Byte/Hour": "471859200",
        "Kilobit/Second": "1024",
        "Kilobit/Minute": "61440",
        "Kilobit/Hour": "3686400",
        "Kilobyte/Second": "128",
        "Kilobyte/Minute": "768",
        "Kilobyte/Hour": "460800",
        "Megabit/Second": "1",
        "Megabit/Minute": "60",
        "Megabit/Hour": "3600",
        "Megabyte/Second": "0.125",
        "Megabyte/Minute": "7.5",
        "Megabyte/Hour": "450",
        "Gigabit/Second": "0.000976563",
        "Gigabit/Minute": "0.05859378",
        "Gigabit/Hour": "3.5156268",
        "Gigabyte/Second": "0.00012207",
        "Gigabyte/Minute": "7.3242e-3",
        "Gigabyte/Hour": "0.439452",
        "Terabit/Second": "0.000000954",
        "Terabit/Minute": "5.724e-5",
        "Terabit/Hour": "3.4344e-3",
        "Terabyte/Second": "0.000000119",
        "Terabyte/Minute": "7.14e-6",
        "Terabyte/Hour": "4.284e-4",
        Ethernet: "0.1048576",
        "Ethernet(fast)": "0.01048576",
        "Ethernet(Gigabit)": "0.001048576",
        "ISDN(single)": "16.384",
        "ISDN(dual)": "8.192",
        "Modem(110)": "9532.509090909",
        "Modem(300)": "3495.253333333",
        "Modem(1200)": "873.8133333333",
        "Modem(2400)": "436.9066666667",
        "Modem(9600)": "109.2266666667",
        "Modem(14.4k)": "72.8177777778",
        "Modem(28.8k)": "36.4088888889",
        "Modem(33.6k)": "31.207619048",
        "Modem(56k)": "18.724571429",
        USB: "0.0873813333",
        "Firewire(IEEE-1394)": "0.00262144",
      },
      DISTANCIA: {
        Nanómetro: "1e+09",
        Micrómetro: "1e+06",
        Milímetro: "1000",
        Centimeter: "100",
        Decímetro: "10",
        Metro: "1.000",
        Kilómetro: "0.001",
        Picómetro: "1e+12",
        Femtómetro: "1e+15",
        Attommeter: "1e+18",
        Zeptometer: "1e+21",
        Yoctometer: "1e+24",
        Pulgada: "39.3701",
        Pie: "3.28084",
        Yarda: "1.09361",
        Milla: "0.000621371",
        "Milla(naútica)": "0.000539957",
        "Año luz": "1.057e-16",
        "Día luz": "3.860e-14",
        "Minuto luz": "5.5594e-11",
        "Segundo luz": "3.33564e-9",
        "Astron. Unit": "6.68459e-12",
        Parsec: "3.24078e-17",
        Chain: "0.0497097",
        Furlong: "0.00497097",
        Point: "2834.64",
        Cun: "30",
        Chi: "3",
        Li: "3000",
        Gongli: "6000",
      },
      FUERZA: {
        Newton: "1",
        Kilonewton: "0.001",
        Milinewton: "1000",
        Dina: "100000",
        "Joule/Metro": "1",
        Pond: "101.971621298",
        Kilopond: "0.101971621298",
      },
      POTENCIA: {
        Watt: "1",
        Milliwatt: "1000",
        Kilowatt: "0.001",
        Megawatt: "0.000001",
        "Joule/Segundo": "1",
        "Kilojoule/Segundo": "0.001",
        Horsepower: "0.001341",
        "Horsepower(metric)": "0.0013596",
        "Horsepower(Boiler)": "0.000102",
        "Decibel Milliwatt": "30",
        "Calories/Second": "0.238846",
        "Calories/Hour": "859.8456",
        "Kilocalories/Second": "0.000238846",
        "Kilocalories/Hour": "0.8598456",
        "Foot-Pound/Second": "0.737562",
        "Foot-Pound/Hour": "2655.22",
        "Newton Meter/Second": "1",
        "Newton Meter/Hour": "3600",
        "BTU/Second": "0.000947817",
        "BTU/Minute": "0.056869",
        "BTU/Hour": "3.41214",
      },
      PRESION: {
        Pascal: "1.0",
        Kilopascal: "0.001",
        Hectopascal: "0.01",
        Millipascal: "1000",
        "Newton/Metro cuadrado": "1",
        Bar: "0.00001",
        Millibar: "0.01",
        "Kip/Inch": "0.000000145",
        "Pounds/Inch": "0.000145038",
        Torr: "0.007500617",
        "Millimeter Mercury": "0.00750062",
        "Inches Mercury": "0.000295301",
      },
      RADIOACTIVIDAD: {
        Curie: "1",
        Kilocurie: "0.001",
        Millicurie: "1000",
        Microcurie: "1000000",
        Nanocurie: "1000000000",
        Picocurie: "1e+12",
        Becquerel: "3.7e+10",
        Terabecquerel: "0.037",
        Gigabecquerel: "37",
        Megabecquerel: "37000",
        Kilobecquerel: "37000000",
        Milliecquerel: "3.7e+13",
        Rutherford: "37000",
        "1/Second": "3.7e+10",
        "Disintegrations/Second": "3.7e+10",
        "Disintegrations/Minute": "2.22e+12",
      },
      TIEMPO: {
        Milisegundo: "604800000",
        Microsegundo: "604800000000",
        Nanosegundo: "604800000000000",
        Segundo: "604800",
        Minuto: "10080",
        Hora: "168",
        Día: "7",
        Semana: "1",
        "Mes(31)": "0.22580645",
        "Mes(30)": "0.2333333333",
        "Mes(29)": "0.24137931",
        "Mes(28)": "0.25",
        Año: "0.019165",
      },
      VELOCIDAD: {
        "Metro/Segundo": "4.4704e-1",
        "Metro/Hora": "1.609344e+3",
        "Kilometro/Hora": "1.609344",
        "Pie/Hora": "5.28e+3",
        "Yarda/Hora": "1.76e+3",
        "Millas/Hora": "1",
        Nudos: "8.68976242e-1",
        "Mach(SI Standard)": "1.51515152e-3",
        "Velocidad de la luz": "1.49116493e-9",
      },
      DENSIDAD: {
        "Kilogramo/Litro": "0.001",
        "Gramo/Litro": "1",
        "Milígramo/Litro": "1000",
        "Microgramo/Litro": "1000000",
        "Nanogramm/Liter": "1000000000",
        "Kilogramo/Metro cúbico": "1",
        "Gramo/Metro cúbico": "1000",
        "Kilogramo/Centímetro cúbico": "0.000001",
        "Gramo/Centímetro cúbico": "0.001",
        "Gramo/Milímetro cúbico": "0.000001",
        "Pound/Inch": "0.00003613",
        "Pound/Foot": "0.06242796",
        "Ounze/Inch": "0.00057804",
        "Ounze/Foot": "0.99884737",
      },
      VOLUMEN: {
        BOE: "6.28981",
        FT3: "35.31466621",
        IN3: "61023.74409473",
        YD3: "1.30796773",
        MM3: "1000000000",
        CM3: "1000000",
        M3: "1",
        L: "1000",
        ML: "1000000",
        CL: "100000",
        DL: "10000",
        HL: "10",
      },
      MASA: {
        MCG: "1000000",
        MG: "1000",
        G: "1",
        KG: "0.001",
        TON: "0.000001",
        OZ: "0.035273962",
        LB: "0.00220462262",
      },
      UNIDAD: {
        MLL: "1",
      },
    },
  };
  dimencion = dimencion.toUpperCase().substring(0, 1) + dimencion.substring(1);
  to = to.toString().toUpperCase().trim();
  from = from.toString().toUpperCase().trim();
  subject = subject.toString().toUpperCase().trim();
  var specialTest = false;
  for (var i in oConversion.special) {
    if (i == dimencion) {
      specialTest = i;
    }
  }
  if (specialTest !== false) {
    if (typeof oConversion.special[specialTest][from] !== "undefined") {
      return oConversion.special[specialTest][from]["to" + to](subject);
    }
    return false;
  }
  return (
    (oConversion.master[dimencion][to] / oConversion.master[dimencion][from]) *
    subject
  );
  //.toFixed(3)

  //jsConvertUnits('MASA', 'KG', 'G', '1');
  //jsConvertUnits('VOLUMEN', 'ML', 'L', '1000');
};
