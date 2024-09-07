import querystring from 'querystring';
import axios from 'axios';
import xsenv from '@sap/xsenv';
import btoa from 'btoa';

export default class SCPDestinations {
  static async getDestinationInfo(destinationName) {
    try {
      const destSrv = xsenv.getServices({ dest: 'dest_clinicainternacional' })
        .dest;
      const uaaSrv = xsenv.getServices({ uaa: 'uaa_clinicainternacional' }).uaa;

      const sUaaCreds = `${destSrv.clientid}:${destSrv.clientsecret}`;
      const b64Creds = btoa(`Basic ${sUaaCreds}`);

      const auth = await axios.post(
        `${uaaSrv.url}/oauth/token`,
        querystring.stringify({
          client_id: destSrv.clientid,
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            Authorization: b64Creds,
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const token = auth.data.access_token;

      const oDestination = await axios.get(
        `${destSrv.uri}/destination-configuration/v1/destinations/${destinationName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(oDestination.data);
      return oDestination.data;

      /*
      const b64Credential = `Basic ${Buffer.from(sUaaCreds).toString(
        'base64'
      )}`; */

      /* const bodyFormData = new FormData();
      bodyFormData.append('client_id', dest_service.clientid);
      bodyFormData.append('grant_type', 'client_credentials'); */

      // res.status(200).json({ result: destination.data });
    } catch (error) {
      throw new Error(error.message || 'Internal Server Error');
      // res.status(500).json({ error: error.message || 'Todo se derrumbo' });
    }
  }
}
