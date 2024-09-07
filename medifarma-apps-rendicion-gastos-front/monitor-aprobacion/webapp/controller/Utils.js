sap.ui.define([], function () {
	"use strict";

	return {
		fnFormatearFechaVista: function (pValue, utc = true) {
			if (pValue !== null && pValue !== undefined) {
				var d = new Date(pValue);
				if (utc) d.setHours(d.getHours() + 5); // sap retorna utc pero js lo cambia a utc-5
				var month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = '' + d.getFullYear();

				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;

				return [day, month, year].join('-');
			} else {
				return "";
			}
		},
		
		onValidNumber: function (str) {
			return str.replace(/[^\d]/g, "");
		},

		onValidarVacio: function (valor) {
			valor = valor === undefined ? "" : valor;
			if (!valor || 0 === valor.trim().length) {
				return true;
			} else {
				return false;
			}
		},
		
		fnFormatearFechaSAP: function (pValue) {
			var iDia = pValue.substr(0, 2);
			var iMes = pValue.substr(3, 2);
			var iYear = pValue.substr(6, 4);
			return [iYear, iMes, iDia].join('-');
		},
		
		fnFormatearFechaFactura2: function (pValue) {
			var iDia = pValue.substring(0, 2);
			var iYear = pValue.substring(6, 10);
			var iMes = Number(pValue.substring(3, 5));
			if (iMes < 10) {
				iMes = "0" + iMes;
			}
			return [iDia, iMes, iYear].join('.');
		},
		
		fnFormatearFechaFactura1: function (pValue) {
			var iDia = Number(pValue.getDate());
			if (iDia < 10) {
				iDia = "0" + iDia;
			}
			var iYear = pValue.getFullYear();
			var iMes = pValue.getMonth() + 1;
			if (iMes < 10) {
				iMes = "0" + iMes;
			}
			return [iDia, iMes, iYear].join('.');
		},
		
		getBlobFromFile: function (sFile) {
			var contentType = sFile.substring(5, sFile.indexOf(";base64,"));
			var base64_marker = "data:" + contentType + ";base64,";
			var base64Index = base64_marker.length;
			contentType = contentType || "";
			var sliceSize = 512;
			var byteCharacters = window.atob(sFile.substring(base64Index)); //method which converts base64 to binary
			var byteArrays = [];
			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);
				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}
			var blob = new Blob(byteArrays, {
				type: contentType
			});

			return blob;
		},
		
		base64coonversionMethod: function (file) {
			var that = this;
			return new Promise(function (resolve) {
				var reader = new FileReader();
				reader.onload = function (readerEvt) {
					var binaryString = readerEvt.target.result;
					resolve(that.getBlobFromFile(binaryString));
				};
				reader.readAsDataURL(file);
			});
		},

		blobToBase64String: function (blobFile) {
			return new Promise(function (resolve) {
				var reader = new FileReader();
				reader.onload = function (readerEvt) {
					var base64String = readerEvt.target.result;
					resolve(base64String);
				};
				reader.readAsDataURL(blobFile);
			});
		},
		
		codificarEntidad: function(str2, bSolicitud) {
			var array = [];
			var longitud = str2.length;
			for (var i = str2.length - 1; i >= 0; i--) {
				array.unshift(['', str2[i].charCodeAt(), ';'].join(''));
			}
			var texto = array.join('');
			while (longitud > 0) {

				//ñ
				texto = texto.replace("241;", "110;");
				//Ñ
				texto = texto.replace("209;", "78;");
				//a
				texto = texto.replace("228;", "97;");
				texto = texto.replace("226;", "97;");
				texto = texto.replace("224;", "97;");
				texto = texto.replace("229;", "97;");
				//A
				texto = texto.replace("196;", "65;");
				texto = texto.replace("197;", "65;");
				texto = texto.replace("192;", "65;");
				texto = texto.replace("195;", "65;");
				//e
				texto = texto.replace("234;", "101;");
				texto = texto.replace("235;", "101;");
				texto = texto.replace("232;", "101;");
				//E
				texto = texto.replace("202;", "69;");
				texto = texto.replace("200;", "69;");
				//i
				texto = texto.replace("239;", "105;");
				texto = texto.replace("236;", "105;");
				//I
				texto = texto.replace("206;", "73;"); // Í,I
				texto = texto.replace("207;", "73;"); // Í,I
				//o
				texto = texto.replace("242;", "111;"); // ó,o
				texto = texto.replace("244;", "111;"); // ó,o
				//O
				texto = texto.replace("210;", "79;"); // Ó,O
				texto = texto.replace("213;", "79;"); // Ó,O
				//u
				texto = texto.replace("249;", "117;"); // ú,u
				texto = texto.replace("251;", "117;"); // ú,u
				texto = texto.replace("252;", "117;"); // ú,u
				//U
				texto = texto.replace("217;", "85;"); // Ú,U
				texto = texto.replace("219;", "85;"); // Ú,U
				texto = texto.replace("220;", "85;"); // Ú,U

				//vocales minusculas
				texto = texto.replace("225;", "97;"); // á,a
				texto = texto.replace("233;", "101;"); // é,e
				texto = texto.replace("237;", "105;"); // í,i
				texto = texto.replace("243;", "111;"); // ó,o
				texto = texto.replace("250;", "117;"); // ú,u
				//vocales MAYUSCULAS
				texto = texto.replace("193;", "65;"); // Á,A
				texto = texto.replace("201;", "69;"); // É,E
				texto = texto.replace("205;", "73;"); // Í,I
				texto = texto.replace("211;", "79;"); // Ó,O
				texto = texto.replace("218;", "85;"); // Ú,U
				//numeros
				if (!bSolicitud) {
					texto = texto.replace("48;", ""); // 0
				}
				
				longitud--;
			}
		
			return texto;
		},
		
		decodificarEntidad: function(str1) {
			var texto = str1.replace(/(\d+);/g, function (match, dec) {
				if (dec >= 48 && dec <= 57) { //numeros
					return String.fromCharCode(dec);
				} else if (dec >= 97 && dec <= 122) { //minusculas
					return String.fromCharCode(dec);
				} else if (dec >= 65 && dec <= 90) { //mayúsculas
					return String.fromCharCode(dec);
				}
				//simbolos
				else if (dec == 45 || // -
					dec == 95 || // _
					dec == 46 || // .
					dec == 32 || // espacio
					dec == 39 // '
				) {
					return String.fromCharCode(dec);
				} else {
					return "";
				}
			});
			return texto;
		},
		
		getFileExtension: function (filename) {
			var ext = /^.+\.([^.]+)$/.exec(filename);
			return ext == null ? "" : ext[1];
		},
		
		cloneObj: function (mainObj) {
			return JSON.parse(JSON.stringify(mainObj));
		},
		
		oListarCarpetas: function (url) {
			var obj = [];
			$.ajax(url + "?cmisselector=children", {
				type: "GET",
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (response) {
					$.each(response.objects, function (idx, item) {
						obj.push({
							"folderName": item.object.properties["cmis:name"].value
						});
					});
				},
				error: function (error) {
					console.log(error);
					if (error.responseJSON.exception === "objectNotFound") {
						console.log("Error!! no se puede obterner cantidad de archivos");
					}
				}
			});
			return obj;
		},
		
		oCrearSubCarpetas: function (url1, foldername) {
			var sDireccion;
			var data = {
				"propertyId[0]": "cmis:objectTypeId",
				"propertyValue[0]": "cmis:folder",
				"propertyId[1]": "cmis:name",
				"propertyValue[1]": foldername,
				"cmisaction": "createFolder"
			};
			var formData = new FormData();
			jQuery.each(data, function (key, value) {
				formData.append(key, value);
			});
			$.ajax(url1, {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (response) {
					sDireccion = url1 + "/" + foldername;
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
			return sDireccion;
		},
		
		showMessageBox: function (msg, Method) {
			if (Method === "warning") {
				sap.m.MessageBox.warning(msg, {
					title: "Alerta",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "error") {
				sap.m.MessageBox.error(msg, {
					title: "Error",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "show") {
				sap.m.MessageBox.show(msg, {
					title: "Mensaje",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
			if (Method === "success") {
				sap.m.MessageBox.success(msg, {
					title: "Éxito",
					actions: ["Aceptar"],
					onClose: function (sActionClicked) {}
				});
			}
		},
		lockButtonWithTimer: function (oButton) {
			oButton.setEnabled(false);
			setTimeout(function () {
				oButton.setEnabled(true);
			}, 1000)
		}
	}
});