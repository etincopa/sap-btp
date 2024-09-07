const core = require("@actions/core");
const fs = require("fs");
const spsave = require("spsave").spsave;

var coreOptions = {
    siteUrl: core.getInput("sp-site-url"),
    notification: true,
    checkin: true,
    checkinType: 1,
};

var creds = {
    username: process.env.SP_USER, // secret
    password: process.env.SP_PASSWORD, // secret
};

// example: "Informe de Flota Setup 1.1.0-rc.1-PRD.exe"
let fileName = core.getInput("file-name").replace("refs/tags/v", "").replace("refs/heads/", "");
let newFileName = fileName; // change this if want another file name
let sourcePath = core.getInput("source-path");
let folder = core.getInput("sp-destination-path");
let bUpload = true;

if (fileName.includes("QAS")) {
    folder = folder + " QAS";
} else if (fileName.includes("PRD")) {
    folder = folder + " PRD";
} else {
    // don't upload if in development mode
    bUpload = false;
}

var fileOptions = {
    folder: folder,
    fileName: newFileName,
    fileContent: fs.readFileSync(sourcePath + fileName),
};

if (bUpload) {
    spsave(coreOptions, creds, fileOptions)
        .then(function () {
            console.log(`File ${newFileName} uploaded successfully to ${folder}`);
        })
        .catch(function (err) {
            console.log(err);
        });
} else {
    console.log("Sharepoint upload cancelled. Development mode (tag doesn't contain QAS or PRD)");
}
