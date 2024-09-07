var param_ = $.context;

var uri = "/sap/opu/odata/eper/OD_MM_UTILIDADES_SRV/zinaprobadoresSet";
uri = uri + "(Bukrs='" + param_.Bukrs + "',Prcid='" + param_.Prcid + "',Rulid='" + param_.Rulid + "',Tskid='" + param_.IskidL2 +
	"',Tabname='" + param_.Tabname + "',Fieldname='" + param_.Fieldname + "',Value='" + param_.Value + "'";
uri = uri + ",Isfound=" + param_.Isfound + ",TabSearch='" + param_.Tabname_search + "',FieldSearch='" + param_.Fieldname_search +
	"')/zaprobadoresmultout?$format=json";

$.context.getSegundoAprobadorSRV = uri;
$.context.iNivelCount = 2;