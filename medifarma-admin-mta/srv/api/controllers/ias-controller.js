const axios = require("axios").default;
const btoa = require("btoa");
const https = require("https");
const { readDestination } = require("sap-cf-destconn");
const SCIM_DEST_NAME = "IAS_SCIM_API";
const SCIM_DEST_PATH = "/service/scim/";
const SCIM_SPLIT = "/scim/";
exports.readUserDinamic = async (req, res) => {
  //../api/v1/cp/service/scim/Users?filter=id eq 'P000021' and emails eq 'elvis.percy.garcia.tincopa@everis.com'
  const sSrv = req.url.split(SCIM_SPLIT)[1];
  var href = SCIM_DEST_PATH + sSrv;
  try {
    var data = await ias.scim.get(href);
    res.json(data);
  } catch (error) {
    res.json({ error: error });
  }
};

exports.checkCredential = async (auth) => {
  var sPath = "/service/users/password";
  const destinationConfig = await readDestination(SCIM_DEST_NAME);
  const oConfig = destinationConfig.destinationConfiguration;

  var oUrl = new URL(oConfig.URL);
  var sUrl = oUrl.origin;
  var href = sUrl + "" + sPath;

  try {
    const { data } = await axios({
      method: "post",
      url: href,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    });
    return data;
  } catch (error) {
    return { error: error };
  }
};

exports.postDinamic = async (req, res) => {
  /*
    POST:
    {
      "scim": {
        "pathname": "/service/scim/",
        "srv": "Users?filter=id eq 'P000021'",
        "method": "get"
      }
    }
    */

  const destinationConfig = await readDestination(SCIM_DEST_NAME);
  const oConfig = destinationConfig.destinationConfiguration;

  var oScim = req.body.scim;
  var oUrl = new URL(oConfig.URL);
  var sClientId = oConfig.User;
  var sClientSecret = oConfig.Password;
  var sUrl = oUrl.origin;
  var href = sUrl + "" + oScim.pathname + "" + oScim.srv;

  try {
    const { data } = await axios({
      method: oScim.method,
      url: href,
      headers: {
        "Content-Type": "application/scim+json",
        Authorization: `Basic ${btoa(`${sClientId}:${sClientSecret}`)}`,
      },
      //,data: JSON.stringify(oBody)
    });

    res.send(data);
  } catch (error) {
    // Handle possible errors
    res.send({ error: error });
  }
};

exports.readDinamic = async (href) => {
  try {
    var data = await ias.scim.get(href);
    return data;
  } catch (error) {
    return { error: error };
  }
};

var ias = {};
ias.scim = {
  get: async function (href) {
    //href: /service/scim/Users?filter=emails eq 'elvis.percy.garcia.tincopa@everis.com' (Deprecated)
    //href: /scim/Users?filter=emails.value eq 'elvis.percy.garcia.tincopa@everis.com' (IdDS SCIM)
    try {
      const destinationConfig = await readDestination(SCIM_DEST_NAME);
      const oConfig = destinationConfig.destinationConfiguration;

      var sBaseUrl = "/scim/";
      var oUrl = new URL(oConfig.URL);
      var sUrl = oUrl.origin + "" + sBaseUrl + "" + href;
      var oAxios = {};
      if (
        destinationConfig.certificates &&
        destinationConfig.certificates.length
      ) {
        const httpsAgent = new https.Agent({
          pfx: Buffer.from(destinationConfig.certificates[0].Content, "base64"),
          passphrase: oConfig.KeyStorePassword,
        });
        oAxios = {
          method: "get",
          url: sUrl,
          headers: {
            "Content-Type": "application/scim+json",
          },
          httpsAgent: httpsAgent,
        };
      } else {
        var sClientId = oConfig.User;
        var sClientSecret = oConfig.Password;
        oAxios = {
          method: "get",
          url: sUrl,
          headers: {
            "Content-Type": "application/scim+json",
            Authorization: `Basic ${btoa(`${sClientId}:${sClientSecret}`)}`,
          },
        };
      }

      const { data } = await axios(oAxios);

      return data;
    } catch (error) {
      return { error: error };
    }
  },
};
