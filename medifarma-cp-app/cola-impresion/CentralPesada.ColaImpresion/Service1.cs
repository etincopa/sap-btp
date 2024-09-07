using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace CentralPesada.ColaImpresion
{
    public partial class Service1 : ServiceBase
    {
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion colaImpresion = new CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion();
            //colaImpresion.Iniciar("DEV");
            //colaImpresion.Iniciar("QAS");
        }

        protected override void OnStop()
        {
        }
    }
}
