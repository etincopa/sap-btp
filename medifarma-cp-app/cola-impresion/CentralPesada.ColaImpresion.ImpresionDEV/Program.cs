using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CentralPesada.ColaImpresion.ImpresionDEV
{
    static class Program
    {
        /// <summary>
        /// Punto de entrada principal para la aplicación.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            Aplicacion.Negocio.ColaImpresion colaImpresion = new Aplicacion.Negocio.ColaImpresion();

            //configuracion para servicios CAP
            string sUrlSrv = System.Configuration.ConfigurationManager.AppSettings["UrlSrv"];
            string sIP = System.Configuration.ConfigurationManager.AppSettings["IP"];

            //configuracion para servicios de autenticacion con token
            string client_uri = System.Configuration.ConfigurationManager.AppSettings["client_uri"];
            string client_id = System.Configuration.ConfigurationManager.AppSettings["client_id"];
            string client_secret = System.Configuration.ConfigurationManager.AppSettings["client_secret"];

            //iniciar servicio cola impresion
            colaImpresion.Iniciar(sUrlSrv, sIP, client_uri, client_id, client_secret);
        }
    }
}
