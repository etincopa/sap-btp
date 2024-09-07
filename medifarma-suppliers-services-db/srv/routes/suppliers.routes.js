const router = require("express").Router();
const controller = require("../controllers/suppliers.controller");

router.post("/getSharepointToken", controller.getSharepointToken);
router.post("/getSunatToken", controller.getSunatToken);
router.post("/getSunatResponse", controller.getSunatResponse);
router.post("/sunatApiResponse", controller.sunatApiResponse);
router.get("/getIasUserByUserName", controller.getIasUserByUserName);
router.get("/getIasUserByLastName", controller.getIasUserByLastName);
router.get("/getIasUserByEmail", controller.getIasUserByEmail);
router.get("/getIasUsers", controller.getIasUsers);
router.get("/getIasGroups", controller.getIasGroups);

module.exports = router;
