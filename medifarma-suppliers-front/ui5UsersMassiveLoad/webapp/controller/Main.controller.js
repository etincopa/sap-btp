sap.ui.define([
    "./BaseController",
    "../service/ScimService",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/library"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, ScimService, JSONModel, Message, MessageBox, MessageToast, library) {
        "use strict";

        var MessageType = library.MessageType;

        return BaseController.extend("com.everis.suppliers.ui5UsersMassiveLoad.controller.Main", {
            usersCSV: "",
            oMessageManager: "",
            onInit: function () {
                this.oMessageManager = sap.ui.getCore().getMessageManager();
                this.setModel(this.oMessageManager.getMessageModel(), "message");
            },
            handleUploadCSV: function (oEvent) {
                this.usersCSV = oEvent.getParameter("files")[0];
            },
            handleUploadUsers: function () {
                if (this.usersCSV && window.FileReader) {
                    let reader = new FileReader();
                    reader.onload = (evt) => {
                        let strCSV = evt.target.result; //string in CSV 
                        let aUsers = this.csvJSON(strCSV);
                        if (!aUsers) {
                            return MessageBox.error("Su archivo .CSV posee mas de 200 registros, por favor modifiquelo a un tamaño menor o igual que 200.");
                        }
                        this.createUsers(aUsers);
                    };
                    reader.readAsText(this.usersCSV);
                }
            },
            createUsers: function (aUsers) {
                // Format users into correct IAS API Structure
                let aFormattedUsers = aUsers.map((oUser) => {
                    return this.getUserStructureObject(oUser);
                });
                // Create corresponding Promises
                let aPromises = aFormattedUsers.map((oUser) => {
                    return ScimService.createUserResource(oUser).catch(e => e)
                })
                // Separate Array of Promises into different arrays of max 50 Promises
                aPromises = this.chunk(aPromises, 50);
                // Help variables
                let aResponses = [];
                let iChunkCounter = 0;
                // Iterate array of arrays of Promises to make requests of max 50 requests concurrently
                aPromises.forEach((aPromisesChuck) => {
                    Promise.all(aPromisesChuck)
                        .then(aResponse => {
                            aResponses.push(...aResponse);
                            iChunkCounter += 1;
                            if (iChunkCounter == aPromises.length) {
                                // Verify if there is errors
                                let aErrorResponse = aResponses.filter((oResponse) => oResponse['status'] == "error");
                                // If not just show a Toast saying all good
                                if (aErrorResponse.length <= 0) {
                                    MessageToast.show("Todos los usuarios fueron creados correctamente!");
                                    return;
                                }
                                // If there is errors split errors and success 
                                MessageBox.error("Ocurrión un error al subir 1 o más registros.\nPor favor revise en la parte inferior que registros fueron afectados.");
                                let aSuccessResponse = aResponses.filter((oResponse) => oResponse['status'] == "success");
                                // And create a message type for each one
                                let aMessages = aResponses.map((oMessage) => {
                                    return new Message({
                                        message: (oMessage.status == 'success') ? `Usuario ${oMessage['data'].userName} creado con éxito` : `Error al crear el usuario ${JSON.parse(oMessage['data']).userName}`,
                                        type: (oMessage.status == 'success') ? MessageType.Success : MessageType.Error,
                                        description: (oMessage.status == 'success') ? "" : `No se pudo crear el usuario ${JSON.parse(oMessage['data']).userName} (${JSON.parse(oMessage['data']).emails[0].value}).\n\n Motivo:\n${oMessage['reason']}`,
                                        processor: this.getModel()
                                    });
                                })
                                // Then loop that new array and add this messages to the message manager
                                aMessages.forEach((oMessage) => {
                                    sap.ui.getCore().getMessageManager().addMessages(oMessage);

                                })
                            }
                        })
                        .catch(error => console.log(`Error in executing ${error}`));
                });
            },

            getUserStructureObject: function (oUser) {
                let aFormattedCustomAttr = [];
                let oUnformattedAttr = this.extractAttrFromJson(oUser);
                for (const prop in oUnformattedAttr) {
                    if (oUnformattedAttr.hasOwnProperty(prop)) {
                        aFormattedCustomAttr.push({
                            name: this.reformatAttrName(prop),
                            value: oUnformattedAttr[prop],
                        });
                    }
                }

                let aUnformattedGroups = oUser['groups'].split(",")
                let aFormattedGroups = aUnformattedGroups.map((sGroup) => { return { value: sGroup } });

                return {
                    userName: (oUser['loginName']) ? oUser['loginName'] : "",
                    name: {
                        givenName: (oUser['firstName']) ? oUser['firstName'] : "",
                        familyName: (oUser['lastName']) ? oUser['lastName'] : "",
                        middleName: "Smith",
                        honorificPrefix: "Mr.",
                    },
                    emails: [{ value: (oUser['mail']) ? oUser['mail'] : "" }],
                    locale: "ES",
                    active: (oUser['status'] == 'active') ? true : false,
                    groups: aFormattedGroups,
                    "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": { attributes: aFormattedCustomAttr },
                };

            },

            handleTypeMissmatch: function (oEvent) {
                var aFileTypes = oEvent.getSource().getFileType();
                let aTaggedSupportedTypes = aFileTypes.map((sFileType) => {
                    return `<li>"*.${sFileType}</li>`;
                });
                MessageToast.show(`Los archivos tipo *.${oEvent.getParameter("fileType")} no estan soportados.\nPor favor elija uno de los siguientes:\n<ul>${aTaggedSupportedTypes.join(" ")}</ul>`);
            },
            onMessagePopoverPress: function (oEvent) {
                if (!this._oMessagePopover) {
                    this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.everis.suppliers.ui5UsersMassiveLoad.view.fragment.MessagePopover", this);
                    this.getView().addDependent(this._oMessagePopover);
                }
                this._oMessagePopover.openBy(oEvent.getSource());
            },
            onClearPress: function () {
                sap.ui.getCore().getMessageManager().removeAllMessages();
            },
            csvJSON: function (csv) {
                var lines = csv.split("\n");
                if (lines.length > 201) {
                    return false;
                }
                var result = [];
                var headers = lines[0].split(",");
                for (var i = 1; i < lines.length; i++) {
                    var obj = {};
                    var sCurrentLine = lines[i].replace(/"/g, "'");
                    //var currentline = lines[i].split(",");
                    var aCurrentLine = sCurrentLine.match(/\'[^\']?(?:\\.|[^\'])*\'/g);
                    for (var j = 0; j < headers.length; j++) {
                        obj[headers[j]] = aCurrentLine[j].replace(/['"]+/g, '');
                    }
                    result.push(obj);
                }
                var oStringResult = JSON.stringify(result);
                var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
                return oFinalResult;
            },
            extractAttrFromJson: function ({
                spCustomAttribute1,
                spCustomAttribute2,
                spCustomAttribute3,
                spCustomAttribute4,
                spCustomAttribute5 }) {
                return {
                    spCustomAttribute1,
                    spCustomAttribute2,
                    spCustomAttribute3,
                    spCustomAttribute4,
                    spCustomAttribute5
                };

            },
            reformatAttrName: function (sAttr) {
                let sSlicedAttr = sAttr.slice(2);
                return sSlicedAttr.charAt(0).toLowerCase() + sSlicedAttr.slice(1);
            },
            chunk: function (array, size) {
                const chunked_arr = [];
                let index = 0;
                while (index < array.length) {
                    chunked_arr.push(array.slice(index, size + index));
                    index += size;
                }
                return chunked_arr;
            }
        });
    });