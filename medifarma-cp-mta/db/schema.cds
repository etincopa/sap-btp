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

entity LOG_PROCESS_APP : auditoriaBase {
    key id             : UUID;
        solucion       : String(64) default 'CENTRAL PESADAS';
        capa           : String(64) default 'BACKEND';
        usuario        : String(64);
        app            : String(256);
        modulo         : String(256);
        subModulo      : String(256);
        evento         : String(256);
        accion         : String(256);
        tipoLog        : String(256);
        tipoRecurso    : String(10);
        recurso        : String(256);
        parameter      : String(5000);
        tramaEnvio     : LargeString;
        tramaRespuesta : LargeString;
};

entity SEQUENCE_CUSTOM : auditoriaBase {
    sequenceId : Integer;
    pedidoCP   : Integer default 0; //70000000 -> Central de Pesadas (8 dígitos)
    pedidoAM   : Integer default 0; //60000000 -> Almacén Materiales (8 dígitos)
    bultoIFA   : Integer default 0; //00000000 -> Etiqueta IFA (8 dígitos)
    bultoENT   : Integer default 0; //00000000 -> Etiqueta ENTERO (8 dígitos)
    bultoFRAC  : Integer default 0; //00000000 -> Etiqueta FRACCION (8 dígitos)
    bultoSAL   : Integer default 0; //00000000 -> Etiqueta SALDO (8 dígitos)
}

entity BALANZA : auditoriaBase {
    key balanzaId         : String(36);
        codigo            : String(20) not null;
        modelo            : String(50);
        serie             : String(50);
        capacidadMinimo   : String(20);
        capacidadMaximo   : String(20);
        tolerancia        : String(20);
        precision         : String(20);
        conexion          : String(20);
        boundRate         : String(100);
        parity            : String(100);
        stopBits          : String(100);
        dataBits          : String(100);
        marca             : String(100);
        cantidadDecimales : Integer;
        activoBalanza     : String(1);
        oUnidad           : Association to one MIF_ADMIN_HDI_MAESTRA;
        oPlanta           : Association to one MIF_ADMIN_HDI_MAESTRA;
        oTipoBalanza      : Association to one MIF_ADMIN_HDI_MAESTRA;
        oPuertoCom        : Association to one MIF_ADMIN_HDI_MAESTRA;
        oSalaPesaje       : Association to one SALA_PESAJE;
}

entity IMPRESORA : auditoriaBase {
    key impresoraId       : String(36);
        nombre            : String(50);
        direccion         : String(50);
        estadoImpresora   : Boolean;
        serie             : String(20);
        indicadorCp       : Boolean;
        indicadorPicking  : Boolean;
        indicadorEtiqueta : Boolean;
        oPlanta           : Association to one MIF_ADMIN_HDI_MAESTRA;
        area              : String(50);
        rmd               : Boolean;
}

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

entity PLANTILLA_IMPRESION : auditoriaBase {
    key plantillaImpresionId : String(36);
        descripcion          : String(255);
        nombre               : String(255);
        contenido            : LargeString;
}

entity COLA_IMPRESION : auditoriaBase {
    key colaImpresionId : String(36);
        descripcion     : String(255);
        enviados        : Boolean;
        enviadoIp       : String(36);
        copias          : Integer;
        oImpresora      : Association to one IMPRESORA;
        oPlantilla      : Association to one PLANTILLA_IMPRESION;
        aVariables      : Composition of many COLA_IMPRESION_VARIABLES
                              on aVariables.oColaImpresion = $self;
}

entity COLA_IMPRESION_VARIABLES : auditoriaBase {
    key colaImpresionVariableId : String(36);
        oColaImpresion          : Association to one COLA_IMPRESION;
        codigo                  : String(255);
        valor                   : String(255);
}


//# ---------------- TIPO DE PEDIDO -----------------------
entity TIPO_PEDIDO : auditoriaBase {
    key tpedidoId          : String(36);
        codigo             : String(10);
        nombre             : String(50);
        aTipoPedidoDetalle : Association to many TIPO_PEDIDO_DETALLE
                                 on aTipoPedidoDetalle.oTipoPedido = $self;
}

entity TIPO_PEDIDO_DETALLE : auditoriaBase {
    key tPedidoDetId : String(36);
        codigo       : String(10);
        nombre       : String(50);
        oTipoPedido  : Association to one TIPO_PEDIDO;
}

