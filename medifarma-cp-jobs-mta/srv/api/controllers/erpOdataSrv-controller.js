const axios = require("axios");
//const btoa = require("btoa");
const { readDestination } = require("sap-cf-destconn");
const xsenv = require("@sap/xsenv");

const DEST_NAME = "S4H_HTTP_BASIC_CP";
const BASE_URI = "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV";
const SRV_SPLIT = "Z_PP_CENTRALPESADAS_SRV";
const isLocal = false;

exports.getDinamicSet = async (sSrv) => {
    try {
        var data = await sap2.erp.get(BASE_URI + sSrv);
        return data;
    } catch (error) {
        return error;
    }
};
exports.postDinamicSet = async (sSrv, oBody) => {
    //console.log(sSrv); => /OrdenSet
    try {
        var oParam = {
            sSrv: BASE_URI + sSrv,
            oData: oBody,
        };
        var data = await sap2.erp.post(oParam);
        return data;
    } catch (error) {
        return error;
    }
};

exports.getDinamic = async (req, res) => {
    const sSrv = req.url.split(SRV_SPLIT)[1];
    //console.log(sSrv); => /OrdenSet?$filter=Aufnr eq '300000146'
    try {
        var data = await sap2.erp.get(BASE_URI + sSrv);
        res.json(data);
    } catch (error) {
        res.json({ error: error });
    }
};
exports.postDinamic = async (req, res) => {
    const sSrv = req.url.split(SRV_SPLIT)[1];
    //console.log(sSrv); => /OrdenSet
    try {
        var oParam = {
            sSrv: BASE_URI + sSrv,
            oData: req.body,
        };
        var data = await sap2.erp.post(oParam);
        res.json(data);
    } catch (error) {
        res.json({ error: error });
    }
};

