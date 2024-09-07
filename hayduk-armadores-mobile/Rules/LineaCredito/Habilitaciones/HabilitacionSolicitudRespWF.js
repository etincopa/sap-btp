
var clientAPI;

/**
 * Describe this function...
 */
export default function HabilitacionSolicitudRespWF(clientAPI) {
    
    let actionResult = clientAPI.getActionResult('wfResp');
    let wfContext = actionResult.data;

    //Enviar el Id del WF
    let spWorkflowInstanceId = clientAPI.evaluateTargetPath("#Page:SolicitarHabilitacion/#Control:spWorkflowInstanceId");
    spWorkflowInstanceId.setValue(wfContext.id);

    /*
    wfContext: {
        "id": "b2ae9c0a-513b-11eb-a7d5-eeee0a99f905",
        "definitionId": "lineacredito",
        "definitionVersion": "1",
        "subject": "lineacredito",
        "status": "RUNNING",
        "businessKey": "",
        "rootInstanceId": "b2ae9c0a-513b-11eb-a7d5-eeee0a99f905",
        "applicationScope": "own",
        "startedAt": "2021-01-07T22:57:20.764Z",
        "startedBy": "20541743813"
    }
    */


    //Guardar registros en la tabla ARMADORES_SOLICITUDPENDHABILITACION
    return clientAPI.executeAction('/Armadores/Actions/LineaCredito/Habilitaciones/HabilitacionSolicitudArmador.action');
    
    
}
