/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function Image(context) {
    let srcValue = context.getValue();
    let targetCtrl = context.evaluateTargetPath("#Property:sUrl");
    context.setValue(targetCtrl);
}