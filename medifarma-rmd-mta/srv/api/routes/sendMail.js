const { Router } = require("express");
const router = Router();
const nodemailer = require("nodemailer");
const { readDestination } = require('sap-cf-destconn');
const {createMail} = require('../schedule/smtp');
// const {destination} = require('../libs/destination');

module.exports = (app) => {
  app.use("/sendMail", router);
  router.post("/", async (req, res) => {
    try {
      let oDataEmail = req.body;
      // await createMail();
      // const destinationConfig = await destination.getDestinationInfo("bpmworkflowruntime_mail");
      const transportOptions = {
          host: "email-smtp.us-west-2.amazonaws.com", //destinationConfig["destinationConfiguration"]["mail.smtp.host"],
          port: 587, //destinationConfig["destinationConfiguration"]["mail.smtp.port"],
          secure: false,
          // service: 'Gmail',
          auth: {
              user: "AKIA36QOT3WULDMO5WGV", //destinationConfig["destinationConfiguration"]["mail.user"],
              pass: "BExge02S/m+l6i5gAXpwxwi2WD2REaneaCxQrsNStNGa"//destinationConfig["destinationConfiguration"]["mail.password"]
          }
      };
      // create instance for scpmailer trasnport
      let transporter = nodemailer.createTransport(transportOptions);
      const mailOptions = {
          from: "Soport TEST <scp_peru_admin@everis.com>", //destinationConfig["destinationConfiguration"]["mail.user"],
          to: oDataEmail.destinatarios, //data.emails[0].value,
          cc: oDataEmail.destinatarioscc,
          subject: oDataEmail.subject, //process.env.EMAIL_SUBJECT_USER_CREATION,
          text: oDataEmail.text, //process.env.EMAIL_TEXT_USER_CREATION,
          // html: customizedHTML
      }
      // Send Email
      await transporter.sendMail(mailOptions);
      // res.sendFile(`${process.cwd()}/srv/assets/user-created-successfully/index.html`)
      transporter.close();
      return res.send("OK").status(200);
    } catch (error) {
      return res.json(error.message);
    }
  });
};  