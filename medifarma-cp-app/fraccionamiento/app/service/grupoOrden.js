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
        var oParameters = {
          $filter: "activo eq true",
          $expand: "oMaestraTipo",
        };
        let aMaestra = await this._getOdataModel("Maestra", oParameters);
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
        var expand =
          "oPlanta,oEstadoPesoManual,oEstadoTaraManual,oEstadoLecturaEtiqueta";

        var oParameters = {
          $filter: sFilter,
          $expand: expand,
        };
        
        var salaPesajes = await this._getOdataModel("SALA_PESAJE", oParameters);

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

        var oParameters = {
          $filter: sFilter,
        };
        const plantas = await this._getOdataModel("PLANTA", oParameters);
        return plantas;
      },
      obtenerFactor: async function () {
        const aFactorConversion = await this._getOdataModel(
          "FACTOR_CONVERSION",
          {}
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

        var oParameters = {
          $filter:
            "activoBalanza eq 'X' and oSalaPesaje_salaPesajeId eq '" +
            oParam.sSalaPesajeId +
            "'",
          $expand: "oUnidad,oPuertoCom,oTipoBalanza",
        };
        const aBalanzas = await this._getOdataModel("BALANZA", oParameters);

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

          if (oParam.sUnidad.toUpperCase() === "KG") {
            fPendiente = fPendiente * 1000;
          }

          var fCapacidadMinimo = oBalanza.capacidadMinimo;
          var fCapacidadMaximo = oBalanza.capacidadMaximo;

          if (oBalanza.oUnidad_contenido.toUpperCase() === "KG") {
            fCapacidadMinimo = fCapacidadMinimo * 1000;
            fCapacidadMaximo = fCapacidadMaximo * 1000;
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
        var oParameters = {
          $filter:
            "activoBalanza eq 'X' and oSalaPesaje_salaPesajeId eq '" +
            sSalaPesajeId +
            "'",
          $expand: "oUnidad,oPuertoCom,oTipoBalanza",
        };
        const aBalanzas = await this._getOdataModel("BALANZA", oParameters);
        return aBalanzas;
      },
      obtenerOrdenesSinAgrupar: async function (salaPesajeId) {
        let aResult = [];

        var oParameters = {
          $filter: "activo eq true",
        };
        var aDetalles = await this._getOdataModel(
          "GRUPO_ORDEN_DET",
          oParameters
        );

        var oParameters = {
          $filter:
            "oEstado_codigo eq 'PAOPRSA' and salaPesajeId eq '" +
            salaPesajeId +
            "'",
        };
        let aOrdenes = await this._getOdataModel(
          "VIEW_PEDIDO_ORDEN_CONSOLIDADO",
          oParameters
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

        var oParameters = {
          $filter: sFilter,
        };
        const aImpresoras = await this._getOdataModel("IMPRESORA", oParameters);
        return aImpresoras;
      },
      obtenerEstadosConsolidado: async function () {
        var oParameters = {
          $filter:
            "activo eq true and (codigo eq 'PAIPEPE' or codigo eq 'PAIPESA' or codigo eq 'PAIPEFI' or codigo eq 'PAIPEPR')",
        };
        let aEstados = await this._getOdataModel(
          "ESTADO_CONSOLIDADO",
          oParameters
        );
        return aEstados;
      },
      obtenerUnidades: async function () {
        
        var oParameters = {
          $filter: "activo eq true",
        };
        let aUnidades = await this._getOdataModel("UNIDAD", oParameters);
        return aUnidades;
      },
      /* ATENCION ORDEN */
      obtenerGrupoOrdenes: async function (salaPesajeId) {
        var that = this;
        var oParameters = {
          $filter: "oSala_salaPesajeId eq '" + salaPesajeId + "'",
          $expand: "oSalaPesaje",
        };
        let grupoOrdenes = await this._getOdataModel(
          "GRUPO_ORDEN_ATENCION",
          oParameters
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
            item.grupoSala = item.oSalaPesaje_sala
              ? item.oSalaPesaje_sala
              : item.oSalaPesaje.sala;
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
        var oParameters = {
          $filter:
            "oSalaPesaje_salaPesajeId eq '" +
            salaPesajeId +
            "' and activo eq true",
        };
        let grupoOrdenes = await this._getOdataModel(
          "GRUPO_ORDEN",
          oParameters
        );
        grupoOrdenes = grupoOrdenes.sort((a, b) =>
          Number(a.codigo) > Number(b.codigo) ? 1 : -1
        );
        return grupoOrdenes && grupoOrdenes.length > 0
          ? grupoOrdenes[grupoOrdenes.length - 1].codigo
          : "0";
      },
      obtenerGrupoOrdenDetalle: async function (grupoOrdenId, salaPesajeId) {
        var oParameters = {
          $filter:
            "grupoOrdenId eq '" +
            grupoOrdenId +
            "' and insumoSalaPesajeId eq '" +
            salaPesajeId +
            "' and (oEstado_codigo eq 'PAOPESA' or oEstado_codigo eq 'PAOPEPE' or oEstado_codigo eq 'PAOPEFI')",
        };
        var detalles = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
        );

        detalles = this._UniqByKeepFirst(
          detalles,
          (item) =>
            item.numPedido +
            "_" +
            item.ordenNumero +
            "_" +
            item.codigoProducto +
            "_" +
            item.ordenLote +
            "_" +
            item.centro +
            "_" +
            item.numFraccion
        );

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
        var oParameters = {
          $filter:
            "oGrupoOrdenFraccionamiento_grupoOrdenFraccionamientoId eq '" +
            fraccionamientoId +
            "'",
        };

        let grupoOrdenes = await this._getOdataModel(
          "GRUPO_ORDEN_BULTO",
          oParameters
        );

        grupoOrdenes.forEach(function (item) {
          item.total = +item.cantidad + +item.tara;
          item.idBultoCust =
            item.ordenDetalleId == null ? item.etiqueta : item.idBulto;
        });

        return grupoOrdenes;
      },
      obtenerBultosDet: async function (fraccionamientoId, sTipoBulto) {
        let sFilter =
          "grupoOrdenFraccionamientoId eq '" + fraccionamientoId + "'";

        if (sTipoBulto && sTipoBulto !== "") {
          sFilter += " and B_tipo eq '" + sTipoBulto + "'";
        }

        var oParameters = {
          $filter: sFilter,
        };

        let grupoOrdenes = await this._getOdataModel(
          "GRUPO_ORDEN_BULTO_DET",
          oParameters
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
        var oParameters = {
          $filter:
            "grupoOrdenConsolidadoId eq '" + grupoOrdenConsolidadoId + "'",
        };
        var aConsolidado = await this._getOdataModel(
          "GRUPO_ORDEN_CONSOLIDADO_DET",
          oParameters
        );
        //var aConsolidados = this._agrupaConsolidado(aConsolidados);
        return aConsolidado[0];
      },
      obtenerConsolidados: async function (
        grupoOrdenId,
        estadoId,
        salaPesajeId
      ) {
        var oParameters = {
          $filter:
            "oGrupoOrden_grupoOrdenId eq '" +
            grupoOrdenId +
            "' and oEstado_iMaestraId eq " +
            estadoId +
            " and oSala_salaPesajeId eq '" +
            salaPesajeId +
            "'",
        };

        var aConsolidados = await this._getOdataModel(
          "GRUPO_ORDEN_CONSOLIDADO_DET",
          oParameters
        );

        var oParameters = {
          $filter: "grupoOrdenId eq '" + grupoOrdenId + "'",
        };
        var aOrdenFracDet = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
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
          const compareCodigoInsumo = a.codigoInsumo
            ? a.codigoInsumo.localeCompare(b.codigoInsumo)
            : false;
          const compareLote = a.lote ? a.lote.localeCompare(b.lote) : false;

          return compareCodigoInsumo || compareLote;
        });

        return aConsolidados;
      },
      obtenerGrupoOrden: async function (grupoOrdenId) {
        var oParameters = {
          $filter: "grupoOrdenId eq '" + grupoOrdenId + "'",
        };

        const aResult = await this._getOdataModel(
          "GRUPO_ORDEN_ATENCION",
          oParameters
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

        var oParameters = {
          $filter: sFilter,
        };
        var aFraccionamientos = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
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

        var aBultos = await this.obtenerBultosERP(
          aPedidos,
          aNumOrden,
          aCodigosInsumo,
          aLotesInsumo,
          true
        );

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
                e.Tipo == "FRACCION"
            );

            d.bultoAtendido =
              aBultoFiltrado.length > 0 ? aBultoFiltrado[0].IdBulto : "";
            d.unidadAtendido =
              aBultoFiltrado.length > 0 ? aBultoFiltrado[0].UnidadM : "";
            d.cantidadAtendido =
              aBultoFiltrado.length > 0 ? aBultoFiltrado[0].CantidadA : 0;
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

        var oParameters = {
          $filter: sFilter,
        };
        var aFraccionamientos = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
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

          if (value.insumoResetea == "X") {
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
        var aBultos = await this.obtenerBultosERP(
          aPedidos,
          aNumOrden,
          aCodigosInsumo,
          aLotesInsumo
        );

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
        var oParameters = {
          $filter:
            "grupoOrdenFraccionamientoId eq '" +
            grupoOrdenFraccionamientoId +
            "'",
        };
        var aFraccionamientos = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
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

        if (iEstado == "0") {
        } else {
          sFilter =
            sFilter +
            (sFilter ? " and " : "") +
            "FracEstado_iMaestraId eq " +
            iEstado +
            "";
        }

        if (sFilter == "") sFilter = null;

        var oParameters =
          sFilter == null
            ? {}
            : {
                $filter: sFilter,
              };
        var aFraccionamientos = await this._getOdataModel(
          "GRUPO_ORDEN_FRAC_DET",
          oParameters
        );

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

        if (oParam.Pedido)
          aFilter.push(this._newFilter("Pedido", "EQ", oParam.Pedido));

        if (oParam.Orden)
          aFilter.push(this._newFilter("Orden", "EQ", oParam.Orden));

        if (oParam.Fraccion)
          aFilter.push(this._newFilter("Fraccion", "EQ", oParam.Fraccion));

        if (oParam.Subfraccion)
          aFilter.push(
            this._newFilter("Subfraccion", "EQ", oParam.Subfraccion)
          );

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
        var aMateriales = await this._getOdataModel("CONSTANTES_MAT_EM", {});

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
            aColaImpresion: aColaImpresion,
          };
          var oResp = await this._postFunction(
            "acAddColaImpresion",
            oBodyParam
          );
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
      auth: async function (usuario, clave) {
        var oParameters = {
          usuario: encodeURI(usuario),
          clave: encodeURI(clave),
          app: "FRAC",
        };
        return await this._getFunctionResult("fnLogin", oParameters);
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
      obtenerBultosERP: async function (
        aPedidos,
        aOrdenes,
        aInsumos,
        aLotes,
        bReembalaje,
        sTipo
      ) {
        var that = this;
        var aFilter = [];

        if (aPedidos.length == 0) return [];

        aPedidos = this._UniqByKeepFirst(aPedidos, (it) => it);
        aOrdenes = this._UniqByKeepFirst(aOrdenes, (it) => it);
        aInsumos = this._UniqByKeepFirst(aInsumos, (it) => it);
        aLotes = this._UniqByKeepFirst(aLotes, (it) => it);

        if (!bReembalaje) {
          aFilter.push(this._newFilter("Tipo", "EQ", "ENTERO"));
        } else {
          aFilter.push(this._newFilter("Tipo", "EQ", sTipo));
        }

        if (aPedidos.length > 0) {
          aPedidos.forEach(function (d) {
            aFilter.push(that._newFilter("Pedido", "EQ", d));
          });
        }

        if (aOrdenes.length > 0) {
          aOrdenes.forEach(function (d) {
            aFilter.push(that._newFilter("Orden", "EQ", d));
          });
        }

        if (aInsumos.length > 0) {
          aInsumos.forEach(function (d) {
            aFilter.push(that._newFilter("CodigoInsumo", "EQ", d));
          });
        }

        if (aLotes.length > 0) {
          aInsumos.forEach(function (d) {
            aFilter.push(that._newFilter("CodigoInsumo", "EQ", d));
          });
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
          return (a.agotar == "X" ? 1 : 0) > (b.agotar == "X" ? 1 : 0);
        });
        console.log(aConsolidados);
        for (var key in aConsolidados) {
          var a = Object.assign({}, aConsolidados[key]);
          var oGroupList = aGroupList.find(
            (o) =>
              o.lote === a.lote &&
              o.codigoInsumo === a.codigoInsumo &&
              o.centro === a.centro
          );

          if (oGroupList) {
            var oGroupListNoAgotar = aConsolidados.filter(
              (o) =>
                o.lote === oGroupList.lote &&
                o.codigoInsumo === oGroupList.codigoInsumo &&
                o.centro === oGroupList.centro &&
                o.agotar === "X"
            );

            if (oGroupListNoAgotar.length > 0) {
              if (oGroupList.agotar == "") {
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

      validaFechaCaducidad: function (fechaCaducidad) {
        var _fvence = new Date(fechaCaducidad.toDateString()); //new Date("02/16/2023");
        var _hoy = new Date(new Date().toDateString()); //new Date("02/17/2023");
        var _diasNotifica = 14;
        var diffDays = parseInt((_hoy - _fvence) / (1000 * 60 * 60 * 24), 10);

        var obj = "";
        /*var obj = {
                  Tipo: "",
                  Mssg: "",
                  Days: 0
                };*/

        if (diffDays > 0) {
          obj = "E";
          /*obj = {
                  Tipo: "E",
                  Mssg: this.oResourceBundle.getText("mensajeFechaCaducFueraRango"),
                  Days: diffDays
                };*/

          console.log("VENCIDO: " + diffDays + " Dias");
        } else {
          if (diffDays < 0 && diffDays * -1 <= _diasNotifica) {
            obj = "W";
            /* obj = {
                  Tipo: "W",
                  Mssg: this.oResourceBundle.getText("mensajeFechaCaduc"),
                  Days: (diffDays * -1)
                };
                */
            console.log("VENCER EN: " + diffDays * -1 + " Dias");
          } else {
            obj = "S";
            /*obj = {
                  Tipo: "S",
                  Mssg: "",
                  Days: 0
                };
                */
          }
        }

        return obj;
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
      getToken: function () {
        var oToken = JSON.parse(window.localStorage.getItem("oToken"));
        if (oToken) {
          /**
           * Verificar si el token ya expiro
           */
          var timeNow = new Date().getTime();
          if (timeNow - +oToken.create_at < oToken.expires_in) {
            return oToken;
          }
        }

        
        var oConfig = JSON.parse(
          window.localStorage.getItem("ManifestConfig")
        ).token;
        var oToken = oConfig[oConfig.ambiente];
        var settings = oToken.oauth;
        return new Promise((resolve, reject) => {
          
          $.ajax(settings).done(function (response) {
            response.create_at = new Date().getTime();
            window.localStorage.setItem("oToken", JSON.stringify(response));
            console.log(response);
            resolve(response);
          });
        });
      },
      _getModelAuth: async function (oModel) {
        var oToken = await this.getToken();
        var oModelToken = new sap.ui.model.odata.v2.ODataModel({
          serviceUrl: oModel.sServiceUrl, //sServiceUrl
          headers: {
            Authorization: oToken.token_type + " " + oToken.access_token,
          },
          useBatch: false,
        });
        return oModelToken;
      },
      _getOdataModel: async function (sEntity, oUrlParameters) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataRead(
              oModel,
              //"/" + sEntity,
              sEntity,
              oUrlParameters,
              []
            );
            var oResp = oResult[sEntity] ?? oResult;
            var oDataResp = oResp;
            if (oResp.data) {
              oDataResp = oResp.data;
            } else if (oResp.result) {
              oDataResp = oResp.result;
            } else if (oResp.results) {
              oDataResp = oResp.results;
              return oDataResp;
            } else if (oResp.d) {
              oDataResp = oResp;
              if (oDataResp.results) {
                oDataResp = oDataResp.results;
                return oDataResp;
              }
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
      _getFunctionResult: async function (sEntity, oUrlParameters) {
        var result = null;
        if (navigator.onLine) {
          try {
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataRead(
              oModel,
              //"/" + sEntity,
              sEntity,
              oUrlParameters,
              []
            );
            var oResp = oResult[sEntity];
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
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataCreate(oModel, sEntity, oBody);

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
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataCreate(oModel, sEntity, oBody);
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
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataUpdate(oModel, sEntity, oBody);
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
            var oModel = await this._getModelAuth(this.oServiceModelV2);
            var oResult = await oDataSrv.oDataRemove(oModel, sEntity);
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
