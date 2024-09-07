/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function SetSliderValue(context) {
    console.log("In SetExtensionValue");
    let srcValue = context.getValue();
    let targetCtrl = context.evaluateTargetPath("#Page:Habilitaciones/#Control:MyExtensionControlName");
    targetCtrl.setValue(srcValue);
}