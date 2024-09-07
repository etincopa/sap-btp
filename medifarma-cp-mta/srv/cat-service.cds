using {mif.cp as db} from '../db/schema';

@path : '/browse'
service CatalogService 
@(requires : 'authenticated-user') 
{
    entity BALANZA                            as projection on db.BALANZA;
    entity SALA_PESAJE                        as projection on db.SALA_PESAJE;
    entity ORDEN_DETALLE                      as projection on db.ORDEN_DETALLE where activo = true;
    entity ORDEN                              as projection on db.ORDEN where activo = true;
    entity ORDEN_FRACCION                     as projection on db.ORDEN_FRACCION where activo = true;
    entity PROGRAMACION                       as projection on db.PROGRAMACION where activo = true;
    entity GRUPO_ORDEN                        as projection on db.GRUPO_ORDEN where activo = true;
    entity GRUPO_ORDEN_DET                    as projection on db.GRUPO_ORDEN_DET where activo = true;
    entity IMPRESORA                          as projection on db.IMPRESORA where activo = true;
    entity PLANTILLA_IMPRESION                as projection on db.PLANTILLA_IMPRESION where activo = true;
    entity COLA_IMPRESION                     as projection on db.COLA_IMPRESION where activo = true;
    entity COLA_IMPRESION_VARIABLES           as projection on db.COLA_IMPRESION_VARIABLES where activo = true;
    entity GRUPO_ORDEN_BULTO_DET              as projection on db.GRUPO_ORDEN_BULTO_DET;
    entity LOG_DETALLE                        as projection on db.LOG_DETALLE;
    entity GRUPO_ORDEN_CONSOLIDADO            as projection on db.GRUPO_ORDEN_CONSOLIDADO where activo = true;
    entity GRUPO_ORDEN_FRAC                   as projection on db.GRUPO_ORDEN_FRAC where activo = true;
    entity GRUPO_ORDEN_FRAC_DET               as projection on db.GRUPO_ORDEN_FRAC_DET;
    entity GRUPO_ORDEN_CONSOLIDADO_DET        as projection on db.GRUPO_ORDEN_CONSOLIDADO_DET;
    entity GRUPO_ORDEN_BULTO                  as projection on db.GRUPO_ORDEN_BULTO where activo = true;
    entity GRUPO_ORDEN_DET_INSUMO_CONSOLIDADO as projection on db.GRUPO_ORDEN_DET_INSUMO_CONSOLIDADO;
    entity GRUPO_ORDEN_DET_INSUMO             as projection on db.GRUPO_ORDEN_DET_INSUMO;
    /* Entidades para PEDIDOS */
    entity TIPO_PEDIDO                        as projection on db.TIPO_PEDIDO;
    entity TIPO_PEDIDO_DETALLE                as projection on db.TIPO_PEDIDO_DETALLE;
    entity PEDIDO                             as projection on db.PEDIDO;
    entity PEDIDO_USUARIO                     as projection on db.PEDIDO_USUARIO;
    entity PEDIDO_ORDEN                       as projection on db.PEDIDO_ORDEN;
    entity HISTORIAL                          as projection on db.HISTORIAL;
    entity LOG_PROCESS_APP                    as projection on db.LOG_PROCESS_APP;

    @cds.redirection.target : false
    entity VIEW_ORDEN_PROGRAMACION            as projection on db.VIEW_ORDEN_PROGRAMACION;

    @readonly
    entity VIEW_USER_ROL_APP_ACCION           as projection on db.VIEW_USER_ROL_APP_ACCION;

    @readonly
    entity VIEW_PEDIDO_CONSOLIDADO            as projection on db.VIEW_PEDIDO_CONSOLIDADO;

    @readonly
    entity VIEW_PEDIDO_ORDEN_CONSOLIDADO      as projection on db.VIEW_PEDIDO_ORDEN_CONSOLIDADO;

    @readonly
    entity VIEW_SEGUIMIENTO_PEDIDO_CP         as projection on db.VIEW_SEGUIMIENTO_PEDIDO_CP;

    @readonly
    entity VIEW_SEGUIMIENTO_PICKING_CP        as projection on db.VIEW_SEGUIMIENTO_PICKING_CP;

    @readonly
    entity VIEW_SEGUIMIENTO_SALA_CP           as projection on db.VIEW_SEGUIMIENTO_SALA_CP;

    @readonly
    entity VIEW_SEGUIMIENTO_CONSOLIDADO_CP    as projection on db.VIEW_SEGUIMIENTO_CONSOLIDADO_CP;

    @readonly
    entity VIEW_SEGUIMIENTO_TRASLADO_CP       as projection on db.VIEW_SEGUIMIENTO_TRASLADO_CP;

    @readonly
    entity VIEW_SEGUIMIENTO_DETALLE           as projection on db.VIEW_SEGUIMIENTO_DETALLE;

    @readonly
    entity VIEW_PEDIDO_FILTER_CP              as projection on db.VIEW_PEDIDO_FILTER_CP;

    @readonly
    entity VIEW_MAESTRA                       as projection on db.VIEW_MAESTRA;

    //# ------------------------------------------------------------
    //#   CDS EXTERNAL - MIF_ADMIN_HDI
    //# ------------------------------------------------------------

    entity MaestraTipo                        as projection on db.MIF_ADMIN_HDI_MAESTRA_TIPO where activo = true;
    entity Maestra                            as projection on db.MIF_ADMIN_HDI_MAESTRA where activo = true;
    entity Sistema                            as projection on db.MIF_ADMIN_HDI_SISTEMA where activo = true;
    entity Aplicacion                         as projection on db.MIF_ADMIN_HDI_APLICACION where activo = true;
    entity Rol                                as projection on db.MIF_ADMIN_HDI_ROL where activo = true;
    entity RolAppWf                           as projection on db.MIF_ADMIN_HDI_ROL_APP_WF where activo = true;
    entity Usuario                            as projection on db.MIF_ADMIN_HDI_USUARIO where activo = true;
    entity UsuarioRol                         as projection on db.MIF_ADMIN_HDI_USUARIO_ROL where activo = true;


    @cds.redirection.target : false
    entity PLANTA                             as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'PLANTA'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity UNIDAD                             as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'UNIDAD'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity TIPO_USUARIO                       as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'TIPO_USUARIO'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity ESTADO_ORDEN                       as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'ESTADO_CP_ORDEN'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity TIPO_BALANZA                       as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'TIPO_BALANZA'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity PUERTO_COM                         as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'PUERTO_COM'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity MODULO                             as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'MODULO'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity ESTADO_USUARIO                     as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'ESTADO_USUARIO'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity ESTADO_CONSOLIDADO                 as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'ESTADO_CP_INSUMO'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity NIVEL                              as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'NIVEL'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity TIPO_BULTO                         as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'TIPO_BULTO'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity ESTADO_HABILITADO                  as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'ESTADOHAB'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity FACTOR_CONVERSION                  as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'FACTOR_CONVERSION'
    and                                                                            activo                = true;

    @cds.redirection.target : false
    entity CONSTANTES_MAT_EM                  as projection on Maestra as ma where ma.oMaestraTipo.tabla = 'CONSTANTES_MAT_EM'
    and                                                                            ma.oAplicacion.codigo = 'FRAC'
    and                                                                            activo                = true;


    //# ------------------------------------------------------------
    //#   VIEWS
    //# ------------------------------------------------------------
    /**
     * Posibles Errores srv/csn.json:6748: Expected element to have
     * a type (in
     * entity:"CatalogService.GRUPO_ORDEN_ATENCION"/element:"totalIniciada")
     * (STDERR, APP/PROC/WEB)# Este error se debe a que las
     * funciones de SQL como ( AVG, COUNT, DISTINCT, MAX, MIN, SUM)
     * se le debe de asignar un tipo a la propiedad Ejmp:
     * sum(A.campoA) as campoA: Decimal(18, 3)
     */

    @cds.redirection.target : false
    entity GRUPO_ORDEN_ATENCION               as
        select
            G.grupoOrdenId,
            G.oSalaPesaje,
            G.codigo,
            OD.oSala,
            G.fechaActualiza,
            G.fechaRegistro,
            G.usuarioActualiza,
            G.usuarioRegistro,
            sum(1)             as total           : Integer,
            sum(
                (
                    case
                        when //PESANDO EN SALA
                            OFR.oEstado.codigo    = 'PAOPESA'
                            or OFR.oEstado.codigo = 'AMOPESA'
                        then
                            1
                        else
                            0
                    end
                )
            )                  as totalIniciada   : Integer,
            sum(
                (
                    case
                        when //PROGRAMADO EN SALA
                            OFR.oEstado.codigo    = 'PAOPRSA'
                            or OFR.oEstado.codigo = 'AMOPRSA'
                            or OFR.oEstado.codigo = 'PAOPEPE'
                        then
                            1
                        else
                            0
                    end
                )
            )                  as totalPendiente  : Integer,
            sum(
                (
                    case
                        when //FINALIZADO
                            OFR.oEstado.codigo = 'PAOPEFI'
                        then
                            1
                        else
                            0
                    end
                )
            )                  as totalFinalizado : Integer,
            OFR.oOrden.ordenId,
            OFR.ordenFraccionId,
            OFR.oEstado.codigo as ordenFraccionEstado,
            OFR.pesajeFinFec
        from db.GRUPO_ORDEN as G
        left join db.GRUPO_ORDEN_DET as D
            on  D.oGrupoOrden.grupoOrdenId = G.grupoOrdenId
            and D.activo                   = true
        inner join db.ORDEN_FRACCION as OFR
            on OFR.ordenFraccionId = D.oOrdenFraccion.ordenFraccionId
        left join db.ORDEN_DETALLE as OD
            on  OD.oOrdenFraccion.ordenFraccionId = OFR.ordenFraccionId
            and OD.activo                         = true
        where
            G.activo = true
        group by
            G.grupoOrdenId,
            G.codigo,
            OD.oSala.salaPesajeId,
            G.oSalaPesaje.salaPesajeId,
            G.fechaActualiza,
            G.fechaRegistro,
            G.usuarioActualiza,
            G.usuarioRegistro,
            OFR.oOrden.ordenId,
            OFR.ordenFraccionId,
            OFR.oEstado.codigo,
            OFR.pesajeFinFec;

    //# ------------------------------------------------------------
    //#   TYPES
    //# ------------------------------------------------------------
    type oVariablePlantilla {
        codigo : String;
        valor  : String;
    };

    type oColaImpresion {
        impresoraId          : String;
        plantillaImpresionId : String;
        usuario              : String;
        descripcion          : String;
        enviado              : Boolean;
        aVariable            : array of oVariablePlantilla;
    };

    type oResponse {
        code    : String;
        message : String;
        oError  : String;
        aResult : String;
    };

    //# ------------------------------------------------------------
    //#   FUNCTION
    //# ------------------------------------------------------------
    function fnGetErpDinamic(
        entity: String, 
        urlParameters : String, 
        filters : String
    ) returns String;
    
    function grupoOrdenGenerarConsolidado(
        grupoOrdenId : String, 
        usuario : String
    ) returns Boolean;
    
    function grupoOrdenRegenerarConsolidado(
        grupoOrdenId : String, 
        usuario : String
    ) returns Boolean;
    
    function fraccionActualizarCantidad(
        grupoOrdenFraccionamientoId : String, 
        cantidad : Decimal, 
        unidad : String, 
        duplicar : Boolean, 
        usuario : String, 
        ordenDetalleId : String
    ) returns Boolean;
    
    function fnLogin(
        usuario : String, 
        clave : String, 
        app : String
    ) returns String;
    
    function fnResetBultoIFA(
        grupoOrdenBultoId : String
    ) returns String;
    
    function fnValidate(
        auth : String
    ) returns String;
    
    function obtenerBulto(
        pedido : String, 
        orden : String, 
        bulto : String, 
        grupoOrdenFraccionamientoId : String
    ) returns String;

    function obtenerBultosEnteros(
        pedidos : String
    ) returns String;
    
    function fnUpdateOrdenFrac(
        ordenFraccionId : String, 
        pedidoId : String, usuario : String
    ) returns String;

    function fnUpdateCantidadConversion(
        ordenFraccionId : String, 
        grupoOrdenFraccionamientoId : String, 
        usuario : String
    ) returns String;
    
    function fnSetEtiquetaErp(
        Pedido : String,
        Centro : String,
        Orden : String,
        CodigoInsumo : String,
        Lote : String,
        Tipo : String,
        NroItem : String,
        IdBulto : String,
        IdPos : String,
        CantidadA : String,
        Tara : String,
        UnidadM : String,
        Almacen : String,
        Status : String,
        Etiqueta : String,
        UsuarioAte : String,
        Impresion : String,
        Reimpresion : String,
        DocMat : String,
        CantConsumida : String
    ) returns String;

    function fnSendPrintBulto (
        impresoraId : String,
        etiqueta : String, //Si impresion es masivo, delimitar con coma (,) las etiquetas
        usuario : String,
        bSaldo : String, //0: Indicador si la etiqueta es de tipo SALDO | 1: Codigo de balanza
        tipo : String, //Tipo de impresion [AM: Almacen Materiales, CP: Central Pesada]
        idBulto : String //Bulto HU
    ) returns String;

    function fnGetEtiquetasDespacho(
        Orden : String
    ) returns String;
    
    //# ------------------------------------------------------------
    //#   ACTION
    //# ------------------------------------------------------------
    action acPostErpDinamic(
        entity : String, 
        oBody : String
    ) returns String;
    
    action acSetEtiquetaErp(
        oBody : String
    ) returns String;
    
    action acAddColaImpresion(
        aColaImpresion : array of oColaImpresion
    ) returns oResponse;
}