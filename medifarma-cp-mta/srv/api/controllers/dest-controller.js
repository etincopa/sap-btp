/*
const rp = require('request-promise');
const xsenv = require('@sap/xsenv');
const dest_service = xsenv.getServices({ dest: { tag: 'destination' } }).dest;
const uaa_service = xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa;
const sUaaCredentials = dest_service.clientid + ':' + dest_service.clientsecret;
const sDestinationName = 'S4H';
*/

const { readDestination } = require("sap-cf-destconn");

exports.getDestination = async (req, res) => {
  var destiantionName = req.query.destiantionName;
  const destinationConfig = await readDestination(destiantionName);
  //destinationConfig["destinationConfiguration"];

  res.json({ result: destinationConfig });
};
