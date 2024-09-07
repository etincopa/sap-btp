/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function TabDatosEdit(context) {    
    let targetCtrl = context.evaluateTargetPath("#Page:TabDatosEdit/#Control:EmailEdit");
    let sValue = targetCtrl.getValue();
    /*let sBusinessKey = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
      sBusinessKey = sBusinessKey.toUpperCase().replace(/-/gi, '');   */   
    //let sBusinessKey = new Date().toISOString();
    let appSettings = require("@nativescript/core/application-settings");
    let sRuc = appSettings.getString("ruc");
    return  {   
        "IDRuc":sRuc,
        "Flujo":"Email",
        "CorreoNuevo":sValue,
        "Group":"Z_SCP_ARM_APROBACION_ARMADOR"
        };
    /*return {
    "definitionId":"armador",
    "context":{"flujo":"Email",
    "email":"brad@gmail.com","group":"ARM_APROBACION_ARMADOR"}
};    */
}