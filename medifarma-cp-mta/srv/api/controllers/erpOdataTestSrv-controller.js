const DEST_NAME = "CP_S4H_HTTP_BASIC";
const BASE_URI = "/sap/opu/odata/sap/Z_PP_CENTRALPESADAS_SRV";
const SRV_SPLIT1 = "Z_PP_CENTRALPESADAS_SRV1";
const SCPDestinationsOnPremise = require("../helper/scp-destination-onPremise");

exports.getDinamicOnPremise = async (req, res) => {
  var sSrv = req.url.split(SRV_SPLIT1)[1];
  sSrv = BASE_URI + sSrv;
  //console.log(sSrv); => /OrdenSet?$filter=Aufnr eq '300000146'
  try {
    const result = await SCPDestinationsOnPremise._getOnPremise(DEST_NAME, sSrv);
    
    res.json(result);
  } catch (oError) {
    res.send({ error: oError });
  }
};

