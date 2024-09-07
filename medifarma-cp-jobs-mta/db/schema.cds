namespace mif.cp;

using {
    cuid,
    managed
} from '@sap/cds/common';

aspect auditoriaBase {
    terminal         : String(100);
    fechaRegistro    : DateTime @cds.on.insert : $now;
    usuarioRegistro  : String(100) not null;
    fechaActualiza   : DateTime @cds.on.update : $now;
    usuarioActualiza : String(100);
    activo           : Boolean not null;
}


@cds.persistence.exists
entity SALA_PESAJE : auditoriaBase {
    key salaPesajeId           : String(36);
        sala                   : String(50);
        ipPc                   : String(50);
        horaTaraManual         : String(20);
        inicioTaraManual       : DateTime;
        inicioPesoManual       : DateTime;
        inicioLectEtiqueta     : DateTime;
        finTaraManual          : DateTime;
        finPesoManual          : DateTime;
        finLectEtiqueta        : DateTime;
        minutPesoManual        : String(20);
        horaLectEtiqueta       : String(20);
        oPlanta                : Association to one MIF_ADMIN_HDI_MAESTRA;
        oEstado                : Association to one MIF_ADMIN_HDI_MAESTRA;
        oEstadoTaraManual      : Association to one MIF_ADMIN_HDI_MAESTRA;
        oEstadoPesoManual      : Association to one MIF_ADMIN_HDI_MAESTRA;
        oEstadoLecturaEtiqueta : Association to one MIF_ADMIN_HDI_MAESTRA;
        aProgramacion          : Composition of many PROGRAMACION
                                     on aProgramacion.oSalaPesaje = $self;
}

@cds.persistence.exists
entity PROGRAMACION : auditoriaBase {
    key programacionId    : String(36);
        fechaProgramacion : Date;
        oSalaPesaje       : Association to one SALA_PESAJE;
        aOrden            : Association to many ORDEN
                                on aOrden.oProgramacion = $self;
}


@cds.persistence.exists
entity ORDEN_DETALLE : auditoriaBase {
    key ordenDetalleId     : String(36);
        oEstado            : Association to one MIF_ADMIN_HDI_MAESTRA;
        oSala              : Association to one SALA_PESAJE;
        sugerido           : Decimal(18, 3); //Cantidad Pedida
        cantPedida         : Decimal(18, 3); //Cantidad Pedida
        cantPedidaUp       : Decimal(18, 3); //Cantidad Pedida Actualizada
        entero             : Decimal(18, 3);
        requerido          : Decimal(18, 3); //Cantidad Requerida
        requeridoFinal     : Decimal(18, 3);
        criterioFrac       : String(300);
        agotar             : String(1); //Indicador si se requiere agotar el stock
        pesadoMaterialPr   : String(1); //Característica del maestro de materiales ZMPR: Indicador Materiales que se pesan en Producción
        cantLoteLogisti    : Decimal(18, 3); //Cantidad de lote logistico (Cantidad inicial del lote)
        docMaterial        : String(100); //Documento Material Ajuste
        docEjercicio       : String(4);
        ajuste             : String(1); //Indicador de ajuste en +/-
        stockLibrUtilReal  : Decimal(18, 3); //Stock de libre utilización Real Pesada

        numBultoEntero     : Integer; //Numero Bultos Entero
        cantAtendida       : Decimal(18, 3); //Cantidad atendida Entero
        cantAtendidaFrac   : Decimal(18, 3); //Cantidad atendida Fraccion
        cantAtendidaIfa    : Decimal(18, 3); //Cantidad atendida Fraccion
        cantEntregada      : Decimal(18, 3); //Cantidad Entregada

        /* Picking */
        estadoTraslado     : String(20); //Estado de traslado (Proceso Picking)
        pickingUsu         : String(36);
        pickingFec         : DateTime;
        /* Pesaje */
        pesajeUsu          : String(36);
        pesajeFec          : DateTime;
        /* Verificación */
        verificacionEstado : String(10); //Estado de verificacion (Proceso Picking)
        verificacionUsu    : String(36);
        verificacionFec    : DateTime;
        /*
        * DATOS ERP
        * */
        oOrden             : Association to one ORDEN;
        itemPos            : String(10); //Posicion Orden
        reservaNum         : String(36); //Numero de reserva
        reservaPos         : String(4); //Posicion de reserva
        reservaPosSec      : Integer; //Secuencia Posicion de reserva
        codigoInsumo       : String(36); //Codigo de Insumo
        descripcion        : String(255); //Descripcion de Insumo
        lote               : String(36); // Lote de Insumo
        unidad             : String(36); // Unidad Medida Insumo
        centro             : String(36); // Centro Insumo
        almacen            : String(36); // Almacen Insumo
        cantSugerida       : Decimal(18, 3); //Cantidad Sugerida ERP
        cantRequerida      : Decimal(18, 3); //Cantidad Requerida ERP
        fechaVencimiento   : Date; //Fecha vencimiento del insumo
        cantCompromet      : Decimal(18, 3); //Cantidad comprometida (cantidad pendiente en reservas, entregas y pedidos de traslado)
        stockLibrUtil      : Decimal(18, 3); //Stock de libre utilización ERP
        stockATP           : Decimal(18, 3); //Stock ATP (Stock de libre utilización - Cantidad comprometida)
        glosa              : String(36); //Glosa (texto indicado en la recepción de compra del insumo)
        textCalPot         : String(36); //Texto de Cálculo de Potencia
        pTInsumo           : String(36); //Potencia Teórica del insumo
        pPLoteLog          : String(36); //Potencia practica del lote logístico
        indMat             : String(36); //Indicadores en la lista de materiales (Ajuste de potencia y compensadores) ETF-PP-047 Ajuste de Potencia.
        indOrdenFab        : String(36); //Indicaciones de la orden de fabricación (Texto explicativo de descripción LMat)

}

