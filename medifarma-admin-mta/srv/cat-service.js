const cds = require("@sap/cds");

const axios = require("axios");
const { readDestination } = require("sap-cf-destconn");
const xsenv = require("@sap/xsenv");

const log = require("./log");

const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const { Maestra, USUARIO, Usuario, AUDITORIA } = cds.entities("mif_admin.hdi");
const crypto = require("./services/crypto");
const scim = require("./api/controllers/ias-controller");
var browser = require('browser-detect');

module.exports = cds.service.impl(async function () {
    this.before("CREATE", Maestra, async (req) => {
        try {
            const oData = req.data;
        } catch (err) {
            return err;
        }
    });

    this.before("UPDATE", USUARIO, async (req) => {
        const oUsuario = req.data;
        const tx = cds.transaction(req);
        const oObj = await tx.run(
            SELECT.one.from(USUARIO).where({
                usuarioId: oUsuario.usuarioId,
            })
        );
        console.log(oUsuario.usuarioId);
        console.log(oUsuario);
        console.log(oObj);
        await log.recordLog(
            "USUARIO",
            oUsuario.usuarioActualiza,
            oUsuario.usuarioId,
            oUsuario,
            oObj
        );

        return oUsuario;
    });

    this.on("userInfo", (req) => {
        var results = {};
        results.user = req.user.id;
        if (req.user.hasOwnProperty("locale")) {
            results.locale = req.user.locale;
        }
        results.scopes = {};
        results.scopes.identified = req.user.is("identified-user");
        results.scopes.authenticated = req.user.is("authenticated-user");
        return results;
    });

    this.before("CREATE", Usuario, async (req) => {
        /*
                Deserialization Error: Invalid value Z (JavaScript string) for property "fechaVigInicio". 
                A string value in the format YYYY-MM-DDThh:mm:ss.sTZD must be specified as value for type Edm.DateTimeOffset.
            */
        const oUsuario = req.data;
        var correo = oUsuario.correo;
        /*
            const tx = cds.transaction(req);
            const oUsuario = await tx.run(
                SELECT.one.from(USUARIO).where({ usuario: oUsuario.usuario })
                );
    
            if (oUsuario) {
                //Verificar el campo USUARIO sea unico
                req.error(410, 'El usuario: (' + oUsuario.usuario + ') ya se ecnuentra en uso');
            } else {}
            */

        oUsuario.fechaRegistro = new Date();
        oUsuario.terminal = _xForwardedFor(req.headers["x-forwarded-for"]);
        if (!oUsuario.clave) oUsuario.clave = oUsuario.numeroDocumento; //_getRandomString(5);
        if (oUsuario.clave && oUsuario.clave !== "") {
            var sClave = oUsuario.clave;
            oUsuario.clave = crypto.encrypt2(oUsuario.clave);

            //Inicio Envio de correo
            var html = await readFile(
                `${process.cwd()}/srv/assets/email-user-template/createPass.html`,
                "utf8"
            );
            var template = handlebars.compile(html);
            var htmlParams = {
                organization_name: "MEDIFARMA",
                user_name: correo,
                user_password: sClave,
            };
            var customizedHTML = template(htmlParams);

            // Send Email
            try {
                var DEST_NAME = "SMTP_MAIL";
                var oDestination = await sapBTP.destination(DEST_NAME);
                // Email Configuration
                var oBodyMail = {
                    from: oDestination["mail.smtp.from"],
                    to: correo,
                    //bcc: []
                    subject: "Creación de Usuario",
                    text: "Creación de Usuario",
                    html: customizedHTML,
                };

                console.log("ENVIO CORREO");
                _sendMail(oDestination, oBodyMail).catch(
                    (oError) => {
                        console.log(oError);
                    }
                );
            } catch (oError) {
                console.log(oError);
            }
            //Fin Envio de correo
        }
        return oUsuario;
    });

    this.on("fnResetPassword", async (req) => {
        //GET ../fnResetPassword?usuarioId='0adbcf57-0525-4e74-a7d3-3957081aaa09'&correo='elvis.percy.garcia.tincopa@everis.com'
        console.log("fnResetPassword");
        var result = false;
        var sMessage = "";
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            var usuarioId = data.usuarioId;
            var correo = data.correo;
            var sClave = _getRandomString(5);
            var sClaveCryp = crypto.encrypt2(sClave);

            const iRowU = await tx.run(
                UPDATE(USUARIO)
                    .set({ clave: sClaveCryp })
                    .where({ usuarioId: usuarioId })
            );

            if (iRowU > 0) {
                sMessage =
                    "Cambio de clave exitoso!. \nEn breve se enviará un correo al usuario notificando su nueva clave. \nSi no recibe el email de confirmación, compruebe la carpeta de spam/correo no deseado de su gestor de correo o comuniquese con un administrador. \nNueva clave";

                var html = await readFile(
                    `${process.cwd()}/srv/assets/email-user-template/changePass.html`,
                    "utf8"
                );
                var template = handlebars.compile(html);
                var htmlParams = {
                    organization_name: "MEDIFARMA",
                    user_name: correo,
                    user_password: sClave,
                };
                var customizedHTML = template(htmlParams);

                // Send Email
                try {
                    var DEST_NAME = "SMTP_MAIL";
                    var oDestination = await sapBTP.destination(DEST_NAME);
                    // Email Configuration
                    var oBodyMail = {
                        from: oDestination["mail.smtp.from"],
                        to: correo,
                        //bcc: []
                        subject: "Cambio de credenciales",
                        text: "Cambio de credenciales",
                        html: customizedHTML,
                    };

                    console.log("ENVIO CORREO");
          /*var oResp = await */ _sendMail(oDestination, oBodyMail).catch(
                        (oError) => {
                            console.log(oError);
                        }
                    );
                } catch (oError) {
                    console.log(oError);
                    sMessage =
                        "Cambio de clave exitoso!. \nPero no se puedo notificar (Error al enviar el correo). \nNueva clave";
                }
                result = {
                    results: [
                        {
                            sMessage: sMessage,
                            bStatus: true,
                            value: sClave,
                        },
                    ],
                };
            } else {
                sMessage = "Cambio de clave fallo, vuelve a intetarlo mas tarde.";
                result = {
                    results: [
                        {
                            sMessage: sMessage,
                            bStatus: false,
                            value: "",
                        },
                    ],
                };
            }
        } catch (oError) {
            console.log("ERROR");
            console.log(oError);
            result = {
                results: [
                    {
                        sMessage: oError.message,
                        bStatus: false,
                        oError: oError,
                    },
                ],
            };
        }

        return result;
    });
    this.on("fnUserByEmail", async (req) => {
        //GET ../browse/fnUserByEmail(emails='elvis.percy.garcia.tincopa@everis.com')
        //GET ../v2/browse/fnUserByEmail?emails='elvis.percy.garcia.tincopa@everis.com'
        var result = false;
        try {
            const data = req.data;
            var emails = data.emails;
            var sEntity = 'Users?filter=emails.value eq "' + emails + '"';
            var userInfo = await scim.readDinamic(sEntity);
            result = userInfo;
        } catch (oError) {
            console.log(oError);
            result = {
                type: "E",
                oError: oError,
            };
        }

        return result;
    });

    this.before(["CREATE", "UPDATE", "DELETE"], async (req) => {
        try {
            console.log("hello world! before");
            //console.log(req);
            //console.log(result);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            //oAudit.connectionId = null;          
            oAudit.clientHost = req.headers["x-forwarded-host"];
            console.log("req.headers",req.headers);
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            //oAudit.clientPid = null;//req.headers["x-correlation-id"];
            //oAudit.clientPort = null;
            console.log(req.user);
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Process';  
            oAudit.eventLevel = null;  
            oAudit.eventAction = req.event;  
            oAudit.action = req.event;  
            //oAudit.schemaName = null;  
            //oAudit.sKey = null;  
            oAudit.value = oData ;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            //oAudit.sKey = sKey;
            //oAudit.sValue = oData[sKey].toString();
            //oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            //console.log("device",req.device);
            //console.log("browser",browser());
            //console.log("user-agent",req.headers['user-agent']);
            
            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;
            
            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = null;
            aAudit.push(oAudit);
            console.log("Antes de insertar")
            const tx = cds.transaction(req);
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            //console.log("despues de insertar")
            //console.log("oRow",oRow)
            return oRow;
        } catch (error) {
            console.log("error",error)
            return error;
        }
    });

    this.after(["CREATE", "UPDATE", "DELETE"], async (result, req) => {
        try {
            console.log("hello world!");
            //console.log(req);
            //console.log(result);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            //oAudit.connectionId = null;          
            oAudit.clientHost = req.headers["x-forwarded-host"];
            console.log("req.headers",req.headers);
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            //oAudit.clientPid = null;//req.headers["x-correlation-id"];
            //oAudit.clientPort = null;
            console.log(req.user);
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Success';  
            oAudit.eventLevel = null;  
            oAudit.eventAction = req.event;  
            oAudit.action = req.event;  
            //oAudit.schemaName = null;  
            //oAudit.sKey = null;  
            oAudit.value = oData ;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            //oAudit.sKey = sKey;
            //oAudit.sValue = oData[sKey].toString();
            //oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            //console.log("device",req.device);
            //console.log("browser",browser());
            //console.log("user-agent",req.headers['user-agent']);
            
            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;
            
            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = null;
            aAudit.push(oAudit);
            console.log("Antes de insertar")
            const tx = cds.transaction(req);
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            //console.log("despues de insertar")
            //console.log("oRow",oRow)
            return oRow;
        } catch (error) {
            console.log("error",error)
            return error;
        }
    });

     this.on ('error', async (err, req) => {
        const db = await cds.connect.to ('db')
        const { AUDITORIA } = db.entities ('mif_admin.hdi')
        // modify the message
        //err.message = 'Oh no! ' + err.message
        // attach some custom data
        //err['@myCustomProperty'] = 'Hello, World!'
        try {
            console.log("error !!! ");
            console.log(req.data);
            console.log(err);
            const oData = req.data ? JSON.stringify(req.data) : null;
            const aAudit = [];
            const oAudit = {};
            var oBrowser = browser(req.headers['user-agent']);
            oAudit.applicationName = 'ADMIN';
            oAudit.timestamp = new Date();
            oAudit.host = req.getUrlObject().host;
            oAudit.port = null;            
            oAudit.serviceName = req.path;
            //oAudit.connectionId = null;          
            oAudit.clientHost = req.headers.host;
            oAudit.clientIp = _xForwardedFor(req.headers["x-forwarded-for"]);
            //oAudit.clientPid = null;//req.headers["x-correlation-id"];
            //oAudit.clientPort = null;
            oAudit.userName = req.user.id;
            oAudit.eventStatus = 'Error';  
            oAudit.eventLevel = err.level ? err.level : null;  
            oAudit.eventAction = req.event ;  
            oAudit.action = req.event;  
            //oAudit.schemaName = null;  
            //oAudit.sKey = null;  
            oAudit.value = oData  ;
            oAudit.statementString = req.target.query ? JSON.stringify(req.target.query) : null;
            //oAudit.sKey = sKey;
            //oAudit.sValue = oData[sKey].toString();
            //oAudit.originDatabaseName = null;
            oAudit.lang = req.locale;
            oAudit.device = oBrowser.mobile ? 'mobile' : 'desktop';
            console.log("device",req.device);
            console.log("browser",browser());
            console.log("user-agent",req.headers['user-agent']);
            
            oAudit.so = oBrowser.os ? oBrowser.os : null;
            oAudit.soVersion = oBrowser.os ? oBrowser.os : null;
            
            oAudit.browser = oBrowser.name ? oBrowser.name : null;
            oAudit.browserVersion = oBrowser.version ? oBrowser.version : null;
            oAudit.stackError = err;
            aAudit.push(oAudit);
            const tx = cds.transaction();
            const oRow = await tx.run(INSERT.into(AUDITORIA).entries(aAudit));
            return oRow;
        } catch (error) {
            return error;
        }
      }); 

    _sendMail = function (oDestination, oBodyMail) {
        return new Promise((resolve, reject) => {
            var oMailOption = {
                host: oDestination["mail.smtp.host"],
                port: oDestination["mail.smtp.port"],
                auth: {
                    user: oDestination["mail.user"],
                    pass: oDestination["mail.password"],
                },
                //debug: true,
                secure: false, // true for 465, false for other ports
                protocol: oDestination["mail.transport.protocol"],
                checkserveridentity: oDestination["mail.smtp.ssl.checkserveridentity"],
                required: oDestination["mail.smtp.starttls.required"],
                enable: oDestination["mail.smtp.starttls.enable"],
            };
            console.log(oMailOption);
            var oTransporter = nodemailer.createTransport(oMailOption);
            oTransporter.sendMail(oBodyMail, function (oError, oInfo) {
                if (oError) {
                    console.log(oError);
                    reject(oError); // or use resolve(false)
                } else {
                    console.log("Email sent: " + oInfo.response);
                    resolve(oInfo);
                }
            });
        });
    };

    _xForwardedFor = function (sXForwardedFor) {
        try {
            return sXForwardedFor.split(",")[0];
        } catch (error) {
            return "";
        }
    };

    _getRandomString = function (length) {
        var result = "";
        var characters = "0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
});

