var fs = require("fs");

/**
 * Logs to the console
 */
const log = (msg) => console.log(`\n[build-tools/replace-service-urls.js]: ${msg}`); // eslint-disable-line no-console

function replaceInFile(sFile, sToReplace, sReplaceWith) {
    if (sToReplace === sReplaceWith) {
        log("No se reemplazan URLs.");
        return;
    }
    fs.readFile(sFile, "utf8", function (err, data) {
        if (err) {
            return log(err);
        }
        var result = data.replace(sToReplace, sReplaceWith);

        fs.writeFile(sFile, result, "utf8", function (err) {
            if (err) {
                return log(err);
            } else {
                log(`In ${sFile}, ${sToReplace} was replaced with ${sReplaceWith}`);
            }
        });
    });
}

// ENVIRONMENT
let env = process.env.BUILD_SCP_ENV,
    environment = "development";

log(process.env.BUILD_SCP_ENV);

if (env.includes("QAS")) {
    environment = "test";
} else if (env.includes("PRD")) {
    environment = "production";
}

// CONFIG
const config = {
    "./webapp/controller/Informe.controller.js": {
        development:
            "https://informeflotalogin-xxltdi2m6s.dispatcher.us2.hana.ondemand.com/?hc_back&saml2idp=awjv7cscn.accounts.ondemand.com",
        test: "https://informeflotalogin-xxltdi2m6s.dispatcher.us2.hana.ondemand.com/?hc_back",
        production: "https://informeflotalogin-hd30b5uvut.dispatcher.us2.hana.ondemand.com/?hc_back",
    },
    "./webapp/manifest.json": {
        development: "/saperp/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
        test:
            "https://informeflotalogin-xxltdi2m6s.dispatcher.us2.hana.ondemand.com/saperp_pp/sap/opu/odata/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
        production:
            "https://informeflotalogin-hd30b5uvut.dispatcher.us2.hana.ondemand.com/haydukgwd/sap/opu/odata/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
    },
    "./webapp/model/models.js": {
        development: "/saperp/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
        test:
            "https://informeflotalogin-xxltdi2m6s.dispatcher.us2.hana.ondemand.com/saperp_pp/sap/opu/odata/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
        production:
            "https://informeflotalogin-hd30b5uvut.dispatcher.us2.hana.ondemand.com/haydukgwd/sap/opu/odata/SAP/ZPP_INFORME_FLOTA_SRV_SRV/",
    },
};

// REPLACE
let file = "./webapp/manifest.json";
replaceInFile(file, config[file]["development"], config[file][environment]);

file = "./webapp/controller/Informe.controller.js";
replaceInFile(file, config[file]["development"], config[file][environment]);

file = "./webapp/model/models.js";
replaceInFile(file, config[file]["development"], config[file][environment]);
