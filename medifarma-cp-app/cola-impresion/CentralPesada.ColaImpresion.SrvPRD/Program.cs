using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.ServiceProcess;

namespace CentralPesada.ColaImpresion.SrvPRD
{
    static class Program
    {
        /// <summary>
        /// Punto de entrada principal para la aplicación.
        /// </summary>
        [STAThread]
        static void Main()
        {
            /*
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Form1());
            */
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[]
            {
                //new ServicePRD();
            };
            ServiceBase.Run(ServicesToRun);


        }
    }
}
