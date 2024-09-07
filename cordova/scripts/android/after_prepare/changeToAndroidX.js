#!/usr/bin/env node

module.exports = function(context) {

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    //  platforms/android/app/src/main/java/org/apache/cordova/camera/CordovaUri.java
    //  platforms/android/app/src/main/java/org/apache/cordova/camera/FileProvider.java
    //  platforms/android/app/src/main/java/org/apache/cordova/camera/FileProvider.java

    var cameraPath  = path.join(context.opts.projectRoot,
            'platforms','android','app','src','main','java','org','apache','cordova','camera');
    var cordovaUriPath = path.join(cameraPath,'CordovaUri.java')
    var fileProviderPath = path.join(cameraPath,'FileProvider.java')
    var cameraLauncherPath = path.join(cameraPath,'CameraLauncher.java')

    var candidateList = [cordovaUriPath,fileProviderPath,cameraLauncherPath]
    for(var i in candidateList){
        var candidatePath = candidateList[i]

        var data = fs.readFileSync(candidatePath,'utf8');
        var result = data.replace(/android\.support\.v4\.content/g,'androidx.core.content');
        fs.writeFileSync(candidatePath,result,'utf8');
    }
};
