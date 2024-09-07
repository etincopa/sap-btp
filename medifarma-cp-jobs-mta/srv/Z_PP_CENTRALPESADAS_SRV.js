const axios = require("axios");
const { readDestination } = require("sap-cf-destconn");
const xsenv = require("@sap/xsenv");

const DEST_NAME = "S4H_HTTP_BASIC_CP";
const BASE_URI = "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV";


const cds = require("@sap/cds");
cds.env.features.fetch_csrf = true; //'x-csrf-token': 'required'
module.exports = cds.service.impl(async function () {
    const {
        SociedadSet,
        CentroSet,
        CentroDesSet,
        AlmacenSet,
        OrdenSet,
        ReservaSet,
        MaterialSet,
        MaterialCaractSet,
        ListaMaterialSet,
        LoteCaractSet,
        SolpedSet,
        SolpedItemSet,
        SolpedMensajeSet,
        TrasladoHeadSet,
        TrasladoItemSet,
        TrasladoMensajeSet,
        StockSet,
        SeccionSet,
        StatusSet,
        TrasladoMobileSet,
    } = this.entities;
    //const service = await cdse.connect.to("Z_PP_CENTRALPESADAS_SRV");
    //this.on("READ", AlmacenSet, async () => { const result = await service.run({ url: BASE_URI + "AlmacenSet" }); return result.value; });

    const service = await cds.connect.to("Z_PP_CENTRALPESADAS_SRV");
    this.on("READ", SociedadSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", CentroSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", CentroDesSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", AlmacenSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", OrdenSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", ReservaSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", MaterialSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", MaterialCaractSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", ListaMaterialSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", LoteCaractSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", SolpedSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", SolpedItemSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", SolpedMensajeSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", TrasladoHeadSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", TrasladoItemSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", TrasladoMensajeSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", StockSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", SeccionSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", StatusSet, (req) => { return service.tx(req).run(req.query); });
    this.on("READ", TrasladoMobileSet, (req) => { return service.tx(req).run(req.query); });


    this.on("CREATE", TrasladoHeadSet, async (req) => { 
        /**
         * Formateo de fecha por error de:
         * - Conversion error for property 'Bldat' at offset '65'
         * "Budat":"2021-11-29T00:00:00Z" -> "Budat":"2021-11-29T00:00:00.0000000"
        */
        var aBldat = (req.data.Bldat).split("T");
        var aBudat = (req.data.Budat).split("T");
        req.data.Bldat = aBldat[0] + "T00:00:00.0000000";
        req.data.Budat = aBudat[0] + "T00:00:00.0000000";

        var oParam = {
            sSrv : BASE_URI + "/TrasladoHeadSet",
            oData : req.data
        };
        try {
            var data = await erpOdata.post(oParam);
            return data;
        } catch (error) {
            return req.reject(error);
        }

        /*
        try {
            return await service.tx(req).run(req.query); 
            
        } catch (err) {
            return req.reject(err);
        }
        */
        //return await service.transaction().run(req.query);
    });
        
    this.on("CREATE", TrasladoItemSet, (req) => { return service.tx(req).run(req.query); });
    this.on("CREATE", TrasladoMensajeSet, (req) => { return service.tx(req).run(req.query); });
    this.on("CREATE", TrasladoMobileSet, (req) => { 
        var aBldat = (req.data.Bldat).split("T");
        var aBudat = (req.data.Budat).split("T");
        req.data.Bldat = aBldat[0] + "T00:00:00.0000000";
        req.data.Budat = aBudat[0] + "T00:00:00.0000000";
        return service.tx(req).run(req.query); 
    });


    //# ------------------------------------------------------------
    //#   CUSTOM METHODS POST:  ACTION
    //# ------------------------------------------------------------
    this.on("acTrasladoHeadSet", async (req) => {
        var oData = JSON.parse(req.data.data);
        var aBldat = (oData.Bldat).split("T");
        var aBudat = (oData.Budat).split("T");
        oData.Bldat = aBldat[0] + "T00:00:00.0000000";
        oData.Budat = aBudat[0] + "T00:00:00.0000000";

        var oParam = {
            sSrv : BASE_URI + "/TrasladoHeadSet",
            oData : oData
        };
        try {
            var data = await erpOdata.post(oParam);
            return data;
        } catch (error) {
            return req.reject(error);
        }
    });

    //# ------------------------------------------------------------
    //#   CUSTOM METHODS GET:  FUNCTION
    //# ------------------------------------------------------------
    this.on("fnTrasladoHeadSet", async (req) => {
        
        var oData = JSON.parse(req.data.data);
        var aBldat = (oData.Bldat).split("T");
        var aBudat = (oData.Budat).split("T");
        oData.Bldat = aBldat[0] + "T00:00:00.0000000";
        oData.Budat = aBudat[0] + "T00:00:00.0000000";
       
        var oParam = {
            sSrv : BASE_URI + "/TrasladoHeadSet",
            oData : oData
        };
        try {
            var data = await erpOdata.post(oParam);
            return data;
        } catch (error) {
            return req.reject(error);
        }
    });
});


