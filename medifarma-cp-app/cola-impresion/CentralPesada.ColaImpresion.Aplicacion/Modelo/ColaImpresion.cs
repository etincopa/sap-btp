using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CentralPesada.ColaImpresion.Aplicacion.Modelo
{
    public class Impresora
    {
        public string terminal { get; set; }
        public DateTime fechaRegistro { get; set; }
        public string usuarioRegistro { get; set; }
        public DateTime fechaActualiza { get; set; }
        public string usuarioActualiza { get; set; }
        public bool activo { get; set; }
        public string impresoraId { get; set; }
        public string nombre { get; set; }
        public string direccion { get; set; }
        public bool estadoImpresora { get; set; }
        public string serie { get; set; }
        public bool indicadorCp { get; set; }
        public bool indicadorPicking { get; set; }
        public bool indicadorEtiqueta { get; set; }
        public int oPlanta_iMaestraId { get; set; }
        public string area { get; set; }
        public bool rmd { get; set; }
    }

    public class Planta
    {
        public string terminal { get; set; }
        public DateTime fechaRegistro { get; set; }
        public string usuarioRegistro { get; set; }
        public DateTime fechaActualiza { get; set; }
        public string usuarioActualiza { get; set; }
        public bool activo { get; set; }
        public int iMaestraId { get; set; }
        public int oMaestraTipo_maestraTipoId { get; set; }
        public string contenido { get; set; }
        public string descripcion { get; set; }
        public int orden { get; set; }
        public string codigo { get; set; }
        public string codigoSap { get; set; }
        public string campo1 { get; set; }
        public string oAplicacion_aplicacionId { get; set; }

    }

    public class Plantilla
    {
        public object terminal { get; set; }
        public DateTime fechaRegistro { get; set; }
        public string usuarioRegistro { get; set; }
        public DateTime? fechaActualiza { get; set; }
        public object usuarioActualiza { get; set; }
        public bool activo { get; set; }
        public string plantillaImpresionId { get; set; }
        public string descripcion { get; set; }
        public object nombre { get; set; }
        public string contenido { get; set; }
    }
    public class ColaImpresion
    {

        public object fechaActualiza { get; set; }
        public object usuarioActualiza { get; set; }

        public string colaImpresionId { get; set; }

        public bool enviados { get; set; }
        public string enviadoIp { get; set; }
        public string oImpresora_impresoraId { get; set; }
        public string oPlantilla_plantillaImpresionId { get; set; }
        public string descripcion{ get; set; }
        public int copias { get; set; }

    }

    public class Variable
    {
        public string terminal { get; set; }
        public DateTime fechaRegistro { get; set; }
        public string usuarioRegistro { get; set; }
        public object fechaActualiza { get; set; }
        public object usuarioActualiza { get; set; }
        public bool activo { get; set; }
        public string colaImpresionVariableId { get; set; }
        public string oColaImpresion_colaImpresionId { get; set; }
        public string codigo { get; set; }
        public string valor { get; set; }
    }

    public class Value
    {
        public string terminal { get; set; }
        public DateTime fechaRegistro { get; set; }
        public string usuarioRegistro { get; set; }
        public object fechaActualiza { get; set; }
        public object usuarioActualiza { get; set; }
        public bool activo { get; set; }
        public string colaImpresionId { get; set; }
        public string descripcion { get; set; }
        public int copias { get; set; }
        public bool enviados { get; set; }
        public string enviadoIp { get; set; }
        public string oImpresora_impresoraId { get; set; }
        public string oPlantilla_plantillaImpresionId { get; set; }

        public string impresoraId { get; set; }
        public string nombre { get; set; }
        public string direccion { get; set; }
        public string estadoImpresora { get; set; }
        public string serie { get; set; }
        
        public Impresora oImpresora { get; set; }
        public Plantilla oPlantilla { get; set; }
        public List<Variable> aVariables { get; set; }

        public Planta oPlanta { get; set; }
    }

    public class ListaColaImpresion
    {
        [JsonProperty("@odata.context")]
        public string OdataContext { get; set; }
        public List<Value> value { get; set; }
    }

    public class ClientObj
    {
        public string clientId { get; set; }
        public string clientSecret { get; set; }
    }

    public class ResponseToken
    { 
        public string access_token { get; set; }
        public string token_type { get; set; }
        public int expires_in { get; set; }
        public string scope { get; set; }
        public string jti { get; set; }

    }
}
