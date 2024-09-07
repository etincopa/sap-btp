sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  function (JSONModel, Device) {
    "use strict";

    return {
      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },
      createPedidoModel: function () {
        var oData = {
          keyTipoPedido: "",
          valueTipoPedido: "",
          tipoPedidoParams: {
            keyMotivo: "",
            keyCentro: "",
            keySala: "",
            valueSala: "",
            valueFechaInicio: null,
            ordenes: [],

            /*Pedido Individual/Adicional*/
            oInsumo: null,
            oLote: null,
            oOrden: null,
          },
          oPedidoSelected: {},
          oPedidoAction: {},
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      createPedidoModel: function () {
        var oData = {
          keyTipoPedido: "",
          valueTipoPedido: "",
          tipoPedidoParams: {
            keyMotivo: "",
            keyCentro: "",
            keySala: "",
            valueSala: "",
            valueFechaInicio: null,
            ordenes: [],
          },
          oPedidoSelected: {},
          oPedidoAction: {},
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      orden: function () {
        var oData = [
          {
            idproducto: "M92838232",
            producto: "SAL DE ANDREWS",
            numorden: "10145314",
            lote: "L12312",
            estado: "Liberado",
            keyEstado: "7",
            icon: "sap-icon://status-in-process",
            color: "Indication03",
          },
          {
            idproducto: "I272766737",
            producto: "JABON DE TOCADOR",
            numorden: "12347",
            lote: "L12314",
            estado: "Liberado",
            keyEstado: "7",
            icon: "sap-icon://status-in-process",
            color: "Indication03",
          },
          {
            idproducto: "L92828323",
            producto: "GEL DENTAL DOCTOR ZAIDMAN TUB",
            numorden: "12347",
            lote: "L12319",
            estado: "Liberado",
            keyEstado: "7",
            icon: "sap-icon://status-in-process",
            color: "Indication03",
          },
        ];
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      createProgramacion: function () {
        var oData = {
          keyCentro: "",
          valueCentro: "",
          valueStateCentro: "None",
          keySala: "",
          valueSala: "",
          valueStateSala: "None",
          fecha: "",
          valueStateFecha: "None",
          orden: "",
          keyOrden: "",
          valueStateOrden: "None",
          lote: "",
          valueProducto: "",
          keyProducto: "",
          estado: "",
          keyEstado: "",
          icon: "",
          color: "None",
          programacion: [],
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      actualizarProgramacion: function () {
        var oData = {
          keyCentro: "",
          valueCentro: "",
          valueStateCentro: "None",
          keySala: "",
          valueSala: "",
          valueStateSala: "None",
          fecha: "",
          valueStateFecha: "None",
          orden: "",
          ordenID: "",
          keyOrden: "",
          valueStateOrden: "None",
          lote: "",
          valueProducto: "",
          keyProducto: "",
          programacionID: "",
          estado: "",
          keyEstado: "",
          icon: "",
          color: "None",
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      createModelOrdenes: function () {
        var oData = [
          {
            Matnr: "M92838232",
            Maktx: "JABÓN DE TOCADOR",
            Aufnr: "10145314",
            Charg: "L12312",
            Status: "Liberado",
            Werks: "1020",
          },
          {
            Matnr: "M92838233",
            Maktx: "SAL DE ANDREWS",
            Aufnr: "10145315",
            Charg: "L12312",
            Status: "Liberado",
            Werks: "1021",
          },
          {
            Matnr: "M92838234",
            Maktx: "PARACETAMOL 500G",
            Aufnr: "10145316",
            Charg: "L12312",
            Status: "Antes",
            Werks: "1021",
          },
          {
            Matnr: "M92838235",
            Maktx: "AGUA DESTILADO",
            Aufnr: "10145317",
            Charg: "L12356",
            Status: "Liberado",
            Werks: "1020",
          },
          {
            Matnr: "M92838236",
            Maktx: "MISOPROSTOL 50G",
            Aufnr: "10145318",
            Charg: "L12314",
            Status: "Despues",
            Werks: "1020",
          },
        ];
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      createModelCentro: function () {
        var oData = [
          {
            Bwkey: "1020",
            Name1: "Planta Ate",
          },
          {
            Bwkey: "1021",
            Name1: "Planta Lima",
          },
        ];
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      createActualizarProgramacion: function () {
        var oData = {
          keyCentro: "",
          keySala: "",
          orden: "",
          fecha: "",
          lote: "",
          valueProducto: "None",
          valueStateCentro: "None",
          valueStateFecha: "None",
          valueStateOrden: "None",
          valueStateSala: "None",
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
      
      sideMenu: function () {
        var side = {
          selectedKey: "",
          navigation: [
            {
              titleI18nKey: "sideContentInicio",
              icon: "sap-icon://home",
              expanded: true,
              key: "RouteHome",
              items: [],
            },
            {
              titleI18nKey: "sideContentAdmin",
              icon: "sap-icon://add-activity-2",
              expanded: true,
              key: "Admin",
              items: [
                {
                  titleI18nKey: "sideContentPedidoAdmin",
                  key: "RoutePedidoAdmin",
                  icon: "sap-icon://customize",
                  subheader: "sideContentCePe",
                  prefixRol: "MPAD",
                }
              ],
            },
            {
              titleI18nKey: "sideContentCePe",
              icon: "sap-icon://add-activity-2",
              expanded: true,
              key: "CentralPesadas",
              items: [
                {
                  titleI18nKey: "sideContentProgramCePe",
                  key: "RouteProgramacion",
                  icon: "sap-icon://overview-chart",
                  subheader: "sideContentCePe",
                  prefixRol: "CPPR",
                },
                {
                  titleI18nKey: "sideContentPediAtencion",
                  key: "RoutePedidoAtencion",
                  icon: "sap-icon://add-activity-2",
                  subheader: "sideContentCePe",
                  prefixRol: "CPPA",
                },
                {
                  titleI18nKey: "sideContentSeguiPedi",
                  key: "RouteSeguimientoPickingPedido",
                  icon: "sap-icon://add-activity-2",
                  subheader: "sideContentCePe",
                  prefixRol: "CPSP",
                },
                {
                  titleI18nKey: "sideContentSeguiSalaPesa",
                  key: "RouteSeguimientoSalaPesada",
                  icon: "sap-icon://add-activity-2",
                  subheader: "sideContentCePe",
                  prefixRol: "CPSS",
                },
                {
                  titleI18nKey: "sideContentSeguiConsolidado",
                  key: "RouteSeguimientoEntrega",
                  icon: "sap-icon://add-activity-2",
                  subheader: "sideContentCePe",
                  prefixRol: "CPSC",
                },
                {
                  titleI18nKey: "sideContentSeguiTraslado",
                  key: "RouteSeguimientoTraslado",
                  icon: "sap-icon://shipping-status",
                  subheader: "sideContentCePe",
                  prefixRol: "CPST",
                },
                {
                  titleI18nKey: "sideContentSelectPrint",
                  icon: "sap-icon://print",
                  key: "selectPrintCNT",
                },
              ],
            },
            {
              titleI18nKey: "sideContentAlmacen",
              icon: "sap-icon://sap-box",
              expanded: true,
              key: "Almacen",
              items: [
                {
                  titleI18nKey: "sideContentPedidoAlmacen",
                  key: "RoutePedidoAlmacen",
                  icon: "sap-icon://sap-box",
                  subheader: "sideContentAlmacen",
                  prefixRol: "AMPA",
                },
                {
                  titleI18nKey: "sideContentSeguiPickPediAlm",
                  key: "RouteSeguimientoPickingPedidoAlmacen",
                  icon: "sap-icon://sap-box",
                  subheader: "sideContentAlmacen",
                  prefixRol: "AMSP",
                },
                {
                  titleI18nKey: "sideContentSelectPrint",
                  icon: "sap-icon://print",
                  key: "selectPrintAlm",
                },
              ],
            },
          ],
          masterSettings: [
            {
              titleI18nKey: "sideContentSystemSettings",
              key: "systemSettings",
              selected: true,
            },
            {
              titleI18nKey: "sideContentOrderSettings",
              key: "orderSettings",
              selected: false,
            },
            {
              titleI18nKey: "sideContentSupplierSettings",
              key: "supplierSettings",
              selected: false,
            },
            {
              titleI18nKey: "sideContentCampaignSettings",
              key: "campaignSettings",
              selected: false,
            },
            {
              titleI18nKey: "sideContentShippingSettings",
              key: "shippingSettings",
              selected: false,
            },
          ],
        };
        return side;
      },
      pedidosAgregarOrdenModel: function () {
        let oData = {
          keyEtapa: "",
          valueEtapa: "",
          keySeccion: "",
          valueSeccion: "",
          valueNumOrden: "",
          valueNumLote: "",
          fechaInicio: null,
          fechaFin: null,
        };
        var oModel = new JSONModel(oData);
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },
    };
  }
);
