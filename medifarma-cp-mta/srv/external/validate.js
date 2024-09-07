const cds = require("@sap/cds");
class OpenWeatherApi extends cds.RemoteService {
    async init() {
      
      this.before("READ", "*", (req) => {
        try {
          console.log(req)
        } catch (error) {
          req.reject(400, error.message);
        }
      });
    }
  }