@cds.persistence.exists
entity BULTO : auditoriaBase {
    key bultoId       : String(36);
        ubicacion     : String(50);
        posicion      : Integer;
        etiqueta      : String(50);
        bulto         : String(15);
        neto          : Decimal(18, 3);
        tara          : Decimal(18, 3);
        taraFinal     : Decimal(18, 3);
        final         : Decimal(18, 3);
        oUnidad       : Association to one MIF_ADMIN_HDI_MAESTRA;
        oOrdenDetalle : Association to one ORDEN_DETALLE;
        estadoControl : String(50);
}

@cds.persistence.exists
entity PRODUCTO : auditoriaBase {
    key productoId : String(36);
        codigo     : String(15);
        nombre     : String(60);
}

@cds.persistence.exists
entity ORDEN : auditoriaBase {
    key ordenId             : String(36);
        oEstado             : Association to one MIF_ADMIN_HDI_MAESTRA;
        oSala               : Association to one SALA_PESAJE;
        reservaNum          : String(10); //Numero de reserva
        numero              : String(15);
        ordenPos            : String(4);
        lote                : String(15);
        fechaVencimiento    : DateTime;
        oProducto           : Association to one PRODUCTO; // ELIMINAR
        oProgramacion       : Association to one PROGRAMACION;
        oTipoOrden          : Association to one MIF_ADMIN_HDI_MAESTRA; //Tipo ORDEN [PRODUCCION,RESERVA]
        /* Nuevos campos Atención de pedidos */
        clasOrdProd         : String(36); //Clase de orden de producción
        codProdTerm         : String(36);
        nomProdTerm         : String(255); //nombre del PT
        reservaIDE          : String(1); //Reserva de IDE (check)
        fecLibera           : String(36); //Fecha de liberación (fecha de solicitud IDE/muestra)
        horaLibera          : String(36); //Hora de liberación,
        respLibera          : String(36); //responsable de la liberación (reserva IDE/muestra),
        fecFabric           : String(36); //Fecha de fabricación,
        nivelFab            : String(36); //Nivel Fabricación
        envase              : String(36); //Envase
        fecEnvase           : String(36); //Fecha de envase,
        acondicionado       : String(36); //Acondicionado
        fecAcondic          : String(36); //Fecha de Acondicionando
        seccion             : String(36); //sección
        tamanoLote          : String(36); //Tamaño de lote
        estadoOrdenErp      : String(36); //Estado de una orden que viene del ERP(LIBERADO;ABIERTO;CERRADA TECNICAMENTE)
        centro              : String(36);
        lstMaterial         : String(36); //Lista Material

        aOrdenDetalle       : Composition of many ORDEN_DETALLE
                                  on aOrdenDetalle.oOrden = $self;
        numBultoEntero      : Integer; //Numero Bultos Entero

        /* Picking */
        estadoTraslado      : String(20); //Estado de traslado (Proceso Picking)
        pickingIniUsu       : String(36);
        pickingIniFec       : DateTime;
        pickingFinUsu       : String(36);
        pickingFinFec       : DateTime;
        /* Verificacion */
        verificacionEstado  : String(10); //Estado de verificacion (Proceso Picking)
        verificacionIniUsu  : String(36);
        verificacionIniFec  : DateTime;
        verificacionFinUsu  : String(36);
        verificacionFinFec  : DateTime;
        /* Pesaje */
        pesajeIniUsu        : String(36);
        pesajeIniFec        : DateTime;
        pesajeFinUsu        : String(36);
        pesajeFinFec        : DateTime;
        /* ProgramacionSala */
        programacionSalaUsu : String(36);
        programacionSalaFec : DateTime;
        /* Transferencia */
        transferenciaUsu    : String(36);
        transferenciaFec    : DateTime;
        /* Entrega física */
        entregaFisUsu       : String(36);
        entregaFisFec       : DateTime;
        etiqueta            : String(36);
}

