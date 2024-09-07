using Microsoft.Owin.Hosting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace InterfaceBalanza
{
    class Program
    {
        [DllImport("user32.dll")]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        static void Main(string[] args)
        {
            try
            {
                if (args.Length != 0)
                {
                    if (!args[0].Equals("--log"))
                    {
                        IntPtr h = Process.GetCurrentProcess().MainWindowHandle;
                        ShowWindow(h, 0);
                    }
                }
                else
                {
                    IntPtr h = Process.GetCurrentProcess().MainWindowHandle;
                    ShowWindow(h, 0);
                }

                var jsonText = File.ReadAllText("setting.json");
                var oSetting = JsonConvert.DeserializeObject<setting>(jsonText);

                string baseAddress = "http://localhost:" + oSetting.Port;

                // Start OWIN host 

                //Logger.Setup();
                using (WebApp.Start<Startup>(url: baseAddress))
                {
                    Console.WriteLine("Server started at:" + baseAddress);
                    Console.ReadLine();
                }
            }
            catch (Exception)
            {
            }
        }
    }

    public class setting { 
        public string Port { get; set; }
    }
}
