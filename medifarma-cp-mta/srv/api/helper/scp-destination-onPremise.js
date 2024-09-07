const axios = require("axios");
const xsenv = require("@sap/xsenv");
//const btoa = require("btoa");
module.exports = {
  async _getOnPremise(sDestinationName, sUrl) {
    const destSrv = await xsenv.getServices({
      dest: "centralPesadas_destination",
    }).dest;
    const connSrv = await xsenv.getServices({
      conn: "centralPesadas_connectivity",
    }).conn;
    /*const uaaSrv = await xsenv.getServices({
      uaa: "centralPesadas_uaa",
    }).uaa;*/

    // call destination service
    const destJwtToken = await onPremise._fetchJwtToken(
      destSrv.url,
      destSrv.clientid,
      destSrv.clientsecret
    );
    const destiConfi = await onPremise._readDestinationConfig(
      sDestinationName,
      destSrv.uri,
      destJwtToken
    );

    // call connectivity service
    const connJwtToken = await onPremise._fetchJwtToken(
      connSrv.token_service_url,
      connSrv.clientid,
      connSrv.clientsecret
    );

    const oConfig = onPremise._buildAxiosGet(
      connSrv.onpremise_proxy_host,
      connSrv.onpremise_proxy_http_port,
      connJwtToken,
      destiConfi
    );
    const result = await onPremise._callOnPremGet(sUrl, oConfig);

    return result;
  },
};

var onPremise = {
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

  // Call Destination Service. Result will be an object with Destination Configuration info
  _readDestinationConfig: async function (destinationName, destUri, jwtToken) {
    return new Promise((resolve, reject) => {
      const destSrvUrl =
        destUri +
        "/destination-configuration/v1/destinations/" +
        destinationName;
      const config = {
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      };
      axios
        .get(destSrvUrl, config)
        .then((response) => {
          resolve(response.data.destinationConfiguration);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  _buildAxiosGet: function (
    connProxyHost,
    connProxyPort,
    connJwtToken,
    destiConfi
  ) {
    const encodedUser = Buffer.from(
      destiConfi.User + ":" + destiConfi.Password
    ).toString("base64");

    var oUrl = new URL(destiConfi.URL);

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Basic " + encodedUser,
        "Proxy-Authorization": "Bearer " + connJwtToken,
        //'SAP-Connectivity-SCC-Location_ID': destiConfi.CloudConnectorLocationId
      },
      params: {
        "sap-client": destiConfi["sap-client"],
      },
      proxy: {
        host: connProxyHost,
        port: connProxyPort,
        //protocol: "http"
      },
      baseURL: oUrl.origin,
    };

    return config;
  },

  _callOnPremGet: async function (sUrl, oConfig) {
    return new Promise((resolve, reject) => {
      axios
        .get(sUrl, oConfig)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
