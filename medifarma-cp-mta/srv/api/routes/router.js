const router = require("express").Router();
const destination = require("../controllers/dest-controller");
const erpServices = require("../controllers/erpSrv-controller");
const erpsrv = require("../controllers/erpOdataSrv-controller");
const erpsrvTest = require("../controllers/erpOdataTestSrv-controller");
const iasServices = require("../controllers/ias-controller");
const zpl = require("../controllers/zplCode");
//var app = express();

//.../api/v1/cp/

const ERP_BASE_PATH3 = "/PRINT/";
const ERP_BASE_PATH = "/Z_PP_CENTRALPESADAS_SRV/";
const ERP_BASE_PATH1 = "/Z_PP_CENTRALPESADAS_SRV1/";
const ERP_BASE_PATH2 = "/Z_PP_CENTRALPESADAS_SRV2/";
module.exports = (app) => {
    app.use(router);
    /**
     * SERVICIOS DESTINATION
     */
    router.get("/dest/Name", destination.getDestination);

    /**
     * SERVICIOS IAS
     */
    router.get("/service/scim/Users", iasServices.readUserDinamic);
    router.post("/service/scim", iasServices.postDinamic);

    router.get(ERP_BASE_PATH3 + "ZplCode", zpl.postZebraZPL);

    /**
     * SERVICIOS ERP
     */
    router.get(ERP_BASE_PATH + "SociedadSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "CentroSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "CentroDesSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "AlmacenSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "OrdenSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "ReservaSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "MaterialSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "MaterialCaractSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "ListaMaterialSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "LoteCaractSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "SolpedSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "SolpedItemSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "SolpedMensajeSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "TrasladoHeadSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "TrasladoItemSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "TrasladoMensajeSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "StockSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "SeccionSet", erpsrv.getDinamic);
    router.get(ERP_BASE_PATH + "StatusSet", erpsrv.getDinamic);

    router.get(ERP_BASE_PATH + "StatusSet", erpsrv.getDinamic);

    router.get(ERP_BASE_PATH + "PEDIATENCSet", erpsrv.getDinamic);

    router.post(ERP_BASE_PATH + "TrasladoHeadSet", erpsrv.postDinamic);
    

    /**
     * PRUEBAS
     * */
    router.get(ERP_BASE_PATH1 + "OrdenSet", erpsrvTest.getDinamicOnPremise);
    router.get(ERP_BASE_PATH2 + "OrdenSet", erpServices.getDinamic);

    //module.exports = router;
};

//"express": "^4.17.1",
//"btoa": "^1.2.1",
//"axios": "^0.20.0",
//"sap-cf-destconn": "0.0.20",
//"sap-cf-axios": "^0.2.25",

//"request": "^2.88.2",
//"request-promise": "^4.2.6",
