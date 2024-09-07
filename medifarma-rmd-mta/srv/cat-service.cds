using { mif.rmd as db } from '../db/schema';
// using {Z_PP_NECESIDADESRMD_SRV as external} from './external/Z_PP_NECESIDADESRMD_SRV.csn';
@path : '/browse'
service CatalogService 
//@(requires: 'authenticated-user') 
{
    
    entity MAESTRA as projection on db.MIF_ADMIN_HDI_MAESTRA WHERE activo = true AND oSistema.sistemaId = 'd438bc68-cd56-49c9-997d-a99b8055eb5b';
    entity MAESTRA_TIPO as projection on db.MIF_ADMIN_HDI_MAESTRA_TIPO WHERE activo = true;
    entity ESTRUCTURA as projection on db.ESTRUCTURA;
    entity MOTIVO as projection on db.MOTIVO;
    entity ETIQUETA as projection on db.ETIQUETA;
    entity PASO as projection on db.PASO;
    entity RMD_TABLA_CONTROL as projection on db.RMD_TABLA_CONTROL;
    entity RMD_VERIFICACION_FIRMAS as projection on db.RMD_VERIFICACION_FIRMAS;
    entity RMD_MOTIVO_EDIT_CIERRE_LAPSO as projection on db.RMD_MOTIVO_EDIT_CIERRE_LAPSO;
    entity UTENSILIO as projection on db.UTENSILIO;
    entity MOTIVO_LAPSO as projection on db.MOTIVO_LAPSO;
    entity NIVEL as select from MAESTRA as ma WHERE ma.oMaestraTipo.maestraTipoId = 15 AND activo = true;
    entity ESTADOPROCESO as select from MAESTRA as ma WHERE ma.oMaestraTipo.maestraTipoId = 48 AND activo = true;
    entity ESTADORMD as select from MAESTRA as ma WHERE ma.oMaestraTipo.maestraTipoId = 49 AND activo = true;
    entity MD as select from db.MD where activo = true;
    entity MD_ES_PASO as select from db.MD_ES_PASO WHERE activo = true;
    entity MD_ESTRUCTURA as select from db.MD_ESTRUCTURA WHERE activo = true;
    entity MD_ES_EQUIPO as select from db.MD_ES_EQUIPO WHERE activo = true;
    entity MD_ES_UTENSILIO as select from db.MD_ES_UTENSILIO WHERE activo = true;
    entity SISTEMA as projection on db.MIF_ADMIN_HDI_SISTEMA WHERE activo = true;
    entity APLICACION as projection on db.MIF_ADMIN_HDI_APLICACION WHERE activo = true;
    entity ROL as projection on db.MIF_ADMIN_HDI_ROL WHERE activo = true;
    entity ROLAPPWF as projection on db.MIF_ADMIN_HDI_ROL_APP_WF WHERE activo = true;
    entity USUARIOALL as projection on db.MIF_ADMIN_HDI_USUARIO;
    entity USUARIO as select from USUARIOALL WHERE activo = true;
    entity UsuarioRol as projection on db.MIF_ADMIN_HDI_USUARIO_ROL WHERE activo = true;
    function sharepointFunction(spData: String) returns String;
    function sharepointGet(idMd: String) returns String;
    function sharepointDownload(data: String) returns String;
    function sharepointDelete(data: String) returns String;
    entity MD_DESTINATARIOS as projection on db.MD_DESTINATARIOS WHERE activo = true;
    entity RECETA as select from db.RECETA WHERE activo = true;
    entity MD_RECETA as select from db.MD_RECETA WHERE activo = true;
    entity MD_ES_RE_INSUMO as select from db.MD_ES_RE_INSUMO WHERE activo = true;
    entity EQUIPO as select from db.EQUIPO WHERE activo = true;
    entity MD_ES_ETIQUETA as select from db.MD_ES_ETIQUETA WHERE activo = true;
    entity ABAP_ORDEN as select from db.ABAP_ORDEN where activo = true;
    entity RMD as select from db.RMD where activo = true;
    entity RMD_USUARIO as select from db.RMD_USUARIO where activo = true;
    entity ABAP_USUARIO as select from db.ABAP_USUARIO where activo = true;
    function createUsuarioMasivoRmd(spData: String) returns String;
    entity MD_ES_ESPECIFICACION as select from db.MD_ES_ESPECIFICACION where activo = true;
    entity ENSAYO_PADRE as select from db.ENSAYO_PADRE where activo = true;
    entity RMD_ESTRUCTURA as select from db.RMD_ESTRUCTURA where activo = true;
    entity RMD_ES_PASO as select from db.RMD_ES_PASO where activo = true;
    entity RMD_ES_EQUIPO as select from db.RMD_ES_EQUIPO where activo = true;
    entity RMD_ES_ESPECIFICACION as select from db.RMD_ES_ESPECIFICACION where activo = true;
    entity RMD_RECETA as select from db.RMD_RECETA where activo = true;
    entity RECETA_RMD as select from db.RECETA_RMD where activo = true;
    entity RMD_ES_RE_INSUMO as select from db.RMD_ES_RE_INSUMO where activo = true;
    entity RMD_ES_UTENSILIO as select from db.RMD_ES_UTENSILIO where activo = true;
    entity RMD_ES_PASO_USUARIO as select from db.RMD_ES_PASO_USUARIO where activo = true;
    entity RMD_ES_ETIQUETA as select from db.RMD_ES_ETIQUETA WHERE activo = true;
    entity RMD_ES_PASO_INSUMO_PASO as select from db.RMD_ES_PASO_INSUMO_PASO WHERE activo = true;
    entity RMD_ES_HISTORIAL as select from db.RMD_ES_HISTORIAL where activo = true;
    entity RMD_OBSERVACION as select from db.RMD_OBSERVACION where activo = true;
    entity RMD_LAPSO as select from db.RMD_LAPSO where activo = true;
    entity RMD_ESTRUCTURA_SKIP as select from db.RMD_ESTRUCTURA_SKIP;
    function actualizarRmdEsPasoUsuario(rmdEstructuraPasoId : String, sDescriptionPaso : String, aUsuarios: String, sMotivoModif : String) returns Boolean; 
    entity MD_ESTATUSPROCESO as select from db.MD_ESTATUSPROCESO;
    entity RolAppAcciones as projection on db.MIF_ADMIN_HDI_ROL_APP_ACCIONES;
    entity MD_ES_PASO_INSUMO_PASO as select from db.MD_ES_PASO_INSUMO_PASO WHERE activo = true;
    entity MD_TRAZABILIDAD as select from db.MD_TRAZABILIDAD WHERE activo = true;
    entity TABLAS_ARRAY_MD_SKIP as select from db.TABLAS_ARRAY_MD_SKIP;
    function crypto(clave: String,input: String) returns String;
    entity MD_ES_FORMULA_PASO as projection on db.MD_ES_FORMULA_PASO WHERE activo = true;
    entity UTENSILIO_CLASIFICACION as projection on db.UTENSILIO_CLASIFICACION WHERE activo = true;
    entity ETIQUETAS_CONTROL as projection on db.ETIQUETAS_CONTROL WHERE activo = true;
    entity RMD_LAPSO_CATALOGO_FALLA as projection on db.RMD_LAPSO_CATALOGO_FALLA WHERE activo = true;
    entity PLANTILLA_IMPRESION as projection on db.MIF_CP_PLANTILLA_IMPRESION WHERE activo = true;
    entity IMPRESORA as projection on db.MIF_CP_IMPRESORA WHERE activo = true;
    entity COLA_IMPRESION_VARIABLES as projection on db.MIF_CP_COLA_IMPRESION_VARIABLES WHERE activo = true;
    entity COLA_IMPRESION as projection on db.MIF_CP_COLA_IMPRESION WHERE activo = true;
    function obtenerCodigoCorrelativo(sTipo: String) returns String;
    function onUpdateFraction(oData: String) returns String;
    entity MIF_CP_PEDIDO as projection on db.MIF_CP_PEDIDO where activo = true;
    entity MIF_CP_PEDIDO_ORDEN as projection on db.MIF_CP_PEDIDO_ORDEN where activo = true;
    entity MIF_CP_ORDEN as projection on db.MIF_CP_ORDEN where activo = true;
    entity MIF_CP_ORDEN_FRACCION as projection on db.MIF_CP_ORDEN_FRACCION where activo = true;
    entity MIF_CP_ORDEN_DETALLE as projection on db.MIF_CP_ORDEN_DETALLE where activo = true;
    entity ORDEN_OFFLINE as projection on db.ORDEN_OFFLINE where activo = true;
    function getUserApi(sCode: String) returns userData;
    function encriptCrypto(sPassword: String) returns String;
    function createPasosMasivoRmd(spData: String) returns String;
    @readonly
    entity VIEW_PEDIDO_CONSOLIDADO as projection on db.VIEW_PEDIDO_CONSOLIDADO;
    entity CONSTANTES as select from MAESTRA WHERE activo = true AND oSistema.sistemaId = 'd438bc68-cd56-49c9-997d-a99b8055eb5b' AND oMaestraTipo.maestraTipoId = 54;
    entity USUARIO_SISTEMA as projection on db.MIF_ADMIN_HDI_USUARIO_SISTEMA WHERE activo = true;

    @readonly
    entity VIEW_PEDIDO_CONSOLIDADO2 as projection on db.VIEW_PEDIDO_CONSOLIDADO;

    @readonly
    entity VIEW_DESTINATARIOS as projection on db.VIEW_DESTINOS;

    type userData{

        uid                        : String(8);
        first_name                 : String(100);
        last_name                  : String(100);
        mail                       : String(100);
        type                       : String(50);
        name_id                    : String(50);
    }

    entity AUDITORIA as projection on db.MIF_ADMIN_HDI_AUDITORIA;
}
 
