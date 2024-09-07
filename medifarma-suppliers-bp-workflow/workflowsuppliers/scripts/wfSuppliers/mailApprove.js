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
var mail = $.context.approverUsersData,
	mails = [];

if($.context.action === "R"){
	$.context.body = "Se volvió a enviar la solicitud:";
}else {
	$.context.body = "Se envió la solicitud:";
}

for (var i=0; i<mail.length; i++) {
	mails.push(mail[i].EMAIL);
}

$.context.initiatorName = 'Srs. Aprobadores';
$.context.mail = mails.join();
// $.context.mail = mail[0].EMAIL;
$.context.subject = 'Solicitud';
//$.context.accept = false;