$Firefly
		.createClass(
				"sap.firefly.InAPlanningCapabilitiesProviderFactory",
				sap.firefly.XObject,
				{
					$statics : {
						staticSetup : function() {
							sap.firefly.PlanningService.s_capabilitiesProviderFactory = new sap.firefly.InAPlanningCapabilitiesProviderFactory();
						}
					},
					create : function(serverMetadata, providerType) {
						return sap.firefly.InAQMgrCapabilities.create(
								serverMetadata, providerType);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningVariableProcessorProviderFactory",
				sap.firefly.XObject,
				{
					$statics : {
						staticSetup : function() {
							sap.firefly.PlanningCommandWithId.s_variableProcessorProviderFactory = new sap.firefly.PlanningVariableProcessorProviderFactory();
						}
					},
					createProvider : function(variableRequestor,
							requestorProvider) {
						return sap.firefly.InAPlanningVarProcessorProvider
								.createInAVariableProcessorProvider(
										variableRequestor, requestorProvider);
					}
				});
$Firefly.createClass("sap.firefly.InAQMgrMergeSettings", sap.firefly.XObject, {
	$statics : {
		create : function(isInitialBWMerge) {
			var newObj = new sap.firefly.InAQMgrMergeSettings();
			newObj.m_isInitialBWMerge = isInitialBWMerge;
			return newObj;
		}
	},
	m_isInitialBWMerge : false,
	isInitialBWMerge : function() {
		return this.m_isInitialBWMerge;
	}
});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrStartupBlending",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(syncAction) {
							var newObject = new sap.firefly.InAQMgrStartupBlending();
							newObject.m_syncAction = syncAction;
							return newObject;
						}
					},
					m_syncAction : null,
					m_implicitBatchStarted : false,
					m_hasPreQueries : false,
					releaseObject : function() {
						this.m_syncAction = null;
					},
					prepare : function() {
						var serviceConfig = this.m_syncAction.getQueryManager()
								.getServiceConfig();
						var blendingDefinition = serviceConfig
								.getBlendingDefinition();
						var blendingSources = blendingDefinition.getSources();
						var blendingSource;
						var blendingQueryManager;
						var blendingUri;
						var preQueries;
						if (blendingSources.isEmpty()) {
							return false;
						}
						blendingSource = blendingSources.get(0);
						blendingQueryManager = blendingSource.getQueryModel()
								.getQueryManager();
						blendingUri = this.getUri(blendingSource);
						this.m_implicitBatchStarted = false;
						this.m_hasPreQueries = false;
						if (this.executeRemoteQueries(blendingSources,
								blendingQueryManager, blendingUri) === false) {
							return false;
						}
						preQueries = this.getBlendingPreQueries(
								blendingSources, blendingUri);
						if (preQueries.hasElements()) {
							this.startImplicitBatchMode();
							this.executePreQueries(preQueries);
							this.m_hasPreQueries = true;
						}
						return true;
					},
					process : function(rpcFunction, syncType, listener) {
						if (this.m_hasPreQueries) {
							rpcFunction.processFunctionExecution(
									sap.firefly.SyncType.NON_BLOCKING,
									listener,
									sap.firefly.QueryManagerMode.BLENDING);
							this.stopImplicitBatchMode(
									this.m_implicitBatchStarted, syncType);
						} else {
							rpcFunction.processFunctionExecution(syncType,
									listener,
									sap.firefly.QueryManagerMode.BLENDING);
						}
						return true;
					},
					executeRemoteQueries : function(blendingSources,
							blendingQueryManager, blendingUri) {
						var i;
						var source;
						var queryModel;
						var queryManager;
						var syncAction;
						for (i = 0; i < blendingSources.size(); i++) {
							source = blendingSources.get(i);
							if (!sap.firefly.XString.isEqual(blendingUri, this
									.getUri(source))) {
								source.setIsRemoteSource(true);
								queryModel = source.getQueryModel();
								queryManager = queryModel.getQueryManager();
								this.validateSystemMapping(
										blendingQueryManager, queryManager);
								this.enableResultSetPersistancy(
										blendingQueryManager, queryManager);
								this.updateInstanceId(queryModel, queryManager);
								syncAction = queryManager
										.processQueryExecution(
												sap.firefly.SyncType.BLOCKING,
												null, null);
								this.m_syncAction.addAllMessages(syncAction);
								if (syncAction.hasErrors()
										|| syncAction.isSyncCanceled()) {
									return false;
								}
							}
						}
						return true;
					},
					validateSystemMapping : function(blendingQueryManager,
							remoteQueryManager) {
						var sdBlendingHost = blendingQueryManager
								.getSystemDescription();
						var sdRemote = remoteQueryManager
								.getSystemDescription();
						var mappingBlendingHost = sdBlendingHost
								.getSystemMapping(sdRemote.getName());
						var mappingRemoteHost = sdRemote
								.getSystemMapping(sdBlendingHost.getName());
						var serializationTable;
						var serializationSchema;
						var deserializationTable;
						var deserializationSchema;
						if (mappingBlendingHost === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("No mapping found for blending host");
						}
						if (mappingRemoteHost === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("No mapping found for remote host");
						}
						serializationTable = mappingRemoteHost
								.getSerializeTable();
						serializationSchema = mappingRemoteHost
								.getSerializeSchema();
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(serializationTable)
								|| sap.firefly.XStringUtils
										.isNullOrEmpty(serializationSchema)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("No valid system mapping defined for remote host");
						}
						deserializationTable = mappingBlendingHost
								.getDeserializeTable();
						deserializationSchema = mappingBlendingHost
								.getDeserializeSchema();
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(deserializationTable)
								|| sap.firefly.XStringUtils
										.isNullOrEmpty(deserializationSchema)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("No valid system mapping defined for blending host");
						}
						if (!sap.firefly.XString.isEqual(serializationTable,
								deserializationTable)
								|| !sap.firefly.XString.isEqual(
										serializationSchema,
										deserializationSchema)) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XStringUtils
											.concatenate5(
													"System mapping for ",
													sdBlendingHost.getName(),
													" and ",
													sdRemote.getName(),
													" doesn't match"));
						}
					},
					enableResultSetPersistancy : function(blendingQueryManager,
							remoteQueryManager) {
						var blendingSystemName = blendingQueryManager
								.getSystemDescription().getName();
						var sdRemote = remoteQueryManager
								.getSystemDescription();
						var systemMapping = sdRemote
								.getSystemMapping(blendingSystemName);
						remoteQueryManager.setResultSetPersistanceEnabled(true);
						remoteQueryManager
								.setResultSetPersistanceTargetTable(systemMapping
										.getSerializeTable());
						remoteQueryManager
								.setResultSetPersistanceTargetSchema(systemMapping
										.getSerializeSchema());
					},
					updateInstanceId : function(queryModel, queryManager) {
						var baseDataSource = queryModel.getDataSource();
						var systemDescription;
						var user;
						var request;
						var host;
						var sid;
						var instanceId;
						baseDataSource.setInstanceId(null);
						systemDescription = queryManager.getSystemDescription();
						user = systemDescription.getUser();
						request = queryModel
								.serializeToFormat(sap.firefly.QModelFormat.INA_DATA);
						host = systemDescription.getHost();
						sid = queryManager.getSession().getAppSessionId();
						instanceId = sap.firefly.XString
								.createSHA1(sap.firefly.XStringUtils
										.concatenate4(user, request, host, sid));
						baseDataSource.setInstanceId(instanceId);
						queryManager
								.setResultSetPersistanceIdentifier(instanceId);
					},
					getBlendingPreQueries : function(blendingSources,
							blendingUri) {
						var preQueries = sap.firefly.XList.create();
						var i;
						var source;
						for (i = 0; i < blendingSources.size(); i++) {
							source = blendingSources.get(i);
							if (sap.firefly.XString.isEqual(blendingUri, this
									.getUri(source))) {
								preQueries.addAll(source.getQueryModel()
										.getPreQueries());
							}
						}
						return preQueries;
					},
					startImplicitBatchMode : function() {
						var connectionPool = this.m_syncAction.getApplication()
								.getConnectionPool();
						var systemName = this.m_syncAction.getQueryManager()
								.getSystemDescription().getName();
						if (connectionPool.isBatchModeEnabled(systemName) === false) {
							connectionPool.enableBatchMode(systemName);
							this.m_implicitBatchStarted = true;
						} else {
							this.m_implicitBatchStarted = false;
						}
					},
					stopImplicitBatchMode : function(implicitBatchStarted,
							syncType) {
						var connectionPool;
						var systemName;
						if (implicitBatchStarted
								&& (this.m_syncAction.getQueryManagerBase()
										.getPreQueryName() === null)) {
							connectionPool = this.m_syncAction.getApplication()
									.getConnectionPool();
							systemName = this.m_syncAction.getQueryManager()
									.getSystemDescription().getName();
							connectionPool.disableBatchMode(syncType,
									systemName);
						}
					},
					executePreQueries : function(preQueries) {
						var i;
						var preQueryPair;
						var preQueryManager;
						for (i = 0; i < preQueries.size(); i++) {
							preQueryPair = preQueries.get(i);
							preQueryManager = preQueryPair.getObject()
									.getQueryManager();
							preQueryManager.setPreQueryName(preQueryPair
									.getName());
							preQueryManager.processQueryExecution(
									sap.firefly.SyncType.NON_BLOCKING, null,
									null);
							preQueryManager.setPreQueryName(null);
						}
					},
					getUri : function(source) {
						var queryManager = source.getQueryModel()
								.getQueryManager();
						var systemDescription = queryManager
								.getSystemDescription();
						return systemDescription.getUriString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrUtils",
				sap.firefly.XObject,
				{
					$statics : {
						applyResultSetFeatureCapabilities : function(provider,
								inaQueryModel) {
							var rsFeatureCapabilities = inaQueryModel
									.getStructureByName(sap.firefly.InAConstants.QY_RESULT_SET_FEATURE_CAPABILITIES);
							var rsFormat;
							var useEncodedRs;
							var i;
							var format;
							if (rsFeatureCapabilities !== null) {
								rsFormat = rsFeatureCapabilities
										.getListByName(sap.firefly.InAConstants.QY_RESULT_FORMAT);
								if (rsFormat !== null) {
									useEncodedRs = provider.useEncodedRs();
									if (useEncodedRs) {
										useEncodedRs = false;
										for (i = 0; i < rsFormat.size(); i++) {
											format = rsFormat
													.getStringByIndex(i);
											if (sap.firefly.XString
													.isEqual(
															format,
															sap.firefly.InAConstants.VA_RS_FORMAT_V2)) {
												useEncodedRs = true;
												break;
											}
										}
										provider.setUseEncodedRs(useEncodedRs);
									}
								}
							}
						}
					}
				});
