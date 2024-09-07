const cds = require("@sap/cds");
const Helper = require("./lib/Helper");

module.exports = cds.service.impl(async (service) => {
  const db = await cds.connect.to("db");
  const { MasterSet } = service.entities;

  service.before("CREATE", MasterSet, async (context) => {
    console.log("Data");
    const masterId = new Helper({
      db: db,
      namespace: "COM_EVERIS",
      context: "SUPPLIERS",
      table: "MASTER",
      field: "ID",
    });
    context.data.id = await masterId.getNextNumber();
  });
});
