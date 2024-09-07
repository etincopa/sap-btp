jQuery.sap.declare("com.everis.apps.cajachicaff.model.Formatter");
jQuery.sap.require("sap.ui.core.format.DateFormat");

com.everis.apps.cajachicaff.model.Formatter = {
  onSetMoney: function (value) {
    value = parseFloat(value + "").toFixed(2);
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  quay: function (value) {
    try {
      return value ? parseFloat(value).toFixed(0) : value;
    } catch (err) {
      return "Not-A-Number";
    }
  },

  time: function (value) {
    var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
      source: { pattern: "KKmmss" },
      pattern: "KK:mm:ss",
    });
    value = oDateFormat.parse(value);
    return oDateFormat.format(new Date(value));
  },
  setDateSAP: function (pValue) {
    var sFecha = pValue.split(".");
    return sFecha[2] + sFecha[1] + sFecha[0];
  },
  getFormatterTime: function (pValue) {
    if (pValue !== undefined && pValue !== "") {
      var hora = pValue.substr(0, 2);
      var min = pValue.substr(4, 2);
      var seg = pValue.substr(6, 2);

      return hora + "." + min + "." + seg;
    } else {
      return "";
    }
  },
  setFormatterDate: function (pValue) {
    if (pValue !== null && pValue !== undefined) {
      var d = new Date(pValue);
      d.setDate(d.getDate() + 1);
      var month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      // if (Number(day) === 31){
      // 	day = "01";
      // 	month = Number(month) + 1;
      // }else{
      // 	day = '' + (d.getDate()+1);
      // }
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [day, month, year].join("-");
    } else {
      return "";
    }
  },
  formatIconColor: function (Icon) {
    var str = "";
    Icon = Icon + "";
    if (Icon === "A") {
      str = "#5BD638";
    } else if (Icon === "P") {
      str = "gray";
    } else {
      str = "red";
    }

    return str;
  },
};
