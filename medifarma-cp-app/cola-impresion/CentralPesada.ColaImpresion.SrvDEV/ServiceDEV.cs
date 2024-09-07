using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace CentralPesada.ColaImpresion.SrvDEV
{
    public partial class ServiceDEV : ServiceBase
    {
        public ServiceDEV()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            try
            {
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
            catch (Exception ex)
            {
                string source = "DemoSourceWithinApplicationLog";
                string log = "Application";
                if (!EventLog.SourceExists(source))
                {
                    EventLog.CreateEventSource(source, log);
                }
                EventLog.WriteEntry(source, ex.Message,
                    EventLogEntryType.Warning);
            }
        }

        protected override void OnStop()
        {
        }
    }
}
