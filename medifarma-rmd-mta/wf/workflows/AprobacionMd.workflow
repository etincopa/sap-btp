{
	"contents": {
		"ecfd6dde-47ee-4096-b0a9-1eb258ae53f3": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "mif.rmd.AprobacionMd",
			"subject": "AprobacionMd",
			"name": "AprobacionMd",
			"documentation": "Workflow de aprobación para la Md",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "Inicio Aprobación"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "Fin Aprobación"
				}
			},
			"activities": {
				"3a8734c6-47a7-490a-adfc-4ca55ca26b14": {
					"name": "Mail Jefe Producción"
				},
				"2d40c324-2a7f-48e3-981a-1709b84f00f5": {
					"name": "Mail Aprobación Jefe Producción"
				},
				"82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f": {
					"name": "Mail Aprobación Gerente Producción"
				},
				"bec59a50-109a-4e95-824f-c6e840449aff": {
					"name": "Aprueba?"
				},
				"f3ce8a84-afc7-4c96-bbb9-a6d929543467": {
					"name": "Mail DT"
				},
				"7824abfb-1313-40ee-b17b-0d2090936afb": {
					"name": "Mail Gerente Producción"
				},
				"1d3864b6-7448-427f-8534-2d670da38967": {
					"name": "Reenvio correccion DT"
				},
				"9ce29cd2-c37c-4f24-8e48-b5bd52634e6e": {
					"name": "Aprobador Jefe Producción"
				},
				"b7ccd130-694e-420e-b6bf-14efda68b312": {
					"name": "Aprobador Gerente Producción"
				},
				"4aa824cf-5f5f-4394-8bb8-b950ee866628": {
					"name": "Mail Aprobación Jefatura DT"
				},
				"6bdb2534-18f1-4d6b-a033-a753799ba51b": {
					"name": "Aprueba?"
				},
				"94d5dc29-832f-4340-a424-9341719232a2": {
					"name": "Mail Jefatura DT"
				},
				"e10517c9-fe0c-4257-8320-5a3b55914651": {
					"name": "Aprobador Jefatura DT"
				},
				"275ec32e-42f2-44fe-9e2a-a2494d09bff4": {
					"name": "Mail Finaliza Proceso"
				},
				"b8113aef-f992-4307-bbb7-9449ac71b1a1": {
					"name": "Aprueba?"
				},
				"dd56e451-0d11-4da7-ba80-f46bb9ff122c": {
					"name": "Mail Confirmación DT"
				},
				"72450d5f-f7a2-4592-ab9f-9d08808fcc0c": {
					"name": "Cambia?"
				},
				"5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f": {
					"name": "Cambia?"
				},
				"0580dbe2-8980-4a6f-b84c-b45719f860c3": {
					"name": "Cambia?"
				},
				"517db4c9-80c0-4ee3-98aa-a4a52f8b5048": {
					"name": "Mail Rechazo DT"
				},
				"1d1d092b-6065-42b0-808e-ca27f2b184c1": {
					"name": "ObtenerRol"
				},
				"166749dc-ec8b-4698-89c6-447eb4508517": {
					"name": "ObtenerRol"
				}
			},
			"sequenceFlows": {
				"33269cab-d826-4750-bb2f-53d549575c4d": {
					"name": "SequenceFlow24"
				},
				"4f414550-422d-4446-b5bc-1a462c2a49da": {
					"name": "SequenceFlow25"
				},
				"161b1c5c-97cb-4d98-8e6c-8167d5686212": {
					"name": "SequenceFlow31"
				},
				"947ee500-4860-45c1-88db-0a1a1cc2fa79": {
					"name": "SequenceFlow32"
				},
				"90e607cf-9557-498d-b36b-bdb99d09a066": {
					"name": "SequenceFlow33"
				},
				"ee0819b1-4ff7-4cbb-9452-9a4686ad2c83": {
					"name": "SequenceFlow35"
				},
				"f1ff3611-c66c-4fe6-8597-35ecee3b81d6": {
					"name": "SequenceFlow41"
				},
				"d4999f55-28ad-4da4-978b-3320f4b8d596": {
					"name": "SequenceFlow47"
				},
				"4d77776a-891e-4397-8148-0186dc6a9f09": {
					"name": "Si"
				},
				"48fc4aff-91ce-4cab-80dc-61fdde68fd60": {
					"name": "No"
				},
				"c0a48865-aeea-43a4-955c-716e4060a05e": {
					"name": "SequenceFlow53"
				},
				"c173bcb3-8946-4263-bd7f-ffd59d817eca": {
					"name": "No"
				},
				"d9fbc053-f649-443c-8abf-bdf6d568cc9c": {
					"name": "No"
				},
				"de4d8dbe-1c83-4e2b-b753-d5bb8c584eb9": {
					"name": "SequenceFlow57"
				},
				"3684a44c-71db-4b55-bf6e-3691ec52ffc4": {
					"name": "Si"
				},
				"5866b993-7943-41a4-b652-92a596c8c935": {
					"name": "Si"
				},
				"b08225e4-409f-4079-953a-60ecd3e28944": {
					"name": "SequenceFlow60"
				},
				"8b778da6-4d5d-4de9-856d-a5d0a9c935f3": {
					"name": "SequenceFlow61"
				},
				"487794a0-67de-455f-8288-5b9c81db90ce": {
					"name": "SequenceFlow62"
				},
				"66fb38eb-2857-4d4f-b6f5-3df2d6b1d146": {
					"name": "Si"
				},
				"241d1721-42c7-440a-9de6-466a111d9362": {
					"name": "No"
				},
				"e4a2ca9c-2c6c-4603-b8aa-4e4bddc83775": {
					"name": "Si"
				},
				"68e5140d-ae4a-4942-8fa2-6f33cda457fc": {
					"name": "SequenceFlow66"
				},
				"cc6404af-912b-46e9-8539-b671d97d0054": {
					"name": "Si"
				},
				"300e117e-5cd9-4562-9ff0-8c600d7af407": {
					"name": "SequenceFlow69"
				},
				"4de9e18b-9f3e-436c-b0b4-2e8b09bbd616": {
					"name": "No"
				},
				"26bd3178-2177-46fb-9a3c-8e34e5022946": {
					"name": "No"
				},
				"e895151e-dc14-43e3-90c7-d544126ecb4f": {
					"name": "SequenceFlow72"
				},
				"e1528290-28de-4dd4-bde6-0f89f72b6ada": {
					"name": "SequenceFlow73"
				}
			},
			"diagrams": {
				"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {}
			}
		},
		"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "Inicio Aprobación"
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "Fin Aprobación"
		},
		"3a8734c6-47a7-490a-adfc-4ca55ca26b14": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask8",
			"name": "Mail Jefe Producción",
			"mailDefinitionRef": "d5493338-aad3-43c5-b8fb-9dc2a248633c"
		},
		"2d40c324-2a7f-48e3-981a-1709b84f00f5": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/mailAprob1.js",
			"id": "scripttask7",
			"name": "Mail Aprobación Jefe Producción"
		},
		"82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/mailAprob2.js",
			"id": "scripttask8",
			"name": "Mail Aprobación Gerente Producción"
		},
		"bec59a50-109a-4e95-824f-c6e840449aff": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway3",
			"name": "Aprueba?",
			"default": "cc6404af-912b-46e9-8539-b671d97d0054"
		},
		"f3ce8a84-afc7-4c96-bbb9-a6d929543467": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask9",
			"name": "Mail DT",
			"mailDefinitionRef": "698fd6d8-a84b-485d-9da4-42580701ed0d"
		},
		"7824abfb-1313-40ee-b17b-0d2090936afb": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask10",
			"name": "Mail Gerente Producción",
			"mailDefinitionRef": "cf69a99d-6c4b-4dc7-a107-7a87d1d64273"
		},
		"1d3864b6-7448-427f-8534-2d670da38967": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Modificar Corrección",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.requestUserData.EMAIL}",
			"id": "usertask5",
			"name": "Reenvio correccion DT"
		},
		"9ce29cd2-c37c-4f24-8e48-b5bd52634e6e": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Aprobación Jefe",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.mail}",
			"id": "usertask6",
			"name": "Aprobador Jefe Producción"
		},
		"b7ccd130-694e-420e-b6bf-14efda68b312": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Aprobador Gerente Producción",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.mail}",
			"id": "usertask7",
			"name": "Aprobador Gerente Producción"
		},
		"4aa824cf-5f5f-4394-8bb8-b950ee866628": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/mailAprob3.js",
			"id": "scripttask10",
			"name": "Mail Aprobación Jefatura DT"
		},
		"6bdb2534-18f1-4d6b-a033-a753799ba51b": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway4",
			"name": "Aprueba?",
			"default": "5866b993-7943-41a4-b652-92a596c8c935"
		},
		"94d5dc29-832f-4340-a424-9341719232a2": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask11",
			"name": "Mail Jefatura DT",
			"mailDefinitionRef": "3c738c69-708f-481c-9021-6e8d6eb3f3ec"
		},
		"e10517c9-fe0c-4257-8320-5a3b55914651": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Aprobador 3er Nivel",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.mail}",
			"id": "usertask8",
			"name": "Aprobador Jefatura DT"
		},
		"275ec32e-42f2-44fe-9e2a-a2494d09bff4": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/mailFinal.js",
			"id": "scripttask11",
			"name": "Mail Finaliza Proceso"
		},
		"b8113aef-f992-4307-bbb7-9449ac71b1a1": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway5",
			"name": "Aprueba?",
			"default": "e4a2ca9c-2c6c-4603-b8aa-4e4bddc83775"
		},
		"dd56e451-0d11-4da7-ba80-f46bb9ff122c": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask12",
			"name": "Mail Confirmación DT",
			"mailDefinitionRef": "362b42c0-c616-40d5-8361-f3271a68ed63"
		},
		"72450d5f-f7a2-4592-ab9f-9d08808fcc0c": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway7",
			"name": "Cambia?",
			"default": "c173bcb3-8946-4263-bd7f-ffd59d817eca"
		},
		"5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway8",
			"name": "Cambia?",
			"default": "48fc4aff-91ce-4cab-80dc-61fdde68fd60"
		},
		"0580dbe2-8980-4a6f-b84c-b45719f860c3": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway9",
			"name": "Cambia?",
			"default": "241d1721-42c7-440a-9de6-466a111d9362"
		},
		"517db4c9-80c0-4ee3-98aa-a4a52f8b5048": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/mailRechazo.js",
			"id": "scripttask12",
			"name": "Mail Rechazo DT"
		},
		"33269cab-d826-4750-bb2f-53d549575c4d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow24",
			"name": "SequenceFlow24",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "2d40c324-2a7f-48e3-981a-1709b84f00f5"
		},
		"4f414550-422d-4446-b5bc-1a462c2a49da": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow25",
			"name": "SequenceFlow25",
			"sourceRef": "2d40c324-2a7f-48e3-981a-1709b84f00f5",
			"targetRef": "3a8734c6-47a7-490a-adfc-4ca55ca26b14"
		},
		"161b1c5c-97cb-4d98-8e6c-8167d5686212": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow31",
			"name": "SequenceFlow31",
			"sourceRef": "f3ce8a84-afc7-4c96-bbb9-a6d929543467",
			"targetRef": "1d3864b6-7448-427f-8534-2d670da38967"
		},
		"947ee500-4860-45c1-88db-0a1a1cc2fa79": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow32",
			"name": "SequenceFlow32",
			"sourceRef": "1d3864b6-7448-427f-8534-2d670da38967",
			"targetRef": "2d40c324-2a7f-48e3-981a-1709b84f00f5"
		},
		"90e607cf-9557-498d-b36b-bdb99d09a066": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow33",
			"name": "SequenceFlow33",
			"sourceRef": "3a8734c6-47a7-490a-adfc-4ca55ca26b14",
			"targetRef": "9ce29cd2-c37c-4f24-8e48-b5bd52634e6e"
		},
		"ee0819b1-4ff7-4cbb-9452-9a4686ad2c83": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow35",
			"name": "SequenceFlow35",
			"sourceRef": "7824abfb-1313-40ee-b17b-0d2090936afb",
			"targetRef": "b7ccd130-694e-420e-b6bf-14efda68b312"
		},
		"f1ff3611-c66c-4fe6-8597-35ecee3b81d6": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow41",
			"name": "SequenceFlow41",
			"sourceRef": "94d5dc29-832f-4340-a424-9341719232a2",
			"targetRef": "e10517c9-fe0c-4257-8320-5a3b55914651"
		},
		"d4999f55-28ad-4da4-978b-3320f4b8d596": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow47",
			"name": "SequenceFlow47",
			"sourceRef": "dd56e451-0d11-4da7-ba80-f46bb9ff122c",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"4d77776a-891e-4397-8148-0186dc6a9f09": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.actionChange==\"X\"}",
			"id": "sequenceflow51",
			"name": "Si",
			"sourceRef": "72450d5f-f7a2-4592-ab9f-9d08808fcc0c",
			"targetRef": "2d40c324-2a7f-48e3-981a-1709b84f00f5"
		},
		"48fc4aff-91ce-4cab-80dc-61fdde68fd60": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow52",
			"name": "No",
			"sourceRef": "5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f",
			"targetRef": "6bdb2534-18f1-4d6b-a033-a753799ba51b"
		},
		"c0a48865-aeea-43a4-955c-716e4060a05e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow53",
			"name": "SequenceFlow53",
			"sourceRef": "9ce29cd2-c37c-4f24-8e48-b5bd52634e6e",
			"targetRef": "72450d5f-f7a2-4592-ab9f-9d08808fcc0c"
		},
		"c173bcb3-8946-4263-bd7f-ffd59d817eca": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow55",
			"name": "No",
			"sourceRef": "72450d5f-f7a2-4592-ab9f-9d08808fcc0c",
			"targetRef": "bec59a50-109a-4e95-824f-c6e840449aff"
		},
		"d9fbc053-f649-443c-8abf-bdf6d568cc9c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow56",
			"name": "No",
			"sourceRef": "bec59a50-109a-4e95-824f-c6e840449aff",
			"targetRef": "1d1d092b-6065-42b0-808e-ca27f2b184c1"
		},
		"de4d8dbe-1c83-4e2b-b753-d5bb8c584eb9": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow57",
			"name": "SequenceFlow57",
			"sourceRef": "82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f",
			"targetRef": "7824abfb-1313-40ee-b17b-0d2090936afb"
		},
		"3684a44c-71db-4b55-bf6e-3691ec52ffc4": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.actionChange==\"X\"}",
			"id": "sequenceflow58",
			"name": "Si",
			"sourceRef": "5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f",
			"targetRef": "82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f"
		},
		"5866b993-7943-41a4-b652-92a596c8c935": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow59",
			"name": "Si",
			"sourceRef": "6bdb2534-18f1-4d6b-a033-a753799ba51b",
			"targetRef": "4aa824cf-5f5f-4394-8bb8-b950ee866628"
		},
		"b08225e4-409f-4079-953a-60ecd3e28944": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow60",
			"name": "SequenceFlow60",
			"sourceRef": "b7ccd130-694e-420e-b6bf-14efda68b312",
			"targetRef": "5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f"
		},
		"8b778da6-4d5d-4de9-856d-a5d0a9c935f3": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow61",
			"name": "SequenceFlow61",
			"sourceRef": "4aa824cf-5f5f-4394-8bb8-b950ee866628",
			"targetRef": "94d5dc29-832f-4340-a424-9341719232a2"
		},
		"487794a0-67de-455f-8288-5b9c81db90ce": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow62",
			"name": "SequenceFlow62",
			"sourceRef": "e10517c9-fe0c-4257-8320-5a3b55914651",
			"targetRef": "0580dbe2-8980-4a6f-b84c-b45719f860c3"
		},
		"66fb38eb-2857-4d4f-b6f5-3df2d6b1d146": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.actionChange==\"X\"}",
			"id": "sequenceflow63",
			"name": "Si",
			"sourceRef": "0580dbe2-8980-4a6f-b84c-b45719f860c3",
			"targetRef": "4aa824cf-5f5f-4394-8bb8-b950ee866628"
		},
		"241d1721-42c7-440a-9de6-466a111d9362": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow64",
			"name": "No",
			"sourceRef": "0580dbe2-8980-4a6f-b84c-b45719f860c3",
			"targetRef": "b8113aef-f992-4307-bbb7-9449ac71b1a1"
		},
		"e4a2ca9c-2c6c-4603-b8aa-4e4bddc83775": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow65",
			"name": "Si",
			"sourceRef": "b8113aef-f992-4307-bbb7-9449ac71b1a1",
			"targetRef": "275ec32e-42f2-44fe-9e2a-a2494d09bff4"
		},
		"68e5140d-ae4a-4942-8fa2-6f33cda457fc": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow66",
			"name": "SequenceFlow66",
			"sourceRef": "275ec32e-42f2-44fe-9e2a-a2494d09bff4",
			"targetRef": "dd56e451-0d11-4da7-ba80-f46bb9ff122c"
		},
		"cc6404af-912b-46e9-8539-b671d97d0054": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow68",
			"name": "Si",
			"sourceRef": "bec59a50-109a-4e95-824f-c6e840449aff",
			"targetRef": "82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f"
		},
		"300e117e-5cd9-4562-9ff0-8c600d7af407": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow69",
			"name": "SequenceFlow69",
			"sourceRef": "517db4c9-80c0-4ee3-98aa-a4a52f8b5048",
			"targetRef": "f3ce8a84-afc7-4c96-bbb9-a6d929543467"
		},
		"4de9e18b-9f3e-436c-b0b4-2e8b09bbd616": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow70",
			"name": "No",
			"sourceRef": "6bdb2534-18f1-4d6b-a033-a753799ba51b",
			"targetRef": "166749dc-ec8b-4698-89c6-447eb4508517"
		},
		"26bd3178-2177-46fb-9a3c-8e34e5022946": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow71",
			"name": "No",
			"sourceRef": "b8113aef-f992-4307-bbb7-9449ac71b1a1",
			"targetRef": "517db4c9-80c0-4ee3-98aa-a4a52f8b5048"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"c4b1bd76-3ec2-4846-9eb0-3f4db85f2357": {},
				"b44b7429-6768-4b79-b0a7-3be8930b413a": {},
				"67f1f73b-d238-48ce-a41f-94c362227b4b": {},
				"cab59bc5-be1d-497a-8a4a-740e6597b85a": {},
				"c7e983ba-e9f2-4bd8-a02d-01686b57eea0": {},
				"f0f89ffd-fb79-42a5-8924-84e6deb57d52": {},
				"eadd77c9-7dd5-41dc-badf-12864f3cf5d5": {},
				"f756c724-61e9-47fc-aa39-1f4e217f4958": {},
				"f01d6fb6-f674-4443-8497-763f90c105e8": {},
				"6be329c1-e59e-4de4-8609-ab4641c81c92": {},
				"69705216-0363-4cae-a659-cf7f4f40ff93": {},
				"c0d5811d-6365-4bcd-afce-d76b09ee2c5d": {},
				"f52eb557-8e88-4c3f-a27f-024177ae2855": {},
				"9127b2bb-e2c1-4a0f-8c65-ec3b20541b29": {},
				"f0f354a7-f6dc-475d-bc6d-acbb01779c4c": {},
				"669ad812-d189-470b-9287-eb9fae3f4b0f": {},
				"9e8520e0-8a3e-4eac-b47f-995fb9797c90": {},
				"939a9fec-5cfa-4e06-9a6f-27bc75406ae9": {},
				"6ebf427e-fc03-4bce-98fa-2bd0830531bf": {},
				"6e2fe580-9c8c-407e-9ca6-0cf10fcbc25a": {},
				"7f0a7946-2970-4914-a0e0-de74c401267f": {},
				"b42df77c-59a0-4850-a915-12934389ad16": {},
				"71083039-32d6-4d03-9063-8cc7f1d4f1e2": {},
				"fe84c092-8a87-4bb9-812d-b5307e5fe403": {},
				"87959a06-8918-4582-a470-5603c188de49": {},
				"0727e488-18d3-47b1-b2f7-853eb4cee6f6": {},
				"fc82ee18-f563-4522-bdc5-d12794b7add8": {},
				"e837f494-2c1e-41fd-8956-59068d0df693": {},
				"a503cc93-62ce-499e-804f-dac459fde48f": {},
				"56502aa5-bde3-437e-a6af-e10544e74ee8": {},
				"6425e520-d45c-4bf1-b0c4-d5fddfe8ba6b": {},
				"26b74c2d-0f22-4e7b-b23f-50b59efc516c": {},
				"5dd18732-f833-431b-b34a-29c105b0406a": {},
				"d75c2006-700d-46e6-906a-88936d366348": {},
				"b4a2dfd3-2293-4c5f-a746-1599f9d3f2ec": {},
				"a1c7fe9c-8d15-47bd-900c-424a13e1f864": {},
				"19d75e55-5430-446b-89be-c7c131b3c95d": {},
				"d4a510bf-14af-43a0-9df0-6d8707a0bb28": {},
				"81fea657-1d8d-4383-a345-5eb0359cf4c7": {},
				"cd9f38ec-d4f3-4c6b-b602-c8ca285d2858": {},
				"d69c1fe9-f0f2-4aaa-a8d1-2797d7b2e611": {},
				"61b6f482-d1f5-43c3-97dd-43ea936c3688": {},
				"a81237e1-cf0b-4111-ac90-e8b3ac28c58e": {},
				"40a55ceb-a615-411b-a558-46a2c6e3d6df": {},
				"b2c1a834-2c07-48ab-89e3-a5e15b5e6455": {},
				"35efee2b-0767-44c4-8ef4-572c874d83ad": {},
				"defc9866-fb83-472d-bcf0-acbe66981cf8": {},
				"78ecad3b-f985-476a-bc5b-d570ad061fb0": {},
				"712f4c8d-430b-4527-bb7f-2422ff50678d": {},
				"284600f8-9204-4585-8384-ddd6cfcafe3b": {},
				"5834b8a8-4827-407d-81c8-f18c39e43f9d": {}
			}
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -136,
			"y": -468,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 612,
			"y": 533,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"c4b1bd76-3ec2-4846-9eb0-3f4db85f2357": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 60,
			"y": -581,
			"width": 100,
			"height": 60,
			"object": "3a8734c6-47a7-490a-adfc-4ca55ca26b14"
		},
		"b44b7429-6768-4b79-b0a7-3be8930b413a": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -30,
			"y": -482,
			"width": 100,
			"height": 60,
			"object": "2d40c324-2a7f-48e3-981a-1709b84f00f5"
		},
		"67f1f73b-d238-48ce-a41f-94c362227b4b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-120,-452 -8,-452",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "b44b7429-6768-4b79-b0a7-3be8930b413a",
			"object": "33269cab-d826-4750-bb2f-53d549575c4d"
		},
		"cab59bc5-be1d-497a-8a4a-740e6597b85a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "20,-452 20,-553 91,-553",
			"sourceSymbol": "b44b7429-6768-4b79-b0a7-3be8930b413a",
			"targetSymbol": "c4b1bd76-3ec2-4846-9eb0-3f4db85f2357",
			"object": "4f414550-422d-4446-b5bc-1a462c2a49da"
		},
		"c7e983ba-e9f2-4bd8-a02d-01686b57eea0": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 211,
			"y": -237,
			"width": 100,
			"height": 60,
			"object": "82d29b4b-e2a9-40d9-b44a-9e771d0e8c7f"
		},
		"f0f89ffd-fb79-42a5-8924-84e6deb57d52": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 239.5,
			"y": -352,
			"object": "bec59a50-109a-4e95-824f-c6e840449aff"
		},
		"eadd77c9-7dd5-41dc-badf-12864f3cf5d5": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": -35,
			"y": -237,
			"width": 100,
			"height": 60,
			"object": "f3ce8a84-afc7-4c96-bbb9-a6d929543467"
		},
		"f756c724-61e9-47fc-aa39-1f4e217f4958": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 403,
			"y": -237,
			"width": 100,
			"height": 60,
			"object": "7824abfb-1313-40ee-b17b-0d2090936afb"
		},
		"f01d6fb6-f674-4443-8497-763f90c105e8": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": -35,
			"y": -361,
			"width": 100,
			"height": 60,
			"object": "1d3864b6-7448-427f-8534-2d670da38967"
		},
		"6be329c1-e59e-4de4-8609-ab4641c81c92": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "15,-207 15,-301.5",
			"sourceSymbol": "eadd77c9-7dd5-41dc-badf-12864f3cf5d5",
			"targetSymbol": "f01d6fb6-f674-4443-8497-763f90c105e8",
			"object": "161b1c5c-97cb-4d98-8e6c-8167d5686212"
		},
		"69705216-0363-4cae-a659-cf7f4f40ff93": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "17.5,-331 17.5,-422.5",
			"sourceSymbol": "f01d6fb6-f674-4443-8497-763f90c105e8",
			"targetSymbol": "b44b7429-6768-4b79-b0a7-3be8930b413a",
			"object": "947ee500-4860-45c1-88db-0a1a1cc2fa79"
		},
		"c0d5811d-6365-4bcd-afce-d76b09ee2c5d": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 211,
			"y": -581,
			"width": 100,
			"height": 60,
			"object": "9ce29cd2-c37c-4f24-8e48-b5bd52634e6e"
		},
		"f52eb557-8e88-4c3f-a27f-024177ae2855": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "110,-554.5 261,-554.5",
			"sourceSymbol": "c4b1bd76-3ec2-4846-9eb0-3f4db85f2357",
			"targetSymbol": "c0d5811d-6365-4bcd-afce-d76b09ee2c5d",
			"object": "90e607cf-9557-498d-b36b-bdb99d09a066"
		},
		"9127b2bb-e2c1-4a0f-8c65-ec3b20541b29": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 580,
			"y": -237,
			"width": 100,
			"height": 60,
			"object": "b7ccd130-694e-420e-b6bf-14efda68b312"
		},
		"f0f354a7-f6dc-475d-bc6d-acbb01779c4c": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "453,-207 630,-207",
			"sourceSymbol": "f756c724-61e9-47fc-aa39-1f4e217f4958",
			"targetSymbol": "9127b2bb-e2c1-4a0f-8c65-ec3b20541b29",
			"object": "ee0819b1-4ff7-4cbb-9452-9a4686ad2c83"
		},
		"669ad812-d189-470b-9287-eb9fae3f4b0f": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 211,
			"y": 148,
			"width": 100,
			"height": 60,
			"object": "4aa824cf-5f5f-4394-8bb8-b950ee866628"
		},
		"9e8520e0-8a3e-4eac-b47f-995fb9797c90": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 239.5,
			"y": 30,
			"object": "6bdb2534-18f1-4d6b-a033-a753799ba51b"
		},
		"939a9fec-5cfa-4e06-9a6f-27bc75406ae9": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 403,
			"y": 148,
			"width": 100,
			"height": 60,
			"object": "94d5dc29-832f-4340-a424-9341719232a2"
		},
		"6ebf427e-fc03-4bce-98fa-2bd0830531bf": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "455.375,177.875 627.375,177.875",
			"sourceSymbol": "939a9fec-5cfa-4e06-9a6f-27bc75406ae9",
			"targetSymbol": "6e2fe580-9c8c-407e-9ca6-0cf10fcbc25a",
			"object": "f1ff3611-c66c-4fe6-8597-35ecee3b81d6"
		},
		"6e2fe580-9c8c-407e-9ca6-0cf10fcbc25a": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 579.75,
			"y": 147.75,
			"width": 100,
			"height": 60,
			"object": "e10517c9-fe0c-4257-8320-5a3b55914651"
		},
		"7f0a7946-2970-4914-a0e0-de74c401267f": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 210.75,
			"y": 520.75,
			"width": 100,
			"height": 60,
			"object": "275ec32e-42f2-44fe-9e2a-a2494d09bff4"
		},
		"b42df77c-59a0-4850-a915-12934389ad16": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 240.25,
			"y": 406.75,
			"object": "b8113aef-f992-4307-bbb7-9449ac71b1a1"
		},
		"71083039-32d6-4d03-9063-8cc7f1d4f1e2": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 403,
			"y": 521,
			"width": 100,
			"height": 60,
			"object": "dd56e451-0d11-4da7-ba80-f46bb9ff122c"
		},
		"fe84c092-8a87-4bb9-812d-b5307e5fe403": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "450.5,553 632.5,553",
			"sourceSymbol": "71083039-32d6-4d03-9063-8cc7f1d4f1e2",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "d4999f55-28ad-4da4-978b-3320f4b8d596"
		},
		"87959a06-8918-4582-a470-5603c188de49": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 239.75,
			"y": -472.75,
			"object": "72450d5f-f7a2-4592-ab9f-9d08808fcc0c"
		},
		"0727e488-18d3-47b1-b2f7-853eb4cee6f6": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.75,-451.84375 69.5,-451.84375",
			"sourceSymbol": "87959a06-8918-4582-a470-5603c188de49",
			"targetSymbol": "b44b7429-6768-4b79-b0a7-3be8930b413a",
			"object": "4d77776a-891e-4397-8148-0186dc6a9f09"
		},
		"fc82ee18-f563-4522-bdc5-d12794b7add8": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 239.75,
			"y": -88.25,
			"object": "5cb1b0e3-213d-4e84-91e2-3e75dcc5f47f"
		},
		"e837f494-2c1e-41fd-8956-59068d0df693": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260,-67.25 260,51",
			"sourceSymbol": "fc82ee18-f563-4522-bdc5-d12794b7add8",
			"targetSymbol": "9e8520e0-8a3e-4eac-b47f-995fb9797c90",
			"object": "48fc4aff-91ce-4cab-80dc-61fdde68fd60"
		},
		"a503cc93-62ce-499e-804f-dac459fde48f": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261,-551 261,-451.75",
			"sourceSymbol": "c0d5811d-6365-4bcd-afce-d76b09ee2c5d",
			"targetSymbol": "87959a06-8918-4582-a470-5603c188de49",
			"object": "c0a48865-aeea-43a4-955c-716e4060a05e"
		},
		"56502aa5-bde3-437e-a6af-e10544e74ee8": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260,-451.75 260,-331",
			"sourceSymbol": "87959a06-8918-4582-a470-5603c188de49",
			"targetSymbol": "f0f89ffd-fb79-42a5-8924-84e6deb57d52",
			"object": "c173bcb3-8946-4263-bd7f-ffd59d817eca"
		},
		"6425e520-d45c-4bf1-b0c4-d5fddfe8ba6b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.5,-331 260.5,-273.5 146,-273.5 146,-207",
			"sourceSymbol": "f0f89ffd-fb79-42a5-8924-84e6deb57d52",
			"targetSymbol": "78ecad3b-f985-476a-bc5b-d570ad061fb0",
			"object": "d9fbc053-f649-443c-8abf-bdf6d568cc9c"
		},
		"26b74c2d-0f22-4e7b-b23f-50b59efc516c": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261,-206.25 453,-206.25",
			"sourceSymbol": "c7e983ba-e9f2-4bd8-a02d-01686b57eea0",
			"targetSymbol": "f756c724-61e9-47fc-aa39-1f4e217f4958",
			"object": "de4d8dbe-1c83-4e2b-b753-d5bb8c584eb9"
		},
		"5dd18732-f833-431b-b34a-29c105b0406a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.875,-67.25 260.875,-207",
			"sourceSymbol": "fc82ee18-f563-4522-bdc5-d12794b7add8",
			"targetSymbol": "c7e983ba-e9f2-4bd8-a02d-01686b57eea0",
			"object": "3684a44c-71db-4b55-bf6e-3691ec52ffc4"
		},
		"d75c2006-700d-46e6-906a-88936d366348": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.5,51 260.5,207.5",
			"sourceSymbol": "9e8520e0-8a3e-4eac-b47f-995fb9797c90",
			"targetSymbol": "669ad812-d189-470b-9287-eb9fae3f4b0f",
			"object": "5866b993-7943-41a4-b652-92a596c8c935"
		},
		"b4a2dfd3-2293-4c5f-a746-1599f9d3f2ec": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "628,-207.125 628,-67.125 281.25,-67.125",
			"sourceSymbol": "9127b2bb-e2c1-4a0f-8c65-ec3b20541b29",
			"targetSymbol": "fc82ee18-f563-4522-bdc5-d12794b7add8",
			"object": "b08225e4-409f-4079-953a-60ecd3e28944"
		},
		"a1c7fe9c-8d15-47bd-900c-424a13e1f864": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261,178 403.5,178",
			"sourceSymbol": "669ad812-d189-470b-9287-eb9fae3f4b0f",
			"targetSymbol": "939a9fec-5cfa-4e06-9a6f-27bc75406ae9",
			"object": "8b778da6-4d5d-4de9-856d-a5d0a9c935f3"
		},
		"19d75e55-5430-446b-89be-c7c131b3c95d": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 240.25,
			"y": 278.75,
			"object": "0580dbe2-8980-4a6f-b84c-b45719f860c3"
		},
		"d4a510bf-14af-43a0-9df0-6d8707a0bb28": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "630,177.75 630,299.75 261.25,299.75",
			"sourceSymbol": "6e2fe580-9c8c-407e-9ca6-0cf10fcbc25a",
			"targetSymbol": "19d75e55-5430-446b-89be-c7c131b3c95d",
			"object": "487794a0-67de-455f-8288-5b9c81db90ce"
		},
		"81fea657-1d8d-4383-a345-5eb0359cf4c7": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261.25,299.75 261.25,203",
			"sourceSymbol": "19d75e55-5430-446b-89be-c7c131b3c95d",
			"targetSymbol": "669ad812-d189-470b-9287-eb9fae3f4b0f",
			"object": "66fb38eb-2857-4d4f-b6f5-3df2d6b1d146"
		},
		"cd9f38ec-d4f3-4c6b-b602-c8ca285d2858": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261.25,299.75 261.25,407.25",
			"sourceSymbol": "19d75e55-5430-446b-89be-c7c131b3c95d",
			"targetSymbol": "b42df77c-59a0-4850-a915-12934389ad16",
			"object": "241d1721-42c7-440a-9de6-466a111d9362"
		},
		"d69c1fe9-f0f2-4aaa-a8d1-2797d7b2e611": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261.25,427.75 261.25,528",
			"sourceSymbol": "b42df77c-59a0-4850-a915-12934389ad16",
			"targetSymbol": "7f0a7946-2970-4914-a0e0-de74c401267f",
			"object": "e4a2ca9c-2c6c-4603-b8aa-4e4bddc83775"
		},
		"61b6f482-d1f5-43c3-97dd-43ea936c3688": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.75,550.75 433,550.75",
			"sourceSymbol": "7f0a7946-2970-4914-a0e0-de74c401267f",
			"targetSymbol": "71083039-32d6-4d03-9063-8cc7f1d4f1e2",
			"object": "68e5140d-ae4a-4942-8fa2-6f33cda457fc"
		},
		"a81237e1-cf0b-4111-ac90-e8b3ac28c58e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -29.625,
			"y": -96.75,
			"width": 100,
			"height": 60,
			"object": "517db4c9-80c0-4ee3-98aa-a4a52f8b5048"
		},
		"40a55ceb-a615-411b-a558-46a2c6e3d6df": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.5,-331 260.5,-226",
			"sourceSymbol": "f0f89ffd-fb79-42a5-8924-84e6deb57d52",
			"targetSymbol": "c7e983ba-e9f2-4bd8-a02d-01686b57eea0",
			"object": "cc6404af-912b-46e9-8539-b671d97d0054"
		},
		"b2c1a834-2c07-48ab-89e3-a5e15b5e6455": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "17.6875,-66.75 17.6875,-177.5",
			"sourceSymbol": "a81237e1-cf0b-4111-ac90-e8b3ac28c58e",
			"targetSymbol": "eadd77c9-7dd5-41dc-badf-12864f3cf5d5",
			"object": "300e117e-5cd9-4562-9ff0-8c600d7af407"
		},
		"35efee2b-0767-44c4-8ef4-572c874d83ad": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "260.5,51 146,51",
			"sourceSymbol": "9e8520e0-8a3e-4eac-b47f-995fb9797c90",
			"targetSymbol": "284600f8-9204-4585-8384-ddd6cfcafe3b",
			"object": "4de9e18b-9f3e-436c-b0b4-2e8b09bbd616"
		},
		"defc9866-fb83-472d-bcf0-acbe66981cf8": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "261.25,427.75 20.6875,427.75 20.6875,-37.25",
			"sourceSymbol": "b42df77c-59a0-4850-a915-12934389ad16",
			"targetSymbol": "a81237e1-cf0b-4111-ac90-e8b3ac28c58e",
			"object": "26bd3178-2177-46fb-9a3c-8e34e5022946"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 9,
			"sequenceflow": 73,
			"startevent": 2,
			"endevent": 1,
			"usertask": 8,
			"scripttask": 14,
			"mailtask": 12,
			"exclusivegateway": 9
		},
		"d5493338-aad3-43c5-b8fb-9dc2a248633c": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition5",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/AprobacionMd/mail.html",
			"id": "maildefinition5"
		},
		"cf69a99d-6c4b-4dc7-a107-7a87d1d64273": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition6",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/AprobacionMd/mail.html",
			"id": "maildefinition6"
		},
		"698fd6d8-a84b-485d-9da4-42580701ed0d": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition7",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/AprobacionMd/mail.html",
			"id": "maildefinition7"
		},
		"3c738c69-708f-481c-9021-6e8d6eb3f3ec": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition8",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/AprobacionMd/mail.html",
			"id": "maildefinition8"
		},
		"362b42c0-c616-40d5-8361-f3271a68ed63": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition9",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/AprobacionMd/mail.html",
			"id": "maildefinition9"
		},
		"1d1d092b-6065-42b0-808e-ca27f2b184c1": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/obtenerRolJP.js",
			"id": "scripttask13",
			"name": "ObtenerRol"
		},
		"78ecad3b-f985-476a-bc5b-d570ad061fb0": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 96,
			"y": -237,
			"width": 100,
			"height": 60,
			"object": "1d1d092b-6065-42b0-808e-ca27f2b184c1"
		},
		"e895151e-dc14-43e3-90c7-d544126ecb4f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow72",
			"name": "SequenceFlow72",
			"sourceRef": "1d1d092b-6065-42b0-808e-ca27f2b184c1",
			"targetRef": "517db4c9-80c0-4ee3-98aa-a4a52f8b5048"
		},
		"712f4c8d-430b-4527-bb7f-2422ff50678d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "146,-207 146,-136.625 20.375,-136.625 20.375,-66.75",
			"sourceSymbol": "78ecad3b-f985-476a-bc5b-d570ad061fb0",
			"targetSymbol": "a81237e1-cf0b-4111-ac90-e8b3ac28c58e",
			"object": "e895151e-dc14-43e3-90c7-d544126ecb4f"
		},
		"166749dc-ec8b-4698-89c6-447eb4508517": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/AprobacionMd/obtenerRolGP.js",
			"id": "scripttask14",
			"name": "ObtenerRol"
		},
		"284600f8-9204-4585-8384-ddd6cfcafe3b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 96,
			"y": 21,
			"width": 100,
			"height": 60,
			"object": "166749dc-ec8b-4698-89c6-447eb4508517"
		},
		"e1528290-28de-4dd4-bde6-0f89f72b6ada": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow73",
			"name": "SequenceFlow73",
			"sourceRef": "166749dc-ec8b-4698-89c6-447eb4508517",
			"targetRef": "517db4c9-80c0-4ee3-98aa-a4a52f8b5048"
		},
		"5834b8a8-4827-407d-81c8-f18c39e43f9d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "146,51 82.9375,51 82.9375,-66.75 20.375,-66.75",
			"sourceSymbol": "284600f8-9204-4585-8384-ddd6cfcafe3b",
			"targetSymbol": "a81237e1-cf0b-4111-ac90-e8b3ac28c58e",
			"object": "e1528290-28de-4dd4-bde6-0f89f72b6ada"
		}
	}
}