sap.ui.define(
  ["sap/base/Log", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
  function (Log, Filter, FilterOperator) {
    "use strict";
    return {
      test: {
        _testMode: false,
        /**
         * Turns on test mode when executed from localhost or (BAS) workspaces.
         * Returns whether test mode is detected or not.
         * @returns {boolean} Is test mode?
         */
        isTestMode: function () {
          if (!this._testMode) {
            this._testMode =
              window.location.host.includes("localhost") || window.location.host.includes("workspaces-ws");
          }

          return this._testMode;
        },
      },
      /** How to use backend module:
       * ```
         EverisUtils.backend.initialize(this.getOwnerComponent().getModel("UtilsModel"));
         ```
       */
      backend: {
        /**
         * Pass a model defined in manifest.json. For example:
         * ```
            "UTILS_SRV": {
              "uri": "saperp/eper/UTILS_SRV/",
              "type": "OData",
              "settings": {
                "odataVersion": "2.0"
              }
            },
         * ```
         * @param {Object} eperUtilsModel OData model /EPER/UTILS_SRV
         */
        initialize: function (eperUtilsModel) {
          this.eperUtilsModel = eperUtilsModel;
        },
        /**
         * Returns information from /EPER/TCONSTANTS table.
         * @param {String} application Application
         * @param {String} group Group
         * @returns {Array} Array of parameters
         */
        getParameters: function (application, group) {
          return new Promise((resolve, reject) => {
            const aFilters = [];
            const groupFilter = new Filter("Group1", FilterOperator.EQ, group);

            aFilters.push(new Filter("Application", FilterOperator.EQ, application));
            if (group) {
              aFilters.push(groupFilter);
            }

            this.eperUtilsModel.read("/ParameterSet", {
              filters: aFilters,
              success: (result, status, error) => {
                Log.info(
                  "[UTILS] Backend - getParameters - results length",
                  result.results ? result.results.length : 0
                );
                resolve(result.results || []);
              },
              error: (result, status, error) => {
                Log.error(error);
                reject(error);
              },
            });
          });
        },
        /**
         * Returns token from ABAP OData /EPER/UTILS_SRV
         * @param {string} application Application ID
         * @returns {string} Token
         */
        getSharepointToken: function (application) {
          return new Promise((resolve, reject) => {
            this.eperUtilsModel.read(`/SharepointTokenSet('${application}')`, {
              success: (result) => {
                if (result.Token) {
                  resolve(result.Token);
                } else {
                  reject();
                }
              },
              error: (error) => {
                reject(error);
              },
            });
          });
        },
        /**
         * Converts parameters from OData entity /EPER/UTILS_SRV/Parameters
         * to JSON Object according to `aParamsToParse` configuration.
         * Example of `aParamsToParse`:
         * ```
         * {
         *   "applications": ["CAJA_CHICA", "SHAREPOINT"],
         *   "CAJA_CHICA": [
         *     { "key": "AMBIENTE", "mandatory": false },
         *   ],
         *   "SHAREPOINT": [
         *     { "key": "ROOT_DIRECTORY", "mandatory": true },
         *     { "key": "URL", "mandatory": true }
         *   ]
         * }
         * ```
         * @param {Array} aParameters Parameters from OData result
         * @param {Array} aParamsToParse Parameters configuration
         * @returns {Promise<object>} Promise to parameters object
         */
        parseParameters: function (aParameters, aParamsToParse) {
          return new Promise((resolve, reject) => {
            const paramValues = {};

            aParamsToParse.applications.forEach((app) => {
              paramValues[app] = {};

              aParamsToParse[app].forEach((param) => {
                const foundParams = aParameters.filter((x) => x.Group1 === app && x.Field === param.key);

                if (param.array) {
                  if (param.highValue) {
                    paramValues[app][param.key] = foundParams.map((p) => {
                      return { valueLow: p.ValueLow, valueHigh: p.ValueHigh };
                    });
                  } else {
                    paramValues[app][param.key] = foundParams.map((p) => p.ValueLow);
                  }
                } else if (foundParams.length === 0 && param.mandatory) {
                  Log.error("[UTILS] Home.controller - parseParameters - Mandatory parameter not set", param.key);
                  reject("Parámetro obligatorio no encontrado:" + param.key);
                } else {
                  paramValues[app][param.key] = foundParams[0].ValueLow;
                }
              });
            });

            resolve(paramValues);
          });
        },
      },
      /** How to use sharepoint module:
       * ```
         EverisUtils.sharepoint.setValueRoot(oValues.ROOT_DIRECTORY);
         EverisUtils.sharepoint.setUrl(oValues.URL);
         EverisUtils.sharepoint.setGetTokenFn(() => {
           return EverisUtils.backend.getSharepointToken("RENDICION_GASTOS");
         });
         ```
       */
      sharepoint: {
        parameters: {
          _rootFolder: "Documentos compartidos",
        },
        /**
         * Crea identificadores únicos
         * @returns {string} UUIDv4
         */
        getUUIDV4: function () {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
          );
        },
        /**
         * Sets root path. This is tipically obtained from constants table:
         * ```
         * const sValue = oConstants.results.find(oItem => {
             return oItem.Group1 === "SHAREPOINT" && oItem.Field === "ROOT_DIRECTORY";
           });
         * ```
         * @param {string} sValue Root path
         */
        setValueRoot: function (sValue) {
          if (sValue) {
            this._rootFolder = sValue;
          }
        },
        /**
         * Sets Sharepoint URL. This is tipically obtained from constants table:
         * ```
         * const sValue = oConstants.results.find(oItem => {
             return oItem.Group1 === "SHAREPOINT" && oItem.Field === "URL";
           });
         * ```
         * @param {string} sUrl Sharepoint URL
         */
        setUrl: function (sUrl) {
          this._url = sUrl;
        },
        /**
         * Sets async function to get token. This will be called when
         * there is no token stored in `this._token`.
         * @param {function} getTokenFn Async function to get token
         */
        setGetTokenFn: function (getTokenFn) {
          this._getTokenFn = getTokenFn;
        },
        /**
         * Gets asynchronously file (blob) from specific folder.
         * @param {string} sFolder Folder path
         * @param {string} sFileName File name
         * @returns {blob} File (blob)
         */
        getBlob: function (sFolder, sFileName) {
          const sPath = this._normalizePath(this._rootFolder + "/" + sFolder);
          const sUrl = this._normalizePath(
            this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files('${sFileName}')/$value`
          );
          return new Promise((resolve, reject) => {
            this._getToken().then(() => {
              $.ajax({
                url: sUrl,
                type: "GET",
                xhrFields: {
                  responseType: "blob",
                },
                headers: {
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((blob, status, xhr) => {
                  resolve(blob);
                })
                .fail((error) => {
                  Log.error("[UTILS] Sharepoint - getBlob", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Gets asynchronously list of files (blob) from specific folder.
         * @param {string} sFolder Folder path
         * @param {string} sFileName File name
         * @returns {blob[]} Array of files (blob)
         */
        getBlobs: function (sFolder) {
          const aResponse = [];
          const sPath = this._normalizePath(this._rootFolder + "/" + sFolder),
            sUrl = this._normalizePath(this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files`);

          const downloadFile = (aFiles) => {
            if (aFiles.length > 0) {
              const oFile = aFiles.pop();
              const sUrl = this._normalizePath(
                this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files('${oFile.Name}')/$value`
              );
              this._getToken().then(() => {
                $.ajax({
                  url: sUrl,
                  type: "GET",
                  xhrFields: {
                    responseType: "blob",
                  },
                  headers: {
                    Authorization: "Bearer " + this._token,
                  },
                })
                  .done((blob, status, xhr) => {
                    aResponse.push(blob);
                    downloadFile(aFiles);
                  })
                  .fail((error) => {
                    Log.error("[UTILS] Sharepoint - getBlobs", error.responseText);
                  });
              });
            }
          };

          return new Promise((resolve, reject) => {
            this._getToken().then(() => {
              $.ajax({
                url: sUrl,
                type: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((response, status, xhr) => {
                  const iFiles = response.d.results.length;

                  Log.info("[UTILS] Sharepoint - downloadFiles", "Downloading will be done asynchronously");
                  Log.info("[UTILS] Sharepoint - downloadFiles - # archivos", iFiles.toString());

                  if (iFiles > 0) {
                    downloadFile(response.d.results);
                  }
                  resolve(aResponse);
                })
                .fail((error) => {
                  Log.error("[UTILS] Sharepoint - downloadFiles", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Downloads asynchronously specific file from specific folder.
         * @param {string} sFolder Folder path
         * @param {string} sFileName File name
         */
        downloadFile: function (sFolder, sFileName) {
          const sPath = this._normalizePath(this._rootFolder + "/" + sFolder);
          const sUrl = this._normalizePath(
            this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files('${sFileName}')/$value`
          );
          return new Promise((resolve, reject) => {
            this._getToken().then(() => {
              $.ajax({
                url: sUrl,
                type: "GET",
                xhrFields: {
                  responseType: "blob",
                },
                headers: {
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((blob, status, xhr) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.style.display = "none";
                  a.href = url;
                  a.download = sFileName;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);

                  resolve();
                })
                .fail((error) => {
                  Log.error("[UTILS] Sharepoint - downloadFile", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Downloads asynchronously files from one folder.
         * @param {string} sFolder Folder path
         * @returns {integer} Number of files
         */
        downloadFiles: function (sFolder) {
          const sPath = this._normalizePath(this._rootFolder + "/" + sFolder),
            sUrl = this._normalizePath(this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files`);

          const downloadFile = (aFiles) => {
            if (aFiles.length > 0) {
              const oFile = aFiles.pop();
              const sUrl = this._normalizePath(
                this._url + `/GetFolderByServerRelativeUrl('${sPath}')/Files('${oFile.Name}')/$value`
              );
              this._getToken().then(() => {
                $.ajax({
                  url: sUrl,
                  type: "GET",
                  xhrFields: {
                    responseType: "blob",
                  },
                  headers: {
                    Authorization: "Bearer " + this._token,
                  },
                })
                  .done((blob, status, xhr) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    a.download = oFile.Name;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);

                    downloadFile(aFiles);
                  })
                  .fail((error) => {
                    Log.error("[UTILS] Sharepoint - downloadFiles", error.responseText);
                  });
              });
            }
          };

          return new Promise((resolve, reject) => {
            this._getToken().then(() => {
              $.ajax({
                url: sUrl,
                type: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((response, status, xhr) => {
                  const iFiles = response.d.results.length;

                  Log.info("[UTILS] Sharepoint - downloadFiles", "Downloading will be done asynchronously");
                  Log.info("[UTILS] Sharepoint - downloadFiles - # archivos", iFiles.toString());

                  if (iFiles > 0) {
                    downloadFile(response.d.results);
                  }
                  resolve(iFiles);
                })
                .fail((error) => {
                  Log.error("[UTILS] Sharepoint - downloadFiles", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Returns sharepoint auth token from local or retrieves it using the
         * function set with `setGetTokenFn()`.
         * @returns {string} Sharepoint auth token
         */
        _getToken: function () {
          return new Promise((resolve, reject) => {
            if (this._token) {
              resolve(this._token);
            } else {
              this._getTokenFn()
                .then((sToken) => {
                  this._token = sToken;
                  resolve(sToken);
                })
                .catch(() => {
                  reject();
                });
            }
          });
        },
        /**
         * Creates a new folder.
         * @param {string} sPath Folder base path
         * @param {string} sFolderName Folder name
         * @returns {Promise<boolean>} A promise to a boolean indicating
         * result of operation
         */
        createFolder: function (sPath, sFolderName) {
          return new Promise((resolve, reject) => {
            const url = this._normalizePath(this._url + "/folders");
            const sRelativeUrl = this._normalizePath(this._rootFolder + "/" + sPath + "/" + sFolderName);
            const oData = {
              ServerRelativeUrl: sRelativeUrl,
            };

            this._getToken().then(() => {
              $.ajax({
                url: url,
                data: JSON.stringify(oData),
                type: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                },
              })
                .done(function (response, status, xhr) {
                  if (status === "success") {
                    Log.info("[UTILS] Sharepoint - createFolder - created successfully", sRelativeUrl);
                    resolve(true);
                  } else {
                    reject();
                  }
                })
                .fail(function (error) {
                  Log.error("[UTILS] Sharepoint - createFolder", error.responseText);
                  reject();
                });
            });
          });
        },
        /**
         * Creates folders recursively.
         * @param {Array} aRoutes Array of paths (routes)
         * @returns {Promise<boolean>} Promise to boolean result
         */
        _createFoldersRecursive: function (aRoutes) {
          return new Promise((resolve, reject) => {
            if (aRoutes.length > 0) {
              // Form complete path
              const iCount = aRoutes.length;
              if (iCount - 2 >= 0) {
                aRoutes[iCount - 2] = aRoutes[iCount - 1] + "/" + aRoutes[iCount - 2];
              }
              // Folder to create
              const sFolderToCreate = aRoutes.pop();

              this.createFolder(sFolderToCreate, "")
                .then((result) => {
                  resolve(this._createFoldersRecursive(aRoutes));
                })
                .catch((error) => {
                  Log.error("[UTILS] Sharepoint - createFolderDeep", error.responseText);
                  reject(error);
                });
            } else {
              // Recursion exit condition
              resolve(true);
            }
          });
        },
        /**
         * Creates folders in sequence. Example:
         * @example
         * createFolderDeep("Folder 1/Folder 2/Folder 3").then(...)
         * @param {string} sCompletePath Complete folder path
         * @returns {Promise<boolean>} Promise to boolean result
         */
        createFolderDeep: function (sCompletePath) {
          // return new Promise((resolve) => {
          let aRoutes = sCompletePath.split("/");
          aRoutes = aRoutes.reverse();
          return this._createFoldersRecursive(aRoutes);
          // });
        },
        /**
         * Returns files from folder.
         * @param {string} sFolderPath Folder path
         * @returns {Array<object>} Array of file objects
         */
        _getFiles: function (sFolderPath) {
          return new Promise((resolve, reject) => {
            const sRootPath = this._rootFolder + "/" + sFolderPath;
            const url = this._normalizePath(this._url + `/GetFolderByServerRelativeUrl('${sRootPath}')/Files`);

            this._getToken().then(() => {
              $.ajax({
                url: url,
                type: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((response, status, xhr) => {
                  const iFiles = response.d.results.length;
                  Log.info(`[UTILS] Sharepoint - _getFiles - # files in "${sRootPath}"`, iFiles);

                  if (iFiles > 0) {
                    resolve(response.d.results);
                  } else {
                    resolve([]);
                  }
                })
                .fail(function (error) {
                  Log.error("[UTILS] Sharepoint - _getFiles", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Returns files from folder using a filter on file Name.
         * @param {string} sFolderPath Folder path
         * @returns {Array<object>} Array of file objects
         */
        _getFilesWithFilter: function (sFolderPath, sFilter) {
          return new Promise((resolve, reject) => {
            const sRootPath = this._rootFolder + "/" + sFolderPath;
            const url = this._normalizePath(this._url + `/GetFolderByServerRelativeUrl('${sRootPath}')/Files?$filter=(startswith(Name, '${sFilter}_'))`);

            this._getToken().then(() => {
              $.ajax({
                url: url,
                type: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                },
              })
                .done((response, status, xhr) => {
                  const iFiles = response.d.results.length;
                  Log.info(`[UTILS] Sharepoint - _getFiles - # files in "${sRootPath}"`, iFiles);

                  if (iFiles > 0) {
                    resolve(response.d.results);
                  } else {
                    resolve([]);
                  }
                })
                .fail(function (error) {
                  Log.error("[UTILS] Sharepoint - _getFiles", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Deletes all files from a folder.
         * @param {string} sFolderPath Folder path
         * @returns {Promise<boolean>} Promise to boolean result
         */
        deleteFilesFromFolder: function (sFolderPath) {
          return new Promise((resolve, reject) => {
            this._getFiles(sFolderPath)
              .then((aFiles) => {
                resolve(this._deleteFilesRecursive(aFiles, sFolderPath));
              })
              .catch((error) => {
                Log.error("[UTILS] Sharepoint - deleteFilesFromFolder", error.responseText);
                reject(error);
              });
          });
        },
        /**
         * Deletes files from a folder recursively.
         * @param {Array} aFiles Array of file names
         * @param {string} sFolderPath Folder path
         * @returns {Promise<boolean>} Promise to boolean result
         */
        _deleteFilesRecursive: function (aFiles, sFolderPath) {
          return new Promise((resolve, reject) => {
            if (aFiles.length > 0) {
              const oFile = aFiles.pop();
              const sRootPath = this._rootFolder + "/" + sFolderPath;
              const url = this._normalizePath(
                this._url + `/GetFolderByServerRelativeUrl('${sRootPath}')/Files('${oFile.Name}')`
              );

              this._getToken().then(() => {
                $.ajax({
                  url: url,
                  type: "POST",
                  headers: {
                    Authorization: "Bearer " + this._token,
                    "X-HTTP-Method": "DELETE",
                  },
                })
                  .done((file, status, xhr) => {
                    Log.info(
                      "[UTILS] Sharepoint - _deleteFilesRecursive - deleted successfully",
                      `"${oFile.Name}" from "${sRootPath}"`
                    );
                    resolve(this._deleteFilesRecursive(aFiles, sFolderPath));
                  })
                  .fail((error) => {
                    Log.error("[UTILS] Sharepoint - _deleteFilesRecursive", error.responseText);
                    reject(error);
                  });
              });
            } else {
              // Recursion exit condition
              resolve(true);
            }
          });
        },
        /**
         * Saves file in a folder.
         * @param {string} sFolderPath Folder path
         * @param {object} oFile File object
         * @returns {Promise<boolean>} Promise to boolean result
         */
        _saveFile: function (sFolderPath, oFile) {
          return new Promise((resolve, reject) => {
            const sFullPath = this._normalizePath(this._rootFolder + "/" + sFolderPath + "/" + oFile.folderName);
            const url = this._normalizePath(
              this._url +
                `/GetFolderByServerRelativeUrl('${sFullPath}')/Files/add(overwrite=true, url='${oFile.fileName}')`
            );

            this._getToken().then(() => {
              $.ajax({
                url: url,
                type: "POST",
                data: oFile.data,
                processData: false,
                headers: {
                  "Content-Type": "application/scim+json",
                  Accept: "application/json;odata=verbose",
                  Authorization: "Bearer " + this._token,
                  "Content-Length": oFile.size,
                },
              })
                .done((file, status, xhr) => {
                  Log.info("[UTILS] Sharepoint - _saveFile - created successfully", oFile.fileName);
                  resolve(true);
                })
                .fail((error) => {
                  Log.error("[UTILS] Sharepoint - _saveFile", error.responseText);
                  reject(error);
                });
            });
          });
        },
        /**
         * Creates folder, (optionally) deletes files and save files recursively.
         * Root path folder is not deleted.
         * @param {string} sPath Root path
         * @param {Array} aFiles Array of file objects
         * @param {boolean} bDelete Delete all files
         * @returns {Promise<boolean>} Promise to boolean result
         */
        _saveFilesRecursive: function (sPath, aFiles) {
          return new Promise((resolve, reject) => {
            if (aFiles.length > 0) {
              const oFile = aFiles.pop();
              // Saves file
              this._saveFile(sPath, oFile)
                .then(() => {
                  // Recursive call with the remaining files
                  resolve(this._saveFilesRecursive(sPath, aFiles));
                })
                .catch((error) => {
                  Log.error("[UTILS] Sharepoint - _saveFilesRecursive", error.responseText);
                  reject(error);
                });
            } else {
              // Recursion exit condition
              resolve(true);
            }
          });
        },
        /**
         * Saves files in a folder. Creates those folders if necessary.
         * Parameter 'aFiles' elements need following object structure:
         * ```
         * {
         *   folderName: "FOLDER_NAME",
         *   fileName: "File name.pdf",
         *   data: Data,
         *   size: Data.size,
         * }
         * ```
         * @param {string} sPath Root path
         * @param {Array} aFiles Array of file objects
         * @param {object} options Additional options
         * @param {boolean} options.delete_existing_files Indicates if files in folders should be deleted
         * @returns {Promise<boolean>} Promise to boolean result
         */
        saveFiles: function (sPath, aFiles) {
          return new Promise((resolve, reject) => {
            aFiles = aFiles.slice();
            resolve(this._saveFilesRecursive(sPath, aFiles));
          });
        },
        /**
         * Deletes double slashes without affecting protocol like 'https'.
         * @param {string} s File Path
         * @returns {string} Normalized file Path
         */
        _normalizePath: function (s) {
          s = s.replace("https://", "${PROTOCOL}");
          s = s.replace(/\/\//g, "/");
          return s.replace("${PROTOCOL}", "https://");
        },
      },
    };
  }
);
