sap.ui.define([
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox'
], function (JSONModel, MessageBox) {
	"use strict";
	return {
		successUpdate: function () {
			MessageBox.success("Creado Correctamente", {
				icon: MessageBox.Icon.SUCCESS,
				title: "Success",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		errorUser: function () {
			MessageBox.error("Ruc no encontrado como proveedor.", {
				icon: MessageBox.Icon.ERROR,
				title: "Validación de usuario",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact',
			});
		},
		error: function (message, detail) {
			var that = this;
			MessageBox.error(message, {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact',
				details: detail? detail : null
			});
		},
		errorUpdate: function (Return) {
			var that = this;
			MessageBox.error("Error al actualizar.", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact',
				details: that.parseDetailUpdate(Return)
			});
		},
		parseDetailUpdate: function (Return) {
			var returnString = "<ul>";
			$.each(Return, function (k, v) {
				returnString = returnString + "<li>" +
					v.MessageV2 + "<ul> <li>" +
					v.Message + "</li></ul> </li>";
			});
			returnString = returnString + "</ul>";
			return returnString;
		},
		onErrorDetail: function (aPos) {
			var that = this;
			MessageBox.error("Error de datos en las posicion(es)", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact',
				details: that.parseDetailPos(aPos)
			});
		},
		parseDetailPos: function (aPos) {
			var returnstring = "<p><strong>Posiciones:</strong></p> \n ";
			returnstring = returnstring + "<ul>";
			var detailsMessage = [];
			$.each(aPos, function (k, v) {
				detailsMessage = [];
				if (parseFloat(v.CantOfer) < 0.1) {
					detailsMessage.push("Cantidad Oferta");
				}
				if (parseFloat(v.PreUnit) < 0.1) {
					detailsMessage.push("Precio Unitario");
				}
				if (parseFloat(v.CantBase) < 0.1) {
					detailsMessage.push("Cantidad Base");
				}
				if (v.FeEntpro === null) {
					detailsMessage.push("Fecha de Entrega Propuesta");
				}
				returnstring = returnstring + "<li> " + v.PosPoferta + " <ul>";
				$.each(detailsMessage, function (kD, vD) {
					returnstring = returnstring + "<li>" + vD + "</li>";
				});
				returnstring = returnstring + "</ul> </li>";
			});
			returnstring = returnstring + "</ul>";
			return returnstring;
		},
		errorGetFile: function () {
			MessageBox.error("Error al descarga el archivo", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		errorGetFileNoId: function () {
			MessageBox.error("No se puede descargar el archivo debido que aún no ha sido subido al servidor", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		errorvalidateHeader: function () {
			MessageBox.error("Por favor validar los campos que se encuentran remarcados en la sección Proceso de Cotización", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		selectedFilter: function (type) {
			var msg;
			if (type === "errorDatePicker") {
				msg = "Debe Selecionar correctamente la fecha minima y maxima.";
			} else if (type === "errorLicEsta") {
				msg = "Debe seleccionar por lo menos un filtro.";
			}
			MessageBox.error(msg, {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},

		errorDelete: function () {
			MessageBox.error("Error al eliminar el archivo.", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		showTextPos: function (objPos) {
			MessageBox.error(objPos.TxtPos.replace(/\\n/g, "\n"), {
				icon: MessageBox.Icon.INFORMATION,
				title: "Texto Posición",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		noModified: function () {
			MessageBox.error("No se ha modificado ningún campo.", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Información",
				onClose: null,
				actions: [MessageBox.Action.CLOSE],
				styleClass: 'sapUiSizeCompact'
			});
		},
		onReadMessageSuccess: function (message, DocumentNumber) {
			if (message) {
				if (message.headers["sap-message"]) {
					var messageFinally = [];
					var messages = JSON.parse(message.headers["sap-message"]);

					if (messages.length) {
						$.each(messages, function (key, item) {
							if (item.details) {
								$.each(item.details, function (key2, item2) {
									item2.description = item2.message;
									var type = item2.severity;
									if (type === "info") {
										item2.type = "Information";
									} else if (type === "warning") {
										item2.type = "Warning";
									} else if (type === "success") {
										item2.type = "Success";
									} else {
										item2.type = "Error";
									}
									item2.title = DocumentNumber;
									messageFinally.push(item2);
								});
							}
							item.description = item.message;
							var type = item.severity;
							if (type === "info") {
								item.type = "Information";
							} else if (type === "warning") {
								item.type = "Warning";
							} else if (type === "success") {
								item.type = "Success";
							} else {
								item.type = "Error";
							}
							item.title = DocumentNumber;
							messageFinally.push(item);
						});
						return messageFinally;
					} else {
						if (messages.details) {
							$.each(messages.details, function (key, item) {
								item.description = item.message;
								var type = item.severity;
								if (type === "info") {
									item.type = "Information";
								} else if (type === "warning") {
									item.type = "Warning";
								} else if (type === "success") {
									item.type = "Success";
								} else {
									item.type = "Error";
								}
								item.title = DocumentNumber;
								messageFinally.push(item);
							});
						}
						messages.description = messages.message;
						var type = messages.severity;
						if (type === "info") {
							messages.type = "Information";
						} else if (type === "warning") {
							messages.type = "Warning";
						} else if (type === "success") {
							messages.type = "Success";
						} else {
							messages.type = "Error";
						}
						messages.title = DocumentNumber;
						messageFinally.push(messages);
						return messageFinally;
					}
				} else {
					return [];
				}
			} else {
				return [];
			}
		},

		onReadMessageError: function (message, DocumentNumber) {
			if (message.responseText) {
				var messageFinally = [];
				var messages = JSON.parse(message.responseText).error.innererror.errordetails;

				if (messages.length) {
					$.each(messages, function (key, item) {
						item.description = item.message;
						var type = item.severity;
						if (type === "info") {
							item.type = "Information";
						} else if (type === "warning") {
							item.type = "Warning";
						} else if (type === "success") {
							item.type = "Success";
						} else {
							item.type = "Error";
						}
						item.title = DocumentNumber;
					});
					return messages;
				} else {
					messages.description = messages.message;
					var type = messages.severity;
					if (type === "info") {
						messages.type = "Information";
					} else if (type === "warning") {
						messages.type = "Warning";
					} else if (type === "success") {
						messages.type = "Success";
					} else {
						messages.type = "Error";
					}
					messages.title = DocumentNumber;
					messageFinally.push(messages);
					return messageFinally;
				}
			} else {
				return "";
			}
		}
	};
});