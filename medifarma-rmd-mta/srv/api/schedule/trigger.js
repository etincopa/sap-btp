const CronJob= require("cron").CronJob;
const {createQuery} = require('./job');

//add CDS
const cdsScope = require("@sap/cds");


const jobSchedule = async (cds) => {
    try {

      
    const db = await cdsScope.connect.to("db");
    // const serviceRMD = await cds.connect.to("db");
    let { MIF_ADMIN_HDI_MAESTRA } = db.entities;
    // let payMDRecetas = await db
    // .tx(cds)
    // .run(SELECT.from`MIF_ADMIN_HDI_MAESTRA`.where`oMaestraTipo_maestraTipoId in (40)`);
    const aMaestra = await SELECT.from(MIF_ADMIN_HDI_MAESTRA).where({ oMaestraTipo_maestraTipoId:'40', codigo:'jobs' });

    const string = aMaestra[0]["contenido"];

    console.log("================")
    console.log("aMaestra",string)
    console.log("================")
  

    node_env = process.env.NODE_ENV || "DEV";
    //   const db = await cds.connect.to("db");
     
      // let textoJson;
      // here call to the function of configuration
      console.log("---------------");
      console.log("PROCESS : ", node_env);
      console.log("---------------");
      var instanceIndex = process.env.CF_INSTANCE_INDEX || 0;
      if (instanceIndex == 0) {
        // textoJson = "Job Executing";
        if (node_env == "development" || node_env == "DEV" ) {
          await createQuery(db);
          console.log("run jobs in localhost");
        } else {
            console.log("Executing in PRD");
            let job = new CronJob(
              // "1 7,11,14 * * 1-5",
              string,
              async () => {
                try {
                  console.log("Executing");
                  await createQuery(db);
                } catch (err) {
                  console.error("Hubo un error", err.toString());
                }
              },
              null,
              true,
              "America/Lima"
            );
            job.start();

        }
      }
    } catch (error) {
        console.error("Error when tried execute jobsSchedule");
        console.log(error);
    }
  };

module.exports = jobSchedule;