@cds.persistence.exists
entity GRUPO_ORDEN : auditoriaBase {
    key grupoOrdenId : String(36);
        codigo       : Integer;
        oSalaPesaje  : Association to one SALA_PESAJE;
}

@cds.persistence.exists
entity GRUPO_ORDEN_DET : auditoriaBase {
    key grupoOrdenDetalleId : String(36);
        codigo              : Integer;
        oGrupoOrden         : Association to one GRUPO_ORDEN;
        oOrden              : Association to one ORDEN;
}

/**
 * Consolidado de todos los Insumos en un Grupo de Ordenes
 */
@cds.persistence.exists
entity GRUPO_ORDEN_CONSOLIDADO : auditoriaBase {
    key grupoOrdenConsolidadoId : String(36);
        codigoInsumo            : String(15);
        descripcion             : String(50);
        lote                    : String(15);
        fechaVencimiento        : Date; //Fecha vencimiento del insumo
        pesadoMaterialPr        : String(1); //Característica del maestro de materiales ZMPR: Indicador Materiales que se pesan en Producción
        oGrupoOrden             : Association to one GRUPO_ORDEN;
        oEstado                 : Association to one MIF_ADMIN_HDI_MAESTRA;
}

/**
 * Fraccionamientos de Insumos de una Orden, son creados en
 * base al criterio de fraccionamiento del insumo de la orden
 * de producción
 */
@cds.persistence.exists
entity GRUPO_ORDEN_FRAC : auditoriaBase {
    key grupoOrdenFraccionamientoId : String(36);
        oGrupoOrdenDetalle          : Association to one GRUPO_ORDEN_DET;
        oGrupoOrdenConsolidado      : Association to one GRUPO_ORDEN_CONSOLIDADO;
        oInsumo                     : Association to one ORDEN_DETALLE;
        fraccion                    : Integer;
        sugerido                    : Decimal(18, 3);
        entero                      : Decimal(18, 3);
        requerido                   : Decimal(18, 3);
        /**
         * Requerido Final es igual al Requerido pero ajustado por el
         * usuario
         */
        requeridoFinal              : Decimal(18, 3);
        unidad                      : String(36);
        pTInsumo                    : String(36);
        pPLoteLog                   : String(36);
        cantSugerida                : Decimal(18, 3);
        tara                        : Decimal(18, 3);
        oEstado                     : Association to one MIF_ADMIN_HDI_MAESTRA;
}

/**
 * Bultos atendidos para un Fraccionamiento, en caso de ser IFA
 * se creara automaticamente los registros pero vacio
 */
/*@assert.unique : {
   bulto: [ bulto ]
}*/

@cds.persistence.exists
entity TIPO_PEDIDO : auditoriaBase {
    key tpedidoId          : String(36);
        codigo             : String(10);
        nombre             : String(50);
        aTipoPedidoDetalle : Association to many TIPO_PEDIDO_DETALLE
                                 on aTipoPedidoDetalle.oTipoPedido = $self;
}

@cds.persistence.exists
entity TIPO_PEDIDO_DETALLE : auditoriaBase {
    key tPedidoDetId : String(36);
        codigo       : String(10);
        nombre       : String(50);
        oTipoPedido  : Association to one TIPO_PEDIDO;
}


@cds.persistence.exists
entity PEDIDO : auditoriaBase {
    key pedidoId            : String(36);
        numPedido           : String(15); //Numero de pedido
        centro              : String(36);
        oSala               : Association to one SALA_PESAJE;
        oEstado             : Association to one MIF_ADMIN_HDI_MAESTRA;
        oTipoPedidoDetalle  : Association to one TIPO_PEDIDO_DETALLE;
        aHistorial          : Association to many HISTORIAL
                                  on aHistorial.oPedido = $self;
        /* Picking */
        pickingUsuInic      : String(36);
        pickingFecInic      : DateTime;
        pickingUsuFin       : String(36);
        pickingFecFin       : DateTime;
        /* Pesaje */
        pesajeUsuInic       : String(36);
        pesajeFecInic       : DateTime;
        pesajeUsuFin        : String(36);
        pesajeFecFin        : DateTime;
        /* Verificación */
        verificacionUsuInic : String(36);
        verificacionFecInic : DateTime;
        verificacionUsuFin  : String(36);
        verificacionFecFin  : DateTime;

}

