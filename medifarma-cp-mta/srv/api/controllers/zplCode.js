var fs = require("fs");
var request = require("request");
const restFun = require("../../services/restFunction");

exports.postZebraZPL = async (req, res) => {
  //http://localhost:4004/api/v1/cp/PRINT/ZplCode?colaImpresionId=6fbb4b30-f3e8-4931-a86b-f3a9f9373f18

  var zpl = await restFun.buildZPL(req.query);

  var options = {
    encoding: null,
    formData: { file: zpl },
    // omit this line to get PNG images back
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/x-www-form-urlencoded",
    },

    // adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
    url: "http://api.labelary.com/v1/printers/8dpmm/labels/4x3/0/",
  };

  request.post(options, function (err, resp, body) {
    if (err) {
      return console.log(err);
    }
    var sDateTime = new Date().getTime();
    var filename = sDateTime + "_zpl.pdf"; // change file name for PNG images
    fs.writeFile(filename, body, function (err) {
      if (err) {
        console.log(err);
      }

      res.download("./" + filename, (err) => {
        if (err) {
          console.log(err);
        }

        fs.unlink(filename, (err) => {
          if (err) {
            console.log(err);
          }
          console.log("FILE [" + filename + "] REMOVED!");
        });
      });
    });
  });
};
