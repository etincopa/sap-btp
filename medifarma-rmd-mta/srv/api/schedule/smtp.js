// "use strict";
const nodemailer = require("nodemailer");
const node_env = process.env.NODE_ENV || "dev";
const { readDestination } = require("sap-cf-destconn");
let destinatarios =
  node_env == "dev"
    ? ["mauchp0311@gmail.com"]
    : ["mauchp0311@gmail.com"]



const envio_mail = async (message,destino) => {
  /**
   * Podemos usar el parametro para configurar toda la trama del envio
   */
  // create reusable transporter object using the default SMTP transport
  // destinatarios = [... destinatarios, ... destino];
  destinatarios = destinatarios;
  console.log("destino ",destino)
  let destMail = await destination("bpmworkflowruntime_mail");
  let transporter = nodemailer.createTransport({
    // host:  "smtp-mail.outlook.com",
    host: destMail["mail.smtp.host"],
    port: destMail["mail.smtp.port"],
    // secure: true,
    secureConnection: false,
    // requireTLS: false, // true for 465, false for other ports
    tls: { ciphers: 'SSLv3' },
    auth: {
      user: destMail["mail.user"], //'Soport  echavezp@everis.com',
      pass: destMail["mail.password"],
    },
  });

  await transporter.sendMail({
    from: destMail["mail.smtp.from"], //"echavezp@everis.com"
    to: destinatarios,
    subject: "JOB TO HANA CLOUD - MEDIFARMA", // Subject line
    text:"REPORTE DE RECETAS ",
    attachments: [
        {
            filename:message.filename,
            content: message.buffer,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
    ],
  });

  // console.log(information);

  // transporter.close();

};

async function destination(DEST_NAME) {
  try {
    const destinationConfig = await readDestination(DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;
    if (oConfig.authTokens) {
      var authTokens = oConfig.authTokens;
      oConfig.token = `${authTokens.type} ${authTokens.value}`;
    } else {
      var sClientId = oConfig.User;
      var sClientSecret = oConfig.Password;
      const sToken = Buffer.from(`${sClientId}:${sClientSecret}`).toString("base64");

      oConfig.token = `Basic ${sToken}`;
    }
    return oConfig;
  } catch (error) {
    return { error: error };
  }
};

exports.createMail = (objectMSJ={},destino) => {
  envio_mail(objectMSJ,destino).catch((error) => {
    console.log("No se envio el correo " + error);
    throw error;
  });

};
