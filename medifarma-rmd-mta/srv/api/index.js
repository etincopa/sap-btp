const { Router } = require("express");
const compareVersion = require("./routes/compareVersion");
const htmlToPdf = require("./routes/htmlToPdf");
const sendMail = require("./routes/sendMail");

module.exports = () => {
  const app = Router();
  compareVersion(app);
  htmlToPdf(app);
  sendMail(app);
  // rmdFilter(app);

  return app;
};
