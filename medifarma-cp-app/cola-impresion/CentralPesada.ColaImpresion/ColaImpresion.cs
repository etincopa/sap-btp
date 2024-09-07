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
    [RunInstaller(true)]
    public partial class ColaImpresion : ServiceBase
    {
        public ColaImpresion()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion colaImpresion = new CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion();
            colaImpresion.Iniciar();
        }

        protected override void OnStop()
        {
        }
    }
}
