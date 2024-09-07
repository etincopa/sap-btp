var Bukrs = $.context.Bukrs,
	Belnr = $.context.Belnr,
	Gjahr = $.context.Gjahr;

var path = "ValidacionSet?$filter=Gjahr eq '" + Gjahr + "' and Bukrs eq '" + Bukrs + "' and Val2 eq '" + Belnr + "' and Id eq '3'";

$.context.PathValicacion = path;