sap.ui.define([], function () {
  "use strict";
  return {
    getFormatShortDate: function (sDate) {
      if (sDate) {
        var oDate = new Date(sDate);
        //oDate.setDate(oDate.getDate() + 1);

        var day = oDate.getUTCDate();
        day = day <= 9 ? "0" + day : day;
        var month = oDate.getUTCMonth() + 1;
        month = month <= 9 ? "0" + month : month;
        var year = oDate.getFullYear();

        var sFormatDate = oDate.toUTCString();
        var fullDate = [day, month, year].join("/");

        return fullDate;
      } else return "";
    },
    getTimestampToDMY: function (sDate) {
      var oDate = new Date(sDate);

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
    paddZeroes: function (number, size) {
      number = number.toString();
      while (number.length < size) number = "0" + number;
      return number;
    },
    fechaToDate: function (sFecha, sSeparador) {
      if (sFecha) {
        var aFecha = sFecha.split(sSeparador);
        return new Date(aFecha[0], aFecha[1] - 1, aFecha[2]);
      }
      return "";
    },
    fechaHora: function (sFecha) {
      if (sFecha) {
        const oFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "dd/MM/yyyy hh:mm a",
        });
        const dFecha = new Date(sFecha);
        return oFormat.format(dFecha);
      }
      return "";
    },
    fechaMDA: function (sFecha) {
      if (sFecha) {
        const oFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "MM/dd/yyyy",
        });
        const dFecha = new Date(sFecha);
        return oFormat.format(dFecha);
      }
      return "";
    },
    fechaHoraVenc: function (sFecha) {
      if (sFecha == null) return "";
      const oFormat = sap.ui.core.format.DateFormat.getInstance({
        pattern: "dd/MM/yyyy hh:mm a",
      });

      const dFecha = new Date(sFecha);
      return oFormat.format(dFecha);
    },
    pesoString: function (fValue) {
      fValue = new Number(fValue);

      if (isNaN(fValue)) return "-";

      const oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        decimals: 3,
        decimalSeparator: ".",
        groupingSeparator: ",",
      });

      return oFormat.format(fValue);
    },
    peso: function (fValue) {
      if (!fValue) fValue = 0;

      var mOptions = {
        groupingSeparator: "",
        decimalSeparator: ".",
        minFractionDigits: 3,
        maxFractionDigits: 3,
      };

      /*
      const oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        decimals: 3,
        decimalSeparator: ".",
        groupingSeparator: ",",
      });
      fValue = new Number(fValue);
      return oFormat.format(fValue);
      */

      var number = fValue,
        decPlaces = mOptions.maxFractionDigits,
        decSep = mOptions.decimalSeparator,
        thouSep = mOptions.groupingSeparator;
      (decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces),
        (decSep = typeof decSep === "undefined" ? "." : decSep);
      thouSep = typeof thouSep === "undefined" ? "," : thouSep;
      var sign = number < 0 ? "-" : "";
      var i = String(
        parseInt((number = Math.abs(Number(number) || 0).toFixed(decPlaces)))
      );
      var j = (j = i.length) > 3 ? j % 3 : 0;

      return (
        sign +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces
          ? decSep +
            Math.abs(number - i)
              .toFixed(decPlaces)
              .slice(2)
          : "")
      );
    },
    pesoAux: function (fValue) {
      if (!fValue) fValue = 0;

      var mOptions = {
        groupingSeparator: "",
        decimalSeparator: ".",
        minFractionDigits: 3,
        maxFractionDigits: 3,
      };

      /*
      const oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        decimals: 3,
        decimalSeparator: ".",
        groupingSeparator: ",",
      });
      fValue = new Number(fValue);
      return oFormat.format(fValue);
      */

      var number = fValue,
        decPlaces = mOptions.maxFractionDigits,
        decSep = mOptions.decimalSeparator,
        thouSep = mOptions.groupingSeparator;
      (decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces),
        (decSep = typeof decSep === "undefined" ? "." : decSep);
      thouSep = typeof thouSep === "undefined" ? "," : thouSep;
      var sign = number < 0 ? "-" : "";
      var i = String(
        parseInt((number = Math.abs(Number(number) || 0).toFixed(decPlaces)))
      );
      var j = (j = i.length) > 3 ? j % 3 : 0;

      return (
        sign +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces
          ? decSep +
            Math.abs(number - i)
          : "")
      );
    },
    cantidadDecimal: function(sNewText){
      var idx = sNewText.indexOf(".")
      var sDecimalLength = sNewText.substring(idx+1, sNewText.length).length;

      return idx == -1 ? 0 : sDecimalLength;
    },
    peso4: function (fValue) {
      const oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        decimals: 4,
        decimalSeparator: ".",
        groupingSeparator: ",",
      });
      fValue = new Number(fValue);
      return oFormat.format(fValue);
    },
    getSuma: function (iValue1, iValue2) {
      if (!iValue1) iValue1 = 0;
      if (!iValue2) iValue2 = 0;

      if (this.peso) {
        return this.peso(+iValue1 + +iValue2);
      } else {
        return this.formatter.peso(+iValue1 + +iValue2);
      }
    },
    showEtiquetaIfa: function (iValue1, iValue2) {
      return iValue1 == "X" && (!iValue2 || iValue2 == "");
    },
  };
});
