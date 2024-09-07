sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Rounds the number unit value to 2 digits
     * @public
     * @param {string} sValue the number string to be rounded
     * @returns {string} sValue with 2 digits rounded
     */
    numberUnit: function (sValue) {
      if (!sValue) {
        return "";
      }
      return parseFloat(sValue).toFixed(2);
    },
    isDateBT: function (from, to, check) {
      if (!check) {
        check = new Date();
      }
      var dateFrom = this.getTimestampToMDY(new Date(from));
      var dateTo = this.getTimestampToMDY(new Date(to));
      var dateNow = this.getTimestampToMDY(check);

      var from = new Date(dateFrom);
      var to = new Date(dateTo);
      var check = new Date(dateNow);

      //Valida si la fecha actual esta en el rango de vigencia del usuario
      if (check > from && check < to) {
        return true;
        //sState = "Success";
        //sState = "sap-icon://sys-enter-2";
      } else {
        return false;
        //sState = "Error";
        //sState = "sap-icon://error";
      }
    },
    /**
     * @Description
     * Funcion que devuelve la fecha de un objeto
     *
     * @param  {Object} Date()
     * @return  {String} [day month year]
     * @example {
     *  var sDMY = fotmatter.getTimestampToDMY(new Date());
     *  //sDMY -> 28/09/2021
     * <Text text="{path: 'oData>property_Date', formatter: '.formatter.getTimestampToDMY'}" ... />
     * }
     * @History
     * v1.0 – Version inicial
     *
     */
    getTimestampToDMY: function (oDate) {
      //Type="Edm.DateTime"
      if (oDate == undefined) {
        //d = new Date();
        return "";
      }
      let month = "" + (oDate.getUTCMonth() + 1),
        day = "" + oDate.getUTCDate(),
        year = oDate.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [day, month, year].join("/");
    },
    getTimestampToYMD: function (oDate) {
      //Type="Edm.DateTime"
      if (oDate == undefined) {
        //d = new Date();
        return "";
      }
      let month = "" + (oDate.getMonth() + 1),
        day = "" + oDate.getDate(),
        year = oDate.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [year, month, day].join("-");
    },
    getTimestampToMDY: function (oDate) {
      //Type="Edm.DateTime"
      if (oDate == undefined) {
        //d = new Date();
        return "";
      }
      let month = "" + (oDate.getMonth() + 1),
        day = "" + oDate.getDate(),
        year = oDate.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [month, day, year].join("/");
    },
    getFormatDate: function (sDate) {
      if (sDate) {
        var oDate = new Date(sDate);
        oDate.setDate(oDate.getDate() + 1);
        var sFormatDate = oDate.toUTCString();
        sFormatDate =
          this.formatter.paddZeroes(oDate.getUTCMonth() + 1, 2) +
          "-" +
          oDate.getFullYear();
        return sFormatDate;
      } else return "";
    },
    getFormatShortDate: function (sDate) {
      if (sDate) {
        var oDate = new Date(sDate);
        oDate.setDate(oDate.getDate() + 1);
        var sFormatDate = oDate.toUTCString();
        sFormatDate =
          this.formatter.paddZeroes(oDate.getUTCDate(), 2) +
          "-" +
          this.formatter.paddZeroes(oDate.getUTCMonth() + 1, 2) +
          "-" +
          oDate.getFullYear();
        return sFormatDate;
      } else return "";
    },
    paddZeroes: function (number, size) {
      number = number.toString();
      while (number.length < size) number = "0" + number;
      return number;
    },
    Time: function (val) {
      if (val) {
        val = val.replace(/^PT/, "").replace(/S$/, "");
        val = val.replace("H", ":").replace("M", ":");

        var multipler = 60 * 60;
        var result = 0;
        val.split(":").forEach(function (token) {
          result += token * multipler;
          multipler = multipler / 60;
        });
        var timeinmiliseconds = result * 1000;
        var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
          pattern: "HH:mm:ss a",
        });

        var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
        return timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
      }
      return null;
    },
    sumValues: function (var1) {
      var totals = this.getModel("Registros").getData();
      var tTotal1 = 0;
      for (var i = 0, len = totals.length; i < len; i++) {
        tTotal1 += parseInt(totals[i].Valor1, 0);
      }
      return tTotal1;
    },
    statusFormatter: function (estado) {
      var stsVal;
      if (estado === "Aprobado" || estado === "Aprobado Mesa") {
        stsVal = "Success";
      }
      if (estado === "Enviado") {
        stsVal = "Warning";
      }
      if (estado === "Rechazado") {
        stsVal = "Error";
      }
      return stsVal;
    },

    stateFormatter: function (bStatus) {
      var sState = "Warning";
      sState = "Information";
      if (bStatus) {
        sState = "Success";
      } else {
        sState = "Error";
      }
      return sState;
    },
    stateIconFormatter: function (bStatus) {
      var sState = "sap-icon://alert";
      sState = "sap-icon://information";
      if (bStatus) {
        sState = "sap-icon://sys-enter-2";
      } else {
        sState = "sap-icon://error";
      }
      return sState;
    },
    nvl: function (value1, value2) {
      if (value1 === null || value1 === "" || value1 == undefined)
        return value2;
      return value1;
    },
    formatValue: function (value) {
      value = parseFloat(value).toFixed(3);
      var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        maxFractionDigits: 3,
        groupingEnabled: true,
        groupingSeparator: "",
        decimalSeparator: ".",
      });
      return oNumberFormat.format(value);
    },
    getDateDMYFormat: function (sDate) {
      if (sDate) {
        var oDate = new Date(sDate);
        //var sFormatDate = oDate.toUTCString();
        var sFormatDate =
          oDate.getDate() +
          "/" +
          this.formatter.paddZeroes(oDate.getMonth() + 1, 2) +
          "/" +
          oDate.getFullYear();
        return sFormatDate;
      } else return "";
    },
    getTexMonthFormat: function (date) {
      var meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      if (date) {
        var oDate = new Date(date);
        oDate.setDate(oDate.getDate() + 1);
        //var sFormatDate = oDate.toUTCString();
        var sFormatDate = meses[oDate.getMonth()] + "-" + oDate.getFullYear();
        return sFormatDate;
      } else return "";
    },
    getDateTimeDMYHSFormat: function (sDate) {
      if (sDate) {
        var oDate = new Date(sDate);
        var sFormatDate =
          oDate.getDate() +
          "/" +
          this.formatter.paddZeroes(oDate.getMonth() + 1, 2) +
          "/" +
          oDate.getFullYear() +
          " " +
          this.formatter.paddZeroes(oDate.getHours(), 2) +
          ":" +
          this.formatter.paddZeroes(oDate.getMinutes(), 2) +
          ":" +
          this.formatter.paddZeroes(oDate.getSeconds(), 2);
        return sFormatDate;
      } else return "";
    },
    getBoleanEdit: function (bValue) {
      if (!(bValue == null || bValue == undefined)) {
        return bValue;
      } else return false;
    },

    getBoleanDel: function (bValue) {
      if (!(bValue == null || bValue == undefined)) {
        return bValue;
      } else return true;
    },

    formatDateDMYHMS: function (sDate) {
      var oDate = new Date();
      if (sDate) {
        oDate = new Date(sDate);
      }

      var hours = "00";
      var minutes = "00";
      var seconds = "00";
      var day = "00";
      var month = "00";
      var year = "00";

      day = oDate.getDate();
      month = oDate.getMonth() + 1;
      year = oDate.getFullYear();

      hours = oDate.getHours();
      minutes = oDate.getMinutes();
      seconds = oDate.getSeconds();

      day = day <= 9 ? "0" + day : day;
      month = month <= 9 ? "0" + month : month;
      hours = hours <= 9 ? "0" + hours : hours;
      minutes = minutes <= 9 ? "0" + minutes : minutes;
      seconds = seconds <= 9 ? "0" + seconds : seconds;

      var fullDate = [year, month, day].join("-");
      var fullHour = [hours, minutes, seconds].join(":");
      var sDateFormat = [fullDate, fullHour].join(" ");
      return sDateFormat;
    },
  };
});
