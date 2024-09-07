sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "../service/ajaxService",
  ],
  function (JSONModel, ajaxService) {
    "use strict";
    return {
      requestToken: function (oConfig) {
        /*
        //const oConfig = this.getOwnerComponent().getManifestEntry("/sap.ui5/oConfig");
        var config = {
            oauth: {
                url: "https://medifarmadevqas.authentication.us10.hana.ondemand.com",
                username: "",
                password: "",
                clientid: "sb--DEV!t28639",
                clientsecret: "nryXFAr6oD5qteg28B8NFTR5E9k=",
              }
            } 
        */

        let url = oConfig.oauth.url;
        url += "/oauth/token?grant_type=password";
        url += "&username=" + oConfig.oauth.username;
        url += "&password=" + oConfig.oauth.password;
        url += "&client_id=" + oConfig.oauth.clientid;
        url += "&clientsecret=" + oConfig.oauth.clientsecret;
        url += "&response_type=token";

        const headers = {
          Authorization:
            "Basic " +
            btoa(oConfig.oauth.clientid + ":" + oConfig.oauth.clientsecret),
        };

        return ajaxService.get(url, headers);
        //var token = await this.requestToken();
        //window.localStorage.setItem("token", token.access_token)
      },
    };
  }
);
