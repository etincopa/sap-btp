sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/FormattedText",
	"sap/m/MessageBox",
	"sap/ui/model/FilterOperator",
], function (Controller, Filter, JSONModel, Dialog, HorizontalLayout, VerticalLayout, Text, TextArea, Button, MessageToast, FormattedText,
	MessageBox, FilterOperator) {
	"use strict";

	return Controller.extend("com.everis.pss.controller.Main", {

		onChecked: function (oEvent) {
			var bEnabled = false;
			if (!this.cChb1.getSelected()) {
				this.cChb1.setSelected(this.cChb2.getSelected() ? true : false);
			}
			if (this.cChb2.getSelected()) {
				bEnabled = true;
				this.cChb2.setSelected(true);
				this.cChb1.setSelected(this.cChb1.getEnabled() ? true : false);
			} else {
				bEnabled = this.cChb1.getSelected() ? true : false;
				this.cChb2.setSelected(false);
			}
			this.byId("btnSubmit").setEnabled(bEnabled);
		},
		onSubmit: function (oEvent) {
			var oParams = {};
			if (this.byId("chb1").getSelected()) {
				oParams.Operation = "U";
				this.byId("chb1").setSelected(false);
				this.byId("btnSubmit").setEnabled(false);
			}
			if (this.byId("chb2").getSelected()) {
				oParams.Operation = oParams.Operation ? oParams.Operation + "R" : "R";
				this.byId("chb2").setSelected(false);
				this.byId("btnSubmit").setEnabled(false);
			}

			oParams.Uname = this.byId("inUname")._getSelectedItemText();
			oParams.User = this.byId("inUserSCP").getValue();
			oParams.Mandate = this.byId("mandate").getSelectedKey();
			oParams.System = this.byId("system").getSelectedKey();

			var _this = this;

			// Validate considerations read check
			if (!this.byId("chbRead").getSelected()) {
				MessageBox.error("Debe leer y aceptar las consideraciones antes de enviar la solicitud.");
				return;
			}

			this.getView().getModel().create("/UserEntitySet", oParams, {
				success: function (oResult) {
					if (oResult.ResultType === "S") {
						var str = oResult.ResultMessage;
						var res = str.split("\\n\\n");
						var sNewPassword = res[1] ? "<p><strong>" + res[1] + "</strong></p>\n" : "";
						var sNoteText = res[2] ? "<p><em>" + res[2] + "</em>\n</p>\n" : "";
						var sHTMLText = "<p>" + (res[0] ? res[0] : "Resultado desconocido") + "</p>\n" +
							sNewPassword +
							sNoteText +
							"<p>El mensaje de confirmación también ha sido enviado a su cuenta de correo.</p>\n";
						var dialog = new Dialog({
							title: "Resultado de la operación",
							type: "Message",
							content: [
								new FormattedText("confirmDialogTextarea", {
									htmlText: sHTMLText
								})
							],
							beginButton: new Button({
								text: "Aceptar",
								press: function () {
									dialog.close();
								}
							}),
							afterClose: function () {
								dialog.destroy();
							}
						});

						dialog.open();

						_this.cChb2.setSelected(false);
						_this.cChb1.setSelected(false);
						_this.cChbRead.setSelected(false);
						_this.cChb1.setEnabled(oResult.LockStatus);
					} else {
						MessageBox.error(oResult.ResultMessage);
					}
				},
				error: function (oError) {
					MessageBox.error(oError.responseText);
				}
			});

		},
		onInit: function () {
			var sUser = "PROYECT_MOV1";
			if (sap.ushell.Container) {
				sUser = sap.ushell.Container.getUser().getId().toUpperCase();
				this.sUser = sUser.split("@")[0].toUpperCase();
			} else {
				this.sUser = sUser;
			}

			this.cChb1 = this.byId("chb1");
			this.cChb2 = this.byId("chb2");
			this.cChbRead = this.byId("chbRead");

			if (["DEFAULT_USER", "PROYECT_MOV1"].includes(this.sUser)) {
				this.sUser = "PROYECT_MOV3";
			}

			this.byId("inUserSCP").setValue(this.sUser);

			var oModel = this.getOwnerComponent().getModel();
			var _this = this;

			oModel.metadataLoaded().then(function () {
				var aFilter = [];
				aFilter.push(new Filter("Useralias", FilterOperator.EQ, sUser));
				oModel.read("/AliasEntitySet", {
					filters: aFilter,
					success: function (Res) {
						_this.getView().setModel(new JSONModel(Res), "localAlias");

						oModel.read("/SystemEntitySet", {
							filters: [new Filter("User", "EQ", Res.results[0].Bname)],
							success: function (oResult) {
								_this.getView().setModel(new JSONModel(oResult), "localModel");
								_this.onSelectChanged();

							},
							error: function (oError) {
								jQuery.sap.log.error(oError);
							}
						});

					//	_this.onSelectChanged();
					},
					error: function (err) {
						jQuery.sap.log.error(err);
					}
				});

			});
		},

		loadSystemSetByUser: function (user) {
			var oModel = this.getOwnerComponent().getModel();
			var _this = this;
			oModel.read("/SystemEntitySet", {
				filters: [new Filter("User", "EQ", user)],
				success: function (oResult) {
					_this.getView().setModel(new JSONModel(oResult), "localModel");
					//_this.onSelectChanged();

				},
				error: function (oError) {
					jQuery.sap.log.error(oError);
				}
			});
		},

		onSelectedUser: function (evt) {
			var that = this;
			var oItem = evt.getParameter("selectedItem");
			var sKey = oItem.getKey();
			that.loadSystemSetByUser(sKey);

		},

		toggleVisibility: function (bParam) {
			this.cChb1.setSelected(false);
			this.cChb2.setEnabled(bParam);
			this.cChb2.setSelected(false);
		},
		onSelectChanged: function (oEvent) {
			var oModel = this.getView().getModel("localModel");
			if (oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var sKey = oItem.getKey();
				var sPath = oItem.getBindingContext("localModel").getPath();
			} else {
				sKey = oModel.getProperty("/results/0/System");
				sPath = "/results/0";
			}

			this.cChb1.bindProperty("enabled", {
				path: 'localModel>' + sPath + "/LockStatus"
			});
			// this.byId("inUname").bindProperty("name", {
			// 	path: "localAlias>" + sPath + "/Uname"
			// });
			var sValue = oModel.getProperty(sPath + "/Uname");
			if (sValue && sValue !== "USUARIO NO ENCONTRADO") {
				this.toggleVisibility(true);
			} else {
				this.toggleVisibility(false);
				this.byId("btnSubmit").setEnabled(false);
				this.byId("inUname").setValue("USUARIO NO ENCONTRADO");
			}
			var oSelect = this.byId("mandate");
			var oBindingInfo = oSelect.getBindingInfo("items");
			oBindingInfo.filters = new Filter("System", "EQ", sKey);
			oSelect.bindItems(oBindingInfo);
		}
	});
});