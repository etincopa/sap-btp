{
	"contents": {
		"7cfd3027-f48a-40fc-ac62-bbfe8b48adf8": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "wfsuppliers",
			"subject": "wfSuppliers",
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
				"value": "${context.RequesterUserName}"
			}, {
				"id": "LastApprover",
				"label": "LastApprover",
				"type": "string",
				"value": "${context.ApproverUserName}"
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
			"name": "wfSuppliers",
			"documentation": "Workflow del Portal de Proveedores",
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
					"name": "Aprobación de solicitud de BP"
				},
				"5fa128af-270f-4bd6-abee-6b9b8ffefbf5": {
					"name": "Condicional de aprobacion o rechazo"
				},
				"d3a96c14-f682-4071-96cf-58f13d304a44": {
					"name": "Reenvio de solicitud de BP"
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
				"342576ce-de18-444b-b5a4-88213f62475c": {
					"name": "Envio de Correo"
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
				"1f8f6e64-ef3b-4b31-95a9-134fc7d32e33": {
					"name": "fechaScript"
				},
				"78c0de8d-e3b6-482d-8c19-24feb8511514": {
					"name": "Envio Correo Creación Rol"
				},
				"011b3646-1fc1-4034-b85d-3df548209cbf": {
					"name": "scriptDestinatario"
				}
			},
			"sequenceFlows": {
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
				"7725d931-469b-4714-8c19-94584b8d6be4": {
					"name": "SequenceFlow9"
				},
				"00575c52-9928-4223-9028-08e160d22da6": {
					"name": "SequenceFlow14"
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
				"4ccdf92b-49b2-42a0-9dcb-2ddfd472eb88": {
					"name": "SequenceFlow20"
				},
				"19b725e7-23f9-423b-981b-53ec7573fda7": {
					"name": "SequenceFlow21"
				},
				"ab25408d-be73-4cd9-b1f7-0111c008daec": {
					"name": "SequenceFlow23"
				},
				"b786fc37-4999-4805-a181-04f1be6310be": {
					"name": "SequenceFlow25"
				},
				"2fa8c5a8-2f1e-47a7-94d0-4b84821beb29": {
					"name": "aprobado"
				},
				"93ac2723-5572-4e29-8a9c-8bc80d80e715": {
					"name": "SequenceFlow27"
				},
				"f86302dc-402a-4f3a-9d99-9c9c9903a62c": {
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
			"subject": "Aprobar solicitud de proveedor",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://medifarma-apps-suppliers-bs.comeverissuppliersbpcreationrequest/com.everis.suppliers.bpcreationrequest",
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
			"name": "Aprobación de solicitud de BP"
		},
		"5fa128af-270f-4bd6-abee-6b9b8ffefbf5": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "Condicional de aprobacion o rechazo",
			"default": "2fa8c5a8-2f1e-47a7-94d0-4b84821beb29"
		},
		"d3a96c14-f682-4071-96cf-58f13d304a44": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Modificar Datos",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://medifarma-apps-suppliers-bs.comeverissuppliersbpcreationrequest/com.everis.suppliers.bpcreationrequest",
			"recipientUsers": "${context.requestUserData.USERID}",
			"userInterfaceParams": [],
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
			"name": "Reenvio de solicitud de BP"
		},
		"16ce00bc-81ca-4c70-9d4e-8aa91cdf8a88": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/mail.js",
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
			"reference": "/scripts/wfSuppliers/mastermyinbox.js",
			"id": "scripttask2",
			"name": "Datos Iniciales"
		},
		"68903b23-be28-4738-9cb0-084a8fe97fc9": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/mailApprove.js",
			"id": "scripttask5",
			"name": "Datos Email Aprobadores"
		},
		"342576ce-de18-444b-b5a4-88213f62475c": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "Envio de Correo",
			"mailDefinitionRef": "9aab3018-44c5-45d6-a026-0f4c64f44103"
		},
		"2d82a6df-4d03-47e5-84f7-1df4bdf35e36": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/status.js",
			"id": "scripttask6",
			"name": "Cambio Estado"
		},
		"1699f9c5-fbce-4461-a60b-09ec7ff701e9": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/format.js",
			"id": "scripttask7",
			"name": "Descripción Estado"
		},
		"e0fcf91f-7090-4b69-878e-e826ce697849": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/format.js",
			"id": "scripttask8",
			"name": "Descripción Estado"
		},
		"1f8f6e64-ef3b-4b31-95a9-134fc7d32e33": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/MasterinboxRechazo.js",
			"id": "scripttask10",
			"name": "fechaScript"
		},
		"78c0de8d-e3b6-482d-8c19-24feb8511514": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask3",
			"name": "Envio Correo Creación Rol",
			"mailDefinitionRef": "0076a50f-8933-4632-8ea5-7b8da414bd9b"
		},
		"011b3646-1fc1-4034-b85d-3df548209cbf": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/wfSuppliers/destinatarioParse.js",
			"id": "scripttask11",
			"name": "scriptDestinatario"
		},
		"cf0b3287-edd6-4fc5-a2f3-f005a542bb22": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow4",
			"name": "Rechazo",
			"sourceRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5",
			"targetRef": "1f8f6e64-ef3b-4b31-95a9-134fc7d32e33"
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
		"7725d931-469b-4714-8c19-94584b8d6be4": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "SequenceFlow9",
			"sourceRef": "c5c1269a-51c9-4f05-a80f-e490f7411e5f",
			"targetRef": "6510f2ef-c98c-4fdc-83fb-7652b93a4004"
		},
		"00575c52-9928-4223-9028-08e160d22da6": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow14",
			"name": "SequenceFlow14",
			"sourceRef": "68903b23-be28-4738-9cb0-084a8fe97fc9",
			"targetRef": "342576ce-de18-444b-b5a4-88213f62475c"
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
		"4ccdf92b-49b2-42a0-9dcb-2ddfd472eb88": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow20",
			"name": "SequenceFlow20",
			"sourceRef": "342576ce-de18-444b-b5a4-88213f62475c",
			"targetRef": "1699f9c5-fbce-4461-a60b-09ec7ff701e9"
		},
		"19b725e7-23f9-423b-981b-53ec7573fda7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow21",
			"name": "SequenceFlow21",
			"sourceRef": "1699f9c5-fbce-4461-a60b-09ec7ff701e9",
			"targetRef": "7419d761-0a8a-4fa2-895c-c399a4c2ab37"
		},
		"ab25408d-be73-4cd9-b1f7-0111c008daec": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow23",
			"name": "SequenceFlow23",
			"sourceRef": "1f8f6e64-ef3b-4b31-95a9-134fc7d32e33",
			"targetRef": "d3a96c14-f682-4071-96cf-58f13d304a44"
		},
		"b786fc37-4999-4805-a181-04f1be6310be": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow25",
			"name": "SequenceFlow25",
			"sourceRef": "60b9b31f-cf60-470a-818c-e3942d24110a",
			"targetRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5"
		},
		"2fa8c5a8-2f1e-47a7-94d0-4b84821beb29": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow26",
			"name": "aprobado",
			"sourceRef": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5",
			"targetRef": "011b3646-1fc1-4034-b85d-3df548209cbf"
		},
		"93ac2723-5572-4e29-8a9c-8bc80d80e715": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow27",
			"name": "SequenceFlow27",
			"sourceRef": "78c0de8d-e3b6-482d-8c19-24feb8511514",
			"targetRef": "a0e756d8-9a06-4a44-8814-674705eb0aa2"
		},
		"f86302dc-402a-4f3a-9d99-9c9c9903a62c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow29",
			"name": "SequenceFlow29",
			"sourceRef": "011b3646-1fc1-4034-b85d-3df548209cbf",
			"targetRef": "78c0de8d-e3b6-482d-8c19-24feb8511514"
		},
		"d9e0f742-c4a1-405b-8605-617c6def32dc": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"26ebeb04-bfa8-4191-b296-af4333c37131": {},
				"d43ba23c-2970-47ea-b271-63fa3e4924e9": {},
				"98aa37bc-7ecb-4602-aa7f-608e48bbb77d": {},
				"5f1c0b92-62bd-41ea-8815-9c34f2f5c117": {},
				"8fa60139-fe10-4d2b-9ce4-dff453989e83": {},
				"b03fdedb-0502-49df-8451-7fb5eb1895e3": {},
				"56339933-85a0-4ff0-8191-eb6bef95d9eb": {},
				"e239bbe2-beab-495e-9343-e88edf3cb293": {},
				"82b3b2d8-e416-4701-9e80-5d8dcaa316e3": {},
				"06cb7814-12ae-4a38-8391-645beae939b2": {},
				"c7e11d48-d6bd-4bc4-b0f9-f6010680826d": {},
				"2e0ae78b-28d7-418b-92aa-da84a4ed7f03": {},
				"aac603ce-bfee-4fcd-b783-ba3d0f22d692": {},
				"91c7005f-1a0e-42e6-b0b7-b195c3dc33ef": {},
				"f678050d-d8df-408c-bf84-c78c4dc92bda": {},
				"02844605-3484-4a70-83a9-400e847ada14": {},
				"a6317417-e9fc-4100-9a80-a698be3a9e85": {},
				"5d4a454f-cba7-4298-aa9b-ff975d6d63a1": {},
				"0286c847-7764-45d2-9380-c0fcf118171b": {},
				"af5283e6-422f-46bd-8fba-e11fbdcd4dd3": {},
				"10d72dec-b01b-45fc-9895-5cddab0f6776": {},
				"7134215d-0830-4835-8dc1-404bb3525ba0": {},
				"585e901f-d270-49a1-9fde-106b271f47f0": {},
				"6497ece8-ee5d-4109-ac74-273a6458f929": {},
				"df7a155d-bcda-4307-8b0c-bc6d56af8f9e": {},
				"e981fb54-ad48-4235-b8d5-a8a35f67610e": {},
				"ec2f33b0-c382-49ec-a4c5-59464c0759ef": {},
				"7cf1a7d1-972b-4b82-bcd6-686d18f898bf": {},
				"090d4f20-ffbf-45b5-927f-b434cd0f3852": {},
				"0d4ec8e4-0bcc-413c-89c8-6f7a4862b673": {},
				"301aa79a-d784-4071-9c33-8017d251708a": {},
				"91318271-bdaa-4cec-945d-10332462c7f4": {}
			}
		},
		"26ebeb04-bfa8-4191-b296-af4333c37131": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -613,
			"y": 41,
			"width": 32,
			"height": 32,
			"object": "c5c1269a-51c9-4f05-a80f-e490f7411e5f"
		},
		"d43ba23c-2970-47ea-b271-63fa3e4924e9": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 1006,
			"y": 14,
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
			"x": 382,
			"y": 23,
			"object": "5fa128af-270f-4bd6-abee-6b9b8ffefbf5"
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
			"points": "403,44 403,163 278,163 278,261.5",
			"sourceSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"targetSymbol": "df7a155d-bcda-4307-8b0c-bc6d56af8f9e",
			"object": "cf0b3287-edd6-4fc5-a2f3-f005a542bb22"
		},
		"56339933-85a0-4ff0-8191-eb6bef95d9eb": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "43,291 -94.75,291 -94.75,281 -232,281",
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
			"points": "210,62 210,-35",
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
		"2e0ae78b-28d7-418b-92aa-da84a4ed7f03": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -468,
			"y": 27,
			"width": 100,
			"height": 60,
			"object": "6510f2ef-c98c-4fdc-83fb-7652b93a4004"
		},
		"aac603ce-bfee-4fcd-b783-ba3d0f22d692": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-597,57 -418,57",
			"sourceSymbol": "26ebeb04-bfa8-4191-b296-af4333c37131",
			"targetSymbol": "2e0ae78b-28d7-418b-92aa-da84a4ed7f03",
			"object": "7725d931-469b-4714-8c19-94584b8d6be4"
		},
		"91c7005f-1a0e-42e6-b0b7-b195c3dc33ef": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -282,
			"y": 32,
			"width": 100,
			"height": 60,
			"object": "68903b23-be28-4738-9cb0-084a8fe97fc9"
		},
		"f678050d-d8df-408c-bf84-c78c4dc92bda": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-244,62 -80,62",
			"sourceSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"targetSymbol": "02844605-3484-4a70-83a9-400e847ada14",
			"object": "00575c52-9928-4223-9028-08e160d22da6"
		},
		"02844605-3484-4a70-83a9-400e847ada14": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": -130,
			"y": 32,
			"width": 100,
			"height": 60,
			"object": "342576ce-de18-444b-b5a4-88213f62475c"
		},
		"a6317417-e9fc-4100-9a80-a698be3a9e85": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-418,57 -241,57",
			"sourceSymbol": "2e0ae78b-28d7-418b-92aa-da84a4ed7f03",
			"targetSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"object": "2910895a-5818-4e84-80f0-d9df39b5995b"
		},
		"5d4a454f-cba7-4298-aa9b-ff975d6d63a1": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -282,
			"y": 251,
			"width": 100,
			"height": 60,
			"object": "2d82a6df-4d03-47e5-84f7-1df4bdf35e36"
		},
		"0286c847-7764-45d2-9380-c0fcf118171b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-232,281 -232,62",
			"sourceSymbol": "5d4a454f-cba7-4298-aa9b-ff975d6d63a1",
			"targetSymbol": "91c7005f-1a0e-42e6-b0b7-b195c3dc33ef",
			"object": "768b52d8-3677-4d5a-b938-23076894fd38"
		},
		"af5283e6-422f-46bd-8fba-e11fbdcd4dd3": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 11,
			"y": 32,
			"width": 100,
			"height": 60,
			"object": "1699f9c5-fbce-4461-a60b-09ec7ff701e9"
		},
		"10d72dec-b01b-45fc-9895-5cddab0f6776": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 160,
			"y": -65,
			"width": 100,
			"height": 60,
			"object": "e0fcf91f-7090-4b69-878e-e826ce697849"
		},
		"7134215d-0830-4835-8dc1-404bb3525ba0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "210,-35 210,-135",
			"sourceSymbol": "10d72dec-b01b-45fc-9895-5cddab0f6776",
			"targetSymbol": "e239bbe2-beab-495e-9343-e88edf3cb293",
			"object": "a9a5925e-1a78-4a73-9519-299778c44c8d"
		},
		"585e901f-d270-49a1-9fde-106b271f47f0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-80,62 61,62",
			"sourceSymbol": "02844605-3484-4a70-83a9-400e847ada14",
			"targetSymbol": "af5283e6-422f-46bd-8fba-e11fbdcd4dd3",
			"object": "4ccdf92b-49b2-42a0-9dcb-2ddfd472eb88"
		},
		"6497ece8-ee5d-4109-ac74-273a6458f929": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "61,62 232,62",
			"sourceSymbol": "af5283e6-422f-46bd-8fba-e11fbdcd4dd3",
			"targetSymbol": "98aa37bc-7ecb-4602-aa7f-608e48bbb77d",
			"object": "19b725e7-23f9-423b-981b-53ec7573fda7"
		},
		"df7a155d-bcda-4307-8b0c-bc6d56af8f9e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 228,
			"y": 261,
			"width": 100,
			"height": 60,
			"object": "1f8f6e64-ef3b-4b31-95a9-134fc7d32e33"
		},
		"e981fb54-ad48-4235-b8d5-a8a35f67610e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "278,291 43,291",
			"sourceSymbol": "df7a155d-bcda-4307-8b0c-bc6d56af8f9e",
			"targetSymbol": "8fa60139-fe10-4d2b-9ce4-dff453989e83",
			"object": "ab25408d-be73-4cd9-b1f7-0111c008daec"
		},
		"ec2f33b0-c382-49ec-a4c5-59464c0759ef": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 810,
			"y": 5,
			"width": 100,
			"height": 60,
			"object": "78c0de8d-e3b6-482d-8c19-24feb8511514"
		},
		"7cf1a7d1-972b-4b82-bcd6-686d18f898bf": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "401,-135 401,23.5",
			"sourceSymbol": "82b3b2d8-e416-4701-9e80-5d8dcaa316e3",
			"targetSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"object": "b786fc37-4999-4805-a181-04f1be6310be"
		},
		"090d4f20-ffbf-45b5-927f-b434cd0f3852": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "403,44 546.5,44 546.5,35 719,35",
			"sourceSymbol": "5f1c0b92-62bd-41ea-8815-9c34f2f5c117",
			"targetSymbol": "301aa79a-d784-4071-9c33-8017d251708a",
			"object": "2fa8c5a8-2f1e-47a7-94d0-4b84821beb29"
		},
		"0d4ec8e4-0bcc-413c-89c8-6f7a4862b673": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "860,33.25 1023.5,33.25",
			"sourceSymbol": "ec2f33b0-c382-49ec-a4c5-59464c0759ef",
			"targetSymbol": "d43ba23c-2970-47ea-b271-63fa3e4924e9",
			"object": "93ac2723-5572-4e29-8a9c-8bc80d80e715"
		},
		"301aa79a-d784-4071-9c33-8017d251708a": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 669,
			"y": 5,
			"width": 100,
			"height": 60,
			"object": "011b3646-1fc1-4034-b85d-3df548209cbf"
		},
		"91318271-bdaa-4cec-945d-10332462c7f4": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "719,35 846,35",
			"sourceSymbol": "301aa79a-d784-4071-9c33-8017d251708a",
			"targetSymbol": "ec2f33b0-c382-49ec-a4c5-59464c0759ef",
			"object": "f86302dc-402a-4f3a-9d99-9c9c9903a62c"
		},
		"9e1f90a5-b51e-46f1-b23e-120238480810": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 3,
			"sequenceflow": 29,
			"startevent": 1,
			"endevent": 1,
			"usertask": 2,
			"servicetask": 2,
			"scripttask": 11,
			"mailtask": 3,
			"exclusivegateway": 1
		},
		"59f0d56e-9395-4438-ba83-46d11e9a99ac": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/wfSuppliers/mail.html",
			"ignoreInvalidRecipients": true,
			"id": "maildefinition1"
		},
		"9aab3018-44c5-45d6-a026-0f4c64f44103": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/wfSuppliers/mailApprove.html",
			"ignoreInvalidRecipients": true,
			"id": "maildefinition2"
		},
		"0076a50f-8933-4632-8ea5-7b8da414bd9b": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition3",
			"to": "${context.sDestinatario}",
			"cc": "${context.sCopia}",
			"subject": "${context.subject}",
			"reference": "/webcontent/wfSuppliers/mailCreateRol.html",
			"id": "maildefinition3"
		}
	}
}