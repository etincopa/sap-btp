//Objeto contenedor de los usuario ias que se envian por correo
var usuias = [];
var nivelAprobacion = $.context.Nivel;
//Obtener usuario ias
var txt = "";
var ias = "";
$.context.debug.nivelAprobacionPrueba = nivelAprobacion;

if (nivelAprobacion == 1) {
	ias = $.context.resultPrimerAprobador.d.results;
    $.context.iNivelCount = 2;
}
if (nivelAprobacion == 2) {
	ias = $.context.resultSegundoAprob.d.results;
    $.context.iNivelCount = 3;
}

if (nivelAprobacion == 3) {
	ias = $.context.resultTercerAprob.d.results;
 //  $.context.iNivelCount = $.context.iNivelCount + 1;
}

ias.forEach(ObtenerUsu);

function ObtenerUsu(value) {
	//crear objeto con los usuarios
	usuias.push({
		//"sysid": value.Low
        "sysid": value.Email
	});

	//crear cadena de usuario (para el MyInbox)
	//txt = txt + value.Low + ", ";
    txt = txt + value.Email + ", ";
}
$.context.jsonias = JSON.stringify(usuias);
//$.context.userias = (txt.slice(0, -2)).toUpperCase();
$.context.userias = usuias[0].sysid.toLowerCase();

nivelAprobacion = parseInt(nivelAprobacion) + 1;
$.context.Nivel = nivelAprobacion;
//Context User Task
//$.context.userias= "23456789";

//Validar Solicitud o Gasto
var type = $.context.Type;
if (type === "G") {
	var gasto = "Gastos";
	$.context.dto = gasto;
	$.context.nombreEntidad = "GastoSet";
	$.context.visibleutGasto = true;
	$.context.visibleutSol = false;
} else if (type === "S") {
	var solicitud = "Solicitud";
	$.context.dto = solicitud;
	$.context.nombreEntidad = "zsolicitudSet";
	$.context.visibleutGasto = false;
	$.context.visibleutSol = true;
}

//Enviar datos correo
var correo = {};
correo.Belnr = $.context.Belnr;
correo.Motivo = "";
correo.Type = $.context.Type;
correo.Wrbtr = $.context.DetalleSol.Wrbtr;
var sImporteTotalConMoneda = $.context.ImporteTotal;
var sImporteTotal = sImporteTotalConMoneda.split(" ")[0];
correo.Wrbtr = sImporteTotal.replace(",", "");

correo.Bukrs = $.context.Bukrs;
correo.Sysid = $.context.Usuario;
//correo.Sysid = "40684179";
correo.Gjahr = $.context.Gjahr;
correo.Jsonias = $.context.jsonias;
correo.Personalemail = $.context.Personalemail;
correo.CorporativeEmail = $.context.CorporativeEmail;

$.context.correout = correo;

var actualizarapp = {};
//Cabezera
actualizarapp.Bukrs = $.context.Bukrs;
actualizarapp.Belnr = $.context.Belnr;
actualizarapp.Gjahr = $.context.Gjahr;
//
actualizarapp.CorporativeEmail = $.context.CorporativeEmail;
actualizarapp.Motivo = $.context.Motivo;
actualizarapp.Type = "A";

$.context.att = actualizarapp;

/* DATOS CORREO INPUT
context.Belnr
context.Motivo -- no hay
context.Type -- envio script
context.DetalleSol.Wrbtr
context.Bukrs
context.Usuario
context.Gjahr
context.Jsonia -- no hay
context.Personalemail --  no hay data
context.CorporativeEmail
*/