using {
    Currency,
    managed,
    sap
} from '@sap/cds/common';

namespace mif.rmd;

aspect auditoriaBase {
    terminal         : String(100);
    fechaRegistro    : DateTime;
    usuarioRegistro  : String(100) not null;
    fechaActualiza   : DateTime;
    usuarioActualiza : String(100);
    activo           : Boolean not null;
}

entity ESTRUCTURA : auditoriaBase {
    key estructuraId     : String(36);
        codigo           : Integer;
        descripcion      : String(150);
        numeracion       : Boolean;
        tipoEstructuraId : Association to MIF_ADMIN_HDI_MAESTRA;
        etapa            : String(5);
        verificadoPor    : Boolean;
        estadoId         : Association to MIF_ADMIN_HDI_MAESTRA;
        // aPaso            : Composition of many MD_ES_PASO
        //                        on aPaso.estructuraId = $self;
        // aEquipo          : Composition of many MD_ES_EQUIPO
        //                        on aEquipo.estructuraId = $self;
        // aUtensilio       : Composition of many MD_ES_UTENSILIO
        //                        on aUtensilio.estructuraId = $self;
        // aEtiqueta        : Composition of many MD_ES_ETIQUETA
        //                        on aEtiqueta.estructuraId = $self;
        // aPasoInsumoPaso  : Composition of many MD_ES_PASO_INSUMO_PASO
        //                        on aPasoInsumoPaso.estructuraId = $self;
        // aInsumo          : Composition of many MD_ES_RE_INSUMO
        //                        on aInsumo.estructuraId = $self;
        // aEspecificacion  : Composition of many MD_ES_ESPECIFICACION
        //                        on aEspecificacion.estructuraId = $self;
}

entity ETIQUETA : auditoriaBase {
    key etiquetaId   : String(36);
        codigo       : Integer;
        descripcion  : String(150);
        estadoId     : Association to MIF_ADMIN_HDI_MAESTRA;
        estructuraId : Association to ESTRUCTURA;
}

entity PASO : auditoriaBase {
    key pasoId          : String(36);
        codigo          : Integer;
        descripcion     : String(1000);
        estructuraId    : Association to ESTRUCTURA;
        etiquetaId      : Association to ETIQUETA;
        numeracion      : Boolean;
        tipoDatoId      : Association to MIF_ADMIN_HDI_MAESTRA;
        estadoId        : Association to MIF_ADMIN_HDI_MAESTRA;
        tipoLapsoId     : Association to MOTIVO_LAPSO;
        tipoCondicionId : Association to MIF_ADMIN_HDI_MAESTRA;
        valorInicial    : Decimal(16, 6);
        valorFinal      : Decimal(16, 6);
        margen          : Decimal(16, 6);
        decimales       : Integer;
        vistoBueno      : Boolean;
        vistoBuenoId    : Association to RMD_USUARIO;
        clvModelo       : String(20); //registro de la clave-modelo oData NECESIDADES
        automatico      : Boolean;
}

entity MOTIVO : auditoriaBase {
    key motivoId    : String(36);
        codigo      : Integer;
        abreviatura : String(50);
        descripcion : String(150);
        estadoId    : Association to MIF_ADMIN_HDI_MAESTRA;
}

entity UTENSILIO : auditoriaBase {
    key utensilioId     : String(36);
        codigo          : String(20);
        descripcion     : String(250);
        estadoId        : Association to MIF_ADMIN_HDI_MAESTRA;
        tipoId          : Association to MIF_ADMIN_HDI_MAESTRA;
        clasificacionId : Association to UTENSILIO_CLASIFICACION;
}

entity MOTIVO_LAPSO : auditoriaBase {
    key motivoLapsoId : String(36);
        codigo        : Integer;
        descripcion   : String(150);
        indicador     : Boolean;
        tipoId        : Association to MIF_ADMIN_HDI_MAESTRA;
        estadoId      : Association to MIF_ADMIN_HDI_MAESTRA;
}

entity EQUIPO : auditoriaBase {
    key equipoId    : String(36);
        tipoId      : Association to MIF_ADMIN_HDI_MAESTRA;
        aufnr       : String(12); // Orden
        werks       : String(4); // Centro planif.
        auart       : String(4); // Clase de orden
        ktext       : String(40); // Texto breve
        ilart       : String(3); // Cl.actividad PM
        sstat       : String(3000); // Status de sistema de orden
        ustat       : String(3000); // Status de usuario de orden
        ecali       : String(20); // Equipo Calibrado o Calificado
        gstrp       : DateTime; // Fe.inic.extrema
        gltrp       : DateTime; // Fe.fin extrema
        tplnr       : String(40); // Ubic.técn.
        pltxt       : String(40); // Denominación
        equnr       : String(18); // Equipo
        eqtyp       : String(1); // Tipo de equipo
        estat       : String(3000); // Status de equipo
        eqktx       : String(300); // Denominación
        inbdt       : DateTime; // Fe.puesta serv.
        ctext       : String(40); // Denominación
        abckz       : String(1); // Indicador ABC
        denom       : String(300); // Descripción – Marca-Modelo Concatenado
        CodigoGaci  : String(25); // Código GACI
        arbpl       : String(10); // PuestoTrab
//equipment                       : String; // Codigo del Equipo (Codigo)
//abcindic                        : String(1); // Indicador ABC (codigoGaci)
//descript                        : String(40); // Denominación (descripcion)
//stat                            : String(5); // Status (estadoId)
//txt30                           : String(35); // Descripción de estado
//swerk                           : String(4); // Centro (sucursalId)
//funclocstrucidentifyingobjdes2  : String(40); // Descr.objeto 2º nivel identificación
//eqtyp                           : String(1); // Tipo de equipo
//eqktx                           : String(40); // Denominación
//maintplant                      : String(4); // Ce.emplazam.
//equicatgry                      : String(1); // Tipo de equipo
//inbdt                           : DateTime; // PstaEnServDesde
//readObjnr                       : String(22); // Nº objeto
//readCrdat                       : DateTime; // Creado el
//ppWkctr                         : String(8); // Puesto-tbjo-PPS
//compCode                        : String(4); // Sociedad
//superiorFuncloc                 : String(40); // Ubic.técn.sup.
//descmarcamodel                  : String(100); // Concatenación de descripción-marca-modelo
}

