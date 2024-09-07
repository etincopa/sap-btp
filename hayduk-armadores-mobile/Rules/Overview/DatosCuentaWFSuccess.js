/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function DatosCuentaWFSuccess(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let  actionResult = context.getActionResult("get");
    let  userArray = actionResult.data._array;
    
   /* let  inputUser = context.evaluateTargetPath("#Page:User/#Control:UsuarioPrueba");*/
    if(userArray.length > 0){
        return context.executeAction('/Armadores/Actions/Overview/Message/ErrorDatosWF.action');
        
    }else{
        return context.executeAction('/Armadores/Actions/Overview/ServiceRest/CreateTabCuentasEditWF.action');
    }
}