//# ---------------- ATENCION DE PEDIDOS -----------------------
entity PEDIDO : auditoriaBase {
    key pedidoId            : String(36);
        numPedido           : String(15); //Numero de pedido
        centro              : String(36);
        oSala               : Association to one SALA_PESAJE;
        oEstado             : Association to one MIF_ADMIN_HDI_MAESTRA;
        oMotivo             : Association to one MIF_ADMIN_HDI_MAESTRA;
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

entity PEDIDO_USUARIO : auditoriaBase {
    key oPedido  : Association to one PEDIDO;
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
}

entity ORDEN : auditoriaBase {
    key ordenId          : String(36);
        reservaNum       : String(10); //Numero de reserva
        numero           : String(15);
        lote             : String(15);
        fechaVencimiento : DateTime;
        oProgramacion    : Association to one PROGRAMACION;
        /* Nuevos campos Atención de pedidos */
        clasOrdProd      : String(36); //Clase de orden de producción
        codProdTerm      : String(36);
        nomProdTerm      : String(255); //nombre del PT
        reservaIDE       : String(1); //Reserva de IDE (check)
        fecLibera        : String(36); //Fecha de liberación (fecha de solicitud IDE/muestra)
        respLibera       : String(36); //responsable de la liberación (reserva IDE/muestra),
        fecFabric        : String(36); //Fecha de fabricación,
        nivelFab         : String(36); //Nivel Fabricación
        envase           : String(36); //Envase
        fecEnvase        : String(36); //Fecha de envase,
        acondicionado    : String(36); //Acondicionado
        fecAcondic       : String(36); //Fecha de Acondicionando
        seccion          : String(36); //sección
        tamanoLote       : String(36); //Tamaño de lote
        estadoOrdenErp   : String(36); //Estado de una orden que viene del ERP(LIBERADO;ABIERTO;CERRADA TECNICAMENTE)
        centro           : String(36);
}

entity ORDEN_FRACCION : auditoriaBase {
    key ordenFraccionId     : String(36);
        oEstado             : Association to one MIF_ADMIN_HDI_MAESTRA;
        oSala               : Association to one SALA_PESAJE;
        oOrden              : Association to one ORDEN;
        ordenPos            : String(4);
        numFraccion         : Integer;
        reservaNum          : String(10); //Numero de reserva
        aOrdenDetalle       : Composition of many ORDEN_DETALLE
                                  on aOrdenDetalle.oOrdenFraccion = $self;
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
        /* Traslado */
        pedidoTrasladoUsu   : String(36);
        pedidoTrasladoFec   : DateTime;
        pedidoTraslado      : String(100);
        etiqueta            : String(36);
}

entity ORDEN_DETALLE : auditoriaBase {
    key ordenDetalleId       : String(36);
        oEstado              : Association to one MIF_ADMIN_HDI_MAESTRA;
        oSala                : Association to one SALA_PESAJE;
        numSubFraccion       : Integer;
        sugerido             : Decimal(18, 3); //Cantidad Pedida
        cantPedida           : Decimal(18, 3); //Cantidad Pedida
        cantPedidaUp         : Decimal(18, 3); //Cantidad Pedida Actualizada
        entero               : Decimal(18, 3);
        requerido            : Decimal(18, 3); //Cantidad Requerida
        requeridoFinal       : Decimal(18, 3);
        criterioFrac         : String(300);
        agotar               : String(1); //Indicador si se requiere agotar el stock
        pesadoMaterialPr     : String(1); //Característica del maestro de materiales ZMPR: Indicador Materiales que se pesan en Producción
        cantLoteLogisti      : Decimal(18, 3); //Cantidad de lote logistico (Cantidad inicial del lote)
        numBultoEntero       : Integer; //Numero Bultos Entero
        cantAtendida         : Decimal(18, 3); //Cantidad atendida Entero
        cantAtendidaFrac     : Decimal(18, 3); //Cantidad atendida Fraccion
        cantAtendidaIfa      : Decimal(18, 3); //Cantidad atendida Fraccion
        cantEntregada        : Decimal(18, 3); //Cantidad Entregada
        /*
        * DATOS ERP
        * */
        oOrdenFraccion       : Association to one ORDEN_FRACCION;
        //Aufnr                : String(100); //Orden
        ordenPos             : String(100); //Posición    Número de posición de la orden
        codigoInsumo         : String(100); //Material
        descripcion          : String(255); //Descripción Material
        lote                 : String(100); //Lote
        centro               : String(36); // Centro Insumo
        almacen              : String(36); // Almacen Insumo
        reservaNum           : String(100); //Número de reserva
        reservaPos           : String(100); //Posición    Número de posición de reserva
        indOrdenFab          : String(255); //Texto con el detalle de las fracciones
        indMat               : String(255); //Texto de posición de lista de materiales (línea 2)
        cantSugerida         : Decimal(18, 3); //Cantidad subfracción (cantidad sugerida) en la unidad de medida base
        cantSugeridaTotal    : Decimal(18, 3); //Cantidad subfracción (cantidad sugerida) en la unidad de medida base
        unidad               : String(36); //UM en la unidad de medida base
        cantSugeridaPot      : Decimal(18, 3); //Cantidad subfracción (cantidad sugerida) en la unidad de medida con potencia
        unidadPot            : String(36); //UM    en la unidad de medida con potencia
        cantRequerida        : Decimal(18, 3); //Cantidad Requerida    cantidad de la lista de materiales
        cantRequeridaUM      : String(36); // Unidad Medida Cantidad Requerida
        cantReservada        : Decimal(18, 3); //Cantidad de la Reserva
        cantReservadaUM      : String(36); // Unidad Medida Cantidad de la Reserva
        cantReservadaPot     : Decimal(18, 3); //Cantidad de la Reserva UM Orden   cantidad en la unidad de potencia
        cantReservadaPotUM   : String(36); //UM    unidad de medida con potencia

        fechaVencimiento     : Date; //Fecha vencimiento del insumo
        cantCompromet        : Decimal(18, 3); //Cantidad comprometida (cantidad pendiente en reservas, entregas y pedidos de traslado)
        stockLibrUtil        : Decimal(18, 3); //Stock de libre utilización ERP
        stockATP             : Decimal(18, 3); //Stock ATP (Stock de libre utilización - Cantidad comprometida)
        glosa                : String(500); //Glosa (texto indicado en la recepción de compra del insumo)
        textCalPot           : String(255); //Texto de Cálculo de Potencia
        pTInsumo             : String(255); //Potencia Teórica del insumo
        pPLoteLog            : String(255); //Potencia practica del lote logístico
        cantResUpo           : Decimal(18, 3); //Cantidad de la Reserva UM Orden   cantidad en la unidad de potencia
        umPot                : String(255); //UM    unidad de medida con potencia
        cantRes              : Decimal(18, 3); //Cantidad de la Reserva
        umRes                : String(255); //UM    unidad de medida base
        cantPesoEsp          : Decimal(18, 5); //Cantidad peso espeficico

        /* Picking */
        estadoTraslado       : String(20); //Estado de traslado (Proceso Picking)
        pickingUsu           : String(36);
        pickingFec           : DateTime;
        /* Pesaje */
        pesajeUsu            : String(36);
        pesajeFec            : DateTime;
        /* Verificación */
        verificacionEstado   : String(10); //Estado de verificacion (Proceso Picking)
        verificacionUsu      : String(36);
        verificacionFec      : DateTime;
        /* Traslado */
        pedidoTraslado       : String(100);
        pedidoTrasladoPosEnt : String(20);
        pedidoTrasladoPosFra : String(20);
        oSalaNueva           : Association to one SALA_PESAJE;
        resetear             : String(1); //Indicador si se requiere reembalaje

}

entity PEDIDO_ORDEN : auditoriaBase {
    key oPedido : Association to one PEDIDO;
    key oOrden  : Association to one ORDEN;
}

entity PROGRAMACION : auditoriaBase {
    key programacionId    : String(36);
        fechaProgramacion : Date;
        oSalaPesaje       : Association to one SALA_PESAJE;
        aOrden            : Association to many ORDEN
                                on aOrden.oProgramacion = $self;
}

entity GRUPO_ORDEN : auditoriaBase {
    key grupoOrdenId : String(36);
        codigo       : Integer;
        oSalaPesaje  : Association to one SALA_PESAJE;
}

entity GRUPO_ORDEN_DET : auditoriaBase {
    key grupoOrdenDetalleId : String(36);
        codigo              : Integer;
        oGrupoOrden         : Association to one GRUPO_ORDEN;
        oOrdenFraccion      : Association to one ORDEN_FRACCION;
}

/**
 * Consolidado de todos los Insumos en un Grupo de Ordenes
 */
entity GRUPO_ORDEN_CONSOLIDADO : auditoriaBase {
    key grupoOrdenConsolidadoId : String(36);
        codigoInsumo            : String(15);
        descripcion             : String(50);
        lote                    : String(15);
        centro                  : String(36);
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
entity GRUPO_ORDEN_FRAC : auditoriaBase {
    key grupoOrdenFraccionamientoId : String(36);
        oGrupoOrdenDetalle          : Association to one GRUPO_ORDEN_DET;
        oGrupoOrdenConsolidado      : Association to one GRUPO_ORDEN_CONSOLIDADO;
        oInsumo                     : Association to one ORDEN_DETALLE;
        numFraccion                 : Integer;
        numSubFraccion              : Integer;
        sugerido                    : Decimal(18, 3);
        entero                      : Decimal(18, 3);
        requerido                   : Decimal(18, 3);
        /**
         * Requerido Final es igual al Requerido pero ajustado por el
         * usuario
         */
        requeridoFinal              : Decimal(18, 3);
        requeridoFinalConv          : Decimal(18, 3);
        unidad                      : String(36);
        pTInsumo                    : String(36);
        pPLoteLog                   : String(36);
        cantSugerida                : Decimal(18, 3);
        tara                        : Decimal(18, 3);
        oEstado                     : Association to one MIF_ADMIN_HDI_MAESTRA;
        duplicado                   : String(1); //Indicador si ha sido duplicado
}

/**
 * Bultos atendidos para un Fraccionamiento, en caso de ser IFA
 * se creara automaticamente los registros pero vacio
 */
/*@assert.unique : {
   bulto: [ bulto ]
}*/
entity GRUPO_ORDEN_BULTO : auditoriaBase {
    key grupoOrdenBultoId          : String(36);
        oGrupoOrdenFraccionamiento : Association to one GRUPO_ORDEN_FRAC;
        pedidoId                   : String(36);
        ordenId                    : String(36);
        ordenDetalleId             : String(36);
        /**
         * PEDIDO
         */
        pedido                     : String(36);
        centro                     : String(36);
        /**
         * ORDEN
         */
        orden                      : String(36);
        /**
         * INSUMO
         */
        codigoInsumo               : String(36);
        lote                       : String(36);
        idPos                      : Integer;
        /**
         * BULTO
         */
        tipo                       : String(36);
        idBulto                    : String(255);
        nroItem                    : Integer;
        cantidadA                  : Decimal(18, 3); //Cantidad Atendida Neto
        tara                       : Decimal(18, 3); //Cantidad Atendida Tara
        unidadM                    : String(36); //Cantidad Atendida UMB
        balanzaPeso                : Decimal(18, 3); //Peso Balanza
        balanzaUnidadM             : String(36); //Peso Unidad Balanza
        almacen                    : String(36);
        status                     : String(36); //Status Traslado
        etiqueta                   : String(50);
        etiquetaGrupo              : String(50);
        impresion                  : String(1);
        reimpresion                : String(36);
        docMat                     : String(255);
        cantConsumida              : Decimal(18, 3); //Cantidad consumida del Saldo
        tareaAlmacen               : String(36);
        /**
         * Seguimiento bulto
         */
        fechaHoraAte               : DateTime;
        usuarioAte                 : String(50); //Usuario Atiende
        fechaHoraRec               : DateTime;
        usuarioRec                 : String(50); //Usuario Recepciona
        fechaHoraRev               : DateTime;
        usuarioRev                 : String(50); //Usuario Revisa
        fechaHoraVer               : DateTime;
        usuarioVer                 : String(50); //Usuario Verifica
        /**
         * Verificacion
         */
        flagVerif                  : String(1);
}

//# ------------------------------------------------------------
entity LOG {
    key logId           : String(36);
        tabla           : String(15);
        codigo          : String(100);
        fechaRegistro   : DateTime;
        usuarioRegistro : String(100);
}

entity LOG_DETALLE {
    key detalleId       : String(36);
        tabla           : String(15);
        codigo          : String(100);
        fechaRegistro   : DateTime;
        usuarioRegistro : String(100);
        campo           : String(50);
        valorAnterior   : String(500);
        valorActual     : String(500);
        valorActual2    : String(500);
        oLog            : Association to one LOG;
}

//# ------------------------------------------------------------

//# ---------------- HISTORIAL DE PEDIDOS ----------------------
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

//# ------------------------------------------------------------
//#   CDS EXTERNAL - MIF_ADMIN_HDI
//# ------------------------------------------------------------
@cds.persistence.exists
entity MIF_ADMIN_HDI_AUDITORIA {
    key id              : UUID;
        timestamp       : DateTime;
        host            : String(64);
        port            : Integer;
        serviceName     : String(32);
        //connectionId        : Integer;
        clientHost      : String(256);
        clientIp        : String(45);
        //clientPid           : Integer;
        //clientPort          : Integer;
        userName        : String(256);
        applicationName : String(256);
        eventStatus     : String(32);
        eventLevel      : String(16);
        eventAction     : String(64);
        action          : String(64);
        //schemaName          : String(556);
        //sKey                : String(2000);
        value           : LargeString;
        statementString : String(5000);
        lang            : String(20);
        device          : String(256);
        so              : String(256);
        soVersion       : String(256);
        browser         : String(256);
        browserVersion  : String(256);
        stackError      : LargeString;
//originDatabaseName  : String(256);
}

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
//oSistema     : Association to MIF_ADMIN_HDI_SISTEMA;
};

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO : auditoriaBase {
    key usuarioId           : UUID;
        usuario             : String(20) @mandatory; //Usuario Asignado
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
        seccionId           : String(50); // ID de la Seccion que viene de SAP
        seccionTxt          : String(255); // Descripcion de la Seccion que viene de SAP
        loginSap            : String(30); // Usuario de logeo de SAP
        oMaestraSucursal    : Association to MIF_ADMIN_HDI_MAESTRA {
                                  codigo
                              }; // Las Plantas Lima y Ate
        oMaestraNivel       : String(100); //Association to MAESTRA { codigo } Niveles de Fraccionamiento
        oMaestraTipoUsuario : Association to MIF_ADMIN_HDI_MAESTRA {
                                  codigo
                              }; // Tipo de Usuario de Fraccionamiento
        //oSistema            : Association to MIF_ADMIN_HDI_SISTEMA; //Usuario por sistema
        aSistemas           : Association to many MIF_ADMIN_HDI_USUARIO_SISTEMA
                                  on aSistemas.oUsuario = $self; //Usuarios por sistema
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
entity MIF_ADMIN_HDI_USUARIO_SISTEMA : auditoriaBase {
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
    key oSistema : Association to MIF_ADMIN_HDI_SISTEMA;
};

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO_ROL : auditoriaBase {
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
    key oRol     : Association to MIF_ADMIN_HDI_ROL;
        codigo   : String(20);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_SISTEMA : auditoriaBase {
    key sistemaId   : UUID;
        codigo      : String(50);
        nombre      : String(50);
        descripcion : String(150);
//aUsuarios   : Association to many MIF_ADMIN_HDI_USUARIO_SISTEMA on aUsuarios.oSistema = $self;

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


//# ------------------------------------------------------------
//#   VIEWS
//# ------------------------------------------------------------

/**
 * Vista para obtener las Maestra consolidado
 */
define view VIEW_MAESTRA as
    select from MIF_ADMIN_HDI_MAESTRA as MA
    inner join MIF_ADMIN_HDI_MAESTRA_TIPO as MT
        on MT.maestraTipoId = MA.oMaestraTipo.maestraTipoId
    {
        MA.iMaestraId,
        MA.contenido,
        MA.descripcion,
        MA.orden,
        MA.codigo,
        MA.codigoSap,
        MA.campo1,
        MT.maestraTipoId,
        MT.tabla,
        MT.nombre,
        MT.onlyAdmin
    }
    where
        MA.activo = true;

/**
 * Vista para obtener los roles del Usuario por aplicación
 */
define view VIEW_USER_ROL_APP_ACCION as
    select from MIF_ADMIN_HDI_ROL_APP_ACCIONES {
        oRol.rolId                               as rolId,
        oRol.codigo                              as rol,
        oAplicacion.codigo                       as aplicacion,
        oAplicacion.oSistema.codigo              as sistema,
        oMaestraAccion.oMaestraTipo.tabla        as grupoAccion,
        oMaestraAccion.codigo                    as accion,
        oRol.aRolUsuarios.oUsuario.usuarioId     as usuarioId,
        oRol.aRolUsuarios.oUsuario.usuario       as usuario,
        oRol.aRolUsuarios.oUsuario.nombreMostrar as usuarioNombre,
        oRol.aRolUsuarios.oUsuario.numeroDocumento,
        oRol.aRolUsuarios.oUsuario.apellidoPaterno,
        oRol.aRolUsuarios.oUsuario.apellidoMaterno,
        oRol.aRolUsuarios.oUsuario.nombre
    }
    where
        activo = true;

/**
 * Vista para obtener las Ordenes consolidados: Pedido -> Orden
 * \-> Fraccion
 */
define view VIEW_PEDIDO_ORDEN_CONSOLIDADO as
    select from PEDIDO as PED
    inner join PEDIDO_ORDEN as POR
        on POR.oPedido.pedidoId = PED.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    {
        /**
         * PEDIDO
         */
        PED.pedidoId           as pedidoId,
        PED.numPedido          as pedidoNumero,
        /**
         * ORDEN
         */
        ORD.ordenId            as ordenId,
        ORD.numero             as numero,
        ORD.codProdTerm,
        ORD.nomProdTerm,
        ORD.lote               as lote,
        ORD.fechaVencimiento   as fechaVencimiento,
        OFR.numFraccion        as numFraccion,
        OFR.oEstado.codigo     as oEstado_codigo,
        OFR.oEstado.contenido  as oEstado_contenido,
        OFR.numBultoEntero     as numBultoEntero,
        OIN.oSala.salaPesajeId as salaPesajeId,
        OFR.ordenFraccionId    as ordenFraccionId
    }
    where
            PED.activo            =  true
        and OIN.oEstado.contenido != 'ANULADO'
    group by
        PED.pedidoId,
        PED.numPedido,
        ORD.ordenId,
        ORD.numero,
        ORD.codProdTerm,
        ORD.nomProdTerm,
        ORD.lote,
        OFR.oEstado.codigo,
        OFR.oEstado.contenido,
        OFR.numBultoEntero,
        ORD.fechaVencimiento,
        OFR.numFraccion,
        OIN.oSala.salaPesajeId,
        OFR.ordenFraccionId;

/**
 * Vista para obtener toda la estructura del pedido: Pedido ->
 * Orden -> Fraccion -> Insumo
 */
define view VIEW_PEDIDO_CONSOLIDADO as
    select from PEDIDO as PED
    inner join PEDIDO_ORDEN as POR
        on POR.oPedido.pedidoId = PED.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
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
        /* Picking */
        PED.pickingUsuInic                        as pedidoPickingIniUsu,
        PED.pickingFecInic                        as pedidoPickingIniFec,
        PED.pickingUsuFin                         as pedidoPickingFinUsu,
        PED.pickingFecFin                         as pedidoPickingFinFec,
        /**
         * ORDEN
         */
        ORD.ordenId                               as ordenId,
        ORD.numero                                as ordenNumero,
        ORD.codProdTerm                           as ordenCodProd,
        ORD.nomProdTerm                           as OrdenDescrip,
        ORD.lote                                  as ordenLote,
        OFR.numFraccion                           as numFraccion,
        OFR.oEstado.codigo                        as ordenEstado,
        OFR.estadoTraslado                        as ordenEstadoTraslado,
        OFR.verificacionEstado                    as ordenVerificacionEstado,
        OFR.verificacionIniFec                    as ordenVerificacionIniFec,
        OFR.verificacionFinFec                    as ordenVerificacionFinFec,
        OFR.numBultoEntero                        as numBultoEntero,
        /* Picking */
        OFR.pickingIniUsu                         as pickingIniUsu,
        OFR.pickingIniFec                         as pickingIniFec,
        OFR.pickingFinUsu                         as pickingFinUsu,
        OFR.pickingFinFec                         as pickingFinFec,
        /* Pesaje */
        OFR.pesajeIniUsu                          as pesajeIniUsu,
        OFR.pesajeIniFec                          as pesajeIniFec,
        OFR.pesajeFinUsu                          as pesajeFinUsu,
        OFR.pesajeFinFec                          as pesajeFinFec,
        OFR.ordenFraccionId                       as ordenFraccionId,
        OFR.etiqueta                              as etiqueta,
        /**
         * INSUMO/MATERIAL/ARTICULO
         */
        OIN.ordenDetalleId                        as ordenDetalleId,
        OIN.numSubFraccion                        as numSubFraccion,
        OIN.reservaNum                            as reservaNum,
        OIN.reservaPos                            as reservaPos,
        OIN.codigoInsumo                          as insumoCodigo,
        OIN.descripcion                           as insumoDescrip,
        OIN.lote                                  as insumoLote,
        OIN.oEstado.codigo                        as insumoEstado,
        OIN.estadoTraslado                        as insumoEstadoTraslado,
        OIN.unidad                                as insumoUmb,
        OIN.centro                                as insumoCentro,
        OIN.almacen                               as insumoAlmacen,
        OIN.agotar                                as InsumoAgotar,
        OIN.oSala.sala                            as InsumoSala,
        OIN.cantSugerida                          as cantSugerida, //Cantidad Sugerida
        OIN.cantPedida                            as cantPedida,
        OIN.cantPedidaUp                          as cantPedidaUp,
        OIN.cantAtendida                          as cantAtendida, //Cantidad atendida con Entero   (Bulto tipo ENTERO)
        OIN.cantAtendidaFrac                      as cantAtendidaFrac, //Cantidad atendida con Saldo (Bulto tipo FRACCION)
        OIN.cantAtendidaIfa                       as cantAtendidaIfa, //Cantidad atendida con Saldo (Bulto tipo IFA)
        OIN.verificacionEstado                    as insumoVerificacionEstado,
        OIN.ordenPos                              as ordenPos
    }
    where
        PED.activo = true;

/**
 * Vista para el reporte de: Pedido Central de Pesadas / Pedido
 * Almacen Material
 */
entity VIEW_SEGUIMIENTO_PEDIDO_CP         as
    select
        key PE.pedidoId,
            PE.numPedido,
            PE.usuarioRegistro,
            PE.fechaRegistro,
            PE.pickingUsuInic,
            PE.pickingFecInic,
            PE.pickingUsuFin,
            PE.pickingFecFin,
            PE.oEstado.iMaestraId                    as Estado_iMaestraId,
            PE.oEstado.codigo                        as Estado_codigo,
            PE.oEstado.contenido                     as Estado_contenido,
            PE.centro                                as Centro_codigoSap,
            PE.oMotivo.contenido                     as Motivo_contenido,
            PE.oTipoPedidoDetalle.oTipoPedido.tpedidoId,
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as Tipo_codigo,
            PE.oTipoPedidoDetalle.oTipoPedido.nombre as Tipo_nombre,
            PE.oTipoPedidoDetalle.tPedidoDetId,
            PE.oTipoPedidoDetalle.codigo             as TipoDetalle_codigo,
            PE.oTipoPedidoDetalle.nombre             as TipoDetalle_nombre,
            STRING_AGG(
                CONCAT(
                    US.nombre, CONCAT(
                        ' ', US.apellidoPaterno
                    )
                ), ', ')                             as usuarioAsignado     : String,
            STRING_AGG(
                ORD.numero, ', ')                    as NumOrden            : String,
            STRING_AGG(
                ORD.lote, ', ')                      as LoteProdTerm        : String,
            STRING_AGG(
                ORD.codProdTerm, ', ')               as CodProdTerm         : String,
            STRING_AGG(
                OIN.oEstado.codigo, ', ')            as Estado_orden_codigo : String,
            STRING_AGG(
                OIN.codigoInsumo, ', ')              as CodigoInsumo        : String,
            STRING_AGG(
                OIN.lote, ', ')                      as LoteInsumo          : String,
            STRING_AGG(
                OIN.reservaNum, ', ')                as ReservaNum          : String

        from PEDIDO_ORDEN as POR
        inner join PEDIDO as PE
            on PE.pedidoId = POR.oPedido.pedidoId
        inner join ORDEN as ORD
            on ORD.ordenId = POR.oOrden.ordenId
        inner join ORDEN_FRACCION as OFR
            on OFR.oOrden.ordenId = ORD.ordenId
        inner join ORDEN_DETALLE as OIN
            on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId

        left join PEDIDO_USUARIO as PU
            on  PU.oPedido.pedidoId = PE.pedidoId
            and PU.activo           = true
        left join MIF_ADMIN_HDI_USUARIO as US
            on US.usuarioId = PU.oUsuario.usuarioId
        where
            PE.activo = true
        group by
            PE.pedidoId,
            PE.numPedido,
            PE.usuarioRegistro,
            PE.fechaRegistro,
            PE.pickingUsuInic,
            PE.pickingFecInic,
            PE.pickingUsuFin,
            PE.pickingFecFin,
            PE.oEstado.iMaestraId,
            PE.oEstado.codigo,
            PE.oEstado.contenido,
            PE.centro,
            PE.oMotivo.contenido,
            PE.oTipoPedidoDetalle.oTipoPedido.tpedidoId,
            PE.oTipoPedidoDetalle.oTipoPedido.codigo,
            PE.oTipoPedidoDetalle.oTipoPedido.nombre,
            PE.oTipoPedidoDetalle.tPedidoDetId,
            PE.oTipoPedidoDetalle.codigo,
            PE.oTipoPedidoDetalle.nombre;

/**
 * Vista para el reporte de Seguimiento Picking: Central Pesada
 * / Almacen Materiales
 */
define view VIEW_SEGUIMIENTO_PICKING_CP as
    select
            /**
             * PEDIDO
             */
        key PE.pedidoId,
            PE.numPedido                             as numPedido, //Pedido - Pedido
            PE.oTipoPedidoDetalle.nombre             as tipoPedido, //Tipo Pedido - Pedido
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as tipoCodigo, //Tipo Pedido - Pedido
            PE.oEstado.contenido                     as estado, //Estado - Pedido
            PE.oEstado.codigo                        as codEstadoPedido, //Estado del pedido
            PE.usuarioRegistro                       as usuCreacion, //Usuario creacion - Pedido
            PE.fechaRegistro                         as fecCreacion, //Fecha creacion - Pedido
            PE.centro                                as centro,
            /**
             * ORDEN
             */
        key ORD.ordenId,
            ORD.numero                               as numOrden, // Orden Produccion - Orden
        key OFR.ordenFraccionId,
            OFR.numFraccion                          as numFraccion,
            OFR.etiqueta                             as codEtiquetaOrden,
            ORD.codProdTerm                          as codProdTerm, //Codigo del PT - Orden
            ORD.nomProdTerm                          as nomProdTerm, // Descripcion del PT - Orden
            ORD.lote                                 as loteProdTerm, //Lote del PT - Orden
            OFR.numBultoEntero                       as cantBultos,
            /* Picking */
            OFR.estadoTraslado                       as estadoTraslado, //Estado de Traslado Picking
            OFR.pickingIniUsu                        as usuInicioPick, //Usuario inicio picking - orden
            OFR.pickingIniFec                        as fecInicioPick, //Fecha inicio picking - orden
            OFR.pickingFinUsu                        as usuFinPick, //Usuario fin picking - orden
            OFR.pickingFinFec                        as fecFinPick, //Fecha fin picking - orden

            (
                select COUNT(
                    *
                ) as cantInsumos from ORDEN_DETALLE as ordenDet
                where
                    ordenDet.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
            )                                        as cantInsumos : Integer, //Cantidad Insumos - Orden Detalle

            OFR.oSala.salaPesajeId                   as salaPesajeId, //Sala  - Orden
            OFR.oSala.sala                           as sala, //Sala  - Orden
            OFR.oEstado.contenido                    as estadoOrden, //Estado - Orden
            OFR.oEstado.codigo                       as codEstadoOrden, //Estado de la Orden
            ORD.reservaNum                           as numReserva,
            ORD.tamanoLote                           as tamanoLote,
            /* Verificacion */
            OFR.verificacionEstado                   as ordenVerificacionEstado,
            OFR.verificacionIniUsu                   as verificacionIniUsu,
            OFR.verificacionIniFec                   as verificacionIniFec,
            OFR.verificacionFinUsu                   as verificacionFinUsu,
            OFR.verificacionFinFec                   as verificacionFinFec,
            /* Entrega Fisica */
            OFR.entregaFisUsu                        as entregaFisUsu,
            OFR.entregaFisFec                        as entregaFisFec

    from PEDIDO_ORDEN as POR
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    where
        POR.activo = true;

/**
 * Vista para el reporte de Programación Central Pesada
 */
define view VIEW_SEGUIMIENTO_SALA_CP as
    select
            /**
             * PEDIDO
             */
        key PE.pedidoId,
            PE.numPedido                             as numPedido, //Pedido - Pedido
            PE.oTipoPedidoDetalle.nombre             as tipoPedido, //Tipo Pedido - Pedido
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as tipoCodigo, //Tipo Pedido - Pedido
            PE.oEstado.contenido                     as estado, //Estado - Pedido
            PE.oEstado.codigo                        as codEstadoPedido, //Estado del pedido
            PE.usuarioRegistro                       as usuCreacion, //Usuario creacion - Pedido
            PE.fechaRegistro                         as fecCreacion, //Fecha creacion - Pedido
            PE.centro                                as centro,
            /**
             * ORDEN
             */
        key ORD.ordenId,
            ORD.numero                               as numOrden, // Orden Produccion - Orden
        key OFR.ordenFraccionId,
            OFR.numFraccion                          as numFraccion,
            ORD.codProdTerm                          as codProdTerm, //Codigo del PT - Orden
            ORD.nomProdTerm                          as nomProdTerm, // Descripcion del PT - Orden
            ORD.lote                                 as loteProdTerm, //Lote del PT - Orden
            OFR.oSala.salaPesajeId                   as salaPesajeId, //Sala  - Orden
            OFR.oSala.sala                           as sala, //Sala  - Orden
            OFR.oEstado.contenido                    as estadoOrden, //Estado - Orden
            OFR.oEstado.codigo                       as codEstadoOrden, //Estado de la Orden
            ORD.reservaNum                           as numReserva,
            ORD.tamanoLote                           as tamanoLote,
            OFR.etiqueta                             as codEtiquetaOrden,
            /* Picking */
            OFR.estadoTraslado                       as estadoTraslado, //Estado de Traslado Picking
            OFR.pickingIniUsu                        as usuInicioPick, //Usuario inicio picking - orden
            OFR.pickingIniFec                        as fecInicioPick, //Fecha inicio picking - orden
            OFR.pickingFinUsu                        as usuFinPick, //Usuario fin picking - orden
            OFR.pickingFinFec                        as fecFinPick, //Fecha fin picking - orden
            /* Programacion */
            OFR.programacionSalaUsu                  as programacionSalaUsu,
            OFR.programacionSalaFec                  as programacionSalaFec,
            /* Pesaje */
            OFR.pesajeIniUsu                         as pesajeIniUsu,
            OFR.pesajeIniFec                         as pesajeIniFec,
            OFR.pesajeFinUsu                         as pesajeFinUsu,
            OFR.pesajeFinFec                         as pesajeFinFec
    from PEDIDO_ORDEN as POR
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    where
        POR.activo = true;

/**
 * Vista para el reporte de Consolidado: Central Pesada /
 * Almacen Materiales
 */
define view VIEW_SEGUIMIENTO_CONSOLIDADO_CP as
    select
            /**
             * PEDIDO
             */
        key PE.pedidoId,
            PE.numPedido                             as numPedido, //Pedido - Pedido
            PE.oTipoPedidoDetalle.nombre             as tipoPedido, //Tipo Pedido - Pedido
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as tipoCodigo, //Tipo Pedido - Pedido
            PE.oEstado.contenido                     as estado, //Estado - Pedido
            PE.oEstado.codigo                        as codEstadoPedido, //Estado del pedido
            PE.usuarioRegistro                       as usuCreacion, //Usuario creacion - Pedido
            PE.fechaRegistro                         as fecCreacion, //Fecha creacion - Pedido
            PE.centro                                as centro,
            /**
             * ORDEN
             */
        key ORD.ordenId,
            ORD.numero                               as numOrden, // Orden Produccion - Orden
        key OFR.ordenFraccionId,
            (
                select COUNT(
                    *
                ) as requiereTraslado from ORDEN_DETALLE as insumo
                where
                        insumo.oOrdenFraccion.ordenFraccionId =  OFR.ordenFraccionId
                    and insumo.centro                         != ORD.centro
                    and insumo.oEstado.contenido              != 'ANULADO'
            )                                        as requiereTraslado : Integer,
            OFR.numFraccion                          as numFraccion,
            ORD.codProdTerm                          as codProdTerm, //Codigo del PT - Orden
            ORD.nomProdTerm                          as nomProdTerm, // Descripcion del PT - Orden
            ORD.lote                                 as loteProdTerm, //Lote del PT - Orden
            OFR.oSala.salaPesajeId                   as salaPesajeId, //Sala  - Orden
            OFR.oSala.sala                           as sala, //Sala  - Orden
            OFR.oEstado.contenido                    as estadoOrden, //Estado - Orden
            OFR.oEstado.codigo                       as codEstadoOrden, //Estado de la Orden
            ORD.reservaNum                           as numReserva,
            ORD.tamanoLote                           as tamanoLote,
            /* Programacion */
            OFR.programacionSalaUsu                  as programacionSalaUsu,
            OFR.programacionSalaFec                  as programacionSalaFec,
            /* Transferencia */
            OFR.transferenciaUsu                     as transferenciaUsu,
            OFR.transferenciaFec                     as transferenciaFec,
            /* Picking */
            OFR.estadoTraslado                       as estadoTraslado, //Estado de Traslado Picking
            OFR.pickingIniUsu                        as pickingIniUsu,
            OFR.pickingIniFec                        as pickingIniFec,
            OFR.pickingFinUsu                        as pickingFinUsu,
            OFR.pickingFinFec                        as pickingFinFec,
            /* Verificacion */
            OFR.verificacionEstado                   as ordenVerificacionEstado,
            OFR.verificacionIniUsu                   as verificacionIniUsu,
            OFR.verificacionIniFec                   as verificacionIniFec,
            OFR.verificacionFinUsu                   as verificacionFinUsu,
            OFR.verificacionFinFec                   as verificacionFinFec,
            /* Entrega Fisica */
            OFR.entregaFisUsu                        as entregaFisUsu,
            OFR.entregaFisFec                        as entregaFisFec,
            /* Pesaje */
            OFR.pesajeIniUsu                         as pesajeIniUsu,
            OFR.pesajeIniFec                         as pesajeIniFec,
            OFR.pesajeFinUsu                         as pesajeFinUsu,
            OFR.pesajeFinFec                         as pesajeFinFec

    from PEDIDO_ORDEN as POR
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    where
        POR.activo = true;

/**
 * Vista para el reporte de Traslado Central Pesada Permite
 * indentificar a todos los pedidos cuya Orden e Insumos
 * pertenecen a diferentes centros.
 */

define view VIEW_SEGUIMIENTO_TRASLADO_CP as
    select
            /**
             * PEDIDO
             */
        key PE.pedidoId,
            PE.numPedido                             as numPedido, //Pedido - Pedido
            PE.oTipoPedidoDetalle.nombre             as tipoPedido, //Tipo Pedido - Pedido
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as tipoCodigo, //Tipo Pedido - Pedido
            PE.oEstado.contenido                     as estado, //Estado - Pedido
            PE.oEstado.codigo                        as codEstadoPedido, //Estado del pedido
            PE.usuarioRegistro                       as usuCreacion, //Usuario creacion - Pedido
            PE.fechaRegistro                         as fecCreacion, //Fecha creacion - Pedido
            PE.centro                                as centroPedido,
            /**
             * ORDEN
             */
        key ORD.ordenId,
            ORD.numero                               as numOrden, // Orden Produccion - Orden
        key OFR.ordenFraccionId,
            OFR.numFraccion                          as numFraccion,
            ORD.codProdTerm                          as codProdTerm, //Codigo del PT - Orden
            ORD.nomProdTerm                          as nomProdTerm, // Descripcion del PT - Orden
            ORD.lote                                 as loteProdTerm, //Lote del PT - Orden
            ORD.centro                               as centro, //Centro  - Orden
            OFR.oSala.salaPesajeId                   as salaPesajeId, //Sala  - Orden
            OFR.oSala.sala                           as sala, //Sala  - Orden
            OFR.oEstado.contenido                    as estadoOrden, //Estado - Orden
            OFR.oEstado.codigo                       as codEstadoOrden, //Estado de la Orden
            ORD.reservaNum                           as numReserva,
            ORD.tamanoLote                           as tamanoLote,
            /* Programacion */
            OFR.programacionSalaUsu                  as programacionSalaUsu,
            OFR.programacionSalaFec                  as programacionSalaFec,
            /* Transferencia */
            OFR.transferenciaUsu                     as transferenciaUsu,
            OFR.transferenciaFec                     as transferenciaFec,
            /* Picking */
            OFR.estadoTraslado                       as estadoTraslado, //Estado de Traslado Picking
            OFR.pickingIniUsu                        as pickingIniUsu,
            OFR.pickingIniFec                        as pickingIniFec,
            OFR.pickingFinUsu                        as pickingFinUsu,
            OFR.pickingFinFec                        as pickingFinFec,
            /* Verificacion */
            OFR.verificacionEstado                   as ordenVerificacionEstado,
            OFR.verificacionIniUsu                   as verificacionIniUsu,
            OFR.verificacionIniFec                   as verificacionIniFec,
            OFR.verificacionFinUsu                   as verificacionFinUsu,
            OFR.verificacionFinFec                   as verificacionFinFec,
            /* Entrega Fisica */
            OFR.entregaFisUsu                        as entregaFisUsu,
            OFR.entregaFisFec                        as entregaFisFec,
            /* Pesaje */
            OFR.pesajeIniUsu                         as pesajeIniUsu,
            OFR.pesajeIniFec                         as pesajeIniFec,
            OFR.pesajeFinUsu                         as pesajeFinUsu,
            OFR.pesajeFinFec                         as pesajeFinFec,
            /* Traslado */
            OFR.pedidoTrasladoUsu                    as pedidoTrasladoUsu,
            OFR.pedidoTrasladoFec                    as pedidoTrasladoFec,
            OFR.pedidoTraslado                       as pedidoTraslado

    from PEDIDO_ORDEN as POR
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = (
            select insumo.oOrdenFraccion.oOrden.ordenId from ORDEN_DETALLE as insumo
            where
                    insumo.oOrdenFraccion.oOrden.ordenId =  POR.oOrden.ordenId
                and insumo.centro                        != insumo.oOrdenFraccion.oOrden.centro
                and insumo.oEstado.contenido             != 'ANULADO'
            group by
                insumo.oOrdenFraccion.oOrden.ordenId
        )
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    where
            POR.activo            =  true
        and PE.oEstado.contenido  != 'ANULADO'
        and OFR.oEstado.contenido != 'ANULADO';

/**
 * Vista para obtener el detalle de los reportes teniendo como
 * estructura del pedido: Pedido -> Orden -> Fraccion -> Insumo
 */
define view VIEW_SEGUIMIENTO_DETALLE as
    select from PEDIDO as PED
    inner join PEDIDO_ORDEN as POR
        on POR.oPedido.pedidoId = PED.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    {
        /**
         * PEDIDO
         */
        PED.pedidoId                              as pedidoId,
        PED.numPedido                             as pedidoNumero,
        PED.oTipoPedidoDetalle.oTipoPedido.codigo as pedidoTipo,
        PED.oTipoPedidoDetalle.codigo             as pedidoTipoDC,
        UPPER(
            PED.oTipoPedidoDetalle.nombre
        )                                         as pedidoTipoDN : String,
        PED.fechaRegistro                         as pedidoFecha,
        PED.oEstado.iMaestraId                    as pedidoEstadoId,
        PED.oEstado.codigo                        as pedidoEstado,
        PED.oEstado.contenido                     as pedidoEstadoD,
        PED.centro                                as pedidoCentro,
        PED.oSala.sala                            as pedidoSala,
        /* Picking */
        PED.pickingUsuInic                        as pedidoPickingIniUsu,
        PED.pickingFecInic                        as pedidoPickingIniFec,
        PED.pickingUsuFin                         as pedidoPickingFinUsu,
        PED.pickingFecFin                         as pedidoPickingFinFec,
        /**
         * ORDEN
         */
        ORD.ordenId                               as ordenId,
        ORD.numero                                as ordenNumero,
        ORD.reservaIDE,
        ORD.codProdTerm                           as ordenCodProd,
        ORD.nomProdTerm                           as ordenDescrip,
        ORD.lote                                  as ordenLote,
        ORD.centro                                as ordenCentro,
        ORD.fechaVencimiento                      as ordenFechaVencimiento,
        ORD.clasOrdProd                           as ordenClasOrdPrd,
        /**
         * FRACCION
         */
        OFR.ordenFraccionId,
        OFR.numFraccion,
        OFR.oEstado.iMaestraId                    as fraccionEstadoId,
        OFR.oEstado.codigo                        as fraccionEstado,
        OFR.oEstado.contenido                     as fraccionEstadoDes,
        OFR.estadoTraslado                        as ordenEstadoTraslado,
        OFR.verificacionEstado                    as ordenVerificacionEstado,
        OFR.verificacionIniFec                    as ordenVerificacionIniFec,
        OFR.verificacionFinFec                    as ordenVerificacionFinFec,
        /* Picking */
        OFR.pickingIniUsu                         as pickingIniUsu,
        OFR.pickingIniFec                         as pickingIniFec,
        OFR.pickingFinUsu                         as pickingFinUsu,
        OFR.pickingFinFec                         as pickingFinFec,
        /**
         * INSUMO/MATERIAL/ARTICULO
         */
        OIN.ordenPos,
        OIN.ordenDetalleId,
        OIN.numSubFraccion,
        OIN.reservaNum,
        OIN.reservaPos,
        OIN.cantPedida,
        OIN.almacen,
        OIN.codigoInsumo,
        OIN.descripcion,
        OIN.lote,
        OIN.oEstado.iMaestraId                    as insumoEstadoId,
        OIN.oEstado.codigo                        as insumoEstado,
        OIN.oEstado.contenido                     as insumoEstadoDes,
        OIN.cantSugerida,
        OIN.cantSugeridaTotal,
        OIN.cantAtendida,
        OIN.cantAtendidaIfa,
        OIN.sugerido,
        OIN.unidad,
        OIN.agotar,
        OIN.oSala.salaPesajeId,
        OIN.oSala.sala                            as insumoSala,
        OIN.pTInsumo,
        OIN.pPLoteLog,
        OIN.cantAtendidaFrac,
        OIN.indMat,
        OIN.indOrdenFab,
        OIN.verificacionEstado,
        OIN.cantEntregada,
        OIN.pedidoTrasladoPosEnt,
        OIN.pedidoTrasladoPosFra,
        OIN.centro,
        OIN.requerido,
        OIN.stockATP,
        OIN.stockLibrUtil,
        OIN.cantCompromet,
        OIN.textCalPot,
        OIN.cantSugeridaPot,
        OIN.unidadPot,
        OIN.cantReservadaPot,
        OIN.cantReservadaPotUM,
        OIN.cantReservada,
        OIN.cantReservadaUM,
        OIN.cantRequerida,
        OIN.cantRequeridaUM,
        OIN.resetear                              as insumoResetea
    }
    where
        OIN.activo = true;

/**
 * Vista para generar filtros en todos los reportes
 */
entity VIEW_PEDIDO_FILTER_CP              as
    select
        key PE.pedidoId,
            PE.numPedido                             as Pedido_numPedido,
            PE.centro                                as Pedido_centro,
            PE.oEstado.iMaestraId                    as Pedido_estado_iMaestraId,
            PE.fechaRegistro                         as Pedido_fechaRegistro,
            PE.oTipoPedidoDetalle.oTipoPedido.codigo as Pedido_tipoCodigo,
            PU.oUsuario.usuario                      as Pedido_usuario,
            CONCAT(
                PU.oUsuario.usuario, CONCAT(
                    ' ', CONCAT(
                        PU.oUsuario.nombre, CONCAT(
                            ' ', PU.oUsuario.apellidoPaterno
                        )
                    )
                )
            )                                        as Pedido_nombreUsuario : String,

        key ORD.ordenId,
            ORD.numero                               as Orden_numOrden,
            ORD.lote                                 as Orden_loteProdTerm,
            ORD.codProdTerm                          as Orden_codProdTerm,
            ORD.nomProdTerm                          as Orden_nomProdTerm,
            OFR.ordenFraccionId,
            OFR.oEstado.iMaestraId                   as Orden_estado_iMaestraId,
            OFR.oEstado.codigo                       as Orden_estado_codigo,
            OFR.verificacionEstado                   as Orden_verificacionEstado,
        key OIN.ordenDetalleId,
            OIN.reservaNum                           as Insumo_numReserva,
            OIN.codigoInsumo                         as Insumo_codigo,
            OIN.lote                                 as Insumo_lote,
            OIN.descripcion                          as Insumo_decrip,
            OIN.oEstado.iMaestraId                   as Insumo_estado_iMaestraId
    from PEDIDO_ORDEN as POR
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    inner join ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    left join PEDIDO_USUARIO as PU
        on  PU.oPedido.pedidoId = PE.pedidoId
        and PU.activo           = true
    where
        PE.activo = true;

/**
 * Vista que obtiene las fracciones (Fraccionamiento)
 */
entity GRUPO_ORDEN_FRAC_DET               as
    select
        PE.oTipoPedidoDetalle.oTipoPedido.codigo as tipoPedido,
        PE.pedidoId,
        PE.numPedido,
        PE.centro,
        ORD.fechaRegistro,
        ORD.numero                               as ordenNumero,
        ORD.lote                                 as ordenLote,
        ORD.ordenId,
        ORD.nomProdTerm                          as nombreProducto,
        ORD.codProdTerm                          as codigoProducto,
        ORD.tamanoLote,
        ORD.fechaVencimiento,
        OFR.ordenFraccionId,
        OFR.numFraccion                          as numFraccion,
        OFR.oEstado.iMaestraId                   as oEstado_iMaestraId,
        OFR.oEstado.codigo                       as oEstado_codigo,
        OFR.pesajeIniFec                         as OrdenPesajeFechaIni,
        OFR.pesajeFinFec                         as OrdenPesajeFechaFin,
        OFR.oSala.sala                           as salaPesaje, //InsumoEstado
        F.grupoOrdenFraccionamientoId,
        F.oGrupoOrdenConsolidado.grupoOrdenConsolidadoId,
        F.requeridoFinalConv                     as requeridoFinal,
        F.usuarioRegistro                        as usuarioRegistra,
        F.oInsumo.ordenDetalleId                 as ordenDetalleId,
        F.oInsumo.numSubFraccion                 as numSubFraccion,
        F.oInsumo.reservaNum                     as reservaNum,
        F.oInsumo.reservaPos                     as reservaPos,
        F.oInsumo.codigoInsumo                   as codigoInsumo,
        F.oInsumo.lote                           as loteInsumo,
        F.oInsumo.centro                         as centroInsumo,
        F.oInsumo.descripcion                    as descripcionInsumo,
        F.oInsumo.cantAtendida                   as entero, //Cantidad Atendida en Entero
        F.oInsumo.cantRequerida                  as requerido, //Cantidad Pedida Receta
        F.oInsumo.pTInsumo                       as pTInsumo, //Potencia Teorica de Insumo
        F.oInsumo.pPLoteLog                      as pPLoteLog, //Potencia Practica Lote Logistico
        F.oInsumo.cantSugerida                   as cantSugerida, //Cantidad Sugerida
        F.oInsumo.sugerido                       as sugerido, //Cantidad Pedida
        F.oInsumo.cantPedida                     as cantPedida,
        F.oInsumo.cantPedidaUp                   as cantPedidaUp,
        F.oInsumo.unidad                         as unidadOrigen,
        F.unidad                                 as unidad, //Unidad
        F.oInsumo.almacen                        as almacen, //Almacen
        F.oInsumo.oEstado.contenido              as InsumoEstado, //InsumoEstado
        F.oInsumo.oEstado.codigo                 as InsumoCodigoEstado, //InsumoEstado
        F.oInsumo.oEstado.iMaestraId             as InsumoEstado_iMaestraId, //InsumoEstadoId
        F.oInsumo.pesadoMaterialPr               as pesadoMaterialPr, //InsumoEstadoId
        F.oInsumo.oSala.salaPesajeId             as insumoSalaPesajeId, //salaPesajeId
        F.tara                                   as taraFrac, //InsumoEstado
        F.oEstado.contenido                      as FracEstado, //FracEstado
        F.oEstado.codigo                         as FracCodigoEstado, //FracEstado
        F.oEstado.iMaestraId                     as FracEstado_iMaestraId, //FracEstado
        F.fechaActualiza,
        B.grupoOrdenBultoId,
        B.cantidadA                              as atendido,
        B.tara                                   as tara,
        B.etiqueta                               as etiqueta, //Etiqueta [F: Fraccion, I: Ifa]
        OFR.etiqueta                             as etiquetaOFR,
        B.idBulto                                as bulto, //HU  IdBulto
        C.oGrupoOrden.grupoOrdenId,
        GD.grupoOrdenDetalleId,
        F.oInsumo.resetear                       as insumoResetea, //insumoResetea
        F.oInsumo.glosa,
        F.oInsumo.agotar,
        F.duplicado                              as FracDuplicado
    from GRUPO_ORDEN_FRAC as F
    inner join GRUPO_ORDEN_CONSOLIDADO as C
        on C.grupoOrdenConsolidadoId = F.oGrupoOrdenConsolidado.grupoOrdenConsolidadoId
    inner join GRUPO_ORDEN_DET as GD
        on GD.grupoOrdenDetalleId = F.oGrupoOrdenDetalle.grupoOrdenDetalleId
    inner join ORDEN_FRACCION as OFR
        on OFR.ordenFraccionId = GD.oOrdenFraccion.ordenFraccionId
    inner join ORDEN as ORD
        on ORD.ordenId = OFR.oOrden.ordenId
    inner join PEDIDO_ORDEN as POR
        on POR.oOrden.ordenId = ORD.ordenId
    inner join PEDIDO as PE
        on PE.pedidoId = POR.oPedido.pedidoId
    left join GRUPO_ORDEN_BULTO as B
        on  B.oGrupoOrdenFraccionamiento.grupoOrdenFraccionamientoId = F.grupoOrdenFraccionamientoId
        and B.activo                                                 = true
    where
            F.activo  = true
        and GD.activo = true;

/**
 * Vista para obtener el consolidado de las ordenes
 * (Fraccionamiento)
 */
entity GRUPO_ORDEN_CONSOLIDADO_DET        as
    select
        C.grupoOrdenConsolidadoId,
        C.codigoInsumo,
        C.descripcion,
        C.lote,
        C.oGrupoOrden,
        C.oEstado,
        sum(
            F.requeridoFinal
        ) as totalRequerido : Decimal(18, 3),
        F.oInsumo.oSala,
        F.oInsumo.centro,
        F.oInsumo.unidad,
        F.oInsumo.agotar
    from GRUPO_ORDEN_CONSOLIDADO as C
    inner join GRUPO_ORDEN_FRAC as F
        on  F.oGrupoOrdenConsolidado.grupoOrdenConsolidadoId = C.grupoOrdenConsolidadoId
        and F.activo                                         = true
    inner join GRUPO_ORDEN as GO
        on  GO.grupoOrdenId = C.oGrupoOrden.grupoOrdenId
        and GO.activo       = true
    where
        C.activo = true
    group by
        C.grupoOrdenConsolidadoId,
        C.codigoInsumo,
        C.descripcion,
        C.lote,
        C.centro,
        C.oGrupoOrden,
        C.oEstado,
        GO.oSalaPesaje.salaPesajeId,
        F.oInsumo.oSala.salaPesajeId,
        F.oInsumo.centro,
        F.oInsumo.unidad,
        F.oInsumo.agotar;

/**
 * Vista para obtener la información en consulta documentos
 * (Fraccionamiento)
 */
define view GRUPO_ORDEN_BULTO_DET as
    select
        /*ORDEN*/
        ORD.ordenId                                              as ordenId, /*Id Orden*/
        ORD.numero                                               as O_numero, /*Num. Orden*/
        ORD.lote                                                 as O_lote, /*Lote Producto*/
        ORD.codProdTerm                                          as P_codigo, /*Codigo Producto*/
        ORD.nomProdTerm                                          as P_nombre, /*Descrip. Producto*/
        OFR.ordenFraccionId,
        OFR.oEstado.codigo                                       as O_estado, /*Estado Orden*/
        OFR.numFraccion                                          as numFraccion,
        B.grupoOrdenBultoId                                      as grupoOrdenBultoId,
        B.oGrupoOrdenFraccionamiento.grupoOrdenFraccionamientoId as grupoOrdenFraccionamientoId, /*Grupo Fraccion*/
        B.idBulto                                                as B_bulto, /*Codigo Bulto*/
        B.etiqueta                                               as B_etiqueta, /*Etiqueta Bulto QR*/
        B.tara                                                   as B_tara, /*Bulto Tara*/
        B.cantidadA                                              as B_cantidadA, /*Bulto Cant Atendida*/
        B.tipo                                                   as B_tipo, /*Bulto Tipo*/
        B.fechaHoraAte                                           as B_fechaRegistro,
        B.usuarioAte                                             as B_usuarioRegistro,
        B.docMat                                                 as I_docMaterial, /*Doc Material*/
        GD.grupoOrdenDetalleId                                   as grupoOrdenDetalleId, /*Orden Detalle*/
        /*INSUMO*/
        F.oInsumo.ordenDetalleId                                 as ordenDetalleId,
        F.oInsumo.numSubFraccion                                 as numSubFraccion,
        F.oInsumo.oEstado.codigo                                 as I_estado, /*Estado Insumo*/
        F.oInsumo.codigoInsumo                                   as I_codigo, /*Codigo Insumo*/
        F.oInsumo.unidad                                         as I_unidad, /*Bulto UM*/
        F.oInsumo.descripcion                                    as I_descripcion, /*Descrip. Insumo*/
        F.oInsumo.lote                                           as I_lote, /*lote Insumo*/
        F.oInsumo.fechaVencimiento                               as I_fechaVencimiento, /*Fecha vencimiento del insumo*/
        F.oInsumo.pesadoMaterialPr                               as I_pesadoMaterialPr, /*Característica del maestro de materiales ZMPR: Indicador Materiales que se pesan en Producción*/
        F.oInsumo.stockLibrUtil                                  as I_stockLibUtil, /*Stock Libre Utilizacion*/
        F.oInsumo.cantLoteLogisti                                as I_cantLoteLogisti, /*Cantidad de lote logistico (Cantidad inicial del lote)*/
        F.oInsumo.almacen                                        as I_almacen, /*Almacen*/
        F.oInsumo.centro                                         as I_centro, /*Centro*/
        F.oInsumo.sugerido                                       as I_cantSugerida, /*Cantidad Sugerida*/
        F.oInsumo.cantPedida                                     as I_cantPedida,
        F.oInsumo.cantPedidaUp                                   as I_cantPedidaUp,
        F.oInsumo.agotar                                         as I_agotar /*Inidica si el insumo se debe de agotar*/
    from GRUPO_ORDEN_BULTO as B
    inner join GRUPO_ORDEN_FRAC as F
        on F.grupoOrdenFraccionamientoId = B.oGrupoOrdenFraccionamiento.grupoOrdenFraccionamientoId
    inner join GRUPO_ORDEN_CONSOLIDADO as C
        on C.grupoOrdenConsolidadoId = F.oGrupoOrdenConsolidado.grupoOrdenConsolidadoId
    inner join GRUPO_ORDEN_DET as GD
        on GD.grupoOrdenDetalleId = F.oGrupoOrdenDetalle.grupoOrdenDetalleId
    inner join ORDEN_FRACCION as OFR
        on OFR.ordenFraccionId = GD.oOrdenFraccion.ordenFraccionId
    inner join ORDEN as ORD
        on ORD.ordenId = OFR.oOrden.ordenId
    where
        B.activo = true;

/**
 * Vista para generar el consolidado al momento de crear el
 * grupo orden (Fraccionamiento)
 */
entity GRUPO_ORDEN_DET_INSUMO_CONSOLIDADO as
    select
        D.oGrupoOrden.grupoOrdenId,
        OIN.criterioFrac,
        OIN.codigoInsumo,
        OIN.descripcion,
        OIN.lote,
        OIN.centro,
        OFR.oOrden.numero as numOrden,
        OFR.numFraccion,
        PE.numPedido,
        OFR.reservaNum
    from GRUPO_ORDEN_DET as D
    inner join ORDEN_FRACCION as OFR
        on OFR.ordenFraccionId = D.oOrdenFraccion.ordenFraccionId
    inner join ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    inner join PEDIDO_ORDEN as PO
        on PO.oOrden.ordenId = OFR.oOrden.ordenId
    inner join PEDIDO as PE
        on PE.pedidoId = PO.oPedido.pedidoId
    where
        D.activo = true
    group by
        D.oGrupoOrden.grupoOrdenId,
        OIN.criterioFrac,
        OIN.codigoInsumo,
        OIN.descripcion,
        OIN.lote,
        OIN.centro,
        OFR.oOrden.numero,
        OFR.numFraccion,
        PE.numPedido,
        OFR.reservaNum;

/**
 * Vista para generar el consolidado al momento de crear el
 * grupo orden (Fraccionamiento)
 */
entity GRUPO_ORDEN_DET_INSUMO             as
    select
        PE.pedidoId,
        PE.numPedido,
        OFR.oOrden.ordenId,
        OFR.oOrden.numero  as numOrden,
        OFR.ordenFraccionId,
        OFR.numFraccion,
        OIN.ordenDetalleId,
        OIN.numSubFraccion,
        OIN.codigoInsumo,
        OIN.lote,
        OIN.sugerido,
        OIN.cantPedida,
        OIN.cantPedidaUp,
        OIN.entero,
        OIN.cantAtendida,
        OIN.requerido,
        OIN.cantRequerida,
        OIN.cantSugerida,
        OIN.unidad,
        OIN.pTInsumo,
        OIN.pPLoteLog,
        OIN.pesadoMaterialPr,
        OIN.cantPesoEsp,
        OIN.oEstado.codigo as insumoEstado,
        D.grupoOrdenDetalleId,
        D.oGrupoOrden.grupoOrdenId
    from ORDEN_DETALLE as OIN
    inner join ORDEN_FRACCION as OFR
        on OFR.ordenFraccionId = OIN.oOrdenFraccion.ordenFraccionId
    inner join GRUPO_ORDEN_DET as D
        on D.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    inner join PEDIDO_ORDEN as PO
        on PO.oOrden.ordenId = OFR.oOrden.ordenId
    inner join PEDIDO as PE
        on PE.pedidoId = PO.oPedido.pedidoId
    where
            D.activo           =  true
        and OIN.oEstado.codigo != 'PAIANUL';

/**
 * Vista para obtener el detalle de las ordenes programadas en
 * el modulo de Programa Central de Pesadas
 */

define view VIEW_ORDEN_PROGRAMACION as
    select
        O.ordenId,
        O.reservaNum,
        O.numero,
        O.lote,
        O.estadoOrdenErp,
        O.oProgramacion,
        O.clasOrdProd,
        O.nivelFab,
        O.acondicionado,
        O.nomProdTerm,
        O.codProdTerm,
        (
            select count(
                *
            ) as iTotal from ORDEN as aux
            inner join ORDEN_FRACCION as fracAux
                on fracAux.oOrden.ordenId = aux.ordenId
            inner join MIF_ADMIN_HDI_MAESTRA as m
                on fracAux.oEstado.iMaestraId = m.iMaestraId
            where
                    aux.numero = O.numero
                and m.codigo   = 'PAOTOT'
        ) as iEntregaFisica : Integer
    from ORDEN as O
    where
            O.oProgramacion.programacionId is not null
        and O.activo                       =      true;
