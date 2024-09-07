
var clientAPI;

/**
 * Describe this function...
 */
export default async function AttachmentChangeRule(clientAPI) {
    const imageSourceModule = require("@nativescript/core/image-source");
    let fs = require('@nativescript/core/file-system');
    var uri = clientAPI.getClientData().AddedAttachments[0].urlString;
    var startName = uri.lastIndexOf("/");
    var filePath = fs.knownFolders.documents().path;
    var fileAttachPath = fs.Folder.fromPath(filePath + '/imageCache').getEntitiesSync()[0].path;
    var fileName = clientAPI.getClientData().AddedAttachments[0].urlString.substr(startName + 1, uri.length);
    var path = fs.path.join('/sdcard/Download', fileName);

    path = getPath('/storage/emulated/0', fileName, 0);
    if (path == "")
        path = getPath('/sdcard', fileName, 0);
    var ext = "jpg"
    if (fileName.lastIndexOf(".png"))
        ext = "png"
    var file = fs.File.fromPath(path);
    if (file.size > 2000000)
        return clientAPI.executeAction('/Armadores/Actions/Overview/Message/ArmadorCuentaLongitudAdjuntoMessage.action');
    const img = imageSourceModule.fromFile(path);
    const img2 = imageSourceModule.fromFile(path);
    const base64String = img.toBase64String(ext);
    let appSettings = require("@nativescript/core/application-settings");
    appSettings.setString("adjunto", base64String);
    appSettings.setString("fileName", fileName);

}
function getPath(basePath, fileName, level) {
    let fs = require('@nativescript/core/file-system');
    if (level < 3) {
        var folderExists = fs.Folder.exists(basePath);
        if (folderExists) {
            var path = "";
            var folders = fs.Folder.fromPath(basePath).getEntitiesSync();
            for (var i = 0; i < folders.length; i++) {
                var docPath = folders[i].path;
                var existPath = fs.File.exists(docPath + "/" + fileName);
                if (existPath) {
                    path = docPath + "/" + fileName;
                    return path;
                } else {
                    path = getPath(docPath, fileName, level + 1);
                    if (path.length > 0)
                        return path;
                }
            }
            return path;
        } else
            return "";
    }
    else {
        return "";
    }
}