$Firefly.createClass("sap.firefly.InARsEncodedValues", sap.firefly.XObject, {
	$statics : {
		createByStructure : function(inaValueElement) {
			var inaEncoding = inaValueElement
					.getStringByName(sap.firefly.InAConstants.QY_ENCODING);
			var encoding = sap.firefly.QInAConverter
					.lookupEncoding(inaEncoding);
			var inaValues = inaValueElement
					.getListByName(sap.firefly.InAConstants.QY_VALUES);
			var size = inaValueElement.getIntegerByNameWithDefault(
					sap.firefly.InAConstants.QY_SIZE, inaValues.size());
			return sap.firefly.InARsEncodedValues.create(encoding, inaValues,
					size);
		},
		create : function(encoding, values, size) {
			var object = new sap.firefly.InARsEncodedValues();
			object.setup(encoding, values);
			return object;
		}
	},
	m_values : null,
	m_index : 0,
	m_size : 0,
	setup : function(encoding, values) {
		this.m_values = values;
		this.m_index = -1;
		if (encoding !== sap.firefly.ResultSetEncoding.NONE) {
			throw sap.firefly.XException
					.createIllegalStateException("Wrong or no encoding given");
		}
		this.m_size = values.size();
	},
	releaseObject : function() {
		this.m_values = null;
		sap.firefly.InARsEncodedValues.$superclass.releaseObject.call(this);
	},
	getNextIntegerValue : function() {
		this.m_index++;
		return this.m_values.getIntegerByIndex(this.m_index);
	},
	getNextStringValue : function() {
		this.m_index++;
		return this.m_values.getStringByIndex(this.m_index);
	},
	getNextDoubleValue : function() {
		this.m_index++;
		return this.m_values.getDoubleByIndex(this.m_index);
	},
	hasNextValue : function() {
		return (this.m_index + 1) < this.m_size;
	},
	resetCursor : function() {
		this.m_index = -1;
	},
	skip : function() {
		this.m_index++;
	},
	size : function() {
		return this.m_size;
	}
});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrCapabilities",
				sap.firefly.InACapabilitiesProvider,
				{
					$statics : {
						CLIENT_QUERY_PERSISTENCY_CAPABILITIES : null,
						CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES : null,
						staticSetup : function() {
							sap.firefly.InAQMgrCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES = sap.firefly.CapabilityContainer
									.create("persistency");
							sap.firefly.InAQMgrCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_PERSISTENCY_INA_MODEL);
							sap.firefly.InAQMgrCapabilities.CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES = sap.firefly.CapabilityContainer
									.create("main");
							sap.firefly.InAQMgrCapabilities.CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CLIENT_CAPABILITIES);
							sap.firefly.InAQMgrCapabilities.CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_NAME_VARIABLE);
						},
						checkMainVersion : function(serverMetadata,
								providerType) {
							var mainCapabilities = sap.firefly.InAQMgrCapabilities
									.getServerMainCapabilitiesForProviderType(
											serverMetadata, providerType);
							return (mainCapabilities !== null);
						},
						getServerMainCapabilitiesForProviderType : function(
								serverMetadata, providerType) {
							var mainCapabilities = null;
							if (providerType === sap.firefly.ProviderType.CATALOG) {
								mainCapabilities = serverMetadata
										.getMetadataForService(sap.firefly.ServerService.CATALOG);
							} else {
								if (providerType === sap.firefly.ProviderType.PLANNING_COMMAND) {
									mainCapabilities = serverMetadata
											.getMetadataForService(sap.firefly.ServerService.PLANNING);
								} else {
									if (providerType === sap.firefly.ProviderType.ANALYTICS_VALUE_HELP) {
										mainCapabilities = serverMetadata
												.getMetadataForService(sap.firefly.ServerService.VALUE_HELP);
									} else {
										if (providerType === sap.firefly.ProviderType.LIST_REPORTING) {
											mainCapabilities = serverMetadata
													.getMetadataForService(sap.firefly.ServerService.LIST_REPORTING);
										}
									}
								}
							}
							if (mainCapabilities === null) {
								if ((providerType === sap.firefly.ProviderType.ANALYTICS)
										|| (providerType === sap.firefly.ProviderType.ANALYTICS_VALUE_HELP)
										|| ((providerType === sap.firefly.ProviderType.PLANNING) || (providerType === sap.firefly.ProviderType.CATALOG))) {
									mainCapabilities = serverMetadata
											.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
								}
							}
							return mainCapabilities;
						},
						create : function(serverMetadata, providerType) {
							var inaCapabilities = new sap.firefly.InAQMgrCapabilities();
							var serverMainCapabilitiesForProviderType;
							var betaMetadataForAnalytic;
							var metadataForService;
							if (providerType === sap.firefly.ProviderType.PLANNING_COMMAND) {
								inaCapabilities.m_clientMainCapabilities = sap.firefly.InAQMgrCapabilities.CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES;
							} else {
								inaCapabilities.m_clientMainCapabilities = sap.firefly.InACapabilitiesProvider
										.createMainCapabilities(serverMetadata
												.getSession().getVersion());
							}
							if ((serverMetadata !== null)
									&& (providerType !== null)) {
								serverMainCapabilitiesForProviderType = sap.firefly.InAQMgrCapabilities
										.getServerMainCapabilitiesForProviderType(
												serverMetadata, providerType);
								if (serverMainCapabilitiesForProviderType !== null) {
									inaCapabilities.m_serverMainCapabilities = serverMainCapabilitiesForProviderType
											.clone();
								}
								betaMetadataForAnalytic = serverMetadata
										.getBetaMetadataForAnalytic();
								if (betaMetadataForAnalytic !== null) {
									inaCapabilities.m_serverBetaCapabilities = betaMetadataForAnalytic
											.clone();
								}
								metadataForService = serverMetadata
										.getMetadataForService(sap.firefly.ServerService.MODEL_PERSISTENCY);
								if (metadataForService !== null) {
									inaCapabilities.m_serverPersistencyCapabilities = metadataForService
											.clone();
								}
							}
							return inaCapabilities;
						}
					},
					m_serverPersistencyCapabilities : null,
					m_activePersistencyCapabilities : null,
					m_deserializationDocumentCapabilities : null,
					m_activeDeserializationCapabilities : null,
					getClientPersistencyCapabilities : function() {
						return sap.firefly.InAQMgrCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES;
					},
					getServerPersistencyCapabilities : function() {
						return this.m_serverPersistencyCapabilities;
					},
					importDeserializationDocumentCapabilities : function(
							document) {
						var analytics;
						var capabilities;
						var i;
						var value;
						this.m_deserializationDocumentCapabilities = sap.firefly.CapabilityContainer
								.create("Document");
						analytics = document
								.getStructureByName(sap.firefly.InAConstants.QY_ANALYTICS);
						if (analytics !== null) {
							capabilities = analytics
									.getListByName(sap.firefly.InAConstants.QY_CAPABILITIES);
							if (capabilities !== null) {
								for (i = 0; i < capabilities.size(); i++) {
									value = capabilities.getStringByIndex(i);
									this.m_deserializationDocumentCapabilities
											.addCapability(value);
								}
							}
						}
					},
					getDeserializationDocumentCapabilities : function() {
						return this.m_deserializationDocumentCapabilities;
					},
					getActiveDeserializationCapabilities : function() {
						if (this.m_activeDeserializationCapabilities === null) {
							if ((this.m_clientMainCapabilities !== null)
									&& (this.m_deserializationDocumentCapabilities !== null)) {
								this.m_activeDeserializationCapabilities = this.m_deserializationDocumentCapabilities
										.intersect(this.m_clientMainCapabilities);
							}
						}
						return this.m_activeDeserializationCapabilities;
					},
					getActivePersistencyCapabilities : function() {
						var clientCapabilities;
						var serverCapabilities;
						if (this.m_activePersistencyCapabilities === null) {
							clientCapabilities = this
									.getClientPersistencyCapabilities();
							serverCapabilities = this
									.getServerPersistencyCapabilities();
							if ((clientCapabilities !== null)
									&& (serverCapabilities !== null)) {
								this.m_activePersistencyCapabilities = clientCapabilities
										.intersect(serverCapabilities);
							}
						}
						return this.m_activePersistencyCapabilities;
					},
					releaseObject : function() {
						this.m_activeDeserializationCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_activeDeserializationCapabilities);
						this.m_serverPersistencyCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_serverPersistencyCapabilities);
						this.m_activePersistencyCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_activePersistencyCapabilities);
						this.m_deserializationDocumentCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_deserializationDocumentCapabilities);
						sap.firefly.InAQMgrCapabilities.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						if (this.m_serverMainCapabilities !== null) {
							buffer.append("=== Server Main Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_serverMainCapabilities
									.toString());
							buffer.appendNewLine();
						}
						if (this.m_serverMainCapabilities !== null) {
							buffer
									.append("=== Server Persistency Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_serverPersistencyCapabilities
									.toString());
							buffer.appendNewLine();
						}
						if (this.m_clientMainCapabilities !== null) {
							buffer.append("=== Client Main Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_clientMainCapabilities
									.toString());
							buffer.appendNewLine();
						}
						if (sap.firefly.InAQMgrCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES !== null) {
							buffer
									.append("=== Client Persistency Capabilities ===");
							buffer.appendNewLine();
							buffer
									.append(sap.firefly.InAQMgrCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES
											.toString());
							buffer.appendNewLine();
						}
						if (this.m_activeMainCapabilities !== null) {
							buffer.append("=== Active Main Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_activeMainCapabilities
									.toString());
							buffer.appendNewLine();
						}
						if (this.m_activePersistencyCapabilities !== null) {
							buffer
									.append("=== Active Persistency Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_activePersistencyCapabilities
									.toString());
							buffer.appendNewLine();
						}
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InARsDimension",
				sap.firefly.DfNameObject,
				{
					$statics : {
						create : function(dimensionName, inaAttributes,
								dimension) {
							var object = new sap.firefly.InARsDimension();
							object.setup(dimensionName, inaAttributes,
									dimension);
							return object;
						}
					},
					m_fields : null,
					m_displayValues : null,
					m_drillStates : null,
					m_memberIndexes : null,
					m_parentIndexes : null,
					m_nodeIds : null,
					m_childCountValues : null,
					m_memberTypesEncoded : null,
					m_memberTypes : null,
					m_keyFieldIndex : 0,
					releaseObject : function() {
						this.m_fields = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_fields);
						this.m_displayValues = sap.firefly.XObject
								.releaseIfNotNull(this.m_displayValues);
						this.m_drillStates = sap.firefly.XObject
								.releaseIfNotNull(this.m_drillStates);
						this.m_memberIndexes = sap.firefly.XObject
								.releaseIfNotNull(this.m_memberIndexes);
						this.m_parentIndexes = sap.firefly.XObject
								.releaseIfNotNull(this.m_parentIndexes);
						this.m_nodeIds = sap.firefly.XObject
								.releaseIfNotNull(this.m_nodeIds);
						this.m_memberTypesEncoded = sap.firefly.XObject
								.releaseIfNotNull(this.m_memberTypesEncoded);
						this.m_memberTypes = sap.firefly.XObject
								.releaseIfNotNull(this.m_memberTypes);
						this.m_childCountValues = sap.firefly.XObject
								.releaseIfNotNull(this.m_childCountValues);
						sap.firefly.InARsDimension.$superclass.releaseObject
								.call(this);
					},
					setup : function(name, inaAttributes, dimension) {
						var inaFieldList;
						var keyField;
						var size;
						var idxInaField;
						var inaField;
						var fieldName;
						var hasKeyFieldName;
						var fieldText;
						var inaValues;
						var obtainability;
						var isVisible;
						var inaValueExceptions;
						var idxInaField2;
						var inaField2;
						var isKeyField;
						this.setName(name);
						inaFieldList = inaAttributes;
						this.m_keyFieldIndex = -1;
						if (inaFieldList !== null) {
							keyField = null;
							if (dimension !== null) {
								keyField = dimension.getKeyField();
							}
							this.m_fields = sap.firefly.XList.create();
							size = inaFieldList.size();
							for (idxInaField = 0; idxInaField < size; idxInaField++) {
								inaField = inaFieldList
										.getStructureByIndex(idxInaField);
								fieldName = inaField
										.getStringByName(sap.firefly.InAConstants.QY_NAME);
								hasKeyFieldName = ((keyField !== null) && sap.firefly.XString
										.isEqual(fieldName, keyField.getName()));
								if (hasKeyFieldName) {
									if (keyField !== null) {
										fieldName = keyField.getName();
									}
									this.m_keyFieldIndex = idxInaField;
								}
								fieldText = inaField
										.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION);
								inaValues = inaField
										.getListByName(sap.firefly.InAConstants.QY_VALUES);
								obtainability = inaField
										.getStringByNameWithDefault(
												sap.firefly.InAConstants.QY_OBTAINABILITY,
												sap.firefly.InAConstants.VA_OBTAINABILITY_ALWAYS);
								isVisible = sap.firefly.XString
										.isEqual(
												sap.firefly.InAConstants.VA_OBTAINABILITY_ALWAYS,
												obtainability);
								inaValueExceptions = inaField
										.getListByName(sap.firefly.InAConstants.QY_VALUE_EXCEPTION);
								this.m_fields.add(sap.firefly.InARsField
										.create(fieldName, fieldText,
												inaValues, isVisible,
												inaValueExceptions));
							}
							if (this.m_keyFieldIndex === -1) {
								for (idxInaField2 = 0; idxInaField2 < size; idxInaField2++) {
									inaField2 = inaFieldList
											.getStructureByIndex(idxInaField2);
									isKeyField = inaField2
											.getBooleanByNameWithDefault(
													sap.firefly.InAConstants.QY_IS_KEY,
													true);
									if (isKeyField) {
										this.m_keyFieldIndex = idxInaField2;
										break;
									}
								}
							}
						}
					},
					getFields : function() {
						return this.m_fields;
					},
					getMemberIndexes : function() {
						return this.m_memberIndexes;
					},
					setMemberIndexes : function(encodedValues) {
						this.m_memberIndexes = encodedValues;
					},
					getParentIndexes : function() {
						return this.m_parentIndexes;
					},
					setParentIndexes : function(encodedValues) {
						this.m_parentIndexes = encodedValues;
					},
					getDisplayValues : function() {
						return this.m_displayValues;
					},
					setDisplayLevelValues : function(encodedValues) {
						this.m_displayValues = encodedValues;
					},
					getDrillStates : function() {
						return this.m_drillStates;
					},
					setDrillState : function(encodedValues) {
						this.m_drillStates = encodedValues;
					},
					getNodeIds : function() {
						return this.m_nodeIds;
					},
					setNodeIds : function(nodeIds) {
						this.m_nodeIds = nodeIds;
					},
					setMemberTypes : function(encodedValues) {
						var index;
						var memberTypeValue;
						this.m_memberTypesEncoded = encodedValues;
						this.m_memberTypes = sap.firefly.XArray
								.create(this.m_memberTypesEncoded.size());
						for (index = 0; this.m_memberTypesEncoded
								.hasNextValue(); index++) {
							memberTypeValue = this.m_memberTypesEncoded
									.getNextIntegerValue();
							this.m_memberTypes.set(index,
									sap.firefly.QInAConverter
											.lookupMemberType(memberTypeValue));
						}
					},
					getMemberType : function(memberIndex) {
						if ((this.m_memberTypes === null)
								|| (memberIndex >= this.m_memberTypes.size())) {
							return sap.firefly.MemberType.MEMBER;
						}
						return this.m_memberTypes.get(memberIndex);
					},
					getKeyFieldIndex : function() {
						return this.m_keyFieldIndex;
					},
					getChildCountValues : function() {
						return this.m_childCountValues;
					},
					setChildCountValues : function(encodedValues) {
						this.m_childCountValues = encodedValues;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarProvider",
				sap.firefly.DfOlapEnvContext,
				{
					m_connection : null,
					m_activeMainCapabilities : null,
					m_importVariables : null,
					m_export : null,
					m_isVariableSubmitNeeded : false,
					m_isReInitVariablesSupported : false,
					m_directVariableTransfer : false,
					m_isCheckVariablesSupported : false,
					setupVariablesProvider : function(application, connection,
							activeMainCapabilities) {
						var serverMetadata;
						var capabilityContainer;
						this.setupOlapApplicationContext(application);
						this.m_connection = connection;
						this.m_activeMainCapabilities = activeMainCapabilities;
						this.m_export = sap.firefly.QInAExportFactory
								.createForData(application,
										this.m_activeMainCapabilities);
						this.m_importVariables = sap.firefly.QInAImportFactory
								.createForMetadata(application,
										this.m_activeMainCapabilities);
						this.m_isVariableSubmitNeeded = true;
						this.m_isCheckVariablesSupported = true;
						this.m_isReInitVariablesSupported = false;
						if (this.m_connection !== null) {
							serverMetadata = this.m_connection
									.getServerMetadata();
							if (serverMetadata !== null) {
								capabilityContainer = serverMetadata
										.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
								if (capabilityContainer !== null) {
									this.m_isReInitVariablesSupported = capabilityContainer
											.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_VARIABLE_RE_SUBMIT);
								}
							}
						}
					},
					releaseObject : function() {
						this.m_connection = null;
						this.m_activeMainCapabilities = null;
						this.m_export = sap.firefly.XObject
								.releaseIfNotNull(this.m_export);
						this.m_importVariables = sap.firefly.XObject
								.releaseIfNotNull(this.m_importVariables);
						sap.firefly.InAPlanningVarProvider.$superclass.releaseObject
								.call(this);
					},
					getConnection : function() {
						return this.m_connection;
					},
					getSystemDescription : function() {
						return this.m_connection.getSystemDescription();
					},
					getSystemName : function() {
						var systemDescription = this.getSystemDescription();
						if (systemDescription === null) {
							return null;
						}
						return systemDescription.getName();
					},
					getRequestPath : function() {
						var connection = this.getConnection();
						var systemDescription = connection
								.getSystemDescription();
						var systemType = systemDescription.getSystemType();
						var path = systemDescription.getServicePath();
						var serverMainCapabilities;
						var fastPathCap;
						if (path === null) {
							serverMainCapabilities = this
									.getServerMainCapabilities();
							fastPathCap = serverMainCapabilities
									.getByKey(sap.firefly.InACapabilities.AV_CAPABILITY_FAST_PATH);
							if (fastPathCap !== null) {
								path = fastPathCap.getValue();
							}
						}
						if (path === null) {
							path = sap.firefly.ConnectionConstants
									.getInAPath(systemType);
						}
						return path;
					},
					createFunction : function() {
						var connection = this.getConnection();
						var path = this.getRequestPath();
						var ocpFunction = connection.newRpcFunction(path);
						var request = ocpFunction.getRequest();
						request
								.setMethod(sap.firefly.HttpRequestMethod.HTTP_POST);
						return ocpFunction;
					},
					getServerMainCapabilities : function() {
						return this.m_activeMainCapabilities;
					},
					getVariablesExporter : function() {
						return this.m_export;
					},
					getVariablesImporter : function() {
						return this.m_importVariables;
					},
					isVariableValuesRuntimeNeeded : function() {
						return (this.getSystemDescription().getSystemType()
								.isTypeOf(sap.firefly.SystemType.BW));
					},
					isVariableSubmitNeeded : function() {
						return this.m_isVariableSubmitNeeded;
					},
					setIsVariableSubmitNeeded : function(submit) {
						this.m_isVariableSubmitNeeded = submit;
					},
					supportsReInitVariables : function() {
						return this.m_isReInitVariablesSupported;
					},
					processRetrieveVariableRuntimeInformation : function(
							syncType, listener, customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					processSetGetVariableValues : function(syncType, listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					processVariableSubmit : function(syncType, listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					processReInitVariableAfterSubmit : function(syncType,
							listener, customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					processVariableCancel : function(syncType, listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					importVariables : function(variablesList, variableContext) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					exportVariables : function(variablesContext,
							parentStructure) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setDirectVariableTransfer : function(directVariableTransfer) {
						this.m_directVariableTransfer = directVariableTransfer;
					},
					isDirectVariableTransfer : function() {
						return this.m_directVariableTransfer;
					},
					supportsCheckVariables : function() {
						return (this.m_isCheckVariablesSupported && this
								.isDirectVariableTransfer());
					},
					processCheckVariables : function(syncType, listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					supportsDirectVariableTransfer : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					processActivateVariableVariant : function(variableVariant,
							syncType, listener, customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InARsDataCellProvider",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						create : function(application, capabilities) {
							var provider = new sap.firefly.InARsDataCellProvider();
							provider.setupProvider(application, capabilities);
							return provider;
						}
					},
					m_supportsDataCellMixedValues : false,
					m_supportsSAPDateFormat : false,
					m_supportsInputReadinessStates : false,
					m_ocpStructure : null,
					m_exceptionSettings : null,
					m_rowsCount : 0,
					m_columnsCount : 0,
					m_csValueException : null,
					m_csMaxAlertLevelName : null,
					m_csMaxAlertLevel : null,
					m_csExceptionSetting : null,
					m_csExceptionPriority : null,
					m_lastX : 0,
					m_lastY : 0,
					m_csDoubleValue : 0,
					m_csStringValue : null,
					m_csFormattedValue : null,
					m_csFormatString : null,
					m_csPlanningCommandIds : null,
					m_csQueryDataCellReference : null,
					m_csFormattedCurrencyUnit : null,
					m_csCurrencyUnit : null,
					m_csCurrencyUnitType : 0,
					m_csCurrencyUnitPosition : 0,
					m_valueType : null,
					m_csInputEnabled : false,
					m_csInputReadinessIndex : 0,
					m_csLockedValue : false,
					m_csIsInsideBounds : false,
					m_exceptions : null,
					m_inputEnabled : null,
					m_inputReadinessIndex : null,
					m_lockedValue : null,
					m_unitDescriptions : null,
					m_unitTypes : null,
					m_unitPositions : null,
					m_units : null,
					m_values : null,
					m_roundedValues : null,
					m_valuesFormatted : null,
					m_formatStrings : null,
					m_cellValueTypes : null,
					m_cellDataTypes : null,
					m_queryDataCellReferences : null,
					m_exceptionNameWithSettings : null,
					m_exceptionName : null,
					m_exceptionAlertLevel : null,
					m_exceptionSettingIndex : null,
					m_planningCommandIds : null,
					m_supportsUnifiedDataCells : false,
					m_csDecimalPlaces : 0,
					m_csScalingFactor : 0,
					m_decimalPlaces : null,
					m_scalingFactors : null,
					setupProvider : function(application, capabilities) {
						this.setupApplicationContext(application);
						this.m_supportsSAPDateFormat = capabilities
								.supportsSapDateFormat();
						this.m_supportsUnifiedDataCells = capabilities
								.supportsUnifiedDataCells();
						this.m_supportsDataCellMixedValues = capabilities
								.supportsDataCellMixedValues();
						this.m_supportsInputReadinessStates = capabilities
								.supportsInputReadinessStates();
					},
					releaseObject : function() {
						this.m_ocpStructure = null;
						this.m_exceptionSettings = null;
						this.m_csValueException = null;
						this.m_csMaxAlertLevelName = null;
						this.m_csExceptionSetting = sap.firefly.XObject
								.releaseIfNotNull(this.m_csExceptionSetting);
						this.m_csExceptionPriority = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_csExceptionPriority);
						this.m_csMaxAlertLevel = null;
						this.m_csFormattedValue = null;
						this.m_csFormatString = null;
						this.m_csPlanningCommandIds = null;
						this.m_csQueryDataCellReference = null;
						this.m_csFormattedCurrencyUnit = null;
						this.m_csCurrencyUnit = null;
						this.m_exceptions = sap.firefly.XObject
								.releaseIfNotNull(this.m_exceptions);
						this.m_inputEnabled = sap.firefly.XObject
								.releaseIfNotNull(this.m_inputEnabled);
						this.m_inputReadinessIndex = sap.firefly.XObject
								.releaseIfNotNull(this.m_inputReadinessIndex);
						this.m_lockedValue = sap.firefly.XObject
								.releaseIfNotNull(this.m_lockedValue);
						this.m_unitDescriptions = sap.firefly.XObject
								.releaseIfNotNull(this.m_unitDescriptions);
						this.m_unitTypes = sap.firefly.XObject
								.releaseIfNotNull(this.m_unitTypes);
						this.m_unitPositions = sap.firefly.XObject
								.releaseIfNotNull(this.m_unitPositions);
						this.m_units = sap.firefly.XObject
								.releaseIfNotNull(this.m_units);
						this.m_values = sap.firefly.XObject
								.releaseIfNotNull(this.m_values);
						this.m_valuesFormatted = sap.firefly.XObject
								.releaseIfNotNull(this.m_valuesFormatted);
						this.m_formatStrings = sap.firefly.XObject
								.releaseIfNotNull(this.m_formatStrings);
						this.m_cellValueTypes = sap.firefly.XObject
								.releaseIfNotNull(this.m_cellValueTypes);
						this.m_cellDataTypes = sap.firefly.XObject
								.releaseIfNotNull(this.m_cellDataTypes);
						this.m_queryDataCellReferences = sap.firefly.XObject
								.releaseIfNotNull(this.m_queryDataCellReferences);
						this.m_exceptionNameWithSettings = null;
						this.m_exceptionName = sap.firefly.XObject
								.releaseIfNotNull(this.m_exceptionName);
						this.m_exceptionAlertLevel = sap.firefly.XObject
								.releaseIfNotNull(this.m_exceptionAlertLevel);
						this.m_exceptionSettingIndex = sap.firefly.XObject
								.releaseIfNotNull(this.m_exceptionSettingIndex);
						this.m_planningCommandIds = sap.firefly.XObject
								.releaseIfNotNull(this.m_planningCommandIds);
						this.m_decimalPlaces = sap.firefly.XObject
								.releaseIfNotNull(this.m_decimalPlaces);
						this.m_scalingFactors = sap.firefly.XObject
								.releaseIfNotNull(this.m_scalingFactors);
						sap.firefly.InARsDataCellProvider.$superclass.releaseObject
								.call(this);
					},
					setOcpStructure : function(ocpStructure, columnsCount,
							rowsCount, exceptionSettings) {
						this.m_ocpStructure = ocpStructure;
						this.m_rowsCount = rowsCount;
						this.m_columnsCount = columnsCount;
						if (this.m_ocpStructure !== null) {
							this.m_exceptions = this
									.getColumn(sap.firefly.InAConstants.QY_EXCEPTIONS);
							if (exceptionSettings === null) {
								this.m_exceptionName = this
										.getColumn(sap.firefly.InAConstants.QY_EXCEPTION_NAME);
								this.m_exceptionAlertLevel = this
										.getColumn(sap.firefly.InAConstants.QY_EXCEPTION_ALERT_LEVEL);
							} else {
								this.m_exceptionSettings = exceptionSettings;
								this.m_exceptionSettingIndex = this
										.getColumn(sap.firefly.InAConstants.QY_EXCEPTION_SETTING_INDEX);
							}
							if (this.m_supportsInputReadinessStates) {
								this.m_inputReadinessIndex = this
										.getColumn(sap.firefly.InAConstants.QY_INPUT_READINESS_INDEX);
							} else {
								this.m_inputEnabled = this
										.getColumn(sap.firefly.InAConstants.QY_INPUT_ENABLED);
							}
							this.m_lockedValue = this
									.getColumn(sap.firefly.InAConstants.QY_LOCKED_VALUE);
							this.m_unitDescriptions = this
									.getColumn(sap.firefly.InAConstants.QY_UNIT_DESCRIPTIONS);
							this.m_unitTypes = this
									.getColumn(sap.firefly.InAConstants.QY_UNIT_TYPES);
							this.m_unitPositions = this
									.getColumn(sap.firefly.InAConstants.QY_UNIT_POSITIONS);
							this.m_units = this
									.getColumn(sap.firefly.InAConstants.QY_UNITS);
							this.m_values = this
									.getColumn(sap.firefly.InAConstants.QY_VALUES);
							this.m_valuesFormatted = this
									.getColumn(sap.firefly.InAConstants.QY_VALUES_FORMATTED);
							if (this.m_supportsDataCellMixedValues) {
								this.m_roundedValues = this
										.getColumn(sap.firefly.InAConstants.QY_VALUES_ROUNDED);
							} else {
								this.m_roundedValues = null;
							}
							this.m_planningCommandIds = this
									.getColumn(sap.firefly.InAConstants.QY_ACTIONS);
							this.m_formatStrings = this
									.getColumn(sap.firefly.InAConstants.QY_CELL_FORMAT);
							this.m_cellValueTypes = this
									.getColumn(sap.firefly.InAConstants.QY_CELL_VALUE_TYPES);
							this.m_cellDataTypes = this
									.getColumn(sap.firefly.InAConstants.QY_CELL_DATA_TYPE);
							this.m_queryDataCellReferences = this
									.getColumn(sap.firefly.InAConstants.QY_QUERY_DATA_CELL_REFERENCES);
							if (this.m_supportsUnifiedDataCells) {
								this.m_decimalPlaces = this
										.getColumn(sap.firefly.InAConstants.QY_NUMERIC_ROUNDING);
								this.m_scalingFactors = this
										.getColumn(sap.firefly.InAConstants.QY_NUMERIC_SHIFT);
							}
						}
						this.m_lastX = -1;
						this.m_lastY = -1;
						this.m_csIsInsideBounds = true;
						this.m_csMaxAlertLevel = sap.firefly.AlertLevel.NORMAL;
					},
					getColumn : function(name) {
						var inaValueElement = this.m_ocpStructure
								.getStructureByName(name);
						var encodedValues;
						if (inaValueElement === null) {
							return null;
						}
						encodedValues = sap.firefly.InARsEncodedValues
								.createByStructure(inaValueElement);
						return encodedValues;
					},
					resetIfNotNull : function(cursor) {
						if (cursor !== null) {
							cursor.resetCursor();
						}
					},
					resetCursor : function() {
						this.m_lastX = -1;
						this.m_lastY = -1;
						this.m_csIsInsideBounds = true;
						this.resetIfNotNull(this.m_exceptions);
						this.resetIfNotNull(this.m_exceptionName);
						this.resetIfNotNull(this.m_exceptionAlertLevel);
						this.resetIfNotNull(this.m_exceptionSettingIndex);
						this.resetIfNotNull(this.m_inputEnabled);
						this.resetIfNotNull(this.m_inputReadinessIndex);
						this.resetIfNotNull(this.m_lockedValue);
						this.resetIfNotNull(this.m_unitDescriptions);
						this.resetIfNotNull(this.m_unitTypes);
						this.resetIfNotNull(this.m_unitPositions);
						this.resetIfNotNull(this.m_units);
						this.resetIfNotNull(this.m_values);
						this.resetIfNotNull(this.m_roundedValues);
						this.resetIfNotNull(this.m_valuesFormatted);
						this.resetIfNotNull(this.m_planningCommandIds);
						this.resetIfNotNull(this.m_formatStrings);
						this.resetIfNotNull(this.m_cellValueTypes);
						this.resetIfNotNull(this.m_queryDataCellReferences);
						this.resetIfNotNull(this.m_cellDataTypes);
						this.resetIfNotNull(this.m_decimalPlaces);
						this.resetIfNotNull(this.m_scalingFactors);
					},
					notifyCursorChange : function(cell, x, y) {
						cell.setColumn(x);
						cell.setRow(y);
						cell.reset();
						if ((y < this.m_lastY)
								|| ((y === this.m_lastY) && (x < this.m_lastX))) {
							this.resetCursor();
						}
						while ((this.m_csIsInsideBounds)
								&& ((y > this.m_lastY) || (x > this.m_lastX))) {
							this.readNextIndex();
							this.m_lastX++;
							if ((this.m_lastX >= this.m_columnsCount)
									|| (this.m_lastY === -1)) {
								this.m_lastX = 0;
								this.m_lastY++;
							}
						}
						if (this.m_csIsInsideBounds === false) {
							cell
									.setValueException(sap.firefly.ValueException.NULL_VALUE);
							if (this.m_supportsUnifiedDataCells) {
								cell.setFormattedValue("");
							} else {
								cell
										.setFormattedValue(sap.firefly.ValueException.NULL_VALUE
												.getName());
							}
							cell.setInitialValue(null);
						} else {
							if ((y === this.m_lastY) && (x === this.m_lastX)) {
								this.updateValidCell(cell);
							} else {
								cell
										.setValueException(sap.firefly.ValueException.NULL_VALUE);
								if (this.m_supportsUnifiedDataCells) {
									cell.setFormattedValue("");
								} else {
									cell
											.setFormattedValue(sap.firefly.ValueException.NULL_VALUE
													.getName());
								}
								cell.setInitialValue(null);
							}
						}
					},
					updateValidCell : function(cell) {
						var isValueExceptionIndicationEmptyValue;
						var planningCommandIdsBase;
						var planningCommandIds;
						var planningSize;
						var planningCommandIndex;
						cell.setValueType(this.m_valueType);
						isValueExceptionIndicationEmptyValue = ((this.m_supportsUnifiedDataCells)
								&& (this.m_csValueException !== sap.firefly.ValueException.NORMAL)
								&& (this.m_csValueException !== sap.firefly.ValueException.ZERO) && (this.m_csValueException !== sap.firefly.ValueException.MIXED_CURRENCIES_OR_UNITS));
						if ((this.m_csValueException === sap.firefly.ValueException.NULL_VALUE)
								|| (this.m_csValueException === sap.firefly.ValueException.UNDEFINED)
								|| (isValueExceptionIndicationEmptyValue)) {
							cell.setInitialValue(null);
						} else {
							cell.setInitialValue(this.getXValue());
						}
						if (isValueExceptionIndicationEmptyValue) {
							cell.setFormattedValue("");
						} else {
							cell.setFormattedValue(this.m_csFormattedValue);
						}
						cell.setFormatString(this.m_csFormatString);
						cell.setValueException(this.m_csValueException);
						if (this.m_csMaxAlertLevelName === null) {
							cell
									.setMaxAlertLevelName(this.m_exceptionNameWithSettings);
						} else {
							cell
									.setMaxAlertLevelName(this.m_csMaxAlertLevelName);
						}
						cell.setMaxAlertLevel(this.m_csMaxAlertLevel);
						cell.setDataEntryEnabled(this.m_csInputEnabled);
						cell
								.setInputReadinessIndex(this.m_csInputReadinessIndex);
						cell.setExceptionSettings(this.m_csExceptionSetting);
						cell.setExceptionPriorities(this.m_csExceptionPriority);
						cell.setOriginalValueLock(this.m_csLockedValue);
						cell
								.setQueryDataCellReference(this.m_csQueryDataCellReference);
						this.updateCurrencyUnit(cell.getCurrencyUnitBase());
						planningCommandIdsBase = cell
								.getPlanningCommandIdsBase();
						planningCommandIdsBase.clear();
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(this.m_csPlanningCommandIds)) {
							planningCommandIds = sap.firefly.XStringTokenizer
									.splitString(this.m_csPlanningCommandIds,
											" ");
							if (planningCommandIds !== null) {
								planningSize = planningCommandIds.size();
								for (planningCommandIndex = 0; planningCommandIndex < planningSize; planningCommandIndex++) {
									planningCommandIdsBase
											.add(planningCommandIds
													.get(planningCommandIndex));
								}
							}
						}
						if ((this.m_supportsUnifiedDataCells)
								&& (this.m_valueType.isNumber() === false)) {
							cell.setDecimalPlaces(0);
							cell.setScalingFactor(0);
						} else {
							cell.setDecimalPlaces(this.m_csDecimalPlaces);
							cell.setScalingFactor(this.m_csScalingFactor);
						}
					},
					updateCurrencyUnit : function(currencyUnitBase) {
						if (this.m_csCurrencyUnitType === sap.firefly.InAConstants.VA_UNIT_TYPES_IS_CURRENCY) {
							currencyUnitBase.setIsEmpty(false);
							currencyUnitBase.setHasCurrency(true);
							currencyUnitBase.setHasUnit(false);
							currencyUnitBase.setIsMixed(false);
						} else {
							if (this.m_csCurrencyUnitType === sap.firefly.InAConstants.VA_UNIT_TYPES_IS_UNIT) {
								currencyUnitBase.setIsEmpty(false);
								currencyUnitBase.setHasCurrency(false);
								currencyUnitBase.setHasUnit(true);
								currencyUnitBase.setIsMixed(false);
							} else {
								if (this.m_csCurrencyUnitType === sap.firefly.InAConstants.VA_UNIT_TYPES_IS_CURRENCY_UNIT) {
									currencyUnitBase.setIsEmpty(false);
									currencyUnitBase.setHasCurrency(true);
									currencyUnitBase.setHasUnit(true);
									currencyUnitBase.setIsMixed(false);
								} else {
									if (this.m_csCurrencyUnitType === sap.firefly.InAConstants.VA_UNIT_TYPES_IS_MIXED) {
										currencyUnitBase.setIsEmpty(false);
										currencyUnitBase.setIsMixed(true);
										currencyUnitBase.setHasCurrency(true);
										currencyUnitBase.setHasUnit(true);
									} else {
										currencyUnitBase.setIsEmpty(true);
										currencyUnitBase.setHasCurrency(false);
										currencyUnitBase.setHasUnit(false);
										currencyUnitBase.setIsMixed(false);
									}
								}
							}
						}
						if (currencyUnitBase.isEmpty() === false) {
							if (this.m_csFormattedCurrencyUnit !== null) {
								currencyUnitBase
										.setFormatted(this.m_csFormattedCurrencyUnit);
							}
							if (this.m_csCurrencyUnit !== null) {
								if (this.m_csCurrencyUnitPosition === sap.firefly.InAConstants.VA_UNIT_POSITIONS_BEFORE_UNIT) {
									currencyUnitBase
											.setPrefix(this.m_csCurrencyUnit);
								} else {
									currencyUnitBase
											.setSuffix(this.m_csCurrencyUnit);
								}
							}
						}
					},
					getXValue : function() {
						if (this.m_valueType.isNumber()) {
							return sap.firefly.XDoubleValue
									.create(this.m_csDoubleValue);
						} else {
							if (this.m_valueType === sap.firefly.XValueType.TIMESPAN) {
								return sap.firefly.XTimeSpan
										.create(sap.firefly.XDouble
												.convertDoubleToLong(this.m_csDoubleValue));
							} else {
								if (this.m_valueType === sap.firefly.XValueType.DATE) {
									return sap.firefly.XDate
											.createDateFromStringWithFlag(
													this.m_csStringValue,
													this.m_supportsSAPDateFormat);
								} else {
									if (this.m_valueType === sap.firefly.XValueType.TIME) {
										return sap.firefly.XTime
												.createTimeFromStringWithFlag(
														this.m_csStringValue,
														this.m_supportsSAPDateFormat);
									} else {
										if (this.m_valueType === sap.firefly.XValueType.DATE_TIME) {
											return sap.firefly.XDateTime
													.createDateTimeFromStringWithFlag(
															this.m_csStringValue,
															this.m_supportsSAPDateFormat);
										} else {
											if (this.m_valueType === sap.firefly.XValueType.STRING) {
												if (sap.firefly.XStringUtils
														.isNotNullAndNotEmpty(this.m_csStringValue)) {
													return sap.firefly.XStringValue
															.create(this.m_csStringValue);
												}
												return null;
											}
										}
									}
								}
							}
						}
						throw sap.firefly.XException
								.createIllegalArgumentException(sap.firefly.XString
										.concatenate2("Unsupported type:",
												this.m_valueType.getName()));
					},
					setExceptionSettings : function(exceptionSettingIndex) {
						var isAlertLevelInSettings = false;
						var activeExceptionSettings;
						var exceptionSize;
						var idx;
						var exceptionSetting;
						var exceptionSettingName;
						var exceptionSettingValue;
						var inaAlertLevel;
						if (exceptionSettingIndex === -1) {
							this.m_csExceptionSetting = null;
							this.m_csExceptionPriority = null;
							this.m_exceptionNameWithSettings = null;
						} else {
							activeExceptionSettings = this.m_exceptionSettings
									.getListByIndex(exceptionSettingIndex);
							this.m_csExceptionSetting = sap.firefly.XHashMapOfStringByString
									.create();
							this.m_csExceptionPriority = sap.firefly.XHashMapByString
									.create();
							exceptionSize = activeExceptionSettings.size();
							for (idx = 0; idx < exceptionSize; idx++) {
								exceptionSetting = activeExceptionSettings
										.getStructureByIndex(idx);
								exceptionSettingName = exceptionSetting
										.getStringByName(sap.firefly.InAConstants.QY_SETTING_NAME);
								exceptionSettingValue = exceptionSetting
										.getStringByName(sap.firefly.InAConstants.QY_VALUE);
								this.m_csExceptionSetting.put(
										exceptionSettingName,
										exceptionSettingValue);
								this.m_csExceptionPriority
										.put(
												exceptionSettingName,
												sap.firefly.XIntegerValue
														.create(exceptionSetting
																.getIntegerByName(sap.firefly.InAConstants.QY_PRIORITY)));
								if (sap.firefly.ExceptionSetting
										.getByName(exceptionSettingName) === sap.firefly.ExceptionSetting.ALERT_LEVEL) {
									isAlertLevelInSettings = true;
									inaAlertLevel = sap.firefly.XInteger
											.convertStringToIntegerWithRadix(
													exceptionSettingValue, 10);
									this.m_csMaxAlertLevel = sap.firefly.QInAConverter
											.lookupAlertLevel(inaAlertLevel);
									this.m_exceptionNameWithSettings = exceptionSetting
											.getStringByName(sap.firefly.InAConstants.QY_EXCEPTION_NAME);
								}
							}
						}
						if (isAlertLevelInSettings === false) {
							this.m_csMaxAlertLevel = sap.firefly.AlertLevel.NORMAL;
						}
					},
					readNextIndex : function() {
						if ((this.m_values !== null)
								&& (this.m_values.hasNextValue())) {
							if (this.m_exceptions !== null) {
								this.m_csValueException = sap.firefly.QInAConverter
										.lookupException(this.m_exceptions
												.getNextIntegerValue());
							}
							if (this.m_exceptionSettingIndex !== null) {
								this
										.setExceptionSettings(this.m_exceptionSettingIndex
												.getNextIntegerValue());
							} else {
								if (this.m_exceptionAlertLevel !== null) {
									this.m_csMaxAlertLevel = sap.firefly.QInAConverter
											.lookupAlertLevel(this.m_exceptionAlertLevel
													.getNextIntegerValue());
								}
							}
							if (this.m_exceptionSettingIndex !== null) {
								this.m_csMaxAlertLevelName = this.m_exceptionNameWithSettings;
							} else {
								if (this.m_exceptionAlertLevel !== null) {
									this.m_csMaxAlertLevelName = this.m_exceptionName
											.getNextStringValue();
								}
							}
							if (this.m_valuesFormatted !== null) {
								this.m_csFormattedValue = this.m_valuesFormatted
										.getNextStringValue();
							}
							if (this.m_planningCommandIds !== null) {
								this.m_csPlanningCommandIds = this.m_planningCommandIds
										.getNextStringValue();
							}
							if (this.m_formatStrings !== null) {
								this.m_csFormatString = this.m_formatStrings
										.getNextStringValue();
							}
							if (this.m_queryDataCellReferences !== null) {
								this.m_csQueryDataCellReference = this.m_queryDataCellReferences
										.getNextStringValue();
							}
							if (this.m_units !== null) {
								this.m_csFormattedCurrencyUnit = this.m_units
										.getNextStringValue();
								this.m_csCurrencyUnitType = sap.firefly.InAConstants.VA_UNIT_TYPES_IS_CURRENCY;
							}
							if (this.m_unitTypes !== null) {
								this.m_csCurrencyUnitType = this.m_unitTypes
										.getNextIntegerValue();
							}
							if (this.m_unitPositions !== null) {
								this.m_csCurrencyUnitPosition = this.m_unitPositions
										.getNextIntegerValue();
							}
							if (this.m_unitDescriptions !== null) {
								this.m_csCurrencyUnit = this.m_unitDescriptions
										.getNextStringValue();
							}
							this.readNextValues();
							if (this.m_inputEnabled === null) {
								this.m_csInputEnabled = false;
							} else {
								this.m_csInputEnabled = this.m_inputEnabled
										.getNextIntegerValue() !== 0;
							}
							if (this.m_inputReadinessIndex !== null) {
								this.m_csInputReadinessIndex = this.m_inputReadinessIndex
										.getNextIntegerValue();
							}
							if (this.m_lockedValue === null) {
								this.m_csLockedValue = false;
							} else {
								this.m_csLockedValue = this.m_lockedValue
										.getNextIntegerValue() !== 0;
							}
							if (this.m_decimalPlaces !== null) {
								this.m_csDecimalPlaces = this.m_decimalPlaces
										.getNextIntegerValue();
							}
							if (this.m_scalingFactors !== null) {
								this.m_csScalingFactor = this.m_scalingFactors
										.getNextIntegerValue();
							}
						} else {
							this.m_csIsInsideBounds = false;
						}
					},
					readNextValues : function() {
						var cellDataTypeStr;
						var cellDataType;
						var inaValueType2;
						if (this.m_supportsDataCellMixedValues) {
							this.m_valueType = sap.firefly.XValueType.DOUBLE;
							if (this.m_cellValueTypes !== null) {
								this.m_valueType = sap.firefly.QInAConverter
										.lookupValueTypeByInt(this.m_cellValueTypes
												.getNextIntegerValue());
							}
							if ((this.m_csValueException === sap.firefly.ValueException.NORMAL)
									|| (this.m_csValueException === sap.firefly.ValueException.MIXED_CURRENCIES_OR_UNITS)) {
								if (this.m_valueType.isNumber()) {
									this.m_csDoubleValue = this.m_values
											.getNextDoubleValue();
								} else {
									this.m_csDoubleValue = 0;
									this.m_values.skip();
								}
								if (this.m_roundedValues !== null) {
									this.m_csStringValue = this.m_roundedValues
											.getNextStringValue();
								}
							} else {
								this.m_csDoubleValue = 0;
								this.m_csStringValue = null;
								this.m_values.skip();
								if (this.m_roundedValues !== null) {
									this.m_roundedValues.skip();
								}
							}
						} else {
							if (this.m_cellDataTypes !== null) {
								cellDataTypeStr = this.m_cellDataTypes
										.getNextStringValue();
								cellDataType = sap.firefly.QInAConverter
										.lookupValueType(cellDataTypeStr);
								this.m_valueType = cellDataType;
								if (cellDataType.isNumber()) {
									this.m_csDoubleValue = this.m_values
											.getNextDoubleValue();
									this.m_csStringValue = null;
								} else {
									this.m_csStringValue = this.m_values
											.getNextStringValue();
									this.m_csDoubleValue = 0;
								}
							} else {
								if (this.m_cellValueTypes !== null) {
									inaValueType2 = this.m_cellValueTypes
											.getNextIntegerValue();
									this.m_valueType = sap.firefly.QInAConverter
											.lookupValueTypeByInt(inaValueType2);
									this.m_csDoubleValue = this.m_values
											.getNextDoubleValue();
								} else {
									throw sap.firefly.XException
											.createIllegalStateException("Bad protocol: Values cannot be retrieved");
								}
							}
						}
					},
					getAvailableDataCellCount : function() {
						return this.m_columnsCount * this.m_rowsCount;
					},
					getAvailableDataCellColumns : function() {
						return this.m_columnsCount;
					},
					getAvailableDataCellRows : function() {
						return this.m_rowsCount;
					}
				});
$Firefly.createClass("sap.firefly.InARsField", sap.firefly.DfNameTextObject, {
	$statics : {
		create : function(name, text, values, isVisible, inaValueExceptions) {
			var object = new sap.firefly.InARsField();
			object.setup(name, text, values, isVisible, inaValueExceptions);
			return object;
		}
	},
	m_values : null,
	m_valueExceptions : null,
	m_isVisible : false,
	setup : function(name, text, values, isVisible, inaValueExceptions) {
		this.setName(name);
		this.setText(text);
		this.m_values = values;
		this.m_isVisible = isVisible;
		this.m_valueExceptions = inaValueExceptions;
	},
	releaseObject : function() {
		this.m_values = sap.firefly.XObject.releaseIfNotNull(this.m_values);
		this.m_valueExceptions = sap.firefly.XObject
				.releaseIfNotNull(this.m_valueExceptions);
		sap.firefly.InARsField.$superclass.releaseObject.call(this);
	},
	getValues : function() {
		return this.m_values;
	},
	getValueExceptionByIndex : function(index) {
		if (this.m_valueExceptions === null) {
			return -1;
		}
		return this.m_valueExceptions.getIntegerByIndex(index);
	},
	isVisible : function() {
		return this.m_isVisible;
	}
});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarProcessorProvider",
				sap.firefly.InAPlanningVarProvider,
				{
					$statics : {
						createInAVariableProcessorProvider : function(
								variableRequestor, requestorProvider) {
							var provider = new sap.firefly.InAPlanningVarProcessorProvider();
							provider.setupInAVariableProcessorProvider(
									variableRequestor, requestorProvider);
							return provider;
						}
					},
					m_processor : null,
					m_requestorProvider : null,
					m_variableRequestorBase : null,
					setupInAVariableProcessorProvider : function(
							variableRequestorBase, requestorProvider) {
						var application = variableRequestorBase.getOlapEnv();
						var systemName = variableRequestorBase
								.getSystemDescription().getName();
						var connection = application.getConnectionPool()
								.getConnection(systemName);
						var serverMetadata = connection.getServerMetadata();
						var capabilities = serverMetadata
								.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
						this.setupVariablesProvider(application, connection,
								capabilities);
						this.m_requestorProvider = requestorProvider;
						this.m_variableRequestorBase = variableRequestorBase;
						this.bindVariableRequestor();
					},
					releaseObject : function() {
						this.m_processor = null;
						this.m_requestorProvider = null;
						this.m_variableRequestorBase = null;
						sap.firefly.InAPlanningVarProcessorProvider.$superclass.releaseObject
								.call(this);
					},
					bindVariableRequestor : function() {
						var processor = sap.firefly.QVariableProcessor
								.createVariableProcessor(this.getOlapEnv()
										.getContext(), this,
										this.m_variableRequestorBase);
						this.m_processor = processor;
						this.m_variableRequestorBase
								.setVariableProcessorBase(processor);
						return processor;
					},
					fillVariablesMetaData : function(variablesList) {
						this.importVariables(variablesList, this.m_processor
								.getVariableContainerBase());
					},
					importVariables : function(variablesList, variableContext) {
						var wrapper = sap.firefly.PrStructure.create();
						wrapper.setElementByName(
								sap.firefly.InAConstants.QY_VARIABLES,
								variablesList);
						this.m_importVariables.importVariables(wrapper,
								variableContext);
					},
					exportVariables : function(variablesContext,
							parentStructure) {
						this.m_export.exportVariables(variablesContext,
								parentStructure);
					},
					processRetrieveVariableRuntimeInformation : function(
							syncType, listener, customIdentifier) {
						return sap.firefly.InAPlanningVarGetRuntimeInfoAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					processSetGetVariableValues : function(syncType, listener,
							customIdentifier) {
						return sap.firefly.InAPlanningVarSetGetValuesAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					processVariableSubmit : function(syncType, listener,
							customIdentifier) {
						return sap.firefly.InAPlanningVarSubmitAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					processReInitVariableAfterSubmit : function(syncType,
							listener, customIdentifier) {
						return sap.firefly.InAPlanningVarReInitAfterSubmitAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					processVariableCancel : function(syncType, listener,
							customIdentifier) {
						return sap.firefly.InAPlanningVarCancelAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					processCheckVariables : function(syncType, listener,
							customIdentifier) {
						return sap.firefly.InAPlanningVarCheckVariablesAction
								.createAndRun(this, syncType, listener,
										customIdentifier);
					},
					getRequestorProvider : function() {
						return this.m_requestorProvider;
					},
					getVariableProcessorBase : function() {
						return this.m_processor;
					},
					getVariableProcessor : function() {
						return this.m_processor;
					},
					getContext : function() {
						return null;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InARsAxisProvider",
				sap.firefly.DfRsAxisProvider,
				{
					$statics : {
						create : function(application, capabilities, axisType) {
							var provider;
							if ((sap.firefly.AxisType.ROWS !== axisType)
									&& (sap.firefly.AxisType.COLUMNS !== axisType)) {
								throw sap.firefly.XException
										.createIllegalStateException("illegal axis type");
							}
							provider = new sap.firefly.InARsAxisProvider();
							provider.setupProvider(application, capabilities);
							return provider;
						}
					},
					m_dataCount : 0,
					m_tuplesCount : 0,
					m_tuplesCountTotal : 0,
					m_tupleElementsCount : 0,
					m_rsDimensionsList : null,
					m_supportsObtainability : false,
					m_supportsSapDateFormat : false,
					m_currentIndex : 0,
					m_alertLevel : null,
					m_exceptionNames : null,
					setupProvider : function(application, capabilities) {
						this.setupApplicationContext(application);
						this.m_supportsObtainability = capabilities
								.supportsObtainability();
						this.m_supportsSapDateFormat = capabilities
								.supportsSapDateFormat();
						this.m_currentIndex = -1;
					},
					releaseObject : function() {
						var i;
						if (this.m_rsDimensionsList !== null) {
							for (i = 0; i < this.m_rsDimensionsList.size(); i++) {
								this.m_rsDimensionsList.get(i).releaseObject();
								this.m_rsDimensionsList.set(i, null);
							}
							this.m_rsDimensionsList.releaseObject();
							this.m_rsDimensionsList = null;
						}
						this.m_alertLevel = sap.firefly.XObject
								.releaseIfNotNull(this.m_alertLevel);
						this.m_exceptionNames = sap.firefly.XObject
								.releaseIfNotNull(this.m_exceptionNames);
						sap.firefly.InARsAxisProvider.$superclass.releaseObject
								.call(this);
					},
					getElementAsListByName : function(ocpStructure, name) {
						var inaElement = ocpStructure.getElementByName(name);
						var inaStructure;
						var inaValues;
						var valuesSize;
						if (inaElement === null) {
							return null;
						}
						if (inaElement.isStructure()) {
							inaStructure = inaElement;
							inaValues = inaStructure
									.getListByName(sap.firefly.InAConstants.QY_VALUES);
							valuesSize = inaStructure
									.getIntegerByName(sap.firefly.InAConstants.QY_SIZE);
							if (valuesSize !== inaValues.size()) {
								throw sap.firefly.XException
										.createIllegalStateException(sap.firefly.XStringUtils
												.concatenate3(
														"Indicated size of ",
														name,
														" names and actual size differ!"));
							}
							if (valuesSize !== this.m_tuplesCount) {
								throw sap.firefly.XException
										.createIllegalStateException(sap.firefly.XStringUtils
												.concatenate3(
														"Indicated size of ",
														name,
														" names and tuple count differ!"));
							}
							return inaValues;
						}
						if (inaElement.isList()) {
							return inaElement;
						}
						return null;
					},
					importRsDimensions : function(inaDimensions, queryModel) {
						var dimensionCount = inaDimensions.size();
						var dimIdx;
						var inaDimension;
						var name;
						var dimension;
						var inaAttributes;
						var rsDimension;
						var inaValueElement;
						this.m_rsDimensionsList = sap.firefly.XArray
								.create(dimensionCount);
						for (dimIdx = 0; dimIdx < dimensionCount; dimIdx++) {
							inaDimension = inaDimensions
									.getStructureByIndex(dimIdx);
							name = inaDimension
									.getStringByName(sap.firefly.InAConstants.QY_NAME);
							dimension = null;
							if (queryModel !== null) {
								dimension = queryModel.getDimensionByName(name);
							}
							inaAttributes = inaDimension
									.getListByName(sap.firefly.InAConstants.QY_ATTRIBUTES);
							rsDimension = sap.firefly.InARsDimension.create(
									name, inaAttributes, dimension);
							inaValueElement = inaDimension
									.getStructureByName(sap.firefly.InAConstants.QY_MEMBER_TYPES);
							if (inaValueElement !== null) {
								rsDimension
										.setMemberTypes(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							this.m_rsDimensionsList.set(dimIdx, rsDimension);
						}
						this.m_tupleElementsCount = dimensionCount;
					},
					importRsTuples : function(ocpStructure) {
						var inaTupleElements = ocpStructure
								.getListByName(sap.firefly.InAConstants.QY_TUPLES);
						var dimIdx;
						var rsDimension;
						var inaTupleColumn;
						var inaValueElement;
						if (this.m_rsDimensionsList.size() !== inaTupleElements
								.size()) {
							throw sap.firefly.XException
									.createIllegalStateException("Indicated dimension count and tuple element count is not the same");
						}
						this.m_alertLevel = this
								.getElementAsListByName(
										ocpStructure,
										sap.firefly.InAConstants.QY_EXCEPTION_ALERT_LEVEL);
						this.m_exceptionNames = this.getElementAsListByName(
								ocpStructure,
								sap.firefly.InAConstants.QY_EXCEPTION_NAME);
						for (dimIdx = 0; dimIdx < this.m_rsDimensionsList
								.size(); dimIdx++) {
							rsDimension = this.m_rsDimensionsList.get(dimIdx);
							inaTupleColumn = inaTupleElements
									.getStructureByIndex(dimIdx);
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_DISPLAY_LEVEL);
							if (inaValueElement !== null) {
								rsDimension
										.setDisplayLevelValues(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_DRILL_STATE);
							if (inaValueElement !== null) {
								rsDimension
										.setDrillState(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_MEMBER_INDEXES);
							if (inaValueElement !== null) {
								rsDimension
										.setMemberIndexes(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_PARENT_INDEXES);
							if (inaValueElement !== null) {
								rsDimension
										.setParentIndexes(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_TUPLE_ELEMENT_IDS);
							if (inaValueElement !== null) {
								rsDimension
										.setNodeIds(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
							inaValueElement = inaTupleColumn
									.getStructureByName(sap.firefly.InAConstants.QY_CHILD_COUNT);
							if (inaValueElement !== null) {
								rsDimension
										.setChildCountValues(sap.firefly.InARsEncodedValues
												.createByStructure(inaValueElement));
							}
						}
					},
					setOcpStructure : function(queryModel, ocpStructure,
							dataCount) {
						this.m_dataCount = dataCount;
						if (ocpStructure !== null) {
							this
									.importRsDimensions(
											ocpStructure
													.getListByName(sap.firefly.InAConstants.QY_DIMENSIONS),
											queryModel);
							this.m_tuplesCount = ocpStructure
									.getIntegerByName(sap.firefly.InAConstants.QY_TUPLE_COUNT);
							this.m_tuplesCountTotal = ocpStructure
									.getIntegerByNameWithDefault(
											sap.firefly.InAConstants.QY_TUPLE_COUNT_TOTAL,
											-1);
							this.importRsTuples(ocpStructure);
						}
					},
					getRsDimensionSize : function() {
						if (this.m_rsDimensionsList === null) {
							return 0;
						}
						return this.m_rsDimensionsList.size();
					},
					notifySetAxisMetadata : function() {
						var cursorAxis = this.getCursorAxis();
						var dimensionCount = this.getRsDimensionSize();
						var idxDimension;
						var rsDimension;
						var fields;
						var fieldCount;
						var idxField;
						var field;
						var isVisible;
						cursorAxis.setSupportsLayoutFromResultset(true);
						cursorAxis.startAddMetadata(dimensionCount);
						for (idxDimension = 0; idxDimension < dimensionCount; idxDimension++) {
							rsDimension = this.m_rsDimensionsList
									.get(idxDimension);
							cursorAxis.addNextTupleElementMetadata(
									idxDimension, rsDimension.getName());
							fields = rsDimension.getFields();
							fieldCount = fields.size();
							for (idxField = 0; idxField < fieldCount; idxField++) {
								field = fields.get(idxField);
								isVisible = ((this.m_supportsObtainability === false) || field
										.isVisible());
								cursorAxis.addNextFieldMetadata(
										field.getName(), isVisible);
							}
						}
						cursorAxis.endAddMetadata();
					},
					resetIfNotNull : function(cursor) {
						if (cursor !== null) {
							cursor.resetCursor();
						}
					},
					resetAxisCursor : function(newIndex) {
						var size;
						var dimensionIndex;
						var rsDimension;
						if (newIndex !== 0) {
							throw sap.firefly.XException
									.createIllegalStateException("The axis cursor can only be resetted to 0.");
						}
						size = this.getRsDimensionSize();
						for (dimensionIndex = 0; dimensionIndex < size; dimensionIndex++) {
							rsDimension = this.m_rsDimensionsList
									.get(dimensionIndex);
							this.resetIfNotNull(rsDimension.getMemberIndexes());
							this.resetIfNotNull(rsDimension.getParentIndexes());
							this.resetIfNotNull(rsDimension.getDisplayValues());
							this.resetIfNotNull(rsDimension.getDrillStates());
							this.resetIfNotNull(rsDimension.getNodeIds());
						}
					},
					notifyAxisCursorChange : function(newIndex) {
						var line;
						var isAlertLevelValid;
						var isExceptionNameValid;
						var size;
						var dimensionIndex;
						var rsDimension;
						var memberIndex;
						var parentIndexes;
						var displayValues;
						var drillStates;
						var nodeIds;
						var childCountValues;
						var childCount;
						if (this.m_currentIndex >= newIndex) {
							this.resetAxisCursor(newIndex);
						}
						this.m_currentIndex = newIndex;
						line = this.getCursorAxis();
						line.setTupleElementCursorBeforeStart();
						isAlertLevelValid = !sap.firefly.PrUtils
								.isListEmpty(this.m_alertLevel);
						isExceptionNameValid = !sap.firefly.PrUtils
								.isListEmpty(this.m_exceptionNames);
						size = this.getRsDimensionSize();
						for (dimensionIndex = 0; dimensionIndex < size; dimensionIndex++) {
							line.nextTupleElement();
							rsDimension = this.m_rsDimensionsList
									.get(dimensionIndex);
							memberIndex = rsDimension.getMemberIndexes()
									.getNextIntegerValue();
							line.setDimensionMemberType(rsDimension
									.getMemberType(memberIndex));
							parentIndexes = rsDimension.getParentIndexes();
							if (parentIndexes !== null) {
								line.setParentNodeIndex(parentIndexes
										.getNextIntegerValue());
							}
							displayValues = rsDimension.getDisplayValues();
							if (displayValues !== null) {
								line.setDisplayLevel(displayValues
										.getNextIntegerValue());
							}
							drillStates = rsDimension.getDrillStates();
							if (drillStates !== null) {
								line.setDrillState(sap.firefly.QInAConverter
										.lookupDrillState(drillStates
												.getNextIntegerValue()));
							}
							nodeIds = rsDimension.getNodeIds();
							if (nodeIds !== null) {
								line.setNodeId(nodeIds.getNextStringValue());
							}
							childCountValues = rsDimension
									.getChildCountValues();
							if (childCountValues !== null) {
								childCount = childCountValues
										.getNextIntegerValue();
								line.setChildCount(childCount);
							} else {
								line.setChildCount(-1);
							}
							if (isAlertLevelValid && isExceptionNameValid) {
								line.setAlertLevel(this.m_alertLevel
										.getIntegerByIndexWithDefault(
												memberIndex, 0));
								line.setExceptionName(this.m_exceptionNames
										.getStringByIndexWithDefault(
												memberIndex, null));
							}
							this.iterateFields(line, rsDimension, memberIndex);
						}
					},
					iterateFields : function(line, rsDimension, memberIndex) {
						var keyFieldIndex = rsDimension.getKeyFieldIndex();
						var rsFields = rsDimension.getFields();
						var fieldCount = rsFields.size();
						var fieldIdx;
						var rsField;
						var inaValueException;
						var formattedValue;
						for (fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
							line.nextFieldValue();
							rsField = rsFields.get(fieldIdx);
							inaValueException = rsField
									.getValueExceptionByIndex(memberIndex);
							if (inaValueException !== -1) {
								line
										.setValueException(sap.firefly.QInAConverter
												.lookupException(inaValueException));
							}
							formattedValue = this
									.setValueAndReturnFormattedValue(line,
											rsField.getValues(), memberIndex);
							if (fieldIdx === keyFieldIndex) {
								line.setDimensionMemberName(formattedValue);
								line.setDimensionMemberNameValueException(line
										.getValueException());
							}
							line.setFormattedValue(formattedValue);
						}
					},
					setValueAndReturnFormattedValue : function(line,
							inaFieldValues, memberIndex) {
						var fieldValueType;
						var field;
						var formattedValue;
						var memberType;
						var isTypeTotals;
						var valueException;
						var isNullValue;
						var booleanValue;
						var intValue;
						var longValue;
						var doubleValue;
						var dateValue;
						var timeValue;
						var dateTimeValue;
						var geometry;
						var spatialType;
						var error;
						if (inaFieldValues === null) {
							return "InA Error: No data available";
						}
						field = line.getField();
						if (field === null) {
							fieldValueType = sap.firefly.XValueType.STRING;
						} else {
							fieldValueType = field.getValueType();
						}
						memberType = line.getDimensionMemberType();
						isTypeTotals = (memberType === sap.firefly.MemberType.RESULT)
								|| (memberType === sap.firefly.MemberType.CONDITION_RESULT)
								|| (memberType === sap.firefly.MemberType.CONDITION_OTHERS_RESULT);
						valueException = line.getValueException();
						isNullValue = valueException === sap.firefly.ValueException.NULL_VALUE;
						if ((fieldValueType === sap.firefly.XValueType.STRING)
								|| isTypeTotals) {
							formattedValue = inaFieldValues
									.getStringByIndex(memberIndex);
							if (isTypeTotals
									&& (line.getValueException() !== null)) {
								if (memberType === sap.firefly.MemberType.RESULT) {
									formattedValue = sap.firefly.InAConstants.QY_TOTAL;
								} else {
									if (memberType === sap.firefly.MemberType.CONDITION_RESULT) {
										formattedValue = sap.firefly.InAConstants.QY_TOTAL_INCLUDING;
									} else {
										formattedValue = sap.firefly.InAConstants.QY_TOTAL_REMAINING;
									}
								}
								line
										.setValueException(sap.firefly.ValueException.NORMAL);
							}
							line.setStringValue(formattedValue);
						} else {
							if (fieldValueType === sap.firefly.XValueType.BOOLEAN) {
								booleanValue = inaFieldValues
										.getBooleanByIndex(memberIndex);
								line.setBooleanValue(booleanValue);
								formattedValue = sap.firefly.XBoolean
										.convertBooleanToString(booleanValue);
							} else {
								if (fieldValueType === sap.firefly.XValueType.INTEGER) {
									intValue = inaFieldValues
											.getIntegerByIndex(memberIndex);
									line.setIntegerValue(intValue);
									formattedValue = sap.firefly.XInteger
											.convertIntegerToString(intValue);
								} else {
									if (fieldValueType === sap.firefly.XValueType.LONG) {
										longValue = inaFieldValues
												.getLongByIndex(memberIndex);
										line.setLongValue(longValue);
										formattedValue = sap.firefly.XLong
												.convertLongToString(longValue);
									} else {
										if ((fieldValueType === sap.firefly.XValueType.DOUBLE)
												|| (fieldValueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
											doubleValue = inaFieldValues
													.getDoubleByIndex(memberIndex);
											line.setDoubleValue(doubleValue);
											formattedValue = sap.firefly.XDouble
													.convertDoubleToString(doubleValue);
										} else {
											if (fieldValueType === sap.firefly.XValueType.DATE) {
												formattedValue = inaFieldValues
														.getStringByIndex(memberIndex);
												if (isNullValue) {
													line
															.setNullValue(fieldValueType);
												} else {
													dateValue = sap.firefly.XDate
															.createDateFromStringWithFlag(
																	formattedValue,
																	this.m_supportsSapDateFormat);
													if (this.m_supportsSapDateFormat
															&& (dateValue !== null)) {
														formattedValue = dateValue
																.toIsoFormat();
													}
													line
															.setDateValue(dateValue);
												}
											} else {
												if (fieldValueType === sap.firefly.XValueType.TIME) {
													formattedValue = inaFieldValues
															.getStringByIndex(memberIndex);
													if (isNullValue) {
														line
																.setNullValue(fieldValueType);
													} else {
														timeValue = sap.firefly.XTime
																.createTimeFromStringWithFlag(
																		formattedValue,
																		this.m_supportsSapDateFormat);
														if (this.m_supportsSapDateFormat
																&& (timeValue !== null)) {
															formattedValue = timeValue
																	.toIsoFormat();
														}
														line
																.setTimeValue(timeValue);
													}
												} else {
													if (fieldValueType === sap.firefly.XValueType.DATE_TIME) {
														formattedValue = inaFieldValues
																.getStringByIndex(memberIndex);
														if (isNullValue) {
															line
																	.setNullValue(fieldValueType);
														} else {
															dateTimeValue = sap.firefly.XDateTime
																	.createDateTimeFromStringWithFlag(
																			formattedValue,
																			this.m_supportsSapDateFormat);
															if (this.m_supportsSapDateFormat
																	&& (dateTimeValue !== null)) {
																formattedValue = dateTimeValue
																		.toIsoFormat();
															}
															line
																	.setDateTimeValue(dateTimeValue);
														}
													} else {
														if (fieldValueType
																.isSpatial()) {
															formattedValue = inaFieldValues
																	.getStringByIndex(memberIndex);
															geometry = sap.firefly.XGeometryValue
																	.createGeometryValueWithWkt(formattedValue);
															if (geometry === null) {
																line
																		.setStringValue(formattedValue);
															} else {
																spatialType = geometry
																		.getValueType();
																if (spatialType === sap.firefly.XValueType.MULTI_POLYGON) {
																	line
																			.setMultiPolygonValue(geometry);
																} else {
																	if (spatialType === sap.firefly.XValueType.LINE_STRING) {
																		line
																				.setLineStringValue(geometry);
																	} else {
																		if (spatialType === sap.firefly.XValueType.MULTI_LINE_STRING) {
																			line
																					.setMultiLineStringValue(geometry);
																		} else {
																			if (spatialType === sap.firefly.XValueType.POINT) {
																				line
																						.setPointValue(geometry);
																			} else {
																				if (spatialType === sap.firefly.XValueType.POLYGON) {
																					line
																							.setPolygonValue(geometry);
																				} else {
																					if (spatialType === sap.firefly.XValueType.MULTI_POINT) {
																						line
																								.setMultiPointValue(geometry);
																					}
																				}
																			}
																		}
																	}
																}
															}
														} else {
															error = sap.firefly.XMessage
																	.createErrorWithCode(
																			sap.firefly.OriginLayer.UTILITY,
																			sap.firefly.ErrorCodes.INVALID_DATATYPE,
																			"Unsupported datatype",
																			null,
																			false,
																			fieldValueType);
															line
																	.setErrorValue(error);
															formattedValue = error
																	.getText();
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return formattedValue;
					},
					getTuplesCount : function() {
						return this.m_tuplesCount;
					},
					getTuplesCountTotal : function() {
						return this.m_tuplesCountTotal;
					},
					getTupleElementsCount : function() {
						return this.m_tupleElementsCount;
					},
					getDataCount : function() {
						return this.m_dataCount;
					}
				});
$Firefly.createClass("sap.firefly.InAService", sap.firefly.DfService, {
	$statics : {
		CLAZZ : null,
		staticSetup : function() {
			sap.firefly.InAService.CLAZZ = sap.firefly.XClass
					.create(sap.firefly.InAService);
		}
	},
	m_queryProvider : null,
	releaseObject : function() {
		if (this.m_queryProvider !== null) {
			this.m_queryProvider.releaseObject();
			this.m_queryProvider = null;
		}
		sap.firefly.InAService.$superclass.releaseObject.call(this);
	},
	getQueryManagerProvider : function() {
		return this.m_queryProvider;
	},
	isServiceConfigMatching : function(serviceConfig, connection, messages) {
		return false;
	}
});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarAction",
				sap.firefly.QOlapSyncAction,
				{
					doStrictVariableProcessing : function() {
						var parent = this.getActionContext();
						var application;
						if (parent === null) {
							return false;
						}
						application = parent.getApplication();
						if (application === null) {
							return false;
						}
						return true;
					},
					checkDirectValueTransfer : function() {
						var variableProcessor;
						if (this.doStrictVariableProcessing() === false) {
							return;
						}
						variableProcessor = this.getActionContext()
								.getVariableProcessor();
						if (variableProcessor === null) {
							return;
						}
						if (variableProcessor.isDirectVariableTransferEnabled()) {
							throw sap.firefly.XException
									.createIllegalStateException("stateful variable handling cannot be mixed with direct variable transfer");
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onVariableProcessorExecuted(extResult, data,
								customIdentifier);
					},
					createFunction : function() {
						return this.getActionContext().createFunction();
					},
					getComponentName : function() {
						return "InAVariableAction";
					},
					setVariablesStructure : function(rootElement) {
						var deepCopy;
						var provider;
						var cubeStructure;
						var message2;
						var importer;
						var processor;
						if (rootElement !== null) {
							deepCopy = sap.firefly.PrStructure
									.createDeepCopy(rootElement);
							provider = this.getActionContext();
							sap.firefly.PlanningState.update(provider
									.getApplication(),
									provider.getSystemName(), deepCopy, this);
							if (sap.firefly.InAHelper.importMessages(deepCopy,
									this) === false) {
								cubeStructure = deepCopy
										.getStructureByName(sap.firefly.InAConstants.QY_CUBE);
								if (cubeStructure === null) {
									message2 = deepCopy.toString();
									this
											.addError(
													sap.firefly.ErrorCodes.PARSER_ERROR,
													message2);
									return false;
								}
								importer = this.getImporter();
								processor = this.getProcessor();
								importer.importVariables(cubeStructure,
										processor.getVariableContainerBase());
								return true;
							}
						}
						return false;
					},
					setStructure : function(rootElement) {
						var deepCopy;
						var provider;
						if (rootElement !== null) {
							deepCopy = sap.firefly.PrStructure
									.createDeepCopy(rootElement);
							provider = this.getActionContext();
							sap.firefly.PlanningState.update(provider
									.getApplication(),
									provider.getSystemName(), deepCopy, this);
							if (sap.firefly.InAHelper.importMessages(deepCopy,
									this) === false) {
								return true;
							}
						}
						return false;
					},
					getProcessor : function() {
						return this.getActionContext()
								.getVariableProcessorBase();
					},
					getImporter : function() {
						return this.getActionContext().getVariablesImporter();
					},
					getExporter : function() {
						return this.getActionContext().getVariablesExporter();
					},
					isSuccessfullyProcessed : function() {
						return this.isValid();
					},
					getRequestorProvider : function() {
						return this.getActionContext().getRequestorProvider();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrSyncAction",
				sap.firefly.QOlapSyncAction,
				{
					m_rpcFunction : null,
					releaseObject : function() {
						this.m_rpcFunction = sap.firefly.XObject
								.releaseIfNotNull(this.m_rpcFunction);
						sap.firefly.InAQMgrSyncAction.$superclass.releaseObject
								.call(this);
					},
					createFunction : function() {
						return this.getActionContext().createFunction();
					},
					cancelSynchronization : function() {
						sap.firefly.InAQMgrSyncAction.$superclass.cancelSynchronization
								.call(this);
						this.m_rpcFunction.cancelSynchronization();
					},
					initPlanningSupport : function(inaStructure,
							beforeVariables) {
						var provider = this.getActionContext();
						var capabilities = provider.getCapabilitiesBase();
						var isBW = capabilities.getSystemType().isTypeOf(
								sap.firefly.SystemType.BW);
						var supportsDataEntryReadOnly = provider
								.supportsDataEntryReadOnly();
						var isDataEntryEnabled = provider.isDataEntryEnabled();
						var isDataEntryReadOnly;
						if (isBW) {
							isDataEntryEnabled = (sap.firefly.PrUtils
									.getBooleanProperty(
											inaStructure,
											sap.firefly.InAConstants.QY_DEFAULT_INPUT_MODE) !== null);
							if (isDataEntryEnabled) {
								if (beforeVariables) {
									isDataEntryReadOnly = !sap.firefly.PrUtils
											.getBooleanValueProperty(
													inaStructure,
													sap.firefly.InAConstants.QY_DEFAULT_INPUT_MODE,
													false);
								} else {
									isDataEntryReadOnly = !sap.firefly.PrUtils
											.getBooleanValueProperty(
													inaStructure,
													sap.firefly.InAConstants.QY_INPUT_ENABLED,
													false);
								}
							} else {
								isDataEntryReadOnly = true;
							}
							supportsDataEntryReadOnly = isDataEntryEnabled;
						} else {
							if (isDataEntryEnabled === false) {
								isDataEntryEnabled = sap.firefly.PrUtils
										.getBooleanValueProperty(
												inaStructure,
												sap.firefly.InAConstants.QY_INPUT_ENABLED,
												false);
							}
							isDataEntryReadOnly = !isDataEntryEnabled;
						}
						provider.getQueryModelBase()
								.setSupportsDataEntryReadOnly(
										supportsDataEntryReadOnly);
						provider.setDataEntryReadOnly(isDataEntryReadOnly);
						provider.setDataEntryEnabled(isDataEntryEnabled);
						if (isBW && isDataEntryEnabled) {
							provider.initializeDataAreaState();
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarCancelAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarCancelAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableCancelAction";
					},
					processSynchronization : function(syncType) {
						return false;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							this
									.getProcessor()
									.setVariableProcessorState(
											sap.firefly.VariableProcessorState.SUBMITTED);
						}
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarCheckVariablesAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarCheckVariablesAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableCheckVariablesAction";
					},
					processSynchronization : function(syncType) {
						return false;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootElement;
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							rootElement = response.getRootElement();
							this.setStructure(rootElement);
						}
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarGetRuntimeInfoAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarGetRuntimeInfoAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableGetRuntimeInfoAction";
					},
					processSynchronization : function(syncType) {
						var ocpFunction;
						var requestStructure;
						var requestorProvider;
						this.checkDirectValueTransfer();
						ocpFunction = this.createFunction();
						requestStructure = ocpFunction.getRequest()
								.getRequestStructure();
						requestorProvider = this.getRequestorProvider();
						requestorProvider
								.fillVariableRequestorDataRequestContext(
										requestStructure,
										false,
										sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION,
										null);
						this
								.getProcessor()
								.setVariableProcessorState(
										sap.firefly.VariableProcessorState.PROCESSING_UPDATE_VALUES);
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootElement;
						var successfullyProcessed;
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							rootElement = response.getRootElement();
							successfullyProcessed = false;
							successfullyProcessed = this
									.setVariablesStructure(rootElement);
							if (successfullyProcessed) {
								this.getProcessor()
										.setVariablesProcessed(false);
							} else {
								this
										.addError(
												sap.firefly.ErrorCodes.OTHER_ERROR,
												"Error when setting variable structure");
							}
						}
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarReInitAfterSubmitAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarReInitAfterSubmitAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableReInitAfterSubmitAction";
					},
					processSynchronization : function(syncType) {
						return false;
					},
					onVariableProcessorExecuted : function(extResult, result,
							customIdentifier) {
						this.addAllMessages(extResult);
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarSetGetValuesAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarSetGetValuesAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableSetGetValuesAction";
					},
					processSynchronization : function(syncType) {
						return false;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootElement;
						var successfullyProcessed;
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							rootElement = response.getRootElement();
							successfullyProcessed = false;
							successfullyProcessed = this
									.setVariablesStructure(rootElement);
							if (successfullyProcessed) {
								this.getProcessor()
										.setVariablesProcessed(false);
							} else {
								this
										.addError(
												sap.firefly.ErrorCodes.OTHER_ERROR,
												"Error when setting variable structure");
							}
						}
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAPlanningVarSubmitAction",
				sap.firefly.InAPlanningVarAction,
				{
					$statics : {
						createAndRun : function(parent, syncType, listener,
								customIdentifier) {
							var newObject = new sap.firefly.InAPlanningVarSubmitAction();
							newObject.setupVariableAction(parent, syncType,
									listener, customIdentifier);
							return newObject;
						}
					},
					setupVariableAction : function(parent, syncType, listener,
							customIdentifier) {
						this.setupActionAndRun(syncType, parent, listener,
								customIdentifier);
					},
					getComponentName : function() {
						return "InAVariableSubmitAction";
					},
					processSynchronization : function(syncType) {
						var ocpFunction;
						var requestStructure;
						var requestorProvider;
						var inaDefinition;
						this.checkDirectValueTransfer();
						if (this.getActionContext().isVariableSubmitNeeded() === false) {
							this.setData(this);
							return false;
						}
						ocpFunction = this.createFunction();
						requestStructure = ocpFunction.getRequest()
								.getRequestStructure();
						requestorProvider = this.getRequestorProvider();
						inaDefinition = requestorProvider
								.fillVariableRequestorDataRequestContext(
										requestStructure,
										false,
										sap.firefly.InAConstants.VA_PROCESSING_STEP_SUBMIT,
										null);
						this.getExporter().exportVariables(
								this.getProcessor().getVariableContainer(),
								inaDefinition);
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootElement;
						var successfullyProcessed;
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							rootElement = response.getRootElement();
							successfullyProcessed = this
									.setStructure(rootElement);
							this.getProcessor().setVariablesProcessed(
									successfullyProcessed);
							if (successfullyProcessed === false) {
								this
										.addError(
												sap.firefly.ErrorCodes.OTHER_ERROR,
												"Error when setting variable structure");
							}
						}
						this.setData(this);
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrCancelThreadsAction",
				sap.firefly.InAQMgrSyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, parent) {
							var newObject = new sap.firefly.InAQMgrCancelThreadsAction();
							newObject.setupActionAndRun(syncType, parent,
									listener, customIdentifier);
							return newObject;
						}
					},
					getComponentName : function() {
						return "InAQMgrCancelThreadsAction";
					},
					processSynchronization : function(syncType) {
						var request;
						var requestStructure;
						this.m_rpcFunction = this.getActionContext()
								.createFunction();
						request = this.m_rpcFunction.getRequest();
						requestStructure = this.fillRequestStructure();
						if (requestStructure === null) {
							return false;
						}
						request.setRequestStructure(requestStructure);
						this.m_rpcFunction.processFunctionExecution(syncType,
								this, null);
						return true;
					},
					fillRequestStructure : function() {
						var parent = this.getActionContext();
						var instanceId = parent.getInstanceId();
						var requestStructure;
						var inaAnalytics;
						var inaActions;
						var inaCloseAction;
						var inaDataSources;
						if (instanceId === null) {
							return null;
						}
						requestStructure = sap.firefly.PrStructure.create();
						inaAnalytics = requestStructure
								.setNewStructureByName(sap.firefly.InAConstants.QY_ANALYTICS);
						inaActions = inaAnalytics
								.setNewListByName(sap.firefly.InAConstants.QY_ACTIONS);
						inaCloseAction = inaActions.addNewStructure();
						inaCloseAction.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.VA_TYPE_CLOSE);
						inaDataSources = inaCloseAction
								.setNewListByName(sap.firefly.InAConstants.QY_DATA_SOURCES);
						inaDataSources.addString(instanceId);
						return requestStructure;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						this.addAllMessages(extResult);
						this.setData(this.getActionContext());
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onProviderCancelThreads(extResult, data,
								customIdentifier);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrShutdownAction",
				sap.firefly.InAQMgrSyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, parent) {
							var newObject = new sap.firefly.InAQMgrShutdownAction();
							newObject.setupActionAndRun(syncType, parent,
									listener, customIdentifier);
							return newObject;
						}
					},
					getComponentName : function() {
						return "InAQMgrShutdownAction";
					},
					processSynchronization : function(syncType) {
						var provider = this.getActionContext();
						var request;
						var requestStructure;
						if (provider.supportsShutdown()) {
							this.m_rpcFunction = this.getActionContext()
									.createFunction();
							request = this.m_rpcFunction.getRequest();
							requestStructure = this.fillRequestStructure();
							if (requestStructure !== null) {
								request.setRequestStructure(requestStructure);
								this.m_rpcFunction.processFunctionExecution(
										syncType, this, null);
								return true;
							}
						}
						return false;
					},
					fillRequestStructure : function() {
						var parent = this.getActionContext();
						var instanceId = parent.getInstanceId();
						var requestStructure;
						var inaAnalytics;
						var inaActions;
						var inaCloseAction;
						var inaDataSources;
						if (instanceId === null) {
							return null;
						}
						requestStructure = sap.firefly.PrStructure.create();
						inaAnalytics = requestStructure
								.setNewStructureByName(sap.firefly.InAConstants.QY_ANALYTICS);
						inaActions = inaAnalytics
								.setNewListByName(sap.firefly.InAConstants.QY_ACTIONS);
						inaCloseAction = inaActions.addNewStructure();
						inaCloseAction.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.VA_TYPE_CLOSE);
						inaDataSources = inaCloseAction
								.setNewListByName(sap.firefly.InAConstants.QY_DATA_SOURCES);
						inaDataSources.addString(instanceId);
						return requestStructure;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						this.addAllMessages(extResult);
						this.setData(this.getActionContext());
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onProviderShutdown(extResult, data,
								customIdentifier);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrStartupAction",
				sap.firefly.InAQMgrSyncAction,
				{
					$statics : {
						createServiceInitAndRun : function(syncType, listener,
								customIdentifier, parent, genericData) {
							var newObject = new sap.firefly.InAQMgrStartupAction();
							newObject.m_isServiceInit = true;
							newObject.setData(genericData);
							newObject.setupActionAndRun(syncType, parent,
									listener, customIdentifier);
							return newObject;
						},
						createMetadataInitAndRun : function(syncType, listener,
								customIdentifier, parent, genericData) {
							var newObject = new sap.firefly.InAQMgrStartupAction();
							newObject.m_isServiceInit = false;
							newObject.setData(genericData);
							newObject.setupActionAndRun(syncType, parent,
									listener, customIdentifier);
							return newObject;
						}
					},
					m_isServiceInit : false,
					getComponentName : function() {
						return "QmStartupAction";
					},
					processSynchronization : function(syncType) {
						var provider = this.getActionContext();
						var mode;
						var queryModel;
						var dataSource;
						var protocolCapabilities;
						var inaCapabilities;
						var instanceId;
						var dataSourceBase;
						var storedMetadata;
						var definitionAsStructure;
						var definitionType;
						var extendedDimensions;
						var key;
						var serviceConfig;
						var blendingMgr;
						if (this.m_isServiceInit) {
							if (provider.getLifeCycleState() !== sap.firefly.LifeCycleState.INITIAL) {
								this.addError(
										sap.firefly.ErrorCodes.INVALID_STATE,
										"Query Manager is not initial");
								return false;
							}
							provider
									.setLifeCycleState(sap.firefly.LifeCycleState.STARTING_UP);
						}
						mode = provider.getMode();
						queryModel = this.getQueryModelBase();
						dataSource = provider.getDataSource();
						if ((mode === sap.firefly.QueryManagerMode.DEFAULT)
								&& (dataSource === null)) {
							this.addError(sap.firefly.ErrorCodes.INVALID_STATE,
									"No datasource given");
						} else {
							protocolCapabilities = queryModel
									.getProtocolCapabilities();
							inaCapabilities = provider.getInaCapabilities();
							protocolCapabilities
									.setClientCapabilities(inaCapabilities
											.getClientMainCapabilities());
							protocolCapabilities
									.setServerCapabilities(inaCapabilities
											.getServerMainCapabilities());
							protocolCapabilities
									.setIntersectCapabilities(inaCapabilities
											.getActiveMainCapabilities());
							queryModel.setDataSource(dataSource);
							instanceId = queryModel.getDataSource()
									.getInstanceId();
							if (instanceId === null) {
								instanceId = provider.getInstanceId();
								if (instanceId === null) {
									instanceId = provider.getApplication()
											.createNextInstanceId();
								}
								dataSourceBase = queryModel.getDataSourceBase();
								dataSourceBase.setInstanceId(instanceId);
								dataSourceBase.setSystemName(provider
										.getSystemDescription().getName());
							}
							if ((mode !== sap.firefly.QueryManagerMode.RAW_QUERY)
									|| (this.m_isServiceInit === false)) {
								storedMetadata = null;
								definitionAsStructure = provider
										.getDefinitionAsStructure();
								definitionType = provider.getDefinitionType();
								if ((definitionAsStructure !== null)
										&& (definitionType !== null)
										&& (definitionType.containsMetadata())) {
									storedMetadata = definitionAsStructure;
								} else {
									if (dataSource !== null) {
										extendedDimensions = dataSource
												.getExtendedDimensions();
										key = sap.firefly.XStringBuffer
												.create();
										key.append(dataSource
												.getFullQualifiedName());
										if (extendedDimensions === null) {
											key.append("[]");
										} else {
											if (dataSource
													.getExtendedDimensions()
													.hasElements()) {
												if (mode === sap.firefly.QueryManagerMode.BLENDING) {
													this
															.addWarningExt(
																	sap.firefly.OriginLayer.SERVER,
																	sap.firefly.ErrorCodes.INVALID_DIMENSION,
																	"Joining ExtendedDimensions on a BlendingQuery is not supported by the backend!");
												}
											}
											key.append(extendedDimensions
													.toString());
										}
										serviceConfig = provider
												.getServiceConfig();
										if (serviceConfig.getDefinitionAsJson() !== null) {
											storedMetadata = this
													.getApplication()
													.getStructureCacheEntry(
															key.toString());
											definitionType = sap.firefly.QModelFormat.INA_METADATA;
										}
									}
								}
								if (storedMetadata !== null) {
									this.applyMetadataStructure(queryModel,
											storedMetadata, definitionType,
											mode, true);
								} else {
									if (mode === sap.firefly.QueryManagerMode.BLENDING) {
										this
												.addProfileStep("Prepare Metadata Request");
										blendingMgr = sap.firefly.InAQMgrStartupBlending
												.create(this);
										if (blendingMgr.prepare()) {
											this.createRpcFunction(provider,
													mode);
											return blendingMgr.process(
													this.m_rpcFunction,
													syncType, this);
										}
										this.endProfileStep();
									} else {
										this
												.addProfileStep("Prepare Metadata Request");
										this.createRpcFunction(provider, mode);
										this.endProfileStep();
										this.m_rpcFunction
												.processFunctionExecution(
														syncType, this, mode);
										return true;
									}
								}
							}
						}
						return false;
					},
					createRpcFunction : function(provider, mode) {
						var request;
						var requestStructure;
						this.m_rpcFunction = provider.createFunction();
						request = this.m_rpcFunction.getRequest();
						requestStructure = request.getRequestStructure();
						this.fillMetadataRequestStructure(requestStructure,
								mode);
					},
					fillMetadataRequestStructure : function(requestStructure,
							mode) {
						var provider = this.getActionContext();
						var expandList = sap.firefly.PrList.create();
						var activeMainCapabilities;
						var hasDataSourceAtService;
						var innerRequestStructure;
						var inaOptions;
						var providerType;
						var serviceConfig;
						var blendingDefinition;
						var metadataRequest;
						expandList
								.addString(sap.firefly.InAConstants.VA_EXPAND_CUBE);
						activeMainCapabilities = provider.getInaCapabilities()
								.getActiveMainCapabilities();
						hasDataSourceAtService = activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_DATASOURCE_AT_SERVICE);
						innerRequestStructure = provider.setInnerStructure(
								requestStructure,
								sap.firefly.InAConstants.QY_METADATA,
								expandList, !hasDataSourceAtService,
								sap.firefly.QModelFormat.INA_DATA);
						if (activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_ACCOUNT_DIM_IN_RS_FORMAT)) {
							inaOptions = sap.firefly.PrStructure.create();
							inaOptions.setStringByName(
									sap.firefly.InAConstants.QY_RESULT_FORMAT,
									sap.firefly.InAConstants.VA_RS_FORMAT_V2);
							inaOptions
									.setStringByName(
											sap.firefly.InAConstants.QY_RESULT_ENCODING,
											sap.firefly.InAConstants.VA_RS_ENCODING_NONE);
							innerRequestStructure
									.setElementByName(
											sap.firefly.InAConstants.QY_RS_FEATURE_REQUEST,
											inaOptions);
						}
						providerType = provider.getProviderTypeProx();
						if ((providerType === sap.firefly.ProviderType.ANALYTICS)
								|| (providerType === sap.firefly.ProviderType.CATALOG)) {
							innerRequestStructure
									.setStringByName(
											sap.firefly.InAConstants.QY_CONTEXT,
											sap.firefly.InAConstants.VA_CONTEXT_ANALYTICS);
						} else {
							if (providerType === sap.firefly.ProviderType.PLANNING) {
								innerRequestStructure
										.setStringByName(
												sap.firefly.InAConstants.QY_CONTEXT,
												sap.firefly.InAConstants.VA_CONTEXT_PLANNING);
							} else {
								if (providerType === sap.firefly.ProviderType.LIST_REPORTING) {
									innerRequestStructure
											.setStringByName(
													sap.firefly.InAConstants.QY_CONTEXT,
													sap.firefly.InAConstants.VA_CONTEXT_LIST_REPORTING);
								}
							}
						}
						if (mode === sap.firefly.QueryManagerMode.BLENDING) {
							serviceConfig = this.getServiceConfig();
							blendingDefinition = serviceConfig
									.getBlendingDefinition();
							metadataRequest = sap.firefly.QInADataSourceBlending
									.exportDataSourceBlending(
											sap.firefly.QModelFormat.INA_DATA,
											blendingDefinition);
							sap.firefly.QInAExportUtil.setNonEmptyString(
									metadataRequest,
									sap.firefly.InAConstants.QY_INSTANCE_ID,
									serviceConfig.getInstanceId());
							innerRequestStructure.setElementByName(
									sap.firefly.InAConstants.QY_DATA_SOURCE,
									metadataRequest);
						}
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var mode;
						var provider;
						var queryModelBase;
						var rootElementAsString;
						var rootElement;
						var deserializationStructure;
						var deserializationImporter;
						var serviceConfig;
						var blendingDefinition;
						var dataSourceBase;
						var exportBlendingMappings;
						var sources;
						this.addAllMessages(extResult);
						this.addProfileStep("Process metadata");
						mode = customIdentifier;
						provider = this.getActionContext();
						queryModelBase = this.getQueryModelBase();
						if (this.isValidResponse(extResult, response)) {
							queryModelBase.stopEventing();
							rootElementAsString = response
									.getRootElementAsString();
							provider
									.setMetadataResponseRaw(rootElementAsString);
							rootElement = response.getRootElement();
							this.applyMetadataStructure(queryModelBase,
									rootElement,
									sap.firefly.QModelFormat.INA_METADATA,
									mode, false);
							deserializationStructure = provider
									.getDeserializationStructure();
							deserializationImporter = provider
									.getDeserializationImporter();
							if ((deserializationStructure !== null)
									&& (deserializationImporter !== null)) {
								deserializationImporter.importQueryModel(
										deserializationStructure,
										queryModelBase);
							}
							if (mode === sap.firefly.QueryManagerMode.BLENDING) {
								serviceConfig = this.getServiceConfig();
								blendingDefinition = serviceConfig
										.getBlendingDefinition();
								if (blendingDefinition !== null) {
									queryModelBase
											.setBlendingDefinition(blendingDefinition);
									dataSourceBase = queryModelBase
											.getDataSourceBase();
									exportBlendingMappings = sap.firefly.QInADataSourceBlending
											.exportBlendingMappings(blendingDefinition
													.getMappings());
									dataSourceBase
											.setMappings(exportBlendingMappings);
									sources = blendingDefinition.getSources();
									dataSourceBase.setBlendingSources(sources);
								}
							}
							queryModelBase.resumeEventing();
							if (provider.isDirectVariableTransferEnabled() === false) {
								provider
										.setVariableProcessorState(sap.firefly.VariableProcessorState.CHANGEABLE_STARTUP);
							}
							provider
									.setLifeCycleState(sap.firefly.LifeCycleState.ACTIVE);
						} else {
							provider
									.setLifeCycleState(sap.firefly.LifeCycleState.TERMINATED);
						}
						this.endProfileStep();
						this.endSync();
					},
					isValidResponse : function(extResult, response) {
						if (extResult.isValid() === false) {
							return false;
						}
						if (response === null) {
							return false;
						}
						if (response.getRootElement() === null) {
							this.addError(sap.firefly.ErrorCodes.PARSER_ERROR,
									"No json inside");
							return false;
						}
						return true;
					},
					applyMetadataStructure : function(queryModel, rootElement,
							modelFormat, mode, isInitWithStructure) {
						var provider;
						var inaStructure;
						var cubeStructure;
						var importInAMetadata;
						var activeMainCapabilities;
						var queryConfig;
						this.addProfileStep("applyDataModelStructure");
						if (rootElement !== null) {
							provider = this.getActionContext();
							inaStructure = rootElement;
							sap.firefly.PlanningState.update(this
									.getApplication(),
									provider.getSystemName(), inaStructure,
									this);
							if (sap.firefly.InAHelper.importMessages(
									inaStructure, this) === false) {
								cubeStructure = inaStructure;
								if (modelFormat !== sap.firefly.QModelFormat.INA_CLONE) {
									cubeStructure = inaStructure
											.getStructureByName(sap.firefly.InAConstants.QY_CUBE);
									if ((cubeStructure === null)
											&& (isInitWithStructure)) {
										cubeStructure = inaStructure;
									}
								}
								if (cubeStructure === null) {
									this
											.addErrorExt(
													sap.firefly.OriginLayer.DRIVER,
													sap.firefly.ErrorCodes.QM_CUBE_ENTRY_NOT_FOUND,
													"Cube tag in structure not found",
													null);
								} else {
									queryModel.stopEventing();
									activeMainCapabilities = provider
											.getInaCapabilities()
											.getActiveMainCapabilities();
									if (mode === sap.firefly.QueryManagerMode.BLENDING) {
										importInAMetadata = sap.firefly.QInAImportFactory
												.createForMetadata(this
														.getApplication(),
														activeMainCapabilities);
									} else {
										queryConfig = this.getServiceConfig();
										if (modelFormat === sap.firefly.QModelFormat.INA_CLONE) {
											importInAMetadata = sap.firefly.QInAImportFactory
													.create(this
															.getApplication(),
															modelFormat,
															activeMainCapabilities);
										} else {
											if (queryConfig
													.isLoadingDefaultQuery()) {
												importInAMetadata = sap.firefly.QInAImportFactory
														.createForMetadata(
																this
																		.getApplication(),
																activeMainCapabilities);
											} else {
												importInAMetadata = sap.firefly.QInAImportFactory
														.createForMetadataCore(
																this
																		.getApplication(),
																activeMainCapabilities);
											}
										}
									}
									importInAMetadata.importQueryModel(
											cubeStructure, queryModel);
									if (mode !== sap.firefly.QueryManagerMode.BLENDING) {
										this.initPlanningSupport(cubeStructure,
												true);
									}
									queryModel.resumeEventing();
									this.addAllMessages(importInAMetadata);
									sap.firefly.InAQMgrUtils
											.applyResultSetFeatureCapabilities(
													provider, cubeStructure);
								}
							}
						}
						this.endProfileStep();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						var serviceListener;
						var modelInitListener;
						if (this.m_isServiceInit) {
							serviceListener = listener;
							serviceListener.onServiceInitialized(extResult,
									data, customIdentifier);
						} else {
							modelInitListener = listener;
							modelInitListener.onQueryModelInitialized(
									extResult, data, customIdentifier);
						}
					},
					getServiceConfig : function() {
						return this.getQueryManager().getServiceConfig();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQMgrVarAction",
				sap.firefly.InAQMgrSyncAction,
				{
					$statics : {
						createAndRunDefinition : function(parent, syncType,
								listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_DEFINITION,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION,
											true, true, true);
							return newObject;
						},
						createAndRunSubmit : function(parent, syncType,
								listener, customIdentifier) {
							var state;
							var newObject;
							if (parent.getVariableProcessorState() === sap.firefly.VariableProcessorState.CHANGEABLE_REINIT) {
								state = sap.firefly.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT;
							} else {
								state = sap.firefly.VariableProcessorState.PROCESSING_SUBMIT;
							}
							newObject = new sap.firefly.InAQMgrVarAction();
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											state,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_SUBMIT,
											true, true, parent
													.isVariableSubmitNeeded());
							return newObject;
						},
						createAndRunCancel : function(parent, syncType,
								listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							var needsProcessing = (parent.isSubmitted() === false);
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_CANCEL,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_CANCEL,
											false, false, needsProcessing);
							return newObject;
						},
						createAndRunCheck : function(parent, syncType,
								listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							var needsProcessing = true;
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_CHECK,
											null, false, false, needsProcessing);
							return newObject;
						},
						createAndRunGetRuntimeInfo : function(parent, syncType,
								listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							var needsProcessing = true;
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_DEFINITION,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION,
											true, false, needsProcessing);
							return newObject;
						},
						createAndRunReInitAfterSubmit : function(parent,
								syncType, listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							var needsProcessing = (parent.isSubmitted());
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_REINIT,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION,
											true, false, needsProcessing);
							return newObject;
						},
						createAndRunSetGetValues : function(parent, syncType,
								listener, customIdentifier) {
							var newObject = new sap.firefly.InAQMgrVarAction();
							newObject
									.setupVarActionAndRun(
											syncType,
											parent,
											listener,
											customIdentifier,
											sap.firefly.VariableProcessorState.PROCESSING_UPDATE_VALUES,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION,
											true, false, true);
							return newObject;
						}
					},
					m_applyVariableStates : false,
					m_applyVariableAndModelStates : false,
					m_processingStep : null,
					m_state : null,
					m_needsProcessing : false,
					setupVarActionAndRun : function(syncType, context,
							listener, customIdentifier, state, processingStep,
							applyVarStates, applyVarAndModelStates,
							needsProcessing) {
						var savedModel;
						this.m_applyVariableStates = applyVarStates;
						this.m_applyVariableAndModelStates = applyVarAndModelStates;
						this.m_processingStep = processingStep;
						this.m_state = state;
						this.m_needsProcessing = needsProcessing;
						if (this.m_state === sap.firefly.VariableProcessorState.PROCESSING_REINIT) {
							savedModel = context
									.getQueryModel()
									.serializeToElement(
											sap.firefly.QModelFormat.INA_REPOSITORY,
											null);
							context.setStateBeforeVarScreen(savedModel);
						}
						sap.firefly.InAQMgrVarAction.$superclass.setupActionAndRun
								.call(this, syncType, context, listener,
										customIdentifier);
					},
					releaseObject : function() {
						this.m_rpcFunction = null;
						this.m_processingStep = null;
						this.m_state = null;
						sap.firefly.InAQMgrVarAction.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "InAQMgrVarAction";
					},
					processSynchronization : function(syncType) {
						var requestStructure;
						var withVariables;
						var actionContext;
						this.setData(this);
						if (this.m_needsProcessing) {
							this.m_rpcFunction = this.createFunction();
							requestStructure = this.m_rpcFunction.getRequest()
									.getRequestStructure();
							withVariables = (this.m_state !== sap.firefly.VariableProcessorState.PROCESSING_REINIT);
							actionContext = this.getActionContext();
							actionContext.fillAnalyticRequestStructure(
									requestStructure,
									sap.firefly.InAConstants.QY_ANALYTICS,
									withVariables, this.m_processingStep);
							actionContext
									.setVariableProcessorState(this.m_state);
							this.m_rpcFunction.processFunctionExecution(
									syncType, this, null);
							return true;
						}
						return false;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var context;
						var queryModel;
						var application;
						var useDeepMerge;
						var rootElement;
						var inaQueryModel;
						var inaImporter;
						var nextState;
						var stateBeforeVarScreen;
						this.addProfileStep("applyDataModelStructure");
						this.addAllMessages(extResult);
						context = this.getActionContext();
						queryModel = context.getQueryModelBase();
						application = this.getApplication();
						useDeepMerge = application.getVersion() >= sap.firefly.XVersion.V72_VAR_SUBMIT_MODEL_COPY;
						if ((extResult.isValid()) && (response !== null)) {
							rootElement = response.getRootElement();
							if (rootElement === null) {
								this.addError(
										sap.firefly.ErrorCodes.PARSER_ERROR,
										"Root element is missing");
							} else {
								if (sap.firefly.InAHelper.importMessages(
										rootElement, this) === false) {
									sap.firefly.PlanningState.update(
											application, context
													.getSystemName(),
											rootElement, this);
									if (this.m_applyVariableStates) {
										inaQueryModel = rootElement
												.getStructureByName(sap.firefly.InAConstants.QY_CUBE);
										if (inaQueryModel === null) {
											this
													.addError(
															sap.firefly.ErrorCodes.PARSER_ERROR,
															"Cannot find 'Cube' element.");
										} else {
											if (this.m_applyVariableAndModelStates) {
												if (useDeepMerge) {
													this.applyServerModelV70(
															queryModel,
															rootElement,
															inaQueryModel);
												} else {
													this.applyServerModelV59(
															queryModel,
															rootElement,
															inaQueryModel);
												}
											} else {
												inaImporter = context
														.getVariablesImporter();
												inaImporter
														.importVariables(
																inaQueryModel,
																context
																		.getVariableContainerBase());
												this
														.addAllMessages(inaImporter);
											}
										}
									}
								}
							}
						}
						nextState = this.m_state.getNextState();
						if ((this.isValid()) && (nextState !== null)) {
							if (this.m_state === sap.firefly.VariableProcessorState.PROCESSING_CANCEL) {
								stateBeforeVarScreen = context
										.getStateBeforeVarScreen();
								queryModel
										.deserializeFromElementExt(
												sap.firefly.QModelFormat.INA_REPOSITORY,
												stateBeforeVarScreen);
								context.setStateBeforeVarScreen(null);
							} else {
								if (this.m_state
										.isTypeOf(sap.firefly.VariableProcessorState.PROCESSING_SUBMIT)) {
									context.setStateBeforeVarScreen(null);
									if (useDeepMerge) {
										context.getResultsetContainer(true);
									}
								}
							}
							context.setVariableProcessorState(nextState);
						} else {
							if ((sap.firefly.XString
									.isEqual(
											this.m_processingStep,
											sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION) === false)
									|| (this.m_state === sap.firefly.VariableProcessorState.PROCESSING_UPDATE_VALUES)) {
								context.returnToPreviousProcessorState();
							}
						}
						this.endProfileStep();
						this.endSync();
					},
					applyServerModelV59 : function(queryModel, inaStructure,
							inaQueryModel) {
						var provider = this.getActionContext();
						var application = this.getApplication();
						var variableProcessorState;
						var inaImporter;
						sap.firefly.PlanningState.update(application, provider
								.getSystemName(), inaStructure, this);
						queryModel.stopEventing();
						variableProcessorState = this.getActionContext()
								.getVariableProcessorState();
						inaImporter = null;
						if (variableProcessorState === sap.firefly.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT) {
							inaImporter = sap.firefly.QInAImportFactory
									.createForDataReinit(application, provider
											.getInaCapabilities()
											.getActiveMainCapabilities());
						} else {
							inaImporter = sap.firefly.QInAImportFactory
									.createForMetadata(application, provider
											.getInaCapabilities()
											.getActiveMainCapabilities());
						}
						inaImporter.importQueryModel(inaQueryModel, queryModel);
						this.addAllMessages(inaImporter);
						this.initPlanningSupport(inaQueryModel, false);
						sap.firefly.InAQMgrUtils
								.applyResultSetFeatureCapabilities(provider,
										inaQueryModel);
						queryModel.resumeEventing();
					},
					applyServerModelV70 : function(queryModel, inaStructure,
							inaQueryModel) {
						var provider = this.getActionContext();
						var environment = this.getOlapEnv();
						var inaImporter;
						var varQueryModel;
						var variableProcessorState;
						var settings;
						sap.firefly.PlanningState.update(environment, provider
								.getSystemName(), inaStructure, this);
						inaImporter = sap.firefly.QInAImportFactory
								.createForMetadata(environment, provider
										.getInaCapabilities()
										.getActiveMainCapabilities());
						varQueryModel = sap.firefly.QueryModel.create(
								environment, null, null,
								sap.firefly.QCapabilities.create());
						varQueryModel.setDataSource(queryModel.getDataSource());
						if (sap.firefly.XString
								.isEqual(
										this.m_processingStep,
										sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION)) {
							(inaImporter)
									.importVariableContainer(
											inaStructure
													.getStructureByName(sap.firefly.InAConstants.QY_CUBE),
											queryModel.getVariableManagerBase(),
											queryModel);
						} else {
							inaImporter.importQueryModel(inaQueryModel,
									varQueryModel);
						}
						this.addAllMessages(inaImporter);
						queryModel.queueEventing();
						variableProcessorState = provider
								.getVariableProcessorState();
						settings = sap.firefly.InAQMgrMergeSettings
								.create(variableProcessorState === sap.firefly.VariableProcessorState.PROCESSING_SUBMIT);
						queryModel.mergeDeepRecursive(settings, varQueryModel);
						this.initPlanningSupport(inaQueryModel, false);
						sap.firefly.InAQMgrUtils
								.applyResultSetFeatureCapabilities(provider,
										inaQueryModel);
						queryModel.resumeEventing();
					},
					isSuccessfullyProcessed : function() {
						return this.isValid();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onVariableProcessorExecuted(extResult, data,
								customIdentifier);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQRriTargetsSyncAction",
				sap.firefly.InAQMgrSyncAction,
				{
					$statics : {
						createAndRun : function(syncType, parent, identifier) {
							var result = new sap.firefly.InAQRriTargetsSyncAction();
							result.m_parent = parent;
							result.m_identifier = identifier;
							result.setupActionAndRun(syncType, parent, null,
									null);
							return result;
						},
						extractRriTargets : function(targets) {
							var result = sap.firefly.XList.create();
							var i;
							var target;
							var rriTarget;
							var parameterNames;
							var parameters;
							var j;
							var parameterName;
							var parameterValue;
							var properties;
							var propertyNames;
							var customProperties;
							var k;
							var propertyName;
							var propertyValue;
							for (i = 0; i < sap.firefly.PrUtils.getListSize(
									targets, 0); i++) {
								target = sap.firefly.PrUtils
										.getStructureElement(targets, i);
								if (target === null) {
									continue;
								}
								rriTarget = sap.firefly.QRriTarget.create();
								parameterNames = sap.firefly.PrUtils
										.getStructureElementNames(target, null);
								if (parameterNames !== null) {
									parameters = rriTarget.getParameters();
									for (j = 0; j < parameterNames.size(); j++) {
										parameterName = parameterNames.get(j);
										parameterValue = sap.firefly.PrUtils
												.getStringProperty(target,
														parameterName);
										if (parameterValue !== null) {
											parameters.put(parameterName,
													parameterValue
															.getStringValue());
										}
									}
								}
								properties = sap.firefly.PrUtils
										.getStructureProperty(
												target,
												sap.firefly.InAConstants.QY_RRI_PROPERTIES);
								propertyNames = sap.firefly.PrUtils
										.getStructureElementNames(properties,
												null);
								if (propertyNames !== null) {
									customProperties = rriTarget
											.getCustomProperties();
									for (k = 0; k < propertyNames.size(); k++) {
										propertyName = propertyNames.get(k);
										propertyValue = sap.firefly.PrUtils
												.getStringProperty(properties,
														propertyName);
										if (propertyValue !== null) {
											customProperties.put(propertyName,
													propertyValue
															.getStringValue());
										}
									}
								}
								result.add(rriTarget);
							}
							return result;
						}
					},
					m_parent : null,
					m_identifier : null,
					releaseObject : function() {
						this.m_parent = null;
						this.m_identifier = null;
						sap.firefly.InAQRriTargetsSyncAction.$superclass.releaseObject
								.call(this);
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rriTargets;
						var extResultRriTargets;
						this.addAllMessages(extResult);
						rriTargets = null;
						if (extResult.isValid()) {
							rriTargets = sap.firefly.InAQRriTargetsSyncAction
									.extractRriTargets(sap.firefly.PrUtils
											.getListProperty(
													response.getRootElement(),
													sap.firefly.InAConstants.QY_REPORT_REPORT_TARGETS));
						}
						extResultRriTargets = sap.firefly.ExtResult.create(
								rriTargets, extResult);
						this.m_identifier.manager.setResult(
								extResultRriTargets, this.m_identifier);
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
					},
					processSynchronization : function(syncType) {
						var requestJson = this.exportRequestJson();
						var connectionPool = this.m_parent.getApplication()
								.getConnectionPool();
						var systemDescription = this.m_parent
								.getSystemDescription();
						var connection = connectionPool
								.getConnection(systemDescription.getName());
						var serverMetadata = connection.getServerMetadata();
						var capabilities = serverMetadata
								.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
						var fastPath = capabilities
								.getByKey(sap.firefly.InACapabilities.AV_CAPABILITY_FAST_PATH);
						var path;
						var ocpFunction;
						var request;
						if (fastPath !== null) {
							path = fastPath.getValue();
						} else {
							path = sap.firefly.ConnectionConstants
									.getInAPath(systemDescription
											.getSystemType());
						}
						ocpFunction = connection.newRpcFunction(path);
						request = ocpFunction.getRequest();
						request.setRequestStructure(requestJson);
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					exportRequestJson : function() {
						var requestStructure = sap.firefly.PrStructure.create();
						var innerRequestStructure = this.m_parent
								.setInnerStructure(requestStructure,
										sap.firefly.InAConstants.QY_ANALYTICS,
										null, false,
										sap.firefly.QModelFormat.INA_DATA);
						var exportInAData = sap.firefly.QInAExportFactory
								.createForData(this.m_parent.getApplication(),
										this.m_parent.getInaCapabilities()
												.getActiveMainCapabilities());
						var queryModel = this.m_parent.getQueryModel();
						var inaDefinition = exportInAData.exportQueryModel(
								queryModel, true, false);
						var options;
						var rriTargetManager;
						var rriContext;
						innerRequestStructure.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								inaDefinition);
						innerRequestStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								exportInAData.exportDataSource(queryModel
										.getDataSource(), false));
						innerRequestStructure.getStructureByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE)
								.setStringByName(
										sap.firefly.InAConstants.QY_TYPE,
										"Query/RRI");
						options = inaDefinition
								.setNewStructureByName(sap.firefly.InAConstants.QY_RS_FEATURE_REQUEST);
						options
								.setBooleanByName(
										sap.firefly.InAConstants.QY_USE_DEFAULT_ATTRIBUTE_KEY,
										false);
						if (this.m_parent.useEncodedRs()) {
							options.setStringByName(
									sap.firefly.InAConstants.QY_RESULT_FORMAT,
									sap.firefly.InAConstants.VA_RS_FORMAT_V2);
							options
									.setStringByName(
											sap.firefly.InAConstants.QY_RESULT_ENCODING,
											sap.firefly.InAConstants.VA_RS_ENCODING_NONE);
						}
						rriTargetManager = queryModel.getQueryManager()
								.getRriTargetManager();
						rriContext = innerRequestStructure
								.setNewStructureByName(sap.firefly.InAConstants.QY_REPORT_REPORT_CONTEXT);
						rriContext.setIntegerByName(
								sap.firefly.InAConstants.QY_COLUMN,
								rriTargetManager.getResultSetColumn());
						rriContext.setIntegerByName(
								sap.firefly.InAConstants.QY_ROW,
								rriTargetManager.getResultSetRow());
						return requestStructure;
					},
					getComponentName : function() {
						return "InAQRriTargetsSyncAction";
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InARsEnProvider",
				sap.firefly.DfResultSetProvider,
				{
					$statics : {
						create : function(queryProvider, initProcedure,
								initStructure) {
							var provider = new sap.firefly.InARsEnProvider();
							provider
									.setupHanalyticsResultSetProvider(
											queryProvider, initProcedure,
											initStructure);
							return provider;
						}
					},
					m_columnAxisProvider : null,
					m_dataCellProvider : null,
					m_rowsAxisProvider : null,
					m_initProcedure : null,
					m_initStructure : null,
					m_queryProvider : null,
					m_ocpFunction : null,
					setupHanalyticsResultSetProvider : function(queryProvider,
							initProcedure, initStructure) {
						var application = queryProvider.getApplication();
						var capabilities;
						this.setupSynchronizingObject(queryProvider);
						this.m_queryProvider = queryProvider;
						this.m_initProcedure = initProcedure;
						this.m_initStructure = initStructure;
						capabilities = queryProvider.getCapabilitiesBase();
						this.m_dataCellProvider = sap.firefly.InARsDataCellProvider
								.create(application, capabilities);
						this.m_columnAxisProvider = sap.firefly.InARsAxisProvider
								.create(application, capabilities,
										sap.firefly.AxisType.COLUMNS);
						this.m_rowsAxisProvider = sap.firefly.InARsAxisProvider
								.create(application, capabilities,
										sap.firefly.AxisType.ROWS);
					},
					releaseObject : function() {
						this.m_columnAxisProvider = sap.firefly.XObject
								.releaseIfNotNull(this.m_columnAxisProvider);
						this.m_rowsAxisProvider = sap.firefly.XObject
								.releaseIfNotNull(this.m_rowsAxisProvider);
						this.m_dataCellProvider = sap.firefly.XObject
								.releaseIfNotNull(this.m_dataCellProvider);
						sap.firefly.InARsEnProvider.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "InARsEnProvider";
					},
					getColumnAxisProvider : function() {
						return this.m_columnAxisProvider;
					},
					getDataCellProvider : function() {
						return this.m_dataCellProvider;
					},
					getRowsAxisProvider : function() {
						return this.m_rowsAxisProvider;
					},
					cancelSynchronization : function() {
						sap.firefly.InARsEnProvider.$superclass.cancelSynchronization
								.call(this);
					},
					processSynchronization : function(syncType) {
						var requestStructure;
						var request;
						var decorator;
						this.m_ocpFunction = this.m_queryProvider
								.createFunction();
						this.setSyncChild(this.m_ocpFunction);
						requestStructure = null;
						if (this.m_initProcedure === sap.firefly.ProviderInitProcedure.REQUEST_BY_MODEL) {
							requestStructure = this.m_queryProvider
									.fillDataRequestStructure(true);
						} else {
							if (this.m_initProcedure === sap.firefly.ProviderInitProcedure.REQUEST_BY_STRUCTURE) {
								requestStructure = this.m_initStructure;
							}
						}
						request = this.m_ocpFunction.getRequest();
						decorator = sap.firefly.RsRequestDecoratorFactory
								.getResultsetRequestDecorator(
										this.m_queryProvider.getApplication(),
										this.m_queryProvider
												.getSystemDescription(),
										requestStructure);
						if (decorator === null) {
							request.setRequestStructure(requestStructure);
						} else {
							request.setRequestStructure(decorator
									.getDecoratedRequest());
						}
						this.m_ocpFunction.processFunctionExecution(syncType,
								this, decorator);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var responseStructure;
						var updatePlanning;
						var planningRequest;
						var planningResponse;
						var decorator;
						var ok;
						this.addAllMessages(extResult);
						if ((extResult.isValid()) && (response !== null)) {
							responseStructure = response.getRootElement();
							updatePlanning = true;
							planningRequest = null;
							planningResponse = null;
							if (customIdentifier !== null) {
								updatePlanning = false;
								decorator = customIdentifier;
								responseStructure = decorator
										.buildResponse(responseStructure);
								planningRequest = decorator
										.getPlanningRequest();
								planningResponse = decorator
										.getPlanningResponse();
							}
							ok = this.setResultStructure(responseStructure,
									updatePlanning);
							if (ok === false) {
								this
										.addError(
												sap.firefly.ErrorCodes.MODEL_INFRASTRUCTURE_TERMINATED,
												"Model infrastructure terminated");
							}
							if ((planningRequest !== null)
									&& (planningResponse !== null)) {
								sap.firefly.PlanningState.updateFromResponse(
										this.getApplication(), this
												.getSystemDescription()
												.getName(), planningRequest,
										planningResponse, this);
							}
						}
						this.endSync();
					},
					getSystemDescription : function() {
						return this.m_queryProvider.getSystemDescription();
					},
					setResultStructure : function(resultStructure,
							updatePlanning) {
						var resultSet;
						var queryManagerBase;
						var application;
						var inaResultSetList;
						var rsStructure;
						var inaResultSetState;
						var resultSetState;
						var dataEntryMask;
						var dataSource;
						var metadataPropertiesBase;
						var isInputEnabled;
						var inputReadinessStateList;
						var axes;
						var size;
						var rows;
						var columns;
						var queryModel;
						var i;
						var axis;
						var type;
						var axisType;
						var name;
						if (resultStructure !== null) {
							resultSet = this.getResultSet();
							if (resultSet === null) {
								return false;
							}
							queryManagerBase = resultSet.getQueryManagerBase();
							if (queryManagerBase === null) {
								return false;
							}
							application = queryManagerBase.getApplication();
							if (application === null) {
								return false;
							}
							this.addProfileStep("setResultStructure");
							if (updatePlanning) {
								sap.firefly.PlanningState.update(application,
										this.getSystemDescription().getName(),
										resultStructure, this);
							}
							if (sap.firefly.InAHelper.importMessages(
									resultStructure, this)) {
								resultSet
										.setState(sap.firefly.ResultSetState.ERROR);
							}
							if (this.isValid()) {
								inaResultSetList = resultStructure
										.getListByName(sap.firefly.InAConstants.QY_GRIDS);
								if (!sap.firefly.PrUtils
										.isListEmpty(inaResultSetList)) {
									rsStructure = inaResultSetList
											.getStructureByIndex(0);
									inaResultSetState = rsStructure
											.getIntegerByNameWithDefault(
													sap.firefly.InAConstants.QY_RESULT_SET_STATE,
													sap.firefly.InAConstants.VA_RESULT_SET_STATE_DATA_AVAILABLE);
									resultSetState = sap.firefly.QInAConverter
											.lookupResultSetState(inaResultSetState);
									resultSet.setState(resultSetState);
									if (resultSetState === sap.firefly.ResultSetState.DATA_AVAILABLE) {
										dataEntryMask = rsStructure
												.getStructureByName(sap.firefly.InAConstants.QY_DATA_ENTRY_MASK);
										this.setDataEntryMask(dataEntryMask);
										dataSource = rsStructure
												.getStructureByName(sap.firefly.InAConstants.QY_DATA_SOURCE);
										if (dataSource !== null) {
											metadataPropertiesBase = queryManagerBase
													.getQueryModelBase()
													.getMetadataPropertiesBase();
											if (queryManagerBase
													.getQueryModelBase()
													.supportsDataRefreshAndDataTopicality()) {
												metadataPropertiesBase
														.setStringByName(
																sap.firefly.InAConstants.QY_LAST_UPDATE,
																dataSource
																		.getStringByName(sap.firefly.InAConstants.QY_DATA_LAST_REFRESH));
												metadataPropertiesBase
														.setStringByName(
																sap.firefly.InAConstants.QY_DATA_ROLL_UP_MAX,
																dataSource
																		.getStringByName(sap.firefly.InAConstants.QY_DATA_ROLL_UP_MAX));
												metadataPropertiesBase
														.setStringByName(
																sap.firefly.InAConstants.QY_DATA_ROLL_UP_MIN,
																dataSource
																		.getStringByName(sap.firefly.InAConstants.QY_DATA_ROLL_UP_MIN));
											} else {
												metadataPropertiesBase
														.setStringByName(
																sap.firefly.InAConstants.QY_LAST_UPDATE,
																dataSource
																		.getStringByName(sap.firefly.InAConstants.QY_LAST_UPDATE));
											}
										}
										isInputEnabled = rsStructure
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_INPUT_ENABLED,
														false);
										resultSet
												.setDataEntryEnabled(isInputEnabled);
										inputReadinessStateList = rsStructure
												.getListByName(sap.firefly.InAConstants.QY_INPUT_READINESS_STATES);
										this
												.setInputReadinessStates(inputReadinessStateList);
										this.connectDataCells(rsStructure);
										axes = rsStructure
												.getListByName(sap.firefly.InAConstants.QY_AXES);
										size = axes.size();
										rows = null;
										columns = null;
										queryModel = resultSet
												.getQueryManagerBase()
												.getQueryModelBase();
										for (i = 0; i < size; i++) {
											axis = axes.getStructureByIndex(i);
											type = axis
													.getStringByName(sap.firefly.InAConstants.QY_TYPE);
											if (type !== null) {
												axisType = sap.firefly.QInAConverter
														.lookupAxisType(type);
												if (axisType === sap.firefly.AxisType.ROWS) {
													rows = axis;
												} else {
													if (axisType === sap.firefly.AxisType.COLUMNS) {
														columns = axis;
													} else {
														sap.firefly.XLogger
																.println("Warning: Unrecognized axis type");
													}
												}
											} else {
												name = axis
														.getStringByName(sap.firefly.InAConstants.QY_NAME);
												if (name !== null) {
													name = sap.firefly.XString
															.convertToLowerCase(name);
													if (sap.firefly.XString
															.isEqual("columns",
																	name)) {
														columns = axis;
													} else {
														if (sap.firefly.XString
																.isEqual(
																		"rows",
																		name)) {
															rows = axis;
														}
													}
												} else {
													if (i === 0) {
														rows = axis;
													} else {
														if (i === 1) {
															columns = axis;
														} else {
															sap.firefly.XLogger
																	.println("Warning: Unrecognized axis index");
														}
													}
												}
											}
										}
										this.m_rowsAxisProvider
												.setOcpStructure(
														queryModel,
														rows,
														this.m_dataCellProvider
																.getAvailableDataCellRows());
										this.m_columnAxisProvider
												.setOcpStructure(
														queryModel,
														columns,
														this.m_dataCellProvider
																.getAvailableDataCellColumns());
									}
								}
							}
							this.endProfileStep();
						}
						return true;
					},
					connectDataCells : function(firstResultSetStructure) {
						var cellsSparse = firstResultSetStructure
								.getStructureByName(sap.firefly.InAConstants.QY_CELLS);
						var listByName;
						var dataCountRows;
						var dataCountColumns;
						var size;
						var exceptionSettings;
						if (cellsSparse !== null) {
							listByName = firstResultSetStructure
									.getListByName(sap.firefly.InAConstants.QY_CELL_ARRAY_SIZES);
							dataCountRows = 0;
							dataCountColumns = 0;
							size = listByName.size();
							if (size > 0) {
								dataCountRows = listByName.getIntegerByIndex(0);
							}
							if (size > 1) {
								dataCountColumns = listByName
										.getIntegerByIndex(1);
							}
							exceptionSettings = firstResultSetStructure
									.getListByName(sap.firefly.InACapabilities.AV_CAPABILITY_EXCEPTION_SETTINGS);
							this.m_dataCellProvider.setOcpStructure(
									cellsSparse, dataCountColumns,
									dataCountRows, exceptionSettings);
						}
					},
					setDataEntryMask : function(dataEntryMask) {
						var inaCellNames;
						var cellNames;
						var size;
						var k;
						if (dataEntryMask === null) {
							return;
						}
						inaCellNames = dataEntryMask
								.getListByName(sap.firefly.InAConstants.QY_QUERY_CELL_NAMES);
						if (inaCellNames === null) {
							return;
						}
						cellNames = sap.firefly.XListOfString.create();
						size = inaCellNames.size();
						for (k = 0; k < size; k++) {
							cellNames.add(inaCellNames.getStringByIndex(k));
						}
						this.getResultSet().setDataEntryMask(cellNames);
					},
					setInputReadinessStates : function(stateListStructure) {
						var states;
						var i;
						if (stateListStructure === null) {
							return;
						}
						states = sap.firefly.XList.create();
						for (i = 0; i < stateListStructure.size(); i++) {
							states.add(sap.firefly.RsInputReadinessState
									.create(i, stateListStructure
											.getListByIndex(i)));
						}
						if (states.isEmpty()) {
							return;
						}
						this.getResultSet().setInputReadinessStates(states);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAQueryManagerProvider",
				sap.firefly.QueryManager,
				{
					$statics : {
						CLAZZ : null,
						staticSetupProvider : function() {
							sap.firefly.InAQueryManagerProvider.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.InAQueryManagerProvider);
						}
					},
					m_exportData : null,
					m_importMetaData : null,
					m_exportValueHelp : null,
					m_importDeserialization : null,
					m_isVariableSubmitNeeded : false,
					m_directVariableTransfer : false,
					m_useEncodedRs : false,
					m_deserializationStructure : null,
					m_deserializationFormat : null,
					m_inaCapabilities : null,
					m_inaCapabilitiesValueHelp : null,
					m_valuehelpCallbacks : null,
					m_valuehelpResults : null,
					m_valuehelpIdentifiers : null,
					m_valuehelpIdentifier : 0,
					m_isMetadataCached : false,
					m_rriTargetManager : null,
					m_savedStateBeforeVarScreen : null,
					m_lastDataRequest : null,
					m_capabilities : null,
					m_metadataResponseRaw : null,
					m_availableVariants : null,
					m_activeVariant : null,
					m_preQueryName : null,
					isServiceConfigMatching : function(serviceConfig,
							connection, messages) {
						var serverMetadata = connection.getServerMetadata();
						var initSettings;
						if (serverMetadata === null) {
							messages
									.addErrorExt(
											sap.firefly.OriginLayer.DRIVER,
											sap.firefly.ErrorCodes.SERVER_METADATA_NOT_FOUND,
											"Server metadata not available",
											null);
							return false;
						}
						initSettings = serviceConfig;
						return sap.firefly.InAQMgrCapabilities
								.checkMainVersion(serverMetadata, initSettings
										.getProviderType());
					},
					cloneQueryManagerBase : function(cloneMode) {
						var queryMgr;
						this.assertLifeCycleActive();
						queryMgr = new sap.firefly.InAQueryManagerProvider();
						queryMgr.setupClone(this, cloneMode);
						return queryMgr;
					},
					setupValues : function() {
						var activeMainCapabilities;
						var application;
						var activeDeserializationCapabilities;
						var dataSource;
						var allReturnedDataSelections;
						var size;
						var i;
						sap.firefly.InAQueryManagerProvider.$superclass.setupValues
								.call(this);
						this.prepareExperimentalCapabilities();
						activeMainCapabilities = this.getMainCapabilities();
						application = this.getApplication();
						this.m_exportData = sap.firefly.QInAExportFactory
								.createForData(application,
										activeMainCapabilities);
						this.m_importMetaData = sap.firefly.QInAImportFactory
								.createForMetadata(application,
										activeMainCapabilities);
						this.m_isVariableSubmitNeeded = true;
						this.setDirectVariableTransferEnabled(true);
						this.initQueryModel();
						if (this.getDefinitionType() !== null) {
							this.m_deserializationFormat = this
									.getDefinitionType();
							this.m_deserializationStructure = this
									.getDefinitionAsStructure();
							if (this.m_deserializationStructure !== null) {
								this.m_inaCapabilities
										.importDeserializationDocumentCapabilities(this.m_deserializationStructure);
								activeDeserializationCapabilities = this.m_inaCapabilities
										.getActiveDeserializationCapabilities();
								this.m_importDeserialization = sap.firefly.QInAImportFactory
										.create(application,
												this.m_deserializationFormat,
												activeDeserializationCapabilities);
								if (this.getDataSource() === null) {
									if (this.getMode() === sap.firefly.QueryManagerMode.DEFAULT) {
										dataSource = this.m_importDeserialization
												.importDataSource(this.m_deserializationStructure);
										this.setDataSource(dataSource);
									}
								}
							}
						}
						this.m_useEncodedRs = activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_ENCODED_RS);
						this.m_valuehelpIdentifier = 0;
						this.m_isMetadataCached = false;
						this.resetMaxResultRecords();
						if (this.supportsReturnedDataSelection()) {
							allReturnedDataSelections = sap.firefly.ReturnedDataSelection
									.getAllReturnedDataSelections();
							size = allReturnedDataSelections.size();
							for (i = 0; i < size; i++) {
								this
										.enableReturnedDataSelection(allReturnedDataSelections
												.get(i));
							}
						}
					},
					prepareExperimentalCapabilities : function() {
						var serverMetadata = this.getConnection()
								.getServerMetadata();
						var providerType = this.getProviderType();
						var associatedValueHelp;
						var activeMainCapabilities;
						var serviceConfig;
						var serverBetaCapabilities;
						var serverMainCapabilities;
						var experimentalFeatures;
						var devCapaNames;
						var experimentalFeature;
						this.m_inaCapabilities = sap.firefly.InAQMgrCapabilities
								.create(serverMetadata, providerType);
						associatedValueHelp = providerType
								.getAssociatedValueHelp();
						this.m_inaCapabilitiesValueHelp = sap.firefly.InAQMgrCapabilities
								.create(serverMetadata, associatedValueHelp);
						activeMainCapabilities = this.getMainCapabilities();
						serviceConfig = sap.firefly.InAQueryManagerProvider.$superclass.getServiceConfig
								.call(this);
						serverBetaCapabilities = this.m_inaCapabilities
								.getServerBetaCapabilities();
						serverMainCapabilities = this.m_inaCapabilities
								.getServerMainCapabilities();
						experimentalFeatures = serviceConfig
								.getExperimentalFeatureSet();
						if (experimentalFeatures !== null) {
							devCapaNames = experimentalFeatures
									.getKeysAsIteratorOfString();
							while (devCapaNames.hasNext()) {
								experimentalFeature = devCapaNames.next();
								if (serverBetaCapabilities
										.containsKey(experimentalFeature)
										&& (activeMainCapabilities
												.containsKey(experimentalFeature) === false)) {
									(activeMainCapabilities)
											.addCapability(experimentalFeature);
								}
								if (serverMainCapabilities
										.containsKey(experimentalFeature)
										&& (activeMainCapabilities
												.containsKey(experimentalFeature) === false)) {
									(activeMainCapabilities)
											.addCapability(experimentalFeature);
								}
							}
						}
					},
					releaseObject : function() {
						this.m_availableVariants = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_availableVariants);
						this.m_activeVariant = null;
						this.m_exportData = sap.firefly.XObject
								.releaseIfNotNull(this.m_exportData);
						this.m_importMetaData = sap.firefly.XObject
								.releaseIfNotNull(this.m_importMetaData);
						this.m_exportValueHelp = sap.firefly.XObject
								.releaseIfNotNull(this.m_exportValueHelp);
						this.m_importDeserialization = sap.firefly.XObject
								.releaseIfNotNull(this.m_importDeserialization);
						this.m_capabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_capabilities);
						this.m_lastDataRequest = sap.firefly.XObject
								.releaseIfNotNull(this.m_lastDataRequest);
						this.m_metadataResponseRaw = null;
						this.m_inaCapabilitiesValueHelp = sap.firefly.XObject
								.releaseIfNotNull(this.m_inaCapabilitiesValueHelp);
						this.m_inaCapabilities = null;
						this.m_deserializationStructure = null;
						this.m_deserializationFormat = null;
						this.m_valuehelpCallbacks = sap.firefly.XObject
								.releaseIfNotNull(this.m_valuehelpCallbacks);
						this.m_valuehelpResults = sap.firefly.XObject
								.releaseIfNotNull(this.m_valuehelpResults);
						this.m_valuehelpIdentifiers = sap.firefly.XObject
								.releaseIfNotNull(this.m_valuehelpIdentifiers);
						this.m_valuehelpResults = sap.firefly.XObject
								.releaseIfNotNull(this.m_valuehelpResults);
						this.m_savedStateBeforeVarScreen = null;
						sap.firefly.InAQueryManagerProvider.$superclass.releaseObject
								.call(this);
					},
					createFunction : function() {
						var connection = this.getConnection();
						var systemDescription = connection
								.getSystemDescription();
						var path;
						var fastPathCap;
						var systemType;
						var ocpFunction;
						var request;
						if (systemDescription === null) {
							throw sap.firefly.XException
									.createIllegalStateException("System description is null");
						}
						path = systemDescription.getServicePath();
						if (path === null) {
							fastPathCap = this
									.getMainCapabilities()
									.getByKey(
											sap.firefly.InACapabilities.AV_CAPABILITY_FAST_PATH);
							if (fastPathCap !== null) {
								path = fastPathCap.getValue();
							}
						}
						if (path === null) {
							systemType = systemDescription.getSystemType();
							path = sap.firefly.ConnectionConstants
									.getInAPath(systemType);
						}
						ocpFunction = connection.newRpcFunction(path);
						request = ocpFunction.getRequest();
						request
								.setMethod(sap.firefly.HttpRequestMethod.HTTP_POST);
						return ocpFunction;
					},
					setLanguage : function(requestStructure) {
						var language = this.getConnection()
								.getSystemDescription().getLanguage();
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(language)) {
							requestStructure.setStringByName(
									sap.firefly.InAConstants.QY_LANGUAGE,
									language);
						}
					},
					getSystemName : function() {
						var systemDescription = this.getSystemDescription();
						if (systemDescription === null) {
							return null;
						}
						return systemDescription.getName();
					},
					setMiscRequest : function(request) {
						var inaAnalytics = request
								.getStructureByName(sap.firefly.InAConstants.QY_ANALYTICS);
						var inaDefinition;
						this.setLanguage(inaAnalytics);
						this.fillOptions(request);
						this.m_inaCapabilities
								.exportActiveMainCapabilities(inaAnalytics);
						inaDefinition = inaAnalytics
								.getStructureByName(sap.firefly.InAConstants.QY_DEFINITION);
						this
								.exportReturnedDataSelections(inaDefinition
										.getStructureByName(sap.firefly.InAConstants.QY_RS_FEATURE_REQUEST));
					},
					processProviderShutdown : function(syncType, listener,
							customIdentifier) {
						return sap.firefly.InAQMgrShutdownAction.createAndRun(
								syncType, listener, customIdentifier, this);
					},
					processProviderCancelThreads : function(syncType, listener,
							customIdentifier) {
						var connection = this.getConnection();
						var systemDescription = connection
								.getSystemDescription();
						var systemType = systemDescription.getSystemType();
						if (systemType.isTypeOf(sap.firefly.SystemType.HANA)) {
							return sap.firefly.InAQMgrCancelThreadsAction
									.createAndRun(syncType, listener,
											customIdentifier, this);
						}
						return null;
					},
					processInitialization : function(syncType, listener,
							customIdentifier) {
						var syncAction;
						this.setupValues();
						syncAction = sap.firefly.InAQMgrStartupAction
								.createServiceInitAndRun(syncType, listener,
										customIdentifier, this, this);
						return syncAction;
					},
					processModelInitialization : function(syncType, listener,
							customIdentifier) {
						var syncAction;
						this.setMode(sap.firefly.QueryManagerMode.DEFAULT);
						this.getResultsetContainer(true);
						syncAction = sap.firefly.InAQMgrStartupAction
								.createMetadataInitAndRun(syncType, listener,
										customIdentifier, this, this);
						return syncAction;
					},
					getDataAreas : function() {
						var systemDescription = this.getSystemDescription();
						var systemType;
						var queryModel;
						var dataAreaState;
						var list;
						if (systemDescription === null) {
							return null;
						}
						systemType = systemDescription.getSystemType();
						if (systemType.isTypeOf(sap.firefly.SystemType.BW) === false) {
							return null;
						}
						queryModel = this.getQueryModel();
						if (queryModel === null) {
							return null;
						}
						dataAreaState = sap.firefly.DataAreaState
								.getDataAreaStateByName(this.getApplication(),
										systemDescription.getName(), queryModel
												.getDataArea());
						if (dataAreaState === null) {
							return null;
						}
						if (dataAreaState.isSubmitted()) {
							return null;
						}
						list = sap.firefly.PrList.create();
						list.add(dataAreaState.serializeToJson());
						return list;
					},
					getValuesAbapNotExtended : function(dataEntry, newValues) {
						var newValueBW = newValues.addNewList();
						newValueBW.addInteger(dataEntry.getRow() + 1);
						newValueBW.addInteger(dataEntry.getColumn() + 1);
						newValueBW.addDouble(dataEntry.getDoubleValue());
						if (dataEntry.isValueLocked()) {
							newValueBW.addInteger(1);
						} else {
							newValueBW.addInteger(0);
						}
					},
					getValuesHana : function(dataEntry, newValues, isHana) {
						var newValueHana = newValues.addNewStructure();
						var coordinates = newValueHana
								.setNewListByName(sap.firefly.InAConstants.QY_COORDINATES);
						var newXValue;
						var newXValueType;
						var command;
						var action;
						var targetVersionId;
						coordinates.addInteger(dataEntry.getRow());
						coordinates.addInteger(dataEntry.getColumn());
						if (dataEntry.isValueChanged()
								|| dataEntry.isNewValueForced()) {
							newXValue = dataEntry.getXValue();
							newXValueType = newXValue.getValueType();
							if (newXValueType === sap.firefly.XValueType.DOUBLE) {
								newValueHana.setDoubleByName(
										sap.firefly.InAConstants.QY_NEW_VALUE,
										(newXValue).getDoubleValue());
							} else {
								if (newXValueType === sap.firefly.XValueType.STRING) {
									if (isHana) {
										newValueHana
												.setStringByName(
														sap.firefly.InAConstants.QY_NEW_VALUE_AS_STRING,
														(newXValue)
																.getStringValue());
									} else {
										newValueHana
												.setStringByName(
														sap.firefly.InAConstants.QY_NEW_VALUE_EXTERNAL,
														(newXValue)
																.getStringValue());
									}
								} else {
									throw sap.firefly.XException
											.createUnsupportedOperationException();
								}
							}
							if (dataEntry.isNewValueForced() && isHana) {
								newValueHana.setBooleanByName(
										sap.firefly.InAConstants.QY_KEEP_VALUE,
										true);
							}
						}
						if (dataEntry.isValueLockChanged()) {
							newValueHana.setBooleanByName(
									sap.firefly.InAConstants.QY_LOCKED_CELL,
									dataEntry.isValueLocked());
						}
						if ((dataEntry.getPriority() > 0)
								&& this.getCapabilitiesBase()
										.supportsSortNewValues()) {
							newValueHana.setIntegerByName(
									sap.firefly.InAConstants.QY_PRIORITY,
									dataEntry.getPriority());
						}
						if (dataEntry.getProcessingType() !== null) {
							newValueHana
									.setStringByName(
											sap.firefly.InAConstants.QY_PROCESSING_TYPE,
											dataEntry.getProcessingType()
													.getName());
						}
						command = dataEntry.getPlanningCommand();
						if ((command !== null)
								&& (command.getCommandType() === sap.firefly.PlanningCommandType.PLANNING_ACTION)) {
							action = command;
							newValueHana.setStringByName(
									sap.firefly.InAConstants.QY_ACTION_ID,
									action.getActionForQueryIdentifier()
											.getActionId());
							newValueHana
									.setElementByName(
											sap.firefly.InAConstants.QY_ACTION_PARAMETERS,
											sap.firefly.PrStructure
													.createDeepCopy(action
															.getActionParameters()));
							if (action.getActionForQueryIdentifier()
									.getActionType() === sap.firefly.PlanningActionType.QUERY_SINGLE) {
								targetVersionId = action.getTargetVersionId();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(targetVersionId)) {
									newValueHana
											.setStringByName(
													sap.firefly.InAConstants.QY_TARGET_VERSION_ID,
													targetVersionId);
								}
							}
						}
					},
					exportNewValues : function(inaDefinition, planningExtension) {
						var resultSetContainer = this
								.getActiveResultSetContainer();
						var dataEntryCollection;
						var changedEntries;
						var newValues;
						var activeMainCapabilities;
						var newValuesImplicitUnlock;
						var newValuesExtendedFormat;
						var currentSystemtype;
						var isBW;
						var isHana;
						var i;
						var dataEntry;
						var planningModel;
						var versionList;
						var versions;
						var j;
						var version;
						var sourceVersionName;
						if (resultSetContainer === null) {
							return;
						}
						dataEntryCollection = resultSetContainer
								.getDataEntryCollection();
						if (dataEntryCollection === null) {
							return;
						}
						changedEntries = dataEntryCollection
								.getChangedDataEntries();
						if ((changedEntries === null)
								|| changedEntries.isEmpty()) {
							return;
						}
						newValues = sap.firefly.PrList.create();
						activeMainCapabilities = this.getMainCapabilities();
						newValuesImplicitUnlock = activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_NEW_VALUES_IMPLICIT_UNLOCK);
						newValuesExtendedFormat = activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_NEW_VALUES_EXTENDED_FORMAT);
						currentSystemtype = this.getSystemDescription()
								.getSystemType();
						isBW = (currentSystemtype
								.isTypeOf(sap.firefly.SystemType.BW));
						isHana = (currentSystemtype
								.isTypeOf(sap.firefly.SystemType.HANA));
						for (i = 0; i < changedEntries.size(); i++) {
							dataEntry = changedEntries.get(i);
							if (!dataEntry.isNewValueForced()
									&& !dataEntry.isValueChanged()
									&& !dataEntry.isValueLockChanged()) {
								if (isHana
										&& (dataEntry.getPlanningCommand() === null)) {
									continue;
								} else {
									if (isBW && newValuesExtendedFormat) {
										continue;
									}
								}
							}
							if (!newValuesExtendedFormat
									&& newValuesImplicitUnlock
									&& !dataEntry.isNewValueForced()
									&& !dataEntry.isValueChanged()
									&& !dataEntry.isValueLocked()) {
								continue;
							}
							if (isBW && !newValuesExtendedFormat) {
								this.getValuesAbapNotExtended(dataEntry,
										newValues);
							} else {
								if (isHana || (isBW && newValuesExtendedFormat)) {
									this.getValuesHana(dataEntry, newValues,
											isHana);
								}
							}
						}
						if (newValues.isEmpty()) {
							return;
						}
						inaDefinition.setElementByName(
								sap.firefly.InAConstants.QY_NEW_VALUES,
								newValues);
						if ((this.getPlanningMode() !== sap.firefly.PlanningMode.FORCE_PLANNING)) {
							return;
						}
						planningModel = this.getPlanningModel();
						if (!planningModel.supportsPublicVersionEdit()
								|| !planningModel
										.isPublicVersionEditInProgress()) {
							return;
						}
						versionList = planningExtension
								.setNewListByName(sap.firefly.InAConstants.QY_REFRESH_VERSION_STATES);
						versions = planningModel.getVersions();
						for (j = 0; j < versions.size(); j++) {
							version = versions.get(j);
							sourceVersionName = version.getSourceVersionName();
							if (version.isPublicVersionEditPossible()) {
								versionList.addString(sourceVersionName);
								version.setShowingAsPublicVersion(false);
								version.setSourceVersionName(null);
							}
						}
						planningModel.setPublicVersionEditInProgress(false);
						this.setPublicVersionEditPossible(false);
					},
					exportPlanningMode : function(planningExtension) {
						var planningMode = this.getPlanningModeEffective();
						if (planningMode === null) {
							return;
						}
						planningExtension.setStringByName(
								sap.firefly.InAConstants.QY_PLANNING_MODE,
								planningMode.getName());
					},
					exportPlanningVersionRestriction : function(
							planningExtension) {
						var versionRestriction = this
								.getPlanningVersionRestrictionEffective();
						var isVersionRestricted;
						if (versionRestriction === sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT) {
							return;
						}
						isVersionRestricted = versionRestriction === sap.firefly.PlanningVersionRestrictionType.ONLY_PRIVATE_VERSIONS;
						planningExtension
								.setBooleanByName(
										sap.firefly.InAConstants.QY_PLANNING_VERSION_RESTRICTION,
										isVersionRestricted);
					},
					exportPlanningVersionSettings : function(planningExtension) {
						var allVersionSettings = this
								.getAllPlanningActionSequenceSettingsEffective();
						var versionsList;
						var versionRestriction;
						var i;
						var sequenceSettings;
						var hasActionSequence;
						var versionStructure;
						if (allVersionSettings === null) {
							return;
						}
						versionsList = null;
						versionRestriction = this
								.getPlanningVersionRestrictionEffective();
						for (i = 0; i < allVersionSettings.size(); i++) {
							sequenceSettings = allVersionSettings.get(i);
							hasActionSequence = sequenceSettings
									.getActionSequenceId() !== null;
							if (hasActionSequence === false) {
								if (versionRestriction !== sap.firefly.PlanningVersionRestrictionType.ONLY_PRIVATE_VERSIONS) {
									continue;
								}
								if (sequenceSettings.getIsRestrictionEnabled() === false) {
									continue;
								}
							}
							if (versionsList === null) {
								versionsList = planningExtension
										.setNewListByName(sap.firefly.InAConstants.QY_VERSIONS);
							}
							versionStructure = versionsList.addNewStructure();
							versionStructure.setIntegerByName(
									sap.firefly.InAConstants.QY_VERSION,
									sequenceSettings.getVersionId());
							versionStructure
									.setBooleanByName(
											sap.firefly.InAConstants.QY_USE_EXTERNAL_VIEW,
											sequenceSettings
													.getUseExternalView());
							if (hasActionSequence) {
								versionStructure
										.setStringByName(
												sap.firefly.InAConstants.QY_SEQUENCE_ID,
												sequenceSettings
														.getActionSequenceId());
							}
							if (sequenceSettings.isSharedVersion()) {
								versionStructure.setStringByName(
										sap.firefly.InAConstants.QY_OWNER,
										sequenceSettings.getVersionOwner());
							}
						}
					},
					exportDataEntryDescription : function(planningExtension) {
						var resultSetContainer = this
								.getActiveResultSetContainer();
						var dataEntryCollection;
						var dataCellEntryDescription;
						if (resultSetContainer === null) {
							return;
						}
						dataEntryCollection = resultSetContainer
								.getDataEntryCollection();
						if (dataEntryCollection === null) {
							return;
						}
						if (dataEntryCollection.hasChangedDataEntries() === false) {
							return;
						}
						dataCellEntryDescription = dataEntryCollection
								.getDataCellEntryDescription();
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(dataCellEntryDescription)) {
							return;
						}
						planningExtension.setStringByName(
								sap.firefly.InAConstants.QY_ACTION_DESCRIPTION,
								dataCellEntryDescription);
					},
					createResultSetProvider : function(procedure, structure) {
						if (this.m_useEncodedRs) {
							return sap.firefly.InARsEnProvider.create(this,
									procedure, structure);
						}
						throw sap.firefly.XException
								.createRuntimeException("Only encoded resultset is supported");
					},
					setInnerStructure : function(requestStructure, name,
							expandList, addDataSource, exportMode) {
						var dataAreas = this.getDataAreas();
						var innerRequestStructure;
						var queryModel;
						var inaDatasource;
						var exportActiveMainCapabilities;
						var protocolCapabilities;
						if (dataAreas !== null) {
							requestStructure.setElementByName(
									sap.firefly.InAConstants.QY_DATA_AREAS,
									dataAreas);
						}
						this.fillOptions(requestStructure);
						this.fillClientTraces(requestStructure);
						innerRequestStructure = requestStructure
								.setNewStructureByName(name);
						queryModel = this.getQueryModel();
						inaDatasource = this.m_exportData
								.exportDataSource(
										queryModel.getDataSource(),
										this
												.supportsAnalyticCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RUN_AS_USER));
						innerRequestStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								inaDatasource);
						exportActiveMainCapabilities = this.m_inaCapabilities
								.exportActiveMainCapabilitiesAsList();
						protocolCapabilities = queryModel
								.getProtocolCapabilities();
						exportActiveMainCapabilities = sap.firefly.QInAExportUtil
								.extendList(protocolCapabilities,
										exportActiveMainCapabilities);
						if (exportActiveMainCapabilities !== null) {
							innerRequestStructure.setElementByName(
									sap.firefly.InAConstants.QY_CAPABILITIES,
									exportActiveMainCapabilities);
						}
						if (expandList !== null) {
							innerRequestStructure.setElementByName(
									sap.firefly.InAConstants.QY_EXPAND,
									expandList);
						}
						this.setLanguage(innerRequestStructure);
						return innerRequestStructure;
					},
					processRriTargetSync : function(syncType, identifier) {
						return sap.firefly.InAQRriTargetsSyncAction
								.createAndRun(syncType, this, identifier);
					},
					fillOptions : function(requestStructure) {
						var options = requestStructure
								.setNewListByName(sap.firefly.InAConstants.QY_OPTIONS);
						var serverCustomizations;
						var iterator;
						if (this
								.getMainCapabilities()
								.containsKey(
										sap.firefly.InACapabilities.AV_CAPABILITY_STATEFUL_SERVER)) {
							options
									.addString(sap.firefly.InAConstants.VA_OPTIONS_STATEFUL_SERVER);
						}
						serverCustomizations = this.getServerCustomizations();
						if (sap.firefly.XCollectionUtils
								.hasElements(serverCustomizations)) {
							iterator = serverCustomizations.getIterator();
							while (iterator.hasNext()) {
								options.addString(iterator.next());
							}
						}
					},
					fillClientTraces : function(requestStructure) {
						var olapApplication = this.getOlapEnv();
						var traceOffset;
						var traceChunk;
						var traces;
						var list;
						var i;
						if (olapApplication.isTracing()) {
							if (false) {
								traceOffset = olapApplication.getTraceOffset();
								traceChunk = olapApplication.getTraceChunk();
								if (traceChunk.size() > 0) {
									traces = requestStructure
											.setNewStructureByName(sap.firefly.InAConstants.QY_CLIENT_TRACES);
									traces.setIntegerByName(
											sap.firefly.InAConstants.QY_OFFSET,
											traceOffset);
									list = traces
											.setNewListByName(sap.firefly.InAConstants.QY_ELEMENTS);
									for (i = 0; i < traceChunk.size(); i++) {
										list.add(traceChunk.get(i));
									}
								}
							}
						}
					},
					getDeserializationStructure : function() {
						return this.m_deserializationStructure;
					},
					getDeserializationImporter : function() {
						return this.m_importDeserialization;
					},
					processSpatialClustering : function(clusterSettings,
							syncType, listener, customIdentifier) {
						var clusterField;
						var request;
						var rsDefQueryModel;
						var resultSetManager;
						if (this.getQueryModel().supportsSpatialClustering() === false) {
							return sap.firefly.ExtResult
									.createWithErrorMessage("Spatial Clustering is not supported by the backend!");
						}
						if (clusterSettings === null) {
							return sap.firefly.ExtResult
									.createWithErrorMessage("The cluster settings must not be null!");
						}
						clusterField = clusterSettings.getClusterField();
						if (clusterField === null) {
							return sap.firefly.ExtResult
									.createWithErrorMessage("The cluster field must not be null!");
						}
						request = sap.firefly.QInASpatialClustering
								.exportSpatialClusteringRequest(
										this.m_exportData, clusterSettings);
						this.setMiscRequest(request);
						rsDefQueryModel = sap.firefly.RsDefQueryModel.create(
								clusterField.getQueryModel(), clusterField
										.getDimension());
						resultSetManager = sap.firefly.ResultSetContainer
								.createWithRequest(this, this, request,
										rsDefQueryModel);
						return resultSetManager.processExecution(syncType,
								listener, customIdentifier);
					},
					lazyLoadValueHelpObjects : function() {
						if (this.m_exportValueHelp === null) {
							this.m_exportValueHelp = sap.firefly.QInAExportFactory
									.createForValueHelp(this.getApplication(),
											this.getMainCapabilities());
							this.m_valuehelpCallbacks = sap.firefly.XHashMapByString
									.create();
							this.m_valuehelpResults = sap.firefly.XHashMapByString
									.create();
							this.m_valuehelpIdentifiers = sap.firefly.XHashMapByString
									.create();
						}
					},
					processMemberHelp : function(dimension, syncType, listener,
							customIdentifier) {
						var queryModel;
						var request;
						var key;
						var rsDefQueryModel;
						var resultSetManager;
						this.lazyLoadValueHelpObjects();
						queryModel = this.getQueryModel();
						request = sap.firefly.QInAValueHelp
								.exportMemberHelpRequest(
										this.m_exportValueHelp, queryModel,
										dimension);
						this.setMiscRequest(request);
						this.m_valuehelpIdentifier++;
						key = sap.firefly.XInteger
								.convertIntegerToString(this.m_valuehelpIdentifier);
						this.m_valuehelpCallbacks.put(key, listener);
						this.m_valuehelpIdentifiers.put(key, customIdentifier);
						rsDefQueryModel = sap.firefly.RsDefQueryModel.create(
								queryModel, dimension);
						resultSetManager = sap.firefly.ResultSetContainer
								.createWithRequest(this, this, request,
										rsDefQueryModel);
						resultSetManager.processExecution(syncType, this,
								sap.firefly.XIntegerValue
										.create(this.m_valuehelpIdentifier));
						return this.m_valuehelpResults.getByKey(key);
					},
					processVariablehelp : function(dimension, variable,
							syncType, listener, customIdentifier) {
						var queryModel;
						var request;
						var key;
						var rsDefQueryModel;
						var resultSetManager;
						this.lazyLoadValueHelpObjects();
						queryModel = this.getQueryModel();
						request = sap.firefly.QInAValueHelp
								.exportVariableHelpRequest(
										this.m_exportValueHelp, queryModel,
										dimension, variable);
						this.setMiscRequest(request);
						this.m_valuehelpIdentifier++;
						key = sap.firefly.XInteger
								.convertIntegerToString(this.m_valuehelpIdentifier);
						this.m_valuehelpCallbacks.put(key, listener);
						this.m_valuehelpIdentifiers.put(key, customIdentifier);
						rsDefQueryModel = sap.firefly.RsDefQueryModel.create(
								queryModel, dimension);
						resultSetManager = sap.firefly.ResultSetContainer
								.createWithRequest(this, this, request,
										rsDefQueryModel);
						resultSetManager.processExecution(syncType, this,
								sap.firefly.XIntegerValue
										.create(this.m_valuehelpIdentifier));
						return this.m_valuehelpResults.getByKey(key);
					},
					transform : function(extResult) {
						var data;
						var cursorResultSet;
						var profileTransform;
						var nodes;
						var cursorRowsAxis;
						var tupleElement;
						var dimensionMemberName;
						var dimension;
						var member;
						var fieldValue;
						var field;
						var value;
						var stringValue;
						var rsTuple;
						var parentNodeIndex;
						if (extResult.hasErrors()) {
							return sap.firefly.ExtResult
									.create(null, extResult);
						}
						data = extResult.getData();
						if ((data === null) || data.hasErrors()) {
							return sap.firefly.ExtResult
									.create(null, extResult);
						}
						cursorResultSet = data.getCursorResultSet();
						if (cursorResultSet.hasErrors()
								|| (cursorResultSet.getState() === sap.firefly.ResultSetState.ERROR)) {
							return sap.firefly.ExtResult
									.create(null, extResult);
						}
						profileTransform = sap.firefly.ProfileNode.create(
								"ValueHelp", 0);
						profileTransform
								.addProfileStep("Transforming ResultSet to List");
						nodes = sap.firefly.XList.create();
						cursorRowsAxis = cursorResultSet.getCursorRowsAxis();
						while (cursorRowsAxis.hasNextTuple()) {
							cursorRowsAxis.nextTuple();
							while (cursorRowsAxis.hasNextTupleElement()) {
								tupleElement = cursorRowsAxis
										.nextTupleElement();
								dimensionMemberName = tupleElement
										.getDimensionMemberName();
								dimension = tupleElement
										.getDimensionAtCurrentPosition();
								member = dimension
										.getDimensionMemberWithFormat(
												dimensionMemberName, false,
												null);
								member.setName(dimensionMemberName);
								while (cursorRowsAxis.hasNextFieldValue()) {
									fieldValue = cursorRowsAxis
											.nextFieldValue();
									field = fieldValue.getField();
									value = fieldValue.getValue();
									member.createAndAddFieldWithValue(field,
											value);
									if (value !== null) {
										stringValue = value.toString();
										if (field.isDefaultTextField()) {
											member.setText(stringValue);
										} else {
											if (field.isEqualTo(dimension
													.getSelectorKeyField())) {
												member.setName(stringValue);
											}
										}
									}
								}
								rsTuple = sap.firefly.RsAxisTupleElement
										.create(null, member.getName(), member,
												0,
												tupleElement.getDrillState(),
												tupleElement.getDisplayLevel(),
												tupleElement.getChildCount());
								parentNodeIndex = tupleElement
										.getParentNodeIndex();
								if (parentNodeIndex !== -1) {
									rsTuple.setParentNode(nodes
											.get(parentNodeIndex));
								}
								nodes.add(rsTuple);
							}
						}
						profileTransform.endProfileStep();
						(extResult.getRootProfileNode())
								.addProfileNode(profileTransform);
						return sap.firefly.ExtResult.create(nodes, extResult);
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						var newExtResult = this.transform(extResult);
						var key = customIdentifier.toString();
						var realCallback;
						var realIdentifier;
						this.m_valuehelpResults.put(key, newExtResult);
						realCallback = this.m_valuehelpCallbacks.getByKey(key);
						if (realCallback !== null) {
							realIdentifier = this.m_valuehelpIdentifiers
									.getByKey(key);
							realCallback.onValuehelpExecuted(newExtResult,
									resultSetContainer, realIdentifier);
						}
					},
					getInaCapabilities : function() {
						return this.m_inaCapabilities;
					},
					useEncodedRs : function() {
						return this.m_useEncodedRs;
					},
					setUseEncodedRs : function(useEncodedRs) {
						this.m_useEncodedRs = useEncodedRs;
					},
					getProviderTypeProx : function() {
						return this.getProviderType();
					},
					getResultSetProviderFactory : function() {
						return this;
					},
					importVariables : function(variablesList, variableContext) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					exportVariables : function(variablesContext,
							parentStructure) {
						this.m_exportData.exportVariables(variablesContext,
								parentStructure);
					},
					setIsMetadataCached : function() {
						this.m_isMetadataCached = true;
					},
					isMetadataCached : function() {
						return this.m_isMetadataCached;
					},
					assertNotDirectValueTransfer : function() {
						if (this.isDirectVariableTransferEnabled()) {
							throw sap.firefly.XException
									.createIllegalStateException("stateful variable handling cannot be mixed with direct variable transfer");
						}
					},
					processRetrieveVariableRuntimeInformation : function(
							syncType, listener, customIdentifier) {
						this.assertNotDirectValueTransfer();
						return sap.firefly.InAQMgrVarAction
								.createAndRunGetRuntimeInfo(this, syncType,
										listener, customIdentifier);
					},
					processSetGetVariableValues : function(syncType, listener,
							customIdentifier) {
						this.assertNotDirectValueTransfer();
						return sap.firefly.InAQMgrVarAction
								.createAndRunSetGetValues(this, syncType,
										listener, customIdentifier);
					},
					processVariableSubmit : function(syncType, listener,
							customIdentifier) {
						this.assertNotDirectValueTransfer();
						return sap.firefly.InAQMgrVarAction.createAndRunSubmit(
								this, syncType, listener, customIdentifier);
					},
					processReInitVariableAfterSubmit : function(syncType,
							listener, customIdentifier) {
						this.assertNotDirectValueTransfer();
						return sap.firefly.InAQMgrVarAction
								.createAndRunReInitAfterSubmit(this, syncType,
										listener, customIdentifier);
					},
					processVariableCancel : function(syncType, listener,
							customIdentifier) {
						this.assertNotDirectValueTransfer();
						return sap.firefly.InAQMgrVarAction.createAndRunCancel(
								this, syncType, listener, customIdentifier);
					},
					processCheckVariables : function(syncType, listener,
							customIdentifier) {
						if (this.supportsCheckVariables() === false) {
							throw sap.firefly.XException
									.createRuntimeException("Check variables is not supported");
						}
						return sap.firefly.InAQMgrVarAction.createAndRunCheck(
								this, syncType, listener, customIdentifier);
					},
					transferVariables : function(syncType, listener,
							customIdentifier) {
						return this.processSetGetVariableValues(syncType,
								listener, customIdentifier);
					},
					transferVariablesByVariable : function(variable, syncType,
							listener, customIdentifier) {
						if (this.getVariables().contains(variable)) {
							return this.processSetGetVariableValues(syncType,
									listener, customIdentifier);
						}
						return null;
					},
					getVariablesExporter : function() {
						return this.m_exportData;
					},
					getVariablesImporter : function() {
						return this.m_importMetaData;
					},
					isVariableValuesRuntimeNeeded : function() {
						return (this.getSystemDescription().getSystemType()
								.isTypeOf(sap.firefly.SystemType.BW));
					},
					isVariableSubmitNeeded : function() {
						return this.m_isVariableSubmitNeeded;
					},
					setIsVariableSubmitNeeded : function(submit) {
						this.m_isVariableSubmitNeeded = submit;
					},
					setDirectVariableTransfer : function(directVariableTransfer) {
						this.m_directVariableTransfer = directVariableTransfer;
					},
					isDirectVariableTransfer : function() {
						return this.m_directVariableTransfer;
					},
					fillDataRequestStructure : function(withVariables) {
						var mode = this.getMode();
						var providerType;
						var context;
						var processingDirective;
						var initSettings;
						if ((mode === sap.firefly.QueryManagerMode.DEFAULT)
								|| (mode === sap.firefly.QueryManagerMode.BLENDING)) {
							this.m_lastDataRequest = sap.firefly.PrStructure
									.create();
							providerType = this.getProviderType();
							if (providerType === sap.firefly.ProviderType.PLANNING) {
								context = sap.firefly.InAConstants.VA_CONTEXT_PLANNING;
							} else {
								if (providerType === sap.firefly.ProviderType.LIST_REPORTING) {
									context = sap.firefly.InAConstants.VA_CONTEXT_LIST_REPORTING;
								} else {
									context = sap.firefly.InAConstants.VA_CONTEXT_ANALYTICS;
								}
							}
							processingDirective = null;
							if ((providerType !== sap.firefly.ProviderType.PLANNING)
									&& (this.getVariableProcessorState() === sap.firefly.VariableProcessorState.VALUE_HELP)) {
								processingDirective = sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION;
							}
							this.fillAnalyticRequestStructure(
									this.m_lastDataRequest, context,
									withVariables, processingDirective);
						} else {
							if (mode === sap.firefly.QueryManagerMode.RAW_QUERY) {
								initSettings = this.getInitSettings();
								this.m_lastDataRequest = initSettings
										.getDataRequest();
								if (this.m_lastDataRequest === null) {
									if (initSettings.getDefinitionType() === sap.firefly.QModelFormat.INA_DATA) {
										this.m_lastDataRequest = this
												.getInitSettings()
												.getDefinitionAsStructure();
									}
								}
							} else {
								throw sap.firefly.XException
										.createIllegalStateException("Unknown mode");
							}
						}
						return this.m_lastDataRequest;
					},
					fillAnalyticRequestStructure : function(requestStructure,
							requestName, withVariables, processingDirective) {
						var activeMainCapabilities;
						var hasDataSourceAtService;
						var query;
						var requestStructureName;
						var innerRequestStructure;
						var exportInAData;
						var inaDefinition;
						var inputEnabled;
						var planningExtensionStructure;
						var inaOptions;
						var inaContext;
						var inaProcessingDirective;
						var inaVariableVariant;
						this.addProfileStep("fillAnalyticRequestStructure");
						activeMainCapabilities = this.getMainCapabilities();
						hasDataSourceAtService = activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_DATASOURCE_AT_SERVICE);
						query = this.getQueryModelBase();
						requestStructureName = this.checkRequestStructureName(
								requestName, this.hasNewValues());
						innerRequestStructure = this.setInnerStructure(
								requestStructure, requestStructureName, null,
								!hasDataSourceAtService,
								sap.firefly.QModelFormat.INA_DATA);
						exportInAData = sap.firefly.QInAExportFactory
								.createForData(this.getApplication(),
										activeMainCapabilities);
						(exportInAData).m_isSubmit = sap.firefly.XString
								.isEqual(
										processingDirective,
										sap.firefly.InAConstants.VA_PROCESSING_STEP_SUBMIT);
						query
								.setHasProcessingStep(processingDirective !== null);
						inaDefinition = exportInAData.exportQueryModel(query,
								withVariables, !hasDataSourceAtService);
						inaDefinition.setStringByNameNotNull(
								sap.firefly.InAConstants.QY_NAME,
								this.m_preQueryName);
						innerRequestStructure.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								inaDefinition);
						if (this.supportsDataEntryReadOnly()) {
							inputEnabled = !this.isDataEntryReadOnly();
							inaDefinition.setBooleanByName(
									sap.firefly.InAConstants.QY_INPUT_ENABLED,
									inputEnabled);
						}
						planningExtensionStructure = sap.firefly.PrStructure
								.create();
						this.exportPlanningMode(planningExtensionStructure);
						this
								.exportPlanningVersionRestriction(planningExtensionStructure);
						this
								.exportPlanningVersionSettings(planningExtensionStructure);
						this
								.exportDataEntryDescription(planningExtensionStructure);
						this.exportNewValues(inaDefinition,
								planningExtensionStructure);
						if (planningExtensionStructure.hasElements()) {
							inaDefinition
									.setElementByName(
											sap.firefly.InAConstants.QY_PLANNING_EXTENSIONS,
											planningExtensionStructure);
						}
						this.addAllMessages((exportInAData));
						this.endProfileStep();
						inaOptions = this.exportOptions();
						inaDefinition.setElementByName(
								sap.firefly.InAConstants.QY_RS_FEATURE_REQUEST,
								inaOptions);
						if (processingDirective !== null) {
							inaContext = requestStructure
									.getStructureByName(requestStructureName);
							inaProcessingDirective = inaContext
									.setNewStructureByName(sap.firefly.InAConstants.QY_PROCESSING_DIRECTIVES);
							inaProcessingDirective
									.setStringByName(
											sap.firefly.InAConstants.QY_PROCESSING_STEP,
											processingDirective);
							if ((this.m_activeVariant !== null)
									&& sap.firefly.XString
											.isEqual(
													processingDirective,
													sap.firefly.InAConstants.VA_PROCESSING_STEP_DEFINITION)) {
								inaVariableVariant = inaDefinition
										.setNewStructureByName(sap.firefly.InAConstants.QY_VARIABLE_VARIANT);
								inaVariableVariant.setStringByName(
										sap.firefly.InAConstants.QY_NAME,
										this.m_activeVariant.getName());
								inaVariableVariant.setStringByName(
										sap.firefly.InAConstants.QY_TYPE,
										this.m_activeVariant
												.getVariableVariantType()
												.getName());
								inaVariableVariant.setStringByName(
										sap.firefly.InAConstants.QY_SCOPE,
										this.m_activeVariant.getScope()
												.getName());
							}
						}
						this.exportOptimizerHints(inaDefinition, query);
						this.exportReturnedDataSelections(inaOptions);
						return inaDefinition;
					},
					exportOptions : function() {
						var inaOptions = sap.firefly.PrStructure.create();
						var resultSetContainer;
						var dataRefreshEnabled;
						inaOptions
								.setBooleanByName(
										sap.firefly.InAConstants.QY_USE_DEFAULT_ATTRIBUTE_KEY,
										false);
						resultSetContainer = this.getActiveResultSetContainer();
						if (resultSetContainer.getMaxResultRecords() !== -1) {
							inaOptions
									.setLongByName(
											sap.firefly.InAConstants.QY_MAX_RESULT_RECORDS,
											resultSetContainer
													.getMaxResultRecords());
						}
						dataRefreshEnabled = resultSetContainer
								.getDataRefreshEnabled();
						if ((dataRefreshEnabled === sap.firefly.ActionChoice.ON)
								|| (dataRefreshEnabled === sap.firefly.ActionChoice.ONCE)) {
							inaOptions.setBooleanByName(
									sap.firefly.InAConstants.QY_REFRESH, true);
						}
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(resultSetContainer
										.getResultSetPersistanceTable())) {
							inaOptions
									.setStringByName(
											sap.firefly.InAConstants.QY_RS_RESULT_SET_PERSISTANCE_TABLE,
											resultSetContainer
													.getResultSetPersistanceTable());
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(resultSetContainer
											.getResultSetPersistanceSchema())) {
								inaOptions
										.setStringByName(
												sap.firefly.InAConstants.QY_RS_RESULT_SET_PERSISTANCE_SCHEMA,
												resultSetContainer
														.getResultSetPersistanceSchema());
							}
						}
						if (resultSetContainer.isResultSetTransportEnabled() === false) {
							inaOptions
									.setBooleanByName(
											sap.firefly.InAConstants.QY_RETURN_EMPTY_JSON_RESULTSET,
											true);
						}
						this.fillPaging(inaOptions);
						if (this.getExecuteRequestOnOldResultSet()) {
							inaOptions
									.setBooleanByName(
											sap.firefly.InAConstants.QY_EXECUTE_REQUEST_ON_OLD_RESULT_SET,
											true);
						}
						if (this.m_useEncodedRs) {
							if (resultSetContainer
									.isResultSetPersistanceEnabled()) {
								inaOptions
										.setStringByName(
												sap.firefly.InAConstants.QY_RESULT_FORMAT,
												sap.firefly.InAConstants.VA_RS_FORMAT_SERIALIZED_DATA);
								inaOptions
										.setStringByName(
												sap.firefly.InAConstants.QY_RS_RESULT_SET_PERSISTANCE_IDENTIFIER,
												resultSetContainer
														.getResultSetPersistanceIdentifier());
							} else {
								inaOptions
										.setStringByName(
												sap.firefly.InAConstants.QY_RESULT_FORMAT,
												sap.firefly.InAConstants.VA_RS_FORMAT_V2);
							}
							inaOptions
									.setStringByName(
											sap.firefly.InAConstants.QY_RESULT_ENCODING,
											sap.firefly.InAConstants.VA_RS_ENCODING_NONE);
						}
						if (this.getSystemDescription().getSystemType()
								.isTypeOf(sap.firefly.SystemType.BW)
								&& this.getQueryModel()
										.supportsKeepOriginalTexts()) {
							inaOptions
									.setBooleanByName(
											sap.firefly.InAConstants.QY_RESULT_KEEP_ORIGINAL_TEXTS,
											this.getQueryModel()
													.isKeepingOriginalTexts());
						}
						return inaOptions;
					},
					getPlanningModeEffective : function() {
						var currentSystemtype;
						var isHana;
						var planningMode;
						if (this.getApplication().getVersion() < sap.firefly.XVersion.V69_PLANNING_MODE) {
							return null;
						}
						if (this.isDataEntryEnabled() === false) {
							return null;
						}
						currentSystemtype = this.getSystemDescription()
								.getSystemType();
						isHana = (currentSystemtype
								.isTypeOf(sap.firefly.SystemType.HANA));
						if (isHana === false) {
							return null;
						}
						planningMode = this.getPlanningMode();
						if (planningMode === sap.firefly.PlanningMode.SERVER_DEFAULT) {
							return null;
						}
						return planningMode;
					},
					getPlanningVersionRestrictionEffective : function() {
						var currentSystemtype;
						var isHana;
						var settingsMode;
						var planningRestriction;
						if (this.isDataEntryEnabled() === false) {
							return sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT;
						}
						currentSystemtype = this.getSystemDescription()
								.getSystemType();
						isHana = (currentSystemtype
								.isTypeOf(sap.firefly.SystemType.HANA));
						if (isHana === false) {
							return sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT;
						}
						settingsMode = this.getPlanningVersionSettingsMode();
						if (settingsMode === sap.firefly.PlanningVersionSettingsMode.SERVER_DEFAULT) {
							return sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT;
						}
						planningRestriction = this.getPlanningRestriction();
						if (planningRestriction === null) {
							return sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT;
						}
						return planningRestriction;
					},
					getPlanningActionSequenceSettingsModeEffective : function() {
						var currentSystemtype;
						var isHana;
						var settingsMode;
						if (this.isDataEntryEnabled() === false) {
							return null;
						}
						currentSystemtype = this.getSystemDescription()
								.getSystemType();
						isHana = (currentSystemtype
								.isTypeOf(sap.firefly.SystemType.HANA));
						if (isHana === false) {
							return null;
						}
						settingsMode = this.getPlanningVersionSettingsMode();
						if (settingsMode === sap.firefly.PlanningVersionSettingsMode.SERVER_DEFAULT) {
							return null;
						}
						return settingsMode;
					},
					getAllPlanningActionSequenceSettingsEffective : function() {
						var settingsMode = this
								.getPlanningActionSequenceSettingsModeEffective();
						var allSettings;
						var planningService;
						var planningModel;
						var allVersions;
						var versionsSettings;
						var i;
						var version;
						var settingsMap;
						var j;
						var settings;
						var keys;
						var result;
						var k;
						var key;
						if (settingsMode === null) {
							return null;
						}
						allSettings = null;
						if (settingsMode === sap.firefly.PlanningVersionSettingsMode.PLANNING_SERVICE) {
							planningService = sap.firefly.PlanningModelUtil
									.getPlanningServiceFromQueryDataSource(this
											.getApplication(), this
											.getSystemName(), this
											.getDataSource());
							if (planningService !== null) {
								planningModel = planningService
										.getPlanningContext();
								allVersions = planningModel.getAllVersions();
								versionsSettings = null;
								if ((allVersions !== null)
										&& (allVersions.size() > 0)) {
									for (i = 0; i < allVersions.size(); i++) {
										version = allVersions.get(i);
										if (versionsSettings === null) {
											versionsSettings = sap.firefly.XList
													.create();
										}
										versionsSettings.add(version);
									}
								}
								allSettings = versionsSettings;
							}
						} else {
							if (settingsMode === sap.firefly.PlanningVersionSettingsMode.QUERY_SERVICE) {
								allSettings = this
										.getAllPlanningVersionSettings();
							}
						}
						if ((allSettings === null) || (allSettings.size() < 1)) {
							return null;
						}
						settingsMap = null;
						for (j = 0; j < allSettings.size(); j++) {
							settings = allSettings.get(j);
							if (settingsMap === null) {
								settingsMap = sap.firefly.XHashMapByString
										.create();
							}
							settingsMap.put(settings.getVersionUniqueName(),
									sap.firefly.PlanningVersionSettings.create(
											settings, settings
													.getActionSequenceId(),
											settings.getUseExternalView()));
						}
						if ((settingsMap === null) || (settingsMap.size() < 1)) {
							return null;
						}
						keys = sap.firefly.XListOfString
								.createFromReadOnlyList(settingsMap
										.getKeysAsReadOnlyListOfString());
						keys
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						result = sap.firefly.XList.create();
						for (k = 0; k < keys.size(); k++) {
							key = keys.get(k);
							result.add(settingsMap.getByKey(key));
						}
						return result;
					},
					fillPaging : function(inaOptions) {
						var resultSetContainer = this
								.getActiveResultSetContainer();
						var subSetDescription = inaOptions
								.setNewStructureByName(sap.firefly.InAConstants.QY_SUBSET_DESCRIPTION);
						var maxRows = resultSetContainer.getMaxRows();
						var offsetRows = resultSetContainer.getOffsetRows();
						var maxColumns;
						var offsetColumns;
						subSetDescription.setIntegerByName(
								sap.firefly.InAConstants.QY_ROW_FROM,
								offsetRows);
						if (maxRows === -1) {
							subSetDescription.setIntegerByName(
									sap.firefly.InAConstants.QY_ROW_TO, -1);
						} else {
							subSetDescription.setIntegerByName(
									sap.firefly.InAConstants.QY_ROW_TO,
									offsetRows + maxRows);
						}
						maxColumns = resultSetContainer.getMaxColumns();
						offsetColumns = resultSetContainer.getOffsetColumns();
						subSetDescription.setIntegerByName(
								sap.firefly.InAConstants.QY_COLUMN_FROM,
								offsetColumns);
						if (maxColumns === -1) {
							subSetDescription.setIntegerByName(
									sap.firefly.InAConstants.QY_COLUMN_TO, -1);
						} else {
							subSetDescription.setIntegerByName(
									sap.firefly.InAConstants.QY_COLUMN_TO,
									offsetColumns + maxColumns);
						}
					},
					exportReturnedDataSelections : function(inaOptions) {
						var inaReturnedDataSelection;
						var itActive;
						var itInactive;
						if (this.supportsReturnedDataSelection() === false) {
							return;
						}
						inaReturnedDataSelection = inaOptions
								.setNewStructureByName(sap.firefly.InAConstants.QY_RETURNED_DATA_SELECTION);
						itActive = this.getAllEnabledReturnedDataSelections()
								.getIterator();
						while (itActive.hasNext()) {
							inaReturnedDataSelection.setBooleanByName(itActive
									.next(), true);
						}
						itActive.releaseObject();
						itInactive = this
								.getAllDisabledReturnedDataSelections()
								.getIterator();
						while (itInactive.hasNext()) {
							inaReturnedDataSelection.setBooleanByName(
									itInactive.next(), false);
						}
						itInactive.releaseObject();
					},
					exportOptimizerHints : function(inaDefinition, queryModel) {
						var inaOptimizerHints;
						if (queryModel.supportsCeScenarioParams() === false) {
							return;
						}
						inaOptimizerHints = sap.firefly.PrStructure.create();
						this.exportOptimizerHintsByEngine(inaOptimizerHints,
								queryModel,
								sap.firefly.ExecutionEngine.CALC_ENGINE);
						this.exportOptimizerHintsByEngine(inaOptimizerHints,
								queryModel, sap.firefly.ExecutionEngine.MDS);
						this.exportOptimizerHintsByEngine(inaOptimizerHints,
								queryModel, sap.firefly.ExecutionEngine.SQL);
						if (inaOptimizerHints.hasElements()) {
							inaDefinition.setElementByName(
									sap.firefly.InAConstants.QY_HINTS,
									inaOptimizerHints);
						}
					},
					exportOptimizerHintsByEngine : function(inaOptimizerHints,
							queryModel, engine) {
						var optimizerHints = queryModel
								.getOptimizerHintsByExecutionEngine(engine);
						var inaAEngineHints;
						var iterator;
						var hintName;
						var inaHint;
						if ((optimizerHints === null)
								|| optimizerHints.isEmpty()) {
							return;
						}
						inaAEngineHints = inaOptimizerHints
								.setNewListByName(engine.getName());
						iterator = optimizerHints.getKeysAsIteratorOfString();
						while (iterator.hasNext()) {
							hintName = iterator.next();
							inaHint = inaAEngineHints.addNewStructure();
							inaHint.setStringByName(
									sap.firefly.InAConstants.QY_KEY, hintName);
							inaHint.setStringByName(
									sap.firefly.InAConstants.QY_VALUE,
									optimizerHints.getByKey(hintName));
						}
					},
					checkRequestStructureName : function(requestName, newValues) {
						var systemDescription;
						var systemType;
						if (sap.firefly.XString.isEqual(
								sap.firefly.InAConstants.QY_ANALYTICS,
								requestName) === false) {
							return requestName;
						}
						systemDescription = this.getSystemDescription();
						if (systemDescription === null) {
							return requestName;
						}
						systemType = systemDescription.getSystemType();
						if (systemType === null) {
							return requestName;
						}
						if (systemType.isTypeOf(sap.firefly.SystemType.BW) === false) {
							return requestName;
						}
						if (newValues) {
							return sap.firefly.InAConstants.QY_PLANNING;
						}
						return requestName;
					},
					getVariableMode : function() {
						if (this.isDirectVariableTransfer()) {
							return sap.firefly.VariableMode.DIRECT_VALUE_TRANSFER;
						}
						return sap.firefly.VariableMode.SUBMIT_AND_REINIT;
					},
					getMainCapabilities : function() {
						return this.m_inaCapabilities
								.getActiveMainCapabilities();
					},
					hasMoreColumnRecordsAvailable : function() {
						return this.getActiveResultSetContainer()
								.hasMoreColumnRecordsAvailable();
					},
					hasMoreRowRecordsAvailable : function() {
						return this.getActiveResultSetContainer()
								.hasMoreRowRecordsAvailable();
					},
					getRriTargetManager : function() {
						if ((this.m_rriTargetManager === null)
								&& this
										.getMainCapabilities()
										.containsKey(
												sap.firefly.InACapabilities.AV_CAPABILITY_REPORT_REPORT_INTERFACE)) {
							this.m_rriTargetManager = sap.firefly.QRriTargetManager
									.create(this);
						}
						return this.m_rriTargetManager;
					},
					getInputEnabledVariable : function(name) {
						return this.getVariableContainer()
								.getInputEnabledVariable(name);
					},
					getHierarchyNodeVariable : function(name) {
						return this.getVariableContainer()
								.getHierarchyNodeVariable(name);
					},
					getHierarchyNameVariable : function(name) {
						return this.getVariableContainer()
								.getHierarchyNameVariable(name);
					},
					setStateBeforeVarScreen : function(
							savedStateBeforeVarScreen) {
						this.m_savedStateBeforeVarScreen = savedStateBeforeVarScreen;
					},
					getStateBeforeVarScreen : function() {
						return this.m_savedStateBeforeVarScreen;
					},
					applyValueHelpCapabilities : function() {
						var activeMainCapabilities;
						var importer;
						var queryModelBase;
						if (this.m_inaCapabilitiesValueHelp !== null) {
							this.m_inaCapabilities = this.m_inaCapabilitiesValueHelp;
							this.m_inaCapabilitiesValueHelp = null;
							activeMainCapabilities = this.m_inaCapabilities
									.getActiveMainCapabilities();
							importer = sap.firefly.QInAImportFactory
									.createForMetadataCore(this
											.getApplication(),
											activeMainCapabilities);
							queryModelBase = this.getQueryModelBase();
							importer
									.importBasicQueryModelCapabilities(queryModelBase);
						}
					},
					getDataRequest : function() {
						if ((this.m_lastDataRequest === null)
								&& (this.getMode() !== sap.firefly.QueryManagerMode.RAW_QUERY)) {
							this.fillDataRequestStructure(true);
						}
						return this.m_lastDataRequest;
					},
					getDataRequestAsString : function() {
						var dataRequest = this.getDataRequest();
						if (dataRequest === null) {
							return null;
						}
						return dataRequest.toString();
					},
					getCapabilitiesBase : function() {
						var mainCapabilities;
						if (this.m_capabilities === null) {
							this.m_capabilities = sap.firefly.QCapabilities
									.create();
							this.m_capabilities.setSystemType(this
									.getSystemDescription().getSystemType());
							mainCapabilities = this.getMainCapabilities();
							sap.firefly.QInAMdCapabilities.importCapabilities(
									mainCapabilities, this.m_capabilities);
						}
						return this.m_capabilities;
					},
					getMetadataResponseRaw : function() {
						return this.m_metadataResponseRaw;
					},
					setMetadataResponseRaw : function(metadataResponse) {
						this.m_metadataResponseRaw = metadataResponse;
					},
					getVariableVariants : function() {
						if (this.m_availableVariants === null) {
							return null;
						}
						return this.m_availableVariants
								.getValuesAsReadOnlyList();
					},
					processActivateVariableVariant : function(variableVariant,
							syncType, listener, customIdentifier) {
						this.m_activeVariant = variableVariant;
						return sap.firefly.InAQMgrVarAction
								.createAndRunDefinition(this, syncType,
										listener, customIdentifier);
					},
					addVariableVariant : function(variant) {
						if (this.m_availableVariants === null) {
							this.m_availableVariants = sap.firefly.XLinkedHashMapByString
									.create();
						}
						this.m_availableVariants
								.put(variant.getName(), variant);
					},
					getVariableVariantByName : function(variableVariantName) {
						return this.m_availableVariants
								.getByKey(variableVariantName);
					},
					setPreQueryName : function(preQueryName) {
						this.m_preQueryName = preQueryName;
					},
					getPreQueryName : function() {
						return this.m_preQueryName;
					},
					activateVariableVariant : function(variableVariant,
							syncType, listener, customIdentifier) {
						return this.processActivateVariableVariant(
								variableVariant, syncType, listener,
								customIdentifier);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ProviderModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						getInstance : function() {
							return sap.firefly.ProviderModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var registrationService;
							if (sap.firefly.ProviderModule.s_module === null) {
								if (sap.firefly.OlapImplModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.ProviderModule.s_module = new sap.firefly.ProviderModule();
								registrationService = sap.firefly.RegistrationService
										.getInstance();
								sap.firefly.InAQMgrCapabilities.staticSetup();
								sap.firefly.InAPlanningCapabilitiesProviderFactory
										.staticSetup();
								sap.firefly.PlanningVariableProcessorProviderFactory
										.staticSetup();
								sap.firefly.InAService.staticSetup();
								sap.firefly.InAQueryManagerProvider
										.staticSetupProvider();
								registrationService
										.addService(
												sap.firefly.OlapApiModule.XS_QUERY_CONSUMER,
												sap.firefly.InAQueryManagerProvider.CLAZZ);
							}
							return sap.firefly.ProviderModule.s_module;
						}
					}
				});
sap.firefly.ProviderModule.getInstance();