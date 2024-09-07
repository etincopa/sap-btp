using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace CentralPesada.ColaImpresion.SrvQAS370
{
    public partial class ServiceQAS370 : ServiceBase
    {
        public ServiceQAS370()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            Aplicacion.Negocio.ColaImpresion colaImpresion = new Aplicacion.Negocio.ColaImpresion();
            
            //configuracion para servicios CAP
            string sUrlSrv = System.Configuration.ConfigurationManager.AppSettings["UrlQAS370"];
            string sIP = System.Configuration.ConfigurationManager.AppSettings["IP"];

            //configuracion para servicios de autenticacion con token
            string client_uri = System.Configuration.ConfigurationManager.AppSettings["client_uri"];
            string client_id = System.Configuration.ConfigurationManager.AppSettings["client_id"];
            string client_secret = System.Configuration.ConfigurationManager.AppSettings["client_secret"];

            //iniciar servicio cola impresion
            colaImpresion.Iniciar(sUrlSrv, sIP, client_uri, client_id, client_secret);
        }

        protected override void OnStop()
        {
        }
    }
}