//# ------------------------------------------------------------

//# ---------------- HISTORIAL DE PEDIDOS ----------------------
@cds.persistence.exists
entity HISTORIAL : auditoriaBase {
    key historialId : String(36);
        descripcion : String(255);
        oPedido     : Association to one PEDIDO;
        oEstadoAct  : Association to one MIF_ADMIN_HDI_MAESTRA;
        oEstadoAnt  : Association to one MIF_ADMIN_HDI_MAESTRA;
        usuario     : String(255);
        fecInicio   : DateTime;
        fecFin      : DateTime;
}

//# ------------------------------------------------------------
//#   CDS EXTERNAL - MIF_ADMIN_HDI
//# ------------------------------------------------------------

@cds.persistence.exists
entity MIF_ADMIN_HDI_MAESTRA_TIPO : auditoriaBase {
    key maestraTipoId : Integer;
        tabla         : String(20) not null;
        nombre        : String(50);
        onlyAdmin     : Boolean not null;
};

@cds.persistence.exists
entity MIF_ADMIN_HDI_MAESTRA : auditoriaBase {
    key iMaestraId   : Integer;
        oMaestraTipo : Association to MIF_ADMIN_HDI_MAESTRA_TIPO;
        contenido    : String(500) not null;
        descripcion  : String(500);
        orden        : Integer not null;
        codigo       : String(30);
        codigoSap    : String(30);
        campo1       : String(20);
        oAplicacion  : Association to MIF_ADMIN_HDI_APLICACION;
};

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO : auditoriaBase {
    key usuarioId           : UUID;
        usuario             : String(20); //Usuario Asignado
        clave               : String(255); //Contraseña para las APP
        usuarioSap          : String(20); //Usuario ERP
        usuarioIas          : String(50); //Usuario IAS
        nombre              : String(150); //Nombres
        nombreMostrar       : String(150); //Nombre para mostrar en los sistemas
        correo              : String(150); //Correo asociada al IAS
        apellidoPaterno     : String(150);
        apellidoMaterno     : String(150);
        tipoDocumento       : String(150);
        numeroDocumento     : String(150);
        experiencia         : String(200);
        telefono            : String(50);
        Movil               : String(50);
        seccionId           : String(25); // ID de la Seccion que viene de SAP
        seccionTxt          : String(50); // Descripcion de la Seccion que viene de SAP
        oMaestraSucursal    : Association to MIF_ADMIN_HDI_MAESTRA {
                                  codigo
                              }; // Las Plantas Lima y Ate
        oMaestraNivel       : String(100); // Niveles de Fraccionamiento
        oMaestraTipoUsuario : Association to MIF_ADMIN_HDI_MAESTRA {
                                  codigo
                              }; // Tipo de Usuario de Fraccionamiento
        oSistema            : Association to MIF_ADMIN_HDI_SISTEMA; //Usuario por sistema
        aRolUsuarios        : Composition of many MIF_ADMIN_HDI_USUARIO_ROL
                                  on aRolUsuarios.oUsuario = $self;
        fechaVigInicio      : DateTime;
        fechaVigFin         : DateTime;
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_ROL : auditoriaBase {
    key rolId        : UUID;
        oSistema     : Association to MIF_ADMIN_HDI_SISTEMA;
        codigo       : String(20);
        nombre       : String(50);
        descripcion  : String(150);
        aRolUsuarios : Composition of many MIF_ADMIN_HDI_USUARIO_ROL
                           on aRolUsuarios.oRol = $self;
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO_ROL : auditoriaBase {
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
    key oRol     : Association to MIF_ADMIN_HDI_ROL;
        codigo   : String(20);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_SISTEMA : auditoriaBase {
    key sistemaId   : UUID;
        codigo      : String(20);
        nombre      : String(50);
        descripcion : String(150);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_APLICACION : auditoriaBase {
    key aplicacionId : UUID;
        oSistema     : Association to MIF_ADMIN_HDI_SISTEMA;
        codigo       : String(20);
        nombre       : String(50);
        descripcion  : String(150);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_ROL_APP_WF : auditoriaBase {
    key oAplicacion  : Association to MIF_ADMIN_HDI_APLICACION;
    key oRolWorkflow : Association to MIF_ADMIN_HDI_ROL;
    key oRol         : Association to MIF_ADMIN_HDI_ROL;
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_ROL_APP_ACCIONES : auditoriaBase {
    key oRol           : Association to MIF_ADMIN_HDI_ROL;
    key oAplicacion    : Association to MIF_ADMIN_HDI_APLICACION;
    key oMaestraAccion : Association to MIF_ADMIN_HDI_MAESTRA;
};

@cds.persistence.exists
entity PEDIDO_ORDEN : auditoriaBase {
    key oPedido : Association to one PEDIDO;
    key oOrden  : Association to one ORDEN;
}

@cds.persistence.exists
define view VIEW_PEDIDO_CONSOLIDADO as
    select from PEDIDO as PED
    inner join PEDIDO_ORDEN as POR
        on POR.oPedido.pedidoId = PED.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrden.ordenId = ORD.ordenId
    {
        /**
         * PEDIDO
         */
        PED.pedidoId                              as pedidoId,
        PED.numPedido                             as pedidoNumero,
        PED.oEstado.codigo                        as pedidoEstado,
        PED.oTipoPedidoDetalle.oTipoPedido.codigo as PedidoTipo,
        PED.oTipoPedidoDetalle.codigo             as PedidoTipoDC,
        UPPER(
            PED.oTipoPedidoDetalle.nombre
        )                                         as PedidoTipoD : String,
        PED.centro                                as PedidoCentro,
        PED.fechaRegistro                         as pedidoFecha,
        /**
         * ORDEN
         */
        ORD.ordenId                               as ordenId,
        ORD.numero                                as ordenNumero,
        ORD.codProdTerm                           as ordenCodProd,
        ORD.nomProdTerm                           as OrdenDescrip,
        ORD.lote                                  as ordenLote,
        ORD.oEstado.codigo                        as ordenEstado,
        ORD.estadoTraslado                        as ordenEstadoTraslado,
        ORD.verificacionEstado                    as ordenVerificacionEstado,
        ORD.verificacionIniFec                    as ordenVerificacionIniFec,
        ORD.verificacionFinFec                    as ordenVerificacionFinFec,
        ORD.numBultoEntero                        as numBultoEntero,
        ORD.pickingIniUsu                         as pickingIniUsu,
        ORD.pickingIniFec                         as pickingIniFec,
        ORD.pickingFinUsu                         as pickingFinUsu,
        ORD.pickingFinFec                         as pickingFinFec,
        /**
         * INSUMO/MATERIAL/ARTICULO
         */
        OIN.ordenDetalleId                        as ordenDetalleId,
        OIN.reservaNum                            as reservaNum,
        OIN.reservaPos                            as reservaPos,
        OIN.codigoInsumo                          as insumoCodigo,
        OIN.descripcion                           as insumoDescrip,
        OIN.lote                                  as insumoLote,
        OIN.reservaPosSec                         as insumoIdPos,
        OIN.oEstado.codigo                        as insumoEstado,
        OIN.estadoTraslado                        as insumoEstadoTraslado,
        OIN.unidad                                as insumoUmb,
        //OIN.fechaVencimiento                      as insumoFechaVencimiento, Fecha vencimiento del insumo
        //OIN.pesadoMaterialPr                      as insumoPesadoMaterialPr, //Indicador si el insumo se pesan en PRODUCCION (IFA)
        OIN.centro                                as insumoCentro,
        OIN.almacen                               as insumoAlmacen,
        OIN.agotar                                as InsumoAgotar,
        OIN.oSala.sala                            as InsumoSala,
        OIN.cantSugerida                          as cantSugerida, //Cantidad Sugerida
        //OIN.sugerido                              as cantPedida, //Cantidad Pedida
        OIN.cantPedida                            as cantPedida,
        OIN.cantPedidaUp                          as cantPedidaUp,
        OIN.cantAtendida                          as cantAtendida, //Cantidad atendida con Entero   (Bulto tipo ENTERO)
        OIN.cantAtendidaFrac                      as cantAtendidaFrac, //Cantidad atendida con Saldo (Bulto tipo FRACCION)
        OIN.cantAtendidaIfa                       as cantAtendidaIfa, //Cantidad atendida con Saldo (Bulto tipo IFA)
        OIN.verificacionEstado                    as insumoVerificacionEstado
    }
    where
        PED.activo = true;



