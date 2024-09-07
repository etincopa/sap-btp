{
	"contents": {
		"ecfd6dde-47ee-4096-b0a9-1eb258ae53f3": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "mif.rmd.solicitudrmd",
			"subject": "SolicitudRmd",
			"name": "SolicitudRmd",
			"documentation": "Workflow de aprobación para la solucitud",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "StartEvent1"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"e67c329d-3a94-4547-b17e-04a3a4118d78": {
					"name": "Mail Solicitud"
				},
				"522f6d27-9810-4933-9393-e9314d72ee94": {
					"name": "Datos Email Aprobadores"
				},
				"ba6ddc61-7881-41ee-9f32-b732a18c5538": {
					"name": "Aprueba?"
				},
				"c1248fe6-5675-4511-a02b-f2a56b4eb4ac": {
					"name": "Reenvio de Solicitud"
				},
				"93de821a-90b9-49a1-bcb7-66bff520abf6": {
					"name": "Aprobador Documentación Técnica"
				},
				"6162f2b8-84ee-45b2-a023-57a66d12cf1e": {
					"name": "Mail Jefe"
				},
				"f98a32a0-9dad-48e6-8efb-793b61625a58": {
					"name": "Mail Aprobación"
				},
				"a643d3fa-570b-47a1-9182-12abe47cb76b": {
					"name": "Mail Jefe"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"14874bc8-ce40-48d4-a90c-c3550441fbc8": {
					"name": "SequenceFlow3"
				},
				"ba78ec1f-3b35-4da6-ae74-abb4962ff47b": {
					"name": "Sí"
				},
				"3369bd5b-99d8-4827-9fb9-2a8f73cf136c": {
					"name": "SequenceFlow7"
				},
				"55c3f325-ec8f-4efe-be90-063c56367dc6": {
					"name": "SequenceFlow8"
				},
				"09517e4a-8659-43ab-8f96-e8cec345a887": {
					"name": "SequenceFlow9"
				},
				"3faed44d-5ea6-4e48-b1a0-7948a4a1da36": {
					"name": "No"
				},
				"77f255bf-7f99-4eeb-8a93-0f69237fb813": {
					"name": "SequenceFlow20"
				},
				"29920416-e1ba-4474-8a9b-391b64bf799d": {
					"name": "SequenceFlow22"
				},
				"24d91785-8fa6-4577-b40d-f3d48184fda6": {
					"name": "SequenceFlow23"
				}
			},
			"diagrams": {
				"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {}
			}
		},
		"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1"
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"e67c329d-3a94-4547-b17e-04a3a4118d78": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "Mail Solicitud",
			"mailDefinitionRef": "90a62365-afa0-436a-bc9a-0b676252ad7f"
		},
		"522f6d27-9810-4933-9393-e9314d72ee94": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/SolicitudRmd/mail.js",
			"id": "scripttask2",
			"name": "Datos Email Aprobadores"
		},
		"ba6ddc61-7881-41ee-9f32-b732a18c5538": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "Aprueba?",
			"default": "ba78ec1f-3b35-4da6-ae74-abb4962ff47b"
		},
		"c1248fe6-5675-4511-a02b-f2a56b4eb4ac": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Modificar datos",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.requestUserData.EMAIL}",
			"id": "usertask1",
			"name": "Reenvio de Solicitud"
		},
		"93de821a-90b9-49a1-bcb7-66bff520abf6": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Aprobación DT",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://rmdservice.mifrmdsolicitud/mif.rmd.solicitud",
			"recipientUsers": "${context.mail}",
			"id": "usertask2",
			"name": "Aprobador Documentación Técnica"
		},
		"6162f2b8-84ee-45b2-a023-57a66d12cf1e": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask3",
			"name": "Mail Jefe",
			"mailDefinitionRef": "c24a9877-49b8-4b12-b83d-b0efbac69c5e"
		},
		"f98a32a0-9dad-48e6-8efb-793b61625a58": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/SolicitudRmd/mailAprobacion.js",
			"id": "scripttask5",
			"name": "Mail Aprobación"
		},
		"a643d3fa-570b-47a1-9182-12abe47cb76b": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask7",
			"name": "Mail Jefe",
			"mailDefinitionRef": "1404e271-3337-4784-a046-cf0206736e2a"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "522f6d27-9810-4933-9393-e9314d72ee94"
		},
		"14874bc8-ce40-48d4-a90c-c3550441fbc8": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "522f6d27-9810-4933-9393-e9314d72ee94",
			"targetRef": "e67c329d-3a94-4547-b17e-04a3a4118d78"
		},
		"ba78ec1f-3b35-4da6-ae74-abb4962ff47b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "Sí",
			"sourceRef": "ba6ddc61-7881-41ee-9f32-b732a18c5538",
			"targetRef": "6162f2b8-84ee-45b2-a023-57a66d12cf1e"
		},
		"3369bd5b-99d8-4827-9fb9-2a8f73cf136c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "c1248fe6-5675-4511-a02b-f2a56b4eb4ac",
			"targetRef": "522f6d27-9810-4933-9393-e9314d72ee94"
		},
		"55c3f325-ec8f-4efe-be90-063c56367dc6": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow8",
			"name": "SequenceFlow8",
			"sourceRef": "e67c329d-3a94-4547-b17e-04a3a4118d78",
			"targetRef": "93de821a-90b9-49a1-bcb7-66bff520abf6"
		},
		"09517e4a-8659-43ab-8f96-e8cec345a887": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "SequenceFlow9",
			"sourceRef": "93de821a-90b9-49a1-bcb7-66bff520abf6",
			"targetRef": "f98a32a0-9dad-48e6-8efb-793b61625a58"
		},
		"3faed44d-5ea6-4e48-b1a0-7948a4a1da36": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.action=='R'}",
			"id": "sequenceflow19",
			"name": "No",
			"sourceRef": "ba6ddc61-7881-41ee-9f32-b732a18c5538",
			"targetRef": "a643d3fa-570b-47a1-9182-12abe47cb76b"
		},
		"77f255bf-7f99-4eeb-8a93-0f69237fb813": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow20",
			"name": "SequenceFlow20",
			"sourceRef": "f98a32a0-9dad-48e6-8efb-793b61625a58",
			"targetRef": "ba6ddc61-7881-41ee-9f32-b732a18c5538"
		},
		"29920416-e1ba-4474-8a9b-391b64bf799d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow22",
			"name": "SequenceFlow22",
			"sourceRef": "a643d3fa-570b-47a1-9182-12abe47cb76b",
			"targetRef": "c1248fe6-5675-4511-a02b-f2a56b4eb4ac"
		},
		"24d91785-8fa6-4577-b40d-f3d48184fda6": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow23",
			"name": "SequenceFlow23",
			"sourceRef": "6162f2b8-84ee-45b2-a023-57a66d12cf1e",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"64bcaa33-3a2d-4208-bcd8-b78755271cd3": {},
				"31b78f35-9502-4bdb-b477-fbe8f7bc0492": {},
				"279e1c9e-7948-468e-a4ef-9fb416c10621": {},
				"2c0a157b-8ed1-4a72-862d-da4f99953f43": {},
				"22007a45-e093-4219-9635-1fd468fb3682": {},
				"0ef61b29-412c-4367-b4fe-d8870b4d9388": {},
				"e7497370-0b5f-4f8c-8df5-7ff1d134c133": {},
				"34f6cc47-8bda-4ab8-99d4-1a68fb4d7471": {},
				"39e7a730-f89b-454e-8899-624dd82cd266": {},
				"e6d0795d-b467-46e0-852d-c3c514accf36": {},
				"71758dc5-9f56-40a6-b030-3e24e2661a9c": {},
				"c908024b-1063-4e77-8983-9787d5407604": {},
				"455d5916-9475-47e3-a440-4ab2bf820cee": {},
				"a7944ffe-f7a4-4203-a40f-0c0380ce032e": {},
				"6a820c96-0a6b-4d4b-92f8-08deeba99599": {},
				"dc4b9907-49d7-49d0-91c0-52f3fda48b9b": {},
				"629b9a82-a767-49e8-9ec9-9ddc5e830d0a": {}
			}
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -132,
			"y": -63,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 406,
			"y": -165,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-116,-47 -116,-147",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "31b78f35-9502-4bdb-b477-fbe8f7bc0492",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"64bcaa33-3a2d-4208-bcd8-b78755271cd3": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": -165.9658930178893,
			"y": -391.25,
			"width": 100,
			"height": 60,
			"object": "e67c329d-3a94-4547-b17e-04a3a4118d78"
		},
		"31b78f35-9502-4bdb-b477-fbe8f7bc0492": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -166,
			"y": -177,
			"width": 100,
			"height": 60,
			"object": "522f6d27-9810-4933-9393-e9314d72ee94"
		},
		"279e1c9e-7948-468e-a4ef-9fb416c10621": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-115.98294650894465,-147.125 -115.98294650894465,-361.125",
			"sourceSymbol": "31b78f35-9502-4bdb-b477-fbe8f7bc0492",
			"targetSymbol": "64bcaa33-3a2d-4208-bcd8-b78755271cd3",
			"object": "14874bc8-ce40-48d4-a90c-c3550441fbc8"
		},
		"2c0a157b-8ed1-4a72-862d-da4f99953f43": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 236,
			"y": -275,
			"object": "ba6ddc61-7881-41ee-9f32-b732a18c5538"
		},
		"22007a45-e093-4219-9635-1fd468fb3682": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "257,-254 424,-254",
			"sourceSymbol": "2c0a157b-8ed1-4a72-862d-da4f99953f43",
			"targetSymbol": "71758dc5-9f56-40a6-b030-3e24e2661a9c",
			"object": "ba78ec1f-3b35-4da6-ae74-abb4962ff47b"
		},
		"0ef61b29-412c-4367-b4fe-d8870b4d9388": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 51,
			"y": -177,
			"width": 100,
			"height": 60,
			"object": "c1248fe6-5675-4511-a02b-f2a56b4eb4ac"
		},
		"e7497370-0b5f-4f8c-8df5-7ff1d134c133": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "101,-147 -116,-147",
			"sourceSymbol": "0ef61b29-412c-4367-b4fe-d8870b4d9388",
			"targetSymbol": "31b78f35-9502-4bdb-b477-fbe8f7bc0492",
			"object": "3369bd5b-99d8-4827-9fb9-2a8f73cf136c"
		},
		"34f6cc47-8bda-4ab8-99d4-1a68fb4d7471": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 39,
			"y": -391,
			"width": 100,
			"height": 60,
			"object": "93de821a-90b9-49a1-bcb7-66bff520abf6"
		},
		"39e7a730-f89b-454e-8899-624dd82cd266": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-115.48294650894465,-360.875 89.51705349105535,-360.875",
			"sourceSymbol": "64bcaa33-3a2d-4208-bcd8-b78755271cd3",
			"targetSymbol": "34f6cc47-8bda-4ab8-99d4-1a68fb4d7471",
			"object": "55c3f325-ec8f-4efe-be90-063c56367dc6"
		},
		"e6d0795d-b467-46e0-852d-c3c514accf36": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "93,-361 254,-361",
			"sourceSymbol": "34f6cc47-8bda-4ab8-99d4-1a68fb4d7471",
			"targetSymbol": "455d5916-9475-47e3-a440-4ab2bf820cee",
			"object": "09517e4a-8659-43ab-8f96-e8cec345a887"
		},
		"71758dc5-9f56-40a6-b030-3e24e2661a9c": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 374,
			"y": -284,
			"width": 100,
			"height": 60,
			"object": "6162f2b8-84ee-45b2-a023-57a66d12cf1e"
		},
		"c908024b-1063-4e77-8983-9787d5407604": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "257,-254 101,-254",
			"sourceSymbol": "2c0a157b-8ed1-4a72-862d-da4f99953f43",
			"targetSymbol": "6a820c96-0a6b-4d4b-92f8-08deeba99599",
			"object": "3faed44d-5ea6-4e48-b1a0-7948a4a1da36"
		},
		"455d5916-9475-47e3-a440-4ab2bf820cee": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 207,
			"y": -391,
			"width": 100,
			"height": 60,
			"object": "f98a32a0-9dad-48e6-8efb-793b61625a58"
		},
		"a7944ffe-f7a4-4203-a40f-0c0380ce032e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "259,-361 259,-254",
			"sourceSymbol": "455d5916-9475-47e3-a440-4ab2bf820cee",
			"targetSymbol": "2c0a157b-8ed1-4a72-862d-da4f99953f43",
			"object": "77f255bf-7f99-4eeb-8a93-0f69237fb813"
		},
		"6a820c96-0a6b-4d4b-92f8-08deeba99599": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 51,
			"y": -284,
			"width": 100,
			"height": 60,
			"object": "a643d3fa-570b-47a1-9182-12abe47cb76b"
		},
		"dc4b9907-49d7-49d0-91c0-52f3fda48b9b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "101,-254 101,-147",
			"sourceSymbol": "6a820c96-0a6b-4d4b-92f8-08deeba99599",
			"targetSymbol": "0ef61b29-412c-4367-b4fe-d8870b4d9388",
			"object": "29920416-e1ba-4474-8a9b-391b64bf799d"
		},
		"629b9a82-a767-49e8-9ec9-9ddc5e830d0a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "423.75,-241 423.75,-164.5",
			"sourceSymbol": "71758dc5-9f56-40a6-b030-3e24e2661a9c",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "24d91785-8fa6-4577-b40d-f3d48184fda6"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 4,
			"sequenceflow": 23,
			"startevent": 2,
			"endevent": 1,
			"usertask": 4,
			"scripttask": 6,
			"mailtask": 7,
			"exclusivegateway": 2
		},
		"90a62365-afa0-436a-bc9a-0b676252ad7f": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.mail}",
			"subject": "${context.subject}",
			"reference": "/webcontent/SolicitudRmd/mail.html",
			"id": "maildefinition1"
		},
		"c24a9877-49b8-4b12-b83d-b0efbac69c5e": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.requestUserData.EMAIL}",
			"subject": "${context.subject}",
			"reference": "/webcontent/SolicitudRmd/mail.html",
			"id": "maildefinition2"
		},
		"1404e271-3337-4784-a046-cf0206736e2a": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition4",
			"to": "${context.requestUserData.EMAIL}",
			"subject": "${context.subject}",
			"reference": "/webcontent/SolicitudRmd/mail.html",
			"id": "maildefinition4"
		}
	}
}