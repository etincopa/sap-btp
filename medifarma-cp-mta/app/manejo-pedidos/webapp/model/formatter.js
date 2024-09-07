sap.ui.define(
  ["sap/base/strings/formatMessage", "sap/ui/core/format/NumberFormat"],
  function (formatMessage, NumberFormat) {
    "use strict";

    return {
      formatMessage: formatMessage,

      /**
       * Determines the path of the image depending if its a phone or not the smaller or larger image version is loaded
       *
       * @public
       * @param {boolean} bIsPhone the value to be checked
       * @param {string} sImagePath The path of the image
       * @returns {string} path to image
       */
      srcImageValue: function (bIsPhone, sImagePath) {
        if (bIsPhone) {
          sImagePath += "_small";
        }
        return sImagePath + ".jpeg";
      },

      highlightStatusPedido: function (sStatus) {
        var sHiglight = "Indication01";
        if (sStatus) {
          if (sStatus.toUpperCase() == "PAPPEND") return "Indication01"; //PENDIENTE
          if (sStatus.toUpperCase() == "PAPPROC") return "Indication03"; //PROCESO
          if (sStatus.toUpperCase() == "PAPCUMP") return "Indication06"; //CUMPLIDO
          if (sStatus.toUpperCase() == "PAPBLOQ") return "Indication07"; //BLOQUEADO
          if (sStatus.toUpperCase() == "PAPANUL") return "Indication08"; //ANULADO
          if (sStatus.toUpperCase() == "PAPTRAS") return "Indication05"; //TASLADO

          if (sStatus.toUpperCase() == "AMPPEND") return "Indication01"; //PENDIENTE
          if (sStatus.toUpperCase() == "AMPPROC") return "Indication03"; //PROCESO
          if (sStatus.toUpperCase() == "AMPCUMP") return "Indication06"; //CUMPLIDO
          if (sStatus.toUpperCase() == "AMPBLOQ") return "Indication07"; //BLOQUEADO
          if (sStatus.toUpperCase() == "AMPANUL") return "Indication08"; //ANULADO
          if (sStatus.toUpperCase() == "AMPTRAS") return "Indication05"; //TASLADO
        }
        return sHiglight;
      },
      highlightStatusTraslado: function (requiereTraslado) {
        var sHiglight = "None";
        if (requiereTraslado && +requiereTraslado > 0) {
          return "Indication05"; //PENDIENTE
        }
        return sHiglight;
      },
      bgStatusPedido: function (sStatus) {
        var sHiglight = "custBgStatus01";
        if (sStatus) {
          if (sStatus.toUpperCase() == "PAPPEND") return "custBgStatus02"; //PENDIENTE
          if (sStatus.toUpperCase() == "PAPPROC") return "custBgStatus01"; //PROCESO
          if (sStatus.toUpperCase() == "PAPTRAS") return "custBgStatus03"; //TASLADO
          if (sStatus.toUpperCase() == "PAPCUMP") return "custBgStatus05"; //CUMPLIDO
          if (sStatus.toUpperCase() == "PAPBLOQ") return "custBgStatus07"; //BLOQUEADO
          if (sStatus.toUpperCase() == "PAPANUL") return "custBgStatus06"; //ANULADO

          if (sStatus.toUpperCase() == "AMPPEND") return "custBgStatus02"; //PENDIENTE
          if (sStatus.toUpperCase() == "AMPPROC") return "custBgStatus01"; //PROCESO
          if (sStatus.toUpperCase() == "AMPTRAS") return "custBgStatus03"; //TASLADO
          if (sStatus.toUpperCase() == "AMPCUMP") return "custBgStatus05"; //CUMPLIDO
          if (sStatus.toUpperCase() == "AMPBLOQ") return "custBgStatus07"; //BLOQUEADO
          if (sStatus.toUpperCase() == "AMPANUL") return "custBgStatus06"; //ANULADO
        }
        return sHiglight;
      },
      highlightStatusOrden: function (sStatus) {
        var sHiglight = "Indication01";
        if (sStatus) {
          if (sStatus.toUpperCase() == "PAOPEND") return "Indication01"; //PENDIENTE
          if (sStatus.toUpperCase() == "PAOPICK") return "Indication02"; //PICKING
          if (sStatus.toUpperCase() == "PAOATEN") return "Indication03"; // ATENDIDO
          if (sStatus.toUpperCase() == "PAOAPAR") return "Indication03"; //ATENDIDO PARCIAL
          if (sStatus.toUpperCase() == "PAOPRSA") return "Indication04"; // PROGRAMADO EN SALA
          if (sStatus.toUpperCase() == "PAOPESA") return "Indication05"; // PESANDO EN SALA
          if (sStatus.toUpperCase() == "PAOPEPE") return "Indication05"; // PENDIENTE PESAJE
          if (sStatus.toUpperCase() == "PAOPEFI") return "Indication06"; //PESAJE FINALIZADO
          if (sStatus.toUpperCase() == "PAOENVO") return "Indication04"; //ENTREGA VERIFICANDO
          if (sStatus.toUpperCase() == "PAOENVA") return "Indication04"; //ENTREGA VERIFICADA
          if (sStatus.toUpperCase() == "PAOENFI") return "Indication07"; // ENTREGA FISICA
          if (sStatus.toUpperCase() == "PAOENTR") return "Indication07"; //ENTREGA EN TRANSITO
          if (sStatus.toUpperCase() == "PAOPARC") return "Indication07"; //ENTREGA PARCIAL
          if (sStatus.toUpperCase() == "PAOTOT") return "Indication07"; //ENTREGA TOTAL
          if (sStatus.toUpperCase() == "PAOTRSO") return "Indication05"; //TRASLADO SOLICITADO
          if (sStatus.toUpperCase() == "PAOANUL") return "Indication08"; //ANULADO

          if (sStatus.toUpperCase() == "AMOPEND") return "Indication01"; //PENDIENTE
          if (sStatus.toUpperCase() == "AMOPICK") return "Indication02"; //PICKING
          if (sStatus.toUpperCase() == "AMOATEN") return "Indication03"; // ATENDIDO
          if (sStatus.toUpperCase() == "AMOAPAR") return "Indication03"; //ATENDIDO PARCIAL
          if (sStatus.toUpperCase() == "AMOPRSA") return "Indication04"; // PROGRAMADO EN SALA
          if (sStatus.toUpperCase() == "AMOPESA") return "Indication05"; // PESANDO EN SALA
          if (sStatus.toUpperCase() == "AMOPEFI") return "Indication06"; //PESAJE FINALIZADO
          if (sStatus.toUpperCase() == "AMOENVO") return "Indication04"; //ENTREGA VERIFICANDO
          if (sStatus.toUpperCase() == "AMOENVA") return "Indication04"; //ENTREGA VERIFICADA
          if (sStatus.toUpperCase() == "AMOENFI") return "Indication07"; // ENTREGA FISICA
          if (sStatus.toUpperCase() == "AMOENTR") return "Indication07"; //ENTREGA EN TRANSITO
          if (sStatus.toUpperCase() == "AMOPARC") return "Indication07"; //ENTREGA PARCIAL
          if (sStatus.toUpperCase() == "AMOTOT") return "Indication07"; //ENTREGA TOTAL
          if (sStatus.toUpperCase() == "AMOTRSO") return "Indication05"; //TRASLADO SOLICITADO
          if (sStatus.toUpperCase() == "AMOANUL") return "Indication08"; //ANULADO
        }
        return sHiglight;
      },

      highlightStatusInsumo: function (sStatus) {
        var sHiglight = "Indication01";
        if (sStatus) {
          if (sStatus.toUpperCase() == "PAIPEPI") return "Indication01"; //PENDIENTE PICKING
          if (sStatus.toUpperCase() == "PAIENPI") return "Indication02"; //EN PICKING
          if (sStatus.toUpperCase() == "PAIATPI") return "Indication03"; //ATENDIDO PICKING
          if (sStatus.toUpperCase() == "PAINAPI") return "Indication02"; //NO ATENDIDO PICKING
          if (sStatus.toUpperCase() == "PAIPEPE") return "Indication04"; //PENDIENTE PESAJE
          if (sStatus.toUpperCase() == "PAIPESA") return "Indication05"; //PESANDO EN SALA
          if (sStatus.toUpperCase() == "PAIPEFI") return "Indication06"; //PESAJE FINALIZADO
          if (sStatus.toUpperCase() == "PAIPEPR") return "Indication02"; //PESAJE POR PRODUCCIÓN
          if (sStatus.toUpperCase() == "PAIENVO") return "Indication04"; //ENTREGA VERIFICANDO
          if (sStatus.toUpperCase() == "PAIENVA") return "Indication04"; //ENTREGA VERIFICADA
          if (sStatus.toUpperCase() == "PAIPARC") return "Indication07"; //ENTREGA PARCIAL
          if (sStatus.toUpperCase() == "PAITOT") return "Indication07"; //ENTREGA TOTAL
          if (sStatus.toUpperCase() == "PAIANUL") return "Indication08"; //ANULADO

          if (sStatus.toUpperCase() == "AMIPEPI") return "Indication01"; //PENDIENTE PICKING
          if (sStatus.toUpperCase() == "AMIENPI") return "Indication02"; //EN PICKING
          if (sStatus.toUpperCase() == "AMIATPI") return "Indication03"; //ATENDIDO PICKING
          if (sStatus.toUpperCase() == "AMINAPI") return "Indication02"; //NO ATENDIDO PICKING
          if (sStatus.toUpperCase() == "AMIPEPE") return "Indication04"; //PENDIENTE PESAJE
          if (sStatus.toUpperCase() == "AMIPESA") return "Indication05"; //PESANDO EN SALA
          if (sStatus.toUpperCase() == "AMIPEFI") return "Indication06"; //PESAJE FINALIZADO
          if (sStatus.toUpperCase() == "AMIPEPR") return "Indication02"; //PESAJE POR PRODUCCIÓN
          if (sStatus.toUpperCase() == "AMIENVO") return "Indication04"; //ENTREGA VERIFICANDO
          if (sStatus.toUpperCase() == "AMIENVA") return "Indication04"; //ENTREGA VERIFICADA
          if (sStatus.toUpperCase() == "AMIPARC") return "Indication07"; //ENTREGA PARCIAL
          if (sStatus.toUpperCase() == "AMITOT") return "Indication07"; //ENTREGA TOTAL
          if (sStatus.toUpperCase() == "AMIANUL") return "Indication08"; //ANULADO

          /**
           * BULTO
           */
          if (sStatus.toUpperCase() == "ENTREGADO") return "Indication07"; //ENTREGADO
        }
        return sHiglight;
      },
      highlightTipoBultoInsumo: function (sTipo) {
        var sHiglight = "Indication02";
        if (sTipo) {
          if (sTipo.toUpperCase() == "ENTERO") return "Indication02";
          if (sTipo.toUpperCase() == "ENTERO_ALM") return "Indication02";
          if (sTipo.toUpperCase() == "SALDO_FRAC_ALM") return "Indication06";
          if (sTipo.toUpperCase() == "SALDO_ALM") return "Indication06";
          if (sTipo.toUpperCase() == "SALDO") return "Indication07";
          if (sTipo.toUpperCase() == "IFA") return "Indication02";
          if (sTipo.toUpperCase() == "FRACCION") return "Indication06";
        }
        return sHiglight;
      },
      textStatusVerif: function (sStatus) {
        var sHiglight = "";
        if (sStatus) {
          sHiglight = "VERIFICANDO"; //VERIFICANDO
          if (sStatus.toUpperCase() == "V") return "VERIFICADO"; //VERIFICADO
        }
        return sHiglight;
      },
      highlightStatusVerif: function (sStatus) {
        var sHiglight = "Indication02"; //VERIFICANDO
        if (sStatus) {
          if (sStatus.toUpperCase() == "V") return "Indication04"; //VERIFICADO
        }
        return sHiglight;
      },
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
          //oDate.setDate(oDate.getDate() + 1);
          var sFormatDate = oDate.toUTCString();
          sFormatDate =
            this.paddZeroes(oDate.getUTCDate(), 2) +
            "-" +
            this.paddZeroes(oDate.getUTCMonth() + 1, 2) +
            "-" +
            oDate.getFullYear();
          return sFormatDate;
        } else return "";
      },
      getFormatShortDateYMD: function (sDate) {
        if (sDate) {
          var oDate = new Date(sDate);
          //oDate.setDate(oDate.getDate() + 1);
          var sFormatDate = oDate.toUTCString();
          sFormatDate =
            oDate.getFullYear() +
            "-" +
            this.paddZeroes(oDate.getUTCMonth() + 1, 2) +
            "-" +
            this.paddZeroes(oDate.getUTCDate(), 2);
          return sFormatDate;
        } else return "";
      },
      stringDeteleDuplicate: function (sText) {
        if (!sText) sText = "";
        var aSplit = sText.split(",");
        var aUnique = [...new Set(aSplit.map((s) => s.trim().toUpperCase()))];
        aUnique.sort();
        return (sText = aUnique.join(", "));
      },
      paddZeroes: function (number, size) {
        number = number.toString();
        while (number.length < size) number = "0" + number;
        return number;
      },
      convertKgToG: function (iKg) {
        return +iKg * 1000;
      },
      convertMgToG: function (iMg) {
        return +iMg / 1000;
      },
      convertMlToL: function (iMl) {
        return +iMl / 1000;
      },
      convertLToMl: function (iL) {
        return +iL * 1000;
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
      getDateTimeYMD: function (oDate) {
        if (oDate) {
          var oDate = new Date(oDate.setUTCHours(5));
          var sFormatDate =
            oDate.getFullYear() +
            "-" +
            this.paddZeroes(oDate.getMonth() + 1, 2) +
            "-" +
            oDate.getDate();
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

      format: function (cellValue) {
        this.onAfterRendering = function () {
          var cellId = this.getId();
          $("#" + cellId)
            .parent()
            .parent()
            .parent()
            .css("background-color", "red");
          return cellValue;
        };
      },
      getSuma: function (iValue1, iValue2, iValue3) {
        if (!iValue1) iValue1 = 0;
        if (!iValue2) iValue2 = 0;
        if (!iValue3) iValue3 = 0;

        if (this.formatWeight) {
          return this.formatWeight(+iValue1 + +iValue2 + +iValue3);
        } else {
          return this.formatter.formatWeight(+iValue1 + +iValue2 + +iValue3);
        }
      },
      totalColor: function (iValue0, iValue1, iValue2) {
        var iValTotal = 0;
        if (!iValue0) iValue0 = 0;
        if (!iValue1) iValue1 = 0;
        if (!iValue2) iValue2 = 0;

        if (this.formatWeight) {
          iValTotal = this.formatWeight(+iValue0 + +iValue1);
        } else {
          iValTotal = this.formatter.formatWeight(+iValue0 + +iValue1);
        }

        if (+iValTotal == +iValue2) {
          return "Indication05"; //AZUL
        } else if (+iValTotal > +iValue2) {
          return "Indication06"; //VERDE
        } else if (+iValTotal < +iValue2) {
          return "Indication01"; //ROJO
        } else return "None";
      },
      getResta: function (iValue1, iValue2) {
        if (!iValue1) iValue1 = 0;
        if (!iValue2) iValue2 = 0;
        if (this.formatWeight) {
          return this.formatWeight(+iValue1 - +iValue2);
        } else {
          return this.formatter.formatWeight(+iValue1 - +iValue2);
        }
      },
      /**-----------------------------------------------*/
      /*                   COIN
      /**-----------------------------------------------*/
      formatWeight: function (weight) {
        if (!weight) weight = 0;

        var mOptions = {
          groupingSeparator: "",
          decimalSeparator: ".",
          minFractionDigits: 3,
          maxFractionDigits: 3,
        };

        try {
          var oFloatFormat = NumberFormat.getFloatInstance(mOptions);
          weight = oFloatFormat.format(weight);
        } catch (oError) {
          weight = this.formatMoney(
            weight,
            mOptions.maxFractionDigits,
            mOptions.decimalSeparator,
            mOptions.groupingSeparator
          );
        }
        return weight;
      },
      formatWeightString: function (weight) {
        var fValue = new Number(weight);

        if (isNaN(fValue)) {
          if (weight) {
            fValue = new Number(parseFloat(weight));
            weight = fValue;
          }

          if (isNaN(fValue)) return "0.000";
        }

        if (!weight) weight = 0;

        var mOptions = {
          groupingSeparator: "",
          decimalSeparator: ".",
          minFractionDigits: 3,
          maxFractionDigits: 3,
        };

        try {
          var oFloatFormat = NumberFormat.getFloatInstance(mOptions);
          weight = oFloatFormat.format(weight);
        } catch (oError) {
          weight = this.formatMoney(
            weight,
            mOptions.maxFractionDigits,
            mOptions.decimalSeparator,
            mOptions.groupingSeparator
          );
        }
        return weight;
      },
      formatCoin: function (coin) {
        if (!coin) coin = 0;

        var mOptions = {
          groupingSeparator: "",
          decimalSeparator: ".",
          minFractionDigits: 3,
          maxFractionDigits: 3,
        };

        try {
          var oFloatFormat = NumberFormat.getFloatInstance(mOptions);
          coin = oFloatFormat.format(coin);
        } catch (oError) {
          coin = this.formatMoney(
            coin,
            mOptions.maxFractionDigits,
            mOptions.decimalSeparator,
            mOptions.groupingSeparator
          );
        }
        return coin;
      },
      formatMoney: function (number, decPlaces, decSep, thouSep) {
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
      /**-----------------------------------------------*/
      /*                   DATE / TIME
        /**-----------------------------------------------*/

      /**
       * @Description
       * Funcion que devuelve la hora de un objeto
       *
       * @param  {Object} Edm.Time
       * @return  {String} [hours minutes seconds]
       * @example {
       *  var sHMS = fotmatter.getMsToHMS({Edm.Time});
       *  //sHMS -> 10:20:34
       *  <Text text="{path: 'oData>property_Time', formatter: '.formatter.getMsToHMS'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getMsToHMS: function (oEdmTime) {
        //Type="Edm.Time"
        try {
          var duration = oEdmTime.ms;
          var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          hours = hours < 10 ? "0" + hours : hours;
          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;
          return [hours, minutes, seconds].join(":");
        } catch (oError) {
          return ["00", "00", "00"].join(":");
        }
      },
      formatPTHMS: function (sTime) {
        var time = sTime.split(":");
        var newTime = "PT" + time[0] + "H" + time[1] + "M" + time[2] + "S";
        return newTime;
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
          return "";
        }

        /**
         * Restar 5 horas a la fecha por horario UTC-5
         * */
        var intHours = 5;
        var numberOfMlSeconds = oDate.getTime();
        var addMlSeconds = intHours * 60 * 60000;
        oDate = new Date(numberOfMlSeconds - addMlSeconds);

        let month = "" + (oDate.getUTCMonth() + 1),
          day = "" + oDate.getUTCDate(),
          year = oDate.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [day, month, year].join("/");
      },
      getTimestampToDMY2: function (oDate) {
        //Type="Edm.DateTime"
        if (oDate == undefined) {
          return "";
        }

        let month = "" + (oDate.getUTCMonth() + 1),
          day = "" + oDate.getUTCDate(),
          year = oDate.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [day, month, year].join("/");
      },
      getTimestampToDMYHMS: function (oDate) {
        //Type="Edm.DateTime"
        if (oDate == undefined) {
          return "";
        }

        /**
         * Restar 5 horas a la fecha por horario UTC-5
         * */
        var intHours = 5;
        var numberOfMlSeconds = oDate.getTime();
        var addMlSeconds = intHours * 60 * 60000;
        oDate = new Date(numberOfMlSeconds - addMlSeconds);

        let month = "" + (oDate.getUTCMonth() + 1),
          day = "" + oDate.getUTCDate(),
          year = oDate.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        let hours = "" + oDate.getUTCHours(),
          minutes = "" + oDate.getUTCMinutes(),
          seconds = "" + oDate.getUTCSeconds(),
          milliseconds = "" + oDate.getUTCMilliseconds();

        if (hours.length < 2) hours = "0" + hours;
        if (minutes.length < 2) minutes = "0" + minutes;
        if (seconds.length < 2) seconds = "0" + seconds;
        return (
          [day, month, year].join("/") +
          " " +
          [hours, minutes, seconds].join(":")
        );
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

      /**
       * @Description
       * Funcion que devuelve la hora de un objeto
       *
       * @param  {Object} Date()
       * @return  {String} [hours minutes seconds]
       * @example {
       *  var sHMS = fotmatter.getTimestampToHMS(new Date());
       *  //sHMS -> 10:20:34
       *  <Text text="{path: 'oData>property_Date', formatter: '.formatter.getTimestampToHMS'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getTimestampToHMS: function (oDate) {
        //Type="Edm.DateTime"
        if (oDate == undefined) {
          //d = new Date();
          return "";
        }
        let hours =
            "" +
            (oDate.getUTCHours() < 5
              ? oDate.getUTCHours() + 19
              : oDate.getUTCHours() - 5),
          minutes = "" + oDate.getUTCMinutes(),
          seconds = oDate.getUTCSeconds(),
          milliseconds = oDate.getUTCMilliseconds();

        if (hours.length < 2) hours = "0" + hours;
        if (minutes.length < 2) minutes = "0" + minutes;
        if (seconds.length < 2) seconds = "0" + seconds;
        return [hours, minutes, seconds].join(":");
      },

      _formatDateUnit: function (input) {
        if (input) {
          var time = parseInt(input.replace(/[^0-9]/g, "")); //"/Date(1645574400000)/" -> 1645574400000
          var a = new Date(time);
          a = new Date(a.setHours(a.getHours() + 5));
          var month = "" + (a.getUTCMonth() + 1),
            day = "" + a.getUTCDate(),
            year = a.getFullYear();

          if (month.length < 2) month = "0" + month;
          if (day.length < 2) day = "0" + day;
          return [year, month, day].join("-");
        }

        return ["0000", "00", "00"].join("-");
      },
      _formatTimeUnit: function (input) {
        var hours = _getTimeUnit(input, "H");
        var minutes = _getTimeUnit(input, "M");
        var seconds = _getTimeUnit(input, "S");
        return [hours, minutes, seconds].join(":");
      },
      _getTimeUnit: function (input, unit) {
        var index = input.indexOf(unit);
        var output = "00";
        if (index < 0) {
          return output; // unit isn't in the input
        }
        if (isNaN(input.charAt(index - 2))) {
          return "0" + input.charAt(index - 1);
        } else {
          return input.charAt(index - 2) + input.charAt(index - 1);
        }
      },

      getGenerateKey: function (oDate, sSeparate) {
        var sDate = getTimestampToDMYHMS(oDate);
        return sDate.replace(/[^a-zA-Z0-9]/g, sSeparate);
      },
      uuidv4: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      },

      /**
       * @Description
       * Funcion que devuelve la fecha y hora de un objeto
       *
       * @param  {Object} Date()
       * @return  {String} [day month year hours minutes seconds]
       * @example {
       *  var sTextMY = fotmatter.getTexMY(new Date());
       *  //sTextMY -> SEPTIEMBRE-2021
       *  <Text text="{path: 'oData>property_Date', formatter: '.formatter.getTexMY'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getTexMY: function (oDate) {
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
        if (oDate) {
          oDate.setDate(oDate.getDate() + 1);
          var sFormatDate = meses[oDate.getMonth()] + "-" + oDate.getFullYear();
          return sFormatDate;
        } else return "";
      },
      /**-----------------------------------------------*/
      /*                     STATUS
              /**-----------------------------------------------*/

      /**
       * @Description
       * Funcion que devuelve el texto status de un estado en especifico
       *
       * @param  {String} estado
       * @return  {String} status
       * @example {
       *  var sStatus = fotmatter.getStatusText("Activo");
       *  //sStatus -> Success
       *  <ObjectStatus state="{path:'oData>property_Status',formatter: '.formatter.getStatusText'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getStatusText: function (estado) {
        var t = estado;
        if (t == "Activo") {
          return "Success";
        } else if (t == "Inactivo") {
          return "Error";
        }
      },

      /**
       * @Description
       * Funcion que devuelve el texto icon de un estado en especifico
       *
       * @param  {String} estado
       * @return  {String} sap-icon
       * @example {
       *  var sIcon = fotmatter.getStatusTextIcon("Activo");
       *  //sIcon -> sap-icon://message-success
       *  <ObjectStatus icon="{path:'oData>property_Status', formatter: '.formatter.getStatusTextIcon'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getStatusTextIcon: function (estado) {
        var t = estado;
        if (t == "Activo") {
          return "sap-icon://message-success";
        } else if (t == "Inactivo") {
          return "sap-icon://message-error";
        }
      },

      /**
       * @Description
       * Funcion que devuelve el texto status de un estado booleano
       *
       * @param  {Boolean} bEstado
       * @return  {String} status
       * @example {
       *  var sStatus = fotmatter.getStatusText(true);
       *  //sStatus -> Success
       *  <ObjectStatus state="{path:'oData>property_Status',formatter: '.formatter.getStatusText'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getBStatusText: function (bEstado) {
        var t = bEstado;
        if (t) {
          return "Habilitado";
        } else {
          return "Deshabilitado";
        }
      },

      /**
       * @Description
       * Funcion que devuelve el texto status de un estado booleano
       *
       * @param  {Boolean} bEstado
       * @return  {String} status
       * @example {
       *  var sStatus = fotmatter.getStatusText(true);
       *  //sStatus -> Success
       *  <ObjectStatus state="{path:'oData>property_Status',formatter: '.formatter.getStatusText'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getBStatus: function (bEstado) {
        var t = bEstado;
        if (t) {
          return "Success";
        } else {
          return "Error";
        }
      },

      /**
       * @Description
       * Funcion que devuelve el texto icon de un estado booleano
       *
       * @param  {Boolean} estado
       * @return  {String} sap-icon
       * @example {
       *  var sIcon = fotmatter.getStatusTextIcon(true);
       *  //sIcon -> sap-icon://message-success
       *  <ObjectStatus icon="{path:'oData>property_Status', formatter: '.formatter.getStatusTextIcon'}" ... />
       * }
       * @History
       * v1.0 – Version inicial
       *
       */
      getBStatusTextIcon: function (bEstado) {
        var t = bEstado;
        if (t) {
          return "sap-icon://message-success";
        } else {
          return "sap-icon://message-error";
        }
      },
      getAjusteText: function (bEstado) {
        var t = bEstado;
        if (t) {
          return "Ajuste automatico en (+)";
        } else {
          return "Ajuste automatico en (-)";
        }
      },
      getDateFormatSap: function (sDate) {
        var day = "";
        var month = "";
        var year = "";
        var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "yyyy-MM-ddTHH:mm:ss",
        });
        var aDate = sDate.split("/");
        if (aDate.length < 3) aDate = sDate.split("-");
        if (aDate.length < 3) {
          year = sDate.substr(0, 4);
          month = sDate.substr(4, 2);
          day = sDate.substr(6, 2);
        } else {
          day = aDate[2].length == 4 ? aDate[0] : aDate[2];
          month = aDate[1];
          year = aDate[2].length == 4 ? aDate[2] : aDate[0];
        }
        var dateFormat = [year, month, day].join("/");
        return oDateFormat.format(new Date(dateFormat));
      },

      _erpOrdenStatus: function (sStatus, sType, iEntregaFisica) {
        let sValue;
        /**
         * I0001 - ABIERTOS             - ROJO
         * I0002 - LIBERADOS            - AMARILLO
         * I0009 - NOTIFICADO           - NEGRO
         * I0010 - NOTIFICADO PARCIAL   - NEGRO
         * I0045 - CERRADA TÉCNICAMENTE - NEGRO
         * I00XX - ENTREGA FISICA       - VERDE
         *
         */

        if (iEntregaFisica && iEntregaFisica > 0) {
          return sType == "TEXT"
            ? ""
            : sType == "COLOR"
            ? "Indication06"
            : sType == "ICON"
            ? "sap-icon://status-error"
            : "";
        }

        if (!sStatus)
          return sType == "TEXT"
            ? ""
            : sType == "COLOR"
            ? "Indication02"
            : sType == "ICON"
            ? "sap-icon://status-error"
            : "";
        sStatus = sStatus.toUpperCase();

        switch (sStatus) {
          case "I0001":
            sValue =
              sType == "TEXT"
                ? "ABIERTOS"
                : sType == "COLOR"
                ? "Indication01"
                : sType == "ICON"
                ? "sap-icon://status-in-process"
                : "";
            break;
          case "I0002":
            sValue =
              sType == "TEXT"
                ? "LIBERADOS"
                : sType == "COLOR"
                ? "Indication03"
                : sType == "ICON"
                ? "sap-icon://status-error"
                : "";
            break;
          case "I0009":
            sValue =
              sType == "TEXT"
                ? "NOTIFICADO"
                : sType == "COLOR"
                ? "Indication02"
                : sType == "ICON"
                ? "sap-icon://status-error"
                : "";
            break;
          case "I0010":
            sValue =
              sType == "TEXT"
                ? "NOTIFICADO PARCIAL"
                : sType == "COLOR"
                ? "Indication02"
                : sType == "ICON"
                ? "sap-icon://status-error"
                : "";
            break;
          case "I0045":
            sValue =
              sType == "TEXT"
                ? "CERRADA TÉCNICAMENTE"
                : sType == "COLOR"
                ? "Indication02"
                : sType == "ICON"
                ? "sap-icon://status-error"
                : "";
            break;
          default:
            sValue = "";
            break;
        }
        return sValue;
      },
      ErpOrdenStatusText: function (sStatus) {
        try {
          return this._erpOrdenStatus(sStatus, "TEXT");
        } catch (oError) {
          return this.formatter._erpOrdenStatus(sStatus, "TEXT");
        }
      },
      ErpOrdenStatusIcon: function (sStatus) {
        try {
          return this._erpOrdenStatus(sStatus, "ICON");
        } catch (oError) {
          return this.formatter._erpOrdenStatus(sStatus, "ICON");
        }
      },
      ErpOrdenStatusColor: function (sStatus, iEntregaFisica) {
        try {
          return this._erpOrdenStatus(sStatus, "COLOR", iEntregaFisica);
        } catch (oError) {
          return this.formatter._erpOrdenStatus(
            sStatus,
            "COLOR",
            iEntregaFisica
          );
        }
      },
      orderStatusColor: function (sStatus) {
        let sValue;

        /**
         * I0001 - ABIERTOS             - ROJO
         * I0002 - LIBERADOS            - AMARILLO
         * I0009 - NOTIFICADO           - NEGRO
         * I0010 - NOTIFICADO PARCIAL   - NEGRO
         * I0045 - CERRADA TÉCNICAMENTE - NEGRO
         * I00XX - ENTREGA FISICA       - VERDE
         *
         */
        sStatus = sStatus.toUpperCase();
        switch (sStatus) {
          case "LIBERADOS":
            //Amarillo - 3
            sValue = "Indication03";
            break;
          case "ABIERTOS":
            //Rojo - 1
            sValue = "Indication01";
            break;
          default:
            //Negro - 2
            sValue = "Indication02";
            break;
        }
        return sValue;
      },
      orderStatusIcon: function (sStatus) {
        let sValue;

        /**
         * I0001 - ABIERTOS
         * I0002 - LIBERADOS
         * I0009 - NOTIFICADO
         * I0010 - NOTIFICADO PARCIAL
         * I0045 - CERRADA TÉCNICAMENTE
         *
         */
        sStatus = sStatus.toUpperCase();
        switch (sStatus) {
          case "LIBERADOS":
            sValue = "sap-icon://status-in-process";
            break;
          case "ABIERTOS":
            sValue = "sap-icon://status-error";
            break;
          default:
            sValue = "sap-icon://status-error";
            break;
        }
        return sValue;
      },
      setVisibleProgramado: function (sStatus) {
        if (sStatus === "PRSA") {
          return true;
        } else {
          return false;
        }
      },
      setVisibleNoProgramado: function (sStatus) {
        if (sStatus === "APAR" || sStatus === "ATEN") {
          return true;
        } else {
          return false;
        }
      },
      setProgramadoEnSala: function (sStatus) {
        if (sStatus === "PRSA") {
          return "X";
        } else {
          return "";
        }
      },
    };
  }
);
