$.context.body = "Se rechazó el RMD: " + $.context.bpRequestData.codigo + " por el " + $.context.rolWF;
$.context.finalizatorName = $.context.NameUserAprob + " " + $.context.LastNameUserAprob;
// $.context.initiatorName = $.context.requestUserData.DISPLAYNAME + " " + $.context.requestUserData.DISPLAYLASTNAME;
$.context.initiatorName = "Sres. Documentación Técnica"
$.context.mail = $.context.requestUserData.EMAIL;
$.context.subject = 'RMD ' + "-[" + $.context.bpRequestData.codigo + "] " + $.context.bpRequestData.descripcion;    