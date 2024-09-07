var express = require("express"); //llamamos a Express
var app = express();

var port = process.env.PORT || 9002; // establecemos nuestro puerto

app.get("/", function (req, res) {
  res.json({ mensaje: "¡Hola Mundo!" });
});

app.get("/SerialPort", function (req, res) {
  var a = between(24, 25);
  
  var sMsgG = "S S     " + a + "  g\r";
  var sMsgKG = "S S      " + a + " kg\r";
  res.json({
    iCode: 1,
    mensaje: sMsgKG,
  });
});

app.post("/SerialPort", function (req, res) {
  var a = between(903, 903);
  //var a = between(100, 103);
  
  var sMsgG = "S S     " + a + "  g\r";
  var sMsgKG = "S S      " + a + " kg\r";
  res.json({
    iCode: 1,
    mensaje: sMsgG,
  });
});

app.del("/", function (req, res) {
  res.json({ mensaje: "Método delete" });
});

// iniciamos nuestro servidor
app.listen(port);
console.log("API escuchando en el puerto " + port);

function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
