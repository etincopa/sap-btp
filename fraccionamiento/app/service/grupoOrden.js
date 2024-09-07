sap.ui.define(
  [
    "mif/cp/fraccionamiento/util/http",
    "mif/cp/fraccionamiento/util/oData",
    "mif/cp/fraccionamiento/util/formatter",
  ],
  function (http, oDataSrv, formatter) {
    "use strict";
    return {
      oServiceModel: null,
      oServiceModelV2: null,
      oServiceModelLoc: null,
      init: function (oServiceModelLoc, oServiceModel, oServiceModelV2) {
        this.oServiceModel = oServiceModel;
        this.oServiceModelV2 = oServiceModelV2;
        this.oServiceModelLoc = oServiceModelLoc;
      },
      /**/
      maestra: async function () {
        let aMaestra = await this._getServiceModel().read(
          "/Maestra",
          "activo eq true?$expand=oMaestraTipo"
        );
        var aConstant = aMaestra.reduce(function (r, a) {
          var sKey = "NONE";
          if (a.oMaestraTipo) {
            sKey = a.oMaestraTipo.tabla
              ? a.oMaestraTipo.tabla.toUpperCase()
              : "";
          } else {
            if (a.oMaestraTipo_tabla) {
              sKey = a.oMaestraTipo_tabla.toUpperCase();
            } else {
            }
          }
          r[sKey] = r[sKey] || [];
          r[sKey].push(a);
          return r;
        }, Object.create(null));
        return aConstant;
      },
      obtenerSalaPesaje: async function (sSalaPesajeId, sPlantaId) {
        var sFilter = "activo eq true";
        if (sSalaPesajeId && sSalaPesajeId !== "") {
          sFilter += " and salaPesajeId eq '" + sSalaPesajeId + "'";
        }
        if (sPlantaId && sPlantaId !== "") {
          sFilter += " and oPlanta_iMaestraId eq " + sPlantaId;
        }
        sFilter +=
          "?$expand=oPlanta,oEstadoPesoManual,oEstadoTaraManual,oEstadoLecturaEtiqueta";

        var salaPesajes = await this._getServiceModel().read(
          "/SALA_PESAJE",
          sFilter
        );
        if (salaPesajes && salaPesajes.length) {
          salaPesajes = salaPesajes.sort((a, b) => (a.sala > b.sala ? 1 : -1));
          salaPesajes = this._formatSalaPesaje(salaPesajes);
        }
        return salaPesajes;
      },
      obtenerPlantas: async function (sPlantaId) {
        var sFilter = "activo eq true";
        if (sPlantaId && sPlantaId !== "") {
          sFilter += " and iMaestraId eq " + sPlantaId;
        }

        const plantas = await this._getServiceModel().read("/PLANTA", sFilter);
        return plantas;
      },
      obtenerFactor: async function () {
        const aFactorConversion = await this._getServiceModel().read(
          "/FACTOR_CONVERSION"
        );
        return aFactorConversion;
      },
      _factConversion: function (
        cantPesar,
        umInsumo,
        cantBalanza,
        umBalanza,
        aFactConversion
      ) {
        var aTipoBalanzaReq = [
          { balanza: "ANALITICA", umb: "G", from: 0, to: 100 },
          { balanza: "MESA", umb: "G", from: 100, to: 32000 },
          { balanza: "PISO", umb: "G", from: 32000, to: 150000 },
        ];

        var iFact = 1;
        if (umBalanza.toUpperCase() === umInsumo.toUpperCase()) {
          iFact = 1;
        } else {
          var oFactConversion = aFactConversion.find((o) => {
            return (
              o.codigoSap == umInsumo.toUpperCase() &&
              o.codigo == umBalanza.toUpperCase()
            );
          });

          iFact = oFactConversion ? +oFactConversion.campo1 : 1;
        }

        var iCantFact = +cantPesar;
        if (umInsumo.toUpperCase() === "KG") {
          iCantFact = +cantPesar * 1000;
        }
        var oTipoBalanzaReq = aTipoBalanzaReq.find((o) => {
          return iCantFact > o.from && iCantFact <= o.to;
        });

        var iPesoFact = +cantBalanza * iFact;

        return {
          oInsumo: {
            peso: cantPesar,
            umb: umInsumo,
          },
          oBalanza: {
            tipo: oTipoBalanzaReq ? oTipoBalanzaReq.balanza : "",
            peso: cantBalanza,
            umb: umBalanza,
          },
          oFactorToBalanza: {
            peso: iPesoFact,
            umb: umInsumo,
            factor: iCantFact,
          },
        };
      },
      obtenerBalanzas: async function (oParam) {
        let oResult = {};
        let result = [];
        let self = this;

        const aBalanzas = await this._getServiceModel().read(
          "/BALANZA",
          "activoBalanza eq 'X' and oSalaPesaje_salaPesajeId eq '" +
            oParam.sSalaPesajeId +
            "'?$expand=oUnidad,oPuertoCom,oTipoBalanza"
        );

        var aBalanzas2 = [];
        var sUnidadBalanza = "";

        aBalanzas.forEach((oBalanza) => {
          if (oBalanza.oUnidad) {
            oBalanza.oUnidad_codigo = oBalanza.oUnidad.codigo;
            oBalanza.oUnidad_contenido = oBalanza.oUnidad.contenido;
          }
          if (oBalanza.oPuertoCom) {
            oBalanza.oPuertoCom_contenido = oBalanza.oPuertoCom.contenido;
          }

          var fPendiente = oParam.fPendiente;

          if (oParam.sUnidad.toUpperCase() === "KG"){
            fPendiente = fPendiente * 1000
          }
          

          var fCapacidadMinimo = oBalanza.capacidadMinimo;
          var fCapacidadMaximo = oBalanza.capacidadMaximo;

          if (oBalanza.oUnidad_contenido.toUpperCase() === "KG"){
            fCapacidadMinimo = fCapacidadMinimo * 1000
            fCapacidadMaximo = fCapacidadMaximo * 1000
          }

          if (
            fPendiente >= parseFloat(fCapacidadMinimo) &&
            fPendiente <= parseFloat(fCapacidadMaximo)
          ) {
            oBalanza.tipoBalanza = oBalanza.oTipoBalanza.codigo;
            oBalanza.codigoBalanza = oBalanza.codigo;
            oBalanza.codigo =
              "Balanza: " +
              oBalanza.capacidadMinimo +
              " a " +
              oBalanza.capacidadMaximo +
              " " +
              oBalanza.oUnidad.contenido;
            aBalanzas2.push(oBalanza);

            sUnidadBalanza = oBalanza.oUnidad_codigo;
          }
        });

        result = result.concat(aBalanzas2);

        oResult.aBalanzas = result;
        oResult.sUnidadBalanza = sUnidadBalanza;

        return oResult;
      },
      actualizarEtiquetaOrden: async function (obj) {
        var oOrden = { etiqueta: obj.etiqueta };
        var sPath = this.oServiceModelV2.createKey("/ORDEN_FRACCION", {
          ordenFraccionId: obj.ordenFraccionId,
        });
        await this._updateFunctionResult(sPath, oOrden);
      },
      obtenerBalanzaList: async function (sSalaPesajeId) {
        const aBalanzas = await this._getServiceModel().read(
          "/BALANZA",
          "activoBalanza eq 'X' and oSalaPesaje_salaPesajeId eq '" +
            sSalaPesajeId +
            "'?$expand=oUnidad,oPuertoCom,oTipoBalanza"
        );
        return aBalanzas;
      },
      obtenerOrdenesSinAgrupar: async function (salaPesajeId) {
        let aResult = [];

        var aDetalles = await this._getServiceModel().read(
          "/GRUPO_ORDEN_DET",
          "activo eq true"
        );
        let aOrdenes = await this._getServiceModel().read(
          "/VIEW_PEDIDO_ORDEN_CONSOLIDADO",
          "oEstado_codigo eq 'PAOPRSA' and salaPesajeId eq '" +
            salaPesajeId +
            "'"
        );

        aOrdenes = aOrdenes.sort((a, b) => {
          const compareName = a.pedidoNumero.localeCompare(b.pedidoNumero);
          const compareTitle = a.numero.localeCompare(b.numero);

          return compareName || compareTitle || a.numFraccion - b.numFraccion;
        });

        let codigo = 1;
        aOrdenes.forEach(function (item) {
          const oDetalle = aDetalles.some(
            (e) => e.oOrdenFraccion_ordenFraccionId == item.ordenFraccionId
          );
          if (!oDetalle) {
            item.codigo = codigo;
            codigo += 1;
            aResult.push(item);
          }
        });

        return aResult;
      },
      obtenerImpresoras: async function (sPlantaId, sImpresoraId) {
        /**
         * Obtener inpresoras que esten activas (estadoImpresora) y
         * que tengan como indicador para Central Pesada (indicadorCp)
         */
        var sFilter =
          "activo eq true and estadoImpresora eq true and indicadorCp eq true";
        if (sPlantaId && sPlantaId !== "") {
          sFilter += " and oPlanta_iMaestraId eq " + sPlantaId;
        }
        if (sImpresoraId && sImpresoraId !== "") {
          sFilter += " and impresoraId eq '" + sImpresoraId + "'";
        }
        const aImpresoras = await this._getServiceModel().read(
          "/IMPRESORA",
          sFilter
        );
        return aImpresoras;
      },
      obtenerEstadosConsolidado: async function () {
        let aEstados = await this._getServiceModel().read(
          "/ESTADO_CONSOLIDADO",
          "activo eq true and (codigo eq 'PAIPEPE' or codigo eq 'PAIPESA' or codigo eq 'PAIPEFI' or codigo eq 'PAIPEPR')"
        );
        return aEstados;
      },
      obtenerEstadosOrden: async function () {
        let aEstados = await this._getServiceModel().read(
          "/ESTADO_ORDEN",
          "activo eq true and (codigo eq 'PAOPRSA' or codigo eq 'PAOPESA' or codigo eq 'PAOPEFI')"
        );
        aEstados = aEstados.sort((b, a) =>
          a.Orden > b.Orden ? -1 : b.Orden > a.Orden ? 1 : 0
        );
        return aEstados;
      },
      obtenerTiposBulto: async function () {
        let aTipos = await this._getServiceModel().read(
          "/TIPO_BULTO",
          "activo eq true"
        );
        return aTipos;
      },
      obtenerUnidades: async function () {
        let aUnidades = await this._getServiceModel().read(
          "/UNIDAD",
          "activo eq true"
        );
        return aUnidades;
      },
      /* ATENCION ORDEN */
      obtenerGrupoOrdenes: async function (salaPesajeId) {
        var that = this;
        let grupoOrdenes = await this._getServiceModel().read(
          "/GRUPO_ORDEN_ATENCION",
          "oSala_salaPesajeId eq '" + salaPesajeId + "'?$expand=oSalaPesaje"
        );

        //detalles = detalles.filter(d => (d.oEstado_codigo == 'PAOPESA' || d.oEstado_codigo == 'PAOPEFI'))
        grupoOrdenes = grupoOrdenes.filter(
          (d) =>
            d.totalIniciada > 0 || d.totalPendiente > 0 || d.totalFinalizado > 0
        );

        grupoOrdenes = grupoOrdenes.sort((a, b) =>
          a.codigo > b.codigo ? 1 : -1
        );

        var dFechaActual = new Date();
        var dFechaFuturo = new Date().setDate(dFechaActual.getDate() + 3);
        var dTo = formatter.fechaMDA(new Date(dFechaFuturo));

        grupoOrdenes.forEach(function (item) {
          item.totalIniciada = 0;
          item.totalPendiente = 0;
          item.totalFinalizado = 0;
          item.total = 0;
        });

        var aGrupoOrdenesFiltro = [];
        var dFrom = formatter.fechaMDA(dFechaActual);
        grupoOrdenes.forEach(function (item, idx) {
          if (item.oSalaPesaje) {
            item.grupoSala = item.oSalaPesaje_sala ? item.oSalaPesaje_sala : item.oSalaPesaje.sala;
          }
          if (["PAOPESA", "AMOPESA"].includes(item.ordenFraccionEstado)) {
            item.totalIniciada += 1;
          }

          if (
            ["PAOPRSA", "PAOPEPE", "AMOPRSA"].includes(item.ordenFraccionEstado)
          ) {
            item.totalPendiente += 1;
          }

          if (["PAOPEFI"].includes(item.ordenFraccionEstado)) {
            item.totalFinalizado += 1;
          }

          item.total =
            item.totalIniciada + item.totalPendiente + item.totalFinalizado;
          //item.grupoSala = item.oSalaPesaje.sala;

          if (item.totalFinalizado == item.total) {
            var dPesajeFecFin = (
              item.pesajeFinFec ? new Date(item.pesajeFinFec) : dFechaActual
            ).getTime();

            var dCheck = formatter.fechaMDA(dPesajeFecFin);

            var fCheck = new Date(dCheck);
            var dNewCheck = formatter.fechaMDA(
              fCheck.setDate(fCheck.getDate() + 3)
            );

            if (
              that.checkDateBTGrupo(dFrom, dTo, dNewCheck) ||
              formatter.fechaMDA(item.fechaRegistro) == dFrom ||
              item.pesajeFinFec == null
            ) {
              aGrupoOrdenesFiltro.push(item);
            }
          } else {
            aGrupoOrdenesFiltro.push(item);
          }
        });

        var result = [];
        aGrupoOrdenesFiltro.reduce(function (res, value) {
          var sKey = value.grupoOrdenId + "_" + value.oSala_salaPesajeId;
          if (!res[sKey]) {
            res[sKey] = {
              codigo: value.codigo,
              grupoOrdenId: value.grupoOrdenId,
              total: 0,
              totalIniciada: 0,
              totalPendiente: 0,
              totalFinalizado: 0,
              usuarioRegistro: value.usuarioRegistro,
              fechaRegistro: value.fechaRegistro,
              usuarioActualiza: value.usuarioActualiza,
              fechaActualiza:
                value.usuarioActualiza && value.usuarioActualiza != ""
                  ? value.fechaActualiza
                  : "",
              grupoSala: value.grupoSala,
            };
            result.push(res[sKey]);
          }
          res[sKey].total += value.total;
          res[sKey].totalIniciada += value.totalIniciada;
          res[sKey].totalPendiente += value.totalPendiente;
          res[sKey].totalFinalizado += value.totalFinalizado;
          return res;
        }, {});

        return result;
      },
      obtenerMaxGrupoOrden: async function (salaPesajeId) {
        var that = this;
        let grupoOrdenes = await this._getServiceModel().read(
          "/GRUPO_ORDEN",
          "oSalaPesaje_salaPesajeId eq '" +
            salaPesajeId +
            "' and activo eq true"
        );
        grupoOrdenes = grupoOrdenes.sort((a, b) =>
          Number(a.codigo) > Number(b.codigo) ? 1 : -1
        );
        return grupoOrdenes && grupoOrdenes.length > 0
          ? grupoOrdenes[grupoOrdenes.length - 1].codigo
          : "0";
      },
      obtenerGrupoOrdenDetalle: async function (grupoOrdenId, salaPesajeId) {
        var detalles = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          "grupoOrdenId eq '" +
            grupoOrdenId +
            "' and insumoSalaPesajeId eq '" +
            salaPesajeId +
            "' and (oEstado_codigo eq 'PAOPESA' or oEstado_codigo eq 'PAOPEPE' or oEstado_codigo eq 'PAOPEFI')"
        );


        detalles = this._UniqByKeepFirst(detalles, (item) => item.numPedido + "_" + item.ordenNumero + "_" + item.codigoProducto + "_" + item.ordenLote + "_" + item.centro + "_" + item.numFraccion);

        if (detalles.length == 0) return [];

        //detalles = detalles.filter(d => (d.oEstado_codigo == 'PAOPESA' || d.oEstado_codigo == 'PAOPEFI'))

        detalles.forEach(function (item) {
          item.pesajeFinalizado = item.oEstado_codigo == "PAOPEFI";
          item.pedidoNumero = item.numPedido;
          item.pedidoCentro = item.centro;
          item.numero = item.ordenNumero;
          item.codProdTerm = item.codigoProducto;
          item.nomProdTerm = item.nombreProducto;
          item.lote = item.ordenLote;
          item.activo = true;
        });

        detalles = detalles.sort((a, b) => {
          const compareOrden = a.ordenNumero.localeCompare(b.ordenNumero);
          const comparePedido = a.numPedido.localeCompare(b.numPedido);

          return compareOrden || comparePedido || a.numFraccion - b.numFraccion;
        });

        var result = [];
        var idx = 1;
        detalles.reduce(function (res, value) {
          var sKey =
            value.numPedido +
            "_" +
            value.ordenNumero +
            "_" +
            value.codigoProducto +
            "_" +
            value.ordenLote +
            "_" +
            value.numFraccion;
          if (!res[sKey]) {
            value.codigo = idx;
            res[sKey] = value;
            result.push(res[sKey]);
            idx++;
          }
          return res;
        }, {});

        return result;
      },
      /**/
      obtenerBultos: async function (fraccionamientoId) {
        let sFilter =
          "oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId eq '" +
          fraccionamientoId +
          "'";
        let grupoOrdenes = await this._getServiceModel().read(
          "/GRUPO_ORDEN_BULTO",
          sFilter + ""
        );

        grupoOrdenes.forEach(function (item) {
          item.total = +item.cantidad + +item.tara;
          item.idBultoCust = item.ordenDetalleId == null ? item.etiqueta : item.idBulto
        });

        return grupoOrdenes;
      },
      obtenerBultosDet: async function (fraccionamientoId, sTipoBulto) {
        let sFilter =
          "grupoOrdenFraccionamientoId eq '" + fraccionamientoId + "'";

        if (sTipoBulto && sTipoBulto !== "") {
          sFilter += " and B_tipo eq '" + sTipoBulto + "'";
        }
        let grupoOrdenes = await this._getServiceModel().read(
          "/GRUPO_ORDEN_BULTO_DET",
          sFilter
        );
        return grupoOrdenes;
      },
      crearGrupoOrden: async function (salaPesajeId, codigo) {
        let result = {};
        result.activo = true;
        result.codigo = codigo;
        result.oSalaPesaje_salaPesajeId = salaPesajeId;
        return result;
      },
      obtenerConsolidado: async function (grupoOrdenConsolidadoId) {
        var aConsolidado = await this._getServiceModel().read(
          "/GRUPO_ORDEN_CONSOLIDADO_DET",
          "grupoOrdenConsolidadoId eq '" + grupoOrdenConsolidadoId + "'"
        );
        //var aConsolidados = this._agrupaConsolidado(aConsolidados);
        return aConsolidado[0];
      },
      obtenerConsolidados: async function (
        grupoOrdenId,
        estadoId,
        salaPesajeId
      ) {
        var aConsolidados = await this._getServiceModel().read(
          "/GRUPO_ORDEN_CONSOLIDADO_DET",
          "oGrupoOrden_grupoOrdenId eq '" +
            grupoOrdenId +
            "' and oEstado_iMaestraId eq " +
            estadoId +
            " and oSala_salaPesajeId eq '" +
            salaPesajeId +
            "'"
        );
        var aOrdenFracDet = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          "grupoOrdenId eq '" +
            grupoOrdenId + "'"
        );

        aConsolidados = this._agrupaConsolidado(aConsolidados);
        aConsolidados.forEach(async function (e) {
          var aFracDet = aOrdenFracDet.filter(
            (d) => d.grupoOrdenConsolidadoId == e.grupoOrdenConsolidadoId
          );

          var aFracDetOtraSala = aOrdenFracDet.filter(
            (d) =>
              d.codigoInsumo == e.codigoInsumo &&
              d.loteInsumo == e.lote &&
              d.centroInsumo == e.centro &&
              ["PAIPESA", "PAIPEPE"].includes(d.InsumoCodigoEstado) &&
              d.insumoSalaPesajeId != salaPesajeId
          );

          e.tieneOtraSala = aFracDetOtraSala.length > 0 ? "S" : "";

          var fAtendido = aFracDet
            .map((e) => (e.atendido != null ? +e.atendido : 0))
            .reduce((a, b) => a + b, 0);

          e.totalAtendido = fAtendido;
          e.unidad = aFracDet[0].unidadOrigen;
        });

        aConsolidados = aConsolidados.sort((a, b) => {
          const compareCodigoInsumo = a.codigoInsumo ? a.codigoInsumo.localeCompare(b.codigoInsumo) : false;
          const compareLote = a.lote ? a.lote.localeCompare(b.lote) : false;

          return (compareCodigoInsumo || compareLote);
        });

        return aConsolidados;
      },
      obtenerGrupoOrden: async function (grupoOrdenId) {
        const aResult = await this._getServiceModel().read(
          "/GRUPO_ORDEN_ATENCION",
          "grupoOrdenId eq '" + grupoOrdenId + "'"
        );
        return aResult[0];
      },
      guardarGrupoOrden: async function (oGrupoOrden, aGrupoOrdenDetalle) {
        var bGrupoActivo = oGrupoOrden.activo;

        const aInserted = aGrupoOrdenDetalle.filter(
          (e) => !e.grupoOrdenDetalleId
        );
        const aUpdated = aGrupoOrdenDetalle.filter(
          (e) => e.grupoOrdenDetalleId
        );

        var aGrupoDetalle = aUpdated.filter((d) => d.activo == false);

        const sUsuario = window.localStorage.getItem("usuarioCodigo");

        var result = null;
        let aNewDet = [];
        let aUpdDet = [];

        aInserted.forEach(function (item) {
          let oDetalle = {};
          oDetalle.activo = true;
          oDetalle.codigo = item.codigo;
          oDetalle.grupoOrdenDetalleId = http.guid();
          //oDetalle.oGrupoOrden_grupoOrdenId = oGrupoOrden.grupoOrdenId;
          oDetalle.oOrdenFraccion_ordenFraccionId = item.ordenFraccionId;
          oDetalle.usuarioRegistro = sUsuario;
          oDetalle.fechaRegistro = new Date();
          aNewDet.push(oDetalle);
        });

        aUpdated.forEach(function (item) {
          item.fechaActualiza = new Date();
          item.usuarioActualiza = sUsuario;
          aUpdDet.push(item);
        });

        if (oGrupoOrden.grupoOrdenId) {
          oGrupoOrden.usuarioActualiza = sUsuario;
          oGrupoOrden.fechaActualiza = new Date();
        } else {
          oGrupoOrden.usuarioRegistro = sUsuario;
          oGrupoOrden.fechaRegistro = new Date();
        }

        try {
          if (oGrupoOrden.grupoOrdenId) {
            if (aGrupoDetalle.length == aUpdated.length) {
              oGrupoOrden.activo = false;
            }

            oGrupoOrden = this.mapGrupoOrden(oGrupoOrden);
            var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN", {
              grupoOrdenId: oGrupoOrden.grupoOrdenId,
            });
            await this._updateFunctionResult(sPath, oGrupoOrden);
          } else {
            oGrupoOrden.grupoOrdenId = http.guid();
            oGrupoOrden = this.mapGrupoOrden(oGrupoOrden);
            oGrupoOrden.fechaActualiza = null;
            await this._postFunctionResult("GRUPO_ORDEN", oGrupoOrden);
          }

          for await (var detalle of aUpdDet) {
            detalle = this.mapGrupoOrdenDetalle(detalle, oGrupoOrden);
            var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_DET", {
              grupoOrdenDetalleId: detalle.grupoOrdenDetalleId,
            });
            await this._updateFunctionResult(sPath, detalle);
          }

          for await (var detalle of aNewDet) {
            detalle = this.mapGrupoOrdenDetalle(detalle, oGrupoOrden);
            await this._postFunctionResult("GRUPO_ORDEN_DET", detalle);
          }

          if (oGrupoOrden.grupoOrdenId) {
            var oGrupoOrdenInactivo = {};

            oGrupoOrdenInactivo.activo = bGrupoActivo;
            oGrupoOrdenInactivo.grupoOrdenId = oGrupoOrden.grupoOrdenId;

            var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN", {
              grupoOrdenId: oGrupoOrden.grupoOrdenId,
            });
            await this._updateFunctionResult(sPath, oGrupoOrdenInactivo);
          }

          if (bGrupoActivo) {
            await this.generarConsolidado(oGrupoOrden.grupoOrdenId, sUsuario);
          }

          result = { iCode: "1", oResult: "1" };
        } catch (ex) {
          console.log(ex);
          result = { iCode: "-1", sError: ex };
        }
        return result;
      },
      generarConsolidado: async function (grupoOrdenId, sUsuario) {
        var oUrlParameters = {
          grupoOrdenId: grupoOrdenId,
          usuario: sUsuario,
        };
        return await this._getFunctionResult(
          "grupoOrdenGenerarConsolidado",
          oUrlParameters
        );
      },
      regenerarConsolidado: async function (grupoOrdenId, sUsuario) {
        var oUrlParameters = {
          grupoOrdenId: grupoOrdenId,
          usuario: sUsuario,
        };
        return await this._getFunctionResult(
          "grupoOrdenRegenerarConsolidado",
          oUrlParameters
        );
      },
      acSetEtiquetaErp: async function (oBody) {
        var oResp = await this._postFunction("acSetEtiquetaErp", {
          oBody: JSON.stringify(oBody),
        });
        return oResp.data.acSetEtiquetaErp;
      },
      obtenerFraccionamientosReembalaje: async function (
        iSalaPesajeId,
        aUnidades
      ) {
        
        var sFilter = "";
        var sFilterTotal = "";

        sFilter += "insumoSalaPesajeId eq '" + iSalaPesajeId + "'";
        sFilter += " and insumoResetea eq 'X'";
        
        var aFraccionamientos = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          sFilter
        );

        var that = this;

        var result = [];
        aFraccionamientos.reduce(function (res, value) {
          var sKey =
            value.ordenId + "_" + value.codigoInsumo + "_" + value.loteInsumo;
          if (!res[sKey]) {
            value.totalCantSugerida = 0;
            value.totalCantAtendida = 0;
            res[sKey] = value;

            result.push(res[sKey]);
          }

          res[sKey].totalCantSugerida += +value.cantSugerida;
          res[sKey].totalCantAtendida += +value.entero + +value.atendido;

          return res;
        }, {});

        var aPedidos = aFraccionamientos.map((d) => d.numPedido);
        var aNumOrden = aFraccionamientos.map((d) => d.ordenNumero);
        var aCodigosInsumo = aFraccionamientos.map((d) => d.codigoInsumo);
        var aLotesInsumo = aFraccionamientos.map((d) => d.loteInsumo);
        
        var aBultos = await this.obtenerBultosERP(aPedidos, aNumOrden, aCodigosInsumo, aLotesInsumo, true);
        
        /*if (oBultos && oBultos.oResult) {
          aBultos = oBultos.oResult.value.data;
        }*/
        for (var d of aFraccionamientos) {
          var oFracc = result.find(
            (r) =>
              r.ordenId == d.ordenId &&
              r.codigoInsumo == d.codigoInsumo &&
              r.loteInsumo == d.loteInsumo
          );
          if (oFracc) {
            d.totalCantSugerida = oFracc.totalCantSugerida;
            d.totalCantAtendida = oFracc.totalCantAtendida;
          }

          var fEnteros = 0;

          if (aBultos.length > 0) {
            var aBultoFiltrado = aBultos.filter(
              (e) =>
                e.CodigoInsumo == d.codigoInsumo &&
                e.Lote == d.loteInsumo &&
                e.Orden == d.ordenNumero &&
                +e.Fraccion == +d.numFraccion &&
                +e.Subfraccion == +d.numSubFraccion
            );
            
            d.bultoAtendido = aBultoFiltrado.length > 0 ? aBultoFiltrado[0].IdBulto: "";
            d.unidadAtendido = aBultoFiltrado.length > 0 ? aBultoFiltrado[0].UnidadM : "";
            d.cantidadAtendido = aBultoFiltrado.length > 0 ? aBultoFiltrado[0].CantidadA : 0;
          }

          var oUnidad = aUnidades.find(
            (e) => e.codigo.toUpperCase() == d.unidadOrigen.toUpperCase()
          );
          if (oUnidad.codigo != oUnidad.codigoSap) {
            d.unidad = oUnidad.codigoSap;
            d.unidadOriginal = oUnidad.codigo;
          }
        }

        aFraccionamientos = aFraccionamientos.sort((a, b) => {
          const compareOrden = a.ordenNumero.localeCompare(b.ordenNumero);

          return (
            compareOrden ||
            a.numFraccion - b.numFraccion ||
            a.numSubFraccion - b.numSubFraccion
          );
        });

        return aFraccionamientos;
      },
      obtenerFraccionamientos: async function (
        grupoOrdenConsolidadoId,
        iEstadoOrden,
        iEstadoInsumo,
        iSalaPesajeId,
        aUnidades
      ) {
        
        var sFilter = "";
        var sFilterTotal = "";

        if (grupoOrdenConsolidadoId) {
          sFilter +=
            "grupoOrdenConsolidadoId eq '" + grupoOrdenConsolidadoId + "' and ";
        }

        sFilter += "insumoSalaPesajeId eq '" + iSalaPesajeId + "'";
        //sFilter += " and FracEstado_iMaestraId eq " + iEstadoInsumo;
        
        var aFraccionamientos = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          sFilter
        );

        var that = this;

        var result = [];
        aFraccionamientos.reduce(function (res, value) {
          var sKey =
            value.ordenId + "_" + value.codigoInsumo + "_" + value.loteInsumo;
          if (!res[sKey]) {
            value.totalCantSugerida = 0;
            value.totalCantAtendida = 0;
            res[sKey] = value;

            result.push(res[sKey]);
          }

          res[sKey].totalCantSugerida += +value.cantSugerida;
          res[sKey].totalCantAtendida += +value.entero + +value.atendido;

          if (value.insumoResetea == "X"){
            res[sKey].FracCodigoEstado = "PAIPEFI";
            res[sKey].FracEstado_iMaestraId = 60;
          }

          return res;
        }, {});

        if (iEstadoOrden) {
          aFraccionamientos = aFraccionamientos.filter(
            (d) => d.oEstado_iMaestraId == iEstadoOrden
          );
        }
        if (iEstadoInsumo) {
          aFraccionamientos = aFraccionamientos.filter(
            (d) => d.FracEstado_iMaestraId == iEstadoInsumo
          );
        }

        var aPedidos = aFraccionamientos.map((d) => d.numPedido);
        var aNumOrden = aFraccionamientos.map((d) => d.ordenNumero);
        var aCodigosInsumo = aFraccionamientos.map((d) => d.codigoInsumo);
        var aLotesInsumo = aFraccionamientos.map((d) => d.loteInsumo);
        var aBultos = await this.obtenerBultosERP(aPedidos, aNumOrden, aCodigosInsumo, aLotesInsumo);
        
        /*if (oBultos && oBultos.oResult) {
          aBultos = oBultos.oResult.value.data;
        }*/
        for (var d of aFraccionamientos) {
          var oFracc = result.find(
            (r) =>
              r.ordenId == d.ordenId &&
              r.codigoInsumo == d.codigoInsumo &&
              r.loteInsumo == d.loteInsumo
          );
          if (oFracc) {
            d.totalCantSugerida = oFracc.totalCantSugerida;
            d.totalCantAtendida = oFracc.totalCantAtendida;
          }

          var fEnteros = 0;

          if (aBultos.length > 0) {
            var aBultoFiltrado = aBultos.filter(
              (e) =>
                e.CodigoInsumo == d.codigoInsumo &&
                e.Lote == d.loteInsumo &&
                e.Orden == d.ordenNumero &&
                +e.Fraccion == +d.numFraccion &&
                +e.Subfraccion == +d.numSubFraccion &&
                e.Tipo == "ENTERO"
            );

            aBultoFiltrado.forEach(function (o) {
              fEnteros += +o.CantidadA;
            });
          }

          d.entero = fEnteros;
          //d.requeridoFinal = d.sugerido - fEnteros;

          let fNumber = new Number(d.pPLoteLog);

          if (!isNaN(fNumber)) {
            d.pPLoteLog = formatter.pesoString(d.pPLoteLog);
          }

          fNumber = new Number(d.pTInsumo);

          if (!isNaN(fNumber)) {
            d.pTInsumo = formatter.pesoString(d.pTInsumo);
          }

          var oUnidad = aUnidades.find(
            (e) => e.codigo.toUpperCase() == d.unidadOrigen.toUpperCase()
          );
          if (oUnidad.codigo != oUnidad.codigoSap) {
            d.unidad = oUnidad.codigoSap;
            d.unidadOriginal = oUnidad.codigo;
          }
        }

        aFraccionamientos = aFraccionamientos.sort((a, b) => {
          const compareOrden = a.ordenNumero.localeCompare(b.ordenNumero);

          return (
            compareOrden ||
            a.numFraccion - b.numFraccion ||
            a.numSubFraccion - b.numSubFraccion
          );
        });

        return aFraccionamientos;
      },
      obtenerFraccionamiento: async function (grupoOrdenFraccionamientoId) {
        var aFraccionamientos = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          "grupoOrdenFraccionamientoId eq '" + grupoOrdenFraccionamientoId + "'"
        );
        aFraccionamientos.forEach(function (d) {
          d.cantidadPesar = d.cantPedidaUp - d.entero;
        });
        const oFraccion = aFraccionamientos[0];
        return oFraccion;
      },
      consultaOrdenes: async function (fchInicio, fchFin, iEstado, oParam) {
        var that = this;
        var sFilter = "";

        if (oParam.salaPesaje && oParam.salaPesaje != "TODOS") {
          sFilter =
            sFilter +
            (sFilter ? " and " : "") +
            "salaPesaje eq '" +
            oParam.salaPesaje +
            "'";
        }

        if (oParam.ordenNumero && oParam.ordenNumero != "") {
          sFilter =
            sFilter +
            (sFilter ? " and " : "") +
            "ordenNumero eq '" +
            oParam.ordenNumero +
            "'";
        }

        if (sFilter == "") sFilter = null;

        var aFraccionamientos = await this._getServiceModel().read(
          "/GRUPO_ORDEN_FRAC_DET",
          sFilter
        );
        //aFraccionamientos = this._agrupaOrdenFrac(aFraccionamientos);
        if (iEstado == "0") {
        } else {
          aFraccionamientos = aFraccionamientos.filter(
            (d) => d.FracEstado_iMaestraId == iEstado
          );

          /*if (oParam.ordenNumero && oParam.ordenNumero != "") {
            aFraccionamientos = aFraccionamientos.filter((d) =>
              String(d.ordenNumero).includes(oParam.ordenNumero)
            );
          }*/
        }

        aFraccionamientos = aFraccionamientos.filter((d) => {
          return that.checkDateBT(fchInicio, fchFin, d.fechaRegistro);
        });

        aFraccionamientos.forEach(function (d) {
          d.cantidadPesar = d.sugerido - d.entero;
        });

        aFraccionamientos = aFraccionamientos.sort((a, b) => {
          const compareOrden = a.ordenNumero.localeCompare(b.ordenNumero);
          return (
            compareOrden ||
            a.numFraccion - b.numFraccion ||
            a.numSubFraccion - b.numSubFraccion
          );
        });

        return aFraccionamientos;
      },

      /**
       *  POST
       *
       */

      guardarGrupoOrdenBulto: async function (oGrupoOrdenBulto) {
        var oAudit = this._getAuditObj("I");
        oGrupoOrdenBulto.grupoOrdenBultoId = http.guid();
        oGrupoOrdenBulto.fechaHoraAte = oAudit.fechaRegistro;
        oGrupoOrdenBulto.usuarioAte = oAudit.usuarioRegistro;
        return await this._postFunctionResult("GRUPO_ORDEN_BULTO", {
          ...oAudit,
          ...oGrupoOrdenBulto,
        });
      },

      /**
       *  PUTH
       *
       */
      updateInsumo: async function (oInsumo) {
        var bReturn = false;
        var oAudit = this._getAuditObj("U");
        oInsumo = { ...oInsumo, ...oAudit };
        var sPath = this.oServiceModelV2.createKey("/ORDEN_DETALLE", {
          ordenDetalleId: oInsumo.ordenDetalleId,
        });
        var oInsumoResp = await this._updateFunctionResult(sPath, oInsumo);
        if (oInsumoResp.iCode == "1") {
          bReturn = oInsumoResp;
        }
        return bReturn;
      },
      updateInsumoAndBulto: async function (oFracion, oInsumo, oBulto) {
        var bReturn = false;
        var sPath = this.oServiceModelV2.createKey("/ORDEN_DETALLE", {
          ordenDetalleId: oInsumo.ordenDetalleId,
        });
        //var oInsumoResp = await this._updateFunctionResult(sPath, oInsumo);
        var oInsumoResp = { iCode: "1" };
        if (oInsumoResp.iCode == "1") {
          if (!oFracion.grupoOrdenBultoId) {
            var oAudit = this._getAuditObj("I");
            var grupoOrdenBultoId = http.guid();
            var oGrupoOrden = {
              grupoOrdenBultoId: grupoOrdenBultoId,
              etiqueta: oBulto.Etiqueta,
              cantidadA: oBulto.CantidadA,
              tara: oBulto.Tara,
              oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId:
                oFracion.grupoOrdenFraccionamientoId,
            };
            oGrupoOrden = { ...oAudit, ...oGrupoOrden };
            var oFracResp = await this._postFunctionResult(
              "GRUPO_ORDEN_BULTO",
              oGrupoOrden
            );
            if (oFracResp.iCode == "1") {
              bReturn = true;
            } else {
              throw { message: "Error al registrar el bulto." };
            }
          } else {
            var oAudit = this._getAuditObj("U");
            var oGrupoOrden = {
              etiqueta: oBulto.Etiqueta,
              CantidadA: oBulto.CantidadA,
              tara: oBulto.Tara,
            };
            oGrupoOrden = { ...oAudit, ...oGrupoOrden };
            var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_BULTO", {
              grupoOrdenBultoId: oFracion.grupoOrdenBultoId,
            });
            var oFracResp = await this._updateFunctionResult(
              sPath,
              oGrupoOrden
            );
            if (oFracResp.iCode == "1") {
              bReturn = true;
            } else {
              throw { message: "Error al actualizar el bulto." };
            }
          }
        } else {
          throw { message: "Error al actualizar el insumo." };
        }

        return bReturn;
      },
      DesempacaHuHeadSet: async function (aDesempacaHuSet) {
        var oBody = {
          Object: "BTP",
          DesempacaHuSet: aDesempacaHuSet,
        };
        var oResp = await this.acPostErpDinamic("DesempacaHuHeadSet", oBody);
        return oResp;
      },
      HuPesajeFraccionamientoSet: async function (aHuPesajeFraccionamientoSet) {
        var oBody = {
          Pedido: "",
          Centroinsumo: "",
          ActHuPesajeFraccionamientoSet: aHuPesajeFraccionamientoSet,
        };
        var oResp = await this.acPostErpDinamic(
          "ActHuPesajeFraccionamientoHeadSet",
          oBody
        );
        return oResp;
      },
      ReembalajeSet: async function (aReembalajeItemSet) {
        var oBody = {
          Pedido: "",
          Centro: "",
          ReembalajeItemSet: aReembalajeItemSet,
        };
        var oResp = await this.acPostErpDinamic("ReembalajeHeadSet", oBody);
        return oResp;
      },
      ModificarDetHuHeadSet: async function (aModificarDetHuSet) {
        var oBody = {
          Object: "BTP",
          ModificarDetHuSet: aModificarDetHuSet,
        };
        var oResp = await this.acPostErpDinamic("ModificarDetHuHeadSet", oBody);
        return oResp;
      },
      ActBultSalMisHuHeadSet: async function (aActBultSalMisHuSet) {
        var oBody = {
          Object: "BTP",
          ActBultSalMisHuSet: aActBultSalMisHuSet,
        };
        var oResp = await this.acPostErpDinamic(
          "ActBultSalMisHuHeadSet",
          oBody
        );
        return oResp;
      },
      ActBultSalNueHuHeadSet: async function (aActBultSalNueHuSet) {
        var oBody = {
          Object: "BTP",
          ActBultSalNueHuSet: aActBultSalNueHuSet,
        };
        var oResp = await this.acPostErpDinamic(
          "ActBultSalNueHuHeadSet",
          oBody
        );
        return oResp;
      },
      CrearNuevaHuHeadSet: async function (aCrearNuevaHuSet) {
        var oBody = {
          Object: "BTP",
          CrearNuevaHuSet: aCrearNuevaHuSet,
        };
        var oResp = await this.acPostErpDinamic("CrearNuevaHuHeadSet", oBody);
        return oResp;
      },
      TrasladarHuHeadSet: async function (aTrasladarHuSet) {
        var oBody = {
          Object: "BTP",
          TrasladarHuSet: aTrasladarHuSet,
        };
        var oResp = await this.acPostErpDinamic("TrasladarHuHeadSet", oBody);
        return oResp;
      },
      AtendidoItemSet: async function (oParam) {
        //AtendidoItemSet?$filter=IdBulto eq '9600000681' and CodigoInsumo eq '1000010118' and Lote eq 'MP00020801' and Tipo eq 'ENTERO'
        var aFilter = [];
        if (oParam.IdBulto)
          aFilter.push(this._newFilter("IdBulto", "EQ", oParam.IdBulto));

        if (oParam.CodigoInsumo)
          aFilter.push(
            this._newFilter("CodigoInsumo", "EQ", oParam.CodigoInsumo)
          );

        if (oParam.Lote)
          aFilter.push(this._newFilter("Lote", "EQ", oParam.Lote));

        if (oParam.Tipo)
          aFilter.push(this._newFilter("Tipo", "EQ", oParam.Tipo));

        var oUrlParameters = {
          entity: "AtendidoItemSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        
        return this._getFormatReturn(oResp);
      },
      ValidarMaterialSet: async function (oParam) {
        //AtendidoItemSet?$filter=IdBulto eq '9600000681' and CodigoInsumo eq '1000010118' and Lote eq 'MP00020801' and Tipo eq 'ENTERO'
        var aFilter = [];
        if (oParam.Matnr)
          aFilter.push(this._newFilter("Matnr", "EQ", oParam.Matnr));

        if (oParam.Charg)
          aFilter.push(this._newFilter("Charg", "EQ", oParam.Charg));

        var oUrlParameters = {
          entity: "ValidarMaterialSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        return this._getFormatReturn(oResp);
      },
      ValidarHuSet: async function (oParam) {
        //ValidarHuSet?$filter=Hu eq '' and CodigoInsumo eq '1000010124' and LoteInsumo eq 'MP00022653' and CentroInsumo eq '1021'
        var aFilter = [];
        if (oParam.Hu) aFilter.push(this._newFilter("Hu", "EQ", oParam.Hu));

        if (oParam.CodigoInsumo)
          aFilter.push(
            this._newFilter("Codigoinsumo", "EQ", oParam.CodigoInsumo)
          );

        if (oParam.LoteInsumo)
          aFilter.push(this._newFilter("Loteinsumo", "EQ", oParam.LoteInsumo));

        if (oParam.CentroInsumo)
          aFilter.push(
            this._newFilter("Centroinsumo", "EQ", oParam.CentroInsumo)
          );

        if (oParam.FlagPesoSaldo)
          aFilter.push(
            this._newFilter("FlagPesoSaldo", "EQ", oParam.FlagPesoSaldo)
          );

        var oUrlParameters = {
          entity: "ValidarHuSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        return this._getFormatReturn(oResp);
      },
      ListaMaterialesSet: async function (oParam) {
        //ListaMaterialesSet?$filter=Matnr eq ''
        var aFilter = [];
        if (oParam.CodigoInsumo)
          aFilter.push(this._newFilter("Matnr", "EQ", oParam.CodigoInsumo));

        var oUrlParameters = {
          entity: "ListaMaterialesSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        return this._getFormatReturn(oResp);
      },
      ListaMaestraMaterialesSet: async function () {
        var aMateriales = await this._getServiceModel().read(
          "/CONSTANTES_MAT_EM",
          ""
        );

        aMateriales.forEach(function (item) {
          item.Maktx = item.contenido;
          item.Matnr = item.descripcion;
        });

        return aMateriales;
      },
      ReservaSet: async function (oParam) {
        //ReservaSet?$filter=Aufnr eq '300000480'&$format=json
        var aFilter = [];
        if (oParam.Rsnum)
          aFilter.push(this._newFilter("Rsnum", "EQ", oParam.Rsnum));
        if (oParam.Rspos)
          aFilter.push(this._newFilter("Rspos", "EQ", oParam.Rspos));
        if (oParam.Aufnr)
          aFilter.push(this._newFilter("Aufnr", "EQ", oParam.Aufnr));
        if (oParam.Bwart)
          aFilter.push(this._newFilter("Bwart", "EQ", oParam.Bwart));
        if (oParam.Matnr)
          aFilter.push(this._newFilter("Matnr", "EQ", oParam.Matnr));
        if (oParam.Charg)
          aFilter.push(this._newFilter("Charg", "EQ", oParam.Charg));

        var oUrlParameters = {
          entity: "ReservaSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        return this._getFormatReturn(oResp);
      },
      ValoresPropCaracteristicasSet: async function (oParam) {
        //ValoresPropCaracteristicasSet?$filter=CodigoInsumo eq '1000010124' and LoteInsumo eq 'MP00022653' and Centro eq '1021'
        var aFilter = [];
        if (oParam.CodigoInsumo)
          aFilter.push(
            this._newFilter("CodigoInsumo", "EQ", oParam.CodigoInsumo)
          );
        if (oParam.Lote)
          aFilter.push(this._newFilter("LoteInsumo", "EQ", oParam.Lote));

        if (oParam.Centro)
          aFilter.push(this._newFilter("Centro", "EQ", oParam.Centro));

        var oUrlParameters = {
          entity: "ValoresPropCaracteristicasSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        return this._getFormatReturn(oResp);
      },
      fnUpdateOrdenFrac: async function (ordenFraccionId, pedidoId, usuario) {
        return await this._getFunctionResult("fnUpdateOrdenFrac", {
          ordenFraccionId: ordenFraccionId,
          pedidoId: pedidoId,
          usuario,
        });
      },
      fnAddColaImpresion: async function (aColaImpresion) {
        try {
          var oBodyParam = {
            aColaImpresion: aColaImpresion
          }
          var oResp = await this._postFunction("acAddColaImpresion", oBodyParam);
          if (oResp.statusCode == "200") {
            oResp = oResp.data.acPostErpDinamic.d;
            oResp.statusCode = "200";
          }
        } catch (error) {
          oResp.statusCode = "500";
        }
        return oResp;
      },
      fnUpdateCantidadConversion: async function (
        ordenFraccionId,
        grupoOrdenFraccionamientoId,
        usuario
      ) {
        return await this._getFunctionResult("fnUpdateCantidadConversion", {
          ordenFraccionId: ordenFraccionId,
          grupoOrdenFraccionamientoId: grupoOrdenFraccionamientoId,
          usuario,
        });
      },
      fnGetErpDinamic: async function (oUrlParameters) {
        return await this._getFunctionResult("fnGetErpDinamic", oUrlParameters);
      },
      acPostErpDinamic: async function (sEntity, oBody) {
        var oBodyParam = {
          entity: sEntity,
          oBody: JSON.stringify(oBody),
        };
        try {
          var oResp = await this._postFunction("acPostErpDinamic", oBodyParam);
          if (oResp.statusCode == "200") {
            oResp = oResp.data.acPostErpDinamic.d;
            oResp.statusCode = "200";
          }
        } catch (error) {
          oResp.statusCode = "500";
        }

        return oResp;
      },
      fnSendPrintBulto: async function (oParam) {
        var oUrlParameters = {
          impresoraId: oParam.impresoraId,
          etiqueta: oParam.etiqueta,
          usuario: oParam.usuario,
          bSaldo: oParam.bSaldo ? oParam.bSaldo : "",
          tipo: oParam.tipo ? oParam.tipo : "",
          idBulto: oParam.idBulto ? oParam.idBulto : "",
        };
        return await this._getFunctionResult(
          "fnSendPrintBulto",
          oUrlParameters
        );
      },
      actualizarTaraFraccion: async function (
        sGrupoOrdenFraccionamientoId,
        fTara
      ) {
        const oGrupoOrdenFrac = {
          grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
          tara: fTara,
        };
        var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_FRAC", {
          grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
        });

        return await this._updateFunctionResult(sPath, oGrupoOrdenFrac);
      },
      actualizarFraccion: async function (oFracc) {
        var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_FRAC", {
          grupoOrdenFraccionamientoId: oFracc.grupoOrdenFraccionamientoId,
        });

        await this._updateFunctionResult(sPath, oFracc);
      },
      actualizarSubFraccion: async function (oSubFracc) {
        var sPath = this.oServiceModelV2.createKey("/ORDEN_DETALLE", {
          ordenDetalleId: oSubFracc.ordenDetalleId,
        });

        await this._updateFunctionResult(sPath, oSubFracc);
      },
      finalizarSubFraccion: async function (oFracc, oSubFracc) {
        await this.actualizarFraccion(oFracc);
        await this.actualizarSubFraccion(oSubFracc);
      },
      updateGrupoOrdenBulto: async function (oBody) {
        var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_BULTO", {
          grupoOrdenBultoId: oBody.grupoOrdenBultoId,
        });
        await this._updateFunctionResult(sPath, oBody);
      },
      eliminarFraccion: async function (
        sGrupoOrdenFraccionamientoId,
        sOrdenDetalleId,
        sUsuario
      ) {
        var sPath = this.oServiceModelV2.createKey("/GRUPO_ORDEN_FRAC", {
          grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
        });

        await this._removeFunctionResult(sPath);

        var sPathOD = this.oServiceModelV2.createKey("/ORDEN_DETALLE", {
          ordenDetalleId: sOrdenDetalleId,
        });

        return await this._removeFunctionResult(sPathOD);
      },

      /**
       * ------------------------------------------
       *        FUNCION ODATA v2
       * ------------------------------------------
       */
      checkConnection: async function () {
        try {
          const aPedidos = await this._getServiceModelCheck().read(
            "/PEDIDO",
            "activo eq true"
          );

          return true;
        } catch (error) {
          return false;
        }
      },
      auth: async function (usuario, clave) {
        var oParameters = {
          usuario: encodeURI(usuario),
          clave: encodeURI(clave),
          app: "FRAC",
        };
        return await this._getFunctionResult(
          "fnLogin",
          oParameters
        );
      },
      obtenerBulto: async function (
        sPedido,
        sOrden,
        sBulto,
        sGrupoOrdenFraccionamientoId
      ) {
        var oUrlParameters = {
          pedido: sPedido,
          orden: sOrden,
          bulto: sBulto,
          grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
        };
        return await this._getFunctionResult("obtenerBulto", oUrlParameters);
      },
      fnObtenerBultoQr: async function (oBultoScan) {
        var oUrlParameters = {
          IdBulto: oBultoScan.IdBulto,
          CodigoInsumo: oBultoScan.CodigoInsumo,
          Lote: oBultoScan.Lote,
          Etiqueta: oBultoScan.Etiqueta,
        };
        return await this._getFunctionResult(
          "fnObtenerBultoQr",
          oUrlParameters
        );
      },
      obtenerBultosERP: async function (aPedidos, aOrdenes, aInsumos, aLotes, bReembalaje, sTipo) {
        var that = this;
        var aFilter = [];

        if (aPedidos.length == 0) return [];

        aPedidos = this._UniqByKeepFirst(aPedidos, (it) => it);
        aOrdenes = this._UniqByKeepFirst(aOrdenes, (it) => it);
        aInsumos = this._UniqByKeepFirst(aInsumos, (it) => it);
        aLotes = this._UniqByKeepFirst(aLotes, (it) => it);

        if (!bReembalaje){
          aFilter.push(this._newFilter("Tipo", "EQ", "ENTERO"));
        }else{
          aFilter.push(this._newFilter("Tipo", "EQ", sTipo));
        }

        if (aPedidos.length>0){
          aPedidos.forEach(function(d){
            aFilter.push(
              that._newFilter("Pedido", "EQ", d)
            );
          })
        }

        if (aOrdenes.length>0){
          aOrdenes.forEach(function(d){
            aFilter.push(
              that._newFilter("Orden", "EQ", d)
            );
          })
        }

        if (aInsumos.length>0){
          aInsumos.forEach(function(d){
            aFilter.push(
              that._newFilter("CodigoInsumo", "EQ", d)
            );
          })
        }

        if (aLotes.length>0){
          aInsumos.forEach(function(d){
            aFilter.push(
              that._newFilter("CodigoInsumo", "EQ", d)
            );
          })
        }

        var oUrlParameters = {
          entity: "AtendidoItemSet",
          urlParameters: JSON.stringify({}),
          filters: JSON.stringify(aFilter),
        };
        var oResp = await this.fnGetErpDinamic(oUrlParameters);
        var oResult = this._getFormatReturn(oResp);
        if (oResult.error) return [];
        return oResult;
      },
      actualizarCantidadFraccion: async function (
        sGrupoOrdenFraccionamientoId,
        fCantidad,
        iUnidad,
        bDuplicar,
        sUsuario,
        sOrdenDetalleId
      ) {
        var oUrlParameters = {
          grupoOrdenFraccionamientoId: sGrupoOrdenFraccionamientoId,
          cantidad: fCantidad,
          unidad: iUnidad,
          duplicar: bDuplicar,
          usuario: sUsuario,
          ordenDetalleId: sOrdenDetalleId,
        };
        return await this._getFunctionResult(
          "fraccionActualizarCantidad",
          oUrlParameters
        );
      },
      mapGrupoOrden: function (obj) {
        let result = {};
        result.grupoOrdenId = obj.grupoOrdenId;
        result.oSalaPesaje_salaPesajeId = obj.oSalaPesaje_salaPesajeId;
        if (obj.activo) result.activo = obj.activo;
        result.codigo = obj.codigo;

        if (obj.fechaActualiza) result.fechaActualiza = obj.fechaActualiza;
        if (obj.fechaRegistro) result.fechaRegistro = obj.fechaRegistro;
        if (obj.usuarioActualiza)
          result.usuarioActualiza = obj.usuarioActualiza;
        if (obj.usuarioRegistro) result.usuarioRegistro = obj.usuarioRegistro;
        return result;
      },
      mapGrupoOrdenDetalle: function (obj, oGrupoOrden) {
        let result = {};
        result.grupoOrdenDetalleId = obj.grupoOrdenDetalleId;
        /*if (!obj.oGrupoOrden_grupoOrdenId) {
          result.oGrupoOrden_grupoOrdenId = oGrupoOrden.grupoOrdenId;
        }*/
        result.oGrupoOrden_grupoOrdenId = oGrupoOrden.grupoOrdenId;

        result.oOrdenFraccion_ordenFraccionId =
          obj.oOrdenFraccion_ordenFraccionId;
        result.activo = obj.activo;
        result.codigo = obj.codigo;

        if (obj.fechaActualiza) result.fechaActualiza = obj.fechaActualiza;
        if (obj.fechaRegistro) result.fechaRegistro = obj.fechaRegistro;
        if (obj.usuarioActualiza)
          result.usuarioActualiza = obj.usuarioActualiza;
        if (obj.usuarioRegistro) result.usuarioRegistro = obj.usuarioRegistro;
        return result;
      },
      _agrupaOrdenFrac: function (aFraccionamientos) {
        var aGroupList = [];
        
        for (var key in aFraccionamientos) {
          var a = Object.assign({}, aFraccionamientos[key]);
          var oGroupList = aGroupList.find(
            (o) =>
              o.grupoOrdenFraccionamientoId === a.grupoOrdenFraccionamientoId &&
              o.grupoOrdenConsolidadoId === a.grupoOrdenConsolidadoId
          );
          if (oGroupList) {
            oGroupList.atendido = +oGroupList.atendido + +a.atendido;
          } else {
            a.cantidadPesar = +a.sugerido - +a.entero;
            aGroupList.push(a);
          }
        }
        return aGroupList;
      },
      _formatSalaPesaje: function (aSalaPesaje) {
        aSalaPesaje.forEach(function (oItem) {
          if (oItem.oEstadoTaraManual) {
            oItem.oEstadoTaraManual_codigo = oItem.oEstadoTaraManual.codigo;
          }
          if (oItem.oEstadoPesoManual) {
            oItem.oEstadoPesoManual_codigo = oItem.oEstadoPesoManual.codigo;
          }
          if (oItem.oEstadoLecturaEtiqueta) {
            oItem.oEstadoLecturaEtiqueta_codigo =
              oItem.oEstadoLecturaEtiqueta.codigo;
          }

          if (oItem.oPlanta) {
            oItem.oPlanta_codigo = oItem.oPlanta.codigo;
            oItem.oPlanta_codigoSap = oItem.oPlanta.codigoSap;
            oItem.oPlanta_contenido = oItem.oPlanta.contenido;
            oItem.oPlanta_iMaestraId = oItem.oPlanta.iMaestraId;
            oItem.oPlanta_campo1 = oItem.oPlanta.campo1;
          }
        });

        return aSalaPesaje;
      },
      _agrupaConsolidado: function (aConsolidados) {
        var aGroupList = [];
        aConsolidados = aConsolidados.sort((a, b) => {
          return (a.agotar == "X" ? 1 : 0)>(b.agotar == "X" ? 1 : 0);
        });
        console.log(aConsolidados)
        for (var key in aConsolidados) {
          var a = Object.assign({}, aConsolidados[key]);
          var oGroupList = aGroupList.find(
            (o) =>
              o.lote === a.lote &&
              o.codigoInsumo === a.codigoInsumo &&
              o.centro === a.centro
          );
          
          if (oGroupList){
            var oGroupListNoAgotar = aConsolidados.filter(
              (o) =>
                o.lote === oGroupList.lote &&
                o.codigoInsumo === oGroupList.codigoInsumo &&
                o.centro === oGroupList.centro && 
                o.agotar === "X"
            );
  
            if (oGroupListNoAgotar.length>0){
              
              if (oGroupList.agotar == ""){
                oGroupList.agotar = "X";
              }
            }
          }
          
          if (oGroupList) {
            oGroupList.totalRequerido =
              +oGroupList.totalRequerido + +a.totalRequerido;
          } else {
            aGroupList.push(a);
          }
        }
        return aGroupList;
      },
      _getAuditObj: function (sDML) {
        var oAudit = {};
        var sUsuario = window.localStorage.getItem("usuarioCodigo");
        if (sDML == "I") {
          oAudit.activo = true;
          oAudit.usuarioRegistro = sUsuario;
          oAudit.fechaRegistro = new Date();
        }
        if (sDML == "U" || sDML == "D") {
          oAudit.usuarioActualiza = sUsuario;
          oAudit.fechaActualiza = new Date();
        }
        if (sDML == "D") {
          oAudit.activo = false;
        }

        return oAudit;
      },
      checkDateBT: function (dateFrom, dateTo, dateCheck) {
        var from = new Date(dateFrom);
        var to = new Date(dateTo);
        var check = new Date(dateCheck);

        //Valida si la fecha actual esta en el rango de vigencia del usuario
        if (check > from && check < to) {
          return true;
        } else {
          return false;
        }
      },
      checkDateBTGrupo: function (dateFrom, dateTo, dateCheck) {
        var from = new Date(dateFrom);
        var to = new Date(dateTo);
        var check = new Date(dateCheck);

        //Valida si la fecha actual esta en el rango de vigencia del usuario
        if (check >= from && check <= to) {
          return true;
        } else {
          return false;
        }

        return true;
      },
      _formatCharSpecial: function (sText) {
        sText = sText.replaceAll(/</g, "&#60;");
        sText = sText.replaceAll(/</g, "&#62;");
        return sText;
      },
      _buildObs: function (oParam, oInfoOrden) {
        var aText = [];

        aText.push("<br>");
        aText.push(
          "<Strong>Condiciones de Almacenamiento: </Strong>" +
            this._formatCharSpecial(oParam.CondAlmc)
        );
        aText.push(
          "<Strong>Condiciones Especiales de Envasado y Almacenamiento: </Strong>" +
            this._formatCharSpecial(oParam.CondEsp)
        );
        aText.push("<Strong>Observaciones: </Strong>");

        if (oParam.AtinnPesEsp)
          aText.push(
            "- " +
              oParam.AtinnPesEsp +
              ":" +
              this._formatCharSpecial(oParam.AtflvPesEsp)
          );
        if (oParam.AtinnPesPro)
          aText.push(
            "- " +
              oParam.AtinnPesPro +
              ":" +
              this._formatCharSpecial(oParam.AtflvPesPro)
          );
        if (oParam.AtinnVisc)
          aText.push(
            "- " +
              oParam.AtinnVisc +
              ":" +
              this._formatCharSpecial(oParam.AtflvVisc)
          );

        aText.push(
          "<Strong>Observaciones especifica del Lote: </Strong>" +
            this._formatCharSpecial(oParam.ObsEspec)
        );
        var sObs = aText.join("<br>");

        var aText = [];
        var sGlosa = aText.join("<br>");

        var aText = [];
        aText.push("<br>");

        if (oInfoOrden) {
          aText.push(
            "<Strong>Indicaciones de la Orden: </Strong>" +
              this._formatCharSpecial(oInfoOrden.Potx1)
          );
          aText.push(
            "<Strong>Indicaciones del Insumo: </Strong>" +
              this._formatCharSpecial(oInfoOrden.Potx2Equiv)
          );
        }

        var sInfoOrden = aText.join("<br>");

        return {
          obs: sObs,
          glosa: sGlosa,
          infoOrden: sInfoOrden,
          factorConversion:
            oParam.sUnidad == "MLL"
              ? oParam.AtflvPesPro && oParam.AtflvPesPro != ""
                ? oParam.AtflvPesPro.replace(",", ".").replaceAll(" ", "")
                : ""
              : oParam.AtflvPesEsp && oParam.AtflvPesEsp != ""
              ? oParam.AtflvPesEsp.replace(",", ".").replaceAll(" ", "")
              : "",
        };
      },
      _getServiceModelCheck: function () {
        try {
          return this.oServiceModel;
        } catch (error) {
          return null;
        }
      },
      _getServiceModel: function () {
        if (navigator.onLine) {
          return this.oServiceModel;
        } else {
          return this.oServiceModelLoc;
        }
      },
      _getFunctionResult: async function (sEntity, oUrlParameters) {
        var result = null;
        if (navigator.onLine) {
          var oResult = await oDataSrv.oDataRead(
            this.oServiceModelV2,
            "/" + sEntity,
            oUrlParameters,
            []
          );
          var oResp = oResult[sEntity];
          try {
            var oDataResp = oResp;
            if (oResp.data) {
              oDataResp = oResp.data;
            } else if (oResp.result) {
              oDataResp = oResp.result;
            } else if (oResp.d) {
              oDataResp = oResp;
            } else if (
              oDataResp.results &&
              oDataResp.results[0] &&
              oDataResp.results[0].hasOwnProperty("bStatus")
            ) {
              oDataResp = oDataResp.results[0];
              if (oDataResp.hasOwnProperty("oError")) {
                return { iCode: "-1", sError: oDataResp.sMessage };
              }
            } else {
            }
            result = { iCode: "1", oResult: { value: { data: oDataResp } } };
          } catch (ex) {
            result = { iCode: "-1", sError: ex };
          }
        } else {
          result = { iCode: "-1", sError: "Sin Conexión a internet." };
        }
        return result;
      },
      _postFunction: async function (sEntity, oBody) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oResult = await oDataSrv.oDataCreate(
              this.oServiceModelV2,
              sEntity,
              oBody
            );

            result = oResult;
          } catch (ex) {
            throw { iCode: "-1", sError: ex };
          }
        } else {
          result = { iCode: "-1", sError: "Sin Conexión a internet." };
        }
        return result;
      },
      _postFunctionResult: async function (sEntity, oBody) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oResult = await oDataSrv.oDataCreate(
              this.oServiceModelV2,
              sEntity,
              oBody
            );
            var oDataResp = oResult;
            if (oResult.data) {
              oDataResp = oResult.data;
            }
            result = { iCode: "1", oResult: oDataResp };
          } catch (ex) {
            throw { iCode: "-1", sError: ex };
          }
        } else {
          result = { iCode: "-1", sError: "Sin Conexión a internet." };
        }
        return result;
      },
      _updateFunctionResult: async function (sEntity, oBody) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oResult = await oDataSrv.oDataUpdate(
              this.oServiceModelV2,
              sEntity,
              oBody
            );
            result = { iCode: "1", oResult: oResult };
          } catch (ex) {
            throw { iCode: "-1", sError: ex };
          }
        } else {
          result = { iCode: "-1", sError: "Sin Conexión a internet." };
        }
        return result;
      },
      _removeFunctionResult: async function (sEntity) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oResult = await oDataSrv.oDataRemove(
              this.oServiceModelV2,
              sEntity
            );
            result = { iCode: "1", oResult: oResult };
          } catch (ex) {
            throw { iCode: "-1", sError: ex };
          }
        } else {
          result = { iCode: "-1", sError: "Sin Conexión a internet." };
        }
        return result;
      },
      _newFilter: function (sPath, sOperator, oValue1) {
        return {
          sPath: sPath,
          sOperator: sOperator,
          oValue1: oValue1,
        };
      },
      _getFormatReturn: function (oObject) {
        var oResp = oObject.oResult.value.data;
        if (oResp.error) {
          return oResp;
        } else if (oResp.d) {
          return oResp.d.results;
        }
        return null;
      },
      formatWeight: function (coin) {
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
      },
      _UniqByKeepFirst: function (aData, key) {
        var seen = new Set();
        return aData.filter((item) => {
          var k = key(item);
          return seen.has(k) ? false : seen.add(k);
        });
      },
    };
  }
);