/*const buildQuery = (entity, columns, filter) => {
    if (filter) {
        return SELECT.from(entity)
            .columns(columns)
            .where(filter)
    } else {
        return SELECT.from(entity)
            .columns(columns)
    }
};*/


var erpOdata = {
    get: async function (sPathSrv) {
        try {
            const oDest = await erpOdata.destination();
            const oConn = await erpOdata.connectivity();
            var oUrl = new URL(oDest.URL);

            const { data } = await axios({
                method: "GET",
                url: sPathSrv,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                },
                /*auth: {
                    username: sClientId,
                    password: sClientSecret
                },*/
                params: {
                    "sap-client": oDest["sap-client"]
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin
            });

            return data;
        } catch (error) {
            console.log(error)
            return { error: error };
        }
    },
    post: async function (oParam) {

        try {
            const oDest = await erpOdata.destination();
            const oConn = await erpOdata.connectivity();
            var oUrl = new URL(oDest.URL);

            const oCSRFToken = await erpOdata.getCSRFToken(oDest, oConn);
            const { data } = await axios({
                method: "post",
                url: oParam.sSrv,
                //data: JSON.stringify(oParam.oData),
                data: oParam.oData,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    'X-CSRF-Token': oCSRFToken['x-csrf-token'],
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                    Cookie: oCSRFToken['set-cookie']
                },
                //xsrfCookieName: 'CSRF-TOKEN',
                //xsrfHeaderName: 'X-CSRF-Token',
                //withCredentials: true,
                params: {
                    "sap-client": oDest["sap-client"]
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin
            });

            return data;
        } catch (error) {
            return { error: error };
        }
    },
    getCSRFToken: async function (oDest, oConn) {
        try {
            var oUrl = new URL(oDest.URL);

            const { headers } = await axios({
                method: "GET",
                url: BASE_URI + "/",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    'X-CSRF-Token': 'Fetch',
                    Authorization: oDest.token,
                    "Proxy-Authorization": oConn.token,
                },
                params: {
                    "sap-client": oDest["sap-client"]
                },
                proxy: {
                    host: oConn.onpremise_proxy_host,
                    port: oConn.onpremise_proxy_http_port,
                    //protocol: "http"
                },
                baseURL: oUrl.origin
            });

            return headers;
        } catch (error) {
            console.log(error)
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
                const sToken = Buffer.from(
                    `${sClientId}:${sClientSecret}`
                ).toString("base64");

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

            const sJwtToken = await erpOdata._fetchJwtToken(
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
}


/*
POST http://localhost:4004/v2/Z_PP_CENTRALPESADAS_SRV/TrasladoHeadSet
Request body:
{
    Mblnr: "",
    Mjahr: "",
    Zflag: "4",
    Bldat: "2021-11-29T00:00:00.0000000",
    Budat: "2021-11-29T00:00:00.0000000",
    Usnam: "",
    TrasladoItemSet: [
        {
        Mblnr: "",
        Mjahr: "",
        Zeile: "",
        Bwart: "",
        Matnr: "1000010011",
        Werks: "1020",
        Lgort: "P014",
        Erfmg: "1000",
        Umwrk: "",
        Umlgo: "",
        Charg: "0000000320",
        Kostl: "10001S4300",
        },
    ],
    }
*/