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
    mailDest = $.context.MailDest,
	mails = [],
    mailAddressForCC = [];

if($.context.action === "R"){
	$.context.body = "Se volvió a enviar la solicitud de pre registo:";
}else {
	$.context.body = "Se envió la solicitud:";
}

for (var i=0; i<mail.length; i++) {
	mails.push(mail[i].EMAIL);
}

for (var i=0; i<mailDest.length; i++) {
	mailAddressForCC.push(mailDest[i].MAILDEST);
}

$.context.mailRequesterName = $.context.requestUserData.DISPLAYNAME;
$.context.mailRequester = $.context.requestUserData.EMAIL;
$.context.initiatorName = 'Srs. Aprobadores';
$.context.mail = mails.join(',');
$.context.mailAddressForCC = mailAddressForCC.join(',');
$.context.subject = 'Solicitud Pre Registro';