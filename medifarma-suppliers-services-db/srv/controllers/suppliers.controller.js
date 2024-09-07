const axios = require("axios").default;
const btoa = require("btoa");
const https = require("https");
const cds = require("@sap/cds");
const { readDestination } = require("sap-cf-destconn");
const SCIM_DEST_NAME = "IAS_SCIM_API";

exports.getSharepointToken = async (req, res) => {
  try {
    let { grant_type, client_id, client_secret, resource, myUrl } = req.body;

    var config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const params = new URLSearchParams();
    params.append("grant_type", grant_type);
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("resource", resource);

    let { data } = await axios.post(myUrl, params, config);

    console.log(data);

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", reason: "Fallamos exitosamente" });
  }
};

exports.getSunatToken = async (req, res) => {
  try {
    let { grant_type, client_id, client_secret, scope, myUrl } = req.body;

    var config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("scope", scope);

    let { data } = await axios.post(myUrl, params, config);

    console.log(data);

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", reason: "Fallamos exitosamente" });
  }
};

exports.getSunatResponse = async (req, res) => {
  try {
    let {
      numRuc,
      codComp,
      numeroSerie,
      numero,
      fechaEmision,
      monto,
      myUrl,
      authorization,
    } = req.body;
    const data_ = {
      numRuc: numRuc,
      codComp: codComp,
      numeroSerie: numeroSerie,
      numero: numero,
      fechaEmision: fechaEmision,
      monto: monto,
    };
    var config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    };
    let { data } = await axios.post(myUrl, data_, config);
    console.log(data);
    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", reason: "Fallamos exitosamente" });
  }
};

exports.sunatApiResponse = async (req, res) => {
  try {
    const { Master } = cds.entities("com.everis.suppliers");
    let tableName = "VARIABLES_SUNAT";

    let url_token = "url_token";
    let client_id = "client_id";
    let client_secret = "client_secret";
    let scope = "scope";
    url_token = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: url_token } });
    client_id = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: client_id } });
    client_secret = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: client_secret } });
    scope = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: scope } });

    var config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", client_id.valueLow);
    params.append("client_secret", client_secret.valueLow);
    params.append("scope", scope.valueLow);

    let tokenSunat = await axios.post(url_token.valueLow, params, config);

    let {
      numRuc,
      codComp,
      numeroSerie,
      numero,
      fechaEmision,
      monto,
      numRucAcreedor,
    } = req.body;
    let uriSunatPart1 = "uriSunatPart1";
    let uriSunatPart2 = "uriSunatPart2";
    uriSunatPart1 = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: uriSunatPart1 } });
    uriSunatPart2 = await SELECT.one
      .from(Master)
      .where({ tableName: tableName, and: { code: uriSunatPart2 } });

    let myUrl =
      uriSunatPart1.valueLow + numRucAcreedor + uriSunatPart2.valueLow;

    const data_ = {
      numRuc: numRuc,
      codComp: codComp,
      numeroSerie: numeroSerie,
      numero: numero,
      fechaEmision: fechaEmision,
      monto: monto,
    };

    var config = {
      headers: {
        Authorization: "Bearer " + tokenSunat.data.access_token,
        "Content-Type": "application/json",
      },
    };

    let dataResponse = await axios.post(myUrl, data_, config);
    console.log("dataResponse");
    console.log(dataResponse);

    res.status(200).json({ status: "success", data: dataResponse.data });
  } catch (error) {
    console.log("error.response.data");
    console.log(error.response.data);

    res.status(500).json({ status: "error", reason: "Fallamos exitosamente" });
  }
};

exports.getIasUserByUserName = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    const requestData = req.query;
    var userName = requestData.userName;
    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users?filter=userName eq "' + userName + '"';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.getIasUserByLastName = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    const requestData = req.query;
    var lastName = requestData.lastName;
    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users?filter=name.familyName eq "' + lastName + '"';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.getIasUserByEmail = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    const requestData = req.query;
    var email = requestData.email;
    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users?filter=emails.value eq "' + email + '"';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.getIasUsers = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.getIasGroups = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Groups';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.updateIasUser = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    const requestData = req.params;
    var email = requestData.email;
    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users?filter=emails.value eq "' + email + '"';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}

exports.updateIasGroup = async (req, res) => {
  try {
    const destinationConfig = await readDestination(SCIM_DEST_NAME);
    const oConfig = destinationConfig.destinationConfiguration;

    const requestData = req.params;
    var email = requestData.email;
    var sBaseUrl = "/scim/";
    var oUrl = new URL(oConfig.URL);
    var sEntity = 'Users?filter=emails.value eq "' + email + '"';
    var sUrl = oUrl.origin + "" + sBaseUrl + "" + sEntity;
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

    res.status(200).json({ status: "success", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", reason: error.message });
  }
}