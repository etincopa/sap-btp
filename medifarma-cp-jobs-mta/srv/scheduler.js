const cds = require("@sap/cds");
//const BASE_URI = "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV";
//const axios = require("axios");
//const cpRoutes = require("./api/index");
const erpsrv = require("./api/controllers/erpOdataSrv-controller");
const util = require("./api/helper/utils");
module.exports.runJob = async function () {
    const isLocal = false;
    const service = await cds.connect.to("db");
    /* const {
      'SALA_PESAJE',
      'ORDEN',
      'PEDIDO',
      'ORDEN_DETALLE',
      'MIF_ADMIN_HDI_MAESTRA_TIPO',
      'MIF_ADMIN_HDI_MAESTRA',
      'VIEW_PEDIDO_CONSOLIDADO',
    } = service.entities("mif.cp"); */
    const {
        SALA_PESAJE,
        ORDEN,
        PEDIDO,
        ORDEN_DETALLE,
        MIF_ADMIN_HDI_MAESTRA_TIPO,
        MIF_ADMIN_HDI_MAESTRA,
        VIEW_PEDIDO_CONSOLIDADO,
    } = service.entities("mif.cp");

    var CronJob = require("cron").CronJob;

    /**
     * JOBS DINAMIC CONTROL
     * Cron Ranges:
     * --------------------------
     * Seconds: 0-59
     * Minutes: 0-59
     * Hours: 0-23
     * Day of Month: 1-31
     * Months: 0-11 (Jan-Dec)
     * Day of Week: 0-6 (Sun-Sat)
     */
    var jobControl;
    var jobControlPeriod = 1;
    var jobUpdateStatus;
    var sCronRanges = ""; // */10 * * * * *;
    var CronJob = require("cron").CronJob;
    jobControl = new CronJob(
        "*/" + jobControlPeriod + " * * * *",
        async function () {
            /**
             * Consultar maestra para configurar Jobs
             */
            console.log("Inicio - Consultar maestra para configurar Jobs");
            try {
                const aMaestraTipo = await SELECT.from(
                    MIF_ADMIN_HDI_MAESTRA_TIPO
                ).where({
                    activo: true,
                });
                const aMaestra = await SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({
                    activo: true,
                });
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

                var oMaestraJobStatusAt = aConstant["SCHEDULE"].find(
                    (o) => o.codigo === "CPJOBATEN" // JOBS ESTADOS ATENCION
                );

                if (
                    oMaestraJobStatusAt &&
                    oMaestraJobStatusAt.contenido &&
                    oMaestraJobStatusAt.contenido.trim()
                ) {
                    if (!(oMaestraJobStatusAt.contenido == sCronRanges)) {
                        sCronRanges = oMaestraJobStatusAt.contenido;
                        _getCronStatusAten(jobUpdateStatus, sCronRanges);
                    }
                } else {
                    if (jobUpdateStatus) {
                        console.log("Stop job");
                        jobUpdateStatus.stop();
                    }
                }
            } catch (oError) {
                console.log(oError);
            }
            console.log("Fin - Consultar maestra para configurar Jobs");
        },
        null,
        true,
        "America/Los_Angeles"
    );
    jobControl.start();

    var job = new CronJob(
        "*/1 * * * *",
        async function () {
            console.log("Inicio - Job1");
            const oEstadoHabil = await SELECT.one.from(MIF_ADMIN_HDI_MAESTRA).where({
                codigo: "HABIL",
                oMaestraTipo_maestraTipoId: 12,
            });

            const oEstadoDes = await SELECT.one.from(MIF_ADMIN_HDI_MAESTRA).where({
                codigo: "DHABI",
                oMaestraTipo_maestraTipoId: 12,
            });
            //desactivar tara manual
            if (oEstadoHabil && oEstadoDes) {
                const aSalasTaraManual = await SELECT.from(SALA_PESAJE).where({
                    oEstadoTaraManual_iMaestraId: oEstadoHabil.iMaestraId,
                });

                for (let i = 0; i < aSalasTaraManual.length; i++) {
                    const item = aSalasTaraManual[i];
                    if (item.inicioTaraManual != null) {
                        const iHora = parseInt(item.horaTaraManual);
                        let dInicio = new Date(item.inicioTaraManual);
                        dInicio.setHours(dInicio.getHours() + iHora);

                        if (dInicio < new Date()) {
                            await UPDATE(SALA_PESAJE)
                                .set({
                                    oEstadoTaraManual_iMaestraId: oEstadoDes.iMaestraId,
                                    inicioTaraManual: null,
                                })
                                .where({
                                    salaPesajeId: item.salaPesajeId,
                                });
                        }
                    } else {
                        await UPDATE(SALA_PESAJE)
                            .set({
                                oEstadoTaraManual_iMaestraId: oEstadoDes.iMaestraId,
                                inicioTaraManual: null,
                            })
                            .where({
                                salaPesajeId: item.salaPesajeId,
                            });
                    }
                }
                //desactivar peso manual
                const aSalasPesoManual = await SELECT.from(SALA_PESAJE).where({
                    oEstadoPesoManual_iMaestraId: oEstadoHabil.iMaestraId,
                });

                for (let i = 0; i < aSalasPesoManual.length; i++) {
                    const item = aSalasPesoManual[i];
                    if (item.inicioPesoManual != null) {
                        const iMinuto = parseInt(item.minutPesoManual);
                        let dInicio = new Date(item.inicioPesoManual);
                        dInicio.setMinutes(dInicio.getMinutes() + iMinuto);

                        if (dInicio < new Date()) {
                            await UPDATE(SALA_PESAJE)
                                .set({
                                    oEstadoPesoManual_iMaestraId: oEstadoDes.iMaestraId,
                                    inicioPesoManual: null,
                                })
                                .where({
                                    salaPesajeId: item.salaPesajeId,
                                });
                        }
                    } else {
                        await UPDATE(SALA_PESAJE)
                            .set({
                                oEstadoPesoManual_iMaestraId: oEstadoDes.iMaestraId,
                                inicioPesoManual: null,
                            })
                            .where({
                                salaPesajeId: item.salaPesajeId,
                            });
                    }
                }

                //desactivar lectura etiqueta
                const aSalasLectEtiqueta = await SELECT.from(SALA_PESAJE).where({
                    oEstadoLecturaEtiqueta_iMaestraId: oEstadoHabil.iMaestraId,
                });

                for (let i = 0; i < aSalasLectEtiqueta.length; i++) {
                    const item = aSalasLectEtiqueta[i];
                    if (item.inicioLectEtiqueta != null) {
                        const iHora = parseInt(item.horaLectEtiqueta);
                        let dInicio = new Date(item.inicioLectEtiqueta);
                        dInicio.setHours(dInicio.getHours() + iHora);

                        if (dInicio < new Date()) {
                            await UPDATE(SALA_PESAJE)
                                .set({
                                    oEstadoLecturaEtiqueta_iMaestraId: oEstadoDes.iMaestraId,
                                    inicioLectEtiqueta: null,
                                })
                                .where({
                                    salaPesajeId: item.salaPesajeId,
                                });
                        }
                    } else {
                        await UPDATE(SALA_PESAJE)
                            .set({
                                oEstadoLecturaEtiqueta_iMaestraId: oEstadoDes.iMaestraId,
                                inicioLectEtiqueta: null,
                            })
                            .where({
                                salaPesajeId: item.salaPesajeId,
                            });
                    }
                }
            }

            console.log("Fin - Job1");
        },
        null,
        true,
        "America/Los_Angeles"
    );
    job.start();

    function _getCronStatusAten(job, sCronRanges) {
        console.log("ENTER JOBS: " + sCronRanges);
        if (job) {
            console.log("JOB STOP");
            job.stop();
        }

        jobUpdateStatus = new CronJob(
            sCronRanges,
            async function () {
                try {
                    console.log("Inicio - Job2");
                    console.log("------------- INICIO -------------");
                    const aMaestraTipo = await SELECT.from(MIF_ADMIN_HDI_MAESTRA_TIPO)
                        .where({
                            activo: true,
                        })
                        .columns((A) => {
                            A.maestraTipoId.as("maestraTipoId"), A.tabla.as("tabla");
                        });

                    const aMaestra = await SELECT.from(MIF_ADMIN_HDI_MAESTRA)
                        .where({
                            activo: true,
                        })
                        .columns((A) => {
                            A.iMaestraId.as("iMaestraId"),
                                A.codigo.as("codigo"),
                                A.contenido.as("contenido"),
                                A.oMaestraTipo_maestraTipoId.as("oMaestraTipo_maestraTipoId");
                        });

                    console.log("------------- CONSULTA MAESTRA -------------");
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
                    console.log("------------- AGRUPA MAESTRA -------------");
                    /**Obtener Pedidos cuando sus estados de sus ordenes esten en PENDIENTE y PICKING*/
                    const aPedido = await SELECT.from(VIEW_PEDIDO_CONSOLIDADO)
                        .where({
                            /*Atencion, Almacen*/
                            pedidoEstado: "PAPPEND",
                            or: {
                                pedidoEstado: "PAPPROC",
                                or: {
                                    pedidoEstado: "AMPPEND",
                                    or: { pedidoEstado: "AMPPROC" },
                                },
                            },
                        })
                        .columns((A) => {
                            A.pedidoId.as("pedidoId"),
                                A.pedidoNumero.as("pedidoNumero"),
                                A.pedidoEstado.as("pedidoEstado"),
                                A.PedidoTipo.as("PedidoTipo"),
                                A.PedidoTipoD.as("PedidoTipoD"),
                                A.ordenId.as("ordenId"),
                                A.ordenNumero.as("ordenNumero"),
                                A.ordenLote.as("ordenLote"),
                                A.ordenEstado.as("ordenEstado"),
                                A.ordenEstadoTraslado.as("ordenEstadoTraslado"),
                                A.ordenDetalleId.as("ordenDetalleId"),
                                A.pickingIniUsu.as("pickingIniUsu"),
                                A.pickingIniFec.as("pickingIniFec"),
                                A.pickingFinUsu.as("pickingFinUsu"),
                                A.pickingFinFec.as("pickingFinFec"),
                                A.numBultoEntero.as("numBultoEntero"),
                                A.insumoCodigo.as("insumoCodigo"),
                                A.insumoLote.as("insumoLote"),
                                A.insumoEstado.as("insumoEstado"),
                                A.insumoEstadoTraslado.as("insumoEstadoTraslado"),
                                A.insumoIdPos.as("insumoIdPos"),
                                A.cantPedida.as("cantPedida"),
                                A.cantAtendida.as("cantAtendida");
                        });

                    console.log(
                        "------------- CONSULTA VISTA PEDIDO_CONSOLIDADO -------------"
                    );
                    var aPedidoGroup = aPedido.reduce(function (r, a) {
                        var sKey = a.pedidoNumero;
                        r[sKey] = r[sKey] || [];
                        r[sKey].push(a);
                        return r;
                    }, Object.create(null));

                    var aFilter = [];
                    var aPedidoErp = [];

                    for (var key in aPedidoGroup) {
                        aFilter.push("PedidoNumero eq '" + key + "'");
                    }

                    if (isLocal) {
                        aFilter = ["PedidoNumero eq '60000064'"];
                    }

                    /**
                     * Fragmentar en bloques de 140 items
                     */
                    var arrays = [],
                        size = 140;
                    for (let i = 0; i < aFilter.length; i += size) {
                        arrays.push(aFilter.slice(i, i + size));
                    }

                    for await (const oItem of arrays) {
                        aFilter = oItem;
                        var sEntity = "/PedidoConsolidadoSet";
                        var sFilter = "?$filter=" + aFilter.join(" or ");

                        console.log("FILTER: " + sEntity + sFilter);

                        var data = await erpsrv.getDinamicSet(sEntity + sFilter);
                        if (data.d) {
                            //aPedidoErp = data.d.results;
                            aPedidoErp = aPedidoErp.concat(data.d.results);
                        }
                    }

                    if (!aPedidoErp || !aPedidoErp.length) return;

                    var aCpPedido = aConstant["ESTADO_CP_PEDIDO"],
                        aCpOrden = aConstant["ESTADO_CP_ORDEN"],
                        aCpInsumo = aConstant["ESTADO_CP_INSUMO"],
                        aAmPedido = aConstant["ESTADO_AM_PEDIDO"],
                        aAmOrden = aConstant["ESTADO_AM_ORDEN"],
                        aAmInsumo = aConstant["ESTADO_AM_INSUMO"];
                    var oDate = new Date();

                    var oEstadosIncludesUpdate = [
                        /*CENTRAL PESADA*/
                        "PAOPEND",
                        "PAOPICK",
                        "PAOATEN",
                        "PAOAPAR",

                        "PAIPEPI",
                        "PAIENPI",
                        "PAIATPI",
                        "PAINAPI",

                        /*ALMACEN MATERIALES*/
                        "AMOPEND",
                        "AMOPICK",
                        "AMOATEN",
                        "AMOAPAR",

                        "AMIPEPI",
                        "AMIENPI",
                        "AMIATPI",
                        "AMINAPI",
                    ];

                    var aPedidoMerge = _mergePedido(aPedido, aPedidoErp, aConstant);
                    //--------------- PEDIDO
                    for (var kPed in aPedidoMerge) {
                        var oPedidoBtp = aPedidoMerge[kPed];
                        var aOrdenBtp = oPedidoBtp.aOrden;

                        console.log(
                            "----------------" + oPedidoBtp.pedidoNumero + "----------------"
                        );

                        var aEstadoPedido = [],
                            aEstadoOrden = [],
                            aEstadoInsumo = [];

                        if (oPedidoBtp.PedidoTipo == "PCP") {
                            aEstadoPedido = aCpPedido;
                            aEstadoOrden = aCpOrden;
                            aEstadoInsumo = aCpInsumo;
                        } else {
                            aEstadoPedido = aAmPedido;
                            aEstadoOrden = aAmOrden;
                            aEstadoInsumo = aAmInsumo;
                        }

                        //--------------- ORDEN
                        for (var kOrd in aOrdenBtp) {
                            var oOrdenBtp = aOrdenBtp[kOrd];
                            var aInsumoBtp = oOrdenBtp.aInsumo;

                            //--------------- INSUMO
                            for (var kIns in aInsumoBtp) {
                                var oInsumoBtp = aInsumoBtp[kIns];

                                var oEstadoInsumo = aEstadoInsumo.find(
                                    (o) => o.codigo === oInsumoBtp.insumoEstado
                                );

                                if (oEstadosIncludesUpdate.includes(oEstadoInsumo.codigo)) {
                                    await UPDATE(ORDEN_DETALLE)
                                        .set({
                                            fechaActualiza: oDate,
                                            oEstado_iMaestraId: oEstadoInsumo.iMaestraId,
                                            cantAtendida: oInsumoBtp.cantAtendida
                                                ? oInsumoBtp.cantAtendida
                                                : 0,
                                            estadoTraslado: oInsumoBtp.insumoEstadoTraslado
                                                ? oInsumoBtp.insumoEstadoTraslado
                                                : "",
                                        })
                                        .where({
                                            ordenDetalleId: oInsumoBtp.ordenDetalleId,
                                        });
                                }

                                console.log(
                                    "[" +
                                    oInsumoBtp.pedidoNumero +
                                    "] " +
                                    oInsumoBtp.ordenNumero +
                                    " - " +
                                    oInsumoBtp.insumoCodigo +
                                    " - " +
                                    oInsumoBtp.insumoLote +
                                    " - " +
                                    oInsumoBtp.insumoIdPos +
                                    " - " +
                                    oEstadoInsumo.contenido +
                                    " (" +
                                    oEstadoInsumo.iMaestraId +
                                    " - " +
                                    oEstadoInsumo.codigo +
                                    ")"
                                );
                            }

                            var oEstadoOrden = aEstadoOrden.find(
                                (o) => o.codigo === oOrdenBtp.ordenEstado
                            );

                            var oSet = {
                                fechaActualiza: new Date(),
                                oEstado_iMaestraId: oEstadoOrden.iMaestraId,
                                numBultoEntero: oOrdenBtp.numBultoEntero,
                                pickingIniUsu: oOrdenBtp.pickingIniUsu
                                    ? oOrdenBtp.pickingIniUsu
                                    : null,
                                pickingIniFec: oOrdenBtp.pickingIniFec
                                    ? oOrdenBtp.pickingIniFec
                                    : null,
                                pickingFinUsu: oOrdenBtp.pickingFinUsu
                                    ? oOrdenBtp.pickingFinUsu
                                    : null,
                                pickingFinFec: oOrdenBtp.pickingFinFec
                                    ? oOrdenBtp.pickingFinFec
                                    : null,
                                estadoTraslado: oOrdenBtp.ordenEstadoTraslado
                                    ? oOrdenBtp.ordenEstadoTraslado
                                    : "",
                            };
                            Object.keys(oSet).forEach((key) => {
                                if (oSet[key] === undefined) {
                                    delete oSet[key];
                                }
                            });

                            if (oEstadosIncludesUpdate.includes(oEstadoOrden.codigo)) {
                                await UPDATE(ORDEN).set(oSet).where({
                                    ordenId: oOrdenBtp.ordenId,
                                });
                            }

                            console.log(
                                "[" +
                                oOrdenBtp.pedidoNumero +
                                "] " +
                                oOrdenBtp.ordenNumero +
                                " - " +
                                oOrdenBtp.ordenLote +
                                " - " +
                                oEstadoOrden.contenido +
                                " (" +
                                oEstadoOrden.iMaestraId +
                                " - " +
                                oEstadoOrden.codigo +
                                ")"
                            );
                        }

                        var oEstadoPedido = aEstadoPedido.find(
                            (o) => o.codigo === oPedidoBtp.pedidoEstado
                        );

                        var oSet = {
                            fechaActualiza: new Date(),
                            oEstado_iMaestraId: oEstadoPedido.iMaestraId,
                            pickingUsuInic: oPedidoBtp.pickingIniUsu,
                            pickingFecInic: oPedidoBtp.pickingIniFec,
                            pickingUsuFin: oPedidoBtp.pickingFinUsu,
                            pickingFecFin: oPedidoBtp.pickingFinFec,
                        };
                        Object.keys(oSet).forEach((key) => {
                            if (oSet[key] === undefined) {
                                delete oSet[key];
                            }
                        });
                        await UPDATE(PEDIDO).set(oSet).where({
                            pedidoId: oPedidoBtp.pedidoId,
                        });

                        console.log(
                            oPedidoBtp.pedidoNumero +
                            " - " +
                            oEstadoPedido.contenido +
                            " (" +
                            oEstadoPedido.iMaestraId +
                            " - " +
                            oEstadoPedido.codigo +
                            ")"
                        );
                    }

                    /*
                     * Enviar Status de registros a ERP
                     */
                    console.log("----------ERP UPDATE------------");
                    const aPedidoUpdate = await SELECT.from(VIEW_PEDIDO_CONSOLIDADO)
                        .where({
                            /*Atencion, Almacen*/
                            pedidoEstado: "PAPPEND",
                            or: {
                                pedidoEstado: "PAPPROC",
                                or: {
                                    pedidoEstado: "AMPPEND",
                                    or: { pedidoEstado: "AMPPROC" },
                                },
                            },
                        })
                        .columns((A) => {
                            A.pedidoId.as("pedidoId"),
                                A.pedidoNumero.as("PedidoNumero"),
                                A.pedidoEstado.as("PedidoEstado"),
                                A.PedidoTipo.as("PedidoTipo"),
                                A.PedidoTipoD.as("PedidoTipoD"),
                                A.PedidoCentro.as("PedidoCentro"),
                                A.pedidoFecha.as("PedidoFecha"),
                                A.ordenId.as("ordenId"),
                                A.ordenNumero.as("OrdenNumero"),
                                A.ordenCodProd.as("OrdenCodigo"),
                                A.OrdenDescrip.as("OrdenDescrip"),
                                A.ordenLote.as("OrdenLote"),
                                A.ordenEstado.as("OrdenEstado"),
                                A.ordenDetalleId.as("ordenDetalleId"),
                                A.insumoCodigo.as("InsumoCodigo"),
                                A.insumoDescrip.as("InsumoDescrip"),
                                A.InsumoLote.as("InsumoLote"),
                                A.insumoIdPos.as("InsumoIdPos"),
                                A.insumoCentro.as("InsumoCentro"),
                                A.insumoAlmacen.as("InsumoAlmacen"),
                                A.InsumoSala.as("InsumoSala"),
                                A.InsumoAgotar.as("InsumoAgotar"),
                                A.insumoEstado.as("InsumoEstado"),
                                A.insumoUmb.as("InsumoUmb"),
                                A.cantPedida.as("CantPedida");
                        });

                    var oBody = _buildUpdatePedidoErp(aPedidoUpdate, aConstant);
                    if (isLocal) {
                    } else {
                        console.log("----- ACTUALIZANDO ERP -----");
                        var sEntity = "/PedidoUpdateSet";
                        await erpsrv.postDinamicSet(sEntity, oBody);
                    }
                    console.log("----- FIN -----");
                } catch (oError) {
                    console.log(oError);
                }

                console.log("Inicio - Job2");
            },
            null,
            true,
            "America/Los_Angeles"
        );
        jobUpdateStatus.start();
    }

    function _buildUpdatePedidoErp(aPedido, aConstant) {
        console.log("BUILD BODY");
        var oBody = {
            Object: "JOBS",
            UpdateToPedidoSet: [],
        };

        var aCpPedido = aConstant["ESTADO_CP_PEDIDO"],
            aCpOrden = aConstant["ESTADO_CP_ORDEN"],
            aCpInsumo = aConstant["ESTADO_CP_INSUMO"],
            aAmPedido = aConstant["ESTADO_AM_PEDIDO"],
            aAmOrden = aConstant["ESTADO_AM_ORDEN"],
            aAmInsumo = aConstant["ESTADO_AM_INSUMO"];

        var aPedidoConsolidadoSet = [];
        for (var key in aPedido) {
            var oItem = aPedido[key];
            var aEstadoPedido = [],
                aEstadoOrden = [],
                aEstadoInsumo = [];

            if (oItem.PedidoTipo == "PCP") {
                aEstadoPedido = aCpPedido;
                aEstadoOrden = aCpOrden;
                aEstadoInsumo = aCpInsumo;
            } else {
                aEstadoPedido = aAmPedido;
                aEstadoOrden = aAmOrden;
                aEstadoInsumo = aAmInsumo;
            }

            var oEstadoPedido = aEstadoPedido.find(
                (o) => o.codigo === oItem.PedidoEstado
            ),
                oEstadoOrden = aEstadoOrden.find((o) => o.codigo === oItem.OrdenEstado),
                oEstadoInsumo = aEstadoInsumo.find(
                    (o) => o.codigo === oItem.InsumoEstado
                );

            var o = {
                Object: "JOBS",
                PedidoUsuario: "NONE",
                PedidoNumero: oItem.PedidoNumero,
                PedidoEstado: oEstadoPedido ? oEstadoPedido.contenido : null,
                PedidoTipo: oItem.PedidoTipo,
                PedidoTipoD: oItem.PedidoTipoD,
                PedidoCentro: oItem.PedidoCentro,
                PedidoFecha: _formatDateYMD(oItem.PedidoFecha) + "T00:00:00.0000000", //2022-04-27T00:00:00.0000000
                OrdenNumero: oItem.OrdenNumero,
                OrdenCodigo: oItem.OrdenCodigo,
                OrdenDescrip: oItem.OrdenDescrip,
                OrdenLote: oItem.OrdenLote,
                OrdenEstado: oEstadoOrden ? oEstadoOrden.contenido : null,
                InsumoCodigo: oItem.InsumoCodigo,
                InsumoDescrip: oItem.InsumoDescrip,
                InsumoLote: oItem.InsumoLote,
                InsumoIdPos: oItem.InsumoIdPos.toString(),
                InsumoCentro: oItem.InsumoCentro,
                InsumoAlmacen: oItem.InsumoAlmacen,
                InsumoSala: oItem.InsumoSala,
                InsumoAgotar: oItem.InsumoAgotar,
                InsumoEstado: oEstadoInsumo ? oEstadoInsumo.contenido : null,
                InsumoUmb: oItem.InsumoUmb,
                CantPedida: oItem.CantPedida,
            };

            aPedidoConsolidadoSet.push(o);
        }

        oBody.UpdateToPedidoSet = aPedidoConsolidadoSet;
        return oBody;
    }

    async function updateStatusPedido(aPedido, aPedidoErp, aConstant) {
        console.log("------------- CONSULTA ERP -------------");
        /**Obtener Pedidos del ERP*/
        var aPedidoGroupErp = aPedidoErp.reduce(function (r, a) {
            var sKey = a.PEDIDO;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
        }, Object.create(null));

        /**Comparar registros de pedido BTP vs ERP */
        for (var key in aPedidoGroup) {
            var aPedidoGBtp = aPedidoGroup[key];
            var aPedidoGErp = aPedidoGroupErp[key];
            var oPedidoGBtp = aPedidoGBtp[0];

            /**Agrupar por Orden */
            var aOrdenGBtp = aPedidoGBtp.reduce(function (r, a) {
                var sKey = a.ordenNumero;
                r[sKey] = r[sKey] || [];
                r[sKey].push(a);
                return r;
            }, Object.create(null));
            if (aPedidoGErp) {
                var aOrdenGErp = aPedidoGErp.reduce(function (r, a) {
                    var sKey = a.ORDEN;
                    r[sKey] = r[sKey] || [];
                    r[sKey].push(a);
                    return r;
                }, Object.create(null));

                console.log("PEDIDO : " + oPedidoGBtp.pedidoNumero);
                console.log("------------- AGRUPA ORDENES -------------");
                /**Evaluar Ordenes */
                var aOrdenEvaluate = [];
                var aOrdenAll = [];
                for (var key1 in aOrdenGBtp) {
                    var aInsumoBtp = aOrdenGBtp[key1];
                    var aInsumoErp = aOrdenGErp[key1];

                    var oOrdenBtp = aInsumoBtp[0];
                    var oOrdenErp = aInsumoErp[0];

                    if (
                        [
                            /*Pedido Atencion*/
                            "PAOPEND", //PENDIENTE
                            "PAOPICK", //PICKING
                            "PAOATEN", //ATENDIDO
                            "PAOAPAR", //ATENDIDO PARCIAL
                            /*Pedido Almacen*/
                            "AMOPEND", //PENDIENTE
                            "AMOPICK", //PICKING
                            "AMOATEN", //ATENDIDO
                            "AMOAPAR", //ATENDIDO PARCIAL
                        ].includes(oOrdenBtp.ordenEstado)
                    ) {
                        //Solo evaluar las ordenes que tengan los siguientes estados.

                        /**Evaluar Insumos de las orden */
                        var aInsumoEvaluate = [];

                        for (var key2 in aInsumoBtp) {
                            var oItem = aInsumoBtp[key2];
                            var oItemErp = aInsumoErp.find(
                                (o) =>
                                    o.PEDIDO === oItem.pedidoNumero &&
                                    o.ORDEN === oItem.ordenNumero &&
                                    o.CODIGOINSUMO === oItem.insumoCodigo &&
                                    o.IDPOS == (oItem.insumoIdPos ? oItem.insumoIdPos : 1)
                            );
                            /**Actualiza estado de los Insumo */
                            if (oItemErp) {
                                var oInsumoEval = oItem;
                                //Si insumo no esta anulado
                                if (
                                    !(
                                        oInsumoEval.insumoEstado === "PAIANUL" ||
                                        oInsumoEval.insumoEstado === "AMIANUL"
                                    )
                                ) {
                                    if (
                                        oItemErp.STATUSATEN === "ATENDIDO PICKING" ||
                                        oItemErp.STATUSATEN === "EN PICKING" ||
                                        oItemErp.STATUSATEN === "PENDIENTE PICKING"
                                    ) {
                                        if (oItem.PedidoTipo == "PCP") {
                                            if (
                                                [
                                                    "ATENDIDO PICKING", //ATENDIDO PICKING : PAIATPI
                                                    "NO ATENDIDO PICKING", //NO ATENDIDO PICKING : PAINAPI
                                                ].includes(oItemErp.STATUSATEN)
                                            ) {
                                                oInsumoEval.insumoEstado =
                                                    oItemErp.STATUSATEN === "ATENDIDO PICKING"
                                                        ? "PAIATPI"
                                                        : "PAINAPI";
                                                oInsumoEval.update = "X";
                                            } else if (oItemErp.STATUSATEN === "EN PICKING") {
                                                oInsumoEval.insumoEstado = "PAIENPI"; //EN PICKING : PAIENPI
                                                oInsumoEval.update = "X";
                                            } else if (oItemErp.STATUSATEN === "PENDIENTE PICKING") {
                                                oInsumoEval.insumoEstado = "PAIPEPI"; //PENDIENTE PICKING : PAIPEPI
                                                oInsumoEval.update = "X";
                                            }
                                        } else {
                                            if (
                                                [
                                                    "ATENDIDO PICKING", //ATENDIDO PICKING : AMIATPI
                                                    "NO ATENDIDO PICKING", //NO ATENDIDO PICKING : AMINAPI
                                                ].includes(oItemErp.STATUSATEN)
                                            ) {
                                                oInsumoEval.insumoEstado =
                                                    oItemErp.STATUSATEN === "ATENDIDO PICKING"
                                                        ? "AMIATPI"
                                                        : "AMINAPI";
                                                oInsumoEval.update = "X";
                                            } else if (oItemErp.STATUSATEN === "EN PICKING") {
                                                oInsumoEval.insumoEstado = "AMIENPI"; //EN PICKING : AMIENPI
                                                oInsumoEval.update = "X";
                                            } else if (oItemErp.STATUSATEN === "PENDIENTE PICKING") {
                                                oInsumoEval.insumoEstado = "AMIPEPI"; //PENDIENTE PICKING : AMIPEPI
                                                oInsumoEval.update = "X";
                                            }
                                        }
                                    } else if (oItemErp.STATUSATEN == "") {
                                        /*if (oItem.PedidoTipo == "PCP") {
                                          oInsumoEval.insumoEstado = "PAIPEPI"; //EN PICKING : AMIENPI
                                        } else {
                                          oInsumoEval.insumoEstado = "AMIPEPI"; //EN PICKING : AMIENPI
                                        }*/
                                        oInsumoEval.update = "X";
                                    }

                                    oInsumoEval.cantAtendida = parseFloat(oItemErp.CANTATENENT);
                                    //oInsumoEval.cantAtendidaSal = oItemErp.CANTATENSAL;

                                    oInsumoEval.pickingIniUsu = null;
                                    oInsumoEval.pickingIniFec = null;
                                    oInsumoEval.pickingFinUsu = null;
                                    oInsumoEval.pickingFinFec = null;
                                    oInsumoEval.insumoEstadoTraslado = oItemErp.StatusTras;

                                    if (oItemErp.FECHAINICPICK.length <= 8) {
                                        oItemErp.FECHAINICPICK = oItemErp.FECHAINICPICK.replace(
                                            /(\d{4})(\d{2})(\d{2})/g,
                                            "$1-$2-$3"
                                        );
                                    }
                                    if (oItemErp.FECHAFINPICK.length <= 8) {
                                        oItemErp.FECHAFINPICK = oItemErp.FECHAFINPICK.replace(
                                            /(\d{4})(\d{2})(\d{2})/g,
                                            "$1-$2-$3"
                                        );
                                    }

                                    oInsumoEval.pickingIniUsu = oItemErp.USUARIOINICPICK;
                                    if (
                                        !oItemErp.FECHAINICPICK ||
                                        oItemErp.FECHAINICPICK == "0000-00-00"
                                    ) {
                                        oInsumoEval.pickingIniFec = null;
                                    } else {
                                        var oDate = new Date(
                                            oItemErp.FECHAINICPICK + " " + oItemErp.HORAINICPICK
                                        );
                                        oInsumoEval.pickingIniFec = new Date(
                                            oDate.setHours(oDate.getHours() + 5)
                                        );
                                    }

                                    oInsumoEval.pickingFinUsu = await util.getValueOrNull(
                                        oItemErp.USUARIOFINPICK
                                    );
                                    if (
                                        !oItemErp.FECHAFINPICK ||
                                        oItemErp.FECHAFINPICK == "0000-00-00"
                                    ) {
                                        oInsumoEval.pickingFinFec = null;
                                    } else {
                                        var oDate = new Date(
                                            oItemErp.FECHAFINPICK + " " + oItemErp.HORAFINPICK
                                        );
                                        oInsumoEval.pickingFinFec = new Date(
                                            oDate.setHours(oDate.getHours() + 5)
                                        );
                                    }

                                    aInsumoEvaluate.push(oInsumoEval);
                                }
                            }
                        }

                        /** ACTUALIZACION DE ESTADOS
                         * INSUMO
                         */

                        for (var iIndex in aInsumoEvaluate) {
                            var oEval = aInsumoEvaluate[iIndex];

                            if (oEval.update == "X") {
                                var oMaestra;
                                if (oEval.PedidoTipo == "PCP") {
                                    oMaestra = aConstant["ESTADO_CP_INSUMO"].find(
                                        (o) => o.codigo === oEval.insumoEstado
                                    );
                                } else {
                                    oMaestra = aConstant["ESTADO_AM_INSUMO"].find(
                                        (o) => o.codigo === oEval.insumoEstado
                                    );
                                }
                                console.log(
                                    oEval.pedidoNumero +
                                    " - " +
                                    oEval.ordenNumero +
                                    " - " +
                                    oEval.insumoCodigo +
                                    " - " +
                                    oMaestra.iMaestraId
                                );
                                await UPDATE(ORDEN_DETALLE)
                                    .set({
                                        fechaActualiza: new Date(),
                                        oEstado_iMaestraId: oMaestra.iMaestraId,
                                        cantAtendida: oEval.cantAtendida,
                                        estadoTraslado: oEval.insumoEstadoTraslado
                                            ? oEval.insumoEstadoTraslado
                                            : "",
                                    })
                                    .where({
                                        ordenDetalleId: oEval.ordenDetalleId,
                                    });
                            }
                        }

                        /** ACTUALIZACION DE ESTADOS
                         * ORDEN
                         */

                        /** Validar si todos sus items estan con el estado ATENDIDO PICKING :  PAIATPI
                         * Si todos sus insymos tienen estado ATENDIDO PICKING, la orden pasa a tener estado de ATENDIDO
                         */
                        var oOrdenEvaluate = Object.assign({}, oOrdenBtp);
                        var bAtendidoPicking = false;
                        var bNoAtendidoPicking = false;
                        var bPendientePicking = false;

                        /** ESTADOS TRASLADO INSUMO */
                        var aEstadosTraslado = [
                            ...new Set(
                                aInsumoEvaluate.map((item) => item.insumoEstadoTraslado)
                            ),
                        ];

                        oOrdenEvaluate.ordenEstadoTraslado = "";
                        if (aEstadosTraslado) {
                            oOrdenEvaluate.ordenEstadoTraslado = aEstadosTraslado.join(",");
                        }

                        /** ESTADOS INSUMO */
                        var aEstadosInsumo = [
                            ...new Set(aInsumoEvaluate.map((item) => item.insumoEstado)),
                        ];

                        if (aEstadosInsumo) {
                            if (
                                aEstadosInsumo.length == 1 &&
                                (aEstadosInsumo[0] == "PAIPEPI" ||
                                    aEstadosInsumo[0] == "AMIPEPI")
                            ) {
                                bPendientePicking = true;
                            }

                            if (
                                aEstadosInsumo.includes("PAIENPI") ||
                                aEstadosInsumo.includes("AMIENPI")
                            ) {
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: EN PICKING */
                            } else if (
                                aEstadosInsumo.includes("PAINAPI") ||
                                aEstadosInsumo.includes("AMINAPI")
                            ) {
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: NO ATENDIDO PICKING */
                                bNoAtendidoPicking = true;
                            } else if (
                                aEstadosInsumo.includes("PAIATPI") ||
                                aEstadosInsumo.includes("AMIATPI")
                            ) {
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: ATENDIDO PICKING */
                                bAtendidoPicking = true;
                            }
                        }

                        var bOrdenAnulado = false;
                        if (aInsumoEvaluate.length <= 0) {
                            //Verificar si todo los insumos de la orden estan anulados
                            var aEstadosInsumo = [
                                ...new Set(aInsumoBtp.map((item) => item.insumoEstado)),
                            ];
                            if (
                                aEstadosInsumo.length == 1 &&
                                (aEstadosInsumo[0] == "PAIANUL" ||
                                    aEstadosInsumo[0] == "AMIANUL")
                            )
                                bOrdenAnulado = true;
                        }

                        if (bOrdenAnulado) {
                            if (oOrdenEvaluate.PedidoTipo == "PCP") {
                                oOrdenEvaluate.ordenEstado = "PAOANUL"; //ANULADO
                            } else {
                                oOrdenEvaluate.ordenEstado = "AMOANUL"; //ANULADO
                            }
                        } else {
                            if (oOrdenEvaluate.PedidoTipo == "PCP") {
                                if (bPendientePicking) {
                                    oOrdenEvaluate.ordenEstado = "PAOPEND"; //PENDIENTE
                                } else if (bNoAtendidoPicking) {
                                    oOrdenEvaluate.ordenEstado = "PAOAPAR"; //ATENDIDO PARCIAL
                                } else if (bAtendidoPicking) {
                                    oOrdenEvaluate.ordenEstado = "PAOATEN"; //ATENDIDO
                                } else {
                                    oOrdenEvaluate.ordenEstado = "PAOPICK"; //PICKING
                                }
                            } else {
                                if (bPendientePicking) {
                                    oOrdenEvaluate.ordenEstado = "AMOPEND"; //PENDIENTE
                                } else if (bNoAtendidoPicking) {
                                    oOrdenEvaluate.ordenEstado = "AMOAPAR"; //ATENDIDO PARCIAL
                                } else if (bAtendidoPicking) {
                                    oOrdenEvaluate.ordenEstado = "AMOATEN"; //ATENDIDO
                                } else {
                                    oOrdenEvaluate.ordenEstado = "AMOPICK"; //PICKING
                                }
                            }
                        }

                        var oInsumoIniPick = {};
                        var oInsumoFinPick = {};
                        oOrdenEvaluate.pickingIniUsu = null;
                        oOrdenEvaluate.pickingIniFec = null;
                        oOrdenEvaluate.pickingFinUsu = null;
                        oOrdenEvaluate.pickingFinFec = null;

                        if (aInsumoEvaluate.length) {
                            oInsumoIniPick = aInsumoEvaluate.reduce((a, b) => {
                                return new Date(a.pickingIniFec) < new Date(b.pickingIniFec)
                                    ? a
                                    : b;
                            });
                            //Obtener Fin Picking
                            oInsumoFinPick = aInsumoEvaluate.reduce((a, b) => {
                                return new Date(a.pickingFinFec) > new Date(b.pickingFinFec)
                                    ? a
                                    : b;
                            });
                        }
                        oOrdenEvaluate.pickingIniUsu = await util.getValueOrNull(
                            oInsumoIniPick.pickingIniUsu
                        );
                        oOrdenEvaluate.pickingIniFec = await util.getValueOrNull(
                            oInsumoIniPick.pickingIniFec
                        );

                        if (["PAOATEN", "AMOATEN"].includes(oOrdenEvaluate.ordenEstado)) {
                            oOrdenEvaluate.pickingFinUsu = await util.getValueOrNull(
                                oInsumoFinPick.pickingFinUsu
                            );
                            oOrdenEvaluate.pickingFinFec = await util.getValueOrNull(
                                oInsumoFinPick.pickingFinFec
                            );
                        }

                        oOrdenEvaluate.numBultoEntero = parseInt(oOrdenErp.NROBULTOSENT);
                        aOrdenEvaluate.push(oOrdenEvaluate);
                        aOrdenAll.push(oOrdenEvaluate);
                    } else {
                        if (
                            ![
                                /*Pedido Atencion*/
                                "PAOANUL", //ANULADO
                                /*Pedido Almacen*/
                                "AMOANUL", //ANULADO
                            ].includes(oOrdenBtp.ordenEstado)
                        ) {
                            aOrdenAll.push(oOrdenBtp);
                        }
                    }
                }
                /** ACTUALIZACION DE ESTADOS*/

                /*
                 * ORDEN
                 */
                var bPendiente = true;
                for (var iIndex in aOrdenEvaluate) {
                    var oOrdenUp = aOrdenEvaluate[iIndex];
                    if (
                        !(
                            oOrdenUp.ordenEstado === "PAOPEND" ||
                            oOrdenUp.ordenEstado === "AMOPEND"
                        )
                    ) {
                        //ATENDIDO:  PAOATEN, AMOATEN
                        if (
                            !(
                                oOrdenUp.ordenEstado === "PAOANUL" ||
                                oOrdenUp.ordenEstado === "AMOANUL"
                            )
                        ) {
                            bPendiente = false;
                        }
                    }

                    var oMaestra;
                    if (oOrdenUp.PedidoTipo == "PCP") {
                        oMaestra = aConstant["ESTADO_CP_ORDEN"].find(
                            (o) => o.codigo === oOrdenUp.ordenEstado
                        );
                    } else {
                        oMaestra = aConstant["ESTADO_AM_ORDEN"].find(
                            (o) => o.codigo === oOrdenUp.ordenEstado
                        );
                    }
                    console.log(
                        oOrdenUp.pedidoNumero +
                        " - " +
                        oOrdenUp.ordenNumero +
                        " - " +
                        oMaestra.iMaestraId
                    );
                    await UPDATE(ORDEN)
                        .set({
                            fechaActualiza: new Date(),
                            oEstado_iMaestraId: oMaestra.iMaestraId,
                            numBultoEntero: parseInt(oOrdenUp.numBultoEntero),
                            pickingIniUsu: oOrdenUp.pickingIniUsu,
                            pickingIniFec: oOrdenUp.pickingIniFec,
                            pickingFinUsu: oOrdenUp.pickingFinUsu,
                            pickingFinFec: oOrdenUp.pickingFinFec,
                            estadoTraslado: oOrdenUp.ordenEstadoTraslado
                                ? oOrdenUp.ordenEstadoTraslado
                                : "",
                        })
                        .where({
                            ordenId: oOrdenUp.ordenId,
                        });
                }

                /*
                 * PEDIDO
                 */
                /**
                 * Si Pedido tiene el estado Pendiente y uno de sus items ya esta en Picking
                 * Pedido pasa al estado PROCESO
                 */

                //Obtener Inicio Picking
                var oOrdenIniPick = {},
                    oOrdenFinPick = {};
                //Verificar si todas las Ordenes del Pedido estan anulados
                var bPedidoAnulado = false;
                var bPedidoPendiete = false;
                var aEstadosOrden = [
                    ...new Set(aOrdenAll.map((item) => item.ordenEstado)),
                ];
                if (
                    aEstadosOrden.length == 1 &&
                    (aEstadosOrden[0] == "PAOANUL" || aEstadosOrden[0] == "AMOANUL")
                )
                    bPedidoAnulado = true;
                if (
                    aEstadosOrden.length == 1 &&
                    (aEstadosOrden[0] == "PAOPEND" || aEstadosOrden[0] == "AMOPEND")
                )
                    bPedidoPendiete = true;

                if (
                    aEstadosOrden.length == 1 &&
                    (aEstadosOrden[0] == "PAOATEN" ||
                        aEstadosOrden[0] == "PAOAPAR" ||
                        aEstadosOrden[0] == "AMOATEN" ||
                        aEstadosOrden[0] == "AMOAPAR")
                ) {
                    console.log("------------- ORDENES ATENDIDAS -------------");
                    if (aOrdenAll.length) {
                        //Obtener Inicio Picking
                        oOrdenIniPick = aOrdenAll.reduce((a, b) => {
                            return new Date(a.pickingIniFec) < new Date(b.pickingIniFec)
                                ? a
                                : b;
                        });

                        //Obtener Fin Picking
                        oOrdenFinPick = aOrdenAll.reduce((a, b) => {
                            return new Date(a.pickingFinFec) > new Date(b.pickingFinFec)
                                ? a
                                : b;
                        });
                    }
                }

                var oMaestra;
                if (bPedidoAnulado) {
                    if (oPedidoGBtp.PedidoTipo == "PCP") {
                        oMaestra = aConstant["ESTADO_CP_PEDIDO"].find(
                            (o) => o.codigo === "PAPANUL" // ANULADO
                        );
                    } else {
                        oMaestra = aConstant["ESTADO_AM_PEDIDO"].find(
                            (o) => o.codigo === "AMPANUL" // ANULADO
                        );
                    }
                } else {
                    if (bPedidoPendiete) {
                        if (oPedidoGBtp.PedidoTipo == "PCP") {
                            oMaestra = aConstant["ESTADO_CP_PEDIDO"].find(
                                (o) => o.codigo === "PAPPEND" // PENDIENTE: PAPPEND
                            );
                        } else {
                            oMaestra = aConstant["ESTADO_AM_PEDIDO"].find(
                                (o) => o.codigo === "AMPPEND" // PENDIENTE: AMPPEND
                            );
                        }
                    } else {
                        if (oPedidoGBtp.PedidoTipo == "PCP") {
                            oMaestra = aConstant["ESTADO_CP_PEDIDO"].find(
                                (o) => o.codigo === "PAPPROC" // PROCESO: PAPPROC
                            );
                        } else {
                            oMaestra = aConstant["ESTADO_AM_PEDIDO"].find(
                                (o) => o.codigo === "AMPPROC" // PROCESO: PAPPROC
                            );
                        }
                    }
                }

                console.log(oPedidoGBtp.pedidoNumero + " - " + oMaestra.iMaestraId);
                await UPDATE(PEDIDO)
                    .set({
                        fechaActualiza: new Date(),
                        oEstado_iMaestraId: oMaestra.iMaestraId, // PROCESO: PAPPROC
                        pickingUsuInic: await util.getValueOrNull(
                            oOrdenIniPick.pickingIniUsu
                        ),
                        pickingFecInic: await util.getValueOrNull(
                            oOrdenIniPick.pickingIniFec
                        ),
                        pickingUsuFin: await util.getValueOrNull(
                            oOrdenFinPick.pickingFinUsu
                        ),
                        pickingFecFin: await util.getValueOrNull(
                            oOrdenFinPick.pickingFinFec
                        ),
                    })
                    .where({
                        pedidoId: oPedidoGBtp.pedidoId,
                    });
                console.log("----------------------");
            }
        }
    }

    function _mergePedido(aDataBtp, aDataErp, aConstant) {
        var aPedidoGroupBtp = _formatDataBtp(aDataBtp);
        var aPedidoGroupErp = _formatDataErp2(aDataErp);

        var aPedidoMerge = [];
        //--------------- PEDIDO
        for (var kPed in aPedidoGroupBtp) {
            var oPedidoBtp = aPedidoGroupBtp[kPed];
            var oPedidoErp = aPedidoGroupErp[kPed];

            if (oPedidoErp) {
                /** PEDIDOS QUE TENGAN RELACION CON LA ERP */

                var oEstado = {};
                if (oPedidoBtp.PedidoTipo == "PCP") {
                    oEstado = {
                        sMaestraGroup: "CP",
                        oPedido: {
                            pendiente: "PAPPEND",
                            proceso: "PAPPROC",
                            anulado: "PAPANUL",
                        },
                        oOrden: {
                            pendiente: "PAOPEND",
                            picking: "PAOPICK",
                            atendido: "PAOATEN",
                            atendidoParcial: "PAOAPAR",
                            anulado: "PAOANUL",
                            includeCheck: ["PAOPEND", "PAOPICK", "PAOATEN", "PAOAPAR"],
                        },
                        oInsumo: {
                            pendientePick: "PAIPEPI",
                            enPick: "PAIENPI",
                            atendidoPick: "PAIATPI",
                            noAtendidoPick: "PAINAPI",
                            anulado: "PAIANUL",
                        },
                    };
                } else {
                    oEstado = {
                        sMaestraGroup: "AM",
                        oPedido: {
                            pendiente: "AMPPEND",
                            proceso: "AMPPROC",
                            anulado: "AMPANUL",
                        },
                        oOrden: {
                            pendiente: "AMOPEND",
                            picking: "AMOPICK",
                            atendido: "AMOATEN",
                            atendidoParcial: "AMOAPAR",
                            anulado: "AMOANUL",
                            includeCheck: ["AMOPEND", "AMOPICK", "AMOATEN", "AMOAPAR"],
                        },
                        oInsumo: {
                            pendientePick: "AMIPEPI",
                            enPick: "AMIENPI",
                            atendidoPick: "AMIATPI",
                            noAtendidoPick: "AMINAPI",
                            anulado: "AMIANUL",
                        },
                    };
                }

                var aOrdenBtp = oPedidoBtp.aOrden;
                var aOrdenErp = null;
                if (oPedidoErp) {
                    aOrdenErp = oPedidoErp.aOrden;

                    //--------------- ORDEN
                    for (var kOrd in aOrdenBtp) {
                        var oOrdenBtp = aOrdenBtp[kOrd];
                        if (oEstado.oOrden.includeCheck.includes(oOrdenBtp.ordenEstado)) {
                            oOrdenBtp.ordenEstado = oEstado.oOrden.pendiente;

                            var oOrdenErp = aOrdenErp.find(
                                (o) => o.ordenNumero === oOrdenBtp.ordenNumero
                            );

                            var aInsumoBtp = oOrdenBtp.aInsumo;
                            var aInsumoErp = oOrdenErp.aInsumo;

                            if (aInsumoErp.length) {
                                //--------------- INSUMO
                                for (var kIns in aInsumoBtp) {
                                    var oInsumoBtp = aInsumoBtp[kIns];
                                    var oInsumoErp = aInsumoErp.find(
                                        (o) =>
                                            o.insumoCodigo === oInsumoBtp.insumoCodigo &&
                                            o.insumoLote === oInsumoBtp.insumoLote &&
                                            o.insumoIdPos === oInsumoBtp.insumoIdPos
                                    );

                                    if (oInsumoErp) {
                                        oInsumoBtp.insumoEstadoTraslado =
                                            oInsumoErp.insumoEstadoTraslado;
                                        oInsumoBtp.numBultoEntero = oInsumoErp.numBultoEntero;
                                        oInsumoBtp.cantAtendida = oInsumoErp.cantAtendida;

                                        if (
                                            oInsumoErp.statusAtencion.includes("PENDIENTE PICKING")
                                        ) {
                                            oInsumoBtp.insumoEstado = oEstado.oInsumo.pendientePick;
                                        } else if (
                                            oInsumoErp.statusAtencion.includes("EN PICKING")
                                        ) {
                                            oInsumoBtp.insumoEstado = oEstado.oInsumo.enPick;
                                            oInsumoBtp.pickingIniUsu = oInsumoErp.pickingIniUsu;
                                            oInsumoBtp.pickingIniFec = oInsumoErp.pickingIniFec;
                                        } else if (
                                            oInsumoErp.statusAtencion.includes("ATENDIDO PICKING")
                                        ) {
                                            oInsumoBtp.insumoEstado = oEstado.oInsumo.atendidoPick;
                                            oInsumoBtp.pickingIniUsu = oInsumoErp.pickingIniUsu;
                                            oInsumoBtp.pickingIniFec = oInsumoErp.pickingIniFec;
                                            oInsumoBtp.pickingFinUsu = oInsumoErp.pickingFinUsu;
                                            oInsumoBtp.pickingFinFec = oInsumoErp.pickingFinFec;
                                        } else {
                                        }
                                    }
                                }

                                oOrdenBtp.ordenEstadoTraslado = oOrdenErp.ordenEstadoTraslado;
                                oOrdenBtp.numBultoEntero = oOrdenErp.numBultoEntero;
                                oOrdenBtp.pickingIniUsu = oOrdenErp.pickingIniUsu;
                                oOrdenBtp.pickingIniFec = oOrdenErp.pickingIniFec;
                                oOrdenBtp.pickingFinUsu = oOrdenErp.pickingFinUsu;
                                oOrdenBtp.pickingFinFec = oOrdenErp.pickingFinFec;
                            } else {
                                oOrdenBtp.ordenEstadoTraslado = "";
                                oOrdenBtp.ordenEstado = oEstado.oOrden.pendiente;
                                oOrdenBtp.numBultoEntero = 0;
                                oOrdenBtp.pickingIniUsu = null;
                                oOrdenBtp.pickingIniFec = null;
                                oOrdenBtp.pickingFinUsu = null;
                                oOrdenBtp.pickingFinFec = null;
                            }
                        } else {
                            /**
                             * EVALUAR OTROS ESTADOS (FRACCIONAMIENTO)
                             *
                             */
                            continue;
                        }

                        var aEstadosInsumo = [
                            ...new Set(oOrdenBtp.aInsumo.map((item) => item.insumoEstado)),
                        ];
                        aEstadosInsumo = aEstadosInsumo.filter(function (e) {
                            return e !== oEstado.oInsumo.anulado;
                        });

                        if (aEstadosInsumo.length == 0) {
                            //Verificar si todos los insumos estan ANULADO
                            oOrdenBtp.ordenEstado = oEstado.oOrden.anulado;
                        }

                        if (
                            aEstadosInsumo.length == 1 &&
                            aEstadosInsumo[0] == oEstado.oInsumo.pendientePick
                        ) {
                            oOrdenBtp.ordenEstado = oEstado.oOrden.pendiente;
                        } else {
                            if (
                                aEstadosInsumo.includes(oEstado.oInsumo.enPick) ||
                                aEstadosInsumo.includes(oEstado.oInsumo.pendientePick)
                            ) {
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: EN PICKING */
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: PENDIENTE PICKING */
                                oOrdenBtp.ordenEstado = oEstado.oOrden.picking;
                                oOrdenBtp.pickingFinUsu = null;
                                oOrdenBtp.pickingFinFec = null;
                            } else if (
                                aEstadosInsumo.length == 1 &&
                                aEstadosInsumo.includes(oEstado.oInsumo.noAtendidoPick)
                            ) {
                                /** SI TODOS SUS INSUMOS TIENE EL ESTADO: NO ATENDIDO PICKING */
                                oOrdenBtp.ordenEstado = oEstado.oOrden.atendidoParcial;
                            } else if (
                                aEstadosInsumo.length == 1 &&
                                aEstadosInsumo.includes(oEstado.oInsumo.atendidoPick)
                            ) {
                                /** SI TODOS SUS INSUMOS TIENE EL ESTADO: ATENDIDO PICKING */
                                oOrdenBtp.ordenEstado = oEstado.oOrden.atendido;
                            } else if (
                                aEstadosInsumo.length == 2 &&
                                aEstadosInsumo.includes(oEstado.oInsumo.atendidoPick) &&
                                aEstadosInsumo.includes(oEstado.oInsumo.noAtendidoPick)
                            ) {
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: NO ATENDIDO PICKING */
                                /** SI ALGUNO DE SUS INSUMOS TIENE EL ESTADO: ATENDIDO PICKING */
                                oOrdenBtp.ordenEstado = oEstado.oOrden.atendidoParcial;
                            } else {
                            }
                        }
                    }
                } else {
                    //console.log("NO ORDEN: " + oPedidoBtp.pedidoNumero);
                }

                var oIniPick = null,
                    oFinPick = null;
                if (aOrdenBtp.length) {
                    var aFilterOrden = aOrdenBtp.filter(function (e) {
                        return e.ordenEstado !== oEstado.oOrden.anulado;
                    });

                    var aFilterOrdenTemp = [];
                    for (var key in aOrdenBtp) {
                        var a = aOrdenBtp[key];
                        var oErpFind = aOrdenErp.find(
                            (o) => o.ordenNumero === a.ordenNumero
                        );

                        if (oErpFind) {
                            //a.pickingIniUsu = oErpFind.pickingIniUsu;
                            //a.pickingIniFec = oErpFind.pickingIniFec;
                            //a.pickingFinUsu = oErpFind.pickingFinUsu;
                            //a.pickingFinFec = oErpFind.pickingFinFec;
                            aFilterOrdenTemp.push(oErpFind);
                        }
                    }

                    aFilterOrden = aFilterOrdenTemp;

                    //Obtener Inicio Picking
                    var aFilterIni = aFilterOrden.filter(function (e) {
                        return e.pickingIniFec != null;
                    });

                    if (aFilterIni && aFilterIni.length) {
                        oIniPick = aFilterIni.reduce((a, b) => {
                            return new Date(a.pickingIniFec) < new Date(b.pickingIniFec)
                                ? a
                                : b;
                        });
                    }

                    var aFilterNoPick = aFilterOrden.filter(function (e) {
                        return e.pickingFinUsu == null;
                    });
                    if (aFilterNoPick && aFilterNoPick.length) {
                        //Si existe ordenes sin picking final no obtener fin picking para Pedido.
                    } else {
                        //Obtener Fin Picking
                        var aFilterFin = aFilterOrden.filter(function (e) {
                            return e.pickingFinUsu != null;
                        });

                        if (aFilterFin && aFilterFin) {
                            oFinPick = aFilterFin.reduce((a, b) => {
                                return new Date(a.pickingFinFec) > new Date(b.pickingFinFec)
                                    ? a
                                    : b;
                            });
                        }
                    }
                }

                var aEstadosOrden = [
                    ...new Set(aOrdenBtp.map((item) => item.ordenEstado)),
                ];
                aEstadosOrden = aEstadosOrden.filter(function (e) {
                    return e !== oEstado.oOrden.anulado;
                });

                if (aEstadosOrden.length == 0) {
                    oPedidoBtp.pedidoEstado = oEstado.oPedido.anulado;
                } else {
                    oPedidoBtp.pedidoEstado = oEstado.oPedido.proceso;
                    if (
                        aEstadosOrden.includes(oEstado.oOrden.pendiente) ||
                        aEstadosOrden.includes(oEstado.oOrden.picking)
                    ) {
                        if (oIniPick) {
                            oPedidoBtp.pickingIniUsu = oIniPick.pickingIniUsu;
                            oPedidoBtp.pickingIniFec = oIniPick.pickingIniFec;
                        }
                        oPedidoBtp.pickingFinUsu = null;
                        oPedidoBtp.pickingFinFec = null;
                    } else {
                        if (oIniPick) {
                            oPedidoBtp.pickingIniUsu = oIniPick.pickingIniUsu;
                            oPedidoBtp.pickingIniFec = oIniPick.pickingIniFec;
                        }
                        if (oFinPick) {
                            oPedidoBtp.pickingFinUsu = oFinPick.pickingFinUsu;
                            oPedidoBtp.pickingFinFec = oFinPick.pickingFinFec;
                        }
                    }

                    if (aEstadosOrden.length == 1) {
                        if ([oEstado.oOrden.pendiente].includes(aEstadosOrden[0])) {
                            oPedidoBtp.pedidoEstado = oEstado.oPedido.pendiente;
                            oPedidoBtp.pickingIniUsu = null;
                            oPedidoBtp.pickingIniFec = null;
                            oPedidoBtp.pickingFinUsu = null;
                            oPedidoBtp.pickingFinFec = null;
                        }

                        if (aEstadosOrden.includes(oEstado.oOrden.picking)) {
                            if (oIniPick) {
                                oPedidoBtp.pickingIniUsu = oIniPick.pickingIniUsu;
                                oPedidoBtp.pickingIniFec = oIniPick.pickingIniFec;
                            }
                            oPedidoBtp.pickingFinUsu = null;
                            oPedidoBtp.pickingFinFec = null;
                        }
                    }
                }

                aPedidoMerge.push(oPedidoBtp);
            }
        }

        return aPedidoMerge;
    }

    function _formatDataErp2(aDataErp) {
        var aPedido = aDataErp.reduce(function (r, a) {
            var sKey = a.PedidoNumero;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
        }, Object.create(null));

        if (!aPedido) aPedido = [];
        for (var kPed in aPedido) {
            var oPedido = {};
            var aPItem = aPedido[kPed];
            var aOrdenGroupErp = aPItem.reduce(function (r, a) {
                var sKey = a.OrdenNumero;
                r[sKey] = r[sKey] || [];
                r[sKey].push(a);
                return r;
            }, Object.create(null));
            var oPItem = aPItem[0];
            oPedido.pedidoNumero = oPItem.PedidoNumero;
            oPedido.pedidoId = null;
            oPedido.pedidoEstado = oPItem.PedidoEstado;
            oPedido.PedidoTipo = oPItem.PedidoTipo;

            var aOrden = [];
            for (var kOrd in aOrdenGroupErp) {
                var oOrden = {};
                var aOItem = aOrdenGroupErp[kOrd];
                var oOItem = aOItem[0];
                oOrden.ordenId = null;
                oOrden.ordenNumero = oOItem.OrdenNumero;
                oOrden.ordenCodProd = oOItem.OrdenCodigo;
                oOrden.ordenLote = oOItem.OrdenLote;
                oOrden.ordenEstado = oOItem.OrdenEstado;
                oOrden.pickingIniUsu = null;
                oOrden.pickingIniFec = null;
                oOrden.pickingFinUsu = null;
                oOrden.pickingFinFec = null;
                oOrden.ordenEstadoTraslado = "";

                var aInsumoGroupErp = aOItem.reduce(function (r, a) {
                    var idPos = a.InsumoIdPos ? parseInt(a.InsumoIdPos) : 1;
                    var sKey = [a.InsumoCodigo, a.InsumoLote, idPos].join("-");
                    r[sKey] = r[sKey] || [];
                    r[sKey].push(a);
                    return r;
                }, Object.create(null));

                var numBultoEntero = 0;
                var aInsumo = [];
                for (var kIns in aInsumoGroupErp) {
                    var oInsumo = {};
                    var aIItem = aInsumoGroupErp[kIns];
                    var oIItem = aIItem[0];
                    var idPos = oIItem.InsumoIdPos ? parseInt(oIItem.InsumoIdPos) : 1;
                    oInsumo.ordenDetalleId = null;
                    oInsumo.insumoEstado = oIItem.InsumoEstado;
                    oInsumo.insumoCodigo = oIItem.InsumoCodigo;
                    oInsumo.insumoLote = oIItem.InsumoLote;
                    oInsumo.insumoIdPos = idPos;
                    oInsumo.insumoUmb = oIItem.InsumoUmb;
                    oInsumo.pickingIniUsu = oIItem.PickingIniUsuario;
                    oInsumo.pickingIniFec = null;
                    oInsumo.pickingFinUsu = oIItem.PickingFinUsuario;
                    oInsumo.pickingFinFec = null;
                    oInsumo.insumoEstadoTraslado = oIItem.InsumoEstadoTraslado;

                    if (
                        !oIItem.PickingIniFecha ||
                        oIItem.PickingIniFecha.includes("0000-00-00")
                    ) {
                    } else {
                        oInsumo.pickingIniFec = _addHoursToDate(
                            new Date(oIItem.PickingIniFecha),
                            5
                        );
                    }

                    if (
                        !oIItem.PickingFinFecha ||
                        oIItem.PickingFinFecha.includes("0000-00-00")
                    ) {
                    } else {
                        oInsumo.pickingFinFec = _addHoursToDate(
                            new Date(oIItem.PickingFinFecha),
                            5
                        );
                    }

                    var cantAtendida = +oIItem.CantAtendidaEntero,
                        cantAtendidaFrac = +oIItem.CantAtendidaFracc,
                        cantAtendidaIfa = +oIItem.CantAtendidaIfa,
                        cantAtendidaOtro = 0;

                    oInsumo.numBultoEntero = +oIItem.NumBultoEntero;
                    oInsumo.statusAtencion = oIItem.InsumoEstadoAten;
                    oInsumo.cantPedida = +oIItem.CantPedida;
                    oInsumo.cantAtendida = cantAtendida;
                    oInsumo.cantAtendidaFrac = cantAtendidaFrac; //Cantidad atendida con Saldo
                    oInsumo.cantAtendidaIfa = cantAtendidaIfa;
                    oInsumo.cantAtendidaTotal =
                        cantAtendida + cantAtendidaFrac + cantAtendidaOtro;

                    numBultoEntero = numBultoEntero + oInsumo.numBultoEntero;
                    aInsumo.push(oInsumo);
                }

                if (aInsumo.length) {
                    var aInsumoFilter = aInsumo.filter(function (e) {
                        return e.insumoEstado != "ANULADO";
                    });
                    /** ESTADOS TRASLADO INSUMO */
                    var aEstadosTraslado = [
                        ...new Set(aInsumoFilter.map((item) => item.insumoEstadoTraslado)),
                    ];
                    oOrden.ordenEstadoTraslado = aEstadosTraslado.join(",");

                    var aFilterIni = aInsumoFilter.filter(function (e) {
                        return e.pickingIniFec != null;
                    });
                    var aFilterFin = aInsumoFilter.filter(function (e) {
                        return e.pickingFinFec != null;
                    });

                    //Obtener Inicio Picking
                    var oIniPick = null;
                    if (aFilterIni && aFilterIni.length) {
                        oIniPick = aFilterIni.reduce((a, b) => {
                            return new Date(a.pickingIniFec) < new Date(b.pickingIniFec)
                                ? a
                                : b;
                        });
                    }

                    //Obtener Fin Picking
                    var oFinPick = null;
                    if (aFilterFin && aFilterFin.length) {
                        oFinPick = aFilterFin.reduce((a, b) => {
                            return new Date(a.pickingFinFec) > new Date(b.pickingFinFec)
                                ? a
                                : b;
                        });
                    }

                    if (oIniPick) {
                        oOrden.pickingIniUsu = oIniPick.pickingIniUsu;
                        oOrden.pickingIniFec = oIniPick.pickingIniFec;
                    }

                    if (oFinPick) {
                        oOrden.pickingFinUsu = oFinPick.pickingFinUsu;
                        oOrden.pickingFinFec = oFinPick.pickingFinFec;
                    }
                }

                oOrden.numBultoEntero = numBultoEntero;
                oOrden.aInsumo = aInsumo;
                aOrden.push(oOrden);
            }
            oPedido.aOrden = aOrden;
            aPedido[kPed] = oPedido;
            //aFormatResp.push(oPedido);
        }
        return aPedido;
    }

    function _formatDataErp(aDataErp) {
        var aPedido = aDataErp.reduce(function (r, a) {
            var sKey = a.PEDIDO;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
        }, Object.create(null));

        if (!aPedido) aPedido = [];
        for (var kPed in aPedido) {
            var oPedido = {};
            var aPItem = aPedido[kPed];
            var aOrdenGroupErp = aPItem.reduce(function (r, a) {
                var sKey = a.ORDEN;
                r[sKey] = r[sKey] || [];
                r[sKey].push(a);
                return r;
            }, Object.create(null));
            var oPItem = aPItem[0];
            oPedido.pedidoNumero = oPItem.PEDIDO;
            oPedido.pedidoId = null;
            oPedido.pedidoEstado = null;
            oPedido.PedidoTipo = null;

            var aOrden = [];
            for (var kOrd in aOrdenGroupErp) {
                var oOrden = {};
                var aOItem = aOrdenGroupErp[kOrd];
                var oOItem = aOItem[0];
                oOrden.ordenId = null;
                oOrden.ordenNumero = oOItem.ORDEN;
                oOrden.ordenCodProd = oOItem.CODPRODTERM;
                oOrden.ordenLote = oOItem.LOTEPT;
                oOrden.ordenEstado = null;
                oOrden.pickingIniUsu = null;
                oOrden.pickingIniFec = null;
                oOrden.pickingFinUsu = null;
                oOrden.pickingFinFec = null;

                var aInsumoGroupErp = aOItem.reduce(function (r, a) {
                    var idPos = a.IDPOS ? parseInt(a.IDPOS) : 1;
                    var sKey = [a.CODIGOINSUMO, a.LOTE, idPos].join("-");
                    r[sKey] = r[sKey] || [];
                    r[sKey].push(a);
                    return r;
                }, Object.create(null));

                var numBultoEntero = 0;
                var aInsumo = [];
                for (var kIns in aInsumoGroupErp) {
                    var oInsumo = {};
                    var aIItem = aInsumoGroupErp[kIns];
                    var oIItem = aIItem[0];
                    var idPos = oIItem.IDPOS ? parseInt(oIItem.IDPOS) : 1;
                    oInsumo.ordenDetalleId = null;
                    oInsumo.insumoEstado = oIItem.STATUSITEM;
                    oInsumo.insumoCodigo = oIItem.CODIGOINSUMO;
                    oInsumo.insumoLote = oIItem.LOTE;
                    oInsumo.insumoIdPos = idPos;
                    oInsumo.insumoUmb = oIItem.UNIDADM;
                    oInsumo.pickingIniUsu = oIItem.USUARIOINICPICK;
                    oInsumo.pickingIniFec = null;
                    oInsumo.pickingFinUsu = oIItem.USUARIOFINPICK;
                    oInsumo.pickingFinFec = null;

                    if (!oIItem.FECHAINICPICK || oIItem.FECHAINICPICK == "0000-00-00") {
                    } else {
                        oInsumo.pickingIniFec = _addHoursToDate(
                            new Date(oIItem.FECHAINICPICK + " " + oIItem.HORAINICPICK),
                            5
                        );
                    }

                    if (!oIItem.FECHAFINPICK || oIItem.FECHAFINPICK == "0000-00-00") {
                    } else {
                        oInsumo.pickingFinFec = _addHoursToDate(
                            new Date(oIItem.FECHAFINPICK + " " + oIItem.HORAFINPICK),
                            5
                        );
                    }

                    var cantAtendida = +oIItem.CANTATENENT,
                        cantAtendidaFrac = 0,
                        cantAtendidaSal = 0,
                        cantAtendidaOtro = 0;

                    oInsumo.numBultoEntero = +oIItem.NROBULTOSENT;
                    oInsumo.statusAtencion = oIItem.STATUSATEN;
                    oInsumo.cantPedida = +oIItem.CANTIDADR;
                    oInsumo.cantAtendida = cantAtendida;
                    oInsumo.cantAtendidaFrac = cantAtendidaFrac; //Cantidad atendida con Saldo
                    oInsumo.cantAtendidaSal = cantAtendidaSal;
                    oInsumo.cantAtendidaTotal =
                        cantAtendida + cantAtendidaFrac + cantAtendidaOtro;

                    numBultoEntero = numBultoEntero + oInsumo.numBultoEntero;
                    aInsumo.push(oInsumo);
                }

                if (aInsumo.length) {
                    //Obtener Inicio Picking
                    var oIniPick = aInsumo.reduce((a, b) => {
                        return new Date(a.pickingIniFec) < new Date(b.pickingIniFec)
                            ? a
                            : b;
                    });

                    //Obtener Fin Picking
                    var oFinPick = aInsumo.reduce((a, b) => {
                        return new Date(a.pickingFinFec) > new Date(b.pickingFinFec)
                            ? a
                            : b;
                    });

                    if (oIniPick) {
                        oOrden.pickingIniUsu = oFinPick.pickingIniUsu;
                        oOrden.pickingIniFec = oFinPick.pickingIniFec;
                    }

                    if (oFinPick) {
                        oOrden.pickingFinUsu = oFinPick.pickingFinUsu;
                        oOrden.pickingFinFec = oFinPick.pickingFinFec;
                    }
                }

                oOrden.numBultoEntero = numBultoEntero;
                oOrden.aInsumo = aInsumo;
                aOrden.push(oOrden);
            }
            oPedido.aOrden = aOrden;
            aPedido[kPed] = oPedido;
            //aFormatResp.push(oPedido);
        }
        return aPedido;
    }

    function _formatDataAtendidoErp(aDataErp) {
        var aPedido = aDataErp.reduce(function (r, a) {
            var sKey = a.Pedido;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
        }, Object.create(null));

        if (!aPedido) aPedido = [];
        for (var kPed in aPedido) {
            var oPedido = {};
            var aPItem = aPedido[kPed];
            var aOrdenGroupErp = aPItem.reduce(function (r, a) {
                var sKey = a.Orden;
                r[sKey] = r[sKey] || [];
                r[sKey].push(a);
                return r;
            }, Object.create(null));
            var oPItem = aPItem[0];
            oPedido.pedidoNumero = oPItem.Pedido;
            oPedido.pedidoId = null;
            oPedido.pedidoEstado = null;
            oPedido.PedidoTipo = null;

            var aOrden = [];
            for (var kOrd in aOrdenGroupErp) {
                var oOrden = {};
                var aOItem = aOrdenGroupErp[kOrd];
                var oOItem = aOItem[0];
                oOrden.ordenId = null;
                oOrden.ordenNumero = oOItem.Orden;
                oOrden.ordenLote = null;
                oOrden.ordenEstado = null;
                oOrden.pickingIniUsu = null;
                oOrden.pickingIniFec = null;
                oOrden.pickingFinUsu = null;
                oOrden.pickingFinFec = null;

                var aInsumoGroupErp = aOItem.reduce(function (r, a) {
                    var idPos = a.IdPos ? parseInt(a.IdPos) : 1;
                    var sKey = [a.CodigoInsumo, a.Lote, idPos].join("-");
                    r[sKey] = r[sKey] || [];
                    r[sKey].push(a);
                    return r;
                }, Object.create(null));

                var aInsumo = [];
                for (var kIns in aInsumoGroupErp) {
                    var oInsumo = {};
                    var aIItem = aInsumoGroupErp[kIns];
                    var oIItem = aIItem[0];
                    var idPos = oIItem.IdPos ? parseInt(oIItem.IdPos) : 1;
                    oInsumo.ordenDetalleId = null;
                    oInsumo.insumoEstado = null;
                    oInsumo.insumoCodigo = oIItem.CodigoInsumo;
                    oInsumo.insumoLote = oIItem.Lote;
                    oInsumo.insumoIdPos = idPos;
                    oInsumo.insumoUmb = oIItem.UnidadM;

                    var cantAtendida = 0,
                        cantAtendidaFrac = 0,
                        cantAtendidaSal = 0,
                        cantAtendidaOtro = 0;

                    var aBulto = [];
                    for (var kBul in aIItem) {
                        var oBulto = {};
                        var oBItem = aIItem[kBul];
                        oBulto.IdBulto = oBItem.IdBulto;
                        oBulto.Tipo = oBItem.Tipo;
                        oBulto.NroItem = oBItem.NroItem;
                        oBulto.CantidadA = oBItem.CantidadA;
                        oBulto.Tara = oBItem.Tara;
                        oBulto.Bruto = +oBItem.CantidadA + +oBItem.Tara;
                        oBulto.UnidadM = oBItem.UnidadM;
                        oBulto.Almacen = oBItem.Almacen;
                        oBulto.UsuarioAte = oBItem.UsuarioAte;
                        oBulto.FechaAte =
                            _formatDateUnit(oBItem.FechaAte) + "T00:00:00.0000000"; //2022-04-27T00:00:00.0000000
                        oBulto.HoraAte = _formatTimeUnit(oBItem.HoraAte);
                        oBulto.FechaHoraAte = _addHoursToDate(
                            new Date(oBulto.FechaAte + " " + oBulto.HoraAte),
                            5
                        );
                        oBulto.FechaHoraAtePick = null;
                        oBulto.FechaHoraAteFrac = null;
                        oBulto.Status = oBItem.Status;
                        oBulto.NroItem = oBItem.NroItem;
                        oBulto.Etiqueta = oBItem.Etiqueta;
                        oBulto.Impresion = oBItem.Impresion;
                        oBulto.Reimpresion = oBItem.Reimpresion;
                        oBulto.DocMat = oBItem.DocMat;
                        oBulto.scanCode = [
                            oBulto.IdBulto,
                            oInsumo.insumoCodigo,
                            oInsumo.insumoLote,
                        ].join("$"); //BULTO (UNIDAD MANIPULACION) $ MATERIAL $ LOTE

                        if (oBItem.Tipo == "ENTERO") {
                            oBulto.FechaHoraAtePick = oBulto.FechaHoraAte;
                            cantAtendida = cantAtendida + +oBulto.CantidadA;
                        } else if (oBItem.Tipo == "SALDO") {
                            oBulto.FechaHoraAtePick = oBulto.FechaHoraAte;
                            cantAtendidaSal = cantAtendidaSal + +oBulto.CantidadA;
                        } else if (oBItem.Tipo == "FRACCION") {
                            oBulto.FechaHoraAteFrac = oBulto.FechaHoraAte;
                            cantAtendidaFrac = cantAtendidaFrac + +oBulto.CantidadA;
                        } else {
                            cantAtendidaOtro = cantAtendidaOtro + +oBulto.CantidadA;
                        }

                        aBulto.push(oBulto);
                    }

                    var sAllStatus = [...new Set(aBulto.map((o) => o.Status))].join(",");
                    oInsumo.statusAtencion = sAllStatus;
                    oInsumo.cantAtendida = cantAtendida;
                    oInsumo.cantAtendidaFrac = cantAtendidaFrac; //Cantidad atendida con Saldo
                    oInsumo.cantAtendidaSal = cantAtendidaSal;
                    oInsumo.cantAtendidaTotal =
                        cantAtendida + cantAtendidaFrac + cantAtendidaOtro;

                    //Obtener Inicio Picking
                    var oIniPick = aBulto.reduce((a, b) => {
                        return new Date(a.FechaHoraAtePick) < new Date(b.FechaHoraAtePick)
                            ? a
                            : b;
                    });

                    //Obtener Fin Picking
                    var oFinPick = aBulto.reduce((a, b) => {
                        return new Date(a.FechaHoraAtePick) > new Date(b.FechaHoraAtePick)
                            ? a
                            : b;
                    });

                    oInsumo.pickingIniUsu = oIniPick.UsuarioAte;
                    oInsumo.pickingIniFec = oIniPick.FechaHoraAte;
                    oInsumo.pickingFinUsu = oFinPick.UsuarioAte;
                    oInsumo.pickingFinFec = oFinPick.FechaHoraAte;

                    oInsumo.aBulto = aBulto;
                    aInsumo.push(oInsumo);
                }

                oOrden.aInsumo = aInsumo;
                aOrden.push(oOrden);
            }
            oPedido.aOrden = aOrden;
            aPedido[kPed] = oPedido;
            //aFormatResp.push(oPedido);
        }
        return aPedido;
    }

    function _formatDataBtp(aDataBtp) {
        var aPedido = aDataBtp.reduce(function (r, a) {
            var sKey = a.pedidoNumero;
            r[sKey] = r[sKey] || [];
            r[sKey].push(a);
            return r;
        }, Object.create(null));

        if (!aPedido) aPedido = [];
        for (var kPed in aPedido) {
            var oPedido = {};
            var aPItem = aPedido[kPed];
            var aOrdenGroupBtp = aPItem.reduce(function (r, a) {
                var sKey = a.ordenNumero;
                r[sKey] = r[sKey] || [];
                r[sKey].push(a);
                return r;
            }, Object.create(null));
            var oPItem = aPItem[0];
            oPedido.pedidoId = oPItem.pedidoId;
            oPedido.pedidoNumero = oPItem.pedidoNumero;
            oPedido.pedidoEstado = oPItem.pedidoEstado;
            oPedido.PedidoTipo = oPItem.PedidoTipo;

            var aOrden = [];
            for (var kOrd in aOrdenGroupBtp) {
                var oOrden = {};
                var aOItem = aOrdenGroupBtp[kOrd];
                var oOItem = aOItem[0];
                if (
                    !(
                        oOItem.ordenEstado === "PAOANUL" || oOItem.ordenEstado === "AMOANUL"
                    )
                ) {
                    //Obtener Orden que no esten anulados

                    oOrden.ordenId = oOItem.ordenId;
                    oOrden.ordenNumero = oOItem.ordenNumero;
                    oOrden.ordenLote = oOItem.ordenLote;
                    oOrden.ordenEstado = oOItem.ordenEstado;
                    oOrden.pickingIniUsu = oOItem.pickingIniUsu;
                    oOrden.pickingIniFec = oOItem.pickingIniFec;
                    oOrden.pickingFinUsu = oOItem.pickingFinUsu;
                    oOrden.pickingFinFec = oOItem.pickingFinFec;
                    oOrden.ordenTraslado = oOItem.ordenEstadoTraslado;

                    var aInsumoGroupBtp = aOItem.reduce(function (r, a) {
                        var sKey = [a.insumoCodigo, a.insumoLote, a.insumoIdPos].join("-");
                        r[sKey] = r[sKey] || [];
                        r[sKey].push(a);
                        return r;
                    }, Object.create(null));

                    var aInsumo = [];
                    for (var kIns in aInsumoGroupBtp) {
                        var oInsumo = {};
                        var aIItem = aInsumoGroupBtp[kIns];
                        var oIItem = aIItem[0];
                        if (
                            !(
                                oIItem.insumoEstado === "PAIANUL" ||
                                oIItem.insumoEstado === "AMIANUL"
                            )
                        ) {
                            //Obtener Insumo que no esten anulados
                            var idPos = oIItem.insumoIdPos ? parseInt(oIItem.insumoIdPos) : 1;
                            oInsumo.insumoTraslado = oIItem.insumoEstadoTraslado;
                            oInsumo.ordenDetalleId = oIItem.ordenDetalleId;
                            oInsumo.insumoEstado = oIItem.insumoEstado;
                            oInsumo.insumoCodigo = oIItem.insumoCodigo;
                            oInsumo.insumoLote = oIItem.insumoLote;
                            oInsumo.insumoIdPos = idPos;
                            oInsumo.cantPedida = oIItem.cantPedida;
                            oInsumo.numBultoEntero = 0;
                            oInsumo.cantAtendida = oIItem.cantAtendida;
                            oInsumo.cantAtendidaFrac = oIItem.cantAtendidaFrac
                                ? oIItem.cantAtendidaFrac
                                : 0; //Cantidad atendida con Saldo
                            oInsumo.cantAtendidaIfa = 0;
                            oInsumo.cantAtendidaTotal =
                                oInsumo.cantAtendida + oInsumo.cantAtendidaFrac;
                            oInsumo.insumoUmb = oIItem.insumoUmb;
                            aInsumo.push(oInsumo);
                        }
                    }

                    oOrden.aInsumo = aInsumo;
                    aOrden.push(oOrden);
                }
            }
            oPedido.aOrden = aOrden;
            aPedido[kPed] = oPedido;
            //aFormatResp.push(oPedido);
        }
        return aPedido;
    }

    function _onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function _formatTimeUnit(input) {
        var hours = _getTimeUnit(input, "H");
        var minutes = _getTimeUnit(input, "M");
        var seconds = _getTimeUnit(input, "S");
        return [hours, minutes, seconds].join(":");
    }
    function _formatTimeISO(input) {
        var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
        var hours = 0,
            minutes = 0,
            seconds = 0,
            totalseconds;

        if (reptms.test(input)) {
            var matches = reptms.exec(input);
            if (matches[1]) hours = Number(matches[1]);
            if (matches[2]) minutes = Number(matches[2]);
            if (matches[3]) seconds = Number(matches[3]);

            return [hours, minutes, seconds].join(":");
            //totalseconds = hours * 3600  + minutes * 60 + seconds;
            //return totalseconds;
        }
    }

    function _getTimeUnit(input, unit) {
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
    }

    function _formatDateUnit(input) {
        if (input) {
            var time = parseInt(input.replace(/[^0-9]/g, "")); //"/Date(1645574400000)/" -> 1645574400000
            var a = new Date(time);
            a = new Date(a.setHours(a.getHours() + 5));
            var month = "" + (a.getUTCMonth() + 1),
                day = "" + a.getUTCDate(),
                year = a.getFullYear();

            if (month.length < 2) month = "0" + month;
            if (day.length < 2) day = "0" + day;
            return [year, month, day].join("-");
        }

        return ["0000", "00", "00"].join("-");
    }

    function _formatDateYMD(time) {
        var a = new Date();
        if (time) a = new Date(time);
        var month = "" + (a.getUTCMonth() + 1),
            day = "" + a.getUTCDate(),
            year = a.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [year, month, day].join("-");
    }

    function _addHoursToDate(objDate, intHours) {
        var numberOfMlSeconds = objDate.getTime();
        var addMlSeconds = intHours * 60 * 60000;
        var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);

        return newDateObj;
        //return new Date(objDate.setHours(objDate.getHours() + hours));
    }

    function _subtractTimeFromDate(objDate, intHours) {
        var numberOfMlSeconds = objDate.getTime();
        var addMlSeconds = intHours * 60 * 60000;
        var newDateObj = new Date(numberOfMlSeconds - addMlSeconds);

        return newDateObj;
    }
};
