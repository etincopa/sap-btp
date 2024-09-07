var param_ = $.context;

var uri = "/sap/opu/odata/eper/OD_MM_UTILIDADES_SRV/zinaprobadoresSet";
uri = uri +  "(Bukrs='"+param_.Bukrs+"',Prcid='"+param_.Prcid+"',Rulid='"+param_.Rulid+"',Tskid='"+param_.IskidL2+"',Tabname='"+param_.Tabname+"',Fieldname='"+param_.Fieldname+"',Value='"+param_.Value+"'";
uri = uri + ",Isfound="+param_.Isfound+",TabSearch='"+param_.Tabname_search+"',FieldSearch='"+param_.Fieldname_search+"')/zaprobadoresmultout?$format=json";

//uri ="/sap/opu/odata/eper/OD_MM_UTILIDADES_SRV/zinaprobadoresSet(Bukrs='1000',Prcid='P010',Rulid='',Tskid='S001',Tabname='CSKS',Fieldname='KOSTL',Value='10001A6011',Isfound=false,TabSearch='PA0001',FieldSearch='PLANS')/zaprobadoresmultout?$format=json"


//uri ="/sap/opu/odata/eper/OD_MM_UTILIDADES_SRV/zinaprobadoresSet(Bukrs='1000',Prcid='P020',Rulid='',Tskid='G002',Tabname='CSKS',Fieldname='KOSTL',Value='10001A6011',Isfound=false,TabSearch='PA0001',FieldSearch='PLANS')/zaprobadoresmultout?$format=json"
$.context.getSegundoAprobadorSRV = uri;
$.context.iNivelCount = 2;