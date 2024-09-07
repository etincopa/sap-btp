sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
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
				try {
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
				} catch (e) {
					const message = { title: DocumentNumber, type: "Error", description: "Error al recibir respuesta del servidor." };
					messageFinally.push(message);
					return messageFinally;
				}
			} else {
				return "";
			}
		}
	};
});