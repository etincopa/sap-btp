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
		getToken: function (that) {
			//var oItem = oEvent.getSource().getBindingContext("FolderFile").getObject();
			//var userModel = new JSONModel();
			return new Promise(function (resolve, reject) {
				var formData = new FormData();
				formData.set("grant_type", "client_credentials");
				formData.set("client_id", "c449c367-8e47-4a9f-aec7-ea16e5d5058c@40980849-8484-4115-bd2e-3cf2e9428b26");
				formData.set("client_secret", "4EEWpYuOn9Ghn+LdBP692x3i86xcM9gxi+pYxB47CLs=");
				formData.set("resource", "00000003-0000-0ff1-ce00-000000000000/prueba92.sharepoint.com@40980849-8484-4115-bd2e-3cf2e9428b26");

				var form = new FormData();

				form.append("client_id", "c449c367-8e47-4a9f-aec7-ea16e5d5058c@40980849-8484-4115-bd2e-3cf2e9428b26");
				form.append("client_secret", "4EEWpYuOn9Ghn+LdBP692x3i86xcM9gxi+pYxB47CLs=");
				form.append("resource", "00000003-0000-0ff1-ce00-000000000000/prueba92.sharepoint.com@40980849-8484-4115-bd2e-3cf2e9428b26");
				form.append("grant_type", "client_credentials");

				var urlSerachParams = new URLSearchParams({
					client_id: "c449c367-8e47-4a9f-aec7-ea16e5d5058c@40980849-8484-4115-bd2e-3cf2e9428b26",
					resource: "00000003-0000-0ff1-ce00-000000000000/prueba92.sharepoint.com@40980849-8484-4115-bd2e-3cf2e9428b26",
					grant_type: 'client_credentials',
					client_secret: "4EEWpYuOn9Ghn+LdBP692x3i86xcM9gxi+pYxB47CLs="
				});

				var uri = "https://accounts.accesscontrol.windows.net/40980849-8484-4115-bd2e-3cf2e9428b26/tokens/OAuth/2";
				//uri = encodeURI("/UrlTokenSharePoint");

				/*fetch(uri, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: urlSerachParams
					})
					.then(function (res) {
						console.log(res)
							//return res.json();
					})
					.then(function (data) {
						resolve(data);
					})
					.catch(function (err) {
						reject(err);
					});*/

				$.ajax({
					type: 'POST',
					crossDomain: true,
					url: 'https://cors-anywhere.herokuapp.com/https://accounts.accesscontrol.windows.net/40980849-8484-4115-bd2e-3cf2e9428b26/tokens/OAuth/2',
					headers: {
						"content-type": "application/x-www-form-urlencoded"
					},
					data: {
						"grant_type": "client_credentials",
						"client_id": "c449c367-8e47-4a9f-aec7-ea16e5d5058c@40980849-8484-4115-bd2e-3cf2e9428b26",
						"client_secret": "4EEWpYuOn9Ghn+LdBP692x3i86xcM9gxi+pYxB47CLs=",
						"resource": "00000003-0000-0ff1-ce00-000000000000/prueba92.sharepoint.com@40980849-8484-4115-bd2e-3cf2e9428b26"
					},
					success: function (data) {
						//data.token_type returns "Bearer"
						//data.access_token returns < AccessToken >

						//caal the REST API with the at variable in header
						console.log("*data*")
						console.log(data)
						resolve(data);

					},
					error: function (error, errorThrown, status) {
						console.log("error")
						reject(err);
					}
				});

				/*
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": uri,
					"method": "POST",
					"headers": {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"cache-control": "no-cache",
						'Content-Type': 'multipart/form-data'
					},
					"processData": false,
					"contentType": false,
					"mimeType": "multipart/form-data",
					"data": urlSerachParams
				}
				BusyIndicator.show(0);
				$.ajax(settings).done(function (response) {
					console.log(response);
					resolve(response);
				}).fail(function (error) {
					console.log(error);
					BusyIndicator.hide();
					reject(data);
				});*/

				/*	jQuery.ajax({
						url: uri,
						type: "POST",
						data: formData,
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}).done(function (data, status, xhr) {
						console.log(data);
						console.log(status);
						resolve(data);
					}).fail(function (error) {
						console.log(error);
						BusyIndicator.hide();
						reject(daerrorta);
					});
					*/

			});
		},
		downloadFile: function (that, sFolder) {

			var userModel = new JSONModel();
			var sConcat = sRoot + "/" + sFolder;
			var uri = 'https://medifarmape.sharepoint.com/sites/Aplicaciones_SAP_REPO/_api/web/' + `GetFolderByServerRelativeUrl('${sConcat}')/Files`;
			function getFile(aFiles) {
				if (aFiles.length > 0) {
					var oFile = aFiles.pop();
					var uri = 'https://medifarmape.sharepoint.com/sites/Aplicaciones_SAP_REPO/_api/web/' + `GetFolderByServerRelativeUrl('${sConcat}')/Files('${oFile.Name}')/$value`;
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
                        resolve(blob);
                        return blob
					}).fail(function (error) {
                        reject(error)
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