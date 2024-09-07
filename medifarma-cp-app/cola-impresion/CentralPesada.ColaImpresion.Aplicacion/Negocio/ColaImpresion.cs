using CentralPesada.ColaImpresion.Aplicacion.Modelo;
using CentralPesada.ColaImpresion.Aplicacion.Servicio;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
namespace CentralPesada.ColaImpresion.Aplicacion.Negocio
{
    public class ColaImpresion
    {
        public void Iniciar(string sUrl, string sIP, string client_uri, string client_id, string client_secret)
        {
            EventLog log = new EventLog();
            log.Source = "ColaImpresion";


            Servicio.ColaImpresion colaImpresion = new Servicio.ColaImpresion(client_uri, client_id, client_secret);

            bool conexion = false;

            string sIpHost = "";
            
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    sIpHost = ip.ToString();
                }
            }

            conexion = colaImpresion.Abrir(sUrl);

            while (true)
            {
                try
                {
                    /*
                     * Verifica si la IP ingresada en el archivo de configuración (app.config) es valida.
                     * Caso contrario tomara la ip del Servidor
                     */
                    string _sIP = RemoveWhitespace(sIP);
                    var bIpValid = ValidateIPv4(_sIP);

                    var oListaFinal = new List<Modelo.Value>();
                    var lista = colaImpresion.ObtenerColaImpresion(bIpValid ? _sIP : sIpHost);
                    var aListaOrdenada = new List<string>();
                    if (lista.value != null)
                    {
                        var aColaImpresionOrdenada = new List<Modelo.Value>();
                        foreach (var item in lista.value)
                        {
                            if (item.descripcion != null)
                            {
                                if (item.descripcion.Length > 0)
                                {
                                    var oValues = item.descripcion.Split(' ');
                                    oValues[oValues.Length - 1] = oValues[oValues.Length - 1].ToString().PadLeft(10, '0');
                                    item.descripcion = string.Join(" ", oValues);
                                }
                            }
                            else
                            {
                                item.descripcion = "";
                            }

                            aColaImpresionOrdenada.Add(item);
                        }

                        foreach (var cola in aColaImpresionOrdenada.OrderBy(d => d.descripcion))
                        {
                            if (Convert.ToDateTime(DateTime.Now.ToShortDateString()) > Convert.ToDateTime(cola.fechaRegistro.AddDays(1).ToShortDateString()))
                            {
                                cola.enviadoIp = sIpHost;
                                colaImpresion.ActualizarColaImpresion(cola);
                                continue;
                            }
                            
                            string plantilla = cola.oPlantilla.contenido;
                            if (cola.aVariables.Count > 0)
                            {
                                try
                                {
                                    foreach (var variable in cola.aVariables)
                                    {
                                        plantilla = plantilla.Replace(variable.codigo, variable.valor);
                                    }
                                    cola.copias = cola.copias == 0 ? 1 : cola.copias;
                                    cola.enviadoIp = sIpHost;
                                    for (int x = 0; x < cola.copias; x++)
                                    {
                                        if (RawPrinterHelper.SendStringToPrinter(cola.oImpresora.direccion, plantilla))
                                        {
                                            colaImpresion.ActualizarColaImpresion(cola);
                                            Thread.Sleep(2000);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    colaImpresion.LogWrite(sIpHost + " - " + cola.colaImpresionId + " - " + ex.Message);
                                    continue;
                                }
                            }
                        }
                    }
                    Thread.Sleep(3000);
                }
                catch (Exception e)
                {
                    colaImpresion.LogWrite(sIpHost + " - ERROR GENERAL - " + e.Message);
                    continue;
                }
            }
        }

        public string RemoveWhitespace(string sVal) {
            return new string(sVal.ToCharArray()
                .Where(c => !Char.IsWhiteSpace(c))
                .ToArray());
        }

        public bool ValidateIPv4(string sVal) {
            if (String.IsNullOrWhiteSpace(sVal)) {
                return false;
            }

            string[] splitValues = sVal.Split('.');
            if (splitValues.Length != 4) {
                return false;
            }

            byte tempForParsing;

            return splitValues.All(r => byte.TryParse(r, out tempForParsing));
        }

        public static string CheckIPValid(string strIP) {
            IPAddress address;
            if (IPAddress.TryParse(strIP, out address)) {
                switch (address.AddressFamily) {
                    case System.Net.Sockets.AddressFamily.InterNetwork:
                        return "ipv4";
                    case System.Net.Sockets.AddressFamily.InterNetworkV6:
                        return "ipv6";
                    default:
                        return null;
                }
            }
            return null;
        }
    }
}