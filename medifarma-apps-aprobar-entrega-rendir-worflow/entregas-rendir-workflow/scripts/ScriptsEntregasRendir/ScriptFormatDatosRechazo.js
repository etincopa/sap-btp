var bukrs = $.context.Bukrs;
var belnr = $.context.Belnr;
var gjahr = $.context.Gjahr;
$.context.gastoFlag =false;

//Cargar nombre entidad PUT
var actualizarapprr = {};
if( $.context.Type === "S"){
	//Nombre entidad
	$.context.nombreEntidad =  "zsolicitudSet";
	$.context.nombreDocumento = "ParkedDocument";
	
	actualizarapprr.ParkedDocument = $.context.Belnr;
	actualizarapprr.Ztyp = "R";
	
}else if ($.context.Type === "G"){
	//Nombre entidad
	$.context.nombreEntidad = "GastoSet";
	$.context.nombreDocumento = "Belnr";
	
	actualizarapprr.Belnr = $.context.Belnr;
	actualizarapprr.Type = "R";
}

//Cuerpo PUT

	//Cabezera
	actualizarapprr.Bukrs = $.context.Bukrs;
	actualizarapprr.Gjahr = $.context.Gjahr;
	//
	actualizarapprr.CorporativeEmail = $.context.CorporativeEmail;
	actualizarapprr.Motivo = $.context.MotRechz;
	

	$.context.arr = actualizarapprr;
//

var correo = {};
correo.Bukrs = bukrs;
correo.Belnr = belnr;
correo.Gjahr = gjahr;
correo.Type = "R";
$.context.correor = correo;

//Cuerpo correo
var correorej = {};
correorej.Belnr = $.context.Belnr;
correorej.Motivo = $.context.MotRechz;
correorej.Type = "R"; //Rechazar
//correo.Wrbtr = $.context.DetalleSol.Wrbtr;
var sImporteTotalConMoneda = $.context.ImporteTotal;
var sImporteTotal = sImporteTotalConMoneda.split(" ")[0];
correorej.Wrbtr = sImporteTotal.replace(",", "");
correorej.Bukrs = $.context.Bukrs;
correorej.Gjahr = $.context.Gjahr;
//correorej.Jsonias = $.context.jsonias;
correorej.Personalemail = $.context.Personalemail;
correorej.CorporativeEmail = $.context.CorporativeEmail;

$.context.correosrtt = correorej;