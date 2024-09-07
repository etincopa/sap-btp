{
	"contents": {
		"8fa5e7d8-6b19-4b16-a737-64b98cd70980": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "wf_cajachicaff",
			"subject": "WF_CajaChicaFF",
			"name": "WF_CajaChicaFF",
			"lastIds": "0c40f3e4-cb58-4ee7-966f-4dcb076822a6",
			"events": {
				"f25b3b22-6384-403b-b514-5002d391cd01": {
					"name": "Start"
				},
				"e0e69352-be7f-4377-981a-c9fe48503c12": {
					"name": "End"
				}
			},
			"activities": {
				"55459a4f-ee99-45ad-b117-687dc3115395": {
					"name": "Aprobación"
				},
				"550926c1-64c8-4a6d-8d3c-2aa71cb28db7": {
					"name": "Serv Get Aprobador Primer Nivel"
				},
				"0cbaa360-cf54-42a6-8313-430031ba9508": {
					"name": "ScriptFormatDataInicial"
				},
				"a0606a40-307e-4f7a-b08d-ed2ae2330036": {
					"name": "Enviar Correo Aprobador SRV"
				},
				"cbf26194-75d5-4cee-baec-4dd51f3e35d3": {
					"name": "¿Aprobado?"
				},
				"a89ccae4-d5f1-495a-a2d7-20758a0bfeae": {
					"name": "ScriptFormatDatosAprobacion"
				},
				"45fb4767-105c-4e5c-993c-6cc37c3923a8": {
					"name": "ScriptFormatDatosRechazo"
				},
				"46259d7d-f92a-4977-a2b5-8d22e03a54a5": {
					"name": "Aprobar Documento SRV"
				},
				"66abf9cf-ce35-4c39-849d-ef5f78e1fd1b": {
					"name": "Enviar Correo Aprobacion SRV"
				},
				"393cf4cb-23f7-475a-aa0e-7d167e2fc24d": {
					"name": "Rechazar Documento SRV"
				},
				"05542a93-c0bd-42ef-ae54-3457f7d4752e": {
					"name": "Enviar Correo Rechazo SRV"
				},
				"37ad433b-f540-4f18-9051-0ddf9a723d69": {
					"name": "Get Aprobador Segundo Nivel"
				},
				"45d4c15b-7ccf-415d-b4ac-1820ce68a65c": {
					"name": "¿Es Segundo Nivel Aprobación?"
				},
				"cb793e33-40fe-4cab-b7df-3c045584dc15": {
					"name": "ScriptURIAprobadoresPrimerNivel"
				},
				"914eec41-a3f1-427b-af87-36706108ba87": {
					"name": "ScriptURIAprobadoresSegundoNivel"
				},
				"8f0ac164-f1c3-4ac4-a72c-f506ac7432be": {
					"name": "Migration"
				},
				"b495a9fb-1ec4-41a6-ad29-420964f78787": {
					"name": "dummy"
				},
				"30138994-769e-48ac-a0de-97a639162044": {
					"name": "¿Es natural o migrado?"
				},
				"2ea569f7-d10a-4d6c-a76a-c680381284f1": {
					"name": "¿En qué paso se quedó?"
				},
				"f1775f5a-719d-4d68-8c3a-9f77ef42edac": {
					"name": "¿Solicitud o Gasto?"
				},
				"f8f0993d-8d1a-454c-a037-869d5f46cdd7": {
					"name": "Compensar Documento Gasto"
				},
				"0a532835-377c-4e5e-90d5-3d769da3b31d": {
					"name": "Compensar"
				},
				"59fa4602-11d2-4b32-843c-a7f4749fa6bf": {
					"name": "ScriptFormatValidacion"
				},
				"2464ede6-851f-4b7b-b815-6e0d4b7a89ba": {
					"name": "Validar Existe Documento"
				},
				"d12b3d32-90f3-42ea-ae38-4473d10a19e6": {
					"name": "¿Existe Documento en Tabla?"
				}
			},
			"sequenceFlows": {
				"834aa1ae-2d40-469a-91fa-169b544923c0": {
					"name": "SequenceFlow3"
				},
				"77897368-8d45-45bb-a64e-e07d41f1bc8c": {
					"name": "Rechazo"
				},
				"a3b8a302-9f27-4052-8e17-77e63ac3fd28": {
					"name": "SequenceFlow12"
				},
				"cfaa1eab-5c94-4ea9-b531-48c0ec526b1d": {
					"name": "SequenceFlow15"
				},
				"5a6ef2f1-6e90-4b1d-8f06-4734db861ab0": {
					"name": "SequenceFlow16"
				},
				"bb433819-2096-4754-b254-0465785aa480": {
					"name": "SequenceFlow17"
				},
				"a4db8c95-0ac7-4f32-b618-425f57aa823a": {
					"name": "SequenceFlow18"
				},
				"f6f5cdad-1f6b-46f2-a3f1-6b8724196b98": {
					"name": "No"
				},
				"f1befddf-9c5e-43e9-bcb3-904141ecc114": {
					"name": "Aprobado"
				},
				"f8658a70-dcd6-4f86-b127-429078872881": {
					"name": "SequenceFlow28"
				},
				"50efeb06-55cd-43a7-b21f-2c4afe7b2adb": {
					"name": "Sí"
				},
				"757a37f0-50e0-4297-a4ff-9223e5406531": {
					"name": "SequenceFlow30"
				},
				"63ffb91f-59cc-4c41-8d67-14291933d2c2": {
					"name": "SequenceFlow36"
				},
				"8e20453a-703b-48a8-a15b-07e230866326": {
					"name": "SequenceFlow37"
				},
				"2efecff2-d5d7-4540-8b69-acb9193b097b": {
					"name": "Migrado"
				},
				"e7710968-fc59-4cdf-9021-60aef1affba5": {
					"name": "Natural"
				},
				"529a9d59-044d-41e9-9d48-4616bc708ffd": {
					"name": "SequenceFlow40"
				},
				"6f861dfe-b11e-4276-a0a7-de7816b1061d": {
					"name": "SequenceFlow41"
				},
				"575e50cc-58ba-44e3-87d7-836397a70d47": {
					"name": "SequenceFlow45"
				},
				"8de0c729-6253-4e67-878b-be2f4102ba90": {
					"name": "SequenceFlow46"
				},
				"e4e2996f-0303-4578-bfed-8a11514a45a6": {
					"name": "SequenceFlow47"
				},
				"0897b0b7-4588-4c51-9fce-bcce41c64dfb": {
					"name": "SequenceFlow48"
				},
				"daebc2af-5a80-4c95-b7fd-34ec05ebafd5": {
					"name": "SequenceFlow49"
				},
				"7e753e09-f886-42c9-ac85-85f3f6f766af": {
					"name": "Solicitud"
				},
				"fd8dbfab-75ee-42f4-a520-73720b7b31c3": {
					"name": "Gasto"
				},
				"cf833fb9-67b8-4ae7-8952-86a48dc46232": {
					"name": "SequenceFlow52"
				},
				"1ffbeca0-cd47-479b-805b-df633cb5d3c3": {
					"name": "SequenceFlow53"
				},
				"83982798-e7eb-4172-a7aa-14fef121f334": {
					"name": "SequenceFlow54"
				},
				"b0c96d91-aa82-4ca2-bd6c-91d296d59556": {
					"name": "SequenceFlow55"
				},
				"33aa4fe7-c476-4557-9f28-09f6ed2fcaea": {
					"name": "Existe"
				},
				"7ef12903-a628-465c-9fe2-18d6d9823076": {
					"name": "No existe"
				}
			},
			"diagrams": {
				"302f2ed3-10ab-48b0-8ec2-fd683cc56b74": {}
			}
		},
		"f25b3b22-6384-403b-b514-5002d391cd01": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "Start",
			"sampleContextRefs": {
				"0628051a-ab87-455a-bb22-774e79289df2": {}
			}
		},
		"e0e69352-be7f-4377-981a-c9fe48503c12": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "End"
		},
		"55459a4f-ee99-45ad-b117-687dc3115395": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.dto} Fondo Fijo: ${context.Belnr}",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://medifarma-apps-rendicion-gastos-bs.cajachicataskui/cajachicataskui",
			"recipientUsers": "${context.userias}",
			"customAttributes": [{
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.dto} Fondo Fijo: ${context.Belnr}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "${context.SociedadTxt} (${context.Bukrs})"
			}, {
				"id": "CustomCreatedBy",
				"label": "CustomCreatedBy",
				"type": "string",
				"value": "${context.Pname} ${context.Usuario}"
			}],
			"id": "usertask1",
			"name": "Aprobación"
		},
		"550926c1-64c8-4a6d-8d3c-2aa71cb28db7": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "${context.getPrimerAprobadorSRV}",
			"httpMethod": "GET",
			"responseVariable": "${context.resultPrimerAprob}",
			"id": "servicetask1",
			"name": "Serv Get Aprobador Primer Nivel"
		},
		"0cbaa360-cf54-42a6-8313-430031ba9508": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/ScriptFormatDataInicial.js",
			"id": "scripttask1",
			"name": "ScriptFormatDataInicial"
		},
		"a0606a40-307e-4f7a-b08d-ed2ae2330036": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.correout}",
			"responseVariable": "${context.correoget}",
			"id": "servicetask2",
			"name": "Enviar Correo Aprobador SRV"
		},
		"cbf26194-75d5-4cee-baec-4dd51f3e35d3": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "¿Aprobado?",
			"default": "77897368-8d45-45bb-a64e-e07d41f1bc8c"
		},
		"a89ccae4-d5f1-495a-a2d7-20758a0bfeae": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/ScriptFormatDatosAprobacion.js",
			"id": "scripttask2",
			"name": "ScriptFormatDatosAprobacion"
		},
		"45fb4767-105c-4e5c-993c-6cc37c3923a8": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/ScriptFormatDatosRechazo.js",
			"id": "scripttask3",
			"name": "ScriptFormatDatosRechazo"
		},
		"46259d7d-f92a-4977-a2b5-8d22e03a54a5": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/${context.nombreEntidad}(Bukrs='${context.Bukrs}',Belnr='${context.Belnr}',Gjahr='${context.Gjahr}')",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.aprobarRequest}",
			"responseVariable": "${context.aprobarResponse}",
			"id": "servicetask3",
			"name": "Aprobar Documento SRV"
		},
		"66abf9cf-ce35-4c39-849d-ef5f78e1fd1b": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.correo.correoAprobacionRequest}",
			"responseVariable": "${context.correo.correoAprobacionResponse}",
			"id": "servicetask4",
			"name": "Enviar Correo Aprobacion SRV"
		},
		"393cf4cb-23f7-475a-aa0e-7d167e2fc24d": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/${context.nombreEntidad}(Bukrs='${context.Bukrs}',Belnr='${context.Belnr}',Gjahr='${context.Gjahr}')",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.rechazoRequest}",
			"responseVariable": "${context.rechazoResponse}",
			"headers": [],
			"id": "servicetask5",
			"name": "Rechazar Documento SRV"
		},
		"05542a93-c0bd-42ef-ae54-3457f7d4752e": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/CorreoSet",
			"httpMethod": "POST",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.correoRechazoRequest}",
			"responseVariable": "${context.correoRechazoResponse}",
			"id": "servicetask6",
			"name": "Enviar Correo Rechazo SRV"
		},
		"37ad433b-f540-4f18-9051-0ddf9a723d69": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "${context.getSegundoAprobadorSRV}",
			"httpMethod": "GET",
			"responseVariable": "${context.resultSegundoAprob}",
			"id": "servicetask7",
			"name": "Get Aprobador Segundo Nivel"
		},
		"45d4c15b-7ccf-415d-b4ac-1820ce68a65c": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway3",
			"name": "¿Es Segundo Nivel Aprobación?",
			"default": "f6f5cdad-1f6b-46f2-a3f1-6b8724196b98"
		},
		"cb793e33-40fe-4cab-b7df-3c045584dc15": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/ScriptURIAprobadoresPrimerNivel.js",
			"id": "scripttask4",
			"name": "ScriptURIAprobadoresPrimerNivel"
		},
		"914eec41-a3f1-427b-af87-36706108ba87": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/ScriptURIAprobadoresSegundoNivel.js",
			"id": "scripttask5",
			"name": "ScriptURIAprobadoresSegundoNivel"
		},
		"8f0ac164-f1c3-4ac4-a72c-f506ac7432be": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/Migration.js",
			"id": "scripttask6",
			"name": "Migration"
		},
		"b495a9fb-1ec4-41a6-ad29-420964f78787": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/dummy.js",
			"id": "scripttask7",
			"name": "dummy"
		},
		"30138994-769e-48ac-a0de-97a639162044": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway6",
			"name": "¿Es natural o migrado?",
			"default": "e7710968-fc59-4cdf-9021-60aef1affba5"
		},
		"2ea569f7-d10a-4d6c-a76a-c680381284f1": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway7",
			"name": "¿En qué paso se quedó?"
		},
		"f1775f5a-719d-4d68-8c3a-9f77ef42edac": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway9",
			"name": "¿Solicitud o Gasto?",
			"default": "7e753e09-f886-42c9-ac85-85f3f6f766af"
		},
		"f8f0993d-8d1a-454c-a037-869d5f46cdd7": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/${context.nombreEntidad}(Bukrs='${context.Bukrs}',Belnr='${context.Belnr}',Gjahr='${context.Gjahr}')",
			"httpMethod": "PUT",
			"xsrfPath": "/sap/opu/odata/eper/CAJACHICAFF_SRV",
			"requestVariable": "${context.aprobarRequest}",
			"responseVariable": "${context.Compensacion}",
			"id": "servicetask8",
			"name": "Compensar Documento Gasto"
		},
		"0a532835-377c-4e5e-90d5-3d769da3b31d": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/Compensar.js",
			"id": "scripttask8",
			"name": "Compensar"
		},
		"59fa4602-11d2-4b32-843c-a7f4749fa6bf": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/WF_CajaChicaFF/FormatValidacion.js",
			"id": "scripttask9",
			"name": "ScriptFormatValidacion"
		},
		"2464ede6-851f-4b7b-b815-6e0d4b7a89ba": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "ER_FF_S4H_HTTP_BASIC",
			"path": "/sap/opu/odata/eper/CAJACHICAFF_SRV/${context.PathValicacion}",
			"httpMethod": "GET",
			"responseVariable": "${context.ResponseValidation}",
			"id": "servicetask9",
			"name": "Validar Existe Documento"
		},
		"d12b3d32-90f3-42ea-ae38-4473d10a19e6": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway10",
			"name": "¿Existe Documento en Tabla?",
			"default": "7ef12903-a628-465c-9fe2-18d6d9823076"
		},
		"834aa1ae-2d40-469a-91fa-169b544923c0": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "550926c1-64c8-4a6d-8d3c-2aa71cb28db7",
			"targetRef": "0cbaa360-cf54-42a6-8313-430031ba9508"
		},
		"77897368-8d45-45bb-a64e-e07d41f1bc8c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow11",
			"name": "Rechazo",
			"sourceRef": "cbf26194-75d5-4cee-baec-4dd51f3e35d3",
			"targetRef": "45fb4767-105c-4e5c-993c-6cc37c3923a8"
		},
		"a3b8a302-9f27-4052-8e17-77e63ac3fd28": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow12",
			"name": "SequenceFlow12",
			"sourceRef": "a89ccae4-d5f1-495a-a2d7-20758a0bfeae",
			"targetRef": "46259d7d-f92a-4977-a2b5-8d22e03a54a5"
		},
		"cfaa1eab-5c94-4ea9-b531-48c0ec526b1d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow15",
			"name": "SequenceFlow15",
			"sourceRef": "46259d7d-f92a-4977-a2b5-8d22e03a54a5",
			"targetRef": "f1775f5a-719d-4d68-8c3a-9f77ef42edac"
		},
		"5a6ef2f1-6e90-4b1d-8f06-4734db861ab0": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow16",
			"name": "SequenceFlow16",
			"sourceRef": "66abf9cf-ce35-4c39-849d-ef5f78e1fd1b",
			"targetRef": "e0e69352-be7f-4377-981a-c9fe48503c12"
		},
		"bb433819-2096-4754-b254-0465785aa480": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow17",
			"name": "SequenceFlow17",
			"sourceRef": "05542a93-c0bd-42ef-ae54-3457f7d4752e",
			"targetRef": "e0e69352-be7f-4377-981a-c9fe48503c12"
		},
		"a4db8c95-0ac7-4f32-b618-425f57aa823a": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow18",
			"name": "SequenceFlow18",
			"sourceRef": "37ad433b-f540-4f18-9051-0ddf9a723d69",
			"targetRef": "0cbaa360-cf54-42a6-8313-430031ba9508"
		},
		"f6f5cdad-1f6b-46f2-a3f1-6b8724196b98": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow23",
			"name": "No",
			"sourceRef": "45d4c15b-7ccf-415d-b4ac-1820ce68a65c",
			"targetRef": "59fa4602-11d2-4b32-843c-a7f4749fa6bf"
		},
		"f1befddf-9c5e-43e9-bcb3-904141ecc114": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.stage==true}",
			"id": "sequenceflow27",
			"name": "Aprobado",
			"sourceRef": "cbf26194-75d5-4cee-baec-4dd51f3e35d3",
			"targetRef": "45d4c15b-7ccf-415d-b4ac-1820ce68a65c"
		},
		"f8658a70-dcd6-4f86-b127-429078872881": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow28",
			"name": "SequenceFlow28",
			"sourceRef": "cb793e33-40fe-4cab-b7df-3c045584dc15",
			"targetRef": "550926c1-64c8-4a6d-8d3c-2aa71cb28db7"
		},
		"50efeb06-55cd-43a7-b21f-2c4afe7b2adb": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.iNivelCount <= context.Nivel}",
			"id": "sequenceflow29",
			"name": "Sí",
			"sourceRef": "45d4c15b-7ccf-415d-b4ac-1820ce68a65c",
			"targetRef": "914eec41-a3f1-427b-af87-36706108ba87"
		},
		"757a37f0-50e0-4297-a4ff-9223e5406531": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow30",
			"name": "SequenceFlow30",
			"sourceRef": "914eec41-a3f1-427b-af87-36706108ba87",
			"targetRef": "37ad433b-f540-4f18-9051-0ddf9a723d69"
		},
		"63ffb91f-59cc-4c41-8d67-14291933d2c2": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow36",
			"name": "SequenceFlow36",
			"sourceRef": "f25b3b22-6384-403b-b514-5002d391cd01",
			"targetRef": "8f0ac164-f1c3-4ac4-a72c-f506ac7432be"
		},
		"8e20453a-703b-48a8-a15b-07e230866326": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow37",
			"name": "SequenceFlow37",
			"sourceRef": "8f0ac164-f1c3-4ac4-a72c-f506ac7432be",
			"targetRef": "30138994-769e-48ac-a0de-97a639162044"
		},
		"2efecff2-d5d7-4540-8b69-acb9193b097b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.migration_flag=='migrated'}",
			"id": "sequenceflow38",
			"name": "Migrado",
			"sourceRef": "30138994-769e-48ac-a0de-97a639162044",
			"targetRef": "2ea569f7-d10a-4d6c-a76a-c680381284f1"
		},
		"e7710968-fc59-4cdf-9021-60aef1affba5": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow39",
			"name": "Natural",
			"sourceRef": "30138994-769e-48ac-a0de-97a639162044",
			"targetRef": "cb793e33-40fe-4cab-b7df-3c045584dc15"
		},
		"529a9d59-044d-41e9-9d48-4616bc708ffd": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow40",
			"name": "SequenceFlow40",
			"sourceRef": "2ea569f7-d10a-4d6c-a76a-c680381284f1",
			"targetRef": "b495a9fb-1ec4-41a6-ad29-420964f78787"
		},
		"6f861dfe-b11e-4276-a0a7-de7816b1061d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow41",
			"name": "SequenceFlow41",
			"sourceRef": "0cbaa360-cf54-42a6-8313-430031ba9508",
			"targetRef": "b495a9fb-1ec4-41a6-ad29-420964f78787"
		},
		"575e50cc-58ba-44e3-87d7-836397a70d47": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow45",
			"name": "SequenceFlow45",
			"sourceRef": "45fb4767-105c-4e5c-993c-6cc37c3923a8",
			"targetRef": "393cf4cb-23f7-475a-aa0e-7d167e2fc24d"
		},
		"8de0c729-6253-4e67-878b-be2f4102ba90": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow46",
			"name": "SequenceFlow46",
			"sourceRef": "b495a9fb-1ec4-41a6-ad29-420964f78787",
			"targetRef": "a0606a40-307e-4f7a-b08d-ed2ae2330036"
		},
		"e4e2996f-0303-4578-bfed-8a11514a45a6": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow47",
			"name": "SequenceFlow47",
			"sourceRef": "a0606a40-307e-4f7a-b08d-ed2ae2330036",
			"targetRef": "55459a4f-ee99-45ad-b117-687dc3115395"
		},
		"0897b0b7-4588-4c51-9fce-bcce41c64dfb": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow48",
			"name": "SequenceFlow48",
			"sourceRef": "55459a4f-ee99-45ad-b117-687dc3115395",
			"targetRef": "cbf26194-75d5-4cee-baec-4dd51f3e35d3"
		},
		"daebc2af-5a80-4c95-b7fd-34ec05ebafd5": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow49",
			"name": "SequenceFlow49",
			"sourceRef": "393cf4cb-23f7-475a-aa0e-7d167e2fc24d",
			"targetRef": "05542a93-c0bd-42ef-ae54-3457f7d4752e"
		},
		"7e753e09-f886-42c9-ac85-85f3f6f766af": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow50",
			"name": "Solicitud",
			"sourceRef": "f1775f5a-719d-4d68-8c3a-9f77ef42edac",
			"targetRef": "66abf9cf-ce35-4c39-849d-ef5f78e1fd1b"
		},
		"fd8dbfab-75ee-42f4-a520-73720b7b31c3": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.Type == \"G\"}",
			"id": "sequenceflow51",
			"name": "Gasto",
			"sourceRef": "f1775f5a-719d-4d68-8c3a-9f77ef42edac",
			"targetRef": "0a532835-377c-4e5e-90d5-3d769da3b31d"
		},
		"cf833fb9-67b8-4ae7-8952-86a48dc46232": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow52",
			"name": "SequenceFlow52",
			"sourceRef": "f8f0993d-8d1a-454c-a037-869d5f46cdd7",
			"targetRef": "66abf9cf-ce35-4c39-849d-ef5f78e1fd1b"
		},
		"1ffbeca0-cd47-479b-805b-df633cb5d3c3": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow53",
			"name": "SequenceFlow53",
			"sourceRef": "0a532835-377c-4e5e-90d5-3d769da3b31d",
			"targetRef": "f8f0993d-8d1a-454c-a037-869d5f46cdd7"
		},
		"83982798-e7eb-4172-a7aa-14fef121f334": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow54",
			"name": "SequenceFlow54",
			"sourceRef": "59fa4602-11d2-4b32-843c-a7f4749fa6bf",
			"targetRef": "2464ede6-851f-4b7b-b815-6e0d4b7a89ba"
		},
		"b0c96d91-aa82-4ca2-bd6c-91d296d59556": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow55",
			"name": "SequenceFlow55",
			"sourceRef": "2464ede6-851f-4b7b-b815-6e0d4b7a89ba",
			"targetRef": "d12b3d32-90f3-42ea-ae38-4473d10a19e6"
		},
		"33aa4fe7-c476-4557-9f28-09f6ed2fcaea": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.ResponseValidation.d.results[0].Val3 == \"S\"}",
			"id": "sequenceflow56",
			"name": "Existe",
			"sourceRef": "d12b3d32-90f3-42ea-ae38-4473d10a19e6",
			"targetRef": "a89ccae4-d5f1-495a-a2d7-20758a0bfeae"
		},
		"7ef12903-a628-465c-9fe2-18d6d9823076": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow57",
			"name": "No existe",
			"sourceRef": "d12b3d32-90f3-42ea-ae38-4473d10a19e6",
			"targetRef": "e0e69352-be7f-4377-981a-c9fe48503c12"
		},
		"302f2ed3-10ab-48b0-8ec2-fd683cc56b74": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"e7bfa71a-9e7e-4415-a934-6226ca2a48c6": {},
				"740c3dbc-ec2a-4871-b420-f5f9511b12d1": {},
				"7469e1cf-0aa4-4e98-9fee-392511a166a1": {},
				"4279ab72-f78e-43bf-acfa-45ca71d293c5": {},
				"df655ee7-3b37-46d8-88b1-1d925d013158": {},
				"568ec2c6-a3db-4360-956e-a2dff917066b": {},
				"4e7ca93d-55b9-4f43-816a-efc895b96ca6": {},
				"00fcd417-e23f-4390-b937-c50779305413": {},
				"cb7c566f-9d31-44a8-9169-2c29544a27d6": {},
				"a2d435a4-1dc8-4c1a-8f02-fbaed7551e11": {},
				"f2e466ae-734f-4e46-837e-3c3924ad9e6d": {},
				"458656be-a284-49df-81e4-0c6051ed25f4": {},
				"538931f9-6600-4eb0-bc30-9ba4441f9132": {},
				"e528173d-47cb-4314-887e-91c937124299": {},
				"ee7e5ef3-b542-4551-8c69-864b31dea079": {},
				"13c3ecb3-6126-4862-9392-8d328524b21c": {},
				"aec69639-7005-422f-8677-d3875845041e": {},
				"7ea3de8a-0fbb-46d0-97e9-be61d72c36c8": {},
				"4260f675-5206-4f2d-b825-52bf3cb806a1": {},
				"fde7d40f-46f4-4d74-942b-add1209b9020": {},
				"6a6474ce-afd8-4069-a962-cd70537eb725": {},
				"e127c921-65ac-47a2-b752-75ebffb6db22": {},
				"12bab039-0c6e-4734-8b80-b05573c397de": {},
				"fe36cf14-8b46-4eb4-9769-255141e02255": {},
				"ed76ef9f-3664-46a6-995f-83f632c11a37": {},
				"81622caa-3361-4ab9-b4e8-df6fce5c38af": {},
				"c5710f68-61ca-436d-ba32-a1470b4d083b": {},
				"e8e93f9e-526c-4e15-ad5d-c0c383b1f654": {},
				"6d21352b-9fbb-49db-a8d7-606e5268c838": {},
				"db0af7c2-2e31-49af-b766-10d793dcbe1f": {},
				"673e922b-20a5-45f6-b60d-ff3f661ecc1f": {},
				"91156941-376e-470a-9e49-be2cf511bd98": {},
				"ce7a5556-3165-474b-88e3-82eed046bcd1": {},
				"0f22db49-d131-4832-8e3f-92ef9807d97f": {},
				"4a5e809a-aa52-4bb4-b420-4ccfa3048624": {},
				"642c03a1-a742-40b8-ba05-2cc497409db0": {},
				"42f0deee-f6a6-4e16-8199-1c7488bb3afe": {},
				"4263679e-5cce-45cf-893d-49e1d3f1307e": {},
				"76bc132a-2df1-42e2-bb7c-4c8964cb93ef": {},
				"eb1e3035-4465-4658-972e-43e5823f0e96": {},
				"23785288-0181-4f55-9486-e00c57653df7": {},
				"5174b689-5035-4040-b18e-b259c53899fa": {},
				"6ee8e8cd-f944-41f2-ad16-b34b778aa7af": {},
				"b4d1b251-020f-44e6-be36-edc7f6d004b6": {},
				"04081a7f-3de5-4b8f-bf2c-3291ce6cb961": {},
				"cbd4fe2b-c718-42ce-9924-6b7cd3dfe3ab": {},
				"2ad3b2a6-b9e4-4f10-a190-ac872ed863ca": {},
				"f9be9e73-3e23-4b2e-874b-5d07e83edf02": {},
				"82f91320-bf3a-443c-adc6-2f747198b7a4": {},
				"b1df9acb-074b-45bc-9a40-fe9ad49c879e": {},
				"4c6125ef-a19f-44c7-838e-ca2bdf688484": {},
				"9e25e034-7245-4f9c-8ba3-1f7f88538c6b": {},
				"a20816b5-5c5b-4013-9e97-c1767371446e": {},
				"416dc9d9-7bee-430f-bfeb-61ebb8e310d2": {},
				"4e9462d5-68b1-4ece-9852-b14ef6cbad0c": {},
				"d0aab906-a016-4361-a5da-fa73978ec166": {},
				"a9ed3243-cc13-40f3-836f-70f5490347c9": {},
				"5c19072a-fc91-4703-932d-3cd7320a8c48": {}
			}
		},
		"0628051a-ab87-455a-bb22-774e79289df2": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/WF_CajaChicaFF/infoInicio_CajaChicaFF.json",
			"id": "default-start-context"
		},
		"e7bfa71a-9e7e-4415-a934-6226ca2a48c6": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": -645,
			"y": 95,
			"width": 32,
			"height": 32,
			"object": "f25b3b22-6384-403b-b514-5002d391cd01"
		},
		"740c3dbc-ec2a-4871-b420-f5f9511b12d1": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 1357,
			"y": -88,
			"width": 35,
			"height": 35,
			"object": "e0e69352-be7f-4377-981a-c9fe48503c12"
		},
		"7469e1cf-0aa4-4e98-9fee-392511a166a1": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 373,
			"y": 70,
			"width": 100,
			"height": 60,
			"object": "55459a4f-ee99-45ad-b117-687dc3115395"
		},
		"4279ab72-f78e-43bf-acfa-45ca71d293c5": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": -348,
			"y": 82,
			"width": 100,
			"height": 60,
			"object": "550926c1-64c8-4a6d-8d3c-2aa71cb28db7"
		},
		"df655ee7-3b37-46d8-88b1-1d925d013158": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-298,116 -51.5,116",
			"sourceSymbol": "4279ab72-f78e-43bf-acfa-45ca71d293c5",
			"targetSymbol": "568ec2c6-a3db-4360-956e-a2dff917066b",
			"object": "834aa1ae-2d40-469a-91fa-169b544923c0"
		},
		"568ec2c6-a3db-4360-956e-a2dff917066b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -101.5,
			"y": 82,
			"width": 100,
			"height": 60,
			"object": "0cbaa360-cf54-42a6-8313-430031ba9508"
		},
		"4e7ca93d-55b9-4f43-816a-efc895b96ca6": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 159,
			"y": 89,
			"width": 100,
			"height": 60,
			"object": "a0606a40-307e-4f7a-b08d-ed2ae2330036"
		},
		"00fcd417-e23f-4390-b937-c50779305413": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 576,
			"y": -36,
			"object": "cbf26194-75d5-4cee-baec-4dd51f3e35d3"
		},
		"cb7c566f-9d31-44a8-9169-2c29544a27d6": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 899,
			"y": -275,
			"width": 100,
			"height": 60,
			"object": "a89ccae4-d5f1-495a-a2d7-20758a0bfeae"
		},
		"a2d435a4-1dc8-4c1a-8f02-fbaed7551e11": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 629,
			"y": 70,
			"width": 100,
			"height": 60,
			"object": "45fb4767-105c-4e5c-993c-6cc37c3923a8"
		},
		"f2e466ae-734f-4e46-837e-3c3924ad9e6d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "597,6 597,105.5 628.5,105.5",
			"sourceSymbol": "00fcd417-e23f-4390-b937-c50779305413",
			"targetSymbol": "a2d435a4-1dc8-4c1a-8f02-fbaed7551e11",
			"object": "77897368-8d45-45bb-a64e-e07d41f1bc8c"
		},
		"458656be-a284-49df-81e4-0c6051ed25f4": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1041,
			"y": -275,
			"width": 100,
			"height": 60,
			"object": "46259d7d-f92a-4977-a2b5-8d22e03a54a5"
		},
		"538931f9-6600-4eb0-bc30-9ba4441f9132": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "949,-245 1091,-245",
			"sourceSymbol": "cb7c566f-9d31-44a8-9169-2c29544a27d6",
			"targetSymbol": "458656be-a284-49df-81e4-0c6051ed25f4",
			"object": "a3b8a302-9f27-4052-8e17-77e63ac3fd28"
		},
		"e528173d-47cb-4314-887e-91c937124299": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1319,
			"y": -275,
			"width": 100,
			"height": 60,
			"object": "66abf9cf-ce35-4c39-849d-ef5f78e1fd1b"
		},
		"ee7e5ef3-b542-4551-8c69-864b31dea079": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 799,
			"y": 70,
			"width": 100,
			"height": 60,
			"object": "393cf4cb-23f7-475a-aa0e-7d167e2fc24d"
		},
		"13c3ecb3-6126-4862-9392-8d328524b21c": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1098,
			"y": 70,
			"width": 100,
			"height": 60,
			"object": "05542a93-c0bd-42ef-ae54-3457f7d4752e"
		},
		"aec69639-7005-422f-8677-d3875845041e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1091,-244 1195,-244",
			"sourceSymbol": "458656be-a284-49df-81e4-0c6051ed25f4",
			"targetSymbol": "04081a7f-3de5-4b8f-bf2c-3291ce6cb961",
			"object": "cfaa1eab-5c94-4ea9-b531-48c0ec526b1d"
		},
		"7ea3de8a-0fbb-46d0-97e9-be61d72c36c8": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1368.25,-245 1368.25,-69",
			"sourceSymbol": "e528173d-47cb-4314-887e-91c937124299",
			"targetSymbol": "740c3dbc-ec2a-4871-b420-f5f9511b12d1",
			"object": "5a6ef2f1-6e90-4b1d-8f06-4734db861ab0"
		},
		"4260f675-5206-4f2d-b825-52bf3cb806a1": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1148,100 1371,100 1371,-70.5",
			"sourceSymbol": "13c3ecb3-6126-4862-9392-8d328524b21c",
			"targetSymbol": "740c3dbc-ec2a-4871-b420-f5f9511b12d1",
			"object": "bb433819-2096-4754-b254-0465785aa480"
		},
		"fde7d40f-46f4-4d74-942b-add1209b9020": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": -101,
			"y": -264,
			"width": 100,
			"height": 60,
			"object": "37ad433b-f540-4f18-9051-0ddf9a723d69"
		},
		"6a6474ce-afd8-4069-a962-cd70537eb725": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 576,
			"y": -255,
			"object": "45d4c15b-7ccf-415d-b4ac-1820ce68a65c"
		},
		"e127c921-65ac-47a2-b752-75ebffb6db22": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-51.875,-234 -51.875,112",
			"sourceSymbol": "fde7d40f-46f4-4d74-942b-add1209b9020",
			"targetSymbol": "568ec2c6-a3db-4360-956e-a2dff917066b",
			"object": "a4db8c95-0ac7-4f32-b618-425f57aa823a"
		},
		"12bab039-0c6e-4734-8b80-b05573c397de": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "597,-238 720,-238",
			"sourceSymbol": "6a6474ce-afd8-4069-a962-cd70537eb725",
			"targetSymbol": "9e25e034-7245-4f9c-8ba3-1f7f88538c6b",
			"object": "f6f5cdad-1f6b-46f2-a3f1-6b8724196b98"
		},
		"fe36cf14-8b46-4eb4-9769-255141e02255": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "604,-15 604,-234",
			"sourceSymbol": "00fcd417-e23f-4390-b937-c50779305413",
			"targetSymbol": "6a6474ce-afd8-4069-a962-cd70537eb725",
			"object": "f1befddf-9c5e-43e9-bcb3-904141ecc114"
		},
		"ed76ef9f-3664-46a6-995f-83f632c11a37": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -566,
			"y": 81,
			"width": 100,
			"height": 60,
			"object": "cb793e33-40fe-4cab-b7df-3c045584dc15"
		},
		"81622caa-3361-4ab9-b4e8-df6fce5c38af": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-516,111.5 -298,111.5",
			"sourceSymbol": "ed76ef9f-3664-46a6-995f-83f632c11a37",
			"targetSymbol": "4279ab72-f78e-43bf-acfa-45ca71d293c5",
			"object": "f8658a70-dcd6-4f86-b127-429078872881"
		},
		"c5710f68-61ca-436d-ba32-a1470b4d083b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 295,
			"y": -264,
			"width": 155,
			"height": 60,
			"object": "914eec41-a3f1-427b-af87-36706108ba87"
		},
		"e8e93f9e-526c-4e15-ad5d-c0c383b1f654": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "597,-234 372.5,-234",
			"sourceSymbol": "6a6474ce-afd8-4069-a962-cd70537eb725",
			"targetSymbol": "c5710f68-61ca-436d-ba32-a1470b4d083b",
			"object": "50efeb06-55cd-43a7-b21f-2c4afe7b2adb"
		},
		"6d21352b-9fbb-49db-a8d7-606e5268c838": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "372.5,-234 -50,-234",
			"sourceSymbol": "c5710f68-61ca-436d-ba32-a1470b4d083b",
			"targetSymbol": "fde7d40f-46f4-4d74-942b-add1209b9020",
			"object": "757a37f0-50e0-4297-a4ff-9223e5406531"
		},
		"db0af7c2-2e31-49af-b766-10d793dcbe1f": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -491,
			"y": 337,
			"width": 100,
			"height": 60,
			"object": "8f0ac164-f1c3-4ac4-a72c-f506ac7432be"
		},
		"673e922b-20a5-45f6-b60d-ff3f661ecc1f": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": -103,
			"y": 216,
			"width": 100,
			"height": 60,
			"object": "b495a9fb-1ec4-41a6-ad29-420964f78787"
		},
		"91156941-376e-470a-9e49-be2cf511bd98": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-629,111 -629,367 -490.5,367",
			"sourceSymbol": "e7bfa71a-9e7e-4415-a934-6226ca2a48c6",
			"targetSymbol": "db0af7c2-2e31-49af-b766-10d793dcbe1f",
			"object": "63ffb91f-59cc-4c41-8d67-14291933d2c2"
		},
		"ce7a5556-3165-474b-88e3-82eed046bcd1": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": -277,
			"y": 346,
			"object": "30138994-769e-48ac-a0de-97a639162044"
		},
		"0f22db49-d131-4832-8e3f-92ef9807d97f": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-441,367 -256,367",
			"sourceSymbol": "db0af7c2-2e31-49af-b766-10d793dcbe1f",
			"targetSymbol": "ce7a5556-3165-474b-88e3-82eed046bcd1",
			"object": "8e20453a-703b-48a8-a15b-07e230866326"
		},
		"4a5e809a-aa52-4bb4-b420-4ccfa3048624": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": -74,
			"y": 346,
			"object": "2ea569f7-d10a-4d6c-a76a-c680381284f1"
		},
		"642c03a1-a742-40b8-ba05-2cc497409db0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-256,367 -53,367",
			"sourceSymbol": "ce7a5556-3165-474b-88e3-82eed046bcd1",
			"targetSymbol": "4a5e809a-aa52-4bb4-b420-4ccfa3048624",
			"object": "2efecff2-d5d7-4540-8b69-acb9193b097b"
		},
		"42f0deee-f6a6-4e16-8199-1c7488bb3afe": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-256,367 -256,263 -517,263 -517,140.5",
			"sourceSymbol": "ce7a5556-3165-474b-88e3-82eed046bcd1",
			"targetSymbol": "ed76ef9f-3664-46a6-995f-83f632c11a37",
			"object": "e7710968-fc59-4cdf-9021-60aef1affba5"
		},
		"4263679e-5cce-45cf-893d-49e1d3f1307e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-53,367 -53,275.5",
			"sourceSymbol": "4a5e809a-aa52-4bb4-b420-4ccfa3048624",
			"targetSymbol": "673e922b-20a5-45f6-b60d-ff3f661ecc1f",
			"object": "529a9d59-044d-41e9-9d48-4616bc708ffd"
		},
		"76bc132a-2df1-42e2-bb7c-4c8964cb93ef": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-52.25,112 -52.25,216.5",
			"sourceSymbol": "568ec2c6-a3db-4360-956e-a2dff917066b",
			"targetSymbol": "673e922b-20a5-45f6-b60d-ff3f661ecc1f",
			"object": "6f861dfe-b11e-4276-a0a7-de7816b1061d"
		},
		"eb1e3035-4465-4658-972e-43e5823f0e96": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "679,100 843,100",
			"sourceSymbol": "a2d435a4-1dc8-4c1a-8f02-fbaed7551e11",
			"targetSymbol": "ee7e5ef3-b542-4551-8c69-864b31dea079",
			"object": "575e50cc-58ba-44e3-87d7-836397a70d47"
		},
		"23785288-0181-4f55-9486-e00c57653df7": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "-53,246 78.25,246 78.25,126 209,126",
			"sourceSymbol": "673e922b-20a5-45f6-b60d-ff3f661ecc1f",
			"targetSymbol": "4e7ca93d-55b9-4f43-816a-efc895b96ca6",
			"object": "8de0c729-6253-4e67-878b-be2f4102ba90"
		},
		"5174b689-5035-4040-b18e-b259c53899fa": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "209,119 316.25,119 316.25,100 429,100",
			"sourceSymbol": "4e7ca93d-55b9-4f43-816a-efc895b96ca6",
			"targetSymbol": "7469e1cf-0aa4-4e98-9fee-392511a166a1",
			"object": "e4e2996f-0303-4578-bfed-8a11514a45a6"
		},
		"6ee8e8cd-f944-41f2-ad16-b34b778aa7af": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "423,100 524.75,100 524.75,-15 597,-15",
			"sourceSymbol": "7469e1cf-0aa4-4e98-9fee-392511a166a1",
			"targetSymbol": "00fcd417-e23f-4390-b937-c50779305413",
			"object": "0897b0b7-4588-4c51-9fce-bcce41c64dfb"
		},
		"b4d1b251-020f-44e6-be36-edc7f6d004b6": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "849,97 1129,97",
			"sourceSymbol": "ee7e5ef3-b542-4551-8c69-864b31dea079",
			"targetSymbol": "13c3ecb3-6126-4862-9392-8d328524b21c",
			"object": "daebc2af-5a80-4c95-b7fd-34ec05ebafd5"
		},
		"04081a7f-3de5-4b8f-bf2c-3291ce6cb961": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 1177,
			"y": -266,
			"object": "f1775f5a-719d-4d68-8c3a-9f77ef42edac"
		},
		"cbd4fe2b-c718-42ce-9924-6b7cd3dfe3ab": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1198,-244 1318.5,-244",
			"sourceSymbol": "04081a7f-3de5-4b8f-bf2c-3291ce6cb961",
			"targetSymbol": "e528173d-47cb-4314-887e-91c937124299",
			"object": "7e753e09-f886-42c9-ac85-85f3f6f766af"
		},
		"2ad3b2a6-b9e4-4f10-a190-ac872ed863ca": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 1319,
			"y": -444,
			"width": 100,
			"height": 60,
			"object": "f8f0993d-8d1a-454c-a037-869d5f46cdd7"
		},
		"f9be9e73-3e23-4b2e-874b-5d07e83edf02": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1192.5,-245 1192.5,-402",
			"sourceSymbol": "04081a7f-3de5-4b8f-bf2c-3291ce6cb961",
			"targetSymbol": "b1df9acb-074b-45bc-9a40-fe9ad49c879e",
			"object": "fd8dbfab-75ee-42f4-a520-73720b7b31c3"
		},
		"82f91320-bf3a-443c-adc6-2f747198b7a4": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1369,-414 1369,-247",
			"sourceSymbol": "2ad3b2a6-b9e4-4f10-a190-ac872ed863ca",
			"targetSymbol": "e528173d-47cb-4314-887e-91c937124299",
			"object": "cf833fb9-67b8-4ae7-8952-86a48dc46232"
		},
		"b1df9acb-074b-45bc-9a40-fe9ad49c879e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 1141,
			"y": -436,
			"width": 100,
			"height": 60,
			"object": "0a532835-377c-4e5e-90d5-3d769da3b31d"
		},
		"4c6125ef-a19f-44c7-838e-ca2bdf688484": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1191,-410 1351,-410",
			"sourceSymbol": "b1df9acb-074b-45bc-9a40-fe9ad49c879e",
			"targetSymbol": "2ad3b2a6-b9e4-4f10-a190-ac872ed863ca",
			"object": "1ffbeca0-cd47-479b-805b-df633cb5d3c3"
		},
		"9e25e034-7245-4f9c-8ba3-1f7f88538c6b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 690,
			"y": -266,
			"width": 100,
			"height": 60,
			"object": "59fa4602-11d2-4b32-843c-a7f4749fa6bf"
		},
		"a20816b5-5c5b-4013-9e97-c1767371446e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 690,
			"y": -138,
			"width": 100,
			"height": 60,
			"object": "2464ede6-851f-4b7b-b815-6e0d4b7a89ba"
		},
		"416dc9d9-7bee-430f-bfeb-61ebb8e310d2": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "742,-236 742,-114",
			"sourceSymbol": "9e25e034-7245-4f9c-8ba3-1f7f88538c6b",
			"targetSymbol": "a20816b5-5c5b-4013-9e97-c1767371446e",
			"object": "83982798-e7eb-4172-a7aa-14fef121f334"
		},
		"4e9462d5-68b1-4ece-9852-b14ef6cbad0c": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 857,
			"y": -129,
			"object": "d12b3d32-90f3-42ea-ae38-4473d10a19e6"
		},
		"d0aab906-a016-4361-a5da-fa73978ec166": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "740,-108 878,-108",
			"sourceSymbol": "a20816b5-5c5b-4013-9e97-c1767371446e",
			"targetSymbol": "4e9462d5-68b1-4ece-9852-b14ef6cbad0c",
			"object": "b0c96d91-aa82-4ca2-bd6c-91d296d59556"
		},
		"a9ed3243-cc13-40f3-836f-70f5490347c9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "878,-108 878,-247 923,-247",
			"sourceSymbol": "4e9462d5-68b1-4ece-9852-b14ef6cbad0c",
			"targetSymbol": "cb7c566f-9d31-44a8-9169-2c29544a27d6",
			"object": "33aa4fe7-c476-4557-9f28-09f6ed2fcaea"
		},
		"5c19072a-fc91-4703-932d-3cd7320a8c48": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "878,-108 1128,-108 1128,-70.5 1357.5,-70.5",
			"sourceSymbol": "4e9462d5-68b1-4ece-9852-b14ef6cbad0c",
			"targetSymbol": "740c3dbc-ec2a-4871-b420-f5f9511b12d1",
			"object": "7ef12903-a628-465c-9fe2-18d6d9823076"
		},
		"0c40f3e4-cb58-4ee7-966f-4dcb076822a6": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"sequenceflow": 57,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 9,
			"scripttask": 9,
			"exclusivegateway": 10,
			"parallelgateway": 2
		}
	}
}