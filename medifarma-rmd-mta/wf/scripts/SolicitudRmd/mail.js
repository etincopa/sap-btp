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
if($.context.action == "R") {
    $.context.body = "Se volvió a enviar la solicitud: " + $.context.bpRequestData.codigoSolicitud + ",";
} else {
    $.context.body = "Se envió la solicitud: " + $.context.bpRequestData.codigoSolicitud + ",";
}

$.context.descripcionMD = "Descripción: " + $.context.bpRequestData.descripcion + ",";
$.context.plantaMD = "Planta: " + $.context.bpRequestData.plantaMDWF + ",";
$.context.seccionMD = "Sección: " + $.context.bpRequestData.areaRmdTxt + ",";
$.context.motivoMD = "Motivo: " + $.context.bpRequestData.motivoMDWF + ",";
$.context.observacionMD = "Observación: " + $.context.bpRequestData.observacion + ",";
$.context.etapaMD = "Etapa: " + $.context.bpRequestData.nivelMDWF + ",";
$.context.finalizatorName = $.context.requestUserData.DISPLAYNAME + " " + $.context.requestUserData.DISPLAYLASTNAME;
$.context.initiatorName = "Sres. Documentación Técnica";
$.context.mail = $.context.approverUserData.EMAIL;
$.context.subject = 'Solicitud ' + $.context.bpRequestData.plantaMDWF + "-[" + $.context.bpRequestData.codigoSolicitud + "] " + $.context.bpRequestData.descripcion;    