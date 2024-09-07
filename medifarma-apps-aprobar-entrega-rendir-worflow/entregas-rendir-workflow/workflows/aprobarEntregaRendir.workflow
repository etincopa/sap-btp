{
	"contents": {
		"49b1082c-d8b8-4ad9-a590-04027276f9d9": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "aprobarentregarendir",
			"subject": "aprobarEntregaRendir",
			"name": "aprobarEntregaRendir",
			"lastIds": "99748e33-aa0e-4fc8-90fb-b68abf130f73",
			"events": {
				"121f8e83-0c4c-486f-860e-9a7e3fcb3ed4": {
					"name": "Start"
				},
				"2f1e456c-8da5-40a6-a58b-2b0b84a39571": {
					"name": "Fin"
				}
			},
			"activities": {
				"3408b990-e3a4-4c6e-ad00-daf39299b5fa": {
					"name": "Aprobacion Primer Nivel"
				},
				"8af01f8a-37ff-466a-9fe9-b4f23162aa1d": {
					"name": "Get Aprobador Primer Nivel"
				},
				"2d7427fa-c02f-49c5-ba5b-a1f088bd8248": {
					"name": "ScriptFormatDataInicial"
				},
				"664b1c1a-37de-44a9-92dd-95480b8a96e6": {
					"name": "Inicio Tareas Paralelas"
				},
				"d9090cb5-e60d-4e92-8426-df3afdaeac89": {
					"name": "Enviar Correo Aprobador SRV"
				},
				"6149c6ed-3a6b-4ea6-85bc-f616e73d19d4": {
					"name": "Fin Tareas Paralelas"
				},
				"96e0af3c-9f00-4384-ad19-3212dd05126f": {
					"name": "¿Aprueba?"
				},
				"d3b199b8-ff69-4845-87ac-bee227c5d341": {
					"name": "ScriptFormatDatosAprobacion"
				},
				"ce48f3f6-cc1f-434f-b33c-fcae0936f28b": {
					"name": "ScriptFormatDatosRechazo"
				},
				"49e33d6e-ca44-43c3-b85f-ce5db1fe6aa1": {
					"name": "Aprobar Documento SRV"
				},
				"0ec62cc7-b6e5-47de-89fe-206d34ae2582": {
					"name": "Rechazar Documento SRV"
				},
				"b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1": {
					"name": "Enviar Correo Aprobacion SRV"
				},
				"dc275e60-2c09-400c-8e9e-1136dc0048d9": {
					"name": "Enviar Correo Rechazo SRV"
				},
				"24b2c416-1fb5-4658-98cc-30a82339ff0e": {
					"name": "Get Aprobador Segundo Nivel"
				},
				"b4914596-7f21-47bf-9eb5-2989bfa170e3": {
					"name": "¿Es Segundo Nivel Aprob?"
				},
				"15135068-1799-4a78-9650-698e99f5b495": {
					"name": "ScriptURIAprobadoresPrimerNivel"
				},
				"e8cc9625-1462-40ab-9bfa-ae574378e0ae": {
					"name": "ScriptURIAprobadoresSegundoNivel"
				},
				"6887f9d4-cab6-48fb-800d-dfe9ca9c92ab": {
					"name": "Migration"
				},
				"07ae634f-2740-463a-b1e9-3badb1f12fef": {
					"name": "dummy"
				},
				"6c94981a-1bd9-4caf-9a7c-6a792567c065": {
					"name": "¿Es natural o migrado?"
				},
				"2ded3fa1-2a36-4ef2-b398-cdb06244e6b1": {
					"name": "¿En qué paso se quedó?"
				},
				"9437813f-10ec-4bd8-a902-b8f074436e62": {
					"name": "¿Es solicitud?"
				},
				"03a909e0-0368-4a55-8cef-c9a7794bcde9": {
					"name": "¿Es Tercer Nivel Aprobador?"
				},
				"5bac4cf4-c285-4a29-a56b-831d983257c7": {
					"name": "ScriptUriAprobadoresTercerNivel"
				},
				"69a5919e-b647-4b7c-964f-c07d29e612c7": {
					"name": "Get Aprobador Tercer Nivel"
				},
				"23152245-c457-457c-93ee-d60bb9b42f41": {
					"name": "¿Solicitud o Gasto?"
				},
				"484de94e-df0b-4b0e-b155-5175d7566505": {
					"name": "Compensar"
				},
				"0eb649cd-af34-4606-b675-b8a7a9a24f11": {
					"name": "Compensar Documento Gasto"
				}
			},
			"sequenceFlows": {
				"c17668dd-0fc8-4543-9b75-c5ab49b9643d": {
					"name": "SequenceFlow3"
				},
				"db04cbc4-5d0d-419b-bb3c-5ad1a4861316": {
					"name": "SequenceFlow5"
				},
				"aaec7833-d182-4052-8c50-f845ffbc13d9": {
					"name": "SequenceFlow6"
				},
				"90ce8541-cb7d-4515-a260-b1982ea4a801": {
					"name": "SequenceFlow7"
				},
				"c59c57df-98ab-4744-bc1b-f942592bacf2": {
					"name": "SequenceFlow8"
				},
				"831cb552-15f7-46f5-9c74-f925ac3e3423": {
					"name": "Rachazado"
				},
				"6e4ef4f3-9b50-4e83-b83a-12ff75081de1": {
					"name": "SequenceFlow10"
				},
				"a9d6470c-910e-4c3d-aa8d-82df6b3e3d1a": {
					"name": "SequenceFlow13"
				},
				"75df497a-4eb1-417c-81c6-cdd22b02bc4a": {
					"name": "SequenceFlow16"
				},
				"6142deaf-57a7-457b-b4f6-54b7153ee529": {
					"name": "SequenceFlow17"
				},
				"75730339-bd92-4917-b9aa-e93f30791443": {
					"name": "SequenceFlow18"
				},
				"c21d9085-b31c-4dff-873e-8425e1cc2e0c": {
					"name": "SequenceFlow19"
				},
				"50a9c608-57cb-4c4b-b787-742cd976f4ca": {
					"name": "SequenceFlow20"
				},
				"322f8fb1-55bd-4181-aa4e-ba40713d7108": {
					"name": "SequenceFlow29"
				},
				"a5a7507d-991e-4dcc-9e9d-9ea3820b4f40": {
					"name": "SequenceFlow33"
				},
				"aa364a26-200e-4219-bd80-df77cef69737": {
					"name": "Sí"
				},
				"b13544c7-b54b-4b96-9c69-efdb6ba22cca": {
					"name": "SequenceFlow36"
				},
				"27a8506c-5b6a-468d-9612-1cf4b982ab04": {
					"name": "SequenceFlow41"
				},
				"2c1e16b3-07c3-45af-bfa0-160234ef3930": {
					"name": "SequenceFlow42"
				},
				"76c15169-e903-4cea-98e1-38bbffa93c92": {
					"name": "Migrado"
				},
				"9675a208-d6ba-409c-b33e-6429421dc9e0": {
					"name": "Natural"
				},
				"68f04c3d-408b-4ad0-9e81-d1710b3073e9": {
					"name": "SequenceFlow45"
				},
				"39c175e3-29f9-4eb9-b15b-7273be3a3544": {
					"name": "SequenceFlow46"
				},
				"42ac9c72-6888-4cba-9d23-c7ca966d24a3": {
					"name": "SequenceFlow47"
				},
				"b3fa2686-88dc-4335-9fda-b27a8311a103": {
					"name": "SI"
				},
				"34490402-95c3-4fde-8974-6cbee4b610db": {
					"name": "SequenceFlow53"
				},
				"0a39db24-f1ba-4b7f-b4a7-513f1cf75202": {
					"name": "SequenceFlow54"
				},
				"898abd68-3b92-4bcd-952e-52afded5eedd": {
					"name": "Si"
				},
				"965186a7-1e3f-42b9-9a0e-7a2affb48ce7": {
					"name": "No"
				},
				"2ce93cc5-25b7-40a0-9cd4-d187d4f909be": {
					"name": "No"
				},
				"fbee73fe-4ad3-41ad-ae9f-8363fb787a17": {
					"name": "SI"
				},
				"ba301fb7-7ffe-4693-85c9-e1ff0bda43e8": {
					"name": "No"
				},
				"6d99d834-26fa-42d9-bf16-ad41f75fc19f": {
					"name": "Gasto"
				},
				"2b4bfa12-6cf4-493a-b668-0aa482667259": {
					"name": "SequenceFlow61"
				},
				"ceb497aa-3486-424d-9b9a-4cc3963c09a9": {
					"name": "Solicitud"
				},
				"f493e62f-28c0-4332-ac10-d6330bdea902": {
					"name": "SequenceFlow63"
				}
			},
			"diagrams": {
				"6c8034d0-c808-43a4-b772-b6f6830cc5c3": {}
			}
		},
		"121f8e83-0c4c-486f-860e-9a7e3fcb3ed4": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "Start"
		},
		"2f1e456c-8da5-40a6-a58b-2b0b84a39571": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "Fin"
		},
		"3408b990-e3a4-4c6e-ad00-daf39299b5fa": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.dto} Entreg.Rendir: ${context.Belnr}",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://medifarma-apps-rendicion-gastos-bs.firstusertask/UISolicitudFF",
			"recipientUsers": "${context.userias}",
			"id": "usertask2",
			"name": "Aprobacion Primer Nivel"
		},
		"8af01f8a-37ff-466a-9fe9-b4f23162aa1d": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "${context.getPrimerAprobadorSRV}",
			"httpMethod": "GET",
			"responseVariable": "${context.resultPrimerAprobador}",
			"id": "servicetask1",
			"name": "Get Aprobador Primer Nivel"
		},
		"2d7427fa-c02f-49c5-ba5b-a1f088bd8248": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/ScriptsEntregasRendir/ScriptFormatDataInicial.js",
			"id": "scripttask1",
			"name": "ScriptFormatDataInicial"
		},
		"664b1c1a-37de-44a9-92dd-95480b8a96e6": {
			"classDefinition": "com.sap.bpm.wfs.ParallelGateway",
			"id": "parallelgateway1",
			"name": "Inicio Tareas Paralelas"
		},
		"d9090cb5-e60d-4e92-8426-df3afdaeac89": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.correout}",
			"responseVariable": "${context.correoget}",
			"id": "servicetask2",
			"name": "Enviar Correo Aprobador SRV"
		},
		"6149c6ed-3a6b-4ea6-85bc-f616e73d19d4": {
			"classDefinition": "com.sap.bpm.wfs.ParallelGateway",
			"id": "parallelgateway2",
			"name": "Fin Tareas Paralelas"
		},
		"96e0af3c-9f00-4384-ad19-3212dd05126f": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "¿Aprueba?",
			"default": "831cb552-15f7-46f5-9c74-f925ac3e3423"
		},
		"d3b199b8-ff69-4845-87ac-bee227c5d341": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/ScriptsEntregasRendir/ScriptFormatDatosAprobacion.js",
			"id": "scripttask2",
			"name": "ScriptFormatDatosAprobacion"
		},
		"ce48f3f6-cc1f-434f-b33c-fcae0936f28b": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/ScriptsEntregasRendir/ScriptFormatDatosRechazo.js",
			"id": "scripttask3",
			"name": "ScriptFormatDatosRechazo"
		},
		"49e33d6e-ca44-43c3-b85f-ce5db1fe6aa1": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/${context.nombreEntidad}",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.att}",
			"responseVariable": "${context.respatt}",
			"id": "servicetask4",
			"name": "Aprobar Documento SRV"
		},
		"0ec62cc7-b6e5-47de-89fe-206d34ae2582": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/${context.nombreEntidad}(Bukrs='${context.Bukrs}',${context.nombreDocumento}='${context.Belnr}',Gjahr='${context.Gjahr}')",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.arr}",
			"responseVariable": "${context.resprr}",
			"id": "servicetask5",
			"name": "Rechazar Documento SRV"
		},
		"b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.correo.stp}",
			"responseVariable": "${context.correo.st.get}",
			"id": "servicetask6",
			"name": "Enviar Correo Aprobacion SRV"
		},
		"dc275e60-2c09-400c-8e9e-1136dc0048d9": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.correosrtt}",
			"responseVariable": "${context.resultcorreor}",
			"id": "servicetask7",
			"name": "Enviar Correo Rechazo SRV"
		},
		"24b2c416-1fb5-4658-98cc-30a82339ff0e": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "${context.getSegundoAprobadorSRV}",
			"httpMethod": "GET",
			"responseVariable": "${context.resultSegundoAprob}",
			"id": "servicetask8",
			"name": "Get Aprobador Segundo Nivel"
		},
		"b4914596-7f21-47bf-9eb5-2989bfa170e3": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway3",
			"name": "¿Es Segundo Nivel Aprob?",
			"default": "965186a7-1e3f-42b9-9a0e-7a2affb48ce7"
		},
		"15135068-1799-4a78-9650-698e99f5b495": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/ScriptsEntregasRendir/ScriptURIAprobadoresPrimerNivel.js",
			"id": "scripttask5",
			"name": "ScriptURIAprobadoresPrimerNivel"
		},
		"e8cc9625-1462-40ab-9bfa-ae574378e0ae": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/ScriptsEntregasRendir/ScriptURIAprobadoresSegundoNivel.js",
			"id": "scripttask6",
			"name": "ScriptURIAprobadoresSegundoNivel"
		},
		"6887f9d4-cab6-48fb-800d-dfe9ca9c92ab": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/aprobarEntregaRendir/Migration.js",
			"id": "scripttask7",
			"name": "Migration"
		},
		"07ae634f-2740-463a-b1e9-3badb1f12fef": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/aprobarEntregaRendir/dummy.js",
			"id": "scripttask8",
			"name": "dummy"
		},
		"6c94981a-1bd9-4caf-9a7c-6a792567c065": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway6",
			"name": "¿Es natural o migrado?",
			"default": "9675a208-d6ba-409c-b33e-6429421dc9e0"
		},
		"2ded3fa1-2a36-4ef2-b398-cdb06244e6b1": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway7",
			"name": "¿En qué paso se quedó?"
		},
		"9437813f-10ec-4bd8-a902-b8f074436e62": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway8",
			"name": "¿Es solicitud?",
			"default": "2ce93cc5-25b7-40a0-9cd4-d187d4f909be"
		},
		"03a909e0-0368-4a55-8cef-c9a7794bcde9": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway9",
			"name": "¿Es Tercer Nivel Aprobador?",
			"default": "ba301fb7-7ffe-4693-85c9-e1ff0bda43e8"
		},
		"5bac4cf4-c285-4a29-a56b-831d983257c7": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/aprobarEntregaRendir/ScriptURIAprobadoresTercerNivel.js",
			"id": "scripttask9",
			"name": "ScriptUriAprobadoresTercerNivel"
		},
		"69a5919e-b647-4b7c-964f-c07d29e612c7": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "${context.getSegundoAprobadorSRV}",
			"httpMethod": "GET",
			"responseVariable": "${context.resultTercerAprob}",
			"id": "servicetask11",
			"name": "Get Aprobador Tercer Nivel"
		},
		"c17668dd-0fc8-4543-9b75-c5ab49b9643d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "8af01f8a-37ff-466a-9fe9-b4f23162aa1d",
			"targetRef": "2d7427fa-c02f-49c5-ba5b-a1f088bd8248"
		},
		"db04cbc4-5d0d-419b-bb3c-5ad1a4861316": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "664b1c1a-37de-44a9-92dd-95480b8a96e6",
			"targetRef": "d9090cb5-e60d-4e92-8426-df3afdaeac89"
		},
		"aaec7833-d182-4052-8c50-f845ffbc13d9": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow6",
			"name": "SequenceFlow6",
			"sourceRef": "664b1c1a-37de-44a9-92dd-95480b8a96e6",
			"targetRef": "3408b990-e3a4-4c6e-ad00-daf39299b5fa"
		},
		"90ce8541-cb7d-4515-a260-b1982ea4a801": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "d9090cb5-e60d-4e92-8426-df3afdaeac89",
			"targetRef": "6149c6ed-3a6b-4ea6-85bc-f616e73d19d4"
		},
		"c59c57df-98ab-4744-bc1b-f942592bacf2": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow8",
			"name": "SequenceFlow8",
			"sourceRef": "6149c6ed-3a6b-4ea6-85bc-f616e73d19d4",
			"targetRef": "96e0af3c-9f00-4384-ad19-3212dd05126f"
		},
		"831cb552-15f7-46f5-9c74-f925ac3e3423": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "Rachazado",
			"sourceRef": "96e0af3c-9f00-4384-ad19-3212dd05126f",
			"targetRef": "ce48f3f6-cc1f-434f-b33c-fcae0936f28b"
		},
		"6e4ef4f3-9b50-4e83-b83a-12ff75081de1": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow10",
			"name": "SequenceFlow10",
			"sourceRef": "3408b990-e3a4-4c6e-ad00-daf39299b5fa",
			"targetRef": "6149c6ed-3a6b-4ea6-85bc-f616e73d19d4"
		},
		"a9d6470c-910e-4c3d-aa8d-82df6b3e3d1a": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow13",
			"name": "SequenceFlow13",
			"sourceRef": "d3b199b8-ff69-4845-87ac-bee227c5d341",
			"targetRef": "49e33d6e-ca44-43c3-b85f-ce5db1fe6aa1"
		},
		"75df497a-4eb1-417c-81c6-cdd22b02bc4a": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow16",
			"name": "SequenceFlow16",
			"sourceRef": "49e33d6e-ca44-43c3-b85f-ce5db1fe6aa1",
			"targetRef": "23152245-c457-457c-93ee-d60bb9b42f41"
		},
		"6142deaf-57a7-457b-b4f6-54b7153ee529": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow17",
			"name": "SequenceFlow17",
			"sourceRef": "ce48f3f6-cc1f-434f-b33c-fcae0936f28b",
			"targetRef": "0ec62cc7-b6e5-47de-89fe-206d34ae2582"
		},
		"75730339-bd92-4917-b9aa-e93f30791443": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow18",
			"name": "SequenceFlow18",
			"sourceRef": "b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1",
			"targetRef": "2f1e456c-8da5-40a6-a58b-2b0b84a39571"
		},
		"c21d9085-b31c-4dff-873e-8425e1cc2e0c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow19",
			"name": "SequenceFlow19",
			"sourceRef": "0ec62cc7-b6e5-47de-89fe-206d34ae2582",
			"targetRef": "dc275e60-2c09-400c-8e9e-1136dc0048d9"
		},
		"50a9c608-57cb-4c4b-b787-742cd976f4ca": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow20",
			"name": "SequenceFlow20",
			"sourceRef": "dc275e60-2c09-400c-8e9e-1136dc0048d9",
			"targetRef": "2f1e456c-8da5-40a6-a58b-2b0b84a39571"
		},
		"322f8fb1-55bd-4181-aa4e-ba40713d7108": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow29",
			"name": "SequenceFlow29",
			"sourceRef": "24b2c416-1fb5-4658-98cc-30a82339ff0e",
			"targetRef": "2d7427fa-c02f-49c5-ba5b-a1f088bd8248"
		},
		"a5a7507d-991e-4dcc-9e9d-9ea3820b4f40": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow33",
			"name": "SequenceFlow33",
			"sourceRef": "15135068-1799-4a78-9650-698e99f5b495",
			"targetRef": "8af01f8a-37ff-466a-9fe9-b4f23162aa1d"
		},
		"aa364a26-200e-4219-bd80-df77cef69737": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.iNivelCount  != 3 && !context.gastoFlag}",
			"id": "sequenceflow35",
			"name": "Sí",
			"sourceRef": "b4914596-7f21-47bf-9eb5-2989bfa170e3",
			"targetRef": "e8cc9625-1462-40ab-9bfa-ae574378e0ae"
		},
		"b13544c7-b54b-4b96-9c69-efdb6ba22cca": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow36",
			"name": "SequenceFlow36",
			"sourceRef": "e8cc9625-1462-40ab-9bfa-ae574378e0ae",
			"targetRef": "24b2c416-1fb5-4658-98cc-30a82339ff0e"
		},
		"27a8506c-5b6a-468d-9612-1cf4b982ab04": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow41",
			"name": "SequenceFlow41",
			"sourceRef": "121f8e83-0c4c-486f-860e-9a7e3fcb3ed4",
			"targetRef": "6887f9d4-cab6-48fb-800d-dfe9ca9c92ab"
		},
		"2c1e16b3-07c3-45af-bfa0-160234ef3930": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow42",
			"name": "SequenceFlow42",
			"sourceRef": "6887f9d4-cab6-48fb-800d-dfe9ca9c92ab",
			"targetRef": "6c94981a-1bd9-4caf-9a7c-6a792567c065"
		},
		"76c15169-e903-4cea-98e1-38bbffa93c92": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.migration_flag=='migrated'}",
			"id": "sequenceflow43",
			"name": "Migrado",
			"sourceRef": "6c94981a-1bd9-4caf-9a7c-6a792567c065",
			"targetRef": "2ded3fa1-2a36-4ef2-b398-cdb06244e6b1"
		},
		"9675a208-d6ba-409c-b33e-6429421dc9e0": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow44",
			"name": "Natural",
			"sourceRef": "6c94981a-1bd9-4caf-9a7c-6a792567c065",
			"targetRef": "15135068-1799-4a78-9650-698e99f5b495"
		},
		"68f04c3d-408b-4ad0-9e81-d1710b3073e9": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow45",
			"name": "SequenceFlow45",
			"sourceRef": "2ded3fa1-2a36-4ef2-b398-cdb06244e6b1",
			"targetRef": "07ae634f-2740-463a-b1e9-3badb1f12fef"
		},
		"39c175e3-29f9-4eb9-b15b-7273be3a3544": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow46",
			"name": "SequenceFlow46",
			"sourceRef": "2d7427fa-c02f-49c5-ba5b-a1f088bd8248",
			"targetRef": "07ae634f-2740-463a-b1e9-3badb1f12fef"
		},
		"42ac9c72-6888-4cba-9d23-c7ca966d24a3": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow47",
			"name": "SequenceFlow47",
			"sourceRef": "07ae634f-2740-463a-b1e9-3badb1f12fef",
			"targetRef": "664b1c1a-37de-44a9-92dd-95480b8a96e6"
		},
		"b3fa2686-88dc-4335-9fda-b27a8311a103": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.stage==true}",
			"id": "sequenceflow51",
			"name": "SI",
			"sourceRef": "96e0af3c-9f00-4384-ad19-3212dd05126f",
			"targetRef": "b4914596-7f21-47bf-9eb5-2989bfa170e3"
		},
		"34490402-95c3-4fde-8974-6cbee4b610db": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow53",
			"name": "SequenceFlow53",
			"sourceRef": "69a5919e-b647-4b7c-964f-c07d29e612c7",
			"targetRef": "2d7427fa-c02f-49c5-ba5b-a1f088bd8248"
		},
		"0a39db24-f1ba-4b7f-b4a7-513f1cf75202": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow54",
			"name": "SequenceFlow54",
			"sourceRef": "5bac4cf4-c285-4a29-a56b-831d983257c7",
			"targetRef": "69a5919e-b647-4b7c-964f-c07d29e612c7"
		},
		"898abd68-3b92-4bcd-952e-52afded5eedd": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${!context.gastoFlag}",
			"id": "sequenceflow55",
			"name": "Si",
			"sourceRef": "03a909e0-0368-4a55-8cef-c9a7794bcde9",
			"targetRef": "5bac4cf4-c285-4a29-a56b-831d983257c7"
		},
		"965186a7-1e3f-42b9-9a0e-7a2affb48ce7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow56",
			"name": "No",
			"sourceRef": "b4914596-7f21-47bf-9eb5-2989bfa170e3",
			"targetRef": "9437813f-10ec-4bd8-a902-b8f074436e62"
		},
		"2ce93cc5-25b7-40a0-9cd4-d187d4f909be": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow57",
			"name": "No",
			"sourceRef": "9437813f-10ec-4bd8-a902-b8f074436e62",
			"targetRef": "03a909e0-0368-4a55-8cef-c9a7794bcde9"
		},
		"fbee73fe-4ad3-41ad-ae9f-8363fb787a17": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.Type == \"S\"}",
			"id": "sequenceflow58",
			"name": "SI",
			"sourceRef": "9437813f-10ec-4bd8-a902-b8f074436e62",
			"targetRef": "d3b199b8-ff69-4845-87ac-bee227c5d341"
		},
		"ba301fb7-7ffe-4693-85c9-e1ff0bda43e8": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow59",
			"name": "No",
			"sourceRef": "03a909e0-0368-4a55-8cef-c9a7794bcde9",
			"targetRef": "d3b199b8-ff69-4845-87ac-bee227c5d341"
		},
		"6c8034d0-c808-43a4-b772-b6f6830cc5c3": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"8d9f37b8-8d52-491d-bba7-92784b654ce5": {},
				"15f9f832-1da6-4f78-a432-fcae0bebeff8": {},
				"3168adca-d8ee-43ba-8113-9b9c7de07411": {},
				"ecb778bf-5731-4816-9bf5-f9461fb53c08": {},
				"2580a4ed-c9fb-4353-ad5a-32f64583f775": {},
				"ade0fbdd-682b-40b7-9abe-567cea7dcb1c": {},
				"d66254c9-7048-43a7-a8f0-094583a2c86e": {},
				"d9277f28-5899-41ac-9952-c1e5b7c9d2b9": {},
				"a4ab936f-d6ad-4f44-8425-ab6496b15d9a": {},
				"a4c7f3db-0a0b-4bae-9366-2e0ed6554986": {},
				"8c5d4d49-0888-479f-ac78-207829dcb5ab": {},
				"a0241126-7d29-4a88-8af7-8e10eb578c08": {},
				"79cae19f-287d-4be5-bc31-7fc642e79df9": {},
				"a7c11fe9-d6c2-4e9a-82b6-82a4bcaa3cf5": {},
				"604c473c-6135-40d7-922f-119c6d64e6fa": {},
				"5ff24a12-0d3c-49e3-b6d6-31895c327fb3": {},
				"2ff4cac9-c893-4db1-8fed-331ebd85cf4c": {},
				"26070f95-86a1-433e-be39-b1e9865849f9": {},
				"57b86d03-0a98-4199-b172-b3673c269323": {},
				"c5978e12-8864-4294-b8e2-edbe25b61ca5": {},
				"25786499-8048-4851-a165-2cec22342d9b": {},
				"92ecb0d9-378b-4784-930c-5ef2f4a150bb": {},
				"2ad894bc-f4bd-4b03-89d0-d16ff1f2a0ce": {},
				"2471a3e4-2856-47a5-836c-c3e08254d09e": {},
				"bb14c72b-509a-4540-8626-a5f6fe8a52f9": {},
				"3b9c8be0-9d46-4814-90c1-1b45803c0ddd": {},
				"323c47da-6dee-4c65-806c-f3ec53bb1a23": {},
				"328b327b-48e3-47ce-8925-99aecc323bcb": {},
				"38bbeea0-07c9-434b-afa5-a582fe63cbe6": {},
				"e86c093c-25de-4c9e-b756-5937122caed9": {},
				"f8d19696-dde1-49a2-b390-954969f67f6f": {},
				"0c7c4658-c137-485f-a6b9-1855afc7324a": {},
				"5ad32f47-d2d9-45e8-9437-57bb7e055b25": {},
				"b0471ecd-182e-4d4e-b063-267d8261a268": {},
				"2ae5bb96-8f8b-43e1-94d3-689c43000788": {},
				"e85063e2-5bc5-4c08-8ef4-7affde98a554": {},
				"a3ff85e8-dad6-4d97-80dd-d9a359c70514": {},
				"261505a6-4876-45b5-8c1b-f4f71f6bdf32": {},
				"b3339863-100e-48c5-b79d-61f9afa80fb3": {},
				"c7865429-7967-42b4-b027-48c9497296b2": {},
				"c6d4a484-d03e-4b20-9f2a-af933016923f": {},
				"eceaaa4f-6012-4762-be22-a64304629ea1": {},
				"a63cb6d9-6542-450a-aa8a-2c1bf748878b": {},
				"9eafdeb5-b495-4c01-a6a7-37165c11c1fe": {},
				"18975933-68b5-42ae-a61e-c5b9489c4963": {},
				"4359b338-0684-40e4-899f-dea9ff3f71ff": {},
				"36e454a5-ee0c-48a7-b67e-b67ce89246df": {},
				"64512e9b-2921-4c9b-ac4f-9f745facb31b": {},
				"7a73ea44-82b0-4c68-81f8-6c8ea2b807ef": {},
				"ca27d87b-4933-4eed-8c70-819d0cea1a65": {},
				"54beb3bd-94fd-48c0-b719-ce8625bfcfa9": {},
				"96534898-2073-4953-b650-bdcd249ea7a6": {},
				"6a6c3202-9035-4bc9-b37c-95e1459928d7": {},
				"6b3327c3-0c06-4458-a765-d1b3eb83e1cc": {},
				"34821b71-440b-4580-b5e8-eb5e99d9e30a": {},
				"0b8aae1f-e4a0-48c7-bde8-ebc5434e7e7e": {},
				"f04cc42f-96f5-4241-bbda-9e80f4cd0c1f": {},
				"ea83cf6f-522a-4b18-be19-359c9e68514d": {},
				"e9955e84-26ba-4226-a575-f5a2af744fae": {},
				"70f30856-ceea-4032-9765-875925c04b3d": {},
				"b2a51688-cc1f-42eb-8a97-20bc87eae5b7": {},
				"4bc24265-287a-4b76-84f0-7038fe39f300": {},
				"be899746-39f9-422e-986c-2cd7db4a6dae": {},
				"3c717e7f-19a7-4847-83c0-c9840ea41ea3": {},
				"625f0666-92ec-44fb-9107-cd00cab6321a": {},
				"6b6817b3-7f2a-4957-9406-40e7db37c6d3": {}
			}
		},
		"8d9f37b8-8d52-491d-bba7-92784b654ce5": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -339,
			"y": 47,
			"width": 32,
			"height": 32,
			"object": "121f8e83-0c4c-486f-860e-9a7e3fcb3ed4"
		},
		"15f9f832-1da6-4f78-a432-fcae0bebeff8": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 1396,
			"y": -38,
			"width": 35,
			"height": 35,
			"object": "2f1e456c-8da5-40a6-a58b-2b0b84a39571"
		},
		"3168adca-d8ee-43ba-8113-9b9c7de07411": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 315.7490529759482,
			"y": 159.75,
			"width": 100,
			"height": 60,
			"object": "3408b990-e3a4-4c6e-ad00-daf39299b5fa"
		},
		"ecb778bf-5731-4816-9bf5-f9461fb53c08": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": -110.125710257847,
			"y": 39.875,
			"width": 100,
			"height": 60,
			"object": "8af01f8a-37ff-466a-9fe9-b4f23162aa1d"
		},
		"2580a4ed-c9fb-4353-ad5a-32f64583f775": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-60.125710257847004,69.84375 108.56167602539062,69.84375",
			"sourceSymbol": "ecb778bf-5731-4816-9bf5-f9461fb53c08",
			"targetSymbol": "ade0fbdd-682b-40b7-9abe-567cea7dcb1c",
			"object": "c17668dd-0fc8-4543-9b75-c5ab49b9643d"
		},
		"ade0fbdd-682b-40b7-9abe-567cea7dcb1c": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 58.561676025390625,
			"y": 39.8125,
			"width": 100,
			"height": 60,
			"object": "2d7427fa-c02f-49c5-ba5b-a1f088bd8248"
		},
		"d66254c9-7048-43a7-a8f0-094583a2c86e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ParallelGatewaySymbol",
			"x": 226.1553645006694,
			"y": 64.28125,
			"object": "664b1c1a-37de-44a9-92dd-95480b8a96e6"
		},
		"d9277f28-5899-41ac-9952-c1e5b7c9d2b9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "247,86 247,21 366.45220947265625,21",
			"sourceSymbol": "d66254c9-7048-43a7-a8f0-094583a2c86e",
			"targetSymbol": "a4ab936f-d6ad-4f44-8425-ab6496b15d9a",
			"object": "db04cbc4-5d0d-419b-bb3c-5ad1a4861316"
		},
		"a4ab936f-d6ad-4f44-8425-ab6496b15d9a": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 316.45220947265625,
			"y": -11.484375,
			"width": 100,
			"height": 60,
			"object": "d9090cb5-e60d-4e92-8426-df3afdaeac89"
		},
		"a4c7f3db-0a0b-4bae-9366-2e0ed6554986": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "250,85.28125 250,191.875 366.1006312243022,191.875",
			"sourceSymbol": "d66254c9-7048-43a7-a8f0-094583a2c86e",
			"targetSymbol": "3168adca-d8ee-43ba-8113-9b9c7de07411",
			"object": "aaec7833-d182-4052-8c50-f845ffbc13d9"
		},
		"8c5d4d49-0888-479f-ac78-207829dcb5ab": {
			"classDefinition": "com.sap.bpm.wfs.ui.ParallelGatewaySymbol",
			"x": 493.95220947265625,
			"y": 69.515625,
			"object": "6149c6ed-3a6b-4ea6-85bc-f616e73d19d4"
		},
		"a0241126-7d29-4a88-8af7-8e10eb578c08": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "366.45220947265625,18.515625 517,18.515625 517,90.515625",
			"sourceSymbol": "a4ab936f-d6ad-4f44-8425-ab6496b15d9a",
			"targetSymbol": "8c5d4d49-0888-479f-ac78-207829dcb5ab",
			"object": "90ce8541-cb7d-4515-a260-b1982ea4a801"
		},
		"79cae19f-287d-4be5-bc31-7fc642e79df9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "514.9522094726562,90.76171875 667.47607421875,90.76171875",
			"sourceSymbol": "8c5d4d49-0888-479f-ac78-207829dcb5ab",
			"targetSymbol": "a7c11fe9-d6c2-4e9a-82b6-82a4bcaa3cf5",
			"object": "c59c57df-98ab-4744-bc1b-f942592bacf2"
		},
		"a7c11fe9-d6c2-4e9a-82b6-82a4bcaa3cf5": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 646.47607421875,
			"y": 70.0078125,
			"object": "96e0af3c-9f00-4384-ad19-3212dd05126f"
		},
		"604c473c-6135-40d7-922f-119c6d64e6fa": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "668,91.0078125 668,173.0654296875 841.3570556640625,173.0654296875",
			"sourceSymbol": "a7c11fe9-d6c2-4e9a-82b6-82a4bcaa3cf5",
			"targetSymbol": "57b86d03-0a98-4199-b172-b3673c269323",
			"object": "831cb552-15f7-46f5-9c74-f925ac3e3423"
		},
		"5ff24a12-0d3c-49e3-b6d6-31895c327fb3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "365.7490529759482,189.75 513,189.75 513,93.515625",
			"sourceSymbol": "3168adca-d8ee-43ba-8113-9b9c7de07411",
			"targetSymbol": "8c5d4d49-0888-479f-ac78-207829dcb5ab",
			"object": "6e4ef4f3-9b50-4e83-b83a-12ff75081de1"
		},
		"2ff4cac9-c893-4db1-8fed-331ebd85cf4c": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 796.238037109375,
			"y": -205.74609375,
			"width": 100,
			"height": 60,
			"object": "d3b199b8-ff69-4845-87ac-bee227c5d341"
		},
		"26070f95-86a1-433e-be39-b1e9865849f9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "840.238037109375,-181.6845703125 998.8690185546875,-181.6845703125",
			"sourceSymbol": "2ff4cac9-c893-4db1-8fed-331ebd85cf4c",
			"targetSymbol": "c5978e12-8864-4294-b8e2-edbe25b61ca5",
			"object": "a9d6470c-910e-4c3d-aa8d-82df6b3e3d1a"
		},
		"57b86d03-0a98-4199-b172-b3673c269323": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 791.3570556640625,
			"y": 141.130859375,
			"width": 100,
			"height": 60,
			"object": "ce48f3f6-cc1f-434f-b33c-fcae0936f28b"
		},
		"c5978e12-8864-4294-b8e2-edbe25b61ca5": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 948.8690185546875,
			"y": -205.623046875,
			"width": 100,
			"height": 60,
			"object": "49e33d6e-ca44-43c3-b85f-ce5db1fe6aa1"
		},
		"25786499-8048-4851-a165-2cec22342d9b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "998.8690185546875,-175.732666015625 1152.5267944335938,-175.732666015625",
			"sourceSymbol": "c5978e12-8864-4294-b8e2-edbe25b61ca5",
			"targetSymbol": "70f30856-ceea-4032-9765-875925c04b3d",
			"object": "75df497a-4eb1-417c-81c6-cdd22b02bc4a"
		},
		"92ecb0d9-378b-4784-930c-5ef2f4a150bb": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 970.3570556640625,
			"y": 147.130859375,
			"width": 100,
			"height": 60,
			"object": "0ec62cc7-b6e5-47de-89fe-206d34ae2582"
		},
		"2ad894bc-f4bd-4b03-89d0-d16ff1f2a0ce": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "841.3570556640625,174.130859375 1020.3570556640625,174.130859375",
			"sourceSymbol": "57b86d03-0a98-4199-b172-b3673c269323",
			"targetSymbol": "92ecb0d9-378b-4784-930c-5ef2f4a150bb",
			"object": "6142deaf-57a7-457b-b4f6-54b7153ee529"
		},
		"2471a3e4-2856-47a5-836c-c3e08254d09e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1256.1845703125,
			"y": -206.0615234375,
			"width": 100,
			"height": 60,
			"object": "b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1"
		},
		"bb14c72b-509a-4540-8626-a5f6fe8a52f9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1306.1845703125,-174 1412.75,-174 1412.75,-20.5",
			"sourceSymbol": "2471a3e4-2856-47a5-836c-c3e08254d09e",
			"targetSymbol": "15f9f832-1da6-4f78-a432-fcae0bebeff8",
			"object": "75730339-bd92-4917-b9aa-e93f30791443"
		},
		"3b9c8be0-9d46-4814-90c1-1b45803c0ddd": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1117.3570556640625,
			"y": 147.130859375,
			"width": 100,
			"height": 60,
			"object": "dc275e60-2c09-400c-8e9e-1136dc0048d9"
		},
		"323c47da-6dee-4c65-806c-f3ec53bb1a23": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1020.3570556640625,177.130859375 1167.3570556640625,177.130859375",
			"sourceSymbol": "92ecb0d9-378b-4784-930c-5ef2f4a150bb",
			"targetSymbol": "3b9c8be0-9d46-4814-90c1-1b45803c0ddd",
			"object": "c21d9085-b31c-4dff-873e-8425e1cc2e0c"
		},
		"328b327b-48e3-47ce-8925-99aecc323bcb": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1167.3570556640625,177.130859375 1415,177.130859375 1415,-20.5",
			"sourceSymbol": "3b9c8be0-9d46-4814-90c1-1b45803c0ddd",
			"targetSymbol": "15f9f832-1da6-4f78-a432-fcae0bebeff8",
			"object": "50a9c608-57cb-4c4b-b787-742cd976f4ca"
		},
		"38bbeea0-07c9-434b-afa5-a582fe63cbe6": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 168.3570556640625,
			"y": -194.99609375,
			"width": 100,
			"height": 60,
			"object": "24b2c416-1fb5-4658-98cc-30a82339ff0e"
		},
		"e86c093c-25de-4c9e-b756-5937122caed9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "218.3570556640625,-168 115.5,-168 115.5,70",
			"sourceSymbol": "38bbeea0-07c9-434b-afa5-a582fe63cbe6",
			"targetSymbol": "ade0fbdd-682b-40b7-9abe-567cea7dcb1c",
			"object": "322f8fb1-55bd-4181-aa4e-ba40713d7108"
		},
		"f8d19696-dde1-49a2-b390-954969f67f6f": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 646.47607421875,
			"y": -187.9921875,
			"object": "b4914596-7f21-47bf-9eb5-2989bfa170e3"
		},
		"0c7c4658-c137-485f-a6b9-1855afc7324a": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -255.74387759533846,
			"y": 33.4375,
			"width": 100,
			"height": 60,
			"object": "15135068-1799-4a78-9650-698e99f5b495"
		},
		"5ad32f47-d2d9-45e8-9437-57bb7e055b25": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-205.74387759533846,66.65625 -60.125710257847004,66.65625",
			"sourceSymbol": "0c7c4658-c137-485f-a6b9-1855afc7324a",
			"targetSymbol": "ecb778bf-5731-4816-9bf5-f9461fb53c08",
			"object": "a5a7507d-991e-4dcc-9e9d-9ea3820b4f40"
		},
		"b0471ecd-182e-4d4e-b063-267d8261a268": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 340.47607421875,
			"y": -199.9921875,
			"width": 136,
			"height": 60,
			"object": "e8cc9625-1462-40ab-9bfa-ae574378e0ae"
		},
		"2ae5bb96-8f8b-43e1-94d3-689c43000788": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667.47607421875,-168.4921875 408.47607421875,-168.4921875",
			"sourceSymbol": "f8d19696-dde1-49a2-b390-954969f67f6f",
			"targetSymbol": "b0471ecd-182e-4d4e-b063-267d8261a268",
			"object": "aa364a26-200e-4219-bd80-df77cef69737"
		},
		"e85063e2-5bc5-4c08-8ef4-7affde98a554": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "408.47607421875,-167.494140625 218.3570556640625,-167.494140625",
			"sourceSymbol": "b0471ecd-182e-4d4e-b063-267d8261a268",
			"targetSymbol": "38bbeea0-07c9-434b-afa5-a582fe63cbe6",
			"object": "b13544c7-b54b-4b96-9c69-efdb6ba22cca"
		},
		"a3ff85e8-dad6-4d97-80dd-d9a359c70514": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -228,
			"y": 239,
			"width": 100,
			"height": 60,
			"object": "6887f9d4-cab6-48fb-800d-dfe9ca9c92ab"
		},
		"261505a6-4876-45b5-8c1b-f4f71f6bdf32": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 59,
			"y": 155,
			"width": 100,
			"height": 60,
			"object": "07ae634f-2740-463a-b1e9-3badb1f12fef"
		},
		"b3339863-100e-48c5-b79d-61f9afa80fb3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-323,63 -323,279 -178,279",
			"sourceSymbol": "8d9f37b8-8d52-491d-bba7-92784b654ce5",
			"targetSymbol": "a3ff85e8-dad6-4d97-80dd-d9a359c70514",
			"object": "27a8506c-5b6a-468d-9612-1cf4b982ab04"
		},
		"c7865429-7967-42b4-b027-48c9497296b2": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": -81,
			"y": 248,
			"object": "6c94981a-1bd9-4caf-9a7c-6a792567c065"
		},
		"c6d4a484-d03e-4b20-9f2a-af933016923f": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-178,269 -60,269",
			"sourceSymbol": "a3ff85e8-dad6-4d97-80dd-d9a359c70514",
			"targetSymbol": "c7865429-7967-42b4-b027-48c9497296b2",
			"object": "2c1e16b3-07c3-45af-bfa0-160234ef3930"
		},
		"eceaaa4f-6012-4762-be22-a64304629ea1": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 88,
			"y": 248,
			"object": "2ded3fa1-2a36-4ef2-b398-cdb06244e6b1"
		},
		"a63cb6d9-6542-450a-aa8a-2c1bf748878b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-60,269 109,269",
			"sourceSymbol": "c7865429-7967-42b4-b027-48c9497296b2",
			"targetSymbol": "eceaaa4f-6012-4762-be22-a64304629ea1",
			"object": "76c15169-e903-4cea-98e1-38bbffa93c92"
		},
		"9eafdeb5-b495-4c01-a6a7-37165c11c1fe": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-60,269 -60,170.71875 -205.74388122558594,170.71875 -205.74387759533846,92.9375",
			"sourceSymbol": "c7865429-7967-42b4-b027-48c9497296b2",
			"targetSymbol": "0c7c4658-c137-485f-a6b9-1855afc7324a",
			"object": "9675a208-d6ba-409c-b33e-6429421dc9e0"
		},
		"18975933-68b5-42ae-a61e-c5b9489c4963": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "109,269 109,214.5",
			"sourceSymbol": "eceaaa4f-6012-4762-be22-a64304629ea1",
			"targetSymbol": "261505a6-4876-45b5-8c1b-f4f71f6bdf32",
			"object": "68f04c3d-408b-4ad0-9e81-d1710b3073e9"
		},
		"4359b338-0684-40e4-899f-dea9ff3f71ff": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "108.78083801269531,69.8125 108.78083801269531,155.5",
			"sourceSymbol": "ade0fbdd-682b-40b7-9abe-567cea7dcb1c",
			"targetSymbol": "261505a6-4876-45b5-8c1b-f4f71f6bdf32",
			"object": "39c175e3-29f9-4eb9-b15b-7273be3a3544"
		},
		"36e454a5-ee0c-48a7-b67e-b67ce89246df": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "109,185 192.8276824951172,185 192.8276824951172,85.28125 226.6553645006694,85.28125",
			"sourceSymbol": "261505a6-4876-45b5-8c1b-f4f71f6bdf32",
			"targetSymbol": "d66254c9-7048-43a7-a8f0-094583a2c86e",
			"object": "42ac9c72-6888-4cba-9d23-c7ca966d24a3"
		},
		"64512e9b-2921-4c9b-ac4f-9f745facb31b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667.238037109375,91.0078125 667.238037109375,-174",
			"sourceSymbol": "a7c11fe9-d6c2-4e9a-82b6-82a4bcaa3cf5",
			"targetSymbol": "f8d19696-dde1-49a2-b390-954969f67f6f",
			"object": "b3fa2686-88dc-4335-9fda-b27a8311a103"
		},
		"7a73ea44-82b0-4c68-81f8-6c8ea2b807ef": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 646,
			"y": -325,
			"object": "9437813f-10ec-4bd8-a902-b8f074436e62"
		},
		"ca27d87b-4933-4eed-8c70-819d0cea1a65": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 646,
			"y": -545,
			"object": "03a909e0-0368-4a55-8cef-c9a7794bcde9"
		},
		"54beb3bd-94fd-48c0-b719-ce8625bfcfa9": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 376,
			"y": -554,
			"width": 100,
			"height": 60,
			"object": "5bac4cf4-c285-4a29-a56b-831d983257c7"
		},
		"96534898-2073-4953-b650-bdcd249ea7a6": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 168,
			"y": -554,
			"width": 100,
			"height": 60,
			"object": "69a5919e-b647-4b7c-964f-c07d29e612c7"
		},
		"6a6c3202-9035-4bc9-b37c-95e1459928d7": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "218,-524 218,-226.84375 92.56167602539062,-226.84375 92.56167602539062,40.3125",
			"sourceSymbol": "96534898-2073-4953-b650-bdcd249ea7a6",
			"targetSymbol": "ade0fbdd-682b-40b7-9abe-567cea7dcb1c",
			"object": "34490402-95c3-4fde-8974-6cbee4b610db"
		},
		"6b3327c3-0c06-4458-a765-d1b3eb83e1cc": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "426,-524 267.5,-524",
			"sourceSymbol": "54beb3bd-94fd-48c0-b719-ce8625bfcfa9",
			"targetSymbol": "96534898-2073-4953-b650-bdcd249ea7a6",
			"object": "0a39db24-f1ba-4b7f-b4a7-513f1cf75202"
		},
		"34821b71-440b-4580-b5e8-eb5e99d9e30a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667,-524 475.5,-524",
			"sourceSymbol": "ca27d87b-4933-4eed-8c70-819d0cea1a65",
			"targetSymbol": "54beb3bd-94fd-48c0-b719-ce8625bfcfa9",
			"object": "898abd68-3b92-4bcd-952e-52afded5eedd"
		},
		"0b8aae1f-e4a0-48c7-bde8-ebc5434e7e7e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "665,-166.9921875 665,-304",
			"sourceSymbol": "f8d19696-dde1-49a2-b390-954969f67f6f",
			"targetSymbol": "7a73ea44-82b0-4c68-81f8-6c8ea2b807ef",
			"object": "965186a7-1e3f-42b9-9a0e-7a2affb48ce7"
		},
		"f04cc42f-96f5-4241-bbda-9e80f4cd0c1f": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667,-304 667,-503.5",
			"sourceSymbol": "7a73ea44-82b0-4c68-81f8-6c8ea2b807ef",
			"targetSymbol": "ca27d87b-4933-4eed-8c70-819d0cea1a65",
			"object": "2ce93cc5-25b7-40a0-9cd4-d187d4f909be"
		},
		"ea83cf6f-522a-4b18-be19-359c9e68514d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667,-300.5 823.238037109375,-300.5 823.238037109375,-202.24609375",
			"sourceSymbol": "7a73ea44-82b0-4c68-81f8-6c8ea2b807ef",
			"targetSymbol": "2ff4cac9-c893-4db1-8fed-331ebd85cf4c",
			"object": "fbee73fe-4ad3-41ad-ae9f-8363fb787a17"
		},
		"e9955e84-26ba-4226-a575-f5a2af744fae": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "667,-525 878.238037109375,-525 878.238037109375,-205.24609375",
			"sourceSymbol": "ca27d87b-4933-4eed-8c70-819d0cea1a65",
			"targetSymbol": "2ff4cac9-c893-4db1-8fed-331ebd85cf4c",
			"object": "ba301fb7-7ffe-4693-85c9-e1ff0bda43e8"
		},
		"99748e33-aa0e-4fc8-90fb-b68abf130f73": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"sequenceflow": 63,
			"startevent": 1,
			"endevent": 1,
			"usertask": 4,
			"servicetask": 12,
			"scripttask": 10,
			"exclusivegateway": 10,
			"parallelgateway": 3
		},
		"23152245-c457-457c-93ee-d60bb9b42f41": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway10",
			"name": "¿Solicitud o Gasto?",
			"default": "ceb497aa-3486-424d-9b9a-4cc3963c09a9"
		},
		"70f30856-ceea-4032-9765-875925c04b3d": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 1131.5267944335938,
			"y": -196.84228515625,
			"object": "23152245-c457-457c-93ee-d60bb9b42f41"
		},
		"6d99d834-26fa-42d9-bf16-ad41f75fc19f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.Type == \"G\"}",
			"id": "sequenceflow60",
			"name": "Gasto",
			"sourceRef": "23152245-c457-457c-93ee-d60bb9b42f41",
			"targetRef": "484de94e-df0b-4b0e-b155-5175d7566505"
		},
		"b2a51688-cc1f-42eb-8a97-20bc87eae5b7": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1152.5662384033203,-175.84228515625 1152.5662384033203,-303.951904296875",
			"sourceSymbol": "70f30856-ceea-4032-9765-875925c04b3d",
			"targetSymbol": "4bc24265-287a-4b76-84f0-7038fe39f300",
			"object": "6d99d834-26fa-42d9-bf16-ad41f75fc19f"
		},
		"484de94e-df0b-4b0e-b155-5175d7566505": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/aprobarEntregaRendir/Compensar.js",
			"id": "scripttask10",
			"name": "Compensar"
		},
		"4bc24265-287a-4b76-84f0-7038fe39f300": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 1102.6056823730469,
			"y": -333.951904296875,
			"width": 100,
			"height": 60,
			"object": "484de94e-df0b-4b0e-b155-5175d7566505"
		},
		"2b4bfa12-6cf4-493a-b668-0aa482667259": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow61",
			"name": "SequenceFlow61",
			"sourceRef": "484de94e-df0b-4b0e-b155-5175d7566505",
			"targetRef": "0eb649cd-af34-4606-b675-b8a7a9a24f11"
		},
		"be899746-39f9-422e-986c-2cd7db4a6dae": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1152.6056823730469,-304.4759521484375 1307,-304.4759521484375",
			"sourceSymbol": "4bc24265-287a-4b76-84f0-7038fe39f300",
			"targetSymbol": "625f0666-92ec-44fb-9107-cd00cab6321a",
			"object": "2b4bfa12-6cf4-493a-b668-0aa482667259"
		},
		"ceb497aa-3486-424d-9b9a-4cc3963c09a9": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow62",
			"name": "Solicitud",
			"sourceRef": "23152245-c457-457c-93ee-d60bb9b42f41",
			"targetRef": "b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1"
		},
		"3c717e7f-19a7-4847-83c0-c9840ea41ea3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1152.5267944335938,-175.951904296875 1306.1845703125,-175.951904296875",
			"sourceSymbol": "70f30856-ceea-4032-9765-875925c04b3d",
			"targetSymbol": "2471a3e4-2856-47a5-836c-c3e08254d09e",
			"object": "ceb497aa-3486-424d-9b9a-4cc3963c09a9"
		},
		"0eb649cd-af34-4606-b675-b8a7a9a24f11": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV/${context.nombreEntidad}",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/ENTREGAS_RENDIR_SRV",
			"requestVariable": "${context.att}",
			"responseVariable": "${context.Compensacion}",
			"id": "servicetask12",
			"name": "Compensar Documento Gasto"
		},
		"625f0666-92ec-44fb-9107-cd00cab6321a": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1257,
			"y": -333.951904296875,
			"width": 100,
			"height": 60,
			"object": "0eb649cd-af34-4606-b675-b8a7a9a24f11"
		},
		"f493e62f-28c0-4332-ac10-d6330bdea902": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow63",
			"name": "SequenceFlow63",
			"sourceRef": "0eb649cd-af34-4606-b675-b8a7a9a24f11",
			"targetRef": "b9d1348c-f3ff-4e2c-bc02-6e2a68e25bb1"
		},
		"6b6817b3-7f2a-4957-9406-40e7db37c6d3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1306.59228515625,-303.951904296875 1306.59228515625,-176.0615234375",
			"sourceSymbol": "625f0666-92ec-44fb-9107-cd00cab6321a",
			"targetSymbol": "2471a3e4-2856-47a5-836c-c3e08254d09e",
			"object": "f493e62f-28c0-4332-ac10-d6330bdea902"
		}
	}
}