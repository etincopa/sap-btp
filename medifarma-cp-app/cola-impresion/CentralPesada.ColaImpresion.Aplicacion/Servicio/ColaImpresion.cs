using CentralPesada.ColaImpresion.Aplicacion.Modelo;
using RestSharp;
using RestSharp.Authenticators;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
namespace CentralPesada.ColaImpresion.Aplicacion.Servicio
{
    public class ColaImpresion
    {
        private RestClient _client;
        private RestClient _clientQAS;
        private RestClient _clientAuth;
        public string ClientUri;
        public string ClientId;
        public string ClientSecret;

        public ColaImpresion() { }

        public ColaImpresion(string client_uri, string client_id, string client_secret) {
            this.ClientUri = client_uri;
            this.ClientId = client_id;
            this.ClientSecret = client_secret;
        }

        public void LogWrite(string logMessage)
        {
            var m_exePath = new FileInfo(Assembly.GetEntryAssembly().Location).Directory.ToString();
            try
            {
                string sDate = "_" + DateTime.Now.ToString("MM-dd-yyyy");
                using (StreamWriter w = File.AppendText(m_exePath + "\\" + "log" + sDate + ".txt"))
                {
                    Log(logMessage, w);
                }
                
            }
            catch (Exception ex)
            {
            }
        }
        public void Log(string logMessage, TextWriter txtWriter)
        {
            try
            {
                txtWriter.Write("\r\nLog Entry : ");
                txtWriter.WriteLine("{0} {1}", DateTime.Now.ToLongTimeString(),
                    DateTime.Now.ToLongDateString());
                txtWriter.WriteLine("  :{0}", logMessage);
                txtWriter.WriteLine("-------------------------------");
            }
            catch (Exception ex)
            {
            }
        }
        public bool Abrir(string sUrl)
        {
            bool connect = false;
            try
            {
                _client = new RestClient(sUrl);
                connect = true;
            }
            catch
            {
                connect = false;
            }
            return connect;
        }
        public ListaColaImpresion ObtenerColaImpresion(string sIP)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            //obtener token
            string token = this.ObtenerToken();

            //armar solicitud con el token generado
            var request = new RestRequest("/COLA_IMPRESION?$expand=oImpresora,oPlantilla,aVariables&$filter=enviados eq false and contains(oImpresora/direccion,'" + sIP + "')", Method.GET);
            //var request = new RestRequest("/COLA_IMPRESION?$expand=oImpresora,oPlantilla,aVariables&$filter=(colaImpresionId eq '2199c92b-16be-4fd0-92be-63389786eb4e') and enviados eq true and contains(oImpresora/direccion,'" + sIP + "')", Method.GET);
            request.AddHeader("Authorization", "bearer " + token);
            

            var response = _client.Get<ListaColaImpresion>(request);
            return response.Data;
        }
        
        public ListaColaImpresion ObtenerImpresora(string sImpresoraId)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            //obtener token
            string token = this.ObtenerToken();

            //armar solicitud con el token generado
            var request = new RestRequest("/IMPRESORA?$expand=oPlanta&$filter=impresoraId eq '" + sImpresoraId + "'", Method.GET);
            request.AddHeader("Authorization", "bearer " + token);
            //var request = new RestRequest("/COLA_IMPRESION?$expand=oImpresora,oPlantilla,aVariables&$filter=colaImpresionId eq 'dd5a4c62-4275-4d6b-bc1e-795353a81464'", Method.GET);

            var response = _client.Get<ListaColaImpresion>(request);
            return response.Data;
        }
        public List<Variable> ObtenerVariables(string colaImpresionId)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            //obtener token
            string token = this.ObtenerToken();

            var request = new RestRequest("/COLA_IMPRESION_VARIABLES?$filter=oColaImpresion_colaImpresionId eq '" + colaImpresionId.ToLower() + "'", Method.GET);
            request.AddHeader("Authorization", "bearer " + token);

            var response = _client.Get<List<Variable>>(request);
            return response.Data;
        }


        public void ActualizarColaImpresion(Modelo.Value colaImpresion) {
            //obtener token
            string token = this.ObtenerToken();

            //armar solicitud con el token generado
            var request = new RestRequest("/COLA_IMPRESION('" + colaImpresion.colaImpresionId + "')", Method.PUT);
            request.AddHeader("Authorization", "bearer " + token);
            var obj = new Modelo.ColaImpresion();
            obj.colaImpresionId = colaImpresion.colaImpresionId;
            obj.oImpresora_impresoraId = colaImpresion.oImpresora_impresoraId;
            obj.oPlantilla_plantillaImpresionId = colaImpresion.oPlantilla_plantillaImpresionId;
            obj.enviados = true;
            obj.enviadoIp = colaImpresion.enviadoIp;
            obj.descripcion = colaImpresion.descripcion;
            obj.copias = colaImpresion.copias;
            obj.fechaActualiza = new DateTime();
            obj.usuarioActualiza = "SYS";
            request.AddJsonBody(obj);
            _client.Put(request);
        }

        public String ObtenerToken()
        {
            String token = "";
            String client_uri = this.ClientUri;
            String client_id = this.ClientId;
            String client_secret = this.ClientSecret;
            String clientBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(client_id + ":" + client_secret));

            try
            {
                _clientAuth = new RestClient(client_uri);
                var request = new RestRequest("/oauth/token?grant_type=client_credentials");
                request.AddHeader("Content-Type", "application/x-www-form-urlencoded");
                request.AddHeader("Authorization", "Basic " + clientBase64);
                var response = _clientAuth.Post<ResponseToken>(request);
                if (response.Data != null) {
                    token = response.Data.access_token;
                }
            }
            catch
            {
                token = "";
            }

            return token;
        }

        public void Cerrar()
        {
            _client = null;
            _clientQAS = null;
            _clientAuth = null;
        }
    }
}