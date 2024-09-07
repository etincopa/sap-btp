using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
namespace ImpresionDEV
{
    public partial class frmMain : Form
    {
        public frmMain()
        {
            InitializeComponent();
        }
        private void btnIniciar_Click(object sender, EventArgs e)
        {

            //configuracion para servicios de autenticacion con token
            string client_uri = System.Configuration.ConfigurationManager.AppSettings["client_uri"];
            string client_id = System.Configuration.ConfigurationManager.AppSettings["client_id"];
            string client_secret = System.Configuration.ConfigurationManager.AppSettings["client_secret"];

            CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion colaImpresion = new CentralPesada.ColaImpresion.Aplicacion.Negocio.ColaImpresion();
            colaImpresion.Iniciar(cboPrinter.Text, "", client_uri, client_id, client_secret);
            //colaImpresion.Iniciar("QAS");
        }

        private void frmMain_Load(object sender, EventArgs e)
        {
            
        }
    }
}