sap.ui.define(
  ["sap/base/Log", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
  function (Log, Filter, FilterOperator) {
    "use strict";
    return {
      backend: {
        /**
         * Pass a model defined in manifest.json. For example:
         * ```
         *  "UTILS_SRV": {
         *     "uri": "saperp/eper/UTILS_SRV/",
         *     "type": "OData",
         *     "settings": {
         *       "odataVersion": "2.0"
         *     }
         *   }
         * ```
         * @param {Object} eperUtilsModel Model
         */
        initialize: function (eperUtilsModel) {
          this.eperUtilsModel = eperUtilsModel;
        },
        /**
         * Returns information from /EPER/TCONSTANTS table.
         * @param {String} application Application
         * @param {String} group Group
         * @returns {Array} Array of parameters
         */
        getParameters: function (application, group) {
          return new Promise((resolve, reject) => {
            this.eperUtilsModel.read("/ParameterSet", {
              filters: [
                new Filter("Application", FilterOperator.EQ, application),
                new Filter("Group1", FilterOperator.EQ, group),
              ],
              success: (result, status, error) => {
                Log.info("[UTILS] Backend - getParameters - results length", result.results ? result.results.length : 0);
                resolve(result.results || []);
              },
              error: (result, status, error) => {
                Log.error(error);
                reject(error);
              },
            });
          });
        },
      },
    };
  }
);
