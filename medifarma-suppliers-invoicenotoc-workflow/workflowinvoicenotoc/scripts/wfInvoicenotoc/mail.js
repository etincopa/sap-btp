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
if($.context.action === "A"){
	$.context.body = "Se aprobó la solicitud:";
	$.context.status = "A";
}else if($.context.action === "R"){
	$.context.body = "Se rechazó la solicitud:";
	$.context.status = "R";
}

$.context.initiatorName = $.context.requestUserData.DISPLAYNAME;
$.context.mail = $.context.requestUserData.EMAIL;
$.context.subject = 'Solicitud';

// formatear monto
var monto = $.context.prnRequestData.AMOUNT;
var montoFormateado = monto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var aPartesMonto = montoFormateado.split('.');

if (aPartesMonto.length > 1) {
    montoFormateado = aPartesMonto[0] + '.' + (aPartesMonto[1].length === 1 ? (aPartesMonto[1] + '0') : aPartesMonto[1]);
} else {
    montoFormateado = montoFormateado + '.00';
}

// añadir moneda
switch ($.context.prnRequestData.CURRENCY) {
    case 'PEN':
        montoFormateado = 'S/. ' + montoFormateado;
        break;
    case 'USD':
        montoFormateado = '$ ' + montoFormateado;
        break;
    case 'EUR':
        montoFormateado = '€ ' + montoFormateado;
        break;
}

$.context.montoFormateado = montoFormateado;