var sap2 = {};
sap2.erp = {
    get: async function (sPathSrv) {
        try {
            if (!isLocal) {
                const oDest = await sap2.erp.destination();
                const oConn = await sap2.erp.connectivity();
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
                }).catch((error) => {
                    if (error.response) {
                        console.log("Solicitud realizada y servidor responde con error.");
                        //console.log(error.response.data);
                        return error.response;
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(
                            "Se realizó la solicitud pero no se recibió respuesta."
                        );
                        //console.log(error.request);
                        error.data = error.request;
                        return error;
                    } else {
                        console.log(
                            "Algo sucedió al configurar la solicitud que provocó un error."
                        );
                        console.log("Error", error.message);
                        error.data = error;
                        return error;
                    }
                });

                return data;
            } else {
                const { data } = await axios({
                    method: "GET",
                    url:
                        "https://medifarmadevqas-dev-rmd-cp-cp-approuter.cfapps.us10.hana.ondemand.com/commedifarmacpmanejopedidos/~100522003252+0000~/saperp" +
                        sPathSrv,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    params: {
                        "sap-client": "150",
                    },
                }).catch((error) => {
                    if (error.response) {
                        console.log("Solicitud realizada y servidor responde con error.");
                        //console.log(error.response.data);
                        return error.response;
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(
                            "Se realizó la solicitud pero no se recibió respuesta."
                        );
                        //console.log(error.request);
                        error.data = error.request;
                        return error;
                    } else {
                        console.log(
                            "Algo sucedió al configurar la solicitud que provocó un error."
                        );
                        console.log("Error", error.message);
                        error.data = error;
                        return error;
                    }
                });
                return data;
            }
        } catch (error) {
            console.log(error);
            return { error: error };
        }
    },
    post: async function (oParam) {
        try {
            if (!isLocal) {
                const oDest = await sap2.erp.destination();
                const oConn = await sap2.erp.connectivity();
                var oUrl = new URL(oDest.URL);

                const oCSRFToken = await sap2.erp.getCSRFToken(oDest, oConn);
                const { data } = await axios({
                    method: "POST",
                    url: oParam.sSrv,
                    //data: JSON.stringify(oParam.oData),
                    data: oParam.oData,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-token": oCSRFToken["x-csrf-token"],
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
                }).catch((error) => {
                    if (error.response) {
                        console.log("Servidor responde con error.");
                        console.log(
                            error.response.data ? error.response.data.error.message.value : ""
                        );
                        return error.response;
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(
                            "Se realizó la solicitud pero no se recibió respuesta."
                        );
                        //console.log(error.request);
                        error.data = error.request;
                        return error;
                    } else {
                        console.log(
                            "Algo sucedió al configurar la solicitud que provocó un error."
                        );
                        console.log("Error", error.message);
                        error.data = error;
                        return error;
                    }
                });

                return data;
            } else {
                const oCSRFToken = await sap2.erp.getCSRFToken(null, null);
                const { data } = await axios({
                    method: "POST",
                    url:
                        "https://medifarmadevqas-dev-rmd-cp-cp-approuter.cfapps.us10.hana.ondemand.com/commedifarmacpmanejopedidos/~100522003252+0000~/saperp" +
                        oParam.sSrv,
                    data: oParam.oData,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-token": oCSRFToken["x-csrf-token"],
                        Cookie: oCSRFToken["set-cookie"],
                    },
                    params: {
                        "sap-client": "150",
                    },
                }).catch((error) => {
                    if (error.response) {
                        console.log("Servidor responde con error.");
                        console.log(
                            error.response.data ? error.response.data.error.message.value : ""
                        );
                        return error.response;
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(
                            "Se realizó la solicitud pero no se recibió respuesta."
                        );
                        //console.log(error.request);
                        error.data = error.request;
                        return error;
                    } else {
                        console.log(
                            "Algo sucedió al configurar la solicitud que provocó un error."
                        );
                        console.log("Error", error.message);
                        error.data = error;
                        return error;
                    }
                });
                return data;
            }
        } catch (error) {
            return { error: error };
        }
    },
    getCSRFToken: async function (oDest, oConn) {
        try {
            if (!isLocal) {
                var oUrl = new URL(oDest.URL);

                const { headers } = await axios({
                    method: "GET",
                    url: BASE_URI + "/",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-token": "Fetch",
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
                }); /*.catch((error) => {
          if (error.response) {
            console.log("Solicitud realizada y servidor responde con error.");
            //console.log(error.response.data);
            return error.response;
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(
              "Se realizó la solicitud pero no se recibió respuesta."
            );
            //console.log(error.request);
            error.data = error.request;
            return error;
          } else {
            console.log(
              "Algo sucedió al configurar la solicitud que provocó un error."
            );
            console.log("Error", error.message);
            error.data = error;
            return error;
          }
        })*/

                return headers;
            } else {
                const { headers } = await axios({
                    method: "GET",
                    url:
                        "https://medifarmadevqas-dev-rmd-cp-cp-approuter.cfapps.us10.hana.ondemand.com/commedifarmacpmanejopedidos/~100522003252+0000~/saperp" +
                        BASE_URI +
                        "/",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-token": "Fetch",
                    },
                    params: {
                        "sap-client": "150",
                    },
                }); /*.catch((error) => {
          if (error.response) {
            console.log("Solicitud realizada y servidor responde con error.");
            //console.log(error.response.data);
            return error.response;
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(
              "Se realizó la solicitud pero no se recibió respuesta."
            );
            //console.log(error.request);
            error.data = error.request;
            return error;
          } else {
            console.log(
              "Algo sucedió al configurar la solicitud que provocó un error."
            );
            console.log("Error", error.message);
            error.data = error;
            return error;
          }
        })*/
                return headers;
            }
        } catch (error) {
            console.log(error);
            return { error: error };
        }
    },
    destination: async function () {
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
            return { error: error };
        }
    },
    connectivity: async function () {
        try {
            const oConfig = await xsenv.getServices({
                conn: "centralPesadas_connectivity",
            }).conn;

            const sJwtToken = await sap2.erp._fetchJwtToken(
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
