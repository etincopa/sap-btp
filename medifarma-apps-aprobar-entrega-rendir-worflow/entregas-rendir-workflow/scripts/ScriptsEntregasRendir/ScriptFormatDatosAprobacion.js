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

var actualizarapp = {};
if( $.context.Type === "S"){
	//Nombre entidad
	//Cabecera
	var aKeys = [], sKeys, key1, key2, key3;
	key1 = "Bukrs='"+$.context.Bukrs+"'";
	key2 = "ParkedDocument='"+$.context.Belnr+"'";
	key3 = "Gjahr='"+$.context.Gjahr+"'";
	aKeys = [key1, key2, key3];
	sKeys = aKeys.join(",");
	$.context.nombreEntidad = "zsolicitudSet("+sKeys+")";
	//Detalle
	actualizarapp.Bukrs = $.context.Bukrs;
	actualizarapp.ParkedDocument = $.context.Belnr;
	actualizarapp.Gjahr = $.context.Gjahr;
	actualizarapp.CorporativeEmail = $.context.CorporativeEmail;
	actualizarapp.Motivo = $.context.MotivoAprobacion;
	actualizarapp.Ztyp = "A";
}else if ($.context.Type === "G"){
	//Nombre entidad
	//Cabecera
	var aKeysG = [], sKeysG, key1G, key2G, key3G;
	key1G = "Bukrs='"+$.context.Bukrs+"'";
	key2G = "Belnr='"+$.context.Belnr+"'";
	key3G = "Gjahr='"+$.context.Gjahr+"'";
	aKeysG = [key1G, key2G, key3G];
	sKeysG = aKeysG.join(",");
	$.context.nombreEntidad = "GastoSet("+sKeysG+")";
	//Detalle
	actualizarapp.Bukrs = $.context.Bukrs;
	actualizarapp.Belnr = $.context.Belnr;
	actualizarapp.Gjahr = $.context.Gjahr;
	actualizarapp.CorporativeEmail = $.context.CorporativeEmail;
	actualizarapp.Motivo = $.context.MotivoAprobacion;
	actualizarapp.Type = "A";
}
$.context.att = actualizarapp;

//Cuerpo correo
var correoapp = {};
correoapp.Belnr = $.context.Belnr;
//correoapp.Motivo;
correoapp.Type = "A"; //Aprobado
// correoapp.Wrbtr = $.context.DetalleSol.Wrbtr;
var sImporteTotalConMoneda = $.context.ImporteTotal;
var sImporteTotal = sImporteTotalConMoneda.split(" ")[0];
correoapp.Wrbtr = sImporteTotal.replace(",", "");
correoapp.Bukrs = $.context.Bukrs;
correoapp.Sysid = $.context.Usuario;
correoapp.Gjahr = $.context.Gjahr;
correoapp.Jsonia = $.context.Jsonia;
correoapp.Personalemail = $.context.Personalemail;
correoapp.CorporativeEmail = $.context.CorporativeEmail;

$.context.correo.stp = correoapp;
