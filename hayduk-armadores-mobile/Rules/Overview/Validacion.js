/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Validacion(context) {
    //Validaciones en general
    if ((context.evaluateTargetPath('#Control:EmailEdit/#Value').indexOf('@')) === -1) {        
        context.executeAction('/Armadores/Actions/Overview/Message/ValidacionCorreo.action');
    } else {        
        return true;
    }
}