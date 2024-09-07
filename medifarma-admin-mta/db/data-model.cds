namespace mif_admin.hdi;

using {
    User,
    Country,
    managed
} from '@sap/cds/common';

aspect auditoriaBase {
    terminal         : String(100);
    fechaRegistro    : DateTime;
    usuarioRegistro  : String(100) not null;
    fechaActualiza   : DateTime;
    usuarioActualiza : String(100);
    activo           : Boolean not null;
}

entity SISTEMA : auditoriaBase {
    key sistemaId   : UUID;
        codigo      : String(50);
        nombre      : String(50);
        descripcion : String(150);
        aUsuarios   : Association to many USUARIO_SISTEMA on aUsuarios.oSistema = $self;
}

entity APLICACION : auditoriaBase {
    key aplicacionId : UUID;
        oSistema     : Association to SISTEMA;
        codigo       : String(50);
        nombre       : String(50);
        descripcion  : String(150);
}

entity MAESTRA_TIPO : auditoriaBase {
    key maestraTipoId : Integer;
        tabla         : String(20) not null;
        nombre        : String(50);
        onlyAdmin     : Boolean not null;
};

/*@assert.unique : {
   codigo: [ codigo ]
}*/
entity MAESTRA : auditoriaBase {
    key iMaestraId   : Integer;
        oMaestraTipo : Association to MAESTRA_TIPO;
        contenido    : String(500) not null;
        descripcion  : String(500);
        orden        : Integer not null;
        codigo       : String(50) @mandatory;
        codigoSap    : String(50);
        campo1       : String(20);
        oAplicacion  : Association to APLICACION;
        oSistema     : Association to SISTEMA;

};

entity MAESTRA_TIPO_ASSOC : auditoriaBase {
    key oMaestra     : Association to MAESTRA;
    key oMaestraTipo : Association to MAESTRA_TIPO;
};

entity ROL : auditoriaBase {
    key rolId        : UUID;
        oSistema     : Association to SISTEMA;
        codigo       : String(50);
        nombre       : String(50);
        descripcion  : String(150);
        aRolUsuarios : Composition of many USUARIO_ROL
                           on aRolUsuarios.oRol = $self;
};
entity SECCION : auditoriaBase {
    key seccionId   : UUID;
        codigo      : String(50);
        descripcion : String(150);
};

@assert.unique : {
   usuario: [ usuario ]
}
entity USUARIO : auditoriaBase {
    key usuarioId           : UUID;
        usuario             : String(12) @mandatory; //Usuario Asignado
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
        oMaestraSucursal    : Association to MAESTRA {
                                  codigo
                              }; // Las Plantas Lima y Ate
        oMaestraNivel       : String(100);   //Association to MAESTRA { codigo } Niveles de Fraccionamiento
        oMaestraTipoUsuario : Association to MAESTRA {
                                  codigo
                              }; // Tipo de Usuario de Fraccionamiento
        aSistemas           : Association to many USUARIO_SISTEMA on aSistemas.oUsuario = $self; //Usuarios por sistema
        aRolUsuarios        : Composition of many USUARIO_ROL
                                  on aRolUsuarios.oUsuario = $self;
        fechaVigInicio      : DateTime;
        fechaVigFin         : DateTime;
};

entity USUARIO_ROL : auditoriaBase {
    key oUsuario : Association to USUARIO;
    key oRol     : Association to ROL;
        codigo   : String(50);
};

entity USUARIO_SISTEMA : auditoriaBase {
    key oUsuario : Association to USUARIO;
    key oSistema : Association to SISTEMA;
};

entity ROL_APP_WF : auditoriaBase {
    key oAplicacion  : Association to APLICACION;
    key oRolWorkflow : Association to ROL;
    key oRol         : Association to ROL;
};

entity ROL_APP_ACCIONES : auditoriaBase {
    key oRol           : Association to ROL;
    key oAplicacion    : Association to APLICACION;
    key oMaestraAccion : Association to MAESTRA;
};

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

entity AUDITORIA {
    key id                  : UUID;
        timestamp           : DateTime;
        host                : String(64);
        port                : Integer;
        serviceName         : String(32);
        //connectionId        : Integer;
        clientHost          : String(256);
        clientIp            : String(45);
        //clientPid           : Integer;
        //clientPort          : Integer;
        userName            : String(256);
        applicationName     : String(256);
        eventStatus         : String(32);
        eventLevel          : String(16);
        eventAction         : String(64);
        action              : String(64);
        //schemaName          : String(556);
        //sKey                : String(2000);
        value               : LargeString;
        statementString     : String(5000);
        lang                : String(20);
        device              : String(256);
        so                  : String(256); 
        soVersion           : String(256); 
        browser             : String(256); 
        browserVersion      : String(256);  
        stackError          : LargeString;  
        //originDatabaseName  : String(256);
}

define view VIEW_ROL_APP_WF as
    select from ROL_APP_WF {
        oAplicacion.aplicacionId       as aplicacionId,
        oAplicacion.oSistema.sistemaId as sistemaId,
        //Rol WF
        oRolWorkflow.rolId             as rolIdWf,
        oRolWorkflow.codigo            as codigoWf,
        oRolWorkflow.nombre            as nombreWf,
        //Rol Padre
        oRol.rolId                     as rolId,
        oRol.codigo                    as codigo,
        oRol.nombre                    as nombre
    };

define view VIEW_ROL_APP_ACCIONES as
    select from ROL_APP_ACCIONES {
        oAplicacion.aplicacionId       as aplicacionId,
        oAplicacion.oSistema.sistemaId as sistemaId,
        oRol.rolId                     as rolId,
        oRol.codigo                    as codigo,
        oRol.nombre                    as nombre,
        oMaestraAccion.iMaestraId      as iMaestraIdAcc,
        oMaestraAccion.codigo          as codigoAcc,
        oMaestraAccion.contenido       as contenidoAcc
    };

define view VIEW_MAESTRA as
    select from MAESTRA {
        iMaestraId                 as iMaestraId,
        codigo                     as codigo,
        contenido                  as contenido,
        descripcion                as descripcion,
        activo                     as activo,
        oMaestraTipo.maestraTipoId as maestraTipoId,
        oMaestraTipo.tabla         as tabla,
        oMaestraTipo.nombre        as nombre
    };

define view VIEW_USUARIO_ROL as
    select from USUARIO_ROL {
        oUsuario.usuarioId as usuarioId,
        oUsuario.usuario   as usuario,
        oUsuario.nombre    as nombre,
        oUsuario.correo    as correo,
        oRol.rolId         as rolId,
        oRol.nombre        as nombreRol,
        activo             as activo
    };

define view VIEW_USER_ROL_APP_ACCION as
    select from ROL_APP_ACCIONES {
        oRol.rolId                           as rolId,
        oRol.codigo                          as rol,
        oAplicacion.codigo                   as aplicacion,
        oAplicacion.oSistema.codigo          as sistema,
        oMaestraAccion.oMaestraTipo.tabla    as grupoAccion,
        oMaestraAccion.codigo                as accion,
        oRol.aRolUsuarios.oUsuario.usuarioId as usuarioId
    }
    where
        activo = true;

define view SEQ_NEXT_MAESTRA_TIPO as
    select from MAESTRA_TIPO {
        max(
            maestraTipoId
        ) + 1 as id: Integer
    };

define view SEQ_NEXT_MAESTRA as
    select from MAESTRA {
        max(
            iMaestraId
        ) + 1 as id: Integer
    };
