/*
var bukrs = $.context.Bukrs;
var belnr = $.context.Belnr;
var gjahr = $.context.Gjahr;
*/
/*
var dta = {};
dta.Bukrs = $.context.Bukrs;
dta.Belnr = $.context.Bukrs;
dta.Gjahr = $.context.Bukrs;
$.context.att = dta;
*/

var crra = {};
crra.Bukrs = $.context.Bukrs;
crra.Belnr = $.context.Belnr;
crra.Gjahr = $.context.Gjahr;
crra.Type = "A";
$.context.correo = crra;

//Cargar nombre entidad PUT

if( $.context.Type === "S"){
	//Nombre entidad
	$.context.nombreEntidad =  "SolicitudSet";
}else if ($.context.Type === "G"){
	//Nombre entidad
	$.context.nombreEntidad = "GastoSet";
}
//Cuerpo entidad
	var actualizarapp = {};
	//Cabezera
	actualizarapp.Bukrs = $.context.Bukrs;
	actualizarapp.Belnr = $.context.Belnr;
	actualizarapp.Gjahr = $.context.Gjahr;
	//
	actualizarapp.CorporativeEmail = $.context.CorporativeEmail;
	//actualizarapp.Motivo = $.context.Motivo;
     actualizarapp.Motivo = $.context.MotivoAprobacion;
    //actualizarapp.Motivo = "MOTIVO.APORBACIONHC";
    actualizarapp.Type = "A";
	
	$.context.aprobarRequest = actualizarapp;


//Cuerpo correo
var correoapp = {};
correoapp.Belnr = $.context.Belnr;
correoapp.Type = "A"; //Aprobado
//correo.Wrbtr = $.context.DetalleSol.Wrbtr;
var sImporteTotalConMoneda = $.context.ImporteTotal;
var sImporteTotal = sImporteTotalConMoneda.split(" ")[0];
correoapp.Wrbtr = sImporteTotal.replace(",", "");
correoapp.Bukrs = $.context.Bukrs;
correoapp.Sysid = $.context.Usuario;
correoapp.Gjahr = $.context.Gjahr;
//correoapp.Jsonias = $.context.jsonias;
correoapp.Personalemail = $.context.Personalemail;
correoapp.CorporativeEmail = $.context.CorporativeEmail;
correoapp.Motivo = $.context.MotivoAprobacion;
$.context.correo.correoAprobacionRequest = correoapp;
