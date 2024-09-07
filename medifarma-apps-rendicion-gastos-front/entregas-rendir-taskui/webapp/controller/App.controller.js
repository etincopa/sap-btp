sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../services/DocumentService",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/File",
    "../services/EverisUtils",
    "../services/Service",
    "sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter"
], function (Controller, DS, Fragment, JSONModel, File , EverisUtils, Service, BusyIndicator, Filter) {
	"use strict";
    var oThat;
    var oModelGeneral ;
	var oModelHelp;
	var oDataHelp, oDataContext;
	$.ambiente = "QAS";
	return Controller.extend("UISolicitudFF.controller.App", {

		onInit: function () {
			var oThat = this;
			var oVariablesGlobales = {};
			oVariablesGlobales.carpetaEntregasRendir = "ENTREGASRENDIR";
			oVariablesGlobales.carpetaSolicitud = "SOLICITUDES";
			oVariablesGlobales.carpetaGasto = "GASTOS";
            sap.ui.getCore().setModel(oVariablesGlobales, "oVariablesGlobales");
			EverisUtils.backend.initialize(oThat.getOwnerComponent().getModel("UtilsModel"));
			EverisUtils.backend.getParameters("RENDICION_GASTOS", null).then((aParameters) => {
				const aParamsToParse = oThat.getOwnerComponent().getModel("Config").getData().parameters;
				return EverisUtils.backend.parseParameters(aParameters, aParamsToParse);
			})
			.then((paramValues) => {
				sap.ui.getCore().setModel(new JSONModel(paramValues["ENTREGAS_RENDIR"]), "ParametersModel");
				oThat._initSharepoint(paramValues["SHAREPOINT"]);
			});
		},

		onAfterRendering: function () {
			this.loadObjectsData();
		},

		_initSharepoint: function (oValues) {
			EverisUtils.sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
			EverisUtils.sharepoint.setUrl(oValues.URL);
			EverisUtils.sharepoint.setGetTokenFn(() => {
			  return EverisUtils.backend.getSharepointToken("RENDICION_GASTOS");
			});
		},

		loadObjectsData: function () {
			oModelHelp = this.getView().getModel("helpModel");
			oDataHelp = oModelHelp.getData();
			this.onFilterTable()
		},

		onPressRow: function (oEvent) {
			var oButton = oEvent.getSource();
			var oPosition = oButton.getBindingContext("data").getObject();
			oDataHelp.folderItem = oPosition.Nposit;
			if (!this._oDialogFiles) {
				Fragment.load({
					id: "dialogFiles",
					name: "UISolicitudFF.view.fragments.Attach",
					controller: this
				}).then(function (oPopover) {
					this._oDialogFiles = oPopover;
					this.getView().addDependent(this._oDialogFiles);
					this.getIdMainFolder();
				}.bind(this));
			} else {
				this.getIdMainFolder();
			}
		},

		onPressSolAttachment: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var oThes =this;
			oDataContext = this.getView().getModel("data").getData().context;
			// var sIdFolderSolicitud = oDataContext.idFolderSolicitudGenerada;     
			//         if (!this._oDialogFiles) {
			//             Fragment.load({
			//                 id: "dialogFiles",
			//                 name: "UISolicitudFF.view.fragments.Attach",
			//                 controller: this
			//             }).then(function(oPopover){
			//                 this._oDialogFiles = oPopover;
			//                 this.getView().addDependent(this._oDialogFiles);
			//         		this.getFiles(sIdFolderSolicitud);
			//             }.bind(this));
			//         } else {
			//         	this.getFiles(sIdFolderSolicitud);
			//         }
			////JORDAN///////////////////////
			var oModelDocSolicitud = this.getView().getModel("helpModel");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
			var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
			var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();
			var Type = oDataContext.Type,
				Bukrs = oDataContext.Bukrs,
				Belnr = oDataContext.Belnr,
				Gjahr = oDataContext.Gjahr,
				sRoute = oParametersModel.AMBIENTE + "/";
			if (Type == "S") {
				if (Bukrs === "1000") {
					sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
						return oSociedad.valueLow === Bukrs
					}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaSolicitud + "/" + Belnr + Bukrs + Gjahr;
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "SOLICITUDES" + "/" + Belnr;
				}
			} else if (Type == "G") {
				if (Bukrs === "1000") {
					sRoute = sRoute + "20100108292" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + Belnr + Bukrs + Gjahr + "/" + "1";
				} else if (Bukrs === "2000") {
					sRoute = sRoute + "20602670130" + "/" + "ENTREGASRENDIR" + "/" + "GASTOS" + "/" + Belnr + Bukrs + Gjahr + "/" + "1";
				}
			}

			if (!this._oDialogFiles) {
				Fragment.load({
					id: "dialogFiles",
					name: "UISolicitudFF.view.fragments.Attach",
					controller: this
				}).then(function (oPopover) {
					this._oDialogFiles = oPopover;
					this.getView().addDependent(this._oDialogFiles);
					EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
						aFiles.forEach((oFile) => {
							oFile.bLocal = false
						});
						oDataDocSolicitud.Files = aFiles;
						oDataDocSolicitud.Route = sRoute;
						// oDataDocSolicitud.url = oResult[0];
						// oDataDocSolicitud.dsroot = oResult[2];
						oModelDocSolicitud.refresh();
						sap.ui.core.BusyIndicator.hide();
						oThes._oDialogFiles.open();
					}.bind(oThes)).catch((oError) => {
						console.log(oError);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oThes.getI18nText("msgSharepointError"));
					});
				}.bind(this));
			} else {
				EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
					oDataDocSolicitud.Files = aFiles;
					oDataDocSolicitud.Route = sRoute;
					// oDataDocSolicitud.url = oResult[0];
					// oDataDocSolicitud.dsroot = oResult[2];
					oModelDocSolicitud.refresh();
					sap.ui.core.BusyIndicator.hide();
					oThes._oDialogFiles.open();
				}.bind(oThes)).catch((oError) => {
					console.log(oError);
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oThes.getI18nText("msgSharepointError"));
				});
			}
			/////////////////////////////////

		},

		getIdMainFolder: function () {
			oDataContext = this.getView().getModel("data").getData().context;
			oDataHelp.folder = oDataContext.Belnr + oDataContext.Bukrs + oDataContext.Gjahr;
			DS.getFolderByName(oDataHelp.cmis, oDataHelp.folder).then(function (sFolderIdMain) {
				oDataHelp.folderId = sFolderIdMain;
				this.getIdChildFolder();
			}.bind(this));
		},

		getIdChildFolder: function () {
			DS.getFolderByName(oDataHelp.folderId, oDataHelp.folderItem).then(function (sFolderId) {
				if (sFolderId !== "404")
					this.getFiles(sFolderId);
			}.bind(this));
		},

		getFiles: function (sFolderId) {
			DS.getFilesQuery(sFolderId).then(function (oResult) {
				oDataHelp.Files = oResult[1];
				oDataHelp.url = oResult[0];
				oDataHelp.dsroot = oResult[2];
				oModelHelp.refresh();
				this._oDialogFiles.open();
			}.bind(this));
		},

		onCloseDialog: function (oEvent) {
			this._oDialogFiles.close();
		},

		formatDate: function (v) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				style: "medium"
			}, sap.ui.getCore().getConfiguration().getLocale());
			return oDateFormat.format(v);
		},
        onDowloadFile: function (oEvent) {
            try {
                if (true) {
                   var oContext = this.getView().getModel("data").getData().context;
                   var sDocumento = oContext.Belnr + oContext.Bukrs + oContext.Gjahr
                   var sFolder = 'DEV/20521586134/ENTREGASRENDIR/SOLICITUDES/'+ sDocumento;
                    SharePoint.downloadFile(oThat, sFolder);
                }
            } catch (oError) {
                this.onErrorMessage(oError, "errorSave");
            }
        },

		onDownloadFiles: function (oEvent) {
			var oControl = oEvent.getSource();
			var sFileName = oControl.getBindingContext("helpModel").getProperty().Name;
			var sRoute = this.getView().getModel("helpModel").getData().Route;
			EverisUtils.sharepoint.downloadFile(sRoute, sFileName).catch((oError) => {
				console.log(oError);
				MessageBox.error(oThes.getI18nText("msgSharepointError"));
			});
		},

		onFilterTable: function () {
			var oModelContext = this.getOwnerComponent().getModel("data");
			sap.ui.core.BusyIndicator.show();
			if (oModelContext !== undefined) {
				if (oModelContext.getData().context.Type == "G") {
					var oModelEntregaRendir = this.getOwnerComponent().getModel("oEntregaModel");
					var aFilter = [];
					var oDataContext = oModelContext.getData();
					aFilter.push(new Filter('Bukrs', 'EQ', oDataContext.context.Bukrs));
					aFilter.push(new Filter('Belnr', 'EQ', oDataContext.context.Belnr));
					aFilter.push(new Filter('Gjahr', 'EQ', oDataContext.context.Gjahr));
					oModelEntregaRendir.read("/DetGastoSet", {
						filters: aFilter,
						success: (oSuccess) => {
							this.onVerifyDetail(oSuccess.results);
							var oModel = new JSONModel(oSuccess);
							oModel.setSizeLimit(1000);
							this.getOwnerComponent().setModel(oModel, "modelDetalle");
							this.oModelDetalle = this.getOwnerComponent().getModel("modelDetalle");
							sap.ui.core.BusyIndicator.hide();
							this.obtenerTotales();
						},
						error: (oError) => {
							console.log(oError);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				} else {
					sap.ui.core.BusyIndicator.hide();
				}
			} else {
				setTimeout(() => {
					this.onFilterTable();
				}, 3000);
			}
		},

		onVerifyDetail: function (aResultdata) {
			var aItemReject = aResultdata.filter((ele) => {
				return ele.FlagAprob === '';
			});
			var Owner = this.getOwnerComponent();
			var startupParameters = Owner.getComponentData().startupParameters;
			if (aItemReject.length) {
				startupParameters.inboxAPI.disableAction("Approve");
				startupParameters.inboxAPI.enableAction("Reject");
			} else {
				startupParameters.inboxAPI.disableAction("Reject");
				startupParameters.inboxAPI.enableAction("Approve");
			}
		},

		formatSwitch: function (sState) {
			if (sState === "X") {
				return true;
			} else {
				return false;
			}
		},

		onChangeSwitch: function (oEvent) {
			var bState = oEvent.getParameter("state");
			var oSwitch = oEvent.getSource();
			var oModelItem = oSwitch.getParent().getBindingContext("modelDetalle");
			var oItemSelected = oModelItem.getObject();
			var aResults = this.oModelDetalle.getData().results;
			var iIndex = aResults.indexOf(oItemSelected);
			oItemSelected.FlagAprob = bState ? 'X' : '';
			if (!bState) {
				this.onOpenDialog(aResults, iIndex, oSwitch);
			} else {
				aResults[iIndex].Zmotivor = "";
				this.onVerifyDetail(aResults);
				this.oModelDetalle.refresh();
			}
		},

		onOpenDialog: function (aResult, iIndex, oSwitch) {
			this.oSubmitDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Confirmación",
				content: [
					new sap.m.Label({
						text: "Estas seguro de no aprobar esta posición?"
					}),
					new sap.m.TextArea({
						width: "100%",
						value: aResult[iIndex].Zmotivor,
						placeholder: "Motivo de Rechazo (obligatorio)",
						liveChange: function (oEvent) {
							var sText = oEvent.getParameter("value");
							this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
						}.bind(this)
					})
				],
				beginButton: new sap.m.Button({
					type: "Emphasized",
					text: "Guardar",
					enabled: false,
					press: function (oEvent) {
						var oArea = oEvent.getSource().getParent().getContent()[1];
						var sValue = oArea.getValue();
						aResult[iIndex].Zmotivor = sValue;
						aResult[iIndex].FlagAprob = '';
						this.onVerifyDetail(aResult);
						this.oModelDetalle.setProperty("/results", aResult);
						this.oModelDetalle.refresh();
						oSwitch.setState(false);
						this.oSubmitDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						aResult[iIndex].Zmotivor = "";
						aResult[iIndex].FlagAprob = 'X';
						this.onVerifyDetail(aResult);
						this.oModelDetalle.setProperty("/results", aResult);
						this.oModelDetalle.refresh();
						oSwitch.setState(true);
						this.oSubmitDialog.close();
					}.bind(this)
				})
			});

			this.oSubmitDialog.open();
		},

		formatOperacion: function (oEvent) {
			var sOper = oEvent;
			if (!sOper) return "";
			sOper = sOper.split(" - ", 2)[1];
			return sOper;
		},

		fnFormatearFechaVista: function (pValue) {
			if (pValue !== null && pValue !== undefined) {
				var d = new Date(pValue);
				d.setHours(d.getHours() + 5); // fecha guardada en SAP en UTC
				var month = `${(d.getMonth() + 1)}`.padStart(2, '0'),
					day = `${d.getDate()}`.padStart(2, '0'),
					year = d.getFullYear();
				return [day, month, year].join('-');
			} else {
				return "";
			}
		},

		obtenerTotales: function () {
			var oModelTable = this.getOwnerComponent().getModel("modelDetalle");
			var oModelTableData = oModelTable.getData().results;
			var ImporteSinIGV = [];
			var ImporteConIGV = [];
			var IGV;
			for (var i = 0; i < oModelTableData.length; i++) {
				var wrbtr = parseFloat(oModelTableData[i].Wrbtr);
				var indImp = parseInt(oModelTableData[i].Mwskz, 10);
				ImporteConIGV.push(wrbtr);
				var SinIGV = wrbtr * 100 / (indImp + 100);
				ImporteSinIGV.push(SinIGV);
			}
			var TotalconIGV = 0;
			var TotalsinIGV = 0;
			for (var j = 0; j < ImporteConIGV.length; j++) {
				TotalconIGV = TotalconIGV + ImporteConIGV[j];
			}
			for (var k = 0; k < ImporteSinIGV.length; k++) {
				TotalsinIGV = TotalsinIGV + ImporteSinIGV[k];
			}
			IGV = TotalconIGV - TotalsinIGV;
			IGV = this.roundToTwo(IGV);
			TotalconIGV = this.roundToTwo(TotalconIGV);
			TotalsinIGV = this.roundToTwo(TotalsinIGV);
			this.getView().byId("IGVTOTAL").setValue(IGV);
			this.getView().byId("idImporteTotal").setValue(TotalsinIGV);
			this.getView().byId("idImporteTotalIGV").setValue(TotalconIGV);
		},

		roundToTwo: function (num) {
			return +(Math.round(num + "e+2") + "e-2");
		},

		onOpenDialogAttachSolicitud: function (oEvent) {
			//var oDataContext = this.getView().getModel("data").getData().context;
			var dataPos = oEvent.getSource().getParent().getBindingContext("modelDetalle").getObject();
			var oThes = this;
			var NroPos = dataPos.Nrpos;
			var oModelDocSolicitud = this.getView().getModel("helpModel");
			var oDataDocSolicitud = oModelDocSolicitud.getData();
		   	var oVariablesGlobales = sap.ui.getCore().getModel("oVariablesGlobales");
		   	var oParametersModel = sap.ui.getCore().getModel("ParametersModel").getData();

			var Bukrs = dataPos.Bukrs,
				ParkedDocument = dataPos.Belnr,
				Gjahr = dataPos.Gjahr,
				sRoute = oParametersModel.AMBIENTE + "/";
			   	sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
				   	return oSociedad.valueLow === Bukrs
			   	}).valueHigh + "/" + oVariablesGlobales.carpetaEntregasRendir + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr + "/" + NroPos;

			///////////
			if (!oThes._oDialogFiles) {
				Fragment.load({
					id: "dialogFiles",
					name: "firstusertask.view.fragments.Attach",
					controller: oThes
				}).then(function (oPopover) {
					oThes._oDialogFiles = oPopover;
					oThes.getView().addDependent(oThes._oDialogFiles);
					EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
					   	aFiles.forEach((oFile) => {
						   	oFile.bLocal = false
					   	});
						oDataDocSolicitud.Files = aFiles;
						oDataDocSolicitud.Route = sRoute;
						// oDataDocSolicitud.url = oResult[0];
						// oDataDocSolicitud.dsroot = oResult[2];
						oModelDocSolicitud.refresh();
						sap.ui.core.BusyIndicator.hide();
						oThes._oDialogFiles.open();
					}.bind(oThes)).catch((oError) => {
						console.log(oError);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oThes.getI18nText("msgSharepointError"));
					});
					sap.ui.core.BusyIndicator.hide();
				}.bind(oThes));
			} else {
				EverisUtils.sharepoint._getFiles(sRoute).then(function (aFiles) {
					aFiles.forEach((oFile) => {
						oFile.bLocal = false
					});
					oDataDocSolicitud.Files = aFiles;
					oDataDocSolicitud.Route = sRoute;
					// oDataDocSolicitud.url = oResult[0];
					// oDataDocSolicitud.dsroot = oResult[2];
					oModelDocSolicitud.refresh();
					sap.ui.core.BusyIndicator.hide();
					oThes._oDialogFiles.open();
				}.bind(oThes)).catch((oError) => {
					console.log(oError);
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oThes.getI18nText("msgSharepointError"));
				});
				sap.ui.core.BusyIndicator.hide();
			}
		},
	});
});