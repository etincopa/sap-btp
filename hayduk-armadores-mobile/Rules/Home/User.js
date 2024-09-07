/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function User(context) {
    let appSettings = require("@nativescript/core/application-settings");
    let  actionResult = context.getActionResult("get");
    let  userArray = actionResult.data._array;
    
   /* let  inputUser = context.evaluateTargetPath("#Page:User/#Control:UsuarioPrueba");*/
    if(userArray.length > 0){
        let userObject = userArray[0];
        appSettings.setString("correo",userObject.Correo);
        appSettings.setString("razonSocial",userObject.RazonSocial);
        appSettings.setString("ruc",userObject.IDRuc);
        appSettings.setString("distrito",userObject.Distrito);
        appSettings.setString("adjunto","");
        appSettings.setString("fileName","");
        return context.executeAction('/Armadores/Actions/Home/ServiceOData/ObtenerParametros.action');
       // inputUser.setValue(userObject.IDRUC + " " + userObject.RazonSocial);
    }else{
       // inputUser.setValue("No se encontró un usuario en SAP ERP");
    }

}