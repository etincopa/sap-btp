/*  Logon configuration used by packaged apps (N.B. We do not include the fioriclient 
 *  plugin to packaged apps but just borrow some of its configuration format.)
 *	The {{}} placeholder values, if any, will be populated before the first build. 
 *	The "appName" and "appVersion" will be updated with the input values in the build wizard.
 *	Do not change the "appID", "fioriURL" and "auth" values to avoid inconsistent 
 *	app settings.
 */
var fiori_client_appConfig = {
	"appName": "pesajeimpresionbultosaldo",
	"appVersion": "1.0.0",
	"appID": "com.sap.webide.xd2331fe23c8745fc8ce8378255e2f1fa",
	"fioriURL": "https://mobile-ororfalew9.us3.hana.ondemand.com:443",
	"auth": [
		{
			"type": "saml2.web.post",
			"config": {
				"saml2.web.post.authchallengeheader.name": "com.sap.cloud.security.login",
				"saml2.web.post.finish.endpoint.uri": "/SAMLAuthLauncher",
				"saml2.web.post.finish.endpoint.redirectparam": "finishEndpointParam"
			}
		}
	],
	"communicatorId": "REST"
};