entity RECETA : auditoriaBase {
    key recetaId : String(36);
        // Mtart       : String(4); //Tipo Material
        // Matnr       : String(40); //Material
        // Maktx       : String(40); //Denominación
        Matnr: String(40); // Material
        Werks: String(4); // Centro
        Verid: String(4); // Versión fabr.
        Bdatu: DateTime; // Validez a
        Adatu: DateTime; // Válido de
        Stlal: String(2); // Alternativa
        Plnnr: String(8); // Gpo.hojas ruta
        Alnal: String(2); // Cont.gpo.HRuta
        Text1: String(500); // Texto versión prod.
        Bstmi: Decimal(13, 3); // De tam.lote
        Bstma: Decimal(13, 3); // A tam.lote
        PrfgF: String(1); // Status verif.
        Mksp: String(1); // Bloq.vers.fabric.
        Atwrt: String(70); // Valor caract.
        Matkl: String(9); //Grupo artículos
        Meins: String(9); //UM
        flagEnsayosap :Boolean;
        Dispo: String(3); // Planif.neces.
        Dsnam: String(18); // Nombre-planif.
        Caract: String(100); // CARACT
        Frtme: String(3); // UdM fabricación
        Menge: Decimal(13, 3); // Cantidad pedido
        Atwrt2: String(70); // Valor caract. muestra
        Caract2: String(100); // CARACT MUESTRA
        TextoCab: String(500); // Texto Cabecera
        Mdv01: String(30); // Puesto de Trabajo
        Atwrt3: String(70); // Valor caract. producto
}

entity MD : auditoriaBase {
    key mdId                : String(36);
        codigo              : String(10);
        codigoSolicitud     : String(10);
        version             : Integer;
        estadoIdRmd         : Association to MIF_ADMIN_HDI_MAESTRA;
        productoId          : String(36);
        descripcion         : String(150);
        nivelId             : Association to MIF_ADMIN_HDI_MAESTRA;
        sucursalId          : Association to MIF_ADMIN_HDI_MAESTRA;
        fechaSolicitud      : DateTime;
        motivoId            : Association to MOTIVO;
        observacion         : String(1000);
        estadoIdProceso     : Association to MIF_ADMIN_HDI_MAESTRA;
        fechaAutorizacion   : DateTime;
        usuarioAutorizacion : String(100);
        af                  : String(2);
        aEstructura         : Composition of many MD_ESTRUCTURA
                                  on aEstructura.mdId = $self;
        motivoRechazo       : String(1000);
        wfInstanceId        : String(100);
        destinatariosMD     : Composition of many MD_DESTINATARIOS
                                  on destinatariosMD.mdId = $self;
        aReceta             : Composition of many MD_RECETA
                                  on aReceta.mdId = $self;
        areaRmd             : String(25);
        areaRmdTxt          : String(50);
        aStatusProceso      : Composition of many MD_ESTATUSPROCESO
                                    on aStatusProceso.mdId = $self;
        archivoMD           : LargeString;
        motivoCancelado     : String(50);
        masRecetas          : Boolean;
        aTrazabilidad       : Composition of many MD_TRAZABILIDAD
                                    on aTrazabilidad.mdId = $self;
        rptaValidacion      : String(20);
        nivelTxt            : String(25);
        codDefectoReceta    : String(25);
        codAgrupadorReceta  : String(25);
        codigoversionprincipal: String(10);
        codigoOriginalCopia : String(10); 
        rptaValidacionDate  : DateTime;
        mdIdVersionAnt      : String(36);
}

entity MD_ESTRUCTURA : auditoriaBase {
    key mdEstructuraId   : String(36);
        mdId             : Association to MD;
        estructuraId     : Association to ESTRUCTURA;
        orden            : Integer;
        aPaso            : Composition of many MD_ES_PASO
                                on aPaso.mdEstructuraId = $self;
        aEquipo          : Composition of many MD_ES_EQUIPO
                                on aEquipo.mdEstructuraId = $self;
        aUtensilio       : Composition of many MD_ES_UTENSILIO
                                on aUtensilio.mdEstructuraId = $self;
        aEtiqueta        : Composition of many MD_ES_ETIQUETA
                                on aEtiqueta.mdEstructuraId = $self;
        aPasoInsumoPaso  : Composition of many MD_ES_PASO_INSUMO_PASO
                                on aPasoInsumoPaso.mdEstructuraId = $self;
        aInsumo          : Composition of many MD_ES_RE_INSUMO
                                on aInsumo.mdEstructuraId = $self;
        aEspecificacion  : Composition of many MD_ES_ESPECIFICACION
                                on aEspecificacion.mdEstructuraId = $self;
}

entity MD_ES_ETIQUETA : auditoriaBase {
    key mdEsEtiquetaId : String(36);
        mdEstructuraId : Association to MD_ESTRUCTURA;
        estructuraId   : Association to ESTRUCTURA;
        mdId           : Association to MD;
        etiquetaId     : Association to ETIQUETA;
        orden          : Integer;
        conforme       : Boolean;
        procesoMenor   : Boolean;
}

entity MD_ES_PASO : auditoriaBase {
    key mdEstructuraPasoId : String(36);
        mdEstructuraId     : Association to MD_ESTRUCTURA;
        mdEsEtiquetaId     : Association to MD_ES_ETIQUETA;
        estructuraId       : Association to ESTRUCTURA;
        mdId               : Association to MD;
        pasoId             : Association to PASO;
        orden              : Integer;
        valorInicial       : Decimal(16, 6);
        valorFinal         : Decimal(16, 6);
        margen             : Decimal(16, 6);
        decimales          : Integer;
        mdEstructuraPasoIdDepende: String(36);
        depende            : String(10);
        dependeMdEstructuraPasoId : String(36);
        estadoCC           : Boolean;
        estadoMov          : Boolean;
        pmop               : Boolean;
        genpp              : Boolean;
        tab                : Boolean;
        edit               : Boolean;
        rpor               : Boolean; //revisado por
        vb                 : Boolean;
        formato            : Boolean;
        colorHex           : String(20);
        colorRgb           : String(20);
        imagen             : Boolean;
        tipoDatoId         : Association to MIF_ADMIN_HDI_MAESTRA;
        flagModif          : Boolean;
        aFormula           : Composition of many MD_ES_FORMULA_PASO
                                    on aFormula.pasoPadreId = $self;
        puestoTrabajo      : String(30);
        clvModelo          : String(20); //registro de la clave-modelo oData NECESIDADES
        automatico         : Boolean;
        imagenRuta         : String(250);
        imagenWidth        : Integer; //
        imagenPosition     : Integer; //
        tipoDatoIdAnterior : Association to MIF_ADMIN_HDI_MAESTRA;
}

entity MD_ES_EQUIPO : auditoriaBase {
    key mdEstructuraEquipoId : String(36);
        mdEstructuraId       : Association to MD_ESTRUCTURA;
        estructuraId         : Association to ESTRUCTURA;
        mdId                 : Association to MD;
        equipoId             : Association to EQUIPO;
        orden                : Integer;
}

