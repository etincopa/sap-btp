//$.context.resultPrimerAprob.d.results
var destinatarioList = $.context.MailDest;
var aDestinatario = [];
var aCopia = [];

destinatarioList.map(function (o) {
    if (o.COPIA == 'X') {
        aCopia.push(o.MAILDEST)
    } else {
        aDestinatario.push(o.MAILDEST)
    }
});

$.context.sDestinatario = aDestinatario.join(',');
$.context.sCopia = aCopia.join(',');
