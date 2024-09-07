 sap.ui.define([
 	"sap/ui/core/mvc/Controller",
 	"../services/DocumentService",
     "../services/EverisUtils",
 	"sap/ui/core/Fragment",
 	"sap/ui/model/json/JSONModel",
 	"sap/ui/core/util/File",
     "sap/ui/core/BusyIndicator",
 	"sap/ui/model/Filter",
     "../services/Service",
 ], function (Controller, DS,EverisUtils, Fragment, JSONModel, File, BusyIndicator, Filter,Service) {
 	"use strict";
     var oThat;
     var oModelGeneral ;

 	var oModelHelp;
 	var oDataHelp, oDataContext;
 	$.ambiente = "QAS";
 	return Controller.extend("cajachicataskui.controller.App", {

 		onInit: function () {
            var oThat = this;
			var oVariablesGlobales = {};
			oVariablesGlobales.carpetaFondoFijo = "FONDOFIJO";
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
 			this.onFilterTable(); //Cambio Jordan
 		},

 		onPressRow: function (oEvent) {
 			var oButton = oEvent.getSource();
 			var oPosition = oButton.getBindingContext("data").getObject();
 			oDataHelp.folderItem = oPosition.Nposit;
 			if (!this._oDialogFiles) {
 				Fragment.load({
 					id: "dialogFiles",
 					name: "cajachicataskui.view.fragments.Attach",
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
         onDowloadFile: function (oEvent) {
            try {
              /*  var oSource = oEvent.getSource();
                var sCustom = oSource.data("custom");
                var aDataFolder = oThat.getView().getModel("folder").getData();
                aDataFolder = aDataFolder.slice();
                var oFindFolder = aDataFolder.find((oItem) => {
                    return oItem.Id === sCustom;
                });*/
             /*   var oDataGeneral = oThat.getView().getModel("DataGeneral").getData();
                oDataGeneral = Object.assign({}, oDataGeneral);
                var sPRNotPurchaseOrderID = oDataGeneral.PRNotPurchaseOrderID;
                var sVoucherNumber = oDataGeneral.VoucherNumber;
                var sDocumentNumber = oDataGeneral.Ruc;
                var sDate = oThat.getDateRoute(oDataGeneral.WFCreatedByTimestamp);*/
               // if (sPRNotPurchaseOrderID !== "" && sDocumentNumber !== "") {
                if (true) {
                   // oThat.onGetCompanyNifSelected(oDataGeneral.Company);
                   // const RucSociedad = sap.ui.getCore().getModel("oModelIas");
                   // const route = sap.ui.getCore().getModel("route");
                   // route.solicitud = oEntrada.Belnr + oEntrada.Bukrs + oEntrada.Gjahr;
                   // route.carpetaSociedad = RucSociedad.Paval;
            
                   // const aFiles = this.getView().getModel("DocumentsSolicitud").getData();
                    //const sPath = `${this._parameters.AMBIENTE}/${route.carpetaSociedad}/${route.subcarpeta01}/${route.subcarpeta02}/${route.solicitud}`;
                   // var sFolder = sAmbient + "/" + sProject + "/" + sSocietyNif + "/" + sDate + "/" + sDocumentNumber + "/" + oThat.selectVoucherNumber + "/" + oFindFolder.Name;
                  // DEV/20100018625/FONDOFIJO/SOLICITUDES/600000008410002022
                   var oContext = this.getView().getModel("data").getData().context;
                   var sDocumento = oContext.Belnr + oContext.Bukrs + oContext.Gjahr
                   var sFolder = 'DEV/20100018625/FONDOFIJO/SOLICITUDES/'+ sDocumento;
                    SharePoint.downloadFile(oThat, sFolder);
                }
            } catch (oError) {
                this.onErrorMessage(oError, "errorSave");
            }
        },

 		onPressSolAttachment: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var oThes =this;
 			oDataContext = this.getView().getModel("data").getData().context;
 			// var sIdFolderSolicitud = oDataContext.idFolderSolicitudGenerada;
 			// if (!this._oDialogFiles) {
 			// 	Fragment.load({
 			// 		id: "dialogFiles",
 			// 		name: "cajachicataskui.view.fragments.Attach",
 			// 		controller: this
 			// 	}).then(function (oPopover) {
 			// 		this._oDialogFiles = oPopover;
 			// 		this.getView().addDependent(this._oDialogFiles);
 			// 		this.getFiles(sIdFolderSolicitud);
 			// 	}.bind(this));
 			// } else {
 			// 	this.getFiles(sIdFolderSolicitud);
 			// }
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
                sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
                    return oSociedad.valueLow === Bukrs
                }).valueHigh + "/" + oVariablesGlobales.carpetaFondoFijo + "/" + oVariablesGlobales.carpetaSolicitud + "/" + Belnr + Bukrs + Gjahr;
 			} else if (Type == "G") {
                sRoute = sRoute + oParametersModel.SOCIEDAD_CARPETA.find((oSociedad) => {
                    return oSociedad.valueLow === Bukrs
                }).valueHigh + "/" + oVariablesGlobales.carpetaFondoFijo + "/" + oVariablesGlobales.carpetaGasto + "/" + Belnr + Bukrs + Gjahr;
 			}

 			if (!this._oDialogFiles) {
 				Fragment.load({
 					id: "dialogFiles",
 					name: "cajachicataskui.view.fragments.Attach",
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
 				if (sFolderId !== "404") {
 					this.getFiles(sFolderId);
 				}
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

 		onDownloadFile: function (oEvent) {
 			sap.ui.core.BusyIndicator.show(0);
 			var oControl = oEvent.getSource();
 			var oFile = oControl.getBindingContext("helpModel").getProperty().properties;
 			var sFileUrl = oDataHelp.urlFile;
 			DS.getObjectParents(oFile).then(function (oResult) {
 				var folderRoot = oResult[0].object.properties['cmis:path'].value;
 				var relativePath = oResult[0].relativePathSegment;
 				sFileUrl = sFileUrl + "/sap/fiori/bpmmyinbox/html5apps/detalleentregarendirworkflow/cmis/" + oDataHelp.cmis;
 				sFileUrl = sFileUrl + "/root" + folderRoot + "/" + relativePath;
 				fetch(sFileUrl).then(function (response) {
 					return response.blob();
 				}).then(function (blob) {
 					//@pguevarl - comenté esto para corregir lo de descargar archivos adjuntos
 					//var name = oFile.name.value.split(".");
 					//File.save(blob, name[0], name[1]);
 					//}@pguevarl
 					//{@pguevarl - agregué el código para descargar archivos adjuntos correctamente
 					var nameFile = oFile.name.value;
 					var ext = /^.+\.([^.]+)$/.exec(nameFile);
 					ext = ext == null ? "" : ext[1];
 					nameFile = nameFile.replace("." + ext, "");
 					File.save(blob, nameFile, ext);
 					//}@pguevarl
 					sap.ui.core.BusyIndicator.hide();
 				});
 			}.bind(this));
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

 		/*	linkfunction: function(){
			var ocontext = this.getView().getModel("data").getData().context; 
			var obase64 = ocontext.client.FILE;
			var sfilename = "File" ;
			var stype = "application/pdf";

            var element = document.createElement('a');
            element.setAttribute('href', 'data:' + stype +';base64,' + obase64);
            element.setAttribute('download', sfilename);

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
		}*/

 		/*======================================================================
 									CAMBIOS JORDAN
 		======================================================================*/

 		formatSwitch: function (sState) {
 			if (sState === "X") {
 				return true;
 			} else {
 				return false;
 			}
 		},

 		onFilterTable: function () {
 			var oModelContext = this.getOwnerComponent().getModel("data");
 			sap.ui.core.BusyIndicator.show();
 			if (oModelContext !== undefined) {

 				if (oModelContext.getData().context.Type == "G") {
 					var oModelCajaChica = this.getOwnerComponent().getModel("oDataModelCajaChica");

 					var aFilter = [];
 					var oDataContext = oModelContext.getData();

 					aFilter.push(new Filter('Bukrs', 'EQ', oDataContext.context.Bukrs));
 					aFilter.push(new Filter('Belnr', 'EQ', oDataContext.context.Belnr));
 					aFilter.push(new Filter('Gjahr', 'EQ', oDataContext.context.Gjahr));

 					oModelCajaChica.read("/DetGastoSet", {
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

 		onOpenViewText: function (oEvent) {

 			var oItemSelected = oEvent.getSource().getParent().getBindingContext("modelDetalle").getObject();

 			if (!this.oViewDialog) {
 				this.oViewDialog = new sap.m.Dialog({
 					type: sap.m.DialogType.Message,
 					title: "Confirmación",
 					content: [
 						new sap.m.Label({
 							text: "Motivo de rechazo"
 						}),
 						new sap.m.TextArea({
 							width: "100%",
 							value: oItemSelected.Zmotivor,
 							placeholder: "Motivo de Rechazo (obligatorio)",
 							editable: false
 						})
 					],
 					endButton: new sap.m.Button({
 						text: "Close",
 						press: function () {
 							this.oViewDialog.close();
 						}.bind(this)
 					})
 				});
 			}

 			this.oViewDialog.open();

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
 			sOper = sOper.split(" - ", 2)[1];
 			return sOper;
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
                }).valueHigh + "/" + oVariablesGlobales.carpetaFondoFijo + "/" + oVariablesGlobales.carpetaGasto + "/" + ParkedDocument + Bukrs + Gjahr + "/" + NroPos;

 			///////////
 			if (!oThes._oDialogFiles) {
 				Fragment.load({
 					id: "dialogFiles",
 					name: "cajachicataskui.view.fragments.Attach",
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
 		}

 	});
 });