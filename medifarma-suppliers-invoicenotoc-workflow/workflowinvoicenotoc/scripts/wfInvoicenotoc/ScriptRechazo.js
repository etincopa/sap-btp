var sFechaA = "";
$.context.sLabel = "Fecha Apro.: ";
if ($.context.approvedOnDate !== "") {
    $.context.ingresoAprobadoFecha =true;
	var sAnioA = $.context.approvedOnDate.substr(0, 4);
	var	sMesA = $.context.approvedOnDate.substr(4, 2);
	var	sDiaA = $.context.approvedOnDate.substr(6, 2);	
	sFechaA = sDiaA + "/" + sMesA + "/" + sAnioA;

}else if ($.context.rejectedOnDate !== "")
{
    $.context.ingresoRechazoFecha =true;
    var sAnioA = $.context.rejectedOnDate.substr(0, 4);
    var sMesA = $.context.rejectedOnDate.substr(4, 2);
    var sDiaA = $.context.rejectedOnDate.substr(6, 2);
    sFechaA = sDiaA + "/" + sMesA + "/" + sAnioA;
    $.context.sLabel = "Fecha Rechazo: ";
}
$.context.reason = $.context.WFUserComment;
$.context.CustomObjectAttributeValueVariable = sFechaA;
