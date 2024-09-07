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
if ($.context.status === "I") {
	$.context.statusText = "Iniciado";
} else if ($.context.status === "A") {
	$.context.statusText = "Aprobado";
} else if ($.context.status === "C") {
	$.context.statusText = "Cancelado";
} else if ($.context.status === "P") {
	$.context.statusText = "Pendiente";
} else if ($.context.status === "R") {
	$.context.statusText = "Rechazado";
} else if ($.context.status === "T") {
	$.context.statusText = "Reenviado";
} else {
	$.context.statusText = "";
}

var sFechaA = "";
if ($.context.approvedOnDate !== "") {
	var sAnioA = $.context.approvedOnDate.substr(0, 4),
		sMesA = $.context.approvedOnDate.substr(4, 2),
		sDiaA = $.context.approvedOnDate.substr(6, 2);
	
	sFechaA = sDiaA + "/" + sMesA + "/" + sAnioA;
}

$.context.approvedOnDateFormatter = sFechaA;