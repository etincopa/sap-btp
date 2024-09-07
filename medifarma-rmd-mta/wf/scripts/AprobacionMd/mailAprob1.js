if($.context.action == "R") {
    $.context.body = "Se volvió a enviar el RMD: " + $.context.bpRequestData.codigo + " para su revisión";
} else {
    $.context.body = "Se envió el RMD: " + $.context.bpRequestData.codigo + " para su revisión";
}
$.context.finalizatorName = $.context.requestUserData.DISPLAYNAME + " " + $.context.requestUserData.DISPLAYLASTNAME;
$.context.initiatorName = "Sres. Jefes de Producción";
$.context.mail = $.context.approverUserData.EMAIL;
$.context.subject = 'RMD ' + "-[" + $.context.bpRequestData.codigo + "] " + $.context.bpRequestData.descripcion;    