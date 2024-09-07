function initModel() {
    var sUrl = "/saperp/sap/opu/odata/EPER/SUPPLIERS_SRV/";
    var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
    sap.ui.getCore().setModel(oModel);
}
