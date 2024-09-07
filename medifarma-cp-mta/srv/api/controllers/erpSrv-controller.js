

const DEST_NAME = "CP_S4H_HTTP_BASIC";
const BASE_URI = "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV";
const SRV_SPLIT2 = "Z_PP_CENTRALPESADAS_SRV2";
const SapCfAxios = require('sap-cf-axios').default;
const axios = SapCfAxios(DEST_NAME);
//const CP_S4H_HTTP_BASIC = SapCfAxios( /* destination name */ DEST_NAME, /* axios default config */ null,  /* X-CSRF-Token Config */ {method: 'get', url:'/'});



exports.getDinamic = async (req, res) => {
    const sSrv = (req.url).split(SRV_SPLIT2)[1];
    //console.log(sSrv); => /OrdenSet?$filter=Aufnr eq '300000146'
    try {
        var data = await sap.erp.get(BASE_URI + sSrv);
        //res.json(data);
        res.send(data);
    } catch (error) {
        res.status(400).send(error);
    }
};

var sap = {};
sap.erp = {
    get: async function (sPathSrv) {
        try {
            const response = await axios({
                method: "GET",
                url: sPathSrv,
                headers: {
                    "Accept": "application/json",
                    "content-type": "application/json"
                    //"X-CSRF-Token": "FETCH"
                },
                //"xsrfCookieName": "XSRF-TOKEN",
                //"xsrfHeaderName": "X-XSRF-TOKEN",
                withCredentials: true,
                params: {
                    "sap-client" : "150"
                }
            });
            return response;
        } catch (error) {
            console.log("ERROR ============");
            console.log(error);
            return error;
        }
    }
}
/*
let response = await CP_S4H_HTTP_BASIC({
    method: 'POST',
    url: '/Bookset',
    headers: {
        "content-type": "application/json"
    },
        data: {
        title: "Using Axios in SAP Cloud Foundry",
        author: "Joachim Van Praet"
    }
    xsrfHeaderName: "x-csrf-token",
    data: {vatNumber},
});
*/