entity MD_RECETA : auditoriaBase {
    key mdRecetaId : String(36);
        mdId       : Association to MD;
        recetaId   : Association to RECETA;
        orden      : Integer;
        aInsumos   : Composition of many MD_ES_RE_INSUMO
                          on aInsumos.mdRecetaId = $self;
}

entity MD_ES_RE_INSUMO : auditoriaBase {
    key estructuraRecetaInsumoId : String(36);
        mdId                     : Association to MD;
        mdEstructuraId           : Association to MD_ESTRUCTURA;
        estructuraId             : Association to ESTRUCTURA;
        mdRecetaId               : Association to MD_RECETA;
        cantidadRm               : Decimal(16, 6);
        cantidadBarCode          : Decimal(16, 6);
        Matnr                    : String(40); //Material
        Werks                    : String(4); //Centro
        Maktx                    : String(120); //Denominación
        ItemCateg                : String(1); //Tipo Posición
        ItemNo                   : String(4); //Posición
        Component                : String(40); //Componente
        CompQty                  : String(18); //Cantidad
        CompUnit                 : String(3); //UM Componente
        ItemText1                : String(40); //Texto Posicion
        ItemText2                : String(40); //Texto Posicion
        estado                   : Boolean;
        Txtadic                  : String(100); //Texto Adicional
        AiPrio                   : String(2); //Orden jerarquía
}

entity MD_ES_UTENSILIO : auditoriaBase {
    key mdEstructuraUtensilioId : String(36);
        mdEstructuraId          : Association to MD_ESTRUCTURA;
        estructuraId            : Association to ESTRUCTURA;
        mdId                    : Association to MD;
        utensilioId             : Association to UTENSILIO;
        agrupadorId             : Association to UTENSILIO_CLASIFICACION;
        orden                   : Integer;
}

entity ENSAYO_PADRE : auditoriaBase {
    key ensayoPadreId : String(36);
        codigo        : String(10);
        descripcion   : String(150);
}

