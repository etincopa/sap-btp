using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using CentralPesada.ColaImpresion.Aplicacion;

namespace WinFormsApp1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion colaImpresion = new CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion();

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
