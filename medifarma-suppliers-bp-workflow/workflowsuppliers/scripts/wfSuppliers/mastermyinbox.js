/*
// read from existing workflow context 
var productInfo = $.context.productInfo; 
var productName = productInfo.productName; 
var productDescription = productInfo.productDescription;

// read contextual information
var taskDefinitionId = $.info.taskDefinitionId;

// read user task information
var lastUserTask1 = $.usertasks.usertask1.last;
var userTaskSubject = lastUserTask1.subject;
var userTaskProcessor = lastUserTask1.processor;
var userTaskCompletedAt = lastUserTask1.completedAt;

var userTaskStatusMessage = " User task '" + userTaskSubject + "' has been completed by " + userTaskProcessor + " at " + userTaskCompletedAt;

// create new node 'product'
var product = {
		productDetails: productName  + " " + productDescription,
		workflowStep: taskDefinitionId
};

// write 'product' node to workflow context
$.context.product = product;
*/

var sFecha = "";
if ($.context.requestedOnDate !== "") {
	var sAnio = $.context.requestedOnDate.substr(0, 4);
	var	sMes = $.context.requestedOnDate.substr(4, 2);
	var	sDia = $.context.requestedOnDate.substr(6, 2);
	
	sFecha = sDia + "/" + sMes + "/" + sAnio;
}

//logica CustomObjectAttributeValue approvedOnDate
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


$.context.requestedOnDateFormatter = sFecha;
//$.context.approvedOnDateFormatter = sFechaA;
$.context.CustomObjectAttributeValueVariable = sFechaA;
//$.context.CustomTaskTitle = $.context.requestUserData.DISPLAYNAME;
$.context.approvedOnDateFormatter = sFechaA;
$.context.CustomTaskTitle = $.context.bpRequestData.NAME;
$.context.CustomCreatedBy = "";
$.context.CustomObjectAttributeValue = $.context.requestUserData.CREATED_ON_DATE;
$.context.CustomObjectStatus  = "";
$.context.CustomNumberValue = $.context.bpRequestData.DOCUMENTNUMBER;
$.context.CustomNumberUnitValue = "";
$.context.status = "P";