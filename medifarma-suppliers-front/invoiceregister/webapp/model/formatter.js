sap.ui.define([], function () {
	"use strict";
	return {
		formatValue: function (e) {
			e = parseFloat(e).toFixed(2);
			var r = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			return r.format(e)
		},
		formatDate: function (e) {
			if (e) {
				var r = e.substring(0, 4);
				var t = e.substring(4, 6);
				var s = e.substring(6, 8);
				return s + "/" + t + "/" + r
			} else return ""
		},
		numDate: function (e, r) {
			if (e && r) {
				var t = new Date(e).getTime();
				var s = new Date(r).getTime() + 1 * 24 * 60 * 60 * 1e3;
				var i = s - t;
				return i / (1e3 * 60 * 60 * 24)
			} else return ""
		},
		formatDateJs: function (e) {
			if (e) {
				var r = new Date(e);
				var t = r.toLocaleString("en-GB", {
					timeZone: "UTC"
				});
				var s = t.substring(6, 10);
				var i = t.substring(3, 5);
				var a = t.substring(0, 2);
				return s + "-" + i + "-" + a
			} else return ""
		},
		formatDateJs_: function (e) {
			if (e) {
				var r = new Date(e);
				var t = r.toLocaleString("en-GB", {
					timeZone: "UTC"
				});
				var s = t.substring(6, 10);
				var i = t.substring(3, 5);
				var a = t.substring(0, 2);
				return a + "/" + i + "/" + s
			} else return ""
		},
		formatStringLowerCase: function (e) {
			if (e) {
				return e.toLowerCase()
			}
		},
		formaterFilter: function (e) {
			if (e) {
				var r = e.substring(6, 10);
				var t = e.substring(3, 5);
				var s = e.substring(0, 2);
				return r + t + s
			}
		},
		formatoFechaTabla: function (e) {
			var r = new Date(e);
			var t = r.toLocaleString("en-GB", {
				timeZone: "UTC"
			});
			var s = t.substring(6, 10);
			var i = t.substring(3, 5);
			var a = t.substring(0, 2);
			return a + "/" + i + "/" + s
		},
		formaterCalendar: function (e) {
			if (e) {
				var r = e.substring(6, 10);
				var t = e.substring(3, 5);
				var s = e.substring(0, 2);
				return r + "/" + t + "/" + s
			}
		},
		formaterFilterDats: function (e) {
			if (e) {
				var r = e.substring(6, 10);
				var t = e.substring(3, 5);
				var s = e.substring(0, 2);
				return r + "-" + t + "-" + s + "T00:00:00"
			}
		},
		showStartDate: function (e) {
			if (e) {
				var r = new Date(0).getTimezoneOffset() * 60 * 1e3;
				return new Date(e.getTime() + r)
			}
		},
		formaterEstatus: function (e) {
			if (e === "L") return "Liberada";
			else if (e === "C") return "Cerrada";
			else if (e === "A") return "Abierta";
			else return " "
		},
		detectionWindow: function (e) {
			if (sap.ui.Device.system.tablet) {
				e.setVisible(false)
			} else if (sap.ui.Device.system.desktop) {
				e.setVisible(true)
			} else {
				e.setVisible(false)
			}
		},
		mostrarTabla: function (e, r, t, s, i) {
			if (r === "c") {
				e.setVisible(true);
				t.setVisible(false);
				s.setVisible(false);
				i.setVisible(false)
			} else if (r === "o") {
				e.setVisible(true);
				t.setVisible(false);
				s.setVisible(false);
				i.setVisible(false)
			} else if (r === "f") {
				e.setVisible(false);
				t.setVisible(false);
				s.setVisible(true);
				i.setVisible(false)
			}
		},
		formatofecha_: function (e) {
			var r, t, s;
			if (e.substr(1, 1) === "/") {
				r = "0" + e.substr(0, 1);
				if (e.substr(3, 1) === "/") {
					t = "0" + e.substr(2, 1);
					s = e.substr(4, 8)
				} else {
					t = e.substr(2, 2);
					s = e.substr(5, 8)
				}
			} else {
				r = e.substr(0, 2);
				if (e.substr(4, 1) === "/") {
					t = "0" + e.substr(3, 1);
					s = e.substr(5, 4)
				} else {
					t = e.substr(3, 2);
					s = e.substr(6, 4)
				}
			}
			var i = s + "-" + t + "-" + r;
			return i
		},
		formatofecha__: function (e) {
			var r, t, s;
			if (e.substr(1, 1) === "/") {
				r = "0" + e.substr(0, 1);
				if (e.substr(3, 1) === "/") {
					t = "0" + e.substr(2, 1);
					s = e.substr(4, 8)
				} else {
					t = e.substr(2, 2);
					s = e.substr(5, 8)
				}
			} else {
				r = e.substr(0, 2);
				if (e.substr(4, 1) === "/") {
					t = "0" + e.substr(3, 1);
					s = e.substr(5, 4)
				} else {
					t = e.substr(3, 2);
					s = e.substr(6, 4)
				}
			}
			var i = s + "-" + t + "-" + r;
			return i
		},
		statusRow: function (e) {
			if (e) {
				if (e === "O") return "Information";
				else return "Success"
			} else return "None"
		},
		formatoReferencia: function (e,iNumber) {
			var r = e.split("-");
			if (r.length === 2) {
				var t = "";
				for (var s in r) {
					if (s < r.length - 1) {
						t = t.concat(r[s]) + "-";
					} else {
						t = t.concat(r[s].replace(/^0+/g, "").padStart(iNumber, 0));
					}
				}
				return t;
			} else {
				return e;
			}
		}
	}
});