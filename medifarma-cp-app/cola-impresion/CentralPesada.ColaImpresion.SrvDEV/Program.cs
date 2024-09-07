using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace CentralPesada.ColaImpresion.SrvDEV
{
    static class Program
    {
        /// <summary>
        /// Punto de entrada principal para la aplicación.
        /// </summary>
        static void Main()
        {
            try
            {
                ServiceBase[] ServicesToRun;
                ServicesToRun = new ServiceBase[]
                {
                new ServiceDEV()
                };
                ServiceBase.Run(ServicesToRun);
            }
            catch (Exception ex)
            {
                LogChanges($"Error - {ex.Message}\nInner - {ex.InnerException}");
            }
        }

        static void LogChanges(string message)
        {
            string LogPath = AppDomain.CurrentDomain.BaseDirectory + "MyServiceLog.txt";
            using (StreamWriter wr = File.AppendText(LogPath))
            {
                wr.WriteLine(message);
            }
        }
    }
}
