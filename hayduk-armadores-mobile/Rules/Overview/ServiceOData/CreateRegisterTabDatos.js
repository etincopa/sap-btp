/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function CreateRegisterTabDatos(context) {
    let actionResult = context.getActionResult('create');
    let data = actionResult.data;
    let idWF = context.evaluateTargetPath("#Page:TabDatosEdit/#Control:IdWF");
    idWF.setValue(data.id);
    let fechaRegistro = context.evaluateTargetPath("#Page:TabDatosEdit/#Control:FechaRegistro");
    let dateTime = new Date;
    let dayDate = dateTime.getDay();
    let dayFactor = 60 * 60* 24;
    let timeValue = (((dateTime.getHours() * 24) + dateTime.getMinutes()) * 60 + dateTime.getSeconds()) * 60;
    let secondDate = (dayDate-1) * dayFactor + timeValue + 1;
    //let dateTime = context.formatDatetime(new Date);
    let dateprueba = dateTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    //fechaRegistro.setValue(dateprueba);
    
    
    return context.executeAction('/Armadores/Actions/Overview/ServiceOData/CreateTabDatos.action');

}