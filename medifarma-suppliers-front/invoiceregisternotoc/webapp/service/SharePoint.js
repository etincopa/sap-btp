/* eslint-disable consistent-this */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageToast"
], function (JSONModel, BusyIndicator, MessageToast) {
	"use strict";
	var sRoot = 'Documentos compartidos';
	return {
		//Crea identificadores unicos
		getUUIDV4: function (that) {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
		setValueRoot: function (sValue) {
			sRoot = sValue;
		},
		downloadFile: function (that, sFolder) {
			var userModel = new JSONModel();
			var sConcat = sRoot + "/" + sFolder;
			var uri = that.uri + `GetFolderByServerRelativeUrl('${sConcat}')/Files`;
			function getFile(aFiles) {
				if (aFiles.length > 0) {
					var oFile = aFiles.pop();
					var uri = that.uri + `GetFolderByServerRelativeUrl('${sConcat}')/Files('${oFile.Name}')/$value`;
					BusyIndicator.show(0);
					jQuery.ajax({
						url: uri,
						type: "GET",
						xhrFields: {
							responseType: 'blob'
						},
						headers: {
							'Authorization': 'Bearer ' + that.bearer
						}
					}).done(function (blob, status, xhr) {
						var url = window.URL.createObjectURL(blob);
						var a = document.createElement('a');
						a.style.display = 'none';
						a.href = url;
						a.download = oFile.Name;
						document.body.appendChild(a);
						a.click();
						window.URL.revokeObjectURL(url);
						getFile(aFiles);
					}).fail(function (error) {
						console.log(error);
						BusyIndicator.hide();
					});
				} else {
					BusyIndicator.hide();
				}

			}
			//Busca los archivos
			jQuery.ajax({
				url: uri,
				type: "GET",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json;odata=verbose',
					'Authorization': 'Bearer ' + that.bearer
				}
			}).done(function (response, status, xhr) {
				if (response.d.results.length > 0) {
					getFile(response.d.results);
				} else {
					MessageToast.show("No hay archivos");
				}
				console.log(response);
			}).fail(function (error) {

			});

		},

        downloadFileArchiveLink:function(that, sFolder){
            var userModel = new JSONModel();
			var sConcat = sRoot + "/" + sFolder;
			var uri = that.uri + `GetFolderByServerRelativeUrl('${sConcat}')/Files`;
			var aBlobFiles = [];
            return new Promise(function (resolve, reject) {
				function getFile(aFiles) {
					if (aFiles.length > 0) {
						var oFile = aFiles.pop();
						var uri = that.uri + `GetFolderByServerRelativeUrl('${sConcat}')/Files('${oFile.Name}')/$value`;
						BusyIndicator.show(0);
						jQuery.ajax({
							url: uri,
							type: "GET",
							xhrFields: {
								responseType: 'blob'
							},
							headers: {
								'Authorization': 'Bearer ' + that.bearer
							}
						}).done(function (blob, status, xhr) {
							aBlobFiles.push({ blob: blob, fileName: oFile.Name });
							getFile(aFiles);
						}).fail(function (error) {
							console.log(error);
							BusyIndicator.hide();
							reject(error);
						});
					} else {
						BusyIndicator.hide();
						resolve(aBlobFiles);
					}
				}
				//Busca los archivos
				jQuery.ajax({
					url: uri,
					type: "GET",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json;odata=verbose',
						'Authorization': 'Bearer ' + that.bearer
					}
				}).done(function (response, status, xhr) {
					if (response.d.results.length > 0) {
						getFile(response.d.results);
					} else {
						MessageToast.show("No hay archivos");
					}
					console.log(response);
				}).fail(function (error) {
					console.log(error);
					BusyIndicator.hide();
					reject(error);
				});
        	});
        },

		onRefresh: function (that) {
			var userModel = new JSONModel({});
			var uri = that.uri + `GetFolderByServerRelativeUrl('${sRoot}')?$expand=Folders,Files`;
			var oModel = new JSONModel();
			userModel.loadData(uri, null, true, 'GET', null, null, {
				'Content-Type': 'application/scim+json',
				'Accept': 'application/json;odata=verbose',
				'Authorization': 'Bearer ' + that.bearer
			}).then(() => {
				var oData = userModel.getData().d;
				var aFiles = [];
				aFiles = aFiles.concat(oData.Files.results);
				for (var i = 0; i < oData.Folders.results.length; i++) {
					oData.Folders.results[i].Icon = "sap-icon://folder-blank";
					oData.Folders.results[i].Type = "folder";
				}
				aFiles = aFiles.concat(oData.Folders.results);
				var oJson = {
					"Items": aFiles,
					"History": []
				};
				oModel.setData(oJson);

				that.getView().setModel(oModel, "FolderFile")
				console.log(this);
				console.log(userModel);
				BusyIndicator.hide();
			}).catch(err => {
				console.log(err);
				BusyIndicator.hide();
			});
		},

		setFolder: function (that, sRoute) {
			new Promise(function (resolve, reject) {
				var userModel = new JSONModel({});
				var uri = that.uri + "/folders";
				var oData = {
					"ServerRelativeUrl": sRoot + sRoute
				};
				var sData = JSON.stringify(oData);
				BusyIndicator.show(0);
				jQuery.ajax({
					url: uri,
					data: sData,
					type: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json;odata=verbose',
						'Authorization': 'Bearer ' + that.bearer
					}
				}).done(function (response, status, xhr) {
					resolve(response);
					console.log(file);
					console.log(status);
				}).fail(function (error) {
					BusyIndicator.hide();
					console.log(error);
				});
			});
		},
		createFolderDeep: function (that, sRoute) {
			return new Promise(function (resolve, reject) {
				function createFolders(aRoute) {
					if (aRoute.length > 0) {
						var iCount = aRoute.length;
						if (iCount - 2 >= 0) {
							aRoute[iCount - 2] = aRoute[iCount - 1] + "/" + aRoute[iCount - 2];
						}
						var sRoute2 = aRoute.pop();
						var uri = that.uri + "/folders";
						var oData = {
							"ServerRelativeUrl": sRoot + "/" + sRoute2
						};
						var sData = JSON.stringify(oData);
						BusyIndicator.show(0);
						jQuery.ajax({
							url: uri,
							data: sData,
							type: "POST",
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json;odata=verbose',
								'Authorization': 'Bearer ' + that.bearer
							}
						}).done(function (response, status, xhr) {
							createFolders(aRoute);
							console.log(response);
							console.log(status);
						}).fail(function (error) {
							BusyIndicator.hide();
							reject(error);
						});
					} else {
						BusyIndicator.hide();
						resolve(true);
					}

				}
				var aRoute = sRoute.split("/");
				aRoute = aRoute.reverse();
				createFolders(aRoute);
			});

		},
		getFiles: function (that, aFolders, sRootComplete) {

            try {
                that.onState(false, "btnDown");
            } catch (oError) {

            }
			function getFile(aFolders) {
				if (aFolders.length > 0) {
					var oFolder = aFolders.pop();
					var uri = that.uri +
						`GetFolderByServerRelativeUrl('${sRoot + "/" +sRootComplete+ "/" + oFolder.Name}')/Files`;
					//Busca los archivos
					jQuery.ajax({
						url: uri,
						type: "GET",
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json;odata=verbose',
							'Authorization': 'Bearer ' + that.bearer
						}
					}).done(function (response, status, xhr) {
						if (response.d.results.length > 0) {
							that.getView().getModel("UploadFile").setProperty("/" + oFolder.Id, response.d.results[0].Name);
                            try {
                                that.onState(true, "btnDown");
                            } catch (oError) {

                            }
                            
							// if (oFolder.Id === "XML") {
							// 	var oDataGeneral = that.getView().getModel("DataGeneral");
							// 	oDataGeneral.getData().CheckElectronicSupplier = true;
							// 	oDataGeneral.refresh(true);

							// 	that.setDocumentClassData(!oDataGeneral.getData().CheckElectronicSupplier);
                            // }
                            
						} else {
							that.getView().getModel("UploadFile").setProperty("/" + oFolder.Id, "");
						}

						getFile(aFolders);
						console.log(response);
					}).fail(function (error) {
						getFile(aFolders);
					});
				} else {
					let bXml = false;
					const oFiles = that.getView().getModel("UploadFile").getData();
					
					if (oFiles.XML) {
						bXml = true;
					}

					var oDataGeneral = that.getView().getModel("DataGeneral");
					oDataGeneral.getData().CheckElectronicSupplier = bXml;
					oDataGeneral.refresh(true);

					that.setDocumentClassData(!bXml);

					BusyIndicator.hide();
				}

			}

			getFile(aFolders);
		},
		// AR3 - Upload collection methods
		getFileListForUploadCollection: function (that, sFolder, sPath) {
			var uri = that.uri + `GetFolderByServerRelativeUrl('${sRoot}/${sPath}/${sFolder}')/Files`;
			//Busca los archivos
			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					url: uri,
					type: "GET",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json;odata=verbose',
						'Authorization': 'Bearer ' + that.bearer
					}
				}).done(function (response, status, xhr) {
					resolve(response.d.results);
				}).fail(function (error) {
					reject([]);
				});
			});
		},
		// AR3 - Upload collection methods
		deleteAllFile: function (that, sFolderName) {
			return new Promise(function (resolve, reject) {
				var aFolders = that.getView().getModel("folder").getData();
				aFolders = aFolders.slice();

				function getFile(aFolders) {
					/*if (aFolders.length > 0) {
						var oFolder = aFolders.pop();*/
					var uri = that.uri + `GetFolderByServerRelativeUrl('${sRoot + "/" + that.sFullPath + "/" + sFolderName}')/Files`;
					//Busca los archivos
					jQuery.ajax({
						url: uri,
						type: "GET",
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json;odata=verbose',
							'Authorization': 'Bearer ' + that.bearer
						}
					}).done(function (response, status, xhr) {
						if (response.d.results.length > 0) {
							var aFiles = response.d.results;

							function deleteFile(aFiles) {
								if (aFiles.length > 0) {
									var oFile = aFiles.pop();
									var uri = that.uri +
										`GetFolderByServerRelativeUrl('${sRoot + "/" + that.sFullPath + "/" + sFolderName}')/Files('${oFile.Name}')`;
									BusyIndicator.show(0);
									jQuery.ajax({
										url: uri,
										type: "POST",
										headers: {
											'Authorization': 'Bearer ' + that.bearer,
											'X-HTTP-Method': 'DELETE'
										}
									}).done(function (file, status, xhr) {
										deleteFile(aFiles);
										console.log(file);
										console.log(status);
									}).fail(function (error) {
										//deleteFile(aFiles);
										reject(error);
										console.log(error);
									});
								} else {
									resolve(true);
								}
							}
							deleteFile(aFiles);
						} else {
							resolve(true)
						}
						console.log(response);
					}).fail(function (error) {
						reject(error);
					});
					/*} else {
						resolve(true);
					}*/

				}
				getFile(aFolders);
			});
		},
		saveFiles: function (that, aFiles) {
			var _this = this;
			return new Promise(function (resolve, reject) {
				//var aFiles = that.getView().getModel("file").getData();
				aFiles = aFiles.slice();

				function saveFiles(aFiles) {
					if (aFiles.length > 0) {
						var oFile = aFiles.pop();
						var uri = that.uri + "/folders";
						var oData = {
							"ServerRelativeUrl": sRoot + "/" + that.sFullPath + "/" + oFile.FolderName
						};
						var sData = JSON.stringify(oData);
						//Crear la carpeta para cada archivo
						jQuery.ajax({
							url: uri,
							data: sData,
							type: "POST",
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json;odata=verbose',
								'Authorization': 'Bearer ' + that.bearer
							}
						}).done(function (response, status, xhr) {
							//Elimina todos los archivos
							//	_this.deleteAllFile(that, oFile.FolderName).then(response => {
							// Guarda los archivos en su respectiva carpeta
							var sFullPath = sRoot + "/" + that.sFullPath + "/" + oFile.FolderName;
							var uri = that.uri + `GetFolderByServerRelativeUrl('${sFullPath}')/Files/add(overwrite=true, url='${oFile.FileName}')`;
							BusyIndicator.show(0);
							jQuery.ajax({
								url: uri,
								type: "POST",
								data: oFile.ArrayBufferResult,
								processData: false,
								headers: {
									'Content-Type': 'application/scim+json',
									'Accept': 'application/json;odata=verbose',
									'Authorization': 'Bearer ' + that.bearer,
									'Content-Length': oFile.ArrayBufferResult.byteLength
								}
							}).done(function (file, status, xhr) {
								saveFiles(aFiles);
								console.log(file);
							}).fail(function (error) {
								BusyIndicator.hide();
								reject(error);
							});
							//	}).catch(err => {
							//		reject(err);
							//	});

							console.log(response);
						}).fail(function (error) {
							BusyIndicator.hide();
							reject(error);
						});
					} else {
						BusyIndicator.hide();
						resolve(true);
					}

				}

				//Crea el folder del uuid
				var uri = that.uri + "/folders";
				var oData = {
					"ServerRelativeUrl": sRoot + "/" + that.sFullPath
				};
				var sData = JSON.stringify(oData);

				jQuery.ajax({
					url: uri,
					data: sData,
					type: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json;odata=verbose',
						'Authorization': 'Bearer ' + that.bearer
					}
				}).done(function (response, status, xhr) {
					saveFiles(aFiles);
					console.log(response);
				}).fail(function (error) {
					BusyIndicator.hide();
					reject(error);
				});
			});

		}
	};
});