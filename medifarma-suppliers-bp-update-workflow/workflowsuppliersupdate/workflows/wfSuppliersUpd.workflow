{
	"contents": {
		"7cfd3027-f48a-40fc-ac62-bbfe8b48adf8": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "wfsuppliersupd",
			"subject": "wfSuppliersUpd",
			"businessKey": "${context.bpRequestData.BPREQUESTID}",
			"customAttributes": [{
				"id": "CustomObjectStatus",
				"label": "CustomObjectStatus",
				"type": "string",
				"value": "${context.bpRequestData.BPREQUESTID}"
			}, {
				"id": "CustomNumberUnitValue",
				"label": "CustomNumberUnitValue",
				"type": "string",
				"value": "${context.statusText}"
			}, {
				"id": "CustomNumberValue",
				"label": "CustomNumberValue",
				"type": "string",
				"value": "${context.statusText}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "F. Aprobacion ${context.approvedOnDateFormatter}"
			}, {
				"id": "CustomCreatedBy",
				"label": "CustomCreatedBy",
				"type": "string",
				"value": "F. Solicitud: ${context.requestedOnDateFormatter}"
			}, {
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.CustomTaskTitle}"
			}, {
				"id": "RequestingUser",
				"label": "RequestingUser",
				"type": "string",
				"value": "${context.requestUserData.USERID}"
			}, {
				"id": "LastApprover",
				"label": "LastApprover",
				"type": "string",
				"value": "${context.lastApprover}"
			}, {
				"id": "Status",
				"label": "StatusText",
				"type": "string",
				"value": "${context.status}"
			}, {
				"id": "Reason",
				"label": "Reason",
				"type": "string",
				"value": "${context.reason}"
			}],
			"name": "wfSuppliersUpd",
			"documentation": "Workflow Actualizar BP",
			"lastIds": "9e1f90a5-b51e-46f1-b23e-120238480810",
			"events": {
				"c5c1269a-51c9-4f05-a80f-e490f7411e5f": {
					"name": "Iniciar Workflow"
				},
				"a0e756d8-9a06-4a44-8814-674705eb0aa2": {
					"name": "Finalizar Workflow"
				}
			},
			"activities": {
				"7419d761-0a8a-4fa2-895c-c399a4c2ab37": {
					"name": "Aprobación de actualización de BP"
				},
				"5fa128af-270f-4bd6-abee-6b9b8ffefbf5": {
					"name": "Condicional de aprobacion o rechazo"
				},
				"d3a96c14-f682-4071-96cf-58f13d304a44": {
					"name": "Reenvio de actualización de BP"
				},
				"16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88": {
					"name": "Datos Email Solicitante"
				},
				"60b9b31f-cf60-470a-818c-e3942d24110a": {
					"name": "Envio de Correo"
				},
				"6510f2ef-c98c-4fdc-83fb-7652b93a4004": {
					"name": "Datos Iniciales"
				},
				"68903b23-be28-4738-9cb0-084a8fe97fc9": {
					"name": "Datos Email Aprobadores"
				},
				"2d82a6df-4d03-47e5-84f7-1df4bdf35e36": {
					"name": "Cambio Estado"
				},
				"1699f9c5-fbce-4461-a60b-09ec7ff701e9": {
					"name": "Descripción Estado"
				},
				"e0fcf91f-7090-4b69-878e-e826ce697849": {
					"name": "Descripción Estado"
				},
				"4f1f9d74-64da-4df4-8c18-e1f01b6ed46b": {
					"name": "Actualizar Fecha Rechazo"
				},
				"5bf0c177-4052-462d-a621-7e5ec7eb6fd5": {
					"name": "Actualización de persona de contacto"
				},
				"21d9f79f-aba6-4b06-af63-7305b74f416c": {
					"name": "Envio de Correo: Persona de contacto"
				}
			},
			"sequenceFlows": {
				"f73d8b60-fac4-4e90-8861-9cd4fec76623": {
					"name": "Aprobacion"
				},
				"cf0b3287-edd6-4fc5-a2f3-f005a542bb22": {
					"name": "Rechazo"
				},
				"9199df46-91c8-48ce-809e-e062a31f7f4e": {
					"name": "SequenceFlow5"
				},
				"4200cc48-0ede-43f4-bbf9-99bfc6aea15d": {
					"name": "SequenceFlow6"
				},
				"7d68106a-cd46-4a31-b1d8-1cf235df4e47": {
					"name": "SequenceFlow7"
				},
				"aa12bacf-861e-481a-8a36-0612205f7705": {
					"name": "SequenceFlow8"
				},
				"7725d931-469b-4714-8c19-94584b8d6be4": {
					"name": "SequenceFlow9"
				},
				"2910895a-5818-4e84-80f0-d9df39b5995b": {
					"name": "SequenceFlow17"
				},
				"768b52d8-3677-4d5a-b938-23076894fd38": {
					"name": "SequenceFlow18"
				},
				"a9a5925e-1a78-4a73-9519-299778c44c8d": {
					"name": "SequenceFlow19"
				},
				"19b725e7-23f9-423b-981b-53ec7573fda7": {
					"name": "SequenceFlow21"
				},
				"859b31e3-093c-421a-9de6-8626f1a0205c": {
					"name": "SequenceFlow22"
				},
				"47b81590-b1db-4b58-afb6-13b3b55ad200": {
					"name": "Sin cambio"
				},
				"91038536-7b4a-4a3e-b1aa-531b8ae877d7": {
					"name": "SequenceFlow27"
				},
				"9160e50c-7078-45b2-bd15-3967a4814c1b": {
					"name": "Persona añadida"
				},
				"22399c37-9d0f-4d53-ab68-138dbf94cc98": {
					"name": "SequenceFlow29"
				}
			},
			"diagrams": {
				"d9e0f742-c4a1-405b-8605-617c6def32dc": {}
			}
		},
		"c5c1269a-51c9-4f05-a80f-e490f7411e5f": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "Iniciar Workflow"
		},
		"a0e756d8-9a06-4a44-8814-674705eb0aa2": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "Finalizar Workflow"
		},
		"7419d761-0a8a-4fa2-895c-c399a4c2ab37": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Aprobar Actualización de proveedor",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://medifarma-apps-suppliers-bs.comeverissuppliersbpupdaterequest/com.everis.suppliers.bpupdaterequest",
			"recipientUsers": "${context.users}",
			"recipientGroups": "",
			"customAttributes": [{
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.CustomTaskTitle}"
			}, {
				"id": "CustomCreatedBy",
				"label": "CustomCreatedBy",
				"type": "string",
				"value": "F. Solic.: ${context.requestedOnDateFormatter}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "${context.sLabel} ${context.CustomObjectAttributeValueVariable}"
			}, {
				"id": "CustomNumberValue",
				"label": "CustomNumberValue",
				"type": "string",
				"value": "${context.CustomNumberValue}"
			}, {
				"id": "CustomNumberUnitValue",
				"label": "CustomNumberUnitValue",
				"type": "string",
				"value": "${context.statusText}"
			}],
			"id": "usertask1",
			"name": "Aprobación de actualización de BP"
		},
		"5fa128af-270f-4bd6-abee-6b9b8ffefbf5": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "Condicional de aprobacion o rechazo",
			"default": "f73d8b60-fac4-4e90-8861-9cd4fec76623"
		},
		"d3a96c14-f682-4071-96cf-58f13d304a44": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Modificar Datos",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comeverissuppliersbpupdaterequest/com.everis.suppliers.bpupdaterequest",
			"recipientUsers": "${context.requestUserData.USERID}",
			"customAttributes": [{
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.CustomTaskTitle}"
			}, {
				"id": "CustomCreatedBy",
				"label": "CustomCreatedBy",
				"type": "string",
				"value": "F. Solic.: ${context.requestedOnDateFormatter}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "${context.sLabel} ${context.CustomObjectAttributeValueVariable}"
			}, {
				"id": "CustomNumberValue",
				"label": "CustomNumberValue",
				"type": "string",
				"value": "${context.CustomNumberValue}"
			}, {
				"id": "CustomNumberUnitValue",
				"label": "CustomNumberUnitValue",
				"type": "string",
				"value": "${context.statusText}"
			}],
			"id": "usertask2",
			"name": "Reenvio de actualización de BP"
		},
		"16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/mail.js",
			"id": "scripttask1",
			"name": "Datos Email Solicitante"
		},
		"60b9b31f-cf60-470a-818c-e3942d24110a": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "Envio de Correo",
			"mailDefinitionRef": "59f0d56e-9395-4438-ba83-46d11e9a99ac"
		},
		"6510f2ef-c98c-4fdc-83fb-7652b93a4004": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/mastermyinbox.js",
			"id": "scripttask2",
			"name": "Datos Iniciales"
		},
		"68903b23-be28-4738-9cb0-084a8fe97fc9": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/mailApprove.js",
			"id": "scripttask5",
			"name": "Datos Email Aprobadores"
		},
		"2d82a6df-4d03-47e5-84f7-1df4bdf35e36": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/status.js",
			"id": "scripttask6",
			"name": "Cambio Estado"
		},
		"1699f9c5-fbce-4461-a60b-09ec7ff701e9": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/format.js",
			"id": "scripttask7",
			"name": "Descripción Estado"
		},
		"e0fcf91f-7090-4b69-878e-e826ce697849": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/format.js",
			"id": "scripttask8",
			"name": "Descripción Estado"
		},
		"4f1f9d74-64da-4df4-8c18-e1f01b6ed46b": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliersUpd/actualizarFechaRechazo.js",
			"id": "scripttask9",
			"name": "Actualizar Fecha Rechazo"
		},
		"5bf0c177-4052-462d-a621-7e5ec7eb6fd5": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway3",
			"name": "Actualización de persona de contacto",
			"default": "47b81590-b1db-4b58-afb6-13b3b55ad200"
		},
		"21d9f79f-aba6-4b06-af63-7305b74f416c": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask3",
			"name": "Envio de Correo: Persona de contacto",
			"mailDefinitionRef": "af70b3f1-23a5-47cc-a32d-e99e7dde490e"
		},
		"f73d8b60-fac4-4e90-8861-9cd4fec76623": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "Aprobacion",
			"sourceRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5",
			"targetRef": "a0e756d8-9a06-4a44-8814-674705eb0aa2"
		},
		"cf0b3287-edd6-4fc5-a2f3-f005a542bb22": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow4",
			"name": "Rechazo",
			"sourceRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5",
			"targetRef": "4f1f9d74-64da-4df4-8c18-e1f01b6ed46b"
		},
		"9199df46-91c8-48ce-809e-e062a31f7f4e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "d3a96c14-f682-4071-96cf-58f13d304a44",
			"targetRef": "2d82a6df-4d03-47e5-84f7-1df4bdf35e36"
		},
		"4200cc48-0ede-43f4-bbf9-99bfc6aea15d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow6",
			"name": "SequenceFlow6",
			"sourceRef": "7419d761-0a8a-4fa2-895c-c399a4c2ab37",
			"targetRef": "e0fcf91f-7090-4b69-878e-e826ce697849"
		},
		"7d68106a-cd46-4a31-b1d8-1cf235df4e47": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88",
			"targetRef": "60b9b31f-cf60-470a-818c-e3942d24110a"
		},
		"aa12bacf-861e-481a-8a36-0612205f7705": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow8",
			"name": "SequenceFlow8",
			"sourceRef": "60b9b31f-cf60-470a-818c-e3942d24110a",
			"targetRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5"
		},
		"7725d931-469b-4714-8c19-94584b8d6be4": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "SequenceFlow9",
			"sourceRef": "c5c1269a-51c9-4f05-a80f-e490f7411e5f",
			"targetRef": "6510f2ef-c98c-4fdc-83fb-7652b93a4004"
		},
		"2910895a-5818-4e84-80f0-d9df39b5995b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow17",
			"name": "SequenceFlow17",
			"sourceRef": "6510f2ef-c98c-4fdc-83fb-7652b93a4004",
			"targetRef": "68903b23-be28-4738-9cb0-084a8fe97fc9"
		},
		"768b52d8-3677-4d5a-b938-23076894fd38": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow18",
			"name": "SequenceFlow18",
			"sourceRef": "2d82a6df-4d03-47e5-84f7-1df4bdf35e36",
			"targetRef": "68903b23-be28-4738-9cb0-084a8fe97fc9"
		},
		"a9a5925e-1a78-4a73-9519-299778c44c8d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow19",
			"name": "SequenceFlow19",
			"sourceRef": "e0fcf91f-7090-4b69-878e-e826ce697849",
			"targetRef": "16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88"
		},
		"19b725e7-23f9-423b-981b-53ec7573fda7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow21",
			"name": "SequenceFlow21",
			"sourceRef": "1699f9c5-fbce-4461-a60b-09ec7ff701e9",
			"targetRef": "7419d761-0a8a-4fa2-895c-c399a4c2ab37"
		},
		"859b31e3-093c-421a-9de6-8626f1a0205c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow22",
			"name": "SequenceFlow22",
			"sourceRef": "4f1f9d74-64da-4df4-8c18-e1f01b6ed46b",
			"targetRef": "d3a96c14-f682-4071-96cf-58f13d304a44"
		},
		"47b81590-b1db-4b58-afb6-13b3b55ad200": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow25",
			"name": "Sin cambio",
			"sourceRef": "5bf0c177-4052-462d-a621-7e5ec7eb6fd5",
			"targetRef": "1699f9c5-fbce-4461-a60b-09ec7ff701e9"
		},
		"91038536-7b4a-4a3e-b1aa-531b8ae877d7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow27",
			"name": "SequenceFlow27",
			"sourceRef": "21d9f79f-aba6-4b06-af63-7305b74f416c",
			"targetRef": "1699f9c5-fbce-4461-a60b-09ec7ff701e9"
		},
		"9160e50c-7078-45b2-bd15-3967a4814c1b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.sActionContactPerson == 'Crear'}",
			"id": "sequenceflow28",
			"name": "Persona añadida",
			"sourceRef": "5bf0c177-4052-462d-a621-7e5ec7eb6fd5",
			"targetRef": "21d9f79f-aba6-4b06-af63-7305b74f416c"
		},
		"22399c37-9d0f-4d53-ab68-138dbf94cc98": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow29",
			"name": "SequenceFlow29",
			"sourceRef": "68903b23-be28-4738-9cb0-084a8fe97fc9",
			"targetRef": "5bf0c177-4052-462d-a621-7e5ec7eb6fd5"
		},
		"d9e0f742-c4a1-405b-8605-617c6def32dc": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"26ebeb04-bfa8-4191-b296-af4333c37131": {},
				"d43ba23c-2970-47ea-b271-63fa3e4924e9": {},
				"98aa37bc-7ecb-4602-aa7f-608e48bbb77d": {},
				"5f1c0b92-62bd-41ea-8815-9c34f2f5c117": {},
				"6c2c0b28-6485-41db-a6d4-3fd55d1a008e": {},
				"8fa60139-fe10-4d2b-9ce4-dff453989e83": {},
				"b03fdedb-0502-49df-8451-7fb5eb1895e3": {},
				"56339933-85a0-4ff0-8191-eb6bef95d9eb": {},
				"e239bbe2-beab-495e-9343-e88edf3cb293": {},
				"82b3b2d8-e416-4701-9e80-5d8dcaa316e3": {},
				"06cb7814-12ae-4a38-8391-645beae939b2": {},
				"c7e11d48-d6bd-4bc4-b0f9-f6010680826d": {},
				"226f52b9-54f0-4865-9b7f-8b55b56cdf07": {},
				"2e0ae78b-28d7-418b-92aa-da84a4ed7f03": {},
				"aac603ce-bfee-4fcd-b783-ba3d0f22d692": {},
				"91c7005f-1a0e-42e6-b0b7-b195c3dc33ef": {},
				"a6317417-e9fc-4100-9a80-a698be3a9e85": {},
				"5d4a454f-cba7-4298-aa9b-ff975d6d63a1": {},
				"0286c847-7764-45d2-9380-c0fcf118171b": {},
				"af5283e6-422f-46bd-8fba-e11fbdcd4dd3": {},
				"10d72dec-b01b-45fc-9895-5cddab0f6776": {},
				"7134215d-0830-4835-8dc1-404bb3525ba0": {},
				"6497ece8-ee5d-4109-ac74-273a6458f929": {},
				"3e4acd2a-985e-4a8f-a262-6edb999ee8c2": {},
				"ec5a6099-e8c5-4de9-bd71-d78a7b96d333": {},
				"cae82455-126d-4c92-ae59-7e88c936e199": {},
				"9c763c3a-2798-4550-8a1f-ac446153fe89": {},
				"5cffc509-255f-47ff-9cd0-de3e4983fa81": {},
				"ddef942f-4948-474b-aae8-3c5a19b8aff6": {},
				"8b425652-d954-4df1-9db1-9a481f09c0dd": {},
				"805cefa6-a65a-44c1-8ad9-7e0ef2da3aec": {}
			}
		},
		"26ebeb04-bfa8-4191-b296-af4333c37131": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -1081,
			"y": 36,
			"width": 32,
			"height": 32,
			"object": "c5c1269a-51c9-4f05-a80f-e490f7411e5f"
		},
		"d43ba23c-2970-47ea-b271-63fa3e4924e9": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 618,
			"y": 23,
			"width": 35,
			"height": 35,
			"object": "a0e756d8-9a06-4a44-8814-674705eb0aa2"
		},
		"98aa37bc-7ecb-4602-aa7f-608e48bbb77d": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 160,
			"y": 32,
			"width": 100,
			"height": 60,
			"object": "7419d761-0a8a-4fa2-895c-c399a4c2ab37"
		},
		"5f1c0b92-62bd-41ea-8815-9c34f2f5c117": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 378,
			"y": 20,
			"object": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5"
		},
		"6c2c0b28-6485-41db-a6d4-3fd55d1a008e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "399,40.75 635.5,40.75",
			"sourceSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"targetSymbol": "d43ba23c-2970-47ea-b271-63fa3e4924e9",
			"object": "f73d8b60-fac4-4e90-8861-9cd4fec76623"
		},
		"8fa60139-fe10-4d2b-9ce4-dff453989e83": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": -7,
			"y": 261,
			"width": 100,
			"height": 60,
			"object": "d3a96c14-f682-4071-96cf-58f13d304a44"
		},
		"b03fdedb-0502-49df-8451-7fb5eb1895e3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "399,41 399,291",
			"sourceSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"targetSymbol": "3e4acd2a-985e-4a8f-a262-6edb999ee8c2",
			"object": "cf0b3287-edd6-4fc5-a2f3-f005a542bb22"
		},
		"56339933-85a0-4ff0-8191-eb6bef95d9eb": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "43,288.5 -726,288.5",
			"sourceSymbol": "8fa60139-fe10-4d2b-9ce4-dff453989e83",
			"targetSymbol": "5d4a454f-cba7-4298-aa9b-ff975d6d63a1",
			"object": "9199df46-91c8-48ce-809e-e062a31f7f4e"
		},
		"e239bbe2-beab-495e-9343-e88edf3cb293": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 160,
			"y": -165,
			"width": 100,
			"height": 60,
			"object": "16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88"
		},
		"82b3b2d8-e416-4701-9e80-5d8dcaa316e3": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 349,
			"y": -165,
			"width": 100,
			"height": 60,
			"object": "60b9b31f-cf60-470a-818c-e3942d24110a"
		},
		"06cb7814-12ae-4a38-8391-645beae939b2": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "210,62 210,-32",
			"sourceSymbol": "98aa37bc-7ecb-4602-aa7f-608e48bbb77d",
			"targetSymbol": "10d72dec-b01b-45fc-9895-5cddab0f6776",
			"object": "4200cc48-0ede-43f4-bbf9-99bfc6aea15d"
		},
		"c7e11d48-d6bd-4bc4-b0f9-f6010680826d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "210,-135 410,-135",
			"sourceSymbol": "e239bbe2-beab-495e-9343-e88edf3cb293",
			"targetSymbol": "82b3b2d8-e416-4701-9e80-5d8dcaa316e3",
			"object": "7d68106a-cd46-4a31-b1d8-1cf235df4e47"
		},
		"226f52b9-54f0-4865-9b7f-8b55b56cdf07": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "400,-135 400,22",
			"sourceSymbol": "82b3b2d8-e416-4701-9e80-5d8dcaa316e3",
			"targetSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"object": "aa12bacf-861e-481a-8a36-0612205f7705"
		},
		"2e0ae78b-28d7-418b-92aa-da84a4ed7f03": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -936,
			"y": 22,
			"width": 100,
			"height": 60,
			"object": "6510f2ef-c98c-4fdc-83fb-7652b93a4004"
		},
		"aac603ce-bfee-4fcd-b783-ba3d0f22d692": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-1065,52 -886,52",
			"sourceSymbol": "26ebeb04-bfa8-4191-b296-af4333c37131",
			"targetSymbol": "2e0ae78b-28d7-418b-92aa-da84a4ed7f03",
			"object": "7725d931-469b-4714-8c19-94584b8d6be4"
		},
		"91c7005f-1a0e-42e6-b0b7-b195c3dc33ef": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -776,
			"y": 27,
			"width": 100,
			"height": 60,
			"object": "68903b23-be28-4738-9cb0-084a8fe97fc9"
		},
		"a6317417-e9fc-4100-9a80-a698be3a9e85": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-886,52 -735,52",
			"sourceSymbol": "2e0ae78b-28d7-418b-92aa-da84a4ed7f03",
			"targetSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"object": "2910895a-5818-4e84-80f0-d9df39b5995b"
		},
		"5d4a454f-cba7-4298-aa9b-ff975d6d63a1": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -776,
			"y": 256,
			"width": 100,
			"height": 60,
			"object": "2d82a6df-4d03-47e5-84f7-1df4bdf35e36"
		},
		"0286c847-7764-45d2-9380-c0fcf118171b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-726,286 -726,57",
			"sourceSymbol": "5d4a454f-cba7-4298-aa9b-ff975d6d63a1",
			"targetSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"object": "768b52d8-3677-4d5a-b938-23076894fd38"
		},
		"af5283e6-422f-46bd-8fba-e11fbdcd4dd3": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -73,
			"y": -129,
			"width": 100,
			"height": 60,
			"object": "1699f9c5-fbce-4461-a60b-09ec7ff701e9"
		},
		"10d72dec-b01b-45fc-9895-5cddab0f6776": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 160,
			"y": -62,
			"width": 100,
			"height": 60,
			"object": "e0fcf91f-7090-4b69-878e-e826ce697849"
		},
		"7134215d-0830-4835-8dc1-404bb3525ba0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "210,-32 210,-135",
			"sourceSymbol": "10d72dec-b01b-45fc-9895-5cddab0f6776",
			"targetSymbol": "e239bbe2-beab-495e-9343-e88edf3cb293",
			"object": "a9a5925e-1a78-4a73-9519-299778c44c8d"
		},
		"6497ece8-ee5d-4109-ac74-273a6458f929": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-23,-99 93.75,-99 93.75,62 232,62",
			"sourceSymbol": "af5283e6-422f-46bd-8fba-e11fbdcd4dd3",
			"targetSymbol": "98aa37bc-7ecb-4602-aa7f-608e48bbb77d",
			"object": "19b725e7-23f9-423b-981b-53ec7573fda7"
		},
		"3e4acd2a-985e-4a8f-a262-6edb999ee8c2": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 349,
			"y": 261,
			"width": 100,
			"height": 60,
			"object": "4f1f9d74-64da-4df4-8c18-e1f01b6ed46b"
		},
		"ec5a6099-e8c5-4de9-bd71-d78a7b96d333": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "399,291 43,291",
			"sourceSymbol": "3e4acd2a-985e-4a8f-a262-6edb999ee8c2",
			"targetSymbol": "8fa60139-fe10-4d2b-9ce4-dff453989e83",
			"object": "859b31e3-093c-421a-9de6-8626f1a0205c"
		},
		"cae82455-126d-4c92-ae59-7e88c936e199": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": -338,
			"y": 36,
			"object": "5bf0c177-4052-462d-a621-7e5ec7eb6fd5"
		},
		"9c763c3a-2798-4550-8a1f-ac446153fe89": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-317,56.5 -21,56.5 -21,-99",
			"sourceSymbol": "cae82455-126d-4c92-ae59-7e88c936e199",
			"targetSymbol": "af5283e6-422f-46bd-8fba-e11fbdcd4dd3",
			"object": "47b81590-b1db-4b58-afb6-13b3b55ad200"
		},
		"5cffc509-255f-47ff-9cd0-de3e4983fa81": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": -367,
			"y": -129,
			"width": 100,
			"height": 60,
			"object": "21d9f79f-aba6-4b06-af63-7305b74f416c"
		},
		"ddef942f-4948-474b-aae8-3c5a19b8aff6": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-317,-99 -23,-99",
			"sourceSymbol": "5cffc509-255f-47ff-9cd0-de3e4983fa81",
			"targetSymbol": "af5283e6-422f-46bd-8fba-e11fbdcd4dd3",
			"object": "91038536-7b4a-4a3e-b1aa-531b8ae877d7"
		},
		"8b425652-d954-4df1-9db1-9a481f09c0dd": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-317,57 -317,-99",
			"sourceSymbol": "cae82455-126d-4c92-ae59-7e88c936e199",
			"targetSymbol": "5cffc509-255f-47ff-9cd0-de3e4983fa81",
			"object": "9160e50c-7078-45b2-bd15-3967a4814c1b"
		},
		"805cefa6-a65a-44c1-8ad9-7e0ef2da3aec": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-726,57 -317,57",
			"sourceSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"targetSymbol": "cae82455-126d-4c92-ae59-7e88c936e199",
			"object": "22399c37-9d0f-4d53-ab68-138dbf94cc98"
		},
		"9e1f90a5-b51e-46f1-b23e-120238480810": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 3,
			"sequenceflow": 29,
			"startevent": 1,
			"endevent": 1,
			"usertask": 2,
			"servicetask": 2,
			"scripttask": 9,
			"mailtask": 3,
			"exclusivegateway": 3
		},
		"59f0d56e-9395-4438-ba83-46d11e9a99ac": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/wfSuppliersUpd/mail.html",
			"ignoreInvalidRecipients": true,
			"id": "maildefinition1"
		},
		"af70b3f1-23a5-47cc-a32d-e99e7dde490e": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition3",
			"to": "${context.mail}",
			"subject": "${context.subjectContactPerson}",
			"reference": "/webcontent/wfSuppliersUpd/mailContactPerson.html",
			"id": "maildefinition3"
		}
	}
}