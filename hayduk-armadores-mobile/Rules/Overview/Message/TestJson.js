/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function TestJson(context) {
    let actionResult = context.getActionResult('create');
  if (actionResult) {
    let entity = actionResult.success;
    //return 'Entity created with description \"' + entity.id + '\"';
    //return JSON.stringify(actionResult);
    //let a = JSON.stringify(actionResult);
    if(actionResult.data.id){
        let a = JSON.stringify(actionResult.data);
        let b = actionResult.data.id;
        return b;
    }else{
        return "2";
    }
    
  }

  return 'Entity successfully created';
}