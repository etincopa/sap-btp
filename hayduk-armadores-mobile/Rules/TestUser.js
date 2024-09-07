/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function TestUser(context) {
    let userid = context.evaluateTargetPath('#Control:User/#Value');
   let appId = context.evaluateTargetPath('#Application/#ClientData/#Property:MobileServiceAppId');
   //let appId = context.evaluateTargetPath('#Application/#ClientData/#Property:');
   let uri = `https://sd-hayduk-qas-armadores-hayduk-armadores.cfapps.us10.hana.ondemand.com/mobileservices/application/${appId}/roleservice/application/${appId}/v2/Me`;
   
   let header = {
     "Content-Type": "application/json"
   };
   let params = {
       'method': 'GET',
       'header': header,
   };
   
   
   return context.sendMobileServiceRequest(uri, params).then((result)=>{
     //console.log('Result:' +result);
     console.log("Result Content:" + result.content);
     console.log("Result statusCode:"+ result.statusCode);
     if (result && result.statusCode === 201 && result.content) {
         //DO WHAT YOU NEED WITH THE result.content here e.g.
         let data = JSON.parse({ "result": result.content.toString()});
         context.getPageProxy().setActionBinding(data);
         return context.executeAction("/Armadores/Actions/Overview/Message/TestUser.action");
         //alert(data);
         //return result.content.userName;
         //return "entro";
     } else if (result) {
      // console.log(Failed Result: ${result.statusCode});
      //alert('fallo1');
      //return 'fallo1';
      return context.executeAction("/Armadores/Actions/Overview/Message/TestFallo.action");
     }else {
       //console.log(Failed Result: ${result.content});
       //alert('fallo2');
       return context.executeAction("/Armadores/Actions/Overview/Message/TestFallo.action");
     }
   });
}