entity MD_ES_ESPECIFICACION : auditoriaBase {
    key mdEstructuraEspecificacionId : String(36);
        mdEstructuraId               : Association to MD_ESTRUCTURA;
        estructuraId                 : Association to ESTRUCTURA;
        mdId                         : Association to MD;
        ensayoPadreId                : Association to MIF_ADMIN_HDI_MAESTRA;
        ensayoPadreSAP               : String(150);
        ensayoHijo                   : String(150);
        especificacion               : String(500);
        tipoDatoId                   : Association to MIF_ADMIN_HDI_MAESTRA;
        valorInicial                 : Decimal(16, 6);
        valorFinal                   : Decimal(16, 6);
        margen                       : Decimal(16, 6);
        decimales                    : Integer;
        orden                        : Integer;
        Merknr                       : String(4);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_SISTEMA : auditoriaBase {
    key sistemaId   : UUID;
        codigo      : String(20);
        nombre      : String(50);
        descripcion : String(150);
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
entity MIF_ADMIN_HDI_USUARIO : auditoriaBase {
    key usuarioId        : UUID;
        usuario          : String(20);
        nombre           : String(150);
        apellidoPaterno  : String(150);
        apellidoMaterno  : String(150);
        correo           : String(150);
        oMaestraSucursal : Association to MIF_ADMIN_HDI_MAESTRA {
                               codigo
                           };
        seccionId        : String(25);
        seccionTxt       : String(50);
        loginSap         : String(30);
        oMaestraNivel    : String(100);
        clave            : String(255);
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO_SISTEMA : auditoriaBase {
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
    key oSistema : Association to MIF_ADMIN_HDI_SISTEMA;
}

@cds.persistence.exists
entity MIF_ADMIN_HDI_USUARIO_ROL : auditoriaBase {
    key oUsuario : Association to MIF_ADMIN_HDI_USUARIO;
    key oRol     : Association to MIF_ADMIN_HDI_ROL;
        codigo   : String(20);
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

entity MD_DESTINATARIOS : auditoriaBase {
    key idMdDestinatarios : String(36);
        tipo              : String(10);
        usuarioId         : Association to MIF_ADMIN_HDI_USUARIO;
        mdId              : Association to MD;
}

entity MD_ESTATUSPROCESO : auditoriaBase {
    key idProceso       : String(36);
        mdId            : Association to MD;
        mensajeDT       : String(1000);
        observacion     : String(5000);
        tipo            : String(20);
        estadoIdProceso : Association to MIF_ADMIN_HDI_MAESTRA;
}

entity MD_TRAZABILIDAD : auditoriaBase {
    key idTrazabilidad : String(36);
        mdId           : Association to MD;
        estadoTrazab   : Association to MIF_ADMIN_HDI_MAESTRA;
}

// Entidad temporal que reemplaza los datos faltantes de ABAP - AM
entity ABAP_ORDEN : auditoriaBase {
    key ordenId     : String(36);
        ordenSAP    : Integer;
        etapa       : String(36);
        centro      : String(10);
        productoId  : String(36);
        vte         : String(10);
        descripcion : String(150);
        lote        : String(20);
        expira      : DateTime;
        estadoIdOP  : String(2);
}

entity ABAP_USUARIO : auditoriaBase {
    key UsuarioId : String(36);
        codigo    : String(10);
        nombre    : String(150);
}

entity RMD:auditoriaBase
{
    key rmdId           :   String(36);
    fraccion            :   Integer;
    codigo              :   String(10);
    ordenSAP            :   Integer64;
    centro              :   String(10);
    etapa               :   String(36);
    vte                 :   String(10);
    productoId          :   String(36);
    descripcion         :   String(150);
    lote                :   String(20);
    expira              :   DateTime;
    estadoIdOP          :   String(2);
    mdId                :   Association to MD;
    estadoIdRmd         :   Association to MIF_ADMIN_HDI_MAESTRA;
    aUsuarioRmd         :   Composition of many RMD_USUARIO on aUsuarioRmd.rmdId = $self;
    fechaInicio         :   DateTime;
    fechaCierre         :   DateTime;
    aEstructura         :   Composition of many RMD_ESTRUCTURA on aEstructura.rmdId = $self;
    areaRmd             :   String(25);
    areaRmdTxt          :   String(50);
    aNotasImportantes   :   Composition of many RMD_OBSERVACION on aNotasImportantes.rmdId = $self;
    aReceta             :   Composition of many RMD_RECETA on aReceta.rmdId = $self;
    bFlagInitial        :   Boolean;
    fechaInicioRegistro :   DateTime;
    fechaFinRegistro    :   DateTime;
    fechaHabilita       :   DateTime;
    usuarioHabilita     :   String(100);
    // Datos de la Orden que no se habian mapeado
    dauart              :   String(4);
    lgort               :   String(4);
    posnr               :   String(4);
    stats               :   String(20);
    verid               :   String(4);
    vfdat               :   DateTime;
    vfmng               :   Decimal(13,3);
    Sbmng               :   Decimal(13,3);
    Sbmeh               :   String(3);
    Amein               :   String(3);
    Psmng               :   Decimal(13,3);
    Umrez1              :   Integer;
    Umrez2              :   Integer;
    isClose             :   Boolean;
    loteAnt             :   String(30);
    loteProv            :   String(30);
}
entity RMD_USUARIO : auditoriaBase {
    key rmdUsuarioId : String(36);
        rmdId        : Association to RMD;
        fraccion     : Integer;
        usuarioId    : Association to MIF_ADMIN_HDI_USUARIO;
        codigo       : String(100);
        nombre       : String(150);
        rol          : String(20);
        bReemplazo   : Boolean;
}

@cds.persistence.skip
entity RMD_ESTRUCTURA_SKIP : auditoriaBase {
    key Id              : String(36);
        aEstructura     : Composition of many RMD_ESTRUCTURA;
        aPaso           : Composition of many RMD_ES_PASO;
        aEquipo         : Composition of many RMD_ES_EQUIPO;
        aUtensilio      : Composition of many RMD_ES_UTENSILIO;
        aEspecificacion : Composition of many RMD_ES_ESPECIFICACION;
        aReceta         : Composition of many RMD_RECETA;
        aInsumo         : Composition of many RMD_ES_RE_INSUMO;
        aEtiqueta       : Composition of many RMD_ES_ETIQUETA;
        aPasoInsumoPaso : Composition of many RMD_ES_PASO_INSUMO_PASO;
}

entity RMD_ESTRUCTURA : auditoriaBase {
    key rmdEstructuraId : String(36);
        fraccion        : Integer;
        rmdId           : Association to RMD;
        estructuraId    : Association to ESTRUCTURA;
        orden           : Integer;
        aPaso           : Composition of many RMD_ES_PASO
                              on aPaso.rmdEstructuraId = $self;
        aEquipo         : Composition of many RMD_ES_EQUIPO
                              on aEquipo.rmdEstructuraId = $self;
        aUtensilio      : Composition of many RMD_ES_UTENSILIO
                              on aUtensilio.rmdEstructuraId = $self;
        aEspecificacion : Composition of many RMD_ES_ESPECIFICACION
                              on aEspecificacion.rmdEstructuraId = $self;
        aInsumo         : Composition of many RMD_ES_RE_INSUMO
                              on aInsumo.rmdEstructuraId = $self;
        aEtiqueta       : Composition of many RMD_ES_ETIQUETA
                              on aEtiqueta.rmdEstructuraId = $self;
        aPasoInsumoPaso : Composition of many RMD_ES_PASO_INSUMO_PASO
                              on aPasoInsumoPaso.rmdEstructuraId = $self;
}

entity RMD_ES_ETIQUETA : auditoriaBase {
    key rmdEsEtiquetaId : String(36);
        rmdEstructuraId : Association to RMD_ESTRUCTURA;
        rmdId           : Association to RMD;
        etiquetaId      : Association to ETIQUETA;
        fraccion        : Integer;
        orden           : Integer;
        conforme        : Boolean;
        procesoMenor    : Boolean;
        vistoBueno      : Boolean;
        vistoBuenoId    : Association to RMD_USUARIO;
        aplica          : Boolean;
}

entity RMD_ES_PASO:auditoriaBase {
    key rmdEstructuraPasoId  : String(36);
    rmdEstructuraId          : Association to RMD_ESTRUCTURA;
    pasoId                   : Association to PASO;
    tipoDatoId               : Association to MIF_ADMIN_HDI_MAESTRA;
    rmdId                    : Association to RMD;
    fraccion                 : Integer;
    orden                    : Integer;
    valorInicial             : Decimal(16, 6);
    valorFinal               : Decimal(16, 6);
    margen                   : Decimal(16, 6);
    decimales                : Integer;
    mdEstructuraPasoIdDepende: String(36);
    depende                  : String(36);
    dependeRmdEstructuraPasoId : String(36);
    estadoCC                 : Boolean;
    estadoMov                : Boolean;
    pmop                     : Boolean;
    genpp                    : Boolean;
    tab                      : Boolean;
    edit                     : Boolean;
    rpor                     : Boolean;
    vb                       : Boolean;
    formato                  : Boolean;
    imagen                   : Boolean;
    colorHex                 : String(20);
    colorRgb                 : String(20);
    puestoTrabajo            : String(30);
    clvModelo                : String(20); //registro de la clave-modelo oData NECESIDADES
    automatico               : Boolean;
    imagenRuta               : String(250);
    flagEditado              : Boolean;
    flagEditado2             : Boolean;
    contModif                : Integer;
    //INGRESO USUARIO
    texto                    : String(200);
    cantidad                 : Decimal(16, 5);
    fecha                    : Date;
    hora                     : Time;
    fechaHora                : DateTime;
    vistoBueno               : Boolean;
    vistoBuenoId             : Association to RMD_USUARIO;
    realizadoPor             : Boolean;
    realizadoPorUser         : String;
    verifCheck               : Boolean;
    verifCheckId             : Association to RMD_USUARIO;
    multiCheck               : Boolean;
    multiCheckUser           : String;
    rango                    : Decimal(16, 5);
    datoFijo                 : String(200);
    formula                  : Decimal(16, 5);
    aplica                   : Boolean;
    styleUser                : String(25);
    firstFechaActualiza      : DateTime;
    imagenWidth              : Integer;
    imagenPosition           : Integer;
    bReemplazo               : Boolean; 
}

entity RMD_ES_EQUIPO : auditoriaBase {
    key rmdEstructuraEquipoId    : String(36);
        rmdEstructuraId          : Association to RMD_ESTRUCTURA;
        equipoId                 : Association to EQUIPO;
        orden                    : Integer;
        rmdId                    : Association to RMD;
        fraccion                 : Integer;
        //INGRESO USUARIO
        texto                    : String(200);
        cantidad                 : Decimal(16, 6);
        fecha                    : Date;
        hora                     : Time;
        fechaHora                : DateTime;
        vistoBueno               : Boolean;
        vistoBuenoId             : Association to RMD_USUARIO;
        realizadoPor             : Boolean;
        verifCheck               : Boolean;
        verifCheckId             : Association to RMD_USUARIO;
        multiCheck               : Boolean;
        rangoto                  : Decimal(16, 6);
        rangoFrom                : Decimal(16, 6);
        datoFijo                 : String(200);
        formula                  : Decimal(16, 6);
        aplica                   : Boolean;
        firstFechaActualiza      : DateTime;
        styleUser                : String(25);
        flagEditado              : Boolean;
        flagRegistro             : Boolean;
}
//cheking
entity RMD_TABLA_CONTROL : auditoriaBase {
    key rmdControlRechazo       : String(36);
        rmdId                   : Association to RMD;
        fraccion                : Integer;
        orden                   : Integer64;
        operacion               : String(25);
        puestoTrabajo           : String(30);
        clvModelo               : String(20);
        cantBuena               : Decimal(16, 6);
        cantRechazo             : Decimal(16, 6);
        motivoDesv              : String(50);
        fase                    : String(15);
        Rmzhl                   : String(20);
        Rueck                   : String(20);
        ConfText                : String(40);
        rol                     : String(50);
        styleUser               : String(25);
        anio                    : String(4);
        correlativoMuestra      : String(10);
        centro                  : String(4);
        impresion               : Integer;
        reimpresion             : Integer;
        fechaImpresion          : DateTime;
        fechaReimpresion        : DateTime;
        ConfTextAnulac          : String(40);
        Steus                   : String(10);
}

entity RMD_VERIFICACION_FIRMAS : auditoriaBase {
    key rmdFirmaVerif           : String(36);
        fraccion                : Integer;
        rmdId                   : Association to RMD;
        rol                     : String(25);
        usuarioId               : Association to MIF_ADMIN_HDI_USUARIO;
        usuarioSap              : String(36);
        bReemplazo              : Boolean;
        apellidoPaterno         : String(150);
        apellidoMaterno         : String(150);
        correo                  : String(150);
        usuario                 : String(20);
        nombre                  : String(150);
}

entity RMD_MOTIVO_EDIT_CIERRE_LAPSO : auditoriaBase {
    key rmdMotivoCierre         : String(36);
        fraccion                : Integer;
        rmdId                   : Association to RMD;
        rmdLapsoId              : Association to RMD_LAPSO;
        motivoEdit              : String(1000);
}

entity RMD_ES_UTENSILIO : auditoriaBase {
    key rmdEstructuraUtensilioId : String(36);
        rmdEstructuraId          : Association to RMD_ESTRUCTURA;
        utensilioId              : Association to UTENSILIO;
        rmdId                    : Association to RMD;
        orden                    : Integer;
        fraccion                 : Integer;
        //INGRESO USUARIO
        texto                    : String(200);
        cantidad                 : Decimal(16, 6);
        fecha                    : Date;
        hora                     : Time;
        fechaHora                : DateTime;
        vistoBueno               : Boolean;
        vistoBuenoId             : Association to RMD_USUARIO;
        realizadoPor             : Boolean;
        verifCheck               : Boolean;
        verifCheckId             : Association to RMD_USUARIO;
        multiCheck               : Boolean;
        rango                    : Decimal(16, 6);
        datoFijo                 : String(200);
        formula                  : Decimal(16, 6);
        aplica                   : Boolean;
        agrupadorId              : Association to UTENSILIO_CLASIFICACION;
        firstFechaActualiza      : DateTime;
        styleUser                : String(25);
        flagEditado              : Boolean;
        flagRegistro             : Boolean;
}

entity RMD_ES_PASO_USUARIO : auditoriaBase {
    key rmdPasoUsuarioId         : String(36);
        rmdEstructuraPasoId      : Association to RMD_ES_PASO;
        rmdEstructuraEquipoId    : Association to RMD_ES_EQUIPO;
        rmdEstructuraUtensilioId : Association to RMD_ES_UTENSILIO;
        rmdUsuarioId             : Association to RMD_USUARIO;
}

entity RMD_OBSERVACION:auditoriaBase {
    key rmdObservacionId     : String(36);
    rmdId                    : Association to RMD;
    mdId                     : Association to MD;
    rmdEstructuraPasoId      : Association to RMD_ES_PASO;
    rmdEstructuraEquipoId    : Association to RMD_ES_EQUIPO;
    rmdEstructuraUtensilioId : Association to RMD_ES_UTENSILIO;
    nombre                   : String(59);
    apellido                 : String(59);
    observacion              : String(1500);
    tipo                     : String(15);
    VB                       : Boolean;
    fraccion                 : Integer;
}

entity RMD_LAPSO:auditoriaBase {
    key rmdLapsoId           : String(36);
    rmdId                    : Association to RMD;
    tipoLapsoId              : Association to MOTIVO_LAPSO;
    comentario               : String(1000);
    fraccion                 : Integer;
    Anular                   : Boolean;
    equipoId                 : Association to EQUIPO;
    fechaInicio              : DateTime;
    fechaFin                 : DateTime;
    descripcion              : String(1000);
    tipoDatoId               : String(5);
    automatico               : Boolean;
    pasoId                   : Association to MD_ES_PASO;
    pasoIdFin                : Association to MD_ES_PASO;
    notifFinal               : Boolean;
    tipo                     : String(20);
    Qmnum                    : String(12);
    equipoPrincipal          : String(36);
    bAfectado                : Boolean;
    aListCatalogFalla        : Composition of many RMD_LAPSO_CATALOGO_FALLA on aListCatalogFalla.rmdLapsoId = $self;
}

entity RMD_LAPSO_CATALOGO_FALLA : auditoriaBase {
    key rmdLapsoCatalogoFalla : String(36);
    rmdId                     : Association to RMD;
    fraccion                  : Integer;
    rmdLapsoId                : Association to RMD_LAPSO;
    tipo                      : String(10);
    Qmnum                     : String(12);
    Qmart                     : String(2);
    Equnr                     : String(18);
    CatType                   : String(1);
    CodeGroup                 : String(8);
    Code                      : String(4);
    Version                   : String(6);
    Valid                     : DateTime;
    Langu                     : String(2);
    Shorttxtgr                : String(40);
    Shorttxtcd                : String(40);
    Texto                     : String(40);
}

entity RMD_ES_ESPECIFICACION : auditoriaBase {
    key rmdEstructuraEspecificacionId   : String(36);
        rmdEstructuraId                 : Association to RMD_ESTRUCTURA;
        rmdId                           : Association to RMD;
        orden                           : Integer;
        fraccion                        : Integer;
        //INGRESO USUARIO
        texto                           : String(200);
        cantidad                        : Decimal(16, 6);
        fecha                           : Date;
        hora                            : Time;
        fechaHora                       : DateTime;
        vistoBueno                      : Boolean;
        vistoBuenoId                    : Association to RMD_USUARIO;
        realizadoPor                    : Boolean;
        verifCheck                      : Boolean;
        verifCheckId                    : Association to RMD_USUARIO;
        multiCheck                      : Boolean;
        rangoto                         : Decimal(16, 6);
        rangoFrom                       : Decimal(16, 6);
        datoFijo                        : String(200);
        formula                         : Decimal(16, 6);
        aplica                          : Boolean;
        
        ensayoPadreId                   : Association to MIF_ADMIN_HDI_MAESTRA;
        ensayoPadreSAP                  : String(150);
        ensayoHijo                      : String(150);
        especificacion                  : String(500);
        tipoDatoId                      : Association to MIF_ADMIN_HDI_MAESTRA;
        valorInicial                    : Decimal(16, 6);
        valorFinal                      : Decimal(16, 6);
        margen                          : Decimal(16, 6);
        decimales                       : Integer;
        resultados                      : String(200);
        firstFechaActualiza             : DateTime;
        styleUser                       : String(25);
        flagEditado                     : Boolean;
        Merknr                          : String(4);
}

entity RMD_ES_RE_INSUMO : auditoriaBase {
    key rmdEstructuraRecetaInsumoId : String(36);
        rmdId                       : Association to RMD;
        rmdEstructuraId             : Association to RMD_ESTRUCTURA;
        rmdRecetaId                 : Association to RMD_RECETA;
        fraccion                    : Integer;
        codigo                      : String(10);
        descripcion                 : String(150);
        cantidadReceta              : Decimal(16, 6);
        cantidadRm                  : Decimal(16, 6);
        um                          : String(10);
        orden                       : Integer;
        sustituto                   : Boolean;
        numeroBultos                : Integer;
        verifCheck                  : Boolean;
        verifCheckId                : Association to RMD_USUARIO;
        cantidadBarCode             : Decimal(16, 6);
        Matnr                       : String(40); //Material
        Werks                       : String(4); //Centro
        Maktx                       : String(120); //Denominación
        ItemCateg                   : String(1); //Tipo Posición
        ItemNo                      : String(4); //Posición
        Component                   : String(40); //Componente
        CompQty                     : String(18); //Cantidad
        CompUnit                    : String(3); //UM Componente
        ItemText1                   : String(40); //Texto Posicion
        ItemText2                   : String(40); //Texto Posicion
        Txtadic                     : String(100); //Texto Adicional
        firstFechaActualiza         : DateTime;
        styleUser                   : String(25);
        flagEditado                 : Boolean;
        usuarioVerificador          : String(20);
        enabledCheck                : Boolean;
        cantidadOP                  : Decimal(16, 6);
        adicional                   : Boolean;
        visibleInsumo               : Boolean;
        ifa                         : Boolean;
        Mtart                       : String(6); //Tipo de Material
        umb                         : String(10);
        Charg                       : String(15); //Lote
        AiPrio                      : String(2); //Orden jerarquía
}

entity RMD_RECETA : auditoriaBase {
    key rmdRecetaId : String(36);
        rmdId       : Association to RMD;
        recetaId    : Association to RECETA;
        fraccion    : Integer;
        orden       : Integer;
        ordenSAP    : Integer64;
        aInsumo     : Composition of many RMD_ES_RE_INSUMO
                        on aInsumo.rmdRecetaId = $self;
}

//for delete
entity RECETA_RMD : auditoriaBase {
    key recetaId    : String(36);
        codigo      : String;
        descripcion : String(150);
        etapa       : String(5);
        variante    : String(10);
        estadoId    : Association to MIF_ADMIN_HDI_MAESTRA;
}

entity RMD_ES_PASO_INSUMO_PASO : auditoriaBase {
    key rmdEstructuraPasoInsumoPasoId   : String(36);
    rmdEstructuraId                     : Association to RMD_ESTRUCTURA;
    rmdId                               : Association to RMD;
    pasoId                              : Association to RMD_ES_PASO;
    pasoHijoId                          : Association to PASO;
    tipoDatoId                          : Association to MIF_ADMIN_HDI_MAESTRA;
    rmdEstructuraRecetaInsumoId         : Association to RMD_ES_RE_INSUMO;
    etiquetaId                          : Association to ETIQUETA;
    mdEstructuraPasoInsumoPasoIdAct     : String(36);
    fraccion                            : Integer;
    orden                               : Integer;
    valorInicial                        : Decimal(16, 6);
    valorFinal                          : Decimal(16, 6);
    margen                              : Decimal(16, 6);
    cantidadInsumo                      : Decimal(16, 6);
    decimales                           : Integer;
    estadoCC                            : Boolean;
    estadoMov                           : Boolean;
    genpp                               : Boolean;
    edit                                : Boolean;
    tab                                 : Boolean;
    vistoBueno                          : Boolean;
    vistoBuenoPaso                      : Boolean;
    vistoBuenoId                        : Association to RMD_USUARIO;
    aplica                              : Boolean;
    formato                             : Boolean;
    colorHex                            : String(20);
    colorRgb                            : String(20);
    firstFechaActualiza                 : DateTime;
    styleUser                           : String(25);
    flagEditado                         : Boolean;
    flagEditado2                        : Boolean;
    contModif                           : Integer;
    texto                               : String(200);
    cantidad                            : Decimal(16, 5);
    fecha                               : Date;
    hora                                : Time;
    fechaHora                           : DateTime;
    realizadoPor                        : Boolean;
    realizadoPorUser                    : String;
    verifCheck                          : Boolean;
    verifCheckId                        : Association to RMD_USUARIO;
    multiCheck                          : Boolean;
    multiCheckUser                      : String;
    rango                               : Decimal(16, 5);
    datoFijo                            : String(200);
    formula                             : Decimal(16, 5);
    Component                           : String(40); //Componente
    Matnr                               : String(40); //Material    *****
    Maktx                               : String(120); //Denominación  *****
    CompUnit                            : String(3); //UM Componente *****
    bReemplazo                          : Boolean;
};

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
        oSistema     : Association to MIF_ADMIN_HDI_SISTEMA;
};

@cds.persistence.exists
entity MIF_ADMIN_HDI_ROL_APP_ACCIONES : auditoriaBase {
    key oRol           : Association to MIF_ADMIN_HDI_ROL;
    key oAplicacion    : Association to MIF_ADMIN_HDI_APLICACION;
    key oMaestraAccion : Association to MIF_ADMIN_HDI_MAESTRA;
};

// Tabla de asociacion de un paso o un insumo a un paso de una Etiqueta de una estructura de un MD.
entity MD_ES_PASO_INSUMO_PASO : auditoriaBase {
    key mdEstructuraPasoInsumoPasoId    : String(36);
        mdEstructuraId                  : Association to MD_ESTRUCTURA;
        estructuraId                    : Association to ESTRUCTURA; // eliminar 
        mdId                            : Association to MD;
        pasoId                          : Association to MD_ES_PASO;
        pasoHijoId                      : Association to PASO;
        tipoDatoId                      : Association to MIF_ADMIN_HDI_MAESTRA;
        estructuraRecetaInsumoId        : Association to MD_ES_RE_INSUMO;
        etiquetaId                      : Association to ETIQUETA; // eliminar 
        mdEsEtiquetaId                  : Association to MD_ES_ETIQUETA;
        mdEstructuraPasoInsumoPasoIdAct : String(36);
        orden                           : Integer;
        valorInicial                    : Decimal(16, 6);
        valorFinal                      : Decimal(16, 6);
        margen                          : Decimal(16, 6);
        cantidadInsumo                  : Decimal(16, 6);
        decimales                       : Integer;
        estadoCC                        : Boolean;
        estadoMov                       : Boolean;
        genpp                           : Boolean;
        edit                            : Boolean;
        tab                             : Boolean;
        formato                         : Boolean;
        colorHex                        : String(20);
        colorRgb                        : String(20);
        flagModif                       : Boolean;
        Component                       : String(40); //Componente
        Matnr                           : String(40); //Material    *****
        Maktx                           : String(120); //Denominación  *****
        CompUnit                        : String(3); //UM Componente *****
        tipoDatoIdAnterior              : Association to MIF_ADMIN_HDI_MAESTRA;
        aFormula                        : Composition of many MD_ES_FORMULA_PASO
                                            on aFormula.mdEstructuraPasoInsumoPasoId = $self;
}

entity RMD_ES_HISTORIAL : auditoriaBase {
    key rmdHistorialId              : String(36);
    rmdEstructuraPasoId      	    : Association to RMD_ES_PASO;
    rmdEstructuraEquipoId    	    : Association to RMD_ES_EQUIPO;
    rmdEstructuraUtensilioId 	    : Association to RMD_ES_UTENSILIO;
    rmdEstructuraEspecificacionId   : Association to RMD_ES_ESPECIFICACION;
    rmdEstructuraRecetaInsumoId 	: Association to RMD_ES_RE_INSUMO;
    rmdEstructuraPasoInsumoPasoId   : Association to RMD_ES_PASO_INSUMO_PASO;
    descripcionItem                 : String(1000);
    descripcion                     : String(1000);
    tipoDatoId                      : Association to MIF_ADMIN_HDI_MAESTRA;
    valor                           : String(200);
    motivoModif                     : String(1000);
    rol                             : String(40);
};

entity MD_ES_FORMULA_PASO : auditoriaBase {
    key mdFormulaPaso                   : String(36);
        pasoPadreId                     : Association to MD_ES_PASO;
        mdEstructuraPasoInsumoPasoId    : Association to MD_ES_PASO_INSUMO_PASO;
        esPaso                          : Boolean;
        pasoFormulaId                   : Association to MD_ES_PASO;
        pasoFormulaIdPM                 : Association to MD_ES_PASO_INSUMO_PASO;
        bFlagPM                         : Boolean;
        valor                           : String(15);
        orden                           : Integer;
        mdId                            : Association to MD;
};

entity UTENSILIO_CLASIFICACION : auditoriaBase {
    key clasificacionUtensilioId        : String(36);
    descripcion                         : String(50);
};

@cds.persistence.skip
entity TABLAS_ARRAY_MD_SKIP:auditoriaBase
{
    key id               : String(36);
    aEquipo              : Composition of many EQUIPO;
    aReceta              : Composition of many RECETA;
    aPasoMd              : Composition of many MD_ES_PASO;
    aEspecificacionMd    : Composition of many MD_ES_ESPECIFICACION;
    aEtiquetaMd          : Composition of many MD_ES_ETIQUETA;
    aMdReceta            : Composition of many MD_RECETA;
    aEtiquetasControl    : Composition of many ETIQUETAS_CONTROL;
    aFormula             : Composition of many MD_ES_FORMULA_PASO;
};

entity ETIQUETAS_CONTROL : auditoriaBase {
    key etiquetasControlId : String(36);
        enlace             : Boolean;
        orden              : Integer64;
        secuencia          : Integer;
        cantidadUnidad     : Integer;
        cantidadOrden      : Decimal(13,3);
        impresion          : Integer;
        reimpresion        : Integer;
        fechaImpresion     : DateTime;
        fechaReimpresion   : DateTime;
        hu                 : String(20);
        observacion        : String(500);
        tipo               : String(20);
        ean                : String(18);
        um                 : String(3);
        Venum              : String(10);
        objeto             : String(20);
        estadoEtiqueta     : Association to MIF_ADMIN_HDI_MAESTRA;
        Exidv              : String(20);
        Matnr              : String(40);
        Charg              : String(10);
        Umrez              : Decimal(5,0);
        Resu1              : Decimal(15,3);
        Altme              : String(3);
        fraccion           : Integer;
        Maktx              : String(50);
        Vfdat              : DateTime;
        tolerancia         : String(10);
        teorico            : String(20);
};

@cds.persistence.exists
//# ---------------- ATENCION DE PEDIDOS -----------------------
entity MIF_CP_PEDIDO : auditoriaBase {
    key pedidoId            : String(36);
        numPedido           : String(15); //Numero de pedido
        oTipoPedidoDetalle  : Association to one MIF_CP_TIPO_PEDIDO_DETALLE;
        centro              : String(36);
        pickingUsuInic      : String(36);
        pickingFecInic      : DateTime;
        pickingUsuFin       : String(36);
        pickingFecFin       : DateTime;
        pesajeUsuInic       : String(36);
        pesajeFecInic       : DateTime;
        pesajeUsuFin        : String(36);
        pesajeFecFin        : DateTime;
        verificacionUsuInic : String(36);
        verificacionFecInic : DateTime;
        verificacionUsuFin  : String(36);
        verificacionFecFin  : DateTime;
}

@cds.persistence.exists
entity MIF_CP_PEDIDO_ORDEN : auditoriaBase {
    key oPedido : Association to one MIF_CP_PEDIDO;
    key oOrden  : Association to one MIF_CP_ORDEN;
}

@cds.persistence.exists
entity MIF_CP_ORDEN : auditoriaBase {
    key ordenId          : String(36);
        reservaNum       : String(10); //Numero de reserva
        numero           : String(15);
        lote             : String(15);
        fechaVencimiento : DateTime;
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


@cds.persistence.exists
entity MIF_CP_ORDEN_DETALLE : auditoriaBase {
    key ordenDetalleId       : String(36);
        oEstado              : Association to one MIF_ADMIN_HDI_MAESTRA;
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
        oOrdenFraccion       : Association to one MIF_CP_ORDEN_FRACCION;
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
        resetear             : String(1); //Indicador si se requiere reembalaje
}

@cds.persistence.exists
entity MIF_CP_PLANTILLA_IMPRESION : auditoriaBase {
    key plantillaImpresionId : String(36);
        descripcion          : String(255);
        nombre               : String(255);
        contenido            : LargeString;
}

@cds.persistence.exists
entity MIF_CP_IMPRESORA : auditoriaBase {
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

@cds.persistence.exists
entity MIF_CP_COLA_IMPRESION_VARIABLES : auditoriaBase {
    key colaImpresionVariableId : String(36);
        oColaImpresion          : Association to one MIF_CP_COLA_IMPRESION;
        codigo                  : String(255);
        valor                   : String(255);
}

@cds.persistence.exists
entity MIF_CP_COLA_IMPRESION : auditoriaBase {
    key colaImpresionId : String(36);
        descripcion     : String(255);
        enviados        : Boolean;
        copias          : Integer;
        oImpresora      : Association to one MIF_CP_IMPRESORA;
        oPlantilla      : Association to one MIF_CP_PLANTILLA_IMPRESION;
        aVariables      : Composition of many MIF_CP_COLA_IMPRESION_VARIABLES
                              on aVariables.oColaImpresion = $self;
}

entity ORDEN_OFFLINE : auditoriaBase {
    key registroId      : String(36);
        orden           : Integer;
        correoUsuario   : String(100);
}

@cds.persistence.exists
entity MIF_CP_ORDEN_FRACCION : auditoriaBase {
    key ordenFraccionId     : String(36);
        oEstado             : Association to one MIF_ADMIN_HDI_MAESTRA;
        oOrden              : Association to one MIF_CP_ORDEN;
        ordenPos            : String(4);
        numFraccion         : Integer;
        reservaNum          : String(10); //Numero de reserva
        aOrdenDetalle       : Composition of many MIF_CP_ORDEN_DETALLE
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

@cds.persistence.exists
entity MIF_CP_TIPO_PEDIDO : auditoriaBase {
    key tpedidoId          : String(36);
        codigo             : String(10);
        nombre             : String(50);
        aTipoPedidoDetalle : Association to many MIF_CP_TIPO_PEDIDO_DETALLE
                                 on aTipoPedidoDetalle.oTipoPedido = $self;
}

@cds.persistence.exists
entity MIF_CP_TIPO_PEDIDO_DETALLE : auditoriaBase {
    key tPedidoDetId : String(36);
        codigo       : String(10);
        nombre       : String(50);
        oTipoPedido  : Association to one MIF_CP_TIPO_PEDIDO;
}

// Vista para obtener los datos de los insumos.
define view VIEW_PEDIDO_CONSOLIDADO as
    select from MIF_CP_PEDIDO as PED
    inner join MIF_CP_PEDIDO_ORDEN as POR
        on POR.oPedido.pedidoId = PED.pedidoId
    inner join MIF_CP_ORDEN as ORD
        on ORD.ordenId = POR.oOrden.ordenId
    inner join MIF_CP_ORDEN_FRACCION as OFR
        on OFR.oOrden.ordenId = ORD.ordenId
    inner join MIF_CP_ORDEN_DETALLE as OIN
        on OIN.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
    {
        /**
         * PEDIDO
         */
        key PED.pedidoId                          as pedidoId,
        PED.numPedido                             as pedidoNumero,
        PED.oTipoPedidoDetalle.codigo             as PedidoTipoDC,
        PED.centro                                as PedidoCentro,
        PED.fechaRegistro                         as pedidoFecha,
        /**
         * ORDEN
         */
        key ORD.ordenId                           as ordenId,
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
        key OFR.ordenFraccionId                   as ordenFraccionId,
        /**
         * INSUMO/MATERIAL/ARTICULO
         */
        key OIN.ordenDetalleId                    as ordenDetalleId,
        OIN.numSubFraccion                        as numSubFraccion,
        OIN.reservaNum                            as reservaNum,
        OIN.reservaPos                            as reservaPos,
        OIN.codigoInsumo                          as insumoCodigo,
        OIN.descripcion                           as insumoDescrip,
        OIN.lote                                  as insumoLote,
        OIN.oEstado.codigo                        as insumoEstado,
        OIN.estadoTraslado                        as insumoEstadoTraslado,
        OIN.unidad                                as insumoUmb,
        //OIN.fechaVencimiento                      as insumoFechaVencimiento, Fecha vencimiento del insumo
        //OIN.pesadoMaterialPr                      as insumoPesadoMaterialPr, //Indicador si el insumo se pesan en PRODUCCION (IFA)
        OIN.centro                                as insumoCentro,
        OIN.almacen                               as insumoAlmacen,
        OIN.agotar                                as InsumoAgotar,
        OIN.cantSugerida                          as cantSugerida, //Cantidad Sugerida
        // OIN.sugerido                              as cantPedida, //Cantidad Pedida
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

//Destinatarios para correo electronico
define view VIEW_DESTINOS as 
    SELECT FROM MIF_ADMIN_HDI_USUARIO as usu 
        INNER JOIN MIF_ADMIN_HDI_USUARIO_ROL as mahur 
            ON  usu.usuarioId  = mahur.oUsuario.usuarioId
        INNER JOIN MIF_ADMIN_HDI_ROL as rol 
            ON rol.rolId = mahur.oRol.rolId
        {
                key usu.usuarioId,
                usu.correo                             as CORREO,
                rol.codigo                              as ROL
        }
        WHERE rol.codigo = 'RMD_JEFATURA_DOCUMENTACION';

@cds.persistence.exists
entity MIF_ADMIN_HDI_AUDITORIA {
    key id                  : UUID;
        timestamp           : DateTime;
        host                : String(64);
        port                : Integer;
        serviceName         : String(32);
        // connectionId        : Integer;
        clientHost          : String(256);
        clientIp            : String(45);
        // clientPid           : Integer;
        // clientPort          : Integer;
        userName            : String(256);
        applicationName     : String(256);
        eventStatus         : String(32);
        eventLevel          : String(16);
        eventAction         : String(64);
        action              : String(64);
        // schemaName          : String(256);
        // sKey                : String(2000);
        value               : LargeString;
        statementString     : String(5000);
        lang                : String(20);
        device              : String(256);
        so                  : String(256); 
        soVersion           : String(256); 
        browser             : String(256); 
        browserVersion      : String(256);  
        stackError          : LargeString; 
        // originDatabaseName  : String(256);
}