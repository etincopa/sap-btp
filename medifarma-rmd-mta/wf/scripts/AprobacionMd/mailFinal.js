$.context.body = "Se aprobó el RMD: " + $.context.bpRequestData.codigo + ".";
$.context.finalizatorName = $.context.NameUserAprob + " " + $.context.LastNameUserAprob;
$.context.initiatorName = $.context.requestUserData.DISPLAYNAME + " " + $.context.requestUserData.DISPLAYLASTNAME;
$.context.mail = $.context.requestUserData.EMAIL;
$.context.subject = 'RMD ' + "-[" + $.context.bpRequestData.codigo + "] " + $.context.bpRequestData.descripcion;    