var sapBTP = {
    get: async function (sPathSrv) {
        try {
            var DEST_NAME = "ADM_S4H_HTTP_BASIC";
            const oDest = await sapBTP.destination(DEST_NAME);
            const oConn = await sapBTP.connectivity();
            var oUrl = new URL(oDest.URL);

            const { data } = await axios({
                method: "GET",
                url: sPathSrv,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                },
                /*auth: {
                            username: sClientId,
                            password: sClientSecret
                        },*/
                params: {
                    "sap-client": oDest["sap-client"],
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin,
            });

            return data;
        } catch (error) {
            console.log(error);
            return { error: error };
        }
    },
    post: async function (oParam) {
        try {
            var DEST_NAME = "ADM_S4H_HTTP_BASIC";
            const oDest = await sapBTP.destination(DEST_NAME);
            const oConn = await sapBTP.connectivity();
            var oUrl = new URL(oDest.URL);

            const oCSRFToken = await sapBTP.getCSRFToken(oDest, oConn);
            const { data } = await axios({
                method: "post",
                url: oParam.sSrv,
                data: oParam.oData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-Token": oCSRFToken["x-csrf-token"],
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                    Cookie: oCSRFToken["set-cookie"],
                },
                //xsrfCookieName: 'CSRF-TOKEN',
                //xsrfHeaderName: 'X-CSRF-Token',
                //withCredentials: true,
                params: {
                    "sap-client": oDest["sap-client"],
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin,
            });

            return data;
        } catch (error) {
            return { error: error };
        }
    },
    getCSRFToken: async function (oDest, oConn) {
        try {
            var oUrl = new URL(oDest.URL);

            const { headers } = await axios({
                method: "GET",
                url: BASE_URI + "/",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-Token": "Fetch",
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                },
                params: {
                    "sap-client": oDest["sap-client"],
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin,
            });

            return headers;
        } catch (error) {
            console.log(error);
            return { error: error };
        }
    },
    getMailConfig: async function (oConfig) {
        var oMailOption = {
            host: oDestination["mail.smtp.host"],
            port: oDestination["mail.smtp.port"],
            secure: false,
            auth: {
                user: oDestination["mail.user"],
                pass: oDestination["mail.password"],
            },
            from: oDestination["mail.user"],
        };

        return oMailOption;
    },
    destination: async function (DEST_NAME) {
        try {
            const destinationConfig = await readDestination(DEST_NAME);
            const oConfig = destinationConfig.destinationConfiguration;
            if (oConfig.authTokens) {
                var authTokens = oConfig.authTokens;
                oConfig.token = `${authTokens.type} ${authTokens.value}`;
            } else {
                var sClientId = oConfig.User;
                var sClientSecret = oConfig.Password;
                const sToken = Buffer.from(`${sClientId}:${sClientSecret}`).toString(
                    "base64"
                );

                oConfig.token = `Basic ${sToken}`;
            }
            return oConfig;
        } catch (error) {
            try {
                const oConfig2 = await xsenv.getServices({
                    des: "mif_admin-des",
                }).des;
                return oConfig2;
            } catch (error) {
                return { error: error };
            }
        }
    },
    connectivity: async function () {
        try {
            const oConfig = await xsenv.getServices({
                conn: "mif_admin-con",
            }).conn;

            const sJwtToken = await sapBTP._fetchJwtToken(
                oConfig.token_service_url,
                oConfig.clientid,
                oConfig.clientsecret
            );
            oConfig.token = `Bearer ${sJwtToken}`;
            return oConfig;
        } catch (error) {
            return { error: error };
        }
    },
    _fetchJwtToken: async function (oauthUrl, oauthClient, oauthSecret) {
        return new Promise((resolve, reject) => {
            const tokenUrl =
                oauthUrl +
                "/oauth/token?grant_type=client_credentials&response_type=token";
            const config = {
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(oauthClient + ":" + oauthSecret).toString("base64"),
                },
            };
            axios
                .get(tokenUrl, config)
                .then((response) => {
                    resolve(response.data.access_token);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
};
