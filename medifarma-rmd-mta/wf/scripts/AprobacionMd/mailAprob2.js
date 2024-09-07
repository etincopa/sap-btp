$.context.body = "Se envió el RMD: " + $.context.bpRequestData.codigo + " para su revisión";
$.context.finalizatorName = $.context.NameUserAprob + " " + $.context.LastNameUserAprob;
$.context.initiatorName = "Sres. Gerentes de Producción";
$.context.mail = $.context.approverUserData.EMAIL;
$.context.subject = 'RMD ' + "-[" + $.context.bpRequestData.codigo + "] " + $.context.bpRequestData.descripcion;    