export default function OnWillUpdate(clientAPI) {

	let dialogs = clientAPI.nativescript.uiDialogsModule;
	return dialogs.confirm("Se encontró una nueva actualización. ¿Actualizar ahora?").then((result) => {
		console.log("Update now? " + result);
		if (result === true) {
			return Promise.resolve();
		} else {
			return Promise.reject('User Deferred');
		}
	});
}