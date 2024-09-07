using {mif_admin.hdi as db} from '../db/data-model';

@(path : '/ADMINISTRADOR_SRV')
service CatalogService
@(requires : 'authenticated-user')
{
    entity Sistema                  as projection on db.SISTEMA;
    entity Aplicacion               as projection on db.APLICACION;
    entity MaestraTipo              as projection on db.MAESTRA_TIPO;

    entity Maestra                  as projection on db.MAESTRA {
        *,
        oMaestraTipo : redirected to MaestraTipo
    };

    entity Rol                      as projection on db.ROL;
    entity RolAppWf                 as projection on db.ROL_APP_WF;
    entity RolUsuario               as projection on db.USUARIO_ROL;

    entity Usuario                  as projection on db.USUARIO {
        *,
        oMaestraSucursal    : redirected to Maestra,
        oMaestraTipoUsuario : redirected to Maestra
    };

    entity UsuarioSistema           as projection on db.USUARIO_SISTEMA;
    entity Seccion                  as projection on db.SECCION;
    entity LOG_DETALLE              as projection on db.LOG_DETALLE;
    entity AUDITORIA                as projection on db.AUDITORIA;

    entity RolAppAcciones           as projection on db.ROL_APP_ACCIONES {
        *,
        oMaestraAccion : redirected to Maestra
    };

    @readonly
    entity SeqMaestra               as projection on db.SEQ_NEXT_MAESTRA;

    @readonly
    entity SeqMaestraTipo           as projection on db.SEQ_NEXT_MAESTRA_TIPO;


    @readonly
    entity ViewMaestra              as projection on db.VIEW_MAESTRA;

    @readonly
    entity ViewRolAppAcciones       as projection on db.VIEW_ROL_APP_ACCIONES;

    @readonly
    entity VIEW_USER_ROL_APP_ACCION as projection on db.VIEW_USER_ROL_APP_ACCION;

    type userScopes {
        identified    : Boolean;
        authenticated : Boolean;
    };

    type user {
        user   : String;
        locale : String;
        scopes : userScopes;
    };

    //# ------------------------------------------------------------
    //#   FUNCTION
    //# ------------------------------------------------------------
    function userInfo() returns user;
    function fnResetPassword(usuarioId : String, correo : String) returns String;
    function fnUserByEmail(emails : String) returns String;

    //# ------------------------------------------------------------
    //#   ACTION
    //# ------------------------------------------------------------

}
